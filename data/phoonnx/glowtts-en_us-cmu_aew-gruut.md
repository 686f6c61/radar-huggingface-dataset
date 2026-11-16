# Phoonnx/glowtts-en_us-cmu_aew-gruut

## Resumen

Glow-TTS en_us-cmu_aew-gruut es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente desarrollado por Rhasspy dentro del proyecto Larynx, y reempaquetado por Phoonnx en formato ONNX para su uso con la librería de TTS homónima. El modelo transforma fonemas del inglés estadounidense (generados mediante el fonemizador gruut, en alfabeto IPA) en espectrogramas mel, que posteriormente son convertidos a audio mediante el vocoder HiFi-GAN multi-VCTK small.

Se trata de un modelo de voz concreta (voice "aew") del catálogo Larynx, orientado a síntesis local y de baja latencia. Su relevancia actual radica en que permite integrar TTS en entornos sin GPU y sin dependencia de servicios en la nube, ya que el paquete ONNX completo ocupa aproximadamente 0,1 GB. Es adecuado para asistentes de voz embebidos, domótica y sistemas tipo OVOS/Mycroft.

No se dispone de información sobre el número de parámetros, el tamaño del dataset de entrenamiento ni los detalles de la arquitectura interna más allá de la referencia a Glow-TTS. La licencia figura como "other" y el autor advierte explícitamente de que no se ha registrado licencia alguna para el modelo, por lo que debe verificarse el release original antes de cualquier uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flow-based, text-to-spectrogram) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada por frase) |
| Tipos de cuantización | no disponible (pesos ONNX) |
| Idiomas soportados | inglés estadounidense (en-US) |
| Licencia | other (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX |
| Vocoder | hifigan-multi-vctk-small (ONNX) |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamaño del repo | 0,1 GB |
| Librería | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en normalizing flows que aprende una correspondencia entre secuencias de fonemas y espectrogramas mel, empleando alineamiento monotónico mediante atención y sin necesidad de un aligner externo durante la inferencia. La arquitectura combina un encoder de texto, un decoder de flujos invertibles y un mecanismo de atención que impone monotonicidad, lo que permite generar espectrogramas de forma determinista y rápida.

El modelo original fue entrenado por Rhasspy dentro del proyecto Larynx v1.0 sobre datos de voz del corpus CMU (según se deduce del identificador "cmu_aew"); no se dispone de información sobre el número de horas de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o fine-tuning adicionales. El paquete distribuido por Phoonnx contiene únicamente los pesos convertidos a ONNX, junto con la integración del vocoder HiFi-GAN multi-VCTK small, que se descarga automáticamente con la voz.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con salida en WAV.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut (normalización y conversión de script con scriptconv).
- Generación de espectrogramas mel y conversión a audio mediante vocoder HiFi-GAN integrado.
- Inferencia local en CPU mediante ONNX Runtime, sin dependencia de servicios externos.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- No dispone de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- No soporta clonación de voz, control de emociones ni cambio de hablante (voz única "aew").

## Casos de uso

- Asistentes de voz embebidos: el modelo puede integrarse en dispositivos como Raspberry Pi mediante ONNX Runtime para sintetizar respuestas del asistente sin conexión a internet, gracias a su tamaño reducido (0,1 GB) y a la inferencia en CPU.
- Domótica y sistemas OVOS/Mycroft: se selecciona la voz `larynx/en-us-cmu_aew-glow_tts` en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo anuncios y respuestas locales en el hogar.
- Lectura de notificaciones y alertas: adecuado para sintetizar mensajes cortos en inglés en sistemas de monitorización o paneles de control donde se requiere baja latencia y no se justifica un servicio TTS en la nube.
- Accesibilidad: conversión de texto a voz para aplicaciones de lectura de pantalla o asistencia a personas con discapacidad visual en entornos de escritorio Linux, usando Python y la librería phoonnx.
- Prototipado de pipelines TTS: al estar empaquetado en ONNX con una API Python sencilla (`TTSModelManager`), sirve para validar flujos de fonemización gruut y vocoder HiFi-GAN antes de migrar a modelos de mayor calidad.
- Sistemas de respuesta por voz en kioscos o terminales: síntesis de frases predefinidas y mensajes dinámicos en inglés estadounidense en entornos con recursos limitados de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del paquete (0,1 GB) es viable en CPU sin GPU dedicada.
- GPU recomendadas: no se requieren; cualquier GPU con soporte ONNX Runtime (CUDA o TensorRT) puede acelerar la inferencia, pero no hay datos publicados.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en iGPU, dado el reducido tamaño del modelo.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx; integración con OVOS mediante `ovos-tts-plugin-phoonnx`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-cmu_aew-gruut | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | Hugging Face, 20 descargas |
| Rhasspy Larynx v1.0 (en-us_cmu_aew-glow_tts) | Glow-TTS | en-US | tar.gz (upstream) | ver upstream | GitHub releases de Rhasspy |
| Piper (rhasspy/piper-voices) | VITS | múltiples | ONNX | MIT (mayoría de voces) | Hugging Face / GitHub |

El modelo empaquetado por Phoonnx es una conversión directa de la voz original de Larynx, por lo que su calidad y comportamiento son equivalentes al release upstream. Frente a Piper, la principal diferencia es la licencia y el ecosistema de integración; no se dispone de datos comparativos de calidad (MOS) ni de rendimiento.

## Limitaciones y advertencias

- Licencia "other" sin licencia registrada: el propio autor indica que debe verificarse el release upstream antes de cualquier uso, incluido el comercial.
- Modelo exclusivamente en inglés estadounidense; no soporta otros idiomas ni acentos.
- Voz única ("aew"); no permite selección de hablante ni clonación.
- Requiere fonemización previa con gruut; errores en la normalización del texto pueden degradar la pronunciación.
- No hay información publicada sobre sesgos, calidad perceptual (MOS) ni robustez ante texto ruidoso.
- Riesgo de artefactos o pronunciaciones incorrectas en palabras fuera del vocabulario o nombres propios no cubiertos por gruut.
- No apto para tareas de razonamiento, generación de texto, código o visión: es un modelo puramente TTS.
- Dependencia del vocoder externo `hifigan-multi-vctk-small`, que debe descargarse junto con la voz.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_aew-gruut
- Upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_aew-glow_tts.tar.gz
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
