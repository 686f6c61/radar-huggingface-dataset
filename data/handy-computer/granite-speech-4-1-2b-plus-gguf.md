# handy-computer/granite-speech-4.1-2b-plus-gguf

## Resumen

Granite-speech-4.1-2b-plus GGUF es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) ibm-granite/granite-speech-4.1-2b-plus, publicada por handy-computer para su uso con el runtime transcribe.cpp. El modelo original lo desarrolla IBM dentro de la familia Granite-Speech y aporta dos funciones solicitadas por la comunidad sobre la variante base 4.1-2b: transcripción atribuida por hablante (diarización con etiquetas de hablante) y marcas de tiempo a nivel de palabra. Su arquitectura combina un codificador Conformer, un proyector BLIP-2 Q-Former y un decodificador LLM autorregresivo Granite-4.0-1b, con 2.111.899.452 parámetros totales medidos en los safetensors del modelo base.

El repositorio ofrece seis niveles de cuantización (BF16, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) que cubren desde 4,23 GB hasta 1,49 GB de pesos, y publica el WER completo sobre LibriSpeech test-clean (2620 enunciados) para cada uno: entre 1,46 % y 1,56 %, prácticamente idéntico al 1,49 % de la referencia BF16. Es relevante ahora porque permite ejecutar un ASR multilingüe (inglés, francés, alemán, español y portugués) con marcas de tiempo por palabra en hardware de consumo, incluidas CPU sin GPU dedicada, gracias a los ratios de tiempo real medidos (33x en Metal sobre M4 Max, 1,4x en CPU sobre Ryzen 4750U).

La contrapartida es que esta variante "plus" es solo de transcripción: no traduce, no detecta idioma, no hace streaming y no genera puntuación ni mayúsculas. Está pensada para integrarse en pipelines donde esos elementos se resuelven aparte (puntuación posterior, traducción con otro modelo) y donde el valor está en los tiempos por palabra y la separación de hablantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador Conformer + proyector BLIP-2 Q-Former + decodificador LLM autorregresivo Granite-4.0-1b |
| Parametros totales | 2.111.899.452 (~2,11 mil millones, medido en los safetensors del modelo base) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés, francés, alemán, español, portugués |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

## Arquitectura y entrenamiento

La arquitectura replica la del modelo base Granite-Speech 4.1-2b (Conformer encoder, proyector BLIP-2 Q-Former y decoder Granite-4.0-1b) con dos modificaciones concretas: el codificador concatena los estados ocultos de la capa intermedia (índice 3) y de la capa final mediante `cat_hidden_layers=[3]`, lo que duplica la entrada K/V del proyector de 1024 a 2048, y los embeddings de tokens del LM están atados (tied) con el `lm_head`. El modelo consume WAV mono a 16 kHz y genera la transcripción; las marcas de tiempo por palabra se obtienen analizando los marcadores `[T:N]` en centésimas de segundo que emite el propio modelo (`--timestamps word`).

La información disponible indica que el entrenamiento usó corpus similares a los de Granite-Speech-4.1-2b, aumentados con turnos de hablante y etiquetas de marca temporal por palabra. No se especifican el número total de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO: esos datos no están disponibles en la información proporcionada. Esta conversión GGUF se generó desde el commit upstream `edd3bf5`, fijado el 2026-05-17, y se validó numéricamente contra la referencia de Transformers en el commit `275332d` de transcribe.cpp en la misma fecha.

## Capacidades

- Transcripción de voz a texto offline en inglés, francés, alemán, español y portugués.
- Marcas de tiempo a nivel de palabra, derivadas de los marcadores `[T:N]` en centésimas de segundo (`--timestamps word`).
- ASR con atribución de hablante (etiquetas de hablante junto al texto), la otra función diferencial de la variante "plus".
- Entrada restringida a audio WAV mono a 16 kHz (requiere remuestreo previo si la fuente no cumple).
- Inferencia en CPU, Metal y Vulkan mediante transcribe.cpp.
- No realiza traducción de voz (`translate: false`).
- No realiza detección automática de idioma (`lang_detect: false`).
- No soporta streaming (`streaming: false`); el procesado es por fichero completo.
- No genera puntuación ni mayúsculas: es una característica ausente por diseño en la variante plus frente a la base.
- No incluye japonés, a diferencia de la variante base.
- No hay información publicada sobre tool calling, function calling, uso como agente ni razonamiento multi-paso: no disponible.

## Casos de uso

