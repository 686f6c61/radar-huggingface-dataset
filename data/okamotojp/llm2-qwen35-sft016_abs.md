# OkamotoJP/llm2-qwen35-sft016_abs

## Resumen

sft016_abs es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP en el contexto del curso "LLM講座2 2026" (Lección de LLM 2, 2026). El modelo está diseñado específicamente para la generación de respuestas en un sistema de generación aumentada por recuperación (RAG), y se entrenó mediante LoRA con fusión posterior de los pesos en el modelo base. La arquitectura subyacente es la del Qwen3.5-0.8B original, un transformer decoder-only de aproximadamente 873 millones de parámetros.

El modelo resuelve el problema de generar respuestas fundamentadas en documentos recuperados, un componente crítico de cualquier pipeline RAG. Para ello se entrenó sobre conjuntos de datos de question answering japonés (JEMHopQA y auto-wiki-qa), con prompts que incluyen fragmentos de Wikipedia japonesa como material de referencia. El resultado es un modelo compacto que cabe en hardware modesto y está orientado a un caso de uso muy concreto: responder preguntas en japonés a partir de contexto documental.

Su relevancia es limitada pero clara: se trata de un ajuste de nicho, con solo 9 descargas y sin métricas publicadas, que ilustra el patrón de especialización de modelos pequeños para tareas RAG en idiomas distintos del inglés. No es un modelo de propósito general, sino una pieza de un sistema mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), estructura idéntica al modelo base |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el modelo base admite cuantizaciones estándar) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17), un transformer decoder-only. Según la model card, únicamente se actualizaron los pesos de la parte lingüística; la estructura es idéntica al modelo original. El ajuste se realizó con LoRA de r=16 y alpha=32, tasa de aprendizaje 0.0001, una sola época y 1.301 ejemplos de entrenamiento, tras lo cual los adaptadores se fusionaron en los pesos base.

Los datos de entrenamiento provienen de JEMHopQA (CC BY-SA 4.0) y cl-nagoya/auto-wiki-qa (CC BY-SA 4.0), muestreados, filtrados y reformateados. La distribución es: 883 ejemplos de auto_wiki_qa, 51 de auto_wiki_qa/特定できません, 31 de jemhopqa_train_sft/compositional/特定できません y 336 de jemhopqa_train_sft/compositional. Además, se usaron fragmentos de Wikipedia japonesa (CC BY-SA 4.0) como material de referencia en los prompts. No se documenta entrenamiento con RLHF ni DPO, ni innovaciones técnicas adicionales más allá del propio ajuste LoRA.

## Capacidades

- Generación de respuestas en japonés condicionadas a contexto documental (RAG).
- Question answering sobre pasajes de Wikipedia japonesa.
- Razonamiento composicional básico, derivado del subconjunto compositional de JEMHopQA.
- Manejo explícito de casos sin respuesta identificable (categoría 特定できません, "no se puede determinar"), aprendida durante el ajuste.
- Capacidades heredadas del modelo base Qwen3.5-0.8B en la medida en que el ajuste no las degrade; no documentadas por el autor.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al japonés según la model card; el modelo base podría conservar competencias en otros idiomas, pero no está verificado.

## Casos de uso

- Generación de respuestas en pipelines RAG en japonés: el modelo recibe fragmentos recuperados y una pregunta, y produce una respuesta fundamentada; es su propósito declarado y el escenario para el que fue entrenado.
- Asistentes de documentación interna en empresas japonesas: integrado en un sistema de búsqueda sobre manuales o bases de conocimiento, genera respuestas citando el material recuperado.
- Sistemas de FAQ sobre Wikipedia o corpus enciclopédicos: adecuado para preguntas factuales y composicionales en japonés, gracias al entrenamiento con JEMHopQA y auto-wiki-qa.
- Detección de preguntas sin respuesta: la inclusión de ejemplos etiquetados como 特定できません permite al modelo abstenerse cuando el contexto no contiene la información, reduciendo respuestas inventadas en producción.
- Prototipado y experimentación educativa: su tamaño (873 M parámetros) y licencia Apache-2.0 lo hacen idóneo para entornos de aprendizaje y pruebas de concepto en hardware de consumo.
- Clasificación y extracción de respuestas en pipelines de evaluación: puede usarse como generador de referencia en la evaluación de sistemas RAG japoneses, comparando sus salidas con las de modelos mayores.
- Despliegue en entornos con recursos limitados: al caber en GPU de consumo, sirve para demos locales de asistentes de preguntas y respuestas en japonés sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 873 M parámetros, en fp16 requeriría aproximadamente 1,7 GB de pesos, y en cuantización de 8 bits alrededor de 0,9 GB (estimaciones a partir del recuento de parámetros, no verificadas por el autor).
- GPU recomendadas: no documentadas. Por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder cargar el modelo en fp16.
- GPU de consumo: probablemente compatible con RTX 3060, RTX 4060, RTX 4090 y similares; no verificado.
- Opciones de despliegue: al ser un modelo transformers estándar en safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión); ninguna de estas integraciones está documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft016_abs | 873 M | No disponible | Apache-2.0 | SFT para RAG en japonés |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | No disponible | Apache-2.0 | Modelo generalista |
| cl-nagoya/auto-wiki-qa (dataset) | No aplica | No aplica | CC BY-SA 4.0 | Corpus de entrenamiento, no modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación con alternativas de la misma categoría (modelos pequeños ajustados para RAG en japonés) no está disponible.

## Limitaciones y advertencias

- Modelo de nicho con muy poca tracción: 9 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente al modelo base ni frente a alternativas.
- Entrenado con solo 1.301 ejemplos y una época: riesgo de sobreajuste al formato exacto de los prompts de entrenamiento y de degradación de capacidades generales del modelo base.
- Idiomas: la model card declara únicamente japonés; su uso en castellano u otros idiomas no está soportado ni verificado.
- Riesgo de alucinación: aunque se entrenó para abstenerse en casos sin respuesta, un modelo de 873 M parámetros sigue siendo propenso a inventar contenido cuando el contexto es ambiguo o insuficiente.
- Sesgos: no documentados por el autor; los datos de Wikipedia japonesa pueden introducir sesgos de cobertura y de perspectiva.
- Licencia Apache-2.0: permite uso comercial, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas; conviene revisar la compatibilidad antes de un uso comercial.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con contextos largos, crítico en RAG.
- Sin información sobre tool calling ni capacidades de agente: no apto para pipelines que requieran estas funciones sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft016_abs
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
