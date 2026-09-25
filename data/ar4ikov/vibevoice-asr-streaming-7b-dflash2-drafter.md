# Ar4ikov/VibeVoice-ASR-Streaming-7B-DFlash2-Drafter

## Resumen

VibeVoice-ASR-Streaming-7B-DFlash2-Drafter es un modelo borrador (*drafter*) de bloques para decodificación especulativa, desarrollado por el usuario Ar4ikov, que acelera la inferencia del modelo de reconocimiento de voz VibeVoice-ASR-Streaming-7B. No es un modelo de ASR autónomo: es un componente auxiliar de 831 millones de parámetros que propone bloques de 8 tokens de una sola pasada, y el modelo principal los verifica después en una única pasada. Se distribuye bajo la arquitectura DFlash 2 de cinco capas, con inyección de claves y valores desde el modelo base y un selector de candidatos que reordena las predicciones de la cabeza del modelo principal.

La relevancia de esta pieza es que acelera entre 1,92x y 2,59x la decodificación del ASR en streaming sin alterar el resultado: la comprobación es exacta, de modo que la transcripción obtenida con el borrador es idéntica byte a byte a la que se obtiene sin él, incluyendo palabras, marcas de tiempo e identificadores de hablante. Esto la convierte en una vía de reducir latencia y coste computacional en despliegues de dictado y subtitulado en tiempo real sin asumir degradación de calidad.

