# Horizon-Labs/punctuation-restoration-small

## Resumen

Punctuation Restoration (small) es un modelo de etiquetado de tokens (token classification) desarrollado por Horizon-Labs que restaura los signos de puntuación en texto que carece de ellos. Resulta especialmente útil para transcribir salidas de sistemas de reconocimiento automático del habla (ASR), subtítulos, mensajes de chat, notas de voz o texto extraído por OCR. Tras cada palabra predice uno de cinco signos (`.`, `,`, `?`, `:`, `-`) o la ausencia de marca, y lo hace en 88 idiomas.

El modelo se construye sobre jhu-clsp/mmBERT-small, un encoder de la familia ModernBERT de aproximadamente 140,6 millones de parámetros y licencia Apache-2.0. Su tamaño reducido permite ejecución en CPU e incluso en el navegador mediante los ficheros ONNX incluidos y transformers.js, lo que lo hace atractivo para pipelines de post-procesado de ASR de bajo coste y despliegue en el borde.

Su relevancia actual radica en que la mayoría de los sistemas ASR generan texto sin puntuar y en minúsculas, lo que degrada la legibilidad y rompe tareas posteriores (segmentación de frases, traducción, resumen). Este modelo cubre ese hueco con cobertura multilingüe amplia, licencia permisiva y compatibilidad directa con el paquete `deepmultilingualpunctuation`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base mmBERT-small) |
| Parametros totales | 140.643.846 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa textos largos por chunks solapados con el helper incluido) |
| Tipos de cuantizacion | ONNX int8 (embeddings), fp32; cuantizacion q8 para transformers.js |
| Idiomas soportados | 88 idiomas (af, am, ar, az, be, bg, bn, bs, ca, ckb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, is, it, ja, jv, ka, kk, kn, ko, ky, lb, lt, lv, mk, ml, mn, mr, ms, mt, ne, nl, no, or, pa, pl, ps, pt, ro, ru, rw, sd, si, sk, sl, so, sq, sr, su, sv, sw, ta, te, tg, tl, tr, tt, ug, uk, ur, uz, vi, xh, yo, zh, zu) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (incluye modelo cuantizado int8 de 268 MB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado a partir de jhu-clsp/mmBERT-small, un modelo multilingüe de aproximadamente 140 millones de parámetros. La tarea es de etiquetado de tokens: la etiqueta de cada palabra corresponde a la etiqueta de su último token, con seis clases posibles (`0`, `.`, `,`, `?`, `:`, `-`), donde `0` indica ausencia de marca. El esquema de etiquetas es idéntico al de oliverguhr/fullstop-punctuation-multilang-large y kredor/punctuate-all, lo que permite usarlo como reemplazo directo en el paquete `deepmultilingualpunctuation`.

El entrenamiento emplea los conjuntos HuggingFaceFW/fineweb-2 y HuggingFaceFW/fineweb como datos de partida, según los metadatos del repositorio. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no procede en una tarea de etiquetado). El modelo no modifica mayúsculas ni las palabras: solo inserta puntuación. Para texto en minúsculas que también requiera mayúsculas, el autor remite a multilingual-punctuation-truecase-small. El helper `punctuate.py` gestiona textos largos mediante chunks solapados y aplica signos específicos por escritura: `，。？：` en chino y japonés, `।` en hindi y bengalí, `، ؟` en escritura árabe, `;` para preguntas en griego y `። ፣` en amárico. La versión ONNX cuantizada a int8 en embeddings (268 MB) predice la misma etiqueta que fp32 para el 99,96 % de los tokens en texto reservado.

## Capacidades

- Restauración de puntuación en 88 idiomas sobre texto sin marcas, con independencia del uso de mayúsculas (admite entrada totalmente en minúsculas).
- Predicción de cinco signos (`.`, `,`, `?`, `:`, `-`) más la clase "sin marca" tras cada palabra.
- Soporte de chino y japonés sin segmentación de palabras previa mediante el helper incluido.
- Aplicación de signos específicos por escritura (chino/japonés, hindi/bengalí, árabe, griego, amárico).
- Procesamiento de textos largos mediante chunks solapados.
- Inferencia en CPU y en navegador gracias a ONNX y transformers.js.
- Compatibilidad como drop-in con `deepmultilingualpunctuation` y con el pipeline `token-classification` de transformers.
- No realiza truecasing ni corrección ortográfica: solo inserta puntuación.

## Casos de uso

