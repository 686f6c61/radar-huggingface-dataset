# ResidentEvian/smolvla_50_episodes_static_pos

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto orientado a robótica de imitación. Esta ficha concreta, `ResidentEvian/smolvla_50_episodes_static_pos`, es un ajuste fino del checkpoint base `lerobot/smolvla_base` (unos 450 millones de parámetros) realizado por el usuario ResidentEvian con la librería LeRobot 0.6.1. El modelo resuelve una única tarea de manipulación: coger un cubo azul y depositarlo en una caja naranja, usando un brazo `so_follower` (familia SO-100) con dos cámaras (`top` y `wrist`) y un vector de estado de 6 dimensiones.

A diferencia de un LLM convencional, la entrada es multimodal y temporal (dos flujos de imagen de 480x640 píxeles más el estado articular) y la salida es una acción de 6 dimensiones, no texto. Su relevancia está en que demuestra el ciclo completo de imitación con hardware de bajo coste: 50 episodios teleoperados, 16 789 fotogramas a 30 FPS y 20 000 pasos de entrenamiento producen una política ejecutable en GPUs de consumo. Frente al coste de los VLA de gran escala, SmolVLA apuesta por un tamaño reducido y un entrenamiento asequible, tal y como describe el artículo asociado (arXiv 2506.01844).

Es, por tanto, un modelo de referencia para desarrolladores que quieran evaluar el pipeline de LeRobot, servir de base para nuevos ajustes finos o comparar políticas de imitación, más que un asistente conversacional o un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA compacta SmolVLA (encoder visual + modelo de lenguaje + experto de acciones con flow matching, segun el articulo arXiv 2506.01844); detalles de capas no disponibles en la informacion proporcionada |
| Parametros totales | 450 046 176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; solo se distribuyen pesos en safetensors (sin variantes GGUF publicadas) |
| Idiomas soportados | No disponible (la instruccion de tarea del dataset esta en ingles: "Grab the blue cube and put it in the orange box") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,2 GB); libreria `lerobot` |

Especificaciones de entrada y salida declaradas en la model card:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | Estado | (6,) |
| `observation.images.top` | Visual | (3, 480, 640) |
| `observation.images.wrist` | Visual | (3, 480, 640) |
| `action` | Accion | (6,) |

## Arquitectura y entrenamiento

La model card identifica el modelo como SmolVLA, una VLA "compacta y eficiente" que busca rendimiento competitivo con coste computacional reducido y despliegue en hardware de consumo. La arquitectura combina percepcion visual, una instruccion en lenguaje natural y el estado del robot para producir acciones continuas de 6 dimensiones; el articulo de referencia es arXiv 2506.01844. No se detallan en la informacion disponible el numero de capas, la dimension oculta, el encoder visual concreto ni la longitud de contexto del componente de lenguaje.

El ajuste fino se hizo sobre `lerobot/smolvla_base` con el dataset `ResidentEvian/blue-cube-into-box_20261015_112154`: 50 episodios, 16 789 fotogramas a 30 FPS, una sola tarea ("Grab the blue cube and put it in the orange box") y robot `so_follower` con camaras `top` y `wrist`. La configuracion de entrenamiento declarada es de 20 000 pasos, batch de 64, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.1. No se indica el numero total de tokens, la composicion del dataset mas alla de los episodios citados, ni si hubo RLHF o DPO (en imitacion supervisada no es lo habitual). No hay informacion sobre innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un brazo `so_follower` a partir de dos vistas de camara y del estado articular.
- Ejecución de una instrucción de tarea en lenguaje natural, limitada en la practica a la tarea entrenada ("coger el cubo azul y ponerlo en la caja naranja").
- Percepción visual multi-camara: procesa simultaneamente una vista cenital (`top`) y una vista de muñeca (`wrist`) a 480x640.
- Política de imitación entrenada de extremo a extremo con 50 demostraciones teleoperadas.
- Integración con el ecosistema LeRobot: ejecutable con `lerobot-rollout` y reentrenable con `lerobot-train`.
- Punto de partida para ajuste fino en tareas nuevas del mismo robot y configuracion de camaras.
- No se han documentado capacidades de tool calling, razonamiento multi-paso, agentes, matemáticas, generación de texto libre, audio ni visión generalista fuera del bucle de control.

## Casos de uso

