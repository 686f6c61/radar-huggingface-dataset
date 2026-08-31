# l61795631/omx_act_policy_2

## Resumen

El modelo `omx_act_policy_2` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada por el usuario l61795631 y entrenada con el framework LeRobot de Hugging Face. ACT es un método que predice secuencias cortas de acciones (action chunks) en lugar de acciones individuales, lo que reduce la acumulación de errores y mejora la fluidez en tareas de manipulación robótica. El modelo cuenta con 51.668.614 parámetros y ha sido entrenado sobre el conjunto de datos `l61795631/pick_and_place_train`, orientado a tareas de recogida y colocación de objetos.

La relevancia de este modelo reside en que ejemplifica el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, un ecosistema open source que democratiza el aprendizaje por imitación. Su pequeño tamaño lo hace accesible para experimentación en hardware de consumo, y su licencia Apache 2.0 permite uso comercial sin restricciones. Los pesos se distribuyen en formato safetensors, lo que garantiza una carga segura y eficiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Longitud de contexto | no disponible (política robótica; no aplica contexto de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (política robótica, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura basada en transformers diseñada específicamente para aprendizaje por imitación en robótica. Emplea un codificador-decodificador transformer que recibe observaciones visuales y del estado del robot, y genera bloques de acciones futuras de forma autoregresiva. El entrenamiento sigue un enfoque de tipo CVAE (Conditional Variational Autoencoder) con una variable de estilo latente que captura la variabilidad entre demostraciones, lo que permite al modelo generar múltiples trayectorias válidas para una misma observación.

El modelo ha sido entrenado con LeRobot sobre el dataset `l61795631/pick_and_place_train`, que contiene demostraciones teleoperadas de tareas de recogida y colocación. No se especifican en la información disponible el número exacto de episodios, la composición del dataset ni si se aplicaron técnicas de post-entrenamiento como RLHF o DPO, que por otro lado no son habituales en políticas robóticas de este tipo. La innovación principal de ACT es la predicción por chunks de acción, que reduce la propagación de errores y produce movimientos más coordinados en comparación con políticas paso a paso.

## Capacidades

- Manipulación robótica pick-and-place: el modelo está entrenado específicamente para tareas de recogida y colocación de objetos, ejecutando secuencias de acciones coordinadas aprendidas de demostraciones.
- Aprendizaje por imitación: reproduce comportamientos demostrados por teleoperación, sin necesidad de ingeniería de recompensas ni aprendizaje por refuerzo.
- Predicción por chunks de acción: genera bloques de acciones futuras en lugar de pasos individuales, lo que mejora la estabilidad y suavidad del movimiento.
- Integración nativa con LeRobot: compatible con las herramientas de entrenamiento (`lerobot-train`), evaluación e inferencia (`lerobot-record`) del ecosistema.
- Compatibilidad con el robot SO-100: el flujo de evaluación documentado en la model card utiliza `--robot.type=so100_follower`, lo que indica soporte para este brazo robótico de bajo coste.
- Reproducibilidad: el modelo incluye metadatos de entrenamiento completos en la model card, lo que permite replicar el flujo de entrenamiento.

## Casos de uso

- Automatización de tareas pick-and-place en laboratorio: el modelo puede controlar un brazo robótico SO-100 para recoger objetos de una posición definida y depositarlos en otra, ejecutando los chunks de acción aprendidos. Es adecuado porque su arquitectura ACT está diseñada para producir movimientos precisos y repetibles en tareas de manipulación.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos comparativos con otras políticas de LeRobot (Diffusion, VQ-BeT, TD-MPC) sobre el mismo dataset, permitiendo estudiar diferencias de rendimiento, robustez y requisitos de datos.
- Prototipado rápido de soluciones robóticas: con solo 51,7 millones de parámetros, el modelo puede entrenarse y evaluarse en GPUs de consumo, lo que permite iterar rápidamente en el diseño de experimentos sin infraestructura costosa.
- Evaluación y validación de políticas en robots reales: mediante `lerobot-record` con `--policy.path` apuntando a este checkpoint, se pueden ejecutar episodios de evaluación directamente sobre el robot y medir tasas de éxito en condiciones reales de funcionamiento.
- Formación y docencia en robótica y aprendizaje automático: el modelo y su dataset asociado constituyen un ejemplo completo y reproducible del flujo de trabajo de LeRobot, útil para cursos y talleres sobre aprendizaje por imitación y control robótico.
- Benchmarking de configuraciones de entrenamiento: al estar publicado con metadatos de entrenamiento, puede utilizarse como referencia para comparar variaciones de hiperparámetros, tamaños de action chunk o aumentación de datos en políticas ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB, considerando que los pesos en FP32 ocupan unos 207 MB y en FP16 unos 103 MB, más la memoria de activaciones y overhead del transformer.
- VRAM estimada para entrenamiento: aproximadamente 4-6 GB, incluyendo gradientes y estados del optimizador.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA de las series 20, 30, 40 o superior; una RTX 3060 de 12 GB es más que suficiente para entrenamiento completo.
- Compatibilidad con GPUs de consumo: sí, el modelo está diseñado para ejecutarse en hardware asequible, consistente con el enfoque de LeRobot de democratizar la robótica.
- Opciones de despliegue: LeRobot como framework principal, con los comandos `lerobot-train` para entrenamiento y `lerobot-record` para evaluación e inferencia sobre el robot.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Autor | Parametros | Tarea | Licencia |
|---|---|---|---|---|
| l61795631/omx_act_policy_2 | l61795631 | 51.668.614 | Pick-and-place | Apache 2.0 |
| l61795631/omx_act_policy | l61795631 | no disponible | no disponible | no disponible |
| dookidooki/omx_act_policy_v2 | dookidooki | no disponible | no disponible | no disponible |

No se dispone de información detallada sobre las alternativas listadas más allá de su existencia en el Hub. Todas son políticas ACT entrenadas con LeRobot, pero sus especificaciones completas no están disponibles en la información proporcionada. La comparativa se limita por tanto a la identificación de modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para tareas de pick-and-place y no es generalizable a otras tareas de manipulación sin reentrenamiento completo.
- No se dispone de información sobre el número de episodios de demostración ni la variabilidad del dataset, por lo que la robustez del modelo ante variaciones del entorno es desconocida.
- No se han publicado tasas de éxito ni resultados de evaluación en entornos no vistos, por lo que su rendimiento real no está cuantificado.
- El modelo no tiene capacidades de lenguaje ni de razonamiento simbólico; es una política motora pura que no acepta instrucciones textuales.
- Al ser un modelo de imitación, hereda los sesgos y limitaciones de las demostraciones con las que fue entrenado; si las demostraciones contienen errores o variabilidad limitada, el modelo los reproducirá.
- La licencia Apache 2.0 del modelo permite uso comercial, pero el dataset asociado (`l61795631/pick_and_place_train`) puede tener restricciones propias que deben verificarse antes de su uso en producción.
- El modelo fue creado el 31 de agosto de 2026 y no tiene descargas ni valoraciones en el Hub, por lo que no cuenta con validación comunitaria.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/l61795631/omx_act_policy_2
- Paper de ACT (arXiv): https://arxiv.org/abs/2304.13705
- Página del paper en Hugging Face: https://huggingface.co/papers/2304.13705
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://hugging
