# mrodher/policy_test_V12_2

## Resumen

`mrodher/policy_test_V12_2` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. El modelo lo publica el usuario `mrodher` en Hugging Face y se ha entrenado y exportado con LeRobot, la librería de aprendizaje automático para robótica real de Hugging Face. Su propósito es controlar un brazo robótico de tipo `so_follower` (familia SO-101) para ejecutar la tarea concreta de colocar una pieza de color beige sobre un marcador ArUco.

La política consume el estado articular del robot (vector de 6 dimensiones) y dos flujos de vídeo de 480x640 píxeles procedentes de cámaras `top` y `wrist`, y produce un vector de acción de 6 dimensiones. El checkpoint contiene 51.668.614 parámetros en formato safetensors y ocupa aproximadamente 0,2 GB, lo que lo sitúa en el rango de políticas ligeras ejecutables en hardware de consumo.

Es relevante ahora porque ilustra el flujo completo de LeRobot para entrenar políticas de imitación de extremo a extremo: grabación de datos teleoperados, entrenamiento con ACT y despliegue en robot real mediante `lerobot-rollout`. No obstante, se trata de un artefacto de prueba (el nombre `policy_test` y el dataset `so101_dataset_test_V12` lo indican) sin resultados de evaluación publicados ni licencia declarada, por lo que no debe considerarse un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ACT opera sobre observaciones por fotograma y chunks de acción) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador visual (procesa las imágenes de las cámaras `top` y `wrist`, cada una de 3x480x640) con un transformer que fusiona la representación visual y el estado articular (`observation.state`, 6 dimensiones) para predecir chunks de acciones, es decir, secuencias cortas de comandos de 6 dimensiones en lugar de un único paso. Esta predicción por chunks reduce el error de acumulación típico de las políticas paso a paso y suele mejorar la tasa de éxito en tareas de manipulación.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `mrodher/so101_dataset_test_V12`: 110 episodios, 43.186 fotogramas a 30 FPS, con la única tarea "put the beige piece on the aruco". La configuración registrada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni datos adicionales fuera del dataset citado; tampoco se detalla la composición exacta ni el número de tokens (no aplica en el sentido lingüístico). El robot objetivo es `so_follower` con cámaras `top` y `wrist`.

## Capacidades

- Control de un brazo robótico `so_follower` mediante predicción de acciones de 6 dimensiones a partir de observaciones visuales y de estado articular.
- Aprendizaje por imitación a partir de datos teleoperados: reproduce la tarea "put the beige piece on the aruco" para la que fue entrenado.
- Predicción de chunks de acción, lo que permite ejecutar secuencias de movimiento coherentes sin replanificar en cada fotograma.
- Fusión multimodal de dos cámaras (vista superior y vista de muñeca) con el estado del robot.
- Ejecución en tiempo real a 30 FPS en el bucle de control de LeRobot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de robótica, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor para la tarea entrenada.

## Casos de uso

- Automatización de una tarea de pick-and-place concreta: colocar una pieza beige sobre un marcador ArUco con un brazo SO-101. El modelo está entrenado específicamente para esta tarea y puede ejecutarla de forma autónoma mediante `lerobot-rollout`.
- Prototipado de flujos de aprendizaje por imitación: sirve como referencia para validar el pipeline completo de LeRobot (grabación, entrenamiento y despliegue) antes de escalar a tareas propias.
- Benchmark interno de políticas ACT: al ser un checkpoint ligero (0,2 GB, ~51,7 M de parámetros), permite comparar configuraciones de entrenamiento y datasets en hardware modesto.
- Docencia y formación en robótica: útil para demostrar cómo una política visual-motora aprende de datos teleoperados y cómo se ejecuta en un robot real.
- Investigación en manipulación con múltiples cámaras: el uso conjunto de vistas `top` y `wrist` permite estudiar la contribución de cada cámara al éxito de la tarea.
- Base para fine-tuning en tareas similares: al estar en formato safetensors y ser compatible con LeRobot, puede reentrenarse o ajustarse sobre nuevos datasets de la misma familia de robot.
- Pruebas de integración de hardware: validar la calibración de cámaras, puertos y velocidades del SO-101 antes de desplegar políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de éxito por tarea, ni comparación con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (0,2 GB), la inferencia requiere muy poca memoria, del orden de menos de 1 GB en FP32 incluyendo activaciones y buffers de imagen, aunque no se ha publicado una cifra verificada.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con soporte CUDA (por ejemplo, RTX 3060 o superior) debería ser suficiente, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Por el tamaño del checkpoint, es altamente probable que sí en GPUs de consumo actuales; no obstante, no se documenta una prueba concreta.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (estrategia `base`), con `--policy.path=mrodher/policy_test_V12_2`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset y el bucle de control operan a 30 FPS, pero no se publica la latencia real de inferencia ni el throughput medido.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mrodher/policy_test_V12_2` | ACT (LeRobot) | 51.668.614 | no aplica | no disponible | Hugging Face |
| Políticas ACT de referencia en LeRobot | ACT (LeRobot) | no disponible | no aplica | según repositorio | Hugging Face / docs LeRobot |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | no disponible | no aplica | según repositorio | Hugging Face / docs LeRobot |
| Políticas VQ-BeT en LeRobot | VQ-BeT | no disponible | no aplica | según repositorio | Hugging Face / docs LeRobot |

No se dispone de datos de rendimiento comparables (tasas de éxito, latencia) para este checkpoint ni para las alternativas en la información proporcionada, por lo que la comparación se limita a tipo de método, disponibilidad y licencia.

## Limitaciones y advertencias

- Es un artefacto de prueba: el nombre `policy_test_V12_2` y el dataset `so101_dataset_test_V12` sugieren un uso experimental, no un modelo validado.
- Sin resultados de evaluación: no hay tasas de éxito publicadas, por lo que se desconoce su fiabilidad real en la tarea.
- Licencia no declarada: la model card indica "More Information Needed"; no se puede asumir uso comercial sin aclaración del autor.
- Especialización extrema: solo se ha entrenado para la tarea "put the beige piece on the aruco" con un robot `so_follower` y cámaras concretas; no generaliza a otras tareas, objetos ni configuraciones de hardware sin reentrenamiento.
- Dependencia de calibración: el rendimiento depende de la calibración del robot, la posición e índices de las cámaras y la coincidencia de los nombres de observación (`observation.images.top`, `observation.images.wrist`).
- Riesgo de sobreajuste al dataset: 110 episodios y 43.186 fotogramas son un volumen modesto; es probable que la política sea sensible a cambios de iluminación, posiciones de objetos o distracciones no presentes en los datos.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual-motor, puede heredar sesgos de las condiciones de grabación (iluminación, fondo, posiciones).
- No apto para producción sin validación: al no haber evaluación ni licencia clara, no debería desplegarse en entornos reales sin pruebas propias y aclaración legal.
- Idiomas: no aplica; no es un modelo lingüístico y no ofrece capacidades multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrodher/policy_test_V12_2
- Dataset de entrenamiento: https://huggingface.co/datasets/mrodher/so101_dataset_test_V12
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrodher/so101_dataset_test_V12
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
