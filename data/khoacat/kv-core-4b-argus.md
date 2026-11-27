# Khoacat/kv-core-4b-argus

## Resumen

kv-core-4b-argus es un adaptador LoRA (formato GGUF, 81 MiB) entrenado sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla el autor Khoacat en el contexto del proyecto Waker-AI, un sistema multi-agente de orquestación de tareas. El adaptador cumple la función de "Argus", el chip supervisor del sistema: recibe el paquete de datos en bruto de una ejecución (run.json, events.jsonl y verify_cache.json) y deduce el estado de cada tarea individual.

El problema que resuelve es concreto: inferir el estado de tareas de un pipeline (pending, running, stalled, done, failed) a partir de evidencia de ejecución, aplicando siete reglas deterministas de deducción. El autor reporta que este adaptador supera al modelo fusionado (merged) en la tarea específica, con 6/6 casos correctos frente a 1/6, tanto en estructura como en narrativa, sobre un conjunto de seis casos de prueba.

Es relevante ahora como ejemplo de adaptador LoRA de dominio muy estrecho, entrenado con 160 muestras etiquetadas por un oráculo determinista (no por un LLM juez), y publicado con un conjunto de limitaciones explícitas. El modelo base Qwen3.5-4B aporta la arquitectura y el conocimiento general; el adaptador añade la especialización en el formato de salida JSON y las reglas de supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA 4-bit) sobre transformer Qwen/Qwen3.5-4B |
| Parametros totales | 21.233.664 (adaptador LoRA); modelo base no disponible en la informacion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuracion de ejemplo en llama-server); el autor recomienda prompts < 1000 tokens |
| Tipos de cuantizacion | GGUF LoRA (81 MiB); el modelo base se usa en Q4_K_M en el ejemplo |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (LoRA, se usa con `--lora`, sin merge); libreria PEFT |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32, entrenado con QLoRA de 4 bits sobre Qwen/Qwen3.5-4B. La configuración de entrenamiento reportada es: learning rate 2e-4, 4 épocas, 80 pasos, pérdida final de 0,173, ejecutado en una GPU Kaggle T4. El resultado se exporta como LoRA en formato GGUF, de modo que se aplica directamente sobre una cuantización Q4_K_M del modelo base mediante la opción `--lora` de llama-server, sin necesidad de fusionar pesos.

El dato más singular es el conjunto de entrenamiento: 160 muestras cuyas etiquetas fueron generadas por un oráculo determinista (`argus.compute()`), no por un LLM evaluador. Esto elimina el sesgo de destilación de modelos comerciales y hace las etiquetas reproducibles. El adaptador aprende siete reglas de deducción explícitas (verify exit 0 implica done con evidencia; verify distinto de 0 implica failed; DONE sin verify implica done sin evidencia y escalado; FAILED/STOPPED sin verify implica failed; ausencia de eventos implica pending; silencio superior al umbral implica stalled y escalado; el resto implica running). La salida es una línea JSON por tarea con los campos task, state, evidence, escalate y why, más un summary y un indicador needs_human. No se reportan innovaciones de decodificación especulativa ni atención lineal.

## Capacidades

- Deducción de estado de tareas de un pipeline a partir de datos crudos de ejecución, con cinco estados posibles: pending, running, stalled, done y failed.
- Generación de salida JSON estructurada por tarea (task, state, evidence, escalate, why) más summary y needs_human.
- Aplicación de reglas de escalado: escalate restringido a `["lead"]` o `[]`.
- Redacción de narrativa de supervisión: cada campo why incluye la evidencia que lo justifica.
- Comprensión de los formatos de entrada run.json, events.jsonl y verify_cache.json.
- Multilingüe limitado a vietnamita e inglés.
- No dispone de tool calling, function calling, capacidades de agente autónomo, visión, audio ni modo de razonamiento extendido (el ejemplo de ejecución desactiva enable_thinking).
- No puede ejecutar comandos ni escribir ficheros.

## Casos de uso

