# amd/Muse-Spark-Open-816B-A42B-Quark-MXFP4

## Resumen

Muse-Spark-Open-816B-A42B-Quark-MXFP4 es una versión cuantizada del modelo multimodal Muse-Spark-Open-816B-A42B, publicada por AMD mediante su herramienta de optimización AMD-Quark (v0.12). El checkpoint cuantiza los expertos enrutados de la arquitectura MoE a formato OCP MXFP4 (excepto las capas 0 y 61) y mantiene el resto de componentes en bf16, reduciendo el peso del repositorio hasta aproximadamente 1 TB. Está pensado específicamente para su despliegue sobre aceleradores AMD Instinct MI350/MI355 con ROCm, usando SGLang o vLLM como motores de inferencia.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 435.489.473.024 parámetros totales según los safetensors publicados, aunque la nomenclatura del checkpoint sugiere 816B totales y 42B activos por token. Acepta entradas de texto, imagen, vídeo y audio, y genera texto, lo que lo sitúa en la categoría de modelos omni-modales de gran escala. La arquitectura declarada es MuseSparkForConditionalGeneration.

Su relevancia actual radica en que demuestra un flujo completo de cuantización de precisión ultra-baja (MXFP4) sobre un modelo de cientos de miles de millones de parámetros, con recetas de despliegue reproducibles para hardware AMD. Esto interesa a equipos que necesitan servir modelos frontera en clústeres ROCm sin renunciar al formato de pesos de 4 bits por bloque, y a investigadores que evalúan el impacto de MXFP4 en modelos MoE multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseSparkForConditionalGeneration (transformer MoE multimodal) |
| Parametros totales | 435.489.473.024 (safetensors); nomenclatura del checkpoint: 816B |
| Parametros activos | 42B (según nomenclatura A42B del checkpoint) |
| Longitud de contexto | no disponible (receta vLLM limita el servicio a 32.768 tokens) |
| Tipos de cuantizacion | MXFP4 estático en pesos de expertos MoE, MXFP4 dinámico en activaciones MoE; resto en bf16 |
| Idiomas soportados | no disponible |
| Licencia | muse-model-license (license: other) |
| Formato de pesos | safetensors (formato Quark) |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer con mezcla de expertos (MoE) y capacidades multimodales de entrada (texto, imagen, vídeo y audio) con salida exclusivamente textual. La cuantización de AMD-Quark actúa únicamente sobre los expertos enrutados: las proyecciones `gate_up_proj` y `down_proj` de los expertos se dividen mediante `SplitFusedExperts` y se cuantizan a MXFP4, mientras que se excluyen explícitamente `lm_head`, todas las capas de self-attention (`*self_attn*`), las puertas MoE (`*mlp.gate`), las proyecciones `pre_expert_proj` y `post_expert_proj`, los módulos de visión y audio, y las capas 0 y 61 del modelo de lenguaje. El resto de pesos permanece en bf16.

La cuantización es estática para pesos y dinámica para activaciones, ambas en OCP MXFP4. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla si la arquitectura incorpora innovaciones como atención lineal o decodificación especulativa nativa; sin embargo, la receta de SGLang para este checkpoint utiliza decodificación especulativa DFlash V2 con un modelo borrador externo (`RadixArk/Muse-Spark-Open-DFlash2`) y 8 tokens de borrador.

## Capacidades

- Generación de texto a partir de entradas multimodales: texto, imagen, vídeo y audio.
- Razonamiento con modo de esfuerzo configurable (`reasoning_effort` en la API, con valores como `high`).
- Soporte de tool calling y function calling: las recetas incluyen `--tool-call-parser muse` y `--enable-auto-tool-choice`.
- Parser de razonamiento dedicado (`--reasoning-parser muse`) para separar trazas de pensamiento de la respuesta final.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Comprensión de vídeo y audio como entradas, según la especificación de la arquitectura.
- Integración con servidores compatibles con la API de OpenAI (SGLang y vLLM).

## Casos de uso

