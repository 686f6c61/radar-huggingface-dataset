# liodon-ai/baguettotron-600m-FP8

## Resumen

baguettotron-600m-FP8 es una cuantizacion en FP8 dinamico del modelo PleIAs/baguettotron-600m, publicada por Liodon AI, un laboratorio independiente de investigacion aplicada centrado en compresion de modelos (FP8, FP4, sub-4-bit, pruning y destilacion). El modelo resultante conserva los 608.273.408 parametros del original (arquitectura tipo Llama) pero reduce el peso en disco de 1,2 GB a 0,7 GB, lo que facilita su despliegue en entornos con VRAM ajustada o en servicios de inferencia de alto throughput.

La relevancia de esta publicacion es doble. Por un lado, demuestra un flujo de cuantizacion estandarizado sobre `compressed-tensors` y compatible con vLLM, TGI y SGLang. Por otro, aplica el esquema `FP8_DYNAMIC` de llm-compressor: los pesos se convierten a FP8 (formato E4M3) por canal de forma anticipada y las activaciones se cuantizan dinamicamente por token en tiempo de inferencia, sin necesidad de dataset de calibracion, lo que evita sesgos introducidos por el conjunto de calibracion.

El modelo base, PleIAs/baguettotron-600m, procede de la suite Baguettotron descrita en el articulo "It's All Training: A Fully Synthetic Single-Stage Recipe for LLMs", que propone un recetario de entrenamiento sintetico en una sola etapa. Se trata de un modelo pequeno, orientado a generacion de texto y conversacion, no a razonamiento de gran escala ni a tareas multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (segun tag `llama` en HuggingFace) |
| Parametros totales | 608.273.408 (608M) |
| Parametros activos | no disponible (no es MoE; la variante MoE existe en la familia, pero no es este checkpoint) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (`FP8_DYNAMIC`), pesos E4M3 por canal, activaciones FP8 por token; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (el articulo de la familia Baguettotron indica Apache-2.0; la model card de este checkpoint declara "other") |
| Formato de pesos | safetensors con `compressed-tensors` (FP8) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer decoder-only tipo Llama, con 608M de parametros en version densa. No hay informacion en la documentacion disponible sobre el numero de capas, dimensiones de atencion, cabezas, tipo de posicional encoding o tamano de vocabulario. El articulo asociado a la familia ("It's All Training: A Fully Synthetic Single-Stage Recipe for LLMs") describe un recetario de entrenamiento en una sola etapa sobre datos completamente sinteticos, con el conjunto Synth publicado bajo CC BY 4.0; no se detallan en la informacion proporcionada el numero exacto de tokens ni la composicion del dataset.

Sobre la cuantizacion introducida en este checkpoint, la innovacion tecnica es el uso del esquema `FP8_DYNAMIC` de llm-compressor. Al no requerir dataset de calibracion, los pesos cuantizados son una conversion directa del original a FP8, sin el sesgo que introduce un conjunto de calibracion. La capa `lm_head` se deja sin cuantizar deliberadamente: su tamano es despreciable frente al resto, pero el impacto en calidad si seria apreciable. La ejecucion real en FP8 exige GPU NVIDIA con compute capability >= 8.9 (Ada, Hopper o Blackwell); en GPUs anteriores vLLM o TGI descomprimen a otros formatos para poder ejecutar, perdiendo la ventaja de velocidad y memoria.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y los tags incluyen `conversational`.
- Razonamiento basico de pequena escala: la familia Baguettotron se entreno, segun la documentacion de terceros consultada, sobre datos ricos en senales de razonamiento, aunque no se especifica el alcance.
- Codigo y matematicas: no disponible explicitamente en la documentacion del modelo; no se confirma soporte destacado.
- Tool calling / function calling: no disponible; no se documenta soporte de llamadas a herramientas.
- Agentes y razonamiento multi-paso: no disponible; no se documenta soporte de agentes.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Eficiencia de despliegue: soporte nativo de FP8 en vLLM, TGI y SGLang, que es la capacidad diferencial de esta version frente al modelo base.

## Casos de uso

- Despliegue de bajo coste en produccion web: con 0,7 GB de pesos en FP8, el modelo cabe en cualquier GPU moderna e incluso en GPUs integradas pequeñas (en modo descomprimido), lo que permite servir generacion de texto a un coste por token muy bajo.
- Clasificacion y etiquetado de texto a gran escala: al ser un modelo de 608M, es viable ejecutarlo sobre lotes masivos de documentos para tareas de etiquetado, resumen corto o extraccion, con un throughput alto gracias a FP8 en GPUs Ada/Hopper.
- Chatbots de soporte para dominios acotados: dado su tamano, es adecuado para asistentes con contexto limitado y respuestas cortas, siempre que se valide su calidad frente al modelo base sin cuantizar.
- Prototipado rapido de pipelines NLP: su tamano permite iterar en local con vLLM en una RTX 40-series o una L4, sin necesidad de infraestructura multi-GPU.
- Generacion aumentada por recuperacion (RAG) ligera: puede actuar como generador final en un pipeline RAG donde el coste de inferencia sea critico y las respuestas no requieran razonamiento complejo.
- Educacion y experimentacion academica: sirve como banco de pruebas para estudiar el impacto real de la cuantizacion FP8 sobre un modelo pequeno, comparando contra el checkpoint original en BF16.
- Servicios edge con requisitos de memoria estrictos: el ahorro del 42% en tamano de pesos (1,2 GB a 0,7 GB) es relevante para despliegues con VRAM limitada, siempre que la GPU soporte FP8 nativo.
- Backend de inferencia en TGI o SGLang: integrable en despliegues estandarizados con un unico comando, lo que simplifica la puesta en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint cuantizado. La model card no incluye tablas de evaluacion, y no hay datos de MMLU, HumanEval, GSM8K ni metricas equivalentes para la version FP8.

