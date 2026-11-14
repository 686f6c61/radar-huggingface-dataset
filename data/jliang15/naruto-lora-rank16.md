# jliang15/naruto-lora-rank16

## Resumen

Naruto LoRA Rank 16 es un adaptador LoRA de bajo rango entrenado sobre Stable Diffusion 1.5 para la generación de imágenes con estética de la serie Naruto. Lo desarrolla jliang15 en el marco de la asignatura DATA 266 (Lab 2) y se libera como el modelo final de la Parte 2 del trabajo. El problema que aborda es el ajuste fino de un modelo de difusión genérico hacia un dominio visual muy concreto con recursos mínimos: 1.221 imágenes de entrenamiento y menos de una hora de GPU.

La relevancia del modelo es fundamentalmente metodológica y educativa: demuestra que un LoRA de rango 16 con 3.188.736 parámetros entrenables, learning rate 1e-4 y 1.000 pasos puede reducir el KID de 0,125323 a 0,028747 respecto al modelo base, con un pico de memoria de solo 2,47 GB y 0,5381 GPU-horas. No obstante, el CLIP score retrocede ligeramente (de 30,854467 a 30,664423) y la diversidad LPIPS baja de 0,792621 a 0,769214, lo que indica una especialización clara a costa de variedad y alineación prompt-imagen.

Se distribuye con licencia CreativeML Open RAIL-M heredada del modelo base, pero el autor restringe explícitamente el uso a investigación y educación no comerciales por los derechos de autor sobre los personajes e imágenes del conjunto de datos. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion 1.5 (UNet latente de difusión) |
| Parámetros totales | No disponible (el adaptador tiene 3.188.736 parámetros entrenables) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; resolución de entrenamiento 512×512) |
| Tipos de cuantización | No disponible (entrenamiento en FP16) |
| Idiomas soportados | No disponible |
| Licencia | CreativeML Open RAIL-M (uso restringido por el autor a investigación y educación no comerciales) |
| Formato de pesos | No disponible (adaptador LoRA sobre el checkpoint de Stable Diffusion 1.5) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 acoplado a Stable Diffusion 1.5, un transformer de difusión latente que genera imágenes a partir de texto. No se modifica la arquitectura base: se inyectan matrices de bajo rango en las capas del UNet, sumando 3.188.736 parámetros entrenables sobre el checkpoint congelado. El entrenamiento se realizó a resolución 512×512 con precisión mixta FP16, learning rate 1e-4, batch size 1, acumulación de gradiente 4 (batch efectivo 4), 1.000 pasos y semilla 266.

Los datos provienen de `lambdalabs/naruto-blip-captions`, con 1.221 imágenes etiquetadas mediante BLIP. Tras verificar que no había imágenes corruptas ni duplicadas, se dividió con semilla 266 en 1.098 imágenes de entrenamiento y 123 de test. El coste computacional fue reducido: 2,47 GB de memoria GPU pico, 1.937,01 segundos de entrenamiento y 0,5381 GPU-horas. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa; la innovación es la propia eficiencia del ajuste LoRA sobre un dataset pequeño.

## Capacidades

- Generación de imágenes texto-a-imagen en el dominio visual de Naruto (personajes, escenarios y estética de la serie).
- Adaptación de estilo sobre Stable Diffusion 1.5: se combina con el checkpoint base para producir variaciones fieles al dominio entrenado.
- Condicionamiento por prompt textual: acepta descripciones en lenguaje natural, aunque la calidad de alineación es inferior a la del modelo base según CLIP score.
- Generación de diversidad limitada pero controlada: mantiene LPIPS de 0,769214, suficiente para producir variaciones no idénticas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imágenes.
- No dispone de modo thinking, visión de entrada, audio ni capacidades multimodales más allá del texto a imagen.
- Capacidades multilingües: no documentadas; los prompts de entrenamiento derivan de captions BLIP en inglés.

## Casos de uso

