# dhruv1672/data266-pokemon-lora

## Resumen

`dhruv1672/data266-pokemon-lora` es un adaptador LoRA para Stable Diffusion 1.5 desarrollado por Dhruv Patel (Team 28) como parte del curso DATA 266, Lab 2, Parte 2. Se trata de un ajuste fino de las capas de atencion del UNet de Stable Diffusion 1.5 orientado a generar ilustraciones con estetica de Pokemon, entrenado sobre el conjunto `reach-vb/pokemon-blip-captions` con leyendas generadas por BLIP. No es un modelo de lenguaje: es un adaptador de difusion texto-a-imagen que se carga sobre el checkpoint base `stable-diffusion-v1-5/stable-diffusion-v1-5`.

La version publicada es la v2.0, resultado de un barrido sistematico sobre rango (4 a 128) y alpha, con 4000 pasos de entrenamiento, decaimiento coseno, EMA y min-SNR. El run final seleccionado es `lora_r16_a16`, con 3.188.736 parametros entrenables, elegido entre los dos finalistas por menor KID en el conjunto de test (0,02923 frente a 0,03787 del r4_a4 y 0,06483 del modelo base). El repositorio ocupa 0,2 GB e incluye los distintos runs del barrido accesibles mediante subcarpetas.

Su relevancia es limitada y acotada: se trata de un trabajo academico con 833 imagenes de entrenamiento tras limpieza, sin evaluacion humana completa en el momento de la publicacion y con restricciones de licencia que impiden el uso comercial. Resulta util como referencia metodologica de ajuste fino de LoRA en difusion y como ejemplo de barrido de hiperparametros con metricas KID y CLIP, mas que como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (difusion latente, transformer convolucional) |
| Parametros totales | 3.188.736 parametros entrenables (run final `lora_r16_a16`); el modelo base SD 1.5 no se contabiliza en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; prompt de hasta 77 tokens por el tokenizador CLIP de SD 1.5) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en el formato nativo de diffusers; el base admite fp16 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponible (las leyendas de entrenamiento estan en ingles) |
| Licencia | CreativeML OpenRAIL-M (heredada del modelo base); el dataset declara CC-BY-NC-SA-4.0 |
| Formato de pesos | safetensors de diffusers (adaptadores LoRA, revisiones `v2.0` y subcarpetas `runs/<run>`) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre las capas de atencion del UNet de Stable Diffusion 1.5, fijado en la revision `451f4fe16113` y resuelto a 512 px. Cada run del barrido entrena durante 4000 pasos con batch efectivo 4 x 1, optimizador AdamW, learning rate 0,0001 con decaimiento coseno tras 200 pasos de warm-up, EMA con decaimiento 0,999, min-SNR con gamma 5,0, caption dropout de 0,1, volteo horizontal y precision mixta. Los pesos publicados son los de EMA. La configuracion exacta esta en `experiment.yaml`.

El barrido cubre rangos [4, 8, 16, 32, 64, 128] y distintos valores de alpha. Los resultados de validacion muestran que el rango 4 con alpha 4 obtiene el mejor KID (0,03969) y que el r16_a16 queda ligeramente por detras (0,05003) pero con mejor CLIP (30,966 frente a 31,587 del r4_a4 en validacion). Los runs de rango alto (32, 64, 128) degradan el KID de forma monotona (hasta 0,09436 en r128_a128) sin mejora proporcional de CLIP. El coste computacional es bajo: entre 0,22 y 0,27 GPU-horas por run y un pico de 6,87 a 7,44 GiB en A100-SXM4-40GB con PyTorch limitado a 15 GiB.

Los datos provienen de `reach-vb/pokemon-blip-captions` en la revision `3790f29981f7`: 833 imagenes tras limpieza, divididas en 685 de entrenamiento, 64 de validacion y 84 de test (semilla 266). Las copias recoloreadas del mismo artwork se mantienen en el mismo lado del split para evitar fuga de datos.

