# Horizon-Labs/multilingual-punctuation-truecase-base

## Resumen

El modelo `multilingual-punctuation-truecase-base` es un modelo de clasificación de tokens desarrollado por Horizon-Labs que restaura, en una sola pasada, la puntuación y las mayúsculas en texto que carece de ambas. Está pensado para procesar la salida de sistemas de reconocimiento automático del habla (ASR), subtítulos y mensajes de chat, donde el texto suele aparecer en minúsculas y sin signos de puntuación. Para cada palabra predice el signo que la sigue (`.` `,` `?` `:` `-` o ninguno) y su capitalización (minúscula, inicial mayúscula o todo mayúsculas).

Técnicamente se basa en mmBERT-base de JHU CLSP, un transformer encoder de tipo ModernBERT con 307.544.082 parámetros totales. Se distribuye con pesos en safetensors y ONNX (incluida una versión cuantizada int8), lo que permite ejecución tanto en servidor como en navegador mediante transformers.js. Su rasgo diferencial es la cobertura: 88 idiomas de entrenamiento y evaluación adicional sobre los 199 idiomas de FLORES-200, con manejo nativo de signos específicos de escrituras no latinas (chino, japonés, hindi, bengala, árabe, griego o amárico).

Es relevante porque la restauración de puntuación y mayúsculas es un paso previo imprescindible para que las transcripciones ASR sean legibles y procesables por pipelines posteriores (traducción, resumen, análisis). La licencia Apache-2.0 y la disponibilidad de artefactos ONNX lo hacen apto para producción sin fricciones legales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-base) |
| Parámetros totales | 307.544.082 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (ONNX `model_quantized.onnx`, embeddings int8, 641 MB); fp32 |
| Idiomas soportados | 88 idiomas de entrenamiento (af, am, ar, az, be, bg, bn, bs, ca, ckb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, is, it, ja, jv, ka, kk, kn, ko, ky, lb, lt, lv, mk, ml, mn, mr, ms, mt, ne, nl, no, or, pa, pl, ps, pt, ro, ru, rw, sd, si, sk, sl, so, sq, sr, su, sv, sw, ta, te, tg, tl, tr, tt, ug, uk, ur, uz, vi, xh, yo, zh, zu) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un clasificador de tokens de 18 etiquetas con el formato `<marca>|<caso>` (por ejemplo `0|lower`, `.|Cap`, `,|UPPER`), construido sobre mmBERT-base, la variante multilingüe de ModernBERT publicada por JHU CLSP. La predicción de cada palabra se toma de la etiqueta de su último token, y el script auxiliar `truecase.py` convierte las etiquetas en texto final. El modelo escribe signos específicos por escritura: `，。？：` en chino y japonés (sin necesidad de segmentación de palabras), `।` en hindi y bengalí, `، ؟` en escritura árabe, `;` para preguntas en griego y `። ፣` en amárico.

El entrenamiento se realizó sobre los datasets HuggingFaceFW/fineweb-2 y HuggingFaceFW/fineweb. La entrada se pasa primero a minúsculas, ya que el modelo fue entrenado sobre texto en minúsculas y no aprovecha el casing preexistente. La evaluación se hizo sobre Europarl (12 idiomas), TED talks vía OPUS (25 idiomas) y FLORES-200 devtest (88 idiomas de entrenamiento y los 199 completos). La versión ONNX int8 predice la misma etiqueta que fp32 en el 99,92 % de los tokens sobre texto en minúsculas reservado para evaluación.

## Capacidades

- Restauración conjunta de puntuación y capitalización en una sola pasada sobre texto en minúsculas.
- Predicción de cinco marcas de puntuación (`.` `,` `?` `:` `-`) más la ausencia de marca, y tres clases de casing (lower, Capitalized, UPPER).
- Cobertura multilingüe de 88 idiomas de entrenamiento, con generalización evaluada sobre los 199 idiomas de FLORES-200.
- Manejo de signos de puntuación específicos de escrituras no latinas (chino, japonés, hindi, bengalí, árabe, griego, amárico).
- Procesamiento de textos largos mediante fragmentación con solapamiento en el helper incluido.
- Ejecución en navegador vía transformers.js con cuantización q8.
- Integración directa con el pipeline `token-classification` de transformers.
- No soporta tool calling, agentes ni generación de texto: es un modelo discriminativo de etiquetado.

## Casos de uso

