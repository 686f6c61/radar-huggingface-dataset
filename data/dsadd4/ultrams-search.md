# dsadd4/UltraMS-Search

## Resumen

UltraMS Search es un modelo de embedding de espectros de masas desarrollado por el usuario dsadd4, seleccionado como componente de búsqueda espectral dentro de la aplicación UltraAtlas. Su función es transformar un espectro de masas medido (pares de m/z e intensidad más el m/z del ion precursor) en un vector normalizado de 512 dimensiones, que permite ordenar por similitud coseno los espectros de una biblioteca de referencia. Resuelve, por tanto, el problema de la identificación de compuestos en metabolómica mediante búsqueda espectro-a-espectro, una tarea clásica en la que los métodos tradicionales se basan en puntuaciones de coincidencia de picos y que aquí se aborda con representaciones aprendidas.

El modelo se distribuye como el checkpoint `best.pt` de una familia de tres checkpoints (la "UltraMS model family") y se carga a través del paquete Python `ultrams` versión 0.3.2, con el nombre de modelo `"search"`. La model card es muy escueta: no declara arquitectura detallada, número de parámetros, longitud de contexto, idiomas ni resultados de benchmarks. El repositorio ocupa 0,8 GB y la licencia es Apache 2.0.

Es relevante ahora porque propone un enfoque de embedding contrastivo para búsqueda espectral en metabolómica, un área donde las herramientas de código abierto con licencia permisiva y API Python sencilla son escasas. No obstante, la ausencia de documentación técnica y de métricas publicadas limita seriamente su evaluación previa a un uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se describe como modelo contrastivo espectro-a-espectro; el encoder subyacente es el "UltraMS encoder", sin detalle arquitectónico) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la entrada se define por un máximo de 150 picos espectrales) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint `best.pt` en PyTorch) |
| Idiomas soportados | no disponible (modelo no lingüístico; entrada numérica de espectros) |
| Licencia | Apache 2.0 |
| Formato de pesos | `best.pt` / `model.pt` (PyTorch), cargable con `ultrams` 0.3.2 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. La model card indica que se trata de un modelo contrastivo espectro-a-espectro y que la salida utilizada es la proyección normalizada de 512 dimensiones del embedding CLS del encoder UltraMS. Es decir, hay un encoder que produce un embedding CLS a partir de los picos espectrales y una cabeza de proyección que lo lleva a un espacio de 512 dimensiones donde se calcula la similitud coseno. No se especifica si el encoder es un transformer, una red sobre grafos o un MLP sobre picos; tampoco se indica el número de capas, dimensiones ocultas ni parámetros.

Respecto al entrenamiento, no se publican datos sobre volumen del corpus, composición del dataset, función de pérdida concreta (aunque el término "contrastivo" sugiere pérdidas tipo InfoNCE entre pares de espectros), ni si hubo ajuste fino con preferencias o RLHF (poco probable en un modelo no generativo). La innovación técnica declarada es el propio pipeline de embedding: normalización de intensidades por su máximo, retención de los 150 picos más intensos y la posibilidad de recuperar embeddings alineados con los picos retenidos mediante `return_peaks=True`.

## Capacidades

- Generación de embeddings de espectros de masas: convierte pares de m/z e intensidad más el m/z del ion precursor en un vector normalizado de 512 dimensiones.
- Búsqueda espectro-a-espectro: ordena una biblioteca de referencia por similitud coseno frente al espectro consultado.
- Preprocesado integrado: exige al menos tres picos con m/z positivo, normaliza intensidades por su máximo cuando este es positivo y conserva los 150 picos más intensos.
- Alineación pico-embedding: con `return_peaks=True` devuelve embeddings del encoder final alineados con los picos retenidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Identificación de compuestos en metabolómica no dirigida: dado un espectro MS/MS experimental, generar su embedding y ordenar por similitud coseno una biblioteca de referencia para proponer candidatos; el modelo está diseñado exactamente para esta tarea.
- Anotación de alto rendimiento en estudios de metabolómica: precalcular embeddings de una biblioteca completa y reutilizarlos para consultas masivas, evitando recalcular representaciones en cada búsqueda.
- Búsqueda de espectros similares para control de calidad: detectar espectros duplicados o anómalos comparando embeddings dentro de un mismo lote de adquisición.
- Integración en pipelines de análisis con Python: la API `UltraMS.from_pretrained("search")` y `model.encode(...)` permite insertar el paso de búsqueda en flujos existentes basados en Python sin dependencias de servicios externos.
- Filtrado previo de candidatos antes de una validación manual o con herramientas de puntuación clásicas: usar el ranking por coseno para reducir el conjunto de compuestos a revisar.
- Prototipado e investigación en representaciones aprendidas de espectros: al ser Apache 2.0 y cargarse con un paquete pip, sirve como línea base reproducible para comparar con métodos de coincidencia de picos tradicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,8 GB, lo que da una cota superior aproximada del peso de los checkpoints, pero no se especifica qué fracción corresponde a `best.pt`.
- GPU recomendadas: no disponibles; no se documentan requisitos de GPU ni se indica si la inferencia puede ejecutarse en CPU.
- Viabilidad en GPU de consumo: no disponible; por el tamaño del repositorio (0,8 GB) es plausible que quepa en GPU de consumo, pero no hay confirmación del autor.
- Opciones de despliegue: paquete Python `ultrams` (versión 0.3.2) con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de embedding espectral ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Documentación muy escasa: no se publican arquitectura, número de parámetros, datos de entrenamiento ni métricas, lo que impide evaluar su calidad antes de usarlo.
- Sin benchmarks: no hay evidencia publicada de precisión en identificación (top-1, top-k, MRR) frente a métodos clásicos de coincidencia espectral.
- Dependencia de versión: la model card indica que los pesos se cargan con `ultrams` 0.3.2; versiones distintas del paquete pueden no ser compatibles.
- Restricciones de entrada: requiere al menos tres picos con m/z positivo y trunca a los 150 picos más intensos, lo que puede perder información en espectros con muchos picos relevantes de baja intensidad.
- Riesgo de sesgo: al no documentarse la composición del dataset de entrenamiento, se desconoce si el modelo está sesgado hacia ciertas clases de compuestos, instrumentos o modos de ionización.
- Riesgo de falsos positivos: un ranking por similitud coseno en un espacio aprendido puede devolver candidatos plausibles pero incorrectos; se recomienda validación con puntuaciones clásicas o estándares internos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de licencia y verificar la procedencia de los datos de entrenamiento, no documentada.
- Advertencia de producción: con 0 descargas y 0 likes en el momento de la consulta, el modelo carece de validación por parte de la comunidad; no se recomienda como único método de identificación en flujos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dsadd4/UltraMS-Search
- Colección UltraMS model family: https://huggingface.co/collections/dsadd4/ultrams-6ab4cfaa860cbbd1f9a6b9b6
- Repositorio GitHub (formato de entrada, selección de modelo y ejemplo de búsqueda espectral): https://github.com/Dsadd4/UltraMS
