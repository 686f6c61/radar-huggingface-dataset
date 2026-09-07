# Scicom-intl/semantic-vad-eot-whisper-base

## Resumen

Semantic-VAD es un modelo de clasificacion de audio desarrollado por Scicom-intl que detecta el fin de turno (end-of-turn) en conversaciones de voz. Esta variante `semantic-vad-eot-whisper-base` es la version con encoder 2,5 veces mayor que la variante tiny del mismo autor, manteniendo el mismo contrato de entrada, datos y receta de entrenamiento. A partir de los ultimos 8 segundos de audio de un hablante a 16 kHz, devuelve la probabilidad de que el hablante haya terminado su turno (`p(end of turn)`) frente a una pausa a mitad de frase, sin necesidad de transcripcion (STT).

El modelo tiene 20 millones de parametros, pesa 24 MB en formato ONNX int8 y esta licenciado bajo Apache 2.0. Se disena para integrarse en pipelines de agentes de voz, como LiveKit Agents, donde actua como detector de endpointing despues de un VAD tradicional. La relevancia actual radica en la necesidad de reducir falsos cortes y latencia en asistentes de voz, especialmente en telefonica y escenarios multilingues (ingles y malayo). Los benchmarks del autor muestran mejoras notables frente a VAD puro y a otros detectores abiertos, con un AUC de 0,88 en el pipeline LiveKit y latencias p50/p90 de 0,64/0,74 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-base adaptado para clasificacion de audio (audio-classification) |
| Parametros totales | 20 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 segundos de audio a 16 kHz |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | Ingles (en), Malayo (ms) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo base), ONNX (int8) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Whisper-base, pero se emplea como clasificador de audio en lugar de como modelo de transcripcion. La entrada son los ultimos 8 segundos de audio mono a 16 kHz, y la salida es una probabilidad binaria que indica si el hablante ha terminado su turno o si ha hecho una pausa breve. No se genera texto ni se utiliza decodificacion autoregresiva, lo que lo hace apto para inferencia de baja latencia en CPU.

Los datos de entrenamiento son compartidos con la variante tiny del mismo autor, segun el README. El autor menciona que se evaluo con 300 grabaciones de turnos telefonicos y con 1.000 turnos de prueba en el harness de `eot-bench`. No se detalla la composicion exacta del dataset ni si se aplico RLHF o DPO, pero el enfoque es de clasificacion supervisada sobre audio. La innovacion principal es la deteccion semantica de fin de turno sin transcripcion, que permite capturar senales de prosodia y pausas que un VAD clasico no distingue. La exportacion a ONNX int8 reduce el modelo a 24 MB y permite una ejecucion rapida en CPU.

## Capacidades

- Deteccion de fin de turno en audio: clasifica si un hablante ha terminado su intervencion o si sigue hablando tras una pausa.
- Sin necesidad de transcripcion (STT), lo que reduce latencia y dependencia de modelos de reconocimiento de voz.
- Entrada de audio de 8 segundos a 16 kHz, pensada para escenarios de telefonia y agentes de voz.
- Integracion nativa con LiveKit Agents 1.8 mediante un adaptador de turno que combina VAD, detector y endpointing.
- Soporte multilingue para ingles y malayo, con resultados publicados en ambos idiomas.
- No tiene capacidades de generacion de texto, tool calling ni razonamiento simbolico; es exclusivamente un clasificador de audio.

## Casos de uso

- Endpointing en agentes de voz: el modelo se puede integrar en pipelines como LiveKit Agents para decidir el momento exacto en que el usuario ha terminado de hablar y el asistente puede tomar el turno. Su baja latencia (0,64 s p50) y su AUC de 0,88 reducen los cortes injustificados en conversaciones reales.
- Telefonia y centros de llamadas: analisis de turnos de habla en llamadas de soporte o ventas, donde es crucial saber si el cliente ha terminado su frase o simplemente ha hecho una pausa breve. El modelo trabaja sobre audio de telefonia y no requiere transcripcion, lo que simplifica el despliegue.
- Asistentes de voz en aplicaciones moviles: para hablantes de ingles o malayo, el modelo puede sustituir a un VAD puro y mejorar la fluidez del dialogo, evitando que el asistente interrumpa durante pausas reflexivas.
- Sistemas de dialogo humano-robot: control de turnos en interacciones con robots o avatares, donde la deteccion de fin de turno es critica para responder en el momento adecuado y evitar solapamientos.
- Evaluacion de calidad en llamadas: medicion de tiempos de respuesta, duracion de turnos y frecuencia de interrupciones en entrevistas o teleoperacion, usando el modelo como etiquetador automatico de segmentos de habla.
- Investigacion en interaccion conversacional: el modelo proporciona una senal de fin de turno fiable para estudiar la dinamica de pausas y solapamientos en corpus de audio, sin necesidad de transcripcion previa.

## Benchmarks y rendimiento

El autor publica resultados en un pipeline real de LiveKit Agents 1.8 (con Silero VAD y endpointing, sin STT) sobre 300 turnos telefonicos grabados. Con el umbral recomendado de 0,3, el modelo logra una latencia p50/p90 de 0,64/0,74 segundos, un 9,7 % de turnos cortados y un AUC de 0,88, superando al VAD puro y al detector smart-turn-v3.

