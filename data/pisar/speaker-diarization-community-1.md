# pisar/speaker-diarization-community-1

## Resumen

`pisar/speaker-diarization-community-1` es un pipeline de diarización de hablantes (segmentación de audio por quién habla y cuándo) construido sobre la librería `pyannote-audio`. El repositorio es una réplica del pipeline oficial `pyannote/speaker-diarization-community-1` de la organización pyannote, publicado por el usuario `pisar`. El modelo resuelve el problema de atribuir turnos de habla a hablantes individuales en audio mono a 16 kHz, e incluye detección de actividad de voz, detección de cambio de hablante y detección de habla solapada.

La relevancia del pipeline radica en sus mejoras frente a la versión legacy `speaker-diarization-3.1`: mejor asignación y conteo de hablantes, reconciliación simplificada con marcas de tiempo de transcripción mediante diarización *exclusiva*, y posibilidad de uso totalmente offline. Los resultados publicados en la model card muestran reducciones de la tasa de error de diarización (DER) en la mayoría de benchmarks académicos, aunque con retrocesos puntuales en REPERE phase2 y VoxConverse v0.3.

El repositorio tiene un tamaño de 0.0 GB, no registra descargas ni likes en el momento de la consulta, y fue creado el 9 de noviembre de 2026. La información disponible no detalla la arquitectura interna, el número de parámetros ni la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline de diarización basado en `pyannote-audio`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (procesa audio mono a 16 kHz; no se especifica ventana máxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la diarización es independiente del idioma en lo declarado) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía `Pipeline.from_pretrained` de `pyannote.audio`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del pipeline en la documentación proporcionada. La model card únicamente describe el comportamiento de entrada y salida: ingiere audio mono muestreado a 16 kHz, convierte automáticamente audio estéreo o multicanal a mono promediando canales y remuestrea a 16 kHz al cargar. El pipeline integra módulos de detección de actividad de voz, detección de cambio de hablante y detección de habla solapada, según las etiquetas del repositorio.

Tampoco se detallan el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de ajuste como RLHF o DPO. La innovación declarada por el autor se centra en la mejora de la asignación y el conteo de hablantes, la salida de diarización *exclusiva* para facilitar la reconciliación con transcripciones, y el soporte de uso offline.

## Capacidades

- Diarización de hablantes: identifica qué hablante interviene en cada intervalo temporal del audio.
- Detección de actividad de voz (VAD): distingue segmentos con habla de segmentos sin habla.
- Detección de cambio de hablante: marca los puntos de transición entre hablantes.
- Detección de habla solapada: identifica tramos en los que varios hablantes hablan a la vez.
- Diarización *exclusiva*: salida preparada para alinearse con marcas de tiempo de transcripción automática (ASR).
- Procesamiento automático de audio: downmix de estéreo/multicanal a mono y remuestreo a 16 kHz al cargar.
- Uso offline: ejecución local sin conexión a internet.
- Integración con ASR: el pipeline está etiquetado como `automatic-speech-recognition` y se combina con transcripción.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes.

## Casos de uso

- Actas de reuniones automatizadas: el pipeline segmenta la grabación por hablante y permite asociar cada fragmento transcrito a su interlocutor, lo que facilita la extracción de acuerdos y tareas en reuniones multipartícipes.
- Analítica de centros de contacto (CCaaS): sobre grabaciones de llamadas, la diarización separa agente y cliente para medir tiempos de habla, solapamientos e interrupciones, métricas habituales en control de calidad.
- Asistentes de voz y agentes telefónicos: la detección de cambio de hablante y de habla solapada permite gestionar diálogos multiturno con conciencia de interlocutor en sistemas conversacionales.
- Subtitulado y posproducción de medios: la salida exclusiva alineada con transcripciones simplifica el etiquetado de hablantes en podcasts, vídeos y contenido para doblaje.
- Análisis de formación y evaluación educativa: en grabaciones de clases o sesiones de formación, permite cuantificar la participación de cada persona y detectar patrones de intervención.
- Investigación en lingüística y ciencias del habla: los benchmarks académicos reportados (AMI, CALLHOME, DIHARD 3, entre otros) lo sitúan como herramienta para experimentación sobre corpus conversacionales.
- Transcripción enriquecida en pipelines ASR: combinado con un modelo de reconocimiento de voz, produce transcripciones con etiqueta de hablante listas para indexación o búsqueda.

## Benchmarks y rendimiento

Tasas de error de diarización (DER, en %) reportadas en la model card, con procesamiento totalmente automático, sin collar de tolerancia y sin omitir habla solapada (última actualización: 2025-09):

