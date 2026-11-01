# AleaiactaEst1/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una modificacion del checkpoint `deepseek-ai/DeepSeek-V4.1-Flash` publicada por el usuario AleaiactaEst1 (vinculado a la cuenta @dealignai) en HuggingFace. El modelo base es un transformer causal encoder-decoder de tipo Mixture-of-Experts con 763.205.315.794 parametros totales segun los safetensors del repo, y esta adaptado para tareas `image-text-to-text`, es decir, entrada multimodal con salida de texto. La modificacion consiste en una "abliteration" a nivel de pesos que elimina los mecanismos de rechazo del modelo base, manteniendo supuestamente intactas las capacidades de razonamiento, vision y tool calling.

El interes tecnico del checkpoint reside en dos aspectos: por un lado, cuantiza los pesos en FP8 (`e4m3fn`) con escalas de bloque E8M0 y expertos enrutados en FP4, lo que reduce el tamano del repo a 510,3 GB frente a los cientos de gigabytes que ocuparia en BF16; por otro, documenta de forma explicita el impacto de la abliteracion sobre benchmarks de seguridad (HarmBench-320) y de conocimiento (MMLU-14k), lo que permite evaluar el coste de eliminar los guardrails. La licencia declarada es MIT, aunque conviene revisar las condiciones del modelo base.

La relevancia de esta ficha es doble: sirve como referencia de las capacidades del modelo base DeepSeek-V4.1-Flash (contexto de 1M de tokens, vision, atencion dispersa CSA2, memoria Engram, decodificacion especulativa DSpark) y como caso de estudio de los riesgos de los checkpoints "uncensored" en produccion. No se dispone de informacion sobre idiomas soportados ni de datos oficiales de benchmarks del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder, MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections de 4 canales residuales, atencion dispersa CSA2, memoria n-gram Engram, borrador especulativo DSpark |
| Parametros totales | 763.205.315.794 (763,2 B) |
| Parametros activos | 8 B / 16 B activos por token segun model card (dato no verificado de forma independiente) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 `e4m3fn` con escalas de bloque E8M0 [32, 32]; expertos enrutados en FP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en el repo) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal encoder-decoder con 20+20 capas segun la model card, organizado como Mixture-of-Experts con 384 expertos enrutados y seleccion top-6 mas un experto compartido. Incorpora Hyper-Connections con residual de 4 canales, atencion dispersa CSA2, una memoria n-gram denominada Engram y un cabezal de borrador especulativo DSpark (MTP). La torre de vision es DeepSeek-ViT con RoPE 2D y pixel unshuffle. El checkpoint modificado conserva estos componentes byte a byte, segun el autor, y solo altera las direcciones de rechazo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo base en la informacion proporcionada. La modificacion de AleaiactaEst1 no reentrena el modelo: aplica una abliteracion a nivel de pesos que, segun la model card, no requiere `model.py` personalizado, hooks en tiempo de ejecucion ni vectores de direccion, de modo que el checkpoint se carga igual que el base. La cuantizacion FP8/FP4 es nativa y no ha sido alterada por la modificacion.

## Capacidades

- Generacion de texto y razonamiento multi-turno con contexto de hasta 1M de tokens.
- Entrada multimodal imagen-texto mediante la torre DeepSeek-ViT (pipeline `image-text-to-text`).
- Razonamiento extendido con modo "effort=max" (traza de razonamiento verificable), segun la model card.
- Tool calling y function calling, segun los tags y la model card.
- Decodificacion especulativa DSpark para acelerar la generacion.
- Memoria n-gram Engram para recuperacion de patrones en contexto largo.
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Modo sin guardrails: el checkpoint responde a todas las peticiones de HarmBench-320 sin rechazo, redireccion ni hedging.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el checkpoint permite estudiar el comportamiento de un modelo sin guardrails frente a prompts daninos en un entorno controlado, comparando sus respuestas con las del base para medir el efecto de la abliteracion.
- Evaluacion de robustez de filtros: util para probar clasificadores de contenido y sistemas de moderacion contra un modelo que no rechaza peticiones, midiendo la tasa de falsos negativos de dichos filtros.
- Procesamiento de documentos largos con imagenes: el contexto de 1M tokens y la entrada multimodal permiten analizar informes, contratos o expedientes con figuras en una sola pasada.
- Generacion de codigo en pipelines internos: con tool calling y contexto largo, puede integrarse en asistentes de desarrollo que necesitan razonar sobre repositorios extensos, siempre que se apliquen capas de moderacion externas.
- Analisis de imagenes tecnicas: diagramas, capturas de pantalla o radiografias en flujos de documentacion tecnica, con salida de texto estructurado.
- Redaccion y sintesis de literatura cientifica: el contexto largo permite resumir y cruzar decenas de articulos, aunque la perdida de precision en MMLU (-4,22 pp global) obliga a verificar datos.
- Despliegue en entornos de investigacion con GPU de gran memoria: el formato FP8 reduce el footprint frente a BF16, lo que facilita servir el modelo en nodos H100/H200 con suficiente VRAM.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card del autor, que comparan el checkpoint modificado (CRACK) con el base. No hay benchmarks oficiales del modelo base DeepSeek-V4.1-Flash en la informacion proporcionada.

