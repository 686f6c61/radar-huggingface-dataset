# JanPhilipp/smolvla_ttz_tools_jetson_test2

## Resumen

SmolVLA es un modelo visión-lenguaje-acción (VLA) compacto y eficiente diseñado para controlar robots manipuladores a partir de observaciones visuales y del estado de las articulaciones. El modelo aquí descrito, `JanPhilipp/smolvla_ttz_tools_jetson_test2`, es un ajuste fino (fine-tuning) del checkpoint base `lerobot/smolvla_base`, entrenado con la librería LeRobot y publicado por el usuario JanPhilipp. Su propósito concreto es ejecutar la tarea de recoger herramientas de una zona verde y depositarlas en una zona roja, sobre un brazo robótico de tipo `so_follower` con dos cámaras.

Técnicamente se trata de un modelo de aproximadamente 450 millones de parámetros (450.046.176 según el fichero de pesos), distribuido en formato safetensors con un tamaño de repositorio de 1,2 GB bajo licencia Apache-2.0. El pipeline declarado en HuggingFace es `robotics`, y el modelo se apoya en el paper SmolVLA (arXiv:2506.01844) para el método de entrenamiento. Está pensado explícitamente para poder desplegarse en hardware de consumo, lo que lo hace relevante para laboratorios y equipos de robótica con presupuesto limitado.

