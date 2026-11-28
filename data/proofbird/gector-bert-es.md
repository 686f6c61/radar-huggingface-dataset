# proofbird/gector-bert-es

## Resumen

`gector-bert-es` es un modelo de corrección gramatical del español desarrollado por Proofbird, el equipo detrás de la aplicación de asistencia de escritura del mismo nombre. Se trata de un tagger secuencial de estilo GECToR construido sobre el encoder BETO (`dccuchile/bert-base-spanish-wwm-cased`) y exportado a ONNX en fp32 para ejecutarse en CPU sin GPU ni conexión a internet. El modelo se publica con el objetivo declarado de que cualquiera pueda inspeccionar el componente que corre en su propia máquina dentro de la app Proofbird.

A diferencia de los modelos generativos de corrección, GECToR no reescribe el texto: para cada token predice una etiqueta de edición (mantener, borrar, reemplazar por una palabra, añadir una palabra, cambiar mayúsculas/minúsculas, cambiar la forma verbal) y aplica las ediciones de forma iterativa, reetiquetando la frase hasta cinco veces. Esto lo hace especialmente adecuado para integración en editores de texto, donde se necesita señalar posiciones exactas de error y ofrecer sugerencias puntuales sin parafrasear el contenido del usuario.

El modelo cubre errores típicos del español escrito: concordancia sujeto-verbo, concordancia de género y número en artículos, adjetivos y participios, contracciones (`de el` → `del`), tildes diacríticas y ortográficas, signos de apertura de interrogación y exclamación, palabras duplicadas y mayúsculas a inicio de frase. La versión 2.0.0 (receta de noviembre de 2026) incorpora un corpus oral además de Wikipedia y pares de entrenamiento dirigidos, con mayoritariamente un error por frase.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BETO, BERT base español) con cabeza de etiquetado GECToR (698 etiquetas de edición) y cabeza de detección de errores |
| Parámetros totales | no disponible (el modelo base BETO es de ~110 M, pero el autor no declara el total del modelo completo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32 (exportación ONNX); no se declaran otras |
| Idiomas soportados | es (español) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (fp32); tamaño del repo 1,3 GB |

## Arquitectura y entrenamiento

El modelo sigue el paradigma GECToR: un encoder BERT base en español (BETO, `bert-base-spanish-wwm-cased`, whole-word-masking y cased) sobre el que se montan dos cabezas, una de etiquetado con 698 etiquetas de edición y otra de detección de errores. En inferencia, el modelo predice una etiqueta por token, aplica las ediciones resultantes sobre la frase y vuelve a etiquetar el texto corregido hasta un máximo de cinco iteraciones. El tagger solo propone ediciones locales; no parafrasea ni reescribe oraciones completas.

El entrenamiento es exclusivamente sintético: 3 250 000 frases en total, compuestas por 1 500 000 frases de Wikipedia en español (`wikimedia/wikipedia`, `20231101.es`), 1 500 000 frases de los proceedings del Parlamento Europeo (Europarl v10, sesiones anteriores a mayo de 2011) y 250 000 frases de Tatoeba. Las frases se corrompen con reglas de error escritas a mano para el español, en su mayoría un error por frase independientemente de su longitud, y aproximadamente el 10 % se dejan limpias para que el modelo aprenda a no tocar texto correcto. Cada regla se validó contra el texto limpio y se revisó sobre frases reales antes de aplicarse, y las variantes que la norma admite en ambas formas (`en la que`/`en el que`, `Los diputados no creemos`) no se tratan como error.

## Capacidades

- Corrección de concordancia sujeto-verbo (`Las nuevas normas garantiza` → `garantizan`).
- Corrección de la persona del verbo tras pronombre (`Nosotros es amigos` → `somos`).
- Concordancia de género y número en artículos, adjetivos y participios, incluso a través de una cláusula (`La casa es blanco` → `blanca`).
- Género de artículo (`un mesa` → `una mesa`), respetando casos como `el agua`.
- Contracciones (`de el` → `del`, `a el` → `al`) y preposiciones duplicadas (`Vamos a al cine` → `al`).
- Tildes ortográficas (`cancion` → `canción`) y tildes diacríticas (`el`/`él`, `tu`/`tú`, `se`/`sé`, `esta`/`está`, interrogativos como `¿Como` → `¿Cómo`).
- Signos de apertura de interrogación y exclamación (`Cómo estás?` → `¿Cómo estás?`).
- Detección de palabras duplicadas y mayúsculas a inicio de frase.
- Errores de registro coloquial en preguntas, imperativos y primera y segunda persona.
- Devuelve sugerencias con posición de carácter (`start`, `length`), texto original y reemplazo, aptas para subrayar y ofrecer la corrección en un editor.
- No soporta tool calling, function calling, agentes ni multi-step reasoning: es un tagger de clasificación de tokens, no un modelo generativo.
- Capacidad multilingüe: solo español.

## Casos de uso

- Asistente de escritura en el navegador o en el editor: el modelo corre en CPU vía ONNX Runtime y devuelve posiciones de carácter exactas, lo que permite subrayar el error y ofrecer el reemplazo sin enviar el texto a un servidor. Es el caso de uso original de Proofbird.
- Corrección en aplicaciones de escritorio o móviles sin conectividad: al ejecutarse en CPU y con pesos ONNX fp32, puede integrarse en apps de notas, correo o mensajería que necesiten corrección local y privada.
- Preprocesado de corpus en pipelines de NLP: normalizar tildes, concordancias y contracciones en textos generados por usuarios antes de alimentar un buscador, un clasificador o un sistema de análisis.
- Revisión de textos académicos o administrativos en español: detecta concordancias y tildes diacríticas frecuentes en textos largos, manteniendo intacto el contenido léxico del original.
- Enseñanza de español como lengua extranjera: las sugerencias con posición y reemplazo permiten construir ejercicios interactivos que señalan el error y explican la corrección sin reescribir la frase del alumno.
- Moderación y limpieza de contenido generado por usuarios: aplicar correcciones de forma y ortografía antes de publicar comentarios o reseñas, reduciendo ruido en los datos.
- Integración en editores de código o documentación técnica en español: corregir comentarios, cadenas de texto y documentación sin alterar identificadores ni bloques de código, ya que el modelo solo aplica ediciones locales sobre tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo se distribuye en ONNX fp32 y está diseñado para ejecutarse sin GPU mediante ONNX Runtime.
- VRAM: no aplica en el caso de uso principal (CPU); para ejecución en GPU con ONNX Runtime se requeriría memoria según el tamaño del repo (1,3 GB), aunque no se documenta.
- GPU recomendadas: no disponibles; el modelo está pensado para CPU.
- Cabe en GPU de consumo: no se documenta; el diseño on-device apunta a ejecución en CPU.
- Opciones de despliegue: ONNX Runtime (documentado en el quickstart); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un tagger de clasificación de tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de corrección gramatical del español ni datos de rendimiento que permitan establecer una comparativa rigurosa.

## Limitaciones y advertencias

- El modelo solo propone ediciones locales; no reescribe ni parafrasea, por lo que no corrige errores que requieran reformulación de la frase.
- Entrenamiento exclusivamente sintético: los errores se generan con reglas escritas a mano, lo que puede dejar fuera patrones de error reales no contemplados por esas reglas.
- Solo español; no cubre otros idiomas ni variantes diatópicas de forma explícita.
- Respeta las variantes que la norma admite en ambas formas (`solo`/`sólo`, `este`/`éste`, `periodo`/`período`, `guion`, `video`, `futbol`), por lo que no señalará esas grafías como error aunque el usuario espere otra norma.
- Riesgo de falsos positivos en textos con registros o estructuras no representadas en el corpus de entrenamiento (Wikipedia, Europarl, Tatoeba).
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar al autor y conservar la licencia.
- El modelo base BETO es CC BY 4.0, por lo que la atribución debe cubrir también el encoder subyacente.
- No se documentan sesgos específicos ni evaluación sobre datos reales de errores; la validación descrita se basa en reglas y revisiones manuales del corpus sintético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-es
- Demo en el navegador (Hugging Face Space): https://huggingface.co/spaces/proofbird/try-grammar
- Repositorio con tag de versión: https://huggingface.co/proofbird/gector-bert-es/tree/v2.0.0
- Quickstart en Colab: https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-es/blob/main/quickstart.ipynb
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Dataset Wikipedia en español: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Proofbird (aplicación): https://proofbird.app
