# nvidia/Nemotron-3-Diarization-preview

## Resumen
Nemotron-3-Diarization-preview es un modelo de diarización de hablantes desarrollado por NVIDIA, publicado en HuggingFace con acceso restringido (gated). Está diseñado para identificar quién habla y cuándo en flujos de audio, combinando detección de actividad de voz (VAD) y etiquetado de hablantes mediante una arquitectura streaming-sortformer. El modelo se enmarca en la familia Nemotron 3, orientada a aplicaciones de IA agéntica, aunque este preview se centra específicamente en procesamiento de audio.

La relevancia actual radica en la creciente demanda de transcripción y análisis de conversaciones en tiempo real, donde la diarización precisa es un componente crítico. Al ser un modelo de NVIDIA con soporte en NeMo, se espera que ofrezca integración con el ecosistema de herramientas de la compañía. No se han publicado detalles sobre el número de parámetros, la arquitectura interna completa ni los datos de entrenamiento en la información disponible, por lo que esta ficha se basa únicamente en los metadatos públicos y las referencias a papers asociados.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Streaming-sortformer (basada en la familia de diarización de NVIDIA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | nvidia-software-and-model-evaluation-license |
| Formato de pesos | no disponible (probablemente NeMo) |

## Arquitectura y entrenamiento
La arquitectura se describe como streaming-sortformer, una variante de los modelos sortformer utilizados para diarización de hablantes en flujos de audio continuos. Esta arquitectura combina detección de actividad de voz (VAD) con etiquetado de hablantes, permitiendo procesamiento en tiempo real. No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. Los papers asociados (arXiv:2507.18446, arXiv:2409.06656, arXiv:2605.15442, arXiv:2507.09226) podrían contener detalles técnicos, pero no se han analizado en esta ficha.

## Capacidades
- Diarización de hablantes: identifica segmentos de audio y asigna cada uno a un hablante distinto.
- Detección de actividad de voz (VAD): distingue entre voz y silencio o ruido de fondo.
- Etiquetado de hablantes (speaker tagging): asigna etiquetas consistentes a cada locutor a lo largo del audio.
- Procesamiento en streaming: la arquitectura sortformer está diseñada para operar sobre flujos de audio continuos, no solo sobre archivos completos.
- Integración con NeMo: al estar basado en la librería NeMo, puede combinarse con otros componentes del ecosistema NVIDIA (ASR, NLP, etc.).

## Casos de uso
- Transcripción de reuniones: el modelo puede segmentar el audio de una videoconferencia para asignar cada intervención a su participante, facilitando actas y búsquedas por hablante.
- Análisis de llamadas de servicio al cliente: permite extraer métricas como tiempo de habla por agente, detección de conflictos o cumplimiento de guiones.
- Subtitulación en vivo: combinado con un sistema ASR, puede generar subtítulos con atribución de hablante en emisiones en directo.
- Archivo de audiencias judiciales o entrevistas: la diarización ayuda a indexar declaraciones y localizar testimonios específicos.
- Asistentes de voz multiusuario: en entornos domésticos o de oficina, el modelo puede distinguir entre diferentes personas que interactúan con el asistente.
- Análisis de podcasts o programas de radio: segmentar y etiquetar a los participantes para facilitar la navegación por contenido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se puede comparar cuantitativamente con otros modelos de diarización como pyannote o NeMo diarization sin datos adicionales.

## Requisitos de hardware
- No se dispone de información sobre VRAM estimada ni GPUs recomendadas.
- El tamaño del repositorio (0.4 GB) sugiere que el modelo es relativamente ligero, pero no se puede confirmar su huella en memoria.
- Al ser un modelo de audio, la inferencia puede ejecutarse en CPU para procesamiento por lotes, aunque el streaming en tiempo real probablemente requiera GPU.
- No se han publicado opciones de despliegue específicas, pero al estar basado en NeMo, es compatible con los contenedores y herramientas de NVIDIA (Triton, etc.).

## Comparativa con modelos similares
No disponible. No se han identificado modelos comparables en la información proporcionada. La diarización de hablantes tiene alternativas como pyannote.audio o los modelos de diarización de NeMo, pero no se dispone de datos para una comparación objetiva.

## Limitaciones y advertencias
- Acceso restringido: el modelo requiere aceptar los términos de la licencia de NVIDIA en HuggingFace antes de poder descargarlo.
- Licencia de evaluación: la licencia "nvidia-software-and-model-evaluation-license" limita su uso a fines de evaluación, no a producción comercial sin acuerdo adicional.
- Sesgos potenciales: al ser un modelo de audio, puede presentar errores con acentos no representados en sus datos de entrenamiento, solapamiento de hablantes o ruido de fondo intenso.
- Riesgo de alucinación en etiquetas: en segmentos ambiguos, el modelo podría asignar incorrectamente hablantes, especialmente si hay más locutores de los que el modelo puede distinguir.
- Sin información sobre idiomas: no se especifica qué idiomas soporta, lo que limita su uso en entornos multilingües sin validación previa.
- Modelo en vista previa: al ser un "preview", puede contener errores no documentados y no garantiza estabilidad para producción.

## Enlaces
- HuggingFace: https://huggingface.co/nvidia/Nemotron-3-Diarization-preview
- Papers asociados (referencias arXiv de los tags):
  - arXiv:2507.18446
  - arXiv:2409.06656
  - arXiv:2605.15442
  - arXiv:2507.09226
- Página de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- GitHub de NVIDIA-NeMo/Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
