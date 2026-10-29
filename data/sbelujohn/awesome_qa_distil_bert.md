# sbelujohn/awesome_qa_distil_bert

## Resumen

`awesome_qa_distil_bert` es un ajuste fino de `distilbert-base-uncased` publicado por el usuario sbelujohn en Hugging Face, orientado a la tarea de *question answering* extractivo (pipeline `question-answering` de Transformers). El modelo parte de la arquitectura DistilBERT, una versión destilada de BERT desarrollada por Hugging Face que reduce el tamaño de 110 M a 66 M de parámetros, corre aproximadamente un 60 % más rápido y conserva en torno al 97 % del rendimiento de BERT en GLUE. El checkpoint contiene 66.364.418 parámetros reales según los pesos en safetensors.

La relevancia de este modelo es la de un artefacto ligero y desplegable en CPU: con 66 M de parámetros puede ejecutarse en entornos con recursos muy limitados, lo que lo hace útil como baseline de QA extractivo o como componente de pipelines de recuperación y extracción de información. Sin embargo, la model card es la generada automáticamente por el `Trainer` de Hugging Face y no documenta el conjunto de datos de entrenamiento, los usos previstos ni resultados de evaluación.

Se trata, por tanto, de un modelo experimental y sin validación publicada: no declara benchmarks, no especifica idioma ni dominio, y el repositorio no tiene descargas ni interacciones en el momento de la consulta. Su licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace recomendable validarlo con un conjunto propio antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT), 6 capas, 768 dimensiones ocultas, 12 cabezas de atención |
| Parámetros totales | 66.364.418 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite estándar de `distilbert-base-uncased`; no declarado en la model card) |
| Tipos de cuantización | No se han publicado variantes cuantizadas; solo pesos safetensors. Compatible con cuantización dinámica INT8 mediante ONNX Runtime o PyTorch, no verificada por el autor |
| Idiomas soportados | No declarados en la model card; el modelo base `distilbert-base-uncased` está entrenado principalmente en inglés y usa vocabulario sin distinción de mayúsculas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,6 GB, compatible con `transformers`) |
| Pipeline | `question-answering` (QA extractivo, estilo SQuAD) |
| Modelo base | `distilbert/distilbert-base-uncased` |
| Biblioteca | Transformers 5.20.2 / PyTorch 2.11.0+cu130 |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder de 6 capas obtenido por destilación de conocimiento de `bert-base-uncased` (el modelo profesor). Frente a BERT base, elimina las capas de enmascaramiento de tokens y de predicción de siguiente frase, reduce el número de capas y se entrena con una combinación de pérdida de destilación sobre las distribuciones de salida del profesor, pérdida de modelado de lenguaje enmascarado y pérdida de coherencia coseno entre estados ocultos. El resultado son 66 M de parámetros, un 40 % menos que BERT base, con una velocidad de inferencia aproximadamente un 60 % superior.

