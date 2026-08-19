# FastVideo/FastMetal-5B-QAD

## Resumen

FastMetal-5B-QAD es un modelo de generacion de texto a video desarrollado por FastVideo (Hao AI Lab, UCSD), disenado especificamente para ejecutarse en Apple Silicon. Se trata de una destilacion DMD2 del modelo Wan 2.2 TI2V 5B de Alibaba, con un DiT (Diffusion Transformer) pre-cuantizado en INT8 affine con group size 64 mediante entrenamiento consciente de cuantizacion (QAT). El resultado es un modelo que genera video nativo a 720p (704x1280, 121 fotogramas) en solo 3 pasos de denoising, sin necesidad de cuantizacion en el arranque.

Su relevancia radica en que resuelve el problema de la inferencia de modelos de video en hardware de consumo Apple: los pesos INT8 pre-cuantizados ocupan aproximadamente 5 GB, lo que permite ejecutar el modelo en Macs con 16 GB o mas de RAM unificada via MPS. La licencia Apache 2.0 permite uso comercial sin restricciones. Forma parte de la familia FastMetal, que incluye variantes de 1.3B y 14B parametros para distintos niveles de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) basado en Wan 2.2 TI2V 5B, cuantizado INT8 affine (group 64) |
| Parametros totales | 5B (base Wan 2.2 TI2V 5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de video, no texto) |
| Tipos de cuantizacion | INT8 affine, group size 64, entrenado con QAT |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX, `mlx_dit.safetensors` + `mlx_dit.json`) |

## Arquitectura y entrenamiento

El modelo parte del Wan 2.2 TI2V 5B como teacher y aplica destilacion DMD2 sobre un student cuantizado en INT8. El entrenamiento se realizo en clusters NVIDIA GB200 con quantization-aware training (QAT) en configuracion affine INT8 con group size 64, lo que permite que el modelo ya venga pre-cuantizado y no requiera cuantizacion post-hoc al cargarlo. El proceso de denoising se reduce a 3 pasos gracias a la destilacion DMD2, frente a los 30-50 pasos tipicos de los modelos de difusion convencionales. El corpus de entrenamiento es `FastVideo/Wan2.2-Syn-121x704x1280_32k`, un dataset sintetico de 32.000 muestras a resolucion 121x704x1280. El flow shift esta fijado en 5.0. La inferencia se ejecuta exclusivamente a traves de MPS (Metal Performance Shaders) en macOS.

## Capacidades

- Generacion de video a partir de prompt de texto a resolucion nativa 720p (704x1280) con 121 fotogramas.
- Inferencia en 3 pasos de denoising gracias a la destilacion DMD2, lo que reduce drasticamente la latencia frente a modelos de difusion estandar.
- Pre-cuantizacion INT8 integrada: no requiere cuantizacion en el arranque, reduciendo el tiempo de carga y los requisitos de memoria.
- Ejecucion nativa en Apple Silicon via MPS, sin necesidad de GPU NVIDIA o CUDA.
- Formato MLX optimizado para el ecosistema Apple (los pesos se distribuyen en `mlx_dit.safetensors` con metadatos en `mlx_dit.json`).
- Incluye todos los componentes necesarios para ejecucion autonoma: text encoder, VAE, tokenizer y scheduler.

## Casos de uso

- Prototipado rapido de video en Mac: un creador puede generar clips de 5 segundos a 720p directamente en su MacBook con 16 GB de RAM, sin depender de servicios en la nube ni GPUs dedicadas, acelerando el iterado creativo en preproduccion.
- Previsualizacion cinematografica (previz): directores y equipos de VFX pueden generar storyboards animados de 121 fotogramas a partir de prompts textuales para validar encuadres, iluminacion y movimiento antes de rodar.
- Generacion de contenido para redes sociales: permite producir clips cortos de alta resolucion para plataformas como TikTok, Instagram Reels o YouTube Shorts desde un equipo Apple, sin costes de inferencia en la nube.
- Material didactico y educativo: docentes e investigadores pueden generar animaciones explicativas de conceptos abstractos (fenomenos fisicos, procesos biologicos) con prompts descriptivos en lenguaje natural.
- Moodboards y diseno conceptual: equipos de diseno pueden generar multiples variaciones de una escena para explorar paletas de color, atmosferas y composiciones antes de comprometerse con una direccion artistica.
- Investigacion en generacion de video eficiente: el modelo sirve como referencia para estudiar el impacto de la cuantizacion INT8 con QAT en la calidad de video generado, y para comparar estrategias de destilacion DMD2 en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para FastMetal-5B-QAD en la informacion disponible. La tecnica QAD (Quantization-Aware Distillation) empleada en este modelo se ha validado en la familia FastWan-QAD, donde un modelo de 1.3B basado en Wan2.1-T2V genera 5 segundos de video 480P en 1,8 segundos end-to-end en una RTX 5090, superando a TurboDiffusion y LightX2V. Sin embargo, esos resultados corresponden a un modelo distinto (FastWan-QAD-FP8-1.3B) y no son directamente extrapolables a FastMetal-5B-QAD, que opera en Apple Silicon y a resolucion 720p.

