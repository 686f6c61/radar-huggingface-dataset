# JanPhilipp/smolvla_ttz_tools_2

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente que alcanza un rendimiento competitivo con un coste computacional reducido, pudiendo desplegarse en hardware de consumo. Esta instancia concreta, `JanPhilipp/smolvla_ttz_tools_2`, es un fine-tuning del modelo base `lerobot/smolvla_base` desarrollado con la librería LeRobot. El modelo ha sido entrenado para controlar un brazo robótico de tipo `so_follower` con el objetivo de recoger herramientas de un área verde y colocarlas en un área roja, a partir de observaciones de estado y dos cámaras RGB.

Con un total de 450.046.176 parámetros y un tamaño de pesos de 1,2 GB en formato Safetensors, este modelo destaca por su ligereza frente a otros VLA de mayor escala. Es relevante para la comunidad de robótica porque permite entrenar y ejecutar políticas de imitación en GPUs de consumo, reduciendo la barrera de entrada en tareas de manipulación robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA) |
| Parametros totales | 450.046.176 (450M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Modelo base | lerobot/smolvla_base |
| Robot objetivo | so_follower (SO-ARM) |
| Entradas | observation.state (6,), dos imagenes RGB 480x640 |
| Salidas | action (6,) |
| Dataset de entrenamiento | JanPhilipp/ttz_tools_merged_2 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, un modelo de visión-lenguaje-acción que combina codificadores de imagen y estado para predecir acciones de robot. A diferencia de los grandes VLA, SmolVLA está diseñado para ser compacto y eficiente, priorizando el despliegue en hardware de consumo sin sacrificar demasiado rendimiento. En esta versión fine-tuneada, las entradas son el estado del robot (6 valores) y dos imágenes de 480x640 píxeles, y la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó desde el preentrenado `lerobot/smolvla_base` sobre el dataset `JanPhilipp/ttz_tools_merged_2`, compuesto por 80 episodios y 69.819 fotogramas a 30 FPS. La tarea única consistía en recoger herramientas del área verde y colocarlas en el área roja. El proceso utilizó 20.000 pasos de entrenamiento con un batch de 20, optimizador AdamW, learning rate de 0,0001 y semilla 1000, usando la versión 0.6.2 de LeRobot. No se han publicado detalles adicionales sobre la composición del dataset ni sobre técnicas de post-entrenamiento como RLHF o DPO, que no son aplicables en este contexto robótico.

## Capacidades

- Genera acciones de control para un brazo robótico `so_follower` a partir de observaciones multimodales (estado + dos cámaras RGB).
- Ejecuta la tarea específica de recoger herramientas del área verde y colocarlas en el área roja.
- Puede adaptarse a nuevas tareas mediante fine-tuning con demostraciones grabadas usando LeRobot.
- Procesa imágenes de 480x640 y el estado de 6 dimensiones del robot.
- Compatible con el pipeline de LeRobot para inferencia y reentrenamiento.
- No soporta tool calling / function calling, ni generación de código, ni razonamiento en el sentido de un modelo de lenguaje.
- No dispone de modo de pensamiento explícito ni de capacidades de agente conversacional.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Recogida y colocación de piezas en líneas de montaje: el modelo puede integrarse en un brazo robótico para trasladar objetos de una bandeja de entrada a una de salida, replicando la dinámica aprendida con las herramientas.
- Ordenación de herramientas en talleres: en entornos industriales donde se requiere clasificar herramientas, el modelo puede ubicarlas en una zona determinada (por ejemplo, el área roja) a partir de la posición detectada por las cámaras.
- Automatización de tareas repetitivas en laboratorios: el modelo puede manipular muestras o instrumentos en una estación de trabajo fija, con dos cámaras que proporcionan redundancia visual para evitar obstrucciones.
- Robots de logística interna: adaptado mediante fine-tuning, puede utilizarse para transferir paquetes o herramientas entre contenedores en un almacén, aprovechando su capacidad de generalizar la tarea de grasp-and-place.
- Entrenamiento de nuevas tareas por demostración: un operador puede grabar nuevas demostraciones y ajustar el modelo con LeRobot, permitiendo añadir comportamientos sin reprogramar la política desde cero.
- Investigación en políticas de imitación compactas: sirve como referencia para estudiar el rendimiento de VLA ligeros en tareas de manipulación, comparándolo con modelos más grandes o con políticas basadas en código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". Por tanto, no existen datos fiables de tasas de éxito, precisión ni comparativas con otros modelos en esta tarea específica.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 450M parámetros y sus pesos ocupan 1,2 GB en Safetensors. Con precisiones habituales (fp16 o bf16) y las activaciones de las dos cámaras, se estima una necesidad orientativa de 2 a 4 GB de VRAM. No hay valores oficiales publicados.
- GPU recomendadas: no se ofrecen recomendaciones oficiales. Por tamaño, sería viable en GPUs de consumo como la RTX 3060 o superiores; para entrenamiento completo también puede usarse una A100 o H100, aunque no es necesario para inferencia.
- Compatibilidad con GPUs de consumo: sí, el tamaño compacto lo hace adecuado para GPUs de gama media de escritorio.
- Opciones de despliegue: empleando la librería LeRobot, se puede ejecutar la política con `lerobot-rollout` sobre el robot físico; también es compatible con el flujo de Hugging Face Hub. No se han documentado integraciones con vLLM, llama.cpp ni Ollama, al tratarse de un modelo de robótica y no un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se ha proporcionado una comparativa con modelos similares en la información disponible. El modelo comparte arquitectura con `lerobot/smolvla_base`, del cual es un fine-tuning, pero no existen datos de benchmarks ni de rendimiento relativo frente a otros VLA como OpenVLA o RT-2 en esta ficha.

## Limitaciones y advertencias

- Entrenado en una tarea muy específica: su capacidad de generalización a otros objetos, posiciones, iluminación o configuraciones de cámara es limitada y no está verificada.
- Dataset reducido: solo 80 episodios de demostración, lo que puede no cubrir suficientemente la variedad de situaciones reales y provocar fallos ante escenarios fuera de distribución.
- Sin evaluaciones publicadas: la ausencia de resultados de éxito en robot real significa que el rendimiento no ha sido validado de forma oficial.
- Riesgo de acciones incorrectas: ante observaciones con ruido, cambios de cámara u objetos no vistos, el modelo puede producir salidas de acción no seguras.
- No es un modelo de lenguaje: no procesa instrucciones naturales complejas ni admite tool calling; su rol se limita a generar vectores de acción.
- Dependencia de la configuración del robot: la política está ligada al tipo de robot `so_follower` y a las dos cámaras con las que fue entrenada; usar otro hardware o cambiar la disposición puede invalidar la política.
- Licencia Apache 2.0: permite uso comercial, pero obliga a mantener el aviso de licencia y a indicar cambios si se redistribuye el modelo derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JanPhilipp/smolvla_ttz_tools_2
- Artículo de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/JanPhilipp/ttz_tools_merged_2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
