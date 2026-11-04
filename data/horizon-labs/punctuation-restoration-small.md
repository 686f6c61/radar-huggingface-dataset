# Horizon-Labs/punctuation-restoration-small

## Resumen

Punctuation-restoration-small es un modelo de clasificación de tokens desarrollado por Horizon-Labs que restaura la puntuación en textos que carecen de ella: transcripciones de ASR, subtítulos, mensajes de chat, notas de voz o texto extraído por OCR. El modelo predice, tras cada palabra, una de cinco marcas (`.`, `,`, `?`, `:`, `-`) o ninguna, y lo hace en 88 idiomas con independencia del uso de mayúsculas, lo que incluye la salida en minúsculas típica de muchos sistemas de reconocimiento de voz.

El modelo se construye sobre mmBERT-small, un encoder de la familia ModernBERT, y cuenta con 140.643.846 parámetros totales. Se distribuye bajo licencia Apache-2.0 e incluye pesos en safetensors y ficheros ONNX (incluida una versión cuantizada int8 de 268 MB) para ejecución en CPU y en navegador mediante transformers.js. Su relevancia actual radica en que cubre un hueco práctico en pipelines de ASR y transcripción multilingüe con un coste computacional bajo y una licencia permisiva para uso comercial.

La ficha del autor indica compatibilidad directa con el paquete `deepmultilingualpunctuation` y con las etiquetas de `oliverguhr/fullstop-punctuation-multilang-large` y `kredor/punctuate-all`, lo que facilita su adopción como reemplazo en infraestructuras existentes. Existe una variante mayor, punctuation-restoration-base (307M), para quienes priorizan precisión sobre latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base mmBERT-small) para token classification |
| Parametros totales | 140.643.846 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el helper procesa textos largos en fragmentos solapados) |
| Tipos de cuantizacion | int8 (ONNX `model_quantized.onnx`, 268 MB); fp32 en safetensors; q8 en transformers.js |
| Idiomas soportados | 88 idiomas (af, am, ar, az, be, bg, bn, bs, ca, ckb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, is, it, ja, jv, ka, kk, kn, ko, ky, lb, lt, lv, mk, ml, mn, mr, ms, mt, ne, nl, no, or, pa, pl, ps, pt, ro, ru, rw, sd, si, sk, sl, so, sq, sr, su, sv, sw, ta, te, tg, tl, tr, tt, ug, uk, ur, uz, vi, xh, yo, zh, zu) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado a partir de `jhu-clsp/mmBERT-small`, un modelo multilingüe de la familia mmBERT. La tarea es de clasificación de tokens: cada palabra recibe la etiqueta de su último token, con seis clases posibles (`0` para ninguna marca, más `.`, `,`, `?`, `:`, `-`). El modelo no modifica el texto ni las mayúsculas: solo inserta puntuación.

Según la model card, el entrenamiento emplea los datasets HuggingFaceFW/fineweb-2 y HuggingFaceFW/fineweb. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en una tarea de etiquetado). La evaluación se realizó sobre FLORES-200, TED talks (TED2020 vía OPUS) y Europarl, con un protocolo común en el que se eliminan las marcas `. , ? : ; ! -` del texto de entrada y se prueba con casing original y en minúsculas.

Entre las innovaciones prácticas destacan: soporte nativo de chino y japonés sin segmentación de palabras (el script `punctuate.py` escribe `，。？：`), adaptación de signos por idioma (`।` en hindi y bengalí, `، ؟` en escritura árabe, `;` para preguntas en griego, `። ፣` en amárico), y una versión ONNX int8 que predice la misma etiqueta que fp32 en el 99,96 % de los tokens sobre texto reservado.

## Capacidades

- Restauración de puntuación en 88 idiomas, incluyendo lenguas de escritura latina, cirílica, árabe, devanagari, han y kana.
- Funciona con texto en mayúsculas, minúsculas o casing mixto, lo que cubre la salida típica de sistemas ASR.
- Predicción de cinco marcas (`.`, `,`, `?`, `:`, `-`) o ausencia de marca, con etiquetas compatibles con `deepmultilingualpunctuation`.
- Manejo de chino y japonés sin segmentación de palabras previa mediante el helper incluido.
- Adaptación de signos de puntuación por idioma (hindi, bengalí, árabe, griego, amárico).
- Procesamiento de textos largos mediante fragmentos solapados en el script `punctuate.py`.
- Ejecución en CPU y en navegador vía ONNX y transformers.js (dtype q8).
- Integración directa con el pipeline `token-classification` de transformers.
- No realiza truecasing: para restaurar mayúsculas hay que combinar con `multilingual-punctuation-truecase-small`.

## Casos de uso

