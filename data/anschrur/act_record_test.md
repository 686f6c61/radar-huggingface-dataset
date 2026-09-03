# anschrur/act_record_test

## Resumen

El modelo `anschrur/act_record_test` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario anschrur y entrenada con el framework LeRobot de Hugging Face. ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica. Este modelo concreto está entrenado para la tarea "Grab the yellow cube" (agarrar el cubo amarillo) con un robot tipo `so_follower` y una cámara frontal.

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto diseñado para ejecutarse en tiempo real en hardware robótico. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación. El modelo se publicó el 3 de septiembre de 2026 y no cuenta todavía con resultados de evaluación en robot real, aunque su arquitectura y método están respaldados por el paper de ACT (arXiv:2304.13705) y la implementación de referencia de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador de visión (para procesar imágenes de la cámara) con un transformador que predice secuencias de acciones. En lugar de predecir una sola acción por paso de tiempo, el modelo genera un "chunk" de acciones futuras, lo que reduce la acumulación de errores y mejora la suavidad del movimiento. La arquitectura exacta (número de capas, heads, dimensiones ocultas) no se detalla en la model card, pero el método original se describe en el paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot versión 0.6.1 sobre un dataset propio (`anschrur/record-test_20260903_111239`) que contiene 50 episodios y 29.107 frames a 30 FPS, todos para la tarea de agarrar un cubo amarillo. La configuración de entrenamiento incluye 10.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; es un entrenamiento puramente de imitación supervisada.

## Capacidades

- Control robótico por imitación: predice acciones de 6 dimensiones (posición y orientación del efector final) a partir de observaciones de estado y visión.
- Percepción visual: procesa imágenes RGB de 480x640 píxeles de una cámara frontal.
- Ejecución de tareas de manipulación: entrenado específicamente para agarrar un cubo amarillo, aunque el método ACT es generalizable a otras tareas con datos de teleoperación.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo scripts de rollout y entrenamiento.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni tiene capacidades de razonamiento simbólico o conversación.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede ejecutar la tarea de agarrar un cubo amarillo en un robot `so_follower`, útil para validar pipelines de aprendizaje por imitación en entornos de investigación.
- Prototipado rápido de políticas con LeRobot: al estar publicado en el Hub, se puede cargar directamente con `lerobot-rollout` para probar la política en un robot real sin necesidad de reentrenar.
- Benchmark de métodos de imitación: sirve como punto de comparación para evaluar variantes de ACT o métodos alternativos en la misma tarea y dataset.
- Educación en robótica: permite a estudiantes e investigadores estudiar el flujo completo de LeRobot (grabación de datos, entrenamiento, despliegue) con un modelo pequeño y de bajo coste computacional.
- Base para fine-tuning: al ser un modelo compacto con licencia permisiva, puede usarse como punto de partida para adaptarlo a tareas similares con datasets propios.
- Evaluación de robustez visual: al depender de una única cámara frontal, es adecuado para estudiar el impacto de cambios de iluminación, fondo o posición de objetos en el rendimiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No existen datos de MMLU, HumanEval u otros benchmarks de lenguaje, ya que este modelo no es un LLM. Tampoco se reportan métricas de éxito en la tarea de agarre.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero con 51,6 millones de parámetros y un tamaño de 0,2 GB en safetensors, la inferencia es viable en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) es suficiente. También puede ejecutarse en CPU para pruebas lentas, aunque no es recomendable para control en tiempo real.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja gracias a su tamaño reducido.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y soporta inferencia con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada otros modelos entrenados con el mismo dataset o con la misma configuración de robot y tarea. El método ACT es conocido en la literatura, pero no se dispone de datos de modelos comparables publicados en el Hub con los que contrastar parámetros, rendimiento o licencia.

## Limitaciones y advertencias

- Sin evaluación en robot real: no hay resultados de éxito reportados, por lo que el rendimiento real en el robot es desconocido.
- Tarea específica: el modelo está entrenado únicamente para "Grab the yellow cube" con un robot `so_follower` y una cámara frontal. No generaliza a otras tareas, objetos o configuraciones de cámara sin reentrenamiento.
- Dependencia de la configuración de hardware: los nombres de las cámaras y el puerto del robot deben coincidir con los utilizados durante el entrenamiento; cualquier cambio puede degradar el rendimiento.
- Riesgo de sobreajuste al dataset: con solo 50 episodios, el modelo puede memorizar las trayectorias de teleoperación y fallar ante variaciones en la posición del objeto o la iluminación.
- Sin soporte de lenguaje: no es un modelo multimodal de texto ni tiene capacidades de razonamiento simbólico; su uso se limita a control robótico.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe atribuir la autoría y mantener el aviso de licencia. No hay restricciones adicionales conocidas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/anschrur/act_record_test
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/anschrur/record-test_20260903_111239
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
