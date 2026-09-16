# ases200q2/UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_v1v2_act_20260916_142229

## Resumen

Este repositorio contiene una política de robótica entrenada con el método ACT (Action Chunking with Transformers), publicado en el paper arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. El autor es el usuario `ases200q2` y el identificador del modelo indica que la política se ha entrenado para una tarea concreta de *pick and place* de un objeto sobre una mesa, con un robot UR10 controlado vía RTDE y teleoperado con un ratón espacial (SpaceMouse) en el espacio del efector final (*end-effector*). No es un modelo de lenguaje: es una política de imitación que mapea observaciones (imágenes y estado del robot) a secuencias cortas de acciones.

ACT resuelve el problema del aprendizaje por imitación a partir de demostraciones teleoperadas. En lugar de predecir una única acción por paso, el modelo predice *chunks* de acciones (varias decenas de pasos de control de golpe), lo que aporta robustez frente a la ambigüedad temporal de las demostraciones humanas y reduce el error acumulado. El checkpoint tiene 51.626.631 parámetros (unos 51,6 M) y un peso de repositorio de 0,2 GB.

Su relevancia es práctica y acotada: sirve como ejemplo reproducible de entrenamiento de políticas con LeRobot sobre hardware UR10, y como punto de partida para quien quiera replicar un *pipeline* de imitación con ACT. Con 0 descargas y 0 *likes*, se trata de un artefacto recién publicado y no validado por la comunidad, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con componente CVAE, segun arXiv:2304.13705 |
| Parametros totales | 51.626.631 (aproximadamente 51,6 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de LeRobot) |
| Libreria | lerobot |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | ases200q2/UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_v1v2 |
| Tamano del repositorio | 0,2 GB |
| Tarea | pick and place de un objeto sobre mesa, robot UR10 con control RTDE y teleoperacion SpaceMouse en espacio del efector final |
| Fecha de creacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación (behavior cloning) que combina un transformer encoder-decoder con un autoencoder variacional condicional (CVAE). El encoder procesa las observaciones (típicamente imágenes de una o varias cámaras junto con el estado propioceptivo del robot) y produce una representación latente condicionada por una variable de estilo; el decoder genera un *chunk* de acciones futuras en lugar de una sola acción. Este diseño trata de capturar la naturaleza multimodal de las demostraciones humanas, donde una misma observación puede corresponder a distintas trayectorias válidas, y mitiga el problema del *compounding error* típico de las políticas que predicen paso a paso.

Según la información disponible, el entrenamiento se ha realizado con LeRobot sobre un dataset propio de teleoperación con SpaceMouse. No se especifican en la model card el número de episodios, el número de tokens o muestras vistas, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO (no aplicables en este dominio). Tampoco se detallan las resoluciones de cámara, el número de *chunks* configurado ni el número de pasos de acción predichos por inferencia. Toda esa información figura como no disponible.

## Capacidades

- Generación de acciones robóticas: predice secuencias cortas de comandos de control (*action chunks*) para el efector final del robot, no texto ni razonamiento simbólico.
- Manipulación del tipo pick and place: la tarea declarada consiste en coger un objeto y colocarlo sobre una superficie de mesa.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin planificación explícita ni modelo del mundo.
- Entrada multimodal (según el diseño de ACT): combina observaciones visuales y estado del robot; la model card no detalla la configuración concreta de sensores de este checkpoint.
- Integración con LeRobot: admite entrenamiento desde cero (`lerobot-train`) y evaluación o inferencia con `lerobot-record` contra un robot real.
- Tool calling / function calling: no disponible (no aplica a una política de robótica).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no es un modelo lingüístico).
- Capacidades especiales (modo *thinking*, visión en lenguaje natural, audio): no disponibles. La visión, si está presente, se usa como entrada de control y no como comprensión semántica abierta.

## Casos de uso

