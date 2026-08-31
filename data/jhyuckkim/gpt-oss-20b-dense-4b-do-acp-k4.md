# jhyuckkim/GPT-OSS-20B-Dense-4B-DO-ACP-K4

## Resumen

GPT-OSS-20B-Dense-4B-DO-ACP-K4 es un modelo de lenguaje denso de 4,19 mil millones de parámetros obtenido mediante poda y destilación del modelo MoE GPT-OSS-20B de OpenAI. Lo desarrolla jhyuckkim, en el contexto del proyecto krafton-ai, como artefacto de investigación para el artículo *Pruning and Distilling Mixture-of-Experts into Dense Language Models* (arXiv:2605.28207). El objetivo es estudiar cómo convertir un modelo de mezcla de expertos (MoE) en un modelo denso equivalente, comparando métodos de puntuación de expertos bajo un presupuesto de destilación fijo y muy reducido (0,3 mil millones de tokens). No se trata de un modelo de propósito general: carece de ajuste por instrucciones y de alineación, y su rendimiento absoluto es muy inferior al del profesor y al de modelos preentrenados del mismo tamaño.

La arquitectura conserva las características propias de GPT-OSS (activación con puerta, sesgos por capa, atención de ventana deslizante y YaRN RoPE) pero con `num_local_experts=1`, lo que lo convierte en un modelo denso. Está disponible bajo licencia Apache 2.0, en formato safetensors, y su repositorio ocupa 8,4 GB. Es el mejor estudiante GPT-OSS del paper según la media de cinco benchmarks de razonamiento y conocimiento, aunque con márgenes pequeños sobre las líneas base aleatorias debido a la limitada redundancia de los 32 expertos del profesor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GptOssForCausalLM (denso, derivado de MoE con `num_local_experts=1`) |
| Parametros totales | 4.185.089.880 (4,19 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del teacher GPT-OSS-20B, sin especificar) |
| Tipos de cuantizacion | No disponible (solo safetensors en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un estudiante denso obtenido podando y destilando el teacher MoE GPT-OSS-20B. La poda selecciona los 4 expertos más relevantes de cada capa (K=4) mediante el método DO-ACP (una variante de scoring de expertos), y posteriormente se fusionan en un único "experto" denso, manteniendo la activación con puerta, los sesgos por capa, la atención de ventana deslizante y el YaRN RoPE del modelo original. La destilación se realizó sobre 0,3 mil millones de tokens del dataset FineWeb-Edu (muestra `sample-10BT`), un presupuesto deliberadamente pequeño para permitir comparaciones justas entre métodos de selección de expertos. No se aplicó ajuste por instrucciones, RLHF ni ningún tipo de alineación.

El proceso de entrenamiento se describe en el paper como una destilación pura, con escalado uniforme de la proyección descendente. La configuración exacta (número de capas, dimensiones ocultas, etc.) no se detalla en la model card, pero se puede cargar con la clase `GptOssForCausalLM` de Transformers, no con una clase densa genérica.

## Capacidades

- Generación de texto en modo completado (completion mode), sin soporte de plantilla de chat.
- Razonamiento básico y conocimiento factual limitado, según los benchmarks reportados (p. ej., MMLU 5-shot de 23,7).
- No se menciona soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; probablemente limitadas al inglés por el dataset de destilación.
- No incluye modo de pensamiento, visión ni audio.
- Es un artefacto de investigación: su utilidad práctica como asistente conversacional es nula por diseño.

## Casos de uso

- Reproducción de experimentos del paper: permite verificar los resultados de la poda y destilación con la configuración DO-ACP, K=4, usando el código oficial del repositorio.
- Investigación en compresión de modelos: sirve como punto de comparación para estudiar la degradación de rendimiento al convertir un MoE de 20B en un denso de 4B con un presupuesto de destilación mínimo.
- Evaluación de métodos de puntuación de expertos: al compararlo con los estudiantes SF, CP y ACP (también publicados), se puede analizar qué técnica de selección de expertos preserva mejor el conocimiento.
- Análisis de la transferencia de conocimiento en destilación: permite estudiar qué capacidades del teacher se conservan y cuáles se pierden al reducir la arquitectura a un solo experto.
- Desarrollo de nuevas técnicas de poda: los pesos y la configuración pueden servir como punto de partida para experimentos con otros métodos de fusión o escalado.
- Benchmarking de eficiencia de inferencia: al ser un modelo denso de 4B, se puede medir su latencia y throughput frente al teacher MoE en hardware de consumo, aunque no es su propósito principal.

## Benchmarks y rendimiento

La model card reporta resultados en cinco benchmarks de razonamiento y conocimiento, evaluados en modo completado. La tabla siguiente muestra la comparación con otras configuraciones del mismo paper y con el teacher.

| Configuracion | WinoGradE | HellaSwag | ARC-Easy | ARC-Challenge | MMLU (5-shot) | Avg |
|---|---|---|---|---|---|---|
| SF, K=4 | 51.6 | 29.4 | 34.0 | 22.4 | 23.3 | 32.15 |
| SF, K=8 | 51.6 | 29.3 | 33.3 | 21.7 | 22.8 | 31.72 |
| CP, K=4 | 50.9 | 30.4 | 36.4 | 23.0 | 23.6 | 32.86 |
| CP, K=8 | 49.7 | 29.3 | 32.2 | 23.2 | 23.1 | 31.49 |
| ACP, K=4 | 53.0 | 31.9 | 35.6 | 23.0 | 23.3 | 33.36 |
| ACP, K=8 | 53.1 | 30.5 | 33.6 | 23.3 | 23.7 | 32.82 |
| **DO-ACP, K=4 (este modelo)** | **53.0** | **32.1** | **36.7** | **23.2** | **23.7** | **33.71** |
| DO-ACP, K=8 | 51.3 | 29.9 | 33.5 | 22.5 | 23.3 | 32.11 |
| Random FFN + teacher attn | 50.2 | 27.5 | 28.5 | 23.0 | 23.2 | 30.46 |
| Random initialization | 50.0 | 26.0 | 25.8 | 25.3 | 23.0 | 30.02 |
| Teacher (GPT-OSS-20B) | 59.3 | 39.9 | 80.9 | 53.7 | 49.6 | 56.67 |

Nota: el teacher se evaluó en modo completado para mantener consistencia con los estudiantes, lo que subestima su capacidad real (MMLU 72% con plantilla de chat). No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 8,4 GB. Con activaciones y memoria intermedia, se recomienda al menos 12 GB de VRAM para una ejecución cómoda en modo de precisión completa.
- GPU recomendadas: tarjetas de consumo con 12-16 GB (RTX 3060, RTX 4070, RTX 4080) o profesionales (A10, A100, H100). No se han probado cuantizaciones oficiales, por lo que el consumo real puede variar.
- En consumer GPU: sí, cabe en GPUs de 12 GB o más, aunque sin cuantización el margen es ajustado.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede ejecutarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI, pero no se proporcionan configuraciones oficiales.
- Latencia y throughput: no disponibles. Al ser un modelo denso de 4B, se espera una latencia moderada en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

La comparación más directa es con los otros estudiantes densos del mismo paper, todos derivados de GPT-OSS-20B con el mismo presupuesto de destilación. También se puede comparar con el teacher original.

| Modelo | Parametros | Contexto | MMLU (5-shot) | Avg 5 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GPT-OSS-20B-Dense-4B-DO-ACP-K4 (este) | 4,19 B | No disponible | 23.7 | 33.71 | Apache-2.0 | HuggingFace |
| GPT-OSS-20B-Dense-4B-SF-K4 | 4,19 B | No disponible | 23.3 | 32.15 | Apache-2.0 | HuggingFace |
| GPT-OSS-20B-Dense-4B-CP-K4 | 4,19 B | No disponible | 23.6 | 32.86 | Apache-2.0 | HuggingFace |
| GPT-OSS-20B (teacher) | 20,9 B (MoE) | 128k (según OpenAI) | 49.6 (completion) / 72 (chat) | 56.67 | Apache-2.0 | OpenAI / HuggingFace |

No se dispone de comparaciones con otros modelos densos de ~4B (como Qwen2.5-4B o Llama-3.2-3B) porque el paper no las incluye y el modelo no está pensado para uso general.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de propósito general; su rendimiento en tareas reales es muy pobre y no debe usarse como asistente.
- Sin ajuste por instrucciones ni alineación: no responde a prompts conversacionales de forma útil.
- Presupuesto de destilación extremadamente bajo (0,3 B tokens): limita gravemente la calidad del conocimiento adquirido.
- Sesgos del dataset FineWeb-Edu: al estar entrenado solo con datos web filtrados, puede reflejar sesgos presentes en ese corpus.
- Riesgo de alucinación alto debido a la baja capacidad de razonamiento y conocimiento factual limitado.
- Longitud de contexto no confirmada: aunque hereda la arquitectura del teacher, no se ha verificado que soporte los 128k tokens de GPT-OSS-20B.
- Sin cuantizaciones oficiales: solo se distribuye en bfloat16, lo que puede complicar su despliegue en hardware con poca VRAM.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción por su baja calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhyuckkim/GPT-OSS-20B-Dense-4B-DO-ACP-K4
- Paper: https://arxiv.org/abs/2605.28207
- Codigo del proyecto: https://github.com/krafton-ai/moe-to-dense
- Modelos relacionados: [SF-K4](https://huggingface.co/jhyuckkim/GPT-OSS-20B-Dense-4B-SF-K4), [CP-K4](https://huggingface.co/jhyuckkim/GPT-OSS-20B-Dense-4B-CP-K4)
- Teacher original: https://openai.com/index/introducing-gpt-oss/
