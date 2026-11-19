# JetBrains-Research/budget-internalization-qwen3.5-4b-16k-grpo-budget-user-kindelf-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-16k-grpo-budget-user-kindelf-s300` es un ajuste fino por aprendizaje por refuerzo (RL) de `Qwen/Qwen3.5-4B`, desarrollado por JetBrains-Research. Su objetivo es internalizar un presupuesto fijo de generación de 16.384 tokens en tareas de razonamiento matemático: el límite se declara explícitamente en el prompt de usuario y el modelo aprende a producir respuestas correctas sin agotar ese presupuesto. Acompaña al artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura `qwen3_5`, 4.539.265.536 parámetros totales y pesos en BF16 (repositorio de 9,1 GB). El entrenamiento emplea GRPO con recompensa binaria de corrección de respuesta sobre el dataset DeepScaleR, durante 300 pasos.

Su relevancia es metodológica: no busca maximizar el rendimiento absoluto con test-time scaling, sino demostrar que el RL con presupuesto fijo permite obtener precisión dentro del presupuesto asignado. Es un checkpoint de investigación (paso 300), con cero descargas y sin métricas publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal, `qwen3_5`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generación de 16.384 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, un transformer multimodal con pipeline image-text-to-text. Sobre esa base se aplica GRPO con las siguientes particularidades: baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el límite de 16.384 tokens se truncan y se puntúan tal cual, de modo que el modelo recibe señal negativa cuando no concluye dentro del presupuesto.

Los datos de entrenamiento son problemas matemáticos de DeepScaleR (`agentica-org/DeepScaleR-Preview-Dataset`), con un máximo de 3 épocas. Cada prompt incluye una declaración explícita del presupuesto de 16.384 tokens y se renderiza con la plantilla de chat del modelo base. La configuración es: 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7, 10 pasos de warmup y 300 pasos totales. La recompensa es binaria, basada en la extracción de la respuesta dentro de `\boxed{}`. La innovación destacable es precisamente la internalización del presupuesto vía prompt, en lugar de controlarlo solo mediante `max_new_tokens` en inferencia.

## Capacidades

- Razonamiento matemático con presupuesto de generación fijo declarado en el prompt de usuario.
- Generación de texto conversacional mediante la plantilla de chat del modelo base.
- Procesamiento image-text-to-text heredado de Qwen3.5-4B (no se detalla el alcance multimodal en la model card).
- Producción de respuestas con formato `\boxed{}` para extracción automática de la solución.
- Ajuste del esfuerzo de razonamiento al límite indicado, evitando truncamientos por agotamiento del presupuesto.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Evaluación de investigación sobre budget internalization: reproducir el experimento del artículo con este checkpoint de 300 pasos para medir precisión dentro de presupuesto frente al modelo base.
- Razonamiento matemático con latencia acotada: desplegar el modelo con `max_new_tokens=16384` y declarar el presupuesto en el prompt para obtener respuestas completas sin truncamientos en producción.
- Generación de soluciones paso a paso verificables: el formato `\boxed{}` permite extraer y validar automáticamente la respuesta final en pipelines de corrección.
- Benchmarking de RLVR: usar el checkpoint como referencia para comparar GRPO con presupuesto fijo frente a métodos de test-time scaling en tareas de matemáticas.
- Fine-tuning posterior: al ser Apache 2.0 y safetensors, sirve como punto de partida para experimentos de RL con otros presupuestos o datasets.
- Docencia y divulgación: ilustrar cómo un límite declarado en el prompt modifica el comportamiento de razonamiento de un modelo de 4B en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16 de 4.539.265.536 parámetros: aproximadamente 9,1 GB solo para pesos, coherente con el tamaño del repositorio.
- Inferencia en BF16: se recomienda GPU con al menos 16-24 GB de VRAM para incluir KV cache con presupuestos de 16.384 tokens.
- Cuantización a 8 bits: en torno a 5 GB de pesos; a 4 bits, en torno a 2,5-3 GB (estimación, no verificada en la model card).
- GPU recomendadas: A100, H100 o L40S para BF16 con contexto largo; RTX 4090 (24 GB) viable en BF16 con margen ajustado.
- GPU de consumo: cabe en RTX 3090/4090 en BF16 y en GPUs de 8-12 GB con cuantización de 4-8 bits, aunque los formatos GGUF no se distribuyen en el repositorio.
- Despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-16k-grpo (este) | 4.539 M | no disponible (presupuesto 16.384) | RL con presupuesto fijo | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | no disponible | no disponible | Modelo base multimodal | Apache 2.0 (según herencia) | Hugging Face |
| Alternativas de razonamiento matemático de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de investigación en el paso 300, sin métricas publicadas ni descargas; no validado para producción.
- Entrenado exclusivamente con problemas matemáticos de DeepScaleR: el rendimiento fuera de ese dominio no está caracterizado.
- El comportamiento depende de que el presupuesto de 16.384 tokens se declare en el prompt de usuario; omitirlo puede degradar la calidad de las respuestas.
- Riesgo de alucinación inherente a los modelos generativos, especialmente fuera del dominio matemático.
- Sesgos: no documentados en la model card.
- Idiomas soportados: no documentados; no se garantiza un rendimiento multilingüe específico.
- Licencia Apache 2.0 heredada del modelo base, apta para uso comercial, pero sin garantías del autor.
- La cita del artículo figura como TODO en la model card; conviene verificar la referencia antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-16k-grpo-budget-user-kindelf-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Artículo: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (enlace no disponible)
- Repositorio de código: no disponible
