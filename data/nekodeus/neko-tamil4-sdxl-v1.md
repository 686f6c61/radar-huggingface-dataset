# Nekodeus/neko-tamil4-sdxl-v1

## Resumen

Neko-tamil4-sdxl-v1 es un LoRA de personaje para Stable Diffusion XL, publicado por el usuario Nekodeus en Hugging Face. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que se aplica sobre `stabilityai/stable-diffusion-xl-base-1.0` para especializar la generacion de imagenes en el rostro de una persona concreta, identificada en la model card como el actor Suriya. El adaptador se activa mediante el token disparador `tamil4` y esta pensado para generacion text-to-image a 1024 px.

El repositorio tiene un tamano de 0,2 GB, lo que es coherente con un LoRA de dimension 16 aplicado unicamente al UNet de SDXL. La licencia declarada es Apache 2.0 y el formato de pesos es safetensors (`tamil4.safetensors`), cargable tanto desde `diffusers` como desde ComfyUI. El modelo se publico el 17 de noviembre de 2026 y, en el momento de redactar esta ficha, cuenta con 0 descargas y 1 like, por lo que se trata de un artefacto de reciente creacion y escasa validacion por parte de la comunidad.

Su relevancia es acotada: forma parte de un conjunto denominado "Tamil Top-10" del mismo autor y resulta util como ejemplo de pipeline de entrenamiento de LoRA de personaje reproducible en hardware modesto (Kaggle GPU, 1500 pasos, precision fp16 con gradient checkpointing). No aporta innovaciones arquitectonicas ni capacidades nuevas respecto a SDXL base; su interes es practico y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion XL (difusion latente, transformer convolutional) |
| Parametros totales | no disponible (adaptador de dimension 16 sobre UNet; repo de 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolucion de entrenamiento 1024 px, buckets 256-2048) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite fp16/fp32) |
| Idiomas soportados | no disponible (los prompts de texto dependen del codificador de texto de SDXL base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`tamil4.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 16 aplicado exclusivamente al UNet de SDXL. Se entreno con la herramienta `kohya-ss/sdxl_train_network.py`, a resolucion 1024 px con bucketing entre 256 y 2048 px, durante 1500 pasos, con learning rate 1e-4, optimizador Adafactor, batch size 1, precision fp16, gradient checkpointing y atencion sdpa. El entrenamiento se ejecuto en una GPU de Kaggle, de forma completamente offline y sin tokens de API.

El dataset consta de 75 imagenes curadas de Suriya, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme del tipo `a photo of tamil4 person`. El autor indica que forma parte del conjunto "Tamil Top-10" y que el dataset publico asociado es `nekodeus/tamil-top10-v2`, en la subcarpeta `tamil4/`. No se documenta el uso de regularizacion por clase, tecnicas de debiasing, ni etapas de refinamiento o RLHF (no aplicables en este tipo de adaptadores). La innovacion tecnica es nula: se trata de un entrenamiento estandar de LoRA de personaje con un dataset pequeno y captions homogeneos, lo que limita la variabilidad de poses y estilos aprendidos.

## Capacidades

- Generacion text-to-image de retratos y escenas que incluyen el rostro del personaje objetivo, condicionada por el token `tamil4`.
- Personalizacion de identidad sobre SDXL base sin reentrenar el modelo completo.
- Compatibilidad con el ecosistema `diffusers` mediante `load_lora_weights`.
- Compatibilidad con ComfyUI colocando `tamil4.safetensors` en `models/loras/` y usando un nodo LoRA loader.
- Composicion con otros LoRA y con el prompt negativo propio de SDXL (no documentado en la model card).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es exclusivamente un adaptador de generacion de imagenes.
- Capacidades multilingues: no documentadas; la comprension de prompts depende del codificador de texto de SDXL base.

## Casos de uso

- Generacion de retratos de estudio: con el prompt `tamil4 Suriya, portrait photo, studio lighting` a 1024x1024 se obtienen imagenes del personaje con iluminacion controlada, adecuadas para pruebas de concepto de identidad.
- Prototipado de arte conceptual para producciones audiovisuales: el LoRA permite iterar rapidamente sobre variaciones de vestuario y encuadre del personaje sin entrenar un modelo desde cero.
- Creacion de avatares y material promocional de fans: util para generar ilustraciones consistentes del actor en distintos estilos, siempre que se respeten los derechos de imagen.
- Pruebas de pipelines de difusion: sirve como caso de test para validar la carga de LoRA en `diffusers` o ComfyUI antes de desplegar adaptadores mas complejos.
- Experimentacion academica con LoRA de personaje: el repositorio documenta hiperparametros y dataset, lo que facilita reproducir el entrenamiento en entornos con recursos limitados.
- Generacion de variaciones de identidad para estudios de sesgo: permite analizar como un dataset de 75 imagenes condiciona la diversidad de poses, edades y expresiones generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud facial, etc.) ni comparaciones con otros LoRA de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un coste marginal sobre SDXL base; se necesita el modelo base completo en memoria (aproximadamente 6-8 GB en fp16 para el pipeline, mas overhead de activaciones).
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para generacion a 1024 px con margen; GPUs con 8-12 GB pueden funcionar con atencion eficiente o fp16.
- Cabe en GPUs de consumo: si, en RTX 3060 12 GB, RTX 4070 y superiores, con posible uso de `enable_model_cpu_offload` o `enable_vae_slicing` en tarjetas de 8 GB.
- Opciones de despliegue: `diffusers` (recomendado por el autor), ComfyUI, Automatic1111/Forge mediante carga de LoRA, y cualquier frontend compatible con safetensors de SDXL.
- Latencia y throughput estimados: no disponibles; dependen enteramente del hardware y del sampler utilizado con SDXL base.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Neko-tamil4-sdxl-v1 | LoRA de personaje | SDXL 1.0 | no disponible (dim 16, UNet) | 1024 px | Apache 2.0 | Hugging Face, 0 descargas |
| Otros LoRA de personaje SDXL (genericos) | LoRA de personaje | SDXL 1.0 | variable (dim 4-128) | 1024 px | variable | Amplia en Hugging Face y Civitai |
| SDXL base 1.0 | Modelo fundacional | - | ~3,5 B (UNet + text encoders) | 1024 px | CreativeML Open RAIL++-M | Hugging Face, ampliamente usado |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas de la misma categoria; la comparacion se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Dataset muy reducido (75 imagenes) y captions uniformes, lo que puede provocar sobreajuste a poses, iluminaciones y encuadres presentes en el conjunto de entrenamiento.
- Riesgo de alucinacion visual y de deriva de identidad cuando el prompt se aleja de los retratos de estudio; no hay metricas publicadas que cuantifiquen la fidelidad facial.
- Solo se entreno el UNet; el codificador de texto no se adapta, por lo que la comprension de prompts depende integramente de SDXL base.
- No hay informacion sobre sesgos demograficos, de genero o de edad del dataset; el conjunto de 75 imagenes puede no representar la diversidad real del personaje.
- La licencia Apache 2.0 del adaptador no exime del cumplimiento de derechos de imagen del actor retratado ni de las condiciones de uso del modelo base SDXL (CreativeML Open RAIL++-M), que impone restricciones adicionales sobre usos prohibidos.
- Uso comercial: la licencia del adaptador lo permite, pero la generacion de imagenes de una persona real requiere consentimiento y puede infringir derechos de publicidad segun la jurisdiccion.
- Sin validacion de la comunidad (0 descargas, 1 like) y publicacion muy reciente; no se recomienda para produccion sin evaluacion previa.
- No se documentan prompts negativos recomendados ni pesos de LoRA optimos, lo que obliga a ajustar manualmente la escala del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-tamil4-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset publico asociado: https://huggingface.co/datasets/nekodeus/tamil-top10-v2
- Herramienta de entrenamiento: https://github.com/kohya-ss/sd-scripts
- Documentacion de `diffusers` para LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
