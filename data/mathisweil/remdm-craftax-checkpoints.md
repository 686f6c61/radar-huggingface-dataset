# mathisweil/remdm-craftax-checkpoints

## Resumen

ReMDM (Remasking Discrete Diffusion Model) es un planificador basado en difusión discreta con remasking, entrenado para generar secuencias de acciones en el entorno Craftax, un entorno de aprendizaje por refuerzo escrito íntegramente en JAX que reimplementa y extiende la mecánica de Crafter con inspiración de NetHack. El modelo es un artefacto de investigación desarrollado por Mathis Weil y publicado junto al artículo *The Double Intractability of Reinforcement Learning for Discrete Diffusion Planners*, presentado en el NeurIPS 2026 Workshop Beyond Next-Token Prediction.

El repositorio contiene los pesos entrenados de dos variantes del planificador de difusión (uno entrenado offline con behaviour cloning y otro online con DAgger) junto con el experto PPO-RNN que los supervisa, así como los resultados de las evaluaciones y las ablatciones de fine-tuning con RL. La arquitectura del planificador es un transformer bidireccional de 6 capas con d_model 384 y 8 cabezas, que denoisa un plan de acciones enmascarado condicionado a la observación simbólica del entorno, con un horizonte de 32 pasos. Los pesos se almacenan en formato Orbax (OCDBT) y se restauran mediante `orbax.checkpoint` desde Flax.

La relevancia de este trabajo reside en que aborda la dificultad de entrenar planificadores de difusión discreta mediante RL, una línea de investigación activa dentro de la planificación basada en modelos generativos. Al publicar los pesos, las configuraciones completas y el harness de evaluación, el autor facilita la reproducibilidad y el avance en esta área.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (6 capas, d_model 384, 8 cabezas) para el planificador; RNN (capa de tamaño 512) para el experto PPO |
| Parámetros totales | no disponible (los pesos se almacenan en formato Orbax, sin conteo de parámetros publicado) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Horizonte de planificación de 32 pasos de acción |
| Tipos de cuantización | no disponible (los pesos se publican en precisión completa, sin variantes cuantizadas) |
| Idiomas soportados | no aplica (agente de RL, no modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Orbax (OCDBT), no safetensors; modelos Flax restaurados con `orbax.checkpoint` |

## Arquitectura y entrenamiento

El planificador ReMDM es un transformer bidireccional que opera sobre secuencias de acciones enmascaradas. Dada una observación simbólica del entorno, el modelo denoisa iterativamente un plan de acciones de longitud 32, aplicando una estrategia de remasking que determina qué posiciones se actualizan en cada paso del proceso de difusión. El entrenamiento se realizó de dos formas: offline, mediante behaviour cloning sobre rollouts generados por el experto PPO-RNN, y online, mediante DAgger (interacción con el experto durante el entrenamiento). En ambos casos se usaron 100 millones de pasos de entorno (97.600 gradientes steps) para el planificador de difusión, mientras que el experto PPO-RNN se entrenó durante 1.000 millones de frames.

El experto PPO-RNN es una RNN recurrente de capa de tamaño 512 que actúa como policy de referencia. La supervisión del experto es clave: el planificador aprende a imitar las secuencias de acciones que el experto produce en respuesta a las observaciones. El diseño experimental permite comparar el comportamiento del planificador de difusión con el del experto, así como estudiar las dificultades del fine-tuning con RL directo sobre el planificador, que es el tema central del artículo.

## Capacidades

- Generación de secuencias de acciones (planificación) en el entorno Craftax-Classic-Symbolic-v1, condicionada a observaciones simbólicas.
- Dos modalidades de entrenamiento: behaviour cloning offline y DAgger online, ambas con el mismo experto PPO-RNN como supervisor.
- Denoising con remasking: estrategia de actualización selectiva de posiciones enmascaradas durante la generación del plan.
- Integración con el ecosistema JAX: los pesos se restauran con `orbax.checkpoint` y los modelos son módulos Flax, lo que permite su uso dentro de pipelines de RL basados en JAX.
- Incluye el experto PPO-RNN como agente de referencia, útil para comparaciones y como supervisor en el entrenamiento del planificador.

## Casos de uso

- Investigación en planificación con difusión discreta: el repositorio permite reproducir los experimentos del artículo y estudiar el comportamiento de planificadores de difusión en entornos de RL con observaciones simbólicas.
- Evaluación de la intratabilidad del RL para planificadores de difusión: los checkpoints y los resultados de ablatción incluidos (19 tablas y 113 figuras) permiten analizar en detalle las dificultades del fine-tuning con RL.
- Entrenamiento de agentes con behaviour cloning offline: el checkpoint de BC de 100M puede usarse como punto de partida para experimentos de fine-tuning o para comparar con otros métodos de planificación.
- Entrenamiento con DAgger: el checkpoint de DAgger ofrece una alternativa que combina el aprendizaje offline con la interacción con el experto, útil para estudiar el impacto del régimen de entrenamiento.
- Comparación entre planificadores y políticas recurrentes: el repositorio incluye el experto PPO-RNN como línea base, permitiendo comparar el rendimiento de un planificador de difusión con una política recurrente convencional.
- Desarrollo de nuevas estrategias de remasking: el código y la configuración completa de cada checkpoint permiten experimentar con distintas estrategias de remasking y calendarios de difusión.

## Benchmarks y rendimiento

| Entorno | Evaluación | Métrica principal | Resultado |
|---|---|---|---|
| `Craftax-Classic-Symbolic-v1` | 32 entornos × 10 000 pasos | media del score | 3,88 (planificador BC) |
| `Craftax-Classic-Symbolic-v1` | 32 entornos × 10 000 pasos | media del score | 3,26 (planificador DAgger) |

Los resultados completos y su varianza se reportan en el artículo del autor. No se han publicado resultados en benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje; la evaluación se realiza exclusivamente en el entorno Craftax.

## Requisitos de hardware

- Los checkpoint son de tamaño reducido: 97 MB (planificador BC), 33 MB (planificador DAgger) y 35 MB (experto PPO-RNN). La inferencia del planificador es ligera y puede ejecutarse en una CPU o en cualquier GPU consumer con al menos 4 GB de VRAM.
- El entrenamiento del planificador (100M de pasos de entorno) y del experto PPO (1B frames) requiere una GPU con suficiente memoria para las batch de JAX; aunque no se especifica la GPU exacta, para entrenamiento completo se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB).
- Para inferencia y evaluación, se puede usar la interfaz de línea de comandos (`main.py --mode inference`) que carga el checkpoint con `orbax.checkpoint`; no se requiere una infraestructura especial más allá de una instalación de Python con JAX y las dependencias del repositorio.
- El repositorio incluye un harness de evaluación que ejecuta 32 entornos en paralelo durante 10 000 pasos, lo que puede hacerse en una sola GPU o en CPU con JAX habilitado para XLA.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en el mismo repositorio. Como referencia interna, la comparación relevante es entre el planificador de difusión y su experto supervisor:

