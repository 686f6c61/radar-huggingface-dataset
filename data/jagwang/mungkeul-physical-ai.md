# jagwang/mungkeul-physical-ai

## Resumen

Mungkeul Physical AI es un modelo de aprendizaje por refuerzo (RL) desarrollado por BlueBio Inc., una empresa pre-social de Gwangju (Corea del Sur), con el objetivo de entrenar un brazo robótico Fetch en el simulador MuJoCo para tareas de asistencia a personas con discapacidad. El modelo se estructura en un currículo de tres fases —Reach, Push y PickAndPlace— y combina dos algoritmos de RL: PPO y HER+DDPG, ambos implementados con la librería Stable Baselines 3.

La relevancia de este modelo reside en su enfoque de bajo coste: el entrenamiento completo se realizó exclusivamente en CPU, con un coste total de cero euros, lo que demuestra que es posible abordar tareas de robótica asistencial sin infraestructura de GPU. Los pesos publicados son cinco archivos comprimidos en formato ZIP (entre 162K y 4,2M), correspondientes a cada fase y algoritmo. No se trata de un modelo de lenguaje, sino de un conjunto de políticas de control para un brazo robótico simulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de RL: PPO y HER+DDPG (Stable Baselines 3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de RL, no de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | ko, en (idiomas de la documentación; el modelo no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | .zip (formato nativo de Stable Baselines 3) |

## Arquitectura y entrenamiento

El modelo se compone de cinco políticas independientes entrenadas con dos algoritmos de aprendizaje por refuerzo: PPO (Proximal Policy Optimization) y HER+DDPG (Hindsight Experience Replay combinado con Deep Deterministic Policy Gradient). El entrenamiento sigue un esquema de currículo en tres fases: primero el brazo aprende a alcanzar un objetivo (Reach), después a empujar un objeto (Push) y finalmente a recoger y colocar un objeto (PickAndPlace). Cada fase se entrena de forma secuencial, de modo que las habilidades adquiridas en fases anteriores sirven como base para las siguientes.

El entorno de simulación es MuJoCo 3.12 con Gymnasium 1.3 y Gymnasium-Robotics, sobre Python 3.13 y PyTorch 2.13. Un dato destacable es que todo el entrenamiento se ejecutó en CPU, sin aceleración por GPU, lo que condiciona el tamaño de las redes y el número de pasos de entrenamiento. No se especifica el número de timesteps, el tamaño de las redes neuronales ni la composición del dataset de experiencias. Tampoco se indica el uso de técnicas como sim-to-real transfer o domain randomization.

## Capacidades

- Control de brazo robótico Fetch en simulación MuJoCo para tres tareas: alcanzar un punto objetivo, empujar un objeto y recoger/colocar un objeto.
- Aprendizaje por currículo: las políticas de fases posteriores se benefician de las habilidades adquiridas en fases anteriores.
- Dos algoritmos de RL disponibles para comparación: PPO (on-policy) y HER+DDPG (off-policy con replay de experiencias retrospectivas).
- No es un modelo de lenguaje: no genera texto, código ni responde a instrucciones en lenguaje natural.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Investigación en robótica asistencial: el modelo sirve como punto de partida para estudiar cómo un brazo robótico puede asistir a personas con movilidad reducida en tareas de alcanzar, empujar y manipular objetos cotidianos.
- Evaluación de algoritmos de RL en entornos de manipulación: al publicar políticas entrenadas con PPO y HER+DDPG sobre las mismas tareas, permite comparar el rendimiento de ambos algoritmos en un entorno estandarizado (Fetch de Gymnasium-Robotics).
- Reproducción de currículos de aprendizaje: el esquema de tres fases (Reach → Push → PickAndPlace) puede replicarse o extenderse en otros entornos de MuJoCo para estudiar la transferencia de habilidades.
- Entrenamiento de RL en CPU: el hecho de que el entrenamiento completo se realizara en CPU con coste cero lo convierte en un caso de referencia para entornos con recursos limitados, como universidades o pequeñas empresas sin acceso a GPU.
- Base para sim-to-real: las políticas entrenadas en simulación pueden servir como punto de partida para experimentos de transferencia a un brazo físico, aunque no se ha validado esta transferencia en el trabajo original.
- Docencia de aprendizaje por refuerzo: al ser un proyecto pequeño, con código de reproducción incluido y licencia MIT, es adecuado como material didáctico para cursos de RL aplicado a robótica.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de recompensas por fase y algoritmo. Se reproduce a continuación tal como se publicó:

| Fase | Algoritmo | Recompensa inicial | Recompensa final | Mejora |
|---|---|---|---|---|
| Phase 1 (Reach) | PPO | -8.29 | -1.08 | +87.0% |
| Phase 2 (Push) | PPO | -8.94 | -8.43 | +5.7% |
| Phase 3 (PickAndPlace) | PPO | -12.37 | -10.87 | +12.1% |
| Phase 2 (Push) | HER+DDPG | -7.90 | -8.74 | -10.6% |
| Phase 3 (PickAndPlace) | HER+DDPG | -11.12 | -12.82 | -15.3% |

No se han publicado resultados en benchmarks estandarizados como los de los modelos de lenguaje (MMLU, HumanEval, GSM8K), ya que no es un modelo de ese tipo. Tampoco se proporcionan métricas de éxito por tarea (tasa de éxito en alcanzar el objetivo, etc.), solo recompensas acumuladas.

## Requisitos de hardware

- Los pesos son muy pequeños: los archivos PPO ocupan entre 162K y 185K, y los de HER+DDPG 4,2M cada uno. Cualquier ordenador moderno puede cargarlos en memoria.
- El entrenamiento se realizó íntegramente en CPU con Python 3.13 y PyTorch 2.13, sin necesidad de GPU.
- Para reproducir el entrenamiento se requiere instalar: torch, stable-baselines3, gymnasium, gymnasium-robotics y mujoco.
- La inferencia (ejecutar una política entrenada) es viable en tiempo real en un portátil convencional, dado el tamaño reducido de las redes.
- Para despliegue en robótica física se necesitaría hardware adicional (brazo robótico, controlador, sensores), no incluido en el repositorio.
- No se especifican opciones de despliegue con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado en la búsqueda web otros modelos de RL para asistencia a discapacidad con Fetch en MuJoCo con los que comparar parámetros, rendimiento o licencia. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo se ha entrenado únicamente en simulación (MuJoCo); no hay evidencia de que las políticas funcionen en un brazo físico real sin un proceso de sim-to-real.
- La fase de PickAndPlace con PPO muestra una mejora modesta (+12.1%) y las fases con HER+DDPG empeoran respecto a la recompensa inicial (-10.6% y -15.3%), lo que sugiere que el algoritmo off-policy no convergió correctamente en estas tareas.
- No se especifican hiperparámetros, arquitectura de red ni número de timesteps, lo que dificulta la reproducibilidad exacta.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace; se trata de un proyecto de investigación preliminar sin validación externa.
- No es un modelo de lenguaje: no puede interpretar instrucciones, mantener conversaciones ni generar texto.
- La documentación está en coreano; la información en inglés es limitada.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías de funcionamiento en entornos reales.
- No se han evaluado sesgos ni riesgos de seguridad; al ser un modelo de control robótico, un despliegue sin supervisión podría causar daños físicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jagwang/mungkeul-physical-ai
- Página general sobre Physical AI: https://physical-ai.ai/
- Artículo de Nature sobre IA física y robótica: https://www.nature.com/articles/s42256-026-01239-3
- Fundamentos de Physical AI (arXiv): https://arxiv.org/pdf/2511.09497
- Artículo de Chosun Biz sobre Physical AI en la manufactura coreana: https://biz.chosun.com/en/en-it/2026/01/10/NZ32WHKPQZC4JJ3PIIYNDX3UYA/
