# Kandil7/Baligh-1.7B

## Resumen

Baligh-1.7B v0 es un modelo de lenguaje causal especializado en árabe e islamística, desarrollado por Kandil7 a partir de `unsloth/Qwen3-1.7B-Base`. El modelo se construye en dos etapas: un preentrenamiento continuado (CPT) sobre corpus masivos de árabe web y textos islámicos, seguido de un ajuste supervisado (SFT) con instrucciones en árabe y pares de pregunta-respuesta sobre fiqh, hadiz y tafsir. La arquitectura subyacente es la de Qwen3, con 28 capas, GQA (16 cabezas de consulta y 8 de clave-valor), tamaño oculto de 2048 y 1.720.574.976 parámetros totales (1,4B sin contar embeddings).

El modelo es relevante porque aborda un nicho poco cubierto por los modelos generalistas: el árabe formal (fusha) con conocimiento islámico estructurado, manteniendo un tamaño reducido que permite inferencia en hardware de consumo. No obstante, se trata de una versión v0 con entrenamiento limitado (1.000 pasos en CPT y 5.000 en SFT), ventana efectiva de 2.048 tokens y resultados de evaluación todavía preliminares.

La licencia Apache 2.0 y el formato safetensors FP16 facilitan su integración en pipelines existentes, aunque su rendimiento en benchmarks automáticos es bajo y el autor advierte explícitamente de que no sustituye a especialistas religiosos cualificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3), 28 capas, GQA (16 query / 8 KV heads), hidden size 2048 |
| Parámetros totales | 1.720.574.976 (1,4B sin embeddings) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; ventana de entrenamiento efectiva de 2.048 tokens (sin RoPE scaling) |
| Tipos de cuantización | FP16 (Turing); bf16 auto-seleccionado en Ampere+; QLoRA 4-bit NF4 durante entrenamiento |
| Idiomas soportados | Árabe (principal, fusha) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo merged instruct, FP16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer causal denso con 28 capas, atención GQA (16 cabezas de consulta y 8 de clave-valor), tamaño oculto de 2048 y tokenizer Qwen3 con vocabulario de ~152K tokens. La atención usa SDPA con actualización automática a `flash_attention_2` en GPUs sm_80+. El contexto nativo es de 32.768 tokens, pero la v0 se entrenó con ventana de 2.048 tokens sin aplicar RoPE scaling, por lo que el contexto efectivo real es mucho menor que el arquitectónico.

El entrenamiento se divide en dos etapas. La primera, CPT, usa QLoRA 4-bit NF4 (r=16, alpha=16) sobre todas las proyecciones de atención y MLP, con una mezcla de ArabicWeb24 (70%), ArabicText-Large (20%) y The Arabic Pile (10%), más un ciclo islámico con colecciones de hadices, QA del Corán y textos coránicos. Se ejecutaron 1.000 pasos (con 50.000 planificados para una etapa 2), learning rate 2e-4, scheduler coseno con warmup 100, optimizador adamw_8bit y gradient checkpointing. La segunda etapa, SFT, usa QLoRA 4-bit NF4 con enmascaramiento de pérdida solo en la respuesta (prompt tokens a -100), sobre CIDAR (40%), evol-instruct-arabic (35%), islamweb_fatwa (15%) y resumen en árabe (10%). Se ejecutaron 5.000 pasos (10.000 planificados), learning rate 1e-4, warmup 500.

Entre las decisiones técnicas destacables: se eliminó el filtro de árabe en la limpieza del SFT (la función `sanitize()` vacía el texto no árabe en lugar de descartar filas, preservando ejemplos mixtos), se aplicó un split seguro por `fatwa_id` para evitar fugas entre train y eval, y se deduplicó IslamWeb por ID de fatwa priorizando árabe. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto en árabe formal (fusha) e inglés.
- Respuesta a preguntas de conocimiento islámico: fiqh, hadiz, tafsir, aqeedah y Corán.
- Seguimiento de instrucciones en árabe (entrenado sobre CIDAR y evol-instruct-arabic).
- Resumen y reformulación de texto en árabe.
- Salida estructurada (extracción JSON) según la model card.
- Razonamiento multi-turno limitado por la ventana efectiva de 2.048 tokens.
- No se documenta soporte explícito de tool calling ni function calling.
- No se documenta modo thinking, visión ni audio.
- Capacidad multilingüe limitada a árabe e inglés; el rendimiento en dialectos árabes varía y la v0 se centra en fusha.

## Casos de uso

- Asistente de consulta islámica de baja criticidad: el modelo puede responder preguntas sobre pilares del islam, conceptos de fiqh o pasajes coránicos, siempre con revisión humana y sin sustituir a un especialista. Adecuado por su especialización en el dominio y su tamaño reducido.
- Resumen de textos árabes: útil para condensar artículos, fatwas o documentos largos en fusha, aprovechando el entrenamiento específico en resumen (10% del dataset SFT).
- Extracción estructurada en árabe: generación de JSON a partir de texto no estructurado (por ejemplo, campos de una fatwa o metadatos de un hadiz), gracias al entrenamiento con esquema `{instruction, input, output}`.
- Chatbot de atención al cliente en árabe formal: conversaciones multi-turno acotadas a la ventana de 2.048 tokens, con respuestas en fusha; requiere truncado o resumen de historial.
- Prototipado y experimentación académica: modelo pequeño (1,7B) que cabe en GPUs de consumo, útil para investigar CPT y SFT con QLoRA sobre dominios especializados.
- Generación de material educativo en árabe: reformulación de textos, preguntas de comprensión o explicaciones simplificadas de conceptos islámicos, con supervisión editorial.
- Filtrado y clasificación de corpus árabes: uso del modelo como generador de etiquetas o reformulador en pipelines de datos, dado su conocimiento del dominio.

