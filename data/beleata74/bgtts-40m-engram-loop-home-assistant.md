# beleata74/BgTTS-40M-Engram-Loop-Home-Assistant

## Resumen

BgTTS-40M-Engram-Loop-Home-Assistant es un paquete de sintesis de voz (text-to-speech) en formato ONNX INT8, derivado por cuantizacion directa del modelo base beleata74/BgTTS-40M-Engram-Loop (epoca 3). Lo desarrolla el autor independiente beleata74 y esta disenado especificamente para ejecutarse en CPU sobre Raspberry Pi 5 (8 GB) e integrarse con Home Assistant mediante el protocolo Wyoming. El modelo sintetiza voz en bulgaro e ingles con cinco voces predefinidas (F1, F5, F7, M1 y Voice4) e incluye el codec MioCodec v2 para la decodificacion de audio.

El modelo base tiene 40 181 218 parametros (aproximadamente 40M) y emplea un mecanismo denominado "Engram", una memoria contextual para palabras y secuencias de letras. El tercer bloque del codificador de texto se ejecuta dos veces con pesos compartidos, lo que introduce una suerte de bucle recurrente ligero sin aumentar el numero de parametros. La relevancia actual del paquete reside en su enfoque de despliegue local: TTS multilingue en hardware de bajo consumo, sin dependencia de la nube tras la instalacion inicial, con licencia Apache 2.0.

El paquete se distribuye como archivo tar de 409 MB (version 1.0.0) junto con el codificador y las cinco voces, y el repositorio completo ocupa 0,9 GB. El autor reporta un RTF de 0,345 en INT8 sobre Raspberry Pi 5, con un pico de memoria de 628 MiB, y un tiempo hasta el primer audio de 0,41-0,44 segundos por Wyoming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de texto de bloques recurrentes (Engram, tercer bloque ejecutado dos veces con pesos compartidos) + codec de audio MioCodec v2 |
| Parametros totales | 40 181 218 (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (version distribuida); FP32 disponible en el modelo base |
| Idiomas soportados | bulgaro (bg), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime onnxruntime); el modelo base en formato original no especificado |

## Arquitectura y entrenamiento

El modelo base BgTTS-40M-Engram-Loop es un sistema TTS de dos etapas: un encoder de texto que transforma la entrada en codigos de audio y un codec neuronal (MioCodec v2) que convierte esos codigos en forma de onda usando la voz seleccionada. La innovacion principal es el componente "Engram", una memoria contextual para palabras y secuencias de letras, y la reutilizacion del tercer bloque del encoder de texto, que se ejecuta dos veces con pesos compartidos, lo que aporta profundidad efectiva adicional sin incrementar el recuento de parametros.

No se dispone de informacion en la model card sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni detalles del proceso de alineacion. La version publicada en este repositorio es una cuantizacion directa a INT8 de la epoca 3 del modelo base, empaquetada con onnxruntime para inferencia en CPU. El autor indica que las salidas INT8 y FP32 pueden compararse directamente mediante los audios de ejemplo incluidos, y que en transcripcion automatica las muestras INT8 presentaron desviaciones en dos frases de prueba.

## Capacidades

- Sintesis de voz (text-to-speech) en bulgaro e ingles.
- Cinco voces predefinidas: F1, F5, F7, M1 y Voice4 (F5 por defecto).
- Generacion de audio en formato WAV y MP3 a traves de Home Assistant.
- Integracion nativa con Home Assistant mediante el protocolo Wyoming (puerto TCP 10251).
- Ejecucion completamente en CPU, sin GPU, sobre Raspberry Pi 5 y Debian ARM64.
- Manejo de numeros, temperaturas y horas en el texto de entrada (ejemplo: "Часът е 07:15. В хола е 21,5 °C.").
- Despliegue como servicio Linux nativo o contenedor Docker con healthcheck.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Asistente de voz domotico en Home Assistant: el modelo se registra como motor TTS mediante Wyoming y responde a las automatizaciones del asistente de voz con las voces F1, F5, F7, M1 o Voice4, manteniendo todo el procesamiento en la red local.
- Anuncios por voz de sensores y estado de la casa: el modelo convierte lecturas de temperatura, horas y estados ("Лампата е включена") en audio en 0,41-0,44 s hasta el primer audio, adecuado para notificaciones casi en tiempo real.
- Lectura de cuentos y contenido largo: los ejemplos del autor incluyen una locucion de 28 segundos generada en la propia Raspberry Pi 5, lo que lo hace util para narracion domestica o contenido educativo en bulgaro.
- Despliegue en dispositivos sin GPU: al ejecutarse en CPU con 628 MiB de pico de memoria en INT8, cabe en una Raspberry Pi 5 de 8 GB junto con otros servicios del hogar.
- Escenarios de privacidad estricta: tras la descarga e instalacion iniciales, las replicas y el audio se procesan en la maquina local, sin enviar texto a servicios externos.
- Integracion en pipelines de automatizacion con Docker: el paquete incluye Docker Compose y produce PCM identico bit a bit entre el servicio nativo ARM64 y el contenedor, lo que facilita el despliegue reproducible.
- Síntesis bilingue en un mismo asistente: Home Assistant puede alternar entre bulgaro e ingles seleccionando el idioma en la configuracion del asistente de voz.

## Benchmarks y rendimiento

