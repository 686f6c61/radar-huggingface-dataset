# loom-ai-org/zipformer-small-loom

## Resumen

Zipformer-small-loom es la exportación al motor loom.cpp del modelo de reconocimiento automático del habla (ASR) `pkufool/zipformer-small`, basado en la arquitectura Zipformer de Next-gen Kaldi desarrollada por Xiaomi (arXiv:2310.11230). Se trata de un encoder transformer multi-rate con un transducer sin estado (stateless transducer), entrenado para chino e inglés, que se distribuye como un único fichero GGUF autodescriptivo que incluye sus propias topologías de grafo, el tokenizador y el script de controlador. Con 34.832.360 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a transcripción de audio en CPU y GPUs de gama baja.

La relevancia de esta ficha es doble: por un lado, documenta una variante concreta de Zipformer en formato GGUF lista para ejecutarse con `loom-py-rt`; por otro, sirve como referencia de las capacidades y limitaciones reales del checkpoint pequeño de Zipformer, incluyendo sus tasas de error y su comportamiento en distintos backends (CPU, Vulkan, Metal). El modelo decodifica el clip completo en una sola pasada, no es streaming, y solo incluye la cabeza transducer (no la CTC).

Es importante señalar que la búsqueda web asociada a este identificador devuelve resultados de la herramienta de grabación de pantalla Loom y de la marca de ropa Loom, sin relación con el proyecto loom.cpp ni con este modelo. Por tanto, toda la información técnica procede de la model card y de los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multi-rate (Zipformer) con transducer sin estado |
| Parámetros totales | 34.832.360 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo ASR; procesa el clip completo en una pasada; coste crece más rápido que la duración del audio) |
| Tipos de cuantización | F32 y Q8_0 (incluidos en el repo) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con grafo, tokenizador y driver embebidos) |

## Arquitectura y entrenamiento

El modelo es un Zipformer de la familia Next-gen Kaldi: un encoder transformer multi-rate que procesa la señal de audio a varias resoluciones temporales y un transducer sin estado como cabeza de decodificación. El checkpoint base es `pkufool/zipformer-small`, del que esta exportación hereda los pesos sin modificar en el fichero F32; las versiones cuantizadas se generan a partir de él con `loom-export --quantize <type>`, empaquetando los pesos de convolución y proyección. El fichero GGUF es autodescriptivo e incluye las topologías de grafo, el tokenizador y el script de controlador, de modo que el motor loom.cpp puede ejecutarlo sin configuración externa.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR). El checkpoint original incluye también una cabeza CTC que, según el autor, es menos precisa que la transducer (5,12 % de WER en LibriSpeech test-clean frente a 3,78 %), y que no está incluida en estos ficheros. La variante streaming (`pkufool/zipformer-small-streaming`) es un modelo separado que no se ha exportado.

## Capacidades

- Reconocimiento automático del habla (ASR) en chino e inglés con un único modelo.
- Decodificación transducer sin estado sobre audio mono a 16 kHz.
- Salida de texto sin marcas de tiempo: el campo `segments` es un único tramo que cubre el clip completo.
- Ejecución en CPU, Vulkan y Metal a través de loom.cpp; CUDA no ha sido probado según el autor.
- API de alto nivel `model.speech2text.infer(audio)` y acceso de bajo nivel mediante `model.infer(...)` al driver embebido.
- Inspección del driver y de sus argumentos mediante `model.driver_source`.
- No soporta selección de idioma: el argumento `language=` se ignora con un aviso.
- No soporta streaming en tiempo real (es el checkpoint no streaming).
- No incluye cabeza CTC ni funcionalidades de diarización, puntuación o timestamps.

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el modelo procesa el clip completo en una pasada y devuelve el texto; para audios largos conviene trocear por pausas (por ejemplo, con `silero-vad-loom`), ya que 60 s de audio tardan unos 9,8 s y consumen 1,8 GB en una CPU de portátil con 4 hilos.
- Subtitulado offline de vídeo en chino e inglés: al no generar timestamps, se usaría junto con un detector de actividad de voz para segmentar y alinear los subtítulos por fragmentos.
- Dictado y notas de voz en aplicaciones de escritorio: el modelo cabe en 140 MB (F32) o 58 MB (Q8_0), lo que permite distribuirlo embebido en aplicaciones locales sin depender de la nube.
- Preprocesado de datos para pipelines de NLP: transcripción masiva de corpus de audio en zh/en antes de tareas posteriores de análisis, indexación o búsqueda.
- Asistentes de voz en dispositivos de gama baja: la variante Q8_0 funciona a 6,4x tiempo real en una iGPU Vulkan pequeña (Radeon Vega 3) y a 3,8x en F32, adecuada para hardware integrado.
- Prototipado e investigación en ASR: al ser un export fiel del checkpoint de referencia (salida idéntica token a token en los 73 clips de test para F32), sirve para reproducir resultados y comparar cabezas transducer frente a CTC.
- Transcripción en entornos con CPU saturada: en un M1 Pro, Metal ofrece 13x tiempo real frente a 27x en CPU, útil como alternativa cuando la CPU está ocupada.

