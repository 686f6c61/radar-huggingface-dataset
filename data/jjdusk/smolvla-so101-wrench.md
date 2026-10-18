# JJDUSK/smolvla-so101-wrench

## Resumen

`JJDUSK/smolvla-so101-wrench` es un ajuste fino de SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del proyecto LeRobot. El modelo parte del checkpoint base `lerobot/smolvla_base` (450 millones de parámetros) y se ha especializado mediante aprendizaje por imitación en una única tarea robótica: recoger una llave inglesa con un brazo SO-101 de bajo coste.

El problema que resuelve es acotado pero representativo: traducir dos flujos de vídeo (cámara frontal y cámara en la muñeca) más el estado articular del robot en una secuencia de acciones de 6 dimensiones, a partir de una instrucción en lenguaje natural. Frente a políticas de imitación clásicas, un VLA permite condicionar el comportamiento con texto y reutilizar un backbone de visión-lenguaje preentrenado, lo que reduce los datos necesarios para especializar la política.

Es relevante ahora por dos motivos: primero, porque SmolVLA está diseñado explícitamente para ejecutarse en hardware de consumidor, lo que baja la barrera de entrada a la investigación en robótica; segundo, porque este repositorio ejemplifica el flujo completo de LeRobot (grabación de dataset, entrenamiento y despliegue) con un dataset pequeño y público de 80 episodios y 26.381 fotogramas a 30 FPS. Conviene señalar que el autor no ha publicado ninguna evaluación real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacta de SmolVLA; detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (segun safetensors) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible (modelo de politica robotica, no de texto generativo) |
| Tipos de cuantizacion | no disponible; el repo solo distribuye safetensors sin versiones cuantizadas publicadas |
| Idiomas soportados | no disponible; la instruccion de tarea entrenada es "pickup the wrench" (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Otros datos tecnicos: tamano del repositorio 1,2 GB; pipeline `robotics`; tipo de robot `so_follower`; camaras `front` y `wrist`; entrada `observation.state` con forma `(6,)`; entradas visuales `(3, 480, 640)` por camara; salida `action` con forma `(6,)`.

## Arquitectura y entrenamiento

SmolVLA es una politica VLA que combina un backbone de vision-lenguaje preentrenado con un experto de acciones que genera trayectorias continuas de control. El modelo procesa dos imagenes RGB de 480x640 junto con el vector de estado articular de 6 dimensiones, y emite un vector de accion tambien de 6 dimensiones por paso de control. El articulo de referencia es arXiv 2506.01844. Los detalles exactos de capas, mecanismo de atencion y esquema de generacion de acciones no se recogen en la model card y no se han verificado aqui.

El entrenamiento de este checkpoint es un ajuste fino supervisado por imitacion sobre el dataset `JJDUSK/so101_wrench`: 80 episodios, 26.381 fotogramas a 30 FPS, una sola tarea ("pickup the wrench"). La configuracion fue de 20.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000, ejecutado con LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni refuerzo; es imitacion pura sobre demonstraciones de teleoperacion. Tampoco se especifica la composicion del corpus de preentrenamiento del modelo base.

## Capacidades

- Control visomotor para manipulacion: genera acciones de 6 grados de libertad a partir de dos vistas de camara y del estado articular.
- Ejecucion condicionada por instruccion en lenguaje natural, aunque en este checkpoint la unica instruccion entrenada es "pickup the wrench".
- Fusion de informacion de camara frontal y camara en la muneca, lo que aporta precision en el agarre.
- Politica de imitacion end-to-end entrenada con LeRobot, ejecutable con `lerobot-rollout`.
- Punto de partida reutilizable: la CLI de LeRobot permite reajustar este u otro dataset partiendo de `lerobot/smolvla_base`.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes de texto: no es un modelo de lenguaje conversacional.
- No dispone de modo "thinking", vision para descripcion de imagenes ni procesamiento de audio.
- Capacidades multilingues: no disponibles; no se ha entrenado con instrucciones en otros idiomas.

## Casos de uso

- Recogida automatizada de una llave inglesa en una celda SO-101: es la tarea exacta para la que se entreno. Se lanzaria con `lerobot-rollout --policy.path=JJDUSK/smolvla-so101-wrench --task="pickup the wrench"` y dos camaras OpenCV a 640x480 y 30 FPS.
- Base de transferencia para nuevas tareas de manipulacion: al estar ajustado sobre un robot SO-101 real, sirve como inicializacion para reentrenar con `lerobot-train` sobre un dataset propio de la misma morfologia, reduciendo el numero de demostraciones necesarias frente a partir de cero.
- Docencia y laboratorios de aprendizaje por imitacion: el modelo, de 450 M de parametros y 1,2 GB de pesos, se puede ejecutar en un portatil con GPU de consumo, lo que permite montar practicas completas de grabacion, entrenamiento y despliegue en una sesion.
- Pruebas de robustez controladas: util como sujeto de experimentos de sensibilidad a cambios de iluminacion, posicion del objeto o presencia de distractores, comparando tasas de exito antes y despues de cada perturbacion.
- Baseline en investigacion de VLA: referencia reproducible (semilla y configuracion documentadas) para comparar variantes de arquitectura o de estrategia de aumento de datos en tareas de picking.
- Validacion de pipelines de datos en LeRobot: con 80 episodios y 26.381 fotogramas, es un caso de prueba asequible para verificar el formateo de observaciones, los nombres de camaras y las claves de estado antes de escalar a datasets mayores.
- Automatizacion de bajo volumen en linea de montaje: en escenarios donde la pieza y la posicion son fijas, la politica puede sustituir a un operario en el gesto de recogida, siempre con supervisión y parada de emergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con el texto literal "No evaluation results have been provided for this policy yet", por lo que no existe tasa de exito medida en robot real ni numero de ensayos. Tampoco se aportan cifras del articulo de SmolVLA aplicadas a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB para los pesos en bf16/fp16 (450 M de parametros) y del orden de 2-4 GB en total contando activaciones de las dos imagenes de 480x640. Estimacion propia, no publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento con batch 32 conviene una RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, es uno de los objetivos de diseno de SmolVLA. Tambien es viable en CPU para inferencia, con latencia mayor.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) como via documentada; el resto del stack es PyTorch estandar. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que no aplican a una politica robotica de este tipo.
- Latencia y throughput: no disponibles. El bucle de control opera a 30 FPS en la grabacion del dataset, pero no se publica la latencia de inferencia por paso ni el tiempo de entrenamiento de los 20.000 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JJDUSK/smolvla-so101-wrench` | 450 M | Recoger llave inglesa con SO-101 | no aplica | apache-2.0 | HuggingFace, 0 descargas |
| `lerobot/smolvla_base` | 450 M (modelo base) | VLA generalista, ajustable por imitacion | no aplica | no disponible en la informacion proporcionada | HuggingFace, mantenido por LeRobot |
| Politicas ACT de LeRobot | no disponible | Imitacion visomotora con transformer ligero | no aplica | no disponible | Implementadas en LeRobot, sin checkpoint concreto identificado |
| pi0 / pi0.5 (Physical Intelligence) | no disponible en la informacion proporcionada | VLA generalista de manipulacion | no aplica | no disponible | Publicadas por Physical Intelligence |

La comparacion cuantitativa de rendimiento no es posible: ninguno de los modelos alternativos tiene cifras verificables en la informacion disponible, y este checkpoint carece de evaluacion propia. La diferencia practica mas clara es de alcance: el modelo base es generalista y este ajuste esta especializado en una unica tarea con una unica instruccion.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de exito medida, ni numero de ensayos, ni condiciones de prueba. No se puede afirmar que el modelo funcione de forma fiable.
- Dataset muy pequeno: 80 episodios y una sola tarea implican un riesgo alto de sobreajuste al entorno, posiciones de objeto, iluminacion y configuracion fisica exactos de la grabacion.
- Generalizacion linguistica nula: solo se entreno con la instruccion "pickup the wrench"; cualquier otra frase puede degradar el comportamiento sin aviso.
- Dependencia estricta de la configuracion de sensores: las claves de observacion deben llamarse `front` y `wrist`, con imagenes de 480x640 y estado de 6 dimensiones. Cambiar nombres, resolucion o numero de camaras rompe la politica.
- Sensibilidad al cambio de robot: aunque sea del mismo tipo SO-101, variaciones de calibracion, herramientas o montaje pueden invalidar la politica.
- Riesgo de fallo fisico: un VLA sin evaluacion puede generar acciones incorrectas sobre hardware real; es obligatorio usar paradas de emergencia, limites de par y supervision humana.
- Sesgos: no documentados por el autor; al derivarse de un unico operador y entorno, hereda sus sesgos de posicionamiento y estilo de manipulacion.
- Alucinacion en sentido textual no aplica, pero si el equivalente conductual: la politica puede generar trayectorias plausibles pero incorrectas sin senal de incertidumbre.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero no exime del cumplimiento de normativa de seguridad de maquinaria ni de la responsabilidad sobre el despliegue.
- Sin garantias de mantenimiento: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia; no hay historial de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JJDUSK/smolvla-so101-wrench
- Dataset de entrenamiento: https://huggingface.co/datasets/JJDUSK/so101_wrench
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844
- Articulo en arXiv: https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JJDUSK/so101_wrench
