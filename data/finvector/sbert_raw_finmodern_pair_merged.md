# finvector/sbert_raw_finmodern_pair_merged

## Resumen

`sbert_raw_finmodern_pair_merged` es un modelo de embeddings de frases desarrollado por finvector, obtenido mediante fine-tuning del modelo base `sentence-transformers/bert-base-nli-mean-tokens`. Su propósito es la similitud semántica y la recuperación de información en el dominio financiero, con especial énfasis en lenguaje propio de informes anuales, filings regulatorios (tipo 10-K) y documentación contable. La arquitectura es un transformer BERT base con 109.482.240 parámetros totales, pesos en safetensors y un tamaño de repositorio de 0,2 GB.

El modelo se ha entrenado con un conjunto de datos muy reducido (dataset_size: 70 pares) usando la función de pérdida `CachedMultipleNegativesRankingLoss`, una variante eficiente de contrastive learning que reutiliza los embeddings cacheados para aumentar el tamaño efectivo del batch sin incrementar el coste de memoria. El resultado es un encoder especializado que proyecta frases financieras a un espacio vectorial donde la similitud coseno refleja relevancia semántica dentro del dominio.

Es relevante para pipelines de RAG (retrieval-augmented generation) sobre documentación financiera, búsqueda semántica en bases de datos de filings y sistemas de question answering extractivo sobre informes corporativos. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y la compatibilidad con Text Embeddings Inference (TEI) facilita su despliegue en producción. No obstante, el tamaño del dataset de entrenamiento y la ausencia de benchmarks verificados exigen una validación empírica antes de adoptarlo en entornos críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT base (encoder) |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |
| Modelo base | sentence-transformers/bert-base-nli-mean-tokens |
| Funcion de perdida | CachedMultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 70 pares |
| Dimension del embedding | no disponible |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT base, con 12 capas y 768 dimensiones ocultas (arquitectura estándar de BERT base, coherente con los 109,5 millones de parámetros). Se inicializa desde `sentence-transformers/bert-base-nli-mean-tokens`, un modelo ya entrenado para similitud de frases mediante mean pooling de los token embeddings, y se somete a un fine-tuning específico sobre pares de frases del dominio financiero. La técnica de pooling es mean pooling, heredada del modelo base, y la similitud se calcula mediante coseno sobre los vectores resultantes.

El entrenamiento utiliza `CachedMultipleNegativesRankingLoss`, una pérdida de tipo contrastivo que emplea los demás ejemplos del batch como negativos. La variante "cached" almacena los embeddings de los pasajes para permitir batches efectivos grandes con memoria limitada, lo que mejora la calidad de los negativos. El dataset es extremadamente pequeño (70 pares), lo que sugiere un ajuste fino ligero orientado a adaptar el espacio de embeddings al vocabulario y las estructuras de los informes financieros, más que un reentrenamiento profundo. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a modelos de embeddings).

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información en el dominio financiero.
- Feature extraction: puede usarse como encoder para obtener representaciones vectoriales de texto.
- Similitud de frases (sentence-similarity) mediante distancia coseno.
- Recuperación de pasajes relevantes en documentación financiera (informes anuales, filings 10-K, estados contables).
- Soporte de búsqueda semántica en inglés; el modelo está etiquetado exclusivamente para inglés.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.
- Compatible con Text Embeddings Inference (TEI) y con endpoints de Hugging Face (endpoints_compatible).

## Casos de uso

