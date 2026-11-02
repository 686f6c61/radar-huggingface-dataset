# sentence-transformers/merged-mpnet-base

## Resumen

merged-mpnet-base es un modelo de embeddings de frases (sentence transformer) publicado por el equipo de sentence-transformers. Se obtiene mediante una fusión lineal 50/50 de los pesos de dos modelos previos de la misma familia: all-mpnet-base-v2, orientado a similitud semántica general, y multi-qa-mpnet-base-cos-v1, especializado en recuperación de pasajes para pregunta-respuesta. El resultado es un encoder MPNet que proyecta frases y párrafos a vectores densos de 768 dimensiones, con una longitud máxima de secuencia de 512 tokens y similitud coseno.

El modelo no introduce arquitectura nueva ni entrenamiento adicional: es un merge de pesos en fp32 con pesos iguales, aprovechando que ambos progenitores comparten el backbone MPNet y las mismas capas de pooling (mean pooling) y normalización L2. Su relevancia radica en que, sin coste de entrenamiento, supera la media de sus dos modelos padre en 10 de los 13 conjuntos de NanoBEIR y mejora a ambos en 5 de ellos, con un nDCG@10 medio de 0,5823 frente a 0,5749 y 0,5712 respectivamente.

Es un modelo exclusivamente en inglés, pensado para búsqueda semántica, clustering y recuperación densa en pipelines RAG o motores de búsqueda vectorial. Su tamaño compacto (109,5 millones de parámetros, ~0,4 GB en el repositorio) lo hace desplegable en CPU y en GPUs de consumo, aunque su licencia no está declarada de forma unívoca y conviene revisarla antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentenceTransformer con backbone MPNetModel (transformer encoder) + mean pooling + normalización L2 |
| Parametros totales | 109.486.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors en fp32; admite cuantización estándar vía herramientas externas, sin datos publicados) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (la model card indica Apache-2.0 para all-mpnet-base-v2 y ausencia de licencia declarada en multi-qa-mpnet-base-cos-v1) |
| Formato de pesos | safetensors |
| Dimension de embedding | 768 |
| Funcion de similitud | coseno |
| Modalidad | texto |

## Arquitectura y entrenamiento

La arquitectura es un SentenceTransformer compuesto por tres módulos encadenados: un Transformer MPNetModel configurado para feature-extraction que devuelve el `last_hidden_state`; una capa de Pooling con dimensión de embedding 768, modo mean y `include_prompt` activado; y una capa de Normalize que aplica normalización L2 sobre el vector de frase. La similitud se calcula por producto escalar de vectores normalizados, equivalente a similitud coseno.

No hay entrenamiento en sentido estricto. El modelo se genera fusionando el backbone MPNet completo en fp32 con pesos iguales (50/50) a partir de all-mpnet-base-v2 y multi-qa-mpnet-base-cos-v1, usando el método `SentenceTransformer.merge` de la librería sentence-transformers. Ambos progenitores comparten pooling y normalización, de modo que la fusión solo afecta a los pesos del encoder. No se aplicó fine-tuning posterior, ni RLHF, ni DPO. La longitud máxima de entrada se mantiene en 512 tokens y no se añadieron prompts de consulta o documento (ambos vacíos en la evaluación).

## Capacidades

- Generación de embeddings de frases y párrafos de 768 dimensiones para similitud semántica.
- Codificación diferenciada de consultas y documentos mediante `encode_query` y `encode_document`.
- Recuperación densa (dense retrieval) sobre corpus de hasta 512 tokens por pasaje.
- Búsqueda semántica y ranking por similitud coseno.
- Clustering y deduplicación de textos por proximidad vectorial.
- Detección de paráfrasis y similitud entre pares de frases.
- No soporta tool calling ni function calling: es un encoder, no un modelo generativo.
- No soporta razonamiento multi-paso ni modo thinking.
- No tiene capacidades multimodales (solo texto), ni visión, ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar fragmentos de hasta 512 tokens con `encode_document` y consultar con `encode_query`; el modelo está optimizado para inglés y ofrece un nDCG@10 medio de 0,5823 en NanoBEIR, adecuado para corpus de tamaño pequeño y medio.
- Recuperación aumentada por generación (RAG): usar los embeddings como capa de retrieval en un pipeline que alimente a un LLM generativo; su fortaleza en datasets tipo QA (nq 0,665, hotpotqa 0,639) lo hace apropiado para bases de conocimiento en inglés.
- Motor de preguntas frecuentes: emparejar preguntas de usuarios con respuestas canónicas mediante similitud coseno, con latencia baja por el tamaño reducido del modelo (109 M de parámetros).
- Deduplicación y clustering de tickets de soporte: agrupar incidencias por similitud semántica para enrutarlas a colas especializadas, aprovechando la codificación de frases cortas.
- Filtrado de contenido y detección de duplicados en ingesta de datos: comparar documentos entrantes contra un corpus de referencia para descartar repetidos.
- Evaluación de similitud entre pares de frases en tareas de anotación o control de calidad de traducciones (solo en inglés).
- Búsqueda en bases de datos vectoriales (FAISS, Qdrant, Milvus, pgvector): el formato safetensors y la salida de 768 dimensiones facilitan la integración con índices HNSW.