- Replicación de un *pipeline* de imitación extremo a extremo: el checkpoint y su dataset asociado permiten reproducir el flujo completo de LeRobot (grabación con teleoperación, entrenamiento con `lerobot-train`, evaluación con `lerobot-record`) para verificar que la infraestructura funciona antes de invertir en datos propios.
- Automatización de una celda de pick and place en laboratorio: sobre un UR10 con control RTDE, la política puede ejecutar la tarea de recogida y colocación de un objeto sobre mesa para la que fue entrenada, sustituyendo la teleoperación manual en ciclos repetitivos.
- Docencia e investigación en robótica: sirve como ejemplo tangible de ACT y de cómo se estructura un repositorio LeRobot en el Hub, útil en asignaturas de aprendizaje por imitación o de control robótico.
- Punto de partida para *fine-tuning* en tareas similares: al ser un checkpoint apache-2.0 de 0,2 GB, se puede reentrenar con demostraciones propias de otra tarea de manipulación sobre el mismo robot o sobre un montaje parecido.
- Pruebas de integración UR10 + RTDE: permite validar la cadena de comunicación Robot Interface, el espacio de control del efector final y la frecuencia de envío de comandos en un entorno controlado antes de desplegar una política más madura.
- Evaluación comparativa de métodos de imitación: al ser una política ACT pequeña, se puede usar como referencia base frente a alternativas como Diffusion Policy o SmolVLA en pruebas de éxito por tarea y de latencia de inferencia.
- Generación de datos sintéticos de evaluación: ejecutando la política en simulación sobre una mesa equivalente se pueden recolectar trayectorias para comparar distribuciones de acciones frente a las demostraciones humanas originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones cuantitativas para este checkpoint concreto. El paper de ACT (arXiv:2304.13705) sí reporta tasas de éxito en sus propias tareas, pero esos resultados corresponden a la configuración experimental del artículo y no son trasladables directamente a este modelo entrenado por un tercero.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en precisión de 32 bits ocupan aproximadamente 0,2 GB (51,6 M parámetros x 4 bytes ≈ 206 MB). Sumando activaciones y la posible rama visual, una estimación razonable de inferencia es de 1 a 2 GB en fp16 o fp32; se trata de una estimación derivada del número de parámetros, no de una medición publicada.
- VRAM estimada para entrenamiento: no disponible en la información proporcionada. Por el tamaño del modelo, una GPU con 8-12 GB debería ser suficiente para configuraciones habituales de ACT, aunque este dato no está confirmado por el autor.
- GPU recomendadas para inferencia: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3050, RTX 3060, RTX 4060 o superior es suficiente; también una RTX 4090 o una A100 quedan ampliamente sobredimensionadas para la inferencia, pero pueden acelerar el entrenamiento.
- Cabe en GPU consumer: sí, con holgura, dado el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para evaluación o inferencia). vLLM, Ollama y TGI no aplican, ya que no es un modelo de lenguaje. No se documenta soporte de ONNX, TensorRT ni llama.cpp para este checkpoint.
- Latencia y throughput estimados: no disponibles. La model card no publica tiempos de inferencia ni frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ases200q2/..._act_20260916_142229 (este modelo) | 51,6 M | no aplica | no disponible | apache-2.0 | Hugging Face, via LeRobot |
| ACT original (Zhao et al., 2023) | no disponible | no aplica | tasas de exito reportadas en el paper para sus tareas | licencia del repositorio original, no disponible aqui | codigo publico en el repositorio del paper |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | implementaciones publicas en el ecosistema LeRobot |
| SmolVLA | no disponible | no disponible | no disponible | no disponible | Hugging Face, via LeRobot |

Solo los datos de la primera fila estan verificados en la informacion proporcionada. Los valores de las alternativas figuran como no disponibles porque no se han aportado en la busqueda ni en la model card; se recomienda consultar cada repositorio oficial antes de establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (pick and place de un objeto sobre mesa) y no generaliza a otras tareas, objetos o disposiciones sin reentrenamiento.
- Sin validación comunitaria: 0 descargas y 0 likes. No hay evidencia externa de que el checkpoint funcione correctamente ni de la calidad del entrenamiento.
- Sobreajuste al entorno de entrenamiento: al provenir de teleoperación con SpaceMouse en un montaje concreto, es probable que la política dependa de la iluminación, la posición de cámara, la mesa y el objeto exactos usados durante la recogida de datos. Este extremo no está cuantificado en la información disponible.
- Riesgo de fallo silencioso: en robótica, una política de imitación puede producir acciones plausibles pero incorrectas; se recomienda ejecutar siempre con paradas de seguridad, límites de fuerza y supervisión humana.
- Idiomas: no aplica ni se documenta soporte lingüístico alguno.
- Longitud de contexto: no disponible; en ACT el equivalente operativo es la ventana de observaciones y el horizonte del *chunk* de acciones, que la model card no especifica.
- Sesgos: no se documentan sesgos demográficos, pero sí un sesgo de dominio evidente hacia el entorno, el robot y la tarea de entrenamiento.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación con atribución y conservación del aviso de licencia. No obstante, el dataset asociado y posibles dependencias de terceros (LeRobot, pesos preentrenados de visión si los hubiera) deben verificarse por separado.
- Trazabilidad: se desconocen el número de episodios, la duración del entrenamiento, los hiperparámetros y el proceso de selección del checkpoint, lo que dificulta reproducir los resultados.
- Cautela con la fecha: el modelo está fechado en septiembre de 2026, posterior a la fecha habitual de consulta; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ases200q2/UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_v1v2_act_20260916_142229
- Dataset de entrenamiento: https://huggingface.co/datasets/ases200q2/UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_v1v2
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas con LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
