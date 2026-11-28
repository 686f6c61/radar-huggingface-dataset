# SamarC/act_grid_a1

## Resumen

`SamarC/act_grid_a1` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por Zhao et al. (2023) y popularizado por la librería LeRobot de Hugging Face. El modelo aprende a partir de demostraciones teleoperadas y predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación de precisión. Lo publica el usuario SamarC y está pensado para el robot de bajo coste SO-101 (variante de SO-100 de LeRobot).

La política resuelve una tarea concreta: "Pick up the red block and place it in A1", es decir, coger un bloque rojo y colocarlo en la celda A1 de una cuadrícula. Consume el estado articular de 6 dimensiones del robot más una imagen frontal de 640x480 píxeles, y emite un vector de acción de 6 dimensiones. Con 51,7 millones de parámetros y un repositorio de 0,2 GB, es un modelo ligero que cabe en GPUs de consumo y está orientado a inferencia en tiempo real a 30 FPS.

Su relevancia es la de un ejemplo reproducible de aprendizaje por imitación end-to-end en robótica de bajo coste: dataset pequeño (50 episodios, 35.001 frames), configuración de entrenamiento documentada y licencia Apache 2.0. No es un modelo de propósito general ni un LLM, sino un controlador visomotor especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer condicionado por observaciones con cabeza de predicción de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de un frame) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Especificaciones adicionales:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `front` |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.front` | VISUAL, shape `(3, 480, 640)` |
| Salida `action` | ACTION, shape `(6,)` |
| Dataset de entrenamiento | `SamarC/so101_grid_a1` |
| Episodios / frames | 50 episodios, 35.001 frames |
| Frecuencia de datos | 30 FPS |
| Tarea | "Pick up the red block and place it in A1" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-28 |

## Arquitectura y entrenamiento

ACT es un transformer que, en cada paso de inferencia, recibe la observación actual (estado articular de 6 dimensiones y una imagen RGB de 640x480) y predice un chunk de acciones futuras en lugar de una única acción. Esta predicción por chunks es la innovación central del método: reduce el horizonte efectivo de decisión, mitiga el compounding error típico de las políticas de imitación paso a paso y permite ejecutar acciones de forma más suave. La arquitectura incorpora un codificador visual (típicamente ResNet en la implementación de LeRobot) y un transformer que fusiona estado y características visuales para emitir la secuencia de acciones.

El entrenamiento es de imitación supervisada sobre 50 episodios teleoperados (35.001 frames a 30 FPS) del dataset `SamarC/so101_grid_a1`, con 20.000 pasos, batch de 8, AdamW y learning rate 1e-5. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de refuerzo; es aprendizaje por imitación puro. La model card no detalla la composición exacta del dataset más allá del número de episodios, frames, FPS y la tarea objetivo, ni innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visomotor de manipulación: predice acciones de 6 grados de libertad a partir de estado articular e imagen frontal.
- Ejecución de una tarea concreta de pick-and-place: "Pick up the red block and place it in A1".
- Predicción de chunks de acción, lo que aporta suavidad y robustez frente al error acumulado.
- Inferencia en tiempo real a 30 FPS sobre hardware de consumo.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento lingüístico, matemáticas, código ni capacidades multilingües: es una política robótica, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la imagen frontal de entrada.

## Casos de uso

- Automatización de pick-and-place en cuadrículas: el modelo coge un bloque rojo y lo deposita en la celda A1, adecuado para líneas de clasificación sencillas o demos de laboratorio con el SO-101.
- Prototipado de aprendizaje por imitación: sirve como referencia reproducible para validar un pipeline completo de LeRobot (grabación, entrenamiento, rollout) con 50 episodios y 20.000 pasos.
- Benchmark interno de políticas ACT: al estar la configuración de entrenamiento documentada, permite comparar variaciones de hiperparámetros o datasets sobre la misma tarea.
- Educación e investigación en robótica de bajo coste: el tamaño (51,7 M de parámetros, 0,2 GB) y la licencia Apache 2.0 lo hacen apto para cursos y laboratorios con GPUs de consumo.
- Base para fine-tuning en tareas similares: se puede reentrenar con `lerobot-train` sobre nuevos datasets de la misma morfología SO-101 para ampliar el repertorio de posiciones u objetos.
- Demostraciones en ferias o vídeos técnicos: la inferencia a 30 FPS y la simplicidad de despliegue permiten montar demos en vivo con una sola cámara frontal.
- Evaluación de robustez visomotora: útil para estudiar cómo afectan cambios de iluminación, posición de objetos o distracciones a una política ACT entrenada con datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el modelo ocupa aproximadamente 0,2 GB, por lo que la VRAM vendrá dominada por el codificador visual y los buffers de inferencia, no por los pesos.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente. Una RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, con alta probabilidad en GTX 1060/1660, RTX 2060/3060/4060 y superiores, siempre que se cumplan los requisitos de LeRobot y del stack de PyTorch.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=SamarC/act_grid_a1`); no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles; el dataset y la inferencia están pensados para 30 FPS, pero no se publican mediciones de latencia por paso ni de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (políticas ACT para SO-101 u otras políticas de imitación) con datos verificables de parámetros, contexto, rendimiento o licencia. Cualquier comparación numérica sería inventada.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("Pick up the red block and place it in A1") y una única morfología (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez fuera de las condiciones del dataset.
- Dataset pequeño: 50 episodios y 35.001 frames limitan la diversidad de posiciones, iluminación y distracciones; es probable que la política sea frágil ante cambios de escena.
- Dependencia de la cámara frontal: requiere que los nombres e índices de cámara coincidan con las claves de observación (`observation.images.front`) y que la resolución sea 640x480 a 30 FPS.
- Sin soporte lingüístico ni de agentes: no debe usarse como modelo de texto, código o razonamiento; las etiquetas de idioma no están disponibles porque no aplica.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene citar el paper de ACT y LeRobot según la model card.
- Riesgo de sobreajuste al entorno de grabación: la política puede fallar ante objetos distintos, posiciones no vistas o cambios de calibración del robot.
- Sin datos de sesgos: no se documentan sesgos conocidos más allá de los derivados del dataset de demostración.
- Fecha de creación futura (2026-11-28) y cero descargas/likes: modelo reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamarC/act_grid_a1
- Dataset de entrenamiento: https://huggingface.co/datasets/SamarC/so101_grid_a1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamarC/so101_grid_a1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
