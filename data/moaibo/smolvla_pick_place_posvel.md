# MoAIBo/smolvla_pick_place_posvel

## Resumen

MoAIBo/smolvla_pick_place_posvel es una politica robotica de vision-lenguaje-accion (VLA) publicada en Hugging Face por el usuario MoAIBo. Se trata de un ajuste fino del modelo base lerobot/smolvla_base, la variante compacta de SmolVLA descrita en el paper arXiv:2506.01844, que busca un rendimiento competitivo en tareas de manipulacion con un coste computacional reducido y capacidad de desplegarse en hardware de consumo. El modelo tiene 450.046.176 parametros (unos 450 M) y un repositorio de 0,9 GB en formato safetensors, bajo licencia Apache 2.0.

La politica esta especializada en una celula robotica concreta: un robot de tipo `so101_tb4` equipado con cinco camaras (`camera_left`, `camera_right`, `camera_wrist`, `camera_d455` y `depth`). Aprende dos tareas de recogida y colocacion: desacoplar, coger un objeto azul (o amarillo) de una caja marron, depositarlo en un plato blanco y volver a la base. La entrada combina el estado del robot (11 dimensiones) con cinco imagenes de 3x360x640, y la salida es un vector de accion de 8 dimensiones.

Es relevante como ejemplo completo del flujo de LeRobot 0.6.0 para ajustar un VLA pequeno sobre un dataset propio de 96 episodios y 128.543 fotogramas grabados a 30 FPS, con un modelo final que cabe en una GPU de gama de consumo. Conviene senalar que el repositorio no incluye resultados de evaluacion en robot real ni acumulaba descargas o "me gusta" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en un backbone de vision-lenguaje compacto y un experto de accion; ajustada desde lerobot/smolvla_base (SmolVLA) |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card; es una politica de accion, no un modelo de lenguaje de proposito general) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el repositorio pesa 0,9 GB en safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset estan redactadas en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (LeRobot 0.6.0) |
| Tipo de robot | `so101_tb4` |
| Camaras de entrada | `camera_left`, `camera_right`, `camera_wrist`, `camera_d455`, `depth` |
| Frecuencia de datos de entrenamiento | 30 FPS |
| Descargas / "me gusta" | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA es una politica de vision-lenguaje-accion compacta que combina un modelo de vision-lenguaje (VLM) preentrenado con un experto de accion entrenado sobre representaciones del VLM. La model card de este repositorio no detalla la composicion interna de capas ni el numero de tokens de preentrenamiento del modelo base, por lo que esos datos se consideran no disponibles. Lo que si se especifica es la interfaz: la politica consume `observation.state` con forma `(11,)` mas cinco flujos visuales de forma `(3, 360, 640)` y produce `action` con forma `(8,)`.

El ajuste fino se realizo con LeRobot 0.6.0 partiendo de lerobot/smolvla_base. La configuracion de entrenamiento declarada es: 50.000 pasos, tamano de lote 13, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000. El dataset de entrenamiento es MoAIBo/merged_so101_tb4_pick_place_depth_posvel, con 96 episodios, 128.543 fotogramas a 30 FPS y dos tareas de pick-and-place. No se documenta en el repositorio el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; tampoco se detalla la composicion exacta del dataset mas alla de las dos tareas descritas.

## Capacidades

- Generacion de acciones motoras continuas: emite un vector de accion de 8 dimensiones (el desglose por articulacion no se especifica en la model card) a partir de observaciones del robot.
- Percepcion multimodal: procesa simultaneamente cuatro camaras RGB y una senal de profundidad, ademas del estado proprioceptivo del robot.
- Ejecucion condicionada por instruccion en lenguaje natural: acepta una descripcion de tarea (por ejemplo, "Undock, pick up the blue object from the brown box, place it on the white plate, and return to the dock.").
- Tareas de pick-and-place con retorno autonomo a la base: coger un objeto azul o amarillo de una caja marron y colocarlo en un plato blanco.
- Politica de imitacion entrenada de extremo a extremo: no requiere planificacion simbolica ni modelado explicito del entorno.
- Ejecucion continua: el script de despliegue permite ejecutar la politica durante un numero de segundos determinado o de forma indefinida.
- No soporta tool calling ni function calling: es una politica robotica, no un modelo de lenguaje con interfaz de herramientas.
- No soporta razonamiento multi-paso en lenguaje, generacion de texto libre, codigo, matematicas ni modo "thinking".
- Capacidades multilingues: no disponible.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: la politica cubre el ciclo completo de desacoplar, coger un objeto de una caja, depositarlo en un plato y volver a la base, por lo que puede usarse como demostracion funcional de una celula de manipulacion con un SO-101.
- Manipulacion con multiples camaras y profundidad: al integrar cuatro vistas RGB mas un canal de profundidad, es adecuado para experimentos de agarre donde la oclusion parcial exige informacion espacial adicional.
- Base para investigacion en imitation learning: sirve como punto de partida para estudiar el efecto del numero de episodios, la composicion del dataset o la inclusion de profundidad en el exito de una politica VLA.
- Ajuste fino con datos propios: el flujo `lerobot-train` con `--policy.path=lerobot/smolvla_base` permite reentrenar la politica para nuevas tareas con requisitos de hardware moderados.
- Evaluacion comparativa de politicas: al ser un modelo pequeno y reproducible (semilla 1000, 50.000 pasos documentados), es util como linea base en estudios que comparen VLA pequenos frente a modelos de mayor tamano.
- Prototipado y docencia con LeRobot: el repositorio documenta los comandos de instalacion, calibracion y despliegue, lo que facilita su uso en cursos y talleres de robotica de imitacion.
- Pruebas de integracion de hardware: el comando `lerobot-rollout` con `--strategy.type=base` permite validar el cableado, el puerto del robot y el mapeo de camaras antes de invertir tiempo en recoger datos nuevos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone, por tanto, de tasas de exito por tarea, numero de ensayos ni condiciones de evaluacion (posiciones de objeto, iluminacion, distractores o cambios de robot).

