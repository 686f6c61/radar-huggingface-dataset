# ethanCSL/openarm_plate_wiping_real_v00_smolvla

## Resumen

`ethanCSL/openarm_plate_wiping_real_v00_smolvla` es un ajuste fino (fine-tune) del modelo vision-language-action (VLA) SmolVLA, publicado por el usuario ethanCSL sobre la base `lerobot/smolvla_base`. Se trata de una política robótica entrenada con LeRobot para una tarea concreta de manipulación: limpiar platos con el brazo OpenArm, a partir del dataset `ethanCSL/openarm_plate_wiping_real_v00`. El repositorio contiene 450.046.176 parámetros en formato safetensors (aproximadamente 0,9 GB), lo que lo sitúa en la gama compacta de los modelos VLA.

SmolVLA, descrito en el paper arXiv:2506.01844, es una arquitectura VLA compacta y eficiente que, según la model card, alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. Ese perfil lo hace relevante para laboratorios y grupos de robótica que necesitan ejecutar políticas de control viso-motoras en tiempo real sin depender de clústeres de GPU de gama alta.

La relevancia de esta ficha concreta es acotada: se trata de un checkpoint de nicho (0 descargas y 0 likes en el momento de la consulta), orientado a reproducir una tarea específica en un robot OpenArm. No obstante, sirve como ejemplo práctico de cómo se especializa un VLA genérico mediante fine-tuning con datasets de demostraciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, familia SmolVLA; detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (450 M aproximadamente, dato real de safetensors) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, int8 o int4) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Otros datos: pipeline `robotics`, tamano del repositorio 0,9 GB, creado el 2026-10-06, modelo base `lerobot/smolvla_base`, dataset de entrenamiento `ethanCSL/openarm_plate_wiping_real_v00`.

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es un fine-tune de SmolVLA, un modelo vision-language-action compacto y eficiente descrito en el paper arXiv:2506.01844, cuyo objetivo declarado es lograr rendimiento competitivo con coste computacional reducido y despliegue viable en hardware de consumo. El entrenamiento y la publicacion se han realizado con la libreria LeRobot de Hugging Face, lo que implica un pipeline estandar de imitation learning sobre demostraciones.

No se detallan en la informacion proporcionada el numero de tokens o episodios de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u optimizacion posterior. El dataset asociado, `ethanCSL/openarm_plate_wiping_real_v00`, corresponde a demostraciones reales de la tarea de limpiar platos con el robot OpenArm. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias de la familia SmolVLA.

## Capacidades

- Generacion de acciones motoras (action chunking) a partir de observaciones visuales y del estado del robot, propia de una politica VLA.
- Ejecucion de una tarea manipulativa concreta: limpieza de platos (plate wiping) sobre el hardware OpenArm.
- Aprendizaje por imitacion a partir de demostraciones reales recogidas con LeRobot.
- Inferencia sobre hardware de consumo, segun la descripcion general de SmolVLA.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el modelo no genera lenguaje en su uso previsto como politica).
- Capacidades especiales (modo thinking, vision, audio): vision como entrada inherente a un VLA; audio y modo thinking no disponibles.

## Casos de uso

- Automatizacion de limpieza de platos en un banco de robotica con OpenArm: el checkpoint se carga como politica en LeRobot y se ejecuta con `lerobot-record`, reproduciendo la tarea aprendida sobre el mismo tipo de brazo con el que se recogieron las demostraciones.
- Reproduccion de experimentos de imitation learning: sirve como punto de partida para comparar hiperparametros, tasas de aprendizaje o volumen de datos frente a la base `lerobot/smolvla_base`.
- Fine-tuning adicional sobre nuevas tareas de manipulacion: al ser un modelo de 450 M de parametros y 0,9 GB, se puede reentrenar en una unica GPU de gama media dentro de un flujo LeRobot.
- Validacion de pipelines de datos: el dataset `openarm_plate_wiping_real_v00` y este checkpoint permiten verificar de extremo a extremo el ciclo captura de demostraciones, entrenamiento, evaluacion y despliegue.
- Docencia y formacion en robotica con VLA: el tamano reducido permite que estudiantes ejecuten entrenamiento e inferencia en equipos de laboratorio sin acceso a clústeres.
- Pruebas de despliegue en hardware de consumo: permite medir latencias de inferencia de un VLA compacto en GPUs de escritorio o incluso en CPU, como referencia para decidir si un caso de uso industrial es viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito de la tarea, ni metricas de evaluacion, ni comparaciones cuantitativas con otros checkpoints. No se deben asumir cifras de rendimiento a partir de la descripcion general de SmolVLA, ya que este repositorio es un fine-tune especifico sin evaluacion publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en precision fp32 (tamano del repositorio en safetensors); alrededor de 0,45 GB en fp16/bf16 si se convierte; el consumo real de ejecucion depende del backend y de los buffers de vision, dato no disponible.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM deberia ser suficiente por tamano de parametros; no se especifican modelos concretos en la informacion disponible.
- GPU de consumo: si cabe, dado el tamano de 450 M de parametros; tambien es plausible la ejecucion en CPU, aunque la latencia no esta documentada.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para evaluacion/inferencia con `--policy.path`), con PyTorch sobre CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a una politica VLA de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ethanCSL/openarm_plate_wiping_real_v00_smolvla | 450 M | no disponible | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | 450 M (misma familia) | no disponible | no disponible en la informacion proporcionada | apache-2.0 | Hugging Face |
| OpenVLA | 7 B (aproximado, segun su documentacion publica) | no aplica como contexto de texto | no disponible en la informacion proporcionada | licencia especifica del proyecto, consultar su repositorio | Hugging Face / GitHub |
| pi0 (Physical Intelligence) | 3,3 B (aproximado, segun su documentacion publica) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face / repositorio del proyecto |

Nota: los datos de OpenVLA y pi0 corresponden a referencias publicas generales y no han sido verificados dentro de la informacion proporcionada; se incluyen solo como orientacion de categoria. No se dispone de una comparacion de rendimiento homogenea entre estos modelos.

## Limitaciones y advertencias

- Modelo de nicho: entrenado para una unica tarea (limpieza de platos) y un unico tipo de robot (OpenArm); su uso fuera de ese contexto probablemente requiera reentrenamiento.
- Sin evaluacion publicada: no hay tasas de exito, curvas de aprendizaje ni analisis de fallos, por lo que no se puede garantizar su fiabilidad en produccion.
- Sin datos de sesgo: no se documenta analisis de sesgos visuales, de iluminacion, de materiales u objetos similares.
- Riesgo de sobreajuste al entorno de recogida de datos: cambios en la iluminacion, la posicion de la camara, el tipo de plato o la mesa pueden degradar el comportamiento.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial, pero el modelo base y el dataset asociado deben revisarse por separado para confirmar compatibilidad.
- Idiomas y contexto: no disponibles; el modelo no esta pensado para tareas de lenguaje natural.
- Caveat de produccion: al ser una politica de control fisico, cualquier despliegue debe incluir limites de par, paradas de emergencia y supervision, con independencia del rendimiento del modelo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan pruebas de terceros o soporte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_plate_wiping_real_v00_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_plate_wiping_real_v00
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
