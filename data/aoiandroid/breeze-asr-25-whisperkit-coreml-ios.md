# aoiandroid/breeze-asr-25-whisperkit-coreml-ios

## Resumen

Breeze-ASR-25 es un modelo de reconocimiento automático del habla (ASR) desarrollado por MediaTek Research, ajustado a partir de Whisper-large-v2. Esta variante concreta (`aoiandroid/breeze-asr-25-whisperkit-coreml-ios`) es una compilación específica para plataformas Apple: los paquetes `.mlpackage` se han compilado a `.mlmodelc` para su uso directo en aplicaciones iOS a través de WhisperKit. La especialización en Apple Neural Engine (ANE) se mantiene a nivel de dispositivo.

El modelo base está optimizado para mandarín taiwanés y escenarios de cambio de código mandarín-inglés, tanto intraoracional como interoracional, e incorpora una técnica de *mix embedding* para la decodificación. El modelo base tiene aproximadamente 1.5B parámetros (arquitectura Whisper-large-v2) y una ventana de contexto de 30 segundos de audio. Esta variante Core ML ocupa 1,1 GB y se distribuye bajo licencia MIT, lo que facilita su integración en aplicaciones comerciales.

La relevancia de este modelo radica en que ofrece reconocimiento de voz de alta calidad en dispositivos móviles sin conexión a internet, algo especialmente útil para aplicaciones de traducción, subtitulado automático y asistentes de voz en chino mandarín e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-large-v2 (encoder-decoder Transformer) |
| Parametros totales | 1,5B (aprox., no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija) |
| Tipos de cuantizacion | Compilacion CoreML con especializacion ANE local (no se especifican cuantizaciones numericas) |
| Idiomas soportados | Mandarín taiwanés, ingles (con cambio de codigo optimizado) |
| Licencia | MIT |
| Formato de pesos | `.mlmodelc` (Core ML compilado) |

## Arquitectura y entrenamiento

El modelo base Breeze-ASR-25 se construye sobre Whisper-large-v3 de OpenAI, que es un Transformer encoder-decoder con aproximadamente 1,5B parámetros. La innovacion principal reside en el uso de un *mix embedding* unificado para la decodificacion, disenado especificamente para manejar el cambio de codigo entre mandarin e ingles. Este enfoque permite que el modelo alterna entre idiomas dentro de una misma frase o entre frases consecutivas sin degradacion significativa del rendimiento.

El entrenamiento se realizo mediante ajuste fino (fine-tuning) del modelo base Whisper-large-v3 con datos de habla en mandarin taiwanes y conversaciones bilingues mandarin-ingles. No se dispone de informacion detallada sobre el volumen de datos de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO en el proceso. El modelo base original de MediaTek Research incluye ademas una mejora en la alineacion temporal, lo que lo hace adecuado para subtitulado automatico. La variante CoreML mantiene estas capacidades tras la conversion, aunque la especializacion ANE se realiza localmente en cada dispositivo durante la instalacion.

## Capacidades

- Reconocimiento automatico de voz (ASR) para mandarin taiwanes y chino mandarin general.
- Optimizado para cambio de codigo mandarin-ingles, tanto intraoracional (dentro de una misma frase) como interoracional (entre frases consecutivas).
- Alineacion temporal mejorada, adecuada para generar subtitulos sincronizados con el audio.
- Inferencia completamente offline en dispositivos Apple con chip Neural Engine (ANE).
- Integracion con WhisperKit para gestionar la decodificacion en dispositivos iOS.
- No se especifica soporte para tool calling, agentes ni razonamiento multi-paso, al ser un modelo de ASR puro.

## Casos de uso

