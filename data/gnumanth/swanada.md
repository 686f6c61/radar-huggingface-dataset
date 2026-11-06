# gnumanth/swanada

## Resumen

Swanada (स्वनद, "flujo acústico resonante" en sánscrito) es un sistema de reconocimiento automático del habla (ASR) multilingüe desarrollado por el autor independiente gnumanth. Su particularidad es que está diseñado para ejecutarse íntegramente en el navegador mediante ONNX Runtime Web (WASM/WebGPU), en Node.js y en Python, sin ninguna dependencia de la nube. Cubre sánscrito clásico, inglés indio y diez lenguas índicas (hindi, kannada, marathi, bengalí, tamil, telugu, malayali, gujarati, punyabí y odia), lo que lo convierte en una pieza poco habitual dentro del ecosistema ASR abierto.

Arquitectónicamente es un encoder Conformer de 17 capas con `d_model=512`, 8 cabezas de atención y kernel convolucional de 31, seguido de una cabeza CTC lineal específica por idioma (proyección 512→257). Los pesos se distribuyen cuantizados a INT8 (`QUInt8`), lo que reduce el tamaño activo por idioma de 481 MB a aproximadamente 178 MB. El modelo completo en FP32 ocupa 481,4 MB y el repositorio total pesa 2,4 GB al incluir los vocabularios y variantes.

La relevancia actual del proyecto reside en su enfoque *zero-cloud*: reconocimiento de voz para lenguas con poca cobertura comercial que puede desplegarse en dispositivos sin conexión, con un RTF de 0,038x en CPU nativa y 0,118x en WASM. Es un modelo pequeño, determinista y con licencia MIT, orientado a aplicaciones de privacidad, accesibilidad y despliegue en entornos con conectividad limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (encoder Conformer + cabeza CTC lineal) |
| Parámetros totales | no disponible (tamaño de pesos FP32: 481,4 MB; INT8: ~178 MB por idioma) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz; ventana de características log-mel de 25 ms con salto de 10 ms) |
| Tipos de cuantización | INT8 dinámica (`QUInt8`) sobre pesos; FP32 de referencia |
| Idiomas soportados | sa, en (indio), hi, kn, mr, bn, ta, te, ml, gu, pa, or (12 en total) |
| Licencia | MIT |
| Formato de pesos | ONNX (`preprocessor.onnx` + encoder/cabeza); vocabularios en JSON (SentencePiece BPE) |

## Arquitectura y entrenamiento

El pipeline consta de tres etapas ONNX encadenadas. Primero, un frontend determinista (`preprocessor.onnx`) extrae un espectrograma log-mel de 80 canales a partir de PCM Float32 mono a 16 kHz, con ventana de 25 ms y salto de 10 ms; los runtimes incluyen un fallback de FFT analítico en biblioteca estándar si los operadores tensoriales de WASM no están disponibles. Después, un encoder Conformer de 17 capas (`d_model=512`, 8 cabezas, `conv_kernel=31`, subsampling 4x) procesa la secuencia. Finalmente, una cabeza CTC multilingüe con proyección lineal específica por idioma (512→257) genera logits que se decodifican con CTC greedy (argmax, deduplicación de tokens consecutivos, eliminación del token blank en índice 0 y normalización NFC).

Los vocabularios son SentencePiece BPE de 256 unidades más el blank, con mapas separados por script: devanagari para sánscrito, hindi y marathi; latino para inglés indio; y escrituras propias para kannada, bengalí, tamil, telugu, malayali, gujarati, gurmukhi y odia. Los datos de entrenamiento declarados provienen de `ai4bharat/IndicVoices`, `ai4bharat/vistaar`, `mozilla-foundation/common_voice_17_0` y `prathoshap/sushrota-sanskrit-asr`. No se especifican en la información disponible el número de horas de audio, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicables habitualmente en ASR CTC). La innovación técnica destacable es la cuantización INT8 dinámica que reduce el peso de 481 MB a 178 MB con una degradación mínima de precisión (CER de 4,82% a 4,97%), junto con el contrato de `CacheStorage` (`swanada-onnx-v1.0.0`) que garantiza cero peticiones de red tras la primera carga.

## Capacidades

