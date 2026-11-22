# Nekodeus/neko-korean1-sdxl-v1

## Resumen

Neko-korean1-sdxl-v1 es un LoRA de personaje para Stable Diffusion XL (SDXL) desarrollado por Nekodeus, publicado bajo el identificador `Nekodeus/neko-korean1-sdxl-v1`. Se trata de un adaptador de bajo rango que se aplica sobre el modelo base `stabilityai/stable-diffusion-xl-base-1.0` para generar imagenes fotorrealistas del actor surcoreano Hyun Bin a partir de descripciones textuales. No es un modelo de lenguaje ni un modelo fundacional: es un ajuste fino ligero de la UNet de SDXL orientado a la sintesis de imagenes de un personaje concreto.

El adaptador forma parte del conjunto "Korean Top-10" del autor, una coleccion de LoRAs de personajes surcoreanos. Se entreno con 27 imagenes curadas y verificadas facialmente con OpenCV, a una resolucion nominal de 1024 px, durante 1500 pasos y con un rango de red de 16. Su utilidad practica es acotada: permite incorporar el rostro de Hyun Bin en flujos de generacion de imagen con SDXL sin necesidad de reentrenar el modelo base.

La relevancia de esta ficha es principalmente documental: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,2 GB y una licencia Apache 2.0. No hay datos de benchmarks, idiomas declarados ni evaluaciones de calidad publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion XL |
| Parametros totales | no disponible (LoRA con dim 16 en la UNet; no se declara el numero exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; no hay ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (entrenado en fp16; el LoRA se distribuye en safetensors) |
| Idiomas soportados | no disponibles (el prompt se procesa con los text encoders de SDXL) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`korean1.safetensors`) |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| Resolucion de entrenamiento | 1024 px (bucketing 256-2048) |
| Rango de red (dim / alpha) | 16 / 16 (solo UNet) |
| Pasos de entrenamiento | 1500 |
| Optimizador | Adafactor, batch 1, lr 1e-4 |
| Precisión de entrenamiento | fp16, gradient checkpointing, sdpa |
| Herramienta de entrenamiento | kohya-ss `sdxl_train_network.py` |
| Tamano del repositorio | 0,2 GB |
| Pipeline | text-to-image |
| Libreria | diffusers |

## Arquitectura y entrenamiento

El modelo es un LoRA que modifica unicamente la UNet de Stable Diffusion XL, manteniendo congelados los text encoders y el VAE del modelo base. SDXL es una arquitectura de difusion latente con un UNet de gran tamano y dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG), y este adaptador inyecta matrices de bajo rango de dimension 16 y alpha 16 en las capas de la UNet. El entrenamiento se realizo con la herramienta kohya-ss (`sdxl_train_network.py`), en precision fp16, con gradient checkpointing y atencion sdpa, sobre GPU de Kaggle y de forma totalmente offline.

