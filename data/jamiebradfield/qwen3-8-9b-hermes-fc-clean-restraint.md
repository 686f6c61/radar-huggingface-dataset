# JamieBradfield/qwen3.8-9b-hermes-fc-clean-restraint

## Resumen

Qwen3.8-9B Hermes FC — Clean Restraint es un fine-tune experimental de 9.195 millones de parámetros construido por JamieBradfield sobre el modelo destilado `empero-ai/Qwen3.8-9B-Distill`. El objetivo declarado es enseñar planificación "todo-first" en tareas agénticas de múltiples pasos (el modelo invoca primero una herramienta de gestión de tareas antes de ejecutar acciones) y, simultáneamente, corregir la contaminación de la línea de fine-tunes previa, que había aprendido un reflejo de invocar herramientas incluso en conversación trivial. Se entrenó con QLoRA de 4 bits sobre 218 trayectorias sintéticas generadas por GLM-5.3-Flash.

El modelo es relevante ahora por dos motivos. Primero, porque su model card es un ejercicio poco habitual de autocrítica: el autor publica una corrección metodológica que invalida las métricas originales de la línea v26-v29 y demuestra que el modelo base ya invocaba herramientas correctamente por la ruta nativa `tools` de OpenAI, algo que su arnés sintético no medía. Segundo, porque cuantifica con precisión el coste de enseñar planificación: la mejora en planificación multi-paso (3/10 a 10/10 en la métrica todo-first) viene acompañada de regresiones medibles en contención (sobredisparo en consultas triviales) y de un colapso total en transcripciones que terminan con narración del asistente.

