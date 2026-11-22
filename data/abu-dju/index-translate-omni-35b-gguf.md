# Abu-Dju/Index-Translate-omni-35B-GGUF

## Resumen

Index-Translate-omni-35B es un modelo multimodal de traduccion desarrollado por IndexTeam (publicado originalmente en ModelScope) y empaquetado en formato GGUF por el usuario Abu-Dju. Su proposito es cubrir traduccion de texto multilingue, traduccion de imagenes (image-to-text), reconocimiento automatico de voz (ASR) y traduccion bidireccional chino-ingles de voz, todo dentro de una unica familia de modelos con variantes de 2B, 9B y 35B (esta ultima con arquitectura MoE de 3B parametros activos, segun la nomenclatura 35BA3B).

La relevancia de esta ficha concreta es que se trata de una exportacion GGUF para llama.cpp de un modelo originalmente publicado en ModelScope, con pesos cuantizados en multiples formatos (desde Q2_K hasta f16) y un proyector de vision separado (`mmproj`). Es importante subrayar que la exportacion GGUF **no incluye el encoder de audio ni el conector de audio originales**: solo contiene el modelo de lenguaje y el soporte opcional de vision. Para funcionalidad de audio end-to-end hay que recurrir a los repositorios FP8 o FP4 del autor original.

El modelo declara licencia Apache 2.0 y soporte de idiomas chino e ingles. Con 34.660.610.688 parametros totales y un repositorio de 308 GB, esta orientado a despliegues con requisitos de memoria considerables, aunque las cuantizaciones bajas (Q2_K, Q3_K_S) permiten acercarlo a hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE (nomenclatura 35BA3B, 3B activos); exportacion GGUF para llama.cpp con proyector de vision separado |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | 3B (segun nomenclatura 35BA3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; proyectores de vision mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | zh, en (declarados); traduccion multilingue segun la model card original |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); f16 dividido en 2 shards, resto en fichero unico |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como una familia Index-Translate con variantes densas (2B, 9B) y una variante MoE de 35B con 3B parametros activos (35BA3B). El modelo omni integra modulos de lenguaje, vision y audio: la exportacion GGUF referencia 693 tensores de lenguaje, 333 tensores visuales y 529 tensores de audio compartidos nativos. La variante 35BA3B utiliza un unico encoder de audio y conector compartido para las cuatro tareas de voz (ASR chino, ASR ingles, EN→ZH y ZH→EN), lo que reduce el coste de mantenimiento frente a encoders especializados por tarea.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) empleadas. La model card menciona restricciones de terminologia y formato como parte del entrenamiento de instrucciones, evaluadas mediante los benchmarks instTrans e IFMTBench. La exportacion GGUF fue generada con un build de llama.cpp en o posterior al commit `9e2a04a439edc49f08c5acdafefae19df`, y el autor verifica 74 ficheros fijados por SHA-256 con un manifiesto de origen cuyo hash es `d3c6a02b3eb99d843f1aff5b3066d926d8c99a9fb359dd5cdd81945309c87f05`.

## Capacidades

- Traduccion de texto multilingue con restricciones de terminologia y formato (evaluada en FLORES, WMT24++, WMT26 y MEME).
- Traduccion de imagenes (image-to-text) con soporte de proyector de vision via `mmproj`.
- Reconocimiento automatico de voz (ASR) para chino e ingles en el modelo original; **no disponible en esta exportacion GGUF** por ausencia del encoder de audio.
- Traduccion bidireccional chino-ingles de voz en el modelo original; **no disponible en esta exportacion GGUF**.
- Seguimiento de instrucciones de traduccion (instTrans, instTrans_minor, IFMTBench).
- Capacidades conversacionales segun el tag `conversational`.
- Compatibilidad con endpoints (`endpoints_compatible`) en el ecosistema de Hugging Face.
- Capacidades multilingues limitadas a zh y en segun los metadatos declarados.

## Casos de uso

