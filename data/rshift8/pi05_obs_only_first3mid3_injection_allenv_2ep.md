# rshift8/pi05_obs_only_first3mid3_injection_allenv_2ep

## Resumen
`rshift8/pi05_obs_only_first3mid3_injection_allenv_2ep` es un ajuste fino de dos épocas sobre el modelo RoboPRO π₀.₅, un sistema de visión‑lenguaje‑acción para robótica. El autor es `rshift8`, que parte del checkpoint base `mzxuan/robopro_jax_30000`. El modelo está diseñado para prestar atención únicamente a obstáculos en escenarios robóticos, desactivando la atención a las señales de target y destination. Esta configuración es relevante para entornos donde la prioridad es evitar colisiones o gestionar objetos dinámicos, ya que permite evaluar cómo la atención selectiva altera el comportamiento del modelo.

El entrenamiento se realizó con JAX/Orbax en paralelismo de datos con dos GPUs, un batch de 32 y un total de 230.934 pasos. Se supervisan las capas 0, 1, 2, 8, 9 y 10, y se inyecta la atención en las capas 15, 16 y 17. El repositorio ocupa 498 GB e incluye los pesos, estado de entrenamiento y metadatos necesarios para reanudar el entrenamiento o ejecutar evaluación. No se ha publicado información sobre parámetros totales, longitud de contexto, licencia ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de visión‑lenguaje‑acción de la familia π₀.₅) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se ha indicado que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | JAX/Orbax (`params/`, `train_state/`, `assets/`) |
| Pasos de entrenamiento | 230.934 (2 × 115.467) |
| Tamaño del repositorio | 498 GB |

## Arquitectura y entrenamiento
El modelo es un ajuste fino de 2 épocas sobre π₀.₅, un sistema de visión‑lenguaje‑acción desarrollado en el ecosistema RoboPRO. El entrenamiento se realizó en JAX/Orbax con batch de 32 y paralelismo de datos en dos GPUs, totalizando 230.934 pasos (115.467 pasos por época). Se utilizó como inicialización el checkpoint `mzxuan/robopro_jax_30000`.

La particularidad del ajuste es la configuración de atención: se supervisan las capas 0, 1, 2 (primeras tres) y 8, 9, 10 (capas medias), y la atención de obstáculos se inyecta en las capas 15, 16 y 17. En este proceso se desactivan las señales de atención al target y a la destination. Cada directorio de guardado contiene los parámetros del modelo, el estado del optimizador, los `norm_stats.json`, los metadatos de Orbax y un fragmento de `train_config.py` para reanudar el entrenamiento. No se han documentado datos sobre la composición del dataset ni si se aplicó RLHF o DPO.

## Capacidades
- El modelo está ajustado para generar acciones robóticas a partir de observaciones visuales y, posiblemente, instrucciones en lenguaje, siguiendo el enfoque de la familia π₀.₅.
- Se centra en la atención a obstáculos, lo que implica un filtrado de estímulos de target y destino. Esta capacidad es específica para tareas de navegación y manipulación donde la seguridad frente a obstáculos es prioritaria.
- El checkpoint incluye el estado de entrenamiento completo, lo que permite reanudar el ajuste fino o reutilizarlo como base para nuevos entrenamientos.
- No se han documentado capacidades de tool calling, function calling, agentes con razonamiento multi‑paso, visión explícita ni audio en la información disponible.
- No se han publicado sus capacidades multilingües ni su comportamiento en tareas de generación de texto generalista.

