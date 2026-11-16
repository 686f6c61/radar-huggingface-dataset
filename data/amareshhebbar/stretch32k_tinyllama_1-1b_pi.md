# AmareshHebbar/Stretch32K_TinyLlama_1.1B_PI

## Resumen

Stretch32K PI es un ajuste fino de TinyLlama 1.1B orientado a extender la ventana de contexto de 2048 a 16384 tokens mediante interpolación de posiciones (Position Interpolation, PI) seguida de un entrenamiento supervisado sobre libros largos del corpus PG19. Lo desarrolla AmareshHebbar como parte de la colección Stretch32K, que agrupa seis variantes del mismo modelo base entrenadas con distintas técnicas de extensión de contexto y evaluadas bajo un protocolo común, lo que permite comparar métodos de forma controlada.

El modelo resuelve un problema concreto: TinyLlama fue preentrenado con 2048 tokens y su rendimiento se degrada de forma catastrófica más allá de esa longitud (perplejidad de 3721,80 a 16384 tokens sin escalado). La propuesta combina el escalado lineal de RoPE (factor 8,0) con un ajuste fino completo de todos los parámetros sobre secuencias de 16384 tokens, logrando una curva de perplejidad plana y baja (16,91 a 16384 tokens) frente a las alternativas sin entrenamiento.

