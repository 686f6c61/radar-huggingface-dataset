# hermitdave/Spark-X2.6-1.7B-MLX-slq-4.5bpw

## Resumen

Spark-X2.6-1.7B-MLX-slq-4.5bpw es una compilación cuantizada del modelo XHToken/Spark-X2.6-1.7B, publicada por el usuario hermitdave. No se trata de un modelo nuevo, sino de una conversión de pesos a formato MLX con cuantización mixta SLQ (Statistically-Lossless Quantization), pensada para su ejecución eficiente en hardware Apple Silicon. El modelo base pertenece a la familia Spark, desarrollada por el equipo SparkLLM, y emplea una arquitectura transformer con atención híbrida (ventana deslizante y atención completa) y proyección QKV fusionada.

El artefacto empaquetado ocupa 1,296 GiB en disco con una media de 4,50 bits por peso, frente a los 3,205 GiB del modelo base en BF16, lo que supone una reducción de 2,47 veces. El modelo cuenta con 493.364.224 parámetros reales según los safetensors, aunque la denominación comercial "1.7B" del modelo base no coincide con este recuento. La licencia es Apache 2.0, heredada del modelo original.

Su relevancia radica en la validación empírica que acompaña a la publicación: se documentan métricas de perplejidad, recuperación en tareas zero-shot y throughput medido en un Apple M3 Max, lo que permite evaluar el coste real de la cuantización a 4,5 bpw en lugar de asumir una pérdida de calidad no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (21 capas de ventana deslizante de 512 + 7 capas de atención completa), QKV fusionada, puertas sigmoideas por cabeza, MLP GELU paralelo |
| Parametros totales | 493.364.224 (según safetensors del artefacto cuantizado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la ventana deslizante es de 512 tokens; el contexto máximo no se especifica) |
| Tipos de cuantizacion | SLQ mixta: 8 bits (16,7 %, todas las `g_proj`), 5 bits (51,8 %), 4 bits (31,5 %); grupo de 128; 4,4989 bpw efectivos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors), escalas y ceros en float16 |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-1.7B sigue el mismo patrón de atención híbrida que Spark-X2.5-1.7B: 28 capas en total, de las cuales 21 usan atención de ventana deslizante con ventana de 512 tokens y 7 usan atención completa. La dimensión oculta es 2048, con 8 cabezas de atención y 2 cabezas KV, dimensión de cabeza 256 y vocabulario de 131.072 tokens con embeddings atados. Incorpora una proyección QKV fusionada (`self_attn.q_k_v_proj`) y puertas sigmoideas de salida de atención por cabeza (`self_attn.g_proj`), además de un MLP GELU paralelo con dimensión intermedia 6656.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación técnica documentada en esta publicación es la cuantización SLQ: un asignador heurístico voraz por capa que distribuye bits entre 4, 5 y 8 según la sensibilidad de cada capa, con escalas y ceros en float16 y fallback automático a float32 si se excede el rango seguro de float16 (±65.504). En este modelo, las 168 capas empaquetadas usaron float16 sin necesidad de fallback (escala máxima 0,18; cero máximo −1,61).

## Capacidades

- Generación de texto autoregresiva en el modelo base, sujeta a la ventana de contexto efectiva de la arquitectura.
- Razonamiento básico y respuesta a preguntas, evaluado de forma indirecta mediante las tareas arc_challenge, arc_easy, hellaswag y winogrande.
- Capacidad multilingüe: no documentada; el vocabulario de 131.072 tokens sugiere cobertura amplia, pero no se confirma.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponible.
- Ejecución optimizada en Apple Silicon mediante MLX, con decodificación a 157,5 tok/s en M3 Max según la medición del autor.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: el artefacto ocupa 1,296 GiB en disco y unos 1,4 GiB en tiempo de ejecución, por lo que cabe holgadamente en equipos Apple Silicon de 16 GB o más, permitiendo desplegar un modelo de casi 500 millones de parámetros sin cuantización adicional.
- Prototipado rápido de aplicaciones de texto en entornos de desarrollo sobre macOS: la integración con `mlx-lm` permite cargar el modelo y generar con unas pocas líneas de Python, lo que acelera la iteración en pruebas de concepto.
- Evaluación comparativa de técnicas de cuantización: al publicarse junto con métricas de perplejidad y recuperación por tarea, sirve como referencia reproducible para estudiar el compromiso entre tamaño y calidad a 4,5 bpw.
- Generación de texto de baja latencia en dispositivos: los 157,5 tok/s medidos en M3 Max lo hacen adecuado para aplicaciones interactivas donde la respuesta debe aparecer casi instantáneamente, como autocompletado o asistentes de escritura locales.
- Tareas de clasificación y elección múltiple vía zero-shot: los resultados en arc y hellaswag indican que el modelo conserva capacidad suficiente para evaluaciones de conocimiento general, útil en pipelines de filtrado o anotación semiautomática.
- Educación e investigación sobre cuantización: el desglose de distribución de bits por capa y el análisis de escalas en float16 permiten estudiar el comportamiento de SLQ en modelos pequeños con atención híbrida.

