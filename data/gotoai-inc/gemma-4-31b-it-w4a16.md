# GotoAI-Inc/gemma-4-31B-it-W4A16

## Resumen

Este repositorio contiene una cuantización *weight-only* int4 (W4A16) del modelo oficial `google/gemma-4-31B-it`, realizada por GotoAI-Inc. El objetivo principal es reducir el tamaño del checkpoint de 62,55 GB (bfloat16) a 19,07 GB, lo que permite ejecutar un modelo de 31.000 millones de parámetros en tarjetas gráficas de consumo con 24 GB de VRAM, aunque con limitaciones de contexto. La cuantización es post-entrenamiento (RTN) sin calibración, utilizando el formato `compressed-tensors` y diseñada para ser servida con vLLM mediante kernels Marlin.

El modelo base Gemma 4 de Google es una familia de modelos multimodales (imagen y texto) con soporte de contexto de hasta 256.000 tokens y más de 140 idiomas. Esta versión cuantizada conserva la arquitectura completa, incluyendo la torre de visión, pero no incluye módulos de audio (a diferencia de otras variantes de Gemma 4). La cuantización se aplica únicamente a los pesos de las capas lineales del modelo de lenguaje, mientras que los embeddings, la torre de visión y las normas se mantienen en bfloat16.

La relevancia de esta ficha radica en que ofrece una alternativa más pequeña que la cuantización QAT oficial de Google (23,27 GB), permitiendo desplegar Gemma 4 31B en tarjetas de 24 GB con contextos cortos, a costa de una posible pérdida de calidad por el método RTN.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto) con atención deslizante y global, capas de visión dedicadas |
| Parametros totales | 31.273.088.876 (31,27 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (máximo) |
| Tipos de cuantizacion | int4 W4A16 (peso-only, grupo 128, simétrico) |
| Idiomas soportados | No especificado en la model card; el modelo base Gemma 4 soporta más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo original `gemma-4-31B-it` es un transformer multimodal denso de 31 B parámetros. Utiliza una arquitectura con 60 capas de lenguaje que intercalan 50 capas de atención deslizante (ventana de 1024 tokens, 16 cabezas KV) con 10 capas globales (cada 6ª capa, 4 cabezas KV y dimensión de cabeza global 512). La atención global usa claves y valores unificados (`attention_k_eq_v: true`), lo que reduce el número de pesos. Incluye una torre de visión dedicada (intermediate_size de 4304) y un proyector de visión. No dispone de torre de audio en esta versión de 31 B.

Esta cuantización se ha generado mediante `llmcompressor.model_free_ptq`, aplicando cuantización de pesos a int4 con grupo de tamaño 128 y esquema simétrico, sin usar datos de calibración ni cargar el modelo. Se convirtieron 410 módulos lineales del modelo de lenguaje, que representan el 79,2% de los bytes del checkpoint. Los pesos del `embed_tokens` (que está atado al head de salida) y de la torre de visión se mantienen en bfloat16, así como las normas y escalares. Esta decisión evita errores de carga con los kernels Marlin y mantiene la precisión en capas sensibles.

## Capacidades

- Generación de texto y razonamiento en más de 140 idiomas (según el modelo base).
- Comprensión y generación a partir de imágenes (pipeline `image-text-to-text`).
- Soporte de tool calling (function calling) mediante el parser `gemma4` en vLLM.
- Modo de pensamiento (thinking) habilitable mediante `chat_template_kwargs` con `enable_thinking=true`; por defecto está desactivado.
- Soporte de decodificación especulativa con modelo borrador (característica del modelo base).
- Ventana de contexto de hasta 256K tokens, con cache KV deslizante que limita el crecimiento para las capas de atención deslizante.
- No incluye procesamiento de audio (a diferencia de otras variantes de Gemma 4).

## Casos de uso

- Despliegue en servidores con GPU de 24 GB: la cuantización reduce el modelo a 19,07 GB, por lo que con una tarjeta como RTX 4090 es posible ejecutar Gemma 4 31B con contexto de hasta 32K tokens si se activa `--language-model-only` y se limita la memoria de activaciones.
- Asistentes conversacionales con contexto largo: la ventana de 256K permite mantener conversaciones multi-turno extensas, aunque la memoria de KV cache crece linealmente en las capas globales (~80 KB/token).
- Generación de código con tool calling: el modelo soporta el parser `gemma4` y puede integrarse en pipelines de desarrollo con llamadas a funciones externas.
- Análisis de imágenes y documentos: gracias a la torre de visión, se puede usar para describir imágenes, extraer información de capturas o realizar OCR en combinación con el texto.
- Aplicaciones multilingües: su soporte de más de 140 idiomas lo hace adecuado para traducción automática, generación de contenido localizado o atención al cliente en múltiples lenguas.
- Prototipado rápido en entornos de investigación: al ser una cuantización sin entrenamiento, se puede probar el rendimiento de Gemma 4 31B en hardware modesto antes de optar por una versión QAT o completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. La model card del autor indica que las capacidades y evaluaciones pertenecen al modelo base `google/gemma-4-31B-it`; se recomienda consultar la model card oficial de Google para obtener métricas de MMLU, HumanEval, GSM8K u otros. No se proporcionan datos de latencia o throughput en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + KV cache) según el contexto:
  - 32K tokens: ~22,5 GB (incluye 19,07 GB de pesos).
  - 128K tokens: ~30,4 GB.
  - 256K tokens (máximo): ~40,9 GB.
