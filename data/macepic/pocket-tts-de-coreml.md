# MacEpic/pocket-tts-de-coreml

## Resumen

Pocket TTS German for Core ML es una conversión a formato Core ML del modelo de síntesis de voz Pocket TTS de Kyutai, en su variante para alemán. El modelo original es un sistema de text-to-speech de aproximadamente 100 millones de parámetros, descrito por Kyutai como un Continuous Audio Language Model capaz de generar audio más rápido que el tiempo real en CPU. Esta versión concreta ha sido exportada por MacEpic para su uso en TextSniper, una aplicación de macOS, mediante la herramienta xn-ptts 0.6.0.

La relevancia de esta ficha radica en que ilustra el patrón de despliegue en local de modelos TTS de tamano reducido mediante Core ML, el framework de Apple para ejecutar modelos en hardware de la compania (CPU, GPU y Neural Engine). El repositorio incluye los pesos convertidos, el tokenizador y cuatro voces predefinidas empaquetadas en formato `emb`, lo que permite su uso directo sin clonación de voz.

El modelo base es `kyutai/pocket-tts-without-voice-cloning`, en concreto el subdirectorio `languages/german`, que corresponde a una arquitectura de seis capas. La conversión no modifica los pesos, solo el formato, y conserva la licencia CC BY 4.0 del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con cabecera flow de un paso y cabecera de fin de habla (Continuous Audio Language Model) |
| Parametros totales | aproximadamente 100 M (modelo base Pocket TTS); variante alemana de seis capas |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportados a Core ML; el repo no detalla precisiones) |
| Idiomas soportados | aleman (de) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (bundle con `bundle.json` que lista 15 ficheros, 398.574.273 bytes en total); voces en formato `emb` de xn-ptts |

## Arquitectura y entrenamiento

El modelo base Pocket TTS es un Continuous Audio Language Model: un transformer causal que emite un latente de audio continuo por frame a una tasa de 12,5 Hz, procesado por una cabecera flow de un solo paso, mientras que una cabecera separada de fin de habla decide cuando detener la generacion. Esta diseno sustituye la decodificacion autoregresiva de tokens discretos por latentes continuos, lo que reduce el coste computacional y permite inferencia en tiempo real sobre CPU. La variante alemana empleada aqui es el modelo de seis capas alojado en `languages/german` del repositorio de Kyutai.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre si se aplicaron tecnicas de RLHF o DPO en el modelo original. La model card de esta conversion indica que los pesos y el tokenizador son los de Kyutai sin cambios, salvo la conversion de formato realizada con el ejemplo `export_coreml` de xn-ptts 0.6.0. Las voces incluidas se generaron con el codificador de voz de `kyutai/pocket-tts` a partir de grabaciones de `kyutai/tts-voices`, recortadas de silencio y con el token `bos_before_voice` antepuesto.

## Capacidades

