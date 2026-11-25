# mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF

## Resumen

Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic es un modelo de lenguaje de aproximadamente 9.200 millones de parametros (9.197.093.888 segun los pesos en safetensors) construido mediante la fusion por SLERP de dos linajes: por un lado una base Qwen3.5 (familia Qwen 3.5) y por otro destilaciones de trazas de razonamiento de Claude Opus 4.6 y 4.7 junto con DeepSeek. El autor del modelo fusionado es xtools-at y la version aqui descrita es la cuantizacion GGUF con imatrix realizada por mradermacher, publicada bajo licencia Apache 2.0.

El modelo esta orientado a tareas de razonamiento, generacion de codigo, matematicas, STEM, uso de herramientas (tool calling / function calling) y flujos de agente. Incorpora la etiqueta "heretic" / "uncensored", lo que indica que se ha aplicado un proceso de "abliteration" o decensurado para reducir los rechazos del modelo ante peticiones sensibles, un detalle relevante tanto para su evaluacion tecnica como para su uso en produccion.

Esta ficha se centra en la version cuantizada i1-GGUF (importancia-matrix) publicada por mradermacher, que ofrece un abanico de cuantizaciones desde Q2_K (4,1 GB) hasta Q6_K (7,7 GB), pensadas para ejecucion en llama.cpp y entornos de consumo. La relevancia actual radica en que permite desplegar un modelo de 9B con capacidades de razonamiento y agente en hardware de gama media, aunque con las advertencias propias de un modelo fusionado y decensurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5; fusion SLERP de dos linajes) |
| Parametros totales | 9.197.093.888 (aprox. 9,2B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; version estatica adicional en repo separado |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso derivado de la familia Qwen3.5, con aproximadamente 9,2B de parametros. El modelo final se obtiene mediante una fusion SLERP (spherical linear interpolation) de dos linajes: una base Qwen3.5 y un modelo "Wukong" que a su vez integra destilaciones de trazas de razonamiento de Claude Opus y DeepSeek. El nombre "2xMerge" indica que se combinan dos modelos, y "heretic" hace referencia al proceso de decensurado aplicado sobre el resultado.

Los datasets citados en la model card son Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces, lo que sugiere que el entrenamiento original se apoyo en trazas de razonamiento y de agente destiladas de modelos mayores. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. La version aqui descrita es la cuantizacion i1 (importance-matrix) realizada por mradermacher con llama.cpp, que aplica una matriz de importancia para preservar la calidad en cuantizaciones bajas.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento (etiqueta "reasoning") y modo de pensamiento derivado de las trazas de Claude/DeepSeek.
- Generacion de codigo (etiqueta "coding").
- Matematicas y STEM (etiquetas "math", "stem").
- Tool calling y function calling (etiquetas "tool-use", "function-calling").
- Flujos de agente y razonamiento multi-paso (etiqueta "agent").
- Capacidades multilingues en ingles, chino, espanol, ruso y japones.
- Version decensurada ("heretic"/"uncensored"), con menor tasa de rechazos ante peticiones sensibles.
- Capacidad de vision segun la model card (menciona que es un modelo de vision y que los mmproj estarian en el repo estatico), aunque no se detalla el modulo visual.

## Casos de uso

- Asistente de codigo en local: con 9,2B de parametros y cuantizaciones de 5-7 GB, se puede ejecutar en una GPU de consumo y usarse como autocompletado y generacion de codigo en editores o pipelines de CI/CD, aprovechando su soporte de tool calling.
- Razonamiento matematico y STEM en entornos educativos o de investigacion: el modelo incorpora trazas de razonamiento destiladas, lo que lo hace util para resolver problemas paso a paso en cuadernos o herramientas de analisis.
- Agentes autonomos con function calling: su etiqueta "agent" y su soporte de tool-use permiten integrarlo en frameworks de agentes (por ejemplo, orquestadores que invocan APIs) para tareas de varios pasos.
- Atencion al cliente automatizada multilingue: soporta ingles, chino, espanol, ruso y japones, lo que permite desplegar un chatbot multi-turno en varios mercados con un unico modelo cuantizado.
- Procesamiento de documentos y extraccion de informacion: su naturaleza conversacional y su capacidad de razonamiento permiten resumir y estructurar texto en pipelines de back-office.
- Prototipado rapido en hardware modesto: al ofrecer cuantizaciones desde Q2_K (4,1 GB) hasta Q6_K (7,7 GB), es adecuado para experimentar en portatiles con GPU de 8-12 GB o incluso en CPU via llama.cpp.
- Investigacion sobre decensurado y alineacion: al ser un modelo "heretic", sirve para estudiar el comportamiento de modelos con rechazos reducidos y comparar con sus versiones alineadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): i1-Q2_K ~4,1 GB; i1-Q3_K_S ~4,5 GB; i1-IQ3_M ~4,7 GB; i1-Q4_K_M ~5,9 GB; i1-Q5_K_M ~6,8 GB; i1-Q6_K ~7,7 GB. Hay que sumar el espacio para la KV cache segun la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas; A100/H100 no son necesarias para un modelo de 9B pero permiten mayor throughput y contexto.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizaciones Q3/Q4; con 12-16 GB se pueden usar Q5/Q6 con contexto amplio.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con la API de OpenAI (la etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI). vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic (i1-GGUF) | ~9,2B | no disponible | Apache 2.0 | GGUF | Fusion SLERP, decensurado, multilingue (en/zh/es/ru/ja) |
| Qwen3.5 base (familia) | ~9B (segun variante) | no disponible | Apache 2.0 (segun familia) | safetensors/GGUF | Modelo original sin fusion ni decensurado |
| Modelos 7-9B de razonamiento tipo DeepSeek-R1-Distill | 7-8B | no disponible | variable | safetensors/GGUF | Destilados de razonamiento, sin fusion SLERP |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Modelo fusionado mediante SLERP: la fusion puede degradar capacidades respecto a los modelos originales y producir comportamientos inconsistentes.
- Modelo decensurado ("heretic"/"uncensored"): reduce los rechazos ante peticiones sensibles, lo que implica riesgos de contenido inapropiado y requiere filtros adicionales en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; los modelos destilados de trazas de razonamiento tienden a generar cadenas de pensamiento plausibles pero no verificadas.
- Longitud de contexto no disponible: no se puede garantizar el rendimiento en ventanas largas.
- Idiomas: soporte declarado en en, zh, es, ru, ja; el rendimiento en espanol no esta cuantificado.
- Licencia Apache 2.0 permite uso comercial, pero las trazas de destilacion de Claude Opus y DeepSeek pueden tener implicaciones legales segun la jurisdiccion; conviene revisar los terminos de los datasets de origen.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay informacion sobre sesgos especificos ni sobre evaluaciones de seguridad.

## Enlaces

- Hugging Face (version i1-GGUF): https://huggingface.co/mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Pagina de overview del autor: https://hf.tst.eu/model#Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
