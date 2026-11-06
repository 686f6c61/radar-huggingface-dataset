# mattwang123/chrononauts-3b-2023-01-init

## Resumen

Chrononauts 3B es un modelo de lenguaje de 2.796 millones de parametros desarrollado en el marco del proyecto Chrononauts (Johns Hopkins University y Apple, segun la model card) cuyo objetivo es construir agentes de busqueda "congelados en el tiempo": el preentrenamiento, el post-entrenamiento y el corpus de recuperacion se detienen en una fecha concreta, de modo que el modelo no ha visto nunca informacion posterior a ese corte. Este repositorio concreto corresponde al corte 2023-01 y a la etapa *init*, es decir, el modelo base con contexto extendido, sin entrenamiento especifico como agente.

Tecnicamente parte de TiC-LM 3B, un transformer de arquitectura OpenLM con LayerNorm y QK-norm, al que se le amplia la ventana de contexto de 2.000 a 8.192 tokens mediante preentrenamiento continuado, seguido de un SFT de recuperacion lejana (*far-retrieval*) y un re-SFT de instrucciones filtrado por un juez de fugas. La familia completa cubre siete fechas de corte (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07), lo que permite estudiar como evoluciona el conocimiento y el comportamiento de busqueda de un mismo modelo a lo largo del tiempo.

