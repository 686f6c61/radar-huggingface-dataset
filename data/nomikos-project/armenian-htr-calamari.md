# nomikos-project/armenian-htr-calamari

## Resumen

El modelo `nomikos-project/armenian-htr-calamari` es un checkpoint de reconocimiento de texto manuscrito (HTR) especializado en manuscritos en armenio. Ha sido desarrollado por el proyecto Nomikos, una plataforma de anotación asistida por IA para manuscritos históricos que abarca lenguas como griego, copto, armenio y siríaco. El modelo se publica a través del "Hub staging tree" de Nomikos y está etiquetado como `stable` con id `armenian-calamari-v1`.

La arquitectura utilizada es Calamari, un framework de HTR basado en redes neuronales convolucionales y recurrentes (CRNN) con pérdida CTC, habitualmente empleado para transcripción de escritura manuscrita. No se especifican el número de parámetros ni la longitud de contexto en la información disponible, aunque estos parámetros no son relevantes para un modelo de HTR, ya que no es un modelo de lenguaje generativo. La relevancia del modelo radica en la digitalización y preservación del patrimonio cultural armenio, facilitando la transcripción y anotación de manuscritos antiguos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Calamari (CRNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica para HTR) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Armenio (hy) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Calamari, un sistema de reconocimiento de texto manuscrito que combina capas convolucionales para extracción de características, capas recurrentes (LSTM) para modelado secuencial y una capa de clasificación CTC (Connectionist Temporal Classification) para alinear la secuencia de caracteres. Esta arquitectura es estándar en tareas de HTR y se usa para transcribir líneas de texto manuscrito.

No se proporciona información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card indica únicamente que es un checkpoint publicado desde el árbol de staging del Hub de Nomikos, con versión `v1` y etiqueta `stable`. Tampoco se mencionan innovaciones técnicas específicas más allá del uso del framework Calamari.

## Capacidades

- Reconocimiento de texto manuscrito en armenio, orientado a transcripción de documentos históricos.
- Integración con la plataforma Nomikos para anotación asistida de manuscritos, mediante el uso de `weights_source: hf://nomikos-project/armenian-htr-calamari@stable`.
- Soporte de tarea `transcribe`, según la model card.
- No es un modelo de lenguaje generativo: no soporta tool calling, razonamiento multi-paso ni generación de texto libre.

## Casos de uso

- Transcripción de manuscritos armenios históricos en archivos y bibliotecas: el modelo puede procesar imágenes de páginas manuscritas y generar texto transcrito, acelerando la digitalización de colecciones.
- Anotación asistida en la plataforma Nomikos: los investigadores pueden cargar manuscritos, ejecutar el modelo para obtener una transcripción preliminar y corregirla manualmente en el editor web.
- Digitalización de documentos eclesiásticos o culturales: adecuado para instituciones que conservan manuscritos armenios antiguos y necesitan convertir el contenido a formato digital.
- Investigación académica en filología armenia: permite crear transcripciones de fuentes primarias para estudios lingüísticos, históricos o literarios.
- Creación de corpus de texto armenio: las transcripciones generadas pueden usarse como datos de entrenamiento para otros modelos de procesamiento de lenguaje natural en armenio.
- Accesibilidad de textos manuscritos: al transcribir los documentos, se facilita su búsqueda, indexación y consulta por parte de estudiosos sin necesidad de leer la escritura original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card menciona el uso a través del registro de inferencia de Nomikos y un script de prefetch (`scripts/hf/fetch_model.py`) para cargar el checkpoint en la caché del Hub.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

no disponible

## Limitaciones y advertencias

- La licencia no está especificada en la model card; es necesario contactar con el autor antes de cualquier uso comercial o redistribución.
- El modelo está diseñado exclusivamente para escritura manuscrita en armenio; no tiene capacidades para otros idiomas ni para texto impreso.
- Al tratarse de un modelo de HTR, puede presentar errores de transcripción en manuscritos con degradación, caligrafía poco clara o trazos irregulares.
- No se han publicado métricas de rendimiento ni evaluaciones externas, por lo que la precisión esperada no está documentada.
- El uso previsto está ligado a la plataforma Nomikos; la integración fuera de ese ecosistema puede requerir adaptaciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/nomikos-project/armenian-htr-calamari
- Nomikos: https://www.nomikos.app/
- GitHub greekOCR: https://github.com/kkkamur07/greekOCR
- ArmOSS: https://armoss.org/project/1725-kkkamur07-greekocr
