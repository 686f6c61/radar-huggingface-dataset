# grimriper43345/motor-bench-1

## Resumen

motor-bench-1 es una política de robótica basada en ACT (Action Chunking Transformer) entrenada para el brazo seguidor SO-101. El modelo resuelve una tarea concreta de pick-and-place: recoger un pequeño motor paso a paso desde posiciones aleatorias sobre una mesa y depositarlo en una zona objetivo fija marcada con cinta. Lo desarrolla el usuario grimriper43345 y se publica bajo la librería LeRobot, dentro del ecosistema de Hugging Face para aprendizaje por imitación.

El modelo no es un modelo de lenguaje ni un transformer generativo de texto: es una política visomotora que mapea observaciones (dos cámaras RGB de 640×480 más el estado articular) a acciones de control a 30 Hz. Con 51,7 millones de parámetros totales y un backbone ResNet18 inicializado con ImageNet, se entrenó con 120 demostraciones de teleoperación (73.637 fotogramas, unos 41 minutos) usando la receta por defecto de ACT en LeRobot 0.7.0.

Su relevancia es la de un artefacto de referencia para quien trabaja con SO-101 y LeRobot: documenta de forma explícita la interfaz de observación y acción, el proceso de entrenamiento y los resultados reales de despliegue (3 de 9 ensayos exitosos en la primera puesta en marcha). Es un modelo temprano, de un dataset pequeño y con generalización limitada a un único entorno de laboratorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone ResNet18 |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; chunk de acciones de 100 pasos (3,3 s a 30 Hz) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer de troceado de acciones: codifica las imágenes con una CNN (ResNet18 con pesos de ImageNet) y predice bloques de acciones futuras en lugar de acciones individuales, lo que reduce el error de composición y suaviza el control. En esta configuración se usa chunk_size 100 y n_action_steps 100, es decir, se ejecuta el bloque completo antes de recalcular, con un VAE activado (kl_weight 10) para modelar la multimodalidad de las demostraciones. La entrada son dos cámaras RGB (muñeca y frontal de 640×480) más un vector de estado de 6 dimensiones (cinco articulaciones en grados y apertura de pinza de 0 a 100); la salida son 6 objetivos articulares absolutos en el mismo orden y unidades.

El entrenamiento usó 120 demostraciones exitosas de teleoperación (73.637 fotogramas a 30 fps, aproximadamente 41 minutos) tras descartar un episodio fallido. Se aplicó la receta por defecto de LeRobot 0.7.0: 50.000 pasos, batch de 8, AdamW con lr 1e-5, sin aumento de imagen, alcanzando una pérdida final de entrenamiento de 0,106. El cómputo fue una única RTX 4090 durante aproximadamente 1 h 45 min. La normalización de estado y acción usa media y desviación típica del conjunto de entrenamiento (en los ficheros de procesador), y las imágenes usan media y desviación de ImageNet.

## Capacidades

- Control visomotor de pick-and-place para el brazo SO-101: recogida de un motor paso a paso y colocación en una zona objetivo fija.
- Predicción de bloques de acción de 100 pasos (3,3 s a 30 Hz) con ejecución del chunk completo antes de recalcular.
- Fusión de dos vistas RGB (cámara de muñeca y cámara frontal fija del espacio de trabajo).
- Salida de 6 objetivos articulares absolutos en grados y unidades de pinza, compatible con `so101_follower` y `use_degrees=True`.
- Inferencia en CPU de portátil con cálculo del siguiente chunk en segundo plano (unos 0,35 s por chunk).
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia completa de recogida y colocación de un motor paso a paso sobre una mesa, adecuado para prototipos de manipulación con SO-101 donde la tarea y el entorno están fijados.
- Banco de pruebas de aprendizaje por imitación: sirve como referencia reproducible de la receta ACT de LeRobot 0.7.0 (chunk 100, VAE, ResNet18) para comparar hiperparámetros y curvas de pérdida en tareas similares.
- Validación de pipelines de despliegue en CPU: al inferir en un portátil a ~0,35 s por chunk con cálculo en segundo plano, permite probar la integración de LeRobot y el bucle de control a 30 Hz sin GPU dedicada.
- Docencia y formación en robótica: el modelo card documenta de forma explícita la interfaz de observación y acción, lo que lo convierte en material didáctico para entender el mapeo cámara-estado-acción en ACT.
- Recolección de datos incrementales: al ser un modelo temprano con 120 demostraciones, sirve de línea base para medir la mejora al añadir episodios y comparar tasas de éxito en el mismo montaje.
- Estudio de sensibilidad al punto de vista: dado que es sensible a la posición de la cámara frontal, permite experimentar con variaciones de encuadre y cuantificar su impacto en el éxito de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son de despliegue y evaluación offline:

| Métrica | Resultado |
|---|---|
| Ensayos reales de pick-and-place | 3 de 9 exitosos (primera puesta en marcha, en curso) |
| Latencia de inferencia | ~0,35 s por chunk en CPU de portátil |
| Error offline por articulación | 12–13° de media en chunks de 3,3 s sobre demostraciones no vistas (medido en el modelo hermano de 62 episodios) |
| Pérdida final de entrenamiento | 0,106 |
| Límite de movimiento | 10° por tick de control |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors en un repo de 0,2 GB, la huella es reducida y cabe holgadamente en GPU de consumo.
- GPU recomendadas: RTX 4090 para entrenamiento (usada en el entrenamiento, ~1 h 45 min); para inferencia no se requiere GPU, el autor la ejecutó en CPU de portátil.
- Cabe en GPU de consumo: sí, por tamaño; cualquier GPU con unos pocos GB de VRAM es suficiente, aunque la inferencia documentada es en CPU.
- Opciones de despliegue: LeRobot (`ACTPolicy.from_pretrained` con `PreTrainedConfig` y `make_pre_post_processors`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: ~0,35 s por chunk de 100 acciones en CPU, con el siguiente chunk calculado en segundo plano; control a 30 Hz con movimiento limitado a 10° por tick.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa, el propio autor menciona un "modelo hermano" de 62 episodios usado para la medición offline, pero no se detallan sus especificaciones ni su rendimiento en el brazo real.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| motor-bench-1 | 51,7 M | chunk de 100 acciones | 3/9 en real; 12–13° de error offline | no disponible | Hugging Face (lerobot) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sensibilidad al punto de vista: la cámara frontal del espacio de trabajo debe coincidir con la posición usada en entrenamiento; un cambio de encuadre degrada el rendimiento.
- Generalización muy limitada: un solo objeto, una sola mesa y una sola zona objetivo en un único laboratorio; no se espera que funcione fuera de ese montaje.
- Modelo temprano con dataset pequeño (120 demostraciones); la tasa de éxito real es baja (3/9) y el autor sigue recogiendo datos.
- Riesgo de fallo en la tarea y de movimientos imprecisos: el error offline de 12–13° por articulación es considerable y conviene limitar la velocidad (el autor capa el movimiento a 10° por tick).
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; hay que contactar con el autor antes de usarlo en producción.
- Idiomas no disponibles: al ser una política de control sin interfaz de lenguaje, no aplica soporte multilingüe.
- Sin datos de sesgos ni de alucinación en el sentido de modelos de lenguaje; el riesgo relevante es el fallo físico de la manipulación y la falta de robustez ante cambios de entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grimriper43345/motor-bench-1
- LeRobot (librería y documentación): https://github.com/huggingface/lerobot
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