- Post-procesado de transcripciones ASR: insertar puntuación en la salida en minúsculas de sistemas de reconocimiento del habla para mejorar la legibilidad y permitir segmentación en frases antes de tareas posteriores como traducción o resumen.
- Generación de subtítulos: puntuar transcripciones de vídeo o audio para producir subtítulos legibles, con cobertura de 88 idiomas y ejecución en CPU que abarata el pipeline.
- Limpieza de texto extraído por OCR o scraping: restaurar puntuación en documentos digitalizados o texto web sin marcas antes de indexarlo o analizarlo.
- Preprocesado para traducción automática: segmentar correctamente el texto de entrada para mejorar la calidad de los sistemas de traducción que dependen de fronteras de frase.
- Procesamiento de mensajes de chat y notas de voz: normalizar mensajes informales sin puntuación para su análisis, moderación o archivado.
- Despliegue en el navegador o en el borde: usar la versión ONNX int8 (268 MB) con transformers.js para puntuar texto en cliente sin enviar datos a un servidor.
- Integración en pipelines existentes: sustituir modelos de puntuación previos en el paquete `deepmultilingualpunctuation` sin cambiar el código de la aplicación.

## Benchmarks y rendimiento

Puntuación F1 micro-promediada sobre los cinco signos, promediada entre idiomas. La entrada elimina `. , ? : ; ! -` y se evalúa con casing original y en minúsculas. Los conjuntos de test se usaron solo para evaluación.

| Modelo | Licencia | Idiomas | FLORES 12 UE (cased) | FLORES 12 UE (lower) | FLORES 88 idiomas (cased) | FLORES 88 idiomas (lower) | TED 25 idiomas (cased) | TED 25 idiomas (lower) | Europarl 12 (cased) | Europarl 12 (lower) |
|---|---|---|---|---|---|---|---|---|---|---|
| **este modelo** (140M) | Apache-2.0 | 88 | 0.920 | 0.883 | 0.842 | 0.796 | 0.786 | 0.706 | 0.878 | 0.830 |
| punctuation-restoration-base (307M) | Apache-2.0 | 88 | 0.922 | 0.891 | 0.847 | 0.804 | 0.795 | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks para otros modelos comparables (MMLU, HumanEval, GSM8K no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene 140,6 M de parámetros. En fp32 ocupa aproximadamente 560 MB de pesos; en ONNX int8, unos 268 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutarlo con holgura.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de memoria libre, y también en CPU.
- Opciones de despliegue: transformers (pipeline `token-classification`), ONNX Runtime, transformers.js en el navegador, y el paquete `deepmultilingualpunctuation` como drop-in.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **este modelo** | 140,6 M | 88 | no disponible (chunks solapados) | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| punctuation-restoration-base | 307 M | 88 | no disponible | Apache-2.0 | Hugging Face |
| oliverguhr/fullstop-punctuation-multilang-large | no disponible | multilingue (12 en benchmarks) | no disponible | no disponible | Hugging Face |
| kredor/punctuate-all | no disponible | 12 (benchmarks) | no disponible | no disponible | Hugging Face |

El modelo base (307M) obtiene puntuaciones ligeramente superiores en FLORES y TED, a costa de duplicar el tamaño. Los modelos fullstop y punctuate-all fueron entrenados sobre Europarl, por lo que su columna Europarl es in-domain y no directamente comparable.

## Limitaciones y advertencias

- Solo restaura puntuación: no modifica mayúsculas ni corrige palabras; para truecasing hay que combinar con otro modelo.
- Riesgo de alucinación de puntuación: puede insertar signos donde no corresponden o omitirlos en fronteras ambiguas, especialmente en texto sin casing.
- El rendimiento cae en texto en minúsculas (por ejemplo, 0.706 frente a 0.786 en TED), típico de salidas ASR.
- No se detallan sesgos conocidos en la model card; al entrenarse sobre FineWeb y FineWeb-2 puede heredar sesgos de esos corpus web.
- La cobertura de 88 idiomas no garantiza calidad uniforme; los benchmarks publicados cubren 12, 25 y 88 idiomas según el conjunto.
- Licencia Apache-2.0, permisiva para uso comercial, sin restricciones adicionales indicadas.
- Para producción, conviene validar la calidad en el idioma y dominio concretos, y considerar el modelo base si se necesita mayor precisión.

## Enlaces

- Hugging Face: https://huggingface.co/Horizon-Labs/punctuation-restoration-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Versión base (307M): https://huggingface.co/Horizon-Labs/punctuation-restoration-base
- Modelo truecasing: https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-small
- Demo en navegador: https://huggingface.co/spaces/Horizon-Labs/punctuation-restoration
- Paquete compatible: https://github.com/oliverguhr/deepmultilingualpunctuation
- Modelo de referencia de etiquetas: https://huggingface.co/oliverguhr/fullstop-punctuation-multilang-large
- Modelo de referencia de etiquetas: https://huggingface.co/kredor/punctuate-all
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb
