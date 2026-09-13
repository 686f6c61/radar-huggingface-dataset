# GermannM/kenga-embed-z3

## Resumen

kenga-embed-z3 es un encoder de frases bilingüe ruso-inglés de 44,2 millones de parámetros desarrollado por el usuario GermannM dentro del proyecto Kenga. Se trata de un transformer bidireccional con factorización Z que genera embeddings de 768 dimensiones normalizados en L2 mediante mean pooling, con tokenizador SentencePiece de 16.000 tokens y una ventana de contexto de 512 tokens. Su protocolo de prefijos es el de FRIDA/BERTA, por lo que puede sustituir a esos modelos en pipelines ya existentes sin modificar la lógica de consulta.

El modelo cubre similitud semántica, recuperación de información (retrieval), clasificación, clustering y reranking, y está pensado para el segmento de encoders rusos de 30-40 millones de parámetros (USER2-small-34M, rubert-tiny-turbo-29M), no para competir con modelos grandes. La propia model card lo explicita: en las 23 tareas de MTEB(rus, v1.1) obtiene una media simple de 54,2, frente a 58,5 de USER2-small-34M, 53,7 de rubert-tiny-turbo-29M y 74,2 de Giga-Embeddings-instruct-480M.

Su interés práctico reside en ser una alternativa con licencia MIT, muy ligera (checkpoint fp32 de 177 MB) y auto-contenida (solo requiere torch y sentencepiece) para despliegues en CPU o GPU de gama baja sobre corpus rusos, con resultados MTEB publicados de forma detallada y con ficheros de resultados crudos en el árbol de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con factorizacion Z (Z-factored), encoder de frases |
| Parametros totales | 44,2 M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (posiciones aprendidas hasta 512) |
| Tipos de cuantizacion | No disponible (solo se publica checkpoint fp32; no hay GGUF, ONNX ni int8 oficiales) |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | pytorch_model.bin (PyTorch, fp32, 177 MB) + config.json, kenga_spm.model y modeling_kenga_embed_v2.py |
| Dimension de embedding | 768 (normalizado en L2) |
| Pooling | Mean pooling |
| Tokenizador | SentencePiece, vocabulario de 16.000 tokens |
| Capas / cabezas / dff | 8 capas, 12 cabezas, dff = 3072 |
| Tamano del repo | 0,2 GB |
| Pipeline (HuggingFace) | sentence-similarity |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de 8 capas con d = 768, 12 cabezas de atención y dff = 3072. Incorpora dos innovaciones de eficiencia en parámetros: un embedding de tokens factorizado (16385 x 128 -> 768) y proyecciones de atención y feed-forward con factorización Z de rango 192/512. Las posiciones son aprendidas hasta 512 tokens. La salida es un vector de 768 dimensiones normalizado en L2 tras mean pooling, y el protocolo de prefijos es el de FRIDA/BERTA, de modo que se antepone automáticamente "<prefijo>: <texto>" (por ejemplo `search_query`, `search_document`, `paraphrase`, `categorize`, `categorize_sentiment`, `categorize_topic`, `categorize_entailment`).

Según la model card, el entrenamiento descrito corresponde a una etapa de destilación de 30.000 pasos con pérdida coseno y destilación relacional-KL desde sergeyzh/BERTA (128 M, a su vez destilado de FRIDA), sobre 1,23 millones de segmentos ruso/inglés procedentes de Wikipedia, diálogos, reseñas, titulares e intenciones, con prefijos estilo FRIDA y sin uso de etiquetas. Las capas con factorización Z siguen un currículo de rango (25 % -> 50 % -> 100 % del rango final) durante el entrenamiento. El checkpoint publicado corresponde al paso 30.000. El código de entrenamiento no está en el repositorio público kenga-lang: vive en el árbol de laboratorio `z-system` (`embed_v2/`: build_segments.py, teacher.py, distill.py, build_ft_data.py, mine_hard.py, finetune_prophet.py, run_mteb.py); la receta y el contrato Prophet se documentan en docs/PROPHETS.md. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de embeddings de frases para similitud semantica (STS) y deteccion de parafrasis, con similitud coseno directa al estar los vectores normalizados en L2.
- Recuperacion de informacion (retrieval) asimetrica mediante los prefijos `search_query` y `search_document`.
- Clasificacion y clasificacion multietiqueta por embeddings con los prefijos `categorize`, `categorize_sentiment` y `categorize_topic`.
- Clustering de fragmentos y documentos (tareas P2P del benchmark MTEB(rus)).
- Reranking de candidatos recuperados por un sistema previo.
- Inferencia de entailment/NLI mediante `categorize_entailment` (tarea TERRa).
- Bilinguismo ruso-ingles con un unico modelo y espacio de embeddings compartido.
- Ejecucion en CPU o GPU indistintamente (`device="cuda"` o `cpu`).
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, modo de pensamiento, vision, audio ni generacion de texto: es exclusivamente un encoder.

