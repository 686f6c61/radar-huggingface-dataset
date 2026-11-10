# Russ1on/MiniMax-H3

## Resumen

MiniMax-H3 es un modelo de generación de vídeo (y audio) de la familia MiniMax, publicado originalmente por MiniMaxAI bajo la licencia comunitaria `minimax-h3-community-license-agreement`. El repositorio analizado, `Russ1on/MiniMax-H3`, no es el modelo original: es un reempaquetado de pesos en formato `safetensors` de un solo archivo, pensado para su uso directo en ComfyUI. Incluye variantes del modelo de difusión, el text encoder, VAEs de vídeo y audio, LoRAs de destilación (Turbo), un ControlNet Union y varios embeddings de prompt.

El modelo soporta tres flujos principales de generación: texto a vídeo (t2v), imagen a vídeo (i2v) y referencia a vídeo (r2v), además de continuación de vídeo. El text encoder es Qwen3-VL-32B, lo que aporta comprensión multimodal de imagen y texto para condicionar la generación. El repositorio ocupa 534,7 GB e incluye múltiples cuantizaciones (`bf16`, `int8_convrot`, `fp8_scaled`, `w6a8`, `nvfp4_awq`) para adaptarse a distintos presupuestos de VRAM.

La relevancia de este reempaquetado es práctica: elimina la fricción de convertir pesos originales para ComfyUI y ofrece variantes podadas y cuantizadas que reducen los requisitos de memoria, además de LoRAs Turbo que rebajan el número de pasos de muestreo a 4 u 8. No se dispone de información sobre parámetros totales, longitud de contexto ni datos de entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | modelo de difusión (single-file) con text encoder Qwen3-VL-32B; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | `bf16`, `int8_convrot`, `fp8_scaled`, `w6a8`, `nvfp4_awq` (text encoder); VAE de vídeo en `int8_convrot` y VAE de audio en `fp32` |
| Idiomas soportados | no disponible |
| Licencia | `minimax-h3-community-license-agreement` (other) |
| Formato de pesos | `safetensors` (librería `diffusion-single-file`) |

## Arquitectura y entrenamiento

El repositorio contiene pesos de un modelo de difusión para generación de vídeo, empaquetados como archivos únicos `safetensors` para ComfyUI. Se distinguen dos familias de checkpoints según la condición de entrada: `fl2va` (frame/image-to-video con audio) y `ref2va` (reference-to-video con audio), cada una en versión completa y podada (`pruned`), y en varias cuantizaciones. El pipeline incorpora un text encoder Qwen3-VL-32B en versiones `bf16`, `int8_convrot` y `nvfp4_awq`; según la model card, la variante `nvfp4` no requiere GPU Blackwell.

El sistema incluye VAEs separados para vídeo y audio, lo que indica que el modelo genera pistas de audio junto al vídeo. También se distribuyen LoRAs de destilación Turbo (4 y 8 pasos) para reducir el coste de muestreo, LoRAs `pika_h3_flex` y un ControlNet Union podado (`fun_controlnet_union`) para control estructural adicional. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (t2v).
- Generación de vídeo a partir de una imagen inicial (i2v).
- Generación de vídeo condicionada por una referencia visual (r2v).
- Continuación de vídeo existente (i2v continuation).
- Generación conjunta de vídeo y audio (los checkpoints se etiquetan `fl2va` y `ref2va`, y se incluye un VAE de audio).
- Condicionamiento multimodal mediante el text encoder Qwen3-VL-32B (comprensión de imagen y texto).
- Control estructural mediante ControlNet Union (`fun_controlnet_union`).
- Muestreo acelerado con LoRAs Turbo de 4 y 8 pasos.
- Estilización y efectos mediante embeddings de prompt predefinidos (por ejemplo, `minimaxh3_bullet_time`, `minimaxh3_fire_breath`, `minimaxh3_four_seasons`).
- No se dispone de información sobre tool calling, uso como agente ni modo de razonamiento explícito.

## Casos de uso

