# deu05232/promptriever-llama2-7B-new_seed42-LESPairv2-temp01

## Resumen

Promptriever es un modelo de recuperación de información (retrieval) basado en el transformer Llama-2-7b, desarrollado por deu05232. La idea central del proyecto, descrita en el repositorio GitHub asociado, es que los modelos de retrieval pueden controlarse mediante instrucciones en lenguaje natural a nivel de instancia, de forma similar a como los modelos de lenguaje siguen prompts. Esta variante concreta, `promptriever-llama2-7B-new_seed42-LESPairv2-temp01`, es un adaptador PEFT (LoRA) entrenado sobre el modelo base `meta-llama/Llama-2-7b-hf`, con un tamaño de repositorio de 14.3 GB que incluye los pesos del adaptador y posiblemente el modelo base.

El modelo resuelve el problema de adaptar un LLM generalista a tareas de búsqueda semántica y recuperación densa, permitiendo que el comportamiento del sistema de retrieval se ajuste mediante prompts específicos por consulta o dominio. Su relevancia actual radica en la tendencia de integrar retrieval en sistemas RAG y agentes, donde la capacidad de controlar la recuperación con instrucciones naturales mejora la precisión y la flexibilidad frente a modelos de retrieval fijos. La arquitectura es un transformer decoder-only estándar con atención causal, y la longitud de contexto heredada de Llama-2 es de 4096 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b) con adaptador LoRA |
| Parametros totales | 7 mil millones (modelo base) + adaptador LoRA (tamano exacto no disponible) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No especificado (el repositorio contiene safetensors; se puede cuantizar con herramientas externas) |
| Idiomas soportados | No disponible (Llama-2 soporta principalmente ingles y algunos otros, pero el adaptador no documenta idiomas) |
| Licencia | No disponible para el adaptador; el modelo base usa licencia Llama 2 (comercial permitida con restricciones) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Llama-2-7b, un transformer decoder-only con atención causal, normalización RMSNorm, y activación SiLU, entrenado originalmente por Meta con 2 billones de tokens. Sobre este, se ha aplicado un adaptador LoRA (Low-Rank Adaptation) mediante la librería PEFT, que introduce matrices de bajo rango en las capas de atención y feed-forward para adaptar el modelo a la tarea de retrieval sin modificar los pesos originales. El nombre del adaptador indica un entrenamiento con una estrategia de pares "LESPairv2" (probablemente un tipo de loss contrastiva sobre pares positivos/negativos) y una temperatura de 0.01, con semilla 42. El procedimiento exacto de entrenamiento, el dataset utilizado y los hiperparámetros completos no están documentados en la model card. El repositorio GitHub asociado al proyecto Promptretriever (https://github.com/deu05232/promptriever) describe el enfoque general: entrenar el modelo para que siga instrucciones de recuperación por instancia, probablemente mediante un objetivo de contraste entre documentos relevantes y no relevantes guiado por prompts.

## Capacidades

- Generación de texto: el modelo base Llama-2-7b puede generar texto, pero el adaptador está especializado en retrieval, no en generación libre.
- Búsqueda semántica: dado un prompt y una consulta, produce representaciones (embeddings) que permiten ordenar documentos por relevancia.
- Control por prompts: el modelo puede modificar su comportamiento de recuperación según la instrucción dada, permitiendo cambiar el criterio de relevancia (por ejemplo, "documentos sobre legislación europea" vs. "documentos técnicos").
- Razonamiento multilingüe: limitado a los idiomas del modelo base, principalmente inglés, aunque Llama-2 tiene algo de capacidad multilingüe.
- Tool calling / function calling: no soportado de forma nativa.
- Agentes y multi-step reasoning: no aplicable directamente; el modelo es un retriever, no un agente.

## Casos de uso

- Recuperación aumentada por generación (RAG) en producción: el modelo puede usarse para seleccionar pasajes relevantes de una base de conocimiento antes de pasarlos a un LLM generativo. Su capacidad de seguir prompts permite afinar la búsqueda según el dominio o la tarea, por ejemplo "documentos médicos recientes" o "tutoriales para principiantes".
- Búsqueda semántica en motores de búsqueda internos: empresas pueden indexar documentación técnica y usar el modelo para ordenar resultados por relevancia semántica, con la opción de variar el criterio de búsqueda mediante prompts sin reentrenar.
- Filtrado de datos para entrenamiento: en pipelines de datos, el modelo puede recuperar ejemplos similares a una consulta para construir conjuntos de entrenamiento o aumentar datos.
- Sistemas de preguntas y respuestas sobre documentos: combinado con un LLM, el retriever puede encontrar pasajes que contengan respuestas, y el prompt puede especificar el formato de respuesta esperado.
- Asistentes virtuales con contexto personalizado: el modelo puede recuperar información de un perfil de usuario o de una base de conocimiento personalizada, ajustando la búsqueda según la intención del usuario (p. ej., "preferencias de viaje").
- Análisis de jurisprudencia o documentos legales: el prompt puede indicar que se busquen precedentes judiciales o artículos específicos, mejorando la precisión en dominios con vocabulario especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio del proyecto Promptretriever menciona la evaluación en tareas de retrieval (posiblemente BEIR o MTEB), pero no se proporcionan números concretos en la model card ni en los resultados de la búsqueda web.

## Requisitos de hardware

- VRAM estimada: el modelo base Llama-2-7b en fp16 requiere aproximadamente 14 GB de VRAM. Con cuantización de 8 bits se reduce a unos 7-8 GB, y en 4 bits a unos 4-5 GB. El adaptador LoRA añade un overhead mínimo.
- GPU recomendadas: para fp16, una GPU con 16 GB VRAM (RTX 4090, A10G, L4) es suficiente. Para cuantización 8 bits, una RTX 3080/3090 (10-24 GB) puede funcionar. Para 4 bits, GPUs con 6-8 GB (RTX 3060, RTX 4060).
- Consumer GPU: sí, el modelo cabe en GPUs de consumo con 16 GB VRAM en fp16, o en 8 GB con cuantización 4 bits.
- Opciones de despliegue: el adaptador PEFT se puede cargar con la librería `transformers` y `peft` en Python. También se puede servir con vLLM (con soporte para LoRA), llama.cpp (convirtiendo a GGUF), o plataformas como FriendliAI que ofrecen inferencia optimizada.
- Latencia y throughput: no disponibles. Como referencia, Llama-2-7b en una GPU A100 genera entre 50-100 tokens/s, pero para retrieval el coste es la codificación de documentos y consultas, que es más rápido que generación.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Metodo | Licencia |
|---|---|---|---|---|---|
| promptriever-llama2-7B (este) | Llama-2-7b | 7B + LoRA | 4096 | LoRA + prompts | No disponible |
| BGE-large-en-v1.5 | BERT | 326M | 512 | Fine-tuning denso | MIT |
| E5-mistral-7b-instruct | Mistral-7b | 7B | 32768 | Instrucciones | MIT |
| Llama-2-7b base | Llama-2-7b | 7B | 4096 | - | Llama 2 license |

La comparativa se basa en arquitectura y disponibilidad general. No se dispone de comparaciones de rendimiento directo entre Promptretriever y otros retrievers en la información proporcionada. La principal diferencia es que Promptretriever usa un LLM de 7B como backbone y se controla mediante prompts, mientras que BGE es un modelo encoder más ligero y E5-mistral usa instrucciones pero no de forma tan flexible.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos o limitaciones específicas del adaptador. El modelo base Llama-2-7b hereda sesgos de los datos de entrenamiento de Meta (principalmente en inglés, con posibles sesgos de género, raza y cultura).
- Riesgo de alucinación en generación de texto, aunque el modelo se usa principalmente para retrieval, no para generar respuestas.
- La licencia del adaptador no está especificada; el modelo base Llama-2 tiene una licencia comercial con restricciones (no usar en aplicaciones militares o de vigilancia). El adaptador podría tener restricciones adicionales no documentadas.
- El modelo está diseñado para retrieval, no para generación de texto general. Usarlo para generación podría dar resultados pobres.
- El contexto de 4096 tokens es menor que otros modelos actuales (por ejemplo, 128K), lo que limita la recuperación de documentos largos.
- No se proporcionan datos de entrenamiento ni evaluación, por lo que el rendimiento en dominios específicos es desconocido.
- La compatibilidad con otros idiomas es limitada; el modelo base fue entrenado principalmente con datos en inglés, y el adaptador no indica soporte multilingüe.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/deu05232/promptriever-llama2-7B-new_seed42-LESPairv2-temp01
- Repositorio GitHub del proyecto: https://github.com/deu05232/promptriever
- Otros modelos relacionados del mismo autor: https://huggingface.co/deu05232/promptriever-llama2-7B-new_seed42-SumMargLH-ckt3700 y https://huggingface.co/deu05232/promptriever-llama2-7B-RQ1-same_version_seed24
- Documentación de FriendliAI sobre una variante: https://friendli.ai/models/deu05232/promptriever-repro-llama2-7b
