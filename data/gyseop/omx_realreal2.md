# Gyseop/omx_realreal2

## Resumen

omx_realreal2 es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por el usuario Gyseop en Hugging Face. ACT es un método de aprendizaje por imitación que, en lugar de predecir acciones individuales paso a paso, predice fragmentos cortos de acciones (action chunks), lo que reduce el error de acumulación y suele lograr tasas de éxito elevadas en tareas de manipulación aprendidas a partir de datos de teleoperación.

El modelo se ha entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para robótica de bajo coste. Los pesos están en formato safetensors y suman 51.668.614 parámetros, con un tamaño de repositorio de 0,2 GB. Se distribuye bajo licencia Apache 2.0 y está etiquetado con el pipeline `robotics`.

Es relevante para quienes trabajan con brazos robóticos tipo SO-100/SO-101 y quieren reproducir o adaptar una política de imitación ya entrenada, ya que el flujo de entrenamiento e inferencia está estandarizado en LeRobot y el checkpoint puede evaluarse directamente con `lerobot-record`. No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer para imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) combina un codificador visual y un transformer que predice secuencias de acciones de longitud fija en lugar de una sola acción por paso. El modelo aprende por imitación supervisada a partir de datos de teleoperación: el dataset asociado es `Gyseop/record-realreal2`, registrado con LeRobot. No se dispone de información sobre el número de episodios, la composición del dataset, la resolución de las cámaras ni el número de tokens o pasos de entrenamiento.

No consta que se hayan aplicado técnicas de RLHF o DPO; ACT es un método de aprendizaje por imitación puro. Tampoco se documentan innovaciones adicionales más allá del propio mecanismo de action chunking descrito en el paper arXiv:2304.13705. El entrenamiento se realizó con `lerobot-train` sobre dispositivo CUDA, según el flujo indicado en la model card.

## Capacidades

- Predicción de acciones robóticas en forma de chunks para control de manipulación.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Inferencia integrada en el ecosistema LeRobot mediante `lerobot-record`.
- Compatible con robots tipo `so100_follower` en el flujo de evaluación indicado.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión general.
- No dispone de tool calling, function calling ni capacidades de agente.
- No tiene capacidades multilingües ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica de bajo coste: desplegar la política en un brazo SO-100/SO-101 para ejecutar la tarea concreta aprendida del dataset `record-realreal2`, usando `lerobot-record` con `--policy.path` apuntando al checkpoint.
- Reproducción de experimentos de imitación: servir como punto de partida para comparar variantes de ACT sobre el mismo dataset y medir tasas de éxito con `--episodes=10`.
- Fine-tuning sobre nuevos datasets: reentrenar con `lerobot-train --policy.type=act` partiendo de este checkpoint o de la misma configuración para adaptar la política a otra tarea.
- Evaluación estandarizada en laboratorio: usar el flujo de evaluación de LeRobot para generar un dataset `eval_*` y analizar el comportamiento de la política episodio a episodio.
- Docencia y prototipado en robótica: ejemplo completo y ligero (0,2 GB) de pipeline entrenamiento-inferencia para cursos o talleres con hardware asequible.
- Integración en pipelines de investigación: cargar los pesos safetensors en código propio para inspeccionar la política o integrarla en un bucle de control externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 51,7 M de parámetros, el peso en precisión nativa (fp32) ronda los 0,2 GB, por lo que la inferencia es viable en GPUs de gama baja.
- GPU recomendadas: no especificadas por el autor; el flujo de entrenamiento documentado usa `--policy.device=cuda`. Para entrenamiento se recomienda una GPU con al menos 8-16 GB de VRAM, aunque este dato no está confirmado en la información disponible.
- GPU de consumo: por el tamaño del modelo, cabe previsiblemente en cualquier GPU consumer moderna (RTX 3060 en adelante), si bien no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gyseop/omx_realreal2 | 51,7 M | ACT (imitación) | no disponible | Apache 2.0 | Hugging Face |
| Otros checkpoints ACT en LeRobot | variable | ACT (imitación) | no disponible | variable | Hugging Face |
| Políticas Diffusion Policy | no disponible | difusión para acciones | no disponible | variable | Hugging Face / repos de investigación |
| Políticas VLA (p. ej. OpenVLA) | del orden de miles de millones | visión-lenguaje-acción | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de robótica: no sirve para tareas de lenguaje, visión general ni generación de contenido.
- Sesgos y generalización: al entrenarse por imitación sobre un dataset concreto (`record-realreal2`), la política probablemente está limitada a la tarea, el entorno y la morfología del robot usados en la recogida de datos; no hay datos publicados sobre su robustez fuera de ese dominio.
- Riesgo de fallo silencioso: en robótica, una política de imitación puede ejecutar acciones incorrectas sin señal de error explícita; se recomienda supervisión y límites de seguridad físicos.
- Sin métricas publicadas: no hay tasas de éxito, benchmarks ni curvas de entrenamiento en la información disponible, lo que dificulta evaluar su calidad antes de desplegarla.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe conservar el aviso de licencia y atribución correspondiente.
- Fecha de creación futura en los metadatos (2026-11-22): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.
- Sin soporte multilingüe ni de contexto textual: cualquier requisito de idioma o ventana de contexto no aplica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gyseop/omx_realreal2
- Dataset asociado: https://huggingface.co/datasets/Gyseop/record-realreal2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
