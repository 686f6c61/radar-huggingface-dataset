# sadaffatimaeee/naruto-sd15-run1-lora-r4-smoke-test

## Resumen

El modelo `sadaffatimaeee/naruto-sd15-run1-lora-r4-smoke-test` es un adaptador LoRA (Low-Rank Adaptation) de rango 4 entrenado sobre Stable Diffusion 1.5 para generar imagenes con estetica del anime Naruto. Lo desarrolla el usuario `sadaffatimaeee` en el contexto de un laboratorio docente (DATA 266 Lab 2, Part 2, Pair_Programming_Team_16) y esta pensado exclusivamente para investigacion y ensenanza no comercial. No es un modelo de lenguaje: es un adaptador de difusion texto-a-imagen que modifica unicamente las capas de atencion del UNet, manteniendo congelado el codificador de texto.

El adaptador se entrena sobre el dataset `lambdalabs/naruto-blip-captions` (1221 imagenes con leyendas BLIP tras el filtrado, divididas 90/10 con semilla 266) y resuelve un problema muy acotado: especializar un modelo base generico de 512x512 hacia un estilo visual concreto con un coste computacional minimo (797.184 parametros entrenables, 1,1 minutos en una Tesla T4). Su relevancia es fundamentalmente pedagogica y como ejemplo reproducible de un pipeline de fine-tuning LoRA con `diffusers`.

La nomenclatura "smoke-test" y "run1" indica que se trata de una ejecucion de prueba de solo 10 pasos de entrenamiento, no de un adaptador listo para produccion. El resultado es un modelo con capacidades generativas limitadas y sesgadas hacia el dominio de entrenamiento, documentado con metricas de evaluacion (KID, CLIP score, LPIPS) que reflejan un ajuste debil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (difusion latente, text-to-image) |
| Parametros totales | 797.184 parametros entrenables (adaptador LoRA); pesos del modelo base no incluidos en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de difusion texto-a-imagen) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precision de entrenamiento fp16) |
| Idiomas soportados | no disponible (las leyendas de entrenamiento estan en ingles) |
| Licencia | other (uso no comercial, solo investigacion y ensenanza) |
| Formato de pesos | safetensors via `diffusers` (repo de 0,0 GB) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 4 exclusivamente sobre las capas de atencion del UNet de Stable Diffusion 1.5, dejando congelado el text encoder. El modelo base opera a 512x512 con el pipeline estandar de difusion latente. El entrenamiento se realizo con el script `train_text_to_image_lora.py` de `diffusers`, con learning rate constante de 0,0001, batch efectivo de 4 (1 x 4 acumulacion de gradiente), precision fp16, gradient checkpointing y semilla 266. Se ejecutaron solo 10 pasos de optimizacion en una unica Tesla T4, con un pico de memoria GPU de 4,26 GB y un tiempo total de 1,1 minutos (0,018 GPU-horas).

Los datos de entrenamiento proceden de `lambdalabs/naruto-blip-captions`: 1221 imagenes con leyendas BLIP cortas (unas 9 palabras) tras el proceso de limpieza (0 corruptas, 0 duplicados eliminados), redimensionadas a 512x512 y divididas en 1099 de entrenamiento y 122 de test con semilla 266. No se menciona uso de RLHF, DPO ni tecnicas de preferencia; es un fine-tuning supervisado puro sobre pares imagen-texto. La innovacion tecnica destacable es la propia eleccion de LoRA de rango 4 para minimizar parametros entrenables, aunque el numero de pasos (10) es insuficiente para una convergencia real.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 con estetica de anime inspirada en Naruto.
- Especializacion de estilo sobre Stable Diffusion 1.5: el adaptador modula el UNet para aproximar el dominio visual del dataset de entrenamiento.
- No modifica el codificador de texto, por lo que hereda la comprension semantica del modelo base.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; las leyendas de entrenamiento estan en ingles.
- No dispone de modo thinking, vision, audio ni otras capacidades especiales mas alla de la generacion de imagen.
- Filtro de seguridad NSFW heredado del pipeline de Stable Diffusion: las imagenes generadas pasan por el safety checker.

## Casos de uso

