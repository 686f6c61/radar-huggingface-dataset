# SargeDev/Solar-JEV-27B-GGUF

## Resumen

Solar-JEV-27B-GGUF es la escalera de cuantizaciones GGUF del modelo Solar-JEV-27B, un fine-tune de 27.320.697.856 parámetros desarrollado por SargeDev y especializado en la emisión de decisiones tipadas (*typed decisions*): elección múltiple (`choice`), puntuación ordinal (`score`) y clasificación binaria (`noul`). El modelo base es SargeDev/Solar-JEV-27B, a su vez derivado de una familia Qwen3.8 según los tags del repositorio, y se distribuye bajo licencia Apache 2.0. La relevancia de esta publicación está en que el autor acompaña los pesos con una evaluación honesta y autocrítica: los resultados en las tareas de decisión tipada quedan por debajo de la referencia publicada de AutoTrust, y la model card lo indica explícitamente.

La arquitectura subyacente es un transformer denso de aproximadamente 27.300 millones de parámetros, con tensores de *drafter* MTP/nextn preservados en la exportación f16 (blk.64.nextn.*) para habilitar decodificación especulativa en llama.cpp. El repositorio GGUF contiene once cuantizaciones distintas, desde Q2_K (10,11 GiB) hasta Q8_0 (27,04 GiB), todas construidas a partir de la misma exportación f16 de 866 tensores. Un detalle técnico relevante es que esta escalera se cuantizó a partir del merge «solar r16», no del r32, por lo que las cifras de la puerta de decisión de esta build no son comparables con las del r32.

El aspecto más importante para quien vaya a evaluar el modelo es la separación de rutas de uso: las decisiones tipadas requieren los logprobs del `lm_head` propio del modelo sobre los 24 identificadores de token verbalizador, algo que funciona en vLLM con el repositorio bf16 pero no en el servidor de llama.cpp de esta build, que no devuelve logprobs en ninguno de sus endpoints. Por tanto, esta escalera GGUF está pensada para chat cotidiano rápido con los mismos pesos, no para leer decisiones tipadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con tensores de drafter MTP/nextn preservados (no disponible el detalle fino de capas y dimensiones) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | IQ4_XS, Q2_K, Q3_K_L, Q3_K_M, Q3_K_S, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería llama-cpp); el repositorio base bf16 se distribuye por separado |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27.300 millones de parámetros afinado a partir de Solar-JEV-27B, que según los tags del repositorio pertenece a la familia Qwen3.8. La innovación técnica declarada no está en la arquitectura del transformer sino en la cabeza de decisión: el modelo incorpora un `lm_head` afinado con LoRA que produce distribuciones calibradas sobre 24 identificadores de token verbalizador, lo que permite leer decisiones tipadas (`choice`, `score`, `noul`) directamente a partir de los logprobs. La model card incluye una ablación sobre dónde debe residir la lectura de decisión, aunque el fragmento disponible se corta al inicio de esa sección y no permite detallar los cuatro brazos comparados.

