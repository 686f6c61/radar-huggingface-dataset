# boldlab/tworoom-planning-256x5-5k

## Resumen

TwoRoom C5 es un checkpoint de modelo del mundo (world model) desarrollado por boldlab, afinado a partir del modelo base `quentinll/lewm-tworooms`. No es un modelo de lenguaje: se trata de un world model orientado a planificación en el entorno sintético TwoRoom, un escenario de navegación bidimensional típico en la investigación de modelos del mundo y aprendizaje por refuerzo basado en modelo. El modelo aprende la dinámica del entorno y se emplea para planificar acciones mediante el método CEM (Cross-Entropy Method).

El checkpoint corresponde al estado final tras 5.000 actualizaciones EGGROLL, entrenado con un presupuesto de planificación de 256 candidatos CEM por 5 iteraciones. Forma parte de la familia de experimentos `evolving-wm`, que estudia la evolución y el escalado de world models. El tamaño del repositorio es de 0,1 GB, coherente con un modelo compacto de investigación y no con un LLM de gran escala.

Su relevancia es acotada y experimental: sirve como referencia reproducible para estudiar cómo el presupuesto de planificación durante el entrenamiento afecta al rendimiento de un world model en tareas de planificación. No está pensado para uso en producción ni para tareas de lenguaje, visión general o generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model (familia LeWM / evolving-wm); detalles internos en `config.json`, no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`weights.pt`), mas `config.json`, `planner_config.json` y `provenance.json` |

## Arquitectura y entrenamiento

El modelo se basa en `quentinll/lewm-tworooms`, un world model de la familia LeWM entrenado sobre el entorno TwoRoom. El checkpoint ha sido afinado con el framework `evolving-wm` (commit fuente `8bdcb97`), que aborda el entrenamiento y la evolución de world models. La arquitectura concreta (tipo de red, dimensiones de capas, tamaño de representación latente) está descrita en el fichero `config.json` del repositorio, pero no se detalla en la información disponible.

El entrenamiento consistió en 5.000 actualizaciones EGGROLL con un presupuesto de planificación interno de 256 candidatos CEM y 5 iteraciones por paso. Se usó una población de 1.024 y 8 GPUs por ejecución. El conjunto de tareas fue fijo y de gran tamaño: 10.000 tareas de entrenamiento y 1.000 de validación. Hiperparámetros registrados: learning rate 0,004114155739091268, sigma 0,002174092466593994 y semilla 3072. El tamaño de chunk de acción es 5. El planner de entrenamiento queda registrado en `planner_config.json` y puede modificarse de forma independiente en evaluación. Se trata de un único checkpoint de una sola semilla de entrenamiento.

## Capacidades

- Modelado de la dinámica del entorno TwoRoom: predicción de transiciones y estados futuros a partir de acciones.
- Planificación de acciones mediante CEM con presupuesto configurable (entrenado con 256 candidatos × 5 iteraciones).
- Soporte de chunks de acción de tamaño 5.
- Evaluación reproducible mediante protocolos de tarea y `provenance.json`.
- No soporta generación de texto, código, matemáticas, visión general, tool calling, agentes conversacionales ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Investigación en world models: reproducir el experimento de presupuesto de planificación (256×5) y compararlo con otras configuraciones del barrido publicado en Weights & Biases.
- Estudio del efecto del presupuesto CEM: usar el checkpoint como referencia fija para aislar cómo varía el rendimiento al cambiar los parámetros del planner en evaluación.
- Planificación basada en modelo en entornos grid: emplear el modelo para generar trayectorias en TwoRoom y evaluar la calidad de la planificación.
- Baseline en experimentos de evolución de world models: punto de comparación para variantes entrenadas con `evolving-wm`.
- Reproducción de resultados: validar los protocolos de tarea y las métricas con las 1.000 tareas de validación fijas.
- Docencia y divulgación: ejemplo compacto (0,1 GB) de pipeline completo de entrenamiento y planificación de un world model en un entorno sintético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio pesa 0,1 GB, lo que sugiere un modelo compacto que probablemente cabe en GPUs de consumo, aunque no se confirma en la información proporcionada.
- GPU recomendadas: el entrenamiento usó 8 GPUs por ejecución; el modelo concreto no se especifica.
- GPU de consumo: no confirmado; por tamaño del checkpoint es plausible, pero no disponible.
- Opciones de despliegue: carga como state dict de PyTorch mediante el framework `evolving-wm` / `stable-worldmodel`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| boldlab/tworoom-planning-256x5-5k | World model TwoRoom | no disponible | no disponible | no disponible | Checkpoint 5k updates, CEM 256×5 |
| quentinll/lewm-tworooms | World model TwoRoom (base) | no disponible | no disponible | no disponible | Modelo base del que deriva este checkpoint |
| Otras variantes de `evolving-wm` | World models | no disponible | no disponible | no disponible | Barrido de presupuesto de planificación publicado en W&B |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado exclusivamente en el entorno sintético TwoRoom; no generaliza a otros dominios ni tareas.
- Checkpoint de una sola semilla de entrenamiento: los resultados en evaluación no cuantifican la variabilidad entre semillas de entrenamiento, tal como advierte el autor.
- No es un modelo de lenguaje ni multimodal general; no debe usarse para generación de texto, código o visión.
- Licencia no especificada: verificar condiciones antes de cualquier uso, incluido el comercial.
- Sin resultados de benchmarks publicados; el rendimiento real no está cuantificado en la información disponible.
- Riesgo de sobreajuste al conjunto fijo de 10.000 tareas de entrenamiento; validar siempre sobre las 1.000 tareas de validación del protocolo.
- No apto para producción: es un artefacto de investigación.

## Enlaces

- Hugging Face: https://huggingface.co/boldlab/tworoom-planning-256x5-5k
- Modelo base: https://huggingface.co/quentinll/lewm-tworooms
- Repositorio `evolving-wm`: https://github.com/fracapuano/evolving-wm
- Training run (W&B): https://wandb.ai/francescocapuano/evolving-wm/runs/v0nol77v
- Planning-budget sweep (W&B): https://wandb.ai/francescocapuano/evolving-wm/sweeps/uwp4wk77
