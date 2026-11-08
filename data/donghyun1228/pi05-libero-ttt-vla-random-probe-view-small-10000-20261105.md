# Donghyun1228/pi05-libero-ttt-vla-random-probe-view-small-10000-20261105

## Resumen

El modelo `pi05-libero-ttt-vla-random-probe-view-small-10000-20261105` es un checkpoint de robótica basado en la arquitectura π0.5 (pi05) de Physical Intelligence, adaptado mediante la técnica TTT-VLA (test-time training para vision-language-action) sobre el benchmark LIBERO. Lo publica el usuario Donghyun1228 como parte de un repositorio de investigación (`Donghyun1228/vla_adaptation`) orientado a estudiar la adaptación de políticas VLA congelando el backbone y ajustando únicamente un prompt latente. El checkpoint parte de un modelo fuente (`pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021`) y aplica 10.000 pasos de optimización sobre un subconjunto de "random probes" de la vista reducida (`view_small`).

El problema que aborda es la adaptación eficiente de políticas robóticas a nuevas distribuciones de observación sin reentrenar el modelo completo: solo se ajustan 16 × 2048 parámetros del `latent_prompt`, manteniendo congelados los otros 70 tensores. El resultado es un checkpoint de 13,8 GB en FP32 con una tasa de éxito agregada del 69,70 % en los cuatro suites de LIBERO (2000 episodios), lo que lo convierte en una referencia útil para comparar estrategias de adaptación (TTT, LoRA, probing) en el mismo benchmark.

Es relevante ahora porque la comunidad de VLA está migrando hacia métodos de adaptación de bajo rango y test-time training, y este checkpoint proporciona un punto de comparación reproducible con métricas por suite, semillas y entorno de ejecución documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 (pi05), transformer con backbone VLM congelado y `latent_prompt` adaptativo |
| Parametros totales | no disponible (el repo pesa 13,8 GB en FP32; 71 tensores exportados en `adapted.npz`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en FP32) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones robóticas, no a texto general) |
| Licencia | apache-2.0 |
| Formato de pesos | `adapted.npz` (71 tensores FP32) + `adapted.json`; normalización en `assets/donghyun/libero` |

## Arquitectura y entrenamiento

El modelo se construye sobre π0.5 (pi05), una política VLA que combina un backbone vision-language con un cabezal de acción. En esta variante TTT-VLA, el backbone y la mayoría de los tensores permanecen congelados; solo el `latent_prompt` de dimensiones 16 × 2048 se adapta mediante una pérdida de "state-grounding" (proxy) calculada sobre random probes de la vista `view_small`. El entrenamiento parte del checkpoint fuente `pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021` (commit `a74334b4`, fichero `sg_lp.npz`) y aplica 10.000 actualizaciones con AdamW, LR constante 1e-5, weight decay 0, batch 128 y semilla de loader 0. Los datos de adaptación son los primeros 1250 fotogramas de cada una de las 40 tareas (50.000 fotogramas en total), sin acciones ni observaciones de la fuente original.

La innovación técnica es el esquema de test-time training con prompt latente: en lugar de ajustar LoRA o todos los parámetros, se optimiza un vector de prompt de 32.768 valores que modula la política, lo que reduce drásticamente el coste de adaptación y permite servir el modelo con un script específico (`baselines.ttt_vla.serve`). El registro de pérdida proxy por actualización está en `run/metrics.jsonl`.

## Capacidades

- Control robótico de manipulación en entornos LIBERO (libero_spatial, libero_object, libero_goal, libero_10).
- Ejecución de políticas VLA a partir de observaciones visuales e instrucciones de tarea.
- Adaptación test-time mediante prompt latente sin reentrenar el backbone.
- Servicio por lotes mediante `baselines.ttt_vla.serve` con `--batch-size 16`.
- Compatible con el ecosistema openpi y el repositorio `Donghyun1228/vla_adaptation`.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni visión general fuera del dominio robótico.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación comparativa de métodos de adaptación VLA: sirve como baseline TTT-VLA frente a LoRA (rank 16) y probing sobre el mismo benchmark LIBERO, con métricas por suite ya publicadas (358/500, 421/500, 351/500, 264/500).
- Investigación en test-time training: permite reproducir el esquema de adaptación de prompt latente con los 10.000 pasos documentados y comparar la pérdida proxy de `run/metrics.jsonl` con otras estrategias.
- Benchmarking de políticas de manipulación: útil para medir el impacto de la vista reducida (`view_small`) en la tasa de éxito frente a la vista original.
- Servicio de inferencia robótica en simulación: despliegue con OSMesa y MuJoCo 3.2.3 para evaluar políticas en los cuatro suites de LIBERO con semilla de entorno fija (7).
- Estudio de congelación selectiva: al mantener 70 tensores congelados y adaptar solo el prompt, sirve para analizar cuánta capacidad de adaptación reside en el prompt latente.
- Reproducibilidad de experimentos: el checkpoint incluye normalización, configuración (`run/config.json`) y métricas, lo que facilita replicar los resultados en H100.
- Punto de partida para adaptaciones posteriores: puede inicializar nuevos experimentos TTT sobre otras vistas o tareas sin partir del modelo base pi05.

