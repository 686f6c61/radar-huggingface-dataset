# edge-inference/cohab-settable-pi05

## Resumen

CoHab SetTable skills (pi0.5) es un conjunto de políticas de robótica para la tarea SetTable del benchmark MS-HAB, ejecutadas sobre un robot Fetch en el simulador ManiSkill3. Lo desarrolla el usuario edge-inference y se publica bajo licencia BSD 3-Clause con copyright de NVIDIA Corporation. El modelo resuelve el problema de encadenar habilidades de pick-and-place (coger y colocar objetos) dentro de una tarea doméstica completa: abrir nevera o cajón, coger la manzana o el bol, llevarla a la mesa, depositarla y cerrar.

Técnicamente se compone de dos checkpoints de política pi0.5 (un modelo visión-lenguaje-acción, VLA) entrenados desde cero con LeRobot sobre demostraciones de simulador: uno para la habilidad de pick y otro para la de place. Cada política consume la cámara RGB de cabeza, la imagen de profundidad de cabeza y la cámara RGB de muñeca, además de propriocepción (posiciones articulares, pinza, pan y tilt de cabeza), sin recibir pose de objeto ni de objetivo. Las políticas se encadenan con un planificador basado en Qwen3.5-9B y un juez de resultados basado en imagen, junto con las políticas RL de navigate/open/close publicadas por MS-HAB.

Es relevante porque documenta con detalle el rendimiento de un pipeline VLA en una tarea de manipulación de largo horizonte en simulación, incluyendo datos de reintento y estados de arranque dentro de la cadena completa, y porque expone las tasas de éxito reales del encadenamiento (0,94 objetos colocados por cadena de dos) en lugar de solo métricas de subtarea aislada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (política visión-lenguaje-acción, VLA) sobre LeRobot |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD 3-Clause (Copyright (c) 2026, NVIDIA CORPORATION) |
| Formato de pesos | safetensors (repo de 18,8 GB; checkpoints LeRobot bajo `<checkpoint>/pretrained_model`) |

## Arquitectura y entrenamiento

El modelo se compone de dos políticas pi0.5 de LeRobot entrenadas desde cero sobre demostraciones de simulador. Cada checkpoint se carga mediante `PI05Policy.from_pretrained` indicando el subfolder correspondiente (`pi05_pick_trim15_dp_mix3sc/final/pretrained_model` o `pi05_place_trim15_p_mixsc/final/pretrained_model`). Las políticas toman como entrada la cámara RGB de cabeza, la imagen de profundidad de cabeza, la cámara RGB de muñeca y propriocepción (posiciones articulares, pinza, pan y tilt de cabeza); no reciben pose de objeto ni de objetivo. El espacio de acciones sigue el Fetch de MS-HAB (`pd_joint_delta_pos`, 13 acciones: 7 de brazo, pinza, pan/tilt de cabeza, torso y base). La arquitectura interna de pi0.5 (número de parámetros, mecanismo de atención, contexto) no se detalla en la información disponible.

El entrenamiento usa batch 64 y recorta los primeros 15 fotogramas de cada demostración (corresponden al alcance y sujeción a plena velocidad del profesor, que la política no debe imitar). El checkpoint de pick se entrena 70K pasos con demostraciones de pick de MS-HAB SetTable, demostraciones reproducidas desde estados registrados al inicio de pasos de pick dentro de la cadena completa, y demostraciones desde estados de reintento (estado tras un pick fallido y un reset de brazo). El checkpoint de place se entrena 50K pasos con demostraciones de place de MS-HAB SetTable más demostraciones desde estados de arranque de cadena. Se publican solo pesos, sin estado del optimizador. No se especifica si hubo RLHF, DPO ni la composición exacta del dataset más allá de lo descrito.

## Capacidades

- Manipulación robótica de pick-and-place: coger la manzana o el bol y colocarlos en la mesa, con éxito medido en entornos de subtarea de MS-HAB.
- Percepción multimodal: RGB de cabeza, profundidad de cabeza y RGB de muñeca, más propriocepción.
- Política sin pose de objeto ni de objetivo: opera solo con observaciones visuales y propioceptivas.
- Integración en cadena de tareas: se encadena con un planificador Qwen3.5-9B (selección de siguiente paso desde un menú) y un juez de resultados basado en imagen.
- Colaboración con políticas RL externas de MS-HAB para navigate, open y close.
- Reintentos: el checkpoint de pick incorpora datos de estados de reintento, lo que mejora los reintentos tras un fallo.
- No cubre la variante de dos robots del benchmark.
- No se documentan capacidades de tool calling, agentes genéricos, multilingüismo ni modos de pensamiento; es un modelo específico de robótica.

## Casos de uso

