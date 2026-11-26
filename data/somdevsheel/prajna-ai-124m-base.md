# somdevsheel/prajna-ai-124m-base

## Resumen

prajna-ai-124m-base es un modelo de lenguaje base de 123,6 millones de parámetros entrenado desde cero por el desarrollador independiente somdevsheel (anteriormente publicado como `kaggle-llm-124m-base`). Se trata de un transformer decoder-only de estilo LLaMA con atención RoPE, RMSNorm pre-norm, SwiGLU y embeddings atados, diseñado explícitamente como ejercicio de preentrenamiento reproducible en hardware de consumo: todo el entrenamiento se realizó en 2 GPU NVIDIA T4 gratuitas de Kaggle, con sesiones limitadas a 12 horas.

El modelo se entrenó en tres etapas: primero 1,92B tokens de FineWeb-Edu (muestra sample-10BT, sin repetición de tokens), después un segundo tramo de preentrenamiento continuado sobre datos no vistos, y finalmente una etapa de extensión de contexto de 1.024 a 4.096 tokens con subida del RoPE theta de 10.000 a 100.000, usando 580M tokens de un corpus en inglés centrado en la India (Sangraha, Wikipedia y FineWeb-Edu). El resultado es un modelo de completado de texto, no de chat, con licencia Apache 2.0 y un tamaño de repositorio de 0,7 GB.

Su relevancia es acotada pero clara: demuestra que es posible entrenar un modelo tipo LLaMA desde cero con presupuesto cero y obtener pérdidas de validación razonables (3,25 en FineWeb-Edu a contexto 4K), lo que lo convierte en una referencia útil para experimentos educativos, ablaciones de arquitectura y prototipado de bajo coste. No compite con modelos de producción en conocimiento del mundo ni en seguimiento de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (RoPE, RMSNorm pre-norm, SwiGLU, sin biases, embeddings atados) |
| Parametros totales | 123.587.328 (123,6M); 85,0M no-embedding |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (RoPE theta 100.000); versión previa de 1.024 tokens en la revisión `13f120f` |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantización estándar vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Dimensiones internas: 12 capas, hidden size 768, 12 cabezas de atención, FFN de 2.048. Tokenizador GPT-2 BPE con vocabulario ampliado a 50.304.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional de estilo LLaMA: 12 capas con normalización RMSNorm en pre-norm, activación SwiGLU en la FFN, ausencia de sesgos en las proyecciones lineales, embeddings de entrada y salida atados, y atención con RoPE. El contexto se amplió de 1.024 a 4.096 tokens en la tercera etapa incrementando el RoPE theta de 10.000 a 100.000, técnica estándar de extensión de contexto sin reentrenar desde cero.

El entrenamiento se dividió en tres fases. La primera consumió 1,92B tokens de FineWeb-Edu (sample-10BT) en dos ejecuciones de 524.288 tokens por paso con PyTorch DDP sobre 2x T4 en fp16 con loss scaling: la ejecución 1 hizo 1.865 pasos desde cero con LR pico 1,2e-3, warmup de 200 pasos y decaimiento coseno hasta el 10 % (pérdida de validación final 3,43); la ejecución 2 continuó 1.796 pasos sobre datos no vistos partiendo de los pesos de la primera, con LR pico 6e-4 y un nuevo schedule coseno. Se usó AdamW (betas 0,9/0,95) con weight decay 0,1, y cada schedule se ajustó al límite de 12 horas por sesión de Kaggle cronometrando los primeros pasos. La tercera etapa partió de los pesos de la ejecución 2, subió el contexto a 4.096 tokens y entrenó 2.211 pasos de 262.144 tokens (580M tokens) con LR pico 3e-4 durante unas 8,5 horas, sobre una mezcla de 608M tokens en inglés sobre la India: Sangraha filtrado a temas indios (260M), artículos de Wikipedia en inglés relacionados con la India (100M) y archivos no vistos de FineWeb-Edu (247M) para limitar el olvido catastrófico.

No se documenta RLHF, DPO ni ninguna fase de alineación; es un modelo puramente preentrenado. Tampoco se mencionan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación y completado de texto en inglés: el modelo continúa un prompt de forma coherente a nivel local, sin formato conversacional.
- Razonamiento de superficie y conocimiento factual limitado: puede producir continuaciones plausibles sobre temas comunes, pero con alta tasa de afirmaciones fluidas pero incorrectas.
- Cobertura temática reforzada sobre la India: la tercera etapa de entrenamiento mejora explícitamente el modelado de texto en inglés sobre temas indios (pérdida de validación de 2,76 a contexto 4K).
- Manejo de contexto hasta 4.096 tokens, útil para completar documentos cortos o mantener coherencia dentro de un pasaje.
- No soporta tool calling ni function calling: no hay entrenamiento de instrucciones ni formato de herramientas.
- No soporta agentes ni razonamiento multi-paso: es un modelo base, sin capacidad de planificación entrenada.
- Multilingüismo: únicamente inglés; no se ha entrenado con corpus en otras lenguas.
- No dispone de modo thinking, visión ni audio.
- Existe una variante de chat separada (`somdevsheel/prajna-ai-124m-chat`) para seguimiento de instrucciones.

## Casos de uso

