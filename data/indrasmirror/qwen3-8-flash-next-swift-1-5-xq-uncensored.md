# IndrasMirror/Qwen3.8-Flash-Next-Swift-1.5-XQ-Uncensored

## Resumen

Qwen3.8-Flash-Next-Swift-1.5-XQ-Uncensored es una cuantizacion GGUF de precision mixta publicada por IndrasMirror sobre el fine-tune Swift 1.5 de UkisAI, que a su vez parte de Qwen3.8-Flash-Next. El modelo mantiene la arquitectura de mezcla de expertos (MoE) del original: 176.943.899.520 parametros totales, de los cuales unos 6B estan activos por token, con una tabla PLE (n-gram) separada de 28,8 GB que se lee desde disco mediante `O_DIRECT`. El autor declara 256K de contexto servido y un regimen de ejecucion poco habitual: una RTX 4090 de 24 GB junto a 90 GB de RAM DDR4 y almacenamiento NVMe.

La relevancia de esta ficha no esta en el modelo base, sino en el ejercicio de ingenieria de cuantizacion. El pipeline XQ (privado) comprime los expertos enrutados a 2,61 bits por peso de media combinando bloques Q2_0, IQ4_XS, IQ1_M, IQ4_NL y Q8_0, mientras el backbone denso se mantiene en 5,5 GB bit a bit identico al padre Q8_0. El resultado son 44,9 GB sin la tabla PLE, es decir, un MoE de clase 125B que cabe en el almacenamiento y la memoria de una estacion de trabajo de consumo, servido con el motor Xolotl.