## Requisitos de hardware

Las cifras de VRAM para inferencia son estimaciones derivadas del numero de parametros; el autor no las publica.

- Pesos en precision de 32 bits: aproximadamente 1,8 GB; el repositorio ocupa 0,9 GB, lo que sugiere pesos almacenados en 16 bits (unos 0,9 GB).
- VRAM estimada para inferencia en 16 bits: del orden de 2 a 4 GB solo para pesos y estado, mas el coste de activaciones de cinco flujos de imagen de 360x640; una estimacion prudente se situa en 4-6 GB.
- GPU de consumo compatibles: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090); tambien plataformas embebidas tipo Jetson Orin, coherentes con el objetivo de SmolVLA de desplegarse en hardware asequible.
- GPU de datacenter: A100 o H100 no son necesarias para inferencia, pero si recomendables para reentrenar. Con un lote de 13 y cinco imagenes de 360x640 por muestra, el ajuste fino requiere bastante memoria de activaciones; como estimacion orientativa, 24 GB podrian ser el minimo practico y 40-80 GB la opcion comoda. Este dato no esta confirmado por el autor.
- Opciones de despliegue documentadas: LeRobot 0.6.0 mediante los comandos `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento), con `--policy.device=cuda`.
- No se documenta soporte para vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni formatos GGUF o AWQ/GPTQ.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabo a 30 FPS, pero no se publican cifras de frecuencia de inferencia ni de tiempo por accion.

## Comparativa con modelos similares

Los datos de modelos de terceros proceden de informacion publica externa y no han podido verificarse con la busqueda realizada; se marcan como tales.

| Modelo | Parametros | Ambito | Licencia | Disponibilidad |
|---|---|---|---|---|
| MoAIBo/smolvla_pick_place_posvel | 450 M | 2 tareas de pick-and-place sobre `so101_tb4` | Apache 2.0 | Hugging Face; 0 descargas, 0 "me gusta" |
| lerobot/smolvla_base | 450 M (no confirmado en la informacion disponible) | Politica VLA preentrenada generica | no disponible | Hugging Face; es el modelo base de este ajuste |
| OpenVLA-7B | 7 B (dato externo, no verificado) | Manipulacion generalista con VLM de 7 B | no disponible | Hugging Face |
| pi0 (Physical Intelligence) | 3,3 B (dato externo, no verificado) | Manipulacion generalista con flow matching | no disponible | Hugging Face y repositorio del proyecto |

## Limitaciones y advertencias

- Alcance muy reducido: la politica esta entrenada unicamente para dos tareas concretas (objeto azul y objeto amarillo) y no generaliza a instrucciones fuera de ese vocabulario.
- Sin validacion publicada: no hay resultados de evaluacion en robot real, ni numero de ensayos ni tasas de exito, por lo que el rendimiento efectivo es desconocido.
- Dataset pequeno: 96 episodios y 128.543 fotogramas constituyen un volumen limitado, con riesgo alto de sobreajuste a posiciones, iluminacion y disposicion concretas de la celula.
- Dependencia estricta de la configuracion de hardware: los nombres de las camaras deben coincidir exactamente con las claves de observacion del entrenamiento y el robot debe ser del tipo `so101_tb4`; cualquier cambio de camara, montaje o calibracion degrada el comportamiento.
- Discrepancia de resolucion: la model card declara entradas de 3x360x640, mientras que el ejemplo de despliegue usa camaras de 640x480 a 30 FPS. Conviene verificar la configuracion real antes de desplegar.
- Sin cuantizaciones publicadas: no hay variantes GGUF, AWQ, GPTQ ni INT8, lo que limita el despliegue en hardware muy restringido y descarta runtimes como llama.cpp u Ollama.
- Idiomas: no disponible. Las instrucciones de tarea estan en ingles; no hay evidencia de soporte multilingue.
- Riesgo de fallo fisico: aunque no aplica el concepto de alucinacion textual, una accion incorrecta puede provocar colisiones, caidas de objetos o danos en el robot. Es obligatorio operar con parada de emergencia, limites de par y espacio de trabajo despejado.
- Licencia Apache 2.0: permite uso comercial del ajuste, pero conviene revisar los terminos del modelo base lerobot/smolvla_base y de las dependencias de LeRobot.
- Escasa traccion: el repositorio no tenia descargas ni "me gusta" en el momento de redactar la ficha, por lo que no existe validacion por parte de la comunidad.
- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgo ni de equidad en el reparto de tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MoAIBo/smolvla_pick_place_posvel
- Dataset de entrenamiento: https://huggingface.co/datasets/MoAIBo/merged_so101_tb4_pick_place_depth_posvel
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MoAIBo/merged_so101_tb4_pick_place_depth_posvel
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference

Nota: los resultados de la busqueda web realizada no guardan ninguna relacion con este modelo ni con robotica, por lo que no se han incluido como fuentes.
