# axteam/Qwen3.8-27B-AWQ-4bit

## Resumen
Qwen3.8-27B-AWQ-4bit es la cuantizacion de 4 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario axteam. Se trata de una cuantizacion post-entrenamiento (PTQ) mediante AWQ en esquema W4A16 (pesos INT4 asimetricos, activaciones en BF16), empaquetada con compressed-tensors y orientada especificamente al servicio eficiente con vLLM. El modelo conserva la torre de vision, el cabezal MTP, las RMSNorm, los embeddings y el LM head en BF16 para preservar calidad.

El modelo base es denso, multimodal (image-text-to-text), con una arquitectura hibrida que combina atencion lineal y atencion completa, e incorpora un cabezal de prediccion multi-token (MTP). Con 27.781.427.952 parametros totales (unos 27,8 mil millones) y un peso en disco de aproximadamente 20,9 GB tras la cuantizacion, esta pensado para reducir los requisitos de VRAM frente al original en BF16 (56 GB de repositorio) sin degradar de forma apreciable las metricas de razonamiento y conocimiento, segun los datos medidos por el autor.

La relevancia actual radica en que permite desplegar un modelo multimodal de ~28B en GPUs con 24-48 GB de VRAM manteniendo, segun los benchmarks publicados, una recuperacion media del 102% respecto al BF16 original en el conjunto evaluado. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal + atencion completa), denso, multimodal (vision), con cabezal MTP |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ INT4 W4A16 (grupo de 32, escala BF16 + punto cero INT4); el repositorio incluye solo esta variante |
| Idiomas soportados | No disponible (la calibracion uso un corpus mixto con fuerte presencia de coreano; los benchmarks incluyen KMMLU y HAE-RAE) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con compressed-tensors `pack-quantized` (INT4) |

## Arquitectura y entrenamiento
El modelo base Qwen/Qwen3.8-27B emplea una arquitectura hibrida que alterna capas de atencion lineal con capas de atencion completa, lo que reduce el coste computacional y de memoria del KV cache en contextos largos. Es un modelo denso (no MoE) con componentes multimodales: una torre de vision y un proyector (`model.visual.*`) que permiten la entrada de imagenes, ademas de un cabezal de prediccion multi-token (`mtp.*`) orientado a decodificacion especulativa. La familia de tags incluye `qwen3_5`, lo que sugiere una generacion de la serie Qwen 3.5.

