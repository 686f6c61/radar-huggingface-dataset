# alfaplus/public-sft-qwen9b-v7

## Resumen

`alfaplus/public-sft-qwen9b-v7` es un adaptador LoRA (PEFT) para el modelo base `Qwen/Qwen3.5-9B`, entrenado con QLoRA sobre un subconjunto de 1.024 ejemplos del dataset sintético en japonés `llm-jp/wizardlm8x22b-logical-math-coding-sft-ja`. Lo publica el usuario alfaplus y se presenta explícitamente como un producto de laboratorio: un experimento de ajuste supervisado (SFT), no un modelo listo para producción.

Su relevancia es acotada y muy específica: documenta de forma inusualmente detallada una traza completa de entrenamiento (filtrado de datos reproducible, recuento de tokens, configuración de QLoRA, hashes de los ficheros) sobre datos sintéticos de lógica, matemáticas y programación traducidos al japonés. Es útil como referencia metodológica o como punto de partida reproducible, no como modelo con capacidades verificadas: el autor indica de forma explícita que solo se entrenó y que no se ejecutó ninguna evaluación, por lo que no se reclama ninguna mejora en japonés ni en ninguna otra capacidad respecto al modelo base.

El resultado es un adaptador de 86.556.672 parámetros entrenables (496 tensores en fp32, 346.302.176 bytes) que debe fusionarse con el modelo base para su uso en inferencia. La información disponible no cubre la arquitectura interna, el contexto máximo ni los idiomas del modelo base Qwen3.5-9B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo base. El adaptador es LoRA (PEFT, `task_type=CAUSAL_LM`) sobre el decodificador de texto de Qwen/Qwen3.5-9B; `target_modules=auto` con exclusión de módulos vision/audio/visual/mtp |
| Parametros totales | No disponible para el modelo base (la denominación comercial es 9B). Adaptador: 86.556.672 parámetros entrenables en 496 tensores fp32 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible para el modelo base. El entrenamiento se hizo con `max_seq_len=1024` tokens |
| Tipos de cuantizacion | Entrenamiento QLoRA con base en 4-bit NF4 (double quantization) y cómputo en bf16. No se publican pesos cuantizados para inferencia (sin GGUF ni GPTQ/AWQ) |
| Idiomas soportados | Japonés (`ja`), único idioma de los datos de entrenamiento. Idiomas del modelo base: no disponible |
| Licencia | apache-2.0 para el adaptador, apache-2.0 para el modelo base y apache-2.0 para el dataset de entrenamiento |
| Formato de pesos | safetensors (adaptador PEFT en fp32, 346.302.176 bytes) más `adapter_config.json`, `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja`. No incluye pesos fusionados ni checkpoints intermedios |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen/Qwen3.5-9B` (snapshot `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) con QLoRA: el modelo base se carga mediante bitsandbytes en 4-bit NF4 con doble cuantización y dtype de cómputo bf16. La configuración LoRA es r=32, `lora_alpha=64`, `lora_dropout=0.05`, `bias=none`, con `target_modules=auto` y una lista de exclusión que descarta los módulos vision/audio/visual/mtp, de modo que solo se adapta el decodificador de texto. El entrenamiento usa `max_seq_len=1024`, batch 4 por dispositivo con acumulación de gradiente 4 (batch efectivo 16), optimizador `paged_adamw_8bit`, learning rate 1e-4 con schedule coseno, warmup ratio 0,03, tres épocas (64 pasos por época, 192 pasos totales), semilla 42, kernel Liger, atención SDPA y gradient checkpointing en una única GPU. La pérdida se calcula únicamente sobre los tokens de respuesta del asistente (`all_tokens_loss=false`).

