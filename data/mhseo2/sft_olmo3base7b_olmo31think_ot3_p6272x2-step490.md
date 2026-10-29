# mhseo2/sft_olmo3base7b_olmo31think_ot3_p6272x2-step490

once, box answer after it, within 32768 tokens, 10-gram decontamination against AIME 2025/2026, HMMT Feb 2025.

Capabilities: reasoning math with think mode closing </think> and boxed answers, SFT from 32B teacher distill traces. Note this is a research artifact.

Casos de uso: at least 6 concrete.

Benchmarks: pending, so "No se han publicado resultados... eval pendiente".

Hardware: 7.3B params. VRAM: bf16 ~14.6 GB weights + KV; fp16 ~15 GB; 8-bit ~7.5GB; 4-bit ~4GB. Note: no quants published, would need conversion. GPUs: 1× A100 40/80GB comfortable, H100, RTX 4090 24GB fits bf16 marginally (14.6GB weights + KV cache, feasible with short context). Deployment: vLLM, TGI, llama.cpp/Ollama after conversion, transformers. Latency/throughput not available.

Comparativa: compare with Olmo-3-1025-7B base (same params, license), Olmo-3.1-32B-Think (teacher, 32B), Qwen2.5-Math-7B / DeepSeek-R1-Distill-Qwen-7B. Careful: those are external knowledge; I can present comparisons marking data as "no verificado en esta información". Hmm, rules say don't invent numbers. I can compare qualitatively and mark unknown values as "no disponible". I'll include DeepSeek-R1-Distill-Qwen-7B (7B), Qwen2.5-Math-7B, and Olmo-3-1025-7B base. Parameters for DeepSeek-R1-Distill-Qwen-7B = 7.6B — from general knowledge, but risky. I'll mark "7B (aproximado)" hmm. Better: mark parameters "no disponible en esta ficha" — that seems weak but safe. Let me use "~7,6B" — I'm fairly confident DeepSeek-R1-Distill-Qwen-7B is 7.6B. But the instruction says don't invent. I'll label clearly as "dato externo no verificado". Actually simpler: use a column "Parametros" with "7B" class-level values and add a note that external comparators' figures are approximate/not verified in this source. That's honest.

Limitaciones: no eval published, 0 downloads, single-author research checkpoint, mid-training checkpoint (epoch 10/15), math-only SFT could degrade general capabilities/instruction following, English-centric math data, no chat alignment beyond SFT trace mimicking, hallucination risk in proofs, license apache-2.0 permits commercial use but base model card should be checked, "boxed answer" format dependency, tokenizer custom chat_template.

Enlaces: HF model URL, base model URL https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd, allenai Olmo-3.1-32B-Think https://huggingface.co/allenai/Olmo-3.1-32B-Think, OpenThoughts3 dataset (open-thoughts/OpenThoughts3-1.2M) — link plausible: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M. I should mark as referenced. Also note web search returned no relevant results.

Title capitalization: only first word capitalized. So "## Resumen", "## Especificaciones tecnicas" (no accents? Spanish of Spain should use accents: "técnicas"). The structure given omits accents but I should write proper Spanish with accents. Rules say Spanish from Spain without spelling errors — use accents. Headings: "## Especificaciones técnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces". Only first word capitalized — that's satisfied.

Let me write it.

Numbers: 7.298.011.136 params ≈ 7,3B. bf16 → 14,6 GB (matches repo size 14,6 GB).

Write the ficha.## Resumen

`sft_olmo3base7b_olmo31think_ot3_p6272x2-step490` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, publicado por el usuario mhseo2. El objetivo es inyectar trazas de razonamiento matemático de un modelo profesor mucho mayor (allenai/Olmo-3.1-32B-Think) en un transformer denso de 7.298.011.136 parámetros, de modo que el modelo pequeño aprenda a producir cadenas de pensamiento largas, cerrar la etiqueta `</think>` una sola vez y emitir una respuesta final en formato boxed. El checkpoint publicado corresponde al paso 490 de entrenamiento, es decir, la época 10 de 15.

El interés técnico está en el pipeline de destilación: se generaron 6.272 prompts de OpenThoughts3 con dos trayectorias cada uno (12.544 muestras, ~225 M tokens) y se filtraron por criterios estrictos de formato, longitud (máximo 32.768 tokens) y descontaminación mediante n-gramas de 10 contra AIME 2025, AIME 2026 y HMMT Febrero 2025. Es, por tanto, un artefacto de investigación reproducible orientado a estudiar hasta qué punto un modelo base de 7B puede absorber patrones de razonamiento de un profesor de 32B.

