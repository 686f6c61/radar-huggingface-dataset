# SeanShih/REINFORCE-CartPole-v1

## Resumen

`SeanShih/REINFORCE-CartPole-v1` es un agente de aprendizaje por refuerzo entrenado con el algoritmo REINFORCE (policy gradient Monte Carlo) sobre el entorno clásico `CartPole-v1` de Gym/Gymnasium. Lo publica el usuario SeanShih en Hugging Face como parte de las actividades de la Unidad 4 del Deep Reinforcement Learning Course de Hugging Face, cuyo objetivo es implementar desde cero un agente REINFORCE y subirlo al Hub.

No es un modelo de lenguaje ni un modelo fundacional: es una red de política de tamaño muy reducido (una MLP de dos capas para CartPole, según la model card) que recibe una observación de 4 dimensiones y devuelve una distribución de probabilidad sobre 2 acciones. El repositorio distribuye únicamente los pesos (`model_state_dict.pt`, además de un `model.pt` legacy con el modelo completo) y un `hyperparameters.json` con `state_space`, `action_space` y `h_size`.

Su relevancia es exclusivamente docente y de referencia: sirve como baseline reproducible de policy gradient para comparar con PPO o DQN, y como ejemplo de publicación de agentes de RL en el Hub con `model-index`. El autor declara una recompensa media de 466,40 ± 66,34 en `CartPole-v1`, un resultado cercano pero por debajo del umbral de resolución del entorno, y sin verificación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de política (MLP) entrenada con REINFORCE; 2 capas para CartPole (3 capas en la variante PixelCopter del mismo material) |
| Parámetros totales | no disponible (depende de `h_size` declarado en `hyperparameters.json`) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 4 dimensiones) |
| Tipos de cuantización | no aplica; se distribuyen pesos PyTorch sin cuantizar |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt`: `model_state_dict.pt` (state_dict portable) y `model.pt` (modelo completo legacy, requiere la clase original) |
| Pipeline | `reinforcement-learning` |
| Entorno | `CartPole-v1` |
| Espacio de estados / acciones | definidos en `hyperparameters.json` (`state_space`, `action_space`); en CartPole-v1 son 4 y 2 respectivamente |
| Hiperparámetros | `h_size`, `state_space` y `action_space` en `hyperparameters.json`; el resto no está documentado |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una red de política feed-forward (perceptrón multicapa) que parametriza directamente π(a|s). Para CartPole el autor indica dos capas; el mismo material del curso define una variante de tres capas para PixelCopter. El algoritmo es REINFORCE puro: estimación Monte Carlo del gradiente de la política usando el retorno descontado de episodios completos, sin función de valor ni ventaja aprendida, lo que explica la varianza alta reflejada en la desviación de ±66,34 en la recompensa media.

No se publica información sobre el número de episodios de entrenamiento, la tasa de aprendizaje, el factor de descuento, el tamaño de `h_size`, las semillas utilizadas ni la composición de los datos (en RL, la distribución de estados viene determinada por la política y la dinámica del entorno). No hay indicios de RLHF, DPO ni de ninguna técnica de optimización posterior; tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo. La carga requiere reconstruir la clase `Policy` exacta de la Unidad 4, instanciarla con `state_space`, `action_space` y `h_size`, y aplicar `load_state_dict(torch.load(..., map_location="cpu", weights_only=True))`.

## Capacidades

- Control de política en `CartPole-v1`: selecciona acciones (izquierda/derecha) a partir de observaciones de 4 dimensiones (posición y velocidad del carro, ángulo y velocidad angular del péndulo).
- Política estocástica muestreada de una distribución categórica sobre 2 acciones, según el esquema habitual de REINFORCE.
- Entrenamiento desde cero reproducible con el material del curso (Unidad 4).
- Compatibilidad con el registro `model-index` del Hub para reportar `mean_reward`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.
- Reutilizable como plantilla para variantes del mismo material (PixelCopter, con tres capas).

## Casos de uso

- Docencia de policy gradient: usar el agente como ejemplo ejecutable de REINFORCE en un aula o tutorial, cargando `model_state_dict.pt` y evaluándolo en `CartPole-v1` para ilustrar la varianza del estimador Monte Carlo.
- Baseline de comparación: medir la recompensa media de este agente frente a implementaciones de PPO o DQN en el mismo entorno, con la misma métrica (`mean_reward`) y el mismo número de episodios de evaluación.
- Verificación de implementaciones propias: comprobar que una clase `Policy` recién escrita produce las mismas acciones que estos pesos; útil para detectar errores de dimensiones (`state_space`, `action_space`, `h_size`) o de orden de capas.
- Test de pipelines de evaluación de RL: integrar el modelo en un script que descargue del Hub, ejecute N episodios y registre la recompensa media con su desviación, como prueba de humo de una infraestructura de evaluación.
- Pruebas de registro y gobernanza de modelos: validar flujos de `model-index`, versionado y descarga de artefactos en el Hub usando un repositorio ligero (0.0 GB) como caso de prueba.
- Punto de partida para experimentos de reducción de varianza: reentrenar o ajustar la política y comparar la desviación típica de la recompensa antes y después (por ejemplo, añadiendo baseline o normalización de retornos).
- Demostraciones educativas de RL en entornos de control: visualizar el comportamiento del agente en un notebook, dado que la inferencia no requiere GPU.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`model-index`), sin verificación independiente:

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | CartPole-v1 | mean_reward | 466,40 ± 66,34 | No |

Contexto del entorno, no del modelo: `CartPole-v1` tiene una recompensa máxima de 500 por episodio y el criterio histórico de resolución de Gym se sitúa en 475 de media sobre 100 episodios consecutivos. Con 466,40 de media y una desviación de 66,34, el agente declarado queda en la parte alta del entorno pero no alcanza de forma garantizada ese umbral. No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K y similares no aplican a este modelo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el repositorio ocupa 0.0 GB y la política es una MLP de dos capas con entrada de 4 dimensiones. Cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; no se requiere GPU. Cualquier GPU (RTX 4090, A100, H100) sirve, pero está sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en todas; también en CPU monolítica y en entornos sin aceleración.
- Opciones de despliegue: PyTorch (`torch.load` + `load_state_dict`), `gymnasium`/`gym` para el bucle de entorno. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Al tratarse de un forward pass de una MLP de dos capas sobre un vector de 4 entradas, la latencia por paso es del orden de microsegundos en CPU; el coste dominante en la práctica es el `step()` del entorno, no el modelo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parámetros | Contexto | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| REINFORCE-CartPole-v1 (SeanShih) | REINFORCE (Monte Carlo) | CartPole-v1 | no disponible | no aplica | 466,40 ± 66,34 | no disponible | Hub de Hugging Face |
| Agentes PPO de Stable-Baselines3 (CartPole-v1) | PPO (actor-critic) | CartPole-v1 | no disponible | no aplica | no disponible en la información proporcionada | MIT según el repositorio de Stable-Baselines3 | Librería, requiere entrenamiento local |
| Agentes PPO de CleanRL (CartPole-v1) | PPO (actor-critic) | CartPole-v1 | no disponible | no aplica | no disponible en la información proporcionada | MIT según el repositorio de CleanRL | Repositorio de código, requiere entrenamiento local |
| Ejemplos de la Unidad 4 del Deep RL Course (variante PixelCopter) | REINFORCE | PixelCopter | no disponible | no aplica | no disponible | no disponible | Material del curso |

No se dispone de resultados de benchmarks verificados de las alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible; la diferencia relevante es algorítmica (REINFORCE sin baseline frente a PPO con crítico).

## Limitaciones y advertencias

- Varianza alta: REINFORCE sin baseline ni función de valor produce estimaciones de gradiente ruidosas; la desviación de ±66,34 en la recompensa media es coherente con ello y dificulta la reproducibilidad entre ejecuciones.
- Resultado no verificado: el `mean_reward` procede de la model card del autor y no ha sido validado de forma independiente; además no se especifica el número de episodios de evaluación ni las semillas.
- Licencia no disponible: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de reutilizarlo en producción.
- Acoplamiento al código: los pesos solo son utilizables si se reconstruye la clase `Policy` exacta de la Unidad 4 con los valores correctos de `state_space`, `action_space` y `h_size`; `model.pt` (legacy) exige además la clase Python original, con el riesgo de ejecución de código que ello implica.
- Ámbito nulo fuera del entorno: la política está especializada en la dinámica concreta de `CartPole-v1` (4 observaciones, 2 acciones); no generaliza a otros entornos ni a variaciones de parámetros físicos sin reentrenar.
- Sesgo de distribución: al entrenarse con datos generados por su propia política, el agente puede estar infraentrenado en regiones del espacio de estados poco visitadas, lo que se traduce en fallos ante condiciones iniciales atípicas.
- Sin soporte lingüístico ni multilingüe: no es aplicable como modelo de texto, por lo que el riesgo de alucinación no aplica, pero tampoco ofrece ninguna capacidad de generación.
- Documentación incompleta: no se detallan hiperparámetros de entrenamiento, presupuesto de episodios ni curvas de aprendizaje, lo que limita la reproducibilidad del resultado declarado.
- Repositorio de 0.0 GB con 0 descargas: conviene verificar la integridad de los artefactos y el almacenamiento LFS antes de integrarlo en un pipeline automatizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeanShih/REINFORCE-CartPole-v1
- Unidad 4 del Deep Reinforcement Learning Course: https://huggingface.co/deep-rl-course/unit4/introduction
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repos o demos) en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo y se han descartado.
