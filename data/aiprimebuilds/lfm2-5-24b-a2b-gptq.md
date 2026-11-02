# aiprimebuilds/LFM2.5-24B-A2B-GPTQ

## Resumen

LFM2.5-24B-A2B-GPTQ es una cuantización de 4 bits del modelo LiquidAI/LFM2.5-24B-A2B, un transformer híbrido de tipo Mixture-of-Experts (MoE) desarrollado originalmente por Liquid AI. El artefacto lo publica el usuario aiprimebuilds y su función es ofrecer una versión comprimida del modelo base para servir en una sola GPU, reduciendo el peso en disco a unos 13,4 GiB y manteniendo la arquitectura nativa `lfm2_moe` que vLLM carga sin necesidad de `--trust-remote-code`.

El modelo base combina 40 capas totales, de las cuales 30 son convoluciones cortas y 10 son capas de atención completa con Grouped Query Attention (GQA). Esta pila híbrida 3:1 implica que solo 10 capas asignan caché KV, lo que reduce drásticamente el coste de memoria por token. El MoE cuenta con 64 expertos y enruta 4 por token, con un tamaño de 23.971.585.280 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 24B parámetros con una ventana de contexto nativa de 131.072 tokens en GPUs de consumo de 16-24 GB, gracias a la cuantización GPTQ W4A16 con group_size=32. Está orientado a generación de texto conversacional y razonamiento, con licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm2MoeForCausalLM` (`model_type: lfm2_moe`), híbrida de convolución corta + atención GQA con MoE |
| Parametros totales | 23.971.585.280 (23,97B) |
| Parametros activos | ~2B por token |
| Longitud de contexto | 131.072 tokens (nativa) |
| Tipos de cuantizacion | GPTQ 4-bit int4 (W4A16), `group_size=32`, `desc_act: false`, `act_group_aware: true`, `sym: true`; calibrado con `allenai/c4` (inglés, 1.024 muestras) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, `license: other`) |
| Formato de pesos | safetensors (transformers), 13,4 GiB en disco / 14,4 GB de repositorio |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido con 40 capas: 30 capas de convolución corta intercaladas con 10 capas de atención completa GQA, más 2 capas densas en la base de la pila (`num_dense_layers: 2`). Las capas de convolución corta son estáticas respecto a la longitud de secuencia, por lo que solo las 10 capas de atención asignan caché KV. El MoE tiene 64 expertos totales con 4 expertos enrutados por token, `hidden_size: 2048` y `moe_intermediate_size: 1536`. La geometría de atención usa 32 cabezas de consulta y 8 cabezas clave-valor con `head_dim: 64`, `max_position_embeddings: 131072` y `vocab_size: 128000` con `tie_word_embeddings: true`.

La cuantización se realizó con GPTQModel 7.6.0 (`LFM2MoeQModel`) y `W1W3W2MoELifecycleHooks`, escribiendo los 64 expertos de cada capa MoE como Linears cuantizados `w1/w3/w2` por experto, que es el layout que espera el cargador nativo `lfm2_moe` de vLLM. Se cuantizan a 4 bits los expertos MoE (38 capas × 64 expertos = 2.432 módulos de cada tipo), el FFN denso de las capas 0-1, las proyecciones `in_proj`/`out_proj` de las 30 convoluciones cortas y las proyecciones `q/k/v` de las 10 capas de atención. Se mantienen en bf16 los routers `gate` (38), la `out_proj` de atención (10), los kernels `conv.conv` (30), todas las normas y `embed_tokens`; el `lm_head` está atado y no se cuantiza. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con etiqueta `conversational` en el modelo base.
- Razonamiento de tipo instruct y tool-use, con parámetros de generación recomendados de `temperature=0.1`, `top_k=50` y `repetition_penalty=1.05`.
- Soporte de contexto largo de hasta 131.072 tokens nativos, útil para documentos extensos y conversaciones prolongadas.
- Capacidad multilingüe limitada al inglés según la model card (`language: en`).
- Compatibilidad con vLLM para despliegue en producción, incluyendo prefix caching.
- No se documenta soporte explícito de visión, audio, tool calling estructurado ni modo de pensamiento en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto largo gracias a sus 131.072 tokens de ventana, y su caché KV reducida (solo 10 capas de atención) permite atender más sesiones concurrentes por GPU.
- Generación de código en pipelines de integración: se puede desplegar con vLLM detrás de una API compatible con OpenAI y usarlo para autocompletado o revisión de código en inglés, aunque no se documenta tool calling nativo.
- Procesamiento de documentos largos: con 131.072 tokens de contexto y un consumo de caché KV de solo 20 KiB por token en bf16, es viable resumir o extraer información de contratos, informes o expedientes completos en una sola pasada.
- Asistente de razonamiento en local: al caber en GPUs de 16-24 GB (RTX 4080 SUPER, 3090, 4090, RTX 4000 Ada), sirve para prototipado y evaluación de razonamiento sin depender de la nube.
- Servicio de inferencia de alta concurrencia: los ~2B parámetros activos por token y la cuantización int4 permiten maximizar throughput por GPU en despliegues vLLM con `--enable-prefix-caching`.
- Chatbot conversacional en inglés para productos internos: la licencia LFM Open License v1.0 incluye disposiciones sobre umbral comercial que deben revisarse antes de un uso empresarial.
- Evaluación comparativa de cuantizaciones: útil como artefacto de referencia para medir la pérdida de calidad de GPTQ 4-bit frente a bf16 o FP8 en arquitecturas MoE híbridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~14,7 GiB con 8.192 tokens de contexto; ~15,2 GiB con 32.768; ~15,8 GiB con 65.536; ~17,1 GiB con 131.072 tokens (cálculo a partir de `config.json`, no medido).
- Peso de los pesos cuantizados: 13,4 GiB en disco.
- Caché KV: 20 KiB por token en bf16 (~0,02 MiB/token), aproximadamente un 75% menor que un modelo denso de 40 capas; se puede reducir a la mitad con `--kv-cache-dtype fp8`.
- GPU recomendadas: RTX 4080 SUPER (16 GB) para contextos de hasta 16.384 tokens; RTX 3090, RTX 4090 o RTX 4000 Ada (20-24 GB) para el contexto completo de 131.072 tokens.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más, con margen para contextos cortos y medio para el contexto máximo.
- Opciones de despliegue: vLLM con `--quantization gptq` (soporte nativo de `lfm2_moe`, sin `--trust-remote-code`) e inferencia offline con `vllm.LLM` en Python. No se documenta soporte de llama.cpp, Ollama ni TGI para este artefacto GPTQ.
- Latencia y throughput: no disponibles; la model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B-GPTQ (este) | 23,97B | ~2B | 131.072 | GPTQ 4-bit | LFM Open License v1.0 | HuggingFace, vLLM |
| LiquidAI/LFM2.5-24B-A2B (base) | 23,97B | ~2B | 131.072 | bf16 / FP8 | LFM Open License v1.0 | HuggingFace |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La cuantización int4 es inherentemente con pérdida frente a bf16 o FP8; debe evaluarse la degradación en tareas sensibles antes de usarla en producción.
- El modelo solo declara soporte de inglés, lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de fidelidad ni de sesgos.
- Dependencia de vLLM y GPTQModel para cargar el artefacto; otros runtimes pueden no soportar el layout per-expert de `lfm2_moe`.
- La licencia LFM Open License v1.0 incluye disposiciones sobre umbral comercial que deben revisarse en el fichero `LICENSE` antes de un uso empresarial.
- El artefacto lo publica un tercero (aiprimebuilds), no Liquid AI; conviene validar la integridad de los pesos frente al modelo base.
- Los valores de VRAM de la model card son calculados, no medidos, por lo que pueden desviarse en despliegues reales.
- No se documentan capacidades de visión, audio ni tool calling estructurado.

## Enlaces

- HuggingFace del artefacto: https://huggingface.co/aiprimebuilds/LFM2.5-24B-A2B-GPTQ
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia: LICENSE (incluido en el repositorio del artefacto)
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información proporcionada.
