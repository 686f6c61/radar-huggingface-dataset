# ndgold/Qwen3-0.6B-EasyLanguage-4bit

## Resumen

Qwen3-0.6B-EasyLanguage-4bit es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3-0.6B, desarrollado por el autor independiente ndgold dentro del proyecto Live Linguist. Su propósito es reescribir transcripciones de habla en vivo hacia registros de lectura fácil (easy language) en 29 locales lingüísticos, siguiendo los estándares nacionales o europeos de cada idioma: Leichte Sprache en alemán, FALC en francés, Easy/Plain English en inglés, Lectura Fácil en español, y equivalentes en árabe y otras 24 lenguas. El modelo se ha cuantizado a 4 bits para inferencia en Apple Silicon mediante MLX.

El problema que aborda es específico: los modelos de propósito general responden bien a preguntas, pero no producen de forma fiable un registro simplificado. El ajuste se ha entrenado contra los mismos validadores deterministas que la aplicación usa en tiempo de ejecución (límites de longitud de frase, comprobaciones de gramática simple, anclaje a la fuente, fidelidad numérica, anti-parroting y guarda de idioma), de modo que el registro se convierte en el objetivo de optimización y no en un efecto secundario del prompting.

Con 596.049.920 parámetros totales, el modelo está pensado para subtitulado en vivo en dispositivo: completa un segmento dentro del presupuesto de streaming en un teléfono o un portátil sin ventilador, mientras que la variante de 1.7B del mismo proyecto actúa como opción de mayor calidad. La relevancia actual reside en que demuestra que un modelo sub-1B, ajustado con validadores explícitos, puede superar a su base y competir con modelos casi tres veces mayores en una tarea de registro acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino LoRA y cuantizacion 4-bit para MLX |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); no se documentan otras variantes en la informacion disponible |
| Idiomas soportados | 29 locales: de, fr, en, es, ar, da, et, fi, hi, it, ja, ko, nl, pt, ru, sk, sv, tr, vi, zh, uk, ro, bg, pl, hr, nb, hu, cs (y variantes pt-PT, pt-BR, zh-CN) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, sobre el que se aplica un ajuste fino LoRA y posteriormente una cuantizacion a 4 bits para su ejecucion con MLX en hardware Apple Silicon. El repositorio ocupa 1.0 GB y los pesos se distribuyen en safetensors. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica destacable es el enfoque de entrenamiento guiado por validadores: el ajuste se optimiza contra los mismos validadores deterministas que la aplicacion ejecuta en produccion, incluyendo limites de frases por idioma, comprobaciones de gramatica simple, anclaje al texto fuente, fidelidad de numeros, anti-parroting y una guarda de idioma incorrecto. Ademas, se entreno con un prompt corto sin ejemplos few-shot para que el modelo internalice el registro, lo que reduce la latencia en subtitulado en vivo. El dataset de ajuste supervisado esta publicado como ndgold/live-linguist-easylanguage-sft.

## Capacidades

- Simplificacion de texto hacia registros de lectura facil en 29 locales, con estandares por idioma (Leichte Sprache, FALC, Lectura Facil, Easy/Plain English, Yasashii Nihongo, entre otros).
- Division de frases largas y eliminacion de disfluencias propias de transcripciones de habla.
- Preservacion de nombres propios y cifras durante la reescritura (fidelidad numerica validada).
- Mantenimiento del idioma de entrada (language ID medio del 99,7% en 29 locales).
- Anti-parroting: tasa media de copia del 0% en la evaluacion reportada.
- Funcionamiento con prompt corto sin ejemplos few-shot, orientado a baja latencia.
- Soporte de escritura RTL (arabe) y de scripts sin separacion por espacios (japones, chino), evaluados con chrF en lugar de SARI.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Subtitulado en vivo accesible: el modelo reescribe transcripciones de habla en tiempo real hacia lectura facil; su tamano sub-1B le permite completar cada segmento dentro del presupuesto de streaming en un telefono o portatil sin ventilador, que es precisamente el escenario para el que se diseno.
- Accesibilidad cognitiva en servicios publicos: conversion de comunicaciones administrativas, sanitarias o legales a Lectura Facil o Leichte Sprache, con validacion automatica del registro para garantizar cumplimiento del estandar antes de publicar.
- Educacion y materiales para lectores con dificultades: simplificacion de apuntes, articulos o transcripciones de clase manteniendo nombres y cifras, con el 99,7% de permanencia en el idioma de entrada.
- Subtitulacion de reuniones y webinars multilingues: el modelo cubre 29 locales con guarda de idioma, lo que permite procesar sesiones en varios idiomas sin cambiar de modelo por locale.
- Post-procesado de transcripciones ASR: limpieza de disfluencias y segmentacion de frases largas generadas por sistemas de reconocimiento de voz antes de su publicacion o archivado.
- Investigacion en simplificacion de texto: el dataset SFT publicado y las metricas por locale (SARI, chrF, compliance, LID, parrot) permiten reproducir y comparar experimentos de simplificacion controlada por registro.
- Despliegue en dispositivo sin conectividad: al ejecutarse con MLX en Apple Silicon y ocupar 1.0 GB en 4 bits, es viable en escenarios de borde donde no se puede enviar audio o texto a la nube.

## Benchmarks y rendimiento

Evaluacion sobre test reservado de aproximadamente 200 frases por idioma.

| Metrica | 0.6B ajustado | Qwen3-0.6B stock |
|---|---|---|
| SARI medio (27 locales con separacion por espacios) | 52,7 | 37,7 |
| Cumplimiento de registro medio (29 locales) | 94% | 29% |
| Language ID medio (29 locales) | 99,7% | 97,3% |
| Tasa de parrot medio (29 locales, menor es mejor) | 0% | 10% |

