# rubatotree/so101_classify_the_blocks_smolvla_manual

## Resumen

Este repositorio contiene una política robótica de tipo vision-language-action (VLA) entrenada mediante aprendizaje por imitación sobre el modelo base `lerobot/smolvla_base`. Se trata de un fine-tune de SmolVLA, un modelo compacto presentado en el paper arXiv:2506.01844, que busca obtener un rendimiento competitivo en manipulación robótica con un coste computacional reducido y capacidad de ejecución en hardware de consumo. El modelo pertenece al autor `rubatotree` y está pensado para el brazo robótico de bajo coste SO-101 (tipo de robot `so_follower`).

La política resuelve una tarea muy concreta: "classify the blocks" (clasificar bloques). Consume como entrada el estado de las articulaciones (`observation.state`, vector de 6 dimensiones) y una imagen frontal de 480x640 píxeles, y produce como salida un vector de acción de 6 dimensiones. Esto lo sitúa en el ámbito de la robótica de imitación de extremo a extremo, donde un único modelo mapea observaciones multimodales directamente a comandos motores, sin planificación simbólica intermedia.

Con 450.046.176 parámetros (aproximadamente 450 millones) y un repositorio de 1,2 GB, es un modelo pequeño en términos de IA generativa, pero representativo del segmento VLA eficiente. Su relevancia actual reside en que demuestra que es posible desplegar políticas de manipulación visual sobre hardware asequible, algo crítico para laboratorios, docentes y desarrolladores que no disponen de clústeres de GPU. El modelo cuenta con 15 descargas y 0 likes en el momento de redactar esta ficha, y no se han publicado resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); fine-tune de `lerobot/smolvla_base` (SmolVLA) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la política recibe una observación por paso y una instrucción de tarea) |
| Tipos de cuantización | no disponible; pesos publicados en safetensors |
| Idiomas soportados | no disponible; la tarea se especifica con una cadena de texto en inglés ("classify the blocks") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot (LeRobot 0.6.1) |
| Pipeline | robotics |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `front` |
| Tamaño del repositorio | 1,2 GB |
| Descargas / likes | 15 / 0 |
| Fecha de creación | 2026-09-17 |
| Última actualización | 2026-09-17 |

## Arquitectura y entrenamiento

La política es un fine-tune de SmolVLA, un modelo de tipo vision-language-action descrito por sus autores como compacto y eficiente, capaz de alcanzar un rendimiento competitivo con un coste computacional reducido y de desplegarse en hardware de gama de consumo. La información proporcionada no detalla la composición interna exacta del backbone visual-lógico ni el mecanismo del experto de acciones; la model card únicamente enlaza el paper (arXiv:2506.01844) y la documentación de LeRobot para la guía de SmolVLA. Lo que sí se especifica es la interfaz del modelo: una observación de estado de 6 dimensiones y una imagen RGB frontal de 3x480x640, con salida de acción de 6 dimensiones, típica de un brazo de 6 grados de libertad como el SO-101.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `rubatotree/classify_the_blocks_front`, compuesto por 120 episodios y 31.602 fotogramas capturados a 15 FPS, todos ellos de la tarea "classify the blocks". La configuración reportada es de 50.000 pasos de entrenamiento, batch size 64, optimizador AdamW, learning rate 0,0001 y semilla 1000. Se trata, por tanto, de un ajuste por imitación supervisada sobre demostraciones de teleoperación, no de un entrenamiento con RLHF ni DPO. No se documenta en la información disponible ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base SmolVLA.

## Capacidades

- Generación de acciones motoras de 6 dimensiones para un brazo robótico SO-101 a partir de una imagen frontal y del estado articular.
- Ejecución de la tarea de clasificación de bloques ("classify the blocks") mediante aprendizaje por imitación de extremo a extremo.
- Control visomotor en bucle cerrado: la política consume observaciones en cada paso y emite acciones de forma continua.
- Condicionamiento por instrucción de tarea en formato texto (en inglés en el ejemplo de la model card), lo que en principio permitiría cambiar la consigna si el modelo base conserva esa capacidad.
- Integración con el ecosistema LeRobot para despliegue mediante `lerobot-rollout` y para reentrenamiento mediante `lerobot-train`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito; son capacidades ajenas al propósito de esta política.
- No se documentan capacidades multilingües.

## Casos de uso

