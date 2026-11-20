# DecentVLA/groot_lpt_int8_fedavg_4task_local

## Resumen

`groot_lpt_int8_fedavg_4task_local` es un checkpoint de pesos de un modelo de visión-lenguaje-acción (VLA) entrenado mediante aprendizaje federado con cuantización INT8. El autor es `DecentVLA`, un perfil de Hugging Face sin documentación pública adicional. El modelo parte de la familia GR00T (NVIDIA Isaac GR00T) y se ha entrenado con el algoritmo FedAvg sobre cuatro clientes, cada uno asociado a una tarea distinta del benchmark LIBERO, durante 50 rondas de agregación. El resultado es un único conjunto de pesos del servidor (`checkpoints/server_round_0050.pt`) que representa el modelo global tras la última ronda.

El interés de esta publicación es acotado pero específico: documenta un experimento de entrenamiento federado reproducible (partición `explicit_tasks`, semilla 42, ejecución local entre el 21 y el 24 de octubre de 2026) sobre un VLA cuantizado a INT8. No se trata de un modelo de propósito general ni de un lanzamiento oficial, sino de un artefacto de investigación que sirve para comparar estrategias de agregación federada en robótica. El autor advierte explícitamente de que no debe confundirse con otra ejecución similar (`groot_n17_libero_4suite_int8_fedavg`) que usa una suite LIBERO por cliente y se entrenó en 4x GH200.

La información disponible es muy limitada: no hay model card con especificaciones de arquitectura, número de parámetros, contexto, idiomas ni licencia. El repositorio ocupa 14,6 GB y contiene únicamente pesos en formato safetensors/PT. A continuación se recoge lo que puede afirmarse con rigor y se marca como "no disponible" todo lo que no consta en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de la familia GR00T, VLA; detalles no publicados) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 (según el nombre del modelo y la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y `.pt` (checkpoint `server_round_0050.pt`) |

## Arquitectura y entrenamiento

El nombre del modelo indica que se trata de un derivado de GR00T, la familia de modelos de visión-lenguaje-acción de NVIDIA orientada a control robótico, cuantizado a INT8. Sin embargo, la model card no detalla la arquitectura interna (backbone visual, encoder de lenguaje, cabeza de acciones, número de capas o dimensión oculta), por lo que no es posible confirmar si se trata de un transformer estándar, de una variante con atención lineal o de un diseño híbrido. Tampoco se especifican los datos de preentrenamiento ni el volumen de tokens utilizados.

El entrenamiento se realizó con aprendizaje federado y agregación FedAvg sobre cuatro clientes. Cada cliente corresponde a una tarea distinta del benchmark LIBERO, con una partición de datos basada en `explicit_tasks` y semilla 42. Se ejecutaron 50 rondas de agregación en local entre el 21 y el 24 de octubre de 2026. Solo se conservan los pesos finales del servidor (`server_round_0050.pt`); las rondas 1 a 49 y los estados de reanudación de los clientes no se guardaron. No se documenta si hubo ajuste fino con RLHF/DPO ni qué innovaciones técnicas (decodificación especulativa, atención lineal, etc.) incorpora el modelo.

## Capacidades

- Control robótico basado en instrucciones en lenguaje natural y observaciones visuales, propio de la familia GR00T (VLA).
- Ejecución de tareas del benchmark LIBERO, según la partición `explicit_tasks` empleada en el entrenamiento federado.
- Inferencia cuantizada a INT8, lo que reduce el coste de memoria y cómputo frente a los pesos en precisión completa.
- No consta soporte de tool calling, function calling, agentes multi-paso, modo "thinking", audio ni otras capacidades generales.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en aprendizaje federado para robótica: el checkpoint permite reproducir y comparar la agregación FedAvg de 50 rondas sobre cuatro tareas LIBERO, sirviendo como línea base frente a otras estrategias de agregación.
- Evaluación de cuantización INT8 en modelos VLA: al ser un modelo ya cuantizado, es útil para medir la pérdida de precisión en tareas de manipulación respecto a los pesos originales en FP16/BF16.
- Despliegue en hardware de borde con recursos limitados: la cuantización INT8 facilita la inferencia en GPUs de gama media o en plataformas embebidas con presupuesto de memoria reducido.
- Estudio de particiones de datos no-IID: la partición `explicit_tasks` (una tarea por cliente) es un escenario típico de heterogeneidad entre clientes, útil para analizar convergencia y estabilidad del entrenamiento federado.
- Reproducibilidad de experimentos: la semilla 42 y la descripción de las rondas permiten replicar el experimento en entornos locales equivalentes.
- Comparación con la ejecución `groot_n17_libero_4suite_int8_fedavg`: el autor distingue explícitamente ambas configuraciones, lo que permite estudiar el efecto de particionar por tarea frente a particionar por suite LIBERO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 14,6 GB, lo que da una cota inferior orientativa del espacio en disco, pero no de la VRAM necesaria en ejecución.
- GPU recomendadas: no disponibles. Por el tamaño del artefacto y la cuantización INT8, es plausible que requiera GPUs con al menos 16-24 GB de VRAM, pero este dato no está confirmado en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado. No hay datos que permitan afirmarlo o descartarlo.
- Opciones de despliegue: no disponibles. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con el stack de Isaac GR00T.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `groot_lpt_int8_fedavg_4task_local` (este) | no disponible | no disponible | no disponible | no disponible | Hugging Face, 14,6 GB |
| `DecentVLA/groot_n17_libero_4suite_int8_fedavg` | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado por el autor) |
| GR00T base (NVIDIA) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La comparativa se limita al modelo hermano citado por el propio autor, que difiere en la partición de datos (una suite LIBERO por cliente frente a una tarea por cliente) y en el hardware de entrenamiento (4x GH200 frente a ejecución local). No se dispone de datos de rendimiento para ninguno de los dos.

## Limitaciones y advertencias

- No se ha publicado licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso en producción.
- El checkpoint corresponde únicamente a la ronda 50; no se conservan las rondas intermedias ni los estados de los clientes, lo que impide auditar la trayectoria de entrenamiento o reanudarlo.
- El modelo está entrenado sobre cuatro tareas concretas del benchmark LIBERO con una partición específica; su generalización a otras tareas, entornos o robots no está documentada.
- La cuantización INT8 puede introducir degradación en la precisión de las acciones predichas; no se aportan métricas que cuantifiquen esta pérdida.
- No hay información sobre sesgos, riesgo de alucinación en la generación de lenguaje ni limitaciones idiomáticas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni reportes de uso independientes.
- No debe confundirse con `groot_n17_libero_4suite_int8_fedavg`; el autor lo advierte explícitamente y las condiciones de entrenamiento difieren.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DecentVLA/groot_lpt_int8_fedavg_4task_local
- Modelo hermano citado por el autor: https://huggingface.co/DecentVLA/groot_n17_libero_4suite_int8_fedavg
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
