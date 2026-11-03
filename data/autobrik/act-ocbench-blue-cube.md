# Autobrik/act-ocbench-blue-cube

## Resumen

`act-ocbench-blue-cube` es una política de control robótico basada en ACT (Action Chunking with Transformers) publicada por Autobrik y entrenada con la implementación de LeRobot. Resuelve una tarea concreta de manipulación: el pick-and-place de un cubo azul en el entorno de simulación OCBench, construido sobre MuJoCo con un brazo UR5e y una pinza Robotiq 2F-85. El modelo consume tres cámaras RGB de 224x224 y la propiocepción del robot en 7 dimensiones, y emite acciones absolutas de articulaciones y de la pinza a 50 Hz.

Con 51.670.663 parámetros y un checkpoint seleccionado en el paso 60000, no es un modelo de propósito general sino un artefacto de investigación reproducible: una política especializada, de código abierto (Apache 2.0) y ligera, pensada para evaluar recetas de entrenamiento y edición de pesos en robótica simulada. Su relevancia es metodológica: el autor publica de forma explícita la curva de checkpoints, la configuración de entrenamiento y el protocolo de evaluación, lo que permite reproducir y auditar el resultado.

La ficha describe únicamente lo que consta en la model card y en los metadatos de HuggingFace. No hay información sobre composición del dataset, número de episodios ni tasas de éxito en simulación, más allá de la referencia al repositorio de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), implementación LeRobot; encoder transformer de 4 capas y decoder de 1 capa, `dim_model` 512, backbone visual ResNet-18 |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (política de imitación; `chunk_size` de 100 pasos de acción, `n_action_steps` 1) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1.0 GB, con checkpoints en `checkpoints/<step>/`) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder para imitación robótica que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza el control. En esta configuración, el encoder tiene 4 capas y el decoder 1, con `dim_model` de 512, backbone visual ResNet-18 y un `chunk_size` de 100 con `n_action_steps` de 1 y `temporal_ensemble_coeff` de 0.01. La entrada son tres cámaras RGB de 224x224 más 7 dimensiones de propiocepción; la salida son objetivos absolutos de articulaciones y del driver de la pinza a 50 Hz.

El entrenamiento se realizó sobre el dataset `Autobrik/ocbench-blue-cube-pnp` durante 100.000 pasos, con `batch_size` de 8, `optimizer_lr` de 1e-05, `kl_weight` de 10.0 y un `eval_split` de 0.2, semilla 1000. Se guardaron checkpoints en los pasos 20000, 40000, 60000, 80000 y 100000; el publicado en la raíz es el de 60000, elegido por la menor pérdida de validación registrada (0.3847). El autor advierte que esa pérdida es un proxy y que las tasas de éxito en simulación se reportan en el repositorio de código, no en la model card.

## Capacidades

- Control robótico de manipulación: genera acciones absolutas de articulaciones y de la pinza a 50 Hz para una tarea de pick-and-place.
- Percepción multimodal: procesa tres vistas RGB de 224x224 junto con propiocepción de 7 dimensiones.
- Predicción por chunks: emite secuencias de 100 acciones con ejecución de un paso y ensamblado temporal.
- Ejecución en simulación MuJoCo sobre UR5e con pinza Robotiq 2F-85 (entorno OCBench).
- Integración con LeRobot: carga mediante `ACTPolicy.from_pretrained` y pre/post-procesadores de la fábrica de LeRobot.
- Evaluación reproducible mediante la herramienta `act-rollout` del repositorio del autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos de imitación: cargar el checkpoint de 60000 pasos y ejecutar `act-rollout` para verificar las tasas de éxito publicadas en el repositorio, con la configuración exacta de la model card.
- Línea base para comparación de recetas: servir como referencia fija frente a variantes de ACT con distinto `chunk_size`, backbone visual o número de cámaras, ya que la configuración está documentada de forma completa.
- Estudio de edición de pesos: el repositorio asociado (`act-weight-editing`) sugiere usar esta política como sujeto de experimentos de modificación de pesos y medir su efecto en la tarea del cubo azul.
- Evaluación de robustez perceptiva: al depender de tres cámaras, permite analizar el impacto de oclusiones o cambios de iluminación en simulación reentrenando o evaluando variantes del entorno.
- Docencia y formación en robótica: ejemplo compacto (51,7 M de parámetros, 1 GB de repositorio) de un pipeline completo de imitación con LeRobot, desde el dataset hasta el rollout.
- Prototipado de control en brazos UR5e: las acciones absolutas de articulaciones a 50 Hz facilitan trasladar la política a un gemelo digital MuJoCo antes de cualquier despliegue físico.
- Comparación de checkpoints intermedios: los cinco checkpoints guardados permiten estudiar la evolución de la pérdida de validación y el sobreajuste en políticas de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye la pérdida de validación por checkpoint y remite las tasas de éxito en simulación al repositorio de código.

