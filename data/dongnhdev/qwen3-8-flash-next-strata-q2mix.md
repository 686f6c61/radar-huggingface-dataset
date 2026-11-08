# dongnhdev/Qwen3.8-Flash-Next-Strata-Q2mix

## Resumen

Qwen3.8-Flash-Next-Strata-Q2mix es una compilación cuantizada del modelo Qwen3.8-Flash-Next, un modelo de lenguaje de gran tamano (176.943.899.520 parametros totales segun los metadatos de safetensors) empaquetado en formato GGUF para su uso con el motor de inferencia Strata. El autor del repositorio, dongnhdev, ha combinado pesos densos cuantizados con UD-IQ2_XS (procedentes de Unsloth) con expertos enrutados en Q2_0 (tipo ggml 42), re-cuantizados con imatrix mediante weighted-SSE, con el objetivo de permitir inferencia rapida en GPU de consumo.

La relevancia de esta ficha radica en que se trata de una build hibrida orientada a hardware local: segun la model card, alcanza aproximadamente 56-60 tokens/s en decodificacion y 285-950 tokens/s en prefill sobre un Apple M5 Pro con contexto de 32k, lo que situa a un modelo de casi 177.000 millones de parametros al alcance de equipos sin infraestructura de servidor. El repositorio incluye un sidecar PLE (tabla de embeddings por capa) de 28,8 GB y un pack nativo de Strata de aproximadamente 1,6 GB.

No obstante, la informacion disponible es escasa en varios frentes criticos: no se declara licencia, no se indican idiomas soportados, no hay pipeline definido y el repositorio registra 0 descargas y 0 likes en el momento de la consulta. Ademas, el modelo base Qwen3.8-Flash-Next no aparece documentado en las fuentes consultadas, por lo que muchos datos tecnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas de atencion y SSM, mezcla de expertos (MoE) enrutada y tensores de hiper-conexion (`hc_*`); detalles completos no disponibles |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible (la model card menciona 144 tensores de expertos enrutados en 48 capas, pero no indica el numero de expertos activos por token) |
| Longitud de contexto | 32.768 tokens (configuracion de referencia en Strata: `--max-context 32768`) |
| Tipos de cuantizacion | Densos: UD-IQ2_XS; expertos enrutados: Q2_0 (ggml tipo 42) con imatrix y weighted-SSE; tensores `hc_*`: UD-IQ1_M; proyector de vision: BF16; sidecar PLE: incluido en el shard 2 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (dos shards: 38,7 GB + 28,8 GB), pack nativo Strata (`pack/`, ~1,6 GB) y `mmproj` BF16 para vision (0,9 GB) |

## Arquitectura y entrenamiento

La model card describe una arquitectura hibrida que combina capas de atencion con capas SSM (state space model), un router de mezcla de expertos y tensores de hiper-conexion (`hc_*`). Los expertos enrutados se distribuyen en 48 capas con 144 tensores (gate/up/down), y el modelo incorpora una tabla PLE (`per_layer_token_embd`) de 28,8 GB que se sirve como sidecar independiente. La build tambien incluye un proyector de vision en BF16 (`mmproj`), lo que confirma capacidades multimodales de entrada de imagen.