- Traduccion de documentacion tecnica zh↔en en pipelines de CI: el modelo puede procesar lotes de texto con restricciones de terminologia y formato, adecuado por su rendimiento en instTrans e IFMTBench y por la disponibilidad de cuantizaciones Q4_K_M (21,17 GB) para servidores con GPU de 24 GB.
- Localizacion de interfaces y capturas de pantalla: gracias al proyector de vision `mmproj`, se puede traducir texto embebido en imagenes (MMTIT, FLORES-rendered, Vistra), util para equipos de producto que necesitan localizar UI sin extraer manualmente el texto.
- Traduccion de contenido comercial y creativo: el benchmark MEME (0,7405 en la variante 35BA3B) sugiere capacidad para preservar matices en textos no literales, aplicable a campanas de marketing zh↔en.
- Procesamiento por lotes en CPU con llama.cpp: las cuantizaciones Q2_K (12,94 GB) y Q3_K_S (15,18 GB) permiten desplegar el modelo en estaciones de trabajo sin GPU dedicada, con la penalizacion de perplejidad documentada (+13,79% y +7,30% frente a f16).
- Investigacion en traduccion multimodal: el modelo sirve como referencia para estudiar el impacto de la cuantizacion en tareas de traduccion de imagen, dado que el autor publica perplejidad por formato y comparativas con la baseline Qwen3.5.
- Evaluacion de modelos MoE en traduccion: la variante 35BA3B con 3B activos permite experimentar con arquitecturas de mezcla de expertos en tareas de traduccion con un coste computacional por token relativamente bajo en comparacion con un denso de 35B.
- Integracion en asistentes conversacionales zh↔en: el tag `conversational` y la compatibilidad con endpoints facilitan su uso en backends de chat con llama.cpp como servidor.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card original (IndexTeam) y se refieren a los modelos sin cuantizar; no son resultados nuevos de esta exportacion GGUF.

Traduccion de texto (COMET22, mayor es mejor):

| Modelo | FLORES COMET22 | WMT24++ COMET22 | WMT26 Judge | MEME |
|---|---:|---:|---:|---:|
| Index-Translate 2B | 0,8655 | 0,8489 | 60,26 | 0,6443 |
| Index-Translate 9B | 0,8789 | 0,8601 | 75,35 | 0,7387 |
| Index-Translate 35BA3B (preview) | 0,8794 | 0,8586 | 76,76 | 0,7405 |
| Index-Translate-Omni 35BA3B | 0,8795 | 0,8593 | 78,01 | 0,7405 |

Seguimiento de instrucciones:

| Modelo | instTrans Quality / IFscore | instTrans_minor Quality / IFscore / Off-target | IFMTBench XCOMET-XXL / IFscore |
|---|---:|---:|---:|
| Index-Translate 2B | 0,5391 / 0,7569 | 0,3050 / 0,6586 / 3,97% | 0,7712 / 0,7584 |
| Index-Translate 9B | 0,6771 / 0,8209 | 0,5222 / 0,7725 / 3,47% | 0,7957 / 0,8760 |
| Index-Translate 35BA3B (preview) | 0,6901 / 0,8336 | 0,5151 / 0,7715 / 4,05% | 0,7926 / 0,8991 |
| Index-Translate-Omni 35BA3B | 0,6867 / 0,8371 | 0,5163 / 0,7843 / 3,62% | 0,7934 / 0,9070 |

Voz (CER en porcentaje, menor es mejor; BLEU/chrF2, mayor es mejor):

| Modelo | ASR chino CER | ASR ingles CER | EN→ZH (BLEU/chrF2/CER) | ZH→EN (BLEU/chrF2/CER) |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 13,8113 | 34,2560 | 36,982 / 30,357 / 43,3452 | 30,747 / 51,152 / 48,0670 |
| Index-Translate-Omni 9B | 17,8917 | 14,4097 | 43,507 / 36,312 / 41,3767 | 34,656 / 55,376 / 46,3720 |
| Index-Translate-Omni 35BA3B | 13,0053 | 15,4950 | 40,074 / 32,862 / 44,8097 | 32,411 / 53,452 / 46,1700 |

Traduccion de imagen (COMET22 × 100, mayor es mejor):

| Modelo | MMTIT | FLORES-rendered | Vistra |
|---|---:|---:|---:|
| Qwen3.5-2B | 52,164 | 50,187 | 55,326 |
| Index-Translate-Omni 2B | 65,809 | 53,612 | 65,596 |
| Qwen3.5-9B | 73,814 | 67,804 | 68,963 |
| Index-Translate-Omni 9B | 77,604 | 68,438 | 71,815 |
| Qwen3.5-35B-A3B | 75,602 | 70,005 | 71,067 |
| Index-Translate-Omni 35BA3B | 77,011 | 69,891 | 71,482 |

Perplejidad por cuantizacion GGUF (menor es mejor; cambio frente a f16):

