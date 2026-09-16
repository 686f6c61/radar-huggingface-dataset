# Lemon115/smolvla_multitask

## Resumen

Lemon115/smolvla_multitask es una politica de robotica (vision-language-action) entrenada mediante aprendizaje por imitacion y publicada en HuggingFace con la libreria LeRobot. Se trata de un ajuste fino del modelo base lerobot/smolvla_base, que a su vez implementa el metodo SmolVLA descrito en el paper arXiv:2506.01844. El modelo consume observaciones multimodales (el estado del robot y dos flujos de video) y produce directamente comandos de accion de 6 dimensiones para un brazo robotico de tipo `so_follower`.

La relevancia de esta ficha es doble. Por un lado, SmolVLA esta disenado como un modelo compacto (450 millones de parametros) capaz de ejecutarse en hardware de consumo, lo que rebaja la barrera de entrada para investigacion en robotica. Por otro, este checkpoint concreto es un ejemplo de ajuste fino multitarea (dos tareas de pick-and-place) sobre 100 episodios y 116.932 fotogramas grabados a 30 FPS, lo que lo convierte en un caso de estudio util de como se adapta un VLA generalista a un setup fisico muy concreto.

Conviene senalar desde el principio que se trata de una publicacion de autor individual (Lemon115), con cero descargas y cero likes en el momento de redactar esta ficha, sin resultados de evaluacion publicados y con una ventana de contexto que no se documenta. Es, por tanto, un checkpoint experimental de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (las instrucciones del dataset estan en ingles: "Put the orange ball into the left box", "Put the wood cube into the right box") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base (ajuste fino) |
| Libreria | lerobot (version 0.6.2 durante el entrenamiento) |
| Tipo de tarea | robotics (politica de control, no generacion de texto) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Robot objetivo | `so_follower` con camaras `front` y `wrist` |
| Tamano del repositorio | 1.2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada indica que se trata de un vision-language-action model compacto y eficiente, segun la descripcion del propio autor, pero no detalla la composicion interna de la arquitectura (tipo de encoder visual, backbone de lenguaje, mecanismo de decodificacion de acciones ni uso de flow matching u otras tecnicas). Para esos detalles habria que consultar el paper referenciado, arXiv:2506.01844, cuyo contenido no forma parte de la informacion disponible en esta ficha. Lo que si consta es que el modelo es un ajuste fino de lerobot/smolvla_base y que opera como politica de imitacion: recibe estado proprioceptivo de 6 dimensiones y dos imagenes RGB de 480x640, y emite un vector de accion de 6 dimensiones.

El entrenamiento se realizo sobre el dataset Lemon115/smolvla_tasks, compuesto por 100 episodios y 116.932 fotogramas grabados a 30 FPS, con dos tareas de manipulacion: introducir la pelota naranja en la caja izquierda e introducir el cubo de madera en la caja derecha. La configuracion reportada es de 20.000 pasos de entrenamiento, batch size 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, todo ello con LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento posteriores al aprendizaje por imitacion, algo coherente con el paradigma de imitation learning de LeRobot.

## Capacidades

