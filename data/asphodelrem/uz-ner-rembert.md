# AsphodelRem/uz-ner-rembert

## Resumen

uz-ner-rembert es un modelo de reconocimiento de entidades nombradas (NER) para texto en uzbeko, desarrollado por AsphodelRem (Mikhail Komarov). Está construido sobre el modelo RemBERT de Google, al que se le aplicó una fase de adaptación de dominio mediante enmascaramiento de lenguaje sobre un corpus uzbeko de unos 220 millones de tokens, seguida de un ajuste fino para clasificación de tokens en esquema BILOU. El modelo identifica tres tipos de entidades: organizaciones (ORG), personas (NAME) y ubicaciones (GEO), con offsets de caracteres exactos, lo que permite un emparejamiento preciso de los spans. Además, maneja escritura latina y cirílica, así como fragmentos en ruso e inglés, lo que lo hace útil para entornos multilingües en Uzbekistán. Su relevancia actual radica en la creciente necesidad de extraer información estructurada de fuentes en uzbeko, como noticias y redes sociales, para tareas de monitorización y analítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RemBERT) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uz, ru, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 2.3 GB) |

## Arquitectura y entrenamiento

El modelo se basa en RemBERT, un transformer encoder preentrenado por Google con embeddings invertibles y reajuste de vocabulario. Sobre este modelo base se realizó una adaptación de dominio mediante MLM (masked language modeling) con whole-word masking al 15%, sobre un corpus de 405,585 pasajes (~220M tokens) compuesto por blogs de Telegram y noticias de `tahrirchi/uz-crawl`, libros en cirílico y latino de `tahrirchi/uz-books-v2`, y un 8% de Wikipedia rusa e inglesa para preservar el multilingüismo. El preentrenamiento se ejecutó durante 16,800 pasos, alcanzando una perplejidad held-out de 11.5. Posteriormente, se realizó un ajuste fino para clasificación de tokens en esquema BILOU, con ventana de 512 tokens y stride 128, batch efectivo de 128, learning rate de 3e-5 y selección del checkpoint por exact-span micro-F1. Una innovación destacable es que la decodificación de etiquetas requiere una matriz de transición almacenada en `transitions.json` y un algoritmo Viterbi en modo `conditional`, además de un post-procesamiento de límites (comillas, corchetes, afijos). Este mecanismo no es estándar en HuggingFace, por lo que el uso directo de `AutoModelForTokenClassification` daría resultados subóptimos.

## Capacidades

- Clasificación de tokens para NER con tres clases: ORG (organizaciones y marcas), NAME (personas) y GEO (entidades geográficas).
- Offsets de caracteres exactos (start y end con Unicode) para cada entidad, lo que permite emparejar spans de forma precisa.
- Soporte para escritura latina y cirílica en uzbeko.
- Capacidad de procesar fragmentos en ruso e inglés.
- Decodificación BILOU con algoritmo Viterbi para mejorar la coherencia de las secuencias de etiquetas.
- Configuración de inferencia específica (ventana 512 con stride 128) para documentos largos.

## Casos de uso

- Monitorización de medios en Uzbekistán: extraer personas, organizaciones y lugares de artículos de noticias para calcular frecuencia y co-ocurrencia de entidades.
- Análisis de redes sociales (Telegram): identificar entidades en publicaciones de blogs de Telegram para detectar tendencias y menciones de marcas.
- Construcción de índices de entidades: crear un índice que mapee menciones a posiciones exactas en el texto fuente, útil para búsquedas y análisis de corpus.
- Análisis de reputación de marcas: combinado con clasificación de sentimiento, rastrear menciones de organizaciones en noticias y redes.
- Periodismo de datos: automatizar la identificación de actores y ubicaciones en notas periodísticas para visualizaciones.
- Digitalización de textos históricos en cirílico: extraer entidades de libros uzbekos en escritura cirílica para archivos digitales.
- Integración en pipelines de NLP para uzbeko: usar como componente de un sistema más amplio de análisis de texto.

## Benchmarks y rendimiento

Resultados sobre un conjunto held-out de 1500 documentos y 7698 entidades, con emparejamiento exacto de clase y límites:

| Clase | Precisión | Recall | F1 |
|-------|-----------|--------|------|
| ORG | 0.8872 | 0.8665 | 0.8767 |
| NAME | 0.9182 | 0.8814 | 0.8994 |
| GEO | 0.9153 | 0.9096 | 0.9124 |
| **micro** | **0.9065** | **0.8862** | **0.8962** |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El repositorio pesa 2.3 GB, lo que sugiere que los pesos podrían cargarse en una GPU de consumo medio, pero no hay confirmación oficial.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño, pero no confirmado.
- Opciones de despliegue: el autor recomienda ejecutar mediante el script `python -m solution.predict` desde el repositorio de la solución. No se recomienda el uso directo de `AutoModelForTokenClassification` sin la matriz de transición.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información proporcionada. El modelo podría compararse con otros sistemas de NER para uzbeko, pero no se dispone de datos de benchmarks de esos modelos en la búsqueda realizada.

## Limitaciones y advertencias

- Entrenado únicamente en texto de noticias y blogs; otros géneros (literarios, legales, técnicos) no fueron evaluados.
- Los pesos por sí solos no son suficientes: la matriz de transición en `transitions.json` es necesaria para obtener el rendimiento reportado. Sin ella, el F1 cae aproximadamente un punto.
- El uso de `AutoModelForTokenClassification.from_pretrained` es inadecuado para este modelo, ya que ignora `transitions.json` y el post-procesamiento de límites.
- Posibles sesgos derivados del corpus de adaptación (Telegram y noticias) y del dataset anotado de Brand Analytics, que podrían limitar la generalización.
- Riesgo de falsos positivos inherente a cualquier modelo de NER, especialmente en dominios no vistos.
- Licencia Apache 2.0 permite uso comercial, pero las licencias de los corpus subyacentes (`tahrirchi/uz-crawl`, `tahrirchi/uz-books-v2`, `wikimedia/wikipedia`) deben tenerse en cuenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AsphodelRem/uz-ner-rembert
- Documentación de RemBERT en HuggingFace: https://huggingface.co/docs/transformers/model_doc/rembert
- Perfil del autor en HuggingFace: https://huggingface.co/AsphodelRem