Es relevante porque documenta de forma transparente los límites del enfoque: aunque la perplejidad mejora drásticamente, las tareas de recuperación (passkey, needle, RULER) caen a 0,0 en todas las longitudes. El modelo predice bien texto largo pero no es fiable para recuperar información concreta dentro de él, un matiz importante para quien pretenda usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), con RoPE linear scaling factor 8,0 |
| Parametros totales | 1.100.048.384 (1,1 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 16384 tokens (entrenado); max_position_embeddings guardado en 16384 |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de TinyLlama/TinyLlama_v1.1, un transformer decoder-only de 1,1 B parámetros con atención causal estándar y embeddings rotatorios (RoPE). La extensión de contexto se implementa dividiendo cada posición por el factor de estiramiento (8,0), de modo que la posición máxima nueva (16383) cae dentro del rango de posiciones visto durante el preentrenamiento original. Este escalado lineal se guarda en la configuración como `rope_scaling: {'rope_type': 'linear', 'factor': 8.0}` con `rope_theta` de 10000,0.

Tras aplicar PI se realiza un ajuste fino de todos los parámetros sobre el dataset AmareshHebbar/Stretch32K_Data_TinyLlama_1.1B, compuesto por fragmentos largos de libros PG19. Los hiperparámetros documentados son: `seq_len` 16384, 150 pasos, `grad_accum` 4, learning rate 2e-05 (embed y norm también 2e-05, LoRA lr 2e-04), 15 pasos de warmup, `logits_chunk` 1024 y `s2_group` 4096. Para que el entrenamiento cupiera en una sola GPU se emplearon kernels FlashAttention de PyTorch, gradient checkpointing, cálculo de la pérdida por trozos sobre el vocabulario y empaquetado de secuencias sin padding. El autor indica que el entrenamiento se realizó en una única GPU.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de TinyLlama 1.1B.
- Procesamiento de documentos largos de hasta 16384 tokens en una sola pasada, con perplejidad estable a lo largo de la ventana (16,91 a 16384 frente a 18,09 a 1024).
- Modelado de lenguaje sobre texto narrativo y libros largos (dominio de entrenamiento: PG19).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No dispone de modo thinking, visión ni audio.
- Capacidad de recuperación de información dentro del contexto: nula según las evaluaciones del autor (passkey, needle, RULER y multikey/multivalue/vartrack a 0,0 en todas las longitudes).

## Casos de uso

- Modelado y perplejidad sobre corpus largos: útil como modelo de referencia para medir la calidad de la extensión de contexto en experimentos académicos, ya que su curva de perplejidad plana permite aislar el efecto del método PI frente a alternativas como YaRN o NTK.
- Generación de continuaciones de narrativa larga: con 16384 tokens de contexto puede mantener coherencia estilística a lo largo de capítulos completos, aunque sin garantías de recuperar detalles concretos del texto previo.
- Clasificación o etiquetado de documentos largos: al procesar hasta 16k tokens en una pasada se evita el troceado y la agregación posterior, adecuado para tareas donde basta con una señal global del documento y no se requiere extracción precisa.
- Investigación sobre métodos de extensión de contexto: sirve como punto de comparación reproducible dentro de la colección Stretch32K, todos entrenados sobre los mismos fragmentos de PG19 y evaluados con el mismo protocolo.
- Prototipado en entornos con recursos limitados: con 1,1 B parámetros y 2,2 GB de repo, se puede ejecutar en GPUs de consumo para experimentar con ventanas largas antes de escalar a modelos mayores.
- Generación de resúmenes exploratorios de documentos: útil como primer borrador o señal aproximada, siempre con revisión humana, dado que el modelo no recupera hechos concretos de forma fiable.
- Fine-tuning posterior sobre dominios específicos con contexto largo: al estar liberado bajo Apache 2.0 y con todos los parámetros entrenables, sirve como base para ajustes sobre contratos, informes o expedientes, aceptando la limitación de recuperación.

## Benchmarks y rendimiento

Resultados publicados por el autor. Perplejidad sobre libros de test de PG19; passkey oculta una clave de cinco dígitos en relleno repetido; needle oculta un número de siete dígitos en texto real de libro; el subconjunto RULER incluye múltiples claves, múltiples valores y seguimiento de variables; Long score es la media de passkey, needle y RULER; LongAlpaca answer NLL es la pérdida sobre respuestas a preguntas de documentos largos (menor es mejor).

| Modelo | PPL @ 1024 | PPL @ 16384 | Passkey (todas) | Passkey >2048 | Needle (media) | RULER | Long score | LongAlpaca NLL |
|---|---|---|---|---|---|---|---|---|
| TinyLlama 1.1B (sin escalado) | 10,96 | 3721,80 | 40,0 | 0,0 | 32,0 | 18,3 | 30,1 | 8,384 |
| TinyLlama 1.1B (PI, sin entrenar) | 216,36 | 235,46 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 5,524 |
| TinyLlama 1.1B (NTK aware, sin entrenar) | 12,28 | 175,63 | 70,0 | 50,0 | 52,0 | 15,6 | 45,9 | 3,930 |
| TinyLlama 1.1B (YaRN, sin entrenar) | 12,01 | 18,65 | 70,0 | 53,3 | 50,0 | 11,4 | 43,8 | 2,286 |
| TinyLlama 1.1B (dynamic NTK, sin entrenar) | 10,96 | 68,38 | 66,0 | 43,3 | 46,0 | 23,3 | 45,1 | 4,172 |
| **Stretch32K PI** | **18,09** | **16,91** | **0,0** | **0,0** | **0,0** | **0,0** | **0,0** | **2,222** |

Perplejidad por longitud de contexto:

| Modelo | 1024 | 2048 | 4096 | 8192 | 16384 |
|---|---|---|---|---|---|
| TinyLlama 1.1B (sin escalado) | 10,96 | 12,46 | 391,10 | 2008,73 | 3721,80 |
| TinyLlama 1.1B (PI, sin entrenar) | 216,36 | 232,22 | 231,92 | 235,24 | 235,46 |
| TinyLlama 1.1B (NTK aware, sin entrenar) | 12,28 | 14,33 | 14,76 | 15,47 | 175,63 |
| TinyLlama 1.1B (YaRN, sin entrenar) | 12,01 | 14,24 | 15,22 | 17,05 | 18,65 |
| TinyLlama 1.1B (dynamic NTK, sin entrenar) | 10,96 | 12,46 | 15,20 | 30,02 | 68,38 |
| Stretch32K PI | 18,09 | 18,72 | 17,61 | 17,57 | 16,91 |

Recuperación por longitud de contexto (este modelo):

| Tarea | 1024 | 2048 | 4096 | 8192 | 16384 |
|---|---|---|---|---|---|
| passkey | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| multikey | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| multivalue | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| vartrack | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB en bfloat16 (1,1 B parámetros × 2 bytes) más el coste de la caché KV para 16384 tokens; en cuantización de 8 bits bajaría a ~1,1 GB y en 4 bits a ~0,6 GB, aunque el autor no publica cifras de VRAM ni pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bfloat16 con contexto largo; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. El autor entrenó el modelo en una única GPU, lo que confirma que el ajuste fino cabe en hardware de gama alta de consumo o profesional.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más para bfloat16 y contexto completo; con cuantización, en GPUs de 4 GB.
- Opciones de despliegue: transformers con `attn_implementation="sdpa"` (documentado por el autor), además de text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo). No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama ni TGI más allá de la etiqueta.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL @ 16384 | Long score | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Stretch32K PI | 1,1 B | 16384 | 16,91 | 0,0 | Apache 2.0 | Hugging Face |
| TinyLlama 1.1B + YaRN (sin entrenar) | 1,1 B | 16384 | 18,65 | 43,8 | Apache 2.0 | Hugging Face |
| TinyLlama 1.1B + dynamic NTK (sin entrenar) | 1,1 B | 16384 | 68,38 | 45,1 | Apache 2.0 | Hugging Face |
| TinyLlama 1.1B + NTK aware (sin entrenar) | 1,1 B | 16384 | 175,63 | 45,9 | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base evaluadas por el autor, ya que la información disponible no incluye otros modelos de 1,1 B con contexto extendido bajo el mismo protocolo. El patrón es claro: Stretch32K PI logra la mejor perplejidad a 16384 tokens pero el peor rendimiento en recuperación; YaRN y dynamic NTK, sin entrenamiento, conservan capacidad de recuperación (long score ~44-46) a costa de peor perplejidad.

## Limitaciones y advertencias

- Recuperación de información nula: passkey, needle, RULER, multikey, multivalue y vartrack marcan 0,0 en todas las longitudes evaluadas. El modelo no debe usarse para extraer hechos concretos de documentos largos.
- Perplejidad peor que el base en contextos cortos: 18,09 a 1024 tokens frente a 10,96 del TinyLlama original; el ajuste degrada el modelado de secuencias cortas.
- Solo inglés: el modelo está etiquetado únicamente con `en` y no se documenta capacidad multilingüe.
- Dominio de entrenamiento limitado: ajustado sobre fragmentos de PG19 (libros), por lo que su comportamiento en otros dominios (código, diálogo, documentos técnicos) no está validado.
- Riesgo de alucinación: al ser un modelo de 1,1 B con ajuste sobre 150 pasos, la fidelidad factual es limitada; el autor no publica evaluaciones de veracidad.
- Sesgos: no se documentan análisis de sesgo; al derivar de TinyLlama, hereda los sesgos de su corpus de preentrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base TinyLlama_v1.1 (Apache 2.0) y del corpus PG19 para usos derivados.
- Advertencia de producción: dado el 0,0 en recuperación, no es apto para RAG, atención al cliente con historial largo ni tareas que exijan citar información del contexto; su uso razonable es experimental o de modelado de lenguaje.
- Fecha de creación futura (2026-11-16) en los metadatos del repo: conviene verificar la procedencia y reproducibilidad del artefacto antes de integrarlo en un pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/Stretch32K_TinyLlama_1.1B_PI
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/Stretch32K_Data_TinyLlama_1.1B
- Colección Stretch32K: https://huggingface.co/collections/AmareshHebbar/stretch32k-6afa9bf23ce7e09c33854642
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama_v1.1
- Paper de Position Interpolation (referencia del método): no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
