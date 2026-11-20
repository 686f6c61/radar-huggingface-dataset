# miya-k/so101_bimanual_Grasp_the_purple_block_GR00T17

## Resumen

SO101 bimanual GR00T17 es una política robótica de imitación entrenada sobre el modelo fundacional GR00T N1.7 de NVIDIA, empaquetada en formato LeRobot y publicada por el usuario miya-k. No es un modelo de lenguaje generalista, sino un checkpoint de control motor que consume observaciones multimodales (cuatro cámaras RGB y el estado propioceptivo de 12 dimensiones de un robot bimanual SO-101) y emite directamente un vector de acción de 12 dimensiones. El modelo resuelve una tarea concreta: agarrar un bloque morado con la mano izquierda, pasarlo a la derecha y depositarlo en una zona cuadrada.

La relevancia técnica reside en que ejemplifica el flujo actual de trabajo en robótica de imitación: partir de un backbone visión-lenguaje-acción (Cosmos-Reason2/Qwen3-VL combinado con un transformer de acciones por flow matching) y afinarlo con un dataset pequeño de demostraciones teleoperadas (100 episodios, 59.053 fotogramas a 30 FPS) mediante LeRobot 0.7.1. El resultado es un artefacto de 3.144.016.000 parámetros y 12,6 GB en safetensors, listo para ejecutarse con `lerobot-rollout` sobre hardware bi_so_follower.

