# davisliu/Qwen3.8-27B-MXFP4-VL-MTP

## Resumen

Este modelo es una cuantización MXFP4 (4-bit) de Qwen3.8-27B, el VLM multimodal de Qwen con arquitectura híbrida Qwen3.5 (Gated DeltaNet), preparada específicamente para Apple Silicon mediante el ecosistema MLX. El autor, davisliu, la ha generado con la herramienta `junainfinity/mlx-mtp` y la publica bajo licencia Apache-2.0. Su principal valor es permitir ejecutar un modelo de ~27B parámetros con capacidades de imagen y vídeo en hardware de Apple con memoria unificada, reduciendo el peso de ~55 GB (BF16) a ~16 GB.

A diferencia de cuantizaciones genéricas de 4 bits, esta build preserva tres elementos críticos: la torre de visión y el proyector en fp16 (manteniendo la comprensión completa de imagen y vídeo), la cabeza MTP (Multi-Token Prediction) también en fp16 para habilitar decodificación especulativa autónoma sin modelo borrador, y los tensores sensibles al estado SSM (`a_log`, `dt_bias`, `conv1d`, `ssm_*`) en alta precisión para evitar la degradación del estado híbrido. El resultado es un modelo que mantiene la ventana de contexto de 262 144 tokens y hereda el modo de razonamiento (thinking) del modelo base, pero con un tamaño y requisitos de memoria muy inferiores.

La relevancia actual radica en que ofrece una vía práctica para desplegar un VLM de última generación con soporte de vídeo en Macs, algo que normalmente requeriría GPUs de gran VRAM. Al conservar el MTP, se obtiene una aceleración medida de ~1,2× en texto corto sin sacrificar calidad, ya que la cabeza MTP se entrenó de extremo a extremo con el backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (Gated DeltaNet híbrido), variante VL (imagen + vídeo), con cabeza MTP de 1 capa |
| Parametros totales | ~27B según el autor; el conteo de safetensors del repo indica 5.930.578.672 (posiblemente parcial o incompleto) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 |
| Tipos de cuantizacion | MXFP4 (4-bit, group_size=32, pesos empaquetados en uint32 + escalas E8M0); torre de visión, proyector, cabeza MTP y tensores SSM en fp16 o alta precisión |
| Idiomas soportados | No disponible (la model card no lo especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards, ~16 GB en total), con metadatos MLX |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen3.8-27B original, que emplea una arquitectura híbrida Qwen3.5 con capas Gated DeltaNet (un mecanismo de estado recurrente) combinadas con bloques Transformer. La variante VL incorpora una torre de visión y un proyector para procesar imágenes y vídeo mediante parches temporales. La cabeza MTP es una capa Transformer adicional que, dada la representación oculta en la posición `t`, predice el token `t+2`, permitiendo decodificación especulativa autodirigida.

El proceso de cuantización se realizó con `mlx-mtp-quantize` en modo MXFP4, excluyendo de la cuantización la torre de visión, el proyector, la cabeza MTP y los tensores sensibles al estado SSM. No se dispone de información detallada sobre el entrenamiento del modelo base (composición del dataset, número de tokens, uso de RLHF/DPO), ya que la model card solo documenta el proceso de cuantización. El modo de razonamiento (thinking) se hereda directamente del modelo base.

## Capacidades

- Comprensión de imágenes y vídeo: la torre de visión y el proyector se mantienen en fp16, preservando la capacidad completa de entrada visual, incluido el procesamiento de parches temporales para vídeo.
- Generación de texto y razonamiento: hereda las capacidades lingüísticas del modelo base Qwen3.8, incluido el modo de razonamiento (thinking mode).
- Decodificación especulativa autónoma: gracias a la cabeza MTP conservada en fp16, el modelo puede generar múltiples tokens por paso sin necesidad de un modelo borrador externo, con una aceleración medida de ~1,2× en texto corto.
- Soporte de conversación multimodal: pipeline `image-text-to-text`, apto para diálogos que combinan texto e imágenes o vídeo.
- Compatibilidad con Apple Silicon: diseñado para el runtime MLX, tanto en Python (`mlx-mtp`) como en Swift (`mlx-swift-lm`).
- No se documenta explícitamente soporte de tool calling o function calling en la información proporcionada.

## Casos de uso

