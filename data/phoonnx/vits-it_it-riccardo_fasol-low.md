# Phoonnx/vits-it_it-riccardo_fasol-low

## Resumen

vits-it_it-riccardo_fasol-low es un modelo de sintesis de voz (text-to-speech) de arquitectura VITS, desarrollado originalmente por Mycroft AI para su conjunto de voces Mimic 3 y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo genera audio a partir de texto en italiano (it-IT) y esta pensado para integrarse en asistentes de voz y sistemas de sintesis embebidos, no para generacion de texto.

La relevancia de este modelo radica en su caracter practico: es un modelo pequeno y ligero (el repositorio ocupa aproximadamente 0,1 GB), distribuido en formato ONNX, lo que facilita su despliegue en entornos con recursos limitados y su integracion en pipelines de TTS sin depender de frameworks de deep learning pesados. La etiqueta "low" en el nombre indica una variante de baja calidad o baja huella, orientada a inferencia rapida.

Se trata de un modelo unicamente de sintesis de voz: no es un modelo de lenguaje, no genera texto ni razona, y su unica funcion es convertir texto italiano en audio. La informacion disponible sobre arquitectura interna, datos de entrenamiento y rendimiento cuantitativo es muy limitada, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Autor original | Mycroft AI |
| Empaquetado | Phoonnx |
| Tamano del repositorio | aproximadamente 0,1 GB |
| Fecha de creacion | 2026-11-14 |
| Fecha de actualizacion | 2026-11-15 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional y un decoder generativo basado en flujos normalizadores y un vocoder integrado. VITS se caracteriza por generar audio de forma directa desde fonemas sin necesidad de un vocoder separado en tiempo de inferencia, lo que simplifica el despliegue.

La entrada de texto se procesa mediante el fonemizador gruut, que convierte el texto italiano en fonemas IPA antes de alimentar el modelo. El modelo se distribuye en formato ONNX, lo que permite ejecutarlo con el runtime de ONNX y con la libreria phoonnx. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla de las propias de VITS.

## Capacidades

- Sintesis de voz a partir de texto en italiano (it-IT).
- Generacion de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Conversion de texto a fonemas IPA mediante el fonemizador gruut integrado en scriptconv.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable desde `mycroft.conf`.
- Ejecucion en formato ONNX, apta para entornos ligeros y sin GPU dedicada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de modo thinking, vision ni audio de entrada.
- Capacidad multilingue limitada exclusivamente al italiano.

## Casos de uso

- Asistentes de voz en italiano: el modelo puede integrarse en OVOS como plugin de TTS para leer respuestas del asistente en italiano, gracias a su empaquetado nativo y a la configuracion directa en `mycroft.conf`.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en italiano para sistemas de domotica o aplicaciones de escritorio, aprovechando el bajo tamano del modelo (0,1 GB) y su ejecucion en ONNX.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de accesibilidad en italiano, con inferencia local sin dependencia de servicios en la nube.
- Prototipado rapido de interfaces de voz: su instalacion via `pip install --pre phoonnx "scriptconv[gruut]"` permite incorporar TTS italiano en pocos minutos en proyectos de investigacion.
- Sistemas embebidos y edge computing: al ser un modelo ONNX pequeno, puede desplegarse en dispositivos con recursos limitados donde no cabe un modelo TTS de mayor tamano.
- Generacion de audio para contenido educativo o demostraciones: sintesis de frases en italiano para materiales didacticos o pruebas de integracion de pipelines de voz.
- Pruebas de regresion en pipelines de TTS: su naturaleza determinista y ligera lo hace util como voz de referencia en tests automatizados de sistemas de sintesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de aproximadamente 0,1 GB, es probable que funcione en CPU sin GPU dedicada, aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamano del repositorio, es plausible que quepa en cualquier GPU de consumo, pero no se especifica.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, runtime ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamano repo |
|---|---|---|---|---|---|
| vits-it_it-riccardo_fasol-low | VITS | it-IT | ONNX | CC-BY-SA-4.0 | aproximadamente 0,1 GB |
| Otras voces Mimic 3 (Mycroft AI) | VITS | multi-idioma | varios | variable | no disponible |
| Otras voces VITS empaquetadas por Phoonnx | VITS | multi-idioma | ONNX | variable | no disponible |

No se dispone de datos de rendimiento ni de parametros detallados de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a aspectos de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo exclusivamente de sintesis de voz: no genera texto, no razona y no soporta tareas de NLP.
- Unico idioma soportado: italiano (it-IT); no es adecuado para otros idiomas.
- La variante "low" sugiere una calidad de audio reducida o un modelo de baja huella, aunque no se especifica el grado de degradacion.
- No hay informacion sobre sesgos del habla, calidad de prosodia ni naturalidad del audio generado.
- Riesgo de errores de pronunciacion en palabras extranas, siglas o nombres propios no cubiertos por el fonemizador gruut.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion y obliga a compartir las obras derivadas bajo la misma licencia; es necesario revisar las condiciones de atribucion a Mycroft AI y Phoonnx.
- Dependencia de la libreria phoonnx y del extra `scriptconv[gruut]`; la instalacion usa `--pre`, lo que indica versiones preliminares.
- No se han publicado benchmarks ni metricas objetivas de calidad (MOS, WER) en la informacion disponible.
- El modelo fue creado y actualizado en noviembre de 2026 segun los metadatos, lo que puede indicar una version reciente o un empaquetado reciente del modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-riccardo_fasol-low
- Repositorio original de la voz (Mycroft AI): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/it_IT/riccardo-fasol_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion de modelos VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
