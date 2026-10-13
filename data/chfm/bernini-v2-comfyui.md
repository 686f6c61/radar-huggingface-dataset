# chfm/Bernini-v2-ComfyUI

## Resumen

Bernini-v2-ComfyUI es un paquete de pesos en formato single-file para ComfyUI derivado de ByteDance/Bernini-Diffusers-v2, publicado por el usuario chfm. No es un modelo de lenguaje ni un generador de vídeo al uso: la model card lo describe explicitamente como un *editor* de vídeo que admite texto-a-vídeo (t2v), imagen-a-vídeo (i2v), vídeo-a-vídeo (v2v), referencia-a-vídeo (r2v), referencia+vídeo-a-vídeo (rv2v) y una variante de anuncios (ads2v). La peculiaridad es que los medios de origen (imagenes de referencia o vídeo fuente) son entradas de primera clase y no meros condicionantes opcionales.

El pipeline consta de dos etapas. La primera es una planificacion semantica: un MLLM basado en Qwen2.5-VL afinado, junto con un connector y un `vit_decoder` con bucle tipo MaskGIT, convierte el texto y los tokens visuales de origen en `diff_mllm_contexts`. La segunda es el renderizado: dos DiT Wan2.2 coentrenados (experto de alto ruido y experto de bajo ruido, con conmutacion en el paso 0.875) generan el vídeo aplicando la guía `vae_txt_vit_wapg` (CFG de cuatro vías con proyeccion APG) sobre latentes de contexto codificados con el VAE, y la decodificacion final usa el VAE de Wan2.1.

El paquete es relevante para quien quiera ejecutar localmente el flujo completo de Bernini v2 dentro de ComfyUI, ya que el autor del modelo original solo publico el renderizador (Bernini-R) hasta ahora. El repositorio ocupa 227,1 GB, la licencia es Apache 2.0 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que no hay validacion comunitaria publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion de video en dos etapas: planificador multimodal (Qwen2.5-VL afinado + connector + `vit_decoder` con bucle tipo MaskGIT) y renderizador con dos DiT Wan2.2 (high-noise / low-noise, conmutados en 0.875) |
| Parametros totales | no disponible (el repositorio ocupa 227,1 GB en cuantizaciones FP8 y NVFP4) |
| Parametros activos | no disponible (se desconoce el reparto entre los dos expertos DiT) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 scaled (planner MLLM), NVFP4 (DiT high-noise y low-noise), fp8_e4m3fn_scaled (T5 UMT5-XXL), bf16 (`vit_decoder`), fp32 (VAE Wan2.1) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors single-file (`diffusion-single-file`); la variante Bernini-R del mismo autor publica tambien GGUF |

## Arquitectura y entrenamiento

La etapa de planificacion semantica se apoya en un Qwen2.5-VL afinado (la busqueda web lo cifra en 7B, dato no confirmado en la model card), un connector que proyecta los tokens visuales y de texto, y un `vit_decoder` que ejecuta un bucle de decodificacion tipo MaskGIT hasta producir los `diff_mllm_contexts`. Esa representacion intermedia es la pieza que distingue a Bernini v2 del renderizador Bernini-R, que carece de ella.

La etapa de renderizado emplea dos DiT Wan2.2 coentrenados que se alternan segun el nivel de ruido: el experto de alto ruido actua hasta el paso 0.875 y el de bajo ruido a partir de ahi. La guia `vae_txt_vit_wapg` implementa un CFG de cuatro vias con proyeccion APG, y los medios de origen se inyectan como `context_latents` codificados con el VAE. El texto se codifica con UMT5-XXL y la decodificacion final la realiza el VAE de Wan2.1. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card de Bernini-R del mismo autor menciona la publicacion del articulo "Bernini: Latent Semantic Planning for Video Diffusion" el 2026-05-22, pero este paquete es un fine-tune/repack de ByteDance/Bernini-Diffusers-v2 y no incluye ficha de entrenamiento propia.

## Capacidades

- Generacion de video a partir de texto (t2v), sin conectar ninguna entrada de medios.
- Animacion de imagen a video (i2v).
- Edicion de video a video (v2v) usando `source_video` como entrada.
- Edicion guiada por imagenes de referencia (r2v), cuando solo se conectan `reference_images`.
- Edicion conjunta de video fuente e imagenes de referencia (rv2v), cuando se conectan `source_video` y `reference_images`.
- Flujo orientado a anuncios (ads2v), con `source_video` y `reference_video` conectados a la vez.
- Transformacion de imagen a imagen, segun los tags del repositorio.
- Inferencia del tipo de tarea a partir de las entradas conectadas, sin seleccion manual en el nodo de ComfyUI.
- Planificacion semantica de escena y movimiento mediante el MLLM Qwen2.5-VL, que produce `diff_mllm_contexts`.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explicito.
- No se declaran capacidades de audio ni idiomas soportados.

## Casos de uso

