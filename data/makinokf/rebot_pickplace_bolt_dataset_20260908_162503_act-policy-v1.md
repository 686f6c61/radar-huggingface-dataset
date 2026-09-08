# MakinoKF/rebot_pickplace_bolt_dataset_20260908_162503_act-policy-v1

## Resumen

MakinoKF/rebot_pickplace_bolt_dataset_20260908_162503_act-policy-v1 es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), desarrollada por MakinoKF y publicada a través de la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación: recoger y colocar una tuerca (pick and place the nut) utilizando un robot de tipo `rebot_b601_follower`. Está diseñado para aprender por imitación a partir de datos teleoperados, prediciendo tramos de acciones en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación.

La arquitectura es un transformer de tipo ACT, con 51.670.663 parámetros en total, almacenados en formato safetensors. El modelo consume observaciones de estado (7 dimensiones) e imágenes de dos cámaras (`top` y `right`) de 480x640 píxeles, y produce acciones de 7 dimensiones. Fue entrenado sobre un dataset de 20 episodios y 6417 frames a 30 FPS, con una configuración de 30000 pasos de entrenamiento. Es un modelo pequeño, de 0.2 GB, pensado para ejecutarse en hardware accesible y para ser utilizado como punto de partida en investigaciones de imitación learning en robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de acciones individuales. Esta técnica, presentada en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705), utiliza un transformer codificador-decodificador condicionado por observaciones visuales y de estado. El entrenamiento se realiza mediante regresión sobre las acciones de demostración, lo que permite aprender políticas robustas a partir de datos teleoperados.

El entrenamiento se llevó a cabo con LeRobot versión 0.6.0, utilizando el dataset `MakinoKF/rebot_pickplace_bolt_dataset_20260908_162503`, compuesto por 20 episodios y 6417 frames a 30 FPS. La configuración de entrenamiento incluye 30000 pasos, batch size de 32, optimizador AdamW con learning rate de 1e-05 y semilla 1000. No se ha aplicado RLHF ni DPO, ya que se trata de un modelo de imitación supervisada. La tarea específica es "pick and place the nut", y el modelo fue entrenado con las cámaras `top` y `right` del robot `rebot_b601_follower`. No hay información sobre innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones de control para un robot de 7 grados de libertad (7 dimensiones de acción).
- Percepción visual a partir de dos cámaras simultáneas: `top` (480x640) y `right` (480x640).
- Predicción de tramos de acciones (action chunking), lo que permite ejecuciones más suaves y coherentes en tareas de manipulación.
- Aprendizaje por imitación de demostraciones humanas teleoperadas, sin necesidad de programación explícita de trayectorias.
- Ejecución de una tarea concreta de pick-and-place: recoger una tuerca y colocarla en una posición objetivo.
- Integración nativa con el framework LeRobot, incluyendo scripts de rollout y entrenamiento.
- No soporta tool calling, razonamiento multi-step, ni capacidades de lenguaje, visión general o audio, al ser un modelo puramente de control robótico.

## Casos de uso

