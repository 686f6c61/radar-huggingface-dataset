# ina-foss/ssl-vad-no_music

## Resumen

El modelo `ina-foss/ssl-vad-no_music` es un detector de actividad de voz (VAD, *voice activity detection*) desarrollado por INA-FOSS (el laboratorio de innovación del Institut national de l'audiovisuel francés). Se trata de un modelo derivado por *fine-tuning* del modelo base `ina-foss/ssl-audio-1k-no_music`, un encoder de audio auto-supervisado preentrenado sobre un corpus de audio de aproximadamente 1000 horas sin música. El objetivo del modelo es clasificar tramos de audio en voz o no-voz, un componente fundamental en pipelines de transcripción, diarización, segmentación de audio y procesamiento de archivos audiovisuales a gran escala.

La relevancia de este modelo radica en su origen: INA-FOSS lo entrena sobre material de archivo audiovisual real, lo que lo hace especialmente adecuado para audio de broadcast, entrevistas, grabaciones históricas y material con ruido de fondo o condiciones acústicas heterogéneas. Al estar construido sobre un *encoder* SSL (*self-supervised learning*), aprovecha representaciones aprendidas sin etiquetas y solo requiere una cabeza de clasificación ligera para la tarea de VAD.

El modelo se distribuye a través de Hugging Face con acceso restringido (*gated*), lo que obliga a aceptar las condiciones de la licencia `pantagruel-research-license` antes de la descarga. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto, viable en CPU y GPU de consumo. La información pública disponible es escasa: no se han publicado detalles sobre arquitectura exacta, número de parámetros, longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (encoder SSL de audio con cabeza de clasificación VAD; `custom_code` en transformers) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | no disponible (el VAD es en principio agnóstico al idioma) |
| Licencia | pantagruel-research-license (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `ina-foss/ssl-audio-1k-no_music`, un encoder de audio entrenado de forma auto-supervisada sobre aproximadamente 1000 horas de audio sin música. Sobre ese *backbone* se ha aplicado un *fine-tuning* supervisado para la tarea binaria de detección de actividad de voz, dando lugar a `ssl-vad-no_music`. El pipeline declarado en Hugging Face es `voice-activity-detection` y el repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere `trust_remote_code=True` en la librería `transformers`.

No se dispone de información pública sobre el número exacto de tokens de entrenamiento, la composición del dataset de *fine-tuning*, ni si se emplearon técnicas de RLHF o DPO (poco probables en una tarea de clasificación frame-a-frame como el VAD). Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. El sufijo `no_music` indica que el corpus de entrenamiento excluye música, lo que reduce falsos positivos en pasajes musicales pero también puede implicar un comportamiento menos calibrado en audio con música de fondo.

## Capacidades

- Detección de actividad de voz (VAD) a nivel de trama o segmento sobre audio en bruto.
- Extracción de características (`feature-extraction`) del encoder SSL subyacente para tareas *downstream* de audio.
- Segmentación de audio en regiones con y sin voz, útil como paso previo a ASR o diarización.
- Funcionamiento previsiblemente independiente del idioma, al tratarse de una tarea acústica y no lingüística (no confirmado en la documentación).
- Robustez esperada frente a audio de archivo y broadcast, dado el dominio de entrenamiento de INA.
- No se documenta soporte de *tool calling*, agentes, visión, audio generativo ni modo *thinking*.

## Casos de uso

- Segmentación previa a transcripción ASR: el modelo identifica los tramos con voz para que el sistema de reconocimiento de habla solo procese esas regiones, reduciendo coste computacional y alucinaciones del ASR en silencios y ruido.
- Diarización de hablantes en archivos audiovisuales: el VAD actúa como primer filtro para aislar segmentos de habla antes de aplicar el modelo de *speaker embedding* y *clustering*.
- Indexación de archivos de broadcast: INA puede procesar grandes volúmenes de material televisivo y radiofónico detectando automáticamente dónde hay locución, para alimentar motores de búsqueda y sistemas de archivo.
- Limpieza y recorte de grabaciones: eliminación automática de silencios, pausas y tramos sin voz en entrevistas o podcasts antes de la publicación.
- Medición de tiempo de habla en estudios de audiencia o análisis de contenido: cuantificación de la proporción de voz frente a silencio o música en un programa, útil para métricas de producción.
- Preprocesado en pipelines de subtitulado automático: alineación temporal de subtítulos limitando la decodificación a los tramos con voz detectada.
- Filtrado de falsos positivos en sistemas de activación por voz: descarte de segmentos sin habla antes de invocar modelos más costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio (0,1 GB) sugiere un modelo del orden de decenas de millones de parámetros, probablemente inferior a 1 GB en FP32 y ejecutable en CPU.
- GPU recomendadas: cualquier GPU moderna con al menos unos pocos GB de VRAM; una RTX 3060 o superior sería más que suficiente si el modelo es tan compacto como indica el tamaño del repo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más; también en CPU para procesamiento por lotes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el `custom_code`); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de clasificación y no generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| ina-foss/ssl-vad-no_music | VAD sobre encoder SSL | no disponible | no disponible | pantagruel-research-license | restringido (gated) |
| Silero VAD | VAD neuronal ligero | ~1-2 M (aprox.) | ventanas cortas | MIT | abierto |
| pyannote/segmentation | Segmentación de habla | ~5-6 M (aprox.) | ventanas de ~10 s | MIT / condiciones HF | abierto con condiciones |
| WebRTC VAD | VAD clásico (GMM) | no aplica | tramas de 10-30 ms | BSD | abierto |

La comparativa con Silero VAD, pyannote y WebRTC VAD se ofrece como referencia de categoría; los datos de parámetros de esos modelos son aproximados y no proceden de la información proporcionada sobre `ssl-vad-no_music`. La principal diferencia de este modelo es su origen en un encoder SSL entrenado sobre 1000 horas de audio de archivo, frente a los VAD ligeros optimizados para tiempo real.

## Limitaciones y advertencias

- Licencia `pantagruel-research-license`: es una licencia no estándar y de acceso restringido; debe revisarse con detalle antes de cualquier uso comercial o de redistribución.
- El repositorio está *gated*: es necesario aceptar las condiciones en Hugging Face y autenticarse para descargar los pesos.
- No hay información pública sobre sesgos, robustez frente a acentos, idiomas de bajos recursos, ruido extremo o audio telefónico.
- El sufijo `no_music` indica entrenamiento sin música; el comportamiento en audio con música de fondo puede degradarse y no está documentado.
- Riesgo de falsos positivos y negativos no cuantificado: al no haber benchmarks publicados, no es posible estimar la precisión en dominios distintos del corpus de INA.
- Requiere `trust_remote_code=True` por el `custom_code` del repositorio, lo que implica ejecutar código del autor del modelo; conviene auditar el código antes de usarlo en producción.
- No es un modelo generativo: no sirve para transcripción, traducción ni generación de texto; su función es exclusivamente la detección de actividad de voz y la extracción de características.
- Fecha de creación y actualización inusualmente futuras en los metadatos (2026), lo que puede indicar errores de catalogación; conviene verificar la ficha oficial antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ina-foss/ssl-vad-no_music
- Modelo base: https://huggingface.co/ina-foss/ssl-audio-1k-no_music
- Organización INA-FOSS en Hugging Face: https://huggingface.co/ina-foss
- Web de INA (Institut national de l'audiovisuel): https://www.ina.fr
