# Phoonnx/vits-ca-custom-espeak

## Resumen

vits-ca-custom-espeak es un modelo de sintesis de voz (text-to-speech) en catalan basado en la arquitectura VITS de Coqui. Lo publica Phoonnx, el proyecto de TigreGotico que empaqueta voces VITS en formato ONNX para su propia libreria de inferencia. El modelo original procede del catalogo de Coqui TTS (version 0.10.1) y esta etiquetado como voz "custom" para catalan, con licencia CC-BY-4.0.

El modelo resuelve la generacion de audio hablado a partir de texto en catalan. Su entrada no es texto plano, sino fonemas en alfabeto IPA obtenidos mediante espeak-ng, lo que implica que el pipeline de sintesis incluye un front-end de fonemizacion obligatorio. Esta pensado para integrarse en asistentes de voz y sistemas de lectura, en particular dentro del ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.

Es relevante para desarrolladores que necesitan una voz catalana ligera, ejecutable en ONNX y con licencia permisiva para uso comercial con atribucion. El repositorio ocupa aproximadamente 0,1 GB, lo que lo situa en el rango de modelos pequenos y desplegables en CPU. No se dispone de datos publicos sobre numero de parametros, contexto ni benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | catalan (ca) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | aproximadamente 0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis neuronal end-to-end que combina un codificador de texto, un predictor de duracion, un flujo normalizador variacional y un decodificador generativo adversarial (GAN) con discriminadores multiperiodo, lo que permite generar waveforms directamente sin vocoder externo separado. El modelo aqui publicado es una conversion a ONNX del checkpoint original de Coqui TTS, empaquetada para la libreria phoonnx.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante de referencia ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables habitualmente en TTS). El modelo original esta etiquetado como "custom" en el catalogo de Coqui, lo que sugiere un conjunto de datos propio no documentado publicamente. La innovacion practica de este paquete es el empaquetado ONNX y la integracion con el front-end de fonemizacion de scriptconv, no cambios en la arquitectura.

## Capacidades

- Sintesis de voz en catalan a partir de texto, con salida en fichero WAV mediante `synthesize_wav`.
- Fonemizacion mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`), con entrada en alfabeto IPA.
- Ejecucion en Python a traves de phoonnx y en navegador mediante phoonnx.js.
- Integracion con OVOS/Mycroft como plugin TTS (`ovos-tts-plugin-phoonnx`).
- Normalizacion y conversion de texto delegadas a la libreria scriptconv.
- No soporta tool calling, agentes, vision, audio de entrada ni modos de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en catalan sobre OVOS/Mycroft: configurando el modulo `ovos-tts-plugin-phoonnx` con la voz `coqui/ca-custom-vits` en `mycroft.conf`, el asistente responde en catalan sin servicio en la nube.
- Lectura de articulos o documentos en catalan: el modelo convierte texto normalizado por scriptconv en audio, adecuado para herramientas de accesibilidad y lectura por voz.
- Sintesis en navegador: mediante phoonnx.js, se puede generar voz catalana en el cliente sin enviar texto a un servidor, util para aplicaciones web con requisitos de privacidad.
- Generacion de avisos y locuciones pregrabadas: produccion por lotes de ficheros WAV para paneles, transporte publico o sistemas de megafonia en catalan.
- Prototipado de interfaces conversacionales: al ser un modelo ligero (aproximadamente 0,1 GB) y ejecutable en CPU, permite iterar rapidamente en entornos de desarrollo sin GPU.
- Integracion en pipelines de CI/CD de productos de voz: la licencia CC-BY-4.0 permite su inclusion en productos comerciales con la debida atribucion, y el formato ONNX facilita el despliegue en entornos heterogeneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (aproximadamente 0,1 GB) es plausible su ejecucion en CPU, aunque no se confirma en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; el formato ONNX y el tamano reducido sugieren viabilidad en hardware modesto, sin datos oficiales.
- Opciones de despliegue: phoonnx (Python) con ONNX Runtime, phoonnx.js en navegador y plugin `ovos-tts-plugin-phoonnx` para OVOS. Es necesario instalar espeak-ng en el sistema o el extra `phoonnx[espeak]`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables (parametros, contexto) de este modelo ni de alternativas en la informacion proporcionada. Como referencia cualitativa, dentro de la propia coleccion VITS de Phoonnx existen otras voces empaquetadas con la misma arquitectura y licencia, pero no se aportan datos que permitan una comparacion cuantitativa.

| Modelo | Arquitectura | Idioma | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| vits-ca-custom-espeak | VITS (Coqui) | ca | CC-BY-4.0 | ONNX | no disponible |
| Otras voces de la coleccion VITS de Phoonnx | VITS (Coqui) | varios | segun modelo | ONNX | no disponible |

## Limitaciones y advertencias

- La entrada debe ser fonemas IPA generados por espeak-ng; el modelo no acepta texto plano directamente sin el front-end de scriptconv.
- Si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte el autor.
- Solo soporta catalan; no hay capacidades multilingues.
- No se documentan sesgos del hablante ni caracteristicas del dataset de entrenamiento, lo que dificulta evaluar la representatividad de la voz.
- Riesgo de alucinacion no aplicable en el sentido de generacion de texto, pero si puede producir pronunciaciones incorrectas o prosodia irregular en palabras fuera del dominio de entrenamiento.
- Licencia CC-BY-4.0: el uso comercial esta permitido siempre que se atribuya la autoria; es necesario conservar la atribucion a Coqui y a Phoonnx.
- La model card indica que la licencia upstream figura en la lista de modelos de Coqui TTS; conviene verificar los terminos exactos antes de un despliegue en produccion.
- No hay datos publicos de latencia, throughput ni calidad subjetiva (MOS) que permitan garantizar un rendimiento concreto en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ca-custom-espeak
- Checkpoint original de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.10.1_models/tts_models--ca--custom--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
