# MoAIBo/Handover_scene1_2_giver_receiver_merged_vel_pi05_policy

## Resumen

El modelo `MoAIBo/Handover_scene1_2_giver_receiver_merged_vel_pi05_policy` es un fine-tuning del modelo Vision-Language-Action (VLA) π₀.₅ (Pi05) de Physical Intelligence, adaptado mediante la librería LeRobot de Hugging Face. Está diseñado específicamente para la tarea de transferencia de objetos (handover) entre dos robots manipuladores, donde uno actúa como dador (giver) y otro como receptor (receiver). El modelo procesa observaciones visuales de cinco cámaras y un vector de estado de 8 dimensiones para generar acciones de control de 8 dimensiones en tiempo real.

Desarrollado por el usuario MoAIBo, este modelo resuelve el problema de la manipulación colaborativa entre robots, un escenario crítico en entornos industriales y logísticos. Su relevancia radica en que demuestra la viabilidad de fine-tuning de modelos VLA de gran escala (4.14 mil millones de parámetros) sobre conjuntos de datos específicos de interacción física, manteniendo la licencia Apache 2.0 que permite uso comercial. El entrenamiento se realizó sobre 338 episodios con 354.884 fotogramas a 30 FPS, abarcando tareas de entrega de objetos como espátulas, cepillos, destornilladores y botellas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) |
| Parametros totales | 4.143.404.816 (4,14 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de accion robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ es un modelo VLA desarrollado por Physical Intelligence que extiende la arquitectura π₀ para lograr generalizacion en entornos no vistos durante el entrenamiento. La implementacion en LeRobot se adapta del repositorio open-source OpenPI. El modelo combina un codificador visual (procesa imagenes de cinco camaras: `camera_left`, `camera_right`, `camera_wrist`, `camera_d455` y `depth`, todas con resolucion 360x640) con un modulo de lenguaje y un decodificador de acciones. La entrada incluye un vector de estado de 8 dimensiones y la salida es un vector de accion de 8 dimensiones.

El entrenamiento se realizo sobre el dataset `MoAIBo/Handover_scene1_2_giver_receiver_merged_vel`, que contiene 338 episodios y 354.884 fotogramas a 30 FPS. Las tareas consisten en instrucciones en lenguaje natural como "Approach Robot 1, present and handover black spatula, release grasp once Robot 1 has a secure grasp on it, then go your separate way" para el rol de dador, y equivalentes para el receptor. La configuracion de entrenamiento incluye 40.000 pasos, batch size de 8, optimizador AdamW con learning rate de 2,5e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un fine-tuning supervisado de imitacion.

## Capacidades

- Manipulacion robotica de objetos: el modelo controla un robot tipo `so101_tb4` para realizar tareas de agarre, presentacion y entrega de objetos.
- Handover colaborativo entre dos robots: coordina las acciones de dador y receptor para transferir objetos de forma segura.
- Percepcion multimodal: procesa simultaneamente cinco flujos de video (cuatro camaras RGB y una de profundidad) junto con el estado del robot.
- Seguimiento de instrucciones en lenguaje natural: interpreta comandos textuales que especifican el objeto, el rol y la secuencia de acciones.
- Control de bajo nivel: genera acciones continuas de 8 dimensiones (posicion, orientacion y agarre) a 30 FPS.
- Generalizacion limitada a la tarea entrenada: el modelo esta especializado en el escenario de handover con los objetos y configuraciones del dataset.

## Casos de uso

- Automatizacion de lineas de montaje: el modelo puede coordinar dos brazos roboticos para transferir piezas entre estaciones, reduciendo la intervencion humana en procesos de ensamblaje repetitivos.
- Logistica y almacenamiento: en centros de distribucion, un robot puede entregar paquetes o herramientas a otro robot que los coloca en ubicaciones especificas, optimizando el flujo de materiales.
- Investigacion en VLA: sirve como punto de partida para estudiar el fine-tuning de modelos VLA de gran escala en tareas de manipulacion colaborativa, comparando con el modelo base π₀.₅.
- Entrenamiento de politicas de imitacion: el dataset y el modelo pueden reutilizarse para experimentar con diferentes arquitecturas de codificadores visuales o estrategias de aumento de datos.
- Prototipado de sistemas robot-robot: permite validar rapidamente algoritmos de coordinacion entre dos manipuladores en entornos de laboratorio antes de escalar a produccion.
- Benchmark de generalizacion: al estar entrenado con multiples objetos (espátula, cepillo, destornillador, botella), puede evaluarse la capacidad del modelo para generalizar a nuevos objetos o variaciones de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye metricas de exito, tasa de finalizacion de tareas ni comparaciones con otros modelos en la model card. Se recomienda evaluar el rendimiento mediante pruebas de rollout en el robot real o en simulacion, midiendo la tasa de exito en la tarea de handover.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 4,14 B de parametros, se estima un consumo de aproximadamente 8,3 GB en precision fp16 y 16,6 GB en fp32, aunque el modelo se distribuye en safetensors sin cuantizacion.
- GPU recomendadas: no se especifican. Para inferencia en tiempo real con cinco camaras, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB o superior). Para entrenamiento, se requieren multiples GPUs con soporte FSDP (el modelo base se entrena con configuraciones de memoria distribuida).
- Compatibilidad con GPU de consumo: posible con cuantizacion (no disponible) o reduciendo la resolucion de las camaras, pero no esta garantizado.
- Opciones de despliegue: el modelo se ejecuta mediante la libreria LeRobot, usando el comando `lerobot-rollout` con el robot `so101_tb4`. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. La inferencia depende del hardware y de la resolucion de las camaras; el modelo fue entrenado para operar a 30 FPS.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos VLA en la informacion proporcionada. El modelo base π₀.₅ de Physical Intelligence es el punto de referencia, pero no se incluyen metricas de rendimiento. Otros VLA como SmolVLA (mencionado en resultados de busqueda) o OpenVLA podrian ser comparables, pero no hay datos publicados en esta ficha para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado exclusivamente para la tarea de handover con los objetos y configuraciones del dataset. No generaliza a otras tareas de manipulacion sin un nuevo fine-tuning.
- Dependencia del hardware: requiere un robot `so101_tb4` y cinco camaras especificas con resolucion 360x640. Cambios en la configuracion de camaras o en el robot pueden degradar el rendimiento.
- Riesgo de alucinacion de acciones: como todo modelo de imitacion, puede generar acciones incorrectas o inseguras en situaciones no vistas, especialmente si el objeto o el entorno difieren del entrenamiento.
- Sesgos del dataset: el dataset contiene 338 episodios con un numero limitado de objetos y escenarios; puede haber sesgos en la forma de agarre o en la secuencia de acciones.
- Sin soporte de lenguaje conversacional: a pesar de ser un VLA, no esta disenado para dialogar ni responder preguntas; su unica salida es el vector de accion.
- Requisitos de memoria: el modelo ocupa 16,6 GB en disco y requiere una GPU con suficiente VRAM para inferencia en tiempo real, lo que puede limitar su despliegue en hardware de bajo coste.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario debe cumplir con los terminos de la licencia y atribuir correctamente al autor original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MoAIBo/Handover_scene1_2_giver_receiver_merged_vel_pi05_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/MoAIBo/Handover_scene1_2_giver_receiver_merged_vel
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://www.openpi.net/english.html
- Documentacion de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MoAIBo/Handover_scene1_2_giver_receiver_merged_vel
