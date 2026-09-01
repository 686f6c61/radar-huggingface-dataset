# LeninGF/qa-merged-mrm8488__bert-base-spanish-wwm-cased-finetuned-spa-squad2-es-ft-20260831_212023

## Resumen

Este modelo, publicado por el usuario LeninGF, es un checkpoint de respuesta a preguntas (question-answering) en español, derivado del conocido modelo `mrm8488/bert-base-spanish-wwm-cased-finetuned-spa-squad2-es`, que a su vez es un ajuste fino de BETO (bert-base-spanish-wwm-cased) sobre el dataset SQuAD-es-v2. El nombre del repositorio sugiere que se trata de un modelo fusionado (merged) o sometido a un ajuste adicional, aunque la model card no proporciona detalles sobre el proceso de entrenamiento ni sobre los datos utilizados.

Con 109,26 millones de parámetros, el modelo mantiene la arquitectura BERT base y está orientado exclusivamente a la tarea de extracción de respuestas en texto. Su relevancia radica en ofrecer una alternativa en español para sistemas de búsqueda de respuestas, aunque la ausencia de documentación técnica y de métricas de evaluación limita su uso en entornos de producción sin una validación previa.

La ficha se ha elaborado a partir de la información disponible en HuggingFace y de los resultados de búsqueda sobre el modelo base. Los datos específicos de este checkpoint (licencia, idiomas, contexto, entrenamiento) no están publicados y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (Whole Word Masking, cased) |
| Parametros totales | 109.261.826 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT base: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por herencia, español, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers) con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, tal como corresponde a un BERT base. El nombre del repositorio indica que se parte del checkpoint `mrm8488/bert-base-spanish-wwm-cased-finetuned-spa-squad2-es`, que fue entrenado con Whole Word Masking sobre el corpus español BETO y posteriormente ajustado en SQuAD-es-v2, la versión en español del dataset SQuAD 2.0, que incluye preguntas sin respuesta.

El sufijo "qa-merged" sugiere que se ha realizado una fusión de pesos (merge) entre varios checkpoints o un ajuste fino adicional, pero no se dispone de información sobre el procedimiento exacto, el número de épocas, la tasa de aprendizaje, el régimen de precisión (fp32, fp16, etc.) ni la composición del dataset de entrenamiento. Tampoco se documentan técnicas como RLHF o DPO. La model card es una plantilla automática sin contenido rellenado.

## Capacidades

- Respuesta a preguntas extractivas: dado un contexto y una pregunta, devuelve un fragmento de texto del contexto como respuesta.
- Soporte para preguntas sin respuesta: al estar entrenado sobre SQuAD 2.0, puede indicar que no hay respuesta en el contexto (capacidad heredada del modelo base, no verificada en este checkpoint).
- Procesamiento de texto en español: el modelo base fue entrenado con corpus en español, por lo que se espera un buen comportamiento en este idioma, aunque no hay confirmación oficial para esta versión.
- Integración con la librería transformers: compatible con la API estándar de HuggingFace para pipelines de question-answering.
- Formato safetensors: pesos almacenados en formato seguro y eficiente para carga en PyTorch.

No se han documentado capacidades adicionales como tool calling, generación de código, razonamiento multi-paso, visión o audio. El modelo es exclusivamente de tipo encoder para tareas de comprensión lectora.

## Casos de uso

- Atención al cliente automatizada: el modelo puede extraer respuestas de una base de conocimiento en español (manuales, FAQs) cuando el usuario formula una pregunta. Su naturaleza extractiva limita las respuestas a fragmentos literales del texto, por lo que es adecuado para dominios con documentación estructurada.
- Búsqueda de respuestas en documentos legales: en despachos o departamentos jurídicos, se puede indexar normativa o contratos y consultar cláusulas específicas mediante preguntas en lenguaje natural, obteniendo el pasaje relevante.
- Asistente de soporte técnico: integrado en un sistema de tickets, puede localizar la sección de un manual que describe un error o procedimiento, reduciendo el tiempo de resolución.
- Extracción de información en artículos científicos: para investigadores que necesitan localizar datos concretos (resultados, metodología) en papers en español, el modelo puede señalar el fragmento exacto.
- Chatbots educativos: en plataformas de e-learning, responde preguntas sobre el material de estudio extrayendo la respuesta del texto de la lección.
- Análisis de opiniones o reseñas: dado un conjunto de reseñas, el modelo puede responder preguntas como "¿qué problema menciona el cliente?" extrayendo la frase relevante, útil para análisis de sentimiento cualitativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `mrm8488/bert-base-spanish-wwm-cased-finetuned-spa-squad2-es` reporta métricas en su propia ficha (F1 y EM sobre SQuAD-es-v2), pero no se dispone de esos datos para este checkpoint fusionado. No se debe asumir que el rendimiento es idéntico al del modelo base sin verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 (109M parámetros × 4 bytes). Con cuantización a int8, se reduce a unos 0,1-0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA T4, GTX 1060, RTX 2060 o superiores funcionan sin problema. También es viable en CPU para inferencia por lotes pequeños.
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en Raspberry Pi con cuantización extrema.
- Opciones de despliegue: transformers pipeline, HuggingFace Inference Endpoints, ONNX Runtime, TensorRT, o servidores como vLLM (aunque vLLM está más orientado a modelos generativos, puede servir encoders). También se puede exportar a TorchScript.
- Latencia y throughput estimados: en una GPU T4, una inferencia de QA con contexto de 512 tokens tarda aproximadamente 10-20 ms. En CPU, puede ser de 100-300 ms. No hay datos oficiales para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeninGF/qa-merged (este) | 109M | no disponible | QA extractivo | no disponible | HuggingFace |
| mrm8488/bert-base-spanish-wwm-cased-finetuned-spa-squad2-es | 109M | 512 (típico) | QA extractivo | MIT (según repo original) | HuggingFace |
| mrm8488/distill-bert-base-spanish-wwm-cased-finetuned-spa-squad2-es | ~66M (estimado) | 512 (típico) | QA extractivo | MIT | HuggingFace |
| bert-base-multilingual-cased | 178M | 512 | Multilingüe, requiere ajuste | Apache 2.0 | HuggingFace |

La comparativa se basa en los modelos base conocidos. No se dispone de datos de rendimiento para el modelo fusionado, por lo que no se puede establecer una comparación cuantitativa. El modelo destilado de mrm8488 es más pequeño y rápido, pero con una precisión ligeramente inferior según la documentación del autor.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de BERT entrenado con corpus web, puede heredar sesgos de género, etnia y otros presentes en los textos de entrenamiento. No se ha realizado una evaluación de sesgos para este checkpoint.
- Riesgo de alucinación: en tareas extractivas, el riesgo es menor que en modelos generativos, pero puede devolver fragmentos incorrectos si la pregunta no tiene respuesta en el contexto o si el contexto es ambiguo.
- Limitaciones de contexto: la arquitectura BERT base tiene una ventana máxima de 512 tokens. Para documentos largos, es necesario dividir el texto en fragmentos, lo que puede perder información relevante.
- Limitaciones de idioma: aunque el modelo base está entrenado en español, no se ha confirmado el comportamiento en variantes dialectales, jerga técnica o textos muy coloquiales.
- Restricciones de licencia: la licencia no está especificada en la ficha de HuggingFace. Esto impide determinar si es apto para uso comercial sin permisos adicionales. Se recomienda contactar al autor antes de utilizarlo en producción.
- Falta de documentación: la model card no contiene información sobre el proceso de entrenamiento, los datos utilizados ni las métricas de evaluación. Esto dificulta la reproducibilidad y la confianza en el modelo.
- Fecha de creación futura: el modelo está fechado en agosto de 2026, lo que podría indicar un error en el reloj del sistema o un artefacto de la plataforma. No afecta a la funcionalidad, pero conviene tenerlo en cuenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeninGF/qa-merged-mrm8488__bert-base-spanish-wwm-cased-finetuned-spa-squad2-es-ft-20260831_212023
- Modelo base (mrm8488): https://huggingface.co/mrm8488/bert-base-spanish-wwm-cased-finetuned-spa-squad2-es
- Versión destilada (mrm8488): https://huggingface.co/mrm8488/distill-bert-base-spanish-wwm-cased-finetuned-spa-squad2-es
- Referencia en Azure AI Catalog: https://ai.azure.com/catalog/models/mrm8488-bert-base-spanish-wwm-cased-finetuned-spa-squad2-es
- Repositorio con documentación de BETO (GitHub): https://github.com/ScienceNLP-Lab/DiMB-RE/tree/master/PL-Marker/transformers/model_cards/mrm8488/bert-base-spanish-wwm-cased-finetuned-spa-squad2-es
- Ficha de la versión destilada en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/distill-bert-base-spanish-wwm-cased-finetuned-spa-squad2-es-mrm8488