## Casos de uso
- Navegación de robots móviles en almacenes: el modelo podría integrarse en sistemas de control que generan comandos de movimiento esquivando palets y estanterías, usando su atención selectiva a obstáculos para reducir colisiones.
- Manipulación con obstáculos en tareas de pick‑and‑place: al ignorar señales de target y destination, el modelo puede centrarse en objetos que representan riesgo, lo que resulta útil en celdas de trabajo con piezas dinámicas.
- Simulación de políticas en entornos virtuales: el checkpoint se puede ejecutar en simuladores robóticos para estudiar cómo la inyección de atención en capas intermedias modifica la trayectoria del robot.
- Investigación en análisis de atención: las diferentes configuraciones de supervisión e inyección permiten comparar el comportamiento del modelo con variantes como `pi05_obs_only_first3mid3_last6_injection_allenv_2ep`, con el fin de estudiar el efecto de la inyección en capas específicas.
- Reanudación de entrenamiento: gracias al `train_state/` y al `train_config.py` incluidos, el modelo puede continuar entrenándose en nuevos entornos o conjuntos de datos robóticos, adaptando la atención a obstáculos a dominios específicos.
- Evaluación de robustez frente a obstáculos: en entornos industriales o de logística, el modelo puede emplearse como punto de partida para evaluar políticas de control que prioricen la evitación de colisiones frente al seguimiento de objetivos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de control robótico para este checkpoint.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. El tamaño del repositorio (498 GB) sugiere que los pesos son de gran tamaño, por lo que es probable que se necesiten GPUs profesionales (A100, H100) o varios nodos en clúster para cargar el modelo, pero no hay una especificación oficial.
- Compatibilidad con GPU de consumo: no disponible. Dado el tamaño de 498 GB, es poco probable que el modelo completo quepa en una GPU de consumo típica.
- Opciones de despliegue: no disponible. El formato de pesos es JAX/Orbax, por lo que no es compatible de forma directa con vLLM, llama.cpp, Ollama ni TGI. Se requiere código basado en JAX/Orbax para cargar y ejecutar el modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Capas supervisadas | Capas de inyección | Pasos | Tamaño del repo |
|---|---|---|---|---|
| `pi05_obs_only_first3mid3_injection_allenv_2ep` | 0, 1, 2, 8, 9, 10 | 15, 16, 17 | 230.934 | 498 GB |
| `pi05_obs_only_first3mid3_last6_injection_allenv_2ep` | No disponible | No disponible | No disponible | No disponible |
| `mzxuan/robopro_jax_30000` (modelo base) | No disponible | No disponible | No disponible | No disponible |

No hay datos de rendimiento ni especificaciones completas para ninguno de los modelos comparados. Los dos primeros comparten el origen en π₀.₅ y la atención solo a obstáculos, pero difieren en la configuración de capas de inyección. El tercero es el checkpoint base del ajuste fino.

## Limitaciones y advertencias
- Sesgos: no disponibles. No se ha publicado ninguna evaluación de sesgos.
- Riesgo de alucinación: al ser un modelo de acción robótica, el riesgo se manifiesta en acciones incorrectas o colisiones. No hay evaluaciones de seguridad ni de fiabilidad publicadas.
- Limitaciones de contexto e idioma: no se conocen los idiomas soportados ni la ventana de contexto. El modelo está ajustado específicamente para atención solo de obstáculos, por lo que puede fallar en tareas que requieran seguir un objetivo o destino.
- Restricciones de licencia: no disponible. No se especifica licencia en la información proporcionada, lo que hace incierto el uso comercial.
- Caveat para producción: el checkpoint de 498 GB y el formato JAX/Orbax dificultan su integración en stacks de inferencia estándar. Además, el modelo no está cuantizado, lo que implica un consumo elevado de recursos.
- El entrenamiento solo se ha realizado en dos épocas y no se han publicado métricas de validación, por lo que la calidad del ajuste fino no está demostrada.

## Enlaces
- Modelo: https://huggingface.co/rshift8/pi05_obs_only_first3mid3_injection_allenv_2ep
- Modelo base: https://huggingface.co/mzxuan/robopro_jax_30000
- Modelo relacionado: https://huggingface.co/rshift8/pi05_obs_only_first3mid3_last6_injection_allenv_2ep
