# Deepdive404-3/GLiNER2.5-Decide

## Resumen

GLiNER2.5-Decide es un modelo de clasificación y extracción estructurada de texto, de tipo encoder, especializado en tomar decisiones operativas sobre etiquetas definidas por el usuario en tiempo de inferencia. El repositorio analizado (`Deepdive404-3/GLiNER2.5-Decide`) es un ajuste fino del modelo base `fastino/gliner2-large-v1`, publicado por el usuario Deepdive404-3; el desarrollo original de la familia GLiNER2.5 corresponde a Fastino Labs. El pipeline declarado es `token-classification` y la librería de carga es `gliner2`, a través de la clase `AutoExtractor`.

A diferencia de un modelo generativo, no produce tokens libres ni plantillas de prompt: recibe un texto y un conjunto de etiquetas candidatas agrupadas por cabeceras (intención, sentimiento, prioridad, política, etiquetas multilabel) y devuelve, en una sola pasada forward, la etiqueta o etiquetas que superan el umbral. Está orientado a dominios operativos concretos: intención de cliente y banca, peticiones de viaje y de clínica, sentimiento de reseñas, tipo de documento, enrutado de correo y tickets, escalado a humano, finalización de agente, moderación, severidad, urgencia y spam.

La relevancia actual del modelo reside en que ofrece decisiones estructuradas con un coste de inferencia muy bajo (encoder, sin decodificación autoregresiva) y licencia Apache 2.0, lo que permite despliegue local. El repositorio declara 486.444.053 parámetros en los pesos safetensors, mientras que la model card de Fastino describe el modelo como de 340M; esa discrepancia no está resuelta en la información disponible. El modelo es monolingüe en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer (familia GLiNER2), orientado a extracción y clasificación estructurada; decodificación conjunta de varias cabeceras de decisión |
| Parametros totales | 486.444.053 (dato real de los pesos safetensors). La model card de Fastino indica 340M; discrepancia no aclarada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repositorio solo publica safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 1,9 GB) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia GLiNER2, una línea de modelos de extracción de información guiada por esquema que se caracterizan por no tener una longitud de span fija y por trabajar con etiquetas o esquemas definidos en el momento de la llamada. La arquitectura es de tipo encoder, no autoregresiva: la inferencia es una única pasada forward, sin generación de tokens. El modelo evalúa preguntas tipadas definidas por el usuario y puede decodificar respuestas relacionadas de forma conjunta bajo restricciones explícitas, devolviendo decisiones estructuradas con probabilidades, puntuaciones de confianza y metadatos de viabilidad, según el blog de Fastino recogido en la búsqueda web.

Este repositorio concreto es un ajuste fino del modelo base `fastino/gliner2-large-v1` (identificador `base_model:finetune:fastino/gliner2-large-v1`), orientado a tareas de decisión: intención, enrutado, sentimiento, prioridad, política y etiquetado multilabel. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Una misma llamada puede puntuar varias cabeceras simultáneamente; en tareas de etiqueta única devuelve una cadena y en tareas multilabel devuelve todas las etiquetas que superan el umbral configurado.

## Capacidades

- Clasificación de texto con conjuntos de etiquetas arbitrarios, definidos por el usuario en tiempo de llamada, sin plantilla de prompt.
- Clasificación de intención (intent classification) en dominios operativos: soporte al cliente, banca, viajes, clínica y similares.
- Análisis de sentimiento y clasificación de temas (topic classification).
- Reconocimiento de entidades nombradas (Named Entity Recognition) y tarea general de token-classification, según el pipeline declarado.
- Etiquetado multilabel: devuelve todas las etiquetas que superan el umbral, no solo la más probable.
- Multitarea en una sola pasada: varias cabeceras evaluadas a la vez (por ejemplo, intención y prioridad en la misma llamada).
- Soporte de etiquetas con descripción asociada y de escalas ordinales.
- Respuesta a preguntas sobre un pasaje, en el sentido de clasificación sobre el texto dado, no de generación libre.
- No soporta tool calling ni function calling: no es un modelo de agente generativo.
- No soporta razonamiento multi-paso explícito ni modo "thinking": la model card indica explícitamente que no razona, no explica y no responde a preguntas abiertas.
- No dispone de capacidades de visión ni de audio según la información disponible.
- Capacidad multilingüe: no; es un modelo en inglés. Para entradas multilingües, la model card remite a `GLiNER2.5-multi-Decide`.

