# aoiandroid/nemotron-3.5-asr-streaming-0.6b-coreml-ios

## Resumen

Este repositorio contiene una compilación del modelo Nemotron 3.5 ASR Streaming 0.6B de NVIDIA en formato Core ML, específicamente preparada para su ejecución en dispositivos iOS dentro de la aplicación TranslateBlue. El modelo original es un sistema de reconocimiento automático del habla (ASR) de 600 millones de parámetros, diseñado para transcripción multilingüe en streaming de baja latencia y en modo batch, con generación nativa de puntuación y capitalización sin necesidad de postprocesado adicional.

La relevancia de esta conversión radica en que permite ejecutar un modelo ASR de calidad en dispositivos Apple de forma local, sin conexión a internet, aprovechando el Neural Engine mediante Core ML. El autor (aoiandroid) ha compilado los paquetes `.mlpackage` a `.mlmodelc`, dejando la especialización del Neural Engine como dependiente del dispositivo. La licencia MIT facilita su integración en proyectos comerciales y personales. El tamaño del repositorio es de 1,3 GB, lo que da una idea del peso del modelo compilado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo original de NVIDIA es un transformer, pero no se especifica en la informacion proporcionada) |
| Parametros totales | 600 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existe una variante INT8 en otro repositorio, pero este no lo indica) |
| Idiomas soportados | Multilingue (no se detallan los idiomas concretos) |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo original, Nemotron 3.5 ASR Streaming 0.6B, es un sistema de reconocimiento de voz desarrollado por NVIDIA. Segun la informacion disponible en el repositorio de GitHub, esta disenado para transcribir audio a texto con soporte nativo de puntuacion y capitalizacion, y ofrece flexibilidad de ejecucion tanto en streaming de baja latencia como en batch de alto rendimiento. No se proporcionan detalles sobre la arquitectura interna (tipo de red neuronal, capas, atencion, etc.) ni sobre el proceso de entrenamiento (dataset, numero de tokens, tecnicas de alineacion o RLHF). La conversion a Core ML ha sido realizada por aoiandroid, quien ha compilado el modelo en formato `.mlmodelc` para su uso en iOS, sin incluir informacion adicional sobre el proceso de conversion o las optimizaciones aplicadas.

## Capacidades

- Transcripcion de voz a texto en tiempo real (streaming) y en modo batch.
- Soporte multilingue, aunque no se especifica la lista de idiomas.
- Generacion nativa de puntuacion y capitalizacion, eliminando la necesidad de postprocesado.
- Ejecucion local en dispositivos iOS mediante Core ML, sin conexion a internet.
- Integracion especifica con la aplicacion TranslateBlue, aunque el formato Core ML permite su uso en cualquier app iOS.

## Casos de uso

- Dictado por voz en aplicaciones iOS: el modelo puede transcribir voz en tiempo real, lo que permite implementar funciones de dictado en editores de texto, correos o mensajeria.
- Subtitulos en directo para videollamadas o streaming: gracias a su capacidad de streaming, puede generar subtitulos mientras se habla, util en aplicaciones de videoconferencia o retransmision.
- Asistentes de voz locales: al ejecutarse en el dispositivo, permite construir asistentes de voz que respetan la privacidad del usuario al no enviar audio a servidores externos.
- Traduccion asistida: integrado en TranslateBlue, puede transcribir audio en un idioma para posteriormente traducirlo, facilitando la comunicacion multilingue.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo real de conversaciones o eventos, mostrando el texto en pantalla.
- Grabacion de notas con transcripcion automatica: aplicaciones de notas que convierten audio en texto de forma local, sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos como WER (Word Error Rate), comparativas con otros modelos ASR ni metricas de latencia o throughput.

## Requisitos de hardware

- Dispositivos iOS compatibles con Core ML y Neural Engine (iPhone, iPad, Apple Silicon Macs).
- Tamaño del modelo compilado: 1,3 GB, por lo que se recomienda un dispositivo con al menos 2 GB de almacenamiento libre.
- La especializacion del Neural Engine se realiza en el dispositivo, por lo que el rendimiento puede variar segun el modelo de iPhone o iPad.
- No se proporcionan datos de VRAM ni de latencia especifica, pero al ser un modelo de 600M parametros compilado para Core ML, se espera que funcione en tiempo real en dispositivos modernos.
- Opciones de despliegue: integracion directa en apps iOS mediante Core ML; no se mencionan otros entornos como vLLM o llama.cpp.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos ASR (como Whisper, Wav2Vec2 o Parakeet). No se han encontrado datos de rendimiento, parametros de contexto ni licencias comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No se especifican los idiomas exactos soportados, por lo que el rendimiento en idiomas poco representados puede ser limitado.
- Al ser un modelo ASR, puede presentar errores de transcripcion (alucinaciones acusticas) en entornos ruidosos o con acentos no contemplados.
- El repositorio es una conversion de un tercero; no se garantiza que el proceso de compilacion a Core ML haya preservado todas las capacidades del modelo original.
- La licencia MIT permite uso comercial, pero el modelo original de NVIDIA puede tener restricciones adicionales; se recomienda verificar la licencia del modelo base antes de su uso en produccion.
- No se proporcionan instrucciones de uso ni documentacion tecnica en el modelo card, lo que puede dificultar su integracion para desarrolladores no familiarizados con Core ML.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/aoiandroid/nemotron-3.5-asr-streaming-0.6b-coreml-ios
- Modelo fuente (CoreML): https://huggingface.co/aoiandroid/nemotron-3.5-asr-streaming-0.6b-coreml
- Variante macOS: https://huggingface.co/aoiandroid/nemotron-3.5-asr-streaming-0.6b-coreml-macos
- Repositorio de GitHub con documentacion del modelo original: https://github.com/weyan618/nemotron-asr/tree/main/nemotron-asr/nemotron-3.5-asr-streaming-0.6b
- Variante INT8 en HuggingFace: https://huggingface.co/aoiandroid/Nemotron-3.5-ASR-Streaming-0.6B-CoreML-INT8
- Model card de NVIDIA NIM (para el modelo original): https://build.nvidia.com/nvidia/nemotron-asr-streaming/modelcard
