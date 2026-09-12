# MigoXV/diar_streaming_sortformer_4spk-v2.1

## Resumen

Este repositorio contiene una conversión a `safetensors` de los pesos oficiales de `nvidia/diar_streaming_sortformer_4spk-v2.1`, un modelo de diarización de hablantes en streaming capaz de distinguir hasta cuatro hablantes simultáneos en una señal de audio. El autor es MigoXV y se trata de una conversión de formato: no hay ajuste fino ni cuantización, y el modelo mantiene los 990 tensores originales. El problema que resuelve es la segmentación y atribución de turnos de palabra en audio continuo, una tarea previa e independiente de la transcripción.

La relevancia de esta versión es práctica: el formato `safetensors` evita la deserialización pickle y permite cargar los pesos con el cargador nativo en PyTorch del proyecto `sortformer-dia`, sin necesidad de instalar NeMo. El modelo tiene 117.744.664 parámetros (unos 117,7 millones), lo que lo sitúa en la gama de modelos de audio pequeños, desplegables en CPU o en GPU de consumo.

Conviene subrayar que no es un modelo generativo de texto ni un sistema de reconocimiento automático de voz (ASR): su salida es actividad de hablante por turnos. Tampoco es un lanzamiento oficial de NVIDIA, sino una redistribución de terceros sujeta a la NVIDIA Open Model License. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Familia Streaming Sortformer de NVIDIA (modelo de diarización de hablantes); el detalle de capas y encoder no se documenta en la información disponible |
| Parámetros totales | 117.744.664 (≈117,7 M), dato extraído de `safetensors` |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de streaming; no se especifica ventana de audio ni latencia) |
| Tipos de cuantización | No incluye cuantizaciones; pesos originales sin cuantizar. La carga de referencia usa `--dtype float32` |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; la diarización de hablantes es independiente del contenido lingüístico, pero no se confirma en la documentación) |
| Licencia | NVIDIA Open Model License (`license: other`, `license_name: nvidia-open-model-license`) |
| Formato de pesos | `safetensors` (990 tensores). No incluye `.nemo` ni pesos pickle |

Otros datos del repositorio: tamaño de 0,5 GB, pipeline declarado `audio-classification`, `config.json` con los parámetros de arquitectura y streaming, y `source.json` con la versión de origen y el SHA-256 del archivo original.

## Arquitectura y entrenamiento

La model card identifica el modelo como perteneciente a la familia Streaming Sortformer de NVIDIA, orientada a diarización de hablantes en modo streaming con un máximo de cuatro hablantes. La información proporcionada no describe la arquitectura interna (tipo de encoder, mecanismo de atención, estrategia de ordenación de hablantes ni longitud de ventana), por lo que esos detalles quedan como no disponibles.

Tampoco hay datos sobre el entrenamiento: no se indica número de tokens o de horas de audio, composición del dataset, ni si hubo fases de ajuste con RLHF, DPO u otro método. Lo único verificable es que este repositorio es una conversión de formato pura: pesos idénticos a `nvidia/diar_streaming_sortformer_4spk-v2.1`, sin ajuste fino ni cuantización, con los 990 tensores originales preservados y trazabilidad mediante el hash SHA-256 del archivo de origen. El proyecto consumidor (`sortformer-dia`) mantiene kernels Triton para ejecución en CUDA; el rendimiento en NPU no está verificado.

## Capacidades

- Diarización de hablantes en streaming: identifica turnos de palabra y los atribuye a hablantes a lo largo del audio.
- Soporte de hasta cuatro hablantes simultáneos o alternos en una misma señal, según el nombre y la descripción del modelo.
- Procesamiento en tiempo real o continuo, al ser un modelo de streaming (no se especifica la latencia ni el tamaño de ventana).
- Ejecución en CPU en `float32` y en GPU con kernels Triton, según las instrucciones de uso.
- Salida de clasificación de audio (actividad de hablante), no de texto: no realiza transcripción ni reconocimiento de voz.
- Carga mediante un cargador nativo de PyTorch dentro del proyecto `sortformer-dia`; no se integra con `AutoModel` de Transformers.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento: no aplican a este tipo de modelo.
- Capacidades multilingües: no disponibles; no se declara ninguna lista de idiomas.

## Casos de uso

- Transcripción etiquetada por hablante: encadenar este modelo con un sistema ASR independiente para obtener transcripciones con prefijos de hablante (por ejemplo, "Hablante 1: ..."), útil en actas de reuniones y entrevistas periodísticas.
- Análisis de reuniones y actas automáticas: al separar turnos de hasta cuatro participantes, permite calcular tiempos de intervención, proporción de habla por persona y detección de solapamientos para herramientas de productividad.
- Analítica de centros de contacto: diarizar la pista de agente y cliente para medir tiempos de respuesta, silencios y monopolio de la palabra, sin necesidad de transcribir el contenido y con coste de cómputo bajo (117,7 M de parámetros).
- Moderación y cumplimiento normativo en grabaciones: segmentar quién habla en llamadas grabadas para auditorías, revisión de consentimientos o localización de fragmentos concretos en expedientes largos.
- Subtitulado y postproducción de pódcast y entrevistas: generar marcas de hablante para editar, mezclar o aplicar correcciones por voz en flujos de edición automática.
- Sistemas de accesibilidad: etiquetado en directo de quién habla en eventos, aulas o retransmisiones, alimentando interfaces de subtitulado que necesitan distinguir voces.
- Despliegue en dispositivo o edge: el tamaño reducido (≈471 MB en `float32`, ≈236 MB en `float16`) permite ejecutarlo en CPU en servidores modestos o en equipos sin GPU, dentro de pipelines de audio por lotes.
- Investigación en diarización: sirve como línea base reproducible en formato `safetensors` para comparar estrategias de ventana, cuantización o postprocesado sobre los mismos pesos de NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio convertido no incluye métricas (DER, JER, tasa de confusión de hablantes) ni comparaciones con otros sistemas, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Requisitos de hardware

