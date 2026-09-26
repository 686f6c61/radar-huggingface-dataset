# Basengalenga/destilbert-part-of-speech-partial-fine-tuning

## Resumen

Este modelo es un ajuste fino de `distilbert-base-uncased` para etiquetado gramatical (*part-of-speech tagging*) con el conjunto de etiquetas UPOS de Universal Dependencies. Lo publica el usuario Basengalenga en HuggingFace y su tarea es asignar a cada palabra de una frase en ingles una de las 17 categorias UPOS (ADJ, ADP, ADV, AUX, CCONJ, DET, INTJ, NOUN, NUM, PART, PRON, PROPN, PUNCT, SCONJ, SYM, VERB, X). Resuelve un problema clasico de preprocesado linguistico: la anotacion morfosintactica de texto en bruto que alimenta pipelines de analisis sintactico, extraccion de informacion y busqueda semantica.

La particularidad tecnica es que no se reentreno el modelo completo, sino que se aplico un *fine-tuning* parcial: solo se actualizaron las dos ultimas capas transformer (capas 4 y 5 de 6) y la cabeza de clasificacion, mientras que los embeddings y las capas 0-3 permanecieron congelados. Esto supone alrededor de 14,2 millones de parametros entrenables de un total de 66,4 millones (en torno al 21 %).

Es relevante precisamente por ese enfoque: demuestra que un encoder pequeno y destilado, con una fraccion minima de parametros ajustados, alcanza un 96,55 % de accuracy y un weighted F1 de 0,965 en el split de test de UD English EWT (25.094 palabras). Con un repositorio de 0,3 GB y 66,4 millones de parametros, es un candidato claro para taggers de bajo coste en CPU o GPU modestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilado de BERT-base-uncased); 6 capas, 768 dimensiones |
| Parametros totales | 66.375.953 |
| Parametros activos | No aplica (no es un modelo MoE). Parametros entrenables durante el fine-tuning: ~14,2 M de ~66,4 M (~21 %) |
| Longitud de contexto | 512 subwords (entradas truncadas a 512) |
| Tipos de cuantizacion | No disponible. El autor no publica variantes cuantizadas; el repo solo contiene pesos en safetensors |
| Idiomas soportados | Ingles (`en`) |
| Licencia | cc-by-sa-4.0 (heredada de UD English EWT) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tarea / pipeline | token-classification (POS tagging, etiquetas UPOS) |
| Modelo base | distilbert-base-uncased |
| Tamano del repositorio | 0,3 GB |
| Dataset de entrenamiento | UD English EWT via `universal-dependencies/universal_dependencies` |
| Fecha de publicacion | 2026-09-25 (creacion), 2026-09-25 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only de tipo DistilBERT: 6 capas, 768 dimensiones ocultas, derivado por destilacion de `distilbert-base-uncased` (a su vez destilado de BERT-base-uncased, paper arXiv:1910.01108). Sobre el encoder se anade una cabeza de clasificacion por token con 17 clases UPOS. El entrenamiento se hizo con *fine-tuning* parcial: se congelaron los embeddings y las capas transformer 0-3, y solo se optimizaron las capas 4 y 5 mas el clasificador, lo que reduce el coste de ajuste y el riesgo de catastrofico olvido de las representaciones generales aprendidas en el preentrenamiento.

Los datos proceden de UD English EWT (English Web Treebank), que contiene texto web en ingles: blogs, resenas, correos, foros y noticias. Los splits declarados son 12.544 oraciones de entrenamiento, 2.001 de desarrollo (25.148 palabras) y 2.077 de test (25.094 palabras). Los hiperparametros fueron 3 epocas, batch size 32, learning rate 5e-5, warmup del 10 % de los pasos, weight decay 0,01 y precision fp16 en GPU, con seleccion del checkpoint de mejor accuracy en desarrollo. No se menciona ningun proceso de RLHF, DPO ni ajuste por preferencias.

Una decision tecnica destacable es la alineacion de etiquetas en tokenizacion por subwords: DistilBERT divide algunas palabras en varios subwords, y la etiqueta de cada palabra se asigna unicamente a su primer subword, ignorando el resto y los tokens especiales (`[CLS]`, `[SEP]`) en la perdida (con `-100`). Esto hace que las metricas sean a nivel de palabra y comparables con otros taggers entrenados sobre UD. En inferencia debe usarse `aggregation_strategy="first"` para reproducir exactamente ese esquema.

## Capacidades

