# QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4

## Resumen

Qwen3.8-27B-QUASAR-NVFP4 es una version cuantizada a 4 bits en formato NVFP4 del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por QUASAR-QAT mediante una tecnica de entrenamiento consciente de la cuantizacion (QAT) denominada QUASAR. El modelo resuelve el problema de desplegar un modelo de 27.781 millones de parametros con capacidades de vision y razonamiento en GPUs Blackwell, reduciendo el peso de 55,6 GB en BF16 a 19,7 GB sin una perdida significativa de calidad.

La innovacion principal es que se cuantizan las 496 capas lineales del transformer a NVFP4 en modo W4A4 (pesos y activaciones a 4 bits), incluyendo atencion y gated delta-net, manteniendo un rendimiento cercano al modelo original: 90,91 en GPQA-Diamond frente a 91,41 del BF16. Frente a otras builds publicas NVFP4 del mismo modelo base, es la mas pequena y la que obtiene mejores puntuaciones.

Es relevante ahora porque permite servir un modelo de razonamiento multimodal con contexto largo (hasta 262.144 tokens) en una sola GPU Blackwell, con soporte directo en vLLM sin pasos de conversion y con decodificacion especulativa MTP integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8) con atencion y gated delta-net, cuantizado NVFP4 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (recomendado 65.536 en GPU de 32 GB) |
| Tipos de cuantizacion | NVFP4 (W4A4), 4 bits; el autor menciona tambien variantes de 8 bits en los tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors) |
| Tamano del repo | 22,8 GB (pesos NVFP4: 19,7 GB) |
| Lineales en NVFP4 | 496/496 |
| Hardware requerido | NVIDIA Blackwell (compute capability 10.0+) con soporte FP4 |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal con pipeline image-text-to-text que incorpora mecanismos de atencion estandar y gated delta-net, ademas de soporte para decodificacion especulativa mediante multi-token prediction (MTP). La cuantizacion NVFP4 se aplica a la totalidad de las 496 capas lineales del transformer, incluyendo las de atencion y las de gated delta-net, en un esquema W4A4.

El entrenamiento consistio en una epoca de destilacion consciente de la cuantizacion (loss-aware NVFP4 QAT) contra el modelo BF16 congelado como profesor, con batch global de 32, tasa de aprendizaje de 1e-6 y 2.446 pasos. El metodo QUASAR, descrito en el paper arXiv:2608.13966, entrena los pesos NVFP4 directamente contra el modelo BF16 y exporta pesos NVFP4 estandar sin ruta de inferencia personalizada, lo que permite servir el modelo con vLLM de forma nativa.

## Capacidades

