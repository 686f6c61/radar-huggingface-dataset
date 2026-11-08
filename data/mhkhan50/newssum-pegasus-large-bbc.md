# MHkhan50/newssum-pegasus-large-bbc

## Resumen

NewsSum V2 es un ajuste fino de `google/pegasus-large` para resumen extractivo de noticias en ingles, desarrollado por Muzammal Hussain (usuario MHkhan50) como parte del estudio comparativo NewsSum-Bench. El modelo parte de la arquitectura PEGASUS, un transformer encoder-decoder preentrenado con objetivos de masked language modeling (MLM) y gap sentence generation (GSG), y se ha entrenado sobre el conjunto BBC News Summary con un split estratificado y libre de duplicados cercanos. El checkpoint publicado corresponde a la semilla 0 del estudio y cuenta con 570.893.159 parametros.

El modelo resuelve la tarea de seleccionar y copiar frases del articulo original en el estilo editorial de la BBC, no la de generar resumenes abstractivos breves. Esto se debe a que las referencias del dataset son en un 94,8 % extractivas y tienen aproximadamente el 45 % de la longitud del articulo. Es relevante ahora por su papel en un debate metodologico: el estudio demuestra que un baseline TextRank sin entrenamiento supera a este modelo y a otros seis transformers ajustados en ROUGE-Lsum sobre el mismo conjunto de test, lo que cuestiona la validez de las metricas ROUGE cuando la referencia es extractiva.