Esta version concreta es una cuantizacion post-entrenamiento (PTQ) sin reentrenamiento: AWQ utiliza un conjunto de calibracion de 256 muestras (corpus mixto con fuerte presencia de coreano) y ajusta escalas por canal para proteger los canales de pesos mas relevantes antes del redondeo. Se mantienen en BF16 la torre de vision, el proyector, el cabezal MTP, todas las RMSNorm, los embeddings de tokens, el LM head y las partes no lineales del modulo SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`), en total aproximadamente el 12% de los parametros. El tokenizador, la `chat_template` y el `generation_config` son identicos a los del modelo original. La revision del 2026-11-01 reconstruyo el checkpoint para excluir de la normalizacion de escalas AWQ los canales cuya ganancia de norma original es cero, preservando asi la precision BF16 de las normas suavizadas; las versiones descargadas antes de esa fecha deben volver a descargarse.

## Capacidades
- Generacion de texto conversacional y razonamiento en multiples dominios (evaluado en MMLU, ARC-Challenge y Winogrande).
- Razonamiento matematico y aritmetico (evaluado en GSM8K con resultados destacados).
- Comprension de imagenes y respuestas texto-a-partir-de-imagen (pipeline `image-text-to-text`).
- Capacidades multilingues, con rendimiento medido especificamente en coreano (KMMLU, HAE-RAE) ademas de ingles.
- Decodificacion especulativa mediante cabezal MTP (multi-token prediction).
- Compatibilidad con el ecosistema vLLM y con la API OpenAI a traves del servidor de vLLM (endpoints compatibles).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente en la informacion disponible.

## Casos de uso
- Servicio de chat multimodal en produccion: el modelo acepta imagenes y texto y puede servirse con vLLM mediante una API compatible con OpenAI, lo que permite integrarlo en aplicaciones conversacionales que necesiten describir o razonar sobre imagenes con un coste de VRAM reducido (20,9 GB de pesos).
- Asistente de documentacion tecnica con imagenes: interpretacion de diagramas, capturas de pantalla o figuras junto con texto explicativo, aprovechando la torre de vision mantenida en BF16 para preservar calidad.
- Razonamiento matematico asistido: resolucion de problemas aritmeticos y de enunciado (GSM8K con 76,42 en 5-shot estricto), adecuado para herramientas educativas o de verificacion de calculos.
- Procesamiento de textos en coreano e ingles: analisis, resumen o clasificacion de contenido en ambos idiomas, dado el rendimiento medido en KMMLU y HAE-RAE.
- Despliegue en infraestructura limitada: al ocupar unos 20,9 GB en INT4, cabe en GPUs de 24 GB (por ejemplo, RTX 4090 o L4) para inferencia con contexto moderado, o en A100/H100 con mayor paralelismo y concurrencia.
- Generacion aumentada por recuperacion (RAG) multimodal: combinacion de fragmentos de texto e imagenes recuperadas para responder consultas con contexto visual, usando vLLM para gestionar peticiones concurrentes.
- Evaluacion y prototipado de investigacion: al ser una cuantizacion fiel al original (94,6% de acuerdo top-1 en el siguiente token), sirve para experimentar con un modelo de ~28B en hardware asequible antes de escalar al BF16.

## Benchmarks y rendimiento

Mediciones del autor con lm-evaluation-harness sobre vLLM, greedy, prompts estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no directamente comparable con otras metodologias. Los porcentajes indican recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 62,42 | 62,15 (99,6%) | 62,48 (100,1%) | 62,55 (100,2%) | 63,47 (101,7%) | 63,40 (101,6%) |
| GSM8K (5-shot, estricto) | 70,43 | 76,88 (109,1%) | 70,81 (100,5%) | 49,81 (70,7%) | 47,54 (67,5%) | 76,42 (108,5%) |
| ARC-Challenge (0-shot) | 58,62 | 58,36 (99,6%) | 58,79 (100,3%) | 58,70 (100,1%) | 57,76 (98,5%) | 59,56 (101,6%) |
| Winogrande (5-shot) | 79,08 | 79,56 (100,6%) | 79,32 (100,3%) | 79,48 (100,5%) | 80,03 (101,2%) | 79,72 (100,8%) |
| KMMLU (5-shot, directo) | 65,72 | 65,71 (100,0%) | 65,77 (100,1%) | 65,37 (99,5%) | 64,82 (98,6%) | 65,19 (99,2%) |
| HAE-RAE (0-shot) | 76,35 | 76,54 (100,2%) | 76,90 (100,7%) | 75,89 (99,4%) | 75,80 (99,3%) | 76,44 (100,1%) |
| Media | 68,77 | 69,87 (101,6%) | 69,01 (100,3%) | 65,30 (95,0%) | 64,90 (94,4%) | 70,12 (102,0%) |

Fidelidad respecto al original BF16 (conjunto interno mixto ingles/coreano de 100 prompts, medido con vLLM 0.32 el 2026-11-01):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,3887 | 1,3586 (+2,2%) |
| Acuerdo top-1 en el siguiente token | 94,6% | 99,4% |

## Requisitos de hardware
- VRAM estimada: pesos de 20,9 GB en INT4; hay que sumar el KV cache (crece con longitud de contexto y peticiones concurrentes) y varios GB para activaciones y grafos CUDA.
- GPUs recomendadas: NVIDIA Turing (sm75) o superior; V100 (sm70) no esta soportada. Las pruebas del autor se realizaron unicamente en B200. Para una sola GPU, A100 40/80 GB o H100 son opciones holgadas; con `--tensor-parallel-size N` se puede repartir entre varias GPUs.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 4090, por ejemplo) para inferencia con contexto moderado, dado el tamano de 20,9 GB de pesos mas el KV cache.
- Opciones de despliegue: vLLM (arquitectura soportada desde vLLM >= 0.17.0; probado con vLLM 0.32.0). Sin vLLM, se puede cargar con `transformers>=5.2.0` y `compressed-tensors>=0.15.0`. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Entorno: vLLM 0.32 requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado). No requiere `trust_remote_code`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-AWQ-4bit (este repo) | ~27,8B | No disponible | AWQ INT4 W4A16, compressed-tensors | Apache-2.0 | Multimodal, hibrido, con MTP; ~20,9 GB en disco |
| Qwen/Qwen3.8-27B (BF16) | ~27,8B | No disponible | BF16 safetensors | Apache-2.0 | Referencia de calidad; repositorio de 56 GB |
| FP8-dynamic de Qwen3.8-27B | ~27,8B | No disponible | FP8 | Apache-2.0 | Media de 69,87 en los benchmarks del autor (101,6% de recuperacion) |
| AWQ-8bit de Qwen3.8-27B | ~27,8B | No disponible | AWQ INT8 | Apache-2.0 | Media de 69,01 (100,3%); mayor peso en disco que INT4 |

No se dispone de datos de otros modelos de la misma categoria (por ejemplo, alternativas de otros fabricantes con ~28B multimodales) en la informacion proporcionada.

## Limitaciones y advertencias
- Es una cuantizacion PTQ: introduce una degradacion medible frente al BF16 (perplejidad +2,2%, acuerdo top-1 del 94,6%), aunque las metricas de tarea se mantienen o mejoran en el conjunto evaluado.
- El conjunto de calibracion tiene fuerte presencia de coreano; el comportamiento en otros idiomas, incluido el espanol, no esta medido ni documentado.
- La longitud de contexto no se especifica en la informacion disponible; el KV cache puede crecer significativamente con contextos largos y peticiones concurrentes.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones especificas de veracidad.
- Sesgos conocidos: no documentados en la informacion disponible.
- Requiere versiones muy concretas de vLLM, torch, transformers y compressed-tensors; mezclar versiones (por ejemplo, actualizar compressed-tensors por separado) puede romper la carga del checkpoint.
- Las descargas anteriores al 2026-11-01 10:28:48 UTC (revision `43b674c`) contenian un defecto de precision en las normas de la capa 7 y deben repetirse.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar el fichero LICENSE del modelo base para cualquier condicion adicional.
- Soporte de tool calling y de agentes no confirmado; verificar antes de disenar flujos que dependan de ello.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.8-27B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Repositorio de vLLM: https://github.com/vllm-project/vllm
