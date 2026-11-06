# SebasKoedam/act_so101_training_1

## Resumen

`act_so101_training_1` es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada y publicada por el usuario SebasKoedam mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de una imagen de cámara y del estado de las articulaciones del robot, predice directamente comandos de acción para un brazo robótico SO-101 (variante `so_follower`).

El modelo resuelve una tarea única y muy concreta: coger un objeto rojo ("red benchy") y depositarlo en una caja gris. Se entrenó con 15 episodios de teleoperación (6.402 fotogramas a 30 FPS) y consta de 51.668.614 parámetros en formato safetensors, con un tamaño de repositorio de 0,2 GB. La entrada visual es una única cámara frontal a resolución 480x640 y la salida es un vector de 6 dimensiones correspondiente a las acciones del brazo.

Su relevancia es la de un artefacto de referencia: ilustra el flujo completo de LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`) sobre hardware de bajo coste. No es un modelo de propósito general ni un componente reutilizable fuera de tareas de manipulación robótica similares, y carece de licencia declarada y de evaluación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de una sola observación por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Librería | lerobot 0.6.2 |
| Tipo de robot | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tarea | "Pick up the red benchy and place it in the grey box." |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control. La arquitectura combina un codificador visual (procesa la imagen de la cámara frontal) con un transformer que fusiona la observación del estado de las articulaciones y genera el chunk de acciones. El modelo se entrenó con 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.6.2.

Los datos de entrenamiento provienen del dataset `SebasKoedam/so101_training_1_20261104_093731`, con 15 episodios y 6.402 fotogramas a 30 FPS de teleoperación sobre una única tarea. No se documenta composición del dataset más allá de la tarea, ni uso de RLHF, DPO u otras técnicas de refinamiento. La innovación técnica relevante es el propio esquema de action chunking del paper ACT (arXiv:2304.13705), no una contribución original de este modelo.

## Capacidades

- Control visuomotor de un brazo SO-101 (`so_follower`) a partir de una imagen frontal y del estado de 6 articulaciones.
- Predicción de chunks de acciones de 6 dimensiones para ejecución en bucle cerrado.
- Ejecución de una única tarea de manipulación: recoger el "red benchy" y colocarlo en la caja gris.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no aprendizaje por refuerzo).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación simbólica.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera de la imagen de entrada.

## Casos de uso

- Reproducción de la tarea de pick-and-place en un SO-101: ejecutar la política con `lerobot-rollout` sobre el mismo robot y disposición de cámara para validar el pipeline completo de LeRobot de extremo a extremo.
- Docencia y formación en aprendizaje por imitación: usar el modelo y su dataset como ejemplo mínimo (15 episodios, 6.402 fotogramas) para explicar grabación de datos, entrenamiento ACT y despliegue en robótica real.
- Punto de partida para fine-tuning en tareas similares: reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de manipulación con el mismo robot y cámara.
- Pruebas de integración de hardware SO-101: verificar calibración, puertos y cámaras antes de invertir en datasets mayores, ya que el modelo solo requiere una cámara frontal a 640x480 y 30 FPS.
- Benchmark interno de infraestructura de inferencia robótica: medir latencia y estabilidad de `lerobot-rollout` con una política de 51,7 M de parámetros y 0,2 GB de pesos.
- Comparación de metodologías de imitación: usar ACT como línea base frente a otros métodos soportados por LeRobot en la misma tarea y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni métricas de latencia documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors (0,2 GB de repositorio), la huella en memoria es del orden de cientos de MB, holgada en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA es suficiente por tamaño; el cuello de botella real es la captura de cámara a 30 FPS y la comunicación con el robot.
- Compatibilidad con GPU consumer: sí, por tamaño de modelo; no hay requisitos publicados que lo impidan.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) según la model card; el entrenamiento se realiza con `lerobot-train`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| `SebasKoedam/act_so101_training_1` | ACT (LeRobot) | 51,7 M | no aplica | no disponible | no |
| ACT original (paper arXiv:2304.13705) | ACT | no disponible en la información | no aplica | según paper | sí, en el paper |
| Otras políticas LeRobot (p. ej. Diffusion Policy, SmolVLA) | varias | no disponible en la información | no aplica | según repositorio | variable |

No se dispone de datos comparativos de rendimiento entre este modelo y alternativas en la misma tarea. La comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Entrenado para una única tarea y un único robot (`so_follower`); no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Dataset muy reducido (15 episodios, 6.402 fotogramas), lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y disposición concretas de la escena.
- Sin evaluación publicada: se desconoce la tasa de éxito real, incluso en las condiciones de entrenamiento.
- Licencia no declarada ("More Information Needed"): no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Dependencia de una cámara frontal con nombre de observación exacto (`observation.images.front`) y resolución 480x640; cambios de cámara o encuadre invalidan la política.
- Sin soporte de texto, tool calling ni razonamiento: no debe presentarse como un modelo de lenguaje ni usarse como tal.
- Riesgo de fallo silencioso en producción: al no haber métricas de robustez, se recomienda supervisión humana y parada de seguridad en el robot.
- Sesgos conocidos: no documentados; en robótica de imitación, los sesgos provienen de la distribución de demostraciones (posiciones, objetos y entorno del operador).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SebasKoedam/act_so101_training_1
- Dataset de entrenamiento: https://huggingface.co/datasets/SebasKoedam/so101_training_1_20261104_093731
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SebasKoedam/so101_training_1_20261104_093731
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