- Etiquetado gramatical (POS tagging) a nivel de palabra con el inventario UPOS de 17 etiquetas de Universal Dependencies.
- Clasificacion por token sobre texto en ingles, incluyendo texto web informal (blogs, foros, correos, resenas).
- Integracion directa con el pipeline `token-classification` de `transformers`, con agregacion de subwords configurable.
- Alto rendimiento en clases cerradas y frecuentes: AUX, DET, PRON, PART, CCONJ y PUNCT superan 0,99 de F1 en test.
- Uso como preprocesado para tareas posteriores: analisis sintactico, extraccion de terminos, normalizacion de texto o *feature engineering*.
- Capacidad de ejecucion en CPU y GPU de gama baja por su tamano reducido (66,4 M de parametros).
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento extendido (*thinking mode*), vision, audio ni generacion de texto libre.
- No es un modelo multilingue: solo ingles.
- No esta disenado para tareas generativas ni para conversacion multi-turno.

## Casos de uso

- Preprocesado de pipelines de PLN: antes de un parser de dependencias o de un analizador de constituyentes, este modelo etiqueta cada palabra con su categoria UPOS en ingles, reduciendo la ambiguedad del analisis posterior.
- Extraccion de informacion y *chunking*: identificar sustantivos, nombres propios y verbos permite construir patrones de extraccion de entidades y relaciones sin necesidad de un modelo generativo.
- Indexacion y busqueda semantica: las etiquetas POS sirven para filtrar candidatos (por ejemplo, buscar solo sintagmas nominales) y para lematizar o normalizar consultas en un motor de busqueda.
- Analisis de resenas y redes sociales en ingles: el modelo se entreno sobre EWT, que incluye blogs, resenas, correos y foros, por lo que se ajusta a texto web informal; resulta util para medir estilo, detectar opiniones o clasificar terminos.
- Anotacion asistida de corpus: generar preanotaciones UPOS que despues revisa un anotador humano, usando el modelo como primer paso de un ciclo de anotacion activa.
- Prototipado rapido en entornos con pocos recursos: al ocupar 0,3 GB y requerir solo CPU, permite desplegar un tagger funcional en portatiles, contenedores pequenos o funciones serverless sin GPU.
- *Feature engineering* para modelos clasicos: las etiquetas UPOS y sus distribuciones por documento pueden usarse como variables adicionales en clasificadores de texto (spam, genero, intencion).
- Filtrado previo de datos de entrenamiento: detectar y descartar o marcar fragmentos mal formados (categoria X, palabras extranjeras, errores tipograficos) antes de construir un corpus mayor.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en el `model-index` (no verificados de forma independiente).

| Split | Accuracy | Macro F1 | Weighted F1 |
|---|---|---|---|
| Dev | 96,52 % | 0,898 | 0,964 |
| Test | 96,55 % | 0,910 | 0,965 |

Desglose por etiqueta en test:

| Etiqueta | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| ADJ | 0,926 | 0,935 | 0,930 | 1.788 |
| ADP | 0,969 | 0,987 | 0,978 | 2.025 |
| ADV | 0,955 | 0,942 | 0,948 | 1.191 |
| AUX | 0,997 | 0,995 | 0,996 | 1.543 |
| CCONJ | 0,997 | 0,990 | 0,994 | 736 |
| DET | 0,991 | 0,995 | 0,993 | 1.897 |
| INTJ | 0,920 | 0,860 | 0,889 | 121 |
| NOUN | 0,943 | 0,947 | 0,945 | 4.123 |
| NUM | 0,952 | 0,989 | 0,970 | 542 |
| PART | 0,994 | 0,995 | 0,995 | 649 |
| PRON | 0,993 | 0,994 | 0,993 | 2.164 |
| PROPN | 0,914 | 0,888 | 0,901 | 2.075 |
| PUNCT | 0,995 | 0,993 | 0,994 | 3.096 |
| SCONJ | 0,979 | 0,953 | 0,966 | 384 |
| SYM | 0,815 | 0,894 | 0,852 | 113 |
| VERB | 0,972 | 0,981 | 0,977 | 2.605 |
| X | 0,400 | 0,095 | 0,154 | 42 |

No se han publicado en la informacion disponible resultados comparativos con otros taggers UPOS sobre UD English EWT.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 66.375.953 parametros, sin contar activaciones ni overhead del runtime):
  - fp32: ~265 MB de pesos.
  - fp16: ~133 MB de pesos.
  - int8: ~66 MB de pesos.
