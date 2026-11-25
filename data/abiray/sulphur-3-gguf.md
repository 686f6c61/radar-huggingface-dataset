# Abiray/Sulphur-3-GGUF

## Resumen
Sulphur-3 es un modelo de generación conjunta de vídeo y audio desarrollado por SulphurAI, distribuido en este repositorio por Abiray como conversión cuantizada en formato GGUF. Se trata de un ajuste fino (fine-tune) del modelo MiniMax-H3 en su variante FL2VA, orientado a la generación de vídeo con audio estéreo sincronizado a 32 kHz dentro de ComfyUI. El modelo base incorpora pesos entrenados con refuerzo (RL) y se distribuye originalmente como un checkpoint BF16 de 40,2 GB.

La relevancia de esta ficha radica en que permite ejecutar un modelo de difusión vídeo+audio de gran tamano en hardware de consumo, algo impracticable con los pesos originales. Las cuantizaciones GGUF van desde 8,9 GB (Q3_K_M) hasta 14,1 GB (Q5_K_M), lo que abre el despliegue en GPUs de 12 a 24 GB de VRAM. El modelo cuenta con 20.111.438.744 parámetros según los pesos safetensors del modelo base.

Es importante subrayar que no se trata de un modelo de lenguaje: es un modelo generativo multimodal de vídeo y audio. Por tanto, las secciones de esta ficha se adaptan a esa naturaleza (text-to-video, image-to-video, audio-video) y no a tareas de texto, código o razonamiento lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de vídeo+audio, base MiniMax-H3 (FL2VA) |
| Parametros totales | 20.111.438.744 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license |
| Formato de pesos | GGUF (convertidos desde safetensors BF16 de 40,2 GB) |

## Arquitectura y entrenamiento
El modelo se basa en MiniMax-H3 en su variante FL2VA, un transformer de difusión (DiT) que genera de forma conjunta fotogramas de vídeo y audio estéreo sincronizado a 32 kHz. Sulphur-3 es un fine-tune con entrenamiento por refuerzo (RL) sobre ese modelo base, distribuido como checkpoint `s3.safetensors` de 40,2 GB en BF16. No se dispone de información sobre el volumen de tokens, la composición del dataset de entrenamiento ni los detalles del proceso de RL en la documentación proporcionada.

La conversión a GGUF incorpora varias decisiones técnicas para preservar la estabilidad temporal y evitar artefactos. En primer lugar, aplica "FP32 shielding" sobre capas sensibles: todas las normas y sesgos 1D, además de capas críticas de modulación y E/S (`adaln_basis`, `adaln_t_table`, `adaln_proj.linear`, `time_embed`, `pos_embed`, `norm`, `audio_patch_proj`, `video_patch_proj`, `condition_proj`, `final_layer.video_out`, `final_layer.audio_out`, `scale_shift_table`), se mantienen en FP32. En segundo lugar, aplica "256-divisibility folding" sobre pesos 2D no alineados a 256, usando metadatos `comfy.gguf.orig_shape.*` para compatibilidad limpia con K-quant en ComfyUI-GGUF. Por último, cada tensor pasa una verificación de valores finitos (NaN/Inf) durante la conversión en streaming de BF16 a FP16.

## Capacidades
- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Generación conjunta de vídeo y audio sincronizado (audio-video) con audio estéreo a 32 kHz.
- Integración nativa con ComfyUI mediante el nodo `Unet Loader (GGUF)` y `ComfyUI-GGUF`.
- Compatibilidad con el LoRA Turbo de MiniMax-H3 para generación rápida en 6-8 pasos (aceleración aproximada de 4-5x).
- Soporte de offloading multi-GPU mediante `ComfyUI-MultiGPU`.
- No se documentan capacidades de texto, razonamiento, código, tool calling ni agentes, por tratarse de un modelo generativo de vídeo/audio.

