# okasi/piper-english-kusal-onnx-q8

## Resumen

`okasi/piper-english-kusal-onnx-q8` es una conversión cuantizada a INT8 del modelo de síntesis de voz Piper correspondiente a la voz estadounidense "Kusal" en calidad media, originalmente publicado por el proyecto Rhasspy en `rhasspy/piper-voices`. El autor de esta conversión es el usuario de Hugging Face `okasi`. El modelo resuelve el problema de desplegar TTS neuronal ligero en entornos con recursos limitados, especialmente en el navegador mediante ONNX Runtime Web, sin necesidad de infraestructura GPU dedicada.

La relevancia de esta ficha radica en su reducción de tamaño: el fichero acústico pasa de 60,27 MiB en el original a 15,99 MiB tras la cuantización Q8, manteniendo la estructura de entradas y salidas del grafo Piper original. Esto lo hace apto para aplicaciones web con WASM, extensiones de navegador o dispositivos embebidos donde el ancho de banda y la memoria son críticos.

La arquitectura subyacente es la de Piper (VITS simplificado con decoder autorregresivo basado en flujo), un modelo de TTS neuronal de tipo end-to-end que requiere un fonemizador externo (eSpeak NG) para convertir texto a fonemas. El modelo se distribuye bajo licencia MIT y está orientado exclusivamente al idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Piper (VITS, TTS neuronal end-to-end con decoder por flujo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; entrada por fonemas, sin ventana de contexto) |
| Tipos de cuantizacion | INT8 per-channel (Q8), 116 tensores de pesos |
| Idiomas soportados | en (inglés, variante en_US) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx` + `.onnx.json` de configuración) |

## Arquitectura y entrenamiento

El modelo es una conversión Q8 del checkpoint `en_US-kusal-medium` de `rhasspy/piper-voices`. Piper emplea una arquitectura VITS simplificada: un encoder de fonemas, un predictor de duración y un decoder generativo basado en flujo normalizador que produce la forma de onda directamente, sin vocoder separado. La conversión Q8 almacena 116 tensores de pesos como INT8 por canal y los desquantiza a coma flotante durante la inferencia, manteniendo intactas las entradas y salidas del grafo original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino adicional en esta conversión. La model card del autor indica que la voz original se apoya en la voz base Lessac y enlaza a la tarjeta del repositorio upstream para los detalles de datos de entrenamiento. La inferencia de texto requiere el fonemizador eSpeak NG de Piper como componente externo.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto plano.
- Generación de audio con un modelo acústico de 15,99 MiB, apto para ejecución en navegador.
- Compatible con ONNX Runtime Web (probado con la versión 1.31.1) y ejecución multihilo WASM (4 hilos en la prueba del autor).
- Fonemización mediante eSpeak NG, incluida en el ecosistema Piper.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión, audio de entrada ni modo "thinking".
- Capacidad multilingüe limitada exclusivamente al inglés (en_US).

## Casos de uso

- Síntesis de voz en aplicaciones web sin backend: el modelo puede cargarse en el navegador con ONNX Runtime Web y generar audio localmente, como demuestra el benchmark del autor con 1,91 s de generación para 128 palabras en un Apple M1 Pro.
- Lectura de artículos y accesibilidad: integración en lectores de pantalla o extensiones de navegador que conviertan texto seleccionado en audio, aprovechando el tamaño reducido de 15,99 MiB para una carga rápida.
- Asistentes de voz en dispositivos embebidos: Raspberry Pi u otros SBC con recursos limitados pueden ejecutar el modelo vía Piper o ONNX Runtime sin GPU dedicada.
- Generación de avisos y notificaciones habladas: en sistemas de domótica o paneles informativos que necesiten locuciones cortas en inglés con baja latencia.
- Prototipado de interfaces conversacionales: uso en demos de chatbots o IVR donde se requiera una voz TTS ligera y con licencia permisiva (MIT) para pruebas y producción.
- Contenido educativo y audiolibros ligeros: conversión de textos en inglés a audio para materiales de aprendizaje, con la ventaja de poder ejecutarse del lado del cliente sin enviar datos a servidores externos.
- Pruebas de integración en pipelines CI/CD de TTS: validación de calidad y WER usando `benchmark.json` como referencia reproducible con semillas fijas.

## Benchmarks y rendimiento

El autor publica un benchmark en navegador (Chromium 143 sobre Apple M1 Pro, ONNX Runtime Web 1.31.1, 4 hilos WASM). La evaluación de WER se realizó con Whisper large-v3-turbo FP16 sobre las grabaciones generadas.

| Muestra | Palabras del pasaje | Generación | Carga | WER (Whisper Turbo) |
|---|---:|---:|---:|---:|
| original-run | 128 | 1,91 s | 1,48 s | 5,47% (7/128) |
| matched-seed | 128 | 1,92 s | 1,54 s | 4,69% (6/128) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo acústico Q8 ocupa 15,99 MiB en disco y una huella de memoria en tiempo de ejecución del orden de decenas de MiB, no disponible con precisión.
- GPU recomendadas: no requiere GPU; el benchmark del autor se ejecutó en CPU (Apple M1 Pro) mediante WASM.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU y SBC; también en navegador.
- Opciones de despliegue: ONNX Runtime Web (WASM), Piper (CLI y librería), ONNX Runtime nativo; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: 1,91 s de generación para 128 palabras (~1,5 palabras/s en la prueba citada), con 1,48 s de carga inicial del modelo y fonemizador en el navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| okasi/piper-english-kusal-onnx-q8 | no disponible (116 tensores INT8) | no aplica | 1,91 s / 128 palabras; WER 4,69–5,47% | MIT | Hugging Face |
| rhasspy/piper-voices (en_US-kusal-medium, original) | no disponible | no aplica | no disponible en la información | MIT | Hugging Face |
| Derur/piper-tts-models (en/kusal/en_US-kusal-medium.onnx) | no disponible | no aplica | no disponible en la información | no disponible | Hugging Face |

La comparativa se limita a variantes del mismo checkpoint Piper, ya que no se han proporcionado datos de otros modelos TTS comparables (p. ej., Coqui TTS, Kokoro, VITS originales) en la información disponible.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense; no es multilingüe.
- Requiere el fonemizador eSpeak NG de Piper como dependencia externa para la inferencia de texto.
- El fichero de configuración `.onnx.json` debe mantenerse junto al modelo con el nombre exacto indicado; de lo contrario, la carga falla.
- La cuantización INT8 puede introducir degradación de calidad frente al modelo original de 60,27 MiB; no se han publicado comparativas de calidad subjetiva (MOS) en la información disponible.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producirse una pronunciación incorrecta de nombres propios, siglas o términos fuera del vocabulario del fonemizador.
- El WER medido con Whisper (4,69–5,47%) refleja la inteligibilidad de la salida, no la naturalidad prosódica.
- Licencia MIT permisiva, pero conviene verificar la procedencia de los datos de entrenamiento de la voz original (Lessac) para usos comerciales sensibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- El tamaño del repo figura como 0.0 GB, lo que sugiere que la información de metadatos puede estar incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okasi/piper-english-kusal-onnx-q8
- Modelo base: https://huggingface.co/rhasspy/piper-voices
- Tarjeta upstream de la voz Kusal: https://huggingface.co/rhasspy/piper-voices/blob/e7229f7d33a10e145e109b886d661984201ac3c4/en/en_US/kusal/medium/MODEL_CARD
- Fichero original en_US-kusal-medium.onnx (v1.0.0): https://huggingface.co/rhasspy/piper-voices/blob/v1.0.0/en/en_US/kusal/medium/en_US-kusal-medium.onnx
- Espejo en Derur/piper-tts-models: https://huggingface.co/Derur/piper-tts-models/blob/main/en/kusal/en_US-kusal-medium.onnx
