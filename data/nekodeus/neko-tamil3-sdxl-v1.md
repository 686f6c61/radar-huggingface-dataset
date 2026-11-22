# Nekodeus/neko-tamil3-sdxl-v1

## Resumen

Neko-tamil3-sdxl-v1 es un adaptador LoRA para generación de imágenes mediante texto (text-to-image) construido sobre Stable Diffusion XL 1.0. Lo desarrolla el usuario Nekodeus y su función es concreta: reproducir el rostro del actor indio Ajith Kumar en imágenes generadas, mediante el token de activación `tamil3`. Forma parte de un conjunto mayor denominado Tamil Top-10, orientado a personajes de la industria cinematográfica tamil.

El modelo no es un modelo base autónomo, sino un adaptador de bajo rango (LoRA) que se carga sobre `stabilityai/stable-diffusion-xl-base-1.0` y modifica únicamente las capas del UNet. Se entrenó a resolución de 1024 px con 1500 pasos, dimensión de red 16 y alpha 16, sobre un dataset de 64 imágenes verificadas facialmente. El repositorio ocupa 0,2 GB y los pesos se distribuyen en formato safetensors compatibles con la librería diffusers.

Su relevancia es acotada pero clara para quien necesite generar retratos consistentes de este personaje concreto sin reentrenar: es un adaptador ligero, de licencia Apache 2.0 y con instrucciones de uso reproducibles tanto en diffusers como en ComfyUI. No obstante, el modelo cuenta con cero descargas y cero likes en el momento de la ficha, y no se han publicado evaluaciones cuantitativas de fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion XL (difusión latente, transformer convolucional) |
| Parametros totales | no disponible (adaptador de bajo rango; dimensión de red 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; prompt de texto sin ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos entrenados en fp16; el adaptador se puede combinar con bases cuantizadas, no documentado) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`tamil3.safetensors`) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA exclusivamente sobre el UNet de SDXL 1.0, con dimensión de red y alpha de 16. El entrenamiento se realizó a resolución 1024 px con bucketing entre 256 y 2048, durante 1500 pasos, con learning rate 1e-4, optimizador Adafactor, batch size 1, precisión fp16, gradient checkpointing y atención sdpa. Se utilizó la herramienta `sdxl_train_network.py` de kohya-ss sobre una GPU de Kaggle, en modo completamente offline.

El dataset está compuesto por 64 imágenes curadas de Ajith Kumar, verificadas facialmente con OpenCV y etiquetadas con un pie de foto uniforme (`a photo of tamil3 person`). El conjunto público asociado es `nekodeus/tamil-top10-v2`, en la subcarpeta `tamil3/`. No se documenta el uso de RLHF, DPO ni ningún proceso de alineación posterior; tampoco se especifica el número de tokens de texto utilizados ni la composición completa del corpus de captions más allá del stub uniforme.

## Capacidades

- Generación de imágenes fotorrealistas de retratos a 1024x1024 px condicionada por texto.
- Reproducción de la identidad facial de Ajith Kumar mediante el token de activación `tamil3`.
- Integración como adaptador LoRA sobre SDXL 1.0, combinable con otros LoRA y con el pipeline estándar de diffusers.
- Control de composición mediante prompts de texto (por ejemplo, iluminación de estudio, tipo de plano).
- Compatibilidad con ComfyUI mediante nodo de carga de LoRA.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión de entrada ni modo thinking: es un modelo puramente generativo de imagen.

## Casos de uso

- Generación de retratos de personaje para proyectos de fan art: el LoRA permite obtener imágenes consistentes de Ajith Kumar con el token `tamil3` y variar iluminación o encuadre desde el prompt, sin reentrenar el modelo base.
- Creación de storyboards y previsualización de escenas: al fijar la identidad del personaje, se pueden generar múltiples planos coherentes para una secuencia narrativa antes de producción.
- Prototipado de material promocional ficticio: útil para maquetas de carteles o pruebas de concepto visuales en las que se requiera un rostro concreto y reconocible.
- Pruebas de pipelines de difusión: sirve como caso de estudio para validar la carga de LoRA en diffusers o ComfyUI con un adaptador pequeño (0,2 GB) y verificar el flujo completo de inferencia.
- Investigación sobre fidelidad de LoRA de personajes: con 64 imágenes y 1500 pasos, es un ejemplo controlado para estudiar el efecto de la dimensión de red y el número de pasos en la identidad facial.
- Generación de variaciones de estilo sobre un mismo personaje: combinando el LoRA con prompts de estilo (fotografía, ilustración) se pueden explorar distintas estéticas manteniendo el rostro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,2 GB; el requisito real lo determina el modelo base SDXL 1.0.
- Inferencia de SDXL a 1024 px en fp16: se estima en torno a 8-10 GB de VRAM, aunque el dato exacto no está documentado por el autor.
- GPU recomendadas: A100 o H100 para producción y batch alto; RTX 4090 para uso individual con buena latencia; RTX 3090/4080 como mínimo práctico.
- Cabe en GPU de consumo con al menos 8-12 GB de VRAM, especialmente usando variantes cuantizadas o fp16 del modelo base.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI con nodo LoRA loader; también es compatible con otros runners de SDXL no documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Neko-tamil3-sdxl-v1 | LoRA de personaje | SDXL 1.0 | dim 16, 0,2 GB | no aplica | Apache 2.0 | Hugging Face |
| LoRA de personaje típico en SDXL | LoRA de personaje | SDXL 1.0 | variable (dim 8-128) | no aplica | variable | Hugging Face / Civitai |
| Modelo base SDXL 1.0 | Difusión texto-imagen | propio | no disponible | no aplica | OpenRAIL++ | Hugging Face |
| SD 1.5 + LoRA de personaje | LoRA de personaje | SD 1.5 | variable | no aplica | CreativeML OpenRAIL-M | Hugging Face |

La comparación cuantitativa de fidelidad no es posible porque no hay benchmarks publicados para este adaptador ni métricas comparables en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre 64 imágenes de una única persona, puede sobrerrepresentar rasgos concretos y fallar en variaciones de edad, ángulo o iluminación no presentes en el dataset.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar rasgos faciales inconsistentes o artefactos, especialmente fuera de los encuadres de retrato.
- Limitaciones de contexto e idioma: no hay información sobre idiomas soportados; los ejemplos usan inglés y el token `tamil3` debe incluirse explícitamente para activar el personaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero el modelo base SDXL 1.0 tiene su propia licencia (OpenRAIL++) que debe respetarse por separado.
- Caveat para producción: el modelo tiene cero descargas y cero likes, sin validación externa ni evaluación de calidad publicada; no se recomienda desplegarlo en producción sin una evaluación propia de fidelidad y sesgos.
- El dataset de entrenamiento es pequeño (64 imágenes) y el número de pasos es bajo (1500), lo que puede limitar la robustez del LoRA ante prompts fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-tamil3-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset público asociado: https://huggingface.co/datasets/nekodeus/tamil-top10-v2
- Herramienta de entrenamiento kohya-ss: https://github.com/kohya-ss/sd-scripts
- Librería diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
