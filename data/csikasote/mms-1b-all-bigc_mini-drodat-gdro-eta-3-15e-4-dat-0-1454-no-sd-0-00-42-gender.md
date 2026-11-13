# csikasote/mms-1b-all-bigc_mini-drodat-gdro-eta-3.15e-4-dat-0.1454-no-sd-0.00-42-gender

## Resumen

El modelo `csikasote/mms-1b-all-bigc_mini-drodat-gdro-eta-3.15e-4-dat-0.1454-no-sd-0.00-42-gender` es un ajuste fino (fine-tuning) del modelo multilingüe MMS-1B-ALL de Meta, desarrollado por el usuario csikasote. Se trata de un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura wav2vec2, con aproximadamente 964,7 millones de parámetros, lo que lo sitúa en la categoría de modelos de 1B orientados a la transcripción de audio a texto.

El nombre del repositorio codifica información del proceso de entrenamiento: parece tratarse de un experimento con datos de entrenamiento compuestos por subconjuntos como `bigc_mini`, `drodat` y `gdro`, con hiperparámetros como una tasa de aprendizaje (`eta`) de 3,15e-4, un valor de `dat` (posiblemente dropout o data augmentation) de 0,1454, sin `sd` (probablemente speaker diarization o similar) y una configuración relacionada con género (`gender`, 42). Esto sugiere un ajuste fino experimental, probablemente orientado a una o varias lenguas africanas de bajos recursos, dado el contexto de MMS y el perfil del autor.

Su relevancia actual radica en la escasez de modelos ASR de calidad para lenguas de bajos recursos y en la posibilidad de reproducir o adaptar este tipo de ajustes sobre MMS-1B-ALL. No obstante, la información pública disponible es muy limitada: no constan métricas de evaluación, licencia explícita ni idiomas declarados en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (familia MMS-1B-ALL, encoder convolucional + transformer) |
| Parametros totales | 964.698.537 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada típica de wav2vec2 de ~30 s, no confirmada en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec2, concretamente en el checkpoint MMS-1B-ALL de Meta, que emplea un extractor de características convolucional seguido de un transformer con adaptadores específicos por lengua. MMS-1B-ALL fue diseñado para cubrir más de 1.100 lenguas mediante adaptadores de bajo rango sobre un backbone compartido, lo que permite ajustes eficientes por idioma. En este repositorio, el ajuste parece realizarse sobre un conjunto de datos compuesto por los subconjuntos `bigc_mini`, `drodat` y `gdro`, con una tasa de aprendizaje de 3,15e-4 y un valor de `dat` de 0,1454.

No se dispone de información sobre el número de tokens de audio, la composición exacta del dataset, la presencia de RLHF/DPO (poco habitual en ASR) ni innovaciones técnicas adicionales. El nombre del repositorio sugiere un experimento controlado con ablaciones (ausencia de `sd`, configuración de género), pero no hay documentación que lo confirme. Tampoco se especifica si se ha congelado el backbone o se han entrenado adaptadores específicos.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto, presumiblemente en las lenguas representadas en los datos de ajuste.
- Modelo de audio puro: no genera texto libre ni mantiene conversaciones; su salida es una transcripción.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado capacidad de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no confirmadas; el modelo base MMS-1B-ALL es multilingüe, pero el ajuste puede haber especializado el modelo en una o varias lenguas concretas.
- No se ha documentado modo de pensamiento (thinking), visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones y entrevistas en lenguas africanas de bajos recursos: el modelo puede convertir audio en texto para actas y subtítulos, aprovechando el ajuste sobre datos específicos de dominio.
- Subtitulado automático de contenido audiovisual: integrable en pipelines de postproducción para generar subtítulos en las lenguas cubiertas por el ajuste.
- Investigación lingüística y documentación de lenguas minoritarias: permite transcribir corpus orales para estudios fonéticos y sociolingüísticos.
- Atención al cliente en centros de contacto locales: transcripción de llamadas para análisis de calidad y búsqueda posterior, siempre que la lengua coincida con la del ajuste.
- Archivado y búsqueda de material radiofónico: indexación de emisiones en lengua local para recuperación por texto.
- Evaluación comparativa de ASR de bajos recursos: sirve como punto de partida para reproducir experimentos con MMS y medir el impacto de distintos subconjuntos de datos.
- Prototipado de asistentes de voz: combinado con un modelo de lenguaje, puede formar la etapa ASR de un asistente en lengua local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,9 GB solo para pesos (964,7 M de parámetros × 4 bytes), más activaciones y memoria del extractor convolucional.
- VRAM estimada en fp16/bf16: aproximadamente 1,9-2,0 GB para pesos, más overhead.
- GPU recomendadas: NVIDIA A100, H100 o L4 para producción; RTX 4090, RTX 3090 o RTX 4080 para desarrollo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16; en cuantización de 8 bits podría caber en 4-6 GB, aunque no se han publicado cuantizaciones oficiales.
- Opciones de despliegue: transformers (Pipeline de ASR), vLLM no aplica (no es un modelo de lenguaje), TGI no aplica; para CPU se puede usar ONNX Runtime o torch con cuantización dinámica.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| csikasote/mms-1b-all-...-gender (este modelo) | 964,7 M | no disponible | no disponibles | no disponible | Hugging Face |
| facebook/mms-1b-all | ~965 M | audio ~30 s por ventana | 1.100+ lenguas con adaptadores | CC-BY-NC 4.0 (según ficha de Meta) | Hugging Face |
| facebook/wav2vec2-large-xlsr-53 | ~317 M | audio ~30 s | 53 lenguas | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | ~1.550 M | 30 s | ~99 lenguas | MIT | Hugging Face |

La comparativa se basa en características públicas de los modelos base; no se dispone de métricas de rendimiento de este ajuste concreto para comparar WER.

## Limitaciones y advertencias

- No se declara licencia en la ficha de Hugging Face; el uso comercial queda en un limbo legal hasta que el autor lo aclare. El modelo base MMS-1B-ALL de Meta se distribuye bajo CC-BY-NC 4.0, lo que podría condicionar el uso comercial del derivado.
- No se especifican los idiomas soportados; usar el modelo fuera de las lenguas de ajuste probablemente produzca transcripciones erróneas.
- Riesgo de alucinación en ASR: en segmentos con ruido, silencios o habla solapada, el modelo puede generar texto plausible pero incorrecto.
- Sesgos potenciales derivados de los datos de entrenamiento (`bigc_mini`, `drodat`, `gdro`): posible infrarepresentación de determinados acentos, géneros o registros, especialmente si el ajuste se centró en una configuración de género concreta.
- Sin métricas publicadas de WER ni evaluación independiente; no se recomienda su uso en producción sin una validación previa sobre el dominio objetivo.
- El nombre del repositorio sugiere un experimento académico; no hay garantía de mantenimiento ni de soporte.
- No se han publicado cuantizaciones ni versiones optimizadas para despliegue en CPU.

## Enlaces

- Hugging Face: https://huggingface.co/csikasote/mms-1b-all-bigc_mini-drodat-gdro-eta-3.15e-4-dat-0.1454-no-sd-0.00-42-gender
- Modelo base MMS-1B-ALL: https://huggingface.co/facebook/mms-1b-all
- Paper de MMS (Scaling Speech Technology to 1,000+ Languages): https://arxiv.org/abs/2305.13516
- Repositorio de MMS en GitHub: https://github.com/facebookresearch/fairseq/tree/main/examples/mms