- Docencia en fine-tuning de modelos de difusion: sirve como ejemplo reproducible y de bajo coste (0,018 GPU-horas) para ensenar el pipeline LoRA con `diffusers` en un aula o laboratorio.
- Prototipado rapido de adaptadores de estilo: permite validar la infraestructura de entrenamiento (dataset, script, hiperparametros) antes de lanzar ejecuciones con mas pasos y mayor rango.
- Investigacion sobre evaluacion de modelos generativos: las metricas publicadas (KID, CLIP score, LPIPS) permiten estudiar la relacion entre pasos de entrenamiento y calidad generativa en adaptadores de rango bajo.
- Experimentos de memorizacion y privacidad: el autor incluye una comprobacion de memorizacion (`memorization.png`) que puede reutilizarse para estudiar la fuga de imagenes de entrenamiento en LoRAs pequenos.
- Analisis de sesgos en datasets de anime: el sesgo documentado hacia personajes masculinos y la deriva estilistica fuera de dominio lo convierten en un caso de estudio util para investigar sesgos en datos BLIP-caption.
- Generacion de imagenes de caracterizacion estilistica en entornos controlados no comerciales: util para pruebas internas de pipelines de generacion con estetica anime, siempre que se respete la restriccion de uso no comercial.
- Benchmarking de herramientas de inferencia: permite comparar el comportamiento de distintos backends (diffusers, ComfyUI, A1111) al cargar un LoRA de rango 4 sobre SD 1.5.

## Benchmarks y rendimiento

Resultados publicados por el autor (20 prompts fijos, semillas 0 y 1, DPM-Solver con 25 pasos, guidance 7.5):

| Metrica | Valor |
|---|---|
| KID vs imagenes de test (prompts en dominio) | 0,2152 +/- 0,0471 |
| CLIP score global | 30,890 |
| CLIP score en dominio | 31,540 |
| CLIP score fuera de dominio | 30,230 |
| CLIP score composicional | no disponible |
| LPIPS de diversidad entre semillas | 0,7109 |

El autor advierte que el KID es ruidoso con tan pocas imagenes. No se han publicado comparaciones con otros adaptadores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento consumio 4,26 GB de pico en una Tesla T4; la inferencia del pipeline SD 1.5 con el LoRA cargado requiere aproximadamente 4-6 GB en fp16, y puede reducirse con `enable_attention_slicing` o `enable_model_cpu_offload`.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para inferencia comoda; Tesla T4, RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este adaptador.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090; tambien en GPUs de 8 GB con optimizaciones de memoria.
- Opciones de despliegue: `diffusers` (pipeline `StableDiffusionPipeline` con `load_lora_weights`), ComfyUI, Automatic1111 WebUI, InvokeAI; tambien es posible exportarlo a otros formatos mediante herramientas de conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento de 10 pasos tardo 1,1 minutos, pero no se publican tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| naruto-sd15-run1-lora-r4-smoke-test | 797.184 (LoRA) | no aplica | KID 0,2152; CLIP 30,89 | other (no comercial) | HuggingFace |
| Stable Diffusion 1.5 (base) | ~860 M (UNet) | no aplica | no disponible en esta ficha | CreativeML OpenRAIL-M | HuggingFace |
| Adaptadores LoRA de anime para SD 1.5 (genericos) | variable | no aplica | no disponible | variable | HuggingFace |

No se dispone de datos de benchmarks comparativos con otros adaptadores en la informacion proporcionada. La comparacion con el modelo base no es directa porque el adaptador solo modifica el UNet y no se han publicado metricas del base en las mismas condiciones.

## Limitaciones y advertencias

- Entrenamiento de solo 10 pasos: el adaptador no ha convergido y su efecto sobre el modelo base es muy limitado; la nomenclatura "smoke-test" lo confirma.
- Estilo anime estrecho: el adaptador solo cubre el dominio visual del dataset de Naruto; fuera de ese dominio las imagenes derivan hacia la estetica anime.
- Leyendas cortas y genericas (unas 9 palabras) que describen mayoritariamente personajes masculinos, lo que introduce sesgo de genero y de contenido.
- Los prompts composicionales (colores, posiciones, recuentos) a menudo no se siguen correctamente; el CLIP score composicional no esta disponible.
- Riesgo de memorizacion de imagenes de entrenamiento; el autor incluye una comprobacion (`memorization.png`) pero no cuantifica el riesgo.
- Restriccion de licencia: las imagenes de entrenamiento muestran personajes con copyright de Naruto, por lo que el adaptador es solo para investigacion no comercial. No apto para uso comercial.
- Las imagenes generadas pasan por el safety checker NSFW de Stable Diffusion, lo que puede filtrar contenido legitimo en algunos casos.
- No hay garantia de calidad ni de estabilidad entre ejecuciones; el KID es ruidoso con el tamano de test disponible (122 imagenes).
- No se declaran idiomas soportados; las leyendas estan en ingles, por lo que los prompts en otros idiomas pueden degradar el resultado.

## Enlaces

- HuggingFace: https://huggingface.co/sadaffatimaeee/naruto-sd15-run1-lora-r4-smoke-test
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Script de entrenamiento (`diffusers`): https://github.com/huggingface/diffusers/blob/main/examples/text_to_image/train_text_to_image_lora.py
- Documentacion de `diffusers`: https://huggingface.co/docs/diffusers
