# AcademiaSD/FLUX.3-Image-Klein-NF4-for-LoRA-Training

## Resumen

FLUX.3 Image Klein NF4 for LoRA Training es una conversión cuantizada a 4 bits (NF4, mediante bitsandbytes) del transformer de FLUX.3 Image Klein Base, el modelo de generación y edición de imágenes de Black Forest Labs. La publica AcademiaSD, un proyecto independiente no afiliado a Black Forest Labs, con un objetivo muy concreto: que su entrenador de LoRAs (AcademiaSD LoRAlab Trainer Studio) pueda descargar el modelo y entrenar adaptadores LoRA en GPUs de consumo a partir de unos 8 GB de VRAM. No es, por tanto, un checkpoint de propósito general.

El repositorio no contiene un pipeline de inferencia estándar de diffusers, sino una caché pre-cuantizada por capas: el transformer de 5.5B parámetros se guarda en NF4 (3.1 GB) mientras que embedders, modulaciones, normas y capa de salida se mantienen en BF16. El text encoder (Qwen3-VL-4B-Instruct, 8.3 GB) y el VAE (autoencoder de FLUX.2, 0.3 GB) se incluyen sin modificar, sumando un total de 11.7 GB frente a los 20 GB del modelo original sin variantes FP8/NVFP4.

Su relevancia es práctica: reduce el coste de hardware para fine-tuning de FLUX.3 Klein a GPUs consumer (la model card cita mediciones en una RTX 5080) y exporta los LoRAs con los nombres de capa originales de Black Forest Labs, de modo que ComfyUI los carga directamente sobre los modelos oficiales. Para inferencia, el autor recomienda explícitamente usar los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (FLUX.3 Image Klein) con bloques mode y single; text encoder Qwen3-VL-4B-Instruct; VAE FLUX.2 |
| Parametros totales | 5.5B en el transformer (el repositorio completo incluye además el text encoder de 4B y el VAE) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (bitsandbytes) en las 258 capas de atención y MLP del transformer; BF16 en embedders, modulaciones, normas y capa de salida; text encoder y VAE en BF16 |
| Idiomas soportados | en |
| Licencia | flux-kommunity-license (FLUX Kommunity License; uso no comercial salvo Qualifying User). El text encoder Qwen3-VL-4B-Instruct está bajo Apache 2.0 |
| Formato de pesos | safetensors; transformer en caché pre-cuantizada por capas (un `.safetensors` por capa en `weights/` con peso NF4 y `QuantState` empaquetado, más `others.safetensors` en BF16 e `index.json`); text encoder y VAE en formato diffusers/transformers |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.3 Image Klein, un modelo de difusión para generación y edición de imágenes (pipeline image-to-image) de Black Forest Labs. El transformer consta de 258 capas de atención y MLP distribuidas en bloques mode y single, con un total de 5.5B parámetros. La codificación de texto corre a cargo de Qwen3-VL-4B-Instruct y la decodificación latente usa el autoencoder de FLUX.2. Esta ficha describe una conversión de pesos, no un reentrenamiento: no hay información sobre el dataset de entrenamiento original, el número de tokens, ni sobre etapas de RLHF/DPO en la información proporcionada.

La innovación técnica del repositorio es el formato de almacenamiento: el transformer no se sirve como checkpoint diffusers estándar, sino como caché pre-cuantizada en NF4 con un fichero safetensors por capa que incluye el peso de 4 bits y su `QuantState` de bitsandbytes. El entrenador construye un `Flux3Transformer2DModel` vacío a partir de `config.json` y lo rellena desde esa caché. El conversor que genera el formato es `tools/flux3klein/5_conversor_Flux3Klein_NF4.py` del repositorio del trainer. Los LoRAs resultantes se exportan con los nombres de capa originales de Black Forest Labs (`diffusion_model.<layer>.lora_A / lora_B` más `alpha`).

## Capacidades

- Entrenamiento de LoRAs sobre FLUX.3 Image Klein Base en GPUs de consumo, con un mínimo declarado de unos 8 GB de VRAM.
- Almacenamiento del transformer en NF4 con capas sensibles (embedders, modulaciones, normas, salida) en BF16 para preservar estabilidad del entrenamiento.
- Exportación de LoRAs compatibles con ComfyUI sobre los modelos oficiales de FLUX.3 Image Klein, gracias al uso de los nombres de capa originales.
- Incluye el text encoder Qwen3-VL-4B-Instruct completo, lo que permite el cómputo de embeddings de texto durante el entrenamiento sin dependencias externas.
- Incluye el VAE de FLUX.2 para la codificación de imágenes a espacio latente durante el entrenamiento.
- No soporta inferencia directa en diffusers ni ComfyUI: el transformer está en un formato de caché propio del trainer.
- No dispone de tool calling, function calling, agentes ni modo thinking: es un componente de entrenamiento de un modelo de imagen, no un LLM.
- Idiomas: únicamente inglés según los metadatos del repositorio.

## Casos de uso

