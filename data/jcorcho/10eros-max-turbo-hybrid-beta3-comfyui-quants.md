# JCorcho/10Eros-Max-TURBO-hybrid-beta3-ComfyUI-Quants

## Resumen

El modelo `JCorcho/10Eros-Max-TURBO-hybrid-beta3-ComfyUI-Quants` es una conversión cuantizada del checkpoint `10Eros_Max_h3_TURBO-hybrid_beta3.safetensors`, un modelo de generación de vídeo (image-to-video y text-to-video) basado en la arquitectura MiniMax-H3, desarrollado originalmente por TenStrip y cuantizado por JCorcho para su uso en ComfyUI. El checkpoint original en BF16 ocupa 40,23 GB, mientras que esta versión ofrece dos formatos reducidos: NVFP4 de 12,53 GB y FP8 E4M3FN de 20,96 GB, ambos en un único archivo safetensors listo para cargar con el nodo `UNETLoader` de ComfyUI.

La relevancia de este modelo radica en que permite ejecutar un modelo de difusión de vídeo de gran tamaño en tarjetas gráficas NVIDIA Blackwell con 16 GB de VRAM, algo inviable con el checkpoint original. La cuantización sigue el diseño nativo de ComfyUI para NVFP4 y FP8, preservando los tensores Turbo graft (`adaln_basis`, `adaln_mean`, `silu_t_emb_grid`) necesarios para el modo Turbo de 6 pasos. El modelo está pensado para generación de vídeo con audio nativo estéreo, y ha sido validado en una RTX 5070 Ti con resultados estructuralmente coherentes en pruebas de hasta 243 fotogramas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (modelo de difusión híbrido para vídeo y audio) |
| Parametros totales | no disponible (checkpoint BF16 de 40,23 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generación de vídeo, no texto) |
| Tipos de cuantizacion | NVFP4 (12,53 GB) y FP8 E4M3FN (20,96 GB) |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (modelo de difusión ComfyUI) |

## Arquitectura y entrenamiento

El modelo base `10Eros-Max` es un modelo de difusión para generación de vídeo basado en MiniMax-H3, una arquitectura híbrida desarrollada por MiniMax que combina mecanismos de atención con componentes de difusión para producir vídeo y audio sincronizados. El checkpoint `TURBO-hybrid beta3` es una fusión (merge) que incorpora un adaptador Turbo para reducir el número de pasos de inferencia a 6, en lugar de los 20 habituales. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) del modelo original.

La conversión cuantizada de JCorcho sigue el diseño publicado por `sakamakismile/10Eros-Max-beta2-NVFP4`: identifica las 200 capas que llevan el marcador `.comfy_quant` en el layout NVFP4 de referencia y cuantiza exactamente esas matrices del checkpoint BF16 Turbo-beta3 usando `TensorCoreNVFP4Layout` (para NVFP4) o `TensorCoreFP8E4M3Layout` (para FP8). El resto de tensores se conservan sin cuantizar. En la versión FP8, se añaden 200 escalares FP32 por matriz y 335 tensores se mantienen en BF16, evitando conversiones en tiempo de carga. La verificación estructural confirma 200/200 matrices cuantizadas, cero tensores faltantes y cero discrepancias de dtype o forma frente a la referencia beta2.

## Capacidades

- Generación de vídeo a partir de una imagen inicial (image-to-video) y de texto (text-to-video).
- Generación de audio nativo estéreo sincronizado con el vídeo (hasta 10 segundos a 24 FPS).
- Modo Turbo con 6 pasos de inferencia, usando el sampler `er_sde` y el scheduler `simple`.
- Soporte nativo para ComfyUI mediante el nodo `UNETLoader` y los nodos MiniMax H3 oficiales.
- Cuantización NVFP4 y FP8 optimizada para GPUs NVIDIA Blackwell (probada en RTX 5070 Ti de 16 GB).
- Capacidad de generar clips largos (243 fotogramas, recortados a 240 para 10 segundos) con coherencia estructural en pruebas locales.
- Contenido NSFW (según las etiquetas del modelo), no apto para todos los públicos.

## Casos de uso

- Creación de contenido audiovisual para redes sociales: el modelo genera clips de hasta 10 segundos con audio nativo, ideal para producir vídeos cortos sin necesidad de herramientas externas de edición o sincronización.
- Prototipado rápido de animaciones: con 6 pasos de inferencia y cuantización NVFP4, se pueden iterar ideas visuales en una RTX 5070 Ti en tiempos de ejecución de aproximadamente 152 segundos para 124 fotogramas, lo que permite validar conceptos antes de una producción completa.
- Generación de vídeos educativos: a partir de una imagen de referencia y un prompt de texto, se pueden crear secuencias animadas para explicar conceptos técnicos o científicos, con audio generado automáticamente.
- Producción de vídeos musicales experimentales: la generación de audio estéreo sincronizado permite crear piezas audiovisuales completas sin depender de bibliotecas de música o efectos de sonido externos.
- Investigación en generación de vídeo con modelos de difusión: el modelo cuantizado sirve como referencia para estudiar el impacto de la cuantización NVFP4/FP8 en la calidad de vídeo y audio, así como para probar nuevas configuraciones de sampler y scheduler.
- Automatización de contenidos para entornos de demostración: en ferias o presentaciones, se pueden generar vídeos personalizados sobre la marcha a partir de imágenes de productos o escenarios, con audio integrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (como FVD, CLIP score o métricas de audio) en la información disponible. La validación local descrita en la model card incluye:

