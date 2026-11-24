# Gaurav-27/hindi-stt-r1v2-soup

## Resumen

Hindi STT R1 v2 soup es un modelo de reconocimiento automático del habla (ASR) para hindi, construido sobre Whisper-large-v3 (1.550 millones de parámetros) y afinado a partir de Trelis/tara. Lo desarrolla el usuario Gaurav-27 y se publica como un único checkpoint resultado de un proceso de model soup combinado con WiSE-FT: se promedian los pesos de tres checkpoints del mismo entrenamiento (final, paso 12.000 y paso 14.000) y el resultado se interpola al 50 % con el modelo base Tara. El objetivo es mejorar la transcripción de habla conversacional, telefónica y leída en hindi sin perder el comportamiento general de Tara.

El modelo aborda un problema concreto: la robustez del ASR en hindi en dominios degradados (audio telefónico de 8 kHz, ruido, acentos) y en conjuntos de evaluación diversos. Para ello el autor aplica aumentación de banda telefónica (filtro 300-3.400 Hz, remuestreo a 8 kHz, μ-law) durante un ajuste fino completo de 16.000 pasos sobre unas 905 horas de audio, con una mezcla ponderada por fuente que incluye IndicVoices, Vaani, Kathbath, GramVaani, Shrutilipi, MUCS, RESPIN, FLEURS e IndicTTS.

Es relevante porque, según la model card, en el momento de la publicación es el mejor modelo único de base permisiva en las evaluaciones del autor sobre Monsoon, la media de Vistaar, Kathbath dev y GramVaani call-disjoint dev, superando a Tara con intervalos de confianza bootstrap agrupados por hablante. La salida es Devanagari sin puntuación, literal, con préstamos del inglés en Devanagari y números escritos como palabras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-large-v3) |
| Parametros totales | 1.550 millones (1,55B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | clips de hasta 30 s (ventana nativa de Whisper); sin chunking de formato largo incluido |
| Tipos de cuantizacion | no disponible (la model card solo muestra carga en float16) |
| Idiomas soportados | hindi (hi) |
| Licencia | other / mixed-see-card (pesos heredan los terminos de los datos de entrenamiento; base Tara Apache-2.0) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-large-v3: un transformer encoder-decoder con atención estándar, especializado en ASR multilingüe. El modelo parte de Trelis/tara y se somete a un ajuste fino completo (todos los parámetros) de 16.000 pasos con batches de 32, lo que equivale a 512.000 clips muestreados (~905 horas de audio). Se usa learning rate 1e-5 con warm-up de 500 pasos y decaimiento lineal, optimizador AdamW, autocast en bf16 con pesos maestros en fp32, SpecAugment y aumentación de banda telefónica con probabilidad 0,3 (paso de banda 300-3.400 Hz, 8 kHz, μ-law). La semilla es 11.

La mezcla de datos por proporción es: IndicVoices 29 %, Vaani 21 %, Kathbath 13 %, GramVaani 12 %, Shrutilipi 9 %, MUCS 7 %, RESPIN 7 %, FLEURS 1 % e IndicTTS 1 %. Se aplican controles de calidad: para GramVaani se usan las etiquetas reparadas (v3), para Shrutilipi solo las filas en las que dos modelos independientes coinciden (CER ≤ 15 % más una comprobación de bordes), y en todas las fuentes se eliminan las frases que aparecen en los conjuntos de test. Los targets son Devanagari sin puntuación. Sobre el ajuste fino se construye un greedy soup con media uniforme de los checkpoints final, 12.000 y 14.000 (cada uno aceptado solo si mejoraba la media de dev de 6 conjuntos), y después se aplica WiSE-FT con θ = 0,5·θ_Tara + 0,5·θ_soup. La regla pre-registrada eligió el α más pequeño empatado (bootstrap pareado) con el mejor α en dev: α 0,5 → 12,57; 0,7 → 12,39; 0,9 → 12,40; 1,0 → 12,39. La decodificación recomendada es beam search con anchura 5, que superó a greedy en dev (13,72 frente a 13,98 de media sobre cuatro conjuntos).

## Capacidades

- Transcripción de voz a texto en hindi (Devanagari) para audio de 16 kHz.
- Reconocimiento robusto en habla conversacional, telefónica (banda 300-3.400 Hz, 8 kHz, μ-law) y leída, gracias a la aumentación telefónica del entrenamiento.
- Salida literal sin puntuación: préstamos del inglés escritos en Devanagari y números como palabras.
- Manejo de clips de hasta 30 segundos por inferencia (límite nativo de Whisper-large-v3).
- No se documentan tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- Capacidad multilingüe limitada al hindi según la model card y los metadatos del repositorio.
- No se documenta modo thinking ni otras capacidades especiales.

## Casos de uso

- Transcripción de llamadas de atención al cliente: el modelo está entrenado con GramVaani y aumentación telefónica, por lo que puede procesar audio de call center de 8 kHz y producir transcripciones en Devanagari sin puntuación para su posterior análisis.
- Subtitulado y documentación de reuniones en hindi: con clips de hasta 30 s y beam search de anchura 5, se puede segmentar el audio y transcribir cada segmento para generar actas o subtítulos.
- Anotación de corpus lingüísticos: útil para investigadores que necesitan transcripciones base en hindi sobre las que aplicar corrección humana, dado el formato literal y sin puntuación.
- Análisis de encuestas de voz (IVR): la mezcla incluye Vaani e IndicVoices, dominios de habla espontánea, lo que facilita transcribir respuestas abiertas grabadas por teléfono.
- Sistemas de accesibilidad: dictado y conversión de voz a texto en hindi para usuarios con movilidad reducida, desplegable con transformers en una GPU consumer.
- Evaluación comparativa de ASR en hindi: sirve como referencia de base permisiva para comparar con IndicConformer, SraVaani o Indic-Transcribe-core en conjuntos como Monsoon, Vistaar o Kathbath.
- Preprocesamiento para pipelines de NLP en hindi: transcripción previa a tareas de resumen, traducción o búsqueda sobre audio.

## Benchmarks y rendimiento

Resultados de la model card (WER %, menor es mejor; una sola lectura de test, selección solo en dev):

| Conjunto | R1 v2 soup | Tara | Indic-Transcribe-core (referencia) |
|---|---:|---:|---:|
| Monsoon (lattice; aproxima OIWER, más estricto que el scorer oficial) | **13,36** | 14,41 | 12,59 |
| Lahaja (estricto) | **12,01** | 15,24 | 10,41 |
| Vistaar media de 6 conjuntos (estricto, IndicTTS excluido) | **11,35** | 12,47 | 12,68 |
| Vistaar CV / FLEURS / GramVaani / Kathbath / Kathbath-noisy / MUCS | 11,55 / 9,86 / 19,08 / 8,66 / 9,71 / 9,24 | 12,37 / 10,66 / 21,06 / 9,35 / 10,81 / 10,54 | 12,73 / 11,43 / 18,86 / 11,55 / 12,02 / 9,51 |
| Dev (beam 5): Kathbath / GramVaani call-disjoint / Vaani / IndicVoices | 7,73 / 16,87 / 16,71 / 13,57 | 8,50 / 19,04 / 18,09 / 15,92 | 10,88 / 18,83 / 19,72 / 12,48 |

Bootstrap pareado agrupado por hablante frente a Tara: Monsoon −1,05 (IC 95 % −1,52 … −0,61); Lahaja −3,24 (−3,54 … −2,96). Según la model card, en Lahaja IndicConformer (11,74) está por delante y en Vaani dev SraVaani (16,27, en dominio) también supera al modelo. Vaani-Bench está pendiente de lectura en el momento de la publicación.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,1 GB, lo que corresponde a pesos en fp16 de un modelo de 1,55B; en fp16 se necesitan aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y decodificación con beam 5.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 con beam search; A100, H100 o RTX 4090 ofrecen margen amplio y mayor throughput.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090). No se documentan requisitos para cuantizaciones menores.
- Opciones de despliegue: transformers (código de ejemplo en la model card con WhisperForConditionalGeneration y WhisperProcessor). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (referencia) | Disponibilidad |
|---|---|---|---|---|---|
| Hindi STT R1 v2 soup | 1,55B | clips de 30 s | other / mixed-see-card | Monsoon 13,36; Lahaja 12,01; Vistaar 11,35 | Hugging Face (Gaurav-27) |
| Trelis/tara (base) | 1,55B (Whisper-large-v3) | clips de 30 s | Apache-2.0 | Monsoon 14,41; Lahaja 15,24; Vistaar 12,47 | Hugging Face (Trelis) |
| Indic-Transcribe-core | no disponible | no disponible | no disponible | Monsoon 12,59; Lahaja 10,41; Vistaar 12,68 | referencia en la model card; disponibilidad no detallada |
| IndicConformer | no disponible | no disponible | no disponible | Lahaja 11,74 | referencia en la model card; disponibilidad no detallada |

