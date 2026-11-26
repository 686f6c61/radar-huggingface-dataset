# matthiastl/kitten-tts-2-nano-coreml

## Resumen

Kitten TTS 2 Nano Core ML es una conversión no oficial del modelo de síntesis de voz Kitten TTS 2 Nano de KittenML, publicada por el usuario matthiastl. El modelo original es un sistema text-to-speech (TTS) muy ligero, de 17 millones de parámetros y diez voces en inglés, distribuido por KittenML en PyTorch y en ONNX de 8 bits para CPU. Esta versión reescribe el pipeline para que el vocoder (la parte que genera la onda de audio y concentra el coste computacional) se ejecute en la GPU mediante Core ML, mientras que el resto del modelo corre en ONNX Runtime sobre un único hilo de CPU.

El objetivo de la conversión es hacer viable la síntesis de voz en tiempo real en dispositivos Apple, concretamente iPhone y Mac. Según las mediciones del autor, en un iPhone 17 Pro el tiempo de CPU por segundo de audio baja de 0,086 s a 0,011 s y el tiempo hasta la primera frase pasa de 336 ms a 47 ms. El paquete incluye además una reimplementación en Objective-C del programa de normalización de texto en inglés de KittenML, de modo que el modelo lee números, fechas, importes y palabras desconocidas igual que el original.

Es relevante para desarrolladores de aplicaciones iOS y macOS que necesiten TTS local, sin conexión y con latencia baja, ya que no requiere servidores externos y cabe en un paquete de 95 MB. La licencia Apache 2.0 del modelo base se mantiene, aunque se trata de una conversión no avalada por KittenML.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS de dos etapas: modelo acústico (texto a longitudes y características, luego tono y energía) + vocoder, exportado a Core ML y ONNX |
| Parámetros totales | 17 millones (modelo base Kitten TTS 2 Nano) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (segmentación de frases a más de 6 s de audio) |
| Tipos de cuantización | Vocoder en 16 bits (Core ML); modelo de texto en ONNX de 8 bits (base) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`mlmodelc`) y ONNX (`textA.onnx`, `textB.onnx`); voces en `voices.f32`, `source.f32` |

## Arquitectura y entrenamiento

El modelo base Kitten TTS 2 Nano es un sistema TTS de dos etapas. La primera etapa, el modelo de texto, recibe la secuencia de fonemas y produce longitudes y características acústicas; después calcula tono y energía. La segunda etapa es un vocoder que convierte esas características en la onda de audio final. En esta conversión, el vocoder se ha exportado a Core ML para ejecutarse en la GPU (en formato de 16 bits, en tres variantes según el número de frames: hasta 100, 160 y 240, equivalentes a 2,5, 4 y 6 segundos de audio), mientras que el modelo de texto se ejecuta en ONNX Runtime en un solo hilo de CPU.

El autor no detalla los datos de entrenamiento del modelo original ni si hubo RLHF o ajuste fino; esa información no está disponible en la documentación proporcionada. La innovación técnica de esta conversión es doble: por un lado, el traslado del vocoder a la GPU de Apple mediante Core ML, con validación contra la implementación en PyTorch de KittenML (longitudes de fonemas idénticas en el 100 % de 20 frases y correlación mínima de 0,99987 en 116 fragmentos); por otro, la reimplementación en Objective-C del programa de texto en inglés de KittenML, que reproduce su comportamiento en 3.300 textos nuevos con números, nombres y símbolos. El autor descartó una versión para Neural Engine porque su primera preparación en el iPhone tardaba 114 s, por encima del límite de 60 s que se había fijado.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida en coma flotante de 32 bits a 24.000 Hz.
- Diez voces disponibles: eleanor, martha, serena, iris, grace, edith, otis, vincent, max y danny.
- Control de velocidad de habla (por ejemplo, 1,25; el valor 1,0 es el normal).
- Normalización de texto en inglés: lectura de números, fechas, importes monetarios y palabras desconocidas siguiendo las reglas del programa original de KittenML.
- Segmentación automática de frases largas: si se superan los 6 s de audio, se corta por la coma más cercana al centro o por un espacio y se unen los fragmentos.
- Integración con Swift en aplicaciones iOS 18 y macOS 15 o superior.
- Ejecución local sin conexión, con el modelo incluido en el paquete de la aplicación.
- No soporta otros idiomas distintos del inglés; los emojis y otros alfabetos se omiten y se listan, igual que en el programa original.

## Casos de uso

