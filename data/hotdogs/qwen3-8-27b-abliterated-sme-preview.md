# hotdogs/Qwen3.8-27B-abliterated-sme-preview

## Resumen

El modelo `hotdogs/Qwen3.8-27B-abliterated-sme-preview` es un asistente de negocio para pymes (SME, small & medium enterprise) construido sobre la base `hotdogs/Qwen3.8-27B-abliterated`, que a su vez es una versión "abliterada" (con la dirección de rechazo eliminada) del modelo Qwen3.8-27B de Alibaba. El ajuste fino se realizó con LoRA sobre un dataset curado de análisis de documentos y llamada a herramientas, con el objetivo de razonar sobre ficheros CSV y documentos de oficina, ejecutar tool calling de forma correcta y responder preguntas de negocio, preservando a la vez la capacidad general del modelo base.

El modelo tiene 27.356 millones de parámetros, una arquitectura híbrida con 48 capas de atención lineal (GDN) y 16 de atención completa, y una ventana de contexto de 8192 tokens durante el entrenamiento. Está licenciado bajo Apache 2.0 y disponible en formato safetensors (BF16 fusionado, con la cabeza MTP preservada). Es relevante ahora porque combina un razonamiento híbrido de última generación con una especialización práctica en tareas documentales y de análisis de datos, una necesidad habitual en entornos empresariales de pequeño y mediano tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: 48 capas linear-attention GDN + 16 capas full-attention, patrón 3 GDN + 1 full) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 (ventana de entrenamiento; la base soporta más, no especificado) |
| Tipos de cuantizacion | BF16 (requerido para GDN; FP16 produce gradientes NaN). Disponible GGUF f16 con MTP head; se pueden generar quants personalizados (Q4_K_M, etc.) |
| Idiomas soportados | en, th (según metadatos); el modelo base Qwen3.8-27B soporta más idiomas, no especificado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16 fusionado, MTP head preservado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `Qwen3_5ForConditionalGeneration`, un modelo denso de 27B parámetros con una mezcla de atención: 48 de las 64 capas usan linear attention con estado recurrente constante (GDN, gated delta network), y las 16 restantes usan atención completa, en un patrón repetido de 3 capas GDN seguidas de 1 capa full-attention. La cabeza MTP (multi-token prediction) se conserva con `mtp_num_hidden_layers=1` (15 tensores MTP). Es un modelo multimodal (wrapper de visión presente), aunque en esta ficha se usa solo para texto.

El ajuste fino se realizó con LoRA SFT: r=32, α=64, dropout 0.0, sobre módulos q,k,v,o + gate,up,down y las proyecciones GDN (`in_proj_qkv,out_proj,in_proj_z,in_proj_a,in_proj_b`). Se entrenó durante 2 épocas (reanudado desde checkpoint) con contexto 8192, precisión BF16, LR 1e-4 con scheduler cosine, batch efectivo de 4 por GPU y 7 GPUs. Parámetros entrenables: ~233M (0.85% del total). La pérdida final (mediana época 2) es 0.048.

El dataset de entrenamiento (`hotdogs/sme-sft-docdata-qwen38`) tiene 8.827 filas (7.799 train / 1.028 valid), con 30% de filas de tool-call y 70% de QA, 100% de mensajes de asistente con razonamiento (think-tagged), 82.7% de respuestas encadenadas con evidencia, y 0% de duplicados exactos. Las herramientas incluyen `csv_aggregate`, `csv_filter`, `csv_head`, `csv_stats`, `doc_compare`, `doc_metadata`, `doc_read`, `doc_search`, `doc_summarize`, entre otras.

## Capacidades

- Generación de texto y razonamiento paso a paso, con mejoras significativas en matemáticas (GSM8K +21 puntos).
- Razonamiento sobre documentos de oficina: leer, resumir, buscar y comparar documentos (doc_read, doc_search, doc_summarize, doc_compare, doc_metadata).
- Análisis de ficheros CSV: filtrar filas, agregar, estadísticas básicas y ver primeras filas (csv_filter, csv_aggregate, csv_stats, csv_head).
- Tool calling validado: emite una única llamada a herramienta bien formada (`<tool_call>` con `<function>` y `<parameter>`), sin bucles infinitos.
- Razonamiento previo a cada llamada a herramienta (think-tagged).
- Capacidad multimodal (wrapper de visión presente), aunque en esta ficha se documenta su uso solo textual.
- Multilingüe según metadatos: inglés y tailandés (en, th).

## Casos de uso

- **Análisis de gastos empresariales**: dado un CSV de gastos, el modelo puede filtrar filas por departamento o importe, agregar totales y generar estadísticas, usando `csv_filter` y `csv_aggregate`. Es adecuado porque la ventana de 8192 tokens permite procesar tablas de tamaño medio y el tool calling está validado para evitar bucles.
- **Automatización de atención al cliente**: puede gestionar conversaciones multi-turno sobre productos o servicios de la pyme, razonando sobre documentos de producto o políticas internas mediante `doc_search` y `doc_summarize`.
- **Resumen de documentación interna**: para revisar contratos, informes o manuales, el modelo puede leer y resumir documentos extensos con `doc_read` y `doc_summarize`, con razonamiento encadenado a la evidencia.
- **Comparación de documentos**: para detectar diferencias entre versiones de un contrato o informe, usando `doc_compare`.
- **Generación de informes de negocio**: a partir de datos tabulares, el modelo puede producir informes narrativos con estadísticas, combinando `csv_stats` con generación de texto en lenguaje natural.
- **Asistente de análisis de datos para no técnicos**: un usuario sin conocimientos de SQL puede preguntar en lenguaje natural y el modelo traduce la consulta a una llamada de herramienta (`csv_filter`, `csv_aggregate`), facilitando el acceso a datos en pymes sin equipo de datos.
- **Integración en pipelines de agentes**: el formato de tool call validado permite integrar el modelo en sistemas de agente multi-paso para tareas de back-office (conciliación, inventario, etc.).

