# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-source-ft-1000-hang-tape-top-20261030

## Resumen

π0.5 SNUMPR real-world DART one-shot source es un fine-tune de robótica derivado del modelo de visión-lenguaje-acción (VLA) π0.5, desarrollado por el autor Donghyun1228 en el contexto del proyecto SNUMPR. El modelo parte del checkpoint inicial `snumpr-iclr27-v1/9999` y se ha ajustado mediante aprendizaje por imitación sobre una única demostración (`demonstration_0`) de la tarea concreta `hang_tape_top`, con yaw 0 y sin ninguna transformación de vista. Es, por tanto, un experimento de adaptación one-shot orientado a evaluar la capacidad de generalización de un VLA preentrenado a una tarea manipulativa nueva con mínimos datos.

El repositorio contiene únicamente el paso `999` del entrenamiento (1.000 updates), con los parámetros en FP32 y los assets de normalización originales. No se incluye el estado del optimizador. Este checkpoint es una de las dos ramas que el autor fusiona posteriormente en el modelo `pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-top-20261030`, por lo que su interés es principalmente como pieza intermedia de un pipeline de investigación en adaptación de políticas robóticas.

La relevancia actual del modelo es limitada fuera de su contexto experimental: se trata de un artefacto de investigación sin evaluación en robot real, sin benchmarks publicados y con cero descargas. Resulta útil para reproducir el pipeline de fine-tuning one-shot del proyecto DART/SNUMPR, pero no está pensado como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 (openpi); detalles internos de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados en FP32 |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` (FP32) y `assets` de normalización original (SHA `f549619e…`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se basa en π0.5, un VLA del ecosistema openpi que combina percepción visual, instrucciones en lenguaje y salida de acciones motoras. El fine-tune parte del checkpoint `snumpr-iclr27-v1/9999` (VLA inicial de SNUMPR con normalización original) y aplica el preset `pi05_snumpr_dart_oneshot_source_hang_tape_top` sobre la única demostración disponible de la tarea `hang_tape_top` con yaw 0.

El entrenamiento es exclusivamente de aprendizaje por imitación (IL), con 1.000 updates, batch de 64, learning rate constante de 5e-5, sin warmup ni EMA, todos los pesos entrenables y AdamW con clipping de 1.0, semilla 42. Se ejecutó sobre el código `Donghyun1228/vla_adaptation` (commit `248126e`) siguiendo la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`). La inferencia se realiza en la vista original (source) sin transformación de yaw. No se detalla la composición del dataset de preentrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Control robótico visomotor: genera acciones a partir de observaciones visuales e instrucciones de tarea, especializado en la tarea `hang_tape_top`.
- Aprendizaje por imitación one-shot: capacidad de adaptarse a una tarea nueva con una sola demostración, que es el objeto del experimento.
- Percepción visual integrada: procesa imágenes del entorno para producir acciones (propio de la familia π0.5).
- Seguimiento de instrucciones de tarea: el preset y la normalización están asociados a una tarea concreta.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general ni multilingüismo.
- No se documenta modo thinking, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Reproducción de experimentos de adaptación one-shot: sirve como checkpoint intermedio para replicar el pipeline DART/SNUMPR con una única demostración y comparar recetas de fine-tuning.
- Investigación en VLA: permite estudiar cómo un VLA preentrenado se especializa en una tarea manipulativa concreta (`hang_tape_top`) con 1.000 updates y sin evaluación previa.
- Base para fusión de modelos: es una de las dos ramas que el autor fusiona en el modelo `large-view-yaw30-alpha0p8`, por lo que se usa como componente en experimentos de merging de políticas.
- Análisis de normalización: al conservar los assets de normalización originales, permite comparar el efecto de distintas normalizaciones en la adaptación.
- Docencia y divulgación: ejemplo didáctico de fine-tuning de un VLA con receta oficial y parámetros reproducibles (semilla, LR, batch, commits).
- Punto de partida para evaluación en robot real: aunque no se ha evaluado todavía, puede servir como inicialización para campañas de evaluación posteriores en el entorno SNUMPR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,4 GB con pesos en FP32, lo que da una referencia del orden de magnitud de memoria necesaria para cargar los parámetros.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del repo, se requeriría una GPU con al menos ~12-16 GB de VRAM para FP32, aunque no se confirma.
- ¿Cabe en GPU de consumo? No confirmado; probablemente ajustado en tarjetas de 16 GB o más, pero no hay dato oficial.
- Opciones de despliegue: el ecosistema openpi/π0.5 suele usar su propio runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un VLA de robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART one-shot source (este) | no disponible | no disponible | sin evaluación | Apache 2.0 | HuggingFace, 0 descargas |
| π0.5 SNUMPR DART one-shot large-view-yaw30-alpha0p8 (modelo fusionado del mismo autor) | no disponible | no disponible | sin evaluación publicada | Apache 2.0 | HuggingFace |
| π0.5 base (openpi) | no disponible | no disponible | benchmarks del paper original, no disponibles aquí | según openpi | HuggingFace / openpi |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación en robot real: la model card indica que no se ha ejecutado ninguna evaluación, por lo que no hay evidencia de rendimiento.
- Especialización extrema: entrenado solo para `hang_tape_top` con yaw 0 y una única demostración; no generaliza a otras tareas ni vistas sin reentrenamiento.
- Sin estado del optimizador: el repositorio no incluye `train_state`, lo que limita reanudar el entrenamiento exactamente donde se dejó.
- Pesos en FP32: mayor huella de memoria y almacenamiento (12,4 GB) que versiones cuantizadas, que no se ofrecen.
- Riesgo de sobreajuste a la demostración única: con 1.000 updates sobre una sola trayectoria, la política puede memorizar la demostración.
- Idiomas y sesgos: no documentados; al ser un VLA, los sesgos relevantes serían los del dataset de preentrenamiento y del entorno SNUMPR, no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluación y la naturaleza experimental desaconsejan su uso en producción.
- Cero descargas y cero likes: sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-source-ft-1000-hang-tape-top-20261030
- Modelo fusionado del mismo autor: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-top-20261030
- Repositorio de código de adaptación: `Donghyun1228/vla_adaptation` (commit `248126e`)
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`)
- openpi (ecosistema π0.5): no se proporciona URL en la información disponible