| Benchmark | legacy (3.1) | community-1 | precision-2 |
|---|---|---|---|
| AISHELL-4 | 12.2 | 11.7 | 11.4 |
| AliMeeting (channel 1) | 24.5 | 20.3 | 15.2 |
| AMI (IHM) | 18.8 | 17.0 | 12.9 |
| AMI (SDM) | 22.7 | 19.9 | 15.6 |
| AVA-AVD | 49.7 | 44.6 | 37.1 |
| CALLHOME (part 2) | 28.5 | 26.7 | 16.6 |
| DIHARD 3 (full) | 21.4 | 20.2 | 14.7 |
| Ego4D (dev.) | 51.2 | 46.8 | 39.0 |
| MSDWild | 25.4 | 22.8 | 17.3 |
| RAMC | 22.2 | 20.8 | 10.5 |
| REPERE (phase2) | 7.9 | 8.9 | 7.4 |
| VoxConverse (v0.3) | 11.2 | 11.2 | 8.5 |

`community-1` mejora a `legacy` en diez de los doce benchmarks, con retrocesos en REPERE phase2 (8.9 frente a 7.9) y empate en VoxConverse v0.3. `precision-2` supera a ambos en todos los conjuntos salvo REPERE phase2, donde `legacy` obtiene el mejor valor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la vía documentada es `pip install pyannote.audio` y carga del pipeline con `Pipeline.from_pretrained`, con ejecución local y soporte offline. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisito de acceso: es necesario aceptar las condiciones de uso en Hugging Face y disponer de un token de acceso (`hf.co/settings/tokens`).

## Comparativa con modelos similares

| Modelo | Tipo | DER medio en benchmarks reportados | Licencia | Disponibilidad |
|---|---|---|---|---|
| `pisar/speaker-diarization-community-1` | Diarización de hablantes (réplica) | Mejora sobre legacy en 10 de 12 benchmarks | CC-BY-4.0 | Hugging Face, 0 descargas, 0 likes |
| `pyannote/speaker-diarization-community-1` | Diarización de hablantes (oficial) | Idéntico al anterior según la model card replicada | CC-BY-4.0 | Hugging Face, con acceso condicionado |
| `pyannote/speaker-diarization-3.1` (legacy) | Diarización de hablantes | Peor DER que community-1 en la mayoría de conjuntos | no disponible en la información | Hugging Face |
| `pyannote/precision-2` | Diarización de hablantes (comercial) | Mejor DER que community-1 en casi todos los benchmarks | no disponible (servicio de pago vía pyannoteAI) | API en pyannoteAI cloud |

## Limitaciones y advertencias

- El repositorio es una réplica publicada por el usuario `pisar`; no consta como repositorio oficial de pyannote. La procedencia y la integridad de los pesos deben verificarse antes de usarlo en producción.
- Repositorio de 0.0 GB y sin descargas ni likes: no hay evidencia de uso ni de validación por parte de la comunidad.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el pipeline original está sujeto a condiciones de acceso condicionado (gated) y a un prompt de aceptación que recaba datos de contacto; el uso de la réplica no exime de respetar las condiciones del modelo original.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de errores de asignación de hablantes, especialmente en escenarios con habla solapada: el DER en AVA-AVD (44.6) y Ego4D (46.8) es alto.
- Retroceso documentado frente a legacy en REPERE phase2 (8.9 frente a 7.9), lo que desaconseja su uso indiscriminado en dominios similares.
- No se especifican idiomas soportados ni límites de duración de audio; el rendimiento en idiomas distintos de los cubiertos por los benchmarks (mayoritariamente inglés, chino y francés) es desconocido.
- No se dispone de información sobre sesgos demográficos, acentos o calidad de grabación.
- Para uso en producción se recomienda evaluar `precision-2` (servicio de pago) si se requiere el mejor DER, según los datos de la propia model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pisar/speaker-diarization-community-1
- Pipeline oficial de referencia: https://huggingface.co/pyannote/speaker-diarization-community-1
- Blog de pyannote sobre Community-1: https://www.pyannote.ai/blog/community-1
- Blog de pyannote sobre Precision-2: https://www.pyannote.ai/blog/precision-2
- Versión alojada en pyannoteAI cloud: https://hf.co/pyannote/speaker-diarization-community-1-cloud
- Pipeline legacy 3.1: https://hf.co/pyannote/speaker-diarization-3.1
- Token de acceso de Hugging Face: https://hf.co/settings/tokens
- Panel de pyannoteAI: https://dashboard.pyannote.ai
- Paper AISHELL-4: https://arxiv.org/abs/2104.03603
- Paper AVA-AVD: https://arxiv.org/abs/2111.14448
- Paper DIHARD 3: https://arxiv.org/abs/2012.01477
- Paper Ego4D: https://arxiv.org/abs/2110.07058
- Corpus AliMeeting: https://www.openslr.org/119/
- Corpus AMI: https://groups.inf.ed.ac.uk/ami/corpus/
- Corpus CALLHOME (part 2): https://github.com/BUTSpeechFIT/CALLHOME_sublists/issues/1
- Corpus DIHARD 3: https://catalog.ldc.upenn.edu/LDC2022S14
- Corpus MSDWild: https://github.com-X-LANCE/MSDWILD
- Corpus RAMC: https://www.openslr.org/123/
- Corpus REPERE: https://www.islrn.org/resources/360-758-359-485-0/
- Corpus VoxConverse: https://github.com/joonson/voxconverse
- Métricas de diarización de pyannote: http://pyannote.github.io/pyannote-metrics/reference.html#diarization
