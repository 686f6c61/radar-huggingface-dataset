# lixiaochuan2020/qwen3-4b-midtrain-local-kv-per-document

## Resumen

`qwen3-4b-midtrain-local-kv-per-document` es un ajuste por mid-training del modelo base `Qwen/Qwen3-4B` (4.022.468.096 parámetros) desarrollado por el usuario de HuggingFace `lixiaochuan2020`. El modelo está especializado en tareas de agente de búsqueda (search agent): responde preguntas complejas llamando a una herramienta `wiki_search` sobre un corpus de Wikipedia y razonando sobre los pasajes recuperados. Su rasgo diferencial no es el corpus, sino la atención: emplea atención local-KV por documento, de modo que cada pasaje recuperado se codifica de forma aislada, como si su caché KV se hubiera calculado por adelantado.

El modelo se entrena sobre 297.720 trayectorias (684,86 M de tokens totales) generadas por un profesor `Qwen/Qwen3-32B` en modo thinking, que respondió 128.875 preguntas de NQ y HotpotQA actuando como agente de búsqueda. El objetivo es que un modelo de 4B pueda ejecutar razonamiento multi-paso con recuperación de información manteniendo un coste de atención controlado sobre contextos largos de pasajes.

Es relevante ahora porque explora una alternativa práctica al coste cuadrático de la atención completa en pipelines RAG y de agentes: si cada documento se atiende localmente y su KV se puede precalcular, el prefill de pasajes recuperados deja de depender del historial conversacional. La contrapartida es que la inferencia estándar (`model.generate()`, vLLM o SGLang sin parchear) ejecuta atención completa, que no es el régimen de entrenamiento, por lo que reproducir su comportamiento requiere código específico del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), atención local-KV por documento en entrenamiento |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens por trayectoria (máximo de entrenamiento); longitud nativa del base Qwen3-4B no disponible en la información proporcionada |
| Tipos de cuantización | Pesos guardados en float32; se pueden castear a bfloat16 para inferencia. Otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dtype float32) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-4B`, un transformer decoder-only, y se somete a mid-training supervisado (una época, 4.763 pasos) sobre trayectorias de agente de búsqueda. La innovación central es la atención local-KV por documento: cada pasaje recuperado, desde su token `Doc k(Title: ` hasta el salto de línea final, constituye su propio documento y sus tokens solo atienden a tokens anteriores del mismo pasaje, nunca a la conversación previa ni a otros pasajes. Las K/V de los pasajes se desconectan del grafo (detached), de modo que la pérdida sobre tokens posteriores no entrena cómo se codifican los pasajes. Los tokens envoltorio del turno de herramienta (`<|im_start|>user\n<tool_response>\n` y `</tool_response><|im_end|>\n`) sí atienden de forma normal, y todos los tokens posteriores al turno de herramienta atienden a todos los pasajes. Los pasajes conservan sus posiciones absolutas en la secuencia.

Los datos provienen de un profesor `Qwen/Qwen3-32B` en modo thinking que respondió preguntas de entrenamiento de NQ y HotpotQA como agente de búsqueda, 4 veces por pregunta, usando una herramienta `wiki_search` sobre wiki-18 (embeddings e5-base-v2, 5 pasajes por búsqueda, máximo 10 búsquedas, máximo 16.384 tokens por trayectoria). Se conservaron las trayectorias que llamaron al menos a una búsqueda y cuya respuesta final fue marcada como correcta por un juez Qwen3-32B; las respuestas gold solo se usaron para esa verificación. El resultado son 297.720 trayectorias, con 243,78 M de tokens supervisados (asistente) y 314,24 M de tokens de resultado de herramienta (pasajes); la pérdida cubre solo los tokens del asistente.

La configuración de entrenamiento usa Muon para las matrices de pesos de las capas del decoder y AdamW para embeddings y normas, learning rate 2e-5 con schedule coseno, warmup del 3 % de los pasos, weight decay 0, norma de gradiente máxima 1.0, longitud de fila empaquetada de 18.432 tokens (padding-free, cada trayectoria atiende solo a sí misma), 8 filas por paso, 8 GPUs, autocast bf16, kernel FlexAttention, gradient checkpointing activado y semilla 42. Un baseline de atención completa entrenado con el mismo corpus y ajustes está publicado como `lixiaochuan2020/qwen3-4b-midtrain-baseline`, y el modelo resultante de RL desde este checkpoint es `lixiaochuan2020/qwen3-4b-rl-local-kv-per-document`.

## Capacidades

- Generación de texto y razonamiento en modo thinking, heredado del base Qwen3-4B.
- Agente de búsqueda: emite llamadas a la herramienta `wiki_search` en el formato `<tool_call>` de Qwen3 y consume los resultados como pasajes `Doc k(Title: …) text`.
- Razonamiento multi-paso con múltiples búsquedas encadenadas (hasta 10 por trayectoria en entrenamiento).
- Tool calling / function calling con un esquema de herramienta concreto definido en el código de entrenamiento.
- Respuesta a preguntas multi-hop y de verificación de hechos sobre Wikipedia (NQ, HotpotQA, 2WikiMultihopQA, Bamboogle, FEVER, MuSiQue, PopQA en evaluación).
- Atención local-KV por documento cuando se ejecuta con el código parcheado del autor.
- Capacidades multilingües: no disponible.
- Visión y audio: no disponibles.

## Casos de uso

- Agente de búsqueda sobre Wikipedia o corpus documental propio: el modelo está entrenado para emitir `wiki_search`, leer los 5 pasajes devueltos y razonar sobre ellos; encaja en pipelines de question answering multi-hop donde el recuperador devuelve pasajes con la estructura `Doc k(Title: …)`.
- RAG con prefill de pasajes precalculable: al usar atención local-KV por documento, la codificación de cada pasaje es independiente del historial, lo que permite cachear K/V de documentos frecuentes y reducir el coste de prefill en contextos largos.
- Asistente de investigación con verificación de hechos: el modelo puede encadenar búsquedas hasta 10 veces y contrastar pasajes, útil para tareas tipo FEVER o verificación de afirmaciones.
- Evaluación de recuperadores: sirve como consumidor controlado de un retriever (e5-base-v2 en entrenamiento) para medir cómo afecta la calidad de los pasajes a la respuesta final, con un baseline de atención completa disponible para comparar.
- Investigación sobre atención eficiente: el par modelo local-KV y baseline de atención completa, entrenados con el mismo corpus y ajustes, permite aislar el efecto de la atención por documento en el rendimiento del agente.
- Punto de partida para RL de agentes de búsqueda: el autor publica el modelo derivado tras RL, de modo que este checkpoint sirve como inicialización para entrenamiento con recompensa en tareas de búsqueda.
- Prototipado en una sola GPU: con 4B parámetros y pesos casteables a bfloat16, es viable para experimentación local con el código de evaluación del autor, aunque la inferencia estándar no reproduce el régimen de entrenamiento.

## Benchmarks y rendimiento

La model card describe la metodología de evaluación pero no incluye los resultados numéricos en la información proporcionada. Los conjuntos y ajustes son:

| Evaluación | Conjunto | Muestras | Ajustes |
|---|---|---|---|
| Búsqueda ID | HotpotQA dev (720), NQ test (240), 2WikiMultihopQA dev (240) | 1.200 preguntas, 3 muestras cada una | temperature 0.7, top-p 0.95, 4.096 tokens nuevos por turno, hasta 10 búsquedas, top-5 pasajes |
| Búsqueda OOD | Bamboogle (125), FEVER (300), MuSiQue (300), PopQA (300) | 1.025 preguntas, 1 muestra cada una | mismos ajustes de búsqueda |
| Matemáticas | GSM8K test, MATH-500 | 1 muestra por problema, sin herramientas | temperature 0.6, top-p 0.95, top-k 20, hasta 16.384 tokens |

El juez es `Qwen/Qwen3.5-9B` (sin thinking, temperature 0) y se comparan los modos Full (atención estándar) y Local (atención local-KV por documento). Los valores numéricos de MMLU, HumanEval, GSM8K u otros no se han publicado en la información disponible.

## Requisitos de hardware

- VRAM estimada en float32: aproximadamente 16 GB solo para pesos (4.022 M parámetros × 4 bytes), más overhead de activaciones y caché KV; el repositorio ocupa 16,1 GB.
- VRAM estimada en bfloat16: aproximadamente 8 GB para pesos, más activaciones; cabe en GPUs consumer de 12-16 GB o superiores (RTX 4090, RTX 4080, A10, L4), aunque la longitud de contexto de 16.384 tokens incrementa la memoria de la caché KV.
- GPUs de entrenamiento: 8 GPUs según la configuración publicada (modelo no especificado en la información disponible).
- Despliegue: `transformers` con `AutoModelForCausalLM`; text-generation-inference y endpoints compatibles según los tags. Para reproducir la atención local-KV se requiere el código parcheado del repositorio `ashmitkx/kv-midtrain`: evaluación vía `kv_midtrain.evaluation.evaluate --per_document`, SGLang con `KV_LOCAL_KV=detached` y `KV_LOCAL_KV_SPANS=document` (prefill `flex_attention`, decode `fa3`, chunked prefill desactivado), o vLLM con backend `FLEX_ATTENTION` y `VLLM_USE_V2_MODEL_RUNNER=0`.
- llama.cpp, Ollama y GGUF: no disponibles en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3-4b-midtrain-local-kv-per-document` | 4.022 M | 16.384 tokens de trayectoria | Agente de búsqueda con atención local-KV por documento | Apache 2.0 | HuggingFace público |
| `lixiaochuan2020/qwen3-4b-midtrain-baseline` | 4.022 M (base Qwen3-4B) | mismo corpus y ajustes | Agente de búsqueda con atención completa | Apache 2.0 | HuggingFace público |
| `lixiaochuan2020/qwen3-4b-rl-local-kv-per-document` | 4.022 M (base Qwen3-4B) | no disponible | Agente de búsqueda tras RL desde este checkpoint | Apache 2.0 | HuggingFace público |
| `Qwen/Qwen3-4B` | 4.022 M | no disponible en la información proporcionada | Modelo generalista con thinking | Apache 2.0 | HuggingFace público |

No se dispone de resultados de benchmarks comparativos numéricos en la información proporcionada.

## Limitaciones y advertencias

- La inferencia estándar (`model.generate()`, vLLM o SGLang sin parchear) ejecuta atención completa, que no es el régimen de entrenamiento; los resultados pueden diferir de los reportados en modo Local.
- El código necesario para la atención local-KV (evaluación, parches de SGLang y vLLM, delimitación de pasajes) está en el repositorio `ashmitkx/kv-midtrain`, que la model card describe como privado; sin acceso, no es posible reproducir el comportamiento de entrenamiento.
- El modelo está entrenado con un único esquema de herramienta (`wiki_search`) y un formato de pasaje concreto (`Doc k(Title: …) text`); usarlo con otros recuperadores o formatos requiere adaptación y puede degradar el rendimiento.
- El corpus de entrenamiento es wiki-18 con e5-base-v2 y top-5 pasajes; el dominio queda limitado a preguntas respondibles con Wikipedia y a la calidad de ese recuperador.
- Riesgo de alucinación: aunque el entrenamiento filtra trayectorias con respuesta correcta según un juez, el modelo puede generar respuestas no respaldadas por los pasajes recuperados, especialmente fuera de distribución.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de Qwen3-4B y de datos de Wikipedia, hereda los sesgos del base y del corpus.
- Idiomas soportados no documentados; el entrenamiento se realizó sobre NQ y HotpotQA, predominantemente en inglés.
- Pesos en float32: el repositorio de 16,1 GB requiere castear a bfloat16 para inferencia eficiente, con la posible pérdida de precisión asociada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de seguridad y de benchmarks públicos limita su adopción en producción sin validación propia.
- El modelo tiene 155 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin validación comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lixiaochuan2020/qwen3-4b-midtrain-local-kv-per-document
- Baseline de atención completa: https://huggingface.co/lixiaochuan2020/qwen3-4b-midtrain-baseline
- Modelo derivado tras RL: https://huggingface.co/lixiaochuan2020/qwen3-4b-rl-local-kv-per-document
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de código (descrito como privado en la model card): https://github.com/ashmitkx/kv-midtrain
- Rama con el código de RL y evaluación: https://github.com/ashmitkx/kv-midtrain/tree/claude/rl-grpo
