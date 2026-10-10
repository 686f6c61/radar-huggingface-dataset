# danish-foundation-models/edda-v0.2-duo

## Resumen

Edda v0.2 duo es un sistema de reconocimiento automático del habla (ASR) para danés desarrollado por Danish Foundation Models. No es un único modelo, sino un ensemble log-lineal de dos modelos Whisper afinados: Edda v0.2 large (basado en openai/whisper-large-v3, 1.543.490.560 parámetros) y Edda v0.2 (basado en openai/whisper-large-v3-turbo, 808.878.080 parámetros). Ambos comparten una única búsqueda por haces: en cada paso de decodificación puntúan los mismos transcripciones parciales y sus log-probabilidades se promedian con peso 0,5 antes de podar los haces.

El modelo resuelve el problema de la transcripción precisa de voz en danés, un idioma con relativamente pocos recursos ASR en comparación con el inglés. Su relevancia actual radica en que supera a cada uno de sus componentes por separado en la mayoría de los conjuntos de evaluación: obtiene un WER medio de 7,94 en el harness del leaderboard abierto de ASR danés, frente a 8,65 de Edda v0.2 large y 8,79 de Edda v0.2. La mejora se consigue porque los dos modelos cometen errores distintos y el ensemble combina las palabras en las que cada uno tiene más confianza.

Técnicamente es un transformer encoder-decoder seq2seq de tipo Whisper, con dos encoders independientes (ambos de 32 capas) y dos decoders de distinta profundidad (32 capas el large, 4 capas el turbo). El repositorio pesa 4,7 GB en fp16 y requiere unos 5 GB de VRAM para los pesos. La licencia es Apache 2.0 y el soporte de idiomas se limita al danés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble log-lineal (producto de expertos) de dos transformers encoder-decoder Whisper; encoder de 32 capas en ambos, decoder de 32 capas (large) y 4 capas (turbo) |
| Parametros totales | 2.352.368.640 (1.543.490.560 del componente large + 808.878.080 del componente turbo) |
| Parametros activos | No aplica: no es un MoE. Ambos modelos puntúan cada token y sus log-probabilidades se promedian al 0,5 |
| Longitud de contexto | Ventana de audio de 30 segundos por tramo; las grabaciones más largas se trocean en ventanas consecutivas de 30 s y se unen las transcripciones. Contexto de texto del decoder: no disponible en la información proporcionada |
| Tipos de cuantizacion | fp16 (único formato publicado en el repositorio). Otras cuantizaciones: no disponibles |
| Idiomas soportados | Danés (da) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16), con los prefijos `large.` y `turbo.` en `model.safetensors`; requiere `custom_code` |

## Arquitectura y entrenamiento

Edda v0.2 duo combina dos modelos Whisper afinados para danés que comparten una sola búsqueda por haces de 5 haces, dirigida por el modelo large. En cada paso, el modelo large calcula las log-probabilidades del siguiente token de cada haz; el modelo turbo calcula sus propias log-probabilidades para los mismos 5 prefijos, manteniendo una caché separada que sigue a los haces cuando se reordenan. Las dos distribuciones se promedian como `0,5 · log p_large + 0,5 · log p_turbo` y la búsqueda conserva las 5 mejores continuaciones según la puntuación promediada. Las transcripciones finales se ordenan por la puntuación promediada y normalizada por longitud. Se trata, por tanto, de un ensemble log-lineal (producto de expertos) y no de una mezcla de expertos: no hay enrutado y ambos modelos participan en todos los tokens.

Los dos componentes son fine-tunes de openai/whisper-large-v3 y openai/whisper-large-v3-turbo respectivamente. Los conjuntos de datos declarados en la model card son CoRal-project/coral-v3, alexandrainst/ftspeech, alexandrainst/nst-da, google/fleurs y mozilla-foundation/common_voice_17_0. No se especifican en la información proporcionada el número total de tokens de audio, la composición exacta del dataset de entrenamiento ni si se aplicaron etapas de RLHF o DPO. La model card tampoco detalla el procedimiento de fine-tuning más allá de los conjuntos de datos. El coste computacional del ensemble es aproximadamente 1,15 veces el del modelo large por sí solo, ya que el decoder de 4 capas del turbo es pequeño en comparación con las 32 capas del large.

## Capacidades

