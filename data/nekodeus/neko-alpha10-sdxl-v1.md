# Nekodeus/neko-alpha10-sdxl-v1

## Resumen

Neko alpha10 SDXL v1 es un adaptador LoRA de tipo personaje (character LoRA) para Stable Diffusion XL, publicado por el usuario Nekodeus. Su proposito es introducir en el modelo base `stabilityai/stable-diffusion-xl-base-1.0` la identidad facial de una persona concreta (el actor Hugh Jackman) mediante un token de activacion (`alpha10`), de modo que el modelo base pueda generar retratos y escenas coherentes con ese rostro sin necesidad de un fine-tuning completo. El repositorio ocupa 0,2 GB y contiene los pesos del adaptador en formato safetensors, ademas de imagenes de muestra del conjunto de entrenamiento.

El modelo no es un modelo de lenguaje ni un sistema multimodal general: es un adaptador de difusion para generacion de imagen texto-a-imagen, con un alcance funcional muy acotado (un unico sujeto, un unico dominio estetico). Se entrena sobre SDXL a 1024 px con 1500 pasos, dimension de red 8 o 16 y optimizador Adafactor sobre una GPU NVIDIA P100 en Kaggle, en un flujo completamente offline. La licencia declarada es Apache 2.0, heredada del ecosistema SDXL, aunque la naturaleza del contenido (rostro de una persona real) introduce consideraciones adicionales que la licencia por si sola no cubre.

