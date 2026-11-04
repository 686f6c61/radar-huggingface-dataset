# Khawarr/Qwen3-4B-Instruct-2507-GGUF

## Resumen

Qwen3-4B-Instruct-2507-GGUF es una cuantizacion en formato GGUF del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, publicada por el usuario Khawarr y generada con la herramienta Unsloth. Se trata de la version actualizada del modo no-thinking de la familia Qwen3, un transformer causal denso de 4.022 millones de parametros (3.600 millones sin contar embeddings) con 36 capas y atencion GQA (32 cabezas de query, 8 de key/value). Su ventana de contexto nativa alcanza los 262.144 tokens.

El modelo base resuelve el problema de disponer de un modelo compacto con capacidades de razonamiento, codigo, matematicas y uso de herramientas muy por encima de su tamano, segun los datos publicados por Qwen. Esta version GGUF facilita el despliegue en hardware de consumo mediante llama.cpp, Ollama o motores compatibles, sin necesidad de GPU de datacenter.

El repositorio tiene un tamano de 66,2 GB, lo que sugiere que incluye multiples niveles de cuantizacion. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El modelo esta etiquetado como `endpoints_compatible` y `conversational`, y su base es el checkpoint oficial de Qwen, no un fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), 36 capas, GQA 32Q/8KV |
| Parametros totales | 4.022.468.096 (4,0B); 3,6B sin embeddings |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | GGUF (multiples niveles incluidos en el repo; niveles concretos no disponibles) |
| Idiomas soportados | no disponibles (la model card menciona mejoras en cobertura multilingue de conocimiento long-tail) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso de la familia Qwen3, con 36 capas y atencion por grupos (GQA) con 32 cabezas de query y 8 de key/value, lo que reduce el coste de memoria del KV cache frente a atencion multi-cabeza completa. Cuenta con 4.022 millones de parametros totales, de los cuales 3.600 millones corresponden a pesos no-embedding. La ventana de contexto nativa es de 262.144 tokens.

Segun la model card del modelo base, Qwen3-4B-Instruct-2507 se entrena en dos fases: preentrenamiento y postentrenamiento. Las mejoras declaradas frente a la version anterior incluyen instrucciones, razonamiento logico, comprension de texto, matematicas, ciencia, codigo y uso de herramientas, asi como alineacion con preferencias del usuario en tareas subjetivas y abiertas. El modelo opera exclusivamente en modo no-thinking: no genera bloques `<think></think>` y no requiere el parametro `enable_thinking=False`. No se dispone de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO en la informacion proporcionada.

La cuantizacion GGUF de este repositorio ha sido generada con Unsloth Dynamic 2.0, que segun el autor de la herramienta ofrece mayor precision que otras cuantizaciones lideres. No se detallan los niveles exactos de cuantizacion incluidos ni sus tamanos individuales.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo (hasta 262.144 tokens).
- Razonamiento logico y matematico: la model card reporta mejoras sustanciales en AIME25, HMMT25 y ZebraLogic frente a la version anterior.
- Generacion de codigo en multiples lenguajes: evaluado en LiveCodeBench v6, MultiPL-E y Aider-Polyglot.
- Conocimiento general y cientifico: evaluado en MMLU-Pro, MMLU-Redux, GPQA y SuperGPQA.
- Uso de herramientas (tool calling / function calling), segun los tags del repositorio y las mejoras declaradas en tool usage.
- Capacidades de agente y razonamiento multi-paso (etiqueta `endpoints_compatible`, seccion Agent en la model card del base).
- Mejora en cobertura de conocimiento long-tail en multiples idiomas.
- Alineacion mejorada en tareas subjetivas y abiertas (Arena-Hard v2, Creative Writing v3, WritingBench).
- Modo no-thinking exclusivamente: no genera bloques de razonamiento explicito.
- No se declaran capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales largos gracias a sus 262.144 tokens de contexto, manteniendo coherencia en sesiones extensas sin truncar informacion relevante.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests, con un rendimiento en LiveCodeBench v6 de 35,1 que lo situa por encima de GPT-4.1-nano en esa prueba.
- Asistentes de documentacion tecnica: su buen resultado en WritingBench (83,4) y Creative Writing v3 (83,5) lo hace adecuado para redactar guias, resumenes y documentacion de producto con calidad de texto alta.
- Razonamiento matematico y cientifico asistido: con 47,4 en AIME25 y 62,0 en GPQA, puede emplearse en tutoria o resolucion de problemas de nivel avanzado en entornos educativos o de investigacion.
- Agentes autonomos de multiples pasos: la mejora en tool usage y su compatibilidad con endpoints permiten usarlo como motor de agentes que encadenan llamadas a APIs y razonamiento sobre resultados.
- Procesamiento de documentos largos: contratos, informes o expedientes de decenas de miles de tokens pueden analizarse en una sola pasada gracias al contexto nativo de 262K, sin necesidad de chunking agresivo.
- Despliegue en local o edge: al ser un modelo de 4B en GGUF, puede ejecutarse en estaciones de trabajo con GPU de consumo o incluso en CPU, lo que facilita prototipos y entornos con requisitos de privacidad.
- Traduccion y generacion multilingue: la model card declara mejoras en cobertura multilingue long-tail, util para contenidos en idiomas menos representados.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo base Qwen3-4B-Instruct-2507:

