# RoboColosseum/so101-remove-screwdriver-pi0.5

## Resumen

SO101-remove-screwdriver-pi0.5 es una política de visión-lenguaje-acción (VLA) publicada por RoboColosseum, resultado del ajuste fino del modelo base lerobot/pi05_base (π₀.₅ de Physical Intelligence) sobre un conjunto de datos propio de 100 episodios teleoperados con un brazo SO-101. Resuelve una tarea concreta de manipulación: extraer un destornillador negro de una caja y depositarlo sobre la mesa. El modelo consume el estado articular del robot (6 dimensiones) y tres flujos de imagen (cámara frontal, cámara de muñeca y una tercera cámara de 224×224) y emite un vector de acción de 6 dimensiones a 30 FPS.

Con 4.143.404.816 parámetros y un repositorio de 49 GB, se distribuye en formato safetensors bajo licencia Apache 2.0 y se ejecuta con la librería LeRobot 0.6.1 o superior. Es relevante porque ejemplifica el flujo actual de fine-tuning de VLA abiertos sobre hardware de bajo coste (SO-101), y porque π₀.₅ está diseñado explícitamente para generalizar a entornos y situaciones no vistas durante el entrenamiento, lo que reduce la brecha entre demos de laboratorio y despliegue real.

La ficha se basa exclusivamente en la model card y los metadatos del repositorio; no hay resultados de evaluación publicados ni información sobre idiomas, cuantizaciones o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan como texto; no se documenta cobertura lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Otros datos del repositorio: pipeline `robotics`, modelo base `lerobot/pi05_base`, tipo de robot `so_follower`, tamaño del repo 49,0 GB, creado el 2026-11-04.

## Arquitectura y entrenamiento

El modelo es un ajuste fino de π₀.₅, un VLA de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones no vistas en entrenamiento. La implementación incluida en LeRobot deriva del repositorio OpenPI de los autores originales. La política mapea observaciones multimodales (estado articular de 6 dimensiones más tres cámaras: `front` y `wrist` a 480×640, y `empty_camera_0` a 224×224) a acciones de 6 dimensiones, siguiendo el paradigma de imitación end-to-end habitual en LeRobot.

El ajuste fino se realizó sobre el dataset `Jiamo0912/robocolosseum-so101-black-screwdriver-box-to-table-100episodes`: 100 episodios, 23.746 fotogramas a 30 FPS, con la tarea "Take the black screwdriver out of the box and place it on the table." La configuración de entrenamiento fue de 40.000 pasos, batch size 16, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, con LeRobot 0.6.1. No se documentan en la información disponible detalles sobre composición del corpus de preentrenamiento de π₀.₅, uso de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Control robótico visomotor end-to-end: genera comandos de acción de 6 grados de libertad a partir de imágenes y estado articular.
- Ejecución de una tarea de manipulación específica: sacar un destornillador negro de una caja y colocarlo sobre la mesa.
- Fusión de múltiples vistas de cámara (frontal, muñeca y una tercera cámara auxiliar de 224×224).
- Condicionamiento por instrucción en lenguaje natural (el campo `--task` de `lerobot-rollout`).
- Generalización a entornos no vistos, según la motivación declarada de π₀.₅ (no verificada con evaluaciones en este repositorio).
- Inferencia en tiempo real a 30 FPS sobre hardware SO-101.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento explícito; el modelo es una política de control, no un asistente conversacional.

## Casos de uso

- Automatización de una celda de ensamblaje con SO-101: el modelo ejecuta el ciclo de extracción y depósito del destornillador de forma repetible, integrándose en un script de rollout de LeRobot con `--duration` para controlar la duración de la ejecución.
- Base para fine-tuning en tareas de pick-and-place: al partir de `lerobot/pi05_base`, el mismo pipeline (`lerobot-train` con `--policy.path=lerobot/pi05_base`) permite reentrenar sobre nuevos datasets manteniendo la arquitectura VLA.
- Investigación en imitación de bajo coste: el par SO-101 más 100 episodios teleoperados constituye un caso reproducible para estudiar cuántos datos y pasos de entrenamiento bastan para una tarea de manipulación.
- Evaluación de robustez ante cambios de entorno: al estar diseñado π₀.₅ para generalizar a situaciones no vistas, sirve como banco de pruebas para medir degradación con nuevas posiciones de objeto, iluminación o distracciones.
- Docencia y prototipado en robótica: la licencia Apache 2.0 y el ecosistema LeRobot permiten desplegar el modelo en laboratorios docentes sin restricciones de uso comercial.
- Benchmark interno de VLA: comparar la política ajustada contra el modelo base o contra otras políticas LeRobot sobre la misma tarea y el mismo robot para medir la ganancia del fine-tuning.
- Integración en pipelines de recogida de datos: ejecutar la política con `--strategy.type=base` para generar trayectorias sin grabar episodios, o con estrategias de grabación para ampliar el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito, número de ensayos ni comparaciones numéricas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, 4,14 mil millones de parámetros en precisión de 16 bits suponen aproximadamente 8,3 GB solo en pesos, más el coste de los tres flujos de imagen y del estado; en fp32 serían unos 16,6 GB. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por el tamaño de pesos, una GPU de 16 GB o más podría alojar la inferencia en fp16, pero no hay validación publicada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para una política de control robótico de este tipo.
- Latencia y throughput: la captura de datos y la inferencia se plantean a 30 FPS; no se publican latencias por paso ni throughput medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO101-remove-screwdriver-pi0.5 (este) | 4,14 mil millones | no disponible | Manipulación SO-101, tarea única | Apache 2.0 | HuggingFace, 0 descargas |
| lerobot/pi05_base | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | HuggingFace |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la información | no disponible | Imitación robótica | no disponible en la información | HuggingFace / LeRobot |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para este modelo ni datos de rendimiento de los comparadores en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, de modo que el rendimiento real en robot es desconocido.
- Especialización extrema: entrenado para una única tarea ("sacar el destornillador negro de la caja y ponerlo en la mesa") sobre un robot SO-101 concreto; no se espera que funcione en otras tareas sin reentrenamiento.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir exactamente con las claves de observación del entrenamiento (`front`, `wrist`, `empty_camera_0`), lo que limita la portabilidad entre montajes.
- Dataset pequeño: 100 episodios y 23.746 fotogramas son una base reducida; el riesgo de sobreajuste a posiciones, iluminación y objetos del dataset es alto.
- Sesgos: no documentados por el autor; cabe esperar sesgo hacia las condiciones visuales y posiciones presentes en la recogida de datos.
- Alucinación y fallos de seguridad física: al ser una política de control, los errores se traducen en movimientos incorrectos del brazo; se recomienda supervisión y límites de par/velocidad en el robot.
- Idiomas: la cobertura lingüística de las instrucciones no está documentada.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y el dataset de entrenamiento deben verificarse por separado antes de un despliegue comercial.
- Fecha de creación futura en los metadatos (2026-11-04) y cero descargas: repositorio sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboColosseum/so101-remove-screwdriver-pi0.5
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiamo0912/robocolosseum-so101-black-screwdriver-box-to-table-100episodes
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jiamo0912/robocolosseum-so101-black-screwdriver-box-to-table-100episodes
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot de pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