| Turn detector | Latencia p50 / p90 | Turnos cortados | Turnos completados en fast path | AUC (eot vs hold) |
|---|---:|---:|---:|---:|
| VAD only | 0,63 / 0,71 s | 14,3 % | – | – |
| smart-turn-v3, threshold 0.5 | 0,65 / 3,04 s | 10,0 % | 82 % | 0,74 |
| tiny variant, threshold 0.5 | 0,64 / 0,74 s | 10,0 % | 95 % | 0,84 |
| **este modelo, threshold 0.3** | **0,64 / 0,74 s** | **9,7 %** | **96 %** | **0,88** |
| este modelo, threshold 0.5 | 0,65 / 2,93 s | 9,3 % | 90 % | 0,88 |

Tambien se publican resultados offline a puntos fijos relativos al inicio de cada pausa (AUC sobre las mismas 300 grabaciones, todas las pausas):

| Corte relativo al inicio de la pausa | -0,4 s | -0,2 s | 0,0 s | +0,2 s | +0,6 s |
|---|---:|---:|---:|---:|---:|
| smart-turn-v3 | 0,60 | 0,62 | 0,63 | 0,65 | 0,69 |
| tiny variant (int8) | 0,72 | 0,78 | 0,80 | 0,81 | 0,97 |
| **este modelo (int8)** | **0,77** | **0,82** | **0,85** | **0,87** | **0,98** |

En el harness de `eot-bench` sobre 1.000 turnos telefonicos de prueba, el modelo obtiene un AUC de 0,84 en ingles y 0,86 en malayo, con cortes al 47,3 % y 49,1 % respectivamente con un presupuesto de 300 ms. La tabla completa no se reproduce aqui por extension, pero el autor indica que el modelo supera al tiny y a smart-turn-v3 en todos los subconjuntos evaluados.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM dedicada; es un modelo de clasificacion de audio que se ejecuta en CPU. El peso int8 es de 24 MB, con un consumo de memoria inferior a 100 MB durante la inferencia.
- GPU recomendada: ninguna. La inferencia esta optimizada para CPU; el README reporta 69 ms por prediccion en una CPU ocupada, frente a 34 ms del modelo tiny.
- Compatibilidad con GPU de consumo: no es necesario, pero si se despliega en GPU, cualquier modelo de la serie RTX o superior lo ejecutaria con margen amplio.
- Opciones de despliegue: ONNX Runtime (formato int8), transformers (pipeline de audio-classification), integracion en LiveKit Agents 1.8 mediante adaptadores de turno. No es compatible con llama.cpp ni con motores de LLM, ya que no es un modelo de lenguaje.
- Latencia y throughput: 69 ms por prediccion en CPU ocupada; en un pipeline LiveKit completo, la latencia p50/p90 es de 0,64/0,74 segundos con el umbral 0,3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUC en pipeline | Latencia p50/p90 | Licencia |
|---|---|---:|---:|---:|---|
| Semantic-VAD whisper-base (este modelo) | 20 M | 8 s audio | 0,88 | 0,64 / 0,74 s | Apache 2.0 |
| Semantic-VAD whisper-tiny | no disponible | 8 s audio | 0,84 | 0,64 / 0,74 s | Apache 2.0 |
| smart-turn-v3 | no disponible | no disponible | 0,74 | 0,65 / 3,04 s | no disponible |
| VAD baseline | – | – | – | 0,63 / 0,71 s | – |

El modelo base ofrece un AUC superior al tiny (0,88 vs 0,84) a costa de aproximadamente el doble de computo (69 ms vs 34 ms por prediccion). En el pipeline real, la diferencia en cortes de turno es marginal (9,7 % vs 10,0 %), por lo que el autor recomienda el modelo tiny para produccion si el CPU es el cuello de botella. Frente a smart-turn-v3, el modelo base es claramente superior en AUC y en latencia p90, evitando los picos de 3 segundos que se observan con el umbral 0,5.

## Limitaciones y advertencias

- Idiomas limitados: el modelo solo esta entrenado y evaluado en ingles y malayo. Su rendimiento en otros idiomas no esta documentado y probablemente degrade.
- Solo audio, sin transcripcion: no se puede utilizar para analizar el contenido semantico de las frases, solo para detectar fin de turno.
- Sensibilidad al umbral: el umbral recomendado es 0,3, no 0,5, porque la exportacion int8 produce puntuaciones mas bajas que el modelo tiny. Con un umbral inadecuado se pueden aumentar los falsos cortes o retrasar la respuesta hasta `max_delay`.
- En la evaluacion del autor, aun con el umbral optimo se cortan un 9,7 % de los turnos en el pipeline LiveKit. En escenarios con habla superpuesta o ruido, esta cifra puede empeorar.
- No se publican datos de sesgos demograficos o de acentos. Al ser un clasificador de audio, puede verse afectado por variaciones de prosodia, ruido de fondo o calidad de telefonia.
- Licencia Apache 2.0: permite uso comercial y redistribucion, pero el modelo depende del dataset original de Whisper (MIT) y de la adaptacion propia; se deben revisar los avisos de licencia del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Scicom-intl/semantic-vad-eot-whisper-base
- Variante tiny: https://huggingface.co/Scicom-intl/semantic-vad-eot-whisper-tiny
- Dataset de evaluacion: https://huggingface.co/datasets/Scicom-intl/semantic-vad-eot
- Repositorio del harness de benchmark: https://github.com/livekit/eot-bench
