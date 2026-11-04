# lucaskim72/connectailab-rl-lucasbrain-v15.37-humanoid-ppo

## Resumen

`connectailab-rl-lucasbrain-v15.37-humanoid-ppo` es una política de control continuo entrenada con PPO (Proximal Policy Optimization) sobre el entorno `Humanoid-v5` de Gymnasium/MuJoCo. No es un modelo de lenguaje: es un agente de refuerzo que controla las articulaciones de un cuerpo humanoide simulado para aprender a caminar hacia delante manteniendo una postura estable. Lo publica el usuario `lucaskim72` en el contexto del curso de refuerzo "CONNECT AI LAB × AI CITY BUILDERS", y la versión 15.37 es la iteración más reciente de una saga documentada desde v1 hasta v15.37.

El modelo resuelve un problema clásico de control motor de alta dimensión: el espacio de acciones de `Humanoid-v5` es continuo y de 17 dimensiones, con observaciones de 348 valores, y la recompensa combina avance, supervivencia y un conjunto de bonificaciones posturales añadidas por el autor. La innovación principal de esta variante es la incorporación de un sistema de *reward shaping* explícito sobre la postura (inclinación del torso, alineación de rodillas, altura de los pies, simetría de la marcha) que se suma a la recompensa original del entorno.

La relevancia es acotada pero clara para quien trabaja en RL aplicado a robótica simulada: sirve como referencia reproducible de cómo escalar un entrenamiento PPO en pasos (1M → 2M → 4M) y de cómo el *reward shaping* incremental puede subir la puntuación del entorno de ~6.600 a ~9.100 puntos. El repositorio pesa 0,0 GB (solo pesos de una red pequeña) y no incluye datos de rendimiento en benchmarks estándar de RL más allá de la puntuación del propio entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (PPO, control continuo); topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos `model.pt` en PyTorch, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch), más `added_scores.py` con la lógica de recompensa |

## Arquitectura y entrenamiento

El agente es una política PPO para espacios de acción continuos, entrenada sobre `Humanoid-v5` de Gymnasium con el simulador MuJoCo. La observación del entorno `Humanoid-v5` es un vector de 348 dimensiones y la acción es un vector continuo de 17 dimensiones que controla los actuadores del cuerpo. El entrenamiento se organiza en episodios de hasta 1.000 pasos, con terminación anticipada si la altura del torso sale del rango 1,0–2,0. Según la model card, la recompensa base del entorno otorga +5 por mantenerse en pie, un término de velocidad×1,25 por avanzar y penaliza el uso excesivo de fuerza.

La evolución del entrenamiento está documentada de forma explícita: v1 (1M pasos, lr 0,0003), v7 (lr 0,0001), v13 (2M pasos), v14 (4M pasos, mejor checkpoint en 3,7M) y v15 (lr 0,00003 sobre el checkpoint de 3,7M). A partir de v15 se añaden recompensas posturales incrementales con coeficientes por componente: cintura 0,4, pecho 0,4, rodillas 1, centro 1, elevación 1, sobre-flexión 0,25, pie alto 0,25, avance 1, inclinación 0,5, plegado 0,5, brazos 0,2 y pies 0,25. La versión 15.37 es la iteración final de esta cadena de *reward shaping*.

## Capacidades

- Control motor continuo de un humanoide simulado de 17 actuadores en `Humanoid-v5`.
- Locomoción bípeda hacia delante con velocidades documentadas de hasta ~55 unidades de avance por episodio en las versiones más avanzadas.
- Mantenimiento de postura: control de inclinación del torso, alineación de rodillas, altura de los pies y centro de masa.
- Supervivencia prolongada: los episodios alcanzan los 1.000 pasos (el máximo del entorno) en las mejores versiones.
- Reproducción determinista de políticas mediante acciones "confirmadas" (la model card indica que la reproducción usa acciones deterministas).
- No soporta tool calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento: es exclusivamente un controlador de RL.
- No procesa texto, imagen ni audio.

## Casos de uso

- **Investigación en RL de control continuo**: usar el checkpoint como línea base reproducible de PPO en `Humanoid-v5` para comparar variantes de *reward shaping*, ya que la model card documenta la curva completa de versiones v1–v15.37.
- **Estudio de *reward shaping* incremental**: analizar cómo añadir términos posturales con coeficientes concretos (cintura 0,4, rodillas 1, centro 1, etc.) afecta a la puntuación del entorno, con la tabla de versiones v15.1–v15.37 como referencia empírica.
- **Simulación de locomoción bípeda para robótica**: emplear la política como controlador de referencia en un humanoide simulado antes de transferir conceptos a un robot físico, dado que el entorno es MuJoCo y el espacio de acciones es compatible con actuadores reales.
- **Docencia de PPO**: el repositorio incluye la progresión de hiperparámetros (lr 0,0003 → 0,0001 → 0,00003, pasos 1M → 4M) y sirve como material didáctico para explicar el ajuste de PPO en control continuo.
- **Pruebas de robustez de políticas**: evaluar la sensibilidad de la política a perturbaciones en la observación o a cambios en los coeficientes de recompensa, usando `added_scores.py` para recalcular la recompensa modificada.
- **Generación de datos sintéticos de marcha**: ejecutar rollouts de la política para producir trayectorias de movimiento humanoide que alimenten otros entrenamientos (imitation learning, world models) en simulación.
- **Comparación de checkpoints**: usar los checkpoints intermedios (v15.1 a v15.37) para estudiar el efecto de cada término de recompensa sobre métricas concretas (avance, puntuación postural, estabilidad).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de RL (por ejemplo, retornos normalizados frente a baselines de Stable-Baselines3 o CleanRL) en la información disponible. La model card sí reporta la puntuación del entorno `Humanoid-v5` para distintas versiones de la cadena v15:

| Version | Puntuacion entorno | Avance | Notas |
|---|---|---|---|
| v15.1 | 6668,0 | 23,82 | Base con término de torso |
| v15.4 | 7507,9 | 33,99 | Añade cintura y pecho |
| v15.6 | 7921,6 | 39,03 | Añade equilibrio de pies |
| v15.14 | 8138,3 | 41,94 | Añade centro |
| v15.18 | 8452,9 | 46,04 | Añade centro |
| v15.23 | 8743,7 | 49,71 | Añade inclinación |
| v15.25 | 8811,1 | 50,61 | Añade inclinación |
| v15.37 | 9133,7 | 55,27 | Versión final, 1.000 pasos |

La puntuación reportada para v15.37 (9133,7 con 55,27 de avance y 1.000 pasos) es la métrica principal del autor; no se ofrece comparación con políticas de referencia externas ni con la recompensa media de `Humanoid-v5` sin *shaping*.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; al tratarse de una red de política pequeña (pesos en `model.pt` de un repositorio de 0,0 GB), la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100) es suficiente; el cuello de botella es la simulación MuJoCo, no la red.
- **Consumer GPU**: sí, cabe en GTX 1650, RTX 3050 y superiores; también puede ejecutarse en CPU para inferencia de un solo entorno.
- **Despliegue**: al ser un checkpoint PyTorch de RL, no aplica vLLM, llama.cpp, Ollama ni TGI. El despliegue típico es cargar `model.pt` con PyTorch y ejecutar el bucle de `gymnasium.make("Humanoid-v5")` con MuJoCo.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependen del hardware y del número de entornos paralelos simulados.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Puntuacion reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v15.37-humanoid-ppo | PPO, control continuo | Humanoid-v5 | 9133,7 (1.000 pasos) | no disponible | HuggingFace |
| Políticas PPO de referencia (Stable-Baselines3) | PPO, control continuo | Humanoid-v5 | no disponible en esta ficha | MIT (SB3) | PyPI/GitHub |
| Políticas SAC/TD3 de referencia | Off-policy, control continuo | Humanoid-v5 | no disponible en esta ficha | MIT (SB3) | PyPI/GitHub |

No se dispone de datos comparativos verificados con otras políticas sobre `Humanoid-v5` en la información proporcionada; la comparación con baselines de Stable-Baselines3 requeriría ejecutar los entrenamientos correspondientes con la misma configuración de recompensa.

## Limitaciones y advertencias

- **Licencia no especificada**: la model card no declara licencia, lo que impide asumir permisos de uso comercial o redistribución; hay que contactar con el autor antes de usarlo en producción.
- **Sesgo de simulación**: la política está entrenada exclusivamente en `Humanoid-v5` de MuJoCo; no hay evidencia de transferencia a robots físicos ni a otros simuladores.
- **Sobreajuste a la recompensa aumentada**: la puntuación de 9133,7 incluye los términos posturales añadidos por el autor; no es directamente comparable con la recompensa estándar de `Humanoid-v5` ni con resultados publicados en la literatura.
- **Riesgo de sobreajuste a la semilla**: la model card menciona la semilla 9000 y una evaluación de 10 episodios; el rendimiento en otras semillas no está documentado.
- **Sin datos de robustez**: no se reportan pruebas con perturbaciones, cambios de masa, fricción o ruido en la observación.
- **Documentación en coreano**: la model card está mayoritariamente en coreano, lo que puede dificultar la reproducibilidad para lectores no familiarizados con el idioma.
- **Repositorio de 0,0 GB**: el tamaño real de los pesos no está desglosado; conviene verificar la integridad de `model.pt` y `added_scores.py` antes de confiar en la reproducibilidad.
- **Sin benchmarks estándar**: no hay resultados en MMLU, HumanEval, GSM8K ni métricas de RL normalizadas; la única métrica es la puntuación del entorno propio.

## Enlaces

- HuggingFace: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v15.37-humanoid-ppo
- Repositorio de versiones previas (v15.1–v15.4): referenciadas en la model card, sin URL directa disponible
- `added_scores.py`: disponible en el propio repositorio de HuggingFace
- Entorno `Humanoid-v5`: https://gymnasium.farama.org/environments/mujoco/humanoid/
- MuJoCo: https://mujoco.org/
- Stable-Baselines3 (baseline PPO): https://github.com/DLR-RM/stable-baselines3
- CleanRL (baseline PPO): https://github.com/vwxyzjn/cleanrl
