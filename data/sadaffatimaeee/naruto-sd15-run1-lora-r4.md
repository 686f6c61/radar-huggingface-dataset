# sadaffatimaeee/naruto-sd15-run1-lora-r4

## Resumen

Naruto-style LoRA es un adaptador de bajo rango (LoRA) para Stable Diffusion 1.5, desarrollado por el usuario sadaffatimaeee en el contexto del curso DATA 266 Lab 2 (Part 2, Pair Programming Team 16). El modelo permite generar imagenes de estilo anime inspiradas en la estetica de Naruto sobre el modelo base Stable Diffusion 1.5, sin necesidad de reentrenar el UNet completo: solo se adaptan las capas de atencion del UNet, mientras que el codificador de texto permanece congelado.

El adaptador se entrena sobre el conjunto de datos `lambdalabs/naruto-blip-captions`, con 1221 imagenes anotadas tras la limpieza y divididas 90/10 (1099 entrenamiento / 122 test), redimensionadas a 512x512. El entrenamiento se realiza con el script oficial de diffusers `train_text_to_image_lora.py`, con rango LoRA 4, 797.184 parametros entrenables, 750 pasos y una unica GPU Tesla T4, alcanzando un pico de memoria de 4,26 GB y un tiempo de 24,8 minutos (0,413 GPU-horas).

