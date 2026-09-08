# seniruk/whisper-medium-si-v2

## Resumen

`seniruk/whisper-medium-si-v2` es un modelo de reconocimiento automático de voz (ASR) desarrollado por el usuario `seniruk` mediante fine-tuning del modelo base `openai/whisper-medium` sobre un dataset de cingalés (idioma `si`) compuesto por archivos CSV y FLACs. El objetivo es mejorar la transcripción de audio en este idioma de bajos recursos, donde los modelos genéricos de Whisper suelen presentar un rendimiento limitado.

El modelo mantiene la arquitectura original de Whisper Medium, un transformer encoder-decoder con 763.857.920 parámetros, y se distribuye con licencia Apache 2.0 en formato safetensors. Al estar basado en Whisper, hereda su ventana de contexto de audio de 30 segundos por pasada. El fine-tuning se realizó durante 3 épocas con una tasa de aprendizaje de 1e-5 y optimizador AdamW, alcanzando un WER del 22,14 % en el conjunto de evaluación. Es una opción práctica para aplicaciones de transcripción en cingalés, aunque su rendimiento depende de la calidad del audio y del dominio específico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Medium) |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Cingalés (si) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `openai/whisper-medium`, que implementa un transformer encoder-decoder con atención por capas y codificación posicional. El encoder procesa espectrogramas Mel de 80 canales, mientras que el decoder genera texto tokenizado. Al ser un fine-tuning, la arquitectura y el tokenizador son idénticos al modelo base, por lo que la ventana de contexto de audio se mantiene en 30 segundos.

El entrenamiento se realizó sobre un dataset de cingalés compuesto por transcripciones CSV y archivos de audio FLAC. Los hiperparámetros declarados en la model card incluyen una tasa de aprendizaje de 1e-5, tamaño de lote de entrenamiento de 4, acumulación de gradientes de 4 (tamaño de lote efectivo de 16), lote de evaluación de 24, optimizador AdamW con betas (0.9, 0.999), scheduler de tipo coseno con 500 pasos de warmup, 3 épocas y entrenamiento en precisión mixta (Native AMP). No se indica la cantidad exacta de tokens ni la composición detallada del dataset.

## Capacidades

- Transcripción de audio en cingalés (si), produciendo texto escrito a partir de señales de voz.
- Reconocimiento de voz para audios de hasta 30 segundos por pasada, con soporte para procesar fragmentos más largos mediante segmentación.
- Generación de texto con puntuación básica y normalización, heredada del tokenizador de Whisper.
- Sin soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de visión, ya que es un modelo puramente de ASR.
- No se han documentado capacidades multilingües más allá del cingalés, aunque el modelo base Whisper Medium es multilingüe; este fine-tuning está especializado en `si`.

## Casos de uso

- Subtitulado automático de vídeos en cingalés: el modelo puede transcribir el audio de vídeos y generar subtítulos sincronizados, lo que resulta útil para productoras, creadores de contenido y plataformas de streaming.
- Transcripción de reuniones y entrevistas en cingalés: integrado en una aplicación de grabación, permite obtener actas textuales de reuniones con una ventana de 30 segundos por segmento, suficiente para frases cortas y turnos de palabra.
- Accesibilidad para personas con discapacidad auditiva: el modelo puede alimentar sistemas de subtitulado en tiempo real en entornos educativos o corporativos, mejorando la inclusión de hablantes de cingalés.
- Análisis de llamadas de atención al cliente: transcribir llamadas en cingalés para extraer información, detectar incidencias o evaluar la calidad del servicio mediante análisis posterior de texto.
- Indexación de archivos de audio: convertir grandes volúmenes de audio (por ejemplo, archivos históricos, radio o podcasts) en texto para habilitar búsqueda por contenido y análisis de datos.
- Dictado por voz en aplicaciones de mensajería o procesadores de texto: el modelo permite dictar mensajes o documentos en cingalés, sustituyendo al teclado en dispositivos móviles o de escritorio.

## Benchmarks y rendimiento

El autor del modelo declara los siguientes resultados en el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Loss | 0.0657 |
| WER | 22.1361 |
| WER Raw | 24.8976 |

La tabla de entrenamiento incluida en la model card muestra una progresión del WER desde 36,39 % en el paso 2000 hasta 22,14 % en el paso 26000, lo que indica una mejora significativa a lo largo del fine-tuning. No se han publicado resultados de benchmarks comparativos con otros modelos de ASR para cingalés en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en fp16 y 0,8 GB en int8, calculado a partir de los 763,8 millones de parámetros.
- GPU recomendadas: una RTX 3060 de 8 GB es suficiente para inferencia en fp16 con lotes pequeños; para lotes mayores o procesamiento por lotes, se recomienda una A100 o H100.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en cuantización int8 o fp16.
- Opciones de despliegue: pipeline de `transformers` para ASR, `whisper.cpp` para inferencia en CPU o GPU de consumo, y servicios de inferencia gestionada como Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Idiomas | Rendimiento en cingales |
|---|---|---|---|---|---|
| seniruk/whisper-medium-si-v2 | 763.857.920 | 30 s | Apache 2.0 | si | WER 22,14 % (declarado) |
| openai/whisper-medium | 769.000.000 aprox. | 30 s | MIT | multilenguaje | no disponible |
| openai/whisper-small | 244.000.000 aprox. | 30 s | MIT | multilenguaje | no disponible |
| openai/whisper-large-v3 | 1.550.000.000 aprox. | 30 s | MIT | multilenguaje | no disponible |

No se han publicado comparativas directas de rendimiento entre este fine-tuning y otros modelos de ASR para cingalés, por lo que la tabla anterior se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en cingalés; su rendimiento en otros idiomas es previsiblemente bajo.
- El WER declarado del 22,14 % indica una tasa de error considerable, que puede aumentar con ruido de fondo, acentos regionales o vocabulario técnico.
- No se ha documentado el proceso de limpieza ni la composición del dataset de entrenamiento, lo que dificulta evaluar posibles sesgos lingüísticos o demográficos.
- Al ser un modelo de ASR, existe riesgo de alucinaciones, especialmente en segmentos de silencio o audio ininteligible, un comportamiento conocido en la familia Whisper.
- La ventana de contexto de 30 segundos limita la transcripción directa de audios largos, que requieren segmentación previa.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin información sobre el proceso de evaluación fuera del conjunto de validación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seniruk/whisper-medium-si-v2
- Modelo base openai/whisper-medium: https://huggingface.co/openai/whisper-medium
- No se han encontrado papers, blogs o demos adicionales en la búsqueda web.
