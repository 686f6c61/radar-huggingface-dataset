# robertteleng/whisper-large-v3-turbo-coreml

## Resumen

Este repositorio no contiene un modelo nuevo, sino una conversion de formato: el encoder de OpenAI Whisper large-v3-turbo exportado a CoreML (`.mlpackage`) para que se ejecute en el Apple Neural Engine (ANE), junto con los pesos del decoder en safetensors para ejecutarlos por separado. Lo publica el usuario robertteleng y esta pensado para integrarse en aplicaciones iOS que necesitan transcripcion de voz en el propio dispositivo, sin enviar audio a un servidor.

La relevancia es practica: CoreML solo delega en el ANE si el grafo trazado es compatible, y ese es el trabajo real de la conversion. El resultado mantiene los mismos pesos, la misma calidad de transcripcion y los mismos idiomas que el modelo base de OpenAI; no hubo reentrenamiento ni ajuste fino. A cambio, la utilidad queda limitada a desarrolladores dispuestos a implementar la parte del decoder por su cuenta, ya que el paquete solo cubre el encoder.

El repositorio ocupa 1,8 GB y su licencia es MIT, heredada del modelo original. Los metadatos registran cero descargas y cero likes, y no se han publicado cifras de latencia ni de consumo de memoria sobre hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para reconocimiento automatico de voz (la conversion solo cubre el encoder, trazado a CoreML) |
| Parametros totales | No disponible en la informacion proporcionada. El modelo base openai/whisper-large-v3-turbo se documenta publicamente con 809 M de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como ventana de tokens. Al heredar la arquitectura Whisper, trabaja sobre ventanas de audio de 30 segundos; la ficha no detalla este punto |
| Tipos de cuantizacion | No disponible. El repositorio contiene un encoder CoreML y un decoder en safetensors sin especificar precision |
| Idiomas soportados | Los mismos que openai/whisper-large-v3-turbo (multilingue); la lista concreta no se detalla en la informacion disponible |
| Licencia | MIT |
| Formato de pesos | Encoder: `.mlpackage` (CoreML). Decoder: `decoder_weights.safetensors` |
| Tamano del repositorio | 1,8 GB |
| Herramienta de conversion | robertteleng/coreml-forge (`scripts/export_whisper_turbo.py`) |
| Modelo base | openai/whisper-large-v3-turbo |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder que consume espectrogramas mel y genera tokens de texto, con capacidad de transcripcion y traduccion multilingue. En esta publicacion no hay entrenamiento de ningun tipo: se trata de una conversion de pesos identica a la del modelo base. El autor lo explicita en la model card: "a format conversion, not a new model: same weights as openai/whisper-large-v3-turbo, same transcription quality, same languages. Nothing was retrained".

La innovacion tecnica esta, por tanto, en el proceso de exportacion. El objetivo declarado es trazar el encoder de forma que CoreML lo acepte y que el Apple Neural Engine lo ejecute realmente, en lugar de degradar la ejecucion a CPU. El repositorio separa deliberadamente las dos mitades del modelo: el encoder queda como `.mlpackage` para el ANE y el decoder se entrega como safetensors, de modo que el desarrollador elige el runtime para esa segunda parte. No se documentan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, porque no aplica: son pesos heredados de OpenAI sin modificaciones.

## Capacidades

- Transcripcion de voz a texto multilingue, con la misma cobertura de idiomas que Whisper large-v3-turbo.
- Traduccion de audio a texto en ingles, capacidad nativa de la familia Whisper (sujeta a la implementacion del decoder por parte del integrador).
- Deteccion de idioma, heredada del modelo base.
- Ejecucion del encoder en el Apple Neural Engine, lo que habilita inferencia local en iPhone y iPad sin conexion de red.
- Integracion en aplicaciones iOS mediante CoreML y, presumiblemente, macOS, aunque la ficha solo menciona iOS.
- No cubre generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico: no es un modelo de lenguaje conversacional.
- No se documentan modos especiales (thinking, audio generativo, etc.).

## Casos de uso

