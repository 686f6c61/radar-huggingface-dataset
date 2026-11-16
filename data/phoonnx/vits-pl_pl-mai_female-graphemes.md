# Phoonnx/vits-pl_pl-mai_female-graphemes

## Resumen

vits-pl_pl-mai_female-graphemes es un modelo de sintesis de voz (text-to-speech) de arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo sintetiza voz femenina en polaco (pl-PL) a partir de texto de entrada procesado a nivel de grafemas, sin necesidad de un fonemizador especifico del idioma.

El modelo procede del catalogo de modelos de Coqui TTS (version 0.8.0) y ha sido reconvertido a ONNX para facilitar su despliegue ligero en Python y en el ecosistema OVOS (Open Voice OS). Su relevancia actual reside en que ofrece una alternativa de TTS offline, de licencia permisiva (BSD-3-Clause) y con un tamano de repositorio muy reducido (0,1 GB), adecuada para asistentes de voz locales y aplicaciones embebidas en polaco.

No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto ni los datos exactos de entrenamiento; la model card se limita a documentar la arquitectura, el origen y el uso basico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | polaco (pl-PL) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (grafemas) |
| Voz | femenina (mai_female) |
| Dataset de origen | M-AILABS (segun notas de licencia de Coqui) |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. El modelo genera formas de onda directamente a partir de la representacion textual, sin un vocoder externo separado.

Este checkpoint concreto es una conversion a ONNX del modelo `tts_models--pl--mai_female--vits` publicado en Coqui TTS v0.8.0, entrenado presumiblemente sobre el corpus M-AILABS en polaco, segun las notas de licencia incluidas en la model card. El front end textual utiliza el `GraphemePhonemizer` de la libreria scriptconv, de modo que el texto se normaliza y se convierte directamente en grafemas sin pasar por un fonemizador linguistico. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino posteriores.

## Capacidades

- Sintesis de voz femenina en polaco (pl-PL) a partir de texto.
- Entrada basada en grafemas: no requiere fonemizacion especifica del idioma.
- Generacion de audio en formato WAV mediante la API de phoonnx.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecucion offline mediante pesos ONNX.
- Normalizacion de texto previa mediante scriptconv.
- No soporta tool calling, agentes, vision, audio de entrada ni modos de razonamiento; es exclusivamente un modelo de sintesis de voz.

## Casos de uso

- Asistentes de voz locales en polaco: el modelo puede integrarse en OVOS como motor TTS para responder a comandos de voz sin conexion, gracias a sus pesos ONNX ligeros y su licencia permisiva.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en aplicaciones de escritorio o moviles en polaco, con latencia baja al no requerir servicios en la nube.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en lectores de pantalla o aplicaciones de lectura en polaco.
- Generacion de audiolibros o contenido narrado: sintesis por lotes de parrafos de texto para producir narraciones en voz femenina.
- Sistemas de megafonia y anuncios automatizados: generacion de avisos pregrabados en polaco para transporte publico, comercios o edificios.
- Prototipado de interfaces conversacionales: entorno de pruebas para desarrolladores que necesitan un TTS rapido y local antes de integrar un servicio comercial.
- Educacion y aprendizaje de idiomas: generacion de ejemplos de pronunciacion en polaco para materiales didacticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,1 GB, por lo que la huella de memoria es muy reducida y cabe en GPUs de gama baja o incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente. Para uso en produccion con alta concurrencia se podria emplear una T4 o superior, aunque no hay datos oficiales.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer moderna (GTX 1060 o superior) e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| vits-pl_pl-mai_female-graphemes | VITS | pl-PL | no disponible | no disponible | BSD-3-Clause | ONNX |
| Piper (voces polacas) | VITS | pl-PL | no disponible | no disponible | MIT (segun modelo) | ONNX |
| Coqui TTS pl-mai_female (original) | VITS | pl-PL | no disponible | no disponible | BSD-3-Clause | PyTorch |
| MMS-TTS polaco (Meta) | VITS | pl | no disponible | no disponible | CC-BY-NC | PyTorch |

Los datos de los modelos comparables no estan confirmados en la informacion proporcionada y se ofrecen solo como referencia de categoria; no se dispone de cifras de rendimiento comparativas.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta polaco (pl-PL); el texto en otros idiomas producira resultados incorrectos.
- Entrada por grafemas: al no usar fonemizacion linguistica, la pronunciacion de palabras extranas, siglas o numeros puede ser imprecisa.
- Voz unica femenina: no hay variedad de hablantes ni control de estilo o emocion documentado.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar artefactos, ruidos o pronunciaciones erroneas en textos largos o atipicos.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse sobre M-AILABS puede reflejar las caracteristicas del corpus (registro, acento y demografia de los hablantes originales).
- Licencia BSD-3-Clause: permite uso comercial con atribucion, pero se recomienda revisar las condiciones del corpus M-AILABS subyacente.
- Sin datos de benchmarks ni de rendimiento en produccion: conviene validar la calidad y la latencia en el caso de uso concreto antes de desplegar.
- Modelo con muy poca adopcion (17 descargas, 0 likes): no hay evidencia comunitaria sobre su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-mai_female-graphemes
- Modelo original de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--pl--mai_female--vits.zip
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
