# sandpies/ComfyUI-H3-Video-Upsampler

## Resumen

H3 Video Upsampler es un nodo personalizado para ComfyUI, publicado por el usuario sandpies, que permite reescalar y regenerar vídeos ya generados con MiniMax H3 (o cualquier otro vídeo) para aumentar su resolución y nitidez. No se trata de un modelo de lenguaje ni de un modelo fundacional autónomo, sino de un pipeline de inferencia que combina el modelo de difusión MiniMax H3 (en su variante pruned int8), varios VAE, un upscaler latente 3D y una LoRA específica denominada Regen2K. El objetivo es mejorar la calidad final de clips ya producidos sin alterar la identidad facial, el movimiento, la sincronización labial ni la pista de audio original.

El proyecto se apoya en el ecosistema ComfyUI y en el modelo base Comfy-Org/MiniMax-H3, un modelo de generación de vídeo con audio. La propuesta del autor es práctica: ofrece dos modos de funcionamiento (`regen2k`, más rápido, y `ic`, más fiel al clip original), flujos de trabajo de ejemplo y una integración por nodos que gestiona memoria de forma incremental para vídeos largos. La relevancia actual radica en que el upscaling de vídeo generado por IA es una necesidad creciente en producción, y este paquete lo resuelve dentro de ComfyUI sin salir del ecosistema.

El repositorio ocupa 4,4 GB y contiene la LoRA Regen2K en formato bf16, junto con los flujos de ejemplo. El modelo base no se redistribuye aquí: el usuario debe descargarlo por separado desde Comfy-Org. La licencia se declara como "other" con la etiqueta `see-third-party-notices`, lo que obliga a revisar los avisos de terceros antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion sobre MiniMax H3 (modelo de video con audio) + upscaler latente 3D convolucional + LoRA |
| Parametros totales | no disponible (el modelo base se distribuye como `minimax_h3_fl2va_pruned_int8_convrot`, 21 GB, y `minimax_h3_ref2va_int8_convrot`, 34 GB, en int8) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa video por fragmentos con `chunking` y `tiling`) |
| Tipos de cuantizacion | int8 (modelo de difusion y VAE de video), fp32 (VAE de audio), bf16 (LoRA y upscaler latente), fp16 (VAE SOL opcional) |
| Idiomas soportados | no disponible |
| Licencia | other (`see-third-party-notices`) |
| Formato de pesos | safetensors (modelo de difusion, VAE, LoRA, upscaler latente) |

## Arquitectura y entrenamiento

El componente central es un pipeline de difusion que reutiliza el modelo MiniMax H3 para redibujar los fotogramas de entrada a mayor resolucion. Sobre ese modelo se aplica una LoRA propia, `open_h3_regenerate_2k_r256pp_bf16` (3,8 GB, rango 256), entrenada para la tarea de regeneracion a 2K. El proceso se completa con un upscaler latente 3D convolucional (`minimax_h3_latent_upscaler_3d_conv_v1_bf16`) que amplia la representacion latente antes del redibujado, y con dos VAE separados: uno para video (`minimax_h3_video_vae_int8_convrot`, 2,8 GB) y otro para audio (`minimax_h3_audio_vae_fp32`, 0,6 GB), lo que permite preservar la banda sonora original.

El modo `ic` sustituye el modelo por `minimax_h3_ref2va_int8_convrot` (34 GB) y anade una LoRA de referencia (`minimax_h3_open_regenerate_2k_ic_lora_avg_rank_21_bf16`, 0,2 GB) junto con HyperFlow de 8 pasos (`minimax_h3_hyperflow_8step_v1.0`, 2,8 GB), manteniendo los fotogramas originales como referencia durante el redibujado para conservar mejor rostros, bocas y rotulos. El autor no publica detalles sobre el dataset de entrenamiento de la LoRA, el numero de tokens ni si hubo RLHF o DPO; esa informacion no esta disponible. La innovacion practica es la gestion de memoria por fragmentos (`chunking`/`tiling`) y el redibujado automatico de rostros pequenos en segundo plano mediante OpenCV.

## Capacidades

- Reescalado y regeneracion de video a aproximadamente 1080p (ajustable mediante el parametro `megapixels`, con 2 como valor de referencia).
- Preservacion de la identidad facial, el movimiento, la sincronizacion labial y la pista de audio del clip original.
- Dos modos de redibujado: `regen2k` (rapido, por defecto) e `ic` (mas fiel, aproximadamente 1,7 veces mas lento).
- Redibujado automatico de rostros pequenos en segundo plano en modo `regen2k`.
- Condicionamiento textual opcional para describir el estilo visual (por ejemplo, "2D anime, flat cel shading").
- Procesamiento de video por archivo (`file to file`) o por fotogramas, para integrarse en flujos mas amplios.
- Carga de video desde ruta local sin limite de tamano de subida.
- Guardado de videos largos sin llenar la memoria, con opcion de duplicar la tasa de fotogramas en tarjetas RTX (`frame_gen`).
- Ajuste automatico de parametros internos segun la tarjeta grafica disponible.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue, ya que no es un modelo de lenguaje.

## Casos de uso

