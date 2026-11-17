# Phoonnx/vits-si-chan4lk-espeak

## Resumen

`vits-si-chan4lk-espeak` es una voz de síntesis de habla (text-to-speech) en idioma cingalés (sinhala, código `si`) construida sobre la arquitectura VITS en su variante Piper. El modelo original fue entrenado por el usuario `chan4lk` y publicado como `chan4lk/piper-tts-sinhala`; esta ficha corresponde a la conversión a formato ONNX realizada por TigreGotico Lda para su motor de inferencia `phoonnx`, manteniendo la misma licencia MIT.

La relevancia del modelo es acotada pero clara: cubre una combinación de idioma (cingalés) y formato (ONNX, ligero, con variantes int8) para la que existen pocas opciones abiertas. Con un grafo de 63,5 MB en fp32 y 19,3 MB en int8, y un pico de memoria de 278,8 MB / 242,1 MB respectivamente, está pensado para despliegue en entornos con recursos limitados, incluidos dispositivos de borde o asistentes de voz integrados en OVOS.

No se trata de un modelo de lenguaje generativo, sino de un sistema TTS de un solo hablante, con entrada fonémica (fonemas espeak-ng en alfabeto IPA) y salida de audio a 22.050 Hz. No dispone de benchmarks de calidad perceptual publicados; la validación disponible se limita a comprobaciones automáticas de duración y silencio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variante Piper) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | fp32 (grafo original) e int8 (cuantización dinámica con `onnxruntime.quantization.quantize_dynamic`, pesos QInt8) |
| Idiomas soportados | cingalés (`si`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22.050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak-ng, alfabeto IPA |
| Fonemizador | espeak-ng, idioma `si` |
| Puntuación | no registrada en la configuración; phoonnx elimina la puntuación antes de la síntesis |
| Tamano del repositorio | 0,1 GB |
| Tamano de grafo | 63,5 MB (fp32) / 19,3 MB (int8) |
| Pico de RSS | 278,8 MB (fp32) / 242,1 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,022 (fp32) / 0,067 (int8) |
| Datos de entrenamiento | no registrados en la ficha original (el upstream menciona OpenSLR Sinhala) |

## Arquitectura y entrenamiento

El modelo emplea VITS, un modelo generativo de extremo a extremo para síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador de audio y un discriminador adversarial en el entrenamiento. La variante Piper es una implementación optimizada de VITS orientada a inferencia ligera y despliegue en CPU, con un fonemizador externo (espeak-ng) que convierte el texto en secuencias de fonemas IPA antes de la síntesis.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables habitualmente en TTS). La ficha upstream menciona el corpus OpenSLR Sinhala como fuente de datos, pero no se registran métricas de entrenamiento ni checkpoints en este repositorio. La conversión a ONNX no altera los pesos originales; las copias int8 los cuantizan dinámicamente. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en cingalés a partir de texto en escritura sinhala.
- Conversión texto a fonemas mediante espeak-ng (idioma `si`) y síntesis a partir de la secuencia IPA.
- Salida de audio WAV a 22.050 Hz, un solo hablante.
- Inferencia en CPU con latencia muy baja (RTF de 0,022 en fp32 y 0,067 en int8 sobre AMD Ryzen 5 7600).
- Variantes cuantizadas int8 para reducir huella de memoria y tamaño en disco.
- Integración con el motor `phoonnx` y con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en cingalés para OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite dotar a un asistente doméstico de respuestas habladas en sinhala con una huella de memoria inferior a 300 MB.
- Lectura de contenido en aplicaciones móviles o de escritorio: la variante int8 (19,3 MB de grafo, 242 MB de pico de RSS) cabe en dispositivos con recursos ajustados y permite narrar texto sinhala sin conexión.
- Accesibilidad para personas con discapacidad visual: conversión de documentos y notificaciones en cingalés a audio en tiempo real gracias al RTF de 0,022 en fp32 (unas 45 veces más rápido que el tiempo real en la CPU de referencia).
- Sistemas de anuncios y avisos automatizados: generación de mensajes de voz pregrabados o dinámicos para transporte, comercio o administración pública en Sri Lanka, con licencia MIT que facilita su uso comercial.
- Prototipado de investigación en TTS de bajos recursos: al ser una conversión ONNX ligera de un modelo Piper, sirve como base para experimentos de fonemización, cuantización o evaluación de calidad en idiomas de bajos recursos.
- Integración en pipelines de CI/CD para generación de audio de prueba: el bajo coste computacional y la naturaleza determinista de la inferencia permiten generar muestras de audio en tests automatizados sin GPU.
- Servicios de lectura de noticias o blogs: síntesis por lotes de artículos en sinhala con un throughput alto en CPU, adecuado para generar versiones en audio de contenidos web.

