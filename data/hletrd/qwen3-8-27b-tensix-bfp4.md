# hletrd/Qwen3.8-27B-Tensix-BFP4

## Resumen

Qwen3.8-27B-Tensix-BFP4 es una versión cuantizada del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario hletrd (Xylolabs) para su ejecución sobre aceleradores Tensix de Tenstorrent (Wormhole y Blackhole). La cuantización se ha aplicado exclusivamente a las capas lineales del modelo de lenguaje, redondeando sus pesos a `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso) mediante GPTQ con búsqueda de exponente por bloque; el resto de tensores (embeddings, normalizaciones, LM head, módulo MTP y torre visual) se conserva en bf16 o bfloat8_b. El resultado ocupa 17,60 GB empaquetados, con una media de 5,23 bits por peso, frente a los 53,79 GB del modelo base en BF16.

El modelo conserva la arquitectura del Qwen3.8-27B original, con 27.781.427.952 parámetros totales y una pipeline declarada de image-text-to-text, por lo que mantiene la capacidad multimodal del modelo base. La relevancia de esta ficha radica en que es un ejemplo poco habitual de cuantización orientada a hardware específico (NPU Tensix) en lugar de a GPU convencional, con un formato de pesos que TT-NN puede empaquetar sin re-redondeo.

La información pública es limitada: no hay datos de benchmarks de tareas, no se han medido velocidades en dispositivo y la validación en hardware real no se ha completado (solo se ha probado en el simulador ttsim de Blackhole). La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capas de atención, Gated DeltaNet y MLP; incluye módulo MTP y torre visual |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en capas lineales; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en LM head; bf16 en embeddings, normas, MTP y visual. Media: 5,23 bits/peso |
| Idiomas soportados | no disponible (la evaluación usa texto en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores ya sobre la rejilla BFP4); incluye `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención clásica (q, k, v, o en 16 capas), capas Gated DeltaNet (q, k, v, z, a, b y output en 48 capas) y capas MLP (gate, up, down en 64 capas), además de un módulo MTP (multi-token prediction) y una torre visual para entrada de imágenes. Esta versión cuantizada no reentrena el modelo: aplica GPTQ con búsqueda de exponente por bloque sobre las capas lineales, calibrado con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Solo se cuantizó y evaluó el modelo de lenguaje; el módulo `mtp` y la parte `visual` permanecen en bf16 sin cambios.

La innovación técnica principal es el formato de bloque flotante BFP4 de Tenstorrent: los pesos se almacenan en safetensors como bf16, pero cada valor ya está alineado a la rejilla BFP4, de modo que TT-NN los empaqueta sin un segundo redondeo. El repositorio incluye scripts (`pack_tensix.py`, `verify_grid.py`) para verificar que ningún valor cambia al empaquetar. No se dispone de información sobre el proceso de alineación (RLHF/DPO) del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat aplicable mediante `apply_chat_template`.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), heredado de la torre visual del modelo base en bf16.
- Razonamiento con modo "thinking" (la evaluación incluye 7 prompts de razonamiento ejecutados con thinking activado y desactivado).
- Generación de código y matemáticas: no hay benchmarks publicados en la información disponible, pero el modelo base se presenta en su blog como referencia para coding.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la calibración y evaluación cubren inglés y coreano; el resto de idiomas no está documentado.
- Predicción multi-token (MTP) conservada en bf16, potencialmente útil para decodificación especulativa, aunque no se documenta su uso.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole y Blackhole: el checkpoint está diseñado para empaquetarse directamente en TT-NN sin re-redondeo, lo que permite servir el modelo en NPUs Tensix con 17,60 GB de pesos en lugar de los 53,79 GB en BF16.
- Investigación en cuantización de bloque flotante: los scripts `verify_grid.py` y `pack_tensix.py` permiten reproducir la verificación de que cada matriz se empaqueta de forma exacta, útil para estudiar el impacto de BFP4 en modelos multimodales de 27B.
- Evaluación de fidelidad respecto a BF16: el modelo incluye métricas de KL medio (0,02783) y top-1 (93,19 %) sobre 4.094 posiciones de inglés y coreano, lo que sirve como referencia para comparar estrategias de cuantización (por ejemplo, frente a Q4_K_M de llama.cpp).
- Prototipado multimodal en hardware no-GPU: al conservar la torre visual en bf16, puede emplearse para tareas image-text-to-text en entornos Tensix, aunque la evaluación publicada solo cubre el modelo de lenguaje.
- Servicio de chat con plantilla de chat estándar: el quickstart con `transformers` y `device_map="auto"` permite ejecutar el modelo en GPU convencional para validación funcional antes de portarlo a Tensix.
- Reproducción de demos en tt-metal: el demo `qwen38_27b_qb2` de tt-metal v0.81.1 ejecuta el modelo en paralelo de tensores sobre cuatro chips Blackhole (QuietBox 2), útil para pruebas de integración en clústeres Tensix.
- Benchmarking de cuantización extrema: con 5,23 bits/peso de media y 0 respuestas perdidas frente a BF16 en el conjunto de 40 prompts, es un caso de estudio para evaluar cuánto margen hay antes de degradar calidad en modelos de 27B.

