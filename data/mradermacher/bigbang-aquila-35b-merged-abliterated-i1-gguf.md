# mradermacher/BigBang-Aquila-35B-Merged-Abliterated-i1-GGUF

## Resumen

BigBang-Aquila-35B-Merged-Abliterated-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo base BigBang-Aquila-35B-Merged-Abliterated, creada por mradermacher. El modelo base es un merge de arquitectura MoE (según las etiquetas, basada en Qwen3.5) con 34.660.610.688 parámetros totales, y ha sido sometido a un proceso de "abliteración" que elimina los mecanismos de rechazo de contenido, resultando en un modelo sin censura. Esta versión GGUF permite ejecutar el modelo en hardware más modesto gracias a la cuantización, manteniendo la licencia Apache 2.0.

La relevancia de esta ficha radica en que ofrece una opción práctica para desarrolladores que necesitan un modelo grande de código abierto, con capacidad conversacional y sin restricciones de contenido, pero que no disponen de GPUs de alta gama. Al estar cuantizado en formatos Q2_K e IQ3_M, el modelo puede ejecutarse en tarjetas con 16-24 GB de VRAM, ampliando su accesibilidad. Sin embargo, la información disponible sobre el entrenamiento y los benchmarks es limitada, por lo que se recomienda evaluar el modelo en tareas específicas antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según etiquetas, basada en Qwen3.5) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (13,0 GB), i1-IQ3_M (15,5 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base es un merge de varios modelos (no se especifica cuáles) con arquitectura MoE, etiquetado como `qwen3_5_moe`. Ha sido sometido a un proceso de "abliteración", una técnica que modifica los pesos para eliminar los rechazos de contenido no deseado, resultando en un modelo "uncensored". No se dispone de información sobre los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La cuantización i1 realizada por mradermacher utiliza una matriz de importancia (imatrix) para optimizar la calidad de los quants, y se ofrecen dos variantes: Q2_K (13 GB) e IQ3_M (15,5 GB).

## Capacidades

- Generación de texto y conversación: el modelo está etiquetado como `conversational`, lo que indica su aptitud para mantener diálogos multi-turno.
- Sin censura: gracias a la abliteración, el modelo no aplica rechazos de contenido, lo que permite generar respuestas sobre temas que otros modelos bloquean.
- Soporte de tool calling: no disponible (no se menciona en la información).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés (etiqueta `en`).
- Capacidades especiales: no se documentan modos de pensamiento, visión o audio.

## Casos de uso

- Asistente conversacional para entornos de investigación: el modelo puede mantener diálogos abiertos sin restricciones de contenido, útil en estudios sobre generación de lenguaje o en prototipos de chatbots donde se requiere explorar temas sensibles.
- Generación de texto creativo: al no tener censura, puede utilizarse para escribir ficción, poesía o guiones sin limitaciones temáticas, siempre que se respeten las normas legales y éticas.
- Análisis de texto en inglés: su capacidad de procesar lenguaje natural permite resumir documentos, extraer información o clasificar contenido, aunque no se han publicado benchmarks que confirmen su rendimiento en estas tareas.
- Desarrollo de aplicaciones de chat en inglés: al ser un modelo GGUF, puede integrarse en aplicaciones locales mediante llama.cpp u Ollama, ofreciendo una alternativa de código abierto para chatbots sin depender de APIs externas.
- Experimentación con modelos sin censura: para desarrolladores que investigan los efectos de la abliteración en la calidad y seguridad de las respuestas, este modelo sirve como caso de estudio.
- Despliegue en entornos con recursos limitados: gracias a la cuantización Q2_K (13 GB), puede ejecutarse en GPUs de consumo como la RTX 4080 o 4090, permitiendo probar un modelo de 35B en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo o su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: para la cuantización Q2_K (13 GB de archivo), se estima un mínimo de 16 GB de VRAM, considerando el contexto y los overheads. Para IQ3_M (15,5 GB), se recomiendan al menos 20-24 GB.
- GPU recomendadas: RTX 4080, RTX 4090, A6000, o GPUs de datacenter como A10G o L4 para las variantes más pequeñas. Para IQ3_M, se necesitarían GPUs con 24 GB o más, como RTX 3090/4090 o A5000.
- Si cabe en consumer GPU: sí, la variante Q2_K puede ejecutarse en GPUs de 16 GB (por ejemplo, RTX 4080), mientras que IQ3_M requiere 24 GB (RTX 3090/4090).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. También puede usarse con vLLM si se convierte a otro formato, aunque no es el caso directo.
- Latencia y throughput: no disponible. Dependerá del hardware y del tamaño del contexto.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos de tamaño similar en la información proporcionada. Se sugiere comparar con otros modelos MoE de ~35B como Qwen3-30B-A3B o Mixtral 8x7B, pero no hay datos concretos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al ser un modelo sin censura, puede reflejar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: no se ha evaluado, pero es inherente a los modelos de lenguaje; se recomienda verificar las respuestas en aplicaciones críticas.
- Limitaciones de contexto: la longitud de contexto no está especificada; se desconoce si soporta ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales si los modelos fusionados tienen licencias diferentes; se debe verificar.
- Caveat para producción: al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o dañino. No es adecuado para aplicaciones públicas sin moderación y filtros adicionales.
- Idioma: solo inglés, lo que limita su uso en entornos multilingües.

## Enlaces

- Modelo cuantizado: https://huggingface.co/mradermacher/BigBang-Aquila-35B-Merged-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/osk-arr00/BigBang-Aquila-35B-Merged-Abliterated
- Página de descarga de mradermacher: https://hf.tst.eu/model#BigBang-Aquila-35B-Merged-Abliterated-i1-GGUF
- Página de FriendliAI (inferencia del modelo base): https://friendli.ai/models/osk-arr00/BigBang-Aquila-35B-Merged
