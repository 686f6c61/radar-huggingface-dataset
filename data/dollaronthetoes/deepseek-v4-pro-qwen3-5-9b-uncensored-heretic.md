# Dollaronthetoes/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "decensored" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". El autor de esta variante es Dollaronthetoes, que aplica la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo original mediante una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA).

El modelo base concentra su senal de entrenamiento supervisado en matematicas y resolucion de problemas STEM, con aproximadamente 250.000 muestras, preservando la eficiencia y desplegabilidad de la clase de 9B parametros. La variante heretic mantiene esas capacidades pero reduce drasticamente las negativas a responder, pasando de 100/100 rechazos en el original a 3/100 en esta version, con una divergencia KL de 0,0422 respecto al modelo base.

Es relevante ahora porque combina tres tendencias actuales: destilacion de modelos de razonamiento grandes hacia tamanos desplegables en hardware consumer, tecnicas de ablacion selectiva de comportamiento (no solo fine-tuning), y soporte multimodal image-text-to-text heredado de la arquitectura Qwen3.5. La licencia Apache 2.0 facilita su uso comercial, aunque el contenido sin censura exige controles de seguridad en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona evaluacion en NVFP4 y MTP-Q8_0) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B, un transformer denso de 9,4B parametros con capacidad multimodal image-text-to-text. El entrenamiento de destilacion se realizo a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico. Las etiquetas del repositorio indican un pipeline de SFT seguido de RL con GSPO (Group Sequence Policy Optimization). Aunque no se aportan datos especificos de codigo en el SFT, la model card reporta pequenas mejoras en programacion y uso de herramientas por transferencia entre dominios.

La innovacion principal de esta variante concreta es la aplicacion de Heretic v2.0.0.dev0 mediante Arbitrary-Rank Ablation (ARA), que opera sobre las capas 9 a 24 con los siguientes parametros: `preserve_good_behavior_weight` 0,8264, `steer_bad_behavior_weight` 0,0003, `overcorrect_relative_weight` 0,9645 y `neighbor_count` 12. Esta tecnica modifica los pesos para suprimir direcciones de activacion asociadas a rechazos, minimizando el dano colateral medido como divergencia KL (0,0422). El resultado es un modelo con comportamiento de rechazo casi eliminado (3/100) manteniendo la distribucion general de salida proxima al original.

## Capacidades

- Generacion de texto y razonamiento estructurado con descomposicion de problemas en multiples pasos.
- Razonamiento matematico y STEM reforzado por destilacion de DeepSeek-V4-Pro.
- Capacidad multimodal image-text-to-text heredada de la arquitectura Qwen3.5.
- Tool calling y function calling (etiquetas `tool-use` y `function-calling`).
- Razonamiento multi-paso orientado a agentes.
- Multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento explicito (etiqueta `reasoning`).
- Comportamiento sin censura: practicamente elimina las negativas a responder (3/100 rechazos frente a 100/100 del original).
- Transferencia cross-domain: mejoras menores en codigo y uso de herramientas sin SFT especifico de codigo.

## Casos de uso

- Tutoria matematica automatizada: el modelo puede descomponer problemas de algebra, calculo o fisica en pasos intermedios verificables, aprovechando las 250.000 muestras STEM de entrenamiento para generar soluciones detalladas con razonamiento explicito.
- Investigacion en seguridad y alineacion: al ser una variante abliterated con metricas de rechazo y KL documentadas, sirve como caso de estudio controlado para medir el efecto de la ablacion ARA sobre el comportamiento de rechazo y la calidad general.
- Generacion de codigo asistida en pipelines: soporta tool calling y function calling, lo que permite integrarlo en flujos de CI/CD o asistentes de IDE que invocan herramientas externas (ejecutores de tests, linters, APIs).
- Procesamiento de documentos tecnicos con imagen: su capacidad image-text-to-text permite extraer y razonar sobre diagramas, tablas o figuras en articulos cientificos junto al texto.
- Agentes multi-paso para tareas de analisis: con razonamiento estructurado y soporte de herramientas, puede orquestar cadenas de consultas a APIs o bases de datos para responder preguntas complejas.
- Atencion al cliente especializada en dominios tecnicos: su multilingue (en, zh, ko, ja, es, ru) y contexto conversacional permiten desplegarlo en soporte de productos cientificos o de ingenieria en varios mercados.
- Generacion de contenido sin restricciones editoriales: util en entornos de investigacion creativa o redaccion donde los filtros de rechazo interrumpen el flujo, siempre con supervision humana y politicas de uso definidas.

## Benchmarks y rendimiento

La model card solo publica metricas del proceso de decensurado, no benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia por tamano, un modelo de 9,4B en FP16 requiere aproximadamente 19 GB de pesos (el repo ocupa 19,3 GB), mas overhead de activaciones y cache KV.
- En cuantizacion de 8 bits cabria en GPUs de 24 GB (RTX 3090/4090) con contexto moderado; en 4 bits, en GPUs de 12-16 GB, aunque estas cifras son estimaciones por tamano y no datos publicados por el autor.
- GPU recomendadas: no especificadas. La model card menciona evaluacion en rutas de despliegue vLLM con NVFP4 y llama.cpp con MTP-Q8_0, lo que sugiere soporte en GPUs de datacenter (A100/H100) y en consumer de gama alta.
- Despliegue: transformers (libreria declarada), vLLM (NVFP4 evaluado), llama.cpp (MTP-Q8_0 evaluado) y text-generation-inference (etiqueta presente). Ollama no esta confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (heretic) | 9,4B | no disponible | Apache 2.0 | Razonamiento STEM destilado, sin censura | Hugging Face (0 descargas) |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 | Razonamiento STEM destilado, con censura | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Version 4B del mismo pipeline heretic | Hugging Face |
| Qwen3.5-9B (base) | ~9B | no disponible | no disponible | Modelo generalista multimodal | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de las metricas de rechazo y KL del proceso heretic.

## Limitaciones y advertencias

- Modelo sin censura: la supresion de rechazos implica que puede generar contenido inapropiado, danino o ilegal si se le solicita. Requiere moderacion externa y politicas de uso en cualquier despliegue publico.
- La ablation ARA introduce una divergencia KL de 0,0422 respecto al original, lo que puede degradar ligeramente la coherencia o la precision en tareas no relacionadas con el rechazo.
- Riesgo de alucinacion inherente a los modelos de 9B destilados; el razonamiento explicito no garantiza correccion factual.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- El autor reporta 0 descargas y 0 likes en el momento de la ficha; es un modelo recien publicado (noviembre de 2026) sin validacion comunitaria.
- Los datos de rendimiento se limitan a metricas de rechazo; no hay evidencia publicada de calidad en MMLU, HumanEval o GSM8K.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura puede entrar en conflicto con legislacion sobre contenido (por ejemplo, normativa de servicios digitales en la UE); conviene asesoramiento legal.
- Idiomas limitados a seis; no se garantiza calidad en otros.

## Enlaces

- Hugging Face: https://huggingface.co/Dollaronthetoes/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Heretic: https://heretic-project.org
