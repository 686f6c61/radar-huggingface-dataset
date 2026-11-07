# NiranjanYadavIN/Kokoro-82M

## Resumen

Kokoro-82M es un modelo de síntesis de voz (text-to-speech) de 82 millones de parámetros desarrollado originalmente por hexgrad sobre la arquitectura StyleTTS 2 combinada con un vocoder ISTFTNet. La versión aquí descrita, publicada por NiranjanYadavIN, es una reempaquetado del modelo base en formato `.litertlm` para su ejecución totalmente local mediante MediaPipe Text-to-Speech y LiteRT-LM, el runtime de inferencia on-device de Google. El resultado es un único fichero que contiene el modelo acústico y el vocoder en INT8, las 54 voces de Kokoro v1.0 y los front-ends de normalización de texto y grafema-a-fonema para 9 idiomas, sin dependencias de Python ni librerías fonéticas GPL externas.

La relevancia de este empaquetado radica en que traslada un TTS multilingüe de calidad a dispositivos móviles, navegadores y sistemas embebidos sin conexión de red: sintetiza voz a 24 kHz entre 6 y 10 veces más rápido que tiempo real en una GPU de Galaxy S26 con FP16 y un pico de memoria de aproximadamente 0,35 GB. Frente al Kokoro original, que requiere un entorno Python en servidor, esta variante mantiene la inteligibilidad (según el autor, iguala o supera al modelo original en un benchmark de 800 frases en 8 idiomas) y añade streaming de audio, alineación de timestamps a nivel de palabra y cancelación de síntesis en curso.

El modelo cubre inglés americano y británico, español, francés, italiano, portugués brasileño, hindi, chino mandarín y japonés, con licencia Apache-2.0 en todo el stack, lo que lo hace apto para integración comercial en aplicaciones Android, iOS, macOS, web, Python y C++.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (modelo acústico) + vocoder ISTFTNet, exportado a LiteRT/MediaPipe |
| Parametros totales | 82 M (modelo base Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; segmenta por frases y cláusulas en streaming) |
| Tipos de cuantizacion | INT8 (modelo acústico y vocoder); FP16 y FP32 en ejecución GPU |
| Idiomas soportados | en (US/UK), es, fr, it, pt (BR), hi, zh (mandarín), ja |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM / MediaPipe); `.tflite` FP32 en `legacy/` (obsoleto) |

## Arquitectura y entrenamiento

El modelo base Kokoro-82M emplea StyleTTS 2, un enfoque de TTS con modelado de estilo por difusión sobre representaciones fonéticas, acoplado a un vocoder ISTFTNet que genera la forma de onda a 24 kHz. Esta variante no reentrena el modelo: cuantiza el modelo acústico y el vocoder a INT8 y los exporta como grafos LiteRT dentro de un bundle `.litertlm`, con los front-ends de normalización de texto y G2P integrados en el propio fichero. Se ofrecen dos builds: una con el vocoder en INT8 con activaciones en coma flotante, pensada para ejecutarse en la GPU vía el delegado GPU de LiteRT (OpenCL, WebGPU o Metal), y otra con operaciones de desquantización explícitas para que XNNPACK en CPU produzca audio limpio a costa de más memoria.

Los detalles de composición del dataset de entrenamiento, número de tokens y uso de RLHF o DPO no están disponibles en la información proporcionada. La innovación técnica destacable de este empaquetado es la exportación del grafo del vocoder de forma que los valores intermedios se mantengan dentro del rango FP16, lo que habilita ejecución nativa en FP16 en GPU y reduce aproximadamente a la mitad la latencia del vocoder frente a FP32.

## Capacidades

- Síntesis de voz multilingüe en 9 idiomas y dialectos con las 54 voces de Kokoro v1.0.
- Salida de audio PCM mono a 24 kHz en float32 normalizado en `[-1.0, 1.0]`.
- Síntesis en streaming de baja latencia (`synthesizeStream` / `synthesize_stream`): segmenta entradas multi-frase en límites de frase y cláusula y emite `AudioChunk` a medida que termina cada fragmento.
- Streaming de texto desde un LLM on-device (`openStream` / `start_stream` con `pushText` / `push_text` y `finishInput` / `finish_input`), con inicio de síntesis en cuanto llega el primer límite de frase.
- Timestamps a nivel de palabra (`wordTimestamps` / `word_timestamps`) con `word`, `startChar`, `endChar`, `startSec` y `endSec`, mapeados a offsets de caracteres del texto de entrada.
- Cambio de voz e idioma por utterance mediante `SynthesisOptions` (`voiceId`, `locale`) sin recargar pesos; el idioma se infiere del `voiceId` si se omite `locale`.
- Control de velocidad de habla (`speakingRate` en `(0.0, 4.0]`, por defecto `1.0`).
- Cancelación de síntesis en curso sin bloqueos (`cancel()`), con integración en corrutinas Kotlin y Swift.
- Despliegue en Android, iOS, macOS, Python, Web y C++.

## Casos de uso

