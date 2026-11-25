# Phoonnx/supertonic-multi-unicode

## Resumen

supertonic-multi-unicode es un paquete de pesos del modelo de sintesis de voz SuperTonic, desarrollado originalmente por Supertone (a partir de Supertone/supertonic-3) y redistribuido por Phoonnx en formato ONNX para su uso con la libreria de text-to-speech phoonnx. El modelo resuelve el problema de generar voz sintetica de forma local y ligera en 31 idiomas, con un unico checkpoint que cubre un abanico linguistico muy amplio que va del arabe al vietnamita, pasando por las principales lenguas europeas, el hindi, el japones o el coreano.

La relevancia de esta ficha radica en su empaquetado: frente a pipelines de TTS que requieren frameworks pesados, este repositorio ofrece pesos ONNX de 0,4 GB con una integracion directa en la libreria phoonnx y en el ecosistema OVOS (OpenVoiceOS) mediante el plugin ovos-tts-plugin-phoonnx. El modelo trabaja sobre puntos de codigo Unicode como entrada de texto, lo que simplifica el front-end y evita dependencias de fonemizadores especificos por idioma.

No se dispone de informacion publica sobre el numero de parametros, la arquitectura interna detallada ni los datos de entrenamiento en la documentacion proporcionada; la model card se limita a describir el uso, los idiomas y el catalogo de voces empaquetadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SuperTonic (Supertone); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ar, bg, cs, da, de, el, en, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi (31 idiomas) |
| Licencia | openrail |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,4 GB |
| Entrada de texto | puntos de codigo Unicode (UnicodeCodepointPhonemizer de scriptconv) |
| Voces empaquetadas | F1-F5 y M1-M2 por idioma (7 voces x 31 idiomas) |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La informacion disponible identifica la arquitectura como SuperTonic, el sistema de sintesis de voz de Supertone, del que este repositorio es un empaquetado para inferencia ONNX. No se han publicado en la documentacion proporcionada detalles sobre el tipo de red (si es un modelo acustico con vocoder integrado, un modelo end-to-end o un sistema en dos etapas), el numero de parametros, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de alineamiento o ajuste fino con RLHF.

El aspecto tecnico mas destacable y documentado es el front-end de texto: phoonnx delega la normalizacion en la libreria scriptconv, que convierte el texto en puntos de codigo Unicode mediante UnicodeCodepointPhonemizer. Este enfoque evita fonemizadores dependientes del idioma y permite que un mismo checkpoint procese texto en alfabetos y sistemas de escritura muy distintos (latino, cirilico, griego, arabe, devanagari, hangul, kana, etc.). El modelo se distribuye como pesos ONNX, lo que facilita su despliegue en CPU sin necesidad de GPUs dedicadas.

## Capacidades

- Sintesis de voz (text-to-speech) en 31 idiomas con un unico paquete de pesos.
- Catalogo de voces integrado: cinco voces femeninas (F1-F5) y dos masculinas (M1-M2) por cada idioma soportado.
- Entrada basada en puntos de codigo Unicode, lo que permite procesar texto multiescritura sin fonemizadores por idioma.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable desde `mycroft.conf`.
- Inferencia local en formato ONNX, apta para entornos sin GPU.
- No se documentan capacidades de clonacion de voz, control de emocion, SSML avanzado ni sintesis en streaming.

## Casos de uso

- Asistentes de voz locales: el modelo se integra en OVOS mediante el plugin de phoonnx y permite dotar a un asistente domestico de sintesis en 31 idiomas sin depender de servicios en la nube, gracias a los pesos ONNX de 0,4 GB.
- Lectura de contenido multilingue: un lector de articulos o libros puede seleccionar la voz correspondiente al idioma del texto (por ejemplo `supertonic/F1/es` para castellano o `supertonic/M1/de` para aleman) y generar audio con la API `synthesize_wav`.
- Accesibilidad: conversion de texto a voz para personas con discapacidad visual en aplicaciones de escritorio o moviles, aprovechando que el modelo puede ejecutarse en CPU sin infraestructura dedicada.
- Locucion automatizada de boletines y avisos: generacion de anuncios pregrabados en multiples idiomas para transporte publico, aeropuertos o comercios, con voces masculinas y femeninas alternativas.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten un TTS rapido de integrar en un pipeline Python pueden instalar `phoonnx` y cargar la voz deseada con pocas lineas de codigo.
- Sistemas de megafonia o kioscos interactivos en entornos multilingues: al cubrir idiomas como arabe, hindi, japones, coreano o vietnamita, un mismo despliegue puede atender usuarios de comunidades linguisticas diversas.
- Generacion de material educativo con audio: narracion de lecciones o ejercicios de idiomas usando distintas voces para diferenciar personajes o turnos de conversacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de pesos ONNX de 0,4 GB, la huella de memoria es reducida y compatible con ejecucion en CPU.
- GPU recomendadas: no se especifican; el formato ONNX permite ejecucion en CPU y, opcionalmente, aceleracion mediante proveedores de ejecucion ONNX Runtime (CUDA, DirectML, CoreML) si estan disponibles.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del repositorio (0,4 GB), aunque no se documentan requisitos minimos ni modelos concretos.
- Opciones de despliegue: libreria phoonnx (`pip install --pre phoonnx`), plugin `ovos-tts-plugin-phoonnx` para OVOS y ejecucion directa de los pesos ONNX con ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma(s) | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| supertonic-multi-unicode (este) | 31 idiomas | ONNX | 0,4 GB (repo) | openrail | Empaquetado phoonnx, 7 voces por idioma |
| Piper | Decenas de idiomas (voces separadas) | ONNX | Variable por voz | MIT (segun proyecto) | Voces independientes por idioma, orientado a dispositivos |
| Coqui TTS (XTTS v2) | Multilingue (aprox. 17 idiomas) | PyTorch | Varios GB | Coqui Public Model License | Clonacion de voz, requiere GPU para buen rendimiento |
| Kokoro | Principalmente ingles y algunos mas | ONNX/PyTorch | Cientos de MB | Apache 2.0 (segun proyecto) | Modelo ligero muy popular para TTS local |

Nota: los datos de los modelos comparados se incluyen como referencia general de categoria y pueden variar segun la version; no se dispone de comparaciones de rendimiento publicadas para este paquete concreto.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo ni evaluaciones de equidad por idioma o acento.
- Riesgo de alucinacion o artefactos de audio (pronunciacion incorrecta, entonacion plana) en textos fuera de dominio o con abundantes neologismos, cifras y siglas; no hay datos publicados al respecto.
- El front-end basado en puntos de codigo Unicode puede no resolver correctamente la pronunciacion de palabras ambiguas o polisemicas sin normalizacion adicional por idioma.
- No se especifican limites de longitud de entrada; la sintesis se realiza por frases o segmentos de texto.
- La licencia openrail debe revisarse con detalle antes de uso comercial: impone condiciones de uso aceptable y posibles restricciones de redistribucion que conviene verificar en el texto completo de la licencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy limitada y escasa validacion por parte de la comunidad.
- No se dispone de informacion sobre la calidad objetiva (MOS) ni sobre el rendimiento en produccion; se recomienda evaluar el modelo con muestras propias antes de desplegarlo.
- Dependencia de la libreria phoonnx (version preliminar, `--pre`) y de scriptconv para el preprocesado del texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Phoonnx/supertonic-multi-unicode
- Modelo upstream: https://huggingface.co/Supertone/supertonic-3
- Coleccion SuperTonic de Phoonnx: https://huggingface.co/collections/Phoonnx/supertonic-6af8ecc17005c13853492803
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
