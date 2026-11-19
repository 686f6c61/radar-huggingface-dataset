# boldlab/tworoom-planning-512x5-5k

## Resumen

El modelo `boldlab/tworoom-planning-512x5-5k` es un checkpoint de un modelo del mundo (world model) orientado a planificación, desarrollado por el usuario `boldlab` y publicado en Hugging Face. Se trata de un ajuste fino del modelo base `quentinll/lewm-tworooms`, entrenado con la librería `stable-worldmodel` y etiquetado como "evolving-wm". El entorno de trabajo es TwoRoom, un dominio de navegación en dos habitaciones utilizado habitualmente como banco de pruebas para agentes que aprenden modelos del entorno.

El checkpoint corresponde al estado final tras 5.000 actualizaciones del algoritmo EGGROLL, con un presupuesto de planificación durante el entrenamiento de 512 candidatos CEM y 5 iteraciones. El entrenamiento se realizó sobre una suite fija de 10.000 tareas de entrenamiento y 1.000 de validación, con una población de 1.024 y 8 GPUs por ejecución. El tamaño del repositorio (0,1 GB) sugiere un modelo compacto, coherente con un world model de laboratorio más que con un LLM de gran escala.

La relevancia de este checkpoint es acotada pero específica: sirve como referencia reproducible para experimentos de planificación con modelos del mundo en el entorno TwoRoom, e incluye configuración de arquitectura, configuración del planificador y metadatos de procedencia para replicar el experimento. No es un modelo de lenguaje generalista ni está pensado para tareas de NLP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (world model; `config.json` describe la arquitectura) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`weights.pt`, state dict del paso 5000) |

## Arquitectura y entrenamiento

El modelo es un world model entrenado mediante el algoritmo EGGROLL, un método de optimización de poblaciones (evolution strategies) según se desprende de los hiperparámetros publicados: población de 1.024 individuos, tasa de aprendizaje 0,004114155739091268, sigma 0,002174092466593994 y semilla 3072. El ajuste se realizó sobre el modelo base `quentinll/lewm-tworooms` con un tamaño de chunk de acciones de 5, y el checkpoint final corresponde a 5.000 actualizaciones. La configuración arquitectónica concreta se documenta en el `config.json` del repositorio, no en la model card.

El entrenamiento utilizó una suite fija de 10.000 tareas de entrenamiento y 1.000 de validación, con un presupuesto de planificación CEM de 512 candidatos por 5 iteraciones durante el propio entrenamiento. El planificador empleado en entrenamiento queda registrado en `planner_config.json`, mientras que los ajustes del planificador en evaluación pueden modificarse de forma independiente. El código fuente corresponde al commit `8bdcb97` del repositorio `evolving-wm`. Se trata de checkpoints de una única semilla de entrenamiento, por lo que los resultados de evaluación entre semillas del planificador no cuantifican la variabilidad entre semillas de entrenamiento.

## Capacidades

- Modelado del entorno TwoRoom: predice la dinámica del entorno a partir de acciones, base para la planificación.
- Planificación basada en CEM (Cross-Entropy Method) con presupuesto configurable de candidatos e iteraciones.
- Soporte de evaluación con planificadores alternativos, independientes del planificador usado en entrenamiento.
- Reproducibilidad: incluye `config.json`, `planner_config.json`, `provenance.json` y protocolos de tareas.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes multi-paso ni multilingüismo.

## Casos de uso

- Investigación en planificación con world models: el checkpoint sirve como punto de partida reproducible para comparar presupuestos de planificación (por ejemplo, 512×5 frente a otras configuraciones) en el entorno TwoRoom.
- Reproducción de experimentos: los metadatos de procedencia y los protocolos de tareas permiten replicar el entrenamiento y la evaluación descritos en la model card.
- Estudio de optimización por poblaciones: los hiperparámetros publicados (población 1.024, sigma, learning rate) permiten analizar la sensibilidad de EGGROLL en dominios de control de bajo dimensionalidad.
- Evaluación de planificadores alternativos: al poder cambiar los ajustes del planificador en evaluación de forma independiente, se puede medir el impacto del planificador sin reentrenar el modelo.
- Línea base para ajuste fino: al derivar de `quentinll/lewm-tworooms`, puede emplearse como inicialización para nuevos ajustes en TwoRoom con distintos presupuestos de cómputo.
- Docencia y experimentación en entornos simulados: su tamaño reducido (0,1 GB) facilita el despliegue en laboratorios con recursos limitados para prácticas sobre world models.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere que el modelo es pequeño y probablemente quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 8 GPUs por ejecución, sin especificar el modelo.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la librería indicada es `stable-worldmodel`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `boldlab/tworoom-planning-512x5-5k` | no disponible | no disponible | TwoRoom | no disponible | Hugging Face |
| `quentinll/lewm-tworooms` (base) | no disponible | no disponible | TwoRoom | no disponible | Hugging Face |
| Otros checkpoints de `evolving-wm` | no disponible | no disponible | TwoRoom | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de una única semilla de entrenamiento: la variabilidad entre semillas de entrenamiento no está cuantificada.
- Los resultados de evaluación entre semillas del planificador no sustituyen a un análisis de robustez del entrenamiento.
- Modelo específico del entorno TwoRoom; no es un modelo de lenguaje y no debe emplearse para tareas de NLP.
- Licencia no especificada: no se puede confirmar el uso comercial.
- Sin datos publicados de benchmarks, por lo que no es posible evaluar su rendimiento frente a alternativas.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas; estos conceptos no aplican de forma directa a un world model de laboratorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/boldlab/tworoom-planning-512x5-5k
- Modelo base: https://huggingface.co/quentinll/lewm-tworooms
- Repositorio de código (commit `8bdcb97`): https://github.com/fracapuano/evolving-wm
- Ejecución de entrenamiento en W&B: https://wandb.ai/francescocapuano/evolving-wm/runs/3mq03sty
- Barrido del presupuesto de planificación en W&B: https://wandb.ai/francescocapuano/evolving-wm/sweeps/uwp4wk77
