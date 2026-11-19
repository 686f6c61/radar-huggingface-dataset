# boldlab/tworoom-planning-1024x7-5k

## Resumen

TwoRoom C5 es un checkpoint de modelo del mundo (world model) entrenado para el entorno TwoRoom, un escenario de planificación en el que un agente debe navegar entre dos habitaciones hasta un objetivo. Lo desarrolla el usuario boldlab y parte del modelo base `quentinll/lewm-tworooms`, sobre el que se aplica un ajuste fino mediante el framework `evolving-wm`. El modelo aprende una representación latente de la dinámica del entorno que permite evaluar trayectorias de acciones, lo que resulta útil para planificación por búsqueda (CEM) en lugar de control reactivo.

El checkpoint corresponde al estado final tras 5.000 actualizaciones EGGROLL, con un presupuesto de planificación de 1.024 candidatos CEM y 7 iteraciones durante el entrenamiento. Se entrenó sobre una suite fija de 10.000 tareas de entrenamiento y 1.000 de validación, con 8 GPUs por ejecución. El repositorio ocupa 0,1 GB y contiene `weights.pt`, `config.json`, `planner_config.json` y `provenance.json`.

Es relevante como pieza de investigación en model-based reinforcement learning y planificación latente: documenta de forma reproducible (run de W&B, sweep de presupuesto de planificación, commit de origen) el efecto de aumentar el presupuesto de CEM durante el entrenamiento. No es un modelo de lenguaje ni un modelo multimodal de propósito general; su alcance se limita al entorno TwoRoom.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo latente (world model) sobre `quentinll/lewm-tworooms`; arquitectura concreta descrita en `config.json`, no disponible en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de planificacion con action chunk size de 5 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a entornos, no a texto) |
| Licencia | no disponible |
| Formato de pesos | `weights.pt` (state dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo es un world model latente afinado desde `quentinll/lewm-tworooms` mediante el repositorio `evolving-wm` (commit `8bdcb97`). El entrenamiento usa actualizaciones EGGROLL, un esquema de optimización evolutiva, con los siguientes hiperparámetros documentados: learning rate 0,004114155739091268, sigma 0,002174092466593994 y semilla 3072. Se emplean 8 GPUs por ejecución y un tamaño de chunk de acciones de 5.

El aspecto diferencial es el presupuesto de planificación durante el entrenamiento: 1.024 candidatos CEM evaluados a lo largo de 7 iteraciones, lo que da nombre al checkpoint (1024x7). El entrenamiento se realizó sobre una suite fija de 10.000 tareas con 1.000 tareas de validación. El repositorio incluye `planner_config.json`, que registra el planificador usado en entrenamiento, y `provenance.json`, que permite reproducir el experimento. Los ajustes del planificador en evaluación pueden modificarse de forma independiente a los de entrenamiento.

## Capacidades

- Modelado de la dinámica del entorno TwoRoom: predice la evolución del estado latente dadas las acciones del agente.
- Planificación por muestreo (CEM): evalúa múltiples candidatos de secuencias de acción y selecciona las de mayor recompensa estimada.
- Soporte de action chunking con tamaño 5, es decir, planificación sobre bloques de 5 acciones.
- Evaluación de trayectorias en un horizonte corto dentro de un entorno de dos habitaciones con objetivo de navegación.
- Reproducibilidad experimental mediante configuración y procedencia incluidas en el repositorio.
- No dispone de generación de texto, código, matemáticas, visión, tool calling, capacidades multilingües ni modo de razonamiento explícito.

## Casos de uso

- Investigación en model-based RL: servir como checkpoint de referencia para estudiar cómo el presupuesto de planificación CEM (1.024 candidatos × 7 iteraciones) afecta al rendimiento en TwoRoom, comparando con otros checkpoints del sweep publicado.
- Reproducción de experimentos: usar `config.json`, `planner_config.json` y `provenance.json` para replicar el entrenamiento y la evaluación en el commit `8bdcb97` de `evolving-wm`.
- Baseline para planificación latente: comparar variantes de planificadores (distinto número de candidatos o iteraciones en evaluación) contra este modelo entrenado con un presupuesto alto.
- Estudio de optimización evolutiva: analizar el comportamiento de EGGROLL con los hiperparámetros documentados (lr, sigma, semilla) en un entorno de control de horizonte corto.
- Docencia y prototipado: entorno TwoRoom es de baja dimensionalidad, lo que permite experimentar con world models y CEM en hardware modesto (repo de 0,1 GB).
- Evaluación de robustez entre semillas: dado que el autor advierte que es un único seed de entrenamiento, sirve como punto de partida para lanzar réplicas y medir variabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia el run de entrenamiento y el sweep de presupuesto de planificación en W&B, sin cifras de rendimiento en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio (0,1 GB) sugiere un modelo pequeño que probablemente cabe en GPUs de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: el entrenamiento usó 8 GPUs por ejecución; el modelo concreto de GPU no se especifica.
- GPU de consumo: no confirmado, aunque el reducido tamaño del checkpoint hace plausible su ejecución en tarjetas consumer.
- Opciones de despliegue: la librería declarada es `stable-worldmodel`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Presupuesto de planificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| boldlab/tworoom-planning-1024x7-5k | World model + CEM | TwoRoom | 1.024 candidatos × 7 iteraciones | no disponible | Hugging Face |
| quentinll/lewm-tworooms | World model (base) | TwoRoom | no disponible | no disponible | Hugging Face |
| Otros checkpoints del sweep `uwp4wk77` | World model + CEM | TwoRoom | variable | no disponible | W&B (run del autor) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de una única semilla de entrenamiento: el autor advierte explícitamente que los resultados de evaluación entre semillas de planificador no cuantifican la variabilidad entre semillas de entrenamiento.
- Dominio muy restringido: solo modela el entorno TwoRoom; no es transferible a tareas generales de lenguaje, visión o control fuera de ese escenario.
- Licencia no especificada: no hay información sobre permisos de uso comercial; debe consultarse al autor antes de cualquier uso en producción.
- Sin datos de benchmarks publicados en la información disponible, por lo que no es posible validar el rendimiento de forma independiente.
- El formato `weights.pt` requiere cargar el state dict con la configuración de arquitectura adecuada; no es un formato estándar de inferencia listo para usar.
- Riesgo de sobreajuste a la suite fija de 10.000 tareas de entrenamiento; la generalización a variantes del entorno no está documentada.
- No aplica la advertencia habitual de alucinación en texto, pero sí la de predicciones erróneas del modelo del mundo que pueden degradar la planificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/boldlab/tworoom-planning-1024x7-5k
- Modelo base: https://huggingface.co/quentinll/lewm-tworooms
- Repositorio de código: https://github.com/fracapuano/evolving-wm
- Run de entrenamiento (W&B): https://wandb.ai/francescocapuano/evolving-wm/runs/7lv9brjs
- Sweep de presupuesto de planificación (W&B): https://wandb.ai/francescocapuano/evolving-wm/sweeps/uwp4wk77
