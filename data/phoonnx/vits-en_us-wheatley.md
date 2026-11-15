# Phoonnx/vits-en_us-wheatley

## Resumen

vits-en_us-wheatley es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por davet2001 y empaquetado por Phoonnx para su libreria de inferencia ONNX phoonnx. El modelo convierte texto en ingles estadounidense a audio, tomando como entrada fonemas espeak en alfabeto IPA y produciendo formas de onda directamente, sin necesidad de vocoder separado. Su relevancia radica en que ofrece una voz TTS ligera y ejecutable en CPU mediante ONNX, integrable en asistentes de voz y sistemas embebidos a traves del ecosistema OVOS.

El repositorio tiene un tamano de 0,1 GB y se distribuye bajo licencia MIT, lo que facilita su uso comercial y su integracion en productos. La libreria phoonnx se encarga del front-end de texto mediante scriptconv, que normaliza el texto y lo convierte a fonemas espeak-ng antes de pasarlo al modelo. El modelo esta pensado para sintesis de una unica voz en ingles (en-US) y no soporta otros idiomas.

No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto ni los datos exactos de entrenamiento del modelo original. La ficha se limita a los datos verificables de la model card y del repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech, end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX) |
| Idiomas soportados | ingles estadounidense (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un decoder de forma de onda (generador HiFi-GAN). Esta diseno permite generar audio directamente a partir de fonemas sin un vocoder externo, lo que simplifica el despliegue y reduce la latencia. El modelo empaquetado por Phoonnx se distribuye en formato ONNX para su ejecucion con la libreria phoonnx.

El front-end de texto delega en scriptconv, que normaliza el texto y lo convierte a fonemas espeak-ng mediante `EspeakPhonemizer` del modulo `scriptconv.phonemizers.mul`. El modelo original procede de davet2001/wheatley1, pero no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia arquitectura VITS.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US).
- Entrada basada en fonemas espeak-ng en alfabeto IPA, con normalizacion de texto previa mediante scriptconv.
- Generacion de audio en formato WAV a traves de la API `synthesize_wav` de phoonnx.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js, con demo en vivo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada exclusivamente al ingles estadounidense.

## Casos de uso

- Asistentes de voz integrados en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y sintetiza respuestas del asistente en ingles con una voz concreta, aprovechando la integracion nativa con el ecosistema.
- Sintesis de voz en aplicaciones de escritorio en Python: mediante `TTSModelManager` y la API `synthesize_wav`, se puede generar audio WAV para lectores de pantalla, notificaciones o narracion de contenido sin depender de servicios en la nube.
- Lectura de textos en aplicaciones web: phoonnx.js permite ejecutar la voz en el navegador con entrada espeak o unicode, con demo en tigregotico.pt/demo, adecuado para accesibilidad web sin backend.
- Sistemas embebidos y dispositivos de bajo consumo: al distribuirse en ONNX y con un repositorio de 0,1 GB, el modelo puede ejecutarse en CPU sin GPU dedicada, lo que lo hace apto para Raspberry Pi u otros dispositivos similares.
- Prototipado rapido de interfaces conversacionales: la instalacion via `pip install --pre phoonnx` y la carga de la voz `piper_community/davet2001/en-US_wheatley` permiten generar audio en pocas lineas de codigo para pruebas de concepto.
- Generacion de audiolibros o contenido narrado en ingles: el modelo sintetiza frases completas en en-US, adecuado para narracion por lotes de textos largos divididos en oraciones.
- Pruebas de regresion de pipelines TTS: al ser un modelo pequeno y determinista, sirve como referencia en tests automatizados de sistemas de voz que integren phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ejecutarse en ONNX y con un repositorio de 0,1 GB, es previsible que funcione en CPU sin GPU.
- GPU recomendadas: no se especifican; el modelo esta disenado para inferencia en CPU mediante ONNX.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte CUDA ni requisitos de VRAM.
- Opciones de despliegue: libreria phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js para navegador.
- Latencia y throughput estimados: no disponibles.
- Dependencia externa: espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`), con posibles diferencias de pronunciacion si se usa espyak en lugar de espeak-ng.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de parametros de este modelo que permitan una comparacion cuantitativa fiable con alternativas. Se indica a continuacion una comparacion cualitativa basada en la informacion disponible.

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-en_us-wheatley (este modelo) | VITS | en-US | MIT | ONNX | Empaquetado para phoonnx, 0,1 GB |
| davet2001/wheatley1 | VITS | en-US | no disponible en esta ficha | no disponible | Modelo upstream del que deriva este |
| Otros modelos VITS de la coleccion Phoonnx | VITS | variable | variable | ONNX | Misma libreria de inferencia, voces distintas |

No se dispone de datos de benchmarks ni de especificaciones de parametros para establecer comparaciones cuantitativas con modelos de la misma categoria.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no hay soporte multilingue.
- La calidad de pronunciacion depende del front-end de fonemas: si se usa espyak en lugar de espeak-ng, algunas palabras pueden pronunciarse incorrectamente, segun advierte la model card.
- Requiere la instalacion de espeak-ng o del extra `phoonnx[espeak]`; sin esta dependencia el modelo no puede generar fonemas.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre tasas de alucinacion o errores en palabras poco frecuentes.
- La licencia MIT permite uso comercial, pero la model card remite a los terminos del release upstream (davet2001/wheatley1) para los detalles de licencia.
- El modelo esta pensado para sintesis de una unica voz; no ofrece control de emocion, prosodia avanzada ni clonacion de voz.
- No se documentan limites de longitud de texto por inferencia; el uso practico recomendado es por oraciones.
- El numero de descargas (27) y de likes (0) es muy bajo, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-wheatley
- Modelo upstream: https://huggingface.co/davet2001/wheatley1
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
