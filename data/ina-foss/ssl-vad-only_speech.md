# ina-foss/ssl-vad-only_speech

## Resumen

`ina-foss/ssl-vad-only_speech` es un modelo de deteccion de actividad de voz (VAD, voice activity detection) desarrollado por INA-FOSS, un proyecto vinculado al Institut National de l'Audiovisuel frances. El modelo se publica como un fine-tuning del checkpoint base `ina-foss/ssl-audio-1k-only_speech`, un modelo de representacion de audio auto-supervisado, y se distribuye a traves de la libreria Transformers con pesos en formato safetensors.

El modelo resuelve la tarea de segmentar audio en tramos con voz y tramos sin voz, una pieza fundamental en pipelines de transcripcion automatica, diarizacion de hablantes, indexacion de archivos audiovisuales y preprocesado de datos de habla. A diferencia de los VAD clasicos basados en energia o en modelos GMM, este checkpoint parte de representaciones auto-supervisadas de audio, lo que potencialmente mejora la robustez frente a ruido y condiciones acusticas variadas, aunque no se han publicado resultados comparativos en la informacion disponible.

El modelo tiene un tamano de repositorio de 0,1 GB, lo que sugiere un checkpoint compacto, coherente con una tarea de clasificacion binaria por tramas sobre un encoder de audio preentrenado. Su relevancia actual radica en que ofrece una alternativa basada en aprendizaje profundo a los VAD tradicionales dentro del ecosistema Transformers, aunque con dos caveats importantes: el acceso esta restringido (gated) y la licencia es la `pantagruel-research-license`, que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de `ina-foss/ssl-audio-1k-only_speech`, encoder de audio auto-supervisado con cabeza de clasificacion VAD) |
| Parametros totales | no disponible (repo de 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no publicadas) |
| Idiomas soportados | no disponible (la tarea VAD es en gran medida independiente del idioma) |
| Licencia | pantagruel-research-license (licencia de investigacion, revisar terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del checkpoint `ina-foss/ssl-audio-1k-only_speech`, que forma parte de la familia de modelos SSL (self-supervised learning) de audio de INA-FOSS entrenados sobre un corpus de 1.000 horas de audio. La tarea de fine-tuning es la deteccion de actividad de voz, es decir, la clasificacion de tramas o segmentos de audio como voz o no voz. El pipeline declarado en Hugging Face es `voice-activity-detection` y el modelo incluye `custom_code`, lo que indica que requiere cargar codigo propio del repositorio para la inferencia (probablemente una cabeza especifica o utilidades de post-procesado).

No se dispone de informacion detallada sobre el numero exacto de tokens de audio utilizados en el fine-tuning, la composicion del dataset VAD, ni si se aplicaron tecnicas de aumento de datos o balanceo de clases. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La etiqueta `tensorboard` sugiere que se publicaron logs de entrenamiento en el repositorio, aunque no se detallan en la informacion disponible. El sufijo `only_speech` en el nombre del modelo base indica que el preentrenamiento SSL se realizo sobre audio que contiene exclusivamente habla, lo que puede influir en el comportamiento del VAD en presencia de musica o ruido.

## Capacidades

- Deteccion de actividad de voz: clasifica segmentos de audio como voz o no voz, generando una mascara temporal utilizable por pipelines posteriores.
- Extraccion de caracteristicas: la etiqueta `feature-extraction` indica que el encoder subyacente puede emplearse para obtener representaciones de audio.
- Procesamiento de audio de habla: el modelo esta especializado en habla, no en audio general (musica, eventos sonoros).
- Integracion con Transformers: se carga mediante `AutoModel` con `trust_remote_code=True` y el pipeline de `voice-activity-detection`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio multimodal ni modo de razonamiento (thinking mode).
- Capacidades multilingues: no documentadas; la tarea VAD es en gran medida agnostica al idioma, pero no hay evaluacion publicada.

## Casos de uso

- Preprocesado de transcripcion automatica: el modelo puede segmentar audio largo en tramos con voz antes de pasarlo a un ASR (Whisper, wav2vec 2.0), reduciendo coste computacional y alucinaciones del transcriptor en silencios y ruido.
- Indexacion de archivos audiovisuales: en archivos de television o radio, el VAD permite localizar rapidamente los tramos hablados y generar metadatos temporales para busqueda y recuperacion.
- Diarizacion de hablantes: como paso previo a un sistema de diarizacion, el VAD elimina segmentos sin voz y mejora la precision de la agrupacion de hablantes.
- Deteccion de silencios para edicion automatica: en produccion de podcast o video, el modelo permite recortar silencios y pausas largas de forma automatica.
- Filtrado de datos de entrenamiento ASR: para construir corpus de habla, el VAD descarta grabaciones o tramos sin voz antes de la transcripcion y el alineamiento.
- Monitorizacion de calidad en call centers: permite medir la proporcion de habla frente a silencio en llamadas y detectar problemas de audio o tiempos muertos.
- Investigacion en representaciones SSL de audio: al ser un fine-tuning de un modelo SSL, sirve como punto de partida para experimentos de adaptacion a otras tareas de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; con un repositorio de 0,1 GB, el checkpoint en fp32 ocuparia del orden de 100 MB, por lo que la inferencia cabria en cualquier GPU consumer con 4 GB o mas, e incluso en CPU para audio de duracion moderada.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100); el modelo es lo suficientemente pequeno como para no requerir GPU de datacenter, aunque el throughput en A100/H100 seria mayor para procesamiento por lotes de grandes archivos.
- GPU consumer: si, previsiblemente cabe en GTX 1650, RTX 3060, RTX 4060 y superiores, dado el tamano del checkpoint.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son frameworks orientados a LLM, no a VAD). Para produccion conviene exportar a ONNX o TorchScript si se necesita baja latencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ina-foss/ssl-vad-only_speech` | VAD basado en SSL de audio | no disponible (repo 0,1 GB) | no disponible | pantagruel-research-license | gated en Hugging Face |
| Silero VAD | VAD neuronal ligero | ~1-2 M (aprox., no confirmado aqui) | ventanas de 30 ms | MIT | abierto, ampliamente usado |
| WebRTC VAD | VAD clasico basado en GMM | no aplica | tramas de 10-30 ms | BSD | abierto, integrado en navegadores |
| pyannote segmentation | Segmentacion de habla neuronal | no disponible | ventanas de varios segundos | MIT / comercial segun version | gated en Hugging Face |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo de INA-FOSS para establecer una comparacion cuantitativa con Silero, WebRTC o pyannote. La principal diferencia es que este checkpoint se apoya en un encoder SSL de audio, mientras que Silero y WebRTC son modelos mucho mas ligeros y especializados en VAD de baja latencia.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de descargarlo.
- Licencia `pantagruel-research-license`: es una licencia de investigacion; es imprescindible revisar sus terminos antes de cualquier uso comercial o redistribution.
- Entrenado solo con habla (`only_speech`): su comportamiento en audio con musica, ruido fuerte o habla superpuesta no esta documentado y podria degradarse.
- Sin benchmarks publicados: no hay datos de precision, recall o tasa de falsos positivos que permitan evaluar su calidad frente a alternativas.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la deteccion de voz, especialmente en condiciones acusticas adversas.
- Requiere `trust_remote_code=True`: implica ejecutar codigo del repositorio, lo que anade un riesgo de seguridad que debe evaluarse en entornos de produccion.
- Idiomas no documentados: aunque la tarea VAD es en gran medida independiente del idioma, no hay evaluacion multilingue publicada.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de uso muy limitado, poca comunidad y escasa documentacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ina-foss/ssl-vad-only_speech
- Modelo base: https://huggingface.co/ina-foss/ssl-audio-1k-only_speech
- Organizacion INA-FOSS en Hugging Face: https://huggingface.co/ina-foss
