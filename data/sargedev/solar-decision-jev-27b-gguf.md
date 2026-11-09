# SargeDev/Solar-Decision-JEV-27B-GGUF

## Resumen

Solar-Decision-JEV-27B-GGUF es la distribucion cuantizada en formato GGUF del modelo Solar-Decision-JEV-27B, un fine-tune de 27.320.697.856 parametros desarrollado por SargeDev. Se trata de un modelo orientado a la generacion de texto y, de forma mas especifica, a la produccion de "decisiones tipadas" (*typed decisions*): elecciones de opcion multiple (`choice`), puntuaciones ordinales (`score`) y clasificaciones binarias (`noul`), con probabilidades calibradas. El modelo se presenta como "uncensored" y "abliterated", lo que implica que se han eliminado las capas de rechazo del modelo base.

El modelo base es un merge identificado internamente como "r32 + solar" sobre una arquitectura que el autor asocia con Qwen (etiqueta `qwen3.8`), e incorpora tensores de drafter MTP/nextn preservados en la exportacion f16 para permitir decodificacion especulativa en llama.cpp. La relevancia de esta publicacion reside en que el autor acompania la propia model card con una ablacion honesta que documenta que el merge combinado rinde *por debajo* de su modelo padre r32 en precision de decision tipada, ademas de quedar lejos de la referencia publicada de AutoTrust.

El repositorio contiene una escalera completa de cuantizaciones (desde Q2_K hasta Q8_0), con tamanos entre 10,11 GiB y 27,04 GiB, y mediciones de throughput en un dispositivo GB10. La licencia es Apache 2.0 y el pipeline declarado es text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base asociada a Qwen, etiqueta `qwen3.8`); merge "r32 + solar" con tensores drafter MTP/nextn |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); exportacion f16 con tensores `blk.64.nextn.*` preservados |

## Arquitectura y entrenamiento

El modelo es un transformer de 27,32 mil millones de parametros resultante de un merge de dos linajes: uno denominado "r32" (que incorpora un LoRA sobre `lm_head` con r=32, alpha=64, entrenado dentro del bucle de entrenamiento) y otro denominado "solar" (un adaptador r16 sin LoRA en `lm_head`). La model card detalla que los datasets empleados fueron `SargeDev/jev-distill-corpus-v3` y `SargeDev/solar-decisions-corpus-v4`, y que el modelo base en precision completa es `SargeDev/Solar-Decision-JEV-27B`.

La innovacion tecnica central es el diseno del "decision gate": la distribucion de decision se produce directamente desde el modelo mediante un LoRA entrenado en `lm_head`, en lugar de mediante una proyeccion separada sobre el estado oculto final. La ablacion publicada muestra que esta eleccion es determinante: con el readout entrenado dentro del modelo (r32 + lm_head LoRA) se alcanza un `choice` top-1 de 0,8693, mientras que una proyeccion separada en tiempo de lectura (solar r16) cae a 0,5054 sobre las mismas 27.695 filas. El merge combinado r32 + solar, pese a conservar el LoRA en `lm_head`, degrada el rendimiento hasta 0,8162 en `choice` top-1. Los tensores drafter MTP/nextn se preservan en la exportacion f16 para habilitar decodificacion especulativa en llama.cpp. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Produccion de decisiones tipadas con probabilidades calibradas: eleccion multiple (`choice`), puntuacion ordinal (`score`) y clasificacion binaria (`noul`).
- Modo "uncensored" y "abliterated": el modelo no incorpora las capas de rechazo habituales del modelo base.
- Compatibilidad con endpoints (`endpoints_compatible`) y con llama.cpp mediante `llama-server`.
- Soporte de plantilla de chat Jinja (`--jinja`) y de parametros de plantilla como `enable_thinking`.
- Decodificacion especulativa en llama.cpp gracias a la preservacion de los tensores drafter MTP/nextn.
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Clasificacion binaria calibrada en produccion: el modelo puede emplearse como clasificador `noul` con AUROC de 0,9810 y ECE de 0,0057 sobre el conjunto de evaluacion del autor; adecuado para filtrado de contenido, moderacion o triaje donde se requiera una probabilidad bien calibrada y no solo una etiqueta.
- Puntuacion ordinal de candidatos: con `score` top-1 de 0,7192, puede usarse para ordenar respuestas, productos o documentos en una escala ordinal, aunque el autor advierte que el resultado esta por debajo de la referencia AutoTrust y debe tratarse como un problema abierto.
- Eleccion multiple asistida: para tareas de seleccion entre opciones discretas (`choice` top-1 de 0,8162), util en enrutamiento de consultas o seleccion de herramientas, con la cautela de que el ECE de 0,1592 indica una calibracion deficiente en esta tarea.
- Chat de uso diario sin restricciones: el autor describe el fine-tune como "un modelo de chat diario claramente mejor que su base"; la variante Q4_K_M (15,65 GiB) es la recomendada como "daily-driver" y puede desplegarse con `llama-server -ngl 99 --jinja` para conversaciones multi-turno.
- Evaluacion de la propia investigacion sobre readouts de decision: la escalera GGUF y la ablacion publicada permiten reproducir el experimento sobre donde debe residir la distribucion de decision (dentro del modelo frente a proyeccion separada), lo que resulta util para investigadores que trabajen en calibracion y decision gates.
- Despliegue en hardware de gama alta con decodificacion especulativa: gracias a los tensores drafter MTP/nextn, puede configurarse en llama.cpp con decodificacion especulativa para reducir latencia en entornos con GPU de clase GB10 o superior.
- Experimentacion con modelos abliterated: para investigadores que estudien el efecto de la ablacion de rechazos sobre el comportamiento conversacional y la calibracion, el modelo ofrece una variante Apache 2.0 sin capas de rechazo.