- Postprocesado de transcripciones ASR: el modelo recibe la salida en minúsculas y sin puntuar de un sistema de reconocimiento del habla y devuelve texto legible con mayúsculas y signos, mejorando la calidad percibida de subtítulos y actas.
- Generación de subtítulos para vídeo: se aplica sobre los segmentos transcritos antes de exportarlos a SRT/VTT, con soporte para 88 idiomas y signos correctos por escritura (por ejemplo `，。？` en chino).
- Normalización de mensajes de chat y foros: convierte mensajes informales en minúsculas en texto presentable para moderación, búsqueda o resumen posterior.
- Preprocesado para pipelines de traducción automática: la puntuación restaurada mejora la segmentación de frases y la calidad de sistemas NMT que esperan texto puntuado.
- Enriquecimiento de datasets de bajo recurso: al generalizar a los 199 idiomas de FLORES-200 (incluidos 111 no vistos en entrenamiento), sirve para puntuar corpus multilingües en fase de curación.
- Procesamiento en el navegador: con la versión ONNX int8 y transformers.js, se puede ofrecer restauración de puntuación en aplicaciones web sin backend, con 641 MB de modelo cuantizado.
- Indexación y búsqueda de transcripciones: la capitalización y puntuación mejoran la tokenización y la relevancia en motores de búsqueda sobre archivos de audio transcritos.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a Casing F1 (media por idioma). No se han publicado resultados de Punctuation F1 ni de Casing accuracy en la información disponible.

| Modelo | Europarl, 12 idiomas | TED talks, 25 idiomas | FLORES, 88 idiomas | FLORES, 199 idiomas |
|---|---|---|---|---|
| Este modelo (307M) | 0.897 | 0.816 | 0.886 | 0.796 |
| multilingual-punctuation-truecase-small (140M) | 0.887 | 0.805 | 0.883 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,2-1,5 GB para pesos (307M parámetros) más memoria de activaciones, dependiente de la longitud de secuencia.
- VRAM estimada en ONNX int8: aproximadamente 641 MB de pesos, apta para CPU y entornos con poca memoria.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; A100, H100, L4 o RTX 4090 sobredimensionadas para este modelo, que se beneficia más de throughput en lote que de cómputo bruto.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3060, RTX 4060 y superiores; también en CPU gracias a la versión ONNX int8.
- Opciones de despliegue: pipeline `token-classification` de transformers, ONNX Runtime, transformers.js en navegador, y servidores de inferencia compatibles con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Casing F1 (Europarl) | Licencia | Formatos |
|---|---|---|---|---|---|
| multilingual-punctuation-truecase-base | 307M | 88 | 0.897 | Apache-2.0 | safetensors, ONNX |
| multilingual-punctuation-truecase-small | 140M | 89 (según tags) | 0.887 | Apache-2.0 | safetensors, ONNX |
| punctuation-restoration-base (Horizon-Labs) | no disponible | no disponible | no disponible (solo puntuación) | Apache-2.0 | no disponible |

La comparativa con modelos de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La entrada se pasa a minúsculas de forma obligatoria: el modelo no aprovecha el casing existente. Si el texto ya tiene mayúsculas y solo falta puntuación, debe usarse `punctuation-restoration-base`.
- Riesgo de alucinación de puntuación: al predecir marcas sobre texto sin ellas, puede insertar signos incorrectos en enumeraciones, siglas o dominios especializados.
- El rendimiento cae en idiomas no vistos: Casing F1 baja de 0,886 (88 idiomas de entrenamiento) a 0,796 sobre los 199 idiomas de FLORES-200.
- En escrituras sin mayúsculas (chino, japonés, árabe), la métrica de casing solo evalúa las palabras en escritura latina presentes en el texto.
- El modelo solo emite cinco marcas (`.` `,` `?` `:` `-`); no restaura `;`, `!` ni paréntesis, comillas u otros signos.
- No es un modelo generativo: no corrige errores ortográficos ni gramaticales del texto de entrada.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero conviene verificar la procedencia de los datos de entrenamiento (fineweb-2 y fineweb) para cumplimiento interno.
- El repo tiene 34 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-base
- Versión small: https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-small
- Modelo de solo puntuación: https://huggingface.co/Horizon-Labs/punctuation-restoration-base
- Demo en navegador (Space): https://huggingface.co/spaces/Horizon-Labs/multilingual-punctuation-truecase
- Modelo base mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset fineweb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
