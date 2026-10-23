# sam33339999/Sage-A1.5-Heretic-Abliterated-Uncensored-exl3-4.0bpw

## Resumen

Sage-A1.5 Heretic-Abliterated-Uncensored EXL3 4.0 bpw es una cuantización de 4 bits por peso (formato EXL3) del checkpoint BF16 `sam33339999/Sage-A1.5-Heretic-Abliterated-Uncensored`, un derivado del modelo multimodal `InternScience/Sage-A1.5` al que se le ha aplicado una ablación de rechazo («heretic/abliterated») para eliminar las respuestas de negativa. El autor de la cuantización es el usuario de HuggingFace `sam33339999`, que publica tanto el BF16 sin censura como esta versión comprimida generada con `convert.py` de exllamav3 1.6.4.

Arquitectura: transformer con mezcla de expertos (MoE) de la familia `qwen3_5_moe`, con torre visual (`Qwen3VLVisionModel`, procesador `Qwen2VLImageProcessorFast`, patch 16, temporal 2, merge 2) y una cabeza MTP (multi-token prediction) de una capa que actúa como borrador para decodificación especulativa. El total real de parámetros según los safetensors es de 9.869.978.480 (~9,87 mil millones).

Es relevante ahora porque combina tres tendencias: cuantización EXL3 de 4 bpw con cabeza de salida a 6 bits (pensada para inferencia rápida en GPU), multimodalidad imagen-texto y eliminación de guardarraíles conversacionales. Es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a experimentación local más que a producción. No se han publicado resultados de benchmarks ni la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal `qwen3_5_moe` con torre visual y cabeza MTP (multi-token prediction) |
| Parámetros totales | 9.869.978.480 (~9,87 B), dato real de safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 4.0 bpw en decodificador (~4,05 bpw medidos por capa), `lm_head` a 6 bits, MTP a 4 bits, torre visual en bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con `license_link` apuntando a `InternScience/Sage-A1.5`) |
| Formato de pesos | safetensors EXL3 (codebook `mul1`, `out_scales: auto`), 3 shards, ~19,8 GB |
| Librería de inferencia | exllamav3 (versión de conversión 1.6.4) |
| Pipeline | image-text-to-text |
| Calibración | 250 filas × 2048 columnas, corpus interno; sin `--hq`, sin recipe por tensor, sin cuantización de embeddings, sin tablas n-gram |
| Componentes del `config.json` | `text`, `vision`, `mtp` |
| Modelo base | `sam33339999/Sage-A1.5-Heretic-Abliterated-Uncensored` (BF16) |
| Modelo original | `InternScience/Sage-A1.5` (BF16) |
| Fecha de creación | 2026-10-23 |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento nuevo: no hay datos de preentrenamiento, número de tokens, composición del corpus ni fases de RLHF/DPO publicados en la información disponible. Lo que sí se documenta con precisión es el pipeline de compresión. El decodificador se convirtió con `convert.py` de exllamav3 a 4 bits por peso mediante codebook `mul1` y escalas de salida automáticas; la cabeza de salida se mantiene a 6 bits y la cabeza MTP a 4 bits. La torre visual se forzó a 16 bits con `-vb 16`, porque el valor por defecto de `Qwen3VLVisionModel` es 6 bpw y habría cuantizado los pesos visuales; el resultado es que `model.visual.*` permanece en bf16 y es idéntico bit a bit al checkpoint sin cuantizar (el autor verificó `model.visual.blocks.0.attn.proj.weight` y `model.visual.patch_embed.proj.weight`).

