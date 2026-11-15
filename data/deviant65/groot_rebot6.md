# Deviant65/groot_rebot6

## Resumen

`Deviant65/groot_rebot6` es una política de robótica entrenada con LeRobot sobre la arquitectura GR00T (concretamente GR00T N1.7, según la model card), el modelo fundacional de NVIDIA para razonamiento y habilidades generalizadas en robots humanoides. El modelo combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching que predice comandos motores condicionados por visión, lenguaje y propiocepción. Con 3.144.016.000 parámetros y un repositorio de 9,3 GB en formato safetensors, se distribuye como un checkpoint de imitación listo para ejecutar sobre un robot concreto.

El problema que resuelve es acotado y práctico: ejecutar de forma autónoma una tarea de manipulación específica ("Pick up the blue box, then return the arm to the home position") sobre el robot `rebot_b601_follower` equipado con dos cámaras Intel RealSense (d415 y d405). No es un modelo de propósito general listo para producción, sino un artefacto entrenado por un autor individual con 55 episodios y 54.291 frames a 30 FPS, orientado a demostrar el flujo completo de grabación de datos, entrenamiento y despliegue con LeRobot 0.7.1.

Su relevancia ahora es doble: por un lado, muestra cómo el ecosistema LeRobot permite a un desarrollador individual ajustar un modelo fundacional de robótica de NVIDIA con un dataset propio pequeño; por otro, sirve como referencia técnica de las interfaces de observación/acción (estado de 7 dimensiones, dos flujos visuales de 3x480x640, acción de 7 dimensiones) que exige una política GR00T en producción. No hay resultados de evaluación publicados ni licencia declarada, lo que limita su uso más allá de la experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone VLM Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repo de 9,3 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

La política sigue la arquitectura GR00T N1.7 descrita en la model card: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las observaciones visuales y la instrucción en lenguaje natural, acoplado a un transformer de acciones entrenado con flow matching que genera las acciones condicionadas por visión, lenguaje y propiocepción. La entrada se compone de `observation.state` con forma `(7,)`, dos flujos de imagen `observation.images.d415` y `observation.images.d405` con forma `(3, 480, 640)`, y la salida es un vector `action` de `(7,)`. El robot objetivo es `rebot_b601_follower` con cámaras Intel RealSense d415 y d405.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `Deviant65/rebot_6_20261112_150133`, compuesto por 55 episodios y 54.291 frames a 30 FPS de una única tarea. La configuración reportada es de 30.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-4 y semilla 42. No se documenta el número de tokens de entrenamiento del backbone, la composición del dataset más allá de la tarea, ni si hubo etapas de RLHF o DPO; al tratarse de un ajuste de imitación supervisada sobre un modelo fundacional preentrenado, no se espera un pipeline de alineamiento por preferencias en esta fase.

## Capacidades

