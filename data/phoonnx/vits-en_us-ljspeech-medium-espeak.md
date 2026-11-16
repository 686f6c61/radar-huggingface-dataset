# Phoonnx/vits-en_us-ljspeech-medium-espeak

## Resumen

`vits-en_us-ljspeech-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original procede de Rhasspy, concretamente de la colección `piper-voices` en la ruta `en/en_US/ljspeech/medium`, y emplea el corpus LJSpeech como base de entrenamiento. Su función es convertir texto en inglés estadounidense en audio inteligible mediante un front-end fonémico basado en espeak-ng.

La relevancia de este empaquetado reside en su formato: pesos ONNX listos para ejecutarse con la librería `phoonnx`, lo que facilita su integración en aplicaciones Python y en el ecosistema OVOS (OpenVoiceOS) mediante el plugin `ovos-tts-plugin-phoonnx`. El repositorio ocupa aproximadamente 0,1 GB, lo que lo sitúa en la categoría de modelos ligeros aptos para despliegue en CPU y dispositivos de recursos limitados.

Se trata de un modelo monolingüe (solo `en-US`), con entrada de texto convertida a fonemas IPA mediante espeak-ng, y licencia MIT heredada del proyecto upstream. No es un modelo de propósito general ni un LLM: es un componente especializado de un pipeline TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | `en-US` (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | `phoonnx` (Python), `phoonnx.js` (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador variacional (VAE), un prior normalizing flow, un decoder generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. El modelo genera waveform directamente a partir de fonemas, sin necesidad de un vocoder externo separado, lo que simplifica el pipeline de inferencia. La variante `medium` de Piper corresponde a un compromiso entre calidad y velocidad dentro de la escala de voces de Rhasspy.

El entrenamiento original se realizó sobre el corpus LJSpeech, un dataset público de audio en inglés estadounidense de una única hablante femenina, ampliamente utilizado como referencia en TTS. No se dispone en la información proporcionada del número exacto de tokens, horas de audio, composición detallada del dataset ni de si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente a TTS). El empaquetado de Phoonnx no reentrena el modelo: solo lo convierte a ONNX y lo integra con su front-end fonémico.

La innovación destacable de este empaquetado es la integración con `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA mediante `EspeakPhonemizer`. El autor advierte que la variante `espyak` (port de espeak-ng en Python) puede diferir en algunos fonemas respecto a espeak-ng nativo, lo que puede provocar pronunciaciones incorrectas en ciertas palabras.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (`en-US`).
- Generación de audio WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Front-end fonémico basado en espeak-ng con alfabeto IPA.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling ni function calling (no es un LLM).
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio de entrada ni modo thinking.
- Monolingüe: no hay capacidades multilingües más allá del inglés estadounidense.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS seleccionable en `mycroft.conf` mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en inglés en asistentes domésticos autoalojados.
- Lectura de notificaciones y alertas: dado su tamaño reducido (~0,1 GB) y ejecución ONNX, puede sintetizar mensajes cortos en tiempo real en dispositivos de bajos recursos como Raspberry Pi.
- Síntesis en aplicaciones Python de escritorio: mediante `TTSModelManager` y `voice.synthesize_wav`, se puede generar audio para tutoriales, audiolibros o accesibilidad sin depender de servicios en la nube.
- Síntesis en navegador: con `phoonnx.js`, el modelo puede ejecutarse en el cliente para lectura de contenido web o interfaces de accesibilidad, evitando enviar texto a servidores externos.
- Prototipado de pipelines TTS: sirve como voz de referencia para comparar latencia y calidad frente a otras voces Piper en fase de desarrollo.
- Generación de audio para pruebas automatizadas: al ser determinista y ligero, es adecuado para tests de integración de sistemas que consumen audio sintético.
- Accesibilidad en aplicaciones web: lectura en voz alta de contenido en inglés estadounidense para usuarios con discapacidad visual, ejecutándose localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (~0,1 GB) y la arquitectura VITS `medium`, la inferencia cabe holgadamente en memoria de CPU y en GPUs de gama baja.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU mediante ONNX Runtime. GPUs como RTX 3060 o superiores no son necesarias pero pueden reducir latencia.
- Cabe en GPU consumer: sí, con amplio margen; también en dispositivos embebidos y Raspberry Pi.
- Opciones de despliegue: `phoonnx` (Python, con extra `phoonnx[espeak]`), `phoonnx.js` (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Requisito adicional: espeak-ng instalado en el sistema (por ejemplo `apt install espeak-ng`) o la alternativa `espyak` mediante el extra de pip.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto/entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `vits-en_us-ljspeech-medium-espeak` (este) | VITS medium | en-US | Fonemas espeak IPA | MIT | ONNX | Hugging Face (Phoonnx) |
| `rhasspy/piper-voices` en_US ljspeech medium | VITS medium | en-US | Fonemas espeak | MIT | ONNX (upstream) | Hugging Face (Rhasspy) |
| Otras voces Piper `en_US` (p. ej. lessac, amy) | VITS (varias calidades) | en-US | Fonemas espeak | MIT | ONNX | Hugging Face (Rhasspy) |

La comparativa se limita al ecosistema Piper/Rhasspy porque no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada. La diferencia principal de este empaquetado frente al upstream es la integración con `phoonnx` y `scriptconv`, no el modelo en sí.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza inglés estadounidense; no admite otros idiomas.
- Dependencia de espeak-ng: sin él instalado, la fonemización falla o requiere `espyak`, cuyos fonemas pueden diferir y producir pronunciaciones erróneas.
- Calidad limitada por el corpus LJSpeech: una única hablante femenina, lo que restringe la variedad de voces y estilos.
- No es un LLM: no razona, no genera código ni texto; cualquier expectativa en ese sentido es incorrecta.
- Riesgo de prosodia incorrecta en textos con abreviaturas, números o nombres propios no cubiertos por la normalización de `scriptconv`.
- Sin datos publicados de benchmarks, latencia ni throughput: no se puede garantizar un rendimiento concreto en producción sin medición previa.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la cadena de atribución hasta Rhasspy y el corpus LJSpeech.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema pequeño, menor soporte comunitario.
- El modelo card advierte explícitamente sobre posibles errores de pronunciación con `espyak` frente a espeak-ng nativo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ljspeech-medium-espeak
- Upstream Piper voices: https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ljspeech/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
