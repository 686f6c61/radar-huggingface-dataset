# MrDuarte/smolvla-WarehousePick-v0_yolo

## Resumen

MrDuarte/smolvla-WarehousePick-v0_yolo es un ajuste fino de [SmolVLA](https://huggingface.co/papers/2506.01844), un modelo visión-lenguaje-acción (VLA) compacto orientado a robótica. Lo publica el usuario MrDuarte sobre el checkpoint base lerobot/smolvla_base y está especializado en una única tarea de manipulación en entorno de almacén: "Lift all parcels and put them in the Green Box" (recoger todos los paquetes y depositarlos en la caja verde). El modelo consume observaciones multimodales (estado de las articulaciones y tres cámaras) y produce directamente un vector de acción de 6 dimensiones, sin necesidad de un pipeline de percepción separado.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones) y un repositorio de 1,2 GB en formato safetensors. Está pensado para ejecutarse sobre un brazo robótico so101_follower con tres cámaras (innomaker, intel_rgb y front) y se entrenó con 40 episodios de demostración (29.707 fotogramas a 30 FPS, unos 16,5 minutos de datos) mediante aprendizaje por imitación con LeRobot 0.6.1.

Su relevancia práctica es doble: por un lado, demuestra el flujo completo de ajuste de un VLA pequeño sobre hardware de consumo, algo que la model card del proyecto SmolVLA destaca explícitamente; por otro, es un ejemplo reproducible de política de pick-and-place entrenada con muy pocos datos y publicada con licencia Apache 2.0, lo que facilita su reutilización como plantilla para otros almacenes o tareas de recogida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); el detalle interno de la arquitectura (backbone de visión-lenguaje, experto de acción, numero de capas) no esta disponible en la informacion proporcionada |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica; no se documenta que sea un modelo MoE |
| Longitud de contexto | No aplica / no disponible; no es un modelo de lenguaje con ventana de contexto, consume observaciones (estado de 6 dimensiones y hasta 3 imagenes) y emite acciones |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; la instruccion de tarea esta en ingles ("Lift all parcels and put them in the Green Box") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tamano del repositorio | 1,2 GB |
| Tipo de robot | so101_follower |
| Camaras | innomaker, intel_rgb, front |
| Entradas | observation.state (6,); observation.images.innomaker (3, 720, 1280); observation.images.intel_rgb (3, 424, 240); observation.images.front (3, 720, 1280) |
| Salidas | action (6,) |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | MrDuarte/WarehousePick-v0_yolo |

## Arquitectura y entrenamiento

SmolVLA se presenta en su model card como un modelo vision-language-action compacto y eficiente, con rendimiento competitivo a un coste computacional reducido y desplegable en hardware de consumo. Este repositorio concreto no documenta los detalles internos de la arquitectura (composicion del backbone, mecanismo de atencion, numero de capas o estrategia de generacion de acciones); esa informacion debe consultarse en el articulo referenciado, arXiv:2506.01844. Lo que si se detalla es la interfaz del modelo: entrada de estado de 6 dimensiones mas tres flujos de imagen (dos a 720x1280 y uno a 424x240) y salida de un vector de accion de 6 dimensiones por paso.

El entrenamiento es un ajuste fino supervisado (aprendizaje por imitacion) sobre lerobot/smolvla_base, realizado con LeRobot 0.6.1. La configuracion declarada es de 20.000 pasos, tamano de lote 28, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El conjunto de datos empleado, MrDuarte/WarehousePick-v0_yolo, contiene 40 episodios y 29.707 fotogramas capturados a 30 FPS (aproximadamente 16,5 minutos de demostraciones), todos ellos de la tarea de recoger paquetes y depositarlos en la caja verde. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento posteriores al entrenamiento por imitacion, ni innovaciones tecnicas adicionales mas alla de las propias del metodo SmolVLA.

## Capacidades

- Generacion de acciones motoras de 6 grados de libertad a partir de observaciones visuales y de estado, en el marco de una politica de control tipo extremo a extremo.
- Percepcion multimodal con tres camaras simultaneas, incluida una vista frontal y una cenital de alta resolucion (720x1280) mas una camara de menor resolucion (424x240).
- Ejecucion de instrucciones en lenguaje natural: la politica acepta la tarea "Lift all parcels and put them in the Green Box" como condicionamiento textual.
- Manipulacion de objetos del tipo pick-and-place sobre paquetes en un entorno de almacen.
- Control de un brazo robotico so101_follower mediante el comando lerobot-rollout.
- Ejecucion indefinida o acotada por duracion, con opcion de no grabar episodios durante la inferencia.
- Reentrenamiento y ajuste posterior con lerobot-train sobre el mismo pipeline.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades de audio ni modo de razonamiento explicito; son capacidades ajenas al proposito de este modelo.
- No se documentan capacidades multilingues.

## Casos de uso

- Recogida automatizada de paquetes en almacen: el modelo esta entrenado especificamente para localizar paquetes y depositarlos en una caja verde, con lo que puede integrarse directamente en una celda de picking con un brazo so101_follower y las tres camaras documentadas.
- Clasificacion por destino en lineas de paqueteria: modificando el conjunto de datos de destino y reajustando desde lerobot/smolvla_base, la misma receta sirve para separar bultos por color o por zona de descarga.
- Prototipado rapido de politicas en laboratorio: con 40 episodios y unos 16,5 minutos de datos es posible validar una tarea de manipulacion completa antes de invertir en un dataset mayor.
- Investigacion en aprendizaje por imitacion: sirve como linea base reproducible de un VLA de 450 M de parametros con hiperparametros y version de libreria documentados (AdamW, lr 0,0001, 20.000 pasos, LeRobot 0.6.1).
- Despliegue en hardware de consumo: al tratarse de un modelo de 450 M de parametros, es candidato para estaciones de trabajo con GPU de gama media en lugar de servidores con aceleradores de datacenter.
- Generacion de datos sinteticos o aumento de dataset: ejecutando la politica con --strategy.type=base y grabando episodios, se pueden recolectar trayectorias adicionales para reentrenar.
- Formacion y docencia en robotica: el flujo lerobot-rollout / lerobot-train permite demostrar el ciclo completo de entrenamiento y evaluacion en un robot real de bajo coste.
- Evaluacion comparativa de tecnicas de imitation learning: la configuracion cerrada (dataset, semilla y pasos fijos) facilita reproducir experimentos controlados sobre el mismo punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de exito ni comparaciones numericas verificables.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,9 GB en bf16/fp16 y 1,8 GB en fp32, calculado a partir de los 450.046.176 parametros. El repositorio completo ocupa 1,2 GB.
- La VRAM real necesaria es superior a la de los pesos, porque hay que sumar activaciones y el procesamiento simultaneo de tres flujos de imagen (dos a 720x1280 y uno a 424x240). No se proporciona una cifra oficial de memoria en la informacion disponible.
- GPU recomendadas: no se especifican modelos concretos. La model card del metodo SmolVLA afirma que puede desplegarse en hardware de consumo, lo que excluye la necesidad de aceleradores de datacenter.
- Cabe en GPU de consumo: si, segun la afirmacion generica del proyecto SmolVLA sobre despliegue en hardware de gama de consumo; no se detalla que modelos exactos de GPU.
- Opciones de despliegue: LeRobot mediante el comando lerobot-rollout con PyTorch y CUDA (--policy.device=cuda en entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de acciones roboticas.
- Latencia y throughput: no disponibles. El unico dato temporal es la frecuencia de captura del dataset de entrenamiento, 30 FPS, que no equivale a la latencia de inferencia en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MrDuarte/smolvla-WarehousePick-v0_yolo | 450.046.176 | No aplica (observaciones) | Sin evaluacion publicada | Apache 2.0 | HuggingFace, 0 descargas |
| lerobot/smolvla_base | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otros modelos VLA de tamano similar | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento, parametros o contexto de alternativas que permitan una comparacion cuantitativa fiable. La unica comparacion documentada es la relacion de dependencia con el modelo base lerobot/smolvla_base, del que este repositorio es un ajuste fino.

## Limitaciones y advertencias

- Politica de tarea unica: esta entrenada exclusivamente para "Lift all parcels and put them in the Green Box" sobre un robot so101_follower; no es un modelo de proposito general.
- Dataset muy reducido: 40 episodios y 29.707 fotogramas (unos 16,5 minutos) implican una cobertura limitada de posiciones de objetos, iluminacion, distractores y variaciones del entorno. Es probable que la generalizacion fuera de la distribucion de entrenamiento sea fragil.
- Sin evaluacion publicada: no existe ninguna tasa de exito medida, ni en simulacion ni en robot real, por lo que el rendimiento real es desconocido.
- Dependencia estricta del hardware: las camaras deben llamarse y configurarse con las claves de observacion empleadas en el entrenamiento (innomaker, intel_rgb, front); cambiar nombres, resoluciones o indices de camara invalida la politica.
- Riesgo de sobreajuste al entorno de grabacion: cambios de iluminacion, fondo, tipo de paquete o posicion de la caja pueden degradar el comportamiento sin aviso.
- Sin garantias de seguridad fisica: es una politica de aprendizaje por imitacion sin capa de seguridad documentada; su uso en un robot real requiere limites de par, paradas de emergencia y supervision humana.
- Idiomas y capacidades linguisticas no documentados: no hay informacion sobre el soporte multilingue del componente de lenguaje, y la unica instruccion conocida esta en ingles.
- Sesgos: no se documentan sesgos especificos, pero al derivarse de demostraciones humanas puede heredar los sesgos de posicionamiento, velocidad y estilo de manipulacion de quien grabo los datos.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un ajuste fino conviene verificar tambien las condiciones del modelo base lerobot/smolvla_base y del dataset MrDuarte/WarehousePick-v0_yolo.
- Adopcion practica: el repositorio registra 0 descargas y 0 "likes", por lo que no existe evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrDuarte/smolvla-WarehousePick-v0_yolo
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/MrDuarte/WarehousePick-v0_yolo
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrDuarte/WarehousePick-v0_yolo
- Articulo de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
