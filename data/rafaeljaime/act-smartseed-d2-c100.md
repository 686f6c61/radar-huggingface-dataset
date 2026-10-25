# RafaelJaime/act-smartseed-d2-c100

## Resumen

`RafaelJaime/act-smartseed-d2-c100` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers, arXiv:2304.13705) y publicada con la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un brazo SO-101 (`so_follower`), dos imágenes RGB de 480×640 (cámara cenital y cámara de muñeca) y emite vectores de acción de 6 dimensiones. El modelo tiene 51.668.614 parámetros y se distribuye en safetensors bajo licencia Apache-2.0.

La política está especializada en una única tarea, descrita literalmente en el dataset como "grasp the seed below the gripper": agarrar una semilla situada bajo la pinza. Se entrenó por comportamiento clonado (behavior cloning) sobre el dataset `RafaelJaime/smartseed-grasp-d2-clean`, con 91 episodios teleoperados y 25.742 fotogramas a 30 FPS. Es un artefacto típico de hackathon (etiquetas `robotekin-hackathon`, `BraboRobots`, `smartseed`), con 0 descargas y 0 likes en el momento de redactar esta ficha.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline completo de LeRobot (grabación, entrenamiento, rollout) para manipulación de precisión con hardware de bajo coste, y como punto de partida para fine-tuning en tareas de picking en agricultura de precisión. No se han publicado resultados de evaluación en la model card, por lo que no existe evidencia pública de tasa de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): política de imitación basada en transformer que predice chunks de acciones |
| Parametros totales | 51.668.614 (dato real de los safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. Entrada fija por paso: `observation.state` (6,) + 2 imágenes (3, 480, 640) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, int8 ni fp16) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria / runtime | lerobot 0.6.2 (PyTorch) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras de entrada | `top` y `wrist`, 480×640, 30 FPS |
| Salida | `action` con forma (6,) |
| Tamano del repositorio | 2,5 GB |
| Fecha de publicacion | 25 de octubre de 2026 (creado y actualizado el mismo dia) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de regresar una acción por paso, predice un chunk de acciones futuras y lo ejecuta en bucle abierto durante un horizonte corto; esto reduce el error de compounding y suaviza la trayectoria. Según el paper referenciado (arXiv:2304.13705), la arquitectura es un transformer encoder-decoder con una variable latente de estilo CVAE y un backbone visual convolucional por cámara. Los 51,7 M de parámetros son compatibles con esa configuración (dos codificadores visuales más el transformer), aunque la model card de este checkpoint no desglosa el reparto exacto de parámetros ni las capas concretas.

El entrenamiento se hizo con `lerobot-train` sobre 91 episodios y 25.742 fotogramas a 30 FPS de una sola tarea, con 40.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta aumento de datos, composición demográfica del dataset, número de operadores ni si hubo varias posiciones de objeto. Tampoco hay RLHF ni DPO, algo que no aplica a una política de control. La model card no reporta evaluación en robot real ni curva de validación, de modo que no es posible determinar el grado de sobreajuste a la distribución de entrenamiento.

## Capacidades

- Manipulación robótica de precisión: agarre de una semilla situada bajo la pinza del SO-101, con salida de 6 dimensiones de acción por paso.
- Percepción visomotora con dos cámaras simultáneas (vista cenital y vista de muñeca) a 480×640.
- Predicción por chunks de acciones, que aporta trayectorias más suaves que un controlador paso a paso.
- Condicionamiento implícito en la posición articular actual (`observation.state`, 6 valores).
- Ejecución mono-tarea: no acepta instrucciones de lenguaje; la cadena `--task` del comando de rollout se usa para etiquetar el episodio, no como entrada condicionante según las features declaradas.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de código, matemáticas ni capacidades multimodales de tipo VLM.

## Casos de uso

