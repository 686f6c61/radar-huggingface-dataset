# glossia/Rambley-V3-50M

## Resumen

Rambley-V3-50M es un modelo de lenguaje de pequeno tamano (49.718.600 parametros) desarrollado por el usuario glossia y publicado en Hugging Face bajo licencia CC-BY-SA-4.0. Se trata de un modelo base preentrenado desde cero sobre una mezcla de aproximadamente 36.000 millones de tokens de datos web filtrados, matematicas y datos de elicitacion de aprendizaje en contexto (in-context learning). El autor indica que, segun su conocimiento, no se incluyo datos sinteticos generados por LLM en el corpus final, salvo posible contaminacion de las fuentes originales.

El modelo emplea una arquitectura transformer con innovaciones tecnicas poco habituales en esta escala: Virtual Head Attention, atencion con compuertas por cabeza (headwise gated attention), attention sinks aprendidos, patron de atencion SWA:SWA:GQA, embeddings posicionales HoPE, hiperconexiones de identidad y preentrenamiento a nivel de parche durante el 60% del presupuesto de tokens. Su longitud de contexto nativa es de 2048 tokens.

Es relevante como objeto de estudio de tecnicas de entrenamiento eficiente y arquitecturas experimentales a escala reducida, no como modelo de produccion. El propio autor expresa insatisfaccion con los resultados y los benchmarks publicados son propios de un modelo base de 50M sin ajuste fino, con rendimiento cercano al azar en varias tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Virtual Head Attention, headwise gated attention, attention sinks aprendidos, patron SWA:SWA:GQA, HoPE, Identity Hyperconnections y preentrenamiento patch-level |
| Parametros totales | 49.718.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens nativos |
| Tipos de cuantizacion | no disponible (pesos en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de ~50M de parametros entrenado nativamente en BF16 (el autor descarta FP8 por la ralentizacion que introduce). Incorpora SwiGLU en las MLP, Virtual Head Attention con 32 cabezas de consulta falsas y 8 fisicas (Ding et al., 2026), atencion con compuertas por cabeza en lugar de por elemento para ahorrar parametros (Qiu et al., 2025), y attention sinks aprendidos en cada cabeza de atencion (OpenAI, 2026; LLM-Core Xiaomi, 2026). El patron de atencion es SWA:SWA:GQA con ventana deslizante de 128 tokens, forzando la ultima capa a GQA. Usa embeddings posicionales HoPE tanto en capas SWA como GQA (Chen et al., 2024) e Identity Hyperconnections.

El entrenamiento cubre aproximadamente 36.000 millones de tokens procedentes de dclm-edu, common-pile/libretexts_filtered, common-pile/youtube_filtered, OpenBMB/UltraData-Math, ClimbMix (solo clusters 2, 6, 12 y 15, excluyendo el de matematicas y la mayoria de STEM), IFM/TxT360-v2 y glossia/picl-text. Durante el 60% del presupuesto de tokens se aplico preentrenamiento a nivel de parche (Shao et al., 2025; Peng et al., 2026). Se usaron dos optimizadores: Muon con LR 0.02 para matrices con restricciones de norma Hyperball (Wen et al., 2026) y AdamW con LR 0.002 para embeddings, vectores y normas sin weight decay ni Hyperball, con el scheduler AIR LR (Yu et al., 2026). No se documenta RLHF ni DPO; es un modelo base.

## Capacidades

- Generacion de texto autoregresiva basica como modelo base sin ajuste fino.
- Razonamiento limitado: los benchmarks muestran rendimiento cercano al azar en tareas de sentido comun y comprension lectora.
- Capacidad matematica muy restringida: el cluster de matematicas de ClimbMix fue excluido del entrenamiento.
- Aprendizaje en contexto: parte del corpus incluye datos de elicitacion de ICL (picl-text), aunque no se documentan evaluaciones especificas de esta capacidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion de arquitecturas experimentales: el modelo sirve como banco de pruebas reproducible para estudiar Virtual Head Attention, attention sinks, HoPE y preentrenamiento patch-level a escala de 50M, donde el coste de entrenamiento es bajo.
- Experimentos de preentrenamiento a pequena escala: util para validar mezclas de datos, schedulers (AIR) y optimizadores (Muon con Hyperball) antes de escalar a modelos mayores.
- Generacion de texto de continuacion simple en dominios acotados: dado su entrenamiento en dclm-edu y libretexts, puede producir continuaciones plausibles de texto educativo en ingles, siempre con supervision humana.
- Estudio de degradacion de contexto largo: los resultados de babilong muestran caida drastica del rendimiento al aumentar la longitud, lo que lo hace util para analizar el comportamiento de SWA y attention sinks en contextos largos.
- Docencia y divulgacion: ejemplo didactico de como se construye y evalua un modelo base desde cero, con codigo de preentrenamiento publico.
- Baseline para comparativas academicas: referencia de 50M parametros con arquitectura no convencional frente a transformers clasicos de igual tamano.

## Benchmarks y rendimiento

Resultados publicados por el autor (zero-shot, sin filtro):

| Tarea | Metrica | Valor | Stderr |
|---|---|---|---|
| arc_challenge | acc | 0.2116 | ±0.0119 |
| arc_challenge | acc_norm | 0.2423 | ±0.0125 |
| arc_easy | acc | 0.4949 | ±0.0103 |
| arc_easy | acc_norm | 0.4436 | ±0.0102 |
| hellaswag | acc | 0.3021 | ±0.0046 |
| hellaswag | acc_norm | 0.3359 | ±0.0047 |
| piqa | acc | 0.6496 | ±0.0111 |
| piqa | acc_norm | 0.6366 | ±0.0112 |

Resultados de contexto largo (babilong, 2-shot):

| Longitud | babilong_longctx acc | Stderr |
|---|---|---|
| 0k | 0.4864 | ±0.0061 |
| 2k | 0.1235 | ±0.0046 |
| 8k | 0.0258 | ±0.0022 |

Resultado adicional del autor: precision en continuacion cruda 36.50%, precision normalizada por longitud 36.40%.

No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (49.7M parametros, ~0.1 GB de pesos); en FP32 seria aproximadamente 0.2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o incluso CPU; el modelo no requiere aceleradores de datacenter.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: al usar `custom_code`, requiere `trust_remote_code=True` en Transformers; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada y probablemente requiera portar la arquitectura personalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Rambley-V3-50M | 49.7M | 2048 | CC-BY-SA-4.0 | Arquitectura experimental, benchmarks base muy bajos |
| Modelos base de ~50M tipo GPT-2 small / Pythia-70M | 70M-124M | 1024-2048 | Varía (MIT, Apache-2.0) | Arquitecturas convencionales, ampliamente soportados por tooling |
| SmolLM-135M | 135M | 2048 | Apache-2.0 | Mayor escala, soporte de ecosistema amplio |

No se dispone de comparaciones directas publicadas entre Rambley-V3-50M y estos modelos en la informacion proporcionada; la tabla es orientativa por categoria y escala.

## Limitaciones y advertencias

- Rendimiento muy bajo en tareas estandar: en hellaswag y arc_challenge los valores estan proximos al azar, lo que refleja un modelo base de 50M sin ajuste fino.
- Degradacion severa en contexto largo: babilong cae de 0.4864 a 0k hasta 0.0258 a 8k, muy por debajo de la ventana nativa de 2048 tokens en la practica.
- Es un modelo base: no esta ajustado para instrucciones, dialogo ni seguridad; no debe usarse directamente en produccion orientada a usuarios.
- Riesgo elevado de alucinacion y de generar texto incoherente o repetitivo.
- Sesgos: no documentados, pero al entrenarse sobre web filtrada y libretexts en ingles es probable que herede sesgos de esas fuentes.
- Idiomas: no se documenta soporte multilingue; se asume predominio del ingles por las fuentes de datos.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion y compartir-al-igual, lo que obliga a licenciar obras derivadas bajo la misma licencia; revisar implicaciones para productos propietarios.
- Requiere `trust_remote_code=True` por el codigo personalizado, lo que implica ejecutar codigo del autor; auditar antes de usar en entornos sensibles.
- El autor declara explicitamente no estar satisfecho con los resultados, lo que debe considerarse al evaluar su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glossia/Rambley-V3-50M
- Codigo de preentrenamiento: https://code.allura.moe/fizz/lobotomy
- Mezcla de datos de entrenamiento: https://code.allura.moe/fizz/lobotomy/src/commit/6353a73f483823eee6db1750e6a3b2fdb57e53f0/libs/data/lobotomy/data/mixes/rambley_16k/pretrain_v2.txt
- Discord del autor: https://discord.gg/6acXmq3yx2
- Virtual Head Attention (Ding et al., 2026): https://arxiv.org/abs/2610.17959v1
- Headwise gated attention (Qiu et al., 2025): https://arxiv.org/abs/2505.06708v1
- Attention sinks (OpenAI, 2026): https://arxiv.org/abs/2508.10925
- Attention sinks (LLM-Core Xiaomi, 2026): https://arxiv.org/abs/2601.02780
- Sliding window attention (Qiao et al., 2026): https://arxiv.org/abs/2606.15378
- HoPE (Chen et al., 2024): http://arxiv.org/abs/2410.21216v2
- Identity Hyperconnections (2026): https://zhuanlan.zhihu.com/p/2010852389670908320
- Patch-level pretraining (Shao et al., 2025): https://arxiv.org/abs/2407.12665v3
- Patch-level pretraining (Peng et al., 2026): https://arxiv.org/abs/2605.06546
- Muon con Hyperball (Wen et al., 2026): https://arxiv.org/abs/2606.16899v1
- AIR LR scheduler (Yu et al., 2026): https://arxiv.org/abs/2610.40362
