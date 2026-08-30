# rakuten-junliu/RakutenAI-3.0-W4A8

## Resumen

RakutenAI-3.0-W4A8 es una versión cuantizada de precisión mixta del modelo RakutenAI-3.0, desarrollado por Rakuten Group como parte del proyecto GENIAC. El modelo original es un MoE (Mixture of Experts) de 671 mil millones de parámetros basado en la arquitectura DeepSeek-V3, con atención MLA, 256 expertos enrutados y predicción multi-token (MTP). Esta cuantización reduce el tamaño del checkpoint a aproximadamente 341 GB, manteniendo un rendimiento casi idéntico al modelo FP8 original (94.39 en GSM8K y 85.26 en MMLU frente a 94.39 y 85.27 respectivamente).

La relevancia de esta ficha reside en que ofrece una ruta de despliegue eficiente para el mayor modelo de lenguaje japonés de código abierto, permitiendo su ejecución en clusters de 8 GPUs H100/H200 con tensor parallelism. Está pensado para entornos de producción donde el ahorro de memoria y el rendimiento son críticos, y su licencia Apache 2.0 facilita su uso comercial.

La cuantización se realizó con un conjunto de calibración mixto japonés/inglés de 820 muestras, empleando TensorRT-Model-Optimizer para las escalas de activación FP8 per-tensor y exportando los pesos de los expertos enrutados a INT4 con grupo de tamaño 128. El checkpoint se distribuye en formato TensorRT-LLM `MIXED_PRECISION` (también conocido como `w4afp8` en sglang).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en DeepSeek-V3 (MLA, 256 expertos enrutados, MTP) |
| Parametros totales | 349.181.667.416 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no se especifica en la documentación) |
| Tipos de cuantizacion | W4A8: INT4 (expertos enrutados, grupo 128) + FP8 (activaciones y resto de capas) |
| Idiomas soportados | Japonés, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (TensorRT-LLM `MIXED_PRECISION` / `w4afp8`) |

## Arquitectura y entrenamiento

El modelo base RakutenAI-3.0 emplea una arquitectura de mezcla de expertos (MoE) con atención de latencia múltiple (MLA) y predicción multi-token (MTP). Dispone de 256 expertos enrutados, de los cuales se activa un subconjunto por token, y una capa de atención compartida. No se dispone de información detallada sobre el entrenamiento del modelo original (número de tokens, dataset, método de alineación) en la documentación proporcionada.

La cuantización W4A8 se realizó mediante calibración con un conjunto mixto de 820 muestras en japonés e inglés, que incluye datos de identidad, seguridad, instrucciones, Wikipedia y noticias. Las escalas de activación se obtuvieron con TensorRT-Model-Optimizer en modo FP8 per-tensor, mientras que los pesos de los expertos enrutados se cuantizaron a INT4 con grupo de tamaño 128 y se exportaron a través del pipeline de exportación MoE de TensorRT-LLM. El resto de las capas (atención, expertos compartidos y las primeras 3 capas densas) conservan los pesos FP8 con escalas por bloque del modelo original.

## Capacidades

- Generación de texto en japonés e inglés, con buen rendimiento en tareas de razonamiento matemático (GSM8K 5-shot: 94.39) y conocimiento general (MMLU: 85.26).
- Soporte de conversaciones multi-turno a través de la API de chat compatible con OpenAI (ver ejemplo en la model card).
- Capacidad de procesamiento de instrucciones y preguntas en ambos idiomas.
- Al ser una cuantización del modelo base, hereda las capacidades del modelo original, aunque no se documentan explícitamente capacidades como tool calling, agentes o visión en la información disponible.
- No se especifica soporte para funciones adicionales como modo de razonamiento extendido, audio o visión.

## Casos de uso

- Asistente conversacional en japonés para atención al cliente: el modelo puede gestionar consultas multi-turno en japonés con baja latencia gracias a la cuantización, permitiendo su despliegue en entornos empresariales con GPUs H100.
- Generación de respuestas en entornos de producción con alta concurrencia: al reducir el checkpoint a 341 GB, se puede servir con tensor parallelism 8 en un clúster de 8 H100, manteniendo un rendimiento cercano al FP8.
- Procesamiento de documentos y extracción de información en japonés e inglés: el modelo puede resumir, clasificar o responder preguntas sobre textos largos, aunque no se especifica la longitud máxima de contexto.
- Desarrollo de aplicaciones multilingües japonés-inglés: su bilingüismo permite construir sistemas de traducción o generación de contenido en ambos idiomas.
- Investigación en eficiencia de modelos: sirve como referencia para estudiar el impacto de la cuantización W4A8 en modelos MoE de gran escala, comparando métricas con el baseline FP8.
- Despliegue en entornos con restricciones de memoria: al ocupar 341 GB frente a los más de 600 GB del modelo FP8, permite ejecutar el modelo en configuraciones de hardware más reducidas, siempre que se disponga de GPUs Hopper.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados medidos con sglang, tensor parallelism 8 y decodificación greedy:

| Modelo | GSM8K (5-shot) | MMLU |
|---|---|---|
| FP8 baseline (RakutenAI-3.0) | 94.39 | 85.27 |
| **RakutenAI-3.0-W4A8** | 94.39 | 85.26 |

La degradación de rendimiento respecto al baseline FP8 es prácticamente nula (0.01 puntos en MMLU, 0 en GSM8K), lo que indica que la cuantización W4A8 conserva la calidad del modelo original.

## Requisitos de hardware

- Arquitectura GPU obligatoria: Hopper (SM90), es decir, H100 o H200. No es compatible con Blackwell (SM100) ni con GPUs de generaciones anteriores.
- Tamaño del checkpoint: aproximadamente 341 GB.
- Configuración probada: 8 GPUs H100-80GB con tensor parallelism 8 y `--mem-fraction-static 0.85`.
- VRAM total necesaria: al menos 341 GB, por lo que 8 H100-80GB (640 GB) son suficientes.
- Inferencia en una sola GPU: no es viable dado el tamaño del modelo; se requiere paralelismo entre GPUs.
- Opciones de despliegue: sglang (verificado), y potencialmente vLLM o TGI si soportan el formato `w4afp8`, aunque no se documenta en la model card.
- Latencia y throughput: no se proporcionan datos concretos en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | GSM8K | MMLU | Licencia |
|---|---|---|---|---|---|---|
| RakutenAI-3.0 (FP8) | 349B (MoE) | FP8 | no disponible | 94.39 | 85.27 | Apache 2.0 |
| **RakutenAI-3.0-W4A8** | 349B (MoE) | W4A8 (INT4+FP8) | no disponible | 94.39 | 85.26 | Apache 2.0 |
| RakutenAI-3.0-NVFP4 | 349B (MoE) | NVFP4 | no disponible | no disponible | no disponible | Apache 2.0 |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos MoE de tamaño similar en la información proporcionada. El NVFP4 está pensado para GPUs Blackwell, mientras que el W4A8 es exclusivo para Hopper.

## Limitaciones y advertencias

- Compatibilidad restringida: solo se ejecuta en GPUs Hopper (SM90). No funciona en Blackwell ni en arquitecturas anteriores.
- Sin soporte para Blackwell: el kernel CUTLASS W4A8 está compilado únicamente para sm90; en Blackwell el arranque del servidor aborta con un error de MMA condicionado por arquitectura.
- Idioma: solo japonés e inglés, sin soporte para otros idiomas como español o francés.
- Longitud de contexto no documentada: se desconoce la ventana máxima de contexto soportada, lo que puede limitar su uso en tareas que requieran documentos muy largos.
- Riesgo de alucinaciones y sesgos: al ser un modelo de lenguaje grande, puede generar contenido falso o sesgado, especialmente en temas sensibles. No se documentan medidas específicas de mitigación.
- Dependencia de herramientas específicas: el formato de checkpoint requiere sglang (o herramientas compatibles con `w4afp8`), lo que puede complicar la integración con otros frameworks de inferencia.
- Requisitos de hardware elevados: aunque la cuantización reduce el tamaño, sigue necesitando un clúster de 8 H100/H200, lo que limita su uso a organizaciones con esos recursos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/rakuten-junliu/RakutenAI-3.0-W4A8)
- [Modelo base RakutenAI-3.0](https://huggingface.co/Rakuten/RakutenAI-3.0)
- [Comunicado de prensa de Rakuten sobre Rakuten AI 3.0 (marzo 2026)](https://global.rakuten.com/corp/news/press/2026/0317_01.html)
- [Anuncio del lanzamiento de Rakuten AI 3.0 (diciembre 2025)](https://global.rakuten.com/corp/news/press/2025/1218_01.html)
- [Guía práctica de despliegue de Rakuten AI 3.0 desde Hugging Face](https://www.oflight.co.jp/en/columns/rakuten-ai-3-huggingface-deployment-guide)