- Reconocimiento automático del habla en danés sobre audio de 16 kHz mono.
- Procesamiento de grabaciones largas mediante troceado automático en ventanas consecutivas de 30 segundos y unión posterior de los fragmentos.
- Decodificación conjunta de dos modelos con búsqueda por haces de 5 haces y puntuación promediada.
- Mejora sobre cada componente individual: en los clips donde ambos modelos discrepan, el par supera a los dos en un 4,5-9,3 % de los casos, según el conjunto de test; empata con el mejor de los dos en un 55-66 % y solo es peor que ambos en un 1,5-2,3 %. En un 5-21 % de los clips genera una transcripción que ninguno de los dos produjo por separado.
- Interfaz programática `model.transcribe([audio], processor)` que acepta una lista de arrays de audio y devuelve una transcripción por array.
- Compatibilidad con los argumentos habituales de `WhisperForConditionalGeneration.generate` mediante `model.generate(input_features)`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no. El modelo está orientado exclusivamente al danés.
- Capacidades de visión, audio más allá de ASR, thinking mode o generación de texto libre: no disponibles.

## Casos de uso

- Transcripción de conversaciones y reuniones en danés: el modelo está específicamente evaluado en el subconjunto de conversación de CoRal-v3 (WER 14,50), lo que lo hace adecuado para actas y resúmenes de reuniones donde el habla es espontánea y solapada, aunque con una tasa de error notablemente superior a la de lectura en voz alta.
- Subtitulado y transcripción de contenido leído o locutado: con WER de 8,11 en CoRal-v3 read-aloud y 5,14 en Common Voice Danish, es apropiado para generar subtítulos de vídeos, pódcast y audiolibros en danés, donde el habla es más limpia y planificada.
- Atención al cliente y análisis de llamadas: transcripción de grabaciones de centros de contacto en danés para su posterior análisis de calidad, búsqueda de palabras clave y cumplimiento normativo. La ventana de 30 s con troceado automático permite procesar llamadas completas sin intervención manual.
- Documentación clínica y legal: dictado y transcripción de notas en danés. El ensemble reduce el error frente a un único modelo en la mayoría de los clips, lo que es relevante cuando la revisión humana posterior es costosa.
- Investigación cualitativa: transcripción de entrevistas y grupos focales en danés para análisis temático. La capacidad de procesar listas de arrays y audios largos troceados encaja con flujos de trabajo por lotes.
- Generación de datos de entrenamiento ASR: creación de transcripciones pseudoetiquetadas a gran escala sobre audio danés no anotado, aprovechando que el ensemble produce transcripciones que ninguno de sus componentes genera por separado en un 5-21 % de los clips.
- Accesibilidad: subtitulado en tiempo casi real de eventos, clases y streams en danés, siempre que se asuma el coste de inferencia de dos modelos y una GPU con al menos 5 GB libres para los pesos.
- Archivado y búsqueda de fondos audiovisuales: indexación de archivos de audio daneses (radio, televisión, parlamento) para permitir búsqueda por texto sobre la transcripción.

## Benchmarks y rendimiento

Los resultados proceden del model-index de la model card y están marcados como no verificados por el autor. Se obtuvieron con el harness del leaderboard abierto de ASR danés (`Rye-A1/danish-asr-leaderboard`) usando 5 haces.

| Conjunto de test | Edda v0.2 duo (WER) | Edda v0.2 duo (CER) | Edda v0.2 large (WER) | Edda v0.2 (WER) |
|---|---|---|---|---|
| CoRal-v3 conversation | 14,50 | 8,28 | 15,97 | 15,54 |
| CoRal-v3 read-aloud | 8,11 | 3,14 | 8,65 | 9,59 |
| Common Voice Danish (leaderboard set, 2.756 clips) | 5,14 | 1,66 | 5,69 | 5,71 |
| FLEURS da_dk | 6,35 | 2,51 | 7,13 | 7,34 |
| FTSpeech (test_balanced) | 5,58 | 3,12 | 5,80 | 5,77 |
| Media WER | 7,94 | no disponible | 8,65 | 8,79 |

