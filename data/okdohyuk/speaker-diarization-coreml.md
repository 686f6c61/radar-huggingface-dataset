# okdohyuk/speaker-diarization-coreml

## Resumen

`speaker-diarization-coreml` es un paquete de modelos de diarización de hablantes (segmentación de audio por interlocutor) convertidos a Core ML para su ejecución optimizada en el Apple Neural Engine. El modelo original procede de la familia pyannote y este repositorio concreto (`okdohyuk/speaker-diarization-coreml`) es un espejo fijado (pinned mirror) byte a byte del repositorio `FluidInference/speaker-diarization-coreml`, en el commit `df2625ac79a7ac6b65ad868fee6d80f320da4232`, orientado a la aplicación Nogmi. Solo difieren `README.md` y `LICENSE` respecto al upstream.

El paquete no es un modelo de lenguaje generativo, sino un pipeline de cuatro componentes Core ML (`FBank`, `Segmentation`, `Embedding` y `PldaRho`) más un fichero `plda-parameters.json` que implementa el clustering probabilístico PLDA. Resuelve el problema de identificar «quién habla y cuándo» en un audio, una tarea previa habitual en transcripción de reuniones, subtitulado y análisis de llamadas.

Su relevancia actual radica en el despliegue local en dispositivos Apple: según la model card del upstream, los modelos en Core ML presentan aproximadamente una aceleración de 10x en CPU y 20x en GPU respecto a la implementación de referencia, con diferencias menores en los valores por las distintas precisiones. Al estar entrenados sobre firmas acústicas, el pipeline es agnóstico al idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline Core ML de cuatro etapas: extracción de features (FBank), segmentación, embeddings de hablante y clustering PLDA (modelos derivados de pyannote) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa audio por ventanas) |
| Tipos de cuantizacion | no disponible (pesos en formato Core ML `weight.bin`; precisiones no especificadas en la información disponible) |
| Idiomas soportados | agnóstico al idioma (entrenado sobre firmas acústicas) |
| Licencia | CC-BY-4.0 para los pesos; BUT PLDA CC-BY-4.0; el campo de licencia del repo figura como `other` |
| Formato de pesos | Core ML (`.mlmodelc` con `model.mil` y `weights/weight.bin`), más `plda-parameters.json` |

## Arquitectura y entrenamiento

El paquete implementa un pipeline clásico de diarización en cuatro módulos empaquetados como modelos Core ML compilados (`.mlmodelc`). `FBank` extrae características espectrales tipo filter bank del audio; `Segmentation` detecta tramos de actividad de voz y los asigna a hablantes locales; `Embedding` genera vectores de identidad de hablante por segmento; y `PldaRho` aplica el modelo probabilístico PLDA (Probabilistic Linear Discriminant Analysis) para el clustering global de hablantes, cuyos parámetros se externalizan en `plda-parameters.json`. Los modelos derivan de la familia pyannote.

No se dispone de información sobre el número de tokens o horas de audio de entrenamiento, la composición del dataset ni si hubo ajuste fino con RLHF o DPO; estos datos no están disponibles. La innovación técnica destacable es la conversión a Core ML con optimización para el Apple Neural Engine, que según el upstream reporta una aceleración de aproximadamente 10x en CPU y 20x en GPU respecto a la implementación de referencia, a costa de diferencias menores en los valores por los cambios de precisión.

## Capacidades

- Diarización de hablantes: identifica qué hablante interviene en cada tramo de audio y produce segmentos etiquetados por interlocutor.
- Segmentación de actividad de voz y detección de cambios de turno.
- Extracción de embeddings de identidad de hablante para comparación y agrupamiento.
- Clustering global de hablantes mediante PLDA.
- Independencia del idioma: al basarse en firmas acústicas, funciona con cualquier lengua.
- Ejecución local en dispositivos Apple mediante Core ML y el Apple Neural Engine.
- No soporta generación de texto, tool calling, agentes, visión ni audio generativo; es un componente especializado de procesamiento de audio.

## Casos de uso

