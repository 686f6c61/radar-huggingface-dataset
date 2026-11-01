# RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube

## Resumen

El modelo `RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube` es una política de robótica de tipo Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence, fine-tuneada por el usuario RoboCrafty mediante la librería LeRobot de Hugging Face. Resuelve una tarea concreta de manipulación robótica: arrastrar un contenedor hasta el centro de la mesa, colocar en su interior un cubo amarillo y un cubo azul, y cerrar la tapa. El modelo parte del checkpoint base `lerobot/pi05_base` y se ha especializado con 44 episodios de demostración recogidos en un robot real de tipo `my_parol6`.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo completo del flujo de trabajo de imitation learning en LeRobot: grabación de datos, entrenamiento y despliegue sobre hardware físico. Por otro, permite evaluar el estado actual de los modelos VLA open source de escala media (unos 4.143 millones de parámetros en safetensors) aplicados a tareas de pick-and-place con múltiples objetos y una secuencia de acciones compuesta.

El modelo consume el estado del robot (vector de 7 dimensiones) y tres flujos de cámara (gripper, topdown e isometric) con resoluciones de 480x640 y 360x640, y produce un vector de acción de 7 dimensiones a 30 FPS. Es un modelo de nicho, con muy pocas descargas (4) y sin resultados de evaluación publicados, por lo que debe considerarse una política experimental y no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no orientado a texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | my_parol6 |
| Cámaras de entrada | gripper_cam, topdown_cam, isometric_cam |
| Dimensión del estado | (7,) |
| Dimensión de la acción | (7,) |
| Frecuencia de datos | 30 FPS |
| Tamaño del repositorio | 9.4 GB |
| Pasos de entrenamiento | 10.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 2.5e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es π₀.₅ (Pi05), un modelo Vision-Language-Action desarrollado por Physical Intelligence como evolución de π₀, diseñado para generalizar a entornos y situaciones no vistas durante el entrenamiento. La implementación utilizada aquí proviene del repositorio OpenPI de Physical Intelligence y ha sido adaptada a LeRobot. El modelo combina un backbone visión-lenguaje con un cabezal de acciones que mapea observaciones multimodales (estado propioceptivo de 7 dimensiones más tres imágenes RGB) a comandos de acción de 7 dimensiones. No se dispone de detalles sobre el número de tokens de entrenamiento del modelo base ni sobre la composición exacta de su dataset.

El fine-tuning se realizó sobre el dataset `RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube`, compuesto por 44 episodios y 57.467 frames a 30 FPS, con una única instrucción de tarea: "Pull the container to the center, then place the yellow cube and blue cube in the container and close the lid". El entrenamiento se ejecutó durante 10.000 pasos con batch size de 32, AdamW y learning rate de 2.5e-05. No se documenta el uso de RLHF, DPO ni técnicas de refuerzo adicionales; se trata de imitation learning supervisado puro sobre demostraciones humanas. Tampoco se especifican innovaciones técnicas adicionales más allá de las propias del modelo π₀.₅ base.

## Capacidades

- Manipulación robótica de precisión: ejecuta una secuencia compuesta de arrastre de contenedor, pick-and-place de dos cubos y cierre de tapa.
- Percepción multimodal: procesa simultáneamente tres cámaras RGB (gripper, topdown e isometric) junto con el estado propioceptivo del robot.
- Control a 30 FPS: genera acciones de 7 dimensiones a la frecuencia de los datos de entrenamiento.
- Generalización limitada al dominio de la tarea: al ser un fine-tune específico, su capacidad de generalización fuera de la distribución de entrenamiento no está documentada.
- Seguimiento de instrucciones en lenguaje natural: acepta una descripción textual de la tarea como condicionamiento.
- Integración con LeRobot: compatible con el CLI `lerobot-rollout` y con el flujo de entrenamiento `lerobot-train`.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso en el sentido de los LLM.
- No se documentan capacidades multilingües ni modos de razonamiento explícito (thinking mode).

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo puede ejecutar la secuencia completa de recogida de cubos y colocación en contenedor sobre un robot Parol6, integrándose en una celda de fabricación para tareas repetitivas de clasificación.
- Investigación en imitation learning: sirve como punto de partida reproducible para estudiar el efecto del número de episodios (44 en este caso) y de los pasos de entrenamiento (10.000) en el éxito de una política VLA.
- Benchmark de referencia para fine-tuning de π₀.₅: permite comparar configuraciones de entrenamiento (learning rate, batch size, número de cámaras) sobre una tarea estandarizada de manipulación compuesta.
- Prototipado rápido de políticas robóticas: con LeRobot 0.6.1 y el CLI `lerobot-rollout`, un equipo puede desplegar la política en un robot físico en minutos para validar hardware y calibración de cámaras.
- Docencia y formación en robótica: ejemplo didáctico completo del ciclo grabación-entrenamiento-despliegue con datos reales y tres vistas de cámara.
- Pruebas de robustez perceptual: al depender de tres cámaras con resoluciones distintas (480x640 y 360x640), permite evaluar la sensibilidad de la política a cambios de iluminación, oclusiones y posiciones de objeto.
- Base para transferencia a tareas similares: el checkpoint puede reutilizarse como inicialización para tareas de manipulación con contenedores y objetos de colores en el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni de métricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.143 millones de parámetros en safetensors (aproximadamente 16,6 GB en fp32 o 8,3 GB en fp16), se requiere al menos una GPU con 16-24 GB de VRAM para cargar los pesos sin cuantización; no se documentan cuantizaciones soportadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) son candidatas razonables, pero no hay confirmación oficial.
- ¿Cabe en GPU consumer? Probablemente en RTX 4090 y modelos con 24 GB o más, aunque no está verificado ni documentado.
- Opciones de despliegue: LeRobot 0.6.1 mediante `lerobot-rollout` con `--policy.path=RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. La política opera a 30 FPS según los datos de entrenamiento, pero no se confirma que la inferencia alcance esa frecuencia en hardware concreto.
- El robot requiere el puerto serie y las cámaras configuradas con los nombres exactos `gripper_cam`, `topdown_cam` e `isometric_cam`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube | 4.143 M | no disponible | Pick-and-place específico en Parol6 | apache-2.0 | Hugging Face, 4 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista open source (OpenPI) | no disponible en la información | Repositorio OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad cuando estos datos están documentados.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad fuera del conjunto de entrenamiento.
- Dataset muy reducido: 44 episodios y 57.467 frames son una base limitada para generalización; el modelo probablemente se degrade ante cambios de iluminación, posiciones de objeto o disposición de la escena.
- Especialización estrecha: entrenado para una única instrucción de tarea y un robot concreto (`my_parol6`); no es transferible directamente a otros robots o tareas sin reentrenamiento.
- Dependencia de tres cámaras con nombres y resoluciones específicas: cualquier desviación en la configuración de hardware puede invalidar la política.
- Riesgo de sobreajuste: 10.000 pasos sobre 44 episodios con batch size 32 puede provocar memorización de las trayectorias de demostración.
- Sin datos sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo perceptual puede heredar sesgos de los datos de demostración (posiciones, colores y objetos concretos).
- Licencia apache-2.0: permite uso comercial, pero el modelo base `lerobot/pi05_base` y la implementación OpenPI pueden tener condiciones adicionales que deben verificarse por separado.
- Sin soporte documentado de cuantización: el despliegue en hardware limitado no está validado.
- Repositorio con 4 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
