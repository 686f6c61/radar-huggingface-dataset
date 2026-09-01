# jogarulfop/policy_2026-08-31_shake4it_bench_5sensors_dgf_passif_10kHz_nfft_512

## Resumen

Este modelo es una política de control robótico basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Desarrollada por el usuario jogarulfop, la política está diseñada para ejecutar una tarea de manipulación denominada "shake4it_bench" sobre un robot con cinco sensores, utilizando datos de teleoperación muestreados a 10 kHz con una transformada rápida de Fourier (nfft de 512). El modelo predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de imitación.

Con 51,7 millones de parámetros, es un modelo de tamaño moderado que puede ejecutarse en hardware de consumo. Su licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas. La relevancia actual radica en que representa un ejemplo práctico de aplicación de ACT a un problema de control con múltiples sensores, demostrando la viabilidad de entrenar políticas robóticas personalizadas con herramientas open source como LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de control robotico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que utiliza un transformer encoder-decoder para predecir una secuencia de acciones futuras (un "chunk") a partir de observaciones actuales. En lugar de emitir una unica accion por paso, el modelo genera un bloque de acciones que el robot ejecuta de forma secuencial, lo que reduce la acumulacion de errores y mejora la consistencia del movimiento. La arquitectura se describe en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705).

El entrenamiento se realizo con el framework LeRobot, que gestiona la recopilacion de datos teleoperados, el preprocesado y el entrenamiento. El dataset asociado (`jogarulfop/2026-08-31_shake4it_bench_5sensors_dgf_passif_10kHz_nfft_512`) contiene episodios de demostracion de la tarea "shake4it_bench" con cinco sensores, muestreados a 10 kHz y procesados con una ventana FFT de 512 puntos. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO, ya que no se publican en la model card.

## Capacidades

- Control robotico por aprendizaje por imitacion: el modelo genera secuencias de acciones (chunks) para ejecutar una tarea de manipulacion especifica.
- Procesamiento de multiples sensores: la entrada incluye datos de cinco sensores, lo que permite al modelo integrar informacion multimodal para la toma de decisiones.
- Inferencia en tiempo real: al predecir chunks de acciones, el modelo puede operar a frecuencias de control adecuadas para robots fisicos.
- Integracion con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluacion y despliegue en robots como SO-100.
- No soporta generacion de texto, razonamiento linguistico, vision general ni tool calling, ya que es un modelo puramente motor.

## Casos de uso

- Automatizacion de tareas de manipulacion repetitivas: el modelo puede controlar un brazo robotico para realizar la tarea "shake4it_bench" de forma autonoma, sustituyendo la operacion manual en entornos de produccion.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto de la frecuencia de muestreo, el numero de sensores y el tamano de la ventana FFT en el rendimiento de politicas ACT.
- Desarrollo de politicas personalizadas: los desarrolladores pueden clonar este modelo y reentrenarlo con sus propios datos teleoperados para adaptarlo a tareas similares.
- Evaluacion de hardware robotico: permite probar la capacidad de un robot SO-100 u otros compatibles para ejecutar tareas de alta frecuencia con multiples sensores.
- Benchmarking de metodos de control: al estar disponible publicamente, puede utilizarse como referencia para comparar ACT con otras arquitecturas (Diffusion Policy, VQ-BeT, etc.) en la misma tarea.
- Educacion en robotica: es un ejemplo didactico de como entrenar y desplegar una politica de imitacion con herramientas open source, util para cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito, tasas de acierto ni comparaciones con otros modelos. Se recomienda al usuario evaluar el modelo en su propio entorno para obtener datos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 millones de parametros, el modelo en precision FP32 ocupa aproximadamente 207 MB. En FP16 serian unos 103 MB. Esto cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA, desde una GTX 1650 hasta una RTX 4090. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con hardware de consumo: si, el modelo es lo suficientemente pequeno para ejecutarse en GPUs de gama media e incluso en sistemas embebidos con aceleracion.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion e inferencia. Tambien puede exportarse a ONNX o TensorRT para optimizacion, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles. Dependen del hardware y de la frecuencia de control requerida por la tarea.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma tarea o con el mismo tamano. Existen otras politicas de imitacion como Diffusion Policy o VQ-BeT, pero no se han publicado comparaciones con este modelo concreto. Se recomienda consultar la literatura de LeRobot para encontrar benchmarks generales.

## Limitaciones y advertencias

- Especificidad de la tarea: el modelo esta entrenado para una tarea concreta ("shake4it_bench") y con una configuracion de sensores determinada. No es transferible a otras tareas sin reentrenamiento.
- Dependencia de los datos de teleoperacion: el rendimiento depende de la calidad y diversidad de las demostraciones. Si los datos de entrenamiento son limitados, el modelo puede fallar en situaciones no vistas.
- Riesgo de sobreajuste: al ser un modelo de tamano moderado y entrenado en un dataset especifico, puede sobreajustarse a las condiciones del entorno de entrenamiento.
- Sin garantias de seguridad: no se han documentado mecanismos de seguridad ni de deteccion de fallos. En aplicaciones reales, debe integrarse con sistemas de supervision y parada de emergencia.
- Licencia Apache-2.0: permite uso comercial, pero el usuario es responsable de cumplir con las condiciones de la licencia y de atribuir correctamente la autoria.
- Informacion incompleta: no se publican detalles sobre el dataset (numero de episodios, variabilidad), hiperparametros de entrenamiento ni metricas de rendimiento, lo que dificulta la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jogarulfop/policy_2026-08-31_shake4it_bench_5sensors_dgf_passif_10kHz_nfft_512)
- [Dataset asociado](https://huggingface.co/datasets/jogarulfop/2026-08-31_shake4it_bench_5sensors_dgf_passif_10kHz_nfft_512)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentacion de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
