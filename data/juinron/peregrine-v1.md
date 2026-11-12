# juinron/Peregrine-V1

## Resumen

Peregrine-V1 es un modelo de lenguaje base en inglés de 48,4 millones de parámetros, entrenado desde cero por el desarrollador independiente juinron (publicado bajo el identificador `juinron/Peregrine-V1`). Forma parte de un proyecto de modelos de lenguaje pequeños y es el hermano mayor de Hummingbird-V2, con el que comparte la mezcla de datos de entrenamiento pero introduce un tokenizador nuevo de 16.384 tokens. El modelo está diseñado específicamente para completado de texto y puntuación de continuaciones, no para diálogo ni instrucciones.

Arquitectónicamente es un transformer decoder-only de 16 capas con hidden size de 512, FFN de 1.200, atención con grouped-query attention (8 cabezas de consulta y 2 de clave/valor), RMSNorm, normalización QK por cabeza, RoPE y SwiGLU con clamping. Se entrenó durante 39.500 millones de tokens con una ventana de contexto de 512 tokens, aunque la configuración máxima declarada es de 4.096 tokens.

Su relevancia es acotada pero clara: se trata de un modelo de investigación reproducible (receta de entrenamiento publicada, seed fija, mezcla de datos documentada) que sirve como referencia para estudiar el comportamiento de modelos pequeños entrenados con Muon y AdamW sobre corpus educativos. No es un modelo apto para producción conversacional ni para tareas que requieran alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RMSNorm, normalización QK por cabeza, RoPE y SwiGLU con clamping |
| Parametros totales | 48.384.512 (embeddings de entrada/salida atados); 48.908.800 según safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens configurados; entrenado con 512 tokens |
| Tipos de cuantizacion | no disponible (no se publican conversiones GGUF ni AWQ/GPTQ en la información) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con código custom empaquetado (`trust_remote_code=True`) |
| Capas / hidden size / FFN | 16 / 512 / 1.200 |
| Atención | Grouped-query attention, 8 cabezas Q y 2 cabezas KV |
| Vocabulario | BPE byte-level de 16.384 tokens con protección de dígitos |
| Tokens de entrenamiento | 39.500 millones |
| Optimizadores | Muon y AdamW, BF16 en CUDA, seed 42 |

## Arquitectura y entrenamiento

Peregrine-V1 es un transformer decoder-only de 16 capas y 512 dimensiones ocultas, con FFN de 1.200 unidades. Usa grouped-query attention con 8 cabezas de consulta y 2 de clave/valor, lo que reduce el coste de caché KV respecto a atención multi-cabeza completa. Incorpora RMSNorm, normalización QK por cabeza (per-head QK normalization), embeddings rotatorios (RoPE) y una activación SwiGLU con clamping. Los embeddings de entrada y salida están atados, lo que explica la diferencia entre los 48.384.512 parámetros declarados en la model card y los 48.908.800 contabilizados en safetensors. El tokenizador es un BPE byte-level de 16.384 tokens con protección de dígitos, nuevo respecto a Hummingbird-V2.

El entrenamiento cubrió 39.500 millones de tokens con una mezcla dominada por datos educativos: FineWeb-Edu y FineWeb-Edu-Dedup (55 %), Cosmopedia v2 (15 %), FineMath 4+ (10 %), DCLM baseline (10 %), Dolma 3 science exposition y science/PDF QA (6 %), FinePDFs-Edu (3 %) y Dolma 3 educational code (1 %). Se usaron Muon y AdamW, precisión BF16 en CUDA, seed 42, contexto de 512 tokens y 196.608 tokens por actualización de optimizador. El schedule fue warmup-stable-decay: learning rate constante de 3e-4 hasta 34.000 millones de tokens y decaimiento posterior; el checkpoint publicado corresponde a 39.500 millones de tokens, dentro de la fase de decaimiento. Los splits de validación y held-out son de 25 millones de tokens cada uno y están separados del entrenamiento.

## Capacidades

- Generación de texto y completado de secuencias en inglés, orientado a continuación de contexto más que a instrucciones.
- Puntuación de continuaciones (continuation scoring), útil para reranking o evaluación de fluidez.
- Razonamiento aritmético básico limitado: ArithMark-3 con 35,80 % de precisión normalizada, cerca del azar fuera de ciertos tipos de pregunta.
- Conocimiento factual y de sentido común de nivel básico, reflejado en los benchmarks zero-shot publicados.
- No soporta tool calling ni function calling (no hay indicación en la model card).
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- Multilingüismo: únicamente inglés.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- No está ajustado a instrucciones ni alineado en seguridad.

## Casos de uso

