# hxxiang/opticaldna-rice-2048

## Resumen

OpticalDNA-Rice-2048 es un checkpoint del framework OpticalDNA, desarrollado por Hongxin Xiang y presentado en ICML 2026. El modelo reformula el modelado de secuencias genómicas como un problema de comprensión de documentos estilo OCR: las secuencias de ADN se renderizan en páginas visuales estructuradas, que son procesadas por un encoder de visión-lenguaje y un decodificador de documentos. Este enfoque permite representar el ADN en tokens visuales compactos, facilitando el razonamiento por regiones y la predicción genómica de contexto largo.

El checkpoint está preentrenado sobre el genoma de arroz NIP-T2T, con configuraciones de ventana `w2048` y `o1920`, y secuencias en mayúsculas. Se libera en el paso 150 000 de entrenamiento. El modelo cuenta con 3 342 664 960 parámetros (aproximadamente 3,34 mil millones) y se distribuye bajo licencia MIT. Está diseñado para tareas de extracción de características, lectura de secuencias, localización de subsecuencias y otras tareas genómicas, y es relevante porque introduce un paradigma novedoso que conecta la visión por computador con la genómica, abriendo nuevas vías para el análisis de ADN a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje con encoder visual y decodificador de documentos (arquitectura transformer, detalles específicos no disponibles) |
| Parametros totales | 3 342 664 960 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (diseñado para contexto largo según la documentación del proyecto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo especializado en genómica, no en idiomas naturales) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OpticalDNA-Rice-2048 se basa en un framework de visión-lenguaje que convierte secuencias de ADN en páginas visuales estructuradas. El modelo consta de un encoder visual que procesa estas páginas y produce representaciones compactas del ADN, y un decodificador de documentos que genera texto condicionado por prompts. El entrenamiento se realiza con objetivos genómicos específicos, como lectura de secuencias, grounding, transcripción de regiones de interés (ROI), completado enmascarado, localización de subsecuencias y clasificación de cromosomas.

El checkpoint fue preentrenado sobre el genoma de arroz NIP-T2T, utilizando ventanas de 2048 pares de bases y un solapamiento de 1920, con secuencias en mayúsculas. Se libera el checkpoint correspondiente al paso 150 000. No se han proporcionado detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El modelo requiere código personalizado (`trust_remote_code=True`) para su carga en transformers.

## Capacidades

- Extracción de características visuales de ADN: genera embeddings de secuencias a partir de imágenes de páginas de ADN, con opciones de pooling (media) y salida en CPU.
- Generación de texto condicionada por prompts: el decodificador puede producir transcripciones de secuencias, respuestas a prompts de OCR libre, etc.
- Lectura de secuencias (OCR): transcribe el contenido de las páginas de ADN a texto.
- Grounding: localiza regiones específicas dentro de las páginas visuales.
- Transcripción de regiones de interés (ROI): extrae la secuencia de una región concreta indicada por el usuario.
- Completado enmascarado: rellena huecos en secuencias parciales.
- Localización de subsecuencias: encuentra la posición de una subsecuencia dada dentro del genoma.
- Clasificación de cromosomas: identifica o clasifica cromosomas a partir de las páginas visuales.
- Soporte multi-página: procesa múltiples páginas en orden de lectura para manejar genomas completos o fragmentos largos.

## Casos de uso

- Anotación genómica de arroz: el modelo puede transcribir regiones específicas del genoma NIP-T2T, facilitando la anotación de genes, promotores y elementos reguladores. Se usaría el prompt de transcripción ROI sobre páginas renderizadas de la región de interés.
- Detección de variantes estructurales: mediante la localización de subsecuencias, se pueden identificar inserciones, deleciones o reordenamientos comparando las secuencias renderizadas con referencias conocidas.
- Comparación de genomas: las características visuales extraídas (embeddings) permiten comparar similitudes entre diferentes accesiones de arroz o entre especies, usando métricas de distancia sobre los vectores generados.
- Análisis de cromosomas completos: con el soporte multi-página, se puede procesar un cromosoma entero en orden de lectura para estudiar su estructura, densidad génica o regiones repetitivas.
- Integración en pipelines de bioinformática: el modelo puede usarse como extractor de características para alimentar otros modelos de aprendizaje automático, por ejemplo en tareas de predicción de expresión génica o de elementos funcionales.
- Educación y visualización genómica: la capacidad de generar texto a partir de imágenes de ADN permite crear herramientas didácticas que expliquen visualmente la estructura del genoma, mostrando secuencias y anotaciones de forma interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Dado el tamaño de 3,34 mil millones de parámetros, una estimación orientativa para inferencia en FP16 sería de aproximadamente 6,7 GB de VRAM solo para los pesos, más memoria para activaciones y overhead. Una GPU con 12 GB de VRAM (por ejemplo, RTX 3060 o superior) podría ser suficiente para inferencia básica, pero no hay confirmación oficial.
- El modelo se distribuye en formato safetensors y requiere `trust_remote_code=True`, por lo que es compatible con la librería transformers. No se mencionan opciones de despliegue específicas como vLLM, llama.cpp u Ollama.
- Para tareas de extracción de características, el modelo puede ejecutarse en CPU si se convierte a precisión reducida, aunque la latencia será mayor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. OpticalDNA es un enfoque novedoso que no tiene equivalentes directos en el ámbito de la genómica basada en visión-lenguaje, por lo que no se puede establecer una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en el genoma de arroz NIP-T2T; su rendimiento en otros organismos o genomas no está garantizado y probablemente requiera fine-tuning.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un único genoma, puede presentar limitaciones en la generalización a otras especies.
- No hay información sobre la tasa de alucinación en las transcripciones generadas; se recomienda validar las salidas con herramientas bioinformáticas estándar.
- El modelo requiere código personalizado (`trust_remote_code=True`), lo que implica un riesgo de seguridad al ejecutar código externo; se debe revisar el código antes de usarlo en entornos de producción.
- La licencia MIT permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las normativas sobre datos genéticos y propiedad intelectual.
- No se han publicado benchmarks ni métricas de rendimiento, por lo que no es posible evaluar su precisión cuantitativa en tareas genómicas.

## Enlaces

- HuggingFace: https://huggingface.co/hxxiang/opticaldna-rice-2048
- GitHub: https://github.com/HongxinXiang/OpticalDNA
- Paper (arXiv): https://arxiv.org/abs/2602.02014
- Página del proyecto: https://hongxinxiang.github.io/projects/OpticalDNA/