- Generación de clips publicitarios a partir de un brief textual: el flujo t2v con el checkpoint `fl2va` permite producir vídeo con audio sincronizado, útil para prototipos rápidos de campaña antes de una producción final.
- Animación de imágenes fijas para redes sociales: el flujo i2v toma una fotografía o ilustración y genera movimiento, adecuado para contenido de bajo coste con la LoRA Turbo de 4 pasos.
- Previsualización de storyboards: la continuación de vídeo (`i2v_continuation`) permite encadenar planos y validar ritmo y continuidad antes de rodar.
- Consistencia de personaje entre planos: el flujo r2v, condicionado por una referencia visual, sirve para mantener la apariencia de un personaje en varias tomas.
- Efectos visuales estilizados: los embeddings incluidos (`bullet_time`, `dark_magic`, `storm_magic`, etc.) permiten aplicar efectos reconocibles invocándolos en el prompt del nodo `CLIPTextEncode`.
- Control de composición y pose: el ControlNet Union podado permite imponer estructura (bordes, profundidad u otras guías) sobre la generación, útil en pipelines de VFX.
- Iteración rápida en estación de trabajo local: las variantes podadas y cuantizadas (`int8_convrot`, `fp8_scaled`, `w6a8`) reducen el uso de VRAM y hacen viable el ciclo de prueba y error en GPUs de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio completo ocupa 534,7 GB; el espacio en disco necesario para una instalación completa es, por tanto, muy elevado.
- VRAM estimada: no disponible de forma numérica. Las variantes podadas y cuantizadas (`pruned_int8_convrot`, `pruned_fp8_scaled`, `pruned_w6a8`) están pensadas para reducir el consumo frente a `bf16`.
- El text encoder Qwen3-VL-32B en `nvfp4_awq` no requiere GPU Blackwell según la model card; la variante `int8_convrot` requiere PyTorch con CUDA 13.0 (`cu130`).
- `fp8_scaled` se indica como opción de reserva solo si no se puede usar `int8_convrot`.
- GPU recomendadas: no disponible. Por el tamaño del text encoder (32B) y del modelo de difusión, se presume necesario hardware de centro de datos o GPUs de gama alta con gran cantidad de VRAM, pero no se confirma en la información.
- Despliegue: ComfyUI es el entorno objetivo (librería `diffusion-single-file`, workflows oficiales de Comfy-Org). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Las LoRAs Turbo de 4 y 8 pasos reducen el número de pasos de muestreo, lo que implica menor tiempo de inferencia, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generación de vídeo que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia `minimax-h3-community-license-agreement`: es una licencia comunitaria con posibles restricciones de uso comercial; debe revisarse el texto completo antes de cualquier despliegue en producción.
- Este repositorio es un reempaquetado de terceros (`Russ1on`), no la publicación oficial de MiniMaxAI; la procedencia y la integridad de los pesos deben verificarse contra el repositorio original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que no aporta señal de validación comunitaria.
- No se dispone de información sobre sesgos, tasas de alucinación visual, idiomas soportados ni limitaciones de contexto.
- La generación de vídeo con audio plantea riesgos de deepfake y de contenido sintético engañoso; se recomienda etiquetado y políticas de uso responsables.
- El tamaño del repositorio (534,7 GB) y del text encoder (32B) implican requisitos de almacenamiento y memoria considerables; las variantes cuantizadas mitigan pero no eliminan esta barrera.
- La variante `int8_convrot` exige PyTorch con CUDA 13.0; entornos con versiones anteriores deben usar `fp8_scaled`, con posible pérdida de calidad.
- No hay información sobre estabilidad, soporte a largo plazo ni mantenimiento del reempaquetado.

## Enlaces

- Repositorio analizado: https://huggingface.co/Russ1on/MiniMax-H3
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Variante Turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- ControlNet Union: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union
- Repositorio experimental: https://huggingface.co/Kijai/MiniMax-H3-experimental
- Text encoder Qwen3-VL-32B NVFP4 de origen: https://huggingface.co/cybermotaz/Qwen3-VL-32B-Instruct-NVFP4
- Workflow imagen a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v.json
- Workflow referencia a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_r2v.json
- Workflow texto a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_t2v.json
- Workflow continuación de vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v_continuation.json
