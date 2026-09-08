# abdelkarim98/tendril-models

## Resumen

TENDRIL es un sistema de recuperación aumentada por generación (RAG) multi-hop de bajo coste, compuesto por dos modelos pequeños entrenados: el Builder (184M parámetros, un cross-encoder DeBERTa-v3-base con cabeza lineal de puntuación) y el Decomposer (247M parámetros, un Flan-T5-base fine-tuned para descomposición de preguntas). Lo desarrolla abdelkarim98 (Abdelkarim Choukri) y se publica bajo licencia MIT. El repositorio de HuggingFace contiene los pesos de ambos modelos, que se usan para reranking de evidencia y descomposición de preguntas en pipelines RAG multi-hop.

El problema que resuelve es el coste de los sistemas RAG multi-hop: la investigación que acompaña a estos modelos sostiene que la brecha entre sistemas baratos y caros se puede cubrir con una mejor recuperación, no con más llamadas a modelos grandes. El Builder y el Decomposer son las piezas que realizan esa recuperación y planificación, permitiendo construir sistemas de bajo coste con solo cuatro llamadas a un LLM en lugar de muchas. Son relevantes ahora porque abordan un cuello de botella práctico en sistemas de QA multi-hop: la calidad de la recuperación a lo largo de la cadena de razonamiento.

Contexto: ambos modelos base tienen una ventana de 512 tokens; el Builder se entrenó con max_len 352. No se proporcionan datos de cuantización en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder DeBERTa-v3-base con cabeza lineal de puntuación (Builder) y encoder-decoder Flan-T5-base (Decomposer) |
| Parametros totales | 431M combinados (184M Builder + 247M Decomposer) |
| Longitud de contexto | 512 tokens (ventana nativa de los modelos base); max_len 352 en entrenamiento del Builder |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, head.pt) |

## Arquitectura y entrenamiento

El Builder es un cross-encoder basado en DeBERTa-v3-base-squad2, que puntúa pares (consulta, fragmento). No es un checkpoint SequenceClassification estándar: necesita el archivo head.pt, que contiene la cabeza lineal de puntuación. Se entrenó sin supervisión de LLM: 6.000 preguntas por dataset (HotpotQA, 2WikiMultihopQA, MuSiQue) de las divisiones públicas de entrenamiento, con párrafos agrupados en un corpus estilo RT-RAG y troceados con el chunker de RT-RAG. Un fragmento se considera gold si su documento fuente es uno de los párrafos de apoyo de la pregunta (identidad de documento, no coincidencia de título). Una segunda familia de pools reproduce la ronda 1 del bucle de despliegue para enseñar al modelo a puntuar consultas condicionadas. En total, 21.471 grupos listwise, entrenados con softmax por grupo. Hiperparámetros: lr 1e-05, batch_groups 2, max_len 352, seed 42, 2 épocas (se seleccionó la época 0).

El Decomposer es un Flan-T5-base fine-tuned para dividir una pregunta multi-hop en como máximo cuatro sub-preguntas de un solo salto, con placeholders #1–#3. Dos tercios de su supervisión son gratuitos y gold: MuSiQue publica descomposiciones de preguntas (~19.5k) y las triplas de evidencia de 2Wiki se convierten en sub-preguntas mediante plantillas (~12.0k). Para HotpotQA, que no publica descomposiciones, se destilan offline las salidas de planificación de un modelo 14B sobre ~9k preguntas. Es el único uso de un modelo grande en el entrenamiento. Todos los 200 ids de evaluación LongBench y los 400 ids de desarrollo están excluidos de todas las fuentes de entrenamiento.

## Capacidades

- Reranking de pares (consulta, fragmento): el Builder puntúa la relevancia de un fragmento para una consulta, tanto en pools iniciales como en fragmentos recién recuperados o candidatos condicionados a cadenas parciales.
- Re-retrieval por salto en inferencia: el Builder puede re-ejecutar la recuperación en cada salto de la cadena, lo que permite ensamblar evidencia de forma iterativa.
- Descomposición de preguntas multi-hop: el Decomposer divide una pregunta compleja en sub-preguntas de un solo salto, con hasta cuatro sub-preguntas y placeholders.
- No genera texto de respuesta: el Builder no responde preguntas ni verifica hechos; el Decomposer no responde preguntas, solo las planifica.
- Capacidades multilingües: limitadas al inglés; ambos modelos fueron entrenados en corpus derivados de Wikipedia en inglés.
- Soporte de tool calling: no disponible; no se menciona en la información.

## Casos de uso

