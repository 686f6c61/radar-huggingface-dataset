# singgihnn/kokoro-82m-coreml

## Resumen

Kokoro 82M for Core ML es una conversión del modelo de síntesis de voz Kokoro-82M de hexgrad a Core ML, empaquetada en siete submodelos que se ejecutan mayoritariamente en el Neural Engine de Apple (iOS 17+, macOS 14+). El autor, singgihnn, la publica para que su aplicación de lectura de libros en voz alta (Listen al-Gaib) pueda descargar los ficheros, y de paso para que cualquiera pueda inspeccionarlos. No se trata de un modelo nuevo: los pesos son los de Kokoro-82M y toda la calidad es atribuible al trabajo de hexgrad; lo que aporta este repositorio es el formato de despliegue para el ecosistema Apple.

El modelo resuelve el problema de ejecutar TTS de calidad en dispositivos Apple sin depender de servidores ni de frameworks pesados, aprovechando el Neural Engine. Con 82 MB en total y una salida de audio a 24 kHz, es un candidato realista para inferencia local en iPhone y Mac. La conversión sigue el split de siete etapas de laishere/kokoro-coreml (ALBERT, duration, alignment, prosody, noise, vocoder y tail) y aplica cuantización por paletas de 8 bits a cinco de los submodelos.

