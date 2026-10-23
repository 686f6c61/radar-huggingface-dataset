# hahayhe/test-time-co-evolution-9B

— interesting: "</think>" tag? Model card shows response.split('</think>', 1) — likely "". Actually it says '</think>'. I'll say el template admite enable_thinking y separa el razonamiento con la etiqueta </think> (tal como aparece en el ejemplo).
- Hardware: 21.3 GiB PyTorch allocated en A800 con BF16, SDPA, prompt corto. A800 80GB. So BF16 ~18.8 GB weights. Consumer: RTX 4090 24GB just barely with BF16 short context; better quantized. Should give estimates carefully labeled as estimates.
- Tested stack: PyTorch 2.8.0+cu128, Transformers 5.8.0, Accelerate 1.11.0, flash-linear-attention 0.4.2, causal-conv1d 1.6.2.post1.
- vLLM support for Qwen3.5; not benchmarked.
- Smoke tests: 17*23=391, Python function generation.
- Files include model.safetensors, generation config, tokenizer, chat template, image/video processor settings, inference.py, SHA256SUMS, training_summary.json, requirements-inference.txt, LICENSE, NOTICE.
- Created 2026-10-23; downloads 0, likes 1.
- Base model Qwen/Qwen3.5-9B.

Benchmarks: none published. State it.

Comparativa: I know little about Qwen3.5-9B specifics; I must not invent. I can compare with base model Qwen3.5-9B (params ~9.4B inherited, context original not confirmed), and mention "no disponible" for other alternatives. I could compare with generic alternatives but risk inventing. Better: tabla with this model vs base Qwen3.5-9B vs "no disponible" entries. I could mention that comparables of the same category would be other 9-10B multimodal checkpoints but without data. I'll keep it honest: compare against base model and state that no se dispone de datos verificables de alternativas en la información proporcionada.

