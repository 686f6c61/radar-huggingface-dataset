# alohateam1423/act_pick_cube_50

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones ("chunks") en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `alohateam1423/act_pick_cube_50`, es una política entrenada con LeRobot para el robot `so_follower` (SO-100/SO-101 de bajo coste) con el objetivo de agarrar un cubo negro.

El modelo consume el estado articular de 6 dimensiones y dos flujos de vídeo (cámara cenital y cámara de muñeca) a 480x640, y produce un vector de acción de 6 dimensiones. Se entrenó durante 100.000 pasos sobre un dataset propio de 50 episodios teleoperados (22.500 frames a 30 FPS) capturados el 8 de octubre de 2026. Con 51,6 millones de parámetros y un tamaño de repo de 0,2 GB, es un modelo ligero que puede ejecutarse en tiempo real en GPUs de consumo.

Su relevancia es práctica: demuestra el flujo completo de LeRobot (grabación, entrenamiento, despliegue) para una tarea concreta de pick-and-place, y sirve como referencia reproducible para quien quiera entrenar políticas ACT con hardware asequible. No es un modelo de propósito general: está especializado en una única tarea y un único robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de robótica; ventana de observación por chunk, valor no especificado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión original no indicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea va en inglés: "Grab the black cube") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación: un encoder visual procesa las imágenes de las cámaras `overhead` y `wrist` (3x480x640 cada una), se concatenan con el estado proprioceptivo de 6 dimensiones y un decoder autoregresivo genera un chunk de acciones de 6 dimensiones. La predicción por chunks (en lugar de paso a paso) es la innovación central del método y mitiga el sesgo de compounding error típico de las políticas de imitación.

El entrenamiento se realizó con LeRobot 0.6.0 sobre 50 episodios (22.500 frames, 30 FPS) del dataset `alohateam1423/pick-cube_20261008_100512`, con 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta composición adicional del dataset, aumento de datos ni fases de RLHF/DPO (no aplicables a este paradigma). Tampoco se especifica el tamaño del chunk de acciones ni la configuración exacta del backbone visual.

## Capacidades

- Manipulación robótica por imitación: ejecuta la tarea "Grab the black cube" sobre un robot `so_follower`.
- Fusión multimodal: combina estado articular (6 dims) con dos vistas RGB (cenital y muñeca).
- Predicción de chunks de acción: genera secuencias cortas de acciones de 6 dimensiones por inferencia.
- Control en tiempo real: entrenado para operar a 30 FPS, compatible con el bucle de `lerobot-rollout`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No tiene visión general, audio ni modo "thinking": la visión es específica para las dos cámaras del robot.

## Casos de uso

- Pick-and-place de laboratorio: recoger un cubo negro y depositarlo en una posición objetivo con un SO-100/SO-101; el modelo está entrenado exactamente para esa tarea y ese robot.
- Base para fine-tuning: punto de partida para entrenar variantes con más episodios o posiciones de objeto distintas usando `lerobot-train` con `--policy.type=act`.
- Validación de pipeline LeRobot: sirve para verificar de extremo a extremo la instalación, calibración de cámaras y comunicación con el robot antes de invertir en datasets mayores.
- Docencia y prototipado en robótica de bajo coste: permite demostrar aprendizaje por imitación con hardware asequible y una GPU de consumo.
- Benchmark interno de recogida de datos: comparar la calidad de nuevos datasets teleoperados contra este baseline de 50 episodios.
- Pruebas de robustez visual: evaluar cómo afectan cambios de iluminación, posición del cubo o distractores al éxito de la política (aunque el autor no publica tasas de éxito).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,6 M de parámetros los pesos ocupan del orden de 100-200 MB en FP32/FP16, más el coste de los dos encoders visuales a 480x640. Cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA; RTX 3060/4060 o superiores son suficientes. A100/H100 no son necesarias para inferencia, solo para entrenamiento a mayor escala.
- Cabe en GPU de consumo: sí, en la práctica totalidad de RTX y en muchas GTX con suficiente VRAM.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial) con `--policy.path=alohateam1423/act_pick_cube_50`; entrenamiento con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a políticas de robótica).
- Latencia y throughput: no disponibles. El sistema está pensado para operar a 30 FPS, pero no se publican mediciones de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pick_cube_50 (este) | 51,6 M | no aplica | Pick cube, so_follower | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | Tareas diversas | variable (mayoría Apache 2.0) | Hugging Face |
| Diffusion Policy (referencia) | variable | no aplica | Manipulación por imitación | MIT/Apache según implementación | Repos públicos |
| π0 / VLA generalistas | miles de millones | largo | Manipulación general | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo para "Grab the black cube" con un `so_follower` y dos cámaras concretas; no generaliza a otras tareas, objetos o configuraciones de cámara sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que se desconoce su robustez real ante cambios de iluminación, posición del cubo o distractores.
- Dataset pequeño: 50 episodios y 22.500 frames son un volumen reducido; es probable sobreajuste a las condiciones de grabación.
- Dependencia de hardware: requiere el robot `so_follower` y cámaras con los nombres `overhead` y `wrist`; cambiar índices o nombres rompe la inferencia.
- Sin capacidades de lenguaje: no admite instrucciones en lenguaje natural más allá del string de tarea fijo, ni tool calling ni agentes.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo en producción.
- Riesgo de alucinación en el sentido de acciones no válidas: como toda política de imitación, puede generar trayectorias fuera de distribución si el estado observado se aleja del dataset de entrenamiento.
- Sin información sobre sesgos: no se documentan sesgos demográficos (no aplica) ni sesgos de datos más allá de la limitación de un único operador y entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alohateam1423/act_pick_cube_50
- Dataset de entrenamiento: https://huggingface.co/datasets/alohateam1423/pick-cube_20261008_100512
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=alohateam1423/pick-cube_20261008_100512
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
