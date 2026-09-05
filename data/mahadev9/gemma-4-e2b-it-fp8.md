# mahadev9/gemma-4-E2B-it-fp8

## Resumen

El modelo `mahadev9/gemma-4-E2B-it-fp8` es una cuantización FP8 (W8A8 dinámica) del modelo multimodal `google/gemma-4-E2B-it`, desarrollado por Google. Esta versión ha sido producida por el usuario `mahadev9` utilizando `llm-compressor`, el toolkit de compresión de modelos del proyecto vLLM. El objetivo es reducir los requisitos de memoria y acelerar la inferencia en GPUs con soporte nativo para FP8, manteniendo una alta fidelidad respecto al modelo original en bf16.

La cuantización se aplicó únicamente a los pesos del modelo de lenguaje; las torres de visión y audio, así como `lm_head`, se conservan en su precisión original, ya que la calibración se realizó exclusivamente con texto. El checkpoint contiene 5.104.297.539 parámetros y ocupa 8.4 GB en disco.

Este modelo es relevante para desarrolladores que buscan desplegar modelos VLM de Google en entornos de producción con restricciones de memoria. Las métricas de calidad publicadas indican que la degradación es especialmente baja en tareas de tool calling, aunque algo mayor en texto narrativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo VLM base de Google; detalle no disponible) |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 W8A8 dinámico; lm_head y torres de visión/audio en precisión original |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint no es un modelo entrenado desde cero, sino una cuantización post-entrenamiento (PTQ) del modelo base `google/gemma-4-E2B-it`. El esquema aplicado es FP8 W8A8 dinámico, mediante `llm-compressor`. Durante el proceso de calibración se emplearon textos narrativos y turnos de tool calling, con una longitud de secuencia de 2048 tokens. Esta calibración fue exclusivamente textual, por lo que las torres de visión y audio del modelo base no se han ajustado ni cuantizado, permaneciendo en su precisión original.

La principal innovación técnica es la reducción de los pesos a FP8, lo que permite un menor coste de memoria en inferencia y una mejor compatibilidad con motores como vLLM, siempre que el hardware soporte nativamente este formato.

## Capacidades

- Modelo multimodal: al derivar del modelo base `google/gemma-4-E2B-it`, es capaz de procesar texto, imágenes y audio, aunque en este checkpoint solo se ha calibrado el texto.
- Instrucciones y conversación: el sufijo `it` indica que es una versión fine-tuned para seguir instrucciones.
- Tool calling y function calling: la evaluación de calidad muestra un top-1 agreement del 94.88% en turnos agentic, lo que indica que las capacidades de llamada a herramientas se conservan muy bien tras la cuantización.
- Uso en agentes y razonamiento multi-paso: el modelo reproduce adecuadamente los esquemas de herramientas y consultas cuando se usa con el chat template, lo que lo hace apto para flujos de agente con pasos múltiples.
- Generación de texto largo: no hay datos específicos; la ventana de contexto del modelo base no está disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: gracias a la preservación de las habilidades de tool calling y a la reducción de memoria que ofrece FP8, el modelo puede gestionar conversaciones multi-turno que invocan APIs de consulta de pedidos, reservas o soporte, desplegándose en una sola GPU de gama alta.
- Generación de código en pipelines CI/CD: a pesar de no disponer de benchmarks específicos, al tratarse de un modelo instruct multimodal puede integrarse en sistemas que requieren completar o revisar fragmentos de código; la cuantización FP8 reduce la latencia y permite ejecutar varias instancias en paralelo.
- Asistentes virtuales con entrada multimodal: el modelo mantiene las torres de visión y audio en precisión original, por lo que puede recibir imágenes o audio como entrada en entornos donde la memoria es limitada.
- Herramientas de análisis de documentos y extracción de datos: si el modelo base soporta contexto largo, la versión FP8 permite procesar documentos extensos en servidores con menos VRAM; no obstante, la longitud de contexto no está documentada en este repositorio.
- Investigación en cuantización y despliegue eficiente: los datos de KL divergence y top-1 agreement frente al baseline bf16 resultan útiles para estudiar el impacto de FP8 en modelos VLM de gran tamaño.
- Despliegue en entornos privados y soberanos: según la documentación de Gemma 4 en DeepMind, los modelos siguen protocolos de seguridad de infraestructura similares a los de los modelos propietarios, lo que los hace adecuados para organizaciones que necesitan control sobre sus datos.
- Evaluación de sistemas de agentes: el checkpoint puede emplearse como sustituto eficiente del modelo base en pruebas de automatización de procesos (RAG, orquestación de APIs) cuando el hardware disponible es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K en la información disponible. La model card incluye únicamente métricas de fidelidad de la cuantización frente al modelo original en bf16:

