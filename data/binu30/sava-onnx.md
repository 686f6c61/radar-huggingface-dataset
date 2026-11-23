# Binu30/sava-onnx

## Resumen

sava-onnx es una conversión no oficial a ONNX del modelo SAVA (semantic acoustic voice activity) de Inworld AI, un detector de actividad de voz (VAD) que además predice el final de turno en conversaciones habladas. El modelo original lo desarrolla Inworld AI; esta versión la publica el usuario Binu30 como conversión comunitaria de los mismos pesos, sin respaldo del autor original. Resuelve dos problemas en una sola pasada: determinar si hay habla en cada trama de audio y estimar si el hablante ha terminado su turno, con una granularidad de 40 ms.

La relevancia de esta conversión está en la eliminación de la dependencia de PyTorch: los seis grafos ONNX (offline y streaming, en fp32, fp16 e int8) funcionan sobre ONNX Runtime en Python, Node.js, navegador, C/C++, C#, Java, Rust, Go, Android e iOS. El modelo int8 de streaming ocupa 32 MB y procesa una trama de 40 ms en torno a 1,6 ms en un hilo de CPU (Apple M-series, onnxruntime 1.32), lo que lo hace viable para agentes de voz en tiempo real sobre hardware modesto.

La arquitectura subyacente es la del modelo SAVA original, que combina VAD acústico con predicción semántica de fin de turno. La información disponible no detalla el número de parámetros ni la longitud de contexto en tokens del modelo base; el repositorio pesa 0,4 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para VAD y detección de fin de turno (detalles del backbone no disponibles); exportada a grafos ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; procesa audio en tramas de 40 ms (640 muestras a 16 kHz) con 3 tramas de lookahead (120 ms) para el veredicto de habla |
| Tipos de cuantizacion | fp32, fp16 (pesos), int8 |
| Idiomas soportados | no disponible (el modelo opera sobre señal acústica, no sobre texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (seis grafos: offline y streaming, cada uno en fp32, fp16 e int8) |

## Arquitectura y entrenamiento

La información disponible no describe en detalle la arquitectura interna del modelo SAVA original. Se sabe que combina detección de actividad de voz con predicción de fin de turno de forma conjunta, y que el checkpoint original está almacenado en bf16. La conversión a ONNX preserva el comportamiento del modelo PyTorch: los grafos fp32 y fp16 coinciden con la referencia dentro de 5e-6, y el grafo int8 mantiene el 99,8 % de los veredictos de habla. No se dispone de datos sobre el número de tokens de audio empleados en el entrenamiento, la composición del dataset ni si hubo ajuste por RLHF o DPO.

La innovación técnica de esta conversión es la exportación a seis grafos ONNX con dos modos de ejecución. El modo offline acepta una grabación completa de longitud arbitraria y devuelve curvas por trama (`speech`, `speech_on_time`, `turn` con horizontes de 0, 5, 10 y 20 tramas, y `turn_flush`); el modo streaming procesa una trama de 40 ms por llamada con el estado gestionado por el integrador. La memoria de atención crece con el cuadrado de la longitud del clip en modo offline, por lo que para grabaciones de más de unos minutos se recomienda el grafo de streaming. La API de Python (`run`, `Session`, `Policy`, `segment`) replica la del paquete oficial `inworld-sava`, y los turnos segmentados coinciden exactamente con el segmentador oficial en fp32 y fp16, y dentro de una trama en int8.

## Capacidades

- Detección de actividad de voz (VAD) por trama con resolución de 40 ms, con veredicto de habla que incorpora 120 ms de lookahead.
- Predicción de fin de turno con cuatro horizontes temporales (0, 5, 10 y 20 tramas), lo que permite anticipar el final del turno antes de que ocurra.
- Segmentación de turnos con política configurable (`Policy`) que filtra turnos cortos y decide qué segmentos conservar.
- Procesamiento en streaming con estado incremental: acepta fragmentos de audio de cualquier tamaño y mantiene el estado entre llamadas.
- Procesamiento offline de grabaciones completas en una sola llamada.
- Ejecución en CPU sin PyTorch, con dependencias limitadas a numpy y onnxruntime en Python.
- Portabilidad multiplataforma vía ONNX Runtime: Python, Node.js, navegador (onnxruntime-web), C/C++, C#, Java, Rust, Go, Android e iOS.
- Entrada de audio estandarizada: 16 kHz mono, float32 en el rango [-1, 1].
- No dispone de capacidades de generación de texto, razonamiento, código, visión ni tool calling; es un modelo exclusivamente de audio.

## Casos de uso

- Agentes de voz en tiempo real: el grafo `sava_streaming_int8.onnx` permite detectar cuándo empieza y termina el turno del usuario en cada trama de 40 ms, de modo que el agente puede interrumpir o responder sin esperar silencios fijos. Es adecuado por su latencia de 1,6 ms por trama en CPU y su tamaño de 32 MB.
- Atención al cliente telefónica: la predicción de fin de turno con horizontes de hasta 20 tramas (800 ms) permite al sistema preparar la respuesta antes de que el usuario termine de hablar, reduciendo la latencia percibida en conversaciones multi-turno.
- Transcripción por lotes con segmentación de hablante: el grafo offline `sava_int8.onnx` segmenta grabaciones completas en turnos de habla, útil como preprocesado para pipelines de ASR que necesitan recortar silencios y dividir por intervenciones.
- Asistentes embebidos en dispositivos: la conversión ONNX funciona en Android e iOS sin PyTorch, lo que permite integrar VAD y detección de fin de turno en aplicaciones móviles o dispositivos de borde con CPU modesta.
- Aplicaciones web en el navegador: mediante onnxruntime-web, el modelo puede ejecutarse en el cliente para activar la captura de micrófono solo cuando hay habla y cerrar el turno sin enviar audio silencioso al servidor.
- Filtrado y recorte de audio en producción: el modo offline procesa un segundo de audio en unos 16 ms en un hilo de CPU, lo que permite limpiar grandes volúmenes de grabaciones (eliminar silencios, marcar intervenciones) en trabajos por lotes.
- Integración en pipelines de voz existentes: la API replica la del paquete oficial `inworld-sava`, por lo que se puede sustituir la dependencia de PyTorch por ONNX Runtime sin reescribir la lógica de segmentación.

## Benchmarks y rendimiento

La información disponible no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este modelo, ya que no es un modelo de lenguaje. Los únicos datos de rendimiento publicados son de velocidad y paridad con la referencia:

| Metrica | Valor |
|---|---|
| Paridad fp32/fp16 con PyTorch | dentro de 5e-6 |
| Paridad int8 con PyTorch | 99,8 % de los veredictos de habla |
| Latencia offline (1 s de audio, 1 hilo CPU, Apple M-series) | ~16 ms |
| Latencia streaming int8 (trama de 40 ms, Python) | ~1,6 ms |
| Latencia streaming int8 (trama de 40 ms, Node.js) | ~2,8 ms |
| Tamano offline fp32 / fp16 / int8 | 103 MB / 52 MB / 33 MB |
| Tamano streaming fp32 / fp16 / int8 | 103 MB / 52 MB / 32 MB |

El autor cita que Inworld reporta SAVA por delante de Silero VAD en detección de habla y a la par de pipecat smart-turn en detección de turno, pero estos resultados corresponden al modelo original y no se reproducen en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. El grafo int8 de streaming ocupa 32 MB en disco y su huella en memoria es del mismo orden.
- GPU: no se requieren. No se documenta soporte GPU específico, aunque ONNX Runtime puede ejecutar los grafos en GPU si el proveedor de ejecución está disponible.
- CPU: funciona en un solo hilo. Las cifras de latencia publicadas corresponden a Apple M-series con onnxruntime 1.32; el autor advierte que en vCPU pequeñas de cloud hay que presupuestar más tiempo.
- Cabe en cualquier GPU de consumo y en dispositivos móviles; no necesita GPU dedicada.
- Despliegue: ONNX Runtime en Python (`onnxruntime`), Node.js (`onnxruntime-node`), navegador (`onnxruntime-web`), y enlaces de C/C++, C#, Java, Rust, Go, Android e iOS.
- Throughput estimado: en modo offline, aproximadamente 62 segundos de audio por segundo de cómputo en un hilo (16 ms por segundo de audio); en streaming, unas 25 tramas por segundo de cómputo en Python (1,6 ms por trama de 40 ms), muy por encima del tiempo real.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / trama | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sava-onnx (esta ficha) | VAD + fin de turno, ONNX | no disponible | tramas de 40 ms, lookahead de 120 ms | Apache 2.0 | Hugging Face y GitHub |
| inworld/sava | VAD + fin de turno, PyTorch | no disponible | misma base que sava-onnx | no disponible en la información | Hugging Face |
| Silero VAD | VAD | no disponible | no disponible | no disponible en la información | no disponible en la información |
| pipecat smart-turn | Detección de fin de turno | no disponible | no disponible | no disponible en la información | no disponible en la información |

La información disponible solo permite afirmar que Inworld reporta SAVA por delante de Silero VAD en detección de habla y a la par de pipecat smart-turn en detección de turno; no se dispone de cifras comparativas detalladas ni de parámetros de los modelos alternativos.

## Limitaciones y advertencias

- Conversión no oficial: no está hecha, revisada ni respaldada por Inworld AI; los pesos y el comportamiento son del autor original.
- El modo offline escala la memoria de atención con el cuadrado de la longitud del clip; para grabaciones de más de unos minutos debe usarse el grafo de streaming.
- El grafo int8 no es idéntico al de referencia: conserva el 99,8 % de los veredictos de habla y puede diferir en una trama en la segmentación de turnos.
- No se dispone de información sobre sesgos acústicos, robustez frente a ruido, acentos o idiomas, ni sobre tasas de falsos positivos y falsos negativos.
- No se dispone de información sobre el dataset de entrenamiento ni sobre posibles sesgos derivados de su composición.
- El modelo no genera texto ni razona: cualquier expectativa de comprensión semántica del contenido hablado queda fuera de su alcance.
- Las latencias publicadas corresponden a Apple M-series con onnxruntime 1.32; en vCPU pequeñas de cloud el rendimiento puede ser considerablemente menor.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una conversión de pesos ajenos conviene revisar el NOTICE del repositorio y los términos del modelo original antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Binu30/sava-onnx
- Modelo original: https://huggingface.co/inworld/sava
- Repositorio GitHub de la conversión: https://github.com/Robinbinu/sava-onnx
- Benchmarks del modelo original: https://github.com/inworld-ai/sava/blob/main/bench/README.md
- Informe de paridad: https://github.com/Robinbinu/sava-onnx/blob/main/PARITY.md
- Aviso legal de la conversión: https://github.com/Robinbinu/sava-onnx/blob/main/NOTICE
- Tests de paridad de runtime: https://github.com/Robinbinu/sava-onnx/blob/main/tests/test_runtime.py
- Demo de micrófono: https://github.com/Robinbinu/sava-onnx/blob/main/examples/microphone.py
- Ejemplo en Node.js: https://github.com/Robinbinu/sava-onnx/blob/main/examples/js/sava.mjs
- Releases con los grafos ONNX: https://github.com/Robinbinu/sava-onnx/releases
