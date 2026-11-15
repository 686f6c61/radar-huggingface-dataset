# Phoonnx/glowtts-fr_fr-siwis

## Resumen

Glow-TTS es un modelo de síntesis de voz (text-to-speech) basado en arquitectura Glow-TTS, desarrollado originalmente por Rhasspy como parte del proyecto Larynx y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en francés de Francia (`fr-FR`) en fonemas IPA mediante el fonemizador gruut, genera un espectrograma y lo transforma en audio mediante el vocoder HiFi-GAN. Está pensado para su uso en asistentes de voz y sistemas embebidos, especialmente dentro del ecosistema OVOS.

El modelo se distribuye en formato ONNX con un tamaño de repositorio de 0,1 GB, lo que lo hace adecuado para despliegues ligeros en CPU y dispositivos de recursos limitados. Su pipeline es text-to-speech y la librería asociada es phoonnx, que gestiona la descarga del vocoder junto con la voz.

La relevancia actual radica en su integración con el stack de Rhasspy/OVOS para asistentes de voz locales y privados, y en su empaquetado ONNX listo para producción sin necesidad de frameworks pesados como PyTorch en tiempo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow + transformer encoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (distribucion en ONNX) |
| Idiomas soportados | frances de Francia (`fr-FR`) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Vocoder | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en normalizing flows que combina un encoder transformer con un decoder de flujo invertible. El modelo aprende una alineación monotónica entre fonemas y frames de espectrograma sin necesidad de atención externa, lo que permite una síntesis rápida y determinista. La salida es un espectrograma mel que posteriormente es convertido a waveform por el vocoder HiFi-GAN multi-VCTK small.

El modelo original fue entrenado por Rhasspy dentro del proyecto Larynx (v1.0) sobre el dataset de voz Siwis para francés. No se dispone de información sobre el número exacto de tokens, composición del dataset ni si hubo etapas de RLHF o ajuste fino adicional. La innovación principal es la alineación por flujo y la generación de espectrogramas de forma estable, junto con su empaquetado ONNX para inferencia ligera.

## Capacidades

- Síntesis de voz a partir de texto en francés de Francia (`fr-FR`).
- Conversión de texto a fonemas IPA mediante el fonemizador gruut.
- Generación de espectrogramas y conversión a audio mediante vocoder HiFi-GAN.
- Integración con la librería phoonnx en Python y con OVOS mediante `ovos-tts-plugin-phoonnx`.
- Salida en formato WAV mediante `voice.synthesize_wav`.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso.
- Capacidad monolingüe: únicamente francés.

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS para sintetizar respuestas en francés sin depender de servicios en la nube, gracias a su formato ONNX y bajo peso (0,1 GB).
- Lectura de notificaciones y alertas: permite convertir mensajes de texto en audio en francés para sistemas domóticos o aplicaciones de accesibilidad.
- Generación de audiolibros o contenido narrado: adecuado para sintetizar textos largos en francés con una voz consistente (Siwis) y un pipeline determinista.
- Sistemas de atención telefónica automatizada: puede emplearse para respuestas pregrabadas dinámicas en francés en centralitas IP o IVR.
- Prototipado de interfaces conversacionales: útil para desarrolladores que necesitan una voz francesa rápida de integrar en Python mediante phoonnx sin instalar PyTorch.
- Dispositivos embebidos y Raspberry Pi: al distribuirse en ONNX y con vocoder pequeño, puede ejecutarse en CPU en entornos con recursos limitados.
- Pruebas de regresión de pipelines TTS: sirve como voz de referencia ligera para validar la integración de scriptconv y phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo se distribuye en ONNX y está pensado para inferencia en CPU.
- GPU recomendadas: no disponible; al ser un modelo ligero, puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna, aunque no se especifican requisitos mínimos.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/glowtts-fr_fr-siwis | Glow-TTS + HiFi-GAN | fr-FR | ONNX | other | no disponible | Voz Siwis, empaquetado para phoonnx |
| Otras voces Larynx Glow-TTS (Phoonnx) | Glow-TTS + HiFi-GAN | varios | ONNX | other | no disponible | Misma colección Glow-TTS de Phoonnx |
| Piper (Rhasspy) | VITS | varios | ONNX | MIT (segun proyecto) | no disponible | Alternativa ligera del mismo ecosistema |

No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other" sin licencia registrada: es imprescindible consultar la licencia del release upstream de Rhasspy/Larynx antes de cualquier uso comercial.
- Modelo monolingüe: solo sintetiza francés de Francia; no soporta otros idiomas ni cambio de voz.
- Dependencia de fonemización externa: requiere el fonemizador gruut y la librería scriptconv para funcionar correctamente.
- Sin datos de benchmarks: no hay métricas publicadas de calidad (MOS, WER) en la información disponible.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento, siglas o neologismos.
- Solo 36 descargas y 0 likes: comunidad reducida, lo que implica menor validación externa y soporte limitado.
- No apto para tareas de razonamiento, código, tool calling ni agentes; es exclusivamente un modelo TTS.
- El vocoder se descarga automáticamente con la voz; conviene verificar su disponibilidad y versión en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-fr_fr-siwis
- Upstream Larynx (release v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/fr-fr_siwis-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
