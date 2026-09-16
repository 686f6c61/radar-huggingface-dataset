# DecisionFacts/Physical_AI_SO101_Cup_Nesting_ACT_Policy_v2

## Resumen

Physical_AI_SO101_Cup_Nesting_ACT_Policy_v2 es una política de imitación para robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face por el usuario DecisionFacts. No es un modelo de lenguaje: es un controlador visomotor que, a partir del estado articular de un brazo robótico SO-101 (6 grados de libertad) y de dos cámaras RGB de 480x640, genera comandos de acción de 6 dimensiones para ejecutar una tarea concreta: coger un vaso vacío y encajarlo dentro de otro vaso estático. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto, pensado para inferencia en tiempo real sobre hardware de robótica de bajo coste.

El modelo se ha entrenado con LeRobot 0.6.1 sobre el dataset DecisionFacts/Physical_AI_SO101_Cup_Nesting_Task, compuesto por 200 episodios y 226.915 fotogramas grabados a 30 FPS mediante teleoperación. La configuración de entrenamiento documentada es de 100.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-5. Está publicado bajo licencia Apache 2.0, con pesos en formato safetensors y la librería lerobot como interfaz de ejecución.

Su relevancia es doble. Por un lado, es un ejemplo práctico y reproducible de cómo se publica hoy una política robótica entrenada con aprendizaje por imitación: dataset, configuración, política y comando de despliegue en un mismo ecosistema. Por otro, sirve como punto de partida para quien quiera evaluar ACT frente a alternativas más recientes (Diffusion Policy, SmolVLA) en tareas de manipulación con brazos tipo SO-101. Cabe señalar que el repositorio no incluye resultados de evaluación en robot real ni datos de rendimiento medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): politica visomotora transformer con encoder CVAE sobre el paper arXiv:2304.13705 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de accion definido por el chunking de acciones |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (politica visomotora; no procesa lenguaje de forma nativa) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Entradas | observation.state (6,); observation.images.cam_front (3, 480, 640); observation.images.cam_top (3, 480, 640) |
| Salidas | action (6,) |
| Tipo de robot | so_follower (SO-101) |
| Camaras | cam_front, cam_top |
| Libreria / version | lerobot 0.6.1 |
| Fecha de creacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso de control. La arquitectura descrita en el paper de referencia (arXiv:2304.13705) combina un encoder CVAE que infiere una variable latente de estilo a partir de la secuencia de acciones, un backbone convolucional (ResNet-18 en la implementacion de referencia) que extrae características de las imágenes, y un transformer encoder-decoder que produce el chunk de acciones. El entrenamiento optimiza una pérdida L1 de reconstrucción de acciones junto con un término KL sobre la variable latente. La model card de este repositorio no detalla el tamaño de chunk, la variante del backbone ni el número de capas del transformer, por lo que esos valores concretos no están disponibles.

Los datos de entrenamiento proceden exclusivamente del dataset DecisionFacts/Physical_AI_SO101_Cup_Nesting_Task: 200 episodios teleoperados, 226.915 fotogramas a 30 FPS, con la tarea "Pick up the empty solo cup and nest it inside the other static cup". La configuración registrada es de 100.000 pasos de entrenamiento, batch size 8, AdamW, learning rate 1e-5 y semilla 1000, ejecutada con LeRobot 0.6.1. No se documenta uso de RLHF, DPO ni ningún otro ajuste por preferencias humanas; se trata de aprendizaje por imitación supervisado a partir de demostraciones.

## Capacidades

- Generación de acciones de control continuas de 6 dimensiones para un brazo SO-101 (so_follower).
- Percepción visomotora a partir de dos cámaras RGB simultáneas (vista frontal y vista superior) a 480x640.
- Ejecución de una tarea de manipulación específica: recoger un vaso vacío y encajarlo dentro de otro vaso estático.
- Predicción de chunks de acciones, lo que reduce la frecuencia efectiva de inferencia necesaria y suaviza el control.
- Integración con el ecosistema LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica (no es un modelo de lenguaje ni un planificador).
- Capacidades multilingües: no aplica.
- Capacidades especiales (thinking mode, visión general, audio): no disponibles; la visión está limitada a las dos cámaras de observación entrenadas.

## Casos de uso

