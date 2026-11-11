# qwegnai/Qwen3.8-Flash-Next-hq8g32-hq4g64

## Resumen

Qwen3.8-Flash-Next-hq8g32-hq4g64 es un pack de pesos cuantizados del modelo Qwen3.8-Flash-Next publicado por el usuario qwegnai. No se trata de un modelo entrenado desde cero, sino de una conversión del modelo base de Qwen (identificador de revisión 7ecef55a) a un formato propietario denominado QWP1, diseñado exclusivamente para el motor de inferencia Qwegn, un runtime escrito en Swift y Metal 4 para Apple Silicon. El modelo base es un MoE híbrido de 128,80 B de parámetros con 48 capas, 512 expertos (10 enrutados más uno compartido), atención dispersa nativa (QSA) y una torre de visión.

La relevancia de este pack radica en su estrategia de cuantización mixta: los expertos enrutados del MoE (95,7 % de los parámetros) se codifican a 4,5 bits por peso mediante HQ4_G64, mientras que el tronco denso (atención QSA, Gated-DeltaNet, expertos compartidos, lm_head y proyecciones MTP) se mantiene a 9,0 bits por peso con HQ8_G32. El resultado son 4,76 bits por parámetro de media y un tamaño de 71,30 GiB, más una tabla n-gram PLE de 50,86 GiB. El autor reporta una reducción de la divergencia KL respecto a BF16 de 2,62× y de 3,56× en JSON anidado, además de un recall de aguja de 3/3 a 1M de tokens.

Es importante subrayar que este checkpoint no es un safetensors, GGUF ni MLX: solo carga en el motor Qwegn. Por tanto, su utilidad práctica está restringida a usuarios de Apple Silicon que trabajen con dicho runtime. El contexto nativo del modelo base es de 262.144 tokens, con extensión en inferencia probada cerca de 1M mediante QSA nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 48 capas (36 Gated-DeltaNet + 12 de atención dispersa QSA), 512 expertos (10 enrutados + 1 compartido), embeddings n-gram por capa (PLE), cabeza MTP, torre de visión |
| Parametros totales | 128,80 B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; extensión en inferencia probada cerca de 1M con QSA nativa |
| Tipos de cuantizacion | HQ8_G32 (9,0 bits/peso) en tronco denso + HQ4_G64 (4,5 bits/peso) en expertos enrutados + BF16; media de 4,76 bits/parámetro |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en los metadatos) |
| Formato de pesos | Contenedor propietario QWP1 (no safetensors, no GGUF, no MLX); sidecar LSA `model.qlsa` en formato QLSA0001 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida de 48 capas que combina 36 capas Gated-DeltaNet (atención lineal con estado recurrente) y 12 capas de atención dispersa entrenada (QSA, latent sparse attention). El componente MoE consta de 512 expertos con 10 enrutados por token más un experto compartido. Incorpora además embeddings n-gram por capa (PLE), una cabeza de predicción multi-token (MTP) y una torre de visión, lo que lo convierte en un modelo multimodal. El pack cuantizado conserva esta topología y añade un sidecar `model.qlsa` generado mediante SVD offline de la porción sin RoPE de las cabezas `wq`/`wk` cuantizadas (dimensiones 64-255), con dimensión de índice 64, agrupación en superbloques de 512 tokens en 64 buckets de Ward (≤16 tokens cada uno) y pooling de claves de 4 tokens. El presupuesto por defecto es de 2.048 tokens más bloque sink y ventana local de 512 tokens; los prompts por debajo de 2.564 tokens usan atención densa bit-exacta.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La cuantización HQ4_G64 aplica rotación de Hadamard sobre códigos de 4 bits en bloques de 64 pesos con escala y sesgo FP16 (36 bytes por 64 pesos), mientras que HQ8_G32 usa 36 bytes por 32 pesos. El pack incluye decodificación especulativa mediante MTP variacional (Variational MTP-3) y un mecanismo de retroceso adaptativo para contexto largo.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto nativa de 262.144 tokens, extensible en inferencia cerca de 1M.
- Razonamiento matemático y generación de código, con evaluación reportada de 81-83 sobre 100 en 50 tareas HumanEval más 50 MBPP con razonamiento desactivado.
- Capacidades de visión gracias a la torre de visión incluida en la arquitectura del modelo base.
- Soporte de tool calling y uso agéntico de herramientas, con una tasa de acierto reportada del 87,5 % (7/8) en pruebas agénticas.
- Razonamiento multi-paso y planificación mediante la cabeza MTP y decodificación especulativa.
- Recuperación en contexto largo: recall de aguja 3/3 en longitudes de 64K a 1M tokens en la prueba de tres agujas reportada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de atención dispersa conmutable (`--lsa-mode auto` o `qsa-cluster`) para optimizar el rendimiento en contexto largo.

## Casos de uso

