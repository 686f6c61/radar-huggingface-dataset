# smdesai/TitaNet-Large-CoreML

## Resumen

TitaNet-Large-CoreML es una conversión a Core ML del modelo TitaNet-Large de NVIDIA, un sistema de verificación e identificación de hablante (speaker verification/identification) basado en redes neuronales. El modelo original, de 23 millones de parámetros, genera embeddings de 192 dimensiones a partir de audio de voz de 16 kHz, y esta versión lo empaqueta como ML Programs para ejecución en dispositivo (on-device) en iPhone, iPad y Mac con iOS 17 / macOS 14 o superior. El autor de la conversión es smdesai, que publica el modelo bajo licencia CC-BY-4.0.

La relevancia de esta ficha radica en que traslada un modelo de verificación de hablante de NVIDIA al ecosistema Apple, permitiendo inferencia local sin conexión a servidores. La conversión resuelve un problema técnico no trivial: TitaNet aplica tres reducciones sobre el eje temporal completo (gates SqueezeExcite, pooling de media/desviación y softmax de atención), lo que impide procesar ventanas independientes sin degradar el resultado. El autor implementa un esquema de dos modelos (`scan` + `head`) con estadísticas inyectables y reportables que reconstruye exactamente esas reducciones globales mediante un bucle en el host.

El resultado es un port que mantiene una similitud coseno de hasta 0.9999999994 frente a la implementación de referencia de NeMo en la variante fp32, y de 0.9968 en la variante fp16c ejecutada en Neural Engine, con tiempos de 0.22 s para un clip de 65 s en iPhone. El modelo base reporta un 0.66 % EER en VoxCeleb1 (cleaned trials) según NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TitaNet (red convolucional 1D con SqueezeExcite y attentive statistics pooling), exportada a Core ML |
| Parametros totales | 23 M (modelo base NVIDIA TitaNet-Large) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana fija de 5.12 s (512 frames) por pasada; audio de cualquier duración mediante bucle en el host |
| Tipos de cuantizacion | fp32 (88.5 MB) y fp16c (46.7 MB, scan en fp16 con momentos de atención centrados y head en fp32) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | Core ML `.mlpackage` (compilado a `.mlmodelc` por Xcode); buffers de front-end en `.f32` little-endian |

## Arquitectura y entrenamiento

El modelo base es TitaNet-Large de NVIDIA, una red neuronal convolucional 1D diseñada para extraer embeddings de hablante (speaker embeddings) de 192 dimensiones a partir de espectrogramas mel. La arquitectura incorpora bloques con SqueezeExcite, pooling de estadísticas atentivas (attentive statistics pooling) y tres reducciones sobre el eje temporal completo: los gates SqueezeExcite, la media y desviación del pooling, y el softmax de atención. El front-end reproduce paso a paso el `AudioToMelSpectrogramPreprocessor` de NeMo en modo evaluación: pre-énfasis de 0.97, STFT centrada de 512 puntos con hop 160 y ventana Hann de 400, potencia, 80 bins mel slaney, `log(x + 2^-24)` y normalización por característica sobre los frames válidos. El dither es solo de entrenamiento y no se aplica.

La innovación técnica del port es el esquema de ventana fija con estadísticas inyectables. Dado que Neural Engine requiere una forma de entrada fija, el autor divide el cómputo en dos modelos: `scan` procesa cada ventana de 5.12 s y `head` genera el embedding final. Para reconstruir exactamente las reducciones globales, el host ejecuta siete pasadas sobre las ventanas: cinco para el punto fijo de SqueezeExcite (el gate del bloque j depende solo de los gates anteriores, de modo que cinco barridos hacen exactos los cinco gates), una para la media y desviación del pooling a partir de sumas acumuladas, y una para el softmax de atención combinando máximos y denominadores entre ventanas. Cada convolución es de stride 1 con padding "same" y el campo receptivo del stack es de 93 frames, por lo que cada ventana conserva 46 frames de contexto real a cada lado y solo se retiene el interior. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio de voz mono a 16 kHz.
- Verificación de hablante (speaker verification): comparación de dos embeddings mediante similitud coseno con umbral de referencia de 0.7.
- Identificación de hablante (speaker identification): comparación de un embedding contra un conjunto de referencia.
- Procesamiento de audio de cualquier duración desde un frame de 10 ms en adelante, mediante bucle de ventanas en el host.
- Ejecución on-device en iPhone, iPad y Mac con iOS 17 / macOS 14 o superior.
- Aceleración por GPU, CPU y Neural Engine según la variante (fp32 en GPU/CPU; fp16c en Neural Engine y GPU).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio general ni otras modalidades: es un modelo especializado exclusivamente en biometría de voz.

## Casos de uso

- Desbloqueo y autenticación biométrica local en apps iOS: el modelo verifica la identidad del hablante comparando el embedding del audio capturado con el enrolado, con umbral de 0.7 y sin enviar audio a servidores, lo que reduce latencia y cumple con privacidad on-device.
- Identificación de participantes en reuniones o transcripciones: dado un clip de audio, el host genera embeddings por segmento y los compara contra una galería de hablantes conocidos para etiquetar quién habla en cada tramo.
- Control de acceso a dispositivos o aplicaciones mediante frase de paso: el modelo permite verificar que la persona que pronuncia una frase es el usuario registrado, aprovechando la ventana de 5.12 s y el procesamiento de clips largos.
- Detección de suplantación en call centers: integración en el flujo de atención telefónica para comparar la voz del cliente con la registrada previamente, con la ventaja de ejecución local en Mac o iPhone sin depender de la nube.
- Indexación y búsqueda de archivos de audio por hablante: procesamiento por lotes de grabaciones largas en Mac, generando un embedding por segmento y agrupando por similitud coseno para organizar archivos.
- Verificación de locutor en aplicaciones de notas de voz o diarios personales: el modelo puede etiquetar automáticamente entradas por hablante o restringir el acceso a grabaciones privadas según la voz del propietario.
- Prototipado e investigación en biometría de voz sobre hardware Apple: la variante fp32 ofrece una fidelidad prácticamente exacta respecto a NeMo (coseno 0.9999999994), lo que permite validar pipelines y comparar resultados sin GPU dedicada.

