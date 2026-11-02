# axteam/gemma-4-E2B-it-NVFP4A16

## Resumen

`axteam/gemma-4-E2B-it-NVFP4A16` es una cuantizacion de 4 bits del modelo multimodal `google/gemma-4-E2B-it`, publicada por el usuario axteam para servir inferencia eficiente con vLLM. El modelo base pertenece a la familia Gemma 4 de Google, con arquitectura densa y capacidad image-text-to-text (procesa imagen y texto de entrada y genera texto). El checkpoint resultante ocupa unos 7,6 GB en disco frente a los aproximadamente 15,2 GB del repositorio completo, lo que reduce a la mitad el espacio de pesos.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de cuantizacion PTQ (post-training quantization) con esquema NVFP4A16 (pesos FP4 E2M1 en grupos de 16, escalas FP8 E4M3 mas una escala global FP32, activaciones en BF16) empaquetada en formato `compressed-tensors`. Por otro, la model card incluye una advertencia relevante: la primera subida del repositorio etiquetada como AWQ era en realidad round-to-nearest por un fallo silencioso del pipeline, y fue reconstruida el 2026-11-01 aplicando de verdad el suavizado AWQ.

El modelo conserva en BF16 el vision tower, el audio tower, las proyecciones vision/audio, los embeddings de tokens y todas las normalizaciones, que representan aproximadamente el 64% de los parametros totales. Solo se cuantizan los pesos lineales de atencion y MLP. La licencia declarada es Apache-2.0, si bien la model card enlaza a la licencia especifica de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (segun model card) |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16, pesos FP4 E2M1 grupo 16, escalas FP8 E4M3 + escala global FP32, activaciones BF16); pesos no lineales en BF16 |
| Idiomas soportados | no disponible (la calibracion fue mayoritariamente en coreano) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors con `compressed-tensors` (`nvfp4-pack-quantized`), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantizacion PTQ del checkpoint `google/gemma-4-E2B-it`, un transformer denso de la familia Gemma 4 con torres de vision y audio. No se ha reentrenado ni ajustado con QAT: los pesos BF16 originales se cuantizan a FP4 tras el entrenamiento. El esquema aplica AWQ (activation-aware weight quantization) con 128 muestras de calibracion, mayoritariamente en coreano y sin respuestas en modo thinking. El suavizado AWQ se aplica a las entradas de atencion (q/k/v, con q unicamente en las capas con KV compartida), a las entradas del MLP (gate/up) y a la entrada de la down-projection. Cada par de suavizado se verifico con error de calibracion no nulo.

La reconstruccion del 2026-11-01 corrige un fallo previo: la primera subida paso por una ruta del pipeline de llm-compressor en la que el suavizado AWQ no se aplicaba, de modo que el resultado era efectivamente RTN pese a la etiqueta AWQ. Los archivos actuales aplican AWQ de verdad. Se mantienen en BF16 el vision tower, el audio tower, las proyecciones vision/audio, los embeddings de tokens (atados con lm_head), la tabla `embed_tokens_per_layer` y todas las normas, lo que supone cerca del 64% de los parametros. El tokenizer, el `chat_template` (incluida la correccion de Google de julio de 2026), el `processor_config` y el `generation_config` son identicos byte a byte a los del modelo original; `config.json` es el original mas un bloque `quantization_config`.

## Capacidades

- Generacion de texto conversacional en formato instruct (`-it`), con plantilla de chat identica a la del modelo original.
- Entrada multimodal image-text-to-text: procesa imagenes junto con texto y genera respuestas de texto.
- Torre de audio presente en el checkpoint (mantenida en BF16), lo que sugiere capacidad de entrada de audio heredada del modelo base.
- Razonamiento y matematicas basicas, con rendimiento medido en GSM8K (5-shot strict) de 48,52.
- Conocimiento general y academico medido en MMLU (5-shot) de 53,40.
- Capacidades multilingues parciales: evaluado en KMMLU (coreano) y HAE-RAE (coreano), sin datos publicados de otros idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: la calibracion excluyo respuestas en modo thinking; no se documenta soporte explicito.

## Casos de uso

