# bqgs/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

`bqgs/dqn-SpaceInvadersNoFrameskip-v4` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo DQN (*Deep Q-Network*) para jugar al entorno `SpaceInvadersNoFrameskip-v4` del conjunto de referencia Atari. No es un modelo de lenguaje ni un modelo multimodal: se trata de una red de valor-acción que consume fotogramas del juego y emite una acción discreta por paso. Lo publica el usuario `bqgs` en Hugging Face mediante el flujo de trabajo estándar de Stable Baselines3 y RL Zoo, que genera automáticamente la model card, los hiperparámetros y la entrada de `model-index`.

El modelo se entrenó durante 1.000.000 de pasos de entorno con la `CnnPolicy` de Stable Baselines3, un *replay buffer* de 100.000 transiciones, aprendizaje con `learning_rate` de 0,0001, `batch_size` de 32, `train_freq` de 4 y actualización de la red objetivo cada 1.000 pasos. La observación se procesa con el `AtariWrapper` de SB3 y una pila de 4 fotogramas (`frame_stack=4`). El resultado declarado es una recompensa media de 663,50 ± 219,55 en el propio entorno de entrenamiento, una métrica no verificada de forma independiente y con una desviación típica muy elevada en relación a la media.

Su relevancia es fundamentalmente práctica y metodológica: sirve como *baseline* reproducible de DQN sobre Atari, como material docente para cursos de RL y como punto de partida para experimentos de comparación de algoritmos, envoltorios y pipelines de entrenamiento. El repositorio ocupa 0,1 GB y acumula 17 descargas y 0 *likes* en el momento de redactar esta ficha. No se declara licencia, idioma ni conjunto de datos de entrenamiento más allá del propio entorno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red Q profunda (DQN) con política convolucional (`CnnPolicy`) sobre observaciones de píxeles; la model card no detalla la topología de capas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica; la entrada es una pila de 4 fotogramas (`frame_stack=4`) procesados por la CNN |
| Tipos de cuantización | no aplica (agente de RL, no un modelo de lenguaje); pesos en coma flotante de PyTorch |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa texto) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | no declarado explícitamente; RL Zoo y SB3 publican un archivo `.zip` con el *state dict* de PyTorch y metadatos del agente |
| Librería | stable-baselines3 |
| Algoritmo | DQN |
| Entorno | SpaceInvadersNoFrameskip-v4 |
| Pasos de entrenamiento | 1.000.000 |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 17 / 0 |
| Fecha de publicación | 2 de octubre de 2026 |

## Arquitectura y entrenamiento

El agente implementa el algoritmo DQN canónico: una red neuronal que aproxima el valor Q(s, a) para cada acción discreta disponible en el entorno, entrenada minimizando el error cuadrático entre el valor predicho y el objetivo de Bellman calculado con una red objetivo congelada que se actualiza cada 1.000 pasos. El componente de exploración es epsilon-greedy, con una fracción de exploración de 0,1 del total de pasos y un epsilon final de 0,01. La recolección de experiencias comienza tras 100.000 pasos (`learning_starts`) y cada actualización usa un lote de 32 transiciones muestreadas del *replay buffer*. El modelo no incorpora mejoras posteriores al DQN original como *double Q-learning*, *prioritized experience replay*, *dueling networks* o distribución de valor, características de variantes como Rainbow.

El preprocesado de la observación delega en el `AtariWrapper` de Stable Baselines3, combinado con `frame_stack=4`, de modo que la red recibe varios fotogramas consecutivos para poder inferir información de movimiento. La política es la `CnnPolicy` de SB3, que implementa por defecto la red convolucional descrita en el trabajo original de DQN sobre Atari. El entrenamiento se realizó con `optimize_memory_usage=False` y `normalize=False`, y la configuración de ejecución del entorno fija `render_mode='rgb_array'`. No se documenta el número exacto de tokens ni de transiciones totales almacenadas, ni si hubo fases de ajuste fino posteriores, ni la semilla empleada. La model card es la plantilla generada automáticamente por RL Zoo, por lo que no aporta información adicional sobre el dataset, la duración del entrenamiento o el hardware utilizado.

## Capacidades

