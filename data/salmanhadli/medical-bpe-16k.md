# salmanhadli/medical-bpe-16k

## Resumen

medical-bpe-16k es un tokenizador byte-level BPE de 16.000 tokens desarrollado por el usuario de HuggingFace salmanhadli y entrenado exclusivamente sobre 45.000 resúmenes (abstracts) de PubMed. No es un modelo de lenguaje: no contiene pesos, no genera texto y no incorpora conocimiento médico. Se distribuye como un artefacto de tokenización (`tokenizer.json`) bajo licencia MIT y librería `transformers`.

El problema que aborda es el coste de secuencia en pipelines biomédicos. Al reasignar todo el presupuesto de vocabulario a morfología del dominio (`-ation`, `-osis`, `-emia`, `-inib`), consigue una fertilidad de 1,375 tokens por palabra en texto biomédico retenido, frente a 1,460 de `cl100k_base` (GPT-4) y 1,430 de `o200k_base` (GPT-4o), pese a tener un vocabulario entre 6 y 12 veces más pequeño. Eso se traduce en un 5,8 % menos de tokens por abstract que GPT-4 y un 3,8 % menos que GPT-4o.

La contrapartida es explícita en la propia model card: en inglés general la fertilidad sube a 1,577, un 35,6 % más de tokens que `o200k_base`. Es, por tanto, una pieza de infraestructura para dominios concretos (literatura biomédica, notas clínicas en inglés) y no un reemplazo de uso general. Su relevancia actual es la de servir como alternativa reproducible y de tamaño reducido para pipelines donde la longitud de contexto o el coste por token son la restricción dominante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no aplica (no es una red neuronal); algoritmo byte-level BPE (`tokenizers.models.BPE`) |
| Parámetros totales | no aplica (sin pesos de modelo); vocabulario de 16.000 tokens |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (el tokenizador no impone límite; lo fija el modelo que lo utilice) |
| Tipos de cuantización | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | inglés (corpus de entrenamiento). Cobertura byte-level completa: cualquier UTF-8 hace round-trip sin pérdida, pero se fragmenta más en otros idiomas |
| Licencia | MIT |
| Formato de pesos | no hay pesos; se distribuye `tokenizer.json` (formato de la librería `tokenizers`), junto con la configuración estándar de HuggingFace |
| Tamaño de vocabulario | 16.000 tokens |
| Frecuencia mínima de merge | 2 |
| Pre-tokenizador | `ByteLevel(add_prefix_space=False)` |
| Decoder / post-procesador | `ByteLevel` (`trim_offsets=True`) |
| Tokens especiales | `<\|endoftext\|>` (eos) y `<pad>`; no hay `unk_token` |
| Corpus de entrenamiento | 45.000 abstracts de `slinusc/PubMedAbstractsSubset` |
| Conjunto de evaluación retenido | 5.000 abstracts disjuntos del entrenamiento |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un BPE a nivel de byte, no de un transformer. El vocabulario de 16.000 entradas se construye con merges sobre texto pre-tokenizado con `ByteLevel(add_prefix_space=False)` y una frecuencia mínima de 2. Al ser byte-level, existe cobertura completa de bytes y no se define `unk_token`: cualquier entrada UTF-8 se codifica y decodifica de forma reversible. El decodificador aplica `ByteLevel` con `trim_offsets=True`. Los únicos tokens especiales son `<|endoftext|>` como EOS y `<pad>`.

El corpus son 45.000 abstracts de PubMed. La innovación metodológica que documenta el autor es el control experimental: además del tokenizador de dominio, entrena un BPE del mismo tamaño (16.000) sobre wikitext, de modo que la diferencia de rendimiento pueda atribuirse al corpus y no al algoritmo ni al tamaño del vocabulario. El contraste es medible en la tabla de merges: los primeros merges de este tokenizador son `in`, `ti`, `al`, `ra` y capturan sufijos con carga morfológica biomédica, mientras que los del control son puntuación (`Ġ,`, `Ġ.`). El entrenamiento es reproducible con el repositorio `tokenization-explainer` mediante `scripts/train_medical_tokenizer.py` y el script de comparación `scripts/compare_tokenizers.py`. No se documenta ningún tipo de RLHF, DPO ni ajuste por preferencias, ya que no hay modelo entrenado.

## Capacidades