- **Subtitulado automatico en tiempo real**: la alineacion temporal mejorada permite generar subtitulos sincronizados en video, especialmente util para contenido en mandarin o bilingue mandarin-ingles. Se integraria en apps de video o streaming con el modelo ejecutandose localmente en el iPhone o iPad.
- **Traduccion y transcripcion de reuniones**: en aplicaciones de toma de notas o transcripcion, el modelo puede convertir conversaciones en mandarin o con cambios de codigo al ingles en texto, funcionando sin conexion para garantizar la privacidad de las reuniones.
- **Asistentes de voz offline**: para apps de asistencia personal o dictado que necesiten funcionar sin conexion, el modelo ofrece transcripcion precisa en chino e ingles sin depender de servicios en la nube.
- **Aplicaciones educativas de idiomas**: la capacidad de manejar codigo-switching permite crear ejercicios de pronunciacion o traduccion simultanea que reconozcan cuando el usuario alterna entre mandarin e ingles de forma natural.
- **Traduccion de voz a texto para personas con discapacidad auditiva**: la transcripcion en tiempo real en dispositivos moviles, con alta precision en chinoes, facilita la comunicacion en entornos donde no hay conexion a internet.
- **Transcripcion de entrevistas y podcasts**: los creadores de contenido que trabajan con material bilingue pueden transcribir grabaciones de forma local, sin subir archivos a servidores externos, manteniendo la confidencialidad del material.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio original de MediaTek Research menciona que el modelo esta optimizado para el cambio de codigo y la alineacion temporal, pero no se incluyen cifras concretas de WER (Word Error Rate) ni comparaciones con otros modelos en la documentacion revisada.

## Requisitos de hardware

- **Dispositivos compatibles**: iPhone y iPad con chip Apple A12 Bionic o posterior (requisito de Core ML). El modelo se compila con especializacion ANE local, por lo que el rendimiento optimo se obtiene en dispositivos con Neural Engine.
- **VRAM**: no aplica directamente (inferencia en dispositivo movil), pero el tamano del paquete es de 1,1 GB, que requiere espacio libre en el dispositivo.
- **GPU**: no es necesaria GPU externa; el modelo se ejecuta en el Neural Engine del dispositivo.
- **Opciones de despliegue**: integracion via WhisperKit en apps iOS. No se mencionan soporte para vLLM, llama.cpp, Ollama o TGI.
- **Latencia**: no disponible. Depende del modelo de dispositivo y de la especializacion ANE local.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| **Breeze-ASR-25 (CoreML iOS)** | 1,5B (aprox.) | 30 s audio | Mandarín, ingles (code-switch) | MIT | `.mlmodelc` |
| **Whisper-large-v3 (original)** | 1,5B | 30 s audio | 99 idiomas | MIT | PyTorch, safetensors |
| **Whisper.cpp (iOS)** | 1,5B | 30 s audio | 99 idiomas | MIT | GGUF |

El modelo original de Whisper-large-v3 de OpenAI ofrece cobertura en 99 idiomas, mientras que Breeze-ASR-25 se especializa en mandarin taiwanes y code-switching, lo que puede ofrecer mejor precision en esos escenarios especificos. La version CoreML compilada es directamente utilizable en iOS sin pasos de conversion adicionales, mientras que Whisper.cpp requiere compilacion manual.

## Limitaciones y advertencias

- **Idiomas limitados**: el modelo esta optimizado para mandarin taiwanes y code-switching con ingles. No se recomienda para otros idiomas sin evaluacion previa.
- **Ventana de contexto fija**: 30 segundos de audio por pasada. Para audios mas largos se requiere segmentacion previa.
- **Especializacion ANE local**: el rendimiento puede variar segun el dispositivo y la generacion del Neural Engine. No se garantiza compatibilidad con dispositivos antiguos.
- **Es una compilacion de un tercero**: este paquete CoreML es compilado por `aoiandroid`, no por MediaTek Research. Es necesario verificar la integridad y el funcionamiento en el entorno de produccion.
- **Sin benchmarks publicados**: no se dispone de metricas de rendimiento verificables para esta variante CoreML.
- **Sin soporte para tool calling**: el modelo es exclusivamente de ASR, no apto para tareas de razonamiento o generacion de texto general.

## Enlaces

- [Modelo CoreML iOS en HuggingFace](https://huggingface.co/aoiandroid/breeze-asr-25-whisperkit-coreml-ios)
- [Modelo CoreML base en HuggingFace](https://huggingface.co/aoiandroid/breeze-asr-25-whisperkit-coreml)
- [Modelo CoreML macOS en HuggingFace](https://huggingface.co/aoiandroid/breeze-asr-25-whisperkit-coreml-macos)
- [Modelo CoreML general en HuggingFace](https://huggingface.co/aoiandroid/Breeze-ASR-25_coreml)
- [Repositorio oficial de Breeze-ASR-25 en GitHub](https://github.com/mtkresearch/Breeze-ASR-25)
- [BreezeApp en GitHub](https://github.com/mtkresearch/BreezeApp)
