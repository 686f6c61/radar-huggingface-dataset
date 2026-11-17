# IndecisiveRat/ppo-LunarLander-v3

## Resumen

`IndecisiveRat/ppo-LunarLander-v3` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno `LunarLander-v3` de Gymnasium, un simulador 2D en el que un módulo debe aterrizar de forma controlada sobre una plataforma. El modelo lo publica el usuario IndecisiveRat en Hugging Face y se distribuye en formato compatible con la librería `stable-baselines3`, la implementación de referencia en PyTorch para algoritmos de RL clásicos.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es una política neuronal pequeña, entrenada específicamente para una única tarea de control con observaciones de 8 dimensiones y 4 acciones discretas. Su relevancia es, por tanto, educativa y de referencia: sirve como ejemplo reproducible de un pipeline de RL con Stable-Baselines3 y del formato de publicación de agentes en el Hugging Face Hub mediante `huggingface_sb3`.

La model card es mínima (incluye un `TODO` en la sección de uso) y no aporta información sobre hiperparámetros, arquitectura de la red, número de pasos de entrenamiento ni licencia. El único dato de rendimiento declarado es un `mean_reward` de 224,24 ± 61,02 en `LunarLander-v3`, marcado como no verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para PPO (MLP, detalles no disponibles); agente de RL, no transformer |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 8 dimensiones por paso en LunarLander-v3) |
| Tipos de cuantización | no disponible (no aplica habitualmente a políticas de RL de este tamaño) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | pesos de `stable-baselines3` (`.zip`), cargables con `huggingface_sb3.load_from_hub` |

## Arquitectura y entrenamiento

El agente emplea PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) y optimización de una función de valor crítica. En Stable-Baselines3 la política por defecto para entornos con observaciones vectoriales es una MLP con dos capas ocultas de 64 unidades y activación tanh, compartida o separada entre actor y crítico; la model card no confirma estos detalles, por lo que deben considerarse no disponibles.

El entorno `LunarLander-v3` proporciona observaciones continuas de 8 dimensiones (posición, velocidad, ángulo, velocidad angular, contacto con las patas) y 4 acciones discretas (no hacer nada, encender motor izquierdo, principal o derecho). La recompensa combina proximidad al pad, velocidad de aterrizaje, orientación y penalizaciones por uso de combustible y por accidente. No hay información sobre el número de timesteps de entrenamiento, semillas, composición del dataset (generado por interacción con el simulador) ni sobre ajuste fino posterior.

## Capacidades

- Control de política discreta en el entorno `LunarLander-v3` de Gymnasium.
- Toma de decisiones paso a paso a partir de observaciones vectoriales de 8 dimensiones.
- Inferencia determinista o estocástica mediante `model.predict(obs, deterministic=True/False)`.
- Carga directa desde el Hub con `huggingface_sb3.load_from_hub` y ejecución con Stable-Baselines3.
- No soporta tool calling, function calling, agentes multi-paso genéricos, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo de razonamiento extendido, visión, audio ni generación de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: ejemplo funcional de un agente PPO para ilustrar el ciclo entrenamiento-evaluación-publicación con Stable-Baselines3 y el Hub.
- Reproducción de experimentos: punto de partida para comparar variantes de PPO (distintas semillas, hiperparámetros o arquitecturas de política) sobre el mismo entorno.
- Evaluación de robustez: análisis de la varianza del retorno (la desviación declarada de ±61,02 es alta) para estudiar estabilidad de políticas entrenadas con PPO.
- Pruebas de integración de `huggingface_sb3`: verificar el flujo de `load_from_hub` en pipelines internos de experimentación.
- Baseline en investigación de RL: referencia sencilla contra la que medir mejoras en entornos de control continuo-discreto similares.
- Demostraciones y visualizaciones: renderizar episodios del aterrizaje para material divulgativo o presentaciones sobre RL.

## Benchmarks y rendimiento

| Algoritmo | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| PPO | LunarLander-v3 | mean_reward | 224,24 ± 61,02 | No |

El umbral habitual para considerar resuelto `LunarLander-v3` es un retorno medio de 200 en 100 episodios consecutivos; el valor declarado lo supera, pero al no estar verificado y presentar una desviación típica elevada, conviene tratarlo con cautela. No hay datos de otros benchmarks en la información disponible.

## Requisitos de hardware

- CPU suficiente para inferencia: la política es una MLP de tamaño reducido (del orden de decenas de miles de parámetros si se confirma la configuración por defecto de SB3), por lo que no requiere GPU.
- GPU opcional (cualquier modelo CUDA compatible con PyTorch) para entrenamiento o evaluación masiva en paralelo.
- Cabe holgadamente en cualquier GPU de consumo e incluso en entornos sin GPU.
- Despliegue mediante Python con `stable-baselines3`, `gymnasium` y `huggingface_sb3`; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia por paso del orden de microsegundos a milisegundos en CPU; el throughput depende del bucle de simulación del entorno, no del modelo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IndecisiveRat/ppo-LunarLander-v3 | PPO | LunarLander-v3 | 224,24 ± 61,02 | no disponible | Hugging Face Hub |
| stable-baselines3/ppo-LunarLander-v2 | PPO | LunarLander-v2 | no disponible en esta ficha | MIT (código de SB3) | Hugging Face Hub |
| sb3/ppo-LunarLander-v2 (organización sb3) | PPO | LunarLander-v2 | no disponible en esta ficha | no disponible | Hugging Face Hub |

No se dispone de datos verificados de rendimiento de los modelos comparables en la información proporcionada; la comparación se limita a algoritmo, entorno y disponibilidad.

## Limitaciones y advertencias

- Modelo específico de una única tarea: no generaliza a otros entornos ni a problemas fuera de `LunarLander-v3`.
- Métrica de rendimiento declarada por el autor y marcada como no verificada; la desviación típica de 61,02 indica alta variabilidad entre episodios.
- Model card incompleta: sección de uso con `TODO`, sin hiperparámetros, sin semillas y sin detalles de entrenamiento.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural ni function calling.
- Riesgo de sobreajuste al simulador: el comportamiento puede degradarse ante modificaciones del entorno (por ejemplo, cambios de parámetros físicos o de recompensa).
- Sin información sobre sesgos más allá de los inherentes al simulador y a la distribución de episodios de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndecisiveRat/ppo-LunarLander-v3
- Repositorio de Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Librería `huggingface_sb3`: https://github.com/huggingface/huggingface_sb3
- Entorno `LunarLander-v3` (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Documentación de PPO en Stable-Baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html
