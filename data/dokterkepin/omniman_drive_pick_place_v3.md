# dokterkepin/omniman_drive_pick_place_v3

## Resumen

El modelo `dokterkepin/omniman_drive_pick_place_v3` es una política de aprendizaje por imitación entrenada con el método Action Chunking with Transformers (ACT) para controlar un manipulador móvil omnidireccional. Desarrollado por dokterkepin, el modelo forma parte del ecosistema LeRobot de HuggingFace y está diseñado para ejecutar tareas de recogida y colocación (pick and place) mientras la base móvil se desplaza. El sistema robótico asociado, documentado en el repositorio `nxp_omniman_ws`, emplea una base con ruedas mecanum, un brazo de 6 grados de libertad con pinza, motores CyberGear y Dynamixel, y un RPLidar para navegación.

El modelo se basa en la arquitectura ACT, publicada en el paper arXiv:2304.13705, que predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la coherencia y suavidad de los movimientos. Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero diseñado para inferencia en tiempo real en sistemas robóticos embarcados. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. Su relevancia radica en que demuestra la aplicación práctica de transformadores en robótica de manipulación móvil con un pipeline de entrenamiento accesible mediante LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.670.711 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acciones roboticas, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que utiliza un transformer encoder-decoder para predecir secuencias de acciones futuras (chunks) en lugar de una unica accion. Esta formulacion reduce el error de acumulacion tipico de las politicas autoregresivas paso a paso y produce movimientos mas suaves y coherentes. El entrenamiento se realiza con datos teleoperados, en este caso del dataset `dokterkepin/omniman_drive_pick_place`, que contiene demostraciones de tareas de recogida y colocacion con desplazamiento de la base.

El entrenamiento se realizo con el framework LeRobot, que gestiona el dataset, el entrenamiento distribuido y el registro de experimentos. La politica se entrena con el objetivo de minimizar la diferencia entre las acciones predichas y las acciones demostradas, tipicamente con una funcion de perdida L1 o MSE sobre los chunks de accion. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de refinamiento adicionales como RLHF o DPO, que no son habituales en este tipo de politicas roboticas.

## Capacidades

- Control de manipulador movil: genera comandos de articulacion para un brazo de 6 GDL con pinza y comandos de velocidad para una base mecanum omnidireccional.
- Tareas de pick and place: ejecuta secuencias completas de aproximacion, agarre, levantamiento, desplazamiento y colocacion de objetos.
- Aprendizaje por imitacion: reproduce comportamientos teleoperados con alta fidelidad, incluyendo variaciones en la posicion inicial del robot.
- Integracion con ROS 2: el modelo se despliega en un sistema ROS 2 Humble, lo que permite su integracion con nodos de navegacion, SLAM y planificacion.
- Inferencia en tiempo real: con solo 51,7 millones de parametros, es adecuado para ejecucion en GPU embarcadas o de bajo consumo.
- Sin capacidades de lenguaje: el modelo no procesa texto ni entiende instrucciones verbales; las tareas se definen por el contexto del episodio.

## Casos de uso

- Automatizacion de almacenes: el robot puede transportar objetos entre estaciones de trabajo en un almacen, navegando con SLAM y ejecutando pick and place en ubicaciones fijas o variables.
- Lineas de montaje flexibles: la capacidad de desplazamiento omnidireccional permite reposicionar el robot rapidamente entre diferentes estaciones de ensamblaje sin necesidad de cintas transportadoras.
- Investigacion en robotica: el modelo sirve como punto de partida para experimentos con ACT en manipuladores moviles, permitiendo comparar variaciones de arquitectura o datos de entrenamiento.
- Logistica hospitalaria: transporte de medicamentos o materiales entre plantas, donde la navegacion en espacios estrechos se beneficia de la base mecanum.
- Agricultura de precision: recogida selectiva de frutas u hortalizas en invernaderos, donde el robot se desplaza entre hileras y ejecuta agarres precisos.
- Demostraciones educativas: el pipeline de LeRobot y el hardware documentado en el repositorio de GitHub facilitan la reproduccion del sistema en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de tasas de exito en tareas de pick and place, ni comparaciones con otras politicas como Diffusion Policy o VQ-BeT. El autor no ha documentado metricas de rendimiento en el repositorio de GitHub ni en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 51,7 millones de parametros, la inferencia en FP32 requiere aproximadamente 200 MB de VRAM. Con cuantizacion a FP16 o INT8, el requisito se reduce a unos 100 MB.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2 GB de VRAM es suficiente. Se puede ejecutar en Jetson Orin Nano, Jetson Xavier NX, RTX 2050 o superiores. Para entrenamiento, se recomienda una GPU con 8 GB o mas.
- Compatibilidad con GPU de consumo: si, el modelo cabe en cualquier GPU consumer moderna, incluyendo las integradas de gama alta.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion e inferencia. Tambien se puede exportar a ONNX o TensorRT para optimizacion en edge. La integracion con ROS 2 se realiza a traves del repositorio `nxp_omniman_ws`.
- Latencia y throughput: no se dispone de datos publicados. Para un modelo de este tamano, se espera una latencia de inferencia inferior a 10 ms en GPU modernas, lo que permite control a 100 Hz o mas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Tarea | Licencia |
|---|---|---|---|---|
| dokterkepin/omniman_drive_pick_place_v3 | 51,7 M | ACT | Pick and place movil | Apache 2.0 |
| lerobot/act_aloha_straight_insert | ~30 M | ACT | Insercion de objetos | Apache 2.0 |
| lerobot/diffusion_policy_ucsd_pick_place | ~90 M | Diffusion Policy | Pick and place estatico | Apache 2.0 |

La comparativa se limita a modelos del ecosistema LeRobot, que son los mas similares en arquitectura y proposito. No se dispone de datos de rendimiento publicados para establecer una comparacion cuantitativa. La principal diferencia de este modelo es que incorpora una base movil omnidireccional, mientras que los otros se centran en manipuladores fijos.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo hereda los sesgos y limitaciones de las demostraciones teleoperadas. Si el operador humano tuvo una tecnica suboptima, el modelo la replicara.
- Generalizacion limitada: al ser un modelo de aprendizaje por imitacion, no generaliza bien a configuraciones de objetos o posiciones muy diferentes a las del dataset de entrenamiento.
- Riesgo de alucinacion motora: en estados fuera de distribucion, el modelo puede generar comandos de articulacion invalidos o peligrosos. Es imprescindible implementar limites de seguridad y validacion de movimientos.
- Sin robustez a perturbaciones: el modelo no esta entrenado para reaccionar ante empujones, deslizamientos de objetos o fallos de agarre. Un bucle de control clasico debe supervisar la ejecucion.
- Dependencia del hardware: los comandos de salida estan calibrados para el robot Omniman concreto (motores CyberGear, Dynamixel, base mecanum). Transferirlo a otro hardware requiere recalibracion y posible reentrenamiento.
- Sin soporte de lenguaje: el modelo no interpreta instrucciones verbales ni escritas; la tarea se fija por el episodio de evaluacion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantias. El autor no ofrece soporte ni responsabilidad por danos derivados de su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dokterkepin/omniman_drive_pick_place_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/dokterkepin/omniman_drive_pick_place
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio del robot Omniman: https://github.com/dokterkepin/nxp_omniman_ws
- Herramientas fisicas de IA del robot: https://github.com/dokterkepin/nxp_omniman_ws/tree/main/physical_ai_tools/physical_ai_tools
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