Su relevancia es metodologica: ofrece un entorno controlado para medir alucinacion temporal, fuga de conocimiento (*leakage*) y calidad de razonamiento con recuperacion, con un protocolo de agente explicito basado en turnos `<think>`, `<search>` e `<information>`. Es un modelo de investigacion, no un asistente de produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OpenLM / TiC-LM) con LayerNorm y QK-norm; RoPE base 48.000 |
| Parametros totales | 2.796.096.000 (~2,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (ampliado desde 2.000 mediante preentrenamiento continuado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Other (terminos no detallados en la model card) |
| Formato de pesos | safetensors; requiere `trust_remote_code=True` (`modeling_open_lm_hf.py`) |
| Tamano del repositorio | 5,6 GB |
| Etapa | init (modelo base con contexto extendido, sin entrenamiento de agente) |
| Fecha de corte de datos | 2023-01 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo OpenLM (TiC-LM 3B) con LayerNorm y QK-norm, implementado en `modeling_open_lm_hf.py` y distribuido con codigo remoto, por lo que `transformers` necesita `trust_remote_code=True` para cargarlo. La posicion se codifica con RoPE de base 48.000, coherente con la ventana de 8.192 tokens. El punto de partida es un modelo preentrenado con datos de TiC-LM detenidos en el corte; sobre el se aplica preentrenamiento continuado para pasar de 2.000 a 8.192 tokens de contexto, despues un SFT orientado a recuperacion lejana y finalmente un re-SFT de instrucciones con datos filtrados.

El control de fugas es el elemento diferencial del entrenamiento: todo el texto de post-entrenamiento pasa tres filtros. Primero, se construye unicamente a partir de instantaneas anteriores al corte. Segundo, se elimina cualquier mencion a un ano posterior al corte. Tercero, un juez LLM de fugas valida cada ejemplo, con una comprobacion de hechos plantados que detecta al menos 36 de 40 hechos post-corte inyectados artificialmente. Los conjuntos de entrenamiento y evaluacion no se solapan. El corpus de recuperacion asociado se reconstruye por corte: Wikipedia en ingles con la ultima revision de cada pagina anterior o igual al corte, mas lotes de CC-News rastreados antes de esa fecha, embebidos con `BAAI/bge-base-en-v1.5` e indexados con faiss en CPU (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos, top-5 con maximo 2 pasajes por articulo y 4.000 caracteres por turno).

## Capacidades

- Generacion de texto y modelado de lenguaje en ingles con contexto de hasta 8.192 tokens.
- Extraccion de caracteristicas (`feature-extraction` en los tags del repositorio).
- Formato de agente de busqueda temporal: alterna `<think> ... </think>` y `<search> query </search>`, recibe resultados en `<information> ... </information>` y cierra con `<answer> ... </answer>`.
- Razonamiento temporal explicito: el primer turno de pensamiento declara el ano al que se refiere la pregunta y el turno final declara el ano mas reciente cubierto por la evidencia.
- Etiquetado de evidencia con cuatro niveles: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` (no conocible aun en la fecha de corte).
- Conversacion multi-turno (tag `conversational`).
- Recuperacion aumentada sobre el corpus congelado en su propio corte (tag `retrieval-augmented`).
- No incluye vision, audio ni modo de pensamiento extendido mas alla del protocolo de turnos descrito.
- No esta entrenado como agente en esta etapa (*init*); el comportamiento agentico se desarrolla en el repositorio `-agent`.

## Casos de uso

- Investigacion sobre alucinacion temporal: al no haber visto nada posterior a 2023-01, sirve para medir si el modelo inventa hechos posteriores o los marca correctamente como `[FORECASTING]` o `[INSUFFICIENT]`.
- Evaluacion de agentes de busqueda con recuperacion controlada: el protocolo `<think>`/`<search>`/`<information>` y el corpus faiss congelado permiten reproducir episodios completos con hasta 8 turnos y temperatura 0,8, top-p 0,95.
- Estudios de fuga de conocimiento en pipelines de datos: el juez de fugas con hechos plantados (36/40 detectados) sirve como referencia metodologica para validar otros conjuntos de entrenamiento.
- Punto de partida para fine-tuning temporal: al ser la etapa *init*, es la base sobre la que se construyen los repositorios `-sft` y `-agent` del mismo corte, util para replicar la cadena completa.
- Analisis diacronico comparado: junto con los otros seis cortes de la familia, permite estudiar como cambia la respuesta a la misma pregunta segun la fecha de congelacion del modelo.
- Prototipado de asistentes con fecha de referencia fija: escenarios de auditoria o docencia donde se necesita un modelo que razone solo con informacion disponible hasta una fecha concreta.
- Experimentos de recuperacion lejana: el SFT especifico de *far-retrieval* lo hace adecuado para probar tecnicas de busqueda sobre corpus historicos de Wikipedia y CC-News.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud para un modelo denso de 2,8 B, en bfloat16 los pesos ocupan aproximadamente 5,6 GB (coincide con el tamano del repositorio), a lo que hay que sumar cache KV para hasta 8.192 tokens.
- GPU recomendadas: no disponibles. El modelo se distribuye en bfloat16 y la model card no especifica hardware de referencia.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; por tamano de pesos en bf16 es plausible en GPUs con 8-12 GB o mas, pero no hay dato oficial.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unica via documentada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el uso de codigo remoto con `modeling_open_lm_hf.py` complica el soporte en servidores de inferencia estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otros modelos, y la propuesta de valor (congelacion temporal con corpus y post-entrenamiento detenidos en una fecha) no tiene equivalentes directos identificados en la informacion proporcionada. La comparacion natural es interna, con los otros seis cortes de la misma familia Chrononauts (2013-05, 2015-01, 2017-01, 2019-01, 2021-01 y 2024-07) y con las otras dos etapas del mismo corte (`-sft` y `-agent`).

## Limitaciones y advertencias

- Modelo exclusivamente en ingles; no hay soporte multilingue declarado.
- Es la etapa *init*: no esta entrenado como agente, por lo que el formato `<think>`/`<search>` puede no seguirse de forma fiable sin el SFT o el entrenamiento de agente correspondientes.
- Conocimiento deliberadamente limitado a antes de 2023-01; cualquier pregunta sobre hechos posteriores debe responderse como `[FORECASTING]` o `[INSUFFICIENT]`, y el modelo puede fallar en esa distincion.
- Riesgo de alucinacion: aunque el entrenamiento filtra fugas, no se han publicado metricas de fidelidad ni de tasa de alucinacion.
- Licencia "other" sin terminos detallados en la model card: es necesario revisar el texto completo de la licencia antes de cualquier uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio; hay que auditar `modeling_open_lm_hf.py` antes de desplegarlo.
- Sin descargas ni likes en el momento de la consulta y con un paper aun en preparacion: ecosistema y validacion externa muy limitados.
- El rendimiento depende del corpus de recuperacion congelado (Wikipedia mas CC-News, indice faiss en CPU); fuera de ese entorno los resultados no son representativos.
- No hay informacion sobre cuantizaciones soportadas ni sobre sesgos especificos medidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattwang123/chrononauts-3b-2023-01-init
- Repositorio hermano (SFT): https://huggingface.co/mattwang123/chrononauts-3b-2023-01-sft
- Repositorio hermano (agente): https://huggingface.co/mattwang123/chrononauts-3b-2023-01-agent
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparacion (Chrononauts, Johns Hopkins University y Apple); no disponible enlace publico en la informacion proporcionada.
