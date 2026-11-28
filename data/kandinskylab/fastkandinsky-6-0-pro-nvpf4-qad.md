# kandinskylab/FastKandinsky-6.0-Pro-NVPF4-QAD

## Resumen

FastKandinsky 6.0 Pro · NVFP4 QAD es un modelo de generación de vídeo con audio sincronizado, desarrollado conjuntamente por FastVideo (Hao AI Lab, UC San Diego) y Kandinsky Lab. Genera clips de cinco segundos con audio a 44 kHz en tan solo ocho pasos de inferencia, y admite condicionamiento tanto por texto como por imagen. La versión publicada en este repositorio aplica la receta de destilación con conciencia de cuantización (QAD) de FastVideo, con capas lineales en NVFP4 y atención de 4 bits entrenada con QAT.

El modelo resuelve el problema del coste computacional de la generación de vídeo de alta calidad: frente a los pipelines de difusión tradicionales que requieren decenas de pasos, esta variante destilada reduce la inferencia a ocho pasos y emplea cuantización de 4 bits (NVFP4) para disminuir los requisitos de memoria y acelerar la ejecución en GPUs Blackwell. El checkpoint del Hub almacena el transformer QAD en BF16 y es FastVideo quien exporta los pesos NVFP4 empaquetados para la inferencia nativa en FP4.

Con 30.139.423.760 parámetros totales y un repositorio de 212,9 GB, se trata de un modelo de gran escala orientado a producción en hardware de gama alta. Su relevancia actual radica en la combinación de generación conjunta de vídeo y audio, destilación a pocos pasos y cuantización agresiva, todo bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con atención de 4 bits (Attn-QAT) y capas lineales NVFP4 |
| Parámetros totales | 30.139.423.760 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (lineales), atención 4 bits (Attn-QAT); checkpoint en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16 en el Hub; exportación NVFP4 empaquetada generada localmente) |

## Arquitectura y entrenamiento

El modelo se basa en un Diffusion Transformer (DiT) que genera vídeo y audio de forma conjunta. Incorpora capas lineales en NVFP4 y una operación de atención cuantizada a 4 bits entrenada con QAT (Attn-QAT), según el paper arXiv:2603.00040. La destilación con conciencia de cuantización (QAD) sigue la receta empleada en FastWan-QAD y FastH3, y reduce el número de pasos de difusión necesarios a ocho (denominados "pi-Flow steps"). El pipeline asociado en Diffusers es `Kandinsky6TI2VAPipeline`, que integra un vocoder MMAudio para la generación de audio a 44 kHz.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona dos referencias arXiv (2603.00040 y 2610.05608) relacionadas con la atención QAT y el propio modelo, pero no se aportan cifras de entrenamiento en la información disponible.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Generación de audio sincronizado a 44 kHz integrada en el mismo pipeline.
- Generación de clips de cinco segundos de duración.
- Inferencia en ocho pasos de difusión (destilación pi-Flow).
- Cuantización NVFP4 para inferencia nativa en FP4 en GPUs Blackwell.
- Exportación de pesos empaquetados NVFP4 mediante script de conversión.
- Ejecución mediante FastVideo (con FlashInfer y kernel `ATTN_QAT_INFER`) o mediante Diffusers con TorchAO.
- Soporte de compilación del DiT con offload por capas para reducir memoria.

## Casos de uso

