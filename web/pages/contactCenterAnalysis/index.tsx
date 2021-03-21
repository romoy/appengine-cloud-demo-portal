import {
  createStyles,
  Grid,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { useState, useEffect } from "react";

import Head from "next/head";
import ProductChips from "../../components/ProductChips";
import { useTranslation } from "../../hooks/useTranslation";
import { demos } from "../../src/demos";
import Recorder, { Language } from "../../components/Recorder";
import {
  analyze,
  Response,
  getLanguages,
} from "../../src/api/contactCenterAnalysis";
import NaturalLanguageAnnotatedResult from "../../components/NaturalLanguageAnnotatedResult";
import ErrorMessage from "../../components/ErrorMessage";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingTop: theme.spacing(5),
      paddingBottom: theme.spacing(5),
      paddingLeft: theme.spacing(5),
      paddingRight: theme.spacing(5),
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      marginBottom: theme.spacing(2),
    },
    description: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(4),
    },
    responses: {
      marginTop: theme.spacing(4),
      width: 800,
    },
  })
);

const demo = demos["contactCenterAnalysis"];

const ContactCenterAnalysis: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [responses, setResponses] = useState<Response[]>([]);
  const [error, setError] = useState({ open: false, msg: "" });
  const [languages, setLanguages] = useState<{
    languages: Language[];
    default: string;
  }>({ languages: [], default: "" });

  const onCloseError = () => setError({ open: false, msg: "" });

  const addResult = (response: Response) =>
    setResponses((responses) => [response, ...responses]);

  useEffect(() => {
    const f = async () => {
      try {
        const res = await getLanguages();
        setLanguages({
          languages: res.languages,
          default: res.languages[0].code,
        });
      } catch (e) {
        console.error(e);
        if (e instanceof Error) {
          setError({ open: true, msg: e.message });
        } else {
          setError({ open: true, msg: "something went wrong." });
        }
      }
    };
    void f();
  }, []);

  const onStop = async (lang: string, blob: Blob): Promise<void> => {
    try {
      const res = await analyze(lang, blob);
      addResult(res);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError({ open: true, msg: e.message });
      } else {
        setError({ open: true, msg: "something went wrong." });
      }
    }
  };

  return (
    <main className={classes.root}>
      <Head>
        <title>
          {t.contactCenterAnalysis.title} | {t.title}
        </title>
      </Head>
      <Typography variant="h3" component="h2" className={classes.title}>
        {t.contactCenterAnalysis.title}
      </Typography>
      <ProductChips productIds={demo.products} />
      <Typography
        variant="subtitle1"
        component="p"
        className={classes.description}
      >
        {t.contactCenterAnalysis.description}
      </Typography>
      <Recorder
        onStop={onStop}
        languages={languages.languages}
        defaultLanguage={languages.default}
      />
      <Grid
        container
        direction="column"
        spacing={2}
        className={classes.responses}
      >
        {responses.map((res, i) => (
          <Grid item xs={12} key={i}>
            <NaturalLanguageAnnotatedResult result={res} />
          </Grid>
        ))}
      </Grid>
      <div className={classes.responses}></div>
      <ErrorMessage
        open={error.open}
        onClose={onCloseError}
        message={error.msg}
      />
    </main>
  );
};

export default ContactCenterAnalysis;
