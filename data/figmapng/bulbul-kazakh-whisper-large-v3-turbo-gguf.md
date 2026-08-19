# Figmapng/bulbul-kazakh-whisper-large-v3-turbo-gguf

## Resumen

El modelo `Figmapng/bulbul-kazakh-whisper-large-v3-turbo-gguf` es una conversión a formato GGUF del modelo `shyngys879/kazakh-whisper-large-v3-turbo`, un fine-tuning de Whisper Large v3 Turbo (OpenAI) especializado en reconocimiento de voz en kazajo. El autor, Figmapng, ha cuantizado el modelo a Q8_0 y lo ha empaquetado para su uso en la aplicación de escritorio BulBul, un sistema de transcripción de voz a texto que funciona íntegramente en local. Con aproximadamente 809 millones de parámetros, este modelo ofrece una alternativa eficiente para transcripción de audio en kazajo sin necesidad de conexión a internet ni envío de datos a servidores remotos.

La relevancia de este modelo radica en su doble optimización: por un lado, el fine-tuning sobre más de 1.500 horas de habla kazaja mejora la precisión en este idioma de baja representación en los modelos multilingües estándar; por otro, la cuantización Q8_0 reduce el tamaño del archivo a 0,9 GB, lo que permite su ejecución en hardware modesto. Aunque el repositorio no ha recibido descargas ni valoraciones todavía, su integración en BulBul lo convierte en una opción práctica para desarrolladores que buscan una solución de ASR local para kazajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Large v3 Turbo (encoder-decoder transformer) |
| Parametros totales | 808.904.208 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos por pasada en el modelo base) |
| Tipos de cuantizacion | Q8_0 |
| Idiomas soportados | kk (kazajo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Large v3 Turbo de OpenAI, un transformer encoder-decoder diseñado para reconocimiento de voz. El modelo original fue fine-tuneado por shyngys879 sobre una mezcla limpia de ASR kazajo que contiene 841.113 utterances (aproximadamente 1.500+ horas de habla). Este fine-tuning ajusta los pesos del modelo preentrenado multilingüe para maximizar la precisión en kazajo, manteniendo la capacidad de procesar audio en otros idiomas aunque con menor rendimiento.

La conversión a GGUF se realizó mediante el conversor de Whisper incluido en `handy-computer/transcribe.cpp`, y la cuantización se aplicó a Q8_0, que conserva una buena fidelidad respecto a los pesos originales en float32. El archivo resultante tiene un hash SHA-256 verificado para garantizar su integridad. No se dispone de información adicional sobre el proceso de entrenamiento más allá de lo indicado en la model card del modelo base.

## Capacidades

- Reconocimiento de voz a texto en kazajo con alta precisión, gracias al fine-tuning específico.
- Transcripción de audio en tiempo real o por lotes, dependiendo del hardware y la configuración.
- Procesamiento local completo: el audio no se envía a ningún servidor externo, lo que garantiza privacidad.
- Compatibilidad con el ecosistema GGUF: puede ejecutarse con `transcribe.cpp`, `whisper.cpp` u otras herramientas que soporten este formato.
- Integración directa con la aplicación BulBul, que gestiona la descarga, verificación y ejecución del modelo automáticamente.
- Soporte multilingüe limitado: aunque el modelo base Whisper Large v3 Turbo es multilingüe, el fine-tuning se centra en kazajo, por lo que el rendimiento en otros idiomas puede degradarse.

## Casos de uso

- Transcripción de reuniones y entrevistas en kazajo: el modelo puede procesar grabaciones de audio y generar texto en tiempo real, facilitando la toma de notas y la búsqueda posterior de contenido.
- Subtitulado automático de vídeos en kazajo: se puede integrar en pipelines de edición de vídeo para generar subtítulos precisos, reduciendo el trabajo manual.
- Asistentes de voz locales para aplicaciones de escritorio: BulBul lo utiliza como motor de dictado, permitiendo a usuarios escribir con la voz sin depender de servicios en la nube.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir conversaciones telefónicas en kazajo para extraer métricas de calidad o detectar problemas recurrentes.
- Archivado y búsqueda de contenido de audio: al convertir audio a texto, se facilita la indexación y búsqueda de información en archivos históricos.
- Aplicaciones educativas: transcripción de clases o conferencias en kazajo para estudiantes con dificultades auditivas o para generar material de estudio reutilizable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de precisión (WER, CER) ni comparaciones con otros modelos de ASR para kazajo. Se recomienda consultar la model card del modelo base `shyngys879/kazakh-whisper-large-v3-turbo` para posibles datos de evaluación, aunque no se han encontrado en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q8_0 y 809M parámetros, el modelo ocupa aproximadamente 0,9 GB en memoria. En GPU, cabe en tarjetas con 2 GB de VRAM o más (por ejemplo, GTX 1650, RTX 3050). En CPU, se puede ejecutar con 4 GB de RAM libre.
- GPU recomendadas: cualquier GPU moderna con soporte para FP16 o FP32 es suficiente. Para tiempos de inferencia más rápidos, se recomienda al menos una RTX 3060 o equivalente.
- Compatibilidad con hardware consumer: sí, funciona en portátiles y equipos de escritorio convencionales, tanto en CPU como en GPU.
- Opciones de despliegue: el formato GGUF permite su uso con `whisper.cpp`, `transcribe.cpp`, `llama.cpp` (aunque este último es para LLMs, no ASR) y aplicaciones como BulBul. También se puede cargar con librerías Python como `ctransformers` si se convierte a otro formato, aunque no es el caso.
- Latencia y throughput estimados: no se dispone de datos concretos. En una CPU moderna (por ejemplo, Intel i7 de 12ª generación), la transcripción de un minuto de audio puede tardar entre 10 y 30 segundos, dependiendo de la optimización. En GPU, la latencia se reduce considerablemente.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Figmapng/bulbul-kazakh-whisper-large-v3-turbo-gguf | 808,9M | Q8_0 | no disponible | kk | Apache-2.0 | GGUF |
| shyngys879/kazakh-whisper-large-v3-turbo | 808,9M | float32 (original) | no disponible | kk (multilingüe base) | Apache-2.0 | Transformers (safetensors) |
| alphaedge-ai/whisper-large-v3-turbo-kaz-16384 | no disponible (recortado) | no disponible | 16.384 tokens de vocabulario | kk | no disponible | Transformers |

El modelo de Figmapng es la versión cuantizada del modelo de shyngys879, lo que reduce el tamaño de 3,2 GB (aproximadamente) a 0,9 GB, a costa de una ligera pérdida de precisión típica de Q8_0. La alternativa de alphaedge-ai recorta el vocabulario a 16.384 tokens, reduciendo aún más el footprint de memoria, pero no se dispone de información sobre su rendimiento comparativo. Para aplicaciones locales, la versión GGUF de Figmapng es la más ligera de las tres.

## Limitaciones y advertencias

- El modelo está optimizado para kazajo; su rendimiento en otros idiomas puede ser significativamente inferior al del Whisper Large v3 Turbo original.
- No se han publicado resultados de benchmarks, por lo que no hay garantía cuantificada de precisión en tareas específicas.
- La cuantización Q8_0 introduce una pérdida mínima de calidad en comparación con los pesos en float32, aunque en la práctica suele ser imperceptible.
- El repositorio no tiene descargas ni valoraciones, lo que sugiere que es un proyecto reciente o poco probado en entornos de producción.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la atribución y las condiciones del modelo base y de las herramientas utilizadas (por ejemplo, `transcribe.cpp`).
- Al ser un modelo de ASR, puede presentar alucinaciones (transcripciones de audio inexistentes) en entornos ruidosos o con habla no nativa. Se recomienda validar las transcripciones en aplicaciones críticas.
- El modelo procesa audio en segmentos de 30 segundos; para audios más largos se necesita segmentación, lo que puede afectar la coherencia en transcripciones extensas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Figmapng/bulbul-kazakh-whisper-large-v3-turbo-gguf
- Modelo base (shyngys879/kazakh-whisper-large-v3-turbo): https://huggingface.co/shyngys879/kazakh-whisper-large-v3-turbo
- Modelo alternativo recortado (alphaedge-ai/whisper-large-v3-turbo-kaz-16384): https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-kaz-16384
- Herramienta de conversión (transcribe.cpp): no se ha encontrado un enlace directo, pero se menciona en la model card como `handy-computer/transcribe.cpp`.