Los datos proceden de `llm-jp/wizardlm8x22b-logical-math-coding-sft-ja` (revisión `568b89c1f7e5b81e30096efe16b2506418fa2c4a`, dos parquet con 116.422 filas). El contenido es sintético: instrucciones de lógica, matemáticas y programación generadas por WizardLM-2-8x22B y traducidas al japonés por CALM3-22B, sin verificación humana ni filtrado de calidad en esta iteración. El pipeline de selección está documentado y es reproducible: de las 116.422 filas, 0 se descartaron por estructura inválida, 59.349 se descartaron por superar 1024 tokens tras aplicar la plantilla de chat, quedando 57.073 candidatas; tras barajar con `random.Random(42)` se tomaron las primeras 1.024, con multi-turno preservado y user/assistant estrictamente alternados. Longitudes del subconjunto en tokens: p50 684, p90 959, máximo 1.024, media 666,4, total 682.356 tokens por época. El fichero resultante (`train.jsonl`, sha256 `8be5ce30993e08117ccbab0afb2c20072edf9f49aec363d4244798ec39e44a6e`) se distribuye solo a través del dataset original.

## Capacidades

- Ajuste supervisado sobre instrucciones de lógica, matemáticas y programación en japonés: el adaptador está entrenado sobre ese dominio concreto, aunque no hay evidencia publicada de mejora.
- Generación de texto conversacional multi-turno: los ejemplos conservan diálogos multi-turno y la pérdida se aplica solo a las respuestas del asistente.
- Instrucciones en japonés: único idioma representado en los datos de entrenamiento.
- Capacidad de razonamiento lógico y matemático: no verificada; el dataset de origen está etiquetado en esa categoría, pero no se ejecutó ninguna evaluación.
- Generación de código: no verificada por el mismo motivo.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (solo japonés en los datos; comportamiento del modelo base fuera del japonés sin evaluar).
- Modo thinking, visión o audio: no disponible. La configuración de entrenamiento excluye módulos vision/audio/visual/mtp, pero no se documenta si el modelo base los incorpora ni con qué capacidades.
- Capacidades del modelo base: no disponibles en la información proporcionada.

## Casos de uso

- Reproducción de un pipeline de SFT con QLoRA: sirve como referencia verificable de configuración completa (r, alpha, dropout, schedule, semilla, recuento de tokens) para replicar el experimento en otros dominios o idiomas.
- Estudio de filtrado de datos por longitud: el autor documenta el descarte de 59.349 ejemplos por superar los 1024 tokens con la plantilla de chat de Qwen3.5-9B, lo que permite reproducir el análisis y medir su impacto en el resultado.
- Base para experimentos de adaptación al japonés en matemáticas y código: punto de partida para quien quiera comparar subconjuntos, épocas o rangos LoRA sobre el mismo dataset sintético, siempre añadiendo una evaluación propia.
- Docencia y formación en ajuste fino: ejemplo real y trazable de entrenamiento con QLoRA en una sola GPU, con hashes de pesos, tokenizador y datos.
- Prototipado de asistentes técnicos en japonés con requisitos de privacidad: al poder fusionarse y desplegarse on-premise, permite iterar sobre atención a consultas técnicas en japonés, sujeto a evaluación previa.
- Investigación sobre riesgos de datos sintéticos: al provenir todo el corpus de WizardLM-2-8x22B y CALM3-22B sin verificación humana, es un caso útil para estudiar transferencia de sesgos y errores factuales del generador al modelo ajustado.
- Ablación de hiperparámetros: la configuración fijada (3 épocas, 192 pasos, semilla 42) actúa como línea base controlada frente a variantes con más datos o más épocas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que solo se realizó entrenamiento y que no se ejecutó ninguna evaluación (ni benchmarks, ni conjunto de validación, ni inspección humana de las generaciones), por lo que no se puede afirmar que el adaptador mejore, empeore o mantenga las capacidades del modelo base en japonés o en cualquier otra lengua.

## Requisitos de hardware

