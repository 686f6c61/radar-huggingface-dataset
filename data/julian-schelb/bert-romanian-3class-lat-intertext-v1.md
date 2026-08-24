# julian-schelb/bert-romanian-3class-lat-intertext-v1

## Resumen

El modelo `julian-schelb/bert-romanian-3class-lat-intertext-v1` es un clasificador de secuencias (pares de pasajes) diseñado para detectar y tipificar vínculos intertextuales en literatura latina clásica. Desarrollado por Julian Schelb y colaboradores en el marco del benchmark Loci Similes, este modelo distingue entre tres clases: `no_match` (pasajes no relacionados), `cit` (cita o reutilización léxica cercana) y `cf` (eco temático laxo). Es un fine-tuning del modelo `dumitrescustefan/bert-base-romanian-cased-v1` (BERT-base en rumano) sobre un corpus de intertextualidades entre Jerónimo y otros autores clásicos.

Con 124,4 millones de parámetros y una longitud máxima de contexto de 512 tokens, el modelo está pensado para integrarse en flujos de trabajo filológicos mediante el paquete Python LociSimiles. Su relevancia radica en que automatiza una tarea tradicionalmente manual en humanidades digitales, permitiendo el análisis a gran escala de reutilización textual en latín. La licencia Apache 2.0 facilita su uso académico y comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) |
| Parametros totales | 124.443.651 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT-base (encoder transformer) del modelo `dumitrescustefan/bert-base-romanian-cased-v1`, adaptada para clasificación de pares de secuencias mediante una cabeza de clasificación sobre la representación de la secuencia combinada. El fine-tuning se realizó sobre el benchmark Loci Similes, que incluye pares de pasajes etiquetados como `no_match`, `cit` o `cf`. Según la model card, se empleó una de las cinco particiones de validación cruzada y un muestreo balanceado por clases para compensar el fuerte desequilibrio del corpus real, que es mayoritariamente negativo. No se detallan el número de tokens de entrenamiento ni la composición exacta del dataset, aunque se mencionan tres conjuntos de datos: etiquetas, corpus y consultas.

Una innovación metodológica destacable es el uso de umbrales por clase en lugar de un simple argmax: se aplican umbrales de 0.98 para `cit` y 0.95 para `cf`, con fallback a `no_match` si ninguno supera el umbral. Esta estrategia reduce drásticamente los falsos positivos en corpus desequilibrados, aunque sacrifica recall, especialmente en la clase `cf`, que carece de señal léxica fiable.

## Capacidades

- Clasificación de pares de pasajes latinos en tres categorías: `no_match`, `cit` (cita/reescritura cercana) y `cf` (eco temático).
- Detección de reutilización textual literal y de alusiones temáticas difusas en literatura clásica.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para pasajes breves y medianos.
- Integración con el paquete LociSimiles para pipelines de búsqueda intertextual.
- Compatible con la librería Transformers de Hugging Face (carga estándar con `AutoModelForSequenceClassification`).
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es exclusivamente un clasificador.

## Casos de uso

- Investigación filológica: identificar fuentes clásicas en las obras de Jerónimo mediante la comparación sistemática de pasajes, acelerando el trabajo manual de erudición.
- Edición crítica de textos: localizar paralelos y citas en aparatos de fuentes para anotar ediciones académicas de autores latinos cristianos.
- Detección de plagio o reutilización textual en corpus latinos: el modelo puede señalar pasajes con alta similitud léxica, útil para estudios de autenticidad y atribución.
- Análisis de tradición clásica: rastrear cómo autores posteriores (padres de la iglesia, poetas tardíos) incorporan y transforman modelos clásicos, diferenciando entre citas explícitas y ecos temáticos.
- Curaduría de bases de datos intertextuales: alimentar catálogos digitales de paralelos textuales (como el proyecto Loci Similes) con clasificaciones automáticas que luego pueden ser revisadas por expertos.
- Docencia de latín: generar ejemplos de intertextualidad para materiales didácticos, mostrando a estudiantes cómo un autor reutiliza y adapta textos previos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (precisión, recall, F1) para las tres clases, ni comparaciones con otros modelos. Solo se indican los umbrales de decisión y la dificultad intrínseca de la clase `cf`.

## Requisitos de hardware

- VRAM estimada: al ser un modelo BERT-base de 124M parámetros, la inferencia en FP32 requiere aproximadamente 500 MB para los pesos, más memoria para activaciones. Con secuencias de 512 tokens y batch pequeño, 4 GB de VRAM son suficientes; en FP16 o con cuantización dinámica bastaría con 2-3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, GTX 1660 Super) puede ejecutar el modelo sin problemas. En CPU también es viable para inferencia por lotes pequeños.
- Despliegue: compatible con Hugging Face Transformers, Text Generation Inference (TGI) para endpoints de clasificación, y con `text-embeddings-inference` según las etiquetas del repositorio. También puede exportarse a ONNX para optimización.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de este tamaño, la inferencia típica en GPU es de unos pocos milisegundos por par de secuencias.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables con la misma tarea (clasificación ternaria de intertextualidad latina) en la información proporcionada. El propio autor mantiene una versión binaria previa, `julian-schelb/bert-romanian-class-lat-intertext-v1`, que resuelve el problema como match/no-match. La diferencia clave es que el modelo ternario distingue entre `cit` y `cf`, lo que ofrece mayor granularidad pero no es intercambiable con el binario en cuanto a salidas. No se han encontrado otros clasificadores de intertextualidad latina publicados en Hugging Face con los que comparar métricas.

## Limitaciones y advertencias

- Entrenado específicamente para intertextualidad entre Jerónimo y autores clásicos; su generalización a otros autores, géneros o épocas del latín no está garantizada y requeriría evaluación adicional.
- Límite de 512 tokens por pasaje: los pasajes más largos deben truncarse, lo que puede perder información relevante.
- La clase `cf` (eco temático) es intrínsecamente difícil de detectar por su falta de señal léxica; los umbrales altos (0.95) reducen falsos positivos pero también el recall.
- El corpus de entrenamiento está muy desequilibrado hacia la clase negativa; aunque se usó muestreo balanceado, el modelo puede mostrar sesgo hacia `no_match` en datos reales.
- No se han publicado métricas de rendimiento, por lo que se desconoce su precisión real en entornos de producción.
- El modelo base es un BERT entrenado en rumano, no en latín; aunque el fine-tuning lo adapta, la representación subyacente puede no capturar todas las sutilezas morfosintácticas del latín clásico.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías de exactitud filológica.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/julian-schelb/bert-romanian-3class-lat-intertext-v1)
- [Colección de modelos para búsqueda de intertextualidad latina](https://huggingface.co/collections/julian-schelb/models-for-latin-intertextuality-search)
- [Documentación de LociSimiles (API)](https://julianschelb.github.io/locisimiles/api/)
- [Referencia CLI de LociSimiles](https://julianschelb.github.io/locisimiles/cli/)
- [Paper arXiv: Loci Similes: A Benchmark for Extracting Intertextualities in Latin Literature](https://arxiv.org/html/2601.07533v1)
- [Repositorio Romanian Transformers (modelo base)](https://github.com/dumitrescustefan/Romanian-Transformers)
