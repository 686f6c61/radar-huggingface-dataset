# Phoonnx/matcha-ca-central-v2-graphemes

## Resumen

Matcha-ca-central-v2-graphemes es un modelo de sintesis de voz (text-to-speech) en catalan central, desarrollado originalmente por BSC-LT (Barcelona Supercomputing Center - Language Technologies) y empaquetado en formato ONNX por Phoonnx para su uso con la libreria phoonnx. El modelo se basa en la arquitectura Matcha-TTS, un modelo de sintesis neuronal no autorregresivo que emplea un decoder basado en flujos normales y un vocoder Wavenext fusionado para generar audio de alta calidad a partir de texto.

La particularidad de esta variante "graphemes" es que opera directamente sobre caracteres del texto (grafemas) en lugar de requerir una conversion previa a fonemas, lo que simplifica el pipeline de inferencia. El modelo esta especializado exclusivamente en catalan central y esta disenado para integracion en sistemas de asistencia por voz como OpenVoiceOS (OVOS) mediante el plugin `ovos-tts-plugin-phoonnx`.

Su relevancia radica en que ofrece una solucion TTS ligera (0,3 GB de repositorio) y desplegable en local para una lengua con recursos limitados como el catalan, con licencia GPL-3.0 y formato ONNX que facilita su ejecucion en CPU sin necesidad de GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (sintesis neuronal no autorregresiva con decoder de flujos normales y vocoder Wavenext fusionado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | Catalan (ca), variante central |
| Licencia | GPL-3.0 (la model card menciona tambien apache-2.0 para el componente fused Wavenext) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Matcha-TTS es una arquitectura de sintesis de voz neuronal no autorregresiva que combina un encoder de texto, un decoder basado en flujos normales (normalizing flows) para modelar la duracion y la variabilidad prosodica, y un vocoder neuronal para la generacion de la forma de onda. En esta variante, el vocoder es un Wavenext fusionado dentro del propio grafo ONNX, lo que simplifica el despliegue al eliminar la necesidad de ejecutar dos modelos separados.

El modelo trabaja directamente sobre grafemas (caracteres del texto) mediante el `GraphemePhonemizer` de la libreria scriptconv, sin requerir una transcripcion fonetica previa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning preferencial, ya que la model card no detalla el proceso de entrenamiento del modelo original de BSC-LT.

## Capacidades

- Sintesis de voz (text-to-speech) en catalan central a partir de texto plano.
- Procesamiento directo de grafemas sin necesidad de conversion a fonemas (front-end simplificado).
- Generacion de audio en formato WAV mediante la API `synthesize_wav`.
- Integracion nativa con el ecosistema OpenVoiceOS (OVOS) mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en formato ONNX, lo que permite inferencia en CPU y en multiples plataformas.
- Normalizacion y conversion de texto mediante la libreria scriptconv.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo exclusivamente TTS).

## Casos de uso

- Asistentes de voz en catalan: integracion en OpenVoiceOS u otros asistentes domesticos para sintetizar respuestas habladas en catalan central, aprovechando el plugin nativo `ovos-tts-plugin-phoonnx` y el formato ONNX ligero.
- Lectura de contenido web o documentos: conversion de articulos, noticias o textos administrativos en catalan a audio para accesibilidad o consumo pasivo, gracias al front-end de grafemas que evita errores de transcripcion fonetica.
- Sistemas de anuncios publicos o transporte: generacion de avisos hablados en catalan para estaciones, aeropuertos o transporte publico, donde se requiere una voz clara y consistente en una variante dialectal concreta.
- Audiolibros y podcasting automatizado: sintesis de narraciones en catalan central para produccion de contenido editorial, con la ventaja de ejecucion local sin dependencia de servicios en la nube.
- Atencion al cliente telefonica automatizada: generacion de respuestas de voz en catalan en sistemas IVR, desplegable en servidores sin GPU gracias al formato ONNX y al tamano reducido del modelo.
- Educacion y aprendizaje de idiomas: produccion de material auditivo en catalan central para cursos, ejercicios de pronunciacion o aplicaciones de aprendizaje, con control total sobre el texto sintetizado.
- Prototipado e investigacion en TTS: uso como modelo base para experimentos de sintesis en lenguas de bajos recursos, al estar disponible en ONNX y con licencia GPL-3.0 para modificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,3 GB, por lo que se espera un consumo de memoria modesto (inferior a 1 GB en RAM/VRAM en la mayoria de configuraciones).
- GPU recomendadas: no especificadas; al ser un modelo ONNX de sintesis de voz, puede ejecutarse en CPU sin GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano del modelo, aunque no se dispone de datos oficiales de consumo de VRAM.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OpenVoiceOS), ONNX Runtime.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamano repo |
|---|---|---|---|---|---|
| Phoonnx/matcha-ca-central-v2-graphemes | Matcha-TTS + Wavenext | Catalan central | ONNX | GPL-3.0 | 0,3 GB |
| BSC-LT/matxa-tts-v2-ca-central-graphemes | Matcha-TTS | Catalan central | no disponible | GPL-3.0 | no disponible |
| Otros modelos de la coleccion Matcha-TTS de Phoonnx | Matcha-TTS | Multiples | ONNX | variable | variable |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en catalan central; no soporta otros idiomas ni variantes dialectales del catalan.
- Al operar sobre grafemas, puede producir pronunciaciones incorrectas en palabras con grafias ambiguas o extranjerismos no normalizados.
- Riesgo de artefactos acusticos y prosodia incorrecta en textos largos o con puntuacion atipica, comun en modelos TTS neuronales.
- Licencia GPL-3.0: el uso comercial requiere cumplir las obligaciones de copyleft de la GPL, lo que puede ser restrictivo para productos propietarios. La model card menciona ademas apache-2.0 para el componente fused Wavenext, lo que introduce ambiguedad sobre el regimen licenciatario exacto.
- No se dispone de informacion sobre sesgos de generacion (por ejemplo, sesgos de genero o de prosodia asociados a la voz sintetizada).
- No apto para tareas de comprension de lenguaje, razonamiento, codigo o vision.
- El modelo esta empaquetado para phoonnx; su uso fuera de ese ecosistema requiere adaptar el grafo ONNX y el front-end de texto.
- Escaso numero de descargas (22) y ausencia de likes, lo que sugiere validacion comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-ca-central-v2-graphemes
- Modelo upstream (BSC-LT): https://huggingface.co/BSC-LT/matxa-tts-v2-ca-central-graphemes
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
