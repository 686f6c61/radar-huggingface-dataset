# pander14/all-minilm-l6-v2-pmc-citation-test-v1

## Resumen

`pander14/all-minilm-l6-v2-pmc-citation-test-v1` es un modelo de embeddings de frases (sentence-transformers) derivado por fine-tuning de `sentence-transformers/all-MiniLM-L6-v2`. Lo publica el usuario pander14 como piloto experimental para una tarea muy concreta: representar títulos y abstracts de artículos científicos en un espacio vectorial de 384 dimensiones en el que los pares con relación de citación directa queden más próximos que con el modelo base. La arquitectura es la del MiniLM original: un transformer BERT de 6 capas con 22.713.216 parámetros totales y una longitud máxima de secuencia de 256 wordpieces.

El problema que aborda es el de la generación de candidatos en mapeo de literatura: dado un artículo, recuperar vecinos cercanos que probablemente lo citen o sean citados por él, para que un experto revise esa lista. El ajuste se hizo con `MultipleNegativesRankingLoss` sobre 15.092 pares de citación directa extraídos de un corpus de 20.944 registros de texto completo de acceso abierto, enriquecido con consultas a OpenAlex por DOI.

Su relevancia es acotada y el propio autor la delimita: es un piloto con una evaluación de 48 pares retenidos, no un modelo de descubrimiento listo para producción. La mejora medida frente al base es modesta pero consistente (MRR 0,2894 frente a 0,2670; Recall@10 0,5625 frente a 0,4375) y el modelo es minúsculo, lo que lo hace trivial de desplegar en CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MiniLM-L6): 6 capas, dimensión oculta y de embedding de 384 |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 wordpieces (truncado a ese límite) |
| Tipos de cuantizacion | no disponible en la información proporcionada (al ser un modelo de 22,7 M de parámetros puede ejecutarse en FP32 sin problemas; se puede cuantizar a INT8/ONNX, pero no hay artefactos publicados) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de sentence-transformers, 0,1 GB) |

## Arquitectura y entrenamiento

La base es `all-MiniLM-L6-v2`, un transformer encoder de 6 capas con 384 dimensiones y atención completa estándar, destilado del family MiniLM. El fine-tuning no altera la arquitectura: parte del checkpoint preentrenado y ajusta los pesos con `MultipleNegativesRankingLoss`, una pérdida de contrastivo con negativos en el propio minibatch. La entrada es la concatenación `title + "\n\n" + abstract`, y la salida se normaliza para usar producto escalar como equivalente a similitud coseno.

Los hiperparámetros documentados son: 1 época, batch size 256, learning rate 2e-5, semilla 42, 15.092 pares positivos de citación directa y un corpus de 20.944 registros de papers de acceso no restringido con procedencia orientada a lesión medular (spinal cord injury). Las referencias se enriquecieron con consultas a OpenAlex basadas en DOI; solo se conservaron enlaces de citación con origen y destino dentro del corpus, con año de publicación de ambos extremos igual o anterior a 2021, y se excluyeron los pares que cruzaban la partición determinista train/development. Los metadatos de entrenamiento se incluyen en el repositorio como `abstract_citation_training.json`.

No hay innovaciones arquitectónicas: el interés está en la señal de entrenamiento (citación directa como proxy de proximidad semántica) y en el protocolo de evaluación, no en el modelo en sí.

## Capacidades

- Generación de embeddings de frases de 384 dimensiones para títulos y abstracts científicos, con normalización L2.
- Similitud semántica y recuperación por vecino más cercano (similitud coseno / producto escalar).
- Extracción de features (`feature-extraction`) además del pipeline `sentence-similarity`.
- Mapeo de literatura: vecinos cercanos en el espacio de embeddings como candidatos a relación de citación.
- Compatible con Text Embeddings Inference (tags `text-embeddings-inference` y `endpoints_compatible`), lo que permite servirlo como endpoint HTTP.
- Solo inglés; sin capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling: es un encoder, no un modelo generativo.
- Sin modo thinking, sin capacidades de agente y sin soporte multilingüe.

## Casos de uso

- Revisión sistemática de literatura: codificar los abstracts del corpus de cribado y agrupar por similitud para priorizar qué artículos leer primero, aprovechando que el modelo está ajustado con señal de citación real y no solo con similitud superficial de texto.
- Generación de candidatos de citación: dado un paper, recuperar los k vecinos más próximos como posibles referencias relacionadas y pasarlos a revisión de un experto; el autor lo plantea explícitamente como modelo de candidate generation, no de decisión.
- Búsqueda semántica sobre repositorios institucionales o bibliotecas de preprints en inglés: indexar título y abstract con este encoder y servir consultas por similitud; el tamaño de 22,7 M de parámetros permite indexar decenas de miles de documentos en CPU.
- Deduplicación y clustering de registros bibliográficos: detectar entradas repetidas o casi idénticas entre bases de datos (PubMed, Scopus, repositorios locales) comparando embeddings con un umbral de coseno.
- Recomendación de artículos en plataformas editoriales o portales de revistas: construir un "artículos relacionados" a partir de los vecinos en el espacio de embeddings del abstract de la página que se está visitando.
- Análisis bibliométrico exploratorio: construir un grafo de relaciones potenciales entre papers de un dominio y compararlo con el grafo de citas observado para detectar comunidades temáticas o citas ausentes.
- Triaje en pipelines de vigilancia científica: filtrar flujos diarios de nuevos preprints y marcar los que se acercan a un conjunto de artículos de referencia de un área concreta.
- RAG sobre documentación científica en inglés: usar los embeddings como recuperador sobre abstracts antes de pasar los documentos seleccionados a un LLM generativo; aquí el modelo solo hace la fase de retrieval.

