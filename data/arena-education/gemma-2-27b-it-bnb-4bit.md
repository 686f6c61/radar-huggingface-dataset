# arena-education/gemma-2-27b-it-bnb-4bit

## Resumen

`arena-education/gemma-2-27b-it-bnb-4bit` es una cuantización de 4 bits del modelo `google/gemma-2-27b-it` de Google DeepMind, publicada por la organización ARENA (Alignment Research Engineer Accelerator) para sus ejercicios de curso. No es un modelo nuevo ni un fine-tuning: es exactamente el mismo modelo base con las capas `nn.Linear` internas de los bloques del transformer cuantizadas a NF4 mediante bitsandbytes, y guardado en ese estado para evitar recuantizar en cada carga. Embeddings, unembedding y capas de normalización se mantienen en bfloat16.

El modelo resuelve un problema práctico de despliegue: el Gemma 2 27B original en bfloat16 ocupa unos 54 GB de pesos, lo que exige GPUs de 80 GB o sharding multi-GPU. Esta versión reduce el repositorio a 17,0 GB y permite ejecutar el modelo completo en una sola GPU de 24 GB, que es precisamente el requisito de hardware de los ejercicios de ARENA. La motivación declarada es didáctica y de infraestructura, no de investigación.

Arquitectónicamente hereda todo del Gemma 2 27B: transformer decoder-only de 27.227.128.320 parámetros totales (dato real de los safetensors), atención con ventana deslizante alternada y contexto de 8.192 tokens. La cuantización es de solo pesos (weight-only), con activaciones en bfloat16, de modo que los logits coinciden con los del modelo original cargado con la misma `BitsAndBytesConfig`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), cuantizacion weight-only de capas `nn.Linear` |
| Parametros totales | 27.227.128.320 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredado de Gemma 2 27B) |
| Tipos de cuantizacion | NF4 de 4 bits (bitsandbytes) en capas lineales; embeddings, unembedding y norms en bfloat16; `bnb_4bit_use_double_quant=False`, `bnb_4bit_compute_dtype=torch.bfloat16` |
| Idiomas soportados | No disponible en la informacion proporcionada (heredados de Gemma 2: multilingue, sin desglose oficial) |
| Licencia | Gemma Terms of Use (modelo derivado de `google/gemma-2-27b-it`) |
| Formato de pesos | safetensors (repo de 17,0 GB), cargable con `transformers` + `bitsandbytes` |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 2 27B, un transformer decoder-only de Google con atención por ventana deslizante alternada entre capas locales y globales, contexto de 8.192 tokens y 27.227 millones de parámetros. Esta publicación concreta no entrena nada: toma la revisión `aaf20e6b9f4c0fcf043f6fb2a2068419086d77b0` de `google/gemma-2-27b-it` y aplica `BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_use_double_quant=False, bnb_4bit_compute_dtype=torch.bfloat16)` a los pesos de las capas `nn.Linear` dentro de los bloques del transformer. El tokenizador se copia sin cambios.

La innovación técnica relevante no está en el modelo sino en el empaquetado: los pesos ya cuantizados se persisten en disco, de modo que la carga no requiere recuantizar en cada arranque. El autor verificó que cargar este repo produce los mismos logits que cargar el modelo original con esa configuración, usando transformers 5.22.1 y bitsandbytes 0.50.2. Al mantenerse las activaciones en bfloat16, los forward hooks y `output_hidden_states` funcionan igual que en el modelo original, y se pueden acoplar adaptadores LoRA de PEFT. No hay datos publicados sobre composición del dataset de preentrenamiento, número de tokens, RLHF o DPO en la información disponible; esos detalles pertenecen a la model card de Gemma 2 27B, no a esta cuantización.

## Capacidades

- Generación de texto conversacional en modo instruct (`-it`), con plantilla de chat propia de Gemma 2.
- Razonamiento, matemáticas y generación de código heredados del modelo base de 27B.
- Capacidades multilingües del Gemma 2 original (sin desglose oficial en esta ficha).
- Soporte de adaptadores LoRA mediante PEFT sobre la versión cuantizada, ya que las activaciones permanecen en bfloat16.
- Inspección de estados internos: `output_hidden_states` y forward hooks operativos, útil para experimentos de interpretabilidad.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio para esta publicación.

