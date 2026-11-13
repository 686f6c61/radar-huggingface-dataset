# katsu06/qwen3.5-0.8b-rag-b3v2

## Resumen

katsu06/qwen3.5-0.8b-rag-b3v2 es un ajuste fino del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario katsu06 como proyecto final del curso "LLM講座2 2026". El objetivo concreto del modelo es resolver tareas de generación aumentada por recuperación (RAG) sobre Wikipedia en japonés: recibe un conjunto de fragmentos recuperados y una pregunta, y devuelve un JSON con la respuesta y el identificador del fragmento que la sustenta (`{"answer": ..., "chunk_id": ...}`).

Técnicamente se trata de un merge de un adaptador LoRA sobre el modelo base, por lo que conserva exactamente la arquitectura, la forma y el tipo de los pesos originales. El modelo tiene 873.438.784 parámetros (aproximadamente 0,87 mil millones) y un repositorio de 1,8 GB en formato safetensors. Está especializado en japonés y se distribuye bajo licencia Apache-2.0.

Su relevancia es acotada pero clara: demuestra un patrón práctico de ajuste de un modelo pequeño para una tarea estructurada de RAG con citación de fuentes, incluyendo entrenamiento con distractores (fragmentos recuperados que no contienen la respuesta) y aleatorización del orden de los documentos para mejorar la robustez frente a recuperaciones imperfectas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura de Qwen3.5, tipo `qwen3_5`); estructura de pesos idéntica al modelo base |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | japonés (`ja`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) |
| Tipo de ajuste | LoRA fusionado (merge) sobre el modelo base |
| Tamaño del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,87 mil millones de parámetros. Sobre él se aplicó un adaptador LoRA con r=16, alpha=32 y dropout de 0,05, aplicado a todas las capas lineales de la parte de modelo de lenguaje. Posteriormente el adaptador se fusionó con los pesos originales, de modo que la estructura (nombres, formas y tipos de los tensores) es idéntica a la del modelo base y no requiere cargar un adaptador separado.

El entrenamiento se realizó en dos fases. La primera, con tasa de aprendizaje 1e-4, calentamiento del 5 %, decaimiento coseno, tamaño de lote de 8, una época y 880 ejemplos, usando entre 2 y 4 documentos de contexto por muestra. La segunda fase partió del modelo de la primera, con tasa 5e-5, lote de 8 y una época, usando 3 a 5 documentos por muestra; en esta fase se mezclaron documentos recuperados de alta posición que no contenían la respuesta como distractores y se aleatorizó el orden de los documentos en el 75 % de los casos. Los datos de entrenamiento se generaron de forma mecánica a partir de las preguntas de los conjuntos auto-wiki-qa, JaQuAD y JEMHopQA, combinadas con los fragmentos de Wikipedia distribuidos en el curso. La tarea de entrenamiento es estrictamente extractiva y con citación: producir la frase de respuesta y el `chunk_id` del fragmento que la respalda.

## Capacidades

