# soniqo/Kokoro-82M-LiteRT

## Resumen

Kokoro-82M-LiteRT es la exportación del modelo de síntesis de voz Kokoro-82M de hexgrad a un paquete LiteRT/TFLite en FP32 pensado para inferencia en CPU. Lo publica el usuario soniqo bajo licencia Apache 2.0 y mantiene los 82 millones de parámetros del modelo original, una arquitectura no autorregresiva de una sola pasada que genera audio mono a 24 kHz. El problema que resuelve es concreto: llevar un TTS de calidad razonable a dispositivos Android y entornos arm64 sin GPU, sin dependencias de Python ni servicios en la nube.

El paquete se divide en tres grafos encadenados (encoder de texto, etapa recurrente con LSTMs empaquetados y vocoder con iSTFT y fases armónicas explícitas) más los diccionarios de pronunciación y una única voz incluida, `af_heart`, con un embedding de 256 valores Float32. La versión actual, v2.0.0, establece un contrato de salida de 120 frames (3,0 segundos) con 128 slots de entrada de texto y una ventana activa de 32 tokens por invocación; el texto más largo se trocea en el host.

Su relevancia ahora es que valida una ruta de despliegue on-device verificable: la correlación de forma de onda con la implementación FP32 en PyTorch es de 0,99924 y el audio resulta bit a bit idéntico entre un Galaxy S23 Ultra físico y un emulador arm64 a través del wrapper `speech-core`. Frente a la v1.0.0, la v2.0.0 reduce el error de palabra medido por ASR del 6,2 % al 1,9 % en el mismo dispositivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No autorregresiva, una sola pasada; tres grafos LiteRT encadenados (encoder de texto tipo ALBERT, etapa recurrente con LSTMs de tokens empaquetadas y vocoder con iSTFT) |
| Parámetros totales | 82M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como ventana de LLM: 128 slots de tokens de texto de entrada, ventana activa de 32 tokens por invocación; salida fija de 120 frames (72.000 muestras, 3,0 s) |
| Tipos de cuantización | Solo FP32; no se publican variantes INT8, INT4 ni GGUF |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT / TFLite (`.tflite`), FP32 |
| Frecuencia de muestreo | 24 kHz, mono, Float32 PCM |
| Voz incluida | `af_heart` (embedding Float32 de 256 valores, 1.024 bytes) |
| Tamano del bundle | 334.176.844 bytes en total (319 MiB); repositorio de 0,6 GB |
| Ficheros principales | `kokoro-encoder.tflite` (47,9 MB), `kokoro-recurrent-packed32-120.tflite` (45,1 MB), `kokoro-vocoder-120.tflite` (241,2 MB) |
| Runtime de referencia | LiteRT 2.1.5 con XNNPACK, 8 hilos; wrapper C++ `speech-core` |
| Modelo base | hexgrad/Kokoro-82M |

## Arquitectura y entrenamiento

El modelo original es un TTS de 82M de parámetros con arquitectura no autorregresiva que sintetiza la locución completa en una sola pasada, en lugar de generar muestras de audio de forma secuencial. La exportación a LiteRT conserva esa estructura en tres etapas: un encoder de texto que rellena 32 de los 128 slots de tokens disponibles, una etapa recurrente con LSTMs de tokens empaquetadas y un vocoder que reconstruye la forma de onda mediante iSTFT con fases armónicas explícitas. Cada LSTM de tokens recorre únicamente su prefijo válido, de modo que la dirección backward arranca en el último fonema y el padding nunca alcanza una salida válida; las proyecciones de entrada se ejecutan una vez por secuencia, fuera de los bucles compactos de LiteRT.

No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF/DPO), que corresponden al trabajo original de hexgrad. Lo que sí documenta esta ficha es el trabajo de conversión: se usaron fases armónicas explícitas, bucles recurrentes compactos en FP32 y una ruta iSTFT compatible con LiteRT. La validación frente a PyTorch FP32 con secuencias empaquetadas, sobre tokens, voz, velocidad y fases idénticas, da una correlación de forma de onda de 0,99924, una correlación de espectrograma de magnitud de 0,99982 y cero discrepancias de duración; la matriz de equivalencia recurrente no presenta fallos en 42 casos de longitud y velocidad.

