# AdenEndure/act_640x480_cosine_v3

## Resumen

`AdenEndure/act_640x480_cosine_v3` es una política de robótica basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación descrito en el artículo arXiv:2304.13705. No es un modelo de lenguaje: es un controlador entrenado para una tarea de manipulación concreta sobre un brazo SO-101, que consume dos vistas de cámara RGB de 640x480 más el estado propioceptivo de 6 dimensiones y devuelve un vector de acción de 6 dimensiones. El modelo tiene 51.668.614 parámetros en formato safetensors y se distribuye bajo licencia Apache 2.0.

El interés de esta ficha es acotado y muy específico: se trata de un artefacto reproducible del ecosistema LeRobot (versión 0.6.2), entrenado con 100 episodios y 69.114 fotogramas a 30 FPS para la tarea "pick up the black cube and place in the red bowl". Su valor práctico está en servir como referencia de bajo coste computacional (51,7 M de parámetros) para pipelines de aprendizaje por imitación, no como modelo de propósito general. El repositorio no incluye resultados de evaluación, por lo que la tasa de éxito real es desconocida.

Es relevante ahora porque la librería LeRobot ha estandarizado el formato de políticas, datasets y comandos de despliegue, lo que permite ejecutar este tipo de checkpoints con una única línea de CLI sobre hardware de bajo coste. Con cero descargas y cero likes en el momento de redactar esta ficha, se trata de un modelo sin validación externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera con horizonte de observación y chunk de acciones no especificados en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no aplica: entradas visuales y de estado, salidas de acción) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | Política de imitación para robótica (pipeline: robotics) |
| Robot objetivo | `so_follower` (brazo SO-101) |
| Camaras de entrada | `top`, `wrist` (640x480, 30 FPS) |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | AdenEndure/so101_pendrive_640x480 (100 episodios, 69.114 fotogramas, 30 FPS) |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot 0.6.2 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (chunks) en lugar de un único paso, a partir de datos de teleoperación. El modelo consume dos flujos visuales de 640x480 píxeles junto con el vector de estado del robot (6 dimensiones) y produce un vector de acción de 6 dimensiones, coherente con los 6 grados de libertad del brazo `so_follower`. Al ser una política de control y no un modelo generativo de texto, no dispone de mecanismos de tool calling, atención sobre lenguaje natural ni decodificación especulativa.

El entrenamiento se realizó con LeRobot 0.6.2 durante 20.000 pasos, con un tamaño de lote de 3, optimizador AdamW, tasa de aprendizaje de 1e-05 y semilla 1000. El dataset asociado contiene 100 episodios y 69.114 fotogramas capturados a 30 FPS (aproximadamente 38 minutos de datos) para dos variantes de enunciado de la misma tarea: "pick up the black cube and place in the red bowl" y "Pick up the cube and place it in the bowl". La model card no detalla la composición de la arquitectura interna (encoder visual, dimensiones ocultas, tamaño del chunk), ni si se aplicó regularización, aumentado de datos o ajuste fino posterior. El sufijo `cosine_v3` del nombre sugiere una programación de tasa de aprendizaje coseno, pero la model card solo declara un valor de 1e-05, por lo que esta interpretación no está confirmada.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para un brazo SO-101 (`so_follower`) a partir de observaciones visuales y de estado.
- Predicción de chunks de acción en lugar de pasos individuales, lo que reduce el error de composición típico de las políticas paso a paso.
- Fusión de dos vistas de cámara (superior y de muñeca) con la propiocepción del robot.
- Ejecución de una tarea de pick-and-place: coger un cubo y dejarlo en un cuenco, en las dos formulaciones registradas en el dataset.
- Compatibilidad con el ecosistema LeRobot: entrenamiento, rollout y registro de episodios mediante las herramientas `lerobot-train` y `lerobot-rollout`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbólico ni planificación de tareas.
- No tiene capacidades multilingües, de generación de texto, de código, de matemáticas, de visión general ni de audio.
- No dispone de modo "thinking" ni de mecanismos de cadena de pensamiento.

## Casos de uso

