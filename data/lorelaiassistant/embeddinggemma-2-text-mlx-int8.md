# lorelaiassistant/embeddinggemma-2-text-mlx-int8

## Resumen

`lorelaiassistant/embeddinggemma-2-text-mlx-int8` es una cuantización int8 del backbone de texto del modelo de embeddings `google/embeddinggemma-2`, empaquetada para el framework MLX de Apple Silicon. El autor, `lorelaiassistant`, ha eliminado las torres de visión y audio del checkpoint original y ha conservado únicamente la rama de texto, el pooling y la proyección, de modo que los vectores resultantes viven en el mismo espacio vectorial que los del modelo completo. El resultado son 288 MB de pesos (271.002.648 parámetros) frente a los aproximadamente 1,23 GB de una conversión multimodal int8 completa.

El modelo resuelve el problema de ejecutar un encoder de frases de calidad en hardware Apple sin renunciar a la fidelidad numérica: según la model card, la cuantización int8 con `group_size=64` iguala al referencia fp32 en todas las métricas de recuperación medidas (MRR@10 en polaco de 0,856, hit@5 de 0,95, MRR@10 en inglés de 0,811) y mantiene una similitud coseno mínima de 0,9995 frente a fp32 en documentos y 0,9993 en consultas.

Es relevante ahora porque permite montar pipelines de búsqueda semántica y RAG completamente locales en Macs con chip de la serie M, con un modelo derivado de la familia Gemma 2 y licencia Apache 2.0. La salida es un vector de 768 dimensiones L2-normalizado, con truncamiento Matryoshka a 512 o 256 dimensiones (truncar y re-normalizar).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone de texto de EmbeddingGemma 2), text-only; torres de visión y audio eliminadas (`vision_config` y `audio_config` a `null`) |
| Parametros totales | 271.002.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 affine con `group_size=64` (repo publicado); la model card reporta también variantes bf16 e int6 |
| Idiomas soportados | no disponible oficialmente; la model card documenta evaluación en polaco e inglés |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (librería `mlx`); tamaño del repo 0,3 GB |
| Dimension de embedding | 768 (L2-normalizado); truncable a 512 o 256 vía Matryoshka |
| Pipeline | feature-extraction |
| Modelo base | google/embeddinggemma-2 (relación: quantized) |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un reentrenamiento: no se han publicado detalles sobre datos de entrenamiento, número de tokens ni fases de RLHF o DPO en la información disponible. Arquitectónicamente se trata de un transformer encoder que produce embeddings de frase mediante el mismo backbone de texto, pooling y proyección que el modelo original `google/embeddinggemma-2`; el autor ha eliminado explícitamente las torres multimodal (visión y audio) para reducir el tamaño del artefacto. Las capas lineales se han cuantizado a 8 bits affine con `group_size=64`, lo que reduce los pesos a 288 MB.

La innovación técnica destacable es la preservación de la fidelidad numérica: la model card reporta una similitud coseno mínima de 0,9995 (documentos) y 0,9993 (consultas) frente a la referencia fp32 del modelo completo, y métricas de recuperación idénticas a fp32 en el conjunto privado de evaluación. La variante int6, en cambio, degrada el ranking en polaco (MRR@10 de 0,842 frente a 0,856). El modelo es asimétrico y requiere prefijos de prompt manuales: `task: search result | query: ` para consultas y `title: none | text: ` para documentos. El loader no los añade automáticamente; otros prompts de tarea están en `config_sentence_transformers.json`. Advertencia del autor: no ejecutar en fp16, ya que las activaciones desbordan y producen NaN; usar cómputo bf16 o fp32.

## Capacidades

- Generación de embeddings de texto de 768 dimensiones, L2-normalizados, para búsqueda semántica y recuperación.
- Truncamiento Matryoshka a 512 o 256 dimensiones (truncar y volver a normalizar) para reducir coste de almacenamiento e índice.
- Recuperación asimétrica: prefijos distintos para consulta y documento, con prompts de tarea adicionales definidos en `config_sentence_transformers.json`.
- Ejecución nativa en Apple Silicon mediante MLX, con integración en Swift a través de `MLXEmbedders` (requiere una build de `mlx-swift-lm` con el loader `embedding_gemma2`, fusionado en `main` después del 2026-10-12).
- Compatibilidad con la interfaz de `sentence-transformers` a nivel de pipeline (`feature-extraction`).
- Capacidad multilingüe: no documentada oficialmente; la evaluación publicada cubre polaco e inglés.
- No soporta visión, audio, tool calling ni razonamiento multi-paso: es exclusivamente un encoder de texto.

## Casos de uso