- Automatización de ensamblaje industrial: el modelo puede ejecutar tareas repetitivas de recogida y colocación de piezas pequeñas, como tuercas, en líneas de producción. Su capacidad de action chunking reduce el riesgo de movimientos bruscos y mejora la precisión.
- Manipulación en laboratorios de robótica: investigadores pueden usar la política para replicar experimentos de pick-and-place en robots `rebot_b601_follower`, sirviendo como base para comparar métodos de imitación.
- Transferencia de habilidades por teleoperación: operarios humanos pueden demostrar la tarea una vez y el modelo aprende a replicarla, lo que facilita la programación de robots en entornos cambiantes.
- Investigación en aprendizaje por imitación: el modelo sirve como ejemplo de política ACT entrenada con LeRobot, útil para estudiar el efecto del tamaño del dataset, la configuración de entrenamiento o la arquitectura en tareas de manipulación.
- Benchmark de políticas de manipulación: al estar publicado en Hugging Face con una tarea y dataset definidos, permite comparar el rendimiento de nuevas políticas frente a este modelo en el mismo entorno robótico.
- Despliegue en robots de bajo coste: al ser un modelo de 51.7 millones de parámetros y 0.2 GB, puede ejecutarse en hardware modesto, lo que lo hace adecuado para prototipos y entornos académicos sin GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No existen datos de éxito en tareas reales, ni comparaciones con otros modelos en métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de robótica y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales. Dado el tamaño de 51.670.663 parámetros, el modelo en FP32 ocupa aproximadamente 207 MB en memoria. Con el procesamiento de imágenes de 480x640 y dos cámaras, se estima que una GPU con 6 GB de VRAM es suficiente para ejecutar la política en tiempo real.
- GPU recomendadas: no hay especificaciones del autor. Por el tamaño del modelo, GPUs de consumo como RTX 3060, RTX 4060 o superiores deberían ser adecuadas. Para entrenamiento, se recomienda una GPU con al menos 12 GB de VRAM, aunque no se confirma.
- Compatibilidad con consumer GPU: sí, el modelo es lo suficientemente pequeño como para ejecutarse en GPUs de consumo. No se requiere hardware de centro de datos.
- Opciones de despliegue: el modelo está pensado para ser ejecutado con LeRobot, usando el comando `lerobot-rollout` con `--strategy.type=base`. También puede integrarse en pipelines de LeRobot para entrenamiento y evaluación.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparación cuantitativa. Existe un modelo relacionado del mismo autor, `MakinoKF/pick-bolt-and-place-empty-space-dataset_act-policy-v1`, también entrenado con ACT y LeRobot, pero no se conocen sus parámetros, contexto ni rendimiento. Ambos son políticas de manipulación para tareas de pick-and-place con robots `rebot_b601_follower`. A continuación se listan las alternativas conocidas sin valores numéricos:

| Modelo | Tarea | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| MakinoKF/rebot_pickplace_bolt_dataset_20260908_162503_act-policy-v1 | Pick and place the nut | 51.670.663 | No disponible | Apache-2.0 |
| MakinoKF/pick-bolt-and-place-empty-space-dataset_act-policy-v1 | Pick bolt and place empty space | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo fue entrenado con un dataset muy pequeño (20 episodios, 6417 frames), lo que puede limitar su generalización a nuevas posiciones, iluminación o variaciones de la tarea.
- No se han proporcionado resultados de evaluación en el mundo real. No hay evidencia de tasas de éxito, por lo que su rendimiento en producción es incierto.
- Está especializado en una tarea concreta ("pick and place the nut") y en un robot específico (`rebot_b601_follower`). Es probable que falle en otros robots o con otras piezas.
- Depende de las dos cámaras con las que fue entrenado (`top` y `right`). Si se cambia la configuración de cámaras, el modelo puede no funcionar correctamente.
- Al ser un modelo de imitación, no tiene mecanismos de razonamiento ni de planificación ante imprevistos. Puede fallar en situaciones no vistas.
- La licencia Apache-2.0 permite uso comercial, pero no hay garantías de soporte ni de seguridad para aplicaciones industriales críticas.
- No se han documentado sesgos específicos, pero al estar entrenado en un entorno controlado, puede heredar sesgos del operador que generó las demostraciones.
- No hay información sobre riesgo de alucinación, ya que no genera texto; en su lugar, puede producir acciones incorrectas o inestables si las observaciones difieren del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MakinoKF/rebot_pickplace_bolt_dataset_20260908_162503_act-policy-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/MakinoKF/rebot_pickplace_bolt_dataset_20260908_162503
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Modelo relacionado del mismo autor: https://huggingface.co/MakinoKF/pick-bolt-and-place-empty-space-dataset_act-policy-v1
