# JetBrains/Qwen3.8-3.6-27B-blend

## Resumen

Qwen3.8-3.6-27B-blend es un modelo derivado publicado por JetBrains que consiste en la fusión lineal 50/50 de los checkpoints Qwen/Qwen3.6-27B y Qwen/Qwen3.8-27B, ambos desarrollados por Alibaba Cloud. El resultado es un único checkpoint de 27.781.427.952 parámetros (unos 27,8 B) que conserva la configuración, el tokenizer, el processor y la plantilla de chat de Qwen3.8-27B. Se trata de un modelo no oficial: JetBrains declara explícitamente que la publicación no está afiliada, patrocinada ni respaldada por Alibaba Cloud ni por Alibaba Group.

La operación de mezcla se realizó interpolando parámetros con acumulación en float32 (0,5 × Qwen3.6-27B + 0,5 × Qwen3.8-27B), sin entrenamiento ni fine-tuning adicional y sin utilizar datos nuevos. La licencia Apache 2.0 del material original se mantiene, igual que los avisos de copyright de Alibaba Cloud. La pipeline declarada es image-text-to-text, por lo que el modelo hereda capacidad de entrada multimodal (imagen y texto) del checkpoint base.

Su relevancia actual viene de que JetBrains lo emplea como motor de "Junie Local", su asistente de código ejecutado en local, y acompaña la publicación con evaluaciones internas centradas en la relación entre calidad de código y tokens de salida consumidos. Se distribuye en BF16, GGUF, MLX 4-bit y una variante MTP MLX 4-bit, lo que cubre tanto servidores con GPU como equipos Apple Silicon. Con 436 descargas y 11 likes en el momento de la consulta, es un modelo de nicho orientado a desarrolladores que buscan inferencia local eficiente en tareas de programación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Modelo derivado de Qwen3.8-27B (etiquetado `qwen3_5`); pipeline `image-text-to-text` |
| Parámetros totales | 27.781.427.952 (≈27,8 B) |
| Parámetros activos | No disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (original), GGUF (cuantizaciones no detalladas), MLX 4-bit, MTP MLX 4-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache License 2.0 |
| Formato de pesos | Safetensors (BF16), GGUF, MLX |
| Modelos base | Qwen/Qwen3.6-27B (rev. `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`) y Qwen/Qwen3.8-27B (rev. `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) |
| Método de fusión | Linear merge 50/50 con acumulación en float32 |
| Tamaño del repositorio | 55,6 GB |
| Librería | transformers |
| Descargas / likes | 436 / 11 |
| Fecha de creación | 15 de septiembre de 2026 |
| Última actualización | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo no incorpora ninguna innovación arquitectónica propia: es el resultado de una interpolación lineal de parámetros entre dos checkpoints de la familia Qwen3, con peso 0,5 para cada uno y acumulación en float32. Los componentes no relacionados con los pesos (configuración, tokenizer, processor y plantilla de chat) se toman íntegramente de Qwen3.8-27B, de modo que el comportamiento conversacional y el formato de prompt esperado son los del modelo más reciente de la pareja. La etiqueta `qwen3_5` asociada al repositorio y la pipeline `image-text-to-text` indican que la familia subyacente es multimodal, aunque la model card no detalla la arquitectura interna (número de capas, tipo de atención, uso o no de mezcla de expertos).

No se realizó entrenamiento, fine-tuning, RLHF ni DPO adicionales, y no se emplearon datos de entrenamiento nuevos: la preparación consistió únicamente en la fusión de checkpoints y, cuando corresponde, la extracción, conversión de formato y cuantización descritas en el fichero CHANGES.md del repositorio. Los detalles exactos de revisiones de origen y parámetros de la mezcla quedan registrados en `merge-manifest.json`. Para información sobre los datos de entrenamiento de los modelos originales, JetBrains remite a las model cards oficiales de Qwen y al resumen de datos de entrenamiento publicado por Qwen, que no identifica los conjuntos exactos usados en estos dos checkpoints.

## Capacidades

- Generación de texto conversacional multi-turno, con la plantilla de chat heredada de Qwen3.8-27B.
- Entrada multimodal de imagen y texto, según la pipeline declarada `image-text-to-text`.
- Generación y asistencia en código, evaluada por JetBrains en un benchmark interno de 100 tareas de programación.
- Capacidad de razonamiento con configuraciones variables: la nota metodológica del benchmark interno indica que los ajustes de razonamiento difieren entre configuraciones comparadas.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada (depende del modelo base Qwen3.8-27B).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; JetBrains orienta el modelo a flujos de asistencia de código integrados en IDE.
- Capacidades multilingües: no disponibles (no se enumeran idiomas soportados).
- Capacidad especial de eficiencia: variante MTP (multi-token prediction) en formato MLX 4-bit, orientada a reducir el coste por token generado.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`) y con la librería `transformers`.

## Casos de uso

- Asistente de código en local dentro del IDE: el modelo se integra en Junie Local para autocompletado, explicación de código y refactorizaciones sin enviar el código fuente a servicios externos, lo que resulta adecuado para entornos con requisitos estrictos de confidencialidad.
- Generación de parches y correcciones en pipelines de CI/CD: puede conectarse a un runner que, ante un fallo de tests, solicite al modelo un parche candidato y lo valide automáticamente antes de abrir una pull request.
- Revisión de código automatizada: análisis de diffs y detección de patrones problemáticos aprovechando la ventana conversacional del modelo para mantener el contexto del repositorio durante la revisión.
- Documentación técnica a partir de código: generación de docstrings, guías de API y notas de versión a partir de ficheros fuente, con la ventaja de poder ejecutarse localmente sobre código propietario.
- Conversión de capturas de interfaz a código: gracias a la entrada image-text-to-text, el modelo puede recibir una captura de una UI o un diagrama y proponer el marcado o los componentes correspondientes.
- Investigación en técnicas de model merging: al publicar el manifiesto de fusión y las revisiones exactas de origen, el checkpoint sirve como caso reproducible para estudiar interpolación lineal de parámetros y su efecto sobre tareas de código.
- Despliegue on-premise en equipos de desarrollo: con las variantes GGUF y MLX 4-bit, un equipo puede ejecutar el modelo en estaciones de trabajo con una sola GPU o en portátiles Apple Silicon, evitando costes de API por token.
- Optimización de coste por token en agentes de codificación: la variante MTP MLX 4-bit y el enfoque de eficiencia de tokens del benchmark interno lo hacen adecuado para agentes que ejecutan muchas iteraciones cortas sobre el mismo repositorio.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye únicamente una figura del benchmark interno de 100 tareas de codificación de JetBrains, que representa tareas completadas frente a tokens de salida, pero los valores concretos no se han proporcionado en forma de tabla y la propia nota metodológica advierte que los ajustes de razonamiento difieren entre configuraciones comparadas, por lo que no es posible extraer cifras directamente comparables.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Benchmark interno de codificación de JetBrains (100 tareas) | Publicado solo como gráfico en el blog; sin valores numéricos en la información disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo de pesos (2 bytes por parámetro × 27,78 B), más caché KV y activaciones, lo que en la práctica exige GPUs de 80 GB o particionado en varias GPU.
- VRAM estimada en cuantización de 4 bits: del orden de 14-16 GB de pesos, más el overhead de contexto, lo que la sitúa en el rango de una RTX 4090, RTX 3090 o similar con 24 GB.
- VRAM estimada en cuantización de 8 bits: del orden de 28-30 GB, por encima de una GPU de consumo de 24 GB y al alcance de una A6000 de 48 GB o de configuraciones multi-GPU.
- GPU recomendadas: A100 80 GB, H100 80 GB o A6000 48 GB para BF16; RTX 4090, RTX 3090 o L40S para cuantizaciones de 4 bits.
- Compatibilidad con GPU de consumo: sí, en cuantizaciones de 4 bits y con contexto moderado. En BF16 no cabe en ninguna GPU de consumo actual de 24 GB.
- Apple Silicon: la publicación incluye formatos MLX 4-bit y MTP MLX 4-bit, pensados para ejecución nativa en chips de Apple.
- Opciones de despliegue: `transformers` (según la librería declarada), llama.cpp u Ollama y LM Studio para GGUF, MLX para Apple Silicon, vLLM o TGI para servir los pesos completos, y endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros que permitan una comparación cuantitativa. La comparación se limita a las relaciones declaradas en la información disponible.