## Casos de uso

- Busqueda semantica sobre corpus rusos: indexar documentos con el prefijo `search_document` y consultar con `search_query`; la salida L2-normalizada permite usar similitud coseno con FAISS o similar sin postprocesado.
- Generacion aumentada por recuperacion (RAG) en asistentes en ruso: el modelo actua como retriever ligero sobre fragmentos de hasta 512 tokens, apto para despliegues en CPU donde no cabe un encoder de 480 M.
- Deduplicacion y agrupacion de contenido: clustering de titulares, noticias o reseñas con las tareas de tipo Clustering P2P; su mejor resultado relativo esta precisamente en clustering cientifico (60,3 en RuSciBenchGRNTIClusteringP2P).
- Clasificacion de intenciones en bots de atencion al cliente en ruso: entrenar un clasificador lineal sobre los embeddings con el prefijo `categorize`, con la ventaja de no requerir etiquetas para el encoder.
- Moderacion y deteccion de temas sensibles: el prefijo `categorize_topic` y las tareas de temas sensibles permiten filtrar contenido, aunque con el aviso de que SensitiveTopicsClassification es su tarea mas debil (25,0).
- Reranking en un pipeline de busqueda: recuperar con un metodo barato y reordenar los candidatos con este modelo, que obtiene 62,7 en RuBQReranking y 43,7 en MIRACL Reranking.
- Analitica de opiniones: vectorizar reseñas de productos o peliculas (RuReviews, Kinopoisk, Georeview) para segmentar y monitorizar sentimiento por lotes en infraestructura modesta.
- Despliegue en el borde o on-premise: el checkpoint fp32 ocupa 177 MB, por lo que cabe en contenedores pequenos, portatiles sin GPU o dispositivos con pocos recursos, siempre en dominios ruso/ingles.

## Benchmarks y rendimiento

Resultados oficiales en MTEB(rus, v1.1), ejecutados con `mteb==2.20.5`, 23/23 tareas completadas, sin omisiones ni reponderaciones. Las columnas de referencia son las entregas de los propios modelos al leaderboard (embeddings-benchmark/results).

