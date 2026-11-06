# mattwang123/chrononauts-3b-2013-05-agent

## Resumen

Chrononauts 3B, cutoff 2013-05, stage agent es un modelo de lenguaje de 2.796 millones de parametros desarrollado por mattwang123 (con vinculacion declarada a Johns Hopkins University y Apple) dentro de la suite Chrononauts, un conjunto de agentes de busqueda congelados en el tiempo. Cada variante se entrena exclusivamente con datos disponibles hasta su fecha de corte: en este caso, mayo de 2013. El modelo no ha visto informacion posterior a esa fecha, ni en preentrenamiento (TiC-LM), ni en post-entrenamiento, ni en el corpus de recuperacion que consulta durante la inferencia.

Este repositorio concreto es la etapa final del pipeline para el corte 2013-05: parte del modelo `-sft` del mismo corte y se entrena adicionalmente con GRPO (reinforcement learning con recompensas verificables) usando busqueda en vivo, con credito a nivel de span para la respuesta, la etiqueta de evidencia, el ano de la pregunta y la recuperacion. El resultado es un agente que alterna razonamiento y consultas a un corpus congelado, y que debe declarar explicitamente cuando una pregunta no es respondible con la evidencia disponible.

La relevancia es metodologica: la suite permite estudiar como se comporta un agente de busqueda cuando su conocimiento y su corpus estan alineados temporalmente, evaluando no solo acierto sino tambien calibracion temporal (etiquetas `[FORECASTING]` o `[INSUFFICIENT]` ante eventos posteriores al corte). La arquitectura es OpenLM (TiC-LM) con LayerNorm y QK-norm, contexto util de hasta 8.192 tokens y pesos en safetensors bajo licencia "other".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OpenLM / TiC-LM) con LayerNorm y QK-norm (`modeling_open_lm_hf.py`) |
| Parametros totales | 2.796.096.000 (2,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | other |
| Formato de pesos | safetensors (repo de 5,6 GB), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo OpenLM (denominado TiC-LM en la suite), con LayerNorm y QK-norm implementados en codigo remoto (`modeling_open_lm_hf.py`), y RoPE con base 48.000, lo que fija el contexto util en 8.192 tokens. El preentrenamiento se realizo sobre TiC-LM, un corpus congelado en mayo de 2013. Todo el post-entrenamiento (SFT y RL) uso exclusivamente texto construido a partir de snapshots anteriores al corte, filtrado con tres controles: ausencia de anos posteriores al corte y un juez LLM de fuga con comprobacion de hechos plantados (al menos 36 de 40 hechos post-corte detectados). Los conjuntos de entrenamiento y evaluacion no se solapan.

La etapa `agent` parte del modelo `-sft` del mismo corte y aplica GRPO con busqueda en vivo contra el corpus congelado. La recompensa se descompone a nivel de span: respuesta, etiqueta de evidencia, ano de la pregunta y calidad de la recuperacion. El formato de episodio es multi-turno: el prompt indica la fecha actual ("Assume today is YYYY-MM-DD.") y la pregunta; el modelo alterna bloques `<think> ... </think>` y `<search> query </search>`, recibe resultados en `<information> ... </information>`, declara el ano de la pregunta en el primer turno de pensamiento y, en el turno final, indica el ano mas reciente cubierto por la evidencia junto con una etiqueta (`[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]`, `[FORECASTING]`) antes de emitir `<answer> ... </answer>`. La evaluacion uso como maximo 8 turnos, T=0,8 y top-p 0,95.

## Capacidades

- Generacion de texto y razonamiento multi-hop con busqueda iterativa sobre un corpus congelado.
- Agente de busqueda con formato propio: turnos de pensamiento (`<think>`), consultas (`<search>`) y lectura de resultados (`<information>`).
- Etiquetado de evidencia explicito: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` (evento aun no cognoscible en la fecha de corte).
- Razonamiento multi-paso con hasta 8 turnos de busqueda en evaluacion.
- Declaracion del ano de la pregunta y del ano mas reciente cubierto por la evidencia.
- Capacidad de abstenerse ante preguntas sobre eventos posteriores a mayo de 2013.
- Solo ingles; no se documentan capacidades de vision, audio, tool calling generico ni function calling fuera del protocolo de busqueda descrito.

## Casos de uso

- Investigacion sobre calibracion temporal: evaluar si un agente de busqueda distingue entre "no encontrado" y "no cognoscible en la fecha", usando las etiquetas `[INSUFFICIENT]` y `[FORECASTING]` como senal medible.
- Estudios de contaminacion de datos (data leakage): servir como linea base con corte conocido para comparar con modelos entrenados con datos posteriores y medir el efecto de la fuga temporal en benchmarks.
- Simulacion de asistentes historicos: construir demos que respondan preguntas "como en mayo de 2013", consultando unicamente Wikipedia y CC-News anteriores al corte.
- Evaluacion de pipelines RAG: el modelo esta disenado contra un indice faiss concreto (BAAI/bge-base-en-v1.5, OPQ64,IVF32768,PQ64, rerank exacto de 400 candidatos, top-5, maximo 2 pasajes por articulo, 4.000 caracteres por turno), lo que permite testear recuperadores alternativos manteniendo el generador fijo.
- Analisis de razonamiento multi-hop: el formato de turnos `<think>`/`<search>` facilita trazar la cadena de evidencia y auditar en que paso se pierde la respuesta correcta.
- Docencia y divulgacion sobre IA: ilustrar de forma reproducible que un modelo solo sabe lo que estaba disponible en su fecha de corte, con un caso controlado y verificable.
- Benchmarking de RL con recompensas verificables: replicar el esquema GRPO con credito a nivel de span en dominios donde la recompensa depende de la evidencia recuperada.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de test multi-hop retenido (splits oficiales, T=0,8):

| Metrica | Valor |
|---|---|
| Exactitud global | 24,6 |
| Exactitud en items anteriores al corte | 28,5 |
| Exactitud en items posteriores al corte | 10,3 |
| Items post-corte etiquetados como insuficiente / no cognoscible | 24,3 % |
| Items pre-corte etiquetados como insuficiente / no cognoscible | 5,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor senala que la baja exactitud y la frecuencia elevada de etiquetas "no cognoscible" tras el corte son el comportamiento previsto, no un fallo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 7 y 9 GB para contextos moderados.
- En cuantizacion de 8 bits, los pesos ocuparian del orden de 2,8 GB; en 4 bits, alrededor de 1,4 GB. No se documentan cuantizaciones oficiales publicadas.
- Cabe en GPU de consumo: RTX 3090, RTX 4090, RTX 4080 y, con cuantizacion, tarjetas de 8 GB. No se especifican GPU de datacenter recomendadas.
- Despliegue: la model card solo documenta `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el codigo remoto (`modeling_open_lm_hf.py`) puede requerir adaptaciones en esos motores.
- El pipeline completo necesita ademas un indice faiss en CPU (OPQ64,IVF32768,PQ64) y el modelo de embeddings BAAI/bge-base-en-v1.5.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2013-05 agent | 2,8 B | 8.192 | Agente de busqueda congelado en el tiempo (2013-05) | other | HuggingFace, repo propio |
| Chrononauts 3B 2013-05 sft | 2,8 B | 8.192 | Misma base, solo SFT, sin RL con busqueda | other | HuggingFace, repo hermano |
| Chrononauts 3B 2024-07 agent | 2,8 B (segun suite) | 8.192 (segun suite) | Mismo diseno con corte 2024-07 | other | HuggingFace, repo hermano |
| Modelos de 3 B de proposito general | ~3 B | variable | Generacion de texto sin restriccion temporal | variable | no disponible como comparacion directa |

No se dispone de datos de benchmarks comparativos con modelos de proposito general de tamano similar en la informacion proporcionada; la comparacion relevante es interna a la propia suite Chrononauts, donde cambia la fecha de corte pero no el diseno.

## Limitaciones y advertencias

- Conocimiento deliberadamente limitado a mayo de 2013: cualquier pregunta sobre eventos posteriores debe recibir `[FORECASTING]` o `[INSUFFICIENT]`; usarlo como asistente general producira respuestas incompletas.
- Exactitud global baja (24,6) en el test multi-hop; no es adecuado para produccion orientada a precision sin un componente adicional de verificacion.
- Solo ingles; no hay soporte multilingue documentado.
- Licencia "other": no se detallan condiciones de uso comercial en la informacion disponible; es imprescindible revisar los terminos del repositorio antes de cualquier despliegue comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; auditar `modeling_open_lm_hf.py` antes de usarlo en entornos sensibles.
- Dependencia fuerte de un corpus e indice concretos (Wikipedia reconstruida por revision, CC-News anteriores al corte, embeddings bge-base-en-v1.5, faiss con parametros especificos): cambiar el recuperador puede degradar el comportamiento del agente.
- Riesgo de alucinacion dentro del periodo cubierto: el modelo puede generar afirmaciones no respaldadas por los pasajes recuperados, aunque el formato de etiquetas de evidencia facilita detectarlo.
- Sesgos: no se documentan analisis de sesgo; al entrenarse sobre Wikipedia y CC-News hasta 2013, hereda los sesgos de cobertura y representacion de esas fuentes en esa fecha.
- Sin descargas ni likes en el momento de la consulta y paper aun en preparacion: ecosistema de validacion externa muy limitado.
- Los controles de fuga descritos (juez LLM con 36/40 hechos plantados detectados) no garantizan ausencia total de contaminacion temporal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mattwang123/chrononauts-3b-2013-05-agent
- Repo hermano (init): https://huggingface.co/mattwang123/chrononauts-3b-2013-05-init
- Repo hermano (sft): https://huggingface.co/mattwang123/chrononauts-3b-2013-05-sft
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparacion (Chrononauts, Johns Hopkins University y Apple); sin URL disponible.
