# Horizon-Labs/multilingual-punctuation-truecase-base

## Resumen

El modelo `multilingual-punctuation-truecase-base` es un sistema de etiquetado de tokens (token classification) desarrollado por Horizon-Labs que restaura de forma conjunta la puntuación y las mayúsculas en texto que carece de ambas, típicamente la salida de sistemas de reconocimiento automático del habla (ASR), subtítulos automáticos o mensajes de chat. Para cada palabra predice el signo que la sigue (`.` `,` `?` `:` `-` o ninguno) y su capitalización (minúscula, inicial mayúscula o todo mayúsculas), resolviendo en una sola pasada dos tareas que habitualmente requieren dos modelos separados.

Está construido sobre `jhu-clsp/mmBERT-base`, un encoder transformer de tipo ModernBERT multilingüe, y cuenta con 307.544.082 parámetros totales. Cubre 88 idiomas de entrenamiento y ha sido evaluado en hasta 199 idiomas de FLORES-200, lo que lo sitúa como una pieza de preprocesado/postprocesado lingüístico de amplio espectro. Su licencia Apache-2.0 y la disponibilidad de pesos en safetensors y ONNX (incluida una versión int8 para CPU y navegador vía transformers.js) facilitan su integración en pipelines de producción.

Su relevancia actual radica en que la restauración de puntuación y capitalización es un paso crítico para hacer legibles las transcripciones ASR y para alimentar modelos posteriores que dependen de una segmentación oracional correcta. La novedad frente a alternativas monolingües o de menor cobertura es la combinación de ambas tareas en un único modelo multilingüe con etiquetas que se adaptan a la escritura del idioma (puntuación CJK, devanagari, árabe, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-base) para token classification |
| Parametros totales | 307.544.082 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa textos largos en fragmentos solapados mediante el helper `truecase.py`) |
| Tipos de cuantizacion | ONNX int8 (`onnx/model_quantized.onnx`, embeddings int8, 641 MB); pesos fp32 en safetensors; `dtype: "q8"` en transformers.js |
| Idiomas soportados | 88 idiomas de entrenamiento (af, am, ar, az, be, bg, bn, bs, ca, ckb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, is, it, ja, jv, ka, kk, kn, ko, ky, lb, lt, lv, mk, ml, mn, mr, ms, mt, ne, nl, no, or, pa, pl, ps, pt, ro, ru, rw, sd, si, sk, sl, so, sq, sr, su, sv, sw, ta, te, tg, tl, tr, tt, ug, uk, ur, uz, vi, xh, yo, zh, zu) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 y quantized int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT (la familia mmBERT) configurado como clasificador de tokens con 18 etiquetas que combinan marca de puntuación y clase de capitalización (`0|lower`, `.|Cap`, `,|UPPER`, etc.). La etiqueta de cada palabra se toma del último token de la palabra, de modo que el modelo funciona con el pipeline estándar de `token-classification` de transformers y con transformers.js. El helper `truecase.py` traduce las etiquetas a texto final y gestiona textos largos mediante fragmentación con solapamiento.

El entrenamiento parte del modelo base `jhu-clsp/mmBERT-base` y utiliza los datasets `HuggingFaceFW/fineweb-2` y `HuggingFaceFW/fineweb` como fuentes de texto. La entrada se pasa siempre en minúsculas, ya que el modelo fue entrenado sobre texto sin capitalización y no aprovecha las mayúsculas presentes en la entrada; para texto ya capitalizado que solo necesita puntuación existe el modelo hermano `punctuation-restoration-base`. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO (no procede en una tarea de etiquetado). Una innovación destacable es la adaptación de las marcas de puntuación a la escritura de cada idioma: escribe `，。？：` en chino y japonés sin necesidad de segmentación de palabras, `।` en hindi y bengalí, `، ؟` en escritura árabe, `;` para preguntas en griego y `። ፣` en amárico.

## Capacidades

- Restauración conjunta de puntuación y capitalización en una sola pasada sobre texto en minúsculas.
- Predicción de cinco marcas de puntuación (`.` `,` `?` `:` `-`) más la ausencia de marca, y tres clases de capitalización (minúscula, inicial mayúscula, todo mayúsculas).
- Soporte multilingüe de 88 idiomas de entrenamiento y evaluación en 199 idiomas de FLORES-200.
- Adaptación de la puntuación a la escritura del idioma (CJK, devanagari, árabe, griego, amárico).
- Funcionamiento sin segmentación de palabras en idiomas CJK.
- Procesamiento de textos largos mediante fragmentación con solapamiento en el helper incluido.
- Ejecución en CPU y en navegador mediante ONNX int8 y transformers.js.
- No es un modelo generativo: no soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de capacidades de visión ni audio; su entrada es exclusivamente texto.

## Casos de uso

