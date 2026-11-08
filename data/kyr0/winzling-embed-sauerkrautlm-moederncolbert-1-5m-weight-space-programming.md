# kyr0/winzling-embed-SauerkrautLM-MoEdernColBERT-1.5M-weight-space-programming

## Resumen

`kyr0/winzling-embed-SauerkrautLM-MoEdernColBERT-1.5M-weight-space-programming` es un modelo de recuperación de información (retrieval) multilingüe derivado de `VAGOsolutions/SauerkrautLM-MoEdernColBERT-1.5M`. Se distribuye como grafo ONNX cuantizado a int8 (`model_q8.onnx`) y emplea una arquitectura ColBERT de interacción tardía (late interaction) con representaciones multi-vector. No es un modelo generativo: su función es producir embeddings de consulta y documento para búsqueda semántica y reranking mediante MaxSim.

El autor, `kyr0`, ha aplicado dos intervenciones sobre los pesos originales: una mezcla de destilaciones (blend de las rondas 2 y r3b) y una extensión del vocabulario con 11.998 piezas cirílicas para dotar al modelo de capacidad real de lectura en ruso, idioma que el tokenizador original no cubría (el 95% de los tokens de contenido rusos caían en `<unk>`). El resultado es un artefacto de la ronda 4 (2026-11-08) que mejora ligeramente las tareas de referencia en inglés, alemán y neerlandés y multiplica por varias veces el rendimiento en ruso.

