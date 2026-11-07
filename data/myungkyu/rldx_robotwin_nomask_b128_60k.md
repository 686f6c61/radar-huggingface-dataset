# Myungkyu/rldx_robotwin_nomask_b128_60k

## Resumen

`rldx_robotwin_nomask_b128_60k` es un checkpoint de ajuste fino (fine-tuning) del modelo de visión-lenguaje-acción (VLA) RLDX-1-PT, desarrollado por el usuario Myungkyu y publicado en Hugging Face. Se trata de un *baseline* "vanilla" para el *leaderboard* de RoboTwin 2.0, un conjunto de referencia de manipulación robótica bimanual. El modelo parte del backbone preentrenado RLWRLD/RLDX-1-PT y se ha entrenado sobre la configuración *co-train* del benchmark: 50 tareas con 50 episodios `demo_clean` cada una, sobre la plataforma Aloha-AgileX en el formato oficial de exportación de LeRobot.

La relevancia de esta ficha es acotada: no es un modelo de propósito general ni un LLM, sino un artefacto de investigación reproducible pensado para servir de referencia en comparaciones de políticas robóticas. Con 6.912.896.320 parámetros (~6,9 mil millones), recibe tres vistas de cámara (cabeza y muñecas izquierda y derecha), un estado articular de 14 dimensiones y una instrucción de tarea en lenguaje natural, y produce 14 objetivos articulares absolutos.

El entrenamiento se realizó con batch de 128 durante 60.000 pasos, sin enmascaramiento de ruido en la dimensión de *padding* (`action_noise_mask_dim=0`) y con *state dropout* de 0,5. El repositorio ocupa 165,9 GB e incluye checkpoints intermedios en los pasos 15.000, 30.000 y 45.000, además del final. La licencia no está declarada en la información disponible, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (VLA; vision-lenguaje-accion), video length 4 / stride 2, tres vistas de camara, horizonte de accion 50 |
| Parametros totales | 6.912.896.320 (~6,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de tarea son texto; no se declara cobertura idiomatica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de ajuste | TianxingChen/RoboTwin2.0 (50 tareas x 50 episodios `demo_clean`, Aloha-AgileX) |
| Entradas | imagenes de cabeza + munecas izquierda/derecha, estado articular 14-d, instruccion de tarea |
| Salidas | 14 objetivos articulares absolutos |
| Pasos de entrenamiento | 60.000 (batch 128) |
| Tamano del repositorio | 165,9 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del backbone RLDX-1-PT, una arquitectura de visión-lenguaje-acción que procesa secuencias de vídeo (longitud 4 con *stride* 2), tres flujos de cámara simultáneos y una instrucción textual, y emite un horizonte de acción de 50 pasos en el espacio articular de 14 dimensiones del robot Aloha-AgileX. El ajuste se realizó sobre el código `RLWRLD/RLDX` en la rama `myungkyu/jitter-patch` (commit 21f674b4), con el backbone y el tokenizador referenciados por *hub id* en la configuración.

El entrenamiento usa el conjunto RoboTwin 2.0 en su configuración *co-train* estándar del *leaderboard*: 50 tareas con 50 episodios `demo_clean` cada una, exportados oficialmente desde LeRobot. Se aplicaron dos decisiones de diseño destacables: desactivar el enmascaramiento de ruido en la dimensión de *padding* (`action_noise_mask_dim=0`) y aplicar *state dropout* de 0,5, lo que obliga al modelo a depender más de las observaciones visuales y de la instrucción que del estado articular de entrada. No se especifica en la información disponible el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en políticas VLA, pero no confirmado).

## Capacidades

- Generación de acciones motoras: produce 14 objetivos articulares absolutos para un robot bimanual Aloha-AgileX a partir de observaciones visuales y estado.
- Percepción visual multivista: procesa simultáneamente cámara de cabeza y cámaras de muñeca izquierda y derecha.
- Comprensión de instrucciones en lenguaje natural: condiciona la política en una instrucción de tarea textual.
- Planificación de horizonte medio: emite secuencias de acción de hasta 50 pasos.
- Ejecución de tareas de manipulación bimanual: entrenado sobre 50 tareas del benchmark RoboTwin 2.0.
- No se declara soporte de *tool calling*, *function calling*, agentes multi-paso, razonamiento matemático, generación de código ni modalidades de audio.
- No se declara cobertura multilingüe explícita.

## Casos de uso

