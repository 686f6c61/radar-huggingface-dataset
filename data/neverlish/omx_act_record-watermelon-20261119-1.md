# neverlish/omx_act_record-watermelon-20261119-1

## Resumen

`neverlish/omx_act_record-watermelon-20261119-1` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está asociado al dataset `neverlish/record-watermelon-20261108-1`, lo que sugiere una tarea de manipulación grabada por teleoperación (posiblemente relacionada con sandía, a juzgar por el nombre del dataset).

El modelo resuelve el problema de control robótico de precisión a partir de demostraciones humanas: en lugar de diseñar controladores explícitos, aprende una política que mapea observaciones visuales y propioceptivas a secuencias cortas de acciones. Es relevante porque ACT es una de las referencias más citadas en el aprendizaje por imitación moderno para manipulación robótica (paper arXiv 2304.13705), y este checkpoint concreto es un ejemplo reproducible de un pipeline completo LeRobot con licencia permisiva.

Con 51.668.614 parámetros (unos 51,7 M) y un repositorio de 0,2 GB, es un modelo compacto pensado para ejecutarse en hardware de laboratorio o incluso en GPUs de consumo, no para despliegues masivos. La información pública disponible es escasa: la model card es prácticamente la plantilla por defecto de LeRobot, sin datos de entrenamiento, benchmarks ni especificaciones detalladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de aprendizaje por imitación compuesta por un codificador visual (típicamente ResNet preentrenado) que procesa las imágenes de las cámaras del robot, un codificador de estado propioceptivo, y un decodificador transformer que genera un *chunk* de acciones futuras en lugar de una sola acción. Esta predicción por bloques reduce el error de acumulación y mejora la estabilidad del control, y se entrena con *behavior cloning* sobre datos de teleoperación.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos, RLHF o DPO (no aplicables en este contexto). El dataset asociado, `neverlish/record-watermelon-20261108-1`, indica que el entrenamiento se realizó con grabaciones de teleoperación de una tarea concreta, presumiblemente manipulación de una sandía, aunque no se especifica el robot utilizado (la model card menciona `so100_follower` en el ejemplo de evaluación, lo que sugiere un SO-100 de bajo coste).

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (posiciones articulares o del efector final) a partir de observaciones visuales y de estado.
- Predicción de *action chunks*: emite bloques de acciones futuras, lo que mejora la suavidad y la robustez frente a errores acumulados.
- Aprendizaje a partir de demostraciones: no requiere recompensas ni entorno simulado; se entrena con datos de teleoperación.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante la CLI `lerobot-train` y `lerobot-record`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo específico de robótica, no un modelo de lenguaje.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Manipulación de objetos en laboratorio: el modelo puede ejecutar una tarea concreta de agarre o colocación (por ejemplo, manipular una sandía) entrenada con demostraciones, adecuado para prototipos de investigación en robótica de bajo coste.
- Reproducción de experimentos de aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT o pipelines de LeRobot en una tarea reproducible.
- Despliegue en robots SO-100: la model card incluye el comando de evaluación con `so100_follower`, por lo que es directamente usable en esa plataforma de robótica de bajo coste.
- Docencia y formación: modelo pequeño (51,7 M de parámetros) que cabe en GPUs de consumo y permite demostrar el ciclo completo de teleoperación, entrenamiento y evaluación.
- Base para *fine-tuning* en tareas similares: al ser un checkpoint ACT con licencia Apache 2.0, puede reentrenarse con nuevos datasets de teleoperación para tareas de manipulación parecidas.
- Evaluación de políticas en entornos controlados: útil para medir tasas de éxito de una política de imitación antes de escalar a modelos mayores o a robots más complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~51,7 M de parámetros en safetensors (aproximadamente 0,2 GB en FP32), la inferencia cabe holgadamente en cualquier GPU con 4 GB o más de VRAM; en FP16 ocuparía del orden de 0,1 GB solo en pesos, más el codificador visual y los buffers de activaciones.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100; para inferencia en tiempo real basta una GPU de gama media, aunque la latencia real depende del robot y de la frecuencia de control.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660 en adelante, con margen amplio).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware, del tamaño de las imágenes de entrada y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neverlish/omx_act_record-watermelon-20261119-1 | 51,7 M | no disponible | Manipulación robótica (ACT) | apache-2.0 | Hugging Face |
| Políticas ACT de LeRobot (checkpoints de referencia) | ~50 M típicamente | no disponible | Manipulación robótica | apache-2.0 (segun checkpoint) | Hugging Face / LeRobot |
| Diffusion Policy (referencia) | variable, mayor que ACT | no disponible | Manipulación robótica | variable | Repositorios de investigación |
| VLA generalistas (p. ej., OpenVLA) | miles de millones | no disponible | Manipulación con lenguaje | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo específico de una tarea: entrenado con un dataset concreto (`record-watermelon-20261108-1`); no generaliza a otras tareas ni objetos sin reentrenamiento.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al depender de demostraciones humanas puede heredar sesgos de la teleoperación (posiciones, velocidades, condiciones de iluminación).
- Riesgo de fallo en condiciones fuera de distribución: cambios de iluminación, posición de cámara u objetos distintos pueden degradar la política de forma significativa.
- Sin datos de benchmarks ni de tasa de éxito: no es posible evaluar su rendimiento sin ejecutarlo en el robot correspondiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el autor no ofrece soporte.
- Caveat para producción: es un checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa ni de uso en entornos reales.
- Idiomas y contexto: no aplicables; no es un modelo de lenguaje y no procesa texto libre.

## Enlaces

- Hugging Face: https://huggingface.co/neverlish/omx_act_record-watermelon-20261119-1
- Dataset asociado: https://huggingface.co/datasets/neverlish/record-watermelon-20261108-1
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
