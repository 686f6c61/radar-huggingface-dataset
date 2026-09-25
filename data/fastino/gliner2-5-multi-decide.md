# fastino/GLiNER2.5-multi-Decide

## Resumen

GLiNER2.5-multi-Decide es un modelo de clasificación multilingüe de 287 millones de parámetros (287.355.159 exactos según los pesos safetensors) desarrollado por Fastino. Es un fine-tune del checkpoint base fastino/gliner2.5-multi-v1 y forma parte de la familia GLiNER2.5, orientada a extracción de información guiada por esquema y a la toma de decisiones operativas. Se publica bajo licencia Apache 2.0.

A diferencia de un modelo generativo, no emplea plantillas de prompt ni produce tokens de texto: recibe en tiempo de llamada un texto y un conjunto arbitrario de etiquetas, y devuelve la etiqueta seleccionada (o todas las que superan un umbral, en tareas multilabel) en una única pasada forward. Su ámbito son decisiones cerradas: intención de cliente y banca, peticiones de viaje y clínica, sentimiento de reseñas, tipo de documento, enrutado de correos y tickets, handoff a humano, finalización de agente, moderación, severidad, urgencia y spam.

Su relevancia actual radica en ofrecer clasificación local y sin coste por token con un modelo pequeño (≈1,2 GB de repositorio) y licencia permisiva, como alternativa a routers propietarios o a LLM generativos de mayor tamaño para tareas de etiquetado cerrado. Admite varias tareas (heads) en una sola llamada y soporta explícitamente entradas multilingües, no solo en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder para clasificación/extensión guiada por etiquetas, en una sola pasada forward (sin decodificación autorregresiva) |
| Parametros totales | 287.355.159 (≈287 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados están en safetensors) |
| Idiomas soportados | Multilingüe (incluye inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Biblioteca | gliner2 |
| Modelo base | fastino/gliner2.5-multi-v1 (fine-tune) |
| Tamaño del repositorio | 1,2 GB |
| Fecha de creacion / actualizacion | 2026-09-24 / 2026-09-24 |

## Arquitectura y entrenamiento

El modelo se describe como un encoder que resuelve la clasificación en una única pasada forward, sin generación de tokens y sin plantilla de prompt. Se apoya en conjuntos de etiquetas definidos en tiempo de ejecución: para tareas de etiqueta única devuelve una cadena y para tareas multilabel devuelve todas las etiquetas que superan un umbral. La misma llamada puede evaluar varias cabeceras (por ejemplo intención y sentimiento) de forma simultánea. Fastino enmarca la familia GLiNER2.5 como extracción de información guiada por esquema, con extracción de entidades y relaciones y sin límite fijo de longitud de span; la pipeline declarada del checkpoint es token-classification, lo que confirma capacidades de reconocimiento de entidades (NER).

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El modelo es un fine-tune del checkpoint fastino/gliner2.5-multi-v1. El único conjunto de evaluación referenciado es fastino/fast-decisions, con 17 dominios y 300 ejemplos reservados por dominio, empleando el mismo texto y las mismas etiquetas candidatas para todos los modelos comparados. No se han publicado detalles sobre innovaciones técnicas específicas de este fine-tune más allá del enfoque de etiquetas dinámicas en una sola pasada.

## Capacidades

- Clasificación de texto con conjuntos de etiquetas arbitrarios definidos en tiempo de llamada (no fijados en el entrenamiento).
- Tareas de etiqueta única (devuelve una cadena) y multilabel (devuelve todas las etiquetas por encima del umbral).
- Evaluación de varias cabeceras o tareas en una única llamada.
- Clasificación de intención, enrutado, sentimiento, prioridad, política y etiquetas de diversa índole.
- Reconocimiento de entidades nombradas (pipeline token-classification) sobre documentos multilingües.
- Respuesta a una pregunta sobre un pasaje (question answering cerrado sobre el texto dado).
- Clasificación de tipo de documento y de temática (por ejemplo, clasificación de libros).
- Uso de etiquetas que incluyen una descripción.
- Puntuación de escalas ordinales.
- Cobertura multilingüe, pensada explícitamente para entradas que no están en inglés.
- No soporta tool calling, function calling, uso de agentes ni razonamiento multi-paso: no es un modelo generativo ni un LLM de propósito general.

## Casos de uso

- Enrutado de soporte al cliente: dado un mensaje entrante y un conjunto de etiquetas como reembolso, cancelación, fallo de inicio de sesión o retraso de envío, el modelo devuelve la acción que debe tomar la cola, de modo que el flujo correcto arranca en el primer turno sin intervención humana.
- Peticiones bancarias: una misma frase puede mezclar una transferencia pendiente, un cambio de beneficiario y una consulta de comisiones; el modelo mapea el enunciado a la operación que el sistema central debe abrir (transfer_cancel, beneficiary_add, fraud_report, etc.).
- Peticiones de viaje: reservar, cambiar, cancelar y solicitar asiento se parecen en texto libre pero disparan llamadas de inventario distintas; el modelo convierte un chat o correo en una acción de reserva estructurada sin formulario.
- Enrutado en clínica: los pacientes describen síntomas y lo que quieren en la misma frase (cita, receta, resultado, derivación); la recepción necesita esa distinción antes de asignar agenda.
- Moderación, severidad, urgencia y detección de spam: clasificación de contenido en categorías operativas de política, con etiquetas configurables por despliegue.
- Análisis de sentimiento de reseñas: puntuación de opiniones en una escala categórica u ordinal, con posibilidad de combinar sentimiento y temática en una sola llamada.
- Enrutado de correos y tickets y handoff a humano: detección de la categoría del ticket y de la necesidad de escalar a una persona, integrable en el sistema de ticketing.
- Clasificación documental multilingüe: asignación de tipo de documento y tema en corpus con varios idiomas, aprovechando la cobertura multilingüe del checkpoint frente a la versión solo inglesa.
- Extracción de entidades en documentos: uso de la pipeline token-classification para NER sobre textos multilingües dentro de un esquema de etiquetas definido en la llamada.

## Benchmarks y rendimiento

Exact-match accuracy sobre fastino/fast-decisions (17 dominios, 300 ejemplos reservados por dominio, mismo texto y etiquetas candidatas para todos los modelos). La suite está en inglés.

| Modelo | Exact-match medio |
|---|---:|
| GLiNER2.5-Decide (340M) | 60,2 % |
| GLiNER2.5-Decide-1B | 59,6 % |
| JevK5 | 57,6 % |
| GLiNER2.5-multi-Decide (287M) | 56,7 % |
| SemIf (Qwen3.5-4B) | 56,4 % |
| GLiFormer large-v1 | 49,0 % |
| Laya Router | 46,6 % |

Según el autor, para texto exclusivamente en inglés conviene usar GLiNER2.5-Decide, mientras que multi-Decide está pensado para entradas multilingües. No se han publicado resultados de benchmarks específicos para idiomas distintos del inglés en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 ≈1,15 GB; en fp16/bf16 ≈0,57 GB; en int8 ≈0,29 GB (estimaciones a partir de los 287 M de parámetros; el repositorio ocupa 1,2 GB).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4060 o superior cubre el modelo con holgura; A100 o H100 no aportan ventaja por tamaño y resultan sobredimensionadas.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer actuales y también en CPU, dado su tamaño reducido.
- Opciones de despliegue: la vía oficial es la biblioteca gliner2 mediante `AutoExtractor.from_pretrained(...)` sobre los pesos safetensors. No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI (son runtimes orientados a modelos generativos y este es un encoder).
- Latencia y throughput: no disponibles. El análisis externo de la familia menciona ejecución en CPU, pero no se aportan cifras concretas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Exact-match (fast-decisions) | Enfoque |
|---|---|---|---|---|---|
| GLiNER2.5-multi-Decide | 287 M | No disponible | Apache 2.0 | 56,7 % | Clasificación multilingüe por etiquetas |
| GLiNER2.5-Decide | 340 M | No disponible | Apache 2.0 | 60,2 % | Clasificación en inglés |
| GLiNER2.5-Decide-1B | 1 B | No disponible | Apache 2.0 | 59,6 % | Clasificación en inglés |
| SemIf (Qwen3.5-4B) | 4 B | No disponible | No disponible | 56,4 % | Router/LLM generativo |
| JevK5 | No disponible | No disponible | No disponible | 57,6 % | Router de clasificación |
| GLiFormer large-v1 | No disponible | No disponible | No disponible | 49,0 % | Extracción/clasificación |
| Laya Router | No disponible | No disponible | No disponible | 46,6 % | Router |

La comparativa se limita a la métrica de exact-match sobre fastino/fast-decisions; no se dispone de parámetros, contexto ni licencia de las alternativas JevK5, GLiFormer large-v1 y Laya Router en la información proporcionada. multi-Decide rinde por debajo de las variantes específicas de inglés de la misma familia, lo que el autor justifica por su orientación multilingüe.

## Limitaciones y advertencias

- No es un modelo de propósito general: no razona, no explica y no responde a preguntas abiertas. Su uso debe limitarse a clasificación con etiquetas cerradas.
- La suite de benchmark empleada (fast-decisions) está en inglés; el rendimiento real en otros idiomas no está cuantificado en la información disponible.
- Riesgo de alucinación: al no generar texto libre, el riesgo principal no es inventar contenido, sino asignar etiquetas incorrectas o forzar una etiqueta fuera de la distribución esperada cuando el texto no encaja claramente en ninguna categoría.
- El comportamiento multilabel depende de un umbral de decisión; no se especifica el valor por defecto ni cómo ajustarlo.
- Sesgos conocidos: no disponibles.
- Longitud de contexto no documentada, lo que impide garantizar el comportamiento con entradas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, con las obligaciones habituales de atribución y aviso de cambios.
- Adopción temprana en el momento de la ficha (26 descargas, 12 likes), por lo que la validación por parte de terceros es limitada.
- Para texto solo en inglés, el propio autor recomienda el modelo GLiNER2.5-Decide, con mejor exact-match.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiNER2.5-multi-Decide
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Dataset de evaluación: https://huggingface.co/datasets/fastino/fast-decisions
- Paper (arXiv 2507.18546): https://arxiv.org/abs/2507.18546
- Repositorio GitHub: https://github.com/fastino-ai/GLiNER2
- Página del modelo en Fastino: https://fastino.ai/models/gliner2-5
- Sitio de Fastino Labs: https://fastino.ai/
- Colección GLiNER2.5 en Hugging Face: https://huggingface.co/collections/fastino/gliner25-models
- Análisis externo de GLiNER2.5-Decide: https://www.explainx.ai/blog/gliner-2-5-decide-fastino-340m-open-weight-decision-model-2026
- Variante en inglés: https://huggingface.co/fastino/GLiNER2.5-Decide
- Variante de 1B en inglés: https://huggingface.co/fastino/GLiNER2.5-Decide-1B
