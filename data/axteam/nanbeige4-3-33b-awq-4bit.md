# axteam/Nanbeige4.3-33B-AWQ-4bit

## Resumen

Nanbeige4.3-33B-AWQ-4bit es una cuantización de 4 bits (AWQ INT4, esquema W4A16) del modelo Nanbeige4.3-33B, publicada por el usuario axteam. El modelo base es un transformer denso de arquitectura Llama con 52 capas y alrededor de 33 mil millones de parámetros nominales, aunque los pesos efectivamente almacenados en este repositorio suman 7.314.464.472 parámetros en safetensors tras la compresión. Está pensado exclusivamente para generación de texto y se distribuye bajo licencia Apache 2.0.

El objetivo de esta versión es reducir el peso en disco y en VRAM del modelo original (de aproximadamente 66 GB en BF16 a unos 22,6 GB) para facilitar su despliegue en vLLM con GPUs de gama alta de consumo o servidores de una sola tarjeta. La cuantización se aplica solo a las proyecciones de atención y MLP; embeddings, LM head y todas las RMSNorm se mantienen en BF16.

La relevancia actual radica en que permite servir un modelo de 33B en configuraciones de hardware moderadas manteniendo una fidelidad alta respecto al original: la media de benchmarks reportada es de 50,90 frente a 50,98 del BF16 (99,8 % de recuperación), con una perplejidad de 1,2777 frente a 1,2232. Es una opción práctica para equipos que ya trabajan con vLLM y quieren aprovechar el modelo base sin asumir el coste de memoria en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama, 52 capas, solo texto |
| Parametros totales | 7.314.464.472 (pesos cuantizados almacenados); modelo base nominal de ~33B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de despliegue del autor) |
| Tipos de cuantizacion | AWQ INT4 W4A16, pesos INT4 asimétricos con grupo de 32, activaciones BF16, formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (la model card incluye ejemplos y evaluación en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.3-33B es un transformer denso con arquitectura Llama de 52 capas y uso exclusivamente textual. Esta versión no reentrena el modelo: aplica cuantización post-entrenamiento (PTQ) con AWQ sobre 256 muestras de calibración, identificando los canales con mayor activación y protegiéndolos mediante escalas antes del redondeo a INT4. Se cuantizan únicamente las proyecciones de atención y MLP; los embeddings de tokens, la LM head y todas las RMSNorm permanecen en BF16.

El tokenizador, la plantilla de chat y la configuración de generación son idénticos a los del modelo original. La plantilla de chat activa por defecto el modo de razonamiento (thinking mode), que puede desactivarse con `chat_template_kwargs={"enable_thinking": False}`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con la API de OpenAI en vLLM.
- Razonamiento con modo thinking activado por defecto en la plantilla de chat, desactivable por petición.
- Razonamiento matemático: rendimiento medido en GSM8K de 84,00 (5-shot estricto), superior al BF16 original (83,70).
- Comprensión lectora y conocimiento general: evaluado en MMLU, ARC-Challenge y Winogrande.
- Capacidades multilingües parciales: evaluación en KMMLU (coreano) y HAE-RAE (coreano), además de pruebas en inglés.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el modelo es solo texto.
- Compatibilidad con text-generation-inference y endpoints compatibles según las etiquetas del repositorio.

## Casos de uso

- Servicio de chat en producción con vLLM: el modelo se despliega con `vllm serve` y expone una API compatible con OpenAI, lo que permite integrarlo en aplicaciones existentes sin cambios de cliente. Los 22,6 GB de pesos permiten servirlo en una sola GPU de 48 GB o repartirlo con tensor parallelism.
- Asistente conversacional de contexto largo: con 32.768 tokens de ventana puede mantener conversaciones multi-turno extensas o procesar documentos largos, usando `--kv-cache-dtype fp8` para reducir a la mitad la memoria de la caché KV en contextos grandes.
- Razonamiento matemático y resolución de problemas: el rendimiento en GSM8K (84,00) lo hace adecuado para tutoría automática, generación de ejercicios resueltos o verificación de cálculos en pipelines educativos.
- Procesamiento de texto en coreano e inglés: las evaluaciones en KMMLU y HAE-RAE indican utilidad para tareas de comprensión y generación en coreano, útil en atención al cliente o análisis documental para mercados de Asia Oriental.
- Inferencia offline por lotes: mediante la API de Python de vLLM (`LLM` y `SamplingParams`) se pueden procesar grandes volúmenes de prompts en batch, por ejemplo para etiquetado, resumen o clasificación de corpus.
- Despliegue en hardware de gama alta de consumo: al necesitar solo GPUs Turing (sm75) o posteriores y no requerir tensor cores especiales para INT, puede ejecutarse en tarjetas como RTX 4090 o A6000 con tensor parallelism si no cabe en una sola.
- Evaluación comparativa de cuantizaciones: el repositorio incluye resultados medidos frente a FP8, AWQ-8bit y NVFP4, lo que lo convierte en una referencia útil para decidir el esquema de cuantización en un pipeline de serving.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy y few-shot completion sin plantilla de chat. Entre paréntesis, la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 34,89 | 35,55 (101,9 %) | 35,05 (100,5 %) | 34,84 (99,9 %) | 35,28 (101,1 %) | 32,17 (92,2 %) |
| GSM8K (5-shot, strict) | 83,70 | 83,24 (99,5 %) | 82,71 (98,8 %) | 82,34 (98,4 %) | 82,03 (98,0 %) | 84,00 (100,4 %) |
| ARC-Challenge (0-shot) | 53,16 | 53,24 (100,2 %) | 53,75 (101,1 %) | 52,13 (98,1 %) | 52,99 (99,7 %) | 52,82 (99,4 %) |
| Winogrande (5-shot) | 67,48 | 66,85 (99,1 %) | 67,17 (99,5 %) | 66,30 (98,2 %) | 66,85 (99,1 %) | 67,72 (100,4 %) |
| KMMLU (5-shot, direct) | 28,46 | 27,93 (98,1 %) | 28,40 (99,8 %) | 29,71 (104,4 %) | 30,17 (106,0 %) | 29,73 (104,5 %) |
| HAE-RAE (0-shot) | 38,22 | 37,86 (99,0 %) | 37,67 (98,6 %) | 37,31 (97,6 %) | 38,31 (100,2 %) | 38,96 (101,9 %) |
| **Media** | **50,98** | **50,78 (99,6 %)** | **50,79 (99,6 %)** | **50,44 (98,9 %)** | **50,94 (99,9 %)** | **50,90 (99,8 %)** |

Fidelidad respecto al BF16 original sobre un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,2777 | 1,2232 (+4,5 %) |
| Acuerdo top-1 en el siguiente token | 93,5 % | 99,1 % |

## Requisitos de hardware

- VRAM estimada: 22,6 GB solo para los pesos; hay que añadir la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPUs recomendadas: NVIDIA Turing (sm75) o posterior. El autor probó únicamente en B200. V100 (sm70) no está soportado.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (por ejemplo RTX 4090) para contextos moderados; con contextos largos conviene usar `--tensor-parallel-size N` o `--kv-cache-dtype fp8`.
- Opciones de despliegue: vLLM (probado con la versión 0.32.0), que requiere Python 3.11–3.14, torch 2.13 con compilación CUDA 13.0, transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0. Sin vLLM, se puede usar transformers ≥4.56.0 con compressed-tensors ≥0.15.0. No requiere `trust_remote_code`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad media (benchmarks del autor) | Licencia | Formato |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-AWQ-4bit (este repo) | ~33B nominales, 7,31B almacenados | 32.768 | 50,90 | Apache 2.0 | safetensors compressed-tensors |
| Nanbeige4.3-33B BF16 (original) | ~33B | no disponible | 50,98 | Apache 2.0 | safetensors |
| Nanbeige4.3-33B FP8-dynamic | ~33B | no disponible | 50,78 | Apache 2.0 | no disponible |
| Nanbeige4.3-33B AWQ-8bit | ~33B | no disponible | 50,79 | Apache 2.0 | no disponible |
| Nanbeige4.3-33B NVFP4 | ~33B | no disponible | 50,94 | Apache 2.0 | no disponible |

Las alternativas comparadas son variantes de cuantización del mismo modelo base, no modelos de otros autores; no se dispone de información sobre modelos comparables de otros desarrolladores en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización AWQ INT4 introduce una pérdida medible de calidad: la perplejidad sube un 4,5 % y el acuerdo top-1 baja al 93,5 %, con una caída notable en MMLU (32,17 frente a 34,89, un 92,2 % de recuperación).
- El rendimiento absoluto en MMLU (34,89 en BF16) es bajo para un modelo de 33B, lo que sugiere un conocimiento general limitado y un riesgo elevado de respuestas incorrectas en tareas de cultura general.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad ni de tasas de alucinación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas: no se declara una lista oficial de idiomas soportados; las evaluaciones se centran en inglés y coreano, por lo que el rendimiento en castellano no está verificado.
- El modo thinking está activado por defecto en la plantilla de chat, lo que incrementa el consumo de tokens y la latencia si no se desactiva explícitamente.
- Requiere versiones muy concretas de software (vLLM 0.32.0, torch 2.13 con CUDA 13.0, compressed-tensors 0.17.0) y no admite GPUs V100; conviene fijar las dependencias en producción.
- Licencia Apache 2.0: permite uso comercial, pero al ser una obra derivada cuantizada conviene conservar los avisos de atribución del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Nanbeige4.3-33B-AWQ-4bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
