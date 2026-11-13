# Beling86/Qwen-Concept-27B-8.88BPW

## Resumen

Qwen-Concept-27B-8.88BPW es una cuantización W8A8 INT8 de precisión mixta del modelo base inclusionAI/Qwen-Concept-27B, publicada por el usuario Beling86. El modelo original emplea una arquitectura híbrida de atención lineal y atención completa, con una cabeza de predicción multi-token (MTP) para decodificación especulativa. La cuantización ha sido generada mediante un pipeline de SmoothQuant combinado con GPTQ secuencial sensible a activaciones, orientado a eliminar la distorsión provocada por valores atípicos en las activaciones sobre GPUs Ampere, Ada Lovelace y Hopper.

El checkpoint contiene 21.489.245.920 parámetros reales (según los safetensors) y un tamaño de repositorio de 29,9 GB, lo que refleja el esquema de precisión mixta: 288 capas en W8A8 INT8, 112 capas en W8A16 (con activaciones en BF16) y capas sensibles (embeddings, lm_head, capas visuales y normalizaciones) mantenidas en BF16. La licencia es Apache 2.0 y el formato de pesos es safetensors con `compressed-tensors`, compatible con vLLM (≥ 0.28) y SGLang.

Su relevancia actual radica en que preserva la fidelidad distribucional del modelo BF16 original con una degradación de perplejidad prácticamente nula (26,635 → 26,614) y un 97,10 % de acuerdo top-1 en el siguiente token, lo que lo convierte en una alternativa práctica para servir el modelo en producción con menor huella de memoria y mayor throughput de prefill y batching.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención lineal + atención completa, con cabeza de predicción multi-token (MTP) |
| Parametros totales | 21.489.245.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (según el comando de servicio recomendado con `--max-model-len 32768`) |
| Tipos de cuantizacion | W8A8 INT8 (288 capas), W8A16 (112 capas), BF16 sin cuantizar en capas sensibles; pipeline SmoothQuant + GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors`; incluye `model-mtp.safetensors` para decodificación especulativa |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina capas de atención lineal con capas de atención completa, e incorpora una cabeza de predicción multi-token (MTP) para acelerar la decodificación especulativa. Sobre sus 400 capas lineales, esta cuantización aplica una partición matemática de precisión: 288 módulos (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `linear_attn.in_proj_qkv`, `linear_attn.in_proj_z`) se ejecutan en W8A8 INT8 con kernel `CutlassInt8ScaledMM`; 112 módulos (`mlp.down_proj`, `linear_attn.out_proj`) se mantienen en W8A16 con activaciones en BF16 como escudo frente a valores atípicos; y embeddings, `lm_head`, capas visuales, LayerNorms y las convoluciones/biases del GDN permanecen en BF16.

El proceso de cuantización consta de tres fases. Primero, se aplican plegados matemáticos de SmoothQuant calculando máximos de activación por canal sobre 12 ventanas de calibración (6.144 tokens) que cubren diálogo multi-turno, generación de código y prosa técnica, resolviendo el exponente óptimo α por capa mediante un objetivo MSE proxy. Después, se ejecuta GPTQ secuencial sensible a activaciones con 256 secuencias de calibración de 2.048 tokens cada una (524.288 tokens en total), ajustando matrices hessianas inversas capa a capa e instalando pre-hooks dinámicos de activación INT8 para que cada capa se adapte a las entradas cuantizadas de las anteriores. Finalmente, la cabeza MTP se separa y se injerta en `model-mtp.safetensors` con mapas de índices sincronizados para no romper la decodificación especulativa. No se dispone de información sobre el volumen total de tokens de entrenamiento del modelo base ni sobre si se aplicó RLHF o DPO.

## Capacidades

- Generación de texto conversacional y continuaciones de prosa técnica, según los dominios cubiertos en la calibración (diálogo multi-turno, código y texto técnico).
- Razonamiento y generación de código: el pipeline de calibración incluye explícitamente generación de código, lo que sugiere soporte para tareas de programación.
- Decodificación especulativa mediante la cabeza MTP incluida en `model-mtp.safetensors`, que acelera la generación con `num_speculative_tokens` configurable.
- Procesamiento visual: la partición de precisión menciona módulos `visual.*` mantenidos en BF16, lo que indica presencia de componentes de visión en el modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat conversacional en producción: el modelo puede gestionar conversaciones multi-turno con hasta 32.768 tokens de contexto, y el esquema W8A8 reduce la huella de memoria frente al BF16, permitiendo mayor concurrencia en vLLM o SGLang.
- Generación de código en pipelines de CI/CD: dado que el conjunto de calibración incluye generación de código, el checkpoint es adecuado para tareas de autocompletado y generación de parches, con el throughput de prefill mejorado (1,4× frente a W8A16 según el autor).
- Asistentes técnicos de documentación: la calibración sobre prosa técnica compleja lo hace apropiado para resumir, reescribir y responder preguntas sobre documentación de ingeniería.
- Despliegue en GPUs de consumo de gama alta: al ejecutarse en Ampere y Ada Lovelace (RTX 3090, RTX 4090), permite servir un modelo de ~21,5 mil millones de parámetros en hardware de estación de trabajo con cuantización INT8.
- Aceleración de inferencia con decodificación especulativa: activando la cabeza MTP con `--speculative-config '{"method":"mtp","num_speculative_tokens":2}'` se reduce la latencia por token en cargas interactivas.
- Evaluación de fidelidad de cuantización: sirve como referencia para equipos que comparan esquemas W8A8 frente a FP8 o RTN, gracias a las métricas KLD y acuerdo top-1 publicadas.
- Backend de aplicaciones con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin restricciones de copyleft.

## Benchmarks y rendimiento

| Modelo | Precisión | Acuerdo top-1 | KLD medio | KLD mediana | KLD P99 | Perplejidad | Masa de cola de referencia |
|---|---|---|---|---|---|---|---|
| Qwen-Concept-27B (v2 SmoothQuant+GPTQ) | W8A8 / W8A16 | 97,10 % | 0,00726 | 0,00422 | 0,0421 | 26,635 → 26,614 | 5,26e-02 |
| Qwen-Concept-27B (v1 SmoothQuant baseline) | W8A8 / W8A16 | 90,99 % | 0,04503 | 0,02645 | 0,2667 | 26,635 → 27,097 | 5,26e-02 |
| Freaksterz Qwen3.8-27B SmoothQuant v3 | W8A8 / W8A16 | 96,90 % | 0,00556 | 0,00371 | 0,0385 | +0,003 Δln | 5,20e-02 |
| Qwen3.8-27B FP8 oficial (Block-128) | FP8 E4M3 | 96,90 % | 0,00584 | 0,00397 | 0,0410 | no disponible | no disponible |
| RTN W8A8 típico (redondeo ingenuo) | W8A8 | ~84,0 % | ~0,1250 | ~0,0850 | ~0,6500 | +0,150 Δln | no disponible |

Las métricas se obtuvieron mediante divergencia KL forzada por profesor sobre el vocabulario completo (24 ventanas × 512 de contexto = 12.264 posiciones; vocabulario de 248.320 tokens) frente a logits de referencia BF16. El autor reporta además una reducción del 84 % en la distorsión distribucional respecto a la v1, una supresión de valores atípicos con P99.9 KLD limitado a 0,1491 y una deriva máxima de logits de 0,7987 (frente a 15,02 en la v1). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 29,9 GB en safetensors; con overhead de activaciones y caché KV para 32.768 tokens se recomienda al menos 40 GB de VRAM para servicio cómodo, y 48 GB o más para maximizar concurrencia.
- GPUs recomendadas: H100 y H200 (Hopper), A100 y A10 (Ampere), L40S y RTX 6000 Ada (Ada Lovelace) para despliegues de producción.
- GPUs de consumo: compatible con RTX 3090 (24 GB, requiere reducir `--max-model-len` o usar tensor parallelism) y RTX 4090 (24 GB, misma consideración). No cabe en GPUs de 16 GB o menos sin particionado adicional.
- Opciones de despliegue: vLLM (≥ 0.28) y SGLang de forma nativa mediante `compressed-tensors`; el autor no menciona soporte de llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: el autor indica que el esquema W8A8 es 1,4× más rápido que W8A16 en prefill y batching; no se proporcionan cifras absolutas de latencia o tokens por segundo.
- Decodificación especulativa: requiere cargar `model-mtp.safetensors` y configurar `--speculative-config` con `num_speculative_tokens` (el ejemplo usa 2).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión | Acuerdo top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Concept-27B-8.88BPW (este) | 21,49 mil millones | 32.768 | W8A8 / W8A16 | 97,10 % | Apache 2.0 | Hugging Face |
| Qwen-Concept-27B v1 SmoothQuant | no disponible | no disponible | W8A8 / W8A16 | 90,99 % | Apache 2.0 | Hugging Face |
| Freaksterz Qwen3.8-27B SmoothQuant v3 | no disponible | no disponible | W8A8 / W8A16 | 96,90 % | no disponible | Hugging Face |
| Qwen3.8-27B FP8 oficial (Block-128) | no disponible | no disponible | FP8 E4M3 | 96,90 % | no disponible | Hugging Face |
| RTN W8A8 típico | no disponible | no disponible | W8A8 | ~84,0 % | no disponible | no disponible |

La comparativa se limita a las alternativas de cuantización citadas por el autor; no se dispone de datos de modelos densos de tamaño similar fuera de la familia Qwen para comparar parámetros, contexto o rendimiento en benchmarks estándar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; hereda los del modelo base inclusionAI/Qwen-Concept-27B, no documentados en esta ficha.
- Riesgo de alucinación: no cuantificado; la degradación de perplejidad es nula según el autor, pero no se han publicado evaluaciones de veracidad factual.
- Limitaciones de contexto: el contexto máximo verificado en la configuración de servicio es de 32.768 tokens; superarlo requiere validación adicional.
- Idiomas: no se especifican los idiomas soportados; la calibración se realizó sobre diálogo multi-turno, código y prosa técnica, sin desglose lingüístico.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base inclusionAI/Qwen-Concept-27B, que no se detalla en la información disponible.
- Dependencia de hardware: el esquema INT8 requiere kernels compatibles (Ampere, Ada Lovelace o Hopper); no se garantiza funcionamiento en arquitecturas anteriores.
- Madurez del checkpoint: 22 descargas y 0 likes en el momento de la consulta, con creación y actualización el mismo día (11 de noviembre de 2026), lo que indica escasa validación comunitaria.
- El comando de servicio del autor referencia el identificador `Beling86/Qwen-Concept-27B-SmoothQuant-W8A8-v2`, distinto del ID del repositorio (`Beling86/Qwen-Concept-27B-8.88BPW`); debe verificarse antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Beling86/Qwen-Concept-27B-8.88BPW
- Modelo base: https://huggingface.co/inclusionAI/Qwen-Concept-27B
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de SGLang: https://github.com/sgl-project/sglang
- Formato compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Paper de SmoothQuant: https://arxiv.org/abs/2211.10438
- Paper de GPTQ: https://arxiv.org/abs/2210.17323
