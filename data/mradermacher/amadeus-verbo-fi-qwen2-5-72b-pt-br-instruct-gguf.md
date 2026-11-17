# mradermacher/Amadeus-Verbo-FI-Qwen2.5-72B-PT-BR-Instruct-GGUF

## Resumen
Amadeus-Verbo-FI-Qwen2.5-72B-PT-BR-Instruct-GGUF es la distribucion en formato GGUF del modelo Amadeus-Verbo-FI-Qwen2.5-72B-PT-BR-Instruct, publicado por el usuario mradermacher a partir del modelo original de amadeusai. Se trata de un ajuste fino (fine-tuning) del modelo Qwen2.5-72B-Instruct orientado especificamente al portugues (variante de Brasil), con 72.706.203.648 parametros totales y licencia Apache 2.0. El repositorio GGUF facilita la ejecucion local del modelo mediante llama.cpp y entornos compatibles, sin necesidad de infraestructura de GPU de datacenter.

El problema que resuelve es la disponibilidad de un modelo de gran tamano (72B) especializado en portugues de Brasil en formatos cuantizados ligeros, que van desde 29,9 GB (Q2_K) hasta 77,4 GB (Q8_0). Esto permite desplegar un modelo de 72B en estaciones de trabajo con VRAM limitada, algo impracticable con pesos en precision completa (fp16, que requeriria aproximadamente 145 GB).

La relevancia actual radica en la creciente demanda de modelos de alta calidad para portugues en contextos de produccion y investigacion, donde las alternativas multilingues genericas rinden peor en tareas locales. Este repositorio es una reempaquetado de cuantizaciones estaticas (no imatrix), con variantes imatrix disponibles en un repositorio hermano del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-72B-Instruct; detalles especificos del ajuste no disponibles) |
| Parametros totales | 72.706.203.648 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento
El modelo subyacente es un fine-tuning de Qwen2.5-72B-Instruct, un transformer decoder-only de 72.706 millones de parametros. La model card del repositorio GGUF no documenta la composicion del dataset de ajuste, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se detallan innovaciones tecnicas especificas del ajuste (por ejemplo, decodificacion especulativa o atencion lineal). La informacion disponible se limita a indicar que se trata de cuantizaciones estaticas del modelo original, con variantes imatrix (weighted/imatrix) publicadas en un repositorio separado (mradermacher/Amadeus-Verbo-FI-Qwen2.5-72B-PT-BR-Instruct-i1-GGUF).

Las cuantizaciones fueron generadas con quantize_version 2 y output_tensor_quantised 1, segun los metadatos embebidos en el README. El proceso de conversion parte de pesos en formato Hugging Face (convert_type: hf) y produce archivos GGUF de una o dos partes segun el tamano. No se dispone de informacion sobre la composicion del corpus de ajuste ni sobre posibles etapas de alineacion.