- Generacion de texto y razonamiento avanzado, incluyendo modo thinking (parser `qwen3` en vLLM).
- Procesamiento multimodal image-text-to-text: entrada de imagenes junto con texto.
- Razonamiento matematico de competicion (AIME'26, HMMT'26) y cientifico (GPQA-Diamond, SuperGPQA).
- Generacion de codigo (LiveCodeBench).
- Contexto largo con recuperacion multi-needle (MRCR, RULER hasta 128K).
- Soporte de tool calling / function calling (parser `qwen3_xml`, `--enable-auto-tool-choice`).
- Capacidades agenticas y razonamiento multi-paso.
- Decodificacion especulativa mediante MTP (`num_speculative_tokens: 2`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento cientifico asistido: el modelo mantiene 90,91 en GPQA-Diamond, por lo que puede emplearse en tareas de nivel posgrado en fisica, quimica y biologia con una perdida de 0,5 puntos respecto al BF16, a un tercio del peso.
- Analisis de documentos e imagenes: al ser image-text-to-text, permite extraer y razonar sobre contenido de capturas, graficos o diagramas en pipelines de document understanding.
- Agentes con tool calling: la combinacion de `--enable-auto-tool-choice`, parser `qwen3_xml` y contexto de 262.144 tokens permite construir agentes que encadenan llamadas a herramientas manteniendo historiales largos.
- Generacion de codigo en produccion: con 79,2 en LiveCodeBench, es adecuado para autocompletado, revision de PRs y generacion de tests dentro de pipelines de CI/CD servidos con vLLM.
- Recuperacion sobre corpus extensos: los resultados RULER (96,3 a 32K, 95,8 a 128K) lo hacen apto para RAG con ventanas muy largas o analisis de repositorios completos.
- Despliegue en una sola GPU Blackwell: sus 19,7 GB permiten servirlo en una RTX 5090 con contexto de 65.536 tokens, habilitando prototipos y entornos de desarrollo sin clúster multi-GPU.
- Evaluacion comparativa de cuantizaciones: sirve como referencia de calidad para validar otras builds NVFP4 frente al BF16 original.

## Benchmarks y rendimiento

Comparativa de builds NVFP4 del mismo modelo base (GPQA-Diamond: 2 ejecuciones, n=396; AIME'26: 3 repeticiones, n=90):

| Modelo | Tamano | Lineales NVFP4 | GPQA-D | AIME'26 |
|---|---:|---:|---:|---:|
| QUASAR (este modelo) | 19,7 GB | 496/496 | 90,91 | 100,0 |
| BF16 original | 55,6 GB | — | 91,41 | 100,0 |
| Unsloth NVFP4 | 23,4 GB | 168/496 | 89,39 | 97,78 |
| Inferact NVFP4 | 26,4 GB | 304/496 | 87,63 | 96,67 |

Benchmarks adicionales:

| Modelo | MRCR | MRCR 8-needle | HMMT'26 | SuperGPQA | LiveCodeBench | RULER 32K | RULER 64K | RULER 128K |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| QUASAR (este modelo) | 79,1 | 52,7 | 73,4 | 62,4 | 79,2 | 96,3 | 96,2 | 95,8 |
| BF16 original | 83,4 | 58,5 | 75,8 | 63,0 | 81,0 | 96,7 | 96,6 | 95,9 |
| GPTQ NVFP4 (LLM Compressor) | 61,3 | 35,5 | 69,7 | 58,9 | 77,9 | 96,0 | 95,4 | 95,3 |
| RTN NVFP4 (LLM Compressor) | 57,3 | 32,8 | 66,9 | 58,6 | 77,9 | 96,2 | 96,1 | 95,3 |

## Requisitos de hardware

- VRAM estimada: 19,7 GB para los pesos NVFP4; con overhead de KV cache y contexto de 65.536 tokens cabe en 32 GB con `--gpu-memory-utilization 0.85`.
- GPU recomendadas: NVIDIA Blackwell (compute capability 10.0+), como RTX 5090 (32 GB), B200 o GB200. Imprescindible soporte FP4 nativo.
- No es compatible con GPUs Ampere o Ada (A100, RTX 4090) por falta de soporte FP4.
- Despliegue: vLLM >= 0.27 de forma nativa, sin conversion. El autor menciona tambien sglang en los tags. No se menciona soporte GGUF ni llama.cpp para esta build.
- Configuracion recomendada: `--max-model-len 262144`, `--max-num-seqs 512`, `--speculative-config '{"method": "mtp", "num_speculative_tokens": 2}'`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA-D | AIME'26 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| QUASAR NVFP4 (este) | 27,8B | 262.144 | 90,91 | 100,0 | Apache 2.0 | Hugging Face, vLLM |
| Qwen3.8-27B BF16 | 27,8B | no disponible | 91,41 | 100,0 | Apache 2.0 | Hugging Face |
| Unsloth NVFP4 | 27,8B | no disponible | 89,39 | 97,78 | Apache 2.0 | Hugging Face |
| Inferact NVFP4 | 27,8B | no disponible | 87,63 | 96,67 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Requiere hardware Blackwell con soporte FP4; no funciona en A100, H100 ni RTX 4090.
- Perdida medible frente al BF16 en tareas de contexto largo: MRCR 79,1 frente a 83,4 y MRCR 8-needle 52,7 frente a 58,5.
- Ligera degradacion en codigo y matematicas: LiveCodeBench 79,2 frente a 81,0 y HMMT'26 73,4 frente a 75,8.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion puede amplificarlo en tareas de recuperacion con muchas agujas.
- Idiomas soportados no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B.
- El contexto maximo de 262.144 tokens no es viable en GPUs de 32 GB; el propio autor recomienda 65.536 en RTX 5090.
- La evaluacion independiente citada (NVFP4 shootout) procede de una discusion en el repo oficial; no se aportan detalles metodologicos completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper QUASAR: https://arxiv.org/abs/2608.13966
- Pagina del proyecto: https://quasar-qat.github.io/
- Codigo: https://github.com/vincentcounathe/quasar-qat
- Discusion con evaluacion independiente: https://huggingface.co/Qwen/Qwen3.8-27B/discussions/192
- Build NVFP4 de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Build NVFP4 de Inferact: https://huggingface.co/Inferact/Qwen3.8-27B-NVFP4
- Hermano menor Qwen3.5-4B (W4A16): https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-NVFP4
- Hermano menor Qwen3.5-4B (W4A4): https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-NVFP4-W4A4
- Hermano menor Qwen3.5-4B (GGUF): https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF
- Coleccion QUASAR-QAT: https://huggingface.co/collections/QUASAR-QAT/quasar-qat-models-6aa3452a0caa78ce72bbbe0f
- Coleccion Gemma 4: https://huggingface.co/collections/QUASAR-QAT/quasar-native-4-bit-gemma-4-6aa3561770e6e4001271bf1e
- Coleccion Muse-Glimmer: https://huggingface.co/collections/QUASAR-QAT/quasar-native-4-bit-muse-glimmer-6aa4736ca711a87d471e807d
