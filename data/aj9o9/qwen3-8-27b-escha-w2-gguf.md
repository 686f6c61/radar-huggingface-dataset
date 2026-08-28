# aj9o9/Qwen3.8-27B-Escha-W2-GGUF

## Resumen

El modelo `aj9o9/Qwen3.8-27B-Escha-W2-GGUF` es un port a GGUF del modelo `EschaLabs/Qwen3.8-27B-Escha-W2`, una cuantización extrema de 2 bits del Qwen3.8-27B de Alibaba. El autor, aj9o9, ha implementado un kernel nuevo en llama.cpp (`GGML_OP_ESCHA_MUL_MAT`) que decodifica el código nativo de 2 bits de Escha directamente en el kernel, sin desempaquetar los pesos a tensores densos ni en disco ni en VRAM. Esto permite ejecutar un modelo denso de 27B parámetros en una GPU de consumo como la RTX 3090 con menos de 20 GB de VRAM, incluso con el contexto completo de 262 144 tokens.

El modelo es denso, con 64 capas, de las cuales 48 usan atención lineal y 16 atención completa (intervalo de atención completa de 4). La cuantización alcanza una media de 2,469 bits por peso, mezclando K=2 y K=3. Se ofrecen dos variantes: una con la capa de embedding y la cabeza de salida en Q8_0 (10,31 GB) y otra en F16 (12,69 GB). La variante Q8_0 es la recomendada por el autor por ser más pequeña y ligeramente más rápida, con una pérdida de calidad despreciable.

