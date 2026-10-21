# jos0054/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

`jos0054/dqn-SpaceInvadersNoFrameskip-v4` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo DQN (Deep Q-Network) sobre el entorno de Atari `SpaceInvadersNoFrameskip-v4`. Lo publica el usuario jos0054 y se ha generado con la librería stable-baselines3 y el framework de entrenamiento RL Zoo, que es el pipeline estándar de la comunidad para producir agentes reproducibles con hiperparámetros versionados.

No es un modelo de lenguaje: no procesa texto ni tiene parámetros en el sentido de un LLM. La política es una red convolucional (`CnnPolicy`, la arquitectura NatureCNN de SB3) que recibe fotogramas de píxeles apilados y emite valores Q para las acciones discretas del entorno. El autor declara un retorno medio de 573,00 ± 66,75 en el entorno de evaluación, con un presupuesto de entrenamiento de 1.000.000 de pasos.

Su relevancia es práctica: sirve como referencia reproducible y ligera (repositorio de 0,8 GB) para comparar algoritmos de RL, validar pipelines de entrenamiento con SB3/RL Zoo y como punto de partida para mejoras. Al no declararse licencia ni protocolo de evaluación detallado, debe tratarse con cautela antes de cualquier uso más allá de la experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN (Deep Q-Network) con politica convolucional `CnnPolicy` (NatureCNN de stable-baselines3) sobre observaciones de pixeles |
| Parametros totales | no disponible (el autor no declara el recuento de parametros de la red) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el agente consume una ventana de 4 fotogramas apilados de 84x84 en escala de grises (`frame_stack: 4`) |
| Tipos de cuantizacion | no disponible; el artefacto publicado es un checkpoint de SB3, no se ofrecen variantes cuantizadas |
| Idiomas soportados | no aplica (agente sobre pixeles, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.zip` de stable-baselines3 (politica + metadatos del algoritmo); repositorio de 0,8 GB |
| Algoritmo | DQN con target network y epsilon-greedy |
| Entorno | `SpaceInvadersNoFrameskip-v4` (Atari, ALE) |
| Libreria | stable-baselines3 + RL Zoo (`rl_zoo3`) |
| Presupuesto de entrenamiento | 1.000.000 de timesteps |
| Wrapper de entorno | `stable_baselines3.common.atari_wrappers.AtariWrapper` |

## Arquitectura y entrenamiento

El agente implementa el DQN clásico: una red convolucional que aproxima la función de valor-acción Q a partir de observaciones de pixeles, una red objetivo (`target_update_interval: 1000`) para estabilizar el error TD y una política epsilon-greedy con exploración decreciente (`exploration_fraction: 0.1`, `exploration_final_eps: 0.01`). El entrenamiento usa `buffer_size: 100000` transiciones, `learning_starts: 100000`, `batch_size: 32`, `learning_rate: 0.0001`, `train_freq: 4` y `gradient_steps: 1`, con `optimize_memory_usage: False` y `normalize: False`. Las observaciones pasan por el `AtariWrapper` estándar de SB3 (recorte a 84x84, apilado de fotogramas y recorte de recompensas, entre otras transformaciones de la cadena de wrappers).

No hay datos sobre composición del dataset porque no existe tal dataset: la señal de entrenamiento es la recompensa del propio juego, obtenida por interacción. Tampoco hay RLHF, DPO ni fases de ajuste supervisado. El presupuesto de 1.000.000 de timesteps es deliberadamente corto para los estándares de Atari, donde los resultados de referencia suelen requerir decenas de millones de fotogramas; esto encaja con el retorno declarado, que es modesto y muy por debajo de los agentes que agotan el entorno. La model card no documenta innovaciones técnicas adicionales (no hay decodificación especulativa, atención lineal ni mecanismos híbridos: es un DQN convolucional convencional).

## Capacidades

- Control de política greedy sobre el entorno `SpaceInvadersNoFrameskip-v4`: selecciona una acción discreta a partir de 4 fotogramas apilados de 84x84 en escala de grises.
- Aprendizaje por refuerzo off-policy: la política se ha entrenado con un replay buffer de 100.000 transiciones y puede reanudarse desde el checkpoint.
- Reproducibilidad de experimentos: los hiperparámetros completos están declarados en la model card y son compatibles con `rl_zoo3.train`.
- Evaluación estandarizada: se integra con el comando `rl_zoo3.enjoy`, que permite fijar semillas y ejecutar la política de forma determinista.
- Punto de partida para *fine-tuning*: al ser un checkpoint de SB3, admite continuación de entrenamiento, cambio de wrapper o sustitución por variantes como Double DQN, C51, QR-DQN o Rainbow de sb3-contrib.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso ni razonamiento multi-step en el sentido de los LLM; su "razonamiento" se limita al cálculo de valores Q por fotograma.
- Sin capacidades multilingües, de visión general, audio o modo *thinking*: la entrada está restringida a fotogramas del emulador.
- No se declaran capacidades de generalización a otros juegos ni a variantes del entorno distintas de la entrenada.

## Casos de uso

- Baseline de comparación de algoritmos: usar este DQN como referencia fija frente a C51, QR-DQN, Rainbow o PPO entrenados con el mismo presupuesto de 1.000.000 de timesteps para medir la ganancia real de cada mejora, manteniendo constantes wrappers y semillas.
- Docencia y tutoriales de RL: el checkpoint es pequeño y se carga en segundos con `rl_zoo3.load_from_hub`, lo que permite ilustrar en clase el ciclo completo de un DQN, desde la política epsilon-greedy hasta la evaluación con `enjoy`.
- Reproducción de experimentos: al estar publicados todos los hiperparámetros, sirve para verificar que una instalación de SB3/RL Zoo reproduce el retorno declarado (573,00 ± 66,75) antes de lanzar experimentos propios.
- Punto de partida para *fine-tuning*: continuar el entrenamiento más allá de 1.000.000 de pasos o añadir优先 replay / Double DQN, comparando curvas de aprendizaje contra este checkpoint como línea base.
- Validación de infraestructura de entrenamiento: ejecutar el pipeline de RL Zoo de extremo a extremo (descarga, `enjoy`, `push_to_hub`) para comprobar que el entorno Atari, los wrappers y las dependencias de GPU/CPU funcionan en una máquina nueva.
- Generación de material audiovisual y demos: el comando `enjoy` con `render_mode: rgb_array` produce grabaciones de la partida del agente, útiles para documentación, blogs técnicos o informes de resultados.
- Investigación sobre exploración: al tener una exploración epsilon-greedy explícita con `exploration_fraction: 0.1` y `exploration_final_eps: 0.01`, es un banco de pruebas controlado para estudiar el efecto de distintas programaciones de epsilon.
- Análisis de robustez y de sensibilidad de recompensa: evaluar el agente con perturbaciones del recorte de recompensas o con distintos wrappers para medir cuánto depende del *reward shaping* implícito del `AtariWrapper`.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`model-index`). El campo `verified` es `false`, por lo que no están validados de forma independiente.

| Entorno | Metrica | Resultado | Verificado |
|---|---|---|---|
| SpaceInvadersNoFrameskip-v4 | mean_reward | 573,00 ± 66,75 | No (declarado por el autor) |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros algoritmos, ni el número de episodios de evaluación, ni las semillas empleadas, ni la desviación típica por episodio. Tampoco se aportan curvas de aprendizaje ni métricas adicionales (longitud media de episodio, tasa de victoria, retorno humano normalizado).

## Requisitos de hardware

- Inferencia: un solo paso de política es una pasada por una CNN pequeña sobre un tensor de 4x84x84; se ejecuta en CPU sin problema y ocupa muy por debajo de 1 GB de VRAM en GPU. La latencia no está medida por el autor; se estima en el orden de milisegundos por paso en hardware de consumo, sin datos oficiales.
- Entrenamiento: la GPU no es un cuello de botella para esta configuración (batch de 32, red convolutional pequeña). Cualquier GPU CUDA moderna es suficiente; una RTX 3060/4060 o superior ya desaprovecha la GPU por sobrecarga de sincronización. A100/H100 no aportan ventaja en este régimen.
- Memoria RAM durante entrenamiento: el replay buffer de 100.000 transiciones con `optimize_memory_usage: False` almacena observación y observación siguiente (4x84x84 uint8 cada una), lo que supone aproximadamente 5,3 GiB de RAM según los hiperparámetros declarados y el tamaño del repositorio (0,8 GB) como cota superior del checkpoint. Es una estimación derivada, no un dato publicado.
- Almacenamiento: 0,8 GB de repositorio, más los logs y las grabaciones que genere RL Zoo.
- Despliegue: no aplica la pila de servido de LLM (vLLM, TGI, llama.cpp u Ollama no sirven para este artefacto). Las vías naturales son `stable-baselines3` (`DQN.load` + `model.predict`) o `python -m rl_zoo3.enjoy --algo dqn --env SpaceInvadersNoFrameskip-v4 -f logs/`.
- Throughput y latencia medidos: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento de los modelos comparables en la información proporcionada; la comparación es estructural.

| Modelo | Algoritmo | Politica | Entorno | Presupuesto | mean_reward | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `jos0054/dqn-SpaceInvadersNoFrameskip-v4` | DQN | `CnnPolicy` | SpaceInvadersNoFrameskip-v4 | 1.000.000 timesteps | 573,00 ± 66,75 | no disponible | HuggingFace |
| DQN de referencia de RL Zoo (misma tarea) | DQN | `CnnPolicy` | SpaceInvadersNoFrameskip-v4 | no disponible | no disponible | no disponible | RL Zoo |
| QR-DQN / C51 (sb3-contrib) | DQN distributional | `CnnPolicy` | Atari | no disponible | no disponible | no disponible | sb3-contrib |
| Rainbow (sb3-contrib) | DQN con componentes combinados | `CnnPolicy` | Atari | no disponible | no disponible | no disponible | sb3-contrib |

Diferencias cualitativas: frente a las variantes distributionales (C51, QR-DQN) y a Rainbow, este checkpoint usa el DQN canónico, sin duplicación de la estimación de Q (Double DQN) ni priorización en el replay buffer, y con un presupuesto de actualizaciones bajo. Frente a un PPO sobre el mismo entorno, la diferencia es de familia de algoritmo (off-policy con replay frente a on-policy), no de escala.

## Limitaciones y advertencias

- Especialización extrema: la política solo es válida para `SpaceInvadersNoFrameskip-v4`; no se ha evaluado en otras variantes de Atari ni con modificaciones del entorno (cambio de recompensas, de número de vidas o de resolución).
- Presupuesto de entrenamiento corto: 1.000.000 de timesteps está por debajo de lo habitual en Atari, por lo que el retorno declarado no refleja el techo del algoritmo y no debe citarse como resultado de referencia de DQN.
- Métrica no verificada: el campo `verified` del `model-index` es `false` y no se documentan semillas, número de episodios ni protocolo de evaluación; la reproducibilidad exacta del 573,00 ± 66,75 no está garantizada.
- Exploración residual: con `exploration_final_eps: 0.01`, la política conserva un 1 % de acciones aleatorias durante el entrenamiento; para evaluación debe usarse `deterministic=True` en `model.predict` o `enjoy`.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial ni para redistribución del checkpoint; hay que contactar con el autor o tratar el modelo como no reutilizable en producción.
- Sesgos y alucinación no aplican en el sentido de los LLM, pero sí existe el riesgo análogo de sobreajuste al entorno y de explotar artefactos del `AtariWrapper` (por ejemplo, el tratamiento de vidas y el recorte de recompensas) que no se trasladan fuera del emulador.
- Sin documentación de datos: al ser aprendizaje por interacción no hay dataset que auditar, pero tampoco hay información sobre el número de semillas, la varianza entre ejecuciones ni el hardware usado en el entrenamiento.
- Artefacto heredado de una plantilla: la model card sigue el formato automático de RL Zoo; no incluye análisis de fallos, vídeos ni discusión de limitaciones por parte del autor.
- Tamaño del repositorio: 0,8 GB para una política convolucional pequeña sugiere artefactos adicionales en el repo (por ejemplo, buffer de replay u otros ficheros); conviene inspeccionar el contenido antes de descargarlo en entornos con cuota.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jos0054/dqn-SpaceInvadersNoFrameskip-v4
- stable-baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Zoo (rl-baselines3-zoo): https://github.com/DLR-RM/rl-baselines3-zoo
- SB3 Contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- SBX (SB3 + Jax): https://github.com/araffin/sbx
