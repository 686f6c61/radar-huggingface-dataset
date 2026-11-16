# Phoonnx/glowtts-en_us-kathleen-gruut

## Resumen

glowtts-en_us-kathleen-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente entrenado por Rhasspy como parte del proyecto Larynx y empaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo genera espectrogramas a partir de fonemas IPA proporcionados por el fonemizador gruut, que posteriormente son convertidos en audio por el vocoder hifigan-multi-vctk-small. Esta pensado para sintesis de voz en ingles estadounidense (en-US) con una unica voz identificada como "kathleen".

El modelo resuelve el problema de la sintesis de voz local y ligera: al estar empaquetado en formato ONNX y ocupar apenas 0,1 GB en el repositorio, puede ejecutarse en entornos con recursos limitados, como asistentes de voz embebidos o sistemas domoticos. Es especialmente relevante para el ecosistema OVOS (Open Voice OS), donde se integra mediante el plugin ovos-tts-plugin-phoonnx, y para desarrolladores que necesitan un TTS offline sin dependencias de servicios en la nube.

No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los datos exactos de entrenamiento en la informacion proporcionada. La licencia figura como "other" sin especificacion concreta, lo que supone una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (generacion de espectrogramas) + vocoder HiFi-GAN (hifigan-multi-vctk-small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (empaquetado en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; consultar el release upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Glow-TTS, un modelo de sintesis de voz no autorregresivo que genera espectrogramas mel a partir de secuencias de fonemas mediante normalizing flows y un alineamiento monotono aprendido (MAS, Monotonic Alignment Search). La entrada no es texto crudo sino fonemas en alfabeto IPA generados por el fonemizador gruut, lo que requiere que el texto se normalice y convierta previamente mediante la libreria scriptconv. La salida del modelo es un espectrograma que se transforma en audio mediante el vocoder HiFi-GAN identificado como hifigan-multi-vctk-small.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El modelo original procede del proyecto Larynx de Rhasspy (release v1.0), pero los detalles de entrenamiento no estan incluidos en la informacion proporcionada. La innovacion tecnica destacable es el empaquetado en ONNX para inferencia ligera y su integracion con el ecosistema phoonnx/OVOS.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense (en-US) con una unica voz ("kathleen").
- Conversion de texto a fonemas IPA mediante el fonemizador gruut (integrado a traves de scriptconv).
- Generacion de espectrogramas mel que se convierten en audio mediante el vocoder HiFi-GAN.
- Ejecucion local y offline mediante ONNX, sin dependencia de servicios en la nube.
- Integracion con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio de entrada.
- Capacidad multilingue limitada exclusivamente al ingles estadounidense.

## Casos de uso

- Asistentes de voz embebidos: el modelo puede integrarse en OVOS mediante el plugin ovos-tts-plugin-phoonnx para proporcionar respuestas habladas en ingles en dispositivos domoticos, gracias a su formato ONNX ligero y su ejecucion offline.
- Sistemas de domotica local: al no requerir conexion a internet, es adecuado para entornos donde la privacidad o la latencia son criticos, como Raspberry Pi u otros dispositivos de bajos recursos.
- Lectura de notificaciones y alertas: puede sintetizar mensajes cortos generados por sistemas automatizados (alertas de servidores, recordatorios, estados de sensores) en ingles.
- Prototipado rapido de interfaces de voz: desarrolladores que necesiten validar una experiencia conversacional en ingles pueden usar el modelo sin coste de API ni infraestructura cloud.
- Accesibilidad: conversion de texto a voz para aplicaciones de lectura de pantalla o asistencia a personas con discapacidad visual en entornos de habla inglesa.
- Pruebas de pipelines TTS: util como componente de referencia para comparar calidad y latencia frente a otros modelos TTS en el ecosistema phoonnx.
- Generacion de audio para contenido educativo o demo: sintesis de frases y enunciados en ingles para materiales interactivos sin necesidad de grabaciones humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,1 GB, lo que sugiere un modelo muy ligero que probablemente puede ejecutarse en CPU.
- GPU recomendadas: no disponible. Por el tamano del modelo, es probable que funcione en CPU sin GPU dedicada, aunque no se confirma en la informacion.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX y el tamano reducido sugieren que cabria en cualquier GPU de consumo, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin ovos-tts-plugin-phoonnx para OVOS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| glowtts-en_us-kathleen-gruut | Glow-TTS + HiFi-GAN | en-US | ONNX | other | Voz unica, empaquetado para phoonnx |
| Otros modelos Glow-TTS de la coleccion Phoonnx | Glow-TTS + HiFi-GAN | varios | ONNX | other | Misma arquitectura, distintas voces/idiomas |
| Modelos TTS de referencia (p. ej. Piper, Coqui) | VITS / otros | varios | ONNX / varios | variable | No se dispone de datos comparativos en la informacion |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia "other" sin especificacion: no se registra una licencia concreta, por lo que es imprescindible consultar el release upstream de Rhasspy/Larynx antes de cualquier uso, especialmente comercial.
- Idioma unico: solo soporta ingles estadounidense (en-US); no es util para otros idiomas.
- Voz unica: solo dispone de la voz "kathleen"; no hay variedad de hablantes.
- Dependencia de fonemizacion: requiere el fonemizador gruut y la libreria scriptconv para convertir texto a fonemas IPA; un texto mal normalizado puede degradar la calidad de la sintesis.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar pronunciaciones incorrectas en palabras poco frecuentes, siglas o nombres propios.
- Sesgos: no se dispone de informacion sobre sesgos en la informacion proporcionada.
- Sin datos de benchmarks: no hay metricas objetivas de calidad (MOS, WER) publicadas en la informacion disponible.
- Uso en produccion: la falta de licencia clara y de datos de rendimiento supone un riesgo para despliegues comerciales sin validacion previa.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-en_us-kathleen-gruut](https://huggingface.co/Phoonnx/glowtts-en_us-kathleen-gruut)
- [Repositorio upstream (Rhasspy Larynx v1.0)](https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_kathleen-glow_tts.tar.gz)
- [Vocoder hifigan-multi-vctk-small](https://huggingface.co/Phoonnx/hifigan-multi-vctk-small)
- [Coleccion Glow-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (GitHub)](https://github.com/TigreGotico/scriptconv)
