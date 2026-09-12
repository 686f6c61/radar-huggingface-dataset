# hackathon1-fmm/act_rod_insert_robot_1_v0_h200x2_20k

## Resumen

`act_rod_insert_robot_1_v0_h200x2_20k` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers, paper arXiv:2304.13705) y publicada en Hugging Face mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular de un brazo robótico y tres cámaras RGB, y produce directamente comandos de acción de 7 dimensiones. La tarea concreta para la que se ha entrenado es "Grasp the rod and insert it from above into the tube", es decir, agarre e inserción de una varilla en un tubo.

El modelo tiene 51.670.663 parámetros (unos 51,7 M) y un repositorio de 2,5 GB, lo que lo sitúa en la categoría de políticas ligeras que caben holgadamente en una GPU de consumo e incluso pueden ejecutarse en CPU. Se ha entrenado durante 20.000 pasos con AdamW y una tasa de aprendizaje de 1e-05 sobre el dataset `hackathon1-fmm/rod_insert_robot_1_v0` (100 episodios, 36.544 fotogramas a 15 FPS, aproximadamente 40,6 minutos de datos de teleoperación). El nombre del repositorio sugiere un entrenamiento sobre 2 GPU H200, aunque este extremo no se documenta en la model card.

Su relevancia es doble: por un lado, sirve como referencia reproducible de un pipeline completo de imitation learning con LeRobot 0.6.2 sobre un robot `rebot_b601_follower`; por otro, es un punto de partida directo para fine-tuning en tareas de ensamblaje por inserción, un caso clásico y exigente en robótica de manipulación por la precisión milimétrica que requiere. El autor no ha publicado resultados de evaluación en robot real, por lo que su tasa de éxito es, a día de hoy, desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.670.663 (unos 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume una ventana de observaciones estado + 3 imagenes) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; recibe una cadena de tarea fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos de entrada y salida declarados en la model card:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(7,)` |
| `observation.images.front` | VISUAL | `(3, 480, 640)` |
| `observation.images.side` | VISUAL | `(3, 480, 640)` |
| `observation.images.wrist` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(7,)` |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un bloque corto de acciones futuras (chunk). Esta formulación reduce el horizonte efectivo de decisión, mitiga el problema del compounding error típico de las políticas paso a paso y suele traducirse en tasas de éxito más altas con datasets de teleoperación relativamente pequeños, como es el caso: 100 episodios y 36.544 fotogramas a 15 FPS. La arquitectura es un transformer que combina un codificador de observaciones (estado de 7 dimensiones más tres cámaras RGB de 480x640, es decir, `front`, `side` y `wrist`) con un decodificador que emite las acciones.

El entrenamiento se realizó con LeRobot 0.6.2 durante 20.000 pasos, tamaño de lote 32 (640.000 muestras de acción vistas en total), optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. La model card no detalla la composición del dataset más allá de los 100 episodios, el frame rate y la tarea objetivo, ni indica si se aplicaron fases de RLHF, DPO o ajuste posterior. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal: se trata de una configuración estándar de ACT dentro del ecosistema LeRobot.

## Capacidades

- Control visomotor de un brazo robótico tipo `rebot_b601_follower` a partir de estado articular de 7 dimensiones y tres vistas de cámara.
- Ejecución de la tarea de agarre e inserción de una varilla en un tubo desde arriba, aprendida por imitación de demostraciones teleoperadas.
- Predicción de secuencias de acción (action chunking), no de acciones aisladas, lo que aporta suavidad temporal y estabilidad.
- Fusión de información de tres cámaras simultáneas (frontal, lateral y en la muñeca), lo que permite corregir la pose relativa entre pinza y tubo.
- Ejecución de despliegue mediante la CLI `lerobot-rollout` con `--strategy.type=base`, incluyendo ejecución continua sin límite de duración si no se especifica `--duration`.
- Entrenamiento adicional o fine-tuning mediante `lerobot-train` con `--policy.type=act` sobre nuevos datasets.
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes basados en lenguaje; el modelo implementa una política reactiva de horizonte corto.
- Capacidades multilingües: no aplica.
- Capacidades especiales: no se documentan modos de pensamiento, visión generalista ni procesamiento de audio; la visión está restringida a las tres cámaras de entrenamiento.

## Casos de uso

