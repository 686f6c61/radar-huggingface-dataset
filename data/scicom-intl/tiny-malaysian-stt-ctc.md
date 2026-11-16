# Scicom-intl/Tiny-Malaysian-STT-CTC

## Resumen

Tiny Malaysian STT CTC es un sistema de reconocimiento automático del habla (ASR) desarrollado por Scicom-intl, diseñado específicamente para el multilingüismo y el cambio de código (code-switching) propios de Malasia: malayo, inglés, mandarín y tamil, incluyendo las transiciones entre ellos dentro de una misma conversación. El modelo emplea una arquitectura Zipformer con cabeza CTC, cuenta con 36,1 millones de parámetros y ocupa 43,9 MB con pesos de 8 bits, lo que permite su ejecución en un único núcleo de CPU. Está pensado para escenarios de telefonía y audio de banda estrecha, gracias a un entrenamiento con aumento de datos de línea telefónica.

La relevancia del modelo radica en su relación entre tamaño y prestaciones: con un coste computacional mínimo, ofrece tasas de error competitivas en conjuntos de evaluación públicos y propios, incluyendo el benchmark malasio Revolab ASR-Benchmark-Public (WER 14,2), FLEURS en malayo (16,9), inglés (29,4), mandarín (CER 26,6) y tamil (19,7), así como Common Voice 22 tamil (12,1). Está publicado bajo licencia Apache 2.0 y se distribuye en formato ONNX para su uso con la librería sherpa-onnx, lo que facilita su integración en entornos de producción con recursos limitados.

