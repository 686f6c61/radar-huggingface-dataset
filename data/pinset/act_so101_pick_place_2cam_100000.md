# Pinset/act_so101_pick_place_2cam_100000

## Resumen

`Pinset/act_so101_pick_place_2cam_100000` es una política de aprendizaje por imitación entrenada con el método ACT (Action Chunking with Transformers) sobre un brazo robótico de bajo coste SO-101 (variante `so_follower`). No es un modelo de lenguaje: su entrada son el estado de las articulaciones (`observation.state`, vector de 6 dimensiones) y dos flujos de imagen de 480×640 procedentes de las cámaras `hand` y `top`, y su salida es un vector de acción de 6 dimensiones (articulaciones más pinza). Resuelve una tarea concreta: "Pick up the blue block and put it in the green square".

El modelo lo publica el usuario Pinset y se ha entrenado y subido al Hub con LeRobot 0.6.1. Cuenta con 51.668.614 parámetros (dato real extraído del fichero de pesos en safetensors) y un repositorio de 0,2 GB. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque la política solo ha visto demostraciones de un único robot, dos cámaras fijas y una sola tarea.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el formato de dataset, entrenamiento y despliegue en robótica de imitación. Esto permite reproducir el pipeline completo (grabar demostraciones con una barra líder, entrenar y ejecutar en el robot) con unos pocos comandos, y sirve como punto de partida para hacer *fine-tuning* en tareas de pick-and-place similares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con variable latente tipo CVAE y backbone convolucional ResNet para las observaciones visuales |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible. El repositorio publica pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | No disponible. La política no procesa lenguaje natural y no está condicionada por instrucciones de texto |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint de política LeRobot, acompañado de la configuración del modelo y del entrenamiento) |