- Búsqueda semántica en bases de datos de filings financieros: indexar los pasajes de informes 10-K y recuperar los fragmentos relevantes para una consulta mediante similitud coseno, aprovechando el ajuste al vocabulario contable (por ejemplo, "net assets under management" o "competitive bids for a fixed rate borrowing").
- RAG sobre documentación corporativa: usar el modelo como retriever en un pipeline de generación aumentada, donde los pasajes recuperados se pasan a un LLM generativo para responder preguntas sobre resultados financieros o cláusulas contractuales.
- Deduplicación y clustering de pasajes financieros: agrupar fragmentos con contenido semántico equivalente en grandes corpus de informes para reducir redundancia antes de la indexación.
- Motor de preguntas frecuentes sobre estados financieros: emparejar preguntas de usuarios con respuestas predefinidas extraídas de informes, usando la similitud de embeddings para seleccionar la respuesta más cercana.
- Enrutamiento de consultas en atención al cliente financiera: clasificar consultas entrantes y dirigirlas al departamento o base de conocimiento adecuada comparando su embedding con prototipos de cada categoría.
- Evaluación de relevancia en sistemas de compliance: comparar declaraciones o cláusulas regulatorias con pasajes de referencia para detectar coincidencias semánticas en auditorías internas.
- Búsqueda en documentación de fusiones y adquisiciones: recuperar cláusulas sobre timing, condiciones o importes comparando consultas con pasajes de contratos y prospectos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el dataset "finance eval" (métricas no verificadas, `verified: false`):

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,9333 |
| Cosine Accuracy@3 | 1,0000 |
| Cosine Accuracy@5 | 1,0000 |
| Cosine Accuracy@10 | 1,0000 |
| Cosine Precision@1 | 0,9333 |
| Cosine Precision@3 | 0,3333 |
| Cosine Precision@5 | 0,2000 |
| Cosine Precision@10 | 0,1000 |
| Cosine Recall@1 | 0,9333 |
| Cosine Recall@3 | 1,0000 |
| Cosine Recall@5 | 1,0000 |
| Cosine Recall@10 | 1,0000 |
| Cosine NDCG@10 | 0,9754 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los valores de precisión a k>1 son matemáticamente coherentes con un conjunto de evaluación con un único pasaje relevante por consulta (1/k), lo que sugiere un conjunto de evaluación pequeño y no representativo de un corpus real a gran escala.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos (109,5 M parámetros × 4 bytes), más overhead de activaciones y batch.
- VRAM estimada en FP16/BF16: aproximadamente 0,22 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para batches pequeños.
- GPU recomendadas para producción de alto throughput: A100, H100, L4 o T4 para servir múltiples instancias.
- Opciones de despliegue: Text Embeddings Inference (TEI), sentence-transformers, Hugging Face Inference Endpoints (endpoints_compatible), y exportación a ONNX para inferencia optimizada.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un BERT base, el throughput en GPU moderna es alto (miles de frases por segundo en batch), pero no se aportan cifras oficiales.
- Almacenamiento: 0,2 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| finvector/sbert_raw_finmodern_pair_merged | 109,5 M | no disponible | Apache 2.0 | Hugging Face | Fine-tune financiero sobre BERT base NLI |
| sentence-transformers/bert-base-nli-mean-tokens | ~109 M | 512 tokens (BERT base estándar) | Apache 2.0 | Hugging Face | Modelo base generalista; no especializado en finanzas |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | Apache 2.0 | Hugging Face | Mucho más pequeño y rápido; calidad generalista inferior en dominio financiero |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens | MIT | Hugging Face | Retrieval generalista con buen rendimiento en MTEB; no específico de finanzas |

La comparación directa de rendimiento no es posible porque el modelo de finvector solo reporta métricas sobre su propio conjunto "finance eval", sin resultados en MTEB ni en benchmarks públicos comparables. El modelo base `bert-base-nli-mean-tokens` es generalista y no está ajustado al vocabulario financiero, por lo que se espera que el fine-tune mejore en ese dominio, aunque el tamaño del dataset (70 pares) limita la magnitud de la mejora y aumenta el riesgo de sobreajuste.

## Limitaciones y advertencias

- El dataset de entrenamiento es de solo 70 pares, lo que hace muy probable el sobreajuste y limita la generalización a otros estilos o subdominios financieros.
- Las métricas de la model card no están verificadas (`verified: false`) y proceden de un conjunto de evaluación propio y presumiblemente pequeño; no deben interpretarse como rendimiento en producción.
- El modelo está etiquetado únicamente para inglés; no se garantiza calidad en otros idiomas.
- No se dispone de información sobre la longitud máxima de contexto soportada; debe validarse empíricamente antes de usarlo con pasajes largos.
- Riesgo de alucinación no aplica directamente (es un encoder, no genera texto), pero sí puede producir recuperaciones irrelevantes o falsos positivos semánticos en consultas ambiguas.
- Sesgos conocidos: no documentados por el autor; al derivar de BERT base NLI, puede heredar sesgos de género, culturales o de dominio presentes en los datos originales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no hay cláusulas de uso aceptable adicionales documentadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan los datos de entrenamiento ni el proceso de anotación, lo que dificulta la auditoría y la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finvector/sbert_raw_finmodern_pair_merged
- Modelo base: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Multiple Negatives Ranking Loss (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Libreria sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference (TEI): https://github.com/huggingface/text-embeddings-inference