Hardware bullets: VRAM estimates:
- BF16: pesos ~18.8 GB; pico medido 21.3 GiB con prompt corto → 24 GB justo/marginal, A800/H100 recommended.
- FP8/INT8 ~9.5-10 GB + overhead → 16-24 GB GPUs, but no verified quantized release; would require own quantization (llama.cpp/GGUF no publicado, pero transformers permite bitsandbytes — should I say? Careful; it's plausible but note as "no verificado").
- Servers: A800 80GB (tested), A100 80GB, H100.
- Deployment: Transformers, vLLM, SGLang? Don't invent support. vLLM documented. Ollama/llama.cpp requires GGUF not available.

Casos de uso, 6+ concrete.

Limitaciones: checkpoint intermedio (step 1500 de 1638, 2.75 de 3 epochs), no evaluado en multimodal (visión congelada, SFT solo texto), benchmarks ausentes, 0 descargas / 1 like → sin validación comunitaria, autor individual, sin datos de sesgo, riesgo de alucinación, cutoff 32768, contextos mayores no validados, posible fuga de formato / repetición, licencia Apache-2.0 permite uso comercial con atribución/aviso, pero el modelo base Qwen3.5-9B tiene su propia licencia (Qwen suele usar Apache-2.0 en muchos tamaños; no confirmado aquí) — mention that upstream license should be checked.

Note about the search results being irrelevant: in Enlaces, list HF, base model, LICENSE, NOTICE, and state that la búsqueda web no devolvió resultados pertinentes.

Titles: only first word capitalized. "## Especificaciones tecnicas" — hmm, they want Spanish with accents presumably; the template uses "tecnicas" without accent. I'll write proper Spanish with accents: "Especificaciones técnicas". Rules say no spelling mistakes in Castilian, so use accents. Only first word capitalized.

Let me write.

Table rows: Arquitectura, Parámetros totales, Parámetros activos (no MoE → "no aplica (modelo denso, presumiblemente)"). Hmm, careful: is it dense? Qwen3.5-9B — unknown whether MoE. Parameter count 9.4B and name 9B suggests dense. I'll say "no disponible / no aplica (no se indica que sea MoE; el nombre y el recuento de parámetros sugieren un modelo denso)". Actually for the row: "Parámetros activos | no aplica (no se describe como MoE)". Fine.

Contexto: "32.768 tokens (cutoff de entrenamiento SFT); configuración original de arquitectura conservada, sin validar más allá".

Cuantización: "no disponible; el repo publica únicamente pesos BF16 en safetensors. Se puede cuantizar por cuenta propia (no verificado por el autor)".

Idiomas: "no disponible (no se declara lista de idiomas; los datos SFT son solo texto y el ejemplo de la model card está en chino)".

Pesos: safetensors BF16, 18,8 GB repo.

Also pipeline image-text-to-text, base model.

Maybe add rows: "Modelo base", "Pipeline", "Formato de pesos". Allowed to add extra rows.

Benchmarks section: no published results. But I can mention smoke tests as validation, in the "Arquitectura y entrenamiento" or a note. Include a small table of smoke tests? Better mention in benchmarks: "Única validación publicada: pruebas de humo (17×23=391 correcto, generación de función Python, logits finitos, tokens de fin normales), que no constituyen evaluación de capacidades." Maybe a mini-table.

Hardware: throughput unknown.

Let's write it.

Length: thorough but reasonable.

Enlaces: HF URL, base model https://huggingface.co/Qwen/Qwen3.5-9B, LICENSE and NOTICE relative links (https://huggingface.co/hahayhe/test-time-co-evolution-9B/blob/main/LICENSE), inference.py. Note about search.

Write now.## Resumen

Test-Time Co-Evolution 9B es un checkpoint de ajuste supervisado (SFT) de pesos completos derivado de Qwen/Qwen3.5-9B, publicado por el usuario hahayhe en Hugging Face. Se distribuye en safetensors estándar de Transformers, sin adaptadores ni necesidad de fusionar nada, y conserva la torre de visión y el proyector multimodal originales, por lo que se carga con la clase `Qwen3_5ForConditionalGeneration` y se etiqueta con el pipeline `image-text-to-text`. El checkpoint publicado corresponde al paso 1500 de un entrenamiento planificado de 1638 pasos (aproximadamente 2,75 de 3 épocas), de modo que no es el modelo final de la ejecución.

El modelo resuelve, en principio, el mismo espacio de tareas que su base: generación de texto, razonamiento con modo "thinking" explícito, uso de herramientas y conversación multi-turno, con la particularidad de haber sido entrenado sobre trayectorias de agente ("trajectory-step samples"). El interés actual es doble: por un lado, es un ejemplo de ajuste de pesos completos sobre una arquitectura Qwen3.5 de 9B con congelación de la parte multimodal; por otro, su naturaleza de checkpoint intermedio y la ausencia total de benchmarks publicados lo convierten en un objeto de evaluación, no en un modelo listo para producción.

Los datos disponibles son escasos: 9.409.813.744 parámetros totales según safetensors, repositorio de 18,8 GB, licencia Apache-2.0, cero descargas y un "like" en el momento de la consulta. No se declaran idiomas soportados, no hay resultados de evaluación de capacidades y no se ha validado el comportamiento multimodal tras el ajuste, que se hizo solo con texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y proyector multimodal; el autor menciona kernels opcionales de atención lineal (`flash-linear-attention`, `causal-conv1d`), aunque no detalla la composición de capas |
| Parámetros totales | 9.409.813.744 (9,41 B) |
| Parámetros activos | No aplica: no se describe como MoE; el recuento y el nombre sugieren un modelo denso |
| Longitud de contexto | 32.768 tokens (cutoff del SFT y `--max-model-len` recomendado en vLLM); se conserva la configuración de contexto original de la arquitectura, pero no se ha validado más allá del cutoff |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos BF16 en safetensors; no hay GGUF, AWQ, GPTQ ni FP8 oficiales. Cualquier cuantización sería por cuenta del usuario y no está validada por el autor |
| Idiomas soportados | No disponible: no se declara lista de idiomas; los datos de SFT son solo texto y el ejemplo de la model card está en chino |
| Licencia | Apache-2.0 (incluye ficheros LICENSE y NOTICE); conviene verificar también la licencia upstream de Qwen3.5-9B |
| Formato de pesos | `model.safetensors` en BF16, más configuración de modelo y generación, tokenizador, chat template, ajustes de procesador de imagen y vídeo, `inference.py`, `requirements-inference.txt`, `SHA256SUMS` y `training_summary.json` |
| Modelo base | Qwen/Qwen3.5-9B (relación: finetune de pesos completos) |
| Pipeline declarado | `image-text-to-text` |
| Tamaño del repositorio | 18,8 GB |
| Fecha de publicación | 23 de octubre de 2026 (última actualización el mismo día) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 de 9B, una pila transformer con componentes multimodales (torre de visión y proyector) que el ajuste mantiene congelados. La model card cita explícitamente el uso de kernels compatibles de atención lineal (`flash-linear-attention` 0.4.2 y `causal-conv1d` 1.6.2.post1) en el entorno probado, lo que apunta a la presencia de capas de atención lineal o híbridas en la arquitectura original, aunque el autor no describe el reparto de capas ni la innovación técnica concreta. La carga se realizó con `attn_implementation='sdpa'` y BF16 sobre una NVIDIA A800.

El entrenamiento consistió en un SFT de pesos completos sobre 69.820 muestras de "trajectory-step", con la torre de visión y el proyector multimodal congelados y datos exclusivamente de texto. Solo se supervisa la respuesta final del asistente, incluido el texto de razonamiento y la respuesta, mientras que los mensajes históricos actúan como contexto. Hiperparámetros declarados: cutoff de 32.768 tokens, batch efectivo de 128, tasa de aprendizaje 1e-5, schedule coseno con 10 % de warmup y un plan de 3 épocas / 1638 pasos. El checkpoint publicado es el paso 1500 (unas 2,75 épocas). El autor indica que la carga directa no reportó parámetros faltantes, inesperados ni con forma incorrecta, y que se verificó generación real de texto. No se mencionan RLHF, DPO ni etapas de alineación posteriores.

## Capacidades

- Generación de texto conversacional multi-turno, con chat template propio y soporte de `enable_thinking=True` para emitir razonamiento antes de la respuesta; en el ejemplo de la model card el razonamiento se separa con la etiqueta `</think>`.
- Razonamiento y matemáticas básicas: la prueba de humo publicada resuelve correctamente 17 × 23 = 391.
- Generación de código: se validó la generación de una función Python, con logits finitos y token de fin normal.
- Uso de herramientas y agentes: las etiquetas del repositorio incluyen `tool-use`, y los datos de entrenamiento son trayectorias por paso, lo que sugiere exposición a interacciones con herramientas, aunque no se documenta el formato exacto de tool calling.
- Capacidad multimodal heredada del modelo base (entrada de imagen y vídeo, pipeline `image-text-to-text`), con procesador incluido, pero sin evaluación de calidad tras el ajuste.
- Capacidades multilingües: no documentadas; el único ejemplo publicado está en chino, y no se declara cobertura de idiomas.
- No se documentan capacidades de audio, decodificación especulativa ni modos de razonamiento configurables más allá del flag de thinking.

## Casos de uso

- Evaluación de checkpoints intermedios en investigación: cargar el paso 1500 y compararlo con el modelo base y con el checkpoint final de 3 épocas para medir el efecto del SFT sobre razonamiento y formato de respuesta, usando `training_summary.json` como registro de procedencia.
- Réplica de experimentos de "co-evolución en tiempo de test": el modelo sirve como punto de partida para pipelines donde un agente genera trayectorias, se evalúan y se reinyectan como datos de entrenamiento; su tamaño de 9,4 B permite iterar en una GPU de 80 GB sin infraestructura de clúster.
- Generación de datos sintéticos de razonamiento: dado el modo thinking y el formato de respuesta final separada, puede producir pares razonamiento-respuesta en lote para alimentar otros entrenamientos, siempre con filtrado y verificación posteriores por el riesgo de alucinación de un checkpoint no final.
- Asistente de código en entornos controlados: generación de funciones y snippets con tool calling en flujos internos, con revisión humana obligatoria y sin exposición directa a producción, dado que no hay benchmarks que respalden calidad.
- Prototipado de agentes con contexto largo: la ventana de 32.768 tokens permite mantener historiales de conversación y resultados de herramientas en memoria; es adecuado para pruebas de concepto de orquestación multi-paso en local sobre una A800 o A100 de 80 GB.
- Investigación sobre olvido de capacidades multimodales: al haberse ajustado solo con texto manteniendo congelada la torre de visión, es un caso útil para estudiar degradación de alineación imagen-texto tras SFT puramente textual, comparando contra Qwen3.5-9B original.
- Docencia y formación técnica: ejemplo real de ficha de checkpoint con pesos completos, chat template y script de inferencia reproducible en un curso de ajuste fino, con la ventaja de que todo el pipeline (descarga, carga, generación) está documentado paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica comparativa. Las únicas validaciones descritas son pruebas de humo, que no constituyen una evaluación de capacidades:

| Prueba | Resultado declarado |
|---|---|
| Aritmética (17 × 23) | 391, correcto |
| Generación de función Python | Completada, logits finitos y token de fin normal |
| Carga de pesos en el paso 1500 | Sin parámetros faltantes, inesperados ni con forma incorrecta |
| Memoria de GPU en inferencia (BF16, SDPA, prompt corto, A800) | ~21,3 GiB asignados por PyTorch |

## Requisitos de hardware

- VRAM en BF16: los pesos ocupan aproximadamente 18,8 GB; el autor midió un pico de ~21,3 GiB de memoria asignada por PyTorch con prompt corto. Con contextos largos, batches mayores o sin kernels de atención lineal, el consumo sube por encima de esa cifra.
- GPU de 24 GB: una RTX 4090 o similar entra de forma muy ajustada en BF16 y solo con prompts cortos y batch 1; para contextos cercanos a 32.768 tokens es previsible el OOM. No hay versiones cuantizadas publicadas que reduzcan el requisito.
- GPU profesionales: el entorno validado es una NVIDIA A800 de 80 GB; A100 80 GB y H100 son las opciones naturales para BF16 con contexto completo o serving concurrente.
- Cuantización: al no haber GGUF, AWQ, GPTQ ni FP8 oficiales, usar menos de 24 GB exige cuantizar por cuenta propia (por ejemplo con bitsandbytes o convirtiendo a GGUF), algo que el autor no ha probado ni respaldado.
- Despliegue: Transformers 5.8.0 con PyTorch 2.8.0+cu128, Accelerate 1.11.0 y SDPA es la ruta validada. La model card documenta `vllm serve hahayhe/test-time-co-evolution-9B --dtype bfloat16 --max-model-len 32768` para versiones de vLLM con soporte de Qwen3.5, pero aclara que el rendimiento en vLLM no se ha medido. No se menciona soporte de llama.cpp, Ollama, TGI ni SGLang.
- Rendimiento y latencia: no disponible. No se publican tokens por segundo, TTFT ni throughput; solo se indica que los kernels opcionales de atención lineal pueden mejorar el throughput.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas en la información proporcionada, más allá del propio modelo base. La comparación posible es esta:

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| hahayhe/test-time-co-evolution-9B | 9,41 B | 32.768 tokens (cutoff SFT) | Sí, heredada del base; no evaluada tras el ajuste | Apache-2.0 | Checkpoint intermedio (paso 1500 de 1638), sin benchmarks |
| Qwen/Qwen3.5-9B | 9,4 B (heredado) | Configuración original, no detallada aquí | Sí | No verificada en esta ficha | Modelo base oficial, presumiblemente con evaluación publicada por Qwen (no consultada) |
| Otros checkpoints comunitarios de 9-10 B con tool use | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información disponible |

## Limitaciones y advertencias

- Es un checkpoint intermedio: paso 1500 de 1638, unas 2,75 de 3 épocas. El autor lo dice explícitamente: no es el modelo final y puede mostrar inestabilidades de formato, repeticiones o razonamiento incompleto.
- Ausencia total de evaluación: no hay benchmarks, ni comparación con el base, ni pruebas de regresión. Las pruebas de humo (una multiplicación y una función Python) no permiten inferir calidad.
- Multimodalidad no validada: la torre de visión y el proyector se congelaron y el SFT usó solo texto; la calidad de imagen y vídeo después del ajuste no se ha evaluado y podría haberse degradado en la alineación con el lenguaje.
- Contexto: solo se ha validado hasta 32.768 tokens; el autor advierte que longitudes superiores no están probadas aunque la configuración original se conserve.
- Idiomas: no se declara cobertura. El único ejemplo está en chino; el rendimiento en castellano es desconocido y no hay garantía de calidad.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad o seguridad, ni filtrado de datos de entrenamiento. Los datos originales y las trayectorias no se publican.
- Alucinación: sin alineación posterior (no se mencionan RLHF ni DPO) y con un checkpoint parcial, el riesgo de inventar hechos, APIs o resultados es alto; requiere verificación externa en cualquier uso real.
- Trazabilidad limitada: cero descargas y un "like" en el momento de la consulta, autor individual, sin paper ni informe técnico asociado; no hay validación independiente de la comunidad.
- Licencia: Apache-2.0 permite uso comercial y modificación con conservación de avisos (LICENSE y NOTICE), pero debe verificarse la licencia del modelo base Qwen3.5-9B, que prevalece sobre los pesos derivados; los datos de entrenamiento no se distribuyen y su procedencia no es auditable.
- Producción: no usar como servicio de cara al usuario sin una batería propia de evaluaciones, control de costes de VRAM (21,3 GiB de pico en el mejor caso) y una estrategia de cuantización probada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hahayhe/test-time-co-evolution-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del repositorio: https://huggingface.co/hahayhe/test-time-co-evolution-9B/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/hahayhe/test-time-co-evolution-9B/blob/main/NOTICE
- Script de inferencia de ejemplo: https://huggingface.co/hahayhe/test-time-co-evolution-9B/blob/main/inference.py
- Registro de procedencia del entrenamiento: https://huggingface.co/hahayhe/test-time-co-evolution-9B/blob/main/training_summary.json
- Búsqueda web: no se han encontrado enlaces pertinentes al modelo (paper, blog, repositorio o demo); los resultados devueltos por la búsqueda no guardan relación con este modelo.
