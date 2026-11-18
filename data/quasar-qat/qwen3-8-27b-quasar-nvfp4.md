# QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4

## Resumen

Qwen3.8-27B-QUASAR-NVFP4 es una versión cuantizada a 4 bits en formato NVFP4 del modelo multimodal Qwen/Qwen3.8-27B, producida por QUASAR-QAT mediante entrenamiento consciente de la cuantización (QAT). El modelo base es un transformer multimodal de 27.781 millones de parámetros (27,8 B) con capacidad image-text-to-text, orientado a razonamiento, modo thinking, contexto largo y uso agéntico. La contribución del checkpoint es comprimir el modelo original de 55,6 GB (BF16) a 19,7 GB manteniendo una calidad cercana al original: 90,91 en GPQA-Diamond frente a 91,41 del BF16.

La relevancia práctica está en que cuantiza las 496 capas lineales del transformer a NVFP4 (W4A4), incluidas atención y gated delta-net, y exporta pesos NVFP4 estándar que se sirven directamente con vLLM sin pasos de conversión. Esto permite desplegar un modelo de 27,8 B con ventana de 262.144 tokens en GPUs Blackwell de 32 GB, un escenario inviable con los pesos BF16.

El método QUASAR entrena los pesos NVFP4 contra el modelo BF16 congelado mediante destilación con reconstrucción consciente de la pérdida, en una época y 2.446 pasos. El resultado es, según la model card, el build NVFP4 público más pequeño y con mayor puntuación entre los comparados en GPQA-Diamond y AIME'26.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención y gated delta-net; base Qwen3.8-27B; cuantización NVFP4 (W4A4) en 496/496 capas lineales |
| Parámetros totales | 27.781.427.952 (27,8 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (configuración recomendada en vLLM); 65.536 en GPUs de 32 GB |
| Tipos de cuantización | NVFP4 (FP4, W4A4) con compressed-tensors; el autor publica además una variante W4A16 del modelo hermano Qwen3.5-4B, no de este |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal con pipeline image-text-to-text que combina capas de atención con gated delta-net y dispone de decodificación especulativa mediante MTP (multi-token prediction). La cuantización cubre las 496 capas lineales del transformer en NVFP4, es decir, pesos y activaciones a 4 bits, sin dejar capas en precisión superior.

El entrenamiento QUASAR consiste en una época de destilación de cuantización consciente de la pérdida (loss-aware NVFP4 QAT) contra el profesor BF16 congelado, con batch global de 32, learning rate de 1e-6 y 2.446 pasos. La innovación declarada es la reconstrucción consciente de la pérdida, que rebaja el suelo de pérdida habitual del QAT. Los pesos exportados son NVFP4 estándar, por lo que no requieren un camino de inferencia personalizado.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text).
- Modo thinking explícito, con parser de razonamiento `qwen3` en vLLM.
- Razonamiento matemático de competición (AIME'26, HMMT'26).
- Generación de código (LiveCodeBench).
- Contexto largo: RULER evaluado hasta 128K y ventana configurable de 262.144 tokens.
- Tool calling y function calling, con `--enable-auto-tool-choice` y parser `qwen3_xml`.
- Flujos agénticos y razonamiento multi-paso.
- Recuperación en contexto largo (MRCR, incluida variante 8-needle).
- Decodificación especulativa MTP para acelerar la generación.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento científico y técnico asistido: el modelo mantiene 90,91 en GPQA-Diamond frente a 91,41 del BF16, por lo que sirve para responder preguntas de nivel posgrado en física, química y biología con una penalización de calidad mínima.
- Análisis de documentos largos y código en contexto: con 262.144 tokens de ventana y 95,8 en RULER 128K, permite procesar repositorios completos, expedientes o manuales extensos en una sola pasada.
- Agentes con tool calling: la integración nativa con el parser `qwen3_xml` y `--enable-auto-tool-choice` de vLLM facilita agentes que invocan APIs y ejecutan pipelines multi-paso.
- Asistencia sobre imágenes: al ser image-text-to-text, puede describir, extraer y razonar sobre capturas, diagramas o documentos escaneados dentro de un flujo conversacional.
- Generación de código en producción: 79,2 en LiveCodeBench y soporte de tool calling permiten integrarlo en revisión de código, generación de tests y automatización de CI/CD.
- Despliegue en una sola GPU Blackwell de 32 GB: con 19,7 GB de pesos y contexto reducido a 65.536 tokens cabe en una RTX 5090, lo que habilita prototipos y entornos de desarrollo sin clúster.
- Servicio de alto rendimiento con vLLM: `--max-num-seqs 512` y decodificación especulativa MTP con 2 tokens permiten atender muchas peticiones concurrentes por GPU.

