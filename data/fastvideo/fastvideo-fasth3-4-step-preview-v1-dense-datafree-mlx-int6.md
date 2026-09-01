# FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree-MLX-INT6

## Resumen

FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree-MLX-INT6 es una conversión lista para ejecutar en Apple silicon del modelo de generación de vídeo y audio FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree, desarrollado por el laboratorio hao-ai-lab (FastVideo). Se trata de un DiT (Diffusion Transformer) cuantizado a INT6 con MLX, que elimina el paso de conversión local y reduce los requisitos de memoria unificada en chips Apple. El checkpoint base es una destilación DMD2 data-free del modelo MiniMax H3, con atención densa y cuatro pasos de forward, capaz de generar vídeo y audio sincronizados a partir de un prompt de texto.

La relevancia de este modelo radica en que acerca la generación de vídeo-audio de alta calidad a hardware de consumo de Apple, manteniendo la licencia comunitaria MiniMax H3. La cuantización affine weight-only INT6 con grupo de tamaño 64 y activaciones en BF16 permite un peso de 15,41 GiB, lo que lo hace viable en Mac con memoria unificada de 32 GiB o superior. El modelo no soporta el backend de atención dispersa VSA, por lo que se limita a atención densa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con atención H3 densa |
| Parametros totales | no disponible (peso cuantizado de 15,41 GiB en INT6) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | INT6 affine weight-only, group size 64; activaciones BF16 |
| Idiomas soportados | no disponible (el prompt de ejemplo usa inglés, pero no se especifica lista) |
| Licencia | minimax-h3-community |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un DiT que emplea la arquitectura H3 de MiniMax, con atención densa en esta variante. El entrenamiento del checkpoint original utilizó destilación DMD2 data-free (sin datos reales) sobre el modelo MiniMax H3, reduciendo el número de pasos de muestreo a cuatro forwards del transformer. El checkpoint concreto es el paso 1000 (step-1000) de la versión Preview v1. La conversión MLX mantiene la arquitectura completa, incluyendo el text encoder Qwen3-VL, el VAE de vídeo y el VAE de audio, que se comparten con el repositorio base. La cuantización es affine, solo pesos, con grupo de 64, y las activaciones permanecen en BF16. El manifiesto de conversión incluye checksums y verificación de los 13 shards del transformer original.

## Capacidades

- Generación de vídeo y audio sincronizados a partir de un prompt de texto (T2VA, text-to-video-and-audio).
- Inferencia en cuatro pasos del transformer, lo que reduce drásticamente la latencia frente a modelos de 50 o más pasos.
- Ejecución nativa en Apple silicon mediante MLX, sin necesidad de conversión previa.
- Cuantización INT6 que reduce el uso de memoria unificada frente al checkpoint en BF16.
- Soporte de prompts con marcadores de diálogo (p. ej. `<d>[English] ...</d>`) para controlar el habla en el audio generado.
- Generación de vídeo de 124 frames a resolución 832x480 verificada en el proceso de validación.
- No soporta el backend de atención dispersa VSA; solo atención densa.

## Casos de uso

- Creación de vídeos promocionales para redes sociales: un equipo de marketing puede generar clips cortos con locución sincronizada a partir de un guion, sin necesidad de actores ni estudio de grabación, gracias a la generación conjunta de vídeo y audio en cuatro pasos.
- Prototipado rápido de storyboards animados: directores y diseñadores pueden generar secuencias de vídeo de baja resolución (832x480) con audio para evaluar ritmo y narrativa antes de la producción final, usando hardware Apple disponible en el estudio.
- Generación de contenido educativo: profesores o creadores de cursos pueden producir vídeos explicativos con narración automática a partir de texto, reduciendo el tiempo de edición y postproducción.
- Asistentes de accesibilidad: el modelo puede convertir artículos o guiones en vídeos con audio para personas con discapacidad visual, aprovechando la generación de voz sincronizada con las imágenes.
- Pruebas de concepto en investigación de generación de vídeo: investigadores pueden ejecutar el modelo en Mac para validar hipótesis sobre destilación DMD2 o cuantización INT6 sin necesidad de un clúster de GPUs.
- Generación de vídeo para simulaciones o demos técnicas: desarrolladores de aplicaciones de realidad aumentada o juegos pueden generar vídeos de referencia con audio para integrarlos en prototipos, gracias a la integración con el framework FastVideo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la conversión fue validada completando una generación de 124 frames a 832x480 con el VAE H3 completo en un Apple M4 Max, pero no se proporcionan métricas de calidad (FVD, CLIP score, etc.) ni comparativas con otros modelos.

