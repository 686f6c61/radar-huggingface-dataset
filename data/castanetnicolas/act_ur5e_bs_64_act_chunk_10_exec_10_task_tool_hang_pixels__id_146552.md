# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_tool_hang_PIXELS__ID_146552

## Resumen

Esta ficha describe una politica de control robotico entrenada mediante aprendizaje por imitacion con el metodo ACT (Action Chunking with Transformers), publicado en el articulo arXiv 2304.13705. No se trata de un modelo de lenguaje, sino de una politica visomotora que, a partir de observaciones del estado del robot y de dos flujos de imagen, predice directamente comandos de actuacion en lugar de texto. El modelo ha sido entrenado por el usuario castanetnicolas y publicado en HuggingFace Hub usando el framework LeRobot de HuggingFace. Cuenta con 51.580.551 parametros (aproximadamente 51,6 millones) y pesa unos 0,2 GB en safetensors.

La tarea concreta para la que se ha entrenado es "Insert the hook into the base to build a frame, then hang the wrench on the hook", un problema de manipulacion robotica de tipo tool hang del conjunto RoboMimic. El entrenamiento se realizo sobre un dataset de 200 episodios y 95.962 fotogramas a 20 FPS, con 120.000 pasos de optimizacion, tamano de lote 64 y tasa de aprendizaje 1e-05. La politica predice fragmentos de accion (action chunks) de longitud 10 y ejecuta 10 pasos por chunk, de ahi el sufijo del identificador.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la publicacion y el despliegue de politicas de robotica en abierto. Al estar liberada bajo licencia Apache 2.0 y almacenada en safetensors, puede reutilizarse y desplegarse sin friccion tanto en investigacion como en prototipos. No obstante, se trata de una politica muy especifica para una unica tarea y un unico montaje de camaras, sin resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con componente CVAE para imitacion visomotora |
| Parametros totales | 51.580.551 (aprox. 51,6 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; horizonte de accion de 10 pasos por chunk a 20 FPS (0,5 s por chunk) |
| Tipos de cuantizacion | No disponible (entrenado y publicado en safetensors con precision de entrenamiento) |
| Idiomas soportados | No aplica (politica de control robotico; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el metodo ACT (Action Chunking with Transformers) descrito en el articulo arXiv 2304.13705. ACT es un metodo de aprendizaje por imitacion que, en lugar de predecir un unico paso de accion, predice un fragmento corto de acciones futuras. La arquitectura combina un codificador visual (backbone convolucional) que procesa las imagenes de las camaras, un transformer codificador-decodificador y un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas. La card del autor no detalla la composicion exacta de capas ni el numero de cabezas de atencion, por lo que esos datos concretos quedan como no disponibles.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset castanetnicolas/robomimic_tool_hang_ph_image84, compuesto por 200 episodios y 95.962 fotogramas capturados a 20 FPS. La tarea consiste en insertar un gancho en una base para construir un marco y colgar una llave inglesa en el gancho. La configuracion de entrenamiento reportada es: 120.000 pasos, tamano de lote 64, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. El identificador indica action chunk de 10 y ejecucion de 10, lo que significa que la politica infiere diez acciones futuras y las ejecuta antes de volver a observar. No se menciona uso de RLHF, DPO ni decodificacion especulativa, ya que no aplican a este tipo de politica.

## Capacidades

- Control visomotor de manipulacion robotica: predice comandos de accion de 7 dimensiones a partir del estado del robot (9 dimensiones) y dos imagenes RGB de 84x84.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de recompensas ni entorno simulado durante el entrenamiento.
- Prediccion por chunks de accion: genera 10 pasos de accion consecutivos por inferencia, lo que mejora la coherencia temporal y reduce el error acumulado frente a politicas paso a paso.
- Ejecucion especifica de la tarea "tool hang": insertar el gancho y colgar la llave.
- Entrada multimodal: una vista lateral fija (sideview) y una camara en la muneca (robot0_eye_in_hand).
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso simbolico ni capacidades multilingues, ya que no es un modelo de lenguaje.
- No tiene modo de pensamiento, vision generativa, audio ni generacion de texto.

## Casos de uso

- Reproduccion de la tarea tool hang en un robot Panda: la politica esta entrenada especificamente para esta tarea con el montaje de camaras indicado, por lo que puede desplegarse directamente con `lerobot-rollout` sobre el robot para reproducir la secuencia de insertar el gancho y colgar la llave.
- Punto de partida para fine-tuning en tareas de ensamblaje similares: al estar en safetensors y licencia Apache 2.0, puede servir como inicializacion para reentrenar con nuevos datasets de manipulacion en LeRobot.
- Banco de pruebas de aprendizaje por imitacion: util para investigadores que quieran comparar ACT con otros metodos (por ejemplo, Diffusion Policy) sobre el mismo dataset RoboMimic.
- Validacion de pipelines de despliegue LeRobot: sirve para verificar la integracion de `lerobot-rollout`, la configuracion de camaras OpenCV y el mapeo de claves de observacion en un montaje real.
- Experimentos de chunking: el modelo permite estudiar el efecto de predecir 10 acciones y ejecutar 10 sobre la estabilidad de la politica en tareas de contacto.
- Docencia y demostraciones de robotica: al ser un modelo pequeno (51,6 M de parametros, 0,2 GB), es adecuado para talleres donde se ensena el ciclo completo de teleoperacion, grabacion de datos, entrenamiento y despliegue.
- Investigacion sobre robustez ante variaciones de iluminacion, posicion de objetos o distractores: puede servir de linea base para medir la degradacion de una politica ACT ante cambios del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica y que la seccion de evaluacion permanece vacia.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Con 51,6 M de parametros y entradas de imagen de 84x84, la inferencia cabe en menos de 1 GB en precision completa; en FP16 o BF16 el uso es aun menor.
- GPU recomendadas: cualquier GPU moderna es suficiente. Se puede ejecutar en NVIDIA RTX 3060, RTX 4090, A100, H100 o incluso GPUs integradas de gama media.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), con backend PyTorch sobre CUDA. No esta pensado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. A 20 FPS de frecuencia de datos y con chunks de 10 acciones, la politica debe inferir a una frecuencia compatible con el lazo de control del robot Panda, pero no se han publicado mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (ACT tool hang) | ACT / imitacion visomotora | 51,6 M | chunk de 10 pasos a 20 FPS | tool hang en RoboMimic | Apache 2.0 | HuggingFace Hub |
| Diffusion Policy (Chi et al., 2023) | Imitacion visomotora basada en difusion | No disponible | Predice secuencias de accion | Manipulacion robotica | No disponible | Repositorio propio |
| Otras politicas ACT de LeRobot | ACT / imitacion visomotora | Variable (tipicamente decenas de millones) | chunks configurables | Tareas diversas | Habitualmente Apache 2.0 | HuggingFace Hub |

No se dispone de datos de rendimiento comparativos publicados para este modelo concreto, por lo que la comparacion se limita a caracteristicas estructurales y de licencia. Cualquier afirmacion sobre superioridad de un metodo frente a otro requeriria evaluaciones en el mismo entorno y no esta respaldada por la informacion disponible.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real de la politica en el robot, incluso en la tarea para la que fue entrenada.
- Politica especifica de una unica tarea: solo se ha entrenado para "Insert the hook into the base to build a frame, then hang the wrench on the hook". Fuera de esa tarea no cabe esperar un comportamiento util.
- Dependencia estricta del montaje de sensores: la politica espera exactamente las claves `observation.state` (9), `observation.images.sideview` (3, 84, 84) y `observation.images.robot0_eye_in_hand` (3, 84, 84). Cambiar nombres, resolucion o numero de camaras invalida la inferencia.
- Discrepancia entre nombre y configuracion: el identificador del repositorio menciona UR5e mientras que la model card declara `robot type: panda`. Conviene verificar que la plataforma de destino coincide con la usada en el entrenamiento.
- Riesgo de sobreajuste al entorno de demostracion: al entrenarse con 200 episodios en un unico montaje, es probable que la politica sea sensible a cambios de iluminacion, posicion inicial de los objetos o presencia de distractores.
- Sin capacidades de lenguaje, razonamiento simbolico, tool calling ni agentes: no debe confundirse con un LLM ni usarse como tal.
- Sin datos de sesgos: no hay informacion sobre sesgos en el dataset de entrenamiento, aunque al tratarse de una tarea robotica no aplican los sesgos tipicos de modelos de lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no se ofrece ninguna garantia sobre el funcionamiento ni sobre la idoneidad para produccion.
- Riesgo de dano fisico: al ser una politica que controla un brazo robotico real, su despliegue sin supervisioin y sin barandillas de seguridad puede provocar colisiones o danos materiales. Se recomienda modo de parada de emergencia y validacion previa en simulacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_tool_hang_PIXELS__ID_146552
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image84
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
