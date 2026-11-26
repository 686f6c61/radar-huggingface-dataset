# nchapman/Ternary-Bonsai-2-9B-warp34

## Resumen

Ternary-Bonsai-2-9B-warp34 es una conversión cuantizada del modelo multimodal prism-ml/Ternary-Bonsai-2-9B-mlx-2bit, publicada por el usuario nchapman. Se trata de un modelo visión-lenguaje de la familia Qwen3_5 (clase `Qwen3_5ForConditionalGeneration`) con 4.374.703.856 parámetros reales según los pesos safetensors, aunque el autor lo describe como un "9B dense hybrid GatedDeltaNet + full attention". La conversión aplica cuantización ternaria pura de 5 trits (esquema PTQ1_0) al tronco de lenguaje, al `embed_tokens` y al `lm_head`, mientras reutiliza la torre de visión y la cabeza MTP del modelo base.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización extrema (1,75 bits por peso) que reduce el peso total a 2,36 GB en un único shard safetensors, un 15,1% menos que la variante W2A16. Por otro, expone un contrato de kernel muy específico (layout de 26 bytes por bloque de 128 pesos, rotación Hadamard H_4096, decodificación base-3 sin ramas) que condiciona por completo su despliegue: no es un modelo que funcione con un `pipeline()` estándar de transformers sin implementar el codec.

El modelo se distribuye bajo licencia Apache 2.0, no declara idiomas soportados y no registra descargas ni likes en el momento de la consulta. Es, por tanto, un artefacto de investigación orientado a benchmarking controlado de cuantización, no un modelo listo para producción sin trabajo de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3_5 (`Qwen3_5ForConditionalGeneration`): 32 capas de lenguaje, 24 GatedDeltaNet + 8 de atención completa, más torre de visión |
| Parametros totales | 4.374.703.856 (según safetensors); el autor describe el modelo base como "9B dense" |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria 5-trit PTQ1_0 (1,75 bpw, group_size=128) en tronco, `embed_tokens` y `lm_head`; W4A16-HGPTQ (g64-h64, linear_fc2 h16) en visión; W8_g64 y W4_g64 en MTP; BF16/FP32 en `linear_attn` (in_proj_a, in_proj_b, conv1d, A_log, dt_bias, norm), RMSNorms y `visual.patch_embed.proj` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (un único shard, 2,36 GB / 2,20 GiB); tensores `weight_5trit` uint8, `weight_scale` FP16, `weight_shape` int64; visión en `weight_packed` int32 + `weight_scale` bfloat16 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base: un transformer híbrido con 32 capas de lenguaje, de las cuales 24 son GatedDeltaNet (atención lineal con estado recurrente) y 8 son atención completa. A esto se suma una torre de visión con 110 capas lineales cuantizadas en W4A16-HGPTQ y una cabeza Native MTP (multi-token prediction) que actúa como draft head para decodificación especulativa. El checkpoint incluye `embed_tokens` y `lm_head` cuantizados de forma ternaria, algo poco habitual y que obliga a aplicar la rotación Hadamard también en la entrada y la salida.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF o DPO; el autor solo documenta el proceso de cuantización post-entrenamiento (PTQ). La innovación técnica central es el codec de 5 trits: cada bloque de 128 pesos se empaqueta en 26 bytes (16 bytes × 5 trits = 80 pesos, 8 bytes × 5 trits = 40 pesos, 2 bytes × 4 trits = 8 pesos) más una escala FP16 de 2 bytes, lo que da 1,75 bpw exactos. La decodificación se hace con una multiplicación base-3 sin ramas que preserva el wraparound de 8 bits, y se aplica una rotación Hadamard H_4096 normalizada por 1/64 con plegado de signos previo en las proyecciones de salida (`v_o_proj`) y post-multiplicación en `embed_tokens`. El autor verifica paridad bit-exacta de trits contra el W2A16 en los 202 tensores ternarios y equivalencia exhaustiva de los 243 estados del codec de 5 trits.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del tronco Qwen3_5.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con torre de visión cuantizada en W4A16-HGPTQ.
- Decodificación especulativa mediante la cabeza Native MTP incluida en el checkpoint.
- Capacidades multilingües: no documentadas por el autor; no disponible.
- Tool calling y function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Modo thinking: no documentado.
- Audio: no soportado según la información disponible.