La v2.0.0 corrige el defecto principal de la v1.0.0: el grafo recurrente anterior recorría el padding de ceros antes de llegar al último fonema y predecía duraciones demasiado cortas, sobre todo en respuestas breves. El contrato de 60 frames de la v1.0.0 solo albergaba una o dos palabras por pieza; el de 120 frames mantiene las duraciones alineadas con el Kokoro original. La duración declarada por el modelo se comprueba tras la etapa recurrente y toda salida por encima de 116 frames (2,9 s) debe descartarse y reintentarse con un texto más corto, ya que los cuatro frames finales del tensor quedan reservados como contexto derecho.

## Capacidades

- Síntesis de voz en inglés a 24 kHz con salida PCM Float32 mono, en una sola pasada no autorregresiva.
- Control de velocidad de habla mediante `set_speed` (los benchmarks se tomaron a velocidad 1.0).
- Generación determinista: `set_seed` fija la semilla y el audio resulta bit a bit idéntico entre dispositivos con el mismo bundle.
- Troceado de texto en el host para entradas largas, con hasta 32 tokens por invocación a velocidad 1.0.
- Entrega de audio por callback por piezas, con marca `is_final` para ensamblar la locución completa.
- Fonemización en inglés integrada en el wrapper, con diccionario principal `us_gold.json` (3,0 MB) y de respaldo `us_silver.json` (3,1 MB) y mapeo símbolo IPA a token en `vocab_index.json`.
- Guarda de duración y reintento automático con división del texto cuando la salida excede el límite seguro de frames.
- Inferencia en CPU sin aceleración por GPU (`hw_accel=false`), orientada a Android y arm64.
- No soporta clonación de voz, cambio de idioma, entrada de audio, tool calling ni razonamiento multi-paso: es exclusivamente un modelo de texto a voz con una voz fija.

## Casos de uso

- **Asistentes de voz on-device en Android**: el bundle se ejecuta en CPU con LiteRT y XNNPACK, de modo que un asistente puede responder sin enviar texto a la nube; el coste medido es de 6,7 s para una respuesta de 24 palabras en un Snapdragon 8 Gen 2, con un pico de RSS de 1.062 MiB.
- **Lectura de notificaciones y mensajes en aplicaciones móviles**: el troceado en el host y el callback por piezas permiten encolar fragmentos de hasta 32 tokens y reproducirlos según llegan, sin esperar a sintetizar el mensaje completo.
- **Navegación y avisos por voz en vehículo o GPS sin conectividad**: al no requerir red ni GPU, encaja en escenarios de conducción donde la latencia de red no es fiable; las instrucciones cortas son precisamente el caso que la v2.0.0 corrige respecto a la v1.0.0.
- **Accesibilidad para personas con discapacidad visual**: lectura de contenido en pantalla en inglés con una voz natural a 24 kHz; la tasa de error de palabra del 1,9 % medida con Parakeet TDT v3 sobre 21 respuestas es aceptable para lectura de textos informativos.
- **Kioscos, paneles e IoT embebido en arm64**: el paquete de 319 MiB en FP32 y una única voz de 1.024 bytes simplifican el despliegue en imágenes de sistema cerradas; el emulador arm64 produce audio idéntico al dispositivo físico, lo que facilita la validación previa al despliegue.
- **Regresión automatizada de pipelines de voz**: la determinación bit a bit con semilla fija y la equivalencia numérica con PyTorch permiten usar comparaciones de audio como prueba de integración continua en builds de `speech-core`.
- **Prototipado de interfaces conversacionales en C++**: la API de `speech_core::LiteRTKokoroTts` permite integrar TTS en una aplicación nativa con pocas líneas y sin pila de Python, útil para demos y pruebas de concepto de asistentes locales.
- **Sistemas de alerta y emergencia con privacidad de datos**: mensajes predefinidos sintetizados localmente, sin que el texto salga del dispositivo, en entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible; no aplican a un modelo de texto a voz. Los datos publicados son de validación numérica y de rendimiento en dispositivo.