- Demostración de pick-and-place en laboratorio: ejecutar la política sobre un SO-100 con camaras cenital y de muñeca para validar que el pipeline de imitación completa (teleoperar, grabar, entrenar, desplegar) funciona antes de escalar a tareas reales.
- Baseline interno de referencia: usar este checkpoint como punto de comparación al entrenar políticas nuevas con el mismo dataset y robot, de modo que cualquier mejora sea atribuible al cambio de método y no al hardware.
- Ajuste fino con datos propios: al derivar de `lerobot/smolvla_base` y seguir el flujo de `lerobot-train`, sirve como inicializacion para tareas de agarre similares con 50-100 episodios adicionales, reduciendo el coste frente a entrenar desde cero.
- Docencia y formación en robotica de imitacion: el modelo y su dataset son lo bastante pequenos (1,2 GB, 50 episodios) para que un grupo pueda inspeccionar la configuracion, repetir el entrenamiento y analizar el efecto de los hiperparametros.
- Pruebas de robustez controladas: variar iluminacion, posicion inicial del cubo o presencia de distractores y medir la tasa de exito para caracterizar la generalizacion espacial de una politica entrenada con posiciones estaticas (el nombre del checkpoint sugiere `static_pos`).
- Validacion de infraestructura de inferencia en robot: comprobar latencias del bucle de control, sincronizacion de dos camaras a 30 FPS y estabilidad de `lerobot-rollout` antes de integrar una politica en un banco de pruebas mayor.
- Generacion de datos comparativos para publicaciones o informes tecnicos: al ser apache-2.0 y de tamano reducido, puede redistribuirse y evaluarse en varios robots del mismo tipo sin friccion legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la seccion de evaluacion vacia y senala explicitamente: "No evaluation results have been provided for this policy yet". No existen, por tanto, tasas de exito en robot real, ni metricas de MMLU, HumanEval o GSM8K (no aplicables a una politica VLA de control).

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | No disponible |
| Numero de ensayos por tarea | No disponible |
| Benchmarks de lenguaje o codigo | No aplicables / no disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia: los 450 millones de parametros ocupan aproximadamente 1,8 GB en FP32 y 0,9 GB en BF16; con las activaciones de dos flujos de 480x640 y el bucle de control, una estimacion prudente es de 2 a 4 GB de VRAM. No hay mediciones publicadas para este checkpoint.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM. Cabe en RTX 3060, RTX 4060, RTX 4070 y superiores; en RTX 4090, A100 o H100 sobra capacidad y el cuello de botella pasa a ser la captura de camara y el propio robot.
- Cabe en GPU de consumo: si, incluidas gamas medias y posiblemente iGPU o CPU, aunque no se han publicado tasas de inferencia para estos casos.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=ResidentEvian/smolvla_50_episodes_static_pos` (libreria `lerobot`, backend PyTorch). No se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a politicas de accion.
- Latencia y throughput: no disponibles. Como referencia del bucle previsto, el dataset se grabo a 30 FPS con camaras de 640x480, lo que sugiere una frecuencia de control del orden de decenas de hercios, pero no se confirma el rendimiento real del modelo.
- Requisitos adicionales: dos camaras OpenCV configuradas con los nombres `top` y `wrist` (deben coincidir con las claves de observacion del entrenamiento) y un brazo `so_follower` calibrado en el puerto correspondiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ResidentEvian/smolvla_50_episodes_static_pos` (este) | 450 046 176 | No disponible | Pick-and-place de una tarea, robot `so_follower` | Apache 2.0 | HuggingFace, libreria `lerobot` |
| `lerobot/smolvla_base` | 450 046 176 (mismo backbone, ajuste generico) | No disponible | VLA base preentrenada, requiere ajuste fino | No disponible en la informacion proporcionada | HuggingFace, `lerobot` |
| Politicas ACT de LeRobot | No disponible | No disponible | Imitacion para brazos tipo SO-100 | No disponible en la informacion proporcionada | HuggingFace, `lerobot` |
| VLA de gran escala tipo pi0 (Physical Intelligence) | No disponible en la informacion proporcionada | No disponible | Manipulacion generalista | No disponible en la informacion proporcionada | No verificada en esta busqueda |

La comparacion cuantitativa de rendimiento entre estas alternativas no esta disponible: no hay evaluaciones publicadas para este checkpoint ni datos de referencia en la informacion suministrada. La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre estos modelos.

## Limitaciones y advertencias

- Ambito funcional minimo: la politica esta entrenada para una unica tarea y un unico robot (`so_follower`). No es un modelo de proposito general ni acepta instrucciones arbitrarias.
- Dataset muy reducido: 50 episodios y 16 789 fotogramas implican un riesgo alto de sobreajuste a las condiciones de grabacion (posiciones, iluminacion, fondo y objetos concretos). El sufijo `static_pos` sugiere posiciones de objeto estaticas durante la recogida de datos, lo que limita la generalizacion espacial.
- Sin evaluacion: no se ha publicado ninguna tasa de exito en robot real, por lo que no se puede afirmar que la politica funcione fuera del entorno de entrenamiento.
- Riesgo de fallo silencioso: en politicas de imitacion, el modelo puede producir acciones plausibles pero incorrectas sin senal de error; es necesario supervision humana o paradas de seguridad en el robot.
- Dependencia de la configuracion de percepcion: los nombres y la geometria de las camaras (`top`, `wrist`) y la dimensionalidad del estado (6) deben coincidir exactamente con los del entrenamiento; cualquier cambio invalida la politica.
- Idiomas: no hay informacion sobre soporte multilingue de la instruccion; el dataset usa instrucciones en ingles, por lo que el comportamiento con instrucciones en castellano no esta verificado.
- Sesgos: no documentados. Al estar entrenado con un unico operador, un unico robot y un entorno concreto, heredara los sesgos de esas demostraciones (trayectorias, velocidad, estilo de agarre).
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia; conviene revisar tambien las condiciones del modelo base y del dataset de origen.
- Para produccion: no usar como unico mecanismo de control sin limites de par, paradas de emergencia y validacion extensiva en el robot objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ResidentEvian/smolvla_50_episodes_static_pos
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ResidentEvian/blue-cube-into-box_20261015_112154
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ResidentEvian/blue-cube-into-box_20261015_112154
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
