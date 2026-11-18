# moonbox-dev/OpenVoiceV2-ONNX

## Resumen

OpenVoiceV2-ONNX es una conversión a formato ONNX del convertidor de timbre (tone-color converter) del modelo OpenVoice V2 de MyShell. El trabajo lo publica moonbox-dev y su objetivo es permitir la conversión de voz en dispositivo (on-device) mediante ONNX Runtime, con soporte para CPU, CUDA y DirectML. No se trata de un modelo de texto generativo, sino de un sistema audio-audio que reescribe una grabación con la voz de una referencia manteniendo las palabras y el ritmo del audio original.

La arquitectura subyacente es la de OpenVoice V2, un modelo de conversión de voz que combina un codificador de referencia y un convertidor basado en el SynthesizerTrn de VITS con un encoder posterior. El repositorio empaqueta dos grafos ONNX (`ref_encoder.onnx` y `converter.onnx`) junto con un `pipeline.py` en numpy que reproduce el flujo oficial (`extract_se` y `convert` con tau=0.3). La salida es siempre a 22.05 kHz y el modelo no incluye los hablantes base de MeloTTS, por lo que requiere cualquier grabación como fuente.

Es relevante porque ofrece una alternativa ligera y portable (34-66 MB según precisión) para integrar conversión de voz en aplicaciones locales, con latencias de tiempo real (RTF 0.04-0.06 en una RTX 3080 Laptop) y sin dependencia de PyTorch en producción. La licencia MIT facilita su uso comercial, aunque con las advertencias habituales sobre voz sintética.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Convertidor de timbre de OpenVoice V2 (encoder de referencia + SynthesizerTrn de VITS con encoder posterior), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; salida a 22.05 kHz) |
| Tipos de cuantizacion | fp16 (66 MB), int8 weight-only (34 MB); sin bf16 ni int4 |
| Idiomas soportados | multilingue (el conversor funciona con cualquier idioma; los benchmarks usan ingles y chino) |
| Licencia | MIT |
| Formato de pesos | ONNX (grafos `ref_encoder.onnx` y `converter.onnx`) + `pipeline.py` en Python |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX del convertidor de timbre de OpenVoice V2 (revision `f36e7ed` del repositorio original). La arquitectura consta de dos grafos: un codificador de referencia que toma un espectrograma lineal `spec` de forma [1, T, 513] (22.05 kHz, n_fft 1024, hop 256) y produce un embedding de timbre `se` de forma [1, 256]; y un convertidor que recibe el espectrograma de la fuente [1, 513, T], el ruido de muestreo del encoder posterior [1, 192, T] y los embeddings de fuente y destino [1, 256, 1], y genera audio `wav` [1, 1, 256 T]. Internamente reproduce la operación `SynthesizerTrn.voice_conversion` con tau=0.3.

El pipeline en Python calcula el espectrograma en numpy (equivalente a `spectrogram_torch(center=False)`), remuestrea con soxr y embebe la voz fuente y la destino en un solo bloque. El ruido es una entrada explícita, por lo que una semilla produce siempre la misma salida. No se incluye la marca de agua que el código oficial puede añadir. No se dispone de información sobre el dataset de entrenamiento original ni sobre procesos de RLHF/DPO, ya que esta ficha se centra en la conversión ONNX y no en el entrenamiento del modelo base.

## Capacidades

- Conversión de voz audio-audio: reescribe una grabación con el timbre de una voz de referencia, conservando palabras y ritmo.
- Funciona con cualquier idioma de entrada y salida (multilingüe), con salida fija a 22.05 kHz.
- Reproducibilidad determinista mediante semilla de ruido.
- Ejecución en CPU, CUDA y DirectML a través de ONNX Runtime.
- Dos precisiones disponibles: fp16 (mayor fidelidad respecto al original) e int8 (menor tamaño y mayor velocidad).
- No incluye los hablantes base de MeloTTS; requiere una grabación fuente externa.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No incluye marca de agua en la salida.

## Casos de uso

- Anonimización de voz en grabaciones: se puede convertir la voz de un hablante a una voz de referencia para proteger su identidad manteniendo el contenido, usando el pipeline ONNX en local sin enviar audio a la nube.
- Doblaje y localización de contenido: reemplazar la voz de un vídeo o pódcast por la de un actor de doblaje de referencia, conservando la sincronización y el ritmo originales gracias a la conversión audio-audio.
- Prototipado de asistentes de voz personalizados: integrar el convertidor en una aplicación de escritorio o móvil con ONNX Runtime para que el asistente hable con la voz del usuario, con latencias de tiempo real (RTF 0.04 en CUDA).
- Creación de contenido para redes y audiolibros: generar versiones con voces alternativas de un mismo texto narrado, usando una grabación fuente y varias referencias de voz.
- Pruebas de robustez de sistemas de reconocimiento de voz: convertir audios de un corpus a distintas voces para evaluar la estabilidad de un ASR ante variaciones de timbre.
- Investigación en privacidad y síntesis de voz: ejecutar conversiones en CPU o DirectML en equipos sin GPU dedicada, con el modelo int8 de 34 MB, para experimentos reproducibles con semilla fija.
- Integración en pipelines de accesibilidad: adaptar la voz de lectores de pantalla o contenidos educativos a la voz preferida del usuario sin depender de servicios externos.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan la salida ONNX con el modelo original en PyTorch fp32 sobre CUDA. El conjunto de evaluación incluye 4 grabaciones en inglés (LibriSpeech test-clean) y 2 en chino (AISHELL-1 test), cada una convertida a una voz objetivo inglesa y otra china (12 conversiones). Las métricas son WER/CER de una transcripción con Whisper large-v3-turbo, similitud de hablante con WavLM-base-plus-sv y DNSMOS P.835.