**HarmBench-320 (ASR, mayor es peor en terminos de seguridad):**

| Evaluacion | Base ASR | CRACK ASR | Delta (pp) |
|---|---:|---:|---:|
| effort=off | 42,81 % (137/320) | 100,00 % (320/320) | +57,19 |
| effort=max | 1,56 % (5/320) | 100,00 % (320/320) | +98,44 |

**MMLU-14k (test completo, logits base, T=0):**

| Build | Aciertos | Precision | Delta |
|---|---:|---:|---:|
| base | 12.211 / 14.042 | 86,96 % | — |
| CRACK | 11.619 / 14.042 | 82,74 % | -4,22 pp |

Excluyendo el cluster de etica (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy), la caida se reduce a -1,1 pp sobre unos 11.000 items, segun el autor. La mayor degradacion por materia es en moral_scenarios (-39,89 pp), seguida de professional_law (-7,04 pp) y abstract_algebra (-6,00 pp). No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 763,2 B parametros totales y cuantizacion FP8/FP4, el checkpoint ocupa aproximadamente 510 GB en disco; en memoria se requiere un orden de magnitud similar mas overhead de activaciones y cache KV, por lo que no cabe en una sola GPU consumer.
- GPU recomendadas: nodos multi-GPU con H100 80 GB, H200 141 GB o B200; el modelo no es viable en RTX 4090 (24 GB) ni en consumer GPU de gama alta.
- Despliegue: la libreria declarada es `transformers`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se documenta soporte explicito de vLLM, TGI, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base DeepSeek-V4.1-Flash en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales. Las alternativas indicadas son referencias de la misma categoria (MoE de gran escala con contexto largo), sin datos de rendimiento verificados en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 763,2 B totales | 1M | MIT | Abliterado, FP8/FP4, multimodal |
| DeepSeek-V4.1-Flash (base) | no disponible | 1M | no disponible | Modelo de referencia sin modificar |
| Alternativas MoE de gran escala | no disponible | no disponible | no disponible | Sin datos verificados en la informacion disponible |

## Limitaciones y advertencias

- El checkpoint elimina deliberadamente los mecanismos de rechazo: la model card reporta 100 % de ASR en HarmBench-320 en todas las categorias (quimico-biologico, copyright, cibercrimen, acoso, ilegal, desinformacion). No es apto para uso comercial ni para exposicion a usuarios finales sin moderacion externa.
- Riesgo elevado de generar contenido ilegal, danino o sujeto a derechos de autor; la propia model card documenta la eliminacion de rechazos en la categoria copyright.
- Perdida de precision en MMLU de -4,22 pp global y -39,89 pp en moral_scenarios, lo que indica degradacion en tareas de razonamiento etico y legal.
- La licencia MIT declarada puede entrar en conflicto con las condiciones del modelo base; conviene verificar la licencia de `deepseek-ai/DeepSeek-V4.1-Flash` antes de cualquier uso.
- No se especifican idiomas soportados ni sesgos conocidos; la ausencia de guardrails agrava cualquier sesgo preexistente del modelo base.
- Riesgo de alucinacion no cuantificado en la informacion disponible; la perdida de precision en MMLU sugiere mayor propension a errores factuales.
- El modelo requiere hardware de clase centro de datos (multi-GPU H100/H200/B200); no es desplegable en consumer GPU.
- El autor declara que la abliteracion es "quirurgica" y preserva las capacidades, pero esta afirmacion procede de la propia model card y no ha sido verificada de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/AleaiactaEst1/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil de Jordan Schenck en X: https://x.com/jordanschenck
