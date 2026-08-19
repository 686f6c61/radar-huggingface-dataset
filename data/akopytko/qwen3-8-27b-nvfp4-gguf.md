# akopytko/Qwen3.8-27B-NVFP4-GGUF

## Resumen

El modelo `akopytko/Qwen3.8-27B-NVFP4-GGUF` es una cuantización de precisión NVFP4 (tipo N4_0) del modelo denso multimodal Qwen3.8-27B de Alibaba, publicada por el usuario akopytko en HuggingFace. La cuantización está optimizada para hardware Blackwell de NVIDIA y ofrece una velocidad de prefill hasta un 50 % superior a las cuantizaciones convencionales de 4 bits, manteniendo un tamaño comparable. El archivo incluye además una cabeza de decodificación especulativa MTP (multi-token prediction) cuantizada en NVFP4, lo que permite acelerar la generación en modo decode sin necesidad de un modelo auxiliar externo.

La relevancia actual de este modelo radica en que aprovecha las instrucciones nativas de formato de punto flotante de 4 bits de las GPUs Blackwell (RTX 50, B200, B300, DGX Spark), eliminando la necesidad de cambios en llama.cpp y ofreciendo una alternativa de baja latencia para despliegues de inferencia en estas tarjetas. La licencia Apache 2.0 facilita su uso comercial y la reproducción de la técnica de cuantización mediante PRs abiertos en llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto y vision) |
| Parametros totales | 27 B (aproximado, segun denominacion del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K nativo) |
| Tipos de cuantizacion | NVFP4 (tipo N4_0, punto flotante de 4 bits) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con cuantizacion NVFP4, compatible con llama.cpp) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B es un transformer denso multimodal de 27 000 millones de parametros desarrollado por Alibaba (equipo Qwen). Integra capacidades de vision y razonamiento, con una ventana de contexto de 256K tokens. La cuantizacion NVFP4 de este repositorio se diferencia de la variante de NVIDIA en que no incluye escalas globales por tensor, lo que reduce el coste de computo entre un 4 y un 7 %, y emplea una busqueda de escalas MSE en tiempo de cuantizacion para seleccionar el codigo UE4M3 que minimiza el error de reconstruccion. El archivo GGUF resultante incorpora una cabeza MTP cuantizada en NVFP4, que permite la decodificacion especulativa sin requerir cambios en llama.cpp.

