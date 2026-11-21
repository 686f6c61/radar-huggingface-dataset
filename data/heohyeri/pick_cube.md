# heohyeri/pick_cube

## Resumen

`heohyeri/pick_cube` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales. El modelo lo publica el usuario heohyeri en Hugging Face usando la librería LeRobot de Hugging Face, y está asociado a un dataset propio de 36 episodios teleoperados para la tarea "Pick up the cube and place it on the place".

Se trata de un modelo de 51.670.663 parámetros (unos 51,7 M) en formato safetensors, con un tamaño de repositorio de 0,2 GB. La política consume un vector de estado de 7 dimensiones y una imagen de cámara de muñeca de 3×480×640 píxeles, y produce un vector de acción de 7 dimensiones. El robot objetivo es un `so102_follower` (SO-102 follower) con una única cámara `cam_wrist`.

Es relevante como ejemplo práctico de pipeline completo de LeRobot: grabación de datos, entrenamiento de una política ACT y publicación en el Hub para su reproducción con `lerobot-rollout`. No es un modelo de lenguaje ni un modelo fundacional generalista; es una política específica de una tarea concreta, y su valor está en servir de plantilla reproducible para experimentos de manipulación robótica de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | `so102_follower` |
| Camaras | `cam_wrist` |
| Entrada de estado | `observation.state` de forma `(7,)` |
| Entrada visual | `observation.images.cam_wrist` de forma `(3, 480, 640)` |
| Salida de accion | `action` de forma `(7,)` |
| Dataset de entrenamiento | `heohyeri/pick_cube` (36 episodios, 15.609 frames, 30 FPS) |
| Pasos de entrenamiento | 50.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice secuencias cortas de acciones (chunks) en lugar de una acción por paso de tiempo. Esto reduce el error de acumulación típico de las políticas que actúan paso a paso y suaviza la ejecución. La entrada combina el estado propioceptivo del robot (7 dimensiones) con una imagen RGB de la cámara de muñeca (3×480×640), y la salida es un vector de acción de 7 dimensiones, presumiblemente correspondiente a las articulaciones del `so102_follower`.

El entrenamiento se realizó sobre el dataset `heohyeri/pick_cube`, con 36 episodios teleoperados, 15.609 frames a 30 FPS (unos 520 segundos de datos) y una única tarea: coger un cubo y colocarlo en el lugar indicado. La configuración reportada incluye 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, ejecutado con LeRobot 0.6.0. No se especifica en la información disponible si hubo aumento de datos, variaciones de iluminación o posiciones de objetos, ni detalles sobre la composición exacta del dataset más allá del número de episodios y frames.

## Capacidades

- Manipulación robótica de una tarea específica: coger un cubo y colocarlo en una posición designada.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin refuerzo ni recompensas explícitas.
- Predicción de chunks de acción con horizonte corto, lo que reduce la acumulación de error en ejecución.
- Control de un robot `so102_follower` con 7 dimensiones de acción.
- Percepción visual monocámara mediante una imagen de muñeca de 480×640.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y ejecución con `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual: no es un modelo de lenguaje.
- No dispone de capacidades multilingües ni de modo *thinking*.

## Casos de uso

- Reproducción de la tarea pick-and-place en un SO-102: ejecutar `lerobot-rollout` con la política cargada y la tarea "Pick up the cube and place it on the place" permite validar el pipeline completo de inferencia sobre hardware real.
- Plantilla para nuevos experimentos de imitación: sirve como referencia de configuración (50.000 pasos, batch 8, lr 1e-05, AdamW) para entrenar políticas ACT en tareas similares con el mismo robot.
- Docencia y formación en robótica de bajo coste: el par política + dataset permite a estudiantes entender el flujo grabación → entrenamiento → despliegue sin infraestructura pesada (0,2 GB de pesos).
- Benchmark interno de manipulación: al ser una tarea sencilla y bien delimitada, se puede usar como línea base para comparar variantes de ACT, cambios de cámara o aumentos de datos.
- Prototipado de automatización de pick-and-place en laboratorio: con un cubo y una zona de destino fija, la política puede integrarse en una celda de pruebas para validar agarre y transporte.
- Generación de datos sintéticos o de evaluación: la política puede ejecutarse para producir trayectorias que luego se comparan con las demostraciones humanas del dataset original.
- Base para *fine-tuning* en tareas de mayor dificultad: al estar publicada con licencia Apache 2.0 y en safetensors, se puede reentrenar con nuevos episodios manteniendo la arquitectura ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos en safetensors, el modelo ocupa del orden de 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100) es suficiente; el cuello de botella real será la captura de cámara y el control del robot, no el cómputo del modelo.
- Cabe en GPU consumer: sí, con margen amplio; incluso podría ejecutarse en CPU para inferencia, aunque la latencia de control a 30 FPS probablemente requiera GPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control del dataset es de 30 FPS, pero no se reportan tiempos de inferencia reales.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heohyeri/pick_cube | 51,7 M | ACT (imitación) | no aplica | apache-2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | variable | ACT | no aplica | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | variable | diffusion policy | no aplica | variable | Hugging Face |
| Políticas VLA (p. ej. RT-2, OpenVLA) | miles de millones | VLA | texto + imagen | variable | variable |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación relevante es metodológica: ACT predice chunks de acción y suele entrenar más rápido que Diffusion Policy en tareas de manipulación sencillas, mientras que los modelos VLA son órdenes de magnitud mayores y generalizan a múltiples tareas, a costa de mucho más cómputo.

## Limitaciones y advertencias

- Política de una sola tarea: entrenada exclusivamente para "Pick up the cube and place it on the place"; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy pequeño: 36 episodios y 15.609 frames (unos 520 segundos) implican poca diversidad; probablemente sensible a cambios de iluminación, posición del cubo, fondo o calibración de la cámara.
- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia de hardware concreto: robot `so102_follower` y cámara `cam_wrist`; cambiar de robot o de cámara invalida la política.
- Sin capacidades de lenguaje, tool calling ni razonamiento: no es adecuada para tareas cognitivas o conversacionales.
- Riesgo de sobreajuste al entorno de grabación: al no documentarse aumentos de datos ni variaciones, la política puede fallar fuera de las condiciones de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo de despliegue.
- Sin información sobre sesgos: no aplica en el sentido habitual de modelos de lenguaje, pero sí existe riesgo de sesgo hacia las posiciones y trayectorias de las demostraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heohyeri/pick_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/heohyeri/pick_cube
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=heohyeri/pick_cube
