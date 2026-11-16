# Phoonnx/matcha-gl_es-icia_extended_phonemes_ljspeech-cotovia

## Resumen

`matcha-gl_es-icia_extended_phonemes_ljspeech-cotovia` es un modelo de síntesis de voz (text-to-speech) en gallego (código `gl-ES`) basado en la arquitectura Matcha-TTS. Lo desarrolla Proxecto Nós y lo empaqueta Phoonnx en formato ONNX para su uso con la librería `phoonnx`, un motor de TTS en Python que también se integra en el ecosistema OVOS (OpenVoiceOS). El modelo original es `proxectonos/Nos_TTS-icia-extended-matcha-phonemes-ljspeech`, y esta versión añade el empaquetado ONNX y el front-end de fonemización necesario para consumirlo desde Python.

La relevancia de esta ficha es acotada: se trata de un modelo pequeño (repo de 0,1 GB) y muy especializado, orientado exclusivamente a la síntesis de voz en gallego con el alfabeto y el fonemizador Cotovia. No es un modelo de lenguaje general ni compite en tareas de razonamiento o generación de texto. Su interés está en pipelines de voz para asistentes, lectores de pantalla o agentes conversacionales que necesiten una voz gallega empaquetada de forma portable (ONNX) y con licencia Apache 2.0.

La información pública disponible es escasa: la model card se limita a describir el empaquetado, el uso mediante `phoonnx`/`scriptconv` y la procedencia del modelo. No se han publicado detalles sobre el dataset de entrenamiento, el número de parámetros, la longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico de síntesis de voz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el modelo procesa fonemas de una frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | gallego (`gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Cotovia (alfabeto Cotovia) |
| Front-end de texto | `scriptconv` con `CotoviaPhonemizer` (extra `scriptconv[gl]`) |
| Tamano del repositorio | 0,1 GB |
| Libreria | `phoonnx` |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo se basa en Matcha-TTS, una arquitectura de síntesis de voz que combina un modelo acústico con un decodificador de flujo (flow matching) y un vocoder neuronal para generar la forma de onda. Esta familia de modelos se caracteriza por un entrenamiento más rápido y una inferencia ligera en comparación con los modelos autorregresivos de TTS, lo que la hace adecuada para despliegues en tiempo real o en dispositivos con recursos limitados.

El modelo original pertenece a Proxecto Nós y se distribuye como `proxectonos/Nos_TTS-icia-extended-matcha-phonemes-ljspeech`. Según la model card, el entrenamiento se realizó sobre el corpus LJSpeech (probablemente adaptado o combinado con datos del proyecto Icia) usando fonemas extendidos. No se dispone de información sobre el número de horas de audio, la composición exacta del dataset, el número de tokens ni si se aplicaron técnicas de RLHF o DPO (no aplicables en TTS de forma estándar). Tampoco se detalla si hubo innovaciones técnicas específicas más allá de la propia arquitectura Matcha-TTS.

El empaquetado de Phoonnx añade una capa de inferencia en ONNX y un front-end de texto basado en `scriptconv`, que normaliza el texto y lo convierte a fonemas Cotovia antes de pasarlo al modelo acústico.

## Capacidades

- Síntesis de voz en gallego (`gl-ES`) a partir de texto escrito en alfabeto Cotovia.
- Conversión de texto a fonemas mediante `CotoviaPhonemizer`, incluido en el extra `scriptconv[gl]`.
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecución en Python mediante la librería `phoonnx` y pesos ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio de entrada) porque no es un modelo de lenguaje.
- Capacidad multilingüe: únicamente gallego; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz en gallego: el modelo puede integrarse en OVOS como módulo TTS para que un asistente doméstico responda en gallego. Es adecuado por su empaquetado ligero (0,1 GB) y su integración directa mediante `ovos-tts-plugin-phoonnx`.
- Lectores de pantalla y accesibilidad: permite convertir texto gallego en audio para aplicaciones de accesibilidad, usando la API `synthesize_wav` para generar ficheros WAV reproducibles.
- Generación de audiolibros o contenido narrado: dado que el modelo sintetiza frases a partir de texto fonemizado, se puede usar en pipelines por lotes que procesen capítulos y generen pistas de audio en gallego.
- Locuciones para aplicaciones móviles o web: al distribuirse en ONNX, puede ejecutarse en entornos Python sin dependencias pesadas de frameworks de deep learning, lo que facilita su inclusión en backends de aplicaciones.
- Sistemas de anuncios públicos o información al ciudadano: administraciones gallegas podrían generar avisos de voz en gallego de forma automatizada con una licencia Apache 2.0 que permite uso comercial.
- Prototipado de investigación en TTS para lenguas minorizadas: sirve como base para experimentos de fonemización, normalización de texto o ajuste fino de voces en gallego, al estar empaquetado y ser reproducible desde `phoonnx`.
- Integración en chatbots conversacionales con salida de voz: combinado con un LLM y un ASR, el modelo puede cerrar el bucle de voz en gallego en un pipeline de agente, aunque el modelo en sí no gestiona el diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en memoria de CPU sin necesidad de GPU.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, no requiere GPU de gama alta; una GPU consumer (por ejemplo, RTX 3060 o superior) sería más que suficiente, aunque no se documenta.
- ¿Cabe en GPU consumer? Sí, por el tamaño (0,1 GB) es altamente probable que quepa en cualquier GPU consumer moderna, e incluso en CPU.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecución de pesos ONNX mediante el runtime que use `phoonnx`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo |
|---|---|---|---|---|---|
| Phoonnx/matcha-gl_es-icia_extended_phonemes_ljspeech-cotovia | Matcha-TTS | gallego (gl-ES) | Apache 2.0 | ONNX | 0,1 GB |
| proxectonos/Nos_TTS-icia-extended-matcha-phonemes-ljspeech | Matcha-TTS | gallego | Apache 2.0 (según la model card) | no disponible | no disponible |
| Otros modelos de la colección Matcha-TTS de Phoonnx | Matcha-TTS | varias lenguas | variable | ONNX | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a aspectos de arquitectura, licencia y formato.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en TTS en gallego; no realiza generación de texto, razonamiento, código ni tareas de lenguaje general.
- Requiere texto de entrada en alfabeto Cotovia y el fonemizador `CotoviaPhonemizer`; un texto mal normalizado o fuera de ese alfabeto puede producir una síntesis incorrecta.
- No se documentan sesgos conocidos, pero al entrenarse sobre un corpus concreto (LJSpeech/Icia) puede reflejar las características de las voces y el estilo de ese corpus.
- Riesgo de alucinación en el sentido de TTS: puede generar pronunciaciones incorrectas o artefactos acústicos en palabras fuera del vocabulario o en nombres propios.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo upstream y de los datos de entrenamiento originales antes de un despliegue en producción.
- No hay información pública sobre el número de parámetros, el dataset exacto ni métricas de calidad (MOS, WER), lo que dificulta evaluar su calidad frente a alternativas.
- El modelo se distribuye como ONNX y depende de la librería `phoonnx` (en estado `--pre` según la model card), lo que implica posibles cambios de API.
- Solo se documenta el idioma gallego; no se garantiza un comportamiento correcto en castellano ni en otras lenguas.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-gl_es-icia_extended_phonemes_ljspeech-cotovia
- Modelo upstream: https://huggingface.co/proxectonos/Nos_TTS-icia-extended-matcha-phonemes-ljspeech
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
