# rabitrabi/ppo-LunarLander-v2

## Resumen

`rabitrabi/ppo-LunarLander-v2` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 para el entorno LunarLander-v2 de Gymnasium. Lo desarrolla el usuario rabitrabi como ejercicio del Módulo 1 del curso de Deep Reinforcement Learning de Hugging Face, y no es un modelo de lenguaje ni un transformer generativo: es una política neuronal que selecciona entre cuatro acciones discretas para controlar el aterrizaje de una nave en una plataforma.

El agente se entrenó desde cero durante 737.280 pasos de entorno y se evaluó sobre 50 rollouts deterministas con semillas de entorno 58000 a 58049, obteniendo una recompensa media de 256,75 con una desviación estándar poblacional de 20,54. La selección del checkpoint se hizo con un conjunto separado de 12 semillas, lo que reduce el riesgo de sobreajuste a las semillas de evaluación.

Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo reproducible de un pipeline completo de RL (entrenamiento, evaluación con semillas fijas, generación de replay y artefactos de evaluación) y como punto de partida para quien quiera replicar el flujo con Stable-Baselines3. No está pensado para uso en producción ni para tareas fuera del entorno LunarLander-v2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal MLP (actor-crítico) entrenada con PPO sobre Stable-Baselines3; detalles de capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observación de 8 dimensiones en LunarLander-v2) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Stable-Baselines3 (`.zip`); el tamaño del repo figura como 0.0 GB |
| Entorno | LunarLander-v2 (Gymnasium) |
| Espacio de acciones | 4 acciones discretas |
| Pasos de entrenamiento | 737.280 pasos de entorno |

## Arquitectura y entrenamiento

El modelo es un agente PPO implementado con Stable-Baselines3. PPO es un método de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) que entrena simultáneamente una política (actor) y una función de valor (crítico); en la configuración por defecto de Stable-Baselines3 ambas suelen compartir extractor de características y usan una MLP. La model card no especifica el número de capas, unidades ocultas, hiperparámetros de PPO (learning rate, clip range, epochs, batch size) ni la composición del buffer de rollout.

El entrenamiento se realizó desde cero durante 737.280 pasos de entorno en LunarLander-v2, un entorno de control continuo con observaciones de 8 dimensiones (posición, velocidad, ángulo, velocidad angular, contacto con patas) y 4 acciones discretas (no hacer nada, encender motor principal, encender motor lateral izquierdo, encender motor lateral derecho). La recompensa combina proximidad al pad, velocidad de aterrizaje, orientación y penalizaciones por uso de motores y por accidente. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, que no aplican a este tipo de modelo. La selección de checkpoint se hizo con 12 semillas separadas de las 50 usadas en la evaluación final, una buena práctica para evitar selección sesgada.

## Capacidades

- Control de política en el entorno LunarLander-v2: selecciona entre 4 acciones discretas para aterrizar la nave en la plataforma.
- Aprendizaje por refuerzo con PPO: política estocástica en entrenamiento y determinista en evaluación.
- Evaluación reproducible: incluye `evaluation.json` con los retornos por episodio y un script `replay.py` para renderizar el primer episodio de evaluación.
- Reproducibilidad del entrenamiento: `train.py` y `requirements.txt` permiten reentrenar el agente.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento extendido; no es un modelo de lenguaje.

## Casos de uso

