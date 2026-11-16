# AmareshHebbar/Stretch32K_TinyLlama_1.1B_YARN_LONGLORA

## Resumen

Stretch32K YARN_LONGLORA es un ajuste fino de TinyLlama 1.1B orientado a la extensión de contexto de 2048 a 16384 tokens (un factor de estiramiento de 8x), entrenado en una única GPU por el autor AmareshHebbar. Forma parte de la colección Stretch32K, compuesta por seis modelos que aplican distintas técnicas de extensión de contexto sobre el mismo modelo base y se evalúan con las mismas pruebas, lo que permite una comparación controlada entre métodos.

El modelo combina posiciones YaRN con entrenamiento LongLoRA: atención dispersa con desplazamiento (shifted sparse attention), LoRA sobre las proyecciones de atención y capas de embedding y normalización entrenables. En inferencia se usa atención completa normal. El resultado es un modelo de 1.100.048.384 parámetros que mantiene una perplejidad estable hasta 16384 tokens, frente al colapso del TinyLlama original (perplejidad de 3721,80 a 16384 tokens sin escalado).

Es relevante porque demuestra que es posible extender el contexto de un modelo pequeño con recursos mínimos (una sola GPU) y obtener mejoras medibles en tareas de recuperación de información en contexto largo, con licencia Apache 2.0 y pesos en safetensors compatibles con transformers. No obstante, sus capacidades de razonamiento siguen limitadas por el tamaño del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), con escalado de posiciones YaRN y entrenamiento LongLoRA |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16384 tokens (estiramiento 8x sobre 2048 del base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de TinyLlama/TinyLlama_v1.1, un transformer decoder-only de 1.1B parámetros con ventana nativa de 2048 tokens. La extensión se realiza mediante posiciones YaRN (rope_theta guardado en 10000.0) combinadas con LongLoRA: atención dispersa con desplazamiento (shifted sparse attention, con s2_group de 4096), LoRA sobre las proyecciones q_proj, k_proj, v_proj y o_proj (r=16, alpha=32) y capas de embedding y normalización entrenables. En inferencia se emplea atención completa normal, sin las aproximaciones dispersas del entrenamiento.

El entrenamiento se realizó sobre el dataset AmareshHebbar/Stretch32K_Data_TinyLlama_1.1B, compuesto por fragmentos de PG19, con seq_len de 16384, 150 pasos, grad_accum de 4, learning rate de 2e-05 para el modelo y 2e-05 para embedding/norm, 0.0002 para LoRA, 15 pasos de warmup y factor de estiramiento de 8.0. Se aplicaron trucos de memoria: kernels FlashAttention de PyTorch, gradient checkpointing, cálculo de loss por chunks sobre el vocabulario (logits_chunk de 1024) y secuencias empaquetadas sin padding.

## Capacidades

- Generación de texto en inglés.
- Procesamiento de contexto largo de hasta 16384 tokens, con recuperación de información (passkey, needle) dentro de documentos extensos.
- Razonamiento limitado sobre documentos largos: el modelo base de 1.1B condiciona la profundidad del razonamiento.
- No dispone de tool calling ni function calling documentados.
- No dispone de modo de agente ni razonamiento multi-paso documentado.
- Capacidades multilingües limitadas al inglés (único idioma declarado).
- No dispone de visión, audio ni modo thinking.

## Casos de uso

- Recuperación de información en documentos largos: el modelo alcanza un 76,0 de passkey global y 60,0 más allá de 2048 tokens, por lo que puede localizar claves o datos concretos en textos de hasta 16384 tokens, útil en pipelines de extracción sobre contratos o informes.
- Análisis de libros y documentos completos: con perplejidad de 14,04 a 16384 tokens, puede procesar un libro o un contrato en una sola pasada en lugar de alimentar fragmentos a un sistema de retrieval.
- Clasificación y etiquetado de documentos extensos: al mantener coherencia hasta 16K tokens, permite tareas de summarización extractiva o categorización sobre textos largos en inglés.
- Prototipado e investigación en extensión de contexto: sirve como referencia reproducible (una sola GPU, hiperparámetros publicados) para comparar YaRN+LongLoRA frente a otras técnicas de la colección Stretch32K.
- Despliegue en entornos con recursos limitados: con 1.1B parámetros y pesos safetensors de 2,2 GB, cabe en GPUs de consumo y puede servirse con transformers o TGI.
- Evaluación de técnicas de escalado de RoPE: el modelo y sus curvas de perplejidad por longitud permiten medir el impacto de YaRN con y sin entrenamiento en tareas de recuperación.
- Generación de texto en inglés con contexto moderadamente largo: útil para asistentes de documentación técnica o QA sobre manuales, siempre que no se requiera razonamiento profundo.

## Benchmarks y rendimiento

Resultados publicados en la model card (perplejidad sobre libros de test de PG19; passkey oculta una clave de cinco dígitos; needle oculta un número de siete dígitos; RULER incluye múltiples claves, múltiples valores y seguimiento de variables; Long score es la media de passkey, needle y RULER; LongAlpaca answer NLL es la loss sobre respuestas a preguntas de documentos largos, menor es mejor):

| Modelo | PPL @ 1024 | PPL @ 16384 | Passkey (todas) | Passkey >2048 | Needle (media) | RULER | Long score | LongAlpaca NLL |
|---|---|---|---|---|---|---|---|---|
| TinyLlama 1.1B (sin escalado) | 10,96 | 3721,80 | 40,0 | 0,0 | 32,0 | 18,3 | 30,1 | 8,384 |
| TinyLlama 1.1B (position interpolation, sin entrenamiento) | 216,36 | 235,46 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 5,524 |
| TinyLlama 1.1B (NTK aware, sin entrenamiento) | 12,28 | 175,63 | 70,0 | 50,0 | 52,0 | 15,6 | 45,9 | 3,930 |
| TinyLlama 1.1B (YaRN, sin entrenamiento) | 12,01 | 18,65 | 70,0 | 53,3 | 50,0 | 11,4 | 43,8 | 2,286 |
| TinyLlama 1.1B (dynamic NTK, sin entrenamiento) | 10,96 | 68,38 | 66,0 | 43,3 | 46,0 | 23,3 | 45,1 | 4,172 |
| Stretch32K PI | 18,09 | 16,91 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 2,222 |
| Stretch32K YARN | 11,21 | 12,85 | 74,0 | 56,7 | 86,0 | 22,5 | 60,8 | 1,780 |
| Stretch32K YARN_LONGLORA | 11,53 | 14,04 | 76,0 | 60,0 | 66,0 | 21,4 | 54,5 | 1,955 |

Perplejidad por longitud de contexto:

| Modelo | 1024 | 2048 | 4096 | 8192 | 16384 |
|---|---|---|---|---|---|
| TinyLlama 1.1B (sin escalado) | 10,96 | 12,46 | 391,10 | 2008,73 | 3721,80 |
| TinyLlama 1.1B (YaRN, sin entrenamiento) | 12,01 | 14,24 | 15,22 | 17,05 | 18,65 |
| Stretch32K YARN | 11,21 | 12,84 | 12,81 | 13,04 | 12,85 |
| Stretch32K YARN_LONGLORA | 11,53 | 13,10 | 13,05 | 13,53 | 14,04 |

Recuperación por longitud de contexto (este modelo):

| Tarea | 1024 | 2048 | 4096 | 8192 | 16384 |
|---|---|---|---|---|---|
| passkey | 100,0 | 100,0 | 90,0 | 90,0 | 0,0 |
| multikey | 25,0 | 50,0 | 25,0 | 75,0 | 0,0 |
| multivalue | 16,7 | 25,0 | 50,0 | 41,7 | 0,0 |
| vartrack | 0,0 | 12,5 | 0,0 | 0,0 | 0,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB en los pesos safetensors originales (probablemente fp16/bf16); en cuantización de 8 bits se reduciría a unos 1,1 GB y en 4 bits a unos 0,6 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU de consumo moderna con al menos 4 GB de VRAM puede alojar el modelo en fp16 sin problemas; para contexto completo de 16384 tokens hay que sumar la memoria de la caché KV, que crece linealmente con la longitud.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores; también en GPUs de portátil con 6-8 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag text-generation-inference y endpoints_compatible); llama.cpp u Ollama requerirían conversión a GGUF, no publicada en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Passkey (todas) | Long score | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Stretch32K YARN_LONGLORA (este) | 1,1B | 16384 | 76,0 | 54,5 | Apache 2.0 | Hugging Face |
| Stretch32K YARN | 1,1B | 16384 | 74,0 | 60,8 | no disponible en la información | Hugging Face (colección Stretch32K) |
| TinyLlama 1.1B (YaRN sin entrenamiento) | 1,1B | 16384 (aplicado en carga) | 70,0 | 43,8 | Apache 2.0 (modelo base) | Hugging Face |
| TinyLlama 1.1B (sin escalado) | 1,1B | 2048 | 40,0 | 30,1 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo base de 1.1B limita la profundidad de razonamiento y la calidad de generación; no es comparable en capacidades generales a modelos de mayor tamaño.
- En tareas de recuperación a 16384 tokens, el passkey cae a 0,0 y multikey, multivalue y vartrack también caen a 0,0 en la tabla por longitud, lo que indica que la recuperación fiable se concentra en longitudes intermedias (hasta 8192 tokens).
- El rendimiento de needle (66,0) y Long score (54,5) es inferior al de la variante Stretch32K YARN (86,0 y 60,8), por lo que LongLoRA no mejora todas las métricas frente al ajuste solo con YaRN.
- Solo soporta inglés; no se declaran otros idiomas.
- Riesgo de alucinación inherente a un modelo pequeño: la perplejidad de 14,04 a 16384 tokens es aceptable pero superior a la de 1024 tokens (11,53).
- No se publican cuantizaciones oficiales ni formatos GGUF, lo que limita el despliegue en llama.cpp/Ollama sin conversión manual.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base TinyLlama también es Apache 2.0; conviene verificar las condiciones del dataset PG19 para usos derivados.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria independiente de los resultados.
- No hay datos de sesgos publicados; al entrenarse sobre PG19 (libros de dominio público en inglés), puede heredar sesgos históricos y culturales de ese corpus.

## Enlaces

- Hugging Face: https://huggingface.co/AmareshHebbar/Stretch32K_TinyLlama_1.1B_YARN_LONGLORA
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/Stretch32K_Data_TinyLlama_1.1B
- Colección Stretch32K: https://huggingface.co/collections/AmareshHebbar/stretch32k-6afa9bf23ce7e09c33854642
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama_v1.1
