# Akashkumars/naruto-sd15-run2_lora_r32_attn_ff

## Resumen

`Akashkumars/naruto-sd15-run2_lora_r32_attn_ff` es un adaptador LoRA para Stable Diffusion 1.5 entrenado para generar imagenes con el estilo visual de la serie de anime Naruto. Lo desarrolla el usuario de Hugging Face Akashkumars y se publica bajo licencia CreativeML OpenRAIL-M, con la restriccion adicional de uso exclusivamente no comercial e investigador por haberse entrenado sobre fotogramas de anime con derechos de autor. El repositorio no contiene pesos completos del modelo base, sino unicamente el adaptador, que debe cargarse sobre `stable-diffusion-v1-5/stable-diffusion-v1-5` mediante `pipe.load_lora_weights()`.

Tecnicamente se trata de un LoRA de rango 32 aplicado tanto a las capas de atencion como a las capas feed-forward del UNet de SD 1.5, con 11.968.512 parametros entrenables. El entrenamiento se realizo sobre el dataset `lambdalabs/naruto-blip-captions` (1099 imagenes tras filtrado, con captions generadas por BLIP), durante 3500 pasos con batch 4 y learning rate 1e-4, consumiendo 0,384 GPU-horas y un pico de memoria de 7,2 GB. Es, por tanto, un ajuste fino ligero y reproducible, orientado a demostrar un pipeline de personalizacion estilistica mas que a competir en capacidad generativa general.

Su relevancia actual es acotada: sirve como ejemplo documentado de entrenamiento LoRA con evaluacion cuantitativa (KID, CLIP score, LPIPS) y evaluacion humana ciega, y como caso de estudio de los sesgos de posicion en estudios de preferencia. No es un modelo de proposito general ni un generador de alta fidelidad; su alcance es un estilo y un reparto concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion 1.5 (diffusion model, text-to-image) |
| Parametros totales | 11.968.512 parametros entrenables (solo adaptador; no incluye el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; sin ventana de contexto textual definida) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precision de entrenamiento; el modelo base admite fp16/fp32 y cuantizaciones de terceros) |
| Idiomas soportados | no disponible (los prompts se procesan con el text encoder CLIP de SD 1.5, predominantemente ingles) |
| Licencia | CreativeML OpenRAIL-M, con restriccion adicional de uso no comercial e investigador por el dataset de origen |
| Formato de pesos | no disponible en la informacion proporcionada (repositorio de 0.0 GB; libreria `diffusers`, pesos LoRA) |

## Arquitectura y entrenamiento

El adaptador se inyecta en el UNet de Stable Diffusion 1.5 mediante descomposicion de bajo rango (rank 32) sobre las proyecciones de las capas de atencion y de las capas feed-forward. El text encoder y el VAE del modelo base permanecen congelados; solo se optimizan los 11.968.512 parametros del LoRA. El entrenamiento uso 3500 pasos con batch efectivo 4, learning rate 1e-4 con scheduler coseno y 100 pasos de warmup, optimizador AdamW en bf16, min-SNR gamma 5.0, noise offset 0.05 y caption dropout 0.1. La semilla de entrenamiento fue 2494 y la de particion del dataset 266 (split 90/10).

Los datos provienen de `lambdalabs/naruto-blip-captions`: 1099 imagenes de entrenamiento tras eliminar 0 corruptas y 0 duplicadas, con captions generadas automaticamente por BLIP. No se reporta uso de RLHF, DPO ni preferencias humanas durante el ajuste; la evaluacion humana es posterior y solo comparativa frente al modelo base. El pico de memoria de 7,2 GB y las 0,384 GPU-horas indican un entrenamiento viable en una unica GPU de gama media-alta.

## Capacidades

- Generacion de imagenes texto-a-imagen en el estilo visual de Naruto, condicionada por prompts en lenguaje natural.
- Especializacion estilistica y de reparto: reproduce personajes y estetica del dominio de entrenamiento (dataset Naruto con captions BLIP).
- Composicion con el modelo base: se carga como adaptador sobre SD 1.5 y puede combinarse con otros LoRA o con ControlNet del ecosistema SD 1.5 (no verificado en la informacion disponible).
- Ajuste fino ligero y reproducible: hiperparametros, semillas y metricas documentados en la model card.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion text-to-image, no un LLM.
- No dispone de modo thinking, vision de entrada, audio ni capacidades multimodales mas alla del condicionamiento textual.
- Capacidades multilingues: no documentadas; el text encoder CLIP de SD 1.5 esta sesgado hacia ingles.

## Casos de uso

