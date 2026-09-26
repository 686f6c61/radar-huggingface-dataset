# segmue/geo-distiluse-swissnames3d-config1

## Resumen

geo-distiluse-swissnames3d-config1 es un modelo de embeddings de frases (sentence-transformer) especializado en la resolución de topónimos (toponym resolution) contra el gazetteer suizo swissNAMES3D. Lo desarrolla el usuario segmue en el marco de una tesis de máster de la Universidad de Zúrich (2026) titulada *Describing Places by Their Surroundings: Enriching Candidate Descriptions with Spatial Context for Toponym Resolution*, y está pensado para integrarse con el geoparser Irchel, en la misma línea del modelo dguzh/geo-all-MiniLM-L6-v2.

El modelo parte de sentence-transformers/distiluse-base-multilingual-cased-v1, un sentence-transformer basado en DistilBERT, y se ajusta sobre artículos de prensa suiza en alemán. Su aportación concreta es que las descripciones de candidatos se enriquecen con contexto espacial procedente del resolvedor ma-geoparser-h3-resolver, usando la discretización config1 (solapamiento H3 con resolución máxima 13). Esta variante corresponde al escenario M4 de la tesis.

Se trata de un modelo pequeño (134.734.080 parámetros, repo de 0,5 GB), monolingüe en alemán y con licencia Apache-2.0, orientado a una tarea muy específica: dado un topónimo mencionado en un texto, recuperar y rankear el candidato correcto del gazetteer mediante similitud semántica entre la frase y las descripciones de candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sentence-transformer basado en DistilBERT (sentence-transformers) |
| Parametros totales | 134.734.080 (aprox. 134,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente precision completa; el repo ocupa 0,5 GB) |
| Idiomas soportados | Aleman (de) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de un sentence-transformer de la librería sentence-transformers, construido sobre DistilBERT (según las etiquetas del repositorio) y derivado del modelo base sentence-transformers/distiluse-base-multilingual-cased-v1. El modelo produce embeddings de frase que se comparan por similitud semántica (pipeline `sentence-similarity`) para resolver topónimos. No se dispone de detalles adicionales sobre número de capas, dimensión de embedding o longitud máxima de secuencia en la información proporcionada.

El ajuste se realizó sobre 8.255 pares de texto y descripción, con pérdida contrastiva, tasa de aprendizaje 1e-5 y 2 épocas. Los datos de partida son artículos de prensa suiza en alemán (no se detalla el número de tokens ni la composición exacta del corpus). La innovación principal no está en la arquitectura sino en la construcción de los candidatos: las descripciones se enriquecen con contexto espacial del resolvedor ma-geoparser-h3-resolver, con la discretización config1 (solapamiento H3, resolución máxima 13). El gazetteer de referencia es swissNAMES3D, de swisstopo, con más de 490.000 entradas georreferenciadas según la fuente oficial (437.000 según el portal INSPIRE). El código de entrenamiento y evaluación está en el repositorio ma-experiments.

## Capacidades

- Generación de embeddings de frases y oraciones para similitud semántica (pipeline `sentence-similarity`).
- Resolución de topónimos: emparejar menciones de lugares en texto con entradas del gazetteer swissNAMES3D.
- Geoparsing en combinación con el Irchel Geoparser y con el resolvedor espacial ma-geoparser-h3-resolver.
- Procesamiento de texto en alemán, en particular prensa suiza.
- Uso de contexto espacial discretizado con H3 (config1, resolución máxima 13) para enriquecer las descripciones de candidatos.
- Integración con Text Embeddings Inference (etiqueta `text-embeddings-inference`) y compatibilidad con endpoints gestionados.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni modo de razonamiento: es exclusivamente un modelo de representación vectorial.

## Casos de uso

