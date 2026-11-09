# MCINext/Hakim-small

## Resumen

Hakim-small es un modelo de embeddings de texto para persa (farsi) desarrollado por MCINext como parte del proyecto Hakim. Con aproximadamente 38 millones de parámetros, es la variante compacta del modelo principal Hakim (unos 124 millones), diseñada para tareas de representación semántica en persa cuando los recursos computacionales son limitados. Su propósito es generar vectores densos para búsqueda semántica, recuperación densa, RAG, similitud textual semántica (STS), clasificación y respuesta a preguntas.

El modelo se entrena sobre los corpus del proyecto Hakim, que incluyen Corpesia (11.000 millones de tokens de 46 sitios web persas en 21 dominios), hmBlogs (6.800 millones de tokens de unos 20 millones de blogs persas) y 8,5 millones de consultas de búsqueda anonimizadas, seguidos de etapas no supervisada (Pairsia-unsup) y supervisada (Pairsia-sup) con pares de texto etiquetados e instrucciones por tarea. En la evaluación FaMTEB reportada en mayo de 2025, Hakim-small obtiene una puntuación media de 70,45, por encima de alternativas multilingües de mayor tamaño como BGE-m3, Jina-embeddings-v3 o multilingual-e5-large en el conjunto de tareas persas evaluadas.

Es relevante porque demuestra que un modelo muy pequeño y especializado en un solo idioma puede superar a modelos multilingües genéricos en tareas de recuperación y clasificación en persa. Sin embargo, su estado es propietario y de pesos cerrados: los pesos no están disponibles públicamente y la API de inferencia experimental que se ofrecía ha sido discontinuada, por lo que el repositorio se mantiene únicamente como documentación de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo encoder (modelo de embeddings); detalles específicos no disponibles |
| Parametros totales | Aproximadamente 38 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Persa (farsi, `fa`) |
| Licencia | No disponible (modelo propietario, pesos cerrados) |
| Formato de pesos | No disponible (los pesos no se distribuyen públicamente) |

## Arquitectura y entrenamiento

Hakim-small es un modelo de embeddings basado en arquitectura transformer de tipo encoder, con aproximadamente 38 millones de parámetros, frente a los aproximadamente 124 millones del modelo principal Hakim. La información disponible no detalla la configuración interna (número de capas, dimensiones ocultas, cabezas de atención ni función de pooling), por lo que esos datos deben considerarse no disponibles.

El entrenamiento sigue el pipeline del proyecto Hakim en tres fases. La fase de preentrenamiento utiliza Corpesia (11.000 millones de tokens de 46 sitios web persas en 21 dominios como noticias, salud, religión y tecnología), hmBlogs (6.800 millones de tokens de unos 20 millones de blogs persas) y 8,5 millones de consultas de búsqueda anonimizadas. La etapa no supervisada (Pairsia-unsup) emplea 5 millones de pares de texto persas procedentes de pares documento-título, FAQ, pregunta-respuesta y título-resumen de artículos, además de conjuntos traducidos automáticamente como MS MARCO, SAMSum y AdversarialQA. La etapa supervisada (Pairsia-sup) utiliza 1,3 millones de pares etiquetados con múltiples negativos por consulta y ajuste fino basado en instrucciones para clasificación, recuperación, STS, respuesta a preguntas e inferencia de lenguaje natural (NLI). La model card indica además que el entrenamiento incorpora contexto conversacional (chat-history-aware).

## Capacidades

- Generación de embeddings de texto densos para representación semántica en persa.
- Búsqueda semántica y recuperación densa de documentos.
- Similitud textual semántica (STS) entre pares de frases.
- Clasificación de texto y agrupamiento (clustering) semántico.
- Respuesta a preguntas basada en recuperación (RAG).
- Reranking de resultados de recuperación.
- Inferencia de lenguaje natural (NLI) y clasificación de pares.
- Ajuste fino orientado a instrucciones por tarea (classification, STS, retrieval, QA, NLI).
- Entrenamiento sensible al contexto conversacional (historial de chat).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al persa según la información disponible.

## Casos de uso

- Búsqueda semántica en corpus persas: el modelo genera embeddings de documentos y consultas para recuperar resultados por similitud vectorial, aprovechando su entrenamiento sobre Corpesia y hmBlogs para dominios como noticias, salud o tecnología.
- RAG sobre documentación en persa: indexar fragmentos de documentos en una base vectorial y recuperar los pasajes relevantes para alimentar a un LLM generador, con la ventaja de un modelo de 38M parámetros que reduce el coste de indexación.
- Clasificación de textos persas: usar los embeddings como entrada a un clasificador ligero para categorizar noticias, consultas o tickets de soporte, apoyándose en el ajuste por instrucciones para tareas de clasificación.
- Deduplicación y agrupamiento de contenido: calcular similitudes entre documentos o publicaciones de blog para detectar duplicados o agrupar temáticamente, gracias a las capacidades de clustering y STS evaluadas en FaMTEB.
- Reranking en pipelines de búsqueda: reordenar los resultados de un recuperador inicial (por ejemplo, BM25) usando la similitud semántica del modelo, que obtiene 67,30 en la tarea de reranking de FaMTEB.
- Respuesta a preguntas extractiva sobre FAQs: emparejar preguntas de usuarios con preguntas-respuesta preexistentes en bases de conocimiento persas, aprovechando los pares FAQ del corpus Pairsia-unsup.
- Filtrado de consultas de búsqueda: comparar consultas anonimizadas con documentos para mejorar la relevancia en motores de búsqueda en persa, dado el entrenamiento con 8,5 millones de consultas reales.

