# Nekodeus/neko-tamil5-sdxl-v1

## Resumen

`Nekodeus/neko-tamil5-sdxl-v1` es un LoRA de personaje para SDXL entrenado por Nekodeus sobre `stabilityai/stable-diffusion-xl-base-1.0`. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que se acopla al UNet de SDXL para especializarlo en la generacion de imagenes de un personaje concreto llamado Vikram, activado mediante el token `tamil5`. El repositorio ocupa 0,2 GB y contiene los pesos del LoRA en formato safetensors junto con muestras del conjunto de entrenamiento.

El adaptador se entrena con 79 imagenes curadas del personaje, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of tamil5 person`). Forma parte del conjunto Tamil Top-10, cuyo dataset publico es `nekodeus/tamil-top10-v2` (subcarpeta `tamil5/`). El entrenamiento se realizo en GPU de Kaggle, de forma totalmente offline y sin tokens de API, con 1500 pasos, resolucion de 1024 px (bucketing entre 256 y 2048), dimension y alpha de red 16, learning rate 1e-4, optimizador Adafactor, batch 1, precision fp16, gradient checkpointing y atencion sdpa, usando la herramienta `kohya-ss/sdxl_train_network.py`.

Su relevancia es acotada: sirve para quien necesite reproducir de forma consistente un personaje concreto en un pipeline SDXL existente, sin reentrenar el modelo base y con una huella de almacenamiento minima. La licencia Apache 2.0 y la disponibilidad publica del dataset de entrenamiento facilitan su inspeccion y reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de SDXL (adaptador de bajo rango, dim/alpha 16) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image, no LLM) |
| Tipos de cuantizacion | fp16 (entrenamiento); no se documentan otras variantes |
| Idiomas soportados | no disponible (las etiquetas de entrenamiento estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`tamil5.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado exclusivamente al UNet de Stable Diffusion XL base 1.0, con dimension de red y alpha de 16. SDXL combina un UNet con bloques de atencion cruzada hacia dos codificadores de texto (CLIP ViT-L y OpenCLIP ViT-bigG), y el LoRA modifica los pesos de proyeccion dentro de ese UNet para desplazar la distribucion generativa hacia el personaje objetivo. El entrenamiento se realizo a 1024 px con bucketing de resoluciones entre 256 y 2048, 1500 pasos, learning rate 1e-4, optimizador Adafactor con batch 1, precision fp16, gradient checkpointing y atencion sdpa, mediante `kohya-ss/sdxl_train_network.py` en una GPU de Kaggle.

El dataset consta de 79 imagenes curadas de Vikram, filtradas con verificacion facial mediante OpenCV y etiquetadas con un caption uniforme y minimalista (`a photo of tamil5 person`). No se documenta uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un LoRA de personaje. No se especifica el numero de tokens de texto vistos ni la composicion detallada del dataset mas alla de las 79 imagenes y su pertenencia al conjunto Tamil Top-10.

## Capacidades

- Generacion text-to-image de retratos y escenas del personaje Vikram mediante el token disparador `tamil5`.
- Composicion de prompts con el LoRA cargado junto al modelo base SDXL a 1024 px.
- Integracion con diffusers (`load_lora_weights`) y con ComfyUI (nodo LoRA loader).
- Control de estilo mediante el prompt (por ejemplo, `portrait photo, studio lighting`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un adaptador de difusion, no un LLM.
- Capacidades multilingues: no documentadas; las etiquetas de entrenamiento estan en ingles.
- No dispone de modo thinking, vision, audio ni otras capacidades especiales.

## Casos de uso

- Generacion de retratos consistentes del personaje Vikram: cargar el LoRA sobre SDXL base y usar el token `tamil5` en el prompt para obtener imagenes del mismo individuo en distintas poses y escenarios, gracias a la especializacion del adaptador sobre 79 imagenes curadas.
- Prototipado de narrativa visual o comic: combinar el LoRA con prompts de escena para mantener la identidad del personaje entre paneles, con un coste de almacenamiento de 0,2 GB y sin reentrenar el modelo base.
- Creacion de material promocional o avatares: usar el LoRA en ComfyUI con un nodo LoRA loader para generar variaciones de retrato con iluminacion de estudio (`portrait photo, studio lighting`) de forma reproducible.
- Experimentacion en investigacion sobre LoRA de personaje: al estar publico el dataset `nekodeus/tamil-top10-v2` y documentarse hiperparametros completos (1500 pasos, dim/alpha 16, lr 1e-4, Adafactor), sirve como referencia reproducible para estudiar sobreajuste y fidelidad de identidad con pocos datos.
- Integracion en pipelines de diffusers: cargar el adaptador con `pipe.load_lora_weights` y encadenarlo con otros LoRA o tecnicas de control para flujos de generacion automatizada a 1024 px.
- Fine-tuning incremental sobre el adaptador: partir de estos pesos como inicializacion para ampliar el conjunto de imagenes del personaje o ajustar estilo, dado que la licencia Apache 2.0 permite uso comercial y modificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del pipeline SDXL base 1.0 en fp16, no del LoRA, cuyo peso adicional es marginal (repo de 0,2 GB).
- GPU recomendadas: no documentadas por el autor; el entrenamiento se realizo en GPU de Kaggle.
- Compatibilidad con GPU de consumo: no documentada; condicionada por los requisitos de SDXL base, no por el adaptador.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`) y ComfyUI (nodo LoRA loader con `tamil5.safetensors` en `models/loras/`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-tamil5-sdxl-v1 | LoRA de personaje | SDXL base 1.0 | no disponible (dim/alpha 16) | no aplica | Apache 2.0 | Hugging Face, publico |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base text-to-image | — | no disponible en esta ficha | no aplica | CreativeML Open RAIL++-M (segun el modelo base) | Hugging Face, publico |
| Otros LoRA del conjunto Tamil Top-10 | LoRA de personaje | SDXL base 1.0 | no disponible | no aplica | no disponible | Hugging Face (dataset `nekodeus/tamil-top10-v2`) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion muy estrecha: entrenado con solo 79 imagenes y un caption uniforme, lo que puede provocar sobreajuste a poses, fondos o iluminaciones presentes en el dataset.
- Riesgo de fuga de identidad: al tratarse de un LoRA de personaje, puede reproducir rasgos de personas reales; conviene revisar implicaciones de privacidad y consentimiento antes de uso comercial.
- Sesgos conocidos: no documentados por el autor; el conjunto de 79 imagenes puede introducir sesgos de demografia, encuadre y estilo.
- Dependencia del token `tamil5`: sin el token disparador en el prompt, el efecto del adaptador puede ser impredecible o nulo.
- Limitaciones de idioma: las etiquetas de entrenamiento estan en ingles; no se documenta comportamiento con prompts en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion del adaptador, pero el modelo base SDXL tiene su propia licencia que debe respetarse por separado.
- Caveat de produccion: no hay benchmarks, evaluaciones de fidelidad ni datos de latencia; el adaptador debe validarse en el pipeline concreto antes de desplegarse.
- No es un LLM: no ofrece generacion de texto, codigo, tool calling ni razonamiento; no debe evaluarse con metricas tipo MMLU o HumanEval.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-tamil5-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/tamil-top10-v2
- Herramienta de entrenamiento: https://github.com/kohya-ss/sd-scripts
- Libreria diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