El ajuste fino de este checkpoint se realizó con los hiperparámetros registrados por el `Trainer`: learning rate 2e-5, batch de entrenamiento 16, batch de evaluación 8, 3 épocas, optimizador AdamW (`ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-8), scheduler lineal y semilla 42. La model card indica explícitamente que el conjunto de datos es desconocido ("unknown dataset") y el apartado de resultados de entrenamiento está vacío, por lo que no hay información sobre composición del corpus, número de tokens, dominio, idioma de los datos ni si se aplicó algún tipo de validación o calibración posterior.

No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, adaptadores u otras). El modelo es una cabeza de QA extractiva sobre el encoder preentrenado, sin cambios arquitectónicos declarados.

## Capacidades

- Question answering extractivo: dado un contexto y una pregunta, devuelve el fragmento (span) del contexto que responde a la pregunta, junto con una puntuación de confianza.
- Localización de respuestas literales en documentos: adecuado para preguntas cuya respuesta aparece textualmente en el contexto suministrado.
- Procesamiento por lotes de pares contexto-pregunta mediante el pipeline `question-answering` de Transformers.
- Extracción de información estructurada a partir de texto libre formulando preguntas concretas (fechas, nombres, importes, identificadores).
- Base para ajuste fino adicional en dominios específicos, al ser un encoder pequeño y con licencia permisiva.
- No soporta generación de texto libre, tool calling, function calling, razonamiento multi-paso ni uso como agente.
- No dispone de modo de razonamiento (*thinking*), visión, audio ni capacidades multimodales.
- Capacidad multilingüe no disponible: el vocabulario del modelo base es uncased en inglés y no se declaran otros idiomas.

## Casos de uso

- Preguntas frecuentes sobre documentación interna: se indexa el manual o la base de conocimiento, se recuperan los fragmentos relevantes y se formula cada pregunta del usuario contra el contexto recuperado; el modelo devuelve el span exacto que contiene la respuesta, lo que permite citar la fuente sin riesgo de paráfrasis inventada.
- Extracción de campos en contratos y facturas: en lugar de un modelo generativo, se plantean preguntas del tipo "¿cuál es la fecha de vencimiento?" sobre el texto del documento y se recoge el span devuelto para poblar un formulario o una base de datos.
- Atención al cliente de primer nivel con respuestas ancladas a un texto: el modelo solo puede responder con fragmentos presentes en el contexto, lo que reduce el riesgo de alucinación en comparación con un modelo generativo, siempre que exista un paso previo de recuperación documental.
- Componente de un pipeline RAG ligero: uso como extractor de respuestas sobre los pasajes recuperados por un buscador (BM25 o embeddings), en entornos donde no es viable desplegar un modelo generativo por coste de GPU.
- Procesamiento masivo en CPU: al tener 66 M de parámetros, puede ejecutarse en lotes sobre grandes volúmenes de documentos en servidores sin GPU, por ejemplo para enriquecer registros con respuestas a un conjunto fijo de preguntas.
- Enmascarado y etiquetado de datos sensibles: extracción de identificadores (IBAN, DNI, nombres de persona) mediante preguntas dirigidas sobre el texto, como paso previo a la anonimización.
- Baseline académico y experimental: punto de partida para comparar técnicas de QA extractivo o para validar un conjunto de evaluación propio antes de invertir en modelos mayores.
- Asistente embebido en formularios web: dado un texto pegado por el usuario (condiciones, cláusulas, especificaciones), responder preguntas puntuales sobre él con latencia baja y sin salida a Internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card declara una entrada para `awesome_qa_distil_bert` con la lista de resultados vacía, y el apartado de resultados de entrenamiento no contiene métricas (ni Exact Match ni F1 sobre SQuAD u otro conjunto).

| Benchmark | Resultado de este modelo | Referencia del modelo base (dato de la documentación de DistilBERT) |
|---|---|---|
| MMLU | No disponible | No disponible |
| HumanEval | No disponible | No disponible |
| GSM8K | No disponible | No disponible |
| SQuAD v1.1 (EM/F1) | No disponible | No disponible para este ajuste |
| GLUE | No disponible | Retiene aproximadamente el 97 % del rendimiento de BERT según la documentación de DistilBERT |

Los datos de la fila de GLUE corresponden al modelo base destilado, no a este ajuste fino, y se incluyen solo como contexto; no deben interpretarse como una evaluación de `awesome_qa_distil_bert`.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 265 MB en FP32, 133 MB en FP16 y 66 MB en INT8, calculados a partir de los 66.364.418 parámetros (estimación teórica de pesos, sin overhead de activaciones ni del runtime).
- El repositorio ocupa 1,6 GB, muy por encima del tamaño de los pesos en FP32 (aproximadamente 265 MB), lo que sugiere la presencia de archivos adicionales (por ejemplo, checkpoints intermedios u optimizer states); conviene revisar los archivos antes de desplegar.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente (GTX 1650, RTX 3060, T4, L4). No requiere A100 ni H100; el modelo está pensado para entornos de bajos recursos.
- Cabe holgadamente en GPU de consumo e incluso en CPU: es viable la inferencia en portátiles, contenedores sin GPU y dispositivos de borde, siempre que se respete el límite de 512 tokens por contexto.
- Opciones de despliegue: pipeline `question-answering` de Transformers, exportación a ONNX Runtime o TorchScript, servicio HTTP con FastAPI o Triton Inference Server. No es compatible con llama.cpp, Ollama ni formato GGUF al no ser un modelo generativo. El soporte en vLLM no está documentado para cabezas de QA.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `awesome_qa_distil_bert` (este modelo) | 66,36 M | 512 tokens | QA extractivo (ajustado) | Apache 2.0 | Hugging Face, sin descargas ni evaluación publicada |
| `distilbert-base-uncased` | 66 M | 512 tokens | Encoder preentrenado (MLM), requiere ajuste para QA | Apache 2.0 | Hugging Face, ampliamente utilizado |
| `bert-base-uncased` | 110 M | 512 tokens | Encoder preentrenado | Apache 2.0 | Hugging Face, referencia estándar |
| `roberta-base` | 125 M | 512 tokens | Encoder preentrenado | MIT | Hugging Face, habitual en QA extractivo |
| `all-MiniLM-L6-v2` | 22 M | 512 tokens | Embeddings de frase / búsqueda semántica | Apache 2.0 | Hugging Face |

En rendimiento no es posible establecer comparación: este checkpoint no publica métricas de QA, mientras que los modelos base de la tabla cuentan con evaluaciones públicas en GLUE y SQuAD. La ventaja diferencial de este modelo frente a los anteriores es su tamaño reducido y su licencia permisiva; su desventaja es la falta total de documentación y validación.

## Limitaciones y advertencias

- Modelo exclusivamente extractivo: no genera respuestas. Si la respuesta no aparece literalmente en el contexto, devolverá un span arbitrario con una puntuación de confianza que puede ser engañosa.
- Conjunto de datos de entrenamiento desconocido: la model card indica "unknown dataset" y no hay partición de validación ni métricas, por lo que se desconoce el dominio, el idioma y la calidad del ajuste.
- Sin benchmarks publicados: no hay evidencia de Exact Match ni F1 en SQuAD u otro conjunto; cualquier afirmación de rendimiento sería especulativa.
- Límite de 512 tokens por contexto: documentos más largos deben trocearse, con el riesgo de perder la respuesta en la frontera entre fragmentos.
- Idioma: el vocabulario uncased está orientado al inglés; el rendimiento en castellano no está evaluado y previsiblemente será deficiente por tokenización.
- El preprocesado uncased elimina la distinción entre mayúsculas y minúsculas, lo que puede afectar a la extracción de entidades donde el caso es informativo.
- Sesgos heredados: al derivar de `distilbert-base-uncased`, entrenado con Wikipedia y BooksCorpus, puede reproducir sesgos de género, nacionalidad u ocupación presentes en esos corpus; no se ha realizado ninguna evaluación de sesgo sobre este ajuste.
- Riesgo de alucinación bajo en el sentido generativo, pero riesgo de respuesta incorrecta alto: el modelo siempre devuelve un span, aunque no exista una respuesta válida en el contexto.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con la obligación de conservar el aviso de copyright y la licencia, e incluir el archivo NOTICE si existe. No hay cláusulas de uso aceptable adicionales.
- Repositorio sin tracción: 0 descargas y 0 interacciones en el momento de la consulta; no hay evidencia de uso en producción ni de revisión por terceros.
- El tamaño del repositorio (1,6 GB) no coincide con el de los pesos declarados, por lo que conviene auditar los archivos antes de descargarlo en un entorno de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sbelujohn/awesome_qa_distil_bert
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Repositorio relacionado del mismo autor: https://huggingface.co/sbelujohn/awesome_trained_distil_bert
- Implementación de referencia de DistilBERT para QA: https://github.com/askaydevs/distillbert-qa
- Artículo divulgativo sobre DistilBERT: https://www.geeksforgeeks.org/nlp/distilbert-in-natural-language-processing/
- Introducción a DistilBERT: https://www.geeksforgeeks.org/nlp/introduction-to-distilbert-model/
