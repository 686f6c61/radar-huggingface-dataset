# BichengW/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado con Q-learning tabular sobre el entorno Taxi-v3 de Gymnasium. Lo publica el usuario BichengW en HuggingFace y su único artefacto es un fichero `q-learning.pkl` que contiene la tabla Q serializada, no una red neuronal ni un modelo de lenguaje. El problema que resuelve es el clásico rompecabezas de recogida y entrega de pasajeros en una cuadrícula: el agente debe aprender una política que recoja al pasajero en la parada correcta y lo deje en el destino minimizando pasos.

El interés de este tipo de publicación es fundamentalmente práctico y docente: sirve como referencia reproducible para comparar algoritmos de RL (tabular frente a DQN, PPO o SARSA) en un entorno con espacio de estados discreto y barato de evaluar. El autor declara una recompensa media de 7,46 ± 2,81 en Taxi-v3, métrica marcada como no verificada en el model-index.

No es un modelo de propósito general: no procesa lenguaje natural, no tiene ventana de contexto y su "entrenamiento" no consume tokens, sino episodios simulados. Cualquier evaluación de la ficha debe hacerse con esa clave: es un artefacto de RL de juguete, sin licencia declarada y con cero descargas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q de pares estado-acción); no es una red neuronal ni un transformer |
| Parámetros totales | 3.000 valores Q (500 estados × 6 acciones del entorno Taxi-v3); el tamaño exacto del fichero `.pkl` no está disponible (el repo figura como 0.0 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el agente observa un único estado discreto por paso) |
| Tipos de cuantización | no disponible; no aplica a una tabla de valores en coma flotante |
| Idiomas soportados | no disponible; el modelo no procesa lenguaje natural |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | `.pkl` (pickle de Python, cargado mediante `load_from_hub`) |

## Arquitectura y entrenamiento

El agente implementa Q-learning, un método de control off-policy basado en diferencias temporales de orden 1 (TD(0)). Mantiene una tabla Q indexada por el estado discreto del entorno (500 estados posibles en Taxi-v3) y las 6 acciones disponibles (moverse al norte, sur, este, oeste, recoger pasajero y dejarlo). La actualización sigue la regla clásica Q(s,a) ← Q(s,a) + α·[r + γ·max Q(s′,a′) − Q(s,a)], con exploración ε-greedy durante el entrenamiento y política greedy determinista en inferencia. El entorno se caracteriza por recompensa −1 por paso, +20 por entrega correcta y −10 por recogida o entrega ilegal.

No se documentan en la información disponible los hiperparámetros de entrenamiento: tasa de aprendizaje α, factor de descuento γ, política de exploración (ε inicial, decaimiento), número de episodios, semillas ni versión exacta del entorno. Tampoco hay constancia de técnicas avanzadas como double Q-learning, experience replay, redes objetivo o decodificación especulativa, que no aplican a esta familia de métodos. Al ser un método tabular, no existe dataset de tokens ni fases de RLHF/DPO: los "datos" son las transiciones generadas por el simulador durante el entrenamiento.

## Capacidades

- Resolución del entorno Taxi-v3 con política greedy determinista a partir de la tabla Q almacenada.
- Carga directa desde el Hub mediante `load_from_hub(repo_id="BichengW/q-Taxi-v3", filename="q-learning.pkl")`.
- Uso como baseline cuantitativo en experimentos comparativos de algoritmos de RL.
- Reproducibilidad de la evaluación mediante la API estándar de Gymnasium (`gym.make(model["env_id"])`).
- Ejecución íntegra en CPU, con huella de memoria despreciable.
- Soporte de tool calling / function calling: no disponible; no aplica.
- Soporte de agentes y razonamiento multi-paso fuera del entorno: no disponible; no aplica.
- Capacidades multilingües: no disponibles; el modelo no maneja texto.
- Modos especiales (thinking mode, visión, audio): no disponibles; no aplica.

## Casos de uso

- Baseline de referencia en experimentos de RL: cualquier nuevo algoritmo (DQN, PPO, A2C) evaluado en Taxi-v3 puede compararse contra este agente tabular, ya que el coste de reproducir su evaluación es de segundos en CPU y la métrica declarada es directamente comparable.
- Docencia de Q-learning: el fichero `.pkl` permite inspeccionar la tabla Q resultante y visualizar qué acción aprende el agente en cada uno de los 500 estados, lo que sirve para explicar convergencia, exploración y política óptima en clase.
- Test de integración de pipelines de evaluación: útil como caso de humo para validar que un runner basado en rl-zoo3 o en la API de Gymnasium carga artefactos, crea el entorno correcto y calcula `mean_reward` sin errores.
- Comparación tabular frente a aproximación de función: sirve para medir la brecha entre un método exacto y una red neuronal del mismo presupuesto de interacciones, útil en artículos sobre eficiencia de muestras.
- Verificación de wrappers y entornos personalizados: al ser un agente entrenado sobre el Taxi-v3 estándar, permite detectar cambios de dinámica introducidos por wrappers propios comparando la recompensa media declarada con la obtenida.
- Demostración interactiva o entrada de blog: el agente puede renderizarse paso a paso en un notebook para mostrar visualmente la secuencia recogida-entrega, con muy poco coste computacional.
- Pruebas de infraestructura de serving de RL: dado su tamaño, es adecuado para validar el ciclo completo de carga de artefactos y ejecución de episodios en un contenedor antes de desplegar agentes más pesados.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (métrica no verificada):

