# LeoZotos/littlelearner-1.3b-base_math_textbooks

## Resumen

El modelo `LeoZotos/littlelearner-1.3b-base_math_textbooks` es un checkpoint de fine-tuning (pre-entrenamiento continuo) sobre el modelo base `littlelearner/littlelearner-1.3b-base`, desarrollado por LeoZotos. El objetivo es especializar el modelo en el dominio de las matemáticas mediante el entrenamiento con un corpus de libros de texto de matemáticas (`LeoZotos/math_textbooks`). Según la etiqueta `qwen3`, el modelo base parece derivar de la familia Qwen3, aunque no se confirma oficialmente. Con 1.358 millones de parámetros (aproximadamente 1,36B), es un modelo de tamaño medio-pequeño, adecuado para tareas de generación de texto y razonamiento matemático en entornos con recursos limitados.

La relevancia de este modelo radica en su enfoque educativo: al estar entrenado específicamente con material didáctico de matemáticas, podría ofrecer un mejor rendimiento en tareas como resolución de problemas, explicaciones paso a paso o generación de ejercicios, en comparación con un modelo generalista del mismo tamaño. Sin embargo, al no publicarse benchmarks ni detalles de arquitectura, su rendimiento real no está verificado. El checkpoint se publicó en septiembre de 2026 y no cuenta con descargas ni valoraciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; la etiqueta `qwen3` sugiere una arquitectura transformer similar a Qwen3, sin confirmación oficial |
| Parametros totales | 1.358.021.120 (1,36B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (según `max_seq_length` de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se documenta en la model card. El tag `qwen3` sugiere que el modelo base `littlelearner-1.3b-base` podría estar basado en la arquitectura Qwen3, que emplea un transformer con atención multi-cabeza estándar o con group query attention (GQA), pero no hay confirmación. El entrenamiento consiste en un pre-entrenamiento continuo (CPT) sobre el corpus `LeoZotos/math_textbooks`, con 75.000 ejemplos máximos, una época, secuencias de hasta 2048 tokens y una pérdida de máscara de prompt desactivada (`mask_prompt_loss: false`). Se usó el optimizador AdamW con learning rate 3e-5, weight decay 0.01, scheduler coseno con warmup del 3%, y gradient checkpointing para reducir consumo de memoria. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es únicamente de modelado de lenguaje sobre textos de matemáticas.

## Capacidades

- Generación de texto en lenguaje natural, con énfasis en contenido matemático (libros de texto).
- Razonamiento matemático básico y explicaciones de conceptos, derivado del corpus de entrenamiento.
- Comprensión de lenguaje técnico-científico en el dominio de las matemáticas.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio.
- No se confirma soporte multilingüe; los idiomas no están especificados.
- No se indica un modo de pensamiento (thinking mode) explícito, aunque la configuración de evaluación incluye `eval_enable_thinking: null`, lo que sugiere que no se activó.

## Casos de uso

- Asistente educativo para estudiantes: el modelo puede generar explicaciones paso a paso de problemas matemáticos, basándose en el estilo de los libros de texto con los que fue entrenado.
- Generación de ejercicios y problemas de práctica: dado su entrenamiento con material didáctico, puede crear problemas variados con soluciones, útil para plataformas de aprendizaje automático.
- Tutor virtual en entornos con recursos limitados: al ser un modelo de 1,36B, puede desplegarse en GPUs de gama media o incluso en CPU con cuantización, ofreciendo respuestas a dudas matemáticas en tiempo real.
- Preprocesamiento de contenido educativo: puede resumir, reformular o extraer conceptos clave de textos matemáticos para su uso en sistemas de recomendación de contenido.
- Generación de material de estudio personalizado: adaptando el nivel de dificultad según el contexto, el modelo puede producir explicaciones alternativas de un mismo concepto.
- Investigación en aprendizaje automático: sirve como punto de partida para estudiar el efecto del pre-entrenamiento continuo en dominios específicos, comparando su rendimiento con el modelo base sin fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El rendimiento real del modelo en tareas matemáticas o de razonamiento no está verificado.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, el modelo ocupa aproximadamente 2,7 GB (coincide con el tamaño del repo). Con cuantización de 4 bits, podría reducirse a ~0,7-1 GB, permitiendo ejecución en GPUs con 4 GB o menos.
- GPU recomendadas: tarjetas con al menos 4 GB de VRAM para fp16 (p. ej., RTX 3050, RTX 2060, GTX 1660 Super). Para cuantización 4-bit, incluso GPUs integradas o CPUs con suficiente RAM podrían ser viables.
- Si cabe en consumer GPU: sí, en la mayoría de GPUs de consumo actuales (RTX 30/40 series, etc.) con cuantización.
- Opciones de despliegue: al ser un modelo transformer estándar, puede servirse con vLLM, llama.cpp, Ollama, TGI o Hugging Face Inference Endpoints. No se han probado oficialmente, pero la compatibilidad es probable.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Como referencia estructural, se pueden mencionar otros modelos de ~1,3B parámetros, pero sin resultados verificados:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| littlelearner-1.3b-base_math_textbooks | 1,36B | 2048 | No disponible | Fine-tuning matemático sobre base Qwen3 (presumible) |
| Qwen2.5-1.5B | 1,54B | 32K | Apache 2.0 | Modelo generalista con buen rendimiento en razonamiento |
| Llama-3.2-1B | 1,23B | 128K | Llama 3.2 Community License | Modelo ligero de Meta, orientado a edge |

La comparación es orientativa; no hay benchmarks que respalden diferencias de rendimiento.

## Limitaciones y advertencias

- No se ha publicado licencia, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar al autor antes de usar el modelo en producción.
- Al ser un modelo de 1,36B, su capacidad de razonamiento complejo es limitada; puede cometer errores en problemas matemáticos avanzados o alucinar explicaciones incorrectas.
- El entrenamiento se realizó únicamente con textos de libros de texto de matemáticas; no se ha evaluado su comportamiento en otros dominios, por lo que su uso generalista puede ser deficiente.
- La longitud de contexto de 2048 tokens es relativamente corta para tareas que requieran documentos extensos o conversaciones largas.
- No se especifican los idiomas soportados; si el corpus es mayoritariamente en inglés, el rendimiento en otros idiomas será limitado.
- No hay evidencia de soporte para tool calling, agentes o integraciones con APIs externas.
- El modelo no ha sido validado con benchmarks públicos, por lo que su rendimiento real es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/LeoZotos/littlelearner-1.3b-base_math_textbooks
- Modelo base (referenciado en la configuración): https://huggingface.co/littlelearner/littlelearner-1.3b-base (no verificado)
- Dataset de entrenamiento (referenciado): https://huggingface.co/datasets/LeoZotos/math_textbooks (no verificado)