- Servicio de inferencia multimodal en produccion con vLLM: el formato `compressed-tensors` `nvfp4-pack-quantized` esta pensado para vLLM, de modo que se puede desplegar como endpoint image-text-to-text reduciendo el peso en VRAM a la mitad respecto a BF16, a costa de una perdida media de calidad del 3,6% en los benchmarks medidos.
- Descripcion y analisis de imagenes en pipelines de documentos: el modelo acepta imagen y texto y devuelve texto, adecuado para extraer descripciones o responder preguntas sobre capturas y figuras en flujos automatizados donde el coste por token importa.
- Clasificacion y respuesta sobre contenido visual en entornos con GPU de gama media: al ocupar unos 7,6 GB en disco y requerir menos VRAM que la version BF16, permite servir el modelo en una sola GPU consumer de 16 GB o superior con vLLM.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio publica tablas de recuperacion frente a BF16 para FP8-dynamic, AWQ-8bit, NVFP4A16, NVFP4 y AWQ-4bit, lo que lo convierte en referencia practica para decidir el esquema de cuantizacion en un despliegue.
- Prototipado de asistentes conversacionales con contexto de imagen: la plantilla de chat corregida de julio de 2026 y el `generation_config` original permiten integrarlo en aplicaciones de chat sin reescribir el formateo de turnos.
- Despliegue en entornos con restricciones de memoria y throughput: al mantener las activaciones en BF16 y solo cuantizar pesos, se beneficia del soporte de kernels FP4 de vLLM sin requerir calibracion adicional en el servidor.
- Experimentacion con modelos Gemma 4 en investigacion: util para estudiar el impacto de la cuantizacion W4A16 en tareas multimodales, dado que el autor documenta fidelidad (perplejidad y acuerdo top-1) frente al original.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, few-shot completion sin plantilla de chat. Los porcentajes entre parentesis son la recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 55,97 | 55,49 (99,1%) | 56,25 (100,5%) | 53,40 (95,4%) | 50,06 (89,4%) | 54,57 (97,5%) |
| GSM8K (5-shot, strict) | 51,63 | 48,82 (94,6%) | 53,98 (104,6%) | 48,52 (94,0%) | 38,13 (73,9%) | 40,03 (77,5%) |
| ARC-Challenge (0-shot) | 49,57 | 48,04 (96,9%) | 49,23 (99,3%) | 48,63 (98,1%) | 45,48 (91,7%) | 44,80 (90,4%) |
| Winogrande (5-shot) | 62,59 | 60,77 (97,1%) | 62,51 (99,9%) | 61,25 (97,9%) | 58,88 (94,1%) | 60,54 (96,7%) |
| KMMLU (5-shot, direct) | 40,72 | 40,70 (100,0%) | 40,69 (99,9%) | 39,51 (97,0%) | 37,95 (93,2%) | 39,45 (96,9%) |
| HAE-RAE (0-shot) | 62,14 | 62,05 (99,9%) | 62,24 (100,1%) | 59,67 (96,0%) | 57,01 (91,7%) | 60,59 (97,5%) |
| Media | 53,77 | 52,65 (97,9%) | 54,15 (100,7%) | 51,83 (96,4%) | 47,92 (89,1%) | 50,00 (93,0%) |

Fidelidad frente al BF16 original en un conjunto interno mixto ingles/coreano de 100 prompts, medido con vLLM 0.32 el 2026-11-01 sobre los archivos reconstruidos:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,3327 | 1,1833 (+12,6%) |
| Acuerdo top-1 del siguiente token | 90,1% | 99,0% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo ocupa unos 7,6 GB en disco y mantiene activaciones BF16, por lo que se necesita margen adicional sobre ese tamano para el runtime de vLLM y la cache KV.
- GPU recomendadas: no disponible en la informacion proporcionada; el formato NVFP4 requiere soporte de kernels FP4 en vLLM, lo que en la practica apunta a GPUs recientes con esa capacidad.
- Cabe en GPU consumer: probable en tarjetas de 16 GB o mas, dado el tamano de pesos de 7,6 GB, aunque no se confirma en la documentacion.
- Opciones de despliegue: vLLM (objetivo principal declarado) y transformers; llama.cpp, Ollama y TGI no se mencionan como soportados para este formato `compressed-tensors`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparacion con otras cuantizaciones del mismo modelo base, segun los datos medidos por el autor:

| Modelo | Esquema | Media benchmark | Recuperacion vs BF16 | Formato |
|---|---|---|---|---|
| gemma-4-E2B-it (BF16) | BF16 | 53,77 | 100% | safetensors |
| AWQ-8bit | W8 | 54,15 | 100,7% | no disponible |
| **NVFP4A16 (este repo)** | W4A16 FP4 | 51,83 | 96,4% | compressed-tensors |
| AWQ-4bit | W4 | 50,00 | 93,0% | no disponible |
| NVFP4 | W4A4 FP4 | 47,92 | 89,1% | no disponible |
| FP8-dynamic | FP8 | 52,65 | 97,9% | no disponible |

Frente a modelos de otros autores del mismo tamano o tarea: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion medible de calidad: recuperacion media del 96,4% frente a BF16, con caida de 2,57 puntos en MMLU y 3,11 puntos en GSM8K; el propio autor recomienda una build de 8 bits si la calidad es prioritaria.
- Perplejidad un 12,6% superior al original y acuerdo top-1 del siguiente token del 90,1% frente al 99,0% del BF16.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados; la calibracion fue mayoritariamente en coreano, lo que puede desequilibrar el comportamiento en otros idiomas.
- Idiomas soportados no declarados; la evaluacion multilingue se limita a coreano (KMMLU, HAE-RAE).
- Longitud de contexto no disponible, lo que impide planificar cargas de contexto largo con garantias.
- Advertencia de version: si se descargo el repositorio antes del 2026-11-01 09:42:21 UTC (revision `8de762e`), los pesos son efectivamente RTN y deben descargarse de nuevo.
- Restricciones de licencia: se declara Apache-2.0, pero la model card enlaza a la licencia especifica de Gemma 4; conviene revisar sus terminos para uso comercial.
- Dependencia de vLLM con soporte de `compressed-tensors` y kernels FP4; otros runtimes pueden no cargar el checkpoint.
- El modelo base es de octubre de 2026 y la cuantizacion de noviembre de 2026; el ecosistema de herramientas puede no estar completamente adaptado.
- Solo 109 descargas y 1 like en el momento de la consulta, lo que implica poca validacion comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/axteam/gemma-4-E2B-it-NVFP4A16
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