Mediciones del autor sobre Raspberry Pi 5 de 8 GB, Debian 12 ARM64 y cuatro hilos de CPU, con 12 textos (8 en bulgaro, 4 en ingles) y tres repeticiones por precision. RTF es el tiempo total de generacion dividido por la duracion total del habla con el modelo cargado.

| Prueba | Resultado |
|---|---|
| BgTTS INT8: RTF y pico de memoria del proceso | RTF 0,345; 628 MiB |
| BgTTS FP32: mismos textos | RTF 0,508; 753 MiB |
| Sara INT8 anterior: misma lista | RTF 0,339 |
| "Лампата е включена.": tiempo hasta el primer audio por Wyoming | 0,41-0,44 s |
| Peticion larga con numeros via Home Assistant | 26,06 s de audio en 12,62 s |
| Docker ARM64 frente a servicio nativo Linux | Seis peticiones con PCM identico bit a bit |
| Home Assistant Container 2026.10.0 | Dos idiomas, cinco voces, WAV, MP3 y Assist; funciono tras reinicio |

No se han publicado resultados de benchmarks estandar (MOS, WER, MMLU u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU. Pico de memoria del proceso de 628 MiB en INT8 y 753 MiB en FP32.
- Hardware de referencia: Raspberry Pi 5 de 8 GB con Debian 12 ARM64 y cuatro hilos de CPU.
- GPU: no se requiere ni se documenta soporte de GPU; el paquete esta orientado a onnxruntime en CPU.
- Cabe en hardware de consumo de gama baja: el propio autor lo valida en Raspberry Pi 5; no se documentan pruebas en otras placas.
- Opciones de despliegue: servicio Linux nativo (script/install.sh con python3-venv y libgomp1) o Docker con Docker Compose; integracion con Home Assistant via Wyoming en el puerto TCP 10251.
- Latencia y throughput: RTF 0,345 en INT8 (aproximadamente 2,9 segundos de habla por segundo de computo), 0,41-0,44 s hasta el primer audio por Wyoming.
- Requisitos de software: Python 3.11 o superior, curl para la descarga; conexion a internet solo para la descarga e instalacion iniciales.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|---|
| BgTTS-40M-Engram-Loop-Home-Assistant | 40M (INT8) | bg, en | no disponible | Apache 2.0 | CPU, ONNX, Wyoming | RTF 0,345 en Pi 5; 628 MiB |
| SaraTTS-BG-EN-64M-Home-Assistant-for-PI-5 (beleata74) | 64M | bg, en | no disponible | no disponible en la informacion | CPU, orientado a Pi 5 | RTF 0,339 en la misma prueba; paquete anterior del mismo autor |
| BgTTS-40M-Engram-Loop (modelo base) | 40M | bg, en | no disponible | Apache 2.0 | FP32; demo en navegador | Referencia de calidad frente a la version INT8; RTF 0,508 en Pi 5 |

No se dispone de datos de benchmarks comparativos con otros sistemas TTS de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre bulgaro e ingles; no se documenta soporte de otros idiomas.
- La cuantizacion INT8 introduce desviaciones: el autor reconoce que dos frases de prueba mostraron diferencias en transcripcion automatica frente a FP32.
- No se publican datos sobre sesgos, calidad perceptual (MOS) ni tasas de error de palabra (WER).
- No hay informacion sobre el dataset de entrenamiento, por lo que no puede evaluarse la cobertura de dominios ni el riesgo de alucinacion en la prosodia o pronunciacion de terminos poco frecuentes.
- La integracion con Home Assistant OS no esta validada: el autor indica que la variante de aplicacion local del Supervisor es experimental y que falta verificacion en dispositivo con HA OS; la ruta recomendada es un servidor Linux externo por Wyoming.
- La longitud de contexto del modelo no esta documentada, lo que limita la planificacion de sintesis de textos muy largos.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de las voces y del codec MioCodec v2 incluidos en el paquete antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beleata74/BgTTS-40M-Engram-Loop-Home-Assistant
- Modelo base: https://huggingface.co/beleata74/BgTTS-40M-Engram-Loop
- Demo del modelo original FP32 en el navegador: https://huggingface.co/spaces/beleata74/BgTTS-40M-Voice-Demo
- Instrucciones de instalacion en bulgaro: docs/INSTALL.bg.md (dentro del repositorio)
- Guia de instalacion en ingles: docs/INSTALL.en.md (dentro del repositorio)
- Script de descarga: https://huggingface.co/beleata74/BgTTS-40M-Engram-Loop-Home-Assistant/resolve/v1.0.0/script/download.py
- Archivo de instalacion: https://huggingface.co/beleata74/BgTTS-40M-Engram-Loop-Home-Assistant/resolve/v1.0.0/releases/bgtts-home-assistant-pi5-1.0.0.tar
- Suma SHA256 del archivo: https://huggingface.co/beleata74/BgTTS-40M-Engram-Loop-Home-Assistant/resolve/v1.0.0/releases/bgtts-home-assistant-pi5-1.0.0.tar.sha256
- Ejemplos de audio y textos de prueba: examples/README.md (dentro del repositorio)
- Transcripciones automaticas de evaluacion: evaluation/recognition.json (dentro del repositorio)
- Resultados y metodologia de evaluacion: evaluation/README.md (dentro del repositorio)
- Paquete anterior SaraTTS: https://huggingface.co/beleata74/SaraTTS-BG-EN-64M-Home-Assistant-for-PI-5
