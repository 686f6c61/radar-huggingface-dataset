# JSI123/a2c-PandaReachDense-v3

## Resumen

El modelo `JSI123/a2c-PandaReachDense-v3` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Advantage Actor Critic (A2C) para controlar un brazo roboticos Franka Panda en la tarea de alcanzar una posicion objetivo con el efector final. No se trata de un modelo de lenguaje ni de un modelo generativo: es una politica neuronal que mapea observaciones del entorno `PandaReachDense-v3` (definido en Panda-Gym) a acciones continuas de control del robot.

El entrenamiento se realizo con Stable-Baselines3, una implementacion de referencia de algoritmos de RL, durante 1.000.000 de pasos con 4 entornos paralelos, normalizacion de observaciones y de recompensa, y semilla aleatoria 42. La politica empleada es `MultiInputPolicy`, lo que implica que el agente procesa observaciones compuestas (tipicamente estado propioceptivo del robot y posicion del objetivo). El resultado de evaluacion reportado es una recompensa media de -0,2246 con desviacion tipica de 0,1156 sobre 100 episodios, superando el umbral de certificacion de -3,5 exigido en el entorno.

Su relevancia es acotada: se trata de un artefacto de investigacion y demostracion de RL aplicado a robotica, con cero descargas y cero likes en el momento de la ficha, y sin licencia declarada. Es util como referencia reproducible de un baseline A2C en una tarea de alcance densa, no como componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica y critico (A2C, Advantage Actor Critic) con `MultiInputPolicy`; topologia exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de episodio definido por el entorno `PandaReachDense-v3` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | archivo `.zip` de Stable-Baselines3 (`a2c-PandaReachDense-v3.zip`), mas `vec_normalize.pkl` para estadisticas de normalizacion |

## Arquitectura y entrenamiento

El agente sigue el esquema actor-critico de A2C: una red de politica que produce la distribucion de acciones y una red de valor que estima el retorno, optimizadas conjuntamente con ventaja estimada. La politica es `MultiInputPolicy`, disenada para observaciones con multiples componentes (por ejemplo, estado del robot y posicion del objetivo), aunque la arquitectura concreta de las capas no se detalla en la model card. No se especifica si hay comparticion de tronco entre actor y critico ni el numero de unidades por capa.

El entrenamiento uso 1.000.000 de timesteps, 4 entornos paralelos, normalizacion de observaciones y de recompensa (con estadisticas guardadas en `vec_normalize.pkl`) y semilla 42. No se documenta composicion de datos adicional, uso de RLHF/DPO (no aplica en RL clasico) ni innovaciones tecnicas mas alla del pipeline estandar de Stable-Baselines3. El repositorio incluye `train.py` y `requirements.txt`, lo que permite reproducir el entrenamiento.

## Capacidades

- Control continuo de un brazo roboticos Franka Panda para alcanzar una posicion objetivo con el efector final.
- Aprendizaje por refuerzo con recompensa densa (variante `Dense` del entorno), lo que facilita la senal de aprendizaje durante el entrenamiento.
- Procesamiento de observaciones compuestas mediante `MultiInputPolicy`.
- Normalizacion de observaciones y recompensas integrada en el artefacto desplegado.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues, de vision, audio ni modo de pensamiento.
- Capacidad especial: ninguna mas alla de la tarea de control especifica; el repositorio incluye `replay.mp4` como demostracion visual del comportamiento.

## Casos de uso

- Baseline reproducible para investigacion en RL roboticos: sirve como referencia A2C en `PandaReachDense-v3` para comparar nuevos algoritmos (PPO, SAC, TD3) bajo el mismo pipeline de Stable-Baselines3 y semilla 42.
- Docencia y formacion en aprendizaje por refuerzo: el repositorio incluye `train.py`, `requirements.txt` y resultados de evaluacion, lo que permite montar practicas guiadas sobre entrenamiento y evaluacion de agentes.
- Validacion de pipelines de entrenamiento: util para comprobar que la infraestructura de entornos paralelos, normalizacion y evaluacion funciona antes de escalar a tareas mas complejas.
- Pruebas de simulacion de control de efector final: permite experimentar con politicas de alcance en simulacion antes de transferir a entornos reales o a variantes mas dificiles de Panda-Gym.
- Referencia para comparacion de hiperparametros: el uso de 4 entornos paralelos y 1M de timesteps documentado permite estudiar el efecto de cambiar estos valores sobre la recompensa media.
- Demostracion visual de comportamiento aprendido: el archivo `replay.mp4` puede usarse en presentaciones o material divulgativo sobre robotica y RL.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Entorno | PandaReachDense-v3 |
| Episodios de evaluacion | 100 |
| Recompensa media | -0,2246 |
| Desviacion tipica | 0,1156 |
| Puntuacion de certificacion (media - desviacion) | -0,3402 |
| Puntuacion de certificacion requerida | -3,5 |
| Estado | Aprobado |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una politica de RL de pequeno tamano, es previsible que quepa en GPU consumer, pero no se aporta cifra concreta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada en la informacion proporcionada.
- Opciones de despliegue: carga mediante Stable-Baselines3 (`A2C.load`) con el archivo `.zip` y `vec_normalize.pkl`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Timesteps | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JSI123/a2c-PandaReachDense-v3 | A2C | PandaReachDense-v3 | 1.000.000 | -0,2246 +/- 0,1156 | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un agente de RL, su comportamiento esta limitado al entorno y distribucion de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje; el riesgo real es de sobreajuste al simulador y falta de generalizacion a variaciones del entorno.
- Limitaciones de contexto o idioma: no aplica; el agente solo opera en `PandaReachDense-v3`.
- Restricciones de licencia: la licencia no esta declarada, por lo que no se puede asumir uso comercial permitido; conviene contactar al autor antes de cualquier uso en produccion.
- Caveat importante: el modelo tiene cero descargas y cero likes, lo que sugiere ausencia de validacion externa; el rendimiento reportado proviene unicamente del autor.
- La recompensa media negativa (-0,2246) indica que el agente no alcanza el objetivo de forma perfecta en todos los episodios; la desviacion tipica de 0,1156 refleja variabilidad en el desempeno.
- El repositorio tiene un tamano reportado de 0.0 GB, lo que puede indicar que los archivos no estan completamente subidos o que el tamano se redondea; conviene verificar antes de la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JSI123/a2c-PandaReachDense-v3
- Stable-Baselines3 (documentacion): https://stable-baselines3.readthedocs.io/
- Panda-Gym (entorno `PandaReachDense-v3`): https://github.com/qgallouedec/panda-gym
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos distintos de los enlaces anteriores.
