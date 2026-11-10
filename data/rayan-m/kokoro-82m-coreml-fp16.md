# rayan-m/kokoro-82m-coreml-fp16

## Resumen

Kokoro-82M CoreML FP16 es una conversión del modelo de síntesis de voz Kokoro-82M (desarrollado por hexgrad) a formato Core ML, empaquetada por rayan-m para su uso en la aplicación iOS Read Aloud. El modelo original es un TTS ligero de 82 millones de parámetros que convierte texto en audio a 24 kHz, y esta versión lo adapta para inferencia en dispositivo (on-device) en hardware Apple mediante Core ML.

La conversión no implica reentrenamiento: se trata de un reempaquetado de la conversión `kokoro-v1` del repositorio john-rocky/CoreML-Models, con dos modificaciones técnicas: los pesos se almacenan en float16 (leídos mediante `constexpr_cast`, que Core ML expande a float32 en carga) y los tres decodificadores de longitud fija (128, 256 y 512 frames) se unifican en un único paquete multifunción que comparte pesos. El resultado son dos paquetes Core ML de unos 150 MB en total, frente a unos 760 MB de las cuatro versiones float32 originales.

Es relevante para desarrolladores que necesiten TTS local en ecosistema Apple (iOS 18 / macOS 15 o superior) sin depender de servicios en la nube, con una huella de almacenamiento reducida y ejecución exclusiva en CPU. La licencia del modelo base es Apache-2.0, aunque la conversión hereda una advertencia de licencia por parte del repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal (Kokoro-82M) convertido a Core ML; predictor + decodificador multifunción |
| Parametros totales | 82 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrada de tokens de 1 a 256 por paquete predictor |
| Tipos de cuantizacion | Pesos float16 almacenados (ejecución en float32); sin otras cuantizaciones publicadas |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache-2.0 (pesos base); conversión con advertencia de licencia pendiente del repo de origen |
| Formato de pesos | Core ML `.mlpackage` (comprimido en `.zip`) |
| Frecuencia de muestreo de audio | 24 kHz |
| Tamano del repo | 0.2 GB |
| Paquetes incluidos | `Kokoro_Predictor_fp16` (36.002.997 bytes) y `Kokoro_Decoder_fp16` (114.477.494 bytes) |
| Biblioteca | coreml |

## Arquitectura y entrenamiento

El modelo base Kokoro-82M es un sistema de síntesis de voz neuronal de 82 millones de parámetros. La conversión a Core ML separa el pipeline en dos paquetes: un predictor que recibe `input_ids` (int32, `[1, N]`, con N entre 1 y 256 y token 0 en ambos extremos) y `ref_s_style` (float32, `[1, 128]`, la segunda mitad de la fila de estilo de la voz), y produce `duration [1, N]`, `d_for_align [1, 640, N]` y `t_en [1, 512, N]`. El decodificador recibe `en_aligned [1, 640, F]`, `asr_aligned [1, 512, F]` y `ref_s [1, 256]`, y genera audio `[1, F × 600]` a 24 kHz.

