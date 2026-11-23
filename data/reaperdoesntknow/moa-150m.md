# reaperdoesntknow/MoA-150M

## Resumen

MoA-150M (también referido en su model card como MoA-Metric-LM-150M) es un modelo de lenguaje causal compacto de aproximadamente 150 millones de parámetros desarrollado por el usuario reaperdoesntknow. Su propuesta diferencial no es el tamaño, sino la sustitución de la atención por producto escalar estándar por una atención "métrica" que puntúa las relaciones entre tokens mediante distancias (L2, coseno o Mahalanobis diagonal), junto con un bloque Mixture-of-Architectures (MoA) que enruta cada token entre cuatro cabezas especializadas.

El modelo incorpora BlackHoleRoPE, una variante aprendible de RoPE que rota Q/K con módulo unitario y aplica una compuerta de energía acotada a V, además de un regularizador basado en la desigualdad triangular para mantener coherente la geometría de las cabezas métricas. Está diseñado para entrenar y ejecutar en hardware modesto, con FP32 en CPU (AVX2/AVX-512) como escenario de referencia, y es compatible con la librería transformers.

Su relevancia actual es fundamentalmente investigadora: sirve como banco de pruebas reproducible para estudiar atención basada en distancias, enrutado por token y codificaciones posicionales alternativas en un presupuesto de cómputo muy reducido. No compite en capacidad general con modelos de su mismo tamaño entrenados a escala; su presupuesto de entrenamiento es de cientos de miles de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención métrica (L2/coseno/Mahalanobis diagonal) y bloque MoA (LocalConv, MetricMHAttention, ChannelMix, MetricMQA) |
| Parametros totales | ~150 M (el conteo exacto depende del vocabulario; ver config.json) |
| Parametros activos | No aplica (no es MoE denso disperso; el MoA enruta cabezas, no expertos FFN) |
| Longitud de contexto | Entrenado principalmente a 512-1024 tokens; la configuración permite hasta 2048 |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales; la model card indica soporte de inferencia en FP32/BF16/FP16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors/PyTorch vía transformers (repo de 2,5 GB); no se documenta GGUF |

## Arquitectura y entrenamiento

El núcleo es un transformer causal de 12 a 24 capas (según variante) con tamaño oculto no especificado para la variante de 150 M. Cada bloque MoA contiene cuatro cabezas que un router por token mezcla de forma suave: una convolución depthwise local (LocalConv), atención multi-cabeza métrica (MetricMHAttention), un MLP de mezcla de canales (ChannelMix) y atención multi-query métrica con K/V compartidas (MetricMQA). La FFN se denomina HyperFFN y combina un MLP SwiGLU, una SepConv1d y una ruta de bajo rango, también mezcladas por el router. Las puntuaciones de atención métrica se calculan como -||q-k||²/sqrt(d) para L2, coseno normalizado y escalado, o Mahalanobis diagonal por cabeza, con un escalado aprendible α y una máscara opcional de poda por radio.