En cuanto al entrenamiento, no se dispone de informacion sobre el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO: la model card solo documenta el proceso de cuantizacion y reempaquetado. La innovacion tecnica destacable es el propio pipeline de cuantizacion mixta: pesos densos en UD-IQ2_XS, expertos en Q2_0 re-cuantizados con imatrix y weighted-SSE, y uso de decodificacion especulativa (`--spec 2`) junto con MTP (multi-token prediction) en el motor Strata para acelerar la decodificacion.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational` en el repositorio).
- Razonamiento: la model card reporta resultados en GPQA, SuperGPQA, AIME y MMLU-Pro dentro de su suite de evaluacion.
- Generacion de codigo: la suite reporta 64/67 en tareas de codigo.
- Uso de herramientas (tool calling): 37/53 en la suite de herramientas del autor.
- Entrada de vision: incluye `mmproj-Qwen3.8-Flash-Next-BF16.gguf` y la flag `--vision` en el comando de servicio.
- Integracion con agentes y APIs: los repos de Strata anuncian endpoints compatibles con OpenAI y Anthropic en localhost, lo que habilita su uso con agentes de codigo.
- Capacidades multilingues: no disponible.
- Modo de razonamiento extendido (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en local: con 64/67 en la suite de codigo del autor y soporte de tool calling, el modelo puede integrarse en un IDE o agente de codigo que consuma el endpoint compatible con OpenAI que expone Strata en localhost, sin enviar codigo a la nube.
- Agente de desarrollo autonomo: la combinacion de tool calling (37/53) y contexto de 32k permite mantener conversaciones multi-paso con llamadas a herramientas dentro de un mismo hilo, suficiente para tareas de refactorizacion o depuracion acotadas.
- Analisis de imagenes en escritorio: gracias al proyector `mmproj` BF16 y la flag `--vision`, se pueden procesar capturas, diagramas o documentos escaneados junto a texto en un flujo local.
- Razonamiento tecnico asistido: los resultados en GPQA, SuperGPQA, AIME y MMLU-Pro indican utilidad para preguntas de dominio cientifico y matematico, adecuado para prototipos de tutoria o validacion de hipotesis.
- Despliegue en estaciones de trabajo con GPU de consumo: con ~56 t/s de decodificacion en un M5 Pro y soporte en RTX 5070 documentado por los repos de Strata, es viable para chatbots internos de un solo usuario o equipos pequenos.
- Procesamiento por lotes de documentos largos: el contexto de 32k y el prefill de ~286-950 t/s permiten resumir o extraer informacion de documentos extensos en local, manteniendo los datos dentro de la maquina.
- Evaluacion e investigacion de tecnicas de cuantizacion: la build mezcla IQ2_XS, Q2_0 e IQ1_M, por lo que sirve como caso de estudio reproducible para medir el impacto de la cuantizacion mixta en calidad y velocidad.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (Strata 0.1.58-metal, Apple M5 Pro, temperatura 0, mismo harness que las evaluaciones de ds4):

| Benchmark | Resultado |
|---|---|
| Codigo | 64/67 |
| Herramientas (tools) | 37/53 |
| Razonamiento (global) | 37/44 |
| GPQA | 7 (escala no especificada) |
| SuperGPQA | 7 (escala no especificada) |
| AIME | 7 (escala no especificada) |
| MMLU-Pro | 16 (escala no especificada) |
| Perplejidad (corpus del autor, densos UD-IQ2_XS) | 21,28 |
| Decodificacion | ~56 t/s mediana |
| Prefill | ~286 t/s mediana (hasta ~950 t/s segun la introduccion) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible, y las escalas de GPQA, SuperGPQA, AIME y MMLU-Pro no se detallan, por lo que no son directamente interpretables fuera del harness del autor.

## Requisitos de hardware

- VRAM/almacenamiento: los dos shards GGUF suman aproximadamente 67,5 GB (38,7 + 28,8 GB), mas ~1,6 GB del pack Strata y 0,9 GB del proyector de vision. Con `--mmap-experts` y cache de expertos de 64, parte de los expertos puede residir en RAM/almacenamiento, reduciendo la VRAM necesaria a costa de latencia.
- GPU recomendadas: no se especifican requisitos oficiales. El autor mide en Apple M5 Pro (memoria unificada); los repos de Strata citan una RTX 5070 con cuantizacion IQ3_S y contexto de 128K, lo que sugiere viabilidad en GPUs consumer de gama alta con suficiente memoria.
- GPU consumer: probablemente viable en RTX 4090 (24 GB) solo con offload de expertos a RAM; no hay datos confirmados de que quepa completamente en VRAM de 24 GB.
- Despliegue: motor Strata (checkout de codigo fuente, `strata --serve` o `serve.server --engine strata`), con flags `--expert-cache`, `--prefill auto`, `--spec 2`, `--mtp`, `--mmap-experts`, `--vision` y `--kv-grow`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~56 t/s de decodificacion y ~286 t/s de prefill en M5 Pro con contexto de 32k; no hay mediciones para otras GPUs.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria (tamano, contexto o tarea), y el modelo base Qwen3.8-Flash-Next no aparece documentado en las fuentes consultadas. Cualquier comparacion con otros modelos Qwen o con alternativas MoE de ~177.000 millones de parametros requeriria datos que no estan en la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es un riesgo critico para produccion.
- Idiomas soportados no declarados: no hay garantia de calidad fuera del idioma o idiomas con los que se entreno el modelo base.
- Cuantizacion muy agresiva: los expertos en Q2_0 y los densos en UD-IQ2_XS implican perdida de calidad respecto a los pesos originales; la perplejidad de 21,28 en el corpus del autor es alta y sugiere degradacion notable.
- Dependencia de un motor no estandar: la build requiere Strata (pack nativo, sidecar PLE, flags especificas) y no es directamente compatible con llama.cpp, Ollama o vLLM, lo que limita su portabilidad.
- Los tensores `hc_*` proceden de una mezcla IQ1_M distinta porque los originales producen salida incoherente en Strata, segun el autor; esto indica un empaquetado fragil y no verificado de forma independiente.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion.
- Repositorio sin traccion: 0 descargas y 0 likes, creado y actualizado el mismo dia, sin validacion de la comunidad.
- Resultados de benchmarks autoinformados y con escalas no especificadas, medidos con el harness del propio autor; no son comparables con evaluaciones estandar.
- El modelo base Qwen3.8-Flash-Next no esta documentado en las fuentes consultadas, lo que impide verificar procedencia, datos de entrenamiento y condiciones de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dongnhdev/Qwen3.8-Flash-Next-Strata-Q2mix
- GitHub de Strata (m3198x): https://github.com/m3198x/strata
- GitHub de Strata (Niko1221): https://github.com/Niko1221/Strata
