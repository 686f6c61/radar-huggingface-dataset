# hiupjump/connectailab-rl-hiupjump-v1-link01-walk-ppo

## Resumen

`connectailab-rl-hiupjump-v1-link01-walk-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) para controlar la locomoción bípeda del robot simulado LINK-01 en el entorno `Link01Walk-v0` del paquete `link01-gym`, construido sobre el simulador físico MuJoCo. Lo publica el usuario `hiupjump` en el marco de la iniciativa CONNECT AI LAB / AI CITY BUILDERS, en concreto como resultado de la séptima lección de su curso de aprendizaje por refuerzo.

No se trata de un modelo de lenguaje, sino de una política neuronal que mapea observaciones de 51 dimensiones (estado de las articulaciones, sensores del robot) a acciones de 14 dimensiones (un valor por articulación, con una postura por defecto de ±0,18 rad). El entrenamiento se realizó desde cero con Stable-Baselines3, acumulando 311.296 pasos en aproximadamente 9,2 minutos de cómputo, con una tasa de aprendizaje de 0,0003 y un clip de 0,2.

Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo reproducible de un pipeline completo de RL para robótica (entorno, entrenamiento, evaluación y artefactos exportados), más que como política lista para producción. Los resultados declarados por el autor son modestos: 0,099 m recorridos por episodio de 20 s (0,0049 m/s de velocidad media) y cero caídas por minuto, lo que indica que el robot se mantiene estable pero apenas avanza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de RL (PPO, Stable-Baselines3); topología de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL; observación de 51 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en `model.zip` de SB3) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl`, `actor.json` |

## Arquitectura y entrenamiento

El agente se entrena con PPO sobre el entorno `link01_gym:Link01WalkGuided-v0` (variante guiada de `Link01Walk-v0`), un simulador MuJoCo de un robot bípedo con 14 articulaciones. La política recibe un vector de observación de 51 dimensiones y emite 14 acciones continuas, una por articulación, normalizadas en torno a una postura por defecto de ±0,18 rad. El entrenamiento se ejecutó con Stable-Baselines3 durante 311.296 pasos, con `learning_rate` de 0,0003 y `clip_range` de 0,2, en un total de 9,2 minutos de cómputo.

El repositorio incluye los tres artefactos habituales de este tipo de pipelines: `model.zip` (pesos de la política y del crítico), `vecnormalize.pkl` (estadísticas de normalización de observaciones y recompensas, imprescindible para reproducir la inferencia) y `actor.json` (exportación de la política del actor). No se documenta la composición del dataset (el agente aprende por interacción con el simulador, no de datos supervisados), ni si hubo ajuste fino posterior, ni detalles de la red (número de capas y unidades). No se menciona ninguna innovación técnica adicional más allá del propio PPO.

## Capacidades

- Control de locomoción bípeda en simulación: genera comandos articulares continuos para mantener al robot LINK-01 en pie.
- Estabilidad postural: los resultados declarados indican 0,0 caídas por minuto durante la evaluación.
- Desplazamiento hacia delante limitado: 0,099 m por episodio de 20 s, equivalente a 0,0049 m/s de velocidad media.
- Seguimiento de comandos de velocidad: la evaluación se realizó con un comando de 0,18 m/s, aunque el rendimiento efectivo queda muy por debajo de esa referencia.
- Integración con Stable-Baselines3: la política se puede cargar con `PPO.load()` y reproducir con las estadísticas de `vecnormalize.pkl`.
- Exportación de la política: el archivo `actor.json` permite reutilizar la red del actor fuera del ecosistema SB3.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Docencia y tutoriales de RL: sirve como ejemplo completo de un pipeline PPO para robótica (entorno MuJoCo, entrenamiento SB3, evaluación y artefactos), adecuado para la lección 7 del curso AI CITY BUILDERS.
- Reproducción de experimentos: cargando `model.zip` y `vecnormalize.pkl` se puede replicar la evaluación declarada (5 episodios de 20 s con comando de 0,18 m/s) y comparar con variantes propias.
- Punto de partida para ajuste fino: al ser una política entrenada desde cero en 311.296 pasos, sirve como inicialización para experimentos con más pasos, recompensas alternativas o comandos de velocidad más exigentes.
- Pruebas de integración de simuladores: útil para validar que un pipeline `link01-gym` + MuJoCo + SB3 funciona de extremo a extremo antes de invertir en entrenamientos largos.
- Benchmark interno de referencia: los valores de 0,099 m por episodio, 0,0049 m/s y 0 caídas por minuto permiten establecer una línea base mínima contra la que medir mejoras.
- Estudio de estabilidad frente a locomoción: dado que el agente no cae pero apenas avanza, es un caso útil para analizar el equilibrio entre recompensa de estabilidad y recompensa de avance en el diseño del entorno.
- Demostración visual: el repositorio incluye un `replay.mp4` que puede usarse en presentaciones o material divulgativo sobre RL aplicado a robótica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre el entorno `Link01Walk-v0` con comando de 0,18 m/s, 5 episodios de 20 s:

| Metrica | Valor |
|---|---|
| Distancia por episodio de 20 s (m) | 0,099 |
| Velocidad media de avance (m/s) | 0,0049 |
| Caidas por minuto | 0,0 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB (red pequeña de política para 51 observaciones y 14 acciones), por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; para entrenamiento con MuJoCo, cualquier GPU con soporte CUDA es suficiente, y el propio autor completó 311.296 pasos en 9,2 minutos (hardware no indicado).
- Cabe en GPU consumer: sí, con total seguridad, dado el reducido tamaño del modelo y del entorno.
- Opciones de despliegue: carga mediante Stable-Baselines3 (`PPO.load`) con `VecNormalize.load` para las estadísticas; no aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros agentes de RL para el robot LINK-01 ni de políticas comparables en `link01-gym`, por lo que no es posible establecer una comparativa rigurosa con parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Rendimiento muy limitado: 0,0049 m/s de velocidad media está muy por debajo del comando de 0,18 m/s, por lo que el agente es esencialmente estable pero no locomotor en términos prácticos.
- Resultados no verificados: las métricas de la model card están marcadas como `verified: false` y proceden únicamente del autor.
- Dependencia del entorno: la política solo es válida para `Link01Walk-v0` / `Link01WalkGuided-v0` con la misma configuración de observaciones (51) y acciones (14) y la misma postura por defecto (±0,18 rad).
- Dependencia de `vecnormalize.pkl`: omitir las estadísticas de normalización al cargar el modelo altera el comportamiento de la política.
- Simulación frente a realidad: no hay evidencia de transferencia sim-to-real; el agente se entrenó y evaluó exclusivamente en MuJoCo.
- Licencia no disponible: no se puede asumir permiso para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso fuera del ámbito didáctico.
- Idiomas no disponibles: no aplica, al no ser un modelo de lenguaje; no tiene capacidades de generación de texto, código ni razonamiento.
- Sin información sobre sesgos, alucinación o robustez frente a perturbaciones del entorno.
- Documentación escasa: no se detallan la topología de red, el hardware de entrenamiento ni la composición exacta de la recompensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hiupjump/connectailab-rl-hiupjump-v1-link01-walk-ppo
- Repositorio de Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Documentación de PPO en Stable-Baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html
- Simulador MuJoCo: https://mujoco.org/
- Paper de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
- Paquete `link01-gym`: no disponible (no se proporciona enlace en la información recibida)
- Vídeo de replay (`replay.mp4`): referenciado en la model card del repositorio de Hugging Face
