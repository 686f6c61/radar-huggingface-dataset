# dynasty-ai/tiny-embed-27m

## Resumen

`tiny-embed-27m` es un modelo de embeddings de texto denso (bi-encoder) desarrollado por dynasty-ai, especializado en chino simplificado y disenado para tareas de recuperacion, similitud semantica, clasificacion y clustering. Con 27,6 millones de parametros y una dimension de salida de 512, se posiciona como una alternativa compacta y de baja latencia frente a modelos de embeddings mas grandes, manteniendo un rendimiento competitivo en el benchmark MTEB chino.

El modelo se ha destilado a partir de un "vector soup" de tres profesores: `BAAI/bge-small-zh-v1.5`, `BAAI/bge-base-zh-v1.5` y `thenlper/gte-base-zh`. Su arquitectura destaca por un backbone recursivo: solo 4 capas unicas que se aplican 16 veces con pesos compartidos, lo que reduce drasticamente el numero de parametros manteniendo una profundidad efectiva de 16 capas. El resultado es un modelo que cabe en cualquier GPU consumer y que ofrece latencia muy baja en inferencia.

La relevancia actual del modelo radica en su relacion calidad/tamano: con solo 27,6M de parametros supera a `bge-small-zh-v1.5` (24M) en todas las categorias de MTEB chino, y se acerca a `bge-base-zh-v1.5` (102M, 3,7 veces mas grande) a costa de una perdida concentrada en recuperacion. Esta pensado para despliegues a gran escala donde el coste por embedding y la latencia son criticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder denso con profundidad recursiva (4 capas unicas repetidas 16 veces, pesos compartidos) |
| Parametros totales | 27.599.872 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp16 y bf16 soportados; no se documentan otras cuantizaciones (GGUF, int8, etc.) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / PyTorch (repo de 0,1 GB); backbone en `tiny_st_module.py` con `trust_remote_code=True` |

Otros datos tecnicos: dimension de embedding 512, hidden size 512, 8 cabezas de atencion, pooling mean + normalizacion L2, similitud coseno, tokenizer BERT chino con 21.128 tokens.

## Arquitectura y entrenamiento

El modelo es un bi-encoder transformer con una innovacion estructural clave: el backbone consta de 4 capas unicas que se aplican de forma recursiva 16 veces compartiendo pesos. Esto reduce el recuento de parametros a 27,6M mientras mantiene una profundidad efectiva de 16 capas, lo que se traduce en latencia de inferencia baja. El pipeline es exactamente `Transformer → Pooling(mean) → Normalize`, sin capa de proyeccion adicional (a diferencia de `tiny-embed-61m`), por lo que el vector de 512 dimensiones tras mean-pooling es el embedding final. No requiere prefijo de instruccion ni para queries ni para pasajes.

El entrenamiento se basa en destilacion desde un "vector soup" de tres profesores: `BAAI/bge-small-zh-v1.5`, `BAAI/bge-base-zh-v1.5` y `thenlper/gte-base-zh` (todos con licencia MIT). Los datos de entrenamiento son corpus chinos de recuperacion, STS e instrucciones: webqa, cmedqa, chinese_agriculture_qa, pawsx, wiki_zh, fineweb_edu_zh, clean_passages, alpaca_zh, mas queries sintetizadas. El autor declara explicitamente en los metadatos de MTEB que los corpus de `PAWSX`, `CmedqaRetrieval`, `CMedQAv1-reranking` y `CMedQAv2-reranking` aparecen en los datos de entrenamiento, mientras que `T2Retrieval`, `T2Reranking`, `DuRetrieval`, `ATEC`, `BQ`, `LCQMC` y `STSB` fueron excluidos para evaluacion zero-shot.

## Capacidades

