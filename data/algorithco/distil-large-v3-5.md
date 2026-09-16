# algorithco/distil-large-v3.5

## Resumen

Distil-Large-v3.5 es un modelo de reconocimiento automático de voz (ASR) en inglés, resultado de destilar el conocimiento de Whisper-Large-v3 de OpenAI. Forma parte de la familia Distil-Whisper y está descrito en el artículo "Robust Knowledge Distillation via Large-Scale Pseudo Labelling" (arXiv:2311.00430). La ficha corresponde a una subida del usuario algorithco con licencia MIT, 756.405.760 parámetros (unos 756 M) y 3,0 GB de repositorio en formato safetensors para la librería transformers.

El modelo mantiene la arquitectura encoder-decoder de tipo transformer propia de Whisper, pero reduce drásticamente el coste de decodificación: el encoder permanece congelado durante el entrenamiento y solo se añaden dos capas de decoder, lo que lo hace apto tanto para transcripción directa como para actuar como modelo borrador (draft) en decodificación especulativa junto a Whisper-Large-v3.

Su relevancia actual radica en la relación precisión/eficiencia: según la model card, es aproximadamente 1,5 veces más rápido que Whisper-Large-v3-turbo (RTFx relativo de 1,46 frente a 1,0) y obtiene mejores cifras de WER en evaluación de forma corta (7,08 de media OOD frente a 7,30), cediendo en torno a un 1 % en transcripción de forma larga (11,39 frente a 10,25 de WER OOD). El entrenamiento emplea 98.000 horas de datos públicos diversos, más de cuatro veces la cantidad usada por versiones anteriores de Distil-Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper), encoder congelado durante la destilación y decoder reducido a dos capas |
| Parametros totales | 756.405.760 (unos 756 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por pasada, con estrategias secuenciales o por chunks para audio largo (estándar en la familia Whisper; no se detalla en la información proporcionada) |
| Tipos de cuantizacion | no especificados en la model card; compatible con las cuantizaciones de whisper.cpp, faster-whisper y Candle (fp16, int8 y GGUF en esas herramientas) |
| Idiomas soportados | en (inglés) |
| Licencia | mit |
| Formato de pesos | safetensors (librería transformers); el repositorio ocupa 3,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Whisper. La innovación de Distil-Whisper consiste en congelar el encoder del profesor (Whisper-Large-v3) durante la destilación y entrenar únicamente un decoder muy reducido, de solo dos capas, lo que explica que el recuento total de parámetros (756 M) sea inferior al de Whisper-Large-v3-turbo (809 M) pese a compartir el mismo encoder. Al conservar el encoder intacto, el modelo puede cargarse como draft en decodificación especulativa junto a Whisper-Large-v3: basta con añadir dos capas de decoder adicionales y ejecutar el encoder una sola vez, lo que según la model card logra una inferencia unas dos veces más rápida que Whisper-Large-v3 manteniendo salidas idénticas.

El entrenamiento se realizó sobre más de 98.000 horas de datos públicos diversos, aproximadamente cuatro veces más que las versiones anteriores de Distil-Whisper. Se empleó un profesor "patient" (arXiv:2106.05237) con un calendario de entrenamiento extendido y aumento de datos agresivo mediante SpecAugment (arXiv:1904.08779), lo que según el autor mejora la robustez y la precisión respecto a Distil-Large-v3. El modelo card no detalla el uso de RLHF o DPO; el pipeline es exclusivamente de destilación supervisada sobre pseudo-etiquetado a gran escala.

## Capacidades

- Transcripción de voz a texto en inglés, tanto en formato corto (utterances) como en formato largo (audio de minutos u horas) mediante decodificación secuencial o por chunks.
- Reconocimiento de habla robusto: la evaluación incluye conjuntos dentro y fuera de distribución (AMI, Gigaspeech, LibriSpeech, Tedlium, Earnings22, SPGISpeech) con resultados homogéneos.
- Decodificación especulativa: actúa como modelo borrador de Whisper-Large-v3, con salidas idénticas a las del modelo grande y una aceleración aproximada de 2x.
- Integración con múltiples runtimes: transformers, whisper.cpp, faster-whisper, OpenAI Whisper, Transformers.js y Candle.
- Compatibilidad con el pipeline `automatic-speech-recognition` de HuggingFace y con endpoints compatibles (`endpoints_compatible`).
- No dispone de capacidades multimodales más allá del audio: no hay visión, ni generación de texto libre, ni tool calling, ni modo de razonamiento explícito (thinking), ni soporte de agentes.
- Cobertura monolingüe: la model card declara únicamente inglés (`en`), sin soporte multilingüe ni traducción.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio largo mediante decodificación secuencial o por chunks, por lo que puede convertir reuniones de una hora en texto con un coste de cómputo muy inferior al de Whisper-Large-v3, manteniendo un WER medio de 11,39 en evaluación de forma larga fuera de distribución.
- Subtitulado automático de vídeo y pódcast: al ser unas 1,5 veces más rápido que Whisper-Large-v3-turbo, permite generar subtítulos en inglés a gran escala con un pipeline por lotes, integrable con faster-whisper o whisper.cpp sobre CPU.
- Servicio de transcripción con latencia baja: por su tamaño de 756 M de parámetros puede servirse en una única GPU consumer, lo que reduce el coste por hora de audio en productos SaaS de dictado o notas de voz.
- Aceleración de pipelines existentes de Whisper-Large-v3: al usarse como draft en decodificación especulativa, se puede desplegar delante de un Whisper-Large-v3 ya en producción para duplicar el throughput sin cambiar las salidas generadas.
- Preprocesado de datos de voz para entrenamiento de otros modelos: transcripción masiva de corpus de audio en inglés a bajo coste, con anonimización posterior del texto.
- Análisis de llamadas de atención al cliente en inglés: transcripción de grabaciones (por ejemplo, del dominio financiero evaluado en Earnings22, con WER de 11,29) para alimentar sistemas de analítica, búsqueda o control de calidad.
- Aplicaciones en el navegador o en el borde: al estar soportado por Transformers.js y Candle, permite transcripción local sin enviar audio a un servidor, útil en escenarios de privacidad.
- Accesibilidad en tiempo real: dictado y transcripción asistida en inglés sobre hardware modesto, dado que el modelo cabe en GPUs de gama media e incluso puede ejecutarse en CPU con cuantización.

## Benchmarks y rendimiento

Evaluación de forma corta (WER tras normalización, menor es mejor; conjuntos ID y OOD según la partición declarada en la model card):

| Dataset | large-v3 | large-v3-turbo | distil-v3 | distil-v3.5 |
|---|---|---|---|---|
| AMI | 15,95 | 16,13 | 15,16 | 14,63 |
| Gigaspeech | 10,02 | 10,14 | 10,08 | 9,84 |
| LS Clean | 2,01 | 2,10 | 2,54 | 2,37 |
| LS Other | 3,91 | 4,24 | 5,19 | 5,04 |
| Tedlium | 3,86 | 3,57 | 3,86 | 3,64 |
| Earnings22 | 11,29 | 11,63 | 11,79 | 11,29 |
| SPGISpeech | 2,94 | 2,97 | 3,27 | 2,87 |
| Media ID | 7,15 | 7,24 | 7,37 | 7,10 |
| Media OOD | 7,12 | 7,30 | 7,53 | 7,08 |
| Media total | 7,14 | 7,25 | 7,41 | 7,10 |

Evaluación de forma larga (WER OOD) y eficiencia relativa:

| Modelo | Parametros / M | Rel. RTFx | WER forma corta OOD | WER forma larga OOD |
|---|---|---|---|---|
| large-v3-turbo | 809 | 1,0 | 7,30 | 10,25 |
| distil-large-v3 | 756 | 1,44 | 7,53 | 11,6 |
| distil-large-v3.5 | 756 | 1,46 | 7,08 | 11,39 |

La información proporcionada incluye además una tabla de evaluación de forma larga sobre un conjunto ID y cuatro OOD, pero el contenido está truncado, por lo que no se reproducen esos valores. No se han publicado en la información disponible resultados de benchmarks generales tipo MMLU, GSM8K o HumanEval, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 756 M de parámetros, no dato oficial): en fp32 alrededor de 3,0 GB (el repositorio ocupa 3,0 GB), en fp16 unos 1,5 GB y en int8 unos 0,8 GB, más el coste de activaciones del encoder, que trabaja sobre ventanas de 30 segundos.
- Cabe en GPU consumer: cualquier GPU con 4 GB o más de VRAM puede ejecutarlo en fp16 (RTX 3050, RTX 3060, RTX 4060, GTX 1660 y superiores); con 2 GB o menos conviene usar int8 o cuantización GGUF.
- GPU de datacenter recomendadas para alto throughput: A100, H100, L40S o L4, sobre todo si se sirve en lote y combinado con decodificación especulativa junto a Whisper-Large-v3.
- Ejecución en CPU viable mediante whisper.cpp o Candle con cuantización GGUF, especialmente para transcripción por lotes sin requisitos de latencia estricta.
- Opciones de despliegue soportadas según la model card: transformers, whisper.cpp, faster-whisper, OpenAI Whisper, Transformers.js y Candle. No se documenta explícitamente soporte de vLLM ni TGI.
- Latencia y throughput: solo se publica el RTFx relativo (1,46 frente a 1,0 de large-v3-turbo, es decir unas 1,5 veces más rápido). Como draft de Whisper-Large-v3 en decodificación especulativa, la card declara una inferencia aproximadamente 2 veces más rápida que Whisper-Large-v3 con salidas idénticas. No se proporcionan cifras absolutas de RTFx, latencia en milisegundos ni throughput en horas de audio por segundo.