- Subtitulado automático de vídeo: las marcas de tiempo por palabra permiten generar ficheros SRT/VTT con segmentación precisa y sin necesidad de alineación forzada posterior, a partir del WAV mono a 16 kHz extraído con ffmpeg.
- Transcripción de reuniones con separación de hablantes: la atribución por hablante integrada permite etiquetar quién dice qué sin un modelo de diarización externo, y el WER de ~1,5 % en inglés reduce la carga de corrección manual.
- Análisis de llamadas de contact center: transcripción local de grabaciones para extraer texto indexable y métricas de conversación, con tiempos por palabra que facilitan localizar momentos concretos; el procesado offline evita enviar audio de clientes a terceros.
- Accesibilidad y dictado en escritorio: al ejecutarse en CPU con ratios de tiempo real superiores a 1 en un Ryzen 4750U (1,4x) y en Metal sobre M4 (11x), es viable como motor de dictado local en portátiles sin GPU dedicada; el proyecto Handy del mismo autor publica una aplicación de escritorio de voz a texto.
- Indexación y búsqueda en archivos de audio y vídeo: el texto con marcas temporales por palabra permite construir índices que devuelvan directamente el instante exacto de una frase, útil en mediatecas y archivos de posproducción.
- Postproducción de pódcast y entrevistas: la combinación de diarización y timestamps por palabra acelera el corte por frases y la generación de notas del episodio, con seis cuantizaciones disponibles para ajustar el equilibrio entre calidad y consumo (Q4_K_M con 1,49 GB y 1,56 % de WER).
- Despliegue en entornos con requisitos de privacidad o sin conectividad: transcripción íntegramente local en equipos de campo, con el fichero GGUF más pequeño (1,49 GB) apto para almacenamiento y distribución sencillos.
- Transcripción de documentación clínica o legal dictada: al no requerir servicios en la nube y soportar español, permite dictado en local; conviene asumir el coste de puntuación posterior y revisión humana dado que el modelo no puntúa.

## Benchmarks y rendimiento

WER sobre la partición completa LibriSpeech test-clean (2620 enunciados), decodificación greedy y plantilla de chat del model card:

| Cuantizacion | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| BF16 | 4,23 GB | 1,49 % |
| F16 | 4,23 GB | 1,48 % |
| Q8_0 | 2,35 GB | 1,50 % |
| Q6_K | 1,86 GB | 1,46 % |
| Q5_K_M | 1,69 GB | 1,48 % |
| Q4_K_M | 1,49 GB | 1,56 % |

Referencia BF16 medida localmente con el mismo prompt: 1,48 %, frente al 1,44 % publicado por el autor upstream (diferencia de 0,04 puntos porcentuales, dentro del solapamiento del intervalo de confianza bootstrap y atribuida a diferencias de plantilla de chat o normalización). El normalizador de texto empleado es `EnglishTextNormalizer` de Whisper, el mismo que usa Open ASR Leaderboard.

Ratios de tiempo real (RTF, veces más rápido que el tiempo real):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 33 |
| Apple M4 Max | CPU | 5,2 |
| Apple M4 | Metal | 11 |
| Apple M4 | CPU | 5 |
| Ryzen 4750U | Vulkan | 2,75 |
| Ryzen 4750U | CPU | 1,4 |

No se han publicado resultados de benchmarks para MMLU, HumanEval, GSM8K ni otras tareas de lenguaje en la información disponible, dado que se trata de un modelo de ASR y no de un LLM de propósito general.

## Requisitos de hardware