Un detalle técnico relevante: los shards del BF16 sin censura no contenían tensores `mtp.*` (`text_config.mtp_num_hidden_layers` vale 1 pero las claves no estaban en el índice), así que el autor importó `model-mtp.safetensors` directamente desde el modelo original `InternScience/Sage-A1.5` tras comprobar compatibilidad de arquitectura. La salida contiene `mtp.fc.trellis` y los trellis de expertos de `mtp.layers.0`, sin un `mtp.fc.weight` bf16 de forma `[2048, 4096]`. Los ficheros `preprocessor_config.json`, `processor_config.json` y `video_preprocessor_config.json`, ausentes en el BF16, también se copiaron del original para que `Qwen3_5MoeForConditionalGeneration` registre correctamente la visión. La decodificación especulativa se activa con el flag `-mtp` del ejemplo de chat, usando la cabeza MTP como draft.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla Qwen3.5 ChatML (`chat_template.jinja` copiada del checkpoint sin censura y aplicada por el `Tokenizer`).
- Comprensión de imágenes: pipeline `image-text-to-text`, con torre visual completa en bf16, lo que preserva la calidad del encoder respecto al modelo original.
- Respuestas sin rechazo: la ablación tipo «heretic/abliterated» elimina las negativas aprendidas por alineación, de modo que el modelo no declina peticiones por política.
- Decodificación especulativa mediante cabeza MTP de una capa (4 bpw), activable con `-mtp`.
- Soporte de tool calling / function calling: no verificado en la información disponible; la plantilla es Qwen3.5 ChatML, pero la model card no documenta tools.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- Modo thinking explícito, audio o vídeo: no documentado (existe `video_preprocessor_config.json`, pero no se describe soporte de vídeo).
- Inferencia por componentes separados (`text`, `vision`, `mtp`) desde Python con `Config.from_directory`, `Model`, `Tokenizer`, `Cache` y `Generator`.

## Casos de uso

- Análisis de documentos con imagen en local: el modelo acepta imagen y texto y puede extraer datos de capturas, facturas o formularios escaneados sin enviar el material a una API externa, algo útil en entornos con requisitos de confidencialidad.
- Prototipado multimodal en una sola GPU: al ocupar el decodificador unos 5 GB teóricos a 4 bpw, es viable experimentar con visión-lenguaje en hardware de gama alta de consumo, cosa imposible con el BF16 original.
- Generación de descripciones y texto alternativo a escala: el pipeline `image-text-to-text` permite procesar lotes de imágenes para etiquetado, alt-text o metadatos, con la torre visual intacta en bf16 para no degradar la percepción.
- Escritura creativa y roleplay sin filtros editoriales: el caso de uso natural de un checkpoint abliterated, donde el modelo no introduce negativas ni advertencias morales en la respuesta.
- Red teaming y auditoría de guardarraíles: sirve como referencia de «modelo sin alineación» para medir cuánto aporta cada capa de seguridad en un sistema comparable, comparando salidas contra el checkpoint original.
- Investigación sobre abliteration: al existir la cadena completa (original BF16, BF16 sin censura y esta cuantización EXL3), permite estudiar qué se degrada con la ablación y cuánto de esa degradación proviene de la cuantización a 4 bpw.
- Asistente conversacional autoalojado con exllamav3: integrable en un servicio propio mediante `Generator.generate()` con caché de KV persistente para sesiones multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y tampoco se aportan medidas de latencia o throughput. Cualquier cifra de rendimiento para este artefacto tendría que medirse localmente.

## Requisitos de hardware

