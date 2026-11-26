# nuntasha/omx_act_place

## Resumen

`nuntasha/omx_act_place` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación presentada en el artículo arXiv:2304.13705. El modelo predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado y suele alcanzar tasas de éxito elevadas en tareas de manipulación aprendidas a partir de datos de teleoperación. Lo publica el usuario `nuntasha` en Hugging Face mediante la librería LeRobot de Hugging Face.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras aptas para inferencia en tiempo real en hardware de consumo. Está entrenado sobre el dataset `nuntasha/omx_place`, presumiblemente orientado a una tarea de colocación (place) en un entorno robótico concreto. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es acotada pero práctica: se trata de un checkpoint de política específico para una tarea y un robot determinados, no de un modelo de propósito general. Resulta útil como referencia reproducible de un pipeline LeRobot completo (entrenamiento con `lerobot-train`, evaluación con `lerobot-record`) y como punto de partida para experimentos de imitación en manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones en la información proporcionada) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en cada paso de inferencia el modelo emite un bloque de k acciones futuras, que se ejecutan de forma abierta o con agregación temporal (temporal ensembling) para suavizar la trayectoria. La arquitectura típica de ACT incluye un codificador de imágenes (ResNet) para las observaciones visuales, un codificador de estado propioceptivo y un decodificador transformer con consultas aprendidas que generan las acciones. El modelo se entrena con pérdida L1 sobre las acciones de demostración teleoperadas, sin RLHF ni DPO.

Los datos de entrenamiento provienen del dataset `nuntasha/omx_place`, que no está descrito en detalle en la información disponible: no se especifica el número de episodios, la composición de las observaciones ni la plataforma robótica exacta (el ejemplo de la model card usa `so100_follower`, pero no se confirma que sea el robot real del entrenamiento). No se documentan innovaciones adicionales más allá de las propias del método ACT original.

## Capacidades

- Predicción de acciones robóticas en forma de chunks para tareas de manipulación aprendidas por imitación.
- Control visuomotor a partir de observaciones de cámara y estado propioceptivo del robot.
- Ejecución de una tarea específica de colocación (place) correspondiente al dataset `omx_place`.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión general, audio ni modo de razonamiento.

## Casos de uso

- Replicación de experimentos de imitación: sirve como checkpoint de referencia para reproducir el pipeline `lerobot-train` + `lerobot-record` sobre el dataset `omx_place` y validar la configuración de entrenamiento.
- Automatización de una tarea de pick-and-place en laboratorio: el modelo ejecuta la política aprendida sobre el robot para el que fue entrenado, con la ventaja de los chunks de acción para trayectorias más estables.
- Base para fine-tuning en tareas similares: al ser un ACT de 51,7 M de parámetros con licencia Apache 2.0, puede reentrenarse con datos propios de otra tarea de colocación con coste computacional bajo.
- Evaluación comparativa de políticas: útil como línea base frente a otras políticas LeRobot (Diffusion Policy, TDMPC, VQ-BeT) en el mismo entorno y dataset.
- Docencia y prototipado en robótica: el tamaño reducido (0,2 GB) permite desplegarlo en estaciones de trabajo con GPU de consumo para demostraciones de aprendizaje por imitación.
- Pruebas de integración de LeRobot en producción: valida el flujo de carga de checkpoints desde el Hub, la grabación de episodios de evaluación y la métrica de tasa de éxito antes de escalar a tareas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para 51,7 M de parámetros; en la práctica, el consumo depende del codificador visual y del tamaño de las imágenes de entrada, pero cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia en tiempo real; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; también es viable en CPU para pruebas no críticas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de dispositivos CUDA vía `--policy.device=cuda`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nuntasha/omx_act_place | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | no aplica | tasas de éxito altas en tareas de manipulación según el paper | no disponible en la información | paper y código de referencia |
| Otras políticas LeRobot (Diffusion Policy, VQ-BeT, TDMPC) | no disponible | no aplica | no disponible | no disponible | Hugging Face (LeRobot) |

La comparación cuantitativa con alternativas no es posible con los datos disponibles; la única referencia sólida es el paper original de ACT, que reporta buenos resultados en tareas de imitación pero sin cifras reproducibles aquí.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una tarea y un robot concretos; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin datos de evaluación publicados: no hay tasas de éxito ni métricas reproducibles en la model card, por lo que su rendimiento real es desconocido.
- Dataset de entrenamiento no documentado: se desconoce el número de episodios, la diversidad de condiciones de iluminación y la variabilidad de posiciones, lo que impide estimar su robustez.
- Riesgo de sobreajuste al entorno de demostración: como toda política de imitación, puede fallar ante cambios de fondo, iluminación o posiciones iniciales no vistas.
- Sin capacidades lingüísticas ni de razonamiento: no debe evaluarse con benchmarks de texto ni usarse como modelo de propósito general.
- Sin sesgos lingüísticos conocidos por no procesar lenguaje, pero pueden existir sesgos visuales heredados de los datos de teleoperación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuntasha/omx_act_place
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/nuntasha/omx_place
