# openai/whisper-large-v3

## Resumen

Whisper large-v3 es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por OpenAI, presentado en el artículo *Robust Speech Recognition via Large-Scale Weak Supervision*. Está diseñado para transcribir audio a texto en más de 90 idiomas y traducir voz a inglés, con una capacidad destacada de generalización a dominios y datasets diversos en modo zero-shot. El modelo se entrenó con más de 5 millones de horas de datos etiquetados, de los cuales 1 millón son débilmente etiquetados y 4 millones pseudo-etiquetados mediante Whisper large-v2, durante 2 épocas.

La arquitectura es la misma que la de Whisper large y large-v2, con dos diferencias menores: el espectrograma de entrada utiliza 128 bandas de frecuencia Mel en lugar de 80, y se añade un token de idioma específico para cantonés. Según la información publicada, large-v3 reduce los errores entre un 10% y un 20% en comparación con large-v2 en una amplia variedad de idiomas. El modelo está disponible bajo licencia Apache 2.0 y es compatible con el ecosistema Hugging Face Transformers, así como con despliegue en SageMaker y Azure.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder Transformer, misma que large-v2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingüe (más de 90 idiomas, ver lista en el README) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch, JAX |

## Arquitectura y entrenamiento

Whisper large-v3 utiliza una arquitectura de transformer encoder-decoder, idéntica a la de los modelos Whisper large y large-v2, con dos cambios específicos: el preprocesado de audio emplea 128 bandas Mel en lugar de 80, y se incorpora un token de idioma adicional para el cantonés. El entrenamiento se realizó sobre una mezcla de 1 millón de horas de audio débilmente etiquetado y 4 millones de horas de audio pseudo-etiquetado generado con Whisper large-v2, completando 2 épocas sobre este conjunto. No se mencionan técnicas adicionales como RLHF o DPO en la información disponible; el enfoque principal es el aprendizaje supervisado a gran escala con datos débilmente etiquetados.

## Capacidades

- Reconocimiento automático del habla (ASR) en más de 90 idiomas, con detección automática del idioma de origen.
- Traducción de voz a texto en inglés (speech translation), activable mediante el parámetro `task="translate"`.
- Generación de marcas de tiempo (timestamps) a nivel de frase y de palabra, útil para subtitulado y alineación.
- Soporte para estrategias de decodificación avanzadas: temperature fallback, condición sobre tokens previos, umbrales de compresión y de log-probabilidad, y detección de ausencia de habla.
- Compatible con el pipeline de Hugging Face Transformers, permitiendo transcribir archivos de audio locales o datasets, y procesamiento por lotes.
- Capacidad de manejar audio de longitud arbitraria mediante el pipeline, con opciones de chunking implícitas.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede transcribir grabaciones de larga duración con marcas de tiempo por frase, facilitando la generación de actas y búsquedas posteriores. Su robustez ante acentos y ruido lo hace adecuado para entornos reales.
- Subtitulado automático de vídeos: gracias a la generación de timestamps a nivel de palabra y frase, se pueden producir subtítulos en múltiples idiomas de forma automática, reduciendo el trabajo manual en producción audiovisual.
- Traducción de contenido audiovisual: con la opción `task="translate"`, se puede convertir audio en cualquier idioma soportado a texto en inglés, útil para doblaje o subtitulado internacional.
- Asistentes de voz y comandos por voz: el modelo puede integrarse en sistemas de interacción por voz para transcribir comandos y respuestas, aunque su latencia puede ser mayor que modelos más pequeños, es adecuado para aplicaciones donde la precisión es prioritaria.
- Análisis de llamadas de atención al cliente: transcribir llamadas para su posterior análisis de sentimiento, detección de problemas recurrentes o cumplimiento normativo, aprovechando la capacidad de manejar audio largo y múltiples idiomas.
- Accesibilidad: transcripción en tiempo real o diferida para personas con discapacidad auditiva, tanto en entornos educativos como en eventos públicos, gracias a la alta precisión y soporte multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README indica una mejora del 10% al 20% en reducción de errores frente a Whisper large-v2, pero no se proporcionan cifras concretas de métricas como MMLU, HumanEval o WER en datasets específicos.

## Requisitos de hardware

No se proporcionan requisitos de hardware en la información disponible. El modelo es compatible con Hugging Face Transformers y se puede desplegar en plataformas cloud como SageMaker y Azure, según los tags del repositorio. Al ser un modelo de gran tamaño, se recomienda una GPU con suficiente memoria para inferencia en FP16, aunque no se especifican valores concretos.

## Comparativa con modelos similares

No se proporcionan comparativas con otros modelos en la información disponible. El único punto de referencia mencionado es Whisper large-v2, sobre el cual large-v3 logra una reducción de errores del 10-20%. No se dispone de datos para comparar con otras alternativas como Google USM o modelos de ASR comerciales.

## Limitaciones y advertencias

- No se mencionan limitaciones específicas en la información proporcionada.
- Al ser un modelo entrenado con datos débilmente etiquetados, podría presentar sesgos en el reconocimiento de acentos o dialectos poco representados, aunque no se documenta explícitamente.
- El riesgo de alucinación en transcripciones no está documentado, pero es un fenómeno conocido en modelos de ASR cuando el audio es ambiguo o de baja calidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de uso de OpenAI para posibles restricciones adicionales.
- No se especifican limitaciones de contexto o idioma más allá de la lista de idiomas soportados.

## Enlaces

- [Hugging Face: openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)
- [Paper: Robust Speech Recognition via Large-Scale Weak Supervision (arXiv:2212.04356)](https://huggingface.co/papers/2212.04356)
