# Phoonnx/vits-hu_hu-anna-medium-espeak

## Resumen

vits-hu_hu-anna-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo convierte texto en hungaro (hu-HU) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece una voz TTS ligera y ejecutable en local, sin dependencia de servicios en la nube, dentro del ecosistema OVOS/Mycroft.

El modelo procede de la variante `hu/hu_HU/anna/medium` del repositorio rhasspy/piper-voices, que agrupa voces Piper preentrenadas. Phoonnx lo distribuye como un artefacto ONNX listo para cargar mediante su gestor de modelos, con un peso de repositorio de aproximadamente 0,1 GB. La licencia declarada es MIT, lo que facilita su integracion en productos comerciales y proyectos de codigo abierto.

Se trata de un modelo especializado y de alcance acotado: una unica voz femenina para hungaro, sin capacidades multimodales ni de razonamiento. Su valor esta en la simplicidad de despliegue (Python, OVOS o navegador via phoonnx.js) y en el soporte de fonemizacion mediante espeak-ng, que permite una pronunciacion controlada del hungaro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | hungaro (hu-HU) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis neuronal end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con perdidas de reconstruccion y adversarias. VITS produce audio de forma directa a partir de la representacion fonetica, sin necesidad de un vocoder separado en tiempo de inferencia, lo que reduce la latencia y simplifica el despliegue.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino preferencial (no disponible). El modelo procede del catalogo Piper de Rhasspy, entrenado especificamente para la voz `anna` en hungaro con calidad `medium`. La innovacion practica del empaquetado Phoonnx es la conversion a ONNX y la integracion con `scriptconv` para normalizacion de texto y fonemizacion mediante espeak-ng, lo que permite ejecutar la sintesis en Python, en OVOS o en el navegador con phoonnx.js.

## Capacidades

- Sintesis de voz a partir de texto en hungaro (hu-HU) con salida en formato WAV.
- Fonemizacion mediante espeak-ng (alfabeto IPA) a traves de `scriptconv_copyleft.phonemizers.mul`.
- Ejecucion local en CPU o GPU mediante ONNX Runtime, sin llamadas a servicios externos.
- Integracion con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js, con entrada espeak o unicode.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (fuera del alcance del modelo).
- Capacidad multilingue limitada exclusivamente al hungaro.

## Casos de uso

- Asistentes de voz locales en hungaro: integracion en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx` para leer respuestas del asistente sin enviar texto a la nube, con la voz configurada como `piper/hu_HU-anna-medium`.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: el modelo sintetiza frases cortas en hungaro en local, con un coste computacional bajo y sin latencia de red.
- Accesibilidad para personas con discapacidad visual: conversion de texto en pantalla a audio en hungaro dentro de lectores de pantalla o herramientas de escritorio que acepten salida WAV.
- Generacion de audiolibros o contenido educativo en hungaro: sintesis por lotes de parrafos con la voz `anna` para producir narraciones consistentes, dado el caracter determinista de la voz.
- Prototipado de interfaces conversacionales: pruebas de UX de voz en hungaro sin contratar servicios TTS comerciales, gracias a la licencia MIT y al despliegue en Python.
- Sistemas de anuncios en kioscos o dispositivos embebidos: ejecucion en navegador con phoonnx.js o en dispositivos con ONNX Runtime para mensajes pregrabados o dinamicos en hungaro.
- Investigacion en TTS: uso como linea base Piper/VITS para comparar calidad, latencia y fonemizacion con espeak-ng frente a otros sistemas en hungaro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa ~0,1 GB, por lo que la huella en memoria es reducida y compatible con ejecucion en CPU.
- GPU recomendadas: no disponible; al ser un modelo ONNX de VITS de calidad `medium`, es viable en CPU y en GPU consumer, pero no se especifican modelos concretos.
- Compatibilidad con GPU consumer: probable por el tamano del artefacto, aunque no se confirma en la documentacion.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), phoonnx.js (navegador), ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-hu_hu-anna-medium-espeak (este modelo) | VITS | hu-HU | MIT | ONNX | Hugging Face (Phoonnx) |
| rhasspy/piper-voices hu_HU anna medium (upstream) | VITS | hu-HU | MIT | Piper/ONNX | Hugging Face (Rhasspy) |
| Otras voces Piper en hungaro | VITS | hu-HU | MIT (segun upstream) | Piper/ONNX | Hugging Face (Rhasspy) |
| Sistemas TTS neuronales genericos | no disponible | multilingue | variable | variable | variable |

La comparativa detallada con alternativas de la misma categoria no esta disponible en la informacion proporcionada; el unico comparable directo documentado es la voz upstream de Rhasspy, de la que este modelo deriva.

## Limitaciones y advertencias

- Modelo monoidioma: solo sintetiza hungaro (hu-HU); no soporta otros idiomas.
- Dependencia de espeak-ng: sin espeak-ng instalado, la fonemizacion puede fallar o requerir el extra `phoonnx[espeak]`; ademas, algunos fonemas de espyak difieren de espeak-ng y pueden producir pronunciaciones incorrectas.
- Voz unica: solo esta disponible la voz `anna` en calidad `medium`; no hay variantes de hablante ni control de estilo.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar pronunciaciones erroneas en palabras fuera del dominio de entrenamiento o en texto no normalizado correctamente.
- Sesgos: no se documentan sesgos especificos, pero al ser una voz unica y un dataset de origen no detallado, la representatividad linguistica es limitada (no disponible).
- Licencia MIT: permite uso comercial, pero se recomienda verificar la licencia declarada por el upstream rhasspy/piper-voices, ya que el empaquetado remite a ella.
- Sin datos de benchmarks ni de latencia: no es posible garantizar objetivos de rendimiento en produccion sin medicion previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de adopcion minimo, lo que reduce el soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hu_hu-anna-medium-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/hu/hu_HU/anna/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
