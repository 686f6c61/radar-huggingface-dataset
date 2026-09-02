# NickKuijpers/act_record_test_v1

## Resumen

El modelo `NickKuijpers/act_record_test_v1` es una política de aprendizaje por imitación para robótica basada en el método Action Chunking with Transformers (ACT), desarrollado por Nick Kuijpers y publicado a través del ecosistema LeRobot de Hugging Face. ACT predice secuencias cortas de acciones (action chunks) en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica teleoperadas. Este modelo concreto está entrenado para la tarea de clasificar objetos por color en un robot tipo `so_follower` con dos cámaras (frontal y pinza).

El modelo tiene 51,67 millones de parámetros y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que ejemplifica el flujo completo de LeRobot: grabación de datos teleoperados, entrenamiento de una política ACT y despliegue en robot real. Sin embargo, al estar entrenado con un único episodio de 241 frames, su utilidad práctica es limitada y debe considerarse como una prueba de concepto o un experimento de validación del pipeline, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de ACT; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que combina un transformer con un mecanismo de prediccion por lotes de acciones. En lugar de predecir una sola accion por paso de tiempo, el modelo predice un "chunk" de acciones futuras (tipicamente 10-100 pasos), lo que reduce la acumulacion de errores y mejora la coherencia del movimiento. La arquitectura incluye un encoder de vision (tipicamente ResNet) para procesar las imagenes de las camaras, un encoder de estado para la informacion proprioceptiva del robot, y un decoder transformer que genera las secuencias de acciones.

El entrenamiento se realizo con el framework LeRobot (version 0.6.1) sobre un dataset de un solo episodio de 241 frames a 30 FPS, grabado con un robot teleoperado tipo `so_follower`. La configuracion de entrenamiento incluye 5000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento; es un entrenamiento puramente supervisado de imitacion. El dataset de entrenamiento es `willemelliw/record_test` con la tarea "sort objects by color".

## Capacidades

- Generacion de acciones de robotica: predice secuencias de acciones de 6 dimensiones (posicion y orientacion del efector final, probablemente) a partir de observaciones visuales y de estado.
- Procesamiento multimodal: consume dos flujos de imagen (camara frontal y camara de pinza) a 480x640 píxeles, junto con un vector de estado de 6 dimensiones.
- Aprendizaje por imitacion: reproduce comportamientos teleoperados, en este caso la tarea de clasificar objetos por color.
- Integracion con LeRobot: compatible con el ecosistema de herramientas de Hugging Face para robotica, incluyendo los comandos `lerobot-rollout` y `lerobot-train`.
- Sin capacidades de lenguaje, tool calling, agentes ni razonamiento general: es un modelo puramente motor, no un LLM.

## Casos de uso

- Validacion del pipeline LeRobot: sirve como ejemplo de extremo a extremo para verificar que la instalacion, la grabacion de datos, el entrenamiento y el despliegue funcionan correctamente en un robot `so_follower`.
- Pruebas de concepto en laboratorio: investigadores pueden usar este modelo para experimentar con el flujo de trabajo de ACT sin necesidad de entrenar desde cero, aunque con la limitacion de que solo tiene un episodio de datos.
- Educacion y formacion: estudiantes de robotica pueden analizar la estructura de un policy entrenado, inspeccionar los pesos safetensors y entender como se organizan las observaciones y acciones en LeRobot.
- Benchmark de hardware: al ser un modelo pequeno (51,7M parametros), es util para medir latencias de inferencia en GPUs de gama baja o incluso en CPU, estableciendo una referencia para modelos mas grandes.
- Desarrollo de nuevas tareas: un desarrollador podria usar este modelo como punto de partida para fine-tuning con mas datos, aunque la calidad del resultado dependera de la cantidad y diversidad de los nuevos episodios.
- Integracion en simuladores: puede ejecutarse en entornos simulados compatibles con LeRobot para probar algoritmos de control o visualizacion antes de pasar al hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion: "No evaluation results have been provided for this policy yet." No se proporcionan metricas de exito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 51,7M parametros, la inferencia en precision FP32 requiere aproximadamente 200 MB de VRAM solo para los pesos, mas overhead de activaciones. Cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer (NVIDIA GTX 1060 o superior, RTX 3060, etc.) es suficiente. Incluso podria ejecutarse en CPU para pruebas lentas.
- Compatibilidad con consumer GPU: si, es totalmente viable en GPUs de gama de entrada.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar el policy en un robot real. Tambien puede cargarse con la libreria `lerobot` en Python para inferencia programatica.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamano del modelo, se espera una latencia de pocos milisegundos por paso en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa con otros modelos ACT de LeRobot. Existen otros repositorios similares en Hugging Face (por ejemplo, `Min0719/act_record_test` o `ljw8888/act_record-test_model`) que parecen ser variaciones del mismo experimento, pero no se han publicado metricas comparables. En terminos de arquitectura, todos los modelos ACT de LeRobot comparten la misma base, diferenciandose en el dataset y la configuracion de entrenamiento. La comparativa queda pendiente de datos publicos.

## Limitaciones y advertencias

- Entrenamiento con un unico episodio: el modelo solo ha visto 241 frames de un solo episodio, por lo que su capacidad de generalizacion es practicamente nula. No debe usarse en entornos de produccion ni en tareas que requieran robustez.
- Sin evaluacion en robot real: no hay resultados de pruebas fisicas, por lo que se desconoce su tasa de exito real.
- Sesgos del dataset: al ser un unico episodio, el modelo solo conoce una trayectoria concreta; cualquier variacion en la posicion de los objetos, iluminacion o configuracion del robot puede provocar fallos.
- Riesgo de sobreajuste: con 51,7M parametros y solo 241 frames, el modelo esta claramente sobreajustado a los datos de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un modelo de robotica, no aplica el concepto de contexto textual.
- Licencia: Apache 2.0 permite uso comercial, pero la utilidad practica del modelo es limitada por su pobre entrenamiento.
- Dependencia de hardware especifico: el modelo esta entrenado para el robot `so_follower` y las camaras `front` y `gripper`; usarlo con otro hardware requiere reentrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/NickKuijpers/act_record_test_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/willemelliw/record_test
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentacion de LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
