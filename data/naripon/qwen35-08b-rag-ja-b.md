# naripon/qwen35-08b-rag-ja-B

## Resumen

qwen35-08b-rag-ja-B es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario naripon y publicado en Hugging Face bajo licencia Apache-2.0. El modelo está especializado en una tarea muy concreta: responder preguntas en japonés en un contexto de generación aumentada por recuperación (RAG), devolviendo una respuesta corta y el identificador del fragmento (chunk_id) en formato JSON a partir de cinco documentos proporcionados.

Con 873.438.784 parámetros reales (verificados en los pesos safetensors), se trata de un modelo compacto orientado a despliegues con requisitos de hardware modestos. La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer denso de la familia Qwen3.5, aunque la model card no detalla la arquitectura interna ni la longitud de contexto del modelo base.

Su relevancia radica en su carácter de experimento de ajuste fino para RAG en japonés con un formato de salida estructurado y verificable (JSON con chunk_id), lo que facilita la integración en pipelines de recuperación y la evaluación automática de la fidelidad de las respuestas. No obstante, el modelo no cuenta con descargas ni valoraciones en el momento de la consulta y la información publicada es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) y se ha ajustado mediante LoRA, fusionando posteriormente los pesos adaptadores en el modelo final. La model card no especifica hiperparámetros de entrenamiento (rango del LoRA, tasa de aprendizaje, número de épocas) ni la composición exacta del dataset más allá de la fuente principal.

Los datos de entrenamiento provienen de JSQuAD (JGLUE) v1.3, en su partición de entrenamiento, con licencia CC BY-SA 4.0, filtrados y reformateados para la tarea. Las combinaciones de documentos se construyeron seleccionando párrafos del mismo conjunto mediante similitud TF-IDF (no basada en aprendizaje profundo). El autor declara explícitamente que no se utilizaron chunks distribuidos, otros datos externos ni problemas de competición. La tarea aprendida es devolver, a partir de cinco documentos de contexto, una respuesta corta junto con el chunk_id correspondiente en formato JSON.

## Capacidades

- Generación de respuestas cortas y extractivas en japonés a partir de documentos de contexto.
- Salida estructurada en JSON con respuesta y chunk_id, lo que facilita el parseo automático y la trazabilidad de la fuente.
- RAG de cinco documentos: el modelo está entrenado para manejar exactamente cinco fragmentos como contexto de entrada.
- Comprensión lectora en japonés orientada a preguntas factuales (derivada de JSQuAD).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo de pensamiento (thinking mode).
- Capacidad multilingüe limitada al japonés según la model card, aunque el modelo base podría conservar competencias en otros idiomas no declaradas.

## Casos de uso

- Atención al cliente automatizada sobre base documental: el modelo recibe cinco fragmentos recuperados de una base de conocimiento y devuelve una respuesta corta con el identificador del fragmento fuente, lo que permite citar la procedencia y auditar la respuesta.
- Sistemas de preguntas y respuestas sobre documentación interna: integrado en un pipeline RAG con un recuperador (por ejemplo, búsqueda híbrida BM25 + embeddings), el modelo genera respuestas trazables a fragmentos concretos, adecuado para manuales técnicos o políticas internas.
- Evaluación de fidelidad en RAG: al devolver el chunk_id utilizado, permite medir automáticamente si la respuesta se apoya en el fragmento correcto, útil en pipelines de evaluación y control de calidad.
- Extracción de respuestas factuales en corpus japoneses: para tareas de question answering extractivo sobre conjuntos de documentos estructurados, donde se requiere una respuesta breve y localizada.
- Prototipado rápido en entornos con recursos limitados: con menos de 900 millones de parámetros, puede ejecutarse en GPU de consumo y en CPU, lo que facilita pruebas de concepto de RAG en japonés sin infraestructura dedicada.
- Filtrado y enrutamiento de consultas: la salida JSON estructurada permite usar el modelo como componente intermedio en un sistema mayor que decida si una consulta puede responderse con los documentos recuperados o debe escalarse.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 del modelo y del base facilita su uso comercial, siempre que se respeten las obligaciones de atribución de los datos de entrenamiento (CC BY-SA 4.0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP32): aproximadamente 3,5 GB solo para pesos (873 M de parámetros × 4 bytes), más memoria para activaciones y caché KV.
- VRAM estimada en FP16/BF16: aproximadamente 1,75 GB para pesos, más overhead de inferencia.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,45 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 con contexto moderado; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. También puede ejecutarse en CPU con llama.cpp u Ollama si se generan pesos GGUF (no publicados por el autor).
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer con 6 GB o más de VRAM en FP16; en cuantización 4 bits podría caber en iGPU y sistemas embebidos con 2 GB.
- Opciones de despliegue: transformers (con safetensors), vLLM, TGI, llama.cpp y Ollama previa conversión a GGUF. El autor no publica variantes GGUF, por lo que la conversión correría a cargo del usuario.
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| naripon/qwen35-08b-rag-ja-B | 873 M | No disponible | Japonés | Apache-2.0 | RAG en japonés con salida JSON y chunk_id |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Multilingüe | Apache-2.0 | Modelo generalista |
| Modelos RAG japoneses de la familia Qwen ajustados (otros fine-tunes comunitarios) | Variable | No disponible | Japonés | Variable | RAG y QA en japonés |

La comparación con alternativas concretas no está disponible en la información proporcionada. El principal punto de referencia es el modelo base Qwen/Qwen3.5-0.8B, del que este fine-tune hereda arquitectura y licencia, pero no se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para una tarea concreta (cinco documentos de contexto, respuesta corta y chunk_id en JSON); su rendimiento fuera de ese formato o con otro número de documentos no está garantizado.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas no sustentadas en los documentos, aunque el formato con chunk_id facilita la detección.
- Sesgos: los derivados de JSQuAD (JGLUE), un corpus de comprensión lectora en japonés con dominios y estilos limitados; no se documentan evaluaciones de sesgo.
- Limitación de idioma: la model card declara únicamente japonés; el rendimiento en otros idiomas no está evaluado.
- Longitud de contexto: no documentada; el uso con contextos largos o con más de cinco documentos no está validado.
- Licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento (JSQuAD) están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-al-igual sobre el modelo derivado; conviene revisar la compatibilidad antes de un uso comercial.
- Madurez: sin descargas ni valoraciones, sin benchmarks publicados y con una model card mínima; no recomendable para producción sin una evaluación propia exhaustiva.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/naripon/qwen35-08b-rag-ja-B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
