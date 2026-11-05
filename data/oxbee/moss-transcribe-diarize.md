# OxBee/MOSS-Transcribe-Diarize

## Resumen

MOSS-Transcribe-Diarize 0.9B es un modelo end-to-end de comprensión de audio desarrollado por el equipo OpenMOSS (publicado en el repositorio de HuggingFace bajo el usuario OxBee). Resuelve un problema clásico de los pipelines de transcripción: la necesidad de encadenar un sistema ASR y un sistema de diarización independientes, con el consiguiente coste de integración y las inconsistencias entre ambos. El modelo realiza transcripción y diarización conjunta en una sola pasada, generando texto con marcas temporales y etiquetas anónimas de hablante (`[S01]`, `[S02]`, etc.).

Con aproximadamente 908 millones de parámetros, el modelo está pensado para audio de formato largo: según la model card, admite grabaciones de hasta 90 minutos en una sola inferencia y cubre más de 50 idiomas, aunque la metadata oficial del repositorio declara únicamente inglés (`en`) y chino (`zh`). Incorpora además *prompting* configurable con hotwords para terminología de dominio y anotaciones de eventos acústicos.

Su relevancia actual viene respaldada por el primer puesto obtenido en el 2nd MLC-SLM Challenge de INTERSPEECH 2026, en una competición que abarcó 14 idiomas, y por unos resultados de evaluación que lo sitúan competitivo frente a sistemas propietarios como Gemini 3 Pro, GPT-4o o ElevenLabs en métricas de error de caracteres y diarización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal audio-texto con código remoto personalizado de Transformers (`moss_transcribe_diarize`); el detalle interno de la arquitectura no está especificado en la información disponible |
| Parametros totales | 908.513.280 (≈0,9B, dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como valor numérico; la model card indica soporte de audio de hasta 90 minutos en una sola pasada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Metadata del repo: `en`, `zh`. La model card declara más de 50 idiomas para transcripción y diarización; el MLC-SLM Challenge cubrió 14 idiomas (inglés, francés, alemán, italiano, portugués, español, japonés, coreano, ruso, tailandés, vietnamita, tagalo, urdu y turco) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,8 GB), con código remoto personalizado requerido (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de describirla como un modelo multimodal de audio a texto que integra transcripción y diarización en un único pase. El repositorio incluye código remoto personalizado de Transformers (tag `custom_code`), necesario para cargar el modelo, y una imagen de arquitectura referenciada en la model card pero cuyo contenido no se describe textualmente.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. La innovación técnica destacable que sí está documentada es la generación *promptable*: el modelo acepta instrucciones de transcripción personalizadas, hotwords para vocabulario específico de dominio y anotaciones de eventos acústicos, todo dentro de una salida compacta con etiquetas de hablante y marcas temporales.

## Capacidades

- Transcripción de audio de formato largo con marcas temporales, en una sola pasada sobre grabaciones de hasta 90 minutos.
- Diarización de hablantes integrada, con etiquetas anónimas consistentes (`[S01]`, `[S02]`, ...) sin pipeline separado.
- Procesamiento conjunto de audio y vídeo como entrada.
- Generación *promptable*: instrucciones de transcripción personalizadas y hotwords para terminología específica de dominio.
- Anotación de eventos acústicos, aportando contexto adicional sobre lo ocurrido en la grabación.
- Cobertura multilingüe declarada de más de 50 idiomas (metadata oficial limitada a inglés y chino).
- Salida en formato de subtítulos, con soporte de una interfaz web de subtitulado en chino simplificado e inglés.
- Compatibilidad con despliegue en vLLM y SGLang, según la model card.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso ni modo *thinking*.

## Casos de uso

- Actas de reuniones: el modelo transcribe y separa hablantes en una sola pasada sobre grabaciones de hasta 90 minutos, lo que permite generar actas con atribución de intervenciones sin montar un pipeline ASR + diarización por separado.
- Subtitulado de vídeo y podcasts: la salida con marcas temporales y etiquetas de hablante encaja directamente en flujos de generación de subtítulos; la interfaz web de subtitulado incluida facilita la revisión humana.
- Transcripción de entrevistas y periodismo: la diarización integrada permite distinguir entrevistador y entrevistado en conversaciones largas, y las hotwords ayudan a fijar nombres propios y cargos.
- Documentación clínica o legal con vocabulario especializado: el *prompting* con hotwords permite incorporar terminología de dominio para reducir errores en términos técnicos recurrentes.
- Análisis de *call centers*: la combinación de transcripción, etiquetas de hablante y eventos acústicos permite construir métricas de conversación (turnos, duración por hablante) y alimentar sistemas de control de calidad.
- Investigación lingüística y corpus multilingües: con cobertura declarada de más de 50 idiomas, el modelo puede emplearse para transcribir corpus de campo con múltiples hablantes de forma homogénea.
- Indexación y búsqueda de archivos de audio: la transcripción con marcas temporales permite construir índices buscables sobre vídeotecas o archivos de reuniones, localizando el momento exacto de una intervención.

## Benchmarks y rendimiento

La model card reporta CER (Character Error Rate), cpCER (concatenated minimum-permutation CER) y Δcp (Delta-cp); en las tres métricas, menor es mejor. El guion indica resultado no disponible.

| Modelo | AISHELL-4 CER / cpCER / Δcp | Alimeeting CER / cpCER / Δcp | Podcast CER / cpCER / Δcp | Movies CER / cpCER / Δcp |
|---|---|---|---|---|
| Doubao | 18,18 / 27,86 / 9,68 | 25,25 / 37,57 / 12,31 | 7,93 / 10,54 / 2,61 | 9,94 / 30,88 / 20,94 |
| ElevenLabs | 19,58 / 37,95 / 18,36 | 25,70 / 36,69 / 10,99 | 8,50 / 11,34 / 2,85 | 11,49 / 17,85 / 6,37 |
| GPT-4o | - / - / - | - / - / - | - / - / - | 14,37 / 23,67 / 9,31 |
| Gemini 2.5 Pro | 42,70 / 53,42 / 10,72 | 27,43 / 41,64 / 14,21 | 7,38 / 10,23 / 2,85 | 15,46 / 24,15 / 8,69 |
| Gemini 3 Pro | 22,75 / 27,43 / 4,68 | 26,75 / 32,84 / 6,09 | - / - / - | 8,62 / 14,73 / 6,11 |
| VIBEVOICE ASR | 21,40 / 24,99 / 3,59 | 27,40 / 29,33 / 1,93 | 27,94 / 48,30 / 20,36 | - / - / - |

Los resultados correspondientes a MOSS-Transcribe-Diarize no aparecen en el extracto de la model card disponible en la información proporcionada; la tabla anterior recoge únicamente los modelos de referencia citados. No se han publicado en la información disponible resultados propios del modelo en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 908,5 millones de parámetros y pesos en safetensors (repo de 1,8 GB), la inferencia en precisión original requiere del orden de 2 GB solo para pesos, más memoria para el codificador de audio, cachés y audio de entrada; las cifras exactas no están publicadas.
- GPU recomendadas: no especificadas en la información disponible.
- ¿Cabe en GPU de consumo? Por tamaño de parámetros (≈0,9B) es plausible en GPUs de consumo con VRAM suficiente, pero no hay confirmación oficial ni requisitos publicados.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; la model card menciona servir con vLLM y SGLang; también se ofrece una aplicación web de subtítulos. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize 0.9B | ≈0,9B | Hasta 90 min de audio en una pasada | Metadata: en, zh; declarados 50+ | Apache 2.0 | Pesos abiertos en HuggingFace |
| Doubao | no disponible | no disponible | no disponible | propietaria (servicio) | API/servicio |
| ElevenLabs | no disponible | no disponible | no disponible | propietaria (servicio) | API/servicio |
| Gemini 3 Pro | no disponible | no disponible | no disponible | propietaria (servicio) | API/servicio |
| VIBEVOICE ASR | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa entre estos sistemas debe hacerse con la tabla de benchmarks de la sección anterior, dado que los competidores son servicios propietarios sin especificaciones de parámetros publicadas. En AISHELL-4, el mejor Δcp de la tabla es el de VIBEVOICE ASR (3,59) y el mejor CER el de Doubao (18,18); en Movies, el mejor CER es el de Gemini 3 Pro (8,62) y el mejor Δcp el de Gemini 3 Pro (6,11, subrayado en la model card).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo de ASR y diarización, es esperable que herede sesgos acústicos y lingüísticos de sus datos de entrenamiento, pero no hay evidencia publicada al respecto.
- Riesgo de alucinacion: la información disponible no cuantifica el riesgo de texto generado sin respaldo acústico; en tareas de transcripción generativa conviene validar las salidas en dominios críticos.
- Limitaciones de contexto e idioma: la metadata oficial del repositorio declara solo inglés y chino, mientras que la model card afirma más de 50 idiomas; esta discrepancia debe tenerse en cuenta al planificar despliegues multilingües. El límite de 90 minutos por pasada acota la longitud de audio procesable de una vez.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar ese código antes de producción.
- Caveats para producción: el modelo es reciente (publicado el 2 de noviembre de 2026 según la metadata del repo) y cuenta con muy poca tracción en HuggingFace (27 descargas, 0 likes), por lo que la comunidad de validación independiente es todavía reducida. La ausencia de requisitos de hardware y de resultados propios en el extracto de benchmarks limita la planificación de capacidad. Las etiquetas de hablante son anónimas (`[S01]`, `[S02]`), no identidades reales, y requieren un paso posterior de mapeo si se necesita atribución nominal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OxBee/MOSS-Transcribe-Diarize
- Repositorio oficial en HuggingFace: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- GitHub: https://github.com/OpenMOSS/MOSS-Transcribe-Diarize
- Paper en arXiv: https://arxiv.org/abs/2601.01554
- Demo (MOSS Playground): https://platform.moss.cn/app/playground/
- 2nd MLC-SLM Challenge (INTERSPEECH 2026): https://www.nexdata.ai/competition/mlc-slm
