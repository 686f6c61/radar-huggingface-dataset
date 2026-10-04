# Driw0x/my_awesome_qa_model

## Resumen

my_awesome_qa_model es un modelo de question answering extractivo publicado por el usuario Driw0x en HuggingFace. Se trata de un fine-tuning de distilbert/distilbert-base-uncased, es decir, un encoder Transformer de tipo BERT destilado, con 66.364.418 parámetros totales y un repositorio de 0,5 GB en formato safetensors. El modelo resuelve la tarea clásica de extracción de respuestas: dado un contexto y una pregunta, devuelve el fragmento de texto (span) que contiene la respuesta, sin generar texto libre.

El interés de la ficha es limitado pero ilustrativo: se trata de un artefacto de entrenamiento (etiqueta generated_from_trainer) con una model card autogenerada por el Trainer de HuggingFace, sin descripción de dataset, sin métricas de evaluación publicadas y sin resultados en el model-index. La única métrica declarada es una pérdida de validación de 1,7391 tras 3 epochs. No tiene descargas ni likes en el momento de la consulta.

Por su tamaño (66M de parámetros) y su arquitectura encoder-only, es un modelo que cabe en CPU y en cualquier GPU consumer, con una ventana de contexto de 512 tokens heredada del modelo base. Es relevante únicamente como ejemplo de pipeline de fine-tuning para QA extractivo o como baseline académico, no como modelo listo para producción sin una evaluación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT, destilado (DistilBERT): 6 capas, 768 de dimensión oculta, 12 cabezas de atención, vocabulario WordPiece de 30.522 tokens. Especificaciones del modelo base, no declaradas en la model card |
| Parámetros totales | 66.364.418 (dato real de los pesos safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (max_position_embeddings de distilbert-base-uncased); no declarado en la model card |
| Tipos de cuantización | no disponibles (el repositorio solo publica safetensors; no se ofrecen variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible en la información del modelo; el modelo base distilbert-base-uncased se entrenó sobre corpus en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder Transformer con 6 capas (la mitad que BERT-base), 768 de dimensión oculta y 12 cabezas de atención, obtenido mediante destilación del conocimiento de bert-base-uncased sobre el mismo corpus que el original (Wikipedia en inglés y Toronto Book Corpus). Sobre ese backbone se añade una cabeza de question answering que predice, para cada token del contexto, las probabilidades de ser inicio y fin del span de respuesta. La model card no documenta la arquitectura ni el dataset de fine-tuning: indica explícitamente "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento.

Los hiperparámetros de entrenamiento sí están registrados, generados automáticamente por el Trainer: learning rate 2e-05, batch de entrenamiento y de evaluación de 16, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 3 epochs, con un total de 750 pasos. Con batch 16, esos 750 pasos implican aproximadamente 4.000 ejemplos por epoch y unas 12.000 pasadas de ejemplo en total, aunque el dataset utilizado no se especifica. No hay mención a RLHF, DPO ni a ninguna técnica de alineación, algo coherente con un modelo extractivo. Las versiones de framework son Transformers 5.17.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2.

Evolución de la pérdida declarada por el autor:

| Training loss | Epoch | Step | Validation loss |
|---|---|---|---|
| No log | 1,0 | 250 | 2,5810 |
| 2,9258 | 2,0 | 500 | 1,8591 |
| 2,9258 | 3,0 | 750 | 1,7391 |

## Capacidades

- Question answering extractivo: recibe un contexto y una pregunta y devuelve el span del contexto que responde a la pregunta, junto con una puntuación de confianza.
- Funcionamiento monolingüe en la práctica: el modelo base está entrenado sobre corpus en inglés, por lo que el rendimiento fuera del inglés no está documentado ni es esperable.
- Entrada limitada a 512 tokens: contextos más largos deben truncarse o segmentarse antes de la inferencia.
- No genera texto libre: es un modelo encoder-only, sin decoder, por lo que no puede producir respuestas abstractivas ni resúmenes.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni multimodalidad.
- Sin modo de razonamiento (thinking mode) ni decodificación especulativa.
- No hay datos publicados sobre robustez ante preguntas sin respuesta en el contexto (comportamiento SQuAD 2.0).

## Casos de uso

- Respuesta sobre documentación técnica en un pipeline RAG: se recuperan con un buscador los pasajes relevantes de la documentación y se pasa cada pasaje como contexto al modelo junto con la pregunta del usuario; el modelo devuelve el fragmento exacto que responde, lo que facilita citar la fuente.
- Atención al cliente sobre una base de preguntas frecuentes: el modelo localiza la frase de la FAQ que responde a la consulta, con la ventaja de que la respuesta es literal y verificable, sin riesgo de invención de contenido.
- Extracción de datos de contratos y pólizas: plantillas de preguntas del tipo "¿cuál es el plazo de preaviso?" sobre fragmentos de contrato de menos de 512 tokens permiten extraer cláusulas concretas para su posterior revisión humana.
- Anotación asistida de datasets de QA: como preanotador en herramientas de etiquetado, proponiendo spans candidatos que un anotador humano valida o corrige, reduciendo el coste de construir corpus de question answering.
- Baseline académico y docente: sirve como referencia de partida en experimentos de QA extractivo, ya que reproduce el flujo estándar de fine-tuning de HuggingFace con hiperparámetros documentados y reproducibles.
- Enrutado y desambiguación en buscadores internos: dado un pasaje corto, determinar si contiene la respuesta a la consulta del usuario y, en caso afirmativo, devolver el fragmento, como paso previo a un reranking o a una búsqueda adicional.
- Procesamiento por lotes en CPU: al tratarse de 66M de parámetros, permite procesar grandes volúmenes de pares pregunta-contexto en servidores sin GPU, por ejemplo en tareas nocturnas de extracción sobre un corpus documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index del repositorio contiene una entrada con la lista de resultados vacía. El único dato numérico declarado por el autor es la pérdida de validación final de 1,7391, sin métricas de Exact Match ni de F1 sobre SQuAD u otro conjunto de evaluación.

## Requisitos de hardware

- Huella de memoria de los pesos: aproximadamente 265 MB en fp32 y 133 MB en fp16, a partir de los 66.364.418 parámetros.
- VRAM estimada para inferencia: menos de 1 GB en fp32 con lotes pequeños, incluyendo activaciones y overhead del runtime.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090 y modelos inferiores, así como en iGPU con memoria compartida.
- Ejecución en CPU viable: es un modelo de 6 capas, por lo que la inferencia en CPU es práctica para volúmenes moderados.
- GPU de datacenter (A100, H100) no necesarias; solo tendrían sentido para lotes muy grandes o para reentrenamiento.
- Opciones de despliegue: pipeline de question-answering de Transformers, exportación a ONNX Runtime u OpenVINO mediante Optimum, TorchScript y servicio HTTP propio con FastAPI.
- No recomendado en vLLM, TGI, llama.cpp u Ollama: son runtimes orientados a modelos generativos y no cubren la tarea extractiva de span prediction.
- Latencia y throughput: no se publican mediciones en la información disponible.
- Para reentrenamiento o fine-tuning adicional, una única GPU consumer es suficiente dado el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Driw0x/my_awesome_qa_model | 66.364.418 | 512 tokens (heredado del base) | QA extractivo | apache-2.0 | no disponible (solo loss de validación 1,7391) |
| distilbert-base-uncased-finetuned-squad | ~66M | 512 tokens | QA extractivo | apache-2.0 | métricas no verificadas en esta ficha |
| bert-base-uncased ajustado a SQuAD | ~110M | 512 tokens | QA extractivo | apache-2.0 | métricas no verificadas en esta ficha |
| MiniLM-L6 ajustado a QA extractivo | ~22M | 512 tokens | QA extractivo | apache-2.0 (según variante) | métricas no verificadas en esta ficha |

La comparación con alternativas de la misma categoría se limita a parámetros, contexto, licencia y disponibilidad, porque no hay resultados de benchmarks publicados para este modelo que permitan contrastar Exact Match o F1 con los otros. La diferencia práctica más relevante frente a distilbert-base-uncased-finetuned-squad es que este último es un artefacto ampliamente descargado y evaluado, mientras que my_awesome_qa_model no tiene descargas ni métricas publicadas.

## Limitaciones y advertencias

- Model card autogenerada y sin completar: las secciones de descripción, usos previstos y datos de entrenamiento indican "More information needed", por lo que se desconoce el dataset de fine-tuning y su dominio.
- Sin métricas de calidad: no hay Exact Match ni F1 publicados, solo una pérdida de validación de 1,7391, un valor alto para un ajuste típico de QA extractivo sobre SQuAD, lo que sugiere un ajuste limitado.
- Riesgo de respuestas incorrectas silenciosas: en QA extractivo el modelo nunca devuelve "no hay respuesta" de forma fiable; siempre selecciona un span del contexto, aunque la pregunta no tenga respuesta en él.
- Sesgos heredados del modelo base distilbert-base-uncased, entrenado sobre Wikipedia en inglés y Toronto Book Corpus, con los sesgos de género, origen y perspectiva presentes en esos corpus.
- Limitación idiomática: el modelo base es monolingüe en inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Límite estricto de 512 tokens de contexto, incluyendo la pregunta; los documentos largos requieren segmentación previa, con la consiguiente pérdida de contexto entre fragmentos.
- Sin soporte nativo de tool calling ni de flujos de agente, por lo que no puede integrarse directamente en arquitecturas de agentes sin un orquestador externo.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- Advertencia para producción: al ser un artefacto de entrenamiento con 0 descargas y 0 likes, no ha sido validado por la comunidad; cualquier despliegue debería ir precedido de una evaluación propia sobre datos representativos del dominio objetivo.
- Repositorio sin variantes cuantizadas ni exportaciones ONNX listas para usar, por lo que la optimización de despliegue requiere trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Driw0x/my_awesome_qa_model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
