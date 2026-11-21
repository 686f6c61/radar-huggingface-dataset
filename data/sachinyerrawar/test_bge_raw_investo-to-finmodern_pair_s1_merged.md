# sachinyerrawar/Test_bge_raw_investo-to-finmodern_pair_s1_merged

## Resumen

`Test_bge_raw_investo-to-finmodern_pair_s1_merged` es un modelo de embeddings de frases (sentence embeddings) desarrollado por el usuario de Hugging Face `sachinyerrawar`. Se trata de un fine-tuning del modelo `BAAI/bge-m3` orientado a la similitud semantica y la recuperacion de informacion en el dominio financiero. El modelo parte de la arquitectura XLM-RoBERTa (herencia de bge-m3) y cuenta con 567.754.752 parametros, con pesos en formato safetensors.

El modelo resuelve el problema de la recuperacion semantica de pasajes financieros: dado un texto de consulta, produce representaciones vectoriales que permiten recuperar el pasaje mas relevante de un corpus. Ha sido entrenado sobre el dataset `FinLang/investopedia-embedding-dataset`, un conjunto de pares pregunta-respuesta extraidos de Investopedia, lo que lo especializa en terminologia de finanzas personales, inversiones y conceptos economicos.

Es relevante en el contexto actual de sistemas RAG (Retrieval-Augmented Generation) para aplicaciones financieras, donde la precision en la recuperacion de pasajes especializados es critica. No obstante, conviene senalar que se trata de un modelo experimental (prefijo `Test_`), sin descargas ni likes en el momento de la ficha, y con un conjunto de evaluacion muy reducido (200 ejemplos), por lo que sus metricas deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer, base de BAAI/bge-m3) |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (bge-m3 soporta hasta 8192 tokens; no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa, heredado de `BAAI/bge-m3` mediante fine-tuning. Produce embeddings densos de frases y pasajes para tareas de similitud semantica y recuperacion. La funcion de perdida empleada durante el entrenamiento es `CachedMultipleNegativesRankingLoss`, una variante de contrastive learning con negativos en batch que cachea los embeddings para permitir batches efectivos grandes con memoria limitada.

El entrenamiento se realizo sobre el dataset `FinLang/investopedia-embedding-dataset`, con un tamano declarado de 200 ejemplos (`dataset_size:200`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset, ni sobre si se aplicaron etapas de RLHF o DPO (no aplicables tipicamente a modelos de embeddings). El nombre del modelo sugiere un proceso de merge de pesos (`merged`), pero no se detalla la tecnica concreta en la informacion disponible. Los tags incluyen `generated_from_trainer`, lo que indica que fue producido con la libreria `sentence-transformers`.

## Capacidades

- Generacion de embeddings de frases y pasajes para similitud semantica.
- Recuperacion de informacion (information retrieval) mediante busqueda por similitud coseno.
- Extraccion de caracteristicas (`feature-extraction`) a nivel de token y de secuencia.
- Especializacion en dominio financiero: terminologia de inversiones, finanzas personales, mercados y conceptos economicos.
- Soporte de `text-embeddings-inference` y compatibilidad con endpoints (`endpoints_compatible`).
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles (`en`).
- Tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y multi-step reasoning: no disponible (no es un modelo generativo).
- Thinking mode, vision o audio: no disponible.

## Casos de uso

- Recuperacion semantica en sistemas RAG financieros: el modelo genera embeddings de consultas y pasajes de un corpus de articulos financieros, permitiendo recuperar el fragmento mas relevante para aumentar la respuesta de un LLM generativo. Es adecuado por su especializacion en el dominio de Investopedia.
- Busqueda semantica en bases de conocimiento de finanzas personales: indexar articulos sobre inversiones, jubilacion, impuestos o seguros y permitir consultas en lenguaje natural que recuperen el pasaje correcto mediante similitud coseno.
- Deduplicacion y agrupamiento de documentos financieros: usar los embeddings para detectar pasajes redundantes o agrupar articulos por tematica dentro de un corpus editorial.
- Clasificacion zero-shot por similitud: comparar la representacion de un documento con la de descripciones de categorias predefinidas (por ejemplo, "fondos indexados", "hipotecas", "planificacion fiscal") para etiquetar contenido sin entrenamiento adicional.
- Atencion al cliente en banca y finanzas: recuperar la respuesta o el articulo de ayuda mas pertinente ante una consulta del usuario, alimentando un sistema de FAQ o un chatbot basado en recuperacion.
- Evaluacion de calidad de pares pregunta-respuesta: medir la similitud semantica entre preguntas y respuestas candidatas para filtrar o puntuar datasets de entrenamiento en el dominio financiero.
- Motor de recomendacion de contenido financiero: calcular la similitud entre el perfil de interes de un usuario (representado como texto) y el catalogo de articulos para sugerir lecturas relevantes.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el dataset de evaluacion `investo` (no verificado de forma independiente, `verified: false`):

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,96 |
| Cosine Accuracy@3 | 0,98 |
| Cosine Accuracy@5 | 1,00 |
| Cosine Accuracy@10 | 1,00 |
| Cosine Precision@1 | 0,96 |
| Cosine Precision@3 | 0,3267 |
| Cosine Precision@5 | 0,2000 |
| Cosine Precision@10 | 0,1000 |
| Cosine Recall@1 | 0,96 |
| Cosine Recall@3 | 0,98 |
| Cosine Recall@5 | 1,00 |
| Cosine Recall@10 | 1,00 |
| Cosine NDCG@10 | 0,9804 |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros modelos, ni metricas de MRR@10 o MAP@100 con valores numericos (aunque figuran como metricas declaradas en la model card). Los valores de precision@k decrecen de forma coherente con el aumento de k dado el tamano reducido del conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,3 GB solo para pesos (567,7 M de parametros x 4 bytes), mas overhead de activaciones.
- VRAM estimada en FP16/BF16: aproximadamente 1,2 GB para pesos, mas overhead.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,6 GB para pesos, mas overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 en batches pequenos; A100, H100 o L4 para despliegues de alto throughput.
- Cabe en GPU de consumo: si, en RTX 3060 (12 GB), RTX 4060, RTX 4090 y similares, incluso en FP32.
- Opciones de despliegue: `sentence-transformers` (libreria nativa), `text-embeddings-inference` (soportado segun tags), vLLM con soporte de embeddings, o despliegue via endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `sachinyerrawar/Test_bge_raw_investo-to-finmodern_pair_s1_merged` | 567,7 M | no disponible | en | apache-2.0 | Fine-tuning financiero de bge-m3, dataset de 200 ejemplos |
| `BAAI/bge-m3` (modelo base) | 567,7 M | 8192 tokens | multilingue (100+ idiomas) | MIT | Modelo generalista, multi-funcionalidad (denso, sparse, multi-vector) |
| Modelos de embeddings financieros especializados | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion directa con alternativas de la misma categoria no esta disponible en la informacion proporcionada. El modelo base `BAAI/bge-m3` es la referencia natural, pero no se han publicado metricas comparativas entre ambos en la documentacion disponible.

## Limitaciones y advertencias

- Modelo experimental: el prefijo `Test_` en el nombre y la ausencia de descargas y likes sugieren que no ha sido validado por la comunidad.
- Conjunto de evaluacion muy reducido: las metricas declaradas se calculan sobre un dataset de 200 ejemplos, lo que limita la significancia estadistica de los resultados (accuracy@5 = 1,0 es sospechosamente alto para un conjunto tan pequeno).
- Metricas no verificadas: todas las metricas del model-index tienen `verified: false`; no han sido reproducidas de forma independiente.
- Idioma: el modelo declara soporte unicamente de ingles (`en`); su rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Dominio restringido: entrenado sobre Investopedia, por lo que su rendimiento fuera del dominio financiero (medicina, legal, tecnologia) puede degradarse respecto al modelo base.
- Riesgo de sobreajuste: con solo 200 ejemplos de entrenamiento, el modelo puede haber memorizado patrones del dataset y generalizar mal a corpus financieros reales.
- Sesgos: no documentados en la informacion proporcionada; al derivar de bge-m3, hereda los sesgos del corpus de entrenamiento original.
- Alucinacion: no aplica directamente (no es un modelo generativo), pero los embeddings pueden producir similitudes espurias en textos ambiguos.
- Licencia: apache-2.0, permite uso comercial y modificacion, con obligacion de incluir el aviso de licencia y atribucion.
- Sin garantias de produccion: no se documentan pruebas de estabilidad, latencia ni comportamiento en despliegues a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sachinyerrawar/Test_bge_raw_investo-to-finmodern_pair_s1_merged
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Dataset de entrenamiento: https://huggingface.co/datasets/FinLang/investopedia-embedding-dataset
- Paper de Sentence-BERT (arxiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de bge-m3 (arxiv:2101.06983): https://arxiv.org/abs/2101.06983
- Libreria sentence-transformers: https://www.sbert.net/
- Documentacion de text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
