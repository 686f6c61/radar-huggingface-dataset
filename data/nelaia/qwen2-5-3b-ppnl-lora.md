# Nelaia/qwen2.5-3b-ppnl-lora

## Resumen

Nelaia/qwen2.5-3b-ppnl-lora es una colección de adaptadores LoRA y QLoRA entrenados sobre el modelo base Qwen/Qwen2.5-3B para la tarea de planificación de rutas en entornos de cuadrícula (path planning), bajo la formulación PPNL (Path Planning Natural Language). El repositorio agrupa varios adaptadores independientes, uno por subcarpeta, cada uno correspondiente a un conjunto de datos o ejecución de entrenamiento distinto. El modelo no es un LLM generalista nuevo, sino un ajuste fino paramétricamente eficiente orientado a una tarea concreta de razonamiento espacial y generación de trayectorias.

La relevancia del proyecto radica en que aborda la planificación de rutas como una tarea de generación de lenguaje natural, evaluando si un modelo de 3B parámetros puede resolver problemas de navegación en rejillas de distintos tamaños y con distintos niveles de dificultad. Los adaptadores se entrenaron con diferentes representaciones de la entrada (objetivo en lenguaje natural, objetivo numérico, posición del robot en lenguaje natural o numérica), lo que permite comparar qué formato de codificación funciona mejor para esta tarea.

