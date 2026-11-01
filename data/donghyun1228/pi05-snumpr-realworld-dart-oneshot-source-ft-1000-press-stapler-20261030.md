# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-source-ft-1000-press-stapler-20261030

## Resumen

π0.5 SNUMPR real-world DART one-shot source es un fine-tune de robótica del modelo de visión-lenguaje-acción (VLA) π0.5, publicado por el usuario Donghyun1228 en HuggingFace. El modelo parte de la inicialización `snumpr-iclr27-v1/9999`, una VLA de SNUMPR con normalización original, y se ha adaptado mediante aprendizaje por imitación (IL) a una única demostración de la tarea `press_stapler` (pulsar una grapadora), con 1.000 actualizaciones y sin transformación de yaw (vista fuente original).

Se trata de uno de los dos fine-tunes one-shot que se fusionan en el modelo `pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-press-stapler-20261030`, también del mismo autor. El repositorio ocupa 12,4 GB e incluye los pesos en FP32 del paso 999, los assets de normalización y el registro de la ejecución de Weights & Biases. No se ha ejecutado ninguna evaluación sobre robot real, por lo que su rendimiento en despliegue no está verificado.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación reproducible (receta oficial `pi05_libero_oneshotft` sobre el código `vla_adaptation`), no de un modelo de propósito general. Su interés radica en documentar el pipeline de adaptación one-shot de VLAs para manipulación robótica con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en π0.5 (no se detalla la arquitectura interna en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` (FP32) y `assets` (normalización original), más `wandb_run.json`; no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de la VLA π0.5, inicializado desde el checkpoint `snumpr-iclr27-v1/9999` de SNUMPR con normalización original. El entrenamiento se realizó exclusivamente con aprendizaje por imitación (IL), sin RLHF ni DPO, sobre la única demostración `demonstration_0` de la tarea `press_stapler` con yaw 0. La receta es el preset `pi05_snumpr_dart_oneshot_source_press_stapler`, ejecutado con el código `Donghyun1228/vla_adaptation` (commit `248126e`) y la receta oficial `pi05_libero_oneshotft` de `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`).

Los hiperparámetros documentados son: 1.000 actualizaciones, batch de 64, learning rate constante de 5e-5, sin warmup, sin EMA, todos los pesos entrenables, AdamW con clipping de 1.0 y semilla 42. El modelo se ejecuta en la vista fuente (original) sin ninguna transformación de yaw. No se incluye el estado del optimizador (`train_state`) en el repositorio.

## Capacidades

- Control robótico de manipulación: genera acciones para la tarea concreta `press_stapler` a partir de observaciones visuales y de la instrucción de tarea.
- Aprendizaje one-shot: capacidad de adaptación a una tarea nueva con una sola demostración, según la receta de fine-tune utilizada.
- Procesamiento visión-lenguaje-acción: integra entrada visual y condicionamiento por lenguaje para producir acciones (herencia de la arquitectura π0.5).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo, modo thinking, audio ni visión general fuera del contexto robótico.
- No se ha verificado ninguna capacidad en robot real (sin evaluación de despliegue).

## Casos de uso

- Investigación en adaptación one-shot de VLAs: sirve como referencia reproducible para estudiar cómo una única demostración modifica el comportamiento de un modelo π0.5 preentrenado, usando la receta `pi05_libero_oneshotft`.
- Reproducción de experimentos: el repositorio incluye el registro de W&B y los commits exactos del código, lo que permite replicar el entrenamiento con los mismos hiperparámetros (1.000 updates, batch 64, LR 5e-5, seed 42).
- Punto de partida para fine-tunes posteriores: al estar publicado en FP32 y con la normalización original, puede reutilizarse como inicialización para nuevas tareas de manipulación.
- Estudio de fusión de modelos: al ser uno de los dos fine-tunes fusionados en el modelo `large-view-yaw30-alpha0p8`, permite analizar el efecto de la fusión de adaptaciones con distintas vistas.
- Benchmarking interno de pipelines de robótica: útil para comparar recetas de adaptación (one-shot frente a multi-demonstración) en el mismo entorno SNUMPR.
- Docencia y divulgación técnica: ejemplo concreto de flujo de trabajo completo (preset, hiperparámetros, artefactos) para explicar el entrenamiento de VLAs en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros totales ni configuración de despliegue).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato de pesos es un checkpoint FP32 de entrenamiento, no un formato de inferencia estándar).
- Latencia y throughput: no disponible.
- Tamaño del repositorio: 12,4 GB, lo que da una idea del orden de magnitud del checkpoint en FP32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR real-world DART one-shot source (este modelo) | no disponible | no disponible | sin evaluación en robot | Apache 2.0 | HuggingFace, 0 descargas |
| π0.5 SNUMPR real-world DART one-shot large-view yaw30 alpha0p8 (modelo fusionado del mismo autor) | no disponible | no disponible | sin datos publicados en la información disponible | Apache 2.0 | HuggingFace |
| `snumpr-iclr27-v1/9999` (checkpoint de inicialización) | no disponible | no disponible | no disponible | no disponible | referenciado en la model card |

No se dispone de datos de benchmarks ni de especificaciones de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sin evaluación en robot real: la model card indica explícitamente que no se ha ejecutado ninguna evaluación de despliegue, por lo que el rendimiento real es desconocido.
- Especialización extrema: el modelo está adaptado a una única tarea (`press_stapler`) y a una única demostración; no se espera generalización a otras tareas sin nuevo fine-tune.
- Dependencia de la vista: el modelo se entrenó en la vista fuente (yaw 0) sin transformación; su uso con otras cámaras o ángulos no está validado.
- Artefacto de investigación: no incluye el estado del optimizador, lo que limita la reanudación exacta del entrenamiento.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; en el contexto robótico, el riesgo principal es la ejecución de acciones incorrectas sin señalización de incertidumbre.
- Idiomas: no se especifican; no se puede asumir soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende de la licencia y los términos del checkpoint base `snumpr-iclr27-v1/9999`, que no se detallan en la información disponible.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-source-ft-1000-press-stapler-20261030
- Modelo fusionado del mismo autor: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-press-stapler-20261030
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `248126e`), sin URL directa en la información disponible
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), sin URL directa en la información disponible
- Checkpoint de inicialización: `snumpr-iclr27-v1/9999`, sin URL directa en la información disponible
