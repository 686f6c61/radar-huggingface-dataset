# chrisluo5311/a2c-PandaPushDense-v3-potentialshaping

## Resumen

a2c-PandaPushDense-v3-potentialshaping es un agente de aprendizaje por refuerzo profundo entrenado por el usuario chrisluo5311 con la libreria Stable-Baselines3. No es un modelo de lenguaje: se trata de una politica entrenada para controlar un brazo robotico Franka Panda en la tarea de empujar un bloque hasta una posicion objetivo, definida en el entorno `PandaPushDense-v3` del paquete panda-gym. La contribucion principal del autor es la incorporacion de una tecnica de *potential-based reward shaping* (Ng et al., 1999) para acelerar el aprendizaje en una tarea con recompensa densa pero poco informativa al inicio del entrenamiento.

El problema que aborda es concreto: la recompensa densa por defecto, definida como `-||block_pos - goal_pos||`, permanece practicamente constante hasta que el efector final (gripper) toca el bloque, por lo que el agente no recibe senal alguna que le indique acercarse al objeto. El autor anade un termino de shaping basado en potencial que recompensa cada paso en funcion de cuanto se acerca el gripper al bloque, sin modificar la politica optima (garantia teorica de la forma potencial). El entrenamiento se realizo durante 1.000.000 de pasos con 4 entornos paralelos y normalizacion de observaciones y recompensas.

