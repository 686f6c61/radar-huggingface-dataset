# axteam/gemma-4-31B-it-AWQ-8bit

## Resumen

axteam/gemma-4-31B-it-AWQ-8bit es una cuantizacion de 8 bits del modelo multimodal google/gemma-4-31B-it (commit 842da37), publicada por el usuario axteam para servir el modelo de forma eficiente con vLLM. Se trata de una derivada, no de un modelo entrenado desde cero: el autor ha aplicado AWQ en su variante INT8 (esquema W8A16, pesos simetricos de 8 bits con group size 32 y activaciones en BF16), almacenada en el formato pack-quantized de compressed-tensors. El repositorio ocupa 35,1 GB y el checkpoint en disco se declara en unos 32,7 GB.

El modelo base es un Gemma 4 de la familia Google DeepMind, con pipeline image-text-to-text, es decir, soporta entrada de imagen y texto. Segun la model card, la arquitectura se describe como "Gemma 4 · Dense", aunque el propio documento menciona que el router de MoE se mantiene en BF16, lo que introduce una ambiguedad relevante sobre si el modelo subyacente es denso o de mezcla de expertos. Los parametros totales reales leidos de los safetensors son 10.223.251.812 (aproximadamente 10,2 mil millones), una cifra que no coincide con el "31B" del nombre del repositorio ni con el nombre del modelo base, por lo que debe tratarse con cautela.

