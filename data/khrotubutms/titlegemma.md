# khrotubutms/titlegemma

## Resumen

titlegemma es un ajuste fino (fine-tuning) del modelo google/gemma-3-270m-it, desarrollado por el usuario khrotubutms y publicado en Hugging Face. Su proposito es muy concreto: generar titulos cortos y descriptivos (3-8 palabras, en Title Case, sin emojis ni markdown) a partir del primer mensaje de una conversacion. No es un modelo de proposito general, sino un componente especializado pensado para integrarse en interfaces de chat que necesitan etiquetar conversaciones automaticamente.

El modelo parte de la arquitectura Gemma 3 en su variante de texto, con 268.098.176 parametros totales (aproximadamente 270 millones) y un tamano de repositorio de 1,1 GB, lo que incluye pesos en safetensors y conversiones a GGUF. Al derivar de la version instruct del modelo base, hereda su formato de chat con turnos delimitados por etiquetas y su licencia Gemma.

Su relevancia es practica mas que investigadora: demuestra como un modelo pequeno, ajustado con LoRA sobre un dataset sintetico de 48.513 pares generados por otro modelo (inclusionai/ling-2.6-flash), puede resolver una tarea acotada de generacion de texto con un coste de inferencia minimo y posibilidad de despliegue local. Es un ejemplo de destilacion de tarea sobre un modelo compacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante gemma3_text) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso secuencias de 256 tokens) |
| Tipos de cuantizacion | No disponible de forma explicita; el repositorio incluye pesos GGUF, lo que permite cuantizaciones habituales de llama.cpp/Ollama |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Gemma (terminos de Google, https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por LoRA del checkpoint google/gemma-3-270m-it, que pertenece a la familia Gemma 3 de Google y se etiqueta en Hugging Face como gemma3_text, es decir, la variante exclusivamente de texto. El ajuste se realizo con r=16 y alpha=32, con enmascaramiento de perdida solo en la parte de completion (completion-only loss masking), 2 epocas, tamano de lote efectivo de 32, longitud maxima de secuencia de 256 tokens y precision BF16, sobre 2 GPU NVIDIA T4.

El dataset de entrenamiento consta de 48.513 pares de primer mensaje de chat y titulo, derivados de lmsys/lmsys-chat-1m, donde los titulos fueron generados por inclusionai/ling-2.6-flash. Es decir, se trata de un proceso de destilacion de una tarea concreta desde un modelo mayor hacia uno de 270 millones de parametros. No se documentan fases de RLHF o DPO adicionales; el modelo base ya es instruct y el ajuste se limita a la tarea de titulacion. No se especifican innovaciones arquitectonicas propias, mas alla de las del modelo base.

## Capacidades

- Generacion de titulos cortos y descriptivos (3-8 palabras) a partir del primer mensaje de una conversacion, en formato Title Case.
- Salida limpia: sin emojis, sin comillas y sin marcado Markdown, segun la model card.
- Generacion de texto conversacional heredada del modelo base instruct, con el formato de turnos de Gemma 3.
- Uso mediante la plantilla de chat de Gemma 3 (`<start_of_turn>user ... <end_of_turn>` y `<start_of_turn>model ...`).
- Compatibilidad con despliegue via transformers, text-generation-inference y Ollama (etiqueta ollama y pesos GGUF en el repositorio).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion proporcionada.

## Casos de uso

- Titulacion automatica de conversaciones en interfaces de chat: dado el primer mensaje del usuario, el modelo devuelve una etiqueta breve para el historial o la barra lateral, reduciendo la necesidad de intervencion manual.
- Organizacion y busqueda de historiales: los titulos generados sirven como metadatos indexables para agrupar y recuperar conversaciones en un panel de usuario.
- Etiquetado de tickets de soporte: a partir de la descripcion inicial del problema, se obtiene un resumen corto que facilita el triaje y la asignacion a colas.
- Clasificacion ligera de intenciones en asistentes: el titulo generado puede actuar como senal auxiliar para enrutar la conversacion a un flujo u otro.
- Generacion de asuntos en correo o mensajeria: el modelo puede producir una linea de asunto concisa a partir del primer parrafo de un hilo.
- Despliegue en local o en el borde: con 270 millones de parametros y pesos GGUF, puede ejecutarse en CPU o en GPU consumer para prototipos y aplicaciones de bajo coste donde no se quiere depender de una API externa.
- Generacion de nombres para sesiones de agentes o notebooks: util para etiquetar automaticamente sesiones de trabajo a partir de la primera instruccion del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los pesos de 268 millones de parametros ocupan aproximadamente 0,54 GB; en FP32, alrededor de 1,07 GB. Con cuantizaciones de 8 bits o 4 bits, el peso cae por debajo de 0,3 GB. La memoria adicional depende de la longitud de contexto y del tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente en la practica; el entrenamiento se realizo en 2x NVIDIA T4, lo que da una idea del perfil de recursos necesario.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para inferencia con GGUF.
- Opciones de despliegue: transformers, text-generation-inference, llama.cpp y Ollama (el repositorio incluye GGUF y la etiqueta ollama), ademas de endpoints compatibles segun las etiquetas del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| titlegemma (este modelo) | 268.098.176 | No disponible | Titulacion de conversaciones | Gemma | Hugging Face, GGUF, Ollama |
| google/gemma-3-270m-it (base) | Aproximadamente 270M | No disponible | Generacion de texto instruct general | Gemma | Hugging Face |
| inclusionai/ling-2.6-flash | No disponible | No disponible | Generacion de texto y generacion de titulos (usado como profesor) | No disponible | Hugging Face |

La comparacion se limita a los modelos citados en la informacion proporcionada. No se dispone de datos de rendimiento comparativo entre ellos, por lo que la tabla solo refleja parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente especializado: su entrenamiento esta orientado exclusivamente a generar titulos a partir del primer mensaje; su rendimiento en otras tareas no esta documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinacion: al ser un modelo pequeno destilado de otro modelo, puede generar titulos que no reflejen fielmente el contenido del mensaje, especialmente con entradas ambiguas, muy largas o en idiomas distintos del ingles.
- Sesgos: al entrenarse sobre lmsys-chat-1m y con titulos generados por otro modelo, puede heredar sesgos de contenido y de estilo de ambos; no se documenta ninguna evaluacion de sesgo.
- Idioma: no se especifican los idiomas soportados; el dataset de origen es mayoritariamente en ingles, por lo que la calidad en castellano u otros idiomas no esta garantizada.
- Restricciones de licencia: hereda la licencia Gemma de Google, con sus terminos de uso (https://ai.google.dev/gemma/terms); es necesario revisarlos antes de un uso comercial.
- Formato de salida: el modelo esta entrenado para producir titulos sin comillas, emojis ni markdown; no debe esperarse un formato distinto ni instrucciones de sistema complejas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa ni benchmarks publicados; conviene evaluarlo en el dominio propio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khrotubutms/titlegemma
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Dataset de origen: https://huggingface.co/datasets/lmsys/lmsys-chat-1m
- Modelo generador de titulos (profesor): https://huggingface.co/inclusionAI/Ling-2.6-flash
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
