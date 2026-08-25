# huggsook/lunar-lander-v3-dqn

## Resumen

El modelo `huggsook/lunar-lander-v3-dqn` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con una Deep Q-Network (DQN) para resolver el entorno `LunarLander-v3` de la librería Gymnasium. El objetivo del agente es controlar un módulo lunar para que aterrice de forma segura en una plataforma designada, optimizando la recompensa acumulada mediante decisiones discretas de propulsión. El autor, huggsook, publica el modelo con pesos en formato PyTorch, junto con el código de evaluación y los hiperparámetros utilizados.

El modelo es relevante como ejemplo didáctico y práctico de aplicación de DQN a un problema de control continuo discretizado. Su arquitectura es un perceptrón multicapa (MLP) de tres capas totalmente conectadas, con 8 entradas (estado del entorno) y 4 salidas (acciones discretas). El entrenamiento se completó en 288 episodios, alcanzando una recompensa media de evaluación de +282.25, lo que indica un aterrizaje limpio entre las banderas de la plataforma. No se especifica licencia ni idiomas soportados, y el repositorio no contiene archivos de gran tamaño (0.0 GB), lo que sugiere que solo se incluyen los pesos del modelo y posiblemente un script de ejemplo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (3 capas totalmente conectadas: 8→128→128→4, con ReLU) |
| Parametros totales | 17.668 (aprox., calculado: 8×128 + 128 + 128×128 + 128 + 128×4 + 4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con estado de 8 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

El modelo es una red Q (Q-network) implementada como un perceptrón multicapa. La entrada es un vector de 8 dimensiones continuas que representan el estado del entorno: posición horizontal y vertical (`x`, `y`), velocidades lineales (`v_x`, `v_y`), ángulo y velocidad angular (`θ`, `ω`), y el estado de contacto de las patas izquierda y derecha (`leg_L`, `leg_R`). La salida es un vector de 4 valores Q correspondientes a las acciones discretas: inactividad, disparar motor izquierdo, disparar motor principal y disparar motor derecho. La red utiliza dos capas ocultas de 128 neuronas con activación ReLU.

El entrenamiento sigue el algoritmo DQN estándar con las siguientes características: actualización de la red objetivo mediante soft update con factor τ = 0.001 (Polyak), función de pérdida Huber (SmoothL1Loss), buffer de experiencia de 100.000 transiciones, batch size de 64, tasa de aprendizaje de 0.0005, factor de descuento γ = 0.99 y una política ε-greedy con decaimiento exponencial desde ε = 1.0 hasta ε = 0.01 con factor 0.995. El agente resolvió el entorno en 288 episodios, superando el umbral de recompensa media de 200. No se menciona el uso de técnicas avanzadas como Double DQN, Dueling DQN o priorización de experiencias.

## Capacidades

- Control de aterrizaje autónomo: el agente es capaz de maniobrar el módulo lunar para aterrizar en la plataforma designada, gestionando los motores laterales y principal.
- Toma de decisiones en tiempo real: dado un estado de 8 dimensiones, produce una acción discreta óptima según la política aprendida.
- Generalización dentro del entorno: el modelo fue evaluado con una semilla fija (seed 42) y obtuvo una recompensa media de +282.25, lo que indica un comportamiento robusto en el escenario de prueba.
- Integración con Gymnasium: compatible con la API estándar de Gymnasium, permitiendo su uso en pipelines de evaluación y comparación con otros agentes.
- Ligereza computacional: al ser un MLP pequeño, la inferencia es extremadamente rápida y puede ejecutarse en CPU sin problemas.

## Casos de uso

- Educación en aprendizaje por refuerzo: el modelo sirve como ejemplo práctico de implementación de DQN, permitiendo a estudiantes e investigadores analizar la arquitectura, los hiperparámetros y el proceso de entrenamiento en un entorno clásico.
- Benchmark de algoritmos de RL: al ser un agente DQN estándar, puede utilizarse como línea base para comparar el rendimiento de variantes más avanzadas (Double DQN, Dueling DQN, etc.) en el mismo entorno.
- Prototipado de sistemas de control: aunque el entorno es simplificado, el enfoque de mapear un estado continuo a acciones discretas puede extrapolarse a problemas de control reales, como la gestión de drones o vehículos autónomos en entornos simulados.
- Investigación en estabilidad de entrenamiento: el registro de 288 episodios para superar el umbral de recompensa media de 200 proporciona un punto de referencia para estudiar la velocidad de convergencia y la estabilidad de DQN.
- Demostración de inferencia con PyTorch: el código de evaluación incluido en la model card muestra cómo cargar los pesos, ejecutar el modelo en modo evaluación y visualizar el comportamiento del agente, útil para desarrolladores que quieran integrar modelos de RL en sus aplicaciones.
- Comparación de políticas de exploración: los hiperparámetros de ε-greedy (decaimiento 0.995) pueden analizarse para entender el equilibrio entre exploración y explotación en entornos con recompensas dispersas.

## Benchmarks y rendimiento

El autor declara en el model-index los siguientes resultados:

| Benchmark | Entorno | Metrica | Valor |
|---|---|---|---|
| LunarLander-v3-DQN | LunarLander-v3 | Recompensa media de evaluacion | 282.25 |

Este valor corresponde a una evaluación con semilla fija (seed 42) y representa un aterrizaje limpio en la plataforma. No se proporcionan comparaciones con otros modelos en la misma tabla. En la búsqueda web se encontraron otros agentes similares, como `allen73/lunarlander-v3-dqn-physical-ai` (Double Dueling DQN) y `taeri077/lunar-lander-dqn` (DQN con pico de +319.1), pero no se dispone de sus métricas oficiales en el contexto de esta ficha. Por tanto, la comparación cuantitativa directa no es posible con los datos disponibles.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB (el modelo tiene ~17.000 parámetros, los pesos ocupan aproximadamente 70 KB en float32).
- GPU recomendada: no necesaria; cualquier CPU moderna puede ejecutar la inferencia en microsegundos.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con soporte CUDA (por ejemplo, RTX 3060 o superior) funcionará, aunque no aporta ventaja significativa dada la simplicidad del modelo.
- Opciones de despliegue: el modelo se carga directamente con PyTorch (`torch.load`). No se requiere infraestructura especial; puede ejecutarse en un script Python estándar, en un notebook o en un servicio serverless.
- Latencia y throughput: la inferencia es prácticamente instantánea (menos de 1 ms por paso en CPU). El cuello de botella sería la interacción con el entorno Gymnasium, no el modelo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Recompensa media | Episodios para resolver | Arquitectura | Licencia |
|---|---|---|---|---|---|
| huggsook/lunar-lander-v3-dqn | DQN estándar | 282.25 | 288 | MLP 8-128-128-4 | no disponible |
| allen73/lunarlander-v3-dqn-physical-ai | Double Dueling DQN | no disponible | no disponible | no disponible | no disponible |
| hwihwalab/lunarlander-v3-d3qn | D3QN (Double Dueling) | no disponible | no disponible | no disponible | MIT |
| taeri077/lunar-lander-dqn | DQN (1000 episodios) | 319.1 (pico) | no disponible | no disponible | no disponible |

La comparativa se basa en la información pública de los repositorios encontrados. El modelo de huggsook es un DQN estándar, mientras que las alternativas emplean variantes mejoradas (Double Dueling) o entrenamientos más largos. Sin datos oficiales de evaluación para los otros modelos, no es posible establecer una jerarquía de rendimiento fiable.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un agente entrenado en un entorno simulado específico, no generaliza a otros entornos o variaciones de LunarLander sin reentrenamiento.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo de texto.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje natural.
- Restricciones de licencia: la licencia no está especificada, por lo que se desconoce si permite uso comercial o modificación. Se recomienda contactar al autor antes de utilizarlo en proyectos productivos.
- Caveat para producción: el modelo fue evaluado con una única semilla (42) y no se proporcionan intervalos de confianza ni pruebas en múltiples semillas. Para usos críticos, sería necesario realizar una evaluación más exhaustiva.
- Dependencia de la versión de Gymnasium: el entorno `LunarLander-v3` es relativamente reciente; asegurarse de que la versión instalada sea compatible con el código de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggsook/lunar-lander-v3-dqn
- Repositorio similar (Double Dueling DQN): https://huggingface.co/allen73/lunarlander-v3-dqn-physical-ai
- Repositorio similar (D3QN): https://huggingface.co/hwihwalab/lunarlander-v3-d3qn
- Repositorio GitHub (DQN con pico de 319.1): https://github.com/taeri077/lunar-lander-dqn
- Repositorio GitHub (solución DQN): https://github.com/wtcherr/lunar-lander-dqn
- Notebook de referencia en Colab: https://colab.research.google.com/github/kuds/rl-lunar-lander/blob/main/%5BLunar%20Lander%5D%20Deep%20Q-Network%20(DQN).ipynb
