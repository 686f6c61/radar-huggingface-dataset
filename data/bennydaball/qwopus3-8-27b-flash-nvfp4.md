# BennyDaBall/Qwopus3.8-27B-Flash-NVFP4

## Resumen

Qwopus3.8-27B-Flash-NVFP4 es una cuantización nativa en formato NVFP4 (NVIDIA 4-bit Floating Point) del modelo Qwopus3.8-27B-Flash, un fine-tune de 27.320 millones de parámetros de la serie Qwen3.8 desarrollado por Jackrong. Publicada por BennyDaBall, esta versión está optimizada para GPUs Blackwell (RTX 5090) y conserva el head especulativo MTP/NextN completo, el proyector de visión BF16 y una ventana de contexto nativa de 262.144 tokens. El resultado es un modelo multimodal (texto e imagen) de 18,34 GiB en formato GGUF, listo para ejecutarse con llama.cpp o LM Studio, que mantiene las capacidades de tool calling, razonamiento y generación de código del modelo original.

Su relevancia radica en que permite ejecutar un modelo de 27B con capacidades de agente y visión en una única GPU de consumo de 32 GB, aprovechando la decodificación especulativa embebida (MTP) para acelerar la inferencia sin necesidad de un modelo borrador externo. Al estar basado en la arquitectura híbrida de Qwen3.8, combina atención por capas con Gated DeltaNet, lo que aporta eficiencia en el manejo de secuencias largas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención, Gated DeltaNet y MLP (64 capas de texto + capa MTP) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | NVFP4 (GGML tensor type 40) en backbone; BF16 en embeddings, salida, proyector de visión y matrices MTP grandes; F32 en tensores pequeños |
| Idiomas soportados | Inglés, chino, español, ruso, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo principal + mmproj BF16 separado) |

## Arquitectura y entrenamiento

El modelo base Qwopus3.8-27B-Flash es un fine-tune de la serie Qwen3.8, que emplea una arquitectura híbrida transformer con capas de atención convencional, Gated DeltaNet y MLP. La cuantización NVFP4 de BennyDaBall no modifica la arquitectura: convierte las matrices de atención grandes, Gated DeltaNet y MLP de las 64 capas de texto al tipo GGML tensor type 40 (nvfp4), manteniendo en BF16 las embeddings, la salida, las matrices grandes del head MTP y el proyector de visión. Los tensores pequeños (estado, convolución, bias, norm y scale) permanecen en F32.

El proceso de cuantización se realizó desde el checkpoint BF16 fijado, con una matriz de importancia (imatrix) de 200 chunks específica para la arquitectura. No hubo retraining ni destilación. El head MTP (Multi-Token Prediction) se conserva íntegro, lo que permite decodificación especulativa autónoma con llama.cpp mediante la opción `--spec-type draft-mtp`. El proyector de visión BF16 se convirtió del mismo checkpoint, no de otro modelo Qwen3.8. No se dispone de información sobre el dataset de entrenamiento del fine-tune original.

## Capacidades

- Generación de texto y razonamiento: soporta modos de razonamiento con esfuerzo configurable (`--reasoning-effort xhigh`) y preservación del contenido de razonamiento (`--reasoning-preserve`).
- Visión: entrada de imágenes a través del proyector BF16 (`mmproj`), con pipeline image-text-to-text.
- Tool calling y function calling: plantilla de chat específica que soporta llamadas a herramientas, mensajes system/developer fusionados y mensajes system posteriores.
- Agentes y razonamiento multi-paso: apto para flujos agénticos gracias al soporte de function calling y al contexto largo.
- Decodificación especulativa embebida: el head MTP permite auto-especulación sin modelo borrador externo, con hasta 3 tokens de borrador por paso (`--spec-draft-n-max 3`).
- Multilingüe: inglés, chino, español, ruso y japonés.
- Generación de código: entrenado para tareas de programación, según los tags del modelo.
- Conversacional: plantilla de chat integrada en el GGUF, compatible con LM Studio y llama.cpp.

## Casos de uso

- Asistente de desarrollo local: el modelo puede ejecutarse en una RTX 5090 de 32 GB con llama.cpp, proporcionando un copiloto de código con generación de código y tool calling para integrarse en IDEs o pipelines de CI/CD.
- Agente autónomo con herramientas: gracias al soporte de function calling y al contexto de 262.144 tokens, puede gestionar tareas multi-paso como consultar APIs, procesar resultados y generar respuestas, todo en un solo modelo.
- Análisis de documentos con imágenes: el proyector de visión permite procesar capturas de pantalla, diagramas o documentos escaneados, útil para automatizar la extracción de información en entornos de soporte o documentación.
- Atención al cliente multilingüe: con soporte para 5 idiomas y contexto largo, puede mantener conversaciones multi-turno y gestionar historiales extensos sin perder coherencia.
- Razonamiento complejo en entornos de investigación: el modo de razonamiento configurable y la preservación del contenido de razonamiento permiten trazar el proceso de pensamiento en tareas de análisis o matemáticas.
- Traducción y transcripción multimodal: puede combinar entrada de texto e imagen para tareas como traducción de interfaces, capturas o documentos visuales, manteniendo el estilo y el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para esta cuantización.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF principal ocupa 18,34 GiB. El autor recomienda una GPU de 32 GB y KV cache Q8_0. En modo visión, se reduce el contexto a 131.072 para dejar espacio al codificador de imágenes.
- GPU recomendada: RTX 5090 (sm_120) de 32 GB, que es el objetivo de validación. Otras GPUs Blackwell pueden funcionar, pero no han sido testadas.
- No cabe en GPUs consumer de 16 GB de forma fiable debido al tamaño del modelo y al overhead de CUDA.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio, y cualquier runtime compatible con GGUF y kernels NVFP4.
- Latencia y throughput: no disponibles. El autor indica que el MTP embebido acelera la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Flash-NVFP4 (este) | 27,32B | 262.144 | NVFP4 + BF16 | Apache 2.0 | GGUF |
| Qwopus3.8-27B-Flash (BF16 original) | 27,32B | 262.144 | BF16 | Apache 2.0 | no disponible |
| Shiftedx/Qwopus3.8-27B-Flash-NVFP4-MTP | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se basa en la información disponible. El modelo original BF16 ocupa 51,8 GiB, mientras que esta cuantización reduce el tamaño a 18,34 GiB. Existe otra cuantización similar de Shiftedx, también con MTP, pero no se dispone de detalles adicionales.

## Limitaciones y advertencias

- Requiere un runtime con soporte específico para NVFP4 (tipo de tensor 40 de GGML) y arquitectura Qwen3.5/3.8. Un llama.cpp o LM Studio antiguo puede no cargar el modelo, incluso si soporta otros GGUFs de Qwen3.8.
- Solo validado en RTX 5090 (sm_120). Otras GPUs Blackwell no están garantizadas y pueden fallar.
- El contexto de 262.144 es nativo, pero en modo visión se recomienda reducir a 131.072 para dejar espacio al codificador de imágenes en una GPU de 32 GB.
- No hay benchmarks publicados, por lo que el rendimiento real (calidad, velocidad) no está verificado de forma independiente.
- Al ser un fine-tune de terceros, la calidad puede variar respecto al modelo base Qwen3.8. No se documentan sesgos ni riesgos específicos.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la cadena de derivación (modelo base y cuantización) para asegurar el cumplimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BennyDaBall/Qwopus3.8-27B-Flash-NVFP4
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash
- Autor en HuggingFace: https://huggingface.co/BennyDaBall
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Perfil de X del autor: https://x.com/BennyDaBall_OG