## Benchmarks y rendimiento

La ficha del modelo no incluye benchmarks de calidad perceptual (MOS, WER, etc.). La validación publicada consiste en comprobaciones automáticas de duración y silencio sobre tres frases de FLORES-200 devtest, sin ASR:

| Comprobacion | fp32 | int8 |
|---|---|---|
| Resultado | pass | pass |
| Caracteres por segundo | 13,5 a 14,4 | no disponible |
| Longitud int8 / fp32 | no disponible | 0,92 a 1,00 |
| Tamano de grafo | 63,5 MB | 19,3 MB |
| Pico de RSS | 278,8 MB | 242,1 MB |
| RTF (mediana de 3, 4 hilos) | 0,022 | 0,067 |

Medido en un AMD Ryzen 5 7600 de 6 núcleos. El RTF se define como tiempo de síntesis dividido por la duración del audio. No se han publicado resultados de benchmarks de calidad de voz en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU con ONNX Runtime.
- Memoria RAM: pico de RSS de 278,8 MB en fp32 y 242,1 MB en int8.
- GPU recomendadas: no se documentan; el modelo no requiere GPU y la ficha solo reporta mediciones en CPU.
- Cabe en cualquier CPU de consumo moderna; la medición de referencia usa un AMD Ryzen 5 7600 con 4 hilos.
- Opciones de despliegue: `phoonnx` (con `pip install --pre phoonnx`), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime directamente. Requiere espeak-ng instalado (`apt install espeak-ng`) o el port espyak incluido en `phoonnx[espeak]`, con la advertencia de que algunos fonemas de espyak difieren de espeak-ng y pueden producir pronunciaciones incorrectas.
- Latencia y throughput: RTF de 0,022 (fp32) y 0,067 (int8) con 4 hilos en la CPU de referencia; aproximadamente 13,5 a 14,4 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `Phoonnx/vits-si-chan4lk-espeak` (este) | VITS (Piper) | cingalés | ONNX fp32/int8 | MIT | Conversión de `chan4lk/piper-tts-sinhala` |
| `chan4lk/piper-tts-sinhala` | VITS (Piper) | cingalés | no disponible en la información | MIT | Modelo upstream del que deriva esta conversión |
| Otras voces Piper comunitarias | VITS (Piper) | varios | ONNX | MIT (habitual) | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas de la misma categoría. La comparación más directa es con el modelo upstream, del que esta ficha es una conversión cuantizada sin cambios en los pesos.

## Limitaciones y advertencias

- Modelo de un solo hablante y un solo idioma (cingalés); no soporta otros idiomas ni cambio de voz.
- Entrada fonémica: requiere espeak-ng o espyak; con espyak algunas palabras pueden pronunciarse incorrectamente por diferencias en los fonemas.
- La puntuación no está registrada en la configuración y phoonnx la elimina antes de la síntesis, lo que puede afectar a la prosodia en textos con puntuación significativa.
- No hay benchmarks de calidad perceptual publicados; la validación se limita a comprobaciones de duración y silencio sobre tres frases, insuficiente para garantizar calidad en producción.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de pronunciaciones incorrectas o artefactos de audio en texto fuera de dominio.
- No se documentan sesgos específicos, aunque al entrenarse con el corpus OpenSLR Sinhala puede reflejar las características demográficas y de grabación de dicho corpus.
- Licencia MIT: permite uso comercial y modificación, pero se debe acreditar a `chan4lk` como autor del modelo original.
- La cuantización int8 reduce el tamaño y el pico de memoria, pero el RTF empeora (0,067 frente a 0,022); conviene elegir la variante según el compromiso latencia/memoria.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema y mantenimiento limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-si-chan4lk-espeak
- Modelo upstream: https://huggingface.co/chan4lk/piper-tts-sinhala
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
