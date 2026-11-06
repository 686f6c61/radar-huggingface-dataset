# mattwang123/chrononauts-3b-2019-01-agent

## Resumen

Chrononauts 3B, cutoff 2019-01, etapa agent es un modelo de lenguaje de 2.796.096.000 parametros desarrollado por mattwang123 (con vinculacion a Johns Hopkins University y Apple segun la model card) dentro de la familia Chrononauts, un conjunto de agentes de busqueda "congelados" en siete fechas distintas (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07). La particularidad del diseno es que tanto los datos de preentrenamiento (TiC-LM), como los de post-entrenamiento y el corpus de recuperacion se detienen en la fecha de corte, de modo que el modelo nunca ha visto informacion posterior a enero de 2019.

Este repositorio concreto corresponde a la etapa final de la cadena de entrenamiento para el corte 2019-01: parte del modelo `-sft` del mismo corte y se entrena adicionalmente con aprendizaje por refuerzo GRPO con busqueda en vivo, incorporando credito a nivel de span para la respuesta, la etiqueta de evidencia, el ano de la pregunta y la recuperacion. El resultado es un agente que alterna razonamiento interno y consultas a un corpus temporal bloqueado, y que debe declarar explicitamente cuando una pregunta cae fuera de su horizonte de conocimiento.

La relevancia del modelo es metodologica: sirve como banco de pruebas controlado para estudiar alucinacion temporal, calibracion epistemica y comportamiento de agentes de busqueda cuando el conocimiento esta deliberadamente acotado. No es un modelo de proposito general para produccion, sino una herramienta de investigacion sobre como los modelos razonan acerca de lo que saben y lo que no pueden saber.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OpenLM / TiC-LM) con LayerNorm y QK-norm; requiere `trust_remote_code=True` |
| Parametros totales | 2.796.096.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card solo muestra carga en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | other (licencia personalizada; consultar terminos en el repositorio) |
| Formato de pesos | safetensors |
| Pipeline | text-generation |
| Tamano del repositorio | 5,6 GB |
| Fecha de corte de conocimiento | 2019-01 |
| Etapa | agent (post-entrenamiento con GRPO y busqueda en vivo) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 2,8 mil millones de parametros construido sobre la pila OpenLM (TiC-LM), con una implementacion especifica que emplea LayerNorm con QK-norm en `modeling_open_lm_hf.py`, motivo por el cual es imprescindible cargarlo con `trust_remote_code=True`. El contexto maximo de trabajo es de 8.192 tokens con una base RoPE de 48.000, lo que permite episodios de agente relativamente largos con multiples turnos de razonamiento y recuperacion.

El entrenamiento sigue una cadena de tres etapas por cada fecha de corte: un modelo `-init` preentrenado sobre TiC-LM con datos detenidos en la fecha, un modelo `-sft` afinado sobre datos de post-entrenamiento igualmente filtrados, y este modelo `-agent`, que parte del `-sft` y se optimiza con GRPO (Group Relative Policy Optimization) usando busqueda en vivo. La recompensa se descompone a nivel de span y cubre cuatro aspectos: la respuesta, la etiqueta de evidencia, el ano de la pregunta y la calidad de la recuperacion. Todo el texto de post-entrenamiento paso tres filtros de control de fuga: construccion exclusiva a partir de snapshots anteriores al corte, ausencia de anos posteriores al corte y un juez LLM de fuga con verificacion de hechos plantados (al menos 36 de 40 hechos post-corte plantados fueron detectados). Los conjuntos de entrenamiento y evaluacion no se solapan.

El agente opera contra un corpus congelado en su propio corte: Wikipedia en ingles reconstruida por corte a partir del historial completo de revisiones (ultima revision de cada pagina en o antes del corte) mas lotes de CC-News rastreados antes del corte, embebidos con `BAAI/bge-base-en-v1.5` e indexados con faiss en CPU (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos; top-5, como maximo 2 pasajes por articulo, 4.000 caracteres por turno).

## Capacidades

- Generacion de texto en ingles con razonamiento interno explicito dentro de etiquetas `<think> ... </think>`.
- Busqueda agentica en un corpus temporal bloqueado mediante consultas `<search> query </search>`, con resultados devueltos en `<information> ... </information>`.
- Razonamiento multi-turno y multi-paso: la evaluacion oficial permite hasta 8 turnos de alternancia entre pensamiento y busqueda.
- Etiquetado de evidencia: el modelo clasifica cada respuesta con una de cuatro etiquetas (`[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]`, `[FORECASTING]`), incluyendo la deteccion de eventos no cognoscibles en su horizonte temporal.
- Conciencia temporal: el primer turno de pensamiento declara el ano al que se refiere la pregunta y el turno final declara el ultimo ano cubierto por la evidencia.
- Formato de episodio con fecha simulada: el prompt incluye "Assume today is YYYY-MM-DD."
- Capacidades multilingues: limitadas al ingles.
- No se documentan capacidades de vision, audio, tool calling generico ni function calling fuera del protocolo de busqueda propio.

## Casos de uso

