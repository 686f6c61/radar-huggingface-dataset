# FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree-MLX-INT4

## Resumen

FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree-MLX-INT4 es un checkpoint cuantizado a INT4 del modelo FastH3 Preview v1 Dense DataFree, desarrollado por el laboratorio hao-ai-lab (FastVideo). Este modelo base es una destilación DMD2 (Distribution Matching Distillation) del modelo MiniMax H3, que genera vídeo y audio sincronizados a partir de texto (T2VA) en solo cuatro pasos de inferencia. La versión aquí presentada está convertida al formato MLX para ejecutarse de forma nativa en Apple Silicon, evitando la conversión local y reduciendo el uso de memoria unificada durante la carga.

El checkpoint cuantizado pesa 10,74 GiB y utiliza cuantización weight-only INT4 con grupo de 64, manteniendo las activaciones en BF16. Es una exportación densa, es decir, no incluye el soporte de atención dispersa (VSA) que sí tiene la variante recomendada del modelo base. La licencia es la comunitaria MiniMax H3, que se aplica también a esta conversión. El modelo base emplea un codificador de texto Qwen3-VL, un VAE de vídeo y un VAE de audio, y está pensado para generar clips de vídeo con diálogo y sonido sincronizado a partir de prompts textuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con atención H3 (MiniMax H3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 weight-only, grupo 64, activaciones BF16 |
| Idiomas soportados | no disponible (el ejemplo usa inglés, pero no se especifica) |
| Licencia | minimax-h3-community (otra) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base FastH3 Preview v1 Dense DataFree es una destilación DMD2 del modelo MiniMax H3, un transformador de difusión para generación de vídeo y audio. El entrenamiento se realizó con la técnica data-free DMD2, que permite reducir el número de pasos de inferencia a cuatro sin necesidad de datos reales adicionales. El checkpoint concreto es la versión densa (sin atención dispersa) con 1000 pasos de entrenamiento (step-1000). El modelo base utiliza un codificador de texto Qwen3-VL, un VAE de vídeo y un VAE de audio, y genera tanto el vídeo como el audio sincronizado en una única pasada.

La conversión a MLX INT4 se realizó con FastVideo commit `cf6a00b9be4675602126d6aeab902ad9a74810ea` y MLX 0.32.2 en un Apple M4 Max. La cuantización es afín, weight-only, con grupo de 64, y las activaciones permanecen en BF16. El proceso de conversión validó los 13 shards del transformador original, los 1.464 tensores del checkpoint cuantizado y completó una generación de 124 fotogramas a 832x480 con el VAE H3 completo.

## Capacidades

- Generación de vídeo y audio sincronizados a partir de texto (T2VA) en cuatro pasos de inferencia.
- Soporte de prompts con marcadores de escena (`(S1)`) y diálogo (`<d>[Idioma] texto</d>`), lo que permite controlar la narrativa y el habla.
- Generación de vídeo de alta resolución (ejemplo validado: 832x480, 124 fotogramas).
- Inferencia rápida gracias a la destilación DMD2 (4 pasos frente a los típicos 20-50 de los modelos de difusión).
- Ejecución nativa en Apple Silicon mediante MLX, con carga incremental de componentes pesados para reducir el pico de memoria unificada.
- Cuantización INT4 que reduce el tamaño del checkpoint (10,74 GiB) y acelera la inferencia en hardware Apple.

## Casos de uso

- Creación de contenido para redes sociales: generar clips cortos con narración y sonido sincronizado a partir de un guion, ideal para TikTok, Reels o Shorts. El modelo produce vídeo y audio en una sola pasada, lo que agiliza el flujo de producción.
- Doblaje automático de vídeos: gracias al soporte de diálogo con marcador de idioma (`<d>[English] ...</d>`), se pueden generar locuciones en distintos idiomas sin necesidad de un pipeline de TTS separado.
- Prototipado de escenas para cine y animación: los creadores pueden esbozar escenas con diálogo y movimiento en minutos, validando la narrativa antes de la producción final.
- Generación de avatares parlantes: el modelo puede crear vídeos de un presentador o personaje hablando, útil para vídeos corporativos, tutoriales o asistentes virtuales.
- Automatización de vídeos educativos: a partir de un texto descriptivo, se genera una lección en vídeo con audio, reduciendo el coste de producción de material formativo.
- Pruebas de concepto en publicidad: los equipos de marketing pueden generar anuncios de prueba con locución y escenas para evaluar ideas antes de invertir en producción real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base ha sido validado por FastVideo en una generación de 124 fotogramas a 832x480 con el VAE H3 completo, pero no se proporcionan métricas comparativas (PSNR, FVD, etc.) ni tiempos de inferencia detallados.

## Requisitos de hardware

- Checkpoint MLX INT4 de 10,74 GiB, por lo que se requiere al menos esa cantidad de memoria unificada en Apple Silicon.
- Validado en un Apple M4 Max, pero debería ejecutarse en cualquier chip Apple Silicon con suficiente memoria unificada (16 GiB o más recomendado).
- No se proporcionan requisitos de VRAM para GPUs NVIDIA; este checkpoint está específicamente convertido para MLX y no es compatible directamente con CUDA.
- Despliegue mediante el framework FastVideo, usando el script `mlx_fasth3.py` incluido en el repositorio.
- La carga incremental de componentes pesados (codificador de texto, VAE de vídeo, VAE de audio) reduce el pico de memoria, permitiendo ejecutar el modelo en equipos con menos memoria unificada de la que requeriría una carga completa.
- No se indican latencias ni throughput específicos, pero la cuantización INT4 y los 4 pasos de inferencia sugieren una generación rápida en hardware Apple.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con otros modelos de generación de vídeo de la misma categoría. El modelo base FastH3 Preview v1 tiene una variante VSA (Video Sparse Attention) con 90% de dispersión que es la recomendada por FastVideo para mayor velocidad y calidad, pero este checkpoint es la versión densa y no soporta VSA. No se han encontrado datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Este checkpoint es una conversión densa y no soporta el modo `--vsa`; la atención dispersa no es un sustituto directo, por lo que el rendimiento y la calidad pueden diferir de la variante VSA recomendada.
- La licencia es la comunitaria MiniMax H3, que puede imponer restricciones de uso comercial; es necesario revisar los términos completos de la licencia antes de su uso en producción.
- El modelo solo soporta la tarea de texto a vídeo y audio (T2VA); no admite otras modalidades como edición de vídeo, generación de imágenes o tareas de lenguaje.
- La cuantización INT4 puede degradar ligeramente la calidad de salida en comparación con el checkpoint BF16 original, aunque no se han publicado métricas que cuantifiquen esta pérdida.
- No se especifican los idiomas soportados; el ejemplo de uso emplea inglés, pero no hay garantía de un rendimiento multilingüe consistente.
- El modelo base fue entrenado con DMD2 data-free, lo que puede implicar una menor diversidad de salida en comparación con modelos entrenados con datos reales.
- No se han publicado estudios de sesgos o alucinaciones específicos para este modelo; como generador de vídeo, puede producir contenido no deseado o incoherente si el prompt es ambiguo.

## Enlaces

- Checkpoint MLX INT4: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree-MLX-INT4
- Modelo base: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree
- Variante VSA (recomendada): https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree
- Blog de FastVideo sobre FastH3: https://haoailab.com/blogs/fasth3-preview/
- Artículo en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-08-28-fasth3-preview
- Repositorio FastVideo en GitHub: https://github.com/hao-ai-lab/FastVideo