- Reranking de evidencia en RAG multi-hop: el Builder se usa para puntuar los fragmentos recuperados en cada salto y seleccionar los más relevantes, mejorando la precisión de la cadena de razonamiento sin aumentar las llamadas al LLM.
- Descomposición de preguntas para QA multi-hop: el Decomposer convierte una pregunta compleja en sub-preguntas simples, que luego se pueden recuperar y responder de forma independiente, reduciendo la carga de razonamiento del LLM.
- Optimización de coste en pipelines RAG: el sistema TENDRIL completo permite construir un pipeline de bajo coste con solo cuatro llamadas al LLM, en lugar de las muchas que requieren los sistemas de razonamiento en árbol; los dos modelos son las piezas que hacen viable ese recorte.
- Investigación en recuperación de información: el Builder sirve como cross-encoder de referencia para evaluar la calidad de reranking en benchmarks como HotpotQA, 2WikiMultihopQA y MuSiQue, donde se reportan métricas de full-chain@15 y anchor@15.
- Ensamblaje de evidencia consciente de la cadena: el Builder puede rescorear candidatos condicionados a cadenas parciales, lo que permite construir evidencia paso a paso en sistemas de QA multi-hop.
- Integración en pipelines de LongBench: los modelos están pensados para el entorno de evaluación LongBench v1, donde se pueden usar para medir el impacto de la recuperación en el rendimiento final de sistemas RAG.

## Benchmarks y rendimiento

No se han publicado benchmarks del Decomposer en la información disponible. Para el Builder, la model card incluye una tabla de validación en pools del lado de entrenamiento. Estos números son de una sola pasada y no representan el rendimiento desplegado; las divisiones condicionadas tienen muestras pequeñas (n=37 en HotpotQA).

| Split | Métrica | HotpotQA | 2Wiki | MuSiQue |
|---|---|---|---|---|
| plain (n=400 cada uno) | full-chain@15 | 0,835 | 0,465 | 0,4675 |
| plain (n=400 cada uno) | anchor@15 | 1,000 | 1,000 | 0,990 |
| conditioned | top-3 hit | 0,9459 | 0,9447 | 0,7802 |
| conditioned | top-1 hit | 0,8108 | 0,8894 | 0,6154 |
| conditioned | n | 37 | 199 | 91 |

## Requisitos de hardware

- VRAM estimada: el Builder (184M) en FP16 ocupa ~0,4 GB de pesos; con overhead y batch, se recomienda al menos 1–2 GB de VRAM. El Decomposer (247M) en FP16 ocupa ~0,5 GB; al menos 1–2 GB de VRAM. En conjunto, ambos caben en una GPU con 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más, como RTX 3050, RTX 4060, A10, o incluso CPU; no se requieren GPUs de alta gama (A100/H100).
- Despliegue en consumer GPU: sí, ambos modelos son pequeños y caben en GPUs de consumo.
- Opciones de despliegue: transformers (PyTorch) y los scripts del repositorio TENDRIL-RAG (scripts/fetch_weights.sh, src/rtrag_decomp_probe.py, src/rtrag_probe2_rescore.py). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de comparativas publicadas en la información proporcionada. Los modelos base son deberta-v3-base-squad2 y flan-t5-base, pero no hay datos de comparación de rendimiento con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- El Builder puntúa relevancia, no corrección factual. La model card reporta un resultado negativo: la completitud de la cadena no es legible desde la geometría de puntuación (un gate de 22 características alcanza AUC 0,73–0,75, y 0,60 en MuSiQue, cerca del azar). No usar como filtro de fiabilidad.
- El Decomposer no responde preguntas; solo las divide. No debe usarse como sistema de QA.
- Ambos modelos están entrenados en inglés y en corpus derivados de Wikipedia en inglés, por lo que heredan los sesgos de esos corpus.
- Los números de validación condicionados del Builder se basan en muestras pequeñas (n=37 en HotpotQA), por lo que no son estadísticamente robustos.
- No hay benchmarks de despliegue publicados en la información disponible; los resultados de la model card son de validación en pools de entrenamiento, no del sistema desplegado.
- El Builder requiere el archivo head.pt; no se puede cargar como un checkpoint SequenceClassification estándar sin ese archivo.
- No se dispone de información sobre cuantización, lo que limita las opciones de despliegue en entornos con restricciones de memoria.

## Enlaces

- HuggingFace: https://huggingface.co/abdelkarim98/tendril-models
- Código: https://github.com/abdelkarim-choukri/TENDRIL-RAG
- Paper: enlace de arXiv pendiente (no disponible en la información proporcionada)
