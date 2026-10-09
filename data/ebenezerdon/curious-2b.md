# ebenezerdon/curious-2b

## Resumen

Curious 2B es un modelo de generación de texto de 1.881.825.088 parámetros (~1,88B) desarrollado por el usuario ebenezerdon y publicado en octubre de 2026 (versión `curious-2b-2610`). Es un ajuste fino del modelo Qwen3.5 2B de Alibaba Cloud, con licencia Apache 2.0, diseñado específicamente para funcionar como motor del asistente privado de la aplicación CuriousLM, que se ejecuta íntegramente en el teléfono del usuario.

El problema que resuelve está bien acotado: leer el calendario, los mensajes y las notificaciones del dispositivo, distinguir un recibo legítimo de una estafa y responder en el mismo idioma en el que llegó el mensaje, sin que ningún dato abandone el terminal. Para ello incorpora dos herramientas (`check_phone` y `add_to_calendar`) y se entrenó con datos generados y verificados por código, no con conversaciones reales de usuarios.

Su interés actual está en el nicho de los asistentes on-device: conserva el tamaño, la velocidad y el formato de fichero del Qwen3.5 2B original, pero mejora de forma medible las tareas de asistente móvil (lectura correcta de notificaciones del 64,5% al 94,2%) y reduce las respuestas que afirman haber añadido un evento inexistente del 1,9% al 0,4%. Se distribuye únicamente como GGUF cuantizado Q4_0 de 1,21 GB, listo para llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso heredado de Qwen3.5 2B; detalles internos de capas y atención no disponibles en la model card |
| Parámetros totales | 1.881.825.088 (~1,88B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el ejemplo de despliegue del autor usa `-c 8192` |
| Tipos de cuantización | Q4_0 con importance matrix (imatrix) de Unsloth y tipos por tensor; es la única publicada |
| Idiomas soportados | en, es, fr, pt, de, it, nl, zh y pcm (pidgin nigeriano) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `curious-2b-2610-Q4_0.gguf`, 1.214.874.144 bytes) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de indicar que parte de Qwen3.5 2B (Alibaba Cloud, Apache 2.0), un transformer denso. El ajuste se realizó con LoRA de rango 16 y alpha 32 aplicado únicamente sobre los tokens de respuesta, con learning rate 1e-4, scheduler coseno, una época de 647 pasos y posterior fusión en los pesos base. La pérdida de evaluación sobre 449 pares reservados bajó de 1,306 a 0,979. No se menciona RLHF ni DPO: el proceso es un SFT con LoRA. Todo el entrenamiento se hizo en un único portátil con AMD Ryzen AI Max+ 395.

El conjunto de datos consta de 14.573 pares verificados (8,5 millones de tokens) en ocho idiomas más pidgin nigeriano. Cada ejemplo se construye con el propio código de CuriousLM (system prompt, definiciones de herramientas, contexto del teléfono y prompts de lectura del asistente Android) y se renderiza con la plantilla de chat de Qwen3.5 exactamente igual que lo hace la aplicación. Solo se conserva una respuesta si un verificador automático la valida: cada hora, persona, día de la semana e importe debe existir en el teléfono descrito por el prompt, "hoy" y "mañana" no pueden intercambiarse y los estados "libre" y "ocupado" deben concordar con el calendario. Los profesores fueron GLM (en el IDE Zcode) y Qwen3.5 4B; para hechos, matemáticas y explicaciones el propio modelo de 2B conservó sus respuestas originales. Como innovación de empaquetado, la exportación replica el GGUF de `unsloth/Qwen3.5-2B-GGUF` tensor a tensor: misma plantilla de chat, misma importance matrix, mismos tipos por tensor, mismo pad token y sin cabeza de predicción multi-token.

## Capacidades