- Codificación y decodificación de texto byte-level con round-trip sin pérdida para cualquier entrada UTF-8, sin token de desconocido.
- Tokenización eficiente de prosa biomédica en inglés: fertilidad de 1,375 tokens por palabra en abstracts de PubMed retenidos.
- Captura de morfología clínica y farmacológica: `acetylcholinesterase inhibitor` se codifica en 3 piezas, frente a 6 con `o200k_base`, 7 con `cl100k_base` y 10 con un BPE de igual tamaño entrenado en wikitext.
- Cobertura de términos clínicos como token único: 2 de 20 términos clínicos comunes (`hemoglobin`, `lymphocyte`) se codifican en un solo token, frente a 0 de 20 en `cl100k_base`, `o200k_base` y el control.
- Compatibilidad con el ecosistema HuggingFace: `AutoTokenizer.from_pretrained(...)` y carga directa del fichero mediante `tokenizers.Tokenizer.from_file` con `hf_hub_download`.
- No dispone de tool calling, function calling, modo thinking, capacidades de agente, visión, audio ni generación de texto: es exclusivamente un componente de preprocesado.

## Casos de uso

- Preprocesado de pipelines de NLP biomédico: para tareas de reconocimiento de entidades nombradas o extracción de relaciones sobre abstracts de PubMed, el tokenizador reduce el número de tokens por documento un 5,8 % respecto a `cl100k_base`, lo que se traduce en secuencias más cortas y menos coste de atención en el modelo aguas abajo.
- Entrenamiento de modelos de dominio desde cero con presupuesto de hardware ajustado: una matriz de embeddings de 16.000 × d es entre 6 y 12 veces más pequeña que con vocabularios de 100.000 o 200.000 entradas, lo que libera memoria para capas de atención o para aumentar el batch.
- Recuperación aumentada (RAG) sobre literatura biomédica: al necesitar 188,8 tokens por abstract de media en lugar de 200,5, cabe un mayor número de documentos en una misma ventana de contexto, con la misma longitud nominal.
- Compresión y almacenamiento de corpus científicos: la reducción de tokens por documento disminuye el tamaño de los corpus tokenizados y el coste de I/O en pipelines de preentrenamiento o indexación.
- Análisis de notas clínicas en inglés: útil para textos con morfología clínica estándar; hay que asumir que la taquigrafía clínica y los fármacos posteriores al corpus se fragmentarán más de lo que indican las métricas.
- Experimentación en investigación sobre tokenización: el diseño incluye un control de igual tamaño sobre wikitext, lo que permite aislar el efecto del corpus en estudios de fertilidad y de asignación de vocabulario.
- Indexación de vocabulario para motores de búsqueda biomédicos: la cobertura de sufijos como `-osis` o `-emia` como piezas frecuentes mejora la coincidencia parcial entre términos morfológicamente relacionados.
- Integración en pipelines de CI/CD de NLP como dependencia de tokenización fija y versionada, con licencia MIT y sin requisitos de acelerador.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de fertilidad (tokens por palabra separada por espacios; menor es mejor) y de cobertura en token único. Todas las evaluaciones se hicieron sobre conjuntos retenidos que no aparecen en el entrenamiento.

Texto biomédico (PubMed retenido, n = 5.000):

| Tokenizador | Vocabulario | Fertilidad | Tokens medios por abstract |
|---|---|---|---|
| medical-bpe-16k | 16.000 | 1,375 | 188,8 |
| o200k_base (GPT-4o) | 200.000 | 1,430 | 196,3 |
| cl100k_base (GPT-4) | 100.000 | 1,460 | 200,5 |
| general-bpe (control) | 16.000 | 1,747 | 239,9 |

Inglés general (wikitext-103 retenido, n = 5.000):

| Tokenizador | Vocabulario | Fertilidad | Tokens medios por párrafo |
|---|---|---|---|
| o200k_base (GPT-4o) | 200.000 | 1,163 | 163,9 |
| cl100k_base (GPT-4) | 100.000 | 1,173 | 165,3 |
| general-bpe (control) | 16.000 | 1,208 | 170,3 |
| medical-bpe-16k | 16.000 | 1,577 | 222,2 |

Cobertura en token único sobre 20 términos clínicos comunes:

| Tokenizador | Términos codificados en un solo token |
|---|---|
| medical-bpe-16k | 2/20 (`hemoglobin`, `lymphocyte`) |
| cl100k_base | 0/20 |
| o200k_base | 0/20 |
| general-bpe (control) | 0/20 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K ni equivalentes): al no existir pesos de modelo, esas evaluaciones no aplican.

## Requisitos de hardware

