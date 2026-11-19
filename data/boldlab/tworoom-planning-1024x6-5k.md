# boldlab/tworoom-planning-1024x6-5k

## Resumen

TwoRoom C5 es un checkpoint de modelo del mundo (world model) entrenado por boldlab sobre el modelo base `quentinll/lewm-tworooms`. Se trata de un modelo de planificación en el entorno sintético TwoRoom, un dominio de investigación habitual para evaluar agentes que deben navegar entre dos estancias conectadas. El modelo no es un LLM generativo de texto, sino un world model latente que predice la evolución del entorno y se emplea junto con un planificador basado en el método CEM (Cross-Entropy Method) para seleccionar acciones.

El checkpoint corresponde al estado final tras 5.000 actualizaciones EGGROLL, con un presupuesto de planificación durante el entrenamiento de 1.024 candidatos CEM por 6 iteraciones. Se entrenó sobre una suite fija de 10.000 tareas de entrenamiento y 1.000 de validación, con un tamaño de chunk de acciones de 5. El repositorio ocupa 0,1 GB y se distribuye en formato `weights.pt` (PyTorch state dict) junto con `config.json`, `planner_config.json` y `provenance.json`.

Su relevancia es acotada: es un artefacto de investigación reproducible, no un modelo de propósito general. Resulta útil para quienes trabajan en world models, planificación basada en modelos y evaluación de agentes en entornos controlados, y sirve como punto de partida para reproducir o extender los experimentos del proyecto `evolving-wm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model latente (no disponible el detalle exacto; descrito en `config.json` del repo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (chunk de acciones de 5) |
| Tipos de cuantizacion | no disponible (pesos en `weights.pt`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (modelo de entorno, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`weights.pt`) |

## Arquitectura y entrenamiento

El modelo parte de `quentinll/lewm-tworooms` y se afina mediante EGGROLL, un procedimiento de optimización evolutiva (evolution strategies) aplicado a los parámetros del world model. No se trata de un ajuste supervisado clásico ni de RLHF: la señal de entrenamiento proviene de la evaluación de políticas de planificación con CEM dentro del entorno TwoRoom. El checkpoint final corresponde al paso 5.000, con hiperparámetros documentados: learning rate 0,004114155739091268, sigma 0,002174092466593994 y semilla 3072.

El entrenamiento se ejecutó con 8 GPUs por ejecución y una población de 1.024 candidatos, con 6 iteraciones CEM por actualización. El chunk de acciones es de 5, lo que condiciona la granularidad temporal de la planificación. La suite de evaluación es fija (10.000 tareas de entrenamiento, 1.000 de validación), lo que facilita la comparación entre checkpoints. El código fuente corresponde al commit `8bdcb97` del repositorio `fracapuano/evolving-wm`.

## Capacidades

- Predicción de la dinámica del entorno TwoRoom en espacio latente.
- Planificación de acciones mediante CEM con presupuesto configurable (1.024 candidatos × 6 iteraciones en entrenamiento).
- Soporte de chunks de acción de tamaño 5 para planificación multi-paso.
- Evaluación reproducible sobre una suite fija de tareas de validación.
- Integración con la librería `stable-worldmodel`.
- No soporta generación de texto, código, visión, tool calling ni agentes conversacionales.

## Casos de uso

- Investigación en world models: sirve como checkpoint de referencia para estudiar el efecto del presupuesto de planificación CEM durante el entrenamiento sobre el rendimiento final del modelo.
- Reproducción de experimentos: junto con `provenance.json` y los enlaces a W&B, permite replicar la ejecución con semilla 3072 y comparar contra otros checkpoints del sweep.
- Evaluación de planificadores: al poder modificarse independientemente los ajustes del planificador en evaluación, se puede medir la sensibilidad del modelo a distintos presupuestos CEM sin reentrenar.
- Estudio de optimización evolutiva: útil para analizar la estabilidad de EGGROLL con poblaciones grandes (1.024) y 8 GPUs.
- Baseline en entornos TwoRoom: punto de comparación para nuevos métodos de planificación basada en modelos en dominios de navegación sintéticos.
- Docencia y prototipado: el tamaño reducido del repo (0,1 GB) facilita su uso en entornos con recursos limitados para demostrar planificación con world models.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente enlaza a ejecuciones y sweeps de W&B, sin tablas de métricas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo pesa 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no disponible; el entrenamiento usó 8 GPUs por ejecución, pero no se especifica el modelo.
- Compatibilidad con GPU consumer: probable por el tamaño del checkpoint, aunque no confirmado en la documentación.
- Opciones de despliegue: carga directa del state dict con PyTorch y la librería `stable-worldmodel`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| boldlab/tworoom-planning-1024x6-5k | no disponible | no disponible | no disponible | Hugging Face |
| quentinll/lewm-tworooms (base) | no disponible | no disponible | no disponible | Hugging Face |
| Otros checkpoints del sweep evolving-wm | no disponible | no disponible | no disponible | W&B / repo |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de una sola semilla de entrenamiento; los resultados entre semillas del planificador no cuantifican la variabilidad entre semillas de entrenamiento, según advierte el autor.
- Dominio restringido al entorno sintético TwoRoom; no generaliza a tareas del mundo real ni a otros entornos sin reentrenamiento.
- Sin licencia declarada: no se puede asumir uso comercial sin consultar al autor.
- Sin pipeline ni idiomas declarados; no es un modelo de lenguaje y no debe evaluarse con benchmarks de NLP.
- Riesgo de sobreajuste a la suite fija de 10.000 tareas de entrenamiento.
- Dependencia del código del commit `8bdcb97` para reproducir el comportamiento exacto.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/boldlab/tworoom-planning-1024x6-5k
- Modelo base: https://huggingface.co/quentinll/lewm-tworooms
- Repositorio de código: https://github.com/fracapuano/evolving-wm
- Ejecución de entrenamiento (W&B): https://wandb.ai/francescocapuano/evolving-wm/runs/gmpqvizf
- Sweep de presupuesto de planificación (W&B): https://wandb.ai/francescocapuano/evolving-wm/sweeps/uwp4wk77