- Generación de texto conversacional y respuestas de formato corto, con una media de 170 tokens por respuesta frente a los 256 del modelo base en los mismos prompts.
- Llamada a herramientas (tool calling) mediante dos funciones definidas: `check_phone`, que lee calendario, mensajes pendientes de respuesta, facturas, entregas y recordatorios, y `add_to_calendar`, que inserta eventos.
- Clasificación de mensajes y notificaciones en categorías operativas: pregunta pendiente de respuesta, factura, paquete, reserva, aviso o estafa, con extracción de qué vence y cuándo.
- Distinción explícita de límites: el modelo declara lo que no puede hacer (por ejemplo, consultar el tiempo en vivo) sin negar lo que sí puede.
- Respuestas fundamentadas en fuentes propias del usuario (documentos, diario, chats previos, resultados web y Pocket Wikipedia) con citas.
- Chat cotidiano: escritura, consejos, cocina, viajes, programación y conversación informal.
- Multilingüe en nueve variantes (ocho idiomas más pidgin nigeriano), con capacidad de responder en el idioma del mensaje entrante.
- Identidad consistente: se presenta como CuriousLM ejecutándose en el dispositivo con Curious 2B, ajustado desde Qwen3.5 2B, y no reclama ser otro asistente.
- Modo thinking desactivado en la configuración recomendada por el autor (temperature 0,7, top-p 0,8, top-k 20, presence penalty 1,5).

## Casos de uso

- Asistente de calendario en el teléfono: el modelo llama a `check_phone` para responder consultas sobre la agenda y a `add_to_calendar` para crear eventos, con una tasa de acierto del 96,8% en consultas de calendario y solo un 0,4% de falsas confirmaciones de inserción.
- Lectura y triaje de notificaciones: clasifica cada notificación entrante en pregunta, factura, paquete, reserva, aviso o estafa (94,2% de acierto frente al 64,5% del modelo base), lo que permite construir bandejas inteligentes en aplicaciones Android.
- Filtro antiphishing en SMS y avisos: el modelo distingue un recibo legítimo de una estafa, con un 100% de acierto en la evaluación de "¿tengo que pagar?"; un caso citado explícitamente es la tarifa de "reenvío de paquete" como fraude.
- Redacción asistida de respuestas: genera borradores de contestación a partir del plan del usuario (84% de acierto en la evaluación frente al 70% del base), útil para responder mensajes sin salir de la aplicación.
- Preguntas y respuestas sobre documentación personal: responde a partir de documentos, diario, historial de chat y resultados web citando las fuentes, con todo el procesamiento en local.
- Asistente de uso cotidiano sin conexión: escritura, cocina, viajes o dudas de programación en nueve variantes lingüísticas, manteniendo el modelo como compañero general mientras ejecuta tareas de asistente.
- Despliegue en aplicaciones móviles con requisitos de privacidad estrictos: al ser un GGUF estándar ejecutable con llama.cpp, permite integrar asistencia conversacional en apps sanitarias, legales o financieras donde los datos no pueden salir del dispositivo.
- Prototipado en edge y dispositivos sin GPU: el fichero de 1,21 GB cabe en teléfonos con 8 GB de memoria o más, según la recomendación del propio autor.

## Benchmarks y rendimiento

Los datos proceden de las evaluaciones held-out publicadas en la model card, ejecutando ambos modelos de la misma forma sobre los mismos casos.

| Prueba | Qwen3.5 2B | Curious 2B |
|---|---|---|
| Responde correctamente sobre el teléfono (535 turnos) | 85,4% | 93,6% |
| Acierta los detalles: día, hora, título (535 turnos) | 68,4% | 85,5% |
| Dice haber añadido un evento que no añadió | 1,9% | 0,4% |
| Consultas de calendario respondidas correctamente | 86,5% | 96,8% |
| Peticiones simples resueltas sin usar herramienta | 81,9% | 98,1% |
| Lee correctamente una notificación (519 tareas) | 64,5% | 94,2% |
| Interpreta qué significa el mensaje y quién espera | 49% | 92% |
| Determina si hay que pagar | 85% | 100% |
| Determina si algo está reservado | 95% | 100% |
| Borrador de respuesta a partir del plan del usuario | 70% | 84% |
| Hechos en conversación cotidiana (360 preguntas) | 87,2% | 92,2% |
| Sabe quién es (72 preguntas, 8 idiomas) | 50% | 87,5% |
| Respuestas abiertas que nombran algo ausente en la referencia | 63,8% | 52,4% |

Además, la longitud media de respuesta baja de 256 a 170 tokens en los mismos prompts cotidianos.

## Requisitos de hardware

