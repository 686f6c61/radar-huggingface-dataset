# agbalu/Fadhma-300M

## Resumen

Fadhma-300M es un modelo acústico de reconocimiento automático del habla (ASR) especializado en cabilio (taqbaylit, código `kab_Latn`), una lengua bereber de la familia amazigh hablada principalmente en la región de Cabilia, Argelia. Lo desarrolla el usuario agbalu y se distribuye con licencia Apache 2.0. El modelo parte del backbone auto-supervisado `ylacombe/omniASR_W2V_300M_SSL` y se afina con 144,31 horas de audio en cabilio para producir transcripciones en ortografía latina canónica.

La arquitectura es un encoder tipo wav2vec2/Conformer de 24 capas con 315.479.720 parámetros totales (311.285.416 entrenables y 4.194.304 congelados en el frontend convolucional), cabeza CTC y vocabulario de 40 tokens que incluye los caracteres fonémicos propios del cabilio. No es un modelo generativo de texto: es un modelo acústico puro que emite logits por fotograma y requiere decodificación externa (greedy o beam search con un modelo de lenguaje de 5-gramas).

Su relevancia radica en que cubre una lengua de bajos recursos con pocos sistemas ASR públicos de calidad. Sobre el split de test de Common Voice 22.0 (15.003 clips, 888 hablantes no vistos, 16 horas) obtiene un 25,65 % de WER y un 8,01 % de CER con beam search y shallow fusion de 5-gramas, y un 30,12 % de WER y 8,53 % de CER con decodificación greedy. El modelo está pensado para integrarse en pipelines junto a herramientas del mismo autor para traducción y restauración de puntuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2/Conformer encoder + cabeza CTC (24 capas, hidden 1.024, FFN 4.096, 16 cabezas) |
| Parametros totales | 315.479.720 (311.285.416 entrenables, 4.194.304 congelados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo acústico por fotogramas; no aplica ventana de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | cabilio (`kab`, `kab_Latn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,4 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder de 24 capas con dimensión oculta de 1.024 y feed-forward de 4.096 con activación GELU, 16 cabezas de atención de dimensión 64 y un frontend convolucional de 7 capas con strides 5,2,2,2,2,2,2 y campo receptivo de 20 ms por fotograma. Sobre el encoder se sitúa una cabeza CTC con vocabulario de 40 tokens: `[PAD]`, `[UNK]`, delimitador de palabra `|`, guion y 36 caracteres fonémicos del cabilio (incluyendo `ɣ ɛ ḥ ḍ ṣ ṭ ẓ ṛ č ǧ ţ`). La función de pérdida es CTC con `ctc_zero_infinity=True`.

El entrenamiento se realizó sobre Mozilla Common Voice 22.0 en cabilio (licencia CC-0) con 144,31 horas de audio, optimizador AdamW con learning rate máximo de 1e-4 y betas (0,9, 0,98). Para la decodificación se entrena un modelo de lenguaje KenLM de 5-gramas sobre 3,2 millones de frases, aplicado mediante shallow fusion. El modelo base es el backbone auto-supervisado `ylacombe/omniASR_W2V_300M_SSL`, lo que permite aprovechar representaciones preentrenadas multilingües en lugar de partir de cero en una lengua de bajos recursos.

## Capacidades

- Transcripción automática de voz en cabilio a 16 kHz, con salida en ortografía latina canónica (incluye caracteres especiales bereberes sin transliterar).
- Decodificación greedy CTC (solo acústica) y beam search con shallow fusion de un modelo de lenguaje de 5-gramas.
- Independencia de hablante: el conjunto de test contiene 888 hablantes sin solapamiento con train ni validation.
- Integración en pipelines posteriores: la salida puede alimentar traducción (`Amrouche-1.3B`) o restauración de puntuación y mayúsculas (`Belaid-31M`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto libre: es exclusivamente un modelo acústico de ASR.
- No dispone de capacidades de visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Transcripción de notas de voz en cabilio: el modelo convierte grabaciones de audio de 16 kHz en texto con ortografía canónica, adecuado para aplicaciones de mensajería o archivo personal donde no se requiere revisión humana inmediata.
- Digitalización de archivos sonoros y patrimonio oral: permite transcribir entrevistas, cuentos y grabaciones etnográficas en cabilio para su indexación y búsqueda textual, aprovechando la independencia de hablante verificada sobre 888 hablantes.
- Subtitulado y accesibilidad: generación de subtítulos para vídeo en cabilio, con la advertencia de que la puntuación y mayúsculas deben restaurarse con un modelo posterior como `Belaid-31M`.
- Preprocesado para traducción automática: la transcripción sirve de entrada al modelo `Amrouche-1.3B` para pipelines de voz a texto a traducción, cubriendo un par de lenguas poco representado en sistemas comerciales.
- Investigación lingüística y corpus: generación de transcripciones a escala para estudios fonéticos y morfológicos del cabilio, con la salvedad de que los clíticos unidos por guion pueden introducir discrepancias de segmentación.
- Sistemas de dictado y asistencia por voz en entornos de bajos recursos: despliegue en servidores modestos por el tamaño de 315 M de parámetros y la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales.
- Análisis de llamadas o encuestas en cabilio: transcripción por lotes de audio telefónico previamente realzado, con revisión humana en contextos sensibles.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Common Voice 22.0 en cabilio (15.003 clips, 16,00 horas, 888 hablantes no vistos). No verificados de forma independiente.

| Metodo de decodificacion | CER (%) | WER (%) |
|---|---|---|
| Beam search + shallow fusion 5-gramas | 8,01 | 25,65 |
| Greedy CTC (solo acustica) | 8,53 | 30,12 |

El uso del modelo de lenguaje de 5-gramas reduce el WER en 4,47 puntos porcentuales y el CER en 0,52 puntos. El autor señala que parte del error a nivel de palabra proviene de discrepancias en la hyphenación de clíticos pronominales y direccionales (`-d`, `-awen`, `-iw`), mientras la precisión a nivel de carácter se mantiene por encima del 91,9 %.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (315 M de parámetros), más activaciones y buffers de decodificación; en la práctica, entre 2 y 4 GB según longitud de audio y batch.
- En bfloat16 o float16 los pesos ocupan unos 0,65 GB, por lo que cabe holgadamente en cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090).
- GPU recomendadas para producción: A100, H100 o L4 para procesamiento por lotes a gran escala; RTX 4090 o RTX 3090 para despliegues de baja latencia.
- Cabe en CPU para inferencia offline, aunque con mayor latencia; el modelo es pequeño para estándares actuales.
- Opciones de despliegue: `transformers` con `Wav2Vec2ForCTC` y `AutoProcessor`; `pyctcdecode` para beam search con KenLM; servidores compatibles con modelos de Hugging Face (TGI no está orientado a CTC, por lo que se recomienda un servicio propio con FastAPI o similar).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. A continuación se indican alternativas de categoría (ASR de bajos recursos basadas en wav2vec2/CTC) sin datos numéricos contrastados:

| Modelo | Parametros | Contexto/idioma | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fadhma-300M | 315 M | cabilio (`kab`) | Apache 2.0 | Hugging Face |
| Backbone `ylacombe/omniASR_W2V_300M_SSL` | ~300 M | multilingüe auto-supervisado | no disponible en la informacion | Hugging Face |
| wav2vec2-base fine-tuned en lenguas de bajos recursos | ~95 M | variable | variable | Hugging Face |

Los datos de rendimiento de las alternativas no están disponibles en la información proporcionada, por lo que no se establece comparación numérica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre Common Voice, puede heredar sesgos de representación de hablantes, edad, género y variantes dialectales del cabilio.
- Riesgo de alucinación: el modelo CTC no genera texto libre, pero puede producir transcripciones incorrectas o inventar secuencias plausibles en audio ruidoso o con acentos no representados.
- Limitaciones de idioma: solo cabilio; no soporta otras variedades bereberes ni árabe argelino.
- Calidad en audio ruidoso: el autor declara fuera de alcance el audio con alto ruido sin realce previo de la voz.
- Uso clínico, legal o de emergencias: fuera de alcance sin revisión humana.
- Segmentación de clíticos: las discrepancias de hyphenación inflan el WER; conviene normalizar antes de comparar métricas.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datos de Common Voice (CC-0) y del modelo base.
- No verificado: los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Fadhma-300M
- Modelo base: https://huggingface.co/ylacombe/omniASR_W2V_300M_SSL
- Modelo de traducción relacionado: https://huggingface.co/agbalu/Amrouche-1.3B
- Modelo de puntuación y mayúsculas relacionado: https://huggingface.co/agbalu/Belaid-31M
- Dataset de evaluación: https://huggingface.co/datasets/fsicoli/common_voice_22_0
