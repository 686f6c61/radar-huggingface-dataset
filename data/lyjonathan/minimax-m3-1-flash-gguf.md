# LyJonathan/MiniMax-M3.1-Flash-GGUF

## Resumen

MiniMax-M3.1-Flash-GGUF es una cuantización de tipo GGUF del modelo MiniMaxAI/MiniMax-M3.1-Flash, un transformer con mezcla de expertos (MoE) de 426.186.370.176 parámetros totales (≈426,2 B). La publica el usuario LyJonathan mediante las herramientas Strata (`strata-mm-quant`), que generan las cuantizaciones en CPU a partir de los pesos originales, publicados originalmente en NVFP4/MXFP8 de 4 bits con QAT. El objetivo es hacer utilizable un MoE de este tamaño en hardware de consumo, a costa de una pérdida de fidelidad notable.

El repositorio contiene un único conjunto de 13 particiones en formato IQ2_XS que ocupa aproximadamente 133,1 GB en disco. Los expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`) se cuantizan a IQ2_XS, mientras que atención, MLP densa, expertos compartidos y embeddings se mantienen en Q8_0 y la capa de salida en Q6_K. El autor advierte explícitamente de que IQ2_XS es una cuantización de 2 bits «notablemente degradada»: divergencia KL media de 1,92, acuerdo top-1 del 46,8 % y perplejidad 1,71 veces superior a la referencia FP32.

La relevancia ahora es doble: por un lado, permite ejecutar un modelo de más de 400 B en equipos con poca VRAM y mucha RAM (el smoke test se hizo con 2× RTX 5070 de 12 GB y 128 GB de DDR4); por otro, requiere un parche de llama.cpp que todavía no está en upstream para aprovechar el indexer de atención dispersa de M3.1, de modo que con compilaciones estándar las capas 0-2 caen a atención densa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); arquitectura `minimax-m3` con indexer de atención dispersa (M3.1) |
| Parámetros totales | 426.186.370.176 (≈426,2 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 8192`) |
| Tipos de cuantización | IQ2_XS (expertos enrutados, imatrix); Q8_0 (atención, indexer, MLP densa, expertos compartidos, `token_embd`); Q6_K (`output.weight`); F32 (router gate, `exp_probs_b`, normas) |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (en HuggingFace aparece como `license: other` con `license_name: minimax-community`) |
| Formato de pesos | GGUF, 13 particiones (`split`), ≈133,1 GB en disco |
| Tamaño de vocabulario | 200.064 tokens (metadata en la partición 1) |
| Tensores en el conjunto | 1.188 |
| Atención (`key_length` / `value_length`) | 128 / 128 |
| RoPE | `freq_base` = 10.000.000; `dimension_count` = 64 |
| Calibración de la imatrix | 23.738 tokens (`calibration.txt:shard0of1`) |
| Descargas / likes | 0 / 2 |

## Arquitectura y entrenamiento

El modelo base es un MoE con arquitectura `minimax-m3`: capas con expertos enrutados por un router gate (en F32 en esta cuantización), expertos compartidos y una MLP densa, más un mecanismo de atención dispersa gobernado por un indexer. La variante 3.1 introduce ese indexer de atención, y el GGUF expone la clave `minimax-m3.attention.indexer.first_layer` con valor `0` para que las capas 0-2 también usen atención dispersa. La atención tiene `key_length = value_length = 128`, lo que no coincide con el valor por defecto `embedding_length / head_count` = 96, un detalle que cualquier loader debe respetar para dar forma correcta al tensor Q.

Los pesos originales se publicaron como expertos en NVFP4 de 4 bits con cuantización consciente del entrenamiento (QAT). El proceso de esta ficha es una recuantización: los expertos se comprimen a ~2 bits con una imatrix de activaciones real construida sobre 23.738 tokens, y los tensores sensibles (atención, MLP densa, expertos compartidos, embeddings) se mantienen en Q8_0. No se dispone de información sobre el dataset de preentrenamiento, el número de tokens vistos, el cómputo empleado ni las etapas de alineación (RLHF/DPO) del modelo base. El autor indica que está preparando un nivel de mayor calidad (proyecciones down en 3 bits, ~146 GB).

