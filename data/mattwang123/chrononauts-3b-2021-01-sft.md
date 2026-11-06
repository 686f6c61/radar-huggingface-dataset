# mattwang123/chrononauts-3b-2021-01-sft

## Resumen

Chrononauts 3B (cutoff 2021-01, etapa sft) es un agente de busqueda temporal desarrollado por mattwang123 en el marco de un proyecto con paper en preparacion (Chrononauts, Johns Hopkins University y Apple). El modelo pertenece a una suite de siete agentes congelados en fechas distintas (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07); en cada uno de ellos los datos de preentrenamiento (TiC-LM), los datos de postentrenamiento y el corpus de recuperacion se detienen en la fecha de corte, de modo que el modelo nunca ha visto informacion posterior. Esta variante concreta corresponde a la etapa de supervised fine-tuning (sft) sobre trazas de busqueda generadas por un profesor (gpt-oss-120b) que solo consulto el corpus congelado en enero de 2021.

El modelo resuelve un problema de evaluacion: separar la capacidad de razonamiento y busqueda de un agente de su conocimiento parametrico del futuro. Al fijar el corpus y el preentrenamiento a una fecha, se puede medir si el agente responde con evidencia recuperada del pasado o si "alucina" conocimiento posterior. Es relevante para investigacion en retrieval-augmented generation, evaluacion temporal y agentes de busqueda con control de fuga de informacion.

Arquitectura TiC-LM (OpenLM) con 2.796.096.000 parametros, contexto de hasta 8.192 tokens (RoPE base 48.000) y licencia "other". El repositorio ocupa 5,6 GB en safetensors y esta pensado para uso con `trust_remote_code=True` por el uso de LayerNorm con QK-norm en `modeling_open_lm_hf.py`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only TiC-LM (OpenLM) con LayerNorm con QK-norm |
| Parametros totales | 2.796.096.000 (2,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | other |
| Formato de pesos | safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia TiC-LM (OpenLM) con 2,8 B de parametros. La implementacion incluye LayerNorm con QK-norm en `modeling_open_lm_hf.py`, lo que obliga a cargar el modelo con `trust_remote_code=True`. El contexto maximo es de 8.192 tokens con RoPE de base 48.000. Esta variante sft se inicializa desde el modelo `-init` del mismo cutoff y se entrena con supervised fine-tuning sobre trazas de busqueda escritas por un profesor (gpt-oss-120b) que solo consulto el corpus congelado en 2021-01.

El preentrenamiento usa TiC-LM con datos detenidos en la fecha de corte. El control de fuga es explicito: todo el texto de postentrenamiento paso tres filtros (construido solo con snapshots anteriores al cutoff, sin anos posteriores al cutoff, y un juez LLM de fuga con comprobacion de hechos plantados que detecto al menos 36 de 40 hechos post-cutoff plantados). Los conjuntos de entrenamiento y evaluacion no se solapan. El corpus de recuperacion es Wikipedia en ingles reconstruida por cutoff (ultima revision de cada pagina en o antes de la fecha) mas lotes de CC-News rastreados antes del cutoff, embebidos con `BAAI/bge-base-en-v1.5` e indexados con faiss en CPU (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos; top-5, maximo 2 pasajes por articulo, 4.000 caracteres por turno).

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno en formato de agente.
- Busqueda iterativa: alterna `<think> ... </think>` y `<search> query </search>`, con resultados en `<information> ... </information>`.
- Razonamiento multi-paso con hasta 8 turnos en evaluacion (T=0,8, top-p 0,95).
- Etiquetado de evidencia en la respuesta final: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` (no conocible aun).
- Conciencia temporal: el prompt declara la fecha actual ("Assume today is YYYY-MM-DD.") y el primer turno de pensamiento indica el ano sobre el que pregunta la cuestion.
- Capacidad de declarar el ultimo ano cubierto por la evidencia recuperada.
- Soporte de tool calling / function calling: no disponible de forma generica; el unico "tool" documentado es la busqueda en el corpus congelado.
- Capacidades multilingues: solo ingles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Evaluacion de fuga temporal en agentes de busqueda: usar el modelo contra su corpus congelado en 2021-01 para medir si responde con evidencia del pasado o filtra conocimiento posterior; es el proposito principal de la suite.
- Investigacion en retrieval-augmented generation: el pipeline faiss + bge-base-en-v1.5 con top-5 y 4.000 caracteres por turno sirve como banco de pruebas reproducible de recuperacion y razonamiento.
- Analisis historico asistido: responder preguntas sobre hechos anteriores a enero de 2021 con trazabilidad de la evidencia y etiqueta de suficiencia (`[SUPPORTED]`, `[INSUFFICIENT]`).
- Deteccion de preguntas no respondibles: el modelo puede marcar `[FORECASTING]` cuando la cuestion depende de informacion posterior al cutoff, util en sistemas que deben abstenerse.
- Benchmarking de agentes de busqueda: comparar el rendimiento de un agente de 2,8 B con profesores de mayor tamano en tareas de busqueda multi-turno.
- Estudio de calibracion y abstenacion: las etiquetas de evidencia permiten analizar cuando el modelo reconoce limites de informacion en lugar de alucinar.
- Formacion y docencia: ejemplo didactico de agente con busqueda, formato estructurado y control de contaminacion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2,8 B de parametros, en bfloat16 se situaria en torno a 5,6 GB de pesos, y en cuantizaciones de 8 o 4 bits seria considerablemente menor (estimacion, no dato del autor).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 2,8 B, aunque no se confirma en la model card.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"`; el autor no documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisito adicional: indice faiss en CPU para el corpus congelado (OPQ64, IVF32768, PQ64) y embeddings con `BAAI/bge-base-en-v1.5`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2021-01 sft | 2,8 B | 8.192 | Agente de busqueda congelado en 2021-01 | other | HuggingFace |
| Chrononauts 3B 2019-01 sft | no disponible | no disponible | Misma suite, cutoff 2019-01 | other | HuggingFace (repo hermano) |
| Chrononauts 3B 2023-01 sft | no disponible | no disponible | Misma suite, cutoff 2023-01 | other | HuggingFace (repo hermano) |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Conocimiento deliberadamente limitado a enero de 2021: cualquier pregunta sobre hechos posteriores debe marcarse como `[FORECASTING]` o `[INSUFFICIENT]`; no es un modelo actualizado.
- Solo ingles; no hay soporte multilingue documentado.
- Riesgo de alucinacion: aunque el diseno busca reducirla mediante etiquetas de evidencia, no se han publicado metricas de fidelidad.
- Licencia "other": es necesario revisar los terminos exactos antes de cualquier uso comercial; no se especifican restricciones en la informacion disponible.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor (`modeling_open_lm_hf.py`); conviene auditar el codigo en entornos de produccion.
- Depende de un corpus e indice faiss especificos; fuera de ese pipeline el rendimiento puede degradarse.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa muy limitados.
- Paper en preparacion: no hay resultados de benchmarks publicados que permitan validar las afirmaciones de la model card.
- Fecha de creacion del repositorio en 2026-11-06, posterior al cutoff del modelo; conviene verificar la procedencia y el mantenimiento del proyecto.

## Enlaces

- HuggingFace: https://huggingface.co/mattwang123/chrononauts-3b-2021-01-sft
- Repo hermano init: https://huggingface.co/mattwang123/chrononauts-3b-2021-01-init
- Repo hermano agent: https://huggingface.co/mattwang123/chrononauts-3b-2021-01-agent
- Embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparacion (Chrononauts, Johns Hopkins University y Apple); no disponible enlace
