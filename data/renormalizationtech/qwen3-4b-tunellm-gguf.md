# RenormalizationTech/Qwen3-4B-tuneLLM-GGUF

## Resumen

Qwen3-4B tuneLLM GGUF es una release no oficial del modelo Qwen3-4B de Alibaba Qwen, publicada por el usuario RenormalizationTech como parte de un flujo de trabajo educativo de conversion y cuantizacion. No introduce entrenamiento nuevo ni modificaciones en los pesos mas alla de la conversion a formato GGUF y la cuantizacion numerica mediante llama.cpp. El modelo base conserva la arquitectura y capacidades originales de Qwen3-4B, un transformer denso de 4.022.468.096 parametros.

La relevancia de esta ficha es doble: por un lado, documenta una de las primeras releases publicas del flujo tuneLLM aplicado a un modelo Qwen3, con artefactos reproducibles y mediciones de perplexity y throughput incluidas; por otro, sirve como ejemplo de buenas practicas de trazabilidad en cuantizacion, ya que el autor publica hashes, commits y un archivo de reproduccion. El repositorio ocupa 14,8 GB e incluye tres variantes GGUF (BF16, Q8_0 y Q4_K_M).

El modelo esta pensado para inferencia local con llama.cpp en entornos con GPU de consumo o profesional, y hereda las capacidades conversacionales, de razonamiento y de generacion de codigo de Qwen3-4B. Al ser una release educativa, el autor advierte explicitamente de que no establece rankings de capacidad ni equivalencias entre formatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Qwen/Qwen3-4B (revision 1cfa9a7208912126459214e8b04321603b3df60c) |
| Commit de llama.cpp usado | 8ca5a8008b57aa39f2601546c0d07912045080a5 |
| Importance matrix | No utilizada |
| Tamano del repo | 14,8 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B: un transformer denso de aproximadamente 4.000 millones de parametros. Esta release no aplica entrenamiento adicional, RLHF, DPO ni adaptacion de dominio; el autor indica explicitamente que no se realizo adaptacion de dominio ni activation steering. El unico proceso aplicado es la conversion a GGUF en precision BF16 y la cuantizacion posterior a Q8_0 y Q4_K_M mediante llama.cpp en el commit 8ca5a8008b57aa39f2601546c0d07912045080a5, sin importance matrix.

La innovacion tecnica de esta release no esta en el modelo sino en el flujo de trabajo: se incluye un archivo `reproduction-dab1dae.zip` con el codigo fuente del workflow local (commit dab1dae), un manifiesto con hashes de los ficheros del modelo, el commit completo de implementacion y los ajustes de evaluacion. Tambien se incluye `evaluation.json` con las mediciones compactas. El chat template guardado proviene del tokenizer upstream. Para comparaciones con las evaluaciones incluidas es necesario forzar el modo no-thinking de forma explicita mediante `--chat-template-kwargs '{"enable_thinking":false}'`.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen3-4B.
- Razonamiento y matematicas: el modelo base Qwen3 esta disenado para tareas de razonamiento; el autor usa GSM8K para medir perplexity, lo que sugiere soporte para problemas matematicos.
- Generacion de codigo: capacidad heredada del modelo base, no verificada de forma independiente en esta release.
- Modo thinking / no-thinking: el chat template upstream permite alternar entre ambos modos mediante `enable_thinking`.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada para esta release concreta; debe consultarse la model card de Qwen3-4B.
- Capacidades multilingues: no disponibles en la informacion proporcionada; el autor remite a la model card upstream.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue en infraestructura compatible con la API de Hugging Face.
- Inferencia local en CPU y GPU mediante llama.cpp.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: la variante Q4_K_M ocupa 2,326 GiB, lo que permite ejecutarla en GPUs con 4-6 GB de VRAM libre y en CPU con llama.cpp, ideal para prototipado y pruebas offline.
- Evaluacion de pipelines de cuantizacion: el repositorio incluye mediciones de perplexity y throughput por formato, lo que lo convierte en un banco de pruebas util para comparar BF16, Q8_0 y Q4_K_M en el mismo hardware y con el mismo texto.
- Reproduccion de flujos de conversion GGUF: el archivo `reproduction-dab1dae.zip` y el manifiesto de hashes permiten reproducir el proceso completo de conversion y cuantizacion, util para equipos que quieran auditar o replicar el workflow.
- Asistente conversacional de bajo coste en entornos con recursos limitados: con Q4_K_M y 186 tokens/s de generacion en una RTX A6000, es viable para chatbots internos o asistentes de documentacion con latencia aceptable.
- Generacion de codigo en local para entornos con requisitos de privacidad: al ejecutarse completamente en local, permite autocompletado y generacion de codigo sin enviar datos a servicios externos, sujeto a validar la calidad real frente al modelo base.
- Educacion y formacion en cuantizacion: sirve como material didactico para explicar diferencias entre precisiones, el efecto de la importance matrix (ausente aqui) y la relacion entre perplexity y capacidad real.
- Pruebas de compatibilidad de llama.cpp: util para verificar que una build concreta de llama.cpp soporta Qwen3 y los formatos GGUF incluidos, con paridad de tokens de entrada verificada contra Transformers.

## Benchmarks y rendimiento

El autor publica mediciones de throughput y perplexity, no benchmarks de capacidad estandar (MMLU, HumanEval, GSM8K accuracy). Se presentan tal cual, con las advertencias del autor.

