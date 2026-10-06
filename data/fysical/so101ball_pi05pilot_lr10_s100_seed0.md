# fysical/so101ball_pi05pilot_lr10_S100_seed0

## Resumen

Este repositorio contiene una politica robotica de tipo Vision-Language-Action (VLA) entrenada con LeRobot y publicada por el usuario `fysical`. Se trata de un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, que a su vez implementa la arquitectura π₀.₅ (Pi05) de Physical Intelligence, orientada a la generalizacion en entornos abiertos. El modelo resuelve una tarea concreta de manipulacion: coger una pelota verde y depositarla en una cesta, ignorando dos pelotas rojas de distraccion.

El modelo consume observaciones multimodales (tres flujos de imagen RGB a 224x224 y un vector de estado de 32 dimensiones) y produce un vector de accion de 6 dimensiones. Esta disenado para el brazo robotico `so_follower` (familia SO-101) con camaras frontal y de muneca, y se ejecuta mediante el comando `lerobot-rollout`.

Su relevancia radica en que ejemplifica el flujo actual de entrenamiento de politicas VLA sobre robotica de bajo coste dentro del ecosistema LeRobot, con licencia permisiva (Apache 2.0), lo que facilita su reproduccion, evaluacion y reutilizacion como punto de partida para nuevas tareas. No se han publicado resultados de evaluacion en robot real para esta politica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), implementacion LeRobot adaptada de OpenPI; detalle interno no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible / no aplicable (entrada multimodal: imagenes + estado) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible (no procesa instrucciones de texto; la tarea se fija por configuracion) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | so_follower |
| Camaras | front, wrist |
| Dataset de entrenamiento | fysical/greenball_pool_225_v1 |
| Version de LeRobot | 0.6.2 |

**Entradas**

| Caracteristica | Tipo | Forma |
|---|---|---|
| `observation.images.base_0_rgb` | VISUAL | (3, 224, 224) |
| `observation.images.left_wrist_0_rgb` | VISUAL | (3, 224, 224) |
| `observation.images.right_wrist_0_rgb` | VISUAL | (3, 224, 224) |
| `observation.state` | STATE | (32,) |

**Salidas**

| Caracteristica | Tipo | Forma |
|---|---|---|
| `action` | ACTION | (6,) |

## Arquitectura y entrenamiento

La politica se basa en π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence disenado para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementacion utilizada procede de la adaptacion de LeRobot del repositorio OpenPI de los autores originales. La entrada combina tres vistas visuales (camara base y dos de muneca) con un vector de estado de 32 dimensiones, y la salida es un vector de accion continuo de 6 dimensiones, tipico del control de un brazo manipulador.

El ajuste fino se realizo sobre el dataset `fysical/greenball_pool_225_v1`, compuesto por 225 episodios y 116.164 fotogramas a 30 FPS, todos correspondientes a la tarea "Pick up the green ball and place it in the basket, ignoring the two red distractor balls". La configuracion de entrenamiento registrada incluye 6.000 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 0,00025 y semilla 0. No se especifica en la informacion disponible el numero total de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla ninguna innovacion tecnica adicional (por ejemplo, decodificacion especulativa o atencion lineal).

## Capacidades

- Generacion de acciones de control motor: emite un vector de accion de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa de forma conjunta tres imagenes RGB de 224x224 (vista base y dos vistas de muneca) junto con un vector de estado de 32 dimensiones.
- Manipulacion pick-and-place: ejecuta la tarea de recoger un objeto y colocarlo en un destino.
- Discriminacion de distractores: entrenado especificamente para ignorar dos pelotas rojas de distraccion al localizar la pelota verde.
- Aprendizaje por imitacion (imitation learning): el comportamiento se deriva de demostraciones recogidas por teleoperacion.
- Reutilizacion mediante fine-tuning: al partir de `lerobot/pi05_base`, puede reentrenarse para nuevas tareas dentro del flujo de LeRobot.
- Soporte de tool calling / function calling: no disponible (no aplica; es una politica de control, no un modelo de lenguaje conversacional).
- Razonamiento multi-paso en agentes: no disponible (no se documenta capacidad de planificacion explicita).
- Capacidades multilingues: no disponible (la politica no consume instrucciones de texto).
- Modo de "pensamiento" / vision / audio: no disponible, salvo la percepcion visual integrada en la propia politica VLA.

## Casos de uso

