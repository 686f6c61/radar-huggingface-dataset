# nvidia/Nemotron-3-Diarization

## Resumen

Nemotron 3 Diarization es un modelo de diarización de hablantes ("quién habla y cuándo") desarrollado por NVIDIA y publicado con pesos abiertos en HuggingFace. A diferencia de un modelo de lenguaje, se trata de un clasificador de tramas de audio: recibe señal acústica y produce etiquetas de hablante por trama, con una resolución de salida configurable en múltiplos de 10 ms. Está construido siguiendo el linaje Sortformer y soporta hasta ocho hablantes simultáneos.

Su principal valor técnico es que un único checkpoint sirve tanto para inferencia en streaming como offline. En streaming emplea la Arrival-Order Speaker Cache (AOSC) y una cola FIFO, mecanismos tomados de Streaming Sortformer, que preservan la identidad de cada hablante a lo largo de la conversación y evitan el problema de permutación de canales ordenando las salidas según la primera aparición de cada voz. La latencia del buffer de entrada puede bajar hasta 80 ms, con una configuración mínima recomendada de 0,32 s.

El modelo tiene 99.226.504 parámetros (unos 99,2 M) y un repositorio de 1,0 GB. Se distribuye a través de la librería NeMo, con licencia openmdw-1.1 y declaración explícita de aptitud para uso comercial y no comercial. Es relevante ahora porque cubre un hueco práctico: diarización de calidad con latencia controlable y sin límite de duración en modo chunked, algo crítico para transcripción de reuniones, análisis de contact center y pipelines de ASR en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer (clasificación de tramas de audio orientada a hablante); en streaming usa Arrival-Order Speaker Cache (AOSC) y cola FIFO |
| Parametros totales | 99.226.504 (aproximadamente 99,2 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica como ventana de texto. Buffer de entrada de 30,4 s en configuración offline y desde 80 ms en streaming; sin límite de duración total con inferencia por chunks |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo acústico independiente del idioma en la información proporcionada) |
| Licencia | openmdw-1.1 (uso comercial y no comercial) |
| Formato de pesos | safetensors; también checkpoint .nemo para NeMo |
| Hablantes maximos | 8 |
| Resolucion de salida | Configurable en múltiplos de 10 ms |
| Libreria | nemo (NVIDIA NeMo Speech) |
| Tamano del repositorio | 1,0 GB |
| Fecha de publicacion | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura sigue el enfoque Sortformer citado en la model card: el modelo resuelve la permutación de hablantes ordenando sus canales de salida según la primera llegada de cada hablante en el audio de entrada. Para el modo streaming incorpora dos componentes descritos en Streaming Sortformer: la Arrival-Order Speaker Cache (AOSC), que retiene información de hablantes de chunks anteriores para mantener la identidad a lo largo del tiempo, y una cola FIFO que aporta contexto de tramas recientes en cada paso de procesamiento. La configuración de streaming se controla con cinco parámetros medidos en tramas de 80 ms: `SPKCACHE_LEN`, `FIFO_LEN`, `CHUNK_LEN`, `RIGHT_CONTEXT` y `UPDATE_PERIOD`.

Las configuraciones recomendadas que documenta el autor son las siguientes (latencia de buffer de entrada):

| Configuracion | Latencia | SPKCACHE_LEN | FIFO_LEN | CHUNK_LEN | RIGHT_CONTEXT | UPDATE_PERIOD |
|---|---|---|---|---|---|---|
| Latencia muy alta (offline) | 30,4 s | 264 | 40 | 340 | 40 | 300 |
| Baja latencia | 1,04 s | 264 | 264 | 9 | 4 | 222 |
| Latencia muy baja | no disponible en la informacion proporcionada (fila truncada en la model card consultada) | - | - | - | - | - |

No se dispone de información sobre el número de horas de audio de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con datos anotados manualmente. La model card menciona varios artículos de referencia (ver sección de enlaces) sin detallar recetas de entrenamiento.

## Capacidades

- Diarización de hablantes ("who spoke when") en audio real, con soporte de hasta 8 hablantes.
- Inferencia en streaming y offline con el mismo checkpoint.
- Latencia de buffer de entrada configurable: desde 80 ms en el extremo más agresivo, con 0,32 s como mínimo recomendado, hasta 30,4 s en configuración tipo offline.
- Duración de audio ilimitada mediante inferencia por chunks.
- Resolución temporal de salida configurable en múltiplos de 10 ms.
- Etiquetado de hablante (speaker tagging) y clasificación de tramas de audio (audio-frame-classification).
- Integración con detección de actividad de voz (voice-activity-detection) como pipeline asociado.
- Entrada flexible: ruta a fichero WAV, lista de rutas, arrays de NumPy (con `sample_rate` obligatorio) o manifiesto JSONL con `audio_filepath`, `offset` y `duration`.
- Inferencia por lotes (`batch_size`) sobre múltiples audios.
- No se documentan capacidades de generación de texto, tool calling, agentes ni visión: es un modelo puramente acústico de clasificación.

## Casos de uso

