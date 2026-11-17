# Phoonnx/vits-ig-openbible-graphemes

## Resumen

`Phoonnx/vits-ig-openbible-graphemes` es una voz de síntesis de voz (text-to-speech) para igbo, un modelo VITS originalmente entrenado por multilingual-tts y convertido a ONNX por Phoonnx (TigreGotico Lda) para su uso con la librería phoonnx. El modelo parte de `multilingual-tts/VITS-OpenBible-Igbo` y se distribuye como conversión directa de los pesos, sin reentrenamiento, con copias adicionales cuantizadas a int8.

La relevancia del modelo es doble: por un lado, cubre una lengua de bajos recursos como el igbo (aproximadamente 31 millones de hablantes, principalmente en Nigeria), donde la oferta de TTS neuronal abierta es escasa; por otro, su empaquetado en ONNX con cuantización dinámica int8 y métricas de QA publicadas (RTF, tamaño de grafo, RSS) lo hace directamente desplegable en entornos de producción ligeros, incluidos asistentes de voz OVOS.

Arquitectura VITS (end-to-end, condicional a texto, con muestreo a 22050 Hz), 6 hablantes y entrada basada en grafemas (sin fonemizador). El modelo está entrenado sobre el corpus bíblico `davidguzmanr/open-bible-resources` y se publica bajo licencia CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | fp32 y int8 (cuantizacion dinamica con onnxruntime.quantization.quantize_dynamic, pesos QInt8; nodos bajo `/duration_predictor/` permanecen en fp32) |
| Idiomas soportados | igbo (`ig`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 6 |
| Entrada de texto | caracteres (grafemas); sin fonemizador |
| Puntuacion | no registrada en la config; phoonnx elimina la puntuacion antes de la sintesis |
| Tamano del grafo | 114.3 MB (fp32) / 39.9 MB (int8) |
| Pico de RSS | 414.8 MB (fp32) / 398.7 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0.137 (fp32) / 0.477 (int8) |
| Tamano del repo | 0.2 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es un modelo generativo end-to-end que combina un encoder de texto, un predictor de duraciones, un flujo normalizador y un decoder basado en HiFi-GAN, entrenado con pérdidas adversarias y de verosimilitud variacional. En esta variante concreta, la entrada es directamente el texto en grafemas: no hay fonemizador intermedio, lo que simplifica el pipeline pero traslada al modelo la responsabilidad de aprender la correspondencia grafema-fonema del igbo a partir de los datos.

El entrenamiento original lo realizó multilingual-tts sobre el dataset `davidguzmanr/open-bible-resources`, un corpus de audio y texto bíblico. No se dispone en la información proporcionada de detalles sobre número de horas, tokens, composición exacta del dataset ni sobre si se aplicaron técnicas de alineamiento o ajuste fino adicional. La conversión a ONNX realizada por Phoonnx no modifica los pesos; las copias int8 aplican cuantización dinámica y se validan con un control de calidad basado en longitud y silencio (sin ASR), usando 3 frases de FLORES-200 devtest.

## Capacidades

- Síntesis de voz en igbo a partir de texto en grafemas, con salida WAV a 22050 Hz.
- Soporte de 6 hablantes distintos (multi-speaker TTS).
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Dos variantes de precisión: fp32 (mayor calidad y velocidad) e int8 (menor tamaño y RSS, mayor RTF).
- Integración con la librería phoonnx mediante `TTSModelManager`.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Eliminación automática de puntuación antes de la síntesis (gestionada por phoonnx).
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en igbo sobre OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar esta voz en `mycroft.conf` y ofrecer respuestas habladas en igbo en un asistente doméstico o de escritorio, con un pico de RSS inferior a 500 MB.
- Lectura de contenido bíblico y devocional: al estar entrenado sobre un corpus bíblico, es adecuado para narrar pasajes, planes de lectura o material doctrinal en igbo con una prosodia cercana al dominio de entrenamiento.
- Accesibilidad para hablantes de igbo: conversión de artículos, notificaciones o documentos a audio para usuarios con discapacidad visual o dificultades de lectura, ejecutándose en CPU en un servidor modesto (RTF 0.137 en fp32 sobre Ryzen 5 7600).
- Localización de interfaces y IVR: generación de avisos y mensajes pregrabados en igbo para sistemas telefónicos o aplicaciones, usando la variante int8 (39.9 MB) para despliegues con restricciones de memoria.
- Generación de audio por lotes en pipelines de datos: creación de corpus sintéticos en igbo para entrenamiento de ASR u otros modelos, aprovechando el bajo coste de inferencia en CPU y la posibilidad de paralelizar por hilos.
- Prototipado de productos de voz para el mercado nigeriano: evaluación rápida de la calidad y aceptación de una voz TTS en igbo antes de invertir en un modelo propio o en un servicio comercial.
- Investigación en TTS de bajos recursos: el modelo sirve como referencia reproducible para estudiar el rendimiento de VITS con entrada en grafemas en lenguas de bajos recursos, con métricas de QA y artefactos ONNX publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, WER, MCD) en la información disponible. El autor publica únicamente métricas de control de calidad e inferencia:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA (longitud y silencio) | pass | pass |
| Caracteres por segundo | 5.6 a 12.8 | no disponible |
| Ratio de longitud int8 / fp32 | no aplica | 0.88 a 1.22 |
| Tamano del grafo | 114.3 MB | 39.9 MB |
| Pico de RSS | 414.8 MB | 398.7 MB |
| RTF (mediana de 3, 4 hilos) | 0.137 | 0.477 |

