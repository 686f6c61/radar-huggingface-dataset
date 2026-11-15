# Phoonnx/glowtts-it-mai_female

## Resumen

`glowtts-it-mai_female` es un modelo de sintesis de voz (text-to-speech) en italiano, originalmente entrenado por Coqui dentro de su toolkit TTS y empaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo corresponde al checkpoint `tts_models--it--mai_female--glow-tts` publicado en la release v0.6.1 de Coqui TTS, con voz femenina y arquitectura Glow-TTS. Phoonnx se limita a convertirlo a ONNX y a integrarlo en su ecosistema de sintesis (incluido el plugin `ovos-tts-plugin-phoonnx` para asistentes OVOS).

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un TTS neuronal de gran escala, sino de una redistribucion de un modelo Coqui de 2021 aproximadamente, con un front-end de texto basado en grafemas (`GraphemePhonemizer` de `scriptconv`) y una unica voz disponible (`coqui-it-mai_female-glow-tts`). Su interes practico esta en que ofrece inferencia ONNX ligera (repo de 0,1 GB) y licencia Apache 2.0, lo que facilita su integracion en pipelines de sintesis embebidos o en asistentes de voz autoalojados.

No se dispone de informacion publica sobre numero de parametros, contexto (no aplica a TTS), datos de entrenamiento ni benchmarks en la informacion proporcionada. Cualquier cifra de rendimiento o calidad debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow con alineamiento monotono, segun Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por caracteres) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | italiano (`it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetado para `phoonnx`) |
| Entrada de texto | caracteres del texto, normalizados por `scriptconv` con `GraphemePhonemizer` |
| Voces disponibles | `coqui-it-mai_female-glow-tts` (una sola voz, femenina) |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | `phoonnx` (Python y plugin OVOS) |

## Arquitectura y entrenamiento

Glow-TTS es una arquitectura de sintesis de voz basada en normalizing flows que modela la distribucion conjunta de mel-espectrogramas y alineamientos de forma monotona, sin necesidad de un alineador externo tipo attention. El modelo original fue entrenado por Coqui y distribuido en su release v0.6.1 de modelos TTS. Phoonnx no aporta informacion sobre el corpus de entrenamiento, numero de tokens, horas de audio, ni sobre si hubo ajuste fino adicional: esos datos no estan disponibles en la model card.

La innovacion aportada por el empaquetado Phoonnx es operativa, no arquitectonica: conversion a ONNX para inferencia portable, integracion con `scriptconv` para normalizacion de texto y fonemizacion basada en grafemas, y exposicion como plugin de TTS para el ecosistema OVOS. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento, que no aplican a este tipo de modelo.

## Capacidades

- Sintesis de voz a partir de texto en italiano, con salida en fichero WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Voz femenina unica (`mai_female`), sin control documentado de prosodia, velocidad ni emocion.
- Normalizacion y conversion de texto mediante `scriptconv` (`GraphemePhonemizer`), que transforma la cadena de entrada en la representacion que consume el modelo.
- Integracion con asistentes OVOS a traves de `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Inferencia ONNX, lo que permite despliegue sin dependencia del stack completo de PyTorch/Coqui TTS.
- No soporta tool calling, function calling, agentes, vision, audio de entrada, razonamiento multi-paso ni capacidades multilingues mas alla del italiano.

## Casos de uso

- Asistentes de voz autoalojados en OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `coqui-it-mai_female-glow-tts` en `mycroft.conf` y obtener respuestas habladas en italiano sin servicios externos.
- Lectura de contenido en italiano en aplicaciones de accesibilidad: conversion de articulos, notificaciones o mensajes a audio WAV mediante la API de `phoonnx`, con un footprint de repositorio de 0,1 GB adecuado para entornos con recursos limitados.
- Generacion de avisos y locuciones pregrabadas en italiano: sintesis por lotes de frases fijas (anuncios de transporte, avisos de tienda, mensajes de IVR) usando el modelo como generador offline de ficheros WAV.
- Prototipado rapido de interfaces conversacionales en italiano: al ser ONNX y Apache 2.0, permite iterar sobre el front-end de texto (`scriptconv`) y la sintesis sin ataduras de licencia ni dependencias pesadas.
- Integracion en pipelines de CI para pruebas de audio: generacion determinista de muestras de voz para tests de regresion de sistemas de reconocimiento o de calidad de audio.
- Educacion y demos de TTS: ejemplo minimo de Glow-TTS en produccion para cursos o talleres, con instalacion via `pip install --pre phoonnx` y unas pocas lineas de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repositorio (0,1 GB) sugiere un modelo pequeno, pero no se documenta el consumo real.
- GPU recomendadas: no disponible; al ejecutarse en ONNX, puede correr en CPU y en GPU compatibles con ONNX Runtime, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la documentacion; por el tamano del artefacto es plausible, pero no se aporta evidencia.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y, en general, cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Voces | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/glowtts-it-mai_female` | Glow-TTS | Italiano | 1 (femenina) | ONNX | Apache 2.0 | Hugging Face, `phoonnx` |
| Coqui `tts_models--it--mai_female--glow-tts` | Glow-TTS | Italiano | 1 (femenina) | Checkpoint Coqui TTS | Apache 2.0 (segun lista Coqui) | Release v0.6.1 de Coqui TTS |
| Otros modelos de la coleccion Glow-TTS de Phoonnx | Glow-TTS | Multiples | Variable | ONNX | Apache 2.0 (segun coleccion) | Hugging Face |

La comparativa se limita al modelo upstream de Coqui y a la propia coleccion Glow-TTS de Phoonnx, que son las alternativas identificadas en la informacion disponible. No se dispone de datos de rendimiento para comparar calidad, latencia ni MOS frente a otros sistemas TTS.

## Limitaciones y advertencias

- Una sola voz (femenina, `mai_female`) y un solo idioma (italiano); no hay soporte multilingue ni cambio de hablante.
- El front-end usa `GraphemePhonemizer`, es decir, fonemizacion basada en grafemas; esto puede degradar la pronunciacion de prestamos, siglas o palabras fuera del vocabulario italiano.
- No se documentan sesgos, pero al ser un modelo entrenado por Coqui sobre un corpus no descrito en la model card, no es posible evaluar sesgos de genero, dialecto o registro.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si existe riesgo de pronunciacion incorrecta o entonacion plana en textos complejos; no hay datos de evaluacion.
- Licencia Apache 2.0 declarada por el upstream en la lista de modelos de Coqui TTS; conviene verificar la procedencia del checkpoint original antes de un uso comercial critico.
- No hay informacion sobre cuantizaciones, latencia, throughput ni consumo de memoria; no debe asumirse un rendimiento concreto en produccion sin medicion previa.
- El modelo se distribuye como paquete ONNX para `phoonnx`; usarlo fuera de esa libreria requiere adaptar la interfaz de inferencia.
- Repositorio con 27 descargas y 0 likes en el momento de la consulta: ecosistema pequeno y poca validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-it-mai_female
- Modelo upstream Coqui: https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--it--mai_female--glow-tts.zip
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