| Bucket | Tokens | KL divergence media | Top-1 agreement |
|---|---|---|---|
| Prose (WikiText-2) | 23.772 | 0.3893 | 83.14% |
| Agentic (tool calling) | 25.569 | 0.0458 | 94.88% |
| Overall | 49.341 | 0.2113 | 89.23% |

El autor señala que, a diferencia de otras cuantizaciones (menciona Qwen3.5 quants), este modelo mantiene mejor el rendimiento en texto agentic y tool calling que en prosa narrativa.

## Requisitos de hardware

- VRAM estimada: no disponible. El checkpoint ocupa 8.4 GB en disco; el consumo real de VRAM depende del motor de inferencia, la longitud de contexto y la configuración de la cache KV.
- GPU recomendadas: no disponibles oficialmente. Al ser FP8, se recomienda hardware con soporte nativo para FP8, como las NVIDIA H100, L40S o RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de 8.4 GB sugiere que una RTX 4090 (24 GB) podría servirlo, pero no hay datos oficiales.
- Opciones de despliegue: vLLM (comando `vllm serve mahadev9/gemma-4-E2B-it-fp8`) y transformers (`AutoModelForCausalLM` con `torch_dtype='auto'`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con otros modelos similares. La única referencia es el modelo base `google/gemma-4-E2B-it`, del cual deriva. Los datos publicados no incluyen benchmarks de tareas, por lo que cualquier comparación de rendimiento sería especulativa.

| Modelo | Base | Parametros | Precision | Tamano | Uso |
|---|---|---|---|---|---|
| google/gemma-4-E2B-it | google/gemma-4-E2B-it | no disponible | bf16 | no disponible | Modelo base |
| mahadev9/gemma-4-E2B-it-fp8 | google/gemma-4-E2B-it | 5.104.297.539 | FP8 W8A8 | 8.4 GB | Cuantizado |

## Limitaciones y advertencias

- La cuantización FP8 degrada la fidelidad en texto narrativo: el análisis del autor muestra una KL divergence media de 0.3893 en prosa, frente a 0.0458 en texto agentic, lo que implica que la calidad en textos largos y narrativos puede verse más afectada que en tareas estructuradas.
- Las capacidades multimodales (visión y audio) no han sido validadas tras la cuantización; la calibración fue solo texto, aunque los encoders se conservan en precisión original.
- La licencia no está declarada en este repositorio. Antes de cualquier uso comercial, es imprescindible revisar la licencia del modelo base `google/gemma-4-E2B-it`, así como los términos de uso de los modelos Gemma 4.
- No se han publicado benchmarks de tareas (MMLU, HumanEval, etc.), por lo que el rendimiento real en razonamiento, matemáticas o código no está demostrado en esta ficha.
- Como todo modelo de lenguaje, es probable que herede sesgos y puede generar alucinaciones. No hay evaluaciones de seguridad o alineación específicas para este checkpoint.
- El repo tiene 0 descargas y 0 likes, lo que indica un uso limitado o nulo; puede haber poca validación externa.

## Enlaces

- Hugging Face: [mahadev9/gemma-4-E2B-it-fp8](https://huggingface.co/mahadev9/gemma-4-E2B-it-fp8)
- Modelo base: [google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
- llm-compressor: [github.com/vllm-project/llm-compressor](https://github.com/vllm-project/llm-compressor)
- Gemma 4 en DeepMind: [deepmind.google/models/gemma/gemma-4/](https://deepmind.google/models/gemma/gemma-4/)
