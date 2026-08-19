# luluw/Multilingual-E5-Large-Nep-GGUF

## Resumen

El modelo `luluw/Multilingual-E5-Large-Nep-GGUF` es una conversión a formato GGUF de `alphaedge-ai/multilingual-e5-large-nep-16384`, una versión recortada del conocido modelo de embeddings multilingües `intfloat/multilingual-e5-large`, optimizada específicamente para el nepalí. El recorte reduce el vocabulario de 250.037 a 16.384 tokens (una reducción del 93,44 %) y los parámetros de 559.890.432 a 320.665.600 (una reducción del 42,73 %), lo que se traduce en un modelo notablemente más ligero y eficiente en memoria, manteniendo un rendimiento similar para el dominio lingüístico seleccionado (nepalí e inglés). Esta versión GGUF permite ejecutar el modelo en motores de inferencia compatibles con este formato, como `llama.cpp`, facilitando su uso en entornos locales o con recursos limitados. El modelo está pensado para tareas de similitud semántica, búsqueda de documentos y sistemas RAG, especialmente en nepalí, aunque también funciona en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) |
| Parametros totales | 320.665.600 (según model card) / 319.613.952 (según safetensors) |
| Parametros activos | Todos (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | ne (nepalí), en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `intfloat/multilingual-e5-large` es un encoder transformer basado en XLM-RoBERTa, con 24 capas y una dimensión de embedding de 1024. Fue entrenado mediante contraste pre-training sobre 1.000 millones de pares de texto multilingües, seguido de un fine-tuning con datos etiquetados de tareas como recuperación de información y similitud textual. La versión recortada `alphaedge-ai/multilingual-e5-large-nep-16384` reduce el vocabulario original de 250.037 a 16.384 tokens, eliminando aquellos tokens poco frecuentes en los idiomas objetivo (nepalí e inglés). El recorte se realizó utilizando el dataset `lbourdois/fineweb-2-trimming`, con 29.721 textos para la minería de vocabulario. El proceso de conversión a GGUF se llevó a cabo con `llama.cpp`, ajustando el código para manejar la ausencia de `precompiled_charsmap` en el tokenizer del modelo fuente.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica.
- Búsqueda semántica y recuperación de documentos en nepalí e inglés.
- Soporte de sistemas RAG (Retrieval-Augmented Generation) como componente de recuperación.
- Similitud textual y reranking de resultados.
- Compatible con el formato GGUF, lo que permite su uso en motores como `llama.cpp` y aplicaciones que lo integran.
- No soporta generación de texto, tool calling ni agentes; es exclusivamente un modelo de embeddings.

## Casos de uso

- **Búsqueda semántica en nepalí**: el modelo permite indexar y recuperar documentos en nepalí con alta precisión, superando las limitaciones de los métodos basados en palabras clave. Se usaría para construir índices vectoriales de contenido nepalí en motores de búsqueda.
- **Sistemas RAG en nepalí**: al ser ligero y eficiente, puede integrarse en pipelines de generación aumentada por recuperación para responder preguntas sobre documentos nepalíes, combinando el embedding con un modelo generativo.
- **Deduplicación de contenido**: dado su tamaño reducido, es adecuado para detectar duplicados o variaciones de texto en grandes corpus nepalíes, por ejemplo en plataformas de noticias o redes sociales.
- **Clasificación de documentos**: los embeddings generados pueden servir como entrada para clasificadores supervisados, por ejemplo para categorizar artículos en nepalí por tema o sentimiento.
- **Búsqueda multilingüe limitada**: aunque optimizado para nepalí, también funciona en inglés, permitiendo consultas cruzadas entre ambos idiomas en aplicaciones bilingües.
- **Inferencia en dispositivos con recursos limitados**: gracias a su reducción de parámetros y las cuantizaciones Q4/Q6, puede ejecutarse en CPUs o GPUs de gama baja, incluso en entornos embebidos, para tareas de similitud en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión recortada en la información disponible. El modelo original `intfloat/multilingual-e5-large` reporta resultados en el paper técnico (arXiv:2402.05672), pero no se dispone de datos comparativos para la variante nepalí recortada. Se recomienda evaluar el modelo en el dominio objetivo antes de su uso en producción.

## Requisitos de hardware

- **VRAM estimada**: con 320 millones de parámetros, el modelo en FP16 ocupa aproximadamente 640 MB, en Q8_0 unos 320 MB, en Q6_K unos 240 MB y en Q4_K_M unos 160 MB. Estas cifras son estimaciones orientativas basadas en el tamaño de parámetros.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM puede ejecutar la versión FP16 (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). Las versiones cuantizadas pueden ejecutarse incluso en GPUs integradas o en CPU.
- **CPU**: las cuantizaciones Q4_K_M y Q6_K son viables en CPU con instrucciones AVX2, con latencias de decenas de milisegundos por lote de frases.
- **Opciones de despliegue**: compatible con `llama.cpp`, `Ollama` (si se integra como modelo de embeddings), y cualquier framework que soporte GGUF para embeddings (por ejemplo, `llama-cpp-python`).
- **Latencia y throughput**: no se dispone de datos medidos. Para un modelo de este tamaño, se espera un throughput de cientos de frases por segundo en GPU moderna, pero no se puede confirmar sin pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `luluw/Multilingual-E5-Large-Nep-GGUF` | ~320 M | 16.384 | ne, en | MIT | GGUF |
| `intfloat/multilingual-e5-large` | ~560 M | 250.037 | 100+ | MIT | Safetensors, etc. |
| `intfloat/multilingual-e5-base` | ~278 M | 250.037 | 100+ | MIT | Safetensors, etc. |

La versión recortada es un 42,73 % más pequeña que el original, con un vocabulario reducido en un 93,44 %. Esto la hace más eficiente en memoria y velocidad para tareas centradas en nepalí, pero con rendimiento degradado en otros idiomas. Comparada con `multilingual-e5-base`, tiene más parámetros (320 M vs 278 M) pero un vocabulario mucho menor, lo que puede afectar a la cobertura léxica fuera de los idiomas objetivo.

## Limitaciones y advertencias

- **Degradación en idiomas no objetivo**: el recorte del vocabulario elimina tokens poco frecuentes en nepalí e inglés, por lo que el rendimiento en otros idiomas será significativamente inferior al del modelo original.
- **Alucinación y sesgos**: al ser un modelo de embeddings, no genera texto, por lo que no hay riesgo de alucinación. Sin embargo, los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento del modelo base.
- **Contexto limitado**: no se ha especificado la longitud máxima de contexto; el modelo base E5 tiene un máximo de 512 tokens, que probablemente se mantiene, pero no está confirmado.
- **Tokenizer modificado**: la conversión a GGUF requirió ajustes por la ausencia de `precompiled_charsmap` en el tokenizer fuente. Esto puede provocar incompatibilidades con herramientas que esperen un tokenizer XLM-RoBERTa estándar.
- **Restricciones de licencia**: aunque la licencia es MIT, el modelo base original tiene su propia licencia (también MIT), pero se recomienda verificar los términos de los modelos fuente antes de uso comercial.
- **Sin soporte de generación**: no es un modelo generativo; solo produce embeddings. No debe usarse para tareas que requieran texto de salida.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/luluw/Multilingual-E5-Large-Nep-GGUF)
- [Modelo fuente recortado (alphaedge-ai)](https://huggingface.co/alphaedge-ai/multilingual-e5-large-nep-16384)
- [Modelo base original (intfloat/multilingual-e5-large)](https://huggingface.co/intfloat/multilingual-e5-large)
- [Paper técnico Multilingual E5 (arXiv:2402.05672)](https://arxiv.org/abs/2402.05672)
- [Dataset de minería para trimming (lbourdois/fineweb-2-trimming)](https://huggingface.co/datasets/lbourdois/fineweb-2-trimming)
- [Blog de introducción al trimming](https://huggingface.co/blog/lbourdois/introduction-to-trimming)