| Cuantizacion | Tamano | PPL | Cambio vs f16 |
|---|---:|---:|---:|
| f16 | 44,67 GB | 10,3591 | baseline |
| Q8_0 | 36,90 GB | 10,2629 | -0,93% |
| Q6_K | 28,51 GB | 10,3571 | -0,02% |
| Q5_K_M | 24,73 GB | 10,6325 | +2,64% |
| Q5_K_S | 23,98 GB | 10,5102 | +1,46% |
| Q4_K_M | 21,17 GB | 9,8836 | -4,59% |
| Q4_K_S | 19,89 GB | 10,2842 | -0,72% |
| Q3_K_L | 18,12 GB | 10,0490 | -2,99% |
| Q3_K_M | 16,76 GB | 10,4829 | +1,20% |
| Q3_K_S | 15,18 GB | 11,1155 | +7,30% |
| Q2_K | 12,94 GB | 11,7878 | +13,79% |
| IQ4_XS | 18,94 GB | 10,2417 | -1,13% |

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: f16 44,67 GB; Q8_0 36,90 GB; Q6_K 28,51 GB; Q5_K_M 24,73 GB; Q4_K_M 21,17 GB; IQ4_XS 18,94 GB; Q3_K_M 16,76 GB; Q2_K 12,94 GB. Añadir el proyector de vision (`mmproj-f16` o `mmproj-Q8_0`) si se usa image-to-text.
- GPU recomendadas: A100 80 GB o H100 para f16 y Q8_0; A100 40 GB o RTX 6000 Ada para Q6_K y Q5_K_M; RTX 4090 (24 GB) para Q4_K_M, IQ4_XS y Q3_K_M.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M o inferiores, y en GPUs de 16 GB con Q3_K_M o Q2_K, asumiendo la penalizacion de perplejidad documentada.
- Opciones de despliegue: llama.cpp (build en o posterior al commit `9e2a04a439edc49f08c5acdafefae19df`), Ollama y servidores compatibles con endpoints. Para audio end-to-end hay que usar los repositorios FP8 o FP4 del autor original.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Traduccion texto (FLORES COMET22) | Traduccion imagen (MMTIT) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Index-Translate-Omni 35BA3B (esta ficha) | 34,66B totales / 3B activos | no disponible | 0,8795 | 77,011 | Apache 2.0 | GGUF en HF; FP8/FP4 en ModelScope |
| Index-Translate-Omni 9B | 9B | no disponible | 0,8789 | 77,604 | Apache 2.0 | ModelScope |
| Index-Translate-Omni 2B | 2B | no disponible | 0,8655 | 65,809 | Apache 2.0 | ModelScope |
| Qwen3.5-35B-A3B (baseline) | 35B / 3B activos | no disponible | no disponible | 75,602 | no disponible | no disponible |
| Qwen3.5-9B (baseline) | 9B | no disponible | no disponible | 73,814 | no disponible | no disponible |

## Limitaciones y advertencias

- La exportacion GGUF **no incluye el encoder de audio, el conector de audio ni el runtime de audio**: no es un modelo de traduccion de voz end-to-end. Para ASR o traduccion de voz hay que usar los repositorios FP8 o FP4.
- El rendimiento en ASR y traduccion de voz de la tabla de benchmarks corresponde al modelo original, no a esta exportacion.
- La cuantizacion degrada la perplejidad: Q2_K supone +13,79% y Q3_K_S +7,30% frente a f16; no se recomienda Q2_K para produccion con requisitos de calidad.
- El benchmark de voz se realizo con 30 muestras fijas por tarea y un caso EN→ZH alcanzo el limite de 256 tokens sin traduccion de destino, permaneciendo en la puntuacion; los recuentos de muestras difieren entre tamanos de modelo.
- Los resultados de traduccion de imagen cubren solo los subconjuntos evaluados y las configuraciones de imagen retenidas, no el conjunto completo.
- Idiomas declarados limitados a zh y en en los metadatos de esta exportacion; el soporte multilingue adicional del modelo original no esta verificado aqui.
- Riesgo de alucinacion y sesgos: no se documentan analisis especificos de sesgo en la informacion disponible; aplican los riesgos habituales de los modelos de traduccion entrenados sobre corpus web.
- Longitud de contexto no documentada: no se puede garantizar el manejo de documentos largos sin verificacion empirica.
- Repositorio de 308 GB: la descarga de todas las cuantizaciones es costosa; conviene descargar solo el formato necesario (los F16 requieren ambos shards).
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo original en ModelScope por si hubiera terminos adicionales.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Abu-Dju/Index-Translate-omni-35B-GGUF
- Modelo original en ModelScope: https://modelscope.cn/models/IndexTeam/Index-Translate-omni-35B
- Benchmarks publicados de Index-Translate-9B: https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation
