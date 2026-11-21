# higa2515/Qwen3.8-27B-QSA-BF16

## Resumen

Qwen3.8-27B-QSA-BF16 es una variante experimental del modelo multimodal Qwen3.8-27B de Alibaba Qwen, publicada por el usuario independiente higa2515. El modelo mantiene intactos los pesos originales del backbone, el codificador de visión, el proyector y las cabezas MTP, y añade un mecanismo de atención dispersa (QSA, *Query-Sparse Attention*) implementado mediante un indexador entrenado por separado que decide qué porciones del contexto reciben atención completa en 16 de las 64 capas del decodificador. El objetivo es habilitar recuperación fiable de información en contextos muy largos (hasta 262.144 tokens) reduciendo el coste computacional de la atención densa.

La arquitectura subyacente combina 48 capas con Gated DeltaNet (atención lineal con estado recurrente) y 16 capas de atención completa, sobre las que se injerta el indexador QSA. El modelo tiene 27.833.862.896 parámetros totales y se distribuye en BF16 (repositorio de 56,4 GB), con licencia Apache 2.0. La versión actual del indexador (v2, publicada el 19 de noviembre de 2026) mejora sustancialmente la recuperación estructurada a 128k de contexto respecto a la v1: 215/240 aciertos frente a 169/240 con el modo de razonamiento desactivado, cerrando el 79,3% de la brecha respecto a la atención densa.

