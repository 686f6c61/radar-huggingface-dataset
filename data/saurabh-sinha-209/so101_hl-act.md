# Saurabh-sinha-209/so101_hl-act

## Resumen

`Saurabh-sinha-209/so101_hl-act` es una política de imitación (imitation learning) entrenada con la técnica Action Chunking with Transformers (ACT) y publicada con el formato de LeRobot. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un brazo robótico SO-101 y dos imágenes de cámara, y devuelve una acción de 6 dimensiones. Lo desarrolla un usuario particular (Saurabh-sinha-209), no un laboratorio, y se distribuye con licencia Apache 2.0.

El modelo resuelve una tarea acotada de manipulación tipo pick-and-place: coger objetos pequeños (piezas de plástico, rotuladores, tubos, latas, bolas, botellas) y depositarlos en un contenedor (bandeja o cubo blanco). ACT predice fragmentos cortos de acciones (action chunks) en lugar de un paso individual, lo que reduce el error de acumulación y suele mejorar la tasa de éxito frente a políticas paso a paso en tareas de manipulación de precisión media.

Su relevancia es práctica: con 51.617.414 parámetros, cabe en cualquier GPU de consumo e incluso puede ejecutarse en hardware embebido, y sirve como ejemplo reproducible de un pipeline completo LeRobot (grabación de datos, entrenamiento, rollout). La contrapartida es la escala de los datos: 27 episodios y 27.332 fotogramas a 30 FPS (unos 15 minutos de demostración) repartidos entre 22 descripciones de tarea distintas, lo que da una media de aproximadamente 1,2 demostraciones por tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder de observaciones y cabeza de acciones, con componente CVAE para modelar la variabilidad de las demostraciones |
| Parametros totales | 51.617.414 (dato real de los pesos en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. La observación es por fotograma y la política emite un chunk de acciones cuyo horizonte no se especifica en la información |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (fp32) y no se documentan variantes GGUF, int8 ni int4 |
| Idiomas soportados | no aplica; no procesa lenguaje natural. La tarea se identifica mediante una cadena de texto en inglés (`task`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so101_follower` |
| Entradas | `observation.state` (6,), `observation.images.bench` (3, 240, 320), `observation.images.wrist` (3, 240, 320) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 3,7 GB |
| Pipeline / etiqueta | robotics |
| Fecha de creacion | 2026-10-19 (ultima actualizacion 2026-10-19) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un transformer con un autoencoder variacional condicional (CVAE) que modela la distribución de las trayectorias humanas durante el entrenamiento; en inferencia se usa la componente prior y se predicen bloques de acciones (chunks) que se ejecutan de forma abierta durante varios pasos. En LeRobot, ACT se implementa además con ensamblado temporal (temporal ensembling) opcional para suavizar la transición entre chunks consecutivos.

El entrenamiento se realizó con LeRobot 0.6.0 durante 30.000 pasos, batch de 16, optimizador AdamW, learning rate de 1e-5 y semilla 1000. El dataset (`Saurabh-sinha-209/so101_hl`) contiene 27 episodios y 27.332 fotogramas a 30 FPS, grabados con dos cámaras (`bench` y `wrist`) y teleoperación del brazo SO-101. La información disponible no detalla la composición exacta del split, el número de tokens (concepto no aplicable), ni si hubo etapas de RLHF o DPO (tampoco aplicables a una política de imitación). No se documenta ninguna innovación técnica propia del autor más allá del uso estándar de ACT.

## Capacidades

- Manipulación visomotora de pick-and-place: coger un objeto y colocarlo en una bandeja o cubo, condicionado por la instrucción de tarea.
- Fusión de dos vistas de cámara (vista de mesa `bench` y vista de muñeca `wrist`) con el estado articular de 6 dimensiones.
- Control de 6 grados de libertad en el espacio de acciones del SO-101 follower.
- Ejecución autónoma de episodios de hasta 60 segundos mediante `lerobot-rollout` con `--duration=60`.
- Reutilización como punto de partida para fine-tuning con datos propios mediante `lerobot-train --policy.type=act`.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión general, audio): no disponibles; la visión se limita a las dos cámaras de las que se entrenó.

## Casos de uso

- Automatización de pick-and-place en laboratorio o línea de montaje ligera: el modelo coge objetos pequeños (tubos, latas, bolas, botellas) y los deposita en bandejas, con la ventaja de que corre en una GPU de consumo junto al puesto de trabajo.
- Prototipado rápido sobre hardware SO-101: sirve como política de referencia para validar cableado, calibración y montaje de cámaras antes de invertir en un dataset propio, ya que el rollout se lanza con un único comando.
- Punto de partida para transfer learning: el checkpoint se puede reentrenar con `lerobot-train` sobre un dataset específico de la aplicación, lo que reduce el coste frente a entrenar ACT desde cero.
- Docencia y formación en aprendizaje por imitación: es un ejemplo completo y pequeño (51,6 M de parámetros) para explicar action chunking, CVAE y ensamblado temporal en un curso de robótica.
- Investigación en políticas de manipulación: permite comparar variantes de horizonte de chunk, tamaños de batch o estrategias de ensamblado con un coste computacional bajo.
- Clasificación y ordenación de objetos en entornos controlados: con la escena, la iluminación y los contenedores fijos del dataset, puede integrarse en una celda de trabajo donde la variabilidad del entorno sea mínima.
- Recogida de datos asistida: el mismo stack LeRobot que entrena y ejecuta esta política sirve para grabar nuevas demostraciones y ampliar el dataset con las tareas que el modelo aún no cubre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un apartado de evaluación con una plantilla vacía ("No evaluation results") y no reporta tasas de éxito en robot real, número de ensayos por tarea ni métricas de error de posición. La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Los pesos suman 51,6 M de parámetros (aproximadamente 206 MB en fp32); junto con las activaciones de dos imágenes de 3×240×320, una estimación prudente es de 0,5-2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4060, RTX 4090), A100/H100 si se comparte con otros servicios, o módulos embebidos tipo Jetson para montar la política sobre el propio robot.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más; también es viable la inferencia en CPU para pruebas, con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento) sobre PyTorch. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, que no aplican a una política de robótica.
- Latencia y throughput: no disponibles. La política está pensada para operar a 30 FPS (el frame rate del dataset), pero no se publican mediciones de latencia por chunk ni de frecuencia de control alcanzada en robot real.
- Almacenamiento: el repositorio ocupa 3,7 GB, presumiblemente por incluir varios checkpoints además de los pesos finales.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_hl-act (este modelo) | 51,6 M | estado 6D + 2 imágenes 240×320 | chunk de acciones, horizonte no disponible | apache-2.0 | HuggingFace, vía LeRobot |
| Diffusion Policy (LeRobot) | no disponible (depende de configuración) | estado + imágenes | predice secuencias de acciones por difusión | apache-2.0 (implementación LeRobot) | HuggingFace / LeRobot |
| VQ-BeT (LeRobot) | no disponible | estado + imágenes | acciones discretizadas + transformer | apache-2.0 (implementación LeRobot) | HuggingFace / LeRobot |
| SmolVLA (HuggingFace) | del orden de cientos de millones (valor exacto no disponible en esta ficha) | estado + imágenes + instrucción en lenguaje | política visión-lenguaje-acción | apache-2.0 | HuggingFace / LeRobot |

La comparación relevante es ecosistémica: ACT es la política más ligera y rápida de entrenar del stack LeRobot, Diffusion Policy suele dar trayectorias más suaves a cambio de mayor coste de inferencia, y SmolVLA añade condicionamiento por lenguaje a costa de un tamaño muy superior. No se dispone de datos de rendimiento comparado para este checkpoint concreto.

## Limitaciones y advertencias

- Dataset muy reducido: 27 episodios para 22 descripciones de tarea, lo que implica aproximadamente 1,2 demostraciones por tarea y un riesgo alto de sobreajuste a las colocaciones exactas de objeto y bandeja vistas en el entrenamiento.
- Generalización limitada: el modelo ha visto una escena concreta, dos cámaras fijas (`bench` y `wrist`) y un conjunto cerrado de objetos; no hay evidencia de que funcione con objetos nuevos, otras alturas de cámara u otra iluminación.
- Sin métricas de evaluación: no se publica tasa de éxito ni protocolo de evaluación, por lo que no se puede afirmar ningún nivel de rendimiento en producción.
- Sin comprensión de lenguaje: la cadena `task` identifica la tarea, pero ACT no incorpora un encoder de lenguaje; no se pueden dar instrucciones nuevas en lenguaje natural.
- Dependencia del hardware exacto: el espacio de acciones y de estado es de 6 dimensiones y está calibrado para `so101_follower`; usar otro robot requiere recalibrar y probablemente reentrenar.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de ejecutar trayectorias erráticas o colisiones cuando la observación se sale de la distribución de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación; no se documentan cláusulas adicionales, pero conviene conservar el aviso de licencia y citar el paper de ACT.
- Seguridad física: es una política que mueve un brazo real; requiere límites de par, parada de emergencia y supervisión humana durante las pruebas.
- Idiomas: no aplica; la única cadena textual está en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Saurabh-sinha-209/so101_hl-act
- Dataset de entrenamiento: https://huggingface.co/datasets/Saurabh-sinha-209/so101_hl
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia / rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Saurabh-sinha-209/so101_hl
- Búsqueda web: no se han encontrado enlaces técnicos relevantes sobre este modelo; los resultados devueltos corresponden a personas homónimas y no guardan relación.
