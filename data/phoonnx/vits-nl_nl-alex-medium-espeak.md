# Phoonnx/vits-nl_nl-alex-medium-espeak

## Resumen

vits-nl_nl-alex-medium-espeak es una voz de síntesis de voz (text-to-speech) en neerlandés, publicada por Phoonnx (TigreGotico Lda) como conversión a ONNX del modelo original de Rhasspy. Se trata de un modelo VITS de la familia Piper, concretamente la voz `nl_NL-alex-medium` del repositorio `rhasspy/piper-voices`, reempaquetada para su uso con la librería phoonnx. El modelo resuelve el problema de generar audio hablado en neerlandés de forma ligera y local, sin depender de servicios en la nube.

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que combina codificador de texto, predictor de duración, flujo normalizador y decodificador basado en GAN, con un vocoder HiFi-GAN integrado. El modelo es de una sola hablante, con una frecuencia de muestreo de 22050 Hz y una entrada de texto basada en fonemas IPA generados por espeak-ng. El tamaño del grafo es de 63,2 MB en fp32 y 18,7 MB en int8, lo que lo hace extremadamente ligero.

Su relevancia actual radica en que permite desplegar TTS neerlandés de calidad media en hardware muy modesto (incluso CPU), con licencia CC0 1.0, lo que elimina restricciones de uso comercial. La conversión incluye copias cuantizadas a int8 con verificación de calidad mediante ASR, lo que facilita su integración en asistentes de voz locales como OVOS/Mycroft.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; entrada por fonemas) |
| Tipos de cuantización | fp32, int8 (quantize_dynamic, QInt8) |
| Idiomas soportados | neerlandés (nl-NL) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`.onnx`, `.onnx_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Fonemizador | espeak-ng (voz nl), alfabeto IPA |
| Puntuación soportada | `. , ! ? : ;` |
| Tamaño del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 236,3 MB (fp32) / 185,1 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,043 (fp32) / 0,103 (int8) |
| Librería | phoonnx |
| Modelo base | rhasspy/piper-voices (relación: quantized) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema end-to-end de síntesis de voz que integra en un único modelo el codificador de texto, el predictor de duración, el flujo normalizador y el decodificador generativo, junto con un vocoder HiFi-GAN. La entrada de texto se convierte a fonemas IPA mediante espeak-ng (voz `nl`), y el modelo genera directamente la forma de onda de audio a 22050 Hz. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333, y requiere Piper 1.5 o superior.

Según la model card, el modelo original fue entrenado por Rhasspy. El modelo base del que parte es un modelo `rdh` de calidad media (nl_BE, una hablante flamenca, CC0), afinado con MRD y SDP. Los datos de entrenamiento concretos no están registrados en el repositorio upstream. La conversión a ONNX no modifica los pesos; las copias int8 se generan con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) con pesos QInt8. La calidad se verificó con ASR (nemo-parakeet-tdt-0.6b-v3 int8) sobre 3 frases de FLORES-200 devtest, con WER de 0,033 en fp32 y 0,000 en int8.

## Capacidades

- Síntesis de voz en neerlandés (nl-NL) a partir de texto, con salida WAV a 22050 Hz.
- Conversión de texto a fonemas IPA mediante espeak-ng, lo que permite control preciso de la pronunciación.
- Soporte de puntuación de cláusula (`. , ! ? : ;`), que se preserva en la síntesis a partir de phoonnx 1.96.1a1.
- Una única hablante (voz "alex"), sin soporte multi-hablante.
- Inferencia en CPU con alto rendimiento: RTF de 0,043 en fp32 y 0,103 en int8 (4 hilos, i9-11900H).
- Cuantización int8 con verificación de calidad (audio finito, no silencioso, duración 0,8–1,25× la de fp32, WER ≤ fp32 + 0,05).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS/Mycroft como motor TTS neerlandés mediante `ovos-tts-plugin-phoonnx`, seleccionando la voz `piper/nl_NL-alex-medium` en `mycroft.conf`. Su bajo consumo (185–236 MB de RSS) permite ejecutarlo en dispositivos de gama baja.
- Lectura de notificaciones y alertas en sistemas domóticos: con RTF de 0,043 en fp32, puede sintetizar mensajes cortos en tiempo real en una CPU convencional sin GPU.
- Accesibilidad para personas con discapacidad visual: lectura de texto en neerlandés en aplicaciones de escritorio o móviles, con licencia CC0 que permite su redistribución sin restricciones.
- Generación de audiolibros o contenido narrado: la licencia CC0 permite uso comercial y modificación; el modelo puede generar audio por lotes en pipelines de CPU.
- Pruebas y desarrollo de pipelines TTS: al ser un modelo ONNX ligero (18,7 MB en int8), es adecuado para tests automatizados de integración en CI/CD sin necesidad de infraestructura pesada.
- Sistemas embebidos y edge computing: el grafo int8 de 18,7 MB y el pico de RSS de 185 MB permiten desplegarlo en dispositivos con recursos limitados, como Raspberry Pi o similares.
- Prototipado de interfaces conversacionales en neerlandés: permite validar flujos de voz antes de invertir en modelos TTS de mayor calidad.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de calidad y rendimiento de la conversión, no benchmarks estándar de TTS como MOS o MCD.

| Métrica | fp32 | int8 |
|---|---|---|
| Resultado QA (ASR) | pass | pass |
| WER | 0,033 | 0,000 |
| Caracteres por segundo | 18,7–22,7 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,95–1,00 |
| Tamaño del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 236,3 MB | 185,1 MB |
| RTF (mediana de 3, 4 hilos) | 0,043 | 0,103 |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF es el tiempo de síntesis dividido por la duración del audio. No se han publicado resultados de benchmarks estándar de TTS (MOS, MCD, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo está diseñado para CPU.
- GPU recomendadas: no aplica; cualquier GPU es innecesaria dado el tamaño del modelo.
- Cabe en cualquier GPU consumer y en CPU: el grafo int8 ocupa 18,7 MB y el pico de RSS es de 185,1 MB.
- Opciones de despliegue: phoonnx (librería principal), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS VITS).
- Latencia y throughput: RTF de 0,043 en fp32 y 0,103 en int8 con 4 hilos en i9-11900H; es decir, sintetiza audio aproximadamente 23× más rápido que tiempo real en fp32 y 9,7× en int8.
- Requiere espeak-ng instalado (o el port espyak mediante `phoonnx[espeak]`), con la advertencia de que algunos fonemas de espyak difieren de espeak-ng y pueden producir palabras incorrectas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Hablantes | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|---|
| Phoonnx/vits-nl_nl-alex-medium-espeak | VITS (Piper) | nl-NL | 1 | 18,7 MB (int8) / 63,2 MB (fp32) | CC0 1.0 | ONNX |
| rhasspy/piper-voices (nl_NL-alex-medium) | VITS (Piper) | nl-NL | 1 | no disponible | CC0 1.0 | Piper (ONNX original) |
| Otras voces Piper nl_NL | VITS (Piper) | nl-NL | variable | variable | variable (mayoritariamente CC0) | ONNX |

La comparativa se limita a la familia Piper, ya que no se dispone de datos de otros modelos TTS neerlandeses en la información proporcionada. El modelo es esencialmente una conversión del original de Rhasspy, por lo que su calidad es equivalente; la diferencia principal es el empaquetado para phoonnx y la inclusión de copias int8 verificadas.

## Limitaciones y advertencias

- Modelo de una sola hablante y un solo idioma (nl-NL); no soporta otros idiomas ni cambio de voz.
- Calidad media (categoría "medium" de Piper); no es adecuado para aplicaciones que requieran naturalidad alta o clonación de voz.
- Dependencia de espeak-ng para la fonemización; si se usa el port espyak, algunos fonemas difieren y pueden producir palabras incorrectas.
- Los datos de entrenamiento no están registrados upstream, lo que impide evaluar sesgos o composición del dataset.
- Riesgo de alucinación acústica o pronunciación incorrecta en palabras fuera del dominio de entrenamiento, siglas o neologismos.
- Aunque la licencia es CC0 1.0 (sin restricciones), se recomienda acreditar a Rhasspy como autor original.
- El modelo base es un fine-tuning de una voz flamenca (nl_BE), por lo que puede presentar rasgos de pronunciación no estándar en neerlandés de los Países Bajos.
- No soporta SSML avanzado ni control de prosodia más allá de la puntuación de cláusula.
- La verificación de calidad se realizó con solo 3 frases de FLORES-200 devtest, una muestra muy reducida.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-nl_nl-alex-medium-espeak
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/nl/nl_NL/alex/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Datasets de voz upstream: https://github.com/OHF-Voice/voice-datasets
