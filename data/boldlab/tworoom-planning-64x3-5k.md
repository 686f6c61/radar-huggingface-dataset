# boldlab/tworoom-planning-64x3-5k

## Resumen

`boldlab/tworoom-planning-64x3-5k` es un checkpoint de un modelo del mundo (world model) orientado a planificación, desarrollado por el grupo boldlab y publicado bajo el ecosistema `stable-worldmodel`. Se trata de un ajuste fino (finetune) del modelo base `quentinll/lewm-tworooms`, especializado en el entorno sintético TwoRoom, un escenario de navegación en dos habitaciones que se usa habitualmente como banco de pruebas para algoritmos de planificación basados en modelos.

El modelo no es un modelo de lenguaje: es un modelo del mundo que predice la evolución del estado de un entorno a partir de acciones, y que se emplea junto con un planificador de tipo CEM (Cross-Entropy Method) para seleccionar secuencias de acciones. El checkpoint corresponde al estado final tras 5.000 actualizaciones EGGROLL, entrenado con un presupuesto de planificación de 64 candidatos CEM por 3 iteraciones.

Su relevancia es fundamentalmente metodológica: documenta de forma reproducible un experimento de barrido de presupuesto de planificación, con configuración, semilla, commit de origen y enlaces a los registros de Weights & Biases. El repositorio ocupa 0,1 GB y contiene los pesos en formato `weights.pt`, además de `config.json`, `planner_config.json` y `provenance.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo (world model) sobre base `quentinll/lewm-tworooms`; arquitectura concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `weights.pt` (PyTorch state dict); configuracion en `config.json` y `planner_config.json` |
| Libreria | `stable-worldmodel` |
| Modelo base | `quentinll/lewm-tworooms` |
| Tamano del repositorio | 0,1 GB |
| Entorno | TwoRoom |
| Action chunk size | 5 |
| Actualizaciones de entrenamiento | 5.000 (EGGROLL) |
| Presupuesto de planificacion en entrenamiento | 64 candidatos CEM × 3 iteraciones |
| Poblacion | 1.024 |
| GPUs por ejecucion | 8 |
| Tareas de entrenamiento | 10.000 |
| Tareas de validacion | 1.000 |
| Learning rate | 0,004114155739091268 |
| Sigma | 0,002174092466593994 |
| Semilla | 3072 |
| Commit de origen | `8bdcb97` en `evolving-wm` |

## Arquitectura y entrenamiento

El modelo se construye como un ajuste fino del world model `quentinll/lewm-tworooms`, que actúa como base. La model card no detalla la arquitectura interna (tipo de transformer, dimensiones de las capas, mecanismo de atención o integración temporal), por lo que ese dato debe consultarse en el `config.json` del repositorio o en el modelo base. El entrenamiento se realiza con el algoritmo EGGROLL, un método de optimización evolutiva (población de 1.024 individuos, 8 GPUs por ejecución) que en este caso se ejecuta durante 5.000 actualizaciones.

El experimento concreto mide el efecto del presupuesto de planificación durante el entrenamiento: cada evaluación interna usa 64 candidatos CEM y 3 iteraciones del método Cross-Entropy. El conjunto de tareas es fijo y de gran tamaño (10.000 tareas de entrenamiento y 1.000 de validación), con hiperparámetros documentados (learning rate ≈ 0,00411, sigma ≈ 0,00217, semilla 3072) y un tamaño de chunk de acciones de 5. La model card advierte explícitamente de que se trata de un único checkpoint por semilla de entrenamiento, de modo que los resultados de evaluación entre semillas del planificador no cuantifican la variabilidad entre semillas de entrenamiento.

## Capacidades

- Predicción de la dinámica del entorno TwoRoom a partir de secuencias de acciones (modelo del mundo).
- Soporte de planificación con CEM (Cross-Entropy Method) mediante el planificador configurable en `planner_config.json`.
- Evaluación con presupuestos de planificación independientes del usado en entrenamiento (los ajustes del planificador de evaluación pueden cambiarse por separado).
- Procesamiento de acciones en chunks de tamaño 5.
- Reproducibilidad del experimento mediante protocolos de tareas y `provenance.json`.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, visión, tool calling ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en planificación basada en modelos: el checkpoint sirve para reproducir el experimento de barrido de presupuesto CEM (64×3) y comparar con otras configuraciones del mismo barrido publicado en Weights & Biases.
- Estudio de optimización evolutiva: permite analizar el efecto de EGGROLL con población 1.024 y 5.000 actualizaciones sobre un world model preentrenado, usando la configuración exacta documentada.
- Línea base reproducible en el entorno TwoRoom: al fijar semilla (3072), learning rate, sigma y conjunto de tareas, se puede emplear como referencia en experimentos posteriores.
- Evaluación de robustez del planificador: como los ajustes del planificador de evaluación son independientes, el checkpoint permite medir cómo varía el rendimiento al cambiar candidatos e iteraciones sin reentrenar.
- Docencia y divulgación sobre world models: el tamaño reducido del repositorio (0,1 GB) y la provenance detallada lo hacen adecuado para demostraciones de planificación en entornos sintéticos.
- Auditoría de metodología: los enlaces a la ejecución de entrenamiento y al barrido permiten verificar curvas de aprendizaje y comparar el coste computacional (8 GPUs) frente al rendimiento obtenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia los registros de Weights & Biases de la ejecución de entrenamiento y del barrido de presupuesto de planificación, sin incluir cifras de rendimiento en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo pequeño, pero no se especifican parámetros ni precisión).
- GPU recomendadas: no disponible para inferencia; el entrenamiento documentado usó 8 GPUs por ejecución, sin especificar el modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del checkpoint (0,1 GB) es plausible que quepa en GPU de consumo, pero no hay dato oficial.
- Opciones de despliegue: la librería declarada es `stable-worldmodel`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un world model).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `boldlab/tworoom-planning-64x3-5k` | World model + planificador CEM | TwoRoom | no disponible | no disponible | no disponible | Hugging Face |
| `quentinll/lewm-tworooms` | World model (base) | TwoRoom | no disponible | no disponible | no disponible | Hugging Face |
| Otros checkpoints del barrido `evolving-wm` | World model + planificador CEM | TwoRoom | no disponible | no disponible | no disponible | Weights & Biases / Hugging Face (no verificados) |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse en el entorno sintético TwoRoom, el modelo no generaliza a dominios reales fuera de ese escenario.
- Riesgo de alucinación: en un world model se traduce en predicciones de dinámica inexactas fuera de la distribución de tareas de entrenamiento; no se han publicado métricas de error.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto lingüístico; el alcance está restringido al protocolo de tareas TwoRoom y al chunk de acciones de tamaño 5.
- Restricciones de licencia: la licencia figura como no disponible, por lo que no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Un único checkpoint por semilla de entrenamiento: la model card advierte de que los resultados entre semillas del planificador no cuantifican la variabilidad entre semillas de entrenamiento.
- Reproducibilidad dependiente del commit `8bdcb97` del repositorio `evolving-wm` y de la librería `stable-worldmodel`; cambios en esas dependencias pueden alterar los resultados.
- Sin datos de benchmarks ni de latencia, no es posible estimar su idoneidad para producción sin una evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/boldlab/tworoom-planning-64x3-5k
- Modelo base: https://huggingface.co/quentinll/lewm-tworooms
- Repositorio de código: https://github.com/fracapuano/evolving-wm
- Ejecución de entrenamiento (W&B): https://wandb.ai/francescocapuano/evolving-wm/runs/r1sm1m3b
- Barrido de presupuesto de planificación (W&B): https://wandb.ai/francescocapuano/evolving-wm/sweeps/uwp4wk77
