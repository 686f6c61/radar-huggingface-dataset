# kamranibiyev/azNER-xlmr

## Resumen

El modelo `kamranibiyev/azNER-xlmr` es un sistema de reconocimiento de entidades nombradas (NER) para el idioma azerí, desarrollado por Kamran Ibiyev. Se basa en el modelo multilingüe XLM-RoBERTa base, fine-tuneado sobre el corpus azWikiNER, un conjunto de datos de 16.740 segmentos de Wikipedia en azerí anotados manualmente con 16 categorías de entidades. El modelo está diseñado para la clasificación de tokens y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en que cubre un idioma de bajos recursos como el azerí, para el cual existen pocas herramientas de NER de calidad. El entrenamiento se realizó en abril de 2021 y los resultados publicados muestran un F1 de 81,77 en el conjunto de prueba completo, con un rendimiento especialmente alto en entidades geopolíticas (GPE) y personas (PER). El modelo se publica en Hugging Face con el pipeline de token-classification, listo para usar con la librería `transformers`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el tokenizador XLM-R) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | azerí (az) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 1,1 GB, probablemente PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa base, un transformer encoder multilingüe preentrenado con masked language modeling en 100 idiomas. Sobre esta base se añade una cabeza de clasificación de tokens para NER, con 16 categorías de entidades más dos clases vestigiales que no aparecen en la práctica. El fine-tuning se realizó con el script de token-classification de `transformers` 4.5.0, utilizando 4 GPUs, optimizador AdamW con tasa de aprendizaje 1e-4 y decaimiento lineal, sin warmup ni weight decay, batch size efectivo de 32, precisión mixta fp16, semilla 42 y 6 épocas. Los datos se dividieron en 13.483 segmentos de entrenamiento, 1.639 de validación y 1.618 de prueba.

El corpus azWikiNER se construyó mediante una combinación de transferencia zero-shot desde modelos OntoNotes y corrección manual, lo que explica que las categorías numéricas y de fechas tengan una verificación menos exhaustiva. El entrenamiento se documenta en el artículo de Ibiyev y Novák (TSD 2021) y en la tesis doctoral del autor.

## Capacidades

- Reconocimiento de entidades nombradas en azerí con 16 categorías: CARDINAL, EVENT, FAC, GPE, LOC, MONEY, NORP, ORDINAL, ORG, PER, PERCENT, PROD, QUANTITY, TIME, WORK_OF_ART y TITLE.
- Clasificación de tokens a nivel de palabra o subpalabra, con soporte para agregación de entidades mediante `aggregation_strategy="simple"` en el pipeline de Hugging Face.
- Funciona como modelo de token-classification estándar, integrable en pipelines de procesamiento de lenguaje natural.
- No incluye capacidades de generación de texto, razonamiento, tool calling ni soporte para agentes.
- Multilingüe solo en el sentido de que el modelo base fue preentrenado en 100 idiomas, pero el fine-tuning es exclusivo para azerí.

## Casos de uso

- Extracción de entidades en artículos de Wikipedia en azerí: el modelo puede identificar personas, lugares, organizaciones y otros tipos de entidades en textos enciclopédicos, facilitando la construcción de bases de conocimiento.
- Procesamiento de noticias y artículos periodísticos en azerí: permite extraer automáticamente protagonistas, ubicaciones y fechas para sistemas de resumen o indexación.
- Análisis de documentos legales o administrativos en azerí: identificación de nombres propios, instituciones y cantidades monetarias para automatizar tareas de gestión documental.
- Construcción de grafos de conocimiento para el azerí: al extraer entidades y sus tipos, se pueden poblar bases de datos semánticas para búsqueda y recomendación.
- Sistemas de atención al cliente en azerí: extracción de entidades en conversaciones o tickets para enrutar consultas o extraer información relevante.
- Investigación lingüística y desarrollo de recursos para idiomas de bajos recursos: sirve como punto de partida para mejorar otros sistemas de NER en azerí o para transferir conocimiento a idiomas vecinos.

## Benchmarks y rendimiento

Resultados a nivel de entidad en el conjunto de prueba de azWikiNER (1.618 segmentos), calculados con el script estándar `conlleval`:

| Tagset | Precision | Recall | F1 |
|--------|-----------|--------|-----|
| Completo (16 tipos) | 80,21 | 83,38 | 81,77 |
| Común (15 tipos compartidos con modelos zero-shot OntoNotes) | 81,30 | 84,37 | 82,81 |

F1 por tipo de entidad en el conjunto de prueba (tagset completo):

| Tipo | Span dorados | F1 |
|------|-------------|-----|
| GPE | 1354 | 92,05 |
| PER | 519 | 86,45 |
| LOC | 254 | 66,93 |
| ORG | 248 | 68,95 |
| TITLE | 210 | 67,44 |
| CARDINAL | 146 | 77,74 |
| TIME | 131 | 77,61 |
| WORK_OF_ART | 55 | 43,64 |
| FAC | 52 | 57,41 |
| NORP | 46 | 55,77 |
| EVENT | 37 | 81,16 |
| ORDINAL | 34 | 81,69 |
| QUANTITY | 29 | 81,36 |
| PERCENT | 10 | 100,00 |
| MONEY | 8 | 40,00 |
| PROD | 8 | 16,67 |

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de hardware en la documentación del modelo.
- Al tratarse de un modelo basado en XLM-RoBERTa base (aproximadamente 278 millones de parámetros, aunque no se confirma en la ficha), la inferencia puede ejecutarse en GPUs de consumo medio, como una NVIDIA GTX 1080 Ti o superior, con al menos 6 GB de VRAM.
- Para despliegue en producción, se recomienda usar `transformers` con PyTorch, o servidores de inferencia como vLLM o TGI, aunque no se mencionan en la documentación.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para NER en azerí en la documentación proporcionada. El modelo se posiciona como una opción de referencia para este idioma, pero no se pueden establecer comparaciones cuantitativas con alternativas sin datos adicionales.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con texto de Wikipedia, por lo que su rendimiento puede degradarse en otros géneros textuales como lenguaje coloquial, técnico o legal.
- Las categorías numéricas y de fechas (CARDINAL, TIME, MONEY, PERCENT, QUANTITY, ORDINAL) se incorporaron mediante un paso zero-shot con reglas de fusión, sin verificación humana exhaustiva; los resultados en estos tipos deben interpretarse con cautela.
- Los inputs largos se truncan en el límite del tokenizador, lo que puede perder entidades en textos extensos.
- No existe una etiqueta DATE separada; las fechas se incluyen dentro de TIME.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del corpus azWikiNER (Zenodo) para posibles restricciones adicionales.
- El modelo no soporta otros idiomas más allá del azerí en su fine-tuning, aunque el modelo base sea multilingüe.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/kamranibiyev/azNER-xlmr
- Dataset azWikiNER (Zenodo): https://doi.org/10.5281/zenodo.22019336
- Artículo TSD 2021: doi:10.1007/978-3-030-83527-9_26
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
