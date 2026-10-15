# cleyesode/GLM-4.7-Flash-Coder-MTP-NVFP4

## Resumen

GLM-4.7-Flash-Coder-MTP-NVFP4 es una cuantización en NVFP4 del modelo whitecircle/GLM-4.7-Flash-Coder, publicada por el usuario cleyesode. Se trata de una variante de la familia GLM-4.7-Flash (arquitectura `glm4_moe_lite`, Mixture-of-Experts) orientada a generación de código y uso conversacional, en la que se ha conservado y reentrenado el módulo MTP (Multi-Token Prediction) para habilitar decodificación especulativa. El repositorio declara licencia Apache-2.0 y está pensado para servirse con vLLM sobre GPUs Blackwell.

El problema que resuelve es de eficiencia de despliegue: los pesos de las capas de expertos enrutados (y del módulo MTP) se almacenan en NVFP4 W4A4 con escalas de bloque en FP8 y escalas globales en FP32, mientras que el experto compartido, el router, la atención, los embeddings y `lm_head` se mantienen en BF16. El resultado es un repositorio de 21,7 GB que, según el autor, se sirve en unos 63 GiB de VRAM con tensor parallelism 4 y expert parallelism sobre 4 x RTX 5060 Ti de 16 GB, alcanzando 155.000 tokens de contexto en una única secuencia.

