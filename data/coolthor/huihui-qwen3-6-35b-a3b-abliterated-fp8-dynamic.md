# coolthor/Huihui-Qwen3.6-35B-A3B-abliterated-FP8-DYNAMIC

## Resumen

Huihui-Qwen3.6-35B-A3B-abliterated-FP8-DYNAMIC es una cuantización en FP8 del checkpoint abliterado de Qwen3.6-35B-A3B, un modelo Mixture-of-Experts (MoE) de 35.951.822.704 parámetros totales con aproximadamente 3.000 millones de parámetros activos por token (la designación "A3B" del nombre lo indica). Lo publica el usuario coolthor en Hugging Face y deriva del trabajo de huihui-ai, que aplicó la técnica de abliteration (ablación de direcciones de rechazo en el espacio de activaciones) sobre el modelo Qwen3.6 original de Alibaba. La cuantización se ha producido específicamente para inferencia en NVIDIA DGX Spark (GB10, SM121) dentro de su presupuesto de 128 GB de memoria unificada.

El interés técnico del artefacto es doble. Por un lado, reduce el checkpoint BF16 de 67 GB a unos 36 GB (factor de compresión de 1,86×) mediante el esquema `FP8_DYNAMIC` de llm-compressor 0.10 y el formato `float-quantized` de compressed-tensors, manteniendo en BF16 las capas críticas para la estabilidad numérica: `lm_head`, la torre visual, el router (`mlp.gate`) y `shared_expert_gate`. Por otro, conserva los pesos MTP (`model_mtp.safetensors`) para decodificación especulativa, lo que según el autor eleva el throughput de 30,71 a 51,72 tok/s en GB10 (1,68×) con `num_speculative_tokens=2`.

Es relevante ahora porque documenta un caso real de incompatibilidad entre el guardado de `Qwen3_5MoeForConditionalGeneration` y el loader de vLLM, con una corrección publicada el 2026-05-03 que repara la entrada de visión (333 tensores de la torre visual que antes se omitían silenciosamente y provocaban bucles del token `!!!!!`). El modelo es multimodal (texto e imagen), está etiquetado como abliterated/uncensored y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (clase `Qwen3_5MoeForConditionalGeneration`), con torre visual y cabezas MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones (designación A3B; no se detalla el reparto exacto en la información disponible) |
| Longitud de contexto | No disponible como especificación del modelo; el autor recomienda `--max-model-len 32768` en el despliegue con vLLM |
| Tipos de cuantizacion | FP8 e4m3fn (esquema `FP8_DYNAMIC`, activaciones dinámicas por token); capas en BF16: `lm_head`, `visual.*`, `mlp.gate`, `shared_expert_gate`; 31.030 módulos Linear cuantizados |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `float-quantized`; incluye `model_mtp.safetensors` |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con enrutamiento por token: cada token activa un subconjunto de expertos, de ahí que un modelo de casi 36.000 millones de parámetros totales opere con aproximadamente 3.000 millones activos. El checkpoint incluye además una torre visual (modalidad image-text-to-text) y pesos MTP (multi-token prediction) destinados a decodificación especulativa. La cuantización se aplicó con llm-compressor 0.10 sobre 31.030 módulos `Linear`, excluyendo explícitamente el router y las puertas de expertos compartidos para no degradar la selección de expertos, y manteniendo la torre visual en BF16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base Qwen3.6 en la documentación proporcionada. El proceso de abliteration lo aplicó huihui-ai sobre el modelo original; esta ficha no documenta su metodología concreta. La innovación técnica destacable del artefacto es la preservación de los pesos MTP para decodificación especulativa (`qwen3_next_mtp`) y la corrección del mapeo de claves de la torre visual: `Qwen3_5MoeForConditionalGeneration` guarda los pesos como `model.language_model.visual.*`, mientras que el loader `qwen3_5.py` de vLLM espera `visual.*`, lo que provocaba la omisión silenciosa de los 333 tensores visuales. El script `remap_visual_path.py` incluido en el repo realiza el remapeo en unos 2 segundos sobre un único shard.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo de razonamiento explícito: el autor recomienda `--reasoning-parser qwen3` en vLLM, lo que indica soporte de trazas de pensamiento separadas de la respuesta.
- Procesamiento de imagen junto a texto (pipeline image-text-to-text), operativo tras la corrección del 2026-05-03.
- Tool calling / function calling: el despliegue recomendado incluye `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Generación de código, dado el parser de tool calls orientado a coder.
- Decodificación especulativa mediante cabezas MTP (`qwen3_next_mtp`).
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- Comportamiento sin censura (variante abliterated): menor probabilidad de rechazo ante peticiones que el modelo base declinaría.

## Casos de uso

- Asistentes conversacionales autoalojados sin filtros de rechazo: la variante abliterated evita las negativas del modelo alineado, útil en entornos de investigación sobre seguridad y en aplicaciones creativas donde el modelo base resulta restrictivo.
- Inferencia en estación de trabajo DGX Spark: con 36 GB en disco y 128 GB de memoria unificada, el modelo completo cabe holgadamente y alcanza 51,72 tok/s en decodificación de un solo stream con decodificación especulativa, suficiente para uso interactivo individual.
- Automatización de agentes con herramientas: la combinación de `--enable-auto-tool-choice` y el parser `qwen3_coder` permite integrar el modelo en bucles de agente que invocan APIs, ejecutan comandos o consultan bases de datos.
- Análisis de documentos con imagen: la torre visual permite procesar capturas, diagramas o páginas escaneadas junto a instrucciones textuales, por ejemplo para extracción de datos estructurados de facturas o informes.
- Generación y revisión de código en pipelines internos: el modelo puede servir como backend de un asistente de código desplegado con vLLM y consumido por extensiones de IDE o bots de revisión.
- Investigación sobre cuantización FP8: el repo documenta la receta completa de llm-compressor, los tres problemas de compatibilidad encontrados y el script de remapeo, lo que lo convierte en material de referencia para quien cuantice arquitecturas MoE similares.
- Fine-tuning y experimentación con modelos MoE de gran tamaño: al reducir el peso en disco a 36 GB, el checkpoint es manejable en nodos únicos para tareas de evaluación o adaptación ligera.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son mediciones de throughput del autor en DGX Spark (GB10, vLLM, decodificación de un solo stream, 200 tokens):

| Configuracion | tok/s | Relativo a BF16 |
|---|---|---|
| BF16 abliterated (modelo base) | 30,71 | 1,00× |
| FP8 + MTP especulativo (este checkpoint) | 51,72 | 1,68× |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/disco: el checkpoint ocupa aproximadamente 36 GB en disco; en GB10 con 128 GB de memoria unificada el autor recomienda `--gpu-memory-utilization 0.90` y `--max-model-len 32768`.
- GPU recomendadas: NVIDIA DGX Spark (GB10, SM121), que es el objetivo declarado. Para Blackwell de datacenter (B200, RTX PRO 6000) el autor remite a la receta oficial del modelo FP8 de Qwen con `tensor-parallel-size > 1`, sustituyendo la ruta del modelo.
- GPU de consumo: no se documenta su funcionamiento en GPU de consumo; el formato compressed-tensors FP8 está pensado para vLLM, no para llama.cpp, por lo que no hay ruta GGUF publicada en este repo.
- Despliegue: vLLM (build `vllm-node-tf5` en GB10) con `--reasoning-parser qwen3`, `--speculative-config '{"method":"qwen3_next_mtp","num_speculative_tokens":2}'`, `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Advertencia del autor: no añadir `--kv-cache-dtype fp8` en GB10, por problemas conocidos de precisión y repetición en SM121.
- Latencia y throughput: 51,72 tok/s en decodificación de un solo stream en GB10 con FP8 y MTP; no se publican datos de prefill ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (FP8-DYNAMIC) | 35,95 B totales / ~3 B activos | No disponible (32.768 recomendado) | compressed-tensors FP8 | Apache 2.0 | Abliterated, multimodal, MTP preservado |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated (BF16) | 35,95 B totales / ~3 B activos | No disponible | safetensors BF16 (67 GB) | Apache 2.0 | Mismo comportamiento, 30,71 tok/s en GB10 |
| Qwen/Qwen3.6-35B-A3B-FP8 | 35,95 B totales / ~3 B activos | No disponible | FP8 | Apache 2.0 | Versión oficial alineada, sin abliteration; receta de referencia para multi-GPU |

