# ARSADR/mickmumpitz-h3-filmmaking

## Resumen

`ARSADR/mickmumpitz-h3-filmmaking` no es un modelo de pesos en sentido estricto, sino un repositorio indice que empaqueta la suite de workflows de ComfyUI del creador Mickmumpitz para la pipeline local de produccion de anime `SHIBUWAKA`, construida sobre el modelo de generacion de video MiniMax H3. El repositorio proporciona siete workflows JSON (character sheet, imagen, turnaround, voz, video, upscale y upscale RTX4K) y una tabla de enlaces directos a los pesos upstream alojados en `Comfy-Org/MiniMax-H3`, de modo que el usuario no necesita re-descargar duplicados.

La relevancia de esta ficha radica en que documenta el ecosistema practico de MiniMax H3 en ComfyUI: un modelo de difusion para video con modulos separados de text encoder (Qwen3-VL 32B cuantizado en NVFP4), VAE de video en FP16 y VAE de audio en FP32, ademas de un ControlNet Union 2.0, LoRAs de turbo y orbita 360 grados, y un upscaler Real-ESRGAN. El repositorio en si no aporta pesos propios ni datos de entrenamiento; su valor es la orquestacion reproducible de la pipeline.

No se dispone de informacion sobre parametros totales, longitud de contexto, licencia o idiomas en la model card proporcionada. Cualquier dato de arquitectura del modelo subyacente (MiniMax H3) debe consultarse en el repositorio oficial de Comfy-Org, no en este indice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pipeline de difusion para video (modelo MiniMax H3) con text encoder Qwen3-VL 32B, VAE de video y VAE de audio; orquestada mediante workflows de ComfyUI |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (diffusion model pruned), NVFP4 AWQ (text encoder), FP16 (VAE video), FP32 (VAE audio), LoRA pruned |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (diffusion model, text encoder, VAEs, ControlNet, LoRAs); `.pth` para RealESRGAN_x2 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de MiniMax H3 ni su proceso de entrenamiento. Lo que si describe es la composicion del pipeline de inferencia: un modelo de difusion principal (`minimax_h3_ref2va_pruned_int8_convrot.safetensors`) en INT8 podado, un text encoder basado en Qwen3-VL 32B cuantizado en NVFP4 AWQ, un VAE de video en FP16 y un VAE de audio en FP32, lo que indica que la pipeline genera video y audio de forma conjunta. Se incluye ademas un ControlNet Union 2.0 (`minimax_h3_fun_controlnet_union_2.0_pruned_int8_convrot.safetensors`) para control estructural, una LoRA turbo (`minimax_h3_turbo_v4_step600_ema_pruned_comfyui.safetensors`) orientada a reducir pasos de muestreo y una LoRA de orbita 360 grados (`minimax_h3_flf2v_lora_v1.safetensors`) para generar tomas orbitales.

No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas especificas del modelo subyacente. El sufijo `convrot` en los nombres de fichero sugiere algun tipo de transformacion convolucional/rotacional aplicada durante el pruning, pero la model card no lo explica.

## Capacidades

- Generacion de video a partir de texto e imagen (el nombre `ref2va` sugiere referencia a video/audio).
- Generacion de audio asociada al video (presencia de VAE de audio en FP32).
- Control estructural mediante ControlNet Union 2.0.
- Generacion de hojas de personaje (character sheet) y turnaround de personajes para produccion de anime.
- Generacion de voz (workflow `VOICE`).
- Upscaling de video, incluyendo una variante especifica para RTX4K.
- Generacion de tomas orbitales de 360 grados mediante LoRA dedicada.
- Aceleracion de muestreo mediante LoRA turbo (step600 EMA).
- Integracion en ComfyUI mediante workflows JSON versionados.

## Casos de uso

