# Haku-2004/act_k5ot_pred_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_k5ot_pred_20`, es una política entrenada con LeRobot sobre el dataset `Haku-2004/k5_4seg` y publicada en Hugging Face con licencia Apache 2.0. El modelo tiene 51.672.714 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras desplegables en hardware de consumo.

La relevancia de ACT radica en su enfoque de *action chunking*: en lugar de predecir una única acción por paso de control, el modelo genera secuencias cortas de acciones, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Es una de las políticas de referencia dentro del ecosistema LeRobot de Hugging Face, pensada para entrenamiento con datos de teleoperación y evaluación directa sobre robots como el SO-100.

Este checkpoint concreto no incluye información sobre el número de tokens de entrenamiento, composición del dataset ni resultados de evaluación publicados. La model card se limita a la plantilla estándar de LeRobot con instrucciones de entrenamiento e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.672.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo de acciones robóticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/k5_4seg |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT se basa en un transformer encoder-decoder con un *backbone* de visión (típicamente ResNet) que procesa las observaciones visuales y un decoder que genera *chunks* de acciones. La innovación principal del método, descrita en el paper arXiv:2304.13705, es la predicción de secuencias cortas de acciones junto con un mecanismo de *temporal ensembling* que suaviza las transiciones entre chunks consecutivos durante la inferencia.

El entrenamiento se realiza por imitación supervisada a partir de datos de teleoperación. En este caso, el dataset `Haku-2004/k5_4seg` contiene las demostraciones utilizadas, aunque no se especifica en la información disponible el número de episodios, la tarea concreta ni la composición de las observaciones (cámaras, estados propioceptivos). No se indica si hubo RLHF, DPO ni ningún otro ajuste posterior al entrenamiento supervisado.

## Capacidades

- Generación de acciones robóticas en forma de *chunks* cortos para control de manipuladores.
- Aprendizaje por imitación a partir de demostraciones de teleoperación.
- Procesamiento de observaciones visuales mediante backbone convolucional (según el método ACT estándar).
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Ejecución sobre robots de tipo SO-100 follower, según el ejemplo de la model card.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control motor, no un modelo de lenguaje.

## Casos de uso

- Manipulación robótica de precisión: la política predice chunks de acciones que reducen el jitter y mejoran la estabilidad en tareas de agarre y colocación sobre el robot SO-100.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT o para *fine-tuning* sobre nuevos datasets de teleoperación.
- Prototipado rápido en laboratorio: con 51,7 M de parámetros y 0,2 GB de pesos, se puede cargar y ejecutar en una estación de trabajo con GPU de consumo para validar pipelines de LeRobot.
- Evaluación de datasets de teleoperación: el comando `lerobot-record` con prefijo `eval_` permite medir la tasa de éxito de la política sobre el robot real y comparar contra el dataset de entrenamiento.
- Reproducción de experimentos: al estar publicada con licencia Apache 2.0, se puede reentrenar o modificar sin restricciones de uso comercial.
- Educación y docencia en robótica: ejemplo completo y ligero de un pipeline de entrenamiento e inferencia de políticas visomotoras con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 dado el tamaño de 51,7 M de parámetros (0,2 GB de pesos); en la práctica, el consumo depende del backbone visual y del tamaño de las imágenes de entrada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante).
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) como vía oficial; al ser safetensors, también se puede cargar con PyTorch directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| act_k5ot_pred_20 (este) | 51,7 M | no aplica | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | variable | Hugging Face |
| Políticas VQ-BeT (LeRobot) | variable | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Es una política específica para la tarea y el robot del dataset `k5_4seg`; no generaliza a otras tareas sin reentrenamiento.
- No hay información publicada sobre la tasa de éxito, el número de episodios de entrenamiento ni la variabilidad de las demostraciones.
- Riesgo de sobreajuste al entorno de teleoperación: cambios de iluminación, posición de cámara o configuración del robot pueden degradar el rendimiento.
- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Al ser un checkpoint con 0 descargas y 0 likes, no hay evidencia comunitaria de validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k5ot_pred_20
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
