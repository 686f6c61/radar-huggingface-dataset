# OpenMOSS-Team/MOSS-Transcribe-Diarize

## Resumen

MOSS-Transcribe-Diarize 0.9B es un modelo de comprensión de audio de extremo a extremo desarrollado por el equipo OpenMOSS, orientado a la transcripción de audio de formato largo con diarización de hablantes integrada. A diferencia de los pipelines tradicionales que encadenan un sistema ASR y un sistema de diarización independientes, este modelo realiza ambas tareas de forma conjunta en una sola pasada, generando transcripciones alineadas temporalmente con etiquetas anónimas de hablante como `[S01]` y `[S02]`.

El modelo cuenta con 908.513.280 parámetros (aproximadamente 0,9B) y está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su principal innovación es la capacidad de procesar grabaciones de hasta 90 minutos en una única inferencia, manteniendo coherencia en las etiquetas de hablante a lo largo de toda la grabación, algo que los sistemas fragmentados por ventanas suelen perder.

Es relevante ahora porque cubre un caso de uso muy demandado en producción —transcripción de reuniones, llamadas, pódcasts y entrevistas con separación de interlocutores— con un modelo compacto que cabe en hardware modesto, y porque ganó el primer puesto en el 2nd MLC-SLM Challenge de INTERSPEECH 2026 en 14 idiomas. El repositorio acumula más de 140.000 descargas y 525 likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal audio-texto de extremo a extremo (transformers con código remoto personalizado, `trust_remote_code=True`) |
| Parametros totales | 908.513.280 (~0,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; soporta audio de hasta 90 minutos en una sola pasada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 50+ idiomas para transcripción y diarización; la model card declara `en` y `zh` como idiomas principales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,7 GB) |

## Arquitectura y entrenamiento

La model card describe el modelo como un sistema de comprensión de audio de extremo a extremo que realiza conjuntamente transcripción y diarización, en lugar de encadenar módulos separados de ASR y diarización. El repositorio incluye el código remoto personalizado necesario para cargar el modelo con Transformers mediante `trust_remote_code=True`, lo que indica que la implementación no está integrada en la librería estándar. La arquitectura interna detallada (tipo de encoder de audio, mecanismo de atención, composición exacta de capas) no se especifica en la información disponible.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas internas como decodificación especulativa o atención lineal. La innovación destacable a nivel de producto es la inferencia en una sola pasada sobre audio de hasta 90 minutos con etiquetas de hablante consistentes, además del soporte de *prompting* con instrucciones personalizadas, hotwords para terminología de dominio y anotaciones de eventos acústicos.

## Capacidades

- Transcripción de audio y vídeo de formato largo con marcas de tiempo.
- Diarización de hablantes integrada, con etiquetas anónimas consistentes (`[S01]`, `[S02]`, etc.) a lo largo de toda la grabación.
- Inferencia en una sola pasada sobre grabaciones de hasta 90 minutos.
- Transcripción y diarización en más de 50 idiomas.
- *Prompting* personalizable: instrucciones de transcripción, hotwords para términos específicos de dominio y anotaciones de eventos acústicos.
- Generación de transcripciones compactas conscientes del hablante en un único paso.
- Capacidad multimodal audio-texto (pipeline `audio-text-to-text`).
- Compatibilidad con endpoints y despliegue mediante vLLM y SGLang según la model card.
- Interfaz web de subtítulos con soporte para chino simplificado e inglés.

## Casos de uso

- Actas de reuniones corporativas: el modelo procesa la grabación completa de una reunión de hasta 90 minutos en una sola pasada y devuelve la transcripción con etiquetas de hablante, lo que permite generar actas atribuidas a cada participante sin post-procesar la salida de dos sistemas separados.
- Transcripción de llamadas de atención al cliente: la diarización integrada permite distinguir agente y cliente en conversaciones multi-turno, y las marcas de tiempo facilitan la auditoría y el análisis de calidad por segmentos.
- Subtitulado de vídeo y pódcasts: la generación de transcripciones con timestamps y la interfaz web de subtítulos permiten producir ficheros de subtítulos alineados temporalmente, con soporte de chino e inglés en la UI.
- Entrevistas y periodismo: grabaciones largas de entrevistas se transcriben con separación de interlocutores, lo que acelera la extracción de citas atribuidas a cada persona.
- Documentación clínica o legal: con hotwords de dominio, el modelo puede reconocer terminología especializada (fármacos, términos jurídicos) y producir transcripciones atribuidas por hablante para revisión posterior.
- Análisis de contenido multimedia a escala: las anotaciones de eventos acústicos y las etiquetas de hablante permiten enriquecer índices de búsqueda sobre archivos de audio y vídeo, identificando quién habló y cuándo.
- Investigación en lingüística y ciencias sociales: la cobertura de más de 50 idiomas y la salida estructurada facilitan el análisis de corpus orales multilingües con separación de participantes.