| Tarea | Dataset / entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,46 ± 2,81 | No |

No se han publicado en la información disponible otros resultados de benchmarks ni comparaciones con modelos alternativos. Como contexto del entorno (no del modelo), Taxi-v3 admite un máximo de 200 pasos por episodio con recompensa −1 por paso, de modo que la recompensa media declarada es coherente con una política casi óptima, aunque la desviación típica de ±2,81 sugiere variabilidad apreciable entre episodios o un número reducido de episodios de evaluación. Esa apreciación es una lectura cualitativa, no un dato aportado por el autor.

## Requisitos de hardware

- VRAM para inferencia: 0 GB; el agente no usa GPU.
- RAM estimada: menos de 1 MB para la tabla Q (3.000 valores en coma flotante), más el consumo del propio simulador de Gymnasium.
- GPU recomendadas: ninguna; cualquier CPU sirve. No se requiere A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: sí, pero es irrelevante porque no hay cómputo tensorial que acelerar.
- Opciones de despliegue: `pickle` estándar de Python junto con Gymnasium y, opcionalmente, utilidades de carga de rl-zoo3 (`load_from_hub`). No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles como cifra publicada; por la naturaleza del artefacto, cada decisión es una búsqueda en tabla (coste de microsegundos) y el cuello de botella real es el paso del simulador, no el modelo.

## Comparativa con modelos similares

| Modelo / enfoque | Tipo | Parámetros | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| q-Taxi-v3 (BichengW) | Q-learning tabular | 3.000 valores Q | Taxi-v3 | no disponible | HuggingFace, 0 descargas |
| DQN sobre Taxi-v3 (stable-baselines3) | Red neuronal MLP con replay buffer | no disponible | Taxi-v3 | MIT (según la librería) | Implementación en la librería, pesos no incluidos |
| PPO sobre Taxi-v3 (stable-baselines3 o RL Baselines3 Zoo) | Política y valor con MLP | no disponible | Taxi-v3 | MIT (según la librería) | Implementación en la librería, pesos no incluidos |
| SARSA tabular sobre Taxi-v3 | Q-learning on-policy | 3.000 valores Q | Taxi-v3 | no disponible | Depende de la implementación concreta |

No se dispone de datos de rendimiento publicados para las alternativas en la información proporcionada, por lo que la comparación cuantitativa de recompensa media queda como "no disponible".

## Limitaciones y advertencias

- La métrica de recompensa media (7,46 ± 2,81) está marcada como no verificada en el model-index y no se especifica el número de episodios, las semillas ni el protocolo de evaluación.
- La desviación típica de ±2,81 es alta respecto a la media, lo que puede indicar alta varianza entre episodios o una muestra de evaluación pequeña; conviene reevaluar con un número fijo de episodios antes de usar la cifra en comparaciones.
- No se documentan hiperparámetros de entrenamiento (α, γ, ε, episodios), lo que impide reproducir el entrenamiento a partir de la model card.
- El agente está acoplado al entorno Taxi-v3; no generaliza a otros entornos ni a variantes con distinto número de estados o acciones.
- La model card advierte de la necesidad de comprobar atributos del entorno al cargarlo (`is_slippery=False` y similares); una configuración distinta del entorno invalida la política aprendida.
- Licencia no declarada: no hay autorización explícita para uso comercial, redistribución o modificación; en producción esto constituye un riesgo legal que debe resolverse contactando con el autor.
- El artefacto se distribuye como `.pkl`, formato que ejecuta código arbitrario al deserializarse; cargarlo desde un repositorio sin verificación implica un riesgo de seguridad que debe mitigarse con sandboxing.
- Cero descargas y cero likes en el momento de la consulta: no existe validación por parte de la comunidad.
- La fecha de creación registrada (2026-10-28) es posterior a la fecha habitual de consulta; conviene verificar la procedencia y autenticidad del repositorio.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, ni tool calling, ni razonamiento multi-paso fuera del entorno; no debe evaluarse con benchmarks tipo MMLU o HumanEval.

## Enlaces

- HuggingFace: https://huggingface.co/BichengW/q-Taxi-v3
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
