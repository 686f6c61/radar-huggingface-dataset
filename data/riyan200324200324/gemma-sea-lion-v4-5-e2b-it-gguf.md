# Riyan200324200324/Gemma-SEA-LION-v4.5-E2B-IT-GGUF

## Resumen

Gemma-SEA-LION-v4.5-E2B-IT-GGUF es la version cuantizada en formato GGUF del modelo Gemma-SEA-LION-v4.5-E2B-IT, desarrollado por AI Products Pillar de AI Singapore con financiacion del National Research Foundation de Singapur. Se construye sobre la arquitectura `gemma-4-E2B-it` de Google y esta disenado especificamente para lenguas y contextos del sudeste asiatico, manteniendo a la vez un rendimiento solido en ingles.

El modelo parte de una base multimodal (Transformer decoder con encoders de vision y audio) y aplica post-entrenamiento mediante destilacion de logits desde el modelo mayor `google/gemma-4-31B-it`, usando el dataset curado `aisingapore/SEA-Instruct-2602`. Con un tamano de 2,3B parametros efectivos (5,1B incluyendo embeddings) y una ventana de contexto de 128k tokens, el objetivo es ofrecer capacidades agenticas, razonamiento y tool use en entornos con recursos limitados: servidores edge, portatiles y dispositivos moviles.

Este repositorio concreto (publicado por el usuario Riyan200324200324) contiene unicamente los pesos cuantizados, no el modelo original. Es relevante porque permite desplegar el modelo en hardware de consumo mediante llama.cpp y otras herramientas compatibles con GGUF, con opciones de cuantizacion que van desde Q4_K_M (3,43 GB) hasta F16 (9,31 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con encoders de vision y audio (Gemma 4) |
| Parametros totales | 4.647.450.147 (safetensors); 2,3B efectivos / 5,1B con embeddings segun model card |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | en, zh, vi, id, th, fil, ta, ms, my (fine-tune nativo en birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita; tag de HF incluye zh) |
| Licencia | MIT (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (repo); modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `gemma-4-E2B-it`: un transformer decoder que incorpora encoders de vision y audio, lo que lo convierte en un modelo multimodal. El tokenizador es el por defecto de `gemma-4-E2B-it`. El modelo se describe como "ultra-eficiente" con 2,3B parametros efectivos y 5,1B contando embeddings, lo que sugiere tecnicas de eficiencia de parametros (el detalle exacto de dicha eficiencia no se especifica en la informacion disponible).

El entrenamiento consistio en post-entrenamiento (logit distillation y model merging) sobre el modelo base, destilando desde `google/gemma-4-31B-it` sobre el dataset `aisingapore/SEA-Instruct-2602`, descrito como actualizado y curado por humanos. El fine-tune cubre ingles y lenguas del sudeste asiatico. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en ingles y lenguas del sudeste asiatico (birmano, indonesio, filipino, malayo, tamil, tailandes, vietnamita).
- Capacidades multimodales: vision y audio, heredadas de la arquitectura Gemma 4 (se requiere el fichero `mmproj` para vision/audio en llama.cpp).
- Soporte nativo de system prompt y estados de razonamiento/thinking configurables (`enable_thinking`).
- Capacidades agenticas y de tool use, segun la model card ("premium-tier agentic capability, reasoning, and tool-use").
- Contexto largo de 128k tokens para parsing de documentos, busqueda local y conversaciones multi-turno extensas.
- Capacidad de razonamiento multi-paso (multi-step reasoning) implicita en el modo thinking configurable.

## Casos de uso

- Atencion al cliente multilingue en el sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandes o vietnamita con contexto de hasta 128k tokens, adecuado para historiales largos de cliente.
- Despliegue en edge y dispositivos moviles: con cuantizacion Q4_K_M (3,43 GB) puede ejecutarse en portatiles y servidores edge mediante llama.cpp, sirviendo como asistente local sin conexion.
- Procesamiento de documentos largos: la ventana de 128k tokens permite resumir, extraer informacion y responder preguntas sobre contratos o informes extensos en lenguas SEA.
- Agentes automatizados con tool calling: integrable en pipelines agenticos que requieran invocar APIs, buscar en bases de datos o ejecutar acciones multi-paso en entornos con recursos limitados.
- Traduccion y localizacion: traduccion entre ingles y lenguas del sudeste asiatico (birmano, filipino, tamil, etc.) en flujos de localizacion de productos.
- Asistencia multimodal: con el fichero `mmproj` correspondiente, procesamiento de imagenes y audio para tareas como descripcion de imagenes o transcripcion contextualizada en lenguas SEA.
- Prototipado e investigacion: al ser MIT y caber en hardware de consumo, sirve para experimentacion academica con modelos multilingues sin acceso a GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): Q4_K_M ~3,43 GB, Q6_K ~3,85 GB, Q8_0 ~4,97 GB, F16 ~9,31 GB (mas overhead de contexto KV cache, que crece con la ventana usada).
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090; para contexto largo de 128k se requiere VRAM adicional significativa.
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M a Q8_0 en GPUs con 6-8 GB o mas, dependiendo de la longitud de contexto.
- Opciones de despliegue: llama.cpp (`llama-server`), y por compatibilidad GGUF, herramientas como Ollama o LM Studio (no confirmadas explicitamente en la model card). El repo incluye tag `endpoints_compatible`.
- Vision/audio: requiere el fichero `mmproj-Gemma-SEA-LION-v4.5-E2B-IT-F16.gguf` adicional para llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-SEA-LION-v4.5-E2B-IT (este, GGUF) | 2,3B efectivos / 5,1B con embeddings | 128k | MIT | GGUF | Multimodal, especializado en SEA |
| aisingapore/Gemma-SEA-LION-v4.5-E2B-IT (original) | 2,3B efectivos / 5,1B con embeddings | 128k | MIT | safetensors | Modelo base sin cuantizar |
| google/gemma-4-31B-it | 31B (no disponible detalle) | no disponible | licencia Gemma 4 | no disponible | Modelo profesor de la destilacion |
| google/gemma-4-E2B-it | 2,3B efectivos (no disponible detalle) | no disponible | licencia Gemma 4 | no disponible | Modelo base de arquitectura |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; los desarrolladores deben aplicar su propio fine-tuning de seguridad y medidas de proteccion.
- No se ha probado la robustez frente a prompting adversarial.
- Riesgo de alucinacion: como otros LLM, puede generar contenido irrelevante o ficticio no fundamentado en el contexto.
- Puede presentar inconsistencias en las respuestas que requieren validacion por parte del usuario.
- La licencia del repo es MIT, pero el modelo base remite a la licencia de Gemma 4 de Google (`license_link`), lo que puede imponer condiciones adicionales al uso comercial; conviene revisar ambas.
- Este repositorio es una cuantizacion de terceros (usuario Riyan200324200324), no el repo oficial de AI Singapore; la calidad de la cuantizacion no esta garantizada por el autor original.
- El fine-tune nativo cubre birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita; el tag de HF incluye chino, pero la model card no lo menciona como lengua de fine-tune.
- El rendimiento en lenguas no incluidas en el fine-tune puede ser inferior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Riyan200324200324/Gemma-SEA-LION-v4.5-E2B-IT-GGUF
- Modelo base (original): https://huggingface.co/aisingapore/Gemma-SEA-LION-v4.5-E2B-IT
- Modelo profesor: https://huggingface.co/google/gemma-4-31B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Licencia del modelo base: https://ai.google.dev/gemma/docs/gemma_4_license
- Licencia MIT: https://mit-license.org/
- Contacto AI Singapore: sealion@aisingapore.org
