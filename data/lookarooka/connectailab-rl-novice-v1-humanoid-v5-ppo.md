# lookarooka/connectailab-rl-novice-v1-Humanoid-v5-ppo

## Resumen

`connectailab-rl-novice-v1-Humanoid-v5-ppo` es un agente de aprendizaje por refuerzo profundo publicado por el usuario `lookarooka` bajo el sello del CONNECT AI LAB. Implementa el algoritmo PPO (Proximal Policy Optimization) para resolver la tarea de locomoción bípeda del entorno `Humanoid-v5` de MuJoCo/Gymnasium, un problema clásico de control continuo de alta dimensionalidad: 348 dimensiones de observación y 17 actuadores de par continuo en el rango [-0.4, 0.4].

El modelo no es un modelo de lenguaje ni un transformer generativo, sino una política actor-critic con dos capas ocultas de 256 unidades, entrenada durante 327.680 pasos en 133,5 segundos con 16 entornos paralelos. Se presenta explícitamente como un modelo de práctica ("novice", v1) dentro de un proyecto educativo de reinforcement learning, no como un artefacto orientado a producción.

Su relevancia es limitada fuera del ámbito docente: el repositorio tiene 0 descargas, 0 likes, no declara licencia ni idiomas, y el tamaño del repo es de 0,0 GB (lo que sugiere que los pesos podrían no estar efectivamente subidos o son de tamaño despreciable). Resulta útil como referencia reproducible de una configuración PPO concreta para Humanoid-v5 y como ejemplo de normalización de estados integrada en el checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critic MLP para PPO (2 capas ocultas de 256 unidades) con normalización de estados online integrada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 348 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (checkpoint `model.pt` en fp32 para PyTorch) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch `state_dict` con buffers de normalización) |

Especificaciones del entorno asociado:

| Parametro | Valor |
|---|---|
| Entorno | `Humanoid-v5` (Gymnasium / MuJoCo) |
| Espacio de observación | `Box(-inf, inf, (348,), float64)` |
| Espacio de acción | `Box(-0.4, 0.4, (17,), float32)` |
| Algoritmo | PPO con GAE (γ=0.99, λ=0.95), clip ε=0.2 |
| Entornos paralelos | 16 × 256 pasos = 4.096 transiciones por actualización |
| Minibatch / épocas | 512 / 10 |
| Learning rate | 0,0003 con decaimiento lineal |
| Pasos totales de entrenamiento | 327.680 |
| Tiempo de entrenamiento declarado | 133,5 s |

## Arquitectura y entrenamiento

La política es una red neuronal densa tipo actor-critic con dos capas ocultas de 256 neuronas, ampliada respecto a la variante usada en entornos de menor dimensionalidad (64×64) para acomodar las 348 dimensiones de estado y los 17 grados de actuación. La salida de acciones se mapea con `tanh(x) * 0.4` para respetar los límites de par del entorno, y la desviación estándar inicial de exploración se fija en log σ = -1.0 (σ ≈ 0.37). Un componente destacable es la normalización de estados online mediante el algoritmo de Welford, registrada como buffer dentro del propio módulo (`register_buffer`), de modo que las estadísticas μ y σ viajan dentro de `model.pt` y garantizan reproducibilidad en inferencia sin depender de código externo.

El entrenamiento sigue el esquema PPO estándar: recolección de rollouts en 16 entornos paralelos, cálculo de ventajas con GAE (γ=0.99, λ=0.95), objetivo surrogate con clipping ε=0.2, 10 épocas por actualización sobre minibatches de 512 y learning rate 0,0003 con decaimiento lineal. No se documenta composición de dataset (no aplica: es RL sobre simulador), ni RLHF/DPO, ni innovaciones como decodificación especulativa. El resultado declarado tras 20 episodios de test es una recompensa media acumulada de 690,2 puntos con 135,8 pasos de supervivencia medios, lo que corresponde a un comportamiento de marcha incipiente más que a una locomoción robusta.

## Capacidades

- Control continuo de 17 articulaciones de un humanoide simulado en MuJoCo con pares en [-0.4, 0.4].
- Locomoción bípeda básica: mantenimiento del equilibrio y desplazamiento erguido durante ~135 pasos por episodio.
- Procesamiento de observaciones de 348 dimensiones que incluyen ángulos y velocidades articulares, inercia del centro de masas (`cinert`) y fuerzas de contacto externas (`cfrc_ext`).
- Normalización de estados interna, lo que permite desplegar el checkpoint sin recalcular estadísticas.
- Reproducibilidad determinista mediante semilla (`env.reset(seed=42)`) y pesos autocontenidos.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modos de pensamiento: no es un modelo generativo de lenguaje.

## Casos de uso

