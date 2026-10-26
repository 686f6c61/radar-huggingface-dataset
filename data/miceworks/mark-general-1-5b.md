# miceworks/Mark-General-1.5B

## Resumen

`miceworks/Mark-General-1.5B` es un repositorio alojado en HuggingFace por el usuario u organizacion `miceworks`, publicado bajo licencia AGPL-3.0 y etiquetado con region `us`. Por el nombre se deduce que se trata de un modelo de aproximadamente 1.500 millones de parametros, pero esta deduccion no viene confirmada por ninguna documentacion tecnica: la model card asociada contiene unicamente el bloque de metadatos de licencia, sin descripcion, sin arquitectura declarada, sin tokenizador documentado y sin indicacion de los datos de entrenamiento.

El repositorio no ofrece informacion sobre el pipeline de inferencia, los idiomas soportados, la longitud de contexto ni los formatos de pesos disponibles. En el momento de la consulta registra 0 descargas y 0 likes, y la fecha de creacion y de ultima actualizacion coinciden (26 de octubre de 2026), lo que sugiere una publicacion sin iteraciones posteriores ni mantenimiento visible.

La busqueda web realizada no devuelve ningun resultado relacionado con este modelo concreto: los enlaces encontrados corresponden a GEN-1.5 de Generalist AI, un modelo fundacional de robotica completamente distinto, sin relacion con `miceworks/Mark-General-1.5B` pese a la coincidencia parcial del nombre. Por tanto, esta ficha se limita a documentar lo verificable y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no declarada en la model card) |
| Parametros totales | no disponible; el sufijo "1.5B" del nombre sugiere ~1,5 mil millones, sin confirmacion oficial |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (no se documenta safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

No disponible. La model card publicada en el repositorio se reduce al bloque de frontmatter con la licencia AGPL-3.0 y no incluye ninguna referencia a la arquitectura (transformer, MoE, hibrida o SSM), al numero de tokens de entrenamiento, a la composicion del dataset ni a posibles fases de alineacion como RLHF, DPO o RLVR. Tampoco se documentan innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

No existe informacion publica sobre el proceso de entrenamiento en los resultados de busqueda disponibles. Cualquier afirmacion sobre la naturaleza del modelo (por ejemplo, que sea un modelo causal de lenguaje de proposito general) seria una suposicion basada unicamente en el nombre del repositorio y no debe tomarse como dato contrastado.

## Capacidades

- Generacion de texto: no confirmada; no hay model card que describa tareas soportadas.
- Razonamiento, matematicas y codigo: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta cumplimentado en el repositorio).
- Capacidades multimodales (vision, audio): no disponible; el tag de pipeline no esta definido.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

Los siguientes escenarios son plantillas de aplicacion para un modelo de ~1,5B parametros de tipo LM causal. **Deben validarse contra el comportamiento real del modelo antes de cualquier uso en produccion**, dado que el autor no documenta capacidades.

- Clasificacion y etiquetado de texto a escala: un modelo de ~1,5B puede ejecutarse en una sola GPU de consumo y procesar grandes volumenes de documentos para tareas de categorizacion, siempre que se valide previamente su calidad en el dominio objetivo.
- Extraccion de entidades y estructuracion de datos: uso como extractor de campos en pipelines ETL, con salida forzada a JSON mediante gramaticas (outlines, llguidance) en lugar de confiar en el formato libre.
- Aplicaciones de escritorio y edge: su tamano reducido permitiria despliegue local en portatiles con GPUs de 8 GB o incluso en CPU, util para asistentes ofimaticos con requisitos de privacidad estrictos.
- Generacion aumentada por recuperacion (RAG) ligera: como generador final en sistemas documentales donde el contexto recuperado sea corto, evitando modelos mayores por coste o latencia.
- Filtrado y preprocesado en pipelines de datos: tareas de deduplicacion semantica, puntuacion de calidad o filtrado de contenido antes de alimentar modelos mayores.
- Fine-tuning especifico de dominio: base para ajuste supervisado (SFT) o LoRA en tareas acotadas, ya que el coste de reentrenamiento de un modelo de este tamano es bajo.
- Prototipado e investigacion: banco de pruebas para experimentos de alineacion o evaluacion de tecnicas de inferencia eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra suite, y la busqueda web no aporta datos asociados a este modelo. Los resultados encontrados en la busqueda corresponden a GEN-1.5 de Generalist AI, un modelo de robotica sin relacion con este repositorio, por lo que no son extrapolables.

## Requisitos de hardware

Estimaciones derivadas del supuesto de ~1,5B parametros (no confirmado por el autor):

