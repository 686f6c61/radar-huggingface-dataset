# mrodher/policy_test_V12

## Resumen

`mrodher/policy_test_V12` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario mrodher en Hugging Face mediante la librería LeRobot de Hugging Face, y está asociado al dataset de demostraciones teleoperadas `mrodher/so101_dataset_test_V12`. Su propósito es controlar un robot tipo `so_follower` (SO-101) equipado con dos cámaras (vista superior y muñeca) para ejecutar la tarea concreta de colocar una pieza beige sobre un marcador ArUco.

Se trata de un modelo de robótica, no de un modelo de lenguaje: consume el estado articular del robot (vector de 6 dimensiones) y dos imágenes RGB de 480x640, y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real a 30 FPS sobre hardware modesto. La relevancia de este tipo de publicaciones radica en que ejemplifican el flujo completo de LeRobot: grabación de datos con un robot de bajo coste, entrenamiento de una política ACT y despliegue directo en el robot físico.

No obstante, conviene subrayar que se trata de un artefacto de prueba (`policy_test`): no incluye resultados de evaluación, la licencia no está declarada y el entrenamiento es limitado (80 episodios, 32.147 fotogramas, 20.000 pasos). Es útil como referencia técnica y como ejemplo reproducible del pipeline, pero no como política lista para producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación basada en imágenes y estado, sin contexto textual |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `top`, `wrist` |
| Frecuencia de datos | 30 FPS |
| Tarea entrenada | "put the beige piece on the aruco" |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705. La política combina un codificador visual (procesa las dos imágenes de 480x640) con un transformer que, a partir del estado articular y las observaciones visuales, predice un *chunk* de acciones futuras en lugar de una única acción. Esta predicción por fragmentos reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad en tareas de manipulación fina. El modelo se entrenó con LeRobot 0.6.2 sobre 80 episodios teleoperados (32.147 fotogramas a 30 FPS) del dataset `mrodher/so101_dataset_test_V12`, con una única tarea: colocar la pieza beige sobre el ArUco.

La configuración de entrenamiento documentada es: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se especifica el número de tokens ni la composición del dataset más allá del recuento de episodios y fotogramas, ni si se aplicaron técnicas de aumento de datos o regularización adicionales. Tampoco se detalla el tamaño del *chunk* de acciones ni la dimensión interna del transformer, datos que no están disponibles en la información proporcionada.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea "put the beige piece on the aruco" sobre un robot SO-101 (`so_follower`).
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas ni entorno simulado.
- Predicción de fragmentos de acción (*action chunking*) para movimientos más suaves y estables.
- Fusión multimodal de estado articular (6 dimensiones) y dos vistas de cámara (superior y muñeca).
- Inferencia en tiempo real a 30 FPS, compatible con el bucle de control del robot.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo *thinking*: es una política de control motor, no un modelo generativo de propósito general.

## Casos de uso

- **Automatización de una celda de pick-and-place**: la política puede ejecutar la colocación de la pieza beige sobre el ArUco en un puesto de trabajo repetitivo, aprovechando que fue entrenada exactamente para esa tarea y ese robot.
- **Prototipado rápido de políticas con LeRobot**: sirve como referencia reproducible para validar el pipeline completo (grabación, entrenamiento, despliegue) antes de escalar a tareas reales.
- **Docencia y formación en aprendizaje por imitación**: el repositorio y el dataset asociado permiten estudiar el flujo de ACT con un caso real y acotado, incluyendo la configuración exacta de entrenamiento.
- **Base para *fine-tuning* en tareas similares**: al ser un modelo compacto (51,7 M de parámetros), puede reentrenarse o adaptarse a variantes de la misma tarea (otra pieza, otra posición del ArUco) con recursos limitados.
- **Investigación en manipulación de bajo coste**: el robot SO-101 y las dos cámaras RGB permiten experimentar con políticas visuales en hardware asequible, sin depender de brazos industriales.
- **Evaluación comparativa de métodos de imitación**: puede usarse como línea base ACT frente a otros métodos (p. ej., Diffusion Policy) sobre el mismo dataset y robot.
- **Pruebas de integración de inferencia en el borde**: su tamaño reducido permite ejecutar la política en una GPU de consumo junto al resto del *stack* de control del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (≈0,2 GB de pesos en FP32), la huella es muy reducida y cabe holgadamente en cualquier GPU moderna.
- **GPU recomendadas**: cualquier GPU con soporte CUDA es suficiente; una RTX 3060/4060 o superior permite inferencia a 30 FPS sin problemas. Para entrenamiento, una RTX 4090 o A100 acelera los 20.000 pasos, aunque el modelo es lo bastante pequeño para entrenar en GPUs de consumo.
- **¿Cabe en GPU de consumo?**: sí, con amplio margen; incluso podría ejecutarse en CPU para pruebas no críticas, aunque no se documenta latencia.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el método documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles. El sistema opera a 30 FPS según la frecuencia de los datos de entrenamiento, pero no se publican mediciones de latencia de inferencia ni de *throughput*.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la información proporcionada. A continuación se comparan únicamente características estructurales conocidas de métodos de la misma familia (aprendizaje por imitación para manipulación), sin datos de éxito:

| Modelo | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mrodher/policy_test_V12` (ACT) | 51,7 M | Estado 6D + 2 imágenes 480x640 | no disponible | no disponible | Hugging Face |
| ACT (referencia original, arXiv:2304.13705) | no disponible | Estado + imágenes | reportado en paper, no disponible aquí | según paper | paper y código |
| Diffusion Policy | no disponible | Estado + imágenes | no disponible | no disponible | paper/código |
| Otras políticas LeRobot (p. ej., SmolVLA) | no disponible | Estado + imágenes (+ lenguaje) | no disponible | según repositorio | Hugging Face |

No se han encontrado en la información proporcionada resultados numéricos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasas de éxito ni validación en robot real; no debe asumirse que la política funciona fuera del entorno de entrenamiento.
- **Tarea única y muy específica**: solo se entrenó para "put the beige piece on the aruco"; no generaliza a otras tareas, objetos ni posiciones sin reentrenamiento.
- **Dataset pequeño**: 80 episodios y 32.147 fotogramas son una base limitada; la política puede sobreajustar y ser sensible a cambios de iluminación, posición de cámara o distracciones.
- **Dependencia del hardware exacto**: requiere un robot `so_follower` con cámaras `top` y `wrist` en la configuración y resolución entrenadas (480x640, 30 FPS); cambios en la calibración o en el montaje de las cámaras degradan el rendimiento.
- **Licencia no declarada**: al no especificarse licencia, no está claro el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- **Sesgos y alucinación**: no aplican en el sentido de un LLM, pero sí existe riesgo de comportamientos erráticos o acumulación de error en secuencias largas, típico de las políticas de imitación.
- **Artefacto de prueba**: el nombre `policy_test_V12` y la ausencia de demo o evaluación sugieren que es un experimento, no una política validada.
- **Sin soporte multilingüe ni de agentes**: no es un modelo de lenguaje; no debe evaluarse con criterios de LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrodher/policy_test_V12
- Dataset de entrenamiento: https://huggingface.co/datasets/mrodher/so101_dataset_test_V12
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrodher/so101_dataset_test_V12
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (*rollout*): https://huggingface.co/docs/lerobot/main/en/inference