## Capacidades
- Generacion de texto conversacional en portugues de Brasil, heredada del ajuste sobre Qwen2.5-72B-Instruct.
- Razonamiento multi-turno y seguimiento de instrucciones (formato instruct).
- Generacion de codigo y matematicas: capacidades heredadas de Qwen2.5-72B-Instruct, aunque no verificadas especificamente para este ajuste en portugues.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este ajuste concreto.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al portugues segun la etiqueta de idioma del repositorio; no se documenta soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso
- Atencion al cliente automatizada en portugues de Brasil: el modelo puede gestionar conversaciones multi-turno en portugues con un ajuste especifico para la variante brasilena, adecuado para sectores como banca, telecomunicaciones o comercio electronico.
- Generacion de contenido editorial en portugues: redaccion de articulos, resumenes y textos de marketing con calidad de modelo de 72B, ejecutable localmente en formato Q4_K_M (47,5 GB).
- Asistencia juridica o administrativa en portugues: resumen y analisis de documentos en portugues brasileiro, aprovechando el ajuste especifico al idioma frente a modelos multilingues genericos.
- Investigacion en PLN para portugues: evaluacion de modelos de 72B en tareas de generacion y comprension en portugues, con cuantizaciones que permiten experimentar en hardware de gama alta consumer o estaciones de trabajo.
- Despliegue en entornos con VRAM limitada: uso de cuantizaciones Q2_K (29,9 GB) o Q3_K_S (34,6 GB) para inferencia en GPUs de 24-48 GB, sacrificando calidad por viabilidad.
- Prototipado rapido de aplicaciones conversacionales: integracion via llama.cpp u Ollama para pruebas de concepto en portugues sin depender de APIs externas.
- Fine-tuning posterior o destilacion: uso de las cuantizaciones de mayor calidad (Q8_0, 77,4 GB) como referencia para evaluar la degradacion por cuantizacion en tareas en portugues.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia segun cuantizacion: Q2_K ~30 GB; Q3_K_S ~35 GB; Q3_K_M ~38 GB; Q3_K_L ~40 GB; IQ4_XS ~40 GB; Q4_K_S ~44 GB; Q4_K_M ~47,5 GB; Q5_K_S ~51,5 GB; Q5_K_M ~54,5 GB; Q6_K ~64,4 GB; Q8_0 ~77,4 GB. Estas cifras corresponden al tamano de los pesos; la VRAM efectiva requiere margen adicional para el contexto KV cache.
- GPU recomendadas: A100 80 GB o H100 para Q6_K y Q8_0; A100 40 GB o 2x RTX 4090 (24 GB cada una) para Q4_K_M y Q5_K_M; RTX 4090 individual para Q2_K y Q3_K_S con contexto reducido.
- Cabe en consumer GPU: si, en configuraciones multi-GPU (por ejemplo, 2x RTX 4090 para Q4_K_M) o en GPU unica de 24 GB con cuantizaciones Q2_K/Q3_K_S y ventana de contexto limitada.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (segun los tags del repositorio), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Amadeus-Verbo-FI-Qwen2.5-72B-PT-BR-Instruct-GGUF (este) | 72,7B | no disponible | pt | Apache 2.0 | GGUF |
| Qwen2.5-72B-Instruct | 72,7B | no disponible en la informacion | multilingue | Apache 2.0 | safetensors, GGUF (via terceros) |
| Llama 3.1 70B Instruct | ~70B | no disponible en la informacion | multilingue | Llama 3.1 Community License | safetensors, GGUF (via terceros) |
| Mistral Large / Mistral 7B (referencia de categoria) | variable | no disponible en la informacion | multilingue | Apache 2.0 (7B) / comercial (Large) | safetensors, GGUF |

La comparacion directa con alternativas especializadas en portugues de 72B no esta disponible en la informacion proporcionada. Este repositorio destaca frente a Qwen2.5-72B-Instruct por su ajuste al portugues de Brasil, y frente a Llama 3.1 70B por su licencia Apache 2.0, mas permisiva para uso comercial.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible; el ajuste sobre Qwen2.5-72B-Instruct puede heredar sesgos del corpus original y del dataset de ajuste en portugues.
- Riesgo de alucinacion: inherente a modelos generativos de este tamano; no se han publicado evaluaciones especificas de factualidad para este ajuste.
- Limitaciones de contexto o idioma: el repositorio declara unicamente portugues (pt); no se garantiza rendimiento en otros idiomas. La longitud de contexto no esta documentada en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben verificarse las condiciones del modelo base Qwen2.5-72B-Instruct y del ajuste original de amadeusai.
- Caveats para produccion: las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma significativa; el autor recomienda Q4_K_S o Q4_K_M como opciones rapidas y Q6_K/Q8_0 para maxima calidad. Las cuantizaciones imatrix (mayor calidad) estan en un repositorio separado. El repositorio GGUF tiene solo 153 descargas y 0 likes, lo que indica validacion comunitaria limitada.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/Amadeus-Verbo-FI-Qwen2.5-72B-PT-BR-Instruct-GGUF
- Modelo base: https://huggingface.co/amadeusai/Amadeus-Verbo-FI-Qwen2.5-72B-PT-BR-Instruct
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Amadeus-Verbo-FI-Qwen2.5-72B-PT-BR-Instruct-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Amadeus-Verbo-FI-Qwen2.5-72B-PT-BR-Instruct-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
