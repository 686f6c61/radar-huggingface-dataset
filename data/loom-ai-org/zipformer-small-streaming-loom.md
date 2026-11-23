# loom-ai-org/zipformer-small-streaming-loom

## Resumen

Zipformer small streaming es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por Xiaomi (Next-gen Kaldi) y exportado al formato GGUF del motor loom.cpp por loom-ai-org. Se trata de una variante "small streaming" del encoder Zipformer descrito en el paper arXiv:2310.11230: un transformer multi-rate con atención causal por chunks y un transductor sin estado (stateless transducer), entrenado para chino e inglés. El modelo base es `pkufool/zipformer-small-streaming` y esta exportación conserva sus pesos sin modificar en el fichero F32.

La relevancia de esta ficha reside en que el modelo está empaquetado como un único GGUF autodescriptivo que incluye las topologías del grafo, el tokenizador y el script de controlador, lo que permite ejecutarlo con la librería `loom-py-rt` sin depender del ecosistema original de Kaldi. Con 35,5 millones de parámetros y un tamaño de repo de 0,2 GB, es un modelo muy ligero orientado a decodificación en streaming sobre CPU.

El modelo decodifica en chunks de 640 ms con 2,56 s de atención hacia la izquierda, lo que hace que el coste crezca linealmente con la duración del audio mientras la memoria del encoder permanece constante. Está pensado para transcripción en vivo o por bloques donde la latencia importa más que la precisión absoluta, ya que el propio autor reconoce una tasa de error superior a la de la variante no streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multi-rate con atención causal por chunks (Zipformer) + transductor sin estado |
| Parametros totales | 35.534.602 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | decodificación en chunks de 640 ms con 2,56 s de atención a la izquierda; sin ventana de contexto en tokens |
| Tipos de cuantizacion | F32 y Q8_0 (ficheros separados) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (autodescriptivo, con grafo, tokenizador y driver embebidos) |

## Arquitectura y entrenamiento

El modelo es un encoder Zipformer en su variante small streaming: un transformer multi-rate con atención causal organizada por chunks, acoplado a un transductor sin estado. La decodificación se realiza en bloques de 640 ms con 2,56 s de atención hacia la izquierda, de modo que el coste computacional crece linealmente con la duración del audio mientras la memoria del encoder no aumenta. El front-end lee el clip completo (unos 1,5 MB de memoria por segundo de audio en F32), aunque la decodificación sea por chunks.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base es `pkufool/zipformer-small-streaming`, del que esta exportación hereda los pesos sin modificar en el fichero F32 (verificado token a token contra la decodificación streaming original en los 73 clips de prueba, con salida del encoder coincidente hasta ~1e-4). Los ficheros cuantizados empaquetan los pesos de convolución y proyección mediante `loom-export --quantize`.

## Capacidades

- Reconocimiento automático del habla (ASR) en chino e inglés, en modo streaming y en una sola llamada sobre el clip completo.
- Decodificación en vivo: `speech2text.stream()` acepta audio a medida que llega y devuelve actualizaciones incrementales con el texto transcrito, incluyendo indicación de revisión (`update.revised`) cuando el texto previo cambia.
- Decodificación por lotes: `speech2text.infer(audio)` procesa el clip entero y devuelve el texto final.
- Entrada de audio mono a 16 kHz como lista de floats.
- Sin selección de idioma: el modelo decodifica en el idioma para el que fue entrenado y el argumento `language=` se ignora con un aviso.
- Sin marcas de tiempo: `segments` devuelve un único span que cubre todo el clip.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.
- No dispone de capacidades de visión, audio generativo ni thinking mode.

## Casos de uso

- Transcripción en vivo de reuniones o clases: usando `speech2text.stream()` con chunks de un segundo, el modelo entrega el texto a medida que se graba, con un coste lineal respecto a la duración y memoria del encoder constante. Adecuado para subtitulado en directo en chino o inglés.
- Dictado por voz en aplicaciones de escritorio: al ser un modelo de 35,5 M de parámetros y 61 MB en Q8_0, puede integrarse en un cliente ligero que transcribe localmente sin enviar audio a la nube.
- Subtitulado de vídeos pregrabados en chino e inglés: `speech2text.infer` procesa el clip completo y devuelve la transcripción; útil cuando no se requiere latencia y se acepta la precisión de la variante streaming.
- Procesamiento por lotes de grabaciones de atención al cliente: el modelo puede transcribir archivos de audio de forma secuencial en CPU (RTF aproximado de 0,12 en un portátil de 4 hilos), lo que permite indexar conversaciones para búsqueda o análisis.
- Asistentes de voz embebidos en dispositivos con recursos limitados: el tamaño reducido y la licencia Apache 2.0 permiten desplegarlo en entornos sin GPU, con cuantización Q8_0 para reducir memoria un 40 %.
- Transcripción de audio en pipelines de datos: al ser un GGUF autodescriptivo con driver embebido, se puede integrar en flujos automatizados mediante `loom-py` sin gestionar tokenizadores ni grafos por separado.
- Prototipado de sistemas de voz bilingües chino-inglés: el modelo cubre ambos idiomas y permite validar una arquitectura de ASR streaming antes de migrar a un modelo de mayor tamaño.

