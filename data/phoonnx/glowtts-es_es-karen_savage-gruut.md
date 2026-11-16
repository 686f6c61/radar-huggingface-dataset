# Phoonnx/glowtts-es_es-karen_savage-gruut

## Resumen

Glow-TTS es un modelo de síntesis de voz (text-to-speech) desarrollado originalmente por Rhasspy dentro del proyecto Larynx, y empaquetado ahora por Phoonnx para su librería ONNX de TTS. Esta variante concreta, `glowtts-es_es-karen_savage-gruut`, sintetiza voz en castellano de España (es-ES) a partir de fonemas IPA generados por el fonemizador gruut, y emplea el vocoder `hifigan-multi-vctk-small` para convertir el espectrograma en audio.

El modelo resuelve el problema de generar voz sintética en español peninsular de forma ligera y ejecutable en local: el repositorio ocupa apenas 0,1 GB y los pesos están en formato ONNX, lo que permite inferencia en CPU sin dependencias de GPU. Es relevante para proyectos de asistentes de voz open source, especialmente en el ecosistema OVOS/Mycroft, donde se integra como plugin (`ovos-tts-plugin-phoonnx`).

Arquitectónicamente se trata de un modelo Glow-TTS (transformer con alineamiento monotónico y normalizing flow), no de un modelo de lenguaje grande, por lo que no maneja contexto conversacional ni razonamiento: su única tarea es la conversión texto-a-espectrograma. La ficha refleja esta naturaleza y evita extrapolaciones propias de los LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glow-TTS (text-to-spectrogram) + vocoder HiFi-GAN |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (síntesis por frase; sin ventana de contexto) |
| Tipos de cuantización | no disponible (pesos ONNX; el repo no documenta variantes) |
| Idiomas soportados | es-ES (castellano de España) |
| Licencia | other (sin licencia registrada; consultar el release upstream de Rhasspy) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en normalizing flows que aprende una correspondencia monotónica entre la secuencia de fonemas de entrada y un espectrograma mel. A diferencia de los sistemas TTS autorregresivos, el alineamiento se obtiene mediante búsqueda monotónica (monotonic alignment search) durante el entrenamiento, lo que permite síntesis paralela y rápida en inferencia. La salida del modelo es un espectrograma que posteriormente se convierte en forma de onda mediante el vocoder HiFi-GAN (`hifigan-multi-vctk-small`), descargado automáticamente junto con la voz.

No se dispone de información sobre el número de horas de audio, la composición del dataset de entrenamiento, ni si se aplicaron técnicas de ajuste fino o RLHF (no aplicables en este tipo de modelo). El modelo procede del release v1.0 de Larynx (`es-es_karen_savage-glow_tts.tar.gz`), un proyecto de Rhasspy orientado a TTS offline para asistentes de voz. La innovación principal en este empaquetado es la conversión a ONNX y la integración con la librería phoonnx y el fonemizador gruut.

## Capacidades

- Síntesis de voz en castellano de España (es-ES) a partir de texto plano, con normalización y conversión a fonemas IPA mediante gruut.
- Generación de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Inferencia en CPU gracias al formato ONNX y al reducido tamaño del modelo (0,1 GB).
- Integración como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`), configurable vía `mycroft.conf`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es multilingüe: únicamente es-ES.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se instala como plugin de TTS y permite que el asistente responda en castellano sin conexión a servicios en la nube, gracias a su inferencia ONNX en CPU.
- Lectura de notificaciones y alertas en sistemas domésticos: puede sintetizar frases cortas generadas dinámicamente (por ejemplo, avisos de domótica) con baja latencia al no requerir GPU.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de escritorio que necesiten una voz en español peninsular ligera y embebible.
- Prototipado de interfaces conversacionales: permite validar flujos de voz en español antes de invertir en modelos TTS comerciales o de mayor tamaño.
- Generación de audiolibros o contenido narrado por lotes: al ser un modelo pequeño y rápido, puede procesar grandes volúmenes de texto en servidores sin GPU.
- Sistemas embebidos y dispositivos de bajo consumo (Raspberry Pi y similares): el tamaño de 0,1 GB y el formato ONNX lo hacen viable en hardware limitado donde otros TTS no caben.
- Pruebas de regresión en pipelines de TTS: sirve como voz de referencia para comparar calidad acústica frente a otros modelos de la colección Glow-TTS de Phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para inferencia en CPU con ONNX Runtime.
- GPU recomendadas: no necesarias; cualquier GPU compatible con ONNX Runtime podría acelerar la inferencia, pero no se documenta.
- Cabe en GPU consumer: sí, aunque su diseño objetivo es CPU; el tamaño de 0,1 GB lo permite en cualquier hardware.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Tamaño | Licencia |
|---|---|---|---|---|---|
| glowtts-es_es-karen_savage-gruut (este) | Glow-TTS + HiFi-GAN | es-ES | ONNX | 0,1 GB | other (sin registrar) |
| Otras voces de la colección Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | varios | ONNX | ~0,1 GB | variable |
| Piper (Rhasspy) | VITS | varios (incl. es) | ONNX | variable | MIT (mayoritariamente) |
| Coqui TTS (XTTS) | Transformer + flow | multilingüe | PyTorch | varios GB | variable |

La comparación con Piper y Coqui TTS se ofrece como referencia de categoría; no se dispone de datos de benchmarks que permitan comparar calidad objetivamente en la información proporcionada.

## Limitaciones y advertencias

- La licencia figura como "other" y la model card indica que no hay licencia registrada; es imprescindible revisar el release upstream de Rhasspy antes de cualquier uso comercial.
- El modelo solo sintetiza es-ES; no cubre otras variantes del español ni otros idiomas.
- Al ser un TTS, no genera texto ni razona: no debe evaluarse con métricas de LLM (MMLU, HumanEval, etc.).
- Riesgo de artefactos acústicos y errores de pronunciación en palabras fuera del dominio de entrenamiento o en siglas y números mal normalizados por gruut.
- No se documentan sesgos de voz (género, acento, edad) más allá del nombre de la voz (`karen_savage`), por lo que la representatividad de la voz no está garantizada.
- No hay información sobre el dataset de entrenamiento, lo que dificulta evaluar cobertura dialectal y calidad en dominios específicos.
- El modelo tiene muy poca adopción (25 descargas, 0 likes) y no se han publicado evaluaciones independientes de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-es_es-karen_savage-gruut
- Upstream (release Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/es-es_karen_savage-glow_tts.tar.gz
- Vocoder: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