| Modelo | Relación | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-3.6-27B-blend | Modelo analizado | 27.781.427.952 | No disponible | Apache 2.0 | Safetensors (BF16), GGUF, MLX 4-bit, MTP MLX 4-bit |
| Qwen/Qwen3.6-27B | Modelo base (50 % de la mezcla) | No disponible | No disponible | No disponible en la información proporcionada | Checkpoint original de Qwen |
| Qwen/Qwen3.8-27B | Modelo base (50 % de la mezcla); aporta configuración, tokenizer, processor y plantilla de chat | No disponible | No disponible | No disponible en la información proporcionada | Checkpoint original de Qwen |
| Otros modelos densos de ~27 B de la misma categoría | Comparación cuantitativa | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo no oficial: no está afiliado, patrocinado ni respaldado por Alibaba Cloud ni por Alibaba Group, según declara el propio JetBrains.
- No se realizó ningún entrenamiento ni ajuste posterior a la fusión, por lo que cualquier sesgo o carencia presente en los checkpoints originales de Qwen se hereda sin corrección.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación para este checkpoint fusionado.
- La interpolación lineal de parámetros puede degradar capacidades específicas respecto a cada modelo de origen; no se aportan datos comparativos que cuantifiquen esa posible pérdida más allá del gráfico interno de JetBrains.
- Idiomas soportados no documentados: se desconoce la cobertura multilingüe real del derivado, más allá de lo que herede de Qwen3.8-27B.
- Longitud de contexto no documentada: sin este dato no es posible dimensionar la caché KV ni garantizar el comportamiento en contextos largos.
- Ausencia de benchmarks públicos: no hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de terceros que permitan validar el rendimiento declarado.
- La evaluación de código publicada es un benchmark interno de JetBrains, con ajustes de razonamiento no homogéneos entre configuraciones, por lo que los resultados no son directamente extrapolables a otros entornos.
- Licencia Apache 2.0: permite uso comercial, pero se mantienen los avisos de copyright de Alibaba Cloud y los términos de la licencia original de Qwen, que deben conservarse en redistribuciones.
- Aviso de uso aceptable: la model card recuerda que utilizar el modelo o sus salidas para infringir derechos de propiedad intelectual de terceros puede violar la legislación aplicable, con independencia de los términos de la licencia.
- El repositorio pesa 55,6 GB, lo que implica tiempos de descarga y requisitos de almacenamiento considerables si se quieren conservar varias cuantizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend
- Versión GGUF: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-GGUF
- Versión MLX 4-bit: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MLX-4bit
- Versión MTP MLX 4-bit: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MTP-MLX-4bit
- Artículo de JetBrains sobre Junie Local, evaluaciones de código y experimentos con MTP: https://blog.jetbrains.com/junie/2026/09/smarter-local-al/
- Manifiesto de la fusión: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend/blob/main/merge-manifest.json
- Descripción de modificaciones: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend/blob/main/CHANGES.md
- Aviso de atribución: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend/blob/main/NOTICE
- Licencia del repositorio: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend/blob/main/LICENSE
- Model card de Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Model card de Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Resumen de datos de entrenamiento de Qwen: https://qwen.ai/training-data-summary
- Sitio de JetBrains: https://www.jetbrains.com/
- JetBrains en Wikipedia: https://en.wikipedia.org/wiki/JetBrains
