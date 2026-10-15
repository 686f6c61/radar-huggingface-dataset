# cukrus/FLUX.2-klein-4B-bnb-nf4

## Resumen

FLUX.2-klein-4B-bnb-nf4 es una cuantizacion en 4 bits (bitsandbytes NF4) del modelo de generacion y edicion de imagenes FLUX.2-klein-4B de Black Forest Labs, publicada por el usuario cukrus. El repositorio contiene la pipeline completa en formato diffusers (`Flux2KleinPipeline`) con el transformer y el codificador de texto Qwen3-4B cuantizados a NF4 con doble cuantizacion y calculo en bf16, mientras que el VAE y el scheduler se mantienen sin cambios. El objetivo declarado es reducir el consumo de memoria de aproximadamente 16 GB en bf16 a unos 5,1 GB, de modo que la pipeline pueda ejecutarse en dispositivos con memoria unificada de 8 GB como la Jetson Orin Nano.

El modelo cubre dos tareas: edicion de imagenes con 1 a 3 imagenes de referencia (image-to-image) y generacion texto-a-imagen. Esta pensado para funcionar junto a un servicio remoto de codificador de texto (`qwen3-4b-remote-text-encoder`), de forma que en la GPU solo residan el transformer y el VAE (unos 2,5 GB), aunque tambien admite la pipeline completa con el codificador NF4 en memoria (pico medido de 5,42 GB a 1024 px).

Su relevancia actual es practica: permite desplegar un modelo de edicion de imagenes de la familia FLUX.2 en hardware de borde y en GPU de consumo, con una perdida de fidelidad medida frente a bf16 (PSNR de 24,5 dB en edicion y 21,0 dB en texto-a-imagen). El recuento de parametros de safetensors del repositorio es de 2.093.070.619 y el tamano del repo es de 2,5 GB, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion FLUX.2-klein (base black-forest-labs/FLUX.2-klein-4B) con modulacion double-stream (imagen/texto) y single-stream, mas codificador de texto Qwen3-4B; VAE y scheduler del modelo base |
| Parametros totales | 2.093.070.619 (recuento de safetensors del repositorio) |
| Longitud de contexto | No aplica en el sentido de contexto de texto; los `prompt_embeds` esperados son de forma (1, 512, 7680), es decir 512 tokens de codificador de texto (estados ocultos 9, 18 y 27 de Qwen3-4B apilados). Cada imagen de referencia anade tantos tokens como la salida (1024 px = 4096 tokens) |
| Tipos de cuantizacion | NF4 con doble cuantizacion y calculo en bf16 (4 bits); tambien se documenta una variante en 8 bits entre las etiquetas del repositorio; el VAE y el scheduler no se cuantizan |
| Idiomas soportados | no disponible (la model card no especifica idiomas; el codificador de texto es Qwen3-4B) |
| Licencia | Apache-2.0 (la misma que FLUX.2-klein-4B) |
| Formato de pesos | safetensors (biblioteca diffusers, cargable con `Flux2KleinPipeline.from_pretrained`) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una conversion de pesos del modelo base `black-forest-labs/FLUX.2-klein-4B` (commit `e7b7dc27f91d`). La cuantizacion se aplica al transformer y al codificador de texto Qwen3-4B con NF4, doble cuantizacion y computo en bf16. Se mantienen en bf16 (unos 0,37 GB) las capas sensibles del transformer: `x_embedder`, `context_embedder`, `time_guidance_embed`, `double_stream_modulation_img`, `double_stream_modulation_txt`, `single_stream_modulation`, `norm_out` y `proj_out`. En el codificador de texto se cuantizan las 252 capas lineales de atencion y MLP, dejando en bf16 los embeddings y el `lm_head` atado.

El proceso de conversion esta documentado mediante dos scripts (`klein-quantize.py` para el transformer y `klein-te-quantize.py` para el codificador de texto) que re-fragmentan el modelo original en shards de 1 GB antes de cuantizar, de modo que el pico de memoria durante la conversion se mantiene en torno a 2,2-2,5 GB y ambos scripts pueden ejecutarse en una Jetson de 8 GB. No se proporciona informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni sobre etapas de RLHF o DPO; la model card solo describe el proceso de cuantizacion y su validacion numerica.

