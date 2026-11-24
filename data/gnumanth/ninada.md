# gnumanth/ninada

## Resumen

Ninada (निनाद, "sonido resonante profundo" en sánscrito) v5.1.2 es una suite de síntesis de voz neuronal (TTS) multilingüe desarrollada por gnumanth, orientada a la síntesis en navegador y en múltiples runtimes. Cubre 12 idiomas (sánscrito clásico, inglés indio y diez lenguas índicas) con dos voces por idioma (masculina y femenina), lo que da un total de 24 especialistas y 48 modelos ONNX publicados.

El modelo resuelve el problema de la síntesis de voz de calidad estudio en entornos con recursos limitados mediante un enrutamiento de pesos en dos niveles según capacidad: un nivel "Studio" con vocoder HiFi-GAN v1 completo a 24 kHz para escritorio, WebGPU y CPUs multinúcleo, y un nivel "Mobile" con un vocoder iSTFTNet destilado para navegadores móviles y CPUs de baja memoria. Ambos niveles operan en banda completa a 24.000 Hz.

La arquitectura es VITS con vocoder HiFi-GAN v1 (Studio) o iSTFTNet (Mobile), con 81.947.110 parámetros totales según los safetensors publicados y un tamaño de repositorio de 9,0 GB. Es relevante por su enfoque en streaming de baja latencia en el navegador (WebAssembly SIMD y WebGPU) y por cubrir idiomas índicos poco atendidos, incluido el sánscrito clásico, con licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS con vocoder HiFi-GAN v1 (Studio) e iSTFTNet c8c8_384 (Mobile) |
| Parametros totales | 81.947.110 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; niveles Studio y Mobile diferenciados por tamano, no por cuantizacion) |
| Idiomas soportados | sa, en, hi, kn, mr, bn, ta, te, ml, gu, pa, or |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (safetensors en el repo para parametros) |
| Frecuencia de muestreo | 24.000 Hz (banda completa) |
| Voces | 24 especialistas (12 idiomas x masculino/femenino) |
| Tamano Studio | 27,93 MiB por modelo ONNX |
| Tamano Mobile | 21,68 MiB por modelo ONNX |
| Modelos ONNX totales | 48 |
| Tamano del repo | 9,0 GB |

## Arquitectura y entrenamiento

Ninada emplea una arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) con dos variantes de vocoder. El nivel Studio usa un generador HiFi-GAN v1 completo a 24 kHz sin destilar (0,00 dB de perdida por destilacion). El nivel Mobile usa un ISTFTWaveformDecoder destilado con upsampling [8, 8], canales 384 -> 192 -> 96, n_fft = 16, hop = 4 y total_hop = 256 muestras, entrenado durante 30.000 pasos adversariales con discriminadores Multi-Period, Multi-Scale y Multi-Resolution STFT y Sub-Band.

Los datos de entrenamiento provienen de ai4bharat/Rasa (CC-BY-4.0) para once idiomas y de SPRINGLab/IndicTTS-English (CC-BY-4.0) para el inglés indio. En v5.1.2 el inglés indio se reentrenó de extremo a extremo sin congelar el checkpoint donante, partiendo de narraciones de estudio de un solo hablante a 48 kHz remuestreadas a 24 kHz. No se especifica en la informacion disponible el numero total de tokens ni el volumen de horas de audio de entrenamiento, ni si se aplico RLHF o DPO (no aplicable habitualmente en TTS). La innovacion destacable es el enrutamiento dual por capacidad y la destilacion del vocoder para streaming en WASM.

## Capacidades

- Sintesis de voz neuronal a 24 kHz en banda completa para 12 idiomas.
- Dos voces por idioma (masculina y femenina), 24 especialistas en total.
- Soporte de sánscrito clásico (sa), idioma poco cubierto en TTS comerciales.
- Streaming TTS con AudioWorklet en navegador, con latencia de primer chunk de 519 ms en hardware movil.
- Ejecucion en WebGPU (escritorio) y WebAssembly SIMD (movil), con enrutamiento automatico de pesos segun capacidad.
- SDK de streaming en JavaScript y Python.
- Continuidad de streaming sin underruns de AudioWorklet y con pausa natural entre frases de 35 ms.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente (es un modelo TTS puro).
- No dispone de vision ni audio de entrada (solo texto a voz).

## Casos de uso

- Lectura de contenido web en navegador: integracion del SDK JS con AudioWorklet para sintetizar articulos en hindi, tamil o bengali directamente en el cliente, sin enviar texto a un servidor, usando el nivel Mobile en dispositivos de gama media.
- Asistentes de voz para aplicaciones moviles: el nivel Mobile con RTF de 0,66x en WASM permite conversacion en tiempo real en Chrome movil con latencia de primer chunk de 519 ms.
- Accesibilidad para usuarios con discapacidad visual: narracion de interfaces y documentos en lenguas indicas con dos opciones de voz por idioma, desplegable en WebGPU en escritorio.
- Localizacion de audiolibros y narraciones: el nivel Studio con HiFi-GAN v1 completo y hasta 56-61 dB de SNR de streaming ofrece calidad de estudio para contenido pregrabado en sánscrito o marathi.
- Educacion de idiomas: sintesis de sánscrito clasico y de lenguas indicas para materiales de aprendizaje de pronunciacion, con voces masculina y femenina.
- Generacion de avisos y notificaciones por voz en sistemas embebidos: el modelo Mobile de 21,68 MiB cabe en memoria limitada y se ejecuta en CPU sin GPU.
- Doctores y narradores de noticias multilingues: sintesis de boletines en varios idiomas con una sola suite y licencia CC-BY-4.0 que permite uso comercial con atribucion.