- VRAM estimada (cálculo propio a partir del tamaño de los pesos, no publicada por el autor; añade margen para el encoder, el proyector y las activaciones): Q4_K_M ~2 GB, Q5_K_M ~2,2 GB, Q6_K ~2,4 GB, Q8_0 ~2,9 GB, BF16/F16 ~4,8 GB.
- GPU recomendadas: no hay lista oficial publicada. Los únicos dispositivos con medidas en la información disponible son Apple M4 Max y M4 (Metal) y AMD Ryzen 4750U (Vulkan).
- Cabe en GPU de consumo: sí, con holgura. La cuantización Q4_K_M (1,49 GB) entra en cualquier GPU de sobremesa o portátil con 4 GB o más, e incluso en iGPU con soporte Vulkan.
- Funciona sin GPU: sí, con backend CPU; se midieron 5,2x (M4 Max), 5x (M4) y 1,4x (Ryzen 4750U) sobre tiempo real.
- Opciones de despliegue: transcribe.cpp (compilado desde fuente con CMake; binario `transcribe-cli`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Requisito de entrada: WAV mono a 16 kHz; conversión previa con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.
- Latencia y throughput: no hay cifras absolutas de latencia ni de tokens/s; solo los ratios de tiempo real de la tabla anterior.
- El repositorio ocupa 75,0 GB, pero solo es necesario descargar el fichero GGUF de la cuantización elegida (1,49-4,23 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | WER LibriSpeech test-clean | Formato y notas |
|---|---|---|---|---|---|
| handy-computer/granite-speech-4.1-2b-plus-gguf | 2,11 B | en, fr, de, es, pt | Apache-2.0 | 1,46-1,56 % segun cuantizacion | GGUF para transcribe.cpp; timestamps por palabra y diarizacion |
| ibm-granite/granite-speech-4.1-2b-plus (upstream) | 2,11 B | en, fr, de, es, pt | Apache-2.0 | 1,44 % publicado (1,48 % reproducido) | safetensors; mismas capacidades, sin cuantizar; sin puntuacion ni mayusculas |
| ibm-granite/granite-speech-4.1-2b | no disponible | incluye japones; no disponible el listado completo | Apache-2.0 | no disponible | Variante base: anade traduccion de voz y puntuacion/mayusculas, pero no ofrece timestamps por palabra ni diarizacion |
| Whisper large-v3 | no disponible | no disponible | no disponible | no disponible | Referencia habitual de ASR multilingue; no se han incluido datos comparables en la informacion proporcionada |

No se dispone de cifras de parámetros, contexto o benchmarks de alternativas fuera de la familia Granite en la información proporcionada, por lo que la comparación cuantitativa se limita a las variantes de Granite aqui listadas y a las seis cuantizaciones del propio repositorio.

## Limitaciones y advertencias

- No genera puntuación ni mayúsculas: es una decisión de diseño de la variante "plus". Requiere un paso posterior de restauración si el texto se destina a lectura humana.
- No traduce voz y no detecta idioma automáticamente; el idioma debe conocerse de antemano o resolverse con otro componente.
- No soporta streaming: no es adecuado para dictado en tiempo real con salida incremental, solo para ficheros completos.
- Sin japonés en esta variante (la base sí lo incluye), lo que limita su uso en despliegues multilingües amplios.
- Riesgo documentado de hipótesis vacías: sin `add_generation_prompt=True` en la plantilla, el modelo produce 25-27 hipótesis vacías en clips cortos de test-clean y el WER se dispara a ~26 %. El runtime transcribe.cpp fija el prompt correctamente, pero cualquier reproducción con Transformers debe replicarlo.
- Riesgo de alucinación inherente a los modelos de voz a texto en audio ruidoso, con solapamiento de hablantes o con silencios largos; no se documentan tasas específicas.
- Sesgos: no se publica información sobre sesgos por acento, dialecto, edad o género en la información disponible.
- Contexto y longitud máxima de audio por pasada: no disponibles; esto condiciona la segmentación de audios largos.
- Licencia Apache-2.0 heredada del modelo base, lo que permite uso comercial con las obligaciones habituales de atribución y conservación de avisos; conviene revisar la model card upstream como fuente autoritativa.
- Requisito estricto de entrada (WAV mono 16 kHz): audio en otro formato o con más canales debe convertirse antes, y una conversión incorrecta degrada la calidad de la transcripción.
- Al ser una conversión GGUF de un modelo de terceros, la validación se limita al commit upstream `edd3bf5`; cambios posteriores en el modelo base no están cubiertos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/handy-computer/granite-speech-4.1-2b-plus-gguf
- Modelo base (IBM): https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus
- Variante base 4.1-2b (con traducción y japonés): https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Commit upstream fijado: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus/commit/edd3bf5
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Revisión validada de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/275332d
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b-plus.md
- Aplicación de escritorio Handy (mismo dominio que el autor del repositorio, relación no confirmada en la información disponible): https://handy.computer/
- Descarga de Handy: https://handy.computer/download.html
- Referencias arXiv citadas en las etiquetas del repositorio (contenido no verificado): https://arxiv.org/abs/2604.11269, https://arxiv.org/abs/2604.22817, https://arxiv.org/abs/2604.12398, https://arxiv.org/abs/2505.08699, https://arxiv.org/abs/2603.11243, https://arxiv.org/abs/2603.08397
