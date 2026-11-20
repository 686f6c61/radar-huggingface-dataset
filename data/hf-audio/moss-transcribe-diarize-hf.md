# hf-audio/MOSS-Transcribe-Diarize-HF

## Resumen

MOSS-Transcribe-Diarize 0.9B es un modelo de comprensión de audio de extremo a extremo desarrollado por el equipo OpenMOSS (publicado en Hugging Face bajo la organización hf-audio). Resuelve un problema clásico en el procesamiento de audio: la transcripción de grabaciones largas con múltiples hablantes, que tradicionalmente requiere encadenar un sistema ASR y un sistema de diarización independientes, con la consiguiente acumulación de errores y desalineación temporal. Este modelo unifica ambas tareas en una sola pasada.

La arquitectura es un transformer multimodal audio-texto de aproximadamente 908 millones de parámetros (0,9B), empaquetado con código remoto personalizado para `transformers`. Genera transcripciones con marcas de tiempo y etiquetas anónimas de hablante (`[S01]`, `[S02]`, etc.) en una única inferencia sobre grabaciones de hasta 90 minutos, con soporte declarado para más de 50 idiomas y capacidad de prompting con hotwords para vocabulario específico de dominio.

Su relevancia actual es alta: ganó el primer puesto en el 2nd MLC-SLM Challenge de INTERSPEECH 2026, cubriendo 14 idiomas, y se distribuye con licencia Apache 2.0, lo que lo hace apto para uso comercial. Compite directamente con soluciones propietarias como GPT-4o, Gemini 2.5/3 Pro, Doubao o ElevenLabs en tareas de transcripción con diarización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto (audio-text-to-text), con código remoto personalizado (`trust_remote_code=True`) |
| Parametros totales | 908.513.280 (≈0,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Inferencia en una sola pasada sobre audio de hasta 90 minutos (longitud de contexto en tokens no disponible) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 50 idiomas según la model card; metadatos de la ficha limitados a en y zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un sistema de extremo a extremo para comprensión de audio, que realiza conjuntamente transcripción y diarización en una sola pasada, en lugar de encadenar módulos ASR y de diarización separados. El repositorio incluye el código remoto personalizado necesario para cargarlo con `transformers` mediante `trust_remote_code=True`. No se detalla en la información proporcionada el tipo exacto de encoder de audio, el decoder de texto, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable es la generación "promptable": el modelo acepta instrucciones de transcripción personalizadas, hotwords para términos de dominio y anotaciones de eventos acústicos, y emite una transcripción compacta con marcas de tiempo y etiquetas de hablante consistentes. Está diseñado específicamente para audio largo y "sucio" de múltiples hablantes (reuniones, llamadas, pódcasts, entrevistas, clases, vídeos).

## Capacidades

- Transcripción de audio largo con marcas de tiempo en una sola pasada, hasta 90 minutos por grabación.
- Diarización integrada con etiquetas anónimas de hablante (`[S01]`, `[S02]`, etc.) sin pipeline separado.
- Generación promptable: instrucciones de transcripción personalizadas y hotwords para vocabulario específico de dominio.
- Anotación de eventos acústicos para enriquecer la transcripción con información de qué ocurrió, quién habló y cuándo.
- Procesamiento de audio y vídeo como entrada.
- Cobertura multilingüe declarada de más de 50 idiomas (los metadatos de la ficha solo listan en y zh).
- Integración con `transformers` (pipeline `audio-text-to-text`) y compatibilidad con endpoints.
- Soporte de despliegue con vLLM y SGLang según la model card.
- Interfaz web de subtítulos con soporte para chino simplificado e inglés.

## Casos de uso

- Transcripción de reuniones corporativas: el modelo procesa una reunión completa de hasta 90 minutos en una sola pasada y devuelve el texto con marcas de tiempo y hablantes identificados, lo que permite generar actas y buscar intervenciones por hablante sin pipelines adicionales.
- Generación de subtítulos para vídeo: a partir de un archivo de vídeo, produce subtítulos con timestamps listos para publicar; la Web UI de subtítulos incluida facilita el flujo de trabajo editorial.
- Análisis de pódcasts e interviews: la diarización integrada permite separar entrevistador y entrevistado y construir índices navegables por hablante y minuto, útil para productoras y plataformas de contenido.
- Actas y resúmenes de clases o conferencias: la transcripción con timestamps sirve de base para resúmenes automáticos y para la búsqueda de fragmentos concretos dentro de una grabación larga.
- Atención al cliente y análisis de llamadas: el modelo transcribe llamadas con múltiples participantes y etiquetas de hablante, lo que permite auditar conversaciones, medir tiempos de intervención y alimentar sistemas de calidad.
- Dominios especializados con hotwords: en entornos médicos, legales o técnicos se pueden inyectar términos específicos como hotwords para mejorar la transcripción de vocabulario poco frecuente.
- Pipeline de accesibilidad: generación automática de transcripciones y subtítulos para contenidos audiovisuales, con la ventaja de la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

Resultados de la model card en CER, cpCER y Delta-cp (menor es mejor; guion indica no disponible):

| Modelo | AISHELL-4 CER↓ | AISHELL-4 cpCER↓ | AISHELL-4 Δcp↓ | Alimeeting CER↓ | Alimeeting cpCER↓ | Alimeeting Δcp↓ | Podcast CER↓ | Podcast cpCER↓ | Podcast Δcp↓ | Movies CER↓ | Movies cpCER↓ | Movies Δcp↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Doubao | 18,18 | 27,86 | 9,68 | 25,25 | 37,57 | 12,31 | 7,93 | 10,54 | 2,61 | 9,94 | 30,88 | 20,94 |
| ElevenLabs | 19,58 | 37,95 | 18,36 | 25,70 | 36,69 | 10,99 | 8,50 | 11,34 | 2,85 | 11,49 | 17,85 | 6,37 |
| GPT-4o | - | - | - | - | - | - | - | - | - | 14,37 | 23,67 | 9,31 |
| Gemini 2.5 Pro | 42,70 | 53,42 | 10,72 | 27,43 | 41,64 | 14,21 | 7,38 | 10,23 | 2,85 | 15,46 | 24,15 | 8,69 |
| Gemini 3 Pro | 22,75 | 27,43 | 4,68 | 26,75 | 32,84 | 6,09 | - | - | - | 8,62 | 14,73 | 6,11 |
| VIBEVOICE ASR | 21,40 | 24,99 | 3,59 | 27,40 | 29,33 | 1,93 | 27,94 | 48,30 | 20,36 | 14,59 | 42,54 | 27,94 |
| MOSS Transcribe Diarize 0.9B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card original incluye la fila de MOSS Transcribe Diarize 0.9B, pero los valores numéricos no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 908 millones de parámetros, en precisión completa (FP16) los pesos ocupan aproximadamente 1,8 GB, y en cuantización de 8 bits alrededor de 0,9 GB, más el overhead del encoder de audio y del contexto de audio largo.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, debería caber en GPU de consumo con suficiente VRAM (por ejemplo, RTX 4090 con 24 GB) para audio de duración moderada; para audio de hasta 90 minutos y lotes grandes se recomiendan GPU de datacenter (A100, H100).
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 0,9B, aunque la VRAM real depende de la longitud del audio y del backend.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, vLLM y SGLang según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Diarización integrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize 0.9B | 0,9B | Hasta 90 min en una pasada | Sí | Apache 2.0 | Hugging Face (hf-audio) |
| GPT-4o | No disponible | No disponible | No disponible (evaluado en Movies) | Propietaria | API |
| Gemini 2.5 Pro / 3 Pro | No disponible | No disponible | No disponible (evaluado en varios sets) | Propietaria | API |
| ElevenLabs | No disponible | No disponible | No disponible (evaluado en varios sets) | Propietaria | API |
| Doubao | No disponible | No disponible | No disponible (evaluado en varios sets) | Propietaria | API |

MOSS-Transcribe-Diarize 0.9B se distingue por ser el único de la comparativa con pesos abiertos, licencia Apache 2.0 y diarización integrada en una sola pasada sobre audio de hasta 90 minutos.

## Limitaciones y advertencias

- Los metadatos de la ficha solo declaran inglés y chino, aunque la model card afirma soporte para más de 50 idiomas; conviene validar el rendimiento en el idioma objetivo antes de producción.
- No se han publicado en la información disponible los valores de CER/cpCER del propio modelo en los benchmarks de la model card, por lo que no se puede verificar cuantitativamente su ventaja frente a los competidores.
- Riesgo de alucinación inherente a los modelos generativos: pueden aparecer palabras o segmentos inventados en audio con ruido, solapamiento de hablantes o acentos no vistos.
- Las etiquetas de hablante son anónimas (`[S01]`, `[S02]`); la asignación de identidades reales requiere un paso posterior.
- La longitud de contexto en tokens no está documentada; el límite práctico es de 90 minutos de audio por pasada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo en entornos sensibles.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del repositorio y de los modelos base empleados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hf-audio/MOSS-Transcribe-Diarize-HF
- Modelo original en Hugging Face (OpenMOSS-Team): https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-Transcribe-Diarize
- Paper en arXiv: https://arxiv.org/abs/2601.01554
- 2nd MLC-SLM Challenge (INTERSPEECH 2026): https://www.nexdata.ai/competition/mlc-slm
