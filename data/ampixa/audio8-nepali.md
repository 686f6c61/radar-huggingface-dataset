# ampixa/audio8-nepali

## Resumen

Audio8-nepali es un modelo de síntesis de voz (text-to-speech) desarrollado por ampixa, que consiste en un ajuste fino (fine-tune) para nepalí del modelo Audio8 TTS, concretamente a partir del checkpoint wave1 (ckpt6000). El modelo base es Audio8-TTS-Preview-0.1b, de arquitectura arktts, y el resultado es un sistema de TTS especializado en el idioma nepalí, una lengua con escasa representación en el ecosistema de modelos de voz open source.

Con aproximadamente 169,8 millones de parámetros, se trata de un modelo ligero y accesible para hardware de consumo, lo que lo hace relevante para desarrolladores que necesitan generar voz en nepalí sin depender de servicios de pago ni de modelos de gran tamaño. Su relevancia radica en la escasez de alternativas open source para este idioma, aunque conviene destacar que la propia model card advierte que los datos de entrenamiento se recopilaron sin licencia ni consentimiento, lo que restringe el uso del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | arktts (text-to-speech) |
| Parametros totales | 169.779.904 (~0,17 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nepalí (ne) |
| Licencia | Other (Audio8 Community License v1.0 para los pesos; Apache-2.0 para el codigo) |
| Formato de pesos | safetensors (tamano del repo: 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Audio8-TTS-Preview-0.1b, un modelo de sintesis de voz con arquitectura arktts, y se ajusta finamente para el nepalí utilizando el checkpoint wave1 en el paso 6000 (ckpt6000). No se han publicado detalles tecnicos sobre la arquitectura interna (tipo de attention, vocoder, tokenizacion de audio) ni sobre el proceso de entrenamiento concreto (numero de pasos, hardware, hiperparametros) en la informacion disponible.

En cuanto a los datos, la model card del autor indica de forma explicita que el conjunto de datos de entrenamiento fue recopilado sin licencia ni consentimiento, y que por ello el checkpoint esta restringido. No se dispone de informacion sobre el volumen de datos ni sobre tecnicas de alineamiento posteriores.

## Capacidades

- Sintesis de voz (text-to-speech) en nepalí a partir de texto escrito.
- Modelo ligero (~170 M de parametros), apto para inferencia en hardware modesto.
- Pesos distribuidos en formato safetensors.
- No consta soporte de tool calling, agentes, vision, audio de entrada (ASR) ni otras modalidades: se trata de un modelo TTS especializado.

## Casos de uso

- Locucion de contenido educativo en nepalí: generación de audio para cursos, tutoriales o material didactico dirigido a hablantes de nepalí, aprovechando que es uno de los pocos modelos TTS open source para este idioma.
- Lectores de pantalla y accesibilidad: integracion en herramientas de asistencia para usuarios con discapacidad visual que consumen contenido en nepalí, dado su bajo consumo de recursos.
- Asistentes de voz locales: despliegue en dispositivos con GPU de consumo o incluso CPU como componente de voz de un asistente conversacional en nepalí.
- Produccion de podcasts o noticias automatizadas: conversion de articulos o boletines de texto a audio en nepalí para canales de difusion.
- Prototipado de aplicaciones de voz para Nepal: base ligera para desarrolladores que construyen IVR (sistemas de respuesta de voz interactiva) o notificaciones de audio.
- Investigacion en TTS de lenguas de bajos recursos: punto de partida para estudios o ajustes finos adicionales sobre nepalí, dada la escasez de modelos comparables abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para un modelo TTS, las metricas habituales (WER de resintesis, MOS, SIM-O) no constan en la model card ni en los metadatos.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~170 M de parametros y 1,7 GB de pesos, se estima que basta con 2-4 GB de VRAM (estimacion basada en el tamano del repo; no hay cifra oficial).
- GPU recomendadas: cualquier GPU moderna de gama media o baja; por su tamano, una RTX 3060 de 12 GB o incluso GPUs de 4-6 GB deberian ser suficientes (estimacion).
- Cabe con holgura en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, etc. Es plausible que funcione tambien en CPU dada su escala, aunque no hay confirmacion.
- Opciones de despliegue: no disponible de forma explicita. Al usar custom_code y arquitectura arktts, probablemente requiera el codigo del repositorio de GitHub del autor; no consta compatibilidad verificada con vLLM, llama.cpp, Ollama o TGI (orientados a LLM, no a TTS).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ampixa/audio8-nepali | TTS | ~170 M | nepalí | Audio8 Community License v1.0 (restringido) | Hugging Face (safetensors) |
| Coqui XTTS-v2 | TTS multilingue | ~750 M | 17 idiomas (nepalí no incluido) | Coqui Public Model License (no comercial sin permiso) | Hugging Face |
| Meta MMS-TTS | TTS | ~no disponible por variante | >1.100 idiomas, incluido nepalí | CC-BY-NC 4.0 | Hugging Face |

Nota: MMS-TTS de Meta es la alternativa mas directa al cubrir nepalí, aunque con licencia no comercial. No hay datos de rendimiento comparativos publicados entre estos modelos.

## Limitaciones y advertencias

- Origen de los datos: la model card declara que los datos de entrenamiento se recopilaron sin licencia ni consentimiento, lo que plantea riesgos legales y eticos significativos para cualquier uso, especialmente comercial.
- Licencia restringida: los pesos derivan de Audio8-TTS-Preview-0.1b bajo la Audio8 Community License v1.0 y el checkpoint esta explicitamente restringido; revisa el README del repositorio antes de cualquier despliegue.
- Riesgo de calidad variable: al ser un fine-tune de un modelo "preview" (0.1b) en un paso temprano (ckpt6000), la estabilidad y naturalidad de la voz no estan verificadas con metricas publicas.
- Idioma unico: solo soporta nepalí; no sirve para otros idiomas.
- Codigo personalizado: el modelo requiere custom_code, lo que implica ejecutar codigo de terceros y puede complicar la integracion en entornos de produccion seguros.
- Metricas de calidad no disponibles: no hay benchmarks (WER, MOS) publicados, por lo que conviene evaluarlo internamente antes de usarlo en produccion.
- Adopcion minima: con 33 descargas y 1 like, no existe comunidad de soporte ni historial de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampixa/audio8-nepali
- Repositorio de GitHub del proyecto: https://github.com/Ampixa/audio8-tts-nepali