La ficha describe un modelo de investigacion con licencia Apache 2.0, sin descargas ni likes en el momento de la consulta, y con un alcance deliberadamente acotado a noticias britanicas de 2004 y 2005.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (PEGASUS) |
| Parametros totales | 570.893.159 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens de entrada; 320 tokens de salida maxima en entrenamiento |
| Tipos de cuantizacion | no disponible (pesos en fp16; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo es un PEGASUS-large completo, un transformer encoder-decoder con atencion completa, preentrenado por Google con los objetivos conjuntos de MLM y GSG. El preentrenamiento original de PEGASUS selecciona frases relevantes del documento y entrena al modelo para generarlas a partir del resto del texto, lo que lo hace especialmente adecuado para resumen abstractivo y extractivo. El checkpoint base es `google/pegasus-large`, aunque la model card no especifica si se trata de la variante estandar o de la variante Mixed & Stochastic.

El ajuste fino se realizo sobre el dataset BBC News Summary tras eliminar 154 articulos casi duplicados de un total de 2.225, con un split fijo 70/15/15 estratificado por tema: 1.449 articulos de entrenamiento, 311 de validacion y 311 de test. Los titulares se eliminaron de la entrada. El entrenamiento uso Adafactor con learning rate 2e-4, batch efectivo de 16, schedule lineal con 5 % de warm-up, early stopping sobre la perdida de validacion (6 epocas, mejor en la sexta), precision fp32 sobre una NVIDIA T4 y pesos guardados en fp16. La decodificacion empleada fue beam search con 4 beams y `no_repeat_ngram_size=3`. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de resumenes extractivos de articulos de noticias en ingles, con seleccion de frases en estilo BBC.
- Generacion condicionada a texto largo de hasta 1.024 tokens de entrada.
- Salida de hasta 320 tokens nuevos con beam search.
- Capacidad multilingue: limitada al ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Metricas reportadas: ROUGE-1, ROUGE-2, ROUGE-L, ROUGE-Lsum y BERTScore.

## Casos de uso

- Resumen de articulos de noticias en ingles para boletines internos: el modelo puede condensar un articulo de hasta 1.024 tokens en un resumen de unas 145 palabras, util para equipos de monitorizacion de prensa que trabajen con textos de estilo britanico.
- Generacion de snippets para agregadores de noticias: dado un cuerpo de articulo sin titular, el modelo produce un parrafo de seleccion de frases que puede servir como entradilla o sumario.
- Investigacion sobre metricas de evaluacion: el checkpoint permite reproducir el experimento NewsSum-Bench y comparar ROUGE frente a baselines extractivos como TextRank, lo que resulta util para estudiar los sesgos de las metricas.
- Docencia en PLN: sirve como ejemplo didactico de ajuste fino de un encoder-decoder para resumen y de los riesgos de evaluar con referencias extractivas.
- Prototipado de pipelines de resumen con transformers: la integracion directa con `AutoModelForSeq2SeqLM` y `AutoTokenizer` facilita pruebas rapidas en notebooks y entornos de investigacion.
- Baseline en estudios comparativos de resumen: al estar publicado con split reproducible y semillas multiples (ROUGE-Lsum medio 72,7 ± 0,5), puede usarse como referencia en experimentos con otros modelos o tecnicas.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre los 311 articulos de test:

| Metrica | Valor |
|---|---|
| ROUGE-1 | 73,8 |
| ROUGE-2 | 64,8 |
| ROUGE-L | 51,1 |
| ROUGE-Lsum | 73,1 |
| BERTScore | 59,2 |
| Longitud media (palabras) | 145 |

Media de ROUGE-Lsum en tres semillas: 72,7 ± 0,5. El baseline TextRank con longitud equivalente obtiene 82,9 ROUGE-Lsum en el mismo conjunto, superior a este modelo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,2-1,5 GB para los pesos, mas memoria para activaciones y cache de atencion; en la practica, entre 2 y 4 GB con batch pequeno.
- VRAM estimada en fp32: alrededor de 2,3 GB solo para pesos, con picos mayores durante la generacion.
- GPU recomendadas: NVIDIA T4 (la usada en entrenamiento), RTX 3060, RTX 4090, A100 y H100; cabe en cualquier GPU consumer con al menos 4 GB de VRAM.
- Despliegue: compatible con transformers, vLLM, TGI y llama.cpp solo si se convierte a GGUF (no se proporciona conversion oficial). Ollama requeriria una conversion manual a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; con beam search de 4 beams y 320 tokens de salida, la generacion es mas lenta que con decodificacion greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROUGE-Lsum en BBC News Summary | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MHkhan50/newssum-pegasus-large-bbc | 570,9 M | 1.024 | 73,1 (test, semilla 0) | Apache 2.0 | Hugging Face |
| google/pegasus-large | 568 M aprox. | 1.024 | no evaluado en este split | Apache 2.0 | Hugging Face |
| google/pegasus-cnn_dailymail | 568 M aprox. | 1.024 | no disponible | Apache 2.0 | Hugging Face |
| TextRank (baseline, sin entrenamiento) | no aplica | no aplica | 82,9 | no aplica | Implementacion propia |

La comparacion con PEGASUS base y con la variante ajustada a CNN/DailyMail no puede hacerse con numeros porque el autor no los reporta en el mismo conjunto de test. El dato mas relevante es que el baseline extractivo supera al modelo ajustado en ROUGE-Lsum.

## Limitaciones y advertencias

- Entrenado solo con unos 1.450 articulos de la BBC de 2004 y 2005; el estilo y los temas son muy estrechos y no generalizan a otros dominios ni a noticias actuales.
- Las referencias del dataset son extractivas en un 94,8 %, por lo que el modelo aprende a copiar frases y no a redactar resumenes abstractivos breves.
- Las metricas ROUGE y BERTScore no miden exactitud factual y no se realizo evaluacion humana.
- Un baseline TextRank sin entrenamiento supera al modelo (82,9 frente a 73,1 de ROUGE-Lsum), lo que sugiere que el rendimiento aparente se debe en gran parte a la naturaleza extractiva de las referencias.
- Los articulos de la BBC estan protegidos por derechos de autor; el autor indica que el modelo es solo para investigacion y educacion, aunque la licencia declarada sea Apache 2.0.
- Riesgo de alucinacion no evaluado; al ser un modelo extractivo, el riesgo principal es la seleccion de frases irrelevantes o descontextualizadas.
- Solo soporta ingles y no se documentan sesgos especificos, aunque la fuente (BBC de 2004-2005) puede introducir sesgos editoriales y temporales.
- Sin descargas ni validacion de la comunidad en el momento de la consulta; el checkpoint procede de un unico autor y un unico estudio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MHkhan50/newssum-pegasus-large-bbc
- Repositorio del estudio: https://github.com/MHKhan50/NewsSum-Bench
- Split de datos: https://github.com/MHKhan50/NewsSum-Bench/blob/main/results/splits.csv
- Paper (Zenodo): https://doi.org/10.5281/zenodo.24046039
- Modelo base: https://huggingface.co/google/pegasus-large
- Documentacion de PEGASUS en transformers: https://huggingface.co/docs/transformers/model_doc/pegasus
- Dataset BBC News Summary: https://www.kaggle.com/datasets/pariza/bbc-news-summary