## Benchmarks y rendimiento

Los datos publicados comparan los embeddings del port con los de NeMo sobre 40 clips de VoxCeleb1-test de entre 4.1 y 64.7 s.

| Variante · cómputo | Coseno a NeMo (mín / media) | Notas |
|---|---|---|
| fp32 · GPU | 0.9999999994 / 0.9999999998 | pipeline completo en Mac |
| fp16c · Neural Engine | 0.99684 / 0.99857 | |
| fp16c · GPU | 0.99966 / 0.99984 | |
| fp32 · GPU (iPhone) | 0.9999999994 / 0.9999999998 | media 0.36 s por clip |
| fp16c · Neural Engine (iPhone) | 0.99682 / 0.99857 | media 0.077 s por clip |

Error de puntuación de verificación frente a NeMo sobre 780 pares de los 40 clips (score = (cos + 1) / 2):

| Variante · cómputo | Error medio | p99 | Peor caso |
|---|---|---|---|
| fp32 · GPU | 0.00000 | 0.00002 | 0.00004 |
| fp16c · GPU | 0.0006 | 0.0034 | 0.0040 |
| fp16c · Neural Engine | 0.0019 | 0.0083 | 0.0107 |

NVIDIA reporta 0.66 % EER en VoxCeleb1 (cleaned trials) para el modelo base; el port no fue re-evaluado por separado en ese benchmark. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es de propósito general.

## Requisitos de hardware

- VRAM/RAM: el modelo fp32 ocupa 88.5 MB en disco y pico de 64.4 MB de memoria en iPhone; el fp16c ocupa 46.7 MB y pico de 95.2 MB. La memoria no crece con la duración del clip (59.5 MB tras 4 s y 59.6 MB tras 65 s en iPhone con fp32).
- GPU recomendadas: no aplica el concepto de GPU de datacenter; el modelo está diseñado para GPU integrada de Apple, CPU y Neural Engine de iPhone, iPad y Mac.
- Cabe en cualquier dispositivo Apple compatible con iOS 17 / macOS 14 o superior, incluidos iPhone y iPad de gama media; no requiere GPU dedicada.
- Opciones de despliegue: Core ML en Xcode (compilación de `.mlpackage` a `.mlmodelc`), ejecución mediante el framework Core ML en apps nativas; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: en iPhone19,4, un clip de 65 s tarda 0.99 s en fp32 con GPU y 0.22 s en fp16c con Neural Engine; el coste medio por clip es de 0.36 s (fp32) y 0.077 s (fp16c).
- Existe una build Core AI del mismo port para iOS 27 / macOS 27 en `smdesai/TitaNet-Large-CoreAI`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TitaNet-Large-CoreML (este) | 23 M | Ventana 5.12 s, audio de cualquier duración | 0.66 % EER (base, VoxCeleb1); coseno a NeMo hasta 0.9999999994 | CC-BY-4.0 | HuggingFace, Core ML |
| nvidia/speakerverification_en_titanet_large | 23 M | No disponible en la información | 0.66 % EER en VoxCeleb1 (cleaned trials) | No disponible en la información | HuggingFace, NeMo |
| smdesai/TitaNet-Large-CoreAI | 23 M | No disponible en la información | No disponible en la información | No disponible en la información | HuggingFace, Core AI (iOS 27 / macOS 27) |

No se dispone de datos de otros modelos comparables de verificación de hablante en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés (`en`) y está entrenado con audio de 16 kHz; cualquier otra frecuencia debe remuestrearse antes de la inferencia.
- Es un modelo especializado en biometría de voz: no genera texto, no razona, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de propósito general.
- Riesgo de sesgo y equidad: no se documentan análisis de sesgo por acento, género, edad o idioma; el rendimiento puede degradarse en hablantes fuera de la distribución de entrenamiento (VoxCeleb1 es un dataset de celebridades en inglés).
- Riesgo de falsos positivos y negativos en verificación: el umbral de 0.7 es una referencia del checkpoint, no una garantía; en producción debe calibrarse con datos propios.
- La variante fp16c introduce un error de puntuación de hasta 0.0107 en el peor caso frente a NeMo, lo que puede afectar a decisiones cerca del umbral; para máxima fidelidad debe usarse fp32.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; sin embargo, el modelo base de NVIDIA puede tener condiciones adicionales no detalladas en la información disponible, por lo que conviene revisar la licencia del checkpoint original antes de un despliegue comercial.
- Dependencia de la plataforma: requiere iOS 17 / macOS 14 o superior y el framework Core ML; no es portable a otros entornos sin reconversión.
- El esquema de ventana fija y las siete pasadas del host añaden complejidad de integración; errores en la reconstrucción de estadísticas globales degradan gravemente el embedding (el SqueezeExcite por ventana baja el coseno a ~0.36).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smdesai/TitaNet-Large-CoreML
- Modelo base NVIDIA TitaNet-Large: https://huggingface.co/nvidia/speakerverification_en_titanet_large
- Build Core AI del mismo port: https://huggingface.co/smdesai/TitaNet-Large-CoreAI