Su relevancia practica es acotada pero concreta: es una variante de servicio lista para vLLM que preserva el tokenizer, el chat_template, el processor_config y el generation_config byte a byte respecto al original, y que segun las mediciones del autor mantiene una fidelidad muy alta frente al BF16 (perplejidad 1.1127 frente a 1.1120, un 0,1 % peor, y un 99,2 % de coincidencia top-1). No dispone de descargas ni likes en el momento de la consulta y no se han publicado resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4; la model card indica "Dense", pero tambien menciona un router de MoE en BF16 (contradiccion no resuelta) |
| Parametros totales | 10.223.251.812 segun safetensors (el nombre del repo y del modelo base indican 31B; discrepancia no explicada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT8 W8A16, pesos INT8 simetricos, group size 32, activaciones BF16, formato compressed-tensors pack-quantized |
| Idiomas soportados | no disponible en metadatos; el conjunto de calibracion es mayoritariamente coreano y la evaluacion interna mezcla ingles y coreano |
| Licencia | apache-2.0 en los metadatos de HuggingFace, pero la model card remite a la Gemma 4 license de Google |
| Formato de pesos | safetensors (compressed-tensors pack-quantized) |

Otros datos del repositorio: tamano del repo 35,1 GB, tamano en disco declarado ~32,7 GB, creado el 2026-10-10, actualizado el 2026-10-10, 0 descargas y 0 likes, libreria transformers, compatible con endpoints.

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: aplica cuantizacion post-entrenamiento sobre google/gemma-4-31B-it. El esquema es AWQ INT8 en modo W8A16: los pesos se almacenan en enteros de 8 bits simetricos con un tamano de grupo de 32, mientras que las activaciones se mantienen en BF16. Se conservan sin cuantizar en BF16 el torre de vision, la proyeccion de vision, los embeddings de tokens (atados con lm_head), el router de MoE y todas las normas, que representan una fraccion pequena del total de parametros. El objetivo declarado es preservar la calidad en los componentes mas sensibles a la cuantizacion.

La calibracion se realizo con 256 muestras, mayoritariamente en coreano, de las cuales 32 son respuestas autogeneradas en modo thinking. El tokenizer, el chat_template (incluida la correccion de Google de julio de 2026), el processor_config y el generation_config son identicos byte a byte al original; el config.json es el del modelo base mas un bloque quantization_config. El autor indica que la variante de atencion cuantizada empleada es "AWQ attention". No se documentan tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO para el modelo base dentro de esta informacion, y tampoco innovaciones arquitectonicas propias mas alla del proceso de cuantizacion.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat identica a la del modelo original de Google.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que habilita tareas de vision-lenguaje.
- Modo thinking: se activa anadiendo el token `<|think|>` al inicio del prompt de sistema para habilitar razonamiento paso a paso.
- Muestreo recomendado por Google: temperature=1.0, top_p=0.95, top_k=64.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso mas alla del modo thinking: no disponible.
- Capacidades multilingues: no disponibles en los metadatos; la evaluacion y la calibracion del autor son en ingles y coreano.
- Capacidades de audio: no disponibles.

## Casos de uso

- Servicio de chat multimodal en produccion con vLLM: el modelo se puede levantar con `vllm serve axteam/gemma-4-31B-it-AWQ-8bit` y atender conversaciones que combinen imagen y texto, aprovechando que el tokenizer y la plantilla de chat son identicos a los del modelo oficial de Google.
- Razonamiento paso a paso sobre documentos e imagenes: activando `<|think|>` en el prompt de sistema, es adecuado para tareas que requieren descomposicion explicita, como interpretacion de graficos o diagramas acompanados de preguntas analiticas.
- Despliegue con restricciones de VRAM frente al BF16: al reducir el peso de los pesos a INT8, permite servir el modelo en GPUs donde la version BF16 no cabria, con una perdida de fidelidad medida de solo un 0,1 % en perplejidad.
- Evaluacion de pipelines de cuantizacion: sirve como punto de comparacion reproducible frente a otras variantes cuantizadas del mismo base (por ejemplo, alternativas AWQ o NVFP4) usando el mismo harness.
- Integracion en plataformas de endpoints compatibles: el tag endpoints_compatible y el formato compressed-tensors lo orientan a infraestructuras de inferencia gestionada que soporten vLLM.
- Prototipado de asistentes con contexto conversacional: la plantilla de chat byte-identica facilita migrar prompts ya validados sobre el modelo base sin reescribir el formato de mensajes.
- Investigacion sobre cuantizacion AWQ en modelos multimodales: la decision de mantener en BF16 la torre de vision, la proyeccion, los embeddings, el router y las normas constituye un caso de estudio sobre que componentes conviene excluir de la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor unicamente reporta metricas de fidelidad respecto al modelo BF16 original, medidas sobre un conjunto interno mixto ingles/coreano con el mismo harness aplicado a referencias publicas (cyankiwi AWQ y RedHatAI NVFP4):

| Metrica | Este modelo | Original BF16 |
|---|---|---|
| Perplejidad (menor es mejor) | 1,1127 | 1,1120 (+0,1 %) |
| Coincidencia top-1 del siguiente token | 99,2 % | 99,4 % |

El propio autor advierte que estas cifras miden fidelidad frente al modelo base, no puntuaciones absolutas de tarea. No se proporcionan numeros de las referencias externas (cyankiwi AWQ, RedHatAI NVFP4) ejecutadas con el mismo harness.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 33 GB solo para pesos (INT8), a lo que hay que sumar la cache KV y el overhead de activaciones en BF16; en la practica se recomienda contar con 40 GB o mas para contexto largo.
- GPUs recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para servir en una sola tarjeta con margen.
- Consumer GPU: no cabe en una RTX 4090 o RTX 5090 de 24 GB. Seria necesario repartir el modelo entre dos GPU consumer (por ejemplo, 2 x RTX 4090 = 48 GB) mediante tensor parallelism de vLLM.
- Opciones de despliegue: vLLM es el camino soportado explicitamente por el autor y por el formato compressed-tensors pack-quantized. El soporte en llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible.
- Tamano en disco: aproximadamente 32,7 GB segun la model card, con un repositorio de 35,1 GB.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/gemma-4-31B-it-AWQ-8bit | 10,2 B segun safetensors (nombre: 31B) | no disponible | AWQ INT8 W8A16 | apache-2.0 en metadatos / Gemma 4 license | HuggingFace, 0 descargas |
| google/gemma-4-31B-it (BF16 original) | 31B segun nomenclatura | no disponible | ninguna | Gemma 4 license | HuggingFace |
| cyankiwi AWQ (referencia publica) | no disponible | no disponible | AWQ | no disponible | citada por el autor, sin resultados publicados aqui |
| RedHatAI NVFP4 (referencia publica) | no disponible | no disponible | NVFP4 | no disponible | citada por el autor, sin resultados publicados aqui |

En el material de busqueda se mencionan como contemporaneos de la familia Gemma 4 los tamanos 31B y 26B-A4B, ademas de inclusionAI Ling 3.0 Flash y Qwen 3.6 35B, pero no se aportan especificaciones ni resultados comparables que permitan una tabla rigurosa. Se indica de forma generica que AWQ suele superar en calidad a otras alternativas al mismo ancho de bits, sin cifras de respaldo.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre del repositorio y del modelo base indican 31B, mientras que los safetensors declaran 10.223.251.812 parametros. No hay explicacion en la informacion disponible y conviene verificar el checkpoint antes de dimensionar infraestructura.
- Ambiguedad arquitectonica: la model card describe la arquitectura como "Dense" pero a la vez indica que se preserva en BF16 el router de MoE, lo que es contradictorio.
- Licencia ambigua: los metadatos de HuggingFace marcan apache-2.0, pero la model card remite a la Gemma 4 license de Google. Para uso comercial debe revisarse la licencia de Gemma 4, que impone condiciones propias a los derivados.
- Riesgo de alucinacion: no se documenta ningun ajuste especifico ni evaluacion de veracidad; al ser una cuantizacion, hereda las limitaciones del modelo base.
- Sesgos: no hay informacion sobre sesgos. El conjunto de calibracion es mayoritariamente coreano, lo que puede sesgar el comportamiento en otros idiomas tras la cuantizacion, aunque no se han publicado mediciones por idioma.
- Idiomas: los metadatos no declaran idiomas soportados. La evaluacion del autor es en ingles y coreano, por lo que el rendimiento en castellano no esta verificado.
- Contexto: no se especifica la longitud de contexto del modelo base ni si la cuantizacion la preserva; en la practica, la VRAM disponible limitara el contexto util.
- Madurez: el repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia, por lo que no cuenta con validacion de la comunidad.
- Despliegue: el formato compressed-tensors pack-quantized esta orientado a vLLM; no hay confirmacion de compatibilidad con otros motores de inferencia.
- Evaluacion parcial: las unicas metricas publicadas son perplejidad y acuerdo top-1 frente al BF16, no puntuaciones absolutas de tarea, por lo que no permiten estimar la calidad real del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-31B-it-AWQ-8bit
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Free AI Models: Licences, Hardware and the Catch (2026): https://valuestreamai.com/free-models
- Fine-Tuning LLMs: A Guide From Our Gemma 4 Case Study: https://themobilereality.com/blog/ai/fine-tuning-open-weight-llm-gemma/
- The IOL-AI Challenge (arXiv): https://arxiv.org/html/2608.18011
- Part 3: Choosing Models and Building RAG and Agent Workflows: https://vegardit.com/en/blog/running-llms-locally-models-rag-coding-agents/
- Osaurus (@OsaurusAI) en X: https://x.com/OsaurusAI
