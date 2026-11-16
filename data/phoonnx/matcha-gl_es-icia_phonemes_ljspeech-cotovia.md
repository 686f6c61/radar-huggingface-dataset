# Phoonnx/matcha-gl_es-icia_phonemes_ljspeech-cotovia

## Resumen

matcha-gl_es-icia_phonemes_ljspeech-cotovia es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Matcha-TTS, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo genera audio en gallego (`gl-ES`) a partir de fonemas en alfabeto Cotovia, lo que lo convierte en una pieza especifica dentro del ecosistema de voces gallegas para asistentes y aplicaciones de sintesis.

El modelo no es un LLM ni un modelo de lenguaje: es un acoustic model de TTS que transforma una secuencia de fonemas en un espectrograma mel, que posteriormente se convierte en audio mediante un vocoder (habitualmente HiFi-GAN en la familia Matcha). Su relevancia radica en que ofrece una via de despliegue en ONNX para una voz gallega con licencia Apache-2.0, integrable en Python y en el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

El repositorio es pequeno (0,1 GB) y esta pensado para inferencia ligera. La entrada de texto no es texto libre directo: phoonnx delega la normalizacion y fonemizacion en `scriptconv` con el fonemizador `CotoviaPhonemizer`, de modo que el modelo recibe fonemas Cotovia ya preparados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acustico flow-matching, familia Matcha) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo no detalla variantes de cuantizacion) |
| Idiomas soportados | gallego (`gl`, `gl-ES`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (libreria `phoonnx`) |
| Entrada de texto | fonemas Cotovia (alfabeto Cotovia) |
| Upstream | proxectonos/Nos_TTS-icia-matcha-phonemes-ljspeech |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha-TTS, un modelo acustico de sintesis neuronal basado en flow matching sobre un decoder tipo transformer, disenado para generar espectrogramas mel de forma rapida y con pocos pasos de muestreo. Matcha-TTS se caracteriza por un encoder de texto/fonemas y un decoder de duracion y flujo que produce el mel, que despues se sintetiza con un vocoder externo. El empaquetado de Phoonnx exporta el modelo a ONNX para su ejecucion en la libreria `phoonnx`.

El modelo deriva del checkpoint `proxectonos/Nos_TTS-icia-matcha-phonemes-ljspeech`, entrenado por Proxecto Nós sobre el corpus Icia con fonemas y alineado con el esquema LJSpeech. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF/DPO (no aplicables en un modelo acustico de TTS). Tampoco se documentan innovaciones adicionales mas alla del propio paradigma Matcha y del front-end de fonemizacion Cotovia.

## Capacidades

- Sintesis de voz en gallego (`gl-ES`) a partir de fonemas Cotovia.
- Generacion de audio WAV mediante `voice.synthesize_wav(text, wav_file)` en la API de phoonnx.
- Normalizacion y fonemizacion de texto delegadas en `scriptconv` (fonemizador `CotoviaPhonemizer`).
- Integracion con OVOS como plugin `ovos-tts-plugin-phoonnx`.
- Inferencia en ONNX, apta para despliegue ligero en CPU/GPU.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en gallego con OVOS: el modelo se selecciona en `mycroft.conf` mediante `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en `gl-ES` a partir de texto normalizado por `scriptconv`.
- Lectura de contenido web o documentos en gallego: se puede integrar en un pipeline que tome texto, lo normalice y fonemice con `CotoviaPhonemizer` y genere WAV para reproduccion o descarga.
- Accesibilidad y lectura de pantalla: sintesis de voz para usuarios gallegoparlantes con discapacidad visual, ejecutandose en ONNX con requisitos de hardware modestos.
- Generacion de audiolibros o narraciones: el modelo permite sintetizar frases largas por lotes, aunque la calidad y prosodia dependen del front-end Cotovia y del vocoder asociado.
- Sistemas de anuncios y megafonia: generacion de avisos pregrabados en gallego para transporte, aeropuertos o comercios, con despliegue local sin dependencia de servicios en la nube.
- Prototipado de interfaces conversacionales: al ser un repo de 0,1 GB y formato ONNX, es adecuado para pruebas rapidas en entornos de desarrollo y CI antes de escalar a un servicio de produccion.
- Investigacion en TTS para lenguas minorizadas: sirve como punto de partida reproducible para experimentos de prosodia y fonemizacion en gallego con licencia Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repo de 0,1 GB sugiere un modelo ligero, pero no se confirma el consumo exacto.
- GPU recomendadas: no disponible; al ejecutarse en ONNX puede correr en CPU y en GPU consumer, pero no se documentan modelos concretos.
- Compatibilidad con GPU consumer: probable por el tamano del repo, aunque no confirmado en la informacion disponible.
- Opciones de despliegue: `phoonnx` (Python) y `ovos-tts-plugin-phoonnx` (OVOS). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| matcha-gl_es-icia_phonemes_ljspeech-cotovia | Matcha-TTS | gallego | no aplica | Apache-2.0 | ONNX | Hugging Face (Phoonnx) |
| proxectonos/Nos_TTS-icia-matcha-phonemes-ljspeech | Matcha-TTS | gallego | no aplica | Apache-2.0 | no disponible | Hugging Face (upstream) |
| Otras voces Matcha-TTS de la coleccion Phoonnx | Matcha-TTS | varios | no aplica | segun modelo | ONNX | Hugging Face (coleccion Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta gallego (`gl-ES`); no es multilingue.
- Requiere texto de entrada en fonemas Cotovia; el uso directo de texto libre depende de `scriptconv` y del fonemizador `CotoviaPhonemizer`.
- No es un modelo de lenguaje: no razona, no genera codigo ni responde preguntas; cualquier expectativa de LLM es incorrecta.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero pueden aparecer errores de pronunciacion o prosodia ante fonemizaciones incorrectas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del checkpoint upstream y del vocoder utilizado.
- No se documentan sesgos especificos ni limitaciones de contexto; al ser TTS, el limite practico es la longitud de la secuencia de fonemas que el modelo acepte.
- El repo tiene solo 19 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es muy limitada.
- No se especifican parametros, cuantizaciones ni requisitos de hardware, lo que dificulta planificar un despliegue en produccion sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-gl_es-icia_phonemes_ljspeech-cotovia
- Upstream: https://huggingface.co/proxectonos/Nos_TTS-icia-matcha-phonemes-ljspeech
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
