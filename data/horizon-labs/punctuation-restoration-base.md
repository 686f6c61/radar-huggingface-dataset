# Horizon-Labs/punctuation-restoration-base

## Resumen

Punctuation-restoration-base es un modelo de clasificación de tokens desarrollado por Horizon-Labs que restaura la puntuación en textos que carecen de ella, un paso habitual en los pipelines de reconocimiento automático del habla (ASR), subtitulado, OCR o textos extraídos de la web. Tras cada palabra predice uno de cinco signos (`.`, `,`, `?`, `:`, `-`) o ninguno, y funciona en 88 idiomas con independencia del uso de mayúsculas, incluida la salida totalmente en minúsculas típica de muchos sistemas ASR.

El modelo se construye sobre `jhu-clsp/mmBERT-base`, un encoder multilingüe de arquitectura ModernBERT, y cuenta con 307.534.854 parámetros totales. Se distribuye bajo licencia Apache-2.0 con pesos en safetensors y ficheros ONNX (incluida una versión int8) para inferencia en CPU y en el navegador mediante transformers.js.

Su relevancia práctica radica en que es intercambiable con los modelos de referencia del ecosistema (`oliverguhr/fullstop-punctuation-multilang-large` y `kredor/punctuate-all`), ya que emplea el mismo conjunto de etiquetas, y en que cubre un abanico de idiomas mucho mayor que las alternativas habituales, manteniendo una calidad competitiva en las evaluaciones publicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), base mmBERT-base |
| Parametros totales | 307.534.854 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el helper procesa textos largos en fragmentos solapados) |
| Tipos de cuantizacion | ONNX int8 (embeddings cuantizados, 641 MB); pesos fp32 en safetensors |
| Idiomas soportados | 88 idiomas (af, am, ar, az, be, bg, bn, bs, ca, ckb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, is, it, ja, jv, ka, kk, kn, ko, ky, lb, lt, lv, mk, ml, mn, mr, ms, mt, ne, nl, no, or, pa, pl, ps, pt, ro, ru, rw, sd, si, sk, sl, so, sq, sr, su, sv, sw, ta, te, tg, tl, tr, tt, ug, uk, ur, uz, vi, xh, yo, zh, zu) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 y quantized int8) |
| Pipeline | token-classification |
| Etiquetas | `0`, `.`, `,`, `?`, `-`, `:` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado a partir de `jhu-clsp/mmBERT-base`. La tarea se formula como clasificación de tokens: cada palabra recibe la etiqueta de su último subtoken, lo que permite aplicar el modelo a idiomas con escritura sin espacios (chino y japonés) sin necesidad de segmentación previa. En la inferencia multilingüe, el helper incluido sustituye los signos por sus equivalentes locales (`，。？：` en chino y japonés, `।` en hindi y bengalí, `، ؟` en escrituras árabes, `;` para interrogación en griego y `። ፣` en amárico).

Los datos de entrenamiento proceden de `HuggingFaceFW/fineweb` y `HuggingFaceFW/fineweb-2`. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron etapas de ajuste fino supervisado adicionales, RLHF o DPO; esos datos no están disponibles en la información proporcionada. La evaluación se realizó sobre conjuntos que no formaron parte del entrenamiento (FLORES-200, TED talks y Europarl), y los autores indican explícitamente que nunca entrenaron con Europarl, a diferencia de los modelos de referencia.

## Capacidades

- Restauración de puntuación en 88 idiomas, con independencia de mayúsculas y minúsculas.
- Predicción de cinco signos (`.`, `,`, `?`, `:`, `-`) o ausencia de marca.
- Funcionamiento en chino y japonés sin segmentación de palabras.
- Localización de signos según la escritura (signos CJK, devanagari, árabe, griego, amárico).
- Procesamiento de textos largos mediante fragmentado con solapamiento a través del helper `punctuate.py`.
- Compatibilidad directa con el paquete `deepmultilingualpunctuation` como reemplazo del modelo por defecto.
- Inferencia en CPU y en navegador mediante ONNX y transformers.js.
- No modifica el texto: no altera mayúsculas ni las palabras, solo inserta puntuación.

## Casos de uso

- Post-procesado de transcripciones ASR: restaurar puntos, comas e interrogaciones en la salida de sistemas de reconocimiento de voz que emiten texto sin puntuar ni mayúsculas, mejorando la legibilidad y la calidad de los subtítulos automáticos.
- Subtitulado y accesibilidad: segmentar en frases y añadir puntuación a pistas de subtítulos generadas automáticamente, lo que facilita su lectura y su sincronización con el audio.
- Preparación de corpus para entrenamiento: normalizar textos extraídos de la web u OCR sin puntuación antes de incorporarlos a pipelines de datos para modelos de lenguaje.
- Procesamiento de notas de voz y mensajes de chat: reconstruir la puntuación de transcripciones de mensajería o asistentes de voz para presentarlas al usuario de forma legible.
- Limpieza de texto OCR: restaurar la puntuación en documentos escaneados que han perdido los signos durante el reconocimiento óptico.
- Búsqueda y recuperación de información: mejorar la segmentación en frases de documentos sin puntuar para indexación y chunking en sistemas RAG.
- Aplicaciones en el navegador: usar la versión ONNX cuantizada con transformers.js para restaurar puntuación en el cliente sin backend, por ejemplo en herramientas de dictado web.