- Clasificación y separación de bloques en un banco de laboratorio: la política ejecuta la tarea "classify the blocks" sobre un SO-101 con una cámara frontal, sustituyendo la teleoperación manual por una ejecución autónoma repetible.
- Docencia universitaria en robótica e IA: al ser un modelo de 450 M de parámetros y licencia Apache-2.0, se puede usar como ejemplo completo del ciclo grabar datos, entrenar con LeRobot y desplegar una política VLA en un brazo de bajo coste.
- Punto de partida para fine-tuning propio: dado que se publica un dataset de 120 episodios y 31.602 fotogramas a 15 FPS, sirve como plantilla para que otros grupos generen sus propios datasets y ajusten `lerobot/smolvla_base` con su propia tarea.
- Pruebas de manipulación de objetos pequeños en línea de montaje o clasificación logística: el modelo mapea imagen y estado a acciones directamente, sin percepción simbólica intermedia, lo que simplifica prototipos de pick-and-place de objetos categorizables por forma o color.
- Investigación en imitación de extremo a extremo: permite comparar variantes de datos (posiciones de objeto, iluminación, distractores) midiendo su impacto en la tasa de éxito, una vez se realice la evaluación que el autor aún no ha publicado.
- Captura de datos para ampliar el dataset: la propia política puede ejecutarse con `--strategy.type=base` durante un tiempo acotado (`--duration`) sin grabar episodios, útil para validar la configuración de robot, puerto y cámaras antes de una campaña de recogida.
- Integración en pipelines de experimentación reproducibles: los identificadores de política, dataset y configuración de entrenamiento permiten reproducir el experimento con semilla fija (seed 1000) dentro de un flujo LeRobot versionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la línea "No evaluation results have been provided for this policy yet" y la plantilla de tabla de evaluación (tarea, intentos, éxitos, tasa de éxito) aparece vacía. Tampoco se proporcionan métricas de latencia, throughput ni tasa de éxito en robot real, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- Con 450.046.176 parámetros, la huella teórica de los pesos es de aproximadamente 1,8 GB en FP32, unos 0,9 GB en BF16/FP16 y unos 0,45 GB en INT8 (estimaciones calculadas a partir del recuento de parámetros; no son cifras publicadas por el autor).
- El repositorio ocupa 1,2 GB, coherente con pesos en precisión completa y artefactos asociados.
- Cabría en GPU de consumo con holgura: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, etc. La arquitectura SmolVLA está diseñada explícitamente para desplegarse en hardware de gama de consumo, según la propia model card.
- No se especifican GPU de centro de datos recomendadas (A100, H100) ni requisitos mínimos concretos; no disponible.
- Opciones de despliegue documentadas: LeRobot, mediante el comando `lerobot-rollout` con `--policy.path=rubatotree/so101_classify_the_blocks_smolvla_manual`. El reentrenamiento se realiza con `lerobot-train` usando `--policy.path=lerobot/smolvla_base` y `--policy.device=cuda`.
- Latencia y throughput: no disponibles. La model card no publica cifras de frecuencia de inferencia ni de velocidad de ejecución en el robot.
- Requisitos adicionales de sistema: puerto serie del robot y al menos una cámara OpenCV a 640x480 y 30 FPS, con nombres de cámara que coincidan con las claves de observación del entrenamiento (`observation.images.front`).

## Comparativa con modelos similares

No se dispone de datos verificados de modelos alternativos en la información proporcionada. La comparación siguiente se limita a lo que puede afirmarse con la documentación disponible; el resto de campos se marcan como no disponibles.

| Modelo | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `rubatotree/so101_classify_the_blocks_smolvla_manual` (esta política) | 450.046.176 | Imagen frontal 3x480x640 + estado 6-D | apache-2.0 | Hugging Face, 15 descargas |
| `lerobot/smolvla_base` (modelo base) | no disponible (el fine-tune conserva 450 M, coherente con el tamaño del base) | Multimodal (VLA) | no disponible | Hugging Face |
| Otras políticas VLA de la familia LeRobot | no disponible | no disponible | no disponible | no disponible |

Otras familias de políticas robóticas de propósito general (por ejemplo, VLA de mayor tamaño o políticas de difusión) no se detallan en la información proporcionada, por lo que no se incluyen cifras comparativas.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación: se desconoce la tasa de éxito real de la política, tanto en la tarea original como frente a variaciones de posición, iluminación o presencia de distractores.
- El entrenamiento se basa en un único dataset de 120 episodios y 31.602 fotogramas (unas 35 minutos de datos a 15 FPS), un volumen reducido que limita la generalización más allá de las condiciones grabadas.
- Está especializada en una única tarea ("classify the blocks"), un único tipo de robot (`so_follower`) y una única cámara (`front`). Cambiar cualquiera de estos elementos invalida la política tal como está entrenada.
- La configuración de cámara es rígida: los nombres de cámara deben coincidir con `observation.images.front`; de lo contrario, la inferencia fallará.
- Riesgo de sobreajuste al entorno de recogida de datos (mesa, fondo, iluminación, posición inicial del brazo). Es esperable una degradación del rendimiento ante cambios de distribución, aunque no se cuantifica.
- El riesgo de alucinación en el sentido lingüístico no aplica a esta política; el modo de fallo equivalente es la emisión de acciones incorrectas o inseguras ante observaciones fuera de distribución.
- Al controlar hardware físico, cualquier despliegue debe incorporar paradas de emergencia, límites de par y supervisión humana; el modelo no incluye garantías de seguridad.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo demográfico, de sesgo de apariencia de objetos ni de comportamiento diferencial por condiciones de iluminación.
- Licencia apache-2.0, que permite uso comercial y modificación con atribución; conviene verificar igualmente la licencia y los términos del modelo base `lerobot/smolvla_base` y del dataset `rubatotree/classify_the_blocks_front`, no detallados en la información disponible.
- Las fechas de creación y actualización del repositorio (2026-09-17) figuran tal cual en los metadatos proporcionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rubatotree/so101_classify_the_blocks_smolvla_manual
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/rubatotree/classify_the_blocks_front
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rubatotree/classify_the_blocks_front
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de una política: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot: Cadene, Remi et al., "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch", https://github.com/huggingface/lerobot