| Modelo | Tipo | Entrenamiento | Score medio en Craftax-Classic-Symbolic-v1 |
|---|---|---|---|
| Planificador ReMDM (BC) | Transformer bidireccional + difusión | Behaviour cloning (100M pasos) | 3,88 |
| Planificador ReMDM (DAgger) | Transformer bidireccional + difusión | DAgger (100M pasos) | 3,26 |
| Experto PPO-RNN | RNN (capa 512) | PPO (1B frames) | no disponible en el repositorio |

El experto PPO-RNN es el supervisor que genera las demostraciones; su rendimiento se reporta en el artículo, pero no se incluye en los ficheros de evaluación del repositorio. No se conocen otros planificadores de difusión discreta publicados con pesos en el mismo entorno para una comparativa externa.

## Limitaciones y advertencias

- Son artefactos de investigación vinculados a versiones específicas de Craftax y a la codificación simbólica de observaciones; no son agentes de propósito general y no transfieren a otros entornos ni a observaciones de píxeles.
- El rendimiento reportado (3,88 y 3,26) es en el entorno concreto `Craftax-Classic-Symbolic-v1`; la varianza y las condiciones exactas de evaluación se detallan en el artículo, pero no se incluyen en el repositorio.
- Los pesos están en formato Orbax (OCDBT), no en `safetensors`; requieren el ecosistema Flax/Orbax para su restauración, lo que limita su uso fuera de JAX.
- No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje; no se debe extrapolar su comportamiento a tareas de NLP.
- La licencia es MIT, lo que permite uso comercial, pero el modelo no está pensado para producción; es un artefacto de investigación.
- El entrenamiento del planificador con RL directo (el tema central del artículo) puede ser inestable; los checkpoints publicados son el resultado de behavior cloning y DAgger, no de RL directo, y su comportamiento puede degradarse si se intenta un fine-tuning con RL sin las consideraciones del paper.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/mathisweil/remdm-craftax-checkpoints
- Repositorio de código y evaluación: https://github.com/mathisweil/craftax-ReMDM-planner
- Entorno Craftax: https://github.com/MichaelTMatthews/Craftax
- Documentación de Orbax: https://orbax.readthedocs.io