No se dispone de datos de benchmarks que permitan comparar la calidad de este checkpoint con alternativas de la misma categoría.

## Limitaciones y advertencias

- La abliteration altera el comportamiento de rechazo del modelo; puede producir contenido que el modelo base filtraría. Requiere revisión y políticas de uso propias antes de cualquier despliegue público.
- Riesgo de alucinación no cuantificado: no hay benchmarks de calidad publicados para esta cuantización ni para su base abliterated.
- Idiomas limitados a inglés y chino según los metadatos; el rendimiento en castellano no está documentado.
- La cuantización FP8 puede introducir degradación adicional respecto al BF16, especialmente en tareas de razonamiento largo; el autor solo reporta throughput, no calidad.
- El soporte de visión estuvo roto en subidas anteriores al 2026-05-03 (bucles del token `!!!!!`); si se clonó el repo antes de esa fecha hay que forzar la descarga del shard 19 y del índice.
- El guardado con `save_pretrained` en GB10 requiere `max_shard_size="2GB"`; con el valor por defecto se produce OOM-kill por solapamiento del búfer de shard y el pool de GPU.
- No añadir `--kv-cache-dtype fp8` en GB10 por problemas de precisión y repetición.
- Aunque la licencia es Apache 2.0, el uso comercial debe evaluar por separado las obligaciones derivadas del modelo base Qwen y el riesgo reputacional de la variante sin censura.
- El artefacto está optimizado para GB10; en otros hardware el rendimiento y la compatibilidad no están garantizados más allá de la receta estándar de compressed-tensors en vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coolthor/Huihui-Qwen3.6-35B-A3B-abliterated-FP8-DYNAMIC
- Modelo base (abliterated, BF16): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Modelo oficial FP8 de Qwen (receta de referencia multi-GPU): https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Script de remapeo de la torre visual: `remap_visual_path.py` en el repositorio del modelo
