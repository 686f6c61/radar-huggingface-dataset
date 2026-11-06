# arunp0/bhasha-lid-indic

## Resumen

Bhasha (`bhasha-lid-indic`) es un clasificador de tokens a nivel de palabra para identificación de lengua en texto indio con mezcla de código (code-mixing). Desarrollado por Arun Prabhakaran (@LatentAILabs), etiqueta cada palabra de un mensaje con su idioma —hindi, bengalí, tamil, telugu, maratí, guyaratí, canarés, malayalam, panyabí, urdu, odia o inglés— además de las clases `name` y `other`. Está diseñado para la forma real en que la gente escribe: lenguas dravídicas e indias en alfabeto latino ("padam semma mass") mezcladas con inglés en la misma frase, y también en escritura nativa.

Técnicamente es un afinamiento de XLM-RoBERTa-base con 277.463.822 parámetros (278 M), distribuido bajo licencia Apache-2.0 en safetensors. Su relevancia radica en un hueco real del ecosistema: no existía ningún modelo word-level con licencia para tamil, malayalam o canarés romanizados mezclados con inglés. Los modelos existentes (muril-hinglish-lid, hing-bert-lid, IndicTriMix) puntúan entre 0,28 y 0,44 en comentarios reales de YouTube, mientras que Bhasha alcanza 0,84–0,95 en malayalam y canarés. Existe una versión más reciente, Bhasha v2, que mejora sustancialmente el tamil hablado (0,72 → 0,94).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-base con cabeza de clasificacion de tokens (token classification) |
| Parametros totales | 277.463.822 (~278 M) |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no disponible (por la arquitectura base, tipicamente 512 tokens, pero no consta en la ficha) |
| Tipos de cuantizacion | no disponible (solo pesos en precision original) |
| Idiomas soportados | hindi, bengali, tamil, telugu, marati, guyarati, canares, malayalam, panyabi, urdu, odia, ingles (en escritura nativa y romanizada) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un afinamiento de FacebookAI/xlm-roberta-base, un codificador transformer multilingüe preentrenado con MLM sobre 100 lenguas, adaptado a la tarea de token classification (etiquetado de cada palabra con su lengua). La salida incluye etiquetas por lengua, `name` y `other`; las palabras mixtas (raíz inglesa con terminación índica) se excluyen de la evaluación.

No se ha publicado el número de tokens de entrenamiento ni la composición detallada del dataset, aunque la model card indica que se entrenó con datos de mezcla de código romanizados y en escritura nativa, y que ninguno de los conjuntos de evaluación publicados se usó para entrenar. Tampoco consta el uso de RLHF/DPO (no aplica, al no ser un modelo generativo). La innovación principal es la cobertura word-level de lenguas índicas romanizadas con mezcla de código, un hueco que los modelos MIT como MixLID solo cubren en escritura nativa.

## Capacidades

- Identificacion de lengua a nivel de palabra (word-level LID) en texto con mezcla de codigo (code-switching) entre 11 lenguas indias e ingles.
- Soporte de escritura romanizada (hinglish, tanglish, manglish, kanglish) y de escritura nativa (devanagari, tamil, malayalam, canares, etc.).
- Etiquetado de nombres propios (`name`) y palabras fuera de dominio (`other`).
- Pipeline nativo de `token-classification` en Hugging Face Transformers.
- Rendimiento alto en escritura nativa: 0,9956 de F1 macro en frases monolinguisticas de 11 lenguas.
- No genera texto, no soporta tool calling, agentes ni modalidades de vision o audio.

## Casos de uso

- Preprocesado de pipelines NLP multilingues: separar por lengua cada palabra de un comentario en hinglish o tanglish antes de pasar cada segmento al modelo o traductor adecuado, evitando que un LID de frase unico falle en textos mixtos.
- Moderacion de contenido en redes sociales: analizar comentarios de YouTube o Twitter en lenguas dravidicas romanizadas, donde los moderadores basados en ingles no detectan palabras ofensivas camufladas en romanizacion.
- Analitica de sentimiento y voz de cliente: etiquetar la lengua de cada palabra en opiniones de e-commerce o apps indias para dirigir cada fragmento al modelo de sentimiento correcto.
- Transcripcion y post-edicion de ASR: validar y corregir la lengua de cada palabra en transcripciones con mezcla de codigo antes de traducir o indexar.
- Construccion de datasets de mezcla de codigo: anotar automaticamente corpus romanizados (tanglish, kanglish) para entrenar modelos posteriores, con etiquetas word-level coherentes.
- Busqueda y indexacion multilingue: detectar la lengua de consultas mixtas ("tamil movie padam review") para enrutar la busqueda al indice lexical o semantico adecuado.
- Asistentes conversacionales para India: detectar cambios de lengua intra-frase en tiempo real para cambiar el idioma de respuesta del asistente sin cortar la conversacion.

## Benchmarks y rendimiento

Resultados declarados por el autor (macro-F1 word-level sobre {lengua índica, inglés}; no verificados por terceros):

| Conjunto de datos | Tarea | Macro-F1 |
|---|---|---|
| CoLI-Dravidian 2024, canares + ingles (23.037 palabras) | LID word-level (kn, en) | 0,903 |
| CoLI-Dravidian 2024, malayalam + ingles (18.438 palabras) | LID word-level (ml, en) | 0,911 |
| CoLI-Dravidian 2024, tamil + ingles (11.323 palabras) | LID word-level (ta, en) | 0,723 |
| CoLI-Kanglish, ICON 2022, canares + ingles | LID word-level (kn, en) | 0,840 |
| WoLLaI, malayalam + ingles (12.401 frases) | LID word-level (ml, en) | 0,952 |
| COMI-LINGUA LID test, hindi + ingles | LID word-level (hi, en) | 0,896 |

