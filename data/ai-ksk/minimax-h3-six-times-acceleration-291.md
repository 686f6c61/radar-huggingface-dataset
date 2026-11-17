# AI-KSK/minimax-h3-six-times-acceleration-291

## Resumen

Este repositorio no contiene un modelo de IA en el sentido habitual, sino un conjunto de once grafos de ComfyUI exportados que documentan distintos pipelines de generación de vídeo con MiniMax H3. El autor, AI-KSK, publica los archivos JSON de los workflows junto con las imágenes de portada y un manifiesto SHA256, sin incluir los pesos del modelo base, los LoRA, el codificador de texto ni los VAE. El objetivo declarado es comparar rutas de aceleración y configuraciones por tramo de VRAM (24, 48 y 80 GB) para image-to-video y reference-to-video.

La relevancia del paquete es, por tanto, documental y operativa: sirve como referencia reproducible de recetas de muestreo (6 pasos con `euler`+`beta`, 4 pasos con `er_sde` para LightX2V, 20 pasos con `res_multistep` para la comparativa INT8 W4A8) y de combinaciones de parches de atención y caché (Larry, SageAttention, LightX2V Turbo). El propio autor advierte que no se ejecutó ninguna inferencia para este paquete: no hay tiempos, cifras de VRAM medidas ni comparación de calidad, y la afirmación de "aceleración 6x" es una descripción del autor no verificada de forma independiente.

El repositorio tiene 0 GB de tamaño, 0 descargas y 0 likes en el momento de la consulta, con fecha de creación 2026-11-02 y última actualización 2026-11-16. No dispone de model card estándar con licencia, idiomas o pipeline declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene grafos de ComfyUI, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8-convrot, pruned-int8, W4A8 (mixta), nvfp4-awq (codificador de texto) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JSON de ComfyUI (workflows); no se incluyen safetensors, GGUF ni checkpoints |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento ni pesos. Lo que describe son grafos de inferencia para el modelo MiniMax H3 de generación de vídeo, con un codificador de texto `qwen3vl_32b_minimax_h3_*` en bf16 (tramo de 24 GB) o en int8-convrot / nvfp4-awq (tramos superiores), un VAE de vídeo `minimax_h3_video_vae_fp16` o `minimax_h3_video_vae_int8_convrot`, y un VAE de audio `minimax_h3_audio_vae_fp32`. Los LoRA empleados son `minimax_h3_turbo_v4_step600_ema_pruned_comfyui.safetensors` a fuerza 1,0 y, en el grafo LightX2V, `minimax_h3_fl2v_lightx2v_turbo_4step_v0.1_comfy` a fuerza 0,75.

Las variantes por VRAM usan checkpoints distintos del modelo base: `fl2va_bf16` y `ref2va_bf16` en el tramo de 24 GB, `fl2va_int8_convrot` y `ref2va_int8_convrot` en 48 GB, y `fl2va_pruned_int8_convrot` y `ref2va_pruned_int8_convrot` en 80 GB. Las recetas de muestreo son seis pasos con `euler` y `beta` (denoise 1) en los grafos con turbo-LoRA v4; cuatro pasos con `er_sde` y simple en LightX2V; y veinte pasos con `res_multistep` y simple sin LoRA en la comparativa INT8 W4A8. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) en tres tramos de VRAM: 24 GB (bf16), 48 GB (int8-convrot) y 80 GB (pruned-int8).
- Generación de vídeo a partir de referencias (reference-to-video), con entradas adicionales de vídeo y audio (`LoadImage` + `LoadVideo` + `LoadAudio`).
- Aceleración mediante LoRA turbo: seis pasos con `euler`+`beta` o cuatro pasos con `er_sde` en la ruta LightX2V.
- Combinación de parches de atención y caché: Larry, SageAttention y caché en el grafo "full blood" (71 nodos, 86 enlaces).
- Comparativa de cuantización W4A8 frente a int8-convrot en un mismo grafo con tres ramas paralelas.
- Salida de vídeo mediante el nodo `SaveVideo` con prefijo `video/MiniMax_H3`.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo del modelo base en la información disponible.

## Casos de uso

