# sasudo2/llama2_7b_PCG

## Resumen

`llama2_7b_PCG` es un modelo de lenguaje causal publicado en HuggingFace por el desarrollador independiente Sanjay Shrestha (usuario `sasudo2`). Se trata de un ajuste fino (fine-tune) sobre la arquitectura Llama 2 de 7.000 millones de parámetros, empaquetado en formato safetensors y distribuido con licencia Apache-2.0. El repositorio ocupa 13,5 GB y contiene 6.738.415.616 parámetros reales, coherentes con la variante de 7B de la familia Llama 2.

El modelo mantiene la configuración estructural estándar de Llama 2: 32 capas, dimensión oculta de 4096, 32 cabezas de atención con 32 cabezas Key-Value (atención multi-cabeza clásica, sin GQA) y una ventana de contexto máxima de 4096 tokens. La model card indica que el ajuste está orientado a "generación creativa de código o tareas de generación específicas de dominio", con parámetros de muestreo preconfigurados (temperatura 0,6, top-p 0,9).

La relevancia de este modelo es limitada: cuenta con 5 descargas y 0 likes en el momento de la consulta, no dispone de pipeline declarado ni de resultados de evaluación publicados, y la información sobre el proceso de entrenamiento es prácticamente inexistente. Debe tratarse como un experimento de ajuste fino de un único autor, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (`LlamaForCausalLM`), atención multi-cabeza completa |
| Parametros totales | 6.738.415.616 (~6,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | No disponible en el repositorio; pesos en `float16`. Compatible con cuantización estándar vía GGUF/AWQ/GPTQ por arquitectura Llama, pero no se publican artefactos |
| Idiomas soportados | Inglés (según model card); "with fine-tuned adaptation tracks" sin más detalle |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`float16`) |

Otros parámetros técnicos declarados: `hidden_size` 4096, `num_hidden_layers` 32, `num_attention_heads` 32, `num_key_value_heads` 32, `intermediate_size` 11008, activación SiLU, vocabulario de 32.000 tokens (`LlamaTokenizer`), tokens BOS/EOS con IDs 1 y 2.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal estándar de la familia Llama 2, sin modificaciones estructurales aparentes: 32 capas, atención multi-cabeza completa (32 cabezas Q y 32 cabezas KV, es decir, sin grouped-query attention), FFN con `intermediate_size` de 11008 y activación SiLU. La normalización es RMSNorm y el positional encoding es RoPE, como corresponde a la arquitectura Llama, aunque la model card no los menciona explícitamente. El contexto máximo es de 4096 tokens.

