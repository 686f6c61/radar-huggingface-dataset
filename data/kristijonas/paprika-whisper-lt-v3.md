# kristijonas/paprika-whisper-lt-v3

## Resumen

`kristijonas/paprika-whisper-lt-v3` es un modelo de reconocimiento automático de voz (ASR) especializado en lituano, desarrollado por Kristijonas (kristijonas) en el contexto de la herramienta kalamo.ai. Se trata de la tercera generación de un fine-tune del modelo `whisper-large-v3-turbo` de OpenAI, entrenado sobre el corpus lituano LIEPA-3 (unas 3.281 horas de audio) y con warm-start desde la versión anterior `paprika-whisper-lt`. El modelo resuelve el problema de transcripción de voz en lituano con una calidad notablemente superior a la del modelo base multilingüe, especialmente en habla espontánea y dialectal.

La arquitectura es un transformer encoder-decoder basado en Whisper, con aproximadamente 809 millones de parámetros. Aunque no se especifica la longitud de contexto exacta, el modelo soporta decodificación long-form nativa, lo que permite procesar secuencias de audio largas sin necesidad de segmentación previa. Está disponible en formato safetensors y se distribuye bajo licencia CC BY 4.0.

La relevancia de este modelo radica en su especialización: mientras que los modelos Whisper multilingües ofrecen un rendimiento mediocre en lituano, este fine-tune alcanza tasas de error de palabra (WER) de un solo dígito en datos dentro del dominio, y mejora significativamente sobre sus dos predecesores. Además, incorpora una recomendación explícita de uso de decodificación long-form en lugar de chunked, evitando así pérdidas silenciosas de texto y alucinaciones en segmentos sin habla.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo fine-tuned) |
| Parametros totales | 808.878.080 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada (soporta decodificación long-form nativa) |
| Tipos de cuantizacion | No especificado (compatible con cuantización estándar de transformers) |
| Idiomas soportados | Lituano (lt) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper large-v3-turbo, un transformer encoder-decoder originalmente diseñado para ASR multilingüe. El fine-tune se realizó sobre el corpus LIEPA-3, un conjunto de datos lituano con licencia CC BY 4.0, complementado con una pequeña porción de VoxPopuli LT. El entrenamiento partió de los pesos de `paprika-whisper-lt` (v2), que a su vez provenía de v1, iniciado desde `svogunas/whisper-large-v3-turbo-lt`. Se ejecutaron 37.500 pasos con un batch efectivo de 32 en una GPU L40S, consumiendo aproximadamente 29 GPU-horas.

La mezcla de datos de entrenamiento incluyó 50% de habla espontánea, 30% de lectura, 12% de material fonético, 5% de dialectos regionales (Aukštaitija, Žemaitija, Dzūkija y Suvalkija) y 3% de VoxPopuli LT. Los transcriptores de la porción dialectal contenían marcas de acentuación y vocales no estándar, que fueron normalizadas a ortografía estándar antes del entrenamiento para evitar que el modelo aprendiera a emitirlas. Según el autor, el principal avance de esta generación proviene de los datos dialectales, ya que triplicar las horas totales solo movió el WER en ~0,2 puntos.

## Capacidades

- Transcripción de voz en lituano con alta precisión en habla espontánea, lectura y material fonético.
- Decodificación long-form nativa: procesa secuencias de audio completas sin segmentación en chunks, manteniendo la coherencia y sin pérdida de texto en las costuras.
- Generación de marcas temporales (timestamps) por palabra, con una fracción válida de timestamps de 1.00 en la evaluación.
- Manejo de dialectos regionales lituanos, incluyendo variantes con pronunciación no estándar.
- Compatible con pipelines de subtitulación en tiempo real y transcripción de archivos largos mediante herramientas del repositorio asociado `paprika-lt-asr`.
- No incluye soporte para tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de ASR.
- No genera puntuación ni mayúsculas por diseño; la salida es texto en minúsculas sin signos de puntuación.

## Casos de uso

- Subtitulación en tiempo real de eventos, conferencias o emisiones en lituano: el modelo puede integrarse en un pipeline de streaming que reciba audio en chunks y genere subtítulos con timestamps, gracias a su baja latencia y a la compatibilidad con herramientas de decodificación continua.
- Transcripción de reuniones y entrevistas: con la decodificación long-form nativa, se pueden procesar grabaciones de hasta 22 minutos en una sola pasada con ~18 GB de VRAM, manteniendo la coherencia del discurso sin cortes artificiales.
- Transcripción de audio parlamentario o institucional: el entrenamiento incluye una proporción significativa de habla espontánea y leída, lo que lo hace adecuado para discursos formales con vocabulario específico.
- Procesamiento de audio dialectal: gracias a la inclusión de datos de las cuatro regiones dialectales de Lituania, el modelo transcribe con precisión variantes como el žemaičių o el dzūkų, donde otros modelos fallan.
- Transcripción de llamadas telefónicas y grabaciones de baja calidad: el modelo fue comparado favorablemente contra una API comercial en grabaciones reales de llamadas y ruedas de prensa, mostrando robustez en condiciones de audio no ideales.
- Archivado y búsqueda de contenido audiovisual: al generar transcripciones con timestamps, se puede indexar el texto para búsqueda posterior, facilitando la localización de momentos concretos en vídeos o podcasts.

