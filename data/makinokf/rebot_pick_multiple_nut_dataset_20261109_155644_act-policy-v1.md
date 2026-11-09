# MakinoKF/rebot_pick_multiple_nut_dataset_20261109_155644_act-policy-v1

## Resumen

`MakinoKF/rebot_pick_multiple_nut_dataset_20261109_155644_act-policy-v1` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) sobre el framework LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación: recoger una tuerca ("pick the nut") con un robot de tipo `rebot_b601_follower` equipado con dos cámaras (vista superior y lateral derecha). No es un modelo de lenguaje generalista, sino un controlador visuomotor que mapea observaciones (estado articular de 7 dimensiones y dos imágenes RGB de 480x640) a acciones de 7 dimensiones.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo completo de entrenamiento de políticas con LeRobot 0.6.0 y ACT, un método publicado en arXiv (2304.13705) que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Por otro lado, sirve como ejemplo reproducible de un pipeline de aprendizaje por imitación con datos teleoperados: 40 episodios, 6102 fotogramas a 30 FPS y 50 000 pasos de entrenamiento.

El modelo tiene 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y desplegable en hardware modesto. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque la utilidad práctica está acotada al robot y a la tarea específicos para los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, arXiv:2304.13705) |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visuomotora por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador visual (procesa las dos cámaras de 3x480x640) con un transformer que predice bloques de acciones futuras en lugar de una sola acción por paso. Esta estrategia de "chunking" mitiga el problema de horizonte y el error compuesto típico de las políticas paso a paso. El modelo consume `observation.state` de forma (7,) y dos flujos visuales (`observation.images.top` y `observation.images.right`) y produce una acción de forma (7,).

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `MakinoKF/rebot_pick_multiple_nut_dataset_20261109_155644`, compuesto por 40 episodios y 6102 fotogramas a 30 FPS de la tarea "pick the nut". La configuración incluye 50 000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Control visuomotor de un brazo robótico de 7 grados de libertad (`rebot_b601_follower`) para la tarea de recoger una tuerca.
- Fusión de dos cámaras RGB (vista superior y lateral derecha) con el estado articular en un único espacio de observación.
- Predicción de secuencias de acciones (action chunks) que reducen la acumulación de error frente a políticas paso a paso.
- Ejecución autónoma de la política mediante `lerobot-rollout` con estrategia `base` y duración configurable.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política puramente reactiva.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo de pensamiento, visión general, audio ni otras modalidades fuera de las dos cámaras especificadas.

## Casos de uso

- Recogida automatizada de piezas en línea de montaje: la política ejecuta la tarea "pick the nut" sobre el robot `rebot_b601_follower`, adecuada para entornos donde la posición de la pieza es relativamente estable y el ciclo es repetitivo.
- Prototipado rápido de pipelines de imitación con LeRobot: sirve como referencia reproducible para validar la instalación, el calibrado de cámaras y el flujo `lerobot-train` / `lerobot-rollout` antes de escalar a tareas propias.
- Generación de datos sintéticos de evaluación: al ser una política ligera (51,67 M de parámetros), se puede ejecutar en paralelo en varias instancias para comparar configuraciones de cámara o iluminación.
- Benchmark interno de métodos de imitación: útil como línea base ACT frente a otras políticas (por ejemplo, diffusion policies) sobre el mismo dataset de 40 episodios.
- Docencia y formación en robótica de manipulación: el modelo y su dataset asociado permiten explicar de extremo a extremo el ciclo teleoperación-dataset-entrenamiento-despliegue.
- Despliegue en hardware de bajo coste: el tamaño reducido del repositorio (0,2 GB) y el número de parámetros permiten inferencia en GPU de consumo, facilitando pruebas en laboratorios con recursos limitados.
- Reutilización como inicialización: aunque no se documenta oficialmente, el checkpoint puede servir como punto de partida para fine-tuning en tareas de picking similares con el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de pérdida de entrenamiento, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM necesaria para los pesos es inferior a 1 GB. El coste dominante es el procesamiento de las dos imágenes de 480x640 por paso.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para los pesos; se recomienda una GPU dedicada (RTX 3060 o superior) para mantener los 30 FPS de las cámaras sin cuello de botella en el preprocesado visual.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660, RTX 2060, RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que internamente usa PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El bucle de control está pensado para ejecutarse a 30 FPS, sincronizado con la captura de las cámaras; la latencia real depende del hardware y del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, rebot_b601_follower) | 51,67 M | 2 camaras 480x640 + estado (7,) | "pick the nut" | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | no disponible | variable | variable | variable | Hugging Face |
| Diffusion Policy (referencia metodologica) | no disponible | variable | manipulación general | no disponible | repos públicos |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas. La comparación cualitativa se limita a señalar que ACT es un método de imitación con action chunking, mientras que alternativas como Diffusion Policy modelan la distribución de acciones mediante difusión; ambas se integran en LeRobot, pero no hay resultados publicados para esta política concreta.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con 40 episodios de una única tarea y un único robot, la política está fuertemente sesgada hacia las posiciones, iluminación y configuración de cámara presentes en el dataset. Variaciones en la posición de la tuerca, distractores o cambios de iluminación pueden degradar el comportamiento.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o no convergentes cuando la observación se sale de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni instrucciones en lenguaje natural más allá de la etiqueta de tarea "pick the nut" usada en el rollout.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican cláusulas adicionales en la información disponible.
- Caveats para producción: no hay evaluación publicada de tasa de éxito, no se documenta robustez ante cambios de robot o cámara, y el modelo está acoplado a la morfología `rebot_b601_follower` con dos cámaras concretas. Cualquier despliegue en producción requiere una validación empírica propia antes de confiar en la política.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MakinoKF/rebot_pick_multiple_nut_dataset_20261109_155644_act-policy-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/MakinoKF/rebot_pick_multiple_nut_dataset_20261109_155644
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MakinoKF/rebot_pick_multiple_nut_dataset_20261109_155644
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