No se dispone de información sobre el proceso de entrenamiento: la model card no indica el número de tokens utilizados, la composición del dataset de ajuste fino, si se aplicaron técnicas de RLHF, DPO o SFT supervisado, ni qué diferencia este checkpoint del Llama 2 base. Tampoco se documenta el propósito del sufijo "PCG" en el nombre del modelo. No hay información sobre innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto autoregresiva en inglés, con posible adaptación a dominios específicos según la model card (no detallada).
- Generación de código: la model card menciona explícitamente "creative code generation" como caso de uso objetivo de los parámetros de muestreo.
- Plantilla de chat en formato Llama 2 (`<<SYS>>`, `[INST] ... [/INST]`, `<s>` / `</s>`), lo que permite conversación multi-turno estructurada.
- Razonamiento y matemáticas: capacidades heredadas del Llama 2 base, sin evidencia de mejora específica publicada.
- Tool calling / function calling: no documentado; no se declara soporte.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: la model card indica inglés; no se declara soporte para otros idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Generación de código asistida en entornos de prototipado: el modelo puede completar fragmentos de Python u otros lenguajes con la plantilla de instrucciones Llama 2, adecuado para experimentación local dado su tamaño de 7B y su licencia Apache-2.0.
- Generación de texto creativo y de dominio específico: los parámetros de muestreo por defecto (temperatura 0,6, top-p 0,9) están ajustados para generación creativa, lo que encaja en tareas de redacción, ideación o generación de variantes de contenido.
- Experimentación académica sobre fine-tuning: al ser un checkpoint Llama 2 de 7B con licencia permisiva, sirve como punto de partida o comparativa en estudios de ajuste fino, siempre que se documente su procedencia.
- Chatbot conversacional de contexto medio: con 4096 tokens de ventana y plantilla de chat Llama 2, puede gestionar conversaciones multi-turno de extensión moderada en inglés.
- Evaluación comparativa de checkpoints comunitarios: útil para medir el impacto de ajustes finos no documentados frente al Llama 2 base en tareas concretas.
- Despliegue en hardware de consumo para pruebas: al ser un 7B en fp16 (13,5 GB), puede ejecutarse cuantizado en GPUs de consumo con suficiente VRAM, lo que facilita pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16-18 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: ~7-8 GB de pesos, en torno a 10-12 GB con overhead.
- VRAM estimada en cuantización de 4 bits: ~4-5 GB de pesos, en torno a 6-8 GB con overhead y contexto completo.
- GPU recomendadas: A100 40GB, H100, L40S para fp16 con contexto completo; RTX 4090 (24 GB) para fp16 ajustado o 8 bits; RTX 3090/4080 para 8 bits; RTX 3060 12 GB o superior para 4 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 u 8 bits en GPUs con 8-24 GB de VRAM.
- Opciones de despliegue: `transformers` (según el ejemplo de la model card), vLLM y TGI para servir en fp16; llama.cpp y Ollama requieren conversión previa a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `sasudo2/llama2_7b_PCG` | ~6,7B | 4096 | Apache-2.0 | HuggingFace, 5 descargas | Fine-tune sin evaluación publicada |
| Llama 2 7B (Meta) | ~6,7B | 4096 | Llama 2 Community License | Amplia | Modelo base de referencia; benchmarks publicados |
| Mistral 7B | ~7,2B | 8192 (32k en v0.2/v0.3) | Apache-2.0 | Amplia | GQA, Sliding Window Attention, benchmarks públicos |
| Llama 3.1 8B | ~8B | 131072 | Llama 3.1 Community License | Amplia | Contexto muy superior, GQA, evaluaciones publicadas |

La comparación con Llama 2 7B es la más directa por procedencia arquitectónica; Mistral 7B y Llama 3.1 8B ofrecen contexto mayor y evaluación pública, lo que los hace preferibles para producción salvo que se requiera específicamente este checkpoint.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación cualitativa, ni descripción del dataset de ajuste fino; es imposible estimar su calidad frente al Llama 2 base.
- Riesgo de alucinación: inherente a los modelos de 7B de la generación Llama 2, sin mitigaciones documentadas.
- Sesgos: no documentados; hereda los sesgos del corpus de preentrenamiento de Llama 2, no auditados en este checkpoint.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea deficiente.
- Contexto limitado a 4096 tokens, inferior a alternativas actuales de la misma categoría.
- Licencia: Apache-2.0 declarada por el autor, pero conviene verificar la procedencia del checkpoint base, ya que Llama 2 se distribuye bajo Llama 2 Community License y no bajo Apache-2.0; existe ambigüedad legal sobre la relicenciación de derivados.
- Madurez: 5 descargas y 0 likes indican ausencia de validación por la comunidad; no apto para producción sin evaluación propia exhaustiva.
- Sin artefactos de cuantización publicados (GGUF, AWQ, GPTQ), lo que obliga a generarlos localmente para despliegue eficiente.
- El sufijo "PCG" y las "fine-tuned adaptation tracks" mencionadas no están explicados, lo que impide conocer el dominio real de especialización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sasudo2/llama2_7b_PCG
- Configuración: https://huggingface.co/sasudo2/llama2_7b_PCG/blob/main/config.json
- Configuración de generación: https://huggingface.co/sasudo2/llama2_7b_PCG/blob/main/generation_config.json
- Tokenizer: https://huggingface.co/sasudo2/llama2_7b_PCG/blob/main/tokenizer.json
- Configuración del tokenizer: https://huggingface.co/sasudo2/llama2_7b_PCG/blob/main/tokenizer_config.json
- Plantilla de chat: https://huggingface.co/sasudo2/llama2_7b_PCG/blob/main/chat_template.jinja
- Paper de Llama 2 (modelo base): https://arxiv.org/abs/2307.09288
