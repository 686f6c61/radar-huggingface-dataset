# digas99/smolvla_so101_tray_v3

## Resumen

smolvla_so101_tray_v3 es un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el usuario digas99 y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino completo del modelo base lerobot/smolvla_base, un SmolVLA de 450 millones de parámetros, entrenado sobre el conjunto de datos digas99/so101_tray_train_v3 para controlar un brazo robótico LeRobot SO-101 en una tarea concreta de manipulación: mover objetos entre una mesa y una bandeja transparente en ambos sentidos.

El modelo resuelve el problema de generar acciones motrices a partir de dos cámaras (una cenital fija y otra en la muñeca del gripper), el estado articular de 6 grados de libertad y una instrucción textual en lenguaje natural. Es relevante porque demuestra un flujo de trabajo de agregación de datos estilo DAgger sobre un VLA pequeño y abierto, con correcciones humanas iterativas recogidas mientras políticas anteriores fallaban, lo que permite estudiar cómo mejora un modelo de política robótica sin aumentar su tamaño.

La política es deliberadamente agnóstica a la clase de objeto: nunca recibe el nombre del objeto, sino que un segmentador externo la sitúa en una posición de hover de aproximadamente 10 cm sobre el objetivo. El repositorio ocupa 53,3 GB e incluye checkpoints intermedios cada 2500 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM con backbone reducido a 16 capas, encoder de visión y experto de acción) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés: dos cadenas fijas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, un VLA compacto que combina un backbone de modelo de visión-lenguaje reducido a 16 capas, un encoder visual y un experto de acción que genera trayectorias mediante flow matching. El ajuste fino es completo: se entrenan el VLM, el encoder de visión y el experto de acción, partiendo de lerobot/smolvla_base con la misma configuración de capas.

El entrenamiento se realizó durante 30.000 pasos con batch de 16, learning rate de 5e-05 con decaimiento coseno y warm-up según la configuración base, precisión bf16 con pesos maestros en fp32 para el VLM, y aumentos de imagen por defecto de LeRobot. Se completaron aproximadamente 3,6 épocas sobre el conjunto de entrenamiento en una única NVIDIA L4 de 24 GB, a unos 1,2 segundos por paso. El conjunto de datos combina 135 episodios de demostración mesa-a-bandeja, 90 episodios bandeja-a-mesa y múltiples tandas de correcciones humanas grabadas mientras políticas anteriores fallaban (estilo DAgger), además de demostraciones en escenas con objetos amontonados. Los datos provienen de dos cámaras a 640x480 y 30 fps en formato LeRobot v3.0 con robot_type so_follower. Los nombres de cámara se remapean en entrenamiento (observation.images.top a camera1 y observation.images.wrist a camera2), por lo que la inferencia requiere el mismo remapeo.

## Capacidades

- Generación de acciones robóticas de 6 grados de libertad para un brazo SO-101 a partir de imágenes y estado articular.
- Percepción visual mediante dos cámaras simultáneas (cenital y de muñeca).
- Seguimiento de instrucciones de tarea en lenguaje natural, limitado a dos cadenas fijas: "Pick up the object and put it in the tray" y "Pick up the object from the tray and put it on the table".
- Manipulación bidireccional de objetos entre mesa y bandeja.
- Generalización a objetos no vistos en entrenamiento (el autor reserva objetos fuera del conjunto para medirla).
- Operación en escenas con objetos vecinos en contacto, distractores y bandejas parcialmente llenas.
- Política agnóstica a la clase: no requiere el nombre del objeto, solo una posición de hover inicial.
- No dispone de tool calling, razonamiento multi-paso textual ni capacidades de audio.

## Casos de uso

- Automatización de picking y placing en laboratorio: el modelo ejecuta la transición mesa-bandeja y bandeja-mesa con una instrucción textual fija, adecuado para tareas repetitivas de clasificación de piezas pequeñas sobre una superficie acotada.
- Investigación en aprendizaje por imitación con DAgger: el repositorio documenta la composición exacta de correcciones y demostraciones, lo que permite reproducir el ciclo de agregación de datos y comparar rondas de entrenamiento.
- Evaluación de generalización a objetos no vistos: al reservar objetos fuera del conjunto de entrenamiento, sirve para medir la robustez de un VLA pequeño frente a variaciones de forma y tamaño.
- Base para ajuste fino en tareas de manipulación doméstica: al partir de smolvla_base y entrenar con un conjunto pequeño (unos 225 episodios más correcciones), es un punto de partida realista para adaptar el modelo a otras tareas con hardware modesto.
- Despliegue en robots de bajo coste: con 450 millones de parámetros y entrenamiento en una sola L4, es viable en estaciones con GPU de gama media para control en tiempo real (latencia medida de 234,5 ms por chunk en cuda).
- Estudio de robustez ante amontonamiento: las demostraciones en escenas con vecinos en contacto permiten evaluar el comportamiento del modelo cuando el objeto está atascado entre otros.
- Docencia y reproducción de pipelines LeRobot: el modelo incluye checkpoints intermedios cada 2500 pasos con estado de entrenamiento, útil para analizar la evolución de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor proporciona métricas de entrenamiento y verificación offline:

