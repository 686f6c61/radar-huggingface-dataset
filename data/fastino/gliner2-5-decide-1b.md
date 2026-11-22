# fastino/GLiNER2.5-Decide-1B

## Resumen

GLiNER2.5-Decide-1B es un modelo especializado en clasificación y extracción de decisiones operativas desarrollado por Fastino. Forma parte de la familia GLiNER2.5 y se presenta como la variante de 1B parámetros del modelo GLiNER2.5-Decide (340M). No es un modelo generativo de propósito general: no razona, no explica ni responde preguntas abiertas. Su función es mapear un texto de entrada contra un conjunto de etiquetas proporcionado en tiempo de llamada, devolviendo la etiqueta (o etiquetas) que mejor se ajustan, en una única pasada forward sin generación de tokens ni plantillas de prompt.

El modelo se construye sobre fastino/gliner2-xl-0111 mediante fine-tuning y está orientado a tareas de clasificación operativa: intención de cliente, routing de tickets, sentimiento, prioridad, tipo de documento, moderación, urgencia, spam y etiquetado multi-etiqueta. Su relevancia radica en que permite definir el esquema de etiquetas en el momento de la inferencia, sin reentrenamiento, y ejecutarlo localmente con la librería `gliner2`.

Con 1.188.796.693 parámetros y pesos en safetensors, se distribuye bajo licencia Apache 2.0 y está entrenado exclusivamente en inglés. Su benchmark principal es `fastino/fast-decisions`, con 17 dominios y 300 ejemplos retenidos por dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (encoder transformer para extracción y clasificación de entidades/etiquetas); detalles internos no disponibles |
| Parametros totales | 1.188.796.693 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia GLiNER2, una línea de modelos diseñados para extracción de información y clasificación basada en esquemas definidos en tiempo de inferencia. Se trata de un fine-tune de `fastino/gliner2-xl-0111`, orientado específicamente a la tarea de "decisiones" (clasificación de texto contra conjuntos de etiquetas arbitrarios). La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal es operativa: el modelo acepta un diccionario de etiquetas en cada llamada (`classify_text`) y devuelve una o varias etiquetas en una sola pasada forward, sin generación autorregresiva. Soporta tareas de etiqueta única (devuelve una cadena) y multi-etiqueta (devuelve todas las etiquetas por encima de un umbral). Una misma llamada puede puntuar varias "cabezas" de clasificación simultáneamente. No se dispone de información sobre mecanismos de atención lineal, decodificación especulativa u otras innovaciones arquitectónicas internas.

## Capacidades

- Clasificación de texto contra conjuntos de etiquetas arbitrarios definidos en tiempo de llamada, sin reentrenamiento.
- Clasificación de intención (customer support, banca, viajes, clínicas).
- Análisis de sentimiento y clasificación de temática (topic classification).
- Named Entity Recognition (NER).
- Clasificación multi-etiqueta: devuelve todas las etiquetas que superan un umbral.
- Puntuación simultánea de varias cabezas de clasificación en una sola llamada.
- Clasificación con etiquetas que llevan descripción asociada.
- Puntuación de escalas ordinales.
- Respuesta a preguntas sobre un pasaje (question answering extractivo orientado a decisión).
- Routing de emails y tickets, detección de derivación a humano, finalización de agente, moderación, severidad, urgencia y spam.
- No soporta generación de texto libre, razonamiento abierto ni explicaciones.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Routing de atención al cliente: clasificar mensajes entrantes en intenciones como `refund_request`, `cancel_subscription`, `login_problem` o `shipping_delay` para iniciar el flujo de trabajo correcto en el primer turno, antes de que intervenga un humano.
- Clasificación de operaciones bancarias: mapear mensajes ambiguos (transferencia pendiente, cambio de beneficiario, consulta de comisiones) a la operación concreta que debe abrir el core bancario.
- Gestión de solicitudes de viaje: convertir correos o chats en acciones estructuradas de reserva (`book`, `change`, `cancel`, `seat_change`, `refund`) sin formularios.
- Triaje en clínicas: distinguir entre solicitud de cita, receta, resultados o derivación en mensajes de pacientes que mezclan síntomas y peticiones, para enrutar en recepción.
- Moderación y clasificación de severidad/urgencia en contenido generado por usuarios, usando etiquetas ordinales o multi-etiqueta.
- Clasificación de tipo de documento y etiquetado temático de libros o pasajes, incluyendo preguntas sobre el contenido de un pasaje.
- Detección de spam y de necesidad de derivación a humano en pipelines de agentes conversacionales.

## Benchmarks y rendimiento

Exact-match accuracy sobre `fastino/fast-decisions` (17 dominios, 300 ejemplos retenidos por dominio, mismo texto y etiquetas candidatas para todos los modelos). Suite en inglés.

| Modelo | Avg |
|---|---:|
| GLiNER2.5-Decide (340M) | 60,2% |
| GLiNER2.5-Decide-1B | 59,6% |
| JevK5 | 57,6% |
| GLiNER2.5-multi-Decide (287M) | 56,7% |
| SemIf (Qwen3.5-4B) | 56,4% |
| GLiFormer large-v1 | 49,0% |
| Laya Router | 46,6% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,4 GB solo para pesos (1,19B parámetros), más overhead de activaciones y del runtime; el repo ocupa 4,8 GB.
- En cuantización de 8 bits, los pesos ocuparían del orden de 1,2 GB; en 4 bits, alrededor de 0,6 GB, aunque el autor no documenta cuantizaciones soportadas.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM debería poder ejecutar el modelo en precisión reducida; para fp16 se recomienda 8-12 GB o más. GPU de datacenter (A100, H100) no son necesarias para este tamaño.
- Cabe en GPU consumer (RTX 3060 12 GB, RTX 4070, RTX 4090, entre otras).
- Despliegue: la vía documentada es la librería `gliner2` con `AutoExtractor.from_pretrained`. El modelo es compatible con `transformers` y con endpoints compatibles según los tags. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Al no generar tokens, la inferencia es una única pasada forward, lo que en principio reduce la latencia frente a modelos generativos del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Avg en fast-decisions | Licencia | Idiomas |
|---|---|---|---|---|---|
| GLiNER2.5-Decide-1B | 1,19B | no disponible | 59,6% | apache-2.0 | en |
| GLiNER2.5-Decide | 340M | no disponible | 60,2% | no disponible en la información | en |
| GLiNER2.5-multi-Decide | 287M | no disponible | 56,7% | no disponible en la información | multilingüe |
| SemIf (Qwen3.5-4B) | 4B (aprox.) | no disponible | 56,4% | no disponible en la información | no disponible |

El modelo de 340M de la misma familia obtiene una puntuación ligeramente superior (60,2% frente a 59,6%) con menos de un tercio de los parámetros, lo que sugiere que la variante de 1B no aporta ventaja en esta suite concreta. Para entradas multilingües, el autor recomienda GLiNER2.5-multi-Decide.

## Limitaciones y advertencias

- No es un modelo de propósito general: no razona, no explica ni responde preguntas abiertas.
- Entrenado exclusivamente en inglés; el rendimiento en otros idiomas no está garantizado y el autor recomienda la variante multilingüe para esos casos.
- Riesgo de alucinación de etiquetas o de asignaciones incorrectas cuando el conjunto de etiquetas es ambiguo o solapado; el autor muestra salidas como "potential output", no garantizadas.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre datos en inglés puede heredar sesgos de esos datos.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones de los modelos base (`fastino/gliner2-xl-0111`) y de los datos de entrenamiento.
- No se documentan la longitud de contexto máxima ni los tipos de cuantización soportados, lo que limita la planificación de despliegues en producción.
- El benchmark se limita a una suite propia del autor (`fast-decisions`), por lo que la comparación con terceros debe tomarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiNER2.5-Decide-1B
- Paper: https://arxiv.org/abs/2507.18546
- Repositorio GitHub: https://github.com/fastino-ai/GLiNER2
- Plataforma de fine-tuning: https://agent.fastino.ai
- Dataset de benchmark: https://huggingface.co/datasets/fastino/fast-decisions
- Modelo GLiNER2.5-Decide (340M): https://huggingface.co/fastino/GLiNER2.5-Decide
- Modelo GLiNER2.5-multi-Decide (287M): https://huggingface.co/fastino/GLiNER2.5-multi-Decide
- Modelo base: https://huggingface.co/fastino/gliner2-xl-0111
- X/Twitter: https://x.com/fastinoAI