- Prueba inicial: RTX 5070 Ti de 16 GB, resolución 768 × 1344, 124 fotogramas a 24 FPS con audio estéreo, 7 transiciones de denoising, 151,961 segundos de ejecución. El clip resultante fue estructuralmente coherente en una hoja de contacto temporal de 10 fotogramas.
- Prueba extendida: 28 escenas independientes a 768 × 1344 y 24 FPS, cada una con 243 fotogramas generados (recortados a 240), usando `er_sde` con scheduler `simple` a 6 pasos. Las 28 generaciones completaron sin errores, aunque no se reporta la mediana de tiempo por escena.

Estos datos son una prueba de humo limitada, no una evaluación de calidad exhaustiva.

## Requisitos de hardware

- VRAM estimada: 16 GB para el archivo NVFP4 (12,53 GB) en una GPU Blackwell; el archivo FP8 (20,96 GB) requiere offloading de modelo en una GPU de 16 GB.
- GPU recomendada: NVIDIA GeForce RTX 5070 Ti (16 GB) probada por el autor; cualquier GPU Blackwell con 16 GB o más debería ser compatible.
- No cabe en GPUs consumer de generaciones anteriores (Ampere, Ada Lovelace) sin soporte nativo para NVFP4; el FP8 podría funcionar con offloading, pero no está verificado.
- Despliegue: ComfyUI con el nodo `UNETLoader` (dejar `weight_dtype` en `default`). Se requieren archivos complementarios de `Comfy-Org/MiniMax-H3`: text encoder `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`, VAE de vídeo `minimax_h3_video_vae_fp16.safetensors` y VAE de audio `minimax_h3_audio_vae_fp32.safetensors`.
- Latencia: en la prueba inicial, 151,961 segundos para 124 fotogramas (aproximadamente 1,23 segundos por fotograma) en una RTX 5070 Ti, incluyendo 7 transiciones de denoising. No se reporta throughput para el modo de 6 pasos estándar.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | VRAM requerida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TenStrip/10Eros-Max (original) | BF16 safetensors | 40,23 GB | > 24 GB (no verificado) | minimax-h3-community-license-agreement | Hugging Face |
| JCorcho/10Eros-Max-TURBO-hybrid-beta3-ComfyUI-Quants | NVFP4 / FP8 safetensors | 12,53 / 20,96 GB | 16 GB (Blackwell) | minimax-h3-community-license-agreement | Hugging Face |
| DmitryDB/MiniMax-H3-10Eros-Max-Quants | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de información suficiente sobre `DmitryDB/MiniMax-H3-10Eros-Max-Quants` para una comparación detallada. El modelo original BF16 requiere más VRAM y no está optimizado para Blackwell, mientras que la versión cuantizada de JCorcho está específicamente diseñada para GPUs de 16 GB con soporte NVFP4.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está etiquetado como `nsfw` y `not-for-all-audiences`; su uso en entornos públicos o profesionales debe restringirse a contextos apropiados.
- Licencia comunitaria MiniMax-H3: la licencia `minimax-h3-community-license-agreement` puede imponer restricciones al uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar el modelo en producción.
- Riesgo de alucinaciones visuales: en pruebas con clips largos (243 fotogramas), se observaron deriva de tono (hue drift) e inestabilidad anatómica; el autor recomienda el sampler `er_sde` con scheduler `simple` a 6 pasos para mitigar estos fallos, pero no los elimina por completo.
- Dependencia de hardware específico: la cuantización NVFP4 está optimizada para GPUs NVIDIA Blackwell; en otras arquitecturas puede no funcionar o requerir conversiones adicionales.
- Requiere archivos complementarios: el text encoder y los VAEs no están incluidos en este repositorio; deben descargarse por separado de `Comfy-Org/MiniMax-H3`, lo que añade complejidad a la instalación.
- Sin benchmarks formales: la validación se limita a pruebas locales del autor; no hay métricas objetivas de calidad de vídeo o audio publicadas.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/JCorcho/10Eros-Max-TURBO-hybrid-beta3-ComfyUI-Quants
- Modelo base TenStrip/10Eros-Max: https://huggingface.co/TenStrip/10Eros-Max
- Repositorio oficial MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Archivos complementarios Comfy-Org/MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- Workflow oficial I2V para ComfyUI: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v.json
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Referencia de cuantización NVFP4 beta2: https://huggingface.co/sakamakismile/10Eros-Max-beta2-NVFP4