- Geoparsing de prensa suiza en alemán: dado un artículo, detectar menciones de lugares y resolver cada una contra swissNAMES3D usando similitud entre la frase y las descripciones enriquecidas con contexto espacial.
- Enriquecimiento de archivos periodísticos: asignar coordenadas y entradas del gazetteer a colecciones históricas de noticias en alemán para su explotación geográfica.
- Monitorización de medios a escala regional: indexar noticias por lugar mencionado para análisis de cobertura territorial en Suiza y Liechtenstein.
- Sistemas de información geográfica (SIG): desambiguar topónimos ambiguos (por ejemplo, nombres repetidos en distintos cantones) usando el contexto espacial H3 como señal de ranking.
- Vinculación de entidades geográficas en pipelines de datos abiertos: normalizar nombres de lugares procedentes de fuentes heterogéneas contra un gazetteer oficial.
- Búsqueda semántica geográfica: construir un índice vectorial de descripciones de lugares y recuperar candidatos por similitud para consultas en lenguaje natural en alemán.
- Apoyo a tareas de logística o planificación territorial: resolver menciones de lugares en documentos internos en alemán para geolocalizarlas automáticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los parámetros): aproximadamente 0,54 GB en fp32, 0,27 GB en fp16 y 0,13 GB en int8, sin contar memoria para lotes y tokenización.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4090 o similar funciona con holgura.
- Sí cabe en GPU de consumo: cabe incluso en GPUs integradas y en CPU.
- Opciones de despliegue: sentence-transformers (librería nativa), Text Embeddings Inference (etiqueta del repositorio), endpoints compatibles con la infraestructura de Hugging Face, y otras pilas de embeddings compatibles con safetensors. No se documentan instrucciones específicas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El tamaño reducido del modelo (134,7 M de parámetros) sugiere tiempos de inferencia bajos en GPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Escenario | Descripcion de candidatos | Parametros | Idioma | Licencia |
|---|---|---|---|---|---|
| geo-distiluse-swissnames3d-config1 (este) | M4 | Contexto espacial, config1 | 134.734.080 | Aleman (de) | Apache-2.0 |
| geo-distiluse-swissnames3d | M3 | Por defecto | No disponible en la informacion | Aleman (de) | Apache-2.0 |
| geo-distiluse-swissnames3d-config2 | M5 | Contexto espacial, config2 | No disponible en la informacion | Aleman (de) | Apache-2.0 |
| dguzh/geo-all-MiniLM-L6-v2 | Enfoque de referencia | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion |

Los tres modelos de la familia segmue/geo-distiluse-swissnames3d comparten base y planteamiento, y solo se diferencian en la descripción de candidatos (por defecto, contexto espacial config1 o contexto espacial config2). No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe en alemán: no se ha ajustado para otros idiomas, aunque el modelo base sea multilingüe.
- Cobertura geográfica restringida al gazetteer swissNAMES3D (Suiza y Liechtenstein); no resuelve topónimos de otros países.
- El rendimiento depende de la calidad y actualidad de swissNAMES3D (datos de swisstopo), sujetos a sus propias condiciones de uso y atribución.
- No es un modelo generativo: no produce texto ni respuestas, por lo que el riesgo de alucinación se manifiesta como asignación incorrecta de un candidato del gazetteer, no como texto inventado.
- Conjunto de entrenamiento pequeño (8.255 pares) y solo 2 épocas; puede limitar la generalización a dominios distintos de la prensa suiza en alemán.
- Los resultados dependen de la discretización H3 config1 (solapamiento, resolución máxima 13); cambiar de configuración altera el modelo (véanse las variantes config1 y config2).
- No se documentan sesgos específicos en la información disponible.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar por separado las condiciones de los datos del gazetteer swissNAMES3D y del corpus de entrenamiento.
- No hay información publicada sobre longitud de contexto, cuantizaciones soportadas ni métricas de evaluación, lo que dificulta estimar su comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/segmue/geo-distiluse-swissnames3d-config1
- Variante por defecto: https://huggingface.co/segmue/geo-distiluse-swissnames3d
- Variante config2: https://huggingface.co/segmue/geo-distiluse-swissnames3d-config2
- Modelo base: https://huggingface.co/sentence-transformers/distiluse-base-multilingual-cased-v1
- Enfoque de referencia: https://huggingface.co/dguzh/geo-all-MiniLM-L6-v2
- Irchel Geoparser: https://github.com/dguzh/geoparser
- Resolvedor espacial H3: https://github.com/segmue/ma-geoparser-h3-resolver
- Código de entrenamiento y evaluación: https://github.com/segmue/ma-experiments
- swissNAMES3D (swisstopo, EN): https://www.swisstopo.admin.ch/en/landscape-model-swissnames3d
- swissNAMES3D (swisstopo, DE): https://www.swisstopo.admin.ch/de/landschaftsmodell-swissnames3d
- swissNAMES3D en opendata.swiss: https://opendata.swiss/de/dataset/swissnames3d-geografische-namen-der-landesvermessung
- Geographical Names Switzerland (INSPIRE): https://inspire-geoportal.ec.europa.eu/srv/api/records/e81d4df0-52c8-4258-a38b-96f6761c976b
- Extractos GeoJSON de swissNAMES3D: https://swissnames.lukasmartinelli.ch/
