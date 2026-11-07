# Jasmin71/connectailab-rl-mihyun-v1-link01-walk-ppo

## Resumen

`connectailab-rl-mihyun-v1-link01-walk-ppo` es una política de control entrenada con aprendizaje por refuerzo (PPO) para que el robot bípedo simulado LINK-01 aprenda a caminar hacia delante. Lo desarrolla Jasmin71 (Lee Mihyun), investigador principal de AI CITY BUILDERS y CONNECT AI LAB, en el marco del curso de RL "AI 7강". El modelo no es un LLM: es un artefacto de `stable-baselines3` que contiene los pesos de una red de política entrenada sobre el entorno `Link01Walk-v0` (basado en MuJoCo a través de `link01-gym`).

El problema que resuelve es la locomoción bípeda desde cero: dado un vector de observación de 51 dimensiones, produce 14 acciones articulares (con una postura base de ±0,18 rad) para desplazar el robot a una velocidad comandada de 0,18 m/s. Según la model card, la política completó 5 episodios de 20 segundos recorriendo 4,251 m por episodio, con una velocidad media de 0,2125 m/s y cero caídas por minuto.

Su relevancia es acotada y de nicho: se trata de un checkpoint de investigación docente con 0 descargas y 0 likes en el momento de la consulta, útil como referencia reproducible de un pipeline PPO completo (entrenamiento con 32 entornos paralelos, normalización de observaciones con `VecNormalize` y exportación del actor a JSON) más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política (actor) entrenada con PPO sobre `stable-baselines3`; no se detalla la topología de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 51 dimensiones por paso |
| Tipos de cuantizacion | no disponible (artefacto RL en formato `.zip` de SB3 y `actor.json`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (checkpoint SB3), `vecnormalize.pkl` (estadísticas de normalización), `actor.json` (exportación del actor) |

## Arquitectura y entrenamiento

La política se entrena con PPO (Proximal Policy Optimization) implementado en `stable-baselines3`, con un espacio de observación de 51 dimensiones y un espacio de acción continuo de 14 dimensiones correspondiente a las 14 articulaciones del robot LINK-01. La postura base se fija en ±0,18 rad. El entrenamiento se realiza sobre el entorno `Link01WalkGuided-v0` (variante guiada del entorno `Link01Walk-v0` de `link01-gym`, simulado en MuJoCo), con normalización de observaciones mediante `VecNormalize` y 32 entornos ejecutados en paralelo.

Los hiperparámetros declarados son: `n_steps` 256, learning rate 0,0003, `gamma` 0,99, `gae_lambda` 0,95, `clip_range` 0,2 y semilla 42. El total de pasos de entrenamiento asciende a 1.536.000, con un tiempo de cómputo declarado de 4,4 minutos. No se especifica la composición del dataset (al tratarse de RL, la experiencia se genera por interacción con el simulador), ni si hubo fases adicionales de ajuste fino o currículo más allá del entorno "guided". Tampoco se detalla la arquitectura interna de la red (número de capas, unidades por capa, funciones de activación).

## Capacidades

- Control locomotor bípedo: genera comandos articulares continuos de 14 dimensiones para desplazar el robot hacia delante en el simulador MuJoCo.
- Seguimiento de velocidad comandada: entrenado para una consigna de 0,18 m/s, con velocidad media medida de 0,2125 m/s.
- Estabilidad en episodios cortos: 0 caídas por minuto declaradas en la evaluación de 5 episodios de 20 segundos.
- Normalización de observaciones integrada: el artefacto `vecnormalize.pkl` permite reproducir el preprocesado exacto usado en entrenamiento.
- Exportación del actor a JSON (`actor.json`), lo que facilita la inspección o el despliegue de la política fuera de Python.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control, no un modelo generativo.

## Casos de uso

- Reproducción de un pipeline PPO docente: cargar `model.zip` y `vecnormalize.pkl` con `stable-baselines3` para replicar el entrenamiento y la evaluación de referencia en `Link01Walk-v0`, útil en cursos de RL.
- Banco de pruebas de locomoción bípeda: usar la política como línea base frente a nuevas variantes de recompensa o de entorno en `link01-gym`, comparando distancia, velocidad y tasa de caídas con los valores declarados (4,251 m, 0,2125 m/s, 0 caídas/min).
- Integración en simulación MuJoCo para visualización: cargar `actor.json` en un runtime ligero para reproducir la marcha en un visor o en un vídeo de demostración, como el `replay.mp4` de la model card.
- Estudio de normalización de observaciones: analizar el efecto de `VecNormalize` en la estabilidad de la marcha comparando políticas entrenadas con y sin normalización sobre el mismo entorno.
- Docencia y divulgación: ejemplo mínimo y autocontenido de entrenamiento con 32 entornos paralelos, 1.536.000 pasos y 4,4 minutos de cómputo, adecuado para explicar el ciclo completo de PPO en robótica.
- Transferencia a otros robots bípedos simulados: servir de punto de partida para reentrenar la política en morfologías similares dentro de MuJoCo, ajustando dimensiones de observación y acción.
- Evaluación de robustez: someter la política a perturbaciones o cambios de terreno en el simulador para medir su degradación respecto al escenario nominal de velocidad 0,18 m/s.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor | Entorno / condicion |
|---|---|---|
| Distancia por episodio de 20 s | 4,251 m | `Link01Walk-v0`, comando 0,18 m/s, 5 episodios × 20 s |
| Velocidad media de avance | 0,2125 m/s | misma condición |
| Caídas por minuto | 0,0 | misma condición |

No se han publicado en la información disponible resultados comparativos con otras políticas ni con modelos de referencia (por ejemplo, baselines de MuJoCo como Ant, HalfCheetah o Humanoid), por lo que no es posible establecer una comparación cuantitativa fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño típico de una política PPO para 51 observaciones y 14 acciones, la inferencia cabe holgadamente en CPU y en cualquier GPU consumer, pero no se aportan cifras.
- GPU recomendadas: no se especifican; el entrenamiento declarado de 4,4 minutos con 32 entornos sugiere hardware moderado, sin detallar modelo.
- Compatibilidad con GPU consumer: previsiblemente sí (RTX 4090 y gamas inferiores), aunque no está confirmado en la información disponible.
- Opciones de despliegue: `stable-baselines3` (carga de `model.zip` + `vecnormalize.pkl`), exportación del actor a JSON para runtimes propios, y simulación en MuJoCo mediante `link01-gym`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `connectailab-rl-mihyun-v1-link01-walk-ppo` | Política PPO (SB3) | `Link01Walk-v0` (MuJoCo) | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| `Jasmin71/connectailab-rl-mihyun-v1-link01` | Modelo RL del mismo autor | no disponible | no disponible | no aplica | no disponible | Hugging Face |
| `Jasmin71/connectailab-rl-mihyun-v1-lunarlander` | Modelo RL del mismo autor | LunarLander | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a tipo de tarea, entorno y disponibilidad.

## Limitaciones y advertencias

- Ámbito muy restringido: es una política de locomoción para un robot concreto (LINK-01) en un simulador concreto (`Link01Walk-v0`); no generaliza a otros robots, terrenos o tareas sin reentrenamiento.
- Métricas no verificadas: los resultados (4,251 m, 0,2125 m/s, 0 caídas/min) están marcados como `verified: false` y proceden únicamente del autor.
- Evaluación limitada: solo 5 episodios de 20 segundos; no hay datos sobre robustez ante perturbaciones, cambios de pendiente, fricción variable o comandos de velocidad distintos de 0,18 m/s.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de cualquier uso fuera de investigación.
- Sin datos de arquitectura interna ni de número de parámetros, lo que dificulta estimar coste de inferencia o comparar con otras políticas.
- Trazabilidad escasa: 0 descargas y 0 likes en el momento de la consulta, sin publicaciones o papers asociados más allá de la model card.
- Riesgo de sobreajuste al escenario nominal: la tasa de caídas nula en el entorno de evaluación no implica estabilidad fuera de las condiciones de entrenamiento.
- No es un modelo de lenguaje: no admite prompts, tool calling ni generación de texto; cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jasmin71/connectailab-rl-mihyun-v1-link01-walk-ppo
- Modelo relacionado del mismo autor: https://huggingface.co/Jasmin71/connectailab-rl-mihyun-v1-link01
- Modelo relacionado del mismo autor (LunarLander): https://huggingface.co/Jasmin71/connectailab-rl-mihyun-v1-lunarlander
