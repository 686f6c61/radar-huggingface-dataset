# smile-forge/whisper-large-v3-turbo-onnx-genai

## Resumen

Whisper large-v3-turbo para onnxruntime-genai es un export del modelo de reconocimiento automático de voz `openai/whisper-large-v3-turbo` (revisión `41f01f3f`) al formato ONNX, preparado específicamente para ejecutarse con la librería onnxruntime-genai 0.17.1. Lo publica el usuario `smile-forge`, autor también del proyecto Nexaflow, que lo utiliza para transcribir cada turno de voz finalizado en conversaciones habladas. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es una conversión de formato con cuantizaciones listas para producción (fp16 para CUDA, int8 para CPU), por lo que las capacidades subyacentes son las del Whisper large-v3-turbo original de OpenAI.

El interés técnico del repositorio es doble. Por un lado, ofrece artefactos listos para usar con dos ejecuciones distintas sin necesidad de exportar el modelo uno mismo. Por otro, documenta un fallo del builder de onnxruntime-genai 0.17.1 que impedía exportar large-v3-turbo: el builder emitía una salida de clave/valor de atención cruzada por cada capa del encoder, leyendo la capa del decoder del mismo índice, mientras que turbo tiene 32 capas de encoder y solo 4 de decoder. El repositorio incluye el parche de tres líneas (`patch_builder.py`) y un script PowerShell reproducible (`Build-WhisperTurbo.ps1`) que fija todas las versiones y regenera los ficheros byte a byte.

El modelo se distribuye bajo licencia MIT, igual que el modelo original, y declara soporte para inglés, francés y alemán. El tamaño del repositorio es de 3,4 GB, con dos carpetas independientes: `cuda/` (fp16, 1,6 GB) y `cpu/` (int8 con embeddings en fp32, 1,5 GB). El autor indica que ambas versiones produjeron transcripciones idénticas en todas las muestras comprobadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), 32 capas de encoder y 4 capas de decoder |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 s por inferencia (entrada de encoder); sin contexto de texto persistente |
| Tipos de cuantización | fp16 (carpeta `cuda/`), int8 con embeddings en fp32 (carpeta `cpu/`) |
| Idiomas soportados | inglés, francés, alemán (según los tags y la model card) |
| Licencia | MIT, Copyright (c) 2022 OpenAI |
| Formato de pesos | ONNX (para onnxruntime-genai 0.17.1), carpetas `cuda/` y `cpu/` |
| Tamaño del repositorio | 3,4 GB (1,6 GB CUDA fp16 + 1,5 GB CPU int8) |
| Librería | onnxruntime-genai |
| Tarea (pipeline) | automatic-speech-recognition |
| Modelo base | openai/whisper-large-v3-turbo (revisión `41f01f3f`) |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento nuevo: es un export del modelo Whisper large-v3-turbo de OpenAI, que mantiene la arquitectura encoder-decoder de tipo transformer propia de la familia Whisper. La particularidad de la variante turbo es su asimetría entre encoder y decoder: 32 capas de encoder frente a solo 4 capas de decoder, algo que rompe las suposiciones del builder de onnxruntime-genai 0.17.1, diseñado para arquitecturas con el mismo número de capas en ambas partes. El runtime ya dimensionaba la caché de atención cruzada según la profundidad del decoder, de modo que bastó con parchear el builder para que emita las salidas K/V de atención cruzada de acuerdo con el número de capas del decoder en lugar del de encoder.

La conversión se realizó con el builder propio de onnxruntime-genai 0.17.1 y se generaron dos variantes: una en fp16 orientada al execution provider de CUDA y otra en int8 (con los embeddings en fp32) orientada a CPU. El repositorio incluye los dos scripts necesarios para reproducir el proceso: `patch_builder.py`, que contiene el parche, y `Build-WhisperTurbo.ps1`, que fija todas las versiones de las dependencias, aplica el parche y ejecuta ambas compilaciones. Según el autor, volver a ejecutar ese script reproduce los ficheros publicados byte a byte. No se documentan en la información disponible los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO), ya que el repositorio solo cubre la fase de exportación.

