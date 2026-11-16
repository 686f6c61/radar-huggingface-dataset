# Phoonnx/vits-sw-lanfrica-low-gruut

## Resumen

vits-sw-lanfrica-low-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI como parte de su catalogo de voces para Mimic 3 y empaquetado posteriormente por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo sintetiza voz en suajili (`sw`) a partir de texto en ese idioma, convirtiendo previamente la entrada a fonemas IPA mediante el fonemizador gruut.

La relevancia de este modelo es practica: ofrece una voz en suajili lista para desplegar en entornos de inferencia ONNX, integrable tanto en Python como en el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. Su tamano de repositorio (0,1 GB) sugiere un modelo compacto, adecuado para despliegue en CPU o en hardware modesto, aunque no se han publicado especificaciones detalladas de parametros ni de contexto en la informacion disponible.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a desarrolladores que necesiten TTS en suajili dentro del ecosistema Mycroft/OVOS o que quieran reutilizar voces Mimic 3 en pipelines propios basados en ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es texto fonemizado) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | suajili (`sw`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Autor original | Mycroft AI (via mimic3-voices) |
| Empaquetado | Phoonnx |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. Permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder separado, lo que simplifica el despliegue y reduce la latencia frente a pipelines en cascada.

En este caso concreto no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el corpus de voz utilizado ni si se aplicaron tecnicas de ajuste fino o alineamiento forzado. El modelo procede del repositorio `mimic3-voices` de Mycroft AI, que agrupa voces preentrenadas para Mimic 3; la version empaquetada por Phoonnx se distribuye en ONNX y utiliza el fonemizador gruut para convertir el texto suajili a IPA antes de la inferencia.

## Capacidades

- Sintesis de voz en suajili a partir de texto plano, con salida en formato WAV.
- Conversion de texto a fonemas IPA mediante `GruutPhonemizer` de la libreria `scriptconv`.
- Inferencia sobre ONNX Runtime, lo que permite ejecucion en CPU y en entornos sin GPU.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y configuracion en `mycroft.conf`.
- Uso programatico en Python mediante `TTSModelManager` y el identificador de voz `mimic3/sw/lanfrica_low`.
- No se ha documentado soporte de tool calling, agentes, vision, audio de entrada ni modos de razonamiento (no aplica a un modelo TTS).

## Casos de uso

- Asistentes de voz en suajili para OVOS/Mycroft: el modelo se integra como plugin TTS y permite que un asistente domestico responda en suajili sin infraestructura adicional, usando la configuracion `ovos-tts-plugin-phoonnx`.
- Lectura de contenidos en aplicaciones educativas: sintesis de textos en suajili para materiales de aprendizaje de idiomas o alfabetizacion, ejecutandose en CPU gracias al formato ONNX.
- Accesibilidad para personas con discapacidad visual: conversion de articulos o documentos en suajili a audio en entornos de escritorio o servidor sin GPU.
- Generacion de avisos y notificaciones habladas: locuciones pregrabadas de forma dinamica en sistemas de megafonia, transporte o servicios publicos en zonas suajiliparlantes.
- Prototipado de interfaces conversacionales: pruebas rapidas de UX de voz en suajili antes de invertir en voces comerciales o entrenamientos propios.
- Investigacion en TTS de bajos recursos: uso como linea base o punto de comparacion para experimentos con otras voces suajili o para estudiar el pipeline gruut + VITS + ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,1 GB) es plausible su ejecucion en CPU, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite en principio ejecucion en CPU y en GPU via ONNX Runtime, pero no hay datos publicados.
- Opciones de despliegue: ONNX Runtime a traves de la libreria phoonnx (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-sw-lanfrica-low-gruut (este modelo) | VITS | suajili | ONNX | CC-BY-SA-4.0 | Hugging Face (Phoonnx) |
| Otras voces de mimic3-voices para `sw` | VITS | suajili | Mimic 3 (formato propio) | segun repositorio upstream | GitHub MycroftAI/mimic3-voices |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | ONNX | variable por modelo | Hugging Face (coleccion Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta suajili (`sw`); no se ha documentado comportamiento multilingue ni cambio de idioma.
- La entrada debe pasar por el fonemizador gruut; texto sin normalizar o con caracteres fuera del alfabeto esperado puede degradar la sintesis.
- No hay informacion publicada sobre sesgos, calidad subjetiva (MOS) ni cobertura dialectal del corpus de entrenamiento.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si puede haber artefactos acusticos o pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento.
- La licencia CC-BY-SA-4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas; conviene revisar las implicaciones para uso comercial y para la distribucion de audio generado.
- El modelo tiene cero descargas y cero likes, lo que indica ausencia de validacion por parte de la comunidad; no se recomienda para produccion sin evaluacion previa.
- No se documentan requisitos de hardware, latencia ni throughput, por lo que el dimensionamiento debe hacerse empiricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sw-lanfrica-low-gruut
- Repositorio upstream (MycroftAI/mimic3-voices, voz `sw/lanfrica_low`): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/sw/lanfrica_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx en Hugging Face: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