- GPU recomendada: tarjetas de 48 GB (por ejemplo, A6000, RTX A6000 o H100 48GB) para contextos de 128K sin problemas. Una GPU de 24 GB (RTX 4090, RTX 3090) puede ejecutar el modelo con contexto corto (32K) si se usa `--language-model-only` para omitir la torre de visión.
- Despliegue recomendado: vLLM (versión >= 0.28 para compatibilidad con `transformers >= 5.15`; también funciona con vLLM 0.25.1–0.27 si se usa `transformers < 5.15`). Se puede usar también con `transformers` directamente, pero se requiere la versión 5.10.1 o superior.
- Los kernels Marlin para int4 requieren compute capability 7.5 o superior (NVIDIA Turing o posterior).

## Comparativa con modelos similares

| Modelo | Tamaño (GB) | Método | Grupo | Contexto | Licencia |
|---|---|---|---|---|---|
| `GotoAI-Inc/gemma-4-31B-it-W4A16` (este) | 19,07 | RTN post-training (sin calibración) | 128 | 256K | Apache 2.0 |
| `google/gemma-4-31B-it-qat-w4a16-ct` | 23,27 | Quantization-aware training | 32 | 256K | Apache 2.0 |
| `google/gemma-4-31B-it` (base bf16) | 62,55 | Original | - | 256K | Apache 2.0 |

La versión QAT de Google ofrece una calidad superior al estar entrenada para cuantización, pero ocupa 4,2 GB más. La versión RTN aquí presentada es más ligera y cabe en una GPU de 24 GB con contexto reducido, aunque puede presentar mayor degradación en tareas sensibles a la precisión. El modelo base bf16 es el más fiel pero requiere hardware de mayor capacidad.

## Limitaciones y advertencias

- La cuantización RTN sin calibración puede provocar una pérdida de calidad perceptible en tareas de razonamiento complejo o matemáticas, en comparación con la versión QAT de Google.
- La torre de visión y el `embed_tokens` se mantienen en bfloat16, lo que incrementa el uso de VRAM; en una GPU de 24 GB, el contexto debe limitarse a unos 32K tokens y se debe usar `--language-model-only` para omitir la torre de visión.
- No se ha realizado ningún entrenamiento adicional; el modelo hereda los sesgos y limitaciones del modelo base (riesgo de alucinaciones, sesgos de género, raza, etc.).
- El modo de pensamiento (thinking) está desactivado por defecto; debe activarse explícitamente mediante `chat_template_kwargs`.
- Existen restricciones de compatibilidad entre versiones de vLLM y `transformers`; usar `transformers >= 5.15` con vLLM <= 0.27.1 provoca un error de configuración.
- No se proporciona soporte de audio, a diferencia de otras variantes de Gemma 4 (E2B, E4B, 12B).
- La model card advierte que esta es una cuantización no oficial y no afiliada a Google; se recomienda usar la versión QAT oficial si la calidad es crítica.

## Enlaces

- [Modelo en Hugging Face (GotoAI-Inc/gemma-4-31B-it-W4A16)](https://huggingface.co/GotoAI-Inc/gemma-4-31B-it-W4A16)
- [Modelo base oficial (google/gemma-4-31B-it)](https://huggingface.co/google/gemma-4-31B-it)
- [Cuántización QAT oficial de Google (gemma-4-31B-it-qat-w4a16-ct)](https://huggingface.co/google/gemma-4-31B-it-qat-w4a16-ct)
- [Página oficial de Gemma 4 de Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Documentación de Gemma 4 para desarrolladores de Google](https://ai.google.dev/gemma/docs/core)
- [Anuncio de Gemma 4 en el blog de Google](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
