# ghanaopenai/gloss-mt-2-reranker-afro-xlmr

## Resumen

GLOSS-MT-2 Afro-XLMR Cross-Encoder Reranker es un modelo de clasificación de pares de secuencias (cross-encoder) desarrollado por GhanaOpenAI, derivado mediante fine-tuning de `Davlan/afro-xlmr-base`. Su función es resolver la desambiguación léxica contextual en la traducción de inglés a twi asante (akano): recibe una frase en twi con un término inglés preservado entre marcadores `<...>` y una traducción candidata del diccionario, y devuelve una puntuación sigmoide que indica el encaje semántico e idiomático de esa candidata en el contexto.

El modelo es un componente central del paradigma de traducción GLOSS-MT-2, en el que un modelo seq2seq generativo (Marian o NLLB-200) produce twi fluido dejando intactos los sintagmas nominales ingleses entre corchetes; después, una búsqueda en diccionario offline propone varias traducciones posibles y este reranker selecciona la más adecuada. Resuelve un problema clásico en traducción automática de lenguas de bajos recursos: la polisemia de términos como *trade* (*dwadie* frente a *adwuma*), que un modelo seq2seq no puede desambiguar de forma fiable sin señal léxica externa.

Con 278 millones de parámetros, licencia Apache 2.0 y una latencia declarada inferior a 5 ms por par candidato en GPU, el modelo está pensado para integrarse como etapa de postprocesado en pipelines de traducción en producción, no como generador autónomo. Su relevancia actual radica en que aporta una pieza reutilizable y ligera para mejorar la calidad léxica en traducción a lenguas akan, un ámbito con escasa cobertura de herramientas específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) configurado como cross-encoder para clasificación de pares |
| Parametros totales | 278.044.417 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; los ejemplos de uso truncan a `max_length=160` tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | tw (twi), ak (akano), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Davlan/afro-xlmr-base |
| Tarea (pipeline) | text-classification |
| Tokenizer | Extendido con los marcadores especiales `<` y `>` |
| Salida | Puntuación sigmoide en [0, 1] por par (contexto, candidata) |
| Tamaño del repositorio | 1.1 GB |

## Arquitectura y entrenamiento

El modelo parte de `Davlan/afro-xlmr-base`, un encoder transformer multilingüe de orientación africanista, y se reconfigura como cross-encoder: en lugar de codificar cada texto por separado, procesa conjuntamente el par (frase en twi con el término entre corchetes, candidata léxica) y produce un logit único que, tras aplicar sigmoide, se interpreta como probabilidad de que la candidata sea la traducción correcta en ese contexto. El tokenizer se amplió con los marcadores `<` y `>` para preservar los tramos del sintagma inglés durante la tokenización. La cabeza de clasificación es de tipo binario (`AutoModelForSequenceClassification`).

El entrenamiento se realizó sobre 606.404 pares de entrenamiento y 13.024 pares de validación, construidos a partir del corpus paralelo `ghanaopenai/gloss-mt-2-en-tw` y de léxicos ghaneses. Se empleó una única NVIDIA H200 (140 GB de VRAM) con `bfloat16` y `TF32`, optimizador AdamW con `lr=1e-5`, schedule coseno y 50 pasos de warmup. La model card no detalla el número total de tokens vistos ni si hubo fases de RLHF o DPO; al tratarse de una tarea de clasificación supervisada, lo esperable es entrenamiento puramente discriminativo con pares positivos y negativos, pero ese extremo no se especifica.

## Capacidades

- Puntuación de encaje contextual entre una frase en twi asante y una candidata léxica del diccionario, devolviendo un valor continuo en [0, 1].
- Desambiguación léxica y de sentido de palabra (word-sense disambiguation) sobre términos ingleses preservados en la traducción.
- Procesamiento por lotes de múltiples candidatas para un mismo contexto en una sola pasada (batching de pares).
- Manejo de marcadores especiales `<...>` integrados en el tokenizer para delimitar los tramos a desambiguar.
- Soporte de los idiomas tw, ak y en, con foco en twi asante.
- Integración como componente del paquete Python `gloss_mt_2` mediante la clase `ContextualReranker`.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y no tiene modo thinking ni capacidades de visión o audio.

## Casos de uso