BlackHoleRoPE aplica rotaciones de módulo unitario solo a Q/K (preservando normas) y una amplificación de energía acotada entre energy_min y energy_max a V, con parámetros sintetizados desde una base de Fourier pequeña para reducir el coste de caché y favorecer la generalización en longitud. El entrenamiento se realizó en FP32 sobre CPU con AdamW/Adam, batch de 2-4 y secuencias de 512-1024, sobre los datasets WeMake/Intelligent-Content-Understanding (~256k tokens), QingyiSi/Alpaca-CoT (~128k tokens), HuggingFaceH4/MATH-500 (~256k tokens), zai-org/LongWriter-6k (~128k tokens) y m-a-p/DeepWriting-20K, más una fase de SFT con prithivMLmods/Deepthink-Reasoning (loss final reportada de 0,3200 sobre 128.512 tokens). No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto causal en inglés con transformers.
- Razonamiento de estilo matemático paso a paso (el ejemplo de la model card usa una ecuación lineal).
- Lectura y QA sobre contexto, con ventana entrenada de 512-1024 tokens y configuración hasta 2048.
- Escritura y generación de contenido largo, dado el uso de LongWriter-6k y DeepWriting-20K en el entrenamiento.
- Instrucción conversacional vía SFT (Alpaca-CoT y Deepthink-Reasoning).
- Inferencia en CPU en FP32, así como FP32/BF16/FP16 en GPU.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación en atención métrica: reproducir y ablacionar las cabezas L2, coseno y Mahalanobis diagonal en un modelo de 150 M que entrena en CPU, comparando estabilidad y eficiencia de muestra frente a atención por producto escalar.
- Estudio de enrutado por token: analizar cómo el TokenRouter distribuye pesos entre LocalConv, MetricMH, ChannelMix y MetricMQA en distintas fases del entrenamiento y con distintos datos.
- Experimentos de codificación posicional: evaluar la extrapolación de BlackHoleRoPE más allá de 1024 tokens frente a RoPE estándar, con presupuesto de cómputo reducido.
- Prototipado de asistentes compactos en inglés: desplegar un modelo pequeño en CPU para tareas de respuesta breve y generación de texto donde la latencia y el coste importan más que la precisión factual.
- Educación y demos: ejecutar ejemplos de razonamiento matemático elemental y QA en portátiles sin GPU, usando el snippet de transformers de la model card.
- Generación de texto creativo y redacción asistida en inglés, aprovechando el entrenamiento sobre LongWriter-6k y DeepWriting-20K, con revisión humana obligatoria.
- Base para fine-tuning ligero: punto de partida Apache-2.0 para SFT sobre dominios concretos con presupuesto de GPU consumer o incluso CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una loss final de SFT de 0,3200 sobre 128.512 tokens en prithivMLmods/Deepthink-Reasoning, sin métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: ~0,6 GB en FP16/BF16 y ~1,2 GB en FP32 para los pesos de 150 M; el repo ocupa 2,5 GB, por lo que conviene revisar qué artefactos incluye antes de descargarlo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve; A100, H100, RTX 4090, RTX 3090 o RTX 3060 son sobradas para inferencia. El escenario de referencia del autor es CPU con AVX2/AVX-512 en FP32.
- Cabe holgadamente en GPU consumer, incluidas GTX 1650 o iGPU con memoria compartida suficiente.
- Opciones de despliegue: transformers con accelerate (documentado), pipeline de transformers; no se documenta soporte oficial de vLLM, llama.cpp, Ollama ni TGI, y al no publicarse GGUF la ruta llama.cpp requeriría conversión propia.
- Latencia y throughput: no disponibles. El autor solo indica que el modelo está implementado para comportarse bien en FP32 sobre AVX2/AVX-512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MoA-150M | ~150 M | 512-1024 entrenado, 2048 en config | Apache-2.0 | Atención métrica y MoA; entrenamiento de cientos de miles de tokens; sin benchmarks publicados |
| SmolLM2-135M | 135 M | 8192 | Apache-2.0 | Transformer estándar entrenado a escala de billones de tokens; benchmarks publicados |
| Qwen2.5-0.5B | 494 M | 32768 | Apache-2.0 | Mayor tamaño y contexto; entrenamiento a gran escala y benchmarks publicados |
| GPT-2 small | 124 M | 1024 | MIT | Referencia histórica de tamaño similar; sin instrucción nativa |

La comparación es estructural: MoA-150M no publica métricas que permitan situarlo frente a SmolLM2-135M o Qwen2.5-0.5B en calidad, y su presupuesto de entrenamiento es órdenes de magnitud menor. Su interés es arquitectónico, no de rendimiento competitivo.

## Limitaciones y advertencias

- Presupuesto de entrenamiento muy reducido (cientos de miles de tokens), lo que implica una calidad general muy por debajo de modelos del mismo tamaño entrenados a escala; no es apto para QA factual a escala web.
- El autor declara explícitamente que no está pensado para usos críticos de seguridad ni dominios que requieran precisión garantizada.
- Riesgo elevado de alucinación y de respuestas incoherentes fuera de los dominios de entrenamiento.
- Solo inglés; no hay soporte multilingüe documentado.
- Contexto efectivo limitado a 512-1024 tokens en entrenamiento; la extrapolación a 2048 depende de los datos y del hardware y no está validada con métricas.
- La model card menciona posibles NaN/Inf durante el muestreo si las máscaras no son aditivas (0/-inf) o si no se hace clamp de logits en filas totalmente enmascaradas; conviene revisar la implementación de atención antes de desplegar.
- No se documentan sesgos evaluados ni filtros de seguridad; el modelo no tiene alineamiento más allá del SFT sobre Deepthink-Reasoning.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de garantías y de evaluaciones hace desaconsejable su uso en producción sin validación propia.
- La model card mezcla referencias a una variante de 400 M (por ejemplo, en el ejemplo de pipeline con MoA-400M), lo que puede generar confusión sobre los artefactos reales del repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/MoA-150M
- Dataset WeMake/Intelligent-Content-Understanding: https://huggingface.co/datasets/WeMake/Intelligent-Content-Understanding
- Dataset QingyiSi/Alpaca-CoT: https://huggingface.co/datasets/QingyiSi/Alpaca-CoT
- Dataset HuggingFaceH4/MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset zai-org/LongWriter-6k: https://huggingface.co/datasets/zai-org/LongWriter-6k
- Dataset m-a-p/DeepWriting-20K: https://huggingface.co/datasets/m-a-p/DeepWriting-20K
- Dataset prithivMLmods/Deepthink-Reasoning: https://huggingface.co/datasets/prithivMLmods/Deepthink-Reasoning