- Transcripción de reuniones con etiquetado de interlocutor: el modelo separa las voces de hasta 8 participantes y permite que el ASR genere transcripciones atribuidas por hablante, usando la configuración offline de 30,4 s para maximizar la calidad en audio ya grabado.
- Análisis de llamadas de contact center: se puede ejecutar en streaming con la configuración de baja latencia (1,04 s) para medir tiempos de habla de agente y cliente, detectar solapamientos e interrupciones y alimentar métricas operativas.
- Subtitulado y accesibilidad en directo: la latencia mínima de 80 ms y los chunks sin límite de duración permiten generar subtítulos con identificación de hablante en emisiones largas, algo inviable con modelos que exigen audio completo.
- Generación de datasets de ASR etiquetados: el modelo actúa como anotador automático de hablante para corpus de audio, produciendo segmentos con marcas temporales que después se usan para entrenar o evaluar sistemas ASR.
- Cumplimiento y análisis forense de grabaciones: la diarización permite reconstruir quién dijo qué en grabaciones largas de audio, con marcas temporales de resolución configurable en múltiplos de 10 ms.
- Asistentes de voz multiinterlocutor en tiempo real: en un dispositivo o servicio con micrófono siempre activo, el modo streaming mantiene la identidad del hablante entre turnos gracias a la AOSC, evitando que el sistema confunda a un usuario con otro.
- Moderación y monitorización de audio en directo: la detección de actividad de voz combinada con diarización permite segmentar y priorizar audio relevante en cabinas de broadcast o soporte en vivo.
- Investigación en conversación y lingüística: análisis de turnos de palabra, solapamiento y dinámica de grupos de hasta 8 personas sobre audio de campo, con salida por tramas directamente procesable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 99,2 M de parámetros; el autor no publica cifras oficiales):
  - FP32: aproximadamente 0,40 GB solo de pesos.
  - FP16/BF16: aproximadamente 0,20 GB solo de pesos.
  - INT8: aproximadamente 0,10 GB solo de pesos.
  - En la práctica, el proceso completo de NeMo con buffers de audio y estado de streaming se mantiene holgadamente por debajo de 1-2 GB, aunque la cifra exacta no está publicada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA. Al tratarse de un modelo de ~99 M de parámetros, no requiere GPU de centro de datos; las tarjetas de gama alta (A100, H100) solo aportan ventaja en escenarios de muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, series RTX 3060, RTX 4060, RTX 4090) e incluso en aceleradores de borde con CUDA.
- Opciones de despliegue documentadas: NVIDIA NeMo Speech (`nemo-toolkit[asr]`) con la clase `SortformerEncLabelModel`, tanto en Python como en scripts de inferencia. Se requiere Python 3.12 o superior, Cython, PyTorch reciente, `libsndfile1` y `ffmpeg`.
- Otras opciones (vLLM, llama.cpp, Ollama, TGI): no disponibles/no aplicables, ya que es un modelo acústico de clasificación y no un modelo generativo de texto.
- Latencia: la model card define la latencia por la configuración del buffer de entrada (30,4 s offline, 1,04 s baja latencia, hasta 80 ms en el extremo más bajo). El throughput en tiempo real (factor RTF) no está publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Hablantes maximos | Streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Diarization (NVIDIA) | 99,2 M | 8 | Si (mismo checkpoint que offline) | openmdw-1.1 | HuggingFace, libreria NeMo |
| Sortformer / Streaming Sortformer (antecedentes metodologicos citados en la model card) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| Modelos de diarizacion de terceros (por ejemplo, herramientas tipo pyannote) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos verificados en la información proporcionada para completar una comparativa numérica con alternativas de la misma categoría.

## Limitaciones y advertencias

- Límite duro de 8 hablantes: el modelo no está diseñado para escenas con más voces y su comportamiento por encima de ese umbral no está documentado.
- La model card no especifica idiomas soportados ni evaluación por idioma; no debe asumirse un rendimiento homogéneo entre lenguas, acentos o condiciones acústicas.
- No se publican resultados de benchmarks, por lo que la calidad real en condiciones ruidosas, con reverberación, solapamiento intenso o habla lejana es desconocida.
- Riesgo de errores de atribución: al ser un clasificador de tramas, puede asignar segmentos al hablante equivocado en transiciones rápidas de turno, con hablantes de timbre similar o en voz superpuesta. Es esperable cierto nivel de falsos positivos de actividad de hablante en audio musical o ruido.
- La resolución de salida depende de la configuración elegida: resoluciones más gruesas reducen la precisión de los límites temporales de cada turno.
- Configuraciones de latencia muy baja implican menos contexto (chunks pequeños y `RIGHT_CONTEXT` reducido), lo que puede degradar la coherencia de las etiquetas de hablante; el propio autor recomienda 0,32 s como mínimo práctico.
- Licencia openmdw-1.1: la model card afirma que el modelo es apto para uso comercial y no comercial, pero conviene revisar los términos completos de la licencia antes de integrarlo en un producto.
- Requiere el ecosistema NeMo y una versión reciente de PyTorch, lo que añade dependencias pesadas en producción; no hay soporte documentado en runtimes alternativos.
- El modelo no genera texto: cualquier funcionalidad de transcripción exige encadenar un ASR independiente.
- Cifras de VRAM y memoria son estimaciones derivadas del conteo de parámetros, no datos oficiales del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Blog de NVIDIA en HuggingFace sobre Nemotron Diarization: https://huggingface.co/blog/nvidia/nemotron-diarization
- Demo en HuggingFace Spaces (diarización con ASR en streaming): https://huggingface.co/spaces/nvidia/nemotron-diarization
- Repositorio NVIDIA NeMo Speech: https://github.com/NVIDIA-NeMo/Speech
- Articulos de referencia citados en las etiquetas del modelo: arXiv 2409.06656, arXiv 2507.18446, arXiv 2605.15442, arXiv 2507.09226, arXiv 2408.13106
- Sitio oficial de NVIDIA: https://www.nvidia.com/
