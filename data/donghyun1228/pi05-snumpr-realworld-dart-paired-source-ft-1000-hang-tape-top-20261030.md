# Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-hang-tape-top-20261030

## Resumen

π0.5 SNUMPR real-world DART one-shot source fine-tune es un modelo de visión-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario Donghyun1228 sobre el checkpoint base `snumpr-iclr27-v1/9999` (la VLA inicial de SNUMPR). Se trata de un ajuste fino supervisado (imitation learning) para la tarea concreta `hang_tape_top`, entrenado sobre la demostración fuente `demonstration_9` con un presupuesto de 1.000 actualizaciones y un lote de 64. El modelo forma parte de un par de fine-tunes one-shot que se fusionan posteriormente en otro checkpoint del mismo autor.

El interés de esta ficha es acotado: no es un modelo de propósito general, sino un artefacto de investigación reproducible dentro del ecosistema openpi/DART. Su relevancia radica en que documenta una receta concreta (preset `pi05_snumpr_dart_paired_source_hang_tape_top`, learning rate constante 5e-5, AdamW con clipping 1.0, semilla 42) sobre código versionado (`Donghyun1228/vla_adaptation` commit `c4fcb61` y `snumprlab/dart` commit `1b23c4f…`), lo que permite replicar el experimento. El autor indica explícitamente que todavía no se ha ejecutado ninguna evaluación sobre robot real.

El repositorio ocupa 12,4 GB e incluye pesos en FP32 del paso 999 junto con los assets de normalización original y el registro de la ejecución de Weights & Biases. No se proporcionan datos sobre número de parámetros, longitud de contexto, idiomas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción (VLA) basada en π0.5 / openpi; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (pesos distribuidos en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en FP32 y `assets` de normalización original (SHA `f549619e…`); `wandb_run.json` |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `snumpr-iclr27-v1/9999`, la VLA inicial de SNUMPR, y hereda la arquitectura π0.5 del ecosistema openpi. La información disponible no detalla la composición interna de la arquitectura (backbone visual, encoder de lenguaje, cabeza de acciones, número de capas o dimensión oculta), por lo que esos datos deben considerarse no disponibles en esta ficha.

El entrenamiento es exclusivamente de imitation learning, sin RLHF ni DPO. Se aplicó el preset `pi05_snumpr_dart_paired_source_hang_tape_top` sobre la demostración fuente `demonstration_9` de la tarea `hang_tape_top`, con las siguientes hiperparámetros: 1.000 actualizaciones, batch de 64, learning rate constante de 5e-5, sin warmup, sin EMA, todos los pesos entrenables, AdamW con clipping de gradiente 1.0 y semilla 42. La receta oficial de referencia es `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), ejecutada con el código `Donghyun1228/vla_adaptation` (commit `c4fcb61`). El estado del optimizador (`train_state`) no se incluye en el repositorio, solo los pesos del paso 999 y los assets de normalización original. La inferencia debe realizarse en la vista fuente original, sin ninguna transformación de yaw.

## Capacidades

- Control robótico por imitación para la tarea específica `hang_tape_top`, a partir de observaciones visuales y estado articular real.
- Ejecución en la vista fuente original (yaw 0) con estado articular real, tal como se especifica en la model card.
- Integración con el stack openpi / DART para pipelines de entrenamiento y despliegue de políticas VLA.
- Punto de partida para fusión de checkpoints: este modelo es uno de los dos fine-tunes one-shot que se combinan en el checkpoint `pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-hang-tape-top-20261030`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas, código, visión general, audio ni modo thinking.

## Casos de uso

- Reproducción de experimentos de one-shot fine-tuning: sirve para replicar la receta `pi05_libero_oneshotft` sobre una única demostración y verificar la convergencia con 1.000 actualizaciones y batch 64.
- Punto de partida para fusión de políticas: se usa como uno de los dos checkpoints fuente en la fusión `paired-keepstate-large-view-yaw30-alpha0p8`, lo que permite estudiar el efecto de la fusión de pesos en tareas de manipulación.
- Investigación en adaptación de VLAs a tareas nuevas: al estar entrenado sobre `demonstration_9` de `hang_tape_top`, permite analizar cuánto conocimiento de la tarea se captura con una sola demostración y 1.000 pasos.
- Baseline en estudios de normalización: el repositorio incluye los assets de normalización original (SHA `f549619e…`), lo que facilita comparar el efecto de distintas estrategias de normalización sobre el mismo checkpoint base.
- Auditoría de recetas de entrenamiento: el `wandb_run.json` incluido permite inspeccionar curvas de pérdida e hiperparámetros de una ejecución concreta, útil para depurar recetas propias.
- Docencia y divulgación sobre VLAs: como artefacto pequeño y acotado dentro de openpi, sirve para ilustrar el flujo completo de ajuste fino de una política robótica sin necesidad de infraestructura de evaluación física.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que todavía no se ha ejecutado ninguna evaluación sobre robot real para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario; el peso en FP32 puede requerir VRAM del orden de ese tamaño o superior, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (12,4 GB en FP32) sugiere que podría no caber en GPUs de consumo con menos de 16 GB de VRAM, pero es una estimación, no un dato del autor.
- Opciones de despliegue: el modelo está pensado para el stack openpi / DART; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son adecuadas para políticas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART one-shot source fine-tune (`hang_tape_top`) | no disponible | no disponible | Manipulación robótica `hang_tape_top` | Apache 2.0 | Hugging Face, repo de 12,4 GB |
| π0.5 SNUMPR DART paired keepstate large-view yaw30 alpha0.8 (`hang_tape_top`) | no disponible | no disponible | Manipulación robótica `hang_tape_top`, checkpoint fusionado | Apache 2.0 | Hugging Face (mismo autor) |
| Checkpoint base `snumpr-iclr27-v1/9999` | no disponible | no disponible | VLA inicial SNUMPR | no disponible en esta ficha | Referenciado como init |

La comparación con alternativas fuera del ecosistema SNUMPR/openpi no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: entrenado exclusivamente para `hang_tape_top` sobre `demonstration_9`; no generaliza a otras tareas sin un nuevo ajuste.
- Sin evaluación en robot real: el autor declara que no se ha ejecutado ninguna evaluación física, por lo que no hay evidencia de éxito en despliegue.
- Restricción de vista: debe ejecutarse en la vista fuente original (yaw 0) sin transformación de yaw; usarlo con otra orientación de cámara puede degradar el rendimiento.
- Estado del optimizador ausente: no se incluye `train_state`, lo que impide reanudar el entrenamiento exactamente desde el paso 999.
- Pesos en FP32: el repositorio de 12,4 GB puede ser costoso de cargar y desplegar en entornos con VRAM limitada.
- Riesgo de sobreajuste a una sola demostración: con 1.000 actualizaciones sobre una única trayectoria, la política puede memorizar la demostración y fallar ante variaciones de posición inicial, iluminación u objetos.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; en robótica, el riesgo equivalente es la ejecución de acciones fuera de distribución, no cuantificado aquí.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del checkpoint base `snumpr-iclr27-v1/9999`, que no se detalla en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-hang-tape-top-20261030
- Checkpoint fusionado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-hang-tape-top-20261030
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `c4fcb61`), referenciado en la model card
- Receta oficial DART: repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), referenciado en la model card
