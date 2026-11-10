# akhaliq/minimax-h3-image-pdmd-2step

## Resumen

MiniMax-H3-Image pDMD 2-Step LoRA es un adaptador de destilación de pocos pasos para el modelo de difusión texto-a-imagen MiniMaxAI/MiniMax-H3-Image, un transformer de imagen de 33.100 millones de parámetros. Lo publica el usuario akhaliq y empaqueta la LoRA pDMD 2-NFE (arXiv 2609.35768) fusionada sobre el checkpoint oficial, de modo que el modelo genera una imagen completa en 2 evaluaciones de denoising en lugar de las 6 fijas del checkpoint original.

El problema que resuelve es la rigidez del schedule destilado del modelo base: el checkpoint oficial está destilado para 6 pasos y no puede ejecutarse por debajo de esa cifra sin producir imágenes a medio denoising. Esta LoRA, de rango 128 aplicada sobre atención y FFN en los 50 bloques, permite un modo real de 2 pasos sobre una rejilla de flow-matching estándar, sin classifier-free guidance (CFG) y manteniendo la resolución nativa de 4096×4096 (16 MP).

La relevancia práctica es la velocidad de iteración: al reducir de 6 a 2 evaluaciones de denoising, la generación por prompt y semilla es entre 2 y 3 veces más rápida, lo que habilita previsualizaciones casi en tiempo real (~1-1,5 s por fotograma a ~1 MP) y renderizados casi interactivos a 2-4 MP. El repositorio incluye tanto la LoRA en formato diffusers como conversiones para ComfyUI y un checkpoint de un solo archivo con la LoRA ya fusionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para texto-a-imagen; LoRA de rango 128 sobre atención y FFN de los 50 bloques |
| Parámetros totales | 33.122.992.896 (modelo base; tamaño de la LoRA no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolución nativa 4096×4096) |
| Tipos de cuantización | bf16 (pesos publicados); el stack ComfyUI usa text encoder int8 o nvfp4; build FP8 del Space |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers-layout y layout nativo ComfyUI); checkpoint de un solo archivo bf16 |
| Modelo base | MiniMaxAI/MiniMax-H3-Image |
| Pasos de inferencia | 2 evaluaciones de denoising (frente a 6 del base) |
| CFG | no requerido |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión (DiT) de 33.100 millones de parámetros para generación de imágenes a partir de texto, con una rama de audio presente en la arquitectura pero sin pesos en el checkpoint de imagen (los tensores de audio no usados son ceros). La LoRA publicada aquí es un adaptador de destilación pDMD de 2-NFE y rango 128, aplicada sobre las capas de atención y las capas feed-forward de los 50 bloques del transformer. Procede del release upstream pdmd2026/pdmd_2NFE_lora y se fusiona sobre el checkpoint oficial para obtener el modo de 2 pasos.

El entrenamiento subyacente es una destilación de pocos pasos: el checkpoint original está destilado para un schedule PDD fijo de 6 pasos, y esta LoRA lo reubica sobre una rejilla de flow-matching estándar para completar la imagen en 2 evaluaciones. No se detalla en la información disponible el volumen de tokens ni la composición del dataset de destilación, ni si hubo RLHF/DPO (no aplicable en un modelo de difusión). La innovación técnica destacable es la conversión de layouts: el repositorio ofrece las claves en formato diffusers (QKV separados) y en formato nativo ComfyUI (qkv_proj fusionado en bloque diagonal, mitades SwiGLU reordenadas a [gate; value]), además de un checkpoint de un solo archivo con 208 deltas fusionados en fp32 y metadatos del base preservados.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución nativa de 4096×4096 (16 MP).
- Modo de 2 pasos de denoising real, sin CFG, con prompts tal cual se escriben.
- Generación rápida de previsualizaciones a ~1 MP en ~1-1,5 s por fotograma, apta para flujo casi en tiempo real.
- Renderizado completo y edición de imágenes a 2, 3 y 4 pasos, hasta 16 MP.
- Pase de detalle (detail pass) integrado en el pipeline de demostración.
- Edición de imágenes en modo tiempo real (ejemplo de edición sobre una imagen fuente con prompt escrito en vivo).
- Compatibilidad con ComfyUI (checkpoint de un solo archivo o LoRA) y con diffusers (MiniMaxH3Transformer3DModel).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio en la información disponible.

## Casos de uso

