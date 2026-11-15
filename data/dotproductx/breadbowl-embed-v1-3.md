# dotproductx/breadbowl-embed-v1.3

## Resumen

BreadBowl-Embed v1.3 es un modelo de embeddings para recuperación y reranking de pasajes desarrollado por dotproductx (BreadBowlAI), publicado como release de investigación. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-0.8B-Base (755.443.264 parámetros) que abandona el esquema clásico de embedding single-vector y adopta una representación multi-vector de interacción tardía: cada consulta y cada pasaje se codifican como 16 slots, cada uno compuesto por un vector de routing y un vector de valor.

La innovación central es que el mismo conjunto de vectores almacenados sirve tanto para la recuperación inicial como para el reranking posterior, sin necesidad de una segunda pasada por el backbone ni de un cross-encoder separado. El índice busca sobre los vectores de routing; la puntuación de relevancia final combina una componente de routing (QK, un late-interaction de tamaño fijo) con una componente de valor (QKV, 0,75 R + 0,25 V) leída directamente de los vectores de valor cacheados.

El modelo es relevante para pipelines de búsqueda documental que quieren eliminar la etapa de reranking con cross-encoder, a costa de almacenar 32 vectores por pasaje (frente a uno solo en los modelos single-vector) pero con un coste independiente de la longitud del pasaje, a diferencia de ColBERT. Es una release de investigación, entrenada exclusivamente para inglés y con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-0.8B-Base) con cabezas de embedding multi-vector de interacción tardía (16 slots routing + 16 slots value por texto) |
| Parametros totales | 755.443.264 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.5-0.8B-Base y le añade un mecanismo de slots aprendidos: 16 queries de slot hacen cross-attention sobre los estados de token para producir, por cada texto, 16 vectores de routing (normalizados L2) y 16 vectores de valor. La puntuación de routing R se calcula como la similitud coseno 16×16 entre slots de consulta y pasaje, aplicando un smooth maximum (log-mean-exp con temperatura 0,02) sobre los slots del pasaje para cada slot de consulta y promediando después sobre los 16 slots de consulta. La puntuación de valor V convierte la misma matriz de similitudes en atención (softmax con temperatura 0,1) sobre los vectores de valor crudos del pasaje, y mide el coseno entre esa lectura y el vector de valor del slot de consulta, promediado igualmente sobre 16 slots. La puntuación final QKV es 0,75·R + 0,25·V.

v1.3 continúa la línea de v1.2-preview (checkpoint del step 4000) con 1.024 updates adicionales, esta vez con el backbone de texto completamente descongelado (full fine-tune) y etiquetas procedentes de un cross-encoder teacher de mayor tamaño. La arquitectura, la regla de scoring y los límites de entrada se mantienen sin cambios respecto a v1.2-preview. Los datos de entrenamiento declarados incluyen lightonai/embeddings-pre-training-curated, lightonai/embeddings-fine-tuning, sentence-transformers/embedding-training-data, allenai/scirepeval y qiaojin/PubMedQA; no se especifica el número total de tokens ni la composición exacta del dataset. No consta el uso de RLHF o DPO.

## Capacidades

- Codificación de consultas y pasajes en 16 slots routing-value, con coste de almacenamiento fijo por pasaje (32 vectores) independientemente de la longitud del texto.
- Recuperación inicial (routing) y reranking (value readout) desde la misma representación cacheada, sin cross-encoder ni segunda pasada por el backbone.
- Puntuación de interacción tardía de tamaño fijo (late interaction con MaxSim suavizado vía log-mean-exp).
- Similitud semántica oración-oración (pipeline sentence-similarity).
- Recuperación de pasajes a gran escala: evaluado sobre el corpus completo de MS MARCO (8.841.823 pasajes).
- Recuperación en dominios científico y biomédico (datasets SciRepEval y PubMedQA en el entrenamiento).
- Solo inglés: no se declara soporte multilingüe.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni thinking mode; es un modelo de embeddings, no un modelo generativo de propósito general.

## Casos de uso

