# axteam/Qwen3.5-9B-FP8-dynamic

## Resumen

Qwen3.5-9B-FP8-dynamic es una cuantización de 8 bits del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario axteam. Se trata de un checkpoint de pesos en FP8 pensado específicamente para servir el modelo con vLLM de forma eficiente, reduciendo el espacio en disco a unos 12,4 GB frente al original en BF16. El modelo base es un transformer denso de aproximadamente 9.653 millones de parámetros con arquitectura híbrida (atención lineal combinada con atención completa), torre de visión y una cabeza de predicción multi-token (MTP).

La relevancia de esta ficha radica en que demuestra un flujo de cuantización post-entrenamiento (PTQ) sin calibración sobre una arquitectura multimodal reciente, manteniendo en BF16 o FP32 las partes sensibles (torre de visión, proyector, cabezas, embeddings y componentes no lineales del bloque SSM). El autor documenta una revisión de configuración que corrigió un fallo de carga de los pesos de visión en vLLM 0.32, lo que resulta útil como referencia práctica para quien despliegue variantes cuantizadas de modelos multimodales.

La licencia del modelo base es Apache-2.0, lo que facilita su uso comercial, y el formato de pesos es safetensors con metadatos de compressed-tensors (esquema FP8_DYNAMIC). No se dispone de información sobre los idiomas soportados más allá de las evaluaciones en inglés y coreano que reporta el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal (visión), con cabeza MTP |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 dinámico (W8A8, E4M3 en pesos con escala por canal de salida y activaciones FP8 dinámicas por token); partes sensibles en BF16 y FP32 |
| Idiomas soportados | No disponible (evaluaciones reportadas en inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con compressed-tensors (`float-quantized`, esquema `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina capas de atención lineal con capas de atención completa, un diseño orientado a reducir el coste computacional en contextos largos. Incluye una torre de visión y un proyector para entrada de imagen, además de una cabeza de predicción multi-token (MTP), lo que lo sitúa en la categoría de modelos multimodales image-text-to-text. Esta variante concreta no ha sido reentrenada: es una cuantización post-entrenamiento (PTQ) sin calibración, con escalas estáticas de pesos calculadas de forma libre de datos y activaciones cuantizadas dinámicamente por token.

La cuantización mantiene en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm excepto la norm con compuerta de `linear_attn.norm`, los embeddings de tokens, la LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d/dt_bias`). Se conservan en FP32, igual que en el original, `linear_attn.A_log` y la norm con compuerta. En total, alrededor del 28 % de los parámetros quedan sin cuantizar para preservar la calidad. El tokenizador, la plantilla de chat y las configuraciones del preprocesador son idénticos al original; el `config.json` es el original más un bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y descripción de contenido visual (pipeline image-text-to-text).
- Razonamiento y respuesta a preguntas en formato generativo.
- Razonamiento matemático y resolución de problemas aritméticos (evaluado en GSM8K).
- Manejo de conocimiento general y académico (evaluado en MMLU, ARC-Challenge, Winogrande).
- Capacidades multilingües parciales, con evaluaciones reportadas en inglés, coreano (HAE-RAE) y coreano específico de dominio (KMMLU).
- Predicción multi-token mediante cabeza MTP (relevante para decodificación especulativa en servidores compatibles).
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modos de razonamiento extendido.

## Casos de uso

- Servicio de chat multimodal en producción: el modelo acepta entradas de imagen y texto, por lo que puede desplegarse con vLLM para asistentes que respondan preguntas sobre capturas, diagramas o fotografías, aprovechando el formato FP8 para reducir el coste de memoria por réplica.
- Descripción automática de imágenes y alt-text: integrable en pipelines de accesibilidad o gestión documental para generar descripciones de material visual, con la torre de visión intacta en BF16 para preservar la fidelidad.
- Asistente de atención al cliente con contexto conversacional: su naturaleza conversacional y su tamaño de 9,6 mil millones de parámetros permiten gestionar diálogos multi-turno en un servidor con una sola GPU de gama alta.
- Evaluación y prototipado de investigación: al ser una cuantización fiel al original (perplejidad +1,1 % y acuerdo top-1 del 95,8 %), sirve para experimentar con modelos multimodales en entornos con VRAM limitada sin reentrenar.
- Razonamiento matemático asistido: los resultados en GSM8K (86,81 en 5-shot estricto) lo hacen adecuado para tutores o validadores de problemas aritméticos en inglés.
- Procesamiento de documentación técnica con imágenes: extracción de información de manuales, gráficos o tablas escaneadas combinando entrada visual y generación de texto.
- Despliegue en clústeres con vLLM: el formato compressed-tensors FP8_DYNAMIC está soportado por vLLM, lo que facilita su integración en infraestructuras de inferencia existentes con aceleración FP8 en GPUs Hopper o posteriores.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, prompts de estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), por lo que no es directamente comparable con puntuaciones obtenidas por log-verosimilitud.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 33,03 | 46,82 (141,8 %) | 32,37 (98,0 %) | 32,15 (97,3 %) | 35,06 (106,1 %) | 33,29 (100,8 %) |
| GSM8K (5-shot, estricto) | 87,11 | 86,81 (99,7 %) | 86,96 (99,8 %) | 84,38 (96,9 %) | 84,23 (96,7 %) | 86,81 (99,7 %) |
| ARC-Challenge (0-shot) | 55,55 | 55,72 (100,3 %) | 55,89 (100,6 %) | 54,44 (98,0 %) | 54,01 (97,2 %) | 56,48 (101,7 %) |
| Winogrande (5-shot) | 73,72 | 74,19 (100,6 %) | 74,51 (101,1 %) | 73,01 (99,0 %) | 73,16 (99,3 %) | 73,40 (99,6 %) |
| KMMLU (5-shot, directo) | 58,39 | 58,05 (99,4 %) | 58,51 (100,2 %) | 58,26 (99,8 %) | 57,41 (98,3 %) | 56,96 (97,6 %) |
| HAE-RAE (0-shot) | 69,48 | 69,11 (99,5 %) | 69,39 (99,9 %) | 70,21 (101,1 %) | 68,47 (98,5 %) | 67,09 (96,6 %) |
| Media | 62,88 | 65,12 (103,6 %) | 62,94 (100,1 %) | 62,07 (98,7 %) | 62,06 (98,7 %) | 62,34 (99,1 %) |
| Media sin MMLU | 68,85 | 68,78 (99,9 %) | 69,05 (100,3 %) | 68,06 (98,9 %) | 67,46 (98,0 %) | 68,15 (99,0 %) |

