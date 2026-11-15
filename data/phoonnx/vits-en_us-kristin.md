# Phoonnx/vits-en_us-kristin

## Resumen

vits-en_us-kristin es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por agentvibe y empaquetado por Phoonnx para su librería de TTS sobre ONNX. El modelo genera audio en inglés estadounidense (`en-US`) a partir de texto, utilizando fonemas espeak como representación intermedia de entrada. Su relevancia radica en que ofrece una voz concreta (identificada como "kristin") en un formato ligero y portable (ONNX, repositorio de 0,1 GB) que puede ejecutarse tanto en Python como en el ecosistema OVOS y en el navegador mediante phoonnx.js.

El modelo no es un LLM ni un sistema multimodal general: es un sintetizador neuronal de voz de un único hablante, pensado para integrarse en asistentes de voz, pipelines de accesibilidad o aplicaciones de lectura en voz alta. Su licencia Apache 2.0 y su reducido tamaño lo hacen adecuado para despliegues en entornos con recursos limitados, incluidos dispositivos de borde.

La ficha se basa exclusivamente en la información publicada en la model card y en los metadatos de Hugging Face; los datos no disponibles se indican explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es una frase en `en-US`) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | `en-US` (ingles estadounidense) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Autor original | agentvibe |
| Empaquetado por | Phoonnx |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Descargas | 30 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional y un decoder generativo entrenado con aprendizaje adversarial, lo que permite generar waveforms directamente desde la secuencia de fonemas sin necesidad de un vocoder externo separado. La model card no detalla el número de parámetros, el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino; estos datos no están disponibles.

La innovación relevante en este empaquetado es la integración con el front-end de texto de phoonnx: el texto se normaliza mediante la librería `scriptconv`, que aplica el fonemizador `EspeakPhonemizer` (del módulo `scriptconv.phonemizers.mul`) para convertir el texto en fonemas espeak en alfabeto IPA antes de alimentar el modelo. La model card advierte que el uso del port `espyak` de espeak-ng (instalable con `phoonnx[espeak]`) puede producir diferencias fonéticas respecto a espeak-ng nativo, lo que puede provocar pronunciaciones incorrectas en algunas palabras; por ello se recomienda instalar espeak-ng del sistema.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (`en-US`).
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)`.
- Entrada basada en fonemas espeak (IPA), lo que permite control preciso de la pronunciación si se proporcionan fonemas directamente.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js, con soporte de entrada por espeak o Unicode.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es exclusivamente un sintetizador TTS.
- Capacidad multilingüe limitada a `en-US`; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite dotar de voz a un asistente doméstico local sin depender de servicios en la nube, gracias a su tamaño reducido y licencia permisiva.
- Lectura en voz alta de contenido web o documentos: el modelo puede sintetizar frases en `en-US` para aplicaciones de accesibilidad, convirtiendo texto en audio WAV de forma local y con baja latencia esperada por el tamaño del modelo.
- Síntesis en el navegador: mediante phoonnx.js, la voz puede ejecutarse en el cliente para aplicaciones web que necesiten TTS sin backend, usando la demo disponible en tigregotico.pt/demo como referencia.
- Generación de avisos y notificaciones por voz: en sistemas embebidos o de borde, el modelo puede producir mensajes hablados cortos (alertas, recordatorios) con un consumo de recursos mínimo.
- Prototipado de pipelines TTS: investigadores y desarrolladores pueden usar esta voz como componente de referencia en experimentos de conversión texto-a-voz, comparándola con otras voces VITS del catálogo de Phoonnx.
- Integración en aplicaciones de lectura de subtítulos o audiolibros ligeros: al aceptar fonemas IPA, permite ajustar pronunciaciones concretas en flujos donde la precisión fonética es importante.
- Pruebas de integración continua de sistemas de voz: al ser un modelo ONNX pequeño, puede incorporarse en tests automatizados que verifiquen la generación de audio sin requerir GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MOS, WER, MCD), latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) se espera que quepa en memoria de CPU y en GPUs de gama baja, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable dada la arquitectura VITS y el tamaño, pero no confirmado en la información proporcionada.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_us-kristin (este modelo) | VITS | en-US | ONNX | Apache 2.0 | Fonemas espeak (IPA) | Hugging Face (Phoonnx) |
| Otras voces VITS de la colección Phoonnx | VITS | Variable (no detallado) | ONNX | Variable (no detallado) | Fonemas espeak | Colección VITS de Phoonnx en Hugging Face |
| agentvibes/piper-custom-voices (upstream) | VITS (Piper) | en-US y otras | No detallado | Apache 2.0 | Fonemas espeak | Hugging Face (agentvibes) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas para una comparación cuantitativa; la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo solo soporta inglés estadounidense (`en-US`); no se declaran otros idiomas.
- La calidad de pronunciación depende del fonemizador: el uso de `espyak` en lugar de espeak-ng nativo puede producir errores en algunas palabras, según advierte la model card.
- No se han publicado métricas de calidad (MOS, WER) ni evaluaciones de sesgos; se desconoce el comportamiento en dominios especializados (nombres propios, siglas, términos técnicos).
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de pronunciación incorrecta o entonación inadecuada en frases ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero la model card delega la declaración de licencia al repositorio upstream (agentvibes/piper-custom-voices); conviene verificar dicha declaración antes de un despliegue comercial.
- El modelo tiene un número muy bajo de descargas (30) y ningún "like", lo que sugiere poca validación por parte de la comunidad; no hay evidencia de uso en producción a gran escala.
- No se especifican límites de longitud de texto por llamada; la API de ejemplo sintetiza una frase, por lo que textos largos requerirán segmentación manual.
- No se dispone de información sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos de hablante o de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-kristin
- Repositorio upstream (agentvibes/piper-custom-voices): https://huggingface.co/agentvibes/piper-custom-voices
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
