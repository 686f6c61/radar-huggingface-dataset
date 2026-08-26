# cicada-ai/Chanjing-Avatar-V2V-5B

## Resumen

Chanjing-Avatar V2V 5B es un modelo de generación de video de avatares controlado por audio, desarrollado por cicada-ai. Se basa en el modelo de difusión de video Wan2.2-TI2V-5B de Wan-AI y está diseñado para la tarea de video-to-video: dado un video fuente y una pista de audio, regenera la región facial del protagonista para que los labios se sincronicen con el discurso, mientras preserva el movimiento del cuerpo, la cámara y el fondo del video original. El modelo se distribuye como un checkpoint adicional (326 millones de parámetros en safetensors) que se combina con el modelo base de 5 mil millones de parámetros, y se integra mediante la librería diffusers.

Este modelo resuelve el problema de la animación de avatares parlantes a partir de vídeo existente, una tarea relevante para doblaje, localización de contenido, presentadores virtuales y creación de personajes sintéticos. Su enfoque de video-to-video, en lugar de image-to-video, permite conservar la identidad visual y el movimiento natural del sujeto original, lo que reduce el coste de producción frente a métodos que requieren reconstrucción completa. La licencia Apache 2.0 facilita su uso comercial, aunque el autor advierte sobre la necesidad de obtener consentimiento para los vídeos y voces utilizados y de divulgar la naturaleza sintética del contenido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de video (video-to-video) basada en Wan2.2-TI2V-5B |
| Parametros totales | 5B (modelo base) + 326M (checkpoint V2V) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo de difusión de video Wan2.2-TI2V-5B, que emplea una arquitectura de transformer con atención espacial y temporal para generar secuencias de video. El checkpoint V2V añade una rama de condicionamiento por audio, que procesa la pista de audio mediante un extractor de características (probablemente wav2vec2, como se menciona en la documentación) y la inyecta en el proceso de difusión para guiar la sincronización labial. El entrenamiento se realizó de extremo a extremo, aunque no se han publicado detalles sobre el dataset, el número de tokens de video o el uso de técnicas como RLHF o DPO. La innovación principal reside en la preservación del movimiento del cuerpo, la cámara y el fondo, limitando la regeneración a la región facial, lo que reduce la inconsistencia temporal y mejora la coherencia visual.

## Capacidades

- Generación de video de avatar parlante a partir de un video fuente y una pista de audio.
- Sincronización labial precisa con el discurso de entrada.
- Preservación del movimiento corporal, de cámara y de fondo del video original.
- Regeneración selectiva de la región facial, manteniendo la identidad del sujeto.
- Soporte para video-to-video, no para image-to-video (esa variante está en el modelo Chanjing-Avatar 14B).
- No incluye capacidades de texto, código, razonamiento ni tool calling.

## Casos de uso

- Doblaje de películas y series: el modelo permite reemplazar el audio original de un video manteniendo la sincronización labial, lo que agiliza la localización de contenido audiovisual.
- Presentadores virtuales para noticias o canales de YouTube: se puede generar un video de un presentador hablando a partir de un video de referencia y un guion de audio, reduciendo el coste de producción.
- Localización de cursos educativos: los videos de formación pueden adaptarse a otros idiomas sin necesidad de regrabar, preservando el movimiento y la expresión del instructor.
- Creación de personajes para videojuegos o animación: a partir de un video de un actor, se puede animar un personaje con diálogos generados, manteniendo la actuación original.
- Mejora de videos existentes con nuevas voces: por ejemplo, añadir narración a videos mudos o corregir errores de audio sin volver a grabar.
- Generación de avatares para asistentes virtuales o chatbots con presencia visual: el modelo puede producir un video del avatar hablando en tiempo real (si se integra con un sistema de síntesis de voz).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos específicos de hardware en la documentación del modelo.
- Dado que el modelo base tiene 5 mil millones de parámetros, se estima que la inferencia requiere al menos 16 GB de VRAM con cuantización (por ejemplo, en una RTX 4090 o A100) y 24 GB o más para precisión completa.
- El checkpoint adicional de 326M de parámetros añade una carga moderada, pero el cuello de botella principal es el modelo base.
- Para despliegue, se puede utilizar la librería diffusers de Hugging Face, que soporta generación de video. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen de la resolución y duración del video generado; no se han publicado cifras concretas.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos de avatar parlante en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente que los usuarios son responsables de obtener consentimiento para los videos y voces utilizados, y de divulgar claramente que el contenido es sintético.
- El modelo puede heredar sesgos del modelo base Wan2.2-TI2V-5B, que no han sido evaluados en este contexto.
- Existe riesgo de alucinaciones visuales, especialmente en la región facial si el audio no coincide con el movimiento del video original.
- No se especifican los idiomas soportados; la extracción de audio se basa en wav2vec2, que está entrenado principalmente en inglés, por lo que el rendimiento en otros idiomas puede degradarse.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Wan2.2-TI2V-5B tiene su propia licencia (probablemente Apache 2.0 también, pero debe verificarse).
- El checkpoint V2V requiere el modelo base y el extractor de audio por separado, lo que añade complejidad al despliegue.

## Enlaces

- [HuggingFace - Chanjing-Avatar V2V 5B](https://huggingface.co/cicada-ai/Chanjing-Avatar-V2V-5B)
- [GitHub - chanjing-ai/Jogg-Avatar-V2V](https://github.com/chanjing-ai/Jogg-Avatar-V2V)
- [Modelo base Wan2.2-TI2V-5B](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B)