- Sintesis de voz (text-to-speech) en aleman a partir de texto plano.
- Generacion de audio mas rapida que el tiempo real en CPU, segun las caracteristicas del modelo base.
- Cuatro voces predefinidas: estelle (CC0), alba (CC BY 4.0), anna (CC BY 4.0) y bill (CC0).
- Ejecucion en local mediante Core ML, sin dependencia de servicios en la nube.
- Integracion en aplicaciones macOS a traves del runtime de Core ML (CPU, GPU y Neural Engine).
- No soporta clonacion de voz: el modelo base es explicitamente la variante `without-voice-cloning`.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Lectura de texto en voz alta en aplicaciones macOS: TextSniper descarga este bundle cuando el usuario selecciona Pocket TTS para aleman, de modo que la sintesis se ejecuta en el dispositivo sin enviar el texto a un servidor.
- Accesibilidad para usuarios con discapacidad visual: integracion en lectores de pantalla o utilidades de dictado inverso que necesitan una voz alemana de baja latencia y funcionamiento offline.
- Procesamiento por lotes de documentos en aleman: conversion de articulos, informes o correos a audio en pipelines locales, aprovechando que el modelo corre mas rapido que el tiempo real en CPU.
- Prototipado de asistentes conversacionales en aleman: uso del modelo como capa TTS dentro de un pipeline mayor (ASR, LLM, TTS) en el que la privacidad exige ejecucion local.
- Generacion de material de aprendizaje de idiomas: sintesis de frases y vocabulario en aleman con varias voces (masculinas y femeninas) para ejercicios de escucha.
- Pruebas de integracion de Core ML: el bundle y su `bundle.json` con tamanos y hashes SHA-256 sirven como referencia para validar flujos de exportacion e importacion de modelos TTS en el ecosistema Apple.
- Evaluacion comparativa de TTS en dispositivos: al ser una conversion directa del modelo de Kyutai, permite medir latencia y calidad en hardware Apple frente a otras alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el bundle completo ocupa 398.574.273 bytes (aproximadamente 0,4 GB), por lo que la huella de memoria es reducida y compatible con equipos de gama consumer.
- GPU recomendadas: al ser un modelo Core ML, esta pensado para hardware Apple (CPU, GPU integrada y Neural Engine de los chips de la serie M). No se documenta soporte para GPU NVIDIA.
- Cabe en GPU consumer: si, en cualquier Mac con chip Apple Silicon; el tamano del bundle es inferior a 0,5 GB.
- Opciones de despliegue: runtime de Core ML en macOS; la herramienta xn-ptts 0.6.0 puede leer el bundle. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: el modelo base se describe como mas rapido que el tiempo real en CPU; no se proporcionan cifras concretas para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MacEpic/pocket-tts-de-coreml | aprox. 100 M (6 capas en variante alemana) | no disponible | aleman | CC BY 4.0 | Core ML |
| kyutai/pocket-tts-without-voice-cloning | aprox. 100 M | no disponible | multiple (incluye aleman) | CC BY 4.0 | safetensors (formato original de Kyutai) |
| smdesai/pocket-tts-coreml | aprox. 100 M | no disponible | no disponible | no disponible | Core ML |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion disponible no incluye datos de rendimiento ni de otros sistemas TTS comparables.

## Limitaciones y advertencias

- Solo soporta aleman; no es multilingue.
- No permite clonacion de voz: es la variante `without-voice-cloning` del modelo base.
- La calidad de las voces depende de las grabaciones de origen (VCTK, LibriVox, Voice-Zero y grabaciones de Kyutai); los sesgos de esos corpus (acento, registro, genero) pueden reflejarse en la sintesis.
- Riesgo de errores de pronunciacion en nombres propios, siglas y terminos tecnicos, comun en sistemas TTS sin lexico especifico.
- La licencia CC BY 4.0 exige atribucion a Kyutai y a las fuentes de las voces (CC0 o CC BY 4.0 segun la voz) en cualquier uso, incluido el comercial.
- El modelo esta empaquetado para Core ML y depende del ecosistema Apple; no es portable a otros runtimes sin una nueva conversion.
- No se documentan datos de entrenamiento ni evaluaciones de calidad, por lo que no es posible estimar su robustez en dominios especializados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MacEpic/pocket-tts-de-coreml
- Modelo base: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Modelo original con clonacion de voz: https://huggingface.co/kyutai/pocket-tts
- Blog de Kyutai sobre Pocket TTS: https://kyutai.org/blog/2026-01-13-pocket-tts
- Documentacion de Pocket TTS en Transformers: https://huggingface.co/docs/transformers/main/en/model_doc/pocket_tts
- Herramienta de conversion xn-ptts: https://github.com/gradium-ai/xn-ptts
- Voces de origen: https://huggingface.co/kyutai/tts-voices
- Corpus VCTK: https://datashare.ed.ac.uk/handle/10283/3443
- Voice-Zero: https://github.com/OwenTyme/voice-zero
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Conversion Core ML alternativa: https://huggingface.co/smdesai/pocket-tts-coreml
