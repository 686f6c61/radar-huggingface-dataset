# Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-put-lemon-plate-20261030

## Resumen

π0.5 SNUMPR real-world DART es un ajuste fino (fine-tune) de un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa. Lo desarrolla el usuario Donghyun1228 dentro del ecosistema SNUMPR y openpi, y parte del checkpoint inicial `snumpr-iclr27-v1/9999`. El modelo resuelve una tarea concreta de manipulación: colocar un limón en un plato (`put_lemon_plate`), aprendida a partir de una única demostración real (`demonstration_7`) mediante aprendizaje por imitación (IL).

Se trata de uno de los dos ajustes one-shot que se fusionan posteriormente en un modelo combinado publicado por el mismo autor. El entrenamiento consistió en 1.000 actualizaciones con batch 64, learning rate constante de 5e-5, AdamW con clipping 1.0 y semilla 42, siguiendo la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart`. El repositorio ocupa 12,4 GB e incluye los pesos en FP32 del paso 999 junto con los assets de normalización original.

Es relevante ahora porque ejemplifica el flujo de adaptación one-shot de modelos VLA sobre hardware real con recetas reproducibles, aunque el propio autor advierte de que todavía no se ha ejecutado ninguna evaluación sobre robot. No hay información sobre idiomas soportados ni datos de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π0.5 / openpi; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | params en FP32 (formato openpi/orbax, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de la familia π0.5 dentro del framework openpi, con la variante SNUMPR (checkpoint `snumpr-iclr27-v1/9999`). No se detalla en la información disponible la arquitectura interna (número de capas, dimensión, mecanismo de atención ni composición del backbone visión-lenguaje). El pipeline declarado en HuggingFace es `robotics`.

El entrenamiento es exclusivamente de aprendizaje por imitación (IL), sin RLHF ni DPO, sobre una única demostración real (`demonstration_7`) de la tarea `put_lemon_plate`, con yaw 0 y estado articular real (real joint state). Se ejecutaron 1.000 actualizaciones con batch 64, learning rate constante 5e-5, sin warmup, sin EMA, entrenando todos los pesos, con AdamW y clipping 1.0, semilla 42. El código corresponde a `Donghyun1228/vla_adaptation` (commit `c4fcb61`) y la receta oficial `pi05_libero_oneshotft` de `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`). Se publica el paso 999 con normalización original (SHA `f549619e…`) y el `wandb_run.json`; el estado del optimizador (`train_state`) no se incluye. El modelo debe ejecutarse en la vista fuente (original) sin ninguna transformación de yaw.

## Capacidades

- Control robótico de manipulación para la tarea específica `put_lemon_plate` (colocar un limón en un plato).
- Política de acción condicionada por observación visual y estado articular real (entrada multimodal visión + propriocepción).
- Aprendizaje one-shot a partir de una sola demostración real.
- Integración con el ecosistema openpi / SNUMPR / DART para adaptación y fusión de políticas.
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos especiales (thinking, audio, etc.), dado que es un modelo de robótica y no un LLM conversacional.

## Casos de uso

- Manipulación de objetos en entorno real: el modelo genera acciones para mover un limón hasta un plato, adecuado para prototipado rápido de políticas de pick-and-place con una sola demostración.
- Investigación en aprendizaje one-shot para VLA: sirve como punto de partida reproducible (receta, semilla y commits documentados) para estudiar la adaptación de π0.5 a tareas nuevas.
- Base para fusión de políticas: al ser uno de los dos fine-tunes que se combinan en el modelo `paired-keepstate-large-view-yaw30-alpha0p8`, se usa como componente fuente en experimentos de merging de pesos.
- Evaluación de recetas de fine-tuning: útil para comparar hiperparámetros (LR, batch, updates, clipping) en tareas de manipulación real.
- Reproducción de experimentos SNUMPR/DART: el repositorio incluye el `wandb_run.json` y los assets de normalización, lo que permite replicar el entrenamiento con el código indicado.
- Docencia y divulgación: ejemplo didáctico de pipeline completo de VLA, desde el checkpoint base hasta la política específica de tarea, con trazabilidad de commits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que aún no se ha ejecutado ninguna evaluación sobre robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB con pesos en FP32, pero no se especifica el tamaño del modelo ni el consumo en GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo sigue el formato openpi/orbax; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLM y no a políticas VLA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia contextual, el modelo se relaciona con el checkpoint base `snumpr-iclr27-v1/9999` y con el modelo fusionado `Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-put-lemon-plate-20261030`, pero no hay datos de rendimiento que permitan una comparación cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (source fine-tune, 1.000 updates) | no disponible | no disponible | Apache 2.0 | HuggingFace |
| π0.5 SNUMPR base (`snumpr-iclr27-v1/9999`) | no disponible | no disponible | no disponible | checkpoint referenciado |
| Modelo fusionado paired-keepstate-large-view-yaw30-alpha0p8 | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Sin evaluación sobre robot: el autor confirma que no se ha ejecutado ninguna prueba en hardware real, por lo que el rendimiento de la política es desconocido.
- Especialización extrema: entrenado solo para `put_lemon_plate` sobre una única demostración; no generaliza a otras tareas sin nuevo fine-tuning.
- Dependencia de la vista fuente: debe ejecutarse con la vista original y sin transformación de yaw; usarlo con otra configuración de cámara o yaw puede degradar el comportamiento.
- Sin estado del optimizador: el `train_state` no se incluye, lo que limita la reanudación exacta del entrenamiento.
- Riesgo de sobreajuste a la demostración: con una sola demostración y 1.000 updates, la política puede memorizar condiciones específicas del entorno.
- Sesgos y alucinaciones: no hay información específica; en robótica, los fallos se manifiestan como acciones incorrectas o inseguras más que como texto inventado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni evaluación de seguridad para despliegue en producción.
- Idiomas: no disponible; no aplica como modelo conversacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-put-lemon-plate-20261030
- Modelo fusionado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-put-lemon-plate-20261030
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `c4fcb61`; no se proporciona URL)
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`; no se proporciona URL)
- Checkpoint base: `snumpr-iclr27-v1/9999` (no se proporciona URL)
