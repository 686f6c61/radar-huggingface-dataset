# Looyyd/pokebot-rl-ckpts

## Resumen

El repositorio `Looyyd/pokebot-rl-ckpts` contiene los checkpoints de referencia del proyecto pokebot, un sistema de aprendizaje por refuerzo para jugar al formato `gen9randombattle` de Pokémon Showdown. Desarrollado por Filip Niedzielski (usuario Looyyd), el proyecto combina clonación de comportamiento (behavior cloning, BC) sobre trayectorias generadas por un bot heurístico "profesor" y posterior fine-tuning con PPO (Proximal Policy Optimization) contra el propio motor del juego. El objetivo es obtener una política capaz de tomar decisiones competitivas en batallas aleatorias de la novena generación.

El repositorio incluye dos series de checkpoints de BC (con tamaños ocultos de 128 y 256) y dos checkpoints de referencia del entrenamiento RL (`matrix-ppo-399.pt` y `anchordecay-399.pt`). Es un trabajo de investigación en curso, compartido con fines de transparencia y reproducibilidad, por lo que los formatos y el código aún no están estabilizados. No se trata de un modelo de lenguaje, sino de una política de decisión específica para un entorno de juego concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con hidden size 128 o 256 (según checkpoint) y una cabeza de valor (value head). No se especifica el tipo de capas ni la arquitectura completa. |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones del juego) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural; es específico para el entorno de Pokémon Showdown) |
| Licencia | MIT |
| Formato de pesos | Archivos `.pt` (presumiblemente PyTorch), aunque no se confirma explícitamente el framework. |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de atención, etc.). Se sabe que existen dos variantes de clonación de comportamiento con hidden size 128 y 256, ambas entrenadas sobre un corpus de 500 000 partidas autogeneradas (aproximadamente 19,5 millones de decisiones por época, 8 épocas). El pipeline comienza con BC para calentar la política, utilizando trayectorias generadas por un bot heurístico, y posteriormente se aplica PPO contra el motor del juego. El checkpoint `bc-d128-500k/bc-ckpt-007.pt` alcanzó una precisión top-1 de validación de 0,829 y fue seleccionado como inicialización oficial para la etapa RL. El checkpoint `bc-d256-500k/bc-ckpt-006.pt` logró 0,8423 y se mantiene como referencia/ablación. El checkpoint `matrix-ppo-399.pt` es el campeón actual de esta generación de entrenamiento, mientras que `anchordecay-399.pt` es un campeón anterior con un esquema de decaimiento de ancla KL.

## Capacidades

- Toma de decisiones en batallas del formato `gen9randombattle` de Pokémon Showdown.
- Política entrenada mediante clonación de comportamiento y refuerzo (PPO) contra el motor del juego.
- Incluye una cabeza de valor para estimar el valor esperado de los estados.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural, no soporta tool calling ni funciones de agente.
- No tiene capacidades multilingües ni multimodales.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a juegos de estrategia por turnos: el modelo sirve como punto de partida para estudiar técnicas de BC y PPO en entornos complejos con espacio de acción grande.
- Benchmark de políticas para Pokémon Showdown: los checkpoints pueden usarse como referencia para comparar futuros algoritmos de entrenamiento en el mismo formato de batalla.
- Análisis de la transferencia entre clonación de comportamiento y refuerzo: permite estudiar cómo la inicialización con BC afecta al rendimiento final de PPO.
- Reproducibilidad de experimentos: al publicar los checkpoints y las métricas de validación, otros investigadores pueden replicar o extender el trabajo.
- Desarrollo de bots para Pokémon Showdown: el modelo podría integrarse en un bot para jugar partidas de `gen9randombattle`, aunque el formato no está estabilizado para producción.
- Estudio de la influencia del tamaño de la red (hidden size 128 vs 256) en la precisión de clonación de comportamiento y en el posterior fine-tuning con RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) porque el modelo no es un LLM. La única métrica reportada es la precisión top-1 de validación durante la clonación de comportamiento:

| Checkpoint | Val top-1 |
|---|---|
| `bc-d128-500k/bc-ckpt-007.pt` | 0,829 |
| `bc-d256-500k/bc-ckpt-006.pt` | 0,8423 |

No se proporcionan métricas de rendimiento en partidas reales contra otros bots o humanos, ni resultados de la etapa PPO más allá de la designación de "campeón" para `matrix-ppo-399.pt`.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación.
- El tamaño del repositorio es de 0,5 GB, lo que sugiere que los checkpoints individuales son pequeños (probablemente decenas de megabytes).
- Dado el tamaño reducido y la ausencia de capas de atención masivas, es probable que el modelo pueda ejecutarse en CPU, aunque no hay confirmación.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI), ya que no es un modelo de lenguaje.
- La inferencia se realizaría dentro del entorno de Pokémon Showdown, probablemente con el código de entrenamiento aún no publicado.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en el mismo dominio (políticas RL para Pokémon Showdown) con documentación pública. El proyecto parece ser único en su enfoque de combinar BC y PPO para este formato específico.

## Limitaciones y advertencias

- Es un trabajo de investigación en curso: los formatos de los checkpoints y el código de entrenamiento no están estabilizados y pueden cambiar.
- El modelo está especializado exclusivamente en el formato `gen9randombattle`; no es transferible a otros juegos o tareas.
- No es un modelo de lenguaje: no puede generar texto, razonar en lenguaje natural ni interactuar con usuarios.
- No se han publicado evaluaciones contra bots de referencia o jugadores humanos, por lo que se desconoce su nivel competitivo real.
- La licencia MIT permite uso comercial, pero al no haber documentación sobre el código de entrenamiento, su integración en producción sería compleja.
- No se proporcionan datos sobre sesgos, alucinaciones o riesgos éticos, ya que no es un modelo generativo de texto.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto muy reciente o poco difundido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Looyyd/pokebot-rl-ckpts
- Perfil del autor en HuggingFace: https://huggingface.co/Looyyd
- Dataset de corpus BC: https://huggingface.co/datasets/Looyyd/pokebot-bc-corpus-v2
- Dataset de cache preprocesado: https://huggingface.co/datasets/Looyyd/pokebot-bc-prepcache-v2