## Benchmarks y rendimiento

| Suite LIBERO | Éxito | Total |
|---|---|---|
| libero_spatial | 358 | 500 |
| libero_object | 421 | 500 |
| libero_goal | 351 | 500 |
| libero_10 | 264 | 500 |
| **Agregado** | **1394 (69,70 %)** | **2000** |

Condiciones: semilla de entorno 7, NVIDIA H100, renderizado OSMesa, MuJoCo 3.2.3. El punto de 1.000 actualizaciones de la misma ejecución alcanzó 1410/2000 = 70,50 % (no publicado). No se han publicado resultados en MMLU, HumanEval, GSM8K ni benchmarks de texto, al tratarse de un modelo de robótica.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 13,8 GB en FP32, por lo que la inferencia requiere al menos ~14 GB solo para pesos, más memoria para activaciones y renderizado.
- GPU recomendadas: NVIDIA H100 (configuración usada en la evaluación); se desconoce el rendimiento en A100 o RTX 4090.
- GPU de consumo: no confirmado; probablemente viable en RTX 4090 (24 GB) en FP32 ajustado, pero no verificado.
- Despliegue: script `baselines.ttt_vla.serve` con `--config run/config.json --checkpoint adapted.npz --norm-stats-dir assets/donghyun/libero --batch-size 16`, runtime `84a1f92b`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO (agregado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-ttt-vla-random-probe-view-small-10000 (este) | no disponible (13,8 GB FP32) | no disponible | 69,70 % (1394/2000) | apache-2.0 | Hugging Face |
| pi05-libero-support-probe-source-n100000-10000-20261015 | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face |
| pi05-libero-support-lora16-all-view-small-n50000-10000-20261016 | no disponible (LoRA rank 16) | no disponible | no disponible | apache-2.0 | Hugging Face |

Los tres checkpoints pertenecen al mismo autor y benchmark; la comparación directa de tasas de éxito solo está documentada para este modelo.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes; no hay validación comunitaria ni soporte.
- Entrenado exclusivamente sobre LIBERO en simulación (MuJoCo); no se garantiza transferencia a robots reales.
- La adaptación se realizó sobre `view_small` (primeros 1250 fotogramas de 40 tareas), lo que puede limitar la generalización a otras vistas o distribuciones.
- Solo se adapta el `latent_prompt`; el resto de la política hereda los sesgos y limitaciones del checkpoint fuente.
- No se documentan sesgos conocidos, pero al ser un modelo VLA entrenado con datos simulados puede presentar fallos sistemáticos en tareas fuera de distribución.
- Riesgo de alucinación: no aplica en el sentido de texto generativo, pero la política puede producir acciones no válidas en estados no vistos.
- Licencia apache-2.0 permite uso comercial, pero el modelo base π0.5 y sus dependencias (openpi) pueden tener términos adicionales que deben revisarse.
- Requiere el runtime `84a1f92b` y el repositorio `Donghyun1228/vla_adaptation` para servir correctamente; no es un checkpoint autónomo.
- Sin información sobre idiomas, cuantización ni latencia; no apto para producción sin evaluación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ttt-vla-random-probe-view-small-10000-20261105
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021
- Modelo relacionado (probe source): https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015
- Modelo relacionado (LoRA rank 16): https://huggingface.co/Donghyun1228/pi05-libero-support-lora16-all-view-small-n50000-10000-20261016
- Repositorio de código: `Donghyun1228/vla_adaptation` (referenciado en la model card; no se proporciona URL directa)
- Paper de π0.5 / openpi: no disponible en la información proporcionada