Cabe señalar una optimización de despliegue documentada por el autor: en CUDA es necesario fijar la opción de proveedor `sdpa_kernel` a `1` y realizar una transcripción de calentamiento al cargar el modelo. Sin ese calentamiento, la primera vez que se alcanza cada longitud de salida se paga un coste de aproximadamente 150 ms.

## Capacidades

- Reconocimiento automático de voz (speech-to-text) sobre ventanas de audio de 30 segundos, con transcripción de texto plano.
- Transcripción en inglés, francés y alemán, con selección de idioma declarada en los tags del modelo.
- Forzado de idioma mediante el prompt del decoder: la secuencia `<|startoftranscript|><|de|><|transcribe|><|notimestamps|>` fija alemán, transcripción y ausencia de marcas de tiempo.
- Inferencia en GPU (fp16/CUDA) y en CPU (int8), con transcripciones idénticas entre ambas según el autor.
- Integración como componente dentro de aplicaciones basadas en onnxruntime-genai, incluido el caso de uso real de Nexaflow, que lo emplea para transcribir cada turno hablado terminado.
- No se documentan en la información disponible capacidades de traducción de voz, diarización de hablantes, marcas de tiempo, tool calling, razonamiento multi-paso ni procesamiento de vídeo.

## Casos de uso

- Transcripción de turnos de voz en asistentes conversacionales: Nexaflow usa esta conversión para transcribir cada intervención hablada en cuanto termina. La ventana de 30 s del encoder encaja con turnos de conversación típicos y la latencia de 17-23 ms en GPU permite cerrar el turno sin pausas perceptibles.
- Subtitulado y transcriptura de audio corto en GPU: con 23 ms para 3 s de audio y 52-59 ms para 8 s en una RTX PRO 6000, el modelo procesa audio a un factor aproximado de 130x-145x respecto al tiempo real (estimación derivada de las latencias publicadas), lo que permite procesar lotes grandes de fragmentos de hasta 30 s en muy poco tiempo.
- Despliegue en servidores sin GPU: la variante int8 de la carpeta `cpu/` ocupa 1,5 GB y transcribe cada intervención en torno a 1,5 s, suficiente para aplicaciones de dictado, notas de voz o transcripción asíncrona donde la latencia no es crítica.
- Procesamiento local con requisitos de privacidad: al ejecutarse íntegramente en onnxruntime-genai sobre infraestructura propia, es adecuado para transcribir audio sensible (sanitario, legal, financiero) sin enviar datos a servicios en la nube.
- Análisis de llamadas de atención al cliente en tres idiomas: el soporte declarado de inglés, francés y alemán permite transcribir conversaciones telefónicas y alimentar después sistemas de análisis de calidad o de detección de motivos de contacto.
- Integración en aplicaciones .NET o C++ mediante ONNX Runtime GenAI: el formato y la versión de la librería están fijados, de modo que un equipo puede incorporar el modelo como dependencia reproducible en un pipeline de escritorio o servidor.
- Generación de actas y resúmenes a partir de reuniones: el modelo produce la transcripción por fragmentos de 30 s que después se encadenan y se envían a un modelo de lenguaje para resumir, un patrón habitual en herramientas de notas de reunión multilingües.
- Dictado por voz en herramientas de productividad: con 17 ms para una emisión de una sola palabra en GPU, la latencia es compatible con interfaces de dictado que transcriben frase a frase conforme el usuario las termina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error de palabra (WER), comparaciones con otros modelos ni evaluaciones sobre conjuntos de test estándar. Los únicos datos de rendimiento publicados son medidas de latencia y consumo de memoria, recogidas en la sección de requisitos de hardware.

## Requisitos de hardware

