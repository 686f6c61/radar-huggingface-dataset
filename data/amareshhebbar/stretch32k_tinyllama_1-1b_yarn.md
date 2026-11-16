# AmareshHebbar/Stretch32K_TinyLlama_1.1B_YARN

## Resumen

Stretch32K YARN es un ajuste fino de TinyLlama 1.1B orientado a extender la ventana de contexto de 2048 a 16384 tokens (un factor de 8x) mediante YaRN (Yet another RoPE extensioN) combinado con entrenamiento completo sobre libros largos de PG19. Lo desarrolla AmareshHebbar como parte de la colección Stretch32K, que agrupa seis variantes del mismo modelo base entrenadas con distintos métodos de extensión de contexto y evaluadas con el mismo protocolo, lo que permite una comparación controlada entre técnicas.

El problema que aborda es concreto: TinyLlama v1.1 fue entrenado con 2048 tokens y su perplejidad se dispara hasta 3721,80 a 16384 tokens sin escalado. Este modelo reduce esa cifra a 12,85, prácticamente la misma que el modelo base a 2048 tokens (12,46), lo que demuestra que el ajuste fino con YaRN preserva la calidad del modelado del lenguaje a lo largo de toda la ventana extendida.

Es relevante porque demuestra que es posible extender el contexto de un modelo de 1.1B parámetros con un único GPU, 150 pasos de entrenamiento y técnicas de ahorro de memoria (FlashAttention, gradient checkpointing, chunked loss), y porque publica una evaluación comparativa honesta frente a alternativas sin entrenamiento como NTK-aware scaling, position interpolation o YaRN aplicado solo en carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), RoPE con YaRN |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16384 tokens (original 2048, factor 8x) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin GGUF oficial) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| rope_scaling | {'rope_type': 'yarn', 'factor': 8.0, 'original_max_position_embeddings': 2048} |
| rope_theta | 10000.0 |
| Tamano del repo | 2.2 GB |

## Arquitectura y entrenamiento

El modelo parte de TinyLlama/TinyLlama_v1.1, un transformer decoder-only de 1.1B parámetros con atención causal estándar y embeddings rotatorios (RoPE). La innovación está en el escalado de RoPE: YaRN divide las frecuencias en bandas, deja intactas las altas, interpola completamente las bajas y aplica una rampa suave entre ambas, además de una corrección de temperatura de atención para secuencias largas. El factor de escalado es 8.0 sobre una ventana original de 2048 tokens, con `max_position_embeddings` guardado a 16384.

El ajuste fino es completo (todos los parámetros entrenables) sobre chunks largos de libros de PG19 del dataset AmareshHebbar/Stretch32K_Data_TinyLlama_1.1B. Los hiperparámetros clave: `seq_len` 16384, 150 pasos, `grad_accum` 4, learning rate 2e-05 (2e-04 para LoRA, aunque el entrenamiento es full fine-tuning), 15 pasos de warmup, `logits_chunk` 1024, `s2_group` 4096 y `stretch_factor` 8.0. Para que cupiera en un solo GPU se usaron kernels FlashAttention de PyTorch, gradient checkpointing, cálculo de la pérdida por chunks sobre el vocabulario y empaquetado de secuencias sin padding.

## Capacidades

- Generación de texto autoregresiva en inglés con ventana efectiva de hasta 16384 tokens.
- Modelado de lenguaje de largo alcance: perplejidad estable (11,21 a 1024 tokens, 12,85 a 16384) frente al colapso del modelo base sin escalado.
- Recuperación de información (passkey retrieval) con precisión del 74,0% agregada en todas las longitudes y 56,7% más allá de 2048 tokens.
- Needle in a haystack sobre texto real de libros con una media de cuadrícula del 86,0%.
- Tareas RULER con múltiples claves y valores y seguimiento de variables: 22,5% en el subconjunto evaluado.
- Respuesta a preguntas sobre documentos largos (LongAlpaca answer NLL de 1,780, la mejor de la comparativa).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Resumen de documentos largos: el modelo puede procesar contratos, informes o capítulos completos de hasta 16384 tokens en una sola pasada, evitando pipelines de retrieval que fragmentan el contexto y pierden relaciones entre secciones.
- Preguntas y respuestas sobre libros o expedientes: con un NLL de respuesta de 1,780 en LongAlpaca, es adecuado para tareas extractivas y generativas sobre documentos que caben en la ventana, con la salvedad de que la precisión de recuperación decae a 16384 tokens.
- Prototipado de aplicaciones de contexto largo en hardware modesto: al ser un modelo de 1.1B parámetros (2.2 GB en safetensors), se puede ejecutar en GPUs de consumo para validar ideas antes de escalar a modelos mayores.
- Investigación sobre extensión de contexto: sirve como referencia reproducible para comparar YaRN con position interpolation, NTK-aware scaling o dynamic NTK bajo el mismo dataset y protocolo de evaluación.
- Análisis de narrativa o literatura: el entrenamiento sobre PG19 lo hace apropiado para tareas de continuación, análisis de estilo o extracción de tramas en textos literarios largos.
- Generación aumentada por recuperación con contexto extenso: puede recibir varios documentos recuperados a la vez (hasta 16K tokens) y sintetizar respuestas, reduciendo la necesidad de reordenar y truncar fragmentos.
- Evaluación de técnicas de RoPE scaling en entornos docentes o de investigación: la colección Stretch32K ofrece seis variantes comparables con métricas publicadas.

## Benchmarks y rendimiento

Perplejidad en libros de test de PG19 y tareas de recuperación (datos de la model card):

