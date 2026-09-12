# cdstubbs/my_smolvlarun3

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, pensado para control robótico por imitación y desplegable en hardware de consumo. El modelo aquí descrito, `cdstubbs/my_smolvlarun3`, es un ajuste fino (fine-tune) de `lerobot/smolvla_base` sobre el dataset `lerobot/svla_so101_pickplace`, no un modelo de propósito general: está especializado en una única tarea de manipulación, introducir un ladrillo de Lego rosa en una caja transparente.

El repositorio contiene 450.046.176 parámetros (aproximadamente 450 millones) en formato safetensors, con un tamaño total de 1,2 GB, licencia Apache 2.0 y publicación bajo la librería `lerobot`. La política consume estado propioceptivo de 6 dimensiones y dos cámaras (vistas `up` y `side` a 480x640) y produce un vector de acción de 6 dimensiones, ejecutado sobre un robot `so100_follower`.

Su relevancia es doble. Por un lado, demuestra el flujo estándar de LeRobot para llevar un VLA preentrenado a una tarea concreta con muy pocos recursos: el ajuste fino documentado consta de solo 100 pasos con batch de 32. Por otro, ejemplifica un modelo publicado sin resultados de evaluación, con 0 descargas y 0 likes en el momento de la consulta, lo que lo convierte en un caso útil para discutir qué información debería acompañar a un checkpoint robótico antes de considerarlo apto para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacto; detalles internos de la arquitectura no disponibles en la información proporcionada |
| Parámetros totales | 450.046.176 (aproximadamente 450 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican variantes cuantizadas; pesos en precisión completa o mixta) |
| Idiomas soportados | No disponible; la única instrucción de tarea documentada está en inglés ("pink lego brick into the transparent box") |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Tipo de modelo | Política robótica de imitación (no es un LLM de texto) |
| Modelo base | lerobot/smolvla_base |
| Librería | lerobot 0.6.2 |
| Robot objetivo | `so100_follower` |
| Cámaras | `up`, `side` |
| Entradas | `observation.state` (6,), `observation.images.up` (3, 480, 640), `observation.images.side` (3, 480, 640) |
| Salidas | `action` (6,) |
| Pipeline en HuggingFace | robotics |
| Dataset de entrenamiento | lerobot/svla_so101_pickplace (50 episodios, 11.939 fotogramas, 30 FPS) |
| Tamaño del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe SmolVLA como un modelo de visión-lenguaje-acción compacto y eficiente que alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. El método de referencia es el artículo arXiv:2506.01844. No se detallan en la documentación proporcionada aspectos como el backbone de visión, el mecanismo de fusión multimodal, el tipo de cabeza de acción ni la formulación de entrenamiento, por lo que se marcan como no disponibles en lugar de asumirlos.

En cuanto al entrenamiento de este checkpoint concreto, se trata de un ajuste fino supervisado sobre el modelo base `lerobot/smolvla_base` usando el dataset `lerobot/svla_so101_pickplace`, compuesto por 50 episodios y 11.939 fotogramas capturados a 30 FPS, todos correspondientes a la tarea "pink lego brick into the transparent box". La configuración declarada es de 100 pasos de entrenamiento, batch de 32, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. Con 11.939 fotogramas y un batch de 32, 100 pasos equivalen a menos de una época completa sobre el dataset, lo que indica un ajuste muy ligero orientado a adaptar el modelo base a una tarea concreta. No se documenta uso de RLHF, DPO ni ningún otro método de alineación, ni innovaciones técnicas específicas de este checkpoint.

## Capacidades

- Control robótico por imitación: genera trayectorias de acción de 6 grados de libertad a partir de observaciones visuales y de estado.
- Percepción visual bimanual (dos cámaras): procesa dos flujos simultáneos de 480x640 píxeles, correspondientes a las vistas `up` y `side`.
- Fusión visión-lenguaje-acción: condiciona la política a una instrucción de tarea en lenguaje natural, además de las observaciones.
- Ejecución de una tarea de manipulación específica: recogida de un ladrillo de Lego rosa y depósito en una caja transparente.
- Ejecución a 30 FPS sobre un robot `so100_follower`, con inferencia compatible con hardware de consumo según la descripción del método.
- Ejecución indefinida o acotada en el tiempo mediante el parámetro `--duration` de `lerobot-rollout`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, modo de pensamiento, audio ni generación de código.

## Casos de uso

