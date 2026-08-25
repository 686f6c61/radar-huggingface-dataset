# AlexStamp/bert-finetuned-ner

## Resumen

El modelo `AlexStamp/bert-finetuned-ner` es una versión afinada de `bert-base-cased` para la tarea de reconocimiento de entidades nombradas (NER, por sus siglas en inglés). Ha sido desarrollado por AlexStamp como parte del capítulo 7 del Hugging Face LLM Course, un ejercicio de aprendizaje que se publica como modelo abierto con licencia Apache 2.0. El modelo está especializado en inglés y reconoce cuatro tipos de entidades en formato IOB2: personas (PER), organizaciones (ORG), localizaciones (LOC) y miscelánea (MISC).

Se trata de un modelo pequeño y eficiente: 107,7 millones de parámetros, basado en la arquitectura Transformer Encoder de BERT. Aunque no es un modelo de última generación, es útil para tareas de extracción de información en textos en inglés, especialmente en dominios periodísticos o documentales. Su relevancia actual reside en su simplicidad y en que puede ejecutarse en hardware modesto, siendo un punto de partida práctico para pipelines de NLP que requieran etiquetado de entidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Encoder (BERT-base) |
| Parámetros totales | 107.726.601 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base tiene límite estándar de 512 tokens) |
| Tipos de cuantización | no disponible (no se especifican) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `bert-base-uncased` (12 capas, 768 unidades ocultas, 12 cabezas de atención), adaptado con una capa de clasificación de tokens para etiquetar cada token con una etiqueta IOB2. El fine-tuning se realizó sobre el dataset CoNLL-2003 (versión inglesa, corpus de Reuters) durante 3 épocas, con una tasa de aprendizaje de 2e-5, un peso de decaimiento de 0.01 y un batch de 8. Se utilizó el API `Trainer` de Hugging Face y el evaluador `seqeval` para calcular la F1 a nivel de entidad. El entrenamiento se ejecutó en una GPU T4 de Google Colab, lo que indica que el proceso es ligero y reproducible en hardware de gama baja.

## Capacidades

- Reconocimiento de entidades nombradas en texto inglés, con cuatro tipos: PER (personas), ORG (organizaciones), LOC (localizaciones) y MISC (miscelánea).
- Salida en formato IOB2 (Inside, Outside, Beginning), adecuada para procesamiento posterior.
- Integración sencilla con el pipeline `token-classification` de Hugging Face, con soporte para `aggregation_strategy` para agrupar entidades multi-token.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- Funciona exclusivamente sobre texto, sin soporte para otros idiomas que no sean inglés.

## Casos de uso

- **Extracción de entidades en artículos periodísticos**: el modelo puede identificar personas, organizaciones y lugares en noticias en inglés, facilitando la construcción de bases de datos de entidades o la generación de metadatos automáticos.
- **Análisis de documentos legales**: en contratos o expedientes judiciales, permite detectar nombres de partes, empresas y tribunales, ayudando a automatizar la clasificación documental.
- **Procesamiento de redes sociales**: para monitorizar menciones de marcas o personajes públicos en tweets o comentarios, identificando quién habla, sobre qué organización o en qué lugar.
- **Preprocesamiento para sistemas de búsqueda semántica**: al etiquetar entidades en un corpus, se pueden indexar y filtrar resultados por tipo de entidad, mejorando la precisión de los buscadores.
- **Etiquetado de informes financieros**: para extraer nombres de empresas, personas responsables y ubicaciones de operaciones en informes anuales o notas de prensa.
- **Pipelines de NLP de bajo coste**: por su tamaño reducido, puede integrarse en entornos con recursos limitados (CPU, dispositivos edge) para realizar NER en tiempo real en aplicaciones de chat o análisis de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (como MMLU, HumanEval o GLUE) para este modelo. El único dato disponible es la métrica de validación durante el entrenamiento, que se muestra a continuación. No se pueden comparar directamente con otros modelos, ya que no se ha incluido ningún resultado en el `model-index` de Hugging Face.

| Época | Pérdida de validación | Precisión | Recall | F1 | Exactitud |
|:-----:|:--------------------:|:---------:|:------:|:------:|:--------:|
| 1     | 0.0651               | 0.8905    | 0.9310 | 0.9103 | 0.9812   |
| 2     | 0.0681               | 0.9321    | 0.9473 | 0.9397 | 0.9853   |
| 3     | 0.0599               | 0.9319    | 0.9507 | 0.9412 | 0.9867   |

Los valores finales muestran una F1 de 0.9412 y una exactitud de 0.9867 sobre el conjunto de validación de CoNLL-2003, lo que indica un rendimiento razonable para un modelo de este tamaño, aunque no es un benchmark oficial.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en FP32, el modelo ocupa aproximadamente 430 MB de memoria, por lo que caben en GPUs con 1 GB de VRAM o menos. Con cuantización (p. ej., FP16) el consumo baja a unos 215 MB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, RTX 3060, etc.). También funciona correctamente en CPU, aunque con mayor latencia.
- **Consumer GPU**: sí, cabe en la mayoría de GPUs de consumo, incluso en modelos integrados con 4 GB de VRAM.
- **Opciones de despliegue**: se puede utilizar con `transformers` (pipeline de Hugging Face), `vLLM` (aunque es más habitual para LLMs grandes, también sirve para BERT), `ONNX Runtime` o `TFLite` para dispositivos móviles.
- **Latencia**: en una CPU moderna, la inferencia de un texto corto (unos 100 tokens) toma entre 50 y 150 ms. En una GPU dedicada, se reduce a menos de 10 ms.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con otros modelos. Sin embargo, se puede realizar una comparación cualitativa con alternativas de la misma familia:

| Modelo | Tamaño | Contexto | Entrenamiento | Licencia | Observaciones |
|---|---|---|---|---|---|
| `AlexStamp/bert-finetuned-ner` | 107 M | 512 tokens | CoNLL-2003 | Apache 2.0 | Modelo educativo, no optimizado para producción |
| `bert-base-cased` (base) | 107 M | 512 tokens | Preentrenamiento general | Apache 2.0 | No afinado para NER, requiere capa adicional |
| `dslim/bert-base-NER` | 107 M | 512 tokens | CoNLL-2003 + otros | Apache 2.0 | Reconocido modelo NER, con más datos y ajuste fino |
| `spacy/en_core_web_trf` | 107 M | 512 tokens | Multi-corpus | MIT | Integrado en spaCy, con pipeline completo |

El modelo de AlexStamp es un fine-tune básico, sin optimizaciones específicas, por lo que probablemente tenga un rendimiento inferior a modelos más consolidados como `dslim/bert-base-NER`. Sin embargo, sirve como ejemplo de entrenamiento y para pruebas educativas.

## Limitaciones y advertencias

- **Dominio limitado**: fue entrenado exclusivamente con el corpus Reuters (noticias en inglés). En otros dominios (médico, legal, técnico) su rendimiento puede degradarse notablemente.
- **Sensibilidad a mayúsculas**: al ser un modelo con `cased`, las mayúsculas son un factor clave para la detección de entidades. Si el texto de entrada tiene errores de mayúsculas, la precisión cae.
- **Alucinaciones**: al igual que otros modelos de NER, puede etiquetar como entidad palabras que no lo son, sobre todo en textos con vocabulario poco común.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo fue desarrollado como ejercicio educativo y no ofrece garantías de rendimiento ni de mantenimiento.
- **Idioma**: solo soporta inglés. Para otros idiomas no es aplicable.
- **Contexto limitado**: la longitud máxima de entrada es de 512 tokens, por lo que no es adecuado para documentos largos sin segmentación previa.

## Enlaces

- Hugging Face: [https://huggingface.co/AlexStamp/bert-finetuned-ner](https://huggingface.co/AlexStamp/bert-finetuned-ner)
- Repositorio de Hugging Face del modelo: [https://huggingface.co/nt-ai/bert-finetuned-ner](https://huggingface.co/nt-ai/bert-finetuned-ner) (modelo similar de otro autor)
- GitHub con proyecto de NER con BERT: [https://github.com/Liki990/bert_model](https://github.com/Liki990/bert_model)
- Artículo sobre fine-tuning de BERT para NER: [https://medium.com/@whyamit101/fine-tuning-bert-for-named-entity-recognition-ner-b42bcf55b51d](https://medium.com/@whyamit101/fine-tuning-bert-for-named-entity-recognition-ner-b42bcf55b51d)