| Modelo | PPL @ 1024 | PPL @ 16384 | Passkey (todas) | Passkey >2048 | Needle (media) | RULER subset | Long score | LongAlpaca NLL |
|---|---|---|---|---|---|---|---|---|
| TinyLlama 1.1B (sin escalado) | 10,96 | 3721,80 | 40,0 | 0,0 | 32,0 | 18,3 | 30,1 | 8,384 |
| TinyLlama 1.1B (position interpolation, sin entrenar) | 216,36 | 235,46 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 5,524 |
| TinyLlama 1.1B (NTK-aware, sin entrenar) | 12,28 | 175,63 | 70,0 | 50,0 | 52,0 | 15,6 | 45,9 | 3,930 |
| TinyLlama 1.1B (YaRN, sin entrenar) | 12,01 | 18,65 | 70,0 | 53,3 | 50,0 | 11,4 | 43,8 | 2,286 |
| TinyLlama 1.1B (dynamic NTK, sin entrenar) | 10,96 | 68,38 | 66,0 | 43,3 | 46,0 | 23,3 | 45,1 | 4,172 |
| Stretch32K PI | 18,09 | 16,91 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 2,222 |
| Stretch32K YARN | 11,21 | 12,85 | 74,0 | 56,7 | 86,0 | 22,5 | 60,8 | 1,780 |

Perplejidad por longitud de contexto:

| Modelo | 1024 | 2048 | 4096 | 8192 | 16384 |
|---|---|---|---|---|---|
| TinyLlama 1.1B (sin escalado) | 10,96 | 12,46 | 391,10 | 2008,73 | 3721,80 |
| TinyLlama 1.1B (YaRN, sin entrenar) | 12,01 | 14,24 | 15,22 | 17,05 | 18,65 |
| Stretch32K PI | 18,09 | 18,72 | 17,61 | 17,57 | 16,91 |
| Stretch32K YARN | 11,21 | 12,84 | 12,81 | 13,04 | 12,85 |

Recuperación por longitud de contexto del propio modelo:

| Tarea | 1024 | 2048 | 4096 | 8192 | 16384 |
|---|---|---|---|---|---|
| passkey | 100,0 | 100,0 | 80,0 | 90,0 | 0,0 |
| multikey | 25,0 | 75,0 | 0,0 | 50,0 | 0,0 |
| multivalue | 50,0 | 25,0 | 50,0 | 33,3 | 16,7 |
| vartrack | 0,0 | 0,0 | 12,5 | 0,0 | 0,0 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,2 GB de pesos más overhead de activaciones y KV cache. Con 16384 tokens de contexto la KV cache crece de forma notable (depende del número de capas y dimensiones de cabeza de TinyLlama), por lo que conviene reservar varios GB adicionales para secuencias largas.
- En cuantización de 8 bits o 4 bits el peso baja a ~1,1 GB o ~0,6 GB respectivamente, aunque no se publican ficheros GGUF oficiales en el repo.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para contexto largo en FP16 (RTX 3060 12 GB, RTX 4070, RTX 4090). Para lotes grandes o 16384 tokens con concurrencia, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superiores para secuencias largas; en GPUs de 6-8 GB solo con cuantización y contextos moderados.
- Opciones de despliegue: transformers (soporte nativo del `rope_scaling` guardado), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL @ 16384 | Long score | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Stretch32K YARN (este) | 1,1B | 16384 | 12,85 | 60,8 | Apache-2.0 | Hugging Face |
| Stretch32K PI | 1,1B | 16384 | 16,91 | 0,0 | Apache-2.0 (mismo base) | Hugging Face |
| TinyLlama 1.1B (YaRN sin entrenar) | 1,1B | 16384 (en carga) | 18,65 | 43,8 | Apache-2.0 | Hugging Face |
| TinyLlama 1.1B (dynamic NTK sin entrenar) | 1,1B | 16384 (en carga) | 68,38 | 45,1 | Apache-2.0 | Hugging Face |

Frente a las alternativas sin entrenamiento, este modelo mejora la perplejidad a 16384 tokens (12,85 frente a 18,65 de YaRN sin entrenar y 68,38 de dynamic NTK) y el long score agregado (60,8 frente a 43,8 y 45,1). Frente a Stretch32K PI, la diferencia es cualitativa: PI no supera ninguna tarea de recuperación (long score 0,0) pese a tener perplejidad baja, mientras que YaRN mantiene capacidad de retrieval.

## Limitaciones y advertencias

- Solo inglés: la model card declara `language: en`; no hay evidencia de capacidades multilingües.
- La recuperación decae con la longitud: passkey cae a 0,0 a 16384 tokens y multikey a 0,0 a 4096 y 16384; el rendimiento en vartrack es prácticamente nulo (0,0-12,5).
- El long score agregado es 60,8 sobre 100, lo que indica que la ventana extendida es funcional pero no equivalente a la calidad a 2048 tokens en tareas de retrieval complejas.
- Riesgo de alucinación inherente a un modelo de 1.1B parámetros; no se documentan evaluaciones de factualidad ni de sesgos.
- Entrenamiento muy corto (150 pasos) sobre un único dataset (PG19), lo que puede limitar la generalización a dominios distintos del literario.
- No se documenta soporte de tool calling, agentes ni instrucciones; es un modelo base ajustado, no un modelo alineado para chat.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base TinyLlama v1.1 debe verificarse por separado (también Apache-2.0).
- Sin ficheros GGUF ni cuantizaciones oficiales: el despliegue en llama.cpp u Ollama requiere conversión manual.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/Stretch32K_TinyLlama_1.1B_YARN
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/Stretch32K_Data_TinyLlama_1.1B
- Colección Stretch32K: https://huggingface.co/collections/AmareshHebbar/stretch32k-6afa9bf23ce7e09c33854642
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama_v1.1
