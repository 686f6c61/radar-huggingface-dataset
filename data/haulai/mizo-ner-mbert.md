# haulai/mizo-ner-mbert

## Resumen

El modelo `haulai/mizo-ner-mbert` es un sistema de reconocimiento de entidades nombradas (NER) para la lengua mizo (código ISO 639-3: lus), una lengua tibeto-birmana de bajos recursos hablada principalmente en Mizoram (India) y en zonas de Myanmar y Bangladés. Fue desarrollado por el usuario de Hugging Face `haulai` como parte de un esfuerzo por ofrecer recursos de NLP para lenguas minoritarias. El modelo parte de la arquitectura BERT multilingüe cased (`google-bert/bert-base-multilingual-cased`) y se ajustó fino sobre un corpus NER de 441 178 oraciones en mizo. Con aproximadamente 177 millones de parámetros y una ventana de contexto de 512 tokens, está diseñado para la clasificación de tokens, concretamente para etiquetar nombres de personas, lugares, organizaciones y otras entidades.

La relevancia del modelo radica en que el mizo es una lengua de bajos recursos con muy pocos recursos anotados disponibles. No obstante, el propio autor advierte de una limitación esencial: las etiquetas de entrenamiento son *silver-standard*, es decir, generadas automáticamente por proyección a partir de otros recursos y no revisadas por hablantes nativos. La evaluación sobre un conjunto de 300 oraciones anotadas manualmente por dos hablantes de mizo arroja un F1 de 0,6049, cifra significativamente inferior a la obtenida sobre el conjunto de test plateado. Por tanto, el modelo debe interpretarse como una aproximación inicial, útil para experimentos y como punto de partida, pero no como un sistema listo para uso profesional sin validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only Transformer) |
| Parametros totales | 177 280 535 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | lus (mizo) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `bert-base-multilingual-cased`, un Transformer bidireccional de tipo encoder-only. La capa de salida se adapta para clasificación de tokens, con el objetivo de predecir etiquetas de entidades nombradas para cada token de una oración. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal ni técnicas de alineamiento con preferencias humanas (RLHF, DPO). El entrenamiento se realizó sobre el corpus `haulai/mizo-ner`, compuesto por 441 178 oraciones en mizo con etiquetas *silver-standard*. El autor indica que estas etiquetas provienen de una proyección automática sobre un corpus ya existente, y que no representan una anotación manual de calidad. Además, el conjunto de entrenamiento se restringe a oraciones que contienen entidades, lo que implica que el comportamiento del modelo sobre texto con poca densidad de entidades no ha sido testado.

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas (NER) en mizo.
- Identificación de entidades típicas en textos mizo, presumiblemente personas, lugares y organizaciones, aunque las categorías exactas no están documentadas en la ficha del modelo.
- Inferencia mediante el pipeline `token-classification` de Transformers, con soporte para `aggregation_strategy="simple"`, que agrupa subtokens en entidades completas.
- No soporta generación de texto libre, tool calling, función llamada, razonamiento multi-paso, visión ni audio. Es un modelo exclusivamente de tipo encoder para etiquetado secuencial.
- Capacidad multilingüe limitada en la práctica: aunque la base es multilingüe cased, el ajuste fino se ha hecho exclusivamente para mizo, por lo que el rendimiento en otras lenguas no se ha evaluado.

## Casos de uso

- Extracción de entidades en corpus periodísticos mizo: el modelo puede procesar artículos de noticias en mizo para identificar automáticamente personas, lugares y organizaciones, facilitando la indexación temática. Su longitud de contexto de 512 tokens es suficiente para párrafos y noticias cortas, aunque textos largos deberán segmentarse.
- Digitalización de documentos administrativos en Mizoram: muchos registros y actas están en mizo; el modelo puede usarse para extraer nombres de personas, localidades y departamentos, reduciendo el trabajo manual. Se recomienda una revisión humana debido al F1 de 0,6049 sobre datos dorados.
- Construcción de datasets de entrenamiento para otros modelos de NLP en lenguas tibeto-birmanas: el modelo actúa como anotador automático para generar etiquetas *silver-standard* adicionales en textos mizo, que luego pueden corregirse manualmente. Esto es útil en entornos de investigación con pocos recursos.
- Análisis sociolingüístico y demográfico: investigadores interesados en estudiar la distribución de nombres propios o de lugares en textos mizo pueden emplear el modelo como herramienta de preprocesamiento, combinándolo con estadísticas posteriores sobre las entidades detectadas.
- Asistencia a traductores humanos mizo-inglés: en un flujo de traducción, el modelo puede marcar automáticamente nombres propios para evitar que se traduzcan literalmente. Al ser un modelo entrenado solo con oraciones que contienen entidades, su uso en textos generales debe hacerse con cautela.
- Investigación en procesamiento de lenguas de bajos recursos: sirve como modelo comparativo de referencia para estudiar el impacto de las etiquetas *silver-standard* y para experimentar con técnicas de aprendizaje débilmente supervisado en lenguas minoritarias, dentro de entornos académicos.

