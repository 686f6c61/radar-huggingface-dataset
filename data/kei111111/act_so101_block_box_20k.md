# kei111111/act_so101_block_box_20k

## Resumen

act_so101_block_box_20k es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el paper arXiv:2304.13705. El modelo lo ha desarrollado el usuario kei111111 y está alojado en Hugging Face bajo la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visual-motor que, a partir de una imagen de cámara y del estado de las articulaciones del robot, predice directamente comandos de acción para un brazo robótico SO-101 (tipo `so_follower`).

El modelo resuelve una tarea muy concreta de manipulación: "Pick up the block and place it into the box" (coger un bloque y colocarlo dentro de una caja). Se ha entrenado mediante aprendizaje por imitación a partir de 50 episodios teleoperados (10.971 fotogramas a 15 FPS) y consta de 51.668.614 parámetros. Su relevancia es práctica: demuestra el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en hardware de bajo coste, y sirve como referencia reproducible para quien quiera replicar el pipeline con su propio robot.

La arquitectura es un transformer con codificador visual y decodificador de acciones que predice "chunks" de acciones (varios pasos futuros de golpe) en lugar de acciones individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La entrada visual es una única cámara de muñeca a 480x640 y la salida es un vector de 6 dimensiones (acción). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa un chunk de acciones por inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica / no disponible (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 6,2 GB, librería LeRobot) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | `wrist` (una cámara de muñeca) |
| Entrada de estado | `observation.state` de forma (6,) |
| Entrada visual | `observation.images.wrist` de forma (3, 480, 640) |
| Salida | `action` de forma (6,) |
| Pasos de entrenamiento | 20.000 |
| Tamaño de batch | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice chunks de acciones de corto plazo en lugar de un único paso. La política combina un codificador visual (procesa la imagen de la cámara de muñeca a 480x640) con un transformer que, condicionado por el estado de las articulaciones (6 dimensiones) y la observación visual, genera un vector de acción de 6 dimensiones. La predicción por chunks mitiga el problema de acumulación de errores típico de las políticas paso a paso y favorece la suavidad del movimiento.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `kei111111/so101_block_box_50episodes_final_20261107_190045`, compuesto por 50 episodios teleoperados, 10.971 fotogramas a 15 FPS, todos ellos de la tarea "Pick up the block and place it into the box". Se ejecutaron 20.000 pasos con batch de 8, AdamW y learning rate de 1e-05, semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni de otras técnicas de refinamiento posteriores; es aprendizaje por imitación supervisado puro. Tampoco se detalla la composición exacta del dataset más allá del número de episodios, fotogramas y la tarea.

## Capacidades

- Control visual-motor de un brazo robótico SO-101 (`so_follower`) a partir de una cámara de muñeca.
- Predicción de chunks de acciones de 6 dimensiones para tareas de manipulación (pick-and-place).
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere definición manual de recompensas.
- Ejecución de la tarea específica "Pick up the block and place it into the box".
- Integración con el ecosistema LeRobot: carga vía `lerobot-rollout` y entrenamiento vía `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras capacidades cognitivas.
- No se documentan capacidades de generalización a otras tareas, objetos o posiciones distintas de las del dataset de entrenamiento.

## Casos de uso

- Pick-and-place de laboratorio: el modelo ejecuta la tarea de coger un bloque y depositarlo en una caja sobre un brazo SO-101, útil como banco de pruebas reproducible de aprendizaje por imitación en entornos docentes o de investigación.
- Replicación del pipeline LeRobot: sirve como referencia completa (dataset, configuración de entrenamiento y pesos) para que un equipo entrene su propia política ACT con su robot y sus datos, siguiendo los comandos `lerobot-train` documentados.
- Validación de hardware SO-101: permite comprobar la cadena completa de calibración, captura de cámara de muñeca e inferencia antes de invertir en la grabación de un dataset propio.
- Benchmark interno de imitación: al tener configuración y dataset públicos, se puede usar como línea base para comparar variantes de ACT, cambios de hiperparámetros o nuevos datasets sobre la misma tarea.
- Demostraciones educativas: el modelo ilustra de forma tangible cómo un transformer visual-motor transforma observaciones (imagen + estado) en comandos de control, adecuado para cursos de robótica y aprendizaje automático.
- Pruebas de integración de `lerobot-rollout`: sirve para verificar el flujo de despliegue en un robot real con `--strategy.type=base`, `--duration` y las cámaras configuradas, antes de pasar a políticas en producción.
- Prototipado de automatización de bajo coste: en escenarios donde la tarea es fija y el entorno controlado, una política ACT como esta puede automatizar una operación repetitiva de recogida y depósito sin necesidad de programación explícita de trayectorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Con 51,7 M de parámetros, los pesos en precisión completa ocupan del orden de 0,2 GB; el repo de 6,2 GB incluye además checkpoints y artefactos de entrenamiento. La carga real depende del runtime de LeRobot y del preprocesado de imagen (480x640).
- GPU recomendadas: no especificadas por el autor. El comando de entrenamiento documentado usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA con CUDA; no se indica modelo concreto (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? Por el tamaño del modelo (51,7 M de parámetros) es previsible que sí quepa en GPU de consumo, pero el autor no aporta requisitos mínimos ni cifras verificadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 15 FPS y las cámaras de ejemplo se configuran a 30 FPS, pero no se publican medidas de latencia de inferencia ni de frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act_so101_block_box_20k (este) | ACT / imitación | 51,7 M | no aplica | Pick-and-place bloque en caja, SO-101 | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT de referencia de LeRobot | ACT / imitación | no disponible | no aplica | Varía según dataset | Apache 2.0 (repo LeRobot) | Hugging Face / GitHub |
| Políticas Diffusion Policy | Difusión / imitación | no disponible | no aplica | Manipulación diversa | según implementación | Repos de investigación |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a tipo de método, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Entrenado para una única tarea y un único robot (`so_follower`): no se documenta generalización a otros objetos, posiciones, iluminación o entornos.
- Dependencia de una sola cámara de muñeca (`wrist`): la oclusión o un montaje distinto pueden degradar el rendimiento.
- Dataset pequeño (50 episodios, 10.971 fotogramas): riesgo de sobreajuste a las condiciones exactas de grabación.
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento, código ni multilingües; cualquier uso en esos ámbitos es inadecuado.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras ante observaciones fuera de distribución.
- Sesgos: no documentados por el autor; al ser imitación de un operador humano concreto, puede heredar sus patrones de movimiento y sus errores.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado antes de reutilizarlo.
- Requiere calibración y configuración específicas de puerto y cámaras (`--robot.port`, índices de cámara) que no vienen prefijadas.
- No se documentan requisitos de seguridad para operar el robot; en producción deben añadirse límites de par, paradas de emergencia y supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kei111111/act_so101_block_box_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/kei111111/so101_block_box_50episodes_final_20261107_190045
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kei111111/so101_block_box_50episodes_final_20261107_190045
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