## Benchmarks y rendimiento

Puntuación F1 micro-promediada sobre los cinco signos, promediada entre idiomas. La entrada es el párrafo sin `. , ? : ; ! -`, una vez con mayúsculas originales y otra en minúsculas.

| Modelo | Licencia | Idiomas | FLORES 12 EU (cased) | FLORES 12 EU (lower) | FLORES 88 (cased) | FLORES 88 (lower) | TED 25 (cased) | TED 25 (lower) | Europarl 12 (cased) | Europarl 12 (lower) |
|---|---|---|---|---|---|---|---|---|---|---|
| Este modelo (307M) | Apache-2.0 | 88 | 0.922 | 0.891 | 0.847 | 0.804 | 0.795 | 0.722 | 0.881 | 0.839 |
| punctuation-restoration-small (140M) | Apache-2.0 | 88 | 0.920 | 0.883 | 0.842 | 0.796 | 0.786 | 0.706 | no disponible en la información proporcionada | no disponible en la información proporcionada |

Los resultados de los modelos de referencia (`oliverguhr/fullstop-punctuation-multilang-large`, `kredor/punctuate-all`) no se incluyen en la información proporcionada. Cabe señalar que Europarl es dominio de entrenamiento para esos modelos, pero no para este.

## Requisitos de hardware

- El modelo fp32 ocupa aproximadamente 1,2 GB en memoria (307M parámetros a 4 bytes); el repositorio completo pesa 6,2 GB por incluir múltiples formatos.
- La versión ONNX int8 (`onnx/model_quantized.onnx`) pesa 641 MB y predice la misma etiqueta que fp32 en el 99,93 % de los tokens sobre texto reservado.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU para cargas moderadas.
- Despliegue mediante `transformers` (pipeline de token-classification), ONNX Runtime, transformers.js en el navegador y el helper `punctuate.py`.
- El paquete `deepmultilingualpunctuation` requiere transformers 4.x, ya que transformers 5 eliminó `grouped_entities`.
- Latencia y throughput no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Etiquetas | Notas |
|---|---|---|---|---|---|
| Horizon-Labs/punctuation-restoration-base | 307M | 88 | Apache-2.0 | `0 . , ? - :` | Base ModernBERT (mmBERT); ONNX incluido |
| Horizon-Labs/punctuation-restoration-small | 140M | 88 | Apache-2.0 | `0 . , ? - :` | Versión más rápida y ligera; F1 ligeramente inferior |
| oliverguhr/fullstop-punctuation-multilang-large | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | `0 . , ? - :` | Entrenado en Europarl; requiere transformers 4.x |
| kredor/punctuate-all | no disponible en la información proporcionada | 12 | no disponible en la información proporcionada | `0 . , ? - :` | Entrenado en Europarl; cubre los 12 idiomas EU |

## Limitaciones y advertencias

- Solo restaura puntuación: no cambia mayúsculas ni altera las palabras. Para textos en minúsculas que también requieran mayúsculas hace falta un modelo adicional (por ejemplo, `multilingual-punctuation-truecase-base`).
- La cobertura de calidad por idioma puede variar; los benchmarks promedian sobre idiomas y no ofrecen garantías por lengua individual.
- Puede introducir puntuación incorrecta en textos ambiguos o mal transcritos, especialmente con salida ASR ruidosa.
- No se detallan sesgos conocidos en la información proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de los modelos base y datasets empleados.
- El uso con `deepmultilingualpunctuation` está limitado a transformers 4.x.
- Los datos de entrenamiento (número de tokens, composición exacta) no están disponibles, lo que dificulta auditar posibles sesgos de dominio.

## Enlaces

- [HuggingFace: Horizon-Labs/punctuation-restoration-base](https://huggingface.co/Horizon-Labs/punctuation-restoration-base)
- [Demo en el navegador (Space)](https://huggingface.co/spaces/Horizon-Labs/punctuation-restoration)
- [Modelo base: jhu-clsp/mmBERT-base](https://huggingface.co/jhu-clsp/mmBERT-base)
- [Versión pequeña: punctuation-restoration-small](https://huggingface.co/Horizon-Labs/punctuation-restoration-small)
- [Modelo con mayúsculas: multilingual-punctuation-truecase-base](https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-base)
- [oliverguhr/fullstop-punctuation-multilang-large](https://huggingface.co/oliverguhr/fullstop-punctuation-multilang-large)
- [kredor/punctuate-all](https://huggingface.co/kredor/punctuate-all)
- [Repositorio deepmultilingualpunctuation](https://github.com/oliverguhr/deepmultilingualpunctuation)
- [Dataset HuggingFaceFW/fineweb](https://huggingface.co/datasets/HuggingFaceFW/fineweb)
- [Dataset HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
