# HyeonseokE/smolvla_phase1_pick_place_A1_via4cm_3000_10fps

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, adaptado para una tarea concreta de robótica: recoger un bloque rojo y colocarlo sobre un plato azul. El autor, HyeonseokE, ha entrenado esta política con el framework LeRobot sobre el modelo base `lerobot/smolvla_base`, utilizando un dataset propio de 100 episodios grabados a 10 FPS con un robot SO-101. Con 450 millones de parámetros, el modelo está diseñado para ejecutarse en hardware de consumo, lo que lo hace relevante para la investigación y el prototipado rápido de políticas robóticas sin necesidad de infraestructura costosa.

La arquitectura subyacente, SmolVLA, combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, permitiendo que el robot interprete instrucciones en lenguaje natural y genere comandos de control. Este fine-tuning en particular se centra en una tarea de pick-and-place con dos cámaras (superior y muñeca izquierda), aunque la tabla de entradas muestra tres cámaras, lo que sugiere una posible discrepancia en la documentación. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors, con un tamaño de repositorio de 0,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (tarea en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura VLA que integra un codificador visual, un modelo de lenguaje y un decodificador de acciones para convertir observaciones (imagenes y estado del robot) en comandos de control. Este fine-tuning parte del checkpoint `lerobot/smolvla_base` y se entrena mediante aprendizaje por imitacion con el framework LeRobot. El dataset de entrenamiento contiene 100 episodios (28.530 frames) de la tarea "Pick up the red block and place it on the blue dish", grabados a 10 FPS con un robot SO-101 y dos camaras (superior y muñeca izquierda). La configuracion de entrenamiento incluye 22.250 pasos, batch size de 64, optimizador AdamW con learning rate de 0,0001 y semilla 3000. No se aplicaron tecnicas de RLHF ni DPO; el entrenamiento es puramente supervisado sobre las demostraciones.

## Capacidades

- Control robotico de pick-and-place: recoge un objeto rojo y lo coloca sobre un plato azul, generando acciones de 6 dimensiones (posicion y orientacion del efector).
- Percepcion visual multimodal: procesa imagenes de hasta tres camaras (aunque la documentacion menciona dos) con resolucion de 256x256 píxeles.
- Entrada de estado del robot: recibe un vector de 6 dimensiones con la configuracion articular del brazo.
- Salida de acciones continuas: produce comandos de 6 dimensiones para el control del robot.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de politicas roboticas de Hugging Face.
- No incluye tool calling, capacidades de agente, ni soporte multilingue; su funcion es exclusivamente robotica.

## Casos de uso

- Automatizacion de tareas de clasificacion en entornos industriales: el modelo puede controlar un brazo SO-101 para separar objetos por color, por ejemplo, recogiendo bloques rojos y depositandolos en bandejas designadas, lo que reduce la intervencion manual en lineas de montaje.
- Investigacion en aprendizaje por imitacion: al ser un fine-tuning de SmolVLA, sirve como punto de partida para estudiar la transferencia de politicas entre tareas o la influencia de la semilla en el rendimiento, comparandolo con otras variantes del mismo autor.
- Prototipado rapido de politicas roboticas: gracias a su integracion con LeRobot, los desarrolladores pueden cargar el modelo y ejecutar rollouts en minutos, acelerando el ciclo de experimentacion en laboratorios.
- Educacion en robotica y VLA: su tamano compacto (450M parametros) permite ejecutarlo en estaciones de trabajo modestas, lo que lo hace adecuado para cursos universitarios o talleres practicos sobre modelos de vision-lenguaje-accion.
- Despliegue en robots de bajo coste: el modelo esta optimizado para hardware de consumo, por lo que puede correr en GPUs como una RTX 3060, habilitando pruebas de campo en robots SO-101 sin necesidad de servidores dedicados.
- Validacion de configuraciones de camaras: al entrenarse con dos camaras (superior y muñeca), el modelo permite evaluar como afecta la disposicion de los sensores al exito de la tarea, util para disenar sistemas de percepcion robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en el mundo real para esta politica.

## Requisitos de hardware

- VRAM estimada: con 450 millones de parametros y 0,9 GB en safetensors, en precision fp16 el modelo ocuparia aproximadamente 0,9 GB de VRAM, por lo que cabria en GPUs con 2 GB o mas. Sin embargo, no se han publicado requisitos oficiales.
- GPU recomendadas: no hay especificaciones oficiales, pero por el tamano del modelo, una GPU de consumo como la RTX 3060 (12 GB) o incluso una GTX 1660 Super (6 GB) serian suficientes para inferencia.
- Compatibilidad con hardware de consumo: si, el modelo esta disenado para ejecutarse en GPUs de gama media, aunque se recomienda probar con LeRobot para confirmar el rendimiento.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que ofrece comandos como `lerobot-rollout` para inferencia en el robot. No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuracion de camaras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HyeonseokE/smolvla_phase1_pick_place_A1_via4cm_3000_10fps | 450M | no disponible | apache-2.0 | Hugging Face |
| HyeonseokE/smolvla_phase1_pick_place_A1_1000_10fps | 450M (estimado) | no disponible | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | 450M (estimado) | no disponible | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal entre los dos fine-tunings del autor es la semilla de entrenamiento (3000 vs 1000), lo que puede afectar a la reproducibilidad y al exito en el robot real, pero no hay metricas publicadas.

## Limitaciones y advertencias

- No hay resultados de evaluacion en el mundo real: la model card no incluye tasas de exito en el robot, por lo que se desconoce su rendimiento efectivo fuera del entorno de entrenamiento.
- Especializacion estrecha: el modelo solo ha sido entrenado para una tarea concreta (recoger bloque rojo y colocarlo en plato azul) y puede fallar ante variaciones en la posicion de los objetos, iluminacion o distracciones.
- Dependencia de la configuracion de camaras: aunque la documentacion menciona dos camaras, la tabla de entradas lista tres, lo que sugiere una posible inconsistencia que podria causar errores al desplegar con una configuracion diferente.
- Dataset limitado: con solo 100 episodios, la politica puede no generalizar bien a escenarios no vistos, especialmente si el robot o el entorno cambian.
- Sesgos del entorno: el dataset fue grabado en un entorno especifico (posiblemente simulado, segun el enlace a Claru.ai), por lo que el modelo puede no transferirse a entornos reales sin reentrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el dataset de entrenamiento no tenga restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_phase1_pick_place_A1_via4cm_3000_10fps
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_pick_place_A1_10fps_via4cm
- Variante con semilla 1000: https://huggingface.co/HyeonseokE/smolvla_phase1_pick_place_A1_1000_10fps
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