- Ensamblaje por inserción en línea de producción: la política está entrenada específicamente para insertar una varilla en un tubo, un tipo de tarea (peg-in-hole) habitual en cadenas de montaje. Puede desplegarse tal cual sobre un `rebot_b601_follower` para validar la viabilidad del ensamblaje automatizado antes de escalar a soluciones industriales.
- Fine-tuning para nuevas tareas de inserción: partiendo de estos 51,7 M de parámetros ya ajustados a una tarea de precisión, se puede reentrenar con `lerobot-train` sobre datasets propios con geometrías, diámetros o tolerancias distintas, reduciendo el número de demostraciones necesarias frente a un entrenamiento desde cero.
- Banco de pruebas de pipelines de imitation learning: sirve como referencia reproducible de un flujo completo LeRobot 0.6.2 (grabación, entrenamiento, rollout y publicación en el Hub), útil para equipos que quieren comparar hiperparámetros o versiones de la librería.
- Investigación en robustez de políticas visomotoras: al disponer de tres cámaras y de datos de una sola tarea, permite estudiar la degradación al cambiar condiciones de iluminación, posiciones de objeto o pequeños distractores, cuantificando la tasa de éxito en cada variación.
- Docencia y formación en robótica de manipulación: el modelo es lo bastante pequeño (51,7 M de parámetros, 2,5 GB de repositorio) para ejecutarse en hardware de laboratorio asequible, lo que facilita prácticas de aprendizaje por imitación sin infraestructura de centro de datos.
- Base para comparativas entre métodos de imitación: al ser una implementación estándar de ACT, se puede contrastar con otras políticas del ecosistema LeRobot (Diffusion Policy, VQ-BeT, SmolVLA, entre otras) sobre el mismo dataset de inserción.
- Evaluación de transferencia entre robots del mismo modelo: la model card indica el tipo de robot objetivo, por lo que es posible medir cuánto se degrada la política al desplegarla en otra unidad del mismo modelo con calibración distinta.
- Teleoperación asistida o demostración aumentada: la política puede usarse para proponer acciones que un operador corrige, generando datos adicionales con coste de anotación reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla de tabla (tarea, intentos, éxitos, tasa de éxito) pero permanece explícitamente vacía: "No evaluation results have been provided for this policy yet". No se dispone, por tanto, de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 51,67 M de parámetros, los pesos en FP32 ocupan aproximadamente 207 MB y en FP16 unos 103 MB; a ello hay que sumar las activaciones de las tres imágenes de 480x640 y el estado de 7 dimensiones, un coste pequeño en comparación.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas las de gama de entrada. El nombre del repositorio (`h200x2`) sugiere que el entrenamiento se realizó sobre 2 GPU H200, pero ese dato no está confirmado en la model card y no es representativo del coste de inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier modelo con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060, RTX 4090). También es viable su ejecución en CPU para pruebas, aunque con menor frecuencia de inferencia.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=hackathon1-fmm/act_rod_insert_robot_1_v0_h200x2_20k` y `--strategy.type=base`; el mismo pipeline admite grabar episodios si se cambia la estrategia. La integración con servidores de inferencia genéricos (vLLM, TGI) no aplica a este tipo de política.
- Latencia y throughput estimados: no disponible. La model card no publica medidas de latencia ni de frecuencia de control efectiva; el dato indirecto es que los datos de entrenamiento se capturaron a 15 FPS, lo que sugiere un régimen de control en torno a esa frecuencia, pero no lo confirma el autor.

## Comparativa con modelos similares

No se dispone de datos verificados de parámetros, contexto o rendimiento de las alternativas en la información proporcionada, por lo que la comparación se limita a lo que puede afirmarse sin inventar cifras.

| Modelo | Parametros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|
| `hackathon1-fmm/act_rod_insert_robot_1_v0_h200x2_20k` (ACT) | 51,67 M | Apache 2.0 | Hugging Face, vía LeRobot | Política entrenada para inserción de varilla en tubo; sin evaluación publicada |
| Diffusion Policy | no disponible en la informacion proporcionada | no disponible | disponible en LeRobot como `--policy.type=diffusion` | Método alternativo de imitación que genera acciones mediante difusión; requiere más pasos de inferencia por acción |
| VQ-BeT | no disponible en la informacion proporcionada | no disponible | disponible en LeRobot como `--policy.type=vqbet` | Política discreta basada en codebooks vectoriales |
| SmolVLA | no disponible en la informacion proporcionada | no disponible | disponible en LeRobot | Política visomotora con componente de lenguaje; mayor coste computacional |

Como referencia metodológica, el propio paper de ACT (arXiv:2304.13705) reporta tasas de éxito elevadas en tareas de manipulación fina, pero esos resultados corresponden a las configuraciones evaluadas por los autores y no son extrapolables a este checkpoint concreto, que carece de evaluación.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card no incluye ninguna tabla de resultados en robot real. La tasa de éxito de la tarea de inserción es desconocida, por lo que no debería asumirse que el modelo funciona en producción sin una validación propia.
- Dependencia estricta del hardware de entrenamiento: la política espera un robot `rebot_b601_follower` y exactamente tres cámaras denominadas `front`, `side` y `wrist` con resolución 480x640. Los nombres de cámara deben coincidir con las claves de observación; cualquier discrepancia provoca fallo en el despliegue.
- Sensibilidad a la calibración y a las condiciones visuales: al haberse entrenado con un único dataset de 100 episodios y una sola tarea, es probable que se degrade ante cambios de iluminación, fondo, posición inicial del objeto o ligeras variaciones de calibración. Esto es un riesgo esperable del método, aunque no se cuantifica en la información disponible.
- Sesgo de dataset: 36.544 fotogramas y 100 episodios a 15 FPS representan aproximadamente 40,6 minutos de demostraciones de una sola tarea y presumiblemente de un solo operador, lo que limita la diversidad de estrategias aprendidas.
- Alcance funcional muy estrecho: el modelo solo ejecuta la instrucción "Grasp the rod and insert it from above into the tube". No generaliza a otras tareas ni comprende instrucciones nuevas, más allá de la cadena de tarea que se le pasa.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe el riesgo análogo de acciones fuera de distribución que pueden provocar colisiones o daños en el robot o en las piezas; se recomienda limitar velocidades, fuerzas y espacios de trabajo.
- Idiomas: no procede; el modelo no procesa lenguaje natural.
- Licencia: Apache 2.0, que permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se cite la autoría correspondiente. No se identifican restricciones adicionales en la información disponible.
- Trazabilidad limitada: la única documentación disponible es la model card; no se publican curvas de entrenamiento, métricas de validación ni análisis de fallos.
- Datos de la búsqueda web no relevantes: los resultados devueltos por la búsqueda no guardan relación con el modelo (tratan sobre incidentes en partidos de hockey), por lo que no aportan información técnica ni se han utilizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hackathon1-fmm/act_rod_insert_robot_1_v0_h200x2_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/hackathon1-fmm/rod_insert_robot_1_v0
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=hackathon1-fmm/rod_insert_robot_1_v0
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo, su autor o el método ACT; los enlaces anteriores proceden exclusivamente de la model card y de la información de Hugging Face.
