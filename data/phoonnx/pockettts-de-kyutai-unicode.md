# Phoonnx/pockettts-de-kyutai-unicode

## Resumen
pockettts-de-kyutai-unicode es un modelo de sintesis de voz (text-to-speech) en aleman derivado de Pocket TTS, desarrollado originalmente por Kyutai y reempaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo resuelve la conversion de texto a audio en aleman dentro del ecosistema de asistentes de voz OVOS, permitiendo integrar sintesis neuronal en entornos Python y en plugins de OVOS sin depender de frameworks pesados.

La particularidad de esta variante es su front-end de texto basado en puntos de codigo Unicode (`UnicodeCodepointPhonemizer`), gestionado por la libreria scriptconv, en lugar de fonemizacion linguistica tradicional. El repositorio ocupa 0,8 GB e incluye 26 voces distintas etiquetadas bajo el prefijo `pockettts/de/`. La licencia es CC-BY-4.0, lo que permite uso comercial con atribucion.

Es relevante para desarrolladores que necesitan TTS en aleman desplegable en CPU o GPU modestas mediante ONNX Runtime, con integracion directa en pipelines de asistentes de voz open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (arquitectura neuronal de sintesis de voz; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; variantes de cuantizacion no documentadas) |
| Idiomas soportados | aleman (`de`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento
El modelo es una conversion ONNX de los pesos de Pocket TTS de Kyutai para aleman, realizada por KevinAHM y empaquetada por Phoonnx. La arquitectura subyacente es Pocket TTS, una familia de modelos de sintesis de voz neuronal; la informacion proporcionada no detalla el tipo exacto de red (si es un modelo acoplado texto-a-espectrograma mas vocoder, un modelo end-to-end tipo VITS o similar), ni el numero de parametros, ni la composicion del dataset de entrenamiento.

El aspecto tecnico destacable es el front-end de texto: en lugar de un fonemizador especifico del idioma, esta variante usa `UnicodeCodepointPhonemizer`, que convierte el texto en una secuencia de puntos de codigo Unicode como entrada del modelo. Este diseno simplifica la canalizacion de preprocesado (normalizacion mediante scriptconv) a costa de depender de que el modelo haya sido entrenado con esa representacion. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades
- Sintesis de voz en aleman a partir de texto plano, generando audio WAV.
- Entrada basada en puntos de codigo Unicode, normalizada por scriptconv.
- 26 voces predefinidas disponibles (alba, anna, azelma, bill_boerst, caro_davy, charles, cosette, eponine, estelle, eve, fantine, george, giovanni, jane, javert, jean, juergen, lola, marius, mary, michael, paul, peter_yearsley, rafael, stuart_bell, vera).
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en Python via phoonnx y ONNX Runtime.
- No se documentan capacidades de clonacion de voz, control de emocion, tool calling, agentes ni vision; no aplica a un modelo TTS.

## Casos de uso
- Asistentes de voz open source en OVOS: seleccionando la voz en `mycroft.conf` con el plugin `ovos-tts-plugin-phoonnx`, el modelo sintetiza respuestas en aleman sin salir del ecosistema OVOS.
- Lectura de notificaciones y alertas en aleman: integracion en sistemas de domotica o monitoreo que generan avisos hablados a partir de texto dinamico.
- Accesibilidad para personas con discapacidad visual: conversion de contenido textual en aleman (articulos, correos, documentacion) a audio mediante un pipeline Python con phoonnx.
- Generacion de locuciones para prototipos y demos: al disponer de 26 voces, permite producir variaciones de narracion para pruebas de producto sin coste de licencia adicional (CC-BY-4.0 con atribucion).
- Sistemas de aprendizaje de idiomas: sintesis de frases en aleman para ejercicios de escucha, con seleccion de voz por leccion.
- Integracion en aplicaciones de escritorio o CLI en Python: el formato ONNX y la libreria phoonnx permiten empaquetar el modelo en entornos sin GPU dedicada, con inferencia en CPU.
- Generacion de audiolibros o podcasts de bajo volumen: sintesis por lotes de textos largos en aleman usando distintas voces para segmentar contenido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,8 GB, lo que sugiere un modelo de tamano pequeno apto para CPU y GPU de gama baja.
- GPU recomendadas: no disponible en la informacion; por tamano del repositorio, es plausible su ejecucion en GPU consumer, pero no se confirma.
- Cabe en GPU consumer: no confirmado explicitamente; el tamano del artefacto (0,8 GB) apunta a que si, pero sin datos de VRAM publicados.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin OVOS `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| pockettts-de-kyutai-unicode | no disponible | no disponible | de | CC-BY-4.0 | ONNX |
| kyutai/pocket-tts (upstream, aleman) | no disponible | no disponible | de | CC-BY-4.0 | pesos originales (no ONNX) |
| KevinAHM/pocket-tts-onnx (aleman) | no disponible | no disponible | de | no disponible | ONNX |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias
- Solo soporta aleman (`de`); no es multilingue.
- El front-end basado en puntos de codigo Unicode puede degradar la pronunciacion en textos con caracteres especiales, numeros o abreviaturas si la normalizacion de scriptconv no los cubre adecuadamente.
- Riesgo de alucinacion acotado al ambito TTS: posibles artefactos, prosodia incorrecta o pronunciaciones erroneas en palabras poco frecuentes.
- No se documentan sesgos especificos; al ser un modelo entrenado con datos no descritos, pueden aparecer sesgos de voz (genero, acento, edad) derivados del corpus original.
- Licencia CC-BY-4.0: permite uso comercial pero exige atribucion a Kyutai y a los autores del empaquetado; conviene revisar los terminos exactos de la model card upstream.
- La informacion sobre cuantizacion, parametros y rendimiento es escasa; para produccion se recomienda validar calidad y latencia con el caso de uso concreto.
- Dependencia de librerias especificas (phoonnx, scriptconv) y de la version `--pre` de phoonnx, lo que implica posible inestabilidad de API.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Phoonnx/pockettts-de-kyutai-unicode
- Upstream (Kyutai, aleman): https://huggingface.co/kyutai/pocket-tts/tree/main/languages/german
- Conversion ONNX (KevinAHM): https://huggingface.co/KevinAHM/pocket-tts-onnx/tree/main/onnx/german
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Pocket TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/pocket-tts-6af8ea95fad812f585a5cb91