- Lectura por voz en aplicaciones móviles: integración del bundle en Android o iOS con MediaPipe para narrar artículos o notificaciones sin conexión, usando los timestamps por palabra para resaltar el texto a medida que se lee.
- Asistentes conversacionales on-device: encadenar la salida en streaming de un LLM local con `openStream` para que la voz empiece a sonar en cuanto se completa la primera frase, con cancelación inmediata si el usuario interrumpe.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz a 24 kHz con selección de voz e idioma por utterance y control de velocidad entre 0 y 4 veces la tasa normal.
- Aprendizaje de idiomas: reproducción de frases en español, francés, italiano, portugués, hindi, chino mandarín o japonés con las voces nativas correspondientes, aprovechando el G2P integrado para una pronunciación correcta.
- Audioguías y navegación sin red: síntesis local en dispositivos sin conectividad (vehículos, museos, zonas rurales) con un pico de memoria de 0,35-0,5 GB en la build GPU.
- Integración en pipelines de CI y servidores sin GPU: uso de la build CPU/GPU `kokoro_int8_fp16.litertlm` con XNNPACK para generar locuciones de prueba o doblaje automatizado en entornos headless.
- Aplicaciones web sin backend: ejecución en navegador mediante WebGPU o WASM CPU, útil para herramientas de lectura o demos interactivas que no pueden enviar texto a un servidor por privacidad.

## Benchmarks y rendimiento

El autor reporta un benchmark de inteligibilidad de 800 frases en 8 idiomas en el que el modelo empaquetado iguala o supera al Kokoro original ejecutándose en servidor. No se publican cifras numéricas desglosadas (MOS, WER, etc.) en la información disponible.

| Metrica | Valor |
|---|---|
| Velocidad de síntesis | 6-10x tiempo real en GPU de Galaxy S26 con FP16 |
| Memoria pico (build GPU) | ~0,35-0,5 GB |
| Memoria pico (build CPU/GPU) | ~0,7-0,95 GB |
| Benchmark de inteligibilidad | Iguala o supera a Kokoro en servidor (800 frases, 8 idiomas); cifras no disponibles |
| MMLU / HumanEval / GSM8K | no aplica (modelo TTS) |

## Requisitos de hardware

- VRAM/RAM estimada: ~0,35-0,5 GB de pico con `kokoro_int8_gpu_fp16.litertlm` en GPU; ~0,7-0,95 GB con `kokoro_int8_fp16.litertlm` en CPU o GPU.
- GPU recomendadas: cualquier GPU soportada por el delegado GPU de LiteRT (OpenCL, WebGPU o Metal), incluidas GPU integradas de móviles y portátiles; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de portátil o móvil con OpenCL, WebGPU o Metal; también funciona en CPU pura con XNNPACK.
- Opciones de despliegue: MediaPipe Text-to-Speech Task y LiteRT-LM en Android, iOS, macOS, Python, Web y C++; en Android se requieren las librerías aceleradoras en `prebuilt/android_arm64/*.so` junto al runner.
- Latencia y throughput: 6-10x tiempo real en GPU de Galaxy S26 con FP16; el vocoder en FP16 reduce la latencia aproximadamente a la mitad frente a FP32. No se publican cifras de latencia por utterance ni de throughput en servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Kokoro-82M (hexgrad, este empaquetado) | 82 M | 9 idiomas/dialectos | `.litertlm` on-device (MediaPipe/LiteRT) | Apache-2.0 | 54 voces, streaming, timestamps por palabra, sin dependencias Python |
| hexgrad/Kokoro-82M (original) | 82 M | 9 idiomas/dialectos | PyTorch, requiere entorno Python en servidor | Apache-2.0 | Modelo base; sin empaquetado on-device ni streaming integrado |
| NiranjanYadavIN/Kokoro-82M-ONNX | 82 M | no disponible en la información | ONNX | no disponible en la información | Existe una versión más reciente en onnx-community/Kokoro-82M-v1.0-ONNX |

No se dispone de datos de benchmarks comparativos numéricos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo base Kokoro-82M puede presentar sesgos en la pronunciación y el timbre según la voz y el idioma; no se documentan evaluaciones de sesgo en la información disponible.
- Riesgo de errores de pronunciación en palabras ambiguas, nombres propios o texto no normalizado; el G2P integrado mitiga pero no elimina estos fallos.
- La build GPU, si se ejecuta con `Delegate.CPU` o sin acelerador GPU disponible, produce audio inteligible pero potencialmente más ruidoso; para dispositivos solo CPU debe usarse `kokoro_int8_fp16.litertlm`.
- El fichero FP32 `.tflite` en `legacy/` está obsoleto (solo inglés, solo CPU) y no debe usarse en integraciones nuevas.
- La licencia Apache-2.0 cubre el empaquetado y evita librerías fonéticas GPL, pero conviene verificar las condiciones del modelo base hexgrad/Kokoro-82M para uso comercial.
- No hay datos publicados sobre latencia en servidores, throughput concurrente ni calidad medida con MOS en la información disponible.
- El repositorio indica 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria amplia de esta variante concreta.

## Enlaces

- Hugging Face (este empaquetado): https://huggingface.co/NiranjanYadavIN/Kokoro-82M
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- MediaPipe Text-to-Speech Task: https://ai.google.dev/edge/mediapipe/solutions/audio/text_to_speech
- Versión ONNX del mismo autor: https://huggingface.co/NiranjanYadavIN/Kokoro-82M-ONNX
- Perfil del autor: https://huggingface.co/NiranjanYadavIN
- Ficheros legacy: https://huggingface.co/litert-community/Kokoro-82M/tree/main/legacy
- Paper StyleTTS 2 (arXiv:2306.07691): https://arxiv.org/abs/2306.07691
- Paper ISTFTNet (arXiv:2203.02395): https://arxiv.org/abs/2203.02395