| Benchmark | GPT-4.1-nano | Qwen3-30B-A3B Non-Thinking | Qwen3-4B Non-Thinking | Qwen3-4B-Instruct-2507 |
|---|---|---|---|---|
| MMLU-Pro | 62,8 | 69,1 | 58,0 | 69,6 |
| MMLU-Redux | 80,2 | 84,1 | 77,3 | 84,2 |
| GPQA | 50,3 | 54,8 | 41,7 | 62,0 |
| SuperGPQA | 32,2 | 42,2 | 32,0 | 42,8 |
| AIME25 | 22,7 | 21,6 | 19,1 | 47,4 |
| HMMT25 | 9,7 | 12,0 | 12,1 | 31,0 |
| ZebraLogic | 14,8 | 33,2 | 35,2 | 80,2 |
| LiveBench 20241125 | 41,5 | 59,4 | 48,4 | 63,0 |
| LiveCodeBench v6 | 31,5 | 29,0 | 26,4 | 35,1 |
| MultiPL-E | 76,3 | 74,6 | 66,6 | 76,8 |
| Aider-Polyglot | 9,8 | 24,4 | 13,8 | 12,9 |
| IFEval | 74,5 | 83,7 | 81,2 | 83,4 |
| Arena-Hard v2 | 15,9 | 24,8 | 9,5 | 43,4 |
| Creative Writing v3 | 72,7 | 68,1 | 53,6 | 83,5 |
| WritingBench | 66,9 | 72,2 | 68,5 | 83,4 |

No se han publicado resultados de benchmarks especificos para esta cuantizacion GGUF en la informacion disponible; los datos anteriores corresponden al modelo base en precision completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta para cada nivel GGUF. Como referencia, un modelo de 4B en FP16 requiere aproximadamente 8 GB solo para pesos; en cuantizaciones de 4 bits el peso se reduce a unos 2,5-3 GB, mas el KV cache.
- El KV cache con contexto completo de 262.144 tokens es muy costoso en memoria; para contextos largos se recomienda GPU con 24 GB o mas, o bien reducir la ventana efectiva.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para contexto completo. Para contextos moderados, una RTX 3060 de 12 GB o superior puede ser suficiente con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en modelos como RTX 3060, 4060 Ti, 4070, 4080 y 4090, especialmente con cuantizaciones Q4_K_M o similares.
- Opciones de despliegue: llama.cpp, Ollama, motores compatibles con GGUF y, para el modelo base en safetensors, vLLM o TGI. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 4,0B | 262.144 | Apache 2.0 | safetensors | Referencia de rendimiento completo |
| Qwen3-4B-Instruct-2507-GGUF (este) | 4,0B | 262.144 | Apache 2.0 | GGUF | Cuantizado con Unsloth Dynamic 2.0 |
| Qwen3-30B-A3B Non-Thinking | 30B (3B activos, MoE) | no disponible | Apache 2.0 | safetensors | Mayor capacidad, mayor coste |
| GPT-4.1-nano | no disponible | no disponible | propietaria | API | Comparable en benchmarks, no abierto |

En los benchmarks publicados, Qwen3-4B-Instruct-2507 supera a GPT-4.1-nano en MMLU-Pro (69,6 frente a 62,8), GPQA (62,0 frente a 50,3), AIME25 (47,4 frente a 22,7) y Arena-Hard v2 (43,4 frente a 15,9), entre otros. Frente a Qwen3-30B-A3B Non-Thinking, el modelo de 4B queda por debajo en LiveBench (63,0 frente a 59,4, donde de hecho lo supera) y en Aider-Polyglot (12,9 frente a 24,4), pero lo supera en GPQA (62,0 frente a 54,8) y ZebraLogic (80,2 frente a 33,2). No se dispone de comparativas con otros modelos GGUF de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente no-thinking: no genera bloques `<think></think>`, por lo que no es adecuado para flujos que dependan de razonamiento explicito paso a paso en la salida.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de factualidad para esta version.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible, pero al ser un modelo entrenado con datos web es probable que herede sesgos de esos datos.
- Idiomas soportados: no se detalla la lista completa; la model card menciona mejoras en conocimiento multilingue long-tail, pero no garantiza calidad uniforme en todos los idiomas.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de incluir el aviso de licencia y el texto de atribucion correspondiente.
- La cuantizacion GGUF puede degradar ligeramente la precision respecto al modelo en FP16; no se han publicado metricas de degradacion para este repositorio concreto.
- El contexto de 262.144 tokens requiere memoria considerable para el KV cache; en hardware limitado puede ser necesario truncar o usar tecnicas de atencion eficiente no documentadas aqui.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente de la cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Khawarr/Qwen3-4B-Instruct-2507-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Guia de Unsloth para Qwen3-2507: https://docs.unsloth.ai/basics/qwen3-2507
- Coleccion de Unsloth para Qwen3: https://huggingface.co/collections/unsloth/qwen3-680edabfb790c8c34a242f95
- Blog de Unsloth sobre Qwen3: https://unsloth.ai/blog/qwen3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Paper de Qwen3 (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
- Chat de Qwen: https://chat.qwen.ai
