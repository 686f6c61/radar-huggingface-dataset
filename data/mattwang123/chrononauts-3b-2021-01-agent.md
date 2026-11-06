# mattwang123/chrononauts-3b-2021-01-agent

## Resumen

Chrononauts 3B, cutoff 2021-01, stage agent es un modelo de lenguaje de 2.796 millones de parametros desarrollado por mattwang123 (con vinculacion academica a Johns Hopkins University y Apple segun la model card) dentro de la suite Chrononauts. Esta suite entrena agentes de busqueda congelados en siete fechas distintas (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07), de modo que tanto los datos de preentrenamiento como los de post-entrenamiento y el corpus de recuperacion se detienen en la fecha de corte. El modelo no ha visto nunca informacion posterior a enero de 2021.

Este repositorio concreto es la etapa final "agent" del corte 2021-01: parte del modelo `-sft` del mismo corte y se entrena adicionalmente con GRPO (reinforcement learning) usando busqueda en vivo, con credito a nivel de span para la respuesta, la etiqueta de evidencia, el ano de la pregunta y la recuperacion. El modelo esta disenado para alternar turnos de razonamiento (`<think>`) y de busqueda (`<search>`) sobre un corpus temporal bloqueado, devolviendo una respuesta final con etiqueta de evidencia.

