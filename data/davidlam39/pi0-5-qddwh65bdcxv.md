# davidlam39/pi0.5-QDdwh65bDcxv

## Resumen

pi0.5-QDdwh65bDcxv es un ajuste fino completo (full fine-tune) del modelo vision-language-action (VLA) π0.5, publicado en HuggingFace por el usuario davidlam39. El checkpoint parte de Fisher-Wang/pi05-axis-v0.2-all30-74p67 (revisión 521a0741c01ee7908b5794bb2ae6933d3dc04745) y se ha entrenado sobre renders de replay propios de AXIS v2.0 y rollouts retargeteados, segun indica la propia model card. El autor especifica que no ha utilizado pesos de otros participantes ("No other miner's weights"), lo que sugiere un contexto de competición o leaderboard interno.

π0.5 es un modelo VLA desarrollado por Physical Intelligence (paper arXiv 2504.16054) que parte de π0 y se entrena con co-training sobre fuentes heterogéneas de datos: demostraciones de robots diversos, datos web y subtareas semánticas. Su objetivo es la generalización en entornos no vistos para manipulación móvil de largo horizonte, un problema abierto en robótica de propósito general.

La relevancia de este checkpoint concreto es doble: por un lado, demuestra la viabilidad de especializar un VLA generalista mediante fine-tuning completo sobre un dataset propio de tamaño moderado (el repositorio ocupa 12,4 GB); por otro, publica una métrica de evaluación local (0,6100, equivalente a 366/600) junto con las semillas de política y aleatorización usadas, lo que permite reproducir la evaluación. No se dispone de información sobre el número de parámetros, la longitud de contexto ni los idiomas, y el repositorio no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action); el modelo base π0.5 emplea una arquitectura jerárquica con acciones semánticas de alto nivel y acciones de bajo nivel. Detalle de capas y backbone: no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se declaran idiomas; el uso previsto es control robótico) |
| Licencia | other (license_name: gemma) |
| Formato de pesos | no especificado de forma explícita; el repositorio ocupa 12,4 GB y las etiquetas incluyen jax y openpi |
| Modelo base | Fisher-Wang/pi05-axis-v0.2-all30-74p67 (commit 521a0741c01ee7908b5794bb2ae6933d3dc04745) |
| Tamano del repositorio | 12,4 GB |
| Pipeline declarado | robotics |
| Etiquetas | robotics, vla, pi0.5, axis, openpi, jax, openroboto |

## Arquitectura y entrenamiento

Segun la descripción de π0.5 en el paper arXiv 2504.16054, la arquitectura es jerárquica: el modelo se preentrena primero sobre una mezcla heterogénea de tareas (demostraciones de varios robots, datos web y datos semánticos) y después se ajusta específicamente para manipulación móvil combinando ejemplos de acciones de bajo nivel con "acciones semánticas" de alto nivel, que corresponden a la predicción de etiquetas de subtarea del tipo "pick ...". Esta separación permite que el modelo planifique subtareas y, a continuación, genere las acciones motoras correspondientes. La página de Qualcomm AI Hub describe π0.5 como un modelo fundacional robótico generalista que co-entrena visión, lenguaje y acción para ejecución física zero-shot en plataformas heterogéneas.

Este checkpoint concreto es un fine-tune de modelo completo (no un merge ni un adaptador) sobre el padre indicado. Los datos de entrenamiento propios consisten en renders de replay de AXIS v2.0 y rollouts retargeteados, segun la model card. No se especifica el número de tokens, la composición exacta del dataset, ni si se emplearon técnicas de RLHF, DPO o aprendizaje por imitación más allá del propio pipeline de VLA. La evaluación declarada se realizó con semilla de política 20260907 y semilla de aleatorización 20260928, dato relevante para reproducibilidad.

## Capacidades

- Control robótico end-to-end: genera acciones motoras a partir de observaciones visuales e instrucciones en lenguaje, propio de un modelo VLA.
- Generalización en entornos no vistos (open-world): capacidad atribuida al modelo base π0.5 mediante co-training con datos heterogéneos.
- Razonamiento jerárquico: predicción de subtareas semánticas de alto nivel antes de la generación de acciones de bajo nivel.
- Manipulación móvil de largo horizonte: escenario objetivo del ajuste del modelo base π0.5.
- Ejecución física zero-shot en plataformas robóticas diversas, segun la descripción de Qualcomm AI Hub.
- Entrada multimodal de visión y lenguaje integrada en el bucle de control.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes multi-paso: no documentado como tal; la jerarquía subtarea-acción es el mecanismo interno más cercano.
- Capacidades multilingües: no disponible (no se declaran idiomas soportados).
- Capacidad especial: el checkpoint está especializado en el dominio AXIS v2.0 (renders de replay y rollouts retargeteados), no en propósito general.

## Casos de uso

