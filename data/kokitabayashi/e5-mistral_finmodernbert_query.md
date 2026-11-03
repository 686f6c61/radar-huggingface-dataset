# kokitabayashi/e5-mistral_FinModernBERT_query

## Resumen

`kokitabayashi/e5-mistral_FinModernBERT_query` es un modelo de embeddings de frases (sentence-transformers) obtenido mediante fine-tuning del modelo base `intfloat/e5-mistral-7b-instruct` sobre el dataset `BatuhanECB/FinModernBERT-pairs-sec-synthetic-v1`, compuesto por 44.709 pares orientados al dominio financiero y a documentos SEC. Lo publica el usuario kokitabayashi bajo licencia Apache 2.0 y está pensado para tareas de similitud semántica y recuperación de información (information retrieval) en el ámbito financiero.

El modelo conserva la arquitectura transformer densa del E5-Mistral-7B-Instruct, con 7.110.660.096 parámetros totales y pesos en formato safetensors (repo de 14,2 GB). Se ha entrenado con la función de pérdida `MultipleNegativesRankingLoss`, habitual en el ajuste de modelos de recuperación densa, y se distribuye a través de la librería sentence-transformers, con compatibilidad declarada con text-embeddings-inference y endpoints.

Su relevancia radica en la especialización: parte de un modelo de embeddings generalista de 7B y lo adapta a la recuperación de pasajes financieros (preguntas sobre estados financieros, informes anuales, notas de resultados). No obstante, los resultados publicados en su model-index para el conjunto "finance eval" son extremadamente bajos (Accuracy@1 de 0,000313), lo que sugiere que el ajuste no ha producido un modelo útil para recuperación en ese benchmark concreto y debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-7B) |
| Parámetros totales | 7.110.660.096 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del E5-Mistral-7B-Instruct, un transformer decoder-only de Mistral AI adaptado por intfloat para generar embeddings de texto (feature extraction y sentence-similarity). La arquitectura subyacente es la de Mistral-7B: transformer denso con atención de ventana deslizante y RoPE, aunque la model card no detalla la configuración exacta de capas, dimensiones ocultas ni el pooling empleado para producir el embedding final.

El entrenamiento se realizó sobre `BatuhanECB/FinModernBERT-pairs-sec-synthetic-v1` (44.709 pares), un dataset sintético de pares pregunta-pasaje extraídos del dominio financiero y de presentaciones SEC. La pérdida utilizada es `MultipleNegativesRankingLoss`, estándar en recuperación densa con negativos en batch. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO (en un modelo de embeddings estos no suelen aplicarse). Tampoco se detallan innovaciones técnicas adicionales más allá de la herencia del modelo base.

## Capacidades

- Generación de embeddings de frases y pasajes para similitud semántica y recuperación densa.
- Búsqueda semántica y ranking de documentos (information retrieval) sobre texto financiero en inglés.
- Extracción de características (feature-extraction) para pipelines de sentence-transformers.
- Soporte de la pipeline `sentence-similarity` de HuggingFace y compatibilidad con text-embeddings-inference y endpoints.
- Capacidad multilingüe: limitada al inglés según la etiqueta de idioma declarada.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito; al ser un modelo de embeddings, no está orientado a generación de texto libre.

## Casos de uso

- Búsqueda semántica sobre informes anuales y presentaciones SEC: indexar pasajes de documentos financieros y recuperar los fragmentos relevantes para una consulta en lenguaje natural, aprovechando el ajuste sobre pares del dominio.
- Sistemas de preguntas y respuestas sobre estados financieros (RAG): usar el modelo como recuperador en un pipeline de retrieval-augmented generation para localizar notas contables y cifras concretas antes de pasarlas a un LLM generador.
- Deduplicación y agrupación de fragmentos de documentos regulatorios: calcular similitud entre pasajes para detectar contenido repetido o agrupar secciones temáticamente afines.
- Motor de búsqueda interna para equipos de análisis financiero: permitir consultas semánticas sobre un corpus de filings y notas de prensa en inglés.
- Clasificación y enrutamiento de consultas: comparar la consulta del usuario con un conjunto de intenciones predefinidas para dirigirla al flujo adecuado.
- Evaluación comparativa de recuperadores: servir como punto de partida especializado frente a embeddings generalistas en tareas de recuperación financiera, siempre con validación previa en el corpus propio.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index para la tarea de recuperación de información sobre el conjunto "finance eval" (métricas verificadas: false):

| Métrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,000313 |
| Cosine Accuracy@3 | 0,000522 |
| Cosine Accuracy@5 | 0,000835 |
| Cosine Accuracy@10 | 0,001670 |
| Cosine Precision@1 | 0,000313 |
| Cosine Precision@3 | 0,000174 |
| Cosine Precision@5 | 0,000167 |
| Cosine Precision@10 | 0,000167 |
| Cosine Recall@1 | 0,000313 |
| Cosine Recall@3 | 0,000522 |
| Cosine Recall@5 | 0,000835 |
| Cosine Recall@10 | 0,001670 |

Los valores de nDCG@10, MRR@10 y MAP@100 figuran en la model card como métricas declaradas, pero no se incluyen sus valores numéricos en la información disponible. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14-15 GB solo para pesos, más overhead de activaciones y del tokenizador; en la práctica se recomienda reservar 16-24 GB.
- Cuantización a 8 bits: alrededor de 7-8 GB de VRAM; a 4 bits: alrededor de 4-5 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o A10G para despliegue en servidor; RTX 4090 (24 GB) para fp16 en una sola tarjeta.
- GPU de consumo: cabe en RTX 4090 y en RTX 3090 (24 GB) en fp16; en tarjetas de 8-12 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: sentence-transformers (referencia), text-embeddings-inference (compatibilidad declarada), endpoints de HuggingFace; vLLM, llama.cpp u Ollama no están documentados para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| kokitabayashi/e5-mistral_FinModernBERT_query | 7,11B | No disponible | Apache 2.0 | Embeddings financieros (fine-tune de E5-Mistral) |
| intfloat/e5-mistral-7b-instruct | 7,11B | No disponible | MIT (según el modelo original) | Embeddings generalistas multilingües |
| BAAI/bge-m3 | No disponible | No disponible | MIT | Embeddings multilingües con recuperación híbrida |
| jinaai/jina-embeddings-v3 | No disponible | No disponible | No comercial (CC BY-NC 4.0) | Embeddings multilingües de largo contexto |

La comparación se limita a la categoría (modelos de embeddings de recuperación); los datos de parámetros, contexto y licencia de los alternativos no se han verificado en la información disponible y deben confirmarse en sus respectivas model cards.

## Limitaciones y advertencias

- Los resultados declarados en el model-index son prácticamente nulos (Accuracy@1 de 0,000313), lo que indica que el modelo no recupera correctamente en el conjunto "finance eval" evaluado; no debe desplegarse sin una validación propia exhaustiva.
- El modelo solo declara soporte de inglés; su uso con textos en castellano u otros idiomas no está garantizado.
- No se documenta la longitud máxima de contexto efectiva, lo que impide planificar el troceado de documentos largos con precisión.
- Al ser un modelo de embeddings, no genera texto: no sustituye a un LLM en tareas generativas y puede alucinar solo en el sentido de producir similitudes engañosas.
- No se documentan sesgos específicos, pero al entrenarse sobre documentos SEC sintéticos puede heredar sesgos del corpus financiero estadounidense y de la generación sintética.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de entrenamiento por posibles restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes, y las métricas no están verificadas: se trata de un modelo sin validación comunitaria.
- El tamaño de 7B implica costes de inferencia y almacenamiento (14,2 GB) considerablemente mayores que los de modelos de embeddings ligeros tipo BERT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kokitabayashi/e5-mistral_FinModernBERT_query
- Modelo base: https://huggingface.co/intfloat/e5-mistral-7b-instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/BatuhanECB/FinModernBERT-pairs-sec-synthetic-v1
- Paper de MultipleNegativesRankingLoss (referencia arXiv citada en las etiquetas): https://arxiv.org/abs/1908.10084
- Paper de Sentence-BERT (referencia arXiv citada en las etiquetas): https://arxiv.org/abs/1807.03748
- Librería sentence-transformers: https://www.sbert.net/
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