- Siembra y manipulación de semillas en agricultura de precisión: el modelo ejecuta el agarre de una semilla bajo la pinza con dos cámaras; encaja en una célula de siembra automatizada con brazo SO-101 de bajo coste, siempre que la escena se parezca a la del dataset de entrenamiento.
- Baseline reproducible en investigación sobre imitación: sirve como referencia ACT ya entrenada para comparar contra Diffusion Policy, VQ-BeT u otros métodos en el mismo banco de pruebas, con configuración de entrenamiento documentada (40k pasos, AdamW, lr 1e-5).
- Punto de partida para fine-tuning en picking: al ser Apache-2.0 y safetensors, se puede recargar con `lerobot-train --policy.type=act` y reentrenar con un dataset propio de otra pieza, manteniendo el backbone visual preentrenado.
- Validación de un pipeline completo de LeRobot en un hackathon o curso: cubre el ciclo grabación con `lerobot-record`, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`, útil como plantilla docente.
- Pruebas de robustez ante cambios de iluminación y posición: al no haber evaluación publicada, el modelo es un buen sujeto para medir empíricamente la degradación al variar altura de cámara, fondo o posición inicial de la semilla.
- Integración en una línea de clasificación con cámara cenital fija: la vista `top` aporta contexto global y la vista `wrist` precisión local, un esquema reutilizable en tareas de recogida pieza a pieza en laboratorio.
- Banco de pruebas de latencia en hardware de borde: con 51,7 M de parámetros se puede medir el coste real de inferencia a 30 FPS en Jetson o en GPU de consumo, un dato que la model card no aporta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye la sección de evaluación con el texto literal "_No evaluation results have been provided for this policy yet_", sin tabla de ensayos, éxitos ni tasa de acierto. Tampoco se reportan métricas de validación (loss, MSE de acciones) ni comparaciones con otras políticas del mismo dataset. La búsqueda web realizada no devolvió resultados técnicos relacionados con este modelo.

## Requisitos de hardware

- Pesos: 51,7 M de parámetros equivalen a aproximadamente 207 MB en fp32 y 103 MB en fp16; el repositorio ocupa 2,5 GB, muy por encima de esos valores, lo que sugiere la presencia de varios checkpoints o artefactos adicionales.
- VRAM estimada: los pesos son triviales; el consumo real lo dominan las activaciones de dos imágenes de 480×640 y el backbone visual. En la práctica, una GPU con 4-6 GB es suficiente para inferencia en fp32, aunque no se dispone de mediciones publicadas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4090 para margen holgado; A100/H100 no son necesarias para este tamaño. En entornos embebidos, Jetson Orin Nano (8 GB) u Orin NX son opciones razonables para ejecutar la política junto a los drivers de cámara.
- Cabe en GPU de consumo: sí, con cualquier GPU moderna con 4 GB o más; en CPU es técnicamente posible pero el lazo de control a 30 FPS puede no sostenerse.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=RafaelJaime/act-smartseed-d2-c100` y `--strategy.type=base` (no graba episodios); también se puede cargar directamente desde PyTorch/lerobot en un script propio. vLLM, TGI, llama.cpp y Ollama no aplican: no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El único requisito documentado es que el dataset se grabó a 30 FPS, lo que marca el objetivo de frecuencia de control, no una medición del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RafaelJaime/act-smartseed-d2-c100` | ACT, imitación mono-tarea | 51,7 M | Estado (6,) + 2 imágenes 480×640 | Apache-2.0 | HuggingFace Hub, 0 descargas |
| Diffusion Policy (implementación LeRobot) | Imitación generativa por difusión | no disponible | Estado + imágenes | Apache-2.0 (código LeRobot) | Repositorio LeRobot, requiere entrenamiento propio |
| SmolVLA (HuggingFace) | VLA con condicionamiento en lenguaje | aprox. 450 M (según documentación pública) | Estado + imágenes + instrucción textual | Apache-2.0 | HuggingFace Hub |
| π0 / openpi (Physical Intelligence) | VLA de flujo, multi-tarea | aprox. 3,3 B (según documentación pública) | Estado + imágenes + instrucción textual | licencia específica del proyecto | Público con acceso a pesos |

La diferencia clave frente a SmolVLA y π0 es el alcance: este checkpoint no entiende lenguaje ni generaliza entre tareas, pero es dos órdenes de magnitud más pequeño y puede ejecutarse en hardware de borde. Frente a Diffusion Policy, ACT suele ser más rápido en inferencia al predecir el chunk en una sola pasada, a costa de menor capacidad para modelar distribuciones multimodales de acciones. Los valores de parámetros de SmolVLA y π0 proceden de documentación pública de sus proyectos y no se han verificado en esta ficha.

## Limitaciones y advertencias

- Especialización extrema: entrena una sola tarea ("grasp the seed below the gripper"); no generaliza a otros objetos, alturas ni posiciones sin reentrenar.
- Ausencia total de evaluación publicada: no hay tasa de éxito, ni número de ensayos, ni condiciones de prueba, por lo que no se puede afirmar que el modelo funcione de forma fiable en producción.
- Dataset pequeño y de un solo origen: 91 episodios y 25.742 fotogramas implican riesgo alto de sobreajuste a la iluminación, el fondo, la posición inicial y el operador concretos de la grabación.
- Sin capacidades lingüísticas ni de razonamiento: no admite instrucciones en lenguaje natural, tool calling ni planificación multi-paso.
- Dependencia estricta de la interfaz: los nombres de cámara (`top`, `wrist`), la resolución 480×640, los 30 FPS y la calibración del `so_follower` deben coincidir con los del entrenamiento; un desajuste invalida la política.
- Sesgos: no hay análisis de sesgo demográfico ni de sesgo de entorno; el comportamiento queda determinado por la distribución del dataset, que no se documenta.
- Alucinación: el concepto no aplica en sentido estricto, pero sí el fallo silencioso por generalización errónea, es decir, ejecutar una trayectoria de agarre plausible sobre una escena distinta sin detectar que el objeto no está.
- Licencia Apache-2.0: permite uso comercial y modificación sin restricciones relevantes, pero se ofrece sin garantías; conviene conservar la atribución del paper y de LeRobot.
- Fecha de creación en metadatos (25 de octubre de 2026) y 0 descargas: no hay evidencia de uso comunitario ni de replicación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RafaelJaime/act-smartseed-d2-c100
- Dataset de entrenamiento: https://huggingface.co/datasets/RafaelJaime/smartseed-grasp-d2-clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RafaelJaime/smartseed-grasp-d2-clean
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Nota: la busqueda web realizada no devolvio resultados tecnicos relacionados con este modelo; los unicos resultados obtenidos eran guias de viaje sin relacion y se han descartado.
