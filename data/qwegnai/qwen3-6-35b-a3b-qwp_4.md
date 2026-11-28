# qwegnai/Qwen3.6-35B-A3B-QWP_4

## Resumen

Qwen3.6-35B-A3B-QWP_4 es un empaquetado de pesos cuantizados del modelo Qwen/Qwen3.6-35B-A3B, publicado por el usuario qwegnai. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint original de Qwen a un contenedor propietario denominado QWP1, diseñado exclusivamente para el motor de inferencia Qwegn, un runtime escrito en Swift con backend Metal 4 orientado a Apple Silicon. El modelo base es un transformer híbrido MoE de 35,95 mil millones de parámetros totales con 3 mil millones activos por token, 40 capas (30 Gated-DeltaNet y 10 de atención completa), 256 expertos y una torre de visión.

La relevancia de este empaquetado reside en su enfoque en el rendimiento sobre hardware Apple: incorpora una técnica propietaria llamada Latent Sparse Attention (LSA) que restringe la atención completa a tokens sumidero, los bloques de 4 tokens más similares y una ventana local de 512 tokens, logrando aceleraciones de hasta 13,88× en prefill y 4,48× en decodificación a 524K tokens frente a atención densa. Además, incluye un sidecar `model.qlsa` que evita recalcular las proyecciones en tiempo de carga.

El pack ocupa 22,18 GiB, emplea una cuantización propietaria HQ4_G32_M5 de 5,30 bits por parámetro y declara contexto nativo de 262.144 tokens, con extensión inferencial probada cerca de 1M mediante YaRN y LSA. Es importante subrayar que este artefacto no es un checkpoint safetensors, GGUF ni MLX, por lo que solo puede cargarse con el motor Qwegn.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 40 capas (30 Gated-DeltaNet + 10 full-attention), 256 expertos (8 enrutados + compartido), GQA 16Q/2KV, cabeza MTP, torre de visión |
| Parámetros totales | 35,95 B |
| Parámetros activos | 3 B |
| Longitud de contexto | 262.144 tokens nativos; extensión inferencial probada cerca de 1M con YaRN + LSA |
| Tipos de cuantización | HQ4_G32_M5 (5,30 bits/parámetro global) + BF16 en embedding de tokens y torre de visión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QWP1 (contenedor propietario de Qwegn); no compatible con safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que combina 30 capas Gated-DeltaNet (un tipo de atención lineal recurrente) con 10 capas de atención completa, configuradas como Mixture of Experts con 256 expertos por capa, de los cuales 8 son enrutados más uno compartido, dando lugar a 3 B de parámetros activos sobre 35,95 B totales. La atención usa GQA con 16 cabezas de consulta y 2 de clave/valor, e incorpora una cabeza de Multi-Token Prediction (MTP) que el runtime aprovecha para decodificación especulativa. También incluye una torre de visión, lo que habilita entrada multimodal.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, la composición de datos ni las técnicas de alineación (RLHF/DPO) aplicadas al modelo base en la información proporcionada. La innovación técnica destacable de este empaquetado es la Latent Sparse Attention (LSA): un sidecar `model.qlsa` generado mediante SVD offline de la rebanada de cabeza libre de RoPE de `wq`/`wk` cuantizados (dimensiones 64–255), con índice de dimensión 64, agrupamiento de superbloques de 512 tokens en 64 buckets de Ward (≤16 tokens cada uno) y pooling de claves de 4 tokens. El presupuesto por defecto es de 2.048 tokens más bloque sumidero y ventana local de 512 tokens, cubriendo las 10 capas de atención completa (10 ocurrencias en runtime). Los prompts por debajo de 2.564 tokens usan atención densa bit-exacta.

## Capacidades

