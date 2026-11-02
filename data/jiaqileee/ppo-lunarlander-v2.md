# JiaqiLeee/ppo-LunarLander-v2

## Resumen

`JiaqiLeee/ppo-LunarLander-v2` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno `LunarLander-v2` de Gymnasium, utilizando la librería Stable-Baselines3. No se trata de un modelo de lenguaje ni de un modelo generativo: es una política neuronal que controla la nave del simulador LunarLander (un módulo de aterrizaje bidimensional) mediante cuatro acciones discretas (no hacer nada, encender motor principal, encender motor lateral izquierdo, encender motor lateral derecho).

El modelo lo publica el usuario JiaqiLeee en Hugging Face, presumiblemente como artefacto de un ejercicio de entrenamiento o de un curso de aprendizaje por refuerzo. El repositorio tiene 0 descargas y 0 likes, no declara licencia ni idiomas, y la model card contiene un bloque de código de ejemplo incompleto (marcado con un `TODO`). Su relevancia es, por tanto, limitada: sirve como referencia reproducible de un agente PPO que alcanza una recompensa media de 250,87 ± 32,75 en `LunarLander-v2`, un resultado que supera el umbral habitual de resolución del entorno (200 puntos) y que lo hace útil como baseline de comparación o como ejemplo didáctico de integración con `huggingface_sb3`.

No hay información pública sobre la arquitectura de la red neuronal (número de capas, unidades por capa, función de activación), el número de pasos de entrenamiento, la semilla utilizada ni el proceso de ajuste de hiperparámetros. Todo lo que se puede afirmar con rigor procede de la model card y del `model-index` declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para aprendizaje por refuerzo (algoritmo PPO con Stable-Baselines3); capas y tamaños no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el entorno LunarLander-v2 proporciona observaciones de 8 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | pesos de Stable-Baselines3 (`.zip`), cargables con `stable_baselines3` y `huggingface_sb3` |

## Arquitectura y entrenamiento

El agente emplea PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) y optimización de una función de ventaja (habitualmente GAE) para estabilizar el entrenamiento *on-policy*. La política se implementa con la clase `PPO` de Stable-Baselines3, que por defecto usa una red MLP con dos capas ocultas de 64 unidades y activación tanh tanto para la política como para la función de valor, aunque no hay confirmación en la información disponible de que se hayan mantenido esos valores por defecto.

El entorno `LunarLander-v2` es un problema de control continuo-discreto: el estado es un vector de 8 dimensiones (posición, velocidad, ángulo, velocidad angular, contacto con el suelo de cada pierna) y el espacio de acciones es discreto de tamaño 4. El objetivo es aterrizar suavemente entre las dos banderas con velocidad baja y sin inclinarse. Se desconoce el número total de pasos de entrenamiento, el número de entornos paralelos, la semilla y si se aplicó normalización de recompensas o de observaciones. La recompensa media declarada (250,87) es coherente con un entrenamiento convergido, pero no se aporta curva de aprendizaje ni varianza entre semillas más allá de la desviación típica reportada.

## Capacidades

- Control de políticas en el entorno `LunarLander-v2`: selección de una de cuatro acciones discretas a partir de una observación de 8 dimensiones.
- Inferencia determinista o estocástica mediante `model.predict(obs, deterministic=True/False)`.
- Integración con el ecosistema Stable-Baselines3 (`PPO.load`, `evaluate_policy`, `VecEnv`).
- Carga desde el Hub mediante `huggingface_sb3.load_from_hub`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, generación de texto, visión, audio ni capacidades multilingües.
- No dispone de modo de razonamiento (*thinking mode*) ni de decodificación especulativa.

## Casos de uso

- **Reproducción de un baseline de PPO**: cargar el agente con `PPO.load` y evaluarlo con `evaluate_policy` sobre `LunarLander-v2` para disponer de una referencia de recompensa media (~250) frente a nuevas variantes de hiperparámetros.
- **Docencia en aprendizaje por refuerzo**: usar el modelo como ejemplo funcional en un curso o tutorial que explique el ciclo *rollout*-actualización de PPO y la integración con el Hub.
- **Pruebas de integración de `huggingface_sb3`**: validar en un pipeline de CI que la descarga, deserialización y predicción del agente funcionan con la versión instalada de Stable-Baselines3.
- **Evaluación comparativa de algoritmos**: enfrentar este agente PPO contra políticas entrenadas con A2C, DQN o SAC sobre el mismo entorno para medir robustez y varianza de recompensa.
- **Generación de datos de demostración**: ejecutar el agente para recolectar trayectorias de alta recompensa que sirvan como datos de *imitation learning* o de *offline RL*.
- **Pruebas de robustez ante perturbaciones**: aplicar ruido a las observaciones o modificar la física del entorno y medir la degradación de la recompensa para estudiar la sensibilidad de la política.
- **Prototipado de entornos de control con espacio de acciones discreto**: reutilizar el flujo de entrenamiento y despliegue como plantilla para problemas similares (p. ej., `CartPole-v1`, `Acrobot-v1`).

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| PPO | LunarLander-v2 | mean_reward | 250,87 ± 32,75 |

