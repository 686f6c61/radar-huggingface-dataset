# KyleNeverGivesUp/FastH3-4-step-Preview-v1-r16

## Resumen

FastH3-4-step-Preview-v1-r16 es una variante del modelo FastH3 Preview v1, desarrollado por el usuario KyleNeverGivesUp, que aplica una factorización de rango 16 a las proyecciones de modulación AdaLN (Adaptive Layer Normalization) del transformador de difusión. FastH3 es a su vez una destilación DMD2 (Distribution Matching Distillation) de MiniMax-H3 realizada por FastVideo, que reduce el proceso de denoising a solo cuatro pasos del modelo DiT. Esta versión concreta reduce los parámetros totales de 35,05 mil millones a 22,09 mil millones, una reducción del 37 %, manteniendo la misma calidad de generación gracias a que la curva de modulación AdaLN es intrínsecamente de baja dimensión.

El modelo está diseñado para generación de vídeo y audio sincronizado a partir de texto, con una ventana máxima de 345 fotogramas (15 segundos a 24 fps). Es relevante porque permite ejecutar el modelo en hardware con memoria limitada, como una DGX Spark con 121 GiB de memoria unificada, gracias a la reducción de parámetros y al soporte de cuantización FP8. La licencia es la comunidad de MiniMax-H3, que permite uso comercial bajo ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con atención VSA-H3, basado en MiniMax-H3, con AdaLN factorizado a rango 16 |
| Parametros totales | 22.092.860.160 (22,09 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Máximo 345 fotogramas (15 s a 24 fps, con restricción 17n+5) |
| Tipos de cuantizacion | FP8, bf16 |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License Agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint destilado FastH3 Preview v1, que a su vez es una destilación DMD2 de MiniMax-H3. La arquitectura base es un transformador de difusión con atención sparse VSA-H3 (Video Sparse Attention), que reduce el coste computacional al 10 % de la atención densa. La destilación DMD2 permite generar vídeo con solo cuatro pasos de denoising (frente a los 50 del modelo original), lo que acelera la generación hasta 14 veces en GPUs Blackwell.

La innovación principal de esta variante es la factorización de rango 16 de las proyecciones de modulación AdaLN. El argumento técnico es que la entrada de AdaLN es siempre `silu(time_embedder(time_proj(t)))` para un escalar de tiempo, por lo que la modulación que puede producir una capa traza una curva unidimensional en un espacio de 2688 dimensiones. Un rango 16 reconstruye esa curva con un error relativo de 6,1e-09, muy por debajo de la precisión de bf16. Esto permite eliminar el 37 % de los parámetros sin pérdida perceptible de calidad. Los datos de entrenamiento no están disponibles, ya que el modelo no se ha entrenado desde cero, sino que se ha convertido mediante un script de reducción de rango.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución hasta 768x1344 y duración hasta 15 segundos.
- Generación de audio sincronizado con el vídeo (text-to-audio-video), produciendo pista de audio estéreo.
- Denoising en cuatro pasos gracias a la destilación DMD2, lo que reduce drásticamente el tiempo de inferencia.
- Soporte de cuantización FP8 para reducir el uso de memoria y acelerar la inferencia en hardware compatible.
- Atención sparse VSA-H3 que reduce el coste computacional de la atención en un 90 %.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente generativo de vídeo y audio.
- Capacidades multilingües no especificadas; el prompt se procesa mediante el codificador de texto de MiniMax-H3, que soporta principalmente inglés y chino, aunque no se confirma en la documentación.

## Casos de uso

- Creación de contenido para marketing y publicidad: el modelo puede generar clips de vídeo de hasta 15 segundos con audio sincronizado a partir de descripciones textuales, ideal para prototipos rápidos de anuncios o vídeos promocionales sin necesidad de rodaje.
- Producción de vídeo para redes sociales: permite generar vídeos cortos de alta resolución (768x1344) con audio, adecuados para plataformas como TikTok, Instagram Reels o YouTube Shorts, reduciendo el tiempo de producción de horas a minutos.
- Generación de material de entrenamiento para simulaciones: se puede utilizar para crear vídeos sintéticos de escenarios específicos (por ejemplo, entornos naturales o urbanos) que sirvan como datos de entrenamiento para modelos de visión por computador.
- Prototipado de escenas cinematográficas: directores y guionistas pueden generar visualizaciones rápidas de escenas descritas en texto para evaluar la composición, el movimiento y la iluminación antes de la producción real.
- Generación de vídeo para presentaciones y educación: permite crear vídeos explicativos animados a partir de guiones textuales, con audio narrado o efectos sonoros sincronizados, sin necesidad de herramientas de animación complejas.
- Investigación en generación de vídeo y audio: el modelo sirve como punto de partida para estudiar técnicas de destilación, factorización de bajo rango y atención sparse en modelos de difusión multimodales, gracias a su arquitectura abierta y su licencia comunitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como FVD, CLIP score o similitud de audio. Los únicos datos de rendimiento son mediciones de memoria y tiempo en una DGX Spark (GB10) con 121 GiB de memoria unificada:

| Fotogramas | Duracion | Resolucion | FP8 | Pesos residentes | Pico de memoria | Tiempo |
|---|---:|---:|---:|---:|---:|---:|
| 124 | 5,17 s | 768x1344 | no | 51,70 GiB | 69,2 GiB | 902 s |
| 345 | 14,38 s | 768x1344 | sí | 33,06 GiB | 83,7 GiB | 3096 s |

Estos valores son reproducibles en cuanto a memoria, pero los tiempos son indicativos porque dependen de la carga del sistema.

## Requisitos de hardware

- VRAM estimada: sin FP8, se necesitan al menos 70 GiB de memoria para 124 fotogramas; con FP8, 84 GiB para 345 fotogramas. Los pesos residentes ocupan 51,7 GiB (sin FP8) o 33,1 GiB (con FP8).
- GPU recomendadas: el modelo se ha probado en una DGX Spark (NVIDIA GB10) con 121 GiB de memoria unificada. Para ejecutar la configuración máxima de 345 fotogramas con FP8 se requiere una GPU con al menos 84 GiB de memoria, como una A100 de 80 GB (con margen ajustado) o una H100 de 94 GB. En GPUs de consumo (RTX 4090 con 24 GB) no es viable, ni siquiera con FP8.
- Opciones de despliegue: el modelo se ejecuta mediante la librería FastVideo, con el backend de atención VSA-H3 (Triton kernel). Se requiere activar `--lazy-module-load` y, para FP8, la cuantización a través de la API de FastVideo. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: en la DGX Spark, la generación de 124 fotogramas tarda unos 902 segundos (15 minutos) y 345 fotogramas unos 3096 segundos (51,6 minutos). Estos tiempos son orientativos y dependen de la carga del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto maximo | Pasos de denoising | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastH3-4-step-Preview-v1-r16 (este) | 22,09 B | 345 fotogramas (15 s) | 4 | MiniMax H3 Community | Hugging Face |
| FastH3 Preview v1 (base) | 35,05 B | 345 fotogramas (15 s) | 4 | MiniMax H3 Community | Hugging Face |
| MiniMax-H3 (original) | 35,05 B (aprox.) | 345 fotogramas (15 s) | 50 | MiniMax H3 Community | Hugging Face |
| FastH3 Preview v0.2 | 35,05 B | 345 fotogramas (15 s) | 4 | MiniMax H3 Community | Hugging Face |

La principal diferencia entre este modelo y el base es la reducción de parámetros (22,09 B frente a 35,05 B) con una pérdida de calidad teóricamente despreciable (error de modulación de 6,1e-09). Frente al MiniMax-H3 original, la ventaja es el número de pasos de denoising (4 frente a 50), lo que acelera la generación de forma significativa.

## Limitaciones y advertencias

- El modelo es solo para inferencia. FastVideo rechaza entrenar un checkpoint que contenga `adaln_rank`, porque la factorización está ajustada a la incrustación de tiempo del modelo base y las actualizaciones de gradiente la invalidarían.
- Requiere el backend de atención VSA-H3, heredado de FastH3 v1. Sin este backend, el modelo no puede construir la capa `attn.to_gate_compress` y la generación falla.
- Solo soporta text-to-audio-video. Las variantes FL2VA (imagen a vídeo) y Ref2VA (vídeo de referencia) no fueron destiladas en el modelo base, por lo que no están disponibles.
- Depende de dos cambios en FastVideo que aún no están en la rama principal: `--lazy-module-load` (PR #1761) y la cuantización FP8 completa (PR #1780). Hasta que se fusionen, es necesario usar las ramas de desarrollo o un hardware con más memoria.
- La licencia MiniMax H3 Community License Agreement puede imponer restricciones de uso comercial; se recomienda revisar los términos completos antes de desplegar en producción.
- No se han documentado sesgos específicos, pero al ser un modelo generativo de vídeo, puede reflejar sesgos presentes en los datos de entrenamiento de MiniMax-H3, que no son públicos.
- El tiempo de generación es elevado incluso en hardware profesional (15-50 minutos por clip), lo que limita su uso en aplicaciones interactivas o de tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KyleNeverGivesUp/FastH3-4-step-Preview-v1-r16
- Modelo base FastH3 Preview v1: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree
- MiniMax-H3 original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio FastVideo: https://github.com/hao-ai-lab/FastVideo
- PR #1761 (lazy module load): https://github.com/hao-ai-lab/FastVideo/pull/1761
- PR #1780 (FP8 feed-forward): https://github.com/hao-ai-lab/FastVideo/pull/1780
- PR #1699 (conversor AdaLN): https://github.com/hao-ai-lab/FastVideo/pull/1699
- PR #1712 (mover a scripts): https://github.com/hao-ai-lab/FastVideo/pull/1712
- Artículo sobre FastH3 Preview v1: https://comfyui-wiki.com/en/news/2026-08-28-fasth3-preview
- Variante v0.2 con r16: https://huggingface.co/KyleNeverGivesUp/FastH3-Preview-v0.2-r16
- Tratamiento similar para MiniMax-H3 oficial: https://huggingface.co/noctuashap/MiniMax-H3-pruned-r16
