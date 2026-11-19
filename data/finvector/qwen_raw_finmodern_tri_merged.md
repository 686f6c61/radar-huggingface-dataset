# finvector/qwen_raw_finmodern_tri_merged

## Resumen

`finvector/qwen_raw_finmodern_tri_merged` es un modelo de embeddings de frases (sentence-transformers) obtenido por fine-tuning del modelo base Qwen/Qwen3-Embedding-0.6B. Lo desarrolla el usuario finvector y está publicado en Hugging Face bajo licencia Apache 2.0. Su propósito es la generación de representaciones vectoriales densas para tareas de similitud semántica y recuperación de información, con un sesgo claro hacia el dominio financiero: los ejemplos de la model card provienen de informes anuales, notas contables y memorias corporativas (SEC filings).

El modelo cuenta con 595.776.512 parámetros (aproximadamente 0,6 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 1,2 GB. Se ha entrenado mediante la pérdida `CachedMultipleNegativesRankingLoss` sobre un conjunto de datos de 11.687 ejemplos en formato de tripletas, lo que lo orienta a la ordenación y discriminación fina de pasajes financieros similares.

Es relevante porque aplica el backbone Qwen3-Embedding a un nicho concreto (texto financiero en inglés) y declara una precisión de coseno de 0,9956 en su conjunto de evaluación de tripletas. No obstante, el modelo es muy reciente (creado el 19 de noviembre de 2026), no tiene descargas ni valoraciones, y su evaluación declarada no está verificada de forma independiente, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) adaptado a embeddings de frases mediante sentence-transformers |
| Parametros totales | 595.776.512 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible |
| Funcion de perdida de entrenamiento | CachedMultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 11.687 ejemplos |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-Embedding-0.6B, un transformer decoder-only de la familia Qwen3 reconvertido a modelo de embeddings, y se ha ajustado con la librería sentence-transformers. El pipeline declarado es `sentence-similarity` y las tareas asociadas son `sentence-similarity` y `feature-extraction`. El entrenamiento se realizó con la pérdida `CachedMultipleNegativesRankingLoss`, una variante de Multiple Negatives Ranking Loss que cachea los embeddings de los pasajes para reducir el coste de memoria en el cálculo de negativos dentro del batch. El conjunto de datos consta de 11.687 ejemplos en formato de tripletas (ancla, positivo, negativo), presumiblemente extraídos de documentos financieros en inglés.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la longitud de contexto nativa del backbone ni si se aplicaron fases de RLHF o DPO. La model card no documenta detalles de la tokenización, la dimensión de salida del embedding ni la estrategia de pooling (CLS, mean pooling u otra). El nombre del modelo incluye el sufijo `tri_merged`, que sugiere una fusión de pesos o de checkpoints orientada a tripletas, pero el autor no describe el procedimiento de merge.

## Capacidades

- Generación de embeddings de frases y pasajes para similitud semántica y recuperación densa.
- Extracción de características (`feature-extraction`) para pipelines de sentence-transformers.
- Ordenación y discriminación de pasajes financieros similares, gracias al entrenamiento con tripletas del dominio.
- Compatibilidad con Text Embeddings Inference (TEI) y con endpoints compatibles, según los tags del repositorio.
- Uso como modelo de reranking o de filtrado semántico en pipelines de búsqueda.
- Soporte multilingüe limitado: el único idioma declarado es inglés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio; es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica sobre informes anuales y filings SEC: el modelo puede indexar fragmentos de memorias corporativas y recuperar los pasajes más relevantes para una consulta en lenguaje natural, aprovechando su ajuste sobre texto financiero en inglés.
- Deduplicación de pasajes contables: permite detectar notas al pie o descripciones de políticas contables repetidas entre distintos ejercicios mediante similitud de coseno.
- Clasificación y clustering de documentos financieros: los embeddings sirven para agrupar comunicados, notas de prensa o secciones de informes por temática (impuestos, pensiones, suministro energético, etc.).
- Reranking en pipelines RAG financieros: puede reordenar los candidatos recuperados por un retriever genérico antes de pasarlos a un LLM generador, mejorando la precisión del contexto.
- Detección de cambios materiales entre ejercicios: comparando embeddings de secciones equivalentes de dos informes anuales se pueden señalar modificaciones relevantes en las divulgaciones.
- Motor de recomendación de documentos: dado un informe consultado, recuperar otros documentos con contenido semánticamente próximo dentro de un corpus corporativo.
- Moderación y control de calidad de textos financieros: identificar pasajes que se desvían del estilo o del contenido esperado en un proceso editorial o de cumplimiento.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Triplet | triplet eval | Cosine Accuracy | 0,9956 |

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, BEIR, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp16/bf16): aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y tokenizador; en la práctica, entre 2 y 3 GB para lotes pequeños.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de gama media con 4-8 GB.
- Para despliegue en servidor: A100, H100, L40S o T4 son válidas, aunque el modelo es pequeño y no las aprovecha a plena capacidad.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI), vLLM con soporte de embeddings, y exportación a ONNX si se requiere.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un modelo de 0,6 B de parámetros, se espera un throughput alto en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| finvector/qwen_raw_finmodern_tri_merged | 595,8 M | no disponible | Apache 2.0 | en | Fine-tuning financiero sobre Qwen3-Embedding-0.6B |
| Qwen/Qwen3-Embedding-0.6B | ~0,6 B | no disponible | Apache 2.0 | multilingüe | Modelo base original, uso general |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | MIT | en | Embedding ligero de uso general |
| intfloat/e5-base-v2 | ~109 M | 512 tokens | MIT | en | Embedding de uso general muy extendido |

La comparativa se limita a características estructurales; no se dispone de resultados MTEB o BEIR de este modelo que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Modelo sin descargas ni valoraciones en Hugging Face en el momento de la ficha; madurez y robustez no contrastadas por la comunidad.
- La métrica declarada (0,9956 de cosine accuracy) procede del propio autor y no está verificada; además, se evalúa sobre un conjunto de tripletas propio, no sobre benchmarks estándar como MTEB, por lo que no es comparable con resultados publicados de otros modelos.
- Entrenado únicamente con datos en inglés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Sesgo de dominio: el ajuste sobre texto financiero puede degradar su comportamiento en dominios generales (texto legal no financiero, científico, conversacional).
- Riesgo de sobreajuste al dataset de 11.687 ejemplos; no se documenta validación cruzada ni conjunto de test independiente.
- No se documenta la longitud máxima de contexto soportada, lo que impide garantizar el comportamiento con pasajes largos.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio objetivo antes de usarlo en producción.
- No es un modelo generativo: no debe emplearse para responder preguntas ni generar texto, solo para producir embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finvector/qwen_raw_finmodern_tri_merged
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Multiple Negatives Ranking (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Librería sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
