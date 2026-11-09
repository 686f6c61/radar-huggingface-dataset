# joamCriff123/zils-lite-lsd2

## Resumen

zils-lite-lsd2 es un modelo de decisión de la familia d3-lite, desarrollado por joamCriff123 sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata de un fine-tuning mediante LoRA orientado específicamente a tareas de clasificación y extracción de características en formato de examen, pensado para el pool lite de la subnet 127 de Zils. Con 852.985.920 parámetros, es un modelo compacto que hereda la arquitectura transformer de la familia Qwen3.5.

El modelo parte del soup d3-lite existente (qhoenix/zils-lite-decision-v9, Apache-2.0) y aplica una pasada de LoRA sobre elementos de entrenamiento en formato de examen, combinando datos generados con asistentes (OpenAI Codex, DeepSeek, Gemini) y filas convertidas de datasets públicos como BIG-bench, SciQ, COPA, BoolQ, MRPC, QQP, ARC, OpenBookQA, CommonsenseQA, HellaSwag, WinoGrande, PAWS y ANLI. Las etiquetas objetivo mezclan un 20% de la etiqueta original y un 80% de las predicciones del soup d3-mini, empleado como profesor de destilación.

Su relevancia radica en ser un ejemplo de modelo de decisión especializado y ligero, con licencia Apache-2.0 y compatible con endpoints, orientado a pipelines de evaluación automática y clasificación de opciones múltiples más que a generación de texto abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con código personalizado (`custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen3.5 con aproximadamente 853 millones de parámetros. El autor no detalla la arquitectura interna más allá de la pertenencia a la familia Qwen3.5 y del uso de `custom_code`, lo que implica que la carga requiere `trust_remote_code`. El pipeline declarado es `feature-extraction`, coherente con un modelo de decisión que produce puntuaciones o representaciones en lugar de texto generativo libre.

El entrenamiento consiste en un fine-tuning LoRA aplicado sobre el soup d3-lite (qhoenix/zils-lite-decision-v9). Los datos de entrenamiento son elementos en formato de examen escritos específicamente para la tarea (con verificación ciega por segunda pasada) más filas convertidas de los splits de entrenamiento de datasets públicos (BIG-bench vía tasksource/bigbench, SciQ, COPA, BoolQ, MRPC, QQP, ARC, OpenBookQA, CommonsenseQA, HellaSwag, WinoGrande, PAWS, ANLI, entre otros). Cada objetivo se construye mezclando un 0,2 de la etiqueta original con un 0,8 de las predicciones del soup d3-mini (promedio uniforme de qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1), usado como profesor de destilación. El resultado es el soup más una pasada LoRA de este tipo.

## Capacidades

- Clasificación y decisión en formato de examen (opción múltiple, verdadero/falso, elección entre pares de frases).
- Extracción de características (`feature-extraction`), adecuada para obtener representaciones del texto de entrada.
- Razonamiento sobre tareas de sentido común y conocimiento general, derivado de los datasets de entrenamiento (HellaSwag, WinoGrande, CommonsenseQA, OpenBookQA, ARC).
- Manejo de tareas de inferencia textual y paráfrasis (ANLI, PAWS, MRPC, QQP).
- Preguntas de comprensión lectora y verificación de hechos (BoolQ, SciQ).
- Integración con endpoints compatibles (`endpoints_compatible`), pensada para despliegue como servicio.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Evaluación automática de exámenes de opción múltiple: el modelo puede puntuar respuestas candidatas en formato de examen, aprovechando su entrenamiento específico sobre ARC, OpenBookQA y CommonsenseQA.
- Clasificación de pares de frases en pipelines de NLP: útil para tareas de paráfrasis, implicación textual y similitud semántica (MRPC, QQP, PAWS, ANLI) dentro de sistemas de moderación o deduplicación.
- Verificación de hechos y preguntas de sí/no: adecuado para BoolQ en flujos de control de calidad documental o asistentes de consulta cerrada.
- Enrutamiento de decisiones en sistemas multi-modelo: al ser un modelo compacto de 853 M de parámetros, puede actuar como clasificador de bajo coste que decide qué modelo mayor invocar.
- Extracción de características para búsqueda semántica: el pipeline `feature-extraction` permite generar embeddings para indexación y recuperación en bases vectoriales.
- Filtrado y curación de datasets: clasificación de muestras en formato de examen para construir o limpiar corpus de evaluación dentro de pipelines de investigación.
- Componente de decisión en la subnet 127 de Zils: uso previsto por el autor dentro del pool lite de la subnet, como cuerpo de decisión para tareas de la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB de pesos, más overhead de activaciones y contexto; en la práctica, entre 2 y 4 GB según longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 3060) es suficiente en FP16; para producción con concurrencia, A10G, L4 o A100.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas actuales e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`); vLLM, TGI y llama.cpp no están confirmados para esta arquitectura personalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-lsd2 | 853 M | no disponible | Apache-2.0 | Hugging Face | Modelo de decisión, fine-tuning LoRA |
| Qwen/Qwen3.5-0.8B | ~800 M (familia) | no disponible | no disponible en la informacion | Hugging Face | Modelo base generativo |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache-2.0 | Hugging Face | Soup d3-lite previo, base del fine-tuning |
| qhoenix/zils-mini-decision-v2 | no disponible | no disponible | Apache-2.0 | Hugging Face | Profesor de destilación, variante mini |

## Limitaciones y advertencias

- Modelo especializado en decisión y extracción de características; no está diseñado para generación de texto abierto ni conversación.
- Riesgo de alucinación y de sobreajuste a los formatos de examen vistos en entrenamiento; el rendimiento fuera de ese formato no está validado.
- Idiomas soportados no documentados; probablemente hereda el multilingüismo de Qwen3.5, pero no hay confirmación del autor.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del repositorio; conviene auditar antes de desplegar en producción.
- Sin descargas ni likes en el momento de la ficha, y sin benchmarks publicados: madurez y validación externa muy limitadas.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones de los modelos upstream indicadas en LICENSE y NOTICE.
- El uso previsto declarado es el pool lite de la subnet 127 de Zils; otros usos no están respaldados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/joamCriff123/zils-lite-lsd2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Soup previo: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Profesor de destilación (1): https://huggingface.co/qhoenix/zils-mini-decision-v2
- Profesor de destilación (2): https://huggingface.co/Charlie320/zils-mini-s1
- Exámenes semilla públicos: https://huggingface.co/zils-ai/base-exam-seed-v1 y https://huggingface.co/zils-ai/base-exam-seed-v4
- BIG-bench vía tasksource: https://huggingface.co/datasets/tasksource/bigbench