Es relevante ahora como ejemplo de la practica habitual en el ecosistema de difusion: adaptadores pequenos, baratos de entrenar y faciles de integrar en pipelines de `diffusers` o ComfyUI, que permiten personalizacion de identidad sin reentrenar el modelo base. Su interes tecnico es limitado fuera de ese caso de uso concreto, y su adopcion publica es practicamente nula en el momento de la ficha (0 descargas, 0 likes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion XL base 1.0 (UNet transformer de difusion latente) |
| Parametros totales | no disponible (adaptador LoRA; el repo pesa 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolucion nativa de entrenamiento 1024x1024) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite fp16/fp32 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponible (los prompts se procesan con el text encoder de SDXL, predominantemente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`alpha10.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre la UNet de Stable Diffusion XL, un modelo de difusion latente con arquitectura transformer y doble text encoder (CLIP ViT-L y OpenCLIP ViT-bigG). La tecnica LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atencion, lo que reduce drasticamente el numero de parametros entrenables y el coste de almacenamiento. En este caso la dimension de red es 8 (alpha 8) en la mayoria de conjuntos, con algunos configurados a 16/16, y el entrenamiento se realizo a 1024 px durante 1500 pasos, con learning rate 1e-4, batch de 2, optimizador Adafactor y atencion sdpa, sobre una NVIDIA P100 de Kaggle.

El conjunto de datos consta de aproximadamente 100 imagenes curadas del actor Hugh Jackman, verificadas facialmente con OpenCV y etiquetadas con una leyenda uniforme (`a photo of alpha10 person`). No se documenta el uso de RLHF, DPO ni tecnicas de preferencia, algo esperable en un adaptador de difusion. La innovacion tecnica es minima: se trata de un entrenamiento estandar de LoRA de personaje, sin decodificacion especulativa, atencion lineal ni componentes hibridos. El dataset publico asociado es `nekodeus/alpha10-hugh-jackman`.

## Capacidades

- Generacion texto-a-imagen de retratos y escenas del sujeto entrenado, invocando el token `alpha10` en el prompt.
- Composicion de escenas controlada por prompt (iluminacion, encuadre, estilo fotografico) manteniendo la identidad facial aprendida.
- Integracion con el pipeline `StableDiffusionXLPipeline` de `diffusers` mediante `load_lora_weights`.
- Compatibilidad con ComfyUI como nodo LoRA loader sobre el modelo base SDXL.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo thinking, vision, audio ni capacidades multimodales mas alla de la generacion de imagen.
- Capacidades multilingues no documentadas; el text encoder de SDXL esta optimizado para ingles.

## Casos de uso

- Generacion de retratos de personaje para previsualizacion de casting o storyboards: el adaptador permite obtener variaciones de encuadre e iluminacion del mismo rostro con un unico token, a 1024 px y sin reentrenar SDXL.
- Creacion de material promocional ficticio o fan art: util para ilustraciones no comerciales donde se requiera consistencia de identidad a lo largo de una serie de imagenes.
- Pruebas de concepto de personalizacion de identidad en pipelines de difusion: sirve como referencia tecnica para evaluar como un LoRA de rango 8 con 1500 pasos captura rasgos faciales sobre SDXL.
- Integracion en flujos ComfyUI de generacion por lotes: al ser un safetensors pequeno, se puede cargar y descargar dinamicamente segun el prompt, facilitando la alternancia entre identidades en un mismo grafo.
- Investigacion sobre sesgos y fidelidad de LoRA de personaje: permite medir deriva de identidad, sobreajuste al dataset de ~100 imagenes y sensibilidad al token de activacion.
- Docencia y demostraciones de fine-tuning eficiente: el coste de entrenamiento (1500 pasos en una P100 de Kaggle) lo hace adecuado para talleres practicos sobre LoRA y difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa muy poco (repo de 0,2 GB), pero requiere cargar SDXL base, que en fp16 consume aproximadamente 6-8 GB de VRAM para generar a 1024x1024; con optimizaciones de atencion y VAE tiling puede reducirse.
- GPU recomendadas: NVIDIA A100 o H100 para generacion por lotes a alta resolucion; RTX 4090 o RTX 3090 para uso individual con buena latencia.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4070 y superiores con fp16; en GPUs de 8 GB puede requerir `enable_model_cpu_offload` o cuantizacion del UNet.
- Opciones de despliegue: `diffusers` (pipeline SDXL + `load_lora_weights`), ComfyUI (nodo LoRA loader), Automatic1111/Forge con soporte SDXL, y servidores tipo Replicate o fal si se empaqueta el pipeline.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware, de los pasos de muestreo y del scheduler elegido.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros / tamano | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-alpha10-sdxl-v1 | LoRA de personaje | SDXL 1.0 | repo 0,2 GB | 1024x1024 | Apache 2.0 | Hugging Face, 0 descargas |
| Nekodeus/neko-hollywood-alpha-sdxl-v1 | LoRA de personaje (serie) | SDXL 1.0 | no disponible | 1024x1024 | no disponible | Hugging Face |
| Nekodeus/neko-hollywood-alpha-sd15-v1 | LoRA de personaje (serie) | SD 1.5 | no disponible | 512x512 | no disponible | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base texto-a-imagen | — | ~3,5 B (UNet + text encoders) | 1024x1024 | CreativeML Open RAIL++-M | Hugging Face, amplia adopcion |

La comparativa se limita a variantes del mismo autor y al modelo base, ya que no se dispone de datos de benchmarks ni de otros adaptadores equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset de ~100 imagenes de una unica persona introduce un sesgo fuerte de identidad y de estilo fotografico; el modelo probablemente reproduce encuadres y condiciones de iluminacion similares a las del conjunto de entrenamiento.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar rasgos faciales inconsistentes, artefactos en manos y ojos, y deriva de identidad cuando el prompt se aleja de las condiciones de entrenamiento.
- Limitaciones de contexto e idioma: los prompts funcionan mejor en ingles; no hay soporte documentado de otros idiomas y el token `alpha10` es obligatorio para activar el concepto.
- Restricciones de licencia: la licencia Apache 2.0 cubre el adaptador, pero el uso comercial de la imagen de una persona real requiere derechos de imagen y puede estar sujeto a legislacion de proteccion de datos y a las politicas de la plataforma de despliegue; el modelo base SDXL tiene su propia licencia (CreativeML Open RAIL++-M) con restricciones de uso.
- Caveats para produccion: 0 descargas y 0 likes indican ausencia de validacion por la comunidad; no hay evaluacion cuantitativa de fidelidad de identidad ni de calidad de generacion. El entrenamiento se realizo en una P100 de Kaggle con 1500 pasos, lo que sugiere un ajuste limitado y posible sobreajuste al dataset.
- Riesgo de suplantacion: al tratarse de un LoRA de una persona real, su uso para generar imagenes no consentidas o desinformacion es un riesgo relevante que debe mitigarse con filtros y politicas de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-alpha10-sdxl-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/alpha10-hugh-jackman
- Serie Hollywood alpha SDXL: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sdxl-v1
- Serie Hollywood alpha SD1.5: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- Modelo base SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Libreria diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
