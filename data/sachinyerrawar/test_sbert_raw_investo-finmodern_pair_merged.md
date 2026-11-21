# sachinyerrawar/Test_sbert_raw_investo-finmodern_pair_merged

## Resumen

Test_sbert_raw_investo-finmodern_pair_merged es un modelo de embeddings de frases (sentence-transformers) publicado por el usuario sachinyerrawar en Hugging Face. Se trata de un fine-tuning de sentence-transformers/bert-base-nli-mean-tokens, un BERT base con pooling por media, adaptado específicamente a la recuperación de información en el dominio financiero. El modelo resuelve el problema de la búsqueda semántica y el emparejamiento pregunta-respuesta sobre corpus financieros, y resulta relevante por su especialización vertical: aunque su tamaño es pequeño (109 millones de parámetros), está ajustado sobre pares del dominio "investo-finmodern".

La arquitectura es un transformer encoder BERT base con 109.482.240 parámetros y salida de embeddings de 768 dimensiones mediante mean pooling. El entrenamiento se realizó con la pérdida CachedMultipleNegativesRankingLoss sobre un conjunto de solo 200 pares, lo que lo convierte en un modelo muy ligero de entrenar pero también muy limitado en cobertura. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Es un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, pensado para experimentación con recuperación semántica en textos financieros en inglés. No es un modelo generativo: no produce texto, solo vectores de representación para similitud y búsqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base con mean pooling (sentence-transformers) |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT base, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de sentence-transformers/bert-base-nli-mean-tokens, un BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) con pooling por media sobre la última capa oculta para producir un vector de frase de 768 dimensiones. Sobre esta base se aplicó un fine-tuning con la librería sentence-transformers y la pérdida CachedMultipleNegativesRankingLoss, una variante de contrastive learning que aprovecha negativos en caché para aumentar el tamaño efectivo del batch sin incrementar el coste de memoria.

El conjunto de entrenamiento declarado es de solo 200 pares (dataset_size:200), presumiblemente pares pregunta-respuesta o pares de similitud del dominio financiero "investo-finmodern". No se documenta el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de embeddings). La innovación técnica principal es el uso de CachedMultipleNegativesRankingLoss para entrenar con batches efectivos grandes a pesar del dataset reducido.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información.
- Búsqueda semántica y ranking de documentos en dominio financiero (preguntas y respuestas sobre finanzas personales, banca, seguros, inversión).
- Feature extraction: representaciones vectoriales de 768 dimensiones reutilizables en pipelines de clasificación o clustering.
- Emparejamiento pregunta-respuesta (QA retrieval) sobre corpus financieros en inglés.
- Deduplicación y clustering semántico de textos financieros.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés (en).
- Capacidades especiales: ninguna más allá del embedding; no hay modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en bases de conocimiento financieras: indexar artículos, FAQs y guías de finanzas personales y recuperar los fragmentos más relevantes ante una consulta del usuario, usando similitud coseno sobre los embeddings de 768 dimensiones.
- Motor de preguntas frecuentes (FAQ matching): emparejar preguntas de usuarios con respuestas preexistentes en un portal bancario, aprovechando el ajuste del modelo sobre pares del dominio financiero.
- Deduplicación de contenido en un corpus financiero: agrupar documentos o fragmentos casi idénticos mediante clustering de embeddings para limpiar datasets editoriales.
- Enrutamiento de tickets de soporte: clasificar consultas de clientes hacia el departamento adecuado (tarjetas de crédito, hipotecas, seguros) comparando el embedding de la consulta con prototipos por categoría.
- Recuperación aumentada (RAG) en un asistente financiero: usar el modelo como retriever en un pipeline RAG, alimentando un LLM generativo con los fragmentos recuperados del corpus financiero.
- Análisis de similitud entre cláusulas o condiciones de productos financieros: detectar solapamientos entre pólizas, contratos o descripciones de productos comparando sus embeddings.
- Evaluación de calidad de respuestas: medir la similitud semántica entre una respuesta generada y una respuesta de referencia en un sistema de QA financiero.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index sobre el dataset "investo val" (tarea information-retrieval). No están verificados (verified: false).

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,76 |
| Cosine Accuracy@3 | 0,82 |
| Cosine Accuracy@5 | 0,86 |
| Cosine Accuracy@10 | 0,90 |
| Cosine Precision@1 | 0,76 |
| Cosine Precision@3 | 0,2733 |
| Cosine Precision@5 | 0,172 |
| Cosine Precision@10 | 0,09 |
| Cosine Recall@1 | 0,76 |
| Cosine Recall@3 | 0,82 |
| Cosine Recall@5 | 0,86 |
| Cosine Recall@10 | 0,90 |
| Cosine NDCG@10 | 0,8246 |
| Cosine MRR@10 | no disponible (dato truncado en la información proporcionada) |
| Cosine MAP@100 | no disponible (dato truncado en la información proporcionada) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en FP32 (109 M de parámetros), y menos de 0,3 GB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También funciona en CPU para cargas moderadas.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1650, RTX 2060, RTX 3060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: sentence-transformers (nativo), Hugging Face Text Embeddings Inference (TEI, el modelo es endpoints_compatible), vLLM (soporte de embeddings), FastAPI con transformers, ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU (miles de frases por segundo en A100) y moderado en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Test_sbert_raw_investo-finmodern_pair_merged | 109 M | no disponible (BERT base, ~512) | Apache 2.0 | Dominio financiero (fine-tuning) |
| sentence-transformers/bert-base-nli-mean-tokens | 109 M | ~512 tokens | Apache 2.0 | Propósito general (NLI) |
| all-MiniLM-L6-v2 | 22 M | ~256 tokens | Apache 2.0 | Propósito general, rápido |
| BAAI/bge-base-en-v1.5 | 109 M | ~512 tokens | MIT | Propósito general, retrieval |

No se dispone de comparativas de rendimiento directas entre estos modelos en la información proporcionada. El modelo aquí descrito es un fine-tuning de nicho con dataset muy reducido (200 pares), por lo que su generalización frente a alternativas de propósito general no está documentada.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (200 pares), lo que limita la generalización y aumenta el riesgo de sobreajuste al dominio "investo-finmodern".
- Solo soporta inglés; no hay capacidades multilingües.
- Es un modelo de embeddings, no generativo: no puede responder preguntas ni generar texto por sí mismo.
- Los benchmarks declarados no están verificados (verified: false) y proceden de un único dataset de validación propio ("investo val"), por lo que no son comparables con métricas estándar como MTEB.
- Riesgo de sesgo heredado del corpus financiero de entrenamiento y del modelo base BERT; no se documentan análisis de sesgo.
- Longitud de contexto no documentada explícitamente; al derivar de BERT base, se espera un límite de 512 tokens, insuficiente para documentos largos sin fragmentación.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye "tal cual", sin garantías.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en producción ni validación comunitaria.
- Para producción se recomienda validar el modelo sobre un conjunto de evaluación propio antes de sustituir un retriever de propósito general.

## Enlaces

- Hugging Face: https://huggingface.co/sachinyerrawar/Test_sbert_raw_investo-finmodern_pair_merged
- Modelo base: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de CachedMultipleNegativesRankingLoss / Multiple Negatives Ranking (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Librería sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