- Búsqueda documental a escala web: el modelo permite indexar 8,8 millones de pasajes con 16 vectores de routing por pasaje y recuperar candidatos por búsqueda vectorial, usando la misma representación para rerankear; elimina la necesidad de un cross-encoder separado en la segunda etapa.
- Reranking sin infraestructura adicional: en pipelines con restricciones de latencia, el reranking se ejecuta sobre vectores ya cacheados (value readout), evitando una pasada de backbone por cada par consulta-pasaje y reduciendo el coste de cómputo de la segunda etapa.
- RAG sobre bases de conocimiento internas: codificar una vez los documentos con slots de routing-value y servir consultas con QKV permite obtener rankings de mayor calidad que un single-vector sin duplicar el coste de almacenamiento por token, como ocurre con ColBERT.
- Búsqueda científica y biomédica: el entrenamiento incluye SciRepEval y PubMedQA, lo que lo hace adecuado para recuperación de literatura médica y abstracts, donde el vocabulario técnico exige interacción tardía entre tokens.
- Evaluación comparativa de recuperación: al usar el protocolo TREC DL 2019/2020 y MS MARCO con corpus completo, sirve como referencia reproducible en experimentos de retrieval académicos.
- Búsqueda en catálogos y FAQ: para corpus de tamaño medio (decenas de miles de pasajes) donde se quiere una etapa única de recuperación+reranking con scoring QKV y sin mantener dos modelos distintos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`). Todos sobre el corpus completo de MS MARCO de 8.841.823 pasajes, con slot-hit width 128.

| Dataset | nDCG@10 (QKV) | nDCG@10 (QK) | Recall@100 |
|---|---|---|---|
| MS MARCO passage dev (6.980 queries) | 41,71 | 39,30 | 84,46 (relevancia ≥ 1) |
| TREC DL 2019 passage (43 queries juzgadas) | 74,63 | 71,56 | 57,01 (relevancia ≥ 2) |
| TREC DL 2020 passage (54 queries juzgadas) | 73,14 | 68,73 | 63,71 (relevancia ≥ 2) |

La componente QKV (0,75 routing + 0,25 value) supera a QK (solo routing) en los tres conjuntos, entre 2,4 y 4,4 puntos de nDCG@10. No se han publicado comparaciones con modelos single-vector o estilo ColBERT bajo un mismo protocolo; el autor lo indica explícitamente como limitación pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un backbone de 755 millones de parámetros en fp16 ocupa aproximadamente 1,5 GB de pesos; a ello hay que sumar las activaciones y las cabezas de slots, no cuantificadas en la model card.
- GPU recomendadas: no disponibles. Por tamaño, el modelo debería caber en GPUs de consumo como RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) en fp16, pero el autor no publica requisitos oficiales ni cifras de latencia.
- Opciones de despliegue: el toolkit oficial es `breadbowl-embed`, instalable desde GitHub (`pip install "git+https://github.com/BreadBowlAI/breadbowl-embed.git"`), no publicado en PyPI. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI; los pesos están en safetensors.
- Latencia y throughput: no disponibles.
- Requisito de entorno: Python 3.12 o superior.

## Comparativa con modelos similares

| Modelo | Vectores por pasaje | Formación de vectores | Reranking | Licencia |
|---|---|---|---|---|
| BreadBowl-Embed v1.3 | 16 routing + 16 value (fijo) | 16 queries de slot con cross-attention sobre estados de token | Value readout desde los mismos slots cacheados | Apache 2.0 |
| Embedding single-vector (p. ej. basados en pooling) | 1 | Pooling de estados de token | Normalmente un cross-encoder separado | No disponible |
| ColBERT-style late interaction | 1 por token (crece con la longitud) | Proyección token a token | Rescoring desde vectores de token almacenados (MaxSim) | No disponible |

No se dispone de comparación de rendimiento bajo un protocolo común entre BreadBowl-Embed y estos modelos; el autor lo señala como limitación. No se identifican en la información proporcionada alternativas concretas con nombre, parámetros y benchmarks comparables.

## Limitaciones y advertencias

- Release de investigación: el autor la etiqueta explícitamente como tal; no hay garantías de estabilidad para producción y los benchmarks no están verificados (`verified: false`).
- Solo inglés: no se declara ni evalúa soporte multilingüe, incluido el castellano.
- Sesgos conocidos: no documentados en la model card.
- Riesgo de alucinación: no aplica de forma directa al ser un modelo de embeddings, pero los rankings pueden devolver pasajes irrelevantes con puntuaciones altas; los valores de Recall@100 en TREC DL (57,01 y 63,71 con relevancia ≥ 2) indican que la etapa de recuperación no agota el conjunto relevante.
- Coste de almacenamiento: 32 vectores por pasaje frente a 1 en single-vector, lo que multiplica el tamaño del índice; a cambio, el coste no crece con la longitud del pasaje como en ColBERT.
- Ausencia de comparación formal con single-vector y ColBERT bajo un mismo protocolo, según reconoce el autor.
- Longitud de contexto y límites de entrada: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen/Qwen3.5-0.8B-Base conviene verificar las condiciones del modelo base.
- Dependencia de un toolkit propio (`breadbowl-embed`) no publicado en PyPI, lo que complica la integración con stacks de despliegue estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dotproductx/breadbowl-embed-v1.3
- Versión anterior (v1.2-preview): https://huggingface.co/dotproductx/breadbowl-embed-v1.2-preview
- Código fuente y toolkit: https://github.com/BreadBowlAI/breadbowl-embed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Dataset de pre-entrenamiento: https://huggingface.co/datasets/lightonai/embeddings-pre-training-curated
- Dataset de fine-tuning: https://huggingface.co/datasets/lightonai/embeddings-fine-tuning
- Dataset de entrenamiento de embeddings: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Dataset SciRepEval: https://huggingface.co/datasets/allenai/scirepeval
- Dataset PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA
