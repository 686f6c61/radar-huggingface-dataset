# mstrasser/jeff-adapter-assistant-routing

## Resumen

jeff-adapter-assistant-routing es un adaptador LoRA de clasificación de texto desarrollado por mstrasser sobre el modelo base jeff-base v1.4, un fine-tune de Qwen3.5-0.8B que la propia documentación describe como el "modelo de decisión abierto pequeño" de Jeff. El adaptador resuelve un problema muy concreto dentro de pipelines de agentes: determinar si el siguiente turno de un asistente requiere razonamiento cuidadoso o puede responderse directamente, de modo que los turnos simples se enruten a una ruta de respuesta más rápida y barata. La relevancia actual reside en que convierte esta decisión de enrutamiento en una clasificación calibrada de una sola pasada hacia adelante, sin generar texto que haya que parsear.

El adaptador no genera lenguaje ni elige herramientas: expone una única función, `jeff.agents.assistant-routing.needs_thinking`, que devuelve una probabilidad calibrada para cada opción (en este caso una pregunta binaria sí/no). Está entrenado sobre el modelo base jeff-base v1.4 (revision fija) y el motor rechaza cargarlo sobre cualquier otra revisión. Se publica con licencia Apache 2.0, en inglés y con formato de pesos safetensors dentro de un repositorio PEFT.

Por su naturaleza, es una pieza de infraestructura para sistemas de agentes más que un modelo de propósito general: su valor está en la calibración de la confianza y en la latencia de una pasada única, no en capacidades generativas. La información pública disponible es la model card del autor, sin resultados de benchmarks externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder jeff-base v1.4 (fine-tune de Qwen3.5-0.8B) |
| Parametros totales | no disponible (adaptador LoRA; el base es de 0.8B según la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre jeff-base v1.4, que la model card describe como un fine-tune de Qwen3.5-0.8B y como el modelo de decisión abierto pequeño de Jeff. La tarea se formula como clasificación de texto: se proporciona un contexto estructurado (cuentas del usuario, fecha y zona horaria, y la conversación hasta el momento) más un campo de entrada que describe lo que el asistente principal debe hacer en el turno, y el modelo devuelve una probabilidad calibrada por opción en una única pasada, sin texto generado que parsear.

El adaptador se entrenó el 25 de octubre de 2026. Según la model card, la etiqueta de entrenamiento es un sustituto: refleja si un LLM grande decidió pensar antes de responder, no un juicio humano. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; la única evaluación reportada es sobre conversaciones simuladas generadas por el mismo generador que los datos de entrenamiento (771 filas), lo que el propio autor advierte que mide menos que un test público o real.

## Capacidades

- Clasificación binaria calibrada: dado un contexto y un turno, predice si el asistente necesita razonar cuidadosamente antes de responder (`needs_thinking`, valores `true`/`false`).
- Salida con probabilidad calibrada por opción en una sola pasada hacia adelante, sin generación de texto ni parsing posterior.
- Enrutamiento de turnos: permite derivar turnos simples a una ruta de respuesta más rápida y económica.
- Contexto estructurado con campos obligatorios: `accounts`, `date_and_time_zone`, `conversation` y `turn`.
- Integración mediante SDK de Python (`jeff.Jeff.local` y `jeff.Jeff.remote`) y API HTTP (`/v1/decide`).
- No soporta tool calling, selección de herramientas ni razonamiento multi-step: su alcance se limita a comprobar si hace falta razonar.
- Solo inglés.

## Casos de uso

- Enrutamiento de coste en asistentes con paso de razonamiento separado: el adaptador decide, turno a turno, si conviene invocar el modelo de razonamiento caro o responder directamente con un modelo rápido; es adecuado porque devuelve una probabilidad calibrada en una pasada y con umbral de confianza configurable.
- Atención al cliente automatizada: en conversaciones multi-turno con historial y resultados de herramientas, permite detectar mensajes triviales (agradecimientos, confirmaciones) y evitar el coste de un razonamiento completo.
- Orquestación de agentes de calendario o correo: con el contexto de cuentas y fecha/zona horaria, decide si una petición como mover una reunión requiere planificación cuidadosa o es una respuesta directa.
- Control de latencia en asistentes de voz o chat en tiempo real: al clasificar con una sola pasada sobre un modelo de 0.8B, añade una sobrecarga mínima frente a la generación de texto.
- Filtrado previo en pipelines de evaluación: permite etiquetar conversaciones simuladas o reales según la necesidad de razonamiento, útil para construir datasets de entrenamiento o para analizar la distribución de turnos.
- Puerta de calidad en producción: con el umbral de confianza reportado (0.882, precisión 95.2% sobre la cobertura del 54.8%), se puede activar la ruta de razonamiento solo cuando la predicción es fiable y derivar el resto a una política conservadora.
- Investigación sobre calibración de modelos de decisión pequeños: sirve como ejemplo reproducible de adaptador LoRA con métricas de precisión y cobertura publicadas.

## Benchmarks y rendimiento

Datos reportados en la model card del autor:

| Test | Filas | Exactitud |
|---|---:|---:|
| Conversaciones simuladas reservadas (generador) | 771 | 86.6% |

Calibración de la función `needs_thinking`:

| Funcion | Umbral | Precision | Cobertura | Filas de calibracion |
|---|---:|---:|---:|---:|
| `needs_thinking` | 0.882 | 95.2% | 54.8% | 341 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte que el test de 771 filas procede del mismo generador que los datos de entrenamiento y, por tanto, mide menos que un test público o real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de un adaptador LoRA sobre un base de 0.8B, la huella es la del modelo base más el adaptador, que en el repositorio ocupa 0.0 GB.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada explícitamente, pero un base de 0.8B es compatible en principio con GPU de consumo; no se aportan datos de prueba.
- Opciones de despliegue: SDK de Python de Jeff (`jeff.Jeff.local` para ejecución local y `jeff.Jeff.remote` contra `https://api.jeffhub.ai`), y API HTTP mediante `POST /v1/decide`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo indica que la decisión se obtiene en una única pasada hacia adelante.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores de enrutamiento de razonamiento) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- La etiqueta de entrenamiento es un sustituto: registra si un LLM grande decidió pensar antes de responder, no un juicio humano, por lo que puede heredar sesgos de ese modelo etiquetador.
- La única evaluación reportada (86.6% de exactitud) procede de un generador interno con la misma distribución que los datos de entrenamiento; el rendimiento en conversaciones reales puede ser inferior.
- La cobertura de la predicción confiable es del 54.8%: casi la mitad de las decisiones quedan por debajo del umbral y requieren una política de reserva.
- Solo admite inglés; no hay soporte multilingüe declarado.
- No elige herramientas ni especialistas: únicamente comprueba si hace falta razonar; usarlo para enrutamiento de herramientas sería un error de alcance.
- Dependencia estricta de la revisión del base: el motor rechaza adaptadores entrenados sobre otra base, por lo que este adaptador solo carga sobre `mstrasser/jeff-base` en `v1.4`.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y del SDK/motor de Jeff antes de desplegar en producción.
- Riesgo de alucinación no aplicable en el sentido generativo (no produce texto libre), pero sí de calibración deficiente fuera de la distribución de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente y poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-assistant-routing
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Catálogo de Jeff: https://jeffhub.ai/catalogue/jeff.agents.assistant-routing
- Código, servidor y SDKs: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
- Plataforma Jeff: https://jeffhub.ai
- API: https://api.jeffhub.ai
