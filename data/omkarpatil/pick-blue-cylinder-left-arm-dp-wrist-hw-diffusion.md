# omkarpatil/pick-blue-cylinder-left-arm-dp-wrist-hw-diffusion

## Resumen

Este modelo es una Diffusion Policy entrenada con la libreria LeRobot (v0.6.1) para la tarea de manipulacion robotica "pick-blue-cylinder-left-arm" sobre el robot ROBOTIS FFW SG2 Rev1. Fue desarrollado por Omkar Patil y publicado en HuggingFace con licencia Apache 2.0. El modelo recibe imagenes de dos camaras de muñeca (izquierda y derecha) junto con el estado del robot y genera acciones continuas de control mediante un proceso de denoising difuso (DDPM).

La relevancia de este modelo reside en su esquema de normalizacion "hardware-derived": en lugar de derivar los limites de normalizacion de los datos de entrenamiento, los obtiene de los limites articulares del URDF del robot, con un pad del 75% en las articulaciones de gripper, cabeza y elevacion. Esto permite que el modelo sea componible con otras politicas del mismo "grupo de composicion" sin necesidad de reentrenar al anadir nuevas demostraciones. El modelo tiene aproximadamente 274 millones de parametros y un peso de repositorio de 1,1 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (scheduler DDPM) |
| Parametros totales | 274.492.048 (safetensors); 274.472.400 segun tabla de entrenamiento de la model card |
| Parametros activos | no aplica (no es un modelo Mixture-of-Experts) |
| Longitud de contexto | no disponible (modelo de robotica; no es un LLM con ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LeRobot / PyTorch) |

## Arquitectura y entrenamiento

El modelo implementa una Diffusion Policy con scheduler DDPM, tal como se configura por defecto en LeRobot 0.6.1 con el fork `lerobot-cyclo` de ROBOTIS. El entrenamiento se realizo durante 100.000 pasos con un batch size de 8, learning rate de 1e-4, betas (0.95, 0.999) y weight decay de 1e-6. La tasa de captura de datos es de 15 fps y la perdida final de entrenamiento alcanzo 0.001.

La innovacion principal es el esquema de normalizacion del "grupo de composicion B": los limites se derivan del URDF del robot (limites `<limit lower/upper>` de cada articulacion), con un pad del 75% en grippers, cabeza y elevacion, y valores fijos de +/-1.0 para las tres dimensiones de odometria. Este transform no cambia al anadir datos, por lo que las politicas del grupo (pick-blue-cylinder-left-arm, pick-blue-cylinder-right-arm y blue-cylinder-handover) son componibles entre si siempre que compartan el mismo hash de normalizacion (`1184068d20ae`). El modelo usa solo las camaras de muñeca `cam_left_wrist` y `cam_right_wrist` a resolucion nativa (424x240), ya que la variante de tres camaras requeria re-encodificar todas las vistas a un tamano comun. El dataset se convirtio al formato LeRobot v3.0 desde v2.1, restaurando las estadisticas agrupadas tras la conversion.

## Capacidades

- Manipulacion robotica de precision: tarea de recoger (pick) un cilindro azul con el brazo izquierdo del robot ROBOTIS FFW SG2 Rev1.
- Control de acciones continuas mediante Diffusion Policy: genera secuencias de acciones de control articulares a traves de un proceso de denoising.
- Percepcion visual desde dos camaras de muñeca (izquierda y derecha) a resolucion nativa 424x240.
- Procesamiento de estado del robot: lee las posiciones articulares y las tres dimensiones de odometria como entrada adicional a las imagenes.
- Componibilidad entre politicas del mismo grupo de composicion: puede combinarse con las politicas de la tarea de brazo derecho y de handover sin reentrenamiento, siempre que compartan el hash de normalizacion `1184068d20ae`.
- Compatibilidad con estadisticas de normalizacion multi-arquitectura: los mismos limites hardware pueden ser leidos por GR00T (percentiles q01/q99), Diffusion Policy (min/max) y SmolVLA (mean/std), aunque la composicion cruzada entre arquitecturas no esta soportada.
- No incluye capacidades de lenguaje, vision general, generacion de texto ni tool calling: es un modelo puramente motor para control robotico.

## Casos de uso

