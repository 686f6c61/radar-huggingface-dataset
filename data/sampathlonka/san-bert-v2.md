# sampathlonka/San-BERT-v2

## Resumen

San-BERT-v2 es un codificador transformer basado en BERT-Base entrenado especificamente para sanscrito en escritura devanagari. Lo desarrolla el autor independiente sampathlonka como una revision sustancial de su modelo previo San-BERT (arXiv:2304.01894), y se publica bajo licencia Apache 2.0. Su proposito es resolver el colapso de representacion (anisotropia severa) que afectaba a la version 1, en la que la similitud coseno entre embeddings de pares de frases era practicamente identica a 1.000, lo que inutilizaba el modelo para tareas de similitud semantica y clasificacion.

El modelo mantiene la arquitectura clasica de BERT-Base (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion, 109,5 millones de parametros) pero se reentrena mediante Masked Language Modeling sobre un corpus de mas de 4,9 millones de clausulas sanscritas (36,2 millones de palabras, aproximadamente 65,9 millones de tokens WordPiece). Emplea un vocabulario WordPiece nativo de 30.522 entradas especifico para devanagari, lo que reduce la tasa de tokens fuera de vocabulario a menos del 0,0005 %.

Es relevante porque demuestra que un modelo pequeno y especializado puede superar a alternativas multilingues mucho mayores (MuRIL, XLM-RoBERTa, SBERT multilingue) en tareas de similitud textual semantica en sanscrito, con un coste computacional muy bajo (0,4 GB de pesos). Aun asi, en clasificacion de genero literario queda por detras de XLM-RoBERTa, lo que matiza sus fortalezas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-Base (BertForMaskedLM), transformer encoder, 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion |
| Parametros totales | 109.514.298 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones oficiales) |
| Idiomas soportados | sanscrito (sa), escritura devanagari |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Hugging Face Transformers) |

## Arquitectura y entrenamiento

San-BERT-v2 es un encoder transformer puro de tipo BERT-Base, sin componentes MoE ni SSM. El objetivo de preentrenamiento es Masked Language Modeling con enmascaramiento dinamico al 15 %. El tokenizador es un WordPiece nativo de devanagari con 30.522 entradas, disenado para segmentar el sanscrito con una media de 1,50 subpalabras por palabra, frente a las 3,50-4,20 habituales en tokenizadores multilingues de ~250.000 entradas.

El entrenamiento consiste en un continued MLM a gran escala sobre un corpus deduplicado de mas de 4,9 millones de clausulas unicas y 36,2 millones de palabras. Las fuentes incluyen el Kaggle Sanskrit Text Corpus (285 archivos, limpiado de HTML y segmentado por *purnavirama*), literatura vedica y clasica (Samhitas, Brahmanas, Aranyakas, Upanishads, Mahabharata, Ramayana, Puranas, Kavya, Nataka, Vyakarana) y comentarios filosoficos y tratados escolasticos (Advaita, Visistadvaita, Nyaya, Mimamsa, glosas *tippani*). No se documenta en la informacion disponible el uso de RLHF, DPO ni datos de instrucciones; es un modelo exclusivamente de representacion y enmascaramiento, no un modelo generativo conversacional.

La innovacion principal no es arquitectonica sino de entrenamiento: el reentrenamiento corrige la anisotropia del modelo v1, calibrando la distribucion de embeddings (coseno medio entre pares de 0,623 frente a 1,000 en v1) y recuperando senal discriminativa en tareas semanticas.

## Capacidades

- Relleno de mascaras (fill-mask) en sanscrito devanagari: predice tokens enmascarados en contexto, con ejemplos validados sobre versos del Bhagavad Gita, el Upanishad y aforismos vedicos.
- Extraccion de embeddings de frase y de token para similitud semantica textual (STS).
- Clasificacion de texto por fine-tuning: genero literario, tematica filosofica, registro.
- Clasificacion zero-shot mediante similitud coseno sobre embeddings medios.
- Modelado de lenguaje enmascarado como tarea auxiliar para evaluacion de fluidez.
- No soporta tool calling ni function calling: es un encoder, no un modelo causal de instrucciones.
- No soporta agentes ni razonamiento multi-paso: carece de decodificacion autoregresiva.
- No soporta vision, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingue limitada al sanscrito; no se documenta transferencia a hindi, pali u otras lenguas indoarias.
- Manejo de escritura devanagari con tasa de `[UNK]` inferior al 0,0005 %.

