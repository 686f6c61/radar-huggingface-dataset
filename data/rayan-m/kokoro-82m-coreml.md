# rayan-m/kokoro-82M-coreml

## Resumen

Kokoro-82M-coreml es una conversión a Core ML del modelo de síntesis de voz hexgrad/Kokoro-82M, publicada por el usuario rayan-m. El modelo original es un TTS ligero de 82 millones de parámetros que genera audio a 24 kHz a partir de fonemas, y esta versión empaqueta los pesos en formato Core ML (float16) junto con los recursos auxiliares necesarios para ejecutarlo en dispositivos Apple: vocabulario de fonemas, tablas de estilo de voz y diccionarios de pronunciación del inglés americano.

La relevancia de esta conversión es práctica: permite ejecutar Kokoro de forma nativa en el ecosistema Apple (CPU, y presumiblemente Neural Engine/GPU según el runtime de Core ML) sin depender de PyTorch, lo que facilita su integración en aplicaciones iOS y macOS. El repositorio es pequeño (0,2 GB) e incluye los scripts de conversión y metadatos de procedencia con hashes SHA-256, lo que aporta trazabilidad.

Se trata de un artefacto de despliegue, no de un modelo nuevo: no aporta entrenamiento adicional ni cambios de arquitectura respecto al Kokoro original, y su alcance lingüístico se limita a las cinco voces inglesas incluidas (tres americanas y dos británicas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal (Kokoro-82M): predictor de duraciones + decodificador de audio; empaquetado en dos `.mlpackage` (predictor y decoder) |
| Parametros totales | 82M (heredados del modelo base hexgrad/Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de fonemas con N hasta 256 tokens sin padding en el predictor; decodificador con variantes para 128, 256 y 512 frames |
| Tipos de cuantizacion | pesos float16, cómputo float32; pensado para CPU |
| Idiomas soportados | inglés (voces americanas af_heart, af_bella, am_michael y británicas bf_emma, bm_george); otros idiomas no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage.zip`), tablas de estilo `voice_*.bin` en float32, vocabulario `kokoro_vocab.json` |

## Arquitectura y entrenamiento

Esta publicación no entrena ningún modelo: es una conversión de los pesos PyTorch de hexgrad/Kokoro-82M (commit f3ff357) a Core ML. La arquitectura subyacente de Kokoro es un sistema TTS en dos etapas: un predictor que recibe `input_ids` de fonemas y un vector de estilo `ref_s_style` de 128 dimensiones, y produce duraciones, `d_for_align` y `t_en`; y un decodificador que, a partir de la secuencia alineada y un `ref_s` de 256 dimensiones, genera audio a 24 kHz en frames de 600 muestras.

La conversión mantiene los pesos en float16 con cómputo float32 y está orientada a CPU. El autor documenta una validación frente a la salida PyTorch original: las duraciones redondeadas coinciden en todos los tokens y la convergencia espectral del decodificador se sitúa en torno a 0,02-0,03 (float16 frente a float32 en Core ML), medida sobre cinco frases en inglés. No se dispone de información sobre los datos de entrenamiento originales de Kokoro (número de tokens, composición del corpus, uso de RLHF/DPO) en la información proporcionada.

## Capacidades

- Síntesis de texto a voz en inglés a 24 kHz a partir de fonemas, con control de estilo mediante vectores de 128/256 dimensiones.
- Cinco voces preentrenadas incluidas: af_heart, af_bella, am_michael (inglés americano) y bf_emma, bm_george (inglés británico).
- Fonemización asistida mediante los diccionarios de misaki 0.9.4 (`us_gold.json`, `us_silver.json`) para inglés americano.
- Ejecución nativa en el ecosistema Apple mediante Core ML, sin dependencia de PyTorch en tiempo de inferencia.
- Entradas de longitud variable: el predictor acepta secuencias de fonemas de hasta 256 tokens sin padding.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.
- Capacidades multilingües: no disponibles más allá del inglés.

## Casos de uso

- Lectura por voz en aplicaciones iOS y macOS: integración de los `.mlpackage` en una app nativa para narrar texto de artículos, correos o libros, aprovechando la ejecución local en CPU sin conexión a red.
- Accesibilidad: conversión de texto a voz para usuarios con discapacidad visual dentro de apps Apple, con cinco voces seleccionables y audio a 24 kHz.
- Asistentes de voz embebidos: generación de respuestas habladas en asistentes locales que ya realizan ASR y NLU en el dispositivo, manteniendo los datos del usuario sin salir del terminal.
- Audiolibros y pódcast generados: síntesis por lotes de capítulos largos troceados en segmentos de hasta 256 fonemas, concatenando la salida del decodificador.
- Señalización y avisos en apps de navegación o conducción: anuncios cortos de baja latencia generados en el dispositivo, sin coste por petición a un servicio en la nube.
- Prototipado de interfaces conversacionales: evaluación rápida de la calidad y naturalidad de Kokoro en macOS antes de decidir un despliegue en servidor con el modelo PyTorch original.
- Preprocesado de datos de audio para entrenamiento: generación de pares texto-audio sintéticos en inglés para aumentar datasets de ASR o de modelos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de fidelidad de la conversión: igualdad de duraciones redondeadas en todos los tokens y convergencia espectral del decodificador de aproximadamente 0,02-0,03 (float16 frente a float32 en Core ML) sobre cinco frases en inglés.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU dedicada; el modelo está pensado para CPU con Core ML. El repositorio ocupa 0,2 GB, por lo que el peso en memoria de los pesos es del orden de decenas de MB en float16.
- GPU recomendadas: no disponibles; el artefacto está orientado a ejecución en CPU dentro del ecosistema Apple (Mac, iPhone, iPad).
- Cabe en hardware de consumo: sí, por tamaño (82M de parámetros) y por formato (Core ML para dispositivos Apple).
- Opciones de despliegue: runtime de Core ML en iOS/macOS; para el modelo original, PyTorch y las herramientas habituales de la comunidad Kokoro. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| rayan-m/kokoro-82M-coreml | 82M | hasta 256 fonemas en el predictor; decodificador 128/256/512 frames | inglés (5 voces) | Apache-2.0 | Core ML |
| hexgrad/Kokoro-82M | 82M | no disponible en la información | inglés y otros según pesos | Apache-2.0 | PyTorch |
| Otros TTS ligeros (p. ej. Piper, VITS) | no disponible | no disponible | varios | variable | ONNX / otros |

La comparación con alternativas de la misma categoría (TTS ligero ejecutable en dispositivo) no está disponible con datos verificables en la información proporcionada; la referencia directa es el modelo base hexgrad/Kokoro-82M, del que esta conversión hereda arquitectura, pesos y licencia.

## Limitaciones y advertencias

- Solo inglés: las cinco voces incluidas son americanas y británicas; no hay soporte para castellano ni otros idiomas en este paquete.
- Es una conversión, no un modelo entrenado: cualquier sesgo o limitación del Kokoro original se hereda sin cambios.
- Riesgo de errores de pronunciación en nombres propios, siglas y palabras fuera de los diccionarios de misaki 0.9.4; la fonemización es responsabilidad del usuario de la app.
- La validación reportada por el autor es cualitativa y acotada (cinco frases); no hay evaluación objetiva de naturalidad (MOS) ni de inteligibilidad (WER) en la información disponible.
- Dependencia del runtime Core ML y de plataformas Apple; no es portable a Linux o Windows sin reconvertir.
- Entrada limitada a 256 tokens de fonemas en el predictor, lo que obliga a trocear textos largos.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar `LICENSE` y `NOTICE` con la atribución y la descripción de cambios, según indica el autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rayan-m/kokoro-82M-coreml
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
