# smajji/nemotron-hinglish-v15

## Resumen

Nemotron-Hinglish-v15 (también referido como Mevine ASR) es un modelo de reconocimiento automático del habla (ASR) en streaming, bilingüe hindi/inglés y especializado en habla code-mixed hinglish. Lo publica el usuario smajji en HuggingFace y se construye por fine-tuning de `nvidia/nemotron-3.5-asr-streaming-0.6b`, un modelo cache-aware con arquitectura FastConformer-RNNT de aproximadamente 0,6 mil millones de parámetros. El repositorio ocupa 2,6 GB y usa la librería NeMo de NVIDIA.

El problema que aborda es concreto: el reconocimiento de habla hindú-inglesa mezclada (código mezclado intra-frase), un escenario frecuente en la India y mal cubierto por los ASR monolingües. Según la model card, esta es la decimoquinta iteración de la línea Mevine y se inicializa en caliente desde el mejor checkpoint de la v13, añadiendo el corpus académico de inglés indio `nptel_ai4bharat` (unas 3.700 horas) para recuperar el inglés limpio e indio sin degradar el rendimiento en hinglish code-mixed.

Su relevancia es doble: por un lado, demuestra que un modelo de solo 0,6B parámetros puede sostener transcripción en streaming con latencia baja en GPU de consumo; por otro, documenta explícitamente el compromiso entre inglés limpio y code-mixed a lo largo de quince iteraciones. No hay campo de pipeline, licencia ni idiomas declarados en los metadatos del repositorio, y el modelo acumula cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-RNNT cache-aware, streaming (hereda de `nvidia/nemotron-3.5-asr-streaming-0.6b`) |
| Parametros totales | ~0,6 mil millones (0,6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de ASR en streaming por chunks; la model card no especifica ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (estándar, indio y técnico), hindi y hinglish code-mixed, según la model card; el campo de idiomas del repositorio aparece como no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible explícitamente; repositorio de 2,6 GB gestionado con la librería NeMo |

## Arquitectura y entrenamiento

La arquitectura es una FastConformer con decodificador RNNT y mecanismo cache-aware, lo que permite inferencia en streaming con estado de caché entre chunks en lugar de requerir la ventana completa de audio. El modelo es un fine-tuning del checkpoint de NVIDIA `nemotron-3.5-asr-streaming-0.6b` y se inicializa desde el mejor checkpoint de la iteración v13 de la propia línea Mevine. No se documentan innovaciones adicionales sobre la arquitectura base (no hay decodificación especulativa, atención lineal ni mecanismos híbridos SSM descritos en la información disponible).

El entrenamiento usa 3.038.620 enunciados y 6.906 horas de audio, con una composición declarada de aproximadamente 63% inglés, 22% hindi y 15% hinglish/code-mixed. El bloque inglés incluye NPTEL (con `nptel_ai4bharat`, unas 3.700 horas), SPGISpeech, IndicTTS-Eng, india_accent_cv, NPTEL-tech, peoples_speech, IISc-SPICOR, earnings22 y FLEURS-en. El bloque hindi incluye Shrutilipi, Hindi-1482Hrs, audio stories, IndicVoices-R y FLEURS-hi. El bloque code-mixed incluye hinglish_cc, MUCS, OpenSLR104, UJS, hinglish_casual y Roopa numbers. El preprocesado aplica normalización de dígitos por enunciado. No se mencionan fases de RLHF, DPO ni optimización por preferencias, algo esperable en un modelo ASR.

## Capacidades

- Transcripción de voz a texto en streaming con estado de caché, adecuada para audio continuo.
- Reconocimiento de inglés estándar, inglés con acento indio e inglés técnico/académico.
- Reconocimiento de hindi (evaluado sobre conjuntos no vistos, `hi_unseen`).
- Reconocimiento de habla code-mixed hinglish dentro de la misma frase, incluyendo números mezclados.
- Normalización de dígitos por enunciado durante el entrenamiento, orientada a la transcripción de cifras dictadas.
- Idiomas soportados: inglés, hindi y hinglish. No se declara soporte de otros idiomas.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión ni audio más allá de la propia transcripción.
- No se especifica si el modelo emite puntuación, mayúsculas, marcas de tiempo o diarización.

## Casos de uso

- Transcripción de reuniones y clases en entornos indios: el modelo está entrenado con dominio académico NPTEL y con acento indio, por lo que es apropiado para grabar clases o seminarios donde el ponente alterna inglés técnico e hindi.
- Subtitulado en directo de contenido bilingüe: al ser streaming y cache-aware, puede alimentar pipelines de subtitulado con latencia baja sobre audio que cambia de idioma dentro de la misma intervención.
- Atención al cliente en centros de contacto indios: las conversaciones reales mezclan hindi e inglés de forma constante; el modelo está optimizado específicamente para ese registro.
- Análisis de llamadas y control de calidad: transcripción de grabaciones para búsqueda de palabras clave, cumplimiento normativo y análisis de sentimiento en un pipeline posterior de NLP.
- Dictado de cifras y datos estructurados: la normalización de dígitos por enunciado y el rendimiento declarado en `roopa numbers` (7,7% en v15) lo hacen útil para captura de importes, referencias o identificadores dictados.
- Indexación y búsqueda de archivos de audio históricos: transcripción por lotes de repositorios de audio en inglés indio/hindi para hacerlos buscables.
- Asistentes de voz en dispositivos con GPU modesta: con 0,6B parámetros el modelo cabe en GPU de consumo, lo que permite despliegues locales sin enviar audio a la nube (sujeto a que la licencia, hoy no declarada, lo permita).
- Preprocesado para pipelines de voz a voz: la transcripción en streaming puede alimentar un LLM posterior para resumen o extracción de acciones, aunque esta integración no está documentada por el autor.

## Benchmarks y rendimiento

La model card publica una comparativa de métricas (en porcentaje, presumiblemente tasa de error de palabra; el autor no especifica la métrica exacta) entre las versiones v10, v13 y v15 sobre 12 conjuntos de datos.

| Conjunto | v10 | v13 | v15 |
|---|---|---|---|
| en_clean | 4,2% | 5,6% | 4,5% |
| en_indian | 14,6% | 16,7% | 15,4% |
| en_tech | 12,5% | 11,8% | 11,8% |
| hi_unseen | 7,1% | 6,7% | 6,7% |
| hinglish (MUCS) | 42,9% | 33,3% | 30,4% |
| code-mixed numbers (roopa) | 12,0% | 8,2% | 7,7% |
| code-mixed OpenSLR104 | 37,5% | 36,9% | 32,3% |
| Overall (12 conjuntos) | 14,3% | 13,6% | 13,8% |

El autor afirma que v15 es la versión mejor equilibrada: mejor inglés limpio (4,5%) y mejor inglés indio (15,4%) de la línea fine-tuneada, y a la vez mejor hinglish code-mixed (30,4% en MUCS y 7,7% en roopa). No se han publicado en la información disponible resultados comparativos con modelos ASR de otros autores (Whisper, Canary, Parakeet, IndicWhisper u otros), ni la metodología de evaluación, ni los tamaños de los conjuntos de test. El informe completo se remite a un archivo `BENCHMARKS.md` del propio repositorio.

## Requisitos de hardware

- VRAM estimada: con 0,6B parámetros, los pesos en FP32 ocupan aproximadamente 2,4 GB y en FP16 alrededor de 1,2 GB. Añadiendo cachés de atención y buffers de decodificación RNNT, un presupuesto práctico de 2 a 4 GB de VRAM es suficiente. Estas cifras son estimaciones a partir del tamaño del modelo, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. El modelo está pensado para despliegues de baja huella; GPU de datacenter como A100 o H100 funcionarían pero están sobredimensionadas para 0,6B parámetros.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y equivalentes, así como en portátiles con GPU discreta de gama media.
- Opciones de despliegue: la librería declarada es NeMo, por lo que el camino natural es el runtime de NeMo o NVIDIA Riva para servicio en streaming. vLLM, TGI y llama.cpp no son aplicables a una arquitectura FastConformer-RNNT, ya que están orientados a modelos de lenguaje generativos.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia, RTF ni factor de tiempo real en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nemotron-hinglish-v15 | ~0,6B | FastConformer-RNNT streaming | inglés, hindi, hinglish | no disponible | HuggingFace (0 descargas, 0 likes) |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~0,6B | FastConformer-RNNT streaming | no disponible en la información proporcionada | no disponible | modelo base del fine-tuning |
| Mevine v13 (misma línea) | ~0,6B | FastConformer-RNNT streaming | inglés, hindi, hinglish | no disponible | checkpoint previo; sin repositorio enlazado en la información disponible |

La comparación con alternativas de otros autores (familia Whisper de OpenAI, Canary de NVIDIA, Parakeet, IndicWhisper de AI4Bharat) no está disponible: no se aportan datos de rendimiento ni especificaciones de esos modelos en la información consultada, y la model card no los usa como referencia.

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, redistribución o modificación. Tratar como no apto para producción comercial hasta que el autor lo aclare.
- Tasa de error elevada en code-mixed: incluso la mejor versión declara un 30,4% en MUCS y un 32,3% en OpenSLR104. No es un modelo de precisión alta en hinglish, sino el mejor de una serie concreta.
- Caída de rendimiento en habla espontánea y acentos no indios: `en_indian` (15,4%) y `en_tech` (11,8%) están muy por debajo de `en_clean` (4,5%), lo que indica sensibilidad al acento y al dominio.
- Sesgo de dominio: el 63% del entrenamiento es inglés, con un peso importante de corpus académicos NPTEL. El rendimiento en dominios conversacionales no académicos no está documentado.
- Cobertura lingüística cerrada: solo inglés, hindi y hinglish. No hay soporte declarado de otras lenguas indias ni de español.
- Riesgo de alucinación en ASR: como todo modelo seq2seq con decodificador RNNT, puede generar sustituciones e inserciones plausibles en audio ruidoso, con más probabilidad en tramos code-mixed o con cifras.
- Metadatos incompletos: pipeline, idiomas y licencia aparecen como no disponibles en HuggingFace, lo que dificulta el descubrimiento y la integración automatizada.
- Repositorio sin validación externa: cero descargas y cero likes, sin revisión por pares ni informe de evaluación independiente. Las métricas son autoinformadas por el autor.
- Métrica no especificada con precisión: la model card no aclara si los porcentajes de la tabla son WER, CER u otra medida, ni describe los conjuntos de evaluación.
- Fechas del repositorio: el registro indica creación y última actualización en septiembre de 2026, posteriores a la fecha habitual de consulta; conviene verificar la vigencia del artefacto antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smajji/nemotron-hinglish-v15
- Informe de benchmarks citado en la model card: https://huggingface.co/smajji/nemotron-hinglish-v15/blob/main/BENCHMARKS.md
- Modelo base del fine-tuning: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados no guardan relación con el repositorio ni con ASR. No se dispone por tanto de paper, blog, repositorio de código ni demo adicionales.
