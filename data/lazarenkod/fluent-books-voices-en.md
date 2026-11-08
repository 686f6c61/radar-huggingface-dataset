# lazarenkod/fluent-books-voices-en

## Resumen

Fluent Books Voices EN (ronda r6) es una colección de ocho modelos de síntesis de voz (text-to-speech) en inglés, publicados por Dmitry Lazarenko (usuario `lazarenkod`) bajo el proyecto Fluent Books. Cada archivo ONNX corresponde a una voz concreta, destilada a partir de una de las ocho voces inglesas del modelo Kokoro-82M (`af_heart`, `af_kore`, `am_michael`, `am_fenrir`, `bf_emma`, `bf_isabella`, `bm_george`, `bm_fable`). Cuatro voces son de inglés estadounidense y cuatro de inglés británico.

El objetivo es claro: llevar la lectura en voz alta de libros a un teléfono móvil, ejecutando la inferencia en el procesador del dispositivo. Para ello, cada estudiante pesa solo 8,57 MB en cuantización int8, una reducción drástica frente a los aproximadamente 82 millones de parámetros del profesor. El modelo no genera voz a partir de texto directamente: recibe una secuencia de identificadores de fonemas en el vocabulario de Kokoro (114 símbolos de estilo espeak) y un factor de velocidad, y devuelve una forma de onda a 24 kHz junto con la duración de cada token.

La relevancia actual reside en que demuestra que la destilación de un TTS de calidad media-alta (UTMOS en torno a 4,0-4,4) puede comprimirse hasta menos de 9 MB sin renunciar a una similitud de hablante superior a 0,95 en la mayoría de las voces. Es una pieza útil para aplicaciones de lectura offline, audiolibros ligeros o asistentes embebidos donde el presupuesto de almacenamiento y cómputo es mínimo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS neuronal destilado de Kokoro-82M (estudiante por voz, exportado a ONNX) |
| Parámetros totales | no disponible (el profesor tiene 82M; el estudiante ocupa 8,57 MB en int8) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada: secuencia de fonemas `[1,N]`) |
| Tipos de cuantización | int8 (`_int8.onnx`) |
| Idiomas soportados | inglés (cuatro voces en-US, cuatro en-GB) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (un archivo por voz) |
| Frecuencia de muestreo | 24 kHz |
| Vocabulario de entrada | 114 símbolos fonéticos de Kokoro (`vocab.json`) |
| Salida | `waveform [1,S]` y `durations [1,T]`, con `S = 600 · sum(durations)` |
| Entradas | `input_ids` int64 `[1,N]` (con `[0] + ids + [0]`), `speed` float32 `[1]` |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Cada archivo es un modelo estudiante independiente entrenado por destilación a partir de una voz concreta de Kokoro-82M. La entrada es una secuencia de identificadores fonéticos de Kokoro, delimitada por el token 0 al principio y al final, junto con un escalar de velocidad. La salida combina una forma de onda a 24 kHz y la duración estimada de cada token, lo que permite controlar el ritmo de la locución. La receta de entrenamiento se denomina "A" en el proyecto y produce modelos de 8,57 MB en int8.

Los datos de entrenamiento consistieron en habla sintetizada por las voces del profesor Kokoro-82M indicadas, junto con frases extraídas de libros de dominio público. El autor no detalla el número de tokens ni la composición exacta del corpus. La model card advierte explícitamente de que el origen de los datos de las voces del profesor no está confirmado por los autores del repositorio, aunque Kokoro-82M se distribuye como Apache-2.0 y los pesos de este proyecto se declaran bajo la misma licencia. El entrenamiento se realizó en noviembre de 2026 con las herramientas del directorio `tools/distill` del proyecto Fluent Books.

## Capacidades

- Síntesis de voz en inglés a partir de fonemas: convierte una secuencia de identificadores fonéticos de Kokoro en una forma de onda de 24 kHz.
- Ocho voces diferenciadas: cuatro estadounidenses (`af_heart`, `af_kore`, `am_michael`, `am_fenrir`) y cuatro británicas (`bf_emma`, `bf_isabella`, `bm_george`, `bm_fable`).
- Control de velocidad mediante el parámetro `speed` (float32).
- Predicción de duraciones por token, lo que facilita la sincronización con texto resaltado o subtítulos.
- Inferencia en CPU de teléfono: el formato ONNX y el tamaño reducido permiten ejecución local sin GPU.
- No soporta tool calling, agentes, razonamiento multietapa ni otras capacidades de los modelos de lenguaje: es exclusivamente un modelo TTS.
- No realiza normalización de texto: los números, abreviaturas y fechas deben normalizarse antes de convertirlos a fonemas.

## Casos de uso

