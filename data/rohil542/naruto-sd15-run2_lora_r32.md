# rohil542/naruto-sd15-run2_lora_r32

## Resumen

`rohil542/naruto-sd15-run2_lora_r32` es un adaptador LoRA de rango 32 entrenado sobre Stable Diffusion 1.5 para generar imagenes con el estilo visual y el reparto de personajes de la serie anime Naruto. Lo publica el usuario rohil542 en Hugging Face y su proposito es especializar un modelo text-to-image generico en un dominio estetico muy concreto sin necesidad de reentrenar el modelo base completo.

El adaptador se entrena sobre el dataset `lambdalabs/naruto-blip-captions` (1099 imagenes tras filtrado, con captions generadas por BLIP) durante 2000 pasos, con un total de 6.377.472 parametros entrenables y un consumo de 0,695 GPU-horas. Se distribuye como pesos LoRA cargables con `diffusers` mediante `pipe.load_lora_weights`, por lo que su huella de almacenamiento y de inferencia es minima frente al modelo base de aproximadamente 860 millones de parametros.

Es relevante como ejemplo de flujo de fine-tuning ligero y reproducible (semilla fija, split 90/10, evaluacion con KID, CLIP score y LPIPS), pero su alcance practico es limitado: es un adaptador de estilo para investigacion no comercial, con un dataset pequeno y sin evaluacion humana realizada. No es un modelo de lenguaje ni de razonamiento; es un adaptador de difusion para generacion de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre proyecciones de atencion de Stable Diffusion 1.5 (UNet latente de difusion) |
| Parametros totales | 6.377.472 parametros entrenables en el adaptador; el modelo base SD 1.5 no se especifica en la informacion disponible (aproximadamente 860 M en el checkpoint base, dato no aportado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; el texto de prompt se procesa con el text encoder CLIP de SD 1.5, limite de 77 tokens) |
| Tipos de cuantizacion | no disponible (el autor indica entrenamiento en fp16; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (los prompts se procesan con el text encoder CLIP de SD 1.5, predominantemente ingles) |
| Licencia | CreativeML OpenRAIL-M para el modelo base; el autor restringe el adaptador a uso de investigacion no comercial por entrenarse con fotogramas de anime con copyright |
| Formato de pesos | pesos LoRA compatibles con `diffusers` (formato de adaptador; no se detalla safetensors ni binario en la informacion disponible) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado a las proyecciones de atencion del UNet de Stable Diffusion 1.5. No modifica la arquitectura del modelo base: inyecta matrices de baja dimensionalidad que se suman a las proyecciones originales, de modo que solo se entrenan 6.377.472 parametros. El entrenamiento usa 2000 pasos, tamano de batch 4, learning rate 0,0001 con scheduler coseno y 100 pasos de warmup, optimizador AdamW, precision fp16 con gradient checkpointing y semilla 266. El pico de memoria GPU fue de 2,93 GB y el coste total de 0,695 GPU-horas.

Los datos provienen de `lambdalabs/naruto-blip-captions`, con 1099 imagenes de entrenamiento tras eliminar 0 corruptas y 0 duplicadas, y un split 90/10 con semilla 266. Las captions son generadas automaticamente por BLIP, lo que introduce ruido de etiquetado. No se documenta RLHF, DPO ni ninguna innovacion de decodificacion; es un fine-tuning supervisado estandar de difusion condicionada por texto. El autor menciona un chequeo de memorizacion en el notebook, pero no se aportan sus resultados.

## Capacidades

- Generacion de imagen text-to-image condicionada por prompt, con especializacion en el estilo visual y el reparto de Naruto.
- Transferencia de estilo anime: los prompts fuera de dominio tienden a adoptar la estetica anime aprendida.
- Composicion de escenas con personajes del dominio de entrenamiento, segun las captions BLIP del dataset.
- Carga e integracion sencilla en pipelines `diffusers` mediante `load_lora_weights`, combinable con el checkpoint base SD 1.5.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No soporta agentes, vision de entrada, audio ni modo de pensamiento.
- Capacidades multilingues: no documentadas; el text encoder CLIP de SD 1.5 esta orientado a ingles.

## Casos de uso

- Prototipado de ilustracion estilo anime: cargar el LoRA sobre SD 1.5 y generar bocetos de personajes con la estetica de la serie para exploracion visual rapida, aprovechando el bajo coste de inferencia del adaptador.
- Investigacion sobre fine-tuning de difusion: reproducir el experimento (semilla 266, 2000 pasos, r=32) como referencia para estudiar el efecto del rango LoRA y del numero de pasos en la fidelidad de estilo medida con KID y CLIP score.
- Evaluacion de metricas de generacion: usar el par base vs adaptador como caso de estudio de como el KID in-domain mejora (0,0134 frente a 0,1077) mientras el CLIP score empeora ligeramente (30,71 frente a 32,24).
- Generacion de material conceptual para fan art no comercial: producir variaciones de escenas y personajes dentro de un entorno de investigacion, respetando la restriccion de uso no comercial del autor.
- Docencia sobre LoRA en difusion: demostrar en un taller como un adaptador de 6,3 M de parametros y 0,695 GPU-horas modifica el comportamiento de un modelo base de 860 M.
- Pruebas de sesgo y memorizacion: emplear el adaptador para analizar la tendencia a replicar fotogramas de entrenamiento y la deriva de estilo en prompts fuera de dominio, tal como sugiere el propio autor.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 20 prompts fijos y semillas 0 y 1, comparando el adaptador con el modelo base:

| Metrica | Adaptador | Base SD 1.5 |
|---|---|---|
| KID in-domain | 0,0134 | 0,1077 |
| CLIP score | 30,71 | 32,24 |
| LPIPS (diversidad) | 0,7514 | 0,8088 |
| Evaluacion humana | no realizada | no realizada |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo de generacion de imagen.

## Requisitos de hardware

- VRAM para inferencia: el adaptador anade una huella minima; el modelo base SD 1.5 en fp16 requiere aproximadamente 4-6 GB de VRAM para resoluciones de 512x512, aunque el autor no documenta cifras de inferencia.
- VRAM para entrenamiento: pico de 2,93 GB con batch 4, fp16 y gradient checkpointing, segun el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; el entrenamiento reportado cabe en GPUs de gama media.
- Cabe en GPU consumer: si, segun el consumo de memoria reportado.
- Opciones de despliegue: `diffusers` con `load_lora_weights` sobre el pipeline de SD 1.5; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rohil542/naruto-sd15-run2_lora_r32 | LoRA sobre SD 1.5 | 6,38 M entrenables | no aplica (77 tokens de prompt CLIP) | OpenRAIL-M + restriccion no comercial del autor | Hugging Face, 0 descargas, 0 likes |
| Stable Diffusion 1.5 (base) | UNet de difusion | aprox. 860 M (no confirmado por el autor) | 77 tokens de prompt | CreativeML OpenRAIL-M | Ampliamente disponible |
| Otros LoRA de estilo sobre SD 1.5 | Adaptadores LoRA | variable | 77 tokens de prompt | variable | Comunidad Hugging Face |

No se dispone de datos de benchmarks comparativos con otros adaptadores de estilo en la informacion proporcionada; la comparacion se limita al modelo base, para el que el autor reporta KID, CLIP score y LPIPS.

## Limitaciones y advertencias

- Estilo y reparto estrechos: el adaptador solo cubre la estetica y los personajes del dataset; los prompts fuera de dominio se ven atraidos hacia el look anime.
- Captions generadas por maquina (BLIP), lo que introduce ruido y posibles desalineaciones entre texto e imagen.
- Conjunto de test pequeno (20 prompts fijos, 2 semillas), por lo que el KID reportado es ruidoso y poco concluyente.
- No se ha realizado evaluacion humana; las metricas automaticas no garantizan calidad percibida.
- Posible parecido con fotogramas de entrenamiento; el autor remite a un chequeo de memorizacion en el notebook cuyos resultados no se aportan.
- Restriccion de licencia: entrenado con fotogramas de anime con copyright, el autor limita el uso a investigacion no comercial; CreativeML OpenRAIL-M se aplica al modelo base.
- Dataset con licencia `None` segun el autor, lo que anade incertidumbre sobre la reutilizacion de los datos.
- Sin soporte multilingue documentado; los prompts en castellano pueden degradar la fidelidad.
- Riesgo de alucinacion visual: generacion de detalles anatomicos o de vestuario incoherentes, habitual en SD 1.5 con LoRA de bajo rango.
- No apto para produccion comercial ni para generacion de contenido con personajes protegidos por derechos de autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohil542/naruto-sd15-run2_lora_r32
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Libreria diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