- Referencia de comparación en el leaderboard de RoboTwin 2.0: sirve como *baseline* "vanilla" contra el que medir variantes con enmascaramiento de ruido, *dropout* u otras modificaciones del pipeline de entrenamiento.
- Investigación en políticas VLA bimanuales: permite reproducir el ajuste sobre Aloha-AgileX con el formato de exportación de LeRobot y analizar el efecto de `action_noise_mask_dim=0` y del *state dropout* de 0,5.
- Ablación de hiperparámetros: los checkpoints intermedios en los pasos 15.000, 30.000 y 45.000 permiten estudiar la curva de aprendizaje y la estabilidad del entrenamiento sin reentrenar.
- Evaluación de robustez ante pérdida de estado: el *state dropout* alto hace del modelo un candidato para estudiar políticas que dependen principalmente de visión e instrucción, útil en escenarios con sensores articulares ruidosos.
- Prototipado de manipulación en simulación: integración en entornos RoboTwin para validar pipelines de evaluación antes de trasladar políticas a hardware real.
- Docencia y divulgación: ejemplo reproducible de flujo completo (dataset, exportación LeRobot, ajuste supervisado, checkpoints intermedios con SHA256SUMS) para cursos de robótica con aprendizaje profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito por tarea ni comparaciones numéricas con otras políticas del *leaderboard* de RoboTwin 2.0.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~6,9 mil millones de parámetros en safetensors ocupa aproximadamente 13,8 GB en fp16 (sin contar el codificador visual, el tokenizador y las activaciones); en fp32 rondaría los 27,6 GB. Estas cifras son estimaciones por tamaño de pesos, no datos publicados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar viabilidad en GPUs de 24 GB o más en fp16, pero no está confirmado.
- ¿Cabe en GPU de consumo? No confirmado. En fp16 probablemente sí en tarjetas de 24 GB (RTX 3090/4090) según el recuento de parámetros, pero el pipeline VLA completo (tres cámaras, secuencias de vídeo) puede elevar el consumo de memoria.
- Opciones de despliegue: no se documentan en la model card. El código de referencia es `RLWRLD/RLDX` (rama `myungkyu/jitter-patch`, commit 21f674b4); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para políticas de acción robótica.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 165,9 GB; puede reducirse descargando solo el checkpoint final con `ignore_patterns="checkpoints/*"` o un único paso intermedio con `allow_patterns="checkpoints/step-5000/*"`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Myungkyu/rldx_robotwin_nomask_b128_60k` | ~6,9 mil millones | no disponible | VLA bimanual RoboTwin 2.0 | no disponible | Hugging Face (21 descargas) |
| `Myungkyu/rldx2_rldx_robotwin_nomask_b128_60k` | no disponible | no disponible | Baseline VLA para el proyecto RLDX-2, mismo *setting* RoboTwin 2.0 | no disponible | Hugging Face |
| `RLWRLD/RLDX-1-PT` (modelo base) | no disponible | no disponible | Backbone VLA preentrenado | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: es una política de acción para Aloha-AgileX entrenada en 50 tareas de RoboTwin 2.0; no es un modelo de propósito general ni un LLM.
- Licencia no declarada: la ausencia de licencia impide asumir permisos de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce qué lenguas aceptan las instrucciones de tarea.
- Riesgo de sobreajuste al simulador: al entrenarse solo con episodios `demo_clean` exportados de LeRobot, el rendimiento en hardware real o con condiciones visuales distintas no está garantizado.
- Sin métricas publicadas: no hay tasas de éxito ni comparaciones numéricas que permitan evaluar su calidad frente a otros *baselines*.
- Sesgos: no documentados; en robótica, los sesgos provienen de la distribución de tareas y demostraciones del dataset, que aquí se limita a 50 tareas.
- Riesgo de alucinación de acciones: como política generativa, puede producir trayectorias no válidas o inseguras fuera de la distribución de entrenamiento; requiere supervisión y límites de seguridad en el robot.
- Checkpoints sin estado del optimizador: no permiten reanudar el entrenamiento de forma exacta, solo inferencia o evaluación.
- Repositorio de gran tamaño (165,9 GB): conviene descargar selectivamente para evitar consumo innecesario de almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/rldx_robotwin_nomask_b128_60k
- Variante RLDX-2: https://huggingface.co/Myungkyu/rldx2_rldx_robotwin_nomask_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Dataset RoboTwin 2.0: https://huggingface.co/datasets/TianxingChen/RoboTwin2.0
- Código de referencia: https://github.com/RLWRLD/RLDX (rama `myungkyu/jitter-patch`, commit 21f674b4)
