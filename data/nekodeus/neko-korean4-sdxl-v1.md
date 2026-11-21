# Nekodeus/neko-korean4-sdxl-v1

## Resumen

Neko-korean4-sdxl-v1 es un LoRA (Low-Rank Adaptation) de personaje para Stable Diffusion XL, desarrollado por el usuario Nekodeus bajo licencia Apache 2.0. No se trata de un modelo generativo completo, sino de un adaptador de bajo rango que se carga sobre `stabilityai/stable-diffusion-xl-base-1.0` para especializar la generación de imágenes en el rostro del actor surcoreano Lee Min-ho. El repositorio ocupa 0,2 GB y contiene los pesos del adaptador en formato safetensors junto con imágenes de muestra del conjunto de entrenamiento.

El modelo resuelve un problema acotado: la generación consistente de un personaje concreto (character consistency) en un pipeline text-to-image de SDXL. Para ello se entrena únicamente la UNet con dimensión de red y alpha de 16, aplicando un token disparador (`korean4`) que el usuario debe incluir en el prompt. Es relevante para desarrolladores que construyan flujos de generación de retratos o contenido con identidad fija y quieran una referencia ligera que no requiere reentrenar el modelo base.

La ficha se basa exclusivamente en la información pública del repositorio: no hay resultados de benchmarks, no se declaran idiomas soportados y el modelo no registra descargas ni likes en el momento de la consulta. La fecha de creación indicada en los metadatos (2026-11-21) se reproduce tal cual aparece en la fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion XL (difusión latente, text-to-image) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base SDXL no se incluye en el repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución de entrenamiento 1024 px, bucketing 256–2048) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en fp16; el modelo base admite fp16/fp32 según el pipeline) |
| Idiomas soportados | no disponible (prompts en lenguaje natural; la model card usa inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`korean4.safetensors`) |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| Dimensión de red / alpha | 16 / 16 (solo UNet) |
| Tamaño del repositorio | 0,2 GB |
| Librería | diffusers |

## Arquitectura y entrenamiento

El adaptador se entrena sobre la UNet de SDXL con `kohya-ss sdxl_train_network.py`, en resolución 1024 px con bucketing entre 256 y 2048, durante 1500 pasos, con learning rate 1e-4, optimizador Adafactor, batch size 1, precisión fp16, gradient checkpointing y atención sdpa. La dimensión de red y alpha son ambas 16 y el entrenamiento se limita a la UNet, sin tocar el text encoder. El entrenamiento se realizó en una GPU de Kaggle, de forma completamente offline y sin tokens de API.

El conjunto de datos consta de 58 imágenes curadas de Lee Min-ho, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of korean4 person`). Forma parte del conjunto "Korean Top-10" y el dataset público asociado es `nekodeus/korean-top10-v2`, en la subcarpeta `korean4/`. No se documenta el uso de RLHF, DPO ni técnicas de preferencias, algo esperable en un LoRA de personaje. La innovación técnica es limitada por diseño: se trata de un adaptador de bajo rango estándar cuyo valor está en la curaduría del dataset y en la consistencia del token disparador.

## Capacidades

- Generación text-to-image de retratos y escenas con el personaje Lee Min-ho, condicionada al token `korean4`.
- Integración con el pipeline `StableDiffusionXLPipeline` de diffusers mediante `load_lora_weights`.
- Compatibilidad con ComfyUI mediante el nodo LoRA loader y el fichero `korean4.safetensors`.
- Control de resolución de salida hasta 1024 px nativos (con bucketing de entrenamiento hasta 2048).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de imagen, no de lenguaje.
- No se declaran capacidades multilingües ni modos especiales (thinking, visión, audio).

## Casos de uso

- Retratos de personaje consistentes: usar `korean4 Lee Min-ho, portrait photo, studio lighting` para generar retratos con identidad facial estable en lotes de imágenes, aprovechando que el LoRA fija el rostro del actor.
- Creación de contenido editorial o fan art: generar ilustraciones o portadas con el personaje en distintos estilos (fotografía de estudio, cinematográfico, ilustración) manteniendo el parecido facial.
- Pruebas de concepto de pipelines de imagen: validar flujos de diffusers o ComfyUI con un LoRA ligero de 0,2 GB antes de escalar a adaptadores más pesados.
- Prototipado de aplicaciones de generación de avatares: integrar el adaptador en una app que genere avatares con una identidad fija y verificar la latencia y calidad del pipeline SDXL.
- Investigación sobre consistencia de personajes: comparar la calidad de un LoRA entrenado con 58 imágenes y 1500 pasos frente a otras estrategias (DreamBooth, IP-Adapter) en tareas de identidad.
- Generación de material de marketing con personaje fijo: producir variaciones de un mismo rostro para campañas o storyboards, siempre que se respeten los derechos de imagen del actor y la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de 0,2 GB, pero requiere cargar SDXL base en memoria; en fp16 el pipeline completo ronda los 8–10 GB de VRAM para resolución 1024 px.
- GPU recomendadas: A100, H100 o L40S para producción con concurrencia; RTX 4090 (24 GB) para desarrollo y generación a 1024 px sin problemas.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y, con optimizaciones (attention slicing, VAE tiling), en GPUs de 8–12 GB como RTX 3060/4070.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI, y cualquier servidor que soporte SDXL con carga de LoRA.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Neko-korean4-sdxl-v1 | LoRA de personaje | SDXL 1.0 | Adaptador de bajo rango (dim 16) | 1024 px | Apache 2.0 | Hugging Face (0 descargas) |
| LoRA de personaje SDXL genérico | LoRA de personaje | SDXL 1.0 | Variable | 1024 px | Variable según autor | Hugging Face / Civitai |
| DreamBooth sobre SDXL | Fine-tuning completo de UNet | SDXL 1.0 | Miles de millones | 1024 px | Según modelo base | Requiere entrenamiento propio |
| IP-Adapter para SDXL | Adaptador de imagen | SDXL 1.0 | Adaptador de imagen | 1024 px | Apache 2.0 (según variante) | Hugging Face |

La comparativa se limita a categorías de técnica, ya que no se dispone de métricas de rendimiento publicadas para este LoRA concreto ni de alternativas directamente equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse con 58 imágenes de una única persona, el adaptador puede sobrerreproducir rasgos del conjunto y fallar en diversidad de poses o iluminación.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar rasgos faciales inconsistentes o artefactos cuando el prompt se aleja del dominio de entrenamiento (retratos, iluminación de estudio).
- Limitaciones de contexto e idioma: no se declaran idiomas soportados; el caption de entrenamiento está en inglés, por lo que prompts en otros idiomas pueden degradar la fidelidad.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el uso comercial debe respetar también la licencia del modelo base SDXL y, especialmente, los derechos de imagen del actor Lee Min-ho, que no se cubren con la licencia del modelo.
- Caveat para producción: el repositorio no registra descargas ni validación externa; conviene evaluar la calidad del LoRA en el caso de uso concreto antes de desplegarlo.
- El token disparador `korean4` es obligatorio; omitirlo reduce drásticamente la activación del personaje.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nekodeus/neko-korean4-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/korean-top10-v2
- Herramienta de entrenamiento (kohya-ss): https://github.com/kohya-ss/sd-scripts
- Documentación de diffusers para LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