- Prototipado de ilustracion fan-made no comercial: generar bocetos y variaciones de personajes con estetica Naruto para portafolios o proyectos personales, usando `pipe.load_lora_weights()` sobre SD 1.5 con prompts descriptivos.
- Investigacion sobre personalizacion estilistica: servir de referencia reproducible para estudiar el efecto del rango LoRA (r=32), min-SNR y noise offset en la fidelidad al dominio, gracias a los hiperparametros y semillas publicados.
- Docencia en difusion generativa: ejemplo completo de pipeline de entrenamiento LoRA con evaluacion KID/CLIP/LPIPS y evaluacion humana ciega, util en cursos de vision por computador.
- Estudio de sesgos en evaluacion humana: el propio autor documenta un sesgo de posicion (87% de victorias cuando el modelo final ocupaba el lado preferido frente a 59% cuando no), lo que convierte el repositorio en material para metodologia de evaluacion.
- Generacion de assets para maquetas y pruebas de UI: imagenes de relleno tematicas en entornos de desarrollo, siempre que el uso sea interno y no comercial.
- Comparativa de adaptadores: benchmark de referencia para contrastar otros LoRA de estilo anime sobre SD 1.5 con las mismas metricas (KID in-domain 0.0121 frente a 0.1047 del base).

## Benchmarks y rendimiento

Resultados reportados por el autor (20 prompts x 2 semillas):

| Metrica | Modelo (LoRA) | Base SD 1.5 |
|---|---|---|
| KID in-domain | 0.0121 | 0.1047 |
| CLIP score | 31.16 | 32.26 |
| LPIPS diversity | 0.7204 | 0.8107 |
| Preferencia humana (25 pares ciegos, 3 evaluadores) | 77,3% de victorias | 22,7% |
| Preferencia humana corregida por posicion | no disponible el valor exacto (el autor remite al informe combinado) | no disponible |

Nota: el autor advierte que el 77,3% esta inflado por sesgo de posicion (87% cuando el modelo final estaba en el lado preferido, 59% cuando no) y que el conjunto de test es pequeno, por lo que el KID es ruidoso.

## Requisitos de hardware

- VRAM para inferencia: el adaptador anade un coste minimo; el grueso corresponde al modelo base SD 1.5. En fp16, SD 1.5 requiere aproximadamente 4-6 GB de VRAM para generar a 512x512; en fp32, en torno a 8-10 GB (estimacion estandar, no reportada en la informacion del modelo).
- VRAM para entrenamiento: el autor reporta un pico de 7,2 GB con batch 4 y bf16, viable en GPUs consumer de 8-12 GB (RTX 3060 Ti, 3070, 4060 Ti, 4070).
- GPUs recomendadas: cualquier GPU con al menos 8 GB para entrenamiento y 4-6 GB para inferencia; A100/H100 no son necesarias dado el bajo coste computacional (0,384 GPU-horas).
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas para inferencia.
- Despliegue: `diffusers` (via `load_lora_weights`), y por extension del ecosistema SD 1.5, ComfyUI, Automatic1111 y otros frontends que acepten LoRA en formato compatible (no verificado en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| naruto-sd15-run2_lora_r32_attn_ff | LoRA sobre SD 1.5 | 11,97 M entrenables | no aplica | KID 0.0121 in-domain; CLIP 31,16 | CreativeML OpenRAIL-M + no comercial | Hugging Face |
| Stable Diffusion 1.5 (base) | Difusion text-to-image | ~860 M (UNet) | no aplica | KID 0.1047 in-domain; CLIP 32,26 | CreativeML OpenRAIL-M | Hugging Face |
| Otros LoRA de estilo Naruto sobre SD 1.5 | LoRA | no disponible | no aplica | no disponible | variable | Civitai / Hugging Face (no verificado) |

No se dispone de datos publicados de alternativas comparables en la informacion proporcionada; la comparacion con otros LoRA de estilo queda como no disponible.

## Limitaciones y advertencias

- Estilo y reparto estrechos: el adaptador esta especializado en Naruto y no generaliza a otros dominios visuales.
- Captions automaticas: el dataset usa captions BLIP, lo que puede introducir ruido y sesgos en la relacion texto-imagen.
- Posible memorizacion: el autor advierte de posible parecido con fotogramas de entrenamiento, con riesgo de reproduccion de material protegido.
- Conjunto de test pequeno: el KID es ruidoso y las conclusiones cuantitativas deben tomarse con cautela.
- Sesgo de posicion en la evaluacion humana: el 77,3% de victorias esta inflado; el dato corregido no se proporciona en la informacion disponible.
- Licencia restrictiva: entrenado sobre fotogramas de anime con derechos de autor; uso exclusivamente no comercial e investigador, ademas de las restricciones de CreativeML OpenRAIL-M del modelo base.
- Idiomas: sin soporte multilingue documentado; prompts en ingles recomendados por el text encoder CLIP.
- Sin garantias de calidad en produccion: repositorio sin descargas ni likes, sin versionado de pesos documentado y con tamano de repo de 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o no ser accesibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akashkumars/naruto-sd15-run2_lora_r32_attn_ff
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Libreria diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Informe de evaluacion humana: referenciado como `human_eval/ratings/` en la model card (no se proporciona URL directa)
