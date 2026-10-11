# kiroaiseoul/act_task06_pickup_beaker_and_move_to_refrigerator_14D_new_3

## Resumen

El modelo `kiroaiseoul/act_task06_pickup_beaker_and_move_to_refrigerator_14D_new_3` es una politica de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales. Lo desarrolla el usuario kiroaiseoul y se ha entrenado y publicado en el Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. La tarea concreta que resuelve, según el identificador y el dataset asociado, es recoger un vaso de precipitados (*beaker*) y trasladarlo a un refrigerador, con un espacio de acciones de 14 dimensiones.

El modelo cuenta con 51.687.056 parámetros (~51,7 M), lo que lo sitúa en la categoría de politicas compactas orientadas a control robótico de bajo coste. Forma parte del ecosistema LeRobot y se distribuye con licencia Apache 2.0, lo que permite uso comercial. Está especializado en una única tarea manipulativa y se apoya en el dataset de demostraciones `task06_pickup_beaker_and_move_to_refrigerator_14D_new_3`, capturado presumiblemente mediante teleoperación.

Es relevante ahora porque ACT se ha consolidado como una referencia práctica en robótica de imitación de bajo coste, y este checkpoint es un ejemplo reproducible de entrenamiento de politicas con LeRobot. No obstante, conviene señalar que es un artefacto muy específico (una sola tarea, cero descargas y cero *likes* en el momento de redactar esta ficha) y que no dispone de datos de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder-decoder y CVAE (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.687.056 (~51,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el contexto son observaciones y estados de la tarea) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin informacion de cuantizacion) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el articulo arXiv 2304.13705. Su arquitectura combina un autocodificador variacional condicional (CVAE) con un transformer encoder-decoder: el encoder del VAE modela la variabilidad de las demostraciones humanas y el transformer genera secuencias de acciones (*action chunks*) en lugar de comandos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. El modelo aprende a partir de datos teleoperados, sin necesidad de recompensas ni de un simulador, y predice bloques de acciones que luego se ejecutan de forma consecutiva sobre el robot.

En este caso concreto, el entrenamiento se ha realizado con la herramienta `lerobot-train` de LeRobot sobre el dataset `kiroaiseoul/task06_pickup_beaker_and_move_to_refrigerator_14D_new_3`. La model card únicamente documenta el flujo de entrenamiento y evaluación (comandos `lerobot-train` y `lerobot-record` con un robot `so100_follower`), pero no especifica el número de tokens, el número de episodios, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla la dimensión exacta del espacio de observación ni la longitud del *chunk* de acciones, más allá de la referencia a un espacio de 14 dimensiones. La innovación técnica destacable es precisamente el *action chunking* con modelado generativo latente, que permite alta tasa de éxito en tareas de manipulación fina.

## Capacidades

- Generación de trayectorias de acción para manipulación robótica (predicción de *chunks* de acciones en lugar de pasos sueltos).
- Ejecución de una tarea concreta de *pick and place*: recoger un vaso de precipitados y trasladarlo a un refrigerador.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin funciones de recompensa explícitas.
- Control compatible con el ecosistema LeRobot y robots tipo SO-100 (`so100_follower`).
- Modelado de variabilidad en las demostraciones mediante el componente CVAE.
- No dispone de soporte de *tool calling* ni de *function calling*.
- No dispone de capacidades de agente, razonamiento multi-paso simbólico ni planificación de alto nivel.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de visión generalista documentada más allá de las observaciones propias de la tarea (no se detalla el tipo de cámaras en la información disponible).

## Casos de uso

- Automatización de una celda de laboratorio: el modelo puede ejecutar de forma repetible la secuencia de recoger un vaso de precipitados y depositarlo en un refrigerador, adecuado para tareas de manipulación estandarizadas en entornos controlados.
- Banco de pruebas para aprendizaje por imitación: sirve como ejemplo reproducible de entrenamiento de una politica ACT con LeRobot, útil para investigadores que quieran comparar metodologías de *action chunking*.
- Prototipado rápido en robótica de bajo coste: al ser una politica compacta (~51,7 M de parámetros), puede desplegarse en estaciones con un SO-100 y validar flujos de teleoperación a pequeña escala.
- Educación y formación: permite ilustrar de forma práctica el ciclo completo de captura de datos teleoperados, entrenamiento y evaluación de una politica robótica.
- Reentrenamiento y *fine-tuning* sobre tareas similares: dado que es una politica ligera y de licencia permisiva, puede adaptarse a variantes de la misma tarea (otros contenedores, otras posiciones del refrigerador).
- Integración en pipelines de evaluación automatizada: mediante `lerobot-record` con `--policy.path`, se puede insertar en scripts de evaluación por lotes con un número fijo de episodios.
- Base para experimentos de generalización: útil para medir hasta qué punto una politica específica de tarea se degrada al variar la posición de los objetos o la iluminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones numéricas con otras politicas. Tampoco la búsqueda web aportó datos relevantes (los resultados obtenidos corresponden a horarios de autobús en Normandía y no guardan relación con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en fp32 (tamaño del repo 0,2 GB) y en torno a 0,1 GB en fp16. Cifras orientativas derivadas del número de parámetros; no confirmadas en la model card.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente, incluidas NVIDIA GTX 1050 Ti o superiores. Para entrenamiento se recomienda CUDA (`--policy.device=cuda`).
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) e incluso en hardware de gama baja.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Robot de referencia: SO-100 (`so100_follower`) según el ejemplo de evaluación de la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_task06_pickup_beaker_and_move_to_refrigerator_14D_new_3 | ~51,7 M | no disponible | no disponible | apache-2.0 | Hugging Face (LeRobot) |
| Otras politicas ACT publicadas en LeRobot | no disponible | no disponible | no disponible | variable | Hugging Face |
| Diffusion Policy | no disponible | no disponible | no disponible | variable | Hugging Face |
| Otras politicas de manipulación (p. ej. VQ-BeT, TDMPC) | no disponible | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos numéricos comparativos en la información proporcionada. La comparación se limita a la categoría (politicas de aprendizaje por imitación para manipulación) y no permite establecer diferencias cuantitativas de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al entrenarse sobre un único dataset de demostraciones, la politica heredará los sesgos propios de las trayectorias teleoperadas (posiciones, velocidades y condiciones concretas de captura).
- Riesgo de alucinación: no aplica en el sentido de lenguaje natural, pero sí existe riesgo de generalización deficiente fuera de la distribución de entrenamiento (fallos al cambiar posiciones, objetos o iluminación).
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje natural ni tiene capacidades multilingües.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y la atribución correspondiente.
- Especificidad extrema: el checkpoint está entrenado para una única tarea (recoger un beaker y moverlo al refrigerador); no es un modelo generalista.
- Ausencia de métricas: no se publican tasas de éxito ni protocolos de evaluación, por lo que no puede validarse su rendimiento en producción sin pruebas propias.
- Madurez: cero descargas y cero *likes* en el momento de redactar esta ficha, lo que sugiere que no ha sido validado por la comunidad.
- Documentación incompleta: la model card no detalla el número de episodios de entrenamiento, la composición del dataset, la configuración de observaciones ni la longitud del *chunk* de acciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/act_task06_pickup_beaker_and_move_to_refrigerator_14D_new_3
- Dataset asociado: https://huggingface.co/datasets/kiroaiseoul/task06_pickup_beaker_and_move_to_refrigerator_14D_new_3
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de politicas (LeRobot): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Nota: la búsqueda web no devolvió enlaces relevantes sobre el modelo; los resultados obtenidos correspondían a horarios de autobús en Normandía y se han descartado.