Como validacion de fidelidad se comparan renderizados con la misma semilla, ruido inicial y embeddings de prompt en NF4 y bf16. Para el transformer se reportan PSNR de 24,5 dB y diferencia absoluta media de 9,2/255 en la edicion "coche a rojo", y 21,0 dB y 15,3/255 en texto-a-imagen ("zorro"). Para el codificador de texto se reportan similitudes coseno de 0,998, 0,995 y 0,999 con L2 relativo de 0,091, 0,121 y 0,085 en tres prompts distintos.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a 1024 px con 4 pasos de inferencia y `guidance_scale=1.0`.
- Edicion de imagenes guiada por instrucciones en lenguaje natural (image-to-image), con 1 hasta 3 imagenes de referencia en una misma llamada.
- Edicion con preservacion del resto de la escena: los ejemplos documentados incluyen "cambiar la pintura del coche a rojo brillante manteniendo todo lo demas igual" y "anadir un golden retriever sentado en la acera junto al coche".
- Transformaciones de estilo global, por ejemplo convertir una fotografia en una acuarela suelta.
- Ejecucion sin codificador de texto en la GPU: la pipeline acepta `text_encoder=None, tokenizer=None` y `prompt_embeds` precalculados de forma (1, 512, 7680), lo que habilita el desacoplamiento del codificador en otra maquina.
- Compatibilidad con VAE tiling para resoluciones de 1024 px en memoria reducida (`tile_sample_min_size=512`, `tile_latent_min_size=64`).
- Soporte de cuantizacion adicional de 8 bits segun las etiquetas del repositorio (ademas de NF4).
- No se documentan capacidades de tool calling, function calling, agentes, audio, vision de entrada para descripcion o modos de razonamiento explicito ("thinking"); el codificador de texto se usa con el modo thinking desactivado.

## Casos de uso

- Edicion fotografica asistida en escritorio: cambiar el color de un objeto, anadir o quitar elementos o modificar el estilo de una foto con instrucciones en lenguaje natural, usando las 1-3 imagenes de referencia y 4 pasos de inferencia para obtener resultados en pocos segundos en una GPU de consumo.
- Generacion de imagenes de producto en comercio electronico: crear variantes de un articulo (color, fondo, contexto de uso) a partir de una foto de referencia, manteniendo el resto de la escena, con un pico de 5,42 GB en texto-a-imagen a 1024 px, asumible en una GPU de 8-12 GB.
- Prototipado y previsualizacion de arte conceptual: iterar prompts de texto-a-imagen a 1024 px en 4 pasos, con tiempos medidos de 24,9 s de denoising en una Jetson Orin Nano 8GB, adecuado para ciclos de exploracion sin depender de servicios en la nube.
- Despliegue en borde (edge) sobre Jetson Orin Nano 8GB: ejecucion con el codificador de texto en una maquina separada y solo transformer y VAE en la GPU (~2,5 GB), con 37,2 s totales para texto-a-imagen a 1024 px y 57,9 s para edicion con referencia a 1024 px.
- Servicio interno de edicion de imagenes con codificador remoto: exponer la pipeline en un servidor modesto y alojar `qwen3-4b-remote-text-encoder` en otra maquina, reduciendo la VRAM necesaria en el nodo de inferencia y permitiendo compartir el codificador entre varias instancias.
- Retoque por lotes de catalogos de imagenes: aplicar una misma instruccion de estilo (por ejemplo, acuarela o correccion de color) a muchas imagenes, aprovechando que cada referencia anade tokens de forma lineal y que el VAE tiled permite operar a 1024 px sin agotar memoria.
- Demostraciones y talleres sobre cuantizacion de modelos de difusion: el repositorio incluye los scripts de conversion y las tablas de fidelidad NF4 frente a bf16, utiles para ilustrar el compromiso entre memoria y calidad en modelos de difusion de 4B.
- Evaluacion comparativa de cuantizaciones en investigacion: usar los valores de PSNR y similitud coseno publicados como linea base para estudiar el impacto de NF4 en transformers de difusion multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes; no aplican a un modelo de generacion de imagenes). Lo que si se publica es una comprobacion de fidelidad frente a la version bf16 del mismo modelo con la misma semilla, ruido inicial y embeddings de prompt.

