# anerjy/Attache-Router-0.8B-4bit-mlx

## Resumen

Attache Router 0.8B es un modelo de lenguaje especializado desarrollado por el usuario anerjy (Attache) a partir de Qwen/Qwen3.5-0.8B mediante un fine-tuning con LoRA fusionado. Su función no es la conversación general, sino actuar como enrutador de intenciones: recibe una frase dictada a un asistente de secretaría offline para teléfono y la transforma en una única acción JSON entre un conjunto cerrado de nueve operaciones (`create_event`, `query_events`, `edit_event`, `create_reminder`, `query_reminders`, `edit_reminder`, `search_contact`, `answer`, `clarify`).

El modelo se distribuye en formato MLX con cuantización affine de 4 bits y grupo de 64, lo que reduce el repositorio a 0,4 GB y permite ejecutarlo en hardware Apple Silicon. Cuenta con 752.393.024 parámetros reales según los safetensors, es solo texto (se ha eliminado la torre de visión del modelo base) y está entrenado exclusivamente con frases sintéticas en chino, inglés y español.

Su relevancia radica en el nicho: es un componente de infraestructura para aplicaciones móviles que necesitan clasificación de intenciones local, de baja latencia y sin conexión, en lugar de un modelo conversacional. No obstante, depende del system prompt y del prefijo few-shot propios de la aplicación Attache, por lo que no es un modelo de chat de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), fine-tuning LoRA fusionado; torre de visión eliminada (solo texto) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64 |
| Idiomas soportados | chino (zh), ingles (en), espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se ha adaptado mediante LoRA cuyo resultado se ha fusionado en los pesos finales. La modificación estructural principal es la eliminación de la torre de visión del modelo base, dejando un modelo exclusivamente textual. La cuantización aplicada es affine de 4 bits con grupo de 64, propia del ecosistema MLX de Apple, lo que explica el tamaño de 0,4 GB del repositorio frente a los 752 millones de parámetros.

El entrenamiento se realizó únicamente con frases sintéticas en chino, inglés y español, orientadas a la tarea de enrutamiento de intenciones hacia un JSON de acción. No hay información disponible sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre el uso de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación y enrutamiento de intenciones: convierte una frase en una única acción JSON entre nueve posibles (`create_event`, `query_events`, `edit_event`, `create_reminder`, `query_reminders`, `edit_reminder`, `search_contact`, `answer`, `clarify`).
- Extracción de parámetros de la acción: al generar el JSON, el modelo debe rellenar los campos asociados a cada operación (fechas, contactos, títulos, etc.), aunque la model card no detalla el esquema completo.
- Multilingüe limitado: chino, inglés y español, únicamente en el registro de frases dictadas a un asistente de secretaría.
- Funcionamiento offline: diseñado para ejecutarse localmente en el dispositivo, sin dependencia de red.
- No soporta tool calling genérico, agentes multi-paso ni razonamiento extendido más allá de la tarea de enrutamiento.
- No dispone de visión, audio ni modo thinking: la torre de visión fue eliminada y el modelo es solo texto.
- Requiere el system prompt y el prefijo few-shot específicos de la aplicación Attache; fuera de ese contexto no funciona como chat general.

## Casos de uso

- Enrutamiento de comandos en una app de secretaría offline: el modelo recibe la transcripción de voz del usuario y devuelve el JSON de acción que la app ejecuta localmente; su tamaño de 0,4 GB y su ejecución en MLX lo hacen viable en un iPhone o Mac sin conexión.
- Creación de eventos de calendario por voz: ante frases como una cita con fecha y hora, el modelo emite `create_event` con los campos extraídos, integrándose en el flujo de dictado de la aplicación.
- Consulta de eventos y recordatorios: permite preguntas del tipo "¿qué tengo mañana?" mapeadas a `query_events` o `query_reminders`, con la ventaja de que la consulta se resuelve en el dispositivo sin enviar datos personales a la nube.
- Edición de entradas existentes: frases de corrección ("cambia la reunión a las cinco") se enrutan a `edit_event` o `edit_reminder`, lo que exige que el modelo distinga entre creación y modificación.
- Búsqueda de contactos: la acción `search_contact` cubre peticiones de localización de personas en la agenda, un caso típico de asistente personal por voz.
- Gestión de ambigüedad: las acciones `answer` y `clarify` permiten al modelo responder directamente o solicitar aclaración cuando la frase no basta para determinar la intención, evitando ejecuciones erróneas.
- Prototipado de asistentes de voz multilingües: sirve como referencia para desarrolladores que quieran replicar un enrutador de intenciones pequeño y cuantizado en MLX para chino, inglés y español.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 0,4 GB en cuantización 4-bit, por lo que la inferencia requiere del orden de 0,5-1 GB de memoria unificada, incluyendo overhead del runtime.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y superiores) mediante MLX; no está pensado para CUDA.
- Cabe en cualquier Mac moderno con memoria unificada de 8 GB o más, y en iPhone/iPad compatibles con MLX.
- Despliegue: librería `mlx` (MLX de Apple); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado el formato específico MLX 4-bit.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia de milisegundos en Apple Silicon, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Attache Router 0.8B (este) | 752 M | no disponible | MLX 4-bit safetensors | Apache 2.0 | Enrutamiento de intenciones JSON para secretaría offline |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | safetensors | no disponible en la informacion | Modelo generalista multimodal del que deriva |
| Alternativas de enrutamiento de intenciones de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de chat general: solo funciona correctamente con el system prompt y el prefijo few-shot de la aplicación Attache; usarlo fuera de ese contexto produce resultados no fiables.
- Entrenado exclusivamente con frases sintéticas: puede generalizar mal a lenguaje natural espontáneo, dialectos, ruido de transcripción o frases ambiguas no cubiertas en el dataset.
- Idiomas limitados a chino, inglés y español; no hay soporte documentado para otras lenguas.
- Riesgo de alucinación en los campos del JSON: puede inventar fechas, nombres de contactos o títulos si la frase es incompleta, sin que se documenten mecanismos de validación.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3.5 y entrenarse con datos sintéticos, puede heredar sesgos del modelo base y de la plantilla de generación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B, cuya licencia no se detalla en la información disponible.
- Formato MLX 4-bit: no es portable directamente a CUDA ni a otros runtimes sin reconversión; el soporte de herramientas de serving estándar no está documentado.
- Contexto máximo no especificado: no se puede garantizar el comportamiento con prefijos few-shot largos o conversaciones multi-turno extensas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anerjy/Attache-Router-0.8B-4bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio MLX: https://github.com/ml-explore/mlx
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
