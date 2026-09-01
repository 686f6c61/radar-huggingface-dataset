# nvidia/ArtiFixer

## Resumen

ArtiFixer es un modelo desarrollado por NVIDIA (Spatial Intelligence Lab) que mejora y extiende reconstrucciones 3D mediante un enfoque de difusión auto-regresiva causal de pocos pasos. Se basa en los modelos Wan2.1 de texto a vídeo, adaptados para trabajar con imágenes renderizadas, mapas de opacidad y rayos de cámara. El problema que resuelve es el de refinar reconstrucciones 3D imperfectas, corrigiendo artefactos y completando zonas faltantes a partir de renderizados parciales. Es relevante porque combina técnicas de difusión con auto-regresión causal para lograr inferencia rápida en GPU, manteniendo una calidad de reconstrucción alta.

Se publican dos variantes: una de 14B parámetros (16 910 955 584 entrenables) y otra de 1.3B (1 678 749 760 entrenables), ambas basadas en arquitectura Transformer. Además, se incluyen checkpoints de teacher bidireccionales (stage-1) para investigación en destilación y muestreo. El modelo está diseñado para ejecutarse en hardware NVIDIA (Ampere, Hopper, Blackwell) y se distribuye bajo una licencia no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ArtiFixerTransformer basado en WanTransformer3DModel) |
| Parametros totales | 14B: ~16.9B entrenables (16 910 955 584); 1.3B: ~1.68B entrenables (1 678 749 760) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (acepta prompts de texto, pero no se especifican idiomas) |
| Licencia | NVIDIA One-Way Noncommercial License (uso no comercial) |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

ArtiFixer emplea una arquitectura Transformer basada en Wan2.1. El modelo base es un difusor de texto a video; ArtiFixer lo adapta para entrada de imágenes renderizadas (RGB, mapas de opacidad, rayos de cámara) y texto. El proceso de entrenamiento se divide en varias etapas: primero un entrenamiento bidireccional con atención completa (teacher, stage-1), luego un entrenamiento con diffusion forcing y finalmente una destilación estilo Self-Forcing DMD para obtener el modelo causal de pocos pasos. El teacher usa muestreo de difusión multi-paso, mientras que el modelo destilado realiza rollout auto-regresivo causal con solo 1 o 4 pasos de denoising.

El dataset de entrenamiento es hibrido (automatico/sintetico) con menos de un millon de imagenes y menos de mil millones de tokens de texto. No se especifican detalles adicionales sobre la composicion del dataset ni sobre el uso de RLHF o DPO. La innovacion principal es la combinacion de difusion y auto-regresion causal para acelerar la inferencia sin perder calidad de reconstruccion.

## Capacidades

- Mejora de reconstrucciones 3D a partir de renderizados RGB y mapas de opacidad, corrigiendo artefactos y completando areas incompletas.
- Extension de reconstrucciones 3D: genera vistas adicionales o extiende la cobertura espacial del modelo reconstruido.
- Generacion de video a partir de prompts de texto (heredada del modelo base Wan2.1), segun se muestra en el proyecto web.
- Integracion con camaras: requiere intrinsicas y poses de camara para operar correctamente.
- Inferencia de pocos pasos: soporta 1 o 4 pasos de denoising, logrando altas tasas de FPS en GPU.
- Soporte multi-GPU con contexto paralelo (context parallelism) para acelerar aun mas la inferencia.

## Casos de uso

- Refinado de reconstrucciones fotogrametricas: a partir de un modelo 3D imperfecto generado por fotogrametria, ArtiFixer puede producir renderizados limpios y completos, utiles para entornos virtuales o gemelos digitales.
- Completado de mallas 3D parciales: si una reconstruccion tiene zonas faltantes (oclusiones o superficies no visibles), el modelo genera las partes ausentes basandose en el contexto visual y el prompt.
- Generacion de texturas para modelos 3D: dado un modelo con geometria basica, se pueden crear texturas realistas mediante renderizados mejorados, aplicables en videojuegos o simulaciones.
- Creacion de vistas sinteticas para entrenamiento de modelos de vision: se pueden generar multiples vistas de un objeto 3D para aumentar datasets de entrenamiento sin capturas adicionales.
- Edicion de escenas 3D con prompts de texto: el modelo permite modificar aspectos de la reconstruccion mediante descripciones textuales, facilitando iteraciones de diseno.
- Produccion de video desde texto: aunque no es su proposito principal, la capacidad heredada de Wan2.1 permite generar secuencias de video a partir de prompts, util para previsualizacion rapida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque ArtiFixer no es un modelo de lenguaje general. Los unicos datos de rendimiento disponibles son las tasas de FPS en inferencia:

| Variante | Pasos de denoising | Configuracion | FPS |
|---|---|---|---|
| 14B | 4 | 1 GPU | 8.36 |
| 1.3B | 4 | 1 GPU | 34.38 |
| 1.3B | 1 | 4 GPUs (context parallelism) | 101.77 |

Estos valores aplican a los modelos causales destilados, no a los teacher bidireccionales. No se proporcionan metricas de calidad de reconstruccion (PSNR, SSIM, etc.) en la informacion disponible.

## Requisitos de hardware

- GPU: requiere NVIDIA Ampere, Hopper o Blackwell (no soporta otras marcas ni arquitecturas antiguas).
- VRAM estimada: no se especifica, pero el tamaño del repositorio (149.2 GB) sugiere pesos grandes; la variante 14B probablemente necesite al menos 48 GB de VRAM, mientras que la 1.3B podria caber en 24 GB, aunque sin datos oficiales es una estimacion.
- Despliegue: se integra con PyTorch, Hugging Face Diffusers y Transformers, usando FlashAttention (FA3 en Hopper, FA4 en Blackwell). Se puede ejecutar con torchrun o accelerate para multi-GPU.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp ni Ollama (no es un modelo de lenguaje); el despliegue es especifico para el pipeline de difusion.
- Latencia: los FPS indicados (8.36 FPS para 14B, 34.38 FPS para 1.3B a 4 pasos) dan una idea del throughput en una GPU; con 4 GPUs y 1 paso, el 1.3B alcanza 101.77 FPS.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en el ambito de reconstruccion 3D con difusion auto-regresiva. El modelo se basa en Wan2.1, que es un modelo de texto a video, pero no hay benchmarks publicados que comparen ArtiFixer con otras soluciones como NeRF, Gaussian Splatting o metodos de superresolucion 3D. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Licencia no comercial: el uso esta restringido a investigacion y desarrollo; no se permite uso comercial sin acuerdo adicional con NVIDIA.
- Requiere hardware NVIDIA especifico (Ampere o superior); no funciona en GPUs de otras marcas ni en CPU.
- Datos de entrenamiento limitados (menos de un millon de imagenes y menos de mil millones de tokens), lo que puede afectar la generalizacion a dominios no vistos.
- El modelo depende de camaras calibradas (intrinsecas y poses); una calibracion incorrecta degrada la calidad de salida.
- Posibles sesgos en los datos sinteticos/automatizados, que pueden propagarse a las reconstrucciones generadas.
- El modelo no es un LLM general; no soporta tareas de lenguaje natural ni razonamiento textual.
- La generacion de video desde texto es una capacidad heredada y no esta optimizada para uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/ArtiFixer
- Proyecto NVIDIA: https://research.nvidia.com/labs/sil/projects/artifixer/
- Paper (PDF): https://research.nvidia.com/labs/sil/projects/artifixer/assets/paper.pdf
- Repositorio GitHub: https://github.com/nv-tlabs/ArtiFixer
