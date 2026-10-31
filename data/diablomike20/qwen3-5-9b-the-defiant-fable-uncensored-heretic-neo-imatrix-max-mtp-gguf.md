# diablomike20/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF es una cuantización GGUF, publicada por el usuario diablomike20, de un fine-tune multi-etapa de Qwen3.5-9B creado por DavidAU en colaboración con Nightmedia. El modelo base es un merge y fine-tune multi-modelo de varios ajustes de 9B de Qwen 3.5, con el objetivo declarado de aumentar la inteligencia general y el seguimiento de instrucciones. Además, es un modelo "Heretic" (post-abliterated), es decir, completamente sin censura, orientado a casos de uso como escritura creativa, ficción y roleplaying.

Su relevancia radica en que, según los benchmarks publicados por el autor, supera en 7 pruebas (ARC-C, ARC-E, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande) al Qwen3.5-9B-Instruct original e incluso a modelos de 27B como Qwen3.5-27B-Instruct, en cuantizaciones de 4 y 8 bits. El repositorio ofrece dos variantes de GGUF: regulares y "MTP" (multi-token prediction), estas últimas con predicción multi-token para acelerar la generación. Incluye soporte de visión (mediante archivo mmproj aparte), contexto de 256k tokens, modos de razonamiento (thinking) y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen 3.5), con MTP (multi-token prediction) en las variantes MTP; pipeline image-text-to-text |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | NEO IMATRIX GGUF (regulares y MTP), incluyendo Q4_K_S (4bit), 8bit y BF16/16-bit MTP; tensor de salida a 16 bits en todas las cuantizaciones; lista completa de quants no disponible |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (NEO IMATRIX, regulares y MTP); modelo base en safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo deriva de Qwen3.5-9B mediante un proceso descrito por el autor como "multi-stage and multi-model fine tune and multi-stage merge", realizado en hardware local. Se emplearon varios fine-tunes previos de 9B basados en Qwen 3.5 del propio autor como material de partida. Posteriormente se aplico el proceso "Heretic" (una tecnica de abliteration/eliminacion de rechazos) y el modelo fue entrenado de nuevo tras ese proceso ("trained post Heretic'ing"), de modo que no rechaza peticiones. El bloque de razonamiento (thinking) fue compactado y, segun el autor, reforzado.

Las cuantizaciones GGUF del repositorio son todas "NEO IMATRIX", que segun el autor mejoran la precision de los quants entre un 2-4 % respecto a GGUF normales, ademas del rendimiento en contexto largo. Adicionalmente, el tensor de salida (10-20 % del output) se mantuvo a precision completa de 16 bits en todas las cuantizaciones, y en las variantes MTP los tensores de multi-token prediction se fijaron a Q8_0. No hay datos disponibles sobre el numero de tokens de entrenamiento, composicion del dataset o uso de RLHF/DPO.

## Capacidades

- Generacion de texto general con seguimiento de instrucciones reforzado (objetivo central del fine-tune).
- Razonamiento (thinking/reasoning) con bloque de razonamiento compactado; segun la model card, en modo thinking supera los scores de modo instruct en la mayoria de benchmarks.
- Escritura creativa, ficcion y roleplaying (tags explicitos del modelo).
- Generacion de codigo (tag "coder"), sin benchmarks especificos de codigo publicados.
- Vision: pipeline image-text-to-text con vision activada, requiriendo descargar un archivo "mmproj" separado para usarla.
- Modelo completamente uncensored (post-Heretic): no implementa rechazos por seguridad.
- Cuantizaciones MTP con prediccion multi-token para inferencia mas rapida (hasta ~185 t/s en Q4_K_S segun pruebas del autor).
- Optimizacion de velocidad: se recomienda temperatura 1 o inferior y repetition penalty 1 (desactivado) para las variantes MTP.
- Compatible con todas las aplicaciones estandar que ejecutan GGUF.

## Casos de uso

- Escritura creativa y ficcion sin restricciones: el modelo esta explicitamente tuneado para creative writing, fiction y roleplaying, y al ser uncensored no bloquea contenido maduro o controversial solicitado por el usuario adulto.
- Roleplaying interactivo: los modos thinking compactados y el buen seguimiento de instrucciones permiten mantener personajes coherentes en conversaciones multi-turno largas gracias al contexto de 256k tokens.
- Asistentes locales con razonamiento: el modo thinking reforzado es adecuado para tareas que requieren descomposicion de problemas, y el contexto de 256k permite alimentar documentos extensos.
- Generacion y asistencia de codigo: con el tag "coder", puede integrarse en flujos de trabajo de desarrollo local; existe ademas una version extra robusta para "tools" (en Q6/Q8 segun la model card).
- Analisis de documentos largos: la ventana de 256k tokens, combinada con las NEO IMATRIX que mejoran el rendimiento en contexto largo, lo hace apto para resumir o consultar corpus extensos.
- Comprension de imagenes: mediante el archivo mmproj, puede responder preguntas sobre imagenes (image-text-to-text), util para OCR informal, descripcion de imagenes o agentes multimodales.
- Inferencia de alta velocidad en hardware de consumo: las variantes MTP alcanzan ~185 t/s en una RTX 5090 con Q4_K_S, adecuadas para aplicaciones interactivas en tiempo real.
- Prototipado y experimentacion de quants: el repositorio incluye variantes regulares y MTP para comparar velocidad y calidad segun el caso de uso.