- Replicación de un pipeline de imitación de referencia: sirve para verificar que la instalación de LeRobot, la calibración del robot SO-100 y las cámaras están correctamente configuradas antes de invertir tiempo en grabaciones propias.
- Evaluación del flujo de ajuste fino con pocos recursos: con 100 pasos y batch de 32, es un caso útil para medir cuánto tarda el ciclo completo de entrenamiento en una GPU concreta y qué calidad se obtiene con un presupuesto mínimo.
- Docencia y divulgación en robótica: al ser un modelo de 450 M y 1,2 GB, se puede desplegar en un aula o laboratorio con equipos modestos para ilustrar el ciclo observación-acción en un VLA.
- Pruebas de robustez de la tarea "pick and place": variando posiciones del ladrillo, iluminación o presencia de distractores se puede caracterizar empíricamente la generalización del checkpoint, dado que el autor no publica evaluación.
- Base de comparación en experimentos controlados: usar este checkpoint como línea base de un ajuste corto frente a variantes con más pasos, más episodios o distinto batch, para aislar el efecto del presupuesto de entrenamiento.
- Validación de infraestructura de rollout: comprobar latencias reales del bucle de control a 30 FPS con dos cámaras OpenCV activas, lo que permite dimensionar la GPU necesaria antes de escalar a políticas mayores.
- Demostración de integración con el Hub: dado que el modelo se ha subido con LeRobot, sirve para ensayar el ciclo de publicar, descargar y ejecutar una política desde el Hub en un entorno corporativo o académico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito, número de ensayos por tarea ni comparaciones con otras políticas.

| Benchmark | Resultado |
|---|---|
| Evaluación en robot real | No disponible |
| Tasa de éxito en la tarea | No disponible |
| Comparación con otras políticas | No disponible |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,8 GB en FP32 (450 M x 4 bytes) y en torno a 0,9 GB en BF16/FP16, coherente con un repositorio de 1,2 GB. Estas cifras son estimaciones calculadas a partir del número de parámetros, no datos publicados por el autor.
- VRAM adicional necesaria para activaciones y preprocesamiento de imagen: dos flujos de 480x640x3 por paso de control. No se publica el consumo medido; en la práctica conviene reservar al menos 4-6 GB de VRAM total para operar con margen.
- GPU recomendadas: por tamaño, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060, RTX 4070 o RTX 4090. No se dispone de mediciones específicas por modelo de GPU.
- GPU de数据中心 (A100, H100) no son necesarias para inferencia de esta política; pueden usarse para entrenar variantes con más datos o para ejecutar varias políticas en paralelo.
- Cabe en GPU de consumo: sí, según la descripción del modelo base, que indica que puede desplegarse en hardware de consumo.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución sobre robot; `lerobot-train` para reajuste desde `lerobot/smolvla_base`; PyTorch con CUDA como backend. No aplican vLLM, llama.cpp u Ollama, ya que no es un modelo de generación de texto.
- Latencia y throughput: no disponibles. El bucle de control se documenta a 30 FPS, pero no se publica el tiempo de inferencia por paso ni el rendimiento medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Evaluación publicada |
|---|---|---|---|---|---|
| cdstubbs/my_smolvlarun3 | 450 M | No disponible | Apache 2.0 | HuggingFace, 0 descargas | No |
| lerobot/smolvla_base | No disponible (mismo método y familia) | No disponible | No disponible en la información proporcionada | HuggingFace | No disponible |
| Otras políticas del ecosistema LeRobot (por ejemplo, ACT) | No disponible | No disponible | No disponible | HuggingFace | No disponible |

No se dispone de datos verificables sobre alternativas comparables en la información proporcionada, por lo que no se incluyen cifras de rendimiento ni de contexto que no puedan contrastarse.

## Limitaciones y advertencias

- Especialización extrema: la política está ajustada para una única tarea ("pink lego brick into the transparent box") sobre un único tipo de robot. No debe esperarse generalización a otras tareas, objetos o morfologías sin un nuevo ajuste fino.
- Ausencia de evaluación: el autor declara explícitamente que no hay resultados de evaluación, ni tasa de éxito ni número de ensayos. Cualquier decisión de producción basada en este checkpoint carece de evidencia empírica publicada.
- Incoherencia de nomenclatura: el dataset se llama `svla_so101_pickplace`, mientras que la model card declara `robot.type` como `so100_follower`. Conviene verificar la compatibilidad real del hardware antes de desplegar.
- Dependencia de la configuración de cámaras: los nombres de cámara `up` y `side` deben coincidir con las claves de observación del entrenamiento. Cambiar la resolución (480x640), la frecuencia (30 FPS) o la posición de las cámaras degradará el comportamiento.
- Contexto y prompt limitados: no se documenta la longitud de contexto ni el rango de instrucciones aceptadas; el único prompt conocido es el de la tarea de entrenamiento en inglés.
- Riesgo de sobreajuste al entorno de grabación: 50 episodios y menos de una época de entrenamiento hacen probable la sensibilidad a iluminación, fondo, posición inicial y variaciones del objeto.
- Idiomas: no se declara ningún idioma soportado, por lo que no puede garantizarse el comportamiento con instrucciones en castellano u otras lenguas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo base y el dataset subyacentes pueden tener condiciones propias que conviene revisar antes de redistribuir.
- Sesgos y alucinación: no se documentan sesgos conocidos; en el ámbito de las políticas robóticas, el fallo se manifiesta como acciones erróneas o inseguras en lugar de texto inventado. No hay información sobre comportamientos peligrosos en el borde del dominio de entrenamiento.
- Reproducibilidad: el autor no publica métricas de éxito ni vídeos de despliegue, y el modelo registra 0 descargas y 0 likes, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cdstubbs/my_smolvlarun3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so101_pickplace
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/svla_so101_pickplace
- Artículo de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos correspondían a contenidos sin relación con robótica o inteligencia artificial.