- Pesos en `float32`: 117.744.664 parámetros × 4 bytes ≈ 471 MB (≈449 MiB) solo para los pesos.
- Pesos en `float16`: ≈236 MB (≈225 MiB), si se opta por esa precisión.
- VRAM estimada para inferencia: no disponible con cifras oficiales; por tamaño de pesos, cualquier GPU con 1-2 GB de memoria libre debería ser suficiente, más el margen para activaciones y buffers de audio.
- GPU recomendadas: no se especifican. Dado el tamaño, cabe en GPU de consumo tipo RTX 3060, RTX 4060, RTX 4090 y en GPUs de datacenter (A100, H100) sin aprovechar su capacidad; los kernels Triton del proyecto se activan en CUDA.
- Ejecución en CPU: soportada explícitamente (`poetry run sortformer-dia serve --model /path/to/model --device cpu --dtype float32`), lo que la hace viable sin GPU.
- Opciones de despliegue: el proyecto `sortformer-dia` con su cargador nativo de PyTorch (CLI `serve`). No requiere NeMo. No es compatible con `AutoModel` de Transformers. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; no se publican cifras de factor de tiempo real ni de audio procesado por segundo.
- Otros aceleradores: el rendimiento en NPU no está verificado según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Notas |
|---|---|---|---|---|
| MigoXV/diar_streaming_sortformer_4spk-v2.1 (este repositorio) | 117.744.664 | safetensors (990 tensores), sin cuantizar | NVIDIA Open Model License | Conversión no oficial; cargador nativo de `sortformer-dia`; requiere el código del proyecto, no Transformers |
| nvidia/diar_streaming_sortformer_4spk-v2.1 (original) | No disponible en la información proporcionada (se asume idéntico, al ser conversión de formato) | Formato original de NVIDIA (`.nemo`, no incluido en este repositorio) | NVIDIA Open Model License | Lanzamiento oficial, presumiblemente con soporte en NeMo |
| Otras soluciones de diarización (por ejemplo, pyannote, MSDD de NeMo) | No disponible | No disponible | No disponible | No se aportaron datos comparativos en la información disponible |

No se dispone de comparaciones de rendimiento (DER u otras métricas) entre este modelo y alternativas de la misma categoría, por lo que la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No realiza transcripción: la model card indica explícitamente que no incluye reconocimiento de voz. Cualquier caso de uso que necesite texto requiere un ASR adicional.
- Límite de cuatro hablantes: el modelo está diseñado para un máximo de 4 hablantes; con más voces simultáneas no se garantiza una atribución correcta.
- Conversión no oficial: no es un lanzamiento de NVIDIA. La trazabilidad se apoya en `source.json` (versión de origen y SHA-256), pero no hay validación publicada de que el comportamiento sea idéntico al del modelo original en NeMo.
- Sin benchmarks: no hay métricas publicadas de DER, JER ni robustez ante ruido, solapamiento, reverberación o audio telefónico.
- Sin validación comunitaria: 0 descargas y 0 likes; no existen informes de terceros sobre su comportamiento en producción.
- Idiomas no declarados: no se especifica lista de idiomas soportados ni comportamiento en code-switching.
- Problemas típicos de la diarización: confusión de hablantes con timbres similares, errores en tramos de solapamiento y dependencia de la calidad del audio. No se documentan sesgos demográficos ni de acento, pero tampoco se declaran evaluaciones al respecto.
- Compatibilidad de integración: el repositorio solo contiene pesos; el código de implementación no está incluido. `safetensors` es un formato de almacenamiento y no implica que `AutoModel` de Transformers soporte esta arquitectura.
- Licencia: NVIDIA Open Model License. Cualquier uso, incluido el comercial, debe revisarse en `LICENSE.pdf`; es obligatorio respetar la atribución indicada en `NOTICE`. La model card usa `license: other`, no una licencia permisiva estándar.
- Entorno: NeMo no es necesario para ejecutar esta conversión, pero se requiere el proyecto `sortformer-dia`. Los kernels Triton solo aplican en CUDA y el soporte de NPU no está verificado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MigoXV/diar_streaming_sortformer_4spk-v2.1
- Modelo original de NVIDIA: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1
- Licencia (PDF): https://huggingface.co/MigoXV/diar_streaming_sortformer_4spk-v2.1/blob/main/LICENSE.pdf
- Atribución: https://huggingface.co/MigoXV/diar_streaming_sortformer_4spk-v2.1/blob/main/NOTICE
- Metadatos de origen y SHA-256: https://huggingface.co/MigoXV/diar_streaming_sortformer_4spk-v2.1/blob/main/source.json
- Configuración del modelo: https://huggingface.co/MigoXV/diar_streaming_sortformer_4spk-v2.1/blob/main/config.json
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni enlaces adicionales (papers, blogs o demos) utilizables.
