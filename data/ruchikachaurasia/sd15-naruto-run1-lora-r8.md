# RuchikaChaurasia/sd15-naruto-run1-lora-r8

## Resumen

`sd15-naruto-run1-lora-r8` es un adaptador LoRA de bajo rango entrenado sobre Stable Diffusion 1.5 para generar imagenes con estetica del anime Naruto. Lo publica la usuaria RuchikaChaurasia en Hugging Face y resuelve un problema acotado: inyectar un estilo visual concreto en un modelo base ya existente sin necesidad de reentrenar los pesos completos ni de almacenar un checkpoint de varios gigabytes. El adaptador ocupa practicamente nada (el repositorio figura con 0.0 GB) y se carga sobre el UNet de SD 1.5 mediante `load_lora_weights`.

Tecnicamente es un LoRA de rango 8 (alpha 8) aplicado a las capas de atencion del UNet, con 1.594.368 parametros entrenables, entrenado durante 1500 pasos con un learning rate de 1e-4 y batch de 4 en precision mixta fp16 sobre una NVIDIA GeForce RTX 5090 durante 0,096 GPU-horas. El dataset de partida es `lambdalabs/naruto-blip-captions`, del que se conservaron 1099 imagenes tras descartar corruptas y duplicados, reservando un 10 % para validacion con semilla 266.

Su relevancia es la de un artefacto de investigacion reproducible: incluye metricas objetivas frente al modelo base (KID, CLIP score y diversidad LPIPS) y un desglose de coste de entrenamiento poco habitual en adaptadores de este tipo. No obstante, el propio autor deja la seccion de limitaciones sin redactar y no publica comparaciones con otros LoRA de estilo similares, por lo que su utilidad practica queda restringida a experimentacion no comercial por la naturaleza de las imagenes de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (difusion latente, text-to-image) |
| Parametros totales | 1.594.368 parametros entrenables (adaptador); pesos base de SD 1.5 aparte |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; condicionamiento por prompt de texto CLIP) |
| Tipos de cuantizacion | no disponible (entrenado en fp16; el adaptador se distribuye en precision de entrenamiento) |
| Idiomas soportados | no disponible (los prompts de entrenamiento son captions en ingles de BLIP) |
| Licencia | creativeml-openrail-m (pesos base); uso del adaptador restringido por el autor a investigacion y educacion no comercial |
| Formato de pesos | safetensors via `diffusers` (`pipe.load_lora_weights`) |
| Rango LoRA | 8 (alpha 8) |
| Dataset de entrenamiento | `lambdalabs/naruto-blip-captions` (1099 imagenes tras limpieza, 10 % held out, semilla 266) |
| Pasos de entrenamiento | 1500, batch 4, lr 1e-4, fp16 |
| Hardware de entrenamiento | NVIDIA GeForce RTX 5090, 0,096 GPU-horas, pico 2,87 GB |
| Resolucion nativa | 512x512 (heredada de SD 1.5) |

## Arquitectura y entrenamiento

El adaptador es un LoRA clasico sobre un transformer de difusion: se congelan los pesos de Stable Diffusion 1.5 y se insertan matrices de baja descomposicion en las capas de atencion del UNet, con rango 8 y alpha 8, sumando 1.594.368 parametros entrenables. El text encoder (CLIP) y el VAE no se modifican, de modo que el condicionamiento textual y la decodificacion latente son los del modelo base. El entrenamiento se hizo en fp16 mixto, 1500 pasos, batch 4 y learning rate 1e-4, sobre una unica RTX 5090 con un consumo de 0,096 GPU-horas y un pico de memoria de 2,87 GB, lo que indica un pipeline ligero y facilmente reproducible.

Los datos proceden de `lambdalabs/naruto-blip-captions`, con captions generados por BLIP en ingles. Tras eliminar 0 imagenes corruptas y 0 duplicados quedaron 1099 ejemplos, de los que un 10 % se reservo para evaluacion con semilla 266. No se documenta el uso de RLHF, DPO ni preferencias humanas; la evaluacion se limita a metricas automaticas de calidad y alineacion prompt-imagen. Tampoco se describe ninguna innovacion arquitectonica adicional (sin atencion lineal, sin decodificacion especulativa, sin destilacion); es un fine-tuning parametrizado eficiente estandar.

## Capacidades

- Generacion text-to-image de escenas con estetica anime inspirada en Naruto, a partir de prompts en ingles.
- Inyeccion de estilo sobre SD 1.5 sin reentrenar el modelo base, con carga y descarga dinamica via `diffusers`.
- Composicion con otros LoRA o con el propio checkpoint base, al ser un adaptador modular de bajo rango.
- Control de la intensidad del efecto mediante el parametro `scale` de `load_lora_weights` (comportamiento estandar de `diffusers`).
- Generacion con muestreadores habituales de SD 1.5; la evaluacion del autor usa DPM-Solver con 30 pasos y CFG 7.5.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking: es exclusivamente un modelo de sintesis de imagen.
- Capacidad multilingue no documentada; los captions de entrenamiento estan en ingles, por lo que la alineacion con prompts en castellano no esta garantizada.

## Casos de uso

