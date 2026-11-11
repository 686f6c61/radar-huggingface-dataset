# LingoIITGN/FlowVec-v2

## Resumen

FlowVec-v2 es un modelo de embeddings de texto de 8.000 millones de parametros (7.567.295.488 segun los pesos safetensors) desarrollado por Lingo Labs en IIT Gandhinagar, especializado en 21 lenguas indicas. Convierte texto en vectores densos de 4096 dimensiones destinados a recuperacion de informacion, reranking, clasificacion, clustering, mineria de bitextos, similitud semantica e inferencia de lenguaje natural (NLI). Se distribuye como modelo de la libreria sentence-transformers y esta afinado a partir de FlowVec-v1.

La relevancia del modelo reside en su cobertura linguistica: abarca sistemas de escritura bengali, devanagari, gujarati, gurmukhi, kannada, malayo, odia, tamil, telugu, perso-arabico y ol chiki, lo que cubre idiomas historicamente infrarrepresentados en los modelos de embeddings multilingues dominantes. Ademas, cada tipo de tarea lleva su propia instruccion, de modo que un unico modelo sirve para busqueda, emparejamiento interlinguistico y etiquetado sin necesidad de fine-tuning adicional.

En la evaluacion MTEB(Indic, v1) realizada por el autor, FlowVec-v2 alcanza una media de 78,96 frente a 78,01 de FlowVec-v1, con mejoras notables en mineria de bitextos conversacionales (IN22ConvBitextMining, +5,21), clasificacion de shlokas sanscritas (+6,56) y clasificacion de sentimiento en urdu romanizado (+2,02). La licencia Apache 2.0 y la compatibilidad con text-embeddings-inference facilitan su despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3 (tag `qwen3`), adaptada como encoder de embeddings con cabecera de sentence-transformers |
| Parametros totales | 7.567.295.488 (aproximadamente 7,6 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, probablemente bfloat16 segun el ejemplo de uso) |
| Idiomas soportados | 21 lenguas indicas: asames (as), bengali (bn), bodo (brx), dogri (doi), gujarati (gu), hindi (hi), kannada (kn), cachemir (ks), maithili (mai), malayalam (ml), marathi (mr), manipuri (mni), nepali (ne), odia (or), punyabi (pa), sanscrito (sa), santali (sat), sindhi (sd), tamil (ta), telugu (te), urdu (ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 15,1 GB) |

## Arquitectura y entrenamiento

FlowVec-v2 se construye sobre una arquitectura transformer de la familia Qwen3 (el tag del repositorio lo indica explicitamente) reconvertida en encoder de embeddings mediante sentence-transformers. El modelo produce representaciones de 4096 dimensiones, lo que supone una dimensionalidad alta orientada a preservar informacion semantica fina en tareas de recuperacion y reranking. El modelo base es FlowVec-v1, sobre el que se aplica un afinamiento adicional; la model card no detalla la composicion exacta del dataset de entrenamiento ni el numero de tokens utilizados.

La innovacion tecnica principal es el uso de instrucciones por tarea: el objeto `model.prompts` expone una instruccion especifica para cada tarea de MTEB (por ejemplo, `XQuADRetrieval-query`), y para tareas propias el autor indica el formato `prompt="Instruct: <your task>\nQuery: "`. Este enfoque permite que un mismo conjunto de pesos sirva para busqueda, emparejamiento interlinguistico y clasificacion sin fine-tuning. No se documenta en la informacion disponible si hubo RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un modelo de embeddings puro.

## Capacidades

- Generacion de embeddings de texto de 4096 dimensiones para frases y documentos.
- Recuperacion de informacion (retrieval) mono- e interlinguistica sobre 21 lenguas indicas.
- Reranking de resultados de busqueda, con resultados destacados en WikipediaRerankingMultilingual (88,88).
- Clasificacion de texto por similitud semantica (sentimiento, noticias, discurso, intencion).
- Clustering de frases a frases (S2S), evaluado en SIB200ClusteringS2S (87,41).
- Mineria de bitextos para corpus paralelos (IN22GenBitextMining 89,62; IN22ConvBitextMining 72,13).
- Similitud semantica interlinguistica (IndicCrosslingualSTS 62,06).
- Inferencia de lenguaje natural (XNLI 82,13).
- Soporte de instrucciones por tarea mediante `prompt_name` o `prompt` personalizado.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica multilingue en India: desplegar el modelo como encoder de consultas y documentos para un motor de busqueda que cubra hindi, tamil, bengali, urdu y otras lenguas; los 4096 dimensiones y las instrucciones de retrieval (`XQuADRetrieval-query`) permiten recuperar pasajes relevantes sin traduccion intermedia.
- Reranking de resultados en plataformas de contenidos: usar el modelo como segunda etapa de ordenacion sobre candidatos recuperados por BM25 o un retriever ligero, aprovechando su rendimiento en WikipediaRerankingMultilingual (88,88) para mejorar la precision final.
- Moderacion de contenido y clasificacion de sentimiento: clasificar publicaciones en redes sociales en varias lenguas indicas mediante similitud con prototipos etiquetados, con resultados de 92,06 en BengaliSentimentAnalysis y 76,23 en SentimentAnalysisHindi.
- Mineria de corpus paralelos para traduccion automatica: alinear oraciones entre lenguas indicas para construir datasets de entrenamiento de modelos de traduccion, apoyado en IN22GenBitextMining (89,62) e IN22ConvBitextMining (72,13).
- Deduplicacion y clustering de documentos: agrupar noticias, articulos o consultas semanticamente equivalentes en un corpus multilingue usando SIB200ClusteringS2S (87,41) como referencia de calidad.
- Enrutamiento de intenciones en asistentes conversacionales: clasificar la intencion del usuario (MTOPIntentClassification 84,75) para dirigir la conversacion al flujo adecuado, con cobertura de 21 lenguas sin necesidad de un clasificador por idioma.
- Analisis de discurso politico y social: clasificar discursos y textos largos (HindiDiscourseClassification 43,85), util para monitorizacion de medios, aunque con margen de mejora en esta tarea concreta.
- Sistemas de recomendacion y busqueda de productos: emparejar consultas de usuarios con descripciones de catalogo en varias lenguas indicas mediante similitud coseno sobre embeddings.

