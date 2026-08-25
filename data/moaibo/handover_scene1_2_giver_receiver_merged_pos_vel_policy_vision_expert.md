# MoAIBo/handover_scene1_2_giver_receiver_merged_pos_vel_policy_vision_expert

## Resumen

Este modelo es una política de control robótico basada en SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face. Ha sido fine-tuneado por MoAIBo sobre el modelo base `lerobot/smolvla_base` para ejecutar tareas de handover (entrega de objetos) entre dos robots móviles TurtleBot4 (modelo `so101_tb4`). El modelo procesa imágenes de cinco cámaras (izquierda, derecha, muñeca, D455 y profundidad) junto con el estado del robot (11 dimensiones) y genera acciones de 8 dimensiones que controlan la manipulación y el movimiento.

Con 450 millones de parámetros, este VLA está diseñado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios de robótica y desarrolladores que no disponen de infraestructura de alto rendimiento. El fine-tuning se realizó sobre un dataset propio de 338 episodios (354.884 frames a 30 FPS) que cubre escenarios de entrega de objetos como espátulas, cepillos, destornilladores y botellas entre dos robots. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador de vision, un modelo de lenguaje y un decodificador de acciones. Su arquitectura se basa en transformers y está optimizada para reducir el coste computacional manteniendo un rendimiento competitivo en tareas de manipulacion robotica. El modelo base `lerobot/smolvla_base` fue preentrenado en una amplia variedad de datos roboticos y linguisticos, y este fine-tuning lo adapta especificamente a la tarea de handover entre dos robots.

El entrenamiento se realizo con el framework LeRobot (version 0.6.0) durante 50.000 pasos, con un batch size de 13, optimizador AdamW y una tasa de aprendizaje de 0.0001. El dataset de entrenamiento contiene 338 episodios con 354.884 frames a 30 FPS, capturados con cinco camaras. Las tareas estan descritas en lenguaje natural, por ejemplo: "Robot0 (Giver) se acerca a Robot1, presenta y entrega la espatula negra, suelta la pinza una vez que Robot1 la ha agarrado de forma segura, y luego cada uno sigue su camino". No se menciona el uso de RLHF o DPO; se trata de un entrenamiento supervisado de imitacion.

## Capacidades

- Control robotico de manipulacion: genera acciones de 8 dimensiones (posicion, orientacion, velocidad, etc.) para el brazo y la base del robot.
- Percepcion multimodal: procesa simultaneamente cinco flujos de imagen (RGB izquierda, derecha, muñeca, D455 y profundidad) a resolucion 360x640.
- Comprension de instrucciones en lenguaje natural: las tareas se especifican mediante texto y el modelo las traduce en secuencias de acciones.
- Ejecucion de handover entre dos robots: distingue los roles de "giver" (entrega) y "receiver" (recibe) y coordina la transferencia segura de objetos.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de politicas de Hugging Face.
- Eficiencia computacional: al ser un modelo compacto, puede ejecutarse en GPUs de consumo, lo que facilita su uso en laboratorios con recursos limitados.

## Casos de uso

- Automatizacion de lineas de montaje: el modelo puede coordinar la entrega de herramientas o piezas entre dos estaciones roboticas, reduciendo la intervencion humana en entornos industriales.
- Logistica y almacenes: robots moviles equipados con este policy pueden transferir paquetes o contenedores entre si, optimizando flujos de trabajo en centros de distribucion.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de VLA en tareas de manipulacion colaborativa, gracias a su licencia abierta y su tamaño manejable.
- Desarrollo de robots de asistencia domestica: aunque entrenado con objetos especificos, el modelo puede adaptarse mediante fine-tuning a tareas de entrega de objetos cotidianos entre robots o entre robot y humano.
- Pruebas de concepto en robotica de doble brazo: el escenario de dos robots (giver y receiver) permite validar algoritmos de coordinacion y sincronizacion en entornos controlados.
- Educacion y formacion: al ser un modelo abierto y ligero, es adecuado para cursos de robotica y vision por computador donde los estudiantes pueden desplegarlo en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se evalua implicitamente mediante la tasa de exito en las tareas de handover, pero no se proporcionan metricas cuantitativas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 450 millones de parametros, en precision FP16 el peso del modelo ocupa aproximadamente 900 MB, pero el procesamiento de cinco imagenes simultaneas y el overhead del transformer pueden requerir entre 2 y 4 GB de VRAM en funcion de la implementacion.
- GPU recomendadas: no se especifican, pero por el tamano del modelo, una GPU de consumo como RTX 3060 (12 GB) o superior deberia ser suficiente. No se ha confirmado oficialmente.
- Compatibilidad con consumer GPU: probablemente si, dado el diseno de SmolVLA orientado a hardware de consumo, pero no hay datos oficiales.
- Opciones de despliegue: el modelo se integra con LeRobot, que proporciona herramientas de rollout y entrenamiento. No se mencionan otros motores de inferencia como vLLM o TGI, ya que no es un modelo de lenguaje generativo clasico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (VLA para handover robotico). El modelo base `lerobot/smolvla_base` es la referencia inmediata, pero no se proporcionan datos de rendimiento relativos. Se recomienda consultar el paper de SmolVLA (arxiv:2506.01844) para comparaciones con otros VLA como OpenVLA o RT-2, aunque esos datos no estan incluidos en la informacion disponible.

## Limitaciones y advertencias

- Especializacion limitada: el modelo fue entrenado exclusivamente para tareas de handover con cuatro objetos concretos (espatula, cepillo, destornillador y botella). No generalizara a otros objetos o escenarios sin un fine-tuning adicional.
- Dependencia del hardware: las entradas de camara y el estado del robot estan calibrados para el robot `so101_tb4` (TurtleBot4). Su uso en otros robots requerira adaptaciones en la configuracion de sensores y en el espacio de acciones.
- Riesgo de sobreajuste: con solo 338 episodios, el modelo puede memorizar trayectorias especificas del dataset y fallar ante variaciones en la posicion inicial, iluminacion o disposicion de los objetos.
- Sin evaluacion de sesgos: al ser un modelo de control, no se han analizado sesgos sociales o linguisticos, pero las instrucciones en ingles podrian limitar su uso en entornos no angloparlantes.
- Sin garantias de seguridad: el despliegue en robots fisicos requiere supervision humana y medidas de seguridad, ya que el modelo no ha sido certificado para operacion autonoma en entornos no controlados.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario es responsable de cumplir con las normativas de seguridad aplicables en robotica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MoAIBo/handover_scene1_2_giver_receiver_merged_pos_vel_policy_vision_expert
- Dataset de entrenamiento: https://huggingface.co/datasets/MoAIBo/handover_scene1_2_giver_receiver_merged_pos_vel
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
