# ai-coustics/quail-voice-focus

## Resumen

Quail Voice Focus es un modelo de mejora de voz (speech-to-speech) desarrollado por ai-coustics, orientado a aislar al hablante principal y suprimir ruido, reverberacion, voces competidoras y habla de fondo en tiempo real. No es un modelo de lenguaje ni un modelo generativo de texto: es un componente de preprocesado de audio que se inserta en la parte de captura (contact side) de pilas de Voice AI para mejorar la fiabilidad de sistemas STT, VAD, turn-taking y speech-to-speech posteriores. El autor reporta hasta un 43% menos de errores de palabra (WER) en los principales proveedores de STT.

La inferencia se ejecuta a traves del paquete Python `aic-sdk` (tambien disponible para Rust, C/C++, Node.js y WebAssembly), con una latencia declarada de 30 ms y sin necesidad de GPU ni dependencia de ONNX. El modelo opera a 16 kHz (utilizable en pipelines de 8 kHz) y esta pensado para escenarios de un unico hablante principal, incluido audio de campo lejano; el propio autor desaconseja su uso en escenarios multihablante y remite a Quail Multi Speaker para esos casos.

La relevancia actual del modelo radica en que ataca un cuello de botella habitual en agentes de voz en produccion: el ruido y las voces de fondo degradan el reconocimiento y el turn-taking. Al ofrecer aislamiento de voz en tiempo real sobre CPU, permite desplegar pipelines de voz fiables sin infraestructura GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesamiento de audio independiente del idioma) |
| Licencia | ai-coustics-model-license (other) |
| Formato de pesos | no disponible (distribucion via SDK `aic-sdk`; versiones y checksums en artifacts.ai-coustics.io) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo (tipo de red, capas, tamano de parametros) ni sobre el dataset de entrenamiento, el numero de tokens o el proceso de alineacion. La model card unicamente describe el comportamiento funcional: aislamiento del hablante principal, supresion de ruido, reverberacion, voces competidoras y habla de fondo, con procesamiento por bloques y en tiempo real.

La innovacion tecnica destacable, segun el autor, es la combinacion de baja latencia (30 ms) con ejecucion en CPU y sin dependencia de ONNX, ademas de un parametro de intensidad de mejora ajustable en tiempo de ejecucion (`EnhancementLevel`, rango 0.0-1.0) para optimizar el resultado frente a un motor STT concreto. El SDK expone una API de procesamiento por bloques (`processor.process(audio_block)`) declarada como real-time safe, con entrada mono en float32.

## Capacidades

- Aislamiento del hablante principal (primary-speaker isolation) en audio de un solo hablante.
- Supresion de ruido, reverberacion, voces competidoras y habla de fondo.
- Mejora de audio en tiempo real con latencia declarada de 30 ms.
- Procesamiento a 16 kHz, utilizable en pipelines de 8 kHz.
- Soporte de audio de campo lejano para un unico hablante.
- Ajuste dinamico de la intensidad de mejora (`EnhancementLevel`, 0.0-1.0) para adaptarse a un motor STT especifico.
- Integracion como preprocesado de STT, VAD y turn-taking en pilas de Voice AI.
- SDK multiplataforma: Python, Rust, C/C++, Node.js y WebAssembly.
- Quickstarts de integracion con LiveKit y Pipecat.
- No soporta escenarios multihablante (el autor remite a Quail Multi Speaker).

## Casos de uso

- Agentes de voz en atencion al cliente: el modelo se coloca antes del STT para aislar al cliente y suprimir voces de fondo del entorno, reduciendo errores de transcripcion en llamadas desde entornos ruidosos (oficinas, calles, hogares).
- Reconocimiento de voz en produccion: se integra como etapa previa al STT para disminuir el WER hasta un 43% segun el autor, lo que mejora la fiabilidad de pipelines de transcripcion en tiempo real.
- Turn-taking en agentes conversacionales: combinado con VAD Voice Focus, permite detectar de forma fiable cuando habla el hablante principal y cuando ha terminado, evitando interrupciones erroneas por ruido o voces de fondo.
- Speech-to-speech en asistentes de voz: al limpiar la senal de entrada, mejora la calidad percibida y la precision de modelos speech-to-speech que consumen el audio en tiempo real.
- Despliegue en dispositivos sin GPU: al ejecutarse en CPU con 30 ms de latencia, es adecuado para edge, telefonos, navegadores (WebAssembly) y servidores sin aceleradores dedicados.
- Preprocesado en pipelines de telefonia y VoIP: util para aislar al hablante en llamadas con ruido ambiental o con otras personas hablando cerca, antes de la transcripcion o del enrutamiento.
- Integracion en frameworks de agentes de voz (LiveKit, Pipecat): se incorpora como nodo de captura en arquitecturas de agentes en tiempo real sin reescribir el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor afirma una reduccion de hasta el 43% en errores de palabra (WER) en los principales proveedores de STT y una latencia de 30 ms, pero no se aportan tablas con cifras por modelo, dataset o condicion acustica.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en CPU segun el autor ("no GPU needed").
- GPU recomendadas: no necesarias.
- Compatibilidad con GPU de consumo: no aplica (ejecucion en CPU).
- Opciones de despliegue: SDK `aic-sdk` (Python, Rust, C/C++, Node.js, WebAssembly); integraciones documentadas con LiveKit y Pipecat.
- Latencia: 30 ms declarados por el autor.
- Throughput: no disponible.
- Requisito adicional: clave de SDK (trial gratuito de 30 dias sin tarjeta; clave via developers.ai-coustics.com).

