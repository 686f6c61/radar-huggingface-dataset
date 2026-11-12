# K-9-labs/connectailab-rl-eak-v1-link01-walk-ppo

## Resumen

`connectailab-rl-eak-v1-link01-walk-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO para el control de locomoción del robot bípedo LINK-01 en el entorno `Link01Walk-v0`, construido sobre MuJoCo a través de `link01-gym`. Lo desarrolla K-9-labs en el marco del programa CONNECT AI LAB (AI CITY BUILDERS, curso de IA de refuerzo, lección 7). No es un modelo de lenguaje: no procesa texto ni genera contenido, sino que produce acciones motoras (14 dimensiones de control articular) a partir de observaciones del entorno (51 dimensiones).

El agente se entrena desde cero, sin imitación ni políticas preentrenadas, con un currículo de simulación a realidad (Sim2Real) en tres etapas y una formulación de PPO denominada `FastSymmetryPPO` con `GaitWarmup`. El resultado declarado es una marcha estable a 0,2086 m/s de velocidad media, 4,172 m recorridos por episodio de 20 s y cero caídas por minuto en la evaluación de cinco episodios.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de RL para locomoción bípeda (entorno, entrenamiento, normalización de observaciones y exportación del actor), útil para investigadores y desarrolladores que quieran replicar o extender un controlador de marcha en simulación. El repositorio es de tamaño 0.0 GB y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal entrenada con PPO (Stable-Baselines3); dimensión de observación 51, dimensión de acción 14 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (estadísticas de normalización), `actor.json` (política exportada) |

## Arquitectura y entrenamiento

El agente es una política PPO que mapea observaciones de 51 dimensiones a 14 acciones articulares continuas, correspondientes a los 14 grados de libertad del robot bípedo LINK-01, con una postura base de ±0,18 rad. El entrenamiento se realizó en el entorno `Link01Walk-v0` de `link01-gym` sobre el simulador físico MuJoCo, con 8 entornos vectorizados en paralelo y `n_steps` de 512.

El proceso declarado abarca 409.600 pasos de entorno en 16,69 minutos de entrenamiento, con tasa de aprendizaje descendente en coseno de 1,8e-4 a 3e-5 y recorte de política (`clip`) de 0,14. Sobre PPO estándar se aplican tres componentes propios: `FastSymmetryPPO` (aprovechamiento de la simetría bilateral del robot), `GaitWarmup` (calentamiento de la marcha) y un currículo Sim2Real de tres etapas. La evaluación se realizó con comandos de velocidad de 0,18 m/s durante 5 episodios de 20 s cada uno.

## Capacidades

- Control de locomoción bípeda: genera comandos articulares continuos para mantener la marcha del robot LINK-01 en simulación.
- Seguimiento de comandos de velocidad: entrenado y evaluado para un comando de 0,18 m/s, con velocidad media resultante de 0,2086 m/s.
- Estabilidad de marcha: 0 caídas por minuto declaradas en la evaluación de 5 episodios de 20 s.
- Integración con Stable-Baselines3: los artefactos (`model.zip`, `vecnormalize.pkl`) permiten cargar la política con la API de SB3.
- Exportación de política: incluye `actor.json`, lo que facilita la reutilización de la red de actor fuera del entorno de entrenamiento.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: no es un modelo generativo.

## Casos de uso

- Investigación en locomoción bípeda: usar el agente como línea base reproducible de PPO para comparar con otras formulaciones (SAC, TD3, PPO asimétrico) en el mismo entorno `Link01Walk-v0`.
- Replicación de pipelines de RL: el repositorio documenta hiperparámetros completos (pasos, learning rate, clip, número de entornos), lo que permite reproducir el entrenamiento y validar la curva de aprendizaje.
- Desarrollo de currículos Sim2Real: el agente sirve de punto de partida para experimentar con las tres etapas de currículo declaradas y medir su efecto en la robustez de la marcha.
- Validación de entornos MuJoCo: integrable en `link01-gym` para probar cambios en la dinámica, las recompensas o el espacio de observación sin reentrenar desde cero en cada iteración.
- Evaluación comparativa de controladores: al reportar métricas objetivas (distancia por episodio, velocidad media, caídas por minuto), permite comparar controladores de marcha de forma estandarizada.
- Docencia y formación en RL: encaja como ejemplo práctico en cursos de aprendizaje por refuerzo (AI CITY BUILDERS, lección 7), ilustrando el ciclo completo de entrenamiento, normalización y evaluación.
- Integración en pipelines de simulación a gran escala: la política exportada en `actor.json` puede desplegarse en bucles de simulación masiva para generar datos de trayectorias de marcha.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`model-index`), no verificados de forma independiente:

| Metrica | Valor | Entorno / condicion |
|---|---|---|
| Distancia por episodio de 20 s | 4,172 m | `Link01Walk-v0`, comando 0,18 m/s, 5 episodios × 20 s |
| Velocidad media de avance | 0,2086 m/s | `Link01Walk-v0`, comando 0,18 m/s |
| Caídas por minuto | 0,0 | `Link01Walk-v0`, 5 episodios × 20 s |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es 0.0 GB y no se especifica el número de parámetros de la política. Por la dimensión de observación (51) y acción (14), es previsible que sea una red pequeña, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. El entrenamiento declarado (409.600 pasos en 16,69 minutos con 8 entornos) es compatible con hardware modesto, pero no se especifica la GPU utilizada.
- Viabilidad en GPU de consumo: no confirmada por el autor; el coste de inferencia de una política de este tipo suele ser bajo, pero no hay datos publicados.
- Opciones de despliegue: carga mediante Stable-Baselines3 (`model.zip` + `vecnormalize.pkl`) y uso de la política exportada en `actor.json`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un agente de RL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia de categoría, este agente se sitúa en la familia de políticas PPO para locomoción en MuJoCo (por ejemplo, controladores bípedos o cuadrúpedos entrenados con Stable-Baselines3), pero no se aportan parámetros, contexto ni resultados de alternativas concretas, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-eak-v1-link01-walk-ppo | no disponible | no aplica | 4,172 m/episodio; 0,2086 m/s; 0 caídas/min | no disponible | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización estrecha: el agente está entrenado exclusivamente para el entorno `Link01Walk-v0` y el robot LINK-01; no generaliza a otras morfologías, terrenos o tareas sin reentrenamiento.
- Evaluación limitada: los resultados provienen de 5 episodios de 20 s con un único comando de velocidad (0,18 m/s); no se reportan pruebas con perturbaciones, pendientes, cambios de fricción ni comandos variables.
- Métricas no verificadas: los valores del `model-index` están marcados como `verified: false` y proceden del propio autor.
- Sim2Real no validado en hardware: aunque el entrenamiento incluye un currículo Sim2Real, no se documenta transferencia a un robot físico ni resultados en el mundo real.
- Licencia no disponible: no se declara licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no aplicables: al no ser un modelo de lenguaje, no hay soporte multilingüe ni riesgos de alucinación textual; el riesgo equivalente es la divergencia entre la política simulada y la dinámica real.
- Sesgos: no se documentan sesgos de datos, aunque el comportamiento queda determinado por la función de recompensa y el diseño del entorno, que no se detallan.
- Madurez: 0 descargas y 0 likes, repositorio de 0.0 GB y creado recientemente; no hay evidencia de uso comunitario ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/K-9-labs/connectailab-rl-eak-v1-link01-walk-ppo
- Repositorio del entorno `link01-gym` (referenciado en la model card): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
