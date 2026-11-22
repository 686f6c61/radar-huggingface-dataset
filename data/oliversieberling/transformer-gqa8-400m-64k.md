# OliverSieberling/transformer-gqa8-400m-64k

## Resumen

Transformer 400M, 64k es un checkpoint de investigación publicado por Oliver Sieberling (con la colaboración de Bharat Runwal, David Jin, Ryan Chin, Rameswar Panda y Yoon Kim) asociado al artículo *Triadic Linear Attention: Three-Dimensional Recurrent States for Long-Context Sequence Modeling* (arXiv:2609.36529). Se trata de un modelo de lenguaje de 377 millones de parámetros con arquitectura transformer con atención linear de tipo gated delta net y atención por grupos (GQA con 8 cabezas de query y 1 de key-value), diseñado específicamente para explorar el modelado de secuencias largas.

El modelo parte de un preentrenamiento de 20.000 millones de tokens de FineWeb-Edu con una longitud de contexto de 4k, y posteriormente se extiende a 64k mediante un ajuste sobre 2.000 millones de tokens adicionales. Emplea el tokenizador de Llama-2 y está orientado exclusivamente al inglés. Su relevancia radica en que sirve como banco de pruebas reproducible para evaluar mecanismos de atención linear y estados recurrentes tridimensionales en contextos largos, con métricas publicadas de perplejidad en WikiText y PG19, además de tareas de recuperación (Recall) y de aguja en el pajar (NIAH).

Es un artefacto claramente orientado a investigación: no incluye pipeline declarado en Hugging Face, requiere código externo del repositorio del autor para cargarse y el propio autor indica que la inferencia necesita una GPU H100. No está pensado como modelo de producción, sino como referencia para estudiar el comportamiento de la atención linear en ventanas de hasta 64k tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención linear (gated delta net), GQA (8 query / 1 key-value heads), QK-norm, RoPE |
| Parametros totales | 377.019.392 (377,0 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64k tokens (preentrenado a 4k, extendido a 64k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, 1,5 GB de repo) |
| Capas | 24 |
| Dimensión del modelo (d_model) | 1024 |
| Tokenizador | Llama-2 |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer de 24 capas con d_model de 1024, normalización QK y embeddings rotatorios (RoPE), que incorpora atención linear basada en gated delta net junto con atención por grupos (GQA) de 8 cabezas de query por 1 de key-value. Esta combinación busca reducir el coste computacional y de memoria del mecanismo de atención clásico en secuencias largas, sustituyendo parte del cómputo cuadrático por un estado recurrente de dimensión tridimensional, tal como describe el artículo *Triadic Linear Attention: Three-Dimensional Recurrent States for Long-Context Sequence Modeling*.

El entrenamiento se realizó en dos fases: un preentrenamiento sobre 20.000 millones de tokens de FineWeb-Edu con contexto de 4k, seguido de una extensión de contexto hasta 64k sobre 2.000 millones de tokens adicionales. No se documentan en la información disponible detalles sobre RLHF, DPO u otras fases de alineación, ni sobre la composición exacta del dataset más allá de la mención a FineWeb-Edu. El checkpoint corresponde a la semilla 1337 según la model card.

## Capacidades

- Generación de texto autoregresiva en inglés, con tokenizador Llama-2.
- Modelado de secuencias largas de hasta 64k tokens gracias a la atención linear y a la extensión de contexto.
- Tareas de recuperación de información en contexto (evaluado con Recall y NIAH).
- Modelado de lenguaje de dominio general (evaluado en WikiText y PG19).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta modo thinking, visión ni audio.
- Capacidad de servir como base para investigación en mecanismos de atención linear y estados recurrentes.

## Casos de uso

- Investigación en atención linear: el modelo permite reproducir y comparar los resultados del artículo sobre gated delta net y estados recurrentes tridimensionales, sirviendo como referencia para nuevas variantes arquitectónicas.
- Evaluación de extensión de contexto: útil para estudiar cómo se degrada la perplejidad al pasar de 4k a 16k y a 64k tokens, con métricas publicadas en PG19 por tramos.
- Pruebas de recuperación en contexto largo: las tareas Recall y NIAH permiten medir la capacidad del modelo de localizar información en ventanas de 64k, un escenario habitual en pipelines de recuperación aumentada (RAG) con documentos extensos.
- Benchmark de eficiencia de atención: al ser un modelo pequeño (377 M) con atención linear, resulta adecuado para medir latencia y consumo de memoria frente a transformadores densos de tamaño similar en secuencias largas.
- Base para fine-tuning académico: su licencia MIT y su tamaño reducido facilitan experimentos de ajuste supervisado en tareas concretas de inglés con recursos limitados.
- Reproducibilidad de resultados: el checkpoint con semilla fijada (1337) permite replicar las cifras de la model card en entornos controlados, algo útil para validar implementaciones del código de TriadicLinearAttention.

## Benchmarks y rendimiento

Resultados publicados en la model card (semilla 1337):

| Métrica | Valor |
|---|---|
| 0-shot | 52,8 |
| WikiText (perplejidad) | 11,10 |
| PG19 ≤4k (perplejidad) | 15,38 |
| PG19 4k–16k (perplejidad) | 14,41 |
| PG19 16k–64k (perplejidad) | 13,91 |
| Recall | 41,2 |
| NIAH | 44,7 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni la definición exacta de la métrica "0-shot".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 377 M de parámetros en precisión completa (fp32) serían aproximadamente 1,5 GB de pesos, y en fp16/bf16 alrededor de 0,75 GB, a lo que habría que sumar el estado de atención linear y cachés según la implementación.
- GPU recomendadas: el autor indica explícitamente que se requiere una H100 para ejecutar el modelo con el código proporcionado.
- ¿Cabe en GPU de consumo? No confirmado por el autor; por tamaño de parámetros sería viable en GPUs de consumo con suficiente VRAM, pero la implementación de referencia está pensada para H100 y no se documenta compatibilidad con otras GPUs.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la única vía indicada es cargar los pesos con el código del repositorio TriadicLinearAttention.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Transformer 400M, 64k (este modelo) | 377 M | 64k | MIT | Hugging Face, requiere código externo |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; no se documenta soporte de otros idiomas.
- Riesgo de alucinación inherente a un modelo de 377 M preentrenado sin fases de alineación documentadas (RLHF/DPO no mencionados).
- No se documentan sesgos conocidos, pero al entrenarse sobre FineWeb-Edu pueden heredarse sesgos del corpus web filtrado.
- La licencia MIT permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de calidad para producción.
- La carga del modelo requiere código externo (repositorio TriadicLinearAttention) y el autor indica que se necesita una H100; no hay pipeline estándar de Hugging Face ni soporte documentado para runtimes habituales.
- Sin datos publicados sobre cuantización, lo que limita el despliegue en entornos con VRAM reducida.
- El contexto de 64k se alcanzó con solo 2.000 millones de tokens de extensión, por lo que el rendimiento en el extremo superior de la ventana puede degradarse (el Recall de 41,2 y el NIAH de 44,7 sugieren margen de mejora en recuperación).
- Sin descargas ni validación comunitaria (0 descargas, 0 likes), lo que reduce la confianza en su robustez fuera del entorno del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OliverSieberling/transformer-gqa8-400m-64k
- Artículo (arXiv): https://arxiv.org/abs/2609.36529
- Repositorio de código: https://github.com/OliverSieberling/TriadicLinearAttention