## Comparativa con modelos similares

| Modelo | Familia | Uso previsto | Frecuencia | Latencia | Licencia | Notas |
|---|---|---|---|---|---|---|
| Quail Voice Focus | Quail | Agentes de voz con un hablante principal | 16 kHz (usable en 8 kHz) | 30 ms | ai-coustics-model-license | Aislamiento de voz; hasta 43% menos WER |
| Quail Multi Speaker | Quail | STT en condiciones ruidosas, campo lejano, multihablante | 8 y 16 kHz | no disponible | ai-coustics-model-license | Denoiser optimizado para precision STT; hasta 30% menos WER |
| Rook Multi Speaker | Rook | Escucha humano-a-humano: conferencia, telefonia | hasta 48 kHz | no disponible | ai-coustics-model-license | Mejora perceptual; no recomendado para Voice AI |
| VAD Voice Focus | VAD | Deteccion de actividad de voz del hablante principal | no disponible | no disponible | ai-coustics-model-license | Complementario a Quail Voice Focus para turn-taking |

## Limitaciones y advertencias

- No esta disenado para escenarios multihablante; en esos casos el autor recomienda Quail Multi Speaker.
- Requiere una clave de SDK de ai-coustics para funcionar; no es un modelo de pesos abiertos descargable y ejecutable libremente.
- La licencia `ai-coustics-model-license` es de tipo "other"; las condiciones de uso comercial deben consultarse en el enlace legal del autor. No se garantiza uso comercial sin licencia enterprise.
- No se dispone de informacion sobre sesgos acusticos, idiomas o tipos de ruido para los que el modelo haya sido entrenado o evaluado.
- El rendimiento reportado (43% menos WER) es una afirmacion del autor sin tabla de benchmarks publicada en la informacion disponible; conviene validarlo en el pipeline concreto antes de produccion.
- La latencia de 30 ms es la declarada por el autor; no se especifican condiciones de medida ni hardware de referencia.
- No se publican detalles de arquitectura ni de cuantizacion, lo que limita la auditoria tecnica independiente.
- El ajuste de `EnhancementLevel` puede requerir calibracion por motor STT; un valor inadecuado puede degradar la transcripcion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-coustics/quail-voice-focus
- Documentacion de Quail Voice Focus: https://docs.ai-coustics.com/models/voice-focus/quail-voice-focus
- Quickstart del SDK: https://docs.ai-coustics.com/models/get-started/sdk-quickstart
- Documentacion general: https://docs.ai-coustics.com
- Quickstart LiveKit: https://docs.ai-coustics.com/models/get-started/livekit-quickstart
- Ejemplo Pipecat: https://github.com/pipecat-ai/pipecat/blob/main/examples/voice/voice-aicoustics.py
- Versiones y checksums: https://artifacts.ai-coustics.io
- SDK Python en PyPI: https://pypi.org/project/aic-sdk/
- Clave SDK gratuita: https://developers.ai-coustics.com
- Licencia del modelo: https://ai-coustics.com/legal/model-license
- Licencias enterprise: https://ai-coustics.com/
- Quail Multi Speaker: https://huggingface.co/ai-coustics/quail-multi-speaker
- Rook Multi Speaker: https://huggingface.co/ai-coustics/rook-multi-speaker
- VAD Multi Speaker: https://huggingface.co/ai-coustics/vad-multi-speaker
- VAD Voice Focus: https://huggingface.co/ai-coustics/vad-voice-focus
- Tyto: https://huggingface.co/ai-coustics/tyto
