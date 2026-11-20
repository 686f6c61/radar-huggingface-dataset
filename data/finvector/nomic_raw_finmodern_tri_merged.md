# finvector/nomic_raw_finmodern_tri_merged

## Resumen

`finvector/nomic_raw_finmodern_tri_merged` es un modelo de embeddings de texto derivado de `nomic-ai/nomic-embed-text-v1.5` mediante ajuste fino con la librería sentence-transformers. Lo publica el usuario finvector y está orientado a similitud semántica y extracción de características (feature extraction) sobre texto financiero en inglés, a juzgar por los ejemplos de la model card, que proceden de informes anuales (10-K) de empresas cotizadas.

El modelo resuelve el problema de recuperación y comparación semántica de fragmentos financieros: dada una consulta o un pasaje, produce vectores densos que permiten ordenar por similitud coseno. Es relevante para pipelines de RAG sobre documentación regulatoria, búsqueda semántica en informes anuales y deduplicación de pasajes contables, donde los embeddings genéricos rinden peor por la densidad terminológica del dominio.

Arquitectura `nomic_bert` con 136.731.648 parámetros totales (unos 137 M), pesos en safetensors, licencia Apache 2.0 y un repositorio de 0,3 GB. El entrenamiento se realizó sobre un dataset de 11.687 ejemplos con la pérdida `CachedMultipleNegativesRankingLoss`, y el autor declara una precisión coseno de 0,9936 en una evaluación de tripletas propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nomic_bert (transformer encoder, base de nomic-embed-text-v1.5) |
| Parámetros totales | 136.731.648 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base nomic-embed-text-v1.5 soporta 8.192 tokens; el valor específico de este fine-tune no se declara) |
| Tipos de cuantización | no disponible (pesos safetensors en el repositorio; no se declaran variantes GGUF/ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT (familia `nomic_bert`) inicializado desde `nomic-ai/nomic-embed-text-v1.5`, un modelo de embeddings de 137 M de parámetros. La salida es un vector denso por secuencia, pensado para similitud coseno y recuperación densa. El ajuste fino se realizó con sentence-transformers usando `CachedMultipleNegativesRankingLoss`, una variante de la pérdida de ranking con negativos en memoria que aprovecha negativos dentro del batch y reduce el coste de memoria al cachear los embeddings de los pasajes.

El dataset de entrenamiento consta de 11.687 ejemplos, según los metadatos de la model card; no se detalla su composición interna más allá de los ejemplos mostrados, que corresponden a fragmentos de informes anuales y comunicaciones financieras en inglés. No se declaran fases de RLHF, DPO ni preferencias humanas, algo esperable en un modelo de embeddings. El nombre del repositorio (`tri_merged`) sugiere una fusión de pesos de variantes entrenadas con tripletas, pero no se documenta el procedimiento de merge ni los checkpoints intermedios.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa (pipeline `sentence-similarity`).
- Extracción de características (`feature-extraction`) para usar como encoder en pipelines propios.
- Búsqueda semántica sobre pasajes financieros: informes anuales, notas contables, secciones MD&A y descripciones de riesgos.
- Agrupamiento (clustering) y deduplicación de fragmentos de documentación financiera.
- Clasificación downstream mediante embeddings congelados más una cabeza lineal.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles.
- Soporte de tool calling / function calling: no disponible (es un modelo de embeddings, no generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible por la misma razón.
- Capacidades multilingües: limitadas al inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- RAG sobre informes 10-K y memorias anuales: indexar los pasajes en una base vectorial y recuperar los fragmentos más relevantes para una consulta del analista; el ajuste sobre pasajes financieros mejora la precisión frente a embeddings genéricos en un vocabulario muy específico.
- Búsqueda semántica en archivos regulatorios: localizar notas sobre contingencias, impacto fiscal o arrendamientos sin depender de coincidencia exacta de términos, útil cuando la terminología varía entre ejercicios.
- Deduplicación de corpus documental: agrupar pasajes casi idénticos entre versiones de un mismo informe o entre emisores distintos para reducir el ruido en el corpus de entrenamiento o de indexación.
- Clasificación de secciones financieras: usar los embeddings como entrada de un clasificador que etiquete fragmentos por temática (fiscal, legal, operaciones, riesgos) sin reentrenar el encoder.
- Alertas de cambios materiales: comparar los embeddings de la misma sección entre dos ejercicios y marcar desviaciones semánticas relevantes para revisión humana.
- Enriquecimiento de motores de búsqueda internos: sustituir o complementar el ranking BM25 de un buscador corporativo de documentación financiera con un ranking denso.
- Evaluación de similitud entre comunicados: medir cuán próximo es un comunicado de prensa a un pasaje del informe anual para tareas de verificación documental.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Triplet | triplet eval | Cosine Accuracy | 0,9936 |

No se han publicado en la información disponible resultados en benchmarks estándar de embeddings (MTEB, BEIR, MMLU, HumanEval, GSM8K u otros). La métrica declarada corresponde a una evaluación de tripletas propia del autor, sin detalle del conjunto de evaluación ni del protocolo, por lo que no es directamente comparable con resultados públicos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 0,55 GB para los pesos (137 M de parámetros); en fp16, unos 0,27 GB. El consumo real depende del tamaño de batch y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para batches moderados; A100, H100, L4 o T4 para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, con margen amplio.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI), endpoints compatibles, y exportación a ONNX si se necesita servir en CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un encoder de 137 M de parámetros se espera un throughput alto en GPU moderna, pero no hay cifras declaradas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| finvector/nomic_raw_finmodern_tri_merged | 136,7 M | no disponible | Apache 2.0 | Embeddings financieros (fine-tune) |
| nomic-ai/nomic-embed-text-v1.5 | ~137 M | 8.192 tokens (según el modelo base) | Apache 2.0 | Embeddings generalistas |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | MIT | Embeddings generalistas ligeros |
| intfloat/e5-small-v2 | ~33 M | 512 tokens | MIT | Embeddings generalistas ligeros |

La comparación de rendimiento con estas alternativas no está disponible: el único dato publicado es la precisión coseno en la evaluación de tripletas propia del autor, que no se puede contrastar con MTEB o BEIR. La ventaja diferencial de este modelo es la especialización en dominio financiero; su desventaja es la falta de evaluación pública y la ausencia de variantes cuantizadas publicadas.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está validado y probablemente degrade la calidad de los embeddings.
- El dataset de entrenamiento es pequeño (11.687 ejemplos) y de dominio acotado; puede sobreajustar al estilo de los informes anuales usados y generalizar peor en otros registros financieros (prensa, mensajería regulatoria, transcripciones de llamadas).
- La métrica de 0,9936 en precisión coseno procede de una evaluación propia del autor, sin verificación independiente ni descripción del conjunto de evaluación; no debe interpretarse como rendimiento en benchmarks públicos.
- Riesgo de sesgo heredado del corpus de entrenamiento: los informes anuales de grandes empresas cotizadas estadounidenses pueden sobrerrepresentar determinados sectores y vocabulario corporativo.
- No es un modelo generativo: no produce texto, no admite tool calling ni razonamiento multi-paso; cualquier uso conversacional requiere emparejarlo con un LLM.
- No se documenta la longitud máxima de secuencia de este fine-tune; asumir la del modelo base sin verificación puede provocar truncamientos silenciosos.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento, que no se detallan.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicación muy reciente y sin validación comunitaria.
- No se publican variantes GGUF ni ONNX, lo que limita el despliegue en entornos sin soporte de safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finvector/nomic_raw_finmodern_tri_merged
- Modelo base: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de SimCSE (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Librería sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