- Manipulacion robotica pick-and-place: la politica ejecuta directamente la tarea de recoger la pelota verde y soltarla en la cesta sobre un brazo `so_follower`, sirviendo como demostracion funcional del pipeline de imitacion de LeRobot.
- Investigacion en aprendizaje por imitacion: permite estudiar como una politica VLA se comporta en una tarea con distractores visuales controlados (dos pelotas rojas), un escenario clasico para evaluar robustez perceptiva.
- Punto de partida para nuevas tareas: gracias a que se apoya en `lerobot/pi05_base`, puede reentrenarse con `lerobot-train` sobre datasets propios para otras tareas de manipulacion.
- Educacion y docencia en robotica: su licencia Apache 2.0 y su integracion con LeRobot lo hacen util para cursos practicos sobre VLA, teleoperacion y politicas de control de bajo coste.
- Pruebas de generalizacion en robot real: al provenir de un modelo base disenado para generalizacion abierta, permite medir la transferencia del ajuste fino a pequenas variaciones de posicion o iluminacion (aunque no se han publicado resultados).
- Evaluacion comparativa de politicas: puede utilizarse como referencia en experimentos que comparen distintas configuraciones de entrenamiento (semillas, tasas de aprendizaje) sobre el mismo dataset.
- Prototipado de entornos de produccion robotica: sirve para validar el ciclo completo de entrenamiento, despliegue y ejecucion en un brazo de bajo coste antes de escalar a tareas mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de exito en robot real, ni de comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, pero no se especifica el numero de parametros ni el consumo de memoria en ejecucion.
- GPU recomendadas: no disponible en la informacion proporcionada. El comando de entrenamiento de referencia usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA compatible con CUDA para entrenamiento e inferencia.
- Compatibilidad con GPU de consumo: no disponible. No se indica si la politica cabe en tarjetas como RTX 4090 o similares.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (ejecucion en robot) y `lerobot-train` (entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican directamente a esta politica de control.
- Latencia y throughput estimados: no disponible. El dataset de entrenamiento se grabo a 30 FPS, lo que sugiere una frecuencia de control del orden de ese valor, pero no se confirma en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fysical/so101ball_pi05pilot_lr10_S100_seed0 | no disponible | 3 imagenes 224x224 + estado (32,) | Pick-and-place de pelota verde en SO-101 | apache-2.0 | HuggingFace |
| lerobot/pi05_base | no disponible | Vision-Language-Action (Pi05) | Base generalista para fine-tuning | no disponible | HuggingFace |
| lerobot/pi0_base | no disponible | Vision-Language-Action (π₀) | Base generalista para fine-tuning | no disponible | HuggingFace |

La informacion proporcionada solo permite confirmar la relacion de dependencia con `lerobot/pi05_base`. No se dispone de datos de rendimiento ni de parametros de las alternativas para establecer una comparacion cuantitativa. Otras politicas de la misma categoria, como `lerobot/pi0_base` o SmolVLA, se citan como referencia de ecosistema, pero sus especificaciones no estan disponibles en esta busqueda.

## Limitaciones y advertencias

- Tarea muy especifica: la politica esta entrenada unicamente para "recoger la pelota verde y colocarla en la cesta ignorando dos pelotas rojas". Fuera de esa tarea no se garantiza un comportamiento util.
- Sin resultados de evaluacion: no se han publicado tasas de exito ni pruebas en robot real, por lo que el rendimiento efectivo es desconocido.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; en su lugar existe riesgo de acciones erroneas o fallos de agarre cuando la escena difiere de la distribucion de entrenamiento.
- Limitaciones de contexto o idioma: la politica no procesa instrucciones de texto; la tarea se fija externamente en la llamada de ejecucion. No hay capacidades multilingues.
- Dependencia del hardware: requiere un brazo `so_follower` y camaras con nombres de observacion compatibles (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`); cambios en la configuracion de camaras pueden invalidar la politica.
- Restricciones de licencia: Apache 2.0, permisiva para uso comercial. Conviene revisar las condiciones del modelo base `lerobot/pi05_base` y del dataset `fysical/greenball_pool_225_v1` para asegurar el cumplimiento en produccion.
- Caveat de reproduccion: el repositorio solo ocupa 0,1 GB y no se detallan los parametros; conviene verificar que los pesos publicados son suficientes para reproducir el ajuste antes de desplegarlo.
- Robustez limitada: al no haber evaluacion, se desconoce el comportamiento ante cambios de iluminacion, posicion de objetos o presencia de nuevos distractores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fysical/so101ball_pi05pilot_lr10_S100_seed0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/fysical/greenball_pool_225_v1
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fysical/greenball_pool_225_v1
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no disponible (enlace no incluido en la informacion)
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