Comparativa declarada con modelos publicados (mismo protocolo de evaluacion):

| Conjunto | Bhasha | distilka (Kanglish 2022) | XLM-R malayalam-ingles (Anjana2002) | MixLID (solo escritura nativa) | GlotLID v3 + lexico |
|---|---|---|---|---|---|
| CoLI canares | 0,903 | **0,954** | – | 0,491 | 0,586 |
| CoLI malayalam | **0,911** | – | 0,682 | 0,447 | 0,680 |
| CoLI tamil | **0,723** | – | – | 0,437 | 0,561 |
| WoLLaI malayalam | **0,952** | – | **0,952** | 0,469 | 0,931 |
| 425 comentarios reales (ta/ml/kn) | 0,873 / 0,888 / 0,888 | kn 0,724 | ml 0,638 | 0,786 / 0,704 / 0,654 | – |
| Frases en escritura nativa, 11 lenguas | **0,9956** | – | – | 0,9916 | – |

Nota del autor: los ficheros CoLI tienen una palabra por fila sin limites de frase, por lo que se evaluaron en ventanas contiguas de 12 palabras; las puntuaciones sobre mensajes completos probablemente sean algo superiores.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,1 GB para los pesos en fp32/fp16, mas overhead del runtime; en la practica, 2–4 GB de VRAM son suficientes para inferencia con batch pequeno. No hay datos oficiales de VRAM.
- GPU recomendadas: cualquier GPU moderna; no requiere aceleradores de centro de datos. Una RTX 3060 o superior sobra; tambien funciona en CPU dado el tamano modesto (278 M de parametros, encoder-only).
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso integradas con memoria compartida.
- Opciones de despliegue: libreria Transformers de Hugging Face (pipeline `token-classification`); la model card marca `inference: false` para la Inference API de HF, por lo que conviene autoalojar. Al ser un encoder estandar, es compatible con ONNX Runtime y similares, aunque no se publican exportaciones.
- Latencia y throughput: no disponibles. Al ser un encoder de 278 M, se esperan latencias de pocos milisegundos por frase en GPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Lenguas | Word-level romanizado | Licencia | F1 destacado |
|---|---|---|---|---|---|
| Bhasha (bhasha-lid-indic) | 278 M | 11 lenguas indias + ingles, nativo y romanizado | Si (ta, ml, kn, hi) | Apache-2.0 | 0,903–0,952 (kn/ml), 0,723 (ta) |
| MixLID (MIT) | no disponible | Lenguas indias solo en escritura nativa | No | MIT | 0,437–0,491 en CoLI dravidico |
| distilka (DistilBERT kanglish, shared task 2022) | no disponible | Canares + ingles | Si (solo kn) | Sin licencia declarada | 0,954 en CoLI canares |
| XLM-R malayalam-ingles (Anjana2002) | no disponible | Malayalam + ingles | Parcial | Sin licencia declarada | 0,682 en CoLI malayalam |
| muril-hinglish-lid / hing-bert-lid | no disponible | Hindi + ingles | Si (solo hi) | no disponible | 0,857 en COMI-LINGUA (hi, en) |

Bhasha es el unico modelo con licencia permisiva que cubre word-level tamil, malayalam y canares romanizados mezclados con ingles. distilka le gana en CoLI canares (datos de la misma serie que su entrenamiento), pero Bhasha lidera en comentarios reales independientes (0,888 frente a 0,724) y cubre muchas mas lenguas.

## Limitaciones y advertencias

- Rendimiento claramente inferior en tamil romanizado (0,723 en CoLI Tamil); el propio autor recomienda Bhasha v2, que sube a 0,94 en ese conjunto.
- Las palabras mixtas (raiz inglesa con terminacion india), los nombres propios (`name`) y las clases `other` se excluyen de la evaluacion; su precision real no esta documentada.
- El autor declara que puntuar con la restriccion de lenguas esperadas (`langs`) mejora los resultados (p. ej. 0,903 → 0,936 en CoLI canares); sin esa restriccion, el modelo puede confundir lenguas dravidicas cercanas.
- Los benchmarks son declarados por el autor y no verificados por terceros; los conjuntos CoLI se evaluaron en ventanas de 12 palabras, no en mensajes completos.
- No hay datos publicados sobre sesgos, riesgo de alucinacion (no aplica al no ser generativo) ni rendimiento en dominios fuera de comentarios de redes sociales y corpus academicos.
- Al ser un clasificador de tokens, no sirve para tareas generativas ni para deteccion de lengua a nivel de documento sin agregacion posterior.
- Licencia Apache-2.0: sin restricciones para uso comercial.

## Enlaces

- Modelo: https://huggingface.co/arunp0/bhasha-lid-indic
- Version mas reciente (Bhasha v2): https://huggingface.co/arunp0/bhasha-lid-indic-v2
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Articulo (Towards AI): https://pub.towardsai.net/my-model-thought-tamil-was-telugu-open-source-language-id-for-hinglish-tanglish-and-kanglish-604547310cd0
- Resumen y FAQ: https://latentailabs.github.io/bhasha-language-id/
- Canal del autor: https://www.youtube.com/@LatentAILabs
