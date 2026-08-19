# lenawngr/ACT_switch-1-top_cs15_v5

## Resumen

El modelo `lenawngr/ACT_switch-1-top_cs15_v5` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido entrenado por el usuario lenawngr utilizando la librería LeRobot de Hugging Face, sobre el dataset `lenawngr/SWITCH-1-top`, que contiene demostraciones teleoperadas de una tarea de manipulación de un interruptor (switch) desde una cámara superior.

El modelo resuelve el problema de control de un robot manipulador mediante imitación directa de demostraciones humanas, logrando altas tasas de éxito en la tarea específica para la que fue entrenado. Con 51,58 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero que puede ejecutarse en hardware de consumo. Su relevancia radica en ser un ejemplo práctico de entrenamiento y despliegue de políticas robóticas con LeRobot, una herramienta de código abierto que democratiza el aprendizaje por imitación.

La arquitectura ACT combina un codificador de visión con un transformador que genera acciones en bloques, lo que permite un control suave y robusto. La licencia Apache 2.0 facilita su uso comercial y académico. No se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados, al tratarse de un modelo de robótica y no de procesamiento de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.581.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que utiliza un transformador para predecir un bloque de acciones futuras (por ejemplo, 10 o 20 pasos) a partir de observaciones actuales y pasadas. El modelo emplea un codificador de imágenes (típicamente ResNet) para procesar las observaciones visuales y un decodificador autorregresivo que genera las acciones del robot. Esta predicción por chunks reduce la acumulación de errores y produce movimientos más suaves que los métodos paso a paso.

El entrenamiento se realizó con el dataset `lenawngr/SWITCH-1-top`, que contiene demostraciones teleoperadas de la tarea de accionar un interruptor. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento como RLHF o DPO. El modelo fue entrenado y subido al Hub mediante LeRobot, siguiendo el flujo estándar de esta librería. No se mencionan innovaciones técnicas adicionales más allá de las propias de ACT.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones para manipulación de objetos, específicamente la tarea de accionar un interruptor.
- Procesamiento de observaciones visuales: utiliza imágenes de una cámara superior como entrada para generar comandos de movimiento.
- Generación de acciones en bloques: produce chunks de acciones que permiten un control más estable y fluido.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera del ámbito robótico.
- No tiene capacidades de lenguaje natural ni de visión general más allá de la tarea específica.

## Casos de uso

- Automatización de tareas de conmutación: el modelo puede controlar un brazo robótico para accionar interruptores o botones en entornos industriales o domésticos, gracias a su entrenamiento específico en la tarea SWITCH-1-top.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT entre diferentes configuraciones de robots o entornos.
- Prototipado rápido de control robótico: al ser ligero (51M parámetros), puede desplegarse en estaciones de trabajo con GPU de gama media para validar conceptos antes de escalar a modelos más grandes.
- Evaluación de pipelines de LeRobot: permite probar el flujo completo de entrenamiento, registro y evaluación de políticas robóticas con la librería LeRobot.
- Educación en robótica: útil en cursos y talleres para demostrar cómo entrenar un modelo de imitación con datos teleoperados y ejecutarlo en un robot real o simulado.
- Benchmarking de hardware: al ser pequeño, puede utilizarse para medir el rendimiento de diferentes GPUs o sistemas embebidos en tareas de inferencia robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como tasas de éxito, precisión o comparaciones con otros modelos en la tarea SWITCH-1-top.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en precisión fp32 (según el tamaño del repositorio), por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna de consumo, como NVIDIA GTX 1060, RTX 2060 o superiores. También puede ejecutarse en CPU para pruebas lentas.
- Compatibilidad con hardware de consumo: sí, es un modelo muy ligero que puede ejecutarse en una Raspberry Pi con aceleración o en un portátil con GPU integrada.
- Opciones de despliegue: LeRobot (entrenamiento e inferencia), posiblemente también en frameworks como PyTorch directamente. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño se espera una inferencia en tiempo real en GPUs modernas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea o con la misma arquitectura. El autor ha publicado otras versiones del mismo modelo (`ACT_switch-1-top_v1` y `ACT_switch-1-top_v2`), pero no se conocen sus especificaciones ni rendimiento. No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado únicamente para la tarea de accionar un interruptor con una configuración específica de cámara y robot. No generaliza a otras tareas o entornos sin reentrenamiento.
- Dependencia de la calidad de las demostraciones: el rendimiento depende directamente de la calidad y variedad de los datos teleoperados del dataset SWITCH-1-top.
- Sin capacidades de lenguaje o razonamiento: no es un modelo multimodal ni de propósito general; solo genera acciones motoras.
- Riesgo de sobreajuste: al ser un modelo pequeño y entrenado en una tarea concreta, puede fallar ante variaciones en la iluminación, posición del objeto o calibración del robot.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del dataset asociado para posibles restricciones adicionales.
- No se han documentado sesgos ni riesgos de alucinación, al no ser un modelo generativo de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_switch-1-top_cs15_v5
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset SWITCH-1-top: https://huggingface.co/datasets/lenawngr/SWITCH-1-top