- Postprocesado en traducción automática inglés-twi: tras la salida de un seq2seq como NLLB-200 o Marian, el reranker evalúa cada candidata del diccionario en el contexto generado y selecciona la de mayor puntuación, corrigiendo elecciones léxicas erróneas antes de entregar la traducción final.
- Desambiguación de terminología institucional y administrativa: en textos de dominio público (ministerios, políticas, sanidad), donde términos como *policy* o *finance* tienen equivalentes twi con matices distintos, el modelo elige la variante coherente con la frase completa.
- Localización de documentación técnica y educativa: integrado en un pipeline de traducción por lotes, permite mantener consistencia léxica en glosarios de productos o materiales didácticos sin revisión manual de cada término polisémico.
- Enriquecimiento de léxicos y diccionarios bilingües: el modelo puede usarse para validar o puntuar automáticamente pares (contexto, traducción) extraídos de corpus y descartar entradas incoherentes antes de publicarlas.
- Evaluación de calidad de traducciones existentes: dado un par de frases y una candidata, la puntuación sirve como señal automática para detectar errores léxicos en memorias de traducción o en salidas de otros sistemas.
- Investigación en procesamiento de lenguas akan: al ser un cross-encoder ligero y de licencia permisiva, sirve como bloque de evaluación reproducible en experimentos de desambiguación léxica y de mejora de MT para lenguas de bajos recursos.
- Filtrado en la construcción de corpus: durante la curación de datos paralelos, el reranker puede puntuar candidatas léxicas y ayudar a descartar alineaciones dudosas, reduciendo ruido en el dataset de entrenamiento de futuros modelos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Cross-Encoder Contextual Lexical Disambiguation | ghanaopenai/gloss-mt-2-en-tw | accuracy | 97,21 |
| Inferencia (declarado en la model card) | — | latencia por par candidato en GPU | < 5 ms |

No se han publicado en la informacion disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con otros rerankers.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,1 GB en fp32 (278 M de parámetros) y aproximadamente 0,6 GB en bf16/fp16; el repositorio ocupa 1,1 GB en safetensors.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó con una NVIDIA H200, pero la inferencia es viable en tarjetas muy inferiores.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (uso documentado por el autor), y por su formato estándar de encoder es compatible con servidores de inferencia tipo TGI o TF Serving; no se documenta soporte GGUF ni integración con llama.cpp u Ollama.
- Latencia y throughput: el autor declara menos de 5 ms por par candidato en GPU; el throughput agregado depende del tamaño de lote y de la longitud de las secuencias (los ejemplos truncan a 160 tokens), pero no se publican cifras de pares por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gloss-mt-2-reranker-afro-xlmr | 278 M | no disponible (truncado a 160 en ejemplos) | Cross-encoder de desambiguación léxica en-tw | Apache 2.0 | Hugging Face |
| Davlan/afro-xlmr-base | ~278 M | 512 tokens (estándar XLM-R base) | Encoder multilingüe de propósito general | no disponible en la informacion proporcionada | Hugging Face |
| Rerankers multilingües genéricos (p. ej. familia bge-reranker) | variable | variable | Reranking de recuperación documental | variable | Hugging Face |

La comparación directa con otros rerankers no está disponible en la información proporcionada: no se han publicado métricas comparativas frente a alternativas, y los rerankers multilingües genéricos no están especializados en twi asante ni en desambiguación léxica con marcadores. La ventaja diferencial del modelo es su especialización lingüística y su licencia Apache 2.0; su limitación es que solo es útil dentro de un pipeline que ya haya generado la frase con los corchetes.

## Limitaciones y advertencias

- No es un modelo generativo: no puede traducir por sí solo, solo puntuar candidatas dentro de un contexto ya generado con la convención de corchetes.
- Depende de la calidad del diccionario de candidatas y de la fidelidad con la que el seq2seq preserve los marcadores `<...>`; si el generador los altera, la señal se degrada.
- La precisión del 97,21 % es un dato declarado por el autor, no verificado de forma independiente, y corresponde a pares de validación construidos a partir del mismo corpus; el rendimiento en dominios distintos puede ser inferior.
- Cobertura lingüística limitada a tw, ak y en, con foco en twi asante; no se documenta comportamiento en otras variantes del akan.
- Riesgo de sesgo hacia las distribuciones léxicas del corpus `gloss-mt-2-en-tw` y de los léxicos ghaneses empleados, lo que puede penalizar variantes dialectales o registros poco representados.
- No se documentan análisis de sesgos, evaluación de robustez ante ruido ni comportamiento ante entradas fuera de dominio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `Davlan/afro-xlmr-base` debe verificarse por separado; su licencia no se detalla en la información proporcionada.
- No hay soporte documentado de cuantización a GGUF ni de despliegue en llama.cpp u Ollama, lo que limita su uso en entornos sin Python.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ghanaopenai/gloss-mt-2-reranker-afro-xlmr
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-base
- Dataset de entrenamiento: https://huggingface.co/datasets/ghanaopenai/gloss-mt-2-en-tw
- Repositorio del proyecto GLOSS-MT-2: https://github.com/GhanaOpenAI/gloss-mt-2
- Modelo seq2seq asociado citado en la model card: https://huggingface.co/ghanaopenai/gloss-mt-2-nllb-600m-en2tw