## Capacidades

- Generacion de imagenes texto-a-imagen con estetica de ilustracion Pokemon sobre Stable Diffusion 1.5.
- Control de estilo mediante prompt en ingles; el adaptador aprende principalmente el estilo de dibujo mas que el control preciso de contenido.
- Compatible con el pipeline `StableDiffusionPipeline` de diffusers mediante `load_lora_weights`.
- Seleccion de runs del barrido mediante `revision="v2.0"` y `subfolder="runs/<run name>"`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: no es un modelo de lenguaje.
- No soporta vision ni audio de entrada; es un modelo de generacion visual.
- Capacidades multilingues: no disponibles; el texto de entrenamiento esta en ingles.

## Casos de uso

- Prototipado de arte conceptual con estetica Pokemon: util para generar bocetos rapidos de criaturas sobre fondo blanco, que es el dominio exacto de entrenamiento (una criatura, fondo blanco), con 30 pasos DDIM y guidance 7.5.
- Docencia y practicas de ajuste fino de difusion: el repositorio incluye el barrido completo con hiperparametros, metricas y configuracion, lo que lo convierte en material de referencia para ensenar LoRA, EMA, min-SNR y evaluacion con KID y CLIP.
- Experimentacion con barridos de rango y alpha: permite reproducir la comparativa entre runs (r4_a4, r8_a8, r16_a16, r32_a32, r64_a64, r128_a128) cargando cada subcarpeta y midiendo KID/CLIP con los mismos prompts y semillas.
- Generacion de assets para proyectos no comerciales de fan art: dado que la licencia del dataset es CC-BY-NC-SA-4.0 y los personajes pertenecen a sus titulares, solo es apto para coursework y uso no comercial.
- Comparacion de tecnicas de regularizacion en difusion: el uso de min-SNR gamma 5.0, caption dropout 0.1 y EMA permite estudiar su efecto sobre KID y diversidad (LPIPS) en un conjunto pequeno y controlado.
- Base para experimentos de destilacion o merge de LoRAs: al ser un adaptador pequeno (3,2 M parametros en el run final), se puede combinar con otros adaptadores de estilo para estudiar interacciones, siempre dentro de los limites de licencia.

## Benchmarks y rendimiento

Resultados de validacion del barrido (imagenes de validacion unicamente):

| Run | Rango | Alpha | Parametros entrenables | GPU-horas | Pico GPU (GiB) | val_kid | val_clip |
|---|---|---|---|---|---|---|---|
| lora_r4_a4 | 4 | 4 | 797.184 | 0,2262 | 6,874 | 0,03969 | 31,587 |
| lora_r4_a8 | 4 | 8 | 797.184 | 0,2279 | 6,874 | 0,04085 | 33,18 |
| lora_r16_a16 | 16 | 16 | 3.188.736 | 0,2305 | 6,928 | 0,05003 | 30,966 |
| lora_r64_a64 | 64 | 64 | 12.754.944 | 0,2223 | 7,15 | 0,05143 | 30,055 |
| lora_r8_a8 | 8 | 8 | 1.594.368 | 0,2717 | 6,892 | 0,05355 | 31,244 |
| lora_r32_a32 | 32 | 32 | 6.377.472 | 0,2201 | 7,001 | 0,06099 | 30,517 |
| lora_r128_a128 | 128 | 128 | 25.509.888 | 0,2221 | 7,443 | 0,09436 | 29,468 |
| lora_r4_a2 | 4 | 2 | 797.184 | 0,2266 | 6,874 | 0,21961 | 25,198 |

Resultados en test (20 prompts fijos, semillas 0 y 1, DDIM 30 pasos, guidance 7.5):

