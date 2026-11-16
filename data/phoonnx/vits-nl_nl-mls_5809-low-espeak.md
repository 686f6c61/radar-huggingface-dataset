# Phoonnx/vits-nl_nl-mls_5809-low-espeak

## Resumen

vits-nl_nl-mls_5809-low-espeak es un modelo de sintesis de voz (text-to-speech) de tipo VITS para neerlandes de los Paises Bajos (nl-NL), empaquetado por Phoonnx a partir de la voz original de Rhasspy publicada en el repositorio piper-voices. El modelo no se ha entrenado desde cero en este repositorio: Phoonnx toma los pesos de la variante `nl_NL/mls_5809/low` de Piper y los distribuye en formato ONNX listo para su uso con su libreria `phoonnx`, que actua como motor de inferencia en Python y en el ecosistema OVOS.

La relevancia de esta ficha es acotada pero concreta: se trata de una voz ligera (repositorio de 0,1 GB, variante "low" de Piper) pensada para sintesis en tiempo real en dispositivos modestos, asistentes de voz locales y entornos sin conexion. La entrada de texto se realiza mediante fonemas espeak (alfabeto IPA), lo que obliga a disponer de espeak-ng o del extra `phoonnx[espeak]` para el front-end fonetico.

El modelo esta bajo licencia MIT segun la model card original de Rhasspy, lo que facilita su integracion comercial, aunque la informacion publicada sobre datos de entrenamiento, numero de parametros y evaluaciones es practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; variante "low" de Piper) |
| Idiomas soportados | neerlandes (nl-NL) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normales y un discriminador adversarial multiperiodo durante el entrenamiento. En este caso concreto, el modelo procede de la voz `mls_5809` de Piper, derivada del corpus MLS (Multilingual LibriSpeech) para neerlandes, en su variante de calidad "low" de Rhasspy. No se dispone de informacion publicada sobre el numero exacto de horas de audio, la composicion del dataset, ni si hubo etapas de ajuste fino adicionales.

El repositorio de Phoonnx no documenta el proceso de entrenamiento, sino el de empaquetado: conversion de los pesos originales a ONNX y adaptacion del front-end para que la entrada sea texto normalizado convertido a fonemas espeak mediante `scriptconv`. No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa ni atencion lineal; las tecnicas relevantes son las propias de VITS (generacion adversarial, alineamiento monotono y muestreo estocastico de duraciones).

## Capacidades

- Sintesis de voz a partir de texto en neerlandes (nl-NL), con salida en fichero WAV.
- Entrada fonetica mediante espeak-ng en alfabeto IPA, con normalizacion de texto previa a cargo de `scriptconv`.
- Generacion de audio en tiempo real en CPU, adecuada para dispositivos de bajos recursos gracias a la variante "low".
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Uso en navegador a traves de `phoonnx.js`, con entrada espeak o Unicode.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM: es exclusivamente un modelo TTS.
- No dispone de capacidades multimodales de vision ni audio de entrada.

## Casos de uso

- Asistentes de voz locales: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx` y permite respuestas habladas en neerlandes sin depender de servicios en la nube, algo critico para privacidad y funcionamiento offline.
- Lectura de notificaciones y alertas en dispositivos embebidos: al tratarse de una variante "low" de 0,1 GB, cabe en Raspberry Pi y hardware similar, y sintetiza frases cortas con baja latencia.
- Accesibilidad para personas con discapacidad visual: lectura de textos en neerlandes en aplicaciones de escritorio o moviles mediante la API de Python de `phoonnx`.
- Generacion de audiolibros o contenido narrado en neerlandes: el modelo puede sintetizar parrafos largos fragmentando el texto y concatenando los WAV resultantes, con coste computacional bajo.
- Sistemas de megafonia y anuncios automatizados en transporte publico o comercios: la voz neerlandesa permite generar avisos pregrabados o dinamicos sin locutor humano.
- Prototipado de interfaces conversacionales: los desarrolladores pueden validar flujos de voz en neerlandes antes de contratar voces comerciales de mayor calidad, gracias a la licencia MIT y al coste cero del modelo.
- Investigacion en TTS: sirve como referencia ligera para comparar tecnicas de sintesis o para experimentar con front-ends foneticos alternativos en el ecosistema phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MOS (Mean Opinion Score), WER de transcripcion inversa, latencia medida ni throughput en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) se infiere un consumo muy bajo, apto para CPU.
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecucion en CPU, por lo que no requiere GPU dedicada.
- Cabe en GPU de consumo: si, en cualquier GPU moderna, aunque no es necesario su uso.
- Opciones de despliegue: `phoonnx` (Python), `phoonnx.js` (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp ni TGI, que no aplican a modelos TTS.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-nl_nl-mls_5809-low-espeak (este) | VITS | nl-NL | 0,1 GB (repo) | MIT | ONNX | Variante "low" de Piper, empaquetada por Phoonnx |
| rhasspy/piper-voices nl_NL mls_5809 low (upstream) | VITS | nl-NL | no disponible | MIT | ONNX (Piper) | Mismo modelo de origen, sin empaquetado Phoonnx |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | variable | MIT | ONNX | Mismo motor de inferencia, distinto idioma o corpus |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad limitada: la variante "low" de Piper prioriza velocidad y tamano sobre naturalidad, por lo que la prosodia y la calidad de audio seran inferiores a voces de mayor tamano o a soluciones comerciales.
- Dependencia de espeak-ng: sin espeak-ng instalado, la fonemizacion se realiza con espyak, cuyos fonemas difieren en algunos casos y pueden producir palabras mal pronunciadas.
- Cobertura linguistica restringida a nl-NL; no soporta otros idiomas ni variantes regionales del neerlandes de forma documentada.
- Riesgo de errores en la normalizacion de texto: numeros, abreviaturas o simbolos dependen del front-end `scriptconv`, y una normalizacion incorrecta produce una sintesis erronea.
- Sin datos publicados sobre sesgos: no se documenta la composicion demografica del corpus MLS ni posibles sesgos de genero, edad o acento en la voz generada.
- Alucinacion en sentido estricto no aplica, pero si puede producirse una pronunciacion incorrecta o una entonacion atipica en textos fuera de dominio.
- Licencia MIT declarada por el upstream; se recomienda verificar la cadena de licencias (Piper, MLS) antes de un uso comercial a gran escala.
- Sin mantenimiento ni evaluacion documentada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de validacion por terceros.
- No apta para clonacion de voz ni para control fino de estilo o emocion: VITS estandar no expone esas capacidades en esta configuracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl_nl-mls_5809-low-espeak
- Upstream en Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/nl/nl_NL/mls_5809/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