Resultados por locale (seleccion):

| Idioma | Registro | SARI ajustado | SARI stock | chrF ajustado | chrF stock | Cumplimiento ajustado | Cumplimiento stock | LID ajustado | Parrot ajustado | Parrot stock |
|---|---|---|---|---|---|---|---|---|---|---|
| en | Easy / Plain English | 61,0 | 32,5 | 55,0 | 16,9 | 98% | 18% | 100% | 0% | 46% |
| vi | ETR / ISO plain language | 60,2 | 41,3 | 58,2 | 34,2 | 68% | 40% | 100% | 0% | 0% |
| es | Lectura Facil | 59,5 | 36,6 | 54,7 | 24,6 | 99% | 31% | 100% | 0% | 39% |
| pt-PT | Leitura Facil | 58,2 | 39,0 | 58,4 | 30,6 | 93% | 38% | 100% | 0% | 0% |
| fr | FALC | 58,0 | 33,3 | 51,5 | 17,9 | 99% | 28% | 100% | 0% | 49% |
| pt-BR | Leitura Facil | 55,3 | 37,5 | 51,9 | 23,4 | 76% | 45% | 100% | 0% | 0% |
| it | Easy to Read | 54,0 | 49,2 | 48,8 | 43,8 | 86% | 14% | 100% | 0% | 2% |
| de | Leichte Sprache | 47,6 | 33,0 | 41,9 | 15,6 | 98% | 26% | 100% | 0% | 63% |
| ar | Easy-to-Read (RTL) | 50,0 | 50,1 | 46,6 | 43,6 | 94% | 20% | 99% | 0% | 2% |
| ja | Yasashii Nihongo | n/a | n/a | 41,4 | 26,2 | 96% | 54% | 100% | 0% | 0% |
| zh-CN | ISO plain language | n/a | n/a | 51,5 | 12,7 | 94% | 30% | 100% | 0% | 0% |

Segun el autor, el ajuste de 0.6B iguala o supera al modelo stock de 1.7B en SARI en 22 de 27 locales. SARI se reporta como n/a para japones y chino porque la tokenizacion por espacios lo hace inaplicable en esos scripts; en su lugar se usan chrF, cumplimiento y LID.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1.0 GB en 4 bits, por lo que la inferencia requiere del orden de 1 GB de memoria unificada, mas el overhead de runtime de MLX y del contexto.
- GPU recomendadas: hardware Apple Silicon (serie M) mediante MLX; es el unico backend documentado en la informacion disponible.
- Cabe en GPU consumer: si, en equipos Apple Silicon; no se documenta soporte CUDA, ROCm ni Vulkan en la informacion disponible.
- Opciones de despliegue: libreria MLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras concretas; el autor indica que el modelo completa un segmento dentro del presupuesto de streaming en un telefono o portatil sin ventilador, y que el prompt corto sin few-shot reduce la latencia de subtitulado en vivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SARI medio | Cumplimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-0.6B-EasyLanguage-4bit | 596 M | no disponible | 52,7 | 94% | apache-2.0 | Hugging Face, MLX |
| Qwen/Qwen3-0.6B (stock) | 0,6 B | no disponible | 37,7 | 29% | no disponible en la informacion | Hugging Face |
| Variante 1.7B de Live Linguist | 1,7 B (aproximado) | no disponible | inferior o igual en 22 de 27 locales segun el autor | no disponible | no disponible | referenciada en el proyecto |

La comparacion con el modelo stock de 0.6B es la mas directa y esta documentada metrica a metrica. Frente a la variante de 1.7B del mismo proyecto, el autor afirma que el 0.6B iguala o supera el SARI en 22 de 27 locales y lo presenta como la opcion de baja latencia. No se dispone de datos de benchmarks frente a otros modelos de simplificacion especializados.

## Limitaciones y advertencias

- El modelo esta especializado en simplificacion de registro; no debe emplearse como asistente general ni para generacion libre de contenido.
- El cumplimiento de registro no es uniforme: baja al 68% en vietnamita y al 76% en portugues de Brasil, frente a valores del 96-100% en varios locales europeos. En produccion conviene mantener los validadores en tiempo de ejecucion.
- El rendimiento en SARI es inferior al stock en algunos locales concretos (arabe 50,0 frente a 50,1; italiano 54,0 frente a 49,2 es superior, pero el margen es menor que en otros idiomas), por lo que la mejora no es homogenea.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el anclaje a la fuente y la fidelidad numerica se validan de forma determinista, pero no se reportan tasas de error factual.
- El modelo no corrige ni verifica la veracidad del texto de entrada: solo lo reescribe. Una transcripcion erronea se propagara en el registro simplificado.
- Dependencia de MLX limita el despliegue a hardware Apple; no hay artefactos GGUF ni soporte documentado para CUDA.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Qwen3-0.6B tiene su propia licencia, que conviene verificar antes de redistribuir.
- El proyecto Live Linguist declara aplicaciones para macOS, iPhone/iPad, Android y PC pendientes de publicacion en tiendas; solo la build de macOS esta disponible, lo que afecta a la madurez del ecosistema.
- Modelo con muy poca traccion en Hugging Face (18 descargas, 0 likes en el momento de la consulta): no hay validacion independiente de los resultados reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ndgold/Qwen3-0.6B-EasyLanguage-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de ajuste supervisado: https://huggingface.co/datasets/ndgold/live-linguist-easylanguage-sft
- Proyecto Live Linguist: https://ndgold.com/live-linguist/
- Aplicaciones: https://ndgold.com/live-linguist/apps/
- Benchmarks completos: https://ndgold.com/live-linguist/models/
- Investigacion: https://ndgold.com/live-linguist/research/