Es relevante ahora porque demuestra que es posible aproximar el comportamiento de la atención densa en contextos de 128k con un presupuesto de atención de apenas el 1,6% del contexto (K=2.048 tokens), usando un indexador de solo 52,4 millones de parámetros entrenado por destilación. No obstante, se trata de un artefacto de investigación: requiere código personalizado (`qwen3_5_qsa`), un runtime específico derivado de llama.cpp y no ha sido validado en calidad multimodal con el indexador v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated DeltaNet + 16 capas de atención completa con indexador QSA (sparse attention); vision encoder y proyector heredados de Qwen3.8-27B |
| Parametros totales | 27.833.862.896 (de los cuales 52.434.944 son parámetros FP32 del indexador QSA) |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | Hasta 262.144 tokens en el runtime de referencia; evaluación de recuperación realizada a 128k |
| Tipos de cuantizacion | BF16 en este repo; serie GGUF paralela (incluye Q8_0 usado en las evaluaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) + `indexers/qsa_indexers.pt` (formato trainer) y `qsa-indexers.safetensors` (F32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal con 64 capas de decodificador, de las cuales 48 usan Gated DeltaNet (una forma de atención lineal con estado recurrente y decaimiento) y 16 mantienen atención completa. Sobre esas 16 capas se añade un indexador QSA que, dado el contexto y la consulta, selecciona un subconjunto de bloques de tokens (presupuesto K=2.048 tokens, aproximadamente el 1,6% de un contexto de 128k) sobre los que se aplica atención densa. El indexador consta de proyecciones q/k, normalizaciones y una normalización por bloques, con 52,4 millones de parámetros en FP32.

El entrenamiento del indexador es independiente del modelo base y se realizó por destilación de la atención densa. La v1 se entrenó únicamente a longitud 16.384 (primero destilación de texto, después 300 pasos con una mezcla multimodal del 50% y tareas sintéticas de OCR, tablas y formas). La v2 continúa desde la v1 en dos etapas solo de texto: 300 pasos a 16.384 tokens añadiendo dos términos a la destilación (masa de atención sobre los registros necesarios y margen frente a señuelos similares), y 300 pasos a 65.536 tokens etiquetando todos los tokens de los registros necesarios y señuelos, con mayor peso en el margen de señuelos y en tipos de pregunta propensos a confusiones. El backbone, el encoder de visión, el proyector y los pesos MTP no se modificaron.

## Capacidades

- Generación de texto y razonamiento multimodal: pipeline `image-text-to-text`, con soporte de imágenes y vídeo heredado de Qwen3.8-27B (aunque la calidad multimodal con el indexador v2 no se ha medido).
- Recuperación estructurada en contexto largo: capacidad central del indexador QSA, evaluada con 240 preguntas de *recall* estructurado sobre ~127k tokens de libros PG-19.
- Modo de razonamiento configurable: el chat template admite `reasoning_effort` (por ejemplo, `"low"`), que activa un bloque de razonamiento previo a la respuesta.
- Decodificación especulativa: las cabezas MTP (multi-token prediction) del modelo base se conservan, y el runtime de referencia usa MTP con borrador de 2 tokens.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentación extensa con recuperación estructurada: el modelo puede localizar registros concretos (entradas de tablas, campos de formularios, claves) dentro de contextos de 128k tokens, un escenario donde la v2 reduce un 64,8% los errores de la v1. Adecuado para auditoría documental y extracción de datos de contratos o informes largos.
- Procesamiento de libros y corpus literarios completos: la evaluación se realizó sobre libros PG-19 de ~127k tokens, por lo que el modelo está calibrado para preguntas de comprensión sobre obras completas o colecciones de capítulos en una sola pasada.
- Asistentes de investigación sobre repositorios de conocimiento: con 262.144 tokens de contexto en el runtime de referencia, permite cargar bases de conocimiento medianas y consultarlas sin recuperación externa (RAG), reduciendo la latencia de pipeline.
- Extracción de información de documentos escaneados y tablas: la v1 se entrenó con tareas sintéticas de OCR, tablas y formas; combinado con el encoder de visión, sirve para digitalizar y consultar formularios y tablas complejas (siempre que se valide la calidad multimodal con v2, no medida).
- Evaluación comparativa de mecanismos de atención dispersa: útil como banco de pruebas reproducible para investigadores que estudien sparse attention, dado que el indexador es un módulo separable de 52,4M de parámetros con pesos publicados y versiones v1/v2.
- Despliegue en una sola GPU de 80 GB para tareas de contexto largo: el runtime de referencia (llama.cpp modificado, GGUF Q8_0, KV en FP16) se ejecutó en una A100 80GB con contexto de 262.144 tokens, lo que lo hace viable para prototipos de investigación en infraestructura única.
- Generación de código y matemáticas: no disponible en la información proporcionada; no se han publicado evaluaciones de estas capacidades para esta variante.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a una prueba interna de recuperación estructurada (240 preguntas, 8 tipos × 10 profundidades × 3, plantadas en ~127k tokens de PG-19 no usados en entrenamiento). Configuración: GGUF Q8_0, runtime `pentaCoxian/Qwen-QSA-llama.cpp` en `70b4e14`, A100 80GB, contexto 262.144, KV FP16, MTP draft 2, K=2.048, decodificación greedy, salida máxima 65.536 tokens.

| Indexer | Thinking off | Thinking low |
|---|---:|---:|
| v1 | 169/240 (70,4%) | 185/240 (77,1%) |
| v2 etapa 1 sola (no publicada) | 191/240 (79,6%) | 211/240 (87,9%) |
| v2 (publicada) | 215/240 (89,6%) | 218/240 (90,8%) |
| Atención densa (referencia superior) | 227/240 (94,6%) | 232/240 (96,7%) |

Mejora de v2 sobre v1:

| Medida | Thinking off | Thinking low |
|---|---:|---:|
| Respuestas correctas | +46 (+27,2%) | +33 (+17,8%) |
| Precisión | +19,2 puntos | +13,8 puntos |
| Respuestas incorrectas | 71 → 25 (−64,8%) | 55 → 22 (−60,0%) |
| Brecha v1–densa cerrada | 79,3% | 70,2% |

Comparación pareada (McNemar exacto, solo preguntas acertadas por un lado): v2 vs v1, 55 vs 9 (p = 3,5e-9) con thinking off y 39 vs 6 (p = 5,4e-7) con thinking low; v2 vs densa, 7 vs 19 (p = 0,029) y 6 vs 20 (p = 0,009). La atención densa sigue siendo significativamente mejor. Con thinking off, los errores por registro señuelo cayeron de 26 (v1) a 9 (densa: 5) y los errores de conjunto incorrecto de 25 a 9 (densa: 2). Cada modelo se ejecutó una vez; con los mismos pesos, unas 6 de 240 respuestas cambian entre ejecuciones repetidas.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio BF16 ocupa 56,4 GB, por lo que requiere al menos ~60 GB de VRAM para pesos en BF16 sin cuantizar; la serie GGUF permite reducir el requisito (el Q8_0 se ejecutó en una A100 80GB con contexto de 262.144 y KV en FP16).
- GPU recomendadas: A100 80GB (configuración validada por el autor), H100 80GB para mayor margen de contexto y throughput.
- GPU de consumo: no disponible; con 27,8B parámetros en BF16 no cabe en GPU de consumo de 24 GB. La serie GGUF paralela podría permitir cuantizaciones menores, pero no se han publicado requisitos ni resultados para ellas.
- Opciones de despliegue: runtime personalizado derivado de llama.cpp (`kuraneko1/Qwen3.8-27B-QSA-llama.cpp`, con build desde fuente y guía de runtime); el repo declara `custom_code` para Transformers, y el autor advierte que los resultados de la evaluación no provienen del wrapper de referencia de Transformers. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. Solo se documenta que la evaluación usó decodificación greedy, MTP con borrador de 2 tokens y salida máxima de 65.536 tokens en una A100 80GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Recuperación estructurada (240 preguntas, thinking off) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-QSA-BF16 (este) | 27,8B (+52,4M indexador) | 262.144 | 215/240 (89,6%) | Apache 2.0 | Hugging Face (BF16 y GGUF) |
| Qwen3.8-27B con atención densa | 27,8B | 262.144 | 227/240 (94,6%) | Apache 2.0 | Hugging Face (modelo base) |
| Qwen3.8-27B-QSA v1 | 27,8B (+52,4M indexador) | 262.144 | 169/240 (70,4%) | Apache 2.0 | Hugging Face (revisión `v1`) |
| Otros modelos de ~27B con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (modelos densos de ~27B con contexto ≥128k) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La atención densa supera significativamente al indexador v2 en recuperación estructurada (227 vs 215 aciertos con thinking off, p = 0,029); QSA es una aproximación, no una sustitución equivalente.
- La calidad multimodal con el indexador v2 no se ha medido: las dos etapas de entrenamiento de v2 fueron solo de texto. En el wrapper de referencia de Transformers, las conversaciones de imagen y vídeo usan atención densa, por lo que el comportamiento con QSA en multimodal es desconocido.
- El conjunto de evaluación es interno (240 preguntas, no publicado) y cada modelo se ejecutó una sola vez; con los mismos pesos, ~6 de 240 respuestas varían entre ejecuciones, lo que introduce ruido en las comparaciones.
- Requiere código personalizado (`qwen3_5_qsa`, `custom_code`) y un runtime derivado de llama.cpp; no es compatible con pilas estándar de Transformers sin el wrapper, y los resultados publicados no provienen de ese wrapper.
- El indexador está entrenado solo hasta 65.536 tokens (etapa 2 de v2); su comportamiento más allá de esa longitud dentro del contexto de 262.144 no está validado.
- Riesgo de errores por registros señuelo: con thinking off, v2 todavía produce 9 errores de este tipo frente a 5 de la atención densa, y 9 errores de conjunto incorrecto frente a 2. Relevante en extracción de datos donde claves similares (una letra de diferencia) son frecuentes.
- No hay información sobre sesgos, idiomas soportados ni alucinación en dominios abiertos; no se han publicado evaluaciones de MMLU, HumanEval o GSM8K.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B y el runtime derivado de llama.cpp deben verificarse por separado; el autor no documenta garantías de producción.
- Artefacto de investigación con 845 descargas y 15 likes en el momento de la consulta; no hay evidencia de validación independiente.

## Enlaces

- Hugging Face (BF16): https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Serie GGUF: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Paper QSA: https://arxiv.org/abs/2608.30320
- GitHub del runtime: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp
- Guía de runtime: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp/blob/main/qsa27b/RUNTIME.md
- Entrenamiento del indexador: https://github.com/kuraneko1/qsa-indexer-forge
- Runtime usado en la evaluación: https://github.com/pentaCoxian/Qwen-QSA-llama.cpp/tree/70b4e14a830a4ec78d1ac97087cd9fac02429d37
- Licencia: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16/blob/main/LICENSE
- X del autor: https://x.com/_ryu15_