- Automatización de pick-and-place con vasos: el modelo ejecuta directamente la tarea de encajar un vaso dentro de otro sobre un brazo SO-101, sin necesidad de programar trayectorias manuales. Es adecuado porque está entrenado específicamente sobre esa tarea y ese tipo de robot.
- Banco de pruebas para aprendizaje por imitación: sirve como referencia reproducible para comparar ACT con otros métodos (Diffusion Policy, SmolVLA) bajo el mismo dataset y el mismo robot, gracias a que la configuración de entrenamiento está documentada.
- Punto de partida para fine-tuning en tareas de apilado o nesting: se puede reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de tareas similares (apilar objetos, insertar piezas en cavidades) para aprovechar el conocimiento visomotor previo.
- Docencia y laboratorios de robótica de bajo coste: el tamaño del modelo (51,7 M de parámetros, 0,2 GB) permite desplegarlo en equipos modestos, lo que lo hace viable para prácticas universitarias con brazos SO-101.
- Validación de un pipeline completo de LeRobot: el repositorio incluye el comando de rollout listo para usar, por lo que sirve para verificar la instalación, la calibración de cámaras y la comunicación con el robot antes de abordar proyectos propios.
- Empaquetado y manipulación ligera en almacén: la tarea de encajar recipientes es representativa de operaciones de encajado y consolidación de envases; el modelo puede integrarse en una celda con brazo SO-101 para ciclos repetitivos de este tipo.
- Despliegue en edge sobre hardware integrado: al ser un modelo de ~52 M de parámetros, es candidato a ejecutarse en GPU de gama baja o en módulos tipo Jetson para control local, evitando depender de conectividad externa.
- Evaluación de robustez ante cambios de entorno: sirve como sujeto de prueba para medir la degradación de la política al variar iluminación, posición de los objetos o ligeras diferencias de calibración entre cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una sección de evaluación con la plantilla vacía y la indicación explícita de que no se han proporcionado resultados para esta política. Tampoco se documentan tasas de éxito en robot real, latencia medida ni throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51.668.614 parámetros, los pesos ocupan aproximadamente 207 MB en fp32, unos 103 MB en fp16/bf16 y unos 52 MB en int8. Sumando activaciones para dos imágenes de 480x640 y el estado de 6 dimensiones, el consumo total se mantiene muy por debajo de 2 GB en fp32. Estas cifras son cálculos a partir del recuento de parámetros, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria libre es suficiente en la práctica; modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 no suponen ninguna restricción por tamaño. La limitación real es la latencia, no la capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, e incluso es plausible su ejecución en CPU, aunque no se documentan cifras de latencia para ese caso.
- Opciones de despliegue: la vía documentada es LeRobot mediante `lerobot-rollout` con `--policy.path=DecisionFacts/Physical_AI_SO101_Cup_Nesting_ACT_Policy_v2`. Otros runtimes (ONNX Runtime, TensorRT, vLLM, TGI, llama.cpp) no están documentados ni tienen sentido directo para este tipo de política, salvo una eventual exportación a ONNX que el repositorio no describe.
- Latencia y throughput: no disponibles. Como referencia de contexto, el entrenamiento se realizó con datos capturados a 30 FPS, lo que fija un presupuesto de 33 ms por ciclo de control en caso de inferencia paso a paso; el uso de chunks de acciones relaja ese requisito, pero el repositorio no publica latencias reales.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de fuentes públicas generales y no de la información proporcionada para esta ficha; se incluyen solo como orientación de categoría.

| Modelo | Tipo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DecisionFacts/Physical_AI_SO101_Cup_Nesting_ACT_Policy_v2 | ACT (transformer + CVAE) | 51,7 M | Nesting de vasos con SO-101 | apache-2.0 | Hugging Face, libreria lerobot |
| ACT (implementacion de referencia, arXiv:2304.13705) | ACT | no disponible en esta ficha | Manipulacion bimanual de precision | no disponible | Repositorio del paper (no es un checkpoint publicado) |
| Diffusion Policy (Chi et al.) | Politica de difusion | no disponible | Manipulacion visomotora generica | no disponible | Implementaciones de referencia publicas |
| SmolVLA (Hugging Face) | VLA (vision-lenguaje-accion) | del orden de cientos de millones (dato aproximado de fuentes publicas) | Manipulacion guiada por lenguaje | no disponible en esta ficha | Hugging Face, libreria lerobot |

Diferencias relevantes: este modelo es una política de una sola tarea, sin entrada de lenguaje, frente a los modelos VLA que aceptan instrucciones en lenguaje natural y generalizan a múltiples tareas. Su ventaja es el tamaño reducido y la simplicidad de despliegue; su desventaja, la ausencia de generalización fuera de la tarea y del montaje para los que fue entrenado.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("Pick up the empty solo cup and nest it inside the other static cup"). No se espera que generalice a otros objetos, tareas o disposiciones sin reentrenamiento.
- Ausencia de resultados de evaluación: no se han publicado tasas de éxito en robot real, ni número de ensayos, ni condiciones de prueba. No es posible afirmar qué fiabilidad tiene en producción.
- Dependencia del montaje: las observaciones incluyen dos cámaras concretas (cam_front, cam_top) a 480x640. Cambiar su posición, resolución o calibración degradará el rendimiento, ya que la política no ha visto esas variaciones.
- Sensibilidad a condiciones de captura: iluminación, fondo, posición inicial de los objetos y características del robot afectan al comportamiento; el dataset de 200 episodios es reducido para cubrir variabilidad.
- Sesgos de datos de teleoperación: el comportamiento imita el estilo de las demostraciones humanas, incluidas sus ineficiencias y posibles compensaciones de calibración del robot usado al grabar.
- Riesgo de fallo físico sin garantías de seguridad: no incorpora capas de seguridad, detección de colisiones ni parada ante situaciones anómalas. En un entorno real debe desplegarse con límites de fuerza, paradas de emergencia y supervisión.
- Limitaciones de idioma y lenguaje: no aplica como modelo de lenguaje; no entiende instrucciones en lenguaje natural, solo reproduce la tarea aprendida.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se distribuye sin garantías. Al reutilizar el modelo conviene citar el paper de ACT y LeRobot según indica la model card.
- Caveat de producción: al ser una política de imitación de una tarea y con 0 descargas y 0 likes en el momento de redactar esta ficha, no existe evidencia de uso en producción ni comunidad que haya validado su comportamiento fuera del entorno de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DecisionFacts/Physical_AI_SO101_Cup_Nesting_ACT_Policy_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/DecisionFacts/Physical_AI_SO101_Cup_Nesting_Task
- Visualizador del dataset en LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=DecisionFacts/Physical_AI_SO101_Cup_Nesting_Task
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
