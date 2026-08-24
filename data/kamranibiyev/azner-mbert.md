# kamranibiyev/azNER-mBERT

## Resumen

azNER-mBERT es un modelo de reconocimiento de entidades nombradas (NER) para el idioma azerí, desarrollado por Kamran Ibiyev y Attila Novák. Consiste en una versión de BERT multilingüe (mBERT cased) ajustada sobre el corpus azWikiNER, un conjunto de datos anotado manualmente con 16.740 segmentos de Wikipedia en azerí y 16 categorías de entidades. El modelo fue entrenado en abril de 2021 y su construcción y evaluación se describen en el artículo de TSD 2021 y en la tesis doctoral del autor.

La relevancia de este modelo radica en que cubre una lengua de bajos recursos como el azerí, para la que existen pocos recursos de NER de calidad. Al partir de mBERT, aprovecha el conocimiento multilingüe previo y lo especializa para la tarea de etiquetado de entidades. El modelo alcanza una F1 de 81,77 en el conjunto de test de azWikiNER, con un rendimiento especialmente alto en entidades de tipo GPE (91,67) y PER (85,74). Está disponible bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer) multilingüe con cabecera de clasificación de tokens |
| Parametros totales | No disponible |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada (limitada por el tokenizer BERT, típicamente 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Azerí (az) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo se basa en `google-bert/bert-base-multilingual-cased`, un transformer encoder de 12 capas con representaciones bidireccionales. Sobre esta base se añade una capa de clasificación por token para la tarea de NER. El ajuste fino se realizó con el ejemplo de token-classification de transformers 4.5.0, utilizando 4 GPUs, optimizador AdamW con tasa de aprendizaje 1e-4 y decaimiento lineal, sin warmup ni weight decay, batch size efectivo de 32 (8 por dispositivo), precisión mixta fp16, semilla 42 y 4 épocas. El corpus azWikiNER se dividió en 13.483 segmentos de entrenamiento, 1.639 de desarrollo y 1.618 de test. Las categorías de entidades incluyen CARDINAL, EVENT, FAC, GPE, LOC, MONEY, NORP, ORDINAL, ORG, PER, PERCENT, PROD, QUANTITY, TIME, WORK_OF_ART y TITLE. Las categorías numéricas y de fechas se incorporaron mediante un paso de transferencia zero-shot desde OntoNotes con reglas de fusión, por lo que su verificación humana es menos exhaustiva que la del resto.

## Capacidades

- Reconocimiento de entidades nombradas en texto azerí, con 16 categorías semánticas (personas, lugares, organizaciones, fechas, cantidades, obras de arte, títulos profesionales, etc.).
- Clasificación de tokens a nivel de palabra o subpalabra, con estrategia de agregación simple para obtener entidades completas.
- Soporte para inferencia mediante la pipeline `token-classification` de Hugging Face.
- Funciona exclusivamente con texto en azerí; no se han documentado capacidades multilingües adicionales.
- No incluye generación de texto, razonamiento, tool calling, ni capacidades de agente.

## Casos de uso

- Extracción de entidades en artículos periodísticos en azerí: permite identificar automáticamente personas, lugares y organizaciones mencionadas en noticias, facilitando tareas de indexación y análisis de contenido.
- Procesamiento de documentos legales o administrativos: localización de nombres propios, fechas y cantidades en contratos o formularios, útil para automatizar la gestión documental.
- Análisis de redes sociales en azerí: detección de menciones a marcas, productos o figuras públicas en publicaciones de Twitter o Facebook, para monitorización de marca.
- Construcción de bases de conocimiento: extracción de entidades de corpus de Wikipedia en azerí para poblar grafos de conocimiento o sistemas de pregunta-respuesta.
- Enriquecimiento de motores de búsqueda: anotación de entidades en documentos para mejorar la relevancia de búsquedas por entidad.
- Asistencia a traductores automáticos: identificación de entidades que deben preservarse sin traducir, mejorando la coherencia de la traducción.

## Benchmarks y rendimiento

Resultados a nivel de entidad en el conjunto de test de azWikiNER (1.618 segmentos), calculados con el script estándar conlleval:

| Tagset | Precision | Recall | F1 |
|--------|-----------|--------|-----|
| Completo (16 tipos) | 80,48 | 83,09 | 81,77 |
| Común (15 tipos compartidos con modelos zero-shot OntoNotes) | 81,70 | 84,10 | 82,89 |

F1 por tipo en el test (tagset completo):

| Tipo | Span dorados | F1 |
|------|-------------|-----|
| GPE | 1354 | 91,67 |
| PER | 519 | 85,74 |
| LOC | 254 | 68,14 |
| ORG | 248 | 70,14 |
| TITLE | 210 | 66,51 |
| CARDINAL | 146 | 79,35 |
| TIME | 131 | 81,04 |
| WORK_OF_ART | 55 | 52,00 |
| FAC | 52 | 49,06 |
| NORP | 46 | 56,25 |
| EVENT | 37 | 72,22 |
| ORDINAL | 34 | 81,16 |
| QUANTITY | 29 | 80,00 |
| PERCENT | 10 | 90,00 |
| MONEY | 8 | 31,58 |
| PROD | 8 | 26,67 |

La desviación entre ejecuciones se estima en torno a 0,2 puntos de F1 (una ejecución anterior alcanzó 81,56). La F1 en el conjunto de desarrollo (seqeval) es 82,04.

## Requisitos de hardware

No se han publicado requisitos específicos de hardware para este modelo. Al tratarse de un BERT base, es razonable esperar que pueda ejecutarse en CPU o en GPUs con poca memoria (por ejemplo, 4-8 GB de VRAM), pero no se dispone de cifras oficiales de latencia o throughput. Para despliegue en producción se podría utilizar vLLM, Hugging Face Inference Endpoints o un servidor basado en ONNX, aunque no hay documentación al respecto.

## Comparativa con modelos similares

Existe otro modelo de NER para azerí, `IsmatS/mbert-az-ner`, también basado en mBERT, pero no se dispone de datos comparativos detallados (parámetros, contexto, rendimiento) en la información proporcionada. Por tanto, no es posible realizar una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con texto de Wikipedia, por lo que su precisión puede degradarse en otros géneros textuales (noticias, conversaciones, textos técnicos).
- Las categorías numéricas y de fechas (CARDINAL, ORDINAL, TIME, MONEY, PERCENT, QUANTITY) se incorporaron mediante un proceso zero-shot con verificación humana parcial, por lo que sus puntuaciones deben interpretarse con cautela.
- No existe una etiqueta DATE separada; las fechas se clasifican bajo TIME.
- Los textos de entrada se truncan al límite del tokenizer (típicamente 512 tokens), por lo que entidades en segmentos largos pueden perderse.
- El modelo solo soporta azerí; no se ha evaluado su comportamiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del corpus azWikiNER (disponible en Zenodo) para posibles restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kamranibiyev/azNER-mBERT
- Artículo TSD 2021: https://doi.org/10.1007/978-3-030-83527-9_26
- Dataset azWikiNER: https://doi.org/10.5281/zenodo.22019336
- Modelo base mBERT: https://huggingface.co/google-bert/bert-base-multilingual-cased