| Step | Pérdida de validación | |
|---|---|---|
| 20000 | 0.3972 | |
| 40000 | 0.3919 | |
| 60000 | 0.3847 | seleccionado |
| 80000 | 0.3978 | |
| 100000 | 0.3874 | |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que el grueso del consumo proviene del backbone ResNet-18 y de las tres cámaras de 224x224.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA y al menos 4-8 GB de VRAM debería ser suficiente para inferencia; los 1,0 GB del repositorio incluyen todos los checkpoints, no solo el seleccionado.
- GPU de consumo: previsiblemente cabe en tarjetas consumer (RTX 3060, RTX 4060, RTX 4090), aunque no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: LeRobot (`ACTPolicy.from_pretrained` con `make_pre_post_processors`) y la herramienta `act-rollout` del repositorio del autor para evaluación en MuJoCo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control es de 50 Hz y la ejecución usa `n_action_steps` de 1 con ensamblado temporal de coeficiente 0.01, pero no se publican tiempos por paso.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Cualitativamente, las alternativas habituales en este espacio serían otras políticas de imitación de LeRobot (por ejemplo, Diffusion Policy) y políticas generalistas como OpenVLA o π0, pero no se han facilitado sus cifras para contrastarlas con este checkpoint.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| act-ocbench-blue-cube | 51,7 M | no aplica (`chunk_size` 100) | Apache 2.0 | HuggingFace |
| Diffusion Policy (LeRobot) | no disponible | no aplica | no disponible | no disponible |
| OpenVLA | no disponible | no disponible | no disponible | no disponible |
| π0 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (pick-and-place de un cubo azul) en un único entorno simulado (OCBench, MuJoCo, UR5e + Robotiq 2F-85); no generaliza a otras tareas, objetos ni robots.
- Sin validación en hardware real: toda la evaluación es en simulación; no hay evidencia de transferencia sim-to-real.
- Métrica de selección débil: el checkpoint se eligió por pérdida de validación, que el propio autor califica de proxy; las tasas de éxito reales están fuera de la model card.
- Riesgo de sobreajuste al dataset: con un único dataset de demostraciones y 100.000 pasos, la política puede memorizar trayectorias y fallar ante variaciones de posición inicial, iluminación o textura.
- Sin información sobre sesgos ni composición del dataset: no se detalla el número de episodios, la variabilidad de condiciones ni posibles desequilibrios en las demostraciones.
- Sin cuantizaciones publicadas: no hay versiones GGUF, ONNX ni int8, lo que limita el despliegue en entornos con restricciones de memoria.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantías y de evaluación fuera del entorno original hace desaconsejable su uso en producción sin una validación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de replicaciones independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Autobrik/act-ocbench-blue-cube
- Dataset de entrenamiento: https://huggingface.co/datasets/Autobrik/ocbench-blue-cube-pnp
- Repositorio de código, contrato de datos y protocolo de evaluación: https://github.com/BrikHMP18/act-weight-editing
