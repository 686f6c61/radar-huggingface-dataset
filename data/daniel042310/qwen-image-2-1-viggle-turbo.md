# daniel042310/Qwen-Image-2.1-viggle-turbo

## Resumen

Qwen-Image-2.1-viggle-turbo es una version destilada de pocos pasos del modelo de generacion y edicion de imagenes Qwen-Image-2.1 de Qwen (Alibaba). La crea Viggle y se distribuye principalmente como un adaptador LoRA que se carga en tiempo de ejecucion sobre el transformer base, de modo que el modelo completo (un Diffusion Transformer de 32 capas Single-Stream y unos 7,1 mil millones de parametros) pasa de necesitar 40 pasos de inferencia a solo 6 pasos, y ademas funciona sin classifier-free guidance (CFG).

El problema que resuelve es de coste y latencia: la destilacion reduce el tiempo de generacion aproximadamente un factor 5 respecto al modelo base, manteniendo una calidad muy cercana segun el propio autor. Incorpora tambien un modo de 9 pasos (7 pasos con el LoRA activo y 2 finales con el modelo base) para ganar detalle fino y precision en texto pequeno.

El repositorio analizado (daniel042310/Qwen-Image-2.1-viggle-turbo) es un reupload de la publicacion original de Viggle: cuenta con 19 descargas y 0 likes, fue creado el 14 de octubre de 2026 y ocupa 104,9 GB. Es relevante ahora porque permite desplegar un modelo de imagen-edicion de ultima generacion en GPUs de gama media mediante cuantizacion GGUF o fp8/int8, y porque se integra con ComfyUI a traves de workflows y nodos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de flujo, 32 capas Single-Stream (base Qwen-Image-2.1); turbo como LoRA sobre el transformer |
| Parametros totales | 7.115.124.736 (~7,1 B) en el componente de generacion visual |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolucion de salida tipica 1024x1024, `output_resolution=1024`) |
| Tipos de cuantizacion | bf16 (LoRA r256 y r128), int8_convrot, fp8_e4m3fn, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como `license: other`) |
| Formato de pesos | safetensors (LoRA y transformer fusionado), GGUF, formato peft |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un modelo unificado de generacion texto-a-imagen y edicion de imagenes de la familia Qwen, con 7B de parametros en su componente de generacion visual y 32 capas Single-Stream DiT. Sobre ese transformer, la version viggle-turbo aplica una destilacion "few-step" que se materializa en un adaptador LoRA (rank 256 en bf16, 1,3 GB; o rank 128, 0,7 GB), cargado en tiempo de ejecucion con `pipe.load_lora_weights`. Tambien se ofrecen variantes con el LoRA ya fusionado en el transformer base, en un fichero por formato (int8_convrot, fp8_e4m3fn y GGUF Q8_0/Q6_K/Q5_K_M/Q4_K_M), pensadas para ComfyUI.

No se especifica en la informacion disponible el numero de tokens ni la composicion del dataset de destilacion, ni si se emplearon tecnicas de RLHF o DPO (no aplicables de forma estandar a un modelo de difusion de este tipo). La innovacion tecnica principal es la destilacion a 6 pasos con `true_cfg_scale=1.0` (sin CFG) usando un schedule de sigmas fijo (`[1.0, 0.9375, 0.875, 0.75, 0.5, 0.25]`), y un modo de 9 pasos que combina el LoRA turbo con dos pasos finales del modelo base: al llegar al paso 7 se desactiva el LoRA (`disable_lora`) y el base recoge el resultado, reextrayendo la cache de claves/valores del texto y de las imagenes de referencia. La model card v0.3 (2026-09-29) indica que v0.2.1 sigue disponible y que la v0.3 no es una mejora estricta (menos grano y superficies mas limpias, a costa de textura fina algo mas suave).

## Capacidades

- Generacion de imagen texto-a-imagen a resoluciones de 1024x1024 (parametros `height` y `width`).
- Edicion de imagen guiada por instrucciones con 1 a 3 imagenes de referencia (`image=[...]`, orden que fija `<image1>`, `<image2>`, ...).
- Inferencia en pocos pasos: 6 pasos (modo estandar) o 9 pasos (modo mixto turbo + base).
- Funcionamiento sin classifier-free guidance (`true_cfg_scale=1.0`).
- Reproducibilidad mediante semilla (`torch.Generator`).
- Integracion con ComfyUI a traves de nodos personalizados y workflows texto-a-imagen y edicion incluidos en el repositorio.
- Soporte de cuantizacion int8, fp8 y GGUF para despliegue en VRAM reducida.
- No se documentan en la informacion disponible capacidades de vision de entrada, audio, tool calling ni agentes (no aplican a un modelo de difusion de imagen).

## Casos de uso

- Generacion de imagenes en produccion de bajo coste: con 6 pasos y sin CFG, el coste por imagen baja cerca de un factor 5 respecto al modelo base a 40 pasos, lo que permite servir lotes grandes de imagenes a 1024x1024 con menos GPU.
- Edicion por instrucciones en herramientas creativas: acepta de 1 a 3 imagenes de referencia y una instruccion ("Replace the background with a sunset beach, keep the subject unchanged"), por lo que sirve para retoques guiados sin mascaras manuales.
- Prototipado rapido en ComfyUI: los workflows incluidos (`qwenImage21ViggleTurbo_v10`) y los nodos personalizados permiten iterar en la interfaz sin escribir codigo.
- Catalogos de e-commerce: generacion y edicion de imagenes de producto a resolucion estandar con multiples referencias para mantener coherencia del sujeto.
- Iteracion creativa en estudio: generacion masiva de variaciones con semilla reproducible para seleccion de conceptos antes de un render final.
- Despliegue local en GPU de gama media: mediante GGUF Q4_K_M o Q5_K_M el modelo cabe en GPUs consumer de 8-12 GB, habilitando generacion de imagenes en local sin depender de servicios en la nube.
- Demo interactiva web: se puede montar sobre el Space oficial (pestana Comparison) para comparar turbo frente al modelo base con los mismos prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos aportados por el autor son comparativos de velocidad (aproximadamente 5x mas rapido que el modelo base a 40 pasos en modo de 6 pasos, y aproximadamente 3,5x en modo de 9 pasos) y cualitativos (calidad cercana al base, con peor precision en texto pequeno y en ediciones complejas).

