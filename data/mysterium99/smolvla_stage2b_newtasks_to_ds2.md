# mysterium99/smolvla_stage2b_newtasks_to_ds2

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación. Esta ficha concreta, `mysterium99/smolvla_stage2b_newtasks_to_ds2`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre el conjunto de datos `ds2`, orientado a una tarea específica de manipulación: colocar tuercas en un vaso rojo y tornillos en un cubo azul.

El modelo resuelve el problema de desplegar políticas robóticas de aprendizaje por imitación en hardware de consumo, evitando la necesidad de modelos VLA de gran escala. Con 450 millones de parámetros y un repositorio de 0,9 GB, procesa tres cámaras RGB de 256x256 píxeles más un vector de estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones a 30 FPS.

Es relevante porque demuestra el flujo completo de LeRobot: ajuste fino de una política VLA preentrenada sobre un dataset propio y despliegue en un robot real mediante la CLI `lerobot-rollout`. No obstante, se trata de un experimento con cero descargas y sin resultados de evaluación publicados, por lo que su validez fuera del dataset de entrenamiento no está verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, segun paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de control robotico, no conversacional) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

SmolVLA es una política VLA compacta que combina percepción visual, comprensión de la instrucción en lenguaje natural y generación de acciones motoras. El modelo consume tres flujos de imagen (`observation.images.camera1/2/3`, 3x256x256), un vector de estado propioceptivo (`observation.state`, 6 dimensiones) y una instrucción textual de tarea, y produce un vector de acción de 6 dimensiones. La arquitectura exacta (backbone visual, codificador de lenguaje, cabecera de acción) se describe en el paper arXiv:2506.01844, no en la model card.

El ajuste fino se realizó sobre `lerobot/smolvla_base` con el dataset `ds2`: 50 episodios, 110.961 fotogramas a 30 FPS, tarea "put nuts in red cup and bolts in blue bucket". La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4, semilla 0 y LeRobot 0.6.1. No se documenta composición del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las del modelo base.

## Capacidades

- Control robótico por imitación: genera trayectorias de acción de 6 dimensiones a partir de observaciones visuales y propioceptivas.
- Percepción multi-cámara: procesa tres vistas simultáneas (`gripper`, `newtop`, `newside`) a 256x256.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como texto (`--task`), lo que permite especificar el objetivo en tiempo de ejecución.
- Manipulación bimanual o de pinza: el vector de acción de 6 dimensiones sugiere control de un brazo con pinza (posición/orientación más apertura).
- Ejecución en tiempo real: entrenado a 30 FPS, compatible con el bucle de control de LeRobot.
- No soporta tool calling, function calling, agentes multi-paso ni modo thinking: no es un modelo de lenguaje general.
- Capacidades multilingües: no disponibles; el condicionamiento textual depende del vocabulario del modelo base.

## Casos de uso

- Clasificación de piezas en línea de montaje: el modelo ejecuta la tarea "put nuts in red cup and bolts in blue bucket", separando tuercas y tornillos en contenedores distintos; adecuado por su entrenamiento específico sobre esa secuencia.
- Prototipado de políticas VLA en laboratorio: sirve como punto de partida para validar el pipeline `lerobot-train` → `lerobot-rollout` con un robot de tipo `follow` y tres cámaras.
- Investigación en aprendizaje por imitación: permite reproducir el ajuste fino de `smolvla_base` con un dataset pequeño (50 episodios) y comparar hiperparámetros.
- Despliegue en hardware de consumo: con 450 M de parámetros y 0,9 GB de pesos, puede ejecutarse en una GPU de gama media o incluso en CPU para pruebas de latencia.
- Generación de datos sintéticos de manipulación: usar la política para etiquetar o aumentar episodios en un dataset de pick-and-place.
- Demostraciones educativas de robótica: ejemplo completo de entrenamiento y ejecución de una política VLA con LeRobot, útil en cursos y talleres.
- Benchmark interno de robustez: evaluar la degradación de la política ante cambios de iluminación, posición de objetos o distractores, aunque no hay resultados publicados que lo respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real ni de comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en fp32 los pesos ocupan aproximadamente 1,8 GB, y en fp16 aproximadamente 0,9 GB, a lo que hay que sumar activaciones de tres imágenes de 256x256.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 o superior debería ser suficiente para inferencia en fp16.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo y el repositorio de 0,9 GB, aunque no hay confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), con soporte de `--policy.path` apuntando al repositorio de Hugging Face; el dispositivo se selecciona con `--policy.device` (por ejemplo `cuda`).
- Latencia y throughput estimados: no disponibles; el entrenamiento se realizó a 30 FPS, pero no se documenta la latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2b_newtasks_to_ds2 | 450 M | no disponible | Manipulación pick-and-place (tuercas/tornillos) | apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base preentrenada, ajustable a tareas | no disponible en la informacion | Hugging Face (modelo base) |
| Otras políticas VLA de gran escala (por ejemplo, OpenVLA) | no disponible en la informacion | no disponible | Control robótico general | no disponible en la informacion | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos verificados de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez fuera del dataset de entrenamiento.
- Especialización estrecha: entrenado para una única tarea ("put nuts in red cup and bolts in blue bucket") sobre 50 episodios; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuración de cámaras: los nombres y la disposición de las cámaras (`gripper`, `newtop`, `newside`) deben coincidir con los del entrenamiento; cambios de montaje degradan el rendimiento.
- Sesgos: no documentados; al ser un modelo de control robótico, los sesgos relevantes serían de distribución visual (iluminación, fondo, objetos) del dataset `ds2`.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erráticas o inseguras ante observaciones fuera de distribución.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Repositorio sin descargas ni likes y creado en 2026: no hay evidencia de uso comunitario ni de mantenimiento.
- Idiomas: no disponibles; el condicionamiento textual está limitado al vocabulario del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2b_newtasks_to_ds2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset ds2: https://huggingface.co/datasets/ds2
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