- Manipulación móvil en almacenes: el modelo puede ejecutar secuencias de recogida y colocación en estanterías o cintas transportadoras, descomponiendo la tarea en subtareas semánticas y generando las acciones de bajo nivel correspondientes.
- Investigación en modelos VLA: sirve como punto de partida reproducible para comparar estrategias de fine-tuning sobre un VLA generalista, dado que el autor publica semillas de política y aleatorización junto con la puntuación local.
- Fine-tuning específico de dominio: el propio checkpoint es un ejemplo de cómo especializar π0.5 sobre un dataset acotado de renders y rollouts; el mismo procedimiento puede replicarse para otros dominios robóticos.
- Evaluación comparativa de checkpoints en un leaderboard o competición interna: la métrica local (366/600 sobre 600 intentos) permite ordenar variantes bajo condiciones controladas de semilla.
- Generación de datos sintéticos y retargeting de rollouts: los renders de replay de AXIS v2.0 empleados en el entrenamiento pueden reutilizarse como fuente de datos para nuevas iteraciones o para validar políticas antes de desplegarlas en hardware real.
- Automatización de laboratorio: ejecución de rutinas de manipulación repetitivas con objetos previamente vistos en simulación, reduciendo la intervención humana en tareas monótonas.
- Prototipado de robots de servicio: base para experimentos de manipulación doméstica o asistencial, siempre con supervisión humana y validación en el dominio concreto de despliegue.
- Validación sim-to-real: el uso de renders y rollouts retargeteados como datos de entrenamiento hace de este checkpoint un candidato para estudiar la brecha entre simulación y realidad antes de invertir en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible; se trata de un modelo de política robótica, por lo que esas métricas no son aplicables. El único dato de rendimiento aportado por el autor es una puntuación de evaluación local:

| Evaluacion | Resultado | Detalles |
|---|---|---|
| Score local (autor) | 0,6100 | 366 aciertos sobre 600 intentos; semilla de política 20260907; semilla de aleatorización 20260928 |

Este valor procede de la model card y de un protocolo de evaluación propio de AXIS v2.0, no de un benchmark público independiente, por lo que no es directamente comparable con resultados de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,4 GB en disco antes de cuantización, por lo que se puede estimar de forma orientativa un requisito de memoria del mismo orden para pesos en precisión reducida, aunque no hay confirmación oficial.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es probable que requiera GPU de centro de datos (A100, H100) para inferencia en tiempo real, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no disponible. No se puede afirmar que quepa en una RTX 4090 u otras GPU de consumo sin datos de parámetros totales y precisión.
- Opciones de despliegue: las etiquetas del repositorio apuntan a jax y openpi, el stack de Physical Intelligence para modelos π; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, más orientados a modelos de lenguaje que a políticas VLA.
- Latencia y throughput: no disponibles. En robótica, el requisito típico es de decenas de hercios en el bucle de control, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davidlam39/pi0.5-QDdwh65bDcxv | Este checkpoint | no disponible | no disponible | other (gemma) | HuggingFace, 0 descargas |
| Fisher-Wang/pi05-axis-v0.2-all30-74p67 | Modelo padre del fine-tune | no disponible | no disponible | no disponible | HuggingFace |
| π0.5 (Physical Intelligence) | Modelo base de la familia | no disponible | no disponible | no disponible | Paper arXiv 2504.16054; despliegue via Qualcomm AI Hub |
| π0 | Predecesor de π0.5 | no disponible | no disponible | no disponible | Paper y repositorio openpi |
| davidlam39/pi0.5-pR8yKTd26Ynx | Checkpoint del mismo autor | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de parámetros, contexto ni resultados de benchmarks de las alternativas en la información consultada, por lo que la comparación queda limitada al origen, la licencia y la forma de distribución.

## Limitaciones y advertencias

- Licencia "other" con nombre "gemma": el uso comercial queda sujeto a los términos de la licencia Gemma, que incluye una política de uso aceptable con restricciones; conviene revisarla antes de cualquier despliegue productivo.
- No se declaran idiomas soportados, lo que impide garantizar el comportamiento ante instrucciones en castellano u otras lenguas distintas del inglés.
- No hay datos de benchmarks independientes ni comparaciones con otros VLA bajo un protocolo común; la puntuación 0,6100 es una evaluación local del propio autor.
- Riesgo de alucinación aplicado a acciones: un VLA puede generar secuencias motoras incorrectas o inseguras ante entradas fuera de distribución, con consecuencias físicas sobre el robot y su entorno.
- Sesgos de dominio: el entrenamiento se basa en renders de replay de AXIS v2.0 y rollouts retargeteados, por lo que el rendimiento fuera de ese dominio (iluminación, objetos, morfologías) es incierto.
- Brecha sim-to-real: al usar renders como parte de los datos, el comportamiento en hardware real puede degradarse respecto a la evaluación en simulación.
- Reproducibilidad limitada: se publican las semillas, pero no el protocolo completo de evaluación ni el dataset.
- Ausencia de tracción comunitaria: 0 descargas y 0 likes, sin evidencia externa de validación.
- Fecha de creación del repositorio: 29 de septiembre de 2026, dato a tener en cuenta para evaluar su vigencia en el momento de la consulta.
- Tamaño del repositorio (12,4 GB) y formato de pesos no especificado explícitamente: puede requerir conversiones antes de integrarlo en pipelines de inferencia convencionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidlam39/pi0.5-QDdwh65bDcxv
- Modelo base: https://huggingface.co/Fisher-Wang/pi05-axis-v0.2-all30-74p67
- Otro checkpoint del mismo autor: https://huggingface.co/davidlam39/pi0.5-pR8yKTd26Ynx
- Paper de π0.5 (arXiv): https://arxiv.org/abs/2504.16054
- Version HTML del paper: https://arxiv.org/html/2504.16054v1
- Ficha de π0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- Analisis divulgativo de π0.5: https://domrigby.github.io/robotics/Pi0.5VLA.html
- Repositorio openpi (citado en las etiquetas del modelo; URL no incluida en los resultados de busqueda): no disponible
