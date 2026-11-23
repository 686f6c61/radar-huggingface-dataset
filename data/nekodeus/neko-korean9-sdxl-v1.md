# Nekodeus/neko-korean9-sdxl-v1

## Resumen

Neko Korean9 SDXL v1 es un adaptador LoRA de personaje para Stable Diffusion XL, publicado por el usuario Nekodeus en Hugging Face. El adaptador se entrena sobre `stabilityai/stable-diffusion-xl-base-1.0` para reproducir el rostro de Han So-hee, actriz surcoreana, a partir de un conjunto de 39 imagenes verificadas facialmente con OpenCV. Forma parte de un conjunto mayor denominado Korean Top-10, cuyo dataset publico es `nekodeus/korean-top10-v2`.

Tecnicamente es un LoRA de dimension de red 16 y alpha 16 aplicado unicamente al UNet, entrenado durante 1500 pasos a 1024 px con el script `sdxl_train_network.py` de kohya-ss, optimizador Adafactor, batch 1 y learning rate 1e-4. El repositorio ocupa aproximadamente 0,2 GB y se distribuye en formato `safetensors` compatible con diffusers y ComfyUI.

Su relevancia es acotada: no es un modelo fundacional sino un adaptador de nicho para generacion de retratos con identidad concreta. Resulta util para quienes necesiten un LoRA ligero de personaje sobre SDXL con licencia Apache 2.0, pero su valor practico depende de la calidad del dataset (39 imagenes) y de la ausencia de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion XL (difusion latente) |
| Parametros totales | no disponible (adaptador LoRA, no se indica recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible (pesos en fp16 durante entrenamiento; el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible (prompts en ingles segun ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`korean9.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 (dim 16, alpha 16) inyectado exclusivamente en las capas del UNet de SDXL. No modifica el text encoder. El entrenamiento se realizo a resolucion 1024 px con bucketing entre 256 y 2048, 1500 pasos, batch 1, learning rate 1e-4, optimizador Adafactor, precision fp16, gradient checkpointing y atencion sdpa. La herramienta empleada fue `sdxl_train_network.py` de kohya-ss sobre una GPU de Kaggle, en modo completamente offline.

El dataset consta de 39 imagenes de Han So-hee verificadas con OpenCV para asegurar la deteccion facial y etiquetadas con un caption uniforme (`a photo of korean9 person`). No se documenta uso de RLHF, DPO ni tecnicas de preferencia, algo esperable en un LoRA de difusion. La innovacion tecnica es minima: se trata de un entrenamiento estandar de LoRA de personaje con un token disparador (`korean9`).

## Capacidades

- Generacion text-to-image de retratos y escenas con la identidad de Han So-hee mediante el token `korean9`.
- Composicion de prompts en ingles con control de iluminacion, encuadre y estilo (el ejemplo de la model card usa `portrait photo, studio lighting`).
- Integracion con el pipeline `StableDiffusionXLPipeline` de diffusers mediante `load_lora_weights`.
- Uso en ComfyUI colocando el archivo en `models/loras/` y anadiendo un nodo LoRA loader.
- Compatibilidad con el ecosistema SDXL (samplers, schedulers y controlnets propios de la base).
- No soporta tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio: es un modelo de difusion, no un LLM.

## Casos de uso

- Generacion de retratos de personaje para prototipado de videojuegos o narrativa visual: el LoRA permite mantener una identidad consistente en distintas poses e iluminaciones con el token `korean9`, reduciendo el trabajo de direccion de arte.
- Creacion de storyboards y material conceptual: al partir de SDXL a 1024 px, se obtienen imagenes de resolucion suficiente para presentaciones internas sin reescalado adicional.
- Pruebas de pipelines de difusion en investigacion: un LoRA pequeno (0,2 GB) es util para validar flujos de carga, peso de adaptador y composicion de prompts en diffusers o ComfyUI antes de escalar a adaptadores mayores.
- Fines educativos sobre entrenamiento de LoRA: el repositorio documenta hiperparametros completos (dim, alpha, pasos, optimizador, learning rate) y publica el dataset, lo que facilita reproducir el entrenamiento.
- Generacion de avatares y material promocional de caracter ficticio inspirado en el rostro, siempre que se respeten los derechos de imagen de la persona real.
- Composicion de escenas con multiples elementos mediante prompts detallados, aprovechando la base SDXL para fondos, vestuario y estilo fotografico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud facial) ni comparaciones con otros LoRA de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: SDXL en fp16 requiere aproximadamente 8-10 GB de VRAM; el LoRA anade una sobrecarga marginal (menos de 1 GB) al cargarse sobre el UNet.
- GPU recomendadas: A100, H100 o L40S para lotes grandes y produccion; RTX 4090 (24 GB) para generacion a 1024 px con margen holgado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) sin problema; en RTX 3060/4060 Ti (8-12 GB) es posible con fp16 y atencion eficiente, con posible offloading.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI, Automatic1111/Forge con soporte SDXL, y llama.cpp no aplica (no es un LLM). vLLM y TGI no son adecuados para difusion.
- Latencia y throughput: no disponibles; dependen de la GPU, el sampler y el numero de pasos, no documentados en la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Neko Korean9 SDXL v1 | LoRA de personaje | SDXL 1.0 | no disponible (dim 16) | no aplica | Apache 2.0 | Hugging Face |
| LoRA de personaje SDXL genericos (p. ej. adaptadores de estilo/rostro de la comunidad) | LoRA | SDXL 1.0 | variable (dim 8-128) | no aplica | variable | Hugging Face / Civitai |
| Stable Diffusion XL base 1.0 | Modelo fundacional | - | ~3,5 B (UNet + text encoders) | no aplica | CreativeML OpenRAIL++-M | Hugging Face |
| IP-Adapter (SDXL) | Adaptador de imagen | SDXL 1.0 | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset muy reducido (39 imagenes) y caption uniforme, lo que puede provocar sobreajuste y escasa variabilidad en poses, expresiones y vestuario.
- Riesgo de reproduccion de sesgos presentes en las imagenes de entrenamiento (iluminacion, maquillaje, encuadre) y de artefactos faciales en angulos no vistos.
- El modelo reproduce el rostro de una persona real (Han So-hee); su uso comercial o difamatorio puede vulnerar derechos de imagen y normativa de proteccion de datos. La licencia Apache 2.0 del adaptador no exime de esas obligaciones.
- Los prompts de ejemplo estan en ingles; no se documenta soporte multilingue en el text encoder.
- No hay benchmarks ni evaluacion cuantitativa de fidelidad facial, por lo que la calidad real debe validarse manualmente.
- Al ser un LoRA, requiere cargar SDXL base; el coste de VRAM y latencia es el de la base, no el del adaptador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-korean9-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/korean-top10-v2
- Script de entrenamiento kohya-ss: https://github.com/kohya-ss/sd-scripts
- Diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
