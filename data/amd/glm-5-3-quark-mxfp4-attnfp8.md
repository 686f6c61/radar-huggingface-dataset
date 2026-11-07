# amd/GLM-5.3-Quark-MXFP4-AttnFP8

## Resumen

GLM-5.3-Quark-MXFP4-AttnFP8 es una cuantizacion del modelo zai-org/GLM-5.3 publicada por AMD mediante su herramienta AMD-Quark (version V0.12). Se trata de una variante de pesos reducidos que combina MXFP4 en las capas de expertos (router experts y shared_experts) con FP8 por bloque en la atencion (self_attn), manteniendo sin cuantizar el lm_head, los embeddings, eh_proj y la compuerta del MLP. El objetivo es desplegar un modelo de 384.336.046.080 parametros en hardware AMD Instinct MI350/MI355 con un coste de memoria notablemente inferior al de los pesos originales en FP8.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con arquitectura GlmMoeDsaForCausalLM, orientado a generacion de texto conversacional y razonamiento. La cuantizacion busca preservar la precision del modelo original: segun la model card, la recuperacion respecto al baseline nativo en FP8 se situa entre el 98,96% y el 100,86% en los benchmarks publicados, con ligeras mejoras en algunos casos (AIME26, SciCode).

Es relevante ahora porque demuestra que la cuantizacion MXFP4+FP8 de un MoE de gran escala puede mantener el rendimiento en tareas de razonamiento matematico, ciencia y seguimiento de instrucciones, y porque incluye recetas de despliegue verificadas con vLLM sobre ROCm 7.1.1, lo que facilita la reproduccion de resultados en infraestructura AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (transformer MoE) |
| Parametros totales | 384.336.046.080 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 400.000 tokens en la receta de despliegue (327.680 para GPQA Diamond, AIME26 y MMLU Pro) |
| Tipos de cuantizacion | MXFP4 (router experts y shared_experts), FP8 por bloque (self_attn); lm_head, embed_tokens, eh_proj y mlp.gate sin cuantizar |
| Idiomas soportados | en, zh |
| Licencia | other (license_name: glm-5.3) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint zai-org/GLM-5.3, que emplea la arquitectura GlmMoeDsaForCausalLM: un transformer con mezcla de expertos y un mecanismo de atencion denominado DSA en el identificador de la clase. La model card no detalla la composicion del dataset de entrenamiento original, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen en esta ficha.

La innovacion tecnica de esta publicacion es el pipeline de cuantizacion con AMD-Quark. Las capas de atencion se cuantizan a FP8 por bloque, mientras que los expertos (router y compartidos) pasan a MXFP4. Se excluyen explicitamente de la cuantizacion `*self_attn*` en su esquema FP8, `*lm_head`, `*embed_tokens`, `*eh_proj` y `*mlp.gate`, conservando los pesos originales para esas capas. El resultado se sirve con vLLM usando `--kv-cache-dtype fp8_e4m3`, parser de razonamiento y de tool calling `glm47`, y decodificacion con tensor-parallel de 8.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento matematico de nivel competitivo: evaluado en AIME26 y GSM8K con resultados superiores al 91% y 98% respectivamente.
- Razonamiento cientifico y de posgrado: evaluado en GPQA Diamond y MMLU Pro.
- Generacion y resolucion de codigo cientifico: evaluado en SciCode con ejecucion en sandbox Docker.
- Razonamiento de largo contexto: evaluado en AA-LCR con ventanas de hasta 400.000 tokens.
- Seguimiento de instrucciones: evaluado en IFBench.
- Tool calling y function calling: la receta de vLLM activa `--enable-auto-tool-choice` con `--tool-call-parser glm47`.
- Modo de razonamiento con parser dedicado (`--reasoning-parser glm47`) y posibilidad de limpiar el bloque de pensamiento mediante `chat_template_kwargs.clear_thinking`.
- Sin codificador de vision: la propia model card indica que el modelo no dispone de encoder visual y por ello se usa MMLU Pro en lugar de MMMU Pro.

## Casos de uso

- Razonamiento matematico asistido: el modelo mantiene el 100,86% del rendimiento del baseline en AIME26, por lo que es adecuado para tutoria o verificacion de demostraciones paso a paso con cadenas de razonamiento largas.
- Analisis cientifico de nivel experto: con un 99,11% de recuperacion en GPQA Diamond, sirve para responder consultas de fisica, quimica y biologia avanzadas en herramientas internas de investigacion.
- Generacion de codigo cientifico verificado: la receta de SciCode ejecuta el codigo generado en un sandbox Docker con timeout de revision de 1800 segundos, un flujo replicable en pipelines de validacion automatica.
- Procesamiento de documentos extensos: con contexto de hasta 400.000 tokens y un 98,96% de recuperacion en AA-LCR, permite resumir o extraer informacion de contratos, informes tecnicos o expedientes completos en una sola pasada.
- Agentes con tool calling: el parser `glm47` y `--enable-auto-tool-choice` permiten integrar el modelo en orquestadores que invocan APIs, bases de datos o funciones internas en varios pasos.
- Asistencia conversacional bilingue ingles-chino: los dos idiomas declarados cubren atencion al cliente o soporte interno en organizaciones con operaciones en ambos mercados.
- Despliegue en infraestructura AMD: al estar validado sobre MI350/MI355 con ROCm 7.1.1 y vLLM, encaja en clusters que no disponen de GPUs NVIDIA y necesitan un modelo de razonamiento de gran escala.

