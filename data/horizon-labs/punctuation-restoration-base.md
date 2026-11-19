# Horizon-Labs/punctuation-restoration-base

## Resumen

Horizon-Labs/punctuation-restoration-base es un modelo de restauración de puntuación multilingüe desarrollado por Horizon-Labs. Su tarea consiste en insertar signos de puntuación (`.` `,` `?` `:` `-`) en texto que carece de ellos, un paso habitual de postprocesado en transcripciones automáticas de voz (ASR), subtítulos, notas de voz, mensajes de chat y texto extraído por OCR. Se distribuye bajo licencia Apache-2.0 y está construido sobre el modelo base jhu-clsp/mmBERT-base, un encoder de arquitectura ModernBERT multilingüe.

El modelo cuenta con 307.534.854 parámetros totales y se publica como un clasificador de tokens (pipeline `token-classification`). Cubre 88 idiomas y funciona tanto con texto en mayúsculas y minúsculas como con texto completamente en minúsculas, que es la salida típica de muchos sistemas ASR. Predice, tras cada palabra, una de las cinco marcas o ninguna, y emplea las mismas etiquetas que otros modelos del ecosistema (`0 . , ? - :`), lo que permite usarlo como reemplazo directo del paquete `deepmultilingualpunctuation`.

Su relevancia actual radica en la combinación de cobertura lingüística amplia, licencia permisiva y artefactos ONNX para CPU y navegador (transformers.js), lo que facilita el despliegue en entornos sin GPU. Incluye además un script auxiliar (`punctuate.py`) que gestiona idiomas sin separación por espacios, como chino y japonés, y adapta los signos a la escritura local (por ejemplo `，。？：` en chino, `।` en hindi y bengalí, `، ؟` en árabe).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), basado en jhu-clsp/mmBERT-base |
| Parametros totales | 307.534.854 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa textos largos en fragmentos solapados mediante el helper) |
| Tipos de cuantizacion | ONNX int8 (embeddings cuantizados, 641 MB); fp32 en safetensors |
| Idiomas soportados | 88 idiomas (af, am, ar, az, be, bg, bn, bs, ca, ckb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, is, it, ja, jv, ka, kk, kn, ko, ky, lb, lt, lv, mk, ml, mn, mr, ms, mt, ne, nl, no, or, pa, pl, ps, pt, ro, ru, rw, sd, si, sk, sl, so, sq, sr, su, sv, sw, ta, te, tg, tl, tr, tt, ug, uk, ur, uz, vi, xh, yo, zh, zu) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y ONNX (incluye `onnx/model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado desde jhu-clsp/mmBERT-base, un modelo multilingüe preentrenado sobre datos web multilingües. Sobre esa base se ha ajustado como clasificador de tokens con seis etiquetas (`0`, `.`, `,`, `?`, `-`, `:`), donde la etiqueta de cada palabra corresponde a la de su último token. Los conjuntos de datos citados en la model card son HuggingFaceFW/fineweb-2 y HuggingFaceFW/fineweb.

Según la información disponible, la evaluación se realizó con un protocolo uniforme para todos los modelos comparados: se eliminan los signos `. , ? : ; ! -` del texto de referencia y se mide el F1 de puntuación micro-promediado sobre las cinco marcas, exigiendo que la marca predicha sea la correcta en la posición correcta. El modelo se evalúa tanto con capitalización original como con texto en minúsculas. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en una tarea de etiquetado). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá de las propias de ModernBERT.

## Capacidades

- Restauración de puntuación: inserta `.`, `,`, `?`, `:`, `-` tras cada palabra o ninguna marca, en 88 idiomas.
- Funciona con texto en minúsculas, mayúsculas o mixto, sin necesidad de normalizar la capitalización.
- Soporte de idiomas sin separación por espacios (chino, japonés) mediante el script `punctuate.py`, que además adapta los signos a la escritura local (`，。？：`, `।`, `، ؟`, `። ፣`, `;` para preguntas en griego).
- Procesamiento de textos largos en fragmentos solapados a través del helper incluido.
- Compatibilidad como reemplazo directo de `deepmultilingualpunctuation` (mismas etiquetas).
- Exportación a ONNX para inferencia en CPU y en navegador vía transformers.js.
- No realiza cambio de capitalización ni modifica las palabras; solo añade puntuación.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento (es un modelo de clasificación de tokens, no generativo).

## Casos de uso

- Postprocesado de transcripciones ASR: tras un sistema de reconocimiento de voz que devuelve texto sin puntuar y en minúsculas, el modelo inserta comas, puntos y signos de interrogación, mejorando la legibilidad de subtítulos y actas de reuniones.
- Generación de subtítulos para vídeo: integrado en un pipeline que recibe la salida del ASR y aplica el modelo por segmentos, produce subtítulos con puntuación correcta en cualquiera de los 88 idiomas soportados.
- Limpieza de texto extraído por OCR: documentos escaneados suelen perder la puntuación; el modelo la restaura antes de indexar el texto en un motor de búsqueda o en un sistema RAG.
- Normalización de mensajes de chat y notas de voz: transcripciones de mensajes cortos y conversacionales se puntúan para su almacenamiento o análisis posterior.
- Preprocesado para traducción automática: añadir puntuación a la entrada mejora la segmentación de frases en sistemas de traducción que trabajan a nivel de oración.
- Despliegue en el navegador: gracias a los artefactos ONNX y a transformers.js, puede ejecutarse en cliente para puntuar texto sin enviar datos a un servidor, útil en aplicaciones de dictado o accesibilidad.
- Procesamiento multilingüe en lote: con 88 idiomas y licencia Apache-2.0, es adecuado para pipelines que gestionan contenido en muchos idiomas sin depender de modelos por lengua.

## Benchmarks y rendimiento

F1 de puntuación micro-promediado sobre las cinco marcas, promediado por idioma. Cada modelo recibe la misma entrada sin los signos `. , ? : ; ! -`, con capitalización original y en minúsculas.

| Modelo | Licencia | Idiomas | FLORES, 12 idiomas EU (con mayúsculas) | FLORES, 12 idiomas EU (minúsculas) | FLORES, 88 idiomas (con mayúsculas) | FLORES, 88 idiomas (minúsculas) | TED talks, 25 idiomas (con mayúsculas) | TED talks, 25 idiomas (minúsculas) | Europarl, 12 idiomas (con mayúsculas) | Europarl, 12 idiomas (minúsculas) |
|---|---|---|---|---|---|---|---|---|---|---|
| Este modelo (307M) | Apache-2.0 | 88 | 0.922 | 0.891 | 0.847 | 0.804 | 0.795 | 0.722 | 0.881 | 0.839 |
| punctuation-restoration-small (140M) | Apache-2.0 | 88 | 0.920 | 0.883 | 0.842 | 0.796 | 0.786 | 0.706 | no disponible | no disponible |

Nota: los modelos `punctuate-all` y `fullstop` fueron entrenados sobre Europarl, por lo que esa columna es in-domain para ellos; este modelo no se entrenó con Europarl. Los datos de esas comparaciones no se incluyen completos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 307M parámetros, la inferencia en fp32 requiere aproximadamente 1,2 GB de memoria; en int8 (ONNX cuantizado, 641 MB) se reduce a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; modelos como RTX 3060, RTX 4090, A100 o H100 no suponen ninguna limitación.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: transformers (pipeline `token-classification`), ONNX Runtime, transformers.js en navegador, y el paquete `deepmultilingualpunctuation` como reemplazo directo. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (no aplicables a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada. La model card indica que la versión int8 predice la misma etiqueta que fp32 para el 99,93 % de los tokens en texto de validación.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Contexto | F1 FLORES 12 EU (con mayúsculas) | Formato |
|---|---|---|---|---|---|---|
| Horizon-Labs/punctuation-restoration-base | 307M | 88 | Apache-2.0 | no disponible | 0.922 | safetensors, ONNX |
| Horizon-Labs/punctuation-restoration-small | 140M | 88 | Apache-2.0 | no disponible | 0.920 | no disponible |
| oliverguhr/fullstop-punctuation-multilang-large | no disponible | multilingüe (no especificado) | no disponible en la información | no disponible | no disponible | no disponible |
| kredor/punctuate-all | no disponible | 12 (columnas FLORES EU) | no disponible en la información | no disponible | no disponible | no disponible |

La información proporcionada no incluye los resultados numéricos de `punctuate-all` ni de los modelos `fullstop` en las columnas comparadas, por lo que no se pueden presentar cifras de esos modelos.

## Limitaciones y advertencias

- Solo restaura puntuación: no cambia la capitalización ni las palabras. Para texto en minúsculas que también requiera mayúsculas, el autor remite a multilingual-punctuation-truecase-base.
- Riesgo de alucinación de puntuación: puede insertar marcas incorrectas o en posiciones erróneas, especialmente en texto ambiguo o con errores del ASR de origen.
- El rendimiento baja en texto en minúsculas (0,891 frente a 0,922 en FLORES 12 EU; 0,722 frente a 0,795 en TED talks), que es precisamente el caso de uso principal del modelo.
- El F1 en TED talks (0,722 en minúsculas) es notablemente inferior al de FLORES, lo que sugiere menor robustez en estilo oral y conversacional.
- La cobertura de 88 idiomas no implica el mismo rendimiento en todos ellos; no se publican métricas por idioma en la información disponible.
- No se documentan sesgos específicos, pero al derivar de un modelo preentrenado en datos web (fineweb, fineweb-2) puede heredar sesgos de esos corpus.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base jhu-clsp/mmBERT-base.
- El paquete `deepmultilingualpunctuation` requiere transformers 4.x, ya que pasa `grouped_entities`, eliminado en transformers 5.
- La longitud de contexto no está documentada; para textos largos debe usarse el helper con fragmentos solapados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/punctuation-restoration-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Versión small: https://huggingface.co/Horizon-Labs/punctuation-restoration-small
- Modelo de puntuación y truecasing: https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-base
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/punctuation-restoration
- Paquete deepmultilingualpunctuation: https://github.com/oliverguhr/deepmultilingualpunctuation
- Modelo de referencia fullstop: https://huggingface.co/oliverguhr/fullstop-punctuation-multilang-large
- Modelo de referencia punctuate-all: https://huggingface.co/kredor/punctuate-all
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset fineweb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
