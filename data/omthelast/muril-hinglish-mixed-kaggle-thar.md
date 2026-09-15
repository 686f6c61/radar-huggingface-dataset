# OmTheLast/muril-hinglish-mixed-kaggle-thar

## Resumen

OmTheLast/muril-hinglish-mixed-kaggle-thar es un checkpoint de clasificacion de texto obtenido por ajuste fino de google/muril-base-cased sobre una mezcla de dos corpus de discurso de odio en texto code-mixed hindi-ingles (hinglish): el dataset de Kaggle "code-mixed hinglish hate speech detection" y el corpus THAR. El modelo realiza una clasificacion binaria con etiquetas `0 = NEGATIVE` y `1 = POSITIVE`, donde la clase positiva agrupa definiciones de hate y offense procedentes de distintas fuentes, motivo por el cual el propio autor advierte que las etiquetas de la mezcla no son homogeneas. Forma parte de un estudio comparativo entre mBERT y MuRIL centrado en transferencia entre datasets, mezclas de entrenamiento y variacion de semilla.

Tecnicamente es un transformer encoder-only de la familia BERT (variante MuRIL base cased) con 237.557.762 parametros, exportado en safetensors para la tarea `text-classification`. El checkpoint publicado corresponde a la semilla 42, disponible bajo la revision `seed-42` (la rama `main` apunta a esa misma semilla), y se entreno durante dos epocas restaurando la mejor epoca segun Macro F1 de evaluacion. El ejemplo de inferencia de la model card aplica truncacion a 128 tokens, con normalizacion previa de URLs a `URL`, menciones a `USER` y colapso de espacios en blanco.

