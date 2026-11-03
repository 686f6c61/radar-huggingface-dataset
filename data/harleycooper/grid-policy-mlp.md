# HarleyCooper/grid-policy-mlp

## Resumen

GridPolicyMLP es una red de política (policy network) mínima desarrollada por el usuario HarleyCooper y publicada en HuggingFace bajo licencia MIT. Se trata de un perceptrón multicapa (MLP) de solo 17.253 parámetros entrenado con PPO (Proximal Policy Optimization) para jugar a un juego de rejilla de 10x10. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de investigación de reinforcement learning, orientado a un entorno concreto y cerrado.

El modelo recibe una observación de 500 valores de entrada (una rejilla de 10x10 con 5 canales binarios: agente, objetos móviles, objetivos de recompensa, obstáculos y fotograma anterior) y produce 5 logits correspondientes a las acciones no-op, arriba, abajo, izquierda y derecha. La arquitectura es deliberadamente simple: 500 → 32 (tanh) → 32 (tanh) → 5 logits, sin mecanismos de atención ni capas recurrentes.

Su relevancia es limitada y muy específica: sirve como ejemplo didáctico de entrenamiento con PPO, como baseline para entornos de rejilla y como pieza reproducible en experimentos de RL a pequeña escala. No debe confundirse con un modelo fundacional ni utilizarse fuera del entorno para el que fue entrenado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere pesos muy ligeros (probablemente un único `pytorch_model.bin` de pocos kilobytes).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa): 500 → 32 (tanh) → 32 (tanh) → 5 logits |
| Parámetros totales | 17.253 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 500 valores) |
| Tipos de cuantización | no disponible (pesos en punto flotante estándar de PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch `state_dict`) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas con activaciones tanh en las dos capas ocultas (32 unidades cada una) y una capa de salida de 5 logits que se interpretan como distribución categórica sobre las acciones. La observación se aplana con un orden concreto: el índice de entrada se calcula como `i = (fila * 10 + columna) * 5 + canal`, lo que implica que cualquier integración debe respetar exactamente ese layout para que el modelo funcione.

El entrenamiento se realizó con PPO, el algoritmo de optimización de política proximal ampliamente usado en RL por su estabilidad. La model card no especifica el número de pasos de entrenamiento, el tamaño del batch, la tasa de aprendizaje, la función de recompensa ni la composición del entorno más allá de la descripción de los 5 canales de observación. Tampoco se documenta si hubo currículo, reward shaping o técnicas auxiliares. La innovación técnica es nula por diseño: se trata de un ejemplo canónico de policy network tabular-a-MLP para un entorno de rejilla.

## Capacidades

- Selección de acciones discretas en un entorno de rejilla 10x10 con 5 acciones posibles (no-op, arriba, abajo, izquierda, derecha).
- Procesamiento de observaciones estructuradas de 500 valores binarios organizados en 5 canales.
- Muestreo estocástico de acciones a partir de la softmax de los logits (método `act`).
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso ni razonamiento multi-turno más allá del bucle de RL para el que fue entrenado.
- No tiene capacidades multilingües.
- No tiene modo thinking, visión, audio ni ninguna modalidad adicional.
- No genera texto, código ni matemáticas.

## Casos de uso

- Baseline didáctico de PPO: usar el modelo como referencia mínima para comparar implementaciones de PPO en entornos de rejilla, ya que su tamaño (17.253 parámetros) permite entrenar y evaluar en CPU en segundos.
- Reproducción de experimentos de RL: cargar el `state_dict` y evaluar la política en el entorno original para verificar la reproducibilidad de resultados publicados o de tutoriales.
- Punto de partida para fine-tuning en entornos de rejilla propios: sustituir la capa de salida o reentrenar el MLP con PPO sobre una variante del juego (por ejemplo, rejillas de otro tamaño o con más canales) aprovechando la arquitectura ligera.
- Componente en pipelines de investigación de RL: integrarlo como política de referencia en estudios sobre estabilidad de PPO, reward shaping o exploración, dado su bajo coste computacional.
- Docencia y formación: ilustrar el flujo completo observación → red → logits → softmax → acción en cursos de aprendizaje por refuerzo, con un modelo que cabe en cualquier portátil.
- Pruebas de infraestructura de despliegue de RL: validar sistemas de serving de políticas (por ejemplo, entornos de simulación o wrappers de inferencia) con un modelo de latencia despreciable antes de escalar a políticas mayores.
- Experimentos de destilación o compresión: usar el MLP como estudiante o profesor en estudios de compresión de políticas, dado su tamaño trivial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa media, tasa de éxito, número de episodios ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; el modelo ocupa del orden de decenas de kilobytes en punto flotante de 32 bits (17.253 parámetros × 4 bytes ≈ 69 KB).
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna; también en Raspberry Pi y dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (carga directa del `state_dict` con `torch.load`); no se documentan exportaciones a ONNX, TorchScript, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamaño, la inferencia por paso debería estar en el orden de microsegundos en CPU moderna, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GridPolicyMLP (HarleyCooper) | 17.253 | 500 valores (rejilla 10x10 × 5 canales) | Política PPO para juego de rejilla | MIT | HuggingFace, 0 descargas |
| Políticas PPO de Stable-Baselines3 (MLP por defecto) | Configurable (por defecto ~64x64) | Depende del entorno | RL general con PPO | MIT | GitHub, ampliamente usada |
| Políticas de CleanRL (PPO) | Configurable | Depende del entorno | RL con PPO, referencia educativa | MIT | GitHub |
| Políticas de RLlib (Ray) | Configurable | Depende del entorno | RL escalable | Apache 2.0 | GitHub |

La comparación es cualitativa: no existen benchmarks publicados de GridPolicyMLP frente a estas alternativas, y las políticas de Stable-Baselines3, CleanRL o RLlib son frameworks genéricos, no modelos concretos comparables uno a uno. Cualquier comparación numérica requeriría ejecutar el mismo entorno con cada política.

## Limitaciones y advertencias

- El modelo está entrenado para un único entorno de rejilla 10x10 con 5 canales y 5 acciones; fuera de ese entorno su comportamiento carece de garantías.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no debe evaluarse con benchmarks de NLP.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe el riesgo de que la política produzca acciones subóptimas o erráticas si la observación no respeta el layout `i = (fila * 10 + columna) * 5 + canal`.
- No se documentan sesgos, pero al ser una política entrenada con una recompensa concreta, hereda cualquier sesgo del diseño del entorno y de la función de recompensa, que no se detallan.
- La licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-03), lo que sugiere un artefacto recién publicado y sin validación comunitaria.
- No hay información sobre el número de pasos de entrenamiento ni sobre la convergencia de la política, por lo que no se puede asumir un rendimiento mínimo garantizado.
- El tamaño del repo es de 0.0 GB, lo que puede indicar que los pesos no están subidos o que son extremadamente ligeros; conviene verificar la presencia de `pytorch_model.bin` antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/HarleyCooper/grid-policy-mlp
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
