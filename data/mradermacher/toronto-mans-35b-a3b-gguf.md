# mradermacher/Toronto-Mans-35B-A3B-GGUF

## Resumen

Toronto-Mans-35B-A3B-GGUF es la distribucion en formato GGUF del modelo Toronto-Mans-35B-A3B, un ajuste fino mediante LoRA del modelo base Qwen3.6-35B-A3B. Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, a partir del trabajo original de devon7y. El objetivo del modelo es especializar al backbone Qwen en un registro linguistico muy concreto: el ingles multicultural de Toronto, con jerga local, expresiones coloquiales y una persona conversacional definida.

El modelo conserva la arquitectura del Qwen3.6-35B-A3B original, un transformer con mezcla de expertos (MoE) de aproximadamente 34.660 millones de parametros totales, de los cuales solo una fraccion se activa por token (el sufijo A3B sugiere unos 3.000 millones de parametros activos, aunque el dato exacto no se confirma en la informacion disponible). Esta configuracion permite ejecutar un modelo de gran capacidad con un coste computacional por token comparable al de un modelo mucho mas pequeno, lo que lo hace atractivo para despliegue en hardware de gama alta de consumo.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo MoE de ~35B, una especializacion cultural muy marcada (jerga de Toronto) y una licencia Apache 2.0 que permite uso comercial. El repositorio GGUF incluye 11 cuantizaciones estaticas desde Q2_K (13,0 GB) hasta Q8_0 (37,0 GB), lo que cubre desde GPUs de 16 GB hasta estaciones de trabajo con 48 GB o mas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivado de Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | no disponible (el sufijo A3B sugiere ~3B, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles, con enfasis en ingles multicultural de Toronto) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer con capas de mezcla de expertos. La publicacion de mradermacher no detalla la configuracion interna (numero de capas, dimension oculta, numero de expertos, top-k de enrutamiento), por lo que esos datos deben consultarse en la model card del modelo base. El ajuste fino original de devon7y se realizo mediante LoRA sobre el modelo Qwen, utilizando el dataset `devon7y/toronto-slang-lexicon`, un lexico de jerga de Toronto que presumiblemente se empleo para ensenar al modelo vocabulario y expresiones locales.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste LoRA. La model card de la distribucion GGUF es puramente operativa: describe los ficheros, los tipos de cuantizacion y el tamano de cada uno, sin entrar en detalles de entrenamiento. Las cuantizaciones son estaticas (no se han publicado variantes con imatrix ni ponderadas por el autor en el momento de la ultima actualizacion), lo que implica una calidad ligeramente inferior a las cuantizaciones ponderadas en los rangos bajos, especialmente en Q2_K y Q3_K.

## Capacidades

- Generacion de texto conversacional en ingles con una persona marcada y un registro coloquial de Toronto.
- Reproduccion de jerga y expresiones locales del ingles multicultural de Toronto, segun el dataset de ajuste.
- Conversacion multi-turno orientada a chat, con etiqueta `conversational` en el repositorio.
- Capacidades heredadas del backbone Qwen3.6-35B-A3B: razonamiento, codigo y matematicas, aunque no se documentan explicitamente en esta distribucion.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su integracion en APIs compatibles con OpenAI.
- Soporte de tool calling y function calling: no disponible (no se menciona en la informacion proporcionada).
- Capacidades multimodales (vision, audio): no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales con acento cultural local: el modelo puede generar respuestas con jerga de Toronto para productos dirigidos a ese publico, gracias al ajuste LoRA sobre el lexico local.
- Investigacion sociolinguistica: util para estudiar como un LLM reproduce variantes dialectales urbanas y que sesgos introduce al hacerlo, comparando sus salidas con corpus reales.
- Generacion de contenido de ficcion ambientada en Toronto: dialogos de personajes con registro autentico local, aprovechando la persona del modelo.
- Chatbots de comunidad o soporte local: para servicios en Toronto que quieran un tono cercano y reconocible, desplegando la cuantizacion Q4_K_M en una GPU de 24 GB.
- Evaluacion de cuantizaciones: el repositorio ofrece 11 variantes, lo que permite medir la degradacion de calidad de Q2_K a Q8_0 sobre una tarea concreta de estilo y jerga.
- Fine-tuning posterior o destilacion: al estar en Apache 2.0, se puede usar como base para ajustes adicionales o como profesor en pipelines de destilacion hacia modelos mas pequenos.
- Despliegue en local con llama.cpp u Ollama: la cuantizacion Q4_K_S (20,0 GB) cabe en una RTX 4090 de 24 GB y permite inferencia offline sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~13,0 GB; Q3_K_S ~15,3 GB; Q3_K_M ~16,9 GB; Q3_K_L ~18,2 GB; IQ4_XS ~19,0 GB; Q4_K_S ~20,0 GB; Q4_K_M ~21,3 GB; Q5_K_S ~24,1 GB; Q5_K_M ~24,8 GB; Q6_K ~28,6 GB; Q8_0 ~37,0 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_S y Q4_K_M; RTX 3090 (24 GB) para las mismas; A6000 (48 GB) o A100 40/80 GB para Q6_K y Q8_0.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4 o inferiores; las Q5 y Q6 requieren 24-32 GB y pueden necesitar offload parcial en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el formato es compatible con endpoints.
- Latencia y throughput: no disponible. Al ser MoE con pocos parametros activos, se espera un throughput por token superior al de un denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|
| Toronto-Mans-35B-A3B-GGUF | ~34,66B (MoE) | no disponible | Apache 2.0 | GGUF | Especializado en jerga de Toronto |
| Qwen3.6-35B-A3B (base) | ~34,66B (MoE) | no disponible | Apache 2.0 | safetensors | Modelo generalista sin especializacion |
| Modelos densos de ~30-35B | ~30-35B | variable | variable | GGUF/safetensors | Mayor coste por token al no ser MoE |

La comparativa se limita al modelo base por falta de datos publicados de alternativas equivalentes en la informacion disponible. No se dispone de benchmarks que permitan comparar rendimiento cualitativo con otros ajustes de persona o dialecto.

## Limitaciones y advertencias

- El modelo esta disenado para ingles de Toronto; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion y de exagerar la jerga: un ajuste LoRA sobre un lexico puede producir un registro estereotipado o poco natural en contextos formales.
- Sesgos: el dataset de jerga puede reflejar estereotipos culturales de Toronto; no se documenta ninguna mitigacion.
- No hay datos de contexto maximo, parametros activos exactos ni benchmarks, lo que dificulta evaluar su idoneidad para produccion.
- Las cuantizaciones son estaticas, sin imatrix; en Q2_K y Q3_K la perdida de calidad puede ser notable.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.6-35B-A3B enlazada en la model card.
- El repositorio tiene 0 likes y 309 descargas, lo que indica validacion comunitaria muy limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Toronto-Mans-35B-A3B-GGUF
- Modelo base (ajuste LoRA): https://huggingface.co/devon7y/Toronto-Mans-35B-A3B
- Modelo Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Dataset de jerga: https://huggingface.co/datasets/devon7y/toronto-slang-lexicon
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Toronto-Mans-35B-A3B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
