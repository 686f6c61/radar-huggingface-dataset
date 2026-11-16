# Phoonnx/glowtts-sw-biblia_takatifu-gruut

## Resumen

glowtts-sw-biblia_takatifu-gruut es un modelo de síntesis de voz (text-to-speech) en suajili, empaquetado en formato ONNX por el proyecto Phoonnx a partir del modelo original de Rhasspy publicado en el repositorio Larynx v1.0. El modelo emplea la arquitectura Glow-TTS, un modelo generativo basado en flujos normalizadores que transforma fonemas en espectrogramas mel, que posteriormente son convertidos a audio por el vocoder HiFi-GAN (variante multi-vctk-small). El identificador "biblia_takatifu" sugiere que el corpus de entrenamiento proviene de una versión en suajili de la Biblia.

El modelo está pensado para integrarse en pipelines de TTS de código abierto, en particular dentro del ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, así como en aplicaciones Python que usen la librería phoonnx. Su tamaño de repositorio es de aproximadamente 0,1 GB, lo que lo hace ligero y apto para despliegues en entornos con recursos limitados.

La relevancia de esta ficha radica en que documenta un recurso de TTS para suajili, un idioma con cobertura limitada en herramientas de voz open source, y en que aclara el estado de licencia (no registrada explícitamente) y las dependencias técnicas (gruut, scriptconv, vocoder HiFi-GAN) necesarias para su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flujos normalizadores) + vocoder HiFi-GAN multi-vctk-small |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | suajili (`sw`) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamaño del repositorio | ~0,1 GB |
| Librería | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en flujos normalizadores invertibles que aprende una correspondencia determinista entre fonemas y espectrogramas mel, evitando el uso de alineamientos externos mediante búsqueda de alineamiento monotónico. La arquitectura combina un encoder de texto, un decoder de flujos y una capa de duración, y se entrena con pérdida de máxima verosimilitud sobre pares texto-audio. En este caso, la salida espectral se convierte en audio mediante el vocoder HiFi-GAN multi-vctk-small, que Phoonnx descarga automáticamente junto con la voz.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni sobre el uso de RLHF o DPO (no aplicable en TTS clásico). El nombre del modelo indica que el corpus proviene de una grabación o texto de la Biblia en suajili, pero la model card no detalla horas de audio, hablantes ni condiciones de grabación. La innovación técnica principal es el empaquetado ONNX para inferencia portable y la integración con el front-end de fonemización gruut a través de scriptconv.

## Capacidades

- Síntesis de voz (text-to-speech) en suajili a partir de texto plano.
- Conversión de texto a fonemas IPA mediante `GruutPhonemizer` (extra `scriptconv[gruut]`).
- Generación de espectrogramas mel y conversión a audio WAV mediante vocoder HiFi-GAN.
- Integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso programático en Python a través de `phoonnx.model_manager.TTSModelManager`.
- Ejecución en formato ONNX, lo que permite despliegue portable sin dependencia de PyTorch en inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking (es un modelo TTS puro).
- Capacidad multilingüe limitada al suajili (`sw`).

## Casos de uso

- Asistentes de voz en suajili: integración en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz `larynx/sw-biblia_takatifu-glow_tts` en `mycroft.conf` para respuestas habladas en suajili.
- Lectura de textos religiosos o literarios: el modelo está entrenado sobre el corpus "biblia_takatifu", por lo que es adecuado para la lectura de pasajes bíblicos y textos formales en suajili con una prosodia coherente con ese dominio.
- Accesibilidad para personas con discapacidad visual: generación de audio a partir de contenido textual en suajili en aplicaciones de lectura de pantalla o lectores de documentos.
- Locución automatizada de contenidos educativos: síntesis de lecciones, avisos o material formativo en suajili para plataformas de e-learning con presupuesto limitado.
- Prototipado de aplicaciones de voz en entornos sin GPU: al ser un modelo ONNX de ~0,1 GB con vocoder ligero, puede ejecutarse en CPU en servicios de baja concurrencia.
- Investigación en TTS de bajos recursos: servir como línea base o componente de comparación en estudios sobre síntesis de voz en lenguas africanas con recursos limitados.
- Generación de avisos públicos o mensajes institucionales en suajili: siempre que se valide la calidad prosódica y se respete la licencia upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (~0,1 GB) y la arquitectura Glow-TTS + HiFi-GAN small, es esperable que quepa en GPUs con 2-4 GB de VRAM, aunque este dato no está confirmado en la model card.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) debería ser suficiente; también es viable en CPU.
- Cabe en GPU consumer: previsiblemente sí, dado el reducido tamaño del modelo y del vocoder, aunque no hay confirmación oficial.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ejecución directa de ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-sw-biblia_takatifu-gruut (este) | Glow-TTS + HiFi-GAN | suajili | no aplica | other (sin registrar) | ONNX | Hugging Face (Phoonnx) |
| Modelos Larynx v1.0 (upstream Rhasspy) | Glow-TTS + vocoder | múltiples, incl. suajili | no aplica | según release upstream | tar.gz (original) | GitHub Rhasspy |
| Otros modelos de la colección Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | varios | no aplica | other | ONNX | Hugging Face (Phoonnx) |
| Alternativas TTS multilingües open source (p. ej. Coqui TTS, Piper) | VITS / otros | múltiples | no aplica | varía (MPL, MIT, etc.) | ONNX / otros | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) para este modelo en la información proporcionada.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explícitamente que no hay licencia registrada y recomienda consultar el release upstream antes de usarlo. Esto supone un riesgo legal para uso comercial.
- Dominio de entrenamiento restringido: el nombre "biblia_takatifu" sugiere un corpus bíblico, por lo que la prosodia y el estilo pueden no generalizar bien a otros registros (conversacional, técnico, etc.).
- Idioma único: solo soporta suajili (`sw`); no es multilingüe.
- Dependencia del front-end gruut: la calidad de síntesis depende de la fonemización correcta del texto de entrada; errores en la normalización o en los fonemas degradan el audio.
- Riesgo de alucinación acústica: como todo modelo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras fuera del vocabulario de entrenamiento.
- Sin datos de benchmarks ni de evaluación subjetiva (MOS): no hay evidencia publicada sobre la calidad perceptual del audio.
- Modelo de nicho con muy pocas descargas (53) y 0 likes: comunidad limitada y escaso soporte.
- No apto para tareas de razonamiento, código, visión ni agentes; es exclusivamente un modelo TTS.
- Fecha de creación registrada en 2026-11-14: conviene verificar la vigencia y el estado del repositorio antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-sw-biblia_takatifu-gruut
- Upstream original (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/sw_biblia_takatifu-glow_tts.tar.gz
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
