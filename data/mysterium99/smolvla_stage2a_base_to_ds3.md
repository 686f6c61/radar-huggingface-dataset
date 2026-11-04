# mysterium99/smolvla_stage2a_base_to_ds3

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para controlar robots reales mediante imitation learning. Esta ficha concreta, `mysterium99/smolvla_stage2a_base_to_ds3`, es un fine-tune del modelo base `lerobot/smolvla_base` sobre el dataset `ds3`, orientado a una unica tarea de manipulacion robotica: "Put all hardware in bucket". El modelo consume el estado del robot y tres camaras RGB de 256x256 y produce un vector de accion de 6 dimensiones, todo ello con 450 millones de parametros y un repo de apenas 0,9 GB.

La relevancia de SmolVLA reside en su propuesta de eficiencia: segun el paper asociado (arXiv:2506.01844), busca rendimiento competitivo en tareas roboticas con un coste computacional reducido, de modo que pueda desplegarse en hardware de consumo. Este checkpoint en particular es una muestra de un pipeline de entrenamiento por etapas (el nombre "stage2a" sugiere una fase intermedia de un entrenamiento multi-etapa), entrenado durante 20000 pasos con batch de 8 sobre 50 episodios y 85293 frames a 30 FPS.

Es importante subrayar que no se trata de un modelo de lenguaje generalista ni de un asistente conversacional: es una politica robotica especializada, con entradas y salidas estrictamente definidas por la configuracion de entrenamiento, y cuya utilidad queda acotada al robot tipo `follow` y a la tarea concreta del dataset `ds3`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta, integrada en LeRobot |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Modelo base | `lerobot/smolvla_base` |
| Tipo de robot | `follow` |
| Camaras | `gripper`, `newtop`, `newside` |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entradas visuales | 3 x `observation.images.cameraN`, shape `(3, 256, 256)` |
| Salida | `action`, shape `(6,)` |
| Dataset de entrenamiento | `ds3` (50 episodios, 85293 frames, 30 FPS) |
| Tarea entrenada | "Put all hardware in bucket" |
| Pasos de entrenamiento | 20000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 0.0001 |
| Seed | 0 |
| Version de LeRobot | 0.6.1 |
| Tamano del repo | 0,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844: un modelo VLA compacto que combina percepcion visual, comprension del lenguaje de la tarea y generacion de acciones motoras. La politica recibe como observacion el estado propioceptivo del robot (vector de 6 dimensiones) y tres flujos de imagen de 256x256 procedentes de las camaras `gripper`, `newtop` y `newside`, y emite un vector de accion de 6 dimensiones. El detalle interno de capas, mecanismos de atencion y composicion exacta del encoder visual no se documenta en la model card disponible.

El entrenamiento se realizo mediante fine-tuning supervisado (imitation learning) desde `lerobot/smolvla_base` sobre el dataset `ds3`, compuesto por 50 episodios y 85293 frames grabados a 30 FPS para la tarea "Put all hardware in bucket". La configuracion reportada es de 20000 pasos, batch size 8, optimizador AdamW con learning rate 0.0001 y seed 0, ejecutado con LeRobot 0.6.1. No se especifica en la informacion disponible si hubo fases de RLHF, DPO u otros ajustes posteriores, ni el numero total de tokens o el volumen exacto de datos de preentrenamiento del modelo base.

## Capacidades

- Control robotico por imitation learning: genera acciones de 6 dimensiones a partir de observaciones multimodales (estado + 3 camaras).
- Percepcion visual multi-camara: procesa simultaneamente vistas de pinza, vista superior y vista lateral a 256x256.
- Condicionamiento por lenguaje de tarea: acepta una descripcion textual de la tarea (en el ejemplo, `--task="Put all hardware in bucket"`).
- Ejecucion de politicas en robot real mediante `lerobot-rollout` con `--strategy.type=base`.
- Fine-tuning adicional: puede reentrenarse con `lerobot-train` partiendo de `lerobot/smolvla_base`.
- Integracion con el ecosistema LeRobot (grabacion, calibracion, despliegue y visualizacion de datasets).
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modos de razonamiento extendido; no aplican a este tipo de modelo.