## Requisitos de hardware

- VRAM estimada para el transformer en bf16: ~14,2 GB solo de pesos; con VAE, text encoder y activaciones, en torno a 18-22 GB en total.
- VRAM estimada en fp8 (e4m3fn): ~7,1 GB de pesos, aproximadamente 10-12 GB en total.
- VRAM estimada en int8_convrot: del orden de 7-9 GB de pesos, ~10-12 GB en total.
- VRAM estimada en GGUF: Q8_0 ~7,5 GB, Q6_K ~5,9 GB, Q5_K_M ~5,0 GB, Q4_K_M ~4,4 GB de pesos (mas overhead del runtime).
- El adaptador LoRA en bf16 ocupa 1,3 GB (r256) o 0,7 GB (r128) adicionales sobre el transformer base cuando se carga en tiempo de ejecucion.
- GPU recomendadas: A100 40 GB o H100 para bf16 a 1024; RTX 4090 (24 GB) para bf16/fp8; RTX 3090, 4080 o 4070 Ti Super para fp8/int8; RTX 3060 12 GB, 4060 Ti 16 GB o 4070 para GGUF Q4_K_M/Q5_K_M.
- Cabe en GPU consumer: si, tanto en bf16 en tarjetas de 24 GB como en formato cuantizado en tarjetas de 8-12 GB.
- Opciones de despliegue: diffusers (requiere una version de git concreta porque `QwenImage21Pipeline` aun no esta en release estable), peft para cargar el LoRA, y ComfyUI con los nodos y workflows incluidos (incluye variantes GGUF). No aplica vLLM ni llama.cpp al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en cifras absolutas; el autor solo indica la mejora relativa de aproximadamente 5x (6 pasos) y aproximadamente 3,5x (9 pasos) frente al modelo base de 40 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de inferencia | CFG | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1 (base) | ~7,1 B (32 capas Single-Stream DiT) | 40 | si | qwen-research | Referencia de calidad; edicion y generacion unificadas |
| Qwen-Image-2.1-viggle-turbo (v0.3) | ~7,1 B + LoRA (r256/r128) | 6 (o 9 con modo mixto) | no | qwen-research | Destilado del anterior; ~5x mas rapido en 6 pasos |
| Qwen-Image-2.1-viggle-turbo (v0.2.1) | ~7,1 B + LoRA | 6 | no | qwen-research | Version previa, aspecto mas nitido segun el autor |
| Alternativas de pocos pasos de otros proveedores (por ejemplo, modelos turbo/schnell de la familia FLUX.1) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | No comparados en la model card; datos externos no verificados en esta ficha |

No se dispone en la informacion consultada de comparativas cuantitativas contra otros modelos de la misma categoria (benchmarks, FID, CLIP score), por lo que la comparacion se limita al modelo base y a las versiones del propio turbo.

## Limitaciones y advertencias

- Licencia `qwen-research`: es una licencia de investigacion, no una licencia permisiva; conviene revisar el fichero LICENSE antes de cualquier uso comercial, ya que puede restringirlo.
- Alucinacion en texto: el autor reconoce peor precision en texto denso y pequeno que el modelo base; el modo de 9 pasos mejora este punto pero "no siempre".
- Ediciones complejas: la model card indica que las brechas mas claras frente al base son el texto pequeno y las ediciones complicadas.
- Compromiso grano/suavidad: la v0.3 no es una mejora estricta sobre v0.2.1 (menos grano, superficie mas limpia, textura fina mas suave).
- Techo de calidad a 6 pasos: segun el autor, 6 pasos esta cerca de su capacidad; mas calidad exige mas pasos.
- Restriccion de compatibilidad: `QwenImage21Pipeline` no esta en una release estable de diffusers; hace falta instalar desde un commit concreto de git y `peft`. Requiere `transformers>=5.17,<6`.
- El modo de 9 pasos solo funciona en diffusers y en el Space de demostracion, no en ComfyUI.
- Trazabilidad: el repositorio consultado es un reupload (cuenta daniel042310) con 19 descargas y 0 likes; para uso serio conviene verificar contra el repositorio original de Viggle.
- Tamano del repositorio elevado (104,9 GB) por incluir todas las versiones y formatos; conviene descargar solo el fichero necesario.
- Idiomas: no se especifica soporte multilingue de los prompts en la informacion disponible.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/daniel042310/Qwen-Image-2.1-viggle-turbo
- Ficheros del repositorio: https://huggingface.co/daniel042310/Qwen-Image-2.1-viggle-turbo/tree/main
- Repositorio original (organizacion Viggle): https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Demo Space (pestana Comparison): https://huggingface.co/spaces/Viggle/Qwen-Image-2.1-viggle-turbo
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Ficha en Civitai: https://civitai.com/models/2990068/qwen-image-21-viggle-turbo
- Workflows de ComfyUI en CivArchive: https://civarchive.com/models/2990111
- Diffusers (instalacion fijada a un commit concreto): https://github.com/huggingface/diffusers
