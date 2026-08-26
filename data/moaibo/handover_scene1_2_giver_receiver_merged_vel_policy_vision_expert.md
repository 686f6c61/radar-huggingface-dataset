# MoAIBo/handover_scene1_2_giver_receiver_merged_vel_policy_vision_expert

## Resumen

El modelo `MoAIBo/handover_scene1_2_giver_receiver_merged_vel_policy_vision_expert` es un policy de robótica basado en SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente diseñado para ejecutarse en hardware de consumo. Desarrollado por el usuario MoAIBo, este fine-tuning se especializa en tareas de handover (entrega y recepción de objetos) entre dos robots móviles con brazo manipulador, concretamente el robot `so101_tb4` (TurtleBot 4 con manipulador).

El modelo resuelve el problema de la coordinación bimanual y la transferencia de objetos entre agentes robóticos, un escenario crítico en entornos colaborativos. Su relevancia radica en que demuestra cómo un VLA de tamaño reducido (450 millones de parámetros) puede aprender comportamientos de manipulación diádica complejos a partir de demostraciones, manteniendo la viabilidad de despliegue en GPUs de gama media. Está entrenado sobre un dataset propio de 338 episodios y 354.884 frames, con una ventana de contexto multimodal que incluye cinco cámaras (izquierda, derecha, muñeca, D455 y profundidad) más el estado del robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la implementacion de SmolVLA base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de accion robotica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje y una cabeza de accion. En esta variante, el modelo base es `lerobot/smolvla_base`, fine-tuneado con el framework LeRobot (version 0.6.0). La arquitectura procesa observaciones multimodales: cinco imagenes RGB (360x640 cada una) y un vector de estado de 8 dimensiones, y produce un vector de accion de 8 dimensiones (posicion y orientacion del efector, mas posiblemente velocidad).

El entrenamiento se realizo sobre el dataset `MoAIBo/handover_scene1_2_giver_receiver_merged_vel`, que contiene 338 episodios a 30 FPS con tareas de handover de objetos como espatula, cepillo, destornillador y botella. La configuracion de entrenamiento incluye 50.000 pasos, batch size de 13, optimizador AdamW con learning rate de 0.0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento; se trata de un fine-tuning por imitacion (behavior cloning) sobre el modelo base.

## Capacidades

- Generacion de acciones de manipulacion robotica: el modelo produce comandos de 8 dimensiones (posicion, orientacion y posiblemente velocidad) para el efector del robot.
- Percepcion multimodal: procesa simultaneamente cinco flujos de video (camaras izquierda, derecha, muñeca, D455 y profundidad) junto con el estado del robot.
- Coordinacion diadica: aprende a ejecutar roles de "dador" (giver) y "receptor" (receiver) en tareas de handover, incluyendo la sincronizacion de la liberacion del objeto.
- Generalizacion a multiples objetos: entrenado con espatula, cepillo, destornillador y botella, con variaciones de color (espatula negra, cepillo azul).
- Ejecucion en tiempo real: al ser un modelo compacto, puede operar a frecuencias de control adecuadas para robots moviles (30 FPS de datos de entrenamiento).
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de Hugging Face para robotica.

## Casos de uso

- Handover autonomo en almacenes: el modelo puede gestionar la transferencia de herramientas o piezas entre dos robots moviles, reduciendo la intervencion humana en lineas de montaje. Se usaria con el comando `lerobot-rollout` especificando la tarea de handover correspondiente.
- Colaboracion robot-robot en laboratorios: permite que dos robots se pasen instrumentos (p. ej., espatulas, destornilladores) en entornos de investigacion, liberando a los cientificos de tareas repetitivas de manipulacion.
- Pruebas de concepto en robotica de servicio: el modelo puede adaptarse a escenarios donde un robot entrega objetos a otro (p. ej., en hospitales o cocinas automatizadas), siempre que se reentrene con datos especificos del dominio.
- Benchmarking de VLA en manipulacion diadica: sirve como punto de partida para comparar arquitecturas de VLA compactas en tareas de coordinacion multi-robot, gracias a su licencia Apache 2.0 y su integracion con LeRobot.
- Desarrollo de politicas de manipulacion con pocos datos: al ser un fine-tuning de un modelo base, demuestra que con 338 episodios se puede lograr un comportamiento util, lo que es relevante para equipos con recursos limitados de recoleccion de datos.
- Investigacion en aprendizaje por imitacion multimodal: el dataset y el modelo permiten estudiar como fusionar multiples camaras y estado del robot para generar acciones precisas en tareas de contacto fisico entre agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de evaluacion cuantitativa (exito en tareas, tasa de handover completado, etc.) en la model card ni en los resultados de busqueda web.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero al tratarse de un modelo de 450M parametros, se estima que cabe en GPUs con al menos 8-12 GB de VRAM en precision FP16 (inferencia). Para entrenamiento, se requeriria mas memoria (probablemente 24 GB o mas).
- GPU recomendadas: RTX 3090, RTX 4090, A100 (para entrenamiento). Para inferencia en robot, una GPU de consumo como RTX 3060 o superior podria ser suficiente, dependiendo de la latencia requerida.
- Compatibilidad con consumer GPU: si, el modelo esta disenado para hardware de consumo segun el paper de SmolVLA.
- Opciones de despliegue: LeRobot (via `lerobot-rollout`), que internamente usa PyTorch. No se mencionan adaptaciones a vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estandar.
- Latencia y throughput: no disponible. Depende de la GPU y de la frecuencia de control del robot (el dataset esta a 30 FPS, lo que sugiere que el modelo debe inferir al menos a esa velocidad).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoAIBo/handover_scene1_2_giver_receiver_merged_vel_policy_vision_expert | 450M | no disponible | Handover robot-robot | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450M (aprox.) | no disponible | VLA generalista | Apache 2.0 | Hugging Face |
| RT-2 (Google) | 55B | no disponible | VLA generalista | Propietaria | no publico |
| OpenVLA | 7B | no disponible | VLA generalista | MIT | Hugging Face |

La comparativa se limita a modelos VLA conocidos. Este modelo se distingue por su tamano reducido (450M vs 7B de OpenVLA) y su especializacion en handover, mientras que los otros son generalistas. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Sesgos de datos: el modelo esta entrenado exclusivamente con el dataset de handover de MoAIBo, que incluye un numero limitado de objetos (espatula, cepillo, destornillador, botella) y un unico tipo de robot (`so101_tb4`). No generalizara a otros objetos o robots sin reentrenamiento.
- Riesgo de alucinacion en acciones: como todo modelo de aprendizaje por imitacion, puede generar acciones incorrectas o inseguras en situaciones fuera de la distribucion de entrenamiento (p. ej., objetos en posiciones inusuales, iluminacion cambiante).
- Limitaciones de contexto: la ventana de contexto multimodal no esta documentada; el modelo procesa 5 imagenes simultaneas, lo que puede limitar la frecuencia de inferencia en GPUs modestas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones (el dataset es Apache 2.0 segun su repositorio).
- Advertencia de produccion: no se han publicado evaluaciones de seguridad ni tasas de exito en entornos reales. Antes de usar en produccion, se recomienda validar el modelo en el robot objetivo con protocolos de seguridad.
- Dependencia de hardware especifico: el modelo requiere las camaras y la configuracion exacta descrita en la model card (5 camaras, resolucion 360x640) para funcionar correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MoAIBo/handover_scene1_2_giver_receiver_merged_vel_policy_vision_expert
- Dataset de entrenamiento: https://huggingface.co/datasets/MoAIBo/handover_scene1_2_giver_receiver_merged_vel
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
