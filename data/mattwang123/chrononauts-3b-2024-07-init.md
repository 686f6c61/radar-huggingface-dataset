# mattwang123/chrononauts-3b-2024-07-init

## Resumen

Chrononauts 3B (cutoff 2024-07, etapa *init*) es un modelo de lenguaje de 2.796.096.000 parametros desarrollado por mattwang123 en el marco del proyecto Chrononauts, una colaboracion entre Johns Hopkins University y Apple. Forma parte de una suite de agentes de busqueda "congelados" en siete fechas distintas (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07): para cada fecha, los datos de preentrenamiento (TiC-LM), los datos de post-entrenamiento y el corpus de recuperacion se detienen en ese momento, de modo que el modelo nunca ha visto informacion posterior. Este repositorio concreto corresponde a la etapa inicial de la variante 2024-07.

El modelo parte de TiC-LM 3B, una base de arquitectura OpenLM, y se ha sometido a un preentrenamiento continuado para extender el contexto de 2.000 a 8.192 tokens, seguido de un SFT de recuperacion lejana y un re-SFT de instrucciones filtrado con un juez de fugas. No esta entrenado como agente: es la base sobre la que se construyen las variantes `-sft` y `-agent`.

Su relevancia es metodologica: permite estudiar el comportamiento de un modelo y de un agente de busqueda sin contaminacion por conocimiento futuro, con controles de fuga explicitos y un corpus de recuperacion reconstruido a partir del historial de revisiones de Wikipedia y de lotes de CC-News anteriores a la fecha de corte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OpenLM / TiC-LM) con LayerNorm y QK-norm |
| Parametros totales | 2.796.096.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OpenLM, concretamente TiC-LM 3B, con una implementacion que requiere `trust_remote_code=True` porque emplea LayerNorm con QK-norm en `modeling_open_lm_hf.py`. El contexto original de 2.000 tokens se amplio a 8.192 mediante preentrenamiento continuado sobre datos anteriores a la fecha de corte, con una base RoPE de 48.000.

Sobre esa base se aplico un SFT de recuperacion lejana (*far-retrieval SFT*) y un re-SFT de instrucciones supervisado por un juez de fugas basado en LLM. Todo el texto de post-entrenamiento paso tres filtros: construccion unicamente a partir de instantaneas previas al corte, ausencia de anos posteriores al corte y validacion con el juez de fugas, que incluye una prueba de hechos plantados con al menos 36 de 40 hechos post-corte detectados. Los conjuntos de entrenamiento y evaluacion no se solapan.

El corpus de recuperacion asociado se reconstruye por fecha: Wikipedia en ingles con la ultima revision de cada pagina anterior o igual al corte, mas lotes de CC-News rastreados antes del corte, embebidos con `BAAI/bge-base-en-v1.5` e indexados con faiss en CPU (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos, top-5, maximo 2 pasajes por articulo, 4.000 caracteres por turno).

## Capacidades

- Generacion de texto y extraccion de caracteristicas (`feature-extraction` segun los tags del repositorio).
- Razonamiento con formato de agente: alterna bloques `<think> ... </think>` y `<search> query </search>`, con resultados devueltos en `<information> ... </information>`.
- Etiquetado de evidencia en la respuesta final: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` (no conocible aun en la fecha del modelo).
- Declaracion explicita del ano de la pregunta en el primer turno de pensamiento y del ultimo ano cubierto por la evidencia en el turno final.
- Busqueda aumentada por recuperacion sobre un corpus congelado en la fecha de corte.
- Capacidad multilingue limitada al ingles.
- No esta entrenado como agente autonomo; la capacidad de agente se desarrolla en la variante `-agent`.

## Casos de uso

- Evaluacion de contaminacion temporal: sirve como referencia para medir cuanto conocimiento posterior a una fecha filtra un modelo o un pipeline de recuperacion, gracias a su corpus y datos estrictamente anteriores al corte.
- Investigacion sobre agentes de busqueda: permite reproducir episodios completos con el formato `<think>`/`<search>`/`<information>`/`<answer>` y estudiar estrategias de consulta y de sintesis de evidencia.
- Preguntas con restriccion temporal: util para responder consultas indicando explicitamente el ano de la pregunta y el ultimo ano cubierto por la evidencia, lo que facilita la trazabilidad.
- Deteccion de preguntas no respondibles en una fecha: la etiqueta `[FORECASTING]` permite separar preguntas cuyo resultado aun no era conocible, util en analisis retrospectivos.
- Benchmarking de recuperacion: el corpus congelado con bge-base-en-v1.5 y el indice faiss (top-5, 2 pasajes por articulo, 4.000 caracteres por turno) permiten comparar configuraciones de recuperacion de forma controlada.
- Estudio de sesgos y evolucion del conocimiento: al disponer de siete fechas de corte, se pueden comparar respuestas del mismo modelo base en distintos momentos sin reentrenar desde cero.
- Base para ajuste posterior: al ser la etapa `init`, es el punto de partida para reproducir las variantes `-sft` y `-agent` con datos anteriores al corte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos, mas memoria para el contexto de hasta 8.192 tokens y la cache KV; en la practica se recomienda reservar del orden de 8-10 GB en bf16.
- Cuantizacion: no se documentan tipos de cuantizacion soportados; el repo solo distribuye safetensors.
- GPU recomendadas: no disponible. Por tamano, el modelo es apto para GPU de consumo con suficiente VRAM, aunque no se han publicado mediciones.
- Despliegue: la model card solo documenta uso con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) y `trust_remote_code=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Nota: el codigo remoto (`modeling_open_lm_hf.py`) debe auditarse antes de usarlo en produccion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, la propia suite Chrononauts incluye las variantes `mattwang123/chrononauts-3b-2024-07-sft` y `mattwang123/chrononauts-3b-2024-07-agent`, que comparten base y fecha de corte pero anaden etapas de post-entrenamiento.

| Modelo | Parametros | Contexto | Etapa | Licencia |
|---|---|---|---|---|
| chrononauts-3b-2024-07-init | 2,80 B | 8.192 | init | other |
| chrononauts-3b-2024-07-sft | no disponible | no disponible | sft | other |
| chrononauts-3b-2024-07-agent | no disponible | no disponible | agent | other |

## Limitaciones y advertencias

- Conocimiento deliberadamente limitado a antes de 2024-07: cualquier pregunta sobre hechos posteriores no puede responderse y debe marcarse como `[FORECASTING]` o `[INSUFFICIENT]`.
- No esta entrenado como agente; el formato de agente descrito en la model card corresponde a la variante `-agent`.
- Solo soporta ingles.
- Licencia `other`: es necesario revisar los terminos exactos antes de cualquier uso comercial; no se detallan en la informacion disponible.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar `modeling_open_lm_hf.py`.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el etiquetado de evidencia ayuda a mitigarlo, pero no lo elimina.
- Sesgos conocidos: no disponible.
- El repositorio tiene 0 descargas y 1 like, y la fecha de creacion indicada (2026-11-06) es posterior a la fecha de corte del modelo; conviene verificar la procedencia y el estado del proyecto.
- El paper esta en preparacion; no hay resultados de evaluacion publicados que permitan validar el rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/mattwang123/chrononauts-3b-2024-07-init
- Variante SFT: https://huggingface.co/mattwang123/chrononauts-3b-2024-07-sft
- Variante agente: https://huggingface.co/mattwang123/chrononauts-3b-2024-07-agent
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparacion (Chrononauts, Johns Hopkins University y Apple); no disponible enlace.
