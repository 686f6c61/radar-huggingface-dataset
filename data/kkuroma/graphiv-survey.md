# kkuroma/GraphIV-survey

## Resumen

GraphIV-survey, tambien conocido como GraphIV's Survey Labeler, es un clasificador de texto basado en DistilBERT afinado por el desarrollador kkuroma para detectar articulos cientificos que constituyen revisiones de literatura (surveys) dentro de un corpus de arXiv. El modelo resuelve un problema concreto de recuperacion de informacion cientifica: los filtros por palabras clave en el titulo fallan masivamente, ya que segun la model card el 81% de las revisiones no contienen terminos como "survey" o "review" en el titulo. Leyendo titulo y abstract, el clasificador alcanza un recall del 87,6% con una precision del 78,3% sobre el corpus GraphIV de 3,22 millones de articulos.

Tecnicamente es un modelo transformer encoder de tipo DistilBERT (destilacion de BERT-base) con una cabeza de clasificacion binaria de secuencias, entrenado mediante destilacion de conocimiento a partir de las etiquetas generadas por Gemma 4 26B. El modelo tiene 66.955.010 parametros, procesa entradas de hasta 256 tokens y devuelve una probabilidad de que el articulo sea una revision. Su relevancia radica en que demuestra un pipeline de etiquetado debil con LLM seguido de destilacion en un modelo pequeno y desplegable, aplicado a un problema de scientometrics a gran escala.

El modelo se publica bajo licencia Apache 2.0, solo soporta ingles y esta pensado exclusivamente para clasificacion de titulo y abstract de articulos academicos, no para generacion de texto ni tareas generales de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT-base) con cabeza de clasificacion de secuencias |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens de entrada (titulo + linea en blanco + abstract, truncado) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion estandar via transformers/optimum, no documentada por el autor) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-classification |
| Dataset de entrenamiento | kkuroma/GraphIV (etiquetas generadas por Gemma 4 26B) |
| Descargas | 15 |
| Likes | 1 |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un encoder transformer de 6 capas obtenido por destilacion de BERT-base, al que se anade una cabeza de clasificacion binaria. La entrada es el titulo del articulo, una linea en blanco y el abstract, truncado a 256 tokens. La salida es una distribucion softmax de dos clases; la probabilidad de la clase 1 corresponde a la probabilidad de que el articulo sea una revision de literatura, y el umbral de decision documentado es 0,5.

El entrenamiento sigue un esquema de destilacion profesor-alumno. Primero se construyeron dos conjuntos equilibrados a partir de un snapshot de arXiv: 12.002 articulos cuyo titulo contiene una de 11 expresiones de revision (survey, review, overview, tutorial, taxonom, state of the art, systematic, advances in, progress in, perspectives on, landscape) y 11.998 articulos sin ninguna de ellas, de una poblacion total de 3.040.715. Gemma 4 26B etiqueto cada articulo con una unica pregunta ("Is this paper a literature review of a research area?") en formato JSON booleano, temperatura 0 y sin razonamiento, con el abstract cortado a 2.500 caracteres. El profesor marco como revision el 40,9% de la pila con palabra clave y solo el 3,1% de la pila sin ella. Como control, Qwen 3.6 35B y GLM 4.7 Flash reetiquetaron 400 articulos: los tres modelos respondieron 376 y coincidieron en el 92%, con Gemma discrepando de la mayoria de tres en el 2,1%.

Las 24.000 etiquetas se dividieron en 19.200 de entrenamiento y 4.800 reservados, con particion fija. El alumno se entreno con entropia cruzada, pesos de clase de 2,89 para las revisiones (compensando el desbalance), 2 epocas, batch de 16, AdamW con weight decay 0,012, learning rate 4,0e-5 con warmup lineal sobre el 14,5% de los pasos y decaimiento lineal posterior, dropout de 0,15 en el clasificador y semilla 0. Los hiperparametros provienen de una busqueda con Optuna. El autor indica que probo cuatro prompts mas largos sobre 90 articulos con titulos enganosos y que ninguna instruccion adicional mejoro la precision, por lo que mantuvo el prompt de una sola pregunta.