- Transcripcion on-device en aplicaciones iOS: el encoder se ejecuta en el ANE y el audio nunca sale del dispositivo, lo que resulta adecuado para apps de notas de voz o diarios personales con requisitos estrictos de privacidad.
- Dictado por voz sin conexion: util en entornos sin cobertura o con redes restringidas, donde no es viable llamar a una API de transcripcion en la nube.
- Subtitulado de contenido grabado en el propio telefono: el integrador ejecuta el encoder en CoreML y el decoder por separado para generar los subtitulos de un video antes de subirlo.
- Preprocesado local en aplicaciones de reuniones: transcripcion en el dispositivo que despues se envia a un LLM remoto solo como texto, reduciendo el volumen de datos sensibles transmitidos.
- Funciones de accesibilidad: conversion de voz a texto en tiempo real para personas con dificultades auditivas, con la ventaja de que el procesamiento local elimina la dependencia de la latencia de red.
- Filtrado y etiquetado de audio a gran escala en Mac con Apple Silicon: por ejemplo, indexar un archivo de entrevistas o podcasts generando transcripciones sin coste por minuto de API.
- Prototipado de pipelines de ASR hibridos: usar el encoder CoreML como componente y experimentar con distintos decoders o estrategias de decodificacion en otros frameworks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que no hay mediciones en dispositivo: "No on-device benchmarks published here — no latency or memory numbers on real hardware". Tampoco se aportan cifras de WER, latencia ni consumo de memoria. Al ser una conversion de formato sin reentrenamiento, la calidad de transcripcion deberia ser equivalente a la de openai/whisper-large-v3-turbo, pero esta ficha no dispone de datos para confirmarlo.

## Requisitos de hardware

- El repositorio completo ocupa 1,8 GB, repartidos entre el encoder en CoreML y los pesos del decoder en safetensors. Esa cifra es el unico dato de tamano disponible; no se detalla la precision de los pesos.
- El encoder esta disenado para el Apple Neural Engine, disponible en chips de la serie A a partir del A12 y en Apple Silicon (serie M). La model card no enumera los dispositivos objetivo concretos.
- Requiere iOS reciente: el autor advierte de que "the conversion targets a recent iOS version; older deployment targets may need re-exporting".
- El decoder no se ejecuta en CoreML dentro de este paquete; el integrador debe aportar su propio runtime y gestionar los pesos en safetensors por separado.
- No se especifican GPU de escritorio recomendadas (A100, H100, RTX 4090) ni opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI. El caso de uso previsto es movil y local, no servidor.
- VRAM estimada: no disponible. No hay cifras de memoria publicadas para el encoder ni para el decoder.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Formato de pesos | Licencia | Orientacion |
|---|---|---|---|---|---|
| robertteleng/whisper-large-v3-turbo-coreml | No indicado en la ficha; el base se publica con 809 M | 30 s (heredado de Whisper; no detallado en la ficha) | CoreML (encoder) + safetensors (decoder) | MIT | Encoder para Apple Neural Engine en apps iOS |
| openai/whisper-large-v3-turbo | 809 M (documentado por OpenAI) | 30 s | safetensors / PyTorch | MIT | Modelo original completo, ejecucion en servidor o GPU |
| openai/whisper-large-v3 | 1550 M (documentado por OpenAI) | 30 s | safetensors / PyTorch | MIT | Mayor capacidad, mas coste de inferencia |
| Conversiones GGUF de Whisper (por ejemplo, whisper.cpp) | Depende del modelo de origen | 30 s | GGUF | Segun el modelo de origen | Inferencia en CPU y hardware variado, no especifico de ANE |

La comparacion relevante no es de calidad, ya que los pesos son los mismos que los de Whisper large-v3-turbo, sino de formato y de destino de ejecucion. Las cifras de parametros de las alternativas provienen de la documentacion publica de OpenAI y no se han verificado en la informacion disponible en esta ficha. No se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- El paquete solo incluye el encoder. No es un transcriptor listo para usar: el desarrollador debe ejecutar el decoder por su cuenta. El propio autor lo advierte: "This is not a drop-in transcriber: you need to run the decoder yourself".
- No hay benchmarks en dispositivo publicados: ni latencia, ni memoria, ni consumo energetico en hardware real.
- La conversion apunta a una version reciente de iOS; objetivos de despliegue mas antiguos pueden exigir una reexportacion.
- Hereda los problemas conocidos de Whisper, entre ellos la generacion de texto alucinado ante silencios o audio sin habla clara, y una calidad desigual entre idiomas.
- La licencia es MIT, igual que la del modelo de OpenAI, por lo que el uso comercial esta permitido; el repositorio solo redistribuye un formato convertido y la atribucion corresponde a OpenAI.
- Adopcion practicamente nula: cero descargas y cero likes en el momento de la consulta, sin senales de mantenimiento posterior (fechas de creacion y actualizacion separadas por unos segundos).
- No se detalla la precision numerica de los pesos convertidos ni si existe cuantizacion, lo que dificulta estimar memoria y latencia antes de probarlo.
- No se documentan los idiomas concretos soportados ni los limites de longitud de audio mas alla del comportamiento estandar de Whisper.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/robertteleng/whisper-large-v3-turbo-coreml
- Modelo base en HuggingFace: https://huggingface.co/openai/whisper-large-v3-turbo
- Herramienta de conversion coreml-forge: https://github.com/robertteleng/coreml-forge
- No se han encontrado otros enlaces relevantes en la busqueda web realizada; los resultados devueltos correspondian a calculadoras de relacion de aspecto y no guardan relacion con el modelo.
