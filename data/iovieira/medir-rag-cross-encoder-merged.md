# iovieira/medir-rag-cross-encoder-merged

## Resumen

medir-rag-cross-encoder-merged es un modelo de re-ranking (cross-encoder) para recuperación de información biomédica, desarrollado por el usuario iovieira en el marco del proyecto MedIR-RAG de la Universidad de Évora (asignatura "Recuperação de Informação em Bases de Texto"). Se construye a partir de `cross-encoder/ms-marco-MiniLM-L6-v2`, un transformer BERT de tipo MiniLM, mediante la fusión de un adaptador LoRA entrenado sobre pares pregunta/pasaje del corpus BioASQ. El resultado es un modelo completo de 22,7 millones de parámetros que puntúa la relevancia de un pasaje respecto a una consulta.

El modelo resuelve la segunda etapa de un pipeline RAG: dado un conjunto de candidatos recuperados por un sistema híbrido (léxico + denso), reordena los 50 primeros resultados para mejorar la precisión del contexto que se entrega al generador. Su relevancia radica en que está especializado en dominio biomédico, donde los cross-encoders genéricos entrenados en MS MARCO rinden peor por la terminología técnica y la estructura de las preguntas clínicas.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, publicado sin model card extendida ni licencia declarada. Su utilidad práctica depende de integrarlo como componente de re-ranking en un sistema de búsqueda documental médica, no como modelo generativo autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6), clasificación de secuencias con cabeza de 1 etiqueta |
| Parámetros totales | 22.713.601 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el ejemplo de uso trunca a 320 tokens (`truncation="only_second"`, `max_length=320`); el modelo base MiniLM admite hasta 512 tokens |
| Tipos de cuantización | no disponible (pesos safetensors en fp32; cuantización no documentada por el autor) |
| Idiomas soportados | no disponible (el corpus de entrenamiento BioASQ es mayoritariamente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | cross-encoder/ms-marco-MiniLM-L6-v2 |
| Tarea (pipeline) | text-classification (scoring de pares pregunta-pasaje) |

## Arquitectura y entrenamiento

La arquitectura es la del cross-encoder MiniLM-L6: un encoder transformer de 6 capas con atención completa que procesa conjuntamente la consulta y el pasaje como una única secuencia de entrada (par sentence pair), y produce un logit de relevancia a través de una cabeza de clasificación. A diferencia de los bi-encoders, no genera embeddings independientes, sino que modela la interacción cruzada entre pregunta y documento en cada capa de atención, lo que mejora la precisión a costa de mayor coste computacional por par evaluado.

El entrenamiento parte del checkpoint `cross-encoder/ms-marco-MiniLM-L6-v2` y aplica un ajuste fino con LoRA sobre pares pregunta/pasaje de BioASQ; posteriormente el adaptador se fusiona en los pesos base para producir el modelo completo publicado. El autor referencia el script `train_cross_encoder.py` como código de entrenamiento, pero no detalla el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de hiperparámetros ni si se empleó alguna función de pérdida específica (por ejemplo, contrastiva o de entropía cruzada binaria). No se documenta RLHF, DPO ni técnicas de decodificación especulativa, algo esperable en un modelo de scoring y no generativo.

## Capacidades

- Puntuación de relevancia pregunta-pasaje: devuelve un logit por par, apto para ordenar candidatos en un pipeline de recuperación.
- Re-ranking en dos etapas: pensado para reordenar los 50 primeros resultados de un sistema híbrido (léxico + denso) sobre el corpus completo.
- Especialización en dominio biomédico: ajustado sobre BioASQ, con vocabulario y estructura de preguntas clínicas.
- Procesamiento de pares con truncado selectivo: el ejemplo de uso trunca solo el pasaje (`only_second`), preservando íntegra la consulta.
- Integración con la librería transformers: carga mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatibilidad declarada con text-embeddings-inference y endpoints (tags `text-embeddings-inference` y `endpoints_compatible`).
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es un clasificador de pares, no un modelo generativo.

## Casos de uso

- Re-ranking en un sistema RAG biomédico: recuperar 50 candidatos con un retriever híbrido y reordenarlos con este cross-encoder antes de pasarlos al generador; el autor reporta NDCG@5 de 0,5437 y MRR@10 de 0,7467 sobre 279 preguntas de test de BioASQ.
- Búsqueda de literatura científica: puntuar pasajes de artículos frente a preguntas de investigación para priorizar los fragmentos más relevantes en una interfaz de búsqueda documental.
- Asistencia a la decisión clínica basada en evidencia: filtrar fragmentos de guías y publicaciones antes de que un LLM redacte una respuesta, reduciendo el contexto irrelevante y el riesgo de alucinación.
- Construcción de datasets de evaluación de recuperación: usar las puntuaciones del modelo para etiquetar pares pregunta-pasaje y medir la calidad de distintos retrievers en el dominio médico.
- Filtrado de contexto en pipelines de question answering: descartar pasajes con puntuación baja antes de la etapa de generación, reduciendo el consumo de tokens y la latencia del LLM.
- Prototipado académico de sistemas de recuperación: su tamaño reducido (22,7 M de parámetros, 0,1 GB) permite desplegarlo en entornos docentes y de investigación con recursos limitados.
- Deduplicación y ordenación de resultados en buscadores internos de documentación médica, aplicando el score del cross-encoder como criterio de orden final.

## Benchmarks y rendimiento

El autor publica dos métricas de recuperación sobre el conjunto de test de BioASQ (279 preguntas), reordenando los 50 primeros resultados del sistema híbrido sobre el corpus completo:

| Métrica | Valor |
|---|---|
| NDCG@5 | 0,5437 |
| MRR@10 | 0,7467 |

No se han publicado resultados comparativos con otros cross-encoders (MMLU, HumanEval, GSM8K u otras métricas estándar no aplican a este tipo de modelo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,7 M de parámetros, ~91 MB de pesos); en fp16, aproximadamente 45 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es viable en CPU para volúmenes moderados.
- Cabe en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090, así como en Apple Silicon y en CPU.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (soporte declarado en los tags), y exportación a ONNX o cuantización a int8 para acelerar la inferencia en CPU.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de un modelo de 6 capas, el coste por par es bajo, pero el throughput real depende del hardware y del número de pares a puntuar (50 por consulta en el escenario descrito).
- Consideración de escalado: al ser un cross-encoder, el coste crece linealmente con el número de candidatos; reordenar 50 pasajes implica 50 pasadas forward por consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iovieira/medir-rag-cross-encoder-merged | 22,7 M | hasta 512 tokens (base); uso a 320 | Biomédico (BioASQ) | no disponible | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L6-v2 (base) | ~22,7 M | 512 tokens | General (MS MARCO) | no disponible en la información | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L12-v2 | no disponible | 512 tokens | General (MS MARCO) | no disponible en la información | Hugging Face |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada; el autor solo reporta métricas absolutas sobre BioASQ, sin línea base del modelo original ni de alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si el uso comercial está permitido; debe contactarse con el autor antes de integrarlo en producción.
- Idiomas no documentados: el entrenamiento sobre BioASQ sugiere predominio del inglés; el rendimiento en castellano u otras lenguas no está evaluado.
- Riesgo de sobreajuste al dominio: al estar ajustado sobre un corpus específico (BioASQ), su generalización a otras áreas médicas o a dominios no biomédicos es incierta.
- Sin model card detallada: no se documentan sesgos, composición del dataset, hiperparámetros ni proceso de validación, lo que dificulta la auditoría.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sus puntuaciones pueden ser erróneas en pasajes ambiguos o con negaciones clínicas.
- Contexto limitado: el truncado a 320 tokens en el ejemplo de uso puede descartar información relevante en pasajes largos.
- Modelo de nicho con cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación independiente.
- No apto para generación: es un clasificador de pares; no debe emplearse como LLM ni como chatbot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iovieira/medir-rag-cross-encoder-merged
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Corpus BioASQ: http://bioasq.org/
- Proyecto MedIR-RAG (Universidad de Évora): no disponible en la información proporcionada
- Script de entrenamiento `train_cross_encoder.py`: no disponible como enlace público en la información proporcionada
