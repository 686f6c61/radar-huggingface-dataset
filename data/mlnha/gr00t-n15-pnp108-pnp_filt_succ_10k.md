# mlnha/gr00t-n15-pnp108-pnp_filt_succ_10k

## Resumen

`mlnha/gr00t-n15-pnp108-pnp_filt_succ_10k` es un checkpoint de investigación derivado de GR00T N1.5, el modelo fundacional de robótica humanoide desarrollado por NVIDIA. El autor lo publica como parte de un estudio sobre estimadores de progreso de tarea como señal de entrenamiento en behavior cloning (BC). En concreto, el modelo es el resultado de un fine-tuning de GR00T N1.5 sobre 72 episodios exitosos de la tarea PickPlaceCounterToCabinet del simulador RoboCasa365, recogidos con un checkpoint previo del propio modelo (checkpoint-120000) en formato LeRobot v2.1.

El checkpoint es un policy de imitación puro: no es un modelo de lenguaje ni un modelo multimodal de propósito general, sino una política visomotora que mapea observaciones (imágenes de cámara y estado del robot) a acciones de control. El repositorio contiene los pesos en safetensors (37,9 GB) y los logs de entrenamiento en TensorBoard, pero no incluye estados del optimizador ni el código de evaluación.

Es relevante como referencia metodológica para quien investigue pipelines de behavior cloning con datos filtrados por éxito en robótica de manipulación, y como punto de partida reproducible (seed 42, hiperparámetros documentados) para experimentos de sim-to-real en RoboCasa. No está pensado para uso en producción: no tiene licencia declarada y su rendimiento en simulación ronda el 54-66 % de éxito según el checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.5 (política visomotora transformer, base NVIDIA); detalles internos no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 37,9 GB); logs en TensorBoard |

## Arquitectura y entrenamiento

El modelo parte de GR00T-N1.5, en concreto del checkpoint de preentrenamiento `robocasa/robocasa365_checkpoints` (paso 80000), y se ajusta con behavior cloning estándar sobre episodios exitosos únicamente. El conjunto de datos `pnp108` contiene 108 rollouts generados por el checkpoint-120000 de GR00T sobre la tarea PickPlaceCounterToCabinet, de los cuales 72 son exitosos y constituyen el material de entrenamiento. Los datos están en formato LeRobot v2.1 y se usa el embodiment `new_embodiment`.

El entrenamiento se realizó en una sola GPU, con batch de 64, learning rate 3e-5 con schedule coseno y warmup del 5 %, y semilla 42. Se generaron checkpoints cada 2000 pasos hasta 10000. La evaluación se hizo en el simulador RoboCasa365 con semillas de escena a partir de 2000 y semilla de política 1, considerando éxito si la tarea se completa al final del episodio. No se documentan innovaciones arquitectónicas adicionales (decodificación especulativa, atención lineal, RLHF/DPO) en la información disponible.

## Capacidades

- Control visomotor para manipulación robótica: ejecuta la tarea PickPlaceCounterToCabinet (recoger un objeto de la encimera y colocarlo en el armario) a partir de observaciones de cámara y estado del robot.
- Behavior cloning puro: imita la política del checkpoint generador de datos, sin componente de razonamiento explícito.
- Entrenamiento y evaluación reproducibles: hiperparámetros, semilla y partición de escenas documentados.
- Integración con el ecosistema LeRobot v2.1 para carga de datos y con la librería `gr00t` para inferencia.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no procesa lenguaje).
- Modo thinking, visión general, audio: no disponibles; la visión se limita a la percepción necesaria para la política de control.

## Casos de uso

- Reproducción de experimentos de behavior cloning: sirve como referencia con seed e hiperparámetros fijados para comparar variantes de filtrado de datos (solo éxitos frente a éxitos y fracasos) en la misma tarea y simulador.
- Estudio de estimadores de progreso de tarea: el checkpoint es el resultado de una de las ramas del estudio del autor y permite contrastar la señal de éxito binaria con estimadores aprendidos.
- Punto de partida para fine-tuning en RoboCasa365: al derivar de un preentrenamiento RoboCasa, puede reajustarse con datos propios de manipulación en escenas similares.
- Evaluación de robustez en simulación: las tasas de éxito por checkpoint (29/50 a 33/50) permiten analizar la varianza entre pasos de entrenamiento y la estabilidad del policy.
- Docencia e investigación en robótica de manipulación: ejemplo completo de pipeline (generación de rollouts, filtrado por éxito, entrenamiento BC, evaluación en simulador) con artefactos publicados.
- Baseline en competiciones o benchmarks internos de RoboCasa: política de referencia para comparar métodos de imitación en PickPlaceCounterToCabinet.
- Análisis de sim-to-real: aunque no hay validación en hardware, el checkpoint puede usarse como candidato para pruebas de transferencia en entornos controlados.