## Benchmarks y rendimiento

Métricas de evaluación: CER (Character Error Rate), cpCER (concatenated minimum-permutation CER) y Delta-cp. Menor es mejor. El guion indica resultado no disponible.

| Modelo | AISHELL-4 CER | AISHELL-4 cpCER | AISHELL-4 Δcp | Alimeeting CER | Alimeeting cpCER | Alimeeting Δcp | Podcast CER | Podcast cpCER | Podcast Δcp | Movies CER | Movies cpCER | Movies Δcp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Doubao | 18,18 | 27,86 | 9,68 | 25,25 | 37,57 | 12,31 | 7,93 | 10,54 | 2,61 | 9,94 | 30,88 | 20,94 |
| ElevenLabs | 19,58 | 37,95 | 18,36 | 25,70 | 36,69 | 10,99 | 8,50 | 11,34 | 2,85 | 11,49 | 17,85 | 6,37 |
| GPT-4o | - | - | - | - | - | - | - | - | - | 14,37 | 23,67 | 9,31 |
| Gemini 2.5 Pro | 42,70 | 53,42 | 10,72 | 27,43 | 41,64 | 14,21 | 7,38 | 10,23 | 2,85 | 15,46 | 24,15 | 8,69 |
| Gemini 3 Pro | 22,75 | 27,43 | 4,68 | 26,75 | 32,84 | 6,09 | - | - | - | 8,62 | 14,73 | 6,11 |
| VIBEVOICE ASR | 21,40 | 24,99 | 3,59 | 27,40 | 29,33 | 1,93 | 27,94 | 48,30 | 20,36 | - | - | - |

Los resultados de MOSS-Transcribe-Diarize en esta tabla no están disponibles en la información proporcionada; la model card incluye la tabla comparativa con modelos de referencia pero los valores del propio modelo no se han facilitado en el extracto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 908,5 millones de parámetros y pesos en safetensors (repo de 3,7 GB), la inferencia en precisión completa requiere del orden de 3,5-4 GB solo para pesos; con cuantización a 8 bits o 4 bits el requisito baja sustancialmente, aunque los tipos de cuantización soportados no están documentados.
- GPU recomendadas: no disponible de forma explícita en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo con suficiente VRAM; una RTX 4090 (24 GB) o RTX 3090 (24 GB) cubren con holgura la inferencia en precisión completa, y GPU de 8-12 GB podrían ser suficientes con cuantización.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque el dato exacto no está confirmado en la documentación.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; la model card menciona servir con vLLM y SGLang; también se ofrece una aplicación web de subtítulos.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Diarización integrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize 0.9B | ~0,9B | Hasta 90 min en una pasada | 50+ | Sí, en una sola pasada | Apache 2.0 | Hugging Face, código remoto |
| Doubao (ASR) | no disponible | no disponible | no disponible | no disponible | propietaria | servicio comercial |
| ElevenLabs (ASR) | no disponible | no disponible | no disponible | no disponible | propietaria | servicio comercial |
| Gemini 2.5 Pro / 3 Pro | no disponible | no disponible | multilingüe | parcial (vía prompting multimodal) | propietaria | API comercial |

La comparativa se limita a los modelos presentes en la tabla de evaluación de la model card. MOSS-Transcribe-Diarize se distingue por ser el único de la comparativa con pesos abiertos y licencia Apache 2.0, frente a alternativas propietarias servidas como API.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; como todo sistema ASR, puede presentar peor rendimiento en acentos, dialectos o condiciones acústicas poco representadas en entrenamiento.
- Riesgo de alucinación: no cuantificado en la documentación; en tareas ASR el riesgo se manifiesta como sustituciones o invenciones de texto en segmentos con ruido o solapamiento de hablantes.
- Limitaciones de contexto: la ventana de audio está acotada a 90 minutos por inferencia; grabaciones más largas requieren segmentación, con el riesgo de perder consistencia en las etiquetas de hablante entre fragmentos.
- Idiomas: aunque se declaran 50+ idiomas, los metadatos del repositorio solo listan `en` y `zh`; la calidad en otros idiomas no está cuantificada en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información proporcionada.
- Caveats de producción: requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio; conviene auditar ese código antes de desplegarlo en entornos productivos. La integración con vLLM y SGLang se menciona pero no se detalla la versión mínima compatible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-Transcribe-Diarize
- Paper en arXiv: https://arxiv.org/abs/2601.01554
- Demo en MOSS Playground: https://platform.moss.cn/app/playground/
- 2nd MLC-SLM Challenge (INTERSPEECH 2026): https://www.nexdata.ai/competition/mlc-slm