- Docencia de reinforcement learning: servir como punto de partida reproducible para explicar PPO, GAE y clipping en un entorno de alta dimensionalidad, con un tiempo de entrenamiento de ~2 minutos en hardware modesto.
- Comparación de hiperparámetros: la configuración documentada (16 envs, 256 pasos, minibatch 512, 10 épocas) permite estudiar el efecto de variaciones en paralelismo y tamaño de red sobre la recompensa final.
- Estudio de normalización de estados: útil para analizar cómo afecta `RunningMeanStd` embebido en el checkpoint a la estabilidad del entrenamiento en observaciones con escalas muy dispares (ángulos ±1 frente a fuerzas de contacto de cientos de unidades).
- Visualización interactiva de políticas: el modo `render_mode="human"` permite grabar demostraciones de marcha para material didáctico o presentaciones sobre control continuo.
- Baseline para algoritmos alternativos: sirve como referencia PPO "novice" frente a los que comparar SAC, TD3 o PPO con recompensas shaping en Humanoid-v5.
- Pruebas de integración de pipelines de RL: al ser un `state_dict` pequeño con buffers, es adecuado para validar flujos de descarga desde el Hub, carga en CPU y ejecución headless en CI.
- Investigación sobre currículos de aprendizaje: el agente puede emplearse como política inicial (warm start) en experimentos de transferencia o fine-tuning hacia variantes más exigentes de Humanoid.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas internas de entrenamiento y evaluación, no comparables con benchmarks estándar de la literatura:

| Metrica | Valor declarado |
|---|---|
| Recompensa media acumulada (20 episodios de test) | 690,2 |
| Pasos de supervivencia medios (20 episodios) | 135,8 |
| Pasos totales de entrenamiento | 327.680 |
| Tiempo de entrenamiento | 133,5 s |

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni comparaciones con políticas de referencia tipo Stable-Baselines3 en la model card). Los valores de recompensa no son directamente equiparables a los reportados en papers de MuJoCo sin conocer la configuración exacta de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable (<100 MB). La red tiene dos capas de 256 unidades y el checkpoint completo, incluyendo buffers de normalización, es de tamaño muy reducido.
- GPU recomendadas: no se requiere GPU; el modelo funciona en CPU sin penalización perceptible. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para inferencia.
- Cabe en cualquier GPU consumer y en CPU. El cuello de botella real es el renderizado OpenGL/GLFW del entorno MuJoCo cuando se usa `render_mode="human"`.
- Opciones de despliegue: PyTorch nativo (carga directa de `model.pt`), Gymnasium + MuJoCo para el entorno. No aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma explícita. El entrenamiento completo de 327.680 pasos en 133,5 s implica ~2.454 pasos/s con 16 entornos paralelos en el hardware del autor (no especificado). La inferencia por paso individual es del orden de microsegundos en CPU.

## Comparativa con modelos similares

No hay modelos comparables publicados en la información disponible. Como referencias contextuales de la misma categoría (políticas PPO para MuJoCo):

| Modelo | Entorno | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-novice-v1-Humanoid-v5-ppo | Humanoid-v5 | no disponible | no aplica | 690,2 recompensa media (20 eps) | no disponible | Hugging Face (0 descargas) |
| Políticas de referencia Stable-Baselines3 | Humanoid-v3/v4 | ~0,6 M aprox. (MLP 256×256) | no aplica | no disponible en esta ficha | MIT (SB3) | PyPI / GitHub |
| Políticas de referencia CleanRL PPO | Humanoid-v4 | no disponible | no aplica | no disponible en esta ficha | MIT (CleanRL) | GitHub |

Las cifras de parámetros y rendimiento de las alternativas no están verificadas en la información proporcionada y se indican solo como categorías de comparación; no deben tomarse como valores confirmados.

## Limitaciones y advertencias

- Modelo educativo ("novice", v1): el propio autor lo etiqueta como práctica, no como política lista para producción.
- Rendimiento de locomoción limitado: 135,8 pasos de supervivencia medios indican marcha inestable y propensa a caídas; no se acerca a políticas convergidas de Humanoid-v5.
- Sin licencia declarada: no hay autorización explícita de uso comercial ni de redistribución. Ante la ausencia de licencia, debe asumirse reserva de derechos por defecto.
- Repositorio con 0 descargas, 0 likes y tamaño de 0,0 GB: existe riesgo de que los pesos no estén efectivamente disponibles o el repo esté incompleto; verificar antes de depender de él.
- Dependencia de código externo: el ejemplo de carga importa `from humanoid_ppo import 정책두뇌`, un módulo no incluido en el repo de Hugging Face según la información disponible. Sin ese módulo, el `state_dict` no es cargable directamente.
- Nombres de clase y variables en coreano: puede dificultar el mantenimiento en equipos no familiarizados con el idioma.
- Sin información sobre sesgos (no aplica en el sentido habitual, pero la política hereda los sesgos del simulador y de la función de recompensa de Humanoid-v5).
- Sin datos de robustez ante perturbaciones, dominio aleatorio ni transferencia sim-to-real: no debe asumirse validez fuera del simulador.
- La recompensa de 690,2 no es comparable con cifras de la literatura sin conocer la configuración exacta de evaluación (semillas, número de pasos, versión de MuJoCo).
- Fecha de creación declarada en 2026-11-10: valor atípico que conviene contrastar; puede indicar metadatos erróneos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lookarooka/connectailab-rl-novice-v1-Humanoid-v5-ppo
- Entorno Humanoid-v5 (Gymnasium): https://gymnasium.farama.org/environments/mujoco/humanoid/
- MuJoCo: https://mujoco.org/
- Documentación de PPO (paper original de Schulman et al.): https://arxiv.org/abs/1707.06347
- Repositorio de referencia Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Repositorio de referencia CleanRL: https://github.com/vwxyzjn/cleanrl
- Perfil del autor en Hugging Face: https://huggingface.co/lookarooka
