# dynasty-ai/tiny-embed-61m

## Resumen

`tiny-embed-61m` es un modelo de embeddings de texto denso (bi-encoder) desarrollado por dynasty-ai, especializado en chino simplificado. Con 61,4 millones de parámetros en el backbone y una cabeza de proyección de 393.216 parámetros, genera vectores de 768 dimensiones a partir de textos de hasta 512 tokens. Su propuesta de valor es clara: ofrecer una calidad de recuperación cercana a `bge-base-zh-v1.5` (102M parámetros) con un coste computacional notablemente inferior, lo que lo hace viable en CPU o en una única GPU de consumo.

El modelo se ha destilado a partir de `thenlper/gte-base-zh` manteniendo las 768 dimensiones nativas del profesor, de modo que estudiante y profesor comparten el mismo espacio de embeddings sin reducción dimensional. La arquitectura sigue un pipeline puro de `sentence-transformers`: transformer de 12 capas con hidden size de 512, pooling por media, normalización L2, una capa densa lineal de 512 a 768 sin sesgo y una segunda normalización L2.

Es relevante ahora porque los embeddings compactos y multilingües (aquí, específicamente en chino) son la base de prácticamente cualquier sistema RAG, motor de búsqueda semántica o pipeline de clasificación. Un modelo de 61M que se acerca a alternativas del doble de tamaño reduce costes de indexación y latencia en producción, y su licencia Apache 2.0 facilita la adopción comercial sin fricción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (bi-encoder) con pooling por media y cabeza de proyección lineal |
| Parametros totales | 61.425.664 (backbone) + 393.216 (cabeza de proyección) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (el autor solo menciona soporte de fp16 y bf16) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / PyTorch (repo de 0,2 GB); no se menciona GGUF |

Otros datos tecnicos: dimension de embedding de 768, hidden size del backbone de 512, 12 capas, 8 cabezas de atencion, tokenizador BERT chino con 21.128 tokens, similitud coseno (embeddings normalizados L2).

## Arquitectura y entrenamiento

El modelo es un bi-encoder transformer denso de 12 capas y 512 dimensiones ocultas, con 8 cabezas de atencion y un vocabulario BERT chino de 21.128 tokens. El pipeline de inferencia es `Transformer → Pooling(mean) → Normalize → Dense(512→768) → Normalize`. La cabeza densa de 512 a 768 es lineal, sin sesgo y con activacion identidad; forma parte del modelo entrenado y no es un paso de post-procesado opcional. Cargar solo el backbone produce embeddings de 512 dimensiones que no reproducen las puntuaciones publicadas.

El entrenamiento se basa en destilacion desde `thenlper/gte-base-zh` en sus 768 dimensiones nativas. Los datos de entrenamiento son corpus chinos de retrieval, STS e instrucciones: webqa, cmedqa, chinese_agriculture_qa, pawsx, wiki_zh, fineweb_edu_zh, clean_passages y alpaca_zh, ademas de consultas sintetizadas. El autor declara explicitamente que las tareas `PAWSX`, `CmedqaRetrieval`, `CMedQAv1-reranking` y `CMedQAv2-reranking` comparten corpus con los datos de entrenamiento, mientras que `T2Retrieval`, `T2Reranking`, `DuRetrieval`, `ATEC`, `BQ`, `LCQMC` y `STSB` fueron excluidas del entrenamiento para evaluarse en zero-shot. No se menciona uso de RLHF ni DPO, algo esperable en un modelo de embeddings.

## Capacidades

- Generacion de embeddings de texto denso para similitud semantica y recuperacion de informacion.
- Busqueda semantica y retrieval query-to-passage sin necesidad de prefijo de instruccion en ningun lado.
- Clustering de documentos y agrupacion semantica por similitud coseno.
- Clasificacion de texto mediante embeddings como features de entrada a clasificadores.
- Reranking de candidatos recuperados previamente.
- Sentence similarity (STS) para comparar pares de frases.
- Soporte de precision fp16 y bf16 para inferencia acelerada.
- Compatible con `text-embeddings-inference` para despliegue como servidor de embeddings.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un encoder de embeddings.

## Casos de uso

