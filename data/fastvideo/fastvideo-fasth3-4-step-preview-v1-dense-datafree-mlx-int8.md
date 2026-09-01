# FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree-MLX-INT8

## Resumen

FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree-MLX-INT8 es una conversión lista para ejecutar del modelo de difusión texto a vídeo y audio FastH3 Preview v1, adaptada al ecosistema MLX de Apple silicon. El checkpoint original, desarrollado por FastVideo en colaboración con Nuva Lab y el equipo NVIDIA FastGen, es una destilación del modelo MiniMax H3 que genera vídeo y audio sincronizados a partir de un prompt de texto en solo cuatro pasos de inferencia. Esta versión concreta corresponde a la variante densa (sin sparsity) del modelo, cuantizada a INT8 con un esquema affine weight-only de grupo 64, lo que reduce el peso a 20,07 GiB y evita el paso de conversión local en equipos Apple.

El modelo está pensado para democratizar la generación de vídeo y audio de alta calidad en hardware de consumo, específicamente en los chips M-series de Apple, donde la memoria unificada permite cargar modelos de este tamaño sin necesidad de GPUs dedicadas. Al ser una versión preview, su objetivo es servir como base para desarrolladores e investigadores que quieran experimentar con generación T2VA (text-to-video-and-audio) de pocos pasos, aunque la licencia comunitaria de MiniMax H3 impone ciertas restricciones que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) basado en MiniMax H3, variante densa |
| Parametros totales | no disponible (el archivo cuantizado pesa 20,07 GiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video, no LLM) |
| Tipos de cuantizacion | INT8 weight-only affine, group size 64; activaciones en BF16 |
| Idiomas soportados | no disponible (usa text encoder Qwen3-VL, pero no se especifican idiomas) |
| Licencia | MiniMax H3 Community License (other) |
| Formato de pesos | safetensors (MLX) + JSON de configuracion |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) que opera sobre latentes de vídeo y audio, basado en la arquitectura MiniMax H3. La versión Dense-DataFree utiliza atención densa (sin sparsity) y corresponde al checkpoint step-1000 del proceso de destilación. El entrenamiento emplea DMD2 (Distribution Matching Distillation) data-free, una técnica que permite reducir el número de pasos de inferencia de decenas a solo cuatro sin necesidad de datos etiquetados adicionales. El resultado es un modelo que genera vídeo y audio sincronizados en cuatro forwards del transformer.

No se dispone de información detallada sobre el dataset de entrenamiento, el número total de tokens o el proceso de post-entrenamiento más allá de la destilación mencionada. La conversión a MLX fue realizada por FastVideo con el commit `cf6a00b9be4675602126d6aeab902ad9a74810ea` y MLX 0.32.2, validada en un Apple M4 Max. La cuantización INT8 es affine, weight-only con group size 64, y las activaciones se mantienen en BF16. Esta exportación es exclusivamente densa y no soporta la opción `--vsa` (sparse) disponible en la variante VSA-DataFree.

## Capacidades

- Generación de vídeo y audio sincronizados a partir de prompts de texto (T2VA).
- Inferencia en solo 4 pasos (four-forward), lo que reduce drásticamente el tiempo de generación frente a modelos de difusión tradicionales.
- Soporte para indicaciones de diálogo dentro del prompt, como se muestra en el ejemplo: `(S1) A presenter says <d>[English] Fast H3 runs on Apple silicon.</d>`.
- Optimizado para Apple silicon mediante el runtime MLX, con carga secuencial de componentes pesados para minimizar el uso de memoria unificada.
- Cuantización INT8 que reduce el tamaño del checkpoint a 20,07 GiB, facilitando su ejecución en equipos con memoria unificada moderada.
- Incluye tokenizer, text encoder Qwen3-VL, VAE de vídeo y VAE de audio compartidos con el modelo base.

## Casos de uso