## Casos de uso

- Similitud semantica de versos y sentencias: dado un par de frases sanscritas, calcular la similitud coseno sobre embeddings medios para detectar paralelos, citas o variantes textuales. Es adecuado porque supera a MuRIL y SBERT multilingue en el benchmark STS de 575 pares (Spearman 63,02 %).
- Busqueda semantica en corpus sanscritos: indexar embeddings de clausulas y recuperar pasajes relevantes por similitud vectorial, aprovechando la ventana de 512 tokens y el bajo coste de inferencia (0,4 GB de pesos).
- Clasificacion de genero literario: fine-tuning sobre las cinco clases documentadas (Veda, Itihasa-Purana, Sastra-Darsana, Stotra, Kalpa-Vedanga) alcanza 67,7 % de accuracy en test con obras no vistas, util para catalogacion automatica de bibliotecas digitales.
- Deteccion de plagio o reutilizacion textual: comparar comentarios y glosas tradicionales frente a obras fuente mediante similitud de embeddings, gracias a la sensibilidad del modelo a parafrasis y transformaciones de voz.
- Analisis de comentarios filosoficos: agrupar pasajes de Advaita, Visistadvaita, Nyaya y Mimamsa por similitud semantica para estudios comparativos de darsanas.
- Etiquetado y anotacion asistida: predecir mascaras en fragmentos corruptos o incompletos de manuscritos digitalizados para tareas de restauracion textual preliminar.
- Generacion de features para pipelines de NLP sanscrito: usar los embeddings como capa de entrada para modelos posteriores de NER, analisis morfologico o dependencias, dado el vocabulario nativo y la baja tasa de UNK.

## Benchmarks y rendimiento

Resultados publicados en la model card.

Similitud textual semantica (STS, 575 pares, registro sandhi):

| Modelo | Script | Spearman rho (%) | IC 95 % bootstrap | Pearson r (%) | Coseno medio |
|---|---|---|---|---|---|
| San-BERT v1 (off-the-shelf) | Devanagari | -3,55 | [-11,6; 4,3] | -10,95 | 1,000 (colapsado) |
| **San-BERT-v2** | Devanagari | **63,02** | **[57,2; 68,1]** | **50,56** | **0,623** |
| MuRIL (Google) | Devanagari | 53,80 | [47,1; 59,9] | 35,37 | 0,993 |
| SBERT multilingue | Devanagari | 56,37 | [50,6; 61,9] | 45,92 | 0,587 |
| XLM-RoBERTa Vedic | Devanagari | 57,76 | [51,7; 63,8] | 47,80 | 0,772 |
| XLM-RoBERTa Multi | Devanagari | 59,45 | [53,4; 64,9] | 46,59 | 0,880 |

Clasificacion de genero en 5 clases, test disjunto por obra (27 obras no vistas, 3 learning rates x 3 semillas):

