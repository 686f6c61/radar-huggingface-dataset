# Phoonnx/styletts2-en_us-kitten-nano_0.1-espeak

## Resumen

styletts2-en_us-kitten-nano_0.1-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, desarrollado originalmente por KittenML como `kitten-tts-nano-0.1` y reempaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo convierte texto en ingles estadounidense a audio, recibiendo como entrada fonemas espeak en alfabeto IPA en lugar de texto plano, lo que requiere un front-end de fonemizacion previo.

El modelo resuelve el problema de disponer de un TTS ligero, de codigo abierto y ejecutable en local dentro del ecosistema OVOS (Open Voice OS). Su caracteristica principal es la variante "nano" de Kitten TTS, pensada para inferencia eficiente, y su empaquetado ONNX, que facilita el despliegue sin depender de frameworks de deep learning pesados. Se distribuye con licencia Apache 2.0.

Es relevante ahora por su integracion directa como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) y por ofrecer multiples voces expresivas predefinidas (ocho voces identificadas por genero y estilo). El repositorio es de tamano minimo (0.0 GB reportados), lo que refleja un modelo compacto orientado a dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Voces disponibles | 8 (expr-voice-2-f, 2-m, 3-f, 3-m, 4-f, 4-m, 5-f, 5-m) |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Upstream | KittenML/kitten-tts-nano-0.1 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StyleTTS2, un sistema de sintesis de voz neuronal que combina modelado de estilo y difusion para generar habla con prosodia expresiva. La variante "nano" de Kitten TTS corresponde a una version reducida del modelo original, disenada para minimizar el coste computacional manteniendo calidad de sintesis aceptable. El modelo se distribuye como grafo ONNX, lo que permite su ejecucion con el runtime de ONNX en lugar de requerir PyTorch en produccion.

La entrada no es texto crudo sino fonemas en alfabeto IPA generados por espeak-ng (o por el port espyak incluido en el extra `phoonnx[espeak]`). La normalizacion y conversion del texto la realiza la libreria `scriptconv`, que aplica el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de fonemas espeak en IPA para ingles estadounidense.
- Generacion de audio en formato WAV mediante el metodo `synthesize_wav`.
- Multiples voces expresivas: ocho voces predefinidas con variacion de genero (femenino/masculino) y estilo (expr-voice-2 a 5).
- Integracion como plugin de TTS en OVOS mediante `ovos-tts-plugin-phoonnx`.
- Ejecucion sobre runtime ONNX, sin dependencia de PyTorch en inferencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- Capacidad multilingue limitada exclusivamente a en-US.
- No dispone de modo thinking, vision ni audio de entrada.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como modulo TTS configurando `ovos-tts-plugin-phoonnx` en `mycroft.conf`, permitiendo sintesis offline en dispositivos de voz sin conexion a servicios en la nube.
- Sintesis embebida en dispositivos de recursos limitados: al ser la variante "nano" con pesos ONNX y repositorio de tamano minimo, es adecuada para Raspberry Pi u otros SBC donde un TTS completo no cabria.
- Generacion de locuciones para audiolibros o contenido narrado en ingles: las ocho voces expresivas permiten asignar timbres distintos a personajes o secciones.
- Prototipado rapido de interfaces de voz: la API de `phoonnx` (`TTSModelManager`, `voice.synthesize_wav`) permite integrar sintesis en scripts Python con pocas lineas.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia en ingles estadounidense.
- Pruebas automatizadas de pipelines de audio: generacion programatica de muestras WAV para validar sistemas de reconocimiento de voz o de diarizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por tratarse de la variante "nano" en ONNX y con repositorio de 0.0 GB, se espera un consumo muy reducido, apto para CPU.
- GPU recomendadas: no disponible; el modelo esta pensado para ejecucion en CPU mediante runtime ONNX.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el caracter ligero del modelo, aunque no se confirma en la documentacion.
- Opciones de despliegue: `phoonnx` (Python), runtime ONNX, plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Dependencias: espeak-ng instalado en el sistema (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| styletts2-en_us-kitten-nano_0.1-espeak (este) | StyleTTS2 (nano) | en-US | ONNX | Apache 2.0 | Empaquetado phoonnx, entrada por fonemas espeak |
| KittenML/kitten-tts-nano-0.1 | StyleTTS2 (nano) | en-US | no disponible | Apache 2.0 | Modelo upstream original de KittenML |
| Otros modelos de la coleccion StyleTTS2 de Phoonnx | StyleTTS2 | segun modelo | ONNX | segun modelo | Misma libreria de despliegue, distintas voces/idiomas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- Requiere un front-end de fonemizacion espeak-ng o espyak; sin el, el modelo no puede procesar texto.
- El uso del port espyak puede producir pronunciaciones incorrectas en algunas palabras, segun advierte la propia model card, al diferir sus fonemas de los de espeak-ng.
- Riesgo de alucinacion acustica y errores de prosodia inherentes a los modelos TTS neuronales; no se documentan sesgos especificos.
- No se detallan sesgos de voz, acento o genero mas alla de las ocho voces predefinidas.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del upstream KittenML/kitten-tts-nano-0.1 y de los datos de entrenamiento originales.
- Modelo con muy baja adopcion (25 descargas, 0 likes en el momento de la consulta); no hay evidencia de uso en produccion a gran escala.
- No apto para tareas de razonamiento, codigo o agentes; es exclusivamente un modelo de sintesis de voz.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/styletts2-en_us-kitten-nano_0.1-espeak
- Modelo upstream: https://huggingface.co/KittenML/kitten-tts-nano-0.1
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