- Creación de vídeos explicativos para documentación técnica: un desarrollador puede generar un vídeo corto con locución sincronizada a partir de un guion, usando el prompt con etiquetas de diálogo para controlar el habla.
- Prototipado rápido de contenido audiovisual para redes sociales: permite generar clips de 4-5 segundos con audio en cuestión de segundos, ideal para iterar sobre ideas antes de una producción completa.
- Generación de vídeos de formación corporativa: el modelo puede producir vídeos con narrador sintético a partir de texto, reduciendo costes de producción en entornos empresariales.
- Asistencia a creadores de contenido: un youtuber o divulgador puede generar clips de apoyo visual con voz en off sin necesidad de equipos de grabación.
- Investigación en generación de vídeo y audio: al ser una versión preview y de código abierto, sirve como banco de pruebas para estudiar técnicas de destilación y cuantización en modelos multimodales.
- Despliegue en entornos Apple sin GPU dedicada: gracias a MLX y la cuantización INT8, el modelo puede ejecutarse en un MacBook Pro o Mac Studio con suficiente memoria unificada, lo que lo hace accesible para estudios pequeños o uso personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Apple silicon con memoria unificada suficiente: el checkpoint cuantizado pesa 20,07 GiB, por lo que se recomienda al menos 32 GiB de RAM unificada para cargar el modelo junto con los componentes compartidos (tokenizer, text encoder, VAE).
- Validado en Apple M4 Max, aunque debería funcionar en cualquier chip M-series con suficiente memoria.
- No se proporcionan datos de latencia o throughput específicos, pero al ser 4 pasos y con cuantización INT8, se espera una generación de vídeo de 124 frames (832x480) en un tiempo razonable en hardware Apple moderno.
- Opciones de despliegue: el modelo se ejecuta mediante el runtime MLX de FastVideo, instalable con `uv pip install -e ".[mlx]"`. No se menciona soporte para vLLM, llama.cpp u otros backends.
- La carga de componentes es secuencial para minimizar el pico de memoria, lo que permite ejecutarlo en equipos con menos RAM de la que requeriría una carga simultánea.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Sparsity | Tamaño checkpoint | Licencia |
|---|---|---|---|---|---|
| FastH3 Dense-DataFree MLX INT8 (este) | DiT denso, MLX | 4 | No | 20,07 GiB (INT8) | MiniMax H3 Community |
| FastH3 VSA-DataFree | DiT sparse, VSA-H3 | 4 | 90% | no disponible | MiniMax H3 Community |
| MiniMax H3 (original) | DiT | muchos | No | no disponible | Propietaria |

La versión VSA-DataFree es la recomendada por FastVideo para producción, ya que incorpora sparsity al 90% y un entrenamiento adicional (step-1300) que mejora la calidad. Esta versión Dense es más simple y sirve como referencia para comparar el impacto de la sparsity. No se dispone de datos de rendimiento comparativo entre ambas, ni frente a otros modelos de texto a vídeo como Stable Video Diffusion.

## Limitaciones y advertencias

- Versión preview: el modelo está etiquetado como "Preview v1", lo que implica que puede tener limitaciones de calidad, artefactos o comportamientos inesperados en ciertos prompts.
- Cuantización INT8: aunque reduce el tamaño, puede degradar ligeramente la fidelidad de la generación frente al checkpoint en BF16 original.
- Solo para Apple silicon: al ser una exportación MLX, no es compatible con GPUs NVIDIA o AMD. Para otros hardware se debe usar el modelo base y convertirlo.
- No soporta la opción `--vsa` (sparse): esta exportación es densa únicamente, por lo que no se puede aprovechar la aceleración por sparsity de la variante VSA.
- Licencia MiniMax H3 Community: es una licencia de tipo comunitario que puede imponer restricciones al uso comercial. Es imprescindible revisar los términos completos en el repositorio del modelo base antes de cualquier despliegue en producción.
- Idiomas no especificados: aunque el text encoder Qwen3-VL probablemente soporta múltiples idiomas, no se ha documentado oficialmente qué idiomas funcionan correctamente con el modelo.
- Sin benchmarks publicados: no hay métricas objetivas de calidad o rendimiento, lo que dificulta la comparación con alternativas.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree-MLX-INT8
- Modelo base (Dense-DataFree): https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree
- Variante VSA-DataFree (recomendada por FastVideo): https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree
- Blog oficial de FastVideo sobre FastH3 Preview v1: https://haoailab.com/blogs/fasth3-preview/
- Noticia en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-08-28-fasth3-preview
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/fastvideo-fasth3-4-step-preview-v1-vsa-datafree-fastvideo