- VRAM para inferencia en FP16/BF16: aproximadamente 3,0-3,5 GB solo de pesos; con cache KV para 8.192 tokens, en torno a 4-6 GB dependiendo de la arquitectura.
- VRAM en INT8: aproximadamente 1,5-2 GB de pesos; en INT4: aproximadamente 0,8-1,2 GB.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; tambien en GPUs de 8 GB en cuantizaciones de 8 o 4 bits.
- GPU de datacenter: A100, H100 y L40S estan sobredimensionadas para un unico modelo de este tamano; son utiles para servir muchas replicas en paralelo con vLLM o TGI.
- CPU: inferencia viable en x86 moderno con llama.cpp en cuantizacion Q4, con throughput del orden de decenas de tokens por segundo en funcion del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, **condicionado a que el repositorio contenga pesos en safetensors o GGUF**, extremo que no se puede verificar con la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No hay datos publicados de `miceworks/Mark-General-1.5B` (ni contexto, ni benchmarks, ni idiomas) que permitan una comparacion tecnica real. La siguiente tabla recoge unicamente las especificaciones publicas de alternativas del mismo orden de magnitud, a modo de referencia de categoria; los datos de los modelos comparados provienen de sus fichas publicas y no de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Estado de documentacion |
|---|---|---|---|---|
| miceworks/Mark-General-1.5B | ~1,5B (inferido del nombre) | no disponible | AGPL-3.0 | Model card vacia; 0 descargas; sin benchmarks |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens (ampliable con YaRN) | Apache-2.0 | Model card completa y benchmarks publicados |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache-2.0 | Model card completa y benchmarks publicados |
| Gemma 2 2B | 2,6B | 8.192 tokens | Terminos de uso de Gemma | Model card completa y benchmarks publicados |

Advertencia: la licencia AGPL-3.0 de `Mark-General-1.5B` es sustancialmente mas restrictiva para integracion en productos comerciales que las licencias Apache-2.0 de las alternativas citadas, incluso aunque el modelo fuera tecnicamente equivalente.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe arquitectura, datos, tokenizador ni limitaciones. Esto impide evaluar sesgos, calidad o idoneidad para cualquier caso de uso.
- Imposibilidad de verificar la existencia de pesos: el repositorio puede contener solo la licencia u otros ficheros no relacionados con un modelo entrenado. Conviene inspeccionar el arbol de ficheros antes de cualquier intento de uso.
- Riesgo de alucinacion: desconocido, pero inherente a cualquier modelo de lenguaje; sin evaluaciones publicadas no se puede acotar.
- Sesgos: no documentados. Al no conocerse la composicion del dataset de entrenamiento, no es posible estimar sesgos de genero, etnia, idioma o dominio.
- Cobertura idiomatica: el campo de idiomas no esta cumplimentado; no hay garantia de rendimiento en castellano ni en ningun otro idioma.
- Restricciones de licencia: AGPL-3.0 obliga a liberar el codigo fuente de las obras derivadas que se distribuyan o se ofrezcan como servicio en red. Esto incluye, en interpretaciones habituales, exponer el codigo de una aplicacion SaaS que sirva el modelo. Es incompatible con productos propietarios cerrados sin una licencia alternativa del titular.
- Reputacion del publicador: sin descargas, sin likes, sin historial de modelos previos verificable y sin enlaces a paper o blog. El repositorio debe considerarse no auditado.
- Riesgo de seguridad: pesos de origen no verificado pueden contener comportamiento malicioso o puertas traseras; se recomienda analisis en sandbox y revision de ficheros pickle si los hubiera.
- Confusion de nombres: no confundir este repositorio con GEN-1.5 de Generalist AI, un modelo fundacional de robotica sin ninguna relacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/miceworks/Mark-General-1.5B
- Modelo GEN-1.5 de Generalist AI (sin relacion con este repositorio, citado en la busqueda): https://theaiinsider.tech/2026/08/22/generalist-ai-releases-gen-1-5-robot-foundation-model-that-learns-from-a-single-demonstration/
- Cobertura de GEN-1.5 en tbreak: https://tbreak.com/generalist-ai-gen-1-5-robot-foundation-model/
- Cobertura de GEN-1.5 en TechTimes: https://www.techtimes.com/articles/325174/20260821/generalist-ai-gen-15-learns-new-robot-tasks-single-demo-no-retraining.htm
- Video de presentacion de GEN-1.5 (YouTube): https://www.youtube.com/watch?v=1cllCVK-9lo
- Guia general de modelos open source 2026 (referencia de contexto, no especifica de este modelo): https://aiunpacking.com/guides/open-source-ai-models-2026-llama-mistral-deepseek/
- Paper, blog tecnico, repositorio de codigo y demo de `Mark-General-1.5B`: no disponibles.