- Control de política discreta sobre píxeles: selecciona una acción del conjunto de acciones definido por el entorno `SpaceInvadersNoFrameskip-v4` a partir de la observación visual.
- Percepción de movimiento a corto plazo gracias a la pila de 4 fotogramas, que permite estimar trayectorias de proyectiles y desplazamientos de la nave.
- Aprendizaje por refuerzo *off-policy* con *replay buffer* de 100.000 transiciones y actualizaciones cada 4 pasos de entorno.
- Evaluación determinista reproducible mediante la API de SB3 (`predict` con modo determinista), útil para medir la política final sin ruido de exploración.
- Integración directa con el ecosistema Gymnasium / Arcade Learning Environment a través de RL Zoo.
- Carga y ejecución sencillas con `rl_zoo3.load_from_hub` y `rl_zoo3.enjoy`, incluyendo la posibilidad de generar vídeo cuando el entorno lo permite.
- No dispone de generación de texto, *tool calling*, soporte de agentes multi-paso basados en lenguaje, capacidades multilingües, visión general, audio ni modo de razonamiento explícito.
- No generaliza a otros juegos o dominios: la política está especializada en un único entorno.

## Casos de uso

- Docencia e investigación en aprendizaje por refuerzo: permite ilustrar el ciclo completo de DQN (recolección, *replay buffer*, red objetivo, epsilon-greedy) con un artefacto ya entrenado y cargable en pocos segundos.
- *Baseline* de comparación algorítmica: sirve como referencia DQN frente a variantes como Double DQN, Dueling DQN, C51, Rainbow o PPO entrenadas en el mismo entorno, siempre que se controle la semilla y el número de evaluaciones.
- Experimentos de transferencia y ajuste fino: el agente puede reentrenarse o afinarse sobre variantes del entorno (distintos *frame skip*, penalización por pérdida de vidas, entornos deterministas) para estudiar hasta qué punto la política aprendida es reutilizable.
- Pruebas de regresión en infraestructuras de RL: integrar la carga del modelo y la evaluación de recompensa media en un *pipeline* de integración continua permite detectar roturas provocadas por cambios de versión en Stable Baselines3, Gymnasium o el Arcade Learning Environment.
- Generación de demostraciones y material divulgativo: con `render_mode='rgb_array'` se pueden producir vídeos de las partidas del agente para depuración visual o para explicar el comportamiento de una política entrenada.
- Análisis de estabilidad y varianza: la desviación declarada de ±219,55 sobre una media de 663,50 hace de este modelo un caso útil para estudiar la dispersión de recompensas entre episodios y la sensibilidad al número de evaluaciones.
- Estudio de robustez frente a perturbaciones del entorno: modificar la velocidad de los proyectiles, el número de vidas o el preprocesado permite medir la degradación de la política sin reentrenar.
- Componente de *benchmarks* internos: puede incorporarse como uno de los agentes evaluados automáticamente en un panel comparativo de modelos Atari alojados en un *hub* propio.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en el `model-index` de la model card, no verificados de forma independiente.

| Algoritmo | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| DQN | SpaceInvadersNoFrameskip-v4 | mean_reward | 663,50 ± 219,55 | No |

No se han publicado resultados adicionales de MMLU, HumanEval, GSM8K ni de ningún otro benchmark, dado que el modelo no es un modelo de lenguaje. Tampoco se aportan curvas de aprendizaje, número de episodios evaluados, semilla empleada ni comparación con otros agentes en la misma tabla.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB. La red convolucional es de tamaño reducido y el repositorio completo ocupa 0,1 GB, incluyendo otros artefactos de entrenamiento.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con 2 GB o más (GTX 1050, RTX 2060, RTX 3060, RTX 4090) es más que suficiente; también resulta viable en A100 o H100, aunque desaprovechadas.
- Ejecución en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en CPU, que es el escenario habitual para inferencia de agentes Atari.
- Memoria RAM: el *replay buffer* de 100.000 transiciones con 4 fotogramas apilados por observación implica del orden de 2,8 GB en RAM si se almacena en `uint8` (estimación a partir de `buffer_size=100000` y `frame_stack=4`); este consumo aplica al entrenamiento, no a la simple inferencia.
- Opciones de despliegue: Stable Baselines3 y RL Zoo mediante `python -m rl_zoo3.load_from_hub --algo dqn --env SpaceInvadersNoFrameskip-v4 -orga bqgs -f logs/` y `python -m rl_zoo3.enjoy`. No aplican servidores de inferencia para modelos de lenguaje como vLLM, TGI, Ollama o llama.cpp.
- Latencia y throughput: no disponibles de forma oficial. Como estimación, una CNN de este tamaño resuelve cada decisión en el rango de 1 a 10 ms en CPU moderna; el cuello de botella real durante la evaluación es la simulación del entorno Atari, no la red.
- Coste de entrenamiento: se declaran 1.000.000 de pasos de entorno con `learning_starts=100000`; no se especifica el tiempo de entrenamiento ni el hardware empleado.