## Benchmarks y rendimiento

| Metrica | Studio | Mobile |
|---|---|---|
| Latencia primer chunk (TTFA) | ~43 ms | 519 ms (861 ms audible en Pixel 10 Pro XL) |
| RTF en WebGPU | 0,04x | no aplica |
| RTF en WASM (Pixel 10 Pro XL, 6 hilos SIMD) | no aplica | 0,66x - 0,68x |
| Underruns de AudioWorklet | no disponible | 0 |
| SNR de streaming multi-chunk | no disponible | 56 - 61 dB |
| MCD Mobile (rango por idioma) | no aplica | 0,996 - 2,092 dB (masculino); 1,081 - 2,092 dB (femenino) |
| Error HF 8-12 kHz (rango por idioma) | no disponible | 0,846 - 5,178 dB (masculino); 0,896 - 2,682 dB (femenino) |
| WER ingles indio (Whisper-small.en) | no disponible | 1,56% masculino; 4,23% femenino |
| Tasa de voz sonora | no disponible | 100% en las 24 voces |

## Requisitos de hardware

- VRAM estimada: no disponible; los modelos ONNX son pequenos (27,93 MiB Studio, 21,68 MiB Mobile) y pueden ejecutarse en CPU.
- GPU recomendadas: WebGPU en escritorio (sin modelo concreto especificado); en servidor, cualquier GPU con soporte ONNX Runtime.
- Cabe en GPU consumer: si, dado el tamano reducido de los pesos; tambien en CPU y en navegador movil.
- Despliegue: ONNX Runtime (incluido onnxruntime-web con WebGPU y WASM SIMD), SDK JS y Python del repositorio GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia: TTFA de ~43 ms en Studio y 519 ms de computo del primer chunk en Mobile (Pixel 10 Pro XL, Chrome 156, 6 hilos WASM SIMD).
- Throughput: RTF de 0,04x en WebGPU (Studio) y 0,66x-0,68x en WASM movil (Mobile), es decir, aproximadamente 1,5x mas rapido que tiempo real en el navegador movil.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas indicos | Vocoder / frecuencia | Licencia | Despliegue navegador |
|---|---|---|---|---|---|
| Ninada v5.1.2 | 81,9 M | 12 (incluye sa) | HiFi-GAN v1 / iSTFTNet a 24 kHz | CC-BY-4.0 | Si (WebGPU + WASM) |
| Alternativas comerciales de TTS indico | no disponible | variable | no disponible | propietaria | limitado |
| Modelos TTS open source multilingues genericos | no disponible | parcial | no disponible | variable | variable |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos con otros modelos TTS de la misma categoria; la comparativa anterior se limita a caracteristicas estructurales y no incluye cifras de rendimiento de terceros.

## Limitaciones y advertencias

- Es un modelo exclusivamente TTS: no genera texto, no razona, no hace tool calling ni soporta agentes.
- Solo cubre 12 idiomas (sa, en, hi, kn, mr, bn, ta, te, ml, gu, pa, or); no soporta castellano ni otras lenguas fuera de esa lista.
- La calidad varia por idioma: el MCD Mobile femenino de Odia (2,092 dB) y el error HF masculino de ingles indio (5,178 dB) son los peores de la tabla, lo que indica menor fidelidad en esos casos.
- Riesgo de alucinacion acustica y artefactos de pronunciacion en textos fuera del dominio de entrenamiento (nombres propios, siglas, numeros).
- Sesgos de los corpus de origen (ai4bharat/Rasa y SPRINGLab/IndicTTS-English): voces de estudio de un solo hablante, lo que limita la diversidad de acentos y timbres.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar al autor y respetar los terminos de los datasets de origen.
- El rendimiento en movil se ha verificado en un dispositivo concreto (Google Pixel 10 Pro XL); en hardware mas antiguo el RTF puede degradarse.
- No se han publicado datos de robustez ante ruido, emocion o control prosodico fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gnumanth/ninada
- Demo web Studio (AudioWorklet + WebGPU / WASM SIMD): https://hemanth.github.io/ninada/
- Repositorio GitHub y SDKs de streaming (JS + Python): https://github.com/hemanth/ninada
- Dataset de manifiestos Studio a 24 kHz: https://huggingface.co/datasets/gnumanth/ninada-sanskrit-indic
- Dataset de entrenamiento ai4bharat/Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Dataset de entrenamiento SPRINGLab/IndicTTS-English: https://huggingface.co/datasets/SPRINGLab/IndicTTS-English
