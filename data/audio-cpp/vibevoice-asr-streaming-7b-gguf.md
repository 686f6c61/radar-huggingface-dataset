# audio-cpp/VibeVoice-ASR-Streaming-7B-GGUF

## Resumen

VibeVoice-ASR-Streaming-7B-GGUF es un repositorio de pesos cuantizados en formato GGUF creado por el usuario audio-cpp a partir del modelo `microsoft/VibeVoice-ASR-Streaming-7B`. No se trata de un modelo entrenado desde cero, sino de una conversión nativa para audio.cpp de un modelo de reconocimiento automático del habla (ASR) de 7.000 millones de parámetros desarrollado por Microsoft. El repositorio incluye tres paquetes de precisión distinta (BF16, Q8_0 y Q4_K) y una especificación de paquete embebida que permite cargarlo directamente con el gestor de modelos, el binario de línea de comandos y el servidor HTTP de audio.cpp.

La propuesta de valor principal es la transcripción en modo streaming con atribución de hablante: el modelo está etiquetado como `speaker-attributed-transcription` y el servidor expone un endpoint en vivo (`/v1/audio/transcriptions/live`) que acepta PCM mono de 16 kHz en formato s16le por chunks, lo que permite transcribir audio en tiempo real en lugar de esperar a disponer del fichero completo. Adicionalmente admite ejecución offline sobre ficheros WAV con salida a texto y métricas de rendimiento.

El modelo cubre diez idiomas (inglés, chino, español, portugués, alemán, japonés, coreano, francés, ruso e italiano) y se distribuye bajo licencia MIT, lo que habilita el uso comercial sin restricciones de tipo non-commercial. El repositorio no documenta detalles de arquitectura, datos de entrenamiento ni resultados de benchmarks, por lo que la evaluación técnica debe remitirse a la model card del modelo base de Microsoft y a pruebas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card del repositorio no documenta la arquitectura del modelo base) |
| Parámetros totales | 7B (según la denominación del modelo base `VibeVoice-ASR-Streaming-7B`) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0 y Q4_K (tres ficheros GGUF independientes) |
| Idiomas soportados | en, zh, es, pt, de, ja, ko, fr, ru, it |
| Licencia | MIT |
| Formato de pesos | GGUF (cada fichero es autocontenido e incluye la especificación de paquete de audio.cpp y los sidecars necesarios) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna en la documentación disponible. La model card del repositorio de conversión únicamente indica que los ficheros GGUF derivan del modelo `microsoft/VibeVoice-ASR-Streaming-7B`, fijado a la revisión `60d858b518b4e19d404af3737f848fc185b30177`, y que la conversión preserva la licencia MIT del modelo original. No se detalla si se trata de un transformer denso, una arquitectura híbrida, ni si incorpora componentes específicos de audio como tokenizadores acústicos o codificadores separados.

Tampoco hay datos sobre el volumen de tokens de audio utilizados en el entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación técnica que sí queda documentada es de índole de despliegue: el empaquetado GGUF nativo para audio.cpp con tres niveles de precisión y soporte de inferencia en streaming sobre PCM de 16 kHz mono, lo que permite alimentar audio por chunks en lugar de requerir el fichero completo. Para conocer los detalles de entrenamiento, hay que consultar la model card y el repositorio de Microsoft VibeVoice referenciados en el apartado de enlaces.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre ficheros de audio, con salida a texto y métricas opcionales (`--text-out`, `--metrics`).
- Transcripción en streaming: el servidor acepta PCM mono de 16 kHz en formato s16le por HTTP con `Transfer-Encoding: chunked` a través del endpoint `/v1/audio/transcriptions/live`.
- Transcripción con atribución de hablante (`speaker-attributed-transcription`), según las etiquetas declaradas por el autor del repositorio.
- Soporte multilingüe para diez idiomas: inglés, chino, español, portugués, alemán, japonés, coreano, francés, ruso e italiano.
- Despliegue en dos modos: ejecución offline mediante `audiocpp_cli` y ejecución como servicio persistente con `audiocpp_server`.
- Selección de backend y recursos: el CLI y el servidor aceptan `--backend cuda`, `--threads 8` y configuración por JSON.
- Tool calling, function calling, capacidades de agente, visión, audio generativo o modo de razonamiento: no disponible (no se documentan en la información proporcionada).

## Casos de uso

