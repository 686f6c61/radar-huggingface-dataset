# saki-suzuka/Ornith-1.5-35B-A3B-DFlash2-Q4_K_M-GGUF

## Resumen

Ornith-1.5-35B-A3B-DFlash2-Q4_K_M-GGUF es una cuantizacion en formato GGUF del modelo borrador (draft model) DFlash2 asociado a Ornith-1.5-35B-A3B, un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token. El artefacto lo publica el usuario saki-suzuka a partir del checkpoint F16 convertido por Cobra91310, que a su vez deriva del borrador original de jzinno y del modelo objetivo de ornith-ai.

No se trata de un modelo conversacional autonomo: es un componente auxiliar disenado para decodificacion especulativa en llama.cpp. El borrador genera bloques de tokens a partir de los estados ocultos del modelo objetivo y este los verifica, lo que acelera la generacion sin alterar la distribucion de salida bajo decodificacion greedy. Su relevancia practica radica en que reduce el coste de inferencia del modelo grande manteniendo la calidad, y esta cuantizacion concreta rebaja el peso del borrador de 1,06 GB a unos 315 MB con un impacto minimo en la tasa de aceptacion.

La ficha describe, por tanto, un artefacto de infraestructura de inferencia mas que un modelo de proposito general. El modelo objetivo al que acompana, Ornith-1.5-35B-A3B, es el que aporta las capacidades de generacion; este GGUF solo tiene sentido cargado junto a el mediante los flags de decodificacion especulativa de llama-server.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 drafter (densa, 6 capas, block_size 16) sobre modelo objetivo MoE Ornith-1.5-35B-A3B |
| Parametros totales | 526.251.520 (dato de safetensors del repo); el borrador se describe como 0,5B denso |
| Parametros activos | no disponible para el borrador; el objetivo es A3B (~3B activos) |
| Longitud de contexto | no disponible de forma explicita para el borrador; los ejemplos de uso del objetivo llegan a 131.072 tokens (-c 131072) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo fuente) |
| Formato de pesos | GGUF (llama.cpp); fichero Ornith-1.5-35B-A3B-DFlash2-Q4_K_M.gguf, 314.976.288 bytes (~315 MB), SHA256 30a7df78657a545590f386e21932464d85bdfa41c3ff361c76c3de505ec61ad2 |

## Arquitectura y entrenamiento

El borrador emplea la arquitectura DFlash2, un esquema de decodificacion especulativa por bloques: el draft model consume los estados ocultos del modelo objetivo y propone bloques de hasta 16 tokens (block_size 16) que el modelo grande verifica en paralelo. La red es densa, con 6 capas y aproximadamente 0,5.000 millones de parametros, lo que la mantiene muy por debajo del coste del objetivo MoE de 35B totales y ~3B activos. La referencia tecnica del metodo es z-lab/Qwen3.6-35B-A3B-DFlash.

No se dispone de informacion sobre el dataset de entrenamiento del borrador, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card solo documenta el proceso de cuantizacion: conversion a GGUF con llama.cpp 0.9.0-dev (commit 827466b, 2026-11-12) y cuantizacion Q4_K_M desde el F16 de 1.063.708.608 bytes. La carga requiere builds de llama.cpp con soporte DFlash2 (PR #27816, b10896+ / v0.4.0).

## Capacidades

- Decodificacion especulativa por bloques: genera propuestas de tokens que el modelo objetivo verifica, acelerando la inferencia sin cambiar la salida bajo greedy.
- Integracion con llama.cpp: se carga mediante llama-server con --spec-type draft-dflash y --spec-draft-model.
- Aprovechamiento de estados ocultos del objetivo: el borrador no funciona de forma autonoma.
- Ajuste del numero de tokens propuestos: --spec-draft-n-max permite limitar la longitud del bloque especulado (3 en el ejemplo medido).
- No es un modelo de chat: no genera respuestas de forma independiente ni soporta tool calling, agentes o razonamiento multi-paso por si mismo.
- Capacidades multilingues: no disponibles (dependen del modelo objetivo, no documentadas para el borrador).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Aceleracion de inferencia en produccion: cargar el borrador junto al objetivo Ornith-1.5-35B-A3B en llama-server para reducir la latencia de generacion en despliegues con GPU limitadas, como el escenario medido con 2x Tesla T4.
- Servicio de chat de alta concurrencia: al mantener la calidad del objetivo y aumentar los tokens por segundo, permite atender mas peticiones por GPU en un backend conversacional.
- Despliegue en hardware con VRAM ajustada: la version Q4_K_M ahorra ~714 MB frente al F16, lo que facilita encajar el objetivo y el borrador en GPUs de 24 GB.
- Evaluacion comparativa de tecnicas de speculative decoding: sirve como referencia para medir tasas de aceptacion y throughput frente a otros borradores o esquemas.
- Pipelines de generacion de codigo o texto largo: cualquier carga de trabajo con decodificacion autoregresiva intensiva se beneficia de la verificacion por bloques, especialmente con contextos moderados (4K).
- Experimentacion en investigacion: permite reproducir los numeros publicados (88,1 tok/s a 4K, 44,2 tok/s a 66K) y estudiar el impacto del contexto en la aceptacion.
- Integracion en entornos de CI o herramientas de desarrollo local: builds recientes de llama.cpp con soporte DFlash2 permiten incorporar el par objetivo+borrador en flujos de asistencia de codigo.

## Benchmarks y rendimiento

Los datos publicados corresponden a mediciones de throughput y aceptacion en 2x Tesla T4 con el objetivo Ornith-1.5-35B-Q4_K_M en decodificacion greedy, mismas flags y prompts por pareja:

| Contexto | Borrador | tg (tok/s) | Aceptacion | Longitud media | VRAM (MiB) |
|---:|---|---:|---:|---:|---:|
| 4K | F16 (1,06 GB) | 88,2 | 0,729 | 3,19 | 25.356 |
| 4K | Q4_K_M (315 MB) | 88,1 | 0,716 | 3,15 | 24.642 |
| 66K | F16 | 43,9 | 0,445 | 2,33 | 28.256 |
| 66K | Q4_K_M | 44,2 | 0,440 | 2,31 | 27.542 |

La cuantizacion Q4_K_M ahorra unos 714 MB de VRAM en ambos tamanos de contexto, con throughput practicamente identico y una caida relativa de aceptacion del 1-2 %. La aceptacion depende del prompt y el tg presenta una variabilidad del 1-3 % entre ejecuciones. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) para este artefacto.