## Benchmarks y rendimiento

Resultados reportados en la evaluación FaMTEB de mayo de 2025 (según el informe técnico del proyecto Hakim):

| Modelo | Media | Classification | Clustering | PairClass. | Reranking | Retrieval | STS | Summarization |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Hakim | 73,81 | 84,56 | 70,46 | 89,75 | 69,46 | 40,43 | 76,62 | 85,41 |
| Hakim-small | 70,45 | 80,19 | 66,31 | 87,41 | 67,30 | 38,05 | 75,53 | 78,40 |
| Hakim-unsup | 64,56 | 60,65 | 58,89 | 86,41 | 67,56 | 37,71 | 79,36 | 61,34 |
| BGE-m3 | 65,29 | 58,75 | 57,73 | 85,21 | 74,56 | 43,38 | 76,35 | 61,07 |
| Jina-embeddings-v3 | 64,53 | 59,93 | 59,15 | 83,71 | 61,26 | 43,51 | 78,65 | 65,50 |
| multilingual-e5-large | 64,40 | 59,86 | 57,19 | 84,42 | 74,34 | 42,98 | 75,38 | 56,61 |
| GTE-multilingual-base | 63,64 | 56,07 | 57,28 | 84,58 | 69,72 | 41,22 | 75,75 | 60,88 |
| multilingual-e5-base | 62,93 | 57,62 | 56,52 | 84,04 | 72,07 | 41,20 | 74,45 | 54,58 |
| Tooka-SBERT | 60,65 | 59,40 | 56,45 | 87,04 | 58,29 | 27,86 | 76,42 | 59,06 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con unos 38M parámetros, en FP32 ocuparía aproximadamente 152 MB de pesos y en FP16 unos 76 MB, a lo que habría que sumar memoria para activaciones y lote.
- GPU recomendadas: no disponible; por tamaño, el modelo cabría holgadamente en cualquier GPU consumer moderna, pero no hay datos oficiales de despliegue.
- Cabe en GPU consumer: sí, por tamaño (inferencia posible en GPUs de gama baja e incluso en CPU), aunque no hay confirmación oficial.
- Opciones de despliegue: no disponible; al ser un modelo de pesos cerrados no se puede desplegar localmente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media FaMTEB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hakim-small | ~38M | No disponible | 70,45 | No disponible (propietario) | Pesos cerrados; API discontinuada |
| Hakim | ~124M | No disponible | 73,81 | No disponible | Pesos cerrados |
| Hakim-unsup | ~124M | No disponible | 64,56 | No disponible | Pesos cerrados |
| BGE-m3 | No disponible | No disponible | 65,29 | No disponible | Público (según información no detallada) |
| Jina-embeddings-v3 | No disponible | No disponible | 64,53 | No disponible | Público (según información no detallada) |
| multilingual-e5-large | No disponible | No disponible | 64,40 | No disponible | Público (según información no detallada) |
| Tooka-SBERT | No disponible | No disponible | 60,65 | No disponible | Público (según información no detallada) |

Hakim-small destaca por obtener la segunda mejor media del conjunto evaluado con solo ~38M parámetros, superando a modelos multilingües de mayor tamaño en clasificación, clustering y summarization, aunque queda por debajo de BGE-m3, Jina-embeddings-v3 y multilingual-e5-large en retrieval y reranking.

## Limitaciones y advertencias

- Modelo propietario de pesos cerrados: no se pueden descargar los pesos ni desplegarlo localmente.
- La API de inferencia experimental ha sido discontinuada, por lo que no hay servicio público de inferencia.
- Licencia no disponible: no se especifican condiciones de uso comercial ni restricciones legales.
- Entrenado exclusivamente para persa; su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Los resultados de FaMTEB corresponden a mayo de 2025 y no a un ranking actualizado; pueden no reflejar el estado actual de la comparativa.
- El retrieval es el punto más débil (38,05), por debajo de BGE-m3 (43,38) y Jina-embeddings-v3 (43,51), lo que limita su uso en recuperación densa de alta exigencia.
- Riesgo de sesgos derivado de los corpus de entrenamiento (sitios web y blogs persas), cuya composición demográfica y temática puede no ser representativa.
- Riesgo de alucinación no aplica directamente al ser un modelo de embeddings, pero los vectores pueden producir similitudes espurias en dominios alejados de los datos de entrenamiento.
- Longitud de contexto y formato de pesos no documentados, lo que dificulta planificar integraciones.
- Sin datos publicados sobre latencia, throughput ni requisitos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MCINext/Hakim-small
- Modelo principal Hakim: https://huggingface.co/MCINext/Hakim
- Variante no supervisada Hakim-unsup: https://huggingface.co/MCINext/Hakim-unsup
- Informe técnico (arXiv): https://arxiv.org/abs/2505.08435
