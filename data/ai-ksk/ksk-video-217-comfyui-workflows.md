# AI-KSK/ksk-video-217-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-217-comfyui-workflows` no es un modelo de pesos entrenado, sino un repositorio de flujos de trabajo (workflows) para ComfyUI que documenta tres grafos orientados a edicion y generacion de video. El autor, AI-KSK, publica las notas de un episodio en el que encadena tres pipelines: un repintado local guiado por referencia con LTX 2.3 R2V, un pseudo character swap basado en IC-LoRA que preserva el lip-sync, y una sustitucion de imagen fija enmascarada con Qwen Image Edit 2511. El repositorio tiene 0 GB de tamano, 0 descargas y 0 likes en el momento de la consulta, y su unico contenido es un `README.md` con la documentacion de los grafos.

El interes tecnico esta en la orquestacion: los tres grafos comparten un conjunto de componentes (doble CLIP con `gemma_3_12B_it_fp8_e4m3fn` y `ltx-2.3_text_projection_bf16`, VAE `LTX23_video_vae_bf16`, upscaler espacial `ltx-2.3-spatial-upscaler-x2-1.1`) y demuestran como combinar un UNET de video de 22B en fp8 con LoRAs especificos para inpainting, control de movimiento y edicion de imagen. No hay pesos propios ni ficha de modelo al uso: la utilidad es la receta de nodos y parametros.

Conviene tratarlo como material de referencia para quien ya trabaja con LTX 2.3 y Qwen Image Edit en ComfyUI, no como un modelo descargable. La licencia figura como `other` y el idioma declarado es `en`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de workflows ComfyUI); los grafos usan UNET LTX 2.3 de 22B, LoRAs IC-LoRA y Qwen Image Edit 2511 |
| Parametros totales | No disponible como modelo unico; el UNET LTX 2.3 referenciado es de 22B |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp8 (UNET `ltx-2.3-22b-distilled_transformer_only_fp8_input_scaled_v3`, `qwen_image_edit_2511_fp8mixed`, `gemma_3_12B_it_fp8_e4m3fn`); bf16 en `ltx-2.3_text_projection_bf16` y VAE |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | JSON de workflows ComfyUI; los modelos referenciados se usan en fp8/bf16 (safetensors presumiblemente, no confirmado) |

## Arquitectura y entrenamiento

El repositorio no entrena nada: agrupa tres grafos de ComfyUI con 208, 98 y 57 nodos respectivamente. El grafo R2V reference repaint combina el UNET `ltx-2.3-22b-distilled_transformer_only_fp8_input_scaled_v3` con una LoRA VBVR y `ltx23_inpaint_masked_r2v_rank32_v1_3000steps` a peso 1.0. El grafo de pseudo character swap usa el checkpoint `ltx-2.3-22b-distilled` con tres LoRAs (distil-384 a 0.7, Reasoning_V1 a 1.0 e ic-lora motion-track-control a 1.0) sobre un latente de 960x544x121. El tercer grafo emplea `qwen_image_edit_2511_fp8mixed` con una LoRA Lightning de 4 pasos, KSampler a 4 steps, CFG 1, sampler euler y scheduler sgm_uniform.

Las notas del autor documentan convenciones y rarezas del entrenamiento de las LoRAs: la LoRA R2V espera que la region a reemplazar se pinte como bloques rosas (convencion de los datos de entrenamiento), el pipeline requiere dos pasadas de render y una tercera degrada la salida, y el nodo `Set Latent Noise Mask` es lo que preserva el audio codificado incluso despues del upscale. El modelo R2V esta a 3.000 pasos de entrenamiento y el autor lo describe como "basicamente funcionando", no terminado.

## Capacidades

- Repintado local de video guiado por referencia (R2V) sobre regiones enmascaradas, con preservacion del audio original.
- Pseudo character swap sin mascara: aplica guia global en lugar de regional y mantiene el lip-sync.
- Control de movimiento mediante IC-LoRA (`ic-lora motion-track-control`).
- Edicion de imagen fija enmascarada con Qwen Image Edit 2511 y muestreo acelerado de 4 pasos.
- Upscaling espacial x2 integrado en el pipeline de video.
- Composicion multimodal texto+imagen de referencia mediante doble CLIP (Gemma 3 12B IT y proyeccion de texto LTX 2.3).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; son grafos de generacion/edicion visual.