Su relevancia es acotada y de caracter investigador: no es un modelo de proposito general ni un sistema de moderacion listo para produccion. Su interes esta en que documenta de forma poco habitual las limitaciones metodologicas de su propia evaluacion (el split de seleccion de checkpoint incluye parte del test de origen en el caso de CM), publica resultados internos y externos por separado, y deja constancia de que la licencia de los pesos ajustados aun no se ha asignado. Las descargas y likes registrados en el momento de la consulta son 0, y el repositorio ocupa 1,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only de la familia BERT (variante MuRIL base cased); cabecera de clasificacion de secuencias |
| Parametros totales | 237.557.762 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el pipeline de ejemplo trunca a 128 tokens (incluyendo tokens especiales) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors en precision completa |
| Idiomas soportados | Hindi (hi) e ingles (en), en la practica texto code-mixed hinglish |
| Licencia | No asignada para los pesos ajustados; el modelo base (google/muril-base-cased) declara Apache-2.0. Las licencias de los datasets de entrenamiento (CM, THAR) siguen sin resolver |
| Formato de pesos | safetensors (carga via `transformers`) |
| Tarea | `text-classification` binaria: `0 = NEGATIVE`, `1 = POSITIVE` |
| Modelo base | google/muril-base-cased |
| Idiomas declarados en la model card | hi, en |
| Tamano del repositorio | 1,0 GB |
| Revisiones disponibles | `main` (semilla 42 por defecto), `seed-42` |
| Fecha de creacion / actualizacion | 2026-09-15 / 2026-09-15 |
| Compatibilidad declarada | `text-embeddings-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo BERT con cabecera de clasificacion (`AutoModelForSequenceClassification`), heredada de google/muril-base-cased. MuRIL es una variante de BERT preentrenada especificamente para lenguas indias, lo que explica el tamano de 237,5 M de parametros: la mayor parte del incremento respecto a un BERT-base estandar proviene del vocabulario extendido necesario para representar texto hindi transliterado y code-mixed. No se dispone en la informacion proporcionada del numero de capas, dimension oculta, numero de cabezas de atencion ni del `max_position_embeddings` efectivo.

El ajuste fino se realizo durante dos epocas sobre una mezcla construida a partir de las particiones de entrenamiento de Kaggle y THAR con semilla 42, dividida internamente 80/20 para entrenamiento y evaluacion. El script de entrenamiento restaura la epoca con mayor Macro F1 de evaluacion, por lo que los pesos exportados pueden proceder de la primera epoca. La semilla de entrenamiento se paso al `Trainer`, pero el autor advierte de que no se garantiza la reproduccion exacta de la inicializacion del clasificador ni del comportamiento dependiente del dispositivo. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna tecnica de alineacion adicional. El preprocesado preserva mayusculas y minusculas, sustituye URLs por `URL`, menciones por `USER` y colapsa espacios en blanco.

## Capacidades

- Clasificacion binaria de texto code-mixed hindi-ingles en dos clases: `NEGATIVE` y `POSITIVE` (hate/offense segun la definicion agregada de las fuentes).
- Deteccion de contenido ofensivo o de odio en publicaciones y comentarios escritos en hinglish, con salida de probabilidades por clase.
- Manejo de texto informal con transliteracion (devanagari y caracteres latinos mezclados), segun los tags `hinglish` y `code-mixed`.
- Normalizacion robusta de ruido tipico de redes sociales: URLs, menciones y espacios redundantes.
- Inferencia por lotes con `padding="max_length"` y truncacion a 128 tokens.
- Integracion sencilla como cabecera de clasificacion en pipelines de Hugging Face y despliegue en endpoints compatibles.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento: es exclusivamente un clasificador discriminativo.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones multi-turno.

## Casos de uso

- Pretriaje de moderacion en plataformas de contenido en hindi/ingles: el modelo actua como primer filtro sobre comentarios y publicaciones para priorizar la revision humana, reduciendo el volumen que llega a los moderadores. Es adecuado porque trabaja directamente sobre texto code-mixed, que los clasificadores entrenados solo en ingles no cubren.
- Analisis de toxicidad en comunidades de creadores indios: se pueden puntuar comentarios de YouTube, Instagram o X en hinglish y agregar la tasa de contenido positivo por video o canal para detectar picos de abuso.
- Investigacion academica sobre transferencia entre datasets: el checkpoint esta pensado como pieza de un estudio comparativo mBERT vs MuRIL, por lo que sirve como linea base reproducible (semilla 42) en experimentos de generalizacion cross-dataset.
- Auditoria de modelos de moderacion: al publicar resultados internos y externos por separado, el modelo permite analizar como cambia el rendimiento segun la definicion de etiqueta y la plataforma de origen, util para estudios de sesgo de anotacion.
- Etiquetado debil (weak labeling) y curación de corpus: sus salidas pueden usarse como anotaciones preliminares sobre grandes volumenes de texto hinglish no etiquetado, que despues se revisan manualmente para entrenar un modelo mayor.
- Monitorizacion de toxicidad en chats de videojuegos y streaming en India: clasificacion en tiempo real de mensajes cortos con un coste computacional bajo (237 M de parametros, contexto de 128 tokens), adecuado para despliegue en CPU o GPU de gama media.
- Analisis de discurso en estudios de ciencias sociales y comunicacion: cuantificar la presencia de lenguaje ofensivo en corpus de redes sociales en hinglish antes y despues de eventos concretos.
- Construccion de baseline en papers de hate speech multilingue: el checkpoint ofrece un punto de comparacion ya entrenado y evaluado, evitando reentrenar MuRIL desde cero en cada estudio.

## Benchmarks y rendimiento

Evaluacion interna (conjunto de la mezcla, 80/20, semilla 42). El autor advierte que este split guio la seleccion del checkpoint, por lo que son resultados de conjunto de seleccion y no una estimacion de test final intacta.

| Metrica | Valor (semilla 42) |
|---|---|
| Accuracy | 0.7378 |
| Macro F1 | 0.7344 |
| Positive F1 | 0.7044 |
| Positive recall | 0.6968 |

Evaluaciones externas separadas (semilla 42):

| Dataset de evaluacion | Filas | Macro F1 | Positive recall |
|---|---:|---:|---:|
| kaggle_hinglish_hate | 956 | 0.6662 | 0.4853 |
| cm_splits_codemixed | 415 | 0.5935 | 0.3741 |
| thar_religion | 2310 | 0.7648 | 0.7828 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, etc.), que ademas no aplican a un clasificador binario de esta naturaleza. El autor excluye explicitamente de estas cifras una sonda diagnostica de 79 filas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,95 GB en FP32, 0,48 GB en FP16/BF16 y 0,24 GB en INT8, calculadas a partir de los 237,5 M de parametros y sin contar el overhead del runtime (estimacion, no medida publicada).
- Con truncacion a 128 tokens, la memoria de activaciones es despreciable frente al peso de los parametros, por lo que el factor limitante es el propio modelo.
- Cabe sin problemas en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o cualquier GPU con 4 GB o mas de VRAM. El repositorio completo ocupa 1,0 GB.
- Ejecucion en CPU viable para lotes pequenos o moderados, dado el tamano del modelo, aunque no hay cifras de latencia publicadas.
- GPU de centro de datos (A100, H100, L40S) solo serian necesarias para procesar volumenes muy altos en paralelo o para reentrenamiento, no para inferencia individual.
- Opciones de despliegue: `transformers` (ruta documentada por el autor), Hugging Face Inference Endpoints (tag `endpoints_compatible`) y Text Embeddings Inference (tag `text-embeddings-inference`). No se documentan en la informacion disponible soporte explicito para vLLM, llama.cpp, Ollama, TGI ni pesos GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de milisegundos por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmTheLast/muril-hinglish-mixed-kaggle-thar | 237.557.762 | No disponible (uso a 128 tokens) | Clasificacion binaria hinglish | No asignada (base Apache-2.0) | Publico en Hugging Face |
| google/muril-base-cased (modelo base) | No disponible en la informacion proporcionada | No disponible | Modelo de lenguaje enmascarado (preentrenamiento) | Apache-2.0 | Publico en Hugging Face |
| Contraparte mBERT del mismo estudio (mBERT-vs-MuRIL) | No disponible en la informacion proporcionada | No disponible | Clasificacion binaria hinglish | No disponible | Codigo en GitHub; checkpoints no detallados en la informacion proporcionada |

La comparacion cuantitativa entre mBERT y MuRIL se documenta en el repositorio de investigacion del autor (`docs/matched_multiseed_results.md`), pero los valores concretos no se incluyen en la informacion proporcionada. No se dispone de datos para comparar con alternativas como XLM-R o clasificadores especificos de hate speech en hinglish.

## Limitaciones y advertencias

- Generalizacion cross-dataset limitada: el Macro F1 cae de 0.7344 en la mezcla interna a 0.5935 en `cm_splits_codemixed` y 0.6662 en `kaggle_hinglish_hate`, con recall de la clase positiva de solo 0.3741 y 0.4853 respectivamente.
- Definiciones de etiqueta heterogeneas: la clase positiva agrega criterios de hate y offense de fuentes distintas, por lo que las etiquetas no son directamente comparables entre datasets.
- Contaminacion del conjunto de evaluacion: el script de entrenamiento evalua cada epoca sobre un split que, en el caso de CM, incluye parte del test de origen, por lo que los resultados internos son de seleccion de checkpoint y no una estimacion de test intacta.
- Estado de una sola semilla: los resultados mezclados corresponden unicamente a la semilla 42, de modo que no queda establecida la robustez frente a variacion de semilla.
- Duplicados en CM y posibles duplicados entre splits, que pueden inflar las metricas.
- Errores documentados por el autor: palabras identitarias, transliteracion, abuso citado entre comillas y ausencia de contexto conversacional.
- Falsos negativos relevantes: el recall de la clase positiva por debajo de 0.7 implica que una fraccion significativa de contenido ofensivo no se detecta.
- No validado para moderacion autonoma ni para tomar decisiones sobre personas concretas. Cualquier uso en produccion requiere revision humana.
- Licencia no asignada: los pesos ajustados no tienen licencia propia y las condiciones de los datasets de entrenamiento (CM y THAR) siguen bajo revision. El acceso publico no concede licencia de uso comercial. La licencia Apache-2.0 del modelo base no cubre los datasets.
- Ausencia de soporte multi-turno, generativo, tool calling o agentes; el modelo solo emite una distribucion sobre dos clases.
- Alcance idiomatico restringido: aunque los tags declaran hi y en, el entrenamiento se ha hecho sobre hinglish code-mixed, no sobre hindi o ingles formales.
- Riesgo de sesgo derivado de los corpus de origen: las fuentes, plataformas y criterios de anotacion condicionan que se considera ofensivo.
- Riesgo de alucinacion no aplicable en sentido estricto (es un clasificador), pero si de falsos positivos y negativos sistematicos sobre determinados grupos o expresiones.
- Ausencia de cifras publicadas de latencia, throughput o rendimiento energetico, lo que dificulta dimensionar un despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmTheLast/muril-hinglish-mixed-kaggle-thar
- Codigo de investigacion: https://github.com/OmTheLast/mBERT-vs-MuRIL-cross-dataset-hinglish-hate
- Resultados multilla emparejados: https://github.com/OmTheLast/mBERT-vs-MuRIL-cross-dataset-hinglish-hate/blob/main/docs/matched_multiseed_results.md
- Borrador del articulo (working paper): https://github.com/OmTheLast/mBERT-vs-MuRIL-cross-dataset-hinglish-hate/blob/4650c6eb093d422785284656dd6765d36e438522/paper/application_research_draft.md
- Registro de datasets: https://github.com/OmTheLast/mBERT-vs-MuRIL-cross-dataset-hinglish-hate/blob/4650c6eb093d422785284656dd6765d36e438522/docs/dataset_registry.md
- Dataset Kaggle (code-mixed hinglish hate speech detection): https://www.kaggle.com/datasets/sharduldhekane/code-mixed-hinglish-hate-speech-detection-dataset
- Corpus THAR: https://github.com/aakash-dl/THAR
- Modelo base MuRIL: https://huggingface.co/google/muril-base-cased
- Modelo base mBERT: https://huggingface.co/google-bert/bert-base-multilingual-cased
- La busqueda web realizada no devolvio resultados relevantes para este modelo; los unicos enlaces utiles son los anteriores, procedentes de la model card y de la informacion de Hugging Face.
