# Chaenn/act_policy_so101_cube_multitask_task_merged

## Resumen

El modelo `Chaenn/act_policy_so101_cube_multitask_task_merged` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el paper arxiv:2304.13705. Está desarrollado por el usuario Chaenn y entrenado con la librería LeRobot de Hugging Face, sobre un dataset de demostraciones teleoperadas de manipulación de cubos con el brazo robótico SO101.

El modelo resuelve el problema de generar secuencias de acciones para un robot manipulador, prediciendo "chunks" de acciones completas en lugar de pasos individuales, lo que mejora la suavidad y robustez del control. Es relevante para la comunidad de robótica porque ofrece una política de código abierto, pequeña y reentrenable, que puede integrarse fácilmente en el ecosistema LeRobot.

Con 51.670.662 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero apto para experimentación en hardware de bajo coste. La licencia Apache 2.0 permite su uso comercial y la adaptación a nuevas tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.670.662 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en un transformer encoder-decoder que predice secuencias de acciones ("action chunks") en lugar de un único paso de control. Esta aproximación reduce la acumulación de errores y permite ejecuciones más suaves en tareas de manipulación robótica. El modelo se entrena a partir de demostraciones teleoperadas registradas en el dataset `Chaenn/so101_cube_multitask_task_merged`, usando la librería LeRobot.

No se dispone de información sobre el número total de tokens, la composición exacta del dataset ni sobre procesos de RLHF o DPO, ya que se trata de un modelo de control robótico, no de un modelo de lenguaje. La innovación técnica principal es la predicción de chunks de acciones, una técnica que ha demostrado altas tasas de éxito en tareas de manipulación con datos de teleoperación.

## Capacidades

- Control de un brazo robótico SO101 para tareas de manipulación de cubos (agarre, colocación y movimientos multitarea).
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de modelado explícito del entorno.
- Predicción de secuencias de acciones (action chunking) para una ejecución más estable y suave en tiempo real.
- Entrenamiento, evaluación e inferencia mediante el framework LeRobot, con soporte para reentrenamiento sobre nuevos datasets.
- Política multitarea, entrenada sobre un dataset que combina diferentes tareas de manipulación de cubos.
- Sin capacidades de lenguaje natural, visión, tool calling ni razonamiento simbólico, al tratarse de un modelo puramente de control robótico.

## Casos de uso

- Manipulación de cubos en entornos de laboratorio: el modelo puede ejecutar secuencias de agarre y colocación aprendidas de teleoperación, lo que permite automatizar tareas repetitivas en bancos de pruebas robóticos.
- Investigación en aprendizaje por imitación: al ser un modelo abierto y ligero, es útil para comparar políticas ACT con otros métodos (como Diffusion Policy o CQL) sobre el mismo dataset.
- Evaluación de robustez en robótica: permite probar la tolerancia a variaciones de posición, iluminación o carga, midiendo el éxito de la política en episodios de prueba con LeRobot.
- Prototipado rápido de comportamientos robóticos: al tener solo 51,7 millones de parámetros, puede entrenarse y probarse en GPUs de consumo o incluso en CPUs con tiempos de entrenamiento reducidos.
- Integración en pipelines de recogida de datos: puede utilizarse como política base para recoger nuevos episodios de teleoperación y ampliar el dataset de entrenamiento.
- Transferencia a robots de la familia SO100/SO101: permite validar si la política se generaliza a configuraciones mecánicas similares, reduciendo el coste de desarrollo de nuevas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- Con 51,7 millones de parámetros, la VRAM necesaria para la inferencia es mínima, estimándose por debajo de 2 GB con una implementación en PyTorch/LeRobot.
- Es viable ejecutar la política en una GPU de consumo como una RTX 3060 o incluso en hardware más modesto, siempre que se disponga de CUDA.
- Se recomienda usar la librería LeRobot para el despliegue, tanto en entrenamiento como en inferencia.
- Para tiempos de respuesta en tiempo real, es preferible una GPU dedicada; en caso contrario, la inferencia en CPU podría ser demasiado lenta para control continuo de un robot.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Modelo específico para tareas de manipulación de cubos con el brazo SO101; su rendimiento fuera de este dominio no está garantizado.
- No es un modelo de lenguaje, por lo que no aplican riesgos de alucinación ni sesgos lingüísticos, pero tampoco ofrece capacidades de razonamiento o generación de texto.
- Requiere datos teleoperados para adaptarse a nuevas tareas; la reutilización en otros robots o escenarios exige reentrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe revisar las condiciones de la librería LeRobot y de los datasets asociados.
- No se han publicado evaluaciones de robustez frente a cambios de iluminación, oclusiones o perturbaciones físicas del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/act_policy_so101_cube_multitask_task_merged
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo relacionado: `act_policy_so101_cube_multitask_sim_0827` — https://huggingface.co/Chaenn/act_policy_so101_cube_multitask_sim_0827
- Modelo relacionado: `act_policy_so101_cube_multitask_realsim_0827` — https://huggingface.co/Chaenn/act_policy_so101_cube_multitask_realsim_0827
