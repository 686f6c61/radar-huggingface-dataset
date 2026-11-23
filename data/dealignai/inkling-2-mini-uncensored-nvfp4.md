# dealignai/Inkling-2-Mini-UNCENSORED-NVFP4

## Resumen

Inkling-2-Mini-UNCENSORED-NVFP4 es una versión modificada y cuantizada del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario dealignai. El cambio principal respecto al modelo base es la eliminación del comportamiento de rechazo (refusal) mediante técnicas de abliteration, manteniendo intactas las capacidades de visión, razonamiento multinivel, uso de herramientas y contexto largo. La cuantización es mixta y nativa: NVFP4 en las capas 0-19 y MXFP8 en las capas 20-23, con atención, embeddings, normas, lm_head, torre de visión y módulo MTP en bfloat16, lo que da un bundle total de aproximadamente 20,1 GB.

El modelo base emplea una arquitectura MoE con bucles (looped MoE), aplicando tres pasadas sobre las capas 6-17, e incorpora un drafter MTP nativo pensado para decodificación especulativa DSpark. Cuenta con 30.465.509.928 parámetros totales según los safetensors del repositorio. Su pipeline es image-text-to-text y está orientado a tareas de razonamiento, uso de herramientas y comprensión multimodal.

La relevancia de esta ficha radica en dos aspectos: por un lado, la arquitectura looped MoE del modelo base, que aún no tiene runtime fusionado en sglang ni vLLM y actualmente solo se sirve vía MLX en Apple Silicon; por otro, la modificación de alineamiento, que convierte al modelo en un caso de estudio sobre los compromisos entre seguridad y capacidades. La licencia es propia (dealignai-community-v0.3), no estándar, y el modelo solo declara soporte para inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucles (inkling2_loop), 3 pasadas sobre capas 6-17, multimodal con torre ViT de 23 capas |
| Parametros totales | 30.465.509.928 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo 16) en capas 0-19; MXFP8 (E4M3 con escalas ue8m0 cada 32) en capas 20-23; bf16 en atención, embeddings, normas, lm_head, vision_tower y mtp |
| Idiomas soportados | en |
| Licencia | dealignai-community-v0.3 (other) |
| Formato de pesos | safetensors (compressed-tensors, ModelOpt), shard único de ~20,1 GB |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer de mezcla de expertos (MoE) con una innovación estructural denominada looped MoE: las capas 6 a 17 se ejecutan tres veces en bucle, reutilizando parámetros y aumentando la profundidad efectiva sin incrementar el recuento total. La torre de visión consta de 23 capas ViT más un proyector de 2 capas, y el módulo MTP (multi-token prediction) añade 3 capas con block=8 y una cabeza Markov `rnn_hidden`, diseñado para la decodificación especulativa DSpark. Los enrutadores, proyecciones sink, compuertas de mensaje, escalas de clip, queries de atención residual y taps de convolución corta se conservan en su precisión original fp32/bf16.

La cuantización es nativa del proveedor y no ha sido recalculada por dealignai: los expertos MLP (`w2`/`w13`) de las capas 0-19 usan NVFP4 con ModelOpt W4A4, grupo de 16 y `global_scale` por experto; los de las capas 20-23 usan MXFP8. El chat template, tokenizer, tokens especiales, `hf_quant_config.json` y `config.json` son byte-idénticos al modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La modificación de dealignai se limita a alterar el comportamiento de cumplimiento ante instrucciones; el resto de capacidades se declara preservado.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables: `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`, o cualquier flotante en `[0, 0.99]`.
- Modo de pensamiento nativo: el modelo emite bloques `<|content_thinking|>` antes de la respuesta final en `<|content_text|>`.
- Comprensión multimodal de imágenes mediante la torre ViT de 23 capas y el proyector de 2 capas, a través de `Inkling2LoopForConditionalGeneration`.
- Uso de herramientas y function calling, con formato de invocación `NAME<|content_invoke_tool_json|>`.
- Razonamiento multi-paso y agentes, apoyado por el modo de pensamiento y los niveles de esfuerzo.
- Decodificación especulativa mediante el drafter MTP nativo (DSpark), reservado para el futuro port del runtime Inkling-2.
- Capacidades multilingües limitadas al inglés según la model card.
- Comportamiento sin rechazo (uncensored/abliterated) en tareas de instrucción.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar empíricamente el efecto de la abliteration sobre el comportamiento de rechazo, con métricas reproducibles en HarmBench-320 y comparación directa contra el base.
- Evaluación de cuantización mixta NVFP4/MXFP8: sirve para medir la degradación de precisión de una estrategia W4A4 en capas bajas frente a MXFP8 en capas altas, usando MMLU-500 como referencia.
- Despliegue en Apple Silicon: con MLX 0.32.4 y `jang_tools.inkling2.load.load_inkling2(native_experts=True)` se obtienen unos 24 tok/s en un Mac Studio M5 Ultra con 256 GiB, lo que lo hace viable para prototipado local en hardware de Apple.
- Generación de texto con control de esfuerzo de razonamiento: en tareas que no requieren cadena de pensamiento se puede fijar `effort=none` para reducir latencia, y subir a `max` en problemas de matemáticas o lógica formal.
- Procesamiento de documentos con imágenes: al conservar la torre de visión, puede emplearse en pipelines image-text-to-text como extracción de información de capturas, gráficos o formularios.
- Estudio de arquitecturas looped MoE: el modelo permite analizar el comportamiento de tres pasadas sobre las capas 6-17 en tareas de razonamiento, comparando los resultados por asignatura de MMLU.
- Integración en flujos con tool calling: el formato `<|content_invoke_tool_json|>` permite conectar el modelo a APIs externas en prototipos de agentes, siempre que se use el runtime MLX disponible.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre este bundle exacto, servido en Apple Silicon MLX 0.32.4 con decodificación greedy y `repetition_penalty=1.0`.