## Benchmarks y rendimiento

Los datos disponibles son métricas de velocidad y de calidad de la cuantización, no benchmarks estándar de ASR comparables entre modelos. Se presentan tal cual los publica el autor.

| Métrica | F32 | Q8_0 |
|---|---|---|
| WER en los 73 clips de test | 7,22 % | 7,30 %–7,39 % (según backend) |
| Transcripciones idénticas a F32 | Referencia | 63–65 de 73 |
| Velocidad en CPU x86 (4 hilos, portátil) | 16 s de audio en ~2,2 s | Ligeramente más rápido que F32 |
| Velocidad en Apple silicon (CPU y Metal) | 27x tiempo real (CPU) | ~1,2x sobre F32 |
| Velocidad en Metal (M1 Pro) | 13x tiempo real | No disponible |
| Velocidad en Vulkan (Radeon Vega 3, iGPU) | 3,8x tiempo real | 6,4x tiempo real |
| Audio de 60 s | 9,8 s, 1,8 GB | No disponible |
| Audio de 120 s | 25 s, 3,4 GB | No disponible |
| Precisión del encoder frente a la referencia | ~3e-5 | No disponible |
| WER de la cabeza CTC (referencia upstream) | 5,12 % (LibriSpeech test-clean) | No aplica |

## Requisitos de hardware

- VRAM/RAM estimada: 140 MB para F32 y 58 MB para Q8_0 en disco; el consumo en ejecución crece con la duración del audio (1,8 GB para 60 s y 3,4 GB para 120 s en CPU de portátil). La cuantización reduce como máximo un 7 % la memoria de CPU, porque la memoria de trabajo de la atención es la misma.
- GPU recomendadas: no se especifican modelos concretos; el autor ha probado Metal en M1 Pro y Vulkan en una Radeon Vega 3. CUDA no ha sido probado.
- ¿Cabe en GPU de consumo? Sí, por tamaño de pesos (decenas de MB); el límite real es la memoria de trabajo de la atención según la duración del audio.
- Opciones de despliegue: `loom-py-rt` (PyPI, extra `[hub]`) sobre el motor loom.cpp; exportación mediante loom-exporter. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: 27x tiempo real en CPU de M1 Pro, 13x en Metal, 7x en CPU de la máquina con Vega 3, 3,8x en Vulkan F32 y 6,4x en Vulkan Q8_0; en CPU x86 de portátil con 4 hilos, 16 s de audio en ~2,2 s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos ASR en la información proporcionada, por lo que la comparación se limita a variantes del propio modelo.

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| zipformer-small-loom (esta ficha) | 34,8 M | zh, en | GGUF (loom.cpp) | Apache 2.0 | Solo cabeza transducer, no streaming |
| pkufool/zipformer-small (base) | 34,8 M | zh, en | Pesos originales | Apache 2.0 | Incluye cabeza CTC (WER 5,12 % en LibriSpeech test-clean) |
| pkufool/zipformer-small-streaming | No disponible | zh, en | Pesos originales | No disponible | Variante streaming, no exportada a loom.cpp |

## Limitaciones y advertencias

- No es streaming: procesa el clip completo en una pasada; para audio largo hay que trocear por pausas.
- El coste crece más rápido que la duración del audio: 16 s tardan 2,2 s, 60 s tardan 9,8 s y 120 s tardan 25 s, con consumo de memoria creciente.
- En M1 Pro, Metal es más lento que la CPU (13x frente a 27x tiempo real); CUDA no ha sido probado.
- Solo incluye la cabeza transducer; la CTC, más precisa según la referencia upstream, no está en estos ficheros.
- El formato de mayúsculas y puntuación depende de los datos de entrenamiento: el inglés suele salir en mayúsculas y sin puntuar, a veces con puntuación y mayúsculas mixtas; hay que normalizar antes de comparar.
- No se puede seleccionar el idioma: `language=` se ignora con un aviso.
- No genera timestamps: `segments` es un único tramo que cubre todo el clip.
- Entrada limitada a audio mono a 16 kHz.
- La cuantización Q8_0 apenas mejora la velocidad en CPU x86 y reduce como máximo un 7 % la memoria de CPU.
- Licencia Apache 2.0 heredada del modelo base: permite uso comercial, pero conviene conservar los avisos de atribución.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento fuera de zh/en.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/zipformer-small-loom
- Modelo base: https://huggingface.co/pkufool/zipformer-small
- Variante streaming del modelo base: https://huggingface.co/pkufool/zipformer-small-streaming
- Paper de Zipformer (Next-gen Kaldi): https://arxiv.org/abs/2310.11230
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Paquete en PyPI: `loom-py-rt` (extra `[hub]`)
- Modelo de detección de actividad de voz mencionado: `silero-vad-loom` (referenciado en la model card, sin URL en la información disponible)
