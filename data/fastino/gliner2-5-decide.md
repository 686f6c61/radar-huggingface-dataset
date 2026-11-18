# fastino/GLiNER2.5-Decide

## Resumen

GLiNER2.5-Decide es un modelo especializado en clasificación de texto desarrollado por Fastino, diseñado para tomar decisiones operativas a partir de texto libre mediante conjuntos de etiquetas definidos en tiempo de llamada. Se trata de un fine-tuning del modelo base fastino/gliner2-large-v1, con 486 millones de parámetros totales (la model card lo describe como "340M", mientras que el recuento real de safetensors indica 486.444.053 parámetros), y está pensado para tareas como clasificación de intenciones, análisis de sentimiento, enrutamiento de tickets, moderación y etiquetado multietiqueta.

La propuesta diferencial del modelo es que no genera tokens ni requiere plantillas de prompt: recibe un texto y un conjunto de etiquetas candidatas, y devuelve la etiqueta (o etiquetas) que mejor se ajustan en una sola pasada forward. Esto lo convierte en una alternativa de baja latencia frente a modelos generativos de mayor tamaño usados como clasificadores, con la ventaja de que las etiquetas se pueden cambiar en cada llamada sin reentrenar.

El modelo está publicado bajo licencia Apache 2.0, soporta únicamente inglés y se distribuye en formato safetensors para su uso con la librería transformers a través de la clase `AutoExtractor` del paquete `gliner2`. Su relevancia actual radica en que ofrece un rendimiento competitivo (60,2% de exactitud media en el benchmark fast-decisions) con un coste computacional muy inferior al de alternativas generativas como Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (encoder transformer especializado en clasificación y extracción; detalles internos no disponibles) |
| Parametros totales | 486.444.053 (la model card indica 340M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la familia GLiNER2, una arquitectura orientada a tareas de extracción de información y clasificación que, a diferencia de los modelos generativos, no produce texto token a token. GLiNER2.5-Decide es un fine-tuning del modelo fastino/gliner2-large-v1, y su funcionamiento consiste en puntuar directamente un conjunto de etiquetas candidatas proporcionadas en la llamada, devolviendo una cadena única para tareas de etiqueta única o todas las etiquetas que superan un umbral para tareas multietiqueta.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset de fine-tuning ni si se aplicaron técnicas de RLHF o DPO. La model card hace referencia al paper arXiv:2507.18546 para los detalles técnicos de la familia GLiNER2. La innovación principal del modelo es la capacidad de evaluar varias "cabeceras" de clasificación en una sola llamada y de aceptar etiquetas con descripciones asociadas, además de puntuar escalas ordinales.

## Capacidades

- Clasificación de intenciones en texto libre con conjuntos de etiquetas definidos en tiempo de ejecución.
- Análisis de sentimiento y clasificación de temática (topic classification).
- Enrutamiento de correos electrónicos, tickets y conversaciones hacia flujos de trabajo concretos.
- Detección de necesidad de derivación a humano (human handoff) y de finalización de tareas de agente (agent completion).
- Moderación de contenido, clasificación de severidad y urgencia, y detección de spam.
- Clasificación multietiqueta: devuelve todas las etiquetas por encima del umbral en una sola pasada.
- Soporte de etiquetas con descripción asociada y de escalas ordinales.
- Capacidad de responder preguntas sobre un pasaje y de clasificar libros u otros documentos.
- No soporta tool calling, function calling ni razonamiento multi-paso; no es un modelo generativo ni conversacional.
- Capacidades multilingües limitadas al inglés; para entradas multilingües el autor remite a GLiNER2.5-multi-Decide.

## Casos de uso

- Enrutamiento de atención al cliente: el modelo recibe el mensaje del usuario y un conjunto de etiquetas de intención (reembolso, cancelación, problema de acceso, retraso de envío, etc.) y devuelve la acción que debe iniciar la cola, permitiendo que el flujo correcto arranque en el primer turno sin intervención humana.
- Clasificación de solicitudes bancarias: un mismo mensaje puede mezclar una transferencia pendiente, un cambio de beneficiario y una consulta de comisiones; el modelo mapea la frase sobre la operación que el sistema central debe abrir (transfer_cancel, beneficiary_add, fraud_report, etc.).
- Conversión de correos o chats de viajes en acciones estructuradas: reservar, cambiar, cancelar, consultar estado o solicitar asiento se parecen en texto libre pero disparan llamadas de inventario distintas; el modelo distingue la acción sin necesidad de formularios.
- Triaje en clínicas y centros sanitarios: los pacientes describen síntomas y peticiones en la misma frase (cita, receta, resultados, derivación); el modelo separa la intención para asignar la agenda o el departamento correcto antes de programar.
- Moderación y priorización de contenido: clasificación de severidad, urgencia y spam en una sola llamada, adecuada para pipelines de revisión que necesitan latencia baja y coste por inferencia reducido.
- Clasificación documental y de temática: asignación de tipo de documento o categoría temática a grandes volúmenes de texto, con la ventaja de que el conjunto de etiquetas puede modificarse en cada llamada sin reentrenar el modelo.
- Detección de derivación a humano en asistentes virtuales: el modelo identifica cuándo una conversación debe escalar a un agente humano, integrándose en el bucle de decisión de un sistema de soporte.

## Benchmarks y rendimiento

Exact-match accuracy en el dataset fastino/fast-decisions (17 dominios, 300 ejemplos reservados por dominio, mismo texto y etiquetas candidatas para todos los modelos):

| Modelo | Avg |
|---|---:|
| GLiNER2.5-Decide (340M) | 60,2% |
| GLiNER2.5-Decide-1B | 59,6% |
| JevK5 | 57,6% |
| GLiNER2.5-multi-Decide (287M) | 56,7% |
| SemIf (Qwen3.5-4B) | 56,4% |
| GLiFormer large-v1 | 49,0% |
| Laya Router | 46,6% |

El conjunto de evaluación es en inglés. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a un modelo especializado en clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 486 millones de parámetros en fp32 el peso ronda los 1,9 GB, y en fp16 aproximadamente 1 GB, a lo que hay que sumar memoria para activaciones y el tokenizador.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutarlo en precisión reducida.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: la vía documentada es la librería `gliner2` con `AutoExtractor.from_pretrained`, sobre transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Avg fast-decisions | Licencia | Idiomas |
|---|---|---|---|---|---|
| GLiNER2.5-Decide | 486M (340M según model card) | no disponible | 60,2% | Apache 2.0 | en |
| GLiNER2.5-Decide-1B | no disponible | no disponible | 59,6% | no disponible | en |
| GLiNER2.5-multi-Decide | 287M | no disponible | 56,7% | no disponible | multilingüe |
| SemIf (Qwen3.5-4B) | 4B | no disponible | 56,4% | no disponible | no disponible |
| GLiFormer large-v1 | no disponible | no disponible | 49,0% | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no es de propósito general: no razona, no explica y no responde preguntas abiertas; solo clasifica sobre un conjunto de etiquetas dado.
- Soporta únicamente inglés; para entradas multilingües el autor recomienda GLiNER2.5-multi-Decide.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinación en el sentido de asignar una etiqueta incorrecta cuando el texto es ambiguo o no encaja en ninguna categoría del conjunto proporcionado; conviene definir una etiqueta de reserva tipo "other".
- No se documentan la longitud de contexto máxima ni los tipos de cuantización soportados, lo que limita la planificación de despliegues en producción.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales ni condiciones de atribución más allá de las estándar de la licencia.
- El recuento de parámetros de la model card (340M) no coincide con el recuento real de safetensors (486M); conviene verificar el tamaño efectivo antes de dimensionar infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiNER2.5-Decide
- Modelo base: https://huggingface.co/fastino/gliner2-large-v1
- Variante 1B: https://huggingface.co/fastino/GLiNER2.5-Decide-1B
- Variante multilingüe: https://huggingface.co/fastino/GLiNER2.5-multi-Decide
- Dataset de evaluación: https://huggingface.co/datasets/fastino/fast-decisions
- Paper: https://arxiv.org/abs/2507.18546
- Repositorio GitHub: https://github.com/fastino-ai/GLiNER2
- Plataforma de fine-tuning: https://agent.fastino.ai
- Cuenta de X: https://x.com/fastinoAI
