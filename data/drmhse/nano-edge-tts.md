# drmhse/nano-edge-tts

## Resumen

nano-edge-tts es un decodificador de síntesis de voz desarrollado por drmhse que sustituye el decodificador de waveform de Kokoro-82M por dos redes convolucionales muy pequeñas (1,75 millones de parámetros en total) que operan a 80 y 160 tramas por segundo en lugar de a la frecuencia de muestreo de audio. El modelo conserva intacta la parte de texto de Kokoro (pronunciación, timing, pitch y todas las voces), de modo que se integra como un reemplazo directo del decodificador original dentro del pipeline de Kokoro.

El problema que resuelve es el coste computacional del decodificado neural a frecuencia de audio en TTS ligeros: Kokoro-82M dedica 53,3 millones de parámetros a su decodificador y consume entre 1,4 y 1,7 GB de memoria pico en el pipeline completo. nano-edge-tts reduce el decodificador a 1,75 M de parámetros (7 MB en disco) y baja la memoria pico a 0,75 GB, manteniendo una calidad de voz cercana a la del modelo original según las métricas publicadas por el autor.

La relevancia actual está en el despliegue en el borde: con un factor de tiempo real de 0,0042 en el decodificador (33 veces más rápido que Kokoro en un hilo de CPU) y 0,0127 en el pipeline completo de fonemas a audio sobre un Apple M4, el modelo habilita TTS de calidad aceptable en dispositivos sin GPU dedicada. La licencia Apache 2.0 y el formato safetensors facilitan su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador harmonic-plus-noise con dos redes ConvNeXt (mapper y renderer) sobre excitación de tren de pulsos y ruido blanco; síntesis final mediante dos STFT inversas |
| Parametros totales | 30,2 M en el pipeline completo (1.749.643 en el decodificador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS; la longitud se mide en fonemas por utterance) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | Inglés (americano y británico, códigos `a` y `b` de Kokoro) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`nano-edge-tts.safetensors` + `config.json`) |

## Arquitectura y entrenamiento

El decodificador se compone de tres bloques. El *mapper* (0,96 M de parámetros, 80 tramas/s) usa seis bloques ConvNeXt para transformar las entradas del decodificador de Kokoro en una descripción de 512 canales del sonido. El *renderer* (0,79 M de parámetros, 160 tramas/s) emplea cuatro bloques ConvNeXt y produce, por trama, una ganancia y una rotación de fase para cada una de las 301 bandas de frecuencia de un tren de pulsos, más una ganancia para cada una de las 61 bandas de ruido blanco en cinco subpasos. El *sintetizador* no tiene parámetros: el tren de pulsos a la frecuencia fundamental predicha porta todos los armónicos y el ruido aporta respiración y consonantes; los pulsos usan ventana de 25 ms (separa armónicos) y el ruido ventana de 5 ms (mantiene ataques de consonantes nítidos). Dos STFT inversas convierten el resultado en audio a 24 kHz.

El entrenamiento se basa en destilación de conocimiento del decodificador de Kokoro: pérdidas espectrales contra el audio de Kokoro, pérdidas de waveform y discriminadores. El autor documenta en el paper dos intentos de eliminar mediante entrenamiento un defecto audible (sonidos sonoros entre 1 y 4 kHz percibidos como un tono metálico tenue) que no funcionaron, y recoge estos resultados negativos de forma explícita.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés americano y británico a 24 kHz.
- Reutiliza todas las voces de Kokoro-82M sin reentrenarlas (af_heart, af_bella, am_michael, am_fenrir, bf_emma, bm_george, entre otras).
- Pronunciación, timing y pitch gestionados por la parte de texto de Kokoro, sin cambios.
- API compatible con `KModel` de Kokoro: `load()` devuelve el modelo completo con el decodificador sustituido y `load_decoder()` devuelve solo el decodificador con la firma `decoder(asr, F0, N, style) -> waveform`.
- Inferencia sin red neuronal a frecuencia de audio: las redes corren a 80 y 160 tramas/s.
- Ejecución en CPU con un solo hilo a velocidad superior al tiempo real.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-step; es un modelo exclusivamente de TTS.

## Casos de uso

