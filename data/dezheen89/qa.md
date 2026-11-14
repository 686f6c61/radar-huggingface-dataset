# Dezheen89/QA

## Resumen

Dezheen89/QA es un modelo de respuesta a preguntas extractiva (extractive question answering) obtenido mediante fine-tuning de DistilBERT-base-uncased sobre un dataset de estilo SQuAD. Lo desarrolla el usuario Dezheen89 y se publica en Hugging Face bajo la librería transformers, con pesos en safetensors. Su función es localizar el fragmento de texto (span) dentro de un contexto dado que responde a una pregunta formulada en lenguaje natural, devolviendo la posición de inicio y fin del fragmento junto con una puntuación de confianza.

El modelo parte de DistilBERT, la variante destilada de BERT que reduce el número de capas a la mitad (6 en lugar de 12) y conserva aproximadamente el 97 % del rendimiento de BERT en tareas de comprensión del lenguaje según sus autores originales, con una arquitectura encoder-only de tipo transformer. Con 66.364.418 parámetros y un tamaño de repositorio de 0,3 GB, es un modelo ligero pensado para inferencia rápida y despliegue en CPU o GPU de gama baja.

Es relevante por su perfil de bajo coste computacional para tareas de extracción de respuestas sobre documentos, pero conviene señalar que sus métricas publicadas son modestas (Exact Match 19,5 y F1 28,84 tras el fine-tuning), muy por debajo de los resultados habituales de DistilBERT afinado sobre SQuAD 1.1, lo que sugiere un conjunto de entrenamiento pequeño o de dominio específico. No se dispone de información sobre el dataset exacto, la licencia ni los idiomas soportados más allá de lo indicado por el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, 6 capas) |
| Parámetros totales | 66.364.418 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base DistilBERT admite hasta 512 tokens; no confirmado para este fine-tuning) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el modelo base es distilbert-base-uncased, entrenado principalmente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only derivado de DistilBERT-base-uncased, con 6 capas, atención multi-cabeza estándar y tokenizador WordPiece con vocabulario en minúsculas (uncased). Sobre esta base se añade una cabeza de respuesta a preguntas que proyecta los estados ocultos a dos logits por token (inicio y fin del span), el esquema clásico de los modelos extractivos tipo SQuAD.

El fine-tuning se realizó sobre un dataset de estilo SQuAD según la model card, pero no se especifican el número de ejemplos, la composición del dataset, la duración del entrenamiento, los hiperparámetros ni si hubo aumentación de datos. Las métricas declaradas por el autor son Exact Match 19,5 y F1 28,84 después del ajuste, frente a Exact Match 0,0 y F1 6,68 antes. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional más allá del propio fine-tuning supervisado. Tampoco se indica el proceso de destilación original, que corresponde a los autores de DistilBERT y no a este repositorio.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el fragmento del contexto que responde a la pregunta, con puntuación de confianza.
- Localización de spans: identifica posiciones de inicio y fin del fragmento respuesta dentro del texto de entrada.
- Comprensión lectora en inglés: hereda el vocabulario uncased y el sesgo lingüístico del modelo base, orientado principalmente al inglés.
- Inferencia ligera: al tener 66 millones de parámetros, puede ejecutarse en CPU con latencia baja.
- Integración con el pipeline `question-answering` de transformers.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión, audio ni generación libre de texto.
- Capacidades multilingües: no disponibles; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Extracción de respuestas en bases de conocimiento internas: se puede usar para localizar el fragmento relevante de un artículo o ficha técnica a partir de una pregunta del usuario, siempre que el contexto se proporcione en la misma llamada y en inglés.
- Asistente de consulta sobre documentación técnica: dado un fragmento de manual, el modelo devuelve la frase que responde a preguntas concretas, lo que permite construir un motor de búsqueda semántica ligero sin depender de APIs externas.
- Preprocesado en pipelines de RAG: como componente de re-ranking o de extracción de spans tras la recuperación de documentos, para reducir el texto que se envía a un modelo generativo mayor.
- Clasificación y anotación de datasets: útil para etiquetar automáticamente pares pregunta-respuesta en corpus de entrenamiento o para validar anotaciones humanas.
- Despliegue en entornos con recursos limitados: al caber en CPU y ocupar 0,3 GB, es adecuado para dispositivos edge, contenedores pequeños o funciones serverless con poca memoria.
- Filtrado de FAQs en atención al cliente: con contextos cortos y preguntas frecuentes en inglés, el modelo puede devolver la respuesta exacta de la FAQ sin generar texto nuevo, lo que reduce el riesgo de alucinación.
- Prototipado rápido de sistemas de QA: sirve como línea base para comparar con modelos mayores antes de invertir en infraestructura.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor en la model card son las métricas de evaluación antes y después del fine-tuning:

| Métrica | Antes | Después |
|---|---|---|
| Exact Match | 0,0 | 19,5 |
| F1 | 6,68 | 28,84 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni se especifica el conjunto de evaluación utilizado para obtener estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (66,4 M parámetros × 4 bytes), más overhead de activaciones y del tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,13 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona bien en GTX 1650, RTX 3060, RTX 4090, A100 o H100, aunque el modelo no aprovecha la capacidad de estas últimas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- CPU: es viable en CPU para cargas moderadas; el modelo base DistilBERT es uno de los más rápidos de su familia en CPU.
- Opciones de despliegue: transformers con pipeline `question-answering`, TorchScript, ONNX Runtime, o servidores de inferencia compatibles con transformers. No se confirma soporte nativo en vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este fine-tuning concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dezheen89/QA | 66,4 M | no disponible (base 512) | QA extractiva | no disponible | Hugging Face |
| distilbert-base-uncased-distilled-squad | 66,4 M | 512 tokens | QA extractiva | Apache 2.0 | Hugging Face |
| bert-base-uncased fine-tuned en SQuAD 1.1 | 110 M | 512 tokens | QA extractiva | Apache 2.0 | Hugging Face |
| roberta-base fine-tuned en SQuAD 2.0 | 125 M | 512 tokens | QA extractiva | MIT | Hugging Face |

La comparación con distilbert-base-uncased-distilled-squad es la más directa: misma arquitectura y mismo tamaño, pero el modelo oficial de Hugging Face reporta métricas muy superiores en SQuAD (F1 en torno a 86-87 según su model card pública) frente al F1 de 28,84 de este repositorio. La diferencia sugiere que Dezheen89/QA se entrenó con un dataset mucho más pequeño o de un dominio muy concreto, por lo que no es un sustituto directo del modelo oficial para QA general. No se dispone de datos de benchmarks comparativos publicados por el autor.

## Limitaciones y advertencias

- Métricas bajas: Exact Match 19,5 y F1 28,84 indican un rendimiento limitado; no es adecuado para producción sin una evaluación previa sobre el dominio objetivo.
- Dataset de entrenamiento no documentado: se desconoce el tamaño, la composición y la calidad de los datos de fine-tuning, lo que impide estimar su generalización.
- Riesgo de alucinación bajo en la teoría (es extractivo y devuelve spans del contexto), pero puede seleccionar fragmentos irrelevantes o mal delimitados cuando la respuesta no está en el contexto.
- Idiomas: el modelo base es uncased y entrenado principalmente en inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Contexto: la longitud máxima no está confirmada; si se hereda de DistilBERT, se limita a 512 tokens, insuficiente para documentos largos sin troceado previo.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de integrarlo en un producto.
- Sin soporte de tool calling, agentes ni generación: solo devuelve spans, no texto nuevo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni validación externa.
- Fecha de creación en el repositorio (2026-11-14) posterior a la fecha habitual de consulta; verificar la vigencia de los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dezheen89/QA
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Documentación del pipeline question-answering de transformers: https://huggingface.co/docs/transformers/tasks/question_answering
- Dataset SQuAD: https://rajpurkar.github.io/SQuAD-explorer/