- Asistentes multimodales de atención al cliente: el modelo puede procesar capturas de pantalla, imágenes de productos o notas de voz junto con texto en conversaciones multi-turno, y el tool calling permite conectarlo a sistemas de ticketing o bases de conocimiento.
- Análisis de vídeo y audio en pipelines de moderación de contenido: la entrada nativa de vídeo y audio permite clasificar y resumir material audiovisual sin etapas separadas de transcripción o extracción de fotogramas.
- Generación de código asistida en producción: con tool calling y parser de razonamiento, puede integrarse en agentes que consultan repositorios, ejecutan tests y proponen parches dentro de flujos de CI/CD.
- Agentes de razonamiento multi-paso: el modo `reasoning_effort: high` y el parser de razonamiento permiten construir agentes que planifican, ejecutan herramientas y justifican decisiones en dominios como análisis financiero o soporte técnico.
- Procesamiento documental multimodal: extracción y razonamiento sobre documentos escaneados, gráficos e imágenes combinados con texto largo, aprovechando la ventana de servicio de 32.768 tokens configurada en vLLM.
- Investigación en cuantización de baja precisión: el checkpoint sirve como referencia reproducible para estudiar el impacto de MXFP4 en modelos MoE multimodales de gran escala sobre hardware AMD.
- Despliegue en clústeres ROCm: equipos con Instinct MI350/MI355 pueden servir el modelo con SGLang (TP4+EP4) o vLLM (TP8) usando las recetas oficiales publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo declarado: AMD Instinct MI350/MI355 con ROCm sobre Linux. No se menciona soporte para GPU NVIDIA ni consumer.
- Tamaño del repositorio: 1.014 GB, lo que condiciona el almacenamiento y la memoria agregada necesaria.
- Receta SGLang: TP4 + EP4 (4 GPUs), atención AITER, backend MoE FlyDSL, `--mem-fraction-static 0.85`, decodificación especulativa DFlash V2 con 8 tokens de borrador.
- Receta vLLM: TP8 (8 GPUs), kernels AITER, chunked prefill, `--max-model-len 32768`, `--max-num-seqs 128`, `--max-num-batched-tokens 8192`, `--gpu-memory-utilization 0.90`.
- VRAM estimada por GPU: no disponible de forma explícita; el tamaño del repo y las configuraciones TP4/TP8 implican varios cientos de GB agregados.
- No cabe en GPU de consumo (RTX 4090 u similares) según los requisitos de hardware publicados.
- Opciones de despliegue: SGLang (`lmsysorg/sglang-rocm:muse-spark-open`) y vLLM (`vllm/vllm-openai-rocm:muse-spark-open`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| Muse-Spark-Open-816B-A42B-Quark-MXFP4 (este) | 435,5B (safetensors); 816B/42B activos por nomenclatura | no disponible (servicio a 32.768) | MXFP4 en expertos MoE, resto bf16 | muse-model-license | AMD MI350/MI355 |
| Muse-Spark-Open-816B-A42B (base) | 816B/42B activos | no disponible | bf16 | muse-model-license | no disponible |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización MXFP4 solo cubre los expertos enrutados (excepto capas 0 y 61); el resto permanece en bf16, por lo que el ahorro de memoria es parcial y el repositorio sigue superando 1 TB.
- El checkpoint está diseñado y validado exclusivamente para AMD Instinct MI350/MI355 con ROCm; no hay garantías de funcionamiento en otras plataformas.
- La licencia `muse-model-license` es de tipo "other": es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial.
- No se especifican idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas.
- No hay datos publicados de benchmarks, sesgos, tasas de alucinación ni evaluaciones de seguridad.
- La receta vLLM limita el servicio a 32.768 tokens y usa `--language-model-only`, por lo que en esa configuración no se sirve la ruta multimodal.
- La decodificación especulativa en SGLang depende de un modelo borrador externo (`RadixArk/Muse-Spark-Open-DFlash2`), lo que añade una dependencia adicional en producción.
- No se detallan requisitos de VRAM por GPU ni cifras de latencia o throughput, lo que dificulta el dimensionamiento previo.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Muse-Spark-Open-816B-A42B-Quark-MXFP4
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Modelo borrador DFlash2: https://huggingface.co/RadixArk/Muse-Spark-Open-DFlash2
- Documentación AMD-Quark: https://quark.docs.amd.com/latest/index.html
- SGLang cookbook (Muse-Spark-Open): https://lmsysorg.mintlify.app/cookbook/autoregressive/Meta/MuseSparkOpen#hw=mi355x&strategy=low-latency&quant=mxfp4
- Receta vLLM: https://recipes.vllm.ai/meta-models/Muse-Spark-Open-816B-A42B?hardware=mi355x&variant=mxfp4
- Blog SGLang sobre soporte AMD: https://www.lmsys.org/blog/2026-10-15-meta-muse-spark-open#amd-support