Es relevante porque demuestra una metodología de edición de pesos reproducible y evaluada con intervalos de confianza bootstrap, sobre un modelo compacto (1,5M parámetros) apto para despliegue en CPU y entornos con recursos limitados. La licencia Apache 2.0 y el formato ONNX facilitan su integración en pipelines de búsqueda sin dependencia de frameworks de deep learning pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT de interacción tardía (late interaction), multi-vector, con capas FFN de tipo mixture-of-experts y hash-embedding; exportada a ONNX |
| Parametros totales | 1,5M (según el nombre del modelo base; no se detalla desglose en la información disponible) |
| Parametros activos | no disponible (el modelo base es MoE, pero no se especifica el número de expertos ni la ratio de activación) |
| Longitud de contexto | no disponible (la edición r3b entrena con documentos de 512 tokens) |
| Tipos de cuantizacion | int8 (q8) por columna de salida; el grafo distribuido es `model_q8.onnx` |
| Idiomas soportados | de, en, es, nl, fr, it, pt, ru (el ruso solo a partir de esta edición) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_q8.onnx`, `model_q8.round2.onnx`, `model_q8.round9-symmetric-rank16.onnx`) y `tokenizer.json` / `tokenizer.no-cyrillic.json` |

## Arquitectura y entrenamiento

El modelo base es un ColBERT multilingüe con capas FFN de mezcla de expertos y una tabla de hash-embedding. La edición de pesos se realiza en el espacio de parámetros PyTorch del modelo original: se desquantiza el grafo q8, se aplica la mezcla `P = P₀ + 0.5·(P_round2 − P₀) + 0.25·(P_r3b − P₀)` y se recuantiza por columna de salida con `scale = max|column| / 127`. La edición round-2 destila `SauerkrautLM-MoEdernColBERT-27M` en los expertos FFN de la capa 1, la normalización final y la proyección de tokens (458.880 parámetros). La edición r3b destila `SauerkrautLM-MoEdernColBERT-115M` (mismo tokenizador) en todos los pesos salvo la tabla de hash-embedding y los dos routers (1.002.368 parámetros), con documentos de 512 tokens.

Ambas destilaciones usan destilación a nivel de score sobre un positivo y siete negativos duros: término KL con τ = 3 más 0,1 × entropía cruzada, anclaje en espacio de funciones al modelo original con peso 1,0 y cuantización int8 straight-through durante el entrenamiento. Los routers permanecen congelados. Los datos de entrenamiento provienen solo de splits de train de 17 fuentes: MS MARCO, mMARCO de/nl, NQ, HotpotQA, GermanDPR, GermanQuAD, PubMedQA, SPECTER, StackExchange, GooAQ, ELI5, SQuAD, TriviaQA, BEIR-NL FiQA y SciFact, y MLDR-de. La selección de candidatos se hizo sobre dev retenido y compuertas out-of-domain (BEIR SciFact/FiQA/NFCorpus, bBSARD-NL, VABB, ArguAna-NL, SCIDOCS-NL, GermanGovService, MIRACL-de, XQuAD-de y Belebele), con una regla preregistrada.

La extensión cirílica entrena un modelo Unigram ruso de 12.000 piezas sobre 134 MB de texto solo cirílico (muestra de Wikipedia de MIRACL-ru más pasajes y consultas de mMARCO-ru), con el normalizador y pre-tokenizador existentes. Se añaden 11.998 piezas compuestas solo por letras cirílicas como ids 30002 a 41999, con dos placeholders inalcanzables en 30000 y 30001. Un desplazamiento de score en piezas iniciales de palabra hace que el tokenizador fusionado divida palabras rusas igual que el modelo ruso solo en 40.000 de 40.000 palabras retenidas. La tabla de hash-embedding recibe 11.998 filas nuevas de 16 dimensiones en int8 con una escala por fila; el grafo crece 239.961 bytes y no añade nodos.

## Capacidades

- Generación de embeddings multi-vector para recuperación (retrieval) mediante MaxSim, no generación de texto.
- Búsqueda semántica y reranking multilingüe en ocho idiomas: alemán, inglés, español, neerlandés, francés, italiano, portugués y ruso.
- Lectura efectiva de ruso tras la extensión del vocabulario: la proporción de `<unk>` en texto ruso retenido baja del 42,6% al 1,4% de los tokens.
- Interacción tardía a nivel de token, adecuada para reranking fino de pasajes.
- Ejecución en ONNX Runtime, sin necesidad de PyTorch en producción.
- Invariancia verificada para texto sin caracteres cirílicos: ids de token idénticos en 41.363 textos de 19 idiomas y vectores de token idénticos (máx. |diff| = 0) en 1.008 codificaciones de consulta y documento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de representación, no un LLM.

## Casos de uso

- Búsqueda semántica en corpus multilingües europeos: el modelo indexa documentos en alemán, neerlandés, francés, italiano, portugués y español y permite consultas cruzadas entre idiomas, con vectores multi-vector que mejoran la precisión frente a embeddings de vector único.
- Reranking de resultados de un primer recuperador (BM25 o denso): la interacción tardía y MaxSim permiten reordenar los top-k candidatos con coste bajo gracias al tamaño de 1,5M parámetros.
- Recuperación en ruso sobre Wikipedia o MIRACL-ru: la extensión cirílica eleva el nDCG@10 de 0,013 a 0,350 en MIRACL-ru y de 0,072 a 0,681 en Belebele, lo que hace viable el uso en dominios rusos que el modelo original no podía abordar.
- Búsqueda en documentación técnica y soporte interno en alemán: las mejoras significativas en GermanDPR (+0,008) y GermanQuAD (+0,003) lo hacen adecuado para bases de conocimiento corporativas en ese idioma.
- Despliegue en el borde o en CPU: al ser un grafo ONNX int8 de tamaño reducido (el repositorio ocupa 0,0 GB y el grafo crece solo 240 KB con la extensión), puede ejecutarse en servidores sin GPU o en dispositivos con memoria limitada dentro de un pipeline de búsqueda.
- Filtrado y deduplicación de datasets: los embeddings multi-vector permiten calcular similitud entre pasajes para detectar duplicados o near-duplicates en corpus multilingües antes del entrenamiento.
- Evaluación comparativa de ediciones de pesos: el repositorio incluye los grafos de rondas anteriores (`model_q8.round2.onnx`, `model_q8.round9-symmetric-rank16.onnx`) y el script `reproduce/blend_edits.py`, útil como caso de estudio reproducible de edición y validación estadística de modelos de retrieval.

## Benchmarks y rendimiento

Los datos disponibles son del autor y se expresan como diferencias de nDCG@10 macro con intervalos de confianza bootstrap del 95%, no como valores absolutos salvo en ruso.

| Benchmark | Resultado | Comparación |
|---|---|---|
| Macro nDCG@10 (inglés, alemán, neerlandés) | +0,0015 frente al original (IC 95% −0,0026 a +0,0054) | +0,0012 frente a la edición round-2 (IC −0,0009 a +0,0033) |
| GermanDPR | +0,008 | Mejora significativa frente al original |
| GermanQuAD | +0,003 | Mejora significativa frente al original |
| Belebele (ruso) | 0,681 | 0,072 en el original |
| MIRACL-ru | 0,350 | 0,013 en el original |
| Tareas rusas (seis tareas) | 0,35 a 0,86 | 0,01 a 0,16 en el original |
| Resto de benchmarks de la model card | Sin empeoramiento significativo | — |

No se han publicado resultados absolutos de MMLU, HumanEval o GSM8K porque el modelo no es generativo y esas métricas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, al tratarse de un grafo ONNX int8 de 1,5M parámetros; el repositorio ocupa 0,0 GB y la extensión añade 239.961 bytes. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU con ONNX Runtime. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera la inferencia, pero no es necesaria.
- Cabe en GPU consumer: sí, en todas, incluida la gama de entrada.
- Opciones de despliegue: ONNX Runtime (formato nativo), Text Embeddings Inference (TEI) y cualquier servidor compatible con grafos ONNX. No se distribuyen pesos safetensors ni GGUF en este repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| winzling-embed-SauerkrautLM-MoEdernColBERT-1.5M (este) | 1,5M | no disponible | 8 (de, en, es, nl, fr, it, pt, ru) | Apache 2.0 | ONNX int8 |
| VAGOsolutions/SauerkrautLM-MoEdernColBERT-1.5M (base) | 1,5M | no disponible | de, en, nl (ruso no funcional) | Apache 2.0 (según modelo base) | PyTorch / ONNX |
| kyr0/Winzling-Embed-a8m-64k | 29,1 MiB en UINT4 | 64k (según nombre) | de, en, ru | MIT | ONNX UINT4 / Safetensors |
| SauerkrautLM-MoEdernColBERT-27M | 27M | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los modelos mencionados en la información disponible; no se dispone de métricas cruzadas entre ellos.

## Limitaciones y advertencias

- El modelo es exclusivamente de retrieval y representación; no genera texto ni responde preguntas de forma directa.
- La mejora en las tareas de referencia en inglés, alemán y neerlandés es marginal (+0,0015 de nDCG@10 macro) y su intervalo de confianza incluye el cero: no puede afirmarse una mejora global significativa.
- El soporte de ruso depende de la extensión cirílica; textos con caracteres cirílicos fuera del vocabulario añadido o con mezclas de escrituras pueden comportarse de forma distinta a la evaluada.
- Los routers de la mezcla de expertos permanecen congelados: el enrutamiento solo cambia por las entradas modificadas, lo que limita la adaptación de la arquitectura MoE.
- No se han publicado evaluaciones independientes; todos los resultados proceden del autor y de su propio protocolo preregistrado.
- No hay datos sobre sesgos, tasas de alucinación (no aplica a un modelo no generativo) ni comportamiento en dominios especializados distintos de los 17 conjuntos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los modelos destilados (27M y 115M) antes de su explotación en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyr0/winzling-embed-SauerkrautLM-MoEdernColBERT-1.5M-weight-space-programming
- Modelo base: https://huggingface.co/VAGOsolutions/SauerkrautLM-MoEdernColBERT-1.5M
- Exportación ONNX previa: `kyr0/SauerkrautLM-MoEdernColBERT-1.5M-ONNX` (referenciada en la model card, sin URL directa en la información disponible)
- Documento de experimentos: `WEIGHT-EXPERIMENTS.md` (en el repositorio del modelo)
- Script de reproducción de la mezcla: `reproduce/blend_edits.py` (en el repositorio del modelo)
- Regla de preregistro de la ronda 4: `eval/round4-preregistration.md` (en el repositorio del modelo)
- Modelo relacionado del mismo autor: https://huggingface.co/kyr0/Winzling-Embed-a8m-64k
