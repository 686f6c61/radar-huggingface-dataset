# hayoonsong/stationary_transfer_cube_act

## Resumen

El modelo `hayoonsong/stationary_transfer_cube_act` es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario hayoonsong y publicada en Hugging Face bajo la licencia Apache-2.0. ACT, propuesto en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica. El modelo ha sido entrenado con el framework LeRobot sobre el dataset `jwhong1209/stationary_transfer_cube`, que contiene demostraciones teleoperadas de una tarea de transferencia de un cubo estacionario.

Con 51.685.006 parámetros, es un modelo compacto diseñado específicamente para control robótico, no para generación de lenguaje. Su relevancia radica en que demuestra cómo entrenar y publicar políticas de imitación listas para usar con LeRobot, facilitando la reproducibilidad y el intercambio de modelos en la comunidad de robótica open source. La arquitectura Transformer subyacente procesa observaciones visuales y de estado para generar comandos de actuación, aunque no se especifican detalles sobre la longitud de contexto ni el tipo de observaciones utilizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de control robotico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que utiliza un Transformer para predecir un chunk de acciones futuras (tipicamente 10-100 pasos) a partir de observaciones actuales. A diferencia de los politicas que predicen una sola accion, el chunking reduce la acumulacion de errores y permite movimientos mas suaves y coordinados. El modelo fue entrenado con el framework LeRobot, que gestiona el dataset, el entrenamiento y la evaluacion. El dataset `jwhong1209/stationary_transfer_cube` contiene episodios teleoperados de una tarea de transferencia de un cubo, probablemente con un brazo robotico SO-100 (segun el comando de evaluacion en la model card). No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Generacion de comandos de actuacion para control robotico: el modelo produce secuencias de acciones (posiciones, velocidades o pares) para ejecutar la tarea de transferencia de cubo.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones humanas teleoperadas.
- Control de bajo nivel: integrable en sistemas de robotica con LeRobot, que soporta robots como SO-100 y otros brazos.
- No tiene capacidades de lenguaje natural, vision general, tool calling ni razonamiento simbolico; su funcion es exclusivamente motora.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos controlados: el modelo puede transferir un cubo de una posicion a otra, util en lineas de ensamblaje o laboratorios de investigacion.
- Prototipado rapido de politicas de imitacion: investigadores pueden clonar el repositorio y adaptarlo a nuevas tareas con pocos datos, gracias a la integracion con LeRobot.
- Evaluacion de algoritmos de aprendizaje por imitacion: sirve como punto de partida para comparar ACT con otros metodos (pi0, diffusion policies) en la misma tarea.
- Educacion en robotica: permite a estudiantes ejecutar y modificar una politica real sin necesidad de entrenar desde cero, usando el comando `lerobot-record` para evaluar.
- Desarrollo de sistemas de manipulacion bimanual: aunque la tarea es simple, la arquitectura ACT es escalable a tareas mas complejas, y este modelo puede servir como base.
- Integracion en pipelines de robotica con ROS o similares: al ser un modelo safetensors, puede cargarse con PyTorch y conectarse a controladores de robot existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito, tasas de acierto ni comparaciones con otros modelos. Se recomienda consultar el dataset asociado o ejecutar una evaluacion local con LeRobot para obtener datos de rendimiento.

## Requisitos de hardware

- VRAM estimada: al tener 51,7 millones de parametros, la inferencia requiere menos de 1 GB de VRAM en precision FP32 (aproximadamente 207 MB de pesos). Cualquier GPU moderna con al menos 2 GB es suficiente.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (GTX 1050 Ti o superior) o incluso CPU para inferencia en tiempo real, dado el tamano reducido.
- Cabe en GPUs de consumo: si, en practicamente todas las tarjetas actuales, incluidas las integradas de gama alta.
- Opciones de despliegue: LeRobot (framework oficial), PyTorch directo, o exportacion a ONNX para entornos de produccion. No es compatible con vLLM ni llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles, pero por el tamano se espera una inferencia en milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. El autor tambien publico `hayoonsong/stationary_transfer_cube_pi0_v3`, que utiliza la arquitectura pi0 (un modelo de vision-lenguaje-accion), pero no se conocen sus parametros ni rendimiento. En general, ACT se compara con metodos como Diffusion Policy o Behavior Transformers, pero sin datos de este entrenamiento especifico no es posible establecer una tabla comparativa.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado para una tarea concreta (transferencia de cubo estacionario) y no generaliza a otras tareas sin reentrenamiento.
- Dependencia del dataset: la calidad de la politica depende de la calidad y variabilidad de las demostraciones en `jwhong1209/stationary_transfer_cube`; si el dataset es pequeno o sesgado, el modelo puede fallar en condiciones no vistas.
- Sin informacion sobre observaciones: no se especifica si usa vision (camaras) o solo estado del robot, lo que limita la evaluacion de su robustez.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo de texto.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se debe mantener el aviso de copyright y atribucion.
- No hay garantias de seguridad: en robotica fisica, una politica mal entrenada puede causar danos; se recomienda evaluar en simulacion antes de despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hayoonsong/stationary_transfer_cube_act
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset utilizado: https://huggingface.co/datasets/jwhong1209/stationary_transfer_cube
- Modelo relacionado (pi0): https://huggingface.co/hayoonsong/stationary_transfer_cube_pi0_v3
