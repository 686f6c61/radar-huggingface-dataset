# Phoonnx/vits-nl-nathalie-low-gruut

## Resumen

vits-nl-nathalie-low-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su motor Mimic 3 y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo sintetiza habla en neerlandes (`nl`) a partir de texto, convirtiendo previamente la entrada en fonemas mediante el fonemizador gruut (alfabeto IPA).

Se trata de una voz concreta, identificada como `mimic3/nl/nathalie_low`, dentro del catalogo de voces que Phoonnx distribuye. El sufijo "low" hace referencia a una variante de baja calidad o tamano reducido dentro de la nomenclatura de voces de Mimic 3, orientada a entornos con recursos limitados. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que es un modelo compacto.

Su relevancia actual es practica: permite anadir sintesis de voz en neerlandes a asistentes y aplicaciones mediante ONNX Runtime, sin depender de infraestructura pesada, y con integracion directa en el ecosistema OVOS (Open Voice OS) a traves del plugin `ovos-tts-plugin-phoonnx`. La licencia CC-BY-SA-4.0 permite uso comercial con atribucion y compartir igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS por frases) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | neerlandes (`nl`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut (alfabeto IPA) |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura generativa end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un generador HiFi-GAN, entrenados de forma conjunta con perdidas adversarias y de reconstruccion. Este diseno permite generar formas de onda directamente desde fonemas sin un vocoder separado.

El modelo original fue entrenado por Mycroft AI para Mimic 3; no se dispone en la informacion proporcionada de detalles sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. La unica innovacion documentada por el empaquetador es la conversion a ONNX para inferencia portable y su integracion con el front-end de texto `scriptconv`, que normaliza el texto y lo convierte a fonemas gruut antes de la sintesis.

## Capacidades

- Sintesis de voz en neerlandes a partir de texto escrito.
- Conversion texto-a-fonemas mediante gruut (alfabeto IPA) como paso previo a la sintesis.
- Generacion directa de formas de onda (audio WAV) sin vocoder externo.
- Integracion con la libreria phoonnx en Python (`TTSModelManager`, `synthesize_wav`).
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion sobre ONNX Runtime, lo que facilita el despliegue en CPU y entornos ligeros.
- No soporta tool calling, agentes, vision, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en neerlandes: el modelo puede generar respuestas habladas en tiempo real dentro de un asistente domestico basado en OVOS, configurandose como modulo TTS en `mycroft.conf`.
- Lectura de notificaciones y avisos: aplicaciones de escritorio o moviles pueden sintetizar mensajes cortos en neerlandes con un modelo de ~0,1 GB que se ejecuta en CPU.
- Accesibilidad para personas con discapacidad visual: conversion de texto de pantalla o documentos a audio en neerlandes mediante la API de phoonnx.
- Sistemas de informacion publica: anuncios automatizados en estaciones, aeropuertos o comercios para publico neerlandofono, con generacion local sin dependencia de la nube.
- Prototipado rapido de interfaces conversacionales: desarrolladores que necesiten una voz neerlandesa funcional pueden integrarla en pocas lineas de Python con `voice.synthesize_wav`.
- Dispositivos embebidos y edge computing: al ser un modelo ONNX compacto, encaja en Raspberry Pi y dispositivos similares donde no cabe un modelo TTS de gran tamano.
- Pruebas de pipelines de audio: generacion de corpus de audio sintetico en neerlandes para validar sistemas de reconocimiento de voz o de diarizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (~0,1 GB), la huella de memoria es muy reducida y cabe holgadamente en CPU.
- GPU recomendadas: no se especifican; al ejecutarse sobre ONNX Runtime puede usar CPU o cualquier GPU compatible con ONNX Runtime (CUDA, DirectML).
- Cabe en GPU de consumo: si, en cualquier GPU moderna e incluso en CPU; no requiere una GPU dedicada.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, ONNX Runtime directamente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| vits-nl-nathalie-low-gruut (este) | VITS | nl | CC-BY-SA-4.0 | ONNX | ~0,1 GB |
| Otras voces Mimic 3 de Mycroft AI | VITS | varios | CC-BY-SA-4.0 | ONNX | no disponible |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | variable | ONNX | no disponible |

No se dispone de datos de rendimiento ni de parametros de modelos alternativos concretos en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo mono-idioma: solo sintetiza neerlandes; el texto en otros idiomas producira una pronunciacion incorrecta o fallos.
- Voz unica: no permite seleccion de hablante ni control de estilo emocional.
- Variante "low": la calidad de audio es presumiblemente inferior a la de voces de mayor fidelidad del mismo catalogo; no se dispone de metricas MOS.
- Dependencia del front-end gruut: el texto debe pasar por `scriptconv[gruut]`; un fallo en la fonemizacion degrada la sintesis.
- Riesgo de artefactos en frases largas o con puntuacion atipica; se recomienda sintetizar por frases.
- Licencia CC-BY-SA-4.0: el uso comercial exige atribucion y que las obras derivadas se compartan bajo la misma licencia; revisar implicaciones antes de integrarlo en productos propietarios.
- No se documentan sesgos especificos, pero al derivar de un corpus de voz concreto puede reproducir sesgos de prosodia o de registro del hablante original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl-nathalie-low-gruut
- Repositorio upstream (Mycroft AI, voz nathalie_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/nl/nathalie_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