## Casos de uso

- Investigación en cuantización extrema: el modelo sirve como banco de pruebas para medir la degradación de calidad de un esquema ternario de 5 trits (1,75 bpw) frente a W2A16 y al modelo en precisión completa, con paridad de trits verificada bit a bit.
- Despliegue en dispositivos con memoria muy limitada: con 2,36 GB de pesos totales, el checkpoint cabe en GPUs consumer de 4-8 GB y en placas tipo Jetson, siempre que se implemente el kernel de decodificación de 5 trits.
- Benchmarking A/B controlado de torres de visión: al reutilizar la misma torre W4A16-HGPTQ y la misma MTP que la variante W2A16, permite aislar el efecto del tronco ternario en tareas imagen-texto.
- Prototipado de asistentes multimodales en local: un pipeline image-text-to-text con menos de 3 GB de pesos facilita experimentar con descripciones de imágenes y VQA en estaciones de trabajo sin GPU de datacenter.
- Estudio de decodificación especulativa: la MTP nativa permite medir la aceleración de la generación frente a decodificación autoregresiva estándar en un modelo de tamaño medio.
- Base para destilación o fine-tuning con QLoRA sobre pesos ternarios: el formato empaquetado y las escalas FP16 exactas facilitan experimentos de adaptación de bajo rango sobre un tronco de muy baja precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4-3 GB solo para pesos; hay que sumar KV cache, activaciones y buffers del kernel de decodificación, por lo que en la práctica se recomienda un mínimo de 6-8 GB.
- GPU recomendadas: A100 o H100 para benchmarking reproducible y throughput alto; RTX 4090 o RTX 3090 para desarrollo.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080). En 4-6 GB requeriría gestión cuidadosa del KV cache y contexto corto.
- Opciones de despliegue: no hay soporte estándar en vLLM, llama.cpp, Ollama ni TGI para el codec de 5 trits; el autor indica que el runtime debe implementar el contrato `warp34` descrito en `config.json` (`quantization_config.warp_quant_5trit`, `warp_quant_embed_w2`, `warp_quant_input_signs`). En GPUs Ampere es necesario repackear los grupos a formato word-major o SoA de 208 bytes para cargas `ld.global.v4.u32` coalescidas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B-warp34 | 4.374.703.856 | No disponible | Ternaria 5-trit (1,75 bpw) + W4A16 visión | Apache 2.0 | Hugging Face, requiere kernel propio |
| prism-ml/Ternary-Bonsai-2-9B-mlx-2bit (base) | No disponible | No disponible | 2-bit MLX | No disponible | Hugging Face |
| Ternary-Bonsai-2-9B-W2A16 (referencia del autor) | No disponible | No disponible | Ternaria W2A16 | No disponible | Hugging Face |

La comparativa con modelos de la misma categoría (visión-lenguaje de ~9B en precisión completa) no está disponible en la información proporcionada; el autor solo referencia las variantes del propio Bonsai.

## Limitaciones y advertencias

- La cuantización ternaria de 5 trits introduce pérdida de calidad respecto al modelo en precisión completa; el autor solo verifica paridad bit-exacta con la variante W2A16, no con el modelo original sin cuantizar.
- El modelo no funciona con `transformers` de forma directa: requiere implementar el codec `warp34` (decodificación base-3, rotación H_4096, plegado de signos) y el repackeo de grupos para GPUs Ampere.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar la tasa de error factual.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento aceptable fuera del inglés sin evaluación previa.
- Longitud de contexto no disponible; planificar el despliegue con contexto conservador hasta verificarla empíricamente.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de soporte de runtime estándar traslada al integrador toda la responsabilidad de validación.
- El checkpoint tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de mantenimiento activo.
- La torre de visión y la MTP se reutilizan del modelo W2A16, por lo que cualquier limitación de esa variante se hereda aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Ternary-Bonsai-2-9B-warp34
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Variante de referencia W2A16: no disponible (enlace no incluido en la información proporcionada)
- Paper, blog o repositorio del esquema PTQ1_0: no disponible