Ahora mismo su relevancia es limitada como producto: no tiene descargas ni likes, no es una pipeline declarada y el autor indica que la evaluación con mean@8 en AIME 2025, AIME 2026 y HMMT Feb 2025 está pendiente en una cola de workers. La licencia Apache 2.0 y el formato safetensors facilitan su reutilización, pero cualquier uso en producción debería esperar a los resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Olmo 3, según el modelo base `mhseo2/Olmo-3-1025-7B-opd`) |
| Parámetros totales | 7.298.011.136 (≈7,3 B) |
| Parámetros activos | No disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | 32.768 tokens (límite aplicado en la generación y filtrado de los datos de entrenamiento; la longitud de contexto nativa del modelo base no se detalla en la model card) |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos safetensors; no se incluyen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card no declara idiomas; los datos provienen de OpenThoughts3 y de trazas del profesor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards: `model-00001-of-00004` a `model-00004-of-00004`, más `model.safetensors.index.json`); tokenizer en `tokenizer.json`, `vocab.json`, `merges.txt` y `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Olmo-3-1025-7B: un transformer decoder-only denso de 7,3 B de parámetros. Sobre él se aplica un ajuste fino supervisado clásico (sin etapa de RL ni DPO documentada) usando pares prompt-respuesta generados por el profesor `allenai/Olmo-3.1-32B-Think` sobre prompts matemáticos de OpenThoughts3. El "brazo de datos" `p6272x2` contiene 6.272 prompts con 2 trayectorias por prompt, lo que da 12.544 muestras y aproximadamente 225 M tokens de entrenamiento. Cada muestra se conservó solo si la trayectoria terminaba, contenía exactamente un cierre `</think>` y, tras él, una respuesta en formato boxed, todo dentro de un límite de 32.768 tokens. Además se aplicó descontaminación por n-gramas de 10 contra AIME 2025, AIME 2026 y HMMT Febrero 2025 para evitar filtración de los conjuntos de evaluación.

Hiperparámetros declarados: batch de 256, learning rate 8e-5 con decaimiento coseno hasta 4e-5 y un 3 % de warmup, weight decay 0,01 y 49 pasos por época. El paso 490 corresponde a la época 10 de 15. El entrenamiento se ejecutó en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno (8 GPU en total), usando FSDP y Ulysses con grado de paralelismo de secuencia 2. El código asociado se identifica como `mopdRL` live tree `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`). No se documentan innovaciones arquitectónicas propias ni técnicas de decodificación especulativa.

## Capacidades

- Generación de razonamiento matemático en modo "thinking": produce cadenas de pensamiento largas, cierra `</think>` una única vez y emite la respuesta final en formato boxed.
- Resolución de problemas de competición (estilo AIME y HMMT), que es el dominio objetivo de los prompts de OpenThoughts3.
- Destilación de estilo: imita los patrones de razonamiento del profesor Olmo-3.1-32B-Think, no solo la respuesta final.
- Generación de explicaciones paso a paso en lenguaje natural dentro del bloque de pensamiento.
- Al ser un SFT sobre el modelo base Olmo 3, conserva las capacidades generales de generación de texto del modelo original, aunque no se han medido tras el ajuste.
- Tool calling / function calling: no documentado en la model card; no se debe asumir su funcionamiento.
- Soporte de agentes y razonamiento multi-paso: no documentado; el formato de razonamiento es de una sola ronda de pensamiento por respuesta.
- Capacidades multilingües: no documentadas; el material de entrenamiento es mayoritariamente de corte matemático y no se especifica la mezcla de idiomas.
- Capacidades de visión o audio: no disponibles.
- No se documenta un modo de razonamiento conmutable (thinking on/off) más allá de la estructura `</think>` aprendida.

## Casos de uso

- Investigación sobre destilación de razonamiento: comparar el paso 490 con checkpoints posteriores (épocas 11 a 15) para medir cómo evoluciona la absorción de trazas del profesor de 32B en un modelo de 7B.
- Reproducción de experimentos de SFT: el paquete de código, la configuración de FSDP/Ulysses y los hiperparámetros están documentados, lo que permite replicar el entrenamiento en clústeres con 8 H100.
- Generación de datos sintéticos de razonamiento matemático: usar el modelo para producir cadenas de pensamiento en formato controlado (`</think>` + boxed) que luego se filtren y reutilicen en otros pipelines de entrenamiento.
- Estudio de formatos de respuesta: analizar la adherencia al formato boxed y la tasa de cierres correctos de `</think>` en función de la longitud del problema y del número de tokens generados.
- Evaluación de contaminación: servir como sujeto de pruebas para verificar que la descontaminación por n-gramas de 10 contra AIME 2025/2026 y HMMT 2025 es efectiva, midiendo la brecha entre prompts contaminados y limpios.
- Base para ajustes posteriores específicos de dominio: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir de inicialización para SFT con datos propios de matemáticas o de otro dominio técnico.
- Experimentos de eficiencia: comparar la calidad de razonamiento por token generado frente al profesor de 32B, útil para decidir cuándo un modelo pequeño con cadenas largas es suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación (mean@8 en AIME 2025, AIME 2026 y HMMT Febrero 2025) está pendiente en la cola de los workers de evaluación y que las puntuaciones se añadirán cuando finalice. No se deben inferir cifras a partir de los hiperparámetros ni del número de muestras de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 14,6 GB (el repositorio completo pesa 14,6 GB), por lo que en bf16/fp16 se necesitan unos 15 GB solo para pesos, más caché KV. Con contexto de 32.768 tokens y batch 1, la caché KV añade varios GB adicionales según la configuración de atención.
- Cuantización: no se publican variantes cuantizadas. Sería necesario convertir a GGUF/AWQ/GPTQ por cuenta propia; en 8 bits los pesos bajarían a ~7,5 GB y en 4 bits a ~4 GB, pero no hay validación publicada de esas conversiones.
- GPU recomendadas: 1× A100 40 GB o 80 GB, 1× H100 (80 GB) para contexto largo sin problemas; también válido en 1× L40S 48 GB.
- GPU de consumo: cabe en una RTX 4090 de 24 GB en bf16 con contexto moderado, y con más holgura si se convierte a 8 o 4 bits; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: `transformers` (con `chat_template.jinja` incluido), vLLM y TGI para serving en bf16; llama.cpp u Ollama solo tras conversión a GGUF, que no está publicada.
- Latencia y throughput: no disponibles. Al ser un checkpoint de investigación sin benchmarks de serving, no hay cifras de tokens por segundo ni de latencia por petición.
- Nota de paralelismo: el entrenamiento requirió 8 H100 (2 nodos × 4), lo que da idea del coste de un reentrenamiento completo, no de la inferencia.

## Comparativa con modelos similares

Los datos de los comparadores externos son aproximados y no han sido verificados en la información proporcionada; se marcan como tal.

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`sft_olmo3base7b_...-step490`) | 7,298 B | 32.768 tokens usados en entrenamiento (nativo del base no detallado) | SFT de razonamiento matemático sobre Olmo 3 7B | Apache 2.0 | HuggingFace, 0 descargas, sin eval publicada |
| `mhseo2/Olmo-3-1025-7B-opd` (modelo base) | 7,3 B (mismo tamaño) | No disponible | Modelo base sin SFT de razonamiento | No disponible en esta ficha | HuggingFace |
| `allenai/Olmo-3.1-32B-Think` (profesor) | ~32 B (dato externo, no verificado) | No disponible | Modelo con razonamiento tipo think | No disponible en esta ficha | HuggingFace |
| Destilados de razonamiento de ~7B (p. ej. DeepSeek-R1-Distill-Qwen-7B) | ~7 B (dato externo, no verificado) | No disponible | Destilado de razonamiento general | No disponible en esta ficha | Ampliamente disponible con cuantizaciones |

La diferencia clave frente a los destilados populares de 7B es doble: este checkpoint se limita a matemáticas de competición y carece de evaluación publicada, mientras que las alternativas consolidadas suelen tener benchmarks y cuantizaciones listas para usar. Su ventaja es la trazabilidad total del pipeline (datos, filtros, hiperparámetros y código) y una licencia Apache 2.0 explícita.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay resultados en AIME 2025, AIME 2026 ni HMMT Feb 2025; cualquier afirmación sobre su calidad es especulativa.
- Checkpoint intermedio: corresponde al paso 490 (época 10 de 15), no al modelo final del run; el autor podría publicar versiones posteriores con comportamiento distinto.
- Especialización estrecha: el SFT se hizo sobre prompts matemáticos de OpenThoughts3, lo que puede degradar instrucciones generales, conversación abierta y tareas de código respecto al modelo base.
- Dependencia de formato: espera una única etiqueta `</think>` y una respuesta boxed; fuera de ese esquema puede producir salidas mal formadas.
- Riesgo de alucinación en demostraciones: al imitar trazas de un profesor de 32B, puede reproducir pasos plausibles pero incorrectos, especialmente en problemas fuera de la distribución de OpenThoughts3.
- Idiomas no declarados: no hay garantía de calidad en castellano ni en otros idiomas distintos del dominante en los datos de entrenamiento.
- Sesgos no evaluados: no se documenta ninguna auditoría de sesgos, toxicidad ni evaluación de seguridad.
- Trazabilidad limitada del autor: 0 descargas y 0 likes, con un único publicador; no hay garantía de mantenimiento ni de soporte.
- Licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base `mhseo2/Olmo-3-1025-7B-opd` y de los datos de OpenThoughts3 antes de un despliegue productivo.
- Coste de inferencia: las cadenas de razonamiento largas (hasta 32.768 tokens) implican un consumo de tokens muy superior al de una respuesta directa, con el coste asociado en producción.
- No apto como modelo de chat por defecto sin una evaluación previa de seguimiento de instrucciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p6272x2-step490
- Modelo base: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor (referenciado en la model card): https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset de prompts (referenciado como OpenThoughts3): https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Resultados de la búsqueda web: no se ha encontrado ningún enlace técnico relevante sobre este modelo; las entradas devueltas por el buscador no guardan relación con el modelo ni con IA open source y se descartan.
