# Phoonnx/glowtts-en_us-cmu_ahw-gruut

## Resumen

Glow-TTS en_us-cmu_ahw-gruut es un modelo de síntesis de voz (text-to-speech) en inglés estadounidense, empaquetado en formato ONNX por Phoonnx a partir del modelo original publicado por Rhasspy dentro del proyecto Larynx v1.0. El modelo original es un Glow-TTS entrenado sobre el corpus CMU Arctic, concretamente sobre la voz del hablante identificado como `ahw`, y aquí se distribuye listo para ejecutarse con la librería phoonnx, que actúa como runtime de inferencia ONNX y como gestor de voces.

El modelo no es un LLM ni un transformer generativo de texto: es un sistema TTS de dos etapas en el que Glow-TTS genera un espectrograma mel a partir de fonemas y un vocoder externo, HiFi-GAN multi-VCTK small, convierte ese espectrograma en audio. La entrada de texto no es texto plano directo, sino fonemas IPA producidos por el fonemizador gruut a través de la librería scriptconv, lo que condiciona tanto la integración como la calidad de la síntesis.

Su relevancia práctica es acotada pero clara: es una voz ligera (repo de 0,1 GB), ejecutable en CPU sin GPU dedicada, pensada para asistentes de voz locales como OVOS/Mycroft, donde la latencia y el consumo de recursos importan más que la naturalidad máxima. No hay datos publicados de benchmarks objetivos en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico flow-based) + vocoder HiFi-GAN multi-VCTK small |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la longitud depende de la frase de entrada) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | `other` (no se registra licencia concreta; hay que consultar la release upstream de Rhasspy/Larynx) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas IPA mediante gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`) |
| Vocoder | `Phoonnx/hifigan-multi-vctk-small` (descargado automáticamente por phoonnx) |
| Tamaño del repo | 0,1 GB |
| Librería / runtime | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Glow-TTS, un modelo acústico basado en normalizing flows que aprende una correspondencia alineada monotónicamente entre fonemas y frames de espectrograma mel. Glow-TTS emplea búsqueda de alineamiento monotónico (MAS) durante el entrenamiento, lo que evita depender de un modelo de atención autorregresivo y permite síntesis paralela, con la consiguiente ventaja de latencia frente a arquitecturas tipo Tacotron. La generación del espectrograma es determinista en la práctica y se completa con el vocoder HiFi-GAN, que reconstruye la forma de onda.

El modelo original procede del proyecto Larynx de Rhasspy, en su release v1.0, bajo el identificador `en-us_cmu_ahw`. La voz `ahw` corresponde al corpus CMU Arctic, un conjunto de grabaciones de estudio en inglés estadounidense usado habitualmente para entrenamiento de TTS de dominio controlado. No se dispone de información sobre el número exacto de tokens o frames de entrenamiento, la composición detallada del dataset ni si hubo etapas de ajuste fino adicionales más allá del entrenamiento supervisado estándar de Glow-TTS sobre pares texto-audio.

La innovación técnica relevante en este empaquetado no está en el modelo en sí, sino en la cadena de inferencia: phoonnx carga el ONNX, scriptconv normaliza el texto y aplica el fonemizador gruut, y el vocoder se descarga y asocia automáticamente a la voz. Esta separación entre front-end de texto, modelo acústico y vocoder es la que permite sustituir componentes o reutilizar el vocoder entre voces.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con salida en WAV mediante `voice.synthesize_wav`.
- Fonemización IPA mediante gruut, con normalización de texto previa por scriptconv.
- Generación de espectrograma mel por Glow-TTS y conversión a audio por HiFi-GAN multi-VCTK small.
- Ejecución sobre ONNX Runtime, sin dependencia obligatoria de GPU.
- Integración como plugin de TTS en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`.
- Gestión de voces múltiples a través de `TTSModelManager` de phoonnx, con fusión de voces por defecto (`merge_default_voices`).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- No es multilingüe: solo `en-US`.
- No se documenta control de prosodia, emoción, velocidad ni clonación de voz más allá de la voz fija `ahw`.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: la voz se selecciona en `mycroft.conf` con el módulo `ovos-tts-plugin-phoonnx` y se usa para leer respuestas del asistente en tiempo real, aprovechando que el modelo corre en CPU y no requiere GPU.
- Lectura de notificaciones y alertas en sistemas embebidos: al ocupar 0,1 GB y ejecutarse sobre ONNX Runtime, encaja en dispositivos tipo Raspberry Pi donde un TTS neuronal grande no cabría.
- Síntesis offline en aplicaciones de escritorio: phoonnx descarga el modelo y el vocoder una vez y permite generar WAV sin conexión, útil en entornos sin red o con requisitos de privacidad.
- Generación de audiolibros o locuciones de dominio controlado: la voz `ahw` procede de grabaciones de estudio del corpus CMU Arctic, por lo que es adecuada para lectura de textos largos en inglés donde prima la inteligibilidad sobre la expresividad.
- Pruebas de integración en pipelines de TTS: sirve como voz de referencia ligera para validar front-ends de fonemización (gruut/scriptconv) y cadenas modelo acústico + vocoder antes de pasar a voces de mayor calidad.
- Accesibilidad: lectura de texto en pantalla para usuarios con discapacidad visual en aplicaciones de escritorio o web con backend Python, donde la latencia de un modelo paralelo como Glow-TTS es aceptable.
- Prototipado de interfaces conversacionales: permite montar un endpoint TTS rápido en Python para demos y pruebas de UX sin depender de servicios cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MOS (Mean Opinion Score), MCD, WER de síntesis ni comparativas numéricas con otras voces en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (0,1 GB) y el uso de ONNX Runtime, la huella en memoria es del orden de cientos de MB, compatible con ejecución en CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU. Cualquier GPU compatible con ONNX Runtime (CUDA o ROCm) podría acelerar la inferencia, pero no hay datos publicados.
- ¿Cabe en GPU consumer? Sí, con margen amplio, dado el tamaño del modelo; no se documentan requisitos mínimos.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. Glow-TTS es un modelo paralelo (no autorregresivo), lo que en general reduce la latencia frente a TTS autorregresivos, pero no hay cifras publicadas para esta voz concreta.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-cmu_ahw-gruut | Glow-TTS + HiFi-GAN small | en-US | fonemas IPA (gruut) | other (sin licencia registrada) | ONNX | Hugging Face, 22 descargas |
| Otras voces de la colección Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | según voz | fonemas IPA | other | ONNX | Hugging Face (colección `glow-tts`) |
| Modelos Larynx v1.0 originales (Rhasspy) | Glow-TTS + vocoder | varias | fonemas | según release upstream | tarball / ONNX | GitHub releases de rhasspy/larynx |
| Piper (Rhasspy) | VITS | varias | fonemas | MIT (según proyecto) | ONNX | GitHub, Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia) entre estas alternativas en la información proporcionada. La comparación se limita a arquitectura, formato y disponibilidad.

