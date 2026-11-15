# OkamotoJP/llm2-qwen35-sft014b

## Resumen

llm2-qwen35-sft014b es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP como entrega final del curso "LLM講座2 2026". El modelo está especializado en la generación de respuestas para sistemas de recuperación aumentada (RAG) en japonés, y se ha entrenado mediante LoRA con fusión posterior de los pesos en el modelo base.

Con 873.438.784 parámetros (aproximadamente 0,87 mil millones), se trata de un modelo compacto orientado a tareas de question answering sobre contexto documental. La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, aunque la model card no detalla las especificaciones técnicas completas del modelo base.

Su relevancia radica en ser un ejemplo de ajuste fino eficiente (LoRA con r=16) sobre un modelo pequeño para una tarea concreta de RAG en japonés, con licencia Apache-2.0 y un conjunto de datos de entrenamiento reducido (1.378 ejemplos) proveniente de datasets académicos de QA japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B, según modelo base) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17) y aplica un ajuste fino supervisado mediante LoRA con r=16, alpha=32, learning rate 0,0001 y 1 época sobre 1.378 ejemplos. Posteriormente, los pesos LoRA se fusionan en los pesos originales, por lo que la estructura del modelo resultante es idéntica a la del modelo base; según la model card, solo se actualizan los pesos de la parte lingüística.

Los datos de entrenamiento provienen de tres fuentes: JEMHopQA (CC BY-SA 4.0), filtrado y reformateado; cl-nagoya/auto-wiki-qa (CC BY-SA 4.0), muestreado, filtrado y reformateado; y un conjunto de chunks distribuidos derivados de Wikipedia en japonés (CC BY-SA 4.0), empleados como material de contexto en los prompts de entrenamiento. No se menciona el uso de RLHF, DPO ni técnicas de decodificación especulativa. La model card no detalla el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de las fuentes citadas.

## Capacidades

- Generación de texto en japonés orientada a respuestas extractivas y generativas sobre contexto documental.
- Question answering sobre pasajes recuperados (RAG), incluyendo preguntas de tipo multi-hop según el dataset JEMHopQA.
- Generación de respuestas basadas en chunks de Wikipedia en japonés.
- Capacidad de razonamiento y conocimiento general heredada del modelo base Qwen3.5-0.8B (no verificada en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al japonés según la etiqueta de idioma declarada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de respuestas en sistemas RAG en japonés: el modelo está entrenado específicamente para recibir chunks de documentación (por ejemplo, Wikipedia) y producir respuestas a preguntas del usuario, lo que lo hace adecuado como componente generador en un pipeline de recuperación + generación.
- Asistente de consulta sobre documentación interna: puede integrarse en un sistema que recupere fragmentos de manuales o bases de conocimiento en japonés y genere respuestas contextualizadas, gracias a su ajuste sobre datos de QA con contexto.
- Preguntas multi-hop sobre fuentes enciclopédicas: el entrenamiento con JEMHopQA lo orienta a resolver preguntas que requieren combinar información de varios pasajes recuperados.
- Prototipado académico y educativo: su tamaño reducido (0,87B parámetros) y licencia Apache-2.0 permiten desplegarlo en entornos de laboratorio o docencia para experimentar con pipelines RAG sin grandes requisitos de hardware.
- Servicio de atención al cliente en japonés con base de conocimiento: puede generar respuestas a partir de fragmentos de FAQs o artículos recuperados, siempre que el contexto se le proporcione en el prompt.
- Experimentación con ajuste fino eficiente: sirve como referencia para estudiar el efecto de LoRA (r=16) sobre un modelo pequeño en tareas de QA japonés, dado que la model card documenta la configuración de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 0,87B parámetros, en fp16 se requieren aproximadamente 1,8 GB solo para pesos, y en cuantización de 8 bits alrededor de 0,9 GB, aunque estas cifras son estimaciones generales no confirmadas por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamaño, un modelo de 0,87B es desplegable en GPUs de consumo con suficiente VRAM, pero no hay datos del autor.
- Opciones de despliegue: no disponible en la información proporcionada (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft014b | 873.438.784 | no disponible | ja | Apache-2.0 | SFT con LoRA sobre Qwen3.5-0.8B, orientado a RAG en japonés |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B (según denominación) | no disponible | no disponible | Apache-2.0 | Modelo base sin ajuste específico para RAG en japonés |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre otros modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- Entrenado únicamente con 1.378 ejemplos y 1 época, lo que limita la cobertura y puede provocar sobreajuste a los formatos de los datasets JEMHopQA y auto-wiki-qa.
- El modelo está especializado en japonés; su rendimiento en otros idiomas no está documentado y probablemente sea limitado.
- Riesgo de alucinación inherente a los modelos generativos pequeños, especialmente cuando el contexto recuperado es insuficiente o irrelevante.
- La model card no documenta sesgos conocidos, evaluación de seguridad ni pruebas de robustez.
- Aunque la licencia es Apache-2.0, los datasets de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-al-igual sobre obras derivadas; conviene revisar la compatibilidad para uso comercial.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente al modelo base u otras alternativas.
- Solo se actualizan los pesos de la parte lingüística según la model card; no se detalla si otras componentes del modelo base quedan intactas.
- El modelo tiene 2 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica una validación comunitaria prácticamente nula.

## Enlaces

- Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft014b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
