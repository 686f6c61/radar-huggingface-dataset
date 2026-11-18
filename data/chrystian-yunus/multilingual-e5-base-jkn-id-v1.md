# chrystian-yunus/multilingual-e5-base-jkn-id-v1

## Resumen

multilingual-e5-base-jkn-id-v1 es un modelo de embeddings de frases (sentence transformer) desarrollado por el usuario chrystian-yunus, obtenido mediante fine-tuning de intfloat/multilingual-e5-base. Su propósito es la similitud semántica y la recuperación de información (information retrieval) en un dominio muy concreto: la normativa sanitaria indonesia, en particular el Reglamento del Ministerio de Salud n.º 16 de 2024 sobre el sistema de derivación de servicios de salud individuales. El modelo se ha entrenado sobre un conjunto de 687 ejemplos con la función de pérdida MultipleNegativesRankingLoss.

Arquitectura y tamaño: hereda la arquitectura XLM-RoBERTa del modelo base, con 278.043.648 parámetros totales (aproximadamente 278 M), lo que lo sitúa en la gama de modelos encoder de tamaño medio. El repositorio ocupa 1,1 GB y los pesos se distribuyen en formato safetensors. No se especifica la longitud de contexto efectiva en la información disponible, aunque al derivar de XLM-RoBERTa la ventana típica es de 512 tokens.

Es relevante para desarrolladores que necesiten construir sistemas de búsqueda semántica o RAG sobre documentación legal y administrativa en indonesio, ya que el ajuste fino sobre pares consulta-pasaje del dominio jurídico-sanitario debería mejorar la precisión frente al modelo base en ese corpus específico. No obstante, se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer), fine-tune de intfloat/multilingual-e5-base |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base XLM-RoBERTa admite 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; compatible con cuantización dinámica estándar de PyTorch) |
| Idiomas soportados | no disponible (el modelo base es multilingüe; el fine-tune está orientado a indonesio) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un sentence transformer construido sobre intfloat/multilingual-e5-base, que a su vez es un encoder XLM-RoBERTa multilingüe. La tarea de entrenamiento es la generación de embeddings densos para similitud semántica: cada texto se codifica en un vector que puede compararse mediante similitud coseno. El fine-tuning se realizó con la pérdida MultipleNegativesRankingLoss, habitual en recuperación densa, que trata los pasajes positivos de cada consulta como únicos relevantes dentro del lote y penaliza los negativos en miniatura.

