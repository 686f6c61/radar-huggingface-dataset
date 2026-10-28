# desshar/llm-course-hw2-reward-model

## Resumen

`desshar/llm-course-hw2-reward-model` es un modelo de recompensa (reward model) de 134.515.584 parámetros, obtenido por ajuste fino de `HuggingFaceTB/SmolLM-135M-Instruct` sobre el dataset `HumanLLMs/Human-Like-DPO-Dataset` mediante TRL. Su función declarada es asignar una puntuación escalar a un texto, no generar texto conversacional: el pipeline de Hugging Face lo expone como `text-classification` y devuelve un `score`.

El modelo pertenece a la categoría de modelos ligeros para experimentación con RLHF y selección de respuestas. Su tamaño reducido permite ejecutarlo en GPU de consumo e incluso en CPU para pruebas, lo que resulta útil en cursos, prototipos y pipelines de curación de datos. Sin embargo, la model card no documenta la longitud de contexto, los idiomas soportados, la licencia legal ni resultados de evaluación.

La relevancia actual es limitada pero clara: sirve como pieza de bajo coste para puntuar preferencias, filtrar candidatos o construir señales de recompensa en experimentos de alineamiento. No debe confundirse con un modelo instructivo generalista, ya que el ajuste con `RewardTrainer` sustituye la cabeza de generación por una cabeza de puntuación y no hay evidencia de que conserve capacidades generativas útiles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama, con cabeza de clasificación para reward modeling; detalles de capas y dimensiones no disponibles |
| Parámetros totales | 134.515.584 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponibles; el repositorio solo contiene pesos safetensors |
| Idiomas soportados | no disponibles |
| Licencia | no disponible; la model card incluye `licence: license` sin texto legal |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Modelo base | HuggingFaceTB/SmolLM-135M-Instruct |
| Dataset de entrenamiento | HumanLLMs/Human-Like-DPO-Dataset |
| Framework de entrenamiento | TRL RewardTrainer |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `SmolLM-135M-Instruct`, un transformer decoder-only de pequeño tamaño, y se ajusta con TRL para actuar como modelo de recompensa. La etiqueta `llama` y el pipeline `text-classification` indican que la salida es una puntuación escalar por texto de entrada, no una distribución sobre el vocabulario. No se documentan el número de capas, la dimensión oculta, el tokenizador, la ventana de contexto ni la composición exacta del dataset.

El entrenamiento se realizó con `RewardTrainer` de TRL sobre `HumanLLMs/Human-Like-DPO-Dataset`. Este tipo de procedimiento suele utilizar pares de preferencia para aprender a ordenar respuestas, pero la model card no especifica el número de ejemplos, la composición del dataset, los hiperparámetros, la función de pérdida exacta ni si hubo una fase posterior de RLHF o DPO. Tampoco se documentan técnicas adicionales como decodificación especulativa, atención lineal o mezcla de expertos.

## Capacidades

- Puntuación de textos: devuelve un `score` escalar mediante el pipeline `text-classification`.
- Ranking de respuestas: permite ordenar dos o más candidatos comparando sus puntuaciones, siempre que se use el mismo modelo y preprocesamiento.
- Filtrado de datos: puede priorizar o descartar ejemplos en función de la puntuación asignada.
- Señal de recompensa: puede integrarse en pipelines de RLHF o PPO como función de recompensa, con la calibración adecuada.
- Evaluación comparativa: útil para medir deriva entre checkpoints o variantes de un mismo pipeline.
- Compatibilidad con Hugging Face: etiquetas `text-embeddings-inference` y `endpoints_compatible`, aunque no se detalla su configuración.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio o modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Entrenamiento RLHF ligero: usar el score como recompensa en un pipeline PPO o en un bucle de optimización de respuestas. Su tamaño de 135M permite iterar en una sola GPU, aunque la calidad de la señal no está validada.
- Selección best-of-N: generar varias respuestas con otro modelo y elegir la de mayor puntuación. Es adecuado para experimentos de bajo coste, no para producción crítica sin evaluación previa.
- Curación de datasets de preferencias: puntuar pares de respuestas y filtrar ejemplos con scores extremos o inconsistentes antes de entrenar un modelo mayor.
- Evaluación de estilo humano: comparar variantes de un sistema conversacional según la proximidad al estilo representado en `Human-Like-DPO-Dataset`. Requiere validar que esa noción de estilo coincida con la del producto.
- Tests de regresión de alineamiento: fijar un conjunto de prompts y monitorizar cambios de score entre versiones del modelo o del preprocesamiento.
- Prototipos educativos: reproducir un flujo completo de reward modeling con TRL en un curso o taller, usando el pipeline de Hugging Face y hardware de consumo.
- Endpoint ligero de puntuación: desplegar el modelo con Transformers o Text Embeddings Inference para puntuar textos en una API interna, siempre que la licencia se aclare antes de un uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, evaluaciones de preferencia, correlación con anotadores humanos ni comparaciones controladas con otros reward models.