- VRAM para inferencia: no aplica. Es un tokenizador, no un modelo de pesos; se ejecuta en CPU y su huella en memoria es despreciable frente a cualquier red neuronal.
- GPU recomendadas: ninguna en particular. No requiere A100, H100, RTX 4090 ni ningún acelerador para funcionar; el coste relevante es el del modelo que consuma sus salidas.
- Ejecución en hardware de consumo: sí, en cualquier CPU. También cabe sin problema en entornos sin GPU, contenedores ligeros y funciones serverless.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), librería `tokenizers` cargando `tokenizer.json` desde HuggingFace Hub, o uso offline del fichero en cualquier pipeline Python. No aplica vLLM, llama.cpp, Ollama ni TGI para el tokenizador en sí, aunque los tres primeros pueden emplearlo como componente del modelo que sirven.
- Latencia y throughput: no disponible. La model card no publica mediciones de velocidad de tokenización.
- Impacto indirecto en el coste de inferencia: en abstracts de PubMed, un pipeline que use este tokenizador procesa aproximadamente un 5,8 % menos de tokens que con `cl100k_base` y un 3,8 % menos que con `o200k_base`, lo que reduce proporcionalmente el coste de cómputo del modelo aguas abajo sobre ese tipo de texto.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Fertilidad PubMed | Fertilidad wikitext | Cobertura token único | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| medical-bpe-16k | 16.000 | 1,375 | 1,577 | 2/20 | MIT | HuggingFace (`salmanhadli/medical-bpe-16k`) |
| cl100k_base (GPT-4) | 100.000 | 1,460 | 1,173 | 0/20 | no disponible en la información proporcionada | vía `tiktoken` |
| o200k_base (GPT-4o) | 200.000 | 1,430 | 1,163 | 0/20 | no disponible en la información proporcionada | vía `tiktoken` |
| general-bpe (control) | 16.000 | 1,747 | 1,208 | 0/20 | no disponible en la información proporcionada | control interno del autor, no publicado como recurso independiente |

El control `general-bpe` es el más relevante para la comparación técnica, porque comparte algoritmo y tamaño de vocabulario y solo cambia el corpus. No se han publicado en la información disponible comparaciones frente a tokenizadores biomédicos de referencia como los de la familia PubMedBERT o SciBERT.

## Limitaciones y advertencias

- Rendimiento inferior en inglés general: 1,577 de fertilidad frente a 1,163 de `o200k_base`, un 35,6 % más de tokens en prosa ordinaria. No es un sustituto de propósito general.
- No contiene conocimiento médico: es un tokenizador sin pesos. No genera texto, no razona y no hace afirmaciones clínicas.
- Sesgos heredados del corpus: cualquier modelo entrenado con él hereda los sesgos presentes en los abstracts de PubMed. Un corpus de literatura no es una población de pacientes.
- Cobertura léxica limitada al registro de los abstracts: la taquigrafía clínica, los nombres comerciales de fármacos posteriores al corpus y el texto no inglés se fragmentarán más de lo que reflejan las métricas publicadas.
- Ausencia de `unk_token`: no hay pérdida de información en el round-trip, pero una entrada fuera de dominio puede generar secuencias inusualmente largas en lugar de fallar de forma explícita.
- Idiomas: el entrenamiento es solo en inglés. Aunque la cobertura byte-level permite procesar cualquier UTF-8, el rendimiento en otras lenguas no está medido y se espera peor que el de tokenizadores multilingües.
- Falta de validación externa: el recurso acumula 0 descargas y 0 likes en el momento de la consulta, y las cifras proceden únicamente de la evaluación del propio autor.
- Comparativa incompleta: no hay datos frente a tokenizadores biomédicos consolidados, ni mediciones de velocidad, ni evaluación en notas clínicas reales.
- Licencia: MIT, sin restricciones documentadas para uso comercial, pero conviene verificar la licencia del corpus de origen y de los datos derivados que se generen.
- Fecha de publicación registrada: 17 de septiembre de 2026 (última actualización el mismo día), según los metadatos de HuggingFace.

## Enlaces

- HuggingFace: https://huggingface.co/salmanhadli/medical-bpe-16k
- Dataset de entrenamiento: https://huggingface.co/datasets/slinusc/PubMedAbstractsSubset
- Repositorio de entrenamiento y comparación: https://github.com/sourangshupal/tokenization-explainer
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este tokenizador; los resultados obtenidos correspondían a páginas de soporte de Microsoft y no guardan relación con el recurso.
