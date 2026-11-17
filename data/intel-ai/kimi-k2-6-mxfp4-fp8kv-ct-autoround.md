# intel-ai/Kimi-K2.6-MXFP4-FP8KV-CT-AutoRound

## Resumen

Kimi-K2.6-MXFP4-FP8KV-CT-AutoRound es una version cuantizada del modelo multimodal moonshotai/Kimi-K2.6, publicada por el equipo de Intel AI mediante su herramienta AutoRound. El modelo original lo desarrolla Moonshot AI y esta orientado a tareas image-text-to-text, conversacion y razonamiento. Esta variante reduce el coste de inferencia aplicando cuantizacion MXFP4 (W4A16 con group_size 128) a las capas lineales, manteniendo lm_head y embeddings en BF16, y anadiendo una cache KV estatica en FP8.

El resultado es un checkpoint de aproximadamente 551.245 millones de parametros totales (551,25 B) en formato safetensors, con un repositorio de 563,5 GB. La cuantizacion busca preservar la calidad del modelo BF16 original: segun la model card, la recuperacion media en los benchmarks reportados es del 99,47 %, con una perdida muy contenida en GSM8K, MMLU, PIQA y HellaSwag.

Es relevante ahora porque permite desplegar un modelo de escala muy grande en infraestructura con vLLM 0.28.0 y compresion de pesos y cache KV, reduciendo requisitos de memoria frente al BF16. La licencia es "modified-mit" (other), derivada del modelo base, por lo que conviene revisar las condiciones del modelo original antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 551.245.302.890 (551,25 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (W4A16, group_size 128) en capas lineales; BF16 en lm_head y embeddings; cache KV estatica FP8 |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (other), sujeta a la licencia del modelo base |
| Formato de pesos | safetensors (compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

Esta ficha corresponde a un checkpoint cuantizado, no a un entrenamiento desde cero. La arquitectura subyacente es la de moonshotai/Kimi-K2.6, un modelo multimodal de tipo image-text-to-text; la informacion proporcionada no detalla si emplea Mixture of Experts, atencion lineal u otras innovaciones internas. El pipeline declarado es image-text-to-text y la libreria es transformers con codigo personalizado (kimi_k25, custom_code).

La cuantizacion se genero con intel/auto-round usando el esquema MXFP4, con metodo RTN (round-to-nearest) sin optimizacion (--iters 0, --disable_opt_rtn) y calibracion sobre HuggingFaceH4/ultrachat_200k. Se ignoraron capas concretas (shared_experts, self_attn, mlp.gate_proj, mlp.up_proj, mlp.down_proj) y se aplico cache KV estatica en FP8 con formato llm_compressor. No se dispone de datos sobre tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline conversacional declarado.
- Procesamiento de imagen y texto (image-text-to-text), con entrada multimodal.
- Razonamiento y modo de pensamiento: la configuracion de vLLM incluye --reasoning-parser kimi_k2, lo que sugiere soporte de trazas de razonamiento.
- Tool calling / function calling: soportado mediante --tool-call-parser kimi_k2 y --enable-auto-tool-choice en vLLM.
- Uso en agentes y razonamiento multi-paso, derivado del soporte de tool calling y reasoning parser.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Extraccion de caracteristicas (feature-extraction) segun los tags del repositorio.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno y llamadas a herramientas para consultar sistemas internos, usando el tool calling integrado en vLLM con el parser kimi_k2.
- Asistentes con razonamiento explicito: el reasoning parser permite separar la traza de pensamiento de la respuesta final, util para auditoria y depuracion en produccion.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre contenido visual combinado con texto, por ejemplo en digitalizacion de facturas o informes.
- Agentes autonomos multi-paso: la combinacion de tool calling y razonamiento permite orquestar flujos con varias llamadas encadenadas, como busqueda, calculo y sintesis.
- Despliegue en infraestructura con memoria limitada: la cuantizacion MXFP4 y la cache KV FP8 reducen el footprint frente a BF16, lo que facilita servir el modelo con vLLM en nodos con GPU de gran capacidad.
- Evaluacion comparativa de cuantizacion: util para investigadores que quieran medir la degradacion de un modelo de 551 B al pasar de BF16 a MXFP4 con cache FP8, usando los benchmarks reportados como referencia.
- Integracion en pipelines de generacion de codigo o analisis tecnico: el modelo base conserva un rendimiento alto en GSM8K (93,25 en MXFP4), lo que respalda tareas de razonamiento matematico y logico.

## Benchmarks y rendimiento

Resultados reportados en la model card, comparando BF16 con MXFP4:

| Benchmark | BF16 | MXFP4 | Recuperacion |
|---|---:|---:|---:|
| GSM8K | 93,63 | 93,25 | 99,59 % |
| MMLU | 89,01 | 88,82 | 99,79 % |
| PIQA | 84,55 | 84,39 | 99,81 % |
| HellaSwag | 77,52 | 76,42 | 98,58 % |
| Media | 86,18 | 85,72 | 99,47 % |

No se han publicado en la informacion disponible resultados de HumanEval ni de otros benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 551,25 B de parametros, el checkpoint MXFP4 (W4A16) implica un peso aproximado de varios cientos de GB; el repositorio ocupa 563,5 GB, lo que da una idea del orden de magnitud del almacenamiento y de la memoria necesaria.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano, requiere aceleradores de clase数据中心 (A100/H100 o superiores) en configuracion multi-GPU.
- Compatibilidad con GPU de consumo: no disponible; el tamano del modelo hace inviable su ejecucion en GPU de consumo convencionales.
- Opciones de despliegue: vLLM 0.28.0 con --trust-remote-code, --kv-cache-dtype fp8, --tool-call-parser kimi_k2, --enable-auto-tool-choice y --reasoning-parser kimi_k2; requiere transformers 5.16.1 y compressed-tensors 0.17.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K2.6-MXFP4-FP8KV-CT-AutoRound (este) | 551,25 B | no disponible | MXFP4 + KV FP8 | modified-mit (other) | Hugging Face (intel-ai) |
| moonshotai/Kimi-K2.6 (base) | no disponible | no disponible | BF16 | no disponible | Hugging Face (moonshotai) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en los datos proporcionados.

## Limitaciones y advertencias

- El modelo puede producir salidas factualmente incorrectas; no debe usarse como fuente de verdad sin verificacion.
- Riesgo de sesgos y contenido ofensivo derivado del modelo base y de los datasets de ajuste, segun la propia model card.
- La cuantizacion introduce una degradacion medible: la recuperacion media es del 99,47 %, con HellaSwag como benchmark mas afectado (98,58 %).
- Idiomas soportados no especificados; no se puede garantizar calidad multilingue.
- Longitud de contexto no documentada en la informacion disponible.
- Licencia "modified-mit" (other): es imprescindible revisar la licencia del modelo base moonshotai/Kimi-K2.6 antes de uso comercial; la model card indica consultar a un abogado.
- Requiere versiones muy concretas de vLLM, transformers y compressed-tensors, lo que limita la portabilidad.
- El modelo base usa codigo personalizado (--trust-remote-code), lo que implica riesgos de seguridad al ejecutar codigo no auditado.
- No se han publicado datos de latencia, throughput ni pruebas de seguridad en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Kimi-K2.6-MXFP4-FP8KV-CT-AutoRound
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.6
- AutoRound (GitHub): https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper AutoRound: https://arxiv.org/abs/2309.05516