Conviene subrayar que se trata de un modelo de nicho, con cero descargas y sin resultados de evaluación publicados, por lo que su utilidad práctica está acotada al robot y al montaje exactos con los que se recogieron los datos. La licencia no está declarada, lo que impide asumir derechos de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; la instrucción de tarea es en inglés) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (repositorio de 12,6 GB) |
| Libreria / framework | LeRobot 0.7.1 |
| Pipeline | robotics |
| Tipo de robot | bi_so_follower (SO-101 bimanual) |
| Entradas | observation.state (12,), 4 imágenes RGB (3, 480, 640): right_top, left_top, right_follower, left_follower |
| Salidas | action (12,) |
| Dataset de entrenamiento | miya-k/so101_bimanual_Grasp_the_purple_block (100 episodios, 59.053 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 64 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Semilla | 42 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GR00T N1.7: un backbone visión-lenguaje basado en Cosmos-Reason2/Qwen3-VL que procesa las imágenes de las cuatro cámaras junto con la instrucción de tarea en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera la secuencia de acciones condicionada por la representación multimodal y el estado propioceptivo del robot. Esta separación entre percepción/razonamiento y generación de acciones es la innovación central de la familia GR00T: permite reutilizar un modelo fundacional preentrenado y adaptarlo a un embodiment concreto con relativamente pocos datos.

El ajuste se realizó con LeRobot 0.7.1 durante 20.000 pasos, batch de 64, AdamW con learning rate 1e-4 y semilla 42, sobre el dataset miya-k/so101_bimanual_Grasp_the_purple_block. Ese dataset contiene 100 episodios teleoperados (59.053 fotogramas a 30 FPS) de una única tarea: agarrar el bloque morado con la mano izquierda, pasarlo a la derecha y colocarlo en el espacio cuadrado. No se documenta en la información disponible si hubo RLHF, DPO ni ninguna otra fase de alineamiento posterior; tampoco se detalla la composición del preentrenamiento original de GR00T N1.7.

## Capacidades

- Control motor bimanual de extremo a extremo: mapea directamente observaciones (estado de 12 dimensiones y cuatro vistas RGB de 480x640) a un vector de acción de 12 dimensiones.
- Ejecución de una tarea de manipulación específica: agarre con la mano izquierda, transferencia entre manos y colocación en una zona objetivo.
- Fusión multimodal de cuatro cámaras (dos vistas superiores y dos montadas en los seguidores), lo que aporta información tanto global de la escena como local de las pinzas.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como cadena de texto a `lerobot-rollout`, aunque el modelo está entrenado para una única instrucción.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No se documenta soporte de tool calling, razonamiento multi-paso deliberativo, capacidades multilingües, visión general, audio ni modo "thinking"; estas capacidades del backbone no se exponen como API en este checkpoint.

## Casos de uso

- Automatización de una celda de pick-and-place bimanual: el modelo ejecuta la secuencia completa de agarre, transferencia entre manos y depósito, adecuado porque fue entrenado exactamente sobre esa tarea con 100 demostraciones.
- Base para fine-tuning en tareas de traspaso entre manos: sirve como punto de partida para reentrenar con un dataset propio en LeRobot, ya que el pipeline `lerobot-train --policy.type=groot` está documentado en la propia model card.
- Evaluación de pipelines de imitación en robótica de bajo coste: el robot SO-101 es una plataforma asequible, y este checkpoint permite validar el flujo completo de grabación, entrenamiento y despliegue sin partir de cero.
- Investigación en manipulación bimanual con múltiples cámaras: las cuatro vistas (dos cenitales y dos en los seguidores) permiten estudiar cómo la fusión de puntos de vista afecta a la precisión del agarre.
- Docencia y demostraciones de robótica de imitación: el modelo y su dataset asociado, visualizable con el Space de LeRobot, constituyen un ejemplo reproducible de entrenamiento con GR00T.
- Pruebas de integración de GR00T N1.7 en producción: permite medir latencia de inferencia y estabilidad del control en hardware real antes de invertir en datasets mayores.
- Benchmark interno de políticas de imitación: al fijar arquitectura, hiperparámetros y dataset, sirve como referencia para comparar variantes de entrenamiento sobre la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la sección de evaluación vacía, con la indicación de que no se han proporcionado resultados para esta política, y no se aportan tasas de éxito, latencias ni métricas de precisión en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un checkpoint de 3.144.016.000 parámetros en safetensors de 12,6 GB requiere al menos ese tamaño en memoria en precisión original; con cuantización a 8 bits o 4 bits el requisito bajaría, pero no se documentan cuantizaciones soportadas.
- GPU recomendadas: no especificadas por el autor. Dado el tamaño del checkpoint y el backbone Cosmos-Reason2/Qwen3-VL, es razonable esperar GPUs de datacenter (A100, H100) o consumer de gama alta, pero este dato no está confirmado en la información disponible.
- Compatibilidad con GPU consumer: no confirmada. El tamaño de 12,6 GB sugiere que podría caber en GPUs con 16 GB o más en precisión reducida, pero no hay validación publicada.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (estrategia `base`), con el robot `bi_so_follower` y cámaras OpenCV configuradas a 640x480 y 30 FPS. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de acciones.
- Latencia y throughput: no disponibles. El control opera a 30 FPS según el dataset, pero no se publica latencia de inferencia real ni throughput del transformer de acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| miya-k/so101_bimanual_Grasp_the_purple_block_GR00T17 | 3.144.016.000 | no disponible | Manipulación bimanual SO-101 (tarea única) | no disponible | Hugging Face, 0 descargas |
| GR00T N1.7 (NVIDIA, base) | no disponible | no disponible | Modelo fundacional cross-embodiment | según NVIDIA Isaac-GR00T | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot tipo ACT / Diffusion Policy | no disponible | no disponible | Imitación sobre datasets LeRobot | según LeRobot | Hugging Face, ecosistema LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad. Cualquier comparación de tasas de éxito exigiría evaluaciones reales que no se han publicado.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica "More Information Needed", por lo que no puede asumirse permiso de uso comercial ni redistribución.
- Sin resultados de evaluación: no hay tasas de éxito ni validación en robot real publicadas, lo que impide estimar su fiabilidad en producción.
- Especialización extrema: entrenado para una única instrucción y un único montaje (bloque morado, zona cuadrada, robot bi_so_follower con cuatro cámaras concretas); no generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware exacto: los nombres de cámara (right_top, left_top, right_follower, left_follower) y el estado de 12 dimensiones deben coincidir con los del entrenamiento; cualquier cambio de montaje o calibración degradará el comportamiento.
- Dataset pequeño: 100 episodios y 59.053 fotogramas son insuficientes para cubrir variaciones de iluminación, posiciones de objetos o distracciones; se espera sobreajuste al entorno de recogida.
- Riesgo de alucinación en el sentido robótico: el modelo puede generar acciones plausibles pero incorrectas ante situaciones fuera de distribución, sin mecanismo de verificación interna.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea está en inglés y el modelo no está pensado para interacción conversacional.
- Sin información sobre sesgos, cuantizaciones soportadas ni requisitos de hardware validados, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miya-k/so101_bimanual_Grasp_the_purple_block_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/miya-k/so101_bimanual_Grasp_the_purple_block
- Visualizador del dataset (LeRobot Space): https://huggingface.co/spaces/lerobot/visualize_dataset?path=miya-k/so101_bimanual_Grasp_the_purple_block
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
