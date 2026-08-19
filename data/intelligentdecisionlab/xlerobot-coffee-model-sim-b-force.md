# IntelligentDecisionLab/xlerobot-coffee-model-sim-b-force

## Resumen

El modelo `xlerobot-coffee-model-sim-b-force` es una política robótica entrenada con ACT (Action Chunking with Transformers) para el robot móvil de doble brazo XLeRobot, de 17 grados de libertad (DoF). Forma parte del proyecto X-Lerobot Coffee Automata, desarrollado por el IntelligentDecisionLab (AS-CITI), y corresponde al "Método B" (force-added), entrenado exclusivamente con datos de simulación. El repositorio contiene doce carpetas, cada una con un checkpoint final de 100k pasos y un barrido de pasos, que cubren distintas tareas de una cadena de automatización de café (colocar taza, pulsar botón, mover taza a bandeja, etc.) y dos espacios de acción: 17-DoF (acción completa) y 6-DoF (solo el brazo actuante).

La relevancia de este modelo reside en que permite comparar de forma aislada el efecto del espacio de acción (17 vs 6 dimensiones) y del método de entrenamiento (visión+posición frente a fuerza añadida) sobre el error de predicción de acciones, utilizando una arquitectura ACT con una ventana de observación multiescala y un codificador 1D-CNN. Aunque los resultados de la comparación interna muestran que ambos espacios de acción son estadísticamente indistinguibles en precisión, el autor recomienda usar la variante 17-DoF para despliegue por su coherencia con la plataforma y su capacidad bimanual.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors, y requiere la rama `Coffee_Automata` / `hpi_act` del proyecto para instanciarse correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) + Module A (A1) con token HPI, codificador multiescala denso + 1D-CNN, sin compuerta de contacto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | chunk_size 100, n_action_steps 100 (ventana de accion) |
| Tipos de cuantizacion | no disponible (no se menciona cuantizacion) |
| Idiomas soportados | no disponible (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (via libreria lerobot) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT (Action Chunking with Transformers), que predice secuencias de acciones de longitud fija (chunk) a partir de observaciones. La variante aquí presentada incorpora el "Module A" (A1), que añade un token dedicado para las señales hápticas y de fuerza (HPI, High-frequency Proprioceptive Input). Para la versión 17-DoF, la observación HPI tiene 24 dimensiones (9 del brazo izquierdo, 9 del derecho, 6 ceros del cuerpo), mientras que la versión 6-DoF usa 9 dimensiones correspondientes al bloque del brazo actuante (par externo del gripper, posición, velocidad y wrench TCP de 6 dimensiones). Ambas variantes emplean un codificador multiescala con ventana densa y una red 1D-CNN, sin compuerta de contacto.

El entrenamiento se realizó con la receta estándar: chunk_size 100, n_action_steps 100, batch 8, 100k pasos, semilla 1000, idéntica para todos los modelos del repositorio. Los datos de simulación se grabaron a 20 fps (frecuencia HPI), y las estadísticas de normalización se fijaron según la regla `xlerobot_norm_floor` (1e-2 para estado/acción, 1e-5 para HPI) para corregir un defecto de desviación estándar degenerada. El entrenamiento se llevó a cabo en GPUs RTX PRO 6000 Blackwell (modelos de 1 cámara) y RTX 5090 (modelos de 2 cámaras), aunque en este repositorio solo hay datos de simulación con 1 cámara.

## Capacidades

- Ejecución de tareas de manipulación robótica en simulación: colocar taza (t1), pulsar botón (t2), mover taza a bandeja (t3), mover bandeja a mesa (t5), entre otras.
- Dos espacios de acción: predicción completa de 17 dimensiones (toda la articulación del robot) o predicción reducida de 6 dimensiones (solo el brazo actuante).
- Integración de señales de fuerza y par (HPI) en la observación, lo que permite al modelo tener en cuenta información háptica durante la ejecución.
- Soporte para acciones bimanuales (la tarea t2_push_button usa ambos brazos en el espacio 17-DoF).
- Entrenamiento offline con datos de simulación, sin necesidad de teleoperación en tiempo real.
- Compatible con la librería `lerobot` y con el framework XLeRobot (hardware de bajo coste, doble brazo móvil).

## Casos de uso

- Automatización de una cafetería o bar: el modelo puede gestionar la secuencia completa de preparación y servicio, desde colocar la taza hasta pulsar el botón de la máquina, usando la ventana de acción de 100 pasos para planificar movimientos suaves.
- Manipulación bimanual en entornos domésticos: la variante 17-DoF permite coordinar ambos brazos para tareas como empujar un botón mientras se sujeta una bandeja, gracias a que la acción completa incluye todas las articulaciones.
- Investigación en aprendizaje por imitación: el repositorio sirve como banco de pruebas para comparar el efecto del espacio de acción y del tipo de observación (fuerza vs visión) sobre el error de predicción, útil para diseñar experimentos controlados.
- Desarrollo de políticas transferibles a hardware real: aunque este modelo está entrenado en simulación, su estructura (ACT + HPI) es la misma que la de los modelos reales del proyecto, lo que facilita el estudio de la brecha sim-to-real.
- Evaluación de sobreajuste en ACT: los barridos de pasos (step sweeps) permiten seleccionar el checkpoint óptimo, algo crítico cuando se entrena con pocas episodios (~50) y muchos pasos (100k), como se advierte en la model card.
- Integración en pipelines de robótica con ROS o frameworks similares: al ser un modelo `lerobot`, puede cargarse mediante `PreTrainedPolicy.from_pretrained` y usarse para inferencia en tiempo real, siempre que se disponga de la rama `hpi_act`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) porque se trata de un modelo de robótica, no de lenguaje. La model card incluye una comparación interna entre los espacios de acción 17-DoF y 6-DoF, medida como error de predicción de acciones sobre los mismos 6 articulaciones del brazo actuante. Los resultados se resumen en la siguiente tabla (valores positivos indican menor error para 17-DoF):

