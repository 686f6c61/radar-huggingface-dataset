# ahmedewaidar22/ar-route

## Resumen

AR-Route es un artefacto de investigación publicado por Ahmed Dewaidar, Mohamed Shaheen y Eman AbdelAziz (Arab Academy for Science, Technology and Maritime Transport) que acompaña al artículo "Dialect-Aware, Confidence-Gated Retrieval for Arabic RAG: When Learned Complexity Routing Fails to Transfer". No es un modelo generativo, sino un conjunto de componentes para construir un pipeline de recuperación aumentada (RAG) sobre árabe: una cabeza de clasificación de dialecto, un corpus de recuperación de 25.147 pasajes en árabe con embeddings precalculados y un enrutador de complejidad aprendido incluido únicamente por motivos de reproducibilidad.

El componente principal es un clasificador de dialecto construido mediante fine-tuning de AraBERT v0.2 base (aubmindlab/bert-base-arabertv02), un transformer encoder de tipo BERT adaptado al árabe. Su tarea es distinguir entre árabe egipcio coloquial y árabe estándar moderno (MSA) para decidir si una pregunta debe reescribirse antes de la búsqueda documental. El repositorio también incluye el corpus, las embeddings BGE-M3 y las estadísticas del mismo.

La relevancia del trabajo reside en su evaluación empírica: sobre un test confirmatorio congelado de 1.027 preguntas egipcias, el pipeline propuesto alcanza un 76,8 % de exactitud frente al 74,3 % de un RAG estándar (+2,5 puntos, McNemar p = 0,012) con un 7 % menos de coste de generador, y se mantiene dentro de un margen de no inferioridad de 5 puntos respecto a la recuperación iterativa siempre activa con un 41 % menos de coste. El hallazgo negativo —que el enrutador de complejidad aprendido no transfiere a datos retenidos— es parte central de la contribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) para la cabeza de dialecto; pipeline RAG híbrido (BM25 + BGE-M3 denso + reranker) |
| Parámetros totales | No disponible (AraBERT v0.2 base; el autor no publica el recuento exacto) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (limitada por la ventana de AraBERT v0.2 base) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Árabe (`ar`), con distinción entre árabe egipcio y MSA |
| Licencia | Apache-2.0 (modelos y código); los pasajes del corpus conservan las licencias de sus datasets de origen |
| Formato de pesos | safetensors (`dialect_head/model.safetensors`); embeddings en `.npy`; corpus en `.jsonl`; enrutador en joblib/safetensors |

## Arquitectura y entrenamiento

La cabeza de dialecto es un fine-tuning de clasificación de secuencias sobre AraBERT v0.2 base, un encoder BERT preentrenado específicamente para árabe. El modelo recibe la pregunta del usuario y devuelve una distribución de probabilidad sobre dos clases (egipcio frente a MSA). El pipeline completo que describe el autor consta de cuatro etapas: clasificación de dialecto, reescritura de preguntas egipcias a MSA mediante un LLM (gpt-4.1-mini), recuperación híbrida con fusión de rangos recíprocos (BM25 + búsqueda densa con BGE-M3) y reranking con bge-reranker-v2-m3 hasta los dos pasajes principales; el generador responde a partir de esos dos pasajes y solo escala a recuperación iterativa multi-paso si responde "no lo sé".

La política de decisión es una compuerta por confianza: las preguntas con probabilidad egipcia superior a 0,8 se reescriben a MSA, las inferiores a 0,2 se buscan tal cual y las intermedias se buscan en ambas formas fusionando los dos rankings. El corpus de recuperación (25.147 pasajes) se compone de ArabicaQA (14.051), contextos de HotpotQA en árabe (9.389), MAFQA (1.162), ArDQA (345) y un conjunto piloto de 200. El repositorio incluye además el Router v1, un enrutador de complejidad de tres etapas con cabeceras de texto y de lector y clasificadores de etapa B/C con umbrales en `policy.json`; el autor indica explícitamente que este enrutador no superó al RAG estándar con igual coste en preguntas egipcias retenidas y que se incluye solo por reproducibilidad.

## Capacidades

- Clasificación binaria de dialecto árabe: egipcio frente a MSA, con salida de probabilidad calibrada por clase.
- Compuerta por confianza para enrutamiento de consultas (umbrales 0,2 y 0,8 en la política descrita).
- Recuperación híbrida sobre árabe: BM25 léxico combinado con búsqueda densa BGE-M3 y fusión de rangos recíprocos.
- Reranking de pasajes candidatos con bge-reranker-v2-m3 hasta el top-2.
- Corpus de recuperación listo para usar con embeddings precalculados (25.147 pasajes).
- Integración con pipelines RAG externos mediante la librería `transformers` y `huggingface_hub`.
- No soporta generación de texto, tool calling, agentes ni visión: es un componente de clasificación y recuperación, no un modelo generativo.

## Casos de uso

