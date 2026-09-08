# itazap/MOSS-Transcribe-Diarize-HF

## Resumen

MOSS-Transcribe-Diarize 0.9B es un modelo de comprensión de audio de extremo a extremo desarrollado por OpenMOSS-Team, publicado en HuggingFace bajo el identificador `itazap/MOSS-Transcribe-Diarize-HF` (una copia del repositorio original `OpenMOSS-Team/MOSS-Transcribe-Diarize`). Resuelve el problema de la transcripción larga multi-hablante combinando reconocimiento de voz (ASR), diarización de hablantes, generación de marcas de tiempo y detección de eventos acústicos en una sola pasada, sin necesidad de encadenar sistemas separados.

El modelo tiene aproximadamente 908 millones de parámetros (0.9B) y es capaz de procesar grabaciones de audio de hasta 90 minutos de duración en una única inferencia. Genera transcripciones estructuradas con etiquetas anónimas de hablante como `[S01]`, `[S02]`, etc., junto con timestamps. Soporta más de 50 idiomas según la model card, aunque los tags de HuggingFace listan explícitamente inglés y chino. En julio de 2026 ganó el primer puesto en el 2nd MLC-SLM Challenge en INTERSPEECH 2026 en 14 idiomas.

La arquitectura exacta no está especificada en la información disponible, pero se trata de un modelo multimodal de audio a texto que requiere código personalizado para cargarse con Transformers (`trust_remote_code=True`). Destaca por su capacidad de prompt personalizado, soporte de hotwords y anotación de eventos acústicos, lo que lo hace relevante para aplicaciones de transcripción en entornos reales con múltiples hablantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal audio-text-to-text basado en Transformer) |
| Parametros totales | 908.513.280 (~0.9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 90 minutos de audio; contexto de texto no especificado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | más de 50 idiomas según la model card; tags de HuggingFace listan inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MOSS-Transcribe-Diarize 0.9B es un modelo end-to-end de comprensión de audio que integra transcripción y diarización en un único paso de inferencia. En lugar de combinar un sistema ASR con un módulo separado de diarización, el modelo produce directamente un transcript estructurado con etiquetas de hablante y timestamps, además de poder emitir anotaciones de eventos acústicos. La arquitectura interna no está detallada en la información proporcionada, aunque se indica que es un modelo multimodal de audio a texto.

Los datos de entrenamiento no están especificados en la documentación disponible. No se menciona si se aplicaron técnicas de RLHF, DPO o alineación por preferencias. La innovación técnica destacable incluye la generación promptable: el modelo acepta instrucciones personalizadas de transcripción, hotwords para términos específicos de dominio y anotaciones de eventos acústicos. Esta capacidad permite adaptar el comportamiento del modelo a contextos particulares sin reentrenamiento.

## Capacidades

- Transcripción de audio largo: procesa grabaciones de hasta 90 minutos en una sola pasada, generando texto con marcas de tiempo.
- Diarización de hablantes: asigna etiquetas anónimas como `[S01]`, `[S02]`, etc., sin necesidad de un pipeline separado de diarización.
- Anotación de eventos acústicos: puede emitir anotaciones de eventos sonoros, proporcionando una visión más rica del contenido.
- Prompt personalizado: acepta instrucciones de transcripción, hotwords y anotaciones específicas definidas por el usuario.
- Soporte multilingüe: según la model card, cubre más de 50 idiomas, con soporte explícito para inglés y chino.
- Salida estructurada: genera un transcript compacto con hablantes y timestamps en formato legible para downstream systems.
- No se menciona soporte de tool calling, función de visión ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones de negocios: el modelo convierte grabaciones de reuniones en actas textuales con identificación de hablantes y timestamps, facilitando la revisión y búsqueda de decisiones. Es adecuado por su capacidad de procesar audio largo de hasta 90 minutos en una sola pasada.
- Subtitulado de podcasts y videos: genera subtítulos sincronizados con etiquetas de hablante, lo que permite publicar contenido accesible sin herramientas adicionales de diarización.
- Análisis de llamadas de atención al cliente: permite distinguir automáticamente entre agente y cliente, generando transcripciones con marcas de tiempo que pueden integrarse en sistemas de análisis de calidad y cumplimiento.
- Entrevistas y testimonios: produce transcripciones con hablantes diferenciados, útil para periodistas, investigadores y productores de contenido que necesitan citar de forma precisa.
- Accesibilidad para personas con discapacidad auditiva: genera subtítulos con timestamps para contenido audiovisual, mejorando la accesibilidad en plataformas educativas y de entretenimiento.
- Archivo y búsqueda de contenido audiovisual: crea índices textuales con hablantes y tiempos, permitiendo búsquedas semánticas y recuperación de fragmentos específicos en grandes colecciones de audio.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación comparativa con métricas de Character Error Rate (CER), concatenated minimum-permutation Character Error Rate (cpCER) y Delta-cp en cuatro datasets: AISHELL-4, Alimeeting, Podcast y Movies. Los resultados del modelo MOSS-Transcribe-Diarize 0.9B aparecen truncados en la información proporcionada, por lo que no se incluyen aquí. Se muestran los resultados de otros sistemas para referencia.

| Modelo | AISHELL-4 (CER/cpCER/Δcp) | Alimeeting (CER/cpCER/Δcp) | Podcast (CER/cpCER/Δcp) | Movies (CER/cpCER/Δcp) |
|---|---|---|---|---|
| Doubao | 18.18 / 27.86 / 9.68 | 25.25 / 37.57 / 12.31 | 7.93 / 10.54 / 2.61 | 9.94 / 30.88 / 20.94 |
| ElevenLabs | 19.58 / 37.95 / 18.36 | 25.70 / 36.69 / 10.99 | 8.50 / 11.34 / 2.85 | 11.49 / 17.85 / 6.37 |
| GPT-4o | - / - / - | - / - / - | - / - / - | 14.37 / 23.67 / 9.31 |
| Gemini 2.5 Pro | 42.70 / 53.42 / 10.72 | 27.43 / 41.64 / 14.21 | 7.38 / 10.23 / 2.85 | 15.46 / 24.15 / 8.69 |
| Gemini 3 Pro | 22.75 / 27.43 / 4.68 | 26.75 / 32.84 / 6.09 | - / - / - | 8.62 / 14.73 / 6.11 |
| VIBEVOICE ASR | 21.40 / 24.99 / 3.59 | 27.40 / 29.33 / 1.93 | 27.94 / 48.30 / 20.36 | 14.59 / 42.54 / 27.94 |
| MOSS Transcribe Diarize 0.9B | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con 908 millones de parámetros en FP16, los pesos ocupan aproximadamente 1.8 GB. Considerando activaciones y overhead, se estima un mínimo de 4 GB de VRAM para inferencia básica. No se ofrecen datos oficiales de consumo.
- GPU recomendadas: RTX 3060 o superior para FP16; GPUs de centro de datos como A100 o H100 para procesar lotes grandes o audio muy largo.
- Compatibilidad con GPU de consumo: sí, el modelo es suficientemente pequeño para ejecutarse en GPUs de gama media como RTX 3060, RTX 4070 o similares.
- Opciones de despliegue: compatible con Transformers mediante `trust_remote_code=True`; la model card menciona soporte para vLLM y SGLang. También existe una Web App de subtítulos en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar especificaciones técnicas (parámetros, contexto, licencia, disponibilidad) con modelos alternativos de la misma categoría. La model card compara el rendimiento con APIs comerciales como Doubao, ElevenLabs, GPT-4o y Gemini, así como con sistemas ASR como VIBEVOICE ASR, pero no se proporcionan detalles de sus arquitecturas o tamaños. Por tanto, la comparativa de especificaciones se considera no disponible.

## Limitaciones y advertencias

- El modelo requiere `trust_remote_code=True` para cargarse con Transformers, lo que implica ejecutar código personalizado del autor. Esto supone un riesgo de seguridad si se utiliza fuera de un entorno controlado.
- Los resultados de benchmarks del propio modelo no están disponibles en la información proporcionada, por lo que no se puede verificar su rendimiento real frente a las afirmaciones de la model card.
- La arquitectura exacta y los datos de entrenamiento no están documentados, lo que dificulta la evaluación de sesgos o la reproducibilidad.
- No se menciona soporte de tool calling, funciones de agente ni capacidades de visión.
- El soporte multilingüe se declara en más de 50 idiomas, pero los tags de HuggingFace solo listan inglés y chino; el rendimiento en otros idiomas no está verificado con datos públicos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de código remoto y pesos en safetensors; se recomienda revisar las condiciones de la licencia en el repositorio original.
- No se especifican limitaciones de sesgo o alucinación. Como modelo de transcripción, es susceptible a errores en acentos, ruido de fondo y habla superpuesta.

## Enlaces

- HuggingFace (instancia espejo): https://huggingface.co/itazap/MOSS-Transcribe-Diarize-HF
- HuggingFace (repositorio original): https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- GitHub: https://github.com/OpenMOSS/MOSS-Transcribe-Diarize
- Paper (arXiv): https://arxiv.org/abs/2601.01554