- Docencia y aprendizaje de RL: sirve como ejemplo completo y reproducible del Módulo 1 del curso de Deep RL de Hugging Face, con scripts de entrenamiento, evaluación y replay listos para ejecutar.
- Referencia de evaluación rigurosa: el uso de semillas separadas para selección de checkpoint y para evaluación final es un patrón que se puede replicar en otros proyectos de RL para evitar sobreajuste a las semillas de test.
- Punto de partida para experimentos con PPO: se puede modificar `train.py` para cambiar hiperparámetros, número de pasos o arquitectura de la política y comparar curvas de aprendizaje.
- Benchmark de infraestructura de RL: al ser un entorno ligero, es útil para validar pipelines de entrenamiento, logging y generación de vídeos con FFmpeg antes de escalar a entornos más costosos.
- Generación de material divulgativo: el vídeo `replay.mp4` y el script `replay.py` permiten producir clips del agente aterrizando para tutoriales o presentaciones.
- Base para comparativas de algoritmos: se puede reentrenar con otros algoritmos de Stable-Baselines3 (A2C, DQN) sobre el mismo entorno y comparar recompensa media y varianza con la referencia de 256,75 ± 20,54.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset/entorno | Métrica | Valor |
|---|---|---|---|
| Reinforcement learning | LunarLander-v2 | Mean reward | 256,75 ± 20,54 |
| Reinforcement learning | LunarLander-v2 | Course score (media − desviación estándar) | 236,20 |

La evaluación se realizó sobre 50 rollouts deterministas con semillas de entorno 58000 a 58049. La selección de checkpoint usó 12 semillas separadas. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el entorno LunarLander-v2 y una política MLP de tamaño reducido caben holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU compatible con PyTorch sirve. Para entrenamiento, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) acelera notablemente los 737.280 pasos, aunque el entrenamiento también es viable en CPU.
- GPU consumer: sí, cabe en cualquier GPU consumer; también funciona en CPU.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load(...)` sobre el checkpoint `.zip`), Gymnasium para el entorno, y FFmpeg para renderizar vídeos con `replay.py`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rabitrabi/ppo-LunarLander-v2 | LunarLander-v2 | PPO | 256,75 ± 20,54 | no disponible | Hugging Face |
| Política PPO de referencia de Stable-Baselines3 | LunarLander-v2 | PPO | no disponible en esta ficha | MIT (código de SB3) | Documentación de SB3 |
| Otros agentes del curso de Deep RL de Hugging Face | LunarLander-v2 | PPO | no disponible | variable según autor | Hugging Face |

No se dispone de datos de benchmarks de alternativas concretas en la información proporcionada; la comparativa se limita a señalar la existencia de políticas PPO de referencia en la documentación de Stable-Baselines3 y de otros agentes del mismo curso, sin cifras comparables verificadas.

## Limitaciones y advertencias

- Modelo específico para LunarLander-v2: no generaliza a otros entornos ni tareas; no es un modelo de lenguaje ni un modelo generativo.
- Sesgos conocidos: la política puede estar ajustada a la dinámica y distribución de recompensas de LunarLander-v2 y a las semillas empleadas; el rendimiento fuera de ese régimen no está caracterizado.
- Riesgo de sobreajuste a semillas: aunque se usaron 12 semillas separadas para selección de checkpoint, el conjunto de evaluación es finito y la varianza entre semillas es apreciable (± 20,54).
- Resultados no verificados: el `model-index` marca la métrica como `verified: false`; los números proceden del autor y no de una evaluación independiente.
- Licencia no disponible: no se especifica licencia, por lo que no se puede asumir permiso para uso comercial ni redistribución. Conviene contactar con el autor antes de cualquier uso más allá de la experimentación personal.
- Idiomas: no aplica; el modelo no procesa texto.
- Tamaño del repo: figura como 0.0 GB, lo que sugiere que los artefactos pueden ser muy ligeros o que el peso del checkpoint no está cuantificado en la metadata; conviene revisar los archivos reales del repositorio.
- Para producción: no es un componente adecuado; su valor es didáctico y de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rabitrabi/ppo-LunarLander-v2
- Curso de Deep Reinforcement Learning de Hugging Face (contexto del entrenamiento): https://huggingface.co/learn/deep-rl-course
- Stable-Baselines3 (librería utilizada): https://stable-baselines3.readthedocs.io/
- Entorno LunarLander-v2 en Gymnasium: https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Documentación de PPO en Stable-Baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html