Ademas, el autor aplico una edicion de direccion de rechazo (abliteration) sobre los pesos en precision completa antes de cuantizar, de modo que el modelo responde sin negativas a prompts daninos en las pruebas internas (0 de 100 en JBB). La licencia es propietaria (`indras-mirror-xq-license-1.2`), lo que condiciona seriamente su uso comercial. El modelo esta pensado para generacion de texto y codigo agentico en ingles, chino y codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer, arquitectura `qwen4exp` (1224 tensores) |
| Parametros totales | 176.943.899.520 (aprox. 177B; el autor lo describe como 125B) |
| Parametros activos | Aprox. 6B por token (segun el autor) |
| Longitud de contexto | 256K servido (config `xolotl-qfn45.json`) |
| Tipos de cuantizacion | GGUF de precision mixta: Q2_0 (12,7 GB), IQ4_XS (10,7 GB), IQ1_M (9,9 GB), IQ4_NL (5,2 GB), Q8_0 (0,9 GB); media 2,61 bits/peso en expertos enrutados; backbone denso en Q8_0 |
| Idiomas soportados | Ingles, chino y codigo |
| Licencia | `indras-mirror-xq-license-1.2` (propietaria, "other") |
| Formato de pesos | GGUF dividido en 2 shards (`-00001-of-00002`, `-00002-of-00002`), mas pack de motor Xolotl (`pack-qfn45/`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3.8-Flash-Next a traves del fine-tune Swift 1.5 de UkisAI, descrito por el autor como un ajuste "reasoning-efficient". La estructura combina un backbone denso (5,5 GB en Q8_0, identico al padre) con expertos enrutados (39,4 GB a 2,61 bits/peso) y una tabla PLE de n-gramas de 28,8 GB que se lee desde disco con `O_DIRECT` en lugar de residir en VRAM. El autor no detalla el numero de expertos, el numero de capas ni la dimension oculta.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La innovacion documentada es doble: por un lado, la cuantizacion XQ de precision mixta por tipo de tensor (pipeline privado de Indras Mirror), que asigna formatos agresivos a los expertos y conserva el backbone en Q8_0; por otro, la edicion de direccion de rechazo aplicada sobre los pesos en precision completa antes de cuantizar, que segun el autor sobrevive intacta al proceso. El autor menciona tambien un borrador MTP para decodificacion especulativa (`--spec 4`) en el motor Xolotl.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 256K tokens.
- Razonamiento con modo "thinking" activado (empleado en las pruebas agenticas del autor).
- Generacion y edicion de codigo, incluida la resolucion de tareas de codificacion agentica con herramientas en sandbox.
- Capacidad agentica multi-paso: el banco Gauntlet v2 evalua 7 tareas de 10 turnos con herramientas y tests ocultos.
- Capacidades multilingues limitadas a ingles y chino, mas codigo.
- Respuestas sin rechazo ante prompts daninos (abliterated), verificado con 0/100 en JBB y 0/30 en controles seguros.
- Decodificacion especulativa mediante borrador MTP en el motor Xolotl.
- No se documentan capacidades de vision, audio ni tool calling estandarizado fuera del entorno de evaluacion del autor.

## Casos de uso

- Codificacion agentica local: el modelo resuelve tareas de varios turnos con herramientas y tests ocultos (5 de 7 en Gauntlet v2, con un turno medio de resolucion de 4,6), lo que lo hace util para pipelines de CI que requieran un agente que itere sobre el codigo sin salir de la maquina.
- Asistente de refactorizacion sobre repositorios grandes: con 256K de contexto puede cargar varios ficheros y transcripciones de agente; el autor mide perplejidad de 2,044 en texto de codigo, su mejor segmento.
- Procesamiento de transcripciones de agentes y logs de herramientas: el segmento "agent transcript" obtiene perplejidad de 4,457 y 74,1% de acierto en siguiente token, adecuado para resumir o continuar trazas de agentes.
- Despliegue en estacion de trabajo de consumo: con una RTX 4090, 90 GB de RAM y NVMe se obtienen 199 tok/s de decodificacion y 3.204 tok/s de prefill a 16K de prompt, suficiente para uso interactivo individual o equipos pequenos.
- Generacion de codigo en produccion con latencia medida: 160 tok/s de decodificacion a 8K de prompt permite integrar el modelo en bucles de edicion de codigo con respuesta casi inmediata.
- Investigacion sobre cuantizacion extrema: el modelo sirve como referencia reproducible para estudiar la degradacion de un MoE a 2,61 bits/peso frente al padre Q8_0 (83,5% de acuerdo top-1, KL de 0,243).
- Escenarios que requieren contenido sin filtros (red teaming, generacion de datos adversarios controlados), dado que el abliteration elimina las negativas; requiere supervision humana y aislamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor (Gauntlet v2: codigo agentico, 7 tareas, 10 turnos, herramientas en sandbox, tests ocultos, thinking activado):

| Modelo | Resueltas | SCORE | Turno medio | Tiempo total | Decodificacion |
|---|---|---|---|---|---|
| Este (45 GB) | 5/7 | 6,68 | 4,6 | 449 s | 164 tok/s |
| V1 xol-qfn (55,8 GB) | 6/7 | 6,50 | 5,8 | 856 s | 131 tok/s |
| Qwen API `qwen/qwen3.8-flash` | 5/7 | 5,50 | 6,6 | 2.021 s | n/a |

Perplejidad y acierto de siguiente token (5 segmentos x 999 posiciones, teacher-forced):

| Segmento | Perplejidad V1 | Perplejidad 45 GB | Acierto V1 | Acierto 45 GB |
|---|---|---|---|---|
| Codigo | 2,072 | 2,044 | 83,4% | 84,4% |
| Transcripcion de agente | 4,630 | 4,457 | 72,5% | 74,1% |
| Multilingue | 2,746 | 2,767 | 76,3% | 76,4% |
| Documentacion | 10,585 | 11,026 | 48,5% | 47,9% |
| Prosa en ingles | 4,437 | 5,070 | 58,9% | 56,7% |
| Global | 4,154 | 4,264 (+2,6%) | 67,9% | 67,9% |

Frente al padre Q8_0 abliterado (perplejidad 4,080):

| Fichero | Tamano sin PLE | Acuerdo top-1 | KL | Perplejidad |
|---|---|---|---|---|
| Este (XQ 45 GB) | 44,9 GB | 83,5% | 0,243 | 4,264 (+4,5%) |
| SC117 GSQ-RCO IQ3_XXS | 47,0 GB | 81,8% | 0,287 | 4,208 (+3,1%) |
| V1 xol-qfn (RTN) | 55,8 GB | 86,3% | 0,163 | 4,154 (+1,8%) |

Rendimiento (RTX 4090, Ryzen 7 5700X, 90 GB DDR4-3200, NVMe, contexto 256K, KV int8, `--spec 4`, 1.024 tokens generados):

| Prompt | Prefill (este) | Decode (este) | Prefill (V1) | Decode (V1) |
|---|---|---|---|---|
| 16.000 | 3.204 tok/s | 199 tok/s | 3.231 tok/s | 124 tok/s |
| 8.000 | 2.819 tok/s | 160 tok/s | 2.740 tok/s | 128 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: el backbone denso ocupa 5,5 GB en Q8_0; el resto de expertos y la tabla PLE se sirven desde RAM y disco. Configuracion de referencia del autor: RTX 4090 de 24 GB.
- RAM: 90 GB DDR4-3200 en la maquina de referencia; la decodificacion esta limitada por ancho de banda de memoria una vez caliente el area de expertos.
- Almacenamiento: NVMe imprescindible para la tabla PLE (28,8 GB) leida con `O_DIRECT`; el fichero completo son 73,7 GB.
- GPU recomendadas: RTX 4090 (unica validada por el autor). No se documentan pruebas en A100, H100 ni otras consumer.
- Despliegue: exclusivamente con el motor Xolotl (`github.com/Indras-Mirror/Xolotl`), construido sobre Strata; el autor advierte que otros runtimes no han sido probados con este fichero. El pack `pack-qfn45/` debe regenerarse con `tools/iq_pack.py` si se fusionan los shards.
- Latencia y throughput medidos: 199 tok/s de decodificacion y 3.204 tok/s de prefill a 16K de prompt; 160 tok/s de decodificacion a 8K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (Gauntlet v2) | Tamano sin PLE | Licencia |
|---|---|---|---|---|---|
| Este (XQ 45 GB) | 177B totales, ~6B activos | 256K | 6,68 (5/7) | 44,9 GB | Propietaria `indras-mirror-xq-license-1.2` |
| V1 xol-qfn | Mismo base Qwen3.8-Flash-Next | 256K (misma config) | 6,50 (6/7) | 55,8 GB | No disponible |
| SC117 GSQ-RCO IQ3_XXS abliterated | Mismo base Swift 1.5 | No disponible | No evaluado en Gauntlet | 47,0 GB | No disponible |
| Qwen API `qwen/qwen3.8-flash` | No disponible | No disponible | 5,50 (5/7) | n/a (servicio) | Comercial |

Frente al padre Q8_0, este fichero queda a 1,7 puntos de acuerdo top-1 y un 15% menos de KL que el build SC117, con 2,1 GB menos. No se dispone de comparativas con otros modelos de la misma categoria fuera del ecosistema Qwen3.8.

## Limitaciones y advertencias

- La licencia `indras-mirror-xq-license-1.2` es propietaria y restrictiva; debe revisarse el fichero LICENSE antes de cualquier uso comercial.
- El abliteration elimina las negativas ante contenido danino (0/100 en JBB), lo que supone un riesgo directo en produccion sin filtros externos.
- La prosa en ingles es el segmento mas debil: perplejidad de 5,070 frente a 4,437 del build V1 (14% peor), y acuerdo top-1 del 76,0% frente al padre Q8_0.
- La documentacion tambien degrada: perplejidad de 11,026 frente a 10,585 en V1.
- Solo se soportan ingles, chino y codigo; no hay cobertura documentada de otras lenguas, incluido el castellano.
- El pipeline de cuantizacion XQ es privado, por lo que la reproducibilidad del fichero no esta garantizada.
- Dependencia de un unico motor (Xolotl) sin pruebas en vLLM, llama.cpp, Ollama ni TGI; el autor lo declara explicitamente.
- El rendimiento depende del ancho de banda de RAM mas que de la GPU, lo que limita el escalado a otras configuraciones.
- Cada modelo del banco Gauntlet se ejecuto una sola vez, segun el autor; la diferencia 5/7 frente a 6/7 esta dentro de la varianza entre ejecuciones.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- El modelo base Qwen3.8-Flash-Next y el fine-tune Swift 1.5 no documentan en esta ficha su composicion de datos ni sus sesgos conocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndrasMirror/Qwen3.8-Flash-Next-Swift-1.5-XQ-Uncensored
- Licencia: https://huggingface.co/IndrasMirror/Qwen3.8-Flash-Next-Swift-1.5-XQ-Uncensored/blob/main/LICENSE
- Mediciones completas (GATES.md): https://huggingface.co/IndrasMirror/Qwen3.8-Flash-Next-Swift-1.5-XQ-Uncensored/blob/main/GATES.md
- Motor Xolotl: https://github.com/Indras-Mirror/Xolotl
- Strata: https://github.com/Niko1221/Strata
- Modelo base (UkisAI): https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Build alternativo SC117: https://huggingface.co/SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
