# boeyyyy/AdaptiGraph

## Resumen

AdaptiGraph es un modelo de dinámica neuronal basado en grafos, presentado en el artículo "AdaptiGraph: Material-Adaptive Graph-Based Neural Dynamics for Robotic Manipulation" (RSS 2024) por Kaifeng Zhang, Baoyu Li, Kris Hauser y Yunzhu Li. No se trata de un modelo de lenguaje, sino de un modelo de dinámica para manipulación robótica que predice la evolución de materiales deformables (cuerda, materiales granulares y tela) mediante redes neuronales de grafos.

El repositorio de Hugging Face `boeyyyy/AdaptiGraph` contiene únicamente los checkpoints del modelo de dinámica correspondientes a la época 100 para los tres materiales citados (rope, granular y cloth). El código de referencia se distribuye por separado en GitHub, y los datos de entrenamiento en un dataset independiente de Hugging Face.

Su relevancia radica en la adaptación por material: el modelo ajusta su dinámica a las propiedades del objeto manipulado, lo que lo hace útil para planificación y control en robótica con objetos deformables, un dominio donde los modelos genéricos suelen fallar. La información pública disponible sobre arquitectura detallada, número de parámetros y contexto es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos (graph neural networks) para modelado de dinámica |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (checkpoints en PyTorch `.pth`) |
| Idiomas soportados | no disponible (no aplica: modelo robótico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`), checkpoints `model_100.pth` |

## Arquitectura y entrenamiento

AdaptiGraph emplea una arquitectura de redes neuronales de grafos orientada a modelar la dinámica de materiales deformables para manipulación robótica. El modelo se entrena de forma específica por material (rope, granular, cloth), y los checkpoints publicados corresponden a la época 100 de entrenamiento. La propuesta central del artículo es la adaptación al material: la dinámica aprendida se condiciona a las propiedades del objeto manipulado.

No se dispone en la información proporcionada de detalles sobre el número de tokens o trayectorias de entrenamiento, la composición exacta del dataset, ni sobre el uso de técnicas como RLHF o DPO (no aplicables en este dominio). Tampoco se documentan innovaciones concretas como decodificación especulativa o atención lineal, al no tratarse de un transformer de lenguaje. Los datos de entrenamiento se distribuyen en el dataset `boeyyyy/AdaptiGraph-data`.

## Capacidades

- Predicción de dinámica de materiales deformables: cuerda (rope), materiales granulares (granular) y tela (cloth).
- Modelado basado en grafos de partículas o nodos, adecuado para representar estados de objetos deformables.
- Adaptación por material: checkpoints especializados para cada tipo de material.
- Integración con el pipeline de robótica del repositorio oficial (`src/dynamics/rollout/rollout.py`).
- Soporte para tareas de planificación y control en manipulación robótica (según el artículo asociado).
- No soporta tool calling, function calling, agentes conversacionales ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking mode), visión general ni audio.

## Casos de uso

- Manipulación de cuerdas en robótica: el checkpoint `rope` permite predecir cómo se deformará una cuerda bajo acciones del robot, útil para tareas de anudado o tendido.
- Manipulación de materiales granulares: el checkpoint `granular` modela el comportamiento de sustancias como arena o granos, aplicable a tareas de vertido o excavación robótica.
- Manipulación de tela: el checkpoint `cloth` predice la dinámica de tejidos, relevante para tareas de doblado o extendido de ropa.
- Planificación basada en modelo: el modelo de dinámica puede integrarse en bucles de planificación para simular el resultado de acciones antes de ejecutarlas.
- Investigación en dinámica de materiales deformables: sirve como referencia reproducible (época 100, licencia MIT) para comparar métodos de modelado basado en grafos.
- Reproducción de resultados del artículo RSS 2024: los checkpoints permiten replicar los experimentos publicados usando el código oficial y el dataset asociado.
- Desarrollo de políticas de control: las predicciones del modelo pueden alimentar políticas de control para robots que interactúan con objetos no rígidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño de la representación en grafo y del número de partículas; no se especifica en la información).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante PyTorch con el código oficial del repositorio (`src/dynamics/rollout/rollout.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio de Hugging Face ocupa 0.0 GB según la ficha, con checkpoints en `log/{rope,granular,cloth}/checkpoints/model_100.pth`.

## Comparativa con modelos similares

| Modelo | Tipo | Materiales | Licencia | Disponibilidad |
|---|---|---|---|---|
| AdaptiGraph | GNN de dinámica | rope, granular, cloth | MIT | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El repositorio contiene solo checkpoints de la época 100; no incluye código de inferencia ni pipeline completo, que debe obtenerse del repositorio de GitHub.
- El modelo está especializado en tres materiales concretos (rope, granular, cloth); su generalización a otros materiales no está documentada.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni tareas conversacionales.
- No se han publicado métricas de rendimiento en la información disponible, por lo que no es posible evaluar su precisión de forma independiente a partir de estos datos.
- Los sesgos y el riesgo de alucinación no están documentados; en modelos de dinámica, el riesgo principal es la predicción inexacta de estados físicos, que puede afectar a la planificación.
- La licencia MIT permite uso comercial, pero se recomienda revisar las condiciones del código y del dataset asociados, que se distribuyen por separado.
- Para producción en robótica, es necesario validar el modelo en el entorno físico concreto, ya que el rendimiento depende de la representación en grafo y de la configuración del pipeline.

## Enlaces

- Hugging Face (checkpoints): https://huggingface.co/boeyyyy/AdaptiGraph
- Dataset de entrenamiento: https://huggingface.co/datasets/boeyyyy/AdaptiGraph-data
- Repositorio de código: https://github.com/Boey-li/AdaptiGraph
- README del repositorio: https://github.com/Boey-li/AdaptiGraph/blob/main/README.md
- Página del proyecto: https://robopil.github.io/adaptigraph/