| Fichero | Tamano (GiB) | Generacion (tokens/s) | Perplexity (texto corto) |
|---|---:|---:|---:|
| Qwen3-4B-BF16.gguf | 7,498 | 79,1 | 2,6299 |
| Qwen3-4B-Q8_0.gguf | 3,986 | 130,5 | 2,6282 |
| Qwen3-4B-Q4_K_M.gguf | 2,326 | 186,0 | 2,6608 |

Notas metodologicas del autor: throughput medido con llama-bench en una NVIDIA RTX A6000, tres repeticiones, 64 tokens generados, offload completo a GPU, flash attention activado y cuatro hilos de CPU. El procesamiento de prompt se midio por separado con 128 tokens de prompt. La perplexity se midio con llama-perplexity sobre los primeros 32 pares pregunta/solucion de test de GSM8K, contexto 512, cuatro chunks, batch/microbatch 512; la incertidumbre reportada por la herramienta fue de aproximadamente 0,175-0,177. El autor advierte que las diferencias de perplexity son menores que la incertidumbre reportada y no establecen un ranking de capacidad.

Prueba de paridad de tokens de entrada contra Transformers sobre un fixture de ocho items: BF16 y Q8_0 produjeron respuestas identicas a Transformers; las puntuaciones en CPU fueron 7/8, 7/8 y 8/8 respectivamente. El autor advierte que una diferencia de un item no es evidencia de mayor capacidad de Q4.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K accuracy) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): BF16 ~7,5 GiB; Q8_0 ~4,0 GiB; Q4_K_M ~2,3 GiB. Con overhead de contexto y KV cache, anadir aproximadamente 1-3 GiB segun longitud de contexto.
- GPU recomendadas: NVIDIA RTX A6000 (hardware usado en las mediciones), A100, H100 para mayor throughput; RTX 4090, RTX 3090, RTX 4080 para uso profesional en local.
- GPU de consumo: Q4_K_M cabe en GPUs con 6 GB o mas (RTX 3060, RTX 4060, RTX 2060); Q8_0 requiere 8 GB o mas (RTX 3070, RTX 4060 Ti 16 GB); BF16 requiere 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti).
- Despliegue: llama.cpp (build que soporte Qwen3 y estos formatos GGUF), llama-cli, llama-server; Ollama y otros runners basados en llama.cpp son opciones viables aunque no se documentan explicitamente en la model card.
- Throughput medido: 79,1 tokens/s (BF16), 130,5 tokens/s (Q8_0), 186,0 tokens/s (Q4_K_M) en RTX A6000 con offload completo, flash attention y cuatro hilos de CPU. Estas cifras son de un microbenchmark, no de produccion.
- Procesamiento de prompt: medido por separado con 128 tokens de prompt; el valor concreto no se detalla en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Qwen3-4B tuneLLM GGUF (esta release) | 4,02 B | no disponible | Apache 2.0 | GGUF (BF16, Q8_0, Q4_K_M) | Release educativa, sin entrenamiento adicional; mediciones de perplexity y throughput incluidas |
| Qwen/Qwen3-4B (upstream) | 4,02 B | no disponible | Apache 2.0 | safetensors | Modelo original; referencia para capacidades y contexto |
| Otras cuantizaciones GGUF de Qwen3-4B (p. ej. Qwen oficial o community) | 4,02 B | no disponible | Apache 2.0 | GGUF | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Release no oficial: debe citarse como derivado no oficial del modelo Qwen fijado en la revision 1cfa9a7208912126459214e8b04321603b3df60c, no como checkpoint oficial de Qwen.
- Sin entrenamiento adicional: no hay adaptacion de dominio, RLHF, DPO ni activation steering; las capacidades son las del modelo base.
- Sin importance matrix: la cuantizacion Q4_K_M se realizo sin imatrix, lo que puede degradar mas la calidad que cuantizaciones con imatrix en tareas sensibles.
- Perplexity no concluyente: las diferencias entre formatos son menores que la incertidumbre reportada por la herramienta (~0,175-0,177) y la muestra es de 32 pares de GSM8K; no establece ranking de capacidad ni equivalencia entre formatos.
- Paridad de tokens no implica paridad de respuestas: el autor advierte que cambios de cuantizacion y runtime pueden alterar respuestas individuales aunque los IDs de tokens de entrada coincidan.
- Modo thinking: para comparaciones con las evaluaciones incluidas es obligatorio desactivar el modo thinking de forma explicita; el modo por defecto puede diferir.
- Decodificacion greedy: las evaluaciones usan decodificacion greedy por reproducibilidad; el modelo base recomienda sampling y advierte de repeticiones con greedy.
- Sesgos y alucinaciones: no evaluados en esta release; se heredan los del modelo base Qwen3-4B, no documentados aqui.
- Idiomas: no disponibles en la informacion proporcionada; debe consultarse la model card upstream.
- Licencia Apache 2.0: permite uso comercial, pero el autor no garantiza idoneidad para ninguna aplicacion concreta ni rendimiento de seguridad.
- Sin benchmarks de capacidad: no hay datos de MMLU, HumanEval, GSM8K accuracy ni evaluaciones de robustez; no debe asumirse rendimiento en produccion sin validacion propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: release muy reciente y sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RenormalizationTech/Qwen3-4B-tuneLLM-GGUF
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del proyecto tuneLLM: https://github.com/RenormalizationTech/tuneLLM
- Paper de GSM8K (Cobbe et al., 2021): https://arxiv.org/abs/2110.14168
- llama.cpp (commit usado): https://github.com/ggml-org/llama.cpp/commit/8ca5a8008b57aa39f2601546c0d07912045080a5
