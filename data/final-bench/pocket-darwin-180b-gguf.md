# FINAL-Bench/POCKET-Darwin-180B-GGUF

## Resumen

POCKET-Darwin-180B-GGUF es la distribucion cuantizada en formato GGUF del modelo Darwin-180B-RSI-R3, desarrollado por FINAL-Bench (VIDRAFT). Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso con aproximadamente 176.900 millones de parametros totales y unos 3.000 millones de parametros activos por token, orientado a razonamiento matematico y cientifico y a generacion de texto multilingue (ingles, coreano, chino, japones). Su relevancia actual radica en que el modelo base obtuvo el primer puesto entre modelos de pesos abiertos (y segundo global) en la prueba privada de razonamiento matematico y cientifico de SuperCLUE de noviembre de 2026, con una puntuacion de 73,68, por detras unicamente de GPT-6.1-Sol (76,32) y por delante de Gemini-4-Argon, DeepSeek-V4.1-Flash y Grok-4.7.

Esta version GGUF esta pensada para ejecucion local en equipos con gran cantidad de memoria, como un servidor de CPU con RAM suficiente o configuraciones hibridas GPU/CPU/SSD, y se distribuye en cuatro shards que suman aproximadamente 111,3 GB. La cuantizacion empleada es UD-Q4_K_XL, generada con imatrix, y el runtime de referencia es llama.cpp (build b11048 o superior con soporte qwen4exp).

El modelo hereda las capas de expertos de Qwen3.8-Flash-Next y reconstruye las capas de atencion y de experto compartido mediante un proceso de auto-mejora recursiva (RSI, recursive self-improvement) descrito por el autor. La licencia es la Qwen Community License 1.0, no Apache-2.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) disperso; capas de expertos heredadas de Qwen3.8-Flash-Next, atencion y experto compartido reconstruidos por RSI |
| Parametros totales | 176.943.899.520 (aprox. 176,9 B) |
| Parametros activos | Aproximadamente 3 B por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (unica build publicada en este repo, con imatrix) |
| Idiomas soportados | Ingles (en), coreano (ko), chino (zh), japones (ja), multilingue |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0); no es Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), cuatro shards, ~111,3 GB en total |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Mixture-of-Experts disperso con 176,9 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, lo que permite un coste de computo por token mucho menor que el de un modelo denso del mismo tamano. Segun la model card, las capas de expertos proceden de Qwen3.8-Flash-Next, mientras que las capas de atencion y de experto compartido se reconstruyeron mediante un proceso de auto-mejora recursiva (model-level RSI) sobre el checkpoint Darwin-180B-RSI-R3. Esta build GGUF es una cuantizacion de ese checkpoint, no un modelo entrenado de nuevo.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla la innovacion "vidraft" que aparece en las etiquetas del repositorio. La cuantizacion UD-Q4_K_XL se genero con imatrix, un metodo que calibra la cuantizacion con estadisticas de activacion para reducir la perdida de calidad en modelos grandes.

## Capacidades

- Generacion de texto conversacional y de un solo turno.
- Razonamiento matematico y cientifico de alto nivel: primer modelo de pesos abiertos en la prueba privada de SuperCLUE de noviembre de 2026 en esa categoria (73,68).
- Razonamiento multi-paso (multi-step reasoning).
- Capacidades multilingues en ingles, coreano, chino y japones, con etiqueta "multilingual".
- Modelo solo texto: no hay soporte de vision ni de audio en esta build.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de matematicas de nivel avanzado y explicar el procedimiento paso a paso, aprovechando su puntuacion de 73,68 en la prueba de razonamiento matematico y cientifico de SuperCLUE, adecuado para herramientas de tutoria o verificacion de calculos.
- Analisis cientifico y revision de literatura tecnica: con capacidad de razonamiento multi-paso, puede descomponer problemas de fisica, quimica o biologia y contrastar hipotesis, util en entornos de investigacion donde no se puede enviar datos a la nube.
- Despliegue en servidor local con CPU: al ser un MoE de ~3 B activos y caber en un unico equipo con ~111 GB de memoria, es apto para organizaciones que necesitan inferencia privada en hardware propio sin GPU dedicada, por ejemplo en un servidor con RAM suficiente.
- Procesamiento multilingue en coreano, chino y japones: util para equipos que trabajan con documentacion en estos idiomas y necesitan resumenes, traduccion o analisis sin depender de APIs externas.
- Generacion de texto tecnico y documentacion: el modelo puede redactar explicaciones y borradores tecnicos en ingles y en los idiomas soportados, integrandose en pipelines locales de documentacion.
- Evaluacion y experimentacion en investigacion de IA: al ser un GGUF abierto con cuantizacion UD-Q4_K_XL e imatrix, sirve para reproducir resultados de razonamiento y estudiar el efecto de la cuantizacion en un MoE de gran tamano sobre llama.cpp.
- Escenarios de privacidad estricta: cualquier flujo donde los datos no puedan salir de la infraestructura local (sanidad, legal, defensa) y se requiera razonamiento de calidad, con la salvedad de que la licencia Qwen Community 1.0 debe revisarse antes de uso comercial.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a la prueba privada de razonamiento matematico y cientifico de SuperCLUE de noviembre de 2026, evaluada sobre el modelo base Darwin-180B-RSI-R3 (no sobre esta cuantizacion GGUF).