| Modelo | Accuracy (%) | IC 95 % por obra | Macro-F1 (%) | IC 95 % por obra |
|---|---|---|---|---|
| Baseline clase mayoritaria | 20,0 ± 0,0 | [20,0; 20,0] | 6,7 ± 0,0 | [6,7; 6,7] |
| TF-IDF + regresion logistica | 61,0 ± 0,0 | [54,8; 66,6] | 60,6 ± 0,0 | [54,4; 66,2] |
| San-BERT v1 (off-the-shelf) | 20,0 ± 0,0 | [20,0; 20,0] | 6,7 ± 0,0 | [6,7; 6,7] |
| **San-BERT-v2** | **67,7 ± 0,7** | **[60,6; 73,9]** | **67,2 ± 0,7** | **[59,6; 73,8]** |
| SBERT multilingue | 61,9 ± 1,1 | [55,6; 67,8] | 62,2 ± 0,9 | [55,8; 67,8] |
| MuRIL | 64,5 ± 1,3 | [58,0; 70,5] | 64,6 ± 1,3 | [58,0; 70,4] |
| XLM-RoBERTa Vedic | 70,8 ± 0,2 | [64,0; 76,9] | 70,9 ± 0,1 | [64,1; 76,9] |
| XLM-RoBERTa Multi | 71,7 ± 1,5 | [63,6; 78,8] | 71,8 ± 1,6 | [63,4; 78,7] |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo de pesos; con activaciones y overhead de PyTorch, unos 1-2 GB para lotes pequenos.
- VRAM estimada en FP16/BF16: unos 0,22 GB de pesos; inferencia practica por debajo de 1 GB en GPU.
- En CPU es perfectamente viable: 109,5 M de parametros y contexto de 512 tokens permiten inferencia interactiva en un portatil moderno.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (RTX 3050, RTX 4060, RTX 4090) es suficiente; para lotes grandes en produccion, T4, L4, A10G o A100 ofrecen mayor throughput.
- Cabe holgadamente en GPU consumer, incluidas integradas con suficiente memoria compartida para lotes pequenos.
- Opciones de despliegue: Hugging Face Transformers (pipeline `fill-mask`), TorchServe, FastAPI con `transformers`, ONNX Runtime si se exporta manualmente, y servidores de embeddings tipo TEI (Text Embeddings Inference) para indexacion vectorial. No se documentan pesos GGUF ni soporte oficial en llama.cpp u Ollama.
- Latencia y throughput: no se publican cifras en la informacion disponible; por tamano, se espera del orden de milisegundos por frase en GPU consumer y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | STS Spearman (%) | Clasificacion 5 clases (acc %) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **San-BERT-v2** | 109,5 M | 512 | **63,02** | 67,7 | Apache 2.0 | Hugging Face |
| San-BERT v1 | ~110 M (no confirmado) | 512 (no confirmado) | -3,55 | 20,0 | no disponible en la informacion | Hugging Face |
| MuRIL (Google) | ~236 M (no confirmado en la informacion) | 512 (no confirmado) | 53,80 | 64,5 | no disponible en la informacion | Hugging Face |
| XLM-RoBERTa Multi | ~278 M (no confirmado en la informacion) | 512 (no confirmado) | 59,45 | **71,7** | no disponible en la informacion | Hugging Face |
| SBERT multilingue | no disponible | no disponible | 56,37 | 61,9 | no disponible en la informacion | Hugging Face |

San-BERT-v2 lidera en similitud semantica con diferencia clara sobre los modelos multilingues, pero XLM-RoBERTa mantiene ventaja en clasificacion de genero, lo que sugiere que para tareas de clasificacion con muchas obras y vocabulario diverso un modelo multilingue grande puede seguir siendo preferible.

## Limitaciones y advertencias

- Solo cubre sanscrito en devanagari; no procesa transliteraciones IAST, escrituras regionales ni lenguas indoarias modernas.
- Es un encoder de enmascaramiento, no un modelo generativo: no puede producir texto libre ni mantener conversaciones.
- Riesgo de alucinacion en fill-mask: las predicciones de tokens enmascarados son plausibles estadisticamente, no verdades filologicas; no debe usarse como fuente de autoridad sanscrita sin validacion humana.
- Sesgo de corpus: predominan textos clasicos, vedicos y filosoficos braminicos; el sanscrito cientifico, medico o epigrafico esta infrarrepresentado, lo que puede sesgar clasificaciones y embeddings.
- Ventana de 512 tokens: insuficiente para analizar textos completos o pasajes largos sin segmentacion previa.
- En clasificacion de genero literario queda por detras de XLM-RoBERTa Multi (67,7 % frente a 71,7 %), por lo que no es la mejor opcion para esa tarea concreta.
- El modelo v1 previo presenta colapso de representacion; no debe usarse como base ni como referencia de calidad.
- Licencia Apache 2.0 permite uso comercial y modificacion con atribucion; no obstante, el autor no ofrece garantias ni soporte, y el modelo tiene solo 27 descargas y 0 likes en el momento de la ficha, lo que implica escasa validacion comunitaria.
- No se documentan evaluaciones en tareas de NER, analisis morfologico o traduccion, por lo que su rendimiento fuera de STS y clasificacion es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sampathlonka/San-BERT-v2
- Modelo previo San-BERT v1: https://huggingface.co/sampathlonka/San-BERT
- Paper de referencia (arXiv:2304.01894): https://arxiv.org/abs/2304.01894
- Corpus Kaggle Sanskrit Text Corpus: https://www.kaggle.com/datasets/kartikbhatnagar18/sanskrit-text-corpus
- Repositorio de Transformers: https://github.com/huggingface/transformers
