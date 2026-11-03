# inkoziev/smolvla-so101-sim-v8b

## Resumen

smolvla-so101-sim-v8b es un modelo de visión-lenguaje-acción (VLA) obtenido por ajuste fino del modelo base lerobot/smolvla_base sobre datos exclusivamente simulados. Lo desarrolla el usuario inkoziev y su propósito es concreto: que un brazo robótico SO-101 sea capaz de agarrar un objeto designado por su descripción textual ("pick up the blue cube", "grasp the red ball") a partir de un par estéreo de cámaras. La variante "B" del experimento v8 incorpora, además de las imágenes y los ángulos articulares, una descripción explícita de la pose y el campo de visión de la cámara.

El modelo tiene 450.046.176 parámetros (unos 450 M) y se distribuye en formato safetensors con la librería LeRobot, con un repositorio de 0,9 GB. Se entrenó durante 40.000 pasos con un tamaño de lote de 64, lo que supuso aproximadamente 16 horas en una única RTX 3090. La licencia es Apache 2.0.

Su relevancia radica en dos factores: por un lado, demuestra que un VLA de tamaño contenido puede ajustarse en hardware de consumo para una tarea robótica de manipulación; por otro, explora la transferencia sim-a-real, ya que todo el entrenamiento proviene del simulador y el autor reporta resultados en banco real en el repositorio so101-lab, advirtiendo que la precisión depende de la colocación de la cámara, el comportamiento de los servos y las diferencias de apariencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA), ajuste fino de lerobot/smolvla_base |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea del entrenamiento estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de lerobot/smolvla_base, un VLA de la familia SmolVLA, y se ajusta con LeRobot 0.6.0. La entrada consta de dos imágenes estéreo rectificadas de 640×360 píxeles cada una (`observation.images.camera1` y `observation.images.camera2`; `camera3` queda vacía con `empty_cameras=1`), un vector de estado de 16 valores y un texto de tarea. Ese vector de estado combina 6 ángulos articulares con una descripción de cámara de 10 números: posición del centro estéreo en metros, dirección de visión, dirección "arriba" de la imagen en el marco del robot (adelante/izquierda/arriba desde el eje de paneo) y campo de visión horizontal dividido entre 100. En el brazo real esa descripción se calcula a partir de una calibración de la pose de la cámara.

La salida son 6 objetivos articulares: cinco articulaciones del brazo en grados (ángulos URDF, con 0 en el centro del rango, ejecutando el seguidor SO-101 real en el modo de grados de LeRobot) y la pinza con 0 = cerrada y 100 = abierta. El entrenamiento usó únicamente el dataset simulado inkoziev/so101-sim-grasp-v8b, con aleatorización de escena, cámara y servos según la tarjeta del dataset, durante 40.000 pasos y lote de 64 (unas 16 horas en una RTX 3090). Fue una única ejecución de entrenamiento, sin búsqueda de hiperparámetros. La evaluación se realizó con replanificación cada 10 pasos (`n_action_steps = 10`).

## Capacidades

- Generación de acciones de manipulación: produce 6 objetivos articulares (5 del brazo más la pinza) a partir de observaciones visuales y de estado.
- Percepción estéreo: consume un par de imágenes rectificadas de 640×360 y aprovecha la información de profundidad implícita en la disparidad.
- Condicionamiento por lenguaje: acepta instrucciones de tarea en forma de texto, como "pick up the blue cube" o "grasp the red ball".
- Conciencia de la pose de cámara: integra en el vector de estado la posición, orientación y campo de visión de la cámara, lo que permite generalizar a distintas colocaciones si la calibración es correcta.
- Control en bucle cerrado con replanificación periódica cada 10 pasos.
- No dispone de tool calling, function calling, capacidades de agente multi-paso ni modo de razonamiento explícito; es un modelo de política robótica, no un asistente conversacional.
- Capacidades multilingües: no documentadas; las instrucciones de entrenamiento están en inglés.

## Casos de uso

