# SayedShaun/asr-punctuation-restore-bn

## Resumen

`asr-punctuation-restore-bn` es un modelo de restauración de puntuación para texto en bengalí, desarrollado originalmente por Erdene-Ochir Tuguldur (equipo Chimege) como parte de la solución ganadora del primer puesto en la competición Bengali.AI Speech Recognition de Kaggle. El repositorio actual, publicado por SayedShaun, republica los pesos de forma independiente para facilitar su uso sin necesidad de descargar el modelo ASR completo.

El modelo se basa en `google/muril-base-cased`, un transformer multilingüe de la familia BERT, fine-tuneado como clasificador de tokens para añadir tres signos de puntuación: el punto bengalí `।`, la coma `,` y el signo de interrogación `?`. Es agnóstico al sistema de reconocimiento de voz: acepta texto plano sin puntuar y funciona con la salida de cualquier ASR (Whisper, faster-whisper, Google STT, etc.). Se ofrecen cuatro checkpoints con distinto número de capas (6, 8, 11 y 12), siendo el de 12 capas el que mejor rendimiento reporta según la evaluación del autor original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT) con clasificación de tokens, basado en MuRIL-base-cased |
| Parametros totales | No disponible (cada checkpoint varía; el de 12 capas ocupa 908 MB en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq_length de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | Bengalí (bn) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (config.json, model.safetensors, tokenizer) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/muril-base-cased` como clasificador de tokens. MuRIL es un transformer BERT multilingüe entrenado con 17 lenguas indias, incluyendo bengalí. La capa de clasificación asigna a cada token una de las etiquetas de puntuación (o ninguna). El entrenamiento se realizó con un batch size de 64, learning rate de 2e-4, longitud máxima de secuencia de 512 tokens, sobre el corpus IndicCorp v2 Bangla normalizado. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento supervisado estándar de clasificación de tokens.

Cada subcarpeta (`6layers/`, `8layers/`, `11layers/`, `12layers/`) contiene un checkpoint completo e independiente, lo que permite usarlos por separado o ensamblarlos. El autor original evaluó distintas combinaciones y encontró que el modelo de 12 capas supera al ensamblado completo en precisión de tokens y F1 macro.

## Capacidades

- Restauración de puntuación en texto bengalí sin puntuar: añade `।` (punto), `,` (coma) y `?` (interrogación).
- Funciona con la salida de cualquier sistema ASR, ya que procesa texto, no audio.
- Soporta secuencias de hasta 512 tokens.
- Disponible en cuatro tamaños (6, 8, 11 y 12 capas) para equilibrar velocidad y precisión.
- Integrable con la librería `transformers` de HuggingFace o mediante el paquete `asr-punct-restore` que gestiona ventanas y ensamblado.
- No incluye capacidades de generación de texto, tool calling, agentes, visión ni audio; es exclusivamente un clasificador de tokens.

## Casos de uso

- Post-procesamiento de transcripciones ASR en bengalí: cualquier sistema de reconocimiento de voz que produzca texto sin puntuar puede alimentar este modelo para generar transcripciones legibles y estructuradas, mejorando la experiencia de lectura en subtítulos, actas o entrevistas.
- Generación de subtítulos automáticos: los subtítulos generados por ASR suelen carecer de puntuación; aplicar este modelo antes de la publicación mejora la claridad y el ritmo de lectura.
- Preparación de datos para NLP: antes de entrenar modelos de análisis de sentimiento, extracción de entidades o traducción, es útil normalizar el texto con puntuación correcta; este modelo puede aplicarse a grandes volúmenes de texto bengalí.
- Mejora de búsqueda y recuperación de información: los documentos transcritos sin puntuación son difíciles de segmentar en frases; la restauración de puntuación facilita la indexación y la búsqueda por frases completas.
- Asistentes de voz y chatbots: las interacciones de voz transcritas pueden puntuarse para que los sistemas de comprensión del lenguaje procesen mejor la intención del usuario.
- Archivado y documentación de contenido oral: entrevistas, podcasts o conferencias en bengalí pueden convertirse en texto escrito con puntuación adecuada para su publicación o consulta.

## Benchmarks y rendimiento

El autor original evaluó el modelo sobre 27 000 palabras de prosa bengalí, comparando la puntuación predicha con la real. Los resultados reportados son:

| Configuracion de capas | Token accuracy | Macro F1 (`।`, `,`) |
|---|---|---|
| 12 | 0.9661 | 0.811 |
| 11 + 12 | 0.9655 | 0.808 |
| 6 + 12 | 0.9655 | 0.807 |
| 6 + 8 + 11 + 12 (ensamblado completo) | 0.9650 | 0.805 |
| 8 + 11 + 12 | 0.9645 | 0.802 |
| 6 | 0.9629 | 0.795 |

El modelo de 12 capas es el más preciso, superando incluso al ensamblado completo. No se han publicado comparaciones con otros modelos de restauración de puntuación para bengalí en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Los pesos se publican en safetensors, probablemente en FP32 (el checkpoint de 12 capas ocupa 908 MB, consistente con un modelo BERT-base de ~220 M parámetros en FP32).
- Para inferencia en FP16, la VRAM estimada sería de ~450 MB para el modelo de 12 capas; en FP32, ~900 MB. Los checkpoints de 6 y 8 capas requieren menos memoria.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU, aunque con mayor latencia.
- Se puede desplegar con la librería `transformers` de HuggingFace, o mediante el paquete `asr-punct-restore` que gestiona el ventaneado y el ensamblado.
- No se dispone de datos de latencia o throughput medidos; al ser un modelo BERT-base, la inferencia es rápida en GPU (del orden de milisegundos por secuencia de 512 tokens).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para restauración de puntuación en bengalí. Existen alternativas generales como `ct-punc` de FunASR (para chino e inglés) o modelos basados en BERT para otros idiomas, pero no hay datos públicos que permitan una comparación directa con este modelo en bengalí. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con texto en bengalí; alimentarlo con otros idiomas produce etiquetas sin error aparente pero con resultados sin sentido.
- Restaura únicamente tres signos: `।`, `,` y `?`. No añade signos de exclamación, comillas, puntos suspensivos ni otros.
- Asume que las palabras están separadas por espacios; texto sin segmentar (p. ej., concatenado) puede degradar el rendimiento.
- Al ser un clasificador de tokens, no genera texto nuevo; su salida es una secuencia de etiquetas que deben aplicarse al texto original.
- No se han documentado sesgos específicos, pero al entrenarse sobre IndicCorp v2 Bangla, puede reflejar sesgos presentes en ese corpus (dominio, registro, variedad dialectal).
- La licencia Apache-2.0 permite uso comercial y modificación, pero se debe atribuir al autor original según la cita indicada en la model card.
- El repositorio actual tiene 0 descargas y 0 likes; es un republish reciente y no ha sido ampliamente validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SayedShaun/asr-punctuation-restore-bn
- Repositorio del paquete `asr-punct-restore`: https://github.com/sayedshaun/asr-punct-restore
- Writeup de la solución ganadora (Kaggle): https://www.kaggle.com/competitions/bengaliai-speech/writeups/chimege-1st-place-solution
- Competición Bengali.AI Speech Recognition: https://www.kaggle.com/competitions/bengaliai-speech
- Modelo base MuRIL: https://huggingface.co/google/muril-base-cased
- Espejo de los pesos originales: https://huggingface.co/bengaliAI/tugstugi_bengaliai-asr_whisper-medium
