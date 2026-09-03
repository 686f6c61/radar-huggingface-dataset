# nchristo-synaptics/act_touch_ablation_wrist_notouch_20260903

## Resumen

Este modelo es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Desarrollado por nchristo-synaptics, resuelve una tarea de manipulación robótica concreta: colocar una bola amarilla en un cuenco rojo, utilizando un robot tipo `so_follower` con dos cámaras (muñeca y vista superior). El modelo consume observaciones de estado (6 dimensiones) y dos imágenes RGB de 240x320 píxeles, y produce acciones de 6 dimensiones.

La relevancia de este modelo radica en que es un ejemplo de aplicación de ACT, un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. Con 62,85 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto. El repositorio incluye el checkpoint entrenado y los metadatos necesarios para reproducir el entrenamiento o desplegar la política en un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con codificador y decodificador |
| Parametros totales | 62.854.726 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa observaciones de un solo paso, no secuencias largas) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no aplicable (modelo de robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arXiv:2304.13705. ACT utiliza un transformer con un codificador que procesa las observaciones (estado del robot y imagenes de las camaras) y un decodificador que genera una secuencia de acciones futuras (chunk) en lugar de una sola accion. Esto reduce el error de compounding y mejora la precision en tareas de manipulacion. El modelo fue entrenado con el framework LeRobot (version 0.6.2) mediante aprendizaje por imitacion a partir de datos teleoperados.

El entrenamiento se realizo sobre un dataset de 16 episodios con 6688 frames a 30 FPS, correspondientes a la tarea "place yellow ball in red bowl". Se usaron 100.000 pasos de entrenamiento con batch size 8, optimizador AdamW, learning rate 1e-5 y seed 1000. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado de imitacion. El dataset esta disponible en el repositorio `nchristo-synaptics/touch-vision-v3_20260902_152740`.

## Capacidades

- Generacion de acciones de manipulacion robotica: el modelo predice secuencias de 6 dimensiones de acciones (posicion y orientacion del efector final) a partir de observaciones visuales y de estado.
- Procesamiento multimodal: combina dos imagenes RGB (camara de muñeca y camara superior) con el estado del robot (6 valores) para tomar decisiones.
- Aprendizaje por imitacion: la politica replica el comportamiento demostrado en los datos teleoperados, sin necesidad de ingenieria de recompensas.
- Ejecucion en tiempo real: al ser un modelo pequeno (62M parametros), puede ejecutarse a alta frecuencia en hardware modesto, adecuado para control de robot en bucle cerrado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje, ya que es un modelo puramente motor.

## Casos de uso

- Manipulacion robotica en entornos de laboratorio: el modelo puede desplegarse en un robot `so_follower` para ejecutar la tarea de colocar una bola en un cuenco, sirviendo como base para experimentos de aprendizaje por imitacion.
- Investigacion en robotica: permite estudiar el efecto de la ablacion de la camara de muñeca (el nombre del modelo indica "wrist_notouch", sugiriendo que se elimino la informacion tactil o de contacto) en el rendimiento de la politica.
- Prototipado rapido de politicas: gracias a LeRobot, se puede entrenar y evaluar una politica en pocas horas con un dataset pequeno, ideal para validar nuevas tareas.
- Benchmarking de metodos de imitacion: el modelo puede compararse con otras politicas (p.ej., Diffusion Policy) en la misma tarea para evaluar ventajas y limitaciones.
- Educacion en robotica: como ejemplo de ACT con LeRobot, es util para ensenar conceptos de aprendizaje por imitacion y despliegue en robots reales.
- Transferencia a tareas similares: aunque esta entrenado para una tarea especifica, el checkpoint puede servir como inicializacion para fine-tuning en tareas de manipulacion con caracteristicas visuales parecidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion: "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de tasas de exito ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 62,85 millones de parametros, la inferencia requiere menos de 1 GB de VRAM en precision FP32 (aprox. 250 MB de pesos). Con cuantizacion a FP16 o int8, el consumo seria aun menor.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. Una NVIDIA RTX 3060 o superior ofrece margen para ejecutar el modelo junto con el procesamiento de imagenes.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer actual (GTX 1060 6GB, RTX 2060, etc.) e incluso en hardware integrado con optimizaciones.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia en PyTorch. Se puede ejecutar con `lerobot-rollout` en un robot real. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales, pero por el tamano del modelo, se espera una latencia de inferencia inferior a 10 ms en una GPU moderna, permitiendo control a 30 FPS o mas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa directa con otros modelos de la misma categoria. El modelo es una politica ACT especifica para una tarea concreta, y no existen en la informacion proporcionada datos de otros checkpoints comparables (mismo robot, misma tarea, misma arquitectura). Se puede mencionar que ACT es una alternativa a Diffusion Policy, pero no hay datos de rendimiento publicados para este checkpoint concreto.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con solo 16 episodios, la politica puede no generalizar bien a variaciones en la posicion de los objetos, iluminacion o configuracion del robot.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la politica puede producir acciones incorrectas si las observaciones difieren de las del entrenamiento.
- Limitaciones de contexto: el modelo no maneja secuencias largas ni memoria temporal; cada decision se toma a partir de la observacion actual.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de LeRobot y de los datos de entrenamiento, que pueden tener sus propias condiciones.
- Caveat de produccion: el modelo no ha sido evaluado en el robot real (no hay resultados de evaluacion), por lo que su rendimiento en despliegue es incierto. Se recomienda validar en un entorno controlado antes de usarlo en aplicaciones criticas.
- El nombre del modelo sugiere una ablacion de la camara de muñeca ("wrist_notouch"), lo que implica que la politica depende principalmente de la camara superior; esto puede limitar su robustez en tareas que requieran informacion de contacto o proximidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/nchristo-synaptics/act_touch_ablation_wrist_notouch_20260903
- Dataset de entrenamiento: https://huggingface.co/datasets/nchristo-synaptics/touch-vision-v3_20260902_152740
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
