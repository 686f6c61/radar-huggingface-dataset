# Phoonnx/vits-fa_ir-reza_and_ibrahim-espeak

## Resumen

vits-fa_ir-reza_and_ibrahim-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original fue entrenado por el usuario mah92 bajo el identificador `mah92/Reza-And-Ibrahim-FA_EN-Piper-TTS-Model`; Phoonnx se limita a convertirlo al formato ONNX y a integrarlo en su ecosistema de inferencia (Python, OVOS y navegador mediante phoonnx.js).

El modelo esta especializado en persa de Iran (`fa-IR`) y toma como entrada fonemas generados por espeak-ng en alfabeto IPA, no texto plano. Esta orientacion fonetica lo hace dependiente de la calidad del fonemizador: la model card advierte que el port espyak de espeak-ng produce fonemas distintos y puede provocar errores de pronunciacion en algunas palabras.

Es relevante para desarrolladores que necesiten una voz persa ligera y de licencia permisiva (CC0-1.0) desplegable en entornos con recursos limitados, ya que el repositorio ocupa aproximadamente 0,1 GB y el formato ONNX permite ejecucion en CPU. Su adopcion es todavia muy baja (20 descargas y 0 likes en el momento de la consulta), por lo que debe considerarse un modelo de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | persa de Iran (`fa-IR`) |
| Licencia | CC0-1.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador), plugin OVOS |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial multiperiodo entrenado con perdidas GAN, ademas de una alineacion monotona latente para el ajuste temporal. El resultado es un modelo que genera waveform directamente a partir de fonemas sin necesidad de un vocoder separado. El modelo empaquetado conserva la arquitectura original de mah92 y se distribuye como grafo ONNX para inferencia.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el numero de pasos ni si se aplicaron tecnicas de fine-tuning como RLHF o DPO; estos datos no aparecen en la model card proporcionada. La unica innovacion destacable documentada es el propio empaquetado: conversion a ONNX para ejecucion portable, integracion con el fonemizador espeak de scriptconv y soporte de despliegue en navegador mediante phoonnx.js.

## Capacidades

- Sintesis de voz en persa de Iran a partir de texto fonemizado en IPA.
- Generacion de audio WAV mediante `voice.synthesize_wav()` en la API de phoonnx.
- Fonemizacion de entrada mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Integracion con el asistente de voz OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador con phoonnx.js, con entrada espeak o unicode.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada al persa; el nombre del modelo upstream menciona `FA_EN`, pero la model card solo declara `fa-IR`.

## Casos de uso

- Asistentes de voz en persa: integracion en OVOS seleccionando la voz `piper_community/mah92/fa-IR_Reza-And-Ibrahim` en `mycroft.conf`, lo que permite dotar de habla a un asistente domestico sin depender de servicios en la nube.
- Lectura de contenido en aplicaciones web: mediante phoonnx.js y la demo de tigregotico.pt se puede sintetizar texto persa directamente en el navegador sin backend, util para articulos, notificaciones o accesibilidad.
- Generacion de audiolibros o podcasts en persa: el modelo permite convertir lotes de texto en WAV de forma local, con un coste de infraestructura reducido dado el tamano del repositorio (~0,1 GB).
- Prototipado rapido de interfaces de voz: al instalarse con `pip install --pre phoonnx` y ejecutarse en CPU via ONNX, sirve para validar flujos de TTS persa antes de invertir en modelos mayores.
- Sistemas de accesibilidad offline: despliegue en dispositivos sin conexion para leer en voz alta contenido en persa, aprovechando que no requiere GPU ni servicios externos.
- Investigacion en TTS de bajos recursos: como punto de partida o baseline para comparar tecnicas de sintesis en persa con licencia CC0, que permite reutilizacion y modificacion sin restricciones.
- Pruebas de fonemizacion: comparar la salida de espeak-ng frente a espyak para evaluar el impacto de los fonemas en la calidad de la voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de un modelo ONNX de ~0,1 GB, es previsible que quepa en memoria de CPU sin GPU, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible. No se especifican requisitos de GPU en la model card.
- Compatibilidad con GPU de consumo: no confirmada; el diseno ONNX y el tamano reducido sugieren que puede ejecutarse en CPU, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-fa_ir-reza_and_ibrahim-espeak | VITS | fa-IR | CC0-1.0 | ONNX | ~0,1 GB | Objeto de esta ficha |
| mah92/Reza-And-Ibrahim-FA_EN-Piper-TTS-Model | VITS | fa / en | CC0-1.0 | Piper | no disponible | Modelo upstream del que deriva este |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | variable | ONNX | variable | Mismo empaquetado, distintos idiomas y autores |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia critica de espeak-ng: sin el binario instalado, el modelo usa el port espyak, cuyos fonemas difieren y pueden producir pronunciaciones incorrectas.
- La entrada debe ser texto fonemizado en IPA; no acepta texto plano directamente sin el front-end de scriptconv.
- Solo se declara soporte de persa de Iran; el posible soporte de ingles sugerido por el nombre upstream no esta documentado en la model card.
- No hay datos publicados sobre sesgos, tasa de alucinacion fonetica ni calidad subjetiva (MOS) de la voz.
- Adopcion muy baja (20 descargas, 0 likes), lo que implica escasa validacion comunitaria y mayor riesgo de fallos no documentados.
- Licencia CC0-1.0: permite uso comercial y modificacion sin restricciones, pero conviene verificar que el modelo upstream mantiene la misma licencia, ya que la model card la cita de forma indirecta.
- Modelo de nicho sin benchmarks: no es adecuado como referencia de calidad sin una evaluacion propia previa en produccion.
- No soporta funcionalidades de agente, tool calling ni procesamiento multimodal.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-fa_ir-reza_and_ibrahim-espeak
- Modelo upstream: https://huggingface.co/mah92/Reza-And-Ibrahim-FA_EN-Piper-TTS-Model
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