La arquitectura subyacente es `Qwen3_5ForConditionalGeneration` con cabeza MTP (multi-token prediction) de 15 claves, torre visual eliminada (el modelo es solo texto) y vocabulario ampliado en dos tokens de herramienta. La licencia es Apache-2.0. El programa de fine-tuning está congelado desde el 3 de septiembre de 2026 y el autor recomienda el modelo base como opción por defecto en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5ForConditionalGeneration` con cabeza MTP (multi-token prediction, 15 claves); torre visual eliminada |
| Parametros totales | 9.195.119.616 (9,20B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (configuración de servicio indicada por el autor, `CTX=65536`) |
| Tipos de cuantizacion | BF16 (merge completo), GGUF Q4 y Q8 publicados en repo complementario; ROCmFPX |
| Idiomas soportados | en (inglés únicamente, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (13 shards, BF16, 18,9 GB) y GGUF |
| Vocabulario | 248.079 tokens (248.077 base + 2 tokens de herramienta: `<|tool_call|>`, `<|tool_response|>`) |
| Modelo base | empero-ai/Qwen3.8-9B-Distill (warm start desde v27 merged `qwen3.8-9b-hermes-fc-todo`) |
| Metodo de ajuste | QLoRA 4-bit, rank 16, alpha 16, dropout 0 |
| Tamano del repo | 18,4 GB |

## Arquitectura y entrenamiento

El modelo parte de un transformer denso de 9,2B parámetros con cabeza de predicción multi-token (MTP) heredada del base, que conserva 15 claves en el merge. El vocabulario se amplió de 248.077 a 248.079 tokens para alojar los tokens especiales de invocación y respuesta de herramienta, y la torre visual del modelo original se descartó, dejando un modelo estrictamente de texto. El contexto de servicio declarado es de 65.536 tokens.

El entrenamiento consistió en un QLoRA de 4 bits (rank 16, alpha 16, dropout 0, batch 1 con acumulación de gradiente 8, learning rate 2e-4, warmup 0,1, `MAX_SEQ` 6144) durante 8 épocas, lo que supone 214 pasos y una pérdida final de 0,02085 (media de 0,09405). El corpus son 218 trayectorias en formato ShareGPT con 551 llamadas a la herramienta de tareas, generadas por GLM-5.3-Flash sobre 112 tareas sintéticas extraídas del corpus agéntico del autor: 190 trayectorias de profesor (85% verificadas por ejecución en sandbox, con fallos y recuperaciones inyectados en el 15,8% de las filas), 61 filas con cadena de pensamiento corta destilada, 159 solo con envoltura y 12 tareas sintéticas de búsqueda web. El conjunto incluye 87 filas de "no llamada" destinadas a enseñar contención. Los conjuntos de prueba se mantuvieron vírgenes, sin solapamiento con generación ni entrenamiento.

La innovación técnica destacable no está en el modelo sino en su proceso de evaluación: el autor documenta que su arnés original incrustaba los esquemas de herramienta en el texto de sistema, nunca pasaba el parámetro `tools` y exigía XML crudo `<tool_call>` en la respuesta, una forma de prompt que no coincide ni con la plantilla de chat del base ni con la ruta real de petición. Eso invalidó las métricas de toda la línea v26-v29 y motivó la congelación del programa.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat compatible con el ecosistema Qwen.
- Invocación de funciones y uso de herramientas por la ruta nativa `tools` de OpenAI, heredada del modelo base.
- Planificación "todo-first": en tareas de múltiples pasos, invoca primero una herramienta de gestión de tareas antes de ejecutar acciones (10/10 en el conjunto T2 con formato exacto 10/10 en la interfaz sintética).
- Emisión de envolturas de llamada limpias, sin texto en prosa alrededor de la llamada.
- Contención aprendida: 0/10 disparos en consultas de conversación fuera de tema y 0/10 de deriva temática hacia vocabulario del fine-tune (rocm, cuantización, llama-swap) en el conjunto T4.
- Razonamiento de cadena corta destilada en 61 filas del corpus de entrenamiento.
- Búsqueda web simulada en 12 tareas sintéticas del corpus.
- No soporta visión (torre visual eliminada), audio ni otros modos.
- Multilingüismo: no disponible; solo inglés declarado.

## Casos de uso

- Investigación sobre metodología de evaluación de tool calling: el modelo y su model card sirven como caso de estudio de cómo un arnés sintético puede certificar una capacidad inexistente en la interfaz real; útil para equipos que diseñan baterías de evaluación de agentes.
- Estudio de contraste entre planificación y contención: permite medir empíricamente el intercambio entre enseñar planificación multi-paso y preservar la abstención de llamadas, con conjuntos de prueba publicados y reproducibles.
- Reproducción de experimentos de SFT con QLoRA: la receta completa (rank, alpha, épocas, pérdida, composición del corpus, 214 pasos) permite replicar el ajuste sobre el mismo base con recursos modestos.
- Prototipado de agentes con planificación explícita en entornos controlados: para flujos donde se requiere que el modelo registre primero una tarea antes de actuar, con la advertencia de que la contención es inferior a la del base.
- Despliegue en local sobre GPU de consumo: la cuantización Q4 publicada es prácticamente sin pérdida (perplejidad 1,148 frente a 1,145 en Q8) y permite servir el modelo con llama.cpp u Ollama.
- Auditoría de contaminación de datasets: el contraste entre el linaje v28 (reflejo de herramienta por ~1900 filas con menciones a rocm) y este arm B (0/10 de deriva) documenta cómo el filtrado de corpus elimina reflejos no deseados.
- Generación de datos sintéticos de trayectorias agénticas: el pipeline con GLM-5.3-Flash, verificación en sandbox e inyección de fallos con recuperación es reutilizable para construir corpus de entrenamiento de agentes.

## Benchmarks y rendimiento

Datos publicados en la model card. La tabla corregida usa la ruta nativa `tools`, batería de 4 herramientas, decodificación greedy. La tabla por niveles usa el arnés sintético (esquemas en texto de sistema, XML crudo) sobre 50 sondas a Q4 y 65k de contexto.

Comparación corregida (ruta nativa):

| Modelo | T1 disparado | T1 name=todo | T2 todo-first | T3 disparado (objetivo 0) | T4 disparado (objetivo 0) |
|---|---|---|---|---|---|
| Base sin fine-tune | 18/20 | 17/20 | 3/10 | 5/10 | 0/10 |
| v28 ckpt-175 (este modelo) | 17/20 | 10/20 | 8/10 | 9/10 | 4/10 |
| armB2-175 (reentrenamiento limpio) | 10/20 | 8/20 | 10/10 | 4/10 | 0/10 |

Batería de 50 sondas sobre el arnés sintético (Q4, 64k, greedy):

| Nivel | v28-175 (control) | armB2-175 (este modelo) |
|---|---|---|
| T1 disparado | 17/20 | 6/20 |
| T2 disparado / formato exacto | 8/10 / 4/10 | 10/10 / 10/10 |
| T3 disparado (objetivo 0) | 5/10 | 1/10 |
| T4 disparado / deriva (objetivo 0/0) | 2/10 / 0 | 0/10 / 0 |

Perplejidad en regla de sondas reservadas: Q4 1,148 frente a Q8 1,145, lo que el autor interpreta como cuantización Q4 efectivamente sin pérdida. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en Q4 para los 9,2B parámetros, más la caché KV correspondiente al contexto configurado (65.536 tokens); aproximadamente 10-11 GB en Q8; unos 18,9 GB en BF16.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 y contextos largos con concurrencia; RTX 4090 (24 GB) para Q8 o Q4 con contexto extendido; RTX 3090 y RTX 4080 para Q4.
- Cabe en GPU de consumo: sí, en Q4 desde 8 GB de VRAM (con contexto reducido) y con holgura en 12-16 GB; en Q8 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF publicados; vLLM o TGI para el merge BF16 en safetensors; el autor indica que el modelo es compatible con endpoints (`endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor solo especifica `CTX=65536` para reproducir la batería de evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.8-9B Hermes FC Clean Restraint (este) | 9,20B | 65.536 | Nativo heredado del base; planificación todo-first aprendida (10/10 en T2 sintético); contención 0/10 en T4 | Apache-2.0 | Experimental, programa congelado |
| empero-ai/Qwen3.8-9B-Distill (base) | 9,20B | no disponible | Nativo correcto (18/20 T1, 17/20 name=todo); sin planificación todo-first (3/10) | Apache-2.0 | Recomendado por el autor como opción por defecto |
| qwen3.8-9b-hermes-fc-todo (v27, warm start) | 9,20B | no disponible | Herramientas ya integradas en vocabulario; linaje con contaminación por rocm | Apache-2.0 | Predecesor del linaje |
| v28 ckpt-175 (control del linaje) | 9,20B | no disponible | Planificación intermedia (8/10 T2) con regresiones de contención (9/10 T3, 4/10 T4) | Apache-2.0 | Sustituido por este checkpoint |

