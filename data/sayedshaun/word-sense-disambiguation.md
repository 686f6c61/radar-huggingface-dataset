# SayedShaun/word-sense-disambiguation

## Resumen

El modelo `SayedShaun/word-sense-disambiguation` es un conjunto de pesos afinados (fine-tuned) para la tarea de desambiguación del sentido de las palabras (WSD, por sus siglas en inglés). Está desarrollado por Md Abu Sayed Shaun y se basa en el modelo `distilbert-base-uncased` de DistilBERT. El problema que resuelve es el de determinar el significado correcto de una palabra ambigua dentro de un contexto oracional, un desafío clásico en el procesamiento del lenguaje natural (PLN) con aplicaciones en traducción, análisis de sentimientos, recuperación de información y sistemas de diálogo.

El repositorio contiene dos arquitecturas distintas implementadas sobre la base de DistilBERT: una de extracción de tramos (span extraction) y otra de similitud coseno entre el contexto y las glosas (gloss-context bi-encoder). La primera se inspira en el trabajo de Barba et al. (2021) sobre *Extractive Sense Comprehension*; la segunda sigue el enfoque de Blevins y Zettlemoyer (2020) con *Gloss-Informed Bi-encoders*. Ambos checkpoints están entrenados sobre el corpus SemCor y evaluados en los conjuntos estándar de Senseval y SemEval. El modelo es ligero (basado en un transformer de 66 millones de parámetros) y está pensado para integrarse en pipelines de NLP que requieran desambiguación léxica de alta precisión sin el coste computacional de los grandes modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (DistilBERT) con dos variantes: extracción de tramos (span) y bi-encoder coseno |
| Parámetros totales | No disponible (basado en DistilBERT-base, que tiene aproximadamente 66M parámetros) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (DistilBERT base soporta 512 tokens) |
| Tipos de cuantización | No disponible (los pesos se distribuyen en formato PyTorch `.pt`) |
| Idiomas soportados | No disponible (el entrenamiento se realizó con SemCor, que es en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (archivos `.pt`) |

## Arquitectura y entrenamiento

El modelo implementa dos arquitecturas distintas, ambas construidas sobre el encoder de DistilBERT (`distilbert-base-uncased`). La primera, denominada `SpanExtractionModel`, trata la desambiguación como una tarea de extracción de tramos: codifica la oración completa y predice el inicio y fin del tramo que corresponde a la glosa correcta del sentido de la palabra. Esta formulación sigue el esquema de *Extractive Sense Comprehension* de Barba et al. (2021). La segunda arquitectura, `WSDModel`, es un bi-encoder que codifica por separado la oración y cada glosa candidata, y puntúa los sentidos mediante la similitud coseno entre las representaciones del token `[CLS]` de cada uno. Este enfoque se basa en el trabajo de Blevins y Zettlemoyer (2020) sobre bi-encoders informados por glosas.

El entrenamiento se realizó sobre el corpus SemCor, que es un recurso estándar para WSD con anotaciones de sentidos de WordNet. No se especifica el número total de tokens de entrenamiento ni se menciona el uso de técnicas como RLHF o DPO. Los checkpoints proporcionados corresponden a los pasos de entrenamiento 28000 (arquitectura de tramos, F1 0.8037) y 12000 (arquitectura coseno, F1 0.8066). El repositorio incluye scripts de evaluación que permiten reproducir los resultados sobre los conjuntos de evaluación de Senseval 2/3 y SemEval 2007/2013/2015.

## Capacidades

- Desambiguación del sentido de palabras en inglés: dado un contexto, el modelo asigna el sentido correcto de una palabra ambigua según el inventario de WordNet.
- Dos arquitecturas complementarias: extracción de tramos (predicta el segmento de la glosa) y similitud coseno (puntúa cada glosa candidata).
- Extracción de características: al ser un modelo basado en DistilBERT, puede usarse como extractor de embeddings de contexto para otras tareas.
- Integración con bibliotecas estándar: los pesos se cargan con `torch.load` y se usan con las clases del repositorio `wsd`, que a su vez se apoyan en `transformers` y `AutoTokenizer`.
- No se especifican capacidades adicionales como tool calling, generación de texto o multimodales; el modelo está especializado en WSD.

## Casos de uso

- **Recuperación de información**: en motores de búsqueda, el modelo puede desambiguar palabras clave para mejorar la relevancia de los resultados, especialmente en consultas con términos polisémicos como "bank" (entidad financiera o ribera).
- **Análisis de sentimiento**: la desambiguación previa del sentido de palabras mejora la clasificación de opiniones, por ejemplo, en reseñas donde "duro" puede significar "difícil" o "sólido".
- **Traducción automática**: en sistemas de traducción, el modelo puede seleccionar el sentido correcto de una palabra para elegir la traducción adecuada, reduciendo errores en contextos ambiguos.
- **Sistemas de diálogo y asistentes**: para entender intenciones y entidades en conversaciones, el modelo puede desambiguar términos como "tarjeta" (de crédito o de visita) y mejorar la respuesta del sistema.
- **Procesamiento de documentos legales o técnicos**: ayuda a interpretar correctamente términos con múltiples acepciones en contextos especializados, mejorando la extracción de información.
- **Análisis de redes sociales**: para detectar el significado de jergas o términos con doble sentido en publicaciones, facilitando tareas de monitorización de marca o detección de contenido.

## Benchmarks y rendimiento

Los resultados reportados en la model card se muestran a continuación. La métrica principal es F1 (macro) para ambos arquitecturas.

| Arquitectura | Dataset | Loss | F1 | Exact Match | Precision | Recall | Accuracy |
|---|---|---|---|---|---|---|---|
| Span | ALL | 0.512 | 0.8087 | 0.7962 | - | - | - |
| Span | semeval2007 | 0.517 | 0.8037 | 0.7934 | - | - | - |
| Span | semeval2013 | 0.524 | 0.7995 | 0.7835 | - | - | - |
| Span | semeval2015 | 0.611 | 0.7880 | 0.7769 | - | - | - |
| Span | senseval2 | 0.527 | 0.8056 | 0.7927 | - | - | - |
| Span | senseval3 | 0.476 | 0.8142 | 0.8043 | - | - | - |
| Cosine | Todos | 0.5684 | 0.8024 | - | 0.8024 | 0.8024 | 0.8024 |
| Cosine | semeval2007 | 0.5524 | 0.8066 | - | 0.8066 | 0.8066 | 0.8066 |
| Cosine | semeval2013 | 0.4821 | 0.8303 | - | 0.8303 | 0.8303 | 0.8303 |
| Cosine | semeval2015 | 0.6726 | 0.7965 | - | 0.7965 | 0.7965 | 0.7965 |
| Cosine | senseval2 | 0.5827 | 0.7993 | - | 0.7993 | 0.7993 | 0.7993 |
| Cosine | senseval3 | 0.5064 | 0.8000 | - | 0.8000 | 0.8000 | 0.8000 |

Los resultados muestran un rendimiento consistente en todos los conjuntos, con un mejor F1 para la arquitectura coseno en semeval2013 (0.8303). No se dispone de comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- El modelo es ligero: al estar basado en DistilBERT (66M parámetros), la inferencia se puede realizar en CPU sin problemas.
- VRAM estimada para inferencia: aproximadamente 0.25 GB en FP32 (66M * 4 bytes) y 0.13 GB en FP16. Con el batch size típico de 32, se necesitaría algo más de memoria, pero sigue siendo accesible en GPUs con 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1060, RTX 2060, RTX 3090) para inferencia rápida. En CPU, la latencia por muestra puede ser de unos pocos milisegundos.
- El modelo se puede desplegar con las bibliotecas estándar de PyTorch y Transformers. No se menciona compatibilidad con vLLM, Ollama o TGI en la documentación, pero al ser un modelo de encoder, puede servirse con `transformers` pipeline o como extractor de características.
- No se proporcionan datos de throughput o latencia específicos.

## Comparativa con modelos similares

No se dispone de una comparativa numérica con otros modelos en la información proporcionada. Sin embargo, el modelo se inspira en dos enfoques conocidos: el *ESC* de Barba et al. (NAACL 2021) y el *Gloss-Informed Bi-encoder* de Blevins y Zettlemoyer (ACL 2020). Otros modelos de WSD como GlossBERT (basado en BERT) o el enfoque de distilling LLM de la literatura reciente no se pueden comparar directamente con los datos disponibles. Por lo tanto, no se proporciona una tabla comparativa.

## Limitaciones y advertencias

- El modelo solo ha sido entrenado con datos en inglés (SemCor). No se ha evaluado su rendimiento en otros idiomas.
- La longitud de contexto está limitada a 512 tokens, lo que puede ser insuficiente para documentos largos o contextos de oraciones extensas.
- No se ha realizado un análisis de sesgos o alucinaciones específicos. Como modelo de clasificación, su riesgo de alucinación es bajo, pero puede errar en sentidos poco frecuentes o con glosas ambiguas.
- Los pesos se distribuyen como `state_dict` de PyTorch, por lo que requieren el código del repositorio `wsd` para cargarlos correctamente. No son compatibles directamente con el `pipeline` de Hugging Face sin adaptaciones.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que el dataset SemCor y los conjuntos de evaluación no tengan restricciones adicionales.
- No se proporcionan métricas de rendimiento en otros conjuntos de datos distintos a los listados, por lo que el rendimiento en otros dominios no está garantizado.

## Enlaces

- Modelo en Hugging Face: [SayedShaun/word-sense-disambiguation](https://huggingface.co/SayedShaun/word-sense-disambiguation)
- Repositorio de código y documentación: [github.com/sayedshaun/wsd](https://github.com/sayedshaun/wsd)
- Paper de referencia (ESC): [Barba et al., *ESC: Redesigning WSD with Extractive Sense Comprehension*](https://aclanthology.org/2021.naacl-main.371/)
- Paper de referencia (bi-encoder): [Blevins & Zettlemoyer, *Moving Down the Long Tail of Word Sense Disambiguation with Gloss-Informed Bi-encoders*](https://aclanthology.org/2020.acl-main.95/)
- Dataset de entrenamiento SemCor: [SemCor](https://lcl.uniroma1.it/wsdeval/training-data)
- Datos de evaluación: [SemEval/Senseval](https://lcl.uniroma1.it/wsdeval/evaluation-data)