- Investigacion sobre alucinacion temporal: el modelo permite medir experimentalmente como un LLM etiqueta como "no cognoscible" aquello que cae fuera de su corte, comparando la tasa de `[INSUFFICIENT]`/`[FORECASTING]` en items post-corte (26,2%) frente a items pre-corte (3,4%).
- Evaluacion de calibracion epistemica en agentes: sirve para estudiar si un agente de busqueda declara correctamente los limites de su evidencia, usando las cuatro etiquetas como senal supervisada.
- Banco de pruebas de recuperacion aumentada con restriccion temporal: al fijar el corpus a Wikipedia y CC-News anteriores a 2019-01, se pueden aislar efectos de la calidad de recuperacion sin contaminacion por conocimiento parametrico posterior.
- Estudio de entrenamiento con RL para agentes: al ser la etapa final de una cadena init -> sft -> agent con GRPO, permite analizar el efecto del refuerzo con credito a nivel de span sobre el comportamiento de busqueda.
- Analisis de control de fuga en pipelines de datos: los tres filtros documentados y el juez LLM con hechos plantados sirven como referencia metodologica replicable en otros proyectos de modelos con corte temporal.
- Experimentos de razonamiento multi-salto con evidencia verificable: el formato exige citar el ultimo ano cubierto por la evidencia, lo que facilita la evaluacion automatica de la cadena de razonamiento.
- Docencia y divulgacion sobre limites del conocimiento en LLM: el comportamiento "congelado" hace tangible la diferencia entre conocimiento parametrico y evidencia recuperada.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al conjunto de test multi-salto retenido, splits oficiales, con T=0,8:

| Metrica | Valor |
|---|---|
| Precision global | 34,0 |
| Precision en items anteriores al corte | 37,5 |
| Precision en items posteriores al corte | 9,0 |
| Items post-corte etiquetados como insuficientes / no cognoscibles | 26,2% |
| Items pre-corte etiquetados como insuficientes / no cognoscibles | 3,4% |

La model card senala que la baja precision y la frecuencia elevada de etiquetas "no cognoscible todavia" despues del corte son el comportamiento previsto, no un fallo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 8-10 GB para contextos cortos.
- En cuantizacion de 8 bits: alrededor de 3 GB de pesos; en 4 bits, alrededor de 1,5-2 GB, aunque no se documentan recetas oficiales de cuantizacion para este modelo.
- GPU recomendadas: A100 o H100 para evaluacion a escala con lotes grandes; RTX 4090, RTX 3090 o RTX A6000 para inferencia individual en bfloat16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bfloat16 para contextos moderados; previsiblemente en 6-8 GB con cuantizacion, aunque no verificado en la informacion disponible.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"` es la via documentada; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y la arquitectura personalizada (QK-norm en `modeling_open_lm_hf.py`) hace probable que estos motores requieran adaptaciones.
- El indice faiss de recuperacion se ejecuta en CPU (OPQ64, IVF32768, PQ64), por lo que se necesita RAM suficiente para el indice y el corpus, ademas de un modelo de embeddings (`BAAI/bge-base-en-v1.5`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos con corte temporal en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales frente a alternativas genericas de tamano similar:

| Modelo | Parametros | Contexto | Corte temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2019-01 agent | 2,80 B | 8.192 | 2019-01 (fijo) | other | Hugging Face, 0 descargas |
| Chrononauts 3B 2019-01 sft | 2,80 B (presumible) | no disponible | 2019-01 (fijo) | other | Hugging Face (repo hermano) |
| Chrononauts 3B 2019-01 init | 2,80 B (presumible) | no disponible | 2019-01 (fijo) | other | Hugging Face (repo hermano) |
| Otros agentes de busqueda de ~3 B | no disponible | no disponible | sin restriccion | variable | no disponible |

No se identifican en la informacion disponible modelos de terceros directamente comparables en la combinacion de tamano, arquitectura y restriccion temporal.

## Limitaciones y advertencias

- El conocimiento esta deliberadamente congelado en 2019-01: cualquier pregunta sobre eventos posteriores producira respuestas de baja calidad o etiquetas de no cognoscibilidad, lo cual es el comportamiento esperado y no un defecto.
- Precision global baja (34,0 en el test multi-salto oficial), insuficiente para uso en produccion como sistema de respuesta.
- Riesgo de alucinacion dentro del propio horizonte temporal: el modelo puede generar afirmaciones no respaldadas por la evidencia recuperada, aunque el formato de etiquetas pretende mitigarlo.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse sobre Wikipedia y CC-News en ingles hasta 2019, hereda los sesgos de esas fuentes y de esa ventana temporal.
- Limitacion idiomatica: solo ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- Restricciones de licencia: la licencia es "other" y no se detallan los terminos; es imprescindible revisar el texto completo en el repositorio antes de cualquier uso comercial.
- Dependencia de codigo remoto: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar `modeling_open_lm_hf.py` antes de desplegar.
- Dependencia del corpus: el rendimiento depende criticamente de usar el corpus congelado correspondiente (Wikipedia pre-2019-01 mas CC-News pre-2019-01) con el indice faiss y el modelo de embeddings especificados; usar otro corpus invalida el comportamiento entrenado.
- Configuracion de evaluacion especifica (hasta 8 turnos, T=0,8, top-p 0,95); desviarse de ella puede alterar los resultados.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente por la comunidad.
- La model card indica que el paper esta en preparacion, por lo que no hay publicacion revisada por pares que respalde los resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mattwang123/chrononauts-3b-2019-01-agent
- Repo hermano etapa init: https://huggingface.co/mattwang123/chrononauts-3b-2019-01-init
- Repo hermano etapa sft: https://huggingface.co/mattwang123/chrononauts-3b-2019-01-sft
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparacion (Chrononauts, Johns Hopkins University y Apple); no disponible enlace en la informacion proporcionada.