## Benchmarks y rendimiento

| Benchmark | Baseline (base sin tocar) | Post-SFT | Delta |
|---|---|---|---|
| CIDAR ROUGE-L | 0,0402 | 0,0543 | +35% |
| CIDAR BLEU | 2,28 | 1,32 | −42% |
| Sunni auto (7 ítems) | 0/7 | 0/7 | — |

Resultados del benchmark Sunni-Core (16 ítems, 7 puntuados automáticamente): quran_exact_match 0/2, hadith_attribution 0/1, rag_faithfulness 0/2, refusal_calibration 0/1, safety_deferral 0/1; 9 ítems pendientes de revisión humana (fiqh, aqeedah, calidad del árabe). MMLU-Arabic está bloqueado por un desajuste de esquema CSV en el upstream, no por el modelo. La caída de BLEU se atribuye a que el modelo post-SFT genera respuestas más largas y fluidas que divergen de las referencias cortas. El benchmark Sunni es un piloto de 16 ítems; se planea ampliarlo a 50-100 ítems por categoría.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~3,5 GB de pesos más overhead de activaciones y KV cache; en la práctica, 6-8 GB para contextos moderados.
- VRAM en cuantización 4-bit (GGUF/AWQ): ~1,2-1,5 GB de pesos, con 3-4 GB totales para contextos cortos.
- GPUs recomendadas: A100, H100 o L40S para despliegue en producción con bf16 y `flash_attention_2`; RTX 4090, RTX 3090 o RTX 4080 para inferencia local en FP16.
- Cabe en GPUs de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores; en 4-bit también en GPUs de 8 GB.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), vLLM, TGI (tag `text-generation-inference`), llama.cpp y Ollama previa conversión a GGUF (no se distribuye GGUF oficial en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| Baligh-1.7B v0 | 1,72B | 32.768 nativos / 2.048 efectivos | ar, en | Apache 2.0 | Árabe + islamística |
| Qwen3-1.7B-Base | 1,72B | 32.768 | multilingüe | Apache 2.0 | Generalista |
| Fanar-1-9B (QCRI) | ~9B | no disponible | ar, en | no disponible | Árabe generalista |
| AceGPT-v2-8B | ~8B | no disponible | ar, en | no disponible | Árabe generalista |

La comparativa se limita a modelos de la misma familia o categoría (árabes de tamaño pequeño-medio); no se dispone de datos de benchmarks cruzados en la información proporcionada. Baligh-1.7B destaca por su especialización islámica y su tamaño reducido, pero su ventana efectiva de 2.048 tokens y sus resultados preliminares lo sitúan por debajo de alternativas de mayor tamaño en tareas generales de árabe.

## Limitaciones y advertencias

- No sustituye a especialistas islámicos cualificados; puede alucinar en dictámenes religiosos específicos.
- Conocimiento limitado al corte temporal de los datos de entrenamiento.
- El rendimiento en dialectos árabes varía; la v0 se centra en fusha.
- Contexto efectivo de 2.048 tokens, muy inferior al máximo nativo de 32.768.
- No apto para decisiones de alto riesgo (médicas, legales, financieras).
- El benchmark Sunni es un piloto de 16 ítems; la precisión de citas no está validada a escala.
- Resultados automáticos bajos (ROUGE-L 0,0543 en CIDAR; 0/7 en Sunni auto), lo que indica que el ajuste es todavía incipiente.
- Entrenamiento con solo 1.000 pasos de CPT y 5.000 de SFT (frente a 50.000 y 10.000 planificados), por lo que la calidad dista de la versión final prevista.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre exactitud en materia religiosa.
- No se distribuyen pesos GGUF oficiales; la conversión para llama.cpp/Ollama corre a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kandil7/Baligh-1.7B
- Repositorio GitHub: https://github.com/Kandil7/Baligh-1.7B
- Licencia en GitHub: https://github.com/Kandil7/Baligh-1.7B/blob/main/LICENSE
- Modelo base: https://huggingface.co/unsloth/Qwen3-1.7B-Base
- Dataset ArabicWeb24: https://huggingface.co/datasets/lightonai/ArabicWeb24
- Dataset ArabicText-Large: https://huggingface.co/datasets/Jr23xd23/ArabicText-Large
- Dataset The Arabic Pile (dialectos): https://huggingface.co/datasets/premio-ai/TheArabicPile_Dialects
- Dataset CIDAR: https://huggingface.co/datasets/arbml/CIDAR
- Dataset evol-instruct-arabic: https://huggingface.co/datasets/FreedomIntelligence/evol-instruct-arabic
- Dataset islamweb-fatwa-ar: https://huggingface.co/datasets/Kandil7/islamweb-fatwa-ar
