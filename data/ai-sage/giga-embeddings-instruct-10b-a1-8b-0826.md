# ai-sage/Giga-Embeddings-instruct-10B-A1.8B-0826

## Resumen

Giga-Embeddings-instruct-10B-A1.8B-0826 es un modelo de embeddings de texto desarrollado por ai-sage, basado en la arquitectura DeepSeek-V3 adaptada a atención bidireccional (encoder-style). Está diseñado para tareas de retrieval, similitud semántica, clasificación y clustering, con un rendimiento destacado en ruso e inglés. El modelo emplea Multi-head Latent Attention (MLA) y una mezcla de expertos (MoE) con 64 expertos enrutados y 4 activos por token, lo que permite mantener un coste computacional relativamente bajo (≈1.8B parámetros activos) a pesar de sus ~10B parámetros totales.

El modelo fue entrenado con una función de pérdida contrastiva InfoNCE y sigue un estilo instructivo: para tareas asimétricas (retrieval) se debe añadir una instrucción al query, mientras que los documentos se codifican sin instrucción. Los embeddings se obtienen mediante mean pooling sobre tokens no padding y L2-normalización, y se comparan con coseno (producto escalar de vectores normalizados). Es relevante ahora por ser una alternativa abierta (licencia MIT) y bilingüe (ruso/inglés) con resultados competitivos en MTEB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V3 (MLA + MoE) con atención bidireccional, 26 capas, hidden 1536, 32 cabezas de atención |
| Parametros totales | 10.475.534.400 (~10B) |
| Parametros activos | ≈1.8B (4 de 64 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (safetensors) |
| Idiomas soportados | ruso, inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeepSeek-V3, con 26 capas, dimensión oculta 1536, 32 cabezales de atención y Multi-head Latent Attention (MLA) con parámetros `kv_lora_rank=512`, `qk_nope_head_dim=128`, `qk_rope_head_dim=64` y `v_head_dim=192`. La atención se ha convertido en bidireccional (estilo encoder), a diferencia de la variante causal original. La parte MoE cuenta con 64 expertos enrutados, de los cuales 4 se activan por token, más un experto compartido. El modelo se entrenó con una función de pérdida contrastiva InfoNCE, siguiendo un esquema de instrucciones: para retrieval y tareas asimétricas se añade una instrucción al query, mientras que los documentos se codifican tal cual. Los embeddings finales se obtienen con mean pooling sobre tokens no padding y posterior L2-normalización; el uso de CLS o last-token pooling no es válido. El modelo se distribuye en pesos bfloat16.

## Capacidades

- Generación de embeddings densos de frases y párrafos para retrieval, similitud semántica, clasificación y clustering.
- Soporte de instrucciones (instruct-style): permite adaptar el modelo a tareas asimétricas (retrieval) mediante un prefijo de instrucción en el query.
- Bilingüe: entrenado específicamente para ruso e inglés.
- Compatible con la librería `sentence-transformers` y con vLLM para despliegue en producción.
- No es generativo: es un modelo encoder-style, por lo que no produce texto, solo representaciones vectoriales.

## Casos de uso

- Búsqueda semántica en ruso e inglés: el modelo permite indexar documentos y buscar por similitud cosilitud, añadiendo una instrucción al query para tareas de retrieval.
- Sistemas de RAG (Retrieval-Augmented Generation): se puede integrar como retriever para recuperar pasajes relevantes antes de la generación, gracias a su capacidad de producir embeddings normalizados de alta calidad.
- Deduplicación de documentos: para detectar duplicados o casi duplicados en grandes colecciones, usando similitud coseno entre embeddings de párrafos.
- Clasificación de texto: los embeddings pueden alimentar clasificadores simples (regresión logística, SVM) para tareas de categorización en ruso e inglés.
- Clustering de documentos: agrupación de textos por temas o dominios mediante algoritmos como k-means sobre los vectores normalizados.
- Sistemas de recomendación basados en contenido: representar ítems (artículos, productos) y usuarios mediante embeddings para recomendar por similitud.
- Moderación o filtrado de contenido: clasificar textos tóxicos o inapropiados en ruso e inglés usando embeddings y un clasificador posterior.

## Benchmarks y rendimiento

Los datos de benchmarks extraídos de la model card se presentan a continuación. No se dispone de resultados completos para el benchmark de código (MTEB code) en la información proporcionada.

| Benchmark | Giga-Embeddings-instruct-3B-0826 | Giga-Embeddings-instruct-10B-A1.8B-0826 |
|---|---|---|
| MTEB (ruso) | 74.57 | 74.99 |
| MTEB (inglés) | 71.93 | 72.23 |
| MTEB (código) | no disponible | no disponible |

La versión 10B supera a la 3B en ambos idiomas, con una mejora de +0.42 puntos en ruso y +0.30 en inglés.

## Requisitos de hardware

- Pesos en bfloat16: ~21 GB (10.475 millones de parámetros × 2 bytes por parámetro).
- VRAM estimada para inferencia: al menos 24 GB para cargar el modelo en bfloat16 sin cuantización; con cuantización de 8 bits podría reducirse a ~12 GB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, o GPUs consumer de 24 GB como RTX 3090/4090 para inferencia en bfloat16.
- En GPUs consumer de 16 GB (RTX 4080, 3080) sería necesario cuantización o despliegue con offloading.
- Opciones de despliegue: `sentence-transformers` (con `SentenceTransformer`), `transformers` directamente (implementando mean pooling y L2-normalización), y vLLM para servir embeddings a escala.
- Latencia y throughput: no se han publicado datos concretos; dependerá del hardware y del uso de batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | MTEB (rus) | MTEB (eng) | Licencia |
|---|---|---|---|---|---|---|
| Giga-Embeddings-instruct-3B-0826 | ~3B | ~3B | 4096 (según búsqueda web) | 74.57 | 71.93 | MIT |
| Giga-Embeddings-instruct-10B-A1.8B-0826 | ~10B | ~1.8B | no disponible | 74.99 | 72.23 | MIT |

No se dispone de datos comparativos con otros modelos de embeddings bilingües (p. ej., multilingual-e5, BGE-M3) en la información proporcionada.

## Limitaciones y advertencias

- Soporte únicamente para ruso e inglés; no cubre otros idiomas.
- Requiere el uso obligatorio de mean pooling + L2-normalización; cualquier otro pooling (CLS, last-token) produce resultados incorrectos.
- Para tareas de retrieval asimétrico es necesario añadir una instrucción al query; no hacerlo degrada el rendimiento.
- Longitud de contexto no especificada en la model card; se desconoce si soporta más de 4096 tokens (valor citado para la versión 3B en fuentes externas).
- El modelo es de gran tamaño (~10B), lo que exige hardware con suficiente VRAM; no es adecuado para entornos con GPU limitada sin cuantización.
- Al ser un modelo de embeddings (no generativo), no presenta riesgo de alucinación textual, pero sí puede producir representaciones sesgadas si el corpus de entrenamiento contiene sesgos.
- La licencia MIT permite uso comercial y modificación, pero se recomienda verificar los términos de uso del modelo base (GigaChat) del que deriva.

## Enlaces

- Hugging Face: https://huggingface.co/ai-sage/Giga-Embeddings-instruct-10B-A1.8B-0826
- Repositorio de la serie Giga-Embeddings-instruct: https://huggingface.co/ai-sage/Giga-Embeddings-instruct
- Página de overview en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/giga-embeddings-instruct-ai-sage
