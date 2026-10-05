# LippyRobotics/SymmGrid-PegInsertion

## Resumen

SymmGrid-PegInsertion es un checkpoint de política de aprendizaje por refuerzo entrenada para la tarea real de inserción de clavija (peg insertion) con un manipulador Franka. Lo publica LippyRobotics y está asociado al artículo "SymmGrid: Super-Scaling On-Robot Learning with Parallelized Symmetries and Egocentric-Exocentric Visual Perception" (Everett, Gunter, Vander Stelt, Ruiz-Martinez, Hull y Rojas, arXiv:2607.26985). No es un modelo de lenguaje ni un modelo generativo de propósito general: es una política de control robótico entrenada en el mundo real sobre el framework SERL.

El problema que aborda es la baja eficiencia muestral del aprendizaje por refuerzo sobre robot real. SymmGrid propone un marco de aumento de trayectorias a nivel de trayectoria que aplica transformaciones de simetría paralelizadas sobre las experiencias estado-acción, generando equivalentes simétricos válidos que amplían la diversidad efectiva del búfer de repetición y aceleran el aprendizaje de la política. Las observaciones combinan propiocepción del robot y observaciones visuales, con percepción visual egocéntrica y exocéntrica.

El checkpoint corresponde a los experimentos de peg insertion reportados en el artículo y se libera junto con otros checkpoints comparativos (la línea base SERL Peg Insertion y las variantes LatticeSym Rx, Ry y Rxy). Su relevancia es fundamentalmente de investigación: permite reproducir los experimentos, analizar el efecto del aumento por simetría y comparar contra alternativas. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de manipulación robótica basada en Soft Actor-Critic (actor-crítico, aprendizaje por refuerzo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la política consume observaciones de propiocepción y visión por paso de tiempo |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (política de control robótico; el repositorio no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoint de política; el formato concreto no se especifica en la model card) |

## Arquitectura y entrenamiento

Se trata de una política de control para manipulación robótica construida sobre Soft Actor-Critic, dentro del marco de aprendizaje por refuerzo en robot real SERL (rail-berkeley/serl). Las entradas son observaciones multimodales: propiocepción del robot y observaciones visuales, con un esquema de percepción visual descrito en el artículo como egocéntrico y exocéntrico. El robot utilizado es un manipulador Franka. No se especifican en la información disponible el número de parámetros, la topología exacta de las redes actor y crítica ni la resolución o frecuencia de las observaciones.

La innovación principal del trabajo es SymmGrid, un framework de aumento a nivel de trayectoria: se aplican transformaciones de simetría paralelizadas a las experiencias estado-acción para producir equivalentes simétricos válidos, lo que incrementa la diversidad efectiva del búfer de repetición sin necesidad de recolectar más datos reales. El entrenamiento es on-robot, es decir, sobre el propio robot físico. La model card no detalla el número de pasos de entrenamiento, la semilla, el tiempo de reloj de pared ni la composición del dataset, y remite explícitamente al artículo para interpretar el rendimiento del checkpoint junto con la configuración experimental.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea de inserción de clavija (peg insertion) con un manipulador Franka, a partir de observaciones de estado y visión.
- Aprendizaje por refuerzo en robot real: política entrenada con datos on-robot, no solo en simulación.
- Percepción visual multimodal: combina propiocepción y observaciones visuales egocéntricas y exocéntricas.
- Aumento por simetría: el marco SymmGrid permite generar experiencias simétricas equivalentes para acelerar el aprendizaje, capacidad del framework asociado al checkpoint.
- Reproducibilidad de experimentos: sirve como checkpoint de referencia para replicar los resultados del artículo.
- Comparación con líneas base: puede contrastarse con SERL Peg Insertion y con las variantes LatticeSym Rx, Ry y Rxy liberadas por los mismos autores.
- No soporta tool calling, function calling, agentes conversacionales, razonamiento multi-paso simbólico, visión genérica de imágenes ni audio: no es un modelo de lenguaje ni un VLM.

## Casos de uso

- Reproducción de experimentos académicos: cargar este checkpoint junto con el framework SERL y la configuración del artículo para replicar las curvas de aprendizaje de la tarea de peg insertion y verificar los resultados publicados.
- Estudio del aumento por simetría: comparar este checkpoint con las variantes LatticeSym Rx, Ry y Rxy y con la línea base SERL para aislar la contribución de cada transformación de simetría al rendimiento final de la política.
- Investigación en eficiencia muestral: usar el checkpoint como punto de partida para medir cuántas interacciones reales se necesitan para alcanzar un umbral de éxito determinado, que es el eje central del artículo.
- Automatización de ensamblaje por inserción: aplicar la política a tareas de inserción de precisión (peg-in-hole) en celdas de montaje, siempre que el entorno de control, el hardware y los procedimientos de seguridad sean compatibles con la configuración usada en el entrenamiento.
- Transferencia a tareas de manipulación relacionadas: emplear los pesos como inicialización para fine-tuning en tareas de inserción o ensamblaje con geometrías distintas, aprovechando que la política ya codifica comportamiento de aproximación y alineación.
- Docencia y formación en robótica: utilizar el checkpoint como ejemplo reproducible de un pipeline completo de RL on-robot con SERL, útil en cursos de aprendizaje por refuerzo aplicado y robótica de manipulación.
- Evaluación comparativa de algoritmos de RL robótico: integrar el checkpoint en un banco de pruebas que enfrente métodos de aumento de datos, métodos de sim-to-real y variantes de SAC bajo idéntico presupuesto de muestras reales.
- Análisis de robustez ante variaciones visuales: someter la política a cambios de iluminación, fondos u oclusiones parciales para caracterizar la sensibilidad del esquema de percepción egocéntrica-exocéntrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica expresamente que los datos específicos del checkpoint (semilla de entrenamiento, paso de entrenamiento, tiempo de reloj de pared y rendimiento de evaluación) deben interpretarse junto con la configuración experimental reportada en el artículo arXiv:2607.26985, que es la fuente a la que hay que acudir para obtener cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La información proporcionada no especifica el tamaño del checkpoint ni la memoria necesaria.
- GPU recomendadas: no disponibles. La model card no enumera GPU ni aceleradores concretos.
- Viabilidad en GPU de consumo: no disponible. No se puede afirmar si cabe en una GPU de gama consumer sin datos de tamaño del modelo.
- Plataforma robótica requerida: manipulador Franka, junto con el entorno de control robótico, los procedimientos de seguridad y la compatibilidad de software y hardware usados por el modelo, tal como advierte el autor.
- Opciones de despliegue: el entrenamiento y la ejecución se apoyan en el framework SERL (https://github.com/rail-berkeley/serl). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que son herramientas de inferencia de modelos de lenguaje y no aplican a esta política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los únicos modelos comparables identificados en la información disponible son los checkpoints de la misma familia y del mismo artículo, liberados por separado.

| Modelo | Framework | Tarea | Política | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| SymmGrid-PegInsertion | SymmGrid / SERL | Peg insertion real | Soft Actor-Critic | Apache 2.0 | HuggingFace (LippyRobotics) | no disponible |
| SERL Peg Insertion baseline | SERL | Peg insertion real | Soft Actor-Critic | no disponible | Checkpoint liberado aparte | no disponible |
| LatticeSym Rx | LatticeSym / SERL | Peg insertion real | Soft Actor-Critic | no disponible | Checkpoint liberado aparte | no disponible |
| LatticeSym Ry | LatticeSym / SERL | Peg insertion real | Soft Actor-Critic | no disponible | Checkpoint liberado aparte | no disponible |
| LatticeSym Rxy | LatticeSym / SERL | Peg insertion real | Soft Actor-Critic | no disponible | Checkpoint liberado aparte | no disponible |

No se dispone de datos de parámetros, contexto ni métricas comparativas para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada específicamente para la tarea de inserción de clavija; no es un modelo general y no se espera que generalice a tareas de manipulación arbitrarias sin reentrenamiento o fine-tuning.
- Dependencia del hardware: requiere un manipulador Franka y un entorno de control compatible con la configuración del entrenamiento; desplegarla en otro robot invalida las suposiciones de calibración y dinámica.
- Riesgo para la integridad física: al ser una política para robot real, cualquier despliegue necesita procedimientos de seguridad, límites de fuerza y supervisión; los fallos de la política no son errores de texto, sino movimientos físicos.
- Dependencia de las suposiciones de simetría: el aumento por simetría solo es válido si las transformaciones aplicadas respetan la tarea y la geometría del entorno; simetrías mal definidas pueden introducir experiencias incorrectas en el búfer.
- Sensibilidad al dominio visual: cambios en iluminación, cámara, fondo o calibración pueden degradar el rendimiento, dado que las observaciones incluyen visión egocéntrica y exocéntrica.
- Ausencia de métricas publicadas en el repositorio: no hay cifras de tasa de éxito ni de tiempo de entrenamiento en la model card, lo que dificulta evaluar el checkpoint de forma aislada.
- Sesgos: no se documentan análisis de sesgo; en robótica el concepto aplica en términos de sesgo hacia las condiciones de recogida de datos (posiciones iniciales, objetos y escenas vistas durante el entrenamiento).
- Alucinación: no aplica en el sentido de modelos generativos de lenguaje, pero sí existe el riesgo análogo de confianza excesiva de la política fuera de la distribución de estados observada.
- Idiomas: no aplica; no hay capacidades lingüísticas ni multilingües.
- Licencia: Apache 2.0 permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el archivo NOTICE si existe, y sin garantías por parte de los autores. Verificar la licencia de las dependencias (SERL y el software de control del robot) antes de un despliegue comercial.
- Fuentes de búsqueda no fiables: los resultados de la búsqueda web realizada no contenían información técnica relevante sobre el modelo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LippyRobotics/SymmGrid-PegInsertion
- Artículo (arXiv): https://arxiv.org/abs/2607.26985
- Página del artículo en HuggingFace Papers: https://huggingface.co/papers/2607.26985
- Framework SERL: https://github.com/rail-berkeley/serl
- Sitio del proyecto SymmGrid: https://symmgrid-robot.github.io
- Cita del artículo: Everett, G., Gunter, B., Vander Stelt, R., Ruiz-Martinez, C., Hull, B. y Rojas, J. (2026). "SymmGrid: Super-Scaling On-Robot Learning with Parallelized Symmetries and Egocentric-Exocentric Visual Perception". arXiv:2607.26985, cs.RO.
