# Charlottej23/mujoco-office-tidy-robot-ppo

## Resumen

`mujoco-office-tidy-robot-ppo` es un modelo de aprendizaje por refuerzo (RL) entrenado con el algoritmo PPO de Stable-Baselines3 sobre un entorno de simulación MuJoCo 4.0 denominado `CustomWorld-v0`. El modelo controla un robot manipulador móvil que debe recoger objetos del suelo de una oficina simulada (una lata de refresco, un bloque de plástico y un vaso de papel) y depositarlos en un contenedor de reciclaje. Lo publica el usuario Charlottej23 en Hugging Face y no se trata de un modelo de lenguaje, sino de una política neuronal (MLP) que mapea observaciones del entorno a acciones de control continuo.

El interés técnico del artefacto reside en el entorno y en la tarea, no en la política en sí: el robot combina una base móvil holonómica de 2 grados de libertad, un brazo articulado de 4 DoF y una pinza paralela de dos dedos, sumando 7 actuadores en total. Es un caso representativo de manipulación móvil ("mobile manipulation") con recompensa escasa y horizonte largo, un problema habitual en robótica de manipulación.

La relevancia actual es limitada pero concreta: sirve como ejemplo reproducible de pipeline de RL en MuJoCo con Stable-Baselines3, y como punto de partida para experimentos de manipulación móvil en simulación. El rendimiento reportado por el autor es negativo (recompensa media de -353,51), lo que sugiere que la política no resuelve la tarea de forma fiable y debe interpretarse como un artefacto de investigación o de demostración, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal MLP (política PPO de Stable-Baselines3, `MlpPolicy`) sobre entorno MuJoCo |
| Parametros totales | No disponible (depende del tamaño de las capas de la MLP; no se especifica en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el horizonte lo define el episodio del entorno RL) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones del checkpoint) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | Pesos de Stable-Baselines3 (checkpoint `.zip` de la librería; no se listan ficheros individuales en la información disponible) |

## Arquitectura y entrenamiento

La política es una MLP entrenada con PPO (`stable-baselines3`) sobre el entorno `CustomWorld-v0`, definido en MuJoCo 4.0 mediante un fichero `world.xml`. El robot simulado consta de una base móvil holonómica de 2 DoF, un brazo articulado de 4 DoF y una pinza paralela de dos dedos, con un total de 7 actuadores. La tarea consiste en localizar y agarrar tres tipos de objetos (lata de refresco, bloque de plástico y vaso de papel) y colocarlos en un contenedor de reciclaje.

No se documentan en la información disponible el número de pasos de entrenamiento, la composición del dataset (en RL no aplica en el sentido habitual, sino la distribución de estados visitados), ni si se aplicaron técnicas de reward shaping, curricula o domain randomization. Tampoco se especifican hiperparámetros de PPO (learning rate, clip range, número de entornos en paralelo). El autor incluye scripts `train.py` y `run.py` para reentrenar y visualizar el entorno, lo que permite reproducir el pipeline, pero los detalles concretos del entrenamiento no están publicados.

## Capacidades

- Control continuo de un manipulador móvil de 7 actuadores en simulación MuJoCo.
- Navegación holonómica de una base móvil de 2 DoF en el plano.
- Manipulación con brazo de 4 DoF y pinza paralela para tareas de pick-and-place.
- Percepción basada en observaciones del simulador (no se documenta si incluye visión; la política es `MlpPolicy`, por lo que las observaciones son vectoriales, no imágenes).
- Ejecución de episodios completos en el entorno `CustomWorld-v0` con recompensa acumulada.
- Reentrenamiento mediante `train.py` con el flag `--timesteps` para continuar el aprendizaje.
- Visualización interactiva en el visor 3D de MuJoCo mediante `run.py`.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- **Reproducción de pipelines de RL en robótica**: el repositorio incluye `train.py` y `run.py`, lo que permite reentrenar la política y visualizar el comportamiento en el visor de MuJoCo; útil como plantilla para experimentos con Stable-Baselines3 y entornos personalizados.
- **Investigación en manipulación móvil**: el entorno `CustomWorld-v0` modela un robot con base holonómica y brazo de 4 DoF, un setup representativo para estudiar el acoplamiento entre navegación y manipulación en tareas de pick-and-place.
- **Benchmark interno de algoritmos de RL**: la recompensa media reportada (-353,51 ± 168,49) sirve como línea base para comparar variantes de PPO, SAC o TD3 sobre el mismo entorno.
- **Docencia en aprendizaje por refuerzo**: el ejemplo es autocontenido (MuJoCo + Stable-Baselines3 + scripts de entrenamiento y visualización) y adecuado para prácticas de RL con control continuo.
- **Pruebas de reward shaping**: dado el rendimiento negativo, el entorno es un banco de pruebas para diseñar funciones de recompensa alternativas que faciliten el aprendizaje de la tarea de recogida y depósito.
- **Simulación de tareas de limpieza en oficinas**: el escenario (recoger latas, bloques y vasos y depositarlos en un contenedor) puede adaptarse a estudios de robótica de servicio en entornos de oficina simulados.
- **Generación de datos sintéticos para imitación**: los rollouts del entorno pueden emplearse para generar trayectorias que alimenten algoritmos de imitation learning o de RL offline.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| PPO | CustomWorld-v0 | mean_reward | -353,51 ± 168,49 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, tasas de éxito en la tarea, número medio de pasos hasta completar el episodio o comparación con otros algoritmos) en la información disponible. El valor negativo y la alta desviación estándar indican un rendimiento bajo y muy variable entre episodios.

