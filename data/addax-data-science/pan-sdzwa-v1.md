# Addax-Data-Science/PAN-SDZWA-v1

## Resumen

PAN-SDZWA-v1 es un repositorio de modelos de vision por computador redistribuido por Addax Data Science para su integración en AddaxAI, su plataforma de análisis de imágenes de fauna. El desarrollo original corresponde a San Diego Zoo Wildlife Alliance, a través de su Conservation Tech Lab. No se trata, por tanto, de un modelo de lenguaje, sino de un conjunto de pesos orientados a tareas de detección o clasificación de fauna salvaje en imágenes de cámaras trampa.

El repositorio tiene un tamaño de 0,4 GB, lo que sugiere pesos relativamente ligeros, compatibles con despliegue en entornos de campo o hardware modesto. La model card no especifica arquitectura, número de parámetros, resolución de entrada ni composición del dataset de entrenamiento, por lo que la mayoría de especificaciones técnicas deben marcarse como no disponibles.

La relevancia de esta ficha es limitada para el público general de modelos fundacionales: se trata de un artefacto de redistribución con licencia restringida, sin licencia publicada por el desarrollador original y sin métricas de rendimiento públicas en la información disponible. Resulta útil únicamente como referencia para quienes trabajen con AddaxAI o con pipelines de conservación de fauna.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin licencia publicada por el desarrollador original; redistribución autorizada solo para AddaxAI) |
| Formato de pesos | no disponible (tamaño de repo: 0,4 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo en la documentación proporcionada. El repositorio no incluye detalles sobre el tipo de red (CNN, detector tipo YOLO, clasificador basado en transformer visual u otra familia), ni sobre el número de parámetros, la resolución de entrada o las capas de salida.

Tampoco se documentan los datos de entrenamiento: no consta el número de imágenes, la composición del dataset, las especies cubiertas, el origen de las anotaciones ni si se aplicaron técnicas de aumento de datos, ajuste fino o validación cruzada. La model card se limita a indicar la autoría (San Diego Zoo Wildlife Alliance), el propósito de redistribución para AddaxAI y las condiciones de licencia.

## Capacidades

- Procesamiento de imágenes orientado a conservación de fauna, según el contexto del repositorio y del proyecto AddaxAI.
- Integración prevista con la plataforma AddaxAI para análisis automatizado de imágenes de cámaras trampa.
- No consta soporte de tool calling, function calling ni razonamiento multi-paso.
- No consta capacidad multilingüe (no es un modelo de lenguaje).
- No consta modo thinking, visión general, audio ni otras capacidades especiales más allá del uso previsto en AddaxAI.
- Cualquier otra capacidad específica (detección, clasificación, segmentación, conteo) debe considerarse no disponible en la información proporcionada.

## Casos de uso

- Análisis de cámaras trampa en proyectos de conservación: el modelo se integraría en AddaxAI para procesar lotes de imágenes capturadas en campo y reducir la revisión manual por parte de biólogos y guardas.
- Monitorización de fauna en reservas y parques: adecuado para pipelines donde ya se utiliza AddaxAI y se requiere un modelo preentrenado por un socio conservacionista con experiencia en el dominio.
- Investigación académica en ecología: útil como componente de referencia para comparar detecciones o clasificaciones frente a otros modelos dentro del ecosistema AddaxAI.
- Despliegue en entornos con recursos limitados: el tamaño de 0,4 GB del repositorio sugiere viabilidad en estaciones de campo o equipos sin GPU de altas prestaciones, aunque la arquitectura exacta no está documentada.
- Automatización de inventarios de biodiversidad: integrable en flujos que requieran prefiltrar imágenes antes de la revisión experta, siempre que se respete la licencia.
- Evaluación interna de modelos de conservación: puede servir como baseline en pruebas comparativas dentro de organizaciones que ya colaboran con San Diego Zoo Wildlife Alliance o Addax Data Science.
- No se recomienda su uso fuera del contexto AddaxAI sin contactar previamente con el desarrollador original, dada la ausencia de licencia publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,4 GB) sugiere que los pesos caben en GPUs de gama baja, pero no se especifica el consumo real en memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamaño del repo, pero no confirmada en la documentación.
- Opciones de despliegue: no disponible; el uso previsto es a través de AddaxAI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (visión para fauna en cámaras trampa) ni métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia de licencia publicada por el desarrollador original: los pesos se redistribuyen solo con permiso para AddaxAI; cualquier otro uso requiere contactar con San Diego Zoo Wildlife Alliance.
- La licencia "other" del repositorio no aclara los términos de uso comercial, modificación o redistribución derivada.
- No se documentan sesgos conocidos, pero al no conocerse el dataset de entrenamiento no puede descartarse un sesgo hacia especies, hábitats o condiciones de iluminación sobrerrepresentadas.
- Riesgo de alucinación o falsos positivos/negativos no cuantificado: no hay métricas publicadas de precisión, recall ni mAP.
- Limitaciones de idioma no aplicables (no es un modelo lingüístico), pero sí posibles limitaciones de dominio (especies, regiones geográficas, calidad de imagen).
- Para producción, es imprescindible validar el modelo en el conjunto de datos propio y revisar los archivos de licencia incluidos en el repositorio antes de cualquier despliegue.
- La model card no proporciona instrucciones de uso, formato de entrada/salida ni ejemplos de inferencia, lo que dificulta su integración fuera de AddaxAI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Addax-Data-Science/PAN-SDZWA-v1
- AddaxAI: https://addaxdatascience.com/addaxai/
- Addax Data Science: https://addaxdatascience.com/
- Conservation Tech Lab (San Diego Zoo Wildlife Alliance): https://github.com/conservationtechlab
