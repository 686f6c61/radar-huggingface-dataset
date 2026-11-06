# antonbanderi/fjale

## Resumen

Fjale es un paquete de reconocimiento automatico del habla (ASR) para albanes (shqip) listo para ejecutarse en dispositivo, distribuido por el usuario antonbanderi para la aplicacion iOS Duovid. No se trata de un modelo entrenado desde cero: los pesos son el fine-tune de Flutra sobre OpenAI Whisper large-v3-turbo para albanes, y el trabajo de este repositorio consiste exclusivamente en el reempaquetado a Core ML y la compresion mediante palettizacion de 6 bits, reduciendo el tamano de aproximadamente 1,6 GB a unos 589 MB.

El modelo resuelve un problema concreto: desplegar ASR de calidad en albanes dentro de una app movil sin depender de la nube. El Whisper large-v3-turbo original obtiene un WER del 42,8 % en el conjunto de evaluacion del autor, mientras que este paquete baja al 11,3 % global y al 18,8 % en habla no vista durante el entrenamiento (VoxForge), lo que supone una mejora sustancial para un idioma de bajos recursos.

Es relevante por dos motivos: demuestra que la palettizacion de 6 bits es viable para Whisper sin degradar la precision (la variante de 4 bits fue descartada por superar el 100 % de WER), y ofrece un ejemplo reproducible de pipeline whisperkittools para llevar un fine-tune a produccion en Apple Silicon. La arquitectura subyacente es el transformer encoder-decoder de Whisper large-v3-turbo, con 809 millones de parametros y ventana de contexto de audio de 30 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) convertido a Core ML |
| Parametros totales | 809 M (heredados de Whisper large-v3-turbo; no confirmado en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (Whisper); chunking por VAD en la practica |
| Tipos de cuantizacion | Palettizacion de 6 bits (unica variante publicada); 4 bits probada y descartada |
| Idiomas soportados | Albanes (sq) |
| Licencia | fine-tune-author-terms (otros terminos; ver pagina del fine-tune de Flutra) |
| Formato de pesos | Core ML compilado (.mlmodelc: MelSpectrogram, AudioEncoder, TextDecoder) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de OpenAI Whisper large-v3-turbo: un encoder que procesa espectrogramas Mel de 30 segundos y un decoder autorregresivo que genera tokens de texto, con un tokenizer BPE multilingue copiado sin cambios desde `openai/whisper-large-v3-turbo`. El fine-tune de Flutra se realizo sobre Mozilla Common Voice 19 en albanes (dataset `Kushtrim/common_voice_19_sq`, CC0 1.0). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de este repositorio es el empaquetado: conversion con `whisperkittools` de Argmax a tres submodelos Core ML compilados y compresion por palettizacion de 6 bits de los pesos del encoder y el decoder. El autor documento que una variante de 4 bits producia mas del 100 % de WER, por lo que 6 bits es el punto de equilibrio elegido. El tokenizer y los ficheros de configuracion se mantienen identicos a los del modelo base MIT.

## Capacidades

- Reconocimiento automatico del habla en albanes, con salida de texto y marcas de tiempo a nivel de palabra.
- Deteccion y forzado de idioma: el ejemplo de uso fija `language: "sq"` y desactiva la deteccion automatica.
- Segmentacion por VAD (deteccion de actividad de voz) para audio de larga duracion.
- Ejecucion totalmente en dispositivo sobre Core ML, sin llamadas de red.
- Integracion nativa con WhisperKit 1.1.1 en Swift para aplicaciones iOS y macOS.
- No soporta tool calling, function calling, agentes, vision, audio de entrada mas alla del ASR ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de voz a texto en apps iOS: la integracion con WhisperKit permite transcribir notas de voz y mensajes dictados en albanes dentro de la app, sin enviar audio a servidores externos.
- Subtitulado de reuniones y entrevistas: con marcas de tiempo por palabra y segmentacion VAD, el modelo genera subtitulos alineados temporalmente para contenido en albanes.
- Accesibilidad para hablantes de albanes: dictado y lectura de texto para usuarios con dificultades motoras o visuales, aprovechando que el modelo corre en el propio dispositivo.
- Procesamiento por lotes en macOS: el autor reporta un factor de tiempo real de aproximadamente 0,04 en un Mac de la serie M, lo que permite transcribir horas de audio en minutos en un portatil.
- Aplicaciones de campo sin conectividad: periodistas, trabajadores humanitarios o investigadores que recogen testimonios en zonas sin red pueden transcribir en local.
- Prototipado de ASR para idiomas de bajos recursos: el repositorio sirve de plantilla reproducible para llevar un fine-tune de Whisper a Core ML con palettizacion y evaluar el compromiso entre tamano y WER.

## Benchmarks y rendimiento

Evaluacion del autor sobre habla real en albanes: 7 hablantes, aproximadamente 7 minutos, WhisperKit 1.1.1, idioma forzado `sq`, marcas de tiempo por palabra, temperatura 0 con fallback, chunking VAD y sin prompt. WER y CER calculados tras minusculizar y eliminar puntuacion, conservando diacriticos.

| Modelo | WER global | WER en habla no vista (VoxForge) | WER en test de Common Voice | CER |
|---|---|---|---|---|
| Este modelo (Core ML 6 bits, 589 MB) | 11,3 % | 18,8 % | 2,8 % | 3,1 % |
| Whisper large-v3-turbo original (632 MB) | 42,8 % | 44,9 % | 40,3 % | 11,1 % |

El propio autor advierte que los clips de Common Voice pueden solaparse con la distribucion de entrenamiento del fine-tune, por lo que la columna de VoxForge (hablantes y grabaciones no vistos) es la cifra honesta: aproximadamente 19 % frente a 45 % de WER. El 99,8 % de las marcas de tiempo por palabra cayeron dentro de la ventana de frase correcta y el factor de tiempo real fue de aproximadamente 0,04 en un Mac de la serie M.

## Requisitos de hardware

- Inferencia en dispositivo Apple: el paquete esta pensado para Core ML, por lo que requiere hardware Apple (iPhone, iPad o Mac con Apple Silicon o GPU compatible con Core ML).
- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 0,6 GB y la variante pesa unos 589 MB, por lo que el consumo de memoria debe ser del orden de 1 GB o inferior durante la inferencia.
- GPU recomendadas: no disponible; el autor solo reporta pruebas en un Mac de la serie M.
- Cabe en hardware de consumo: si, en dispositivos Apple modernos; no se documenta soporte para GPU NVIDIA ni AMD.
- Opciones de despliegue: WhisperKit 1.1.1 (via Swift Package Manager) y Core ML; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: factor de tiempo real de aproximadamente 0,04 en un Mac de la serie M (es decir, unas 25 veces mas rapido que el tiempo real); no hay datos para iPhone.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER albanes (VoxForge) | Licencia | Formato |
|---|---|---|---|---|---|
| Fjale (este modelo) | 809 M (heredados) | 30 s por ventana | 18,8 % | fine-tune-author-terms | Core ML 6 bits |
| Whisper large-v3-turbo original | 809 M | 30 s por ventana | 44,9 % | MIT | safetensors, Core ML |
| Flutra/whisper-large-v3-turbo-sq-v2 (fine-tune de origen) | 809 M | 30 s por ventana | no disponible de forma independiente | terminos del autor | safetensors |
| Whisper large-v3 | 1.550 M | 30 s por ventana | no disponible | MIT | safetensors |

La comparacion con otros modelos ASR especificos para albanes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos del fine-tune pertenecen a Flutra y se rigen por los terminos de ese autor; este repositorio no concede licencia MIT ni ninguna otra sobre los pesos. La licencia MIT de OpenAI cubre solo el modelo base y el tokenizer.
- Uso comercial condicionado: es necesario revisar la pagina del fine-tune de Flutra antes de cualquier despliegue en produccion.
- Riesgo de alucinacion y errores en habla ruidosa: el WER sube al 18,8 % en habla no vista y no hay datos sobre condiciones acusticas adversas, acentos regionales o solapamiento de hablantes.
- Sesgo de dominio: el fine-tune se entreno con Common Voice 19, un corpus de lectura y donaciones voluntarias, lo que puede no representar habla espontanea, dialectos del sur o del norte, ni jerga tecnica.
- Un unico idioma y una unica variante: solo albanes; no hay soporte multilingue ni traduccion.
- Dependencia de la plataforma: el formato Core ML limita el despliegue a hardware Apple; no hay pesos GGUF ni safetensors en este repositorio.
- Compresion agresiva: la palettizacion de 6 bits es el minimo viable segun el autor; no se recomienda bajar a 4 bits.
- Sin garantias: el autor distribuye el paquete "tal cual", sin garantia de ningun tipo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/antonbanderi/fjale
- Fine-tune de origen: https://huggingface.co/Flutra/whisper-large-v3-turbo-sq-v2
- Modelo base OpenAI Whisper large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio OpenAI Whisper: https://github.com/openai/whisper
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- Dataset Common Voice 19 albanes: https://huggingface.co/datasets/Kushtrim/common_voice_19_sq
- Mozilla Common Voice: https://commonvoice.mozilla.org
