# DictionLabs/sensevoice-small-coreml

## Resumen

SenseVoiceSmall — Core ML (Diction mirror) es una distribucion empaquetada del modelo de reconocimiento automatico del habla SenseVoiceSmall, desarrollado originalmente por Alibaba Group (Tongyi Lab, dentro del proyecto FunAudioLLM) y convertido a formato Core ML por FluidInference. DictionLabs mantiene este repositorio como espejo byte a byte de los artefactos que descarga la aplicacion iOS Diction para su dictado en chino y cantonés ejecutado en el dispositivo. No se trata de un modelo nuevo ni reentrenado: es una conversion de formato con cuantizacion post-entrenamiento a int8.

El modelo base SenseVoiceSmall es un sistema ASR no autorregresivo (no basado en decoder autoregresivo clasico) disenado para inferencia de baja latencia, con capacidades adicionales de deteccion de eventos acusticos y reconocimiento de emociones segun la documentacion del proyecto original. Esta version Core ML esta optimizada para Apple Silicon, con ejecucion sobre la Neural Engine (ANE) y pesos cuantizados a int8, lo que permite dictado local sin conexion en dispositivos iOS.

Su relevancia actual radica en que ejemplifica el patron de despliegue on-device de modelos ASR en el ecosistema Apple: conversion a Core ML, cuantizacion int8, integracion via la libreria FluidAudio y distribucion mediante un espejo controlado por el desarrollador de la aplicacion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseVoiceSmall (ASR no autorregresivo, base FunAudioLLM/SenseVoiceSmall); empaquetado Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantizacion post-entrenamiento de pesos); artefacto `SenseVoiceSmall_int8.mlmodelc` |
| Idiomas soportados | zh (chino mandarin), yue (cantonés) |
| Licencia | funasr-model-license-1.1 (FunASR Model Open Source License Agreement v1.1, Alibaba Group) |
| Formato de pesos | Core ML (`.mlmodelc`): `SenseVoicePreprocessor.mlmodelc`, `SenseVoiceSmall_int8.mlmodelc`, mas `vocab.json` y `config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es SenseVoiceSmall, de Alibaba Group (Tongyi Lab, FunAudioLLM), parte del ecosistema SenseVoice / FunASR. La model card de este repositorio no detalla la arquitectura interna del modelo base (tipo de encoder, numero de capas, dimensiones ocultas ni volumen de datos de entrenamiento); esa informacion corresponde al repositorio original FunAudioLLM/SenseVoiceSmall y no se incluye en la informacion proporcionada. La documentacion del espejo indica que la conversion a Core ML es "format only, no retraining" (solo formato, sin reentrenamiento), con cuantizacion int8 de pesos post-entrenamiento realizada por FluidInference.

El pipeline de inferencia se compone de dos artefactos Core ML: un preprocesador (`SenseVoicePreprocessor.mlmodelc`) que transforma la senal de audio en las features de entrada, y el modelo principal cuantizado (`SenseVoiceSmall_int8.mlmodelc`) que produce la transcripcion. La carga se realiza mediante las clases `SenseVoiceModels` / `SenseVoiceManager` de la libreria FluidAudio, con precision `int8`. No se dispone de informacion sobre el dataset de entrenamiento, el uso de RLHF/DPO ni innovaciones tecnicas especificas del modelo base en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (ASR) para chino mandarin (zh) y cantonés (yue).
- Transcripcion on-device en dispositivos Apple, sin necesidad de conexion a red.
- Ejecucion acelerada por la Neural Engine (ANE) de Apple Silicon mediante Core ML.
- Inferencia con pesos int8, orientada a baja latencia y bajo consumo en movil.
- Segun la documentacion del proyecto SenseVoice original referenciada en busquedas, el modelo base incluye deteccion de eventos acusticos y reconocimiento de emociones; la model card de este espejo no detalla si esas capacidades se conservan en la conversion Core ML.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje, sino un modelo ASR).
- No se documenta soporte de vision ni audio generativo.

## Casos de uso

- Dictado por voz en aplicaciones iOS: es el uso real de este repositorio, que sirve los artefactos que la app Diction descarga para transcribir dictado en chino y cantonés directamente en el dispositivo, sin enviar audio a servidores.
- Transcripcion de reuniones y notas de voz en movil: al ejecutarse sobre ANE con pesos int8, permite transcribir grabaciones localmente y preservar la privacidad del audio.
- Aplicaciones de accesibilidad: conversion de voz a texto en tiempo real para usuarios con dificultades de escritura, en entornos sin conectividad.
- Subtitulado local de contenido en mandarin y cantonés: integracion en reproductores o editores de video en macOS/iOS que necesiten generar subtitulos sin depender de servicios en la nube.
- Asistentes de voz embebidos: uso como modulo ASR dentro de una app mayor (por ejemplo, un asistente de productividad) que combine la transcripcion con un LLM local o remoto.
- Distribucion controlada de modelos en apps: el patron de espejo en un namespace propio (DictionLabs) permite fijar una revision concreta y garantizar que la app descargue siempre los mismos bytes, util para reproducibilidad y auditoria.
- Prototipado de ASR on-device en Apple Silicon: desarrolladores que quieran evaluar SenseVoiceSmall en Core ML pueden cargar estos artefactos con FluidAudio como punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo esta pensado para ejecucion on-device en Apple Silicon (ANE/GPU/CPU), no para GPU dedicada.
- GPU recomendadas: no aplica en el sentido tradicional; el destino es Apple Silicon (iPhone, iPad, Mac con chip M-series). No se documentan requisitos para A100, H100 ni RTX 4090.
- Cabe en consumer hardware: si, en dispositivos Apple compatibles con Core ML; el repositorio ocupa 0,2 GB, lo que sugiere un modelo pequeno adecuado para movil.
- Opciones de despliegue: Core ML con la libreria FluidAudio (`SenseVoiceModels` / `SenseVoiceManager`, precision `int8`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo ASR Core ML).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DictionLabs/sensevoice-small-coreml | ASR SenseVoiceSmall, Core ML int8 | zh, yue | Core ML (`.mlmodelc`) | funasr-model-license-1.1 | Hugging Face (espejo) |
| FluidInference/sensevoice-small-coreml | ASR SenseVoiceSmall, Core ML (origen de la conversion) | no disponible en la info | Core ML | funasr-model-license-1.1 | Hugging Face |
| hugging-mac/sensevoice-small-coreml | ASR SenseVoiceSmall, Core ML (5 idiomas segun tag) | 5 idiomas (segun tag) | Core ML | funasr-model-license-1.1 | Hugging Face |
| FunAudioLLM/SenseVoiceSmall | ASR SenseVoiceSmall original (PyTorch/FunASR) | no disponible en la info | no disponible en la info | funasr-model-license-1.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre chino mandarin (zh) y cantonés (yue); no se documenta soporte de castellano ni de otros idiomas.
- Es un espejo byte a byte de FluidInference/sensevoice-small-coreml (revision `74bdbe74b2258f25b5400db72f6cbfbef7c74ded`); no aporta mejoras ni cambios respecto al original.
- La licencia funasr-model-license-1.1 impone obligaciones de atribucion: debe conservarse el nombre del modelo y la atribucion a Alibaba Group y a FluidInference al redistribuir. Es una licencia "other", no una licencia permisiva estandar (Apache/MIT); conviene revisar el texto completo antes de uso comercial.
- Al ser una conversion Core ML sin reentrenamiento, hereda cualquier sesgo o limitacion del modelo base SenseVoiceSmall; la model card no documenta sesgos especificos.
- Riesgo de alucinacion: no se documenta para este modelo; en ASR el riesgo equivalente son errores de transcripcion, especialmente en audio con ruido, acentos no estandar o code-switching entre mandarin y cantonés.
- Dependencia del ecosistema Apple: no es ejecutable fuera de Core ML / FluidAudio sin reconvertir el modelo.
- No se documentan requisitos minimos de version de iOS/macOS ni de chip para ejecutar la Neural Engine.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DictionLabs/sensevoice-small-coreml
- Modelo base original: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Conversion Core ML de origen: https://huggingface.co/FluidInference/sensevoice-small-coreml
- Otro espejo Core ML: https://huggingface.co/hugging-mac/sensevoice-small-coreml
- Proyecto SenseVoice: https://github.com/FunAudioLLM/SenseVoice
- Proyecto FunASR: https://github.com/modelscope/FunASR
- Licencia FunASR Model Open Source License Agreement v1.1: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Aplicacion Diction: https://diction.one
