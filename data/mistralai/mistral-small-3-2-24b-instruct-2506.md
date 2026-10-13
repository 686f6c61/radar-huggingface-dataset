# mistralai/Mistral-Small-3.2-24B-Instruct-2506

## Resumen

Mistral-Small-3.2-24B-Instruct-2506 es un modelo multimodal (texto e imagen) de 24.011.361.280 parametros (aproximadamente 24B), desarrollado por Mistral AI. Se trata de una actualizacion menor del modelo previo Mistral-Small-3.1-24B-Instruct-2503, sobre el que se construye directamente (base_model: Mistral-Small-3.1-24B-Base-2503). El modelo se distribuye bajo licencia Apache 2.0 con pesos en formato safetensors y esta pensado para su despliegue en produccion mediante vLLM.

La actualizacion 3.2 se centra en tres mejoras concretas: mayor adherencia a instrucciones precisas, reduccion de errores de repeticion (generaciones infinitas o respuestas redundantes) y una plantilla de function calling mas robusta. Su relevancia inmediata para desarrolladores radica en que estas mejoras se obtienen sin cambios en el tamano ni en los requisitos de hardware respecto a la version 3.1, y con una licencia permisiva (Apache 2.0) que facilita el uso comercial.

El modelo pertenece a la familia Mistral 3 (tag mistral3) y esta registrado en HuggingFace con la libreria vllm. Acumula 253.514 descargas y 637 likes en el momento de la consulta. Su model card no especifica explicitamente la longitud de contexto en la informacion disponible, por lo que este dato se marca como no disponible mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Mistral 3, tag mistral3); densa, no MoE |
| Parametros totales | 24.011.361.280 (aprox. 24B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal (texto e imagen) de aproximadamente 24B parametros en configuracion densa, integrado en la familia Mistral 3 y compatible con la libreria mistral-common. Hereda la arquitectura y las capacidades clave de Mistral-Small-3.1-24B-Instruct-2503, segun indica la propia model card ("Key Features: same as Mistral-Small-3.1-24B-Instruct-2503"). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO.

La innovacion de esta version 3.2 no esta en la arquitectura sino en el ajuste fino de instrucciones y en la plantilla de function calling, que segun el autor es mas robusta. Se ha modificado la plantilla de instrucciones implementada en mistral-common (referencia al archivo instruct.py del repositorio). El resultado declarado es un 43,1% en Arena Hard v2 (frente al 19,56% de 3.1) y un 65,33% en Wildbench v2 (frente al 55,6% de 3.1), ademas de una reduccion a la mitad de las generaciones infinitas (del 2,11% al 1,29%) en prompts largos y repetitivos.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagenes (vision): el modelo obtiene resultados en benchmarks como MMMU, MathVista, ChartQA, DocVQA y AI2D, lo que indica capacidad para razonamiento visual, interpretacion de graficos y documentos.
- Razonamiento matematico y STEM (MATH, MMLU, MMLU Pro, GPQA).
- Generacion de codigo (MBPP Plus, HumanEval Plus).
- Function calling / tool calling: la plantilla de llamada a funciones es mas robusta en esta version; se sirve con `--tool-call-parser mistral` y `--enable-auto-tool-choice` en vLLM.
- Soporte multimodal con limite de imagenes por prompt configurable (ejemplo oficial: `--limit-mm-per-prompt '{"image":10}'`).
- Capacidades multilingues en 24 idiomas (incluido espanol, ingles, frances, aleman, portugues, italiano, chino, japones, coreano, ruso, arabe, hindi, vietnamita, turco, entre otros).
- Recomendado para uso como asistente general con un system prompt (el autor proporciona un SYSTEM_PROMPT.txt).

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con un system prompt definido, y su mejora en adherencia a instrucciones reduce desviaciones respecto a las politicas de la empresa.
- Agentes con tool calling: gracias a la plantilla de function calling mas robusta, puede orquestarse en flujos de agentes que invocan APIs externas, bases de datos o servicios de busqueda.
- Extraccion de datos de documentos: con soporte de vision y buenos resultados en DocVQA (94,86%), sirve para procesar facturas, formularios y documentos escaneados.
- Analisis de graficos e informes: su rendimiento en ChartQA (87,4%) lo hace adecuado para interpretar graficos y tablas en tareas de business intelligence.
- Generacion de codigo en produccion: los resultados en HumanEval Plus (92,90% Pass@5) y MBPP Plus (78,33% Pass@5) permiten integrarlo en asistentes de programacion y pipelines de revision de codigo, con soporte de tool calling.
- Asistentes multilingues: con 24 idiomas soportados, es apto para plataformas de soporte o contenido que operan en multiples regiones, incluido Espanol.
- Razonamiento STEM asistido: con MMLU Pro del 69,06% y MATH del 69,42%, puede usarse como apoyo en tutoria tecnica o resolucion de problemas matematicos.
- Despliegue en servidor con vLLM: al recomendar el autor un esquema servidor/cliente, encaja en backends de inferencia con tensor parallelism (ejemplo oficial con `--tensor-parallel-size 2`).

## Benchmarks y rendimiento

Resultados comparados con Mistral-Small-3.1-24B-Instruct-2503, segun la model card del autor.

Texto — instrucciones, chat y tono:

| Benchmark | Small 3.1 24B Instruct | Small 3.2 24B Instruct |
|---|---|---|
| Wildbench v2 | 55,6% | 65,33% |
| Arena Hard v2 | 19,56% | 43,1% |
| IF (interno; accuracy) | 82,75% | 84,78% |
| Infinite Generations (interno; menor es mejor) | 2,11% | 1,29% |

STEM:

| Benchmark | Small 3.1 24B Instruct | Small 3.2 24B Instruct |
|---|---|---|
| MMLU | 80,62% | 80,50% |
| MMLU Pro (5-shot CoT) | 66,76% | 69,06% |
| MATH | 69,30% | 69,42% |
| GPQA Main (5-shot CoT) | 44,42% | 44,22% |
| GPQA Diamond (5-shot CoT) | 45,96% | 46,13% |
| MBPP Plus - Pass@5 | 74,63% | 78,33% |
| HumanEval Plus - Pass@5 | 88,99% | 92,90% |
| SimpleQA (TotalAcc) | 10,43% | 12,10% |

Vision:

| Benchmark | Small 3.1 24B Instruct | Small 3.2 24B Instruct |
|---|---|---|
| MMMU | 64,00% | 62,50% |
| Mathvista | 68,91% | 67,09% |
| ChartQA | 86,24% | 87,4% |
| DocVQA | 94,08% | 94,86% |
| AI2D | 93,72% | 92,91% |

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 55 GB de RAM de GPU, segun la propia model card.
- Para el ejemplo oficial de vLLM se recomienda `--tensor-parallel-size 2`, lo que implica repartir el modelo entre dos GPU.
- GPU recomendadas: el autor no especifica modelos concretos en la informacion disponible; por el requisito de ~55 GB en bf16, se necesitarian GPU de clase A100 80GB, H100 o varias GPU de menor VRAM en tensor parallelism. No se confirma soporte en RTX 4090 en los datos proporcionados.
- Cabe en consumer GPU: no disponible en la informacion facilitada (los ~55 GB en bf16 superan la VRAM de una GPU de consumo tipica de 24 GB).
- Opciones de despliegue: vLLM (recomendado por el autor, version >= 0.9.1, con mistral-common >= 1.6.2) y transformers. No se confirma en la informacion disponible soporte oficial en llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-Small-3.2-24B-Instruct-2506 | 24,01B | no disponible | Arena Hard v2 43,1%; HumanEval Plus 92,90% Pass@5 | apache-2.0 | HuggingFace, servicio vLLM |
| Mistral-Small-3.1-24B-Instruct-2503 | 24B | no disponible | Arena Hard v2 19,56%; HumanEval Plus 88,99% Pass@5 | apache-2.0 | HuggingFace |
| Otras alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite comparar de forma fiable con la version 3.1 de la misma familia. La model card remite a los benchmarks de Mistral-Small-3.1 para comparaciones con modelos de tamano similar, pero no incluye esos datos aqui.

## Limitaciones y advertencias

- La model card reconoce explicitamente problemas de repeticion (generaciones infinitas) en la version previa; en 3.2 se reducen a la mitad (del 2,11% al 1,29%), pero no desaparecen.
- Riesgo de alucinacion: el resultado en SimpleQA es bajo (12,10% TotalAcc), lo que indica limitaciones en tareas de respuesta factual precisa.
- No se detallan sesgos conocidos en la informacion disponible.
- Longitud de contexto no especificada en la informacion facilitada; conviene verificarla antes de disenar aplicaciones que dependan de ventanas largas.
- Aunque soporta 24 idiomas, no se proporcionan metricas por idioma, por lo que el rendimiento relativo entre lenguas (incluido el Espanol) no esta cuantificado en los datos disponibles.
- Licencia apache-2.0, permisiva para uso comercial; no obstante, conviene revisar los terminos y la politica de privacidad de Mistral AI para el tratamiento de datos.
- Para produccion, el autor recomienda usar temperatura baja (por ejemplo, temperature=0.15) y anadir siempre un system prompt; su ausencia puede degradar el comportamiento.
- En vLLM se recomienda una version concreta (>= 0.9.1) y mistral-common >= 1.6.2; versiones inferiores pueden no soportar correctamente la plantilla de function calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Version previa: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Benchmarks de Mistral-Small-3.1: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503#benchmark-results
- System prompt recomendado: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506/blob/main/SYSTEM_PROMPT.txt
- vLLM: https://github.com/vllm-project/vllm
- Imagen Docker de vLLM: https://github.com/vllm-project/vllm/blob/main/Dockerfile
- mistral-common: https://github.com/mistralai/mistral-common
- Plantilla de instrucciones (instruct.py): https://github.com/mistralai/mistral-common/blob/535b4d0a0fc94674ea17db6cf8dc2079b81cbcfa/src/mistral_common/tokens/tokenizers/instruct.py#L778
- Release de mistral-common 1.6.2: https://github.com/mistralai/mistral-common/releases/tag/v1.6.2
- Release de vLLM 0.9.1: https://github.com/vllm-project/vllm/releases/tag/v0.9.1
- Web de Mistral AI: https://mistral.ai/
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