## Limitaciones y advertencias

- Licencia: la model card indica `license: other` y afirma explícitamente que no se registra licencia para este modelo; es imprescindible revisar la release upstream de Rhasspy/Larynx antes de cualquier uso, incluido el comercial.
- Idioma único: solo inglés estadounidense; no hay soporte multilingüe ni de otros acentos.
- Dependencia de fonemización: la calidad de la síntesis depende del fonemizador gruut y de la normalización de scriptconv; texto con números, siglas o símbolos mal normalizados producirá pronunciaciones incorrectas.
- Voz única y fija: no hay control de hablante, emoción, velocidad ni prosodia más allá de lo que permita el front-end.
- Riesgo de artefactos: los vocoders HiFi-GAN pequeños pueden introducir ruido o artefactos en fonemas poco representados en CMU Arctic; no hay evaluaciones publicadas que lo cuantifiquen.
- Corpus de dominio limitado: CMU Arctic es un corpus de estudio con cobertura fonética controlada pero vocabulario y estilo restringidos; la naturalidad fuera de ese dominio puede degradarse.
- Sin benchmarks: no hay métricas objetivas publicadas, por lo que la evaluación de calidad debe hacerse empíricamente en el caso de uso concreto.
- Madurez y soporte: 22 descargas y 0 likes en el momento de la consulta; proyecto de nicho con mantenimiento dependiente de Phoonnx y de la comunidad OVOS.
- No apto para tareas de NLP: no genera texto, no razona, no soporta tool calling ni agentes; cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_ahw-gruut
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Release upstream de Larynx v1.0 (Rhasspy): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_ahw-glow_tts.tar.gz
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