La innovación técnica de esta conversión es doble. Primero, los pesos se almacenan en float16 y se leen mediante `constexpr_cast`, que Core ML expande a float32 al cargar el modelo; todas las operaciones se ejecutan en float32 y solo los pesos almacenados están redondeados, mientras que los sesgos permanecen en float32. Segundo, los tres decodificadores de longitud fija (128, 256 y 512 frames) se unifican en un único paquete multifunción (`decoder_128`, `decoder_256`, `decoder_512`) que comparte todos los pesos, seleccionables mediante `MLModelConfiguration.functionName` en iOS 18 / macOS 15 o superior. No hubo reentrenamiento ni datos de entrenamiento adicionales en esta conversión.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto tokenizado, con salida de audio a 24 kHz.
- Generación de duraciones por token y representaciones alineadas para el decodificador.
- Soporte de tres longitudes de decodificación (128, 256 y 512 frames) mediante un único paquete multifunción.
- Ejecución exclusiva en CPU (`MLComputeUnits.cpuOnly`) en hardware Apple.
- Inferencia en dispositivo, sin dependencia de servicios en la nube.
- Estilos de voz mediante tensores `ref_s_style` y `ref_s` (las voces no se incluyen en el paquete; la app las descarga del repositorio de origen).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Lectura en voz alta en aplicaciones iOS: el paquete está diseñado específicamente para la app Read Aloud, permitiendo convertir texto a voz en el dispositivo sin enviar contenido a servidores externos.
- Accesibilidad: integración de TTS local en apps de lectura de pantalla o asistencia para personas con discapacidad visual, aprovechando la ejecución en CPU y el bajo tamaño (unos 150 MB).
- Asistentes de voz offline: aplicaciones que necesiten respuestas habladas sin conectividad, con latencia controlada por la inferencia local en hardware Apple.
- Audiolibros y contenido largo: el decodificador de 512 frames permite generar fragmentos de audio más largos por invocación, adecuado para párrafos extensos.
- Prototipado en macOS: uso del paquete en macOS 15 o superior para validar pipelines de TTS antes de desplegar en iOS.
- Privacidad de datos: escenarios donde el texto a sintetizar es sensible y no puede salir del dispositivo, como notas médicas o comunicaciones internas.
- Pruebas de integración Core ML: referencia para desarrolladores que quieran comparar el rendimiento de paquetes float16 frente a float32 en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo TTS. La model card incluye verificaciones de fidelidad frente a los paquetes float32:

| Prueba | Resultado |
|---|---|
| Predictor: acuerdo de salidas (3 frases, voz `af_heart`, Mac CPU) | 63–90 dB SNR; duraciones redondeadas idénticas por token |
| Decodificador: comparación con paquete float16 separado | Bit-idéntico por función |
| Decodificador: audio frente a float32 | 11–16 dB SNR de forma de onda; 6–7% de convergencia espectral; indistinguible para oyentes |

## Requisitos de hardware

- VRAM: no aplica; ejecución en CPU mediante Core ML (`MLComputeUnits.cpuOnly`).
- Almacenamiento: unos 150 MB para los dos paquetes comprimidos (36 MB el predictor y 114 MB el decodificador).
- Hardware recomendado: dispositivos Apple con iOS 18 / macOS 15 o superior (requerido para `MLModelConfiguration.functionName`).
- GPU: no se utiliza GPU en la configuración documentada; el modelo se ejecuta en CPU.
- Despliegue: Core ML en apps iOS/macOS; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kokoro-82M CoreML FP16 (este) | 82 M | 1–256 tokens; audio 24 kHz | Core ML `.mlpackage` | Apache-2.0 (con advertencia) | Hugging Face, 0 descargas |
| Kokoro-82M (hexgrad) | 82 M | no disponible | safetensors / otros | Apache-2.0 | Hugging Face (modelo base) |
| kokoro-v1 Core ML (john-rocky/CoreML-Models) | 82 M | no disponible | Core ML float32 (4 paquetes) | Sin licencia declarada | GitHub |

## Limitaciones y advertencias

- La licencia de la conversión está en disputa: el repositorio de origen john-rocky/CoreML-Models no declara licencia, por lo que esta copia es solo para pruebas hasta que se resuelva. Los pesos base son Apache-2.0.
- Las voces, el vocabulario y los lexicones no están incluidos; la app debe descargarlos del repositorio de origen.
- Requiere iOS 18 / macOS 15 o superior para la selección de funciones del decodificador multifunción.
- Ejecución exclusiva en CPU; no se documenta aceleración por GPU o Neural Engine.
- Los idiomas soportados no están disponibles en la información proporcionada.
- Riesgo de alucinación no aplicable en el sentido de texto generado, pero la calidad de la síntesis puede degradarse con entradas fuera del dominio de entrenamiento del modelo base.
- Sin datos de benchmarks estándar ni métricas de latencia/throughput publicadas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- [Hugging Face: rayan-m/kokoro-82m-coreml-fp16](https://huggingface.co/rayan-m/kokoro-82m-coreml-fp16)
- [Modelo base: hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
- [Repositorio de origen: john-rocky/CoreML-Models](https://github.com/john-rocky/CoreML-Models)
