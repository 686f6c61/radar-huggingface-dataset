# mysterium99/smolvla_stage2c_complexity_3_to_ds1

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot. Combina un modelo de lenguaje pequeno con un encoder visual para traducir observaciones (imagenes de camaras e estado del robot) directamente en acciones motoras, sin necesidad de un pipeline separado de percepcion-planificacion-control. Este checkpoint concreto, `smolvla_stage2c_complexity_3_to_ds1`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `ds1`, orientado a una unica tarea de manipulacion robotica.

El modelo cuenta con 450.046.176 parametros (aproximadamente 450 millones) y esta empaquetado en safetensors con un peso total de repositorio de 0,9 GB. La arquitectura sigue el diseno VLA propuesto en el paper SmolVLA (arXiv:2506.01844), pensado para desplegarse en hardware de consumo, lo que lo hace especialmente relevante para laboratorios con presupuesto limitado que quieren experimentar con politicas de imitacion en robots reales.

Este checkpoint es un artefacto de investigacion: entrenado con 20.000 pasos sobre 50 episodios (22.710 frames a 30 FPS) para la tarea "Take hardware from human and put in taped area", con tres camaras de entrada y un vector de estado de 6 dimensiones. No dispone de resultados de evaluacion publicados ni de metricas de exito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en transformer, derivada de SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que procesa observaciones multimodales (tres camaras RGB a 256x256 y un vector de estado de 6 dimensiones) y emite directamente un vector de accion de 6 dimensiones. La arquitectura sigue el diseno descrito en el paper arXiv:2506.01844, orientado a reducir el coste computacional de los VLA convencionales manteniendo un rendimiento competitivo y permitiendo inferencia en hardware de consumo. El checkpoint parte del modelo preentrenado `lerobot/smolvla_base` y se ajusta mediante imitacion supervisada.

El fine-tuning se realizo con LeRobot 0.6.1 sobre el dataset `ds1`: 50 episodios, 22.710 frames a 30 FPS, una unica tarea de manipulacion. La configuracion de entrenamiento fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 0. No se documenta en la model card el uso de RLHF, DPO ni tecnicas de refuerzo; se trata de aprendizaje por imitacion puro sobre demostraciones humanas. Tampoco se detalla la composicion del corpus de preentrenamiento del modelo base ni innovaciones tecnicas especificas de este checkpoint.

## Capacidades

- Generacion de acciones motoras a partir de observaciones visuales y de estado del robot (control visuomotor directo).
- Procesamiento multimodal de tres camaras simultaneas (`gripper`, `newtop`, `newside`) a 256x256 pixeles.
- Ejecucion de una tarea especifica de manipulacion: recoger hardware de un humano y colocarlo en una zona delimitada con cinta.
- Politica de imitacion entrenada para el tipo de robot `follow` con vector de estado de 6 dimensiones.
- Integracion nativa con el ecosistema LeRobot para rollout y reentrenamiento via CLI (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, codigo, matematicas ni audio.

## Casos de uso

- Recogida de objetos de mano humana en entorno controlado: el modelo traduce las tres vistas de camara y el estado del efector final en comandos de accion de 6 grados de libertad para retirar hardware de la mano de un operador y depositarlo en una zona marcada.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible (50 episodios, 20.000 pasos, semilla 0) para estudiar el efecto del numero de demostraciones y de la complejidad de la tarea en politicas VLA pequenas.
- Fine-tuning sobre nuevos datasets: al derivar de `lerobot/smolvla_base`, puede reajustarse con `lerobot-train` sobre grabaciones propias para adaptar la politica a otras tareas de pick-and-place.
- Despliegue en hardware de consumo: con 450 millones de parametros y 0,9 GB de pesos, es viable en estaciones con GPU consumer para experimentacion de laboratorio, segun la motivacion del paper SmolVLA.
- Banco de pruebas de pipelines LeRobot: util para validar el flujo completo de grabacion, entrenamiento y rollout (`lerobot-rollout` con `--strategy.type=base`) antes de escalar a tareas mas complejas.
- Docencia y demos de robotica: permite montar una demo de manipulacion visuomotora multi-camara con una sola politica y comandos CLI sencillos, sin infraestructura de servidores de inferencia a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (450 millones de parametros, 0,9 GB de pesos en safetensors) es previsible que quepa en GPUs consumer, aunque no se documenta una cifra concreta.
- GPU recomendadas: no disponible. El paper SmolVLA (arXiv:2506.01844) justifica el diseno compacto por su despliegue en hardware de consumo, pero este checkpoint no lista GPUs validadas.
- Compatibilidad con GPU consumer: probable por tamano, no confirmada en la model card.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. La politica opera a 30 FPS en la grabacion de datos, pero no se publica latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_stage2c_complexity_3_to_ds1 | 450.046.176 | no disponible | VLA de manipulacion (tarea unica) | apache-2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base preentrenado | no disponible en la informacion | Hugging Face |
| Alternativas VLA de mayor tamano (p. ej. familias OpenVLA o RT-2) | no disponible en la informacion | no disponible | VLA generalistas | no disponible en la informacion | no disponible |

No se dispone en la informacion proporcionada de datos suficientes para comparar rendimiento, contexto o metricas con alternativas concretas.

## Limitaciones y advertencias

- Entrenado para una unica tarea y un unico tipo de robot (`follow`); no generaliza a otras tareas sin reentrenamiento.
- Requiere exactamente las tres camaras (`gripper`, `newtop`, `newside`) y un vector de estado de 6 dimensiones; cambiar la configuracion de sensores invalida la politica.
- Sin resultados de evaluacion publicados: se desconoce la tasa de exito real en robot fisico.
- Dataset muy pequeno (50 episodios, 22.710 frames): alta probabilidad de sobreajuste a posiciones, iluminacion y objetos concretos del dataset `ds1`.
- Riesgo de fallos ante cambios de posicion de objetos, condiciones de luz, distracciones o un robot distinto del mismo tipo.
- Sin datos sobre sesgos, alucinacion, cobertura idiomatica ni contexto: no aplica el analisis habitual de modelos de lenguaje, pero implica ausencia de garantias documentadas.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el checkpoint es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la ficha.
- Fecha de creacion registrada como 2026-11-05, posterior a la fecha habitual de publicacion de SmolVLA; conviene verificar la procedencia del artefacto antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_3_to_ds1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset ds1: https://huggingface.co/datasets/ds1
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds1