Validación frente a PyTorch FP32 con secuencias empaquetadas:

| Comprobación | Resultado |
|---|---|
| Correlación de forma de onda | 0,99924 |
| Correlación de espectrograma de magnitud | 0,99982 |
| Error absoluto máximo de duración | 0 |
| Casos con discrepancia de duración | 0 |
| Matriz de equivalencia recurrente | 0 fallos en 42 casos de longitud y velocidad |
| Audio en Galaxy S23 Ultra físico frente a emulador arm64 | Idéntico bit a bit |

Rendimiento en Samsung Galaxy S23 Ultra (SM-S918B, Snapdragon 8 Gen 2), Android 16, LiteRT 2.1.5, XNNPACK, 8 hilos, una ejecución de calentamiento y diez medidas, respuesta de 24 palabras:

| Bundle | Tiempo | Piezas | RSS máximo | Respuestas transcritas exactamente | Errores de palabra |
|---|---:|---:|---:|---:|---:|
| v2.0.0, 120 frames | 6,7 s | 5 | 1.062 MiB | 19 de 21 | 1,9 % |
| v1.0.0, 60 frames | 9,4 s | 14 | 1.003 MiB | 15 de 21 | 6,2 % |

La calidad se midió con Parakeet TDT v3 sobre 21 respuestas de asistente sintetizadas en el propio teléfono. No se publica el factor de tiempo real (RTF) ni la latencia por token.

## Requisitos de hardware

- **VRAM**: no aplica; la inferencia es en CPU. El consumo medido es de RSS máximo de 1.062 MiB con la v2.0.0 y 1.003 MiB con la v1.0.0.
- **Almacenamiento**: 319 MiB para los tres grafos de la v2.0.0, más los diccionarios de pronunciación (unos 6 MB) y el embedding de voz (1 KB). El repositorio completo ocupa 0,6 GB porque conserva los ficheros de la v1.0.0.
- **CPU recomendada**: el bundle se validó en un Snapdragon 8 Gen 2 de ocho núcleos con ocho hilos de ejecución y XNNPACK; cualquier arm64 con memoria suficiente para unos 1,1 GiB de RSS debería poder ejecutarlo, aunque no se publican medidas en otras plataformas.
- **GPU**: no se requiere ni se usa; el ejemplo de la API construye el objeto con `hw_accel=false`. No hay datos de aceleración por GPU o NPU para este bundle.
- **Cabe en hardware de consumo**: sí, en el sentido de que corre en CPU de teléfono de gama alta; el pico de memoria de ~1 GiB es el factor limitante en dispositivos con poca RAM.
- **Opciones de despliegue**: LiteRT/TFLite (runtime de referencia 2.1.5) con el wrapper C++ `speech-core`, que aporta fonemizador inglés, troceado de tokens, guarda de duración, reintento por división, comprobaciones de forma de onda y ensamblado final. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es TFLite y el modelo no es un LLM.
- **Latencia y throughput**: 6,7 s por una respuesta de 24 palabras dividida en 5 piezas en el S23 Ultra; la v1.0.0 tardaba 9,4 s en 14 piezas. No se publican medidas de throughput agregado ni de RTF.
- **Reproducción del benchmark**: objetivo `speech_kokoro_litert_bench` de `speech-core`, con parámetros `--variant packed32-120 --threads 8 --warmup 1 --runs 10`.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / despliegue | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kokoro-82M-LiteRT (esta ficha) | 82M | LiteRT/TFLite FP32, CPU | 128 slots, ventana activa de 32 tokens, salida de 3,0 s | Apache 2.0 | HuggingFace, 136 descargas |
| hexgrad/Kokoro-82M (original) | 82M | Pesos PyTorch; requiere pila Python | No disponible en la información consultada | Apache 2.0 | HuggingFace; es el modelo base de esta conversión |
| Ports ONNX/GGUF de Kokoro (comunidad) | 82M (derivados) | ONNX, GGUF; requieren runtime propio | No disponible | Apache 2.0 (heredada del base) | No se han consultado en esta búsqueda |
| Piper TTS | No disponible | Runtime propio orientado a dispositivo | No disponible | No disponible en la información consultada | No disponible |

