# flockspeech/junco

## Resumen

Junco v0.1 es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por Flock Speech, diseñado específicamente para ejecutarse de forma offline en CPU sin dependencias de GPU, red o PyTorch. Se trata de un modelo no autorregresivo que combina un encoder transformer, un predictor de duración, un decodificador de flow-matching condicional y el vocoder Vocos, con un total de 11,4 millones de parámetros en el modelo acústico y 13,5 millones en el vocoder. El resultado es un paquete ONNX de 44 MB que genera audio mono a 24 kHz más rápido que el tiempo real en hardware de consumo.

El modelo resuelve el problema de la síntesis de voz en entornos con recursos limitados: aplicaciones de escritorio, dispositivos embebidos, asistentes locales y sistemas que requieren privacidad total al no enviar texto a servicios en la nube. Frente a alternativas como Piper o Matcha-TTS, Junco ofrece una licencia Apache-2.0 permisiva (con pesos del vocoder bajo MIT) y un rendimiento en CPU competitivo, con 5,1× de velocidad en 4 hilos y un WER de 1,71% en el conjunto de evaluación LibriTTS-R test-clean.

La relevancia actual de Junco radica en su equilibrio entre tamaño reducido, calidad cercana a la de grabaciones reales (UTMOS22 de 4,20 frente a 4,23 de referencia) y facilidad de despliegue mediante ONNX Runtime en Linux, macOS y Windows, tanto en x86-64 como en ARM64. Es un modelo de una sola voz femenina en inglés estadounidense, orientado a lectura en voz alta y respuestas de asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS no autorregresivo: encoder transformer, predictor de duración, decodificador de flow-matching condicional, vocoder Vocos |
| Parametros totales | 11,4M (modelo acústico) + 13,5M (vocoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Decodificador int8, encoder y vocoder fp16 (release ONNX); checkpoint PyTorch disponible para referencia |
| Idiomas soportados | Inglés (US) |
| Licencia | Apache-2.0 (pesos del vocoder MIT) |
| Formato de pesos | ONNX (release principal); checkpoint PyTorch para benchmark |

## Arquitectura y entrenamiento

Junco es un modelo TTS no autorregresivo con una arquitectura en cuatro etapas: un encoder transformer que procesa la secuencia de texto, un predictor de duración que determina la longitud de cada fonema, un decodificador de flow-matching condicional que genera las características acústicas y el vocoder Vocos que sintetiza la forma de onda final a 24 kHz. El uso de flow-matching en lugar de difusión o modelos autorregresivos permite generar audio con pocos pasos (8 por defecto, 4 para mayor velocidad con ligera pérdida de calidad) y sin dependencia de PyTorch en tiempo de inferencia.

El modelo se entrenó sobre el dataset `keithito/lj_speech`, un corpus de habla inglesa de dominio público ampliamente utilizado en TTS. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que el release ONNX fue verificado contra el modelo PyTorch con una relación señal-ruido superior a 78 dB antes de la cuantización, y que tras la cuantización se comparó calidad y velocidad en 40 frases del mismo conjunto de test.

## Capacidades

- Generación de voz en inglés (US) a partir de texto, con salida mono a 24 kHz.
- Síntesis más rápida que el tiempo real en CPU: 3,1× con 1 hilo y 5,1× con 4 hilos (medido en un Intel Xeon a 2,2 GHz).
- Ejecución offline completa: sin GPU, sin red y sin dependencia de PyTorch en tiempo de inferencia.
- Control de velocidad del habla mediante el parámetro `speed` (por ejemplo, 1,2 para un 20% más rápido).
- Control del número de pasos de flow-matching (`steps`): 8 por defecto, 4 para aproximadamente 1,5× más velocidad con calidad ligeramente inferior.
- Reproducibilidad mediante el parámetro `seed` (por defecto 0), que fija la pequeña variación aleatoria en la entrega.
- Streaming por frases: el método `tts.stream()` produce audio frase a frase para baja latencia en textos largos.
- Una única voz femenina con estilo de lectura en voz alta.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz locales en aplicaciones de escritorio: Junco puede integrarse en asistentes que funcionan sin conexión, generando respuestas habladas en tiempo real gracias a su velocidad de 5,1× en 4 hilos de CPU y su bajo consumo de RAM (623 MB en pico).
- Lectura de notificaciones y correos en sistemas operativos o aplicaciones de productividad: el modelo produce audio comprensible y natural (WER de 1,71% en LibriTTS-R test-clean) para leer textos cortos y medianos sin enviar datos a la nube.
- Narración de contenido en dispositivos embebidos y edge: con 44 MB de descarga y soporte para ARM64, Junco puede ejecutarse en Raspberry Pi u otros dispositivos con CPU limitada para narrar textos en aplicaciones de domótica, kioscos o señalización.
- Accesibilidad para personas con discapacidad visual: el modelo puede leer en voz alta contenido de pantalla o documentos en inglés con una calidad cercana a grabaciones reales (UTMOS22 de 4,20 frente a 4,23 de referencia).
- Generación de audio para prototipos y pruebas de UX: los desarrolladores pueden generar muestras de voz de forma reproducible (seed fijo) y ajustar velocidad y pasos para iterar rápidamente en el diseño de interfaces conversacionales.
- Síntesis de voz en pipelines de CI/CD para pruebas automatizadas: al ser un paquete ONNX sin dependencias pesadas, Junco puede integrarse en entornos de integración continua para validar la salida de audio de aplicaciones de voz sin necesidad de GPU.
- Lectura de textos largos con streaming: el método `tts.stream()` permite procesar párrafos de un minuto con un WER de 0,5%, adecuado para aplicaciones de lectura de artículos o documentación.

## Benchmarks y rendimiento

### Calidad de voz (conjunto LibriTTS-R test-clean, 150 frases)

| Modelo | Tamano (MB) | UTMOS22 ↑ | UTMOSv2 ↑ | WER ↓ | Licencia |
|---|---:|---:|---:|---:|---|
| Grabaciones reales (referencia) | n/a | 4,23 | 3,29 | 2,30% | n/a |
| **Junco v0.1** | **77,2** † | **4,20** | **3,72** | **1,71%** | **Apache-2.0** |
| Matcha-TTS | 274,6 | 4,34 | 3,80 | 1,65% | MIT |
| Piper (lessac, medium) | 63,2 | 4,35 | 3,79 | 2,33% | GPL-3.0 |
| F5-TTS v1 | 1402,9 | 4,24 | 3,52 | 2,58% | CC BY-NC 4.0 |
| KittenTTS nano 0.1 | 23,9 | 3,59 | 2,02 | 3,12% | Apache-2.0 |

† Benchmark ejecutado con el checkpoint PyTorch. El release ONNX del repositorio es de 44 MB.

### WER en texto difícil (92 frases: números, fechas, dinero, contactos, nombres, homógrafos)

| Modelo | WER ↓ |
|---|---:|
| Junco v0.1 | 4,9% |
| Piper | 4,9% |
| Matcha-TTS | 5,2% |
| F5-TTS | 7,0% |
| KittenTTS | 9,3% |

### Velocidad (segundos de audio por segundo de cómputo, vocoder incluido)

| Modelo | 1 hilo CPU ↑ | 4 hilos CPU ↑ | GPU NVIDIA T4 ↑ | RAM pico |
|---|---:|---:|---:|---:|
| Piper | 7,4× | 13,5× | n/a | 382 MB |
| KittenTTS | 3,3× | 5,0× | n/a | 789 MB |
| **Junco v0.1 (PyTorch)** | **3,1×** | **5,1×** | **33×** | **623 MB** |
| Matcha-TTS | 0,7× | 1,3× | 25× | 1.453 MB |
| F5-TTS v1 | 0,006× | 0,011× | 2,1× | 3.698 MB |

La CPU de referencia fue un Intel Xeon a 2,2 GHz; según la model card, CPUs de escritorio y portátiles son varias veces más rápidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; el modelo está diseñado para ejecutarse sin GPU. En GPU NVIDIA T4 alcanza 33× de velocidad en tiempo real, pero no se especifica VRAM necesaria.
- GPU recomendadas: no es un requisito; el modelo funciona en CPU. Para aceleración opcional, se menciona NVIDIA T4 en los benchmarks.
- ¿Cabe en GPU de consumo? Sí, aunque el modelo está optimizado para CPU; el release ONNX de 44 MB es trivial para cualquier GPU moderna.
- RAM pico: 623 MB en la versión PyTorch; el release ONNX cuantizado probablemente requiere menos, aunque no se especifica.
- Opciones de despliegue: ONNX Runtime en CPU (Linux, macOS, Windows; x86-64 y ARM64). El paquete Python `flockspeech` (PyPI) incluye los pesos y permite uso directo. También se puede usar `huggingface_hub.snapshot_download` para obtener los archivos ONNX.
- Latencia y throughput: 3,1× en 1 hilo de CPU y 5,1× en 4 hilos (Xeon a 2,2 GHz); 33× en NVIDIA T4. El streaming por frases reduce la latencia percibida en textos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | UTMOS22 | WER (test-clean) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Junco v0.1** | 11,4M + 13,5M vocoder | No disponible | 4,20 | 1,71% | Apache-2.0 (vocoder MIT) | ONNX, PyPI `flockspeech` |
| Piper (lessac, medium) | No disponible | No disponible | 4,35 | 2,33% | GPL-3.0 | ONNX, múltiples voces |
| Matcha-TTS | No disponible | No disponible | 4,34 | 1,65% | MIT | PyTorch |
| KittenTTS nano 0.1 | No disponible | No disponible | 3,59 | 3,12% | Apache-2.0 | No disponible |
| F5-TTS v1 | No disponible | No disponible | 4,24 | 2,58% | CC BY-NC 4.0 (pesos) | PyTorch |

Junco destaca por su licencia permisiva (Apache-2.0) frente a Piper (GPL-3.0) y F5-TTS (CC BY-NC 4.0, no comercial). Su WER es el mejor de la comparativa en test-clean (1,71%), aunque su naturalidad (UTMOS22 4,20) está ligeramente por debajo de Piper y Matcha-TTS. En velocidad en CPU, Piper es más rápido (13,5× en 4 hilos frente a 5,1× de Junco), pero Junco ofrece mejor calidad de voz y licencia más flexible.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense; no hay soporte multilingüe.
- Una única voz femenina con estilo de lectura en voz alta; no hay control de emoción, tono ni otras voces.
- Riesgo de alucinación en la pronunciación de palabras poco comunes, nombres propios o términos técnicos; el WER en texto difícil es del 4,9%, similar a Piper.
- El modelo se entrenó sobre LJSpeech, un corpus de un solo hablante y dominio público; puede presentar sesgos de estilo y prosodia limitados a ese registro.
- La licencia Apache-2.0 permite uso comercial, pero los pesos del vocoder están bajo MIT; es necesario verificar el cumplimiento de ambas licencias en producción.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo TTS.
- El release ONNX está cuantizado (int8 en el decodificador, fp16 en encoder y vocoder); la calidad puede diferir ligeramente del checkpoint PyTorch original, aunque la model card indica una verificación con SNR superior a 78 dB antes de la cuantización.
- No se especifica la longitud máxima de texto de entrada ni el contexto; el streaming por frases mitiga problemas con textos largos, pero no se documenta un límite formal.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica que es un lanzamiento muy reciente y con poca validación comunitaria.

## Enlaces

- [Hugging Face: flockspeech/junco](https://huggingface.co/flockspeech/junco)
- [Paquete PyPI: flockspeech](https://pypi.org/project/flockspeech/)
- [Dataset: keithito/lj_speech](https://huggingface.co/datasets/keithito/lj_speech)
- [Flock Speech en Hugging Face](https://huggingface.co/flockspeech)
- [Muestras de audio: greeting.wav](https://huggingface.co/flockspeech/junco/resolve/main/samples/greeting.wav)
- [Muestras de audio: assistant.wav](https://huggingface.co/flockspeech/junco/resolve/main/samples/assistant.wav)
- [Muestras de audio: story.wav](https://huggingface.co/flockspeech/junco/resolve/main/samples/story.wav)
- [Muestras de audio: news.wav](https://huggingface.co/flockspeech/junco/resolve/main/samples/news.wav)
