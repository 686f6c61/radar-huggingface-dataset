# liudev/novel-reranker-gpl-base-v1

## Resumen

`liudev/novel-reranker-gpl-base-v1` es un modelo cross-encoder de reordenación (reranking) afinado a partir de `hfl/chinese-roberta-wwm-ext` mediante la librería sentence-transformers. Su función es puntuar pares de textos (consulta, documento) para reordenar resultados de búsqueda semántica o de recuperación previa en un pipeline RAG. El dominio de entrenamiento es claramente la novela web china: los ejemplos de la model card muestran consultas y pasajes sobre cultivación, sistemas, tramas urbanas y deportes.

Arquitectura transformer BERT con cabeza de clasificación de secuencia (`BertForSequenceClassification`) y una única etiqueta de salida, con una longitud máxima de secuencia de 512 tokens. Cuenta con 102.268.417 parámetros, lo que lo sitúa en la categoría base y lo hace viable en GPU de consumo para inferencia.

Es relevante porque los rerankers específicos de dominio para ficción china son escasos: la mayoría de cross-encoders multilingües genéricos pierden señal en jerga de novela web (términos de cultivación, nombres de técnicas, tropos recurrentes). Este modelo se ha entrenado con 435.262 muestras en formato query/positive/negative con pérdida MarginMSELoss, lo que sugiere un objetivo de destilación de márgenes de reordenación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT (cross-encoder, `BertForSequenceClassification`) |
| Parámetros totales | 102.268.417 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es chino; los ejemplos son en chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cross-encoder basado en `hfl/chinese-roberta-wwm-ext` (BERT chino con whole word masking), utilizado como clasificador de secuencia con una sola etiqueta de salida. El modelo recibe el par (query, pasaje) concatenado y produce una puntuación de relevancia. La longitud máxima de entrada es de 512 tokens, suficiente para consultas cortas y pasajes de tamaño medio.

El entrenamiento se realizó con 435.262 muestras con columnas `query`, `positive`, `negative` y `label`, usando `MarginMSELoss`. Las estadísticas de la model card indican consultas cortas (media de 16,4 tokens, máximo 24) y pasajes positivos de 48 a 102 tokens (media 73,12). La pérdida MarginMSELoss es típica de la destilación de un reranker profesor: se entrena al modelo para reproducir los márgenes de puntuación del profesor entre positivos y negativos. No se documenta composición del dataset, procedencia de los negativos (hard negatives o muestreo aleatorio), ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Reordenación de pares (query, documento) mediante puntuación de relevancia.
- Búsqueda semántica en dos etapas: recuperación con un bi-encoder y reordenación con este cross-encoder.
- Especialización en texto narrativo chino de novela web: cultivación, sistemas, tramas urbanas, deportes y romance.
- Puntuación de listas de candidatos mediante `model.rank(query, [documentos])`.
- Integración nativa con sentence-transformers y con text-embeddings-inference (el tag `text-embeddings-inference` y `endpoints_compatible` lo indican).
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un modelo de ranking.

## Casos de uso

- Reordenación en un motor de búsqueda de novelas web: recuperar candidatos con un bi-encoder chino y reordenar los top-50 con este cross-encoder para mejorar la precisión de la primera página de resultados.
- Recomendación de capítulos similares: dada la sinopsis o el resumen de un capítulo, puntuar y ordenar capítulos de un catálogo para ofrecer "continúa leyendo" o "títulos parecidos".
- Búsqueda semántica dentro de una plataforma de lectura: el usuario describe una trama ("protagonista que obtiene un sistema y sube de nivel") y el modelo ordena los resúmenes candidatos por relevancia.
- Filtrado de duplicados y near-duplicates en un corpus de novelas: puntuar pares de sinopsis para detectar tramas repetidas o versiones de la misma obra.
- Enriquecimiento de un pipeline RAG sobre documentación de ficción: reordenar fragmentos recuperados antes de pasarlos a un LLM para resumen o respuesta.
- Etiquetado y curación de datasets: usar las puntuaciones del modelo para priorizar pares positivos/negativos en la construcción de datasets de entrenamiento de otros rerankers del dominio.
- Moderación temática asistida: ordenar pasajes candidatos según su similitud con descripciones de tropos problemáticos para revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,41 GB solo de pesos (102,3 M de parámetros); en fp16 unos 0,2 GB. El overhead de activaciones y del tokenizador eleva el consumo real, pero sigue siendo muy bajo.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- GPU recomendadas para producción de alto throughput: A10, L4, A100 o H100 para lotes grandes; en cargas pequeñas, una T4 es suficiente.
- Despliegue: sentence-transformers (CrossEncoder), text-embeddings-inference (soporte de reranking), y servidores propios con transformers. No se documenta soporte de llama.cpp ni Ollama (no aplica a cross-encoders de este tipo en la práctica).
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un BERT base con 512 tokens de contexto, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liudev/novel-reranker-gpl-base-v1 | 102,3 M | 512 | Novela web china | no disponible | Hugging Face |
| BAAI/bge-reranker-base | no disponible en la información | no disponible | Multilingüe/general | no disponible | Hugging Face |
| jinaai/jina-reranker-v2-base-multilingual | no disponible en la información | no disponible | Multilingüe | no disponible | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | no disponible en la información | no disponible | Inglés (MS MARCO) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a la categoría y al dominio de especialización.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de desplegarlo en producción.
- Idiomas no declarados: el modelo base es chino y los ejemplos son en chino; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea pobre.
- Contexto limitado a 512 tokens: los pasajes largos deben truncarse o dividirse, lo que puede perder señal en documentos extensos.
- Dominio muy específico (novela web china): fuera de ese dominio, el modelo puede puntuar de forma poco fiable.
- Riesgo de sesgo hacia tropos y jerga del corpus de entrenamiento: consultas genéricas o de otros géneros pueden recibir puntuaciones poco calibradas.
- No se documenta la composición del dataset ni la estrategia de negativos, lo que dificulta evaluar la robustez frente a hard negatives.
- El repositorio ocupa 125,2 GB, muy por encima de lo que sugieren los 102 M de parámetros; probablemente incluye checkpoints intermedios o logs de TensorBoard. Conviene revisar los archivos antes de descargar el repo completo.
- Al ser un cross-encoder, no genera texto ni soporta tool calling; no debe usarse como modelo generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liudev/novel-reranker-gpl-base-v1
- Modelo base: https://huggingface.co/hfl/chinese-roberta-wwm-ext
- Documentación de sentence-transformers: https://sbert.net
- Documentación de CrossEncoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de sentence-transformers: https://github.com/huggingface/sentence-transformers
- Cross-encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de MarginMSELoss / destilación de rerankers (arXiv:2010.02666): https://arxiv.org/abs/2010.02666
