# mainbrains/whisper-large-v3

## Resumen

Whisper large-v3 es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado originalmente por OpenAI, del cual este repositorio es un fork mantenido por el usuario `mainbrains`. El modelo se basa en una arquitectura transformer encoder-decoder y fue entrenado con más de 5 millones de horas de audio etiquetado, lo que le permite generalizar a numerosos dominios y idiomas sin necesidad de ajuste fino. Este fork específico está orientado a su uso en producción para pipelines de transcripción en tiempo real, con configuraciones de inferencia optimizadas y notas sobre cuantización.

El modelo tiene aproximadamente 1.540 millones de parámetros y soporta una ventana de audio de 30 segundos por pasada. Se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors, PyTorch y JAX. Su relevancia actual radica en que es uno de los modelos ASR multilingües más precisos y versátiles, con soporte para 99 idiomas y capacidades de traducción de voz a texto en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (1500 tokens de entrada, 448 tokens de salida) |
| Tipos de cuantizacion | INT8 (mencionado por el autor), otros no especificados |
| Idiomas soportados | Multilingue: 99 idiomas (incluye es, en, fr, de, it, pt, zh, ja, ko, ar, ru, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch, JAX |

## Arquitectura y entrenamiento

Whisper large-v3 emplea una arquitectura transformer encoder-decoder estándar, similar a los modelos large y large-v2 previos, con dos diferencias principales: el espectrograma de entrada utiliza 128 bandas de frecuencia Mel en lugar de 80, y se añadió un token de idioma específico para el cantonés. El modelo fue entrenado sobre un conjunto de datos mixto de 1 millón de horas de audio débilmente etiquetado y 4 millones de horas de audio pseudo-etiquetado generado con Whisper large-v2, durante 2.0 épocas. Este entrenamiento a gran escala con supervisión débil permite al modelo generalizar bien a nuevos dominios y tareas sin ajuste fino adicional.

El fork de `mainbrains` no modifica la arquitectura ni los pesos originales, sino que se centra en optimizaciones de despliegue para producción, como el uso de vLLM para servir el modelo y cuantización INT8 para reducir la latencia y el uso de memoria.

## Capacidades

- Reconocimiento automático del habla (ASR) en 99 idiomas, con detección automática del idioma de origen.
- Traducción de voz a texto en inglés (tarea `translate`), manteniendo el contenido semántico del audio original.
- Generación de marcas de tiempo a nivel de frase o segmento, útil para subtitulado y análisis de audio.
- Soporte de estrategias de decodificación avanzadas como *temperature fallback*, *condition on previous tokens* y umbrales de compresión para mejorar la robustez en audio ruidoso.
- Procesamiento por lotes de múltiples archivos de audio en paralelo, con control del tamaño de lote.
- Integración nativa con la librería Transformers de Hugging Face, incluyendo la clase `pipeline` para uso sencillo.
- Capacidad de transcribir audio de longitud arbitraria mediante segmentación automática en ventanas de 30 segundos.

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo puede transcribir conversaciones multi-participante en tiempo real, con marcas de tiempo para identificar turnos de habla. Su baja latencia (sub-200 ms con cuantización INT8) lo hace adecuado para aplicaciones de subtitulado en vivo.
- Generación de subtítulos para vídeo: gracias a la salida de timestamps a nivel de segmento, se puede generar subtítulos sincronizados en múltiples idiomas, tanto para plataformas de streaming como para archivos locales.
- Asistentes de voz y comandos por voz: al soportar detección de idioma y traducción, puede integrarse en asistentes personales o sistemas de control por voz para entender comandos en distintos idiomas y responder en inglés si es necesario.
- Análisis de llamadas de atención al cliente: permite transcribir y analizar conversaciones telefónicas para extraer métricas de calidad, detectar problemas recurrentes o entrenar modelos de NLP posteriores.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real con alta precisión en múltiples idiomas facilita la inclusión en entornos educativos, laborales o de ocio.
- Investigación lingüística y de corpus: el modelo puede transcribir grandes volúmenes de audio en idiomas minoritarios o con acentos diversos, generando corpus textuales para estudios fonéticos o de procesamiento del lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original de OpenAI indica que large-v3 muestra una reducción de errores del 10% al 20% en comparación con large-v2 en una amplia variedad de idiomas, pero no se proporcionan cifras concretas en este repositorio. El autor del fork menciona una latencia de primer token inferior a 200 ms con cuantización INT8 en su configuración de hardware, pero no se detallan métricas adicionales.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~1.54B parámetros. En FP16, el peso ocupa aproximadamente 3 GB, más overhead de activaciones y decodificación, por lo que se recomienda al menos 6 GB de VRAM para inferencia cómoda. Con cuantización INT8, el peso se reduce a ~1.5 GB, permitiendo ejecución en GPUs con 4 GB o menos.
- GPU recomendadas: el autor menciona una configuración con CPU AMD 9950X y una GPU RTX (sin especificar modelo). Para producción, se recomiendan GPUs como RTX 3090, RTX 4090, A10, A100 o H100, dependiendo del throughput deseado.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de gama media como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) con cuantización INT8 o FP16.
- Opciones de despliegue: vLLM (mencionado por el autor), Transformers con pipeline, Hugging Face Inference Endpoints, TGI (Text Generation Inference) y posiblemente llama.cpp para CPU (aunque no está documentado en este repo).
- Latencia y throughput: el autor reporta sub-200 ms de latencia de primer token con INT8 en su hardware. No se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper large-v3 (este fork) | 1.54B | 30 s audio | 99 | Apache 2.0 | Hugging Face |
| Whisper large-v2 (OpenAI) | 1.54B | 30 s audio | 99 | Apache 2.0 | Hugging Face |
| Whisper large (OpenAI) | 1.54B | 30 s audio | 99 | Apache 2.0 | Hugging Face |
| Wav2Vec2-XLSR-53 | ~300M | 10 s audio | 53 | Apache 2.0 | Hugging Face |

Whisper large-v3 supera a large-v2 en precisión (10-20% menos errores) y añade el token de cantonés. Comparado con Wav2Vec2, Whisper ofrece mayor cobertura de idiomas y capacidades de traducción, aunque con mayor coste computacional.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos de audio de Internet, el modelo puede presentar sesgos hacia acentos, dialectos o registros de habla más representados en los datos, lo que puede afectar a hablantes de variedades menos comunes.
- Riesgo de alucinación: en audio muy ruidoso o con solapamiento de voces, el modelo puede generar texto plausible pero incorrecto. Se recomienda usar los umbrales de confianza y estrategias de decodificación robustas.
- Limitaciones de contexto: la ventana de 30 segundos obliga a segmentar audios largos, lo que puede perder contexto entre segmentos si no se gestiona adecuadamente la continuidad.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso comercial está permitido, pero se debe verificar que los datos de entrenamiento originales no tengan restricciones adicionales (OpenAI no impone restricciones de uso para este modelo).
- Caveat para producción: el fork no incluye cambios en los pesos, por lo que las optimizaciones de inferencia dependen del hardware y del software de servido. Se recomienda validar la precisión con cuantización INT8 en el dominio de uso antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mainbrains/whisper-large-v3
- Paper original (Whisper): https://huggingface.co/papers/2212.04356
- GitHub del autor (benchmarks de inferencia): https://github.com/Neurologist
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3