## Casos de uso

- Ejercicios de interpretabilidad en el curso ARENA: el modelo cabe en una GPU de 24 GB y expone `output_hidden_states` y hooks, lo que permite analizar activaciones y circuitos sin infraestructura de 80 GB.
- Investigación con LoRA en hardware de consumo: al mantener las activaciones en bfloat16, se pueden entrenar adaptadores PEFT sobre el modelo cuantizado en una única GPU de 24 GB.
- Prototipado de asistentes conversacionales: el modo instruct y los 8.192 tokens de contexto permiten mantener diálogos multi-turno con documentos adjuntos de tamaño moderado.
- Evaluación comparativa de efectos de cuantización: sirve como referencia reproducible para medir degradación de calidad frente al Gemma 2 27B en bfloat16, dado que el autor verificó igualdad de logits con la configuración declarada.
- Despliegue en entornos con VRAM limitada: sustituye al modelo original cuando no hay GPUs de 80 GB, a costa de requerir CUDA y bitsandbytes (no funciona en CPU).
- Reproducción de experimentos docentes: el repositorio fija la revisión del modelo base y la configuración exacta de cuantización, lo que facilita resultados reproducibles en aulas y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 17,0 GB; con overhead de activaciones en bfloat16 y caché KV para 8.192 tokens, se recomienda una GPU de 24 GB como mínimo. El autor indica explícitamente que el modelo completo debe residir en la GPU.
- GPU recomendadas: RTX 4090 (24 GB), A6000 (48 GB), L40S (48 GB), A100 (40/80 GB), H100 (80 GB). En 24 GB es ajustado pero es el escenario objetivo declarado por ARENA.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) y en GPUs de 32 GB o más con mayor margen.
- Requiere CUDA y `bitsandbytes`; no hay soporte de CPU indicado. No se debe pasar `quantization_config` al cargar: se usa la almacenada en el repo.
- Opciones de despliegue: `transformers` con bitsandbytes es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible; al ser un checkpoint bitsandbytes de 4 bits, la compatibilidad con esos motores no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arena-education/gemma-2-27b-it-bnb-4bit | 27,2B | 8.192 | NF4 4-bit (bitsandbytes) | Gemma Terms of Use | Hugging Face, 17,0 GB |
| google/gemma-2-27b-it | 27,2B | 8.192 | bfloat16 | Gemma Terms of Use | Hugging Face, ~54 GB |
| Qwen 3 32B (mencionado por el autor) | No disponible | No disponible | No disponible | No disponible | Requiere >80 GB segun la model card |

La comparación con Qwen 3 32B solo aparece como referencia de requisitos de hardware en la model card del autor; no se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo derivado: se aplican los Gemma Terms of Use y la Prohibited Use Policy de Google, incluida la obligación de conservar el aviso `Notice` sobre las modificaciones.
- La cuantización a 4 bits puede degradar la calidad frente al bfloat16 en tareas sensibles, aunque el autor afirma igualdad de logits con la configuración declarada; no hay evaluación de benchmarks que lo respalde.
- Requiere GPU CUDA y bitsandbytes; no es desplegable en CPU ni en entornos sin esa dependencia.
- El modelo completo debe caber en una sola GPU: no admite descarga parcial a CPU con `device_map` mixto según la model card.
- Riesgo de alucinación y sesgos heredados de Gemma 2 27B; no se documentan mitigaciones adicionales en esta publicación.
- Sin datos publicados de idiomas soportados, benchmarks, latencia ni throughput para esta versión cuantizada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un artefacto docente, no un modelo mantenido con garantías de soporte.

## Enlaces

- Hugging Face: https://huggingface.co/arena-education/gemma-2-27b-it-bnb-4bit
- Modelo base: https://huggingface.co/google/gemma-2-27b-it
- Documentación de cuantización bitsandbytes en transformers: https://huggingface.co/docs/transformers/quantization/bitsandbytes
- ARENA: https://www.arena.education/
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
