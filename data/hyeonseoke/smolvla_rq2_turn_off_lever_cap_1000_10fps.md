# HyeonseokE/smolvla_rq2_turn_off_lever_cap_1000_10fps

## Resumen

Este repositorio contiene una política robótica de tipo vision-language-action (VLA) denominada `smolvla`, publicada por el usuario HyeonseokE y entrenada con LeRobot. Se trata de un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, orientado a una única tarea de manipulación: girar una palanca para dejar un indicador de estado en rojo ("Turn the lever off; the status indicator should turn red."). El modelo consume observaciones multimodales (estado articular y tres cámaras) y produce comandos de acción de 6 dimensiones para un robot `so101_follower`.

Técnicamente es un modelo compacto, con 450.046.176 parámetros (aproximadamente 450 millones) y un peso de repositorio de 0,9 GB en formato safetensors, lo que lo sitúa en el rango de modelos desplegables en hardware de consumo. La model card lo describe explícitamente como un VLA "compacto y eficiente que logra un rendimiento competitivo a un coste computacional reducido y puede desplegarse en hardware de consumo", en línea con el artículo SmolVLA (arXiv:2506.01844) al que apunta el repositorio.

La relevancia de esta ficha es doble: por un lado, ilustra el flujo de trabajo actual de LeRobot para clonar políticas de imitación sobre robots de bajo coste; por otro, es un ejemplo de ajuste fino de tarea única con un conjunto de datos pequeño (100 episodios, 21.704 fotogramas a 10 FPS), lo que condiciona fuertemente sus capacidades y sus limitaciones de generalización. No se han publicado resultados de evaluación en el repositorio ni métricas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, familia SmolVLA; ajuste fino de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 (aprox. 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | no disponible; la instrucción de tarea del dataset esta en ingles ("Turn the lever off; the status indicator should turn red.") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria / pipeline | `lerobot` / `robotics` |
| Modelo base | `lerobot/smolvla_base` |
| Tamano del repositorio | 0,9 GB |
| Tipo de robot | `so101_follower` |
| Entradas | `observation.state` (6,), `observation.images.camera1` (3, 256, 256), `observation.images.camera2` (3, 256, 256), `observation.images.camera3` (3, 256, 256) |
| Salidas | `action` (6,), `action.radian_urdf0` (6,) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una política VLA de la familia SmolVLA, descrita por el autor como un modelo compacto y eficiente de visión-lenguaje-acción. El repositorio no detalla el diseño interno (backbone de visión-lenguaje, cabezal de acciones, mecanismo de decodificación ni esquema de atención), por lo que esos extremos deben consultarse en el artículo arXiv:2506.01844 enlazado en la model card. Lo que sí se documenta con precisión es la interfaz del modelo: entrada de estado propioceptivo de 6 dimensiones, tres flujos de imagen RGB de 256x256 píxeles y salida de acciones de 6 dimensiones (incluyendo una representación `action.radian_urdf0`).

El ajuste fino se realizó con LeRobot 0.6.0 sobre el conjunto de datos `HyeonseokE/rq2_turn_off_lever_cap_100_10fps`: 100 episodios, 21.704 fotogramas y una tasa de captura de 10 FPS, todos ellos correspondientes a la misma tarea. La configuración de entrenamiento registrada es: 16.950 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000 (valor que aparece también en el nombre del repositorio). No se documenta el uso de RLHF, DPO ni de ninguna fase de alineación adicional; se trata de aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Generación de acciones de manipulación de 6 grados de libertad para el robot `so101_follower`.
- Control guiado por una instrucción de tarea en lenguaje natural, en este caso "Turn the lever off; the status indicator should turn red.".
- Fusión de percepción visual procedente de tres cámaras (256x256) con el estado articular del robot.
- Ejecución de una tarea concreta de accionamiento de palanca hasta que el indicador de estado cambia a rojo.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y ejecución en robot con `lerobot-rollout`.
- Punto de partida reutilizable para ajustar nuevas tareas mediante aprendizaje por imitación.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión general de propósito abierto, audio ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades multilingües ni una lista de idiomas soportados.

## Casos de uso

- Automatización de accionamiento de palancas e interruptores en bancos de pruebas: el modelo recibe imágenes de tres cámaras y el estado articular, y emite los comandos necesarios para girar la palanca hasta que el indicador cambia a rojo. Es adecuado porque ha sido entrenado específicamente para esa secuencia.
- Reproducción de experimentos en robótica de imitación: al estar entrenado sobre un dataset público y reproducible (100 episodios, 21.704 fotogramas), sirve como referencia para comparar variantes de entrenamiento con LeRobot.
- Prototipado en laboratorios con presupuesto reducido: sus 450 M de parámetros y 0,9 GB de pesos permiten ejecutarlo en una GPU de gama de consumo, sin necesidad de clústeres.
- Educación y docencia en robótica: el par dataset + política permite mostrar el ciclo completo de recogida de datos, entrenamiento y despliegue con el robot SO-101.
- Base para ajuste fino de nuevas tareas: al derivar de `lerobot/smolvla_base`, se puede reentrenar con un dataset propio de otra tarea de manipulación siguiendo el comando `lerobot-train` documentado.
- Sustitución de tareas repetitivas en entornos peligrosos o de acceso restringido, donde accionar manualmente un interruptor expone al operario; el modelo puede desplegarse sobre el mismo tipo de robot ya caracterizado.
- Evaluación de robustez ante cambios de iluminación, posición de la palanca o presencia de distractores, usando esta política como línea base en experimentos controlados.
- Integración en pipelines automatizados de validación de políticas: `lerobot-rollout` con `--duration` permite ejecutar episodios de duración fija sin grabación, útil para pruebas de regresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la nota explícita "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito en robot real, número de ensayos ni métricas comparativas. Tampoco se documentan valores de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9-1 GB en precisión de 16 bits para los pesos (el repositorio completo ocupa 0,9 GB), más el coste de las activaciones y de los búferes de las tres cámaras a 256x256. No se proporciona una cifra oficial de VRAM.
- GPU recomendadas: no disponibles en la documentación. Con 450 M de parámetros, el modelo es desplegable en GPU de gama de consumo como la RTX 3060, RTX 4060 o RTX 4090; el entrenamiento del autor se realizó con `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, según la propia model card, que afirma que SmolVLA "puede desplegarse en hardware de consumo". No se especifica qué modelos concretos han sido validados.
- Opciones de despliegue documentadas: LeRobot (`lerobot-rollout` con `--strategy.type=base`, `--robot.type=so101_follower` y `--policy.path`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no a políticas robóticas con bucle de control.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se capturó a 10 FPS y el ejemplo de ejecución configura las cámaras a 30 FPS, pero no se publican mediciones de frecuencia de control efectiva del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HyeonseokE/smolvla_rq2_turn_off_lever_cap_1000_10fps` (este) | 450.046.176 | no disponible | Politica de una sola tarea sobre `so101_follower` | Apache 2.0 | HuggingFace, 0 descargas |
| `lerobot/smolvla_base` | no disponible en la informacion proporcionada | no disponible | Modelo base VLA para ajuste fino | no disponible en la informacion proporcionada | HuggingFace |
| Otras politicas VLA (por ejemplo OpenVLA o pi0-FAST) | no disponible en la informacion proporcionada | no disponible | Manipulacion generalista | no disponible en la informacion proporcionada | no disponible |

La busqueda web realizada no devolvio resultados tecnicos utilizables (unicamente enlaces genericos a YouTube), por lo que no se dispone de datos verificables de modelos alternativos para completar la comparativa.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta ajustado para una unica tarea ("girar la palanca hasta que el indicador se ponga rojo") sobre un unico tipo de robot (`so101_follower`). Fuera de ese contexto no se puede esperar un comportamiento util.
- Sin evaluacion en robot real: la model card indica explicitamente que no se han proporcionado resultados de evaluacion, por lo que se desconoce la tasa de exito real.
- Riesgo de sobreajuste: el ajuste se realizo con 100 episodios y 21.704 fotogramas de una sola tarea; la variabilidad de posiciones, iluminacion y distractores presente en el dataset es limitada.
- Sensibilidad al entorno: cambios en la iluminacion, la posicion de la palanca, el fondo o la camara pueden degradar el rendimiento, ya que no se documentan tecnicas de aumento de datos ni de robustez.
- Dependencia de la configuracion de sensores: la politica espera claves de observacion concretas. La model card menciona las camaras `top` y `left_wrist` en la seccion de detalles, mientras que la tabla de entradas lista `camera1`, `camera2` y `camera3`; esta discrepancia debe resolverse antes del despliegue, ya que los nombres de camara deben coincidir con las claves de observacion usadas en el entrenamiento.
- Inconsistencia en la nomenclatura: el identificador del modelo contiene `cap_1000_10fps` mientras que el dataset asociado se llama `rq2_turn_off_lever_cap_100_10fps`. Conviene verificar a que corresponde exactamente el sufijo.
- Fecha de creacion incoherente: los metadatos del Hub indican 2026-09-14 como fecha de creacion y actualizacion, posterior a la fecha habitual de publicacion; puede tratarse de un error de metadatos.
- Instruccion en ingles: la unica tarea documentada se expresa en ingles. No hay evidencia de soporte multilingue ni de generalizacion a instrucciones en castellano.
- Ausencia de cuantizaciones: solo se publican pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ, lo que limita las opciones de optimizacion de despliegue.
- Alucinacion en el sentido de acciones incorrectas: como politica de control, los errores se manifiestan como movimientos erroneos o inseguros del robot. Es imprescindible operar con limites de par, paradas de emergencia y supervision humana durante las pruebas.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero se ofrece sin garantias. Al derivar de `lerobot/smolvla_base`, conviene revisar tambien las condiciones del modelo base y del dataset utilizado.
- Datos de entrenamiento no auditados: no se documenta sesgo demografico ni de otro tipo porque los datos son demostraciones de robot, pero tampoco se detalla la composicion completa de las escenas grabadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_rq2_turn_off_lever_cap_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/rq2_turn_off_lever_cap_100_10fps
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/rq2_turn_off_lever_cap_100_10fps
- Articulo SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de imitacion (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