Transformer (misma semilla, mismo ruido inicial):

| Caso | PSNR | Diferencia absoluta media |
|---|---|---|
| Edicion, coche a rojo | 24,5 dB | 9,2 / 255 |
| Texto-a-imagen, zorro | 21,0 dB | 15,3 / 255 |

Codificador de texto (embeddings NF4 frente a bf16, mismo transformer NF4 y misma semilla):

| Caso | Similitud coseno | L2 relativo |
|---|---|---|
| Texto-a-imagen, zorro | 0,998 | 0,091 |
| Edicion, coche a rojo | 0,995 | 0,121 |
| Edicion, acuarela | 0,999 | 0,085 |

Rendimiento medido en Jetson Orin Nano 8GB (JetPack 7.2, CUDA 13.2, torch 2.12.1+cu132, diffusers 0.39; 1024x1024, 4 pasos, VAE con tiling a 512 px, codificador de texto bf16 en otra maquina):

| Tarea | Referencia | Denoising | Total | Pico de torch | RAM de sistema libre (minimo) |
|---|---|---|---|---|---|
| Texto-a-imagen | - | 24,9 s | 37,2 s | 2,95 GB | 2,54 GB |
| Edicion | 512 px | 31,1 s | 43,5 s | 3,09 GB | 2,37 GB |
| Edicion | 768 px | 39,6 s | 44-52 s | 3,25 GB | 1,83-2,26 GB |
| Edicion | 1024 px | 52,2 s | 57,9 s | 3,46 GB | 1,85 GB |

El tiempo total incluye unos 8 s de codificacion para un prompt nuevo. Con el codificador NF4 residente en la propia placa, la generacion texto-a-imagen a 1024 px tarda 31,1 s, pero la RAM de sistema libre cae a 0,08 GB, lo que el autor describe como demasiado ajustado para servir en 8 GB de memoria unificada.

## Requisitos de hardware

- Memoria del transformer y el VAE en NF4: ~2,5 GB (transformer NF4 2,29 GB + VAE 168 MB). Es el modo recomendado para GPUs pequenas, con el codificador de texto en otra maquina.
- Pipeline completa en NF4: ~5,1 GB (transformer 2,29 GB + codificador de texto Qwen3-4B NF4 2,65 GB + VAE 168 MB). Pico de GPU medido de 5,42 GB para texto-a-imagen a 1024 px.
- Pipeline completa en bf16 (referencia del modelo base): ~16 GB (transformer 7,75 GB + codificador de texto 8,05 GB + VAE 168 MB).
- Caben en GPU de consumo: si, con NF4. El pico de 5,42 GB permite GPUs de 8 GB (por ejemplo, RTX 3060 Ti/4060/4070 de 8 GB) y con margen en 12 GB o mas. Tambien se ha validado en Jetson Orin Nano 8GB de memoria unificada.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. La validacion publicada es en Jetson Orin Nano 8GB (capacidad de computo 8.7, requiere compilar bitsandbytes con `-DCOMPUTE_CAPABILITY=87`). En escritorio, cualquier GPU con soporte de kernels de bitsandbytes y al menos 6-8 GB de VRAM deberia ser suficiente para el modo NF4.
- Opciones de despliegue: `diffusers` 0.37+ con `Flux2KleinPipeline` y `bitsandbytes`. En Jetson se indica diffusers 0.39. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio (no aplican de forma estandar a una pipeline de difusion de diffusers).
- Modo sin codificador de texto: cargar con `text_encoder=None, tokenizer=None` y pasar `prompt_embeds` de forma (1, 512, 7680); requiere un servicio externo, como `qwen3-4b-remote-text-encoder`.
- VAE tiling: necesario para 1024 px en memoria reducida (`pipe.vae.enable_tiling()`, `tile_sample_min_size=512`, `tile_latent_min_size=64`; el valor por defecto de 1024 no tilea una imagen de 1024 px).
- Latencia y throughput: 37,2 s para texto-a-imagen a 1024 px y 57,9 s para edicion con referencia a 1024 px en Jetson Orin Nano 8GB, con el codificador remoto. Con 4 pasos de inferencia y `guidance_scale=1.0` (los valores por defecto de 50 pasos y 4.0 corresponden al modelo base y no deben usarse aqui).
- Memoria de conversion: los scripts de cuantizacion re-fragmentan en shards de 1 GB y mantienen un pico de 2,2-2,5 GB, por lo que la propia conversion puede hacerse en una Jetson de 8 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Memoria de pipeline | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cukrus/FLUX.2-klein-4B-bnb-nf4 | 2.093.070.619 (safetensors del repo) | NF4, doble cuantizacion, computo bf16 | ~5,1 GB completo; ~2,5 GB sin codificador | `prompt_embeds` (1, 512, 7680) | Apache-2.0 | HuggingFace, diffusers |
| black-forest-labs/FLUX.2-klein-4B (base, bf16) | No disponible en la informacion proporcionada | bf16 | ~16 GB | `prompt_embeds` (1, 512, 7680) | Apache-2.0 | HuggingFace, diffusers |
| Otras cuantizaciones o modelos de edicion de imagen comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos concretos disponible es frente al modelo base en bf16: la version NF4 reduce la memoria total de ~16 GB a ~5,1 GB (transformer de 7,75 GB a 2,29 GB; codificador de texto de 8,05 GB a 2,65 GB) con la perdida de fidelidad recogida en la seccion de benchmarks.

