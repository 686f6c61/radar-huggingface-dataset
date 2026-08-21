# marzieh-maleki/hypogen-bart-large-puq

## Resumen

HypoGen-BART-Large-PUQ es un modelo de lenguaje basado en la arquitectura BART-large, publicado en el Hub de HuggingFace por la autora Marzieh Maleki. El nombre sugiere su integración en el marco HypoGen, descrito en el artículo "Sparks of Science: Hypothesis Generation Using Structured ..." (arXiv:2504.12976), donde se plantea la generación de hipótesis científicas como modelado de lenguaje condicional. El modelo está etiquetado como text2text-generation y se ha subido con pesos en formato safetensors, con un total de 406.341.721 parámetros.

El modelo se presenta como un checkpoint de BART-large adaptado para la tarea de generación de hipótesis a partir de un "Bit" de entrada, con una cadena de razonamiento explícita (Chain-of-Reasoning). Aunque la model card es prácticamente vacía, la arquitectura subyacente es la de BART (denoising autoencoder) con 12 capas de encoder y decoder, y una longitud de contexto típica de 512 tokens. Su relevancia radica en la aplicación de modelos transformer de tamaño medio a tareas científicas de descubrimiento, aunque la información pública es escasa y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART-large (Transformer encoder-decoder) |
| Parametros totales | 406.341.721 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (típico de BART, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de BART, un modelo transformer encoder-decoder con 12 capas en cada bloque y una dimensión de modelo de 1024 (BART-large). BART se preentrena con un objetivo de denoising: se corrompen secuencias de texto con ruido (eliminación de tokens, permutaciones, etc.) y el modelo debe reconstruir la secuencia original. Para este checkpoint concreto, la model card no proporciona información sobre el proceso de entrenamiento posterior, los datos utilizados ni las hiperparametros. Según el artículo de HypoGen (arXiv:2504.12976), el enfoque consiste en ajustar el modelo sobre el dataset Bit-Flip-Spark con una cadena de razonamiento explícita, y en inferencia se proporciona solo el "Bit" de entrada para generar la hipótesis. No hay información sobre si se usaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto condicional: el modelo está diseñado para generar hipótesis científicas a partir de una entrada estructurada (el "Bit").
- Razonamiento multi-paso: según el artículo, integra una cadena de razonamiento explícita que refleja el proceso intelectual de "Bit a Flip".
- Ajuste para generación de texto científico: orientado a dominios como la biomedicina o la física, aunque no se especifica el dominio exacto.
- Capacidades multilingües: no confirmadas; probablemente limitadas al inglés.
- Soporte de tool calling o funciones: no disponible.
- Capacidades de visión o audio: no aplica.

## Casos de uso

- Generación de hipótesis en investigación biomédica: el modelo puede tomar una observación inicial (el "Bit") y generar hipótesis plausibles, útil para acelerar el descubrimiento de conocimiento en dominios con gran volumen de literatura.
- Asistencia a revisión sistemática de literatura: dado un conjunto de hallazgos contradictorios, el modelo puede proponer explicaciones que integren la evidencia existente.
- Generación de propuestas de experimentos: a partir de una hipótesis inicial, puede esbozar pasos de validación o condiciones de contorno.
- Educación científica: como herramienta para que estudiantes generen hipótesis a partir de datos observacionales y contrasten sus propuestas.
- Integración en pipelines de descubrimiento de fármacos: combinado con bases de datos de compuestos y dianas, puede sugerir nuevas relaciones.
- Análisis de datos contradictorios en publicaciones: el modelo puede ayudar a identificar y reconciliar resultados discrepantes en la literatura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo asociado (arXiv:2504.12976) puede contener evaluaciones, pero no se proporcionan datos concretos en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: para BART-large con 406M de parámetros, se estima un consumo de memoria de 1.6 GB en fp32, y alrededor de 1.0 GB en fp16. En cuantización INT8, podría reducirse a 0.8 GB.
- GPU recomendadas: es viable en GPUs de consumo como RTX 3060 (12 GB) o superiores. Para inferencia en lote, se recomienda A10, A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, TGI (Text Generation Inference), y llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponible, pero para un modelo de 406M en una GPU moderna se espera una latencia de 50-100 ms por generación de 128 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hypogen-bart-large-puq | 406M | 512 | no disponible | Hugging Face |
| BART-large (original) | 406M | 512 | Apache 2.0 | Hugging Face |
| BART-base | 139M | 512 | Apache 2.0 | Hugging Face |
| T5-base | 220M | 512 | Apache 2.0 | Hugging Face |

La comparativa directa con otros modelos de generación de hipótesis no está disponible, ya que no hay datos públicos de rendimiento para este modelo.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar hipótesis plausibles pero falsas; no debe usarse como fuente de verdad en contextos críticos.
- Limitaciones de contexto: la ventana de 512 tokens limita la cantidad de información que se puede proporcionar como entrada.
- Idioma: probablemente limitado al inglés, aunque no se confirma.
- Licencia: no se especifica, por lo que no se puede garantizar el uso comercial.
- Documentación: la model card es automática y no aporta detalles de entrenamiento, datos o evaluación; se recomienda contactar con el autor para obtener información adicional.
- El modelo no está listo para producción sin una validación externa de su rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marzieh-maleki/hypogen-bart-large-puq
- Artículo HypoGen (arXiv): https://arxiv.org/abs/2504.12976
- Modelo base (BART-large) en Hugging Face: https://huggingface.co/facebook/bart-large
