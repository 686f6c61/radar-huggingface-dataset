# hwanghwijun/libero10-hybrid-v3-half-mix-best-checkpoints

## Resumen

Este repositorio contiene los checkpoints de mejor rendimiento de un experimento de ablación sobre el benchmark LIBERO-10, un conjunto de tareas de manipulación robótica. El modelo, denominado `libero10-hybrid-v3-half-mix-best-checkpoints`, es una línea base naive que combina dos métodos de recuperación de trayectorias (S-DTW y VP-Bresenham) mediante una mezcla simple sin comparación entre ambos. El autor, hwanghwijun, lo presenta como una variante de comparación para evaluar el impacto de estrategias de mezcla más sofisticadas.

El modelo se entrena con una arquitectura BC-Transformer-GMM (5 modos, frame_stack 5, seq_length 5) sobre las 10 tareas de LIBERO-10, con 300 épocas y 200 pasos de gradiente por época, y se evalúa mediante rollouts cada 50 épocas. El resultado medio de éxito sobre 3 semillas es 0.422, inferior a las variantes v1 (0.501) y v2 (0.495), lo que indica que la mezcla naive no mejora el rendimiento. El repositorio ocupa 4.2 GB y contiene 30 checkpoints (10 tareas × 3 semillas).

Este trabajo es relevante para la investigación en aprendizaje por imitación y recuperación de trayectorias, ya que proporciona un baseline comparativo dentro de la serie Hybrid de LIBERO-10. No es un modelo de lenguaje ni de visión general, sino un modelo de política robótica para entornos simulados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BC-Transformer-GMM (5 modos, frame_stack 5, seq_length 5) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplicable (modelo de política robótica, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

El modelo utiliza una política de tipo BC-Transformer-GMM (Behavior Cloning con Transformer y mezcla de gaussianas). No se especifican los detalles de la arquitectura interna (número de capas, dimensiones, etc.) en la información proporcionada. El entrenamiento se realiza mediante aprendizaje por imitación sobre demostraciones de LIBERO-10, con un total de 300 épocas × 200 pasos de gradiente, batch de 32, y evaluación cada 50 épocas con 100 episodios y horizonte 300, con terminación por éxito.

La innovación de esta variante no está en la arquitectura sino en el método de mezcla de resultados de recuperación: para cada tarea, se combinan los N mejores resultados de S-DTW y VP-Bresenham, manteniendo N-H del primero y H del segundo, sin comparar entre ambos ni calcular similitud coseno. Es un baseline simple para contrastar con métodos más avanzados.

## Capacidades

- Ejecución de tareas de manipulación robótica en el benchmark LIBERO-10 (10 tareas específicas, como mover objetos, abrir armarios, etc.).
- Aprendizaje por imitación a partir de demostraciones, con capacidad de generar trayectorias de control.
- Soporte de múltiples semillas (3 semillas fijas: 1234, 42, 4325) para evaluar robustez.
- No.
- No.

## Casos de uso

- Investigación en recuperación de trayectorias: el modelo sirve como baseline para comparar métodos de mezcla de resultados de recuperación en LIBERO-10.
- Evaluación de estrategias de combinación de recuperadores: permite estudiar si una mezcla naive es suficiente o si se requieren métodos más complejos.
- Benchmarking de políticas robóticas: los checkpoints pueden usarse como referencia para medir el progreso en tareas específicas de LIBERO-10.
- Entrenamiento de políticas con datos de demostración: el entrenamiento con BC-Transformer-GMM es reproducible y puede servir como punto de partida para otras variantes.
- Análisis de sensibilidad a semillas: al tener 3 semillas por tarea, permite estudiar la variabilidad del método.
- Investigación en aprendizaje por refuerzo: aunque no se usa RL, los resultados pueden compararse con métodos basados en RL en LIBERO.

## Benchmarks y rendimiento

Los resultados presentados en la model card son la tasa de éxito en cada tarea de LIBERO-10, calculada como media sobre 3 semillas en el mejor checkpoint por época. Se comparan con las variantes v1 y v2.

| Tarea | Hybrid v1 best-K | Hybrid v2 best-K | v3 |
|---|---|---|---|
| stove_moka | 0.810 | 0.853 | 0.773 |
| soup_cheese | 0.397 | 0.347 | 0.323 |
| mug_mug | 0.457 | 0.537 | 0.430 |
| bowl_cabinet | 0.980 | 0.983 | 0.970 |
| book_caddy | 0.703 | 0.700 | 0.710 |
| mug_microwave | 0.320 | 0.233 | 0.213 |
| moka_moka | 0.000 | 0.000 | 0.000 |
| soup_sauce | 0.523 | 0.537 | 0.270 |
| mug_pudding | 0.217 | 0.237 | 0.193 |
| cream_butter | 0.603 | 0.527 | 0.333 |
| **Media** | **0.501** | **0.495** | **0.422** |

El modelo v3 es inferior a v1 y v2 en 8 de 10 tareas, con una diferencia media de -0.079 y -0.074 respectivamente. La tarea `moka_moka` tiene éxito 0 para todos los métodos. `book_caddy` es la única donde v3 mejora ligeramente (+0.007).

## Requisitos de hardware

- El entrenamiento se realizó en una GPU RTX 4090 (según la model card), lo que indica que el modelo cabe en una GPU consumer de alta gama.
- El tamaño del repositorio es de 4.2 GB, por lo que la inferencia puede ejecutarse en GPUs con al menos 8 GB de VRAM (aunque no se especifica el consumo exacto).
- No se proporcionan datos de latencia o throughput.
- Para el despliegue, se usan los frameworks de robótica: Python 3.10.20, torch 2.5.1+cu121, mujoco 3.6.0, robosuite 1.4.0 y robomimic 0.3.0. No se mencionan opciones como vLLM o llama.cpp, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables en la misma categoría (aprendizaje robótico con recuperación de trayectorias) más allá de las variantes del propio autor. Se comparan las variantes v1 y v2 del mismo proyecto:

| Modelo | Tasa de éxito media | Diferencia respecto a v3 |
|---|---|---|
| Hybrid v1 best-K | 0.501 | +0.079 |
| Hybrid v2 best-K | 0.495 | +0.074 |
| v3 (este) | 0.422 | - |

No se dispone de comparación con modelos como OpenVLA o otros métodos de LIBERO, ya que no se aportan datos en la información.

## Limitaciones y advertencias

- Es un modelo de investigación, no un sistema listo para producción. Está diseñado para el benchmark LIBERO-10 y no generaliza a otras tareas o entornos.
- La tasa de éxito en varias tareas es muy baja (por ejemplo, `moka_moka` es 0.000), lo que indica que el método no funciona bien para todas las tareas.
- La mezcla naive de resultados de recuperación no compara ni optimiza entre los dos métodos, por lo que su rendimiento es inferior a las variantes con selección de mejor K.
- No se proporcionan detalles sobre la arquitectura interna (número de capas, parámetros), por lo que no se puede evaluar su complejidad.
- La licencia MIT permite uso comercial, pero el modelo no está diseñado para aplicaciones comerciales.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje.

## Enlaces

- [HuggingFace: hwanghwijun/libero10-hybrid-v3-half-mix-best-checkpoints](https://huggingface.co/hwanghwijun/libero10-hybrid-v3-half-mix-best-checkpoints)
- [Página de modelos de hwanghwijun](https://huggingface.co/hwanghwijun/models)
- [Benchmark LIBERO (GitHub)](https://github.com/Lifelong-Robot-Learning/LIBERO)
- [Datasets de LIBERO](https://libero-project.github.io/datasets)
- [Variante v2 (k5-k10-k15)](https://huggingface.co/hwanghwijun/libero10-hybrid-v2-k5-k10-k15-best-checkpoints)</think>## Resumen

Este repositorio contiene los checkpoints de mejor política de un modelo de ablación sobre el benchmark LIBERO-10, denominado `libero10-hybrid-v3-half-mix-best-checkpoints`. El autor, hwanghwijun, lo presenta como una línea base de mezcla naive para un estudio sobre recuperación de trayectorias. El modelo combina dos métodos de recuperación (S-DTW y VP-Bresenham) sin comparar sus resultados entre sí, manteniendo una proporción fija de cada uno y añadiendo las demostraciones de verdad de referencia.

Se trata de un modelo de política robótica entrenado mediante clonación de comportamiento con una arquitectura BC-Transformer-GMM (5 modos, frame_stack 5, seq_length 5). El repositorio contiene 30 checkpoints (10 tareas × 3 semillas), con un tamaño total de 4.2 GB. La tasa de éxito media sobre 3 semillas es de 0.422, inferior a las variantes v1 y v2 del mismo autor, lo que indica que la mezcla naive no mejora el rendimiento. Es relevante para la comunidad de investigación en aprendizaje por imitación y recuperación de trayectorias, aunque no es un modelo de lenguaje ni de visión general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BC-Transformer-GMM (5 modos, frame_stack 5, seq_length 5) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplicable (modelo de política robótica, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

La política se basa en un transformer con mezcla de gauss (BC-Transformer-GMM) para clonación de comportamiento. No se especifican detalles internos como el número de capas o dimensiones de los pesos. El entrenamiento se realiza sobre las 10 tareas de LIBERO-10, con 300 épocas y 200 pasos de gradiente por época, batch de 32, y evaluación cada 50 épocas mediante 100 episodios de rollout con horizonte 300 y terminación por éxito.

La innovación de esta variante no está en la arquitectura sino en el método de mezcla de resultados de recuperación: para cada tarea, se mantienen los N-H mejores resultados de S-DTW y los H mejores de VP-Bresenham, concatenándolos sin comparación entre ambos. No hay per-segment matching ni cálculo de similitud de coseno. Es un baseline naive para estudiar la influencia de la estrategia de mezcla en el rendimiento final.

## Capacidades

- Ejecución de tareas de manipulación robótica en el benchmark LIBERO-10, incluyendo mover objetos, abrir armarios, etc.
- Generación de trayectorias de alta precisión a partir de demostraciones de comportamiento.
- Soporte de múltiples semillas (1234, 42, 4325) para evaluación robusta.
- No.
- No.

## Casos de uso

- Evaluación de estrategias de mezcla de recuperadores: el modelo sirve como baseline para comparar métodos de combinación de resultados de recuperación en LIBERO-10.
- Investigación en aprendizaje por imitación: permite analizar el impacto de la proporción de datos de recuperación frente a demostraciones reales.
- Benchmarking de políticas robóticas: los checkpoints pueden usarse como referencia para medir la calidad de otras políticas en las mismas tareas.
- Estudio de sensibilidad a semillas: al tener 3 semillas, se puede evaluar la variabilidad del método.
- Análisis de la influencia de la longitud de contexto en la recuperación: aunque no es un modelo de lenguaje, el frame_stack y seq_length determinan la ventana de observación.
- Reproducción de experimentos de ablación: los checkpoints permiten replicar los resultados de la model card para verificar el comportamiento.

## Benchmarks y rendimiento

Los resultados se presentan como tasa de éxito en el checkpoint de mejor época para cada tarea, promediada sobre 3 semillas. La tabla siguiente compara esta variante (v3) con las variantes v1 y v2 del mismo autor.

| Tarea | Hybrid v1 best-K | Hybrid v2 best-K | v3 |
|---|---|---:|---:|
| stove_moka | 0.810 | 0.853 | 0.773 |
| soup_cheese | 0.397 | 0.347 | 0.323 |
| mug_mug | 0.457 | 0.537 | 0.430 |
| bowl_cabinet | 0.980 | 0.983 | 0.970 |
| book_caddy | 0.703 | 0.700 | 0.710 |
| mug_microwave | 0.320 | 0.233 | 0.213 |
| moka_moka | 0.000 | 0.000 | 0.000 |
| soup_sauce | 0.523 | 0.537 | 0.270 |
| mug_pudding | 0.217 | 0.237 | 0.193 |
| cream_butter | 0.603 | 0.527 | 0.333 |
| **Media** | **0.501** | **0.495** | **0.422** |

El modelo v3 es inferior a v1 y v2 en 8 de 10 tareas, con una diferencia media de -0.079 y -0.074 respectivamente. La tarea `moka_moka` es un caso crítico con éxito 0 en todos los métodos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque el modelo no es de lenguaje.

## Requisitos de hardware

- El entrenamiento se realizó en una GPU RTX 4090, según la model card, lo que indica que el modelo es ejecutable en una GPU consumer de alta gama.
- El tamaño del repositorio es de 4.2 GB, por lo que la inferencia puede realizarse en GPUs con al menos 8 GB de VRAM, aunque no se especifica el consumo exacto.
- Se requieren librerías específicas: Python 3.10.20, torch 2.5.1+cu121, mujoco 3.6.0, robosuite 1.4.0, robomimic 0.3.0.
- No se indican opciones de despliegue como vLLM o llama.cpp, ya que no es un modelo de lenguaje. La inferencia se realiza probablemente con PyTorch directo.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables en la misma categoría (recuperación de trayectorias en LIBERO-10) más allá de las variantes del mismo autor. Se comparan las variantes v1 y v2:

| Modelo | Tasa de éxito media | Estrategia |
|---|---|---|
| Hybrid v1 best-K | 0.501 | Selección óptima por tarea de K en {5,10,15,20,25,30} |
| Hybrid v2 best-K | 0.495 | Selección óptima por tarea de K en {5,10,15,20,25,30} |
| v3 (este) | 0.422 | Mezcla fija con N-H de S-DTW y H de VP-Bresenham |

No se dispone de comparación con modelos externos como OpenVLA o otros métodos de aprendizaje por imitación en el contexto de LIBERO-10.

## Limitaciones y advertencias

- Es un modelo de investigación, no un sistema listo para producción. No está diseñado para entornos reales ni para generalizar más allá de las tareas de LIBERO-10.
- La tasa de éxito en varias tareas es muy baja (por ejemplo, `moka_moka` es 0.000), lo que indica que el método no es robusto para todas las tareas.
- La mezcla naive no compara ni optimiza entre los dos métodos de recuperación, por lo que su rendimiento es inferior a las variantes con selección de mejor.
- No se proporcionan información sobre la arquitectura interna (número de capas, dimensiones), por lo que no se puede evaluar la complejidad del modelo.
- La licencia MIT permite uso comercial, pero el modelo no está diseñado para aplicaciones comerciales reales.
- No se han evaluado sesgos ni alucinaciones, ya que no es un modelo de lenguaje.
- El modelo depende de las demostraciones de entrenamiento fijas (`demo_45, demo_15, demo_1, demo_7, demo_24`), lo que limita su aplicabilidad a otros entornos.

## Enlaces

- [HuggingFace: hwanghwijun/libero10-hybrid-v3-half-mix-best-checkpoints](https://huggingface.co/hwanghwijun/libero10-hybrid-v3-half-mix-best-checkpoints)
- [Página de modelos de hwanghwijun](https://huggingface.co/hwanghwijun/models)
- [GitHub LIBERO (benchmark)](https://github.com/Lifelong-Robot-Learning/LIBERO)
- [Datasets de LIBERO](https://libero-project.github.io/datasets)
- [Repositorio de OpenVLA-OFT (referencia de otros modelos en LIBERO)](https://github.com/moojink/openvla-oft)