- Tamaño del fichero: 1.214.874.144 bytes (1,21 GB) en Q4_0.
- Memoria del dispositivo: el autor recomienda teléfonos con 8 GB de RAM o más.
- VRAM estimada: no publicada de forma oficial; con un fichero de 1,21 GB, la inferencia requiere del orden de 1,5 a 2,5 GB contando caché KV según la longitud de contexto (estimación propia, no dato de la model card).
- GPU compatibles: cualquier GPU de consumo con 2-3 GB de VRAM o más; cabe con holgura en RTX 3060, RTX 4060, RTX 4090 y equivalentes. También es viable en CPU.
- Despliegue: llama.cpp y todo lo construido sobre él (llama-server, Ollama, LM Studio). El autor documenta el arranque con `llama-server -m curious-2b-2610-Q4_0.gguf --jinja -c 8192`. El repositorio incluye el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles. El único dato relacionado es la reducción de longitud de respuesta (170 tokens frente a 256), que en móvil se traduce en respuestas visibles antes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Curious 2B (curious-2b-2610) | 1.881.825.088 | no disponible | Apache 2.0 | GGUF Q4_0 en HuggingFace | Ajuste de Qwen3.5 2B orientado a asistente de teléfono con tool calling |
| Qwen3.5 2B (modelo base) | misma arquitectura y empaquetado (mismo fichero Q4_0) | no disponible | Apache 2.0 | HuggingFace | Alibaba Cloud; peor en tareas de asistente móvil según las evaluaciones del autor |
| Qwen3.5 4B (profesor en la generación de datos) | no disponible | no disponible | no disponible | no disponible | Usado para generar respuestas de tareas de asistente; no compite como alternativa desplegable en móvil |
| Otros asistentes on-device de ~2B | no disponible | no disponible | no disponible | no disponible | No se han encontrado alternativas comparables en la información proporcionada |

La información disponible no permite una comparación con alternativas externas de la misma categoría (Gemma, Phi, Llama pequeños) porque no se aportan datos de benchmarks de esos modelos en la documentación analizada.

## Limitaciones y advertencias

- Las herramientas `check_phone` y `add_to_calendar` solo tienen sentido dentro de CuriousLM, que es quien proporciona el contexto del teléfono. Fuera de la aplicación, el modelo no puede leer calendario ni mensajes.
- Riesgo de alucinación residual: en la evaluación, el 0,4% de las respuestas afirma haber añadido un evento que nunca se añadió. Es una mejora sobre el 1,9% del base, pero no es cero.
- Las respuestas abiertas que nombran algo no presente en la referencia bajan del 63,8% al 52,4%. El dato admite lecturas distintas (menos invención o menos variedad) y el autor no lo interpreta.
- Longitud de contexto no especificada en la model card. El valor de 8192 aparece solo como parámetro de ejemplo en el comando de llama-server, no como límite confirmado del modelo.
- Cobertura lingüística declarada de nueve variantes, pero no se publican métricas desagregadas por idioma, por lo que el rendimiento fuera del inglés puede ser desigual.
- Los datos de entrenamiento son íntegramente generados y verificados por código, sin conversaciones reales de usuarios. Esto introduce un sesgo hacia los patrones sintéticos del sistema de la aplicación.
- Solo se publica una cuantización Q4_0. No hay versiones de mayor precisión, ni safetensors, ni otros formatos en el repositorio.
- Licencia Apache 2.0, sin restricciones comerciales conocidas, pero conviene verificar los términos del modelo base Qwen3.5 2B y de los datasets empleados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no existe validación independiente de la comunidad sobre los resultados declarados.
- El repositorio no incluye pesos en safetensors; el dato de parámetros totales procede de la información del modelo, no de un fichero alternativo en el repo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ebenezerdon/curious-2b
- Modelo base Qwen3.5 2B: https://huggingface.co/Qwen/Qwen3.5-2B
- GGUF de referencia de Unsloth: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Aplicación CuriousLM: https://curiouslm.com
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset AmazonScience/massive: https://huggingface.co/datasets/AmazonScience/massive
- Dataset nvidia/When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Paper asociado a MASSIVE (arXiv:2204.08582): https://arxiv.org/abs/2204.08582
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (listados de Facebook Marketplace) y se han descartado por no ser fuentes utilizables.
