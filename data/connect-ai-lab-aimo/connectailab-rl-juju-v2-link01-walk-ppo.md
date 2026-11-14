# connect-ai-lab-aimo/connectailab-rl-juju-v2-link01-walk-ppo

## Resumen

`connectailab-rl-juju-v2-link01-walk-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3. Lo desarrolla `connect-ai-lab-aimo` en el marco del programa AI CITY BUILDERS (lección 7 de refuerzo) de CONNECT AI LAB. El objetivo es que un robot bípedo denominado LINK-01 aprenda a caminar desde cero en el entorno simulado `Link01Walk-v0`, implementado sobre MuJoCo a través de la librería `link01-gym`.

No es un modelo de lenguaje: es una política de control motor. El espacio de observación tiene 51 dimensiones y el de acciones 14 (una por articulación), con una postura base de ±0,18 rad. El agente se entrenó durante 500 000 pasos en aproximadamente 21,6 minutos de cómputo, con una tasa de aprendizaje de 0,0003 y un clip de 0,2.

Su relevancia es fundamentalmente didáctica y de investigación en locomoción: el rendimiento declarado es muy bajo (0,047 m recorridos por episodio de 20 s, 0,0024 m/s de velocidad media), lo que lo convierte en una línea base honesta para estudiar el arranque del aprendizaje de la marcha, no en un controlador listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de red neuronal para RL (PPO, Stable-Baselines3); topología de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL; observación de 51 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl`, `actor.json` |

## Arquitectura y entrenamiento

El agente sigue el algoritmo PPO implementado en Stable-Baselines3, con un espacio de observación de 51 dimensiones y un espacio de acción continuo de 14 dimensiones correspondiente a las 14 articulaciones del robot LINK-01, con postura base de ±0,18 rad. El entorno `Link01Walk-v0` se ejecuta sobre MuJoCo mediante `link01-gym`. Se incluye un fichero `vecnormalize.pkl`, lo que indica que el entrenamiento aplicó normalización de observaciones y recompensas mediante `VecNormalize`, un paso habitual para estabilizar PPO en tareas de control continuo.

El entrenamiento consistió en 500 000 pasos durante 21,6 minutos, con tasa de aprendizaje 0,0003 y parámetro de clip 0,2. No se documentan detalles sobre la función de recompensa, la composición del currículo, el número de entornos paralelos ni la semilla utilizada. Tampoco se especifica si hubo ajuste fino posterior o evaluación con múltiples semillas. Los resultados declarados no están verificados (`verified: false` en la model-index).

## Capacidades

- Control motor de locomoción bípeda: genera comandos articulares continuos de 14 dimensiones para el robot LINK-01 en simulación MuJoCo.
- Marcha estable sin caídas en la evaluación declarada: 0,0 caídas por minuto en 5 episodios de 20 s.
- Desplazamiento limitado: 0,047 m por episodio de 20 s y velocidad media de 0,0024 m/s, muy por debajo del comando de referencia de 0,18 m/s.
- Compatible con el ecosistema Stable-Baselines3: se puede cargar con `PPO.load()` y reproducir con el `vecnormalize.pkl` asociado.
- Exportación parcial de política: incluye `actor.json`, lo que facilita inspeccionar o reutilizar la red de actor fuera del entorno Python.
- No soporta tool calling, agentes multi-paso, capacidades multilingües, visión, audio ni generación de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo reproducible de un pipeline PPO completo (entorno, normalización, entrenamiento y evaluación) para cursos introductorios de RL en robótica.
- Línea base de locomoción bípeda: permite comparar nuevos algoritmos o recompensas contra un punto de partida conocido con métricas declaradas (distancia, velocidad, caídas).
- Estudio del arranque del aprendizaje: con 500 000 pasos y 21,6 minutos de entrenamiento, es útil para analizar curvas de aprendizaje tempranas y el efecto de la normalización de observaciones.
- Depuración de entornos MuJoCo: el agente y el `vecnormalize.pkl` permiten validar que `Link01Walk-v0` se comporta de forma consistente antes de escalar a entrenamientos más largos.
- Pruebas de integración con Stable-Baselines3: útil para verificar versiones de la librería, carga de políticas y compatibilidad con `VecNormalize` en pipelines de CI.
- Experimentos de simulación a realidad: como política inicial de bajo rendimiento, sirve para estudiar transferencia sim-a-real y estrategias de ajuste fino con datos reales del robot LINK-01.
- Reproducción de resultados: al incluir `model.zip`, `vecnormalize.pkl` y `actor.json`, permite replicar la evaluación declarada (5 episodios de 20 s con comando de 0,18 m/s) y auditar las métricas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning / walking | Link01Walk-v0 | Distancia por episodio de 20 s (m) | 0,047 |
| reinforcement-learning / walking | Link01Walk-v0 | Velocidad media hacia delante (m/s) | 0,0024 |
| reinforcement-learning / walking | Link01Walk-v0 | Caídas por minuto | 0,0 |

No se han publicado resultados de benchmarks comparativos con otros agentes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del artefacto (`model.zip` y `actor.json` en un repo de 0,0 GB) se trata de una política de red neuronal pequeña que previsiblemente cabe en CPU y en cualquier GPU consumer, aunque no se especifican cifras.
- GPU recomendadas: no disponible. Para entrenamiento de 500 000 pasos en 21,6 minutos, cualquier GPU moderna es suficiente; el entorno MuJoCo es principalmente limitado por CPU.
- Compatibilidad con GPU consumer: previsiblemente sí (RTX 3060 o superior), aunque no se documenta.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load`), MuJoCo con `link01-gym`, exportación del actor mediante `actor.json` para inferencia ligera en Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros agentes PPO para el robot LINK-01 ni políticas de locomoción comparables con métricas publicadas en el mismo entorno `Link01Walk-v0`.

## Limitaciones y advertencias

- Rendimiento muy bajo: 0,047 m por episodio de 20 s y 0,0024 m/s, frente a un comando de referencia de 0,18 m/s; el agente apenas se desplaza.
- Resultados no verificados: la model-index marca las métricas como `verified: false` y no se detalla el protocolo de evaluación ni el número de semillas.
- Entrenamiento corto: 500 000 pasos y 21,6 minutos son insuficientes para una locomoción robusta; es esperable que el agente no generalice a comandos, perturbaciones o terrenos distintos.
- Dependencia del entorno: la política está acoplada a `Link01Walk-v0` y a la normalización guardada en `vecnormalize.pkl`; sin ese fichero, el comportamiento puede degradarse.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de integrarlo en productos.
- Sin información sobre sesgos: al ser un agente de control en simulación, los riesgos de sesgo algorítmico se limitan al entorno y a la función de recompensa, no documentados.
- Riesgo de sobreajuste a la simulación: no hay evidencia de transferencia al robot físico LINK-01.
- Documentación escasa: la model card está mayoritariamente en coreano y no detalla la función de recompensa, la topología de red ni la semilla.

## Enlaces

- Hugging Face: https://huggingface.co/connect-ai-lab-aimo/connectailab-rl-juju-v2-link01-walk-ppo
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- MuJoCo: https://mujoco.org/
- Paper de PPO: https://arxiv.org/abs/1707.06347
- Repositorio `link01-gym`: no disponible
- Vídeo de replay (`replay.mp4`): referenciado en la model card, sin URL pública disponible
- Blog o demo del programa AI CITY BUILDERS: no disponible
