# nuntasha/act_omx_right_blue

## Resumen

`nuntasha/act_omx_right_blue` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), el método presentado en el paper arXiv 2304.13705. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está asociado al dataset `nuntasha/omx_right_blue`. Su propósito es controlar un robot manipulador (la model card muestra ejemplos con el brazo SO-100 follower) a partir de observaciones visuales y del estado de las articulaciones, generando comandos de acción.

ACT aborda el problema del aprendizaje por imitación desde demostraciones de teleoperación: en lugar de predecir una acción por paso, predice fragmentos cortos de acciones (action chunks), lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y desplegable en hardware modesto.

Es relevante para desarrolladores e investigadores que quieran reproducir o adaptar políticas de manipulación robótica de bajo coste con licencia Apache 2.0. No obstante, se trata de un modelo muy específico, entrenado sobre un único dataset de un robot concreto, sin métricas publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación supervisado que combina un backbone transformer con un mecanismo de predicción de chunks de acciones. El modelo observa imágenes de cámaras y el estado de las articulaciones del robot, y produce una secuencia corta de acciones futuras en lugar de una única acción. Esta formulación, descrita en el paper 2304.13705, reduce la varianza temporal y mejora la tasa de éxito en tareas de manipulación frente a políticas paso a paso.

El entrenamiento se realiza sobre datos de teleoperación. En este caso, el dataset asociado es `nuntasha/omx_right_blue`, del que no se dispone de detalles sobre número de episodios, composición, tareas ni número de tokens o muestras en la información proporcionada. No se indica si hubo RLHF, DPO ni ningún otro ajuste posterior; ACT es puramente imitación supervisada. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de manipulación mediante predicción de chunks de acciones a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de demostraciones de teleoperación.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- Ejecución de políticas en robots tipo SO-100 follower, según los ejemplos de la model card.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede ejecutar tareas de pick-and-place aprendidas de teleoperación sobre el robot y dataset concretos, gracias a su política ACT entrenada específicamente para ese entorno.
- Reproducción de experimentos de imitación: investigadores pueden partir de este checkpoint para comparar variantes de ACT o de otros métodos de LeRobot sobre el mismo dataset `omx_right_blue`.
- Prototipado de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, es viable entrenar y desplegar en una estación de trabajo con una GPU consumer, lo que facilita iteraciones rápidas.
- Evaluación de políticas en robot real: mediante `lerobot-record` con `--policy.path` apuntando a este checkpoint, se pueden grabar episodios de evaluación y medir tasas de éxito.
- Base para fine-tuning en tareas similares: al ser Apache 2.0, puede ajustarse sobre nuevos datasets de teleoperación del mismo robot o de robots compatibles.
- Docencia y formación en robótica: sirve como ejemplo completo y ligero de un pipeline LeRobot de extremo a extremo (dataset, entrenamiento, evaluación).
- Integración en pipelines de investigación de aprendizaje por imitación: permite comparar action chunking frente a políticas paso a paso en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros, 0,2 GB de pesos), es esperable que quepa holgadamente en GPUs consumer, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. La model card usa `--policy.device=cuda` como ejemplo genérico.
- ¿Cabe en GPU consumer? Muy probablemente sí, dado el reducido tamaño, pero no se especifica qué modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nuntasha/act_omx_right_blue | 51,7 M | no disponible | no disponible | apache-2.0 | Hugging Face |
| Otras políticas ACT en LeRobot | no disponible | no disponible | no disponible | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no disponible | no disponible | variable | Hugging Face |
| Políticas VQ-BeT / TDMPC en LeRobot | no disponible | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos comparativos concretos de parámetros, contexto ni rendimiento para alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de un robot y un dataset concretos (`omx_right_blue`); no es un modelo general y no se espera que funcione fuera de ese entorno sin reentrenamiento.
- Sin métricas publicadas de tasa de éxito, generalización ni robustez; no se puede evaluar su rendimiento objetivamente con la información disponible.
- Riesgo de sobreajuste al dataset de teleoperación y de degradación ante cambios de iluminación, posición de cámara o configuración del robot.
- No es un modelo de lenguaje: no procesa texto ni responde a instrucciones en lenguaje natural.
- No se documentan sesgos, pero al ser un modelo robótico los sesgos se manifiestan como comportamientos erróneos o inseguros en el robot real.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia y calidad del dataset antes de usar en producción.
- Advertencia de seguridad: cualquier despliegue en un robot físico debe contar con paradas de emergencia y límites de seguridad independientes del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuntasha/act_omx_right_blue
- Dataset asociado: https://huggingface.co/datasets/nuntasha/omx_right_blue
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
