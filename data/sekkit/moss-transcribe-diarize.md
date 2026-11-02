# sekkit/MOSS-Transcribe-Diarize

## Resumen

MOSS-Transcribe-Diarize 0.9B es un modelo de comprensión de audio de extremo a extremo desarrollado por el equipo OpenMOSS, orientado a la transcripción de audio largo con múltiples hablantes, diarización (asignación de etiquetas de hablante), marcas temporales y detección de eventos acústicos. Frente a los pipelines clásicos que encadenan un sistema ASR y otro de diarización por separado, este modelo realiza ambas tareas de forma conjunta en una sola pasada, generando un transcript compacto con etiquetas anónimas de hablante como `[S01]` y `[S02]`.

El modelo tiene 908.513.280 parámetros (aproximadamente 0,9B) y se distribuye en formato safetensors con código remoto personalizado para `transformers`, por lo que requiere `trust_remote_code=True`. Su propuesta diferencial es la inferencia en una única pasada sobre grabaciones de hasta 90 minutos, algo poco habitual en modelos de este tamaño, junto con soporte declarado de más de 50 idiomas y prompting con hotwords para términos de dominio específico.

Es relevante ahora porque acaba de ganar el primer puesto en el 2nd MLC-SLM Challenge de INTERSPEECH 2026, cubriendo 14 idiomas, y porque ofrece una alternativa open source (Apache 2.0) a servicios propietarios de transcripción con diarización como Doubao, ElevenLabs o Gemini, con resultados competitivos en los conjuntos de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto (detalles internos no disponibles) |
| Parametros totales | 908.513.280 (~0,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en tokens; soporta audio de hasta 90 minutos en una sola pasada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (declarados en la model card); la model card afirma transcripcion en mas de 50 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con codigo remoto personalizado) |

## Arquitectura y entrenamiento

La model card incluye un diagrama de arquitectura (`Model_Architecture.png`) pero no detalla la composición interna de capas, el codificador de audio ni el mecanismo de fusión multimodal. Se trata de un modelo transformer de tipo audio-text-to-text que integra transcripción y diarización en un único proceso generativo: recibe audio o vídeo y emite directamente texto con marcas temporales y etiquetas de hablante, en lugar de depender de dos sistemas independientes acoplados.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. La model card menciona que el modelo admite "promptable generation" con instrucciones personalizadas, hotwords y anotaciones de eventos acústicos, lo que sugiere una fase de ajuste orientada a seguir instrucciones en lenguaje natural. Tampoco se detalla ninguna innovación técnica concreta más allá de la inferencia en una sola pasada sobre audio largo y la generación conjunta de diarización.

## Capacidades

- Transcripción de audio largo con marcas temporales, en una sola pasada sobre grabaciones de hasta 90 minutos.
- Diarización de hablantes integrada, con etiquetas anónimas `[S01]`, `[S02]`, etc., sin pipeline separado.
- Generación condicionada por prompt: instrucciones de transcripción personalizadas y hotwords para vocabulario de dominio específico.
- Anotación de eventos acústicos para enriquecer la salida downstream.
- Procesamiento de audio y vídeo como entrada.
- Capacidades multilingües: la model card declara más de 50 idiomas, aunque los idiomas oficialmente listados en los metadatos son inglés y chino.
- Salida en formato de transcript compacto con estructura hablante-texto-tiempo.
- No se documentan en la información disponible capacidades de tool calling, function calling ni razonamiento multi-paso basado en agentes.

## Casos de uso

- Actas de reuniones: el modelo procesa la grabación completa de una reunión en una sola pasada y devuelve un transcript con etiquetas de hablante y tiempos, lo que permite generar resúmenes atribuidos a cada participante sin post-procesar dos sistemas distintos.
- Subtitulado de vídeo y podcasts: dado un archivo de audio o vídeo, genera subtítulos con marcas temporales y separación de interlocutores, adecuado para publicar contenido multilingüe con la ventana de 90 minutos por pasada.
- Transcripción de entrevistas y periodismo: la diarización integrada permite distinguir entrevistador y entrevistado en grabaciones largas, y los hotwords ayudan a fijar nombres propios y terminología específica.
- Documentación clínica o legal: con hotwords para terminología médica o jurídica, el modelo puede transcribir consultas o declaraciones con atribución de hablante, aunque requiere revisión humana por el riesgo de error en términos críticos.
- Análisis de llamadas de atención al cliente: la salida con tiempos y hablantes facilita métricas de tiempos de habla, turnos y detección de eventos acústicos en grabaciones de centros de contacto.
- Investigación en lingüística y análisis conversacional: la estructura `[S01]`/`[S02]` con timestamps permite cuantificar solapamientos, pausas y distribución de turnos sobre corpus largos sin montar un pipeline ASR + diarización propio.
- Indexación y búsqueda de archivos audiovisuales: transcripciones alineadas temporalmente que alimentan motores de búsqueda o sistemas de recuperación sobre archivos de vídeo y audio de archivo.

## Benchmarks y rendimiento

