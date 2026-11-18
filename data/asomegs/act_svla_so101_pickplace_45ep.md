# asomegs/act_svla_so101_pickplace_45ep

## Resumen

`asomegs/act_svla_so101_pickplace_45ep` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub mediante la librería LeRobot. El modelo aprende a manipular un brazo robótico SO-100/SO-101 a partir de datos de teleoperación y predice bloques de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación de precisión media.

El modelo resuelve una tarea concreta: introducir un ladrillo de Lego rosa en una caja transparente. Se entrenó sobre el dataset público `lerobot/svla_so101_pickplace` (50 episodios, 11.939 fotogramas a 30 FPS) y cuenta con 51.668.614 parámetros en formato safetensors. No es un modelo de lenguaje: es una política visuomotora que consume el estado articular (6 dimensiones) y dos cámaras (vista superior y lateral, 480x640) y produce comandos de acción de 6 dimensiones.

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de entrenamiento de políticas ACT con LeRobot 0.7.1; por otro, demuestra el flujo completo de extremo a extremo (grabación de datos, entrenamiento, despliegue en robot real) en hardware de bajo coste. La model card no incluye resultados de evaluación en robot real ni licencia declarada, lo que limita su uso directo en producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; ventana de observación por chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), `observation.images.up` (3, 480, 640), `observation.images.side` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so100_follower` (SO-100/SO-101) |
| Camaras | `up`, `side` |
| Dataset de entrenamiento | `lerobot/svla_so101_pickplace` (50 episodios, 11.939 frames, 30 FPS) |
| Tarea | "pink lego brick into the transparent box" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |
| Tamano del repo | 0.2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone transformer con un codificador visual y un decodificador de acciones que predice chunks de acciones de longitud fija en lugar de un único paso. Esta estrategia de "action chunking" mitiga el problema de la varianza temporal en datos teleoperados y reduce el error compuesto durante la ejecución. El modelo incorpora además una técnica de temporal ensembling para suavizar las predicciones entre chunks consecutivos.

El entrenamiento se realizó con LeRobot 0.7.1 sobre 50 episodios (11.939 frames a 30 FPS) del dataset `lerobot/svla_so101_pickplace`, correspondientes a una única tarea de pick-and-place. Se ejecutaron 20.000 pasos con batch size 8, AdamW, learning rate 1e-05 y semilla 1000. No se especifica en la model card si hubo aumento de datos, regularización adicional, ni si se aplicó algún tipo de RLHF o ajuste fino posterior (en el contexto de políticas robóticas, este tipo de ajuste no es habitual). Tampoco se documenta la composición exacta de las posiciones iniciales de los objetos ni las condiciones de iluminación durante la grabación.

## Capacidades

- Manipulación robótica de pick-and-place: coger un objeto (ladrillo de Lego rosa) y depositarlo en un contenedor (caja transparente).
- Control visuomotor de 6 grados de libertad a partir de dos cámaras RGB (vista superior y lateral) y del estado articular.
- Predicción de chunks de acciones, lo que proporciona movimientos más suaves y coherentes que políticas paso a paso.
- Ejecución en tiempo real a 30 FPS en un robot SO-100/SO-101 con LeRobot.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política puramente reactiva.
- No es multilingüe ni procesa texto; la tarea se especifica mediante una cadena fija en tiempo de ejecución.
- No dispone de modo "thinking", visión general, audio ni capacidades generativas de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede integrarse en una célula de montaje con un SO-100/SO-101 para trasladar piezas pequeñas entre posiciones fijas, aprovechando que el dataset de entrenamiento cubre exactamente esa tarea.
- Base para fine-tuning en tareas similares: al ser una política ACT entrenada con LeRobot, sirve como punto de partida para reentrenar con nuevos objetos o posiciones usando el comando `lerobot-train` documentado en la model card.
- Docencia y formación en robótica de imitación: permite reproducir el flujo completo (grabación con LeRobot, entrenamiento ACT, despliegue con `lerobot-rollout`) en hardware de bajo coste, lo que lo hace idóneo para cursos y talleres.
- Benchmark interno de pipelines de imitación: comparar la política contra otras variantes (p. ej. Diffusion Policy) sobre el mismo dataset y robot para evaluar la influencia de la arquitectura en la tasa de éxito.
- Pruebas de integración de LeRobot en CI: validar que el pipeline de carga de safetensors, definición de features y ejecución de `lerobot-rollout` funciona con un checkpoint conocido y pequeño (0.2 GB).
- Demostraciones reproducibles en investigación: al estar el dataset y la política publicados en el Hub, cualquier grupo puede replicar el experimento y medir la variabilidad entre ejecuciones.
- Prototipado de sistemas de manipulación en entornos controlados: útil para validar la cinemática y la calibración de un SO-101 antes de invertir en políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros, más el coste de los dos flujos de cámara a 480x640. En la práctica, la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100, H100. Cualquier GPU con soporte CUDA es suficiente; el cuello de botella suele ser la captura de cámara y la latencia del bus del robot, no el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para pruebas de integración, aunque con mayor latencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot), scripts Python con `lerobot` como librería. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El dataset se grabó a 30 FPS y el despliegue se documenta con `--duration=60`, pero no se reportan tiempos de inferencia por chunk ni latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `asomegs/act_svla_so101_pickplace_45ep` | 51,7 M | chunk de acciones (no aplica contexto de texto) | Pick-and-place SO-101 | no disponible | Hugging Face Hub |
| ACT original (paper arXiv:2304.13705) | no disponible | chunk de acciones | Manipulación genérica | no disponible | Paper + código de referencia |
| Diffusion Policy (paper arXiv:2303.04137) | no disponible | horizonte de acciones | Manipulación genérica | no disponible | Paper + código |
| Otras políticas LeRobot en el Hub (p. ej. `lerobot/act_*`) | variable | chunk de acciones | Tareas diversas | variable | Hugging Face Hub |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con estas alternativas. La comparación se limita a categoría, tarea y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: la política se entrenó con 50 episodios de una única tarea y un único objeto; es probable que falle ante cambios de posición, iluminación, color del objeto o presencia de distractores.
- Riesgo de alucinación: en el contexto de políticas robóticas, se traduce en acciones erróneas o inseguras (colisiones, agarres fallidos) cuando la observación se sale de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no aplica; el modelo no procesa lenguaje natural ni mantiene contexto conversacional.
- Restricciones de licencia: la licencia no está declarada en la model card ("[More Information Needed]"), por lo que no se puede asumir uso comercial sin contactar con el autor.
- Ausencia de evaluación: no hay resultados de éxito en robot real, lo que impide estimar su fiabilidad antes de desplegarlo.
- Dependencia de hardware específico: requiere un robot SO-100/SO-101, dos cámaras con los nombres `up` y `side`, y la versión de LeRobot 0.7.1 o compatible.
- Reproducibilidad: la semilla y la configuración están documentadas, pero no se especifican las condiciones exactas de grabación (posiciones iniciales, iluminación, calibración), lo que dificulta replicar el entorno de entrenamiento.
- Uso en producción: no recomendado sin una validación exhaustiva en el robot objetivo y sin una licencia clara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asomegs/act_svla_so101_pickplace_45ep
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so101_pickplace
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/svla_so101_pickplace
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