- El modelo cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 3090, RTX 4090, e incluso en GPUs integradas con memoria compartida.
- Funciona en CPU con latencias aceptables para lotes pequenos de frases, dado su tamano (unos 66 M de parametros y 6 capas).
- GPU de datacenter (A100, H100) solo se justifican si se procesan volumenes muy grandes en lote o se sirven muchos modelos en paralelo; no son necesarias por memoria.
- Opciones de despliegue: `transformers` (pipeline `token-classification`), `torch` en CPU o GPU, y exportacion a ONNX Runtime para inferencia optimizada. No se declara compatibilidad con vLLM, TGI, llama.cpp ni Ollama en la informacion disponible; el formato publicado es safetensors de PyTorch.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Basengalenga/destilbert-part-of-speech-partial-fine-tuning | 66,4 M | 512 subwords | POS tagging UPOS (ingles) | cc-by-sa-4.0 | Accuracy 96,55 %, macro F1 0,910, weighted F1 0,965 en UD English EWT test |
| distilbert-base-uncased | 66,4 M | 512 subwords | Modelo base (masked LM, sin cabeza de clasificacion) | Apache-2.0 | No disponible para POS; requiere ajuste |
| bert-base-uncased | 110 M | 512 subwords | Modelo base (masked LM, sin cabeza de clasificacion) | Apache-2.0 | No disponible para POS; requiere ajuste |
| Stanza, tagger oficial de UD English EWT | No disponible | No disponible | POS tagging UPOS (ingles) | No disponible | No disponible |

No se dispone de resultados de benchmarks de estos modelos comparables dentro de la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa directa. La tabla recoge unicamente datos arquitectonicos y de licencia ampliamente conocidos de los modelos base.

## Limitaciones y advertencias

- Solo ingles. El rendimiento optimo se espera en texto web similar a EWT (blogs, resenas, correos, foros, noticias); en dominios como texto legal, medico o redes sociales con mucha jerga el accuracy puede degradarse.
- Tokenizacion dependiente de la segmentacion UD: el modelo se entreno con palabras segmentadas segun Universal Dependencies, que separa contracciones (por ejemplo, *can't* en *ca* + *n't*). Con texto crudo la segmentacion del pipeline no siempre coincide con la de UD; para resultados fieles conviene pre-tokenizar al estilo UD (por ejemplo, con Stanza).
- Modelo *uncased*: no aprovecha las mayusculas, lo que perjudica especialmente la deteccion de nombres propios (PROPN, F1 0,901, la clase grande mas dificil).
- La etiqueta X practicamente no se predice (recall 0,095, F1 0,154 con solo 42 ejemplos de soporte). Es la causa principal de que el macro F1 (0,910) quede muy por debajo del weighted F1 (0,965). No debe usarse este modelo si la categoria X es critica.
- Clases con poco soporte y alta sensibilidad al estilo informal: INTJ (F1 0,889, 121 ejemplos) y SYM (F1 0,852, 113 ejemplos).
- Truncamiento a 512 subwords: las palabras al final de textos largos se quedan sin etiqueta.
- Riesgo de alucinacion en el sentido generativo: no aplica, ya que no genera texto; el riesgo equivalente es producir etiquetas incorrectas en contextos fuera de dominio, especialmente en clases ambiguas como NOUN frente a PROPN o ADJ frente a VERB.
- Sesgos: al entrenarse sobre un treebank de texto web en ingles, hereda los sesgos de dominio y registro de ese corpus; no se documentan analisis de sesgo especificos.
- Licencia cc-by-sa-4.0, heredada de UD English EWT. Es una licencia *copyleft* con atribucion: el uso comercial esta permitido, pero las obras derivadas deben distribuirse bajo la misma licencia y con atribucion. Conviene revisar las implicaciones antes de integrar el modelo en productos propietarios.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validacion por parte de la comunidad ni resultados verificados de forma independiente (todas las metricas del `model-index` aparecen con `verified: false`).
- No se documentan versiones cuantizadas ni compatibilidad con runtimes de inferencia alternativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Basengalenga/destilbert-part-of-speech-partial-fine-tuning
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset: https://huggingface.co/datasets/universal-dependencies/universal_dependencies
- Treebank UD English EWT: https://universaldependencies.org/treebanks/en_ewt/
- Paper de DistilBERT (arXiv:1910.01108): https://arxiv.org/abs/1910.01108
- Documentacion de Universal Dependencies (etiquetas UPOS): https://universaldependencies.org/u/pos/
