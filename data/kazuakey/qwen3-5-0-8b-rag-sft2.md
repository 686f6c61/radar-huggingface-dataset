# kazuakey/qwen3.5-0.8b-rag-sft2

## Resumen

kazuakey/qwen3.5-0.8b-rag-sft2 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario kazuakey como parte de una tarea de curso académico. El modelo está especializado en una tarea muy concreta de generación aumentada por recuperación (RAG) sobre Wikipedia en japonés: dado un conjunto de tres pasajes recuperados y una pregunta, debe producir una salida JSON con la forma `{"answer": ..., "chunk_id": ...}`, es decir, una respuesta y el identificador del fragmento que la sustenta.

Técnicamente se trata de un LoRA ajustado y posteriormente fusionado (merged) de vuelta en la arquitectura original del modelo base, con 752.393.024 parámetros totales según los pesos en safetensors y un repositorio de 1,5 GB. No es un modelo de propósito general ni un lanzamiento de laboratorio: es un artefacto educativo y experimental, con cero descargas y cero likes en el momento de la consulta, publicado bajo licencia CC BY-SA 4.0.

Su relevancia es limitada fuera del contexto para el que fue creado. Resulta útil como ejemplo reproducible de pipeline RAG con ajuste fino ligero sobre un modelo pequeño, y como referencia de formato de salida estructurado (JSON con cita de fragmento) en tareas de question answering extractivo en japonés. No debe evaluarse como un modelo generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tipo `qwen3_5_text`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible de forma explícita; el entrenamiento se realiza sobre datasets de Wikipedia en japonés |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 con aproximadamente 752 millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA que posteriormente se fusionó en los pesos originales, de modo que el artefacto publicado es un checkpoint denso estándar, no un adaptador separado. El tag `qwen3_5_text` indica que se trata de la variante de texto del modelo base.

El entrenamiento se realizó exclusivamente con datos de dos conjuntos de question answering en japonés: JaQuAD (licencia CC BY-SA 3.0 Unported) y JSQuAD, integrado en JGLUE (licencia CC BY-SA 4.0). El preprocesado fue mecánico: ventana de pasajes y generación de negativos duros mediante BM25. La tarea de entrenamiento es la producción de JSON con respuesta y `chunk_id` a partir de tres pasajes recuperados y una pregunta. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición exacta del dataset, hiperparámetros de LoRA, uso de RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Generación de respuestas extractivas en japonés ancladas a pasajes de contexto (RAG).
- Salida estructurada en JSON con dos campos: `answer` y `chunk_id`.
- Selección del fragmento relevante entre tres pasajes recuperados (identificación de la fuente).
- Manejo de negativos duros generados con BM25, lo que le entrena a descartar pasajes léxicamente similares pero incorrectos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidades multilingües: no disponibles; el ajuste se limita a japonés.

## Casos de uso

- Respuesta extractiva sobre Wikipedia en japonés: el modelo recibe tres pasajes y una pregunta y devuelve la respuesta junto con el `chunk_id` del fragmento que la contiene, lo que permite construir un sistema RAG con trazabilidad de la fuente.
- Prototipado educativo de pipelines RAG: sirve como referencia para asignaturas o tutoriales que enseñan a ajustar un modelo pequeño con LoRA y a fusionar los pesos para su despliegue.
- Evaluación de la calidad del retrieval: al devolver el `chunk_id` seleccionado, el modelo puede usarse para medir si el recuperador (por ejemplo, BM25) está colocando el pasaje correcto entre los tres primeros.
- Generación de datos sintéticos de QA con cita: el formato JSON con identificador de fragmento facilita la creación de pares pregunta-respuesta anotados con su fuente para otros experimentos.
- Filtrado y reordenación de pasajes: en una etapa de reranking ligera, el modelo puede descartar pasajes que no contienen la respuesta, dado que fue entrenado con negativos duros de BM25.
- Despliegue de bajo coste en entornos con recursos limitados: con 752 millones de parámetros, el checkpoint cabe en GPUs de consumo y permite experimentar con RAG en japonés sin infraestructura grande.
- Demostración de salida estructurada: útil como ejemplo de ajuste para forzar JSON válido en modelos pequeños, aplicable a otras tareas de extracción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (752 M de parámetros), en fp16 el checkpoint ronda 1,5 GB de pesos y en cuantización de 8 bits aproximadamente 0,8 GB; estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponibles. Por tamaño, debería ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para servir en lote.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se documenta en la model card.
- Opciones de despliegue: no documentadas. El formato safetensors es compatible con frameworks estándar (transformers, vLLM, TGI); no se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kazuakey/qwen3.5-0.8b-rag-sft2 | 752 M | no disponible | RAG QA japonés con JSON y `chunk_id` | CC BY-SA 4.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Propósito general | según model card del base | Hugging Face |
| Modelos QA japoneses tipo JaQuAD/JSQuAD fine-tunes | variable | no disponible | QA extractivo japonés | variable | Hugging Face |

La comparación con alternativas de la misma categoría (fine-tunes pequeños para QA en japonés) no está disponible con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: solo está entrenado para el formato `{"answer": ..., "chunk_id": ...}` con tres pasajes y pregunta; no es un modelo de chat general.
- Riesgo de alucinación: al ser un modelo pequeño ajustado de forma supervisada, puede generar respuestas no presentes en los pasajes o seleccionar un `chunk_id` incorrecto.
- Sesgos: los hereda del modelo base y de los datasets JaQuAD y JSQuAD, sin que se documente ninguna mitigación.
- Limitaciones de idioma: el ajuste se limita al japonés; no se documenta comportamiento en castellano ni en otros idiomas.
- Restricciones de licencia: CC BY-SA 4.0 obliga a atribución y a compartir las obras derivadas bajo la misma licencia; además, los datasets de entrenamiento (CC BY-SA 3.0 y 4.0) imponen condiciones de atribución y compartición que deben respetarse en productos derivados.
- Uso comercial: la licencia CC BY-SA 4.0 permite uso comercial con condiciones de atribución y share-alike; conviene revisar también la licencia del modelo base Qwen3.5-0.8B, que puede añadir restricciones.
- Madurez: cero descargas y cero likes, creado y actualizado el mismo día, sin pipeline declarado ni evaluación publicada; no es apto para producción sin validación propia.
- Contexto y cuantizaciones no documentados: no hay información sobre la ventana máxima ni sobre pesos cuantizados, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kazuakey/qwen3.5-0.8b-rag-sft2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- Licencia JaQuAD (CC BY-SA 3.0): https://creativecommons.org/licenses/by-sa/3.0/
- JGLUE / JSQuAD: https://github.com/yahoojapan/JGLUE
- Licencia JSQuAD (CC BY-SA 4.0): https://creativecommons.org/licenses/by-sa/4.0/