## Capacidades

- Clasificacion binaria de articulos cientificos como revision de literatura o no revision, a partir de titulo y abstract.
- Deteccion de revisiones que no contienen palabras clave de revision en el titulo (caso principal que motivа el modelo).
- Salida de probabilidad calibrada implicitamente, que permite ajustar el umbral (bajar de 0,5 para mas recall, subirlo para mas precision).
- Procesamiento por lotes de entradas de hasta 256 tokens, adecuado para clasificar corpus de millones de articulos.
- Inferencia rapida y ligera al ser un DistilBERT de 67 millones de parametros.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada al ingles; no se documenta rendimiento en otros idiomas.
- No dispone de modo thinking ni de capacidades especiales mas alla de la clasificacion.

## Casos de uso

- Construccion de un repositorio curado de surveys por area: clasificar un corpus de preprints (por ejemplo, un volcado de arXiv) con el modelo y filtrar por probabilidad mayor que 0,5 para obtener una lista de revisiones de cada campo, que despues se puede indexar o recomendar.
- Enriquecimiento de bases de datos bibliograficas: anadir una columna `survey_probability` a un catalogo interno de articulos para que los buscadores academicos permitan filtrar por tipo de publicacion sin depender de metadatos editoriales incompletos.
- Revision sistematica asistida: dado un conjunto de resultados de busqueda de una revision sistematica, usar el modelo para separar articulos de revision de articulos primarios antes de la seleccion manual, reduciendo el trabajo de cribado.
- Monitorizacion de literatura para equipos de investigacion: ejecutar el clasificador periodicamente sobre los nuevos preprints de un area y avisar cuando aparezca una revision que resuma el estado del arte, con un umbral bajo (por ejemplo 0,3) para maximizar recall.
- Analisis scientometrico: medir la proporcion de revisiones por disciplina, ano o venue a partir de un corpus grande, aprovechando que el modelo ya se aplico a los 3,22 millones de articulos de GraphIV y que su inferencia es barata en CPU o GPU consumer.
- Prefiltrado en pipelines de RAG cientifico: etiquetar documentos antes de la indexacion para que un sistema de recuperacion pueda priorizar o excluir surveys segun la necesidad del usuario (por ejemplo, excluirlos cuando se buscan contribuciones originales).
- Etiquetado debil para entrenar otros modelos: reutilizar las probabilidades como pseudoetiquetas en dominios cercanos, dado el bajo coste computacional del alumno frente al profesor LLM.

## Benchmarks y rendimiento

Los resultados publicados en la model card se evaluan sobre 4.799 articulos reservados, contra las etiquetas del profesor (Gemma 4 26B):

| Metrica (conjunto reservado) | Valor |
|---|---|
| Average precision, tal cual se muestreo (dos pilas iguales) | 0,989 |
| Average precision, reponderado al corpus | 0,920 |
| Average precision, remuestreado a 100 no revisiones por revision (1.000 iteraciones) | 0,877 ± 0,039 |

Comparacion con filtros existentes, reponderada de la misma forma:

| Filtro | Recall | Precision |
|---|---|---|
| Survey labeler (umbral 0,5) | 0,876 | 0,783 |
| Filtro por palabras clave en el titulo | no disponible en el extracto | no disponible en el extracto |

