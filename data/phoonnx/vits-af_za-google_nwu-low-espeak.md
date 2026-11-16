# Phoonnx/vits-af_za-google_nwu-low-espeak

## Resumen

`vits-af_za-google_nwu-low-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su suite de voces Mimic 3 y empaquetado posteriormente por Phoonnx en formato ONNX para su libreria de inferencia TTS homonima. El modelo esta especializado en la variante sudafricana del afrikaans (`af-ZA`) y emplea fonemas espeak como representacion intermedia de entrada, lo que lo vincula directamente al ecosistema espeak-ng.

Se trata de un modelo de voz individual de baja carga computacional (la etiqueta `low` en el nombre alude a la variante ligera del voice pack original de Mimic 3), con un tamano de repositorio de aproximadamente 0,1 GB. Su relevancia actual es limitada pero concreta: cubre una combinacion de idioma y variante regional poco representada en los catalogos TTS modernos y se integra en el stack de asistentes de voz OVOS, lo que lo hace util para despliegues de domotica y asistentes locales en afrikaans.

La publicacion en Hugging Face data de noviembre de 2026 y acumula un volumen de descargas muy bajo (19), lo que refleja su caracter de nicho. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los datos exactos de entrenamiento en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en ONNX |
| Idiomas soportados | afrikaans, variante `af-ZA` |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Autor original | Mycroft AI |
| Empaquetado por | Phoonnx |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional condicionado por texto, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. El modelo produce audio directamente a partir de fonemas sin necesidad de un vocoder externo, lo que simplifica el despliegue. En este caso concreto, la entrada no es texto crudo sino fonemas espeak en alfabeto IPA, generados por `EspeakPhonemizer` de la libreria `scriptconv`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el corpus de habla utilizado ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino posterior. La model card unicamente referencia el repositorio upstream `MycroftAI/mimic3-voices/voices/af_ZA/google-nwu_low`, del que se hereda el modelo y la licencia. La innovacion tecnica destacable es el empaquetado en ONNX para ejecucion portable con phoonnx, incluyendo soporte en navegador mediante phoonnx.js.

## Capacidades

- Sintesis de voz a partir de texto en afrikaans sudafricano (`af-ZA`).
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Conversion de texto a fonemas espeak-ng con normalizacion previa mediante `scriptconv`.
- Integracion como plugin TTS en OVOS mediante `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador a traves de phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modos de pensamiento: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada al unico idioma empaquetado (`af-ZA`); no se documentan otras variantes en este repositorio.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en afrikaans sin depender de servicios en la nube, lo que encaja en despliegues de domotica con requisitos de privacidad.
- Lectura de notificaciones y alertas en sistemas embebidos: su tamano reducido (~0,1 GB en ONNX) permite incluirlo en dispositivos con almacenamiento limitado, como Raspberry Pi u otros SBC, para anuncios de estado del sistema.
- Accesibilidad para hablantes de afrikaans: conversion de texto a voz en aplicaciones de lectura de pantalla o interfaces de accesibilidad donde no existen voces comerciales para esta variante regional.
- Síntesis en el navegador: mediante phoonnx.js el modelo puede ejecutarse en cliente sin backend, util para demos interactivas o aplicaciones web que necesitan TTS en afrikaans sin enviar texto a un servidor.
- Generacion de audiolibros o contenido pregrabado de bajo coste: la inferencia por lotes con phoonnx permite producir narraciones en afrikaans para catalogos pequenos donde no se justifica contratar locucion.
- Pruebas de integracion en pipelines TTS: sirve como voz de referencia para validar el front-end de fonemizacion espeak y el pipeline de `scriptconv` antes de desplegar voces de mayor calidad.
- Prototipado de interfaces conversacionales en afrikaans: permite construir MVPs de IVR o chatbots de voz sin coste de licencia comercial, gracias a la licencia CC-BY-SA-4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB en ONNX) se espera un consumo de memoria muy bajo, compatible con CPU.
- GPU recomendadas: no se documentan; el modelo esta pensado para ejecucion en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: previsiblemente si en cualquier GPU consumer moderna, aunque no hay datos oficiales de rendimiento.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS), phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles.
- Requisito adicional: espeak-ng instalado en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]` para usar el port espyak; este ultimo puede producir errores de pronunciacion en algunas palabras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-af_za-google_nwu-low-espeak | VITS | af-ZA | no aplica | CC-BY-SA-4.0 | ONNX | Hugging Face, phoonnx |
| Otras voces Mimic 3 (p. ej. variantes `google-nwu`) | VITS | multiples | no aplica | CC-BY-SA-4.0 (segun upstream) | ONNX | MycroftAI/mimic3-voices |
| Modelos TTS multilingues tipo XTTS o MMS | no disponible en la informacion | multiples | no aplica | variable | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura limitada a un unico idioma y variante (`af-ZA`); no sirve para otros idiomas sin un modelo distinto.
- La calidad depende del front-end de fonemizacion: usar espyak en lugar de espeak-ng puede provocar pronunciaciones incorrectas en algunas palabras, segun advierte la propia model card.
- No hay informacion publica sobre sesgos del corpus de entrenamiento, calidad de la voz, prosodia ni naturalidad.
- Riesgo de alucinacion en el sentido de artefactos acusticos o pronunciaciones erroneas ante texto fuera de dominio, aunque no se documenta formalmente.
- Licencia CC-BY-SA-4.0: permite uso comercial pero obliga a compartir bajo la misma licencia las obras derivadas y a atribuir; conviene revisar las implicaciones para productos propietarios.
- El modelo es de nicho y con muy pocas descargas (19) y actualizaciones recientes; el soporte de la comunidad es limitado.
- No se documentan garantias de mantenimiento, versionado ni compatibilidad futura con phoonnx.
- El pipeline de inferencia requiere dependencias externas (espeak-ng, scriptconv) que anaden complejidad al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-af_za-google_nwu-low-espeak
- Repositorio upstream (MycroftAI/mimic3-voices, voz af_ZA/google-nwu_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/af_ZA/google-nwu_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (TTS en navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion de modelos VITS empaquetados para phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
