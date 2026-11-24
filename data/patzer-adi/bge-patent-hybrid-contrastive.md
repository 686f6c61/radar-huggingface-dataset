# patzer-adi/bge-patent-hybrid-contrastive

## Resumen

`patzer-adi/bge-patent-hybrid-contrastive` es un modelo de embeddings de frases (sentence-transformers) obtenido mediante fine-tuning de `BAAI/bge-base-en-v1.5` sobre un corpus de 75.909 pares orientados a similitud entre documentos de patentes. Lo desarrolla el usuario patzer-adi y su propósito declarado es la similitud semántica y la extracción de características densas en el dominio de patentes (títulos y resúmenes), tal como se deduce de los ejemplos del widget de la model card, que emparejan títulos y abstracts de invenciones.

Arquitectura BERT base con 109.482.240 parámetros totales, pesos en safetensors y un tamaño de repositorio de 0,4 GB, lo que corresponde a un encoder de 768 dimensiones en precisión fp32. Se entrenó con `ContrastiveLoss` y la librería sentence-transformers, y está etiquetado como compatible con Text Embeddings Inference (TEI) y con endpoints de Hugging Face.

Su relevancia es acotada pero concreta: no es un modelo generalista, sino un ajuste de dominio para búsqueda y deduplicación de patentes. Al publicarse con 0 descargas y 0 likes y sin licencia declarada, debe tratarse como un artefacto experimental de nicho que requiere validación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base), fine-tuning de BAAI/bge-base-en-v1.5 |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base admite 512 tokens; el autor no lo declara) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de BERT, no declarada por el autor) |
| Idiomas soportados | no disponibles (el modelo base es predominantemente inglés; no confirmado por el autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible (el modelo base bge-base produce 768 dimensiones; no confirmado por el autor) |
| Funcion de perdida | ContrastiveLoss |
| Tamano del dataset | 75.909 ejemplos |
| Tamano del repositorio | 0,4 GB |
| Pipeline | sentence-similarity / feature-extraction (dense) |

## Arquitectura y entrenamiento

El modelo parte de `BAAI/bge-base-en-v1.5`, un encoder BERT base de 12 capas y 109 millones de parámetros, y se ajusta con sentence-transformers mediante `ContrastiveLoss`, una función que acerca las representaciones de pares positivos y aleja las de pares negativos hasta un margen. El resultado es un encoder denso que proyecta cada documento (título y resumen de patente) a un vector único para búsqueda por similitud coseno.

El conjunto de entrenamiento consta de 75.909 ejemplos, según la etiqueta `dataset_size` de la model card. No se especifican en la información disponible la composición exacta del dataset, el número de tokens vistos, la proporción de negativos duros, ni si hubo etapas adicionales de RLHF o DPO (no aplicables habitualmente en encoders de similitud). Tampoco se documenta ninguna innovación técnica más allá del ajuste contrastivo de dominio; el calificativo "hybrid" del nombre no viene explicado en la model card.

## Capacidades

- Generación de embeddings densos para similitud semántica entre textos de patentes (títulos y abstracts).
- Extracción de características (`feature-extraction`) para pipelines de recuperación y ranking.
- Búsqueda semántica y recuperación de documentos afines en un corpus de patentes.
- Deduplicación y agrupación de invenciones por proximidad vectorial.
- Compatibilidad con Text Embeddings Inference (TEI) y con los endpoints de Hugging Face para despliegue como servicio de embeddings.
- Soporte multilingüe: no disponible; el modelo base es de inglés y el autor no declara idiomas.
- Tool calling, agentes, razonamiento multi-paso, visión o audio: no aplica; es un encoder, no un modelo generativo.

## Casos de uso

- Búsqueda de prior art: indexar los embeddings de títulos y resúmenes de un fondo documental de patentes y recuperar por similitud coseno las invenciones más próximas a una consulta, sustituyendo o complementando la búsqueda por palabras clave.
- Deduplicación de carteras de patentes: agrupar documentos con vectores casi idénticos para detectar familias duplicadas o solicitudes redundantes antes de revisión manual.
- Clasificación y triaje por proximidad: asignar un documento nuevo al clúster de patentes más cercano para enrutarlo al examinador o abogado especializado correspondiente.
- Alertas de vigilancia tecnológica: calcular la distancia entre patentes recién publicadas y un conjunto de referencia de la competencia para generar avisos de solapamiento.
- Enriquecimiento de pipelines RAG: usar el modelo como recuperador denso en un sistema de preguntas y respuestas sobre documentación de patentes, alimentando un LLM generativo con los pasajes recuperados.
- Detección de infracción potencial: comparar las reivindicaciones o resúmenes de una invención propia con un corpus de terceros para priorizar revisiones legales.
- Servicio de embeddings a escala: desplegar el modelo con TEI o con sentence-transformers para exponer un endpoint de similitud consumido por herramientas internas de gestión de propiedad intelectual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (Recall@k, nDCG, MRR), ni evaluaciones MTEB, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en fp32 para los pesos (109 M de parámetros), más memoria de activaciones según el tamaño de lote y la longitud de secuencia; en fp16 baja a unos 0,2-0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para lotes pequeños; A100, H100 o L4 para indexación masiva por su mayor throughput.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060, RTX 4090 y similares; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints (el modelo está etiquetado como `endpoints_compatible`), ONNX Runtime y llama.cpp no aplica (no es un modelo generativo GGUF).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| patzer-adi/bge-patent-hybrid-contrastive | 109,5 M | no disponible | Patentes (fine-tuning) | no disponible | Hugging Face, 0 descargas |
| BAAI/bge-base-en-v1.5 | 109 M | 512 tokens | General inglés | MIT | Hugging Face, ampliamente usado |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | General inglés | MIT | Hugging Face, ampliamente usado |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | General inglés | Apache 2.0 | Hugging Face, ampliamente usado |

La comparación se limita a parámetros, contexto y licencia, ya que el autor no publica métricas que permitan contrastar calidad de recuperación frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita para uso comercial; debe contactarse con el autor o asumirse el riesgo legal.
- Sin métricas publicadas: no hay evidencia de que el fine-tuning mejore al modelo base en tareas de recuperación; conviene evaluarlo contra `BAAI/bge-base-en-v1.5` antes de adoptarlo.
- Modelo experimental: 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni comunidad que lo valide.
- Dominio restringido: entrenado sobre títulos y resúmenes de patentes; su comportamiento fuera de ese dominio (texto jurídico completo, reivindicaciones, literatura científica) es incierto.
- Idiomas: el autor no declara idiomas; el modelo base es de inglés, por lo que el rendimiento en castellano u otras lenguas no está garantizado.
- Longitud de entrada: el modelo base admite 512 tokens; documentos de patente más largos requieren truncado o fragmentación, con pérdida de contexto.
- Riesgo de sesgo: el corpus de patentes está sesgado hacia ciertos sectores tecnológicos y jurisdicciones; los embeddings pueden favorecer esos dominios.
- Alucinación: no aplica en sentido generativo, pero la similitud coseno puede producir falsos positivos; requiere umbral calibrado por caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patzer-adi/bge-patent-hybrid-contrastive
- Modelo base BAAI/bge-base-en-v1.5: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Documentación de sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
