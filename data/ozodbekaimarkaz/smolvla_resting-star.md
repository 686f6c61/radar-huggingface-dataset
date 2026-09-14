# OzodbekAImarkaz/smolvla_resting-star

## Resumen

smolvla_resting-star es un modelo de vision-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario OzodbekAImarkaz y afinado a partir del modelo base lerobot/smolvla_base. No es un modelo de lenguaje conversacional: se trata de una política de imitación que recibe el estado del robot y varias imágenes de cámaras, y devuelve un vector de acción de 6 dimensiones para controlar un brazo robótico de tipo so_follower. El modelo tiene 450.046.176 parámetros (aproximadamente 0,45 mil millones) y ocupa 0,9 GB en el repositorio, lo que lo sitúa en la gama de modelos compactos capaces de ejecutarse en hardware de consumo.

La política está especializada en una única tarea: "Pick up the star toy and place it on its resting place". Para ello se entrenó con el dataset OzodbekAImarkaz/resting-star_20260906_134338, compuesto por 50 episodios y 16.768 fotogramas grabados a 30 FPS. La relevancia de este tipo de publicación es doble: por un lado demuestra el flujo de trabajo completo de LeRobot (grabación de datos, entrenamiento y despliegue) sobre un brazo SO-100/SO-101; por otro, sirve como plantilla reproducible para quien quiera afinar SmolVLA en sus propias tareas de manipulación.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato safetensors y librería lerobot. Es importante señalar que, en el momento de redactar esta ficha, el repositorio acumula 0 descargas y 0 likes, y que el autor no ha publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo en la tarea no está verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA (referencia arXiv:2506.01844); no se detalla la topologia interna en la model card |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible; al ser una politica VLA consume un conjunto fijo de tokens de observacion por paso, no una ventana de contexto de texto |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors en precision completa) |
| Idiomas soportados | no disponible (no se especifican idiomas; la salida del modelo son acciones, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tipo de robot | so_follower |
| Camaras | overhead (segun la model card) |
| Tarea entrenada | "Pick up the star toy and place it on its resting place" |
| Tamano del repositorio | 0,9 GB |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | OzodbekAImarkaz/resting-star_20260906_134338 (50 episodios, 16.768 fotogramas, 30 FPS) |
| Entradas | observation.state (6,); observation.images.camera1, camera2, camera3 (3, 256, 256); observation.images.empty_camera_0 y empty_camera_1 (3, 480, 640) |
| Salidas | action (6,) |
| Fecha de publicacion | 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA es, segun el articulo referenciado en la model card (arXiv:2506.01844), un modelo compacto de vision-lenguaje-acción que busca rendimiento competitivo en manipulación robótica con un coste computacional reducido, hasta el punto de poder desplegarse en hardware de consumo. La model card de este repositorio concreto no detalla la topología interna, los mecanismos de atención ni la composición exacta del dataset de preentrenamiento del modelo base; esa información debe consultarse en el articulo original y en la ficha de lerobot/smolvla_base. Lo que sí se especifica aquí es la interfaz de la política: un vector de estado de 6 dimensiones, cinco flujos de imagen (tres a 256x256 y dos a 480x640, dos de ellos etiquetados como "empty_camera", lo que sugiere entradas de cámara vacías o no utilizadas durante la grabación) y una salida de acción de 6 grados de libertad.

El ajuste fino se realizó mediante el flujo de entrenamiento de LeRobot 0.6.2 durante 20.000 pasos, con tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. Los datos provienen de 50 episodios de demostración teleoperada sobre la tarea de recoger un juguete con forma de estrella y colocarlo en su sitio, con 16.768 fotogramas a 30 FPS. No se documenta el uso de RLHF, DPO ni ninguna otra fase de alineación, algo coherente con un modelo de imitación cuyo objetivo es reproducir la distribución de acciones de las demostraciones. Tampoco se indica si se aplicaron aumentos de datos, currículos de entrenamiento o técnicas de regularización más allá de los hiperparámetros listados.

## Capacidades

- Generacion de acciones de control: produce un vector action de 6 componentes a partir del estado del robot y de las imagenes de camara, apto para control de un brazo so_follower.
- Manipulacion pick-and-place: entrenado especificamente para recoger un juguete en forma de estrella y depositarlo en su lugar de descanso.
- Percepcion visual multicamara: consume hasta cinco flujos de imagen simultaneos (tres a 256x256 y dos a 480x640) junto con el estado proprioceptivo.
- Politica de imitacion de tarea unica: reproduce el comportamiento aprendido de 50 episodios de demostracion; no generaliza a otras tareas sin reentrenamiento.
- Integracion con el ecosistema LeRobot: se ejecuta mediante el comando lerobot-rollout y puede reentrenarse con lerobot-train.
- Generacion de texto: no soportada como capacidad de salida; el modelo es una politica, no un modelo de lenguaje.
- Tool calling o function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado en el sentido de planificacion simbolica; la secuencia de acciones se genera paso a paso durante la ejecucion.
- Capacidades multilingues: no aplicables (no hay entrada ni salida de texto).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio: solo vision como entrada; audio no soportado.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo ejecuta la secuencia completa de recogida y colocacion de un objeto concreto sobre un brazo SO-100/SO-101, lo que permite montar una celda de manipulacion reproducible sin programar trayectorias a mano.
- Plantilla para afinado de SmolVLA: sirve como referencia end-to-end de como pasar de 50 episodios teleoperados a una politica desplegable, incluyendo los hiperparametros y comandos exactos de LeRobot.
- Docencia e investigacion en aprendizaje por imitacion: al ser un modelo de 0,45 mil millones de parametros con licencia Apache 2.0, es adecuado para cursos y proyectos academicos donde se compara el efecto del numero de episodios o de la configuracion de camaras.
- Validacion de pipelines de captura de datos: la presencia de dos entradas "empty_camera" en la definicion de observaciones permite estudiar como afecta al entrenamiento incluir flujos de camara sin informacion util.
- Pruebas de despliegue en hardware de consumo: el tamano reducido permite medir latencias de inferencia en GPUs de gama media o en CPU y comparar el comportamiento del bucle de control a 30 FPS.
- Base para transferencia a una tarea similar: dado que la tarea es acotada, el modelo puede servir como punto de partida para un segundo ajuste fino sobre objetos o posiciones parecidas, reduciendo el numero de episodios necesarios.
- Evaluacion comparativa de politicas VLA: permite contrastar SmolVLA afinado frente a politicas clasicas (ACT, diffusion policy) en la misma tarea y con el mismo conjunto de camaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la nota explicita "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito en robot real, numero de ensayos ni condiciones de prueba. Tampoco se proporcionan metricas de perdida de entrenamiento, curvas de aprendizaje ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en precision completa (safetensors) ocupan 0,9 GB, por lo que en FP32 se necesitan del orden de 2-3 GB de VRAM contando activaciones de las cinco imagenes de entrada; en BF16/FP16 el peso se reduce a unos 0,45-0,9 GB. No se publican pesos cuantizados, de modo que no hay cifras medidas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente para la inferencia; una RTX 3060, RTX 4060 o superior no deberia presentar problemas, y tarjetas de gama alta (RTX 4090, A100, H100) quedan sobradamente dimensionadas.
- Cabe en GPU de consumo: si. El articulo base de SmolVLA se presenta explicitamente como desplegable en hardware de consumo, y el tamano de 450 millones de parametros es coherente con esa afirmacion.
- Ejecucion en CPU: viable en principio por el tamano del modelo, aunque no hay datos de latencia publicados para este repositorio concreto.
- Opciones de despliegue: LeRobot (comando lerobot-rollout) sobre PyTorch; el modelo no es compatible con servidores de inferencia de texto como vLLM, TGI o llama.cpp, ya que su salida son acciones de robot y no tokens.
- Latencia y throughput estimados: no disponibles. Como referencia del sistema de captura, los datos se grabaron a 30 FPS, lo que implica un presupuesto teorico de 33 ms por paso de control, pero no se ha medido el tiempo de inferencia real de esta politica.
- Almacenamiento: el repositorio ocupa 0,9 GB, mas el espacio necesario para el dataset de 16.768 fotogramas si se quiere reentrenar.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Contexto / observaciones | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_resting-star (este modelo) | 450.046.176 | VLA afinado para tarea unica | apache-2.0 | Entrada de 5 imagenes + estado de 6 dim; salida de accion de 6 dim | HuggingFace, 0 descargas |
| lerobot/smolvla_base | no disponible en esta busqueda | VLA base preentrenado | no disponible en esta busqueda | Modelo del que deriva este ajuste | HuggingFace |
| OpenVLA (referencia de la literatura) | aproximadamente 7.000 millones | VLA | MIT (segun su ficha publica) | Modelo de mayor tamano, requiere mas VRAM | HuggingFace |
| pi0 (Physical Intelligence) | aproximadamente 3.300 millones | VLA con flow matching | Apache 2.0 (segun su ficha publica) | Mayor capacidad, mayor coste de computo | HuggingFace |

Nota: los datos de OpenVLA y pi0 provienen de sus fichas y publicaciones publicas, no de la informacion proporcionada en esta busqueda, y no se han verificado de forma independiente para esta ficha. No se dispone de comparaciones de rendimiento en la misma tarea porque este modelo no publica resultados de evaluacion.

## Limitaciones y advertencias

- Tarea unica: la politica solo ha sido entrenada para "Pick up the star toy and place it on its resting place"; no se espera que generalice a otros objetos, posiciones o instrucciones.
- Sin evaluacion publicada: no existen tasas de exito ni pruebas en robot real, por lo que se desconoce si la politica funciona de forma fiable.
- Riesgo de sobreajuste al entorno de grabacion: con 50 episodios y 16.768 fotogramas, el modelo puede depender de la iluminacion, la posicion de las camaras y la disposicion exacta del banco de trabajo.
- Entradas de camara vacias: dos de los cinco flujos de imagen estan etiquetados como "empty_camera", lo que puede introducir ruido o redundancia en la representacion si no se gestiona correctamente.
- Dependencia del hardware: las observaciones esperadas incluyen tres camaras a 256x256 y dos a 480x640; usar un numero o una resolucion distinta de camaras puede degradar el comportamiento.
- Sin soporte de lenguaje: al no aceptar instrucciones en texto, no puede reutilizarse como asistente conversacional ni como modelo de proposito general.
- Sesgos: no hay informacion sobre sesgos en la model card, pero al tratarse de una politica de imitacion hereda los sesgos de las demostraciones humanas y del entorno de recogida de datos.
- Alucinacion: en el sentido de acciones incorrectas o inseguras, es un riesgo inherente a las politicas de imitacion; no debe operarse sin supervisión ni limites de par de motores en entornos con personas.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya correctamente; conviene verificar tambien las condiciones del modelo base lerobot/smolvla_base.
- Madurez: el repositorio tiene 0 descargas y 0 likes y fue publicado el 2026-09-14, por lo que no existe una comunidad que haya validado su funcionamiento.
- Idiomas: no aplicable, pero conviene recordar que la model card esta en ingles y que la documentacion de referencia esta mayoritariamente en ese idioma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OzodbekAImarkaz/smolvla_resting-star
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/OzodbekAImarkaz/resting-star_20260906_134338
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=OzodbekAImarkaz/resting-star_20260906_134338
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Imagen de la arquitectura: https://cdn-uploads.huggingface.co/production/uploads/640e21ef3c82bd463ee5a76d/aooU0a3DMtYmy_1IWMaIM.png

Nota sobre la busqueda web: los resultados devueltos corresponden a paginas de Google Meet y no guardan relacion con el modelo, por lo que no se han utilizado como fuente.
