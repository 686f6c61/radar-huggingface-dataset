# HyeonseokE/smolvla_pick_place_ours_2000_10fps

## Resumen

SmolVLA es un modelo vision-lenguaje-acción (VLA) compacto desarrollado por Hugging Face, disenado para controlar robots manipuladores a partir de observaciones visuales, el estado del robot y una instruccion en lenguaje natural. Esta ficha concreta, `HyeonseokE/smolvla_pick_place_ours_2000_10fps`, es un ajuste fino de la politica base `lerobot/smolvla_base` sobre un unico conjunto de datos propio de 100 episodios y 29.269 fotogramas grabados a 10 FPS, con una unica tarea: "Pick up the red block and place it on the blue dish" (coger el bloque rojo y dejarlo en el plato azul).

El modelo tiene 450.046.176 parametros (unos 450 M) y un repositorio de 0,9 GB en formato safetensors. Se distribuye a traves de la libreria LeRobot, con licencia Apache 2.0, y esta pensado para ejecutarse en hardware de consumo: el objetivo declarado del metodo SmolVLA es lograr un rendimiento competitivo en robotica con un coste computacional reducido frente a VLA de mayor tamano como OpenVLA o pi0.

Su relevancia es practica: sirve como ejemplo reproducible de ajuste fino de una politica VLA sobre un brazo SO-101 real, y como plantilla para cualquiera que quiera entrenar su propia politica de imitacion con LeRobot. No obstante, es una politica altamente especializada en una tarea, un robot y unas condiciones de camara concretas: no es un modelo de proposito general y no publica resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) derivada de SmolVLA: VLM preentrenado mas experto de accion con flow matching (heredada de `lerobot/smolvla_base`) |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en esta model card; corresponde al VLM base del modelo SmolVLA y solo debe cubrir la instruccion de tarea |
| Tipos de cuantizacion | No disponibles; pesos publicados en safetensors (precision declarada no especificada) |
| Idiomas soportados | No disponible; el dataset de entrenamiento usa instrucciones en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,9 GB, libreria `lerobot`) |
| Robot objetivo | `so101_follower` (brazo SO-101 de LeRobot) |
| Camaras declaradas | `top`, `left_wrist` (la tabla de entradas del autor lista tres claves `observation.images.camera1/2/3`) |
| Entradas | `observation.state` (6,), imagenes (3, 256, 256) |
| Salidas | `action` (6,), `action.radian_urdf0` (6,) |
| Frecuencia de control del dataset | 10 FPS |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de vision-lenguaje preentrenado con un experto de accion que genera trayectorias mediante flow matching (modelado generativo condicional de las acciones), en lugar de una regresion directa de la accion. Este ajuste concreto no modifica la arquitectura base: parte de `lerobot/smolvla_base` y se entrena para una tarea especifica. El modelo base esta descrito en el articulo arXiv:2506.01844 y esta integrado en la libreria LeRobot, que gestiona tanto el entrenamiento como la inferencia.

El entrenamiento se realizo sobre el dataset `HyeonseokE/pick_place_ours_10fps`: 100 episodios, 29.269 fotogramas, 10 FPS, una sola tarea de pick-and-place. La configuracion reportada es de 22.850 pasos, tamano de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 2000, con LeRobot 0.6.0. No se especifica en la model card la composicion exacta del dataset, si hubo etapas de RLHF/DPO (no son habituales en politicas de imitacion) ni el numero total de tokens o muestras vistas mas alla de los pasos de entrenamiento.

## Capacidades

- Generacion de acciones motoras continuas de 6 grados de libertad a partir de imagenes y del estado del robot.
- Ejecucion de una tarea de pick-and-place guiada por instruccion en lenguaje natural: coger un bloque rojo y depositarlo en un plato azul.
- Percepcion visual multi-camara: acepta tres entradas de imagen de 3x256x256 (vista superior y muneca, segun la descripcion del autor).
- Control reactivo a 10 FPS, la frecuencia a la que se grabo el dataset de entrenamiento.
- Integracion nativa con el ecosistema LeRobot: ejecucion con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- Inferencia en hardware de consumo, gracias al tamano de 450 M de parametros del metodo SmolVLA.
- No dispone de tool calling, function calling, modo de razonamiento explicito, capacidades de agente multi-paso ni procesamiento de audio; no es un modelo de proposito general.
- Capacidad multilingue: no disponible (entrenado con instrucciones en ingles).

## Casos de uso

