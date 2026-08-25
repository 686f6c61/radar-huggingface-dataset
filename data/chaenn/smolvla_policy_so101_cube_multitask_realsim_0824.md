# Chaenn/smolvla_policy_so101_cube_multitask_realsim_0824

## Resumen

SmolVLA es un modelo de vision-language-action (VLA) desarrollado por el equipo de Hugging Face, disenado para control roboticos asequibles y eficientes. Este checkpoint concreto, publicado por el usuario Chaenn, es una politica especializada para la tarea de pick-and-place de un cubo con el brazo robotico SO-101, entrenada sobre el modelo base `lerobot/smolvla_base` y el dataset `Chaenn/so101_cube_multitask_real_sim_0824`, que combina datos reales y simulados.

El modelo tiene 450 millones de parametros y un tamano de repositorio de 0,9 GB, lo que permite su despliegue en hardware de consumo. Su relevancia radica en que demuestra como un VLA compacto puede adaptarse a tareas roboticas especificas mediante fine-tuning con LeRobot, manteniendo un coste computacional reducido frente a modelos VLA de mayor escala. La licencia Apache-2.0 facilita su uso tanto en investigacion como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en SmolVLM) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. Esta disenado para ser compacto y eficiente, permitiendo su ejecucion en hardware de consumo. El modelo base es `lerobot/smolvla_base`, que a su vez se fundamenta en SmolVLM, un VLM ligero de la familia Smol.

El entrenamiento de esta politica se ha realizado con el framework LeRobot, utilizando el dataset `Chaenn/so101_cube_multitask_real_sim_0824`, que combina demostraciones reales y simuladas de la tarea de manipulacion de un cubo con el brazo SO-101. El proceso de fine-tuning adapta las capacidades generales del VLA base a la tarea especifica de pick-and-place, aprendiendo a mapear observaciones visuales y comandos de lenguaje en acciones motoras del robot. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Control robotico de brazo SO-101 para tareas de pick-and-place de un cubo.
- Integracion de percepcion visual y comprension de lenguaje para generar acciones motoras.
- Ejecucion en tiempo real sobre hardware de consumo gracias a su tamano reducido.
- Soporte de entrenamiento y evaluacion mediante el framework LeRobot.
- Capacidad de operar con datos de simulacion y del mundo real (real2sim o sim2real).
- Fine-tuning especifico para una tarea concreta, lo que mejora la precision frente al modelo base generico.

## Casos de uso

- Automatizacion de tareas de pick-and-place en laboratorios de robotica: el modelo puede controlar un brazo SO-101 para recoger y colocar objetos en posiciones definidas, con una ventana de contexto suficiente para manejar secuencias de manipulacion multi-paso.
- Investigacion en aprendizaje por imitacion: al estar entrenado con LeRobot, sirve como punto de partida para estudiar tecnicas de behavior cloning y evaluar la transferencia sim2real en manipulacion robotica.
- Prototipado rapido de politicas roboticas: investigadores pueden clonar este checkpoint y reentrenarlo con pocos datos para nuevas tareas de manipulacion, gracias al flujo de trabajo simplificado de LeRobot.
- Educacion en robotica e IA: su tamano reducido permite ejecutarlo en estaciones de trabajo con una unica GPU, facilitando su uso en cursos de robotica con aprendizaje profundo.
- Evaluacion de VLA en hardware de bajo coste: sirve como referencia para comparar el rendimiento de modelos VLA compactos frente a alternativas mas grandes en tareas de manipulacion reales.
- Desarrollo de sistemas de robotica asistida por lenguaje: el componente de lenguaje del modelo permite explorar interfaces de control basadas en instrucciones naturales para brazos roboticos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de exito en la tarea de pick-and-place, ni comparaciones con otros modelos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parametros, el modelo en FP32 ocupa aproximadamente 1,8 GB, y en FP16 unos 0,9 GB. Esto permite su ejecucion en GPUs con 4 GB de VRAM o menos, dependiendo de la resolucion de las imagenes de entrada.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como la NVIDIA GTX 1650, RTX 3060 o RTX 4090. Tambien es viable en hardware Apple Silicon con Metal.
- Si cabe en consumer GPU: si, es uno de los objetivos principales del diseno de SmolVLA.
- Opciones de despliegue: LeRobot (framework principal), y potencialmente vLLM, llama.cpp u Ollama si se exportan los pesos a GGUF, aunque no se proporciona soporte oficial para estos formatos.
- Latencia y throughput: no disponible. Dependera de la GPU y de la resolucion de las imagenes de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este checkpoint) | 450 M | no disponible | Apache-2.0 | Hugging Face |
| SmolVLA base (`lerobot/smolvla_base`) | 450 M | no disponible | Apache-2.0 | Hugging Face |
| OpenVLA | 7 B | no disponible | Apache-2.0 | Hugging Face |
| RT-2 | 55 B | no disponible | no disponible | no publico |

SmolVLA se posiciona como una alternativa mucho mas ligera que OpenVLA (7 B) o RT-2 (55 B), con un coste computacional significativamente menor. A cambio, su capacidad generalista es mas limitada, aunque el fine-tuning especifico puede compensar esta diferencia en tareas concretas como la de este checkpoint.

## Limitaciones y advertencias

- El modelo esta especializado en una tarea concreta (pick-and-place de un cubo con SO-101) y su generalizacion a otras tareas o robots no esta garantizada sin reentrenamiento.
- No se dispone de informacion sobre sesgos, ya que el dataset de entrenamiento no esta documentado en detalle.
- Riesgo de alucinacion en la generacion de lenguaje, aunque su impacto en tareas de control motor es limitado.
- La ventana de contexto no esta documentada, por lo que no se conocen los limites de secuencias de instrucciones o historial de observaciones.
- El rendimiento en el mundo real depende de la calidad de la calibracion del robot y de la distribucion de datos de entrenamiento.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo base y el dataset pueden tener sus propias restricciones que deben verificarse.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Chaenn/smolvla_policy_so101_cube_multitask_realsim_0824
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Blog sobre fine-tuning de SmolVLA para SO-101: https://ggando.com/blog/smolvla-so101/
- Documentacion de la politica SmolVLA en LeRobot: https://github.com/Adrian7210/lerobot-SO101/blob/main/docs/source/policy_smolvla_README.md
