# Raufaser/ThinkingCap-Qwen3.8-27B-hipfire-MQ4L

## Resumen

ThinkingCap-Qwen3.8-27B-hipfire-MQ4L es una conversión de cuantización del modelo ThinkingCap Qwen3.8-27B, publicada por el usuario Raufaser en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado de ThinkingCap (desarrollado por BottleCap AI), que a su vez parte de Qwen3.8-27B de Alibaba Cloud / Qwen Team. El resultado son tres ficheros en formato propietario MQ4G256V2Lloyd (tipo de cuantización 52), diseñados exclusivamente para el motor de inferencia hipfire sobre GPUs AMD.

La relevancia de esta publicación es fundamentalmente técnica: demuestra una ruta de cuantización de 4 bits con codebook Lloyd-Max de 16 niveles por tensor, escalas de activación AWQ derivadas de una matriz de importancia específica del modelo y rotación FWHT, manteniendo el mismo régimen de bits que una rejilla uniforme de 4 bits pero con menor divergencia KL respecto al profesor. Los ficheros no son legibles por llama.cpp y requieren una build de hipfire con soporte para el tipo qt 52.

El modelo subyacente es un transformer de 27B parámetros (según la nomenclatura del checkpoint original) con atención lineal de tipo SSM según se deduce de las referencias a `ssm_out` y `linear_attn.out_proj` en la model card. La licencia PolyForm Small Business 1.0.0 con permiso adicional para uso personal no comercial condiciona fuertemente su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con componentes de atención lineal/SSM (referencias a `ssm_out` y `linear_attn.out_proj`) |
| Parámetros totales | 27B (según nomenclatura del checkpoint base ThinkingCap Qwen3.8-27B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MQ4G256V2Lloyd (tipo 52), 4 bits con codebook Lloyd-Max de 16 niveles por tensor, rotación FWHT, escalas AWQ; tres tiers: base, pro, xt |
| Idiomas soportados | no disponible |
| Licencia | PolyForm Small Business 1.0.0, con permiso adicional para uso personal no comercial; uso comercial por organizaciones que no sean Small Business requiere licencia aparte de BottleCap AI; materiales upstream de Qwen bajo Apache-2.0 |
| Formato de pesos | `.mq4l` (formato hipfire, no compatible con llama.cpp ni GGUF) |

Detalle de ficheros publicados:

| Fichero | Tier | Bytes | SHA-256 |
|---|---|---:|---|
| `ThinkingCap-Qwen3.8-27b.mq4l` | base | 15.662.692.352 | `09449ef70dae14d0dfaee088ba2063bf7132375eaa653205600e6d359f9dc529` |
| `ThinkingCap-Qwen3.8-27b.mq4l-pro` | pro | 16.464.251.904 | `4db0afa6ae131b6f8fc11255e5093eaf5a3070d756a1cc2da866760b6016a270` |
| `ThinkingCap-Qwen3.8-27b.mq4l-xt` | xt | 14.987.262.016 | `7468eb830b795ec528f4895ed773e9fcae5830b73a6cb44eb2376d5d93b52fe0` |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento del modelo base ThinkingCap Qwen3.8-27B; esta publicación es únicamente una conversión de formato. Lo que sí se detalla es la arquitectura de cuantización: contenedor MQ4V2 rotado con FWHT que conserva grupos de 136 bytes, sustituyendo la rejilla uniforme de 4 bits por un codebook Lloyd-Max de 16 niveles por tensor al mismo régimen de bits. Los ficheros incorporan escalas de activación AWQ calculadas a partir de una matriz de importancia específica de ThinkingCap, publicada por mradermacher junto a sus cuantizaciones i1 GGUF.

La reproducción se realiza con `hipfire-quantize` partiendo de los safetensors BF16, con el flag `--awq-fix-la-head-order` para remapear las entradas V-head de atención lineal del imatrix de llama.cpp al orden de HF. Los tres tiers difieren en qué tensores se elevan a mayor precisión: `xt` mantiene `lm_head` en el codec base, `base` eleva `embed` y `lm_head`, y `pro` eleva además `ssm_out` (`linear_attn.out_proj`). No se incluye sidecar MTP.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base ThinkingCap Qwen3.8-27B.
- Razonamiento y matemáticas: el nombre "ThinkingCap" sugiere un modelo orientado a razonamiento, aunque la model card no detalla capacidades específicas.
- Atención lineal/SSM: la presencia de `linear_attn.out_proj` y `ssm_out` indica componentes de atención lineal en la arquitectura, potencialmente para contextos largos, aunque no se confirma la longitud de contexto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas aparece vacío en Hugging Face.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en cuantización de 4 bits sobre GPUs AMD: el modelo sirve como referencia reproducible para evaluar el impacto del codebook Lloyd-Max frente a la rejilla uniforme, con métricas KL documentadas y hashes verificables.
- Despliegue local en hardware AMD RDNA3: el tier `xt` (14,99 GB) cabe en GPUs con 16 GB de VRAM como la RX 7900 XTX, permitiendo ejecutar un modelo de 27B cuantizado a 4 bits en hardware de consumo.
- Evaluación comparativa de tiers de cuantización: los tres ficheros permiten medir el compromiso entre tamaño y calidad (reducción KL de 10,3%, 7,7% y 11,2% para base, pro y xt respectivamente) en un mismo pipeline.
- Reproducción de pipelines de cuantización AWQ: la receta documentada con `hipfire-quantize`, imatrix y `--awq-fix-la-head-order` sirve para validar el flujo completo sobre otros checkpoints.
- Prototipado de aplicaciones de generación de texto en entornos personales no comerciales, donde la licencia PolyForm Small Business permite uso individual sin licencia adicional.
- Benchmarking de motores de inferencia: al no ser compatible con llama.cpp, el modelo es útil para comparar el rendimiento de hipfire frente a otros runtimes en la misma GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente métricas de divergencia KL de la cuantización respecto al profesor:

| Tier | MQ4V2 uniforme, AWQ | MQ4-Lloyd, AWQ | Reducción Lloyd | SHA-256 `.kldseq` |
|---|---:|---:|---:|---|
| base | 0,042280 | 0,037912 | 10,3% | `f5f071d8b1c0d95cfbf1c47c2c38b9f4c1996b524add8b4c07be44dd1c1a918e` |
| pro | 0,038961 | 0,035965 | 7,7% | `ab54d7466b40ddbe5dc706c970d4df513789dca472275a0dc0550c0dcc0a4ce9` |
| xt | 0,049629 | 0,044081 | 11,2% | `463a91f370277592877a3f45c59232b3a244019a8c80953a66b764aee7d77892` |

Condiciones de medida: slice WT2, 24 chunks de 2048 tokens, 24.552 tokens puntuados, con `eval_hipfire --scoring-mode prefill --max-chunks 24 --kv-mode q8 --kv-v q8` sobre gfx1100 (RX 7900 XTX, HIP 7.16 / TheRock 10.1), con `HIPFIRE_GRAPH=0`, `HIPFIRE_NORMALIZE_PROMPT=0` y `HIPFIRE_IU4_PREFILL=0`. El profesor es `ThinkingCap.mq5v2-pro.hfq` (SHA-256 `3c4ffa528f5dbfff82ff5f8ce8dcaaedeb96eb8283ee1b7fed9470d06dcbe266`). Los valores son comparables entre sí, no con los pins BF16 publicados en `hipfire-models/qwen3.8-27b`, que usan otro profesor.

## Requisitos de hardware

- VRAM estimada: aproximadamente 15-16,5 GB para los pesos según tier (`xt` 14,99 GB, `base` 15,66 GB, `pro` 16,46 GB), más overhead de contexto y caché KV cuantizada en q8.
- GPU recomendadas: AMD gfx1100 (RX 7900 XTX) es la plataforma de referencia documentada; se requiere una build de hipfire con soporte MQ4-Lloyd (qt 52) y ruta de prefill/decode gfx1100 (PR #1029).
- GPU de consumo: sí, el tier `xt` cabe en GPUs AMD con 16 GB de VRAM; no hay soporte documentado para GPUs NVIDIA en esta publicación.
- Opciones de despliegue: exclusivamente hipfire (`hipfire serve ThinkingCap-Qwen3.8-27b.mq4l --kv q8 --spec off`). No compatible con llama.cpp, vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; la model card no publica medidas de rendimiento de inferencia.
- Sin sidecar MTP incluido, por lo que no hay decodificación especulativa disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-hipfire-MQ4L | 27B | no disponible | `.mq4l` (hipfire) | PolyForm Small Business 1.0.0 | hipfire |
| ThinkingCap-Qwen3.8-27B (original) | 27B | no disponible | safetensors BF16 | PolyForm Small Business 1.0.0 | transformers, vLLM, etc. |
| ThinkingCap-Qwen3.8-27B-i1-GGUF (mradermacher) | 27B | no disponible | GGUF | PolyForm Small Business 1.0.0 | llama.cpp |
| Qwen3.8-27B (upstream) | 27B | no disponible | safetensors | Apache-2.0 | múltiples |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros solo cargan en hipfire con soporte qt 52; llama.cpp no puede leerlos y no hay soporte documentado para otros runtimes.
- Licencia restrictiva: PolyForm Small Business 1.0.0 permite uso personal no comercial, pero el uso comercial por organizaciones que no sean Small Business requiere licencia separada de BottleCap AI; los términos Apache-2.0 del upstream Qwen siguen aplicando a los materiales originales.
- Sin datos de benchmarks de calidad: no hay resultados de MMLU, HumanEval, GSM8K ni similares, solo métricas KL de cuantización.
- Idiomas no especificados: el campo de idiomas está vacío, por lo que no se puede garantizar cobertura multilingüe.
- Longitud de contexto no documentada: no se indica la ventana de contexto soportada, lo que impide planificar aplicaciones con requisitos de contexto largo.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluaciones de fiabilidad publicadas para este checkpoint.
- Sesgos: no documentados en la model card.
- Cuantización de 4 bits: aunque la reducción KL es de 7,7-11,2% frente a la rejilla uniforme, sigue siendo una cuantización agresiva con pérdida de precisión respecto al BF16 original.
- Plataforma limitada a AMD: la ruta documentada es gfx1100; no hay validación en otras GPUs.
- Sin sidecar MTP: no se puede usar decodificación especulativa con estos ficheros.
- Publicación con 0 descargas y 0 likes: sin validación comunitaria ni reportes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raufaser/ThinkingCap-Qwen3.8-27B-hipfire-MQ4L
- Modelo base ThinkingCap Qwen3.8-27B: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B/blob/main/LICENSE
- Cuantizaciones i1 GGUF e imatrix de mradermacher: https://huggingface.co/mradermacher/ThinkingCap-Qwen3.8-27B-i1-GGUF
- Repositorio hipfire: https://github.com/warpfront/hipfire
- PRIOR-ART.md de hipfire: https://github.com/warpfront/hipfire/blob/master/PRIOR-ART.md
- PR #768 (MQ4-Lloyd): https://github.com/warpfront/hipfire/pull/768
- PR #1029 (ruta gfx1100 Lloyd prefill/decode): https://github.com/warpfront/hipfire/pull/1029
