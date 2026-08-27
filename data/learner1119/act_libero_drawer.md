# learner1119/act_libero_drawer

## Resumen

El modelo `learner1119/act_libero_drawer` es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario learner1119 (doyoung kim) y publicada en Hugging Face bajo la licencia Apache 2.0. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación. Este modelo concreto ha sido entrenado con el framework LeRobot sobre el dataset local `libero_drawer_v30`, orientado a la tarea de abrir o cerrar un cajón en el simulador LIBERO.

Con 51,6 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero diseñado para ejecutarse en tiempo real en hardware de consumo. Su relevancia radica en que demuestra cómo entrenar políticas de manipulación con pocos datos teleoperados y desplegarlas fácilmente mediante la infraestructura de LeRobot, lo que lo convierte en un punto de partida útil para investigadores y desarrolladores que trabajan en robótica de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con codificador de visión y decodificador autoregresivo |
| Parametros totales | 51.590.791 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo procesa observaciones de imagen y estado, no texto) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de transformer diseñada para aprendizaje por imitación en robótica. El modelo recibe una secuencia de observaciones (imágenes de cámara y estado del robot) y predice un chunk de acciones futuras (por ejemplo, 50 pasos de control) de forma autoregresiva. Esto reduce la acumulación de errores frente a políticas que predicen un solo paso. El entrenamiento se realiza mediante comportamiento clonado sobre demostraciones teleoperadas, sin refuerzo ni ajuste fino por preferencias humanas.

En este caso, el modelo fue entrenado con el framework LeRobot sobre el dataset `libero_drawer_v30`, que contiene demostraciones de la tarea de abrir/cerrar un cajón en el simulador LIBERO. No se dispone de información sobre el número exacto de episodios, la composición del dataset ni el número de tokens de entrenamiento. El entrenamiento se realizó con la configuración por defecto de ACT en LeRobot, que incluye un codificador de imágenes basado en ResNet y un decodificador transformer.

## Capacidades

- Control de robot manipulador: genera comandos de articulación (posición y velocidad) para ejecutar la tarea de abrir o cerrar un cajón.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, con generalización limitada a variaciones de la misma tarea.
- Predicción de chunks de acciones: emite secuencias de acciones de longitud fija, lo que mejora la suavidad del movimiento.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales como SO-100 o SO-101.
- Sin capacidades de lenguaje: no procesa texto ni instrucciones verbales; la tarea está fijada por el dataset de entrenamiento.
- Sin tool calling ni razonamiento multi-paso: es una política puramente reactiva basada en observaciones visuales y de estado.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede controlar un brazo robótico para abrir y cerrar cajones en entornos simulados o reales, sirviendo como base para experimentos de aprendizaje por imitación.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del action chunking en la robustez y precisión de políticas robóticas, comparando con métodos de predicción paso a paso.
- Prototipado rápido de políticas con LeRobot: al estar integrado con LeRobot, se puede cargar y evaluar en minutos usando los scripts de inferencia del framework, ideal para validar hipótesis.
- Educación en robótica: sirve como ejemplo didáctico de cómo entrenar un modelo de control con pocos datos y desplegarlo en hardware de bajo coste (por ejemplo, brazos SO-100).
- Benchmarking en LIBERO: el modelo puede utilizarse como referencia para comparar nuevas arquitecturas o métodos de entrenamiento en la tarea específica de drawer.
- Transferencia a tareas similares: aunque está entrenado para una tarea concreta, su arquitectura puede adaptarse mediante fine-tuning a otras tareas de manipulación con datasets similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas de éxito, tasas de acierto ni comparaciones con otros modelos en la tarea LIBERO drawer.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,6 millones de parámetros, la inferencia en precisión FP32 requiere aproximadamente 200 MB de VRAM, aunque el uso de imágenes y el transformer pueden aumentar el consumo a 1-2 GB en la práctica.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso CPUs con suficiente RAM para inferencia en tiempo real.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo, incluidas las integradas de gama alta.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación e inferencia; también puede exportarse a ONNX o TensorRT para optimización, aunque no hay soporte oficial para vLLM, llama.cpp u Ollama (no es un modelo de lenguaje).
- Latencia y throughput: no disponible, pero por el tamaño del modelo se espera una latencia de inferencia inferior a 10 ms en GPU moderna, permitiendo control en tiempo real.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la tarea LIBERO drawer. Como referencia genérica, se pueden mencionar otras políticas de imitación como Diffusion Policy o ACT original, pero no hay datos públicos de rendimiento de este modelo frente a ellos. La comparativa queda pendiente de futuras publicaciones.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset específico de LIBERO, el modelo puede no generalizar a otras configuraciones de cajones, iluminación o posiciones de cámara.
- Riesgo de alucinación: no aplica, ya que no genera texto; sin embargo, puede producir acciones erróneas si las observaciones difieren mucho del dominio de entrenamiento.
- Limitaciones de contexto: el modelo no procesa lenguaje ni instrucciones; la tarea está fijada y no puede adaptarse a nuevas órdenes sin reentrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe atribuir la autoría y mantener el aviso de licencia.
- Caveat para producción: es un modelo de investigación, no validado en entornos reales de producción; se recomienda evaluar exhaustivamente antes de cualquier despliegue en robots físicos.
- Dependencia del simulador: el entrenamiento se realizó en LIBERO, por lo que el paso a un robot real requiere calibración y posiblemente fine-tuning con datos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/learner1119/act_libero_drawer
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de implementación ACT-LIBERO (referencia): https://github.com/Jackie7ii/act-libero
- Perfil del autor: https://huggingface.co/learner1119
