# jogarulfop/policy_2026-08-31_shake4it_bench_5sensors_pastille_pzt_10kHz_nfft_512

## Resumen

El modelo `jogarulfop/policy_2026-08-31_shake4it_bench_5sensors_pastille_pzt_10kHz_nfft_512` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de HuggingFace. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación. Este modelo concreto se ha entrenado para una tarea de banco de pruebas denominada "shake4it bench" que involucra cinco sensores, incluyendo una pastilla piezoeléctrica (PZT), con muestreo a 10 kHz y una transformada rápida de Fourier (nfft) de 512 puntos.

El modelo tiene 51.668.614 parámetros y está publicado bajo licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones significativas. Su relevancia radica en que demuestra la aplicación de ACT a tareas que requieren procesamiento de señales de alta frecuencia (vibraciones, acelerómetros, cargas) para el control de robots, un área emergente en la robótica de manipulación fina. Al estar integrado en el ecosistema LeRobot, puede reproducirse, evaluarse y desplegarse fácilmente con las herramientas estándar de HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer encoder-decoder |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de robótica, no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (0.2 GB repo) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers que combina un encoder de visión (normalmente ResNet) con un decoder transformer que genera secuencias de acciones. El modelo se entrena mediante aprendizaje por imitación a partir de datos teleoperados, utilizando una pérdida de regresión sobre las acciones y una pérdida de consistencia temporal (temporal ensembling) para suavizar las predicciones. En este caso, el modelo se ha entrenado con el framework LeRobot, que gestiona el dataset, el entrenamiento y la evaluación de forma estandarizada.

El dataset asociado (`jogarulfop/2026-08-31_shake4it_bench_5sensors_pastille_pzt_10kHz_nfft_512`) sugiere que la entrada al modelo incluye señales de cinco sensores muestreados a 10 kHz, con un preprocesado basado en FFT de 512 puntos. Esto indica que la política procesa información de vibración o fuerza (pastilla PZT, acelerómetros, celdas de carga) para generar comandos de actuación. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que no se publican en la model card.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks) para un robot, típicamente un brazo manipulador, a partir de observaciones sensoriales.
- Procesamiento de señales de alta frecuencia: el modelo está entrenado con datos de sensores a 10 kHz (PZT, acelerómetros, etc.), lo que le permite reaccionar a vibraciones y fuerzas dinámicas.
- Integración con LeRobot: compatible con el ecosistema de HuggingFace para robótica, incluyendo entrenamiento, evaluación y despliegue mediante comandos `lerobot-train` y `lerobot-record`.
- No soporta procesamiento de lenguaje natural, tool calling ni capacidades multimodales generales; es un modelo especializado en control motor.
- Capacidad de generalización limitada a la tarea específica del banco de pruebas "shake4it bench" para la que fue entrenado.

## Casos de uso

- Manipulación fina con retroalimentación de vibración: el modelo puede controlar un efector final que debe detectar y responder a vibraciones (por ejemplo, insertar una pieza en un encaje) gracias a la entrada de sensores PZT a 10 kHz.
- Control de calidad automatizado: en una línea de producción, el robot puede realizar pruebas de "shake" o agitación sobre componentes y ajustar su actuación en tiempo real según las señales de los sensores.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo ACT se comporta con entradas de alta frecuencia y múltiples sensores, comparando con políticas que usan solo visión.
- Benchmarking de políticas robóticas: el banco "shake4it bench" permite evaluar y comparar diferentes políticas (ACT, diffusion policies, etc.) en una tarea estandarizada con sensores heterogéneos.
- Desarrollo de sistemas de ensamblaje adaptable: el robot puede aprender a ajustar la fuerza o la velocidad de inserción basándose en las lecturas de la pastilla PZT, mejorando la robustez frente a variaciones en las piezas.
- Educación y prototipado: al ser un modelo pequeño (51M parámetros) y con licencia Apache-2.0, es adecuado para cursos de robótica y prototipos en laboratorios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. Se recomienda consultar el dataset asociado o ejecutar evaluaciones propias con el comando `lerobot-record` para obtener datos de rendimiento en la tarea específica.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7M parámetros, la inferencia puede ejecutarse en GPUs con al menos 4 GB de VRAM en precisión FP32, y menos de 2 GB si se cuantiza a int8 (aunque no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA RTX 3060, RTX 4090, A100) es suficiente. El entrenamiento probablemente requiera al menos 8-12 GB de VRAM, pero la inferencia es ligera.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo como la RTX 3060 o superiores.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia en tiempo real con robots físicos (por ejemplo, SO-100). También puede exportarse a ONNX o TensorRT para despliegue en edge, aunque no se documenta explícitamente.
- Latencia y throughput: no disponible. Dado el tamaño del modelo y la entrada de sensores a 10 kHz, se espera una latencia de inferencia inferior a 10 ms en una GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jogarulfop/policy_2026-08-31_shake4it_bench_5sensors_pastille_pzt_10kHz_nfft_512` | 51,7M | no disponible | Shake4it bench (5 sensores, PZT) | Apache-2.0 | HuggingFace |
| `jogarulfop/policy_2026-07-28_shake4it_bench_dragonfly_10kHz_nfft_512` | no disponible | no disponible | Shake4it bench (sensor dragonfly) | Apache-2.0 | HuggingFace |
| `jogarulfop/policy_2026-07-28_shake4it_bench_accelero_10kHz_nfft_512` | no disponible | no disponible | Shake4it bench (acelerómetro) | Apache-2.0 | HuggingFace |

No se dispone de información sobre el rendimiento relativo de estos modelos. Todos pertenecen a la misma familia de políticas ACT entrenadas con LeRobot para variantes del banco "shake4it bench", diferenciándose en el tipo de sensor utilizado. No hay datos públicos de benchmarks comparativos.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado para una tarea concreta (shake4it bench con 5 sensores específicos) y no generaliza a otras tareas o configuraciones de sensores sin reentrenamiento.
- Dependencia del dataset: el rendimiento depende críticamente de la calidad y variedad de los datos teleoperados; no se publican detalles sobre el número de episodios ni la diversidad de condiciones.
- Sin soporte de lenguaje o razonamiento general: no es un modelo multimodal ni de propósito general; solo genera acciones motoras a partir de observaciones sensoriales.
- Riesgo de sobreajuste: al ser un modelo pequeño y especializado, puede sobreajustarse a las condiciones específicas del banco de pruebas, fallando ante variaciones no vistas (cambios de iluminación, desgaste de sensores, etc.).
- Sin cuantizaciones oficiales: no se proporcionan versiones GGUF, ONNX o cuantizadas, lo que puede limitar su despliegue en hardware edge sin conversión manual.
- Ausencia de benchmarks publicados: no hay métricas de éxito ni comparaciones con otras políticas, lo que dificulta evaluar su calidad relativa.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento (dataset asociado) no tengan restricciones adicionales, ya que la licencia del modelo no cubre necesariamente los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jogarulfop/policy_2026-08-31_shake4it_bench_5sensors_pastille_pzt_10kHz_nfft_512
- Dataset asociado: https://huggingface.co/datasets/jogarulfop/2026-08-31_shake4it_bench_5sensors_pastille_pzt_10kHz_nfft_512
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelos relacionados del mismo autor: https://huggingface.co/jogarulfop/policy_2026-07-28_shake4it_bench_dragonfly_10kHz_nfft_512 y https://huggingface.co/jogarulfop/policy_2026-07-28_shake4it_bench_accelero_10kHz_nfft_512