## Benchmarks y rendimiento

Resultados de éxito en simulación RoboCasa365 (semillas de escena 2000-2049, semilla de política 1), según la model card:

| Checkpoint | Éxito en simulación |
|---|---|
| checkpoint-2000 | 29/50 (58 %) |
| checkpoint-4000 | 27/50 (54 %) |
| checkpoint-6000 | 28/50 (56 %) |
| checkpoint-8000 | 33/50 (66 %) |
| checkpoint-10000 | 30/50 (60 %) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con políticas alternativas en la misma tarea.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el repo pesa 37,9 GB en safetensors, lo que da una cota inferior orientativa para cargar los pesos en precisión completa.
- GPU recomendadas: el entrenamiento se hizo en una sola GPU con batch 64; no se especifica el modelo. Para inferencia se recomienda una GPU con al menos la memoria necesaria para los pesos completos (A100 80 GB o H100 como opciones conservadoras).
- ¿Cabe en GPU de consumo? No confirmado; con 37,9 GB de pesos en safetensors, no cabe en GPUs de 24 GB (RTX 4090) sin cuantización o sharding, y no se documentan formatos cuantizados.
- Opciones de despliegue: librería `gr00t` (declarada como `library_name`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de control.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Contexto / datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`pnp_filt_succ_10k`) | GR00T N1.5 (RoboCasa pretraining-80000) | PickPlaceCounterToCabinet | 72 episodios exitosos, 10k pasos | no disponible | Hugging Face, 0 descargas |
| GR00T N1.5 base (NVIDIA) | — | Política fundacional humanoide | no disponible en esta ficha | no disponible | Referencia del autor; pesos base no verificados aquí |
| Checkpoint generador de datos (`pnp108`, checkpoint-120000) | GR00T N1.5 | PickPlaceCounterToCabinet | 108 rollouts | no disponible | Referenciado en la model card, no enlazado |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la comparación se limita a procedencia y configuración de datos.

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor lo describe como parte de un estudio, no como modelo listo para producción.
- Licencia no declarada: no hay términos de uso comercial ni de redistribución; no debe usarse en productos sin aclarar la licencia con el autor y con NVIDIA (base GR00T).
- Rendimiento moderado y variable: entre el 54 % y el 66 % de éxito en simulación, con fluctuaciones no monótonas entre checkpoints; no hay garantía de generalización a otras escenas o tareas.
- Especialización estrecha: entrenado solo en PickPlaceCounterToCabinet con un embodiment concreto (`new_embodiment`); no transferirá directamente a otras tareas de manipulación.
- Riesgo de sobreajuste a los rollouts del checkpoint generador: los datos provienen de una única política y semilla, lo que puede limitar la diversidad de comportamientos aprendidos.
- Sin validación en hardware real documentada: el éxito se mide únicamente en el simulador RoboCasa365.
- Sin estados del optimizador: no es posible reanudar el entrenamiento exactamente desde estos checkpoints.
- Riesgo de alucinación: no aplica en el sentido de lenguaje; el riesgo equivalente es ejecutar acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Sesgos: no documentados; en robótica, los sesgos de datos se manifiestan como fallos sistemáticos ante objetos, posiciones o iluminaciones no vistas.

## Enlaces

- Hugging Face: https://huggingface.co/mlnha/gr00t-n15-pnp108-pnp_filt_succ_10k
- GR00T N1.5 (NVIDIA): no disponible en la información proporcionada
- RoboCasa365: no disponible en la información proporcionada
- LeRobot v2.1: no disponible en la información proporcionada
- Paper o blog del estudio: no disponible en la información proporcionada