| Modelo | WER ingles | Similitud | DNSMOS | CER chino | Similitud | DNSMOS | SNR vs original | RTF |
|---|---|---|---|---|---|---|---|---|
| Original (PyTorch fp32, CUDA) | 2.6 % | 0.842 | 3.30 | 27.1 % | 0.797 | 2.89 | — | 0.05 |
| fp16 (CUDA) | 2.6 % | 0.842 | 3.31 | 25.0 % | 0.792 | 2.90 | 23 dB | 0.06 |
| int8 (CUDA) | 2.6 % | 0.845 | 3.30 | 25.0 % | 0.789 | 2.89 | 5 dB | 0.04 |

El CER chino es alto también en el original (27.1 %) porque las dos fuentes de AISHELL-1 duran unos 4 segundos y el convertidor arrastra algunos caracteres. El int8 presenta una diferencia audible respecto al original (SNR de 5 dB) aunque obtiene puntuaciones equivalentes; para fidelidad muestra a muestra se recomienda fp16. Los grafos fp32 previos a la escala de precisión coinciden con el original con un error de 5e-6 (convertidor) y 1e-6 (encoder de referencia), con 39 dB de SNR en CUDA.

## Requisitos de hardware

- VRAM estimada: muy baja; el modelo int8 ocupa 34 MB y el fp16 66 MB en disco, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: RTX 3080 Laptop (medida en los benchmarks, RTF 0.04-0.06), cualquier GPU NVIDIA con soporte CUDA; también funciona en CPU y en DirectML (GPU integradas o AMD).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para uso no interactivo.
- Opciones de despliegue: ONNX Runtime (CPU, `onnxruntime-gpu` para CUDA, DirectML), con el `pipeline.py` incluido; requiere numpy, onnxruntime, soundfile y soxr.
- Latencia y throughput: RTF de 0.04 (int8, CUDA) y 0.06 (fp16, CUDA) en una RTX 3080 Laptop, es decir, procesa audio aproximadamente 16-25 veces más rápido que tiempo real en esa GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| OpenVoiceV2-ONNX (este) | Conversion de voz audio-audio | no disponible | no aplica | multilingue | MIT | ONNX |
| OpenVoice V2 (MyShell) | Conversion de voz audio-audio | no disponible | no aplica | multilingue | MIT | PyTorch |
| RVC (Retrieval-based Voice Conversion) | Conversion de voz audio-audio | no disponible | no aplica | multilingue | MIT | PyTorch/ONNX |
| So-VITS-SVC | Conversion de voz (canto) | no disponible | no aplica | multilingue | AGPL-3.0 | PyTorch |

La comparativa se limita a la categoría de conversión de voz; no se dispone de datos de benchmarks cruzados entre estos modelos en la información proporcionada. La ventaja principal de esta variante es el empaquetado ONNX con pipeline reproducible y licencia MIT, frente a alternativas que requieren PyTorch o tienen licencias más restrictivas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- El CER en chino es elevado (25-27 %) en el conjunto de evaluación, en parte por la duración corta de las fuentes; no debe interpretarse como calidad general en chino.
- El int8 presenta baja fidelidad respecto al original (SNR 5 dB) y puede introducir artefactos audibles; usar fp16 si se requiere alta similitud.
- No incluye los hablantes base de MeloTTS ni la marca de agua del código oficial, lo que puede ser relevante para trazabilidad y cumplimiento.
- Riesgo de uso indebido para suplantación de identidad o deepfakes de voz; la licencia MIT no exime de las obligaciones legales sobre síntesis de voz.
- No se han publicado datos sobre sesgos acústicos por idioma, género o acento más allá del conjunto de evaluación limitado (inglés y chino).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- No hay build bf16 ni int4; la cuantización a 4 bits no es posible con MatMulNBits en esta arquitectura.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/OpenVoiceV2-ONNX
- Modelo base: https://huggingface.co/myshell-ai/OpenVoiceV2
- Repositorio oficial de OpenVoice: https://github.com/myshell-ai/OpenVoice
- ONNX Runtime: https://onnxruntime.ai/
- MeloTTS: https://github.com/myshell-ai/MeloTTS