- Generación de acciones de manipulación robótica de 7 dimensiones condicionadas por dos vistas de cámara y el estado propioceptivo del robot.
- Ejecución de una tarea de pick-and-place concreta: recoger una caja azul y devolver el brazo a la posición home.
- Comprensión de instrucciones en lenguaje natural como condicionamiento de la política (la tarea se pasa como texto en `--task`).
- Integración con el stack LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- Soporte de grabación y reproducción de episodios con el robot `rebot_b601_follower` y cámaras RealSense d415/d405.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas, código, visión general, audio ni modo thinking; el modelo está especializado en control motor.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: ejecutar de forma repetible la recogida de una caja azul y el retorno a home sobre el robot `rebot_b601_follower`, usando `lerobot-rollout` con `--duration` para acotar la sesión y validar la política antes de integrarla en una celda.
- **Base para fine-tuning con datos propios**: partir de este checkpoint y reentrenar con `lerobot-train --policy.type=groot` sobre un dataset nuevo para adaptar la política a otras piezas, posiciones o tareas de manipulación, aprovechando que el flujo de entrenamiento está documentado paso a paso.
- **Banco de pruebas de imitación con GR00T**: usar el modelo como referencia para estudiar cómo se comporta un backbone VLM grande (3,1B parámetros) acoplado a un transformer de acciones en una tarea real con dos cámaras, comparando curvas de pérdida y comportamiento en robot frente a políticas más ligeras tipo ACT o Diffusion Policy.
- **Validación de pipelines de datos en LeRobot**: emplear el dataset asociado (55 episodios, 54.291 frames, 30 FPS) y el checkpoint para verificar el flujo completo de grabación, visualización con el Space de LeRobot, entrenamiento y despliegue en una instalación nueva.
- **Docencia y demostraciones de robótica de imitación**: mostrar en un curso o taller el ciclo completo desde la teleoperación hasta la política autónoma, con una tarea sencilla y medible (caja azul + retorno a home) que permite evaluar éxito/fracaso de forma binaria.
- **Investigación en adaptación de dominio**: evaluar la robustez de una política GR00T ante cambios de iluminación, posición de la caja o distractores, dado que la model card invita explícitamente a reportar resultados bajo esas variaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._" y no se reportan tasas de éxito, latencia ni throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 3,14B parámetros en FP16 requiere aproximadamente 6,3 GB solo para pesos, más el estado del optimizador y activaciones en entrenamiento; sin embargo, no se confirma el dtype de los pesos ni el pico real de memoria de la política completa.
- **GPU recomendadas**: no disponibles. El comando de entrenamiento documentado usa `--policy.device=cuda`, lo que implica una GPU NVIDIA, pero no se especifica modelo ni VRAM mínima.
- **Compatibilidad con GPU de consumo**: no confirmada. No se indica si cabe en RTX 4090, RTX 3090 u otras GPU de consumo.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- **Latencia y throughput**: no disponibles. La política opera a 30 FPS según el dataset, pero no se reporta el tiempo de inferencia por paso de control.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Deviant65/groot_rebot6` | 3.144.016.000 | no disponible | Pick-and-place sobre `rebot_b601_follower` | no disponible | Hugging Face (LeRobot) |
| GR00T N1.7 (NVIDIA) | no disponible en esta ficha | no disponible | Modelo fundacional humanoide cross-embodiment | no disponible en esta ficha | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot tipo ACT / Diffusion Policy | típicamente decenas de millones | no aplica | Imitación sobre robot concreto | según implementación | Hugging Face (LeRobot) |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de éxito ni de rendimiento para esta política, y la model card no incluye comparaciones con otros checkpoints.

## Limitaciones y advertencias

- **Sin licencia declarada**: la model card indica "[More Information Needed]" en el campo de licencia, por lo que no se puede asumir permiso para uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- **Sin evaluación publicada**: no hay tasas de éxito ni pruebas en robot real documentadas; el rendimiento real de la política es desconocido.
- **Dataset muy pequeño y de una sola tarea**: 55 episodios y una única instrucción ("Pick up the blue box, then return the arm to the home position"), lo que limita la generalización a variaciones de posición, iluminación u objetos.
- **Acoplamiento al hardware**: la política espera exactamente el robot `rebot_b601_follower` y las cámaras `d415` y `d405` con los nombres de observación `observation.images.d415` y `observation.images.d405`; cambiar de robot o de cámaras invalida el checkpoint.
- **Riesgo de sobreajuste y comportamiento errático**: con 30.000 pasos sobre 55 episodios, es plausible un sobreajuste al entorno de grabación; no se documentan medidas de regularización ni aumentación de datos.
- **Sesgos y alucinaciones**: no aplican en el sentido de un LLM conversacional, pero sí existe riesgo de acciones incorrectas o inseguras en el robot; se recomienda supervisión humana y límites de par/velocidad durante las pruebas.
- **Idiomas y contexto**: no se especifican idiomas soportados ni longitud de contexto del backbone VLM, por lo que no se puede garantizar el comportamiento con instrucciones en castellano u otros idiomas distintos del usado en el entrenamiento.
- **Caveat de producción**: al ser un artefacto de un autor individual con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso comunitario ni de robustez en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deviant65/groot_rebot6
- Dataset de entrenamiento: https://huggingface.co/datasets/Deviant65/rebot_6_20261112_150133
- Visualizador del dataset (LeRobot Space): https://huggingface.co/spaces/lerobot/visualize_dataset?path=Deviant65/rebot_6_20261112_150133
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
