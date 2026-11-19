# smapproyek/fasttext-id-region-lang-detection

## Resumen

`fasttext-id-region-lang-detection` es un clasificador de identificacion de idioma basado en fastText, desarrollado por el usuario de Hugging Face smapproyek. Su funcion es discriminar entre ingles, indonesio y diez lenguas regionales de Indonesia (acehnes, balines, banjar, bugis, javanes, madures, minangkabau, ngaju, sundanés y batak toba), una tarea relevante para pipelines de procesamiento de lenguaje natural en el contexto linguistico indonesio, donde coexisten mas de 700 lenguas y los sistemas genericos de deteccion de idioma suelen confundirlas o ignorarlas.

El modelo se entrena sobre el split oficial de entrenamiento de NusaX-MT (500 frases por idioma, 12 idiomas) y emplea la convencion de etiquetas `__label__<iso639-3>_