La versión actual, `b-v3`, es la predeterminada en la raíz del repositorio y continúa el entrenamiento de `b-v2` (disponible en la carpeta `b-v2/`) con 90.000 horas de audio vistas, frente a las 60.000 de la versión anterior. El mismo entrenamiento produce un modelo transductor con el mismo codificador, publicado como Scicom-intl/Tiny-Malaysian-STT-Transducer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer con cabeza CTC |
| Parametros totales | 36,1 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de audio de hasta ~30 s por clip) |
| Tipos de cuantizacion | Pesos de 8 bits (int8); no se detallan otros formatos |
| Idiomas soportados | Malayo (ms), inglés (en), mandarín (zh), tamil (ta), con cambio de código entre ellos |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`), tokens en `tokens.txt` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Zipformer, un codificador basado en transformer con mecanismos de atención y convolución diseñados para eficiencia computacional, al que se añade una cabeza CTC para la decodificación. El entrenamiento se realizó desde cero sobre transcripciones generadas por un reconocedor de producción de gran tamaño (un Whisper large-v3 ajustado) y por anotadores humanos, con aumento de datos de línea telefónica para mejorar el rendimiento en llamadas de banda estrecha. La versión `b-v3` se entrenó sobre 90.000 horas de audio vistas, partiendo de una tabla de entrenamiento que creció hasta 4.071 horas, y continúa el entrenamiento de `b-v2`.

El modelo no es de tipo streaming: procesa un clip cada vez, de hasta aproximadamente 30 segundos, con remuestreo interno a 16 kHz y extracción de características de 80 dimensiones. La salida incluye mayúsculas, puntuación y agrupaciones con guiones para números de teléfono y letras deletreadas. El mismo entrenamiento produce un modelo transductor con el mismo codificador, lo que permite comparar ambas cabeceras de decodificación.

## Capacidades

- Reconocimiento automático del habla en malayo, inglés, mandarín y tamil, incluyendo cambio de código entre idiomas dentro de una misma emisión.
- Funcionamiento en audio telefónico de banda estrecha gracias al aumento de datos de línea telefónica.
- Salida con mayúsculas, puntuación y formato especial para números de teléfono y letras deletreadas.
- Procesamiento de clips de hasta aproximadamente 30 segundos, con remuestreo automático a 16 kHz desde cualquier frecuencia de muestreo.
- Ejecución en un único núcleo de CPU con pesos de 8 bits, sin necesidad de GPU.
- Integración con la librería sherpa-onnx mediante `OfflineRecognizer.from_zipformer_ctc`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo ASR.
- No dispone de modo de pensamiento (thinking mode), visión ni audio generativo.

## Casos de uso

- Atención al cliente telefónica: el modelo puede transcribir llamadas de banda estrecha en malayo, inglés, mandarín y tamil, incluyendo cambios de idioma, gracias a su entrenamiento con aumento de línea telefónica y a su WER de 25,9 en llamadas de call-center retenidas.
- Transcripción de reuniones y conversaciones multilingües en Malasia: al soportar code-switching entre los cuatro idiomas, es adecuado para entornos donde los hablantes alternan idiomas dentro de una misma intervención.
- Enrutamiento y análisis de llamadas en centros de contacto: la salida con números de teléfono y letras deletreadas agrupadas facilita la extracción de entidades como teléfonos o códigos postales en pipelines posteriores.
- Despliegue en dispositivos de borde o entornos sin GPU: con 43,9 MB en int8 y ejecución en un solo núcleo de CPU (RTF 0,017, 60 segundos de audio por segundo), es viable en servidores modestos, Raspberry Pi o contenedores ligeros.
- Transcripción de audio comprimido para archivos históricos: el modelo mantiene un WER de 14,7 con G.711 mu-law a 8 kHz, 15,9 con GSM full rate, 16,2 con Opus a 8 kbit/s y 15,8 con MP3 a 16 kbit/s, lo que lo hace apto para grabaciones telefónicas almacenadas con códecs de baja tasa.
- Subtitulado y indexación de contenido audiovisual malasio: permite generar transcripciones para búsqueda y accesibilidad en contenido que mezcla malayo, inglés, mandarín y tamil, con la limitación de procesar clips de hasta 30 segundos, por lo que requiere segmentación previa con un detector de actividad de voz.
- Preprocesamiento para pipelines de NLP: las transcripciones pueden alimentar sistemas de análisis de sentimiento, resumen o extracción de información en entornos multilingües de Malasia, con un coste computacional muy bajo.

## Benchmarks y rendimiento

Resultados de `b-v3` con decodificación greedy, pesos de 8 bits y un clip a la vez mediante sherpa-onnx. Tasas de error en porcentaje, menor es mejor.

| Conjunto | Métrica | Error |
|---|---:|---:|
| Malaysian benchmark (Revolab ASR-Benchmark-Public) | WER | 14,2 |
| FLEURS Malay | WER | 16,9 |
| FLEURS English | WER | 29,4 |
| FLEURS Mandarin | CER | 26,6 |
| FLEURS Tamil | WER | 19,7 |
| Common Voice 22 Tamil | WER | 12,1 |
| Regional Malay (held out, no público) | WER | 22,1 |
| Malaysian Mandarin (held out, no público) | CER | 20,5 |
| Call-centre calls (held out, no público) | WER | 25,9 |
| Synthetic call-centre speech (held out) | WER | 9,7 |

Rendimiento del benchmark malasio a través de códecs:

| Condición | WER |
|---|---:|
| Tal cual almacenado | 14,2 |
| G.711 mu-law, 8 kHz | 14,7 |
| GSM full rate, 8 kHz | 15,9 |
| Opus, 8 kbit/s | 16,2 |
| MP3, 16 kbit/s | 15,8 |

Comparación entre versiones `b-v2` y `b-v3` en los mismos clips:

| Conjunto | Métrica | `b-v2` | `b-v3` | Cambio |
|---|---:|---:|---:|---|
| Malaysian benchmark | WER | 15,4 | 14,2 | -1,2 (-1,7 a -0,7), mejor |
| FLEURS Malay | WER | 18,8 | 16,9 | -1,9 (-2,3 a -1,5), mejor |
| FLEURS English | WER | 32,8 | 29,4 | -3,4 (-3,9 a -2,8), mejor |
| FLEURS Mandarin | CER | 28,1 | 26,6 | -1,5 (-1,8 a -1,2), mejor |
| FLEURS Tamil | WER | 21,3 | 19,7 | -1,5 (-1,9 a -1,2), mejor |
| Common Voice 22 Tamil | WER | 13,7 | 12,1 | -1,6 (-1,9 a -1,4), mejor |
| Regional Malay | WER | 24,1 | 22,1 | -2,0 (-2,6 a -1,4), mejor |
| Malaysian Mandarin | CER | 21,8 | 20,5 | -1,3 (-2,1 a -0,5), mejor |
| Call-centre calls | WER | 26,8 | 25,9 | -0,9 (-1,5 a -0,4), mejor |
| Synthetic call-centre speech | WER | 11,9 | 9,7 | -2,2 (-3,3 a -1,3), mejor |
| Malaysian benchmark G.711 mu-law | WER | 16,0 | 14,7 | -1,3 (-1,8 a -0,8), mejor |
| Malaysian benchmark GSM full rate | WER | 17,0 | 15,9 | -1,1 (-1,6 a -0,7), mejor |
| Malaysian benchmark Opus 8 kbit/s | WER | 17,4 | 16,2 | -1,2 (-1,6 a -0,7), mejor |
| Malaysian benchmark MP3 16 kbit/s | WER | 16,8 | 15,8 | -1,0 (-1,5 a -0,5), mejor |

Progreso durante el entrenamiento (WER en porcentaje, pesos de 8 bits):

| Ejecución | Audio de entrenamiento | Audio visto | CTC | Transductor |
|---|---:|---:|---:|---:|
| Prueba: solo audio etiquetado por humanos y sintético | 824 h | 20.000 h | 36,4 | 24,8 |
| Prueba: todas las fuentes (transcripciones del profesor añadidas) | 1.995 h | 20.000 h | 22,2 | 14,5 |
| `b-v2` | 1.723 h, creciendo a 3.771 h | 60.000 h | 15,4 | 10,3 |
| `b-v3` | 1.723 h, creciendo a 4.071 h | 90.000 h | 14,2 | 10,3 |

Velocidad en un núcleo de CPU: 60 segundos de audio por segundo (RTF 0,017), con clips de 9 segundos de media.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo ocupa 43,9 MB en pesos int8 y se ejecuta en CPU.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no es su objetivo.
- Cabe en GPU de consumo: no aplica, ya que no necesita GPU; cabe en cualquier CPU moderna, incluyendo dispositivos de borde.
- Opciones de despliegue: sherpa-onnx (librería oficial), con soporte para Python mediante `sherpa_onnx.OfflineRecognizer.from_zipformer_ctc`. No se mencionan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este modelo ASR.
- Latencia y throughput: RTF 0,017 en un núcleo de CPU, es decir, 60 segundos de audio procesados por segundo, con clips de 9 segundos de media.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. El autor menciona un modelo transductor con el mismo codificador (Scicom-intl/Tiny-Malaysian-STT-Transducer), que comparte arquitectura y entrenamiento, pero no se ofrecen comparaciones con otros modelos ASR de la misma categoría. Por tanto, la comparativa con alternativas externas se considera no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Tiny Malaysian STT CTC (este modelo) | 36,1 M | clips de ~30 s | WER 14,2 en benchmark malasio | Apache 2.0 | Hugging Face, ONNX |
| Tiny Malaysian STT Transducer | mismo codificador | clips de ~30 s | WER 10,3 en benchmark malasio (transductor) | Apache 2.0 | Hugging Face |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de streaming: procesa un clip cada vez y requiere segmentación previa de audio largo, por ejemplo con un detector de actividad de voz.
- Longitud máxima de entrada de aproximadamente 30 segundos por clip; no admite audio más largo sin cortes.
- Los conjuntos de evaluación propios (Regional Malay, Malaysian Mandarin, Call-centre calls, Synthetic call-centre speech) no son públicos, lo que limita la reproducibilidad externa de esos resultados.
- El rendimiento en inglés (WER 29,4 en FLEURS) y en mandarín (CER 26,6) es notablemente peor que en malayo y tamil, lo que refleja el sesgo del entrenamiento hacia el malayo y el tamil.
- Riesgo de alucinación y errores en condiciones acústicas adversas: el WER en llamadas reales de call-center es del 25,9, considerablemente superior al de conjuntos sintéticos o de lectura.
- No se han publicado análisis de sesgos demográficos, acentos regionales o variedades dialectales del malayo más allá de los conjuntos retenidos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se entrenó con transcripciones generadas por un Whisper large-v3 ajustado, cuyas condiciones de licencia podrían afectar a la redistribución de los datos derivados; no se detalla en la información disponible.
- El modelo no soporta tool calling, agentes ni razonamiento; cualquier uso en pipelines de NLP requiere etapas posteriores.
- La información sobre cuantizaciones distintas de int8 no está disponible; no se documentan versiones fp16 o fp32.

## Enlaces

- Hugging Face: https://huggingface.co/Scicom-intl/Tiny-Malaysian-STT-CTC
- Modelo transductor con el mismo codificador: https://huggingface.co/Scicom-intl/Tiny-Malaysian-STT-Transducer
- Librería sherpa-onnx: no disponible en la información proporcionada
- Benchmark Revolab ASR-Benchmark-Public: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