- Supervisión de pipelines multi-agente: el adaptador lee el paquete de datos de una ejecución y emite el estado de cada tarea en JSON, lo que permite a un orquestador decidir qué tareas requieren intervención humana. Es adecuado porque su salida está restringida a un esquema fijo y sus reglas son verificables.
- Detección de tareas bloqueadas: al identificar el estado stalled cuando una tarea en ejecución lleva más tiempo del umbral sin eventos, permite disparar alertas o escalados al lead del equipo.
- Auditoría de evidencias de finalización: distingue entre done con evidencia (verify exit 0) y done sin evidencia (run marcado DONE sin verify), lo que ayuda a detectar cierres de tarea no verificados.
- Generación de resúmenes de estado para paneles de control: el campo summary y el indicador needs_human alimentan dashboards de monitorización de ejecuciones.
- Procesamiento en segundo plano de bajo coste: con un rendimiento de 5-6 tok/s en CPU/iGPU y aproximadamente 20 segundos por decisión, encaja en tareas de monitorización no interactivas.
- Prototipado de sistemas de supervisión soberana: al estar entrenado con etiquetas deterministas y sin PII, sirve como componente de referencia en arquitecturas que exigen trazabilidad del etiquetado.

## Benchmarks y rendimiento

Los únicos datos publicados son una evaluación interna del autor sobre seis casos, comparando el adaptador con la versión fusionada (merged) de kv-core:

| Tarea | Adaptador Argus | Modelo fusionado kv-core |
|---|---|---|
| 6 casos, evaluacion estructural | 6/6 | 1/6 |
| 6 casos, evaluacion narrativa (summary con estado, needs_human coherente con escalate, why con evidencia) | 6/6 | 1/6 |

El autor atribuye la diferencia a que el modelo fusionado (725 muestras de DAG/gate/triage) nunca vio este tipo de tarea, mientras que Argus tiene 160 muestras del formato correcto. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 81 MiB y el repositorio completo 0,1 GB; requiere además el modelo base Qwen3.5-4B en GGUF (Q4_K_M en el ejemplo).
- VRAM estimada para el modelo base en Q4_K_M: no disponible en la información proporcionada; un modelo de 4B en Q4 suele caber en GPUs de consumo, pero el autor no publica cifras.
- GPU recomendadas: no disponibles. El entrenamiento se realizó en una Kaggle T4; la inferencia se documenta en CPU/iGPU.
- Cabe en GPU de consumo: no confirmado explícitamente, aunque el tamaño del modelo base (4B en Q4_K_M) es compatible con GPUs de consumo típicas.
- Despliegue: llama-server (llama.cpp) con `-m Qwen3.5-4B-Q4_K_M.gguf --lora kv-core-4b-argus-lora.gguf -c 4096 -ngl 99`. El adaptador es GGUF LoRA y no requiere merge.
- Latencia y throughput: aproximadamente 20 segundos por decisión en CPU/iGPU, con 5-6 tok/s. Solo apto para tareas en segundo plano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kv-core-4b-argus | 21,2 M (LoRA) sobre base 4B | 4096 (recomendado < 1000) | Supervision de estado de tareas | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | Modelo generalista | Apache-2.0 | Hugging Face |
| kv-core (fusionado, mismo autor) | no disponible | no disponible | DAG/gate/triage | no disponible | No publicado |

No se dispone de datos de benchmarks comparativos con otros adaptadores de supervisión de pipelines en la información proporcionada. La comparación con el modelo fusionado del mismo autor es la única disponible y se recoge en la sección de benchmarks.

## Limitaciones y advertencias

- Tamaño de evaluación muy reducido: 6 casos en una sola ejecución; una diferencia de un caso equivale a 17 puntos porcentuales.
- Posible sobreajuste por memorización: los 6 casos de prueba pertenecen a la misma familia que las muestras de entrenamiento; no se ha demostrado generalización a ejecuciones nuevas y distintas.
- El código es el árbitro final: el oráculo `argus.py` decide state y escalate; el adaptador solo sirve para redactar la narrativa y la lectura rápida. Si el adaptador contradice al código, prevalece el código.
- Latencia elevada: unos 20 segundos por decisión en CPU/iGPU (5-6 tok/s), lo que lo inhabilita para uso interactivo.
- Idiomas limitados a vietnamita e inglés; no se garantiza calidad en castellano.
- Prompts recomendados por debajo de 1000 tokens, muy por debajo de la ventana de 4096 configurada.
- Sin capacidad de ejecutar comandos ni escribir ficheros.
- Riesgo de alucinación en los campos de evidencia y why no cuantificado por el autor.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Khoacat/kv-core-4b-argus
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Proyecto Waker-AI: https://github.com/khoacat12345/waker-ai (referenciado en la model card; no verificado)
- Documento de metodología A/B: SPLIT-RESULT.md dentro del repositorio del proyecto (no verificado)