## Requisitos de hardware

- VRAM del borrador: ~315 MB en Q4_K_M; ~1,06 GB en F16.
- VRAM total del par objetivo+borrador: ~24,6 GB a 4K y ~27,5 GB a 66K con el objetivo en Q4_K_M y cache KV q8_0 (medido en 2x Tesla T4).
- GPU recomendadas: el escenario medido usa 2x Tesla T4; por el consumo de VRAM, tambien encaja en A100 40/80 GB, H100 y configuraciones multi-GPU.
- GPU de consumo: cabe en RTX 4090 (24 GB) solo en el limite inferior (4K con Q4_K_M), con poco margen; el contexto de 66K excede 24 GB. Una RTX 3090 queda por debajo del umbral medido.
- Opciones de despliegue: llama.cpp (llama-server) con soporte DFlash2 (build b10896+ / v0.4.0, PR #27816). No se documenta soporte en vLLM, TGI u Ollama.
- Flags de referencia: --spec-type draft-dflash, --spec-draft-ngl 999, --spec-draft-n-max 3, -c 131072, -np 1, -fa on, -ctk q8_0 -ctv q8_0, -b 2048, -ub 512.
- Latencia y throughput: 88,1 tok/s a 4K y 44,2 tok/s a 66K en la configuracion medida; el rendimiento cae aproximadamente a la mitad al pasar de 4K a 66K por la menor aceptacion (0,716 frente a 0,440).

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Cuantizacion | VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Q4_K_M) | Borrador DFlash2 | ~0,5B denso | Q4_K_M | ~315 MB | Apache-2.0 | Hugging Face |
| Cobra91310/...-draft-GGUF | Borrador DFlash2 | ~0,5B denso | F16 | ~1,06 GB | Apache-2.0 | Hugging Face |
| jzinno/Ornith-1.5-35B-A3B-DFlash2 | Borrador DFlash2 | ~0,5B denso | checkpoint original | no disponible | Apache-2.0 | Hugging Face |
| z-lab/Qwen3.6-35B-A3B-DFlash | Borrador DFlash de referencia | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparacion se limita al ecosistema DFlash2 de Ornith, ya que no se dispone de datos de otros esquemas de decodificacion especulativa (Medusa, EAGLE) aplicados a este objetivo.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo Ornith-1.5-35B-A3B cargado, el fichero no produce respuestas utiles.
- Requiere builds especificos de llama.cpp con soporte DFlash2; versiones anteriores no cargan el fichero.
- La tasa de aceptacion cae con el contexto (0,716 a 4K frente a 0,440 a 66K), de modo que la ganancia de velocidad se reduce en conversaciones largas.
- La aceptacion depende del prompt y del dominio; las cifras publicadas corresponden a un unico conjunto de prompts y una sola ejecucion por celda.
- Riesgo de alucinacion y sesgos: no evaluables para el borrador; dependen del modelo objetivo y no se documentan en esta ficha.
- Idiomas soportados: no disponibles; la cobertura linguistica la determina el objetivo.
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse la cadena de atribucion (jzinno, Cobra91310, ornith-ai) en despliegues de produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.
- El dato de parametros totales de safetensors (526.251.520) corresponde al borrador, no al modelo objetivo de 35B; no debe confundirse.

## Enlaces

- Hugging Face: https://huggingface.co/saki-suzuka/Ornith-1.5-35B-A3B-DFlash2-Q4_K_M-GGUF
- Borrador F16 convertido: https://huggingface.co/Cobra91310/Ornith-1.5-35B-A3B-DFlash2-draft-GGUF
- Checkpoint original del borrador: https://huggingface.co/jzinno/Ornith-1.5-35B-A3B-DFlash2
- Modelo objetivo: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Referencia DFlash2: https://huggingface.co/z-lab/Qwen3.6-35B-A3B-DFlash
