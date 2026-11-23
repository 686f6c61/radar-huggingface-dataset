# Horizon-Labs/multilingual-punctuation-truecase-small

## Resumen

Horizon-Labs/multilingual-punctuation-truecase-small es un modelo de clasificación de tokens (token-classification) de 140,6 millones de parámetros que restaura de forma conjunta la puntuación y las mayúsculas en texto que carece de ambas, típicamente la salida en minúsculas y sin signos de un sistema de reconocimiento automático del habla (ASR), subtítulos o mensajes de chat. Para cada palabra predice el signo que la sigue (`.` `,` `?` `:` `-` o ninguno) y su capitalización (minúscula, inicial mayúscula o mayúsculas sostenidas) en una sola pasada. Lo desarrolla Horizon-Labs y se distribuye con licencia Apache-2.0.

El modelo se construye sobre jhu-clsp/mmBERT-small, un encoder de la familia ModernBERT multilingüe, y está entrenado sobre 88 idiomas. Se publica en formato safetensors para transformers y también en ONNX, incluyendo una variante cuantizada int8 (`onnx/model_quantized.onnx`, 268 MB) pensada para CPU y para ejecución en el navegador mediante transformers.js. La model card indica que esta variante int8 predice la misma etiqueta que fp32 en el 99,91 % de los tokens sobre texto de validación en minúsculas.