## Casos de uso

- Enrutado de soporte al cliente: el modelo recibe el mensaje entrante y un conjunto de etiquetas (refund_request, cancel_subscription, login_problem, shipping_delay, bug_report, speak_to_human, other) y devuelve la intención en una sola pasada, de modo que el flujo de trabajo correcto arranca en el primer turno sin intervención humana.
- Operaciones bancarias: a partir de un mensaje que mezcla varias peticiones (transferencia pendiente, cambio de beneficiario, consulta de comisiones), el modelo mapea la frase sobre la operación que debe abrir el sistema core, con etiquetas del tipo transfer_pending, transfer_cancel, beneficiary_add, card_lost, fraud_report o fee_explanation.
- Reservas y gestión de viajes: convertir un correo o chat en una acción estructurada de inventario (book, change, cancel, status, seat_change, refund, baggage) sin necesidad de formulario.
- Triaje en clínica: distinguir en una misma frase la descripción de síntomas y la acción solicitada (book_appointment, refill_prescription, resultado de analítica, derivación), para asignar la persona al recurso correcto antes de agendarla.
- Moderación y política de contenido: clasificación de comentarios contra un conjunto de políticas definidas por el equipo, con umbral configurable, para decidir si el contenido se publica, se revisa o se bloquea.
- Priorización de tickets y urgencias: evaluación conjunta de severidad, urgencia y categoría en una sola llamada, útil para colas de soporte interno y para decidir el escalado a humano.
- Clasificación documental: asignar tipo de documento (factura, contrato, informe, reclamación) y etiquetas adicionales de forma simultánea, como paso previo a un pipeline de extracción de entidades.
- Análisis de reseñas a escala: sentimiento y temas en una única pasada por documento, con coste de cómputo muy inferior al de un modelo generativo, lo que abarata el procesamiento de grandes volúmenes.

## Benchmarks y rendimiento

La model card publica exact-match accuracy sobre el conjunto `fastino/fast-decisions`: 17 dominios, 300 ejemplos de validación por dominio, con el mismo texto y las mismas etiquetas candidatas para todos los modelos comparados. El conjunto es en inglés.

| Modelo | Avg (exact match, fast-decisions) |
|---|---:|
| GLiNER2.5-Decide (340M segun la model card) | 60,2% |
| GLiNER2.5-Decide-1B | 59,6% |
| JevK5 | 57,6% |
| GLiNER2.5-multi-Decide (287M) | 56,7% |
| SemIf (Qwen3.5-4B) | 56,4% |
| GLiFormer large-v1 | 49,0% |
| Laya Router | 46,6% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general, lo cual es coherente con que la model card declare explícitamente que no es un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del recuento real de parámetros (486,4 M) y sin datos oficiales de consumo: en fp32 en torno a 1,9-2,0 GB; en fp16 o bf16 en torno a 1,0 GB; en int8 en torno a 0,5 GB; en 4 bits en torno a 0,25-0,3 GB. Son estimaciones aritméticas, no medidas publicadas.
- El tamaño del repositorio (1,9 GB) es consistente con pesos en precisión completa.
- Cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o más de VRAM. Para lotes pequeños, también en GPUs de portátil con 6-8 GB.
- Una fuente secundaria de la búsqueda web indica que Fastino posiciona este modelo para ejecución en CPU convencional en lugar de clústeres de GPU; no hay cifras oficiales de latencia ni de throughput en la información disponible.
- GPUs recomendadas para servicio con concurrencia: T4 o L4 para volúmenes moderados, A100 o H100 para lotes grandes y despliegue multi-tenant con batching dinámico.
- Opciones de despliegue: la vía documentada es la librería `gliner2` mediante `AutoExtractor.from_pretrained(...)`. No se confirman en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI; al no ser un modelo generativo, los servidores orientados a decodificación autoregresiva no son el encaje natural.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (fast-decisions, avg) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiNER2.5-Decide (este repositorio) | 486.444.053 en safetensors; 340M segun la model card | no disponible | 60,2% | apache-2.0 | HuggingFace, libreria gliner2 |
| GLiNER2.5-Decide-1B | 1B (aproximado, segun denominacion) | no disponible | 59,6% | no disponible | HuggingFace (fastino) |
| GLiNER2.5-multi-Decide | 287M | no disponible | 56,7% | no disponible | HuggingFace (fastino) |
| GLiFormer large-v1 | no disponible | no disponible | 49,0% | no disponible | HuggingFace (fastino) |
| SemIf (Qwen3.5-4B) | 4B | no disponible | 56,4% | no disponible | no disponible |
| Laya Router | no disponible | no disponible | 46,6% | no disponible | no disponible |

El dato más relevante de la comparativa es que la variante de menor tamaño de la familia supera ligeramente a la de 1B en esta suite concreta, lo que sugiere que el ajuste sobre decisiones operativas domina al escalado de parámetros en este tipo de tarea. La variante multilingüe `GLiNER2.5-multi-Decide` queda por debajo en la suite inglesa, que es el terreno para el que está optimizado el modelo analizado.

## Limitaciones y advertencias

- No es un modelo de propósito general: la model card indica expresamente que no razona, no explica y no responde a preguntas abiertas. Usarlo como sustituto de un LLM generativo produciría resultados fuera de su ámbito.
- Es monolingüe en inglés. Las entradas en otros idiomas no están soportadas por este ajuste.
- El repositorio analizado es un ajuste fino publicado por un tercero (Deepdive404-3) sobre `fastino/gliner2-large-v1`, no el artefacto oficial de Fastino. La validación y el soporte corresponden al autor del repositorio, y las descargas y likes registrados son cero.
- Discrepancia de tamaño no resuelta: los pesos safetensors suman 486.444.053 parámetros, mientras que la model card habla de 340M. Cualquier planificación de recursos debería partir del recuento real.
- Riesgo de alucinación: limitado por diseño, ya que la salida se restringe a las etiquetas candidatas proporcionadas. El riesgo real es de clasificación errónea cuando el texto es ambiguo, cuando el conjunto de etiquetas es solapado o cuando la etiqueta correcta no está en la lista, en cuyo caso forzará la opción más próxima.
- La calidad depende críticamente del diseño del conjunto de etiquetas y del umbral configurado; no se documentan en la información disponible valores recomendados de umbral.
- No se documentan sesgos conocidos ni evaluaciones de equidad en la información disponible.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y de atribución. Al ser un ajuste derivado, conviene verificar la licencia del modelo base y de los datos de ajuste antes de un despliegue en producción.
- No se documentan limitaciones de longitud de contexto, pero al ser un encoder es previsible que exista un máximo de tokens por pasada; ese valor no está disponible.
- No hay datos publicados de latencia, throughput ni comportamiento en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Deepdive404-3/GLiNER2.5-Decide
- Modelo base: https://huggingface.co/fastino/gliner2-large-v1
- Modelo oficial de Fastino: https://huggingface.co/fastino/GLiNER2.5-Decide
- Variante de 1B: https://huggingface.co/fastino/GLiNER2.5-Decide-1B
- Variante multilingüe: https://huggingface.co/fastino/GLiNER2.5-multi-Decide
- Dataset de evaluación: https://huggingface.co/datasets/fastino/fast-decisions
- Paper: https://arxiv.org/abs/2507.18546
- Repositorio de código: https://github.com/fastino-ai/GLiNER2
- Blog de presentación: https://fastino.ai/blog/gliner-2-5-decide-open-weight-decision-model
- Página de la familia GLiNER2.5: https://fastino.ai/models/gliner2-5
- Plataforma de ajuste: https://agent.fastino.ai
- Perfil en X: https://x.com/fastinoAI
- Análisis externo: https://shattered.io/fastino-gliner2-5-decide-340m-cpu-model-2026/
