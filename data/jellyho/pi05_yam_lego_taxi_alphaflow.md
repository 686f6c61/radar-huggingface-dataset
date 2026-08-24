# jellyho/pi05_yam_lego_taxi_alphaflow

## Resumen

El modelo `jellyho/pi05_yam_lego_taxi_alphaflow` es un fine-tune del modelo de visión-lenguaje-acción (VLA) pi0.5, desarrollado por jellyho (Hokyun Im), que aplica el curriculum de entrenamiento AlphaFlow para convertir el flujo de coincidencia (flow matching) en un esquema de velocidad media (MeanFlow). Esto permite que el experto de acciones muestree un chunk completo de acciones en una única pasada hacia adelante (`num_steps=1`), en lugar de los 10 pasos ODE habituales, reduciendo drásticamente la latencia de inferencia en robótica.

El modelo está entrenado sobre el dataset `jellyho/yam_lego_taxi_s300` (solo demostraciones exitosas) durante 200k pasos, con un curriculum sigmoide que reduce el parámetro alpha desde 1 hasta un suelo de 5e-3. El checkpoint resultante (12.4 GB) se distribuye en formato openpi/orbax, listo para cargarse con la librería openpi. La evaluación interna muestra que el muestreo de un paso supera al de 10 pasos en error cuadrático medio en el espacio del robot, lo que lo convierte en el modo de despliegue recomendado.

Su relevancia radica en que demuestra una vía práctica para acelerar la inferencia de modelos VLA basados en flujo, manteniendo o mejorando la precisión, y abre la puerta a su uso en tiempo real en robots físicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (Vision-Language-Action, basado en flow matching con MeanFlow) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo multimodal, idiomas no especificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint openpi/orbax (`params/` y `assets/`) |

## Arquitectura y entrenamiento

El modelo parte de pi0.5, un VLA que combina un codificador de visión, un modelo de lenguaje y un experto de acciones basado en flujo. La innovación de este fine-tune es la aplicación del curriculum AlphaFlow, que transforma el flujo de coincidencia estándar en un esquema de velocidad media (MeanFlow). Esto permite que el experto de acciones genere un chunk completo de acciones en una sola pasada, eliminando la necesidad de iterar múltiples pasos de ODE durante la inferencia.

El entrenamiento se realizó sobre el dataset `jellyho/yam_lego_taxi_s300`, compuesto únicamente por demostraciones exitosas de una tarea de manipulación con piezas de Lego (tipo taxi). Se usó un curriculum sigmoide global (gamma=25) con alpha decreciente desde 1 hasta 5e-3, y una relación de flujo (fm_ratio) de 0.5. El proceso incluyó objetivos discretos de dos pasadas sin JVP, con una transición en el paso ~57.6k y el suelo de alpha desde ~142k. El registro de entrenamiento (wandb `c4vy84yy`) reporta una disminución del error delta² de 0.052 a 0.0026 sin inestabilidades.

## Capacidades

- Generación de acciones de robot (chunks de acciones) a partir de observaciones visuales y comandos en lenguaje natural.
- Muestreo de un solo paso (`num_steps=1`) para inferencia de baja latencia, con rendimiento superior al de 10 pasos según la métrica interna.
- Soporte de muestreo N-candidato para selección best-of-N mediante `model.sample_n_actions(...)` o el script `serve_patch_critic.py --flow-steps 1`.
- Integración con el ecosistema openpi para carga y despliegue de políticas robóticas.
- Específicamente entrenado para tareas de manipulación con piezas de Lego (tarea "taxi"), aunque puede servir como base para fine-tunes posteriores.

## Casos de uso

- Control en tiempo real de un brazo robótico para ensamblaje de piezas de Lego: el muestreo de un solo paso reduce la latencia de inferencia, permitiendo que el robot reaccione ágilmente a cambios en el entorno.
- Evaluación de políticas robóticas en entornos simulados: el checkpoint puede cargarse con openpi y ejecutarse en simulación para validar el comportamiento antes del despliegue físico.
- Generación de trayectorias de manipulación para tareas de precisión: el modelo produce chunks de acciones coherentes con la observación visual, útil para tareas de pick-and-place o inserción.
- Investigación en métodos de destilación de flujo: al ser un ejemplo de AlphaFlow aplicado a pi0.5, sirve como referencia para estudiar la reducción de pasos de inferencia en modelos VLA.
- Desarrollo de sistemas de robot guiados por lenguaje: el modelo puede recibir instrucciones en lenguaje natural (aunque no se especifican idiomas) y traducirlas en secuencias de acciones.
- Benchmarking de políticas VLA: el error cuadrático medio reportado (1-step 0.00096) proporciona una métrica de referencia para comparar con otros fine-tunes o métodos de entrenamiento.

## Benchmarks y rendimiento

La model card reporta una métrica de error cuadrático medio (MSE) en el espacio del robot, comparando el muestreo de un paso frente a diez pasos y frente a un fine-tune de comportamiento (BC) estándar:

| Configuracion | MSE (robot-space demo) |
|---|---|
| AlphaFlow 1-step | 0.00096 |
| AlphaFlow 10-step | 0.00153 |
| BC-s300 10-step | 0.00267 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de robótica especializado.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- El tamaño del repositorio es de 12.4 GB, lo que sugiere que el checkpoint completo en precisión FP32 o BF16 puede requerir al menos 12-16 GB de VRAM para cargarse en memoria.
- Para inferencia en tiempo real con un solo paso, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090, A100, L4), aunque no hay datos confirmados.
- El despliegue se realiza mediante la librería openpi, que soporta ejecución en GPU NVIDIA con CUDA. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que el formato no es GGUF ni safetensors estándar.
- La latencia y el throughput no se han publicado; el diseño de un solo paso sugiere una mejora significativa frente a los 10 pasos, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos. El autor publica otro fine-tune similar, `jellyho/pi05_yam_lego_taxi_rlt_s200`, que parece entrenado con aprendizaje por refuerzo (RL) en lugar de AlphaFlow, pero no se proporcionan especificaciones ni métricas comparables. Tampoco se dispone de información sobre el modelo base pi0.5 en esta ficha. Por tanto, la comparativa queda limitada a la existencia de alternativas sin datos concretos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de Lego-taxi; su generalización a otras tareas de manipulación no está garantizada y requeriría fine-tune adicional.
- El muestreo de un solo paso es el modo recomendado; usarlo con 10 pasos puede degradar ligeramente el rendimiento (según el MSE reportado), aunque sigue siendo mejor que el BC estándar.
- No se han documentado sesgos específicos, pero al entrenarse con un dataset limitado (solo demostraciones exitosas) puede heredar sesgos de la distribución de datos original.
- Existe riesgo de alucinación de acciones no válidas o inseguras si el modelo recibe observaciones fuera de distribución.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación y no incluye garantías de seguridad para despliegue en robots reales sin validación adicional.
- No se especifican idiomas soportados; aunque pi0.5 es multimodal, la comprensión de lenguaje puede estar limitada al inglés u otros idiomas no declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jellyho/pi05_yam_lego_taxi_alphaflow
- Repositorio de código (fork de openpi): https://github.com/jellyho/ACRFT
- Dataset de entrenamiento: https://huggingface.co/datasets/jellyho/yam_lego_taxi_s300 (inferido, no verificado)
- Paper de pi0.5: https://arxiv.org/abs/2504.16054
- Perfil del autor: https://huggingface.co/jellyho
- Modelo relacionado (RL): https://huggingface.co/jellyho/pi05_yam_lego_taxi_rlt_s200