- Producción de vídeo publicitario: el modelo genera clips de cinco segundos con audio sincronizado en ocho pasos, lo que permite iterar rápidamente sobre storyboards y variaciones creativas sin reentrenar.
- Creación de contenido para redes sociales: la combinación de text-to-video e image-to-video facilita animar imágenes fijas y añadir bandas sonoras generadas en el mismo pipeline.
- Previsualización de escenas cinematográficas: los prompts detallados con indicaciones de cámara, iluminación y audio permiten generar planos de referencia para equipos de dirección.
- Generación de material para videojuegos: clips cortos con audio sincronizado pueden emplearse como cinemáticas o assets de transición.
- Prototipado de anuncios con audio: la generación conjunta de vídeo y sonido evita pipelines separados y reduce la latencia de producción.
- Investigación en generación multimodal: la arquitectura DiT con atención QAT y cuantización NVFP4 sirve como base para estudiar eficiencia en modelos de difusión a gran escala.
- Despliegue en hardware Blackwell: la inferencia nativa FP4 con offload por capas permite ejecutar el modelo en GPUs de consumo profesional como la RTX 5090.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una gráfica de velocidad de inferencia (RTX 5090, 768 × 512, 121 frames, 24 fps, ocho pasos NVFP4 con offload por capas y shifts de scheduler 7.5/5), pero no se proporcionan cifras numéricas de MMLU, HumanEval, GSM8K ni métricas equivalentes de generación de vídeo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint completo en BF16 ocupa 212,9 GB en disco y el modelo tiene 30,1 mil millones de parámetros, por lo que la inferencia en BF16 requiere múltiples GPUs o offload. La variante NVFP4 reduce el peso de las capas lineales a 4 bits.
- GPU recomendadas: RTX 5090 o RTX PRO 6000 Blackwell (SM120) con CUDA 13 para la ruta FastVideo con NVFP4 nativo.
- Cabe en GPU de consumo: sí, en RTX 5090 (Blackwell) con exportación NVFP4 y offload por capas del DiT, según la model card.
- Opciones de despliegue: FastVideo (con FlashInfer y `fastvideo-kernel`), Diffusers 0.42.1 o superior con TorchAO en Blackwell, Accelerate y PyAV para exportación MP4.
- Latencia y throughput: no se proporcionan cifras numéricas; solo la gráfica comparativa de velocidad en RTX 5090 a 768 × 512, 121 frames y 24 fps.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No disponible.

## Limitaciones y advertencias

- La ruta NVFP4 nativa requiere hardware Blackwell (SM120) y CUDA 13; no es portable a GPUs anteriores sin recurrir a la ruta Diffusers con TorchAO.
- El ejemplo con Diffusers se describe como experimental y cuantiza en memoria con TorchAO, manteniendo la atención en BF16, por lo que el rendimiento difiere de la ruta FastVideo.
- La exportación NVFP4 es un paso previo obligatorio (script `convert_kandinsky6_nvfp4.py`) y genera pesos empaquetados localmente; no se distribuyen en el Hub.
- No se especifican los idiomas soportados para los prompts; la model card no aporta información al respecto.
- No se documentan sesgos conocidos ni tasas de alucinación para la generación de vídeo o audio.
- La licencia MIT permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento.
- El tamaño del repositorio (212,9 GB) exige espacio de almacenamiento considerable y una descarga completa del checkpoint BF16 antes de la conversión.
- La generación está limitada a clips de cinco segundos; no se indica soporte para duraciones mayores.

## Enlaces

- [Hugging Face: kandinskylab/FastKandinsky-6.0-Pro-NVPF4-QAD](https://huggingface.co/kandinskylab/FastKandinsky-6.0-Pro-NVPF4-QAD)
- [Kandinsky Lab - modelos de vídeo](https://kandinskylab.ai/models/video/)
- [FastVideo - inferencia FastKandinsky 6](https://haoailab.com/FastVideo/inference/fastkandinsky6/)
- [Blog Hao AI Lab - FastKandinsky 6 QAD](https://haoailab.com/blogs/fastkandinsky-6-qad/)
- [Repositorio FastVideo (GitHub)](https://github.com/hao-ai-lab/FastVideo)
- [Blog FastWan-QAD](https://haoailab.com/blogs/fastwan-qad/)
- [Blog FastH3 Omni Local](https://haoailab.com/blogs/fasth3-omni-local/)
- [Paper Attn-QAT (arXiv:2603.00040)](https://arxiv.org/abs/2603.00040)
- [Paper arXiv:2610.05608](https://arxiv.org/abs/2610.05608)
- [TorchAO (GitHub)](https://github.com/pytorch/ao)
- [Tabla de compatibilidad TorchAO](https://github.com/pytorch/ao/issues/2919)
