# hugomnz/ppo-LunarLander-v2

## Resumen

`hugomnz/ppo-LunarLander-v2` es una política de aprendizaje por refuerzo profundo entrenada con el algoritmo PPO (Proximal Policy Optimization) de Stable-Baselines3 para resolver el entorno `LunarLander-v2` de Gymnasium 0.29.1. Lo desarrolla Hugo Muñoz Pérez en el contexto del curso de IA para Robótica II de la UCJC (Fase 1, Unit 1), como artefacto reproducible de un ejercicio hands-on del curso de Deep RL de Hugging Face.

No es un modelo de lenguaje ni un transformer: es una red neuronal pequeña con dos cabezas (actor y crítico) que mapea observaciones de 8 dimensiones a 4 acciones discretas. La arquitectura declarada es actor 8→64→64→4 y crítico 8→64→64→1 con activación tanh, entrenada mediante transferencia de pesos desde un checkpoint previo propio entrenado en `LunarLander-v3` (850.000 transiciones) y ajustada después con PPO en el entorno real `LunarLander-v2` durante 163.840 transiciones registradas.

Su relevancia es acotada y educativa: sirve como ejemplo verificable de transferencia entre versiones de entorno, de evaluación con semillas fijadas y de reporte honesto de métricas (media y desviación poblacional). No está pensado para producción ni para robótica real, y el propio autor lo advierte en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-crítico MLP: actor 8→64→64→4, crítico 8→64→64→1, activación tanh |
| Parametros totales | no disponible (red pequeña de dos MLP; el repositorio no declara el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observaciones de 8 dimensiones; límite de 1.000 pasos por episodio) |
| Tipos de cuantizacion | no disponible (pesos en formato de Stable-Baselines3; sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.zip` de Stable-Baselines3 (`ppo-LunarLander-v2.zip`) |

## Arquitectura y entrenamiento

La política es una red de tipo actor-crítico con dos MLP independientes y activación tanh, la configuración por defecto de PPO en Stable-Baselines3 para espacios de observación `Box(8,)` y acción `Discrete(4)`. El entrenamiento se realizó en dos fases: primero, 850.000 transiciones en `LunarLander-v3` para obtener un checkpoint de preparación propio; después, transferencia de pesos mediante `policy.load_state_dict(..., strict=True)` y ajuste con PPO en el entorno real `LunarLander-v2` de Gymnasium 0.29.1, con un presupuesto nominal de 150.000 transiciones y 163.840 transiciones efectivamente registradas por SB3 (la última recogida de experiencias puede exceder el presupuesto). Se creó un optimizador nuevo y se usaron 16 entornos de entrenamiento en paralelo con semilla `20261122`.

La innovación metodológica es la separación estricta entre las dos fases: los pasos de v3 y v2 se mantienen separados y los resultados publicados proceden exclusivamente de v2, evitando el error habitual de renombrar un entorno v3 como v2. La evaluación se hizo con la política final determinista sobre 10 episodios independientes con semillas prefijadas `[110000..110009]`, un entorno nuevo por episodio, recompensa original sin recorte y límite de 1.000 pasos. No se seleccionaron semillas ni checkpoint en función del resultado de evaluación.

## Capacidades

- Control de aterrizaje en el simulador `LunarLander-v2`: selecciona entre 4 acciones discretas (no hacer nada, encender motor principal, encender motor lateral izquierdo, encender motor lateral derecho) a partir de observaciones de 8 dimensiones.
- Política determinista (`deterministic=True`) apta para evaluación reproducible con semillas fijas.
- Transferencia de política entre versiones del entorno (`LunarLander-v3` → `LunarLander-v2`) mediante carga estricta del `state_dict`.
- Integración con el ecosistema Stable-Baselines3 (`PPO.load`) y Gymnasium 0.29.1.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, generación de texto, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Docencia y evaluación de ejercicios de RL: sirve como checkpoint de referencia para verificar que un alumno alcanza el umbral del curso (media menos desviación ≥ 200) en `LunarLander-v2`, con semillas y protocolo de evaluación documentados.
- Estudio de transferencia entre versiones de entorno: permite reproducir el flujo de entrenar en `LunarLander-v3` y ajustar en `LunarLander-v2` sin renombrar entornos, útil como ejemplo de buenas prácticas en cursos de RL.
- Baseline para comparación de algoritmos: al ser una política PPO con arquitectura y presupuesto conocidos, sirve para contrastar frente a A2C, DQN o SAC en el mismo entorno con las mismas semillas.
- Pruebas de pipelines de evaluación reproducible: el repositorio incluye `evaluacion_episodios.csv` con episodios de PPO y de una referencia aleatoria evaluados con las mismas semillas, útil para validar herramientas de análisis de curvas de aprendizaje.
- Demostraciones en vivo de bajo coste: la política se ejecuta en CPU con un único fichero `.zip` y un entorno Box2D, por lo que cabe en cualquier portátil para talleres o clases.
- Simulación de referencia en robótica educativa: aunque no garantiza seguridad en un robot real, sirve como punto de partida para discutir las diferencias entre recompensa en simulador y aterrizaje físico seguro.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados externamente, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | LunarLander-v2 | mean_reward | 257.34887520 +/- 21.43320836 |

Métricas derivadas reportadas en la model card:

| Metrica | Valor |
|---|---|
| Retorno medio (10 episodios) | 257.34887520 |
| Desviación poblacional (ddof=0) | 21.43320836 |
| Media menos desviación | 235.91566684 |
| Umbral de referencia del curso | 200 (media menos desviación) |
| Episodios de evaluación | 10, semillas `[110000..110009]` |
| Límite de pasos por episodio | 1.000 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; la red tiene dos MLP de 64 unidades ocultas y se ejecuta en CPU sin GPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. El autor indica `device="cpu"` en el ejemplo de uso.
- Cabe en cualquier GPU consumer y también en CPU sin aceleración, dado el tamaño del modelo (repo de 0,0 GB).
- Opciones de despliegue: `stable-baselines3` (`PPO.load`) con `gymnasium==0.29.1` y `box2d`/`box2d-py` para el entorno. No hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma explícita; se puede inferir una latencia por paso muy baja (microsegundos a milisegundos en CPU) por el tamaño de la red, pero el repositorio no publica mediciones.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| `hugomnz/ppo-LunarLander-v2` | PPO (SB3) | LunarLander-v2 | no disponible (MLP 64×64) | no aplica | mean_reward 257,35 ± 21,43 | no disponible |
| Política de referencia del curso HF Deep RL | PPO (SB3) | LunarLander-v2 | MLP por defecto | no aplica | no disponible en esta ficha | según curso |
| Referencia aleatoria (incluida en `evaluacion_episodios.csv`) | aleatoria | LunarLander-v2 | 0 | no aplica | no disponible en esta ficha | no aplica |

No se dispone de datos públicos comparables de otros checkpoints PPO para `LunarLander-v2` en la información proporcionada; la comparativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- Es una transferencia desde una política propia de `LunarLander-v3` y un ajuste en `v2`; no es un entrenamiento desde cero en `v2`, lo que puede sesgar la comparación con baselines entrenados íntegramente en `v2`.
- Una sola semilla de entrenamiento (`20261122`) y diez episodios de evaluación: no se demuestra robustez general ni estabilidad estadística.
- La recompensa en simulador no garantiza un aterrizaje seguro en un robot real; el propio autor lo advierte explícitamente.
- No hay licencia declarada, por lo que el uso comercial queda sin marco legal claro hasta que el autor la especifique.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no es un modelo de lenguaje; esos conceptos no aplican.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el `model-index` marca el resultado como `verified: false`; la publicación no certifica por sí sola la superación de la unidad del curso.
- Dependencia estricta de versiones: `gymnasium==0.29.1` y `stable-baselines3` (el autor referencia la documentación de v2.7.0); otras versiones pueden romper la carga del entorno o del `state_dict`.
- El vídeo de demostración usa una semilla (`120000`) distinta de las de evaluación, por lo que no forma parte de la métrica reportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugomnz/ppo-LunarLander-v2
- Perfil del autor: https://huggingface.co/hugomnz
- Curso HF Deep RL, Unit 1 hands-on: https://huggingface.co/learn/deep-rl-course/en/unit1/hands-on
- Documentación del entorno LunarLander (Gymnasium 0.29.0): https://gymnasium.farama.org/v0.29.0/environments/box2d/lunar_lander/
- Documentación de PPO en Stable-Baselines3 v2.7.0: https://stable-baselines3.readthedocs.io/en/v2.7.0/modules/ppo.html
- Verificador oficial del curso: https://huggingface.co/spaces/ThomasSimonini/Check-my-progress-Deep-RL-Course
