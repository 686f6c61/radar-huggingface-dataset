# Gyseop/omx_realreal1

## Resumen

`Gyseop/omx_realreal1` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers), publicado originalmente en el paper arXiv:2304.13705. El modelo lo desarrolla el usuario Gyseop y está empaquetado con la librería LeRobot de Hugging Face, orientada al entrenamiento y despliegue de políticas de robótica de imitación. No es un modelo de lenguaje: su función es mapear observaciones (típicamente imágenes de cámara y estado de las articulaciones) a secuencias cortas de acciones motoras para controlar un robot manipulador.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras que pueden ejecutarse en hardware modesto. Se entrenó sobre el dataset `Gyseop/record-realreal1`, un conjunto de datos de teleoperación grabado por el propio autor, y está pensado para controlar un robot del tipo SO-100 (el README muestra ejemplos con `so100_follower`).

Su relevancia es acotada pero clara: es un ejemplo reproducible de extremo a extremo de cómo entrenar una política ACT con LeRobot a partir de datos propios de teleoperación y desplegarla para evaluación. Resulta útil para quienes quieren replicar el flujo de trabajo de imitación robótica sin partir de cero, aunque carece de documentación sobre rendimiento, composición del dataset y condiciones de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT predice chunks de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de un único paso por inferencia. La arquitectura combina un codificador de imágenes (típicamente una CNN tipo ResNet preentrenada) con un transformer que procesa la secuencia de observaciones y genera un chunk de acciones futuras. Esta formulación reduce el error de acumulación típico de las políticas paso a paso y suele lograr tasas de éxito altas con datos de teleoperación.

El modelo se entrenó con LeRobot sobre el dataset `Gyseop/record-realreal1`, grabado mediante teleoperación. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens o pasos de entrenamiento, ni sobre el uso de técnicas de RLHF o DPO (no aplicables en este contexto). Tampoco se documentan innovaciones adicionales más allá de las propias del método ACT original.

## Capacidades

- Control robótico por imitación: genera chunks de acciones motoras a partir de observaciones visuales y de estado del robot.
- Aprendizaje a partir de teleoperación: entrenado con demostraciones humanas grabadas sobre un robot real.
- Ejecución en bucle cerrado: pensado para inferencia iterativa durante la operación del robot (lerobot-record).
- Compatibilidad con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Integración con robots tipo SO-100: el README muestra el uso con `so100_follower`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Replicación de experimentos de imitación robótica: sirve como punto de partida para reproducir el pipeline completo de LeRobot (grabación, entrenamiento y evaluación) con datos propios.
- Manipulación de objetos con un SO-100: el modelo puede desplegarse en un robot de bajo coste para tareas de pick-and-place aprendidas por teleoperación.
- Evaluación comparativa de políticas ACT: útil para contrastar variantes de arquitectura o de datos dentro del mismo framework.
- Docencia y formación: ejemplo didáctico de entrenamiento de políticas con `lerobot-train` y evaluación con `lerobot-record`.
- Prototipado rápido en laboratorio: al tener solo ~51,7 M de parámetros, permite iterar con hardware de gama media.
- Investigación en aprendizaje por imitación: base para estudiar el efecto del chunking de acciones y de la composición del dataset en la tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no disponible en la documentación; el README usa `--policy.device=cuda`, por lo que se espera una GPU NVIDIA con CUDA.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con CUDA (p. ej. RTX 3060 o superior), aunque no se documenta oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gyseop/omx_realreal1 (ACT) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia (LeRobot) | variable | no aplica | no disponible | Apache 2.0 | Hugging Face / GitHub |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | no disponible | según implementación | Hugging Face / GitHub |
| Políticas VQ-BeT (LeRobot) | variable | no aplica | no disponible | según implementación | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa; la comparación se limita a la familia de métodos disponibles en LeRobot (ACT, Diffusion Policy, VQ-BeT).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con benchmarks de NLP ni usarse para tareas de texto.
- Sin documentación sobre el dataset de entrenamiento (`Gyseop/record-realreal1`): se desconoce el número de episodios, la variabilidad de escenarios y la calidad de las demostraciones.
- Sin métricas publicadas de tasa de éxito ni de generalización; el rendimiento real en el robot es desconocido.
- Riesgo de sobreajuste al entorno de grabación: al entrenarse con datos de un único setup, es probable que no generalice a otras cámaras, iluminaciones u objetos.
- Sesgos: no aplica en el sentido de sesgos lingüísticos, pero sí posibles sesgos de distribución derivados de las demostraciones humanas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; tratar como experimental.
- Fechas de creación y actualización (2026-11-21) posteriores a la fecha habitual de referencia; verificar la vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gyseop/omx_realreal1
- Dataset de entrenamiento: https://huggingface.co/datasets/Gyseop/record-realreal1
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