- RAG sobre árabe con mezcla de dialectos: el clasificador decide si una pregunta egipcia debe normalizarse a MSA antes de la búsqueda, lo que según el artículo mejora la exactitud un 2,5 % sobre RAG estándar en el test congelado.
- Atención al cliente en árabe egipcio: las consultas coloquiales de usuarios se enrutan y normalizan antes de la recuperación documental, reduciendo fallos de búsqueda por vocabulario dialectal.
- Construcción de un índice de recuperación en árabe: el corpus de 25.147 pasajes con embeddings BGE-M3 precalculados sirve como base para prototipos de búsqueda semántica sin necesidad de reindexar.
- Optimización de coste en pipelines generativos: la compuerta por confianza evita la reescritura y la recuperación iterativa en los casos en que no aportan, con un 7 % menos de coste de generador que RAG estándar y un 41 % menos que la recuperación siempre iterativa.
- Investigación en enrutamiento adaptativo: el repositorio incluye el Router v1 y sus umbrales para reproducir el resultado negativo de transferencia entre dominios.
- Filtrado previo en sistemas de búsqueda multilingües: la detección egipcio/MSA permite seleccionar el analizador morfológico o el tokenizador adecuado por consulta.
- Evaluación comparativa de retrievers: el conjunto de evaluación `ar-route-eval` y el corpus permiten medir BM25, denso y híbrido sobre las mismas preguntas.

## Benchmarks y rendimiento

| Métrica | AR-Route (propuesto) | RAG estándar | Recuperación siempre iterativa |
|---|---|---|---|
| Exactitud en test congelado (1.027 preguntas egipcias) | 76,8 % | 74,3 % | Dentro del margen de no inferioridad de 5 puntos |
| Diferencia frente a RAG estándar | +2,5 puntos (McNemar p = 0,012) | — | — |
| Coste de generador | −7 % frente a RAG estándar | Referencia | −41 % frente a iterativa |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para la cabeza de dialecto; las cifras anteriores son las del pipeline completo reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para la cabeza de dialecto: no disponible en la información proporcionada; por su base (AraBERT v0.2 base) es un modelo pequeño que cabe con holgura en GPUs de consumo, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles; el pipeline completo depende de BGE-M3 y del reranker, que sí requieren GPU para un throughput razonable.
- Cabe en GPU de consumo: la cabeza de dialecto, previsiblemente sí; el pipeline completo con BGE-M3 y reranker requiere evaluación adicional no documentada.
- Opciones de despliegue: `transformers` para la cabeza de dialecto; `huggingface_hub` para descargar el corpus y las embeddings; el pipeline completo está en el repositorio de código del autor.
- Latencia: la reescritura añade aproximadamente 0,8 s por pregunta egipcia, según el autor. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AR-Route (este) | Clasificador de dialecto + corpus RAG | Árabe (egipcio/MSA) | No disponible | Apache-2.0 | Hugging Face |
| AraBERT v0.2 base | Encoder BERT preentrenado | Árabe | No disponible | No disponible en esta ficha | Hugging Face (aubmindlab) |
| MARBERT | Encoder BERT para dialectos árabes | Árabe (dialectal) | No disponible | No disponible en esta ficha | Hugging Face |
| CAMeLBERT-DA | Encoder BERT para dialectos árabes | Árabe (dialectal) | No disponible | No disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a tipo de tarea, idioma y licencia.

## Limitaciones y advertencias

- La cabeza de dialecto solo distingue egipcio de MSA; otros dialectos árabes (golfo, magrebí, levantino) quedan fuera de alcance.
- Los resultados se midieron con gpt-4.1-mini (y gpt-6.1-sol como segundo generador) sobre un único corpus; otros generadores, retrievers o dialectos pueden comportarse de forma distinta.
- La reescritura añade unos 0,8 s por pregunta egipcia, lo que penaliza la latencia en tiempo real.
- El enrutador de complejidad aprendido (Router v1) no superó al RAG estándar con igual coste en datos retenidos, por lo que no debe usarse en producción sin revalidación.
- Riesgo de alucinación del generador del pipeline: el diseño mitiga parcialmente el problema limitando la respuesta a dos pasajes, pero no lo elimina.
- Licencia Apache-2.0 para modelos y código, pero los pasajes del corpus provienen de ArabicaQA, HotpotQA, MAFQA y ArDQA y conservan sus términos originales; es necesario citar esos datasets y verificar sus licencias para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el artículo está marcado como "under review": no hay validación independiente publicada.
- El tamaño del repositorio (2,3 GB) incluye el corpus y las embeddings, no solo los pesos del clasificador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedewaidar22/ar-route
- Dataset de evaluación: https://huggingface.co/datasets/ahmedewaidar22/ar-route-eval (DOI: 10.57967/hf/11866)
- Código del pipeline: https://github.com/ahmedewaidar22/Dialect-Aware-Confidence-Gated-Retrieval-for-Arabic-RAG
- DOI del modelo: 10.57967/hf/11867
- Modelo base AraBERT v0.2: https://huggingface.co/aubmindlab/bert-base-arabertv02