La validación de la cuantización se hizo comparando logits con implementación forzada por profesor (*teacher forcing*) entre una referencia en PyTorch FP32, validada paso a paso contra el checkpoint original, y llama.cpp parcheado para M3.1, sobre los mismos token ids. La integridad está verificada: las 13 particiones coinciden con sus SHA-256 publicados, se parsearon las cabeceras y tablas de tensores y se comprobó el tamaño exacto de cada archivo sin bytes sobrantes ni ausentes.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational`, y la model card confirma que la cuantización IQ2_XS «escribe texto coherente».
- Ejecución local de un MoE de 426 B mediante offload de expertos a RAM del sistema (`-ot "exps=CPU"`), manteniendo el resto en GPU.
- Atención dispersa mediante indexer en las capas 0-2 y siguientes, siempre que se use una compilación de llama.cpp con el parche de MiniMax-M3.1.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`); la model card no documenta el mecanismo concreto.
- Inferencia multi-turno con prompts largos: las pruebas de fidelidad incluyeron 8 prompts, dos de ellos de más de 4K tokens, y 935 posiciones evaluadas.
- Razonamiento, código, matemáticas, visión, audio, tool calling y capacidades de agente: no disponible en la información proporcionada.

## Casos de uso

- Investigación en cuantización extrema: sirve como caso de estudio reproducible de cómo afecta IQ2_XS a un MoE de 426 B, con métricas publicadas (KL 1,92, acuerdo top-1 46,8 %) y sumas SHA-256 verificables para replicar experimentos.
- Despliegue de bajo presupuesto en VRAM: con 2× RTX 5070 de 12 GB y 128 GB de DDR4, el modelo carga en 32-35 s manteniendo los expertos enrutados en CPU; útil para entornos donde la RAM es abundante y la GPU escasa.
- Prototipado conversacional offline: al escribir texto coherente, permite probar flujos de chat multi-turno sin depender de APIs externas, aceptando la pérdida de calidad frente al modelo original.
- Validación de llama.cpp y de la implementación de `minimax-m3`: el repositorio incluye detalles de claves GGUF (`attention.key_length`, `rope.freq_base`, `minimax-m3.attention.indexer.first_layer`) útiles para desarrolladores que implementen o verifiquen el soporte del loader.
- Comparación de recetas de cuantización: la métrica de perplejidad (68,0 frente a 39,7 de referencia, 1,71×) permite contrastar esta receta IQ2_XS con la futura tier de 3 bits (~146 GB) cuando esté disponible.
- Pruebas de integridad y pipelines de descarga: los 13 archivos, con tamaños entre 3,4 GB y 18,2 GB y hashes publicados en `SHA256SUMS`, permiten ejercitar procedimientos de verificación y reanudación de descargas en infraestructura propia.
- Evaluación de atención dispersa: con el parche aplicado, sirve para medir el efecto del indexer M3.1 en capas tempranas frente al fallback denso de llama.cpp estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos son métricas de fidelidad de la cuantización frente a una referencia FP32 y un smoke test de velocidad.

Métricas de fidelidad (8 prompts, dos de ellos de más de 4K tokens, 935 posiciones):

| Métrica | IQ2_XS | Referencia FP32 |
|---|---:|---:|
| Divergencia KL (media) | 1,92 | — |
| Acuerdo top-1 | 46,8 % | — |
| Acuerdo top-1 donde la referencia tiene >99 % de confianza | 86,8 % | — |
| Perplejidad (muestra de texto plano de 2.048 tokens) | 68,0 | 39,7 (1,71×) |

Smoke test con llama.cpp sin ajuste fino, medido una vez (2× RTX 5070 12 GB, Ryzen 9 5900X, 128 GB DDR4, expertos en CPU):

| Métrica | Valor |
|---|---|
| Tiempo de carga | 32-35 s |
| Prefill | ≈2,0-2,3 tok/s |
| Decode | ≈2,9-3 tok/s (valor truncado en la model card) |

## Requisitos de hardware

