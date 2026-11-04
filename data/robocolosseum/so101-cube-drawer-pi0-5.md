# RoboColosseum/so101-cube-drawer-pi0.5

## Resumen

`RoboColosseum/so101-cube-drawer-pi0.5` es un ajuste fino del modelo vision-lenguaje-accion (VLA) π₀.₅ (Pi05) de Physical Intelligence, adaptado a la libreria LeRobot de Hugging Face. El modelo parte de `lerobot/pi05_base` y se ha entrenado sobre un unico conjunto de datos de demostraciones teleoperadas para una tarea concreta de manipulacion robotica: coger un cubo azul de la mesa, colocarlo en un cajon abierto y cerrarlo. El autor del repositorio es RoboColosseum y la licencia es Apache 2.0.

Se trata de una politica de imitacion (imitation learning) que consume observaciones multimodales —estado articular de 6 dimensiones y tres flujos de imagen— y emite un vector de accion de 6 dimensiones a 30 FPS. El modelo tiene 4.143.404.816 parametros (aproximadamente 4,14 mil millones) y un repositorio de 97,9 GB, lo que refleja el peso de los checkpoints en precision completa junto con los artefactos de entrenamiento.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de como adaptar un VLA de proposito general a un brazo SO-101 de bajo coste mediante el flujo de LeRobot, y como referencia para quien quiera replicar el pipeline de entrenamiento o desplegar la politica en hardware identico. No es un modelo de proposito general ni un modelo de lenguaje: es un artefacto de robotica especializado en una sola tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) Pi05, implementacion LeRobot del repositorio OpenPI de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | so_follower (SO-101) |
| Camaras de entrada | front, wrist, empty_camera_0 |
| Entrada de estado | observation.state, shape (6,) |
| Salida de accion | action, shape (6,) |
| Frecuencia de entrenamiento | 30 FPS |
| Tamano del repositorio | 97,9 GB |
| Libreria | lerobot 0.6.1 |

## Arquitectura y entrenamiento

El modelo es un VLA basado en la arquitectura Pi05, que Physical Intelligence describe como una evolucion de π₀ orientada a la generalizacion en entornos y situaciones no vistos durante el entrenamiento. La implementacion concreta procede del repositorio OpenPI de la compania y ha sido portada a LeRobot. La politica combina un backbone vision-lenguaje con un cabezal de acciones que produce comandos motores continuos; el modelo card no detalla la composicion interna de capas, el mecanismo de atencion ni el esquema exacto de flow matching o difusion usado para generar acciones.

El ajuste fino se realizo sobre el dataset `Jiamo0912/so101-cube-drawer`, compuesto por 100 episodios y 38.687 fotogramas grabados a 30 FPS, todos ellos correspondientes a la tarea "Put the blue cube on the table into the open drawer, then close the drawer". El entrenamiento duro 40.000 pasos con tamano de lote 16, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000, sobre LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo posteriores; se trata de aprendizaje por imitacion supervisado a partir de demostraciones. Tampoco se especifican innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Control robotico de manipulacion: genera acciones continuas de 6 dimensiones para un brazo SO-101 (so_follower) a partir de observaciones visuales y de estado articular.
- Fusion multimodal de tres camaras: procesa imagenes frontales y de muneca a 480x640 y una tercera vista auxiliar a 224x224, ademas del vector de estado de 6 componentes.
- Ejecucion de una tarea especifica de largo horizonte: recoger un cubo, depositarlo en un cajon y cerrarlo, encadenando subtareas en una sola politica.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de 100 episodios teleoperados.
- Integracion con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso simbolico, dialogo multilingue, vision general, audio ni modo de pensamiento. Es un modelo de robotica, no un asistente conversacional.

## Casos de uso

