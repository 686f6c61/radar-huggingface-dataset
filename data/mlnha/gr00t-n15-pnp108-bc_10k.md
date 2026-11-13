# mlnha/gr00t-n15-pnp108-bc_10k

## Resumen

`mlnha/gr00t-n15-pnp108-bc_10k` es un checkpoint de investigación derivado de GR00T N1.5, el modelo fundacional de robótica humanoide desarrollado por NVIDIA. En concreto, se trata de un ajuste fino mediante clonación de conducta (behavior cloning, BC) sobre el modelo de preentrenamiento de RoboCasa (`robocasa365_checkpoints`, paso 80000), entrenado a partir de 108 episodios de rollout generados por un checkpoint de GR00T (paso 120000) sobre la tarea PickPlaceCounterToCabinet del entorno RoboCasa365.

El autor, `mlnha`, publica este artefacto como parte de un estudio sobre estimadores de progreso de tarea aprendidos como señal de entrenamiento para BC. Por tanto, no es un modelo de propósito general ni un lanzamiento oficial de NVIDIA, sino un checkpoint de investigación con un conjunto de datos reducido (72 de los 108 episodios exitosos) y una única semilla (42). Su relevancia es acotada: sirve para reproducir y auditar el experimento, no como modelo listo para producción.

El repositorio ocupa 37,9 GB e incluye pesos en formato safetensors, logs de entrenamiento (`train.log`) y eventos de TensorBoard (`runs/`), pero no los estados del optimizador. La model card no detalla arquitectura, número de parámetros, contexto ni licencia, por lo que buena parte de las especificaciones técnicas deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de GR00T N1.5; la model card no especifica la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 37,9 GB; incluye `train.log` y `runs/` de TensorBoard, sin estados del optimizador) |
| Libreria | gr00t |
| Pipeline | robotics |
| Embodiment | `new_embodiment` |
| Tarea | PickPlaceCounterToCabinet (RoboCasa365) |
| Dataset de entrenamiento | `pnp108`: 108 rollouts, 72 exitosos, formato LeRobot v2.1 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. Por el nombre y la librería (`gr00t`) se infiere que se trata de un derivado de GR00T N1.5 de NVIDIA, un modelo fundacional para control de robots humanoides, pero el autor no aporta detalles sobre el tipo de transformer, el encoder visual, el mecanismo de acción ni el número de parámetros. Cualquier afirmación más concreta sobre la arquitectura sería especulativa y no se recoge aquí.

El procedimiento de entrenamiento sí está documentado: se parte del checkpoint de preentrenamiento de RoboCasa (`robocasa/robocasa365_checkpoints`, paso 80000) y se aplica clonación de conducta simple (sin RL, sin DPO ni estimadores de progreso en esta variante concreta) sobre 108 rollouts generados por un checkpoint de GR00T (paso 120000) en la tarea PickPlaceCounterToCabinet. De esos 108 episodios, 72 fueron exitosos. El entrenamiento se ejecutó en una única GPU, con batch de 64, learning rate 3e-5 con schedule coseno y warmup de 0,05, semilla 42 y el embodiment etiquetado como `new_embodiment`. Los datos están en formato LeRobot v2.1.

## Capacidades

- Control robótico de manipulación: el modelo está entrenado específicamente para la tarea PickPlaceCounterToCabinet, que consiste en recoger un objeto de la encimera y colocarlo en el armario dentro del simulador RoboCasa365.
- Política de imitación (behavior cloning): genera acciones a partir de observaciones del entorno, sin razonamiento simbólico ni planificación explícita.
- Evaluación en simulación: los checkpoints publicados están pensados para evaluarse en RoboCasa365 con semillas de escena 2000+ y semilla de política 1.
- No se declaran capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes multi-paso ni multilingüismo. Es un artefacto de robótica, no un modelo de lenguaje de propósito general.

## Casos de uso