- Postproduccion de clips generados con MiniMax H3: el nodo toma el MP4 de salida y lo regenera a 1080p conservando audio y sincronizacion labial, lo que evita regenerar el clip desde cero.
- Restauracion de material de archivo de baja resolucion: el modo `ic` mantiene los fotogramas originales como referencia, util para preservar rostros y rotulos en metraje historico o grabaciones de movil.
- Flujos de trabajo con animacion 2D: el parametro `conditioning` permite indicar el estilo (por ejemplo, cel shading plano) para evitar que el redibujado anada lineas no deseadas.
- Integracion en pipelines de ComfyUI existentes: el nodo de fotogramas a fotogramas permite encadenar el upscaler con otros nodos de generacion, edicion o composicion.
- Procesamiento por lotes de videos largos: el nodo `file to file` mantiene bajo el consumo de memoria independientemente de la duracion, adecuado para catalogos o series de clips.
- Conversion de 24 a 48 fps: con `frame_rate` en 24 (nativo de H3) y `frame_gen` en x2 se duplica la tasa de fotogramas con la mitad del trabajo y sincronizacion labial exacta.
- Mejora de material para redes sociales o publicacion web: el ajuste `megapixels` permite fijar el tamano de salida segun el destino final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente aporta comparaciones cualitativas internas: el modo `ic` es aproximadamente 1,7 veces mas lento que `regen2k`; `redraw_steps` a 2 es un tercio mas rapido que a 3 con resultados similares en sus pruebas; y el VAE SOL opcional reduce el tiempo de ejecucion en torno a un 20 %.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo de difusion pruned int8 ocupa 21 GB en disco y el modo `ic` requiere 34 GB, por lo que se recomienda al menos 24 GB de VRAM para `regen2k` y 40 GB o mas para `ic`.
- GPU recomendadas: no disponibles en la informacion; el autor menciona tarjetas RTX para la funcion `frame_gen` y ajuste automatico de parametros segun la GPU.
- Compatibilidad con GPU de consumo: no confirmada; los tamanos de los pesos sugieren que solo las RTX de gama alta (24 GB o mas) podrian ejecutar el modo `regen2k`.
- Despliegue: exclusivamente mediante ComfyUI v0.38.0 o superior, con el nodo personalizado instalado en `ComfyUI/custom_nodes`. Se recomienda ComfyUI-KJNodes para reducir memoria y habilitar atencion dispersa.
- Latencia y throughput: no disponibles; solo se documentan relaciones relativas entre modos y pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3 Video Upsampler (sandpies) | Nodo ComfyUI + LoRA sobre MiniMax H3 | no disponible (LoRA 3,8 GB; base int8 21-34 GB) | no disponible | other (`see-third-party-notices`) | Hugging Face + GitHub |
| MiniMax H3 (Comfy-Org) | Modelo base de video con audio | no disponible | no disponible | no disponible | Hugging Face |
| Upscalers genericos de video (por ejemplo, Real-ESRGAN) | Red de superresolucion | no disponible | no disponible | normalmente permisiva | Amplia |
| Topaz Video AI | Producto comercial de upscaling | no disponible | no disponible | propietaria | Comercial |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; las diferencias principales son el enfoque de regeneracion por difusion (frente a superresolucion clasica) y la dependencia del ecosistema ComfyUI y del modelo MiniMax H3.

## Limitaciones y advertencias

- La licencia es "other" con aviso `see-third-party-notices`; es obligatorio revisar los avisos de terceros (modelo base, LoRA, upscaler latente, HyperFlow) antes de cualquier uso comercial.
- El paquete no incluye el modelo base: requiere descargar por separado los pesos de Comfy-Org/MiniMax-H3 y de otros repositorios, con un coste de almacenamiento de decenas de GB.
- Depende de ComfyUI v0.38.0 o superior y, para rendimiento optimo, de ComfyUI-KJNodes actualizado; versiones antiguas desactivan la atencion dispersa y ralentizan la ejecucion.
- El modo `ic` es aproximadamente 1,7 veces mas lento y exige un modelo de 34 GB, lo que puede exceder la VRAM de muchas GPU.
- Con `redraw_start` alto (0,8) los rostros pueden cambiar; el autor recomienda 0,6 para mantener la identidad.
- En animacion puede aparecer lineas adicionales si no se proporciona un `conditioning` descriptivo.
- No se documentan sesgos, riesgos de alucinacion visual ni limitaciones de idioma; esa informacion no esta disponible.
- El repositorio tiene 0 descargas en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/sandpies/ComfyUI-H3-Video-Upsampler
- Codigo fuente: https://github.com/sandpies/ComfyUI-H3-Video-Upsampler
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Upscaler latente (LBH-123-AI): https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- LoRA IC (Kijai): https://huggingface.co/Kijai/MiniMax-H3-experimental
- HyperFlow (videorebirth): https://huggingface.co/videorebirth/hyperflow
- LoRA LMS (Alissonerdx): https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI
- ComfyUI-KJNodes: https://github.com/kijai/ComfyUI-KJNodes
- ComfyUI-Hand-Tie-Clips: https://github.com/sandpies/ComfyUI-Hand-Tie-Clips
