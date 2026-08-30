# liodon-ai/bloomz-560m-FP8

## Resumen

El modelo `liodon-ai/bloomz-560m-FP8` es una cuantización en precisión FP8 (punto flotante de 8 bits) del modelo BLOOMZ-560M desarrollado originalmente por BigScience. La cuantización ha sido realizada por Liodon AI, un laboratorio de investigación independiente, utilizando la herramienta `llm-compressor` del proyecto vLLM. El objetivo principal es reducir el tamaño del modelo de 1,1 GB a 0,8 GB, manteniendo las capacidades funcionales del modelo original y permitiendo una inferencia más eficiente en GPUs modernas con soporte nativo para FP8.

Esta versión cuantizada resulta relevante para desarrolladores que necesitan desplegar modelos de lenguaje de tamaño pequeño en entornos con recursos limitados, como edge computing o aplicaciones en tiempo real, sin renunciar a la compatibilidad con frameworks de inferencia populares como vLLM, TGI y SGLang. Al tratarse de una cuantización dinámica sin calibración, los pesos son una conversión directa del modelo original, lo que evita sesgos introducidos por conjuntos de calibración.

La arquitectura subyacente es la del modelo BLOOMZ, un transformer decoder-only de 560 millones de parámetros, diseñado originalmente para tareas de generación de texto multilingüe. La cuantización no altera la arquitectura ni los parámetros, solo la representación numérica de los pesos y activaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura BLOOM) |
| Parametros totales | 559.214.592 (560M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico (E4M3) por canal para pesos, activaciones cuantizadas por token |
| Idiomas soportados | no disponible (heredados del modelo base, que es multilingüe) |
| Licencia | other (no especificada; se recomienda revisar la licencia del modelo base BLOOMZ) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base BLOOMZ-560M es un transformer decoder-only con 560 millones de parámetros, entrenado por BigScience como parte de la familia BLOOM. BLOOMZ es una variante ajustada para seguir instrucciones en múltiples idiomas, utilizando un conjunto de datos multilingüe y técnicas de fine-tuning supervisado. La arquitectura emplea atención causal estándar, capas de normalización y embeddings posicionales aprendidos, sin innovaciones específicas más allá de las del diseño original de BLOOM.

La cuantización FP8 se realiza con el esquema `FP8_DYNAMIC` de `llm-compressor`: los pesos se convierten a FP8 (E4M3) por canal de forma estática antes de la inferencia, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de ejecución. Este esquema no requiere un conjunto de calibración, por lo que la conversión es puramente numérica y no introduce sesgos adicionales. El `lm_head` se deja sin cuantizar, siguiendo la práctica estándar para preservar la calidad de la salida. No se ha realizado ningún entrenamiento adicional; el proceso es únicamente de cuantización.

## Capacidades

- Generación de texto: el modelo puede producir texto coherente en tareas de completado y generación libre, heredadas del modelo base.
- Multilingüismo: BLOOMZ fue entrenado en decenas de idiomas, por lo que esta versión cuantizada conserva esa capacidad multilingüe, aunque los idiomas exactos no se detallan en la información proporcionada.
- Instrucciones: al ser una variante BLOOMZ, está optimizado para seguir instrucciones en formato de tarea, como traducción, resumen o respuesta a preguntas.
- Compatibilidad con frameworks: soporta inferencia a través de vLLM, TGI y SGLang, lo que facilita su integración en pipelines de producción.
- No se especifican capacidades de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Despliegue en dispositivos edge: su tamaño reducido (0,8 GB) y su compatibilidad con FP8 permiten ejecutarlo en GPUs de gama media o incluso en sistemas embebidos con aceleradores NVIDIA, para tareas de generación de texto en tiempo real.
- Asistentes virtuales ligeros: puede integrarse en chatbots o asistentes de voz donde se requiera una respuesta rápida y un consumo de memoria bajo, aprovechando su capacidad multilingüe.
- Clasificación y etiquetado de texto: mediante prompts de instrucción, puede realizar tareas de análisis de sentimiento, categorización de documentos o extracción de entidades en múltiples idiomas.
- Traducción automática en entornos con recursos limitados: su naturaleza multilingüe permite usarlo como motor de traducción básico en aplicaciones donde no se dispone de servicios en la nube.
- Generación de contenido asistida: para redacción de borradores, resúmenes o reescritura de texto en aplicaciones de productividad, con la ventaja de poder ejecutarse localmente.
- Prototipado rápido y pruebas de concepto: al ser un modelo pequeño y fácil de desplegar con vLLM o TGI, es adecuado para validar ideas y flujos de trabajo antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base BLOOMZ-560M tiene métricas conocidas en tareas como MMLU o XNLI, pero esta ficha no incluye datos específicos de la versión cuantizada. Se recomienda evaluar el modelo en el conjunto de tareas objetivo para verificar que la cuantización no degrade significativamente el rendimiento.

## Requisitos de hardware

- VRAM estimada: el tamaño del modelo cuantizado es de 0,8 GB, por lo que se requiere al menos 1 GB de VRAM para la inferencia, dependiendo del framework y del tamaño del lote.
- GPUs compatibles con ejecución FP8 nativa: NVIDIA con compute capability ≥ 8.9, incluyendo RTX 40-series, L4/L40S, H100/H200, B100/B200 y GB10.
- En GPUs más antiguas (compute capability < 8.9), vLLM y TGI dequantizan automáticamente a FP16/BF16, perdiendo las ventajas de velocidad y memoria.
- Opciones de despliegue: vLLM (`vllm serve`), TGI (contenedor Docker), SGLang, o mediante la librería `transformers` con carga estándar (aunque sin las optimizaciones de FP8).
- Latencia y throughput: no se proporcionan datos específicos; dependerá del hardware y del framework utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bigscience/bloomz-560m | 560M | no disponible | no (FP32/FP16) | other (RAIL) | Hugging Face |
| liodon-ai/bloomz-560m-FP8 | 560M | no disponible | FP8 dinámico | other | Hugging Face |
| bigscience/bloom-560m | 560M | no disponible | no | other (RAIL) | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. El modelo FP8 ofrece la ventaja de un menor tamaño de almacenamiento y una inferencia potencialmente más rápida en hardware compatible, manteniendo la misma arquitectura y capacidades que el original.

## Limitaciones y advertencias

- No se especifican los idiomas exactos soportados ni la longitud de contexto en la información proporcionada; se recomienda consultar la documentación del modelo base BLOOMZ para estos detalles.
- La licencia "other" no detalla las condiciones de uso; es necesario revisar la licencia original de BLOOMZ (RAIL) para conocer las restricciones, especialmente para uso comercial.
- Al ser un modelo de 560M, su capacidad de razonamiento complejo y generación de código avanzado es limitada en comparación con modelos más grandes.
- La cuantización FP8 puede introducir una ligera pérdida de precisión en comparación con el modelo en FP16, aunque el esquema dinámico sin calibración minimiza este efecto.
- Riesgo de alucinaciones y sesgos presentes en el modelo base, que no se corrigen en el proceso de cuantización.
- En GPUs sin soporte FP8 nativo, el modelo se dequantiza automáticamente, lo que anula los beneficios de memoria y velocidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/liodon-ai/bloomz-560m-FP8)
- [Modelo base bigscience/bloomz-560m](https://huggingface.co/bigscience/bloomz-560m)
- [Sitio web de Liodon AI](https://liodon.ai/)
- [Repositorio llm-compressor](https://github.com/vllm-project/llm-compressor)
