# alibaba-nlp-community/gte-large-en-v1.5

## Resumen

gte-large-en-v1.5 es un modelo de embeddings de texto (sentence-similarity) desarrollado por el equipo de NLP de Alibaba y publicado en el Hub a través de la organización alibaba-nlp-community. No es un modelo generativo: convierte texto en vectores densos de 1024 dimensiones para tareas de recuperación, similitud semántica, clasificación, clustering y reranking. Con 434.139.136 parámetros, se sitúa en la gama "large" de la familia GTE (General Text Embeddings) y es la versión 1.5 de la variante inglesa, una revisión que mejora el comportamiento en textos largos y diversos respecto a la versión original.

Su relevancia actual viene de dos factores. Primero, compite en la parte alta de la tabla MTEB para modelos de su tamaño, con resultados declarados por el autor como 93,97 de accuracy en AmazonPolarityClassification, 87,33 en Banking77 o 72,11 de nDCG@10 en ArguAna. Segundo, su licencia Apache-2.0 y la disponibilidad de pesos en safetensors y ONNX (con soporte para transformers.js) lo hacen directamente desplegable tanto en servidores con GPU como en el navegador o en entornos de solo CPU.

La arquitectura es un encoder transformer bidireccional de tipo BERT, entrenado con aprendizaje contrastivo multi-etapa, según los dos artículos referenciados en las etiquetas del repositorio (arXiv:2308.03281 y arXiv:2407.19669). El modelo está pensado exclusivamente para inglés y se integra de forma nativa con sentence-transformers, la librería estándar de facto para pipelines de embeddings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (familia GTE, tipo BERT); numero de capas y dimensiones internas no disponibles en la informacion proporcionada |
| Parametros totales | 434.139.136 (dato real de los pesos safetensors) |
| Longitud de contexto | No disponible en la informacion proporcionada; la familia gte-v1.5 documenta hasta 8192 tokens |
| Tipos de cuantizacion | No disponibles en la informacion proporcionada; el repositorio incluye pesos ONNX, lo que habilita cuantizacion int8 para transformers.js y ONNX Runtime |
| Idiomas soportados | Ingles (en) unicamente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y ONNX |
| Dimension del embedding | No disponible en la informacion proporcionada |
| Funcion de pooling | No disponible en la informacion proporcionada |
| Tamano del repositorio | 6,0 GB |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

El modelo sigue la estirpe de los encoders bidireccionales tipo BERT aplicados a representacion de texto, no la de los decoders autoregresivos. La salida es un vector denso por secuencia, obtenido tras aplicar pooling sobre los estados ocultos; ese vector se usa con similitud coseno para ordenar, agrupar o clasificar textos. Al no tener cabeza de generacion, no produce tokens: toda su utilidad esta en el espacio vectorial que construye.

El entrenamiento se basa en aprendizaje contrastivo multi-etapa, la receta descrita en "Towards General Text Embeddings with Multi-stage Contrastive Learning" (arXiv:2308.03281) y extendida en el trabajo de mGTE (arXiv:2407.19669). La etiqueta `dataset:allenai/c4` indica que el corpus C4 forma parte de los datos de entrenamiento, lo que sugiere un uso intensivo de pares de texto no anotados a gran escala antes de las fases de afinado con datos supervisados y de alta calidad. No se especifican en la informacion proporcionada el numero total de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en modelos de embeddings).

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica y recuperacion densa.
- Busqueda semantica (dense retrieval) sobre colecciones de documentos en ingles.
- Clasificacion de texto mediante embeddings congelados mas un clasificador ligero (linear probe).
- Clustering y agrupamiento tematico de documentos (resultados declarados en ArxivClustering y BiorxivClustering).
- Reranking de candidatos recuperados por un buscador de primera fase.
- Similitud semantica textual (STS), con correlaciones declaradas de 85,39 de Spearman en BIOSSES.
- Deduplicacion y deteccion de near-duplicates por distancia coseno.
- Inferencia en navegador via transformers.js (etiqueta `transformers.js` en el repositorio).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: no es un modelo generativo ni multimodal.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado exclusivamente como `en`.

## Casos de uso

