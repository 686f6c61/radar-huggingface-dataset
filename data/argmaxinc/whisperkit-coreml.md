# argmaxinc/whisperkit-coreml

## Resumen

WhisperKit es el componente de modelos de Argmax OSS, un SDK de reconocimiento automatico del habla (ASR) disenado para ejecucion local en Apple Silicon. El repositorio `argmaxinc/whisperkit-coreml` no contiene un modelo entrenado desde cero, sino un catalogo de pesos de Whisper (OpenAI) convertidos y optimizados al formato CoreML, listos para ser cargados por la libreria WhisperKit en macOS, iOS y otros dispositivos de Apple. Su objetivo es permitir transcripcion de voz en el propio dispositivo, sin enviar audio a servidores externos, con la privacidad y la latencia predecible que eso implica.

El repositorio acumula mas de 11,7 millones de descargas y 249 "likes", lo que lo situa entre los recursos de ASR mas consumidos de HuggingFace. La licencia es MIT, lo que facilita su integracion en productos comerciales, y el proyecto cuenta con un articulo presentado en ICML 2025. El tamano del repositorio (39,5 GB) refleja que agrupa multiples variantes y niveles de cuantizacion de la familia Whisper, desde tallas pequenas hasta las mayores.

La relevancia actual del proyecto radica en que cubre un nicho concreto: inferencia de ASR de baja latencia en hardware de consumo de Apple (serie M) usando el Neural Engine y la GPU integrada, con alternativas cuantizadas que reducen el consumo de memoria. La version open source no incluye diarizacion de hablantes ni vocabulario personalizado; esas funciones se ofrecen en el SDK comercial de Argmax.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper de OpenAI), convertida a CoreML |
| Parametros totales | no disponible (el repositorio agrupa varias tallas de Whisper; no se detallan en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha (Whisper, el modelo base, procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible en detalle; el repositorio incluye variantes cuantizadas en formato CoreML (etiqueta "quantized") |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | CoreML (`.mlmodelc` / `.mlpackage`) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper, un transformer encoder-decoder con atencion completa que mapea espectrogramas mel a tokens de texto, incluyendo tokens especiales de idioma, tarea y marcas de tiempo. WhisperKit no reentrena ese modelo: toma los pesos publicados por OpenAI, los convierte al formato CoreML y aplica optimizaciones especificas para Apple Silicon, con variantes cuantizadas que reducen el uso de memoria y aprovechan el Neural Engine. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ya que corresponden al entrenamiento original de Whisper y no a este repositorio de conversion.

Como innovacion destacable del proyecto, el SDK asociado (`argmax-oss-swift`) ofrece utilidades para generar y desplegar versiones ajustadas finamente de Whisper en CoreML mediante el repositorio de soporte `whisperkittools`, de modo que un desarrollador puede subir sus propios pesos convertidos a HuggingFace y cargarlos simplemente cambiando el nombre del repositorio. El articulo presentado en ICML 2025 documenta el diseno del sistema, aunque los resultados concretos no se recogen en la informacion disponible.

## Capacidades

- Transcripcion de voz a texto (ASR) en local, sin conexion a servicios externos.
- Procesamiento de audio en ventanas con marcas de tiempo a nivel de segmento, caracteristica heredada de Whisper.
- Ejecucion acelerada en Apple Silicon mediante CoreML, con soporte para Neural Engine, GPU y CPU.
- Variantes cuantizadas para escenarios con restricciones de memoria (dispositivos moviles y portatiles).
- Capacidades multilingues y de traduccion de voz a texto heredadas de Whisper; la ficha de HuggingFace no declara la lista de idiomas.
- Generacion de modelos personalizados: `whisperkittools` permite convertir pesos ajustados finamente a CoreML y cargarlos desde un repositorio propio.
- No incluye, en la version open source, diarizacion de hablantes ni vocabulario personalizado; esas funciones corresponden al SDK comercial de Argmax.

## Casos de uso

- Transcripcion de reuniones en local: la aplicacion captura audio del microfono y transcribe en el propio Mac, sin enviar datos a la nube, lo que simplifica el cumplimiento de normativas de privacidad.
- Notas de voz en aplicaciones iOS: integracion del modelo cuantizado en una app movil para convertir grabaciones en texto aprovechando el Neural Engine del dispositivo.
- Subtitulado de video en tiempo real: uso de las variantes de menor latencia para generar subtitulos sincronizados durante la reproduccion en macOS.
- Asistentes de voz con activacion local: el modelo actua como etapa de reconocimiento en un pipeline de comandos por voz, con la ventaja de no depender de conectividad.
- Documentacion clinica o legal dictada: transcripcion en equipos de escritorio sin salida de datos al exterior, adecuada para entornos con requisitos estrictos de confidencialidad.
- Indexacion y busqueda de archivos de audio: procesamiento por lotes de un archivo historico de grabaciones para generar transcripciones buscables en un servidor macOS.
- Accesibilidad: conversion de voz a texto para personas con dificultades auditivas en aplicaciones nativas de Apple.
- Prototipado rapido en Swift: al cargarse desde un repositorio de HuggingFace con un cambio de nombre, permite experimentar con distintas tallas de Whisper sin recompilar infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente remite al articulo y la presentacion del ICML 2025 (`https://icml.cc/virtual/2025/47854`), sin cifras de WER, latencia ni comparativas numericas en los datos facilitados.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon (serie M) mediante CoreML; el repositorio no esta pensado para GPU NVIDIA ni para servidores x86 tradicionales.
- VRAM estimada para inferencia: no disponible; depende de la talla de Whisper y del nivel de cuantizacion elegido. El repositorio completo ocupa 39,5 GB, pero una sola variante cuantizada ocupa una fraccion de ese espacio.
- GPU recomendadas: no aplica en el sentido convencional; se recomienda hardware Apple con Neural Engine (M1 o posterior). No se documentan recomendaciones para A100, H100 o RTX 4090 en la informacion proporcionada.
- Cabe en hardware de consumo: si, en equipos Apple Silicon; las variantes cuantizadas reducen el consumo de memoria, aunque el dato exacto por variante no esta disponible.
- Opciones de despliegue: libreria WhisperKit a traves de `argmax-oss-swift` (Swift), con generacion de modelos mediante `whisperkittools`. No se documenta soporte para vLLM, Ollama, llama.cpp ni TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles. El SDK comercial de Argmax se presenta especificamente para transcripcion en tiempo real, pero el repositorio open source no publica cifras.

## Comparativa con modelos similares

| Modelo | Formato | Plataforma objetivo | Licencia | Notas |
|---|---|---|---|---|
| WhisperKit CoreML (este repositorio) | CoreML | Apple Silicon (ANE/GPU/CPU) | MIT | Optimizado para ejecucion local en dispositivos Apple; incluye variantes cuantizadas |
| Whisper original (OpenAI) | PyTorch (safetensors) | GPU NVIDIA/AMD, CPU | MIT | Pesos de referencia sin optimizar para inferencia local; requiere conversion para otros runtimes |
| whisper.cpp | GGML/GGUF | CPU, Apple Silicon, GPU variadas | MIT | Implementacion en C/C++ orientada a portabilidad y bajo consumo |
| faster-whisper (CTranslate2) | CTranslate2 | CPU y GPU NVIDIA | MIT | Optimizado para throughput en servidores con GPU NVIDIA |

La comparativa de parametros y contexto no se incluye porque depende de la variante de Whisper seleccionada, y ese dato no esta detallado en la informacion proporcionada.

## Limitaciones y advertencias

- Es un repositorio de conversion, no un modelo nuevo: hereda las limitaciones, sesgos y errores de Whisper, incluidos los sesgos de transcripcion asociados a acentos, variedades dialectales y calidad de audio.
- Riesgo de alucinacion: Whisper puede generar texto plausible en segmentos con silencio, ruido o musica, un problema documentado en la familia y no corregido por la conversion a CoreML.
- Ventana de audio fija: el modelo base opera sobre fragmentos de 30 segundos, lo que obliga a estrategias de ventana deslizante para audio largo y puede introducir errores en las uniones.
- Dependencia de plataforma: los pesos en formato CoreML estan pensados para el ecosistema Apple; su uso en otros entornos requiere convertir de nuevo a PyTorch u otro formato.
- Idiomas soportados no declarados en la ficha: no es posible confirmar desde la informacion disponible que todas las variantes conserven el comportamiento multilingue del modelo base.
- Idiomas y contexto: no disponibles en la informacion proporcionada.
- Licencia MIT: permite uso comercial y modificacion siempre que se conserve el aviso de copyright y la licencia, sin garantia de ningun tipo. Conviene verificar las condiciones de los pesos originales de OpenAI Whisper, tambien bajo licencia MIT.
- Funciones ausentes en la version open source: diarizacion de hablantes, vocabulario personalizado y optimizaciones de tiempo real con multiples hablantes quedan en el SDK comercial de Argmax, por lo que un producto que las necesite tendra que valorar esa dependencia.
- Repositorio mutable: al actualizarse periodicamente (ultima actualizacion indicada: 2026-08-19) y existir instantaneas con fecha como `whisperkit-coreml_01-30-24`, conviene fijar una revision concreta en produccion para evitar cambios de comportamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/argmaxinc/whisperkit-coreml
- Instantanea con fecha: https://huggingface.co/argmaxinc/whisperkit-coreml_01-30-24
- Repositorio de codigo Argmax OSS Swift (WhisperKit): https://github.com/argmaxinc/argmax-oss-swift
- Articulo y presentacion en ICML 2025: https://icml.cc/virtual/2025/47854
- SDK comercial de Argmax (Argmax Pro, diarizacion y vocabulario personalizado): https://www.argmaxinc.com/blog/argmax-sdk-2
- Sitio de Argmax: https://www.argmaxinc.com/
- Fork de la comunidad (Anureka-Inc/WhisperKit): https://github.com/Anureka-Inc/WhisperKit