| Metrica | Valor |
|---|---|
| Pérdida flow-matching (paso 100) | 0,415 |
| Pérdida flow-matching (paso 1K) | 0,215 |
| Pérdida flow-matching (paso 11K) | 0,098 |
| Pérdida flow-matching (paso 21K) | 0,057 |
| Pérdida flow-matching (paso 30K) | 0,045 |
| MAE primer paso por articulación (grados) | [1,5377, 1,2156, 4,1348, 1,3171, 1,1884, 0,7439] |
| MAE a 50 pasos por articulación (grados) | [1,8208, 1,7544, 2,3703, 1,6346, 2,1088, 1,2092] |
| MAE/std primer paso (media) | 0,060 |
| MAE/std a 50 pasos (media) | 0,069 |
| Latencia por chunk en cuda (mediana) | 234,5 ms |
| Huella (suma de predicciones del primer paso) | 199,61841 |

La verificación offline se realizó sobre 6 fotogramas de 6 episodios (hasta 3 por tarea) y el autor indica que debe reproducirse en la máquina de despliegue hasta el tercer decimal.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en bf16 el peso ronda 0,9 GB, más el coste de las dos cámaras a 640x480 y el estado de la política.
- GPU de entrenamiento documentada: una NVIDIA L4 de 24 GB (aproximadamente 1,2 s por paso).
- GPU recomendadas: L4, A100, H100 o RTX 4090 son suficientes para inferencia; el modelo cabe holgadamente en GPUs de consumo con al menos 8 GB de VRAM.
- Despliegue: la librería indicada es LeRobot (SmolVLAPolicy.from_pretrained); no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VLA de robótica.
- Latencia medida: mediana de 234,5 ms por chunk en cuda.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_so101_tray_v3 | 450 M | no disponible | Manipulación SO-101 mesa-bandeja | Apache 2.0 | HuggingFace (56 descargas) |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base para ajuste fino | no disponible en la información | HuggingFace |
| digas99/smolvla_so101_tray_v2corrAB | no disponible en la información | no disponible | Ronda anterior de la misma tarea | no disponible en la información | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada, más allá de que v3 es la segunda ronda de agregación sobre v2corrAB y se reentrena desde el modelo base con la misma receta.

## Limitaciones y advertencias

- El modelo espera comenzar desde una posición de hover de unos 10 cm sobre el objeto; arrancar desde la pose de reposo está fuera de distribución.
- Solo admite dos cadenas de tarea fijas en inglés; no hay soporte multilingüe documentado ni instrucciones libres.
- Es agnóstico a la clase y depende de un segmentador externo que lo sitúe sobre el objetivo; sin ese supervisor no funciona según el diseño previsto.
- Entrenado para un robot concreto (so_follower) y dos cámaras con nombres remapeados; la inferencia requiere el mismo remapeo y configuración.
- La generalización a objetos no vistos está reservada para medición, pero no se publican resultados de esa evaluación en la información disponible.
- Riesgo de alucinación motriz: como política de flow matching, puede generar trayectorias erróneas ante escenas fuera de la distribución de entrenamiento (iluminación, fondos, posiciones no cubiertas).
- No se documentan sesgos demográficos ni lingüísticos, pero el conjunto de datos es reducido (aproximadamente 225 episodios más correcciones) y de un único entorno.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documenta limitaciones de seguridad física para operación con personas cerca.
- El repositorio ocupa 53,3 GB por los checkpoints intermedios, lo que puede ser un coste relevante para despliegues con almacenamiento limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/digas99/smolvla_so101_tray_v3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/digas99/so101_tray_train_v3
- Ronda anterior: https://huggingface.co/digas99/smolvla_so101_tray_v2corrAB
- Correcciones de la ronda anterior: https://huggingface.co/datasets/digas99/so101_corr_v2corrAB
- Demostraciones en escenas amontonadas: https://huggingface.co/datasets/digas99/so101_teach_clutter