- Manipulación pick-and-place en laboratorio: desplegar el modelo sobre un SO-101 con cámaras `top` y `wrist` y ejecutar la tarea "pick up the black cube and place in the red bowl" mediante `lerobot-rollout`, usando el checkpoint como política lista para usar en demostraciones.
- Referencia base para investigación en aprendizaje por imitación: al ser un ACT de 51,7 M de parámetros entrenado con 100 episodios, sirve como línea base reproducible para comparar variantes de arquitectura, aumentado de datos o regímenes de entrenamiento sobre el mismo dataset.
- Reentrenamiento con datos propios: el dataset de entrenamiento es público (AdenEndure/so101_pendrive_640x480) y el comando `lerobot-train --policy.type=act` permite ajustar el modelo a nuevas tareas de pick-and-place sin partir de cero.
- Evaluación de robustez en experimentos controlados: variar posición inicial del cubo, iluminación o presencia de distracciones para medir la degradación de la política, dado que no existe una evaluación publicada de referencia.
- Docencia y formación en robótica: el SO-101 es un brazo de bajo coste y la política cabe en GPUs de gama de entrada, lo que permite montar prácticas de aprendizaje por imitación de extremo a extremo (grabación, entrenamiento y despliegue).
- Recolección de datos asistida: usar ejecuciones de la política como punto de partida para teleoperar correcciones y ampliar el dataset con episodios adicionales.
- Prototipado de automatización de bajo coste: integración en celdas de laboratorio donde se requiera una tarea de recogida y colocación concreta y no se justifique un modelo mayor.
- Validación de pipelines de despliegue LeRobot: verificar la configuración de puertos serie, índices de cámara y nombres de claves de observación antes de escalar a políticas de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet._", por lo que no existe tabla de ensayos, éxitos ni tasa de éxito para esta política concreta. El artículo original de ACT (arXiv:2304.13705) reporta resultados propios del método, pero no son atribuibles a este checkpoint.

| Benchmark | Resultado |
|---|---|
| Tasa de éxito en robot real | No disponible |
| Entornos simulados | No disponible |
| MMLU / HumanEval / GSM8K | No aplica (modelo de robótica, no de lenguaje) |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,21 GB solo para los pesos en fp32 y unos 0,10 GB en fp16/bf16, calculados a partir de los 51.668.614 parámetros. Sumando activaciones de los dos encoders visuales a 480x640 y lote 1, el consumo total se mantiene por debajo de 2 GB en la mayoría de configuraciones (estimación, no medida publicada).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; se puede citar desde una GTX 1650 o RTX 3050 hasta una RTX 4090, A100 o H100, sin que el modelo aproveche el excedente de cómputo. También es viable en GPUs integradas y en dispositivos embebidos tipo Jetson Orin Nano.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en equipos sin GPU dedicada, siempre que se cumpla el ritmo de 30 FPS del bucle de control.
- Opciones de despliegue: `lerobot-rollout` de la librería LeRobot (PyTorch), con soporte de estrategias de rollout como `base`; no aplican servidores de inferencia de lenguaje como vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El requisito operativo conocido es que el bucle de inferencia debe sostener la frecuencia de captura de 30 FPS del dataset, y el cuello de botella real suele ser la lectura de cámaras USB y la comunicación serie con el robot, no el cómputo del modelo.
- Espacio en disco: el repositorio ocupa 0,2 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdenEndure/act_640x480_cosine_v3 | 51.668.614 | 2 imagenes 640x480 + estado (6,) | No disponible (sin evaluacion) | apache-2.0 | Hugging Face, 0 descargas |
| ACT (referencia del articulo 2304.13705) | No disponible en la informacion proporcionada | No disponible | Resultados reportados por los autores, no comparables directamente con este checkpoint | No disponible | Publicacion cientifica |
| Otras politicas del ecosistema LeRobot (por ejemplo, diffusion policy) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Repositorios independientes |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria. La comparacion relevante es cualitativa: este modelo es un ACT concreto, entrenado para una unica tarea sobre un SO-101, y su rendimiento solo puede medirse replicando los ensayos en robot real.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni condiciones de prueba, por lo que no se puede afirmar que la política funcione de forma fiable.
- Cero descargas y cero likes: no existe validación independiente por parte de la comunidad.
- Sobreajuste probable al entorno de captura: 100 episodios y 69.114 fotogramas de una única tarea implican una alta dependencia de las posiciones de cámara, la iluminación, la mesa y el robot concretos usados durante la grabación.
- Dependencia estricta del formato de observación: los nombres de cámara deben coincidir con `observation.images.top` y `observation.images.wrist`, y las resoluciones con 640x480 a 30 FPS.
- Portabilidad limitada: está entrenado para `so_follower` con estado y acción de 6 dimensiones; usarlo en otro robot o con otra morfología requiere reentrenamiento.
- Sin capacidades de lenguaje ni razonamiento: no interpreta instrucciones arbitrarias en lenguaje natural ni generaliza a tareas fuera de la distribución del dataset.
- Los enunciados de tarea registrados están en inglés ("pick up the black cube and place in the red bowl"), lo que condiciona cualquier condicionamiento por tarea.
- Riesgo físico: cualquier despliegue en hardware real debe incluir parada de emergencia, límites de par y supervisión humana, ya que una política de imitación puede generar acciones erráticas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia; el autor no ofrece garantías ni asume responsabilidad por daños derivados del uso.
- Idiomas soportados: no disponibles; no aplica a un modelo cuyas entradas son imágenes y vectores de estado.
- No se especifican cuantizaciones ni versiones optimizadas para despliegue en dispositivos con recursos muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdenEndure/act_640x480_cosine_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/AdenEndure/so101_pendrive_640x480
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AdenEndure/so101_pendrive_640x480
- Articulo de ACT: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Configuracion de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a una consulta medica en Alemania) y se han descartado por no ser fuentes relevantes.
