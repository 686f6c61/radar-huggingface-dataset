# ricer0ll/Miko-L3-8B-v2

## Resumen

Miko-L3-8B-v2 es un ajuste fino (fine-tune) del modelo base Meta Llama 3 8B, desarrollado por el usuario ricer0ll y publicado en Hugging Face. Se trata de la segunda iteración de la familia Miko, orientada específicamente a conversación, roleplay y narrativa (storytelling), con un enfoque declarado hacia contenido para adultos. El modelo parte del checkpoint base de Llama 3 8B (no del Instruct) y posteriormente se fusiona con Meta-Llama-3-8B-Instruct mediante la técnica TIES para recuperar capacidades generales y de razonamiento lógico.

Con 8.030.261.248 parámetros totales y pesos en formato safetensors (repo de 16,1 GB), el modelo mantiene la arquitectura transformer decoder-only estándar de Llama 3, con una longitud de contexto de entrenamiento de 8.192 tokens. Su relevancia es acotada: no es un modelo de propósito general ni compite en benchmarks de razonamiento o código, sino que se posiciona como un modelo comunitario de roleplay con licencia Llama 3, entrenado de forma individual en una única RTX 3090 durante aproximadamente 1,5 días.

La información pública disponible es escasa: cero descargas, cero likes en el momento de la ficha, sin resultados de benchmarks publicados y sin idiomas declarados. La model card detalla el pipeline de entrenamiento (Axolotl + QLoRA) y los datasets empleados, pero no aporta métricas de evaluación cuantitativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3, `LlamaForCausalLM`) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento); contexto nativo de Llama 3: 8.192 tokens |
| Tipos de cuantización | no disponible en la model card; al ser safetensors en bf16, admite cuantización posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | no disponible (no declarados; hereda el multilingüismo limitado de Llama 3 8B) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Meta Llama 3 8B, con atención causal estándar y sin modificaciones arquitectónicas propias. El entrenamiento se realizó con Axolotl sobre el checkpoint base `NousResearch/Meta-Llama-3-8B` (variante del base de Meta), usando QLoRA con carga en 4 bits, rango LoRA de 16, alpha 16, dropout 0,05 y módulos objetivo que cubren `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Se emplearon 2 épocas, learning rate 4e-5 con scheduler coseno, warmup ratio 0,1, optimizador AdamW de 8 bits, gradient checkpointing, Flash Attention 2, `sample_packing` y `sequence_len` de 8.192 con truncado de exceso. El entrenamiento completo llevó aproximadamente 1,5 días en una RTX 3090 con underclock y temperatura estable de 60 °C.

El dataset combina seis fuentes convertidas a formato OpenAI chat: PIPPA Smoll (5.000 filas seleccionadas de 38.199), Augmental (7.831 filas), un subconjunto pequeño de LimaRP (31 filas), Sonnet Charcard (9.736 filas), Stheno v1.1 filtrado (10.000 filas seleccionadas de 26.765) y el dataset propio de Miko v1 (2.576 filas). Tras el ajuste, el modelo resultante se fusionó con `meta-llama/Meta-Llama-3-8B-Instruct` mediante el método TIES, con `density: 0.7`, `weight: 0.5`, `normalize: true`, `int8_mask: true` y `rescale: true`, en bfloat16. Esta fusión busca recuperar capacidades generales y de razonamiento que el ajuste puro sobre base podría haber degradado. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat de Llama 3 (`<|start_header_id|>` / `<|end_header_id|>` / `<|eot_id|>`).
- Roleplay y caracterización de personajes, con énfasis declarado en personalidad, consistencia de personaje y narrativa.
- Storytelling y escritura creativa de ficción.
- Conversación general y tareas lógicas básicas, gracias a la fusión con Llama 3 8B Instruct.
- Contenido para adultos (NSFW) según declara el autor; el tag `not-for-all-audiences` está presente en el repo.
- Soporte de tool calling / function calling: no documentado; no se declara en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad específica.
- Capacidades multilingües: no declaradas; hereda el comportamiento de Llama 3 8B, con dominio principal del inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Roleplay conversacional con personajes persistentes: el modelo está ajustado sobre datasets de charcard y roleplay (Sonnet Charcard, Stheno, LimaRP), por lo que mantiene personajes coherentes en conversaciones multi-turno dentro de la ventana de 8.192 tokens.
- Escritura creativa de ficción y narrativa interactiva: adecuado para generar escenas, diálogos y continuaciones narrativas con estilo consistente, gracias al entrenamiento sobre datos de storytelling.
- Prototipado de chatbots de entretenimiento: puede desplegarse con TGI o llama.cpp para experimentar con personalidad y tono antes de invertir en modelos mayores.
- Generación de diálogos para videojuegos o narrativa ramificada: su enfoque en caracterización permite generar respuestas de PNJ con voz propia en inglés.
- Investigación sobre ajuste fino con QLoRA: la model card documenta configuración completa de Axolotl, datasets y curvas de pérdida, lo que lo convierte en una referencia reproducible para estudiar el efecto de la fusión TIES sobre un base fine-tuneado.
- Experimentación con contenido para adultos en entornos controlados: el autor declara buen rendimiento en NSFW; útil para investigación de filtros, moderación o generación creativa adulta con las salvaguardas legales correspondientes.
- Tareas generales ligeras de conversación: la fusión con Instruct permite usarlo como asistente conversacional básico en inglés, aunque sin garantías de rendimiento en razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente curvas de pérdida de entrenamiento y evaluación (train loss, eval loss, grad norm) en imágenes, sin valores numéricos transcritos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de KV cache; en la práctica, 18-20 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~8-9 GB; en 4 bits (GGUF Q4_K_M o similar): ~5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue concurrente; RTX 4090 (24 GB) para bf16 con contexto completo; RTX 3090 (24 GB) validada por el autor para entrenamiento.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 a bf16, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con cuantización a 4-8 bits.
- Opciones de despliegue: vLLM, TGI (el repo incluye el tag `text-generation-inference`), llama.cpp, Ollama (previa conversión a GGUF), Transformers con `attn_implementation="flash_attention_2"`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Miko-L3-8B-v2 | 8,03 B | 8.192 | Roleplay / conversación NSFW | llama3 | Hugging Face (repo comunitario, 0 descargas) |
| Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Asistente general | llama3 | Hugging Face (oficial Meta) |
| Stheno v1.1 (anthracite-org) | ~8 B (basado en Llama 3) | 8.192 | Roleplay | llama3 | Hugging Face (comunidad) |
| Sao10K / Llama-3-8B roleplay (familia) | ~8 B | 8.192 | Roleplay | llama3 | Hugging Face (comunidad) |

No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo entre estos modelos. La comparación se limita a parámetros, contexto, enfoque y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de Llama 3 8B y de los datasets de roleplay comunitarios (PIPPA, LimaRP, Stheno, Sonnet Charcard), que pueden reforzar estereotipos de género, rol y contenido sexual.
- Riesgo de alucinación: alto en tareas factuales; el ajuste está orientado a ficción y conversación, no a precisión factual.
- Limitaciones de contexto e idioma: ventana de 8.192 tokens, insuficiente para documentos largos; idiomas no declarados y dominio principal del inglés.
- Restricciones de licencia: Llama 3 Community License impone condiciones de uso, incluida la obligación de atribución y restricciones para empresas con más de 700 millones de usuarios mensuales; revisar antes de uso comercial.
- Contenido NSFW: el modelo está etiquetado `not-for-all-audiences` y el autor declara capacidad para contenido adulto; requiere moderación y cumplimiento legal en producción.
- Calidad no validada: sin benchmarks, sin descargas y sin evaluaciones independientes; el rendimiento declarado por el autor es subjetivo.
- Entrenamiento individual: ajuste QLoRA de 2 épocas sobre una RTX 3090, con posible sobreajuste a los datasets de roleplay y degradación de capacidades generales pese a la fusión TIES.
- Sin soporte documentado de tool calling ni agentes: no apto para pipelines que requieran function calling sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricer0ll/Miko-L3-8B-v2
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Modelo de fusión: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Iteración anterior: https://huggingface.co/ricer0ll/Miko-v1-m7
- Dataset PIPPA: https://huggingface.co/datasets/Xilabs/PIPPA-alpaca
- Dataset Augmental: https://huggingface.co/datasets/Heralax/Augmental-Dataset
- Dataset LimaRP: https://huggingface.co/datasets/PJMixers/lemonilia_LimaRP-Only-NonSus-Simple-CustomShareGPT
- Dataset Sonnet Charcard: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Dataset Stheno filtrado: https://huggingface.co/datasets/anthracite-org/stheno-filtered-v1.1
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Artista de la imagen de portada: https://www.fiverr.com/nahraya
