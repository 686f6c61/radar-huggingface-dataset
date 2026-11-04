# Horizon-Labs/multilingual-punctuation-truecase-small

## Resumen

`multilingual-punctuation-truecase-small` es un modelo de clasificación de tokens desarrollado por Horizon-Labs que restaura de forma conjunta la puntuación y las mayúsculas en texto que ha perdido ambas cosas, típicamente la salida de un sistema de reconocimiento automático del habla (ASR), subtítulos o mensajes de chat. Para cada palabra predice el signo que la sigue (`.`, `,`, `?`, `:`, `-` o ninguno) y su capitalización (`lower`, `Capitalized` o `UPPER`), en una sola pasada y sobre 88 idiomas.

El modelo se construye sobre `jhu-clsp/mmBERT-small`, un encoder ModernBERT multilingüe, y cuenta con 140.648.466 parámetros. Se distribuye con pesos en safetensors y ONNX (incluida una versión cuantizada int8 de 268 MB para CPU y navegador vía transformers.js), bajo licencia Apache-2.0. Es relevante porque cubre un paso de post-procesado clásico en pipelines de transcripción con un único modelo multilingüe compacto, sin necesidad de segmentación de palabras en chino o japonés y con soporte de signos específicos por script (`।` en hindi y bengalí, `، ؟` en árabe, `። ፣` en amharés).