## Requisitos de hardware

Las siguientes cifras son estimaciones para los pesos, no medidas oficiales del autor:

| Precisión | VRAM estimada para pesos | VRAM recomendada para inferencia |
|---|---:|---:|
| FP32 | 0,54 GB | 1-2 GB |
| FP16 / BF16 | 0,27 GB | 0,5-1 GB |
| INT8 | 0,13 GB | 0,3-0,7 GB |
| INT4 | 0,07 GB | 0,2-0,5 GB |

- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente.
- También puede ejecutarse en CPU para pruebas puntuales, con latencia mayor y sin datos de throughput.
- GPU profesionales como T4 o L4 son adecuadas para servir el modelo; A100 o H100 no son necesarias por su tamaño.
- Despliegue confirmado: pipeline de Transformers mostrado en la model card. Las etiquetas del repositorio sugieren compatibilidad con Text Embeddings Inference y endpoints de Hugging Face.
- No hay evidencia de soporte para vLLM, llama.cpp u Ollama, ni de variantes GGUF. Al ser un modelo de clasificación con cabeza de recompensa, estos runners no son necesariamente compatibles.
- No se han publicado datos de latencia ni de throughput.

## Comparativa con modelos similares

No hay benchmarks públicos que permitan una comparación de rendimiento. La siguiente tabla compara únicamente datos disponibles y el propósito declarado.

| Modelo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| `desshar/llm-course-hw2-reward-model` | reward modeling / clasificación | 134.515.584 | no disponible | no disponible | público en Hugging Face, 0 descargas |
| `HuggingFaceTB/SmolLM-135M-Instruct` | generación instructiva | 135M nominales | no disponible | no disponible | público en Hugging Face |
| `WhyZosa/llm-course-hw2-reward-model` | reward modeling | no disponible | no disponible | no disponible | público en Hugging Face |
| `desshar/llm-course-hw2-ppo` | generación de texto / PPO | no disponible | no disponible | no disponible | público en Hugging Face |

La comparación con `SmolLM-135M-Instruct` es solo de base arquitectónica: el modelo evaluado no es un generador instructivo validado. `WhyZosa/llm-course-hw2-reward-model` parece un trabajo de la misma categoría, pero no se dispone de especificaciones ni evaluaciones para compararlo.

## Limitaciones y advertencias

- Licencia incierta: la model card indica `licence: license` sin texto legal, por lo que no se puede confirmar el uso comercial.
- Sin benchmarks: no hay evidencia pública de calidad, calibración ni correlación con preferencias humanas.
- Modelo de curso: 0 descargas y 0 likes; no hay señales de validación externa ni mantenimiento.
- Riesgo de reward hacking: cualquier sistema que optimice contra este score puede explotar sesgos del dataset o del preprocesamiento.
- Sesgos desconocidos: no se documenta la composición de `Human-Like-DPO-Dataset`, por lo que se desconocen sesgos de género, idioma, cultura o estilo.
- Idiomas no declarados: no se puede asumir un rendimiento multilingüe.
- Contexto no disponible: no se conoce la longitud máxima de entrada; textos largos pueden truncarse.
- No es un generador fiable: el ajuste con `RewardTrainer` está orientado a puntuar, no a mantener conversaciones.
- Scores no calibrados: no deben interpretarse como probabilidades absolutas ni compararse entre modelos distintos.
- Limitación de capacidad: 135M parámetros pueden ser insuficientes para preferencias matizadas, razonamiento complejo o dominios especializados.
- Sin documentación de evaluación: no hay métricas de precisión, acuerdo entre anotadores, robustez adversarial ni análisis de contaminación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desshar/llm-course-hw2-reward-model
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Repositorio TRL: https://github.com/huggingface/trl
- Modelo relacionado `WhyZosa/llm-course-hw2-reward-model`: https://huggingface.co/WhyZosa/llm-course-hw2-reward-model
- Modelo relacionado `desshar/llm-course-hw2-ppo`: https://huggingface.co/desshar/llm-course-hw2-ppo
- Ficha de cumplimiento en Nerq: https://nerq.ai/agent/7a7b09b5-d400-4f9a-ad92-80fb93468818