| Tarea | kenga-embed-z3 | Giga-Embeddings-instruct-480M | BERTA-128M | USER2-small-34M | rubert-tiny-turbo-29M |
|---|---:|---:|---:|---:|---:|
| GeoreviewClassification | 46,1 | 55,4 | 54,8 | 41,1 | 41,4 |
| HeadlineClassification | 82,8 | 89,0 | 89,0 | 74,3 | 68,9 |
| InappropriatenessClassification | 60,4 | 86,1 | 74,8 | 60,7 | 59,1 |
| KinopoiskClassification | 61,9 | 73,0 | 67,8 | 52,2 | 50,5 |
| MassiveIntentClassification | 57,9 | 85,3 | 74,0 | 66,1 | 58,0 |
| MassiveScenarioClassification | 68,8 | 90,9 | 84,5 | 70,3 | 62,9 |
| RuReviewsClassification | 68,9 | 76,3 | 72,3 | 60,8 | 60,7 |
| RuSciBenchGRNTIClassification | 62,4 | 74,0 | 69,0 | 63,1 | 52,9 |
| RuSciBenchOECDClassification | 47,5 | 59,9 | 54,8 | 49,2 | 40,8 |
| CEDRClassification | 52,6 | 69,8 | 73,0 | 39,4 | 39,0 |
| SensitiveTopicsClassification | 25,0 | 44,3 | 39,9 | 27,5 | 25,2 |
| GeoreviewClusteringP2P | 44,7 | 73,8 | 73,8 | 66,2 | 59,7 |
| RuSciBenchGRNTIClusteringP2P | 60,3 | 70,5 | 65,0 | 56,4 | 48,1 |
| RuSciBenchOECDClusteringP2P | 50,5 | 58,1 | 55,6 | 48,6 | 41,1 |
| TERRa | 54,5 | 79,6 | 65,7 | 54,0 | 56,3 |
| RuBQReranking | 62,7 | 80,5 | 75,2 | 66,0 | 62,2 |
| MIRACLReranking | 43,7 | 67,5 | 64,3 | 50,5 | 47,7 |
| RiaNewsRetrievalHardNegatives.v2 | 38,8 | 88,9 | 84,5 | 74,5 | 52,3 |
| RuBQRetrieval | 42,6 | 80,6 | 71,0 | 61,1 | 51,7 |
| MIRACLRetrievalHardNegatives.v2 | 34,7 | 74,7 | 65,9 | 46,1 | 42,4 |
| RUParaPhraserSTS | 59,7 | 78,3 | 77,8 | 69,6 | 72,1 |
| RuSTSBenchmarkSTS | 66,8 | 83,6 | 82,2 | 81,0 | 78,5 |
| STS22 | 54,2 | 65,3 | 61,1 | 66,1 | 64,6 |
| Classification (media) | 61,9 | 76,7 | 71,2 | 59,8 | 55,0 |
| MultilabelClassification (media) | 38,8 | 57,1 | 56,5 | 33,5 | 32,1 |
| Clustering (media) | 51,8 | 67,5 | 64,8 | 57,1 | 49,6 |
| PairClassification (media) | 54,5 | 79,6 | 65,7 | 54,0 | 56,3 |
| Reranking (media) | 53,2 | 74,0 | 69,7 | 58,3 | 54,9 |
| Retrieval (media) | 38,7 | 81,4 | 73,8 | 60,6 | 48,8 |
| STS (media) | 60,2 | 75,7 | 73,7 | 72,2 | 71,7 |
| Media sobre tareas | 54,2 | 74,2 | 69,4 | 58,5 | 53,7 |
| Media sobre tipos de tarea (leaderboard) | 51,3 | 73,1 | 67,9 | 56,5 | 52,6 |
| Tareas completadas | 23 | 23 | 23 | 23 | 23 |

Los ficheros de resultados crudos se encuentran en `mteb_results/` del arbol de entrenamiento. La model card advierte explicitamente de que el modelo no supera a Giga-Embeddings-instruct-480M (brecha de 19,9 puntos en la media simple) y de que queda 4,2 puntos por debajo de USER2-small-34M.

## Requisitos de hardware

- Pesos en fp32: 177 MB (checkpoint publicado). En fp16/bf16 serian aproximadamente 88 MB, aunque no se publica esa variante; la conversion la tendria que hacer el usuario.
- VRAM estimada para inferencia: por debajo de 1-2 GB en fp32 con lotes moderados de secuencias de 512 tokens (estimacion derivada del numero de parametros y de la configuracion; el autor no publica mediciones).
- Cabe en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090, e incluso en GPU integradas; tambien funciona en CPU, como indica el propio autor (`cpu works too`).
- GPU de datacenter (A100, H100) no son necesarias; su utilidad aqui seria unicamente el procesamiento por lotes a gran escala.
- Opciones de despliegue: inferencia nativa con PyTorch cargando `modeling_kenga_embed_v2.py` (unica dependencia: torch y sentencepiece), o descarga del repositorio con `huggingface_hub.snapshot_download("GermannM/kenga-embed-z3")`. No hay integracion publicada con vLLM, llama.cpp, Ollama, TGI ni sentence-transformers, ni pesos GGUF u ONNX.
- Latencia y throughput: no disponible. No se publican mediciones de velocidad ni de coste por lote.
- Para indexacion a gran escala conviene vectorizar en lote y almacenar los 768 flotantes por documento (3 KB por vector en fp32, 1,5 KB en fp16).

