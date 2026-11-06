# netprojects/Nemotron-3.5-Rerank-8B-GGUF

## Resumen

Nemotron-3.5-Rerank-8B-GGUF es una conversión a formato GGUF del modelo NVIDIA Nemotron-3.5-Rerank-8B-BF16, un reranker de 7.952.683.008 parámetros desarrollado originalmente por NVIDIA. El modelo resuelve una tarea concreta: puntuar la relevancia de un pasaje respecto a una consulta y devolver un logit de relevancia, lo que lo hace adecuado para etapas de reordenación en pipelines de recuperación de información (RAG, búsqueda semántica, motores de búsqueda internos). La conversión la firma NetProjects, que no tiene vínculo con NVIDIA, y solo modifica el formato y la precisión de los pesos.

El backbone es Ministral-3 8B en configuración bidireccional, con pooling de atención enmascarada y una cabeza de puntuación `Linear(4096 -> 1)`. Esta build es exclusivamente de texto: la torre de visión Pixtral ha sido eliminada. Se publica en tres precisiones (BF16, Q8_0 y Q4_K_M) y en dos variantes funcionales: `rank`, que expone un endpoint nativo `/v1/rerank` y requiere un parche sobre llama.cpp, y `embed`, que funciona con llama.cpp estándar y un wrapper en Python.

La relevancia de esta ficha es práctica: permite ejecutar un reranker de 8B en hardware de consumo (la cuantización Q4_K_M ocupa 4,9 GB) sin depender de infraestructura GPU dedicada, manteniendo una paridad numérica muy alta con el modelo original en BF16. El interés es especialmente alto para equipos que despliegan RAG en local o en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (backbone Ministral-3 8B) con pooling de atención enmascarada y cabeza de puntuación `Linear(4096 -> 1)` |
| Parametros totales | 7.952.683.008 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de servidor usa `-c 4096`) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (Q8_0 recomendado por el autor) |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors BF16 |
| Tarea | Text ranking / reranking (pipeline: text-ranking) |
| Formato de prompt | `query: {query}\n\npassage: {document}` (sin BOS/EOS) |
| Salida | Logit de relevancia crudo (aplicar sigmoid para obtener probabilidad) |
| Variantes | `rank` (pooling RANK, cabeza en `cls.output`, endpoint nativo) y `embed` (mean pooling, cabeza en `score_weight.npy`) |
| Modelo base | nvidia/Nemotron-3.5-Rerank-8B-BF16 |
| Modelo subyacente | mistralai/Ministral-3-8B-Instruct-2512-BF16 (Apache-2.0) |

## Arquitectura y entrenamiento

La arquitectura es un transformer bidireccional derivado de Ministral-3 8B. El modelo original de NVIDIA incorpora una torre de visión Pixtral que, en esta conversión GGUF, ha sido eliminada, dejando un modelo estrictamente de texto. Sobre el backbone se aplica pooling de atención enmascarada y una cabeza lineal que proyecta el vector de 4096 dimensiones a un único logit de relevancia. La variante `rank` usa pooling RANK y almacena la cabeza como `cls.output`; la variante `embed` usa mean pooling y separa la cabeza en un fichero `score_weight.npy`, de modo que la puntuación se calcula como producto escalar entre ese vector y el embedding del pasaje.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo subyacente (Ministral-3-8B-Instruct-2512) está publicado bajo Apache-2.0, mientras que el reranker de NVIDIA se distribuye bajo OpenMDW 1.1. La innovación técnica destacable de esta build es la doble estrategia de empaquetado: la variante `rank` requiere un parche (`native-rerank.patch`) contra llama.cpp master `0ec4027` que registra `Mistral3ForSequenceClassification`, mapea `score.weight` a `cls.output`, escribe pooling RANK y añade la plantilla de rerank; la variante `embed` funciona con llama.cpp estándar y un wrapper mínimo en Python.

## Capacidades

- Puntuación de relevancia query-pasaje: devuelve un logit crudo por par, convertible a probabilidad mediante sigmoid.
- Reranking en pipelines de recuperación: reordena una lista de documentos candidatos según su relevancia respecto a una consulta.
- Endpoint compatible con la API `/v1/rerank` estilo Cohere/Jina en la variante `rank` (requiere llama.cpp parcheado).
- Integración con llama.cpp estándar en la variante `embed`, mediante pooling mean y el wrapper `rerank_wrapper.py`.
- Procesamiento por lotes de pares query/documento en un mismo servidor (`-ub 4096 -b 4096` en el ejemplo del autor).
- Capacidad multilingüe: limitada al inglés según la model card.
- Sin capacidades de generación de texto, tool calling, agentes, visión ni audio: es un modelo de clasificación/puntuación, no un LLM generativo.
- Sin modo thinking ni razonamiento multi-paso.

## Casos de uso

- Reranking en pipelines RAG: tras una recuperación inicial densa o BM25, el modelo reordena los 20-100 candidatos y deja arriba los pasajes más relevantes; el logit permite fijar un umbral de corte antes de pasarlos al LLM generador.
- Búsqueda semántica en documentación interna: desplegado con llama.cpp en un servidor local, reordena resultados de un índice vectorial para consultas de empleados sobre manuales, políticas o bases de conocimiento.
- Atención al cliente con base de conocimiento: el reranker selecciona el fragmento correcto entre las respuestas candidatas antes de que un modelo generativo redacte la respuesta final, reduciendo alucinaciones por contexto irrelevante.
- Filtrado de duplicados y near-duplicates: la puntuación de relevancia query-pasaje permite descartar pasajes con logit bajo antes de construir el contexto, ahorrando tokens en la ventana del LLM.
- Evaluación offline de sistemas de recuperación: el modelo sirve como juez de relevancia para medir precision@k o nDCG sobre un conjunto de consultas y documentos etiquetados.
- Despliegue en hardware de consumo: con Q4_K_M (4,9 GB) cabe en GPUs de gama media y en Apple Silicon vía Metal, lo que permite reranking local sin coste de API.
- Servicio de reranking multi-tenant: la variante `rank` expone `/v1/rerank` compatible con clientes que ya hablan el protocolo Cohere/Jina, facilitando la sustitución de proveedores cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BEIR, MTEB) en la información disponible. El autor sí publica una comparación de paridad numérica frente al modelo original en BF16 ejecutado capa por capa en PyTorch sobre CPU, con 20 pares query/pasaje (10 relevantes, 10 irrelevantes):

