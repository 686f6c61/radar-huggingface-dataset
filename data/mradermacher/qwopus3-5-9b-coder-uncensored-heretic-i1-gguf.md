# mradermacher/Qwopus3.5-9B-Coder-UNCENSORED-heretic-i1-GGUF

## Resumen

Qwopus3.5-9B-Coder-UNCENSORED-heretic-i1-GGUF es una cuantizacion GGUF del modelo xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic, publicada por mradermacher. El modelo subyacente es un fine-tuning de 9.197 millones de parametros (9,2 B) construido sobre la familia Qwen 3.5, orientado a generacion de codigo, razonamiento con cadena de pensamiento, uso de herramientas y function calling. La variante "heretic/uncensored/abliterated" indica que se ha aplicado un proceso de abliteration para reducir los rechazos del modelo ante peticiones que el modelo original bloquearia.

El repositorio que nos ocupa no contiene los pesos originales en safetensors, sino un conjunto de cuantizaciones de tipo imatrix (etiquetadas como i1) generadas con llama.cpp, en el rango de Q2_K a Q6_K, con tamanos que van de 4,0 GB a 7,7 GB. Esto lo hace directamente desplegable en llama.cpp, Ollama y otros runners compatibles con GGUF, sin necesidad de GPU de datacenter.

La relevancia practica esta en que combina un tamano contenido (9,2 B), licencia Apache 2.0 y soporte declarado de tool calling y agentes, lo que permite ejecutarlo en hardware de consumo con cuantizaciones de 4-5 bits, manteniendo supuestamente capacidades de razonamiento y codigo. La model card del autor original no esta incluida en la informacion disponible, por lo que muchos detalles de entrenamiento y evaluacion quedan sin confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF imatrix i1: Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en, zh, es, ru, ja (segun metadatos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); los pesos originales estarian en el repo base del autor |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como perteneciente a la familia Qwen 3.5 (`qwen3_5`), con arquitectura transformer decoder-only de 9,2 B de parametros. El proceso de entrenamiento del modelo base incluye, segun los tags y datasets declarados, una fase de SFT sobre LoRA, con datos derivados de `lambda/hermes-agent-reasoning-traces`, `Jackrong/Claude-opus-4.7-TraceInversion-5000x` y `Jackrong/Claude-opus-4.6-TraceInversion-9000x`. Estos datasets apuntan a trazas de razonamiento orientadas a agentes y a la inversion de trazas de modelos Claude Opus, un enfoque habitual para destilar cadenas de pensamiento.

El modelo ha sido sometido a un proceso de "abliteration" (etiquetas `heretic`, `uncensored`, `decensored`, `abliterated`), que tipicamente consiste en identificar y neutralizar direcciones en el espacio de activaciones asociadas a rechazos de seguridad. No se dispone de detalles tecnicos del metodo exacto, del numero de tokens de entrenamiento ni de la composicion completa del dataset. Las cuantizaciones i1 de este repositorio se han generado con matrices de importancia (imatrix), lo que suele mejorar la calidad respecto a cuantizaciones estaticas del mismo tamano. No se han publicado innovaciones arquitectonicas adicionales en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento explicita (tag `reasoning`, `chain-of-thought`).
- Generacion y asistencia de codigo (tag `coder`).
- Soporte de tool calling y function calling (tags `tool-use`, `function-calling`).
- Orientacion a flujos de agente y razonamiento multi-paso (tag `agent`).
- Capacidades multilingues declaradas en ingles, chino, espanol, ruso y japones.
- Variante "uncensored/abliterated": menor tasa de rechazos ante peticiones que el modelo original bloquearia.
- La model card menciona que el modelo base podria ser multimodal ("This is a vision model"); los ficheros mmproj, si existen, estarian en el repositorio estatico, no en este.
- No se confirma soporte de audio ni otras modalidades.

## Casos de uso

