# c4tdr0ut/grok-oss-Cerberus-24B

## Resumen

Grok-OSS-Cerberus-24B es un ajuste fino (fine-tune) del modelo Mistral-Small-24B-Instruct-2501, desarrollado por Catdrout Technologies AB, un laboratorio de investigación con sede en Uppsala (Suecia). El modelo se presenta como una alternativa abierta y descentralizada a los asistentes comerciales fuertemente alineados, priorizando la franqueza en las respuestas y reduciendo el comportamiento de rechazo (refusal) característico de los modelos sometidos a un alineamiento intensivo.

Técnicamente, se trata de un modelo causal decoder-only de 23.572.403.200 parámetros (aproximadamente 24B), entrenado mediante ORPO (Odds Ratio Preference Optimization) sobre un adaptador QLoRA de 4 bits. El ajuste se realizó con Axolotl sobre hardware NVIDIA B200+ en Modal, con una longitud de secuencia de 8192 tokens y Flash Attention 2. La arquitectura subyacente es la del Mistral Small 24B, un transformer denso con atención de ventana deslizante y capacidades multilingües heredadas del modelo base.

Su relevancia radica en que ofrece un modelo de 24B con menor tasa de rechazos y un tono más directo, orientado a casos de uso donde el exceso de alineamiento resulta contraproducente (por ejemplo, agentes autónomos, generación creativa o investigación sobre comportamiento de modelos). La licencia es restrictiva: no comercial y con atribución obligatoria, lo que limita su adopción en productos comerciales sin negociación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Mistral Small 24B) |
| Parámetros totales | 23.572.403.200 (≈24B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (longitud de entrenamiento); contexto nativo del base Mistral Small 24B: 32k tokens (heredado, no verificado en esta ficha) |
| Tipos de cuantización | QLoRA 4-bit durante entrenamiento; pesos publicados en safetensors (bf16). Cuantizaciones GGUF disponibles en variantes derivadas (ver enlaces) |
| Idiomas soportados | Inglés (principal según la model card); el modelo base Mistral Small soporta múltiples idiomas, pero no se documenta explícitamente en esta ficha |
| Licencia | "Other": no exclusiva, no comercial, con atribución obligatoria; contacto con el autor para términos comerciales |
| Formato de pesos | safetensors (transformers); existen variantes GGUF de modelos relacionados (12B) |

## Arquitectura y entrenamiento

El modelo se basa en Mistral-Small-24B-Instruct-2501, un transformer decoder-only denso de aproximadamente 24B parámetros con atención de ventana deslizante (sliding window attention) y RoPE, heredado del linaje Mistral. Sobre esta base se aplicó un ajuste fino con ORPO (Odds Ratio Preference Optimization), una variante de alineamiento por preferencias que combina la pérdida de modelado de lenguaje con una penalización por odds ratio entre respuestas elegidas y rechazadas, sin necesidad de un modelo de recompensa separado (a diferencia de RLHF clásico).

El entrenamiento utilizó 4-bit QLoRA con rango r=32, alpha=16, dropout 0.05, y módulos objetivo que incluyen q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj y lm_head. Se entrenó durante 2 épocas con batch efectivo de 16, learning rate 1e-4, scheduler cosine, optimizador AdamW de 8 bits y warmup ratio 0.1, en precisión bf16 con Flash Attention 2 y gradient checkpointing. El dataset es propietario, con pares de preferencia en formato ChatML (chosen/rejected) y split de validación del 5%. El hardware empleado fue NVIDIA B200+ en Modal, con el framework Axolotl.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, con plantilla de chat ChatML.
- Razonamiento e instrucciones generales, heredados del base Mistral Small 24B Instruct.
- Menor tasa de rechazos y respuestas más directas y opinadas que los asistentes fuertemente alineados.
- Soporte de contexto largo hasta 8192 tokens (longitud de entrenamiento); coherencia evaluada cualitativamente hasta 8k.
- Capacidad de seguir instrucciones complejas y mantener personalidad consistente.
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni modo de razonamiento extendido (thinking) en la model card.
- Capacidades multilingües no verificadas explícitamente; el modelo base soporta varios idiomas, pero el ajuste se orienta al inglés.

## Casos de uso

- Agentes autónomos y pipelines multi-paso: el modelo puede integrarse en sistemas de agentes donde se prefieren bajas tasas de rechazo, evitando que el modelo decline tareas legítimas por un alineamiento excesivo. Su contexto de 8k tokens permite mantener historiales de conversación y resultados de herramientas.
- Generación creativa y narrativa: la reducción de rechazos y el tono directo lo hacen adecuado para escritura de ficción, guiones o contenido editorial que otros modelos filtran en exceso.
- Investigación sobre alineamiento y comportamiento: útil como objeto de estudio para comparar tasas de rechazo, sesgo y franqueza frente a modelos fuertemente alineados.
- Asistencia técnica en entornos controlados: explicación de código, depuración y discusión de temas técnicos sensibles (seguridad, criptografía, explotación de vulnerabilidades en laboratorio) donde un modelo restrictivo resultaría poco útil.
- Chat de propósito general autoalojado: despliegue privado para usuarios que quieren un asistente de 24B con menor censura, ejecutado en infraestructura propia (vLLM, TGI o llama.cpp con cuantización).
- Fine-tuning posterior y destilación: al ser un modelo abierto con pesos safetensors, sirve como base para ajustes adicionales en dominios especializados (legal, médico, industrial) bajo los términos de licencia del autor.
- Evaluación de robustez y red-teaming: permite estudiar cómo un modelo con menor alineamiento responde a prompts adversarios, útil para equipos de seguridad que diseñan filtros y salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación fue principalmente cualitativa, centrada en reducción de rechazos innecesarios, consistencia de franqueza y personalidad, retención de la capacidad de razonamiento del modelo base y coherencia en contextos largos (hasta 8k tokens). No se reportan puntuaciones formales de MMLU, HumanEval, GSM8K ni otras pruebas públicas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 47 GB solo para pesos (23.572.403.200 parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 48-64 GB de VRAM para contexto moderado.
- Cuantización 8-bit: ~24 GB de pesos; cuantización 4-bit (GPTQ/AWQ/GGUF Q4): ~12-14 GB de pesos, más caché KV.
- GPU recomendadas: A100 80GB, H100 80GB, B200 para bf16 sin cuantización; para 4-bit puede caber en RTX 4090 (24 GB) o RTX A6000 (48 GB) con contexto limitado.
- En GPU de consumo: posible en RTX 4090 con cuantización 4-bit y contexto reducido; en GPUs de 16 GB no cabe sin cuantización agresiva y offloading.
- Opciones de despliegue: transformers (referencia de la model card), vLLM, TGI (text-generation-inference, etiqueta endpoints_compatible), llama.cpp/Ollama con variantes GGUF (existen conversiones de modelos relacionados, no verificadas para este ID exacto).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Grok-OSS-Cerberus-24B | ~24B | 8k (entrenamiento) | No comercial, atribución | Fine-tune ORPO/QLoRA de Mistral Small 24B, menor rechazo |
| Mistral-Small-24B-Instruct-2501 | ~24B | 32k (nativo) | Apache 2.0 (según Mistral) | Modelo base; alineamiento estándar, mayor tasa de rechazo |
| Grok-OSS-Cerberus-12B (variante) | ~12B | No disponible | No disponible | Variante GGUF de menor tamaño del mismo linaje |
| Modelos "uncensored" de 20-30B (p. ej. Dolphin, Nous Hermes) | 20-30B | Variable | Variable (frecuentemente no comercial) | Alternativas con menor alineamiento; benchmarks no comparables en esta ficha |

## Limitaciones y advertencias

- Sesgos: persisten los sesgos del modelo base Mistral Small; el ajuste ORPO no los corrige y puede amplificar opiniones o tono provocador.
- Alucinación: riesgo estándar de los modelos generativos; no se reportan mitigaciones específicas ni evaluaciones de factualidad.
- Menor alineamiento: la reducción deliberada de rechazos implica mayor probabilidad de generar contenido sensible, opiniones fuertes o respuestas inapropiadas; se requiere filtrado y evaluación propios en producción.
- Contexto: entrenado con 8192 tokens; aunque el base soporta ventanas mayores, el comportamiento más allá de 8k no está garantizado.
- Idioma: orientado al inglés; rendimiento en castellano u otros idiomas no verificado.
- Licencia: no comercial y con atribución obligatoria; el uso comercial requiere contacto con el autor. Verificar términos exactos antes de desplegar.
- Usos fuera de alcance: aplicaciones de alto riesgo (médico, legal, financiero) sin supervisión humana, contenido con menores y cualquier uso ilegal.
- Madurez: modelo con 0 descargas y 0 likes en el momento de la consulta; sin benchmarks públicos ni validación comunitaria, lo que reduce la confianza para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c4tdr0ut/grok-oss-Cerberus-24B
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Dataset de preferencias: https://huggingface.co/datasets/c4tdr0ut/grok-orpo
- Repositorio relacionado (variante 12B GGUF): https://huggingface.co/c4tdr0ut/grok-oss-Cerberus-12B-GGUF
- Página del autor en Hugging Face: https://huggingface.co/c4tdr0ut/grok-oss
- Framework de entrenamiento Axolotl: https://github.com/axolotl-ai-cloud/axolotl
