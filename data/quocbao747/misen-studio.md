# quocbao747/misen-studio

## Resumen

`quocbao747/misen-studio` no es un modelo de lenguaje en el sentido habitual, sino un repositorio de pesos de inferencia empaquetado para el servidor de Misen Studio, una aplicación de generación de imagen, vídeo y 3D construida sobre ComfyUI y otros runtimes. El repositorio agrupa 89 archivos (438 GB según la model card; 470,8 GB según el tamaño reportado del repo) con checkpoints de difusión, LoRAs, text encoders, VAEs, modelos de upscaling, motores TensorRT y pesos de reconocimiento facial, todos ellos de terceros.

El dato de 9.078.581.248 parámetros que aparece en las etiquetas de safetensors corresponde a un único tensor inspeccionado por Hugging Face, no al conjunto del repositorio, que contiene docenas de modelos independientes de distintos tamanos (desde LoRAs de 60 MB hasta checkpoints de difusión de 33 GB). No existe un pipeline declarado ni una arquitectura unificada: cada subcarpeta corresponde a un componente distinto del stack de Misen Studio.

Su relevancia es operativa, no investigadora: sirve para restaurar un entorno de inferencia reproducible mediante `huggingface-cli download quocbao747/misen-studio --local-dir ~/misen-runtime`. La licencia es mixta (`mixed-third-party`) y cada peso conserva su licencia original, con una mezcla de componentes no comerciales, de investigación y comunitarios, además de checkpoints capaces de generar contenido NSFW. No es un modelo para evaluar como LLM ni para integrar en pipelines de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica como modelo unico; conjunto heterogeneo de modelos de difusion (FLUX.2, Qwen-Image, SDXL, SeedVR2, Chroma), text encoders (T5-XXL, Qwen3-VL, Mistral 3 Small, Qwen2.5-VL), VAE, LoRAs y motores TensorRT |
| Parametros totales | No disponible como cifra unica; el tensor safetensors inspeccionado suma 9.078.581.248, pero el repo contiene multiples modelos independientes |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16, BF16, FP8 mixed, INT8 (SeedVR2 `int8_convrot`), GGUF Q8_0, TensorRT engines (sm89) |
| Idiomas soportados | No disponibles de forma explicita; los text encoders incluidos (T5-XXL, Qwen, Mistral) soportan multilingue, pero el autor no declara lista |
| Licencia | `mixed-third-party` (cada peso conserva su licencia original: FLUX.2-dev no comercial, MiniMax H3 Community License, Tencent Hunyuan Community License, InsightFace non-commercial research, CreativeML Open RAIL++-M para SDXL) |
| Formato de pesos | safetensors, GGUF, `.ckpt`, TensorRT `.engine` |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento propio: es una coleccion de artefactos de terceros organizados segun el layout `~/misen-runtime` que espera la aplicacion Misen Studio. La estructura se divide en tres bloques principales. `comfyui/` contiene el stack de generacion de imagen: checkpoints SDXL (RealVisXL V5.0, Juggernaut XL Ragnarok, Animagine XL 4.0, CyberRealistic Pony, WAI Illustrious), modelos de difusion FLUX.2 (dev fp8mixed de 33 GB, klein 9B en GGUF Q8_0), Qwen-Image 2.1 y Qwen-Image-Edit 2511, text encoders (T5-XXL fp8, Qwen3 8B, Qwen3-VL 8B, Qwen2.5-VL 7B, Mistral 3 Small), VAEs y upscalers (4x-UltraSharpV2, 4xNomos2).

`h3/` agrupa los componentes de video y audio: modelos de difusion (98,1 GB), LoRAs, text encoders, VAE, SeedVR2 para restauracion/upscaling de video (3B y 7B, en fp16 e int8) y VibeVoice (5,0 GB) para sintesis de voz. `cache/` incluye motores TensorRT precompilados para `sm89` (RTX 40xx) usados por DeepCam y un checkpoint de reconocimiento de voz Nemotron extraido (2,38 GB). `comfyui-3d/` aporta pesos para generacion 3D, presumiblemente Hunyuan3D segun la licencia citada.