- Previsualización interactiva de prompts: usar el modo de 2 pasos a ~1 MP para ver un fotograma en ~1-1,5 s mientras se escribe el prompt, con un pase de detalle al pausar; adecuado porque el modelo base no puede bajar de 6 pasos y quedaría a medio denoising.
- Iteración rápida de semillas y prompts en estudio: al reducir de 6 a 2 evaluaciones de denoising, la generación por combinación prompt/semilla es 2-3 veces más rápida, lo que acelera la exploración creativa a 2-4 MP.
- Renderizado de imágenes de alta resolución para producción editorial: el modelo opera a 4096×4096 nativo, útil para material gráfico que requiere 16 MP sin reescalado posterior.
- Edición de imágenes guiada por texto en tiempo real: el pipeline de demostración edita una imagen fuente con prompt en vivo a ~0,9 s por fotograma en el build FP8 del Space, aplicable a herramientas de retoque asistido.
- Integración en ComfyUI para pipelines de generación por lotes: el checkpoint de un solo archivo con la LoRA pre-fusionada evita nodos LoRA adicionales y carga sin claves no emparejadas, con ~20 s por imagen a 2048² en una H200.
- Despliegue en diffusers dentro de servicios Python: la carpeta `transformer/` ya convertida permite `from_pretrained(..., subfolder="transformer")` sin conversión en tiempo de ejecución, útil para APIs de generación de imágenes.
- Prototipado de herramientas creativas con ZeroGPU: el Space de demostración usa ZeroGPU para previsualizaciones en tiempo real, patrón replicable en demos públicas de generación de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados son operativos: ~1-1,5 s por fotograma de 2 pasos a ~1 MP en el Space (build FP8), ~0,9 s por fotograma en modo edición tiempo real, y ~20 s por imagen a 2048² en una H200 con bf16 DiT e int8 text encoder en ComfyUI.

## Requisitos de hardware

- El checkpoint de un solo archivo para ComfyUI ocupa 40 GB en bf16; el repositorio completo ocupa 150,1 GB.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del DiT bf16 (33,1B parámetros) se requiere hardware de clase servidor con memoria amplia, y el Space de demostración corre en ZeroGPU con build FP8.
- GPU recomendadas según los datos aportados: H200 (verificado a ~20 s por imagen a 2048²); no se documentan pruebas en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño del modelo y del checkpoint de 40 GB lo hacen inviable en GPUs de consumo de VRAM habitual.
- Opciones de despliegue: ComfyUI (checkpoint de un solo archivo o LoRA en layout nativo), diffusers (`MiniMaxH3Transformer3DModel` con `subfolder="transformer"`), y el Space de Hugging Face con ZeroGPU.
- Text encoder requerido en ComfyUI: qwen3vl_32b en int8 o nvfp4, más el VAE de Comfy-Org/MiniMax-H3-Image.
- Latencia y throughput: ~1-1,5 s por fotograma de 2 pasos a ~1 MP (FP8, Space); ~20 s por imagen a 2048² en H200 (bf16).

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos de inferencia | Resolución nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image pDMD 2-Step LoRA (este) | 33,1B (base) | 2 | 4096×4096 | Apache 2.0 | Hugging Face, ComfyUI, diffusers |
| MiniMaxAI/MiniMax-H3-Image (base) | 33,1B | 6 (fijo) | 4096×4096 | no disponible en la información | Hugging Face |
| pdmd2026/pdmd_2NFE_lora (upstream) | no disponible | 2 | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo base está destilado para un schedule fijo de 6 pasos; sin esta LoRA no puede ejecutarse por debajo de esa cifra sin imágenes a medio denoising.
- El modo de 2 pasos puede sacrificar detalle fino frente a más pasos; el pipeline de demostración incorpora un pase de detalle al pausar, lo que sugiere que el fotograma de 2 pasos no es el resultado final de máxima calidad.
- No se documentan sesgos conocidos ni tasas de alucinación para este adaptador; al ser un modelo de difusión, los riesgos se refieren a fidelidad al prompt y sesgos del dataset del modelo base, no detallados.
- Idiomas soportados: no disponible; el rendimiento multilingüe del prompt no está documentado.
- La licencia es Apache 2.0, lo que permite uso comercial, pero la licencia del modelo base MiniMaxAI/MiniMax-H3-Image no se especifica en la información disponible y debe verificarse por separado.
- El checkpoint de un solo archivo (40 GB) y el repositorio (150,1 GB) imponen requisitos de almacenamiento y ancho de banda considerables.
- La rama de audio del transformer contiene tensores a cero; el modelo no genera audio.
- El repositorio tiene 0 descargas en el momento de la consulta; la validación se limita a las pruebas del autor en ComfyUI master (2026-11-10) y en el Space de demostración.
- La conversión a layout ComfyUI procede de un tercero (Iwannapose) y se replica aquí; conviene verificar la integridad de los pesos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/minimax-h3-image-pdmd-2step
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- LoRA upstream pDMD 2-NFE: https://huggingface.co/pdmd2026/pdmd_2NFE_lora
- Paper pDMD (arXiv 2609.35768): https://arxiv.org/abs/2609.35768
- Conversión ComfyUI de Iwannapose: https://huggingface.co/Iwannapose/minimax_h3_pdmd_2nfe_comfyui
- Repack oficial para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Demo en vivo (ZeroGPU): https://huggingface.co/spaces/akhaliq/minimax-h3-image-2step
- Script de render: https://huggingface.co/akhaliq/minimax-h3-image-pdmd-2step/blob/main/render_grid.py
- Script de fusión ComfyUI: https://huggingface.co/akhaliq/minimax-h3-image-pdmd-2step/blob/main/merge_comfy.py
- Script de vídeo tiempo real: https://huggingface.co/akhaliq/minimax-h3-image-pdmd-2step/blob/main/make_realtime_video.py