## Comparativa con modelos similares

Existen varios agentes publicados con la misma plantilla de RL Zoo para el mismo entorno. No hay métricas publicadas para las alternativas, por lo que la comparación se limita a parámetros estructurales.

| Modelo | Algoritmo | Entorno | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bqgs/dqn-SpaceInvadersNoFrameskip-v4 | DQN | SpaceInvadersNoFrameskip-v4 | 663,50 ± 219,55 | no disponible | Hugging Face |
| hruslen/SpaceInvadersNoFrameskip-v4 | DQN | SpaceInvadersNoFrameskip-v4 | no disponible | no disponible | Hugging Face |
| Bear-ai/dqn-SpaceInvadersNoFrameskip-v4 | DQN | SpaceInvadersNoFrameskip-v4 | no disponible | no disponible | Hugging Face |
| HusseinEid101/dqn-SpaceInvadersNoFrameskip-v4 | DQN | SpaceInvadersNoFrameskip-v4 | no disponible | no disponible | GitHub |

Todos comparten la misma arquitectura de política, el mismo entorno y el mismo marco de entrenamiento, por lo que las diferencias previsibles se reducen a la semilla, el número de pasos y los hiperparámetros concretos, no documentados en los casos comparados.

## Limitaciones y advertencias

- La métrica de recompensa media está marcada como no verificada (`verified: false`) y procede exclusivamente del autor del modelo.
- La desviación típica de ±219,55 sobre una media de 663,50 indica una variabilidad muy alta entre episodios; no debe interpretarse la media como un rendimiento estable.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido. Ante la ausencia de licencia explícita, debe asumirse que no hay autorización clara.
- El modelo solo ha sido entrenado y evaluado en `SpaceInvadersNoFrameskip-v4`; no se ha demostrado capacidad de generalización a otros juegos, a variantes del entorno ni a cambios en el preprocesado.
- Riesgo de sobreajuste al *wrapper* concreto: el uso del `AtariWrapper` y de `frame_stack=4` es parte del contrato del modelo; alterar estos ajustes invalida los resultados declarados.
- No se documentan semilla, número de episodios de evaluación, curvas de aprendizaje ni hardware de entrenamiento, lo que dificulta la reproducibilidad estricta.
- Dependencia del entorno de ejecución: requiere versiones compatibles de Stable Baselines3, RL Zoo, Gymnasium y del Arcade Learning Environment, además de las ROMs de Atari cuando corresponda.
- El DQN canónico no incorpora *double Q-learning*, *prioritized replay*, *dueling* ni distribución de valor, por lo que su rendimiento queda por debajo de variantes más modernas del mismo entorno sin que se disponga de cifras comparativas en esta ficha.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, no soporta *tool calling*, no tiene capacidades multilingües ni de razonamiento simbólico. Aplicarlo fuera del contexto de control de píxeles no es viable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bqgs/dqn-SpaceInvadersNoFrameskip-v4
- Stable Baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- SB3 Contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- SBX (SB3 con Jax): https://github.com/araffin/sbx
- Agente comparable de hruslen: https://huggingface.co/hruslen/SpaceInvadersNoFrameskip-v4
- Agente comparable de Bear-ai: https://huggingface.co/Bear-ai/dqn-SpaceInvadersNoFrameskip-v4
- Repositorio comparable en GitHub: https://github.com/HusseinEid101/dqn-SpaceInvadersNoFrameskip-v4/blob/main/README.md
- Ficha del modelo en aibase: https://model.aibase.com/models/details/1915692640189964289
- Ficha del modelo en aibase (variante): https://model.aibase.com/models/details/1915692636410896386
- Artículo original de DQN sobre Atari (Mnih et al., 2013): https://arxiv.org/abs/1312.5602