El propio autor advierte que la puntuación de MMLU varía ampliamente entre builds del mismo modelo (32,2–46,8) y probablemente refleja el formato de respuesta más que la calidad de la cuantización; por eso ofrece la media sin MMLU.

Fidelidad al original BF16 sobre un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es más cercano) | 1,4669 | 1,4506 (+1,1 %) |
| Acuerdo top-1 en el siguiente token | 95,8 % | 99,2 % |

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa aproximadamente 12,4 GB en disco; en inferencia hay que sumar la caché KV y los buffers de activación, no cuantificados, por lo que se recomienda reservar margen adicional sobre esos 12,4 GB.
- Runtime: vLLM. La arquitectura está soportada desde vLLM 0.17.0 y el autor la probó con vLLM 0.32.0.
- Dependencias de vLLM 0.32: Python 3.11–3.14, torch 2.13 (build CUDA 13.0, requiere driver NVIDIA con soporte CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el formato FP8 y los requisitos de CUDA 13, encaja en GPUs NVIDIA con soporte de FP8 (generaciones Hopper o posteriores). No hay datos publicados sobre RTX 4090, A100 u H100 en esta ficha.
- Opciones de despliegue: vLLM es el runtime documentado y probado. No se documenta soporte de llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|
| Qwen3.5-9B-FP8-dynamic (este repo) | 9,65 B | No disponible | FP8 dinámico W8A8 | Apache-2.0 | Media sin MMLU 68,78; perplejidad 1,4669 |
| Qwen3.5-9B (BF16 original) | 9,65 B | No disponible | BF16 | Apache-2.0 | Media sin MMLU 68,85; perplejidad 1,4506 |
| Qwen3.5-9B AWQ-8bit | 9,65 B | No disponible | AWQ 8 bits | Apache-2.0 (derivada) | Media sin MMLU 69,05 |
| Qwen3.5-9B NVFP4 | 9,65 B | No disponible | NVFP4 | Apache-2.0 (derivada) | Media sin MMLU 67,46 |

Las alternativas comparables son otras cuantizaciones del mismo modelo base; no se dispone de información sobre modelos de otros autores con los que comparar parámetros, contexto o licencia.

## Limitaciones y advertencias

- Es una cuantización PTQ sin calibración: la perplejidad sube un 1,1 % y el acuerdo top-1 baja al 95,8 % frente al 99,2 % del BF16, por lo que puede haber degradación en tareas sensibles a matices.
- La puntuación de MMLU es inestable entre builds del mismo modelo y no debe compararse con evaluaciones por log-verosimilitud; el autor no verificó respuesta a respuesta.
- Solo se documentan evaluaciones en inglés y coreano; no hay información sobre el resto de idiomas, incluido el español.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- La revisión del 2 de noviembre de 2026 corrigió un fallo de carga de la torre de visión en vLLM 0.32: quien descargara el repositorio antes del 1 de noviembre de 2026 a las 23:17:21 UTC debe volver a descargar `config.json`, ya que con la configuración anterior las entradas de imagen producían respuestas incorrectas.
- Requiere vLLM con soporte de la arquitectura (≥0.17.0) y un stack concreto (torch 2.13 con CUDA 13, transformers ≥5.16.1,<5.20, compressed-tensors 0.17.0); no es portable a otros runtimes sin conversión.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar los términos del modelo base enlazados por el autor.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-9B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