Su relevancia es metodologica: permite estudiar el comportamiento de agentes de busqueda cuando el conocimiento y la evidencia estan estrictamente acotados a una fecha, incluyendo la capacidad de declarar explicitamente que un evento "aun no es conocible" ([FORECASTING]). La licencia es "other" y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OpenLM / TiC-LM) con LayerNorm y QK-norm (`modeling_open_lm_hf.py`) |
| Parametros totales | 2.796.096.000 (~2,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | ingles (en) |
| Licencia | other |
| Formato de pesos | safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo OpenLM (TiC-LM) con 2,8 B de parametros, que requiere `trust_remote_code=True` porque emplea LayerNorm con QK-norm implementado en `modeling_open_lm_hf.py`. La ventana de contexto practica es de hasta 8.192 tokens y la base RoPE es 48.000.

El entrenamiento sigue tres etapas encadenadas: preentrenamiento sobre TiC-LM (datos detenidos en el corte), post-entrenamiento supervisado (SFT) y, para esta etapa agent, GRPO con busqueda en vivo. El refuerzo asigna credito a nivel de span a cuatro componentes: la respuesta, la etiqueta de evidencia, el ano de la pregunta y la recuperacion. Todo el texto de post-entrenamiento paso tres filtros de control de fuga: construccion solo con instantaneas previas al corte, ausencia de anos posteriores al corte y un juez LLM de fuga con comprobacion de hechos plantados (al menos 36 de 40 hechos post-corte plantados detectados). Los conjuntos de entrenamiento y evaluacion no se solapan. El corpus de recuperacion se construye con Wikipedia en ingles reconstruida por corte (ultima revision de cada pagina en o antes del corte) mas lotes de CC-News rastreados antes del corte, embebidos con `BAAI/bge-base-en-v1.5` e indexados con faiss en CPU (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos; top-5, maximo 2 pasajes por articulo, 4.000 caracteres por turno).

## Capacidades

- Generacion de texto y razonamiento multi-hop en ingles.
- Busqueda iterativa en un corpus temporal bloqueado mediante el formato `<search> query </search>`.
- Razonamiento explicito en turnos `<think> ... </think>` antes de cada busqueda.
- Lectura de resultados de recuperacion en bloques `<information> ... </information>`.
- Etiquetado de evidencia: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` (no conocible aun).
- Declaracion del ano de la pregunta en el primer turno de pensamiento y del ano mas reciente cubierto por la evidencia en el turno final.
- Respuesta final estructurada en `<answer> ... </answer>`.
- Conciencia temporal: el prompt declara la fecha actual ("Assume today is YYYY-MM-DD.").
- No dispone de vision, audio ni capacidades multimodales.

## Casos de uso

- Investigacion sobre agentes de busqueda con conocimiento acotado: permite estudiar como un agente decide buscar, cuando declara evidencia insuficiente y como etiqueta eventos no conocibles, usando el corpus congelado del corte.
- Evaluacion de fuga temporal (temporal leakage): sirve como referencia para medir si otros modelos "saben" eventos posteriores a 2021-01 comparando sus respuestas con las de este agente.
- Analisis de calibracion y abstenccion: el modelo esta entrenado para emitir `[INSUFFICIENT]` o `[FORECASTING]`; se puede usar para estudiar la fiabilidad de etiquetas de evidencia en tareas de QA multi-hop.
- Simulacion de asistentes historicos: escenarios donde se requiere responder como si la fecha actual fuese anterior a 2021, con busqueda restringida a fuentes de la epoca.
- Benchmarking de pipelines RAG: el formato de turnos y el protocolo de recuperacion (top-5, 4.000 caracteres por turno, maximo 8 turnos) permiten reproducir experimentos de retrieval-augmented generation con parametros controlados.
- Estudio de RL para agentes: el entrenamiento GRPO con credito a nivel de span sobre respuesta, evidencia, ano y recuperacion es un caso concreto para analizar el efecto del refuerzo en el comportamiento de busqueda.
- Docencia y divulgacion: ejemplo reproducible de como se construye un corpus temporal y se entrena un agente que respeta un corte de conocimiento.

## Benchmarks y rendimiento

Evaluacion en el conjunto de test multi-hop heldout con splits oficiales y T=0,8:

| Metrica | Valor |
|---|---|
| Precision global | 33,2 |
| Precision en items anteriores al corte | 36,4 |
| Precision en items posteriores al corte | 9,4 |
| Items post-corte etiquetados como insuficiente / no conocible | 29,7 % |
| Items pre-corte etiquetados como insuficiente / no conocible | 2,4 % |

No se han publicado mas resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card senala que la baja precision y la frecuencia elevada de etiquetas "not knowable yet" tras el corte son el comportamiento previsto.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 8 y 12 GB para contextos moderados.
- En cuantizacion de 8 bits: alrededor de 3 GB de pesos; en 4 bits, alrededor de 1,5-2 GB, aunque no se documentan artefactos GGUF oficiales y habria que generarlos.
- GPU recomendadas: A100, H100 o L40S para despliegue con contextos largos (hasta 8.192 tokens); RTX 4090, RTX 3090 o RTX 4080 para inferencia en bfloat16 con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y tarjetas con 12 GB o mas en bfloat16; en 8 GB solo con cuantizacion.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por la QK-norm); vLLM, TGI y llama.cpp no estan documentados para esta arquitectura y requeririan adaptacion del codigo de modelado.
- Ademas del modelo, el pipeline necesita el indice faiss en CPU (OPQ64, IVF32768, PQ64) y el modelo de embeddings `BAAI/bge-base-en-v1.5`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2021-01 agent | 2,8 B | 8.192 | Agente de busqueda con corte temporal y RL (GRPO) | other | HuggingFace |
| Chrononauts 3B 2021-01 sft | 2,8 B | 8.192 | Misma base, solo SFT sin RL con busqueda | other | HuggingFace |
| Chrononauts 3B 2021-01 init | 2,8 B | 8.192 | Misma base, solo preentrenamiento con corte | other | HuggingFace |

No se dispone de datos de rendimiento de modelos externos comparables en la informacion proporcionada; la comparativa se limita a las etapas hermanas de la propia suite, para las que tampoco se publican metricas desagregadas en esta ficha.

## Limitaciones y advertencias

- Precision baja: 33,2 de precision global en el test multi-hop heldout; no es adecuado como sistema de QA de produccion sin supervision.
- Conocimiento estrictamente limitado a enero de 2021: cualquier pregunta sobre eventos posteriores producira respuestas incompletas o etiquetas de no conocible.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo de modelado del autor; conviene auditar `modeling_open_lm_hf.py` antes de desplegar.
- Dependencia del corpus: el comportamiento del agente esta ligado al indice faiss y al corpus congelado descritos; usar otro corpus altera los resultados y puede romper el formato esperado.
- Licencia "other": no se detallan los terminos de uso comercial; es necesario contactar con el autor o revisar el repositorio antes de un uso productivo.
- Riesgo de alucinacion: aunque el entrenamiento con etiquetas de evidencia busca reducirla, un modelo de 2,8 B puede generar afirmaciones no respaldadas por los pasajes recuperados.
- Sesgos: no se documentan analisis de sesgo; el corpus (Wikipedia y CC-News hasta 2021) arrastra los sesgos de esas fuentes.
- Sin datos publicos de latencia, throughput ni consumo energetico.
- El articulo (paper) esta en preparacion; la informacion metodologica disponible es la de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattwang123/chrononauts-3b-2021-01-agent
- Repo hermano init: https://huggingface.co/mattwang123/chrononauts-3b-2021-01-init
- Repo hermano sft: https://huggingface.co/mattwang123/chrononauts-3b-2021-01-sft
- Modelo de embeddings usado en el corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparacion (Chrononauts, Johns Hopkins University y Apple); no disponible enlace