Es relevante ahora porque combina tres piezas poco habituales en un mismo artefacto: cuantización NVFP4 específica para sm100/sm120/sm121, MTP reentrenado (con AdamW y Muon) para decodificación especulativa, y un flujo de cuantización basado en NVIDIA Model-Optimizer con calibración sobre el dataset RazorCal. El contrapunto es que el repositorio no tiene descargas ni validación de la comunidad, y no publica resultados de benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm4_moe_lite`: transformer Mixture-of-Experts con atención MLA (backend `triton_mla` en vLLM) y modulo MTP para decodificacion especulativa |
| Parametros totales | 17.027.963.840 (~17,03 B) segun metadatos de safetensors del repo; la familia base se describe como 30B-A3B |
| Parametros activos | ~3 B (dato de la familia GLM-4.7-Flash, no verificado en la ficha de este repo) |
| Longitud de contexto | 155.000 tokens en la configuracion de servicio del autor; 198K declarados para el modelo base whitecircle/GLM-4.7-Flash-Coder en LLM Explorer |
| Tipos de cuantizacion | NVFP4 W4A4 (grupo 16, escalas de bloque FP8, escalas globales FP32) en expertos enrutados y MTP; BF16 en experto compartido, router, atencion, embeddings y `lm_head`; KV cache sin cuantizar (BF16) |
| Idiomas soportados | No disponible. La calibracion incluye muestras en chino (bloque Chinese-STEM, ~13,9 %) ademas de contenido en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (21,7 GB de repositorio), libreria transformers, compatible con vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantizacion de una arquitectura Mixture-of-Experts de la familia GLM-4.7-Flash, etiquetada en HuggingFace como `glm4_moe_lite`. La configuracion de vLLM emplea `--attention-backend triton_mla` (atencion con latentes comprimidos tipo MLA), `--moe-backend flashinfer_cutlass` y `--enable-expert-parallel`, ademas de un parser de tool calls (`glm47`) y un parser de razonamiento (`glm45`) especificos. El modulo MTP fue transplantado desde el modelo previo al fine-tuning (zai-org/GLM-4.7-Flash) y reentrenado sobre muestras de chat de contexto corto y largo y de terminal, usando los optimizadores AdamW y Muon.

La cuantizacion se realizo con un flujo personalizado de NVIDIA Model-Optimizer. Los expertos enrutados usan NVFP4 W4A4 con grupo 16, escalas de bloque FP8 y escalas globales FP32; el experto compartido, el router, la atencion, los embeddings y `lm_head` permanecen en BF16, y el modulo MTP tambien se cuantiza a NVFP4 W4A4. La calibracion se hizo sobre muestras seleccionadas de Nickyang/RazorCal, con la siguiente composicion declarada: codigo 57 muestras (~24,1 %), matematicas 41 (~17,3 %), Chinese-STEM 33 (~13,9 %), instruction following 32 (~13,5 %), conocimiento del mundo 30 (~12,7 %), tool calling 25 (~10,5 %) y ciencia 19 (~8,0 %). Las muestras de entrenamiento del MTP no se detallan en esa tabla. El autor indica que el modelo esta listo para servirse en la rama mas reciente de vLLM.

## Capacidades

- Generacion de texto y codigo: el fine-tuning del modelo base esta orientado explicitamente a tareas de programacion (etiquetas `code` y `coder`), y el dataset de calibracion incluye Python/C++ algoritmico, programacion competitiva y resolucion de issues de GitHub (SWE).
- Razonamiento matematico y cientifico: la calibracion cubre derivaciones matematicas de nivel alto, problemas estilo AIME, calculo, geometria, fisica, quimica, biologia y termodinamica.
- Tool calling / function calling: el modelo incluye `--tool-call-parser glm47` y `--enable-auto-tool-choice` en la configuracion recomendada, y la calibracion incluye un 10,5 % de flujos agente multi-turno con APIs externas (meteorologia, bolsa, comercio electronico).
- Modo de razonamiento: la configuracion declara `--reasoning-parser glm45`, lo que implica soporte de bloques de razonamiento separados del texto final.
- Decodificacion especulativa con MTP: soporta `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`.
- Cumplimiento estricto de instrucciones y formato: la calibracion incluye restricciones de formato (numero de palabras, palabras excluidas, letras requeridas).
- Procesamiento de contexto largo: el ejemplo de servicio admite una secuencia de hasta 155.000 tokens.
- Multilingue: no declarado oficialmente; la calibracion incluye contenido en chino ademas de ingles, por lo que el soporte multilingue no puede confirmarse mas alla de esas muestras.
- Vision y audio: no disponible (no se mencionan capacidades multimodales en la informacion proporcionada).

## Casos de uso

- Asistente de codigo en IDE o CLI: el modelo puede generar y completar codigo en Python/C++ y resolver tareas de reparacion de issues (SWE), apoyandose en los 155K tokens de contexto para incluir ficheros y trazas completas del repositorio en una sola peticion.
- Agente de terminal automatizado: el MTP fue reentrenado especificamente sobre muestras de terminal, lo que lo hace adecuado para agentes que ejecutan comandos, interpretan salidas y encadenan pasos sobre un shell.
- Atencion al cliente con contexto largo: con 155K tokens de ventana y prefix caching habilitado, puede mantener conversaciones multi-turno con historial extenso y documentacion adjunta sin truncar.
- Razonamiento matematico asistido: la calibracion incluye problemas estilo AIME, calculo y geometria, por lo que es utilizable en herramientas de resolucion paso a paso con modo de razonamiento visible.
- Orquestacion de agentes con herramientas externas: los parsers `glm47` y el auto tool choice permiten integrarlo en pipelines que invocan APIs de meteorologia, cotizaciones bursatiles o sistemas de comercio electronico.
- Extraccion y transformacion de datos con formato estricto: las muestras de instruction following (restricciones de longitud, palabras prohibidas, formato obligatorio) lo hacen apto para generar salidas con esquema fijo en procesos ETL o generacion de informes.
- Despliegue en hardware de gama consumer: al caber en 4 x RTX 5060 Ti de 16 GB con TP4 y expert parallelism, permite montar un endpoint interno de generacion de codigo sin recurrir a A100/H100.
- Generacion de tests y revision de codigo en CI/CD: al soportar tool calling, puede integrarse como paso automatizado que propone parches o tests sobre un diff.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo publica metricas de computo sobre prompts reales, medidas en la configuracion de 4 x RTX 5060 Ti con TP4, `--max-num-seqs 1` y KV cache en BF16.

Rendimiento sin MTP:

| Tokens de entrada | Tokens de salida | TTFT (ms) | TTFT p99 (ms) | Prefill (tok/s) | TPOT (ms) | ITL p99 (ms) | Decode (tok/s) | Latencia E2E (s) |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 956 | 512 | 104 | 133 | 9.186 | 9,0 | 9,8 | 111,1 | 4,7 |
| 8.127 | 512 | 1.096 | 1.107 | 7.415 | 10,3 | 11,2 | 97,0 | 6,4 |
| 32.705 | 512 | 8.794 | 8.813 | 3.719 | 14,5 | 15,0 | 69,1 | 16,2 |
| 65.451 | 512 | 29.575 | 29.578 | 2.213 | 19,7 | 20,7 | 50,7 | 39,5 |
| 126.975 | 512 | 101.946 | 102.252 | 1.246 | 28,8 | 29,8 | 34,7 | 116,7 |

Con MTP activado (`num_speculative_tokens` = 1), el autor declara una mejora de aproximadamente 1,5x en contexto corto y de aproximadamente 1,10x en contexto alto, con la advertencia de una limitacion de kernel en contextos largos. La tabla MTP de la model card aparece truncada en la informacion disponible (solo se reproduce la primera fila, con valores identicos a los de la tabla sin MTP), por lo que no se reproducen aqui las cifras de aceptacion de borradores ni la longitud media aceptada.

## Requisitos de hardware

- VRAM estimada: ~63 GiB en la configuracion de referencia (4 x RTX 5060 Ti 16 GB, tensor parallel 4 con expert parallelism). El comando de servicio reserva `--kv-cache-memory 8574188272` (~8,6 GB) para la cache KV.
- GPUs compatibles: NVFP4 requiere GPUs Blackwell, es decir sm100, sm120 y sm121. Esto cubre B200/B300 (sm100), RTX 50xx y RTX Pro 6000 Blackwell (sm120) y DGX Spark GB10 (sm121). No es ejecutable en Ampere, Ada ni Hopper sin recuantizar.
- Consumer GPU: si cabe, pero no en una sola tarjeta. El ejemplo del autor usa 4 x RTX 5060 Ti de 16 GB (64 GB agregados en total). Una RTX 5090 de 32 GB no es suficiente por si sola para esta configuracion.
- Opciones de despliegue: vLLM (rama mas reciente, con `--trust-remote-code`, `--enable-expert-parallel`, `--moe-backend flashinfer_cutlass` y `--attention-backend triton_mla`). El autor advierte que los formatos de cuantizacion de `kv-cache-dtype` no estan bien soportados en esta arquitectura dentro de vLLM, de ahi el uso de BF16 para la cache KV. Existe un endpoint alojado en FriendliAI. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT de 104 ms con 956 tokens de entrada y de 101,9 s con 126.975 tokens; decode de 111,1 tok/s en contexto corto y 34,7 tok/s en el caso de contexto mas largo; TPOT entre 9,0 ms y 28,8 ms.
- Nota de configuracion: el ejemplo limita `--max-num-seqs 1`, por lo que el throughput agregado con multiples secuencias concurrentes no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cleyesode/GLM-4.7-Flash-Coder-MTP-NVFP4 | ~17,03 B en safetensors (familia 30B-A3B) | 155K en la config de servicio; 198K en el modelo base | NVFP4 W4A4 en expertos enrutados y MTP, BF16 en el resto | Si, en NVFP4, reentrenado con AdamW y Muon | apache-2.0 | Repo propio, 0 descargas, endpoint en FriendliAI |
| whitecircle/GLM-4.7-Flash-Coder | 29,9 B (LLM Explorer) | 198K | BF16 (modelo base del anterior) | No indicado | No disponible en la informacion | Modelo de origen del que deriva esta cuantizacion |
| GadflyII/GLM-4.7-Flash-MTP-NVFP4 | 30B-A3B | No disponible | NVFP4 mixta, con MTP preservado en BF16 | Si, en BF16 | No disponible en la informacion | Repo publico, tambien referenciado por Inferix |
| zai-org/GLM-4.7 | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion | Repositorio oficial de la familia GLM-4.7 |

Rendimiento comparado: no disponible. Ninguno de los modelos de la comparativa publica resultados de benchmarks en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Dependencia de hardware muy estricta: los pesos NVFP4 solo se ejecutan en GPUs Blackwell (sm100/sm120/sm121). En cualquier otra generacion hay que recurrir al modelo base en BF16 o recuantizar.
- Soporte incompleto en vLLM: el propio autor advierte que las cuantizaciones de `kv-cache-dtype` no estan bien soportadas en esta arquitectura, lo que obliga a mantener la cache KV en BF16 y aumenta el consumo de VRAM en contextos largos.
- Limitacion de kernel con MTP en contexto alto: la ganancia de la decodificacion especulativa cae de ~1,5x en contexto corto a ~1,10x en contexto alto.
- Riesgo de alucinacion: no hay evaluacion publicada de fidelidad factual ni de tasas de alucinacion; el modelo base esta afinado para codigo, no para conocimiento factual verificado.
- Idiomas: no se declara oficialmente el conjunto de idiomas soportados. Solo se puede afirmar que la calibracion incluye muestras en chino e ingles, por lo que el comportamiento en castellano no esta documentado.
- Cuantizacion agresiva: el uso de W4A4 en expertos enrutados y MTP puede degradar tareas sensibles a la precision numerica. El autor remite a un `verification_report.txt` en el propio repositorio, sin cifras reproducidas en la model card.
- Validacion de la comunidad inexistente: el repositorio registra 0 descargas y 0 likes, y no procede del equipo que desarrollo el modelo original, sino de un tercero sobre un fine-tuning de otro tercero.
- Trazabilidad de licencias: la ficha declara apache-2.0, pero conviene verificar la licencia del modelo base whitecircle/GLM-4.7-Flash-Coder y la de zai-org/GLM-4.7 antes de un uso comercial en produccion.
- Configuracion de servicio conservadora: el ejemplo de vLLM fija `--max-num-seqs 1` y `--max-num-batched-tokens 1024`, por lo que el rendimiento con cargas concurrentes reales no esta caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cleyesode/GLM-4.7-Flash-Coder-MTP-NVFP4
- Informe de verificacion post-cuantizacion: https://huggingface.co/cleyesode/GLM-4.7-Flash-Coder-MTP-NVFP4/verification_report.txt
- Modelo base: https://huggingface.co/whitecircle/GLM-4.7-Flash-Coder
- Modelo de la familia GLM-4.7: https://huggingface.co/zai-org/GLM-4.7
- Dataset de calibracion RazorCal: https://huggingface.co/datasets/Nickyang/RazorCal
- Cuantizacion NVFP4 equivalente de otro autor: https://huggingface.co/GadflyII/GLM-4.7-Flash-MTP-NVFP4
- Endpoint alojado en FriendliAI: https://friendli.ai/models/cleyesode/GLM-4.7-Flash-Coder-NVFP4
- Ficha del modelo base en LLM Explorer: https://llm-explorer.com/model/whitecircle%2FGLM-4.7-Flash-Coder,6xbvSRE1ehsMuOCJfgw6fs
- Ficha en Inferix de la variante de GadflyII: https://inferix.co/models/GadflyII/GLM-4.7-Flash-NVFP4