- Espacio en disco: ~19,8 GB para los tres shards safetensors. Nota: el tamaño del repositorio es muy superior al teórico del decodificador a 4 bpw (~5 GB para 9,87 B de parámetros); el desglose por componente (torre visual en bf16, cabezas, posibles tensores auxiliares) no se detalla en la información disponible.
- VRAM estimada: como mínimo, la suficiente para alojar los pesos completos (~20 GB según el tamaño del repo) más la caché KV configurada en `Cache(model, max_num_tokens=...)`. Con 2048 tokens de caché, un presupuesto de 24 GB es ajustado; 32-48 GB deja margen.
- GPU recomendadas: L40S (48 GB), A100 40/80 GB, H100; en consumo, RTX 5090 (32 GB) o RTX 4090 (24 GB) solo con cachés pequeñas y sin margen.
- No cabe en GPUs de 8-16 GB en esta cuantización, y EXL3 requiere CUDA: no hay ruta de CPU.
- Despliegue: exclusivamente exllamav3 1.6.4 o superior (ejemplos `examples/chat.py` con `-mode qwen35`, API Python). No es compatible con llama.cpp, Ollama ni GGUF, y las instrucciones de vLLM/SGLang del modelo original no sirven para este directorio.
- Detalle de carga relevante: el objeto `Cache` debe crearse antes de `model.load()`, porque el loader configura en ese momento los estados KV y recurrentes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (EXL3 4.0 bpw) | 9,87 B totales | no disponible | EXL3 4 bpw, lm_head 6 bits, visión bf16 | apache-2.0 | HuggingFace, exllamav3 |
| `sam33339999/Sage-A1.5-Heretic-Abliterated-Uncensored` | 9,87 B aprox. (BF16) | no disponible | ninguna (BF16) | apache-2.0 | HuggingFace, vLLM/SGLang |
| `InternScience/Sage-A1.5` | no disponible en la información | no disponible | ninguna (BF16) | apache-2.0 según `license_link` | HuggingFace |
| Otros modelos de ~10 B multimodales | no disponible | no disponible | — | — | no disponible |

No se han identificado en la información proporcionada modelos externos comparables con datos verificables de parámetros, contexto o rendimiento; la comparación se limita a la propia cadena de derivación.

## Limitaciones y advertencias

- Ausencia total de alineación de seguridad: la ablación elimina las negativas, por lo que el modelo responderá a peticiones dañinas, ilegales o sexualmente explícitas sin filtro. No debe exponerse a usuarios finales sin una capa de moderación externa.
- Riesgo de degradación por la ablación: el proceso «heretic/abliterated» suele afectar a la coherencia, la utilidad general y la calibración de la incertidumbre; no hay benchmarks que cuantifiquen el daño.
- Alucinación: sin datos de evaluación no hay medida de fiabilidad factual; en tareas de extracción de datos de imágenes conviene validación posterior.
- Idiomas y contexto desconocidos: el campo de idiomas no está informado y la longitud de contexto no se publica, lo que impide planificar cargas de trabajo con documentos largos.
- Licencia: el artefacto declara apache-2.0, pero `license_link` remite al modelo original; conviene verificar los términos de `InternScience/Sage-A1.5` y del BF16 intermedio antes de un uso comercial. La cadena de derivados puede arrastrar condiciones adicionales.
- Dependencia frágil: solo funciona con exllamav3 1.6.4 o posterior; no hay GGUF, no hay ruta CPU y las instrucciones de despliegue del modelo original no son aplicables.
- Artefacto no validado por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin revisión independiente de la calidad de la cuantización.
- Los shards de origen no incluían los tensores MTP ni los ficheros de preprocesado; se tomaron del modelo original. Aunque el autor verificó formas y arquitectura, es un punto a auditar si se requiere reproducibilidad estricta.
- Cumplimiento normativo: un modelo sin guardarraíles puede entrar en conflicto con obligaciones de moderación de contenido en la UE y en plataformas comerciales.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/sam33339999/Sage-A1.5-Heretic-Abliterated-Uncensored-exl3-4.0bpw
- HuggingFace (BF16 sin censura, upstream directo): https://huggingface.co/sam33339999/Sage-A1.5-Heretic-Abliterated-Uncensored
- HuggingFace (modelo original): https://huggingface.co/InternScience/Sage-A1.5
- Repositorio de exllamav3: https://github.com/turboderp-org/exllamav3

La búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este modelo (solo resultados de contenido para adultos sin relación); por tanto, no se han encontrado papers, blogs ni demos adicionales.