No se han publicado en la información disponible resultados de este modelo en benchmarks distintos de los anteriores (por ejemplo, MMLU, HumanEval o GSM8K, que además no aplican a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB solo para los pesos en fp16, según indica el autor. No se especifica en la información proporcionada el consumo adicional por las cachés KV de ambos modelos (la búsqueda por haces de 5 haces mantiene una caché separada para el modelo turbo) ni por las activaciones.
- Coste computacional relativo: unas 1,15 veces el del modelo large por sí solo.
- GPU recomendadas: no se proporciona una lista concreta. Dados los 5 GB de pesos, debería caber en GPU de consumo con al menos 6-8 GB de VRAM (por ejemplo, RTX 3060 de 12 GB o superiores); el resto de requisitos no está cuantificado en la información disponible.
- ¿Cabe en GPU de consumo? Sí, según la estimación de 5 GB para los pesos, siempre que se disponga de VRAM suficiente para el resto de estructuras de decodificación.
- Opciones de despliegue: la model card documenta únicamente el uso con `transformers` (`AutoModelForSpeechSeq2Seq` con `trust_remote_code=True`, `dtype=torch.float16` y `AutoProcessor`). No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni whisper.cpp; dado que el repositorio usa código personalizado (`edda_duo`), el soporte en esos motores es no disponible.
- Latencia y throughput: no disponibles. El único dato relacionado es el coste relativo de 1,15× frente al modelo large.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Idioma | Media WER (5 test sets) | Licencia |
|---|---|---|---|---|---|
| Edda v0.2 duo | 2.352.368.640 | Whisper large-v3 + large-v3-turbo | Danés | 7,94 | Apache 2.0 |
| Edda v0.2 large | 1.543.490.560 | openai/whisper-large-v3 | Danés | 8,65 | Apache 2.0 |
| Edda v0.2 | 808.878.080 | openai/whisper-large-v3-turbo | Danés | 8,79 | Apache 2.0 |
| openai/whisper-large-v3 | 1.543.490.560 | — | Multilingüe (99 idiomas) | no disponible en la información proporcionada para el harness danés | Apache 2.0 |

La comparativa se limita a los tres modelos Edda documentados por el mismo autor en la model card, ya que no se proporcionan resultados de otras alternativas ASR para danés. El duo mejora a sus dos componentes en los cinco conjuntos de test, con la mayor ventaja relativa en FLEURS da_dk (6,35 frente a 7,13 y 7,34). Whisper large-v3 se incluye como referencia de modelo base, pero no se dispone de su puntuación en este harness.

## Limitaciones y advertencias

- Rendimiento claramente inferior en habla conversacional: WER de 14,50 en CoRal-v3 conversation frente a 5,14 en Common Voice Danish. El solapamiento de hablantes, las pausas y el habla espontánea degradan notablemente el resultado.
- Alucinaciones y errores de transcripción: no se documentan mecanismos específicos de mitigación. Como todo modelo Whisper, puede generar texto plausible no presente en el audio, especialmente con ruido, música o silencios.
- Sesgos: no se documenta ningún análisis de sesgo por acento, edad, género o variedad dialectal del danés. Los conjuntos de evaluación declarados pueden no representar todas las variedades.
- Limitación de idioma: el modelo está orientado exclusivamente al danés. No se ha validado su comportamiento en otros idiomas ni en escenarios de cambio de código (code-switching) danés-inglés.
- Ventana de 30 segundos: los audios largos se trocean y se unen sin contexto entre ventanas, lo que puede producir errores en las fronteras de corte.
- Licencia: Apache 2.0, lo que permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia. El modelo base también es Apache 2.0.
- Ejecución de código remoto: la carga requiere `trust_remote_code=True`, por lo que se ejecuta código incluido en el repositorio. Conviene auditar o fijar una revisión concreta antes de usarlo en producción.
- Madurez y validación: el repositorio no tiene descargas ni likes registrados en el momento de la consulta y todas las métricas del model-index están marcadas como no verificadas. La adopción en la comunidad es, por tanto, no confirmada.
- Parámetros del decodificador y cachés: no se detallan el coste de memoria de las cachés por haz ni el comportamiento con lotes grandes, lo que dificulta dimensionar un despliegue de alto throughput.
- No se documentan la diarización de hablantes, las marcas de tiempo a nivel de palabra ni el rendimiento en audio con ruido de fondo intenso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danish-foundation-models/edda-v0.2-duo
- Componente large: https://huggingface.co/danish-foundation-models/edda-v0.2-large
- Componente turbo: https://huggingface.co/danish-foundation-models/edda-v0.2
- Modelo base large-v3: https://huggingface.co/openai/whisper-large-v3
- Modelo base large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- Leaderboard abierto de ASR danés (Space): https://huggingface.co/spaces/RyeAI/danish-asr-leaderboard
- Harness del leaderboard (repositorio): https://github.com/Rye-A1/danish-asr-leaderboard
- Dataset CoRal-v3: https://huggingface.co/datasets/CoRal-project/coral-v3
- Dataset FTSpeech: https://huggingface.co/datasets/alexandrainst/ftspeech
- Dataset NST Danish ASR: https://huggingface.co/datasets/alexandrainst/nst-da
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0

Nota: la búsqueda web realizada solo devolvió referencias generales sobre el idioma danés (Wikipedia, Britannica y guías de aprendizaje) que no aportan información técnica sobre el modelo y, por tanto, no se incluyen.