Como referencia indirecta de la familia, el sitio aimodels.fyi afirma que Baguettotron se acerca al rendimiento de Qwen-0.6B en benchmarks "a pesar de tener menos de la mitad de parametros (321M frente a 600M)", gracias a una arquitectura mas profunda y a entrenamiento con datos ricos en senales de razonamiento. Esa afirmacion corresponde a una variante de menor tamano de la familia y no debe atribuirse directamente a este checkpoint de 608M; ademas, procede de una fuente secundaria y no de una evaluacion oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,7 GB. Sumando cache KV y overhead del runtime, un despliegue tipico requiere del orden de 2 a 4 GB de VRAM en funcion de la longitud de contexto y del tamano de lote.
- Ejecucion real en FP8: requiere GPU NVIDIA con compute capability >= 8.9, es decir, Ada, Hopper o Blackwell (RTX 40-series, L4/L40S, H100/H200, B100/B200/GB10).
- GPUs recomendadas: RTX 4090 o L4 para despliegues de un solo nodo con buena relacion coste/rendimiento; H100 o H200 si se busca el maximo throughput en servido por lotes.
- Compatibilidad con GPU de consumo: si. Cabe sin problemas en cualquier RTX 40-series (y en GPUs con menos VRAM) incluso en BF16; en FP8 la ejecucion nativa solo esta garantizada en Ada o superior.
- GPUs anteriores a Ada (Ampere, Turing): el modelo se puede ejecutar, pero vLLM y TGI descomprimen los pesos, con lo que se pierde el beneficio de velocidad y memoria del FP8.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/baguettotron-600m-FP8`), Text Generation Inference (imagen `ghcr.io/huggingface/text-generation-inference` con `--model-id`) y SGLang (`python -m sglang.launch_server --model-path`). No se documenta soporte en llama.cpp u Ollama para este formato `compressed-tensors`.
- Latencia y throughput estimados: no disponible. No se publican cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/baguettotron-600m-FP8 | 608M | no disponible | FP8 dinamico (0,7 GB) | other | HuggingFace, 0 descargas |
| PleIAs/baguettotron-600m (base) | 608M | no disponible | sin cuantizar (1,2 GB) | other / Apache-2.0 segun el articulo | HuggingFace |
| PleIAs/baguettotron-350M | ~321M segun aimodels.fyi | no disponible | sin cuantizar | Apache-2.0 segun el articulo | HuggingFace |
| Qwen-0.6B (referencia citada) | 600M aprox. | no disponible en la informacion consultada | multiples variantes | Apache-2.0 | HuggingFace |

La comparativa se limita a parametros, licencia y disponibilidad porque no hay datos de contexto, benchmarks ni throughput en la informacion proporcionada. El unico punto de comparacion cualitativo es la afirmacion de terceros de que la familia Baguettotron se aproxima a Qwen-0.6B con menos parametros.

## Limitaciones y advertencias

- La cuantizacion FP8 puede degradar ligeramente la calidad frente al checkpoint en BF16; no se han publicado evaluaciones que cuantifiquen esa perdida para este modelo concreto.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni evidencia de uso en produccion.
- La licencia declarada es "other", ambigua para uso comercial. El articulo de la familia Baguettotron indica Apache-2.0, pero la model card de este checkpoint no aclara los terminos; conviene verificar antes de un uso comercial.
- No se declara lista de idiomas soportados, por lo que no se puede garantizar un rendimiento aceptable en castellano ni en otros idiomas distintos de los usados en el entrenamiento.
- No se especifica la longitud de contexto, lo que impide planificar despliegues con entradas largas o conversaciones multi-turno extensas.
- No se documenta soporte de tool calling, agentes, vision ni audio.
- Al ser un modelo de 608M, es esperable un riesgo alto de alucinacion y una capacidad limitada de razonamiento en comparacion con modelos de varios miles de millones de parametros; no apto para tareas que exijan alta fiabilidad factual sin verificacion externa.
- En GPUs anteriores a Ada, el despliegue FP8 pierde su ventaja principal y el modelo se ejecuta descomprimido.
- No se documenta el tratamiento de sesgos ni se han publicado evaluaciones de seguridad o alineacion para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/baguettotron-600m-FP8
- Modelo base: https://huggingface.co/PleIAs/baguettotron-600m
- Pagina de la familia Baguettotron en HuggingFace: https://huggingface.co/PleIAs/Baguettotron
- Perfil de Liodon AI en HuggingFace: https://huggingface.co/liodon-ai
- Web de Liodon AI: https://liodon.ai/
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Articulo "It's All Training: A Fully Synthetic Single-Stage Recipe for LLMs": https://arxiv.org/html/2609.37891v1
- Ficha de Baguettotron en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/baguettotron-pleias