- Reconocimiento de voz multilingüe en 12 idiomas: sánscrito clásico, inglés indio y diez lenguas índicas.
- Salida en escritura nativa (devanagari, kannada, tamil, telugu, malayali, bengalí, gujarati, gurmukhi, odia) y en latino para inglés indio.
- Transcripción de sánscrito clásico con salida en IAST además de devanagari.
- Inferencia completamente offline en navegador (WASM/WebGPU), Node.js y Python.
- Decodificación CTC greedy determinista, sin muestreo estocástico.
- Frontend de audio integrado que acepta PCM Float32 a 16 kHz mono.
- Almacenamiento en caché de pesos en el navegador mediante `CacheStorage` para sesiones posteriores sin red.
- SDK con API unificada en TypeScript (`Swanada.create`) y Python (`Swanada(language=...)`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.

## Casos de uso

- Subtitulación en directo en el navegador: integración del SDK TypeScript en una web app que capture audio del micrófono, lo remuestree a 16 kHz y muestre transcripciones en hindi, tamil o bengalí sin enviar audio a ningún servidor, con RTF de 0,118x en WASM.
- Asistentes de voz para lenguas índicas de bajos recursos: despliegue en Node.js o Python para dar soporte de dictado a usuarios de malayali, punyabí u odia, idiomas con escasa cobertura en ASR comerciales.
- Aplicaciones de privacidad y cumplimiento: transcripción local de consultas médicas o legales en India donde el audio no puede salir del dispositivo; el contrato de `CacheStorage` permite funcionar tras la primera descarga de 178 MB.
- Digitalización de patrimonio sánscrito: transcripción de recitaciones y grabaciones clásicas con salida en IAST y devanagari, usando el modelo específico para `sa` entrenado con `prathoshap/sushrota-sanskrit-asr`.
- Herramientas de accesibilidad offline: dictado por voz en dispositivos con conectividad intermitente o nula, aprovechando el fallback FFT en biblioteca estándar cuando los operadores WASM no están disponibles.
- Evaluación e investigación ASR: banco de pruebas reproducible para comparar el rendimiento INT8 frente a FP32 en CPU y WASM, con métricas CER/WER e intervalos de confianza bootstrap ya publicados.
- Integración en pipelines de datos: transcripción por lotes en Python de corpus de audio en lenguas índicas para anotación automática previa a revisión humana.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un conjunto held-out de 480 utterances a 16 kHz, con intervalos de confianza bootstrap del 95% (B = 1000).

| Sistema | Runtime | Huella activa | RTF CPU | RTF WASM | TTFT p50 | CER (%) | WER (%) |
|---|---|---|---|---|---|---|---|
| PyTorch FP32 | PyTorch (MPS/CUDA/CPU) | 481,4 MB | 0,082x | — | 120 ms | 4,82 [4,41; 5,25] | 11,24 [10,60; 11,92] |
| Swanada INT8 | ONNX Runtime Web / CPU | 178,4 MB | 0,038x | 0,118x | 95 ms | 4,97 [4,55; 5,42] | 11,49 [10,82; 12,18] |
| VAD gate (silencio) | RMS < 1e-4 | 0,0 MB | < 0,001x | < 0,001x | < 1 ms | 0,00 | 0,00 |

La tabla por idioma de la model card repite exactamente los mismos valores agregados (CER 4,97%, WER 11,49%) para los doce idiomas, lo que sugiere que se trata de la métrica global del conjunto y no de resultados desglosados por lengua; conviene interpretarla con cautela. No se han publicado resultados comparativos con otros modelos ASR (p. ej. Whisper, IndicWhisper, AI4Bharat) en la información disponible.

## Requisitos de hardware

- Huella de pesos: ~178 MB por idioma en INT8; 481,4 MB en FP32 de referencia. El repositorio completo ocupa 2,4 GB.
- VRAM/RAM estimada para inferencia: por debajo de 1 GB en INT8, incluyendo buffers de activación del encoder Conformer de 17 capas.
- GPU: no requiere GPU; funciona en CPU nativa (RTF 0,038x) y en WASM (RTF 0,118x). Compatible con WebGPU en navegador.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090) e incluso en dispositivos móviles y navegadores de gama media.
- Opciones de despliegue: ONNX Runtime Web (WASM/WebGPU), ONNX Runtime para Node.js y Python, SDK propio `swanada` en npm y PyPI.
- Latencia: TTFT p50 de 95 ms en INT8 frente a 120 ms en FP32; RTF de 0,038x en CPU nativa implica procesar audio unas 26 veces más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas índicos | Contexto/entrada | Licencia | Despliegue local |
|---|---|---|---|---|---|
| Swanada v1.0.0 | no disponible (178 MB INT8) | 12 (incl. sánscrito) | audio 16 kHz | MIT | navegador, Node.js, Python |
| Whisper (OpenAI) | 39M–1,55B según variante | multilingüe amplio, cobertura índica limitada | audio 16 kHz, ventanas de 30 s | MIT | sí (ONNX, llama.cpp, etc.) |
| IndicWhisper (AI4Bharat) | basado en Whisper | lenguas índicas | audio 16 kHz | no disponible en la información | sí |
| AI4Bharat IndicConformer | no disponible | lenguas índicas | audio 16 kHz | no disponible en la información | sí |

No se dispone de datos comparativos de CER/WER frente a estos modelos en la información proporcionada; la comparación se limita a aspectos de licencia, idiomas y opciones de despliegue.

## Limitaciones y advertencias

- Los resultados por idioma de la model card son idénticos entre las doce lenguas, lo que apunta a una métrica agregada mal desglosada; no debe asumirse un rendimiento uniforme real.
- No se documentan horas de entrenamiento, composición del dataset ni procesos de limpieza, lo que dificulta evaluar sesgos acústicos (género, dialecto, ruido de fondo).
- Riesgo de alucinación bajo en CTC greedy determinista, pero pueden aparecer repeticiones o supresiones en audio ruidoso o con solapamiento de hablantes.
- Cobertura limitada a 12 idiomas; no soporta traducción, diarización ni puntuación automática.
- El modelo no incluye detección de actividad de voz (VAD) integrada; la model card menciona una compuerta VAD externa basada en energía RMS como capa separada.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías ni soporte; el proyecto tiene 0 descargas y 0 likes en el momento de la ficha, por lo que la madurez de la comunidad es mínima.
- El tamaño del repositorio (2,4 GB) puede ser un inconveniente para despliegues con almacenamiento limitado; conviene descargar solo la variante INT8 del idioma necesario.
- Requiere remuestrear el audio a 16 kHz mono Float32; no acepta otros formatos directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gnumanth/swanada
- Repositorio GitHub y SDKs: https://github.com/hemanth/swanada
- Playground interactivo en navegador: https://hemanth.github.io/swanada/
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Dataset Vistaar: https://huggingface.co/datasets/ai4bharat/vistaar
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Dataset Sushrota Sanskrit ASR: https://huggingface.co/datasets/prathoshap/sushrota-sanskrit-asr