- Prototipado de ilustración fan art: el adaptador permite generar bocetos de personajes de Naruto con un coste de inferencia mínimo, útil para artistas que quieran iterar rápidamente sobre composiciones antes de un trabajo manual.
- Docencia en ajuste fino de modelos de difusión: sirve como ejemplo reproducible de entrenamiento LoRA con hiperparámetros documentados (rango 16, lr 1e-4, 1.000 pasos) y métricas comparativas frente al base.
- Investigación en evaluación de modelos generativos: el par de métricas KID/CLIP/LPIPS y la evaluación humana ciega con 3 evaluadores y 25 pares permiten replicar protocolos de comparación.
- Generación de material para estudios de sesgo y seguridad: los 3 de 40 outputs filtrados por el safety checker permiten analizar la tasa de contenido no seguro en dominios de fan art.
- Creación de datasets sintéticos de dominio: se pueden generar imágenes etiquetadas de estilo Naruto para aumentar corpus de investigación, siempre dentro del uso no comercial.
- Experimentos de composición de adaptadores: al ser un LoRA de rango 16, se puede combinar con otros adaptadores o con el base para estudiar mezclas de estilos y su efecto en KID y CLIP score.

## Benchmarks y rendimiento

| Métrica | Base SD 1.5 | Rank 16 LoRA |
|---|---:|---:|
| KID ↓ | 0,125323 | 0,028747 |
| CLIP score ↑ | 30,854467 | 30,664423 |
| LPIPS diversity ↑ | 0,792621 | 0,769214 |
| NSFW filtrados | 0/40 | 3/40 |

Evaluación humana ciega con 3 evaluadores y 25 pares de imágenes: el modelo Rank 16 fue preferido en el 74,7% de las valoraciones de estilo de dominio y en el 50,7% de las de coincidencia con el prompt.

## Requisitos de hardware

- VRAM para entrenamiento: 2,47 GB de pico en FP16 con batch efectivo 4 y resolución 512×512.
- VRAM para inferencia: no disponible de forma explícita; al ser un adaptador sobre SD 1.5, el requisito lo determina el checkpoint base, típicamente varios GB según precisión y resolución.
- GPU recomendadas: no disponible; el entrenamiento cabe en GPUs de consumo con más de 2,47 GB de VRAM.
- Cabe en GPU de consumo: sí, dado el pico de 2,47 GB durante el entrenamiento.
- Opciones de despliegue: no documentadas en la información proporcionada (no se citan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a difusión; el despliegue sería mediante Diffusers o interfaces equivalentes de Stable Diffusion).
- Latencia y throughput: no disponibles. El tiempo de entrenamiento fue de 1.937,01 segundos (0,5381 GPU-horas).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/resolución | KID | CLIP score | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Naruto LoRA Rank 16 | LoRA sobre SD 1.5 | 3.188.736 entrenables | 512×512 | 0,028747 | 30,664423 | CreativeML Open RAIL-M (uso no comercial) | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 (base) | Difusión latente | No disponible | 512×512 | 0,125323 | 30,854467 | CreativeML Open RAIL-M | Ampliamente disponible |
| Otros LoRA de dominio sobre SD 1.5 | LoRA | No disponible | 512×512 | No disponible | No disponible | Variable | No disponible |

No se dispone de datos de benchmarks de otras alternativas LoRA en la información proporcionada; la comparación se limita al modelo base evaluado por el autor.

## Limitaciones y advertencias

- Sesgo de dominio: el dataset contiene únicamente imágenes de Naruto, por lo que el modelo generaliza mal a estilos o prompts fuera de dominio.
- Calidad de captions: las descripciones se generaron con BLIP y pueden ser imprecisas o demasiado genéricas, lo que afecta a la alineación prompt-imagen (CLIP score inferior al base).
- Alucinación de detalles: puede producir detalles incorrectos de personajes y falla en prompts composicionales complejos.
- Contenido no seguro: 3 de 40 salidas de evaluación fueron filtradas por el safety checker, lo que indica una tasa no despreciable de contenido potencialmente inapropiado.
- Licencia: aunque el modelo base es CreativeML Open RAIL-M, el autor restringe el uso a investigación y educación no comerciales por los derechos de autor sobre personajes e imágenes del dataset; el uso comercial requiere revisión legal adicional.
- Diversidad reducida: el LPIPS baja respecto al base (0,769214 frente a 0,792621), lo que puede traducirse en menor variedad de composiciones.
- Madurez: 0 descargas y 0 likes; no hay evidencia de uso en producción ni de validación externa.
- Idiomas: no se documenta soporte multilingüe; los prompts de entrenamiento están en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jliang15/naruto-lora-rank16
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambda/naruto-blip-captions
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Paper de LoRA: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