- Investigación en manipulación de largo horizonte: usar las políticas de pick y place como componentes dentro de la cadena SetTable de MS-HAB para estudiar el encadenamiento de habilidades y la propagación de errores en tareas de varios pasos.
- Evaluación de planificadores VLA: integrar el planificador Qwen3.5-9B y el juez de imagen con estas políticas para medir cómo la selección de pasos afecta la tasa de éxito final (0,94 objetos por cadena de dos en 500 planes retenidos).
- Benchmarking de políticas de imitación: comparar pi0.5 entrenado desde cero contra otras políticas sobre las mismas demostraciones y entornos de subtarea de MS-HAB, usando las tasas de éxito publicadas (pick val 59,5/54,0; place val 78,5/77,5).
- Estudio de datos de reintento: analizar el efecto de añadir demostraciones desde estados de reintento y estados de arranque de cadena, que en este modelo elevó los reintentos de pick del 15 % al 20 % sin mejorar el primer intento.
- Reproducción de experimentos en simulación: cargar los checkpoints con LeRobot y el código de github.com/edge-inference/partnr-maniskill para replicar el benchmark de cadena sobre ManiSkill3 con un robot Fetch.
- Desarrollo de primitivas complementarias: usar estas políticas como referencia para construir o evaluar primitivas de reset de brazo, navegación o apertura/cierre en pipelines propios.
- Análisis de robustez del juez de resultados: estudiar el desacuerdo entre el juez de imagen y el simulador (acepta aproximadamente uno de cada cinco places que el simulador rechaza) para calibrar sistemas de verificación.

## Benchmarks y rendimiento

Tasas de éxito (%) sobre 200 episodios por celda en entornos de subtarea de MS-HAB, dos pasos ejecutados por predicción; éxito de place según `zone` (objeto en cualquier punto de la mesa).

| Habilidad | Checkpoint | Val manzana / bol | Train manzana / bol | Arranque de cadena manzana / bol |
|---|---|---|---|---|
| pick | `pi05_pick_trim15_dp_mix3sc/final` | 59,5 / 54,0 | 38,0 / 53,5 | 45,0 / 77,5 |
| place | `pi05_place_trim15_p_mixsc/final` | 78,5 / 77,5 | 81,5 / 82,0 | 49,0 / 70,0 |

Resultados en la tarea completa (500 planes retenidos, planificador + juez, reset de brazo scriptado tras fallo, un robot, 2026-11-18): 0,94 objetos colocados por cadena de dos; al menos un objeto en el 66,8 % de las cadenas; ambos objetos en el 27,6 %. El pick tiene éxito en el 67 % de primeros intentos, 20 % de segundos y 8 % de terceros. El place es aceptado por el juez en el 89 % de intentos y confirmado por el simulador en el 71 %. Con el pick anterior (mezcla de datos de dos vías) los mismos planes dieron 0,86 objetos por cadena.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo pesa 18,8 GB y contiene dos checkpoints; el tamaño de cada política individual no se detalla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante LeRobot (`PI05Policy.from_pretrained`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoHab SetTable skills (pi0.5) | no disponible | no disponible | 0,94 objetos/cadena; pick val 59,5/54,0; place val 78,5/77,5 | BSD 3-Clause | Hugging Face (edge-inference/cohab-settable-pi05) |
| Políticas RL navigate/open/close de MS-HAB | no disponible | no disponible | no disponible | no disponible | Publicadas por MS-HAB (referenciadas, no comparadas numéricamente aquí) |
| Otras políticas pi0.5 de LeRobot | no disponible | no disponible | no disponible | no disponible | Disponibles en el ecosistema LeRobot (sin datos comparativos en la información proporcionada) |

No se dispone de datos comparativos suficientes con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre un robot; la variante de dos robots del benchmark MS-HAB no está soportada por estos pesos.
- La navegación, apertura y cierre no son aprendidos en este repo: provienen de políticas RL publicadas por MS-HAB; el reset de brazo es una primitiva scriptada basada solo en propriocepción.
- El juez de resultados acepta aproximadamente uno de cada cinco places que el simulador rechaza (objeto fuera de la mesa objetivo o presupuesto de fuerza excedido), lo que puede inflar métricas si se usa sin verificación del simulador.
- El primer intento de pick tiene éxito solo en el 67 % de los casos y decae fuertemente en reintentos (20 % en el segundo, 8 % en el tercero).
- Los resultados en arranque de cadena son notablemente inferiores a los de validación estándar (por ejemplo, place 49,0/70,0 frente a 78,5/77,5), lo que indica sensibilidad al estado inicial.
- Entrenado únicamente en simulación (ManiSkill3); no se documenta transferencia a robot real.
- Solo se publican pesos, sin estado del optimizador, lo que limita la reproducción exacta del entrenamiento.
- No se documentan sesgos, idiomas ni riesgos de alucinación en el sentido de modelos de lenguaje; el modelo no es de texto general.
- Licencia BSD 3-Clause: permite uso comercial con atribución y sin endoso; verificar los términos completos antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/edge-inference/cohab-settable-pi05
- Código, wrappers de entorno y benchmark de cadena: https://github.com/edge-inference/partnr-maniskill
- Repositorio LeRobot (librería de carga): no disponible en la información proporcionada
- Benchmark MS-HAB: no disponible enlace directo en la información proporcionada
- ManiSkill3: no disponible enlace directo en la información proporcionada
