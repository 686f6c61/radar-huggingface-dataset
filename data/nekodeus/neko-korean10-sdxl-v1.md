# Nekodeus/neko-korean10-sdxl-v1

## Resumen

`Nekodeus/neko-korean10-sdxl-v1` es una LoRA de personaje (character LoRA) para Stable Diffusion XL, entrenada por el usuario Nekodeus sobre el modelo base `stabilityai/stable-diffusion-xl-base-1.0`. Su objetivo es reproducir el rostro y la apariencia de la actriz surcoreana Jung Ho-yeon (conocida por su papel en *El juego del calamar*) mediante un token de activación específico, `korean10`. Forma parte de un conjunto mayor denominado "Korean Top-10", del que el autor publica el dataset de entrenamiento en `nekodeus/korean-top10-v2`.

Técnicamente se trata de un adaptador ligero (LoRA de dimensión 16 aplicada únicamente al UNet) que no modifica los pesos del modelo base; se carga sobre una pipeline SDXL estándar y añade un concepto visual concreto sin alterar el resto de capacidades del modelo. El repositorio ocupa 0,2 GB y contiene el fichero `korean10.safetensors` junto con imágenes de muestra del set de entrenamiento.

Es relevante ahora porque ilustra el flujo típico de personalización de modelos de difusión de código abierto: entrenamiento de bajo coste (Kaggle GPU, totalmente offline), licencia permisiva Apache 2.0 y compatibilidad directa con `diffusers` y ComfyUI. Su utilidad está acotada a la generación de retratos e imágenes con la identidad de esa persona concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion XL (difusión latente) |
| Parametros totales | No disponible (el adaptador tiene dimensión de red 16/alpha 16, solo UNet; el número exacto de parámetros entrenables no se indica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo text-to-image; el prompt se procesa con los text encoders de SDXL, con el límite estándar de 77 tokens por chunk) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors fp16; el modelo base admite fp16/fp32 y cuantizaciones de la comunidad) |
| Idiomas soportados | No disponible (los prompts de entrenamiento están en inglés: `a photo of korean10 person`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`korean10.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es una LoRA aplicada exclusivamente al UNet de SDXL, con dimensión de red y alpha de 16, entrenada a resolución 1024 px con bucketing entre 256 y 2048 px. El entrenamiento se realizó durante 1500 pasos con learning rate 1e-4, optimizador Adafactor, batch size 1, precisión fp16, gradient checkpointing y atención SDPA, usando la herramienta `kohya-ss/sdxl_train_network.py`. Todo el proceso se ejecutó en una GPU de Kaggle, de forma offline y sin tokens de API.

El dataset consta de 52 imágenes curadas de Jung Ho-yeon, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme y genérico (`a photo of korean10 person`). No se menciona uso de RLHF, DPO ni etapas de refinamiento posteriores; es un entrenamiento supervisado estándar de difusión con pares imagen-texto. La innovación técnica es mínima por diseño: se prioriza un adaptador pequeño, reproducible y fácil de integrar sobre una base SDXL ya consolidada.

## Capacidades

- Generación de imágenes text-to-image a 1024 px sobre la base SDXL, condicionada por el token `korean10`.
- Reproducción de la identidad facial y apariencia de Jung Ho-yeon en retratos y escenas.
- Composición con el resto del vocabulario visual de SDXL (estilos, iluminación, encuadres, vestuario) al no sobreescribir los pesos base.
- Integración con `diffusers` mediante `load_lora_weights` y con ComfyUI mediante un nodo LoRA loader.
- Control de intensidad del efecto mediante el peso de la LoRA en la pipeline (parámetro estándar, no documentado en la model card).
- No soporta tool calling, agentes, razonamiento multi-step ni otras capacidades de lenguaje: es un modelo puramente generativo de imagen.

## Casos de uso

- Retratos de personaje consistentes: usar `korean10 Jung Ho-yeon, portrait photo, studio lighting` para generar retratos con identidad estable en series de imágenes, aprovechando que la LoRA fija el rostro mientras SDXL controla la estética.
- Pruebas de vestuario y estilismo: generar a la misma persona con distintas combinaciones de ropa, peinado e iluminación para previsualizar conceptos antes de una sesión real.
- Storyboards y cómics: mantener la coherencia de un personaje a lo largo de varias viñetas combinando la LoRA con prompts de escena y, si se desea, con ControlNet sobre la base SDXL.
- Prototipado de material promocional: crear bocetos de carteles o thumbnails con una figura reconocible para iterar rápido antes de encargar producción gráfica.
- Ficción y fan art: ilustrar escenas narrativas con el personaje dentro de entornos controlados por el prompt, útil para comunidades creativas.
- Evaluación de pipelines de personalización: servir como caso de prueba reproducible (dataset y configuración publicados) para comparar técnicas de fine-tuning de LoRA sobre SDXL en entornos con recursos limitados (una sola GPU de Kaggle).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB en safetensors; el coste real lo determina el modelo base SDXL.
- Inferencia SDXL en fp16: aproximadamente 8-10 GB de VRAM para 1024x1024, según optimizaciones de la pipeline.
- GPU recomendadas: A100, H100 o L40S para producción y batch; RTX 4090 (24 GB) para uso intensivo en local.
- Cabe en GPU de consumo: RTX 3090/4090 (24 GB) con comodidad; RTX 3060/4060 Ti (12-16 GB) con `enable_model_cpu_offload` o `enable_vae_slicing`; en 8 GB requiere offload agresivo o cuantización del UNet.
- Opciones de despliegue: `diffusers` (StableDiffusionXLPipeline + `load_lora_weights`), ComfyUI (nodo LoRA loader), Automatic1111/Forge y otras interfaces compatibles con LoRA SDXL.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de los pasos de muestreo configurados.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-korean10-sdxl-v1 | LoRA de personaje | SDXL 1.0 | dim 16 (UNet) | No aplica | Apache 2.0 | Hugging Face |
| Otras LoRA de personaje SDXL de la comunidad | LoRA de personaje | SDXL 1.0 | Variable (dim 8-128) | No aplica | Variable (a menudo Apache 2.0 o CreativeML) | Hugging Face, Civitai |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base text-to-image | — | ~3,5 B (UNet + text encoders) | No aplica | CreativeML Open RAIL++-M | Hugging Face |
| Modelos de identidad alternativos (p. ej. IP-Adapter FaceID) | Adaptador de identidad por imagen de referencia | SDXL | No disponible | No aplica | Variable | Hugging Face |

La diferencia principal frente a otras LoRA de personaje es la publicación del dataset de entrenamiento y de la configuración exacta, lo que facilita la reproducibilidad; frente a IP-Adapter FaceID, esta LoRA no requiere imagen de referencia en inferencia, pero está limitada a una única identidad.

## Limitaciones y advertencias

- Sesgo de dataset: solo 52 imágenes de una única persona, con caption uniforme y genérico; el modelo puede sobreajustar poses, encuadres o iluminación presentes en el set.
- Riesgo de alucinación visual: al ser un modelo de difusión, puede generar rasgos faciales inconsistentes o anatómicamente incorrectos, especialmente con pesos de LoRA altos o prompts ambiguos.
- Idiomas: no se documenta soporte multilingüe; los captions de entrenamiento están en inglés, por lo que los prompts en otros idiomas pueden degradar el resultado.
- Restricciones legales: la licencia del adaptador es Apache 2.0, pero el modelo base SDXL se rige por CreativeML Open RAIL++-M, cuyas restricciones de uso se heredan; además, el uso comercial de la imagen de una persona real requiere su consentimiento y puede estar sujeto a derechos de imagen.
- Sin garantías de calidad: 1500 pasos y 52 imágenes son un entrenamiento ligero; la fidelidad de identidad puede ser limitada frente a LoRA con datasets mayores.
- Sin benchmarks ni evaluación cuantitativa publicada; el rendimiento debe validarse empíricamente antes de usarlo en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-korean10-sdxl-v1
- Modelo base SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/korean-top10-v2
- Herramienta de entrenamiento (kohya-ss sd-scripts): https://github.com/kohya-ss/sd-scripts
- Librería diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
