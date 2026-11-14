# ITLL/Qwythos-9B-Claude-Mythos-5-1M-GGUF

## Resumen

Qwythos-9B-Claude-Mythos-5-1M-GGUF es la distribucion cuantizada en formato GGUF del modelo empero-ai/Qwythos-9B-Claude-Mythos-5-1M, desarrollado por Empero AI. Se trata de un modelo de razonamiento de 8.950 millones de parametros derivado de Qwen3.5-9B mediante un post-entrenamiento de parametros completos sobre mas de 500 millones de tokens de trazas de chain-of-thought generadas internamente con su herramienta `rethink`. Este repositorio concreto, publicado por ITLL, empaqueta los pesos en cuantizaciones de llama.cpp para su uso en Ollama, LM Studio, jan, KoboldCpp y otros runtimes GGUF.

El modelo resuelve el problema de obtener razonamiento explicito y function calling nativo en un tamano que cabe en GPU de consumo, manteniendo ademas una ventana de contexto de 1.048.576 tokens habilitada por defecto mediante rope-scaling YaRN. Segun la model card, supera al Qwen3.5-9B base en +34 puntos de MMLU, +30 puntos en gsm8k-strict y +19 puntos en gsm8k-flex bajo evaluacion emparejada.

La relevancia actual reside en tres ejes: contexto de un millon de tokens en 9B, soporte multimodal de imagen heredado del tower de vision de Qwen3.5-9B (congelado durante el SFT) y variantes con cabeza MTP para decodificacion especulativa en llama.cpp. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.5-9B, con tower de vision CLIP-style y cabeza MTP opcional |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) via YaRN rope-scaling activado por defecto |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16; variantes equivalentes con MTP |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen3.5-9B e incorpora un tower de vision de estilo CLIP que se mantiene congelado: el SFT fue exclusivamente de texto, por lo que las capacidades visuales son identicas a las del Qwen3.5-9B base y el proyector `mmproj` es intercambiable con cualquier `mmproj-*.gguf` de la comunidad para Qwen3.5-9B. El post-entrenamiento se realizo sobre parametros completos con mas de 500 millones de tokens de trazas de razonamiento tipo Claude Mythos / Claude Fable, con chain-of-thought generado por la herramienta interna `rethink` de Empero AI.

Entre las innovaciones tecnicas destacan la ventana de 1M tokens mediante YaRN habilitada por defecto, el function calling nativo conforme a la especificacion Qwen3.5 y la restauracion de la cabeza MTP (multi-token prediction) compatible con Qwen3.5 dentro del GGUF, que permite decodificacion especulativa con `--spec-type draft-mtp` en builds recientes de llama.cpp. El modelo usa la plantilla de chat estandar de Qwen3.5. No se detalla en la informacion disponible la composicion exacta del dataset ni si hubo fases de RLHF o DPO mas alla del SFT descrito.

## Capacidades

- Generacion de texto y razonamiento explicito con chain-of-thought entrenado.
- Razonamiento matematico reforzado (mejoras reportadas en gsm8k-strict y gsm8k-flex frente al base).
- Function calling nativo segun la especificacion de Qwen3.5.
- Flujos agenticos y razonamiento multi-paso.
- Entrada de imagen: descripcion detallada, OCR impreso y manuscrito, lectura de graficos y tablas, comprension de UI y documentos, razonamiento espacial basico (heredado de Qwen3.5-9B).
- Contexto largo de hasta 1.048.576 tokens.
- Dominios especializados declarados en los tags: ciberseguridad y biomedico.
- Modelo etiquetado como "uncensored" por el autor.
- Decodificacion especulativa via cabeza MTP en las variantes correspondientes.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto puede ingerir arboles de codigo extensos, historiales de commits y documentacion en una sola pasada para tareas de revision o refactorizacion asistida.
- Agentes con tool calling en produccion: el soporte nativo de function calling conforme a Qwen3.5 permite integrarlo en orquestadores que encadenan busquedas, ejecucion de codigo y APIs externas con razonamiento multi-paso.
- Procesamiento de documentacion tecnica y legal de gran volumen: contratos, normativas o manuales de cientos de paginas caben en la ventana de 1M tokens, evitando pipelines de chunking y recuperacion.
- Analisis de imagenes y documentos escaneados: gracias al `mmproj` puede hacer OCR de formularios, leer tablas en capturas y describir diagramas, util para digitalizacion y extraccion de datos.
- Asistencia en ciberseguridad defensiva: el modelo esta entrenado y etiquetado para dominios de seguridad; puede apoyar en triaje de alertas, explicacion de vulnerabilidades y redaccion de informes tecnicos.
- Razonamiento biomedico asistido: resumen y discusion de literatura cientifica, explicacion de mecanismos bioquimicos y apoyo a la redaccion de protocolos, siempre con supervision humana.
- Despliegue local en estaciones de trabajo: la cuantizacion Q4_K_M (5,24 GiB) permite ejecutar el modelo en GPU de consumo con contexto moderado, util para prototipado offline y entornos con requisitos de privacidad.
- Servidor compatible con la API de OpenAI: `llama-server` expone `/v1/chat/completions` con soporte de imagenes, lo que facilita sustituir backends en aplicaciones existentes.