Datos adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.hand` | VISUAL | (3, 480, 640) |
| `observation.images.top` | VISUAL | (3, 480, 640) |
| `action` | ACTION | (6,) |

## Arquitectura y entrenamiento

ACT se describe en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). En lugar de predecir una única acción por paso de tiempo, el modelo predice un *chunk* de acciones futuras, lo que reduce el error de composición acumulado típico de las políticas paso a paso y suaviza el comportamiento en tareas de contacto. La arquitectura combina un encoder de observaciones (con backbone convolucional para las dos imágenes y proyección del estado articular) con un transformer encoder-decoder, más un encoder latente de estilo tipo CVAE que modela la variabilidad de las demostraciones humanas. En inferencia se emplea habitualmente *temporal ensembling*, que promedia las predicciones solapadas de chunks consecutivos.

El entrenamiento se realizó sobre el dataset `Pinset/so101_pick_place_2cam_100_20261008_140403`, con 100 episodios, 45.299 fotogramas y una frecuencia de captura de 30 FPS. La tarea única es "Pick up the blue block and put it in the green square". La configuración declarada es de 100.000 pasos de entrenamiento, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000 sobre LeRobot 0.6.1. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento por imitación, ni la composición lingüística del dataset (no aplica).

## Capacidades

- Control robótico por imitación de una tarea de pick-and-place: recoger un bloque azul y depositarlo en un cuadrado verde.
- Fusión de dos vistas de cámara (`hand` y `top`) con el estado articular de 6 dimensiones para generar acciones de 6 dimensiones.
- Generación de chunks de acciones en lugar de pasos individuales, lo que aporta estabilidad temporal en el seguimiento de trayectorias.
- Ejecución autónoma en el robot `so_follower` mediante `lerobot-rollout` a la frecuencia de control del entrenamiento (30 FPS en los datos).
- Reentrenamiento y *fine-tuning* sobre nuevos datasets mediante `lerobot-train` con `--policy.type=act`.
- No dispone de *tool calling*, *function calling*, capacidades de agente, razonamiento multi-paso simbólico, ni procesamiento de lenguaje, visión general, audio o matemáticas. Es una política específica de control motor.

## Casos de uso

- Automatización de una celda de pick-and-place en laboratorio o línea piloto: el robot recoge piezas de una posición definida y las coloca en una zona marcada, usando las dos cámaras para corregir la posición de la pinza durante la aproximación.
- Base de referencia para experimentos de imitación robótica: sirve como línea base ACT reproducible sobre SO-101 con un dataset público de 100 episodios, útil para comparar variantes de arquitectura o de aumentación de datos.
- Docencia en robótica y aprendizaje automático: el pipeline completo (grabar demostraciones con barra líder, entrenar con 100.000 pasos y desplegar) cabe en un portátil con GPU de gama media, lo que facilita prácticas de fin de asignatura.
- Validación y puesta a punto de hardware SO-101: ejecutar la política permite comprobar calibración, holguras, iluminación de la celda y sincronía de las cámaras antes de invertir en un sistema mayor.
- Recolección de datos y *fine-tuning* para nuevas tareas: partiendo de estos pesos se puede ajustar a variantes como cambiar el color del objeto o la posición de la bandeja, reutilizando la representación visual ya aprendida.
- Clasificación y ordenación de objetos pequeños en entornos controlados: una vez ajustada con demostraciones específicas, la política puede separar piezas por destino en bandejas fijas.
- Pruebas de rendimiento de pipelines de inferencia robótica: al tener solo 51,7 millones de parámetros, es un banco de pruebas cómodo para medir latencia de extremo a extremo (captura, preprocesado, inferencia, envío de comandos) frente al requisito de 30 Hz de los datos.
- Demostraciones y material divulgativo: la ventana de acción y la suavidad que aporta el *chunking* producen secuencias visualmente limpias para vídeos de presentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", y no incluye tabla de tasa de éxito en robot real ni evaluación en simulación. No se dispone por tanto de cifras de éxito para esta política concreta.

## Requisitos de hardware

- Estimación de memoria de pesos a partir del número real de parámetros (51.668.614): aproximadamente 207 MB en FP32, 103 MB en FP16/BF16 y 52 MB en INT8 (esta última solo si se exporta y cuantiza por cuenta propia, ya que no hay versiones cuantizadas publicadas).
- VRAM total esperada por debajo de 1 GB en FP32, incluyendo activaciones de dos imágenes de 480×640 propagadas por el backbone convolucional. Es un margen estimado, no una medición publicada.
- GPU: cabe en cualquier GPU con soporte CUDA, incluidas GTX 1650, RTX 3050, RTX 4060 o RTX 4090. Aceleradores de centro de datos como A100 o H100 no aportan ventaja apreciable para este tamaño y se desaconsejan por coste.
- También es viable la inferencia en CPU y en plataformas embebidas tipo Jetson Orin, pero no hay datos de latencia publicados para confirmar que se sostiene el bucle de control de 30 Hz.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial, con `--policy.path=Pinset/act_so101_pick_place_2cam_100000`). vLLM, TGI, Ollama y llama.cpp no aplican, al no ser un modelo de lenguaje. No se documenta exportación a ONNX ni a TensorRT.
- Latencia y throughput: no disponibles. Como referencia del requisito, los datos de entrenamiento se capturaron a 30 FPS, por lo que el bucle de inferencia más envío de comandos debería sostener idealmente 30 Hz o más.

## Comparativa con modelos similares

En el Hub existen otras políticas ACT para el mismo robot y tarea, publicadas por otros usuarios. No se dispone de sus especificaciones ni métricas en la información proporcionada.

| Modelo | Familia | Tarea / robot | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Pinset/act_so101_pick_place_2cam_100000 | ACT para LeRobot | Pick-and-place, SO-101, 2 cámaras | 51.668.614 | No aplica | Apache 2.0 | Pública en HuggingFace |
| ViVi-AI/ACT_so101_pick_place | ACT para LeRobot | Pick-and-place, SO-101 | No disponible | No aplica | No disponible | Pública en HuggingFace |
| shenlirobot/act_so101_pick_place | ACT para LeRobot | Pick-and-place, SO-101 | No disponible | No aplica | No disponible | Pública en HuggingFace |
| anvil2718/act_so101_pickplace | ACT para LeRobot | Pick-and-place, SO-101 | No disponible | No aplica | No disponible | Pública en HuggingFace |

Como alternativas metodológicas dentro del mismo ecosistema LeRobot existen otras familias de políticas (por ejemplo, políticas de difusión o modelos visión-lenguaje-acción), pero no se dispone en la información proporcionada de comparativas numéricas entre ellas y esta política.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que no puede afirmarse ningún nivel de fiabilidad en producción.
- Especialización extrema: entrena una única tarea con un único enunciado, un único cuerpo robótico (`so_follower`) y una configuración fija de dos cámaras (`hand` y `top`). Cambiar la disposición, el tipo de cámara o el robot invalida la política.
- Sensibilidad al dominio visual: al depender de 100 episodios y 45.299 fotogramas, es probable que se degrade ante cambios de iluminación, fondo, posición inicial de los objetos o presencia de distractores. No se documenta ninguna evaluación de robustez.
- Riesgo de sobreajuste a las trayectorias demostradas: la política reproduce el estilo de las demostraciones humanas; puede fallar de forma silenciosa ante configuraciones fuera de distribución, sin ningún mecanismo de detección de incertidumbre.
- Sin condicionamiento por lenguaje: la cadena de tarea del rollout se usa como identificador de la tarea, no como instrucción interpretada por el modelo.
- Idiomas y sesgos: no aplica en el sentido habitual, pero el dataset refleja la distribución de posiciones, objetos y entorno de quien grabó las demostraciones, lo que sesga el comportamiento hacia ese montaje.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de licencia y atribución. No hay cláusulas de uso responsable adicionales.
- Advertencias de seguridad física: es una política de control motor sobre hardware real. Debe operarse con paradas de emergencia, límites de par, espacio de trabajo despejado y supervisión humana durante las pruebas iniciales.
- Compatibilidad: requiere LeRobot 0.6.1 o una versión compatible para cargar el checkpoint correctamente y respetar los nombres de las claves de observación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pinset/act_so101_pick_place_2cam_100000
- Dataset de entrenamiento: https://huggingface.co/datasets/Pinset/so101_pick_place_2cam_100_20261008_140403
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Pinset/so101_pick_place_2cam_100_20261008_140403
- Artículo de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Políticas ACT similares en el Hub: https://huggingface.co/ViVi-AI/ACT_so101_pick_place, https://huggingface.co/shenlirobot/act_so101_pick_place
- Proyectos de referencia sobre SO-101 y ACT: https://github.com/aviadarn/so101-lerobot, https://github.com/mikami235/so101-act-pick-place