- Fine-tuning de estilos personalizados en GPU consumer: un usuario con una RTX 5080 (16 GB) puede entrenar un LoRA de rango 16 a 1024² con unos 5.7 GB de VRAM y ~3.9 s por paso, según las mediciones del autor, sin necesidad de alquilar GPUs de datacenter.
- Entrenamiento de LoRAs de personajes o productos: el text encoder Qwen3-VL-4B incluido permite ajustar la asociación texto-imagen sobre un concepto concreto y exportar el adaptador para usarlo en ComfyUI con los pesos oficiales de FLUX.3 Klein.
- Prototipado rápido de adaptadores en investigación: la caché por capas permite cargar el transformer cuantizado en memoria reducida y experimentar con hiperparámetros (rango, learning rate, resolución) antes de lanzar entrenamientos mayores.
- Pipelines de CI/CD para arte generativo: el trainer descarga el repositorio automáticamente en el primer uso, lo que facilita integrar el entrenamiento de LoRAs en flujos automatizados con hardware modesto.
- Iteración sobre datasets pequeños en estaciones de trabajo con una sola GPU: con 512² a ~0.7 s por paso y ~4.2 GB de VRAM, es viable entrenar y evaluar múltiples variantes en una sesión.
- Formación y divulgación: al reducir la barrera de hardware, sirve para talleres y tutoriales sobre fine-tuning de modelos de difusión (el autor mantiene canal de YouTube y Discord).
- No es adecuado para servir inferencia en producción: para generar imágenes debe usarse el checkpoint original o la variante para ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible. Los únicos datos de rendimiento son mediciones de entrenamiento del autor en una RTX 5080 con rango 16:

| Resolucion | Tiempo por paso | VRAM |
|---|---:|---:|
| 512² | ~0.7 s | ~4.2 GB |
| 1024² | ~3.9 s | ~5.7 GB |

## Requisitos de hardware

- VRAM para entrenamiento: desde unos 8 GB según el autor; medido en ~4.2 GB a 512² y ~5.7 GB a 1024² con rango 16 en una RTX 5080.
- VRAM para inferencia: no aplica directamente, ya que el transformer no se carga en diffusers ni ComfyUI; para inferencia deben usarse los pesos originales de FLUX.3 Image Klein.
- GPU recomendadas: RTX 5080 (medición oficial del autor); por el perfil de VRAM, cualquier GPU consumer con 8 GB o más debería ser suficiente para entrenar, aunque no hay mediciones publicadas en otras tarjetas.
- GPUs de datacenter (A100, H100): compatibles en principio, pero no hay datos de throughput publicados para ellas.
- Cabe en GPU consumer: sí, ese es el objetivo del repositorio.
- Opciones de despliegue: exclusivamente AcademiaSD LoRAlab Trainer Studio (descarga automática en el primer uso). No es cargable en vLLM, llama.cpp, Ollama ni TGI (no es un LLM), ni directamente en diffusers o ComfyUI (formato de caché propio).
- Almacenamiento: 12.5 GB de repositorio (11.7 GB de pesos según la model card), frente a 20 GB del original sin variantes FP8/NVFP4.
- Latencia y throughput: ver tabla de benchmarks (solo entrenamiento).

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Formato | Uso previsto | VRAM de entrenamiento | Licencia |
|---|---|---|---|---|---|
| FLUX.3 Image Klein NF4 (este) | 5.5B, NF4 | Caché pre-cuantizada por capas | Entrenamiento de LoRAs | ~8 GB (desde) | FLUX Kommunity License |
| FLUX.3 Image Klein Base (original) | 5.5B, BF16 | Safetensors diffusers | Inferencia y entrenamiento completo | no disponible (20 GB de pesos) | FLUX Kommunity License |
| FLUX.3 Image Klein Comfy | no disponible | Safetensors para ComfyUI | Inferencia en ComfyUI | no aplica | FLUX Kommunity License |

No se dispone de datos de benchmarks que permitan comparar la calidad del modelo base frente a alternativas de otros fabricantes; la comparación se limita al formato, el uso previsto y los requisitos de hardware.

## Limitaciones y advertencias

- No es un checkpoint de propósito general: el transformer está en un formato de caché propio del trainer de AcademiaSD y no se carga directamente en diffusers ni ComfyUI.
- No debe usarse para inferencia: el autor recomienda los pesos originales de Black Forest Labs o la variante para ComfyUI.
- No es una release oficial de Black Forest Labs ni está respaldada ni validada por la compañía; los derechos del modelo pertenecen a Black Forest Labs Inc.
- Licencia FLUX Kommunity License: uso no comercial salvo que se sea Qualifying User según dicha licencia. Los LoRAs entrenados son derivados del modelo FLUX y quedan sujetos a la misma licencia.
- Idiomas: solo inglés según los metadatos; no hay información sobre rendimiento en otros idiomas.
- Riesgo de sesgos y alucinaciones del modelo base: no se documentan en la información proporcionada; al ser un modelo de imagen, los sesgos se manifestarían en la representación visual generada.
- Solo hay mediciones de rendimiento en una RTX 5080; el comportamiento en otras GPUs (especialmente con menos de 8 GB de VRAM) no está verificado.
- Se distribuye "as is", sin garantías de ningún tipo; AcademiaSD declina responsabilidad por daños derivados de su uso.
- El text encoder Qwen3-VL-4B-Instruct tiene licencia Apache 2.0, distinta de la del modelo principal; conviene revisar ambas al redistribuir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AcademiaSD/FLUX.3-Image-Klein-NF4-for-LoRA-Training
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Variante para ComfyUI: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Trainer (AcademiaSD LoRAlab Trainer Studio): https://github.com/AcademiaSD/AcademiaSD_LoRAlab-TrainerStudio
- Conversor NF4: `tools/flux3klein/5_conversor_Flux3Klein_NF4.py` en el repositorio del trainer
- YouTube: https://www.youtube.com/@Academia_SD
- Discord: https://discord.gg/Syuaduy678
- Ko-Fi: https://ko-fi.com/academiasd