Existe una variante mayor, `multilingual-punctuation-truecase-base` (307M), con mayor precisión, y una variante específica solo de puntuación (`punctuation-restoration-small`) para texto que ya conserva mayúsculas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `jhu-clsp/mmBERT-small`), token classification con 18 etiquetas `<mark>\|<case>` |
| Parametros totales | 140.648.466 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa textos largos en fragmentos solapados mediante el helper `truecase.py`) |
| Tipos de cuantizacion | ONNX int8 (embeddings, 268 MB); fp32; `q8` en transformers.js |
| Idiomas soportados | 88 idiomas (af, am, ar, az, be, bg, bn, bs, ca, ckb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, is, it, ja, jv, ka, kk, kn, ko, ky, lb, lt, lv, mk, ml, mn, mr, ms, mt, ne, nl, no, or, pa, pl, ps, pt, ro, ru, rw, sd, si, sk, sl, so, sq, sr, su, sv, sw, ta, te, tg, tl, tr, tt, ug, uk, ur, uz, vi, xh, yo, zh, zu) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (incluye `model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT de la familia mmBERT, concretamente la variante *small* de `jhu-clsp/mmBERT-small`, adaptado a clasificación de tokens con una cabeza que emite 18 etiquetas combinando el signo de puntuación posterior y la clase de capitalización de cada palabra. La etiqueta asignada a una palabra es la de su último token, lo que simplifica la decodificación a nivel de palabra sin necesidad de segmentación explícita en idiomas sin espacios.

El entrenamiento se realizó sobre los datasets `HuggingFaceFW/fineweb-2` y `HuggingFaceFW/fineweb`, cubriendo 88 idiomas. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de clasificación). Como innovación destacable, el modelo escribe signos específicos por script (`，。？：` en chino y japonés, `।` en hindi y bengalí, `، ؟` en árabe, `;` para preguntas en griego y `። ፣` en amharés) y la versión int8 reproduce la etiqueta fp32 en el 99,91 % de los tokens sobre texto de validación en minúsculas.

## Capacidades

- Restauración conjunta de puntuación y mayúsculas en una sola pasada, con 18 etiquetas `<mark>|<case>`.
- Predicción de cinco signos (`.`, `,`, `?`, `:`, `-`) o ausencia de signo.
- Clasificación de capitalización en tres clases: minúscula, inicial mayúscula y todo mayúsculas.
- Soporte multilingüe de 88 idiomas de entrenamiento, con signos adaptados a chino, japonés, hindi, bengalí, árabe, griego y amharés.
- Funcionamiento sin segmentación de palabras en idiomas sin espacios (chino, japonés).
- Integración con el pipeline `token-classification` de transformers y con transformers.js (dtype `q8`).
- Helper `truecase.py` para convertir etiquetas a texto y procesar textos largos en fragmentos solapados.
- Inferencia en CPU y en navegador mediante los ficheros ONNX incluidos.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un modelo discriminativo de etiquetado.

## Casos de uso

- Post-procesado de transcripciones ASR: el modelo recibe la salida en minúsculas y sin puntuación de un sistema de reconocimiento del habla y devuelve texto con puntuación y mayúsculas, mejorando la legibilidad de subtítulos y actas.
- Generación de subtítulos para vídeo: integrado en un pipeline ASR → truecasing, produce subtítulos con puntuación correcta y nombres propios capitalizados en 88 idiomas, adecuado para plataformas multilingües.
- Normalización de mensajes de chat y foros: convierte texto escrito en minúsculas y sin puntuar en texto legible antes de almacenarlo o mostrarlo, con un coste computacional bajo (268 MB en int8).
- Preprocesado para otros modelos de NLP: al restaurar puntuación y mayúsculas se mejora la calidad de entrada para sistemas de traducción automática, resumen o análisis sintáctico que dependen de la segmentación oracional.
- Procesamiento en el navegador: gracias a transformers.js y a los pesos ONNX cuantizados, puede ejecutarse del lado del cliente en aplicaciones web de dictado o accesibilidad sin enviar datos a un servidor.
- Indexación y búsqueda de archivos de audio: restaurar puntuación en transcripciones masivas facilita la segmentación en frases y la búsqueda por oraciones en archivos de reuniones o podcasts.
- Limpieza de corpus históricos o de baja calidad: normaliza texto en minúsculas procedente de fuentes diversas antes de alimentar pipelines de análisis o entrenamiento.

## Benchmarks y rendimiento

Evaluación sobre texto en minúsculas con `. , ? : ; ! -` eliminados; métricas promediadas por idioma.

| Modelo | Casing F1 Europarl (12 idiomas) | Casing F1 TED (25 idiomas) | Casing F1 FLORES (88 idiomas) | Casing F1 FLORES (199 idiomas) |
|---|---|---|---|---|
| Este modelo (140M) | 0,887 | 0,805 | 0,883 | 0,784 |
| multilingual-punctuation-truecase-base (307M) | 0,897 | 0,800 | no disponible | no disponible |

La model card no incluye resultados completos de Punctuation F1 ni de Casing accuracy en la información proporcionada; solo se dispone de la comparativa parcial de Casing F1 mostrada arriba. Tampoco se han publicado resultados de MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 para 140M de parámetros; aproximadamente 268 MB en la versión ONNX int8.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; funciona correctamente en CPU, que es el escenario principal dada la naturaleza del modelo.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650) e incluso en dispositivos de gama baja; también en el navegador vía transformers.js.
- Opciones de despliegue: pipeline `token-classification` de transformers, ONNX Runtime, transformers.js, y el helper `truecase.py`. No se documenta soporte específico para vLLM, TGI o llama.cpp, que no son adecuados para un encoder de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada. El tamaño reducido y la cuantización int8 sugieren inferencia en CPU en milisegundos por fragmento, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`multilingual-punctuation-truecase-small`) | 140M | 88 | Puntuación + mayúsculas | Apache-2.0 | HuggingFace, ONNX, transformers.js |
| `multilingual-punctuation-truecase-base` | 307M | 88 | Puntuación + mayúsculas | Apache-2.0 (según model card del autor) | HuggingFace |
| `punctuation-restoration-small` | no disponible | multilingüe | Solo puntuación (texto ya con mayúsculas) | Apache-2.0 (según model card del autor) | HuggingFace |

La variante *base* (307M) obtiene un Casing F1 ligeramente superior en Europarl (0,897 frente a 0,887) y ligeramente inferior en TED (0,800 frente a 0,805), con un coste computacional mayor. `punctuation-restoration-small` cubre un caso de uso distinto: texto que ya conserva mayúsculas y solo necesita puntuación. No se dispone de datos de otros modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- El modelo asume entrada en minúsculas: internamente pasa el texto a minúsculas y no aprovecha las mayúsculas existentes. Para texto ya capitalizado debe usarse la variante de solo puntuación.
- Solo predice cinco signos (`.`, `,`, `?`, `:`, `-`); no restaura `;`, `!`, comillas, paréntesis ni otros signos, aunque la evaluación elimina también `;` y `!` del texto de entrada.
- Riesgo de alucinación de puntuación y mayúsculas: puede insertar signos o capitalizar palabras incorrectamente, especialmente en nombres propios poco frecuentes o en idiomas con pocos datos.
- Cobertura desigual entre los 88 idiomas: el rendimiento en FLORES cae de 0,883 (idiomas de entrenamiento) a 0,784 al evaluar sobre los 199 idiomas de FLORES, y los 111 idiomas no entrenados no están soportados de forma fiable.
- En idiomas sin distinción de mayúsculas (chino, japonés, árabe), la métrica de casing solo evalúa las palabras en escritura latina, por lo que el rendimiento real en esos idiomas queda parcialmente sin medir.
- No se documentan sesgos específicos ni evaluaciones de sesgo en la model card; como modelo entrenado sobre FineWeb y FineWeb-2, puede heredar sesgos de esos corpus web.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda conservar el aviso de licencia y citar el modelo base `jhu-clsp/mmBERT-small`.
- En producción conviene validar la salida en el dominio objetivo, ya que el estilo de entrenamiento (texto web y traducido) puede diferir del texto ASR real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-small
- Demo en el navegador (Space): https://huggingface.co/spaces/Horizon-Labs/multilingual-punctuation-truecase
- Variante base (307M): https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-base
- Variante de solo puntuación: https://huggingface.co/Horizon-Labs/punctuation-restoration-small
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