| Benchmark | Base | Este release | Delta |
|---|---:|---:|---:|
| MMLU-500 @ effort=none (logit) | 79,20% | 77,00% | −2,20 pp |
| MMLU-500 @ effort=max (generación) | ~80% | 80,40% | ≈ base |

| Categoría HarmBench-320 | n | Este release @ effort=max |
|---|---:|---:|
| chemical_biological | 42 | 100,0% |
| cybercrime_intrusion | 52 | 100,0% |
| harassment_bullying | 21 | 100,0% |
| harmful | 18 | 100,0% |
| misinformation_disinformation | 54 | 100,0% |
| copyright | 80 | 98,8% |
| illegal | 53 | 98,1% |
| Total | 320 | 99,4% |

En effort=none el bundle alcanza un 98,1% de cumplimiento estricto en HarmBench-320. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMMU) en la información disponible.

## Requisitos de hardware

- El bundle completo ocupa aproximadamente 20,1 GB en safetensors, por lo que la VRAM mínima para cargarlo en memoria es de unos 20 GB más el overhead del runtime.
- El autor indica que el modelo es viable en una única NVIDIA DGX Spark según la guía del proveedor upstream, aunque el runtime fusionado para CUDA no está disponible.
- En Apple Silicon, el autor reporta unos 24 tok/s en decodificación greedy sobre un Mac Studio M5 Ultra con 256 GiB de memoria unificada.
- El único path de ejecución documentado es MLX en Apple Silicon mediante `jang_tools.inkling2`; la arquitectura looped MoE no tiene runtime fusionado en sglang ni vLLM.
- No se dispone de estimaciones de VRAM para cuantizaciones alternativas ni de datos de throughput en GPU NVIDIA.
- Opciones de despliegue como llama.cpp, Ollama o TGI no están soportadas según la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-UNCENSORED-NVFP4 (este) | 30,47 B totales | no disponible | NVFP4 + MXFP8 mixta | dealignai-community-v0.3 | safetensors, solo MLX |
| thinkingmachines/Inkling-2-Mini (base) | 30,47 B totales | no disponible | nativa del proveedor | no disponible | safetensors, mismo runtime |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- La modificación de alineamiento elimina el comportamiento de rechazo: el modelo cumple instrucciones dañinas en el 99,4% de HarmBench-320, lo que lo hace inadecuado para despliegues orientados al público sin filtros externos.
- Riesgo elevado de generar contenido dañino, ilegal o sujeto a copyright; el propio autor reporta un 98,8% de cumplimiento en la categoría copyright.
- Riesgo de alucinación no cuantificado en la información disponible; no hay benchmarks de factualidad publicados.
- El modelo solo declara soporte para inglés, lo que limita su uso en castellano u otros idiomas.
- La licencia dealignai-community-v0.3 es propia y no estándar; deben revisarse sus términos antes de cualquier uso comercial, ya que no se detallan en la información disponible.
- El runtime es exclusivamente MLX en Apple Silicon; no hay soporte en vLLM, sglang, llama.cpp ni TGI, lo que bloquea el despliegue en infraestructura GPU convencional.
- El drafter MTP está reservado para un futuro port del runtime y no es utilizable en la práctica con las herramientas actuales.
- dealignai no está afiliado a Thinking Machines Lab; se trata de una modificación de terceros sin respaldo del proveedor original.
- La decodificación especulativa DSpark solo está cableada en `Inkling2DSpark.swift` de vmlx-swift, lo que añade dependencia de un ecosistema concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dealignai/Inkling-2-Mini-UNCENSORED-NVFP4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Perfil del autor en X: https://x.com/dealignai