- Postprocesado de transcripciones ASR: el modelo inserta puntuación en la salida en minúsculas de motores de reconocimiento de voz, mejorando la legibilidad de subtítulos y actas sin necesidad de reentrenar el ASR. Es adecuado por su cobertura de 88 idiomas y su tolerancia al texto sin casing.
- Generación de subtítulos para vídeo: en pipelines de subtitulado automático (por ejemplo, TED talks o contenido divulgativo), el modelo añade comas y puntos a los segmentos generados por el reconocedor, reduciendo el trabajo de revisión manual.
- Limpieza de texto extraído por OCR: documentos escaneados suelen perder puntuación; el modelo la restaura antes de indexar el contenido en un motor de búsqueda o en un sistema RAG.
- Normalización de mensajes de chat y notas de voz: en aplicaciones de mensajería o asistentes de voz, el modelo convierte transcripciones sin puntuar en texto legible antes de mostrarlo o almacenarlo.
- Preprocesado para traducción automática: insertar puntuación antes de enviar texto a un traductor mejora la segmentación de frases y la calidad de la traducción, especialmente en textos largos sin marcas.
- Ejecución en el navegador: gracias a los ficheros ONNX int8 y transformers.js, se puede integrar en aplicaciones web que puntúan texto localmente sin enviar datos a un servidor, útil por privacidad y latencia.
- Enriquecimiento de corpus para investigación lingüística: normalizar grandes volúmenes de texto multilingüe (fineweb, Europarl) para análisis de estructura discursiva con un coste de cómputo bajo.
- Compatibilidad con infraestructuras existentes: sustituir `oliverguhr/fullstop-punctuation-multilang-large` o `kredor/punctuate-all` en código que use `deepmultilingualpunctuation` sin cambiar la lógica de integración.

## Benchmarks y rendimiento

Resultados publicados en la model card. La métrica es F1 de puntuación micro-promediado sobre las cinco marcas, promediado entre idiomas. Cada modelo recibe el mismo texto sin `. , ? : ; ! -`, con casing original y en minúsculas.

| Modelo | Licencia | Idiomas | FLORES 12 EU (cased) | FLORES 12 EU (lower) | FLORES 88 (cased) | FLORES 88 (lower) | TED 25 (cased) | TED 25 (lower) | Europarl 12 (cased) | Europarl 12 (lower) |
|---|---|---|---|---|---|---|---|---|---|---|
| Este modelo (140M) | Apache-2.0 | 88 | 0,920 | 0,883 | 0,842 | 0,796 | 0,786 | 0,706 | 0,878 | 0,830 |
| punctuation-restoration-base (307M) | Apache-2.0 | 88 | 0,922 | 0,891 | 0,847 | 0,804 | 0,795 | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks para este modelo frente a `oliverguhr/fullstop-punctuation-multilang-large` ni `kredor/punctuate-all`, aunque la model card indica que el protocolo de evaluación es común y que estos últimos se entrenaron sobre Europarl (columna in-domain para ellos).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para los 140M parámetros; en torno a 0,3 GB con la versión ONNX int8 (268 MB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o RTX 3060 ejecutan el modelo con holgura.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; también en CPU.
- Despliegue: transformers (pipeline `token-classification`), ONNX Runtime, transformers.js en navegador, y el paquete `deepmultilingualpunctuation` como reemplazo directo. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a un encoder de clasificación de tokens).
- Latencia y throughput: no disponibles en la información proporcionada. El helper procesa textos largos en fragmentos solapados, lo que añade un coste proporcional a la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Horizon-Labs/punctuation-restoration-small | 140M | 88 | no disponible | Apache-2.0 | safetensors, ONNX | Modelo de esta ficha; incluye ONNX int8 y soporte transformers.js |
| Horizon-Labs/punctuation-restoration-base | 307M | 88 | no disponible | Apache-2.0 | no disponible | Variante mayor del mismo autor; F1 ligeramente superior en FLORES |
| oliverguhr/fullstop-punctuation-multilang-large | no disponible | multilingüe (no se detalla) | no disponible | no disponible | no disponible | Etiquetas compatibles; entrenado sobre Europarl |
| kredor/punctuate-all | no disponible | 12 idiomas (columnas FLORES) | no disponible | no disponible | no disponible | Etiquetas compatibles; entrenado sobre Europarl |

## Limitaciones y advertencias

- El modelo solo restaura puntuación: no modifica mayúsculas ni el texto original. Para truecasing hay que combinar con `multilingual-punctuation-truecase-small`.
- La cobertura de 88 idiomas no implica el mismo rendimiento en todos ellos; la F1 en FLORES cae de 0,920 (12 lenguas europeas) a 0,842 (las 88), y en minúsculas a 0,796.
- El rendimiento en estilo hablado es inferior: 0,786 en TED talks con casing original y 0,706 en minúsculas.
- Riesgo de alucinación de puntuación: puede insertar marcas incorrectas en textos ambiguos o en dominios alejados de los datos de entrenamiento (fineweb, fineweb-2).
- No se detalla en la información disponible el tratamiento de sesgos lingüísticos ni la composición exacta del dataset de entrenamiento.
- La longitud de contexto no está especificada; los textos largos requieren el helper con fragmentos solapados, lo que puede introducir discontinuidades en las fronteras.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia de los datasets de entrenamiento subyacentes (fineweb y fineweb-2) para usos sensibles.
- La compatibilidad con `deepmultilingualpunctuation` requiere transformers 4.x, ya que ese paquete pasa `grouped_entities`, eliminado en transformers 5.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/punctuation-restoration-small
- Variante base: https://huggingface.co/Horizon-Labs/punctuation-restoration-base
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo de truecasing complementario: https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-small
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/punctuation-restoration
- Paquete compatible deepmultilingualpunctuation: https://github.com/oliverguhr/deepmultilingualpunctuation
- Modelo de referencia con etiquetas compatibles: https://huggingface.co/oliverguhr/fullstop-punctuation-multilang-large
- Modelo de referencia con etiquetas compatibles: https://huggingface.co/kredor/punctuate-all
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset fineweb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
