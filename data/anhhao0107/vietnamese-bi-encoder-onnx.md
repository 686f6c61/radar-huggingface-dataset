# AnhHao0107/vietnamese-bi-encoder-onnx

## Resumen

El modelo `AnhHao0107/vietnamese-bi-encoder-onnx` es una conversión a formato ONNX del modelo `bkai-foundation-models/vietnamese-bi-encoder`, desarrollado por BKAI (Vietnam) y convertido por AnhHao0107. Se trata de un bi-encoder de frases basado en la arquitectura PhoBERT-base-v2 (RoBERTa), que mapea frases y párrafos a un vector denso de 768 dimensiones. Está diseñado específicamente para el idioma vietnamita y resuelve tareas de similitud semántica, búsqueda semántica y clustering.

La relevancia de esta versión ONNX radica en su optimización para despliegue en producción, ya que el formato ONNX permite inferencia con mayor eficiencia en CPU y GPU, y es compatible con herramientas como Triton Inference Server o ONNX Runtime. El modelo original fue entrenado con un conjunto de datos combinado que incluye MS Macro, SQuAD v2 y el 80% del conjunto de entrenamiento del reto Legal Text Retrieval Zalo 2021, lo que le confiere un buen rendimiento en recuperación de información jurídica y general. La ventana de contexto es de 256 tokens y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PhoBERT-base-v2 (RoBERTa) con pooling medio (mean pooling) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (formato ONNX sin cuantización especificada) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un bi-encoder de la librería `sentence-transformers`, compuesto por un transformer PhoBERT-base-v2 (modelo `RobertaModel`) seguido de un pooling de tipo `mean_tokens`. El pooling promedia los embeddings de todos los tokens, teniendo en cuenta la máscara de atención, para obtener el vector de frase de 768 dimensiones. El entrenamiento original se realizó con la pérdida `MultipleNegativesRankingLoss` con escala 20 y similitud coseno. Los datos de entrenamiento fueron: MS Macro traducido al vietnamita, SQuAD v2 traducido y el 80% del conjunto de entrenamiento del desafío Legal Text Retrieval Zalo 2021. Se usó un optimizador AdamW con tasa de aprendizaje 2e-5, 15 épocas, tamaño de batch 32 y un total de 17 584 pasos. No se aplicó RLHF ni DPO; es un entrenamiento supervisado de similitud. La versión ONNX es una conversión del modelo original para facilitar el despliegue, sin cambios en los pesos.

## Capacidades

- Generación de embeddings de frases de 768 dimensiones para similitud semántica.
- Búsqueda semántica: recuperación de documentos relevantes dada una consulta.
- Clustering de textos: agrupación de frases o documentos por similitud.
- Detección de duplicados o de textos similares.
- Soporte de tareas de recuperación de información en dominios específicos como textos jurídicos.
- Funciona con la librería `sentence-transformers` y con `transformers` mediante pooling manual.
- Requiere segmentación de palabras vietnamita antes de la tokenización (el modelo no la realiza automáticamente en la versión original; la versión ONNX hereda este requisito).

## Casos de uso

- **Búsqueda semántica en documentos jurídicos**: el modelo fue entrenado parcialmente con datos de recuperación de textos legales, por lo que es adecuado para buscar precedentes o artículos legales en vietnamita a partir de una consulta en lenguaje natural.
- **Sistemas de preguntas y respuestas**: dado un corpus de respuestas, se puede usar el modelo para recuperar la respuesta más relevante a una pregunta, aprovechando la similitud coseno entre embeddings.
- **Clustering de noticias**: agrupar artículos de prensa vietnamita por temas o eventos similares usando los embeddings generados.
- **Deduplicación de contenidos**: detectar textos duplicados o casi duplicados en bases de datos o repositorios de documentos, útil para limpieza de datos.
- **Recomendación de contenidos**: en plataformas de lectura, se puede recomendar artículos similares calculando la similitud entre el artículo actual y los candidatos.
- **Análisis de encuestas o comentarios**: agrupar respuestas abiertas en categorías semánticas para su posterior análisis cualitativo.

