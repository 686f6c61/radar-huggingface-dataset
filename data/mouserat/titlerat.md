# Mouserat/titlerat

## Resumen

titlerat v1 es un modelo de generacion de texto especializado en una unica tarea: producir un titulo corto (una frase nominal) que resuma el tema y el tipo de una peticion conversacional. Lo desarrolla el usuario de HuggingFace Mouserat y esta pensado para poner nombre a las conversaciones en las listas de historial de una interfaz de chat, no para generar respuestas. Deriva por fine-tuning de google/mt5-small, un transformer encoder-decoder de tipo T5 multilingue con 300.168.576 parametros totales, publicado bajo licencia Apache-2.0.

El modelo resuelve un problema de producto mas que de investigacion: etiquetar automaticamente sesiones de chat en japones e ingles sin consumir la ventana de contexto de un LLM grande ni pagar por llamadas a una API. Su entrada no es texto libre, sino un formato delimitado por cuatro tokens especiales anadidos (`<user>`, `</user>`, `<assistant>`, `</assistant>`) que separan la peticion del usuario de la respuesta del asistente, de modo que el titulo refleje el intercambio completo.

Es relevante ahora por su perfil de coste: al partir de mt5-small y distribuirse en safetensors en FP32 con un repo de 1,2 GB, puede ejecutarse en CPU o en GPUs de consumo muy modestas. La contrapartida es que sus capacidades quedan estrictamente acotadas a la generacion de titulos en japones e ingles; no es un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5, base google/mt5-small) |
| Parametros totales | 300.168.576 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos se distribuyen en FP32 |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache-2.0 (pesos y codigo; el modelo base tambien es Apache-2.0) |
| Formato de pesos | safetensors (`model.safetensors`, FP32); incluye `tokenizer.json` con tokens especiales y `manifest.json` con el SHA-256 de los pesos |

## Arquitectura y entrenamiento

La arquitectura es la de google/mt5-small, un transformer encoder-decoder con atencion completa (no se documentan variantes de atencion lineal ni decodificacion especulativa). El modelo se ha afinado para text2text-generation con una salida restringida en la practica a titulos cortos. La innovacion tecnica relevante no esta en la arquitectura, sino en la interfaz: se anaden cuatro tokens especiales de delimitacion al tokenizer, y es obligatorio usar el tokenizer del propio repositorio para que esos tokens se mapeen correctamente.

El entrenamiento parte de tres datasets publicos bajo Apache-2.0: OysterCoreAI/SFT-General-Japanese-60K, kunishou/oasst1-chat-44k-ja y shisa-ai/shisa-v2-sharegpt, complementados con datos propios (conversaciones de rechazo y de animales). El dataset final de entrenamiento no esta publicado; el autor indica que lo hara mas adelante. Parte de las etiquetas de titulo se generaron con Qwen/Qwen3.5-4B segun la model card, lo que introduce una dependencia indirecta de las salidas de ese modelo. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generacion de titulos cortos en forma de frase nominal para conversaciones de chat, a partir del par peticion/respuesta.
- Comprension de entrada estructurada mediante los tokens especiales `<user>`, `</user>`, `<assistant>` y `</assistant>`.
- Funcionamiento bilingue japones-ingles, con mejor comportamiento documentado en japones.
- Salida deliberadamente sin cuerpo de respuesta: no genera texto conversacional, solo la etiqueta.
- No soporta tool calling ni function calling.
- No soporta comportamiento agentico ni razonamiento multi-paso.
- No tiene modo thinking, vision ni audio.
- No realiza juicios de seguridad ni decisiones de rechazo; eso corresponde al modelo de chat que acompaña.

## Casos de uso

