# smdesai/TitaNet-Large-CoreAI

## Resumen

TitaNet-Large-CoreAI es un port del modelo de verificación e identificación de hablante NVIDIA TitaNet-Large (23 millones de parámetros) al runtime Core AI de Apple, orientado a inferencia en dispositivo en iPhone, iPad y Mac. Lo publica el usuario smdesai en HuggingFace y no se trata de un modelo nuevo entrenado desde cero, sino de una reimplementación del grafo del checkpoint original de NVIDIA con pesos en fp16 y cómputo en fp32, empaquetada como bundle `.aimodel` de 47 MB.

El modelo resuelve un problema concreto: obtener el embedding de hablante de 192 dimensiones que produce NeMo, pero ejecutándolo de forma local en hardware Apple sin depender de Python ni de servidores. La ficha del autor reporta una similitud coseno mínima de 0,9999987 frente a `get_embedding` de NeMo sobre 40 grabaciones de VoxCeleb1-test de entre 4,1 y 64,7 segundos, lo que significa que el comportamiento de verificación es prácticamente idéntico al del modelo original.

La innovación técnica principal es el tratamiento de audio de longitud variable: en lugar de compilar varios buckets de longitud (que consumirían entre 768 MB y más de 1,1 GB de arena de activaciones), el grafo se compila para una única ventana de 5,12 segundos y un bucle en el host recorre la señal reconstruyendo exactamente las reducciones globales del modelo. En un iPhone el pico de memoria es de 117 MB y un clip de 65 segundos se embebe en 1,1 segundos usando la GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TitaNet (encoder convolucional con SqueezeExcite y attentive statistics pooling), portado a Core AI |
| Parametros totales | 23 M (modelo base NVIDIA TitaNet-Large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio de cualquier longitud; grafo compilado para ventanas de 512 frames mel (5,12 s) |
| Tipos de cuantizacion | pesos fp16, computo fp32 (`wfp16`) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | bundle Core AI `.aimodel` (fp16), con ficheros auxiliares `export.json` y frontend en float32 |
| Entrada | audio mono a 16 kHz, float en [-1, 1] |
| Dimension del embedding | 192 |
| Umbral de verificacion | 0,7 |
| Tamano del bundle | 47 MB |
| Modelo base | nvidia/speakerverification_en_titanet_large |

## Arquitectura y entrenamiento

El modelo subyacente es TitaNet-Large de NVIDIA, una red convolucional con bloques SqueezeExcite y attentive statistics pooling que produce embeddings de hablante de 192 dimensiones. El port no reentrena: reproduce el grafo del checkpoint original con las mismas buffers de front-end (banco de filtros mel slaney de 80 bins y ventana Hann de 400 muestras) y el mismo preprocesado de NeMo `AudioToMelSpectrogramPreprocessor` en modo eval (pre-énfasis 0,97, STFT centrada de 512 puntos con hop 160, potencia, 80 mels slaney, `log(x + 2^-24)` y normalización por característica sobre los frames válidos). El dither es solo de entrenamiento y no se aplica.

La parte técnica destacable es cómo se gestionan las tres reducciones sobre el eje temporal (las cinco puertas SqueezeExcite, la media y desviación típica del pooling y el softmax de atención sobre el tiempo). El grafo las hace inyectables como entradas y reportables como salidas parciales, de modo que el host reconstruye el valor exacto mediante siete pasadas por ventana más una llamada final a `head`. Las cinco pasadas de SqueezeExcite son necesarias: tras dos barridos el residuo de las puertas cae a 6e-4 y parece convergido, pero el coseno del embedding es aún de 0,64; la secuencia de cosenos por número de barridos es 0,066, 0,639, 0,993, 0,99996 y 0,9999987. Cada ventana conserva 46 frames de contexto real a cada lado (campo receptivo de 93 frames) y solo se retiene el interior, de forma que los interiores teselan el clip exactamente una vez. La acumulación en el host se hace en float64 y su memoria es O(canales), nunca O(frames).

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio mono a 16 kHz.
- Verificación de hablante (1:1) mediante similitud coseno con umbral configurable (0,7 por defecto).
- Identificación de hablante (1:N) comparando el embedding contra una galería de referencia.
- Procesamiento de audio de cualquier duración, desde un frame de 10 ms hasta clips largos, mediante ventaneo en el host.
- Ejecución completamente en dispositivo en iPhone, iPad y Mac a través del runtime Core AI de Apple.
- Equivalencia numérica con NeMo: coseno mínimo de 0,9999987 frente a `get_embedding` en 40 clips de VoxCeleb1-test.
- No soporta tool calling, agentes, generación de texto, visión ni capacidades multimodales; es un modelo puramente de audio.

## Casos de uso

- Desbloqueo o autenticación por voz en apps iOS: el modelo se ejecuta en el dispositivo con un pico de 117 MB de memoria, lo que permite verificar la identidad del usuario sin enviar audio a un servidor y sin coste de latencia de red.
- Diarización y etiquetado de hablantes en grabaciones locales: se extrae un embedding por segmento y se agrupan por similitud coseno, todo dentro de la app en iPhone o Mac.
- Transcripción con atribución de hablante en apps de notas: combinado con un motor ASR local, el embedding permite separar quién dijo qué en reuniones grabadas con el micrófono del dispositivo.
- Control de acceso físico o lógico en entornos con requisitos de privacidad: al no salir el audio del dispositivo, encaja en sectores como sanidad o banca donde el procesamiento en servidor está restringido.
- Verificación de locutor en asistentes de voz embebidos: el modelo puede filtrar comandos de voz no autorizados antes de pasarlos al motor de intención, con inferencia en GPU de 1,1 s para clips de 65 s.
- Investigación en biometría de voz sobre hardware Apple: permite reproducir los resultados de NeMo en un Mac con GPU sin instalar el stack de NeMo, manteniendo la equivalencia numérica con el original.
- Preprocesado de datasets de audio en pipelines locales: generación de embeddings de hablante para indexación o búsqueda por voz en bibliotecas de podcasts o archivos personales.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan el port con el propio NeMo, no con otros modelos de verificación de hablante.

| Comprobacion | Clips | Coseno a NeMo (min / media) | Notas |
|---|---|---|---|
| WAV → host Python → Core AI (Mac, GPU) | 40 de VoxCeleb1-test, 4,1–64,7 s | 0,9999987 / 0,9999993 | pipeline completo: front-end mel, host ventaneado y grafo |
| Mel de NeMo → host Swift → Core AI (iPhone, GPU) | mismos 40 | 0,9999987 / 0,9999993 | todos los embeddings finitos |

El autor cita un EER del 0,66 % en VoxCeleb1 (cleaned trials) reportado por NVIDIA para el modelo base, pero indica que este port no se ha reevaluado por separado en ese benchmark.

## Requisitos de hardware

- Pico de memoria en iPhone: 117 MB durante la inferencia.
- Bundle de 47 MB en disco, con pesos fp16 y cómputo fp32.
- Hardware objetivo: iPhone, iPad y Mac con soporte del runtime Core AI de Apple; la inferencia se ejecuta en GPU.
- Latencia reportada: 1,1 s para embeber un clip de 65 segundos en un iPhone.
- No requiere GPU de servidor ni aceleradores dedicados; no está pensado para despliegue en vLLM, llama.cpp, Ollama o TGI, ya que el formato es un bundle `.aimodel` específico de Core AI.
- El coste computacional escala con el número de ventanas: un clip de n frames mel usa 1 ventana si n ≤ 512 y, en caso contrario, ⌈(n − 512) / 420⌉ + 1 ventanas, con 7 × ventanas + 1 llamadas al modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Embedding | Licencia | Despliegue |
|---|---|---|---|---|---|
| TitaNet-Large-CoreAI (este) | 23 M | audio 16 kHz mono | 192 d | cc-by-4.0 | Core AI en dispositivo Apple |
| nvidia/speakerverification_en_titanet_large | 23 M | audio 16 kHz mono | 192 d | no disponible en la informacion | NeMo, GPU NVIDIA |
| Alternativas de verificación de hablante de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el checkpoint original de NVIDIA, del que este port es una reimplementación con equivalencia numérica casi exacta (coseno ≥ 0,9999987) y un objetivo de despliegue distinto: en dispositivo Apple en lugar de NeMo sobre GPU NVIDIA.

## Limitaciones y advertencias

- Solo soporta inglés; el modelo base está entrenado con audio en inglés y no se documenta comportamiento en otros idiomas.
- Requiere audio mono a 16 kHz; cualquier otra frecuencia debe remuestrearse antes de la inferencia.
- El modelo es de verificación e identificación de hablante, no un modelo generativo: no produce texto ni responde a instrucciones.
- El EER de 0,66 % en VoxCeleb1 es el reportado por NVIDIA para el modelo base; este port no se ha reevaluado por separado en ese benchmark.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero conviene verificar la licencia del checkpoint original de NVIDIA antes de un despliegue en producción.
- El uso de biometría de voz está sujeto a normativa de protección de datos (RGPD en la UE) y a requisitos de consentimiento y tratamiento de datos biométricos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.
- El modelo puede presentar sesgos heredados de los datos de entrenamiento de NVIDIA (VoxCeleb y corpus similares), con posible degradación en acentos, edades o condiciones acústicas poco representadas.
- El rendimiento depende de la calidad del audio; ruido de fondo, reverberación o micrófonos deficientes pueden reducir la precisión de la verificación.
- La precisión del port depende del bucle de host en float64; implementaciones alternativas del ventaneo podrían degradar la equivalencia con NeMo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smdesai/TitaNet-Large-CoreAI
- Modelo base NVIDIA TitaNet-Large: https://huggingface.co/nvidia/speakerverification_en_titanet_large