El entrenamiento se apoya en dos corpus propios del autor: SargeDev/jev-distill-corpus-v3 y SargeDev/solar-decisions-corpus-v4. No se especifica en la información disponible el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se documenta que existen dos merges distintos, «solar r16» y «r32+lm_head», con comportamientos marcadamente diferentes en la puerta de decisión: el r32 alcanza un top-1 global de 0,8807 frente al 0,6448 del r16. Esta escalera GGUF deriva del r16, lo que explica sus cifras más bajas. La exportación f16 conserva 866 tensores por cuantización, incluidos los tensores de drafter MTP/nextn, lo que habilita decodificación especulativa en llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con `--jinja` en llama-server.
- Emisión de decisiones tipadas (`choice` de elección múltiple, `score` ordinal y `noul` binaria) mediante logprobs del `lm_head`, aunque solo operativa en la ruta vLLM con el repositorio bf16.
- Probabilidades calibradas sobre las decisiones emitidas, con métricas ECE y KL reportadas por el autor.
- Decodificación especulativa habilitada por la preservación de los tensores MTP/nextn en la exportación f16.
- Modo *thinking* controlable mediante `enable_thinking` en los kwargs de la plantilla de chat.
- Modelo marcado como *uncensored* y *abliterated*, es decir, con los mecanismos de rechazo eliminados o atenuados.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de visión, audio, tool calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Chat cotidiano de baja latencia: con Q4_K_M (15,65 GiB) el modelo decodifica a 12,60 tok/s y procesa prefill a 861,47 tok/s, adecuado para asistentes conversacionales en una sola GPU de consumo alta o en una GPU de datacenter.
- Despliegue en hardware con memoria limitada: Q2_K ocupa 10,11 GiB y decodifica a 18,44 tok/s, la opción más rápida de la escalera, útil para prototipos o entornos con VRAM restringida donde la fidelidad no es crítica.
- Evaluación de fidelidad máxima: Q8_0 (27,04 GiB) ofrece la mayor cercanía a los pesos originales a 8,15 tok/s de decodificación, apropiado para validar comportamiento antes de pasar a producción con cuantizaciones menores.
- Generación de texto asistida por decodificación especulativa: al conservarse los tensores MTP/nextn, llama.cpp puede acelerar la generación en los tamaños que lo soporten, útil en pipelines de generación por lotes.
- Investigación sobre calibración de decisiones: el repositorio incluye la cabeza de decisión, la calibración y el script `read_decision.py` para reproducir las métricas publicadas, lo que permite estudiar el comportamiento de un `lm_head` afinado con LoRA frente a una referencia externa.
- Experimentación con modelos sin censura: los tags *uncensored* y *abliterated* lo sitúan como candidato para estudios sobre alineación y rechazo, siempre con las advertencias de seguridad correspondientes.
- Base para fine-tunes de decisión: al ser Apache 2.0 y estar disponible en GGUF, sirve como punto de partida para adaptaciones en dominios donde se requiera clasificación calibrada.

## Benchmarks y rendimiento

Los datos de la model card corresponden a la puerta de decisión AutoTrust-style sobre `test_set_30k`, con los marcadores D1 de yuri_v1 excluidos (27.695 filas). Las cifras de esta escalera GGUF describen los pesos del merge «solar r16» y no son comparables con la fila del r32.

| Métrica | n | JEV solar r16 (esta build) | JEV r32+lm_head | Referencia AutoTrust publicada |
|---|---|---|---|---|
| noul.AUROC | 9.969 | 0,9449 (bajo el umbral) | 0,9919 | 0,9961 |
| noul.top-1 | 9.969 | 0,8657 | 0,9486 | n/a |
| noul.ECE | 9.969 | 0,0143 | 0,0122 | n/a |
| noul.KL | 9.969 | 0,0448 | 0,0081 | n/a |
| choice.top-1 | 9.199 | 0,5054 (bajo el umbral) | 0,8693 | 0,9041 |
| choice.ECE | 9.199 | 0,0338 | 0,0051 | n/a |
| choice.KL | 9.199 | 0,4994 | 0,0530 | n/a |
| score.top-1 | 8.527 | 0,5369 (bajo el umbral) | 0,8135 | 0,8910 |
| score.ECE | 8.527 | 0,0368 | 0,0367 | n/a |
| score.KL | 8.527 | 0,4699 (bajo el umbral) | 0,0619 | 0,0210 |
| overall.top-1 | 27.695 | 0,6448 | 0,8807 | n/a |
| overall.ECE | 27.695 | 0,0211 (bajo el umbral) | 0,0090 | 0,0011 |
| overall.KL | 27.695 | 0,3267 (bajo el umbral) | 0,0396 | 0,0185 |

El autor valida su propio arnés de evaluación replicando el merge r32 y obteniendo cifras dentro de 0,001 de la referencia en todas las métricas (choice top-1 0,8704 → 0,8693; score KL 0,0623 → 0,0619; noul AUROC 0,9920 → 0,9919), lo que respalda que las diferencias observadas son reales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

Rendimiento de inferencia declarado por tamaño:

| Cuantización | Tamaño | Decodificación (tok/s) | Prefill (tok/s) |
|---|---|---|---|
| IQ4_XS | 14,35 GiB | 13,80 | 957,69 |
| Q2_K | 10,11 GiB | 18,44 | 748,74 |
| Q3_K_L | 13,55 GiB | 14,02 | 797,34 |
| Q3_K_M | 12,56 GiB | 15,13 | 824,09 |
| Q3_K_S | 11,40 GiB | 16,42 | 804,86 |
| Q4_K_M | 15,65 GiB | 12,60 | 861,47 |
| Q4_K_S | 14,73 GiB | 13,28 | 898,03 |
| Q5_K_M | 18,18 GiB | 11,16 | 826,64 |
| Q5_K_S | 17,66 GiB | 11,36 | 842,57 |
| Q6_K | 20,88 GiB | 9,79 | 734,57 |
| Q8_0 | 27,04 GiB | 8,15 | 804,49 |

## Requisitos de hardware

- VRAM estimada: entre 10,11 GiB (Q2_K) y 27,04 GiB (Q8_0) solo para los pesos; hay que añadir el espacio de la caché KV, cuyo tamaño depende del contexto y no se documenta.
- GPU recomendadas: para Q8_0 y Q6_K se necesita una GPU de 32 GB o más (A100 40 GB, H100, RTX 5090); para Q4_K_M y Q5_K_M basta con 24 GB (RTX 4090, A10G 24 GB, L4 24 GB no alcanza para Q5_K_M con contexto amplio).
- Cabe en GPU de consumo: Q4_K_S (14,73 GiB) y Q3_K_M (12,56 GiB) encajan en tarjetas de 16 GB como la RTX 4080 o la RTX 4060 Ti de 16 GB; Q2_K (10,11 GiB) cabe en 12 GB.
- Opciones de despliegue: llama.cpp y llama-server son la ruta documentada (con `-ngl 99 --jinja`); para decisiones tipadas se requiere vLLM con el repositorio bf16 SargeDev/Solar-Decision-JEV-27B. No se documenta soporte de Ollama ni TGI en la información disponible.
- Throughput: prefill entre 734,57 y 957,69 tok/s según tamaño; decodificación entre 8,15 y 18,44 tok/s. Estas cifras corresponden al hardware del autor, que no se especifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Solar-JEV-27B-GGUF (esta ficha) | 27,3 B | No disponible | Apache 2.0 | GGUF (11 cuantizaciones) | Especializado en decisiones tipadas; r16 en GGUF |
| Solar-JEV-27B (r32+lm_head) | 27,3 B | No disponible | Apache 2.0 | bf16 (repo separado) | Mejor rendimiento en la puerta de decisión: overall top-1 0,8807 |
| Referencia AutoTrust publicada | No disponible | No disponible | No disponible | No disponible | Referencia externa: choice top-1 0,9041, score top-1 0,8910, noul AUROC 0,9961 |

No se dispone de información sobre otros modelos comparables de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias

- Las decisiones tipadas no pueden leerse desde el servidor de llama.cpp de esta build: no devuelve logprobs en `/v1/completions`, en `/completion` nativo ni con `echo: true`. Para esa ruta hay que usar vLLM con el repositorio bf16.
- Las cifras de la puerta de decisión de esta escalera corresponden al merge r16 y quedan por debajo de la referencia AutoTrust en `choice` (0,5054 frente a 0,9041) y `score` (0,5369 frente a 0,8910); el autor lo describe como resultado abierto, no resuelto.
- El modelo está marcado como *uncensored* y *abliterated*, lo que implica ausencia o atenuación de mecanismos de rechazo y un riesgo elevado de generar contenido inapropiado en producción sin filtros adicionales.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un fine-tune orientado a decisiones, la generación libre puede degradarse respecto al modelo base.
- No se documentan los idiomas soportados, lo que impide garantizar calidad multilingüe.
- No se documenta la longitud de contexto, dato crítico para dimensionar la caché KV y planificar despliegues.
- La licencia Apache 2.0 permite uso comercial, pero el carácter *uncensored* traslada al operador la responsabilidad sobre el contenido generado.
- El repositorio ocupa 189,2 GB, por lo que la descarga completa de la escalera no es práctica para la mayoría de entornos; conviene descargar solo el archivo de la cuantización elegida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SargeDev/Solar-JEV-27B-GGUF
- Modelo base: https://huggingface.co/SargeDev/Solar-JEV-27B
- Repositorio bf16 para decisiones tipadas: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Dataset de decisiones: https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4