## Benchmarks y rendimiento

Datos publicados por el autor (modo instruct, harness de benchmarks estandar):

| Modelo (quant) | ARC-C | ARC-E | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|
| Defiant-Fable 9B (bf16) | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Defiant-Fable 9B (mxfp8) | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Defiant-Fable 9B (mxfp4) | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.8-27B (mxfp8) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.6-27B-Instruct (mxfp8) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.5-27B-Instruct (mxfp8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |

El autor afirma 640 en ARC-C para las cuantizaciones de 8 y 4 bits (escala distinta a la tabla anterior) y que el modelo supera 7 de 7 benchmarks frente a Qwen3.5-9B, Qwen3.5-27B, Qwen3.6-35B-A3B, igualando en algunos casos a Qwen3.6-27B. Nota del autor: en modo thinking las metricas superarian a las de modo instruct en la mayoria de casos. No se han publicado benchmarks de MMLU, HumanEval, GSM8K ni pruebas de codigo o matematicas.

Velocidad (RTX 5090, Windows 11, LMStudio): ~130 t/s en Q4_K_S regular; >185 t/s en MTP con 60 % de aceptacion de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de ~9B, una quant de 4 bits (Q4_K_S) requiere en torno a 5-6 GB de VRAM y una de 8 bits en torno a 9-10 GB, mas el KV cache para contextos largos (hasta 256k, muy exigente en memoria).
- GPU recomendadas: el autor reporta pruebas en RTX 5090; en general, cualquier GPU de consumo con 8-16 GB (RTX 3090, 4090, 5090) ejecuta las quants de 4-8 bits con comodidad.
- Cabe en GPU de consumo: si, en quants de 4 y 8 bits; el BF16 completo (~18 GB) requiere GPUs de 24 GB o descarga parcial a CPU/RAM.
- Opciones de despliegue: cualquier aplicacion estandar compatible con GGUF (el autor prueba en LMStudio); por extension, llama.cpp, Ollama y backends derivados. No se mencionan vLLM o TGI (orientados a safetensors).
- Latencia y throughput: ~130 t/s con Q4_K_S regular y >185 t/s con MTP (aceptacion 60 %, 2 tokens) en RTX 5090; en Linux/Mac la velocidad suele ser mayor. Con aceptacion de tokens por debajo del 50 %, usar los GGUF regulares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable (este modelo) | ~9B | 256k | Si (thinking) | Si (mmproj) | Apache 2.0 | GGUF (regulares y MTP, NEO IMATRIX) |
| Qwen3.5-9B-Instruct (base) | ~9B | no disponible | Si | Segun variante | Apache 2.0 (segun familia Qwen) | Safetensors y GGUF |
| Qwen3.5-27B-Instruct | ~27B | no disponible | Si | Segun variante | Apache 2.0 (segun familia Qwen) | Safetensors y GGUF |
| Qwen3.6-35B-A3B-Instruct | ~35B (MoE) | no disponible | Si | Segun variante | Apache 2.0 (segun familia Qwen) | Safetensors y GGUF |

En los benchmarks del autor, este modelo de 9B supera al Qwen3.5-27B-Instruct en las 7 pruebas y al Qwen3.5-9B-Instruct de forma clara (p. ej., ARC-C 0,649 frente a 0,571), aunque queda por detras de Qwen3.6-27B-Instruct en varias pruebas (HellaSwag, BoolQ, Winogrande). Su ventaja principal es la relacion tamano/rendimiento y la ausencia de censura, no presente en los modelos base.

## Limitaciones y advertencias

- Modelo completamente uncensored y post-abliterated: no rechazara peticiones problematicas. Su uso conlleva responsabilidad legal y etica plena del desplegador; no es adecuado para entornos de produccion orientados a publico general sin capas de moderacion externas.
- Riesgo de alucinacion: no disponible (sin datos publicados); al tratarse de un fine-tune/merge no verificado independientemente, se recomienda validacion propia.
- Los benchmarks provienen unica y exclusivamente del autor del modelo, sin verificacion de terceros; las pruebas cubren tareas de conocimiento y razonamiento comun (ARC, BoolQ, PIQA, etc.), pero no codigo ni matematicas.
- El autor advierte que superar al 27B en 7 benchmarks no implica ganar al 27B en todas las tareas.
- Las variantes MTP degradan su rendimiento con temperaturas superiores a 1 y repetition penalty distinto de 1; con aceptacion de tokens inferior al 50 % son mas lentas que las regulares.
- La vision requiere descargar un archivo "mmproj" separado.
- Idiomas oficiales: ingles y chino; el rendimiento en castellano no esta documentado.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales del autor, aunque los terminos de Qwen base pueden aplicar segun la cadena de derivacion.
- La model card contiene material promocional y referencias a modelos futuros o paralelos ("plusIQ", Qwen 3.8 modes) cuya verificacion no es posible desde la informacion disponible.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/diablomike20/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo 27B relacionado mencionado en la model card: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Paper, demo y repositorio de codigo: no disponible