| Modelo | Desarrollador | Pesos abiertos | Razonamiento matematico y cientifico (SuperCLUE nov. 2026) |
|---|---|---|---|
| GPT-6.1-Sol | OpenAI | No | 76,32 |
| Darwin-180B-RSI-R3 | VIDRAFT | Si | 73,68 |
| Gemini-4-Argon | Google | No | 71,05 |
| DeepSeek-V4.1-Flash | DeepSeek | Si | 71,05 |
| Grok-4.7 | xAI | No | 68,42 |
| Qwen3.8-Max-0902 | Alibaba | No | 68,42 |
| GLM-5.3 | Zhipu AI | Si | 65,79 |
| Kimi-K3.1-Pro | Moonshot | Si | 63,16 |
| Qwen3.8-Flash (padre de Darwin-180B) | Alibaba | Si | 57,89 |

Indice global de inteligencia: Darwin-180B-RSI-R3 obtuvo 43,08 (9.º de 19, 5.º entre modelos de pesos abiertos), frente a 39,81 de Qwen3.8-Flash (15.º). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de la propia cuantizacion GGUF en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repo completo ocupa aproximadamente 111,3 GB; los cuatro shards son obligatorios, por lo que se necesita al menos esa cantidad de memoria disponible (RAM o memoria unificada) para cargar el modelo.
- GPU recomendadas: no se especifican en la informacion disponible. El autor menciona como objetivo equipos con memoria unificada de 128 GB, como NVIDIA DGX Spark, y configuraciones hibridas GPU/CPU/SSD.
- GPU de consumo: no cabe en GPUs de consumo tipicas (24 GB o menos) por el tamano del artefacto; requeriria offload a RAM/SSD o un sistema de memoria unificada grande.
- Opciones de despliegue: llama.cpp (build b11048 o superior con soporte qwen4exp), en modo servidor de CPU o hibrido GPU/CPU/SSD. No se confirma soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| POCKET-Darwin-180B-GGUF | ~176,9 B (MoE) | ~3 B | No disponible | Qwen Community 1.0 | GGUF en Hugging Face |
| Qwen3.8-Flash (padre de los expertos) | No disponible | No disponible | No disponible | No disponible | Pesos abiertos |
| DeepSeek-V4.1-Flash | No disponible | No disponible | No disponible | No disponible | Pesos abiertos |
| GLM-5.3 | No disponible | No disponible | No disponible | No disponible | Pesos abiertos |

La comparacion cuantitativa solo es posible en la metrica de SuperCLUE: Darwin-180B-RSI-R3 (73,68) supera a DeepSeek-V4.1-Flash (71,05), GLM-5.3 (65,79) y Kimi-K3.1-Pro (63,16) en razonamiento matematico y cientifico, y queda por detras de GPT-6.1-Sol (76,32). No hay datos de parametros, contexto ni licencia de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: no hay soporte de vision, audio ni otras modalidades.
- La evaluacion publicada corresponde al modelo base sin cuantizar; el rendimiento de esta build UD-Q4_K_XL puede diferir y no se ha documentado.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en dominios cientificos donde el modelo puede producir afirmaciones plausibles pero incorrectas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Cobertura idiomatica limitada a ingles, coreano, chino y japones; el castellano no figura entre los idiomas soportados.
- Licencia Qwen Community License 1.0 (no Apache-2.0): es imprescindible revisar sus terminos antes de cualquier uso comercial o redistribucion.
- Requiere un runtime especifico (llama.cpp b11048 o superior con qwen4exp) y los cuatro shards completos; no es un artefacto ligero ni apto para entornos con memoria limitada.
- No se confirma soporte de tool calling, agentes ni modo thinking en esta build.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- Archivos y descargas: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF/tree/main
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- Guia de configuracion: https://vidraft.net/p/pocket.html?model=pocket_darwin_180b
- SuperCLUE (leaderboard general, noviembre de 2026): https://www.superclueai.com/homepage
- POCKET-35B: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- POCKET-26B: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF
- POCKET-27B-Pi (especialista en codigo): https://huggingface.co/FINAL-Bench/POCKET-27B-Pi-GGUF
- POCKET-27B: https://huggingface.co/FINAL-Bench/POCKET-27B-GGUF
- Paper referenciado (arxiv:2605.14386): https://arxiv.org/abs/2605.14386
- Paper referenciado (arxiv:2609.20269): https://arxiv.org/abs/2609.20269