Su relevancia práctica está en el postprocesado de transcripciones: convierte una cadena plana como "my name is anna i live in berlin" en "My name is Anna. I live in Berlin.", mejorando la legibilidad de pipelines de ASR sin necesidad de un modelo generativo grande. Existe una versión mayor y más precisa, multilingual-punctuation-truecase-base (307M), para quien priorice calidad sobre latencia y tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-small), token-classification con 18 etiquetas `<mark>|<case>` |
| Parametros totales | 140.648.466 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card indica procesamiento en fragmentos solapados para textos largos, sin cifra de ventana) |
| Tipos de cuantizacion | ONNX int8 (embeddings int8, 268 MB); pesos safetensors fp32/fp16 según repo |
| Idiomas soportados | 88 idiomas (af, am, ar, az, be, bg, bn, bs, ca, ckb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, is, it, ja, jv, ka, kk, kn, ko, ky, lb, lt, lv, mk, ml, mn, mr, ms, mt, ne, nl, no, or, pa, pl, ps, pt, ro, ru, rw, sd, si, sk, sl, so, sq, sr, su, sv, sw, ta, te, tg, tl, tr, tt, ug, uk, ur, uz, vi, xh, yo, zh, zu) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (incluye `model_quantized.onnx` int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, derivado de jhu-clsp/mmBERT-small, configurado como clasificador de tokens con 18 etiquetas que combinan el signo de puntuación posterior (`0`, `.`, `,`, `?`, `:`, `-`) y la clase de capitalización (`lower`, `Cap`, `UPPER`). La etiqueta de cada palabra se toma del último token de la palabra, de modo que el modelo funciona con el pipeline estándar de token-classification de transformers y con transformers.js. El script auxiliar `truecase.py` convierte las etiquetas en texto final y gestiona textos largos mediante fragmentos solapados.

El entrenamiento emplea los datasets HuggingFaceFW/fineweb-2 y HuggingFaceFW/fineweb, según los metadatos del repositorio. La model card no detalla el número exacto de tokens de entrenamiento ni si hubo fases de ajuste fino específicas (RLHF/DPO no aplican a una tarea de etiquetado). Como innovación destacable, el modelo emite signos específicos por escritura: `，。？：` en chino y japonés sin necesidad de segmentación de palabras, `।` en hindi y bengalí, `، ؟` en escritura árabe, `;` para interrogación en griego y `። ፣` en amárico.

## Capacidades

- Restauración conjunta de puntuación y mayúsculas en una sola pasada sobre texto en minúsculas.
- Predicción de cinco signos de puntuación (`. , ? : -`) más la ausencia de signo, con variantes específicas por escritura (chino, japonés, hindi, bengalí, árabe, griego, amárico).
- Clasificación de capitalización en tres clases: minúscula, inicial mayúscula y mayúsculas sostenidas.
- Cobertura multilingüe de 88 idiomas de entrenamiento y evaluación adicional sobre las 199 lenguas de FLORES-200.
- Ejecución en CPU y en navegador mediante ONNX int8 y transformers.js.
- Integración directa con el pipeline `token-classification` de transformers y con el helper `truecase.py` para textos largos.
- No soporta tool calling, razonamiento multi-paso ni generación de texto: es un modelo discriminativo de etiquetado.

## Casos de uso

- Postprocesado de transcripciones ASR: el modelo recibe la salida en minúsculas y sin puntuar de un motor de reconocimiento del habla y devuelve texto con mayúsculas y signos, mejorando la legibilidad de actas, subtítulos y notas de reuniones.
- Generación de subtítulos para vídeo: en pipelines de subtitulado automático (TED, YouTube, formación corporativa) restaura la puntuación de los segmentos transcritos antes de publicarlos, con latencia baja gracias al tamaño de 140M.
- Normalización de mensajes de chat y soporte: convierte mensajes de usuario en minúsculas y sin puntuar en texto legible antes de almacenarlos, indexarlos o mostrarlos en paneles de atención al cliente.
- Enriquecimiento de corpus para búsqueda y NLP: añade puntuación y mayúsculas a corpus de dominio público (por ejemplo, fineweb) antes de pasarlos a modelos de recuperación o de análisis, ya que los modelos de sentence embeddings se benefician de texto bien puntuado.
- Preprocesado para traducción automática: al restaurar la puntuación de la fuente se mejora la segmentación de frases y la calidad de sistemas de traducción que dependen de límites oracionales.
- Despliegue en el navegador o en el borde: la variante ONNX int8 de 268 MB permite ejecutar la restauración en el cliente (transformers.js) para aplicaciones de dictado o accesibilidad sin enviar texto a un servidor.
- Limpieza de datos para entrenamiento de LLM: normalización de transcripciones y textos sin mayúsculas antes de incorporarlos a un dataset de instrucciones o de continuación de texto.

## Benchmarks y rendimiento

La model card publica resultados de evaluación sobre Europarl, TED talks y FLORES-200. La métrica Casing F1 se calcula solo sobre palabras que deberían llevar mayúscula inicial o mayúsculas sostenidas; la comparación incluye la versión base (307M) del mismo autor.

| Modelo | Europarl, 12 idiomas (Casing F1) | TED talks, 25 idiomas (Casing F1) | FLORES, 88 idiomas (Casing F1) | FLORES, 199 idiomas (Casing F1) |
|---|---|---|---|---|
| Este modelo (140M) | 0,887 | 0,805 | 0,883 | 0,784 |
| multilingual-punctuation-truecase-base (307M) | 0,897 | 0,800 (dato truncado en la información disponible) | no disponible | no disponible |

No se han publicado en la información disponible resultados completos de Punctuation F1 ni de Casing accuracy, ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (140,6M parámetros, aproximadamente 0,56 GB de pesos) y alrededor de 0,3 GB en la variante ONNX int8 de 268 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en tarjetas de consumo como RTX 3060, RTX 4060 o superiores, y también en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU modernas de consumo e incluso en dispositivos de borde con la variante int8.
- Opciones de despliegue: transformers (pipeline `token-classification`), ONNX Runtime, transformers.js en el navegador, y servidores de inferencia compatibles con endpoints de Hugging Face.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible; por el tamaño del modelo y la cuantización int8 se espera baja latencia en CPU, pero no se aportan números.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| multilingual-punctuation-truecase-small (este modelo) | 140M | 88 | Puntuación + mayúsculas conjuntas | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| multilingual-punctuation-truecase-base | 307M | 88 (según model card) | Puntuación + mayúsculas conjuntas | no disponible en la información | Hugging Face |
| punctuation-restoration-small (Horizon-Labs) | no disponible | multilingüe | Solo puntuación (texto ya con mayúsculas) | no disponible en la información | Hugging Face |

La diferencia principal frente a punctuation-restoration-small es que este modelo asume entrada en minúsculas y reescribe la capitalización, mientras que aquel se usa cuando el texto ya tiene mayúsculas y solo falta puntuación. La versión base ofrece mayor precisión (0,897 frente a 0,887 en Europarl) a costa de duplicar el tamaño.

## Limitaciones y advertencias

- La entrada se convierte a minúsculas antes de la inferencia: el modelo no aprovecha las mayúsculas existentes y puede alterar la capitalización original de un texto ya cased.
- Es un modelo discriminativo de etiquetado; no genera texto libre ni razona, por lo que errores de segmentación o de tokenización afectan directamente a la salida.
- Riesgo de alucinación bajo en el sentido generativo, pero puede insertar puntuación o mayúsculas incorrectas en nombres propios, siglas o límites de frase ambiguos.
- La cobertura de 88 idiomas de entrenamiento no garantiza calidad homogénea; en las 111 lenguas adicionales de FLORES-200 el rendimiento cae (Casing F1 de 0,784 frente a 0,883 en las lenguas entrenadas).
- En escrituras sin mayúsculas (chino, japonés, árabe) la métrica de casing solo evalúa las palabras en alfabeto latino, por lo que la evaluación de capitalización es limitada en esos idiomas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda validar el modelo sobre el dominio concreto antes de producción.
- No se han publicado cifras de latencia, throughput ni consumo de memoria en producción en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-small
- Demo en el navegador (Space): https://huggingface.co/spaces/Horizon-Labs/multilingual-punctuation-truecase
- Versión base (307M): https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-base
- Modelo solo de puntuación: https://huggingface.co/Horizon-Labs/punctuation-restoration-small
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset fineweb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
