# pipecat-ai/voice-reader

## Resumen

Voice Reader es un modelo de clasificación de audio desarrollado por pipecat-ai que analiza la prosodia del habla para extraer señales paralingüísticas: tono de voz, sarcasmo en la entrega, energía vocal, risa y velocidad del habla. Se trata de un modelo pequeño derivado de `laion/whisper-tiny-base-emotion-voice-burst`, distribuido en formato ONNX y diseñado para ejecutarse en CPU dentro de pipelines de agentes conversacionales de Pipecat. Su función es complementar al Tone Reader (que analiza las palabras transcritas), aportando la información que el texto no captura.

El modelo lee los últimos 8 segundos de audio de cada turno del usuario, una sola vez, cuando el VAD detecta que ha dejado de hablar, y escribe sus lecturas como etiquetas de percepción al inicio del mensaje del usuario. Se publica como release candidate experimental (rc1) y su calibración, nombres de salida y umbrales pueden cambiar entre versiones. La arquitectura subyacente es un encoder tipo Whisper tiny (transformer) adaptado a clasificación multi-cabeza, con dos variantes de tamaño: `base` (26M parámetros) y `tiny` (12,5M).

Es relevante porque aborda un hueco concreto en los pipelines de voz: los LLM reciben transcripciones planas que pierden la información emocional y pragmática de la señal acústica. Voice Reader añade esa capa con un coste computacional mínimo (decenas de milisegundos en CPU) y sin retrasar la transcripción, ya que se ejecuta en paralelo a la finalización del STT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Whisper tiny adaptado a clasificación multi-cabeza (base: `laion/whisper-tiny-base-emotion-voice-burst`) |
| Parámetros totales | 26M (`base`) / 12,5M (`tiny`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 8 segundos por turno |
| Tipos de cuantización | int8 ONNX (por defecto) y fp32 ONNX |
| Idiomas soportados | en (inglés) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (`model.int8.onnx`, `model.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de `laion/whisper-tiny-base-emotion-voice-burst`, un checkpoint derivado de Whisper tiny, y se ha adaptado a clasificación de audio con múltiples cabezas de salida: `tone` (cuatro etiquetas: positive, neutral, sad, frustrated, con calibración por temperatura), `sarcasm_voice` (calibración Platt sobre conversación real), `arousal`, `laughter`, `speech_rate`, `upset` y `sad` (esta última solo en la variante `base`). La inferencia se ejecuta con numpy y onnxruntime, sin dependencia de GPU.

El entrenamiento se apoya en etiquetas generadas por dos jueces LLM de audio (Gemini 3.1 Pro preview y OpenAI gpt-audio-1.5) que escuchan cada clip; un turno se considera sarcástico solo cuando ambos jueces coinciden (kappa de acuerdo en sarcasmo: 0,42). Los hablantes de test nunca aparecen en entrenamiento. El conjunto de evaluación de sarcasmo en conversación cotidiana comprende 4.366 turnos, de los cuales 203 son sarcásticos, procedentes de Open Yap, otoSpeech y HarperValley. No se especifican en la información disponible el número total de tokens de audio ni la composición completa del dataset de entrenamiento.

## Capacidades

- Clasificación de tono de voz en cuatro categorías (positive, neutral, sad, frustrated) con calibración por temperatura.
- Detección de sarcasmo en la entrega vocal (`sarcasm_voice`) con calibración Platt y umbral de publicación de 0,068.
- Estimación de energía vocal (`arousal`, rango 0-1).
- Detección de risa (`laughter`, rango 0-1).
- Estimación de velocidad del habla en sílabas por segundo (`speech_rate`).
- Lectura de grado de disgusto (`upset`, solo lectura interna, no publicada al LLM).
- Detección de tristeza percibida (`sad`, solo variante `base`, lectura interna).
- Integración nativa con pipelines Pipecat mediante `VoiceReaderProcessor`, que escribe las señales como percepción RCS al inicio del mensaje del usuario.
- Funcionamiento autónomo sin el Tone Reader (aunque se recomienda el uso conjunto).
- Ejecución en CPU con latencias de decenas de milisegundos.

## Casos de uso

- Agentes conversacionales de atención al cliente: el modelo permite al LLM detectar frustración o tristeza en la voz del usuario aunque las palabras sean neutras, ajustando el tono de respuesta. Con 8 segundos de ventana y latencias de 33-100 ms en M1 Max, encaja en pipelines en tiempo real sin penalizar la transcripción.
- Detección de sarcasmo en asistentes de voz: cuando las palabras suenan sinceras pero la entrega no, `sarcasm_voice` aporta una señal que el LLM pondera junto al `sarcasm` textual del Tone Reader, mejorando la interpretación pragmática en conversaciones cotidianas.
- Moderación y análisis de calidad en centros de llamadas: el modelo puede procesar los turnos de audio de cada llamada para generar métricas agregadas de arousal, risa y velocidad del habla, útiles para evaluar satisfacción o detectar situaciones de tensión.
- Sistemas de acompañamiento emocional o salud digital: la señal `sad` (variante `base`) y `upset` permiten al agente identificar indicios de tristeza o malestar en la voz, activando protocolos de respuesta empática o derivación.
- Investigación en pragmática computacional: el modelo sirve como extractor de features prosódicas etiquetadas (sarcasmo, arousal, risa, velocidad) para estudios de conversación o para entrenar clasificadores downstream.
- Despliegue en entornos con recursos limitados: la variante `tiny` (13,3 MB int8, ~45 ms en un hilo x86) permite incorporar percepción vocal en servidores de un solo vCPU o dispositivos edge donde no hay GPU disponible.
- Enriquecimiento de datasets de voz: el pipeline puede ejecutarse offline sobre grabaciones para anotar automáticamente turnos con señales paralingüísticas calibradas, reduciendo el coste de etiquetado manual.

## Benchmarks y rendimiento

| Métrica | `base` | `tiny` |
|---|---|---|
| Sarcasmo, conversación cotidiana (4.366 turnos, 203 sarcásticos), AUROC | 0,917 | 0,904 |
| Sarcasmo en umbral de release: F1 / recall / falsas alarmas en turnos sinceros | 0,575 / 0,50 / 1,3 % | 0,560 / 0,48 / 1,3 % |
| AUROC medio sobre cuatro conjuntos de test (dos conversacionales, Emolia, M...) | no disponible (truncado en la información) | no disponible (truncado en la información) |

| Rendimiento de inferencia | `base` | `tiny` |
|---|---|---|
| Tiempo de lectura p50, M1 Max, 4 hilos | 33 ms | 16 ms |
| Tiempo de lectura p50, M1 Max, 2 hilos | 56 ms | 26 ms |
| Tiempo de lectura p50, M1 Max, 1 hilo | 100 ms | 47 ms |
| Servidor x86, 1 hilo | ~100-150 ms | ~45 ms |
| Tamaño int8 ONNX | 28,6 MB | 13,3 MB |

## Requisitos de hardware

- Inferencia exclusivamente en CPU: no requiere GPU ni VRAM dedicada.
- Tamaño en disco: 28,6 MB (`base` int8) o 13,3 MB (`tiny` int8); las versiones fp32 ocupan más.
- Memoria RAM estimada: por debajo de 1 GB en ambos casos, dado el tamaño del modelo.
- Cabe en cualquier GPU consumer, pero no está pensado para ella; el runtime es onnxruntime sobre CPU.
- Despliegue mediante el runtime de Pipecat (`pipecat-ai[tone]`), que descarga el modelo desde el repositorio en la revisión fijada la primera vez.
- Recomendación del autor: asignar dos hilos a la variante `base` cuando la máquina lo permita.
- Latencia: 33-100 ms en M1 Max según hilos; ~45 ms (`tiny`) y ~100-150 ms (`base`) en un hilo x86.
- El coste de CPU se concentra al final de cada turno, en paralelo al VAD, el detector de turnos y la generación de respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| pipecat-ai/voice-reader (`base`) | 26M | 8 s de audio | SER + sarcasmo + prosodia | BSD-2-Clause | ONNX |
| pipecat-ai/voice-reader (`tiny`) | 12,5M | 8 s de audio | SER + sarcasmo + prosodia | BSD-2-Clause | ONNX |
| laion/whisper-tiny-base-emotion-voice-burst | no disponible | no disponible | Emoción vocal | no disponible | no disponible |
| pipecat-ai/tone-models (Tone Reader) | no disponible | texto del turno | Emoción y sarcasmo sobre palabras | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de los modelos comparables para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo experimental (release candidate rc1): los nombres de salida, la calibración y los umbrales pueden cambiar entre versiones; se recomienda fijar una revisión concreta.
- Las lecturas son señales para que un LLM las pondere, no veredictos para actuar de forma autónoma.
- `sarcasm_voice` es una señal débil por sí sola: su utilidad principal es contrastar con el `sarcasm` textual del Tone Reader; el autor recomienda ejecutar ambos.
- Solo soporta inglés (`en`); el rendimiento en otros idiomas no está documentado.
- No se escribe ninguna lectura para turnos con menos de 0,8 segundos de habla.
- `sarcasm_voice` se descarta cuando se detecta risa.
- El acuerdo entre jueces para las etiquetas de sarcasmo es moderado (kappa 0,42), lo que introduce ruido en el ground truth de evaluación.
- Riesgo de alucinación de señales: al ser un clasificador, puede producir lecturas erróneas en audio con ruido, solapamiento de hablantes o condiciones acústicas adversas; no se documentan sesgos específicos por género, acento o edad.
- La licencia BSD-2-Clause permite uso comercial con atribución y sin garantías; conviene revisar los términos del modelo base (`laion/whisper-tiny-base-emotion-voice-burst`) por si imponen condiciones adicionales.
- En producción, el coste de CPU al final de cada turno compite con el VAD, el detector de turnos y la generación de respuesta; en máquinas de un solo núcleo debe considerarse la variante `tiny`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipecat-ai/voice-reader
- Tone Reader (modelo complementario): https://huggingface.co/pipecat-ai/tone-models
- Modelo base: https://huggingface.co/laion/whisper-tiny-base-emotion-voice-burst