Es relevante ahora porque demuestra que un TTS neuronal de 82M puede correr a velocidades de 22x tiempo real en un M4 y 13-14x en un iPhone 13, con una calidad medida muy cercana al float32 original. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y las mediciones provienen de una sola persona, no de un suite de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de siete submodelos Core ML: ALBERT, PostAlbert (duraciones), Alignment, Prosody, Noise, Vocoder y Tail |
| Parámetros totales | 82M (heredados de Kokoro-82M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 token ids de fonemas (con el 0 inicial y final); hasta 2000 frames de audio (unos 50 segundos) |
| Tipos de cuantización | Paletización de 8 bits (k-means) en cinco submodelos; Noise y Tail en float32 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlmodelc` compilados con `xcrun coremlcompiler`; tablas de estilo en `.bin` float32 (510 x 256) |

## Arquitectura y entrenamiento

El modelo original Kokoro-82M es un TTS neuronal de 82M de parámetros; esta conversión no reentrena ni afina los pesos, sino que reorganiza el grafo en siete etapas encadenadas: ALBERT → PostAlbert (que calcula duraciones y aplica el parámetro de velocidad) → Alignment → Prosody → Noise → Vocoder → Tail. La etapa final acumula fase y ejecuta la iSTFT, por lo que se mantiene en float32 y en CPU. El vocoder incorpora un truco de doble salida para el Neural Engine, y su salida `anchor` no se usa pero debe permanecer en el grafo.

Los pesos de cinco submodelos se paletizaron a 8 bits mediante k-means, lo que introduce diferencias menores respecto a los pesos float32 originales. El conversor no es determinista, de modo que una nueva ejecución no reproducirá exactamente los mismos bytes. Los self-tests y la comprobación end-to-end se ejecutaron solo en CPU y Neural Engine, porque la ruta GPU falla en macOS 27. No hay información sobre el dataset de entrenamiento original ni sobre el proceso de alineación o RLHF en la información proporcionada.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida de audio a 24 kHz.
- Control de velocidad de habla mediante la entrada de speed aplicada en la etapa PostAlbert.
- Entradas flexibles: hasta 512 token ids de fonemas y hasta 2000 frames (aproximadamente 50 segundos de audio).
- Ejecución mayoritariamente en el Neural Engine de Apple, con las etapas Noise y Tail en CPU.
- Soporte de múltiples voces mediante tablas de estilo externas (510 x 256 float32), seleccionando la fila indexada por el número de tokens de la frase.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente TTS.
- No incluye el front-end de texto a fonemas: requiere misaki u otro G2P equivalente para generar los ids de fonemas.

## Casos de uso

- Lectura de libros en voz alta en iPhone: la aplicación Listen al-Gaib usa estos siete submodelos para convertir capítulos en audio localmente, sin conexión, aprovechando que el modelo cabe en 82 MB y corre en el Neural Engine.
- Accesibilidad en macOS: integración en aplicaciones de lectura de pantalla o asistentes de voz que necesitan sintetizar frases de hasta 50 segundos con latencia baja y sin enviar texto a la nube.
- Audiolibros y pódcast generados por lotes: el rendimiento de 22x tiempo real en un M4 permite procesar horas de texto en minutos en un Mac de sobremesa o portátil.
- Previsualización de voces en herramientas de creación de contenido: las tablas de estilo externas permiten cambiar de voz seleccionando la fila correspondiente al número de tokens, útil para comparar timbres antes de una producción.
- Asistentes de voz embebidos en apps iOS: el modelo se carga con `.cpuAndNeuralEngine` para las cinco etapas principales y `.cpuOnly` para Noise y Tail, lo que permite mantener el consumo energético bajo en dispositivos móviles.
- Prototipado de interfaces de voz en investigación: al ser Apache 2.0 y estar compilado como `.mlmodelc`, se puede inspeccionar y sustituir en pipelines de evaluación de TTS sin depender de PyTorch en el dispositivo.

## Benchmarks y rendimiento

| Métrica | Kokoro 82M Core ML | PyTorch float32 | ONNX int8 |
|---|---|---|---|
| WER (Whisper base.en, 16 frases x 4 voces + 1.4x, M4) | 7,0 % | 7,3 % | 7,5 % |
| Duración del audio frente a float32 | dentro del 1-2 % | referencia | no disponible |
| Tono (pitch) frente a float32 | mediana de 10 cents | referencia | no disponible |
| Velocidad en Apple M4 | 22x tiempo real | no disponible | no disponible |
| Velocidad en iPhone 13 (iOS 27.2) | 13-14x tiempo real | no disponible | no disponible |

El autor advierte que son mediciones de una sola persona, no un suite de benchmarks. El primer arranque tras la instalación en iPhone compila para el Neural Engine durante unos 13 segundos.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para el Neural Engine y la CPU de Apple, no para GPU discretas.
- Memoria en disco: 82 MB para los siete `.mlmodelc`, más las tablas de estilo externas en float32 (510 x 256) que no se incluyen en el repositorio.
- Dispositivos recomendados: Apple M4 (22x tiempo real), iPhone 13 con iOS 27.2 (13-14x tiempo real); requiere iOS 17+ o macOS 14+.
- No cabe ni está pensado para GPU NVIDIA; la ruta GPU de Core ML falla en macOS 27 y el autor indica explícitamente no cargar los modelos con `.all`.
- Opciones de despliegue: Core ML con `xcrun coremlcompiler`; carga de ALBERT, PostAlbert, Alignment, Prosody y Vocoder con `.cpuAndNeuralEngine`, y de Noise y Tail con `.cpuOnly`.
- Latencia y throughput: 22x tiempo real en M4 y 13-14x en iPhone 13, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / límite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kokoro 82M Core ML (este) | 82M | 512 tokens de fonemas, 2000 frames | en | Apache 2.0 | `.mlmodelc` |
| hexgrad/Kokoro-82M (original) | 82M | no disponible | en | Apache 2.0 | PyTorch |
| onnx-community/Kokoro-82M-v1.0-ONNX | 82M | no disponible | en | Apache 2.0 | ONNX |
| laishere/kokoro-coreml (conversor) | 82M | no disponible | en | Apache 2.0 | Core ML |

La comparativa se limita a las variantes del mismo modelo base, porque en la información proporcionada no hay datos de otros TTS comparables. La diferencia principal entre ellas es el formato de despliegue y el rendimiento medido: el ONNX int8 obtiene un WER de 7,5 % frente al 7,0 % de esta conversión Core ML en la misma prueba.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües en la información disponible.
- No incluye el front-end de texto a fonemas: sin misaki u otro G2P, el modelo no puede procesar texto directamente.
- Las voces no están incluidas en el repositorio; hay que obtener las tablas de estilo del export ONNX de onnx-community/Kokoro-82M-v1.0-ONNX.
- La cuantización por paletas de 8 bits y la no determinación del conversor implican que los bytes no son reproducibles y los pesos difieren ligeramente del float32 original.
- La ruta GPU de Core ML falla en macOS 27; hay que cargar los modelos con `.cpuAndNeuralEngine` o `.cpuOnly`, nunca con `.all`.
- Las mediciones de calidad y velocidad provienen de una sola persona y no de un suite de benchmarks; no deben tomarse como garantía de producción.
- Riesgo de alucinación y sesgos: no hay información específica en la model card sobre sesgos del modelo base ni sobre tasas de error en dominios concretos.
- Licencia Apache 2.0, la misma que Kokoro-82M y el código de conversión; no se indican restricciones adicionales para uso comercial.
- El repositorio no está afiliado ni respaldado por hexgrad ni por laishere.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/singgihnn/kokoro-82m-coreml
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Conversor Core ML de laishere: https://github.com/laishere/kokoro-coreml
- Export ONNX con las tablas de voces: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