## Benchmarks y rendimiento

Datos de la model card. GPQA-Diamond: 2 ejecuciones, n=396; AIME'26: 3 repeticiones, n=90.

| Modelo | Tamaño | Capas NVFP4 | GPQA-D | AIME'26 |
|---|---:|---:|---:|---:|
| QUASAR (este modelo) | 19,7 GB | 496/496 | 90,91 | 100,0 |
| BF16 original | 55,6 GB | — | 91,41 | 100,0 |
| Unsloth NVFP4 | 23,4 GB | 168/496 | 89,39 | 97,78 |
| Inferact NVFP4 | 26,4 GB | 304/496 | 87,63 | 96,67 |

| Modelo | MRCR | MRCR 8-needle | HMMT'26 | SuperGPQA | LiveCodeBench | RULER 32K | RULER 64K | RULER 128K |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| QUASAR (este modelo) | 79,1 | 52,7 | 73,4 | 62,4 | 79,2 | 96,3 | 96,2 | 95,8 |
| BF16 original | 83,4 | 58,5 | 75,8 | 63,0 | 81,0 | 96,7 | 96,6 | 95,9 |
| GPTQ NVFP4 (LLM Compressor) | 61,3 | 35,5 | 69,7 | 58,9 | 77,9 | 96,0 | 95,4 | 95,3 |
| RTN NVFP4 (LLM Compressor) | 57,3 | 32,8 | 66,9 | 58,6 | 77,9 | 96,2 | 96,1 | 95,3 |

## Requisitos de hardware

- VRAM estimada: 19,7 GB de pesos NVFP4; el repo ocupa 22,8 GB.
- GPU obligatoria con soporte FP4: NVIDIA Blackwell, compute capability 10.0 o superior. No funciona en arquitecturas anteriores.
- RTX 5090 (32 GB): viable con `--max-model-len 65536` y `--gpu-memory-utilization 0.85`.
- GPUs de centro de datos Blackwell (B200 y similares): necesarias para la ventana completa de 262.144 tokens y `--max-num-seqs 512`.
- Despliegue: vLLM >= 0.27 con soporte nativo, sin conversión. La model card también etiqueta sglang y compressed-tensors.
- Aceleración: decodificación especulativa MTP con `num_speculative_tokens: 2`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA-D | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QUASAR NVFP4 (este) | 27,8 B | 262.144 | 90,91 | Apache 2.0 | Hugging Face, vLLM |
| Qwen3.8-27B BF16 | 27,8 B | no disponible | 91,41 | Apache 2.0 | Hugging Face |
| Unsloth NVFP4 | 27,8 B (base) | no disponible | 89,39 | Apache 2.0 (heredada) | Hugging Face |
| Inferact NVFP4 | 27,8 B (base) | no disponible | 87,63 | Apache 2.0 (heredada) | Hugging Face |

Frente al BF16, QUASAR reduce el tamaño un 64,6 % (55,6 a 19,7 GB) con una caída de 0,5 puntos en GPQA-Diamond y sin pérdida en AIME'26. Frente a los otros dos builds NVFP4 públicos, es el más pequeño y el de mayor puntuación en ambas pruebas.

## Limitaciones y advertencias

- Requiere hardware Blackwell con FP4; no es desplegable en Ampere, Hopper ni GPUs de consumo anteriores.
- La ventana completa de 262.144 tokens exige memoria muy superior a la de una GPU de 32 GB.
- Pérdida medible frente al BF16 en tareas de contexto largo: MRCR 79,1 frente a 83,4 y MRCR 8-needle 52,7 frente a 58,5.
- Caída de 1,8 puntos en LiveCodeBench (79,2 frente a 81,0) y de 2,4 en HMMT'26 (73,4 frente a 75,8).
- Los benchmarks publicados proceden del propio autor; la evaluación independiente citada es una discusión en el repo oficial de Qwen, no una publicación arbitrada.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base Qwen3.8-27B.
- Idiomas soportados no declarados; conviene validar el comportamiento multilingüe antes de usarlo en producción.
- Licencia Apache 2.0, que permite uso comercial, pero sujeta a las condiciones del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper QUASAR: https://arxiv.org/abs/2608.13966
- Página del proyecto: https://quasar-qat.github.io/
- Código: https://github.com/vincentcounathe/quasar-qat
- Discusión de evaluación independiente: https://huggingface.co/Qwen/Qwen3.8-27B/discussions/192
- Build NVFP4 de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Build NVFP4 de Inferact: https://huggingface.co/Inferact/Qwen3.8-27B-NVFP4
- Colección QUASAR-QAT: https://huggingface.co/collections/QUASAR-QAT/quasar-qat-models-6aa3452a0caa78ce72bbbe0f