El conjunto de entrenamiento consta de 687 ejemplos (dataset_size:687), presumiblemente pares consulta-pasaje extraídos del reglamento sanitario indonesio citado en la model card. No se documenta el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables a un encoder de recuperación). No se declaran innovaciones técnicas adicionales más allá del ajuste fino con prefijos `query:` y `passage:`, convención heredada del modelo E5 original.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación densa (pipeline sentence-similarity y feature-extraction).
- Búsqueda semántica consulta-pasaje en documentación legal y administrativa en indonesio, con el formato de prefijos `query:` y `passage:`.
- Extracción de características (feature extraction) para clasificación, clustering o reranking posterior.
- Capacidades multilingües heredadas del modelo base, aunque el ajuste fino está sesgado al dominio y al idioma indonesio.
- Compatibilidad con text-embeddings-inference y endpoints de Hugging Face (tags `text-embeddings-inference` y `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un encoder, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica sobre normativa sanitaria indonesia: indexar los artículos del Reglamento n.º 16 de 2024 como pasajes y recuperar los más relevantes ante consultas de usuarios, usando los prefijos `query:` y `passage:` que el modelo espera.
- RAG (generación aumentada por recuperación) para asistentes legales: el modelo actúa como recuperador que alimenta un LLM generativo con los fragmentos normativos correctos antes de redactar la respuesta.
- Atención al ciudadano en portales de salud: permitir que los usuarios pregunten en lenguaje natural sobre derivaciones, rujuk balik o requisitos de ambulancia y obtener los artículos aplicables, gracias al ajuste fino sobre pares consulta-pasaje del propio reglamento.
- Deduplicación y clustering de documentos administrativos: agrupar artículos o secciones con contenido semánticamente equivalente dentro de un corpus normativo extenso.
- Reranking en pipelines de búsqueda híbrida: combinar la recuperación léxica (BM25) con la similitud densa del modelo para mejorar la precisión en la primera posición.
- Clasificación y enrutamiento de consultas: asignar consultas entrantes a las áreas del reglamento (derivación, sanciones, acreditación) comparando el embedding de la consulta con embeddings de referencia por categoría.
- Evaluación de calidad de respuestas: medir la similitud entre respuestas generadas y pasajes normativos de referencia para detectar desviaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados, dataset "Unknown"):

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,6203 |
| Cosine Accuracy@3 | 0,8734 |
| Cosine Accuracy@5 | 0,9494 |
| Cosine Accuracy@10 | 1,0000 |
| Cosine Precision@1 | 0,6203 |
| Cosine Precision@3 | 0,2911 |
| Cosine Precision@5 | 0,1899 |
| Cosine Precision@10 | 0,1000 |
| Cosine Recall@1 | 0,6203 |
| Cosine Recall@3 | 0,8734 |
| Cosine Recall@5 | 0,9494 |
| Cosine Recall@10 | 1,0000 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni el tamaño exacto del conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp16 y alrededor de 1,1 GB en fp32 para los 278 M de parámetros; con cuantización dinámica int8 puede reducirse por debajo de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 ofrecerán mayor throughput pero no son necesarias.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 2060, RTX 3050 y superiores.
- Opciones de despliegue: sentence-transformers (PyTorch), Hugging Face Text Embeddings Inference (TEI), vLLM con soporte de embeddings, FastEmbed y ONNX Runtime. No se recomienda llama.cpp u Ollama, orientados a modelos generativos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; para un encoder de 278 M se espera un throughput alto en GPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| multilingual-e5-base-jkn-id-v1 | 278 M | no disponible (base: 512 tokens) | no disponible | Hugging Face |
| intfloat/multilingual-e5-base (base) | 278 M | 512 tokens | MIT | Hugging Face |
| intfloat/multilingual-e5-small | 118 M | 512 tokens | MIT | Hugging Face |
| BAAI/bge-m3 | 568 M | 8192 tokens | MIT | Hugging Face |

El modelo ajustado comparte tamaño y arquitectura con multilingual-e5-base, por lo que su ventaja esperada es la especialización en el dominio normativo indonesio; fuera de ese dominio, el modelo base o bge-m3 (con contexto mucho mayor y multilingüismo más robusto) serían alternativas más generales. No se dispone de comparativas de rendimiento publicadas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: entrenado con solo 687 ejemplos de un único reglamento sanitario indonesio, por lo que su generalización a otros dominios o corpus es limitada.
- Licencia no declarada: no se especifican términos de uso comercial; es imprescindible contactar con el autor antes de utilizarlo en producción.
- Idiomas no declarados formalmente: aunque el modelo base es multilingüe, el ajuste fino está orientado al indonesio y su rendimiento en castellano u otros idiomas no está documentado.
- Riesgo de sesgo hacia el vocabulario y las formulaciones del reglamento concreto; consultas fuera de ese registro pueden recuperar pasajes irrelevantes.
- Benchmarks no verificados y con dataset desconocido: los valores de accuracy y recall deben tomarse con cautela y validarse en el caso de uso real.
- Sin métricas de latencia ni throughput publicadas.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación por la comunidad.
- Al ser un encoder, no genera texto; no debe confundirse con un LLM y no puede emplearse para tareas generativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chrystian-yunus/multilingual-e5-base-jkn-id-v1
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Sentence Transformers / SBERT (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