## Requisitos de hardware

- Memoria unificada: el peso cuantizado ocupa 15,41 GiB, por lo que se recomienda al menos 32 GiB de RAM unificada en Apple silicon para dejar margen a los componentes compartidos (text encoder, VAE) y las activaciones BF16.
- GPU: verificada en Apple M4 Max; compatible con cualquier chip Apple silicon con suficiente memoria unificada (M1 Pro/Max/Ultra, M2, M3, M4).
- No es compatible con GPUs NVIDIA o AMD; esta versión es exclusiva para MLX.
- Despliegue: requiere el framework FastVideo con el extra `[mlx]` y Python 3.12. Se ejecuta mediante el script `mlx_fasth3.py` incluido en el repositorio.
- Latencia: no se proporcionan datos de throughput; la generación de 124 frames a 832x480 se completó en el proceso de validación, pero no se indica el tiempo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Pasos | Atención | Cuantización | Hardware objetivo | Licencia |
|---|---|---|---|---|---|---|
| FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree-MLX-INT6 (este) | DiT H3 denso | 4 | Densa | INT6 (MLX) | Apple silicon | minimax-h3-community |
| FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree | DiT H3 disperso | 4 | Dispersa 90% | BF16 (original) | GPUs NVIDIA (Blackwell) | minimax-h3-community |
| FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree (base) | DiT H3 denso | 4 | Densa | BF16 | GPUs NVIDIA | minimax-h3-community |

La versión MLX INT6 es la única de las tres optimizada para Apple silicon. La variante VSA ofrece mayor velocidad en GPUs Blackwell (hasta 14x según el blog de haoailab) gracias a la atención dispersa, pero no es compatible con MLX. El modelo base sin cuantizar requiere más memoria y no está listo para ejecución directa en Mac.

## Limitaciones y advertencias

- Solo soporta generación de vídeo y audio a partir de texto (T2VA); no admite entrada de vídeo o imagen como referencia (first/last-frame) en esta versión Preview.
- No incluye el backend de atención dispersa VSA; la atención densa puede ser más lenta y consumir más memoria que la variante VSA en GPUs.
- La licencia minimax-h3-community puede imponer restricciones de uso comercial; es necesario revisar el texto completo de la licencia en el repositorio base.
- El modelo requiere descargar los componentes compartidos del repositorio base (tokenizer, Qwen3-VL, VAE de vídeo y audio) en una revisión específica, lo que añade complejidad al despliegue.
- No se han publicado evaluaciones de sesgos, alucinaciones o calidad del audio generado; el riesgo de contenido incoherente o artefactos visuales es inherente a los modelos de generación.
- La cuantización INT6 puede degradar ligeramente la calidad frente al checkpoint BF16 original, aunque no se han facilitado métricas comparativas.
- El modelo está en fase Preview v1, por lo que puede haber cambios en versiones futuras y no se garantiza estabilidad en producción.

## Enlaces

- Repositorio HuggingFace del modelo MLX INT6: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree-MLX-INT6
- Repositorio HuggingFace del modelo base: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree
- Repositorio HuggingFace de la variante VSA: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree
- Blog de haoailab sobre FastH3 Preview v1: https://haoailab.com/blogs/fasth3-preview/
- Noticia en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-08-28-fasth3-preview
- Repositorio GitHub de FastVideo: https://github.com/hao-ai-lab/FastVideo