- Recuperacion aumentada por generacion (RAG) en ingles: se indexan los fragmentos de la base de conocimiento con gte-large-en-v1.5 y se recuperan los mas similares a la consulta antes de pasarlos a un LLM generativo. Su licencia Apache-2.0 y su tamano moderado permiten montarlo en la misma infraestructura que el generador sin coste de licencia adicional.
- Busqueda semantica interna para documentacion tecnica: frente a BM25, el modelo captura sinonimos y parafrasis, de modo que una consulta como "como reinicio el servicio" recupera el articulo titulado "procedimiento de reinicio del demonio" aunque no comparta terminos.
- Clasificacion de tickets de soporte y correos entrantes: se generan embeddings de los tickets historicos etiquetados, se entrena una regresion logistica sobre ellos y se clasifican los nuevos. La accuracy declarada de 87,33 en Banking77 (77 clases de intenciones bancarias) respalda este uso en dominios con muchas categorias.
- Analisis de voz del cliente: agrupacion de resenas y encuestas por similitud para descubrir temas recurrentes sin taxonomia predefinida, apoyandose en los resultados de clustering declarados (48,47 de v-measure en ArxivClusteringP2P).
- Deduplicacion de corpus para entrenamiento: antes de construir un dataset, se calculan embeddings de todos los documentos y se eliminan aquellos con similitud coseno por encima de un umbral, reduciendo contaminacion y coste de computo posterior.
- Reranking en un pipeline de busqueda en dos fases: un recuperador barato (BM25 o un modelo pequeno) devuelve los 100 mejores candidatos y gte-large-en-v1.5 los reordena; los 75,93 de MRR declarados en AskUbuntuDupQuestions apoyan este patron.
- Sistemas de recomendacion basados en contenido: se vectorizan descripciones de producto o articulos y se recomiendan los vecinos mas proximos al historial del usuario, sin necesidad de senales colaborativas.
- Moderacion y deteccion de similitud con contenido prohibido: se compara cada mensaje entrante con una lista de referencia de casos conocidos mediante distancia coseno.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el model-index de la model card (campo `verified: false`, es decir, no verificados de forma independiente). La informacion proporcionada esta truncada, por lo que la lista de tareas es parcial.

| Tarea | Dataset MTEB | Metrica | Valor |
|---|---|---|---|
| Clasificacion | AmazonCounterfactualClassification (en) | accuracy | 73,01 |
| Clasificacion | AmazonCounterfactualClassification (en) | average precision | 35,05 |
| Clasificacion | AmazonCounterfactualClassification (en) | f1 | 66,71 |
| Clasificacion | AmazonPolarityClassification | accuracy | 93,97 |
| Clasificacion | AmazonPolarityClassification | average precision | 90,60 |
| Clasificacion | AmazonPolarityClassification | f1 | 93,96 |
| Clasificacion | AmazonReviewsClassification (en) | accuracy | 54,20 |
| Clasificacion | AmazonReviewsClassification (en) | f1 | 53,80 |
| Clasificacion | Banking77Classification | accuracy | 87,33 |
| Clasificacion | Banking77Classification | f1 | 87,29 |
| Retrieval | ArguAna | map@10 | 64,30 |
| Retrieval | ArguAna | ndcg@10 | 72,11 |
| Retrieval | ArguAna | mrr@10 | 64,66 |
| Retrieval | ArguAna | recall@100 | 99,64 |
| Retrieval | CQADupstackAndroidRetrieval | map@10 | 44,45 |
| Clustering | ArxivClusteringP2P | v-measure | 48,47 |
| Clustering | ArxivClusteringS2S | v-measure | 43,39 |
| Clustering | BiorxivClusteringP2P | v-measure | 40,58 |
| Clustering | BiorxivClusteringS2S | v-measure | 37,94 |
| Reranking | AskUbuntuDupQuestions | map | 63,13 |
| Reranking | AskUbuntuDupQuestions | mrr | 75,93 |
| STS | BIOSSES | cosine Spearman | 85,39 |
| STS | BIOSSES | cosine Pearson | 87,85 |
| STS | BIOSSES | Manhattan Spearman | 85,12 |