## Benchmarks y rendimiento

Se han publicado resultados de benchmarks en la model card, medidos con lm-eval HF backend en una máquina de 7× RTX 3090, con flags idénticos para base y fine-tune (sin chat-template en tareas de opción múltiple).

| Benchmark | Base | SME-Preview | Δ |
|---|---:|---:|---:|
| ARC-Challenge (0-shot, 300) acc | 0.5667 | 0.5700 | +0.003 |
| ARC-Challenge acc_norm | 0.5733 | 0.5733 | 0.000 |
| MMLU (0-shot, 200) | 0.8477 | 0.8449 | −0.003 |
| GSM8K (5-shot, strict) | 0.6000 | 0.8100 | +0.210 |
| GSM8K (5-shot, flexible) | 0.6500 | 0.8100 | +0.160 |

La divergencia KL entre base y modelo fusionado es baja (0.04–0.15) en prompts de prueba, indicando que el fine-tune no provoca un cambio catastrófico. No se han publicado resultados de benchmarks adicionales (como HumanEval o MMLU completo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 55.6 GB en BF16, por lo que se necesita aproximadamente 56 GB de VRAM para cargar el modelo completo en BF16 (sin cuantización). Con cuantización GGUF Q4_K_M, el peso se reduce a ~15-16 GB, cabiendo en GPUs de 24 GB (RTX 3090/4090).
- GPU recomendadas: para BF16 completo, 7× RTX 3090 (como se usó en entrenamiento) o GPUs de mayor VRAM como A100 (80 GB) o H100 (80 GB). Para inferencia con cuantización, RTX 4090 (24 GB) o A6000 (48 GB) son suficientes.
- Sí cabe en consumer GPU con cuantización (p. ej. RTX 4090 con GGUF Q4_K_M), pero no en BF16 completo.
- Opciones de despliegue: Transformers (con `AutoModelForImageTextToText`), llama.cpp/GGUF (f16 disponible, quants personalizables), y vLLM (según el ecosistema Qwen3.8, soporta el backbone híbrido). No se menciona Ollama ni TGI en la información.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| **Qwen3.8-27B-abliterated-sme-preview** (este) | 27.36B | 8192 (train) | Híbrida (48 linear-attn + 16 full-attn), MTP | Apache-2.0 | Fine-tune LoRA para tareas SME y tool-calling |
| Qwen3.8-27B-abliterated (base) | 27.36B | no especificado | Híbrida (48 linear-attn + 16 full-attn), MTP | Apache-2.0 | Abliterado (λ=1.2), sin fine-tune específico |
| Qwen3.8-27B (original) | 27B | no especificado | Híbrida (48 linear-attn + 16 full-attn) | Apache-2.0 | Modelo base de Alibaba, multimodal |

La comparación directa con otros modelos de 27B de la familia (p. ej. Qwen2.5-27B) no está disponible en la información proporcionada. Los datos de ARC/MMLU del base (0.5667 y 0.8477) coinciden con el baseline conocido de la familia, lo que valida la consistencia del harness.

## Limitaciones y advertencias

- Es una versión "preview" del fine-tune SME; puede haber errores en tareas no cubiertas por el dataset de entrenamiento.
- La abliteración del modelo base elimina el comportamiento de rechazo, lo que puede generar respuestas a peticiones que un modelo estándar rechazaría; se debe evaluar el riesgo en entornos de producción.
- El modelo está entrenado principalmente en inglés y tailandés (según metadatos); el rendimiento en otros idiomas puede ser inferior.
- La ventana de contexto de entrenamiento es 8192 tokens; aunque el modelo base puede soportar más, no se especifica la extensión real en este fine-tune.
- La arquitectura GDN requiere BF16; usar FP16 puede causar gradientes NaN en entrenamiento (no afecta a inferencia con pesos ya entrenados, pero hay que verificar).
- No se han publicado resultados de benchmarks en tareas de código (HumanEval) ni en vision, a pesar de que el modelo tiene wrapper multimodal.
- La licencia Apache-2.0 permite uso comercial, pero la abliteración puede implicar consideraciones éticas y legales según la jurisdicción.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-sme-preview
- Modelo base: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated
- Dataset de entrenamiento: https://huggingface.co/datasets/hotdogs/sme-sft-docdata-qwen38
- GGUF del modelo base (con MTP): https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-MTP-GGUF
- README del GGUF: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-MTP-GGUF/blob/main/README.md
- Instrucciones de uso del base: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated/blob/main/code/README.md
- vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Artículo sobre abliteración de Qwen3.8-27B: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- LLM Explorer del base: https://llm-explorer.com/model/hotdogs%2FQwen3.8-27B-abliterated,3OshiP1Xtg7XK84wjMjHc
