# JheisonM/tweet-sentiment-tfidf-logreg

## Resumen

`JheisonM/tweet-sentiment-tfidf-logreg` es un clasificador de sentimiento en cuatro clases (Positive, Negative, Neutral, Irrelevant) para tweets en inglés, publicado por el usuario JheisonM en HuggingFace. No es un modelo neuronal: es un pipeline de scikit-learn compuesto por un `TfidfVectorizer` de unigramas y bigramas de palabras seguido de una `LogisticRegression` con `class_weight="balanced"`. Devuelve tanto la etiqueta predicha como la probabilidad de cada una de las cuatro clases.

Su relevancia es la de una línea base clásica, barata y reproducible frente a los enfoques transformer: se entrena y se sirve en CPU, ocupa 0,1 GB de repositorio y se serializa en formato skops. Está pensado para el dataset Twitter Entity Sentiment Analysis, con 69.354 filas de entrenamiento tras limpieza y un dominio acotado (32 entidades, mayoritariamente videojuegos, año 2020).

La propia model card es explícita sobre sus límites: la clase Irrelevant obtiene un F1 de 0,42 porque exige saber de qué habla el tweet y no solo qué palabras contiene, y el F1 de 0,955 que se obtiene con un split aleatorio está inflado por las seis paráfrasis por tweet que incluye el dataset original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `TfidfVectorizer` (unigramas y bigramas de palabras) + `LogisticRegression` |
| Parámetros totales | No disponible (modelo lineal; el número de coeficientes equivale al número de features del vocabulario multiplicado por 4 clases) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (no hay atención ni ventana; la entrada se convierte en una representación dispersa de n-gramas) |
| Tipos de cuantización | No aplica (no es una red neuronal; los coeficientes son `float64` según `tfidf__dtype`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | skops (`skops.io`), serialización de pipeline de scikit-learn |
| Librería | scikit-learn (`library_name: sklearn`) |
| Pipeline declarado | `text-classification` |
| Clases | 4: Positive, Negative, Neutral, Irrelevant |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-13 |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal sobre representación dispersa. El vectorizador usa `analyzer="word"`, `ngram_range=(1, 2)`, `min_df=2`, `lowercase=True`, `sublinear_tf=True`, `norm="l2"`, `smooth_idf=True`, `binary=False` y `token_pattern="(?u)\b\w\w+\b"` (descarta tokens de un solo carácter). Sobre esa matriz se ajusta una `LogisticRegression` con `class_weight="balanced"` y `max_iter=3000`, lo que compensa el desbalance entre clases. No hay `stop_words`, ni preprocesador, ni tokenizador personalizado.

El entrenamiento parte del dataset Twitter Entity Sentiment Analysis de Kaggle. Se conservaron 69.354 filas del train original tras eliminar 686 sin texto, los textos con etiqueta contradictoria y los duplicados exactos. La partición se hizo 80/20 agrupando por id de tweet (`GroupShuffleSplit`) para evitar que paráfrasis del mismo tweet cayeran a la vez en train y test, y la selección de modelo se realizó con `GroupKFold` de 5 pliegues comparando MultinomialNB, LogisticRegression y LinearSVC sobre unigramas, bigramas y n-gramas de caracteres. El modelo publicado se reentrenó con el 100 % de los datos. No se emplearon RLHF, DPO ni ningún otro ajuste posterior.

## Capacidades

- Clasificación de sentimiento en cuatro clases (Positive, Negative, Neutral, Irrelevant) para texto corto en inglés.
- Salida probabilística: devuelve la probabilidad de cada clase, no solo la etiqueta ganadora.
- Clasificación por lotes de grandes volúmenes de texto en CPU, sin necesidad de acelerador.
- Funciona como línea base reproducible frente a modelos neuronales en experimentos de clasificación de opiniones.
- Serialización portable mediante skops, apta para integrarse en pipelines de scikit-learn.
- Soporte de tool calling: no.
- Soporte de agentes o razonamiento multi-paso: no.
- Capacidades multilingües: no, únicamente inglés.
- Capacidades especiales (modo thinking, visión, audio, generación de texto): no.

## Casos de uso

- Monitorización de marca en redes sociales: clasificar en tiempo casi real el flujo de menciones en inglés y separar las negativas de las neutras e irrelevantes, aprovechando que el modelo es lineal y se ejecuta en CPU a bajo coste.
- Triaje previo de tickets y menciones de soporte: usar la clase Negative como señal para enrutar conversaciones a un equipo humano y descartar con la clase Irrelevant el ruido que no requiere respuesta.
- Filtrado de ruido en datasets de opinión: eliminar automáticamente los tweets que no hablan de la entidad analizada antes de pasarlos a un anotador humano o a un modelo mayor, aceptando que esta es precisamente la clase con peor rendimiento (F1 0,42).
- Enriquecimiento de corpus para investigación: etiquetar grandes volúmenes de tweets de 2020 sobre las 32 entidades del dataset y usar esas etiquetas como preanotación en estudios de opinión o como datos de destilación.
- Línea base en experimentos de NLP: comparar el coste y el rendimiento de un enfoque TF-IDF + regresión logística frente a transformers antes de decidir si merece la pena el coste computacional de un modelo neuronal.
- Clasificación por lotes en pipelines de datos: integrar el pipeline serializado en skops dentro de un job de procesamiento (por ejemplo, con pandas o Spark) para etiquetar históricos de tweets sin depender de GPU.
- Análisis de campañas y comparación temporal de sentimiento: agregar las probabilidades por clase a lo largo del tiempo para una entidad concreta y detectar cambios de tendencia, siempre dentro del dominio y el idioma del modelo.
- Servicio ligero de clasificación: exponer el pipeline detrás de una API HTTP (FastAPI, Flask) para dar un endpoint de sentimiento de bajo consumo de memoria.

## Benchmarks y rendimiento

La model card no publica una tabla de benchmarks completa. Los únicos datos disponibles son los siguientes:

| Métrica | Valor | Condiciones indicadas por el autor |
|---|---|---|
| F1 global | 0,955 | Con split aleatorio; el autor advierte que está inflado porque el dataset contiene seis paráfrasis por tweet |
| F1 (clase Irrelevant) | 0,42 | Sobre tweets cuyo id no aparece en entrenamiento; el autor señala que la clase requiere comprender el tema del tweet |
| Comparación interna | MultinomialNB, LogisticRegression y LinearSVC evaluados con GroupKFold de 5 pliegues sobre unigramas, bigramas y caracteres | Solo se indica que se compararon; no se publican los valores individuales |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no son aplicables a un clasificador lineal de este tipo. Tampoco hay datos publicados de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. No requiere GPU.
- GPU recomendadas: ninguna; el modelo es un pipeline lineal de scikit-learn y se ejecuta en CPU.
- ¿Cabe en GPU de consumo? No aplica. Cabe en cualquier máquina con Python y memoria RAM suficiente para cargar el pipeline y la matriz dispersa.
- Memoria: el repositorio ocupa 0,1 GB, lo que da una cota superior del espacio en disco necesario para el vectorizador y los coeficientes. No se especifica el número de features del vocabulario ni el consumo de RAM en inferencia.
- Opciones de despliegue: scikit-learn en Python con `skops.io` para cargar el pipeline; se puede envolver en FastAPI, Flask o BentoML. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, que son específicos de modelos neuronales.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

Solo se dispone de información sobre los modelos comparados internamente durante la selección del autor. No se han proporcionado especificaciones de alternativas externas.

| Modelo | Enfoque | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tweet-sentiment-tfidf-logreg | TF-IDF (1,2) + LogisticRegression | No disponible (lineal; coeficientes = features × 4 clases) | No aplica | F1 0,955 con split aleatorio; F1 0,42 en Irrelevant | MIT | HuggingFace (0 descargas, 0 likes) |
| TF-IDF + MultinomialNB | Bolsa de palabras + Naive Bayes | No disponible | No aplica | No publicado (solo se indica que se comparó en la selección) | No disponible | No publicado |
| TF-IDF + LinearSVC | Bolsa de palabras + SVM lineal | No disponible | No aplica | No publicado (solo se indica que se comparó en la selección) | No disponible | No publicado |
| Clasificadores transformer de sentimiento en Twitter | Transformer preentrenado | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada |

## Limitaciones y advertencias

- La clase Irrelevant alcanza un F1 de 0,42: el modelo no puede determinar de qué habla el tweet, solo qué palabras contiene. Es un fallo estructural del enfoque de bolsa de palabras, no un problema de ajuste.
- El F1 de 0,955 con split aleatorio es engañoso: el dataset original contiene seis paráfrasis de cada tweet, de modo que un split no agrupado filtra información entre train y test. Cualquier evaluación debe agrupar por id de tweet.
- El modelo no recibe la entidad como entrada, por lo que el mismo texto obtiene la misma predicción independientemente del sujeto al que se refiera.
- Dominio muy acotado: 32 entidades, mayoritariamente videojuegos, y tweets de 2020. El vocabulario y la jerga han cambiado desde entonces y no hay garantía de generalización fuera de ese conjunto.
- Idioma único: inglés. No hay soporte para castellano ni para texto multilingüe.
- Sin contexto: al ser una bolsa de palabras con n-gramas de hasta dos tokens, no captura negación de largo alcance, ironía ni sarcasmo.
- El `token_pattern` configurado (`(?u)\b\w\w+\b`) implica que los tokens de un solo carácter y los emojis quedan fuera de la representación, una pérdida relevante en texto de redes sociales.
- El desbalance se compensa con `class_weight="balanced"`, lo que puede aumentar los falsos positivos en las clases minoritarias; conviene ajustar el umbral de decisión según el caso de uso.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí de sobreconfianza; las probabilidades de una regresión logística no están calibradas por defecto para este pipeline.
- Sesgos: hereda los sesgos del dataset de Kaggle, tanto temáticos (predominio de videojuegos) como de anotación (los tweets con etiqueta contradictoria se eliminaron en lugar de resolverse, lo que puede sesgar la frontera de decisión).
- Licencia MIT: permite uso comercial, modificación y redistribución citando la licencia. No hay restricciones adicionales declaradas por el autor.
- Estado del repositorio: 0 descargas y 0 likes. No hay evidencia de uso en producción ni de validación externa, y no se han publicado tests, informes de calibración ni evaluación fuera del dataset original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JheisonM/tweet-sentiment-tfidf-logreg
- Dataset de entrenamiento: https://www.kaggle.com/datasets/jp797498e/twitter-entity-sentiment-analysis
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes para este modelo (los resultados obtenidos tratan sobre foros de Leboncoin y guías turísticas de España).
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales asociados al modelo.