## Benchmarks y rendimiento

La model card reporta resultados de WER (Word Error Rate) en dos conjuntos de evaluación dentro del dominio (gold-11 y heldout-39), comparando las tres generaciones del modelo. No se proporcionan benchmarks fuera del dominio.

| Conjunto | v1 | v2 | v3 |
|---|---|---|---|
| gold-11 WER (chunked) | 15,87 | 15,50 | **15,29** |
| gold-11 WER (long-form) | 17,94 | 17,68 | **17,25** |
| heldout-39 WER (chunked) | 5,45 | **5,13** | 5,16 |
| heldout-39 WER (long-form) | 8,44 | 7,67 | **6,42** |
| Fracción de timestamps válidos | — | — | **1,00** |

El autor advierte que ambos conjuntos son del mismo dominio que los datos de entrenamiento, por lo que los resultados no son representativos de audio general. La evidencia fuera del dominio se limita a una comparación A/B contra una API comercial en grabaciones reales, donde v3 resultó competitivo y visiblemente mejor en habla dialectal. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval porque no aplican a un modelo de ASR.

## Requisitos de hardware

- VRAM estimada: para decodificación long-form nativa, se requieren aproximadamente 18 GB de VRAM para procesar 22 minutos de audio con timestamps por palabra. Para grabaciones más largas, se recomienda cortar en bloques alineados por pausas de menos de 30 segundos, lo que reduce el uso de memoria a 5,4 GB de forma constante independientemente de la duración total.
- GPU recomendadas: una L40S (usada en entrenamiento) es más que suficiente; para inferencia en consumer, una RTX 3090 o RTX 4090 con 24 GB de VRAM puede manejar long-form moderado, mientras que GPUs con 8-12 GB (como RTX 3060 o RTX 4070) pueden usar el modo de bloques cortos.
- Compatibilidad con consumer GPUs: sí, siempre que se use el modo de bloques cortos para VRAM limitada. El modo long-form nativo requiere al menos 18 GB.
- Opciones de despliegue: el modelo es compatible con la librería `transformers` de Hugging Face, por lo que puede ejecutarse en pipelines estándar de Python. También se puede servir mediante herramientas como vLLM o TGI, aunque no hay documentación específica. El repositorio `paprika-lt-asr` incluye scripts listos para subtitulación en tiempo real y transcripción de archivos largos.
- Latencia y throughput: no se proporcionan datos numéricos. Se estima que la inferencia en una GPU moderna es en tiempo real o más rápida para audio de corta duración, pero depende del hardware y del modo de decodificación.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos ASR lituanos en la información proporcionada. Sin embargo, se pueden establecer las siguientes referencias:

- Frente a `whisper-large-v3` original (multilingüe): el fine-tune lituano reduce drásticamente el WER en habla lituana, aunque el modelo original conserva capacidades multilingües.
- Frente a `svogunas/whisper-large-v3-turbo-lt` (modelo base de esta línea): v3 mejora los resultados en los benchmarks internos, especialmente en long-form (6,42 vs. los valores reportados en generaciones anteriores).
- Frente a versiones anteriores del propio modelo (v1 y v2): v3 muestra una mejora consistente en WER, sobre todo en long-form, y elimina el problema de decodificación rota que afectaba a v1.

La licencia CC BY 4.0 permite uso comercial con atribución, lo que lo hace más accesible que los modelos con licencias restrictivas.

## Limitaciones y advertencias

- Salida en minúsculas y sin puntuación: el modelo no genera mayúsculas ni signos de puntuación por diseño, ya que los datos de LIEPA-3 carecen de ellos. Para aplicaciones que requieran texto formateado, es necesario un post-procesador adicional (el repositorio `paprika-lt-asr` incluye uno con F1 de 84,7 para comas, 88,5 para puntos y 91,7 para mayúsculas).
- Convención de habla realizada: el modelo transcribe la pronunciación real (p. ej., `turim` en lugar de `turime`), lo que puede diferir de la ortografía normativa.
- Audio de entrada: solo acepta audio mono a 16 kHz, lo que requiere conversión previa de otros formatos.
- Sin benchmark fuera del dominio: no existe una evaluación válida en datos externos; el autor recomienda probar el modelo con audio propio antes de usarlo en producción.
- Riesgo de pérdida de texto en decodificación chunked: el uso de `chunk_length_s` puede descartar silenciosamente fragmentos que no se alinean entre ventanas, y además genera alucinaciones en segmentos sin habla. Se recomienda encarecidamente usar long-form nativo.
- Alucinaciones en audio sin habla: en modo chunked, el modelo produce texto inventado en silencio o ruido de fondo; en long-form nativo este comportamiento desaparece.
- Limitación de idioma: aunque el modelo base es multilingüe, este fine-tune está especializado en lituano y probablemente degrade en otros idiomas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kristijonas/paprika-whisper-lt-v3)
- [Repositorio GitHub paprika-lt-asr](https://github.com/kristijonas/paprika-lt-asr)
- [Modelo base v2](https://huggingface.co/kristijonas/paprika-whisper-lt)
- [Modelo base original lituano](https://huggingface.co/svogunas/whisper-large-v3-turbo-lt)
- [Sitio web de kalamo.ai](https://kalamo.ai)
