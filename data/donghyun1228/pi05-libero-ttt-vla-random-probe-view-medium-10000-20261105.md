# Donghyun1228/pi05-libero-ttt-vla-random-probe-view-medium-10000-20261105

## Resumen

π0.5 LIBERO view_medium (TTT-VLA, prompt-only target) es un checkpoint de investigación derivado del modelo de robótica π0.5, adaptado mediante *test-time training* (TTT) sobre el conjunto de tareas LIBERO. Lo publica el usuario Donghyun1228 dentro de su repositorio de experimentos `vla_adaptation`, que agrupa variantes de adaptación de políticas visión-lenguaje-acción (VLA) para manipulación robótica. El modelo no es un LLM de propósito general, sino una política de control que recibe observaciones visuales y estado del robot y emite acciones.

La particularidad de esta variante es que solo se adapta un tensor: el `latent_prompt` de 16 × 2048, mediante una pérdida de *state-grounding* (proxy) calculada sobre 50.000 fotogramas de sondas aleatorias de la vista `view_medium`. Los otros 70 tensores del checkpoint permanecen idénticos al modelo fuente. El entrenamiento consistió en 10.000 actualizaciones con AdamW (LR 1e-5 constante) y batch de 128.

Su relevancia es metodológica: sirve como línea base reproducible para medir cuánto puede mejorar una política π0.5 con una adaptación mínima y sin datos de acciones ni recompensas de éxito. El resultado publicado es de 859/2000 tareas resueltas en LIBERO (42,95 %), un dato que debe interpretarse en el contexto de un experimento de investigación y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (transformer visión-lenguaje-acción); detalles internos no disponibles en la información proporcionada |
| Parametros totales | no disponible (el checkpoint contiene 71 tensores FP32; el `latent_prompt` adaptado es de 16 × 2048) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | NPZ (`adapted.npz` con 71 tensores FP32 y `adapted.json`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint parte de `Donghyun1228/pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021` (revisión a74334b4, fichero `sg_lp.npz`). La adaptación congela todos los parámetros salvo el `latent_prompt` (16 × 2048), que se optimiza con una pérdida de *state-grounding* proxy sobre las primeras 1.250 imágenes de cada una de las 40 sondas de tarea (50.000 fotogramas en total). No se usan acciones, ni observaciones del modelo fuente, ni retroalimentación de éxito de tarea.

El entrenamiento se ejecutó con el script `baselines/ttt_vla/probe_long_h100.py` (numérico de runtime `84a1f92b`), batch 128, AdamW con LR 1e-5 constante, weight decay 0 y semilla de cargador 0, durante 10.000 actualizaciones. La normalización se toma del modelo fuente, en `assets/donghyun/libero`. El registro `run/metrics.jsonl` contiene la pérdida proxy de cada actualización, lo que facilita la reproducibilidad del experimento.

## Capacidades

- Control robótico de manipulación: genera acciones a partir de observaciones visuales y estado del robot para las tareas de LIBERO (spatial, object, goal y long-horizon `libero_10`).
- Adaptación test-time con huella mínima: solo modifica un tensor de prompt latente, lo que permite experimentar con adaptaciones rápidas sin reentrenar la política completa.
- Evaluación estandarizada: integrado con el pipeline de servicio `baselines.ttt_vla.serve` y las estadísticas de normalización de LIBERO.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni modo *thinking*; es un modelo de robótica, no un LLM conversacional.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Línea base de investigación en adaptación VLA: sirve para comparar métodos de *test-time training* (LoRA, prompts, adaptadores completos) contra una referencia que solo toca un tensor, con métricas de éxito en LIBERO perfectamente definidas.
- Reproducción de experimentos: el checkpoint incluye `run/export.json`, `run/config.json` y `run/metrics.jsonl`, lo que permite replicar el entrenamiento y auditar la curva de pérdida proxy.
- Estudio de la pérdida de *state-grounding*: al aislar la adaptación en el `latent_prompt`, se puede medir cuánta información de la tarea captura esa señal proxy sin supervisión de acciones.
- Evaluación comparativa de políticas π0.5: útil como punto de partida congelado para medir el efecto de cambios en los datos de sonda (por ejemplo, `view_large` frente a `view_medium`).
- Despliegue en simulación con MuJoCo/OSMesa: el pipeline de servicio documentado permite ejecutar la política en entornos LIBERO con renderizado por software en GPU H100.
- Docencia y divulgación: ejemplo concreto de adaptación paramétricamente eficiente en robótica, con cifras de éxito por suite y semilla de entorno fija (7) para discusión en clase o talleres.

## Benchmarks y rendimiento

Resultados publicados en la model card (LIBERO, semilla de entorno 7, NVIDIA H100, renderizado OSMesa, MuJoCo 3.2.3):

| Suite | Éxito | Total | Porcentaje |
|---|---|---|---|
| libero_spatial | 242 | 500 | 48,40 % |
| libero_object | 350 | 500 | 70,00 % |
| libero_goal | 242 | 500 | 48,40 % |
| libero_10 | 25 | 500 | 5,00 % |
| **Total** | **859** | **2000** | **42,95 %** |

El punto de 1.000 actualizaciones de la misma ejecución alcanzó 856/2000 (42,80 %), según la model card (no publicado como checkpoint). No se han publicado resultados comparativos frente a otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 13,8 GB y los pesos se exportan en FP32 (71 tensores), por lo que se requiere una GPU con al menos ~14 GB libres para cargar el checkpoint, más memoria para el renderizado y el entorno de simulación.
- GPU recomendadas: NVIDIA H100 (configuración usada en la evaluación publicada). No se documenta compatibilidad con A100, RTX 4090 u otras.
- GPU de consumo: no confirmado; por tamaño del checkpoint podría intentarse en GPUs de 24 GB (RTX 3090/4090), pero no hay datos publicados de que funcione.
- Despliegue: script propio `baselines.ttt_vla.serve --config run/config.json --checkpoint adapted.npz --norm-stats-dir assets/donghyun/libero --batch-size 16` con runtime `84a1f92b`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO (total) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO TTT-VLA prompt-only (este) | no disponible (71 tensores FP32) | no disponible | 42,95 % (859/2000) | Apache 2.0 | Hugging Face |
| π0.5 LIBERO B200 IDM LoRA01 view_medium 1000 | no disponible | no disponible | no disponible en la información | Apache 2.0 (según tag del autor) | Hugging Face |
| π0.5 LIBERO reachable-probe LoRA01 view_large n300000 1000 | no disponible | no disponible | no disponible en la información | Apache 2.0 (según tag del autor) | Hugging Face |

No se dispone de datos de benchmarks de las alternativas en la información proporcionada; la comparación se limita a la existencia de variantes del mismo autor con estrategias de adaptación distintas (LoRA frente a prompt-only).

## Limitaciones y advertencias

- Modelo de investigación: no es un LLM ni un asistente conversacional; solo tiene sentido en el contexto de políticas VLA para LIBERO.
- Rendimiento muy desigual por suite: 5,00 % en `libero_10` frente a 70,00 % en `libero_object`; el agregado del 42,95 % oculta esta brecha y desaconseja su uso en tareas de horizonte largo.
- Entrenamiento sin acciones ni recompensas: la pérdida proxy de *state-grounding* no garantiza mejora en la tarea real; el punto de 1.000 actualizaciones rinde prácticamente igual (42,80 %), lo que sugiere rendimientos decrecientes.
- Dependencia del entorno: los resultados se obtuvieron con MuJoCo 3.2.3, OSMesa y semilla 7; cambios en el renderizado o en la semilla pueden alterar las cifras.
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda las limitaciones y posibles sesgos del π0.5 original, no documentados en esta ficha.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones incoherentes o fuera de distribución en escenarios no vistos.
- Idiomas y contexto: no disponibles; no se debe asumir soporte multilingüe ni una ventana de contexto concreta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ttt-vla-random-probe-view-medium-10000-20261105
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021
- Variante relacionada (IDM LoRA01): https://huggingface.co/Donghyun1228/pi05-libero-b200-idm-lora01-view-medium-1000-20261012
- Variante relacionada (reachable-probe LoRA01): https://huggingface.co/Donghyun1228/pi05-libero-reachable-probe-lora01-view-large-n300000-1000-20261014
- Repositorio de experimentos citado en la model card: `Donghyun1228/vla_adaptation` (no se proporciona URL directa en la información disponible)
