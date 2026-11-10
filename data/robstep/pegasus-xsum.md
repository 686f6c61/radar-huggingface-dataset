# robstep/pegasus-xsum

## Resumen

Pegasus-xsum es un modelo de resumen abstractivo basado en la arquitectura Transformer encoder-decoder presentada por Google Research en el articulo "PEGASUS: Pre-training with Extracted Gap-sentences for Abstractive Summarization" (Zhang, Zhao, Saleh y Liu, diciembre de 2019). El repositorio `robstep/pegasus-xsum` es una copia del checkpoint `google/pegasus-xsum` alojada en Hugging Face, con pesos disponibles en PyTorch, TensorFlow y JAX.

El modelo esta especializado en generar resumenes de una sola frase a partir de documentos de noticias en ingles, y fue preentrenado con un objetivo especifico de resumen: en lugar de enmascarar tokens individuales, se extraen oraciones completas del documento y se entrena al modelo para reconstruirlas. Esta tarea de preentrenamiento, denominada GSG (Gap-Sentence Generation), es la innovacion central del trabajo y explica su rendimiento en benchmarks de resumen.

El checkpoint corresponde a la variante "Mixed & Stochastic", entrenada sobre una mezcla ponderada de los corpus C4 y HugeNews durante 1,5 millones de pasos, con ratios de gap muestreados uniformemente entre el 15 % y el 45 % y ruido uniforme del 20 % en las puntuaciones de importancia de las oraciones. Es relevante para tareas de resumen extremo (XSum), donde el objetivo es una sintesis muy condensada, no un resumen extractivo largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Pegasus) |
| Parametros totales | no disponible (la variante base de Pegasus ronda los 568 M, pero el dato no se declara en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors / PyTorch, TensorFlow y JAX (tags: pytorch, tf, jax) |

## Arquitectura y entrenamiento

Pegasus es un Transformer encoder-decoder estandar en su topologia, pero su preentrenamiento se aparta del enmascaramiento tipo BERT o de la modelizacion causal autoregresiva. La tarea GSG selecciona oraciones "importantes" del documento de entrada (mediante una puntuacion de relevancia tipo ROUGE con el resto del texto), las elimina y entrena al decoder para reconstruirlas de forma abstractiva. Este sesgo inductivo alinea el preentrenamiento con la tarea downstream de resumen.

La variante "Mixed & Stochastic" presente en este repositorio se entreno sobre una mezcla ponderada por numero de ejemplos de C4 y HugeNews, durante 1,5 millones de pasos en lugar de los 500 000 del checkpoint original, con un ratio de gap muestreado uniformemente entre el 15 % y el 45 % y ruido uniforme del 20 % sobre las puntuaciones de importancia. Ademas, se actualizo el tokenizador SentencePiece para codificar el caracter de nueva linea, lo que mejora el tratamiento de parrafos y listas. No se declara en la informacion proporcionada el uso de RLHF o DPO; el modelo es un encoder-decoder supervisado de forma puramente auto-supervisada en preentrenamiento y afinado en XSum.

## Capacidades

- Generacion de resumenes abstractivos de una sola frase en ingles, orientados a noticias y documentos breves.
- Resumen extremo (XSum): produce titulares o frases sinteticas que condensan el contenido principal.
- Capacidad de resumen sobre otros dominios en ingles (CNN/DailyMail, SAMSum, Multi-News, Gigaword, WikiHow, PubMed, arXiv, BigPatent, entre otros), segun la tabla del autor.
- Generacion de texto condicionada a un documento de entrada (seq2seq).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Resumen de noticias para portadas y boletines: dado un articulo en ingles, el modelo genera un titular o frase-resumen de una linea, adecuado para feeds y alertas donde el espacio es minimo.
- Generacion de resumenes de correos y conversaciones: con entradas tipo SAMSum, produce una sintesis breve del hilo, util para asistentes de bandeja de entrada.
- Preprocesado de documentos largos en pipelines de busqueda: condensar articulos a una frase para indexacion semantica y reranking.
- Resumen de articulos cientificos (arXiv, PubMed): obtener la contribucion principal en una frase para revision rapida de literatura.
- Resumen de actas y transcripciones breves en ingles: sintetizar reuniones o notas en un unico enunciado.
- Generacion de descripciones cortas para catalogos de noticias o agregadores RSS: transformar el cuerpo del articulo en un snippet de una linea.
- Fine-tuning sobre dominios especificos en ingles: al ser un checkpoint preentrenado, sirve como base para ajuste supervisado en resumen de dominios verticales (legal, financiero, sanitario) siempre que los datos esten en ingles.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index de la model card (no verificados de forma independiente en la informacion proporcionada):

| Dataset | Split | ROUGE-1 | ROUGE-2 | ROUGE-L | ROUGE-LSUM | Loss | Gen. len |
|---|---|---|---|---|---|---|---|
| xsum | test | 46,8623 | 24,4533 | 39,0548 | 39,0994 | 1,5717 | 22,8821 |
| cnn_dailymail (3.0.0) | test | 22,2062 | 7,6701 | 15,4046 | 19,2182 | 2,6812 | 25,0234 |
| samsum | train | 21,8096 | 4,2525 | 17,4469 | 18,8907 | 3,0317 | 20,3122 |

Ademas, la model card reproduce la tabla del autor original con los resultados del checkpoint "Mixed & Stochastic" en distintos datasets (formato ROUGE-1/ROUGE-2/ROUGE-L):

| Dataset | C4 | HugeNews | Mixed & Stochastic |
|---|---|---|---|
| xsum | 45,20 / 22,06 / 36,99 | 47,21 / 24,56 / 39,25 | 47,60 / 24,83 / 39,64 |
| cnn_dailymail | 43,90 / 21,20 / 40,76 | 44,17 / 21,47 / 41,11 | 44,16 / 21,56 / 41,30 |
| newsroom | 45,07 / 33,39 / 41,28 | 45,15 / 33,51 / 41,33 | 45,98 / 34,20 / 42,18 |
| multi_news | 46,74 / 17,95 / 24,26 | 47,52 / 18,72 / 24,91 | 47,65 / 18,75 / 24,95 |
| gigaword | 38,75 / 19,96 / 36,14 | 39,12 / 19,86 / 36,24 | 39,65 / 20,47 / 36,76 |
| wikihow | 43,07 / 19,70 / 34,79 | 41,35 / 18,51 / 33,42 | 46,39 / 22,12 / 38,41 * |
| reddit_tifu | 26,54 / 8,94 / 21,64 | 26,63 / 9,01 / 21,60 | 27,99 / 9,81 / 22,94 |
| big_patent | 53,63 / 33,16 / 42,25 | 53,41 / 32,89 / 42,07 | 52,29 / 33,08 / 41,66 * |
| arxiv | 44,70 / 17,27 / 25,80 | 44,67 / 17,18 / 25,73 | 44,21 / 16,95 / 25,67 |
| pubmed | 45,49 / 19,90 / 27,69 | 45,09 / 19,56 / 27,42 | 45,97 / 20,15 / 28,25 |
| aeslc | 37,69 / 21,85 / 36,84 | 37,40 / 21,22 / 36,45 | 37,68 / 21,25 / 36,51 |
| billsum | 57,20 / 39,56 / 45,80 | 57,31 / 40,19 / 45,82 | 59,67 / 41,58 / 47,59 |

(*) Los autores advierten que las cifras de wikihow y big_patent no son comparables entre columnas por cambios en tokenizacion y datos: wikihow contiene saltos de linea que el tokenizador de C4/HugeNews no codifica, y BigPatent se actualizo para preservar mayusculas y limpiar formatos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el tamano del repositorio es de 9,1 GB, lo que incluye pesos en tres frameworks (PyTorch, TF y JAX), por lo que la huella de un solo formato es considerablemente menor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por la categoria del modelo (encoder-decoder de resumen), es desplegable en GPUs de gama media tipo RTX 3090/4090 o A100, pero no se confirma en la fuente.
- Cabe en GPU de consumo: probablemente si, dado el tamano tipico de un Pegasus base, pero el dato no se declara.
- Opciones de despliegue: transformers (PyTorch/TF/JAX); no se confirma soporte para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento XSum (R-1/R-2/R-L) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pegasus-xsum (este repo) | no disponible | no disponible | 47,60 / 24,83 / 39,64 (Mixed & Stochastic, segun autor) | no disponible | Hugging Face |
| pegasus-cnn_dailymail | no disponible | no disponible | no disponible en la informacion | no disponible | Hugging Face (google/pegasus-cnn_dailymail) |
| pegasus-large | no disponible | no disponible | no disponible en la informacion | no disponible | Hugging Face (google/pegasus-large) |
| BART-large-xsum | no disponible | no disponible | no disponible en la informacion | no disponible | Hugging Face (facebook/bart-large-xsum) |

No se dispone en la informacion proporcionada de datos comparativos verificados con alternativas como BART, T5 o LED; las cifras de XSum de la tabla anterior proceden de la model card del autor y no de una evaluacion independiente.

## Limitaciones y advertencias

- Modelo entrenado y evaluado unicamente en ingles; no se garantiza calidad en otros idiomas.
- Orientado a resumen extremo de una sola frase: puede producir resumenes demasiado cortos o perder matices en documentos largos o con estructura compleja.
- Riesgo de alucinacion: al ser un modelo generativo abstractivo, puede introducir informacion no presente en el documento de entrada, especialmente en dominios alejados del entrenamiento.
- Sesgos conocidos: al entrenarse sobre C4 y HugeNews (noticias y web en ingles), puede heredar sesgos de esos corpus en cuanto a temas, geografia y estilo.
- Licencia no declarada en la informacion proporcionada: es imprescindible verificar los terminos antes de uso comercial.
- El checkpoint es una copia subida por un tercero (`robstep`), no el repositorio oficial de Google; conviene contrastar con `google/pegasus-xsum` para produccion.
- No soporta tool calling, agentes, vision ni audio; su uso esta acotado a resumen y generacion condicionada.
- Las cifras de benchmarks declaradas por el autor no estan verificadas de forma independiente y deben interpretarse con cautela.
- El repositorio pesa 9,1 GB por incluir pesos en tres frameworks; en despliegue conviene descargar solo el formato necesario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/robstep/pegasus-xsum
- Checkpoint original: https://huggingface.co/google/pegasus-xsum
- Documentacion de Pegasus en transformers: https://huggingface.co/transformers/master/model_doc/pegasus.html
- Codigo original en TensorFlow 1: https://github.com/google-research/pegasus
- Paper (arXiv:1912.08777): https://arxiv.org/abs/1912.08777
- Perfil del mantenedor: https://twitter.com/sam_shleifer