La relevancia de esta ficha es doble: por un lado, ilustra el flujo completo de entrenamiento y publicación de políticas de imitación con LeRobot; por otro, sirve como ejemplo de ajuste fino de muy pocos pasos (100 pasos de entrenamiento) sobre un dataset pequeño (80 episodios, 69.819 fotogramas), lo que conviene tener en cuenta al evaluar su robustez en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según el método SmolVLA (arXiv:2506.01844) |
| Parámetros totales | 450.046.176 (aproximadamente 450 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de robótica; entrada basada en imágenes y estado, no en texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (la instrucción de tarea del dataset está en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.1 |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Cámaras | camera1, camera2 |
| Entradas | observation.state `(6,)`, observation.images.camera1 `(3, 480, 640)`, observation.images.camera2 `(3, 480, 640)` |
| Salidas | action `(6,)` |
| Tamaño del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA se presenta en la model card como un modelo visión-lenguaje-acción compacto y eficiente que alcanza rendimiento competitivo con un coste computacional reducido y que puede desplegarse en hardware de consumo. La arquitectura concreta, los detalles de atención y el esquema de integración entre el codificador visual, el modelo de lenguaje y el módulo de acciones se documentan en el paper referenciado (arXiv:2506.01844), no en la model card del repositorio. Por tanto, no se dispone en la información proporcionada de detalles internos como el tipo de cabecera de acciones, el esquema de difusión o flow matching empleado, ni el número total de tokens de entrenamiento del modelo base.

El ajuste fino se realizó con LeRobot 0.6.1 sobre el dataset `JanPhilipp/ttz_tools_merged_2`, compuesto por 80 episodios y 69.819 fotogramas capturados a 30 FPS. La tarea única etiquetada es "Grab the tools from the green area and place them on the red area". La configuración de entrenamiento fue de 100 pasos, batch size 4, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna etapa de alineación posterior; se trata de aprendizaje por imitación supervisado a partir de demostraciones.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones a partir del estado del robot y de dos vistas de cámara.
- Ejecución de una tarea específica de pick-and-place: recoger herramientas de una zona verde y colocarlas en una zona roja.
- Percepción visual multi-cámara: consume simultáneamente dos flujos de imagen RGB de 480x640 píxeles.
- Acondicionamiento por instrucción de tarea: acepta un texto de tarea (`--task=...`) en el comando de rollout, aunque no se documenta soporte multilingüe ni generalización a tareas distintas de la entrenada.
- Despliegue en borde: el método base está diseñado para ejecutarse en hardware de consumo, lo que sugiere viabilidad en dispositivos tipo Jetson (el nombre del repositorio incluye `jetson_test2`).
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, visión general, audio ni modo de pensamiento; son capacidades propias de modelos de lenguaje, no de esta política robótica.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo puede ejecutar la secuencia completa de recoger una herramienta de una zona delimitada y depositarla en otra, con la política ejecutándose a la frecuencia de captura de las cámaras (30 FPS) y comandando 6 grados de libertad.
- Ordenación de puestos de trabajo (metodología 5S): dado un banco de trabajo con herramientas dispersas en una zona marcada, la política puede trasladarlas a la zona de almacenamiento designada, reduciendo la intervención manual en tareas repetitivas.
- Prototipado rápido en robótica de bajo coste: al tener 450 M de parámetros y un repositorio de 1,2 GB, es viable desplegarlo en un equipo de laboratorio con una GPU de gama media o una placa Jetson para validar la viabilidad de una celda robotizada antes de invertir en integración industrial.
- Base para nuevos ajustes finos: el checkpoint puede servir como punto de partida para reentrenar con un dataset propio mediante `lerobot-train`, reutilizando el pipeline de LeRobot y sustituyendo únicamente las observaciones y la tarea.
- Investigación en aprendizaje por imitación: permite reproducir el flujo completo (grabación de datos, entrenamiento, rollout) y estudiar el efecto de pocos pasos de entrenamiento y datasets pequeños sobre el éxito de la tarea.
- Evaluación de robustez frente a variaciones del entorno: al disponer de dos vistas, es un banco de pruebas útil para medir cuánto degrada el rendimiento un cambio de iluminación, de posición de las herramientas o la introducción de distractores.
- Demostraciones y material docente: sirve como ejemplo reproducible y de tamaño manejable para enseñar el ciclo de vida de una política robótica en cursos de robótica o machine learning aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación vacía, con la nota "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito, número de ensayos ni condiciones de prueba. Tampoco se proporcionan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, 450 M de parámetros ocupan aproximadamente 1,8 GB en fp32 y 0,9 GB en bf16/fp16 solo en pesos; a ello hay que sumar las activaciones de dos imágenes de 480x640 y el estado del robot, lo que en la práctica sitúa el consumo típico en el rango de 2 a 4 GB, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no especificadas. El método base indica explícitamente despliegue en hardware de consumo; el nombre del repositorio (`jetson_test2`) sugiere pruebas en NVIDIA Jetson.
- Viabilidad en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, en tarjetas con al menos 4-8 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060, RTX 4090). No hay confirmación oficial de modelos concretos.
- Opciones de despliegue: LeRobot mediante los comandos `lerobot-rollout` (inferencia sobre el robot) y `lerobot-train` (entrenamiento). Se requiere PyTorch. No aplican servidores de inferencia de LLM como vLLM, TGI, llama.cpp u Ollama, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La captura de datos se realizó a 30 FPS y el comando de ejemplo usa cámaras configuradas a 640x480 y 30 FPS, lo que marca un objetivo de frecuencia de control de 30 Hz, pero no se documenta si la política lo alcanza en el hardware de destino.
- Reproducción del entorno: el comando de rollout requiere declarar el tipo de robot `so_follower`, el puerto del robot y dos cámaras con nombres que coincidan exactamente con las claves de observación (`camera1`, `camera2`).

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la información proporcionada. La tabla siguiente recoge únicamente lo que puede afirmarse con la documentación disponible:

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JanPhilipp/smolvla_ttz_tools_jetson_test2 | 450.046.176 | VLA ajustada para pick-and-place | Apache-2.0 | HuggingFace (0 descargas) | 100 pasos de entrenamiento, 80 episodios, sin evaluación publicada |
| lerobot/smolvla_base | No disponible en la información proporcionada | VLA base | No disponible en la información proporcionada | HuggingFace | Modelo de partida del ajuste fino; arquitectura y método descritos en arXiv:2506.01844 |
| Otras políticas VLA de la misma categoría (por ejemplo, familias tipo OpenVLA o pi0) | No disponible | VLA | No disponible | No disponible | No se aportan cifras ni fuentes en la información disponible |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni número de ensayos, por lo que se desconoce el rendimiento real de la política en el robot.
- Entrenamiento muy corto: 100 pasos con batch size 4 sobre 80 episodios es un régimen muy reducido, con riesgo alto de sobreajuste a las condiciones exactas de captura o, por el contrario, de infraprendizaje de la tarea.
- Sensibilidad al entorno: cualquier cambio en iluminación, posición de las herramientas, fondo, tipo de cámara o colocación de las zonas verde y roja puede degradar el comportamiento, ya que no se documenta aumento de datos ni variabilidad controlada.
- Acoplamiento al hardware: la política está entrenada para un robot `so_follower` con exactamente dos cámaras denominadas `camera1` y `camera2`; usar otros nombres de cámara, otro número de vistas u otro robot invalida la inferencia.
- Riesgo de acciones erróneas: en un modelo de acción no existe "alucinación" textual, pero sí generación de trayectorias incorrectas que pueden provocar colisiones o caída de objetos. Es obligatorio operar con paradas de emergencia y límites de par en el brazo.
- Espacio de acción limitado: la salida es un vector de 6 dimensiones; no se contemplan pinzas de más grados de libertad ni tareas con requisitos de fuerza.
- Idiomas: no hay información sobre capacidades multilingües; el único texto de tarea documentado está en inglés.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene verificar las licencias del modelo base (`lerobot/smolvla_base`) y del dataset `JanPhilipp/ttz_tools_merged_2` antes de un despliegue productivo, ya que no se detallan en la información proporcionada.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado con un minuto de diferencia, lo que indica que se trata de un experimento y no de un artefacto validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JanPhilipp/smolvla_ttz_tools_jetson_test2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/JanPhilipp/ttz_tools_merged_2
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JanPhilipp/ttz_tools_merged_2
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Documentación de entrenamiento con imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