- Reproducción de experimentos de BC en robótica: el checkpoint permite replicar el ajuste fino sobre `pnp108` con la misma configuración (batch 64, LR 3e-5, semilla 42) y contrastar las tasas de éxito publicadas en RoboCasa365.
- Estudio de curvas de aprendizaje en clonación de conducta: los cinco checkpoints intermedios (2000, 4000, 6000, 8000 y 10000) permiten analizar cómo evoluciona la tasa de éxito con el número de pasos y detectar saturación o sobreajuste.
- Línea base para métodos de estimación de progreso de tarea: al ser la variante "plain BC" de un estudio más amplio, sirve como referencia contra la que comparar variantes que incorporan estimadores de progreso aprendidos.
- Análisis de la influencia de la calidad de los datos: con 72 episodios exitosos de 108, el checkpoint permite estudiar el impacto de los rollouts fallidos en el rendimiento final de la política.
- Evaluación comparativa de checkpoints base: al partir del paso 80000 de RoboCasa y entrenarse sobre rollouts del paso 120000, facilita experimentos sobre el efecto del checkpoint de origen en el ajuste fino.
- Docencia e investigación en simulación robótica: útil en entornos académicos para ilustrar pipelines de LeRobot v2.1, RoboCasa365 y evaluación con semillas controladas, siempre que se respete la licencia (no declarada).

## Benchmarks y rendimiento

Resultados de éxito en simulación RoboCasa365 publicados en la model card (tarea PickPlaceCounterToCabinet, semilla de política 1):

| Checkpoint | Éxito en simulación |
|---|---|
| checkpoint-2000 | 26/50 (semillas 2000–2049) |
| checkpoint-4000 | 32/50 (semillas 2000–2049) |
| checkpoint-6000 | 27/50 (semillas 2000–2049) |
| checkpoint-8000 | 32/50 (semillas 2000–2049) |
| checkpoint-10000 | 31/50 (semillas 2000–2049); 62/100 en el conjunto completo |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un modelo de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (37,9 GB) incluye pesos y logs, pero no se desglosa el tamaño de los pesos ni el número de parámetros, por lo que no puede estimarse la VRAM con rigor.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una única GPU con batch 64, pero la model card no especifica el modelo de GPU empleado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es `gr00t`; la model card no menciona vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia. El uso previsto es la evaluación en RoboCasa365.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mlnha/gr00t-n15-pnp108-bc_10k` | no disponible | no disponible | 31/50 y 62/100 en PickPlaceCounterToCabinet (RoboCasa365) | no disponible | Hugging Face (0 descargas) |
| GR00T N1.5 (base, NVIDIA) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Referenciado como origen del ajuste fino |
| `robocasa/robocasa365_checkpoints` (paso 80000) | no disponible | no disponible | no disponible | no disponible | Referenciado como checkpoint de partida |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría (políticas de imitación para manipulación robótica) más allá de los checkpoints citados en la propia model card.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El entrenamiento se limita a una única tarea, un único embodiment (`new_embodiment`) y una única semilla (42), lo que reduce la diversidad de comportamientos aprendidos.
- Riesgo de sobreajuste y varianza: la tasa de éxito oscila entre 26/50 y 32/50 a lo largo de los checkpoints, sin una tendencia monótona clara; el resultado final (31/50) es inferior al máximo observado (32/50 en los pasos 4000 y 8000), lo que sugiere alta varianza en la evaluación.
- Calidad de datos: 36 de los 108 rollouts de entrenamiento no fueron exitosos, lo que puede introducir comportamientos subóptimos en la política.
- Alcance limitado: es un checkpoint de investigación para una tarea concreta en simulación; no se ha validado en robot real ni en otras tareas.
- Licencia no declarada: al no especificarse la licencia, no puede garantizarse el uso comercial ni la redistribución. Es imprescindible contactar con el autor o consultar el repositorio antes de cualquier uso en producción.
- Idiomas: no aplica ni se declara soporte multilingüe.
- Reproducibilidad: no se incluyen los estados del optimizador, por lo que no es posible reanudar el entrenamiento exactamente desde el punto final.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin revisión comunitaria ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlnha/gr00t-n15-pnp108-bc_10k
- GR00T N1.5 (NVIDIA): no disponible en la información proporcionada (referenciado en la model card como modelo base)
- Checkpoints de RoboCasa365: `robocasa/robocasa365_checkpoints` (referenciado en la model card; URL no proporcionada)
- RoboCasa365 (entorno de simulación): no disponible en la información proporcionada
- LeRobot v2.1 (formato de datos): no disponible en la información proporcionada
- TensorBoard (`runs/`): incluido en el repositorio del modelo
- Logs de entrenamiento (`train.log`): incluido en el repositorio del modelo
