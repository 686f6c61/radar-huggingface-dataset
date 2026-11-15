# Mateus-Nery/lumi-contexto-4b-GGUF

## Resumen

Lumi-Contexto-4B es un modelo de lenguaje de 3.970 millones de parámetros (aproximadamente 4B) publicado por Mateus-Nery en formato GGUF para llama.cpp. Se trata de una fusión (merge) del modelo base ceia-br/lumi-4b, un ajuste en portugués del NVIDIA Nemotron 3 Nano 4B, con el propio Nemotron 3 Nano 4B de NVIDIA. El objetivo del merge es recuperar la ventana de contexto larga nativa del Nemotron (hasta 128.000 tokens), que el preentrenamiento continuado en portugués sobre secuencias cortas había degradado en el Lumi-4B original: este último pasaba de 98,6 en RULER-PT a 16k a 22,5 a 128k, mientras que el modelo fusionado mantiene 97,0 a 128k.

La arquitectura es híbrida: de las 42 capas, solo 4 son de atención, 21 son Mamba-2 con estado de tamaño fijo y 17 son MLP. Esta combinación mantiene un caché de contexto reducido incluso a 128k tokens, con un consumo medido de 5,3 GB de VRAM en Q4_K_XL sobre una RTX 5070 Ti. El modelo está entrenado y evaluado sin modo de razonamiento (thinking desactivado) y se distribuye con licencia heredada del Lumi-4B.