| Cuantizacion | Diferencia maxima | Diferencia media | Pearson | Spearman | Orden por pares | Relevantes > irrelevantes |
|---|---|---|---|---|---|---|
| BF16 | 0.0113 | 0.0034 | 0.99999 | 1.0000 | 1.0000 | 10/10 |
| Q8_0 | 0.0164 | 0.0083 | 0.99999 | 1.0000 | 1.0000 | 10/10 |
| Q4_K_M | 0.0356 | 0.0130 | 0.99990 | 0.9985 | 0.9947 | 10/10 |

Los ficheros `rank` y `embed` producen puntuaciones idénticas entre sí (diferencia máxima 0.0000). El autor advierte que se trata de un conjunto de sanidad pequeño, no de un benchmark completo. Los datos crudos están en `parity.csv` y `parity_native.csv`.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 ~15,9 GB; Q8_0 ~8,5 GB; Q4_K_M ~4,9 GB (tamaños de fichero publicados por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, Q8_0 encaja en GPUs de 12-16 GB (RTX 4080, RTX 4090, A10, L4); BF16 requiere 24 GB o más (RTX 3090/4090, A100 40 GB, H100).
- Consumer GPU: Q4_K_M (4,9 GB) cabe en GPUs de 6-8 GB; Q8_0 en GPUs de 12 GB o más.
- Apple Silicon: el autor menciona builds MLX separadas para reranking multimodal; la build GGUF funciona vía Metal.
- Opciones de despliegue: llama.cpp (`llama-server`) con backend Vulkan, CUDA, Metal o CPU. La variante `rank` requiere el parche `native-rerank.patch` sobre llama.cpp master `0ec4027`; la variante `embed` funciona con llama.cpp estándar más `rerank_wrapper.py`.
- Latencia y throughput: no disponibles en la información proporcionada. El autor probó en un ASUS ProArt con AMD Radeon 8060S (Vulkan) y llama.cpp `0ec4027`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros rerankers en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Rerank-8B-GGUF (esta ficha) | 7,95B | no disponible | OpenMDW 1.1 | GGUF | Bidireccional, solo texto, endpoint `/v1/rerank` en variante `rank` |
| nvidia/Nemotron-3.5-Rerank-8B-BF16 (original) | 7,95B | no disponible | OpenMDW 1.1 | safetensors BF16 | Incluye torre de visión Pixtral; requiere GPU mayor |
| Rerankers ligeros tipo cross-encoder (p. ej. familia bge-reranker) | típicamente 0,1-0,6B | no disponible | variable | safetensors, GGUF, ONNX | Menor coste de inferencia, menor capacidad de matiz |

No se dispone de información sobre alternativas de 8B directamente comparables en la búsqueda realizada.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente `en`; el rendimiento en castellano u otros idiomas no está validado.
- Solo texto: la torre de visión Pixtral fue eliminada; no soporta reranking de imágenes o páginas escaneadas.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; su única salida es un logit de relevancia.
- La variante `rank` requiere aplicar un parche a llama.cpp contra un commit concreto (`0ec4027`); cambios posteriores en upstream pueden romper la compatibilidad.
- Diferencia de tokenización: el tokenizador original inserta un zero-width non-joiner tras `[` y `<`; el endpoint nativo `/v1/rerank` no lo hace, mientras que `rerank_wrapper.py` sí. Solo afecta a textos que contengan esos caracteres.
- La validación de paridad se hizo sobre 20 pares, un conjunto de sanidad y no un benchmark representativo; el rendimiento real en producción puede diferir.
- Licencia OpenMDW 1.1: es una licencia de pesos abiertos con condiciones específicas; debe revisarse el fichero `LICENSE` antes de uso comercial. El modelo subyacente Ministral-3 es Apache-2.0, pero el reranker de NVIDIA se rige por OpenMDW.
- Build no oficial: NetProjects no está afiliado a NVIDIA y los ficheros se distribuyen AS IS, sin garantía.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de puntuaciones mal calibradas fuera de la distribución de entrenamiento; el logit crudo requiere umbralización validada por caso de uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/netprojects/Nemotron-3.5-Rerank-8B-GGUF
- Modelo base en BF16: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Modelo subyacente Ministral-3-8B-Instruct-2512-BF16: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- llama.cpp: https://github.com/ggml-org/llama.cpp
- ggml: https://github.com/ggml-org/ggml
- Build MLX 8-bit del mismo modelo: https://huggingface.co/netprojects/Nemotron-3.5-Rerank-8B-mlx-8bit
- NetProjects: https://netprojects.com
- Ficheros de paridad mencionados en la model card: `parity.csv`, `parity_native.csv`, `rerank_wrapper.py`, `native-rerank.patch`, `score_weight.npy`, `NOTICE`, `THIRD_PARTY_NOTICES.md`, `LICENSE` (incluidos en el repositorio de Hugging Face)