- Experimentación educativa y docencia: el modelo sirve para ilustrar el pipeline completo de preentrenamiento (tokenización, DDP, schedules de LR, extensión de contexto) con un coste de cómputo reproducible en GPUs gratuitas. Es adecuado porque su arquitectura es idéntica a la de LLaMA y su entrenamiento está documentado paso a paso.
- Ablaciones de arquitectura e hiperparámetros: al ser un modelo pequeño y de entrenamiento rápido, permite comparar variantes (RoPE theta, tamaño de FFN, warmup) en horas en lugar de semanas.
- Completado de texto en dominios acotados: puede usarse como generador de continuaciones en inglés sobre temática india o textos educativos, donde su pérdida de validación es más baja (2,76), siempre con revisión humana.
- Generación de datos sintéticos de bajo coste: útil para aumentar corpus de texto plano en inglés en pipelines de destilación o preentrenamiento de modelos mayores, dado que el throughput en T4 es alto para 124M de parámetros.
- Baseline para investigación en eficiencia: sirve como referencia de pérdida de validación (3,25 en FineWeb-Edu a 4K) frente a la que medir técnicas de poda, cuantización o destilación.
- Prototipado de infraestructura de inferencia: por su tamaño cabe en cualquier GPU consumer y permite validar despliegues con vLLM, llama.cpp o TGI antes de migrar a modelos mayores.
- Filtrado y scoring de texto: la perplejidad del modelo sobre pasajes en inglés puede usarse como señal de calidad o de dominio en pipelines de curación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta pérdidas de validación:

| Metrica | Contexto 1024 | Contexto 4096 |
|---|---|---|
| Pérdida de validación FineWeb-Edu (general) | 3,31 (3,26 antes de la extensión) | 3,25 (5,02 antes de la extensión) |
| Pérdida de validación inglés centrado en India | 2,82 (3,59 antes) | 2,76 (5,11 antes) |

Evolución de la pérdida de validación durante el preentrenamiento:

| Paso | 0 | 250 | 500 | 1000 | 1500 | 1864 | 2865 | 3365 | 3661 |
|---|---|---|---|---|---|---|---|---|---|
| Pérdida de validación | 10,97 | 4,88 | 4,05 | 3,65 | 3,48 | 3,43 | 3,38 | 3,32 | 3,30 |

Los pasos posteriores a 1864 corresponden a la ejecución de preentrenamiento continuado; la pérdida sube brevemente (3,48 en el paso 2115) al reiniciarse con un LR más alto y después cae por debajo de la ejecución 1.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en fp16 (123,6M parámetros × 2 bytes) más overhead de activaciones y caché KV; en la práctica, menos de 1 GB para contextos de 4K.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor lo entrenó en 2x NVIDIA T4 (16 GB cada una), y para inferencia una sola T4 es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier RTX (2060 o superior), GTX 1060 6GB, e incluso en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers (referencia del autor), vLLM, TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), llama.cpp y Ollama mediante conversión a GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada; por el tamaño, se espera un throughput muy alto (cientos a miles de tokens por segundo por GPU en batch), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Entrenamiento | Disponibilidad |
|---|---|---|---|---|---|
| prajna-ai-124m-base | 123,6M | 4.096 | Apache 2.0 | Desde cero, 1,92B + 580M tokens, 2x T4 | Hugging Face |
| GPT-2 small | 124M | 1.024 | MIT | Desde cero, WebText (~40 GB) | Hugging Face |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Desde cero, ~600B tokens (SmolLM-Corpus) | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Desde cero, 3T tokens | Hugging Face |

Frente a GPT-2 small, prajna-ai-124m-base ofrece el mismo orden de magnitud de parámetros con un contexto cuatro veces mayor y una arquitectura más moderna (RoPE, SwiGLU, RMSNorm), aunque con un volumen de entrenamiento muy inferior (unos 2,5B tokens frente a los aproximadamente 9B de GPT-2) y por tanto menor conocimiento del mundo. Frente a SmolLM-135M, el modelo de Hugging Face está entrenado con dos órdenes de magnitud más de tokens, por lo que su rendimiento en tareas de conocimiento y generación será previsiblemente superior, aunque no hay benchmarks públicos que lo confirmen. TinyLlama-1.1B es casi diez veces mayor y no es comparable en requisitos de hardware.

## Limitaciones y advertencias

- Conocimiento del mundo muy limitado: el autor indica que se entrenó con unos 20 tokens por parámetro en total, por debajo de lo compute-optimal, y que frecuentemente produce afirmaciones fluidas pero incorrectas.
- Riesgo alto de alucinación: al ser un modelo base sin alineación, no distingue entre hecho y ficción y no rechaza peticiones dañinas.
- Solo inglés: no comprende ni genera otras lenguas, a pesar de que parte del corpus trate sobre la India.
- No es un modelo de chat: no sigue instrucciones; para ello debe usarse la variante `prajna-ai-124m-chat`.
- Sin filtrado de seguridad más allá de los filtros propios de los datasets de origen (FineWeb-Edu, Sangraha, Wikipedia); puede reproducir sesgos presentes en esos corpus.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo carece de garantías y su calidad no es apta para producción sin supervisión humana.
- El contexto de 4.096 tokens se obtuvo por extensión con RoPE theta, no por entrenamiento nativo; la calidad en posiciones lejanas puede degradarse.
- La pérdida de validación en texto general subió ligeramente tras la etapa centrada en la India (3,26 a 3,31 a contexto 1K), lo que indica cierto olvido catastrófico parcial.
- No hay benchmarks estándar publicados, por lo que cualquier comparación de calidad es especulativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/somdevsheel/prajna-ai-124m-base
- Variante de chat: https://huggingface.co/somdevsheel/prajna-ai-124m-chat
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Sangraha: https://huggingface.co/datasets/ai4bharat/sangraha
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
