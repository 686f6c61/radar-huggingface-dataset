# Phoonnx/vits-en_us-andrew_huberman-espeak

## Resumen

vits-en_us-andrew_huberman-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original fue entrenado por el usuario samarthshrivas mediante un fine-tuning de Piper sobre un checkpoint de Lightning, y este repositorio lo redistribuye en formato ONNX listo para su uso con la libreria phoonnx y con el plugin de OVOS.

El modelo genera voz en ingles estadounidense (en-US) a partir de fonemas espeak en alfabeto IPA. Su proposito es ofrecer una voz sintetica concreta (etiquetada como "Andrew Huberman") dentro del ecosistema phoonnx, que permite ejecutar modelos VITS en Python y en el asistente OVOS. Es un modelo de nicho, con solo 21 descargas, orientado a entornos de asistente de voz open source mas que a produccion a gran escala.

El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia MIT. No se dispone de informacion publica sobre el numero de parametros, el volumen de datos de entrenamiento ni resultados de benchmarks, por lo que esta ficha se limita a los datos verificables de la model card y del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Libreria | phoonnx |
| Tamano del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial en un unico modelo entrenado de forma conjunta. Genera audio directamente a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia.

Este checkpoint concreto proviene de un fine-tuning de Piper realizado por samarthshrivas sobre un checkpoint de Lightning (version_2), segun indica la model card. No se especifica el numero de tokens, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS). El front-end de texto utiliza espeak-ng para la fonemizacion a IPA; la libreria phoonnx delega la normalizacion y conversion en scriptconv mediante `EspeakPhonemizer`.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto plano.
- Conversion de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecucion en navegador mediante phoonnx.js (voces VITS con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo de sintesis de voz.

## Casos de uso

- Asistente de voz OVOS: el modelo se selecciona como modulo TTS en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, proporcionando una voz en ingles estadounidense para respuestas habladas del asistente.
- Lectura de texto en aplicaciones Python: usando `TTSModelManager` y `voice.synthesize_wav`, se puede convertir cualquier frase en ingles en un fichero WAV para narracion o accesibilidad.
- Prototipado de interfaces de voz: al ser un modelo ONNX ligero (~0,1 GB), permite iterar rapidamente en demos de TTS sin infraestructura GPU dedicada.
- Generacion de audio en el navegador: mediante phoonnx.js se puede sintetizar voz en cliente para aplicaciones web o demos interactivas.
- Pruebas de integracion de pipelines TTS: sirve como voz de referencia para validar el front-end de fonemizacion espeak y la conversion IPA en scriptconv.
- Experimentacion con voces Piper fine-tuneadas: al derivar de un checkpoint de Piper, es util para comparar el comportamiento de distintas voces comunitarias dentro de la coleccion VITS de Phoonnx.
- Sistemas embebidos o de bajo consumo: el formato ONNX y el reducido tamano del repositorio facilitan su despliegue en entornos con recursos limitados, siempre que se instale espeak-ng.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB) se trata de un modelo muy ligero que probablemente cabe en CPU y en GPUs de gama baja.
- GPU recomendadas: no disponible. No se han publicado requisitos especificos.
- Cabe en GPU consumer: previsiblemente si, dado el reducido tamano del checkpoint ONNX, aunque no hay datos oficiales confirmados.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js en navegador. Requiere espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| vits-en_us-andrew_huberman-espeak | VITS | en-US | ONNX | MIT | Fonemas espeak IPA |
| Otras voces de la coleccion VITS de Phoonnx | VITS | variable | ONNX | variable (segun cada modelo) | Fonemas espeak IPA |
| Piper (voces oficiales) | VITS | multiples | ONNX | variable | Fonemas espeak IPA |

No se dispone de datos de rendimiento (MOS, latencia, WER) para establecer una comparacion cuantitativa con alternativas. La comparacion se limita a parametros estructurales y de disponibilidad.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- La calidad de sintesis depende de la fonemizacion: con el port espyak algunos fonemas difieren de espeak-ng y la voz puede pronunciar mal ciertas palabras, segun advierte la propia model card.
- Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]`; sin ello el modelo no funciona correctamente.
- Es un fine-tuning comunitario derivado de un checkpoint de Piper, sin benchmarks publicados que validen su calidad frente a otras voces.
- El nombre del modelo hace referencia a una persona real (Andrew Huberman); conviene revisar implicaciones de uso de la voz y de la imagen asociada antes de un despliegue comercial, aunque la licencia del repositorio sea MIT.
- No se especifican sesgos, tasas de alucinacion ni limitaciones de contexto por tratarse de un modelo TTS y no de un modelo de lenguaje.
- La licencia MIT del empaquetado no necesariamente cubre los terminos del checkpoint upstream; la model card remite a las condiciones del release original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-andrew_huberman-espeak
- Checkpoint upstream: https://huggingface.co/samarthshrivas/piper-finetune-Andrew-Huberman/tree/main/lightning_logs/version_2/checkpoints
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