El modelo es relevante como ejemplo reproducible de como el diseno de recompensas afecta al rendimiento en RL continuo con observaciones multimodales, y como referencia negativa: pese al shaping, la tasa de exito reportada es de 0.045, muy baja, lo que sugiere que A2C con hiperparametros por defecto no es suficiente para esta tarea tan exigente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | A2C (Advantage Actor-Critic) con politica `MultiInputPolicy` de Stable-Baselines3 |
| Parametros totales | no disponible (pesos almacenados en un `.zip`; el tamano del repo figura como 0.0 GB) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; opera sobre observaciones del entorno, no sobre secuencias de texto) |
| Tipos de cuantizacion | no aplicable (no se distribuyen pesos en formatos cuantizados tipo GGUF o bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.zip` (formato nativo de Stable-Baselines3) mas un fichero `vec_normalize.pkl` con las estadisticas de normalizacion |

## Arquitectura y entrenamiento

El agente emplea el algoritmo A2C de Stable-Baselines3 con la politica `MultiInputPolicy`, pensada para entornos cuyo espacio de observacion combina un vector de estado con otra modalidad (por ejemplo, imagenes). Los hiperparametros son los valores por defecto de la libreria, sin ajuste. El entrenamiento se ejecuto con 4 entornos paralelos, un total de 1.000.000 de pasos temporales y normalizacion activa mediante `VecNormalize` con `norm_obs=True`, `norm_reward=True`, `clip_obs=10` y `clip_reward=10`.

La innovacion tecnica es el *potential-based reward shaping*. El autor define un potencial `phi(s) = -k * ||ee_pos - block_pos||`, donde `ee_pos = obs["observation"][0:3]` y `block_pos = obs["observation"][6:9]`, con `k = 0.5`. La recompensa modificada durante el entrenamiento es `reward = original_dense_reward + (gamma * phi(s') - phi(s))`, con `gamma = 0.99`, coincidente con el factor de descuento de A2C. El potencial se reinicia en cada `reset()` y `phi(s') = 0` cuando el episodio termina con exito, de modo que el shaping no altera la politica optima segun el teorema de Ng et al. (1999). El shaping se aplica unicamente durante el entrenamiento: la evaluacion usa el entorno sin modificar.

## Capacidades

- Control de un brazo robotico Franka Panda en simulacion para la tarea de empujar un bloque hasta una posicion objetivo.
- Toma de decisiones en un espacio de acciones continuo con observaciones multimodales (vector de estado del robot y del bloque).
- Inferencia determinista (el ejemplo de uso emplea `model.predict(obs, deterministic=True)`).
- Integracion directa con el ecosistema Gymnasium y panda-gym mediante `DummyVecEnv` y `VecNormalize`.
- Carga reproducible desde el Hub de HuggingFace mediante `huggingface_sb3.load_from_hub`.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio ni soporte de tool calling o agentes multi-paso.

## Casos de uso

- Simulacion de manipulacion robotica: servir como politica base para la tarea Push de panda-gym, permitiendo reproducir el entrenamiento y comparar variantes de recompensa.
- Punto de partida para *fine-tuning*: dado que el entrenamiento es barato y el codigo es abierto via Stable-Baselines3, se puede reutilizar como inicializacion para algoritmos mas potentes (PPO, SAC, TD3) sobre el mismo entorno.
- Investigacion en diseno de recompensas: plataforma para medir experimentalmente el efecto del potential-based shaping frente a la recompensa densa original.
- Docencia de aprendizaje por refuerzo: ejemplo minimalista de como cargar un agente del Hub, construir `VecNormalize` y ejecutar un bucle de evaluacion.
- Benchmark de referencia negativa: cuantifica el techo de A2C con hiperparametros por defecto en tareas de contacto, util para justificar la eleccion de algoritmos off-policy.
- Estudio de robustez de politicas en simulacion: evaluar la tasa de exito de 0.045 como linea base antes de aplicar tecnicas como curriculum learning o demostraciones.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el propio autor en el `model-index` de la model card, no verificados por terceros.

| Metrica | Dataset | Valor |
|---|---|---|
| mean_reward | PandaPushDense-v3 | -8.09 +/- 3.86 |
| success_rate | PandaPushDense-v3 | 0.045 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que este modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. La politica es una red MLP pequeña, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con al menos unos cientos de MB de VRAM; el entrenamiento completo de 1M de pasos es viable en una unica GPU consumer (por ejemplo, RTX 3060, RTX 4090), e incluso en CPU con paciencia.
- Cabe en GPU consumer: si, en practicamente cualquier modelo moderno (GTX 1050 o superior). El cuello de botella durante el entrenamiento es la simulacion fisica de panda-gym, no la red neuronal.
- Opciones de despliegue: inferencia via Stable-Baselines3 en Python; evaluacion con Gymnasium y `DummyVecEnv`; no es compatible con vLLM, TGI, Ollama ni llama.cpp porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. En la practica, la latencia por paso vendra dominada por el paso de simulacion del entorno.

## Comparativa con modelos similares

No se dispone de informacion sobre otros agentes entrenados especificamente para `PandaPushDense-v3` (por ejemplo, variantes PPO, SAC o TD3 del mismo autor o de terceros) en la informacion proporcionada. No obstante, a nivel de algoritmo, la comparativa cualitativa habitual es la siguiente:

| Algoritmo | Tipo | Espacio de acciones | Eficiencia de muestras | Disponibilidad en este repo |
|---|---|---|---|---|
| A2C (este modelo) | On-policy (actor-critic) | Continuo / discreto | Baja | Si |
| PPO | On-policy | Continuo / discreto | Media | No disponible en este repo |
| SAC | Off-policy | Continuo | Alta | No disponible en este repo |
| TD3 | Off-policy | Continuo | Alta | No disponible en este repo |

Los datos numericos de rendimiento para estos algoritmos sobre `PandaPushDense-v3` no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Tasa de exito muy baja (0.045), lo que implica que el agente falla en aproximadamente el 95 por ciento de los episodios evaluados. No es apto para uso en produccion ni para control robotico real sin un reentrenamiento sustancial.
- Recompensa media negativa ( -8.09 +/- 3.86), con alta varianza, indicando comportamiento inestable entre episodios.
- El shaping de recompensa solo se aplica durante el entrenamiento; en evaluacion se usa el entorno original, por lo que las metricas reflejan el rendimiento sin el termino auxiliar.
- La politica depende de las estadisticas almacenadas en `vec_normalize.pkl`. Cargar el modelo sin aplicar la misma normalizacion (y con `env.training = False` y `env.norm_reward = False`) produce resultados incorrectos.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial. Se debe contactar con el autor antes de cualquier uso mas alla de la investigacion.
- Idiomas soportados y sesgos: no aplicable en el sentido habitual, ya que el modelo no procesa texto ni lenguaje natural.
- Entrenado unicamente en simulacion (panda-gym). No hay evidencia de transferencia a un brazo Franka fisico (*sim-to-real gap*).
- Sobreajuste potencial al entorno y a los hiperparametros por defecto de A2C; el rendimiento puede degradarse en variaciones de la tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chrisluo5311/a2c-PandaPushDense-v3-potentialshaping
- Stable-Baselines3 (repositorio): https://github.com/DLR-RM/stable-baselines3
- panda-gym (repositorio): https://github.com/qgallouedec/panda-gym
- Referencia del potential-based reward shaping: Ng, A. Y., Harada, D., Russell, S. (1999), "Policy invariance under reward transformations: Theory and application to reward shaping".
