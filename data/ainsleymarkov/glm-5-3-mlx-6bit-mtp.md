# AinsleyMarkov/GLM-5.3-MLX-6bit-MTP

## Resumen

GLM-5.3-MLX-6bit-MTP es una conversión a formato MLX del modelo GLM-5.3 de Z.ai (organización `zai-org`), publicada por el usuario AinsleyMarkov. Se trata de una cuantización afín de 6 bits (con algunas capas a 8 bits y bf16) pensada para ejecutar el modelo en Apple Silicon mediante la librería MLX. El repositorio combina el tronco cuantizado de otra conversión previa (`orcarouter/GLM-5.3-MLX`) con la cabeza de predicción multi-token (MTP) recuperada del checkpoint oficial en BF16 y cuantizada a los mismos anchos, además de un módulo de modelo personalizado (`glm_dsa_mtp.py`) para inferencia con paralelismo tensorial.

El modelo base es un transformer MoE de gran escala con 78 capas (3 densas y 75 MoE), 256 expertos enrutados activando 8 por token más un experto compartido, atención MLA y atención dispersa DSA (DeepSeek Sparse Attention) con un indexador que selecciona las 2.048 claves más relevantes por consulta. El contexto máximo declarado es de 1.048.576 posiciones. La contribución principal de esta ficha no es el modelo en sí, sino el empaquetado para MLX con la cabeza MTP como borrador de decodificación especulativa, orientado a despliegues multi-nodo sobre Mac Studio.