- VRAM estimada (CUDA, fp16): 3,3 GB medidos en una RTX PRO 6000 con el modelo cargado en caliente.
- Almacenamiento: 1,6 GB para la variante `cuda/` y 1,5 GB para la variante `cpu/`; 3,4 GB el repositorio completo.
- GPU probada por el autor: NVIDIA RTX PRO 6000. El modelo cabe con holgura en GPU de consumo con 4 GB o más de VRAM, aunque no se documentan pruebas en modelos concretos de consumo.
- Latencia medida en RTX PRO 6000 (en caliente): 17 ms para una emisión de una palabra, 23 ms para 3 s de audio, 52-59 ms para 8 s de audio.
- Latencia en CPU: aproximadamente 1,5 s por intervención, con la variante int8.
- Throughput: no se publican medidas de throughput (por ejemplo, transcripciones por segundo en lote). La latencia por fragmento permite estimar un factor de tiempo real de aproximadamente 130x-145x en la GPU probada.
- Opciones de despliegue: onnxruntime-genai 0.17.1, con el execution provider de CUDA para la carpeta `cuda/` y el de CPU para la carpeta `cpu/`. Requiere fijar `config.SetProviderOption("cuda", "sdpa_kernel", "1")` y ejecutar una transcripción de calentamiento al cargar el modelo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Consideración de memoria: en CUDA, el coste de la primera inferencia para cada longitud de salida es de unos 150 ms si no se ha hecho el calentamiento previo.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento de modelos alternativos, por lo que la comparación se limita a los aspectos verificables. Las celdas sin dato constan como "no disponible".

| Modelo | Parámetros | Ventana de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smile-forge/whisper-large-v3-turbo-onnx-genai | no disponible | 30 s | ONNX fp16 e int8, para onnxruntime-genai 0.17.1 | MIT | HuggingFace; 0 descargas y 0 likes en el momento de redactar la ficha |
| openai/whisper-large-v3-turbo (modelo base) | no disponible | 30 s | no disponible en la información (pesos originales del modelo base) | MIT | HuggingFace |
| openai/whisper-large-v3 | no disponible | no disponible en la información | no disponible | MIT | HuggingFace |
| Otras exportaciones ONNX de Whisper para onnxruntime-genai | no disponible | no disponible | ONNX | no disponible | no disponible |

No se dispone de comparaciones de WER, latencia ni consumo de memoria frente a otras conversiones o frente al modelo original en PyTorch, más allá de la afirmación del autor de que las variantes fp16 e int8 producen transcripciones idénticas entre sí.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés, francés y alemán. No se documenta soporte para el resto de idiomas que el modelo base de OpenAI pudiera cubrir.
- Detección automática de idioma poco fiable en respuestas cortas: el autor advierte de que, sin forzar el idioma, respuestas breves en alemán se transcriben mal (por ejemplo, "Nein." se reconoce como "9."). Es obligatorio fijar el idioma en el prompt del decoder cuando se conoce.
- Ventana de audio limitada: el encoder lee ventanas de 30 s, por lo que el audio más largo debe trocearse. No se documenta cómo afecta el troceado a la coherencia entre fragmentos ni si existe solapamiento recomendado.
- Sin métricas de calidad publicadas: no hay WER, ni tasas de alucinación, ni evaluaciones comparativas. No es posible estimar la precisión esperada en producción a partir de la información disponible.
- Requisitos de configuración específicos: en CUDA es necesario fijar `sdpa_kernel` a `1` y hacer un calentamiento; omitirlo introduce penalizaciones de unos 150 ms la primera vez que se alcanza cada longitud de salida.
- Dependencia de versión: los artefactos están atados a onnxruntime-genai 0.17.1 y requieren un builder parcheado para ser reproducidos. Los scripts de compilación proporcionados (`Build-WhisperTurbo.ps1`) son de PowerShell, lo que apunta a un flujo de trabajo en Windows.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (12 de octubre de 2026). No hay evidencia externa de uso en producción más allá del proyecto Nexaflow del propio autor.
- Licencia: MIT, con Copyright (c) 2022 OpenAI. La licencia permite uso comercial, pero al ser una conversión de un modelo de terceros conviene revisar las condiciones del modelo base antes de redistribuir.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible; los sesgos del modelo base se heredan sin cambios, ya que el export modifica el formato, no los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smile-forge/whisper-large-v3-turbo-onnx-genai
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de onnxruntime-genai: https://github.com/microsoft/onnxruntime-genai
- Proyecto Nexaflow, consumidor del modelo: https://github.com/smile-forge/nexaflow
- Scripts de construcción incluidos en el repositorio: `patch_builder.py` y `Build-WhisperTurbo.ps1`
- Nota: los resultados de búsqueda web disponibles no aportan documentación técnica adicional sobre este modelo; las referencias encontradas no guardan relación con él.
