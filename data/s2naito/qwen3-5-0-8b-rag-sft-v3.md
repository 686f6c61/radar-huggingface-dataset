# s2naito/qwen3.5-0.8b-rag-sft-v3

## Resumen

s2naito/qwen3.5-0.8b-rag-sft-v3 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario s2naito. Se trata de un modelo de aproximadamente 873 millones de parámetros, especializado en tareas de pregunta-respuesta (QA) de respuesta corta sobre Wikipedia en japonés, empleando un pipeline de generación aumentada por recuperación (RAG). El ajuste se realizó mediante LoRA sobre todos los módulos lineales, partiendo de la revisión `2fc06364715b967f1860aea9cf38778875588b17` del modelo base.

El modelo resuelve el problema de responder preguntas concretas a partir de contextos recuperados de Wikipedia japonesa, incorporando ejemplos negativos difíciles seleccionados mediante fusión de rankings recíproca (RRF) y reranking con Ruri. Es relevante por su tamaño reducido (menos de mil millones de parámetros), lo que permite despliegues ligeros, y por estar orientado específicamente al idioma japonés en un dominio de QA documental.

La información pública disponible es escasa: no se detallan hiperparámetros de entrenamiento, número de tokens, resultados de benchmarks ni detalles de arquitectura más allá de la herencia del modelo base. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-0.8B; transformer, detalles no especificados) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 873 millones de parámetros. El ajuste fino se realizó con LoRA configurado sobre `target_modules="all-linear"`, es decir, aplicando adaptadores de bajo rango a todas las capas lineales del modelo base. El objetivo del entrenamiento (SFT v3) es la respuesta corta a preguntas sobre Wikipedia japonesa en un escenario RAG, con contextos de recuperación y negativos difíciles construidos mediante RRF (fusión de rankings recíproca) y reranking con el modelo Ruri.

Los datos de entrenamiento provienen de JEMHopQA, JSQuAD/JGLUE, NIILC QA y fragmentos de Wikipedia japonesa (`bumbuboon/llm-course-final-2026`), todos ellos bajo licencia CC BY-SA 4.0 y modificados (filtrado y reformateo) para el entrenamiento; los fragmentos de Wikipedia se emplearon como contextos de recuperación sin alteración. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del uso de negativos difíciles reranqueados.

## Capacidades

- Generación de respuestas cortas a preguntas en japonés a partir de contextos recuperados (QA extractiva/generativa).
- Razonamiento sobre contextos documentales de Wikipedia japonesa.
- Manejo de preguntas que requieren combinar información de múltiples pasajes (derivado del uso de JEMHopQA, un dataset de QA multi-salto).
- Especialización en el idioma japonés; no se documenta soporte multilingüe.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del propio QA.
- No se documentan capacidades de visión, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Sistemas de pregunta-respuesta sobre Wikipedia japonesa: el modelo se integra como generador final en un pipeline RAG, recibiendo pasajes recuperados (por BM25, embeddings o reranker) y emitiendo respuestas cortas y concretas.
- Asistentes de consulta documental interna en japonés: desplegado sobre corpus propios tokenizados y recuperados con un retriever, responde preguntas factuales con respuestas breves.
- Búsqueda conversacional en enciclopedias y bases de conocimiento: dado su ajuste a contextos de Wikipedia, encaja en interfaces de búsqueda que devuelven respuestas sintetizadas en lugar de listas de enlaces.
- Evaluación de pipelines de recuperación: al estar entrenado con negativos difíciles reranqueados, sirve para medir la calidad del retriever y del reranker en tareas de QA japonés.
- Prototipado rápido y entornos con recursos limitados: con menos de mil millones de parámetros, puede ejecutarse en hardware modesto para validar flujos RAG antes de escalar a modelos mayores.
- Investigación en ajuste fino con LoRA: el modelo y su receta (LoRA sobre all-linear, negativos RRF+Ruri) sirven como referencia para experimentos de SFT en QA japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (873 M de parámetros), en FP16 requeriría aproximadamente 1,7 GB solo para pesos, y en cuantización de 8 bits alrededor de 0,9 GB, sin contar overhead de contexto y activaciones (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño inferior a mil millones de parámetros, aunque no hay confirmación oficial.
- Opciones de despliegue: no documentadas; al estar en safetensors, sería compatible con frameworks estándar (transformers, vLLM, TGI) previa conversión a GGUF para llama.cpp u Ollama, si bien no se confirma soporte.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| s2naito/qwen3.5-0.8b-rag-sft-v3 | 873 M | no disponible | ja | Apache 2.0 | Fine-tuning LoRA para RAG QA en japones |
| Qwen/Qwen3.5-0.8B (base) | ~0.8 B | no disponible | multilingue (segun base) | no disponible en la informacion | Modelo base sin ajuste especifico de QA |
| Alternativas de QA japones RAG de tamano similar | no disponible | no disponible | ja | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en japones; su rendimiento en otros idiomas no esta documentado y previsiblemente sera limitado.
- Al ser un ajuste para QA de respuesta corta sobre contextos recuperados, puede degradarse fuera de ese dominio o ante preguntas abiertas y generativas.
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas no respaldadas por el contexto recuperado, especialmente si el retriever aporta pasajes irrelevantes.
- No se documentan sesgos conocidos, pero al entrenarse sobre Wikipedia japonesa y datasets academicos, puede heredar los sesgos de dichas fuentes.
- Los datos de entrenamiento estan bajo CC BY-SA 4.0; aunque el modelo se distribuye con licencia Apache 2.0, conviene revisar las implicaciones de las licencias de los datasets para usos derivados.
- No hay informacion sobre la longitud de contexto efectiva, lo que limita la planificacion de despliegues con contextos largos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion externa ni de uso en produccion.
- No se han publicado benchmarks, por lo que no es posible verificar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset de fragmentos de Wikipedia: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