- Análisis de vídeo en local: el modelo puede procesar secuencias de vídeo y generar descripciones, resúmenes o responder preguntas sobre el contenido, gracias a su torre de visión en fp16 y su ventana de contexto de 262 144 tokens que permite manejar múltiples fotogramas.
- Asistente visual para personas con discapacidad: integrado en una aplicación de macOS o iOS, puede describir escenas en tiempo real a partir de la cámara, con razonamiento multihop para responder preguntas complejas sobre el entorno.
- Archivado y búsqueda de contenido multimedia: indexar bibliotecas de imágenes y vídeos generando metadatos descriptivos, aprovechando el contexto largo para procesar documentos visuales extensos.
- Generación de informes a partir de capturas de pantalla: en un entorno de desarrollo, el modelo puede analizar capturas de interfaces, diagramas o gráficos y producir explicaciones técnicas o documentación.
- Chatbot multimodal de atención al cliente: desplegado en un Mac como servidor OpenAI-compatible (`mlx-mtp-serve`), puede atender consultas que incluyan capturas de pantalla o vídeos cortos, con razonamiento encadenado para resolver problemas paso a paso.
- Prototipado de agentes con razonamiento: al heredar el modo thinking del modelo base, sirve para experimentar con agentes que requieren planificación y ejecución de múltiples pasos sobre entradas visuales, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la aceleración de decodificación especulativa de ~1,2× en texto corto, medida por el autor. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multimodales específicas para esta cuantización.

## Requisitos de hardware

- Memoria: el peso del modelo es de ~16 GB en 3 shards safetensors. En Apple Silicon, al usar memoria unificada, se recomienda un mínimo de 24 GB de RAM unificada para dejar margen al sistema operativo y a los buffers de inferencia; 32 GB o más es lo ideal para trabajar con vídeo y contexto largo.
- GPU: cualquier chip Apple Silicon con suficiente memoria unificada (M1 Pro/Max, M2 Pro/Max/Ultra, M3, M4 y variantes). No requiere GPU dedicada de NVIDIA.
- Opciones de despliegue: runtime `mlx-mtp` en Python (incluye servidor OpenAI-compatible `mlx-mtp-serve`) y `mlx-swift-lm` en Swift mediante `VLMModelFactory`.
- Latencia y throughput: no se proporcionan cifras concretas; la aceleración MTP de ~1,2× es la única referencia. El rendimiento dependerá del chip (ancho de banda de memoria) y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | ~27B | 262 144 | Apache-2.0 | BF16 (~55 GB) | Modelo original sin cuantizar, requiere GPU de gran VRAM |
| Qwen3.8-27B-MXFP4-VL-MTP (este) | ~27B (según autor) | 262 144 | Apache-2.0 | MXFP4 4-bit (~16 GB) | Cuantización para Apple Silicon, preserva visión y MTP |
| Otras cuantizaciones 4-bit genéricas de Qwen3.8 | ~27B | 262 144 | Apache-2.0 | GGUF, GPTQ, etc. | No documentadas en la información proporcionada; suelen perder calidad visual y no incluyen MTP |

No se dispone de datos de rendimiento comparativos entre estas opciones. La ventaja principal de esta build frente a cuantizaciones genéricas es la preservación de la torre de visión en fp16 y la cabeza MTP, que permiten mantener capacidades multimodales completas y decodificación especulativa sin modelo borrador.

## Limitaciones y advertencias

- La cuantización MXFP4 puede introducir degradación de calidad en tareas de alta precisión, aunque el autor ha mitigado los puntos críticos (visión, MTP, tensores SSM). No hay evaluaciones independientes que confirmen la paridad con el modelo BF16.
- Requiere un runtime que lea `mtp_num_hidden_layers > 0` (mlx-mtp o versiones de mlx-swift-lm con soporte Qwen3.5 MTP). Sin ese soporte, el modelo podría no cargar o ignorar la cabeza MTP.
- Es una build específica para Apple Silicon (MLX); no es directamente compatible con vLLM, llama.cpp u otros frameworks estándar sin conversión adicional.
- Solo aplica a la familia de arquitectura Qwen3.5 (incluyendo 3.6 y 3.8); no es válida para otras variantes.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas; al ser un modelo derivado de Qwen3.8, hereda los riesgos típicos de los LLM grandes, como la generación de información falsa y posibles sesgos en los datos de entrenamiento.
- El conteo de parámetros del repositorio (5,93B) no coincide con la cifra declarada de ~27B; es posible que el script de conteo haya omitido tensores o que haya un error en la metadata. Se recomienda verificar antes de confiar en ese dato.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davisliu/Qwen3.8-27B-MXFP4-VL-MTP
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización e inferencia mlx-mtp: https://github.com/junainfinity/mlx-mtp
- Runtime Swift mlx-swift-lm: https://github.com/ml-explore/mlx-swift-lm
