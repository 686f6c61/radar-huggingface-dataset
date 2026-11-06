# mysterium99/smolvla_stage2c_complexity_3_to_ds3

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots reales a partir de observaciones visuales y de estado, y producir acciones motoras directamente. Esta ficha concreta, `mysterium99/smolvla_stage2c_complexity_3_to_ds3`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `ds3`, orientado a la tarea de manipulación "Put all hardware in bucket" (introducir todo el hardware en el cubo).

El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,9 GB. Consume tres cámaras RGB de 256x256 píxeles y un vector de estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones. Está pensado para despliegue en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que quieren experimentar con políticas robóticas de imitación sin infraestructura de gran escala.

La relevancia actual del modelo radica en su carácter de ejemplo reproducible de fine-tuning de SmolVLA con LeRobot: incluye la configuración de entrenamiento completa (20.000 pasos, batch de 8, AdamW, learning rate 1e-4) y los comandos de despliegue, lo que facilita la replicación y la adaptación a nuevas tareas robóticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, implementada en LeRobot; detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones roboticas, no a texto generativo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | follow |
| Camaras | gripper, newtop, newside |
| Entrada de estado | observation.state, shape (6,) |
| Entradas visuales | 3 x (3, 256, 256) |
| Salida | action, shape (6,) |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura vision-language-action compacta que combina percepción visual y estado propioceptivo para generar acciones motoras de forma directa. El modelo base se describe en el paper arXiv:2506.01844 como un VLA eficiente capaz de alcanzar rendimiento competitivo con costes computacionales reducidos y despliegue en hardware de consumo. Esta versión concreta es un fine-tuning del checkpoint `lerobot/smolvla_base` sobre el dataset `ds3`, que contiene 50 episodios y 85.293 frames a 30 FPS para la tarea "Put all hardware in bucket".

La configuración de entrenamiento documentada incluye 20.000 pasos, batch size de 8, optimizador AdamW, learning rate de 0,0001, semilla 0 y LeRobot versión 0.6.1. No se detalla en la información disponible la composición exacta del dataset de preentrenamiento del modelo base, ni si se emplearon técnicas de RLHF o DPO (poco habituales en políticas de imitación robótica). Tampoco se especifican innovaciones técnicas internas como atención lineal o decodificación especulativa para esta variante.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado para ejecutar la tarea "Put all hardware in bucket".
- Percepción multimodal: procesa simultáneamente tres cámaras RGB (gripper, newtop, newside) a resolución 256x256 y un vector de estado de 6 componentes.
- Ejecución de políticas en robot real: integración con `lerobot-rollout` para desplegar la política en un robot de tipo `follow`.
- Entrenamiento y fine-tuning reproducible: compatible con `lerobot-train` para adaptar la política a nuevos datasets.
- Despliegue en hardware de consumo: el modelo base está diseñado explícitamente para ejecutarse en equipos de gama consumer.
- No se documentan capacidades de generación de texto, razonamiento lingüístico, tool calling, agentes multi-paso ni procesamiento de audio.

## Casos de uso

- Manipulación robótica de laboratorio: ejecutar la tarea de recogida e inserción de hardware en un cubo con un robot `follow`, usando las tres cámaras entrenadas para localizar piezas y planificar la acción de agarre.
- Replicación de experimentos de imitación: servir como referencia reproducible de un fine-tuning de SmolVLA con parámetros documentados (20.000 pasos, batch 8, AdamW) para comparar metodologías en investigación académica.
- Base para fine-tuning en nuevas tareas: partir de este checkpoint y reentrenar con `lerobot-train` sobre un dataset propio para tareas de pick-and-place en entornos controlados.
- Evaluación de políticas VLA en hardware de consumo: desplegar la política en estaciones de trabajo con GPU consumer para medir latencia y robustez antes de escalar a entornos industriales.
- Docencia y formación en robótica: utilizar el modelo y sus comandos de rollout como ejemplo práctico de pipeline completo de aprendizaje por imitación con LeRobot.
- Prototipado rápido de automatización de almacén: adaptar la política a tareas de clasificación de componentes metálicos en contenedores, aprovechando la entrada multi-cámara para cubrir distintos ángulos de la mesa de trabajo.
- Benchmarking de infraestructura de inferencia robótica: comparar el rendimiento de `lerobot-rollout` frente a otros runners al ejecutar esta política de 450 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que no hay tabla de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors (0,9 GB de repositorio), la inferencia en precisión nativa requiere del orden de 1-2 GB de VRAM, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no especificadas por el autor; el modelo base SmolVLA está diseñado para hardware de consumo, por lo que se espera compatibilidad con GPUs consumer modernas.
- ¿Cabe en GPU consumer? El diseño del modelo base apunta a que sí, pero no se detalla qué modelos concretos (RTX 4090, RTX 3090, etc.) han sido validados.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=mysterium99/smolvla_stage2c_complexity_3_to_ds3`; entrenamiento con `lerobot-train`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2c_complexity_3_to_ds3 | 450.046.176 | no disponible | VLA robotica (fine-tuning de SmolVLA) | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA robotica base | no disponible en la informacion | Hugging Face (modelo base) |
| Otros VLA de la familia SmolVLA | no disponible | no disponible | VLA robotica | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Sin resultados de evaluación: el autor no ha publicado tasas de éxito en robot real, por lo que se desconoce la fiabilidad de la política.
- Tarea única y específica: entrenado exclusivamente para "Put all hardware in bucket" con el dataset `ds3`; no generaliza a otras tareas sin fine-tuning.
- Dependencia de la configuración de cámaras: los nombres y la disposición de las cámaras (gripper, newtop, newside) deben coincidir exactamente con los usados en el entrenamiento; cambios de iluminación, posición de objetos o robot pueden degradar el rendimiento.
- Dataset pequeño: 50 episodios y 85.293 frames, lo que limita la diversidad de escenarios cubiertos.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual puede heredar sesgos de los datos de entrenamiento no descritos.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones no válidas ante observaciones fuera de distribución.
- Idiomas: no aplica soporte multilingüe; el modelo no es generativo de texto.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y del dataset `ds3` antes de un despliegue productivo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_3_to_ds3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset ds3: https://huggingface.co/datasets/ds3
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds3