El repositorio ocupa 0,6 GB y contiene únicamente los pesos de los adaptadores en formato safetensors, no los pesos completos del modelo base. Se distribuye mediante la librería PEFT y está pensado para cargarse sobre Qwen/Qwen2.5-3B. No se especifican licencia, idiomas ni pipeline en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA/QLoRA sobre transformer decoder-only (Qwen2.5-3B) |
| Parametros totales | no disponible (el adaptador es un delta sobre Qwen2.5-3B; el modelo base tiene 3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (longitudes de secuencia de entrenamiento de 128 a 365 tokens según ejecución) |
| Tipos de cuantizacion | QLoRA (entrenamiento cuantizado); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-3B, un transformer decoder-only de 3 mil millones de parámetros. Sobre él se aplican adaptadores LoRA con rango r=16 y alpha=32, entrenados con QLoRA. Cada subcarpeta del repositorio corresponde a una ejecución independiente con su propio conjunto de datos y su propia configuración de longitud de secuencia (128, 256 o 365 tokens). Los hiperparámetros son consistentes entre ejecuciones: 3 épocas, learning rate 2e-4 y batch size 32.

Las ejecuciones varían en la representación de la entrada: `a_abs` usa una representación absoluta; `gnl` y `gnum` codifican el objetivo en lenguaje natural o numérico respectivamente; `rnl` y `rnum` codifican la posición del robot en lenguaje natural o numérico. El conjunto de datos principal es PPNL `single_goal_original`, con variantes de evaluación en distribución (iid), fuera de distribución (OOD) en rejillas 5x5 y 7x7, y OOD con más obstáculos. La decodificación empleada en la evaluación es greedy y se descartan los ejemplos con objetivo inalcanzable.

## Capacidades

- Planificación de rutas en entornos de cuadrícula con obstáculos, formulada como generación de texto.
- Razonamiento espacial sobre representaciones de objetivo y posición del robot, tanto en formato numérico como en lenguaje natural.
- Generalización a tamaños de rejilla no vistos durante el entrenamiento (evaluación OOD 5x5 y 7x7).
- Robustez parcial ante incremento del número de obstáculos (evaluación OOD con más obstáculos).
- Generación de trayectorias en formato de secuencia de acciones o celdas, según la formulación PPNL.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Planificación de rutas en robótica de cuadrícula: el adaptador `rnl_rel-robot_single-goal-original` permite generar trayectorias a partir de la posición del robot y el objetivo descritos en lenguaje natural, con una tasa de éxito del 96,9 % en test iid.
- Evaluación de representaciones de entrada: los distintos adaptadores permiten comparar experimentalmente si codificar el objetivo o la posición del robot en lenguaje natural o en numérico mejora la planificación, útil en investigación sobre razonamiento espacial en LLMs.
- Generación de trayectorias en entornos con obstáculos variables: el adaptador `rnl` mantiene un 71,4 % de éxito en OOD con más obstáculos, adecuado para escenarios donde la densidad de obstáculos cambia.
- Prototipado de agentes de navegación en simulación: al cargarse sobre Qwen2.5-3B, el adaptador puede integrarse en un bucle de simulación para generar planes de movimiento paso a paso.
- Investigación en generalización OOD: los resultados en rejillas 5x5 y 7x7 permiten estudiar la transferencia de modelos pequeños a tamaños de entorno no vistos.
- Benchmarking de PEFT en tareas estructuradas: sirve como referencia de hasta dónde llega un LoRA r=16 sobre un modelo de 3B en una tarea de razonamiento espacial concreta.

## Benchmarks y rendimiento

Resultados de la model card (exact match / success rate en %, decodificación greedy, ejemplos con objetivo inalcanzable descartados):

| Run | test_seen (iid) | test_unseen (iid) | OOD 5x5 | OOD 7x7 | OOD más obstáculos |
|---|---|---|---|---|---|
| `a_abs_single-goal-original` | 91,9 / 94,0 | 92,0 / 93,8 | 90,5 / 91,7 | 81,6 / 84,8 | 57,5 / 60,0 |
| `gnl_rel-goal_single-goal-original` | 95,1 / 95,5 | 95,6 / 96,4 | 93,3 / 93,8 | 94,5 / 96,0 | 67,8 / 68,6 |
| `gnum_rel-goal_single-goal-original` | 92,8 / 93,3 | 94,3 / 95,1 | 92,5 / 92,9 | 92,7 / 94,3 | 63,3 / 64,5 |
| `rnl_rel-robot_single-goal-original` | 96,1 / 96,9 | 96,7 / 97,6 | 95,2 / 95,8 | 96,3 / 97,3 | 70,2 / 71,4 |
| `rnum_rel-robot_single-goal-original` | 93,3 / 94,5 | 93,5 / 95,1 | 92,7 / 93,5 | 92,3 / 94,3 | 64,6 / 66,5 |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros modelos en tareas estándar (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa una fracción pequeña; el modelo base Qwen2.5-3B en fp16 requiere aproximadamente 6 GB de VRAM, y en cuantización de 4 bits alrededor de 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el modelo base en fp16; RTX 3060/4060 o superiores para cuantización 4 bits; A100/H100 no necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares.
- Opciones de despliegue: PEFT para cargar el adaptador sobre el modelo base; el modelo fusionado puede servirse con vLLM, TGI o llama.cpp tras conversión a GGUF. Ollama requeriría fusionar y convertir previamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (PPNL) ni de resultados de benchmarks estándar para establecer una comparación cuantitativa. La comparación más directa es entre las propias ejecuciones del repositorio, donde `rnl_rel-robot_single-goal-original` obtiene el mejor rendimiento global (96,9 % en test iid, 71,4 % en OOD con más obstáculos) y `a_abs_single-goal-original` el peor en OOD 7x7 (84,8 %).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen2.5-3b-ppnl-lora (rnl) | 3B (base) | no disponible | no disponible | Hugging Face |
| qwen2.5-3b-ppnl-lora (a_abs) | 3B (base) | no disponible | no disponible | Hugging Face |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tarea muy específica: los adaptadores solo están entrenados para planificación de rutas en cuadrícula; no son modelos de propósito general.
- Caída notable en OOD con más obstáculos: el mejor adaptador baja al 71,4 % de éxito, lo que indica fragilidad ante densidades de obstáculos no vistas.
- Degradación en rejillas 7x7 para el adaptador `a_abs` (84,8 %), aunque los adaptadores basados en lenguaje natural generalizan mejor.
- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible verificarla antes de producción.
- Idiomas no documentados: la model card está en inglés y no se declaran idiomas soportados.
- Riesgo de alucinación en la generación de trayectorias: al ser un modelo generativo, puede producir secuencias inválidas o no alcanzables.
- Evaluación con decodificación greedy y descartando objetivos inalcanzables: los resultados no reflejan el comportamiento en esos casos límite.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni soporte documentado más allá de la model card.
- Sin pipeline declarado ni información sobre cuantizaciones de inferencia listas para usar.

## Enlaces

- Hugging Face: https://huggingface.co/Nelaia/qwen2.5-3b-ppnl-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Librería PEFT: https://github.com/huggingface/peft