- **Titulado de historial en interfaces de chat**: al cerrar o pausar una conversacion, se pasa el par peticion/respuesta al modelo y se escribe el titulo resultante en la lista de sesiones; el coste por operacion es minimo frente a reutilizar el LLM principal.
- **Etiquetado masivo retrospectivo de sesiones**: para migrar un historico antiguo de conversaciones sin titulo, se puede procesar por lotes en CPU, ya que el modelo cabe holgadamente en memoria y no requiere GPU.
- **Agrupacion y busqueda de conversaciones**: los titulos generados sirven como clave de indice para que el usuario recupere conversaciones por tema sin releer el hilo completo.
- **Analitica de producto sobre temas de consulta**: al ser titulos consistentes y cortos, permiten agregar frecuencias de temas en un panel interno para detectar que tipo de peticiones dominan.
- **Aplicaciones japonesas con soporte secundario en ingles**: productos cuyo publico principal escribe en japones y que necesitan un titulador barato autoalojado, sin enviar conversaciones a una API externa por motivos de privacidad.
- **Despliegue en entornos con recursos limitados**: servidores sin GPU o instancias pequenas donde no es viable mantener un LLM adicional solo para etiquetar; 300 millones de parametros en FP32 son asumibles en RAM convencional.
- **Generacion de asuntos para hilos de soporte**: en un sistema de tickets conversacionales, el titulo generado puede precargar el campo de asunto que el agente humano revisa y corrige.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en FP32 ocupan aproximadamente 1,2 GB; la inferencia completa con activaciones se mantiene por debajo de los 2 GB en la mayoria de configuraciones.
- Cabe en CPU sin problema y en cualquier GPU de consumo; no requiere A100 ni H100.
- GPU de consumo adecuadas: GTX 1650, RTX 3060, RTX 4060 o superiores, aunque el modelo esta sobredimensionado para ellas y normalmente la CPU es suficiente.
- Opciones de despliegue: transformers con PyTorch (ruta documentada por el autor); al no publicarse pesos GGUF, llama.cpp y Ollama requeririan conversion previa. vLLM y TGI son compatibles en teoria con arquitecturas encoder-decoder T5, pero no hay confirmacion del autor para este checkpoint.
- Throughput y latencia: no disponibles. Por el tamano del modelo y la longitud corta de salida, se espera una latencia muy baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Mouserat/titlerat | 300.168.576 | no disponible | ja, en | Apache-2.0 | Titulado de conversaciones |
| google/mt5-small (base) | 300.168.576 | no disponible | multilingue (mT5) | Apache-2.0 | Text2text generico |
| google/mt5-base | no disponible en la informacion proporcionada | no disponible | multilingue (mT5) | Apache-2.0 | Text2text generico |
| Qwen/Qwen3.5-4B | no disponible en la informacion proporcionada | no disponible | no disponible | Apache-2.0 (segun la model card de titlerat) | LLM generativo usado para etiquetar parte de los datos |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de titlerat frente a alternativas; la comparacion disponible se limita a tamano, licencia y enfoque.

## Limitaciones y advertencias

- En peticiones largas el modelo confunde el tema con mas frecuencia que en peticiones cortas, segun reconocimiento explicito del autor.
- Las peticiones largas en ingles rinden peor que las equivalentes en japones.
- En idiomas no entrenados (chino, coreano, etc.) puede copiar fragmentos literales de la peticion o mezclar idiomas en la salida; solo japones e ingles estan soportados.
- Los titulos reflejan el tema de la peticion, incluido contenido danino: no hay filtrado ni moderacion en la salida.
- No debe usarse para generar respuestas, evaluar seguridad, decidir rechazos ni presentar hechos; el titulo es una sintesis y no garantiza correccion del contenido.
- Riesgo de alucinacion acotado por la tarea, pero presente en forma de titulos que nombran temas no presentes en la conversacion.
- Parte de las etiquetas de entrenamiento se generaron con Qwen/Qwen3.5-4B, lo que puede transmitir sesgos de ese modelo a los titulos.
- El dataset de entrenamiento no esta publicado, lo que limita la reproducibilidad y la auditoria de sesgos.
- Es imprescindible usar el tokenizer del repositorio: con otro tokenizer los cuatro tokens especiales no se resuelven y la entrada queda mal formada.
- Licencia Apache-2.0, sin restricciones conocidas para uso comercial; se recomienda conservar los avisos de atribucion del modelo base.
- El modelo tiene 0 descargas y 2 likes en el momento de la consulta: es un artefacto reciente y sin validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/Mouserat/titlerat
- Perfil del autor: https://huggingface.co/Mouserat
- Dataset OysterCoreAI/SFT-General-Japanese-60K: https://huggingface.co/datasets/OysterCoreAI/SFT-General-Japanese-60K
- Dataset kunishou/oasst1-chat-44k-ja: https://huggingface.co/datasets/kunishou/oasst1-chat-44k-ja
- Dataset shisa-ai/shisa-v2-sharegpt: https://huggingface.co/datasets/shisa-ai/shisa-v2-sharegpt
- Modelo base google/mt5-small: https://huggingface.co/google/mt5-small
