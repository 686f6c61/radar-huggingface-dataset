# airagrp/Qwen3.8-27B-MLX-nvfp4-mixed

## Resumen

El modelo `airagrp/Qwen3.8-27B-MLX-nvfp4-mixed` es una conversión a formato MLX del modelo multimodal `Qwen/Qwen3.8-27B` de Alibaba, publicada bajo licencia Apache 2.0. Se trata de un modelo denso de visión-lenguaje (VLM) que procesa texto, imágenes y vídeo, con una ventana de contexto nativa de 262 144 tokens, ampliable hasta 1 millón mediante la técnica YaRN. La conversión emplea una receta de cuantización mixta de precisión: las capas MLP se cuantizan a nvfp4 (4 bits, grupo de 16) mientras que la atención, los embeddings, la cabeza de salida y la torre de visión se mantienen en bfloat16, logrando un tamaño efectivo de aproximadamente 31 GB frente a los 54 GB del checkpoint original en bfloat16.

El checkpoint incluye además la cabeza MTP (Multi-Token Prediction) fusionada, lo que permite activar decodificación especulativa en mlx-vlm sin necesidad de un modelo auxiliar separado. Al estar orientado a MLX, su ejecución está optimizada para Apple Silicon, aunque el modelo base original tiene soporte en otros entornos como vLLM. La relevancia actual radica en que ofrece capacidades multimodales de alto nivel con un consumo de memoria moderado, lo que lo convierte en una opción atractiva para despliegues locales en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso con atención lineal (GDN) y MTP integrado |
| Parametros totales | 14 946 857 712 (según safetensors; el nombre comercial indica 27B) |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, ampliable a 1 048 576 vía YaRN |
| Tipos de cuantizacion | nvfp4 (4 bits, grupo 16) para MLP; bfloat16 para atención, embeddings, head, MTP y vision tower |
| Idiomas soportados | Inglés (según etiqueta del repositorio; el modelo base puede soportar más, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un VLM denso desarrollado por Alibaba que combina un codificador de visión con un transformer de lenguaje. Una característica destacable es el uso de atención lineal GDN (Global Diagonal Network) en la mayoría de las capas, lo que reduce el coste computacional en secuencias largas, mientras que una parte de las capas de atención conserva la atención completa. El checkpoint convertido a MLX mantiene esta arquitectura y añade la cabeza MTP, que predice múltiples tokens futuros en paralelo para acelerar la generación mediante decodificación especulativa.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset o uso de RLHF/DPO) en la documentación proporcionada. La conversión a MLX fue realizada por el autor `airagrp` utilizando la librería `mlx-vlm` en su versión 0.6.17, aplicando una cuantización mixta que preserva la precisión en las partes críticas (atención, embeddings y cabeza de salida) mientras comprime las capas MLP a 4 bits.

## Capacidades

- Procesamiento multimodal: acepta entradas de texto, imágenes y vídeo, generando respuestas textuales coherentes con el contenido visual.
- Generación de texto y razonamiento: hereda las capacidades del modelo Qwen3.8-27B, incluyendo razonamiento lógico, matemáticas y comprensión de contexto largo.
- Decodificación especulativa: gracias al MTP integrado, puede acelerar la generación en mlx-vlm usando `--draft-kind mtp`.
- Integración con MLX: optimizado para Apple Silicon, con carga directa mediante `mlx_vlm.load`.
- Soporte de cuantización mixta: combina nvfp4 y bfloat16, reduciendo el uso de memoria sin comprometer excesivamente la precisión.
- Contexto largo: ventana nativa de 262 144 tokens, ampliable a 1M, adecuada para documentos extensos o vídeos de larga duración.

## Casos de uso

- Análisis de vídeo en local: el modelo puede procesar vídeos completos para generar resúmenes, detección de eventos o descripciones, gracias a su contexto largo y capacidad multimodal, ejecutándose en un Mac con 24 GB de memoria unificada.
- Asistente de documentación técnica: dado un PDF con diagramas, capturas de pantalla o tablas, el modelo extrae información y responde preguntas en lenguaje natural, útil para equipos de ingeniería y soporte.
- Generación de descripciones de productos: a partir de imágenes de un catálogo, el modelo produce textos descriptivos para comercio electrónico, aprovechando su comprensión visual y de lenguaje.
- Chat multimodal en aplicaciones de escritorio: integración en herramientas de productividad que requieran conversación con imágenes adjuntas, como Slack o Teams, usando MLX en hardware Apple.
- Moderación de contenido visual: análisis de imágenes y vídeos para detectar contenido inapropiado o clasificar material, con despliegue local para cumplir requisitos de privacidad.
- Prototipado de agentes de visión: combinado con frameworks de agentes, el modelo puede interpretar capturas de pantalla y ejecutar acciones basadas en instrucciones textuales, útil para automatización de tareas GUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original de `Qwen/Qwen3.8-27B` referencia métricas como MMLU, HumanEval o GSM8K, pero no se incluyen en el repositorio convertido ni en los resultados de búsqueda web consultados.

## Requisitos de hardware

- En Apple Silicon con MLX: requiere aproximadamente 16-19 GB de memoria unificada, siendo recomendable un Mac con 24 GB o más. Un Mac con 16 GB no es suficiente.
- Almacenamiento: el checkpoint ocupa unos 31 GB en disco.
- Para GPU NVIDIA: no se ofrecen datos específicos en la información consultada. El modelo base tiene soporte vLLM, pero la versión MLX está pensada para Apple Silicon.
- Despliegue: mediante `mlx-vlm` (Python o CLI), o directamente con la librería MLX. También está disponible en Ollama bajo la etiqueta `qwen3.8:27b-mlx` desde la versión 0.32.12.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría (por ejemplo, Qwen2.5-VL-27B o Llama-3.2-11B-Vision) en términos de benchmarks o rendimiento medido. La ficha del modelo base original podría contener dicha comparativa, pero no está incluida en los materiales proporcionados.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede generar contenido factualmente incorrecto o reflejar sesgos presentes en sus datos de entrenamiento. No se dispone de evaluaciones específicas para esta conversión.
- Idioma: la etiqueta del repositorio indica únicamente inglés; el rendimiento en otros idiomas no está confirmado.
- Cuantización nvfp4: la compresión de las capas MLP a 4 bits puede introducir una ligera degradación en la calidad de generación en comparación con el checkpoint original en bfloat16.
- Requisitos de memoria: el tamaño efectivo de 31 GB puede ser prohibitivo para hardware con memoria limitada; en Macs con 16 GB no es viable.
- Dependencia de MLX: el checkpoint está diseñado para el ecosistema MLX; su uso fuera de Apple Silicon requeriría conversión adicional no documentada.
- Licencia: Apache-2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base original para posibles cláusulas adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/airagrp/Qwen3.8-27B-MLX-nvfp4-mixed
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de hardware (contextstudios.ai): https://www.contextstudios.ai/blog/qwen-3-8-27b-hardware-guide
- Guía MLX en Apple Silicon (orcarouter.ai): https://www.orcarouter.ai/blog/qwen-3-8-27b-mlx
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