## Benchmarks y rendimiento

| Benchmark | Zipformer small streaming (640 ms) | Zipformer small (no streaming) |
|---|---|---|
| LibriSpeech test-clean (WER, según upstream) | 8,15 % | 3,78 % |
| 73 clips medidos en esta exportación (WER) | 12,17 % (F32) / 11,91 % (Q8_0) | 7,22 % |

En los 73 clips medidos, el fichero Q8_0 obtuvo un WER de 11,91 % frente al 12,17 % del F32, con 46 de 73 transcripciones idénticas al F32 y el resto con diferencias de aproximadamente una palabra. El Q8_0 no es más rápido que el F32 en CPU x86, pero usa un 40 % menos de memoria. En un portátil de 4 hilos, 120 s de audio tardaron 14 s y 373 MB, y 400 s tardaron 47 s y 785 MB (RTF aproximado de 0,12, unas 8,5 veces más rápido que tiempo real). No se han medido GPUs con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para GPU; en CPU, el F32 requiere unos 373 MB para 120 s de audio y 785 MB para 400 s (front-end incluido).
- GPU recomendadas: no disponibles; el autor indica que las GPUs no se han medido con este modelo.
- Cabe en CPU consumer: sí; el modelo pesa 143 MB en F32 y 61 MB en Q8_0, y se ejecutó en un portátil de 4 hilos a RTF 0,12.
- Opciones de despliegue: `loom-py` (paquete `loom-py-rt` en PyPI, con extra `[hub]`) sobre el motor loom.cpp; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput estimados: decodificación en chunks de 640 ms; en CPU de portátil, aproximadamente 8,5 veces más rápido que tiempo real (RTF 0,12) con 4 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / decodificación | WER (LibriSpeech test-clean) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zipformer small streaming (este) | 35,5 M | chunks de 640 ms, 2,56 s de atención a la izquierda | 8,15 % (upstream) / 12,17 % (73 clips) | Apache 2.0 | GGUF en Hugging Face, vía loom-py |
| Zipformer small (no streaming) | no disponible | clip completo | 3,78 % (upstream) / 7,22 % (73 clips) | Apache 2.0 (heredada del base) | disponible en Hugging Face |
| Zipformer small streaming 320 ms / 1280 ms | mismos pesos | chunks de 320 ms o 1280 ms | no disponible | Apache 2.0 | versiones upstream del mismo modelo |

## Limitaciones y advertencias

- Menor precisión que la variante no streaming: 8,15 % frente a 3,78 % en LibriSpeech test-clean según upstream, y 12,17 % frente a 7,22 % en los 73 clips medidos. Para grabaciones terminadas donde la latencia no importa, el autor recomienda `zipformer-small-loom`.
- Una sola latencia: los ficheros corresponden a la configuración de 640 ms; upstream publica también 320 ms y 1280 ms con los mismos pesos.
- El front-end lee el clip completo: unos 1,5 MB de memoria por segundo de audio en F32, lo que limita la escalabilidad en clips muy largos.
- El idioma no es seleccionable: el argumento `language=` se ignora con un aviso.
- Formato de salida dependiente de los datos de entrenamiento: el inglés aparece mayoritariamente en mayúsculas y sin puntuación.
- Sin marcas de tiempo: `segments` devuelve un único span que cubre todo el clip.
- Solo audio mono a 16 kHz.
- No se han medido GPUs con este modelo; el rendimiento en GPU es desconocido.
- Licencia Apache 2.0, que permite uso comercial con las obligaciones habituales de atribución y aviso de licencia.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un modelo ASR, los errores se manifiestan como transcripciones incorrectas, especialmente en audio ruidoso o con acentos no representados en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/zipformer-small-streaming-loom
- Modelo base: https://huggingface.co/pkufool/zipformer-small-streaming
- Paper de Zipformer: https://arxiv.org/abs/2310.11230
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Librería loom-py: https://github.com/loom-ai-org/loom-py
