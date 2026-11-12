# katsu06/qwen3.5-0.8b-rag-b3

## Resumen

katsu06/qwen3.5-0.8b-rag-b3 es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario katsu06 en el contexto del curso «LLM講座2 2026». El modelo está especializado en una tarea muy concreta: responder preguntas en japonés sobre Wikipedia utilizando recuperación aumentada (RAG), devolviendo un objeto JSON con la respuesta y el identificador del fragmento (chunk_id) que sirve como evidencia.

Se trata de un modelo compacto de aproximadamente 873 millones de parámetros totales, con licencia Apache-2.0 y pesos en formato safetensors. La estructura de pesos es idéntica a la del modelo base, ya que el adaptador LoRA se ha fusionado (merge) con los pesos originales. El repositorio ocupa 1,8 GB.

Su relevancia es acotada: no es un modelo de propósito general, sino una demostración técnica de cómo un modelo pequeño puede especializarse en una tarea estructurada de extracción de respuestas con trazabilidad de fuentes. Resulta útil como referencia para pipelines RAG en japonés y para estudiar el efecto del ajuste fino con LoRA sobre modelos de menos de mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base Qwen/Qwen3.5-0.8B; no se detalla en la informacion disponible) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`) y aplica un ajuste fino con LoRA sobre todas las capas lineales de la parte de modelo de lenguaje, con r=16, alpha=32 y dropout de 0,05. Posteriormente el adaptador se fusiona con los pesos base, de modo que la estructura del modelo resultante (nombres, formas y tipos de las matrices) es idéntica a la del original.

El entrenamiento se realizó con tasa de aprendizaje 1e-4, calentamiento del 5 % y decaimiento coseno, en lotes de 8 ejemplos durante una única época sobre 880 muestras. La tarea de entrenamiento consiste en recibir entre 2 y 4 documentos recuperados junto con una pregunta y generar un JSON con la forma `{"answer": ..., "chunk_id": ...}`. Los datos se construyeron de forma mecánica a partir de los conjuntos cl-nagoya/auto-wiki-qa, JaQuAD y JEMHopQA, combinados con fragmentos de Wikipedia distribuidos en el curso.

## Capacidades

- Generación de respuestas extractivas en japonés a partir de documentos de contexto.
- Salida estructurada en JSON con dos campos: `answer` y `chunk_id`.
- Identificación del fragmento de evidencia (chunk_id) que respalda la respuesta.
- Procesamiento de 2 a 4 documentos de contexto por consulta (régimen de entrenamiento).
- Especialización en preguntas sobre contenido de Wikipedia en japonés.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Respuesta a preguntas sobre Wikipedia en japonés: el modelo recibe fragmentos recuperados por un retriever y devuelve la respuesta junto con el chunk_id de origen, lo que permite mostrar la fuente al usuario y auditar la respuesta.
- Pipelines RAG con trazabilidad de fuentes: al devolver el identificador del fragmento, se puede construir una interfaz que cite el pasaje exacto que sustenta cada respuesta, útil en sistemas de documentación interna.
- Evaluación de retrievers: el chunk_id devuelto permite medir si el recuperador ha seleccionado el fragmento correcto y comparar configuraciones de búsqueda sin intervención manual.
- Prototipado de asistentes documentales en japonés: por su tamaño reducido (873 M de parámetros) puede desplegarse en entornos con recursos limitados para validar flujos RAG antes de escalar a modelos mayores.
- Extracción estructurada de respuestas: el formato JSON fijo facilita la integración en APIs y servicios backend que necesiten respuestas parseables y con referencia a la evidencia.
- Docencia y experimentación con LoRA: sirve como ejemplo reproducible de ajuste fino de un modelo pequeño para una tarea concreta, útil en cursos y laboratorios sobre RAG y adaptación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7-1,8 GB solo para los pesos, más overhead de activaciones y caché KV (no se detalla la longitud de contexto).
- VRAM estimada en cuantización de 8 bits: en torno a 0,9-1 GB para los pesos; en 4 bits, en torno a 0,5-0,6 GB (estimaciones a partir del número de parámetros; no hay variantes cuantizadas publicadas).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder alojar el modelo en fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para despliegues en servidor, A100 o H100 no son necesarias por tamaño, aunque pueden usarse para mayor throughput.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: al ser un modelo transformers estándar con pesos safetensors, puede servirse con vLLM, TGI o transformers; para llama.cpp/Ollama sería necesario convertir los pesos a GGUF (no se proporcionan dichos artefactos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Especializacion |
|---|---|---|---|---|---|
| katsu06/qwen3.5-0.8b-rag-b3 | 873 M | no disponible | ja | Apache-2.0 | RAG extractivo con chunk_id |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | multilingue (segun modelo base) | Apache-2.0 | proposito general |
| Modelos RAG japoneses de tamano similar | no disponible | no disponible | ja | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la tarea de responder preguntas con documentos de contexto en japonés y salida JSON, su comportamiento no está validado.
- Entrenado con solo 880 muestras y una época, lo que limita la generalización a distribuciones de preguntas y documentos distintas de las de entrenamiento.
- Riesgo de alucinación: aunque el formato obliga a citar un chunk_id, el modelo podría generar respuestas no sustentadas por el fragmento citado o identificadores inexistentes.
- Soporte únicamente del idioma japonés según la model card; el rendimiento en otros idiomas no está garantizado.
- No se documenta la longitud de contexto soportada, lo que impide conocer cuántos documentos o cuántos tokens de contexto admite en producción.
- No se publican variantes cuantizadas ni artefactos GGUF, lo que limita el despliegue en entornos de bajo consumo sin conversión previa.
- La licencia del modelo es Apache-2.0, pero los datos de entrenamiento tienen licencias CC BY-SA (3.0 y 4.0); deben respetarse sus condiciones de atribución y compartir igual si se redistribuyen derivados de esos datos.
- Sin descargas ni validación comunitaria en el momento de la consulta, por lo que no existe evidencia externa de calidad en uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/katsu06/qwen3.5-0.8b-rag-b3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
