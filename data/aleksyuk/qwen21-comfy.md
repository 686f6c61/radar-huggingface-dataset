# aleksyuk/qwen21-comfy

## Resumen

`aleksyuk/qwen21-comfy` no es un modelo entrenado por el autor, sino un espejo (mirror) que reúne copias sin modificar de varios modelos distribuidos en la estructura de carpetas `models/` de ComfyUI. El objetivo es empaquetar todo el conjunto como un único repositorio de Hugging Face, de modo que pueda usarse como modelo cacheado en endpoints serverless (por ejemplo, Runpod). El repositorio ocupa 72,8 GB y fue publicado el 15 de octubre de 2026.

El bundle agrupa cuatro componentes principales: Qwen-Image 2.1 en variantes full y Turbo (generación y edición de imagen), SeedVR2 7B (realescalado/upscaling de vídeo o imagen), Qwen3-VL-8B-Instruct como text encoder con torre de visión, y Qwen3.8-27B como modelo de escritura de prompts. Todos los archivos proceden de repositorios oficiales de Comfy-Org y de los autores originales (Qwen, ByteDance-Seed).

La relevancia de este repositorio es práctica: simplifica el despliegue de un pipeline completo de generación y edición de imagen en ComfyUI con un solo `git clone` o una sola referencia de modelo. No aporta pesos nuevos ni modificaciones, y las licencias originales se mantienen, con la salvedad importante de que los pesos de Qwen-Image 2.1 están bajo Qwen Research License, que no permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixta: difusion (Qwen-Image 2.1), transformer de upscaling (SeedVR2 7B), transformer multimodal (Qwen3-VL-8B, Qwen3.8-27B) |
| Parametros totales | No aplica como modelo unico; componentes de 7B, 8B y 27B aproximadamente |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16, fp16, int8 (convrot), w4a8 (Qwen3.8-27B) |
| Idiomas soportados | No disponible |
| Licencia | other / see-original-repositories (Qwen Research License para Qwen-Image 2.1; Apache 2.0 para SeedVR2, Qwen3-VL-8B y Qwen3.8-27B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio: es un conjunto de pesos ya entrenados por terceros, reorganizados en la jerarquia de carpetas que espera ComfyUI (`diffusion_models/`, `text_encoders/`, `vae/`). Los componentes son:

- `diffusion_models/qwen_image_2.1_bf16.safetensors` (14,2 GB) y `diffusion_models/qwen_image_2.1_turbo_bf16.safetensors` (14,2 GB): modelos de difusion de Qwen-Image 2.1 y su variante Turbo, orientados a generacion y edicion de imagen. La variante Turbo esta disenada para 8 pasos de denoising con CFG 1 y un schedule de sigmas especifico.
- `diffusion_models/seedvr2_7b_fp16.safetensors` (16,5 GB) y `vae/seedvr2_ema_vae_fp16.safetensors` (0,5 GB): modelo SeedVR2 7B de ByteDance-Seed, con su VAE EMA, para tareas de upscaling.
- `text_encoders/qwen3vl_8b_int8_convrot.safetensors` (9,4 GB): Qwen3-VL-8B-Instruct cuantizado a int8, usado como text encoder con torre de vision.
- `text_encoders/qwen3.8_27b_w4a8.safetensors` (17,3 GB): Qwen3.8-27B cuantizado a w4a8, empleado para la escritura o mejora de prompts.

No se documenta informacion sobre datasets de entrenamiento, numero de tokens, tecnicas de alineacion (RLHF/DPO) ni innovaciones especificas dentro de este repositorio, ya que el autor no ha modificado ningun archivo.

## Capacidades

- Generacion de imagen a partir de texto mediante Qwen-Image 2.1 (full y Turbo).
- Edicion de imagen guiada por prompt.
- Ejecucion acelerada en 8 pasos de denoising con la variante Turbo a CFG 1.
- Upscaling y realces de resolucion con SeedVR2 7B.
- Codificacion de texto con torre de vision gracias a Qwen3-VL-8B-Instruct (int8).
- Generacion y mejora de prompts mediante Qwen3.8-27B (w4a8).
- Integracion directa con ComfyUI al respetar su estructura de carpetas.
- Uso como modelo cacheado en endpoints serverless (Runpod y similares).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue serverless de un pipeline completo de imagen: al empaquetar difusion, VAE, text encoder y upscaler en un solo repositorio, se puede cachear una unica referencia en un endpoint Runpod Serverless y arrancar workflows de ComfyUI sin descargar multiples repos.
- Generacion rapida de imagenes en produccion: la variante Turbo permite obtener imagenes en 8 pasos, lo que reduce coste por inferencia en comparacion con la version full.
- Edicion de imagenes asistida por prompt: usar Qwen-Image 2.1 full cuando se requiere mas calidad y Turbo cuando prima la latencia.
- Mejora automatica de prompts: emplear Qwen3.8-27B w4a8 como generador de prompts enriquecidos antes de pasarlos al modelo de difusion.
- Upscaling de resultados: encadenar la salida de Qwen-Image 2.1 con SeedVR2 7B para obtener resoluciones mayores.
- Prototipado en entornos con VRAM limitada: los pesos cuantizados (int8 y w4a8) de los text encoders reducen el consumo frente a versiones en bf16.
- Reproduccion de workflows de la comunidad: al replicar exactamente las rutas y nombres de archivo que esperan los workflows publicos de ComfyUI, se facilita la reproducibilidad.
- Pipelines de investigacion en vision-lenguaje: el text encoder Qwen3-VL-8B mantiene la torre de vision, lo que permite experimentar con prompts multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el conjunto completo ocupa 72,8 GB en disco; cargar simultaneamente difusion bf16 (14,2 GB) + VAE (0,7 GB) + text encoder int8 (9,4 GB) + upscaler (16,5 GB) supera con holgura los 40 GB de VRAM si todo esta activo a la vez.
- GPU recomendadas: A100 80 GB, H100 80 GB para cargar el pipeline completo sin offloading; RTX 4090 24 GB puede ejecutar Qwen-Image 2.1 con offloading de modulos y cuantizaciones.
- Cabe en GPU de consumo: si, de forma parcial. La variante Turbo bf16 (14,2 GB) mas el text encoder int8 (9,4 GB) es ajustado en 24 GB; con offloading a RAM o cuantizacion adicional es viable en RTX 3090/4090.
- Opciones de despliegue: ComfyUI (nativo, al estar en su estructura de carpetas), ComfyUI-GGUF si se convierten pesos, Runpod Serverless como modelo cacheado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. La variante Turbo esta disenada para reducir el numero de pasos a 8, lo que implica menor latencia que la version full, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparativas con otros bundles de ComfyUI ni con modelos de generacion de imagen alternativos (FLUX, SDXL, etc.) con datos medibles.

## Limitaciones y advertencias

- No es un modelo unico ni entrenado por el autor: es un mirror de pesos de terceros; cualquier problema de calidad, sesgo o rendimiento proviene de los modelos originales.
- Licencia de Qwen-Image 2.1: Qwen Research License, que no permite uso comercial. Esto afecta tanto a la variante full como a la Turbo y al VAE asociado.
- Licencias mixtas: SeedVR2, Qwen3-VL-8B y Qwen3.8-27B estan bajo Apache 2.0, pero el conjunto hereda la restriccion mas severa si se usa todo el pipeline.
- Riesgo de alucinacion y sesgos: no documentado en este repositorio; debe consultarse la documentacion de cada modelo original.
- Compatibilidad: los nombres y rutas de archivo estan pensados para ComfyUI; fuera de ese ecosistema pueden requerir renombrado o reempaquetado.
- Idiomas soportados: no disponible, aunque Qwen3-VL y Qwen3.8 suelen ser multilingues por diseno; debe verificarse en sus model cards originales.
- Contexto: no se especifica la ventana de contexto de los text encoders en este repositorio.
- Tamano: 72,8 GB de descarga; no apto para entornos con almacenamiento o ancho de banda limitados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aleksyuk/qwen21-comfy
- Comfy-Org/Qwen-Image-2.1: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Qwen/Qwen-Image-2.1-Turbo: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Qwen/Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Qwen/Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Comfy-Org/SeedVR2: https://huggingface.co/Comfy-Org/SeedVR2
- ByteDance-Seed/SeedVR2-7B: https://huggingface.co/ByteDance-Seed/SeedVR2-7B
- Comfy-Org/Qwen3.8-27B: https://huggingface.co/Comfy-Org/Qwen3.8-27B
- Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Qwen 2.1 Turbo (ComfyUI Cloud): https://comfy.icu/models/2993507/Qwen-2-1-Turbo-Official-Qwen-2-1-Turbo-Official
- Workflow Qwen-Image 2.1 Turbo (Civitai): https://civitai.com/models/2995369/qwen-image-21-turbo-8-steps-comfyui-workflow
- Noticia Qwen-Image-2.1-Turbo (ComfyUI Wiki): https://comfyui-wiki.com/en/news/2026-10-09-qwen-image-2-1-turbo
- ComfyUI Models Hub: https://comfy.org/hub/models/
