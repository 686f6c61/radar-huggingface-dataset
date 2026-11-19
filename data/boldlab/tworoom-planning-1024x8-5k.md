# boldlab/tworoom-planning-1024x8-5k

## Resumen

TwoRoom C5 es un checkpoint final de un modelo del mundo (world model) entrenado para el entorno sintetico TwoRoom, desarrollado por el usuario boldlab sobre el modelo base `quentinll/lewm-tworooms`. No es un modelo de lenguaje: se trata de un world model orientado a planificacion, es decir, un modelo que aprende la dinamica del entorno y se utiliza para evaluar trayectorias de acciones mediante planificacion tipo CEM (Cross-Entropy Method). El checkpoint corresponde al paso 5.000 de un entrenamiento con 1.024 candidatos CEM y 8 iteraciones por actualizacion.

El modelo se distribuye a traves de la libreria `stable-worldmodel` y esta etiquetado con las categorias `world-model`, `evolving-wm`, `tworoom` y `planning`. Su relevancia es acotada: sirve como artefacto de investigacion reproducible para estudiar el efecto del presupuesto de planificacion durante el entrenamiento de world models, no como un modelo de proposito general. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

La informacion publica disponible es muy limitada: no se declaran licencia, idiomas ni pipeline, y la model card se limita a documentar hiperparametros del entrenamiento y enlaces a los runs de Weights & Biases. Cualquier dato sobre arquitectura interna, numero de parametros o rendimiento en benchmarks no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world model para el entorno TwoRoom; detalles en `config.json`, no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `weights.pt` (state dict de PyTorch), acompanado de `config.json`, `planner_config.json` y `provenance.json` |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. Se sabe que deriva de `quentinll/lewm-tworooms`, un world model para el entorno TwoRoom, y que se enmarca en el proyecto `evolving-wm` (commit fuente `8bdcb97`). El checkpoint final corresponde al paso 5.000 de entrenamiento, tras 5.000 actualizaciones EGGROLL, con un tamano de chunk de acciones de 5.

El entrenamiento utilizo una poblacion de 1.024 candidatos CEM con 8 iteraciones por actualizacion, distribuido en 8 GPUs por ejecucion. Se empleo un conjunto fijo de 10.000 tareas de entrenamiento y 1.000 de validacion, con tasa de aprendizaje 0,004114155739091268, sigma 0,002174092466593994 y semilla 3072. El autor advierte que se trata de checkpoints de una unica semilla de entrenamiento: los resultados de evaluacion con distintas semillas del planificador no cuantifican la variabilidad entre semillas de entrenamiento. No se dispone de informacion sobre composicion del dataset, tokens de entrenamiento ni uso de RLHF/DPO, que en cualquier caso no aplican a este tipo de modelo.

## Capacidades

- Aprendizaje de la dinamica del entorno TwoRoom para evaluar trayectorias de acciones.
- Planificacion basada en CEM con presupuesto configurable (entrenado con 1.024 candidatos y 8 iteraciones).
- Evaluacion de politicas o agentes en tareas del entorno TwoRoom (10.000 tareas de entrenamiento, 1.000 de validacion).
- Reproducibilidad experimental mediante `provenance.json`, `config.json` y `planner_config.json`.
- Ajuste independiente de la configuracion del planificador en evaluacion respecto a la usada en entrenamiento.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni multilingues.

## Casos de uso

- Investigacion en world models: usar el checkpoint como referencia para estudiar el efecto del presupuesto de planificacion (1.024 candidatos x 8 iteraciones) sobre el rendimiento en TwoRoom, comparando con checkpoints entrenados con presupuestos menores.
- Reproduccion de experimentos: cargar `weights.pt` junto con `provenance.json` y `config.json` para replicar el run de entrenamiento documentado en Weights & Biases.
- Evaluacion de planificadores: sustituir la configuracion del planificador en evaluacion (`planner_config.json`) por alternativas y medir el impacto en las 1.000 tareas de validacion.
- Baseline en estudios de escalado de computo: emplear el checkpoint como punto de comparacion fijo al variar poblacion CEM, iteraciones o numero de GPUs en nuevos entrenamientos.
- Docencia y divulgacion: ilustrar el flujo completo de entrenamiento y evaluacion de un world model en un entorno sintetico controlado como TwoRoom.
- Analisis de variabilidad: combinar este checkpoint con otros de semillas distintas para estimar la dispersion entre semillas de entrenamiento, algo que el autor senala como no cubierto por la evaluacion actual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, lo que sugiere un modelo de pequeno tamano, pero no se confirma el numero de parametros ni el consumo real.
- GPU recomendadas: no disponible. El entrenamiento se realizo en 8 GPUs, sin especificar modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante la libreria `stable-worldmodel` y el state dict `weights.pt`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| boldlab/tworoom-planning-1024x8-5k | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| quentinll/lewm-tworooms (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otros checkpoints de evolving-wm | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La unica comparacion posible con la informacion disponible es frente al modelo base `quentinll/lewm-tworooms`, del que este checkpoint es un fine-tuning. No se dispone de datos de parametros, contexto ni rendimiento de ninguno de los dos.

## Limitaciones y advertencias

- Entrenado exclusivamente para el entorno sintetico TwoRoom; no generaliza a otros dominios sin reentrenamiento.
- Checkpoint de una unica semilla de entrenamiento (semilla 3072); la variabilidad entre semillas de entrenamiento no esta cuantificada.
- No es un modelo de lenguaje ni un modelo multimodal: no admite prompts de texto ni genera respuestas en lenguaje natural.
- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma porque no aplican al tipo de modelo, pero tampoco se aportan metricas de error en la dinamica aprendida.
- Ausencia de benchmarks publicados: no es posible validar el rendimiento frente a alternativas sin ejecutar la evaluacion.
- El repositorio no registra descargas ni likes, lo que limita la evidencia externa sobre su calidad o mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/boldlab/tworoom-planning-1024x8-5k
- Modelo base: https://huggingface.co/quentinll/lewm-tworooms
- Repositorio del proyecto evolving-wm: https://github.com/fracapuano/evolving-wm
- Run de entrenamiento en Weights & Biases: https://wandb.ai/francescocapuano/evolving-wm/runs/opjmljzo
- Sweep del presupuesto de planificacion: https://wandb.ai/francescocapuano/evolving-wm/sweeps/uwp4wk77