- Replicacion de experimentos de imitation learning: el modelo sirve como punto de partida verificado para reproducir el pipeline completo de LeRobot (grabacion, entrenamiento y rollout) sobre un SO-101, con hiperparametros y dataset publicos.
- Demostracion de manipulacion pick-and-place en entornos educativos: universidades y laboratorios pueden desplegar la politica para ilustrar como un VLA transforma observaciones visuales en acciones motoras en un banco de pruebas de bajo coste.
- Benchmark interno de hardware SO-101: al estar entrenado para una tarea fija, permite comparar configuraciones de camaras, calibraciones y montajes fisicos midiendo la tasa de exito en la misma tarea.
- Base para ajuste fino en tareas similares: investigadores que trabajen con cubos y cajones pueden reutilizar los pesos como inicializacion y entrenar con sus propios datasets, reduciendo el coste frente a partir de `pi05_base`.
- Prueba de integracion de LeRobot en produccion de laboratorio: valida el flujo `lerobot-rollout` con `--strategy.type=base`, util para verificar la cadena de dependencias, puertos y nombres de camaras antes de escalar a tareas mas complejas.
- Generacion de datos sinteticos o aumentados: la politica puede ejecutarse de forma repetida para recoger trayectorias adicionales que alimenten futuros entrenamientos, aunque la calidad depende de la tasa de exito real, no publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la nota explicita: "No evaluation results have been provided for this policy yet." No hay tasas de exito, numeros de ensayos ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 4,14 mil millones de parametros, una estimacion orientativa en FP16 rondaria los 8-9 GB solo para pesos, pero no se confirma en la documentacion.
- GPU recomendadas: no especificadas por el autor. El comando de entrenamiento de referencia usa `--policy.device=cuda` sin indicar modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del repositorio (97,9 GB) sugiere checkpoints en precision completa y artefactos de entrenamiento que exceden la VRAM de tarjetas consumer, aunque la inferencia podria caber en GPUs de gama alta si se confirma la viabilidad de cuantizacion, dato no disponible.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--strategy.type=base` y `--policy.path`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica robotica.
- Latencia y throughput: no disponibles. La politica opera a 30 FPS en el dataset de entrenamiento, pero no se publican mediciones de latencia de inferencia ni throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboColosseum/so101-cube-drawer-pi0.5 | 4.143.404.816 | no disponible | Cubo en cajon (SO-101) | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista | no disponible en esta ficha | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista | no disponible en esta ficha | OpenPI |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado metricas de rendimiento para este ajuste fino ni se dispone de especificaciones detalladas de los modelos de referencia en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada exclusivamente para una tarea ("cubo azul en cajon abierto, cerrar cajon") y un robot concreto (so_follower). No generaliza a otras tareas, objetos ni morfologias sin reentrenamiento.
- Sin evaluacion publicada: no hay tasa de exito ni numero de ensayos, por lo que se desconoce su fiabilidad real en el mundo fisico.
- Dependencia de configuracion exacta: los nombres de camaras (`front`, `wrist`, `empty_camera_0`), sus resoluciones y el puerto del robot deben coincidir con los del entrenamiento; cualquier desviacion puede degradar el comportamiento.
- Dataset pequeno: 100 episodios y 38.687 fotogramas son una base limitada; el modelo puede sobreajustar a posiciones, iluminacion y disposicion concretas del entorno de grabacion.
- Riesgo de alucinacion motora: como toda politica de imitacion, puede generar acciones plausibles pero incorrectas ante situaciones fuera de distribucion, con riesgo de colision o dano fisico si no se aplican limites de seguridad.
- Sesgos: no documentados, pero inherentes a los datos de demostracion (un unico operador, un unico entorno, un unico objeto).
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el modelo base `lerobot/pi05_base` y la tecnologia Pi05 subyacente pueden tener terminos adicionales no cubiertos en esta ficha; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- Idiomas: no aplica; el modelo no procesa lenguaje natural como un LLM, aunque la tarea se especifica mediante una cadena de texto en el comando de rollout.
- Repositorio de 97,9 GB: el almacenamiento y la transferencia son costosos, lo que limita su uso en entornos con recursos ajustados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboColosseum/so101-cube-drawer-pi0.5
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiamo0912/so101-cube-drawer
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jiamo0912/so101-cube-drawer
- Blog de Pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