| Conjunto | n | Media Δ | IC 95% |
|---|---|---|---|
| Simulación, 1 cámara | 12 | +4.2% | [−5.1%, +13.5%] |
| Real, 2 cámaras | 10 | +9.4% | [−5.2%, +23.9%] |
| Combinado | 22 | +6.5% | [−1.7%, +14.7%] |

Todos los intervalos de confianza contienen el cero, y 6-DoF gana en 11 de 22 pares, por lo que no hay diferencia estadísticamente significativa entre ambos espacios de acción. El autor recomienda usar 17-DoF por razones de despliegue, no por precisión. No hay datos de éxito en tarea (task success) porque las políticas son offline y no se han evaluado en el robot.

## Requisitos de hardware

- Tamaño del repositorio: 12.4 GB en total (incluye 12 carpetas con checkpoints y barridos de pasos). Cada modelo individual es más pequeño, pero no se especifica el peso exacto.
- VRAM estimada para inferencia: no disponible. Dado que ACT es una arquitectura relativamente ligera (típicamente decenas de millones de parámetros), es probable que quepa en GPUs consumer (p. ej., RTX 3060 o superior), pero no hay datos confirmados.
- GPU recomendadas: el entrenamiento se realizó en RTX PRO 6000 Blackwell y RTX 5090, por lo que se asume que la inferencia puede ejecutarse en GPUs de gama alta o media. No se proporcionan requisitos mínimos.
- Opciones de despliegue: compatible con la librería `lerobot` (carga mediante `ACTPolicy.from_pretrained`). No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de otros desarrolladores para la misma tarea (automatización de cafetera con XLeRobot). El propio proyecto publica otros tres repositorios que forman parte de la misma cuadrícula de experimentos, y que pueden considerarse alternativas dentro del mismo ecosistema:

| Repositorio | Dominio | Método | Diferencia clave |
|---|---|---|---|
| `xlerobot-coffee-model-sim-a-vision-pos` | Simulación | Método A (visión+posición) | Observación basada en visión y posición, sin fuerza |
| `xlerobot-coffee-model-real-a-vision-pos` | Real | Método A (visión+posición) | Entrenado con datos reales, 2 cámaras |
| `xlerobot-coffee-model-real-b-force` | Real | Método B (fuerza) | Entrenado con datos reales, incluye fuerza |

La comparación entre estos modelos no se ha publicado en la model card, salvo la advertencia de que `t2_push_button` con Método B tiene un error ~10 veces mayor que con Método A en ambos espacios de acción, lo que sugiere un problema específico de esa tarea con el enfoque de fuerza.

## Limitaciones y advertencias

- Políticas offline sin evaluación en robot: no hay números de éxito en tarea real; el error de predicción de acciones no garantiza un buen comportamiento en lazo cerrado.
- Comparación 1 cámara vs 2 cámaras no controlada: el conjunto de datos de 2 cámaras tiene 5–6 veces más episodios que el de 1 cámara, por lo que la variable "número de cámaras" está confundida con el tamaño del dataset.
- No existen datos de simulación con 2 cámaras, lo que impide leer la brecha sim-to-real en esa configuración.
- Sobreajuste probable: 100k pasos sobre ~50 episodios equivalen a ~90–110 épocas; se recomienda usar el barrido de pasos para seleccionar el checkpoint, no asumir que el último es el mejor.
- Problema específico en `t2_push_button` con Método B: el error es ~10 veces mayor que en Método A en ambos espacios de acción; los resultados de fuerza para esa tarea deben tratarse como sospechosos hasta que se comprenda la causa.
- Requiere la rama `Coffee_Automata` / `hpi_act` del proyecto para instanciarse; sin ella, la carga fallará.
- No se proporcionan métricas de rendimiento en tareas de lenguaje o razonamiento; es un modelo exclusivamente robótico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-sim-b-force
- Modelo complementario (simulación, Método A): https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-sim-a-vision-pos
- Modelo real con Método A: https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-a-vision-pos
- Modelo real con Método B: https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-b-force
- Proyecto XLeRobot (GitHub): https://github.com/Vector-Wangel/XLeRobot
- Documentación de XLeRobot: https://xlerobot.readthedocs.io/en/latest/