## Limitaciones y advertencias

- La cuantizacion NF4 introduce una perdida de fidelidad medible frente a bf16: PSNR de 24,5 dB y 21,0 dB en los dos casos publicados, con diferencias absolutas medias de 9,2/255 y 15,3/255. No se han publicado metricas perceptuales ni evaluaciones humanas.
- El autor no documenta sesgos conocidos, riesgos de alucinacion visual, ni limitaciones de idioma del modelo. La informacion sobre composicion del dataset de entrenamiento del modelo base tambien esta ausente, por lo que no se puede evaluar el sesgo de los datos.
- Los parametros de inferencia correctos son `num_inference_steps=4` y `guidance_scale=1.0`. Los valores por defecto de la pipeline (50 pasos y 4.0) corresponden al modelo base y dan resultados incorrectos con esta variante.
- El modo sin codificador de texto exige `prompt_embeds` de forma (1, 512, 7680) con los estados ocultos 9, 18 y 27 de Qwen3-4B apilados, thinking desactivado y relleno por la derecha a 512 posiciones. Hay que conservar las posiciones de relleno porque no existe mascara de texto; un formateo incorrecto degrada el resultado.
- La VAE tiling es obligatoria en la practica para 1024 px en memoria reducida: los valores por defecto (`tile_sample_min_size=1024`) no tilean una imagen de 1024 px. Referencias por debajo de 1 MP son mas rapidas pero el encuadre se desvia ligeramente.
- Cada imagen de referencia anade tantos tokens como la salida (4096 tokens a 1024 px), de modo que el coste de memoria y de tiempo crece con cada referencia; el maximo documentado es de 3 imagenes.
- En una Jetson Orin Nano 8GB con el codificador NF4 residente, la RAM de sistema libre baja a 0,08 GB. El autor indica explicitamente que funciona pero es demasiado ajustado para servir en produccion con 8 GB de memoria unificada.
- Requiere `diffusers` 0.37 o superior y `bitsandbytes` con kernels compilados para la GPU objetivo; en Jetson hay que compilarlo desde fuente con `-DCOMPUTE_CAPABILITY=87`. Esto anade friccion de despliegue y riesgo de incompatibilidades de version.
- Licencia Apache-2.0, heredada de FLUX.2-klein-4B, sin restricciones adicionales documentadas para uso comercial. Aun asi, conviene verificar las condiciones de la licencia del modelo base antes de un despliegue comercial.
- Adopcion practicamente nula hasta la fecha del registro (0 descargas, 0 "likes"), lo que implica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cukrus/FLUX.2-klein-4B-bnb-nf4
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Servicio de codificador de texto remoto: https://github.com/Cukrus-directive/qwen3-4b-remote-text-encoder
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo, su arquitectura o su evaluacion; los resultados devueltos no guardan relacion con el contenido de la ficha.
