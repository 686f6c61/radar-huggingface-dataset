# ShigatoraShuz/PPO-CleanRL-LunarLander-v2

## Resumen

PPO-CleanRL-LunarLander-v2 es un agente de aprendizaje por refuerzo entrenado con el algoritmo Proximal Policy Optimization (PPO) sobre el entorno LunarLander-v2 de Gymnasium. Lo publica el usuario ShigatoraShuz en Hugging Face como parte de un curso de deep reinforcement learning, con una implementación propia basada en la referencia de CleanRL. No es un modelo de lenguaje ni un transformer generativo: es una política neuronal entrenada para controlar el aterrizaje de una nave en un entorno bidimensional de física simulada.

El modelo resuelve una tarea de control continuo discreto: recibir un vector de observación de 8 dimensiones (posición, velocidad, ángulo, velocidad angular, contacto con el suelo y estado de las patas) y emitir una de cuatro acciones discretas (no hacer nada, encender motor izquierdo, encender motor principal o encender motor derecho). El objetivo es maximizar la recompensa acumulada aterrizando suavemente entre dos banderas sin estrellarse.

Su relevancia es fundamentalmente educativa y de referencia: sirve como ejemplo reproducible de un pipeline PPO completo (entrenamiento, evaluación y publicación con model-index) y como punto de partida para comparar implementaciones. El resultado declarado por el autor es un `mean_reward` de -143,98 ± 92,91, un rendimiento bajo que indica que la política no ha convergido a un comportamiento de aterrizaje estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (actor-crítico) para PPO; arquitectura exacta (capas y unidades) no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observación de 8 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el tamaño del repositorio es de 0,0 GB, por lo que no se confirma la presencia de pesos) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) que estabiliza las actualizaciones mediante una región de confianza aproximada. La implementación se declara como propia, inspirada en CleanRL, lo que implica típicamente un bucle de entrenamiento monolítico con múltiples entornos vectorizados, cálculo de ventajas con GAE (Generalized Advantage Estimation) y una red actor-crítico compartida o separada. No se especifican en la información disponible el número de capas, el tamaño de las capas ocultas, la tasa de aprendizaje, el número de pasos de entrenamiento ni la configuración de hiperparámetros.

El entorno LunarLander-v2 de Gymnasium proporciona recompensas densas: incrementos por aproximarse al punto de aterrizaje, penalizaciones por velocidad excesiva y por inclinación, bonificación por aterrizaje entre las banderas y penalización por estrellarse o salirse de la pantalla. El resultado declarado de -143,98 ± 92,91 sugiere un entrenamiento insuficiente o inestable: un agente PPO bien ajustado en este entorno suele superar recompensas medias de 200 en la versión discreta. No se documentan técnicas adicionales como normalización de observaciones, recompensas conformadas, decodificación especulativa ni mecanismos de atención.

## Capacidades

- Control de políticas en entornos de acción discreta con observaciones vectoriales de baja dimensión.
- Toma de decisiones secuenciales multi-paso en un entorno de física simulada (LunarLander-v2).
- Entrenamiento y evaluación reproducibles mediante el formato model-index de Hugging Face.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni planificación simbólica.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo de razonamiento (*thinking*), visión, audio ni generación de texto.
- Uso previsto como referencia educativa de un pipeline PPO, no como componente de producción.

## Casos de uso