- Generacion de embeddings de texto denso de 512 dimensiones para chino simplificado.
- Similitud semantica entre frases y pasajes mediante coseno (embeddings normalizados L2).
- Recuperacion de informacion (retrieval) query-pasaje sin instruccion ni prefijo.
- Clustering y clasificacion de textos a partir de sus embeddings.
- Reranking de candidatos en pipelines de busqueda.
- Pair classification (deteccion de pares semanticamente equivalentes).
- Soporte de inferencia en fp16 y bf16.
- Compatible con `sentence-transformers`, `transformers` y `text-embeddings-inference` (tag de la model card).
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en produccion sobre corpus chinos: el modelo genera embeddings de 512 dimensiones para queries y pasajes con la misma funcion de encoding, permitiendo indexar millones de documentos en bases vectoriales (FAISS, Qdrant, Milvus) con un coste de almacenamiento reducido (512 floats por documento) y latencia de consulta muy baja gracias a sus 27,6M de parametros.
- Recuperacion aumentada (RAG) para asistentes en chino: se usa como primer recuperador en pipelines RAG, donde su recall@10 de 89,56 en T2Ranking dev asegura que los pasajes relevantes lleguen al generador; su bajo coste permite desplegarlo en CPU o GPU pequenas junto al LLM generador.
- Deduplicacion y near-duplicate detection de contenido web en chino: comparando embeddings normalizados con umbral de coseno se detectan articulos, preguntas de foros o resenas casi identicas en grandes volumenes de datos, con throughput alto por el reducido tamano del modelo.
- Clustering de tickets de soporte o resenas de producto: agrupando embeddings con k-means o HDBSCAN se descubren temas recurrentes en feedback de usuarios chinos; la dimension 512 y el pooling mean facilitan el uso directo con librerias de clustering estandar.
- Moderacion y clasificacion de contenido: entrenando un clasificador ligero (regresion logistica o MLP) sobre los embeddings se puede etiquetar toxicidad, spam o categoria tematica sin necesidad de fine-tuning del encoder, aprovechando la representacion semantica preentrenada.
- Reranking de resultados de busqueda: en un pipeline de dos etapas, un recuperador BM25 o lexical obtiene candidatos y `tiny-embed-27m` los reordena por similitud semantica; su latencia permite rerankear decenas de candidatos por consulta en tiempo real.
- Busqueda en dominios especializados en chino (medico, agricola): el entrenamiento incluye corpus como cmedqa y chinese_agriculture_qa, lo que le da cobertura en vocabulario tecnico de esos dominios para asistentes de consulta especializada.

## Benchmarks y rendimiento

Resultados en `MTEB(cmn, v1)` (chino, 31 tareas, sin instruccion, similitud coseno, evaluado con `mteb` 1.39.7):

| Modelo | Dimension | Media | Retrieval (8) | Reranking (4) | Clustering (4) | Classification (9) | PairClassification (2) | STS (4) |
|---|---|---|---|---|---|---|---|---|
| **tiny-embed-27m** | **512** | **59,63** | 62,36 | 65,04 | 48,61 | 61,22 | 68,64 | 51,71 |
| bge-small-zh-v1.5 | 512 | 57,34 | 61,74 | 61,24 | 44,17 | 59,91 | 65,56 | 47,91 |
| m3e-small | no disponible | 52,75 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| bge-base-zh-v1.5 | 768 | 62,70 | 69,40 | 64,87 | 47,30 | 64,21 | 73,17 | 53,90 |

Detalle de recuperacion (T2Ranking dev, sin instruccion): recall@10 de 89,56. `T2Retrieval` es zero-shot para este modelo (corpus de T2Ranking excluido del entrenamiento).