## Requisitos de hardware

- Mac con Apple Silicon (M1/M2/M3/M4) y 16 GB o mas de RAM unificada (segun la model card, clase "16 GB+ Macs").
- Python 3.11 o superior, con dependencias: torch, transformers, mlx, safetensors, av, imageio, imageio-ffmpeg.
- Los pesos del DiT en INT8 ocupan aproximadamente 5 GB, por lo que caben en la memoria unificada de cualquier Mac Apple Silicon con 16 GB.
- No requiere GPU NVIDIA ni CUDA; la inferencia se ejecuta via MPS (Metal).
- Despliegue: el modelo se ejecuta mediante el script `mlx_wan22_generate.py` del repositorio FastVideo; no se mencionan integraciones con vLLM, Ollama ni TGI.
- No se proporcionan datos de latencia ni throughput especificos para este modelo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Cuantizacion | Resolucion | Hardware objetivo | Licencia |
|---|---|---|---|---|---|---|
| FastMetal-5B-QAD | Wan 2.2 TI2V 5B | 5B | INT8 affine (QAT) | 720p, 121 frames | Apple Silicon 16 GB+ | Apache 2.0 |
| FastMetal-1.3B-QAD | Wan 2.2 TI2V 1.3B | 1.3B | INT8 affine (QAT) | no disponible | Apple Silicon 16 GB+ | Apache 2.0 |
| FastMetal-14B-QAD | Wan 2.2 TI2V 14B | 14B | INT8 affine (QAT) | no disponible | Apple Silicon 24 GB+ (ideal 36 GB) | Apache 2.0 |
| FastWan-QAD-FP8-1.3B | Wan 2.1 T2V 1.3B | 1.3B | FP8 | 480p, 5 s | RTX 5090 (CUDA) | Apache 2.0 |

La familia FastMetal cubre tres niveles de hardware Apple, mientras que FastWan-QAD esta orientada a GPUs NVIDIA. Todos comparten la tecnica QAD de destilacion con cuantizacion consciente.

## Limitaciones y advertencias

- Exclusivamente para Apple Silicon: el modelo esta pre-cuantizado en formato MLX y no puede ejecutarse en GPUs NVIDIA/CUDA sin conversion previa, que no esta documentada.
- Resolucion y duracion fijas: genera 121 fotogramas a 704x1280; no se documenta soporte para otras resoluciones o duraciones.
- La cuantizacion INT8 puede introducir degradacion de calidad frente al modelo teacher en FP16, especialmente en texturas finas, movimiento rapido y detalles de alto contraste.
- No se han publicado benchmarks de calidad (FVD, CLIP score, etc.) para este modelo, por lo que la comparacion objetiva con alternativas no cuantizadas es limitada.
- Idiomas soportados no documentados: se desconoce si el text encoder maneja prompts en espanol u otros idiomas ademas del ingles.
- Modelo nuevo (creado en agosto de 2026) con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por la comunidad.
- El corpus de entrenamiento es sintetico (`Wan2.2-Syn-121x704x1280_32k`), lo que puede limitar la diversidad y fidelidad de los videos generados frente a modelos entrenados con datos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FastVideo/FastMetal-5B-QAD
- FastMetal-1.3B-QAD: https://huggingface.co/FastVideo/FastMetal-1.3B-QAD
- FastMetal-14B-QAD: https://huggingface.co/FastVideo/FastMetal-14B-QAD
- Repositorio FastVideo (GitHub): https://github.com/hao-ai-lab/FastVideo
- Blog sobre FastWan-QAD (Hao AI Lab): https://haoailab.com/blogs/fastwan-qad/
- Resena de FastWan-QAD: https://blog.xclis.ai/fastwan-qad-fastvideo-generates-a-5-second-video-in-1-8-seconds-on-a-single-nvidia-geforce-rtx-5090-via-quantization-aware-distillation-hao-ai-lab-ucsd/
- FastWan-QAD-FP8-1.3B en HuggingFace: https://huggingface.co/FastVideo/FastWan-QAD-FP8-1.3B
