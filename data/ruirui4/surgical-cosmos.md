# ruirui4/surgical-cosmos

## Resumen

El modelo `surgical-cosmos`, publicado por el usuario `ruirui4`, es un fine-tuning de Cosmos-Predict2 2B (480p) sobre tareas de robótica quirúrgica simuladas mediante el simulador SurRoL. Se trata de un modelo de mundo de video (world model) adaptado como *policy* dentro del entorno Cosmos-Predict2, orientado a predicción de estados visuales futuros en escenarios quirúrgicos. El autor indica que los checkpoints están almacenados como shards de distributed-checkpoint de PyTorch (`.distcp`), de modo que el directorio `model/` (~3.7 GB) es suficiente para inferencia, mientras que `optim/` (~15 GB) se necesita solo para reanudar el entrenamiento. El repositorio contiene múltiples runs, algunos partiendo del Cosmos-Predict2 original y otros de una base quirúrgica llamada Cosmos-H. Su relevancia radica en aplicar modelos de mundo a dominio quirúrgico, un campo emergente dentro de la robótica asistida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de video basado en Cosmos-Predict2 2B (480p); arquitectura interna no especificada |
| Parámetros totales | 2B (2 mil millones) |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplicable (modelo de video/robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch distributed-checkpoint (`.distcp`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Cosmos-Predict2 2B, un modelo de mundo de video de NVIDIA. Según la model card, los checkpoints están divididos en shards de distributed-checkpoint: `checkpoints/iter_XXXXXXXX/{model,optim,scheduler,trainer}`. El directorio `model/` pesa aproximadamente 3.7 GB y es suficiente para inferencia; `optim/` (~15 GB) solo es necesario para continuar el entrenamiento. Cada run incluye además `config.yaml`, `launch_info.yaml`, `job_env.yaml` y `wandb_id.txt`.

Los runs con prefijo `surrol_` provienen de `surgical/cosmos-policy/outputs_*`, mientras que los prefijos `cosmos_predict2_` provienen de `cosmos-policy/output`. El sufijo `_original` indica que se parte del Cosmos-Predict2 base, y `_surgical_h` indica que se parte de una base quirúrgica Cosmos-H. El autor no detalla el número total de tokens de entrenamiento ni la composición del dataset. Los nombres de los runs revelan tareas concretas: knot tying, needle passing, gauze retrieve, needle pick, needle regras, peg transfer, pick and place y bipeg transfer.

## Capacidades

- Predicción de vídeo en resolución 480p para escenas quirúrgicas simuladas.
- Funcionamiento como *policy* en entornos SurRoL, condicionada por acciones para predecir el siguiente estado visual.
- Disponibilidad de múltiples variantes entrenadas sobre tareas específicas: knot tying, needle passing, gauze retrieve, needle pick, needle regras, peg transfer, pick and place y bipeg transfer.
- Incluye runs con dos inicializaciones distintas: Cosmos-Predict2 original (sufijo `_original`) y Cosmos-H quirúrgico (sufijo `_surgical_h`).
- No tiene soporte de tool calling ni de lenguaje: al ser un modelo de vídeo/robótica, su interfaz no es textual.
- Permite reanudar el entrenamiento desde el estado del optimizador incluido en los checkpoints.

## Casos de uso

- **Planificación de movimientos en robótica quirúrgica**: el modelo puede predecir la evolución visual de la escena a partir de una acción, lo que permite a un sistema de control anticipar los siguientes pasos del instrumental.
- **Entrenamiento de policies mediante reinforcement learning**: al incluir el estado del optimizador, se puede reanudar un entrenamiento largo en tareas SurRoL sin perder el progreso, útil para experimentos iterativos.
- **Simulación de procedimientos quirúrgicos para validación**: se pueden generar secuencias de vídeo sintéticas de tareas como nudo o transferencia de aguja para probar algoritmos de visión sin necesidad de datos reales.
- **Aumento de datos para modelos de visión**: el modelo puede generar variaciones de escenas quirúrgicas, sirviendo como fuente de datos sintéticos para entrenar detectores o segmentadores.
- **Investigación en world models quirúrgicos**: sirve como base para estudiar la transferencia de un modelo de mundo de video de dominio general al dominio quirúrgico, comparando comportamiento entre inicializaciones.
- **Evaluación de estrategias de fine-tuning**: al existir runs con base `_original` y `_surgical_h`, se puede analizar cómo afecta la elección de la inicialización al rendimiento en la misma tarea quirúrgica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El checkpoint de inferencia (`model/`) ocupa aproximadamente 3.7 GB.
- El checkpoint completo con optimizador pesa alrededor de 15 GB y solo es necesario para reanudar entrenamiento.
- El repositorio total en Hugging Face es de 548.1 GB, ya que contiene 22 runs con sus checkpoints completos.
- No se proporcionan datos de VRAM, latencia ni throughput.
- No se especifican GPUs recomendadas.
- No se especifican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.); la librería indicada es `cosmos` y los pesos son de PyTorch.
- Dado que se trata de un modelo de vídeo que procesa secuencias 480p, es probable que requiera GPUs de gama alta, pero no se confirma en la información.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| surgical-cosmos | 2B | no disponible | Tareas quirúrgicas SurRoL (fine-tuning) | Apache 2.0 |
| Cosmos-Predict2 2B base | 2B | no disponible | World model de vídeo genérico | no disponible |
| Cosmos-H-Surgical | no disponible | no disponible | Suite de modelos de mundo quirúrgico | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado sobre simulaciones SurRoL; no hay evidencia de rendimiento en entornos quirúrgicos reales.
- Al ser un modelo generativo, existe riesgo de alucinación visual, es decir, frames inconsistentes o incoherentes con la dinámica esperada.
- Los checkpoints están distribuidos en shards `.distcp`, lo que requiere conocimientos de PyTorch distributed y de la librería `cosmos` para cargarlos correctamente.
- No se han publicado evaluaciones de seguridad, robustez ni benchmarks formales.
- Aunque la licencia Apache 2.0 permite uso comercial, las dependencias de NVIDIA Cosmos o Cosmos-H-Surgical pueden estar sujetas a términos adicionales.
- No se especifican los idiomas soportados porque el modelo no es lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruirui4/surgical-cosmos
- GitHub de Cosmos-H-Surgical de NVIDIA-Medtech: https://github.com/NVIDIA-Medtech/Cosmos-H-Surgical