- Adaptador: 346.302.176 bytes (aproximadamente 0,35 GB) en safetensors fp32; el repositorio completo ocupa 0,4 GB. Cabe en cualquier equipo, pero no es utilizable sin el modelo base.
- Inferencia: requiere fusionar el adaptador con `Qwen/Qwen3.5-9B` mediante `merge_and_unload` o cargarlo como adaptador PEFT junto al base. Las cifras siguientes son estimaciones aritméticas a partir del tamaño de 9B parámetros, no datos publicados: aproximadamente 18 GB en fp16/bf16 solo para pesos, unos 9-10 GB en cuantización de 8 bits y unos 5-6 GB en 4 bits, sin contar caché KV.
- GPU consumer: un modelo de 9B en 4 bits es viable en GPUs de 8-12 GB (por ejemplo RTX 3060 12 GB o RTX 4060 Ti 16 GB) para contextos moderados; en fp16 requiere 24 GB o más (RTX 3090, RTX 4090) y aun así el contexto útil queda limitado por la caché KV.
- GPU de datacenter: A100 40/80 GB, H100 o L40S para servir en fp16/bf16 con contexto largo y concurrencia.
- Entrenamiento: el autor indica una única GPU con la base en 4-bit NF4, `max_seq_len=1024` y batch 4 × acumulación 4; el dato de VRAM pico queda truncado en la información disponible ("no disponible").
- Despliegue: vLLM o TGI tras fusionar los pesos; llama.cpp u Ollama requieren convertir el modelo fusionado a GGUF, ya que el repositorio solo contiene el adaptador PEFT. También es posible servir el adaptador en caliente con PEFT o con el soporte de adaptadores de vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de ajuste | Licencia | Formato | Evaluacion publicada |
|---|---|---|---|---|---|---|
| alfaplus/public-sft-qwen9b-v7 | Adaptador de 86,5 M entrenables sobre base de 9B (total del base no disponible) | No disponible en el base; entrenado a 1024 tokens | 1.024 ejemplos sintéticos ja (lógica/mates/código), 3 épocas, 192 pasos | apache-2.0 | safetensors (PEFT LoRA) | Ninguna |
| Qwen/Qwen3.5-9B (modelo base) | 9B (denominación comercial; desglose no disponible) | No disponible | No disponible | apache-2.0 | No disponible | No disponible en la información proporcionada |
| Otros adaptadores SFT en japonés sobre la misma familia | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos públicos de benchmarks ni de modelos comparables equivalentes (mismo base, mismo dataset, mismo presupuesto de entrenamiento) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación: no hay benchmarks, conjunto de validación ni inspección humana de las salidas. Cualquier afirmación sobre calidad en japonés, matemáticas o código carece de respaldo.
- Volumen de entrenamiento muy reducido: 1.024 ejemplos, 3 épocas y 192 pasos totales, con una sola semilla (42). El riesgo de sobreajuste al estilo de WizardLM y de resultados inestables es alto.
- Datos completamente sintéticos: generados por WizardLM-2-8x22B y traducidos por CALM3-22B, sin verificación humana ni filtro de calidad. Los errores factuales, las falacias de razonamiento y los sesgos de esos generadores se transfieren al adaptador.
- Sesgos conocidos: no documentados por el autor. Los sesgos del corpus de origen (instrucciones técnicas en japonés, estilo WizardLM) son la única referencia y no han sido auditados.
- Riesgo de alucinación: no medido. En datos sintéticos de matemáticas y código, la alucinación de pasos intermedios o de APIs inexistentes es un riesgo plausible y no cuantificado.
- Idioma: los datos son exclusivamente japoneses; no hay información sobre el comportamiento en castellano ni en otras lenguas, ni sobre posible degradación del multilingüismo del base.
- Longitud de contexto efectiva: el ajuste se realizó a 1.024 tokens; no se documenta el contexto nativo del base ni cómo afecta el adaptador a secuencias más largas.
- Distribución incompleta: el adaptador no está fusionado, no incluye checkpoints intermedios ni estado del optimizador, y su uso requiere descargar el modelo base y el tokenizador por separado.
- Datos truncados en la model card: la fila de hardware y VRAM pico aparece cortada, por lo que no se puede verificar el consumo real del entrenamiento.
- Licencia: el adaptador y el dataset se declaran apache-2.0, lo que permite uso comercial y redistribución, pero la licencia del dataset original no cambia por esta publicación y deben revisarse aparte los términos de los modelos que generaron los datos (WizardLM-2-8x22B y CALM3-22B).
- Para producción: sería necesario fusionar, evaluar con un conjunto propio representativo del caso de uso, comparar contra el base y auditar salidas antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alfaplus/public-sft-qwen9b-v7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/llm-jp/wizardlm8x22b-logical-math-coding-sft-ja
- Dataset de origen citado por el autor: https://huggingface.co/datasets/kanhatakeyama/wizardlm8x22b-logical-math-coding-sft-ja
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