- Transcripción de reuniones con múltiples participantes: la capacidad de atribución de hablante permite generar actas donde cada intervención queda etiquetada, y el modo streaming posibilita subtítulos casi en directo durante la reunión.
- Subtitulado en directo para emisiones o webinars: enviando PCM de 16 kHz mono al endpoint `/v1/audio/transcriptions/live`, el modelo devuelve texto conforme llega el audio, adecuado para pipelines de subtitulado de baja latencia.
- Postproducción de audio y vídeo: el modo offline con `--task asr` permite transcribir ficheros WAV completos y volcar el resultado a un `.txt` para generar subtítulos, guiones o índices de búsqueda sobre el material grabado.
- Atención al cliente en centros de contacto: la transcripción de llamadas grabadas facilita el análisis de calidad, la detección de motivos de contacto y el cumplimiento normativo, con la ventaja de que la licencia MIT permite uso comercial en producción.
- Generación de actas y documentación interna en entornos corporativos multilingües: al cubrir diez idiomas, un mismo despliegue puede procesar reuniones en inglés, español, alemán o japonés sin cambiar de modelo.
- Investigación en procesamiento del habla: los tres niveles de cuantización (BF16, Q8_0, Q4_K) permiten estudiar la degradación de precisión frente al coste computacional en tareas de ASR.
- Servicios de transcripción autoalojados: el servidor de audio.cpp con backend CUDA permite montar un endpoint interno de transcripción sin depender de API externas, útil cuando existen requisitos de soberanía o confidencialidad del dato.
- Indexación y búsqueda de archivos audiovisuales: transcribir una videoteca permite construir un índice de texto completo sobre el contenido hablado y habilitar búsquedas por palabra clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de conversión no incluye métricas de WER, MMLU, HumanEval, GSM8K ni ninguna otra evaluación, y los resultados de la búsqueda web no aportan datos técnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aproximado a partir del número de parámetros y del formato de los ficheros; no confirmado por el autor): entorno de 14-16 GB para el paquete BF16, 8-9 GB para Q8_0 y 4,5-5,5 GB para Q4_K, más la memoria adicional del codificador de audio y los búferes de streaming.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) con margen amplio.
- GPU recomendadas para Q8_0: RTX 4090, RTX 4080, RTX 3090, A10G o L4.
- GPU para Q4_K: tarjetas consumer de gama media-alta con 8 GB o más de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 3070.
- Ejecución en CPU: viable en teoría con Q4_K mediante el backend de audio.cpp, aunque el rendimiento en streaming en tiempo real no está documentado y dependerá del número de hilos (`--threads`).
- Opciones de despliegue: audio.cpp (`audiocpp_cli` para offline y `audiocpp_server` para servicio HTTP), con gestión de paquetes mediante `tools/model_manager_v2.py install vibevoice_asr_streaming_7b_q8_0`. El paquete Q8_0 es el recomendado por el autor para audio.cpp.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia, RTF (real-time factor) ni throughput de tokens o segmentos por segundo.

## Comparativa con modelos similares

La comparación se limita a características estructurales, ya que no existen benchmarks publicados para este modelo y las cifras de rendimiento de las alternativas corresponden a sus propias evaluaciones, no a una comparación homogénea.

| Modelo | Desarrollador | Parámetros | Idiomas | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| VibeVoice-ASR-Streaming-7B-GGUF | audio-cpp (conversión de microsoft/VibeVoice-ASR-Streaming-7B) | 7B | 10 (en, zh, es, pt, de, ja, ko, fr, ru, it) | MIT | GGUF (BF16, Q8_0, Q4_K) |
| Whisper large-v3 | OpenAI | ~1,55B | ~99 idiomas | MIT | safetensors y conversiones GGUF de terceros |
| Canary-1B | NVIDIA | 1B | en, es, de, fr | CC-BY-NC-4.0 | safetensors (.nemo) |

El principal diferencial de VibeVoice-ASR-Streaming-7B frente a Whisper large-v3 es el mayor número de parámetros y el soporte nativo de streaming con atribución de hablante en el stack de audio.cpp; en contrapartida, Whisper large-v3 ofrece cobertura de idiomas mucho más amplia y un ecosistema de despliegue más maduro. Frente a Canary-1B, la ventaja es la licencia MIT, que permite uso comercial, mientras que Canary-1B se distribuye bajo una licencia no comercial. No es posible comparar calidad de transcripción (WER) porque el repositorio no publica evaluaciones.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de WER ni comparaciones con otros sistemas ASR, por lo que la calidad real de transcripción es desconocida y debe validarse con datos propios antes de usarla en producción.
- Documentación incompleta: la model card del repositorio de conversión no describe arquitectura, datos de entrenamiento, contexto soportado ni límites operativos del modelo base.
- Riesgo de alucinación en ASR: los modelos de reconocimiento del habla tienden a generar texto plausible en tramos de silencio, ruido o audio musical, y a repetir fragmentos en condiciones acústicas adversas. No se documentan mecanismos de mitigación específicos.
- Sesgos: se desconoce la composición del dataset de entrenamiento, por lo que no se puede caracterizar el sesgo por acento, variedad dialectal, edad, género o condición social. La lista de idiomas no implica cobertura uniforme ni equitativa entre ellos.
- Idioma y contexto: aunque se declaran diez idiomas, no se especifica el rendimiento por idioma ni si existe soporte de cambio de código (code-switching). La longitud de contexto de audio procesable por ventana es no disponible.
- Responsabilidad de uso: la propia model card remite a la documentación original de Microsoft VibeVoice y a sus directrices de uso responsable, que no se reproducen en este repositorio y conviene revisar antes de un despliegue público.
- Licencia: MIT, lo que permite uso comercial y modificación. Aun así, al ser una conversión de un modelo de terceros, conviene verificar que la licencia del modelo base sigue siendo MIT en la revisión fijada (`60d858b518b4e19d404af3737f848fc185b30177`).
- Madurez del repositorio: registra 0 descargas y 0 likes, y las fechas de creación y actualización indicadas son del 9 de septiembre de 2026. Es un artefacto sin validación comunitaria ni historial de uso en producción.
- Dependencia de herramienta: los GGUF están empaquetados de forma nativa para audio.cpp, con especificación de paquete y sidecars embebidos. Su portabilidad a otros runners GGUF (llama.cpp, Ollama, vLLM) no está garantizada ni documentada.
- Rendimiento en streaming: no se publican mediciones de latencia ni de factor de tiempo real, por lo que no se puede garantizar que el modo live funcione en tiempo real con hardware modesto.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/audio-cpp/VibeVoice-ASR-Streaming-7B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-7B
- Revisión fijada del modelo base: `60d858b518b4e19d404af3737f848fc185b30177`
- La model card menciona el repositorio de Microsoft VibeVoice como fuente de documentación, uso y directrices de uso responsable, pero no proporciona su URL en el texto disponible
- No se han encontrado enlaces técnicos relevantes (papers, blogs, repos ni demos) en los resultados de la búsqueda web realizada; los resultados obtenidos corresponden a plataformas comerciales de audio y música sin relación con el modelo