## Benchmarks y rendimiento

El autor solo ha publicado dos métricas en la ficha del modelo. No se ha encontrado ninguna comparación formal con otros sistemas NER en mizo en la información disponible.

| Metrica | Valor | Observacion |
|---|---|---|
| Micro F1 (conjunto de test silver) | 0,8810 | Indica acuerdo con las etiquetas proyectadas, no precisión real |
| F1 (conjunto de test gold) | 0,6049 | Evaluado sobre 300 oraciones anotadas por dos hablantes de mizo |

Estos datos deben interpretarse con cautela: el valor de 0,6049 sobre el conjunto dorado es la cifra que mejor refleja el rendimiento real, mientras que el 0,8810 solo representa la consistencia con la proyección automática, que puede estar sesgada por el propio proceso de generación de etiquetas.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos en FP32: aproximadamente 0,7–1 GB, incluyendo el overhead del framework. Con 177 millones de parámetros, los pesos ocupan alrededor de 708 MB en FP32.
- GPU recomendadas: cualquier GPU de consumo con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GeForce GTX 1050 Ti, RTX 2050 o superiores). Puede ejecutarse también en GPU de centro de datos como A10 o A100, aunque no es necesario.
- El modelo no incluye pesos cuantizados en el repositorio, por lo que el uso de cuantización 8 bits requeriría una conversión manual con herramientas como `bitsandbytes` o `transformers` con `load_in_8bit`.
- Puede ejecutarse en CPU con una latencia aceptable para procesamiento por lotes o análisis diferidos, dado que se trata de un modelo BERT base y no de un modelo generativo.
- Despliegue recomendado: mediante el pipeline de Hugging Face (`pipeline("token-classification")`), o exportación a ONNX para entornos de producción con mayor control. No es compatible con frameworks enfocados en modelos generativos como vLLM o llama.cpp.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han encontrado en la información disponible benchmarks comparables para otros modelos NER en mizo. Se conoce la existencia de `robzchhangte/MizBERT`, un modelo BERT preentrenado en mizo, pero su ficha no incluye métricas de NER ni comparaciones directas. Por tanto, en la siguiente tabla los datos de MizBERT se indican como no disponibles.

| Modelo | Arquitectura | Parametros | Licencia | Rendimiento NER en mizo |
|---|---|---|---|---|
| haulai/mizo-ner-mbert | BERT-base multilingüe cased | 177 280 535 | CC-BY-4.0 | F1 gold: 0,6049 |
| robzchhangte/MizBERT | BERT (preentrenamiento en mizo) | no disponible | no disponible | no disponible |
| google-bert/bert-base-multilingual-cased | BERT-base multilingüe cased | 177 280 535 | Apache-2.0 | sin ajuste para NER (no comparable) |

## Limitaciones y advertencias

- Etiquetas de entrenamiento *silver-standard*: las etiquetas fueron generadas automáticamente y no revisadas por hablantes nativos. El rendimiento sobre datos anotados manualmente (gold) es notablemente inferior: F1 de 0,6049.
- Sobreajuste al corpus de proyección: el micro F1 de 0,8810 sobre el test plateado no debe interpretarse como una medida de precisión, sino como una medida de concordancia con el proceso de proyección.
- Entrenamiento restringido a oraciones con entidades: el modelo nunca ha visto textos sin o con pocas entidades, por lo que su comportamiento en noticias breves, texto conversacional o documentos técnicos sin nombres propios es impredecible.
- Sesgos potenciales debidos a la composición del corpus: al no disponerse de documentación sobre la distribución geográfica, temporal o temática del corpus, el modelo podría favorecer ciertos dominios o variantes del mizo, lo que puede derivar en errores de identificación en otros contextos.
- Riesgo de alucinación en la asignación de entidades: aunque es un clasificador de tokens y no un generador, puede producir etiquetas incorrectas para tokens que no son entidades, especialmente en textos sin supervisión.
- Restricciones de licencia: CC-BY-4.0 permite el uso comercial con atribución adecuada, pero exige citar a los autores y no impone restricciones adicionales a las indicadas en la licencia.
- No se han evaluado otras tareas (como análisis de sentimiento o clasificación de texto); su uso fuera de NER no está respaldado por evidencia.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/haulai/mizo-ner-mbert
- Dataset de entrenamiento: https://huggingface.co/datasets/haulai/mizo-ner
- Repositorio de código (según la cita del autor): https://github.com/thangkhanhau/mizo-ner
- Modelo `robzchhangte/MizBERT` (citado en la búsqueda, sin relación directa): https://huggingface.co/robzchhangte/MizBERT