No se proporcionan datos sobre el dataset de entrenamiento del modelo base, el numero de tokens o el proceso de alineacion (RLHF/DPO) en la informacion disponible. La tecnica de cuantizacion se puede reproducir con los PRs abiertos en llama.cpp (#23572 y #23692) y el comando `llama-quantize` con el tipo `N4_0`.

## Capacidades
- Generacion de texto y razonamiento multimodal (vision y texto).
- Razonamiento multi-paso y soporte para agentes (el modelo base Qwen3.8-27B esta orientado a agentic coding y office automation).
- Decodificacion especulativa integrada mediante MTP, con un rendimiento observado de 152 tokens/s a un ratio de aceptacion del 75 %.
- Ventana de contexto de 256K tokens para manejo de documentos extensos.
- Soporte de vision (procesamiento de imagenes junto con texto).
- Cuantizacion NVFP4 nativa para Blackwell, sin cambios en llama.cpp (compatible con la version actual).

## Casos de uso

- Atencion al cliente automatizada con contexto largo: la ventana de 256K tokens permite mantener conversaciones multi-turno con historial completo y documentos adjuntos, sin truncar informacion.
- Generacion de codigo en produccion con baja latencia: la cabeza MTP y la cuantizacion NVFP4 reducen la latencia de decode en GPUs Blackwell, lo que la hace apta para integracion en pipelines de CI/CD que requieran respuestas casi en tiempo real.
- Asistentes de automatizacion de oficina: el modelo base Qwen3.8-27B esta especificamente disenado para office automation, por lo que puede generar informes, resumir correos o redactar documentos a partir de entradas largas.
- Analisis de documentos tecnicos con vision: al ser multimodal, puede procesar imagenes, diagramas y texto dentro de un mismo prompt, util para revision de documentacion tecnica o manuales.
- Agentes autonomos con tool calling: el modelo base soporta flujos de agente y razonamiento multi-step, lo que permite construir sistemas que llamen a funciones externas (bases de datos, APIs) de forma autonoma.
- Despliegue en entornos con hardware Blackwell limitado: al ser una cuantizacion de 4 bits con un tamano de ~14.6 GiB, cabe en tarjetas de 24 GB como la RTX 5090 o la RTX PRO 4000 Blackwell SFF, permitiendo inferencia local en equipos de escritorio o estaciones de trabajo.

## Benchmarks y rendimiento
La model card del autor incluye resultados de velocidad (prefill y decode) y calidad de reconstruccion comparados con otras cuantizaciones, medidos en una RTX 5090 a 575 W. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

### Velocidad de prefill (tokens/s)

| Modelo | pp512, ubatch 512 | pp512, ubatch 4096 | tg128 |
|---|---|---|---|
| N4_0 (este modelo) | 6258.74 ± 15.37 | 6432.25 ± 143.73 | 87.45 ± 0.27 |
| unsloth NVFP4 | 6018.71 ± 13.97 | 5998.72 ± 95.34 | 87.69 ± 0.27 |
| Q4_0 (sin imatrix) | 4139.00 ± 4.31 | 4173.82 ± 28.23 | 87.90 ± 0.29 |
| unsloth Q4_0 | 4156.58 ± 7.61 | 4146.54 ± 38.64 | 87.01 ± 0.09 |
| unsloth Q6_K | 3215.89 ± 3.89 | n/a | 62.49 ± 0.33 |

### Calidad de reconstruccion (frente al modelo bf16 base)

| Modelo | KLD medio | Mismo top-p |
|--------|-----------|-------------|
| N4_0 (este modelo) | 0.066254 ± 0.000702 | 88.525 ± 0.141 % |
| unsloth NVFP4 | 0.070824 ± 0.000733 | 88.061 ± 0.144 % |
| Q4_0 sin imatrix | 0.037877 ± 0.000448 | 91.461 ± 0.124 % |
| unsloth Q4_0 | 0.028317 ± 0.000330 | 92.698 ± 0.115 % |
| unsloth Q6_K | 0.002857 ± 0.000051 | 97.506 ± 0.069 % |

El modelo base Qwen3.8-27B tiene una perplexidad de 6.7945 en wikitext (test set). La cuantizacion N4_0 muestra una calidad ligeramente superior a la NVFP4 de unsloth, pero inferior a las cuantizaciones Q4_0 convencionales, como es habitual en los formatos NVFP4.

## Requisitos de hardware

- GPU obligatoria de la familia Blackwell: RTX 50 series, DGX Spark, B200, B300 o RTX PRO 4000 Blackwell SFF. No es compatible con arquitecturas anteriores (Ampere, Ada, Hopper).
- VRAM estimada: el archivo ocupa aproximadamente 14.63 GiB (4.60 BPW), por lo que caben en tarjetas de 16 GB o más. Para la ventana de contexto completa de 256K se necesitan reservas adicionales para la cache KV; en una RTX PRO 4000 de 24 GB se ha logrado ejecutar con contexto completo.
- GPUs recomendadas: RTX 5090 (usada en los benchmarks), RTX 5080, RTX PRO 4000 Blackwell SFF, DGX Spark, B200/B300.
- Opciones de despliegue: llama.cpp (sin cambios, compatible con la version actual), vLLM probablemente (no verificado), y cualquier framework que soporte GGUF con NVFP4.
- Rendimiento estimado: prefill de ~6250-6430 tokens/s (batch 512-4096) y decode de ~87 tokens/s en RTX 5090. Con MTP activado (--spec-type draft-mtp --spec-draft-n-max 16 --spec-draft-p-min 0.8) se observan 152 tokens/s en decode.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Velocidad prefill (pp512, ub 512) | Calidad KLD | Licencia |
|--------|------------|----------|--------------|-----------------------------------|-------------|----------|
| akopytko/Qwen3.8-27B-NVFP4 (este) | 27B | 256K | NVFP4 N4_0 | 6258 tok/s | 0.0663 | Apache 2.0 |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | 256K | NVFP4 | 6018 tok/s | 0.0708 | Apache 2.0 |
| unsloth/Qwen3.8-27B-GGUF (Q4_0) | 27B | 256K | Q4_0 imatrix | 4156 tok/s | 0.0283 | Apache 2.0 |
| unsloth/Qwen3.8-27B-GGUF (Q6_K) | 27B | 256K | Q6_K | 3215 tok/s | 0.0029 | Apache 2.0 |

La comparativa muestra que este modelo ofrece el mejor rendimiento de prefill entre las cuantizaciones comparadas, con una calidad de reconstruccion intermedia: superior a la NVFP4 de unsloth pero inferior a las cuantizaciones Q4_0/Q6_K. Es la opcion recomendada si la velocidad de prefill es prioritaria y se dispone de hardware Blackwell.

## Limitaciones y advertencias

- Requiere exclusivamente GPUs Blackwell (RTX 50, DGX Spark, B200, B300). No funcionara en tarjetas de generaciones anteriores.
- La cuantizacion NVFP4 presenta una calidad de reconstruccion inferior a las cuantizaciones Q4_0/Q6_K convencionales (KLD mas alta, menor coincidencia top-p), como es comun en este formato. Puede causar perdidas de precision en tareas que requieran alta fidelidad.
- No se han publicado evaluaciones de sesgos, alucinacion o rendimiento en tareas especificas (MMLU, HumanEval, GSM8K) para esta cuantizacion concreta.
- La cabeza MTP esta cuantizada en NVFP4 y su rendimiento puede variar segun el prompt; los valores observados (152 tok/s) se obtuvieron con una tasa de aceptacion del 75 %.
- El autor advierte que no se ha realizado una evaluacion de seguridad o de sesgos del modelo base; para uso en produccion se recomienda realizar pruebas adicionales.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la calidad o el funcionamiento en entornos de alta disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/akopytko/Qwen3.8-27B-NVFP4-GGUF
- Modelo base Qwen3.8-27B (Hugging Face): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- PR de llama.cpp para cuantizacion N4_0: https://github.com/ggml-org/llama.cpp/pull/23572
- PR de llama.cpp para MTP: https://github.com/ggml-org/llama.cpp/pull/23692
- Documentacion de unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Foro de NVIDIA sobre despliegue en 24 GB: https://forums.developer.nvidia.com/t/qwen3-8-27b-at-256k-on-a-24-gb-blackwell-target-gpu-imatrix-nvfp4-mtp-55-4-tok-s/380456