La comparación se limita al propio linaje porque la información proporcionada no incluye datos medidos de modelos externos de tamaño similar.

## Limitaciones y advertencias

- Colapso en el nivel T1 con transcripciones que terminan en narración del asistente: cuando la conversación acaba en una narración que en la traza real continuaba con una llamada a tarea, el modelo emite `<|im_end|>` inmediatamente y no continúa. Trece de las 20 sondas T1 terminan así y las 13 fallan; el autor lo atribuye a que el 37% de sus filas de entrenamiento terminan en narración desnuda.
- Regresión de contención frente al base: en la ruta nativa, el sobredisparo en consultas triviales (T3) sube de 5/10 en el base a 9/10 en este checkpoint, y la deriva de herramienta en trivialidades (T4) pasa de 0/10 a 4/10.
- Las métricas de la sección de evaluación original describen el arnés sintético y no deben leerse como competencia en la interfaz nativa; el propio autor lo advierte.
- Solo inglés declarado; no hay soporte multilingüe documentado.
- Sin capacidades de visión: la torre visual se eliminó en el merge.
- Riesgo de alucinación: no cuantificado en la información disponible; el corpus de entrenamiento es enteramente sintético y generado por un profesor (GLM-5.3-Flash), con el 15% de filas conteniendo fallos inyectados.
- Corpus de entrenamiento pequeño (218 trayectorias, 214 pasos de optimización), con pérdida final muy baja (0,02085) que sugiere riesgo de sobreajuste al formato del corpus.
- Licencia Apache-2.0: permite uso comercial, pero el estado experimental y las regresiones documentadas desaconsejan producción sin evaluación propia.
- El programa de fine-tuning está congelado desde el 3 de septiembre de 2026; no cabe esperar correcciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-clean-restraint
- Modelo base: https://huggingface.co/Empero/Qwen3.8-9B
- Modelo base del fine-tune: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Dataset de entrenamiento (repo separado, `hermes-fc-v28-data`): no disponible como URL directa en la información proporcionada
- Repositorio complementario con GGUF cuantizado: no disponible como URL directa en la información proporcionada
- Scripts de reproducción (`scripts/native_battery.py`, `scripts/todo_probes.jsonl`, `scripts/no_drift_probes.jsonl`): incluidos en el repositorio del modelo
- Apoyo al autor: https://ko-fi.com/jamesonbradfield
