# Phoonnx/vits-ro_ro-cv

## Resumen

vits-ro_ro-cv es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx para su uso con la libreria ONNX `phoonnx`. El modelo convierte texto en rumano (ro-RO) en audio, empleando una entrada basada en caracteres (graphemes) procesada mediante el fonemizador `GraphemePhonemizer` de la libreria `scriptconv`. Su origen es el paquete oficial de Coqui TTS `tts_models--ro--cv--vits`, entrenado sobre el corpus Common Voice en rumano.

El modelo resuelve la necesidad de sintesis de voz en rumano dentro del ecosistema de asistentes de voz open source OVOS/Mycroft, donde se integra mediante el plugin `ovos-tts-plugin-phoonnx`. Su relevancia radica en que ofrece una voz preentrenada con licencia permisiva BSD-3-Clause, empaquetada en formato ONNX para inferencia ligera, con un tamano de repositorio de aproximadamente 0,1 GB, lo que facilita su despliegue en entornos con recursos limitados.

No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto ni los detalles del entrenamiento mas alla de lo indicado en la model card. La ficha se limita, por tanto, a los datos verificables proporcionados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | rumano (ro-RO) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema de sintesis de voz extremo a extremo que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial multiperiodo. VITS genera audio de forma directa a partir del texto sin necesidad de un modelo acustico y un vocoder separados, lo que simplifica el pipeline de inferencia.

Segun la model card, el modelo fue entrenado por Coqui sobre el corpus Common Voice en rumano (identificado como `ro-cv-vits` en la lista de modelos de Coqui TTS). No se proporcionan datos sobre el numero de horas de audio, el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La entrada de texto se procesa a nivel de caracteres (graphemes) mediante `GraphemePhonemizer` de `scriptconv`, que normaliza el texto y lo convierte en la representacion de entrada del modelo. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz (text-to-speech) en rumano (ro-RO) a partir de texto de entrada.
- Conversion de texto a audio mediante entrada basada en caracteres (graphemes), con normalizacion previa del texto por `scriptconv`.
- Generacion de ficheros WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con el ecosistema OVOS/Mycroft a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion mediante inferencia ONNX, lo que permite despliegue en entornos ligeros.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz en rumano: el modelo puede integrarse en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx` para dotar de voz en rumano a asistentes domesticos open source, seleccionando la voz `coqui/ro-cv-vits` en `mycroft.conf`.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos del sistema (recordatorios, avisos de calendario) en rumano, aprovechando la ligereza del modelo ONNX (repo de 0,1 GB) para ejecucion en dispositivos de bajos recursos.
- Accesibilidad para personas con discapacidad visual: conversion de texto en pantalla a voz en rumano, permitiendo la lectura de documentos y contenido web mediante un pipeline de TTS local sin dependencia de servicios en la nube.
- Audiolibros y contenido narrado: generacion de audio a partir de texto largo en rumano, troceando el texto en frases y sintetizando cada fragmento con `synthesize_wav`.
- Prototipado de aplicaciones de voz: desarrollo rapido de interfaces conversacionales en rumano usando la API de Python de phoonnx, sin necesidad de entrenar un modelo propio.
- Sistemas de megafonia o anuncios automatizados: generacion de locuciones en rumano para transporte publico, comercios o eventos, con despliegue local en CPU mediante ONNX.
- Investigacion en TTS de bajos recursos: uso del modelo como linea base para experimentos de sintesis en rumano o para comparar con otras voces VITS del ecosistema phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (0,1 GB) sugiere un modelo ligero que probablemente puede ejecutarse en CPU, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el formato ONNX y el reducido tamano del repositorio apuntan a que podria ejecutarse en hardware modesto, pero no se aportan datos verificables.
- Opciones de despliegue: `phoonnx` (libreria Python y plugin OVOS `ovos-tts-plugin-phoonnx`). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-ro_ro-cv (Phoonnx) | VITS | rumano (ro-RO) | BSD-3-Clause | ONNX | Hugging Face, via phoonnx |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios idiomas | segun modelo | ONNX | Hugging Face (coleccion VITS de Phoonnx) |
| Modelos TTS de Coqui TTS originales | VITS y otras | varios idiomas | segun modelo | PyTorch | GitHub de Coqui TTS |

No se dispone de datos de rendimiento comparativo (benchmarks, MOS, latencia) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre Common Voice, podria heredar sesgos de representacion del corpus (acentos, genero, edad).
- Riesgo de alucinacion: en TTS, el riesgo se traduce en pronunciaciones incorrectas o artefactos de audio ante texto fuera de dominio, aunque no se documenta explicitamente.
- Limitaciones de idioma: el modelo solo soporta rumano (ro-RO); no se ha validado para otros idiomas.
- Limitaciones de contexto: no se especifica la longitud maxima de texto por sintesis; se recomienda trocear entradas largas en frases.
- Restricciones de licencia: la licencia BSD-3-Clause permite uso comercial con atribucion y sin endoso; debe conservarse el aviso de copyright y la clausula de no endoso.
- Caveats para produccion: el modelo depende de las librerias `phoonnx` (instalacion con `pip install --pre phoonnx`, version preliminar) y `scriptconv`; la version preliminar de phoonnx puede implicar inestabilidad de API. El modelo tiene solo 26 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad. No se documentan pruebas de calidad de audio (MOS) ni de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ro_ro-cv
- Modelo original de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--ro--cv--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