- Automatizacion de pick-and-place en linea de montaje: el modelo puede integrarse en una celda robotica para recoger cilindros azules de una posicion conocida y depositarlos en otra, operando a 15 fps con las camaras de muñeca.
- Investigacion en robotica de manipulacion: sirve como baseline de Diffusion Policy entrenada con normalizacion hardware-derived, comparable con otras politicas del mismo robot y tarea.
- Composicion de politicas para tareas multi-etapa: al compartir estadisticas de normalizacion con las tareas de brazo derecho y handover, permite construir pipelines donde un robot alterna entre recoger con un brazo, pasar el objeto y depositarlo, sin reentrenar cada politica.
- Validacion de esquemas de normalizacion agnosticos a los datos: el modelo demuestra que los limites derivados del URDF eliminan la dependencia de las estadisticas del dataset, lo que resulta util para equipos que anaden demostraciones incrementalmente.
- Educacion y formacion en robotica: el repositorio incluye el dataset en formato LeRobot v3.0 y la configuracion completa de entrenamiento, permitiendo reproducir el experimento en un ROBOTIS FFW SG2 Rev1 o en simulacion.
- Prototipado rapido de tareas de manipulacion en entornos de investigacion: al ser una Diffusion Policy estandar de LeRobot, puede adaptarse a otras tareas de pick-and-place con cambios minimos en el dataset y la configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, etc.) en la informacion disponible, ya que se trata de un modelo de robotica y no de un LLM. La unica metrica reportada en la model card es la perdida final de entrenamiento: **0.001** tras 100.000 pasos. No hay datos de tasa de exito en tareas reales ni comparaciones con otras politicas en el mismo robot.

## Requisitos de hardware

- El repositorio pesa 1,1 GB, consistente con los ~274 millones de parametros en precision fp32 (aproximadamente 1,1 GB en memoria).
- Estimacion de VRAM para inferencia: entre 2 y 4 GB en fp32, y menos de 2 GB en fp16, lo que hace viable la ejecucion en GPU de consumo como RTX 3060, RTX 4060 o superiores. Esta es una estimacion tecnica basada en el tamano del modelo; no se han publicado requisitos oficiales.
- El entrenamiento requiere una GPU con suficiente memoria para un batch de 8 con dos secuencias de imagenes 424x240; una GPU con 16-24 GB (RTX 4090, A100) seria adecuada, aunque no se especifica oficialmente.
- Despliegue: el modelo se ejecuta con la libreria LeRobot sobre PyTorch con CUDA. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, que no aplican a modelos de robotica.
- La inferencia de una Diffusion Policy requiere multiples pasos de denoising (típicamente 10-50), por lo que la latencia dependera del numero de pasos configurado y del hardware. No se proporcionan datos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Camaras | Normalizacion | Componible con este modelo |
|---|---|---|---|---|---|
| omkarpatil/pick-blue-cylinder-left-arm-dp-wrist-hw-diffusion (este) | Diffusion Policy (DDPM) | ~274 M | 2x muñeca (424x240) | Hardware-derived (URDF, grupo B) | Si (mismo hash) |
| omkarpatil/ffw_sg2_pick-blue-cylinder-left-arm_groot-n1.7 | GR00T | no disponible | no disponible | Hardware-derived (percentiles q01/q99) | No (arquitecturas distintas) |
| Variante de 3 camaras del mismo policy (mencionada en model card) | Diffusion Policy | no disponible | 3x (cabeza + muñecas, re-encodificadas a tamano comun) | Hardware-derived (grupo B) | Si, si comparte hash |

La comparativa se basa en la informacion de la model card y del perfil del autor en HuggingFace. No hay datos publicados de rendimiento relativo entre estas variantes. La diferencia clave entre la variante de 3 camaras y la de solo muñecas es la resolucion uniforme: la de 3 camaras requeria re-encodificar todas las vistas a un tamano comun, mientras que la de muñecas mantiene la resolucion nativa.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea de recoger un cilindro azul con el brazo izquierdo; no generaliza a otros objetos, colores o configuraciones sin reentrenamiento.
- Solo utiliza camaras de muñeca; no incluye la camara de cabeza, lo que limita la percepcion del entorno a la proximidad del gripper.
- La composicion con otras politicas solo es valida si comparten el hash de normalizacion `1184068d20ae`; componer modelos con estadisticas distintas puede producir comportamientos incorrectos.
- No es posible componer esta Diffusion Policy con las politicas GR00T de las mismas tareas, aunque compartan el mismo archivo de estadisticas, porque consumen campos de normalizacion distintos.
- La normalizacion hardware-derived asume que los limites del URDF cubren el rango de movimiento real; el pad del 75% en grippers, cabeza y elevacion es una correccion manual que podria no ser adecuada para otros robots o tareas.
- Riesgo de alucinacion no aplica en el sentido de los LLM, pero la politica puede generar acciones fuera del espacio valido si los limites de normalizacion no se respetan en inferencia.
- No se han publicado evaluaciones en el robot real (tasa de exito, robustez a perturbaciones), por lo que el rendimiento en produccion es desconocido.
- El dataset de entrenamiento no es publico en el repositorio del modelo; el enlace al dataset de HuggingFace existe pero no se detalla su tamano ni composicion.
- El modelo tiene 0 descargas y 0 likes en el momento de la redaccion, lo que sugiere que es un experimento reciente sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/pick-blue-cylinder-left-arm-dp-wrist-hw-diffusion
- Dataset asociado: https://huggingface.co/datasets/omkarpatil/pick-blue-cylinder-left-arm
- Perfil del autor en HuggingFace: https://huggingface.co/omkarpatil
- Modelo GR00T de la misma tarea (variante alternativa): https://huggingface.co/omkarpatil/ffw_sg2_pick-blue-cylinder-left-arm_groot-n1.7
