# MuhHendri12/qwen2.5-3b-legal-id-sft

## Resumen

MuhHendri12/qwen2.5-3b-legal-id-sft es un ajuste fino (SFT) del modelo Qwen2.5-3B-Instruct, desarrollado por MuhHendri12. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que permitió una aceleración de 2x respecto a un entrenamiento estándar. El nombre del repositorio sugiere una orientación hacia el ámbito legal y posiblemente hacia el idioma indonesio, aunque la etiqueta de idioma declarada es únicamente inglés y no se proporciona información sobre el dataset ni el dominio exacto.

El modelo pertenece a la familia Qwen2.5, con arquitectura Transformer decoder-only y un total de 3.085.938.688 parámetros. Se distribuye en formato safetensors y ocupa 6,2 GB en disco. Por su tamaño, es un modelo ligero pensado para entornos con recursos limitados, pero al estar finetuneado sobre una versión instruct de Qwen2.5, hereda las capacidades conversacionales del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos subidos son safetensors; el modelo base se entrenó sobre una versión bnb-4bit) |
| Idiomas soportados | Inglés (según etiquetas de Hugging Face) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`, que a su vez es una versión del modelo instruct de Qwen2.5-3B. La arquitectura subyacente es la de un Transformer causal estándar de la serie Qwen2.5, con capas de atención por multi-cabeza y normalización RMSNorm. No se documentan modificaciones estructurales sobre el modelo base.

El entrenamiento se realizó utilizando Unsloth, un framework que optimiza el ajuste fino mediante técnicas de eficiencia de memoria, y la librería TRL de Hugging Face, habitual para el entrenamiento supervisado con datos de instrucciones. Según la model card, el proceso fue 2x más rápido que un entrenamiento convencional. No se han publicado detalles sobre el conjunto de datos, la cantidad de tokens de entrenamiento, el número de épocas ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional: heredada del modelo base Qwen2.5-3B-Instruct, que está diseñado para responder instrucciones de forma natural.
- Razonamiento básico y resolución de problemas en lenguaje natural, propio de la familia Qwen2.5.
- Capacidad de completar tareas de escritura, como redacciones, correcciones y resúmenes.
- No se ha documentado soporte explícito de tool calling, agentes, visión o audio en este finetune.
- El idioma declarado es inglés; la compatibilidad con otros idiomas no está confirmada.
- No hay información verificada sobre el dominio legal o indonesio a pesar de la denominación del repositorio.

## Casos de uso

- Asistente legal local de baja latencia: al ser un modelo de 3B, puede desplegarse en entornos con poca capacidad de cómputo, ideal para consultas básicas en despachos pequeños, siempre que se disponga de un dataset legal validado para evaluar su precisión.
- Chatbot de atención al cliente: un modelo instruct de estas dimensiones permite implementar asistentes conversacionales en aplicaciones de soporte, gestionando interacciones multi-turno sin necesidad de infraestructura cloud cara.
- Búsqueda aumentada por recuperación (RAG) sobre documentos normativos: combinado con un índice vectorial, puede responder preguntas sobre textos legales previamente seleccionados, aunque se recomienda verificar el rendimiento con el corpus real.
- Clasificación de documentos: se puede utilizar para etiquetar contratos, sentencias o dictámenes en categorías predefinidas mediante prompts de cero disparo o pocos ejemplos.
- Generación de resúmenes jurídicos: puede condensar párrafos largos de texto normativo en resúmenes breves, útil para la revisión inicial de expedientes.
- Integración en flujos de trabajo ofimáticos: modelos de este tamaño son aptos para ejecutarse en CPU y GPU de consumo, permitiendo su uso en herramientas internas de análisis de texto sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Por tanto, no es posible comparar objetivamente el rendimiento de este finetune con el modelo base o con otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 6,2 GB para los pesos en precisión fp16/bf16, más overhead de activaciones y caché KV, lo que lleva a un consumo práctico de entre 8 y 10 GB.
- Con cuantización a 4 bits, la VRAM podría reducirse a aproximadamente 2-3 GB, pero no se ofrece ninguna versión cuantizada de este repositorio.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4070, RTX 4090, A10, A100. Funciona bien en GPUs de gama media; también es viable en CPU con cuantización 4-bit, aunque con latencias mayores.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, así como el pipeline de Transformers nativo, dado que es compatible con `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponibles, ya que no se han publicado mediciones. En un modelo de 3B se puede esperar una latencia baja en una GPU moderna, pero no hay datos verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3,09B | 32.000 tokens (heredado del modelo base) | Multiidioma | Apache 2.0 | Hugging Face |
| MuhHendri12/qwen2.5-3b-legal-id-sft | 3,09B | No disponible | Inglés | Apache 2.0 | Hugging Face |
| ahmadfatikhulkhasan/qwen2.5-3b-legal-id-sft | 3,09B | No disponible | No disponible | No disponible | Hugging Face |
| symrizals/qwen2.5-3b-legal-id-sft | 3B | 32.000 tokens (según llm-explorer) | No disponible | No disponible | llm-explorer |

La comparación es limitada porque no existen datos de benchmarks. Los otros dos modelos con nombre similar parecen ser finetunes partiendo de la misma base, pero no se dispone de información detallada sobre sus especificaciones ni su rendimiento.

## Limitaciones y advertencias

- No se ha publicado ningún benchmark ni evaluación de calidad, por lo que el rendimiento real del modelo es desconocido.
- El dataset de entrenamiento no está documentado: no se sabe qué textos legales se han utilizado, si hay sesgos específicos del dominio ni si la calidad de los datos es suficiente para aplicaciones de alto riesgo.
- La etiqueta de idioma es únicamente inglés, a pesar de que el nombre del repositorio sugiere un enfoque indonesio. Esto puede indicar una mezcla de idiomas no documentada.
- Existe un riesgo alto de alucinación en respuestas jurídicas si se utiliza sin supervisión humana, ya que no hay validación de precisión factual.
- No hay soporte para visión ni audio; solo es un modelo de texto.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar la calidad del modelo antes de desplegarlo en producción.
- No se incluyen instrucciones de uso específicas ni ejemplos de prompts en la model card, lo que dificulta su integración inmediata.

## Enlaces

- https://huggingface.co/MuhHendri12/qwen2.5-3b-legal-id-sft
- https://huggingface.co/ahmadfatikhulkhasan/qwen2.5-3b-legal-id-sft
- https://llm-explorer.com/model/symrizals%2Fqwen2.5-3b-legal-id-sft,7dqWFf7pfBKxThTQ5AuonB
