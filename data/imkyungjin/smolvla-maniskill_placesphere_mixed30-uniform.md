# ImKyungjin/smolvla-maniskill_placesphere_mixed30-uniform

## Resumen

smolvla-maniskill_placesphere_mixed30-uniform es un ajuste fino (fine-tuning) del modelo lerobot/smolvla_base, publicado por el usuario ImKyungjin en HuggingFace. Se trata de una política de visión-lenguaje-acción (VLA) para robótica, entrenada y subida al Hub con LeRobot, la librería de HuggingFace para aprendizaje por imitación en robots. El modelo tiene 450.046.176 parámetros (~450 M) y un repositorio de 0,9 GB, coherente con pesos almacenados en safetensors a 16 bits.

SmolVLA, la arquitectura de la que deriva, se presenta en la model card como un modelo VLA compacto y eficiente que logra rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. El modelo base es genérico para control robótico; este checkpoint concreto ha sido especializado mediante entrenamiento supervisado sobre el conjunto de datos local/maniskill_placesphere_mixed30, cuyo identificador sugiere una mezcla ("mixed30") de tareas y pesos uniformes ("uniform"), aunque la composición exacta no está documentada en la información disponible.

Su relevancia es doble: por un lado, ilustra el flujo de trabajo estándar de LeRobot (entrenar una política sobre un dataset propio y evaluarla en un robot SO-100/SO-101); por otro, demuestra que es posible especializar un VLA de 450 M de parámetros sin clústeres de GPU, algo impensable en alternativas de 3-7 B de parámetros. No obstante, el checkpoint no tiene descargas ni valoraciones, no publica benchmarks y su model card es la plantilla genérica de LeRobot, por lo que debe tratarse como un artefacto experimental y no como un modelo validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); politica de robot entrenada con LeRobot, derivada de SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors; no se documentan variantes GGUF, int8 o int4) |
| Idiomas soportados | no disponible (la model card no declara idiomas; la salida del modelo son acciones, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |
| Tamano del repositorio | 0,9 GB |
| Modelo base | lerobot/smolvla_base (fine-tuning completo) |
| Dataset de entrenamiento | local/maniskill_placesphere_mixed30 |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es SmolVLA, un modelo de visión-lenguaje-acción compacto que combina un codificador visual y un modelo de lenguaje pequeño con un experto de acción. La model card proporcionada describe únicamente el marco general: se trata de un VLA "compacto y eficiente" que logra rendimiento competitivo con coste computacional reducido y puede desplegarse en hardware de consumo. Los detalles concretos del backbone, el número de tokens de contexto visual, el mecanismo de generación de acciones y las innovaciones específicas (por ejemplo, esquemas de atención o decodificación) no están incluidos en la información disponible y deben consultarse en el artículo arXiv:2506.01844.

En cuanto al entrenamiento, la model card indica que la política "ha sido entrenada y subida al Hub usando LeRobot" y que deriva de lerobot/smolvla_base mediante fine-tuning sobre el dataset local/maniskill_placesphere_mixed30. No se especifican el número de episodios, el número de frames, la composición exacta del dataset, el número de pasos de entrenamiento, la resolución de las cámaras, la frecuencia de control ni si se aplicaron técnicas de post-entrenamiento como RLHF o DPO (no aplicables de forma estándar a políticas de acción, pero no documentadas aquí). El sufijo "mixed30" del dataset sugiere una mezcla de 30 tareas y "uniform" sugiere un muestreo uniforme entre ellas, pero es una inferencia a partir del nombre, no un dato documentado. Tampoco se documenta si el codificador visual permaneció congelado durante el ajuste.

## Capacidades

- Generación de acciones motoras: dado un historial de observaciones visuales (cámaras) y el estado del robot, la política predice comandos de acción para control de brazos robóticos, típicamente en el ecosistema SO-100/SO-101 de LeRobot.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas sobre el dataset maniskill_placesphere_mixed30.
- Entrenamiento y evaluación integrados en LeRobot: compatible con los comandos `lerobot-train`, `lerobot-record` y `--policy.path` para despliegue y evaluación.
- Multitarea dentro del dataset: el identificador "mixed30" apunta a 30 tareas o variaciones, con muestreo uniforme, aunque la lista de tareas no está disponible.
- Ejecución en hardware de consumo: según la descripción de SmolVLA, el modelo está diseñado para desplegarse en GPUs de gama consumer.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la salida es acción motora, no texto.
- Capacidades especiales (modo thinking, visión general, audio): no disponible; la entrada visual está orientada a percepción para control, no a descripción de imágenes.

## Casos de uso

- Manipulación robótica en simulación: usar el checkpoint como política de referencia en tareas de ManiSkill derivadas del dataset de entrenamiento, evaluando tasa de éxito por tarea con `lerobot-record` y el robot simulado correspondiente.
- Transferencia sim-to-real en brazos SO-100/SO-101: desplegar la política en un brazo real de bajo coste y medir la degradación respecto a la evaluación en simulación, un experimento habitual en laboratorios con presupuesto limitado.
- Base para fine-tuning posterior: al ser un ajuste de 450 M de parámetros con licencia Apache 2.0, sirve como punto de partida para especializar en un dataset propio sin necesidad de reentrenar desde el modelo base.
- Estudio de mezclas de datos en VLA: el sufijo "uniform" permite comparar este checkpoint con variantes que usen otros esquemas de muestreo (por ejemplo, ponderado por dificultad) para analizar el efecto en el rendimiento por tarea.
- Recolección de datos asistida: ejecutar la política en modo autónomo para generar episodios adicionales que luego se filtren y se incorporen al dataset de entrenamiento.
- Despliegue en estaciones de trabajo o edge: inferencia en una única GPU de consumo (o incluso CPU) para prototipos de robótica educativa, dado el tamaño reducido del modelo.
- Reproducibilidad y docencia: servir como ejemplo mínimo del pipeline completo de LeRobot (dataset local, entrenamiento, publicación en el Hub y evaluación), útil en cursos de robótica y aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tabla de resultados (tasa de éxito por tarea, número de episodios de evaluación, comparación con SmolVLA base) y el repositorio registra 0 descargas y 0 likes, por lo que no existen evaluaciones independientes conocidas. Los resultados del modelo base SmolVLA deben consultarse en arXiv:2506.01844.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,9 GB en fp16/bf16 (coincide con el tamaño del repositorio de 0,9 GB para 450 M de parámetros), aproximadamente 1,8 GB en fp32. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- Memoria adicional: hay que sumar la del codificador visual y los buffers de observación (imágenes de una o varias cámaras) y del estado del robot, que pueden superar el peso del propio modelo según la resolución de entrada.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia (RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento o fine-tuning se recomienda una GPU con 16 GB o más (RTX 4090, A100 40 GB).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 6 GB o más; la descripción de SmolVLA indica explícitamente despliegue en hardware de consumo.
- Opciones de despliegue: LeRobot (PyTorch) mediante `lerobot-record --policy.path=...`; no se documenta soporte de vLLM, TGI, llama.cpp, Ollama ni ONNX para este checkpoint, y no se distribuyen pesos GGUF.
- Latencia y throughput: no disponible. Dependen de la frecuencia de control del robot, del número de cámaras y del hardware; no hay cifras publicadas en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de su documentación pública general y no han podido verificarse con la búsqueda web realizada (que no devolvió resultados relevantes); se marcan como aproximados o no disponibles.

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| smolvla-maniskill_placesphere_mixed30-uniform | 450 M (dato safetensors) | no disponible; observaciones visuales y estado del robot | Apache 2.0 | HuggingFace, libreria LeRobot |
| lerobot/smolvla_base (modelo base) | ~450 M (aprox., misma familia) | no disponible | no disponible en la informacion proporcionada | HuggingFace, LeRobot |
| OpenVLA | ~7 B (aprox.) | no disponible | no disponible en la informacion proporcionada | HuggingFace / repositorio publico |
| pi-0 (Physical Intelligence) | ~3,3 B (aprox.) | no disponible | no disponible en la informacion proporcionada | Publicacion y repositorio del proyecto |
| Octo | ~93 M (aprox., version base) | no disponible | no disponible en la informacion proporcionada | HuggingFace / repositorio publico |

La ventaja principal de este checkpoint frente a OpenVLA o pi-0 es el tamaño: ~450 M frente a 3-7 B de parámetros, lo que reduce el coste de inferencia y permite desplegarlo en GPUs de consumo. La contrapartida es que no hay evidencia publicada de rendimiento comparable en tareas generales de manipulación.

## Limitaciones y advertencias

- Ausencia de validación: 0 descargas y 0 likes, sin benchmarks publicados ni evaluaciones de terceros. No debe asumirse que el fine-tuning mejora al modelo base.
- Sesgo de simulación: el dataset (maniskill_placesphere_mixed30) apunta a datos de simulación o a una mezcla concreta de tareas; es probable una brecha de rendimiento al transferir a un robot físico, sin cifras publicadas que la cuantifiquen.
- Mezcla uniforme de tareas: el sufijo "uniform" sugiere pesos idénticos entre tareas; si alguna tarea tiene menos demostraciones, puede quedar infrarrepresentada y rendir peor.
- Alucinación en el sentido de acciones incoherentes: como política de control, los fallos se manifiestan como trayectorias erráticas, agarres fallidos o bloqueos, no como texto inventado. No existe mecanismo de verificación semántica.
- Idiomas y contexto: no disponibles. El modelo no genera texto, por lo que las capacidades multilingües no son aplicables.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe verificar las licencias de las dependencias (LeRobot) y del modelo base y de sus componentes, que pueden tener condiciones distintas.
- Seguridad física: no se documentan límites de par, espacios de trabajo seguros ni protocolos de parada de emergencia. Cualquier uso sobre hardware real requiere validación previa en simulación y medidas de seguridad.
- Mantenimiento: los metadatos indican creación y última actualización en septiembre de 2026 y no hay evidencia de mantenimiento posterior; el dataset referenciado es local, por lo que probablemente no sea reproducible desde el Hub.
- Reproducibilidad: la model card usa la plantilla genérica de LeRobot y los comandos de ejemplo apuntan a `--policy.type=act` en lugar de SmolVLA, lo que puede inducir a error al replicar el entrenamiento.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/ImKyungjin/smolvla-maniskill_placesphere_mixed30-uniform
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Articulo de SmolVLA (referenciado en la model card): https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores son los unicos verificables a partir de la informacion proporcionada.