## Benchmarks y rendimiento

Evaluación en NanoBEIR-en con 13 datasets, nDCG@10, longitud máxima 512 tokens, prompts vacíos, similitud coseno, inferencia FP32 con atención eager. La media es no ponderada.

| Dataset | merged-mpnet-base | all-mpnet-base-v2 | multi-qa-mpnet-base-cos-v1 |
|---|---|---|---|
| msmarco | 0,609863 | 0,634465 | 0,654148 |
| nq | 0,665488 | 0,671772 | 0,662020 |
| fiqa2018 | 0,588147 | 0,583997 | 0,582674 |
| nfcorpus | 0,333769 | 0,315611 | 0,313411 |
| scidocs | 0,404500 | 0,454587 | 0,338733 |
| arguana | 0,572705 | 0,529703 | 0,557431 |
| dbpedia | 0,537960 | 0,538413 | 0,555685 |
| quoraretrieval | 0,919392 | 0,921402 | 0,908255 |
| touche2020 | 0,483061 | 0,487039 | 0,450271 |
| climatefever | 0,310998 | 0,243224 | 0,333320 |
| fever | 0,764325 | 0,763131 | 0,745699 |
| hotpotqa | 0,638921 | 0,626516 | 0,642700 |
| scifact | 0,741368 | 0,703311 | 0,680758 |
| **media** | **0,582346** | **0,574859** | **0,571162** |

En los nueve datasets evaluados tras la selección de candidatos, el merge obtiene 0,5517 frente a 0,5422 y 0,5384 de sus progenitores. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, ya que el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB para los pesos (109,5 M de parámetros × 4 bytes) más activaciones, en torno a 0,6-1 GB según batch y longitud de secuencia.
- En fp16: aproximadamente 0,22 GB de pesos; en int8: ~0,11 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo y también en CPU: es viable en portátiles sin GPU dedicada para cargas moderadas.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI), y exportación a ONNX para inferencia en CPU; el tag `endpoints_compatible` indica compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no se han publicado medidas concretas en la información disponible; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dim. embedding | nDCG@10 medio (NanoBEIR) | Licencia |
|---|---|---|---|---|---|
| merged-mpnet-base | 109,5 M | 512 | 768 | 0,5823 | no disponible |
| all-mpnet-base-v2 | 109,5 M | 512 | 768 | 0,5749 | Apache-2.0 (según model card) |
| multi-qa-mpnet-base-cos-v1 | 109,5 M | 512 | 768 | 0,5712 | no declarada |

Los tres modelos comparten backbone MPNet, dimensionalidad y longitud de contexto; la diferencia está en el rendimiento de recuperación y en la claridad de la licencia. El merge mejora la media global, pero pierde frente a multi-qa-mpnet-base-cos-v1 en msmarco (0,610 frente a 0,654) y frente a all-mpnet-base-v2 en scidocs (0,405 frente a 0,455), por lo que la elección depende del dominio objetivo.

## Limitaciones y advertencias

- Solo inglés: no soporta consultas ni documentos en castellano u otros idiomas.
- Límite de 512 tokens por entrada; textos más largos deben fragmentarse, lo que puede perder contexto en documentos extensos.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling.
- Licencia ambigua: la model card señala Apache-2.0 para all-mpnet-base-v2 pero no declara licencia para multi-qa-mpnet-base-cos-v1; el uso comercial del merge requiere verificación legal previa.
- Riesgo de sesgos heredados de los corpus de entrenamiento de los progenitores (MS MARCO, NQ, entre otros), no documentados en la información disponible.
- Rendimiento inferior a los progenitores en dominios específicos como msmarco y scidocs; conviene evaluar en el corpus concreto antes de adoptarlo.
- Sin entrenamiento adicional tras el merge: no incorpora mejoras específicas de dominio ni instrucciones.
- El repositorio no declara cuantizaciones oficiales; cualquier cuantización es responsabilidad del usuario.
- Sin métricas publicadas de latencia ni throughput en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sentence-transformers/merged-mpnet-base
- Modelo padre all-mpnet-base-v2: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Modelo padre multi-qa-mpnet-base-cos-v1: https://huggingface.co/sentence-transformers/multi-qa-mpnet-base-cos-v1
- Dataset NanoBEIR-en: https://huggingface.co/datasets/sentence-transformers/NanoBEIR-en
- Documentación de Sentence Transformers: https://sbert.net
- Guía de uso de SentenceTransformer: https://www.sbert.net/docs/sentence_transformer/usage/usage.html
- Referencia de `SentenceTransformer.merge`: https://www.sbert.net/docs/package_reference/sentence_transformer/model.html#sentence_transformers.sentence_transformer.model.SentenceTransformer.merge
- Repositorio en GitHub: https://github.com/huggingface/sentence-transformers
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
