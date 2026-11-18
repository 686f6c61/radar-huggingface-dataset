# pakutoma/jasmine-yomi-4b

## Resumen

jasmine-yomi-4b es un modelo de conversión grafema-fonema (G2P) especializado en japonés, desarrollado por el usuario pakutoma. Toma texto japonés mixto (kanji, hiragana y katakana) y devuelve la lectura contextual en hiragana, resolviendo el problema clásico de la lectura ambigua de kanji (yomi) en función del contexto. Está construido mediante ajuste fino completo (full SFT) sobre Qwen/Qwen3.5-4B, un transformer decoder-only de tipo Qwen3_5ForCausalLM en modo solo texto, con 32 capas y hidden_size de 2560.

El modelo se distribuye con 4.841.450.496 parámetros reales en safetensors (aunque la model card cita 4,21B para la familia, presumiblemente parámetros no de embedding), pesos en bfloat16 y licencia Apache-2.0. Su relevancia radica en que alcanza un 99,29% de precisión exacta en el benchmark JKYB-Parakeet (13.536 frases), un nivel muy alto para una tarea lingüística sensible al contexto, y ofrece versiones GGUF (BF16, Q8_0, Q4_K_M) para despliegue con llama.cpp.

A diferencia de un modelo conversacional, jasmine-yomi-4b no usa plantilla de chat: se le pasa el texto crudo seguido del token especial `<sep>` y genera hasta `<|im_end|>`. Está pensado como componente de pipelines de procesamiento de lenguaje japonés (TTS, furigana, indexación fonética, subtitulado) más que como asistente general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForCausalLM, solo texto) |
| Parámetros totales | 4.841.450.496 (safetensors); 4,21B citados en la tabla de la familia |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita (los ejemplos usan `max_model_len=2048`) |
| Tipos de cuantización | BF16, Q8_0, Q4_K_M (versión GGUF); bfloat16 en safetensors |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de 32 capas con hidden_size de 2560 en configuración solo texto, y se somete a un ajuste fino supervisado completo (full SFT, actualización de todos los parámetros) con `max_pair_tokens=512` y sin truncado. Los pesos se publican en bfloat16. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa.

Los datos de entrenamiento son ReazonSpeech v2 y CC-100, dos corpus de texto japonés de gran escala (el primero derivado de subtítulos/audio y el segundo de web crawl). La tarea se formula como generación condicionada: el texto de entrada se concatena con el token `<sep>` (ID 248077) sin token BOS, y el modelo emite la lectura en hiragana hasta `<|im_end|>` (ID 248046), con decodificación greedy recomendada (`do_sample=False`). La innovación principal no es arquitectónica sino de especialización: un modelo de 4B reutilizado como G2P contextual de alta precisión, con convenciones de salida explícitas (partículas は/へ sin convertir a わ/え, expansión de números y palabras inglesas a hiragana).

## Capacidades

- Conversión de texto japonés con kanji a lectura en hiragana según contexto (G2P / yomi).
- Resolución de lecturas on'yomi y kun'yomi ambiguas en función de la frase.
- Expansión de números, kanji numéricos y palabras en inglés a hiragana.
- Conservación de la puntuación básica (。、！？) y del signo de prolongación ー.
- Preservación de las partículas は y へ tal como están escritas (no las convierte a わ/え).
- Salida determinista recomendada mediante decodificación greedy.
- No soporta tool calling, function calling, agentes, visión ni audio según la información disponible.
- Capacidad multilingüe limitada al japonés; no se documenta soporte de otros idiomas como tarea.

## Casos de uso

- Generación de furigana para textos japoneses: el modelo recibe cada frase y devuelve la lectura en hiragana, adecuada para anotar kanji en materiales educativos o interfaces de lectura; su 99,29% de precisión exacta en JKYB-Parakeet lo hace fiable para este fin.
- Síntesis de voz (TTS) en japonés: la lectura en hiragana generada puede alimentar un motor TTS que necesite la pronunciación, resolviendo la ambigüedad de kanji que un conversor basado en diccionario no captura por contexto.
- Indexación fonética y búsqueda por sonido: convertir documentos a su lectura permite construir índices de búsqueda que funcionen con consultas en kana o con variantes de lectura.
- Subtitulado y alineación audio-texto: la salida en hiragana facilita la comparación con transcripciones fonéticas y la alineación con audio en pipelines de ASR.
- Normalización de texto para pipelines de NLP japonés: preprocesar corpus convirtiendo kanji a lectura antes de tareas posteriores (análisis morfológico, modelos de lenguaje, etc.).
- Herramientas de accesibilidad: generar lecturas para lectores de pantalla o sistemas de apoyo a la lectura que necesiten pronunciación de kanji complejos.
- Despliegue local en entornos con recursos limitados: gracias a las versiones GGUF (Q4_K_M, Q8_0) puede ejecutarse con llama.cpp en hardware modesto para procesamiento por lotes.

## Benchmarks y rendimiento

Evaluación sobre JKYB-Parakeet (13.536 frases, `jkyb-eval 0.2.0`, comando `g2p`, greedy):

