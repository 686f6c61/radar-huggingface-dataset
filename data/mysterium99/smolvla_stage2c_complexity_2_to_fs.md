# mysterium99/smolvla_stage2c_complexity_2_to_fs

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, presentado en el articulo arXiv:2506.01844. Este repositorio concreto, `mysterium99/smolvla_stage2c_complexity_2_to_fs`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `fs`, orientado a una tarea robotica de manipulacion: recoger un perno y depositarlo en un cubo. El modelo consume el estado del robot (6 dimensiones) y tres camaras RGB de 256x256, y produce un vector de accion de 6 dimensiones.

Con 450.046.176 parametros totales (aproximadamente 450 millones), SmolVLA se posiciona como una alternativa ligera a los grandes VLA como OpenVLA o RT-2, disenada para ejecutarse en hardware de consumo. La relevancia de esta ficha radica en que documenta un fine-tuning concreto de una politica de imitacion lista para desplegar en un robot tipo `follower`, con licencia Apache 2.0 y formato safetensors, lo que facilita su integracion en pipelines de robotica real.

El modelo no es un LLM de proposito general: es una politica de control robotico entrenada por imitacion sobre 26 episodios y 38.356 fotogramas a 30 FPS. Su utilidad esta acotada a la tarea y configuracion de camaras con las que fue entrenado, y no se han publicado resultados de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta, segun arXiv:2506.01844 |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | follower |
| Camaras | gripper, newtop, newside |
| Entradas | observation.state (6,), 3 x observation.images (3, 256, 256) |
| Salidas | action (6,) |
| Tamano del repo | 0,9 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un componente de lenguaje y un decodificador de acciones, siguiendo el diseno descrito en el articulo arXiv:2506.01844. La arquitectura esta pensada para ser compacta y eficiente computacionalmente, de modo que pueda desplegarse en hardware de consumo sin sacrificar competitividad frente a VLA de mayor tamano. El modelo procesa tres flujos de imagen de 256x256 junto con el estado proprioceptivo del robot y emite directamente un vector de accion de 6 dimensiones, sin pasar por un LLM de texto general.

Este repositorio es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `fs`, que contiene 26 episodios y 38.356 fotogramas a 30 FPS para la tarea "Pick up the bolt and put it in the bucket". El entrenamiento se realizo con LeRobot 0.6.1, optimizador AdamW, learning rate 1e-4, batch size 8, semilla 0 y 20.000 pasos. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset mas alla de los episodios indicados, ni sobre si se aplicaron tecnicas de RLHF o DPO; al tratarse de una politica de imitacion, el paradigma habitual es el aprendizaje por imitacion supervisado.

## Capacidades

- Generacion de acciones de control robotico de 6 dimensiones a partir de observaciones multimodales (estado + tres camaras).
- Percepcion visual mediante tres camaras RGB (gripper, newtop, newside) a 256x256.
- Fusion de estado proprioceptivo (6 dimensiones) con informacion visual para producir politicas de manipulacion.
- Ejecucion de tareas de manipulacion guiada por instruccion en lenguaje natural (task prompt).
- Aprendizaje por imitacion: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Despliegue en hardware de consumo, segun la model card del modelo base.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni razonamiento de texto general.

## Casos de uso

- Manipulacion robotica de recogida y deposito: el modelo ejecuta la tarea "Pick up the bolt and put it in the bucket" sobre un robot follower con tres camaras, usando el estado del robot y las imagenes para generar acciones de 6 dimensiones en bucle cerrado.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como afecta la complejidad de la tarea y el numero de episodios al rendimiento de un VLA compacto, dado que el nombre del repositorio sugiere un experimento de escalado de complejidad.
- Prototipado rapido en robotica de bajo coste: al ser un modelo de 450 millones de parametros y 0,9 GB, puede desplegarse en estaciones de trabajo con GPU de consumo para validar pipelines de LeRobot antes de escalar a modelos mayores.
- Fine-tuning sobre nuevos datasets: el modelo base `lerobot/smolvla_base` puede reentrenarse con `lerobot-train` sobre datasets propios, y este repositorio sirve como referencia de configuracion (AdamW, lr 1e-4, 20.000 pasos).
- Evaluacion de robustez visual: al emplear tres camaras con vistas distintas (gripper, top, side), permite estudiar la contribucion de cada punto de vista a la politica de control.
- Benchmark interno de VLA ligeros: util como linea base para comparar arquitecturas VLA compactas en tareas de manipulacion con pocos datos (26 episodios).
- Demostraciones y docencia: la simplicidad del pipeline (`lerobot-rollout`) facilita su uso en cursos y talleres de robotica con aprendizaje profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 millones de parametros en safetensors (0,9 GB de repo), la inferencia en precision completa requiere del orden de 2-3 GB de VRAM, y menos con cuantizacion, aunque no se documentan cuantizaciones soportadas.
- GPU recomendadas: no especificadas en la informacion disponible; la model card del modelo base afirma que puede desplegarse en hardware de consumo.
- Cabe en GPU de consumo: si, segun la afirmacion del modelo base sobre despliegue en hardware de consumo; no se detallan modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, dado que es una politica robotica y no un LLM de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2c_complexity_2_to_fs | 450 M | no disponible | VLA robotica (fine-tuning) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA robotica (base) | no disponible en la informacion | Hugging Face |
| OpenVLA | no disponible en la informacion | no disponible | VLA robotica | no disponible en la informacion | no disponible en la informacion |
| RT-2 | no disponible en la informacion | no disponible | VLA robotica | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a la existencia de alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo esta entrenado para una unica tarea ("Pick up the bolt and put it in the bucket") y un unico tipo de robot (`follower`); no generaliza a otras tareas sin reentrenamiento.
- Requiere exactamente la configuracion de camaras con la que fue entrenado (gripper, newtop, newside) y las mismas claves de observacion; un cambio de camaras o de indices invalida la politica.
- El dataset de entrenamiento es muy pequeno (26 episodios, 38.356 fotogramas), lo que limita la robustez ante variaciones de posicion, iluminacion o distractores.
- No se han publicado evaluaciones de exito en robot real, por lo que se desconoce la tasa de exito real.
- Riesgo de sobreajuste a las condiciones de recogida de datos y de fallo ante objetos o entornos distintos.
- No es un modelo de lenguaje general: no soporta generacion de texto, codigo, matematicas ni tool calling.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- No se documentan sesgos, idiomas soportados ni limitaciones de contexto mas alla de las indicadas.

## Enlaces

- Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_2_to_fs
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset fs: https://huggingface.co/datasets/fs
- Guia LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fs