- Evaluación de recetas de aceleración en ComfyUI: el grafo 04 (Larry Turbo, 21 nodos) permite reproducir la configuración mínima de seis pasos con `euler`+`beta` y comparar tiempos frente a la ruta sin LoRA de veinte pasos del grafo 02.
- Despliegue en GPUs de 24 GB: los grafos 01 (I2V) y 06 (R2V) usan bf16 y VAE fp16, pensados para tarjetas de gama alta de consumo o profesional con 24 GB de VRAM.
- Despliegue en GPUs de 48 GB: los grafos 08 (I2V) y 07 (R2V) cambian a int8-convrot y VAE int8, reduciendo la huella de memoria a costa de precisión.
- Despliegue en GPUs de 80 GB: los grafos 11 (I2V) y 10 (R2V) emplean checkpoints pruned-int8, orientados a A100/H100 de 80 GB.
- Investigación de cuantización: el grafo 02 confronta una rama W4A8 mixta con dos ramas int8-convrot bajo la misma receta de veinte pasos, útil para medir degradación de calidad.
- Pruebas de stacks de atención: el grafo 03 (91 nodos, 111 enlaces) compara cuatro ramas con parches de atención y caché distintos sobre el modelo int8 con turbo-LoRA v4.
- Integración de audio y vídeo de referencia: los grafos R2V aceptan vídeo y audio de entrada, adecuados para tareas de reestilización o transferencia de movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ejecutó inferencia para este paquete: no hay render, tiempos, cifras de VRAM medidas ni comparación de calidad, y la cifra de "6x de aceleración" no fue medida de forma independiente.

## Requisitos de hardware

- VRAM: tres tramos declarados por el autor, 24 GB (bf16), 48 GB (int8-convrot) y 80 GB (pruned-int8).
- GPU recomendadas: no disponible de forma explícita; por capacidad de VRAM encajan A100/H100 de 80 GB en el tramo superior, y tarjetas de 24 GB (RTX 4090, RTX 3090, A10G, L4) en el inferior.
- Cabe en GPU de consumo: sí, en el tramo de 24 GB con los grafos 01 y 06 en bf16.
- Despliegue: ComfyUI exclusivamente; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de vídeo de este tipo.
- Latencia y throughput: no disponibles; el autor no aporta mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo MiniMax H3 subyacente que permitan una comparación cuantitativa con alternativas de generación de vídeo.

## Limitaciones y advertencias

- El repositorio no contiene pesos, LoRA, codificador ni VAE; sin esos archivos los grafos no son ejecutables por sí solos.
- No se ejecutó inferencia: la afirmación de "6x de aceleración" es una descripción del autor sin verificación independiente.
- Los grafos de comparación (02, 03, 09) guardan varias ramas bajo el mismo prefijo de salida, lo que facilita confundir resultados al leer los vídeos generados.
- La fuerza del LoRA difiere entre rutas (1,0 en turbo-v4, 0,75 en LightX2V); comparar tiempos sin ajustar ese parámetro invalida la comparación.
- Licencia no declarada: no puede asumirse uso comercial sin consultar la licencia del modelo base MiniMax H3 y de los LoRA referenciados.
- Los enlaces de entrada apuntan a RunningHub y Civitai, con posibles dependencias de servicios externos y de catálogos regionales.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas del modelo base en la documentación disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/minimax-h3-six-times-acceleration-291
- RunningHub internacional, grafo 01 (I2V 24 GB): https://www.runninghub.ai/zh-cn/post/2086411696771522561?inviteCode=rh-v1111
- RunningHub internacional, grafo 02 (W4A8): https://www.runninghub.ai/zh-cn/post/2086411704518406146?inviteCode=rh-v1111
- RunningHub internacional, grafo 03 (Larry + SageAttention): https://www.runninghub.ai/zh-cn/post/2086411824722956290?inviteCode=rh-v1111
- RunningHub internacional, grafo 04 (Larry Turbo): https://www.runninghub.ai/zh-cn/post/2086411713435492353?inviteCode=rh-v1111
- RunningHub China, grafo 01: https://www.runninghub.cn/post/2086411696771522561/?inviteCode=rh-v1111
- RunningHub China, grafo 02: https://www.runninghub.cn/post/2086411704518406146/?inviteCode=rh-v1111
- RunningHub China, grafo 03: https://www.runninghub.cn/post/2086411824722956290/?inviteCode=rh-v1111
- RunningHub China, grafo 04: https://www.runninghub.cn/post/2086411713435492353/?inviteCode=rh-v1111
- Civitai, grafo 01: https://civitai.com/models/3033474
- Civitai, grafo 02: https://civitai.com/models/3033475
- Civitai, grafo 03: https://civitai.com/models/3033476
