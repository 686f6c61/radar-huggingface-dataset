# boldlab/tworoom-planning-64x4-5k

## Resumen

TwoRoom C5 es un checkpoint de modelo del mundo (world model) orientado a planificación, desarrollado por el usuario boldlab y publicado en Hugging Face. Se trata de un ajuste fino del modelo base `quentinll/lewm-tworooms`, que a su vez pertenece a la familia de modelos LeWM (Latent/Evolutionary World Models) entrenados sobre el entorno TwoRoom. El modelo no es un modelo de lenguaje: es un world model que aprende la dinámica de un entorno bidimensional de dos habitaciones y se utiliza para planificar acciones mediante el método CEM (Cross-Entropy Method).

El checkpoint corresponde al estado final tras 5.000 actualizaciones EGGROLL, con un presupuesto de planificación durante el entrenamiento de 64 candidatos CEM por 4 iteraciones. El entrenamiento se realizó sobre una suite fija de 10.000 tareas de entrenamiento y 1.000 de validación, con una población de 1.024 y 8 GPU por ejecución. El tamaño del repositorio es de 0,1 GB, lo que refleja que se trata de un modelo pequeño de investigación, no de un modelo de producción a gran escala.

Su relevancia es acotada y experimental: sirve como artefacto reproducible para estudiar cómo el presupuesto de planificación (número de candidatos e iteraciones CEM) afecta al aprendizaje de un world model en un entorno controlado. No está pensado para aplicaciones de lenguaje, visión general ni despliegue comercial, y la información pública disponible es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model (familia LeWM, `quentinll/lewm-tworooms`); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `weights.pt` (PyTorch state dict) y `config.json`; `planner_config.json` para el planificador |

## Arquitectura y entrenamiento

El modelo se basa en `quentinll/lewm-tworooms`, un world model de la familia LeWM entrenado sobre el entorno TwoRoom. El checkpoint publicado es el resultado de un ajuste fino con 5.000 actualizaciones del algoritmo EGGROLL, un método evolutivo (población de 1.024 individuos, 8 GPU por ejecución). Durante el entrenamiento se empleó un planificador CEM con 64 candidatos y 4 iteraciones, y un tamaño de chunk de acción de 5. Los hiperparámetros registrados incluyen learning rate 0,004114155739091268, sigma 0,002174092466593994 y semilla 3072.

El entrenamiento utilizó una suite fija de 10.000 tareas de entrenamiento y 1.000 de validación. El código fuente corresponde al commit `8bdcb97` del repositorio `evolving-wm`. No se dispone de información sobre la composición del dataset, el número de tokens (no aplica en el sentido de LLM) ni sobre el uso de RLHF/DPO, que no se menciona. La innovación técnica destacable es el barrido del presupuesto de planificación (planning-budget sweep) documentado en Weights & Biases, que permite analizar el efecto del número de candidatos e iteraciones CEM sobre el rendimiento del world model.

## Capacidades

- Modelado de la dinámica del entorno TwoRoom (transiciones de estado latente en un espacio de dos habitaciones).
- Planificación de acciones mediante CEM con presupuesto configurable (candidatos e iteraciones).
- Evaluación reproducible sobre tareas de validación del entorno TwoRoom.
- Ajuste fino evolutivo (EGGROLL) sobre un world model preentrenado.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en world models: servir como checkpoint de referencia para reproducir el experimento de presupuesto de planificación 64×4 y comparar con otras configuraciones del barrido.
- Estudio del efecto del presupuesto CEM: analizar cómo 64 candidatos × 4 iteraciones afecta a la calidad de planificación frente a presupuestos menores o mayores.
- Reproducibilidad de experimentos evolutivos: el `provenance.json` y los protocolos de tareas permiten replicar el entrenamiento con la misma semilla y suite fija.
- Evaluación de planificadores alternativos: dado que el planificador de evaluación puede cambiarse de forma independiente, el checkpoint sirve para probar distintos planificadores sobre el mismo world model.
- Docencia y divulgación: ejemplo compacto (0,1 GB) de un pipeline completo de world model con planificación CEM, adecuado para entornos con recursos limitados.
- Baseline en entornos TwoRoom: punto de partida para comparar nuevas variantes de world models o de algoritmos evolutivos en el mismo benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere que el modelo es pequeño y probablemente cabe en GPU de consumo, pero no se confirma.
- GPU recomendadas: no disponible. El entrenamiento usó 8 GPU por ejecución, sin especificar modelo.
- ¿Cabe en consumer GPU?: probablemente sí por el tamaño del repo, pero no confirmado.
- Opciones de despliegue: librería `stable-worldmodel`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| boldlab/tworoom-planning-64x4-5k | no disponible | no disponible | TwoRoom | no disponible | Hugging Face |
| quentinll/lewm-tworooms (base) | no disponible | no disponible | TwoRoom | no disponible | Hugging Face |
| Otras variantes de evolving-wm | no disponible | no disponible | TwoRoom | no disponible | Repositorio `evolving-wm` |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de una sola semilla de entrenamiento: los resultados de evaluación entre semillas del planificador no cuantifican la variabilidad entre semillas de entrenamiento (advertencia explícita del autor).
- Modelo de investigación acotado al entorno TwoRoom; no generaliza a otros dominios ni tareas.
- No es un modelo de lenguaje: no procesa texto libre ni mantiene conversaciones.
- Licencia no especificada: no se puede confirmar el uso comercial.
- Sin datos de benchmarks publicados, por lo que no se puede evaluar su rendimiento de forma objetiva.
- Riesgo de sobreajuste a la suite fija de 10.000 tareas de entrenamiento.
- No se documentan sesgos, pero al ser un world model sintético su relevancia ética es limitada.
- El formato `weights.pt` requiere cargar el state dict con la configuración adecuada; no es un formato estándar de despliegue como safetensors o GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/boldlab/tworoom-planning-64x4-5k
- Modelo base: https://huggingface.co/quentinll/lewm-tworooms
- Repositorio de código: https://github.com/fracapuano/evolving-wm (commit `8bdcb97`)
- Ejecución de entrenamiento (W&B): https://wandb.ai/francescocapuano/evolving-wm/runs/shw0x7m7
- Barrido de presupuesto de planificación (W&B): https://wandb.ai/francescocapuano/evolving-wm/sweeps/uwp4wk77
