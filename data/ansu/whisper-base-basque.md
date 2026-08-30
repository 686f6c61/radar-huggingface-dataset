# Ansu/whisper-base-basque

## Resumen

Ansu/whisper-base-basque es un modelo de reconocimiento automático del habla (ASR) obtenido mediante fine-tuning de openai/whisper-base sobre un conjunto de datos en euskera no especificado. El autor, Ansu, ha publicado varios fine-tunes de la familia Whisper para esta lengua, incluyendo versiones basadas en whisper-large-v3. Este modelo concreto utiliza la arquitectura base de Whisper, con aproximadamente 72,6 millones de parámetros y una ventana de contexto de 30 segundos de audio, la configuración estándar de los modelos Whisper.

El interés de este modelo radica en su especialización para el euskera, una lengua minoritaria con escasos recursos de ASR de calidad. Al partir de whisper-base, un modelo multilingüe entrenado con supervisión débil sobre 680.000 horas de audio, el fine-tuning pretende adaptar las representaciones aprendidas al euskera. Sin embargo, los resultados reportados muestran una tasa de error de palabra (WER) del 58,5 % en el conjunto de validación, un valor elevado que sugiere que el modelo aún tiene margen de mejora o que el conjunto de evaluación es particularmente difícil. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que facilita su integración en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 72.593.920 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | Euskera (fine-tune), aunque el modelo base es multilingüe (99 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper de OpenAI: un transformer encoder-decoder con atención causal en el decoder y atención bidireccional en el encoder. El encoder procesa espectrogramas log-Mel de 80 canales y el decoder genera los tokens de texto autoregresivamente. Whisper-base tiene 12 capas en el encoder y 12 en el decoder, con un ancho de 512 dimensiones y 8 cabezas de atención. El modelo base original fue entrenado sobre 680.000 horas de audio multilingüe con supervisión débil, incluyendo tareas de transcripción, traducción y detección de idioma.

El fine-tuning se realizó sobre un dataset en euskera no descrito en la model card. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-5, batch de entrenamiento de 192 y batch de evaluación de 96, con optimizador Adam (beta1=0.9, beta2=0.999, epsilon=1e-8), scheduler lineal con 500 pasos de warmup y 10.000 pasos totales. Se usó entrenamiento con precisión mixta nativa (AMP). La pérdida de validación final fue de 0.2499 y el WER de 58.52, con fluctuaciones considerables a lo largo del entrenamiento (el mejor WER observado fue 41.13 en el paso 6000, pero no se mantuvo).

## Capacidades

- Transcripción de audio en euskera a texto, la tarea principal para la que fue fine-tuned.
- Al estar basado en Whisper, conserva la capacidad de realizar detección de idioma y traducción de voz a texto (aunque el fine-tuning puede haber degradado estas capacidades en otros idiomas).
- Soporta entrada de audio de hasta 30 segundos por ventana; para audios más largos se requiere segmentación.
- Puede utilizarse con el pipeline de Transformers (`AutomaticSpeechRecognition`) o con la librería `whisper` de OpenAI.
- No se ha documentado soporte para tool calling, agentes u otras capacidades no relacionadas con ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en euskera: el modelo puede procesar grabaciones de audio segmentadas en ventanas de 30 segundos para generar actas textuales, útil en entornos administrativos y empresariales de comunidades vascas.
- Subtitulado automático de vídeos y podcasts en euskera: integrado en pipelines de postproducción, permite generar subtítulos en tiempo real o diferido para contenido audiovisual dirigido a hablantes de euskera.
- Asistentes de voz para servicios públicos: al ser un modelo ligero (72,6M parámetros), puede desplegarse en servidores modestos o incluso en dispositivos edge para habilitar interacción por voz en euskera en kioscos, atención telefónica o aplicaciones móviles.
- Archivado y búsqueda de contenido histórico: transcripción de archivos sonoros de bibliotecas o hemerotecas vascas para hacerlos indexables y buscables, preservando el patrimonio lingüístico.
- Herramientas de accesibilidad: generación de subtítulos en tiempo real para personas con discapacidad auditiva en eventos, conferencias o clases impartidas en euskera.
- Investigación lingüística: análisis de corpus orales en euskera, permitiendo a lingüistas y sociolingüistas procesar grandes volúmenes de audio para estudios de variación dialectal o análisis del discurso.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de entrenamiento y validación:

| Paso | Pérdida de entrenamiento | Pérdida de validación | WER |
|------|--------------------------|------------------------|-----|
| 500 | 0.4078 | 0.5613 | 137.59 |
| 1000 | 0.2533 | 0.3971 | 103.77 |
| 1500 | 0.1994 | 0.3350 | 72.62 |
| 2000 | 0.1723 | 0.3100 | 54.83 |
| 2500 | 0.1403 | 0.2895 | 48.00 |
| 3000 | 0.1318 | 0.2799 | 63.62 |
| 3500 | 0.1279 | 0.2711 | 76.52 |
| 4000 | 0.1192 | 0.2666 | 59.57 |
| 4500 | 0.1040 | 0.2604 | 54.14 |
| 5000 | 0.0986 | 0.2601 | 53.64 |
| 5500 | 0.0929 | 0.2540 | 59.47 |
| 6000 | 0.0971 | 0.2522 | 41.13 |
| 6500 | 0.0806 | 0.2526 | 52.04 |
| 7000 | 0.0812 | 0.2508 | 54.22 |
| 7500 | 0.0816 | 0.2498 | 55.63 |
| 8000 | 0.0799 | 0.2511 | 62.85 |
| 8500 | 0.0723 | 0.2500 | 55.05 |
| 9000 | 0.0724 | 0.2498 | 59.05 |
| 9500 | 0.0707 | 0.2502 | 53.70 |
| 10000 | 0.0685 | 0.2499 | 58.52 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 2 GB con precisión FP32; menos de 1 GB con cuantización a int8 o FP16. El modelo tiene 72,6M de parámetros, lo que equivale a ~290 MB en FP32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 2060, RTX 3060, o incluso CPU para inferencia no en tiempo real.
- Cabe en GPUs de consumo básicas; también es ejecutable en Raspberry Pi con cuantización extrema (por ejemplo, Q4).
- Opciones de despliegue: Transformers de HuggingFace (pipeline `automatic-speech-recognition`), librería `whisper` de OpenAI, o conversión a GGUF para usar con llama.cpp o whisper.cpp.
- Latencia estimada: para un audio de 30 segundos, la inferencia en GPU RTX 3060 tarda aproximadamente 1-2 segundos; en CPU puede tardar 5-10 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER en euskera (validación) | Licencia |
|--------|------------|----------|-----------------------------|----------|
| Ansu/whisper-base-basque | 72,6M | 30 s | 58,52 | Apache 2.0 |
| openai/whisper-base | 72,6M | 30 s | no disponible para euskera | MIT (código) / Apache 2.0 (pesos) |
| openai/whisper-small | 244M | 30 s | no disponible para euskera | MIT (código) / Apache 2.0 (pesos) |

No se dispone de datos comparativos de rendimiento de otros modelos en euskera. El autor también ha publicado `Ansu/whisper-large-v3-basque-lr1e-5` (basado en whisper-large-v3, con 1550M parámetros), que podría ofrecer mejor WER pero con mayores requisitos de hardware.

## Limitaciones y advertencias

- El WER de validación es alto (58,5 %), lo que indica que el modelo puede tener dificultades con acentos, ruido o vocabulario específico del conjunto de evaluación. No es recomendable para uso en producción sin una evaluación más exhaustiva sobre datos reales.
- El dataset de entrenamiento no está descrito; se desconoce su tamaño, dominio y calidad. Esto dificulta la reproducibilidad y la evaluación de sesgos.
- El entrenamiento muestra una alta varianza en el WER a lo largo de los pasos (oscila entre 41 y 137), lo que sugiere inestabilidad o un conjunto de validación pequeño o heterogéneo.
- Al ser un fine-tune de whisper-base, puede haber degradado su capacidad multilingüe original; solo se recomienda su uso para euskera.
- El modelo hereda las limitaciones de Whisper: ventana de audio fija de 30 segundos, sensibilidad a la calidad del audio y posibles errores en nombres propios o términos técnicos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni soporte.
- No se han realizado evaluaciones de sesgos de género, dialecto o acento en euskera.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ansu/whisper-base-basque
- Fine-tune de whisper-large-v3 del mismo autor: https://huggingface.co/Ansu/whisper-large-v3-basque-lr1e-5
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Model card original de Whisper: https://github.com/openai/whisper/blob/main/model-card.md