Resultados publicados en la model card. Métricas CER, cpCER y Δcp; menor es mejor. El guion indica resultado no disponible.

| Modelo | AISHELL-4 CER | AISHELL-4 cpCER | AISHELL-4 Δcp | Alimeeting CER | Alimeeting cpCER | Alimeeting Δcp | Podcast CER | Podcast cpCER | Podcast Δcp | Movies CER | Movies cpCER | Movies Δcp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Doubao | 18,18 | 27,86 | 9,68 | 25,25 | 37,57 | 12,31 | 7,93 | 10,54 | 2,61 | 9,94 | 30,88 | 20,94 |
| ElevenLabs | 19,58 | 37,95 | 18,36 | 25,70 | 36,69 | 10,99 | 8,50 | 11,34 | 2,85 | 11,49 | 17,85 | 6,37 |
| GPT-4o | - | - | - | - | - | - | - | - | - | 14,37 | 23,67 | 9,31 |
| Gemini 2.5 Pro | 42,70 | 53,42 | 10,72 | 27,43 | 41,64 | 14,21 | 7,38 | 10,23 | 2,85 | 15,46 | 24,15 | 8,69 |
| Gemini 3 Pro | 22,75 | 27,43 | 4,68 | 26,75 | 32,84 | 6,09 | - | - | - | 8,62 | 14,73 | 6,11 |
| VIBEVOICE ASR | 21,40 | 24,99 | 3,59 | 27,40 | 29,33 | 1,93 | 27,94 | 48,30 | 20,36 | - | - | - |

La información proporcionada no incluye la fila de resultados del propio MOSS-Transcribe-Diarize en esta tabla, por lo que no es posible presentar sus cifras comparativas directas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 908 millones de parámetros, el peso en precisión completa ronda los 1,8 GB (tamaño del repo), pero no se documentan requisitos de memoria para el codificador de audio ni para el procesamiento de audio de hasta 90 minutos.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del modelo sugiere que podría caber en GPUs de consumo con memoria suficiente, pero no hay datos oficiales.
- Opciones de despliegue: la model card menciona despliegue con vLLM y SGLang, además de uso con `transformers` mediante `trust_remote_code=True`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize 0.9B | ~0,9B | Audio hasta 90 min en una pasada | en, zh declarados; +50 según model card | Apache 2.0 | Pesos abiertos en HuggingFace |
| Doubao | no disponible | no disponible | no disponible | Propietaria | API comercial |
| ElevenLabs | no disponible | no disponible | no disponible | Propietaria | API comercial |
| Gemini 2.5 Pro / 3 Pro | no disponible | no disponible | Multilingüe | Propietaria | API comercial |
| VIBEVOICE ASR | no disponible | no disponible | no disponible | no disponible | no disponible |

En términos de rendimiento, los datos de la tabla de evaluación muestran que los modelos propietarios tienen comportamientos muy dispares según el conjunto: Gemini 3 Pro obtiene los mejores valores en Movies (CER 8,62) y Δcp en AISHELL-4 (4,68), mientras que Doubao lidera en Podcast (CER 7,93) y VIBEVOICE ASR destaca en Δcp de Alimeeting (1,93). La ventaja diferencial de MOSS-Transcribe-Diarize es la combinación de pesos abiertos, licencia Apache 2.0 y diarización integrada en una sola pasada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente sobre datos en inglés y chino, es previsible un sesgo hacia esos idiomas pese a la afirmación de más de 50 idiomas.
- Riesgo de alucinación: no cuantificado; en transcripción, el riesgo se traduce en texto inventado o atribución incorrecta de hablante, especialmente en audio con ruido, solapamientos o acentos no representados en el entrenamiento.
- Limitaciones de contexto: la ventana de audio es de 90 minutos por pasada; grabaciones más largas requieren segmentación, con el riesgo de perder coherencia en las etiquetas de hablante entre segmentos.
- Idiomas: los metadatos oficiales solo listan en y zh; el soporte de más de 50 idiomas proviene de la model card y no está respaldado por benchmarks por idioma en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar ese código antes de desplegarlo en producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la versión indicada es la 0.9B recién publicada; no hay evidencia de uso en producción.
- Dependencia de ecosistema: el despliegue con vLLM y SGLang se menciona en la model card, pero no se detallan versiones compatibles ni configuraciones probadas.
- Evaluación: la tabla publicada no incluye las cifras del propio modelo, lo que impide verificar de forma directa su rendimiento frente a los competidores listados.

## Enlaces

- HuggingFace: https://huggingface.co/sekkit/MOSS-Transcribe-Diarize
- HuggingFace oficial del equipo: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- GitHub: https://github.com/OpenMOSS/MOSS-Transcribe-Diarize
- Paper (arXiv): https://arxiv.org/abs/2601.01554
- Demo (MOSS Playground): https://platform.moss.cn/app/playground/
- 2nd MLC-SLM Challenge (INTERSPEECH 2026): https://www.nexdata.ai/competition/mlc-slm