Comparaciones declaradas por el autor: frente a `bge-small-zh-v1.5` (24M) mejora +2,29 puntos de media y gana en todos los grupos de tareas; frente a `bge-base-zh-v1.5` (102M, 3,7× parametros) pierde 3,07 puntos de media, con la brecha concentrada en retrieval (−7,04) y pair classification (−4,53).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp16 (27,6M parametros ≈ 55 MB de pesos, mas activaciones y overhead del runtime); en fp32, alrededor de 110 MB de pesos.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100, L4 o T4. En consumer, cualquier RTX (3060, 4060, 4090) o incluso iGPU.
- Cabe sobradamente en GPU consumer e incluso en CPU: es viable ejecutarlo en CPU para cargas moderadas o en GPUs integradas.
- Opciones de despliegue: `sentence-transformers`, `transformers` (con `trust_remote_code=True`), `text-embeddings-inference` (tag declarado en la model card). No se documentan integraciones con llama.cpp, Ollama ni vLLM para este checkpoint.
- Latencia y throughput: no se publican cifras concretas; el autor indica que la profundidad recursiva con pesos compartidos mantiene "latencia amigable para inferencia". El reducido tamano y el maximo de 512 tokens sugieren throughput alto, pero no hay numeros oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | MTEB(cmn, v1) media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tiny-embed-27m | 27,6M | 512 | 512 | 59,63 | Apache 2.0 | Hugging Face |
| bge-small-zh-v1.5 | 24M | 512 | 512 | 57,34 | MIT | Hugging Face |
| bge-base-zh-v1.5 | 102M | 768 | 512 | 62,70 | MIT | Hugging Face |
| m3e-small | no disponible | no disponible | no disponible | 52,75 | no disponible | Hugging Face |

El modelo ofrece la mejor relacion rendimiento/tamano del grupo comparado: supera a `bge-small-zh-v1.5` con solo un 15 % mas de parametros y se queda a 3 puntos de `bge-base-zh-v1.5` con un 73 % menos de parametros. La licencia Apache 2.0 es mas permisiva que la MIT de los BGE en cuanto a clausulas de patentes, lo que puede ser relevante para uso comercial.

## Limitaciones y advertencias

- Solo soporta chino (zh); no esta entrenado ni evaluado para otros idiomas, por lo que su uso en castellano u otras lenguas dara resultados pobres.
- Longitud maxima de 512 tokens: los documentos largos deben trocearse, lo que puede fragmentar contexto en recuperacion.
- No requiere instruccion, pero tampoco la soporta de forma nativa: anadir prefijos de instruccion puede degradar el rendimiento respecto al uso sin prefijo.
- Riesgo de sesgo: al entrenarse con corpus web chinos (wiki_zh, fineweb_edu_zh) y medicos/agricolas, puede heredar sesgos de esos datos; no se documenta ninguna mitigacion.
- Riesgo de alucinacion: no aplica directamente (no genera texto), pero los embeddings pueden producir similitudes espurias en dominios fuera de su distribucion de entrenamiento.
- Sobreajuste a benchmarks declarado: `PAWSX`, `CmedqaRetrieval`, `CMedQAv1-reranking` y `CMedQAv2-reranking` tienen corpus en el entrenamiento, por lo que sus puntuaciones no son comparables en zero-shot con modelos que no los vieron; las tareas zero-shot son `T2Retrieval`, `T2Reranking`, `DuRetrieval`, `ATEC`, `BQ`, `LCQMC` y `STSB`.
- Requiere `trust_remote_code=True` porque el backbone se distribuye como codigo Python (`tiny_st_module.py`) dentro del repositorio; esto implica ejecutar codigo del autor y conviene revisarlo antes de desplegar en produccion.
- Sin capa de proyeccion: la dimension queda fija en 512 y no se puede reducir sin reentrenar.
- No se publican cifras de latencia ni throughput; conviene medirlas en el hardware objetivo antes de dimensionar un despliegue.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha: es un checkpoint muy reciente (creado el 18 de noviembre de 2026), sin validacion comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/dynasty-ai/tiny-embed-27m
- Modelo profesor `BAAI/bge-small-zh-v1.5`: https://huggingface.co/BAAI/bge-small-zh-v1.5
- Modelo profesor `BAAI/bge-base-zh-v1.5`: https://huggingface.co/BAAI/bge-base-zh-v1.5
- Modelo profesor `thenlper/gte-base-zh`: https://huggingface.co/thenlper/gte-base-zh
- Libreria `sentence-transformers`: https://www.sbert.net/
- Benchmark MTEB: https://github.com/embeddings-benchmark/mteb
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
