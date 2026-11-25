# Phoonnx/qwen3tts-multi-customvoice-0.6b-unicode

## Resumen

Phoonnx/qwen3tts-multi-customvoice-0.6b-unicode es un empaquetado ONNX del modelo de sintesis de voz Qwen3-TTS, concretamente de la variante Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice desarrollada por el equipo Qwen. El modelo original es un sistema text-to-speech de 0,6 mil millones de parametros que genera audio a una frecuencia de trama de 12 Hz y admite multiples voces predefinidas (custom voices) en diez idiomas. Este repositorio no aporta pesos nuevos: adapta los pesos upstream al formato ONNX para que puedan ejecutarse con la libreria phoonnx, desarrollada por TigreGotico.

La relevancia practica del empaquetado reside en la portabilidad: al convertir el modelo a ONNX, se puede ejecutar en entornos Python sin depender del stack original de PyTorch, integrarse en asistentes de voz del ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx y desplegarse en dispositivos con recursos limitados. El repositorio ocupa 4,4 GB e incluye quince voces repartidas entre ingles, chino, japones, coreano, aleman, espanol, frances, italiano, portugues y ruso.

El modelo resuelve el problema de la sintesis multilingue con voces personalizadas en un unico checkpoint de tamano contenido, con licencia Apache 2.0, lo que facilita su uso comercial. La entrada de texto se realiza mediante puntos de codigo Unicode, normalizados por la libreria scriptconv antes de pasar al modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (modelo de sintesis de voz, trama de 12 Hz) |
| Parametros totales | 0,6 mil millones (segun nombre del modelo) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX; el repositorio no detalla variantes cuantizadas) |
| Idiomas soportados | de-DE, en-US, es-ES, fr-FR, it-IT, ja-JP, ko-KR, pt-BR, ru-RU, zh-CN |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetado para la libreria phoonnx) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-TTS-12Hz-0.6B-CustomVoice, un sistema text-to-speech de Qwen que opera con una frecuencia de trama de 12 Hz, lo que implica que genera representaciones de audio a 12 fotogramas por segundo. La ficha disponible no detalla la topologia interna (transformer autorregresivo, codec de audio, etc.), el volumen de datos de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; estos datos deben consultarse en la model card del modelo upstream.

La innovacion tecnica del repositorio es el empaquetado ONNX y la integracion con phoonnx, que gestiona la carga de voces, la seleccion por idioma y la sintesis a WAV. El front-end de texto utiliza UnicodeCodepointPhonemizer de scriptconv, que normaliza el texto y lo convierte en puntos de codigo Unicode como entrada del modelo. No se documentan tecnicas como decodificacion especulativa ni attention linear en la informacion disponible.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en diez idiomas: aleman, ingles, espanol, frances, italiano, japones, coreano, portugues, ruso y chino.
- Quince voces predefinidas (custom voices), entre ellas aiden (en), dylan, eric, serena, uncle_fu y vivian (zh), ono_anna (ja), sohee (ko) y ryan en siete idiomas (de, en, es, fr, it, pt, ru).
- Generacion de audio en formato WAV mediante la API de phoonnx (voice.synthesize_wav).
- Integracion con asistentes de voz OVOS a traves del plugin ovos-tts-plugin-phoonnx y configuracion en mycroft.conf.
- Normalizacion y conversion de texto mediante scriptconv antes de la sintesis.
- No se documentan capacidades de clonacion de voz, control de emocion, tool calling ni razonamiento multi-paso, al tratarse de un modelo TTS.

## Casos de uso

- Asistentes de voz en OVOS: el plugin ovos-tts-plugin-phoonnx permite seleccionar la voz en mycroft.conf y sintetizar respuestas en tiempo real; el empaquetado ONNX simplifica el despliegue en dispositivos domoticos.
- Lectura de contenidos multilingues: con diez idiomas y quince voces, el modelo puede narrar articulos o documentos eligiendo la voz adecuada por idioma (por ejemplo, ryan/es para espanol y ryan/de para aleman).
- Generacion de audiolibros y podcasts: la API synthesize_wav escribe directamente ficheros WAV, lo que facilita la produccion por lotes de narraciones con una voz consistente.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces de accesibilidad en aplicaciones de escritorio y web, aprovechando la licencia Apache 2.0 para uso comercial.
- Localizacion de productos: sintesis de mensajes de interfaz o avisos en los diez idiomas soportados sin necesidad de contratar servicios de TTS en la nube.
- Prototipado de agentes conversacionales: integracion del modelo como capa de salida de voz en pipelines de agentes, combinando la sintesis con modulos de reconocimiento y dialogo.
- Pruebas de calidad de voz en investigacion: al ser ONNX y de 0,6 B de parametros, sirve como linea base reproducible para comparar sistemas TTS en entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 0,6 B de parametros y pesos en ONNX, la inferencia cabe previsiblemente en GPUs consumer, aunque el repositorio no publica cifras de memoria.
- GPU recomendadas: no disponible; al ejecutarse via ONNX Runtime puede usar CPU o GPU compatible con dicho runtime.
- Cabe en GPU consumer: probable por el tamano del modelo (0,6 B), pero sin datos oficiales de consumo de VRAM.
- Opciones de despliegue: libreria phoonnx (pip install --pre phoonnx) con ONNX Runtime; integracion en OVOS mediante ovos-tts-plugin-phoonnx. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/qwen3tts-multi-customvoice-0.6b-unicode | 0,6 B | 10 | ONNX (phoonnx) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice (upstream) | 0,6 B | 10 | pesos originales de Qwen | Apache 2.0 | Hugging Face |
| Otras variantes Qwen3-TTS empaquetadas para phoonnx | no disponible | no disponible | ONNX | Apache 2.0 | Coleccion Phoonnx/qwen3-tts en Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de modelos TTS alternativos en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un empaquetado, no un modelo nuevo: cualquier limitacion del modelo upstream Qwen3-TTS-12Hz-0.6B-CustomVoice se hereda sin cambios.
- No se documentan sesgos linguisticos ni de voces; al cubrir diez idiomas con quince voces, la calidad puede variar entre idiomas y no hay evaluaciones publicadas en la ficha.
- Riesgo de pronunciacion incorrecta en textos con caracteres especiales, siglas o dominios tecnicos, ya que la entrada se basa en puntos de codigo Unicode normalizados por scriptconv.
- No se detallan limitaciones de longitud de texto por sintesis; la API de ejemplo trabaja con una frase, por lo que textos largos requeriran segmentacion por parte del usuario.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la model card del modelo upstream para condiciones adicionales.
- Dependencia de la libreria phoonnx en version preliminar (pip install --pre phoonnx), lo que implica posible inestabilidad de API.
- El repositorio tiene un uso muy bajo (57 descargas, 0 likes), por lo que la validacion comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/qwen3tts-multi-customvoice-0.6b-unicode
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Coleccion Qwen3-TTS empaquetada para phoonnx: https://huggingface.co/collections/Phoonnx/qwen3-tts-6af8ecbfc0f1dc548b8948f9
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
