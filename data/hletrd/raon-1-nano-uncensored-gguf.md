# hletrd/Raon-1-nano-Uncensored-GGUF

## Resumen

Raon-1-nano-Uncensored-GGUF es una coleccion de cuantizaciones GGUF del modelo KRAFTON/Raon-1-nano, un transformer de 3.130.811.440 parametros (aproximadamente 3,13 mil millones) desarrollado originalmente por KRAFTON. El autor de esta variante, hletrd, ha aplicado una edicion de tipo "abliteration": la eliminacion de una direccion de rechazo en los pesos para reducir la tasa de respuestas negativas ante peticiones que el modelo base rechazaria. El resultado se distribuye en ocho ficheros GGUF con cuantizaciones que van de Q8_0 (3,39 GB) a Q2_K (1,58 GB).

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica concreta de modificacion de pesos (proyeccion ortogonal de una direccion de rechazo en 51 tensores de las capas 6 a 22) con metricas de fidelidad respecto al modelo original (KL divergence y top-1 agreement). Por otro, expone una dependencia critica de despliegue: estos GGUF requieren un fork especifico de llama.cpp mantenido por KRAFTON (rama `raon-1-nano`), compilado con CUDA, porque la build solo-CPU aborta con una asercion al cargar los ficheros.

El modelo base Raon-1-nano esta orientado a generacion de texto conversacional en coreano e ingles, con licencia Apache 2.0. La variante uncensored conserva la licencia y anade un fichero NOTICE con los cambios realizados. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las unicas metricas publicadas son de fidelidad de cuantizacion y de tasa de rechazo en HarmBench y Alpaca.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de atencion y activacion no disponibles); incluye un bloque MTP (multi-token prediction) en el modelo base que esta variante elimina |
| Parametros totales | 3.130.811.440 (aproximadamente 3,13 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens segun la tabla de hardware del autor (con KV cache en f16); el ejemplo de ejecucion usa `-c 32768` |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K (generadas con imatrix) |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base KRAFTON/Raon-1-nano es un transformer de aproximadamente 3,13 mil millones de parametros con un bloque MTP (multi-token prediction) que esta variante uncensored elimina explicitamente. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La modificacion de hletrd consiste en una unica direccion de rechazo extraida en la capa 16, con el canal 746 puesto a cero, que se proyecta fuera de las proyecciones de salida de atencion, las proyecciones down del MLP y las proyecciones de entrada por capa de las capas 6 a 22, afectando a 51 tensores en total. El embedding, la cabeza de salida y el bloque MTP no se modifican.

Las cuantizaciones se generaron con imatrix y se evaluaron contra los pesos BF16 originales midiendo KL divergence en WikiText-2, en un conjunto de chat y en un conjunto held-out, ademas de top-1 agreement y una prueba de respuesta a 7 preguntas. La tabla de precision muestra que Q8_0 mantiene un top-1 del 95,64% en WikiText-2 (frente al 98,08% de la cuantizacion Q8_0 de KRAFTON), mientras que Q2_K cae al 73,49%, lo que indica una degradacion severa por debajo de Q4. La tasa de rechazo en HarmBench pasa del 98,5% del Q8_0 original al 0,5% en esta variante, confirmando el efecto de la abliteration.

## Capacidades

- Generacion de texto conversacional multi-turno en coreano e ingles.
- Razonamiento y respuesta a preguntas en formato chat (la model card menciona "thinking off" en las evaluaciones, lo que implica un modo de razonamiento desactivable).
- Reduccion drastica de rechazos ante peticiones consideradas sensibles: 0,5% de rechazo en HarmBench frente al 98,5% del modelo base.
- Soporte de plantilla Jinja para chat (`--jinja` en llama-server).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- Capacidades multilingues limitadas a coreano e ingles.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo permite estudiar como la eliminacion de una direccion de rechazo afecta a la tasa de respuestas negativas (HarmBench de 98,5% a 0,5%) manteniendo la fidelidad de cuantizacion, util para papers sobre interpretabilidad y seguridad.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que aborde temas sensibles, donde el modelo base rechazaria la peticion; el contexto de 256K permite mantener coherencia en novelas largas.
- Despliegue en hardware de consumo: con Q4_K_M (2,08 GB) cabe en GPUs de 8 GB o menos y en sistemas con memoria unificada, lo que facilita prototipado local en coreano e ingles.
- Evaluacion comparativa de cuantizaciones: la tabla de KL y top-1 por fichero permite seleccionar el punto de equilibrio entre tamano y fidelidad (Q6_K a 2,65 GB mantiene 94,31% de top-1, frente al 73,49% de Q2_K).
- Procesamiento de documentos largos en coreano: con 256K tokens de contexto se pueden resumir o extraer informacion de contratos, informes o transcripciones extensas en un solo pase.
- Chatbot de dominio restringido sin capa de moderacion: en entornos controlados (investigacion, red teaming interno) donde se necesita un modelo que no bloquee consultas tecnicas o de seguridad.
- Red teaming y evaluacion de seguridad: servir como modelo "sin censura" de referencia para comparar con variantes alineadas y medir la eficacia de filtros externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas metricas publicadas son de fidelidad de cuantizacion y de tasa de rechazo:

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 | Chat KL | Top-1 | HarmBench rechazado | Alpaca rechazado |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 3,39 GB | 0,005994 | 95,64% | 0,016018 | 94,20% | 0,5% | 0,0% |
| Q8_0 (KRAFTON) | 3,39 GB | 0,001187 | 98,08% | 0,001546 | 98,14% | 98,5% | 0,0% |
| Q6_K | 2,65 GB | 0,009180 | 94,31% | 0,021124 | 93,10% | 0,5% | 0,0% |
| Q5_K_M | 2,36 GB | 0,013208 | 93,05% | 0,026456 | 92,39% | 0,0% | 0,0% |
| Q4_K_M | 2,08 GB | 0,026504 | 90,59% | 0,044721 | 90,45% | 0,5% | 0,0% |
| Q4_K_S | 2,06 GB | 0,030274 | 89,93% | 0,048429 | 89,55% | 0,0% | 0,0% |
| IQ4_XS | 1,88 GB | 0,039235 | 88,84% | 0,059420 | 88,57% | 0,0% | 0,0% |
| Q3_K_M | 1,69 GB | 0,087801 | 83,96% | 0,125945 | 84,28% | 0,0% | 0,0% |
| Q2_K | 1,58 GB | 0,287412 | 73,49% | 0,363602 | 72,75% | 3,0% | 0,0% |

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 1,6 GB (Q2_K) hasta 3,4 GB (Q8_0) solo para los pesos; el contexto consume memoria adicional segun el KV cache en f16.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) con Q8_0 y contexto de 256K; RTX 5090 (32 GB), RTX 6000 Ada, H100 (80 GB), H200 (141 GB), B200 (192 GB) y B300 (288 GB) segun la tabla del autor.
- Cabe en GPU de consumo: si, desde GPUs de 8 GB con Q4_K_M o inferiores; Q8_0 requiere al menos 4 GB libres para pesos mas el KV cache.
- Sistemas con memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB), M5 Ultra (256 GB y 512 GB).
- Opciones de despliegue: exclusivamente llama.cpp mediante el fork krafton-ai/llama.cpp rama `raon-1-nano` (commit `b6626358828007d0140d42399705b73bb7a6444b` o posterior), compilado con `-DGGML_CUDA=ON`. La build solo-CPU aborta con una asercion al cargar los ficheros. No se documenta compatibilidad con vLLM, TGI, Ollama ni otras herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| Raon-1-nano-Uncensored (este) | 3,13 B | 256K | ko, en | Apache 2.0 | GGUF | Abliterated, requiere fork de llama.cpp con CUDA |
| KRAFTON/Raon-1-nano (base) | 3,13 B | 256K | ko, en | Apache 2.0 | safetensors, GGUF | Alineado, rechazo del 98,5% en HarmBench |
| Modelos de ~3B de la familia Llama o Qwen | 3-4 B | Variable | Multilingue | Licencias diversas | safetensors, GGUF | No disponible comparacion directa de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento con alternativas de la misma categoria; la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- La abliteration elimina la direccion de rechazo, pero no garantiza la ausencia de contenido danino: el modelo puede generar respuestas inexactas o inapropiadas sin aviso, lo que exige moderacion externa en produccion.
- Riesgo de alucinacion inherente a un modelo de 3,13 B; no se han publicado evaluaciones de factualidad.
- Idiomas limitados a coreano e ingles; el rendimiento en castellano no esta documentado.
- La dependencia de un fork especifico de llama.cpp con CUDA limita el despliegue: no funciona con builds estandar de llama.cpp, Ollama, vLLM ni TGI, y la build CPU falla.
- La cuantizacion Q2_K degrada gravemente la calidad (top-1 del 73,49% frente al 95,64% de Q8_0); no se recomienda para produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; revisar el fichero NOTICE para los cambios aplicados.
- El modelo base incluye un bloque MTP que esta variante elimina, por lo que no se beneficia de decodificacion especulativa nativa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/Raon-1-nano-Uncensored-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Fork de llama.cpp requerido: https://github.com/krafton-ai/llama.cpp (rama `raon-1-nano`)
- Repositorio de referencia del autor (Xylolabs): https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia Apache 2.0: https://huggingface.co/hletrd/Raon-1-nano-Uncensored-GGUF/blob/main/LICENSE
- Fichero NOTICE con los cambios: https://huggingface.co/hletrd/Raon-1-nano-Uncensored-GGUF/blob/main/NOTICE