## Casos de uso

- Manipulacion robotica de recogida en contenedor: el modelo esta entrenado especificamente para "Put all hardware in bucket", por lo que puede desplegarse directamente en un robot `follow` con las tres camaras configuradas para ejecutar esa tarea de pick-and-place.
- Prototipado rapido de politicas en laboratorio: al ocupar 0,9 GB y 450 M de parametros, permite iterar sobre un robot real con hardware modesto antes de escalar a modelos mayores.
- Base para fine-tuning en tareas similares: partiendo de `lerobot/smolvla_base` y usando `ds3` como referencia, un equipo puede adaptar la politica a su propia tarea de clasificacion de piezas con `lerobot-train`.
- Validacion de pipelines de datos roboticos: sirve para comprobar el flujo completo de LeRobot (grabacion, calibracion, entrenamiento, rollout) antes de invertir en datasets mayores.
- Investigacion en imitation learning: como checkpoint intermedio de un entrenamiento por etapas ("stage2a"), es util para estudiar el efecto del numero de pasos y del volumen de datos en el exito de la tarea.
- Demostraciones y educacion: su tamano reducido y su licencia Apache 2.0 lo hacen adecuado para cursos y talleres de robotica con aprendizaje por imitacion.
- Evaluacion comparativa de politicas: puede emplearse como linea base frente a politicas entrenadas con mas datos o mas parametros sobre la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real, ni de metricas de MMLU, HumanEval, GSM8K u otras, que por otra parte no aplican a un modelo de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parametros y pesos en safetensors, la huella del modelo ronda el orden de 1-2 GB en fp32/fp16, pero no se documenta una cifra oficial.
- GPU recomendadas: no se especifican; el paper de SmolVLA enfatiza el despliegue en hardware de consumo, pero la model card no detalla modelos concretos.
- Compatibilidad con GPU de consumo: probable por el tamano del modelo (0,9 GB de repo), aunque no se confirma en la informacion disponible.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecucion en robot y `lerobot-train` para reentrenamiento; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este pipeline.
- Latencia y throughput: no disponibles. El bucle de control opera a 30 FPS en la captura de datos, pero no se reporta la frecuencia de inferencia real.
- Requisitos adicionales: robot tipo `follow`, puerto serie del robot y tres camaras OpenCV configuradas con nombres que coincidan con las claves de observacion (`gripper`, `newtop`, `newside`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mysterium99/smolvla_stage2a_base_to_ds3` | 450 M | no disponible | "Put all hardware in bucket" (ds3) | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible en la informacion | no disponible | Base VLA general para fine-tuning | no disponible en la informacion | Hugging Face (modelo base citado) |
| Alternativas de la misma categoria (otras politicas VLA) | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo base del que deriva. No se dispone de datos de rendimiento ni de especificaciones de otros modelos VLA comparables para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado unicamente para la tarea "Put all hardware in bucket" sobre el dataset `ds3`; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuracion hardware: requiere un robot tipo `follow` y exactamente tres camaras con los nombres `gripper`, `newtop` y `newside`; cualquier cambio en la disposicion o en las claves de observacion invalida la politica.
- Sin evaluacion publicada: no hay tasas de exito verificadas en robot real, por lo que se desconoce su fiabilidad en produccion.
- Riesgo de sobreajuste al dataset: con solo 50 episodios y 85293 frames, la politica puede fallar ante variaciones de iluminacion, posiciones de objetos o distracciones no vistas durante el entrenamiento.
- Sin datos sobre sesgos, alucinacion o comportamientos inseguros: al ser un modelo de control motor, los fallos se traducen en acciones fisicas erroneas, con el riesgo asociado para el entorno y el robot.
- Idiomas y contexto: no se documentan capacidades multilingues ni ventana de contexto; el condicionamiento linguistico se limita a la instruccion de tarea.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del dataset `ds3` para uso comercial.
- Version de LeRobot: entrenado con LeRobot 0.6.1; cambios de version pueden afectar a la compatibilidad de carga y ejecucion.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2a_base_to_ds3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/ds3
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de datasets: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds3