Medido en un AMD Ryzen 5 7600 de 6 núcleos. El RTF es el tiempo de síntesis dividido por la duración del audio. El método de QA no usa ASR: solo comprueba longitud y ausencia de silencio, con 3 frases de FLORES-200 devtest.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Hablantes | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-ig-openbible-graphemes | VITS (ONNX) | ig | 6 | ONNX fp32/int8 | CC BY-SA 4.0 | Conversion de multilingual-tts/VITS-OpenBible-Igbo; RTF 0.137 fp32 |
| multilingual-tts/VITS-OpenBible-Igbo | VITS (Coqui) | ig | 6 | pesos Coqui (no confirmado en la informacion) | CC BY-SA 4.0 | Modelo upstream; requiere el stack Coqui TTS |
| Otros modelos VITS de OpenBible de multilingual-tts | VITS | otras lenguas | no disponible | no disponible | CC BY-SA 4.0 | Misma familia y dataset, para otras lenguas |

No se dispone en la información proporcionada de comparaciones con modelos TTS comerciales (Google, Azure, ElevenLabs) ni con otros modelos abiertos para igbo, por lo que no se incluyen cifras comparativas de calidad.

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre un corpus bíblico, puede presentar prosodia y vocabulario sesgados hacia ese registro; el rendimiento en lenguaje coloquial, técnico o conversacional no está evaluado.
- Sin fonemizador: la entrada en grafemas puede producir pronunciaciones incorrectas en palabras con ortografía ambigua o préstamos léxicos.
- Puntuación eliminada por phoonnx: se pierden pausas y entonación asociadas a comas, puntos y signos de interrogación.
- Sin métricas de calidad perceptual (MOS) ni de inteligibilidad (WER/MCD) publicadas; el QA se limita a comprobar longitud y ausencia de silencio con 3 frases.
- La variante int8 es notablemente más lenta en CPU (RTF 0.477 frente a 0.137 en fp32) a pesar de ocupar menos memoria; conviene validar la latencia en el hardware objetivo.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir a multilingual-tts y a compartir las obras derivadas bajo la misma licencia; revisar implicaciones si se integra en productos propietarios.
- Un solo idioma (igbo) y sin capacidades multilingües.
- Riesgo de alucinación acústica (ruidos, sílabas espurias) inherente a los modelos generativos adversarios, no cuantificado en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios y validación comunitaria muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ig-openbible-graphemes
- Modelo upstream: https://huggingface.co/multilingual-tts/VITS-OpenBible-Igbo
- Dataset de entrenamiento: https://huggingface.co/datasets/davidguzmanr/open-bible-resources
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