## Benchmarks y rendimiento

Perplejidad en FineWeb-Edu (32 × 1024 tokens):

| Modelo | PPL | Ratio |
|---|---|---|
| BF16 base | 1,4836 | 1,000 |
| SLQ 4,50 bpw | 1,5609 | 1,052 |

Recuperación zero-shot (100 ejemplos por tarea, emparejados):

| Tarea | BF16 | SLQ | Recuperación | IC 95 % |
|---|---|---|---|---|
| arc_challenge | 0,3300 | 0,3300 | 1,0000 | [−0,0480, +0,0480] |
| arc_easy | 0,5200 | 0,5100 | 0,9808 | [−0,0859, +0,0659] |
| hellaswag | 0,3400 | 0,3600 | 1,0588 | [−0,0192, +0,0592] |
| winogrande | 0,5000 | 0,4200 | 0,8400 | [−0,1677, +0,0077] |
| Media | — | — | 0,9699 | — |

Throughput medido en Apple M3 Max (64 GB), MLX 0.32.4, 128 tokens nuevos, temperatura 0,0:

| Modelo | Tokens generados | Tiempo | Throughput |
|---|---|---|---|
| BF16 base | 127 | 1,57 s | 81,0 tok/s |
| SLQ 4,50 bpw | 128 | 0,81 s | 157,5 tok/s |

El autor concluye que el modelo no es task-lossless según el umbral del 0,99 del artículo de referencia (media 0,97), y que el aumento de perplejidad del 5,2 % es coherente con el régimen Task-Lossless descrito en dicho trabajo.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 1,4 GiB en tiempo de ejecución según el autor.
- GPU recomendadas: Apple Silicon con MLX; el autor midió en un M3 Max de 64 GB. No se documentan requisitos para GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: el tamaño reducido permite ejecución en Mac con memoria unificada de 16 GB o superior; no se confirma soporte en GPU de consumo NVIDIA.
- Opciones de despliegue: `mlx-lm` (requerido), con `mlx_lm.generate` y API Python `load`/`generate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 157,5 tok/s en M3 Max con MLX 0.32.4 y kernels sin fusionar; el autor indica que los kernels fusionados de `spark-mlx-ext` no estaban instalados, por lo que el rendimiento podría mejorar con ellos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-MLX-slq-4.5bpw | 493.364.224 | No disponible (ventana deslizante 512) | SLQ 4,50 bpw | Apache 2.0 | MLX safetensors |
| XHToken/Spark-X2.6-1.7B (base) | No disponible | No disponible | BF16 | Apache 2.0 | Safetensors |
| Spark-X2.5-1.7B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento cuantitativa más allá de la que ofrece el propio autor frente al BF16 base.

## Limitaciones y advertencias

- La cuantización no es task-lossless: la recuperación media es 0,9699, por debajo del umbral 0,99, con una caída notable en winogrande (0,84 de recuperación) y un intervalo de confianza que cruza cero.
- La perplejidad aumenta un 5,2 % respecto al BF16, lo que puede afectar a tareas sensibles a la distribución exacta del lenguaje.
- El modelo está empaquetado exclusivamente para MLX; no es utilizable directamente en ecosistemas como Transformers, vLLM o llama.cpp sin conversión adicional.
- La información sobre idiomas soportados no está disponible, lo que impide garantizar un rendimiento multilingüe equilibrado.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni evaluaciones de seguridad.
- El recuento real de parámetros (493 millones) difiere de la denominación comercial "1.7B" del modelo base, lo que puede inducir a error al estimar capacidades.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de las herramientas de conversión (`slq-mlx`, `Spark-MLX-LLM`).
- El throughput reportado corresponde a un único hardware y configuración; no se garantiza en otros equipos.

## Enlaces

- [HuggingFace: hermitdave/Spark-X2.6-1.7B-MLX-slq-4.5bpw](https://huggingface.co/hermitdave/Spark-X2.6-1.7B-MLX-slq-4.5bpw)
- [Modelo base: XHToken/Spark-X2.6-1.7B](https://huggingface.co/XHToken/Spark-X2.6-1.7B)
- [Repositorio de cuantización: slq-mlx](https://github.com/hermitdave/slq-mlx)
- [Soporte de arquitectura: Spark-MLX-LLM](https://github.com/XHToken/Spark-MLX-LLM)
- [Hermes Agent (Nous Research)](https://hermes-agent.nousresearch.com/)