- Generación de texto y razonamiento multi-turno en contextos de hasta 262.144 tokens nativos, con extensión inferencial probada cerca de 1M.
- Capacidades de código: la evaluación del autor con 50 tareas HumanEval y 50 MBPP (razonamiento desactivado) reporta 72/100.
- Procesamiento multimodal: incluye torre de visión en el modelo base (los pesos de la torre se conservan en BF16).
- Decodificación especulativa mediante la cabeza MTP (Variational MTP-3 con margen 2,5, suelo de probabilidad 0,2 y drafting híbrido) y DFlash 2.
- Recuperación en contexto largo: 3/3 en prueba de 3 agujas a 64K, 160K, 262K, 524K y 1M con LSA activa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos en local sobre Mac: con 262.144 tokens nativos y extensión a ~1M, el modelo puede procesar contratos, informes o bases de código completas en una sola pasada sin fragmentación, aprovechando el prefill de 6.419 tok/s a 4K y 2.317 tok/s a 1M con LSA.
- Asistentes de código en estación de trabajo Apple: la puntuación de 72/100 en HumanEval+MBPP con razonamiento desactivado y la decodificación de 148–155 tok/s (hasta 233 tok/s con MTP-3) lo hacen viable para autocompletado y refactorización interactiva en un Mac con memoria unificada.
- Recuperación aumentada sobre corpus masivos: la prueba de 3 agujas con 3/3 de recall a 1M tokens permite construir pipelines RAG que inyecten grandes volúmenes de contexto sin perder información en los extremos del prompt.
- Procesamiento de imágenes con texto asociado: la torre de visión en BF16 permite tareas de descripción, extracción de datos de capturas o análisis de diagramas combinadas con contexto textual largo.
- Servicio de inferencia personal de baja latencia: el TTFT en caliente de 5–7 ms y el TTFT con caché `.qwcache` de 0,12 s a 32,7K tokens permiten desplegar un endpoint local con tiempos de respuesta interactivos.
- Investigación en eficiencia de atención: el sidecar LSA y las métricas comparativas denso vs. Ward-512 vs. e-means-4096 permiten experimentar con mecanismos de atención dispersa sobre un modelo MoE de 35B en hardware de consumo profesional.

## Benchmarks y rendimiento

Resultados medidos por el autor en Apple M5 Max (128 GB de memoria unificada, GPU de 40 núcleos, 585 GB/s), macOS 26+, `llmprobe v0.6.16–v0.6.17`, `--kv-mode q4 --temperature 0`:

| Métrica | Resultado |
|---|---|
| Prefill 4K / 16K / 64K | 6.419 / 6.307 / 6.142 tok/s |
| TTFT en frío / en caliente (caché de prompt) | 45–71 ms / 5–7 ms |
| TTFT con `.qwcache` (32,7K, Two-Tier Cortex) | 0,12 s (54,4× vs. 6,53 s en frío) |
| Decodificación estándar (serial) | 148,3–155,1 tok/s |
| Decodificación especulativa (Variational MTP-3) | 175,5–233,4 tok/s |
| Prefill / decodificación a 1M (Ward-512 · e-means-4096) | 2.317 / 105,6 tok/s (136,8 tok/s a 64K con e-means) |
| Recall de agujas 64K → 1M | 3/3 en todas las longitudes |
| Evaluación de código (50 HumanEval + 50 MBPP) | 72/100 |

Escalado de LSA frente a atención densa (3 agujas, `--kv-mode q4 --temperature 0`):

