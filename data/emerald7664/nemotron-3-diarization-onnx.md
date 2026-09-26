# Emerald7664/Nemotron-3-Diarization-ONNX

## Resumen

Nemotron-3-Diarization-ONNX es una conversión al formato ONNX del modelo nvidia/Nemotron-3-Diarization, publicada por el usuario Emerald7664 en HuggingFace. El modelo original, desarrollado por NVIDIA, es un sistema de diarización de hablantes ("quién habla y cuándo") de pesos abiertos, pensado para audio del mundo real y capaz de distinguir hasta ocho hablantes simultáneos o alternos. Sigue el enfoque Sortformer, resolviendo la permutación de hablantes mediante la ordenación de los canales de salida según el orden de primera aparición de cada voz en el audio de entrada.

La arquitectura es un encoder Transformer de 31 capas con Rotary Positional Embeddings (RoPE) y aproximadamente 100 millones de parámetros, que trabaja sobre características Mel a 10 ms remuestreadas a una tasa de trama de 80 ms y una capa Conv1D que devuelve las predicciones a la resolución de 10 ms. Para inferencia en streaming incorpora la Arrival-Order Speaker Cache (AOSC) y una cola FIFO, lo que permite mantener la identidad de los hablantes a lo largo del tiempo con buffers de entrada desde 80 ms (mínimo recomendado de 0,32 s) y una configuración offline con buffer de 30,4 s.

Su relevancia actual radica en que cubre diarización en tiempo real y en diferido con un único checkpoint, sin límite de duración en audio cuando se usa inferencia por fragmentos, y con licencia OpenMDW-1.1 que permite uso comercial. El repositorio aquí descrito, sin embargo, es una conversión de terceros en ONNX (0,9 GB), sin descargas ni validación documentada, por lo que debe tratarse con cautela frente al checkpoint oficial de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 31 capas con RoPE, más capa Conv1D de sobremuestreo; mecanismo Sortformer de ordenación por llegada |
| Parametros totales | 100 M (1,0 × 10⁸) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto); sin límite de duración de audio con inferencia por fragmentos |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos ONNX; no se documentan los niveles de cuantización aplicados) |
| Idiomas soportados | no disponible en la información proporcionada; al operar sobre características acústicas Mel no depende del idioma del contenido |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | ONNX (modelo base en NeMo/PyTorch: nvidia/Nemotron-3-Diarization) |
| Tarea (pipeline) | voice-activity-detection / speaker-diarization (clasificación de trama de audio) |
| Entrada | Audio mono a 16 kHz en .wav, .flac, .opus o .mp3; características Mel de 10 ms |
| Salida | Tensor float de forma [T, 8] con probabilidad de actividad por hablante en [0, 1] |
| Resolucion de trama de salida | 10 ms por defecto, configurable en múltiplos de 10 ms (30, 80, 240 ms, etc.) |
| Numero maximo de hablantes | 8 |
| Motor de ejecucion | NeMo Framework v3.0 (modelo base); ONNX Runtime para esta conversión |
| Sistemas operativos | Linux (preferido/soportado según la model card) |
| Tamano del repositorio | 0,9 GB |
| Fecha de publicacion del modelo base | 23 de septiembre de 2026 |
| Fecha de publicacion de esta conversion | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de 31 capas con Rotary Positional Embeddings. La entrada consiste en características Mel calculadas sobre audio mono a 16 kHz con ventanas de 10 ms; esas características se submuestrean por un factor de ocho mediante apilado (feature stacking), lo que da una tasa de trama de encoder de 80 ms. Sobre el encoder se sitúa una capa Conv1D que vuelve a submuestrear hacia arriba para producir predicciones a la resolución de 10 ms de las características de entrada. La salida es un tensor [T, 8] con una probabilidad de actividad por hablante y trama.

La innovación principal es la combinación del esquema Sortformer con el mecanismo de streaming de Streaming Sortformer. Sortformer evita el problema de permutación de hablantes ordenando los canales de salida según la primera llegada de cada voz, en lugar de depender de un clustering posterior. Para streaming se añaden la Arrival-Order Speaker Cache (AOSC), que conserva información de hablantes de fragmentos anteriores para preservar identidades a lo largo del tiempo, y una cola FIFO que aporta contexto de tramas recientes en cada paso de procesamiento. Un único checkpoint admite latencias de buffer de entrada desde 80 ms (con 0,32 s como configuración mínima recomendada) y una configuración de tipo offline con buffer de 30,4 s.

