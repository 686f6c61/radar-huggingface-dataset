# joamCriff123/zils-mini-sx3

## Resumen

zils-mini-sx3 es un modelo de decisión (decision model) publicado por el usuario joamCriff123 en Hugging Face, construido sobre la familia Qwen/Qwen3.5-4B. No se trata de un modelo conversacional de propósito general, sino de un cuerpo de decisión derivado del denominado "d3-mini" para el pool mini de la subred 127 de Zils, una plataforma que entrena modelos pequeños para clasificar peticiones, marcar problemas o puntuar coincidencias a partir de ejemplos etiquetados.

El modelo se ha obtenido mediante fine-tuning con LoRA sobre una mezcla (soup) de dos modelos previos de la misma familia, qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1, ambos bajo licencia Apache-2.0. El entrenamiento utilizó filas en formato de examen convertidas a partir de los splits de train de un conjunto amplio de datasets públicos de razonamiento, comprensión lectora, inferencia de lenguaje natural, clasificación de texto y análisis de sentimiento. Posteriormente, el cambio aprendido se escaló hacia la mezcla original mediante una interpolación en el espacio de pesos.

Con 4.539.265.536 parámetros totales y un repositorio de 9,1 GB en formato safetensors, el modelo declara el pipeline feature-extraction y la etiqueta decision-model. Es relevante ahora porque ejemplifica una tendencia creciente: reutilizar modelos base de 4B parámetros para tareas de decisión y clasificación especializadas, en lugar de desplegar LLM generalistas de mayor tamaño. La información publicada es muy escasa: no hay datos de benchmarks, idiomas, contexto ni detalles de entrenamiento más allá de la lista de datasets.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), derivado por fine-tuning LoRA e interpolación de pesos; etiqueta qwen3_5 |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4B parámetros, y se construye en dos fases. Primero se genera una mezcla base ("soup") mediante promedio uniforme de los pesos de qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1, ambos modelos de decisión Apache-2.0 de la misma familia. Sobre esa mezcla se aplica un fine-tuning con LoRA utilizando filas en formato de examen, es decir, ejemplos convertidos al formato de pregunta y respuesta esperado por el sistema de evaluación de Zils.

Los datos de entrenamiento proceden de los splits de train de un conjunto heterogéneo de datasets públicos: tareas de BIG-bench (tasksource/bigbench), SciQ, Cosmos QA, COPA, BoolQ, MRPC, QQP, CoLA, WiC, TREC, AG News, reseñas de Yelp, Rotten Tomatoes, LogiQA, ARC, OpenBookQA, CommonsenseQA, HellaSwag, WinoGrande, PAWS, SciTail, ANLI, QuaRTz, el split auxiliary train de MMLU, reseñas de Amazon, BBC News, spam de Enron, recuentos de entidades de CoNLL-2003, PIQA, Social IQa, 20 Newsgroups, dair-ai/emotion y titulares de sarcasmo. Tras el entrenamiento, el cambio aprendido se escala hacia la mezcla original mediante una interpolación en el espacio de pesos, una técnica habitual para controlar la intensidad del ajuste y reducir el olvido catastrófico. No se documentan número de tokens, composición exacta de la mezcla, ni si hubo RLHF o DPO.

## Capacidades

- Clasificación y decisión sobre entradas textuales en formato de examen, orientada a tareas de selección de respuesta, etiquetado y puntuación.
- Razonamiento sobre preguntas de opción múltiple y tareas de inferencia de lenguaje natural, gracias a la diversidad de datasets de entrenamiento (ARC, OpenBookQA, LogiQA, ANLI, COPA, HellaSwag).
- Comprensión lectora y respuesta a preguntas (SciQ, Cosmos QA, CommonsenseQA, BoolQ).
- Clasificación de texto y análisis de sentimiento (AG News, Yelp, Amazon reviews, Rotten Tomatoes, dair-ai/emotion, titulares de sarcasmo).
- Tareas de similitud y paráfrasis (MRPC, QQP, PAWS) y aceptabilidad lingüística (CoLA).
- Detección de spam y extracción de entidades (Enron spam, CoNLL-2003).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de peticiones en atención al cliente: el modelo puede asignar una categoría o etiqueta a cada mensaje entrante, aprovechando su entrenamiento en datasets de clasificación como AG News, TREC y 20 Newsgroups para enrutar tickets al equipo adecuado.
- Filtrado de spam y contenido abusivo: su exposición a Enron spam y a titulares de sarcasmo permite usarlo como clasificador binario o multiclase en pipelines de moderación, con la ventaja de un tamaño de 4B que reduce el coste frente a LLM mayores.
- Puntuación de coincidencias y similitud semántica: entrenado con MRPC, QQP y PAWS, puede puntuar pares de textos para tareas de deduplicación, búsqueda de duplicados o matching entre ofertas y candidatos.
- Evaluación automática de exámenes y cuestionarios: el formato de examen con el que se entrenó lo hace adecuado para corregir preguntas de opción múltiple en plataformas educativas, comparando la respuesta del alumno con las opciones disponibles.
- Análisis de sentimiento en reseñas de producto: su entrenamiento con Yelp, Amazon reviews y Rotten Tomatoes permite clasificar opiniones en positivas, negativas o neutras dentro de un pipeline de análisis de reputación.
- Extracción de entidades y estructuración de documentos: la exposición a CoNLL-2003 y a recuentos de entidades facilita tareas de reconocimiento y conteo de entidades en textos administrativos o periodísticos.
- Razonamiento de sentido común para asistentes: los datasets Social IQa, CommonsenseQA y WinoGrande lo hacen útil como componente de decisión en asistentes que deben elegir entre varias interpretaciones de una situación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un transformer de 4B parámetros, en FP16 se requieren aproximadamente 9 GB de VRAM solo para los pesos, más memoria para activaciones y KV cache; en cuantización de 8 bits, en torno a 5 GB; en 4 bits, en torno a 3 GB. Estas cifras son estimaciones generales, no datos del autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar ejecución en GPUs de 16 GB o más en FP16 (RTX 4090, A100 40 GB, H100), y en GPUs consumer de 8-12 GB con cuantización, aunque el autor no lo documenta.
- ¿Cabe en GPU consumer? Probablemente sí con cuantización, pero no se han publicado pesos cuantizados ni instrucciones de despliegue.
- Opciones de despliegue: la librería declarada es transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-sx3 | 4.539.265.536 | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Modelo de decisión derivado de Qwen3.5-4B |
| qhoenix/zils-mini-decision-v2 | no disponible | no disponible | Apache-2.0 | Hugging Face | Componente de la mezcla base |
| Charlie320/zils-mini-s1 | no disponible | no disponible | Apache-2.0 | Hugging Face | Componente de la mezcla base |
| Qwen/Qwen3.5-4B | ~4B | no disponible | no disponible | Hugging Face | Modelo base del que deriva |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo tiene 0 descargas y 0 likes en Hugging Face, y fue creado y actualizado el mismo día (8 de noviembre de 2026), por lo que no existe validación externa de su calidad.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real frente a los modelos de los que deriva.
- No se documentan los idiomas soportados; dado el origen de los datasets (mayoritariamente en inglés), es probable que su rendimiento en castellano sea limitado, pero no está confirmado.
- No se documenta la longitud de contexto, lo que impide planificar su uso en tareas con entradas largas.
- Al ser un modelo de decisión entrenado con formato de examen, puede degradarse fuera de ese formato y no debe asumirse como un LLM conversacional general.
- Riesgo de alucinación y de sobreajuste a los datasets de entrenamiento; la interpolación de pesos mitiga pero no elimina el olvido catastrófico.
- La licencia Apache-2.0 permite uso comercial, pero el autor remite a LICENSE y NOTICE para las atribuciones de los componentes upstream, que deben respetarse.
- No se documentan sesgos conocidos; la mezcla de datasets de opinión y noticias puede introducir sesgos de dominio y de estilo.
- No hay garantías de mantenimiento ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-mini-sx3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Componente de la mezcla: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Componente de la mezcla: https://huggingface.co/Charlie320/zils-mini-s1
- Sitio de Zils: https://zils.ai/
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
