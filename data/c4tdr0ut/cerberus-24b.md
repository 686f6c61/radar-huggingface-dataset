# c4tdr0ut/Cerberus-24B

## Resumen

Cerberus-24B es un ajuste fino del modelo Mistral-Small-24B-Instruct-2501 desarrollado por Catdrout Technologies AB (Uppsala, Suecia). Se presenta como una alternativa abierta y descentralizada a los asistentes comerciales fuertemente alineados, priorizando la franqueza y la reduccion de rechazos innecesarios (refusals) sin sacrificar las capacidades de razonamiento e instruccion del modelo base. El entrenamiento combina QLoRA de 4 bits con ORPO (Odds Ratio Preference Optimization) sobre pares de preferencia en formato ChatML.

Arquitectonicamente hereda la estructura decoder-only tipo transformer de Mistral Small 24B, con 23.572.403.200 parametros totales (23,57 mil millones) y pesos en safetensors de 47,2 GB en bf16. El modelo esta pensado para uso conversacional general y como base para posteriores ajustes o integracion en sistemas de agentes donde se prefieran tasas de rechazo mas bajas. La licencia es no comercial con atribucion obligatoria, lo que limita su despliegue en produccion comercial sin negociacion previa con el autor.

Su relevancia actual radica en que demuestra un flujo de trabajo reproducible de alineacion ligera (ORPO + QLoRA) sobre un modelo instructivo de 24B, un tamano que cabe en una sola GPU de 80 GB en bf16 y en GPUs de consumo con cuantizacion. No obstante, la documentacion publica es escasa: no se reportan benchmarks formales ni idiomas soportados de forma explicita, y el dataset de preferencias es propietario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), heredada de Mistral-Small-24B-Instruct-2501 |
| Parametros totales | 23.572.403.200 (23,57 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en entrenamiento (secuencia); contexto nativo del base no confirmado en la informacion disponible |
| Tipos de cuantizacion | Entrenado con QLoRA de 4 bits; pesos publicados en safetensors (bf16). No se listan GGUF/AWQ/GPTQ en la informacion disponible |
| Idiomas soportados | Ingles (primario segun model card); resto no disponible |
| Licencia | other (no comercial, atribucion obligatoria; contacto con el autor para terminos comerciales) |
| Formato de pesos | safetensors (repo de 47,2 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Mistral-Small-24B-Instruct-2501, un transformer decoder-only de 24B parametros. El ajuste se realizo con ORPO, una variante de optimizacion por preferencias que combina la perdida de maxima verosimilitud con un termino de odds ratio, eliminando la necesidad de una etapa separada de SFT y de un modelo de recompensa. Se aplico sobre un adaptador QLoRA de 4 bits con rango 32, alpha 16, dropout 0,05 y modulos objetivo que incluyen q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj y lm_head. El entrenamiento uso Axolotl sobre Modal con una GPU NVIDIA B200+, Flash Attention 2, gradient checkpointing, precision bf16 y optimizador AdamW de 8 bits.

Los hiperparametros clave son: alpha ORPO de 0,1, 2 epocas, batch efectivo de 16 (micro batch 4 x acumulacion 4), learning rate 1e-4 con scheduler coseno y warmup del 10%, y longitud de secuencia de 8.192 tokens. El dataset de preferencias es propietario, en formato de pares `chosen`/`rejected` convertidos a listas de mensajes estilo ChatML, con un 5% reservado para validacion. La model card indica que esta iteracion mejora sobre versiones previas que contenian datos de baja calidad, pero no se especifica el volumen de tokens ni la composicion del dataset.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con plantilla de chat ChatML.
- Razonamiento e instruccion general heredados del modelo base Mistral Small 24B.
- Menor tasa de rechazos y menor tendencia a la adulacion (sycophancy) que asistentes fuertemente alineados.
- Estilo de respuesta mas directo y opinionado, segun la model card.
- Capacidad de coherencia en contextos largos de hasta 8k tokens (evaluada cualitativamente por el autor).
- Apto como base para ajuste fino posterior, destilacion o integracion en sistemas de agentes.
- Tool calling / function calling: no confirmado en la informacion disponible (depende del base, pero no se documenta).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Chat conversacional general sin filtros excesivos: el modelo puede mantener dialogos multi-turno en ingles con un tono directo, adecuado para prototipos de asistentes donde los rechazos por defecto resultan molestos.
- Generacion de texto creativo y editorial: util para borradores de articulos, guiones o ficcion donde se prefiere un estilo menos edulcorado, gracias al ajuste ORPO que reduce la adulacion.
- Base para ajuste fino especifico de dominio: al ser un fine-tune de 24B con licencia abierta (no comercial), sirve como punto de partida para QLoRA sobre datos propios en investigacion.
- Investigacion en alineacion y preferencias: permite estudiar el efecto de ORPO frente a DPO/RLHF comparando respuestas del base y del ajuste sobre los mismos prompts.
- Sistemas de agentes experimentales: integrable en pipelines donde se requiera menor tasa de rechazo, aunque el soporte de tool calling no esta documentado y debe validarse.
- Evaluacion comparativa de refusal rates: util como referencia en estudios que miden la tasa de rechazo y la directness de modelos alineados frente a no alineados.
- Despliegue en una sola GPU para inferencia bf16: con 23,57B parametros en bf16 (~47 GB) cabe en A100/H100 de 80 GB, lo que facilita entornos de investigacion con hardware unico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion fue principalmente cualitativa (reduccion de rechazos, consistencia de estilo, retencion de razonamiento y coherencia hasta 8k tokens) y que no se reportan puntuaciones formales de benchmarks publicos en este momento.

## Requisitos de hardware

- VRAM estimada en bf16: ~47 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica requiere una GPU de 80 GB (A100 80GB, H100 80GB, B200) para contexto largo.
- VRAM estimada en cuantizacion 8 bits: ~24 GB de pesos, viable en RTX 4090 (24 GB) con contexto corto y margen ajustado.
- VRAM estimada en cuantizacion 4 bits: ~12-14 GB de pesos, cabe en RTX 4090, RTX 4080 (16 GB) y GPUs consumer de 16 GB o mas; el KV cache limita el contexto util.
- GPUs recomendadas: A100 80GB, H100 80GB o B200 para bf16 y contexto completo; RTX 4090 para cuantizaciones 8/4 bits.
- Despliegue: transformers (referencia en la model card), text-generation-inference (tag `text-generation-inference`), y en principio vLLM, llama.cpp u Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Entrenamiento original: una sola GPU NVIDIA B200+ via Modal con Axolotl.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Cerberus-24B | 23,57 B | 8k (entrenamiento) | other (no comercial) | ORPO + QLoRA, menos rechazos | safetensors en HF |
| Mistral-Small-24B-Instruct-2501 (base) | ~24 B | no disponible en esta ficha | Apache 2.0 (segun el base) | Instructivo alineado estandar | safetensors en HF |
| Modelos 24B no alineados tipo Dolphin/OpenHermes | variable | variable | variable | Reduccion de rechazos | HF, GGUF en muchos casos |

La comparacion cuantitativa con alternativas no puede completarse porque no hay benchmarks publicados para Cerberus-24B. Frente al base Mistral-Small-24B-Instruct-2501, la diferencia principal es el comportamiento (menos rechazos, mas directness) y la licencia mas restrictiva. Frente a otros fine-tunes "uncensored" de tamano similar, la ventaja declarada es la calidad del dataset de preferencias, aunque no se aportan metricas que lo respalden.

## Limitaciones y advertencias

- Licencia no comercial con atribucion obligatoria: el uso comercial requiere contactar con Catdrout Technologies AB para negociar terminos.
- Sesgos heredados del modelo base Mistral Small 24B, no mitigados por el ajuste ORPO.
- Riesgo de alucinacion presente como en cualquier LLM; no se reportan evaluaciones de factualidad.
- Mayor probabilidad de respuestas directas, opinionadas o provocadoras; puede generar contenido inapropiado en ausencia de filtros propios.
- Rendimiento fuera de los dominios cubiertos por los datos de preferencia no garantizado.
- Idioma principal ingles; soporte multilingue no documentado.
- Dataset de entrenamiento propietario: no es posible auditar la composicion ni los sesgos de los pares de preferencia.
- Sin benchmarks publicos: dificil estimar su calidad frente a alternativas antes de desplegarlo.
- La model card excluye explicitamente aplicaciones de alto riesgo (medico, legal, financiero) sin supervision humana y contenido que implique a menores.
- El contexto de 8k corresponde a la longitud de secuencia de entrenamiento; no se confirma el contexto nativo maximo del base en la informacion disponible.
- El repositorio tiene muy poca traccion (463 descargas, 1 like) y una sola iteracion documentada; soporte comunitario limitado.

## Enlaces

- Hugging Face: https://huggingface.co/c4tdr0ut/Cerberus-24B
- Repositorio alternativo citado en la model card: https://huggingface.co/c4tdr0ut/grok-oss-Cerberus
- Dataset de preferencias: https://huggingface.co/datasets/c4tdr0ut/grok-orpo
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Framework de entrenamiento Axolotl: https://github.com/axolotl-ai-cloud/axolotl