| Métrica | jasmine-yomi-4b |
|---|---:|
| Accuracy (exacta) | 99,29% (13.440 / 13.536) |
| Relaxed Accuracy | 99,33% |
| Target Kana-CER (raw / @1) | 0,70% / 0,61% |
| Sentence Kana-CER | 3,14% |
| on_yomi (7.056 casos) | 99,48% |
| kun_yomi (6.108 casos) | 99,15% |
| joyo_appendix_reading (372 casos) | 98,12% |

Comparativa dentro de la familia jasmine-yomi (mismo benchmark):

| Modelo | Base | Params | Accuracy | Relaxed Acc | Target CER (raw / @1) |
|---|---|---:|---:|---:|---:|
| jasmine-yomi-0.8b | Qwen3.5-0.8B | 0,75B | 99,01% | 99,06% | 1,03% / 0,89% |
| jasmine-yomi-2b | Qwen3.5-2B | 1,88B | 99,05% | 99,10% | 0,89% / 0,80% |
| jasmine-yomi-4b | Qwen3.5-4B | 4,21B | 99,29% | 99,33% | 0,70% / 0,61% |

Nota del autor: el Sentence Kana-CER incluye la diferencia de convención en las partículas は/へ (el benchmark las escribe como ワ/エ, el modelo las mantiene como は/へ).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 9,7 GB de pesos (tamaño del repo), por lo que se recomienda al menos 12-16 GB de VRAM para margen de activaciones y caché.
- Versión GGUF Q8_0: aproximadamente 5 GB; Q4_K_M: aproximadamente 3 GB (estimación a partir del tamaño del repo y la cuantización, no confirmada por el autor).
- GPU recomendadas: A100 o H100 para throughput alto en bfloat16; RTX 4090 (24 GB) para inferencia en bfloat16 sin problemas; RTX 3090/4080 (16-24 GB) también viables.
- Cabe en GPU de consumo: sí, con cuantización Q4_K_M o Q8_0 en GPUs de 6-8 GB o superiores; en bfloat16 requiere GPUs de 16 GB o más.
- Opciones de despliegue: transformers (ejemplo oficial), vLLM (ejemplo oficial con `max_model_len=2048`), llama.cpp mediante la versión GGUF; el autor no documenta Ollama ni TGI de forma explícita.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Params | Contexto | Accuracy JKYB-Parakeet | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| jasmine-yomi-4b | G2P japonés (SFT sobre Qwen3.5-4B) | 4,84B (4,21B citados) | no disponible | 99,29% | Apache-2.0 | HF safetensors + GGUF |
| jasmine-yomi-2b | G2P japonés (SFT sobre Qwen3.5-2B) | 1,88B | no disponible | 99,05% | Apache-2.0 | HF safetensors + GGUF |
| jasmine-yomi-0.8b | G2P japonés (SFT sobre Qwen3.5-0.8B) | 0,75B | no disponible | 99,01% | Apache-2.0 | HF safetensors + GGUF |
| Qwen/Qwen3.5-4B (base) | LLM general | 4B | no disponible | no evaluado como G2P | Apache-2.0 | HF |

No se dispone en la información proporcionada de comparativas con otros modelos G2P japoneses (por ejemplo, conversores basados en diccionario o modelos especializados de terceros).

## Limitaciones y advertencias

- Modelo especializado: no es un asistente conversacional; no usa plantilla de chat y su uso fuera de la tarea G2P no está validado.
- Solo japonés: no se documenta soporte de otros idiomas ni de código, matemáticas o razonamiento general.
- Riesgo de error en lecturas poco frecuentes: el 0,71% de fallos exactos en JKYB-Parakeet se concentra probablemente en casos ambiguos, nombres propios y lecturas irregulares; el rendimiento en dominios fuera del benchmark no está medido.
- Convención de salida específica: mantiene は/へ como partículas escritas, lo que puede requerir postprocesado si el pipeline espera la pronunciación わ/え.
- Sesgos: no documentados por el autor; al entrenar sobre ReazonSpeech v2 y CC-100 puede heredar sesgos de esos corpus (registro oral, contenido web).
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.5-4B también es Apache-2.0 según la model card; conviene verificar los términos del corpus de entrenamiento para usos sensibles.
- Longitud de contexto no especificada: los ejemplos usan `max_model_len=2048` y `max_pair_tokens=512` en entrenamiento, por lo que entradas muy largas pueden degradar la calidad o truncarse.
- Sin datos de latencia ni throughput publicados: la planificación de producción requiere medición propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pakutoma/jasmine-yomi-4b
- Versión GGUF: https://huggingface.co/pakutoma/jasmine-yomi-4b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Benchmark JKYB-Parakeet: https://huggingface.co/datasets/Parakeet-Inc/joyo-kanji-yomi-benchmark-parakeet
- jasmine-yomi-0.8b: https://huggingface.co/pakutoma/jasmine-yomi-0.8b
- jasmine-yomi-0.8b GGUF: https://huggingface.co/pakutoma/jasmine-yomi-0.8b-GGUF
- jasmine-yomi-2b: https://huggingface.co/pakutoma/jasmine-yomi-2b
- jasmine-yomi-2b GGUF: https://huggingface.co/pakutoma/jasmine-yomi-2b-GGUF
- Perfil del autor: https://huggingface.co/pakutoma
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