## Casos de uso

- Repintado de producto en video: sustituir un objeto o region concreta de un plano manteniendo iluminacion y audio, usando el grafo R2V con mascara pintada en bloques rosas.
- Prototipado de VFX en postproduccion: aplicar el pseudo character swap para previsualizar cambios de personaje sin mascara antes de pasar a un pipeline profesional.
- Doblaje y localizacion: el pseudo swap conserva el lip-sync, lo que permite evaluar cambios de personaje o vestuario sin re-sincronizar el audio.
- Edicion de stills para storyboards: el grafo Qwen 2511 reemplaza elementos enmascarados de una imagen fija en 4 pasos, util para iteracion rapida de arte conceptual.
- Restauracion o limpieza de planos: el repintado local permite eliminar objetos no deseados en una region delimitada sin regenerar el fotograma completo.
- Experimentacion con IC-LoRA y control de movimiento: base para investigadores que quieran medir como afecta el peso de la LoRA de motion-track al resultado final.
- Docencia y reproduccion de pipelines: los grafos sirven como referencia de parametros (steps, CFG, scheduler, latentes) para quien este montando su propio flujo en ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El UNET LTX 2.3 es de 22B en fp8, lo que en la practica exige GPUs de gama alta; el latente de video 960x544x121 anade presion de memoria adicional.
- GPU recomendadas: no especificadas por el autor. Por el tamano del UNET en fp8, se situa en el rango de A100/H100 o GPUs consumer de 24 GB o mas, aunque esto no esta confirmado en la documentacion.
- Cabeza en GPU consumer: no confirmado; el uso de fp8 y del upscaler sugiere que en 24 GB puede ser ajustado y requerir offloading.
- Opciones de despliegue: ComfyUI exclusivamente (los artefactos son grafos JSON de ComfyUI). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo | Modelos base | Licencia | Disponibilidad |
|---|---|---|---|---|
| AI-KSK/ksk-video-217-comfyui-workflows | Workflows ComfyUI | LTX 2.3 22B, Qwen Image Edit 2511 | other | Publico en HF, 0 descargas |
| LTX 2.3 (modelo base) | Modelo de video | - | no disponible en esta ficha | Referenciado por los grafos |
| Qwen Image Edit 2511 | Modelo de edicion de imagen | - | no disponible en esta ficha | Referenciado por los grafos |

No se dispone de datos de rendimiento comparativo entre estos componentes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo R2V esta a 3.000 pasos de entrenamiento y el autor lo califica como "basicamente funcionando", no como version final.
- El pseudo character swap carece de mascara: solo aplica guia global, lo que limita el control fino sobre la region editada.
- La LoRA R2V exige pintar la region a reemplazar en bloques rosas; ignorar esta convencion rompe el resultado.
- Una tercera pasada de render degrada la salida; el pipeline esta disenado para exactamente dos pasadas.
- La preservacion de audio depende de `Set Latent Noise Mask`, incluido despues del upscale; omitirlo pierde el audio codificado.
- Licencia `other`: no se detallan condiciones de uso comercial en la informacion disponible; hay que revisar los terminos del autor y de los modelos base (LTX 2.3 y Qwen) por separado.
- Idioma declarado unicamente `en`; no hay evidencia de soporte multilingue en los prompts.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni reportes independientes de calidad.
- No hay pesos en el repositorio (0 GB); el usuario debe obtener los modelos base y las LoRAs por su cuenta.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-217-comfyui-workflows
- RunningHub (grafo 1): https://www.runninghub.ai/post/2041676758285553666/?inviteCode=rh-v1111
- RunningHub (grafo 2): https://www.runninghub.ai/post/2040718940661354497/?inviteCode=rh-v1111
- RunningHub (grafo 3): https://www.runninghub.ai/post/2041678315030843394/?inviteCode=rh-v1111
- YouTube: https://www.youtube.com/watch?v=W739JfP4RCI
- Bilibili: https://www.bilibili.com/video/BV1QrDzBsELY