## Benchmarks y rendimiento

Decision gate (AutoTrust-style, `test_set_30k` con placeholders `yuri_v1` D1 excluidos; n = 27.695 filas):

| Metrica | n | Jev Judgment r32+solar (este modelo) | Jev Judgment r32+lm_head | AutoTrust reference (publicada) |
|---|---|---|---|---|
| noul.AUROC | 9969 | 0,9810 (por debajo) | 0,9919 | 0,9961 |
| noul.top-1 | 9969 | 0,9274 | 0,9486 | n/a |
| noul.ECE | 9969 | 0,0057 | 0,0122 | n/a |
| noul.KL | 9969 | 0,0167 | 0,0081 | n/a |
| choice.top-1 | 9199 | 0,8162 (por debajo) | 0,8693 | 0,9041 |
| choice.ECE | 9199 | 0,1592 | 0,0051 | n/a |
| choice.KL | 9199 | 0,2208 | 0,0530 | n/a |
| score.top-1 | 8527 | 0,7192 (por debajo) | 0,8135 | 0,8910 |
| score.ECE | 8527 | 0,0377 | 0,0367 | n/a |
| score.KL | 8527 | 0,1332 (por debajo) | 0,0619 | 0,0210 |
| overall.top-1 | 27695 | 0,8264 | 0,8807 | n/a |
| overall.ECE | 27695 | 0,0625 (por debajo) | 0,0090 | 0,0011 |
| overall.KL | 27695 | 0,1203 (por debajo) | 0,0396 | 0,0185 |

Ablacion del readout de decision (mismas 27.695 filas, mismo harness y misma cabeza de decision + calibracion):

| Modelo | Readout de decision | choice top-1 | score top-1 | score KL | noul AUROC | overall ECE |
|---|---|---|---|---|---|---|
| AutoTrust (referencia publicada) | entrenado en el modelo (lm_head LoRA) | 0,9041 | 0,8910 | 0,0210 | 0,9961 | 0,0011 |
| r32 + lm_head LoRA (r=32, alpha=64) | entrenado en el modelo (lm_head LoRA) | 0,8693 | 0,8135 | 0,0619 | 0,9919 | 0,0090 |
| solar r16 (sin lm_head LoRA) | proyeccion separada en lectura | 0,5054 | 0,5369 | 0,4699 | 0,9449 | 0,0211 |
| r32 + lm_head LoRA + solar (combinado) | entrenado en el modelo (lm_head LoRA) | 0,8162 | 0,7192 | 0,1332 | 0,9810 | 0,0625 |

Throughput medido en un dispositivo GB10 (build CUDA, `-ngl 99`, pp512 / tg128, 3 repeticiones):

