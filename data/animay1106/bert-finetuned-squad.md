# animay1106/bert-finetuned-squad

## Resumen

bert-finetuned-squad es un ajuste fino de google-bert/bert-base-cased para la tarea de question answering extractivo (respuesta a preguntas sobre un contexto dado), publicado por el usuario animay1106 en HuggingFace. El modelo parte de la arquitectura BERT base en su variante cased (sensible a mayúsculas), con 107.721.218 parámetros totales, y ha sido entrenado con la librería Transformers mediante el Trainer, presumiblemente sobre el dataset SQuAD (el nombre del modelo lo sugiere, aunque la model card no lo confirma). Se trata de un modelo encoder-only clásico, no generativo, especializado en localizar el span de respuesta dentro de un pasaje de texto.

Su relevancia es limitada en el panorama actual de modelos generativos grandes: es un checkpoint pequeño, con muy pocas descargas (26) y sin métricas de evaluación publicadas. Resulta útil como ejemplo de ajuste fino de BERT para extracción de respuestas, como baseline ligero en pipelines de QA extractivo o como material didáctico, pero no como modelo de producción de alto rendimiento. La model card está generada automáticamente y carece de información sobre el dataset exacto, la evaluación o los usos previstos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base, variante cased) |
| Parametros totales | 107.721.218 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de bert-base-cased; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | no disponible (bert-base-cased está entrenado principalmente en inglés, pero el autor no lo declara) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de bert-base-cased, un transformer encoder-only de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con aproximadamente 110 millones de parámetros. La tarea de question answering extractivo se implementa mediante una cabeza de clasificación sobre los tokens de inicio y fin del span de respuesta, tal como en el esquema estándar de BERT para SQuAD.

Según los hiperparámetros declarados en la model card, el entrenamiento usó learning rate 2e-5, batch size 8 (train y eval), 3 épocas, semilla 42, optimizador AdamW (variante fused de PyTorch), scheduler lineal y mixed precision nativa (AMP). El dataset de entrenamiento no se especifica ("unknown dataset" según la model card), aunque el nombre del modelo apunta a SQuAD. No se documenta número de tokens, composición del dataset, ni si hubo etapas de RLHF/DPO (lo cual es esperable que no las haya, dado el tipo de tarea). Las versiones de framework declaradas son Transformers 5.20.1, PyTorch 2.14.1, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Question answering extractivo: dado un contexto y una pregunta, devuelve el fragmento de texto (span) que responde a la pregunta.
- Localización de respuestas en pasajes: adecuado para tareas de lectura comprensiva sobre documentos.
- Procesamiento de texto en inglés (presumiblemente, por el modelo base cased; no declarado por el autor).
- No genera texto libre: no es un modelo generativo ni de chat.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües: no disponible (no declaradas).

## Casos de uso

- Extracción de respuestas en bases documentales: indexar documentos y usar el modelo para localizar el span exacto que responde a una consulta, útil en sistemas de búsqueda de respuestas sobre corpus cerrados.
- Baseline de QA extractivo en investigación: servir como referencia ligera para comparar con modelos mayores en experimentos de lectura comprensiva.
- Pipelines de atención al cliente con FAQ: dado un contexto de políticas o manuales, extraer la frase concreta que responde a la pregunta del usuario, con bajo coste computacional.
- Análisis de contratos y documentos legales (en inglés): localizar cláusulas o datos concretos dentro de pasajes, siempre que el contexto quepa en la ventana de 512 tokens.
- Extracción de entidades factuales en formularios: responder preguntas del tipo "¿cuál es la fecha de inicio?" sobre un texto dado.
- Material didáctico y demostraciones: ejemplo de ajuste fino de BERT para talleres y tutoriales sobre QA extractivo.
- Preprocesamiento en pipelines RAG: como extractor de spans para resumir o validar respuestas antes de pasarlas a un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor contiene una entrada con la lista de resultados vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,4 GB para los pesos (~430 MB), más overhead de activaciones; en fp16, alrededor de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; modelos como NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 o superior), e incluso en CPU para cargas bajas.
- Opciones de despliegue: transformers (pipeline question-answering), HuggingFace Inference Endpoints (el tag endpoints_compatible está presente), ONNX Runtime, TGI (si se convierte), y llama.cpp no es aplicable directamente por no ser un modelo GGUF.
- Latencia y throughput: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-finetuned-squad (este) | 107,7 M | 512 (no confirmado) | QA extractivo | apache-2.0 | HuggingFace |
| google-bert/bert-base-cased | 108,3 M | 512 | Modelo base (MLM) | apache-2.0 | HuggingFace |
| deepset/bert-base-cased-squad2 | ~108 M | 512 | QA extractivo | apache-2.0 | HuggingFace |
| distilbert-base-cased-distilled-squad | ~66 M | 512 | QA extractivo | apache-2.0 | HuggingFace |

Los modelos comparables son ajustes finos de BERT o DistilBERT para SQuAD; no se dispone de métricas de este checkpoint para comparar rendimiento numéricamente.

## Limitaciones y advertencias

- No hay métricas de evaluación publicadas: el rendimiento real es desconocido y no debe asumirse comparable a otros ajustes de SQuAD.
- Model card generada automáticamente: falta información sobre dataset, evaluación y usos previstos; el autor indica "More information needed" en varias secciones.
- Riesgo de alucinación en sentido amplio: al ser extractivo, no inventa texto, pero puede devolver spans incorrectos o irrelevantes si la respuesta no está en el contexto.
- Limitación de contexto: la ventana de 512 tokens (estándar de BERT) impide procesar documentos largos sin troceado previo.
- Idioma: el modelo base es principalmente inglés; no se declaran idiomas soportados, por lo que el uso en castellano no está garantizado.
- Sesgos: hereda los sesgos del corpus de entrenamiento de bert-base-cased y del dataset de ajuste (no documentado).
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del dataset de ajuste, que no se especifica.
- Para producción: conviene validar el modelo en el dominio objetivo antes de desplegarlo, dado el escaso historial de uso (26 descargas) y la ausencia de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/animay1106/bert-finetuned-squad
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Dataset SQuAD: https://rajpurkar.github.io/SQuAD-explorer/
- Documentación de Transformers para question answering: https://huggingface.co/docs/transformers/tasks/question_answering