- Búsqueda semántica local en macOS: indexar documentos y consultar por similitud coseno con el modelo ejecutándose en la GPU unificada de un chip M, sin enviar datos a la nube, gracias a los 288 MB de pesos.
- RAG sobre corpus privados: generar embeddings de fragmentos con el prefijo `title: none | text: ` y de las preguntas del usuario con `task: search result | query: `, manteniendo la asimetría que el modelo espera.
- Deduplicación y clustering de textos: usar los vectores de 768 dimensiones (o su truncamiento a 256) para agrupar documentos similares en pipelines de limpieza de datos.
- Aplicaciones iOS y macOS nativas: integrar el modelo vía `MLXEmbedders` en Swift para búsqueda dentro de la app sin dependencias de servidor.
- Sistemas de recomendación de contenido: calcular similitud entre artículos, notas o entradas de un usuario usando el truncamiento Matryoshka para ajustar el equilibrio entre precisión y memoria del índice.
- Filtrado previo en pipelines de moderación o clasificación: usar los embeddings como features de entrada para un clasificador ligero entrenado aparte, aprovechando la fidelidad int8 frente a fp32.
- Evaluación comparativa de cuantizaciones: servir como referencia práctica para medir la pérdida de calidad de int8 e int6 en tareas de recuperación multilingüe.

## Benchmarks y rendimiento

Datos de la model card, medidos sobre un conjunto privado de recuperación (387 hechos cortos de usuario, 40 consultas en polaco y 15 en inglés) contra la referencia PyTorch fp32 del modelo completo:

| Variante | Dim | Coseno mín. vs fp32 (docs / queries) | PL MRR@10 | PL hit@5 | EN MRR@10 |
|---|---|---|---|---|---|
| fp32 referencia | 768 | — | 0,856 | 0,95 | 0,811 |
| bf16 | 768 | 0,9999 / 0,9998 | 0,856 | 0,95 | 0,800 |
| int8 (este repo) | 768 | 0,9995 / 0,9993 | 0,856 | 0,95 | 0,811 |
| int6 | 768 | 0,9968 / 0,9974 | 0,842 | 0,95 | 0,811 |

No se han publicado resultados en benchmarks estándar (MMLU, MTEB, etc.) en la información disponible.

## Requisitos de hardware

- VRAM: 288 MB de pesos en int8; el repo ocupa 0,3 GB. El consumo real de memoria depende del tamaño de lote y de la longitud de secuencia, no disponibles.
- Hardware objetivo: Apple Silicon (serie M) mediante MLX. No está pensado para GPU NVIDIA ni para CPU x86 con CUDA.
- Cabe holgadamente en cualquier Mac con chip M; el cuello de botella será el tamaño de lote y la longitud de los textos, no los pesos.
- Despliegue: MLX (Python) y `MLXEmbedders` sobre `mlx-swift-lm` en Swift. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Precisión de cómputo: usar bf16 o fp32; fp16 produce NaN por desbordamiento de activaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dim embedding | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Este modelo (embeddinggemma-2 text int8 MLX) | 271 M | no disponible | 768 (truncable a 512/256) | Apache 2.0 | safetensors / MLX |
| google/embeddinggemma-2 (completo, multimodal) | no disponible | no disponible | 768 | Apache 2.0 | safetensors / PyTorch |
| Variante bf16 del mismo backbone | 271 M | no disponible | 768 | Apache 2.0 | safetensors / MLX |
| Variante int6 del mismo backbone | 271 M | no disponible | 768 | Apache 2.0 | safetensors / MLX |

No se dispone de datos de benchmarks comparativos frente a otros modelos de embeddings de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: las capacidades de visión y audio del modelo base se han eliminado; no se pueden recuperar desde este artefacto.
- No ejecutar en fp16: las activaciones desbordan y generan NaN. Usar bf16 o fp32.
- El modelo es asimétrico y el loader no añade los prefijos de prompt; si se omiten, la calidad de recuperación se degrada sin aviso.
- El truncamiento Matryoshka exige volver a normalizar después de truncar; omitirlo invalida la similitud coseno.
- Idiomas: la evaluación publicada solo cubre polaco e inglés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación: no aplica directamente, ya que el modelo no genera texto; el riesgo se traslada al sistema que consuma los embeddings (recuperación de documentos irrelevantes).
- Sesgos: no documentados en la información disponible; heredables del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `google/embeddinggemma-2`.
- Dependencia de una build reciente de `mlx-swift-lm` (posterior al 2026-10-12) para el loader `embedding_gemma2` en Swift.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- Las métricas de fidelidad proceden de un conjunto privado pequeño (40 consultas en polaco, 15 en inglés); no son un benchmark público reproducible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lorelaiassistant/embeddinggemma-2-text-mlx-int8
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Framework MLX: https://github.com/ml-explore/mlx
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.
