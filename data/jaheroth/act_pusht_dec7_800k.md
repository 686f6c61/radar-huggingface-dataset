# jaheroth/act_pusht_dec7_800k

## Resumen

El modelo `jaheroth/act_pusht_dec7_800k` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot sobre el dataset PushT. ACT, propuesto en el paper arXiv:2304.13705, es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. El modelo ha sido desarrollado por el usuario jaheroth (Jacob H. Rothschild) y publicado en Hugging Face bajo licencia Apache 2.0.

Con 83,97 millones de parámetros y un tamaño de repositorio de 0,3 GB, este modelo representa un ejemplo práctico de entrenamiento de políticas robóticas con LeRobot, orientado a la tarea de empujar objetos (PushT). Su relevancia radica en que demuestra el flujo completo de entrenamiento, evaluación y despliegue de políticas de imitación en robótica, siendo útil para investigadores que quieran reproducir o adaptar estos métodos. No se trata de un modelo de lenguaje ni de visión general, sino de un modelo especializado en generar comandos de actuación para un robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 83.969.428 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (en ACT se usa una ventana de observacion, tipicamente 1-2 imagenes, pero no se especifica) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no aplica (modelo de robotica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, que combina un codificador de vision (tipicamente ResNet) con un transformer que genera secuencias de acciones de longitud fija (chunks). En lugar de predecir una sola accion por paso de tiempo, ACT predice un bloque de acciones futuras, lo que reduce la acumulacion de errores y mejora la suavidad del movimiento. El entrenamiento se realiza mediante aprendizaje por imitacion a partir de demostraciones teleoperadas, utilizando el dataset `lerobot/pusht` que contiene episodios de la tarea PushT (empujar una pieza a una posicion objetivo).

El modelo fue entrenado con el framework LeRobot, que proporciona herramientas de entrenamiento, evaluacion y despliegue. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO. El entrenamiento se realizo con una politica de tipo ACT, probablemente con configuraciones por defecto de LeRobot, aunque no se especifican hiperparametros concretos.

## Capacidades

- Generacion de secuencias de acciones para control robotico: el modelo predice chunks de acciones (posiciones o esfuerzos de los actuadores) a partir de observaciones visuales y del estado del robot.
- Aprendizaje por imitacion: es capaz de replicar comportamientos demostrados en el dataset PushT, alcanzando tasas de exito variables segun la configuracion de entrenamiento.
- Integracion con LeRobot: se puede cargar y ejecutar directamente con las herramientas de LeRobot para inferencia y evaluacion en robots reales o simulados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje o vision general fuera del ambito de la tarea de manipulacion.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el modelo sirve como punto de partida para estudiar el efecto del chunking de acciones, el tamano del dataset o los hiperparametros en el rendimiento de politicas ACT.
- Benchmark de politicas robotica: puede utilizarse como referencia para comparar con otras politicas entrenadas sobre el mismo dataset PushT, evaluando tasas de exito y robustez.
- Desarrollo de sistemas de manipulacion robotica: en entornos simulados o con robots SO-100, el modelo puede desplegarse para ejecutar la tarea de empujar objetos, sirviendo de base para tareas mas complejas.
- Reproduccion de experimentos: dado que el entrenamiento se realizo con LeRobot, los investigadores pueden reproducir el proceso y modificar variables para obtener nuevas variantes.
- Educacion en robotica: como ejemplo didactico de entrenamiento de politicas con transformers y aprendizaje por imitacion, util en cursos o talleres.
- Pruebas de despliegue en hardware: el modelo puede cargarse en un robot real (por ejemplo, SO-100) mediante el script de evaluacion de LeRobot, validando la transferencia de la politica a entornos fisicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como tasa de exito en PushT, MMLU, HumanEval u otros indicadores. El autor no ha proporcionado datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 83,97 millones de parametros con pesos en safetensors (0,3 GB), la inferencia es ligera. Se estima que cabe en GPUs con 4 GB de VRAM o menos, aunque no se ha verificado.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) es suficiente. Para entrenamiento, se recomienda al menos 8 GB de VRAM, aunque no se especifica.
- Compatibilidad con GPU de consumo: si, el modelo es lo suficientemente pequeno para ejecutarse en GPUs de consumo como RTX 3060 o RTX 4060.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion e inferencia. Tambien es posible exportar los pesos a otros formatos, aunque no se documenta.
- Latencia y throughput: no disponibles. Dado el tamano, se espera una latencia baja (del orden de milisegundos por prediccion) en hardware moderno, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa. Existen otros modelos del mismo autor en Hugging Face, como `jaheroth/act_pusht_chunk32_dec7` y `jaheroth/act_pusht_bs64_dec7`, que probablemente varian en hiperparametros (tamano de chunk, batch size), pero no se han publicado metricas comparativas. En la literatura, ACT se ha comparado con otros metodos de imitacion como Diffusion Policy o Behavior Cloning, pero no hay datos especificos para este checkpoint.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea PushT sobre el dataset `lerobot/pusht`. No generaliza a otras tareas de manipulacion sin reentrenamiento.
- No es un modelo de lenguaje ni de vision general; su salida son acciones de robot, no texto ni clasificaciones.
- No se han documentado sesgos especificos, pero al ser un modelo de robotica, los sesgos dependen de los datos de demostracion (por ejemplo, variaciones en la teleoperacion).
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero puede producir acciones incorrectas si las observaciones difieren de las del entrenamiento.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero se debe atribuir al autor y mantener el aviso de licencia.
- No se proporcionan garantias de rendimiento en entornos reales; se recomienda validar en simulacion antes de desplegar en hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_dec7_800k
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor en GitHub: https://github.com/JaHeRoth