## Benchmarks y rendimiento

Resultados MTEB(Indic, v1) reportados por el autor (dos ejecuciones identicas):

| Tarea | FlowVec-v1 | FlowVec-v2 | Delta |
|---|---|---|---|
| BelebeleRetrieval | 90,39 | 90,49 | +0,10 |
| BengaliSentimentAnalysis | 92,00 | 92,06 | +0,06 |
| GujaratiNewsClassification | 91,23 | 91,53 | +0,30 |
| HindiDiscourseClassification | 43,59 | 43,85 | +0,26 |
| IN22ConvBitextMining | 66,92 | 72,13 | +5,21 |
| IN22GenBitextMining | 88,41 | 89,62 | +1,21 |
| IndicCrosslingualSTS | 61,42 | 62,06 | +0,64 |
| MTOPIntentClassification | 84,65 | 84,75 | +0,10 |
| MalayalamNewsClassification | 91,80 | 92,75 | +0,95 |
| MultiHateClassification | 67,38 | 67,19 | -0,19 |
| NepaliNewsClassification | 97,01 | 97,01 | +0,00 |
| PunjabiNewsClassification | 84,20 | 84,46 | +0,26 |
| SIB200ClusteringS2S | 87,25 | 87,41 | +0,16 |
| SanskritShlokasClassification | 64,90 | 71,46 | +6,56 |
| SentimentAnalysisHindi | 76,02 | 76,23 | +0,21 |
| TweetSentimentClassification | 46,56 | 46,91 | +0,35 |
| UrduRomanSentimentClassification | 61,99 | 64,01 | +2,02 |
| WikipediaRerankingMultilingual | 87,98 | 88,88 | +0,90 |
| XNLI | 82,11 | 82,13 | +0,02 |
| XQuADRetrieval | 94,35 | 94,36 | +0,01 |
| **Media** | 78,01 | **78,96** | |

No se han publicado en la informacion disponible resultados comparativos con otros modelos de embeddings indicos (por ejemplo, variantes multilingues de terceros) ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el modelo ocupa aproximadamente 15 GB, por lo que se necesitan al menos 16 GB de VRAM para cargar los pesos; con cuantizacion a 8 bits o 4 bits el requisito baja a unos 8 GB o 4-5 GB respectivamente, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: A100 (40/80 GB), H100 y L40S para despliegue en servidor; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo en bfloat16.
- Cabe en GPU consumer: si en RTX 4090, RTX 3090 y A6000 (48 GB); en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) solo con cuantizacion o con offload parcial a CPU.
- Opciones de despliegue: sentence-transformers (libreria nativa), text-embeddings-inference (el repositorio esta marcado como compatible con `text-embeddings-inference` y `endpoints_compatible`), y servidores de inferencia que acepten safetensors; no se documenta soporte GGUF ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| FlowVec-v2 | 7,6 mil millones | no disponible | 21 lenguas indicas | Apache 2.0 | Media MTEB(Indic, v1) de 78,96; embeddings de 4096 dimensiones |
| FlowVec-v1 | no disponible | no disponible | 21 lenguas indicas | Apache 2.0 (presumible, mismo autor) | Modelo base de v2; media MTEB(Indic, v1) de 78,01 |
| Otros modelos de embeddings indicos o multilingues | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La unica comparacion documentada es con FlowVec-v1, su predecesor directo, sobre el que FlowVec-v2 mejora en 17 de 20 tareas evaluadas (una empate y una leve caida de 0,19 en MultiHateClassification). No hay datos disponibles para comparar con alternativas de terceros.

## Limitaciones y advertencias

- Es un modelo exclusivamente de embeddings: no genera texto, no soporta tool calling, agentes, vision ni audio.
- La model card no documenta sesgos conocidos; al entrenarse sobre datos indicos, puede heredar sesgos de los corpus de origen (por ejemplo, en tareas de sentimiento y clasificacion de hate speech, donde MultiHateClassification se situa en 67,19).
- Riesgo de alucinacion no aplicable en el sentido generativo, pero la similitud semantica puede producir falsos positivos en retrieval y reranking, especialmente en tareas con puntuaciones bajas como HindiDiscourseClassification (43,85) o TweetSentimentClassification (46,91).
- La longitud de contexto no esta documentada, lo que impide planificar el truncamiento de documentos largos con certeza.
- La cobertura se limita a 21 lenguas indicas; no esta evaluado para ingles ni otras familias linguisticas, por lo que no debe asumirse rendimiento multilingue general.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y atribucion; conviene revisar los terminos del modelo base Qwen3 y de FlowVec-v1.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha y fue creado en noviembre de 2026, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- Los resultados de MTEB son autoinformados por el autor (dos ejecuciones identicas); no se dispone de verificacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LingoIITGN/FlowVec-v2
- Modelo base FlowVec-v1: https://huggingface.co/LingoIITGN/FlowVec-v1
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Framework MTEB: https://github.com/embeddings-benchmark/mteb
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a FlowVec-v2.