- Preproduccion de anime: el workflow `CHARACTER-SHEET` permite generar hojas de personaje consistentes a partir de descripciones, sirviendo como referencia visual para el resto de la pipeline.
- Turnaround de personajes: el workflow `TURNAROUND` genera vistas ortogonales del personaje, utiles para modelado 3D o para mantener consistencia entre planos.
- Storyboard a video: el workflow `VIDEO` convierte imagenes de referencia en clips animados, adecuado para prototipado rapido de secuencias.
- Doblaje y locucion: el workflow `VOICE` genera pistas de voz que se integran en el montaje final junto con el audio generado por el VAE.
- Postproduccion y masterizacion: los workflows `UPSCALE` y `UPSCALE-RTX4K` permiten escalar el material generado a resolucion de entrega, con una variante optimizada para GPUs RTX.
- Tomas de orbita para presentacion de personajes: la LoRA de 360 grados permite generar rotaciones completas alrededor de un personaje, utiles para fichas de presentacion o menus.
- Control de composicion: el ControlNet Union 2.0 permite imponer poses, profundidad o bordes sobre la generacion, util para mantener continuidad entre planos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card. La presencia de un text encoder Qwen3-VL 32B en NVFP4 y un modelo de difusion INT8 sugiere requisitos elevados, pero no se aportan cifras.
- GPU recomendadas: no disponible. La existencia de un workflow `UPSCALE-RTX4K` sugiere soporte para GPUs de la familia RTX, pero no se especifica modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (con custom nodes `ComfyUI-KJNodes`, `rgthree-comfy`, `ComfyUI-Mickmumpitz-Nodes` y `Comfyui-MMH3-UltimateUpscale`). Se menciona una receta `comfyform` para Colab G4 en el fichero `mickmumpitz-h3-filmmaking.yaml`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otros modelos de generacion de video ni con otras pipelines de ComfyUI.

## Limitaciones y advertencias

- El repositorio no contiene pesos propios: es un indice de workflows y enlaces externos. La disponibilidad del modelo depende de que los repositorios upstream (`Comfy-Org/MiniMax-H3`, `drbaph/MiniMax-H3-Turbo-Lora-ComfyUI`, `pablodawson/MiniMax-H3-360-Orbit-LoRA`, `ai-forever/Real-ESRGAN`) sigan accesibles.
- La licencia no esta declarada en la model card, por lo que no se puede confirmar el uso comercial de los workflows ni de los pesos enlazados. Debe verificarse en cada repositorio upstream.
- No se especifican idiomas soportados; la generacion de voz y texto puede estar limitada a los idiomas del text encoder Qwen3-VL, pero no se confirma.
- No hay informacion sobre sesgos, tasas de alucinacion visual o limitaciones de contexto.
- La pipeline depende de cuatro custom nodes externos, lo que introduce riesgo de rotura por cambios en sus APIs.
- El contenido generado (anime, personajes, voz) puede estar sujeto a derechos de autor y a las politicas de uso de los modelos upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ARSADR/mickmumpitz-h3-filmmaking
- Pesos upstream (Comfy-Org/MiniMax-H3): https://huggingface.co/Comfy-Org/MiniMax-H3
- Turbo LoRA (drbaph): https://huggingface.co/drbaph/MiniMax-H3-Turbo-Lora-ComfyUI
- 360 Orbit LoRA (pablodawson): https://huggingface.co/pablodawson/MiniMax-H3-360-Orbit-LoRA
- Real-ESRGAN (ai-forever): https://huggingface.co/ai-forever/Real-ESRGAN
- ComfyUI-KJNodes: https://github.com/kijai/ComfyUI-KJNodes
- rgthree-comfy: https://github.com/rgthree/rgthree-comfy
- ComfyUI-Mickmumpitz-Nodes: https://github.com/mickmumpitz/ComfyUI-Mickmumpitz-Nodes
- Comfyui-MMH3-UltimateUpscale: https://github.com/bbaudio-2025/Comfyui-MMH3-UltimateUpscale