## Requisitos de hardware

- **VRAM estimada para inferencia**: mínima; al tratarse de una MLP pequeña sobre observaciones vectoriales, la inferencia cabe en cualquier GPU consumer e incluso puede ejecutarse en CPU con latencia baja.
- **GPU recomendadas**: no se requiere GPU dedicada para la inferencia. Para el reentrenamiento con PPO y múltiples entornos en paralelo, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060/4060 o superior); para entrenamientos largos, A100 o H100 aceleran la recolección de experiencia.
- **Compatibilidad con GPU consumer**: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU.
- **Opciones de despliegue**: Stable-Baselines3 (`model.predict`), MuJoCo para la simulación del entorno, y el visor interactivo de MuJoCo (`run.py`). No aplica vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- **Latencia y throughput**: no disponibles. La latencia vendrá dominada por el paso de simulación de MuJoCo, no por la inferencia de la política.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `Charlottej23/mujoco-office-tidy-robot-ppo` | PPO (MLP) | CustomWorld-v0 (MuJoCo) | No disponible | No aplica | mean_reward -353,51 ± 168,49 | No disponible | Hugging Face |
| `Charlottej23/connectailab-rl-charlottej23-v2-roadster-ppo` | PPO (PyTorch) | Humanoid-v5 (MuJoCo) | No disponible | No aplica | No disponible | No disponible | Hugging Face |
| Políticas PPO de referencia de Stable-Baselines3 | PPO (MLP) | Entornos MuJoCo estándar (HalfCheetah, Walker2d, etc.) | No disponible | No aplica | Resultados publicados en la documentación de SB3 | MIT (SB3) | Repositorio de SB3 |

La comparación es limitada: no se dispone de resultados de benchmarks de los modelos alternativos en el mismo entorno `CustomWorld-v0`, por lo que no es posible establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- **Rendimiento bajo**: la recompensa media reportada es negativa (-353,51) y con una desviación estándar muy alta (±168,49), lo que indica que la política no completa la tarea de forma consistente.
- **Sesgos**: no aplica en el sentido de sesgos sociales, pero la política puede estar sobreajustada a la distribución de estados del simulador y no generalizar a variaciones del entorno.
- **Alucinación**: no aplica (no es un modelo generativo de lenguaje). El riesgo equivalente es la ejecución de acciones no válidas o inseguras en el simulador.
- **Limitaciones de contexto e idioma**: no procesa lenguaje natural ni texto; no tiene ventana de contexto.
- **Licencia**: no disponible; no se puede confirmar el uso comercial. Conviene contactar con el autor antes de cualquier uso en producción.
- **Simulación frente a realidad**: el modelo se entrena y evalúa únicamente en MuJoCo; no hay evidencia de transferencia a un robot físico (sim-to-real).
- **Reproducibilidad**: no se documentan hiperparámetros, número de pasos ni semillas, lo que dificulta reproducir exactamente el resultado reportado.
- **Mantenimiento**: el repositorio tiene 0 descargas y 0 likes, y no se ha actualizado desde su creación; el soporte de la comunidad es nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlottej23/mujoco-office-tidy-robot-ppo
- Vídeo de replay: https://huggingface.co/Charlottej23/mujoco-office-tidy-robot-ppo/resolve/main/replay.mp4
- Modelo relacionado del mismo autor: https://huggingface.co/Charlottej23/connectailab-rl-charlottej23-v2-roadster-ppo
- Documentación de MuJoCo: https://mujoco.readthedocs.io/
- Stable-Baselines3 (librería de entrenamiento): no disponible en la búsqueda web proporcionada
- Paper de PPO: no disponible en la búsqueda web proporcionada
