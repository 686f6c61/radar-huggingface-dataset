# SoSolaris/xvla-b1123-1444-xv3_c60_slow

## Resumen

xvla-b1123-1444-xv3_c60_slow es un policy de robotica (Vision-Language-Action) afinado a partir de lerobot/xvla-base mediante la libreria LeRobot. Lo desarrolla el usuario SoSolaris y esta especializado en una unica tarea de manipulacion bimanual: agarrar una lata y verter su contenido en una taza. El modelo trata cada configuracion de robot como una "tarea" codificada mediante un pequeno conjunto de embeddings de Soft Prompt, lo que permite a un mismo modelo reconciliar morfologias, sensores y espacios de accion distintos.

Se trata de un fine-tune concreto sobre un dataset propio de 195 episodios y 200.716 frames a 30 FPS, no de un modelo generalista. Con 879.687.256 parametros (unos 880 millones) y pesos en formato safetensors, esta pensado para ejecutarse en el robot `solaria_bimanual` con tres camaras (up, right, left) y un estado de 8 dimensiones, produciendo acciones de 14 dimensiones.

Su relevancia es acotada: es un ejemplo de flujo de trabajo completo de imitation learning con LeRobot y del framework X-VLA (paper arXiv:2510.10274), util para quien quiera reproducir el pipeline o adaptar el metodo a su propio hardware. No es un modelo de proposito general ni un VLA de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA: Vision-Language-Action con soft prompts y flow matching (transformer) |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1.8 GB, libreria lerobot) |

## Arquitectura y entrenamiento

X-VLA es un framework VLA con "soft prompting" y flow matching: cada configuracion de robot o hardware se representa como una tarea codificada por un conjunto reducido de embeddings de Soft Prompt aprendibles. Esto permite que un unico modelo maneje morfologias, sensores y espacios de accion heterogeneos. El modelo base es lerobot/xvla-base y este checkpoint es un fine-tune sobre el.

El entrenamiento se realizo sobre el dataset SoSolaris/can_to_mug_merged_20261117_trimmed (195 episodios, 200.716 frames, 30 FPS) para la tarea "Grab the can and pour its contain in the mug (without water)". Configuracion: 40.000 pasos, batch size 32, optimizador xvla-adamw, learning rate 5e-05, semilla 1000, LeRobot 0.6.2. No se detalla en la informacion disponible la composicion completa del dataset ni si hubo etapas de RLHF o DPO.

Entradas del policy: `observation.images.image` (3, 256, 256), `observation.images.image2` (3, 256, 256), `observation.images.image3` (3, 224, 224) y `observation.state` (8,). Salida: `action` (14,). Robot: `solaria_bimanual` con camaras up, right, left.

## Capacidades

- Generacion de acciones de robot (policy de control) para manipulacion bimanual: salida de 14 dimensiones a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: consume tres flujos de imagen simultaneos (dos a 256x256 y uno a 224x224).
- Ejecucion de una tarea especifica de pick-and-pour: agarrar una lata y verter su contenido en una taza.
- Integracion con LeRobot: ejecutable mediante `lerobot-rollout` y entrenable con `lerobot-train`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingues ni modos de "thinking". Es un modelo de robotica, no un LLM conversacional.
- No se documentan capacidades de vision general, audio ni generacion de texto.

## Casos de uso

- Reproduccion del pipeline de imitation learning: usar este checkpoint como referencia para verificar que el flujo `lerobot-train` + `lerobot-rollout` funciona de extremo a extremo con el robot `solaria_bimanual`.
- Automatizacion de una tarea de vertido en laboratorio: ejecutar la policy durante 60 segundos con `--duration=60` para realizar ciclos de agarre y vertido sobre una lata y una taza reales.
- Base para fine-tuning adicional: partir de este checkpoint (o de lerobot/xvla-base) para adaptar el modelo a variantes de la misma tarea, como distintos objetos o posiciones.
- Evaluacion comparativa de policies: servir como punto de comparacion frente a otros fine-tunes del mismo modelo base con hiperparametros distintos.
- Docencia y demostraciones de VLA: mostrar en un entorno controlado como un modelo de ~880M de parametros controla un robot bimanual con tres camaras.
- Validacion de hardware y calibracion: usar la policy para comprobar que las camaras y el puerto del robot estan correctamente configurados antes de entrenar un modelo propio.
- Prototipado de tareas de manipulacion con objetos rigidos: el escenario lata-taza es representativo de tareas de pick-and-place con vertido, reutilizable como plantilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito, latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 879.687.256 parametros, en precision de 16 bits los pesos ocuparian aproximadamente 1,76 GB, a lo que habria que sumar el coste de las tres entradas visuales y del estado; una GPU consumer de 8 GB o mas deberia ser suficiente en principio, aunque no hay confirmacion en la informacion proporcionada.
- GPU recomendadas: no disponibles. Por tamano, una RTX 4090, A100 o H100 son opciones sobredimensionadas; una GPU consumer moderna seria suficiente, pero no se documenta.
- Cabe en GPU consumer: probablemente si, dado el tamano de pesos, pero no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoSolaris/xvla-b1123-1444-xv3_c60_slow | 879.687.256 | no disponible | Pick-and-pour bimanual (fine-tune) | apache-2.0 | Hugging Face |
| lerobot/xvla-base | no disponible | no disponible | VLA base multi-robot | no disponible en la informacion | Hugging Face |
| Otros fine-tunes de X-VLA | no disponible | no disponible | Segun dataset | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo se ha entrenado para la tarea "Grab the can and pour its contain in the mug (without water)" con el robot `solaria_bimanual`; no generaliza a otras tareas ni robots sin reentrenamiento.
- Sin resultados de evaluacion: el autor no ha reportado tasas de exito, por lo que se desconoce su fiabilidad real en produccion.
- Dependencia estricta de la configuracion de hardware: requiere las tres camaras con los nombres y resoluciones exactos (`image`, `image2`, `image3`) y un estado de 8 dimensiones; cualquier desviacion invalida la inferencia.
- Dataset limitado: 195 episodios y una unica tarea; posible sobreajuste a las condiciones de grabacion (posiciones, iluminacion, objetos concretos).
- Sesgos conocidos: no documentados, pero al derivarse de un dataset pequeno y especifico puede heredar sesgos de las condiciones de captura.
- Riesgo de alucinacion: no aplica en el sentido de texto, pero si en el sentido de acciones incorrectas o inseguras ante estados fuera de distribucion.
- Licencia apache-2.0: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones propias que conviene revisar.
- Sin cuantizaciones publicadas ni soporte documentado de frameworks de inferencia alternativos a LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoSolaris/xvla-b1123-1444-xv3_c60_slow
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/can_to_mug_merged_20261117_trimmed
- Paper X-VLA: https://huggingface.co/papers/2510.10274 (arXiv:2510.10274)
- Guia LeRobot xvla: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/can_to_mug_merged_20261117_trimmed