El modelo es relevante para quienes necesitan procesar documentos largos en portugués (o inglés) en hardware de consumo, sacrificando una cantidad pequeña de rendimiento en tareas de contexto corto (1,9 puntos en un total de 7.627 preguntas) a cambio de conservar la memoria de largo alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 42 capas (4 de atención, 21 Mamba-2, 17 MLP) |
| Parametros totales | 3.973.556.832 (≈3,97B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 128.000 tokens (131.072 en llama.cpp) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K_XL, Q6_K, Q5_K_S, Q4_K_XL, Q3_K_XL, IQ4_XS |
| Idiomas soportados | Portugués (pt), inglés (en) |
| Licencia | Otra (license_name: lumi-4b, heredada de ceia-br/lumi-4b) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un merge de ceia-br/lumi-4b (relación `merge`) con nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16. La arquitectura subyacente, heredada del Nemotron 3 Nano 4B, es híbrida: de las 42 capas totales, 4 son de atención, 21 son Mamba-2 con estado de tamaño fijo que no crece con la longitud del texto y 17 son MLP. Esta proporción explica el reducido coste de memoria del caché de contexto: con 128k tokens en un slot y caché en F16, el modelo BF16 ocupa 9,4 GB de VRAM.

El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. Sí se indica que el modelo se entrenó y evaluó sin razonamiento, que la imatrix de cuantización combina tres fuentes (calibración de las quants del Lumi-4B, el chat de la última etapa de entrenamiento y dos secuencias de 128k tokens leídas con el contexto lleno) y que los libros usados en la batería de agujas y las instrucciones verificables de la última etapa se excluyeron del entrenamiento o se deduplicaron contra IFEval para evitar contaminación.

## Capacidades

- Generación de texto conversacional en portugués e inglés.
- Procesamiento de contexto largo: hasta 128.000 tokens, con rendimiento casi equiparable al Nemotron en RULER-PT (97,0 frente a 97,3 a 128k).
- Recuperación de información en documentos largos (batería de agujas en portugués sobre libros de dominio público).
- Seguimiento de instrucciones verificables (IFEval PT y EN), aunque con rendimiento inferior al Nemotron en inglés (64,5 frente a 80,8).
- Conocimiento y razonamiento de múltiple opción (MMLU PT, MMLU-Pro, MMLU-Redux 2, MMMLU PT, INCLUDE PT).
- Modo de razonamiento (thinking) disponible en la plantilla de chat, activado por defecto y desactivable por servidor o por llamada.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Análisis de documentos jurídicos o contractuales en portugués: el modelo mantiene recuperación de agujas al 74,3% a 128k tokens, lo que permite localizar cláusulas o cifras concretas en expedientes extensos sin dividir el texto en fragmentos.
- Resumen y extracción de información de libros completos: con 128k tokens de ventana y un caché de contexto reducido (5,3 GB en Q4_K_XL), se puede procesar una obra entera en una sola pasada en una GPU de consumo.
- Asistencia conversacional en portugués con historial largo: útil para atención al cliente o soporte técnico donde la conversación acumula decenas de miles de tokens y se necesita recordar detalles mencionados al principio.
- Procesamiento por lotes en local con llama.cpp: el formato GGUF y las quants desde IQ4_XS (2,41 GB) permiten desplegar el modelo en estaciones de trabajo sin GPU dedicada de gran capacidad.
- Investigación en PLN en portugués: sirve como base para experimentos de contexto largo con licencia heredada del Lumi-4B, comparando frente a Nemotron 3 Nano 4B con el mismo protocolo de evaluación.
- Verificación de instrucciones en pipelines de evaluación: el modelo puede ejecutarse con `enable_thinking: false` para tareas deterministas de seguimiento de instrucciones con temperatura 0, integrable en arneses de evaluación tipo lm-eval.

## Benchmarks y rendimiento

Contexto largo, Q8_0, sin razonamiento, temperatura 0, caché de contexto en Q8_0:

| Modelo | RULER-PT 4k | RULER-PT 16k | RULER-PT 64k | RULER-PT 128k |
|---|---:|---:|---:|---:|
| Lumi-4B v0.2 | 97,9 | 98,6 | 44,5 | 22,5 |
| Nemotron 3 Nano 4B | 97,6 | 97,5 | 95,9 | 97,3 |
| Lumi-Contexto-4B | 96,7 | 97,6 | 94,1 | 97,0 |

Batería de agujas en portugués (5 tareas, 30 ítems cada una):

| Modelo | 4k | 16k | 64k | 128k |
|---|---:|---:|---:|---:|
| Lumi-4B v0.2 | 71,2 | 75,7 | 8,8 | 0,0 |
| Nemotron 3 Nano 4B | 74,7 | 78,8 | 80,9 | 80,8 |
| Lumi-Contexto-4B | 70,4 | 76,5 | 76,6 | 74,3 |

Desglose de la batería de agujas a 128k:

| Tarea a 128k | Lumi-4B v0.2 | Nemotron 3 Nano 4B | Lumi-Contexto-4B |
|---|---:|---:|---:|
| Una aguja | 0,0 | 100,0 | 100,0 |
| 16 agujas, pregunta por una | 0,0 | 100,0 | 93,3 |
| 4 agujas con el mismo nombre | 0,0 | 100,0 | 94,2 |
| Contraseña cambiada 8 veces, devolver la última | 0,0 | 40,0 | 23,3 |
| Cadena de 5 variables, devolver los nombres | 0,0 | 64,0 | 60,7 |

Contexto corto (BF16, sin razonamiento, temperatura 0, hasta 6.144 tokens por respuesta):

| Test | Lumi-4B v0.2 | Nemotron 3 Nano 4B | Lumi-Contexto-4B |
|---|---:|---:|---:|
| MMLU PT medio | 44,7 | 40,2 | 42,3 |
| MMLU PT graduación | 48,4 | 43,4 | 48,0 |
| Global MMLU PT | 61,2 | 56,7 | 59,0 |
| MMMLU PT | 58,4 | 57,1 | 59,6 |
| INCLUDE PT | 55,5 | 56,6 | 54,4 |
| IFEval PT | 33,1 | 38,7 | 30,5 |
| MMLU-Pro | 43,9 | 36,8 | 37,1 |
| MMLU-Redux 2 | 69,8 | 69,0 | 69,6 |
| IFEval EN | 67,8 | 80,8 | 64,5 |
| Total (7.627 preguntas) | 53,9 | 52,3 | 52,0 |

## Requisitos de hardware

- VRAM medida con 128k tokens en un slot y caché de contexto en F16 sobre RTX 5070 Ti: BF16 9,4 GB, Q4_K_XL 5,3 GB, IQ4_XS 4,7 GB.
- Tamaño de los archivos GGUF: BF16 7,96 GB, Q6_K_XL 4,56 GB, Q8_0 4,23 GB, Q6_K 3,93 GB, Q4_K_XL 3,13 GB, Q5_K_S 3,04 GB, Q3_K_XL 2,68 GB, IQ4_XS 2,41 GB.
- Cabe en GPU de consumo: el autor reporta ejecución a 128k tokens en una RTX 5070 Ti con las quants Q4_K_XL e IQ4_XS.
- Despliegue mediante llama.cpp (`llama-server`), con los flags `-ngl 99 -c 131072 -np 1 -fa on --jinja` y `--chat-template-kwargs '{"enable_thinking":false}'`.
- No se documentan en la información disponible rendimiento en vLLM, TGI, Ollama ni cifras de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RULER-PT 128k | Batería agujas 128k | Total contexto corto | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Lumi-Contexto-4B | 3,97B | 128k | 97,0 | 74,3 | 52,0 | lumi-4b (otra) |
| Lumi-4B v0.2 | ≈4B | 128k (degradado) | 22,5 | 0,0 | 53,9 | lumi-4b (otra) |
| Nemotron 3 Nano 4B | ≈4B | 128k | 97,3 | 80,8 | 52,3 | NVIDIA (no detallada en la información disponible) |

El Lumi-Contexto-4B recupera la memoria de largo alcance del Nemotron (97,0 frente a 97,3 en RULER-PT a 128k) conservando el sesgo hacia el portugués del Lumi-4B, con una pérdida de 1,9 puntos en el total de contexto corto respecto a la v0.2.

## Limitaciones y advertencias

- El preentrenamiento continuado en portugués del Lumi-4B degradó la memoria larga; el merge la recupera en gran medida, pero no la iguala por completo: 23,3 frente a 40,0 del Nemotron en la tarea de contraseña cambiada 8 veces a 128k.
- Rendimiento en IFEval EN notablemente inferior al Nemotron (64,5 frente a 80,8), y en IFEval PT también por debajo (30,5 frente a 38,7).
- El modelo se entrenó y evaluó sin razonamiento; la plantilla activa el thinking por defecto y debe desactivarse explícitamente para reproducir los resultados publicados.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo muestra debilidad en tareas de seguimiento de instrucciones estrictas, lo que puede aumentar el riesgo de respuestas no verificables en producción.
- Idiomas limitados a portugués e inglés; no se documenta soporte para otras lenguas.
- Licencia "otra" con nombre `lumi-4b`, heredada de ceia-br/lumi-4b; es necesario revisar los términos del modelo base antes de cualquier uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mateus-Nery/lumi-contexto-4b-GGUF
- Modelo base Lumi-4B: https://huggingface.co/ceia-br/lumi-4b
- Modelo base Nemotron 3 Nano 4B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Quants del Lumi-4B: https://huggingface.co/Mateus-Nery/lumi-4b-GGUF
- Cartilla del Lumi-Think-4B (protocolo de evaluación): https://huggingface.co/Mateus-Nery/lumi-think-4b-GGUF
- Fork de lm-eval con RULER-PT: https://github.com/Polygl0t/lm-evaluation-harness/blob/ruler_pt/lm_eval/tasks/ruler_pt/README.md