- Generación de respuestas extractivas en japonés a partir de documentos de contexto recuperados.
- Salida estructurada en JSON con dos campos: `answer` (texto de la respuesta) y `chunk_id` (identificador del fragmento que la sustenta).
- Citación de fuentes a nivel de fragmento, lo que permite verificar la respuesta contra el documento original.
- Robustez ante distractores: entrenado explícitamente con fragmentos recuperados que no contienen la respuesta.
- Tolerancia al orden de los documentos: entrenado con orden aleatorizado en el 75 % de los ejemplos.
- Manejo de múltiples documentos de contexto (2 a 5 fragmentos durante el entrenamiento).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso genérico, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Respuesta sobre Wikipedia en japonés con citación: dado un conjunto de fragmentos recuperados por un buscador (BM25, embeddings o híbrido) y una pregunta del usuario, el modelo devuelve la respuesta y el `chunk_id` del fragmento que la contiene, lo que permite mostrar la fuente al usuario final.
- Verificación de recuperación en pipelines RAG: al devolver el `chunk_id` de respaldo, el sistema puede comprobar si el retriever ha traído el fragmento correcto y registrar métricas de precisión de recuperación en producción.
- Atención al cliente sobre base documental cerrada: integrado en un sistema RAG interno con documentación en japonés, el modelo responde con extractos literales del corpus, lo que reduce el riesgo de respuestas inventadas fuera del material proporcionado.
- Asistente de consulta documental para soporte interno: con fragmentos de manuales o bases de conocimiento en japonés, el modelo localiza la frase relevante y señala el documento de origen para que el operador lo consulte.
- Evaluación y comparación de retrievers: al medir cuántas veces el `chunk_id` devuelto coincide con el fragmento que contiene la respuesta, el modelo sirve como componente de evaluación de distintas configuraciones de recuperación.
- Filtrado de contexto en cadenas RAG: al identificar el fragmento que respalda la respuesta, el sistema puede descartar el resto del contexto recuperado en pasos posteriores, reduciendo el consumo de tokens en un modelo mayor.
- Prototipado en local: con menos de mil millones de parámetros y pesos en safetensors, el modelo se puede desplegar en una sola GPU de consumo para experimentar con pipelines RAG en japonés sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,8 GB solo para los pesos, más memoria para caché KV y activaciones (el total práctico suele situarse en el rango de 3 a 5 GB según longitud de contexto y lote).
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para los pesos, más caché KV.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,5 GB para los pesos, más caché KV.
- GPU de consumo: cabe con holgura en tarjetas con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090); en 4 bits podría ejecutarse en GPUs con 4-6 GB.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para este tamaño; su uso solo se justifica por agregación de muchas peticiones concurrentes.
- Opciones de despliegue: transformers con safetensors, vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no se publican en el repositorio). El formato nativo del repo es safetensors.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| katsu06/qwen3.5-0.8b-rag-b3v2 | 873.438.784 | no disponible | RAG extractivo con citación en japonés | Apache-2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible | Modelo generalista multilingüe | Apache-2.0 | Hugging Face |
| Modelos RAG japoneses de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de mediciones comparativas que permitan contrastar el rendimiento de este ajuste frente al modelo base u otras alternativas de la misma categoría. La comparación relevante es funcional: el modelo base es generalista, mientras que este ajuste está especializado en una única tarea de salida estructurada con citación.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está entrenado para una única tarea (responder con `answer` y `chunk_id` a partir de fragmentos recuperados). Fuera de ese formato es probable que el rendimiento decaiga respecto al modelo base.
- Naturaleza extractiva: la respuesta se construye a partir del texto de los fragmentos; si la respuesta no está presente en el contexto recuperado, el modelo puede devolver un `chunk_id` incorrecto o un texto no respaldado.
- Idioma: solo se declara japonés. No hay evidencia de comportamiento fiable en castellano ni en otros idiomas.
- Sesgos: los datos de entrenamiento provienen de Wikipedia en japonés y de los conjuntos auto-wiki-qa, JaQuAD y JEMHopQA, por lo que hereda los sesgos de cobertura y de redacción de esas fuentes.
- Riesgo de alucinación: aunque la tarea es extractiva, el modelo puede generar respuestas plausibles que no aparezcan literalmente en los fragmentos proporcionados; conviene validar el `answer` contra el fragmento citado.
- Licencias de los datos: aunque el modelo se distribuye como Apache-2.0, los datos de entrenamiento tienen licencias CC BY-SA 4.0 (auto-wiki-qa, JEMHopQA, fragmentos de Wikipedia) y CC BY-SA 3.0 (JaQuAD); el autor indica que deben respetarse las condiciones de esas licencias.
- Madurez: el repositorio no tiene descargas ni likes en el momento de la consulta y no incluye benchmarks, lo que limita la evidencia disponible sobre su calidad en producción.
- Contexto: no se documenta la longitud máxima de contexto soportada; el entrenamiento usó entre 2 y 5 fragmentos por muestra, por lo que el comportamiento con contextos muy largos no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/katsu06/qwen3.5-0.8b-rag-b3v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