No se han publicado otros resultados de benchmarks (por ejemplo, recompensa mínima, número de episodios evaluados, semilla o comparación con otros agentes) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB. La política es una MLP de tamaño reducido (por defecto, ~64×64 unidades) y las observaciones son vectores de 8 dimensiones; la inferencia no requiere GPU.
- **GPU recomendadas**: no necesarias. Cualquier CPU moderna ejecuta la inferencia en microsegundos por paso. Para reentrenamiento, una GPU consumer (GTX 1650, RTX 3060) acelera el *rollout* y la actualización, aunque el entorno es lo bastante ligero para entrenar en CPU.
- **Cabe en GPU consumer**: sí, en cualquier GPU con al menos 1 GB de memoria, e incluso en CPU sin GPU dedicada.
- **Opciones de despliegue**: `stable_baselines3` (carga nativa del `.zip`), `huggingface_sb3` para la descarga desde el Hub, y `gymnasium`/`gym` para el entorno. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles de forma oficial; por la naturaleza de la red (MLP pequeña), se espera una latencia de microsegundos a milisegundos por paso en CPU y un throughput de miles de pasos por segundo en un solo hilo, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiaqiLeee/ppo-LunarLander-v2 | PPO | LunarLander-v2 | 250,87 ± 32,75 | no disponible | Hugging Face Hub |
| sb3/ppo-LunarLander-v2 (referencia de la comunidad) | PPO | LunarLander-v2 | no disponible en la información proporcionada | no disponible | Hugging Face Hub |
| sb3/dqn-LunarLander-v2 (referencia de la comunidad) | DQN | LunarLander-v2 | no disponible en la información proporcionada | no disponible | Hugging Face Hub |

No se dispone de datos verificados de recompensa para los modelos comparables en la información proporcionada; la comparación se limita al algoritmo y al entorno. Cualquier agente PPO o DQN entrenado sobre `LunarLander-v2` con Stable-Baselines3 es funcionalmente intercambiable con este modelo.

## Limitaciones y advertencias

- **Ámbito muy restringido**: la política solo es válida para `LunarLander-v2`; no generaliza a otros entornos ni a variaciones de la física sin reentrenamiento.
- **Licencia no declarada**: la ausencia de licencia impide determinar si el uso comercial está permitido; en la práctica, esto bloquea su adopción en producción sin aclaración previa del autor.
- **Resultados no verificados**: el `model-index` marca `verified: false`; la recompensa de 250,87 ± 32,75 es una declaración del autor sin validación independiente.
- **Model card incompleta**: el bloque de uso contiene un `TODO` y un ejemplo con `...`, por lo que no hay instrucciones reproducibles de carga ni de evaluación.
- **Sin información de entrenamiento**: se desconocen hiperparámetros, semilla, número de pasos y curva de aprendizaje, lo que dificulta la reproducibilidad.
- **Riesgo de sobreajuste al entorno**: al no reportarse evaluación con múltiples semillas ni con observaciones perturbadas, no se puede descartar una política frágil ante condiciones iniciales distintas.
- **No es un modelo de lenguaje**: no debe evaluarse con métricas de NLP (MMLU, HumanEval, GSM8K) ni usarse para generación de texto, código o razonamiento.
- **Sin sesgos de lenguaje aplicables**: al no procesar texto, no hay sesgos lingüísticos, pero sí puede heredar sesgos del diseño de recompensa del entorno (por ejemplo, preferencia por aterrizajes lentos frente a rápidos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JiaqiLeee/ppo-LunarLander-v2
- Repositorio de Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Librería `huggingface_sb3`: https://github.com/huggingface/huggingface_sb3
- Documentación del entorno LunarLander-v2 (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Paper de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
