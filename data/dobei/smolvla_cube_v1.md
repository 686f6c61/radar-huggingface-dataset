# dobei/smolvla_cube_v1

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación a partir de observaciones visuales y de estado. Esta ficha concreta, `dobei/smolvla_cube_v1`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un conjunto de datos propio de 25 episodios y 11.286 fotogramas a 30 FPS para la tarea "pick and place" con un robot SO-101 (tipo `so_follower`). El modelo consume tres cámaras de 256x256 píxeles y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones.

El modelo resuelve el problema de dotar a un brazo robótico de bajo coste de una política de manipulación entrenada de extremo a extremo, sin ingeniería de control manual. Su relevancia radica en que SmolVLA está pensado para ejecutarse en hardware de consumo, lo que abarata el ciclo de entrenamiento y despliegue en robótica de investigación y prototipado. Con 450 millones de parámetros y pesos en safetensors, el repositorio ocupa 0,9 GB.

Se trata de un artefacto muy específico: una política de imitación para una tarea y un robot concretos, no un modelo de propósito general. La model card no reporta resultados de evaluación en robot real, y el entrenamiento fue muy corto (100 pasos), lo que condiciona su robustez fuera del entorno de captura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según el paper SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo no genera lenguaje; recibe una instrucción de tarea en texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una política de imitación que combina percepción visual y comprensión de una instrucción en lenguaje natural con la generación de acciones motoras de bajo nivel. La model card no detalla la composición interna de capas ni el mecanismo de fusión visión-lenguaje-acción; remite al paper arXiv:2506.01844 para la descripción arquitectónica. La entrada son tres cámaras (`observation.images.camera1`, `camera2`, `camera3`) de 3x256x256 y un vector `observation.state` de 6 componentes; la salida es un vector `action` de 6 componentes.

El entrenamiento es un fine-tuning del checkpoint `lerobot/smolvla_base` sobre el dataset `dobei/so101_red_cube_blue_box_2_20261117_161737` (25 episodios, 11.286 fotogramas, 30 FPS, tarea "pick and place"). La configuración reportada es de 100 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.7.1. No se indica el número de tokens de entrenamiento ni si hubo RLHF o DPO; en robótica por imitación lo habitual es aprendizaje supervisado sobre demostraciones, pero la model card no lo confirma explícitamente. El volumen de datos y de pasos es reducido, orientado a una única tarea de recogida y colocación de un cubo rojo en una caja azul.

## Capacidades

- Generación de acciones de manipulación de 6 grados de libertad a partir de observaciones visuales multicámara y estado propioceptivo.
- Ejecución de la tarea concreta "pick and place" sobre el objeto y el entorno del dataset de entrenamiento.
- Condicionamiento por instrucción de tarea en texto (`--task="pick and place"` en el comando de rollout).
- Percepción visual con tres cámaras simultáneas (escena y muñeca, según la model card).
- Despliegue en hardware de consumo, según la descripción del paper de SmolVLA.
- No se documentan capacidades de tool calling, razonamiento multi-paso, diálogo multilingüe, visión general, audio ni modo de pensamiento; es una política motora, no un asistente conversacional.

## Casos de uso

- Recogida y colocación automatizada en laboratorio: el modelo ejecuta la tarea "pick and place" sobre un cubo rojo y una caja azul con un robot SO-101, usando las tres cámaras como entrada. Es su caso de uso directo y el único validado por los datos de entrenamiento.
- Prototipado de pipelines de imitación con LeRobot: sirve como ejemplo reproducible de fine-tuning de `smolvla_base` con un dataset pequeño (25 episodios), útil para aprender el flujo `lerobot-train` y `lerobot-rollout`.
- Base para transferencia a nuevas tareas de manipulación: al partir de un checkpoint ya ajustado a un brazo SO-101, se puede reentrenar con un dataset propio de otra tarea sobre el mismo hardware.
- Docencia e investigación en robótica de bajo coste: permite montar un banco de pruebas de VLA en hardware asequible, dado el énfasis del paper en despliegue en hardware de consumo.
- Evaluación comparativa de políticas de imitación: como política de referencia entrenada con 100 pasos y 25 episodios, sirve para medir el efecto de aumentar datos o pasos en la tasa de éxito.
- Integración en demostraciones de manipulación visual: el rollout con `--strategy.type=base` y `--duration` permite grabar ejecuciones de 60 segundos para vídeos o validaciones rápidas.
- No es adecuado para tareas fuera de su distribución (otros objetos, otras posiciones, otra iluminación) sin reentrenamiento, ni para aplicaciones conversacionales o de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota literal "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito en robot real ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 450 millones de parámetros en safetensors (0,9 GB de repositorio), la huella en FP32 rondaría 1,8 GB y en FP16 unos 0,9 GB, aunque no se confirma el dtype de los pesos.
- GPU recomendadas: no disponibles; el paper de SmolVLA afirma que el modelo puede desplegarse en hardware de consumo, pero la model card no especifica modelos concretos.
- ¿Cabe en GPU de consumo? Según la descripción del paper, sí; no se detalla en qué tarjetas.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout` para inferencia en robot y `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política motora de este tipo.
- Latencia y throughput: no disponibles. El dataset se capturó a 30 FPS, pero no se reporta la frecuencia de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dobei/smolvla_cube_v1 | 450 M | no disponible | Pick and place SO-101 | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face |
| Otras políticas VLA (p. ej. OpenVLA, π0) | no disponible en la información | no disponible | Manipulación general | no disponible en la información | no disponible |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para este checkpoint ni datos de rendimiento de los modelos comparables en la información proporcionada. La única comparación fiable es con su modelo base, `lerobot/smolvla_base`, del que este checkpoint es un fine-tuning específico para una tarea y un robot.

## Limitaciones y advertencias

- Entrenamiento muy limitado: 100 pasos, batch 8 y 25 episodios. Es esperable un sobreajuste al entorno de captura y poca generalización a posiciones, iluminación u objetos distintos.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que no se puede afirmar que la política funcione de forma fiable ni siquiera en su tarea objetivo.
- Sesgos: no documentados; en robótica por imitación los sesgos provienen de la distribución de demostraciones (posiciones, colores, condiciones de luz del dataset), no de sesgos sociales.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras fuera de distribución, relevante en un robot físico.
- Limitación de idioma: la instrucción de tarea es texto, pero no se documentan capacidades multilingües; el entrenamiento usó la cadena "pick and place".
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales no detalladas en esta ficha.
- Requisitos de coincidencia de hardware: las cámaras y claves de observación deben coincidir exactamente con las del entrenamiento (`camera1`, `camera2`, `camera3`, estado de 6 dimensiones); un robot o montaje distinto invalida la política.
- Para producción: no usar sin validación en entorno controlado y sin supervisión; no hay garantías de seguridad física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dobei/smolvla_cube_v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/dobei/so101_red_cube_blue_box_2_20261117_161737
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=dobei/so101_red_cube_blue_box_2_20261117_161737
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