- Lectura de notificaciones y mensajes en aplicaciones iOS: el modelo sintetiza frases cortas en decenas de milisegundos en el dispositivo, sin enviar texto a servidores externos, lo que preserva la privacidad y elimina la dependencia de red.
- Asistentes de voz integrados en apps de productividad: la latencia de 43-47 ms hasta la primera frase permite respuestas habladas casi inmediatas en conversaciones de ida y vuelta.
- Accesibilidad para personas con discapacidad visual: la síntesis local en el iPhone permite leer pantallas, correos o documentos sin conexión y con diez voces seleccionables.
- Avisos y confirmaciones en aplicaciones de comercio o banca: el normalizador de texto lee correctamente importes ("$12.50") y fechas ("March 3rd"), lo que resulta adecuado para confirmaciones de pago o recordatorios.
- Aprendizaje de idiomas: reproducción de frases en inglés a distintas velocidades (0,6 a 1,6) para práctica de escucha y pronunciación.
- Prototipado rápido de interfaces de voz en Mac: el ejemplo de línea de comandos `say` permite generar archivos WAV desde terminal para probar guiones y voces antes de integrarlas en una app.
- Demos y aplicaciones educativas sin conectividad: al incluir todos los recursos en 95 MB, el modelo funciona en entornos sin red, como aulas o dispositivos en modo avión.

## Benchmarks y rendimiento

| Prueba | KittenML 8-bit ONNX (1 hilo CPU) | Esta conversión | Límite fijado |
|---|---|---|---|
| Tiempo de CPU por segundo de habla (iPhone 17 Pro) | 0,086 s | 0,011 s | la mitad |
| Tiempo hasta una frase, mediana (iPhone 17 Pro) | 336 ms | 47 ms | 336 ms |
| Palabras erróneas sobre 2.000 grabaciones (M4 Max) | 0,12 % | 0,11 % | +0,3 puntos |
| Tamaño | 17 MB + programa de texto en Python | 95 MB, todo incluido | no aplica |
| Longitudes de fonemas frente a PyTorch (20 frases, M4 Max) | no aplica | 100 % idénticas | 99 % |
| Correlación de GPU del iPhone frente a CPU de M4 Max (116 fragmentos) | no aplica | 0,99987 en el peor caso | 0,999 |
| Fonemas frente al programa de texto de KittenML (3.300 textos) | no aplica | idénticos en todos | 98 % |
| Longitudes de fonemas a velocidades 0,6/0,8/1,25/1,6 (76.156 fonemas) | no aplica | un fonema un frame de diferencia, el resto igual | 99,9 % |
| Rechazo en segundo plano (5 frases) | no aplica | 5 de 5 con error | 5 de 5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que se trata de un modelo TTS y no de un modelo de lenguaje.

## Requisitos de hardware

- Dispositivos Apple con GPU compatible con Core ML: iPhone (probado en iPhone 17 Pro) y Mac con macOS 15 o superior (probado en Apple M4 Max).
- VRAM estimada: no disponible; el vocoder ocupa 9,5 MB por variante y el modelo de texto 49 MB en ONNX.
- No requiere GPU de escritorio (A100, H100, RTX 4090); está diseñado exclusivamente para el ecosistema Apple.
- Cabe en cualquier iPhone o Mac moderno; el paquete completo ocupa 95 MB.
- Despliegue mediante Core ML y ONNX Runtime para Apple 1.30.0; se integra en apps iOS 18 y macOS 15 con Objective-C o Swift.
- Latencia: 43-47 ms hasta la primera frase en iPhone 17 Pro; 0,0090-0,0105 s de CPU por segundo de habla. La primera ejecución tras instalar tarda 8,6 s mientras Core ML prepara la GPU; después, 0,2 s al reabrir la app.
- No se midió el consumo energético.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kitten TTS 2 Nano (original) | 17 M | inglés | no disponible | Apache 2.0 | PyTorch y ONNX 8-bit para CPU |
| Esta conversión (Core ML) | 17 M | inglés | no disponible | Apache 2.0 | Core ML + ONNX para iOS/macOS |
| Alternativas TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada; la comparación más directa es con el modelo original de KittenML, que sirve de referencia en las pruebas de rendimiento.

## Limitaciones y advertencias

- Solo sintetiza inglés; no admite otros idiomas.
- Solo funciona mientras la aplicación está en pantalla: iOS no permite usar la GPU en segundo plano y `speak` devuelve un error en ese caso.
- La primera síntesis tras la instalación es lenta (8,6 s en iPhone) debido a la preparación de la GPU por parte de Core ML.
- No hay versión para Neural Engine; el autor la descartó por el tiempo de preparación inicial (114 s).
- Las frases de más de 6 s de audio se cortan y se unen, lo que puede introducir artefactos en la prosodia.
- Las muestras pueden superar 1,0 y el escritor de WAV las recorta, igual que el código de KittenML.
- El autor no midió el consumo energético y nadie ha evaluado subjetivamente la calidad de sonido frente al original; la prueba de palabras se hizo con un reconocedor de voz.
- Es una conversión no oficial, no avalada por KittenML.
- Riesgo de errores en la lectura de texto ambiguo (números, símbolos) aunque el normalizador replica el comportamiento del original; no se han documentado sesgos específicos.
- La licencia Apache 2.0 permite uso comercial, pero al ser una conversión no oficial conviene verificar los términos del modelo base antes de distribuirlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthiastl/kitten-tts-2-nano-coreml
- Modelo base: https://huggingface.co/KittenML/kitten-tts-2-nano
- ONNX Runtime para Apple 1.30.0: https://download.onnxruntime.ai/pod-archive-onnxruntime-c-1.30.0.zip
