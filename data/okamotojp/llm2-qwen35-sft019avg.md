# OkamotoJP/llm2-qwen35-sft019avg

## Resumen

`OkamotoJP/llm2-qwen35-sft019avg` es un ajuste fino (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP en el contexto del curso "LLM講座2 2026". Se trata de un modelo de pesos promediados: el autor entrenó dos variantes LoRA con los mismos datos y distinta semilla, las fusionó con los pesos del modelo base y después promedió elemento a elemento ambos resultados (peso 0,50 cada uno). El resultado conserva la arquitectura del modelo original y solo modifica los pesos de la parte lingüística.

El objetivo declarado es la generación de respuestas para una tarea final de RAG (retrieval-augmented generation) sobre documentación y preguntas en japonés. Con 873 millones de parámetros, está pensado para ejecutarse en hardware modesto y para tareas de respuesta extractiva y generativa sobre contexto recuperado, no como modelo de propósito general.

Su relevancia es limitada: es un artefacto académico con 15 descargas y sin benchmarks publicados. Resulta útil como ejemplo reproducible de la técnica de model averaging sobre adaptadores LoRA en modelos pequeños, y como modelo especializado en japonés para pipelines de RAG ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Qwen3.5-0.8B); estructura idéntica al modelo base, solo se modifican los pesos de la parte lingüística |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen/Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El autor aplicó ajuste supervisado (SFT) mediante LoRA sobre dos ejecuciones independientes con los mismos datos de entrenamiento y distinta semilla, fusionó cada adaptador con el modelo base y promedió los dos conjuntos de pesos resultantes con ponderación 0,50/0,50. La model card indica explícitamente que la arquitectura es idéntica a la del modelo original y que solo cambian los pesos de la parte lingüística.

Los datos de entrenamiento de las dos variantes originales son: JEMHopQA (CC BY-SA 4.0, filtrado y reformateado), `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0, muestreado, filtrado y reformateado) y un conjunto de fragmentos derivados de Wikipedia en japonés (CC BY-SA 4.0) usados como material de contexto en los prompts de entrenamiento. No se documentan número de tokens, composición exacta del dataset, ni fases de RLHF o DPO. La innovación técnica destacable es el uso de model averaging (weight averaging) sobre adaptadores LoRA fusionados, una técnica barata para reducir la varianza entre semillas sin coste adicional de inferencia.

## Capacidades

- Generación de texto en japonés condicionada a contexto, orientada a responder preguntas sobre documentos recuperados (RAG).
- Respuesta a preguntas de tipo hop múltiple, gracias al entrenamiento con JEMHopQA.
- Extracción y síntesis de información a partir de pasajes de Wikipedia en japonés.
- Generación de respuestas cortas y factuales propias de un asistente de QA documental.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- No se documenta capacidad de visión, audio ni modo de razonamiento (thinking mode).
- Capacidad multilingüe: limitada al japonés según la etiqueta de idioma declarada.

## Casos de uso

- Generación de respuestas en un pipeline de RAG en japonés: el modelo recibe los fragmentos recuperados como contexto y produce la respuesta final; es exactamente el escenario para el que fue entrenado.
- Asistente de documentación interna en japonés: integrado en una herramienta de búsqueda corporativa, responde preguntas sobre manuales y políticas a partir de los pasajes recuperados.
- QA sobre Wikipedia japonesa: adecuado para preguntas encadenadas (multi-hop) del estilo de JEMHopQA, con respuestas breves y ancladas al contexto.
- Prototipado rápido en local: con menos de 900 millones de parámetros cabe en GPU de consumo y permite iterar sobre pipelines de RAG sin infraestructura dedicada.
- Evaluación académica de técnicas de model averaging: sirve como referencia reproducible para comparar promediado de pesos frente a un único ajuste LoRA.
- Clasificación y resumen extractivo de pasajes japoneses: puede reformular o condensar fragmentos recuperados antes de mostrarlos al usuario final.
- Filtrado de contexto en recuperación: puede puntuar o reescribir consultas y pasajes en japonés dentro de una etapa de reranking generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB (no se publican GGUF, habría que generarlos).
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090); en entornos de servidor, A100 o H100 son sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 8 GB o superiores.
- Opciones de despliegue: `transformers` de Hugging Face para inferencia directa; vLLM y TGI son compatibles con la arquitectura del modelo base; llama.cpp y Ollama requerirían convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft019avg | 873 M | no disponible | ja | Apache-2.0 | SFT + model averaging sobre Qwen3.5-0.8B; sin benchmarks |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | multilingüe | Apache-2.0 | Modelo base; capacidades generales, sin especialización en RAG japonés |
| cl-nagoya/auto-wiki-qa (dataset) | no aplica | no aplica | ja | CC BY-SA 4.0 | Fuente de datos de entrenamiento; no es un modelo comparable en inferencia |
| OkamotoJP/llm2-qwen35-sft019 y sft019b | ~0,8 B | no disponible | ja | Apache-2.0 | Variantes individuales promediadas; mismas capacidades, mayor varianza entre semillas |

## Limitaciones y advertencias

- Modelo de nicho con 15 descargas y 0 likes: no ha pasado por una validación comunitaria amplia.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente al modelo base ni frente a alternativas.
- Entrenado exclusivamente para japonés: el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación inherente a un modelo de 0,8 B: puede inventar datos cuando el contexto recuperado es insuficiente o ambiguo.
- Los datos de entrenamiento incluyen material con licencia CC BY-SA 4.0 (JEMHopQA, auto-wiki-qa, fragmentos de Wikipedia); aunque los pesos se publican como Apache-2.0, conviene revisar las obligaciones de atribución y compartir-igual si se redistribuye el modelo o derivados.
- Longitud de contexto no documentada: hay que consultar la model card de Qwen3.5-0.8B para conocerla antes de diseñar el pipeline.
- No se documentan capacidades de tool calling ni de agentes: no debe asumirse que las soporta.
- Al ser un promedio de dos ajustes con los mismos datos, la diversidad efectiva del modelo es la de un único SFT; el promediado reduce varianza pero no añade conocimiento nuevo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft019avg
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante promediada 1: https://huggingface.co/OkamotoJP/llm2-qwen35-sft019 (revision d990cb43bb213b9cb1f38117cc5dbb87d4619c42)
- Variante promediada 2: https://huggingface.co/OkamotoJP/llm2-qwen35-sft019b (revision 8840df43902d02d6199af69142024b0350f14cd3)
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