La model card no detalla el número de tokens o horas de audio empleados en el entrenamiento, ni la composición del dataset, ni si se aplicaron fases de RLHF/DPO (no aplicables en un clasificador de tramas). No hay información sobre el proceso de conversión a ONNX (herramienta utilizada, precisión, validación numérica frente al checkpoint original). Estos datos figuran como no disponibles.

## Capacidades

- Diarización de hablantes con hasta 8 voces, devolviendo actividad por hablante y trama.
- Detección de actividad de voz (VAD) derivada de las probabilidades por hablante.
- Inferencia en streaming con latencia de buffer desde 80 ms y configuración recomendada mínima de 0,32 s.
- Inferencia offline con buffer de entrada de 30,4 s.
- Inferencia por fragmentos (chunked) sin límite máximo de duración del audio.
- Resolución temporal de salida configurable en múltiplos de 10 ms (10, 30, 80, 240 ms, etc.).
- Etiquetado genérico de hablantes: las probabilidades se posprocesan a etiquetas con inicio y fin, por ejemplo ["speaker1", 0.51, 12.62].
- Independencia del idioma del contenido, al operar sobre características acústicas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de clasificación de tramas de audio, no un modelo generativo de lenguaje.
- No dispone de modo "thinking", ni capacidades de visión, ni generación de texto.
- Codificación de hablantes (embeddings de identidad) no documentada en la información disponible.

## Casos de uso

- Transcripción con atribución de hablante en reuniones: encadenar el modelo con un ASR en streaming y usar las salidas [T, 8] para etiquetar cada segmento transcrito con el hablante correspondiente; la AOSC mantiene la identidad entre fragmentos a lo largo de una reunión larga.
- Subtitulado en directo de eventos y webinars: con la configuración de 0,32 s de buffer se puede producir una pista de diarización casi en tiempo real para alimentar subtítulos que distingan ponente y preguntas del público.
- Análisis de grabaciones de contact center: diarización offline (buffer de 30,4 s) de llamadas para separar agente y cliente, generar métricas de tiempo de habla, solapamiento y silencios por turno.
- Documentación clínica y actas médicas: separar las intervenciones de profesional y paciente en consultas grabadas, con resolución de 10 ms para no perder turnos cortos; útil para resúmenes automáticos posteriores.
- Búsqueda y segmentación de archivos audiovisuales: indexar podcasts, entrevistas o archivos de medios por hablante para permitir búsquedas del tipo "momentos en los que habla la persona 3" o extraer clips por voz.
- Moderación y analítica de sesiones multijugador en voz: detectar cuántos participantes hablan, cuándo y cuánto, en salas de hasta ocho personas, para métricas de participación o detección de comportamientos anómalos.
- Preprocesado para pipelines de reconocimiento de hablante: usar la diarización como segmentador previo que aísla regiones de voz por hablante antes de extraer embeddings de identidad o aplicar reconocimiento biométrico.
- Sistemas de actas automáticas en tiempo real: combinado con ASR en streaming, generar transcripciones etiquetadas en vivo para herramientas de colaboración, aprovechando que un único checkpoint cubre tanto el modo streaming como el offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base y la del repositorio ONNX no incluyen tablas de métricas (DER, JER, tasa de falsa alarma, etc.) ni comparaciones numéricas con otros sistemas de diarización. Tampoco se documenta ninguna validación de la conversión a ONNX frente al checkpoint original.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, valores aproximados): en torno a 0,4 GB en fp32, 0,2 GB en fp16 y 0,1 GB en int8 para un modelo de 100 M de parámetros. A esto hay que sumar el coste de las características Mel, los buffers de audio y la AOSC/cola FIFO, que en la práctica dejan el consumo total por debajo de 1 GB.
- GPU recomendadas por NVIDIA (compatibilidad declarada en la model card): familia Ampere (RTX 3090 Ti, 3090, 3080 Ti, 3080, 3070 Ti, 3070, 3060 Ti, 3060, 3050; RTX A6000 a A400; A100 PCIe/SXM, A30, A40, A16, A10, A2), Ada Lovelace (RTX 4090 a 4050; RTX 6000 Ada a 2000 Ada; L4, L40, L40S), Hopper (H100 PCIe/SXM/NVL, H200 SXM/NVL, GH200) y Blackwell (RTX 5090 a 5050; RTX PRO 6000 Blackwell y variantes; B200, B300, GB200, GB300).
- Cabe en GPU de consumo: sí, con cualquier GPU moderna con 2 GB o más de memoria, incluidas las series RTX 30, 40 y 50. Por el tamaño del modelo, también es viable ejecutarlo en CPU con ONNX Runtime para cargas de baja concurrencia.
- Opciones de despliegue: NeMo Framework v3.0 para el checkpoint original en PyTorch; ONNX Runtime para esta conversión. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no se trata de un modelo generativo de lenguaje.
- Latencia: el modelo base admite latencias de buffer de entrada desde 80 ms, con 0,32 s como configuración mínima recomendada y 30,4 s para el modo offline. No se dispone de datos de throughput (factor de tiempo real) ni de latencia medida de esta conversión ONNX.