| Modelo | kid | kid_std | clip_score | lpips_diversity | nsfw_flags |
|---|---|---|---|---|---|
| base | 0,06483 | 0,00832 | 33,22 | 0,8412 | 0 |
| lora_r4_a4 | 0,03787 | 0,0069 | 32,011 | 0,7861 | 2 |
| lora_r16_a16 | 0,02923 | 0,00552 | 31,865 | 0,782 | 2 |

El KID se calcula con solo 20 imagenes generadas por modelo, por lo que es ruidoso. La evaluacion humana a ciegas no estaba terminada en el momento de la publicacion de esta version.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un coste marginal sobre Stable Diffusion 1.5; el entrenamiento se midio con un pico de 6,87 a 7,44 GiB en A100-SXM4-40GB con PyTorch limitado a 15 GiB.
- GPU recomendadas para entrenamiento: NVIDIA A100-SXM4-40GB (configuracion usada en el barrido); cualquier GPU con al menos 8 GiB para inferencia en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GiB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti 16 GB, RTX 4090) ejecutando SD 1.5 en fp16.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights`; tambien es compatible con WebUI de Automatic1111 y ComfyUI mediante carga de LoRA, aunque no se documenta explicitamente en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada; el coste de entrenamiento fue de 0,22 a 0,27 GPU-horas por run.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dhruv1672/data266-pokemon-lora (r16_a16) | LoRA sobre SD 1.5 | 3.188.736 entrenables | 512 px, prompt 77 tokens | CreativeML OpenRAIL-M (dataset CC-BY-NC-SA-4.0) | Hugging Face, 0 descargas |
| dhruv1672/data266-pokemon-lora-r4 | LoRA sobre SD 1.5 (v1.0) | 797.184 entrenables | 512 px, prompt 77 tokens | CreativeML OpenRAIL-M | Hugging Face |
| dhruv1672/data266-pokemon-lora-r16 | LoRA sobre SD 1.5 (v1.0) | 3.188.736 entrenables | 512 px, prompt 77 tokens | CreativeML OpenRAIL-M | Hugging Face |
| stable-diffusion-v1-5/stable-diffusion-v1-5 | Modelo base de difusion | no disponible en la informacion | 512 px, prompt 77 tokens | CreativeML OpenRAIL-M | Hugging Face |

No se dispone de comparacion con otros LoRA de estilo Pokemon en la informacion proporcionada; los unicos terminos de comparacion son los runs del propio barrido y el modelo base.

## Limitaciones y advertencias

- Las leyendas son generadas por maquina y cortas, por lo que el adaptador aprende mejor el estilo de dibujo que el control preciso del prompt.
- Las imagenes de entrenamiento muestran una sola criatura sobre fondo blanco; escenas, multiples personajes y prompts fuera de dominio tienden a ese aspecto.
- El KID se calcula con solo 20 imagenes por modelo y es ruidoso; la evaluacion humana a ciegas no estaba terminada al publicar la version.
- El run final r16_a16 tiene peor KID en validacion (0,05003) que el r4_a4 (0,03969); la seleccion se hizo por KID en test, con posible sobreajuste a ese conjunto.
- Se detectaron 2 flags NSFW en las generaciones de los adaptadores (frente a 0 del base) con el safety checker activado.
- Licencia: hereda CreativeML OpenRAIL-M del base, pero el dataset declara CC-BY-NC-SA-4.0 y los personajes pertenecen a sus titulares; solo apto para coursework y uso no comercial.
- Riesgo de alucinacion visual y de reproduccion de memorias del dataset: la model card menciona una comprobacion de vecino mas cercano contra las imagenes de entrenamiento en el notebook, pero no se publican resultados.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento ni capacidades multilingues.
- Idioma de prompt efectivo: ingles; no se documenta soporte de otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhruv1672/data266-pokemon-lora
- Adaptador v1.0 rango 4: https://huggingface.co/dhruv1672/data266-pokemon-lora-r4
- Adaptador v1.0 rango 16: https://huggingface.co/dhruv1672/data266-pokemon-lora-r16
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