## Benchmarks y rendimiento

La model card del repositorio GGUF solo reporta deltas relativos frente al Qwen3.5-9B base bajo evaluacion emparejada:

| Benchmark | Delta frente a Qwen3.5-9B base |
|---|---|
| MMLU | +34 puntos |
| gsm8k-strict | +30 puntos |
| gsm8k-flex | +19 puntos |

No se han publicado en la informacion disponible los valores absolutos de estos benchmarks ni resultados de HumanEval, MMLU-Pro u otras pruebas. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada de inferencia segun cuantizacion: Q4_K_M ~5,6 GB de pesos; Q5_K_M ~6,5 GB; Q6_K ~7,4 GB; Q8_0 ~9,5 GB; BF16 ~17,9 GB. A esto hay que sumar el `mmproj` F16 (~0,9 GB) si se usa vision y la memoria del KV cache, que crece de forma notable con contextos de 1M tokens.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 o BF16 con contexto moderado; RTX 4080/4070 Ti Super (16 GB) para Q6_K o Q8_0; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4_K_M y Q5_K_M; A100/H100 para contextos muy largos o servicio concurrente.
- Cabe en GPU de consumo: si, Q4_K_M en GPUs de 8 GB o mas, con contexto limitado; contextos cercanos a 1M requieren hardware de datacenter o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), Ollama, LM Studio, jan, KoboldCpp y cualquier runtime GGUF compatible; servidor con API compatible OpenAI para texto e imagenes.
- Latencia y throughput: no disponibles en la informacion proporcionada. Las variantes MTP con `--spec-type draft-mtp --spec-draft-n-max 6` estan pensadas para acelerar la decodificacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwythos-9B-Claude-Mythos-5-1M (este) | 8,95B | 1.048.576 | Apache 2.0 | GGUF, safetensors (base) | Razonamiento SFT sobre Qwen3.5-9B, vision heredada, MTP opcional |
| Qwen3.5-9B (base) | ~9B | no disponible en la informacion | no disponible en la informacion | safetensors | Referencia de comparacion usada por el autor; sin el post-entrenamiento de razonamiento |
| Alternativas GGUF de 7-9B con contexto largo | no disponible | no disponible | no disponible | GGUF | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks absolutos ni de otros modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Modelo etiquetado como "uncensored": puede generar contenido sensible sin las salvaguardas habituales de los modelos alineados; requiere filtros propios en produccion.
- Riesgo de alucinacion inherente a modelos de 9B, especialmente en contextos de 1M tokens donde la recuperacion de informacion distante puede degradarse.
- La ventana de 1M depende de YaRN; la calidad efectiva en contextos muy largos no esta cuantificada en la informacion disponible.
- El tower de vision esta congelado y no fue ajustado durante el SFT: las capacidades visuales son las del Qwen3.5-9B base y no se benefician del post-entrenamiento de razonamiento.
- El KV cache a contextos cercanos a 1M consume cantidades muy elevadas de memoria; en la practica el contexto util en GPU de consumo es mucho menor.
- Las variantes MTP requieren builds recientes de llama.cpp con soporte de draft speculation; en runtimes sin soporte deben usarse los ficheros normales.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre sesgos, exactitud factual ni idoneidad para dominios regulados como el biomedico o la ciberseguridad.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: ecosistema y validacion comunitaria practicamente inexistentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ITLL/Qwythos-9B-Claude-Mythos-5-1M-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Organizacion Empero: https://empero.org
- llama.cpp: https://github.com/ggml-org/llama.cpp