La relevancia de este modelo radica en que demuestra que es posible ejecutar un LLM de 27B con calidad casi idéntica al original en hardware de gama media, gracias a una cuantización extrema bien implementada. No obstante, requiere un fork específico de llama.cpp, ya que el llama.cpp estándar no puede cargar estos archivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (48 lineal, 16 completa) |
| Parametros totales | 27B (declarado por el autor; el tamaño de los safetensors originales es 6 333 709 824 bytes) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (soportado en la variante Q8_0 con KV cache q8_0) |
| Tipos de cuantizacion | 2 bits nativo (2,469 bits por peso, mezcla K=2 y K=3); embedding y cabeza en Q8_0 o F16 |
| Idiomas soportados | Inglés (según la model card; el modelo base Qwen3.8 es multilingüe, pero este port solo declara `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con op kernel `GGML_OP_ESCHA_MUL_MAT`) |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento nuevo, sino una cuantización extrema del Qwen3.8-27B de Alibaba, realizada por EschaLabs y posteriormente portada a GGUF por aj9o9. La arquitectura base es un transformer denso con 64 capas, 5120 dimensiones ocultas, 24 cabezas de atención sobre 4 cabezas KV, dimensión de cabeza 256 y vocabulario de 248 320 tokens. La atención es híbrida: 48 capas usan atención lineal y 16 usan atención completa, con un intervalo de atención completa de 4.

La cuantización nativa de Escha utiliza un esquema de 2 bits con mezcla de K=2 y K=3, alcanzando una media de 2,469 bits por peso. El port a GGUF implementa un op nuevo en llama.cpp que decodifica este código en el kernel, sin desempaquetar los pesos. El autor verificó la corrección del kernel comparando contra una referencia densa en numpy, con un error relativo RMS de alrededor de 1e-6. También validó la calidad del port comparando el acuerdo top-1 con el runtime SGLang de EschaLabs, obteniendo un 99,7% de acuerdo con la cabeza F16 y 99,4% con la Q8_0.

No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, método de alineación) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento: al ser una cuantización del Qwen3.8-27B, hereda las capacidades de razonamiento y generación de texto del modelo original, aunque la model card no detalla tareas específicas.
- Generación de código: el modelo base Qwen3.8-27B destaca en tareas de programación, y esta cuantización mantiene esa capacidad, aunque no se aportan benchmarks específicos.
- Soporte de agentes y tool calling: el modelo base Qwen3.8-27B incluye soporte para tool calling y flujos de agente, pero la model card de este port no lo menciona explícitamente. Se asume que la cuantización no elimina estas capacidades, pero no hay verificación publicada.
- Multilingüismo: la model card solo declara inglés, aunque el modelo base es multilingüe. No se ha verificado el comportamiento en otros idiomas.
- Modo texto únicamente: a pesar de que el Qwen3.8-27B original es multimodal nativo, este port se publica con pipeline `text-generation` y no se menciona soporte de visión o audio.

## Casos de uso

- Inferencia local en hardware de consumo: con la variante Q8_0, el modelo cabe en una RTX 3090 (24 GB) con el contexto completo de 262 144 tokens y KV cache en q8_0, usando menos de 20 GB de VRAM. Es adecuado para desarrolladores que quieran ejecutar un LLM de 27B en una estación de trabajo sin GPUs de datacenter.
- Desarrollo de agentes conversacionales: gracias a su ventana de contexto amplia y a las capacidades heredadas del Qwen3.8-27B, puede usarse para construir asistentes que mantengan conversaciones largas con memoria extendida, por ejemplo en atención al cliente o asistentes personales.
- Generación de código asistida: el modelo base es fuerte en tareas de programación, por lo que este port puede integrarse en editores o pipelines de CI/CD para autocompletado, revisión de código o generación de tests, siempre que se acepte la pérdida de calidad inherente a la cuantización de 2 bits.
- Prototipado rápido de aplicaciones con LLM: al ser un GGUF compatible con llama.cpp (mediante el fork), se puede desplegar con `llama-server` y exponer una API compatible con OpenAI, lo que facilita el desarrollo de prototipos sin depender de servicios en la nube.
- Investigación en cuantización extrema: este port es un caso de estudio de cómo implementar formatos de cuantización no estándar en llama.cpp, y puede servir de referencia para otros proyectos que necesiten soportar pesos de baja precisión.
- Procesamiento de documentos largos: con 262 144 tokens de contexto, puede procesar documentos extensos (libros, informes, código fuente de repositorios grandes) en una sola pasada, siempre que la tarea no requiera una precisión numérica muy alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona mediciones de calidad del port y de rendimiento en hardware específico.

| Metrica | Valor |
|---|---|
| Perplexity (estimador de contexto 512, back-half) | 7,4016 |
| Acuerdo top-1 con SGLang (F16 head, 320 posiciones) | 319/320 = 99,7% |
| Acuerdo top-1 con SGLang (Q8_0 head, 320 posiciones) | 318/320 = 99,4% |
| Acuerdo top-1 con SGLang (contexto creciente, 24 posiciones) | 24/24 = 100% (ambas cabezas) |
| Divergencia JS media sobre top-20 | 0,0000 bits |
| Diferencia absoluta media de logprob | 0,006 (F16) y 0,013 (Q8_0) |

Rendimiento en una RTX 3090 (límite de potencia 250 W, batch 1, offload completo):

| Prueba | Valor |
|---|---|
| Prefill (pp512) | 700,4 tok/s |
| Decode (tg128, Q8_0 head) | 24,03 tok/s |
| Decode (tg128, F16 head) | 23,17 tok/s |

Rendimiento servido con `llama-server` a `-c 70000`:

| Profundidad | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| 8k | 634,5 | 22,07 |
| 16k | 612,8 | 22,11 |
| 32k | 574,6 | 19,65 |
| 64k | 547,2 | 20,24 |

El autor compara con el runtime SGLang de EschaLabs en la misma GPU, que ofrece mayor velocidad de decode (31,17 / 29,05 / 28,37 tok/s a 8k / 16k / 32k), pero el port a llama.cpp es más flexible y ligero.

## Requisitos de hardware

- VRAM estimada: la variante Q8_0 (10,31 GB) con contexto completo de 262 144 tokens y KV cache en q8_0 ocupa menos de 20 GB en una RTX 3090, medido por el autor. La variante F16 (12,69 GB) requiere algo más de VRAM.
- GPU recomendadas: RTX 3090, RTX 4090, o cualquier GPU con al menos 20 GB de VRAM y compute capability 7.5 o superior (Turing o más nueva) para usar tensor cores. En GPUs más antiguas, el prefill cae a un kernel fp32.
- Compatibilidad con GPU de consumo: sí, cabe en una RTX 3090 de 24 GB y en una RTX 4090 de 24 GB. No cabe en GPUs de 16 GB o menos con el contexto completo, pero podría reducirse el contexto.
- Opciones de despliegue: requiere el fork de llama.cpp del autor (rama `escha-w2-dense`). Se puede usar `llama-server` para servir una API compatible con OpenAI. No es compatible con llama.cpp estándar, Ollama ni vLLM sin modificaciones.
- Latencia y throughput: en una RTX 3090, prefill de ~700 tok/s y decode de ~24 tok/s (batch 1). El autor indica que el decode es más lento que el runtime SGLang de EschaLabs, pero el prefill es competitivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262 144 | FP16/BF16 | Apache 2.0 | Safetensors |
| EschaLabs/Qwen3.8-27B-Escha-W2 | 27B | 262 144 | 2 bits nativo (2,469 bits/peso) | Apache 2.0 | Safetensors |
| aj9o9/Qwen3.8-27B-Escha-W2-GGUF | 27B | 262 144 | 2 bits nativo + Q8_0/F16 en emb/head | Apache 2.0 | GGUF (fork llama.cpp) |

Frente al modelo original, este port reduce el tamaño de pesos de aproximadamente 14 GB (FP16) a 10,31 GB (Q8_0) o 12,69 GB (F16), con una pérdida de calidad mínima según el acuerdo top-1 (99,7%). Frente a cuantizaciones GGUF estándar (por ejemplo, Q4_K_M), este formato de 2 bits es más agresivo y requiere un kernel específico, pero permite ejecutar el modelo en menos VRAM. No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B o Mistral 7B) en la información proporcionada.

## Limitaciones y advertencias

- Requiere un fork específico de llama.cpp: los archivos GGUF no funcionan con llama.cpp estándar. El usuario debe compilar el fork del autor (rama `escha-w2-dense`), lo que añade una barrera de entrada.
- Cuantización extrema de 2 bits: aunque el autor reporta una alta fidelidad frente al modelo original, la cuantización de 2 bits puede degradar el rendimiento en tareas que requieren precisión numérica alta, como matemáticas complejas o razonamiento multi-paso. No se han publicado benchmarks estándar que lo confirmen.
- Idioma: la model card solo declara inglés. Aunque el modelo base es multilingüe, no hay garantía de que la cuantización preserve el rendimiento en otros idiomas.
- Riesgo de alucinación: como cualquier LLM, puede generar contenido falso o inventado. La cuantización extrema podría aumentar este riesgo en comparación con el modelo original, aunque no hay evidencia específica.
- Sin soporte multimodal: a pesar de que el Qwen3.8-27B original es multimodal, este port es solo texto. No se puede usar para entrada de imágenes o audio.
- Rendimiento de decode limitado: en la RTX 3090, el decode es de ~24 tok/s, inferior al runtime SGLang de EschaLabs. Para aplicaciones en tiempo real, puede ser un cuello de botella.
- Licencia: Apache 2.0 permite uso comercial, pero el fork de llama.cpp del autor puede tener condiciones adicionales; se recomienda revisar su repositorio.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/aj9o9/Qwen3.8-27B-Escha-W2-GGUF
- Modelo base (EschaLabs): https://huggingface.co/EschaLabs/Qwen3.8-27B-Escha-W2
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp del autor (rama `escha-w2-dense`): https://github.com/Ajay9o9/llama.cpp-escha/tree/escha-w2-dense
- Repositorio del modelo base en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Docker del modelo Escha (referencia): https://github.com/vimuttilabs/escha-qwen3.8-27b-w2-docker
