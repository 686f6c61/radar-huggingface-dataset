# arabellako22/dqn-LunarLander-v3-scratch

## Resumen

Este repositorio aloja un agente de aprendizaje por refuerzo (RL) basado en una Deep Q-Network (DQN) implementada desde cero en PyTorch, entrenado para resolver el entorno `LunarLander-v3` de Gymnasium. El modelo es obra de arabellako22, que lo publica como la mitad "educativa" de un par de repositorios, siendo la otra mitad una implementación equivalente con Stable-Baselines3. El objetivo es demostrar que una implementación manual de DQN (con replay buffer, red objetivo y actualización de Bellman escritas a mano) puede alcanzar un rendimiento comparable al de una biblioteca de RL consolidada.

La arquitectura es un perceptrón multicapa (MLP) con dos capas ocultas de 256 neuronas, que mapea el espacio de observación de 8 dimensiones del entorno a 4 acciones discretas. El modelo se entrenó durante 300.000 pasos de entorno y alcanza una recompensa media de 235,2 ± 89,0 en 50 episodios de evaluación, superando el umbral de 200 puntos que se considera "resuelto". Su relevancia actual radica en ser un ejemplo didáctico de implementación de DQN desde cero, útil para estudiantes e investigadores que quieran entender los mecanismos internos del algoritmo sin depender de librerías de alto nivel.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (8 → 256 → 256 → 4) con activación ReLU |
| Parametros totales | 69.124 (estimación a partir de la arquitectura declarada) |
| Longitud de contexto | no aplicable (modelo de control de RL, no procesa lenguaje) |
| Tipos de cuantizacion | no aplicable (red pequeña, no se cuantiza) |
| Idiomas soportados | no aplicable (modelo de RL, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es una DQN clásica (Mnih et al., 2015) con experiencia replay y red objetivo sincronizada periódicamente. La red Q es un perceptrón multicapa con dos capas ocultas de 256 unidades y activación ReLU, que toma como entrada un vector de 8 dimensiones (posición, velocidad, ángulo, velocidad angular y dos flags de contacto con las piernas) y produce valores Q para 4 acciones discretas (noop, motor izquierdo, motor principal, motor derecho). La pérdida es Huber (L1 suavizada) sobre el error de TD, optimizada con Adam y con recorte de norma del gradiente a 10,0.

El entrenamiento se realizó durante 300.000 pasos en el entorno, con un buffer de experiencia de 50.000 transiciones, tamaño de lote 128, tasa de aprendizaje 0,00063 y factor de descuento gamma 0,99. La política de exploración sigue un programa de epsilon decreciente: fracción de exploración de 0,12 y epsilon final de 0,05. La red objetivo se actualiza cada 250 pasos. Los estados terminales y truncados se almacenan por separado, cortando el bootstrapping solo en `terminated` para evitar sesgos en la estimación del valor. La implementación no usa Double DQN ni dueling heads, lo que provoca una sobreestimación de los Q-valores y una varianza entre semillas mayor que la de una implementación optimizada con bibliotecas.

## Capacidades

- Control de un aterrizador lunar en el entorno `LunarLander-v3`, tomando decisiones discretas en tiempo real (4 acciones).
- Estabilización de la nave: el agente aprende a controlar la posición, la velocidad y la orientación para aterrizar en la plataforma designada.
- Gestión de la recompensa: maximiza la puntuación acumulada, equilibrando el uso de combustible, la precisión del aterrizaje y las penalizaciones por choques.
- Funcionamiento con observaciones parciales: utiliza las 8 variables de estado del entorno (posición, velocidad, ángulo, velocidad angular y contactos con las piernas).
- Inferencia determinista: en modo evaluación, selecciona la acción con el mayor Q-valor (greedy), sin exploración.
- Compatible con Gymnasium: se integra con el API estándar de Gymnasium para evaluación y despliegue.

## Casos de uso

- **Educación en aprendizaje por refuerzo**: el modelo es un ejemplo de referencia para enseñar DQN desde cero, ya que incluye el código de la red (`model.py`) y los pesos, permitiendo a estudiantes inspeccionar la implementación manual del replay buffer, la red objetivo y la actualización de Bellman sin depender de librerías de RL.
- **Benchmark de algoritmos de RL**: el agente puede usarse como baseline para comparar DQN clásico contra variantes más modernas (Double DQN, Dueling, D3QN) en el entorno LunarLander-v3, gracias a los resultados publicados en la model card.
- **Prototipo de control de sistemas físicos**: aunque el entorno es un simulador, la arquitectura de red pequeña y la política de control aprendida pueden servir como punto de partida para transferir a tareas de control discretas similares (por ejemplo, control de procesos con acciones discretas).
- **Integración en pipelines de simulación**: el agente puede cargarse en un entorno Gymnasium y usarse como agente automático para generar datos de trayectorias o evaluar políticas en simulaciones de aterrizaje.
- **Comparación de implementaciones**: junto con el repositorio hermano `dqn-LunarLander-v3-sb3`, permite comparar una implementación desde cero con una basada en Stable-Baselines3, evaluando el impacto de las optimizaciones de la biblioteca (recompensa media, mediana, tasa de éxito, etc.).
- **Investigación sobre sesgo de truncamiento**: el modelo almacena por separado los estados terminales y truncados, lo que lo convierte en un caso de estudio para analizar cómo el manejo del bootstrapping en truncamientos afecta a la calidad de la política.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card, obtenidos evaluando ambos agentes en los mismos 50 episodios (semillas 100-149, selección de acción greedy). No han sido verificados externamente.

| Métrica | Stable-Baselines3 (DQN) | DQN desde cero (PyTorch) |
| --- | --- | --- |
| Recompensa media | 237,4 ± 101,1 | 235,2 ± 89,0 |
| Recompensa mediana | 281,4 | 256,6 |
| Tasa de éxito (≥ 200) | 80% | 84% |
| Peor episodio | 6,7 | -152,2 |
| Mejor episodio | 327,1 | 315,9 |

La distribución de recompensas es bimodal: la mayoría de los episodios superan los 220 puntos, pero una minoría se queda cerca de la plataforma hasta el límite de 1000 pasos y puntúa por debajo de 100. Por eso el autor recomienda usar la mediana y la tasa de éxito además de la media, ya que esta es sensible a la elección de las semillas de evaluación.

## Requisitos de hardware

- **VRAM**: menos de 1 MB, el modelo tiene solo 69.124 parámetros y puede ejecutarse en CPU sin problema.
- **GPU**: no es necesaria; cualquier GPU disponible es más que suficiente, pero la inferencia es instantánea en CPU.
- **Consumer GPU**: sí, se ejecuta en cualquier GPU de consumo (RTX 3060, 4090, etc.) con un consumo de VRAM despreciable.
- **Opciones de despliegue**: se puede cargar directamente con PyTorch en un entorno Gymnasium; no requiere librerías adicionales de RL. Para integración en pipelines, se puede usar como un módulo Python estándar.
- **Latencia**: en CPU, la inferencia de una sola acción tarda menos de 1 milisegundo (red de 3 capas totalmente conectadas); en GPU, es prácticamente instantánea.

## Comparativa con modelos similares

| Modelo | Algoritmo | Recompensa media | Tasa de éxito | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| `dqn-LunarLander-v3-scratch` (este) | DQN (desde cero) | 235,2 ± 89,0 | 84% | no disponible | HuggingFace (PyTorch) |
| `dqn-LunarLander-v3-sb3` | DQN (Stable-Baselines3) | 237,4 ± 101,1 | 80% | no disponible | HuggingFace (PyTorch) |
| `lunarlander-v3-d3qn` (hwihwalab) | D3QN (Dueling Double DQN) | no disponible | no disponible | no disponible | HuggingFace (PyTorch) |

No se dispone de datos de rendimiento del modelo D3QN en la información consultada. La comparativa principal es entre las dos variantes del mismo autor, que muestran un rendimiento muy similar en media, aunque el modelo de SB3 tiene una mediana más alta (281,4 vs 256,6) y un mejor peor episodio (6,7 vs -152,2), mientras que el modelo desde cero tiene una tasa de éxito ligeramente superior (84% vs 80%).

## Limitaciones y advertencias

- **Espacio de acciones discretas**: DQN solo soporta espacios de acciones discretos, por lo que estos pesos no son transferibles a `LunarLanderContinuous-v3` ni a tareas de control continuo; para esos casos se requiere SAC, TD3 o PPO.
- **Sobreestimación de Q-valores**: al no usar Double DQN, los Q-valores están sobreestimados, lo que puede llevar a políticas subóptimas en entornos con ruido.
- **Varianza entre semillas**: la implementación manual no incluye técnicas de reducción de varianza (prioritized replay, dueling heads), por lo que la recompensa media puede variar notablemente según la semilla de evaluación.
- **Sin verificación externa**: los resultados de la model card no están verificados por un tercero, por lo que deben tomarse con cautela.
- **Limitaciones de entorno**: el modelo está entrenado solo para `LunarLander-v3`; no es un agente generalista y no puede aplicarse a otras tareas sin reentrenamiento.
- **Licencia no especificada**: la licencia no está declarada, por lo que el uso comercial puede requerir consultar al autor.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/arabellako22/dqn-LunarLander-v3-scratch)
- [Repositorio hermano (Stable-Baselines3)](https://huggingface.co/arabellako22/dqn-LunarLander-v3-sb3)
- [Modelo D3QN de hwihwalab](https://huggingface.co/hwihwalab/lunarlander-v3-d3qn)
- [Gymnasium (documentación oficial)](https://gymnasium.farama.org/)
- [Mnih et al., *Human-level control through deep reinforcement learning*, Nature 2015](https://www.nature.com/articles/nature14236)