- Asistente de codigo en local: con cuantizaciones Q4_K_M (5,9 GB) o Q5_K_M (6,7 GB) se puede desplegar en una GPU de consumo de 8-12 GB y ofrecer autocompletado y explicacion de codigo sin enviar datos a la nube.
- Agente con tool calling en pipelines internos: los tags `agent`, `tool-use` y `function-calling` permiten integrarlo en frameworks como LangChain o LlamaIndex para orquestar llamadas a APIs, consultas a bases de datos y ejecucion de comandos, con la ventaja de que el modelo corre en infraestructura propia.
- Razonamiento multi-paso con trazas: el entrenamiento sobre datasets de trazas de razonamiento (hermes-agent-reasoning-traces, TraceInversion) lo hace adecuado para tareas de descomposicion de problemas, planning y verificacion de pasos intermedios en entornos de investigacion.
- Generacion de codigo en produccion con requisitos de privacidad: al ser Apache 2.0 y ejecutable en local, encaja en entornos regulados donde no se permite enviar codigo propietario a APIs externas; se puede integrar en CI/CD para revisiones automatizadas o generacion de tests.
- Procesamiento multilingue de documentacion tecnica: con soporte declarado de en, zh, es, ru y ja, sirve para traduccion tecnica, resumen de issues y generacion de documentacion en varios idiomas.
- Experimentacion en investigacion de seguridad y alineacion: la variante abliterated permite estudiar el comportamiento del modelo sin los filtros originales, util para analisis de sesgos, robustez y evaluacion de riesgos.
- Prototipado rapido en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q2_K (4,0 GB) e IQ3_XXS permiten ejecucion en CPU con llama.cpp, aunque con perdida notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 4,0 GB (Q2_K), 4,6 GB (IQ3_S/IQ3_M), 5,6-5,9 GB (Q4_K_S/Q4_K_M), 6,7 GB (Q5_K_M), 7,7 GB (Q6_K). Hay que sumar el espacio para la cache KV, que crece con la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q6; A100/H100 solo si se busca throughput alto o contextos muy largos.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB con Q4_K_S o IQ4_XS; en 12-16 GB con Q5_K_M o Q6_K y contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que habria que usar los pesos originales en safetensors para esos runners.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.5-9B-Coder-UNCENSORED-heretic-i1-GGUF (este) | 9,2 B | no disponible | Apache 2.0 | GGUF i1 | Cuantizaciones imatrix de 4,0 a 7,7 GB; orientado a codigo, agentes y tool calling; variante abliterated |
| Qwen2.5-Coder-7B-Instruct (referencia de categoria) | 7,6 B | 32.768 tokens (tipico en la familia) | Apache 2.0 | safetensors, GGUF | Modelo de codigo ampliamente usado; sin variante abliterated oficial |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Contexto largo y ecosistema amplio; licencia con restricciones de uso |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B (2,4 B activos, MoE) | 128.000 tokens | DeepSeek License | safetensors, GGUF | Mayor capacidad pero requiere mas VRAM y licencia propia |

Los datos de contexto y rendimiento de los modelos comparables son los publicos habituales de cada familia; no se dispone de comparaciones directas de benchmarks con este modelo en la informacion proporcionada.

## Limitaciones y advertencias

- La variante "uncensored/abliterated" elimina o reduce los rechazos de seguridad del modelo original; puede generar contenido inapropiado, peligroso o ilegal si se usa sin salvaguardas externas. No es apta para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion inherente a modelos de 9 B; especialmente en tareas de codigo donde puede inventar APIs o funciones inexistentes.
- No se dispone de informacion sobre la longitud de contexto soportada ni sobre el rendimiento real en contextos largos.
- El proceso de abliteration puede degradar capacidades generales (razonamiento, instruction following) respecto al modelo original; no hay evaluaciones publicadas que cuantifiquen esta perdida.
- La model card menciona posible naturaleza multimodal, pero los ficheros mmproj no estan en este repositorio; la vision no esta garantizada con estos GGUF.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre la legalidad del contenido generado.
- Los idiomas declarados (en, zh, es, ru, ja) provienen de metadatos; no hay evaluacion publicada de calidad por idioma.
- El repositorio ocupa 81,3 GB por incluir todas las cuantizaciones; conviene descargar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwopus3.5-9B-Coder-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwopus3.5-9B-Coder-UNCENSORED-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwopus3.5-9B-Coder-UNCENSORED-heretic-i1-GGUF
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