No hay innovaciones arquitectonicas propias ni datos de entrenamiento publicados. La "innovacion" practica es el empaquetado: un unico repo con todos los pesos en el layout exacto que el servidor de inferencia espera, incluyendo alias entre rutas (`h3/models/seedvr2/ema_vae_fp16.safetensors` apunta al mismo archivo que `comfyui/models/vae/seedvr2_ema_vae_fp16.safetensors`).

## Capacidades

- Generacion de imagen texto-a-imagen con SDXL, FLUX.2, Qwen-Image y Chroma, incluyendo estilos fotografico, anime e ilustracion.
- Edicion de imagen guiada por instrucciones con Qwen-Image-Edit 2511 y LoRAs de 4-8 pasos para inferencia acelerada.
- Generacion y edicion de video mediante los modelos del bloque `h3/` (98,1 GB de pesos de difusion).
- Restauracion y upscaling de video con SeedVR2 3B y 7B en variantes fp16 e int8.
- Generacion 3D a partir de los pesos de `comfyui-3d/` (6,9 GB de modelos y 0,1 GB de checkpoint).
- Sintesis de voz con VibeVoice y transcripcion con el checkpoint Nemotron extraido.
- Deteccion y analisis facial con DeepCam (motores TensorRT para sm89).
- Control fino de estilo mediante 20 LoRAs (film stills, grano, consistencia anime, estetica fotografica, estilos de cartas, etc.).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto conversacional: no es un LLM.

## Casos de uso

- Restauracion de un entorno de inferencia reproducible: descargar el repo con `hf download` en `~/misen-runtime` y arrancar Misen Studio siguiendo `docs/inference-infrastructure.md`, evitando resolver manualmente decenas de dependencias entre checkpoints, VAEs y text encoders.
- Pipeline de generacion de imagen por lotes para marketing: usar FLUX.2-dev o Qwen-Image 2.1 con los LoRAs de estetica fotografica incluidos para producir variantes de un mismo brief con estilos consistentes, aprovechando los LoRAs de 4-8 pasos para reducir latencia.
- Edicion y retoque fotografico asistido: Qwen-Image-Edit 2511 permite modificar imagenes existentes por instruccion, util para catalogo de producto o correccion de fondos sin reentrenar.
- Postproduccion de video: SeedVR2 7B en int8 (`seedvr2_7b_int8_convrot.safetensors`, 7,76 GB) permite upscaling y restauracion en GPUs con VRAM limitada, al reducir el peso a menos de la mitad del fp16.
- Generacion de assets 3D para prototipado: los pesos de `comfyui-3d/` permiten producir mallas a partir de imagenes o texto dentro del mismo stack, sin salir de ComfyUI.
- Doblaje y transcripcion de contenido audiovisual: combinar VibeVoice (TTS) con el checkpoint Nemotron de `cache/stt/` para generar narraciones o subtitulos sobre los videos generados.
- Aceleracion en produccion con TensorRT: los motores precompilados `sm89` de DeepCam permiten desplegar deteccion facial con latencia reducida en RTX 40xx sin recompilar.
- Investigacion en modelos generativos: comparar salidas de SDXL, FLUX.2 y Qwen-Image bajo los mismos prompts y LoRAs, con todos los pesos en un solo checkout.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de FID, CLIP score, throughput ni latencia para ningun componente.

## Requisitos de hardware