- Motor de busqueda semantica en aplicaciones chinas: indexar un corpus de documentos con embeddings de 768 dimensiones y recuperar por similitud coseno. El modelo esta optimizado para query-to-passage sin instrucciones, lo que simplifica el pipeline.
- RAG (retrieval-augmented generation) sobre documentacion en chino: usar el modelo como retriever para alimentar un LLM generativo con pasajes relevantes. Su tamano de 61M permite indexar grandes volumenes con coste bajo.
- Clasificacion de tickets o correos: generar embeddings y entrenar un clasificador ligero encima; la ventana de 512 tokens cubre la mayoria de mensajes de soporte.
- Deduplicacion y clustering de articulos: agrupar noticias o registros por similitud semantica para detectar duplicados o organizar contenido.
- Busqueda en dominios especializados (medico, agricola): el entrenamiento incluye cmedqa y chinese_agriculture_qa, lo que aporta vocabulario y patrones de esos dominios.
- Despliegue en CPU o GPU de consumo: al caber en hardware modesto, es adecuado para entornos edge, CI/CD o servicios con presupuesto limitado que necesitan embeddings en tiempo real.
- Filtrado previo en pipelines de recomendacion: calcular similitud entre el perfil del usuario y el catalogo de items con latencia baja.

## Benchmarks y rendimiento

Evaluacion en `MTEB(cmn, v1)` con 31 tareas, sin prefijo de instruccion, similitud coseno, usando `mteb` 1.39.7. La tabla de la model card quedo truncada en la informacion proporcionada; solo se dispone de la media global y las medias de los modelos comparados.

| Modelo | Dimension | Media |
|---|---|---|
| `tiny-embed-61m` | 768 | 0,6058 |
| `bge-small-zh-v1.5` | 512 | 0,5734 |
| `bge-base-zh-v1.5` | 768 | 0,6270 |

El desglose por grupo de tareas (Retrieval, Reranking, Clustering, Classification, PairClassification, STS) no esta disponible en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 0,25 GB de pesos (61,4M parametros); en fp16/bf16, aproximadamente 0,12 GB. Con overhead de activaciones y batch, el consumo real es de menos de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 4090, A100 o H100 estan sobredimensionadas para un solo modelo, pero permiten batches muy grandes y alto throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, etc.). Tambien funciona en CPU.
- Opciones de despliegue: `sentence-transformers` (ruta recomendada), `transformers` con pooling y cabeza manuales, y `text-embeddings-inference` (etiqueta presente en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera latencia de milisegundos por batch en GPU y throughput alto incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Media MTEB(cmn, v1) | Licencia |
|---|---|---|---|---|---|
| `tiny-embed-61m` | 61,4M | 768 | 512 | 0,6058 | Apache 2.0 |
| `bge-small-zh-v1.5` | 24M (no confirmado en la info) | 512 | no disponible | 0,5734 | no disponible en la info |
| `bge-base-zh-v1.5` | 102M | 768 | no disponible | 0,6270 | no disponible en la info |

`tiny-embed-61m` supera a `bge-small-zh-v1.5` en 0,0324 puntos y queda 0,0212 por debajo de `bge-base-zh-v1.5`, con un tamano intermedio entre ambos. La comparacion de licencias y contexto de los modelos BGE no esta en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta chino; no es multilingue y su rendimiento en otros idiomas no esta evaluado.
- Ventana de contexto de 512 tokens: textos mas largos se truncan, lo que puede degradar la recuperacion de pasajes extensos.
- Riesgo de alucinacion no aplica directamente (es un encoder, no genera texto), pero los embeddings pueden producir similitudes espurias en dominios fuera de su distribucion de entrenamiento.
- Solapamiento declarado con benchmarks: `PAWSX`, `CmedqaRetrieval`, `CMedQAv1-reranking` y `CMedQAv2-reranking` comparten corpus con el entrenamiento, por lo que sus puntuaciones no son zero-shot. Las tareas excluidas (`T2Retrieval`, `T2Reranking`, `DuRetrieval`, `ATEC`, `BQ`, `LCQMC`, `STSB`) si son zero-shot.
- Es obligatorio usar `trust_remote_code=True`: el backbone se distribuye como `tiny_st_module.py` dentro del repositorio, lo que implica ejecutar codigo del autor.
- Es obligatorio conservar el modulo `3_Dense`; omitirlo produce embeddings de 512 dimensiones que no reproducen los resultados publicados.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los corpus de entrenamiento subyacentes.
- Sin datos publicados de latencia, throughput ni cuantizacion; para produccion habria que medir en el hardware objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/dynasty-ai/tiny-embed-61m
- Modelo profesor (gte-base-zh): https://huggingface.co/thenlper/gte-base-zh
- MTEB (benchmark): https://github.com/embeddings-benchmark/mteb
- sentence-transformers: https://www.sbert.net/
- text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