## Benchmarks y rendimiento

El único resultado publicado es la evaluación piloto del autor. Conjunto de desarrollo de 1.042 papers candidatos, 48 pares de citación directa retenidos, ranking por similitud coseno excluyendo el propio paper de consulta:

| Modelo | MRR | Recall@1 | Recall@10 | Rango mediano |
|---|---:|---:|---:|---:|
| all-MiniLM-L6-v2 (base) | 0,2670 | 0,1875 | 0,4375 | 14 |
| Este piloto | 0,2894 | 0,2083 | 0,5625 | 8 |

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K, MTEB) en la información disponible; no son aplicables a un encoder de 384 dimensiones de este tipo.

## Requisitos de hardware

- VRAM estimada: unos 91 MB en FP32 y unos 45 MB en FP16 para los pesos, calculados a partir de los 22,7 M de parámetros; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090), en GPUs de inferencia pequeñas (T4, L4) e incluso en iGPU.
- Cabe en CPU sin problema: es un encoder de 6 capas y 384 dimensiones; el cuello de botella en producción será la indexación y la búsqueda vectorial, no el modelo.
- Opciones de despliegue: `sentence-transformers` en Python, Text Embeddings Inference (TEI) para servirlo como endpoint HTTP, y Hugging Face Inference Endpoints (el repo está marcado `endpoints_compatible`). No hay artefactos GGUF publicados, por lo que llama.cpp y Ollama no son una vía directa con este repositorio.
- Latencia y throughput: no se han publicado mediciones en la información disponible. Como referencia de orden de magnitud, con 256 wordpieces de entrada y lotes grandes la codificación debería ser de milisegundos por frase en GPU y de decenas de milisegundos en CPU, pero es una estimación, no un dato medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Este piloto | 22,7 M | 384 | 256 wordpieces | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| all-MiniLM-L6-v2 (base) | 22,7 M | 384 | 256 wordpieces | Apache-2.0 | Hugging Face, ampliamente utilizado |
| bge-small-en-v1.5 | ~33 M | 384 | 512 tokens | MIT | Hugging Face |
| e5-small-v2 | ~33 M | 384 | 512 tokens | MIT | Hugging Face |

Los datos del modelo base proceden de la información proporcionada. Las cifras de `bge-small-en-v1.5` y `e5-small-v2` no estaban incluidas en ella y se aportan como orientación general: conviene verificarlas en sus respectivas model cards antes de tomar decisiones. La comparación de rendimiento solo es posible contra el modelo base, con la tabla de la sección anterior; para el resto de alternativas no hay datos de la misma tarea de citación, por lo que la comparación de calidad queda como no disponible.

## Limitaciones y advertencias

- Evaluación muy pequeña: 48 pares retenidos y 1.042 papers candidatos; algunas consultas comparten paper de origen, así que las observaciones no son independientes. No debe seleccionarse como modelo de descubrimiento en producción sin un benchmark mayor con corte temporal estricto.
- Corte por año de publicación (2021 o anterior) no equivale a una evaluación prospectiva: el modelo puede estar explotando artefactos temporales del corpus.
- Sesgo de citación: la señal de entrenamiento son citas observadas, que reflejan convenciones de campo, visibilidad del autor y prácticas de citación, no calidad científica ni relación causal. El propio autor lo advierte.
- Falsos negativos: `MultipleNegativesRankingLoss` trata otros positivos del minibatch como negativos, de modo que papers relacionados pero no citados entre sí pueden quedar mal posicionados.
- Truncado a 256 wordpieces: abstracts largos pierden información; no hay pooling por ventanas ni soporte de documentos completos.
- Solo inglés. Cualquier uso en castellano u otros idiomas queda fuera del alcance declarado y no está evaluado.
- Cobertura de dominio: el corpus tiene procedencia orientada a lesión medular y acceso no restringido; la generalización a otras áreas o a literatura de pago no está probada.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación recién publicado, sin uso externo documentado.
- Licencia Apache-2.0 para pesos y contenidos del repositorio, lo que permite uso comercial del modelo; no obstante, el uso de la literatura de origen y de los metadatos externos (OpenAlex) queda sujeto a sus propios términos.
- No es un detector de novedad ni un modelo causal: los vecinos deben interpretarse como candidatos para revisión experta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pander14/all-minilm-l6-v2-pmc-citation-test-v1
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- OpenAlex (servicio de metadatos citado en el entrenamiento): https://openalex.org
- No se han encontrado en la información proporcionada enlaces a paper, blog, repositorio de código ni demo adicionales.
