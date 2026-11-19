# boldlab/tworoom-planning-128x4-5k

## Resumen

TwoRoom C5 (128x4) es un checkpoint de modelo del mundo (world model) entrenado por boldlab sobre el modelo base `quentinll/lewm-tworooms`. Se trata de un modelo de planificación en el entorno sintético TwoRoom, un escenario de navegación en dos habitaciones conectadas que se usa habitualmente como banco de pruebas para evaluar modelos del mundo y algoritmos de planificación basados en búsqueda. El modelo no es un LLM: no genera texto ni código, sino que predice la evolución de estados latentes en un entorno de control a partir de acciones.

El checkpoint corresponde al estado final tras 5.000 actualizaciones EGGROLL, con un presupuesto de planificación CEM de 128 candidatos por 4 iteraciones durante el entrenamiento. El entrenamiento se realizó con una población de 1.024 sobre 8 GPUs, usando un conjunto fijo de 10.000 tareas de entrenamiento y 1.000 de validación. El tamaño del repositorio es de 0,1 GB y los pesos se distribuyen en formato `weights.pt` (PyTorch), acompañados de `config.json`, `planner_config.json` y `provenance.json`.

Su relevancia es acotada y experimental: sirve como artefacto reproducible de un estudio sobre el efecto del presupuesto de planificación en el entrenamiento de modelos del mundo evolutivos (proyecto `evolving-wm`). No está pensado para uso en producción ni para tareas generales, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo del mundo sobre base `quentinll/lewm-tworooms`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`weights.pt`), con `config.json` y `planner_config.json` |

## Arquitectura y entrenamiento

El modelo se construye como un fine-tune del world model `quentinll/lewm-tworooms`, orientado al entorno TwoRoom. La información disponible no detalla la arquitectura interna del modelo base (tipo de encoder, dimensión latente o mecanismo de transición), por lo que no es posible describirla con rigor. El checkpoint se entrena con el algoritmo EGGROLL, un método evolutivo de optimización de poblaciones, durante 5.000 actualizaciones con una población de 1.024 individuos repartidos en 8 GPUs. El tamaño de chunk de acción es 5.

El aspecto técnico diferencial es el presupuesto de planificación durante el entrenamiento: se emplea CEM (Cross-Entropy Method) con 128 candidatos y 4 iteraciones por paso. Los hiperparámetros registrados incluyen learning rate 0,004114155739091268, sigma 0,002174092466593994 y semilla 3072. El entrenamiento usa un conjunto fijo de 10.000 tareas y 1.000 de validación, y el código fuente corresponde al commit `8bdcb97` del repositorio `evolving-wm`. No se documenta composición de datos, número de tokens ni uso de RLHF/DPO, lo cual es esperable al no tratarse de un modelo lingüístico.

## Capacidades

- Predicción de la dinámica de estados en el entorno TwoRoom (modelo del mundo).
- Planificación de acciones mediante CEM con presupuesto configurable (128 candidatos x 4 iteraciones en entrenamiento).
- Evaluación con planificadores alternativos, ya que `planner_config.json` registra el planificador de entrenamiento pero los ajustes de evaluación pueden cambiarse de forma independiente.
- Reproducibilidad experimental: incluye `provenance.json` y protocolos de tareas.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso textual ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en modelos del mundo: servir como checkpoint de referencia para estudiar cómo el presupuesto de planificación CEM durante el entrenamiento afecta al rendimiento en TwoRoom.
- Reproducción de experimentos: el commit fuente, los hiperparámetros y `provenance.json` permiten replicar el entrenamiento y comparar con otras configuraciones del barrido publicado en W&B.
- Ablaciones de planificación en evaluación: al poder modificar independientemente los ajustes del planificador en evaluación, se puede medir la sensibilidad del modelo a distintos presupuestos de CEM sin reentrenar.
- Estudio de algoritmos evolutivos: útil para analizar el comportamiento de EGGROLL con poblaciones de 1.024 individuos en un entorno de control de baja dimensión.
- Docencia y prototipado en entornos sintéticos: TwoRoom es un banco de pruebas ligero (0,1 GB) adecuado para experimentos académicos de planificación.
- Comparación de checkpoints: permite contrastar el efecto de 5.000 actualizaciones frente a estados intermedios del mismo entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que es probable que quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 8 GPUs, sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la librería declarada es `stable-worldmodel` y los pesos son un state dict de PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entorno | Licencia | Notas |
|---|---|---|---|---|---|
| boldlab/tworoom-planning-128x4-5k | no disponible | no disponible | TwoRoom | no disponible | 5.000 updates EGGROLL, CEM 128x4 |
| quentinll/lewm-tworooms | no disponible | no disponible | TwoRoom | no disponible | Modelo base del que deriva este checkpoint |
| Otros checkpoints de `evolving-wm` | no disponible | no disponible | TwoRoom | no disponible | Distintos presupuestos de planificación y semillas |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Checkpoint de una sola semilla de entrenamiento: los resultados de evaluación con distintas semillas del planificador no cuantifican la variabilidad entre semillas de entrenamiento, tal como advierte el autor.
- Específico del entorno TwoRoom: no generaliza a otros dominios ni a tareas lingüísticas.
- No es un LLM: no debe emplearse para generación de texto, código, atención al cliente ni aplicaciones de lenguaje.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Riesgo de sobreajuste al conjunto fijo de 10.000 tareas de entrenamiento; la validación se limita a 1.000 tareas del mismo protocolo.
- Ausencia de documentación sobre sesgos, alucinación o limitaciones de contexto, al no aplicar las categorías habituales de los modelos generativos.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni señales de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/boldlab/tworoom-planning-128x4-5k
- Modelo base: https://huggingface.co/quentinll/lewm-tworooms
- Repositorio de código: https://github.com/fracapuano/evolving-wm (commit `8bdcb97`)
- Run de entrenamiento en W&B: https://wandb.ai/francescocapuano/evolving-wm/runs/j63dhw5j
- Barrido de presupuesto de planificación: https://wandb.ai/francescocapuano/evolving-wm/sweeps/uwp4wk77