- VRAM: el repo completo no cabe en ninguna GPU consumer (438 GB en disco). Cada componente se carga por separado; los pesos mayores son `flux2_dev_fp8mixed.safetensors` (33,02 GB) y los checkpoints de difusion de `h3/` (98,1 GB en total, varios modelos).
- Para FLUX.2-dev en fp8 mixed se necesita una GPU de 40-48 GB (A100 40GB, L40S, A6000) o descargar la variante GGUF Q8_0 de 9,29 GB para GPUs de 12-16 GB.
- SDXL checkpoints (6,46 GB cada uno) caben en RTX 3060 12 GB, RTX 4070, RTX 4090; con text encoders T5-XXL fp8 (4,80 GB) adicionales se recomienda 16-24 GB.
- SeedVR2 7B int8 (7,76 GB) es viable en RTX 4070 Ti / 4080; la variante fp16 requiere 16 GB o mas.
- Los motores TensorRT incluidos estan compilados para `sm89`, es decir, exclusivamente Ada Lovelace (RTX 40xx y L40/L4). En Ampere o Hopper habria que recompilar.
- Despliegue: Misen Studio orquesta ComfyUI como backend principal; tambien se pueden cargar los pesos directamente en ComfyUI, Diffusers o llama.cpp (para los GGUF). No hay soporte documentado para vLLM ni TGI porque no son modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No existe un modelo comparable directo: este repositorio no es un modelo, es un bundle de pesos. Como referencia de bundles alternativos:

| Alternativa | Contenido | Licencia | Disponibilidad |
|---|---|---|---|
| `quocbao747/misen-studio` | 89 archivos, 438 GB, stack completo ComfyUI + H3 + 3D + STT/TTS | Mixta de terceros | Hugging Face |
| Repos oficiales de FLUX.2 (BFL) | Solo pesos FLUX.2 | FLUX.2-dev no comercial | Hugging Face / BFL |
| Repos oficiales de Qwen-Image | Solo pesos Qwen-Image y Edit | Apache 2.0 (segun release de Alibaba) | Hugging Face |
| Checkpoints SDXL individuales | Un unico checkpoint | CreativeML Open RAIL++-M | Civitai / Hugging Face |

La ventaja del bundle es la integracion y el layout listo para `~/misen-runtime`; la desventaja es la opacidad sobre versiones exactas y la mezcla de licencias.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier evaluacion como LLM es un error de categoria.
- La cifra de 9.078.581.248 parametros corresponde a un unico tensor safetensors inspeccionado, no al conjunto; no debe citarse como tamano del modelo.
- Licencia mixta: FLUX.2-dev es no comercial, InsightFace es solo para investigacion, MiniMax H3 y Tencent Hunyuan tienen licencias comunitarias con restricciones. El uso comercial requiere revisar cada licencia por separado; los archivos estan en `h3/models/licenses/`.
- Algunos checkpoints son capaces de generar contenido NSFW (etiqueta `not-for-all-audiences`, LoRAs como `NSFW_Qwen_Lora_v1`, checkpoints como `lustify_zenith_v9`). Requiere moderacion y cumplimiento normativo en produccion.
- Riesgo de alucinacion visual: los modelos de difusion pueden generar anatomia incorrecta, texto ilegible en imagenes y artefactos en manos y rostros; no hay garantia de fidelidad al prompt.
- Idiomas no declarados: la cobertura multilingue depende del text encoder usado; no hay evaluacion publicada.
- Los motores TensorRT estan atados a `sm89`; en otras arquitecturas hay que recompilar y el rendimiento puede degradarse.
- El repo ocupa 438-470 GB en disco; el download es costoso y no hay versiones parciales documentadas mas alla de descargar subcarpetas con `--include`.
- Sin benchmarks, sin model card tecnica y sin pipeline declarado: la evaluacion de calidad debe hacerse empiricamente.
- Fecha de creacion futura (2026-11-24) en los metadatos de Hugging Face; conviene verificar la integridad de los archivos tras la descarga.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/quocbao747/misen-studio
- Repositorio de la aplicacion Misen Studio: https://github.com/baonq-me/misen-studio
- Documentacion de infraestructura de inferencia (referenciada en la model card): `docs/inference-infrastructure.md` dentro del repo de GitHub
- ComfyUI (backend de inferencia): https://github.com/comfyanonymous/ComfyUI
- FLUX.2 (Black Forest Labs): https://huggingface.co/black-forest-labs
- Qwen-Image (Alibaba): https://huggingface.co/Qwen
- SeedVR2: https://huggingface.co/ByteDance-Seed
- InsightFace: https://github.com/deepinsight/insightface
- Hunyuan3D (Tencent): https://huggingface.co/tencent