- Edicion de video con coherencia de personaje: con r2v o rv2v se pueden aportar imagenes de referencia de una persona o producto y mantener su identidad a lo largo del clip, porque el planificador convierte esos tokens visuales en contexto para el renderizador.
- Adaptacion de creatividades publicitarias: el flujo ads2v permite tomar un video fuente y un video de referencia para trasladar estilo, ritmo o composicion a una pieza nueva, util en equipos de marketing que iteran campanas con material ya rodado.
- Post-produccion y estilizacion de metraje existente: v2v permite reescribir un clip conservando su estructura, con el VAE de Wan2.1 codificando el video original como `context_latents`.
- Prototipado de storyboards en t2v: generar clips cortos para validar encuadres y movimiento antes de rodar, ajustando CFG a 3 y pasos de 16, 23 o 50 con UniPC, DPMPP_2M o EULER.
- Animacion de fotografia de producto (i2v): convertir una imagen fija en un plano con movimiento para fichas de e-commerce o presentaciones, sin rodaje adicional.
- Iteracion local dentro de ComfyUI: el nodo personalizado se instala extrayendo el ZIP en `ComfyUI/custom_nodes` y el tipo de tarea se deduce de las conexiones, lo que facilita integrarlo en grafos ya existentes de Wan2.2.
- Restauracion o remasterizacion asistida: combinando `source_video` con referencias se puede rehacer una secuencia con un aspecto objetivo distinto manteniendo la accion original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio de pesos ocupa 227,1 GB, aunque no es necesario descargarlo entero: los DiT se distribuyen en NVFP4 y FP8 scaled, el planner MLLM en FP8 scaled, el T5 en fp8_e4m3fn_scaled y el VAE en fp32.
- Segun la ficha del nodo BerniniV2Plan en comfy.icu, con una tarjeta de 24 GB conviene empezar con flujos de prueba de 640 pixeles de lado largo antes de subir a 720p.
- El mismo aviso indica que el planner es un Qwen multimodal de miles de millones de parametros, que la primera ejecucion carga muchos pesos y que el offload es independiente pero no gratuito en cuanto a memoria.
- No hay datos publicados de latencia ni de throughput.
- GPU recomendadas: no disponible de forma explicita; por los avisos anteriores, 24 GB de VRAM es el minimo practico citado y 720p requiere mas margen.
- Cabe en GPU de consumo si se dispone de ~24 GB (categoria RTX 3090 / RTX 4090), con las reservas de resolucion indicadas.
- Opciones de despliegue: nodo personalizado de ComfyUI incluido en el repositorio, y la implementacion nativa del repositorio T8mars/comfyui-bernini-v2-T8, que usa las APIs de carga de modelos, gestion de memoria, conditioning y sampling de ComfyUI.
- No se documenta soporte para vLLM, TGI o llama.cpp, ya que no es un modelo de texto autoregresivo al uso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chfm/Bernini-v2-ComfyUI | Paquete de pesos single-file para ComfyUI del pipeline Bernini v2 | no disponible | no disponible | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| chfm/Bernini-R-GGUF-ComfyUI | Paquete GGUF para ComfyUI del renderizador Bernini-R | no disponible | no disponible | no disponible en la informacion | HuggingFace, con cuantizacion GGUF |
| ByteDance/Bernini-Diffusers-v2 | Modelo base en formato Diffusers | no disponible | no disponible | no disponible en la informacion | HuggingFace (repo referenciado como base) |
| Wan2.2 | Familia de DiT de generacion de video usada como motor de renderizado | no disponible | no disponible | no disponible en la informacion | Pesos reempaquetados por Comfy-Org |

La diferencia funcional documentada entre Bernini v2 y Bernini-R es que v2 incorpora la planificacion semantica con `diff_mllm_contexts`, mientras que Bernini-R solo cubre el renderizado.

## Limitaciones y advertencias

- No hay resultados de benchmarks, evaluaciones humanas ni comparativas publicadas para este paquete concreto.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre la calidad de la conversion.
- Los enlaces de descarga de la model card apuntan al usuario rzgar, no a chfm, lo que conviene verificar antes de usar los ficheros.
- El tamaño del repositorio (227,1 GB) implica requisitos de almacenamiento y de ancho de banda considerables.
- El T5 y el VAE se toman de repositorios de terceros (Comfy-Org y una coleccion de VAEs), por lo que la reproducibilidad depende de esos enlaces externos.
- No se declaran idiomas soportados, de modo que el comportamiento con prompts en castellano no esta documentado.
- Al tratarse de un modelo de difusion de video, existe riesgo de artefactos visuales, incoherencia temporal y desviacion respecto al prompt, agravado porque el planificador semantico puede producir `diff_mllm_contexts` incorrectos si interpreta mal los medios de origen.
- No se documentan sesgos especificos, aunque al derivar de un MLLM y de datos de video a gran escala cabe esperar sesgos de representacion no medidos.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero se ofrece sin garantias; hay que comprobar por separado las licencias de los componentes de terceros (T5, VAE, Wan2.2).
- Los avisos de memoria indican que en tarjetas de 24 GB hay que limitar la resolucion, lo que afecta a la viabilidad en produccion.
- La fecha de creacion del repositorio (2026-10-12) y la de actualizacion son identicas, lo que sugiere que no ha habido mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chfm/Bernini-v2-ComfyUI
- Modelo base: https://huggingface.co/ByteDance/Bernini-Diffusers-v2
- Repositorio Bernini-R GGUF ComfyUI del mismo autor: https://huggingface.co/chfm/Bernini-R-GGUF-ComfyUI/blob/main/README.md
- Implementacion nativa en ComfyUI (T8mars): https://github.com/T8mars/comfyui-bernini-v2-T8/tree/main/
- Nodo Bernini v2 Plan en ComfyUI Cloud: https://comfy.icu/node/BerniniV2Plan
- Ficha indexada de Bernini-V2-Comfy: https://essamamdani.com/ai-models/hf-t8star-bernini-v2-comfy
- Nota sobre disponibilidad del modelo y su integracion en ComfyUI: https://happyin.space/projects/bernini/
- Pesos NVFP4 de los DiT high-noise y low-noise: https://huggingface.co/rzgar/Bernini-v2-ComfyUI/tree/main/Bernini_v2_NVFP4
- Text encoder T5 UMT5-XXL (Comfy-Org): https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/tree/main/split_files/text_encoders
- VAE Wan2.1 fp32: https://huggingface.co/rzgar/Qwen-Image-WAN2.2-VAE-Collection/blob/main/Vanilla/Wan2_1_VAE_fp32.safetensors