El autor indica que el filtro por palabras de revision en el titulo encuentra menos de una revision de cada cinco (el 81% de las revisiones no llevan esas palabras en el titulo), y que el labeler encuentra el 88% con una precision del 78%. No se han publicado en la informacion disponible resultados de benchmarks estandar de NLP (MMLU, GLUE, etc.) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo de pesos (66,9 M de parametros), mas activaciones y overhead del runtime; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- En fp16 el modelo ocupa alrededor de 0,13 GB de pesos; la cuantizacion a int8 reduciria aun mas el footprint, aunque el autor no documenta variantes cuantizadas.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes se recomienda una RTX 3090, RTX 4090, A100 o H100 por throughput, pero el modelo es viable en GPUs de gama baja e incluso en CPU.
- Cabe en cualquier GPU consumer (GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4060, etc.) y en entornos sin GPU.
- Opciones de despliegue: transformers (PyTorch) de forma nativa, Text Embeddings Inference (el repo esta marcado como `text-embeddings-inference` y `endpoints_compatible`), y exportacion a ONNX o cuantizacion via optimum para servir con mayor eficiencia. No se documenta soporte especifico de vLLM, llama.cpp u Ollama (son runtimes orientados a modelos generativos, no a clasificadores encoder).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo se espera un throughput alto en GPU (miles de documentos por segundo en lote), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GraphIV-survey | 66,9 M | 256 tokens | Clasificacion de surveys (binaria) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased (base) | 66,9 M | 512 tokens | Modelo base generalista, sin cabeza de clasificacion de surveys | Apache 2.0 | Hugging Face |
| Gemma 4 26B (profesor) | no disponible en la informacion | no disponible en la informacion | Etiquetado zero-shot con prompt | no disponible en la informacion | no disponible en la informacion |
| Filtro por palabras clave en el titulo | no aplica | no aplica | Heuristico de recuperacion de surveys | no aplica | no aplica |

La comparativa con otros clasificadores especificos de surveys no esta disponible en la informacion proporcionada. Frente al filtro heuristico por palabras clave, el modelo mejora el recall de forma sustancial (0,876 frente a una cobertura inferior a una de cada cinco revisiones segun el autor). Frente al profesor Gemma 4 26B, el alumno ofrece un coste de inferencia mucho menor a cambio de una perdida de fidelidad respecto a las etiquetas del profesor (average precision reponderada de 0,920).

## Limitaciones y advertencias

- El modelo solo clasifica articulos en ingles; no se ha evaluado su comportamiento en otros idiomas.
- La entrada se trunca a 256 tokens, por lo que abstracts largos pierden informacion; el profesor, en cambio, uso hasta 2.500 caracteres de abstract.
- Las etiquetas de entrenamiento provienen de un unico LLM profesor (Gemma 4 26B) y el modelo aprende sus sesgos y errores; el control con Qwen 3.6 35B y GLM 4.7 Flash mostro un 92% de acuerdo entre modelos, pero no una verdad de referencia humana.
- El conjunto de entrenamiento se construyo con un muestreo estratificado por presencia de palabras clave en el titulo, con pesos de reponderacion; el rendimiento en dominios distintos de arXiv (por ejemplo, revistas biomedicas o conferencias de ingeneria) no esta documentado.
- Riesgo de falsos positivos en articulos con abstracts que describen el estado del arte sin ser revisiones formales, y de falsos negativos en revisiones con titulos y abstracts atipicos.
- El umbral de 0,5 es el documentado, pero la precision del 78,3% implica que aproximadamente una de cada cinco detecciones es incorrecta; para uso en produccion conviene calibrar el umbral sobre datos propios.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base DistilBERT tambien es Apache 2.0; no se identifican restricciones adicionales en la informacion disponible.
- No es un modelo generativo: no debe usarse para resumir, responder preguntas ni tareas de razonamiento; su unico proposito es la clasificacion binaria descrita.
- El modelo tiene muy poca adopcion (15 descargas, 1 like) y no ha pasado por una validacion independiente mas alla de la publicada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkuroma/GraphIV-survey
- Dataset GraphIV: https://huggingface.co/datasets/kkuroma/GraphIV
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Script de etiquetado (stage4_label_survey.py): https://git.kuroma.dev/kkuroma/graphiv/src/branch/main/scripts/papers_preprocess/stage4_label_survey.py
- Repositorio del proyecto GraphIV: https://git.kuroma.dev/kkuroma/graphiv
