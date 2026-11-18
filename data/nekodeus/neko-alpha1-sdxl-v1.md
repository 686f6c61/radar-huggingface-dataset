# Nekodeus/neko-alpha1-sdxl-v1

## Resumen

`Nekodeus/neko-alpha1-sdxl-v1` es una LoRA de personaje para Stable Diffusion XL, entrenada por el usuario Nekodeus sobre el modelo base `stabilityai/stable-diffusion-xl-base-1.0`. Su objetivo es reproducir el rostro y la apariencia de la celebridad Chris Hemsworth en generaciones de texto a imagen, activandose mediante el token disparador `alpha1`. No es un modelo generativo autonomo, sino un adaptador de bajo rango que debe cargarse sobre el UNet del modelo base SDXL.

El adaptador se entrena a 1024 px durante 1500 pasos con rango 8 (algunos conjuntos con rango 16), learning rate 1e-4, optimizador Adafactor y batch de 2, sobre un conjunto de aproximadamente 100 imagenes curadas y verificadas facialmente con OpenCV. El repositorio ocupa 0,2 GB y contiene los pesos en formato `safetensors` junto con imagenes de muestra del conjunto de entrenamiento.

Es relevante dentro del ecosistema de personalizacion de difusion por su enfoque reproducible y totalmente offline (entrenado en GPU de Kaggle sin servicios externos), y forma parte de una serie de LoRAs de celebridades de Hollywood publicadas por el mismo autor tanto para SDXL como para SD 1.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion XL |
| Parametros totales | no disponible (adaptador LoRA; el modelo base SDXL tiene ~2.600 M en UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion texto-imagen, sin contexto de texto autoregresivo) |
| Tipos de cuantizacion | no disponible (pesos LoRA en safetensors; compatible con fp16/fp32 del pipeline base) |
| Idiomas soportados | no disponible (prompts en ingles en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`alpha1.safetensors`) |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| Resolucion de entrenamiento | 1024 px |
| Rango / alpha de la LoRA | 8 / 8 (algunos conjuntos 16 / 16) |
| Pasos de entrenamiento | 1500 |
| Learning rate | 1e-4 |
| Optimizador | Adafactor, batch 2 |
| Hardware de entrenamiento | NVIDIA P100 (Kaggle) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La LoRA se aplica sobre el UNet de Stable Diffusion XL, un modelo de difusion latente con arquitectura transformer convolucional y doble bloque de atencion (texto e imagen). El adaptador inyecta matrices de bajo rango en las capas del UNet para especializar la generacion hacia el rostro del sujeto, manteniendo congelados los pesos del modelo base. Se entrena a 1024 px, la resolucion nativa de SDXL, con atencion `sdpa`.

El conjunto de datos consta de aproximadamente 100 imagenes curadas de Chris Hemsworth, verificadas facialmente con OpenCV y etiquetadas con un pie de foto uniforme (`a photo of alpha1 person`). El entrenamiento se realizo de forma completamente offline y sin tokens en una GPU NVIDIA P100 de Kaggle, con 1500 pasos, Adafactor y batch 2. El dataset publico asociado es `nekodeus/alpha1-chris-hemsworth`. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa, ya que no aplican a un modelo de difusion.

## Capacidades

- Generacion de imagenes de texto a imagen condicionada por el token `alpha1` para representar a Chris Hemsworth.
- Personalizacion de personaje sobre SDXL: el adaptador modifica la identidad facial sin reentrenar el modelo base.
- Compatibilidad con el pipeline `StableDiffusionXLPipeline` de la libreria `diffusers` mediante `load_lora_weights`.
- Integracion en ComfyUI colocando `alpha1.safetensors` en `models/loras/` y usando un nodo LoRA loader.
- Generacion a resolucion 1024x1024 con el modelo base SDXL.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de texto; es exclusivamente un adaptador de difusion texto-imagen.
- Capacidades multilingues no documentadas; los ejemplos de la model card estan en ingles.

