# jaheroth/act_pusht_bs64_chunk32_dec7_seed1002_200k

## Resumen

El modelo `jaheroth/act_pusht_bs64_chunk32_dec7_seed1002_200k` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollado por el equipo de Google Research y publicado en el artículo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). Este checkpoint concreto ha sido entrenado y subido al Hub de Hugging Face mediante la librería LeRobot, un framework de código abierto para aprendizaje por imitación en robótica.

El modelo resuelve la tarea PushT, un entorno de simulación en el que un robot debe empujar una pieza con forma de T hasta una posición objetivo. En lugar de predecir una única acción por paso, ACT predice un fragmento (chunk) de acciones futuras, lo que mejora la estabilidad y el éxito en tareas de manipulación. Con aproximadamente 83,9 millones de parámetros, es un modelo compacto diseñado específicamente para esta tarea, y su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

La relevancia de este modelo radica en que ejemplifica la aplicación de arquitecturas transformer al control robótico de bajo nivel, y sirve como punto de partida para investigadores que deseen reproducir o extender experimentos de aprendizaje por imitación con LeRobot. Aunque no es un modelo de propósito general, su publicación en abierto contribuye a la democratización de la robótica basada en aprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Transformer con encoder-decoder) |
| Parametros totales | 83.899.796 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (en robótica se usa una ventana de observaciones, no se especifica) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no aplica (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer con codificador y decodificador. El codificador procesa las observaciones (imágenes y estados del robot) y el decodificador genera un fragmento de acciones futuras de longitud fija, en lugar de una sola acción. Esta predicción por fragmentos reduce la acumulación de errores y mejora la ejecución de movimientos suaves y coordinados.

El modelo fue entrenado con la librería LeRobot sobre el dataset `lerobot/pusht`, que contiene demostraciones teleoperadas de la tarea PushT. No se dispone de información detallada sobre el número de tokens, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El nombre del checkpoint sugiere ciertos hiperparámetros (batch size 64, chunk size 32, 7 capas de decodificador, semilla 1002 y 200k pasos de entrenamiento), pero estos valores no están confirmados en la documentación oficial y deben tomarse como una inferencia razonable.

## Capacidades

- Control robótico para la tarea PushT: el modelo genera comandos de acción para un robot simulado que debe empujar una pieza en forma de T hasta una posición objetivo.
- Aprendizaje por imitación: la política se ha entrenado a partir de demostraciones teleoperadas, por lo que reproduce comportamientos observados en los datos de entrenamiento.
- Predicción por fragmentos de acciones: gracias a la arquitectura ACT, el modelo emite secuencias de acciones de longitud fija, lo que facilita movimientos coordinados y reduce la inestabilidad en la ejecución.
- Integración con LeRobot: el checkpoint está empaquetado según el formato de LeRobot, lo que permite cargarlo y evaluarlo directamente con las herramientas de esa librería.
- No dispone de capacidades de lenguaje, visión general, tool calling ni razonamiento simbólico; su ámbito se limita al control motor en el entorno PushT.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar el efecto de distintos hiperparámetros (tamaño de chunk, número de capas, semilla) en el rendimiento de políticas ACT sobre la tarea PushT.
- Reproducción de experimentos: investigadores pueden cargar este checkpoint con LeRobot y ejecutar evaluaciones en el entorno PushT para verificar resultados o comparar con sus propias implementaciones.
- Desarrollo de algoritmos de control robótico: sirve como punto de partida para probar variantes de ACT, como cambios en la arquitectura del transformer o en la estrategia de entrenamiento.
- Educación en robótica con aprendizaje automático: al ser un modelo pequeño y de código abierto, es adecuado para cursos o tutoriales que enseñen a entrenar y desplegar políticas de manipulación.
- Benchmarking de entornos de simulación: puede utilizarse para validar el correcto funcionamiento del entorno PushT o de las herramientas de LeRobot en diferentes configuraciones de hardware.
- Transferencia a tareas similares: aunque está entrenado para PushT, la arquitectura ACT es generalizable; el checkpoint puede servir como inicialización para fine-tuning en otras tareas de empuje o manipulación con datasets similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como tasa de éxito, precisión de empuje o comparaciones con otros modelos en el entorno PushT.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo tiene aproximadamente 84 millones de parámetros, en precisión FP32 ocuparía unos 336 MB de memoria. Con cuantización a FP16 o int8, el uso sería menor. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas o de gama baja.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, GTX 1060, RTX 2060, RTX 4090) es suficiente. No se requieren GPUs de alta gama como A100 o H100 para inferencia.
- Compatibilidad con GPUs de consumo: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de consumo, incluso en una Raspberry Pi con acelerador Coral si se convierte a TensorFlow Lite, aunque no se proporcionan instrucciones oficiales.
- Opciones de despliegue: LeRobot ofrece scripts de evaluación e inferencia. También puede cargarse con PyTorch directamente desde safetensors. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño del modelo, la inferencia en una GPU moderna debería ser de pocos milisegundos por paso, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. Existen otros checkpoints de ACT para la tarea PushT en el Hub, como `arclabmit/pusht_act_model`, pero no se conocen sus especificaciones exactas ni sus resultados. La comparativa queda pendiente de datos públicos.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en la tarea PushT; no es generalizable a otras tareas robóticas sin un reentrenamiento o fine-tuning sustancial.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con demostraciones teleoperadas, puede heredar sesgos del operador humano (por ejemplo, trayectorias subóptimas o preferencias de movimiento).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la política puede producir acciones erróneas si las observaciones difieren de las del entrenamiento, lo que podría interpretarse como un comportamiento no deseado.
- Limitaciones de contexto: la ventana de observación y el tamaño del chunk de acciones no están documentados, lo que dificulta la planificación de tareas de largo horizonte.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados.
- Para producción: el modelo está pensado para entornos de simulación; su despliegue en robots físicos requeriría una validación cuidadosa y posiblemente calibración adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jaheroth/act_pusht_bs64_chunk32_dec7_seed1002_200k)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
