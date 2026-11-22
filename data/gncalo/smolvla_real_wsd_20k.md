# gncalo/smolvla_real_wsd_20k

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) disenado para control roboticos de bajo coste computacional. Esta ficha concreta cubre el checkpoint `gncalo/smolvla_real_wsd_20k`, un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario gncalo mediante la libreria LeRobot. El modelo resuelve el problema de aprendizaje por imitacion en robots de tipo `so_follower` (SO-100/SO-101), mapeando observaciones visuales y de estado articular a comandos de accion de 6 dimensiones.

Con 450 millones de parametros, este checkpoint se ha entrenado durante 20.000 pasos sobre el dataset `gncalo/lego_all_real`, que contiene 300 episodios (109.615 frames a 30 FPS) de una unica tarea: coger un ladrillo de Lego rojo y depositarlo en una caja. Es relevante porque demuestra el flujo completo de fine-tuning de SmolVLA en hardware de consumo, desde la captura de datos hasta el despliegue con `lerobot-rollout`.

La arquitectura subyacente combina un backbone de vision-lenguaje con un experto de accion (action expert) que genera comandos motores a partir de multiples camaras y del estado proprioceptivo del robot. El modelo esta publicado bajo licencia Apache 2.0 y en formato safetensors, con un repositorio de 0,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta; backbone VLM con experto de accion |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible (modelo orientado a tareas roboticas, no a texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que combina perception visual y comprension del lenguaje con un modulo de generacion de acciones, pensado para ejecutarse en hardware de consumo. El checkpoint parte del modelo base `lerobot/smolvla_base` y se ha fine-tuneado con LeRobot 0.6.1. La politica consume `observation.state` (vector de 6 dimensiones), tres camaras de 256x256 (`observation.images.camera1`, `camera2`, `camera3`) y una camara adicional de 480x640 (`observation.images.empty_camera_0`), produciendo una accion de 6 dimensiones.

El entrenamiento se realizo sobre el dataset `gncalo/lego_all_real` (300 episodios, 109.615 frames a 30 FPS) con una unica instruccion de tarea ("Pick up the red lego brick and put it in the box"). La configuracion fue: 20.000 pasos, batch size 16, optimizador AdamW, learning rate 0,0001, semilla 1000. No se documenta el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF/DPO; al tratarse de aprendizaje por imitacion (imitation learning), el objetivo es la prediccion de acciones a partir de demostraciones, no la alineacion por preferencias.

## Capacidades

- Control roboticos por imitacion: genera comandos de accion de 6 dimensiones a partir de observaciones multimodales (estado articular y camaras).
- Percepcion visual multi-camara: procesa tres vistas de 256x256 y una vista de 480x640 de forma simultanea.
- Fusion vision-lenguaje-accion: integra la instruccion textual de la tarea con las observaciones para condicionar la politica.
- Ejecucion en hardware de consumo: el modelo base SmolVLA esta disenado para desplegarse en GPUs de gama consumer.
- Integracion con LeRobot: soporte nativo de `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- Tarea especializada: ejecuta una unica habilidad motora (recoger un Lego rojo y depositarlo en una caja) sobre el robot `so_follower`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Automatizacion de pick-and-place en linea de montaje: el modelo ejecuta la secuencia de coger un objeto y depositarlo en un contenedor, adecuado para tareas repetitivas de clasificacion de piezas en entornos controlados.
- Prototipado rapido de politicas roboticas: sirve como referencia de fine-tuning sobre `smolvla_base` para validar un pipeline completo de captura de datos, entrenamiento y despliegue en menos de un dia.
- Investigacion en aprendizaje por imitacion: permite reproducir experimentos de VLA con un dataset pequeno (300 episodios) y una configuracion de entrenamiento documentada paso a paso.
- Demostraciones educativas de robotica de bajo coste: al caber en GPU consumer, se puede usar en aulas o laboratorios con hardware asequible para mostrar el ciclo completo de un VLA.
- Benchmark de referencia para datasets de Lego: el dataset `lego_all_real` y este checkpoint permiten comparar variantes de entrenamiento (distintos pasos, learning rates) sobre la misma tarea.
- Base para transferencia a tareas similares: partiendo de este checkpoint se puede reentrenar con nuevos datasets de manipulación de objetos para adaptar la politica a otras piezas o contenedores.
- Validacion de infraestructura de inferencia: util para probar `lerobot-rollout`, calibracion de camaras y latencia de control en un robot `so_follower` antes de escalar a tareas mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "No evaluation results have been provided for this policy yet", por lo que no hay tasas de exito en robot real ni metricas de validacion que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~450 M parametros en safetensors, la huella de pesos ronda 0,9 GB, por lo que la VRAM necesaria sera moderada (tipicamente por debajo de 8 GB incluyendo buffers de activacion y camaras).
- GPU recomendadas: no disponible; el modelo base SmolVLA esta disenado para hardware de consumo, por lo que GPUs consumer son suficientes.
- Cabe en GPU consumer: si, segun la descripcion del modelo base ("can be deployed on consumer-grade hardware"); no se especifican modelos concretos.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecucion en robot; `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este pipeline.
- Latencia y throughput: no disponible; el control opera a 30 FPS segun el dataset de entrenamiento, pero no se publican mediciones de latencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gncalo/smolvla_real_wsd_20k | ~450 M | no disponible | VLA robotico (pick-and-place Lego) | Apache 2.0 | Hugging Face (lerobot) |
| lerobot/smolvla_base | no disponible | no disponible | VLA robotico base (fine-tuning) | no disponible en la informacion | Hugging Face (lerobot) |
| Alternativas VLA de mayor escala (p. ej. familias OpenVLA/pi0) | no disponible | no disponible | VLA robotico general | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo ha sido entrenado para una unica tarea ("Pick up the red lego brick and put it in the box"); no generaliza a otras instrucciones sin reentrenamiento.
- Sin evaluacion publicada: no hay tasas de exito en robot real, por lo que se desconoce la robustez ante variaciones de posicion, iluminacion o distracciones.
- Dependencia del hardware: requiere un robot `so_follower` con la misma configuracion de camaras (`front`, `wrist` y las claves de observacion exactas) usada en el entrenamiento; cambios de calibracion o de indices de camara degradaran el rendimiento.
- Dataset limitado: 300 episodios y 109.615 frames de una sola tarea implican un riesgo alto de sobreajuste al entorno de captura.
- Riesgo de alucinacion motora: al ser una politica de imitacion, puede generar acciones incoherentes fuera de la distribucion de estados vista en entrenamiento, sin mecanismo de salvaguarda documentado.
- Idiomas: no se documenta soporte multilingue; la instruccion textual de la tarea esta en ingles y el modelo no esta orientado a texto general.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias del modelo base `lerobot/smolvla_base` y del dataset `gncalo/lego_all_real` antes de desplegar en produccion.
- Sin datos de sesgos: no se documentan sesgos conocidos ni consideraciones eticas especificas para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gncalo/smolvla_real_wsd_20k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/gncalo/lego_all_real
- Paper SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de captura y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=gncalo/lego_all_real