## Benchmarks y rendimiento

Los únicos datos publicados miden la cercanía al modelo BF16, no la calidad en tareas:

| Modelo | Bits/peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.8-27B) | 16 | 53,79 | 0 | 100 | 40 de 40 | - |
| **Qwen3.8-27B-Tensix-BFP4** | 5,23 | 17,596 | 0,02783 | 93,19 | 38 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,92 | 16,811 | 0,02084 | 93,50 | 40 de 40 | 0 |

El KL y el top-1 se calculan sobre 4.094 posiciones de WikiText-2 test y Wikipedia en coreano, como texto plano. Las respuestas corresponden a 33 prompts cortos con comprobación automática más 7 de razonamiento repetidos con thinking activado (40 en total). El criterio del autor exigía un KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida adicional; el modelo cumple con 1,34 veces y 0 perdidas. No se han medido velocidades en dispositivo. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 17,60 GB solo para pesos empaquetados; en la práctica, con activaciones y caché KV en bf16, se recomienda 24 GB o más para GPU convencional.
- GPU recomendadas: A100 40/80 GB, H100, RTX 4090 (24 GB, ajustado), RTX 6000 Ada; en general, GPUs con 24 GB o más.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen limitado; en GPUs de 16 GB no cabe sin cuantización adicional.
- Aceleradores objetivo: NPUs Tensix de Tenstorrent Wormhole y Blackhole; el demo de tt-metal requiere cuatro chips Blackhole (QuietBox 2) con paralelismo de tensores.
- Opciones de despliegue: `transformers` con `device_map="auto"` y `dtype="bfloat16"`; TT-NN 0.81.1 para empaquetado en Tensix; demo `qwen38_27b_qb2` de tt-metal v0.81.1 con `QWEN_PRECISION_CONFIG=baseline`; tt-forge (tt-xla) aún no probado con este checkpoint. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se ha medido velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Tensix-BFP4 | 27,78 B | no disponible | 5,23 | Apache 2.0 | Hugging Face (hletrd) |
| Qwen/Qwen3.8-27B (BF16) | 27,78 B | no disponible | 16 | Apache 2.0 | Hugging Face (Qwen) |
| Qwen3.8-27B Q4_K_M (llama.cpp) | 27,78 B | no disponible | 4,92 | Apache 2.0 | Generado por el autor, no publicado como repo |

La comparación se limita al mismo modelo base en distintas precisiones, ya que no se dispone de datos de benchmarks de tareas que permitan contrastar con alternativas de otros desarrolladores. Frente a BF16, BFP4 reduce el tamaño un 67 % (53,79 a 17,60 GB) con un KL medio de 0,02783 y 2 respuestas menos acertadas de 40. Frente a Q4_K_M, BFP4 tiene un KL ligeramente peor (0,02783 frente a 0,02084) y 2 respuestas menos, pero está optimizado para empaquetado exacto en TT-NN, algo que Q4_K_M no ofrece.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual y el módulo MTP no se han validado en esta versión.
- La evaluación en hardware Tensix real no se ha completado: solo se probó en el simulador ttsim de Blackhole; el demo de tt-metal requiere cuatro chips Blackhole y no se ejecutó completo.
- No se han publicado benchmarks de tareas (MMLU, HumanEval, GSM8K); las métricas disponibles miden fidelidad a BF16, no calidad.
- No hay mediciones de latencia ni throughput en dispositivo.
- El modelo base Qwen3.8-27B puede presentar sesgos y alucinaciones; esta versión cuantizada no corrige esos comportamientos y añade una pérdida adicional de fidelidad (KL medio 0,02783).
- La calibración de GPTQ se hizo solo con WikiText-2 y Wikipedia en coreano, lo que puede sesgar la cuantización hacia esos dominios.
- El soporte de tool calling, agentes y multilingüismo no está documentado en esta versión.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor declara que el modelo se proporciona "as is", sin garantía, y no está afiliado ni respaldado por Tenstorrent.
- El formato BFP4 está pensado para TT-NN; su uso en otras pilas de inferencia (vLLM, llama.cpp, TGI) no está soportado ni documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen3.8-27B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Revisión del modelo base citada: https://huggingface.co/Qwen/Qwen3.8-27B/tree/37561816e66b5b9153b1b64c10968c18c1e6f4a0
- Blog de Qwen3.8: https://qwen.ai/blog?id=qwen3.8
- Demo tt-metal qwen38_27b_qb2 (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Repositorio tt-metal: https://github.com/tenstorrent/tt-metal
