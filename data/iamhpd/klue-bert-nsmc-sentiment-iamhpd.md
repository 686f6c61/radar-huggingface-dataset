# iamhpd/klue-bert-nsmc-sentiment-iamhpd

## Resumen

El modelo `iamhpd/klue-bert-nsmc-sentiment-iamhpd` es un clasificador de análisis de sentimiento binario (positivo/negativo) basado en la arquitectura BERT, desarrollado por el usuario iamhpd. Se trata de un fine-tuning del modelo `klue/bert-base` sobre el dataset NSMC (Naver Sentiment Movie Corpus), un corpus de reseñas de películas en coreano. El modelo está diseñado para la tarea de clasificación de texto, concretamente para determinar la polaridad de opiniones escritas en coreano.

Con 110.618.882 parámetros, el modelo se aloja en Hugging Face con formato safetensors y es compatible con la librería transformers. Aunque la model card no proporciona detalles sobre el entrenamiento ni la licencia, el nombre y los tags indican claramente su origen y propósito. Su relevancia radica en ofrecer una solución lista para usar en análisis de sentimiento de textos coreanos, un área con menos recursos que el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base, encoder-only transformer) |
| Parametros totales | 110.618.882 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base klue/bert-base soporta 512 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32) |
| Idiomas soportados | coreano (inferido del nombre y del dataset NSMC; la ficha no lo especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), un transformer encoder-only con 12 capas, 12 cabezas de atención y una dimensión oculta de 768, tal como corresponde al tamaño base. El checkpoint `klue/bert-base` fue preentrenado por el equipo KLUE sobre un corpus coreano masivo, y este modelo es un fine-tuning posterior sobre el dataset NSMC para la tarea de clasificación de sentimiento.

No se dispone de información detallada sobre el proceso de entrenamiento: no se especifican hiperparámetros, número de épocas, tasa de aprendizaje, ni el uso de técnicas como RLHF o DPO. Dado que es una tarea de clasificación, lo más probable es que se haya añadido una cabeza de clasificación sobre la representación del token `[CLS]`, pero esto no está confirmado en la documentación disponible.

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) en texto coreano, especialmente reseñas de películas.
- Inferencia sobre secuencias de hasta 512 tokens (límite del modelo base, aunque no confirmado para este checkpoint).
- Integración sencilla con la librería transformers mediante el pipeline `text-classification`.
- Compatible con Text Embeddings Inference y endpoints de Hugging Face.
- No soporta tool calling, generación de código, razonamiento multi-paso ni otras capacidades propias de modelos generativos.

## Casos de uso

- Análisis de reseñas de películas en plataformas coreanas: el modelo puede clasificar automáticamente críticas como positivas o negativas, permitiendo a estudios y distribuidoras monitorizar la recepción de sus estrenos.
- Moderación de comentarios en foros y redes sociales: al detectar la polaridad de los mensajes, se puede priorizar la revisión de contenido negativo o abusivo.
- Investigación académica en procesamiento de lenguaje natural coreano: sirve como baseline para experimentos de análisis de sentimiento o como componente en sistemas más complejos.
- Sistemas de recomendación: la polaridad extraída de reseñas puede alimentar algoritmos que sugieran películas según la opinión de los usuarios.
- Monitorización de marca en servicios de streaming: las reseñas de series y películas pueden clasificarse para identificar problemas de calidad o satisfacción.
- Análisis de tendencias de opinión: agregando clasificaciones a lo largo del tiempo, se pueden detectar cambios en la percepción pública de un título o género.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como accuracy, F1 o comparativas con otros modelos en el dataset NSMC.

## Requisitos de hardware

- El tamaño del repositorio es de 0.4 GB, lo que corresponde aproximadamente a 110 millones de parámetros en FP32 (unos 440 MB en memoria).
- Inferencia en CPU: viable para uso puntual o en lotes pequeños, con latencia de decenas de milisegundos por ejemplo.
- Inferencia en GPU: cualquier GPU con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). En GPUs modernas como RTX 3090 o A100, la inferencia es casi instantánea.
- Opciones de despliegue: se puede servir con la librería transformers, con Text Embeddings Inference (TEI) o mediante endpoints compatibles de Hugging Face. También es posible exportar a ONNX o TensorRT para optimización.
- Throughput estimado: en una GPU como RTX 3090, se pueden procesar cientos de ejemplos por segundo con batch size adecuado, aunque no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| iamhpd/klue-bert-nsmc-sentiment-iamhpd | 110.6M | no disponible | Sentimiento coreano | no disponible |
| ISEO/nsmc_model | 110M (klue/bert-base) | 512 | Sentimiento coreano | no disponible |
| klue/bert-base | 110M | 512 | Preentrenamiento general coreano | MIT (según repo KLUE) |

El modelo es funcionalmente equivalente a otros fine-tunings de `klue/bert-base` sobre NSMC, como `ISEO/nsmc_model`. La principal diferencia es la autoría y la ausencia de documentación. No se dispone de comparativas de rendimiento entre ellos.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones específicas. Al estar entrenado en reseñas de películas, puede tener un sesgo hacia el lenguaje informal y coloquial de ese dominio.
- El modelo solo funciona con texto en coreano; no se ha evaluado su rendimiento en otros idiomas.
- La licencia no está especificada, por lo que el uso comercial puede ser problemático. Se recomienda contactar al autor o buscar un modelo con licencia clara.
- No se han publicado métricas de evaluación, por lo que se desconoce su precisión real y su comportamiento en datos fuera de distribución.
- Al ser un modelo de clasificación, no genera texto y no es adecuado para tareas generativas.
- La longitud de contexto no está confirmada; si se superan los 512 tokens, el modelo truncará o fallará.

## Enlaces

- [Hugging Face: iamhpd/klue-bert-nsmc-sentiment-iamhpd](https://huggingface.co/iamhpd/klue-bert-nsmc-sentiment-iamhpd)
- [Hugging Face: klue/bert-base](https://huggingface.co/klue/bert-base)
- [Hugging Face: ISEO/nsmc_model](https://huggingface.co/ISEO/nsmc_model)
- [Paper KLUE: Korean Language Understanding Evaluation](https://arxiv.org/abs/2105.09680)
- [GitHub: KLUE-benchmark/KLUE](https://github.com/KLUE-benchmark/KLUE)
- [GitHub: nsmc-sentiment-analysis (script de fine-tuning)](https://github.com/bovwes/nsmc-sentiment-analysis)