## Benchmarks y rendimiento

El modelo original fue evaluado sobre el 20% del conjunto de prueba del desafío Legal Text Retrieval Zalo 2021. Los resultados se muestran a continuación, comparando con otros modelos:

| Modelo | Training datasets | Acc@1 | Acc@10 | Acc@100 | Pre@10 | MRR@10 |
|---|---|---|---|---|---|---|
| Vietnamese-SBERT (keepitreal/vietnamese-sbert) | - | 32.34 | 52.97 | 89.84 | 7.05 | 45.30 |
| PhoBERT-base-v2 | MSMACRO | 47.81 | 77.19 | 92.34 | 7.72 | 58.37 |
| PhoBERT-base-v2 (modelo original) | MSMACRO + SQuADv2.0 + 80% Zalo | 73.28 | 93.59 | 98.85 | 9.36 | 80.73 |

No se han publicado resultados de benchmarks específicos para la versión ONNX, pero se espera que sean equivalentes al modelo original, ya que la conversión no altera los pesos.

## Requisitos de hardware

- No se han proporcionado requisitos específicos para la versión ONNX. Dado que el tamaño del repositorio es de 0.5 GB, el modelo puede ejecutarse en CPU con un uso moderado de memoria (aprox. 1-2 GB en FP32) y en GPU con al menos 1 GB de VRAM.
- Se recomienda usar ONNX Runtime para inferencia, que permite aceleración por CPU y GPU.
- Para despliegue en producción, se puede usar Triton Inference Server o FastAPI, como se muestra en el repositorio de despliegue (ver enlaces).
- El modelo es ligero y no requiere hardware de alta gama; una GPU como una NVIDIA T4 o incluso una CPU moderna es suficiente para inferencia en tiempo real.

## Comparativa con modelos similares

La tabla de benchmarks anterior ya compara con dos alternativas: `Vietnamese-SBERT` y `PhoBERT-base-v2` sin entrenamiento específico. Además, se puede comparar con el modelo original `bkai-foundation-models/vietnamese-bi-encoder`, que es la base de esta versión ONNX. La diferencia principal es el formato: la versión ONNX está optimizada para despliegue, mientras que la versión original usa `sentence-transformers` directamente. En cuanto a rendimiento, el modelo supera ampliamente a Vietnamese-SBERT y a PhoBERT-base-v2 sin entrenamiento, con una mejora notable en Acc@1 y MRR@10.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para vietnamita; no soporta otros idiomas.
- La longitud máxima de secuencia es 256 tokens, por lo que textos más largos se truncarán, perdiendo información.
- Requiere segmentación de palabras vietnamitas antes de la tokenización. Si se usa el widget de Hugging Face, esta segmentación se aplica automáticamente, pero en código manual hay que usar herramientas como `pyvi`, `underthesea` o `RDRSegment`.
- El modelo puede tener sesgos presentes en los datos de entrenamiento (traducciones automáticas de MS Macro y SQuAD, y textos jurídicos de Zalo), lo que puede afectar la precisión en dominios no representados.
- Riesgo de alucinación en tareas de generación no aplica, pero en búsqueda semántica puede devolver resultados irrelevantes si la consulta está fuera del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda citar el manuscrito original según la model card.

## Enlaces

- [Modelo ONNX en HuggingFace](https://huggingface.co/AnhHao0107/vietnamese-bi-encoder-onnx)
- [Modelo original en HuggingFace](https://huggingface.co/bkai-foundation-models/vietnamese-bi-encoder)
- [Repositorio de despliegue (Triton + FastAPI)](https://github.com/hungnq1310/vietnamese-bi-encoder)
- [Paper de referencia (arXiv:2403.01616)](https://arxiv.org/abs/2403.01616)