- Postprocesado de transcripciones ASR: el modelo recibe la salida en minúsculas y sin puntuar del sistema de reconocimiento y devuelve texto con puntuación y mayúsculas, mejorando la legibilidad de subtítulos y actas de reuniones sin necesidad de un segundo modelo.
- Generación de subtítulos para vídeo: integrado en un pipeline tras el ASR, restaura la puntuación de cada segmento y capitaliza nombres propios, lo que facilita la división en líneas y la sincronización con el habla.
- Normalización de mensajes de chat y foros: convierte texto informal en minúsculas en texto legible para análisis posterior, búsqueda o moderación, manteniendo un coste computacional bajo gracias a sus 307M de parámetros.
- Preprocesado para modelos de NLP posteriores: muchos modelos de traducción o resumen rinden mejor con segmentación oracional y mayúsculas correctas; este modelo actúa como paso previo que restaura ambas señales.
- Limpieza de corpus para entrenamiento: normaliza grandes volúmenes de texto procedente de fineweb-2 que llega sin puntuar, mejorando la calidad de datasets de entrenamiento de otros modelos.
- Procesamiento en el navegador: gracias a la versión ONNX int8 y transformers.js, permite ofrecer corrección de puntuación y mayúsculas en aplicaciones web del lado del cliente sin enviar datos a un servidor.
- Indexación y búsqueda multilingüe: al restaurar la segmentación oracional en 88 idiomas, mejora la calidad de índices de búsqueda y de sistemas de recuperación sobre documentos sin puntuar.

## Benchmarks y rendimiento

Resultados publicados en la model card. La entrada es un párrafo en minúsculas con `. , ? : ; ! -` eliminados. Las métricas se promedian sobre idiomas.

Casing F1:

| Modelo | Europarl, 12 idiomas | TED talks, 25 idiomas | FLORES, 88 idiomas | FLORES, 199 idiomas |
|---|---|---|---|---|
| **este modelo** (307M) | 0.897 | 0.816 | 0.886 | 0.796 |
| multilingual-punctuation-truecase-small (140M) | 0.887 | 0.805 | 0.883 | no disponible |

No se han publicado en la información disponible resultados de Punctuation F1 ni de Casing accuracy desglosados, ni comparaciones con modelos de terceros. Tampoco se han publicado cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB para los 307M de parámetros, más el overhead de activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- VRAM estimada en ONNX int8: alrededor de 641 MB para el archivo `onnx/model_quantized.onnx`, apto para CPU y entornos con poca memoria.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU de forma razonable. Para alto throughput se puede usar cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100), aunque el modelo es lo bastante pequeño como para que la CPU sea suficiente en muchos casos.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 de 4 GB o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: pipeline de `transformers` (`token-classification`), transformers.js con `dtype: "q8"`, ONNX Runtime, y el helper `truecase.py` para procesamiento de textos largos. No se documenta soporte específico para vLLM o TGI (no aplica a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Tareas | Licencia | Formato |
|---|---|---|---|---|---|
| **multilingual-punctuation-truecase-base** | 307M | 88 entrenamiento / 199 evaluación | Puntuación + capitalización | Apache-2.0 | safetensors, ONNX |
| multilingual-punctuation-truecase-small | 140M | no disponible | Puntuación + capitalización | no disponible | no disponible |
| punctuation-restoration-base | no disponible | no disponible | Solo puntuación | no disponible | no disponible |

La información disponible no permite comparar con modelos de terceros (por ejemplo, alternativas monolingües de restauración de puntuación) en parámetros, contexto o rendimiento. Los dos modelos hermanos citados son las alternativas más directas: el `small` sacrifica algo de precisión (0.887 frente a 0.897 en Europarl) a cambio de menor tamaño, y el `punctuation-restoration-base` está pensado para texto ya capitalizado.

## Limitaciones y advertencias

- El modelo asume entrada en minúsculas: si se le pasa texto ya capitalizado, ignora esa información y puede producir una capitalización distinta a la original. Para texto capitalizado que solo necesita puntuación debe usarse `punctuation-restoration-base`.
- Riesgo de alucinación de puntuación y mayúsculas: al ser un clasificador, puede insertar marcas donde no corresponden o capitalizar palabras que deberían ir en minúscula, especialmente en nombres propios poco frecuentes o en texto ambiguo.
- Cobertura desigual entre idiomas: aunque entrena en 88 idiomas, el rendimiento en FLORES cae de 0.886 (88 idiomas) a 0.796 al evaluar en los 199 idiomas, lo que indica degradación en idiomas no vistos durante el entrenamiento.
- Idiomas sin distinción de mayúsculas (chino, japonés, árabe, etc.): la métrica de casing solo considera las palabras en escritura latina presentes en el texto, por lo que la evaluación de capitalización en esos idiomas es limitada.
- La puntuación restaurada se limita a cinco marcas (`.` `,` `?` `:` `-`) más la ausencia de marca; no restaura exclamaciones, punto y coma ni comillas, aunque la evaluación elimina también `;` y `!`.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se recomienda conservar el aviso de licencia y atribución.
- No es un modelo generativo: no debe emplearse para tareas de razonamiento, generación libre, tool calling ni agentes.
- No se documentan sesgos específicos más allá de los inherentes a los corpus fineweb y fineweb-2, que pueden reflejar desequilibrios lingüísticos y de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-base
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/multilingual-punctuation-truecase
- Modelo hermano pequeño: https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-small
- Modelo de solo puntuación: https://huggingface.co/Horizon-Labs/punctuation-restoration-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset fineweb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