- Docencia de reinforcement learning: usar el repositorio como ejemplo de publicación de un agente PPO con métricas declaradas en model-index, para que los alumnos comparen su propia implementación con una referencia externa.
- Reproducción de experimentos: servir de línea base para estudiar por qué un PPO con recompensa media negativa no converge, analizando la curva de aprendizaje y los hiperparámetros del autor.
- Comparación de implementaciones: contrastar la implementación propia frente a la de CleanRL original en el mismo entorno y con la misma semilla, para medir diferencias de rendimiento.
- Pruebas de infraestructura de RL: validar pipelines de entrenamiento vectorizado, registro de métricas y empaquetado de artefactos en un entorno de baja dimensionalidad y coste computacional mínimo.
- Investigación sobre estabilidad de PPO: analizar la varianza alta (± 92,91) como caso de estudio de inestabilidad de política y explorar técnicas de mitigación como ajuste de la tasa de aprendizaje o del coeficiente de entropía.
- Benchmarking de entornos Gymnasium: usar el agente como consumidor de referencia de LunarLander-v2 para verificar la integración de la API del entorno en nuevas versiones de Gymnasium.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | LunarLander-v2 | mean_reward | -143,98 ± 92,91 |

No se han publicado otros resultados de benchmarks en la información disponible. El valor negativo y la desviación típica elevada indican que la política no alcanza un comportamiento de aterrizaje consistente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del entorno (observación de 8 dimensiones y 4 acciones), la política cabe holgadamente en cualquier GPU consumer, pero no se confirma el tamaño de los pesos ni su presencia en el repositorio (0,0 GB).
- GPU recomendadas: no disponible. Cualquier GPU con soporte para PyTorch (por ejemplo, RTX 3060 o superior) sería suficiente para inferencia; para entrenamiento, una GPU consumer básica basta.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el reducido espacio de observación y acción; no confirmado por falta de datos de pesos.
- Opciones de despliegue: no se documentan. Al ser un agente de RL, el despliegue requeriría cargar los pesos en PyTorch o en un runtime compatible con el formato de serialización empleado, que no se especifica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| PPO-CleanRL-LunarLander-v2 (ShigatoraShuz) | LunarLander-v2 | PPO | no disponible | no aplica | -143,98 ± 92,91 | no disponible | Hugging Face |
| CleanRL PPO LunarLander (referencia) | LunarLander-v2 | PPO | no disponible | no aplica | no disponible en esta ficha | MIT (CleanRL) | GitHub |
| Stable-Baselines3 PPO LunarLander | LunarLander-v2 | PPO | no disponible | no aplica | no disponible en esta ficha | MIT | GitHub / PyPI |

La comparación se limita a la categoría de agentes PPO para LunarLander-v2. No se dispone de métricas públicas de las alternativas en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Rendimiento bajo: la recompensa media declarada es negativa (-143,98), lo que sugiere que el agente no ha aprendido a aterrizar de forma fiable.
- Alta varianza: la desviación típica de ± 92,91 indica una política inestable y poco reproducible entre episodios.
- Métricas no verificadas: el campo `verified` del model-index es `false`, por lo que los resultados no han sido validados de forma independiente.
- Licencia no disponible: no se especifica licencia, lo que impide determinar si el uso comercial está permitido.
- Tamaño del repositorio de 0,0 GB: no se confirma que los pesos del modelo estén publicados, lo que limita su reproducibilidad.
- Ausencia de documentación técnica: no se detallan hiperparámetros, arquitectura de red, semillas ni número de pasos de entrenamiento.
- Especificidad del dominio: el agente solo es válido para LunarLander-v2 y no generaliza a otras tareas.
- Riesgo de sobreajuste al entorno: sin datos de evaluación en entornos modificados, no se puede evaluar la robustez de la política.
- No apto para producción: su uso previsto es educativo y de investigación, no como componente de sistemas reales.

## Enlaces

- [Hugging Face: ShigatoraShuz/PPO-CleanRL-LunarLander-v2](https://huggingface.co/ShigatoraShuz/PPO-CleanRL-LunarLander-v2)
- [CleanRL (repositorio de referencia)](https://github.com/vwxyzjn/cleanrl)
- [Gymnasium LunarLander-v2](https://gymnasium.farama.org/environments/box2d/lunar_lander/)
- [Stable-Baselines3](https://github.com/DLR-RM/stable-baselines3)
- [PPO original (paper)](https://arxiv.org/abs/1707.06347)
