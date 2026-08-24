# Nicolasrdrgz/b601_act_mc4_aug_rel_pos_100k

## Resumen

El modelo `Nicolasrdrgz/b601_act_mc4_aug_rel_pos_100k` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido entrenado y publicado mediante el framework LeRobot de HuggingFace, y está diseñado para controlar un robot de tipo `mason_1` a partir de observaciones visuales de dos cámaras (gripper y escena) y un vector de estado de 7 dimensiones.

El modelo resuelve el problema del control robótico por imitación a partir de datos teleoperados, logrando tasas de éxito altas en tareas de manipulación gracias a la predicción de chunks de acción que reducen la propagación de errores. Con 51,67 millones de parámetros, es una política compacta que puede ejecutarse en hardware modesto, aunque requiere el robot físico y las cámaras correspondientes para su despliegue real.

La relevancia actual de este modelo radica en su integración con el ecosistema LeRobot, que estandariza el entrenamiento, evaluación y despliegue de políticas robóticas. Está entrenado sobre un dataset propio de 500 episodios y 352.745 frames a 30 FPS, con una única tarea etiquetada como "0". No se han publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - Transformer encoder-decoder |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer encoder-decoder para predecir un chunk de acciones futuras (por ejemplo, 10 o 50 pasos) a partir de observaciones actuales. Esta predicción por chunks reduce el error de compounding típico de las políticas paso a paso y permite un control más suave y robusto. El modelo consume dos imágenes de 480x640 píxeles (cámara de pinza y cámara de escena) y un vector de estado de 7 dimensiones, y produce un vector de acción de 7 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `Nicolasrdrgz/b601_bench_mc4_aug_rel_pos`, que contiene 500 episodios y 352.745 frames a 30 FPS. La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW, learning rate de 1e-5 y semilla 1000. No se especifica el uso de RLHF, DPO u otras técnicas de refinamiento; se trata de un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones (chunks) para manipulación de objetos.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (gripper y scene) con resolución 480x640.
- Integración con estado del robot: utiliza un vector de estado de 7 dimensiones (posiciones articulares o cartesianas).
- Generación de acciones de 7 grados de libertad, adecuadas para brazos robóticos tipo `mason_1`.
- Compatible con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante comandos CLI estandarizados.
- No soporta tool calling, agentes, razonamiento simbólico ni procesamiento de lenguaje natural, al ser un modelo puramente robótico.

## Casos de uso

- Manipulación de objetos en entornos controlados: el modelo puede ejecutar tareas de pick-and-place o reordenamiento de piezas sobre una mesa, usando las dos cámaras para localizar el objeto y la pinza para agarrarlo.
- Automatización de procesos repetitivos en laboratorio: al estar entrenado con teleoperación, puede replicar trayectorias de un operador humano en tareas como ensamblaje de componentes pequeños o clasificación de piezas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto de la predicción por chunks, el número de episodios o la arquitectura ACT en robots de bajo coste.
- Benchmarking de políticas robóticas: al estar publicado en HuggingFace con el formato LeRobot, puede usarse como referencia para comparar con otras políticas entrenadas sobre el mismo dataset o robot.
- Desarrollo de sistemas de control con realimentación visual: su capacidad de procesar dos cámaras simultáneamente lo hace adecuado para tareas que requieren coordinación ojo-mano, como insertar una pieza en un hueco.
- Formación y demostraciones educativas: permite a estudiantes y desarrolladores ejecutar una política real en un robot `mason_1` sin necesidad de entrenar desde cero, usando los comandos de rollout de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, precisión de agarre ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada: con 51,67 millones de parámetros, el modelo ocupa aproximadamente 207 MB en fp32 y 103 MB en fp16. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas modernas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 1060 o superior, RTX 3060, RTX 4090, A100, etc.). No se requieren GPUs de datacenter para inferencia.
- Compatibilidad con consumer GPU: sí, el modelo es ligero y puede ejecutarse en GPUs de consumo como RTX 3060 o incluso en CPU para pruebas de baja frecuencia, aunque la inferencia en tiempo real requiere GPU.
- Opciones de despliegue: LeRobot ofrece comandos `lerobot-rollout` para ejecutar la política en el robot. También puede cargarse mediante la API de LeRobot en Python para integración personalizada.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño del modelo y la resolución de entrada (dos imágenes 480x640), se espera una inferencia en tiempo real (mayor de 30 FPS) en GPUs modernas, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de información pública sobre modelos comparables entrenados sobre el mismo dataset o robot. ACT es un método conocido en la literatura de robótica, pero no hay datos de otras políticas (p. ej., Diffusion Policy, VQ-BeT) aplicadas a este mismo entorno `mason_1` con el dataset `b601_bench_mc4_aug_rel_pos`. Por tanto, no es posible realizar una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real: la model card no reporta tasas de éxito, por lo que el rendimiento efectivo es desconocido.
- Dependencia del hardware específico: la política está entrenada para el robot `mason_1` y las cámaras `gripper` y `scene`. Su transferencia a otros robots o configuraciones de cámara requeriría reentrenamiento.
- Dataset limitado a una única tarea: el dataset contiene una sola tarea etiquetada como "0", lo que limita la generalización a otras tareas.
- Riesgo de sobreajuste: con 500 episodios y 100.000 pasos de entrenamiento, existe la posibilidad de que la política memorice las trayectorias del dataset en lugar de generalizar a variaciones de posición, iluminación o distracciones.
- Sin soporte de lenguaje o razonamiento: no es un modelo multimodal en el sentido de procesar texto o audio; solo procesa imágenes y estado.
- Licencia apache-2.0: permite uso comercial y modificación, pero el usuario debe verificar que el robot y el dataset asociado no tengan restricciones adicionales.
- No se especifican sesgos conocidos, pero al ser un modelo de imitación, hereda los sesgos de los datos de teleoperación (p. ej., preferencias del operador en la trayectoria).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nicolasrdrgz/b601_act_mc4_aug_rel_pos_100k
- Dataset de entrenamiento: https://huggingface.co/datasets/Nicolasrdrgz/b601_bench_mc4_aug_rel_pos
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Cheat-sheet de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