| Contexto | Denso prefill/decode | Ward-512 prefill/decode | e-means-4096 prefill/decode | Recall (off/Ward/e-means) | Mejor aceleración |
|---|---|---|---|---|---|
| 64K | 2.538 / 99,2 | 6.141,7 / 126,2 | 5.716,5 / 136,8 | 0/3 · 3/3 · 3/3 | 2,42× prefill · 1,38× decode |
| 160K | 1.128,6 / 67,2 | 4.913,8 / 131,1 | 4.283,0 / 122,5 | 2/3 · 3/3 · 3/3 | 4,35× prefill · 1,95× decode |
| 262K | 581 / 50,1 | 3.805,2 / 118,3 | 3.526,3 / 102,1 | 0/3 · 3/3 · 3/3 | 6,55× prefill · 2,36× decode |
| 524K | 231 / 23,2 | 3.207,1 / 103,9 | 3.126,1 / 93,4 | 0/3 · 3/3 · 3/3 | 13,88× prefill · 4,48× decode |
| 1M | — | 2.317,0 / 105,6 | 2.315,1 / 88,5 | — · 3/3 · 3/3 | 448,8 s TTFT · 30,53 GiB (e-means) |

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) del modelo base en la información disponible. Las longitudes reales de prompt tokenizado fueron 64.060, 120.673, 245.423, 544.656 y ~1.037.119 tokens para las etiquetas nominales de 64K, 128K, 262K, 524K y 1M.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el pack ocupa 22,18 GiB en disco; se requiere un Mac con al menos ~24–32 GB de memoria unificada para cargarlo, y 128 GB para ejecutar a 1M tokens (el perfil e-means reporta 30,53 GiB solo para el estado de contexto).
- GPU compatibles: exclusivamente Apple Silicon con Metal 4 (el autor reporta M5 Max, identificador Mac17,6, GPU de 40 núcleos, 585 GB/s). No hay soporte para GPU NVIDIA o AMD.
- GPU de consumo: cabe en Mac con memoria unificada alta (M-series Pro/Max/Ultra con ≥32 GB); no es ejecutable en GPUs discretas de consumo tipo RTX 4090 por incompatibilidad de runtime.
- Opciones de despliegue: únicamente el motor Qwegn (Swift + Metal 4). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: TTFT en caliente de 5–7 ms, decodificación de 148–155 tok/s en serial y 175–233 tok/s con MTP-3 en contexto corto; 105,6 tok/s a 1M tokens con LSA.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Runtime |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-QWP_4 (este) | 35,95 B | 3 B | 262K nativo / ~1M extendido | Apache 2.0 | QWP1 | Qwegn (Apple Silicon) |
| Qwen/Qwen3.6-35B-A3B (base) | 35,95 B | 3 B | 262.144 | Apache 2.0 | safetensors | vLLM, TGI, etc. |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el checkpoint original de Qwen: este pack no añade capacidades nuevas al modelo, sino que cambia el formato y el runtime para optimizar el rendimiento en Apple Silicon mediante LSA y cuantización HQ4. No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: el contenedor QWP1 solo carga en el motor Qwegn; no es utilizable con safetensors, GGUF, MLX, vLLM, llama.cpp, Ollama ni TGI. Esto limita drásticamente su portabilidad.
- La extensión de contexto más allá de 262.144 tokens es inferencial (YaRN + LSA), no entrenamiento adicional; la fidelidad en tareas distintas a la recuperación de agujas no está garantizada.
- El resultado 3/3 en recall corresponde a un único ejercicio de tres agujas y no constituye una garantía general de precisión en contexto largo.
- La decodificación especulativa Variational MTP-3 puede alterar la salida respecto a una decodificación greedy exacta.
- Los resultados de contexto corto provienen de cargas de trabajo separadas; el TTFT en caliente y el TTFT en frío listados no forman una ratio controlada sobre el mismo prompt.
- El rendimiento depende de la carga de trabajo y de la temperatura del dispositivo; las cifras reportadas son de un único hardware (M5 Max de 128 GB).
- La cuantización HQ4_G32_M5 a 5,30 bits/parámetro introduce pérdida de precisión frente a BF16, aunque el autor no publica métricas de degradación.
- Sesgos conocidos, riesgo de alucinación y limitaciones idiomáticas del modelo base: no disponible en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del runtime Qwegn debe evaluarse por separado (licencia del motor no disponible en esta ficha).
- Repositorio sin descargas ni likes en el momento de la consulta, creado en 2026-11-04; se trata de un artefacto reciente y de un autor individual, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/qwegnai/Qwen3.6-35B-A3B-QWP_4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del motor Qwegn: https://github.com/qwegnai/qwegn
- Commit del modelo base referenciado: `995ad96eacd98c81ed38be0c5b274b04031597b0`
- Papers, blogs y demos adicionales: no disponible en la información proporcionada.