- Automatizacion de pick-and-place en laboratorio o linea piloto: con un brazo SO-101 y dos camaras (superior y de muneca) se puede desplegar la politica para mover piezas de una posicion fija a un contenedor, reproduciendo exactamente la tarea del dataset.
- Linea base de investigacion en VLA: sirve como referencia reproducible (misma semilla, mismos hiperparametros documentados) para comparar tecnicas de ajuste fino, aumento de datos o cambios en el modelo base.
- Docencia y formacion en robotica: es un ejemplo completo y ligero de flujo de aprendizaje por imitacion con LeRobot, desde la grabacion del dataset hasta el despliegue en robot real.
- Prototipado rapido en hardware de consumo: al requerir del orden de 2-3 GB de VRAM en precision reducida, permite iterar en un portatil con GPU o en un equipo de sobremesa sin acceso a clúster.
- Estudio de generalizacion y robustez: cambiando posiciones iniciales, iluminacion o introduciendo distractores se puede medir la degradacion de la tasa de exito y cuantificar la sensibilidad de la politica.
- Automatizacion de tareas de clasificacion de objetos pequenos en entornos controlados, siempre que las condiciones de camara y la posicion de las piezas se mantengan dentro del dominio del dataset.
- Plantilla para ajuste fino con datos propios: el comando `lerobot-train` con `--policy.path=lerobot/smolvla_base` permite replicar el proceso sobre nuevas tareas sin partir del modelo base cada vez.
- Pruebas de integracion hardware-software: validacion de drivers, calibracion y latencias de un montaje SO-101 antes de escalar a politicas mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la indicacion explicita "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito en robot real ni comparaciones cuantitativas con otras politicas para este ajuste concreto. Tampoco se reportan latencias ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en FP16/BF16 (450 M de parametros, unos 0,9 GB de pesos, mas activaciones de tres imagenes de 256x256 y estado); en FP32 los pesos ocuparian alrededor de 1,8 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM. Para el ajuste fino, una RTX 3090/4090 o una A100/H100 aceleran notablemente el entrenamiento frente a GPU de gama media; el modelo base de 450 M no requiere aceleradores de centro de datos.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, 4060, 4070 o superiores, e incluso en equipos Apple Silicon mediante PyTorch.
- CPU: es viable para inferencia a baja frecuencia, aunque no hay datos de latencia publicados para este ajuste.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecutar la politica en el robot y `lerobot-train` para reentrenar), sobre PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, que no aplican a una politica VLA con cabezal de acciones.
- Latencia y throughput: no disponibles. La politica se entreno con datos a 10 FPS, por lo que ese orden de frecuencia es el escenario de control esperado; el metodo SmolVLA incorpora tecnicas de inferencia asincrona en su descripcion general, pero no se aportan cifras para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este ajuste (`smolvla_pick_place_ours_2000_10fps`) | ~450 M | VLA con experto de accion (flow matching) | No disponible; 3 imagenes 256x256 + estado (6,) | apache-2.0 | Hugging Face, via LeRobot |
| SmolVLA base (`lerobot/smolvla_base`) | ~450 M | VLA con experto de accion | No disponible | apache-2.0 | Hugging Face, via LeRobot |
| OpenVLA | ~7 B | VLA basado en VLM (Prismatic) | Imagen unica + instruccion | Licencia heredada del LLM base (Llama 2), no verificada en esta busqueda | Pesos abiertos en Hugging Face |
| pi0 / pi0.5 | ~3 B (orden de magnitud) | VLA con flow matching | Multiples camaras + estado | Apache 2.0 en el repositorio openpi, no verificada en esta busqueda | Pesos abiertos en Hugging Face |

La ventaja diferencial de esta politica es el tamano: con 450 M de parametros es aproximadamente un orden de magnitud menor que OpenVLA, lo que reduce los requisitos de VRAM y facilita el despliegue en hardware de consumo. Como contrapartida, esta especializada en una unica tarea y un unico montaje de robot, mientras que los modelos comparables se presentan como politicas generalistas entrenadas sobre corpus de robotica mucho mayores. No hay datos de rendimiento publicados que permitan comparar tasas de exito entre estas opciones.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo se ha entrenado para la tarea "coger el bloque rojo y dejarlo en el plato azul". Cualquier otro objeto, instruccion o disposicion de la escena queda fuera de su dominio.
- Sin resultados de evaluacion: no se ha publicado ninguna tasa de exito en robot real, ni el numero de ensayos, por lo que se desconoce su fiabilidad efectiva.
- Dependencia del montaje: entrenado con un robot `so101_follower` y un conjunto concreto de camaras. Los nombres y las claves de observacion deben coincidir exactamente con los del entrenamiento o la politica no funcionara correctamente.
- Ambiguedad en las camaras: la model card declara dos camaras (`top`, `left_wrist`) pero la tabla de entradas lista tres claves (`observation.images.camera1/2/3`), lo que puede provocar errores de configuracion en el despliegue.
- Riesgo de sobreajuste: 100 episodios y 29.269 fotogramas son un volumen reducido; es probable que el rendimiento se degrade ante cambios de iluminacion, posicion de las piezas, fondo o tipo de objeto.
- Alucinacion de acciones: como cualquier politica de imitacion, puede generar trayectorias plausibles pero incorrectas cuando la observacion se aleja de la distribucion de entrenamiento, sin ninguna senal de incertidumbre.
- Sin validacion por la comunidad: cero descargas y cero "likes" en el momento de redactar esta ficha, por lo que no hay retroalimentacion externa sobre su funcionamiento.
- Idioma: las instrucciones de tarea del dataset estan en ingles; no se declara soporte multilingue.
- Seguridad fisica: al controlar un brazo robotico real, deben establecerse limites de par, paradas de emergencia y espacios de trabajo delimitados antes de cualquier despliegue, especialmente si se opera sin supervision.
- Licencia: Apache 2.0, lo que permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya correctamente el modelo base y LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_pick_place_ours_2000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/pick_place_ours_10fps
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/pick_place_ours_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Articulo SmolVLA: https://huggingface.co/papers/2506.01844 y https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (contenido comercial de casetas de jardin), por lo que no se han incorporado a esta ficha.
