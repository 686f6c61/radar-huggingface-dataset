# mlx-community/Nemotron-3-Diarization-8bit

## Resumen

Nemotron 3 Diarization 8bit es una conversión al framework MLX del modelo nvidia/Nemotron-3-Diarization, publicada por la organización comunitaria mlx-community. Se trata de un modelo de diarización de hablantes (speaker diarization) y detección de actividad de voz que predice hasta ocho hablantes simultáneos con una resolución temporal de 10 ms a partir de audio mono de 16 kHz. El repositorio ocupa 0,1 GB y contiene 99.263.843 parámetros almacenados en 8 bits, lo que lo sitúa en la categoría de modelos pequeños y desplegables en hardware de consumo.

La relevancia de esta ficha concreta, frente al modelo original de NVIDIA, es la integración con mlx-audio, que permite ejecutar inferencia y streaming sobre Apple Silicon (GPU unificada de la familia M) sin depender de CUDA. La API expone generación por fichero, generación incremental en streaming y alimentación de PCM en vivo, con mantenimiento de las identidades de hablante entre fragmentos mediante un mecanismo AOSC y una cola FIFO.

Se trata de un modelo puramente acústico: no genera texto ni mantiene conversaciones, sino que segmenta audio en intervalos etiquetados con identificadores de hablante genéricos asignados por orden de llegada. No identifica personas ni infiere su identidad, y no se documentan en la información disponible los idiomas soportados, los datos de entrenamiento ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (según las etiquetas del repositorio); no se detallan capas ni cabezas de atención |
| Parámetros totales | 99.263.843 (99,3 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; modelo de audio en streaming, sin ventana de texto definida |
| Tipos de cuantización | 8 bits (esta conversión); el repositorio no lista otras variantes |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (formato MLX) |
| Número máximo de hablantes | 8 |
| Resolución temporal | 10 ms |
| Entrada de audio | PCM mono a 16 kHz |
| Librería | mlx-audio |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | nvidia/Nemotron-3-Diarization |
| Pipeline (HuggingFace) | voice-activity-detection |

## Arquitectura y entrenamiento

El repositorio etiqueta el modelo como streaming-sortformer, lo que sitúa la arquitectura en la familia Sortformer de diarización extremo a extremo basada en transformer, orientada a operar de forma incremental sobre flujo de audio continuo. La conversión mantiene el grafo del modelo original de NVIDIA y únicamente cambia el formato y la precisión de los pesos (8 bits) para su ejecución con mlx-audio. No se dispone de información sobre el número de capas, dimensión del modelo, número de cabezas ni mecanismo de atención concreto en la documentación proporcionada.

En cuanto al entrenamiento, la model card de esta conversión no incluye ningún dato: ni volumen de horas de audio, ni composición del dataset, ni si hubo ajuste con RLHF, DPO u otras técnicas de alineación. La propia ficha remite expresamente a la model card del modelo original (nvidia/Nemotron-3-Diarization) para consultar los datos de entrenamiento, la evaluación y la licencia. La innovación técnica documentada en esta conversión es la gestión del estado en streaming: los resultados incrementales conservan las identidades de hablante a través del mecanismo AOSC y una cola FIFO, y las marcas de tiempo son absolutas respecto a la grabación completa, no relativas al fragmento procesado.

## Capacidades

- Diarización de hablantes con hasta 8 hablantes activos de forma simultánea sobre audio mono de 16 kHz.
- Resolución temporal de 10 ms en la delimitación de turnos de habla.
- Detección de actividad de voz integrada (etiqueta de pipeline voice-activity-detection).
- Procesamiento de solapamiento: varios hablantes pueden estar activos al mismo tiempo en el mismo intervalo.
- Inferencia por fichero completo mediante `generate`, que devuelve un resultado con segmentos delimitados por inicio, fin y hablante.
- Inferencia en streaming mediante `generate_stream`, con resultados incrementales que mantienen las identidades de hablante.
- Entrada de PCM en vivo mediante `feed(chunk, state)` con un estado creado por `init_streaming_state()`, pensado para captura de micrófono en tiempo real.
- Cierre explícito del flujo con `model.feed([], state, final=True)` para vaciar el fragmento parcial y el lookahead pendientes.
- Etiquetado genérico por orden de llegada: el modelo no identifica personas, solo asigna identificadores de turno.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingües: no documentadas; el modelo opera sobre señal acústica, no sobre texto.

## Casos de uso

- Actas y resúmenes de reuniones: el modelo genera una pista de diarización con marcas de tiempo absolutas que se puede alinear con la salida de un sistema de reconocimiento de voz para producir transcripciones con atribución de turno por hablante, incluso cuando varias personas hablan a la vez.
- Subtitulado en directo con etiquetas de hablante: usando `init_streaming_state()` y `feed()` sobre fragmentos de 16 kHz, se puede emitir cada turno con su identificador en cuanto se detecta, sin esperar al final de la emisión.
- Analítica de contact center: procesar grabaciones de llamadas para medir tiempos de habla de agente y cliente, detectar interrupciones y solapamientos, y calcular métricas de turno de palabra sobre el identificador de hablante.
- Investigación cualitativa y ciencias sociales: segmentar entrevistas y grupos focales para obtener una línea temporal de turnos que acelere la codificación manual, con la ventaja de que el audio puede permanecer en el equipo del investigador.
- Indexación y búsqueda de archivos de audio: enriquecer un archivo de podcasts, clases o sesiones judiciales con metadatos de hablante y marcas temporales de 10 ms que permitan navegar por turnos concretos.
- Activación de asistentes de voz en el dispositivo: el modelo actúa como detector de actividad de voz con identidad de hablante, útil para decidir cuándo empezar a grabar o procesar y para separar voces cuando hay varias personas en la misma sala.
- Auditoría y cumplimiento: verificar que en una grabación se respetan los turnos de palabra declarados o que un determinado interviniente habló durante un intervalo concreto, con marcas de tiempo trazables.
- Procesamiento local con requisitos de privacidad: al ejecutarse sobre Apple Silicon con MLX, la diarización puede realizarse íntegramente en el portátil del usuario sin enviar audio a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas de tasa de error de diarización (DER), precisión de detección de voz ni comparaciones con otros sistemas; remite explícitamente a la model card de nvidia/Nemotron-3-Diarization para consultar la evaluación del modelo original.

## Requisitos de hardware

- Peso de los pesos en memoria: aproximadamente 0,1 GB con cuantización de 8 bits (99,3 M de parámetros), según el tamaño del repositorio.
- Plataforma objetivo: MLX, es decir, Apple Silicon (familias M1, M2, M3, M4) con memoria unificada. Cabe en cualquier Mac de gama de entrada, incluso con 8 GB de memoria unificada.
- GPU CUDA (A100, H100, RTX 4090 y similares): no soportadas por esta conversión, que depende de MLX y no de PyTorch/CUDA. Para ese hardware habría que usar el modelo original de NVIDIA.
- Inferencia en CPU: no documentada en la información disponible; MLX está optimizado para la GPU de Apple Silicon.
- Opciones de despliegue: biblioteca mlx-audio mediante `load(...)`, con las funciones `generate`, `generate_stream`, `init_streaming_state` y `feed`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de diarización de este tipo.
- Latencia y throughput: no disponibles. Cualquier despliegue en streaming debe tener en cuenta el lookahead interno que se vacía con `final=True`, cuyo tamaño no se especifica en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Máx. hablantes | Streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/Nemotron-3-Diarization-8bit | 99,3 M (8 bits) | 8 | Sí (API mlx-audio) | openmdw-1.1 | MLX / Apple Silicon |
| nvidia/Nemotron-3-Diarization | Mismos que este modelo (versión origen sin cuantizar) | 8 (según esta conversión) | No disponible en la información proporcionada | openmdw-1.1 | PyTorch / CUDA |
| pyannote/segmentation-3.0 | No disponible | No disponible | No disponible | No disponible | No disponible |
| NVIDIA diar_sortformer_4spk-v1 | No disponible | No disponible | No disponible | No disponible | No disponible |

Los datos de los dos últimos modelos no forman parte de la información proporcionada, por lo que no se pueden comparar cifras de parámetros, contexto ni rendimiento sin recurrir a sus fichas oficiales. La comparación cualitativa relevante es que esta conversión es la única del conjunto con ejecución nativa en Apple Silicon y con API de streaming documentada en la propia model card.

## Limitaciones y advertencias

- Los identificadores de hablante son genéricos y se asignan por orden de llegada; el modelo no identifica personas ni mantiene esa identidad entre grabaciones distintas.
- El límite declarado es de 8 hablantes; no se documenta el comportamiento con más participantes simultáneos.
- El solapamiento de voces está soportado, pero no se publican métricas de precisión en esos intervalos.
- La resolución de 10 ms implica que turnos muy cortos pueden fusionarse o perderse; no se documenta el umbral mínimo de duración fiable.
- Robustez frente a ruido, reverberación, códecs de compresión o audio telefónico: no documentada.
- Idiomas soportados: no disponibles. Al tratarse de un modelo acústico el efecto del idioma es indirecto, pero no hay datos que permitan afirmar un rendimiento homogéneo entre lenguas.
- Errores típicos esperables son fallos de segmentación y confusión de etiquetas de hablante, no alucinación textual, ya que el modelo no genera lenguaje.
- Licencia openmdw-1.1: es necesario revisar el texto completo de la licencia antes de un uso comercial o de redistribuir los pesos; en la información disponible no se detallan condiciones adicionales.
- Dependencia tecnológica: el modelo solo es utilizable a través de MLX y mlx-audio, lo que excluye despliegues en infraestructura Linux con GPU NVIDIA sin recurrir al modelo original.
- El repositorio presenta 0 descargas y 0 me gusta en el momento de la consulta, y fue creado y actualizado el mismo día (23 de septiembre de 2026), por lo que se trata de una conversión reciente sin validación comunitaria publicada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mlx-community/Nemotron-3-Diarization-8bit
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Biblioteca mlx-audio: https://github.com/Blaizzy/mlx-audio

No se han encontrado en la información proporcionada artículos, blogs, demos ni repositorios adicionales asociados a esta conversión; la propia model card remite a la ficha del modelo original para cualquier detalle sobre entrenamiento y evaluación.
