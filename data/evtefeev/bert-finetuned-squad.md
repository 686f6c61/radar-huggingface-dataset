# evtefeev/bert-finetuned-squad

## Resumen

`evtefeev/bert-finetuned-squad` es un ajuste fino del modelo `google-bert/bert-base-cased` para la tarea de respuesta a preguntas extractiva (question answering). Lo publica el usuario evtefeev en HuggingFace y sigue el formato de las model cards autogeneradas por el `Trainer` de la librería Transformers, lo que indica que se trata de un experimento de ajuste fino más que de un modelo con documentación técnica elaborada.

El modelo hereda la arquitectura BERT base de Google: un transformer encoder de 12 capas, 12 cabezas de atención y dimensión oculta de 768, con 107.721.218 parámetros totales según los pesos en safetensors. El nombre sugiere un ajuste sobre el dataset SQuAD, aunque la model card declara explícitamente que el dataset de entrenamiento es "unknown" (desconocido) y no aporta métricas de evaluación.

Su relevancia práctica es limitada: se trata de un modelo de 107 millones de parámetros con licencia Apache 2.0, útil como referencia educativa o como punto de partida para tareas de QA extractiva en inglés, pero sin benchmarks publicados ni documentación que respalde su calidad. Es un ejemplo típico de ajuste fino de BERT base con hiperparámetros estándar (learning rate 2e-5, 3 épocas, batch 8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), 12 capas, 12 cabezas de atencion, hidden size 768 |
| Parametros totales | 107.721.218 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT base soporta tipicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion posible via herramientas externas) |
| Idiomas soportados | no disponible (el modelo base bert-base-cased es predominantemente ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `google-bert/bert-base-cased`, un transformer encoder bidireccional con 12 capas, 12 cabezas de atencion y 768 dimensiones ocultas. La cabeza de question answering es la estándar de BERT para QA extractiva: dos proyecciones lineales sobre la salida del encoder que predicen las posiciones de inicio y fin de la respuesta dentro del contexto.

Los hiperparámetros de entrenamiento declarados en la model card son: learning rate 2e-5, train batch size 8, eval batch size 8, semilla 42, optimizador AdamW (fused) con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal, 3 épocas y precisión mixta nativa (AMP). El dataset de entrenamiento aparece como "unknown" en la model card, aunque el nombre del modelo sugiere SQuAD. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelo). Las versiones de framework usadas fueron Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el fragmento del contexto que responde a la pregunta.
- Comprensión lectora en inglés (heredada del modelo base bert-base-cased).
- Clasificación de tokens y extracción de spans (la cabeza de QA es un caso particular).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión, audio ni generación de texto libre.
- Capacidades multilingües: no documentadas; el modelo base es principalmente inglés.
- No es un modelo generativo: no produce texto nuevo, solo extrae spans del contexto proporcionado.

## Casos de uso

- Extracción de respuestas en documentación técnica: dado un manual o una base de conocimiento en inglés, el modelo localiza el fragmento que responde a una consulta concreta. Adecuado por su tamano reducido y su naturaleza extractiva, que evita alucinaciones al no generar texto nuevo.
- Sistemas de FAQ automatizadas: se puede integrar en un pipeline de recuperación (retrieval) más QA para responder preguntas frecuentes a partir de un corpus fijo, usando el contexto recuperado como entrada.
- Anonimización y extracción de entidades en formularios: la cabeza de QA puede reutilizarse para localizar campos concretos (fechas, nombres, importes) dentro de textos estructurados en inglés.
- Prototipado rápido de pipelines de QA: con 107 M de parámetros y licencia Apache 2.0, sirve como baseline en experimentos académicos o pruebas de concepto antes de escalar a modelos mayores.
- Evaluación comparativa de ajustes finos: útil como referencia en estudios sobre hiperparámetros de fine-tuning de BERT para QA, dado que la model card documenta la configuración exacta usada.
- Indexación semántica de soporte técnico: combinado con un retriever, puede extraer la frase relevante de tickets o conversaciones históricas en inglés para sugerir respuestas a agentes humanos.
- Filtrado de contenido en moderación: la extracción de spans permite señalar fragmentos concretos de un texto que cumplen un criterio definido por la pregunta, aunque requiere validación adicional por la falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un `model-index` con la lista de resultados vacía (`results: []`), por lo que no hay métricas de exact match ni F1 sobre SQuAD ni sobre ningún otro conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 430 MB solo para pesos (107,7 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB en fp32 y menos de 500 MB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090, RTX 2080 o incluso GPUs de gama baja como GTX 1650 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (PyTorch), vLLM no aplica (no es generativo), TGI no aplica, llama.cpp no aplica directamente (no hay GGUF oficial), ONNX Runtime y TorchScript son opciones viables para producción. También se puede servir con FastAPI o con la Inference API de HuggingFace (el tag `endpoints_compatible` está presente).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamano del modelo, se espera latencia de milisegundos por consulta en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks QA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evtefeev/bert-finetuned-squad | 107,7 M | no disponible (tipico 512) | no publicados | apache-2.0 | HuggingFace |
| google-bert/bert-base-cased | 108 M | 512 tokens | no es modelo QA por defecto | apache-2.0 | HuggingFace |
| deepset/bert-base-cased-squad2 | 108 M | 512 tokens | F1 ~75-77 en SQuAD v2 (referencia pública) | apache-2.0 | HuggingFace |
| distilbert-base-cased-distilled-squad | 65 M | 512 tokens | F1 ~79 en SQuAD v1 (referencia pública) | apache-2.0 | HuggingFace |

La comparativa se basa en modelos públicos de la misma familia y tamano; los datos de los modelos alternativos son referencias públicas conocidas y no proceden de la información proporcionada para este modelo. El modelo de evtefeev no aporta métricas propias que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad en QA; no se debe asumir un rendimiento equivalente al de otros ajustes de BERT sobre SQuAD.
- Dataset de entrenamiento desconocido: la model card declara "unknown dataset", lo que impide evaluar la cobertura, el sesgo y la distribución de los datos usados.
- Modelo extractivo, no generativo: solo devuelve fragmentos del contexto; si la respuesta no está literalmente en el texto, no la producirá.
- Idiomas: no documentados; el modelo base es principalmente inglés, por lo que el rendimiento en castellano u otros idiomas es probablemente bajo.
- Longitud de contexto: no confirmada, pero limitada por la arquitectura BERT base (típicamente 512 tokens); contextos más largos requieren truncado o segmentación.
- Riesgo de sesgos heredados del corpus de preentrenamiento de bert-base-cased (textos web en inglés), no evaluados ni mitigados en este ajuste.
- Riesgo de alucinación bajo en sentido estricto (es extractivo), pero puede devolver spans incorrectos o vacíos cuando la pregunta no tiene respuesta en el contexto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base y del dataset de ajuste (no documentado).
- Modelo con 41 descargas y 0 likes: sin validación por parte de la comunidad; no recomendado como componente crítico en producción sin una evaluación propia.
- La model card está autogenerada y contiene marcadores "More information needed" en secciones clave (descripción, usos previstos, datos de entrenamiento), lo que indica falta de revisión por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/evtefeev/bert-finetuned-squad
- Modelo base: https://huggingface.co/bert-base-cased
- Modelo base (ID actual): https://huggingface.co/google-bert/bert-base-cased
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Dataset SQuAD: https://rajpurkar.github.io/SQuAD-explorer/
- Documentación de Transformers para question answering: https://huggingface.co/docs/transformers/tasks/question_answering