El modelo se entrenó por autodestilación sobre las transcripciones greedy del propio VibeVoice-ASR-Streaming-7B, con aproximadamente 140 horas de audio procedentes de LibriSpeech, FLEURS, SOVA, AMI, llamadas de resultados financieros y VoxConverse. Está pensado exclusivamente para ejecutarse con el runtime vibevoice.c, en GPU CUDA y con decodificación greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2: borrador de bloques de 5 capas estilo Qwen3 (hidden 3584, 28/4 cabezas, intermediate 9472), bloque de 8 tokens |
| Parametros totales | 831.347.968 (831 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (por defecto en runtime), F16 y BF16 (el runtime puede retener un borrador BF16 en INT4) |
| Idiomas soportados | no disponible (el corpus de entrenamiento cubre LibriSpeech, FLEURS con 8 idiomas, SOVA, AMI, llamadas de resultados y VoxConverse) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El borrador es una red de 5 capas transformer con estética Qwen3 (dimensión oculta 3584, 28 cabezas de consulta y 4 de clave/valor, capa intermedia de 9472) y un tamaño total de 831 M de parámetros. Su innovación principal es la inyección de KV: para cada posición ya procesada por el modelo principal, se concatenan las salidas de las capas 1, 7, 13, 19 y 25, se proyectan mediante una capa `fc` y se normalizan; después cada capa del borrador convierte esas representaciones en claves y valores. De este modo el borrador ve la misma interpretación del audio y de la transcripción acumulada que el modelo principal, en lugar de depender únicamente de los embeddings de entrada. Sobre la atención y el MLP se aplican convoluciones dinámicas de dos tomas con kernels por fila, y un selector de candidatos reordena el top 16 por fila de la cabeza del modelo mediante un término pareado predecesor/sucesor de rango 256. El embedding y la cabeza LM son los del modelo principal y permanecen congelados. El borrador puntúa únicamente un vocabulario de borrador de 32.768 identificadores, que son los usados por sus transcripciones de entrenamiento más todos los identificadores de parada.

El entrenamiento es autodestilación en cuatro fases: primero se recopilan unas 140 horas de audio (2.872 clips de entrenamiento y 43 reservados) de LibriSpeech, FLEURS, SOVA, AMI, llamadas de resultados y VoxConverse, usando solo el audio y nunca el texto de los datasets; después se generan las transcripciones greedy del propio modelo con `vv_dflash_data gen`; a continuación se extraen trazas de cada posición con su token, su rol y las salidas de las cinco capas muestreadas, replicadas por el runtime como sesiones de streaming; y finalmente se entrena con `train.py` sobre PyTorch con flex attention, anclando posiciones generadas de 1 a 7 contra los 7 tokens siguientes con pesos e^(-k/4), usando entropía cruzada de la cabeza más la del selector, optimizador AdamW, esquema de coseno y precisión BF16. En trazas de 43 clips reservados el borrador logra 3,518 tokens aceptados por bloque de 8.

## Capacidades

- Propuesta de bloques de 8 tokens en una sola pasada para decodificación especulativa sobre VibeVoice-ASR-Streaming-7B.
- Verificación exacta: la transcripción con el borrador es idéntica byte a byte a la del decodificador greedy sin borrador, incluidas palabras, marcas de tiempo y hablantes.
- Aceptación selectiva dentro del bloque: el runtime comprueba las filas en una pasada y conserva las que el modelo acepta más una adicional.
- Funcionamiento en streaming: soporta sesiones por WebSocket y SSE con `vv_cli serve --slots N`.
- Compatibilidad con cualquier checkpoint de la misma familia VibeVoice-ASR-Streaming-7B, incluido `microsoft/VibeVoice-ASR-Streaming-7B`, porque solo lee estados ocultos, embedding y cabeza LM del modelo principal.
- Reordenación de candidatos mediante un selector entrenado con término pareado predecesor/sucesor (rango 256) sobre el top 16 de la cabeza.
- Modo de comprobación rápido (`--draft-check fast`) que usa atención flashinfer y proyecciones de prefill, con transcripción greedy dentro del redondeo.
- Conmutación de cuantización en runtime entre INT4 (por defecto) y F16.
- No ofrece generación autónoma de texto, tool calling, agentes ni capacidades multimodales propias: es exclusivamente un acelerador de decodificación.

## Casos de uso

- Subtitulado en tiempo real: integrado en `vibevoice.c` sobre el modelo ASR en streaming, reduce el coste por token decodificado entre 1,92x y 2,59x en una RTX 3090, lo que permite emitir texto cada 2,93 s de audio con menor consumo de GPU.
- Servicio de transcripción con hablantes: al mantener la transcripción idéntica byte a byte, se puede desplegar en producción sin recalibrar ni revalidar marcas de tiempo ni asignación de hablantes.
- Dictado médico o legal de baja latencia: la decodificación greedy exacta y la ausencia de alteraciones en el texto lo hacen apto para dominios donde no se tolera variación en el resultado.
- Procesado por lotes de archivos largos: en un archivo de 32 minutos el borrador sube de 131 a 275 tok/s con 8 filas por bloque, lo que reduce el tiempo total de transcripción de grandes volúmenes.
- Despliegue multisesión por WebSocket o SSE: con `--slots 4` permite atender varias sesiones de streaming simultáneas en una misma GPU, abaratando el coste por usuario concurrente.
- Prototipado de asistentes de voz: al bajar el coste de decodificación, facilita bucles de conversación con reconocimiento continuo en los que el presupuesto de latencia es ajustado.
- Investigación en decodificación especulativa: sirve como caso de estudio reproducible de DFlash 2 con inyección de KV y selector de candidatos sobre un modelo de ASR, con el pipeline de entrenamiento publicado en `tools/dflash`.
- Evaluación comparativa de cuantizaciones: permite medir el impacto de mantener el borrador en INT4 frente a F16 sobre el mismo hardware y la misma carga.

## Benchmarks y rendimiento

Rendimiento de decodificación con vibevoice.c `b72be15` (rama `dflash2`), RTX 3090, VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM, decodificación greedy, en tokens por segundo:

| Escenario | Sin borrador | Con borrador | Aceleracion | Tokens por bloque | Misma transcripcion |
|---|---|---|---|---|---|
| 20 clips reservados, 8 filas | 149 tok/s | 365 tok/s | 2,45x | 3,56 | 20/20 |
| Archivo de 2 minutos, 8 filas | 151 tok/s | 390 tok/s | 2,59x | 3,72 | Si |
| Archivo de 2 minutos, 4 filas | 151 tok/s | 316 tok/s | 2,10x | 2,85 | Si |
| Archivo de 32 minutos, 8 filas | 131 tok/s | 275 tok/s | 2,10x | 3,54 | Si |
| Archivo de 32 minutos, 4 filas | 131 tok/s | 252 tok/s | 1,92x | 2,76 | Si |

Métrica adicional: tokens aceptados por bloque de 8 en trazas de 43 clips reservados = 3,518. No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K, WER ni otros conjuntos de evaluación de reconocimiento de voz.

## Requisitos de hardware

- VRAM del borrador: el repositorio ocupa 1,7 GB; en INT4 el peso efectivo es menor, aunque el runtime puede retenerlo en F16.
- El borrador se suma a la VRAM del modelo principal VibeVoice-ASR-Streaming-7B, que en su versión AWQ W4A16 ocupa del orden de 4-5 GB, más la caché KV de las sesiones activas.
- GPU recomendadas: RTX 3090 es la plataforma de referencia medida; por el perfil de memoria cabe también en RTX 4090 y en GPUs profesionales como A100 o H100, donde el cuello de botella previsible es el ancho de banda de memoria.
- Plataforma limitada a CUDA: la ruta de CPU y la decodificación en Metal funcionan sin el borrador; no hay soporte de borrador fuera de CUDA.
- Opciones de despliegue: exclusivamente el runtime `vibevoice.c` con soporte DFlash 2 (rama `dflash2`, PR #48), mediante los comandos `vv_cli` y `vv_cli serve`. No hay integración declarada con vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: entre 252 y 390 tok/s de decodificación según el tamaño de bloque y la duración del audio, frente a 131-151 tok/s sin borrador en el mismo hardware.
- Banderas de ajuste relevantes: `--draft-block` (4 u 8 filas por pasada; sin la bandera el runtime elige la opción que más tokens por milisegundo conserva), `--draft-check exact|fast` y `--draft-quant int4|f16`.

## Comparativa con modelos similares

Los datos disponibles solo permiten comparar el despliegue con y sin este borrador sobre el mismo modelo base. No se dispone de cifras publicadas de otros borradores de decodificación especulativa (EAGLE, Medusa, DFlash 1 u otros) ni de comparativas frente a ellos en esta información.

| Configuracion | Modelo principal | Parametros extra | Aceleracion medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sin borrador | VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM | 0 | 1,00x (referencia) | MIT | vibevoice.c |
| Con este borrador (8 filas) | VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM | 831 M | 2,10x - 2,59x | MIT | vibevoice.c (rama `dflash2`) |
| Con este borrador (4 filas) | VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM | 831 M | 1,92x - 2,10x | MIT | vibevoice.c (rama `dflash2`) |
| Borradores alternativos de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia exclusiva del runtime: el checkpoint conserva los nombres publicados de DFlash 2, pero la inyección de KV, el selector y el vocabulario de borrador son la implementación concreta de vibevoice.c; otros runtimes no lo soportarán tal cual.
- Requiere la rama `dflash2` de vibevoice.c (PR #48), todavía no incluida en la versión estable publicada.
- Solo CUDA: la ruta de CPU y la decodificación en Metal funcionan sin borrador.
- Solo decodificación greedy; no hay soporte para muestreo, beam search ni temperaturas.
- Rendimiento desigual por idioma: el audio poco cubierto por el corpus, en particular mandarín y ruso, genera menos tokens aceptados y el runtime vuelve a pasos simples, quedando cerca de la velocidad sin borrador.
- El borrador no es un modelo autónomo: no genera texto por sí solo, no ofrece tool calling ni capacidades de agente.
- Riesgo de alucinación: no aplica al texto final, porque la verificación es exacta y el resultado coincide byte a byte con la decodificación greedy; el borrador solo altera el número de pasadas.
- Licencia MIT, tanto en el borrador como en VibeVoice, sin restricciones adicionales declaradas para uso comercial.
- Los datos de rendimiento proceden de un único hardware (RTX 3090) y de una revisión concreta del runtime (`b72be15`); no se garantizan en otras GPU ni en versiones posteriores.
- El corpus de entrenamiento es completamente en audio, sin uso del texto de los datasets originales, lo que acota el dominio acústico aprendido.
- No se declaran los idiomas soportados de forma explícita en la ficha del modelo, por lo que el alcance multilingüe real debe validarse por caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-DFlash2-Drafter
- Modelo base (AWQ W4A16 ASYM): https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM
- Paquete conjunto de modelo y borrador INT4: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM-DFlash2
- Modelo original de Microsoft: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-7B
- Repositorio vibevoice.c: https://github.com/Ar4ikov/vibevoice.c
- Pull request de soporte DFlash 2: https://github.com/Ar4ikov/vibevoice.c/pull/48
- Documentacion de DFlash en vibevoice.c: https://github.com/Ar4ikov/vibevoice.c/blob/main/docs/DFLASH.md
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Documentacion de VibeVoice-ASR-Streaming: https://github.com/microsoft/VibeVoice/blob/main/docs/vibevoice-asr-streaming.md
- Informe tecnico de VibeVoice-ASR-Streaming (arXiv): https://arxiv.org/abs/2609.02812
- Version HTML del informe: https://arxiv.org/html/2609.02812v1