- Almacenamiento: ≈133,1 GB para las 13 particiones, que deben mantenerse juntas; los nombres de archivo determinan el conjunto de splits.
- VRAM: el conjunto completo no cabe en GPU de consumo. La configuración verificada es 2× RTX 5070 de 12 GB con `-ot "exps=CPU"`, que mantiene los expertos enrutados en RAM del sistema.
- RAM: 128 GB de DDR4 en la configuración del smoke test. Los expertos ocupan la mayor parte de los 133 GB, por lo que se necesita un volumen de memoria del sistema del mismo orden.
- Para mantener todo el modelo en VRAM harían falta al menos dos GPU de 80 GB (133 GB de pesos); es una estimación aritmética a partir del tamaño en disco, no un dato publicado.
- GPU recomendadas: no disponible. La única configuración documentada es la de 2× RTX 5070; con más VRAM puede prescindirse de `-ot "exps=CPU"` y aumentar `-ngl`.
- Despliegue: llama.cpp con el parche de MiniMax-M3.1 (no en upstream). Comando de referencia: `llama-cli -m IQ2_XS/MiniMax-M3.1-Flash-IQ2_XS-00001-of-00013.gguf -ngl 99 -ot "exps=CPU" -fa on -c 8192`. Soporte en el motor Strata en desarrollo. Otros runners (vLLM, TGI, Ollama) no están documentados en la información disponible.
- Throughput: prefill ≈2,0-2,3 tok/s y decode ≈2,9-3 tok/s en la configuración citada. Sin datos para configuraciones con más VRAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Fidelidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LyJonathan/MiniMax-M3.1-Flash-GGUF (esta ficha) | 426,2 B (MoE) | no disponible | GGUF IQ2_XS + Q8_0/Q6_K, ≈133 GB | KL 1,92; top-1 46,8 %; perplejidad 1,71× | minimax-community | Público en HuggingFace |
| MiniMaxAI/MiniMax-M3.1-Flash (base) | 426,2 B (MoE) | no disponible | NVFP4 / MXFP8 de 4 bits con QAT | Referencia (FP32 validado) | minimax-community | Público en HuggingFace |
| Tier de 3 bits anunciada por el autor | 426,2 B (MoE) | no disponible | GGUF, proyecciones down en 3 bits, ~146 GB | no disponible (en preparación) | minimax-community | No publicada |
| Otras cuantizaciones de MoE de ~400 B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de otros modelos comparables en la información proporcionada; la comparación se limita al modelo base y a la tier anunciada por el mismo autor.

## Limitaciones y advertencias

- La cuantización IQ2_XS está degradada de forma explícita: el propio autor la describe como «notablemente degradada» frente a cuantizaciones típicas. El acuerdo top-1 del 46,8 % implica que más de la mitad de las predicciones difieren del modelo de referencia.
- Riesgo elevado de alucinación y de errores factuales: la perplejidad es 1,71 veces la de la referencia (68,0 frente a 39,7) en una muestra de texto plano de 2.048 tokens.
- El acuerdo top-1 sube al 86,8 % solo cuando la referencia tiene más del 99 % de confianza, es decir, el modelo acierta sobre todo en tokens triviales.
- Requiere un build de llama.cpp con el parche de MiniMax-M3.1: sin él, las capas 0-2 usan atención densa y los pesos del indexer no se aplican, con lo que el comportamiento difiere del previsto.
- Los 13 archivos deben permanecer juntos; las particiones 2 a 13 solo llevan `split.no`, `split.count` y `split.tensors.count`, sin tokenizer ni metadata propia.
- Licencia `minimax-community` (etiquetada como `other`): no se han revisado aquí las cláusulas de uso comercial; deben consultarse en el enlace de licencia del modelo base antes de un despliegue en producción.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no declarada en la model card; `-c 8192` es solo un valor de ejemplo, no una especificación.
- Throughput muy bajo (~3 tok/s de decode) en la configuración probada, insuficiente para aplicaciones interactivas con requisitos de latencia.
- Repositorio con 0 descargas y sin resultados de benchmarks de tareas, por lo que no hay evidencia pública de calidad más allá de las métricas de fidelidad del autor.
- Licencia del modelo base pendiente de verificación para uso comercial; el autor no ofrece garantías sobre el comportamiento en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LyJonathan/MiniMax-M3.1-Flash-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash/blob/main/LICENSE
- Sumas de verificación SHA-256: https://huggingface.co/LyJonathan/MiniMax-M3.1-Flash-GGUF/blob/main/SHA256SUMS
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a SteamDB y no guardan relación).