- Control robótico de manipulacion: genera comandos de accion de 6 grados de libertad para un brazo `so_follower` a partir de observaciones multimodales.
- Percepcion visual binocular: procesa simultaneamente una camara frontal (`front`) y una camara de muneca (`wrist`), ambas a 480x640.
- Fusion de estado y vision: integra el estado proprioceptivo del robot (6 dimensiones) con las dos senales visuales para producir la accion.
- Ejecucion multitarea: ha sido entrenado para dos tareas distintas de pick-and-place, seleccionables mediante el texto de instruccion pasado al rollout.
- Condicionamiento por lenguaje: la tarea se especifica en lenguaje natural en el comando de rollout (`--task="..."`), lo que indica cierto grado de seguimiento de instrucciones.
- Despliegue en hardware de consumo: segun la descripcion del autor, el modelo puede ejecutarse en hardware de gama de consumo.
- Integracion con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train` y con el flujo de calibracion, grabacion y entrenamiento de la libreria.
- No documentado en la informacion disponible: tool calling, function calling, razonamiento multi-paso deliberativo, modo "thinking", entrada de audio, generacion de texto general y capacidades multilingues.

## Casos de uso

- Pick-and-place de objetos esfericos: el modelo puede ejecutar la tarea "Put the orange ball into the left box" sobre un SO-101 con camara frontal y de muneca, usando `lerobot-rollout` con `--strategy.type=base` para pruebas sin grabacion.
- Clasificacion y colocacion de piezas rigidas: la segunda tarea entrenada ("Put the wood cube into the right box") permite usar la misma politica para separar objetos de geometria distinta en contenedores diferentes dentro de un mismo ciclo de trabajo.
- Base de partida para nuevos ajustes finos: dado que el checkpoint cuelga de `lerobot/smolvla_base`, se puede reutilizar como inicializacion en `lerobot-train` para ensenar tareas nuevas con pocos episodios, en lugar de partir del modelo generalista.
- Prototipado rapido en laboratorio de robotica: con 450 M de parametros y un repositorio de 1,2 GB, el ciclo completo de grabar datos, entrenar y desplegar cabe en una estacion de trabajo con una sola GPU, lo que acelera la iteracion experimental.
- Docencia y divulgacion en robotica: el flujo LeRobot (calibracion, teleoperacion, visualizacion del dataset y rollout) permite montar practicas de aprendizaje por imitacion con hardware de bajo coste y un modelo que se puede inspeccionar y reentrenar.
- Evaluacion comparativa de metodos VLA: sirve como punto de referencia para medir si variantes de arquitectura, cuantizacion o tecnicas de entrenamiento mejoran o empeoran en un banco de pruebas pequeno y reproducible (dos tareas, un robot, dos camaras fijas).
- Investigacion sobre generalizacion y sobreajuste: al disponer de solo 100 episodios y dos tareas, es un caso util para estudiar como se degrada la politica ante cambios de posicion de objetos, iluminacion o distractores, tal y como sugiere la propia plantilla de evaluacion del autor.
- Automatizacion de celdas de picking de baja variabilidad: en entornos industriales muy controlados donde la posicion y el tipo de pieza son fijos, una politica de este tamano puede cubrir la tarea sin necesidad de un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet" y deja preparada una tabla de evaluacion en robot real (tarea, ensayos, exitos, tasa de exito) que el autor no ha rellenado. Tampoco se aportan metricas de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje, ya que el modelo no es un modelo de lenguaje generalista sino una politica de control.

## Requisitos de hardware

- Peso de los parametros: 450.046.176 parametros, aproximadamente 0,9 GB en bfloat16 y 1,8 GB en float32, a partir del dato real de safetensors.
- VRAM estimada para inferencia: en torno a 2-4 GB en bfloat16 contando pesos y activaciones de dos entradas de 480x640, aunque esta cifra es una estimacion y no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM deberia ser suficiente segun la estimacion anterior; el autor afirma que el modelo esta pensado para hardware de gama de consumo, por lo que una RTX 3060, RTX 4060 o superior encajan. Para entrenamiento (20.000 pasos, batch 8) conviene una GPU con mas memoria, como una RTX 4090 o una A100/H100 si se paralelizan experimentos.
- Cabe en GPU de consumo: si, segun la descripcion del modelo y el recuento de parametros; no se especifican modelos de GPU probados.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (inferencia en robot) y `lerobot-train` (entrenamiento o ajuste fino), con `--policy.device=cuda`. El soporte de vLLM, llama.cpp, Ollama o TGI no es aplicable, ya que no se trata de un modelo de lenguaje con generacion de tokens, y no se documenta ninguna de estas rutas.
- Latencia y throughput: no disponible. El unico dato temporal es la frecuencia de captura del dataset (30 FPS), que no equivale necesariamente a la frecuencia de control en despliegue.
- Requisitos adicionales de sistema: dos camaras compatibles con OpenCV a 640x480 y 30 FPS, y un robot `so_follower` calibrado, con los nombres de camara exactamente iguales a las claves de observacion del entrenamiento (`front` y `wrist`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entradas | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lemon115/smolvla_multitask | 450 M | no disponible | Estado (6) + 2 imagenes 480x640 | Accion (6) | Apache 2.0 | Publico en HuggingFace, 0 descargas |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible en esta ficha | Publico en HuggingFace (modelo base) |
| Otras politicas VLA (pi0, RDT, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion que puede sostenerse con los datos aportados es la que existe entre este checkpoint y su modelo base `lerobot/smolvla_base`: el primero es un ajuste fino especializado en dos tareas concretas sobre un robot `so_follower`, mientras que el segundo es el modelo generalista del que parte. No se dispone de cifras de rendimiento de ninguno de los dos, por lo que no es posible afirmar cual es mejor en terminos cuantitativos.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo ha visto dos tareas, 100 episodios y un unico tipo de robot (`so_follower`). Fuera de ese setup no hay garantia de funcionamiento.
- Riesgo de sobreajuste a las condiciones de grabacion: con 100 episodios, cambios en posiciones, iluminacion, distractores o en la propia camara pueden degradar la politica de forma severa.
- Ausencia total de evaluacion: no hay tasa de exito publicada, ni numero de ensayos, ni condiciones de prueba. Cualquier uso en produccion exigiria una validacion propia.
- Sensibilidad a la configuracion: los nombres de camara deben coincidir exactamente con `front` y `wrist`, y el robot debe estar calibrado; una discrepancia en las claves de observacion impide el rollout.
- Espacio de acciones restringido: la salida es un vector de 6 dimensiones atado a la cinematica del `so_follower`; no es directamente transferible a otro brazo sin nuevo entrenamiento.
- Idiomas: no se documenta soporte multilingue. Las instrucciones del dataset estan en ingles, por lo que el condicionamiento por lenguaje en otros idiomas es una incognita.
- Contexto: la longitud de contexto no esta publicada, lo que impide planificar tareas de horizonte largo o dependientes de historial extenso.
- Alucinacion y sesgos: no se ha publicado ningun analisis de sesgos, y en el caso de una politica de control el fallo tipico no es una alucinacion textual sino una accion fisica incorrecta, con el riesgo material que eso implica. Se recomienda operar con limites de par y paradas de emergencia.
- Trazabilidad y mantenimiento: publicacion de autor individual (Lemon115), sin resultados, sin descargas y sin likes en el momento de la consulta. No hay senales de mantenimiento ni de validacion por parte de la comunidad.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero se ofrece sin garantias; conviene revisar tambien las condiciones del modelo base `lerobot/smolvla_base` y de LeRobot antes de un despliegue comercial.
- Fechas de publicacion anomalas: los metadatos indican creacion y actualizacion en septiembre de 2026, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lemon115/smolvla_multitask
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Lemon115/smolvla_tasks
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Lemon115/smolvla_tasks
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

Nota sobre la busqueda web: los resultados devueltos corresponden a paginas de un servicio de correo electronico no relacionadas con el modelo, por lo que no se han incorporado como fuentes. Todos los enlaces anteriores proceden de los metadatos de HuggingFace y de la model card del autor.
