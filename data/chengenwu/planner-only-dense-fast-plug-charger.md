# chengenwu/planner-only-dense-fast-plug-charger

## Resumen

`chengenwu/planner-only-dense-fast-plug-charger` es una coleccion de checkpoints de politica (policy) para robotica entrenados mediante imitation learning sobre tareas de manipulacion del benchmark ManiSkill, concretamente la tarea PlugCharger (insertar un cargador en una toma). Lo desarrolla el usuario chengenwu y forma parte de un barrido experimental ("threshold sweep") de la metodologia vig-dagger, cuyo objetivo es comparar politicas densas entrenadas solo con demos de un planificador frente a variantes aumentadas con episodios DAgger.

El modelo no es un modelo de lenguaje ni un modelo fundacional multimodal: es una politica densa de imitacion que mapea observaciones (estado y/o vision a resolucion completa) a acciones de control, sin mezcla de expertos (MoE). Se distribuye en tres checkpoints con distinto numero de demos de entrenamiento (350, 750 y 1550), lo que permite trazar una curva de escalado de datos de demostracion.

Es relevante para investigadores en robotica que trabajen con imitation learning, DAgger y benchmarks tipo ManiSkill, ya que proporciona puntos de comparacion reproducibles (mismo seed, misma evaluacion) sobre el efecto del volumen de demos de planificador en la tasa de exito de tareas de insercion de precision. El repositorio ocupa 0,4 GB y contiene unicamente pesos (no permite reanudar entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | politica densa de imitation learning (sin mezcla de expertos); arquitectura de red concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica; no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.pt`, `latest.pt`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

Se trata de politicas densas a resolucion completa (sin MoE) entrenadas con el pipeline vig-dagger sobre demos generados por un planificador de movimiento rapido ("fast-motion planner"). Los datos provienen del repositorio de dataset `chengenwu/fast-exp-plug-charger`, usando `raw/planner/` (los primeros 50 demos) y despues `raw/planner_baselines/`, en orden, hasta acumular N demos. El entrenamiento se realizo durante 60 epochs con seed de entrenamiento 0.

Los tres checkpoints corresponden a N = 350, 750 y 1550 demos de planificador. Son checkpoints solo de pesos: cargan para evaluacion e inferencia, pero no permiten reanudar el entrenamiento. La evaluacion se hizo sobre 200 escenas (desde seed 60000, 400 pasos), en la misma maquina, y forma parte del barrido de umbrales de la rama `plugcharger-threshold-sweep`, donde cada politica densa entrenada con N demos de planificador mas sus episodios DAgger se compara con la politica solo-planificador sobre el mismo numero de demos.

## Capacidades

- Control robotico para la tarea de insercion PlugCharger en ManiSkill (manipulacion de precision).
- Politica de imitacion densa que mapea observaciones a acciones; no genera texto ni razona en lenguaje natural.
- Entrenada exclusivamente con demos de planificador (sin aumentos DAgger en estos checkpoints).
- Escalado de datos demostrable: la tasa de exito crece con el numero de demos (16,0 % -> 33,5 % -> 50,5 %).
- No soporta tool calling, function calling ni comportamiento de agente multi-paso.
- No tiene capacidades multilingues, de vision general, audio ni modo "thinking".
- Carga para evaluacion e inferencia; no reanudable para entrenamiento.

## Casos de uso

- Punto de referencia (baseline) en investigacion de imitation learning: usar los tres checkpoints para medir como escala la tasa de exito con el numero de demos de planificador (350, 750, 1550) en una misma tarea y evaluacion.
- Ablacion de DAgger: comparar estas politicas solo-planificador con las variantes aumentadas con episodios DAgger del mismo barrido de umbrales, aislando el efecto del aumento de datos.
- Reproducibilidad de experimentos: al fijar seed de entrenamiento (0) y seed de evaluacion (60000, 400 pasos), sirven para replicar resultados en otra maquina bajo la misma configuracion.
- Estudio de tareas de insercion de precision: la tarea PlugCharger exige alineacion fina; los checkpoints permiten analizar modos de fallo en insercion.
- Inicializacion o comparacion en pipelines de robotica: cargar `latest.pt` para inferencia en evaluacion dentro de ManiSkill y contrastar con politicas propias.
- Docencia y demos de imitation learning: ilustrar la curva datos-rendimiento (16,0 %, 33,5 %, 50,5 %) en un benchmark estandar como ManiSkill.

## Benchmarks y rendimiento

Evaluacion sobre 200 escenas (seed 60000, 400 pasos), segun la model card:

| Checkpoint | Demos de planificador | Exitos / 200 | Tasa de exito |
|---|---|---|---|
| `planner_350/latest.pt` | 350 | 32/200 | 16,0 % |
| `planner_750/latest.pt` | 750 | 67/200 | 33,5 % |
| `planner_1550/latest.pt` | 1550 | 101/200 | 50,5 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 0,4 GB, por lo que los pesos de cada checkpoint son ligeros y caben holgadamente en GPU consumer.
- GPU recomendadas: no especificadas por el autor; al ser una politica de control de bajo coste computacional, es probable que funcione en GPU consumer (p. ej. RTX 3060/4090) e incluso en CPU para inferencia, aunque no se confirma en la informacion disponible.
- Cabe en GPU consumer: si, segun el tamano del repositorio (0,4 GB), aunque no hay requisitos oficiales publicados.
- Opciones de despliegue: carga directa de checkpoints PyTorch (`.pt`) en el entorno de evaluacion de ManiSkill; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a una politica de robotica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Tasa de exito (200 escenas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| planner-only-dense-fast-plug-charger (350) | Politica densa, solo planificador | 350 demos | 16,0 % | no disponible | Hugging Face |
| planner-only-dense-fast-plug-charger (750) | Politica densa, solo planificador | 750 demos | 33,5 % | no disponible | Hugging Face |
| planner-only-dense-fast-plug-charger (1550) | Politica densa, solo planificador | 1550 demos | 50,5 % | no disponible | Hugging Face |
| Variantes vig-dagger con DAgger (rama `plugcharger-threshold-sweep`) | Politica densa + DAgger | N demos + episodios DAgger | no disponible en esta ficha | no disponible | Referenciadas, no incluidas aqui |

No se dispone de datos de otros modelos comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Solo pesos: no se puede reanudar el entrenamiento desde estos checkpoints.
- Entrenados unicamente con demos de planificador; no incorporan episodios DAgger, lo que limita su rendimiento frente a variantes aumentadas.
- Tasas de exito moderadas: incluso el mejor checkpoint (1550 demos) acierta en el 50,5 % de las escenas; no es apto para produccion sin mejoras.
- Especificos de una unica tarea (PlugCharger) y de ManiSkill; no generalizan a otras tareas ni dominios.
- Sin informacion sobre sesgos, alucinacion (no aplica a lenguaje) ni robustez fuera del entorno de evaluacion.
- Licencia no disponible: no se puede confirmar el uso comercial; verificar con el autor antes de cualquier despliegue.
- Sin requisitos de hardware ni latencias publicadas; la evaluacion se realizo en una maquina concreta y puede no transferirse directamente.
- Riesgo de sobreajuste a la distribucion de demos del planificador y a las escenas de evaluacion con seed fija.

## Enlaces

- Hugging Face: https://huggingface.co/chengenwu/planner-only-dense-fast-plug-charger
- Dataset de entrenamiento referenciado: `chengenwu/fast-exp-plug-charger` (repositorio de dataset en Hugging Face; URL no proporcionada en la informacion disponible)
- Rama experimental referenciada: `plugcharger-threshold-sweep` (sin URL disponible)
- ManiSkill (benchmark): no disponible en la informacion proporcionada
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
