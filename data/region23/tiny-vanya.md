# region23/tiny-vanya

## Resumen

Tiny Vanya es un modelo de síntesis de voz (text-to-speech) en ruso, desarrollado por el usuario region23, que destaca por su tamano extremadamente reducido: 36,2 millones de parametros en total (28,5M para el modelo acustico y 7,7M para el vocoder). El modelo se construye sobre la arquitectura tiny-voca y fue destilado a partir de voz sintetica generada por Qwen3-TTS 1.7B Base, con aproximadamente 72 horas de audio y marcas de acentuacion verificadas manualmente. Ofrece dos voces: M1 (masculina) y F1 (femenina).

La relevancia de este modelo reside en su orientacion a la inferencia en dispositivo (on-device), sin necesidad de red. Se distribuye en formatos ONNX y Core ML, lo que permite ejecutarlo en CPU, GPU de Apple y Neural Engine tanto en iPhone como en Mac. Alcanza velocidades de x77 en tiempo real con ONNX Runtime sobre 4 hilos de CPU y x93 con Core ML en un Mac mini M4 Pro, con una tasa de error de caracteres (CER) del 0,21 % evaluada con Whisper large-v3-turbo sobre 60 frases reservadas.

El modelo esta pensado para aplicaciones de sintesis de voz en ruso de baja latencia y bajo consumo de recursos, como asistentes locales, lectores de pantalla o interfaces conversacionales embebidas. Su licencia openrail permite uso comercial con ciertas condiciones, y el repositorio incluye pesos en PyTorch, ONNX y Core ML, ademas de un paquete Python y un runner en Swift.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos etapas: transformer acustico → log-mel de 80 bandas → vocoder estilo Vocos (iSTFT) |
| Parametros totales | 36,2M (28,5M acustico + 7,7M vocoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa texto frase a frase, sin limite declarado) |
| Tipos de cuantizacion | float32 (ONNX), float16 (Core ML speech, web ONNX con pesos float16 convertidos a float32 al cargar) |
| Idiomas soportados | Ruso (ru) |
| Licencia | openrail |
| Formato de pesos | ONNX, Core ML (mlpackage), PyTorch (.pt), JSON de metadatos, rueda Python (.whl) |

## Arquitectura y entrenamiento

Tiny Vanya emplea una arquitectura en dos etapas. La primera es un transformer acustico que convierte fonemas y marcas de acentuacion en representaciones log-mel de 80 bandas. La segunda es un vocoder estilo Vocos con iSTFT que transforma esas representaciones en forma de onda a 24 kHz mono. Cada voz (M1 y F1) tiene su propio modelo acustico, mientras que el vocoder es compartido. El front end utiliza eSpeak NG para el ruso y un diccionario de acentuacion para generar fonemas y marcas de estres.

El entrenamiento se realizo desde inicializacion aleatoria (sin pesos preentrenados en el estudiante) mediante destilacion de Qwen3-TTS 1.7B Base, usando aproximadamente 72 horas de voz sintetica con acentuacion revisada manualmente. No se menciona el uso de RLHF ni DPO. La model card indica que en una prueba de escucha a ciegas la variante entrenada con criticos mel de banda baja mas fuertes (acoustic-m1) sono mejor para M1, y el modelo base (acoustic-f1) para F1. Cualquiera de los dos modelos puede hablar con ambas voces.

## Capacidades

- Sintesis de voz en ruso a partir de texto, con dos voces: M1 (masculina) y F1 (femenina).
- Conversion de numeros, horas y fechas a texto hablado en ruso.
- Procesamiento de texto de cualquier longitud: se lee frase a frase y se une el audio resultante.
- Control de velocidad mediante el parametro `speed` (1.0 por defecto).
- Inferencia en dispositivo sin conexion de red: CPU, GPU de Apple y Neural Engine.
- Exportacion a ONNX (opset 17) y Core ML (iOS 18 / macOS 15), con runner en Swift incluido.
- Paquete Python con front end, inferencia ONNX y PyTorch, exportacion y codigo de entrenamiento.
- No soporta tool calling, agentes, vision, audio de entrada ni modo thinking; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz locales en dispositivos iOS y macOS: el modelo se ejecuta en el Neural Engine o en la CPU sin conexion, lo que permite sintetizar respuestas en ruso con una latencia baja y sin enviar texto a servidores externos.
- Lectores de pantalla y accesibilidad: integracion en aplicaciones que convierten texto en voz para usuarios con discapacidad visual, aprovechando el reducido consumo de recursos (36,2M de parametros) y la velocidad de x77 en tiempo real en CPU.
- Interfaces conversacionales embebidas: sistemas de atencion al cliente o kioscos interactivos en ruso que necesitan sintesis de voz en tiempo real sin depender de la nube, con la posibilidad de alternar entre voces masculina y femenina.
- Educacion y aprendizaje de idiomas: generacion de audio para ejercicios de pronunciacion o lectura en ruso, con control de velocidad para adaptarse a distintos niveles.
- Automatizacion de contenido de audio: conversion de articulos, noticias o documentos a audio en ruso para podcasts o boletines, procesando el texto frase a frase sin limite de longitud.
- Pruebas y prototipado de pipelines TTS: el paquete Python y los formatos ONNX/Core ML permiten integrar el modelo en flujos de CI/CD o en aplicaciones de escritorio y moviles con facilidad.
- Sistemas de navegacion o anuncios por voz en vehiculos: sintesis local de indicaciones en ruso con bajo consumo energetico y sin dependencia de conectividad.