- Lectura de libros en voz alta en el móvil: la aplicación Fluent Books usa estos modelos para narrar libros ejecutando la inferencia en el procesador del teléfono, sin conexión y con un coste de almacenamiento inferior a 9 MB por voz.
- Audiolibros offline en dispositivos de gama baja: al caber en 8,57 MB y ejecutarse sobre ONNX en CPU, es viable en terminales sin acelerador neuronal dedicado.
- Sincronización de texto y audio: la salida de duraciones por token permite resaltar la palabra o frase que se está pronunciando, útil en aplicaciones de lectura asistida o aprendizaje de idiomas.
- Narración de contenido dinámico: artículos, noticias o correos que se convierten a fonemas y se sintetizan al vuelo con una voz concreta, sin depender de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: lectura de documentos y libros electrónicos con voces británicas o estadounidenses seleccionables.
- Prototipado de asistentes de voz embebidos: integración en sistemas con recursos limitados (Raspberry Pi, wearables) donde un TTS de 82M no es viable.
- Generación de audio para pruebas de UX: producción de clips de voz cortos con distintas voces para validar interfaces conversacionales antes de contratar un TTS comercial.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre 60 frases reservadas (WER con Whisper, UTMOS frente al profesor, similitud de hablante y detector de artefactos audibles `tools/distill/artifact_card31.py`):

| Voz | UTMOS (profesor) | WER % | Similitud de voz | Características sobre umbral 31 | Fase / ruido / claridad (σ del profesor) |
|---|---|---|---|---|---|
| af_heart | 4,40 (4,51) | 2,6 | 0,961 | 0 | +0,99 / +0,70 / -0,08 |
| am_michael | 4,18 (4,32) | 3,3 | 0,971 | 1 (fase) | +1,10 / +0,98 / +0,27 |
| am_fenrir | 4,28 (4,45) | 3,4 | 0,956 | 2 (fase, ruido) | +1,27 / +1,34 / +0,32 |
| af_kore | 4,43 (4,49) | 3,3 | 0,959 | 2 (fase, ruido) | +2,69 / +2,34 / +0,89 |
| bm_fable | 4,08 (4,30) | 3,1 | 0,968 | 2 (fase, ruido) | +1,27 / +1,43 / +0,60 |
| bf_isabella | 4,08 (4,38) | 3,3 | 0,968 | 2 (fase, ruido) | +1,57 / +1,68 / +0,74 |
| bf_emma | 4,19 (4,37) | 3,3 | 0,971 | 2 (claridad, ritmo) | +0,71 / +0,47 / +1,03 |
| bm_george | 3,98 (4,28) | 3,3 | 0,973 | 6 (fase, ruido, tono, vocal, ritmo, nivel) | +2,13 / +2,20 / +0,85 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, MOS subjetivo con oyentes humanos) en la información disponible. El propio autor advierte de que el detector de artefactos es una guía y no sustituye a la escucha.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para CPU y cada archivo int8 ocupa 8,57 MB.
- GPU recomendadas: no son necesarias. Cualquier CPU moderna de teléfono puede ejecutar la inferencia; en servidor, una GPU no aporta ventaja significativa por el tamaño del modelo.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en dispositivos móviles, Raspberry Pi y wearables.
- Opciones de despliegue: ONNX Runtime (principal), con posibilidad de exportación a otros runtimes compatibles con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles en la información proporcionada. La forma de onda se genera a 24 kHz y la duración total depende de la suma de duraciones de los tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fluent Books Voices EN r6 | 8,57 MB por voz (int8) | Secuencia de fonemas Kokoro | Inglés (US y GB) | Apache-2.0 | Hugging Face, ONNX |
| Kokoro-82M (profesor) | 82M | Texto (fonemas Kokoro) | Inglés y otros | Apache-2.0 | Hugging Face |
| Piper TTS | no disponible | Texto | Múltiples | MIT (mayoritariamente) | Hugging Face, ONNX |
| Coqui XTTS v2 | no disponible | Texto | Multilingüe | Coqui Public Model License (no comercial) | Hugging Face |

La comparación con Piper y XTTS se ofrece como referencia de categoría; no se dispone de mediciones cruzadas en la información proporcionada. Frente a Kokoro-82M, la propuesta de Fluent Books reduce el tamaño en un orden de magnitud a cambio de una pérdida de UTMOS de entre 0,06 y 0,30 puntos y una similitud de hablante de 0,956-0,973.

## Limitaciones y advertencias

- Solo inglés: no hay soporte para castellano ni otros idiomas.
- Requiere normalización previa del texto (números, abreviaturas, fechas); el modelo no la realiza.
- El detector de artefactos marca características audibles en la mayoría de las voces; `bm_george` acumula seis, sobre un conjunto de solo doce grabaciones del profesor.
- El origen de los datos de las voces del profesor Kokoro-82M no está confirmado por los autores del repositorio; la licencia Apache-2.0 se declara sobre la lectura de esas fuentes, lo que introduce incertidumbre para uso comercial.
- Riesgo de alucinación acústica: al ser un modelo generativo, puede producir artefactos, ruido o pronunciaciones incorrectas en fonemas poco frecuentes.
- No es un modelo de lenguaje: no razona, no sigue instrucciones en texto libre ni soporta tool calling.
- La calidad es inferior a la del profesor en todas las voces medidas; para producciones de alta fidelidad conviene usar Kokoro-82M directamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lazarenkod/fluent-books-voices-en
- Perfil del autor: https://huggingface.co/lazarenkod
- Datasets del autor: https://huggingface.co/lazarenkod/datasets
- Kokoro-82M (modelo profesor): https://huggingface.co/hexgrad/Kokoro-82M
- Proyecto Fluent Books (referenciado en la model card, sin URL directa en la información disponible)