El dataset consta de 27 imagenes curadas de Hyun Bin, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of korean1 person`). El conjunto publico asociado es `nekodeus/korean-top10-v2`, en la subcarpeta `korean1/`. El entrenamiento se ejecuto durante 1500 pasos con Adafactor, batch 1 y learning rate 1e-4, con bucketing de resolucion entre 256 y 2048 px y resolucion nominal de 1024 px. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un modelo de difusion. La innovacion tecnica es limitada: se trata de un entrenamiento LoRA estandar con un dataset muy pequeno y un caption generico, lo que condiciona la flexibilidad del adaptador.

## Capacidades

- Generacion de imagenes text-to-image de un personaje concreto (Hyun Bin) sobre SDXL.
- Activacion mediante el token disparador `korean1`, que debe incluirse en el prompt.
- Retratos y escenas fotorrealistas a 1024 px, con control de composicion mediante prompt.
- Integracion con el ecosistema diffusers mediante `load_lora_weights`.
- Integracion con ComfyUI mediante el nodo LoRA loader.
- Compatible con el resto de capacidades del modelo base SDXL (negative prompts, guidance scale, schedulers).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de vision, audio ni thinking mode.
- Cobertura multilingue no declarada; el prompt depende de los text encoders de SDXL.

## Casos de uso

- Generacion de retratos de personaje para ilustracion editorial: el LoRA permite producir imagenes consistentes de Hyun Bin a 1024 px con iluminacion de estudio, util para maquetas y pruebas de concepto visuales.
- Prototipado de storyboards: se pueden generar varias escenas del mismo personaje manteniendo el token `korean1` y variando el prompt de entorno, lo que facilita la coherencia visual en secuencias.
- Pruebas de pipelines de difusion: sirve como caso de prueba para validar la carga de LoRAs en diffusers o ComfyUI antes de desplegar adaptadores en produccion.
- Experimentacion academica con LoRA de bajo rango: su configuracion (dim 16, 1500 pasos, 27 imagenes) es un ejemplo reproducible de ajuste fino con recursos limitados.
- Generacion de material promocional ficticio: para demos de herramientas de sintesis de imagen o comparativas de calidad entre adaptadores de personaje.
- Integracion en flujos creativos con SDXL: combinado con otros LoRAs o con ControlNet del modelo base para controlar pose y composicion en ilustracion.
- Docencia sobre difusion: ejemplo didactico de como un token disparador y un caption uniforme afectan al aprendizaje de un concepto visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el LoRA en si ocupa muy poco (repo de 0,2 GB), pero requiere cargar SDXL base en fp16, lo que ronda los 6-8 GB de VRAM para generar a 1024 px; con cuantizacion del base puede reducirse.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para generacion rapida a 1024 px; RTX 3090 y RTX 4080 tambien son suficientes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti) usando fp16 y atencion eficiente; con 6 GB puede requerir offloading.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI con nodo LoRA loader, y Automatic1111/Forge con soporte de LoRA para SDXL.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del numero de pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-korean1-sdxl-v1 | LoRA de personaje | SDXL 1.0 | dim 16 (UNet) | no aplica | Apache 2.0 | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base text-to-image | propio | no disponible | no aplica | CreativeML Open RAIL++-M | Hugging Face |
| Otros LoRAs de personaje del set Korean Top-10 (nekodeus) | LoRA de personaje | SDXL 1.0 | dim 16 (UNet) | no aplica | Apache 2.0 (segun repo) | Hugging Face |

La comparativa con alternativas de la misma categoria es limitada: no hay datos publicados de calidad ni benchmarks que permitan contrastar este LoRA con otros adaptadores de personaje. El modelo base SDXL es la referencia obligada, y los demas LoRAs del set del autor comparten configuracion de entrenamiento.

## Limitaciones y advertencias

- Dataset muy pequeno (27 imagenes) y caption uniforme, lo que puede limitar la variedad de poses, expresiones y contextos que el LoRA reproduce con fidelidad.
- Riesgo de sobreajuste al conjunto de entrenamiento y de generar variaciones limitadas del rostro.
- Riesgo de alucinacion visual: el modelo puede producir rasgos inconsistentes o artefactos cuando el prompt se aleja de las condiciones de entrenamiento.
- No hay evaluacion de sesgos ni de calidad publicada; el sesgo depende del dataset curado y del modelo base SDXL.
- Uso comercial permitido por la licencia Apache 2.0 del adaptador, pero sujeto a las condiciones del modelo base SDXL (CreativeML Open RAIL++-M), que imponen restricciones de uso.
- El token disparador `korean1` es obligatorio; sin el, el adaptador puede no activarse correctamente.
- Sin soporte declarado de idiomas ni de prompt multilingue mas alla de lo que ofrecen los text encoders de SDXL.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion por la comunidad.
- No apto para tareas de lenguaje, razonamiento, codigo o agentes; es exclusivamente un modelo de generacion de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-korean1-sdxl-v1
- Modelo base SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento publico: https://huggingface.co/datasets/nekodeus/korean-top10-v2
- Herramienta de entrenamiento kohya-ss: https://github.com/kohya-ss/sd-scripts
- Libreria diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