Es relevante porque permite ejecutar un modelo de aproximadamente 823.900 millones de parámetros (753.300 millones según el recuento de parámetros del repositorio, incluyendo la cabeza MTP) en hardware Apple Silicon distribuido, algo que hasta hace poco quedaba restringido a clústeres de GPU NVIDIA. El repositorio acumula 356 descargas y no tiene likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA y atención dispersa DSA (`glm_moe_dsa`), más una capa MTP |
| Parametros totales | 823.907.656.704 (safetensors); 753.329.940.480 según el recuento del repositorio (tronco 743.377.019.904 + cabeza MTP 9.952.920.576) |
| Parametros activos | 8 de 256 expertos enrutados por token, más 1 experto compartido (no se publica el recuento exacto de parámetros activos) |
| Longitud de contexto | 1.048.576 posiciones (`max_position_embeddings`) |
| Tipos de cuantizacion | MLX afín, group size 64: 6 bits (expertos enrutados `gate_proj`/`up_proj`, MLP denso de capas 0-2), 8 bits (expertos `down_proj`, proyecciones MLA, experto compartido), bf16 (embeddings, `lm_head`, indexador DSA, router, normas). Promedio de 7,22 bits por parámetro |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | `glm-5.3` (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (140 shards del tronco más `model-mtp.safetensors`), con `quantization_map.json`, `mtp_quant.json` y `config.json` |

## Arquitectura y entrenamiento

El tronco consta de 78 capas con tamaño oculto 6.144: tres capas densas con MLP de 12.288 y 75 capas MoE. Cada capa MoE dispone de 256 expertos enrutados con dimensión intermedia 2.048, de los que se activan 8 por token, más un experto compartido. El enrutamiento usa puntuaciones sigmoideas con `noaux_tc` y un factor de escala de 2,5 sobre los expertos enrutados. La atención es MLA con 64 cabezas, `q_lora_rank` de 2.048 y `kv_lora_rank` de 512, con cabeza qk de 192 dimensiones más 64 de RoPE y cabeza v de 256. La atención dispersa DSA emplea un indexador de 32 cabezas por 128 dimensiones que selecciona las 2.048 claves superiores por consulta; 21 capas calculan el índice y 57 lo reutilizan (`indexer_types: shared`). El vocabulario es de 154.880 tokens y RoPE usa theta de 8.000.000.

La capa MTP (capa 78) aplica una proyección `eh_proj` sobre la combinación del embedding normalizado y el estado oculto, seguida de una capa decodificadora MoE con su propio indexador, y reutiliza `embed_tokens` y `lm_head` del tronco. En esta conversión se usa como borrador de decodificación especulativa. El tronco fue cuantizado por `orcarouter` a partir del checkpoint oficial en FP8 (bloques de 128x128) y la cabeza MTP se extrajo del checkpoint BF16 oficial (shards 270-274 de 282) y se cuantizó a los anchos del tronco. El autor reporta verificaciones de reconstrucción de pesos: clases de 6 bits con coseno 0,99975 y SNR de 33,0 dB; clases de 8 bits con coseno 0,99998 y SNR de 45,1 dB. No se detalla en la información disponible la composición del dataset de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat que admite `reasoning_effort` (`low`, `high`; cualquier otro valor produce `max`) y `clear_thinking` (por defecto `false`).
- Razonamiento con modo de pensamiento configurable mediante la plantilla de chat.
- Decodificación especulativa nativa usando la cabeza MTP como borrador, con profundidad adaptativa (2 borradores por ronda, más profunda mientras se aceptan) y borradores por copia de texto previo en el servidor de referencia.
- Inferencia con paralelismo tensorial mediante `Model.shard(group)` sobre un grupo `mx.distributed`, con kernels Metal personalizados (residual add + RMSNorm fusionado con suma entre rangos, scoring y top-k del indexador, atención dispersa de decodificación, MoE agrupado y prefill por bloques).
- Contexto largo de hasta 1.048.576 tokens, con atención dispersa DSA que limita el coste por consulta a las 2.048 claves seleccionadas.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Inferencia local de gran escala sobre Apple Silicon: el modelo está pensado para ejecutarse en clústeres de Mac Studio con memoria unificada grande (medido con 4 nodos M3 Ultra de 512 GB), lo que permite disponer de un MoE de ~750.000 millones de parámetros sin GPU NVIDIA.
- Procesamiento de documentos largos en chino e inglés: con 1.048.576 posiciones de contexto y atención dispersa, es adecuado para resumir o extraer información de corpus extensos, contratos o bases de conocimiento en una sola pasada.
- Asistentes conversacionales con razonamiento configurable: la plantilla de chat permite alternar entre `reasoning_effort` bajo y alto según la latencia tolerada, útil en atención al cliente o asistentes internos.
- Generación de texto en producción con throughput moderado: los 42-50 tok/s en decodificación a 1K de contexto y 35-46 tok/s a 128K-256K permiten servir flujos de una sola secuencia con latencia aceptable en entornos de investigación.
- Evaluación comparativa de cuantizaciones: el repositorio incluye mapas de cuantización y resúmenes de fidelidad, lo que facilita estudiar el impacto de 6 frente a 8 bits en un MoE grande.
- Investigación sobre decodificación especulativa: la integración de la cabeza MTP como drafter y los kernels Metal personalizados sirven como base para experimentar con técnicas de aceleración en MLX.
- Procesamiento por lotes de prompts largos: el prefill medido (761,8 tok/s con 9,4K tokens, 646 tok/s con 128K, 533 tok/s con 256K) hace viable indexar o transformar documentos de gran tamaño en pipelines offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica mediciones de rendimiento de inferencia con `llmprobe` 0.6.16, una sola secuencia y modo de pensamiento desactivado, sobre 4 Mac Studio M3 Ultra de 512 GB con TP4 y macOS 27.0:

| Metrica | Codigo | Prosa |
|---|---:|---:|
| Decodificacion, contexto 1K (mediana) | 49,7 tok/s | 42,3 tok/s |
| Decodificacion, contexto 128K | 46,3 tok/s | 37,5 tok/s |
| Decodificacion, contexto 256K | 42,1 tok/s | 35,4 tok/s |
| Decodificacion, texto predecible / novedoso | 105,7 / 39,0 tok/s | 106,0 / 37,6 tok/s |
| Decodificacion, 4 flujos (agregado) | 56,2 tok/s | 59,8 tok/s |
| Prefill, prompt de 9,4K tokens | 761,8 tok/s | 739,3 tok/s |
| Prefill, prompt de 128K tokens | 646 tok/s | 653 tok/s |
| Prefill, prompt de 256K tokens | 533 tok/s (primer token tras 491 s) | no disponible |

Memoria medida con TP4: 172,6 GB de pesos por rango y pico de 247 GB por nodo con un prompt de 256K tokens.

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio ocupa 680 GB; con TP4 el autor mide 172,6 GB de pesos por rango y un pico de 247 GB por nodo con prompt de 256K tokens. En una sola máquina haría falta memoria unificada en el orden de los 700 GB o más, lo que descarta cualquier Mac de consumo actual.
- GPU recomendadas: 4 x Mac Studio M3 Ultra de 512 GB con malla completa de Thunderbolt 5 con RDMA, configuración validada por el autor. No se documenta funcionamiento en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no. El tamaño del repositorio (680 GB) y la memoria por rango medida lo impiden.
- Opciones de despliegue: mlx-lm 0.31.3 (probado) con el módulo `glm_dsa_mtp.py` cargado mediante `model_file` en `config.json`; el bucle de borrador y verificación no está incluido en el módulo y vive en un servidor propio del autor que no se ha publicado. El autor indica que no se probó ningún otro lanzador.
- Latencia y throughput: ver la tabla de benchmarks. El primer token con un prompt de 256K tarda 491 s. Los kernels Metal personalizados se activan o desactivan con variables de entorno `GLM_*`; al importar el módulo se fija `mx.set_cache_limit` con `GLM_CACHE_LIMIT_GB` (16 GB por defecto).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-MLX-6bit-MTP (esta ficha) | 823,9B (safetensors); 753,3B según recuento del repo | 1.048.576 | MLX, Apple Silicon, TP multi-nodo | `glm-5.3` | Hugging Face, 356 descargas |
| zai-org/GLM-5.3 (BF16) | no disponible en la informacion | no disponible | safetensors BF16 | `glm-5.3` | Hugging Face (modelo base oficial) |
| zai-org/GLM-5.3-BF16 | no disponible en la informacion | no disponible | safetensors BF16, 282 shards | `glm-5.3` | Hugging Face (origen de la cabeza MTP) |
| orcarouter/GLM-5.3-MLX | no disponible en la informacion | no disponible | MLX 6 bits (sin cabeza MTP) | no disponible | Hugging Face (commit `c66bbe0`) |

No se dispone de datos de benchmarks de calidad para establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo se declaran inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- No se han publicado evaluaciones de sesgo, alucinación o seguridad en la información disponible.
- La licencia `glm-5.3` (etiquetada como `other`) debe revisarse antes de cualquier uso comercial; el repositorio incluye un archivo `LICENSE` cuyo texto no se detalla.
- El bucle de decodificación especulativa que usa la cabeza MTP no está incluido en el módulo publicado: reside en un servidor del autor no publicado, por lo que sin él se pierde la aceleración medida.
- Solo se ha validado con mlx-lm 0.31.3 y MLX 0.32.2.dev20261009 sobre 4 x Mac Studio M3 Ultra; no hay garantías en otras configuraciones ni en GPU NVIDIA.
- El repositorio mezcla pesos de dos fuentes (tronco de `orcarouter` y cabeza MTP del checkpoint oficial BF16); aunque el autor verifica la reconstrucción, conviene validar la coherencia del modelo en el caso de uso propio.
- El consumo de memoria es muy elevado (pico de 247 GB por nodo con 256K de contexto) y el prefill de contextos largos es lento (491 s hasta el primer token con 256K).
- El repositorio tiene 0 likes y 356 descargas, con actualización el mismo día de su creación; se trata de una conversión de terceros, no de un artefacto oficial de Z.ai.
- El recuento de parámetros difiere entre el dato de safetensors (823,9B) y el recuento del repositorio (753,3B); conviene tenerlo en cuenta al planificar memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AinsleyMarkov/GLM-5.3-MLX-6bit-MTP
- Modelo base oficial: https://huggingface.co/zai-org/GLM-5.3
- Checkpoint BF16 oficial (origen de la cabeza MTP): https://huggingface.co/zai-org/GLM-5.3-BF16
- Conversión MLX previa del tronco: https://huggingface.co/orcarouter/GLM-5.3-MLX
- Herramienta de medición citada: https://www.npmjs.com/package/llmprobe
- Ficha en Silytics: https://silytics.si/models/AinsleyMarkov/GLM-5.3-MLX-6bit-MTP