- Investigación sobre modelos pequeños: reproducción y estudio de recetas de entrenamiento (Muon + AdamW, warmup-stable-decay) con un modelo de 48 M de parámetros y receta publicada en `training/provenance.json`.
- Evaluación de tokenizadores: comparación del BPE de 16.384 tokens con protección de dígitos frente a tokenizadores de modelos pequeños similares en tareas de compresión y fertilidad léxica.
- Puntuación de continuaciones en pipelines de filtrado de datos: usar la log-verosimilitud del modelo para descartar textos de baja calidad en corpus educativos, aprovechando su entrenamiento sobre FineWeb-Edu y DCLM.
- Baseline en experimentos de scaling laws: al ser un modelo de 48 M con 39,5 B tokens (ratio tokens/parámetro de aproximadamente 816), sirve como punto de referencia para estudiar curvas de escalado.
- Generación de texto corto en entornos con recursos mínimos: inferencia en CPU o GPU de gama baja para demos educativas de completado de frases.
- Estudio de sesgos y alucinación en modelos base: análisis de errores factuales y de razonamiento en un modelo sin alineación, como control en investigaciones de evaluación.
- Docencia: ejemplo práctico de arquitectura transformer moderna (GQA, RoPE, RMSNorm, SwiGLU) con código custom accesible y tamaño manejable.

## Benchmarks y rendimiento

Resultados zero-shot publicados por el autor para el checkpoint de 39,5 B tokens. Las puntuaciones son precisión de continuación normalizada en porcentaje; el Intelligence Index es un compuesto normalizado por azar.

| Benchmark | Peregrine-V1 |
|---|---|
| HellaSwag | 32,85 |
| ARC-Easy | 52,65 |
| ARC-Challenge | 26,88 |
| PIQA | 62,57 |
| ArithMark-3 | 35,80 |
| Intelligence Index (normalizado por azar) | 17,713 |

Advertencias del propio autor: el checkpoint publicado fue seleccionado como el mejor de 74 checkpoints evaluados, por lo que la cifra principal es optimista. La media del índice de los últimos cuatro checkpoints (38,5 B a 40 B tokens) es 17,46, y el error estándar por muestreo de ítems es de aproximadamente 0,8 puntos. Los resultados no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 48,9 M de parámetros en BF16, los pesos ocupan aproximadamente 98 MB; en FP32, unos 196 MB. La caché KV para contexto de 4.096 tokens con GQA (2 cabezas KV, 16 capas, dimensión de cabeza de 64) es de unos pocos MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100. También es viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de VRAM libre, e incluso en iGPU y CPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía documentada. No se publican conversiones a GGUF, por lo que llama.cpp u Ollama requerirían conversión manual. vLLM y TGI no están confirmados para esta arquitectura con código custom.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera inferencia en milisegundos por token en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Peregrine-V1 | 48,4 M | 4.096 (entrenado a 512) | Apache-2.0 | Base, solo inglés, sin alinear; benchmarks propios del autor |
| Hummingbird-V2 | no disponible en la información | no disponible | no disponible | Modelo hermano menor del mismo proyecto; mezcla de datos compartida |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 | Apache-2.0 | Base comparable en filosofía (corpus SmolLM), mayor tamaño |
| Pythia-70M (EleutherAI) | 70 M | 2.048 | Apache-2.0 | Base de investigación con receta reproducible |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada; no se han publicado resultados cruzados.

## Limitaciones y advertencias

- Modelo base sin ajuste a instrucciones ni alineación de seguridad: no debe usarse como asistente conversacional.
- Riesgo elevado de errores factuales y de razonamiento; el propio autor advierte de que la aritmética está cerca del azar fuera de algunos tipos de pregunta.
- Contexto entrenado de solo 512 tokens: la ventana configurada de 4.096 tokens no implica calidad validada en contexto largo, tal como señala el autor.
- Solo inglés; no hay soporte multilingüe.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre corpus web (FineWeb-Edu, DCLM), es probable que herede sesgos presentes en esos datos.
- Licencia Apache-2.0 permite uso comercial, pero deben revisarse los avisos de datasets de terceros en `NOTICE` y `TRAINING_DATA.md`.
- Requiere `trust_remote_code=True`, lo que ejecuta código del repositorio; debe auditarse antes de usarlo en producción.
- Los benchmarks son autoinformados, seleccionados sobre 74 checkpoints y no verificados de forma independiente.
- No apto para decisiones de consecuencias relevantes, según el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juinron/Peregrine-V1
- Modelo hermano Hummingbird-V2: https://huggingface.co/juinron/Hummingbird-V2
- Documentación de datos de entrenamiento: TRAINING_DATA.md (en el repositorio del modelo)
- Procedencia del entrenamiento: training/provenance.json (en el repositorio del modelo)
- Avisos de terceros: NOTICE (en el repositorio del modelo)
- Licencia: LICENSE (en el repositorio del modelo)
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset DCLM baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset Dolma 3 Dolmino mix 100B: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1025
- Dataset Dolma 3 Dolmino mix 10B: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-10B-1025
- Dataset FinePDFs-Edu: https://huggingface.co/datasets/HuggingFaceFW/finepdfs-edu
