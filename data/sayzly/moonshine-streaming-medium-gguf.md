# sayzly/moonshine-streaming-medium-gguf

## Resumen

Moonshine Streaming Medium (GGUF) es una conversión al formato GGUF del modelo de reconocimiento automático del habla `moonshine-ai/moonshine-streaming-medium`, publicada por el usuario `sayzly`. El modelo original lo desarrolla Moonshine AI y está orientado a transcripción de voz en streaming, es decir, a producir texto de forma incremental a medida que llega el audio, lo que lo hace adecuado para aplicaciones de dictado, subtitulado o asistentes de voz con baja latencia.

La conversión incluye un único fichero cuantizado en Q8_0 (`moonshine-streaming-medium-Q8_0.gguf`), lo que reduce el peso del modelo respecto a los pesos originales y facilita su despliegue en entornos con recursos limitados mediante runtimes compatibles con GGUF. El repositorio ocupa aproximadamente 0,3 GB y declara 265.898.113 parámetros en los pesos originales (safetensors), lo que sitúa al modelo en la categoría de tamaño medio para tareas de ASR.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de speech-to-text en local sin depender de infraestructura en la nube, manteniendo la licencia MIT del modelo original. No obstante, la información publicada por el autor de la conversión es mínima y no incluye detalles sobre el proceso de cuantización, los idiomas soportados ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base orientado a ASR en streaming) |
| Parametros totales | 265.898.113 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `moonshine-ai/moonshine-streaming-medium` en la información proporcionada. Por el nombre y la etiqueta de pipeline (`automatic-speech-recognition`), se trata de un modelo de reconocimiento del habla diseñado para operar en modo streaming, pero no se especifican en la documentación disponible el tipo de encoder/decoder, el mecanismo de atención ni la composición del dataset de entrenamiento.

Tampoco se documentan en la información disponible el número de horas de audio utilizadas, la presencia de técnicas de ajuste fino supervisado o preferencias (RLHF/DPO), ni innovaciones técnicas concretas como decodificación especulativa o atención lineal. La conversión GGUF publicada por `sayzly` no añade información sobre el proceso de entrenamiento; únicamente transforma los pesos originales al formato GGUF con cuantización Q8_0.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) a partir de audio de entrada.
- Orientación a transcripción en streaming, según la denominación del modelo base.
- Formato GGUF compatible con runtimes de inferencia locales que soporten este formato.
- No se documentan en la información disponible capacidades de traducción, diarización de hablantes, detección de idioma, tool calling ni razonamiento multi-paso.
- No se documentan capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Subtitulado en directo de reuniones o clases: el modelo puede consumir audio de un micrófono o stream y generar texto de forma incremental, aprovechando su orientación a streaming para reducir la latencia percibida.
- Dictado por voz en aplicaciones de escritorio: al distribuirse en GGUF, puede integrarse en herramientas locales que transcriban notas de voz sin enviar audio a servicios externos.
- Transcripción de llamadas de atención al cliente: permite procesar audio de conversaciones y obtener texto para análisis posterior o registro, ejecutándose en infraestructura propia.
- Asistentes de voz embebidos: su tamaño (265,9 M de parámetros) y su cuantización Q8_0 permiten desplegarlo en dispositivos con recursos moderados, siempre que el runtime soporte GGUF.
- Generación de actas automáticas en herramientas de productividad: combinado con un pipeline de post-procesado, puede alimentar sistemas de resumen a partir de la transcripción.
- Investigación en ASR: sirve como punto de partida reproducible para experimentar con modelos de transcripción en streaming en entornos académicos, gracias a su licencia MIT y a su formato ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 265,9 M de parámetros y cuantización Q8_0, el fichero ronda los 0,3 GB, por lo que la huella de memoria es reducida en comparación con modelos de mayor tamaño.
- GPU recomendadas: no disponible. Por tamaño, el modelo podría ejecutarse en GPUs de consumo, pero no se confirma compatibilidad ni rendimiento.
- ¿Cabe en GPU de consumo? Con alta probabilidad sí, dado el tamaño del fichero, aunque no se documenta oficialmente.
- Opciones de despliegue: runtimes compatibles con GGUF (por ejemplo, llama.cpp u otros que soporten el formato). No se confirma soporte específico de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sayzly/moonshine-streaming-medium-gguf | 265.898.113 | no disponible | MIT | GGUF (Q8_0) | Conversión comunitaria del modelo de Moonshine AI |
| moonshine-ai/moonshine-streaming-medium | 265.898.113 | no disponible | MIT | safetensors (original) | Modelo base oficial |
| Otras alternativas ASR | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La información publicada por el autor de la conversión es mínima: no se detallan idiomas, métricas ni proceso de cuantización.
- Al ser una conversión comunitaria (no oficial), no hay garantía de que el comportamiento sea idéntico al del modelo original en safetensors.
- Riesgo de errores de transcripción inherente a los sistemas ASR, especialmente en audio con ruido, acentos o solapamiento de hablantes; no se documentan tasas de error.
- No se especifican sesgos conocidos del modelo base en la información disponible.
- La licencia MIT permite uso comercial, pero conviene verificar los términos del modelo original y las condiciones de atribución.
- No se documenta el rendimiento en streaming real ni la latencia, por lo que su idoneidad para producción debe validarse empíricamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/moonshine-streaming-medium-gguf
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-medium
