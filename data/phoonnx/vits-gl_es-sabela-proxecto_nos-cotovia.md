# Phoonnx/vits-gl_es-sabela-proxecto_nos-cotovia

## Resumen

vits-gl_es-sabela-proxecto_nos-cotovia es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en gallego (gl-ES) a audio, tomando como entrada texto codificado en el alfabeto y los fonemas Cotovia, un sistema de fonemizacion especifico para el gallego.

El modelo se distribuye en formato ONNX dentro del repositorio de Phoonnx, lo que permite su ejecucion en CPU y GPU mediante la libreria phoonnx, con integracion directa en el ecosistema OpenVoiceOS (OVOS) a traves del plugin `ovos-tts-plugin-phoonnx`. Su relevancia radica en que cubre una lengua minoritaria como el gallego con un pipeline completo de normalizacion de texto y fonemizacion especifico, algo poco habitual en los sistemas TTS comerciales.

El repositorio ocupa aproximadamente 0,1 GB y no registra descargas ni likes en el momento de la consulta. La licencia es MIT, lo que facilita su uso comercial y su integracion en productos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | gallego (gl-ES) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Cotovia, alfabeto Cotovia |
| Upstream | OpenVoiceOS/proxectonos-sabela-vits-phonemes-onnx |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de dominio temporal y espectral. El modelo genera waveform directamente a partir de la secuencia de fonemas, sin necesidad de un vocoder externo, lo que simplifica el despliegue.

El modelo deriva del release de Proxecto Nós alojado en `OpenVoiceOS/proxectonos-sabela-vits-phonemes-onnx`. La entrada no es texto plano directo, sino fonemas Cotovia: el front-end de texto se delega a la libreria `scriptconv` mediante el componente `CotoviaPhonemizer` del modulo `scriptconv_copyleft.phonemizers.gl`, instalado con el extra `scriptconv[gl]`. No se dispone de informacion sobre el numero de horas de audio, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o fine-tuning especificas.

## Capacidades

- Sintesis de voz en gallego (gl-ES) a partir de texto, generando audio WAV mediante `voice.synthesize_wav`.
- Normalizacion y conversion de texto a fonemas Cotovia a traves del front-end `scriptconv`.
- Integracion nativa con OpenVoiceOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecucion sobre ONNX Runtime, lo que permite inferencia en CPU sin dependencias de CUDA.
- Una unica voz empaquetada: `proxectonos/sabela-cotovia`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en gallego: integracion en OVOS como modulo TTS para responder a comandos de voz en gl-ES, usando la configuracion `{"tts": {"module": "ovos-tts-plugin-phoonnx"}}`.
- Lectura de contenido web o documentos: conversion de articulos, noticias o textos administrativos en gallego a audio para accesibilidad o consumo pasivo.
- Sistemas de anuncios publicos o senalizacion: generacion de locuciones pregrabadas en gallego para transporte, aeropuertos o edificios publicos, con licencia MIT que permite uso comercial.
- Aplicaciones de aprendizaje de idiomas: sintesis de pronunciacion gallega para herramientas de ensenanza, aprovechando la fonemizacion Cotovia como referencia de pronunciacion estandar.
- Integracion en pipelines de CI/CD de audio: generacion automatizada de ficheros WAV en pruebas de regresion de sistemas de voz, al ser un modelo ONNX ligero (0,1 GB) que se ejecuta en CPU.
- Prototipado de interfaces conversacionales en gallego: su empaquetado en phoonnx permite cargar la voz con pocas lineas de Python y validar rapidamente un producto antes de invertir en un TTS comercial.
- Localizacion de contenido multimedia: doblaje o voice-over de videos y presentaciones al gallego en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es previsible que quepa en memoria de CPU, aunque no se confirma en la documentacion.
- GPU recomendadas: no disponible. El modelo esta empaquetado para ONNX Runtime y puede ejecutarse sin GPU.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX y el tamano reducido sugieren viabilidad en hardware modesto, pero no hay datos oficiales.
- Opciones de despliegue: libreria `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OpenVoiceOS, y ONNX Runtime como backend subyacente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| vits-gl_es-sabela-proxecto_nos-cotovia | VITS | gallego (gl-ES) | MIT | ONNX | fonemas Cotovia |
| OpenVoiceOS/proxectonos-sabela-vits-phonemes-onnx | VITS | gallego | no disponible en esta ficha | no disponible | fonemas |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | variable | ONNX | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta gallego (gl-ES); el texto en otras lenguas producira una sintesis incorrecta o ininteligible.
- Requiere un front-end especifico: la entrada debe pasar por el fonemizador Cotovia de `scriptconv`; introducir texto sin normalizar directamente en el modelo no es el flujo previsto.
- Una unica voz disponible (`proxectonos/sabela-cotovia`), sin variedad de hablantes ni control de estilo.
- No hay informacion publicada sobre sesgos de generacion, calidad perceptual (MOS) ni robustez ante texto ruidoso o con abreviaturas.
- Riesgo de alucinacion acustica: como todo TTS neuronal, puede producir artefactos, prosodia incorrecta o pronunciaciones erroneas en palabras fuera del vocabulario de entrenamiento.
- No se detalla la procedencia ni los derechos del corpus de audio original; aunque el empaquetado declara MIT, conviene verificar los terminos del release upstream antes de un uso comercial a gran escala.
- Repositorio sin descargas ni validacion comunitaria en el momento de la consulta: menor garantia de mantenimiento o soporte.
- No apto para tareas de comprension, razonamiento o generacion de texto: es exclusivamente un modelo de sintesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-gl_es-sabela-proxecto_nos-cotovia
- Upstream (OpenVoiceOS): https://huggingface.co/OpenVoiceOS/proxectonos-sabela-vits-phonemes-onnx
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