- Prototipado de ilustracion de estilo anime en investigacion: cargar el LoRA sobre SD 1.5 con `pipe.load_lora_weights` y generar variaciones controladas para estudiar como un adaptador de rango 8 modifica la distribucion de salida frente al modelo base, usando las metricas KID y CLIP como referencia.
- Docencia sobre fine-tuning eficiente: el desglose de hiperparametros (rango 8, alpha 8, 1500 pasos, lr 1e-4, 0,096 GPU-horas en RTX 5090) permite reproducir el entrenamiento completo en una sola GPU de consumo y explicar el coste real de un LoRA.
- Experimentos de composicion de adaptadores: al ser un modulo pequeno y aislado, sirve para probar tecnicas de mezcla de LoRA (weighted sum, merging) y medir el impacto en diversidad (LPIPS 0,811 frente a 0,783 del base).
- Generacion de bocetos para proyectos personales no comerciales: ilustraciones de fan art o maquetas visuales donde la licencia OpenRAIL-M y la restriccion del autor a investigacion y educacion sean compatibles.
- Evaluacion de sesgos y estilos en modelos de difusion: comparar la tasa de generacion de personajes reconocibles frente al modelo base para estudiar memorizacion de IP en adaptadores de bajo rango.
- Benchmarking de pipelines de inferencia: medir latencia y throughput de SD 1.5 + LoRA en distintas GPU (RTX 4090, A100, H100) con 30 pasos DPM-Solver y CFG 7.5, usando este adaptador como carga representativa de un fine-tuning de estilo.

## Benchmarks y rendimiento

Resultados publicados por el autor: 20 prompts x 2 semillas, 30 pasos DPM-Solver, CFG 7.5.

| Metrica | LoRA (run1_lora_r8) | Stable Diffusion 1.5 base |
|---|---|---|
| KID (x1e3) | 58,45 | 116,33 |
| CLIP score | 24,58 | 26,32 |
| Diversidad LPIPS | 0,811 | 0,783 |
| Tasa de victoria humana (estilo/prompt) | nan / nan | no aplica |

El KID mejora aproximadamente a la mitad respecto al base (58,45 frente a 116,33), lo que sugiere una distribucion de salida mas cercana a la del dataset de entrenamiento. El CLIP score cae ligeramente (24,58 frente a 26,32), indicando una alineacion prompt-imagen algo peor que el modelo base, y la diversidad LPIPS sube (0,811 frente a 0,783). La evaluacion humana no se realizo (valores `nan`). No hay comparaciones con otros LoRA de estilo publicadas en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en si ocupa unos pocos megabytes (1,59 M de parametros en fp16, aproximadamente 3 MB), pero requiere cargar SD 1.5 completo; en fp16 el pipeline completo ronda los 4-5 GB de VRAM, y en fp32 alrededor de 8-10 GB. Cifra exacta no disponible.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para SD 1.5 en fp16; el autor entreno en una RTX 5090 con pico de 2,87 GB para el adaptador, pero la inferencia necesita el UNet y el VAE completos.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes; en GPUs de 6 GB puede requerir `enable_model_cpu_offload` o `enable_attention_slicing`.
- Opciones de despliegue: `diffusers` (referencia del autor), Automatic1111/Forge y ComfyUI mediante carga de LoRA en formato compatible, ademas de `stable-diffusion.cpp` y `diffusers` con `torch.compile`. vLLM y TGI no aplican a modelos de difusion en este formato.
- Latencia y throughput: no disponibles; dependeran de la GPU, del sampler (30 pasos DPM-Solver en la evaluacion) y del tamano de batch.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sd15-naruto-run1-lora-r8 | LoRA de estilo | 1,59 M entrenables | SD 1.5 | 512x512 | OpenRAIL-M + restriccion no comercial del autor | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 | Difusion latente completa | ~860 M (UNet) | - | 512x512 | CreativeML OpenRAIL-M | Ampliamente disponible |
| SDXL | Difusion latente completa | ~2,6 B (UNet) + refiner | - | 1024x1024 | CreativeML OpenRAIL++-M | Ampliamente disponible |
| Otros LoRA de estilo Naruto en SD 1.5 | LoRA de estilo | no disponible | SD 1.5 | 512x512 | variable | Civitai / Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa se limita a la tabla de benchmarks frente al base.

## Limitaciones y advertencias

- La seccion de limitaciones de la model card esta sin redactar (`TODO`), por lo que no hay un analisis documentado de modos de fallo.
- Las imagenes de entrenamiento representan personajes con copyright; el autor restringe explicitamente el adaptador a investigacion y educacion no comercial, lo que impide su uso comercial aunque la licencia OpenRAIL-M lo permita a nivel de pesos base.
- El CLIP score es inferior al del modelo base (24,58 frente a 26,32), lo que indica menor fidelidad al prompt en terminos de alineacion texto-imagen.
- La diversidad LPIPS es superior a la del base (0,811 frente a 0,783), lo que puede traducirse en mayor variabilidad no deseada entre semillas para un mismo prompt.
- No se realizo evaluacion humana (valores `nan`), de modo que no hay evidencia subjetiva de calidad percibida.
- Los prompts de entrenamiento estan en ingles (captions BLIP); el comportamiento con prompts en castellano no esta evaluado.
- Riesgo de memorizacion de personajes con copyright y de reproduccion de sesgos presentes en el dataset original.
- Al ser un LoRA de rango 8 entrenado solo 1500 pasos, la fuerza del estilo puede ser limitada y requerir ajuste del `scale` en produccion.
- Cero descargas y cero likes en el momento de la ficha: no hay validacion de la comunidad ni reportes de uso en produccion.
- Resolucion nativa 512x512; generar a resoluciones mayores puede degradar la coherencia sin tecnicas adicionales (upscalers, hires fix).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RuchikaChaurasia/sd15-naruto-run1-lora-r8
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Libreria diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Paper de LoRA (Low-Rank Adaptation): https://arxiv.org/abs/2106.09685
