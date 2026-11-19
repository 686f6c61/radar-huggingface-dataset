# nvidia/Nemotron-3-Diarization

## Resumen

Nemotron 3 Diarization es un modelo de diarización de hablantes (determinar "quién habla y cuándo") desarrollado por NVIDIA y publicado con pesos abiertos. Sigue la estela de Sortformer y de Streaming Sortformer, y su principal novedad es que un único checkpoint cubre tanto inferencia en streaming de baja latencia como inferencia offline, con soporte de hasta ocho hablantes simultáneos. El modelo resuelve la permutación de hablantes ordenando sus canales de salida según la primera aparición de cada voz en el audio de entrada, lo que elimina la necesidad de un paso posterior de reasignación de identidades.

Con aproximadamente 99,2 millones de parámetros, es un modelo compacto pensado para integrarse en pipelines de ASR y de análisis de reuniones, no para generación de texto. Su relevancia actual radica en la combinación de latencia muy baja (buffer de entrada configurable desde 80 ms, con 0,32 s como mínimo recomendado) y una resolución de salida configurable en múltiplos de 10 ms, lo que lo hace apto para subtitulado en directo, transcripción con etiquetas de hablante y sistemas de voz conversacionales.

La licencia OpenMDW-1.1 permite uso comercial y no comercial, y el modelo se distribuye en formatos safetensors y GGUF, con soporte en la librería NeMo y un runtime nativo en C++ (NeMo-Speech.cpp) para despliegue local ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer (streaming Sortformer con Arrival-Order Speaker Cache y cola FIFO); clasificación de tramas de audio |
| Parametros totales | 99.226.504 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | sin límite en duración de audio con inferencia por chunks; buffers de entrada de 80 ms a 30,4 s según configuración |
| Tipos de cuantizacion | no disponible (se distribuye safetensors y GGUF; no se detallan variantes de cuantización) |
| Idiomas soportados | no disponible (modelo acústico independiente del idioma en la información disponible) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors, GGUF (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo sigue la familia Sortformer: un codificador de audio que produce representaciones por trama y un módulo de clasificación que asigna cada trama a uno de los canales de hablante (hasta ocho). La permutación se resuelve por orden de llegada: el canal 0 corresponde al primer hablante que aparece en el audio, el canal 1 al segundo, y así sucesivamente. Para streaming, incorpora la Arrival-Order Speaker Cache (AOSC), que conserva información de hablantes de chunks anteriores para mantener la identidad a lo largo del tiempo, y una cola FIFO que aporta contexto de tramas recientes en cada paso de procesamiento.

La configuración de streaming se define en tramas de 80 ms mediante parámetros como `SPKCACHE_LEN`, `FIFO_LEN`, `CHUNK_LEN`, `RIGHT_CONTEXT` y `UPDATE_PERIOD`. El checkpoint admite latencias de buffer de entrada desde 80 ms (aunque la configuración mínima recomendada es 0,32 s) y una configuración de estilo offline con buffer de 30,4 s. La resolución de salida es configurable en múltiplos de 10 ms. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Diarización de hablantes ("who spoke when") con hasta ocho hablantes simultáneos.
- Inferencia en streaming con latencia configurable y en modo offline con un único checkpoint.
- Mantenimiento de identidad de hablante a lo largo del tiempo mediante la Arrival-Order Speaker Cache.
- Resolución temporal de salida configurable en múltiplos de 10 ms.
- Detección de actividad de voz (el pipeline declarado es voice-activity-detection).
- Etiquetado de hablante a nivel de palabra cuando se combina con transcripción ASR (`nemo-speech transcribe --diarize --json`).
- Procesamiento por lotes de múltiples ficheros de audio y de arrays numpy.
- Duración de audio no limitada con inferencia por chunks.
- No es un modelo generativo de texto: no soporta tool calling, agentes ni razonamiento multi-step.

## Casos de uso

- Transcripción de reuniones con etiquetas de hablante: el modelo se ejecuta junto a un ASR y asigna cada palabra al hablante correspondiente, lo que permite generar actas con intervenciones atribuidas y tiempos por participante.
- Subtitulado en directo: con buffers de 0,32 s y resolución de 10 ms, puede alimentar sistemas de subtitulado que necesitan identificar al hablante en tiempo casi real.
- Análisis de llamadas de atención al cliente: separa agente y cliente en grabaciones de contact center para métricas de tiempo de habla, solapamientos e interrupciones.
- Sistemas de voz conversacionales: la diarización en streaming permite a un asistente saber si le habla el usuario principal o una segunda persona, y cambiar de contexto en consecuencia.
- Indexación y búsqueda de archivos de audio: procesar grandes volúmenes de grabaciones para segmentar por hablante y habilitar búsqueda por participante.
- Investigación en lingüística y ciencias sociales: segmentación automática de corpus de entrevistas y grupos focales con hasta ocho participantes.
- Despliegue en dispositivos o entornos sin GPU: el runtime NeMo-Speech.cpp en C++ y el formato GGUF permiten diarización local en máquinas modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 99,2 M de parámetros, los pesos en precisión completa ocupan del orden de 0,4 GB, por lo que la huella es muy reducida.
- GPU recomendadas: no disponible; el modelo se ejecuta en CUDA mediante NeMo y también en CPU mediante NeMo-Speech.cpp.
- Cabe en GPU de consumo: sí, por tamaño; no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: NVIDIA NeMo Speech (Python, `SortformerEncLabelModel`), NeMo-Speech.cpp (runtime nativo en C++, CLI `nemo-speech diarize`), pesos GGUF para runtimes compatibles.
- Latencia y throughput: latencia de buffer de entrada desde 80 ms, con 0,32 s como mínimo recomendado; configuración offline con buffer de 30,4 s. No se publican cifras de throughput (RTF) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / buffer | Hablantes | Licencia | Formatos |
|---|---|---|---|---|---|
| Nemotron 3 Diarization | 99,2 M | 80 ms a 30,4 s según configuración; audio sin límite por chunks | Hasta 8 | OpenMDW-1.1 | safetensors, GGUF |
| Sortformer (predecesor) | no disponible | offline | no disponible | no disponible | no disponible |
| Streaming Sortformer (predecesor) | no disponible | streaming | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de los modelos predecesores ni de alternativas de otros fabricantes para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Límite máximo de ocho hablantes; en escenarios con más participantes la asignación de identidades puede degradarse.
- La ordenación por primera aparición implica que las etiquetas de hablante son relativas al audio procesado, no identidades globales persistentes entre ficheros.
- El rendimiento en audio con solapamiento intenso, ruido de fondo o canales telefónicos degradados no se documenta en la información disponible.
- No se especifican los idiomas ni la composición del dataset de entrenamiento, por lo que el sesgo lingüístico y acústico es desconocido.
- Riesgo de confusión entre hablantes con voces similares; no se publican tasas de error de diarización (DER) en la información disponible.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar sus términos completos antes de un despliegue en producción.
- Es un modelo de clasificación de tramas, no generativo: no debe esperarse de él generación de texto, razonamiento ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Blog de NVIDIA en Hugging Face: https://huggingface.co/blog/nvidia/nemotron-diarization
- Paper de referencia: https://arxiv.org/abs/2611.12246
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/nemotron-diarization
- NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- Guía CLI de diarización: https://github.com/NVIDIA/NeMo-Speech.cpp/blob/main/docs/cli.md#diarize-audio
- NVIDIA NeMo Speech: https://github.com/NVIDIA-NeMo/Speech
- Referencias adicionales citadas en la model card: https://arxiv.org/abs/2409.06656, https://arxiv.org/abs/2507.18446, https://arxiv.org/abs/2605.15442, https://arxiv.org/abs/2507.09226, https://arxiv.org/abs/2408.13106