## Benchmarks y rendimiento

| Benchmark | zai-org/GLM-5.3 (FP8 nativo) | GLM-5.3-Quark-MXFP4-AttnFP8 | Recuperacion |
|---|---|---|---|
| GSM8K (flexible-extract) | 91,96 | 91,43 | 99,42% |
| GPQA Diamond (mean@8) | 92,36 | 91,54 | 99,11% |
| AIME26 (mean@16) | 98,12 | 98,96 | 100,86% |
| MMLU Pro (mean@1) | 88,19 | 87,70 | 99,44% |
| SciCode, subproblem (mean@8) | 56,14 | 56,60 | 100,82% |
| AA-LCR (mean@16) | 72,44 | 71,69 | 98,96% |
| IFBench (mean@5) | 67,33 | 66,67 | 99,02% |

Los resultados se obtuvieron con vLLM (imagen `vllm/vllm-openai-rocm:v0.31.0`), EvalScope 1.14.1 y lm-evaluation-harness. GPQA Diamond, AIME26 y MMLU Pro se evaluaron con `--max-model-len 327680`; SciCode requiere 400.000. La propia model card advierte de que los resultados pueden variar entre ejecuciones.

## Requisitos de hardware

- Hardware validado: AMD Instinct MI350 y MI355, con ROCm 7.1.1 y PyTorch 2.10.0+rocm7.1.1.
- Tamano del repositorio: 409,6 GB, lo que da una idea del espacio en disco necesario para los pesos cuantizados.
- Despliegue de referencia con `--tensor-parallel-size 8`, es decir, ocho aceleradores MI350/MI355 para servir el modelo con la configuracion documentada.
- La evaluacion con lm-evaluation-harness se ejecuto con `tensor_parallel_size=4` y `max_model_len=32768` en el ejemplo de GSM8K, lo que sugiere que configuraciones de 4 GPUs son viables para contextos reducidos.
- No hay datos publicados sobre ejecucion en GPUs de consumo (RTX 4090 u otras); por el volumen de parametros y el formato MXFP4/FP8, no se documenta soporte para ellas.
- Motor de inferencia: vLLM sobre ROCm. La model card no menciona llama.cpp, Ollama ni TGI.
- Variables de entorno recomendadas: `VLLM_ROCM_USE_AITER=1`, `VLLM_ROCM_USE_AITER_FP8BMM=0`, `VLLM_ROCM_USE_AITER_FP4BMM=0`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| amd/GLM-5.3-Quark-MXFP4-AttnFP8 | 384,3 B | hasta 400.000 tokens | MXFP4 + FP8 por bloque | other (glm-5.3) | AMD MI350/MI355 |
| zai-org/GLM-5.3 (base) | no disponible en la informacion | no disponible en la informacion | FP8 nativo | glm-5.3 | no disponible |
| amd/GLM-5.3-Flash-Quark-MXFP4 | no disponible en la informacion | no disponible en la informacion | MXFP4 | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base encontradas en la busqueda; no se dispone de datos de benchmarks ni de especificaciones de modelos de otros fabricantes con los que contrastar.

## Limitaciones y advertencias

- Solo soporta ingles y chino; no se declara cobertura de castellano ni de otras lenguas.
- No dispone de codificador de vision, por lo que no puede procesar imagenes.
- La licencia es `other` con nombre `glm-5.3`; es necesario revisar los terminos del modelo base zai-org/GLM-5.3 antes de cualquier uso comercial.
- La cuantizacion introduce perdidas medibles: la recuperacion baja al 98,96% en AA-LCR y al 99,02% en IFBench respecto al baseline en FP8.
- El hardware validado es exclusivamente AMD MI350/MI355 con ROCm 7.1.1; no hay garantias documentadas de funcionamiento en otras plataformas.
- El despliegue de referencia requiere ocho GPUs en tensor-parallel, lo que limita su uso a infraestructura de centro de datos.
- Riesgo de alucinacion y sesgos: la model card no publica analisis especifico; deben asumirse los del modelo base, no documentados aqui.
- Los resultados de benchmarks pueden variar entre ejecuciones, segun advierte el propio autor.
- El contexto maximo util depende de la configuracion: SciCode necesita 400.000 tokens, mientras que otras evaluaciones se hicieron con 327.680.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/GLM-5.3-Quark-MXFP4-AttnFP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Variante Flash cuantizada: https://huggingface.co/amd/GLM-5.3-Flash-Quark-MXFP4
- Documentacion de AMD-Quark: https://quark.docs.amd.com/latest/index.html
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Receta de vLLM para GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
- EvalScope: https://evalscope.readthedocs.io/en/latest/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
