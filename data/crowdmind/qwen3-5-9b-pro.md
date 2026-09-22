# CrowdMind/Qwen3.5-9b-pro

## Resumen

Qwen3.5-9b-pro es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-9B, publicado por CrowdMind a partir del trabajo de Dustin Loring. El checkpoint se distribuye en formato safetensors con 9.409.813.744 parametros (9,41 mil millones) y licencia MIT, e incorpora la plantilla de chat de MiMo v2.6 junto con su propio tokenizer. Su proposito declarado es mejorar el comportamiento agentico del modelo base: ejecucion de herramientas, operacion en terminal y resolucion de tareas de codigo en repositorios reales.

La relevancia del modelo esta en el salto que reporta el autor sobre el checkpoint base en pruebas orientadas a agentes: SWE Pro pasa de 32,0 a 44,6 (avg@3), Terminal Bench 2.1 de 27,0 a 37,1, Toolathlon-Verified de 25,9 a 35,2 y AutomationBench v1.0.6 de 5,0 a 30,3. Son mejoras concentradas en tareas de uso de herramientas y automatizacion, no en conocimiento general.

El modelo se sirve mediante SGLang con el parser de razonamiento `mimo` y expone un modo de pensamiento explicito activable con `enable_thinking`, que devuelve el contenido de razonamiento en el campo `reasoning_content`. La model card no detalla la longitud de contexto, los idiomas soportados ni la composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del base Qwen/Qwen3.5-9B; la model card no la detalla) |
| Parametros totales | 9.409.813.744 (9,41 mil millones), segun los pesos en safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (18,8 GB, coherente con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

Otros datos: pipeline declarado `image-text-to-text`, libreria `transformers`, relacion con el base `finetune`, plantilla de chat MiMo v2.6, repo de 18,8 GB, creado el 22 de septiembre de 2026.

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna del modelo base Qwen3.5-9B en la documentacion proporcionada (tipo de attention, uso o no de MoE, atencion lineal, decodificacion especulativa, etc.). Lo que si consta es que Qwen3.5-9b-pro es un ajuste fino por supervision (SFT) sobre ese checkpoint, que conserva su tokenizer y adopta la plantilla de chat de MiMo v2.6, y que requiere builds recientes de SGLang con soporte para Qwen3.5.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas adicionales de RLHF o DPO. Las etiquetas del repositorio indican `supervised-fine-tuning` como unico metodo de ajuste declarado, con enfasis tematico en `agentic`, `code` y `tool-use`. El modelo soporta un modo de razonamiento explicito que separa el contenido de pensamiento (`reasoning_content`) de la respuesta final.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento explicito, activable mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Uso de herramientas (tool calling / function calling), evidenciado por los resultados en Toolathlon-Verified (35,2 frente a 25,9 del base).
- Comportamiento agentico multi-paso, medido en AutomationBench v1.0.6 (30,3 frente a 5,0) y Terminal Bench 2.1 (37,1 frente a 27,0).
- Ejecucion de tareas de ingenieria de software sobre repositorios, medida en SWE Pro (44,6 avg@3).
- Tareas de ofimatica y conocimiento aplicado, medidas en OfficeQA (19,5) y JobBench (18,3).
- Entrada de imagenes: el pipeline declarado en HuggingFace es `image-text-to-text`, aunque la model card no documenta capacidades de vision ni su alcance.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Agentes de operacion en terminal: el modelo puede ejecutar y encadenar comandos de shell en flujos de administracion de sistemas o DevOps, apoyandose en su resultado de 37,1 en Terminal Bench 2.1 frente a los 27,0 del base.
- Resolucion automatica de incidencias de software: integrado en un pipeline que recibe un issue y un repositorio, el modelo puede localizar el fallo y proponer un parche, con 44,6 avg@3 en SWE Pro como referencia de partida.
- Orquestacion de herramientas externas: adecuado para agentes que deben invocar APIs, consultar bases de datos o encadenar servicios, dado su 35,2 en Toolathlon-Verified.
- Automatizacion de procesos administrativos: extraccion y sintesis de informacion en flujos de oficina (OfficeQA, 19,5) y tareas de gestion laboral (JobBench, 18,3), donde el salto respecto al base es mas pronunciado.
- Atencion al cliente automatizada: conversaciones multi-turno con modo de pensamiento activable para consultas que requieren calculo o razonamiento previo; se desconoce la ventana de contexto exacta, por lo que habria que validarla antes de desplegarlo con historiales largos.
- Asistente de codigo en el IDE o en CI/CD: generacion y revision de codigo con soporte de tool calling, integrable en pipelines que necesiten invocar linters, tests o el propio sistema de control de versiones.
- Tareas arithmeticas y de razonamiento acotado en produccion: el modo de pensamiento explicito permite separar el razonamiento del resultado, util cuando se necesita auditar como ha llegado el modelo a una respuesta (por ejemplo, calcular un porcentaje sobre un importe).

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card para el checkpoint SFT:

| Dominio | Benchmark | Metrica | Qwen3.5-9B | Qwen3.5-9b-pro (SFT) |
|---|---|---:|---:|---:|
| Codigo | SWE Pro | avg@3 | 32,0 | 44,6 |
| General | AutomationBench v1.0.6 | avg@1 | 5,0 | 30,3 |
| General | Terminal Bench 2.1 | avg@1 | 27,0 | 37,1 |
| General | Toolathlon-Verified | avg@1 | 25,9 | 35,2 |
| General | OfficeQA | avg@1 | 9,0 | 19,5 |
| General | JobBench | avg@1 | 2,6 | 18,3 |

No hay datos de MMLU, HumanEval, GSM8K ni de otros benchmarks de conocimiento general en la informacion disponible, ni verificacion independiente de las cifras anteriores.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (9,41 mil millones) y del tamano del repo (18,8 GB); la model card no publica requisitos oficiales.

- VRAM para inferencia: en bf16/fp16, aproximadamente 19-20 GB solo para pesos, mas la cache KV (que crece con la longitud de contexto, no publicada). Con cuantizacion a int8 en torno a 10-11 GB y a int4 en torno a 6-7 GB, aunque el repositorio no distribuye pesos cuantizados.
- GPU profesionales: A100 40 GB, A100 80 GB, H100, L40S o similares, donde el modelo cabe en bf16 con margen para contexto amplio y batching.
- GPU de consumo: cabe en bf16 en tarjetas de 24 GB (RTX 3090, RTX 4090) con contextos moderados; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requeriria cuantizacion.
- Opciones de despliegue: el autor recomienda SGLang con soporte para Qwen3.5 y el parser de razonamiento `mimo`. vLLM, TGI o llama.cpp/Ollama serian viables en teoria, pero no hay confirmacion de compatibilidad ni GGUF oficial publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|
| CrowdMind/Qwen3.5-9b-pro | 9,41 mil millones | no disponible | MIT | SWE Pro 44,6; Terminal Bench 2.1 37,1; Toolathlon 35,2 | safetensors en HuggingFace |
| Qwen/Qwen3.5-9B (base) | 9 mil millones (segun denominacion) | no disponible | no disponible | SWE Pro 32,0; Terminal Bench 2.1 27,0; Toolathlon 25,9 | checkpoint base del que deriva este ajuste |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre otros modelos comparables de tamano similar en la documentacion proporcionada.

## Limitaciones y advertencias

- Las cifras de benchmarks proceden unicamente de la model card del autor y no consta verificacion independiente; deben tratarse como no confirmadas.
- El ajuste es exclusivamente SFT sobre tareas de codigo, agentes y ofimatica; es plausible una degradacion en capacidades de conocimiento general, pero no hay datos que lo confirmen o descarten.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Se desconoce la longitud de contexto soportada y los idiomas cubiertos, lo que impide garantizar un comportamiento adecuado en castellano o en conversaciones largas sin una evaluacion previa.
- El soporte de vision derivado de la etiqueta `image-text-to-text` no esta documentado ni validado en la model card.
- Aunque la licencia es MIT, la del modelo base Qwen/Qwen3.5-9B no se especifica en la informacion recibida; conviene verificar los terminos de la licencia base antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe comunidad ni historial de uso que permita contrastar la calidad del checkpoint.
- No hay pesos cuantizados ni GGUF publicados, lo que limita el despliegue en hardware de gama media sin cuantizar por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CrowdMind/Qwen3.5-9b-pro
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentacion de instalacion de SGLang (requerida por el autor): https://docs.sglang.io/get_started/install.html

Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los enlaces encontrados tratan sobre normativa de pagos transfronterizos y no guardan relacion con Qwen3.5-9b-pro.