## Casos de uso
- Generación de clips publicitarios con audio: el modelo produce vídeo y pista de audio estéreo sincronizada en una sola pasada, lo que simplifica la creación de anuncios cortos sin necesidad de doblaje posterior.
- Prototipado de escenas para cine o animación: a partir de una imagen de referencia (image-to-video) se pueden generar variaciones animadas con sonido ambiente, útiles para previsualizaciones de storyboard.
- Creación de contenido para redes sociales: la cuantización Q4_K_M (11,6 GB) permite ejecutar el modelo en una RTX 4090 y generar clips con audio en tiempos razonables usando el LoRA Turbo.
- Doblaje y sonorización automatizada: al generar audio sincronizado con el vídeo, se puede emplear para producir versiones sonorizadas de escenas sin grabación de audio independiente.
- Investigación en modelos generativos multimodales: el repositorio facilita estudiar el comportamiento de un DiT vídeo+audio bajo distintas cuantizaciones (Q3 a Q5) y medir el impacto en fidelidad de movimiento y calidad de audio.
- Despliegue en entornos con VRAM limitada: la variante Q3_K_M (8,9 GB) permite ejecutar el modelo en GPUs de 12-16 GB, habilitando pruebas en estaciones de trabajo de gama media.
- Integración en pipelines de ComfyUI para producción de vídeo por lotes: combinado con `ComfyUI-MultiGPU`, se puede repartir el modelo entre varias GPUs y automatizar la generación de múltiples clips.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para el modelo de difusión: 8,9 GB (Q3_K_M), 11,6 GB (Q4_K_M y Q4_K_S) y 14,1 GB (Q5_K_M). A esta cifra hay que sumar la del text encoder y los VAE.
- Text encoder (Qwen3-VL-32B adaptado a MiniMax-H3): 12,0 GB (Q3_K_M GGUF), 14,6 GB (Q4_K_M GGUF), 15,7 GB (NVFP4 AWQ), 27,1 GB (INT8 ConvRot) o 51,5 GB (BF16).
- VAE de vídeo: 5,21 GB (FP16, recomendado) o 2,81 GB (INT8 ConvRot, bajo VRAM). VAE de audio: 605 MB (FP32, obligatorio para audio estéreo a 32 kHz).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con text encoder cuantizado; GPUs de 12-16 GB para Q3_K_M con encoder Q3; A100/H100 para configuraciones BF16 completas o cargas multi-GPU.
- Cabe en GPU de consumo: sí, con cuantizaciones Q3_K_M y Q4_K_M, siempre que se use un text encoder cuantizado y se gestione el offloading.
- Opciones de despliegue: ComfyUI con `ComfyUI-GGUF` (nodo `Unet Loader (GGUF)` y `CLIPLoader (GGUF)`), opcionalmente `ComfyUI-MultiGPU` para offloading, y `ComfyUI-MiniMax-H3-Turbo` para el LoRA Turbo.
- Latencia y throughput: no disponibles. La model card indica que el LoRA Turbo permite generación en 6-8 pasos con una aceleración aproximada de 4-5x frente a la muestreo estándar, pero no se aportan cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sulphur-3 (GGUF, este repo) | 20,1 B | no disponible | GGUF (Q3-Q5) | minimax-h3-community-license | Hugging Face, ComfyUI |
| SulphurAI/Sulphur-3 (original) | 20,1 B | no disponible | safetensors BF16 | minimax-h3-community-license | Hugging Face |
| MiniMax-H3 (base, FL2VA) | no disponible | no disponible | safetensors | minimax-h3-community-license | Hugging Face, Comfy-Org |
| MiniMax-H3 + Turbo LoRA | no disponible | no disponible | safetensors (LoRA) | no disponible | Hugging Face |

La comparación se limita al ecosistema MiniMax-H3, ya que no se dispone de información sobre otros modelos de vídeo+audio comparables en la documentación proporcionada.

## Limitaciones y advertencias
- Licencia `minimax-h3-community-license`: es una licencia comunitaria con posibles restricciones para uso comercial; debe revisarse el archivo LICENSE antes de cualquier despliegue en producción.
- Modelo no Turbo: requiere pasos de muestreo estándar de MiniMax-H3 salvo que se combine con el LoRA Turbo, lo que incrementa el tiempo de generación.
- Las cuantizaciones agresivas (Q3_K_M) pueden degradar la fidelidad de movimiento y la calidad del audio; la model card recomienda Q4_K_M como equilibrio calidad/VRAM.
- Riesgo de artefactos temporales, jitter y fallos en las cabezas de audio si se realizan conversiones ingenuas; este repositorio mitiga el problema con FP32 shielding, pero no se documentan métricas objetivas de calidad.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo.
- El despliegue requiere archivos complementarios (text encoder, VAEs de vídeo y audio) que suman varios GB adicionales de VRAM/RAM; no es un modelo autónomo de un solo archivo.
- La integración depende de extensiones de terceros (`ComfyUI-GGUF`, `ComfyUI-MultiGPU`, `ComfyUI-MiniMax-H3-Turbo`), lo que añade dependencias de mantenimiento.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Abiray/Sulphur-3-GGUF
- Modelo base: https://huggingface.co/SulphurAI/Sulphur-3
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- ComfyUI-MultiGPU: https://github.com/pollockjj/ComfyUI-MultiGPU
- LoRA Turbo recomendado: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Nodos Turbo para ComfyUI: https://github.com/Larryvrh/ComfyUI-MiniMax-H3-Turbo
- Alternativa de LoRA Turbo para ComfyUI: https://huggingface.co/QrusherZA/H3_Turbo_ComfyUI
- Repack oficial de MiniMax-H3 en Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Text encoder GGUF Q4_K_M: https://huggingface.co/Abiray/MiniMax-H3-GGUF/blob/main/text_encoders/qwen3vl_32b_minimax_h3-Q4_K_M.gguf
- Text encoder GGUF Q3_K_M: https://huggingface.co/Abiray/Qwen3-VL-32B-Instruct-GGUF/blob/main/Qwen3vl_32b_h3-Q3_K_M.gguf
