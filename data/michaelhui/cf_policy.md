# MichaelHui/cf_policy

## Resumen

El modelo `MichaelHui/cf_policy` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por MichaelHui y publicada en Hugging Face bajo licencia Apache 2.0. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite a un robot ejecutar tareas de manipulación con alta tasa de éxito a partir de datos teleoperados. Este modelo concreto ha sido entrenado con la librería LeRobot de Hugging Face y está diseñado para un robot tipo `so_follower` con dos cámaras (izquierda y superior).

El modelo tiene 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace ligero y adecuado para inferencia en tiempo real en hardware modesto. Está especializado en una única tarea: coger un cubo y colocarlo en un cuenco naranja, a partir de un dataset de 15 episodios y 6032 fotogramas. Su relevancia radica en que demuestra un flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, accesible para la comunidad de robótica e IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación que utiliza una arquitectura transformer para predecir un chunk de acciones futuras (típicamente 10-100 pasos) a partir de observaciones actuales. A diferencia de los métodos que predicen una sola acción, ACT reduce la acumulación de errores y mejora la estabilidad del control. El modelo procesa dos entradas visuales (cámara izquierda y cámara superior, ambas a 640x480) y un vector de estado del robot de 6 dimensiones, y produce una acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot versión 0.6.1 sobre un dataset de teleoperación (`egcfwong/test_1_20260829_164444`) con 15 episodios y 6032 fotogramas a 30 FPS. Se usaron 628 pasos de entrenamiento, batch size de 192, optimizador AdamW y learning rate de 1e-5, con semilla 1000. No se reportan técnicas adicionales como RLHF o DPO, ya que es un modelo de imitación puro. El método ACT original se describe en el paper arXiv:2304.13705.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea de coger un cubo y colocarlo en un cuenco, siguiendo la política aprendida.
- Aprendizaje por imitación: reproduce comportamientos teleoperados con precisión, gracias a la predicción de chunks de acciones.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (izquierda y superior) para tomar decisiones.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico para recoger objetos y depositarlos en ubicaciones específicas, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentar con ACT y LeRobot, permitiendo a investigadores reproducir y modificar el flujo de entrenamiento.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido, puede desplegarse en hardware de bajo coste para validar tareas antes de escalar a modelos más grandes.
- Teleoperación asistida: el modelo puede complementar sistemas de teleoperación, sugiriendo acciones o ejecutando subtareas de forma autónoma.
- Educación en robótica: útil en cursos y talleres para enseñar conceptos de aprendizaje por imitación y control basado en visión.
- Benchmarking de métodos de imitación: al estar disponible públicamente, permite comparar el rendimiento de ACT frente a otras arquitecturas en tareas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se proporcionan métricas de éxito, tasas de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero dado el tamaño del modelo (51,7 M parámetros) y la entrada de imágenes, se estima que puede ejecutarse en GPUs con al menos 4 GB de VRAM en FP32, y menos con cuantización.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como NVIDIA RTX 3060 o superior. También puede ejecutarse en CPU para pruebas lentas.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que gestionan la inferencia. No se mencionan vLLM, llama.cpp u otras herramientas, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la resolución de las cámaras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas basadas en ACT) dentro de la información proporcionada. No se puede realizar una comparativa fiable.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (coger un cubo y ponerlo en un cuenco) y no generaliza a otras tareas u objetos sin reentrenamiento.
- Dependencia del hardware: requiere el robot tipo `so_follower` y las cámaras específicas (izquierda y superior) con las que fue entrenado; cambios en la configuración pueden degradar el rendimiento.
- Datos limitados: solo 15 episodios de entrenamiento, lo que puede provocar sobreajuste y baja robustez ante variaciones de iluminación, posición de objetos o distracciones.
- Sin evaluación reportada: no hay resultados de éxito en robot real, por lo que su rendimiento real es desconocido.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero puede ejecutar acciones incorrectas si las observaciones difieren del dominio de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el dataset asociado puede tener sus propias restricciones; se debe verificar la licencia del dataset `egcfwong/test_1_20260829_164444`.

## Enlaces

- Repositorio del modelo: https://huggingface.co/MichaelHui/cf_policy
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Dataset de entrenamiento: https://huggingface.co/datasets/egcfwong/test_1_20260829_164444
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
