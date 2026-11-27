# mcemri/commenv-task-docs

## Resumen

`mcemri/commenv-task-docs` es un checkpoint de investigación publicado por el usuario mcemri, consistente en Qwen3-4B afinado con aprendizaje por refuerzo (GRPO) durante 30 pasos para una tarea concreta de comunicación multiagente. El escenario de entrenamiento es un entorno de documentos divididos: tres copias del modelo actúan como un equipo de tres agentes, cada uno con tres de nueve párrafos de Wikipedia, y las preguntas solo pueden responderse combinando información repartida entre agentes. Los agentes se comunican a través de un tablero compartido durante un máximo de seis turnos y cada uno debe emitir la respuesta final.

El modelo no es un producto ni un asistente generalista: es un artefacto de investigación que documenta un experimento de entrenamiento con RL sobre Qwen3-4B (arquitectura transformer densa de 4.000 millones de parámetros). La relevancia radica en el estudio del comportamiento cooperativo emergente en modelos pequeños y en la mejora medida sobre tareas multi-hop (HotpotQA, MuSiQue) y sobre decisiones de grupo (HiddenBench) tras solo 30 pasos de optimización.

El repositorio ocupa 98,9 GB e incluye exportaciones en formato Transformers (safetensors, 8,8 GB por checkpoint) para los pasos 10, 20 y 30, además de los checkpoints del entrenador con estado del optimizador (22,5 GB cada uno). La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) |
| Parametros totales | 4.000 millones (heredados de Qwen3-4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers) y checkpoints del entrenador en 4 shards |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso de 4.000 millones de parámetros, y se afina mediante GRPO (Group Relative Policy Optimization) durante 30 pasos, partiendo del modelo sin entrenar para esta tarea. El entorno de entrenamiento es un juego cooperativo de tres agentes: cada agente recibe tres de nueve párrafos de Wikipedia y debe responder preguntas cuyas evidencias están repartidas entre agentes distintos. La comunicación se realiza mediante un tablero compartido con un límite de seis turnos, y todos los agentes deben emitir una respuesta.

Los datos de entrenamiento son 2.000 preguntas extraídas de las particiones de entrenamiento de HotpotQA y MuSiQue. El experimento evalúa si el RL puede inducir estrategias de comunicación efectivas en modelos pequeños sin modificar la capacidad individual de razonamiento: el modelo aislado con los nueve párrafos no mejora (HotpotQA 59% antes, 60% después), lo que sugiere que la ganancia proviene de la coordinación y no del conocimiento.

## Capacidades

- Generación de texto y razonamiento multi-hop sobre documentos divididos entre agentes.
- Comunicación multiagente mediante un tablero compartido con hasta seis turnos.
- Toma de decisiones de grupo (evaluada en HiddenBench).
- Participación en entornos de RL multiagente como política entrenada.
- No se documentan capacidades de tool calling, function calling, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la model card.

## Casos de uso

- Investigación en aprendizaje por refuerzo multiagente: sirve como checkpoint de referencia para reproducir o extender el experimento GRPO sobre Qwen3-4B en entornos de comunicación.
- Estudio de comunicación emergente: permite analizar qué estrategias desarrollan tres agentes que comparten un tablero limitado a seis turnos para resolver preguntas multi-hop.
- Evaluación de coordinación en modelos pequeños: útil para comparar si un modelo de 4B puede superar la brecha entre rendimiento individual y rendimiento en equipo (43% a 55% en HotpotQA en este caso).
- Benchmarking de tareas multi-hop: los checkpoints en los pasos 10, 20 y 30 permiten trazar la curva de aprendizaje y medir el efecto de cada tramo de entrenamiento.
- Base para ablaciones: al publicarse checkpoints intermedios y del entrenador, se puede reanudar el entrenamiento o modificar hiperparámetros para estudiar sensibilidad.
- Docencia y divulgación: ejemplo reproducible de fine-tuning con RL sobre un modelo abierto con licencia permisiva.

## Benchmarks y rendimiento

| Benchmark | Antes del run | Después de 30 pasos |
|---|---|---|
| HotpotQA (equipo de 3, 400 preguntas reservadas) | 43% | 55% |
| MuSiQue (equipo de 3, 400 preguntas reservadas) | 28% | 37% |
| HiddenBench (decisiones de grupo, fuera de entrenamiento) | 34% | 45% |
| HotpotQA (un agente solo con los 9 párrafos) | 59% | 60% |

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan 8,8 GB por checkpoint; en fp16 se requiere aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: A100 40/80 GB, H100 o RTX 4090 (24 GB) para inferencia en fp16; GPUs con 16 GB pueden requerir cuantización no publicada.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB con cuantización, aunque no se distribuyen pesos cuantizados.
- Opciones de despliegue: Transformers (carga documentada vía `AutoModelForCausalLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Los checkpoints del entrenador (22,5 GB por paso) requieren más espacio en disco si se desea reanudar el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| mcemri/commenv-task-docs | 4.000 M | no disponible | Apache-2.0 | RL multiagente sobre Qwen3-4B |
| Qwen/Qwen3-4B | 4.000 M | no disponible | Apache-2.0 | Modelo base generalista |
| Modelos de 4B generalistas (p. ej. Llama 3.2 3B, Phi-3-mini) | 3.000-3.800 M | variable | variable | Asistentes generalistas |

La comparación directa con alternativas generalistas no es significativa: este checkpoint está especializado en una tarea de comunicación multiagente y no se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor lo describe como "research checkpoints, not a product".
- Entrenado solo 30 pasos de GRPO; el rendimiento absoluto sigue siendo bajo (55% en HotpotQA, 37% en MuSiQue).
- El entrenamiento se limita a 2.000 preguntas de HotpotQA y MuSiQue; puede sobreajustar a esos dominios y formatos.
- El modelo aislado con todos los párrafos no mejora, lo que indica que la ganancia depende del entorno multiagente y no se transfiere a uso individual.
- No se documentan sesgos, riesgos de alucinación ni comportamientos en dominios fuera de los evaluados.
- Idiomas soportados no disponibles; se desconoce el comportamiento fuera del inglés de los datasets.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no está validado para producción.
- El repositorio ocupa 98,9 GB; los checkpoints del entrenador son necesarios solo para reanudar el entrenamiento.
- No se publican pesos cuantizados ni configuraciones de despliegue optimizadas.

## Enlaces

- Hugging Face: https://huggingface.co/mcemri/commenv-task-docs
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