## Benchmarks y rendimiento

| Metrica | Tiny Vanya | Profesor (Qwen3-TTS 1.7B Base) |
|---|---|---|
| CER (Whisper large-v3-turbo, 60 frases reservadas) | 0,21 % | 0,15 % |
| Velocidad (ONNX Runtime, 4 hilos CPU) | x77 tiempo real | No disponible |
| Velocidad (Core ML, Mac mini M4 Pro) | x93 tiempo real | No disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 36,2M de parametros, los pesos en float32 ocupan aproximadamente 150 MB por voz en ONNX; en float16 para Core ML, alrededor de 50 MB para la etapa de speech y 43 MB para durations. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En el ecosistema Apple, se ejecuta en GPU y Neural Engine (iPhone, Mac con chip M-series). En el resto de plataformas, ONNX Runtime sobre CPU es suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (por ejemplo, RTX 4090, RTX 3060) e incluso en dispositivos moviles.
- Opciones de despliegue: ONNX Runtime (Python y onnxruntime-web para navegador), Core ML (iOS 18 / macOS 15) con runner en Swift, PyTorch para inferencia y exportacion. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: x77 en tiempo real con ONNX Runtime sobre 4 hilos de CPU y x93 con Core ML en un Mac mini M4 Pro, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Tiny Vanya | 36,2M | No disponible | Ruso | openrail | ONNX, Core ML, PyTorch | TTS en dispositivo, dos voces, destilado de Qwen3-TTS |
| Qwen3-TTS 1.7B Base | 1.700M | No disponible | Multiples (incluye ruso) | No disponible en la informacion | No disponible | Profesor del que se destila Tiny Vanya; mayor tamano y calidad CER 0,15 % |
| tiny-voca | No disponible | No disponible | No disponible | No disponible | No disponible | Arquitectura base sobre la que se construye Tiny Vanya |

No se dispone de datos suficientes para comparar con otras alternativas de TTS en ruso de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta ruso; no se ha entrenado para otros idiomas.
- Al estar destilado de voz sintetica, puede heredar sesgos o artefactos del profesor Qwen3-TTS, aunque no se detallan sesgos especificos en la model card.
- Riesgo de alucinacion o errores de pronunciacion en palabras poco frecuentes, nombres propios o terminos tecnicos, ya que el front end depende de eSpeak NG y de un diccionario de acentuacion.
- La calidad de la sintesis puede variar entre las voces M1 y F1; la model card indica que cada una usa un modelo acustico distinto y que los resultados de escucha a ciegas favorecieron configuraciones diferentes.
- La licencia openrail permite uso comercial, pero impone condiciones que deben revisarse antes de desplegar el modelo en produccion.
- El modelo esta pensado para inferencia en dispositivo; no se han publicado datos sobre rendimiento en GPUs de servidor ni sobre despliegue a gran escala.
- No se han publicado resultados de benchmarks estandar de TTS (MOS, WER) mas alla del CER con Whisper, por lo que la evaluacion de calidad subjetiva es limitada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/region23/tiny-vanya)
- [Demo en navegador (makeitbeta.ru/tinyvanya)](https://makeitbeta.ru/tinyvanya/)
- [Landing page en Hugging Face Spaces](https://huggingface.co/spaces/region23/tiny-vanya)
- [Repositorio tiny-voca (arquitectura base)](https://github.com/n4ze3m/tiny-voca)
- [Modelo profesor Qwen3-TTS 1.7B Base](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base)