## Casos de uso

- Retratos fotorrealistas de personaje: usar el prompt `alpha1 Chris Hemsworth, portrait photo, studio lighting` para generar retratos con iluminacion de estudio a 1024 px, aprovechando la especializacion facial de la LoRA.
- Previsualizacion de casting o storyboard: generar variaciones de un actor concreto para explorar encuadres y estilos antes de una produccion, cargando la LoRA sobre SDXL en `diffusers`.
- Creacion de contenido para fans y divulgacion: ilustraciones o montajes tematicos del actor para blogs y redes, siempre respetando derechos de imagen y la licencia Apache 2.0 del adaptador.
- Prototipado de pipelines de personalizacion: servir como ejemplo reproducible de entrenamiento de LoRA de personaje en hardware modesto (P100 de Kaggle) para equipos que quieran replicar el flujo.
- Integracion en flujos ComfyUI: incorporar el nodo LoRA loader en grafos de generacion por lotes para producir sets de imagenes coherentes del mismo personaje.
- Experimentacion con fuerza de LoRA: ajustar el peso del adaptador (por ejemplo, entre 0,6 y 1,0) para controlar el grado de fidelidad al rostro frente a la estetica del modelo base.
- Base para fine-tuning posterior: partir de este adaptador como inicializacion para entrenar variantes de estilo o vestuario sobre el mismo personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pipeline SDXL completo en fp16 requiere aproximadamente 8-10 GB de VRAM; la LoRA anade un coste marginal (repo de 0,2 GB).
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para generacion a 1024 px con buena latencia; RTX 3090 y RTX 4080 tambien son suficientes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti) usando fp16 y, si es necesario, `enable_model_cpu_offload` o `enable_vae_slicing`.
- Opciones de despliegue: `diffusers` (StableDiffusionXLPipeline con `load_lora_weights`), ComfyUI, Automatic1111/Forge y otros frontends compatibles con LoRA SDXL en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del modelo base SDXL y de la GPU, no del adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-alpha1-sdxl-v1 | LoRA de personaje | SDXL 1.0 | no disponible (adaptador) | no aplica | Apache 2.0 | Hugging Face |
| Nekodeus/neko-hollywood-alpha-sdxl-v1 | LoRA de personaje (serie) | SDXL 1.0 | no disponible (adaptador) | no aplica | no disponible en la informacion | Hugging Face |
| Nekodeus/neko-hollywood-alpha-sd15-v1 | LoRA de personaje (serie) | SD 1.5 | no disponible (adaptador) | no aplica | no disponible en la informacion | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base texto-imagen | — | ~2.600 M (UNet) | no aplica | CreativeML Open RAIL++-M | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un unico sujeto con ~100 imagenes, el adaptador puede reproducir sesgos de iluminacion, encuadre y estilo del conjunto de entrenamiento.
- Riesgo de sobreajuste: con solo 1500 pasos y un dataset pequeno, la LoRA puede generar el rostro de forma rigida o degradar la composicion cuando se usa con fuerza alta.
- Fidelidad limitada fuera del dominio: prompts muy alejados de retratos pueden producir resultados inconsistentes o mezclar la identidad con la estetica del modelo base.
- Limitaciones de idioma: no hay evidencia de soporte multilingue; los prompts de ejemplo estan en ingles.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el modelo base SDXL se rige por CreativeML Open RAIL++-M, cuyas clausulas de uso deben respetarse.
- Derechos de imagen: la generacion de la imagen de una persona real puede vulnerar derechos de publicidad o intimidad segun la jurisdiccion; el uso comercial del rostro de una celebridad requiere autorizacion.
- Caveat para produccion: no se documentan metricas de calidad ni evaluaciones objetivas; conviene validar la fidelidad y la coherencia antes de desplegarlo en un pipeline automatizado.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-alpha1-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/alpha1-chris-hemsworth
- Serie Hollywood alpha SD 1.5: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- Serie Hollywood alpha SDXL: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sdxl-v1