- **Lectura de textos en dispositivos de borde sin GPU**: el pipeline completo corre a factor de tiempo real 0,0127 en un hilo de CPU (Apple M4), por lo que puede sintetizar voz en Raspberry Pi, móviles o navegadores con WebAssembly sin acelerador.
- **Asistentes de voz locales y offline**: al ocupar 0,75 GB de memoria pico y 7 MB de pesos de decodificador, cabe en dispositivos con RAM limitada y permite privacidad total sin enviar texto a la nube.
- **Audiolibros y contenido largo**: la velocidad de decodificado (33 veces la de Kokoro) reduce el coste de generar horas de audio en servidores sin GPU, con calidad UTMOS de 4,327 sobre 28 clips de validación.
- **Sistemas de accesibilidad**: integración en lectores de pantalla y aplicaciones de asistencia para personas con discapacidad visual, donde la latencia baja y el consumo de memoria importan más que la fidelidad absoluta.
- **Prototipado e investigación en TTS**: al ser un reemplazo directo de `KModel`, sirve para experimentar con decodificadores ligeros manteniendo el front-end de Kokoro y sus voces.
- **Generación de voz en pipelines de CI/CD o pruebas automatizadas**: el bajo coste permite generar locuciones de prueba en cada build sin depender de servicios externos.
- **Sistemas embebidos con restricciones de cómputo**: el decodificador de 7 MB en disco y 1,75 M de parámetros encaja en firmware o contenedores mínimos donde Kokoro-82M no cabría.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card y el paper:

| Metrica | Kokoro-82M | nano-edge-tts |
|---|---:|---:|
| Parámetros del decodificador | 53,3 M | 1,75 M |
| Parámetros del modelo completo | 81,8 M | 30,2 M |
| Pesos del decodificador en disco | 213 MB | 7,0 MB |
| Factor de tiempo real del decodificador, 1 hilo CPU | 0,1378 | 0,0042 (33× más rápido) |
| Factor de tiempo real de fonemas a audio, 1 hilo CPU | 0,1411 | 0,0127 (11× más rápido) |
| Memoria pico del pipeline completo | 1,4–1,7 GB | 0,75 GB |
| Errores de palabra con Whisper small.en, 240 frases | 235 (4,63 %) | 238 (4,69 %) |
| UTMOS, 28 clips de validación | 4,383 | 4,327 |

Mediciones realizadas en PyTorch sobre Apple M4; los números brutos están en el directorio `results/` del repositorio. En pruebas A/B ciegas con un solo oyente (el autor), un checkpoint anterior se percibió igual que Kokoro en 9 de 12 pares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| nano-edge-tts | 30,2 M (1,75 M decodificador) | Inglés (US/UK) | Apache 2.0 | Hugging Face |
| Kokoro-82M | 81,8 M (53,3 M decodificador) | Inglés y otros según pipeline | Apache 2.0 | Hugging Face |
| Piper | No disponible en la información proporcionada | Multilingüe | No disponible en la información proporcionada | No disponible en la información proporcionada |
| VITS (variantes ligeras) | No disponible en la información proporcionada | Multilingüe | No disponible en la información proporcionada | No disponible en la información proporcionada |

La comparación directa solo puede establecerse con Kokoro-82M, su modelo base, del que hereda el front-end de texto y las voces. Frente a Piper o variantes de VITS no se dispone de datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (americano y británico); no hay soporte multilingüe documentado.
- Defecto audible conocido: en algunas frases, los sonidos sonoros entre 1 y 4 kHz suenan demasiado puros, percibidos como un tono metálico tenue; el autor documenta dos intentos fallidos de eliminarlo mediante entrenamiento.
- La evaluación subjetiva se limita a un único oyente (el propio autor) sobre 12 pares, por lo que la equivalencia perceptual con Kokoro no está validada de forma independiente.
- Los benchmarks de calidad (UTMOS, WER con Whisper) se calculan sobre 28 y 240 clips de validación respectivamente, un conjunto pequeño.
- Depende de las voces y los pesos de Kokoro-82M, que se descargan del repositorio de hexgrad en el primer uso; la licencia Apache 2.0 se aplica al decodificador, pero conviene verificar la del modelo base para uso comercial.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- El formato de pesos es safetensors con código Python propio (`nano_edge_tts.py`); no se documentan exportaciones a GGUF, ONNX ni integraciones con vLLM, llama.cpp u Ollama.
- El repositorio tiene 0,0 GB de tamaño reportado y 407 descargas en el momento de la consulta, lo que indica adopción todavía limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drmhse/nano-edge-tts
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Paper (PDF en el repositorio): https://huggingface.co/drmhse/nano-edge-tts/blob/main/paper.pdf
- Muestras de audio: https://huggingface.co/drmhse/nano-edge-tts/tree/main/samples
- Resultados de evaluación: https://huggingface.co/drmhse/nano-edge-tts/tree/main/results
- Código del decodificador: https://huggingface.co/drmhse/nano-edge-tts/blob/main/nano_edge_tts.py