La puntuacion agregada de MTEB para este modelo no se incluye en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,7 GB solo para pesos (434 M de parametros), mas activaciones y cache. Cabe sobradamente en cualquier GPU consumer.
- VRAM estimada en fp16/bf16: aproximadamente 0,87 GB de pesos. En int8, alrededor de 0,43 GB.
- GPU recomendadas para produccion con alta concurrencia: A100, H100, L40S o L4. Para desarrollo y volumen bajo, cualquier RTX 3060 de 12 GB en adelante es suficiente; tambien una RTX 4090 permite lotes grandes por su ancho de banda de memoria.
- CPU: viable para inferencia por lotes pequenos; el repositorio incluye ONNX, lo que permite ejecucion optimizada con ONNX Runtime sin GPU.
- Navegador: soportado via transformers.js (etiqueta del repositorio), con lo que puede ejecutarse en cliente mediante WebGPU o WASM.
- Opciones de despliegue: sentence-transformers, transformers (AutoModel/AutoTokenizer), ONNX Runtime, transformers.js, Hugging Face Text Embeddings Inference (TEI). La integracion con almacenes vectoriales (FAISS, Qdrant, Milvus, pgvector) se hace a traves de la salida de embeddings.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados comparativos con otros modelos. La tabla siguiente recoge unicamente los datos conocidos de este modelo y las referencias habituales de la categoria, marcando como no disponible todo aquello que no se ha podido confirmar en la informacion suministrada.

| Modelo | Parametros | Contexto | Idiomas | Licencia | MTEB agregado |
|---|---|---|---|---|---|
| gte-large-en-v1.5 | 434.139.136 | No disponible (la familia documenta 8192) | en | apache-2.0 | No disponible |
| BAAI/bge-large-en-v1.5 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | en | No disponible en la informacion proporcionada | No disponible |
| intfloat/e5-large-v2 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | en | No disponible en la informacion proporcionada | No disponible |

Criterio de eleccion practico: gte-large-en-v1.5 es una opcion razonable cuando el pipeline es en ingles, la licencia Apache-2.0 es un requisito y se necesita compatibilidad con ONNX o transformers.js. Si se requiere multilingue, habria que recurrir a la variante mGTE de la misma familia, no cubierta en esta ficha.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado exclusivamente para ingles. Su uso con texto en castellano degradara la calidad de los embeddings sin garantia alguna de rendimiento.
- No es generativo: no produce texto, no responde preguntas por si mismo y no soporta tool calling ni flujos de agente.
- Los resultados de benchmarks mostrados estan declarados por el autor con `verified: false`; no han sido validados de forma independiente y deben tratarse como orientativos.
- Riesgo de sesgo: al entrenarse sobre corpus web a gran escala (entre ellos allenai/c4), puede heredar sesgos de representacion de genero, raza, nacionalidad o religion, que se manifestarian en tareas de clasificacion o en la recuperacion de candidatos.
- Alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en similitud, es decir, recuperar documentos que el modelo considera cercanos sin serlo. La verificacion de relevancia sigue siendo necesaria en un pipeline RAG.
- Longitud de contexto: si el contexto real fuese inferior a la longitud de los documentos a indexar, el contenido se truncaria silenciosamente y se perderia informacion. Conviene trocear los documentos en fragmentos antes de generar embeddings.
- Sensibilidad al dominio: las puntuaciones declaradas corresponden a dominios concretos (resenas de Amazon, banca, preguntas tecnicas). El rendimiento en dominios muy especializados (juridico, biomedico, codigo) puede ser inferior y requiere evaluacion propia.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, siempre conservando el aviso de licencia y el archivo de atribucion. No se han declarado restricciones adicionales, pero conviene revisar la model card original antes de un despliegue en produccion.
- Compatibilidad: el repositorio esta vinculado a la libreria transformers; versiones antiguas de sentence-transformers pueden requerir configuracion adicional de pooling y normalizacion.
- El repositorio ocupa 6,0 GB, mayor que el peso de los parametros, debido a los multiples formatos (safetensors y ONNX) incluidos.

## Enlaces

- HuggingFace: https://huggingface.co/alibaba-nlp-community/gte-large-en-v1.5
- Paper de GTE (multi-stage contrastive learning): https://arxiv.org/abs/2308.03281
- Paper de mGTE (representaciones de contexto largo y reranking): https://arxiv.org/abs/2407.19669
- Dataset allenai/c4: https://huggingface.co/datasets/allenai/c4

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo. Los unicos enlaces recuperados corresponden a la plataforma de comercio electronico Alibaba.com y a AliExpress, sin relacion con el proyecto GTE ni con alibaba-nlp-community, por lo que se han descartado.
