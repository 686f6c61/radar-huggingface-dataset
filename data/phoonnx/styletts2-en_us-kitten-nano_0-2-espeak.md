# Phoonnx/styletts2-en_us-kitten-nano_0.2-espeak

## Resumen

`Phoonnx/styletts2-en_us-kitten-nano_0.2-espeak` es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense basado en la arquitectura StyleTTS2, desarrollado originalmente por KittenML como `kitten-tts-nano-0.2` y empaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`, una biblioteca de TTS sobre ONNX orientada a Python y al ecosistema OVOS (Open Voice OS). El modelo no entrena desde cero: es una conversion y distribucion del checkpoint de KittenML con un front-end fonemico basado en espeak-ng (fonemas en alfabeto IPA).

La relevancia de este paquete es practica: permite ejecutar un TTS neuronal ligero (la variante "nano" de Kitten TTS) dentro de pipelines Python y de asistentes de voz OVOS sin depender de frameworks propietarios ni de servicios en la nube, con licencia Apache 2.0 y pesos en ONNX. El modelo incluye ocho voces predefinidas etiquetadas como expresivas (cuatro femeninas y cuatro masculinas, identificadas como `expr-voice-2-f` a `expr-voice-5-m`).

El modelo esta pensado exclusivamente para ingles (`en-US`) y su calidad depende del fonemizador: usa espeak-ng de forma nativa, y el autor advierte que la alternativa espyak puede producir errores de pronunciacion en algunas palabras. No se dispone de informacion publica sobre tamano de parametros, contexto ni metricas de calidad en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (TTS neuronal, ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en-US`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Front-end de texto | Fonemas espeak-ng en alfabeto IPA (via `scriptconv`) |
| Voces incluidas | 8 (4 femeninas, 4 masculinas, etiqueta `expr-voice-*`) |
| Libreria de ejecucion | `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |
| Descargas | 23 |
| Fecha de creacion | 2026-11-14 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StyleTTS2, un sistema de sintesis de voz neuronal que combina un generador acustico con modulos de estilo y un decodificador vocacional, disenado para producir habla natural con control de prosodia y estilo. En este paquete, la inferencia se realiza sobre pesos exportados a ONNX, lo que facilita el despliegue en entornos Python sin necesidad de PyTorch en tiempo de ejecucion.

El entrenamiento original corresponde a KittenML (`kitten-tts-nano-0.2`), del que este repositorio es una redistribucion empaquetada. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de audio, composicion del dataset, horas de entrenamiento, ni sobre el uso de tecnicas de RLHF/DPO o ajuste fino. La innovacion tecnica destacable del paquete es la integracion del front-end fonemico: el texto se normaliza y convierte a fonemas IPA mediante `scriptconv` y `EspeakPhonemizer`, y esos fonemas alimentan el modelo. El autor advierte que el uso del port espyak (en lugar de espeak-ng nativo) puede degradar la pronunciacion.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto plano.
- Conversion texto-a-fonemas via espeak-ng con alfabeto IPA como entrada del modelo.
- Ocho voces predefinidas etiquetadas como expresivas (cuatro femeninas y cuatro masculinas).
- Ejecucion sobre ONNX, lo que permite inferencia en CPU y GPU sin dependencias de PyTorch.
- Integracion como plugin de OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- Generacion de audio WAV mediante la API `synthesize_wav`.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- Capacidad multilingue: limitada a `en-US`; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra mediante `ovos-tts-plugin-phoonnx` y se selecciona la voz en `mycroft.conf`, permitiendo respuestas habladas en ingles dentro de un asistente domestico autoalojado.
- Lectura de notificaciones y alertas: sintesis rapida de mensajes cortos en ingles para sistemas de monitorizacion o domotica, aprovechando el bajo coste de la variante "nano".
- Prototipado de interfaces conversacionales: desarrollo de demos de voz en Python con `phoonnx` sin depender de APIs de terceros, gracias a los pesos ONNX y la licencia Apache 2.0.
- Generacion de audiolibros o contenido narrado en ingles: uso de las ocho voces para alternar narradores o personajes en producciones de audio.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia en ingles, ejecutandose localmente.
- Pruebas de regresion de pipelines TTS: integracion en CI/CD para validar la calidad de sintesis y la pronunciacion con espeak-ng frente a espyak.
- Investigacion en TTS: base para comparativas de calidad y latencia entre variantes StyleTTS2 empaquetadas en ONNX dentro de la coleccion de Phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una variante "nano" y ejecutarse en ONNX, es previsible que quepa en GPU de consumo, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; el formato ONNX permite ejecucion en CPU.
- Opciones de despliegue: `phoonnx` (Python, con `pip install --pre phoonnx`), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecucion ONNX Runtime subyacente.
- Dependencia externa: es necesario instalar `espeak-ng` (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Phoonnx/styletts2-en_us-kitten-nano_0.2-espeak` | StyleTTS2 | en-US | Apache 2.0 | ONNX | Empaquetado para phoonnx, 8 voces |
| `KittenML/kitten-tts-nano-0.2` | StyleTTS2 | en-US | Apache 2.0 | no disponible | Modelo upstream original |
| Otras variantes de la coleccion StyleTTS2 de Phoonnx | StyleTTS2 | segun variante | Apache 2.0 (segun upstream) | ONNX | Mismo pipeline de empaquetado |

No se dispone de datos de rendimiento ni de parametros para establecer una comparativa cuantitativa con alternativas como Piper, Coqui TTS o XTTS; la informacion proporcionada no los incluye.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (`en-US`); no es multilingue.
- La calidad de pronunciacion depende del fonemizador: con espyak en lugar de espeak-ng nativo, algunas palabras pueden pronunciarse mal, segun advierte el autor.
- Requiere instalar espeak-ng o el extra `phoonnx[espeak]`; sin ello, el modelo no puede procesar texto.
- No se dispone de informacion sobre sesgos de voz (genero, acento, edad) ni sobre sesgos sociales en los datos de entrenamiento.
- Riesgo de alucinacion acustica: como todo TTS neuronal, puede producir artefactos o prosodia incorrecta en textos fuera de dominio, aunque no se documenta en la informacion.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream `KittenML/kitten-tts-nano-0.2` antes de desplegar en produccion.
- El repositorio tiene muy pocas descargas (23) y cero likes, lo que sugiere poca validacion comunitaria.
- No hay datos publicos de latencia, throughput ni calidad (MOS) que permitan evaluar su idoneidad en produccion a gran escala.
- El tamano del repositorio aparece como 0.0 GB en Hugging Face, lo que puede indicar pesos no alojados directamente o un reporte incompleto.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/styletts2-en_us-kitten-nano_0.2-espeak
- Modelo upstream: https://huggingface.co/KittenML/kitten-tts-nano-0.2
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
