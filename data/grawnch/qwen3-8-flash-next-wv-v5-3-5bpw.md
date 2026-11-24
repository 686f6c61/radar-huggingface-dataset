# Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw

## Resumen

Qwen3.8-Flash-Next-WV-v5-3.5bpw es una cuantización GGUF del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Grawnch bajo el esquema propietario "wave-quant" en su variante WV-v5. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 176.943.889.600 parámetros totales, 48 capas y 512 expertos enrutados con top-10 activos más un experto compartido. La cuantización reduce el checkpoint original a 3,5 bits por peso, dando como resultado un repositorio de 84,1 GB distribuido en dos shards GGUF.

El interés de esta ficha es doble: por un lado documenta un proceso de cuantización agresiva (3,5 bpw) sobre un MoE de gran tamaño, con métricas de degradación reportadas frente a BF16 (KLD de 0,11252, similitud coseno de 0,9481 en un conjunto held-out); por otro, sirve como referencia histórica, ya que el propio autor marca este checkpoint como reemplazado por una versión posterior en formato GGUF estándar. La licencia Apache 2.0 del modelo base se mantiene en la derivada.

La relevancia práctica radica en que permite ejecutar un MoE de ~177B parámetros en infraestructura mucho más modesta que el BF16 original, a costa de una pérdida de calidad medible pero acotada. No obstante, el formato WV-v5 no es un GGUF estándar de llama.cpp, lo que condiciona fuertemente las opciones de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 capas: 36 GDN + 12 sparse-QSA), 512 expertos enrutados, top-10 activos + experto compartido |
| Parametros totales | 176.943.889.600 (~177B) |
| Parametros activos | no disponible (top-10 de 512 expertos enrutados más experto compartido; el autor no publica el recuento exacto de parámetros activos) |
| Longitud de contexto | no disponible en la model card; se menciona una variante repack de 128K en el benchmark AIME 2025 |
| Tipos de cuantizacion | WV-v5 a 3,5 bpw (Q8_0 en densas/experto compartido/head, FP32 en norms y puertas GDN, Q4_0 en embeddings de token) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos shards: 55,31 GB + 30,51 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE de 48 capas con 512 expertos enrutados, enrutamiento top-10 más un experto compartido, y una combinación de capas GDN (Gated Delta Network, mecanismo de atención lineal) y capas sparse-QSA. Esta mezcla híbrida busca reducir el coste computacional de la atención en contextos largos manteniendo calidad. El checkpoint cuantizado conserva la estructura completa de 48 capas.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La model card se centra exclusivamente en el proceso de cuantización: el esquema WV-v5 con asignación de precisión mixta (Q8_0 para capas densas, experto compartido y head; FP32 para normalizaciones y puertas GDN; Q4_0 para embeddings de token) y Per-Layer Embeddings (PLE) separados en el segundo shard para permitir mmap zero-copy desde host. Se reporta también un repack posterior denominado SM120-v20 a 3,1 bpw con contexto de 128K, usado para el benchmark de AIME 2025.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.8-Flash-Next.
- Razonamiento matemático: el autor reporta Pass@1 de 30/30 en MathArena/aime_2025 con el repack SM120-v20 a 3,1 bpw, contexto 128K, decodificación vanilla.
- Generación de código: se incluye un conjunto de evaluación auto-generado de matemáticas/código en las métricas de cuantización (KLD 0,11252, Top-1 89,30%).
- Capacidades de agente y tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de ~177B en servidores con menos VRAM que el BF16 original: el checkpoint a 3,5 bpw ocupa 84,1 GB en dos shards, lo que permite servirlo en configuraciones multi-GPU de gama alta (por ejemplo, 2×H100 80 GB o 4×A100 40 GB) donde el BF16 no cabría.
- Evaluación de la degradación por cuantización: las métricas publicadas (dPPL de −1,3539 en held-out externo, KLD de 0,11252, similitud coseno de 0,9481–0,9515) permiten usar este checkpoint como referencia para estudiar el impacto de WV-v5 frente a BF16 en tareas de matemáticas y código.
- Reproducibilidad de benchmarks: el autor mantiene este repositorio explícitamente para reproducibilidad histórica, por lo que es adecuado para replicar sus resultados de PPL y KLD con las mismas semillas y conjuntos (1×2048, WT2_2048, Strata v1 con 4.995 posiciones).
- Procesamiento por lotes de matemáticas y código: dado el rendimiento reportado en AIME 2025 con el repack de 128K, es viable para generación de soluciones y revisión de código en pipelines offline donde la latencia no es crítica.
- Investigación sobre cuantización de MoE con precisión mixta: la separación de Per-Layer Embeddings en un segundo shard con mmap zero-copy es un caso de estudio para quienes diseñan esquemas de cuantización con carga perezosa desde host.
- Sustitución de modelos densos grandes en entornos con restricciones de memoria: el tamaño de 84,1 GB frente a los ~354 GB que ocuparía el BF16 de 177B permite evaluar alternativas MoE en clústeres de tamaño medio.