Su relevancia es principalmente didactica: es un ejemplo reproducible y de bajo coste de ajuste fino de un modelo de difusion mediante LoRA. No obstante, sus limitaciones son notables (estilo estrecho, prompts cortos y genericos, escaso seguimiento de instrucciones composicionales) y su licencia restringe el uso a investigacion y docencia no comercial, dado que las imagenes de entrenamiento contienen personajes con derechos de autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (solo capas de atencion del UNet; text encoder congelado) |
| Parametros totales | 797.184 parametros entrenables (adaptador LoRA); el modelo base SD 1.5 no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; sin contexto de texto en el sentido de LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (los prompts se infieren en ingles por el codificador de texto de SD 1.5) |
| Licencia | other (uso no comercial, solo investigacion y docencia) |
| Formato de pesos | diffusers (adaptador LoRA; el repo indica libreria `diffusers`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 4 aplicado exclusivamente a las capas de atencion del UNet de Stable Diffusion 1.5, manteniendo congelado el codificador de texto. Esto reduce el numero de parametros entrenables a 797.184 y permite ajustar el modelo en hardware de gama media. El entrenamiento emplea el script `train_text_to_image_lora.py` de diffusers con learning rate 0,0001 constante, 750 pasos, batch efectivo de 4 (1 x 4 acumulacion de gradientes), precision fp16, checkpointing de gradientes y semilla 266, sobre una Tesla T4.

Los datos provienen de `lambdalabs/naruto-blip-captions`: 1221 imagenes con leyendas BLIP cortas (unas 9 palabras) tras limpieza (0 corruptas, 0 duplicados eliminados), divididas 90/10 con semilla 266 (1099 entrenamiento / 122 test) y redimensionadas a 512x512. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales; el ajuste es puramente supervisado sobre pares imagen-texto. La evaluacion se realiza con 20 prompts fijos y semillas 0 y 1, usando DPM-Solver con 25 pasos y guidance 7.5.

## Capacidades

- Generacion de imagenes text-to-image en estilo anime inspirado en Naruto sobre Stable Diffusion 1.5.
- Ajuste ligero del UNet mediante LoRA de rango 4, combinable con el modelo base SD 1.5.
- Entrenamiento reproducible en una unica GPU T4 (pico de 4,26 GB, 24,8 minutos).
- Generacion condicionada por prompts cortos en ingles (leyendas BLIP de unas 9 palabras).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de modo de razonamiento, agentes ni multi-step reasoning.
- Capacidades multilingues: no disponibles; el codificador de texto de SD 1.5 esta orientado a ingles.
- No incluye vision, audio ni otras modalidades de entrada.

## Casos de uso

- Docencia y practicas de ajuste fino: el adaptador sirve como ejemplo reproducible de entrenamiento LoRA sobre un modelo de difusion con un presupuesto de computo minimo (menos de media GPU-hora en una T4), ideal para laboratorios de cursos de IA generativa.
- Investigacion sobre LoRA de bajo rango: permite estudiar el efecto del rango 4 y de 750 pasos sobre la calidad y diversidad de las imagenes generadas, con metricas KID, CLIP score y LPIPS ya documentadas.
- Generacion de arte conceptual de estilo anime para prototipos no comerciales: util para bocetos e iteracion rapida en proyectos de investigacion o docencia, siempre que se respete la restriccion no comercial.
- Experimentos de evaluacion de modelos generativos: la model card proporciona una metodologia concreta (20 prompts fijos, semillas 0 y 1, DPM-Solver 25 pasos, guidance 7.5) que puede reutilizarse para comparar adaptadores.
- Estudio de memorizacion y sesgos: el repo incluye una comprobacion de memorizacion (`memorization.png`) basada en similitud CLIP con la imagen de entrenamiento mas cercana, util para analizar riesgos de reproduccion de datos.
- Base para experimentos de composicion y control: aunque el modelo falla en prompts composicionales, sirve como punto de partida para investigar tecnicas que mejoren el seguimiento de colores, posiciones y recuentos.
- Filtrado de seguridad en pipelines de generacion: al pasar las imagenes por el safety checker de Stable Diffusion (filtro NSFW), puede integrarse en flujos de investigacion que estudien el comportamiento de estos filtros.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| KID frente a imagenes de test (prompts in-domain) | 0,0672 +/- 0,0093 |
| CLIP score (global) | 31,20 |
| CLIP score (in-domain) | 30,42 |
| CLIP score (out-of-domain) | 30,85 |
| CLIP score (composicional) | 33,09 |
| LPIPS de diversidad entre semillas 0 y 1 | 0,7801 |

Nota: el autor advierte que el KID es ruidoso con tan pocas imagenes. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un LoRA sobre SD 1.5 a 512x512, la inferencia es ligera y cabe en GPUs de consumo con suficiente VRAM para SD 1.5.
- VRAM de entrenamiento: pico de 4,26 GB en una Tesla T4 con fp16, batch 1 x 4 de acumulacion y checkpointing de gradientes.
- GPU recomendadas: Tesla T4 (validada por el autor); cualquier GPU con al menos la VRAM necesaria para SD 1.5 en fp16 deberia ser suficiente para inferencia.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas, aunque el dato no se detalla en la informacion disponible.
- Opciones de despliegue: libreria `diffusers` (formato del adaptador); otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a modelos de difusion.
- Latencia y throughput: no disponibles; el unico dato de tiempo es el entrenamiento (24,8 minutos, 0,413 GPU-horas).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros adaptadores LoRA de estilo anime en la informacion proporcionada. Como referencia estructural, se compara con el modelo base y con la categoria de adaptadores LoRA para SD 1.5:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Naruto-style LoRA (este) | 797.184 entrenables (LoRA r4) | no disponible | KID 0,0672; CLIP 31,20 | other (no comercial) | HuggingFace |
| Stable Diffusion 1.5 (base) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| Otros LoRA de estilo anime para SD 1.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estilo estrecho: el adaptador esta especializado en un unico estilo anime inspirado en Naruto y no generaliza a otros estilos.
- Leyendas cortas y genericas: las descripciones BLIP de unas 9 palabras describen sobre todo personajes masculinos, lo que sesga la generacion.
- Escaso seguimiento composicional: los prompts con colores, posiciones o recuentos a menudo no se respetan.
- Deriva out-of-domain: los prompts fuera del dominio tienden a derivar hacia el estilo anime.
- Riesgo de memorizacion: las imagenes de entrenamiento contienen personajes con derechos de autor; el autor incluye una comprobacion de memorizacion (`memorization.png`), pero el riesgo persiste.
- Licencia restrictiva: uso exclusivamente no comercial, de investigacion y docencia; no apto para produccion comercial.
- Filtro NSFW: las imagenes generadas pasan por el safety checker de Stable Diffusion, lo que puede bloquear resultados.
- Ruido en metricas: el KID calculado con solo 122 imagenes de test es poco fiable.
- Sin datos de cuantizacion ni de latencia: no se dispone de informacion para planificar despliegues a escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sadaffatimaeee/naruto-sd15-run1-lora-r4
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Script de entrenamiento de diffusers: https://github.com/huggingface/diffusers/blob/main/examples/text_to_image/train_text_to_image_lora.py