## Limitaciones y advertencias

- Sigue por detrás de Indic-Transcribe-core en hindi con acento (Lahaja) y en habla conversacional de Monsoon.
- Solo procesa clips de hasta 30 s; no incluye chunking para audio de formato largo, que debe implementar el usuario.
- Las convenciones ortográficas difieren entre conjuntos de test (nukta, chandrabindu frente a anusvara); entre 0,7 y 1,4 puntos de WER por conjunto de dev son solo de ortografía.
- La licencia es mixta: los pesos heredan los términos de los datos de entrenamiento. El corpus GramVaani de 100 h es solo para uso académico, e IndicVoices, Vaani y Shrutilipi son datasets con acceso restringido y términos propios. Hay que revisar cada fuente antes de cualquier uso comercial.
- La model card no documenta sesgos específicos ni tasas de alucinación; al ser un ASR, el riesgo principal es la transcripción incorrecta de nombres propios, números o términos técnicos.
- El soporte lingüístico se limita al hindi; no se garantiza comportamiento en otras lenguas.
- Los resultados se basan en una única lectura de test con selección en dev; no hay validación independiente por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Gaurav-27/hindi-stt-r1v2-soup
- Modelo base: https://huggingface.co/Trelis/tara
- Repositorio de Whisper-large-v3 (arquitectura): https://huggingface.co/openai/whisper-large-v3
- Referencias de benchmarks mencionadas en la model card: Monsoon, Lahaja, Vistaar, Kathbath, GramVaani, Vaani, IndicVoices, Shrutilipi, MUCS, RESPIN, FLEURS, IndicTTS (sin URL proporcionada en la información disponible)
- Ficheros de selección y resultados: `selection.json`, `results.json` y `SHA256SUMS` en el repositorio del modelo (sin URL directa proporcionada)