## Comparativa con modelos similares

| Modelo | Parametros / M | Rel. RTFx | WER corto OOD | WER largo OOD | Idiomas | Licencia |
|---|---|---|---|---|---|---|
| distil-large-v3.5 (esta ficha) | 756 | 1,46 | 7,08 | 11,39 | en | mit |
| distil-large-v3 | 756 | 1,44 | 7,53 | 11,6 | en | mit |
| whisper-large-v3-turbo | 809 | 1,0 | 7,30 | 10,25 | multilingüe (no detallado en la información proporcionada) | mit |
| whisper-large-v3 | no disponible | referencia | 7,12 | no disponible | multilingüe (no detallado) | mit |

Frente a Whisper-Large-v3-turbo, Distil-Large-v3.5 ofrece mejor WER en forma corta (7,08 frente a 7,30) y peor WER en forma larga (11,39 frente a 10,25), con una ventaja de velocidad de aproximadamente 1,5x. Frente a Distil-Large-v3, mejora tanto en precisión corta y larga como en velocidad relativa. Como limitación comparativa, Whisper-Large-v3 y su variante turbo son multilingües, mientras que esta versión solo soporta inglés.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no soporta traducción ni transcripción en otros idiomas, a diferencia de Whisper-Large-v3.
- Rendimiento inferior al del profesor en forma larga: la propia model card reconoce una caída de aproximadamente un 1 % de WER en transcripción de forma larga frente a Whisper-Large-v3-turbo.
- Es un modelo de destilación sobre pseudo-etiquetado, por lo que puede heredar sesgos y errores del profesor Whisper-Large-v3, especialmente en acentos, variedades dialectales y audio con ruido o solapamiento de hablantes.
- Riesgo de alucinación en audio silencioso, ruidoso o musical, comportamiento conocido en la familia Whisper; se recomienda aplicar detección de actividad de voz y umbrales de confianza en producción.
- No es un modelo de propósito general: no genera texto libre, no hace tool calling ni razonamiento multi-paso, por lo que no debe evaluarse con benchmarks de lenguaje.
- Los WER publicados están calculados tras normalización (minúsculas, eliminación de símbolos y puntuación), por lo que no son comparables directamente con métricas sin normalizar.
- Licencia MIT: permite uso comercial y modificación, pero el repositorio analizado es una subida de terceros (autor algorithco) con 0 descargas y 0 likes, creada y actualizada el 16 de septiembre de 2026; conviene verificar la integridad de los pesos y preferir el repositorio canónico distil-whisper/distil-large-v3.5 para uso en producción.
- El tamaño del repositorio (3,0 GB) sugiere pesos en fp32; para despliegue conviene convertir a fp16 o cuantizar, algo que no viene resuelto en el propio repositorio.
- La información proporcionada no incluye detalles sobre licencia de los datos de entrenamiento ni sobre el contenido exacto del corpus de 98.000 horas, lo que dificulta auditar posibles sesgos de origen.

## Enlaces

- Modelo en HuggingFace (subida analizada): https://huggingface.co/algorithco/distil-large-v3.5
- Repositorio canónico del modelo: https://huggingface.co/distil-whisper/distil-large-v3.5
- Modelo predecesor: https://huggingface.co/distil-whisper/distil-large-v3
- Profesor: https://huggingface.co/openai/whisper-large-v3
- Variante turbo del profesor: https://huggingface.co/openai/whisper-large-v3-turbo
- Artículo de destilación de Distil-Whisper: https://arxiv.org/abs/2311.00430
- Artículo sobre el profesor "patient": https://arxiv.org/abs/2106.05237
- Artículo de SpecAugment: https://arxiv.org/abs/1904.08779
- Artículo referenciado en las etiquetas del repositorio: https://arxiv.org/abs/1910.13267
- Leaderboard Open ASR: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Normalizador de texto de Whisper: https://github.com/openai/whisper/blob/main/whisper/normalizers/basic.py
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (corresponden a la banda musical Kraftklub), por lo que no se han podido incorporar enlaces adicionales relevantes.