- Recogida de un objeto designado por nombre en un entorno simulado: el modelo recibe la instrucción textual y el par estéreo, y genera la secuencia de articulaciones para alcanzar y cerrar la pinza sobre el objeto. Es su caso de uso principal y el único validado de forma explícita.
- Evaluación de pipelines sim-a-real: sirve para medir la brecha entre simulación y banco real en una tarea de agarre, comparando el rendimiento en el simulador con el del brazo físico SO-101.
- Prototipado de políticas VLA en hardware de consumo: al haberse entrenado en una sola RTX 3090 en unas 16 horas, es una referencia práctica para equipos que quieran reproducir un ajuste fino de SmolVLA con recursos limitados.
- Investigación en condicionamiento por pose de cámara: la variante B permite estudiar cuánto aporta pasar una descripción explícita de la cámara frente a depender solo de las imágenes.
- Generación de datos y aumento de dataset: el código de simulación, generación de datos y entrenamiento está publicado en so101-lab, de modo que el modelo sirve como punto de partida para nuevas variantes sobre el mismo pipeline.
- Docencia y demostraciones de robótica con LeRobot: un modelo de 450 M parámetros y 0,9 GB es manejable para prácticas de laboratorio con el brazo SO-101 y el stack LeRobot.
- Automatización de tareas de pick-and-place simples en laboratorio: únicamente con un solo objeto conocido, sin distractores y con la cámara calibrada, como paso previo a políticas más generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo remite a los resultados en bucle cerrado en simulación (puntos de vista dentro del rango de entrenamiento y reservados) y en el brazo real al registro de investigación del repositorio so101-lab, sin cifras numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M parámetros en safetensors, los pesos en precisión completa ocupan aproximadamente 1,8 GB (FP32) o 0,9 GB (FP16/BF16), a lo que hay que sumar el codificador visual y las activaciones.
- GPU recomendadas: el autor entrenó en una RTX 3090; para inferencia basta una GPU consumer moderna con suficiente VRAM para el modelo y el procesamiento de imagen estéreo.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más, aunque no se documenta una cifra oficial.
- Opciones de despliegue: LeRobot 0.6.0 (librería declarada) y el runner de brazo real incluido en github.com/Koziev/so101-lab. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de política robótica.
- Latencia y throughput: no disponibles. La evaluación usa replanificación cada 10 pasos (`n_action_steps = 10`), pero no se publican tiempos por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| inkoziev/smolvla-so101-sim-v8b | 450.046.176 | no disponible | Agarre de un objeto con SO-101 desde estereo | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base de SmolVLA, ajustable a tareas | no disponible en la informacion | HuggingFace (modelo base citado) |
| Otras variantes del experimento v8 de inkoziev | no disponible | no disponible | Variantes A/B del mismo entrenamiento simulado | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos simulados: en el brazo real la precisión depende de la colocación de la cámara, del comportamiento de los servos y de las diferencias de apariencia respecto al simulador.
- Maneja un único objeto y no ha sido entrenado con distractores, por lo que no se espera robustez en escenas con objetos adicionales.
- Requiere una calibración correcta de la pose de cámara para calcular los 10 valores de descripción que acompañan a los ángulos articulares; una calibración errónea degrada la política.
- Depende de un pipeline de entrada muy específico: par estéreo rectificado de 640×360, ojos paralelos, punto principal centrado y `camera3` vacía.
- Una sola ejecución de entrenamiento y sin búsqueda de hiperparámetros, lo que limita las garantías sobre la configuración óptima.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe; al ser un modelo de acción, el riesgo principal es la ejecución de movimientos incorrectos, no la generación de texto.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribución y aviso; conviene revisar también las condiciones del modelo base lerobot/smolvla_base y del dataset simulado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inkoziev/smolvla-so101-sim-v8b
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/inkoziev/so101-sim-grasp-v8b
- Repositorio de código (simulador, generación de datos, entrenamiento, evaluación y runner del brazo real): https://github.com/Koziev/so101-lab
