# cstr/pcs-xlmr-base-GGUF

## Resumen

PCS (Punctuation + Capitalization + Segmentation) es un modelo de posprocesado de texto que restaura puntuación, mayúsculas y límites de frase en una sola pasada. Lo publica el usuario cstr como conversión a GGUF del modelo original `1-800-BAD-CODE/xlm-roberta_punctuation_fullstop_truecase`, pensada para integrarse en el ecosistema CrispASR (herramientas de reconocimiento de voz en C/C++ y Flutter). Resuelve un problema muy concreto: los backends ASR tipo wav2vec2, fastconformer-ctc, firered-asr, parakeet-ctc u omniasr-ctc producen transcripciones sin puntuar y en minúsculas, y este modelo las convierte en texto legible.

Arquitectura: encoder XLM-RoBERTa-base (12 capas, d=768, 12 cabezas, tokenizador SentencePiece) con cuatro cabezas de clasificación superpuestas para puntuación posterior a palabra, puntuación previa (¿, ¡), detección de límite de frase y truecasing carácter a carácter. Tiene 278.051.561 parámetros y cubre 47 idiomas vía el encoder multilingüe, aunque la calidad es mejor en los 12 idiomas con los que se entrenaron las cabezas.

Su relevancia práctica está en el tamaño: la cuantización por defecto Q4_K mixta ocupa 167 MB, lo que permite ejecutarlo en CPU en cualquier dispositivo, incluidos móviles, como paso de posprocesado barato tras la transcripción. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-base (transformer encoder) con 4 cabezas de clasificación |
| Parametros totales | 278.051.561 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del encoder XLM-RoBERTa-base; el autor no la especifica) |
| Tipos de cuantizacion | F32, Q8_0, Q4_K, Q4_K + imatrix, IQ4_XS + imatrix, Q4_K mixta (capa 0 del encoder y cabeza truecase en Q8_0) |
| Idiomas soportados | 47 (en, de, fr, es, it, pt, nl, pl, ru, uk, cs, da, sv, fi, el, bg, ro, sk, sl, lt, lv, et, hr, hu, zh, ja, ko, ar, hi, th, vi, tr, id, ms, tl, fa, he, ur, bn, ta, te, ml, kn, gu, pa, mr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también existe el modelo base en otros formatos vía el repo original) |

## Arquitectura y entrenamiento

El modelo es un encoder XLM-RoBERTa-base de 12 capas con dimensión oculta 768 y 12 cabezas de atención, sobre el que se montan cuatro cabezas lineales específicas de tarea: `post_punc` (Linear 768→256→17) para puntuación posterior a palabra, `pre_punc` (Linear 768→256→2) para signos de apertura como ¿ y ¡, `sbd` (Linear 772→128→2) para detección de límite de frase y `truecase` (Linear 769→128→16) para clasificación de mayúscula/minúscula por carácter. Las dimensiones 772 y 769 indican que estas dos últimas cabezas concatenan features adicionales al estado oculto del encoder.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO; estos datos corresponden al modelo original de 1-800-BAD-CODE y no se reproducen en la model card de la conversión GGUF. La innovación técnica destacable de esta publicación no está en el entrenamiento sino en la cuantización: el autor documenta que la cuantización uniforme a 4 bits degrada la decisión de truecasing (el logit para la `o` de `▁ok` pasa de +1.083 con pesos originales a −0.238 con Q4_K + imatrix, produciendo `I'm oK` en lugar de `I'm OK`). La receta mixta mantiene la capa 0 del encoder y la cabeza truecase en Q8_0, lo que recupera el logit hasta +0.688 y preserva las 67 decisiones de las cuatro cabezas y las 6 líneas de prueba, con solo +3,5 MB (+2,2 %) de sobrecoste.

## Capacidades

- Restauración de puntuación: inserta 17 tipos de signos (punto, coma, interrogación, exclamación, dos puntos, punto y coma, guiones, etc.) en texto sin puntuar.
- Truecasing: restaura mayúsculas y minúsculas correctas con clasificación carácter a carácter.
- Detección de límite de frase (SBD): identifica dónde termina una oración.
- Procesamiento conjunto de las tres tareas en una sola pasada del encoder.
- Soporte multilingüe en 47 idiomas vía XLM-RoBERTa, con calidad óptima en EN, DE, FR, ES, IT, PT, NL, PL, RU, UK, CS y DA.
- Integración como posprocesador de ASR en CrispASR (CLI y C API) y CrisperWeaver (GUI Flutter).
- Exposición vía FFI en Dart para aplicaciones Flutter.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento: es un modelo de clasificación de tokens, no generativo.

## Casos de uso

- Posprocesado de transcripciones ASR: tras ejecutar un backend como parakeet-ctc o wav2vec2 que devuelve texto en minúsculas y sin puntuar, PCS añade puntuación y mayúsculas en una pasada, dejando el texto listo para lectura o para alimentar un LLM.
- Subtitulado automático: los subtítulos generados por ASR suelen carecer de puntuación; PCS mejora la legibilidad y permite segmentar por frases con la cabeza SBD antes de exportar a SRT o VTT.
- Normalización de texto para pipelines NLP: antes de pasar texto a un modelo de análisis de sentimiento o extracción de entidades, PCS restaura la casing y los límites de frase, lo que mejora el rendimiento de tokenizadores y modelos downstream sensibles a mayúsculas.
- Transcripción de reuniones y notas de voz: en aplicaciones móviles o de escritorio con CrisperWeaver, PCS se ejecuta como paso automático tras la transcripción, con 167 MB de huella en disco y ejecución en CPU.
- Procesamiento por lotes en servidores sin GPU: al ser un modelo de 278 M de parámetros cuantizado a 4 bits, se puede ejecutar en CPU para normalizar grandes volúmenes de texto ASR sin coste de GPU.
- Limpieza de corpus multilingües: para datasets con texto en minúsculas y sin puntuar en cualquiera de los 47 idiomas soportados, PCS puede aplicarse como paso de preprocesado antes de entrenar modelos de lenguaje.
- Integración en aplicaciones C/C++: mediante la C API `crispasr_pcs_init` / `crispasr_pcs_process`, se puede incrustar en herramientas nativas de transcripción sin dependencias de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de clasificación de tokens y no de un modelo generativo. La model card sí incluye una validación de fidelidad de cuantización:

| Archivo | Logit de `o` (replay exacto) | 4 cabezas, 67 tokens | Decodificado, 6 líneas |
|---|---:|---:|---:|
| Pesos originales F32 | +1.083 | — | — |
| q8_0 | +0.992 | 67/67 | 6/6 |
| q4_k-mixed (por defecto) | +0.688 | 67/67 | 6/6 |
| q4_k-imatrix | −0.238 | 66/67 en AVX2 | 5/6 en AVX2 |

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo está pensado para inferencia en CPU.
- Huella en disco según cuantización: 154 MB (IQ4_XS), 163 MB (Q4_K o Q4_K + imatrix), 167 MB (Q4_K mixta, por defecto), 302 MB (Q8_0), 947 MB (F32).
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier tarjeta con más de 1 GB de memoria libre puede alojarlo.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en dispositivos móviles.
- Opciones de despliegue: CrispASR (CLI `crispasr-pcs`, C API, FFI Dart), CrisperWeaver (GUI Flutter). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de clasificación de tokens y no generativo.
- Latencia y throughput: no disponibles en la información proporcionada. El autor menciona que la variante q4_k-imatrix pierde una decisión en AVX2, lo que sugiere que el rendimiento depende de la extensión SIMD disponible.

## Comparativa con modelos similares

| Modelo | Idiomas | Puntuación | Truecasing | SBD | Tamaño (Q4_K) |
|---|---|---|---|---|---|
| **PCS** | 47 | 17 tipos | por carácter | sí | 167 MB |
| FireRedPunc | ZH + EN | sí | sí | no | ~100 MB |
| Fullstop-punc | EN/DE/FR/IT | sí | sí | no | ~300 MB |
| Truecaser LSTM | DE/EN/ES/RU | no | sí | no | ~3 MB |

PCS es el único de la comparativa que cubre las tres tareas (puntuación, truecasing y SBD) y el que más idiomas soporta (47), a costa de un tamaño mayor que FireRedPunc y Truecaser LSTM, aunque menor que Fullstop-punc.

## Limitaciones y advertencias

- La calidad es mejor en los 12 idiomas de entrenamiento de las cabezas (EN, DE, FR, ES, IT, PT, NL, PL, RU, UK, CS, DA); en el resto de los 47 idiomas del encoder la generalización es menor y no está cuantificada.
- La cuantización agresiva a 4 bits puede degradar decisiones de truecasing; se recomienda usar la variante mixta por defecto o Q8_0 si la fidelidad es crítica.
- El modelo no genera texto: solo clasifica tokens, por lo que no puede corregir errores léxicos ni gramaticales del ASR, solo añadir puntuación y casing.
- Riesgo de alucinación bajo en el sentido generativo, pero puede insertar puntuación incorrecta en textos ambiguos o con estructuras atípicas (listas, código, URLs).
- No se documentan sesgos específicos del modelo; al derivar de XLM-RoBERTa, puede heredar sesgos del corpus multilingüe original.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas.
- El proyecto depende del ecosistema CrispASR/CrisperWeaver; fuera de ese ecosistema no hay integración documentada con frameworks estándar de Python (transformers, ONNX Runtime) en esta conversión GGUF, aunque el modelo base original sí está disponible en otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cstr/pcs-xlmr-base-GGUF
- Modelo base original: https://huggingface.co/1-800-BAD-CODE/xlm-roberta_punctuation_fullstop_truecase
- Repositorio CrispASR: https://github.com/CrispStrobe/CrispASR
- Repositorio CrisperWeaver: https://github.com/CrispStrobe/CrisperWeaver
- Análisis de la causa raíz de la degradación por cuantización: https://github.com/CrispStrobe/CrispEmbed/blob/main/docs/pcs-quality-root-cause.md