## Benchmarks y rendimiento

| Suite | Métrica | Resultado |
|---|---|---|
| 48 capas directo vs BF16 (held-out externo 1×2048) | PPL (BF16 → WV-v5) / CosSim | 11,422 → 10,068 (dPPL = −1,3539) / 0,9481 |
| 48 capas directo vs BF16 (auto-generado Math/Code 1×2048) | KLD media / Top-1 / CosSim | 0,11252 / 89,30% / 0,9515 |
| 48 capas directo vs BF16 (WT2_2048) | PPL (BF16 → WV-v5) / CosSim | 2,164 → 2,363 / 0,9429 |
| Strata v1, yardstick de 5 dominios (4.995 posiciones) | PPL de referencia (code / all) | 2,108 / 3,920 |
| Repack SM120-v20 3,1 bpw, 128K, MathArena/aime_2025 | Pass@1 (B=30, pp=0,0, vanilla) | 30/30 (100,00%, 15/15 + 15/15, 0 bucles) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible; las cifras anteriores miden la fidelidad de la cuantización respecto al BF16 del mismo modelo base, no el rendimiento absoluto frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 84,1 GB en dos shards; se necesita al menos esa cantidad de memoria agregada (VRAM o VRAM + RAM con mmap para el shard PLE de 30,51 GB). El shard principal de 55,31 GB debe residir en VRAM para un rendimiento razonable.
- GPU recomendadas: configuraciones multi-GPU de gama alta, como 2×H100 80 GB, 2×A100 80 GB o 4×A100 40 GB. El autor menciona una variante específica "SM120" para "bare-metal Blackwell", lo que sugiere soporte en GPUs Blackwell (serie RTX 50 / B200).
- ¿Cabe en GPU de consumo? No en una sola: 84,1 GB excede la VRAM de cualquier GPU consumer actual (máximo 32 GB en RTX 5090). Requiere reparto entre varias GPUs o mmap desde RAM del sistema.
- Opciones de despliegue: el formato WV-v5 es un esquema de cuantización propio del autor, no un GGUF estándar de llama.cpp; la model card no especifica compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El autor recomienda migrar al checkpoint WV-v5-3.5bpw-GGUF o al WV-2.96bpw-SM120 para despliegue real.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v5-3.5bpw (este) | ~177B (MoE, top-10 de 512) | no disponible | WV-v5 3,5 bpw | Apache 2.0 | Hugging Face, 358 descargas, marcado como superseded |
| Qwen/Qwen3.8-Flash-Next (base) | ~177B (MoE, top-10 de 512) | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw-GGUF (sucesor) | ~177B (MoE) | no disponible | WV-v5 3,5 bpw, GGUF estándar | Apache 2.0 | Hugging Face, recomendado por el autor |
| Grawnch/Qwen3.8-Flash-Next-WV-2.96bpw-SM120 | ~177B (MoE) | no disponible | WV 2,96 bpw, optimizado para Blackwell | Apache 2.0 | Hugging Face, recomendado para bare-metal Blackwell |

No se dispone de datos de benchmarks absolutos ni de modelos de otros desarrolladores comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint marcado como superseded por el propio autor: se recomienda usar la versión WV-v5-3.5bpw-GGUF o la WV-2.96bpw-SM120; este repositorio se conserva solo para reproducibilidad.
- La cuantización a 3,5 bpw introduce degradación medible: KLD media de 0,11252 y Top-1 del 89,30% frente a BF16 en el conjunto auto-generado de matemáticas/código, y caída de similitud coseno hasta 0,9429 en WT2_2048.
- El formato WV-v5 no es un GGUF estándar; la compatibilidad con runtimes habituales (llama.cpp, vLLM, Ollama, TGI) no está documentada y puede requerir herramientas propias del autor.
- No hay información sobre sesgos, riesgo de alucinación, idiomas soportados ni limitaciones de contexto del modelo base en la documentación disponible.
- La licencia Apache 2.0 permite uso comercial, pero al ser una derivada conviene verificar los términos del modelo base Qwen/Qwen3.8-Flash-Next y citar adecuadamente.
- El rendimiento en AIME 2025 (30/30) corresponde al repack SM120-v20 a 3,1 bpw con contexto 128K, no a este checkpoint de 3,5 bpw; no debe extrapolarse directamente.
- El repositorio tiene 358 descargas y 0 likes, con actividad mínima; no hay señales de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw
- Sucesor recomendado (GGUF): https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