## Comparativa con modelos similares

| Modelo | Parametros | Max. hablantes | Streaming | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| Nemotron-3-Diarization-ONNX (esta ficha) | 100 M | 8 | Sí (hasta 80 ms de buffer) | OpenMDW-1.1 | ONNX | no disponible |
| nvidia/Nemotron-3-Diarization (modelo base) | 100 M | 8 | Sí (hasta 80 ms de buffer) | OpenMDW-1.1 | NeMo / PyTorch | no disponible |
| NVIDIA Streaming Sortformer (referencia) | no disponible | no disponible | Sí | no disponible | no disponible | no disponible |
| pyannote speaker-diarization 3.x | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de parámetros, contexto, rendimiento ni licencia de las alternativas en la información proporcionada; los campos marcados como no disponibles deben confirmarse en las model cards oficiales de cada proyecto antes de tomar una decisión de despliegue.

## Limitaciones y advertencias

- Conversión de terceros: este repositorio no lo publica NVIDIA, sino el usuario Emerald7664, y no se documenta el proceso de conversión a ONNX ni ninguna validación numérica frente al checkpoint original. Sin garantía de equivalencia funcional.
- Repositorio sin tracción ni señales de calidad: 0 descargas y 0 likes en el momento de la consulta, y una model card que prácticamente replica la del modelo base, con la sección de uso marcada como "Coming soon".
- Límite de ocho hablantes: en audio con más voces simultáneas o alternas el modelo no puede representarlas todas y las asignaciones pueden degradarse.
- Riesgo de confusión y solapamiento: en escenarios con hablantes que se interrumpen, voces muy similares o ruido de fondo, las probabilidades por trama pueden fusionar o fragmentar hablantes. La ordenación por primera llegada es sensible a segmentos iniciales ambiguos.
- Sin datos de sesgo ni de robustez: no hay evaluación publicada por acento, idioma, edad, género, calidad de micrófono, códec o dominio acústico.
- Dependencia del idioma: el modelo no depende del idioma, pero tampoco se han publicado evaluaciones multilingües ni por tipo de contenido.
- Restricciones de licencia: la licencia es OpenMDW-1.1 y la model card del modelo base afirma que es apta para uso comercial y no comercial; conviene revisar el texto completo de OpenMDW-1.1 antes de un despliegue comercial, especialmente en lo relativo a atribución y a las condiciones sobre el modelo base.
- Requisitos de plataforma: NVIDIA orienta el modelo a GPU y Linux; la ejecución en otras plataformas o en CPU mediante ONNX Runtime no está validada en la documentación disponible.
- Uso en producción: al tratarse de un modelo de diarización y no de un sistema de identificación biométrica, las etiquetas "speakerN" son genéricas y no corresponden a identidades reales; cualquier asociación con personas concretas requiere un paso adicional de reconocimiento de hablante y debe cumplir la normativa de protección de datos aplicable.
- Recomendación: para entornos de producción, partir del checkpoint oficial nvidia/Nemotron-3-Diarization y evaluar esta conversión ONNX únicamente como alternativa tras validar el DER en un conjunto de datos propio.

## Enlaces

- Repositorio de esta conversión ONNX: https://huggingface.co/Emerald7664/Nemotron-3-Diarization-ONNX
- Modelo base oficial: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Blog de NVIDIA sobre Nemotron Diarization: https://huggingface.co/blog/nvidia/nemotron-diarization
- Demo en Hugging Face Spaces (Nemotron-Diarization con ASR en streaming): https://huggingface.co/spaces/nvidia/nemotron-diarization
- Referencias arXiv citadas en las etiquetas del repositorio: arXiv:2409.06656, arXiv:2507.18446, arXiv:2605.15442, arXiv:2507.09226, arXiv:2408.13106 (títulos no verificados en la información proporcionada)
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo y se han descartado por no aportar información técnica utilizable.