## Comparativa con modelos similares

| Modelo | Parametros | Dim. de embedding | Contexto | Licencia | Media MTEB(rus) sobre tareas | Disponibilidad |
|---|---:|---:|---:|---|---:|---|
| kenga-embed-z3 | 44,2 M | 768 | 512 | MIT | 54,2 | Repo HuggingFace, codigo propio |
| USER2-small-34M | 34 M | No disponible | No disponible | No disponible | 58,5 | Leaderboard MTEB |
| rubert-tiny-turbo-29M | 29 M | No disponible | No disponible | No disponible | 53,7 | Leaderboard MTEB |
| BERTA-128M | 128 M | No disponible | No disponible | No disponible | 69,4 | Repo HuggingFace (sergeyzh/BERTA) |
| Giga-Embeddings-instruct-480M | 480 M (segun denominacion) | No disponible | No disponible | No disponible | 74,2 | Leaderboard MTEB |

Frente a los encoders de su mismo rango de tamano, kenga-embed-z3 queda por encima de rubert-tiny-turbo-29M (54,2 frente a 53,7) y por debajo de USER2-small-34M (54,2 frente a 58,5). Frente a su propio profesor, BERTA-128M, la diferencia es de 15,2 puntos en la media simple, y la brecha se concentra en retrieval (38,7 frente a 73,8). Los datos de licencia, dimension y contexto de los modelos de comparacion no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no admite chat, generacion de texto o codigo, tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento. Cualquier uso de ese tipo queda fuera de su alcance.
- El propio autor senala que no supera a Giga-Embeddings-instruct-480M y que esta 4,2 puntos por debajo de USER2-small-34M-34M en la media simple de las 23 tareas.
- Retrieval es su punto mas debil: 38,8 en RiaNewsRetrievalHardNegatives.v2 y 34,7 en MIRACLRetrievalHardNegatives.v2, muy lejos de BERTA-128M (84,5 y 65,9) y de los modelos grandes.
- Clasificacion de temas sensibles practicamente inutil: 25,0 en SensitiveTopicsClassification, por debajo de BERTA (39,9) y de Giga (44,3).
- Contexto limitado a 512 tokens: los documentos largos deben trocearse, con la perdida de coherencia que ello implica.
- Solo ruso e ingles. No hay ningun dato de rendimiento en castellano ni en otros idiomas.
- Requiere el protocolo de prefijos FRIDA/BERTA; el uso sin los prefijos correspondientes no esta documentado ni validado.
- La carga exige codigo propio (`modeling_kenga_embed_v2.py`) con torch y sentencepiece; no es plug-and-play en sentence-transformers, lo que complica su integracion en stacks estandar.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de terceros. Los resultados MTEB son autopublicados, aunque los ficheros crudos estan disponibles.
- El codigo de entrenamiento no esta en el repositorio publico kenga-lang (vive en un arbol de laboratorio no publicado), por lo que la reproducibilidad del entrenamiento es limitada; solo se documenta la receta en docs/PROPHETS.md.
- La model card mezcla la denominacion kenga-embed-z2 y kenga-embed-z3 al describir la etapa de destilacion, lo que puede generar confusion sobre que artefacto corresponde a cada etapa.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existen falsos positivos y negativos en similitud, especialmente con negativos dificiles.
- Sesgos: no documentados por el autor. El corpus de entrenamiento (Wikipedia, dialogos, resenas, titulares, intenciones) sesga el modelo hacia esos dominios y registros.
- Licencia MIT: permite uso comercial y modificacion sin restricciones, pero sin garantias de ningun tipo por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GermannM/kenga-embed-z3
- Repositorio del proyecto Kenga: https://github.com/GermannM/kenga-lang
- Documentacion del contrato Prophet y receta de entrenamiento: https://github.com/GermannM/kenga-lang/blob/main/docs/PROPHETS.md
- Modelo profesor (BERTA): https://huggingface.co/sergeyzh/BERTA
- Resultados de referencia del leaderboard MTEB: https://github.com/embeddings-benchmark/results
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; las entradas obtenidas correspondian a un emulador de Android sin relacion con el proyecto.
