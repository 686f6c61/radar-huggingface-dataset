# axteam/Qwen3.6-35B-A3B-AWQ-8bit

## Resumen

Qwen3.6-35B-A3B-AWQ-8bit es una versión cuantizada en 8 bits (AWQ, esquema W8A16) del modelo multimodal Qwen3.6-35B-A3B desarrollado por el equipo de Qwen. La cuantización ha sido realizada por axteam, un tercero, con el objetivo de servir el modelo de forma eficiente mediante vLLM sin necesidad de GPUs de gama extrema. El modelo base es un MoE híbrido de aproximadamente 35B de parámetros totales con unos 3B activos por token, lo que permite combinar la capacidad de un modelo grande con la latencia y el coste de uno pequeño.

La relevancia de esta variante radica en su equilibrio entre fidelidad y eficiencia: la cuantización es post-entrenamiento (PTQ, sin reentrenamiento) y conserva en BF16 los componentes más sensibles (torre de visión, router MoE, embeddings, cabezal MTP), obteniendo una concordancia top-1 del 93,2 % respecto al original y una penalización de perplexidad de solo el 4,1 %. Al ser un modelo image-text-to-text con soporte de thinking mode y cabeza de predicción multi-token (MTP), resulta una opción atractiva para despliegues de producción en servidores con una sola GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (linear-attention + full-attention), MoE con 256 expertos + experto compartido, multimodal (vision), cabeza MTP |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | ~3B por token (MoE) |
| Longitud de contexto | No disponible (el ejemplo de vLLM usa 32768 tokens con `--max-model-len 32768`) |
| Tipos de cuantizacion | AWQ INT8 (W8A16): pesos INT8 simetricos, group size 32, activaciones BF16; formato compressed-tensors `pack-quantized`; KV-cache FP8 opcional en runtime |
| Idiomas soportados | No disponible (el corpus de calibracion es mixto, con predominio de coreano, e incluye ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base combina atencion linear y atencion completa en una arquitectura hibrida, lo que reduce el coste de la KV-cache en contextos largos manteniendo la capacidad de atencion global cuando es necesaria. Sobre esa base se monta un MoE con 256 expertos mas un experto compartido, activando unos 3B de los 35B totales de parametros por token. Ademas incorpora una torre de vision (multimodal image-text-to-text) y una cabeza de multi-token prediction (MTP) que puede acelerar la generacion mediante decodificacion especulativa.

Sobre el entrenamiento del modelo base no se han publicado datos en la informacion disponible (numero de tokens, composicion del dataset, uso de RLHF/DPO). En cuanto a la cuantizacion, se trata de una AWQ INT8 post-entrenamiento sin gradientes: se uso un conjunto de calibracion de 256 muestras de un corpus mixto con predominio de coreano. Se mantienen en BF16 la torre de vision y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, el LM head, el router MoE (`mlp.gate`), la puerta del experto compartido y las partes no lineales del SSM (`linear_attn.conv1d/A_log/dt_bias`).

## Capacidades

- Generacion de texto conversacional con chat template identico al modelo original.
- Entrada multimodal: acepta imagenes (URL o data URI) junto al texto, gracias a la torre de vision conservada en BF16.
- Thinking mode activado por defecto en el chat template; se puede desactivar con `chat_template_kwargs={"enable_thinking": False}`.
- Razonamiento multi-step y agentico: no hay documentacion explicita de tool calling en la informacion disponible, aunque el chat template y el formato OpenAI-compatible de vLLM facilitan la integracion en agentes.
- Generacion acelerable mediante la cabeza MTP (multi-token prediction).
- Eficiencia de contexto gracias a la arquitectura hibrida linear-attention + full-attention.
- Capacidades multilingues: no documentadas explicitamente; el corpus de calibracion sugiere al menos ingles y coreano.

## Casos de uso

- Chatbot multimodal en produccion: el modelo acepta imagenes y texto en la misma conversacion y se despliega con un servidor OpenAI-compatible de vLLM, ideal para asistentes que analizan capturas, documentos escaneados o interfaces.
- Serving economico en una sola GPU: con ~3B de parametros activos y pesos INT8 (~37,6 GB en disco), cabe en una GPU de 48 GB, reduciendo el coste por token frente al original en BF16.
- Procesamiento por lotes de documentos con imagenes: la inferencia offline en Python (`vllm.LLM.chat`) permite procesar colas de peticiones con imagen y texto de forma paralela.
- Sistemas de razonamiento con thinking mode: el modo de pensamiento activado por defecto permite tareas de razonamiento complejo, con posibilidad de desactivarlo para respuestas rapidas.
- Despliegue con contexto largo: la arquitectura hibrida con atencion linear reduce la memoria de la KV-cache; combinado con `--kv-cache-dtype fp8` se puede servir contexto extenso o batches grandes.
- Optimizacion de latencia con decodificacion especulativa: la cabeza MTP conservada en BF16 permite generar varios tokens por paso en runtimes que la soporten.
- Servicios dirigidos a mercados asiaticos: la calibracion con corpus con predominio de coreano la hace especialmente adecuada para cargas de trabajo en coreano e ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor publica metricas de fidelidad respecto al original BF16 (no puntuaciones absolutas de tareas):

| Metrica | Este modelo | Original BF16 |
|---|---|---|
| Perplexity (menor = mas fiel) | 1,3465 | 1,2934 (+4,1 %) |
| Concordancia top-1 siguiente token | 93,2 % | 98,0 % |

Medidas sobre un conjunto interno mixto ingles/coreano (100 prompts, respuestas greedy del BF16 puntuadas bajo cada build, mismo harness para ambas).

## Requisitos de hardware

- VRAM estimada para inferencia: ~37,6 GB solo de pesos; con vision activada y KV-cache en BF16 se recomienda una GPU de 48 GB o mas. Con `--limit-mm-per-prompt '{"image": 0, "video": 0}'` se libera el presupuesto de memoria del encoder de vision en despliegues solo-texto.
- GPU recomendadas: NVIDIA A100 80 GB, A100 40 GB (ajustando contexto), H100, L40S 48 GB o RTX 6000 Ada 48 GB. Con KV-cache FP8 y contexto limitado podria caber en GPUs de 40-48 GB con margen.
- Consumer GPU: no cabe en tarjetas de 24 GB (RTX 4090/3090) dado el tamano de los pesos; se necesitarian cuantizaciones mas agresivas (no disponibles en este repo).
- Despliegue: vLLM es el runtime objetivo (formato compressed-tensors `pack-quantized`); el repo es compatible con endpoints OpenAI. No hay soporte documentado para llama.cpp u Ollama (formato GGUF no disponible).
- Latencia y throughput: no se han publicado cifras; los ~3B de parametros activos y la cabeza MTP sugieren buena latencia, pero no hay mediciones disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Cuantizacion | Multimodal | Licencia |
|---|---|---|---|---|
| axteam/Qwen3.6-35B-A3B-AWQ-8bit | ~35,95B / ~3B | AWQ INT8 (W8A16) | Si (vision) | Apache-2.0 |
| Qwen/Qwen3.6-35B-A3B (original) | ~35,95B / ~3B | BF16 | Si (vision) | Apache-2.0 |
| Variantes GGUF/INT4 de modelos similares | No disponible | No disponible | No disponible | No disponible |

No se conocen alternativas cuantizadas equivalentes de esta misma arquitectura en la informacion disponible; la comparacion mas directa es con el modelo base en BF16, que requiere aproximadamente el doble de memoria (~72 GB de pesos) a cambio de una fidelidad maxima (perplexity 1,2934 y concordancia top-1 del 98 % consigo mismo en el harness del autor).

## Limitaciones y advertencias

- La calibracion AWQ uso un corpus con predominio de coreano (256 muestras), lo que puede afectar la fidelidad de la cuantizacion en otros idiomas, incluido el castellano; no hay metricas de fidelidad por idioma publicadas.
- Existe una degradacion medible respecto al original: +4,1 % de perplexity y caida de concordancia top-1 del 98,0 % al 93,2 %, relevante en tareas sensibles a la eleccion exacta de tokens.
- El riesgo de alucinacion es el inherente al modelo base; no hay evaluaciones de alucinacion publicadas para esta variante.
- La longitud de contexto maxima del modelo base no esta documentada en la informacion disponible; el ejemplo de uso limita a 32768 tokens, pero no se confirma que sea el maximo.
- Sesgos conocidos: no documentados; al derivar del modelo base, hereda sus sesgos sin evaluacion adicional publicada.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con los terminos estandar de la licencia; los derechos sobre pesos, tokenizador y chat template originales pertenecen al equipo de Qwen.
- Para produccion: el repo tiene muy poca traccion comunitaria (25 descargas, 2 likes en el momento de la ficha), por lo que conviene validar la calidad en el dominio de uso propio antes de desplegar.
- Solo-texto: si no se necesitan imagenes, conviene arrancar con `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para ahorrar memoria.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.6-35B-A3B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
