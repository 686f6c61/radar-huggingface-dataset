# Phoonnx/glowtts-de_de-kerstin-gruut

## Resumen

Glow-TTS `de_de-kerstin-gruut` es un modelo de sintesis de voz (text-to-speech) en aleman, empaquetado en formato ONNX por Phoonnx a partir del modelo original `de-de_kerstin-glow_tts` publicado por Rhasspy dentro del proyecto Larynx v1.0. El modelo genera espectrogramas mel a partir de fonemas IPA obtenidos mediante el fonemizador gruut, y un vocoder HiFi-GAN independiente (`hifigan-multi-vctk-small`) se encarga de convertir esos espectrogramas en audio. El repositorio pesa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a inferencia ligera.

La relevancia de esta ficha es doble: por un lado documenta una voz concreta (Kerstin) para aleman estandar (de-DE) lista para usarse en asistentes de voz locales; por otro, ejemplifica el flujo de empaquetado de modelos TTS clasicos (Glow-TTS + HiFi-GAN) en ONNX para su uso en Python y en el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`. No es un modelo de lenguaje: no razona, no genera texto ni codigo, y su unica funcion es la sintesis de habla a partir de texto normalizado.

Conviene subrayar que la model card no registra licencia concreta para este empaquetado y remite a la release upstream de Larynx. Tampoco se publican metricas de calidad (MOS, WER, latencia) ni detalles del dataset de entrenamiento original. Todo lo que sigue se limita estrictamente a la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico generativo de flujo normalizante) + vocoder HiFi-GAN (`hifigan-multi-vctk-small`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de texto por frase) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo no documenta variantes cuantizadas) |
| Idiomas soportados | aleman (`de-DE`) |
| Licencia | `other` (la model card indica que no hay licencia registrada y remite a la release upstream de Larynx) |
| Formato de pesos | ONNX (empaquetado para la libreria `phoonnx`) |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | `Phoonnx/hifigan-multi-vctk-small` |
| Tamano del repositorio | ~0,1 GB |
| Libreria / pipeline | `phoonnx` / `text-to-speech` |

## Arquitectura y entrenamiento

Glow-TTS es un modelo acustico basado en flujos normalizantes que aprende una transformacion invertible entre la distribucion del texto (fonemas) y la distribucion de los espectrogramas mel. A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS realiza alineamiento monotono mediante busqueda (MAS, *monotonic alignment search*) durante el entrenamiento, lo que permite sintesis paralela y por tanto inferencia mas rapida. En este repositorio, la salida del modelo acustico se pasa a un vocoder HiFi-GAN (`hifigan-multi-vctk-small`) que reconstruye la forma de onda.

El modelo original procede del proyecto Larynx de Rhasspy (release v1.0), entrenado sobre una voz concreta (Kerstin) para aleman. La model card no aporta informacion sobre el numero de tokens, horas de audio, composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF (no aplicable en TTS) o fine-tuning especifico. El front-end de texto lo gestiona `scriptconv` con el fonemizador `GruutPhonemizer`, que normaliza el texto y lo convierte a fonemas IPA antes de alimentar al modelo.

## Capacidades

- Sintesis de voz (text-to-speech) en aleman estandar (`de-DE`) a partir de texto plano.
- Generacion de espectrogramas mel y conversion a audio WAV mediante vocoder HiFi-GAN integrado en el flujo de `phoonnx`.
- Normalizacion y fonemizacion de texto de entrada mediante `scriptconv` y gruut (IPA).
- Integracion con OVOS/Mycroft a traves del plugin `ovos-tts-plugin-phoonnx`.
- Uso programatico en Python mediante `TTSModelManager` y el objeto `voice.synthesize_wav(text, wav_file)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo *thinking*: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en aleman: integrado en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, el modelo permite dotar de voz a un asistente domestico sin depender de servicios en la nube, gracias a su tamano reducido (~0,1 GB) y a la inferencia ONNX.
- Lectura de notificaciones y avisos en aplicaciones de escritorio o domotica: se puede invocar `synthesize_wav` por cada mensaje corto, ya que el modelo trabaja por frase y no requiere contexto largo.
- Generacion de audiolibros o locuciones para contenido en aleman: util para producir narraciones de forma automatizada cuando se dispone de texto normalizado y se acepta una voz unica (Kerstin).
- Accesibilidad: conversion de texto a voz para personas con discapacidad visual en entornos de habla alemana, ejecutandose en hardware modesto al ser un modelo compacto en ONNX.
- Prototipado rapido de interfaces conversacionales: permite validar flujos de dialogo en aleman con una voz realista antes de invertir en voces comerciales o modelos mas grandes.
- Pipelines de generacion de contenido multimedia: sintesis por lotes de guiones o subtitulos en aleman para videos, podcasts o tutoriales, aprovechando la naturaleza determinista y ligera del modelo.
- Investigacion en TTS: sirve como referencia reproducible de la familia Glow-TTS + HiFi-GAN en formato ONNX para comparar con modelos mas modernos (difusion, flow-matching, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB) y la naturaleza ONNX del modelo, se espera que quepa en GPU consumer con pocos cientos de MB, aunque no se confirma en la model card.
- GPU recomendadas: no disponible. Al ser un modelo compacto, no requiere GPU de datacenter (A100/H100) para funcionar; puede ejecutarse en CPU.
- Compatibilidad con GPU consumer: probablemente si (RTX serie 30/40 y similares), aunque no se documenta oficialmente.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/glowtts-de_de-kerstin-gruut` | Glow-TTS + HiFi-GAN (ONNX) | de-DE | Fonemas gruut IPA por frase | `other` (sin licencia registrada; revisar upstream) | Hugging Face, via `phoonnx` |
| Otros modelos de la coleccion Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN (ONNX) | Multiples idiomas | Fonemas gruut IPA | `other` | Hugging Face, via `phoonnx` |
| Modelos Larynx originales (Rhasspy) | Glow-TTS / otros | Multiples idiomas | Fonemas | Varía por release | GitHub releases de `rhasspy/larynx` |

No se dispone de datos de rendimiento comparativo (MOS, WER, latencia) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia ambigua: la model card indica `other` y advierte explicitamente de que no hay licencia registrada, remitiendo a la release upstream de Larynx. Antes de un uso comercial es imprescindible verificar los terminos del modelo original de Rhasspy.
- Unica voz y unico idioma: solo sintetiza aleman (`de-DE`) con la voz Kerstin; no hay soporte multilingue ni cambio de hablante.
- Dependencia de fonemizacion: la calidad de la sintesis depende del front-end `scriptconv` + gruut; textos con abreviaturas, numeros o dominios especializados pueden requerir normalizacion adicional.
- Sin datos de calidad: no se publican metricas objetivas (MOS, WER) ni evaluaciones subjetivas, por lo que la calidad percibida no esta cuantificada.
- Modelo antiguo: Glow-TTS es una arquitectura previa a los modelos TTS modernos basados en difusion o flow-matching; es esperable una naturalidad inferior a la de sistemas actuales, aunque no se aportan comparaciones.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre, pero si puede producirse pronunciacion incorrecta o artefactos acusticos en entradas atipicas.
- Sesgos: no documentados; al entrenarse sobre una voz concreta, la prosodia y el estilo reflejan las caracteristicas de esa locutora.
- Uso en produccion: el repo tiene muy pocas descargas (20) y ningun *like*, lo que sugiere poca validacion por parte de la comunidad; conviene evaluar exhaustivamente antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-de_de-kerstin-gruut
- Modelo original upstream (Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_kerstin-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