- Análisis de documentos extensos en local sobre Apple Silicon: con 262.144 tokens nativos y extensión probada a 1M, el modelo puede procesar contratos, informes o bases de código completas en una sola pasada, manteniendo recall de aguja verificado en la prueba del autor.
- Asistencia de código en estaciones de trabajo Mac: la evaluación de 81-83/100 en HumanEval y MBPP con razonamiento desactivado lo sitúa como opción para autocompletado y generación de funciones en entornos de desarrollo sin GPU dedicada, aprovechando el motor Qwegn sobre Metal 4.
- Agentes autónomos con tool calling: la tasa del 87,5 % en uso agéntico de herramientas permite integrarlo en flujos de orquestación que requieran llamadas a APIs, consultas a bases de datos o ejecución de comandos, con decodificación especulativa para reducir latencia.
- Procesamiento de JSON estructurado: la reducción de divergencia KL de 3,56× en JSON anidado respecto a BF16 lo hace adecuado para extracción de datos estructurados, generación de esquemas y pipelines de validación de salidas.
- Razonamiento sobre imágenes y texto combinados: la torre de visión del modelo base permite tareas de descripción de imágenes, respuesta a preguntas visuales y extracción de información de capturas o documentos escaneados.
- Investigación en cuantización y motores de inferencia: el pack sirve como referencia reproducible para estudiar el impacto de la cuantización mixta HQ4/HQ8 en la fidelidad de logits (meanTopProb 0,9658 reportado) y en el rendimiento de atención dispersa sobre hardware Apple.
- Despliegue de contexto largo en memoria unificada: con 71,30 GiB de pack más 50,86 GiB de tabla PLE, cabe en un Mac con 128 GB de memoria unificada, permitiendo inferencia de modelos de 128 B sin GPU dedicada.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre Apple M5 Max (Mac17,6, 128 GB de memoria unificada, GPU de 40 núcleos, 585 GB/s), macOS 26, `llmprobe v0.6.16`, `--kv-mode q4 --temperature 0`:

| Metrica | Resultado |
|---|---|
| Prefill (prompt de 10,4K) | 2.460-2.688 tok/s (pico 2.696) |
| TTFT en frío | 113-122 ms |
| TTFT con caché de prompt caliente | 7-10 ms |
| Decodificación estándar (serial) | 72,3 tok/s |
| Decodificación especulativa (Variational MTP-3) | 106,7-113,7 tok/s (142,4 en texto predecible) |
| Prefill / decodificación a 1M tokens (QSA nativa) | 1.353 / 45,4 tok/s |
| Recall de aguja 64K → 1M | 3/3 en cada longitud |
| Conformidad y capacidad del motor | 100 % (131/131) · 100 % (18/18, 6/6 JSON) |
| Fidelidad de logits y uso agéntico | 100 % (meanTopProb 0,9658) · 87,5 % (7/8) |
| Evaluación de código (50 HumanEval + 50 MBPP) | 81-83 / 100 |

Rendimiento de contexto largo por escalón (QSA nativa / qsa-cluster):

| Escalon de contexto | Prefill tok/s | TTFT | Decodificación tok/s | Recall de aguja | QSA vs qsa-cluster |
|---|---|---|---|---|---|
| 64K | 2.542 / 2.280 | 25,2 s / 28,1 s | 81,7 / 63,0 | 3/3 vs 3/3 | 1,11× · 1,30× |
| 262K | 2.171 / 1.553 | 113,1 s / 158,0 s | 72,3 / 34,8 | 3/3 vs 3/3 | 1,40× · 2,08× |
| 1M | 1.353 / — | 766,5 s / — | 45,4 / — | 3/3 | — |

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) en la información disponible. Las longitudes reales de prompt tokenizado son 64.060 (64K), 120.673 (128K), 245.423 (262K), 544.656 (524K) y aproximadamente 1.037.119 (1M). El resultado 3/3 corresponde a un único ejercicio de recuperación con tres agujas, no a una garantía general de precisión.

## Requisitos de hardware

- VRAM/memoria unificada: el pack ocupa 71,30 GiB más 50,86 GiB de tabla PLE n-gram, lo que requiere un sistema con al menos 128 GB de memoria unificada en la configuración probada.
- GPU recomendadas: Apple M5 Max (Mac17,6) con GPU de 40 núcleos y 585 GB/s de ancho de banda, según la configuración reportada por el autor. No se dispone de datos para otras GPU.
- GPU de consumo: el modelo no cabe en GPUs de consumo convencionales (RTX 4090, etc.) por tamaño y porque el formato QWP1 solo carga en el motor Qwegn sobre Apple Silicon.
- Opciones de despliegue: exclusivamente el motor Qwegn (Swift + Metal 4). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: TTFT en frío de 113-122 ms, TTFT con caché caliente de 7-10 ms, decodificación serial de 72,3 tok/s y especulativa de hasta 142,4 tok/s en texto predecible, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-hq8g32-hq4g64 (este pack) | 128,80 B | 262.144 nativo; ~1M en inferencia | qwen-community-1.0 | QWP1, solo motor Qwegn |
| Qwen3.8-Flash-Next (base) | 128,80 B | 262.144 | qwen-community-1.0 | Pesos originales de Qwen |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El formato QWP1 es propietario y solo carga en el motor Qwegn; no es interoperable con safetensors, GGUF, MLX, vLLM, llama.cpp ni Ollama.
- Requiere hardware Apple Silicon con al menos 128 GB de memoria unificada en la configuración probada; no es desplegable en GPUs convencionales.
- La extensión de contexto más allá de 262.144 tokens es una extensión en tiempo de inferencia, no entrenamiento adicional; el recall 3/3 corresponde a un único ejercicio de recuperación y no garantiza precisión general.
- La decodificación especulativa variacional puede alterar la salida respecto a la decodificación greedy exacta; solo la verificación greedy con NextN MTP-1 es bit-exacta según el autor.
- Los resultados de rendimiento provienen de una única configuración de hardware (M5 Max) y pueden variar con la carga de trabajo y las condiciones térmicas.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación específico ni idiomas soportados en la información proporcionada.
- La licencia qwen-community-1.0 puede imponer restricciones para uso comercial; es responsabilidad del usuario revisar los términos del archivo LICENSE incluido.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/qwegnai/Qwen3.8-Flash-Next-hq8g32-hq4g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegine
