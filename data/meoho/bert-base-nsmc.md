# MeoHo/bert-base-nsmc

## Resumen

El modelo `MeoHo/bert-base-nsmc` es un checkpoint de BERT base (110 millones de parámetros) subido al Hub de HuggingFace por el usuario MeoHo. Por su nombre, se trata de un fine-tuning de un BERT base sobre NSMC (Naver Sentiment Movie Corpus), el dataset de referencia para clasificación de sentimientos en coreano compuesto por reseñas de películas etiquetadas como positivas o negativas. El pipeline declarado es `feature-extraction`, lo que indica que el checkpoint está orientado a la extracción de representaciones vectoriales, aunque su origen sugiere que fue entrenado para clasificación de sentencias.

La model card está prácticamente vacía: no se especifica licencia, idiomas, arquitectura detallada, ni procedimiento de entrenamiento. Los únicos datos verificables son el número de parámetros (110.617.344, consistente con la arquitectura BERT base), el tamaño del repositorio (0,4 GB) y el uso de pesos en formato `safetensors`. La etiqueta `arxiv:1910.09700` referencia el paper original de BERT (Devlin et al., 2019). Aunque no hay documentación oficial, el checkpoint parece ser una variante más de los múltiples `bert-base-nsmc` que circulan en el Hub, todos ellos fine-tunings del mismo corpus coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (Transformer encoder, 12 capas, 768 hidden, 12 cabezas de atencion) |
| Parametros totales | 110.617.344 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens (estandar de BERT) |
| Tipos de cuantizacion | no disponible (solo se observa safetensors en fp32) |
| Idiomas soportados | coreano (inferido por el dataset NSMC; no declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de BERT base, un Transformer encoder bidireccional de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, preentrenado con los objetivos de masked language modeling (MLM) y next sentence prediction (NSP) sobre libros y Wikipedia en inglés. El checkpoint `MeoHo/bert-base-nsmc` es presumiblemente un fine-tuning de un BERT base (posiblemente `klue/bert-base`, el BERT coreano de KLUE) sobre el dataset NSMC, que contiene alrededor de 200.000 reseñas de películas de Naver con etiquetas binarias de sentimiento. No se dispone de información sobre hiperparámetros, número de épocas, estrategia de ajuste (por ejemplo, si se usó RLHF o DPO) ni composición exacta del dataset de entrenamiento. El pipeline declarado como `feature-extraction` sugiere que el modelo se publicó con la intención de usarse para obtener embeddings de secuencias, pero no hay evidencia de que se haya eliminado la cabeza de clasificación original.

## Capacidades

- Clasificación de sentimientos en coreano: el modelo está entrenado para distinguir reseñas positivas y negativas, aunque no se han publicado métricas de evaluación.
- Extracción de características: al ser un BERT, puede generar representaciones contextuales de tokens y secuencias para tareas downstream como similitud semántica o recuperación de información.
- Procesamiento de texto coreano: maneja el vocabulario de BERT base (WordPiece de 30.522 tokens) que incluye caracteres coreanos, aunque no se ha verificado su cobertura específica.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo encoder puro, sin capacidad generativa.
- No tiene capacidades multimodales ni de visión.

## Casos de uso

- Clasificación de reseñas de productos en coreano: el modelo puede integrarse en un pipeline de análisis de opiniones para comercio electrónico, asignando una etiqueta positiva o negativa a cada texto. Su tamaño compacto permite ejecutarlo en producción con baja latencia.
- Análisis de sentimiento en redes sociales: dado que NSMC contiene lenguaje informal de reseñas, el modelo puede adaptarse a tweets o comentarios coreanos, aunque requeriría un fine-tuning adicional con datos del dominio objetivo.
- Extracción de embeddings para búsqueda semántica: usando la capa `[CLS]` o la media de los embeddings de tokens, se pueden indexar documentos coreanos en una base vectorial para sistemas de recuperación.
- Filtrado de contenido moderado: como clasificador binario de polaridad, puede servir para priorizar revisiones que requieran atención humana en plataformas de contenido generado por usuarios.
- Entrenamiento de clasificadores ligeros: las representaciones del modelo pueden alimentar un clasificador lineal o un MLP para tareas de análisis de sentimiento con pocos recursos computacionales.
- Baseline académico: al ser un checkpoint de referencia sobre NSMC, sirve como punto de partida para comparar técnicas de fine-tuning o regularización en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de accuracy, F1 ni comparaciones con otros modelos en la model card ni en los resultados de búsqueda. El modelo `GTU9/bert-base-nsmc` (similar) reporta una accuracy de validación de 0,8680, pero no se puede atribuir ese valor a este checkpoint.

## Requisitos de hardware

- VRAM estimada: aproximadamente 440 MB en fp32, 220 MB en fp16 y 110 MB en INT8 para inferencia con batch de 1 y secuencias de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, etc.) es suficiente. También funciona en CPU con latencias de decenas de milisegundos por secuencia.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: HuggingFace `transformers` con PyTorch, `text-embeddings-inference` (etiqueta presente en el repo), `sentence-transformers` para embeddings, u ONNX Runtime para optimización en CPU.
- Latencia estimada: en una GPU moderna (RTX 3090) la inferencia de una secuencia corta (<128 tokens) tarda entre 2 y 5 ms; en CPU puede tardar entre 20 y 100 ms según el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MeoHo/bert-base-nsmc | 110M | 512 | Sentimiento coreano | no disponible | HuggingFace |
| GTU9/bert-base-nsmc | 110M | 512 | Sentimiento coreano | no disponible | HuggingFace |
| sangrimlee/bert-base-multilingual-cased-nsmc | 178M | 512 | Sentimiento coreano (multilingue) | no disponible | HuggingFace + Spark NLP |
| klue/bert-base | 110M | 512 | Modelo base coreano | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. `klue/bert-base` es el modelo base coreano más utilizado y suele servir como punto de partida para fine-tunings como este.

## Limitaciones y advertencias

- La model card no contiene información sobre sesgos, riesgos o limitaciones. Al ser un modelo entrenado sobre reseñas de películas, puede reflejar sesgos de género, edad o nacionalidad presentes en el corpus.
- Riesgo de alucinación: al ser un modelo encoder, no genera texto libre, por lo que el riesgo de alucinación es nulo en generación; sin embargo, la clasificación puede ser incorrecta en textos ambiguos o fuera del dominio de reseñas de películas.
- Sin licencia declarada: no se puede determinar si el modelo es de uso libre, lo que supone un riesgo legal para su uso comercial.
- Idiomas: solo se ha verificado su aplicabilidad al coreano; no se recomienda usarlo con otros idiomas sin fine-tuning.
- El checkpoint parece estar subido sin documentación técnica: no se especifica el dataset exacto, el procedimiento de entrenamiento ni las métricas de evaluación, lo que dificulta su reproducibilidad y comparación.
- La fecha de creación (2026-08-18) es posterior a la fecha actual de muchos sistemas, lo que sugiere que el modelo puede ser muy reciente o que la fecha es incorrecta.

## Enlaces

- HuggingFace: https://huggingface.co/MeoHo/bert-base-nsmc
- Paper de BERT (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Modelo similar GTU9/bert-base-nsmc: https://huggingface.co/GTU9/bert-base-nsmc
- Modelo similar sangrimlee (Spark NLP): https://sparknlp.org/2023/11/01/bert_sequence_classifier_base_multilingual_cased_nsmc_ko.html
- Proyecto BERT4NSMC (para secuencias de nucleotidos, no relacionado): https://github.com/basehc/BERT4NSMC
