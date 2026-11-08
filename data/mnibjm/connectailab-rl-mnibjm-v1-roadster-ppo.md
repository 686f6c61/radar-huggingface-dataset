# mnibjm/connectailab-rl-mnibjm-v1-roadster-ppo

## Resumen

`connectailab-rl-mnibjm-v1-roadster-ppo` es un agente de aprendizaje por refuerzo entrenado con Proximal Policy Optimization (PPO) para una tarea de control continuo: aterrizar un vehículo tipo roadster invertido mediante un joystick de dos ejes (propulsor inferior con rango 0-1 y control de rotación con rango -1 a 1). Lo publica el usuario `mnibjm` en Hugging Face dentro del contexto del programa Connect AI Lab, un entorno colaborativo de entrenamiento de agentes de RL.

El modelo no es un modelo de lenguaje ni un transformer generativo: es una política neuronal (red de política y posiblemente red de valor) serializada con PyTorch, pensada para ser cargada por un entorno de simulación compatible con la API de Gymnasium. El repositorio tiene un tamaño de 0.0 GB según los metadatos de Hugging Face, lo que sugiere pesos muy ligeros o que el artefacto principal no se ha subido correctamente.

La relevancia de esta ficha es limitada: el propio autor reporta una tasa de acierto del 0.0 % en 50 episodios no vistos tras 100.000 pasos de entrenamiento, por lo que el modelo no es funcional para su tarea declarada. Se documenta aquí como referencia técnica del estado del artefacto y de sus carencias, no como una opción recomendable para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal para control continuo, entrenada con PPO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch` como librería declarada); el artefacto concreto no se detalla en la model card |
| Espacio de acciones | continuo: propulsor inferior [0, 1], rotación [-1, 1] |
| Pasos de entrenamiento | 100.000 |
| Entornos paralelos | 10 |
| Tasa de acierto reportada | 0.0 % en 50 episodios no vistos |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (número de capas, unidades por capa, función de activación ni si comparte tronco entre política y valor). Se sabe que el algoritmo es PPO con los siguientes hiperparámetros: `clip` de 0.1, 10 entornos paralelos, `n_steps` de 256, 20 épocas de optimización por actualización, tasa de aprendizaje de 0.0003 y coeficiente de entropía de 0.01. El entrenamiento total fue de 100.000 pasos de entorno, una cifra muy baja para tareas de control continuo con recompensas dispersas como el aterrizaje de un vehículo.

No se documenta la composición del dataset (en RL no aplica en sentido estricto), ni el diseño de la función de recompensa, ni si hubo currículo de dificultad, reward shaping o inicialización aleatoria de episodios. Tampoco se especifica el entorno de simulación exacto más allá de la referencia al programa Connect AI Lab y a la tarea "Inverted Roadster". La ausencia de una curva de aprendizaje legible en el texto (solo se enlaza una imagen `learning_curve.png`) impide evaluar la progresión del entrenamiento.

## Capacidades

- Control continuo de un vehículo bidimensional mediante dos señales: empuje vertical en [0, 1] y par de rotación en [-1, 1].
- Toma de decisiones paso a paso en un entorno de simulación física (no hay planificación multi-paso explícita más allá de la implícita en la política).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni procesamiento de texto.
- No dispone de modo "thinking", visión, audio ni modalidades adicionales.
- La única capacidad verificable es la de ejecutar una política PPO sobre observaciones del entorno, con un rendimiento reportado nulo en la tarea objetivo.

## Casos de uso

- Estudio de curvas de aprendizaje en PPO: el artefacto sirve como ejemplo de entrenamiento insuficiente (100.000 pasos) para ilustrar por qué las tareas de aterrizaje con recompensa dispersa requieren millones de pasos y reward shaping.
- Reproducción de experimentos docentes: cargar la política en el entorno Connect AI Lab para comparar hiperparámetros (clip, entropía, número de entornos) y observar el efecto en la tasa de acierto.
- Baseline negativo en benchmarks internos: usar el 0.0 % de acierto como referencia mínima frente a la que medir variantes mejoradas del mismo entorno.
- Depuración de pipelines de RL: verificar que el bucle de entrenamiento, el logging y la serialización de pesos funcionan correctamente antes de escalar a entrenamientos más largos.
- Análisis de estabilidad de PPO: inspeccionar la política entrenada para estudiar colapso de entropía o saturación de acciones en espacios continuos con recompensas escasas.
- Docencia sobre evaluación en RL: mostrar la importancia de evaluar en episodios no vistos (los 50 episodios reportados) y no solo en el retorno de entrenamiento.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tasa de acierto en 50 episodios no vistos | 0.0 % |
| Pasos totales de entrenamiento | 100.000 |
| Entornos paralelos | 10 |
| Retorno medio de entrenamiento | no disponible |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. No hay comparación con otros agentes del mismo entorno en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0.0 GB) y la naturaleza de la política, es probable que quepa en cualquier GPU consumer, pero no se confirma.
- GPU recomendadas: no disponible. Para inferencia de una política ligera basta con CPU, aunque no se especifica.
- Compatibilidad con GPU consumer: probablemente sí (RTX 3060 o superior), sin datos verificados.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) en un script Python que instancie el entorno Connect AI Lab; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Algoritmo | Pasos de entrenamiento | Acierto reportado | Licencia |
|---|---|---|---|---|---|
| `mnibjm/connectailab-rl-mnibjm-v1-roadster-ppo` | Inverted Roadster | PPO | 100.000 | 0.0 % | no disponible |
| `Martinyooo/connectailab-rl-martinyooo-v1-roadster-ppo` | Inverted Roadster | PPO | no disponible | no disponible | no disponible |
| `minju2026/connectailab-rl-minju2026-v1-roadster-ppo` | Inverted Roadster | PPO | no disponible | no disponible | no disponible |

Los tres modelos pertenecen al mismo programa Connect AI Lab y a la misma tarea, pero las model cards de los comparables no aportan métricas de rendimiento en la información disponible, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Rendimiento nulo en la tarea declarada: 0.0 % de acierto en 50 episodios no vistos, lo que invalida su uso práctico.
- Entrenamiento insuficiente: 100.000 pasos es un volumen muy bajo para control continuo con recompensa dispersa; se desconoce si hubo reward shaping.
- Falta de documentación: no se describe la arquitectura de la red, la función de recompensa, el entorno exacto ni la composición de las observaciones.
- Licencia no especificada: no se puede asumir uso comercial ni redistribución.
- Sin información sobre sesgos: al no operar sobre datos humanos, el riesgo de sesgo social es bajo, pero puede haber sesgos de simulación (física del entorno, distribución de estados iniciales).
- Riesgo de sobreajuste al entorno de entrenamiento: la evaluación en episodios no vistos arroja 0.0 %, lo que sugiere ausencia de generalización o un fallo sistémico en la política.
- Repositorio de 0.0 GB: posible que los pesos no estén realmente disponibles o que el artefacto sea incompleto; conviene verificar la pestaña de archivos antes de intentar cargarlo.
- No apto para producción en ningún escenario de control real sin un reentrenamiento completo y una evaluación rigurosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mnibjm/connectailab-rl-mnibjm-v1-roadster-ppo
- Modelo comparable (Martinyooo): https://huggingface.co/Martinyooo/connectailab-rl-martinyooo-v1-roadster-ppo
- Modelo comparable (minju2026, archivo `model.pt`): https://huggingface.co/minju2026/connectailab-rl-minju2026-v1-roadster-ppo/blob/main/model.pt
- Repositorio del modelo comparable (minju2026): https://huggingface.co/minju2026/connectailab-rl-minju2026-v1-roadster-ppo
