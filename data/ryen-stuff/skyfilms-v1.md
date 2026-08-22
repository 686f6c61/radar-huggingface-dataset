# ryen-stuff/SkyFilms-V1

## Resumen

SkyFilms-V1 es un modelo de generación de vídeo a partir de imagen (image-to-video) publicado por el usuario de Hugging Face ryen-stuff. Está basado en CogVideoX-5b-I2V, el modelo de imagen a vídeo de 5 mil millones de parámetros de Zhipu AI, y utiliza el pipeline `CogVideoXImageToVideoPipeline` de Diffusers. El repositorio presenta la arquitectura de SkyReels-A1, un sistema de animación de retratos expresivos que transfiere expresiones faciales desde un vídeo de referencia a una imagen estática mediante landmarks faciales y un mecanismo de guiado de pose integrado en un VAE. Con 5.644.974.016 parámetros y un tamaño de repositorio de 26,8 GB, el modelo está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación. Aunque el modelo fue creado recientemente (agosto de 2026) y no acumula descargas ni valoraciones, su relevancia radica en ofrecer una alternativa open-source para animación de retratos con control fino de expresiones, un campo con pocas opciones libres de esta calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para vídeo, basado en CogVideoX-5b-I2V |
| Parametros totales | 5.644.974.016 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (orientado a secuencias de vídeo, sin especificación de tokens) |
| Tipos de cuantizacion | no disponible (el repositorio incluye safetensors; no se documentan cuantizaciones GGUF u otras) |
| Idiomas soportados | no disponible (la model card no indica idiomas; al ser un modelo de vídeo, no procesa texto directamente) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también se menciona ONNX en los tags, pero no se confirma en el repositorio) |

## Arquitectura y entrenamiento

El modelo se construye sobre CogVideoX-5b-I2V, un transformador de difusión (DiT) diseñado para generar vídeo a partir de una imagen inicial. SkyReels-A1, cuya arquitectura se adopta aquí, añade un módulo de control de expresiones faciales: extrae landmarks faciales dependientes de la expresión desde un vídeo de referencia y los integra directamente en el espacio latente de entrada del DiT. Además, emplea un mecanismo de guiado de pose implementado dentro de la arquitectura VAE, que codifica los landmarks como entrada condicional. Este enfoque permite capturar atributos visuales de baja dimensión (como movimientos de labios, cejas y parpados) preservando la identidad y semántica del rostro. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens de vídeo procesados ni el uso de técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de vídeo a partir de una imagen estática (image-to-video) con control de expresiones faciales.
- Animación de retratos: transfiere expresiones y movimientos faciales desde un vídeo de referencia a una imagen fija.
- Integración de landmarks faciales como condición de entrada, permitiendo sincronización labial y gestos naturales.
- Compatible con el ecosistema Diffusers mediante `CogVideoXImageToVideoPipeline`.
- Soporte para inferencia con safetensors y posible exportación a ONNX (según los tags, aunque no se documenta).
- No se mencionan capacidades de tool calling, agentes, razonamiento multimodal ni procesamiento de texto.

## Casos de uso

- Doblaje y sincronización labial: dado un clip de audio y una imagen de un personaje, el modelo puede generar un vídeo donde los labios se mueven de forma coherente con el habla, útil para localización de contenidos o avatares digitales.
- Creación de contenido para redes sociales: permite animar retratos o ilustraciones para producir vídeos cortos con expresiones dinámicas, sin necesidad de equipos de captura de movimiento.
- Producción cinematográfica independiente: los cineastas pueden usar el modelo para previsualizar actuaciones o generar tomas de reacción de personajes a partir de fotografías, reduciendo costes de rodaje.
- Asistentes virtuales y avatares: integrar el modelo en aplicaciones de atención al cliente o educación para generar vídeos de avatares que responden con expresiones faciales apropiadas al contexto conversacional.
- Restauración y animación de fotografías históricas: animar retratos antiguos para documentales o proyectos de memoria histórica, aportando vida a imágenes estáticas.
- Investigación en visión por computador: servir como base para estudios sobre generación de vídeo condicionada por expresiones, o como punto de partida para fine-tuning en dominios específicos (por ejemplo, animación de personajes estilizados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como FVD, SSIM, ni comparaciones con otros modelos de generación de vídeo. Tampoco se documentan pruebas de rendimiento en términos de latencia o throughput.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Dado el tamaño del repositorio (26,8 GB) y los 5.644 millones de parámetros, se estima que la inferencia en precisión FP16 requiere al menos 12-16 GB de VRAM solo para los pesos del transformador, más memoria adicional para el VAE y las activaciones. Una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090) sería el mínimo recomendado para una generación de vídeo fluida.
- Para despliegue en producción, se sugiere una GPU de clase datacenter como A100 (40/80 GB) o H100 para manejar secuencias largas o procesamiento por lotes.
- Al ser un modelo de Diffusers, se puede desplegar con bibliotecas como `diffusers` (Python), `vLLM` (si se adapta a un formato de texto, aunque no es el caso), o mediante servidores de inferencia como TGI si se convierte a un formato compatible. Para entornos ligeros, `llama.cpp` no es aplicable por ser un modelo de vídeo; se recomienda usar el pipeline estándar de Diffusers.
- No hay datos de latencia o throughput medidos; dependerá del hardware y de la resolución y duración del vídeo generado.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| SkyFilms-V1 (este) | 5.6B | image-to-video con control de expresiones | Apache-2.0 | Hugging Face |
| CogVideoX-5b-I2V | 5B | image-to-video | Apache-2.0 | Hugging Face, código abierto |
| SkyReels-V1 | no especificado (basado en HunyuanVideo) | video foundation model humano-céntrico | Apache-2.0 (según GitHub) | Hugging Face, GitHub |

SkyFilms-V1 se distingue de CogVideoX-5b-I2V por añadir el control de expresiones faciales propio de SkyReels-A1. SkyReels-V1, por su parte, es un modelo de vídeo general centrado en humanos, pero no se centra específicamente en animación de retratos. No se dispone de comparativas de rendimiento cuantitativas entre estos modelos.

## Limitaciones y advertencias

- No hay información sobre sesgos del modelo; al estar entrenado sobre datos de vídeo no especificados, podría presentar sesgos en la representación de ciertos grupos étnicos o de género, como es común en modelos generativos.
- Riesgo de alucinación visual: el modelo puede generar movimientos faciales poco naturales o artefactos en regiones fuera del rostro, especialmente si la imagen de entrada tiene baja resolución o iluminación pobre.
- Limitaciones de contexto: no se documenta la duración máxima del vídeo generado ni la resolución soportada; los usuarios deben probar empíricamente.
- Restricciones de idioma: al ser un modelo de vídeo, no procesa texto; la interfaz de control se limita a la imagen y al vídeo de referencia.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de los modelos base (CogVideoX) y de los datos de entrenamiento, que podrían tener restricciones adicionales no documentadas.
- El modelo está recién publicado y no ha sido validado por la comunidad; se desconoce su robustez en producción.
- No se proporcionan instrucciones de uso detalladas en la model card; los usuarios deben consultar el repositorio de SkyReels-A1 para obtener el código de inferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ryen-stuff/SkyFilms-V1
- GitHub de SkyReels-A1: https://github.com/SkyworkAI/SkyReels-A1
- Paper arXiv: https://arxiv.org/abs/2502.10841
- Playground de SkyReels: https://www.skyreels.ai/home
- Discord de SkyReels: https://discord.gg/PwM6NYtccQ
- GitHub de SkyReels-V1: https://github.com/SkyworkAI/SkyReels-V1