| Cuantizacion | Tamano | Decode tok/s (prompt / tokens) |
|---|---|---|
| IQ4_XS | 14,35 GiB | 955,42 / 14,02 |
| Q2_K | 10,11 GiB | 744,59 / 18,51 |
| Q3_K_L | 13,55 GiB | 794,24 / 14,06 |
| Q3_K_M | 12,56 GiB | 820,55 / 15,03 |
| Q3_K_S | 11,40 GiB | 797,17 / 16,41 |
| Q4_K_M | 15,65 GiB | 852,36 / 12,43 |
| Q4_K_S | 14,73 GiB | 901,82 / 13,27 |
| Q5_K_M | 18,18 GiB | 825,25 / 11,01 |
| Q5_K_S | 17,66 GiB | 843,25 / 11,38 |
| Q6_K | 20,88 GiB | 729,97 / 9,71 |
| Q8_0 | 27,04 GiB | 806,43 / 8,09 |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,11 GiB (Q2_K) y 27,04 GiB (Q8_0); Q4_K_M requiere 15,65 GiB y Q6_K 20,88 GiB.
- GPU recomendadas: el autor reporta mediciones en un dispositivo GB10 (clase GB10) con build CUDA y `-ngl 99`. No se especifican otras GPU en la informacion disponible.
- Cabe en GPU de consumo: las cuantizaciones Q2_K (10,11 GiB) e IQ4_XS (14,35 GiB) caben en GPU con 16 GB de VRAM; Q4_K_M (15,65 GiB) queda al limite de 16 GB; Q5_K_M y Q6_K requieren 24 GB o mas; Q8_0 (27,04 GiB) requiere 32 GB o mas. No se confirman modelos concretos de GPU de consumo en la informacion proporcionada.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `-ngl 99 --jinja` y `--chat-template-kwargs '{"enable_thinking": false}'`. El tag `endpoints_compatible` sugiere compatibilidad con endpoints. No se mencionan vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: medidos en GB10 con pp512 / tg128; el decode oscila entre 9,71 tok/s (Q6_K) y 18,51 tok/s (Q2_K), y el prompt processing entre 729,97 y 955,42 tok/s segun cuantizacion.
- Repositorio: 189,2 GB en total (incluye toda la escalera de cuantizaciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision gate (overall top-1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solar-Decision-JEV-27B-GGUF (este) | 27,32 mil millones | no disponible | 0,8264 | Apache 2.0 | GGUF en HF |
| Jev Judgment r32+lm_head (hermano) | no disponible | no disponible | 0,8807 | no disponible | referenciado en la model card |
| AutoTrust (referencia publicada) | no disponible | no disponible | n/a (overall ECE 0,0011) | no disponible | referencia externa |
| solar r16 (sin lm_head LoRA) | no disponible | no disponible | no disponible | no disponible | referenciado en la model card |

La comparacion se limita a los modelos evaluados en la propia ablacion del autor; no se dispone de datos de modelos externos de tamano o tarea comparable en la informacion proporcionada.

## Limitaciones y advertencias

- El merge combinado r32 + solar rinde por debajo de su padre r32 en todas las metricas de decision tipada: `choice` top-1 0,8162 frente a 0,8693; `score` top-1 0,7192 frente a 0,8135; `noul` AUROC 0,9810 frente a 0,9919. El autor lo declara explicitamente.
- La calibracion en `choice` es deficiente: ECE de 0,1592 y KL de 0,2208, muy superiores a los del padre r32 (0,0051 y 0,0530).
- El modelo queda por debajo de la referencia publicada de AutoTrust en `choice` (0,8162 frente a 0,9041), `score` (0,7192 frente a 0,8910) y `noul` AUROC (0,9810 frente a 0,9961); las celdas marcadas "(below bar)" difieren en mas de 5 puntos.
- Anadir un segundo adaptador sin readout (solar) sobre el backbone empeora la precision de decision tipada, segun la ablacion del autor.
- Modelo "uncensored" y "abliterated": no incorpora capas de rechazo, lo que implica riesgo de generar contenido inapropiado o danino sin filtros propios; requiere moderacion externa en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de los modelos generativos de este tamano.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingue.
- Longitud de contexto: no disponible; no se puede planificar el despliegue en funcion de la ventana.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en tareas distintas de las evaluadas.
- El harness de evaluacion fue validado por el propio autor contra la ruta conocida de r32 (reproduccion dentro de 0,001 en todas las metricas), por lo que las brechas reportadas se consideran reales segun la model card.
- Los benchmarks de throughput se midieron en un unico dispositivo GB10; no son extrapolables a otras GPU.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-GGUF
- Modelo base bf16: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B
- Dataset `jev-distill-corpus-v3`: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Dataset `solar-decisions-corpus-v4`: https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