La comparación relevante es contra el propio Kokoro-82M en PyTorch: este bundle sacrifica flexibilidad de voces y plataforma a cambio de inferencia en CPU móvil con equivalencia numérica demostrada (correlación de 0,99924) y determinismo bit a bit. Frente a Piper, la ventaja documentada aquí es la validación explícita de equivalencia y el contrato de frames; no hay datos en la información disponible para comparar calidad subjetiva, latencia o número de voces.

## Limitaciones y advertencias

- **Solo inglés**: el campo `language` es `en`, el fonemizador del wrapper es inglés y los diccionarios son de pronunciación estadounidense (`us_gold`, `us_silver`). Otros idiomas o acentos no están soportados.
- **Una única voz**: solo se incluye `af_heart`; no hay clonación de voz ni selección entre locutores en este bundle.
- **Contrato de salida rígido**: salida fija de 120 frames (3,0 s) con límite seguro de 116 frames. Las salidas por encima de ese límite se descartan y obligan a reintentar con texto más corto; a velocidad 1.0 el máximo práctico es de 32 tokens por invocación.
- **Calidad dependiente del troceado**: la prosodia se resiente en fragmentos muy cortos; los propios datos del autor muestran que la v1.0.0, con piezas de 60 frames, generaba 14 piezas y un 6,2 % de errores de palabra frente a 5 piezas y 1,9 % de la v2.0.0.
- **Consumo de memoria elevado para móvil**: un pico de 1.062 MiB de RSS puede provocar cierres por presión de memoria en dispositivos de gama media o con muchas aplicaciones en segundo plano.
- **Error de palabra medido**: 1,9 % en la evaluación con Parakeet TDT v3 sobre 21 respuestas; es una métrica de ASR sobre un conjunto pequeño, no una evaluación perceptual humana.
- **Riesgo de alucinación en sentido estricto**: no aplica generación de texto libre, pero un TTS puede producir pronunciaciones incorrectas de nombres propios, siglas y términos técnicos no cubiertos por los diccionarios; conviene revisar el texto antes de sintetizar en contextos críticos.
- **Sesgos**: los diccionarios y el corpus del modelo base son de inglés estadounidense, lo que puede infrarepresentar variantes dialectales y nombres no anglosajones.
- **Licencia**: Apache 2.0, que permite uso comercial y modificación con obligación de conservar el aviso de licencia; el modelo base hexgrad/Kokoro-82M es también Apache 2.0 según la información disponible.
- **Compatibilidad de versiones**: las releases antiguas de `speech-core` solo cargan los ficheros de la v1.0.0; mezclar encoder y grafos de distintas versiones o usar el vocoder de 60 frames con el recurrente de 120 rompe el contrato de frames.
- **Sin aceleración por GPU**: la ruta documentada es CPU con XNNPACK; no hay datos de rendimiento con delegados de GPU o NPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soniqo/Kokoro-82M-LiteRT
- Árbol de ficheros del repositorio: https://huggingface.co/soniqo/Kokoro-82M-LiteRT/tree/main
- Modelo base hexgrad/Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio GitHub de Kokoro: https://github.com/hexgrad/kokoro
- Guía de autoalojamiento y especificaciones (LLM API): https://llmapi.ai/models/hexgrad-kokoro-82m/
- Requisitos, licencia y rendimiento (Local AI): https://local-ai.net/models/kokoro-82m/
- Paper técnico: no disponible en la información consultada
