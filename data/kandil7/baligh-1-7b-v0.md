# Kandil7/Baligh-1.7B-v0

## Resumen

Baligh-1.7B v0 es un modelo de lenguaje causal de 1.720.574.976 parámetros (1.400 millones sin contar los embeddings) desarrollado por Kandil7, orientado prioritariamente al árabe y especializado en conocimiento islámico. Se construye sobre `unsloth/Qwen3-1.7B-Base` mediante un proceso de preentrenamiento continuado (CPT) seguido de ajuste supervisado (SFT), ambos con QLoRA de 4 bits en formato NF4. El resultado se distribuye como un modelo instructivo fusionado en FP16, listo para inferencia con la librería `transformers`.

La arquitectura subyacente es la de Qwen3: un transformer causal de 28 capas con atención GQA (16 cabezas de consulta y 8 de clave/valor), tamaño oculto de 2048 y un vocabulario de aproximadamente 152.000 tokens. El contexto nativo de la arquitectura es de 32.768 tokens, aunque la ventana efectiva de entrenamiento en esta versión v0 se limita a 2.048 tokens, sin escalado RoPE aplicado.

Su relevancia actual radica en la combinación de un tamaño reducido (apto para GPU de consumo) con un enfoque lingüístico muy específico: árabe formal (fusha) e inglés, con dominio declarado de fiqh, hadiz, tafsir y aqeedah. La licencia Apache 2.0 y el formato safetensors facilitan su integración en pipelines comerciales y de investigación, si bien el modelo se encuentra en una fase temprana de desarrollo (v0) con un plan de entrenamiento por etapas aún incompleto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3), 28 capas, GQA (16 cabezas Q / 8 KV), hidden size 2048 |
| Parámetros totales | 1.720.574.976 (1,4B sin embeddings) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos de arquitectura; ventana efectiva de entrenamiento de 2.048 tokens en v0 (sin escalado RoPE) |
| Tipos de cuantización | FP16 (Turing, sm_75); BF16 seleccionado automáticamente en Ampere+; QLoRA 4-bit NF4 usado en entrenamiento |
| Idiomas soportados | Árabe (principal, fusha) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado instructivo en FP16) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-1.7B-Base`, un transformer causal denso con 28 capas, atención de consultas agrupadas (GQA) con 16 cabezas de consulta y 8 de clave/valor, y un tamaño oculto de 2048. El tokenizador es el de Qwen3, con un vocabulario de aproximadamente 152.000 tokens que se mantiene sin cambios en esta versión. La atención utiliza SDPA por defecto, con actualización automática a `flash_attention_2` en arquitecturas sm_80 o superiores.

El entrenamiento se organiza en dos etapas. La primera, preentrenamiento continuado (CPT), emplea una mezcla de ArabicWeb24 (70%), ArabicText-Large (20%) y The Arabic Pile (10%), complementada con un ciclo islámico de colecciones de hadices, QA sobre el Corán y textos coránicos. Se aplica QLoRA 4-bit NF4 (r=16, alpha=16, dropout=0) sobre todas las proyecciones de atención y MLP, con longitud de secuencia de 1.024 tokens, learning rate de 2e-4 con scheduler coseno y warmup de 100 pasos, optimizador `adamw_8bit` y checkpointing de gradientes. La etapa 1 se validó con 1.000 pasos y hay planificados 50.000 para la etapa 2. La segunda etapa, SFT, usa CIDAR (40%), evol-instruct-arabic (35%), islamweb_fatwa (15%) y datos de sumarización en árabe (10%), con QLoRA 4-bit, enmascaramiento de pérdida solo en la respuesta (tokens de prompt a -100) y learning rate de 1e-4 con warmup de 500. Se validaron 5.000 pasos y se planifican 10.000.

Entre las decisiones de diseño destacadas figuran la eliminación del filtro de árabe en la limpieza del SFT (la función `sanitize()` vacía el texto no árabe en lugar de descartar la fila, preservando ejemplos mixtos), una partición a prueba de fugas por `fatwa_id` para que ninguna fatua aparezca simultáneamente en entrenamiento y evaluación, y una deduplicación de IslamWeb priorizando el árabe sobre otros idiomas.

## Capacidades

- Generación de texto en árabe formal (fusha) e inglés.
- Respuesta a preguntas sobre conocimiento islámico: fiqh, hadiz, tafsir y aqeedah.
- Seguimiento de instrucciones en árabe (entrenado con CIDAR y evol-instruct-arabic).
- Sumarización y reformulación de textos en árabe.
- Extracción de salida estructurada (JSON) según la model card.
- Conversación multi-turno (los datos ShareGPT de evol-instruct-arabic se proyectaron a esquema plano).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en árabe: el modelo puede gestionar conversaciones multi-turno con un contexto efectivo de 2.048 tokens, suficiente para interacciones de soporte típicas; su ajuste sobre CIDAR lo orienta a seguir instrucciones en árabe de forma directa.
- Consultas de conocimiento islámico de baja criticidad: respuestas orientativas sobre fiqh, hadiz o tafsir para aplicaciones educativas o de divulgación, siempre con revisión humana y sin sustituir el dictamen de un scholar cualificado.
- Sumarización de documentos en árabe: resúmenes de artículos, fatuas o textos largos, aprovechando el 10% de datos de sumarización incluidos en el SFT.
- Extracción de datos estructurados: generación de JSON a partir de texto en árabe para pipelines de ingestión de contenido, según la capacidad declarada en la model card.
- Prototipado e investigación en PLN árabe: modelo pequeño (1,7B) que cabe en GPU de consumo, útil para experimentar con ajuste fino adicional o evaluación de técnicas de CPT sobre Qwen3.
- Asistentes de estudio de árabe formal: práctica de lectura, reformulación y respuesta a preguntas en fusha, dado que v0 se centra en árabe formal y no en dialectos.
- Despliegue en entornos con recursos limitados: al ser un modelo de 1,7B en FP16 (unos 3,5 GB de pesos), puede servirse en una única GPU consumer para aplicaciones de baja latencia.

## Benchmarks y rendimiento

| Benchmark | Baseline (Qwen3-1.7B-Base sin tocar) | Post-SFT (Baligh-1.7B v0) | Delta |
|---|---|---|---|
| CIDAR ROUGE-L | 0,0402 | 0,0543 | +35% |
| CIDAR BLEU | 2,28 | 1,32 | −42% |

Notas de la model card: MMLU-Arabic está bloqueado por un desajuste de esquema CSV en la herramienta de evaluación (no es un problema del modelo). La caída de BLEU tras el SFT se atribuye probablemente a que el modelo genera respuestas más largas y fluidas que divergen de las referencias cortas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en FP16/BF16 (tamaño del repo: 3,5 GB); en cuantización de 8 bits en torno a 1,8-2 GB y en 4 bits alrededor de 1-1,2 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; A100, H100 o RTX 4090 para mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más (por ejemplo RTX 3060, RTX 4060, RTX 4090). En Turing (sm_75) se usa FP16; en Ampere o superior se selecciona BF16 automáticamente.
- Opciones de despliegue: `transformers` (soporte nativo, con `trust_remote_code=True`); compatible con text-generation-inference y endpoints según los tags del repositorio. No se confirma soporte de llama.cpp, Ollama, vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Baligh-1.7B v0 | 1,72B | 32.768 nativos; 2.048 efectivos en v0 | Árabe, inglés | Apache 2.0 | Árabe + conocimiento islámico |
| Qwen3-1.7B-Base (modelo base) | 1,72B | 32.768 | Multilingüe | Apache 2.0 | Propósito general |
| Alternativas comparables de 1-2B especializadas en árabe | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otras alternativas de la misma categoría (modelos de 1-2B orientados al árabe) no está disponible en la información proporcionada. El único punto de referencia documentado es su modelo base, Qwen3-1.7B-Base, sobre el que se aplican CPT y SFT.

## Limitaciones y advertencias

- No sustituye a scholars islámicos cualificados: puede alucinar en dictámenes religiosos específicos.
- Conocimiento limitado a la fecha de corte de los datos de entrenamiento.
- El rendimiento en dialectos árabes es variable; v0 se centra en fusha.
- El contexto efectivo es la ventana de entrenamiento de 2.048 tokens, no el máximo nativo de 32.768.
- No apto para decisiones de alto riesgo (médicas, legales o financieras).
- La evaluación publicada es muy limitada: solo ROUGE-L y BLEU sobre CIDAR, con una caída de BLEU del 42% que el autor atribuye a respuestas más largas.
- Versión v0 con entrenamiento incompleto: la etapa 1 se validó con 1.000 de 50.000 pasos planificados y la etapa 2 con 5.000 de 10.000.
- Licencia Apache 2.0: permite uso comercial, pero el modelo hereda los sesgos y limitaciones de sus datos de entrenamiento (web árabe y corpus islámicos), no documentados en detalle.
- El repositorio tiene 560 descargas y 0 likes en el momento de la consulta, lo que indica una adopción todavía muy baja y poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kandil7/Baligh-1.7B-v0
- Repositorio GitHub: https://github.com/Kandil7/Baligh-1.7B
- Documentación: https://github.com/Kandil7/Baligh-1.7B/tree/main/docs
- Licencia: https://github.com/Kandil7/Baligh-1.7B/blob/main/LICENSE
- Modelo base: https://huggingface.co/unsloth/Qwen3-1.7B-Base
- Dataset ArabicWeb24: https://huggingface.co/datasets/lightonai/ArabicWeb24
- Dataset ArabicText-Large: https://huggingface.co/datasets/Jr23xd23/ArabicText-Large
- Dataset TheArabicPile_Dialects: https://huggingface.co/datasets/premio-ai/TheArabicPile_Dialects
- Dataset CIDAR: https://huggingface.co/datasets/arbml/CIDAR
- Dataset evol-instruct-arabic: https://huggingface.co/datasets/FreedomIntelligence/evol-instruct-arabic
- Dataset islamweb-fatwa-ar: https://huggingface.co/datasets/Kandil7/islamweb-fatwa-ar
