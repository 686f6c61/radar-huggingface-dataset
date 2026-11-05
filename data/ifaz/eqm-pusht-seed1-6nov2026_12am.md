# iFaz/eqm-pusht-seed1-6nov2026_12am

## Resumen

eqm-pusht-seed1-6nov2026_12am es una política de robótica entrenada con LeRobot por el usuario iFaz sobre el conjunto de datos `lerobot/pusht`, un benchmark de manipulación de precisión en el que un brazo robótico 2D debe empujar un objeto hasta una posición objetivo. El modelo no es un LLM ni un modelo de lenguaje: es una política de imitación (imitation learning) que mapea observaciones (imágenes y estado del robot) a acciones de control, empaquetada en formato safetensors y publicada con la librería `lerobot` y la etiqueta `pipeline_tag: robotics`.

El nombre sugiere una política basada en EQM (probablemente Equilibrium Matching o una variante de flow/matching para políticas de difusión), entrenada con la semilla 1 en una fecha concreta (6 de noviembre de 2026). Cuenta con 205.231.924 parámetros y un tamaño de repositorio de 0,8 GB, lo que lo sitúa en el rango de políticas de tamaño medio, adecuadas para inferencia en GPU de consumo.

Su relevancia es acotada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (la plantilla de LeRobot no fue completada y el autor no reconoció el tipo de modelo). Es útil como referencia para reproducir experimentos de LeRobot sobre Pusht, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de robótica; el nombre sugiere EQM, no confirmado) |
| Parametros totales | 205.231.924 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. La model card es la plantilla por defecto de LeRobot y el propio autor indica «Model type not recognized — please update this template», por lo que no se confirma si se trata de un transformer de política, una política de difusión, un modelo de flow matching o una variante EQM. El tag `eqm` y el nombre del repositorio apuntan a una política de tipo EQM, pero no hay documentación que lo verifique.

El entrenamiento se realizó con LeRobot sobre el dataset `lerobot/pusht`, un conjunto de demostraciones de un brazo robótico que empuja un bloque en un plano 2D. No se especifican número de tokens, composición del dataset, ni si hubo RLHF/DPO (no aplicable en este dominio). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal; son conceptos propios de LLM y no constan en este checkpoint.

## Capacidades

- Control robótico por imitación: genera acciones de control a partir de observaciones del entorno Pusht.
- Manipulación de precisión: entrenado específicamente para la tarea de empujar un objeto hasta un objetivo en 2D.
- Inferencia con LeRobot: compatible con `lerobot-record` y `--policy.path` para evaluación sobre el robot `so100_follower`.
- Entrenamiento reproducible: el flujo documentado permite reentrenar desde cero con `lerobot-train`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Reproducción de experimentos de LeRobot sobre Pusht: sirve como checkpoint de referencia para comparar políticas entrenadas con la misma semilla y configuración.
- Evaluación de políticas de imitación: permite ejecutar `lerobot-record` con `--policy.path` sobre el robot `so100_follower` para medir éxito en la tarea de empuje.
- Línea base en investigación de manipulación 2D: útil para contrastar variantes EQM frente a ACT u otras políticas sobre el mismo dataset.
- Docencia y formación: ejemplo práctico de entrenamiento e inferencia con LeRobot en un entorno de bajo coste computacional.
- Pruebas de pipeline de despliegue robótico: validar la integración de safetensors y LeRobot en un flujo de control real antes de escalar a tareas más complejas.
- Benchmark interno de hardware: al tener 205 M de parámetros y 0,8 GB de pesos, permite medir latencia de inferencia en GPUs de consumo sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 205.231.924 parámetros en safetensors (0,8 GB de repo) la inferencia en FP32 requeriría aproximadamente 0,8 GB solo de pesos, más overhead de activaciones y del entorno LeRobot.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería poder cargar los pesos.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-record`, `--policy.path`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eqm-pusht-seed1-6nov2026_12am | 205.231.924 | no aplica | Pusht (empuje 2D) | apache-2.0 | HuggingFace, 0 descargas |
| Políticas ACT de LeRobot sobre Pusht | no disponible | no aplica | Pusht | según checkpoint | múltiples en el Hub |
| Políticas de difusión sobre Pusht | no disponible | no aplica | Pusht | según checkpoint | múltiples en el Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Model card incompleta: el autor no reconoció el tipo de modelo y dejó la plantilla por defecto, lo que impide conocer arquitectura y detalles de entrenamiento.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Especialización extrema: solo válido para la tarea Pusht; no generaliza a otras tareas robóticas sin reentrenamiento.
- Sin benchmarks publicados: no hay evidencia de tasa de éxito ni de robustez.
- Riesgo de sobreajuste al dataset y a la semilla concreta (seed1), lo que limita la reproducibilidad de resultados.
- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de documentación técnica desaconseja su uso en producción sin validación previa.
- No se documentan sesgos, alucinaciones ni limitaciones idiomáticas por no ser aplicables al dominio.

## Enlaces

- HuggingFace: https://huggingface.co/iFaz/eqm-pusht-seed1-6nov2026_12am
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset Pusht: https://huggingface.co/datasets/lerobot/pusht