- Transcripción de reuniones con etiquetado de interlocutor: se ejecuta el pipeline sobre el audio y se combinan los segmentos de diarización con la salida de un ASR para atribuir cada frase a su hablante, algo útil en actas y resúmenes.
- Subtitulado de entrevistas y podcasts: la segmentación por hablante permite generar subtítulos con etiquetas de interlocutor de forma local en un Mac, sin enviar el audio a la nube.
- Análisis de llamadas de atención al cliente: el pipeline separa agente y cliente para calcular tiempos de habla, solapamientos y turnos, métricas habituales en control de calidad.
- Investigación cualitativa: procesamiento por lotes de grabaciones de entrevistas en un equipo Apple para identificar y separar participantes antes del análisis manual.
- Aplicaciones de accesibilidad: identificación de interlocutores en tiempo real en el dispositivo para mejorar la comprensión de conversaciones en apps de apoyo auditivo.
- Preprocesado para pipelines de reconocimiento de voz: la diarización previa mejora la atribución y la gestión de contextos en sistemas ASR multihablante desplegados en local.
- Indexación y búsqueda de archivos de audio: etiquetar hablantes permite buscar «quién dijo qué» en archivos de entrevistas o archivos periodísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada por el upstream es la aceleración de ejecución en Core ML (aproximadamente 10x en CPU y 20x en GPU), sin valores absolutos de DER (Diarization Error Rate) ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- Plataforma objetivo: dispositivos Apple con soporte de Core ML y, preferentemente, Apple Neural Engine (chips de la serie A y M).
- VRAM estimada: no disponible; el paquete no publica el tamaño de los pesos y el repositorio figura con 0.0 GB.
- GPU recomendadas: no aplica en el sentido de GPU NVIDIA; el despliegue está pensado para Apple Silicon (M1 y posteriores) y chips A-series recientes.
- Compatibilidad con GPU de consumo: no disponible para hardware no Apple; el formato `.mlmodelc` no se ejecuta en CUDA.
- Opciones de despliegue: Core ML / Core ML Tools en macOS e iOS; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma absoluta; el upstream reporta aceleraciones relativas de aproximadamente 10x en CPU y 20x en GPU frente a la implementación de referencia.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `okdohyuk/speaker-diarization-coreml` (este) | Pipeline Core ML derivado de pyannote | Audio por ventanas; longitud no disponible | Agnóstico | CC-BY-4.0 (pesos) / BUT PLDA CC-BY-4.0 | Hugging Face (espejo) |
| `FluidInference/speaker-diarization-coreml` | Pipeline Core ML derivado de pyannote | Audio por ventanas; longitud no disponible | Agnóstico | CC-BY-4.0 (pesos) / BUT PLDA CC-BY-4.0 | Hugging Face (upstream) |
| `hgsilver911/speaker-diarization-coreml` | Pipeline Core ML derivado de pyannote | Audio por ventanas; longitud no disponible | Agnóstico | no disponible | Hugging Face |
| pyannote (modelos originales) | Pipeline de diarización en PyTorch | Audio por ventanas | Agnóstico | Condiciones de pyannote (no verificadas en la información disponible) | Hugging Face |

Los tres repositorios Core ML citados comparten origen (pyannote) y filosofía de despliegue en Apple; este repositorio es un espejo fijado del de FluidInference. No se dispone de datos de rendimiento (DER) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un componente de diarización, no un modelo generativo: no responde preguntas, no genera texto ni soporta tool calling.
- Dependencia de la plataforma: los artefactos `.mlmodelc` solo se ejecutan en el ecosistema Core ML de Apple; no hay pesos en safetensors, GGUF ni ONNX en este repositorio.
- Diferencias numéricas por precisión: el upstream advierte de variaciones menores en los valores respecto a la implementación de referencia por los cambios de precisión en la conversión.
- Riesgo de error en solapamientos y ruido: no se dispone de métricas de DER publicadas que permitan acotar el error en conversaciones con hablantes que se pisan o audio ruidoso.
- Licencia: los pesos se declaran CC-BY-4.0 y el módulo PLDA bajo BUT PLDA CC-BY-4.0, pero el campo de licencia del repositorio figura como `other`; conviene verificar las condiciones exactas antes de un uso comercial.
- Es un espejo: solo `README.md` y `LICENSE` difieren del upstream; para soporte, issues o actualizaciones debe consultarse el repositorio original de FluidInference.
- Sesgos: no se documentan sesgos conocidos por edad, género, acento o calidad de micrófono en la información disponible.
- Sin datos de entrenamiento ni benchmarks publicados en este repositorio, lo que dificulta la evaluación previa a producción.

## Enlaces

- Repositorio de este espejo: https://huggingface.co/okdohyuk/speaker-diarization-coreml
- Repositorio upstream: https://huggingface.co/FluidInference/speaker-diarization-coreml
- Otro espejo Core ML: https://huggingface.co/hgsilver911/speaker-diarization-coreml
- Commit de referencia del upstream: `df2625ac79a7ac6b65ad868fee6d80f320da4232` (en https://huggingface.co/FluidInference/speaker-diarization-coreml)
