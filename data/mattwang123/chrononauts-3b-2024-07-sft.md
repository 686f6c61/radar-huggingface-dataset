# mattwang123/chrononauts-3b-2024-07-sft

## Resumen

Chrononauts 3B (cutoff 2024-07, etapa SFT) es un agente de búsqueda de 2.796 millones de parámetros desarrollado por mattwang123 en el marco del proyecto Chrononauts (Johns Hopkins University y Apple, según la model card). Forma parte de una suite de siete agentes congelados en fechas distintas (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07): para cada fecha, los datos de preentrenamiento (TiC-LM), los datos de post-entrenamiento y el corpus de recuperación se detienen en ese corte temporal, de modo que el modelo nunca ha visto información posterior. Este repositorio concreto corresponde a la etapa de *supervised fine-tuning* sobre trazas de búsqueda generadas por un profesor (gpt-oss-120b) que solo consultó el corpus congelado en julio de 2024.

El modelo resuelve un problema de evaluación y control de contaminación temporal: permite estudiar cómo razona y busca un agente cuando su conocimiento y su herramienta de recuperación están estrictamente limitados a una fecha, lo que facilita medir alucinación, forecasting y uso de evidencia sin filtración de eventos futuros. La arquitectura es un transformer tipo OpenLM (TiC-LM) con RoPE de base 48.000 y ventana de contexto de hasta 8.192 tokens, con pesos en safetensors y código personalizado (`trust_remote_code=True`).

Es relevante ahora porque propone un protocolo reproducible de agentes con "corte temporal" y etiquetas de evidencia explícitas (`[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]`, `[FORECASTING]`), útil para investigación sobre retrieval-augmented generation, evaluación de alucinaciones y agentes multi-turno. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el paper está en preparación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo OpenLM (TiC-LM) con LayerNorm y QK-norm; RoPE base 48.000 |
| Parametros totales | 2.796.096.000 (2,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card no documenta cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | `other` (no se detalla el texto de la licencia) |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OpenLM (TiC-LM), con LayerNorm y QK-norm implementados en `modeling_open_lm_hf.py`, y codificación posicional RoPE con base 48.000. El preentrenamiento se realizó sobre TiC-LM, un corpus congelado en la fecha de corte (2024-07). Sobre esa base, este checkpoint es la etapa SFT: se inicializó desde `mattwang123/chrononauts-3b-2024-07-init` y se ajustó de forma supervisada sobre trazas de búsqueda escritas por un profesor (gpt-oss-120b) que operaba únicamente contra el corpus congelado en ese mismo corte.

El control de filtración es parte central del diseño: todo el texto de post-entrenamiento pasó tres filtros (construcción solo con instantáneas anteriores al corte, ausencia de años posteriores al corte y un juez LLM de filtración con comprobación de hechos plantados, con al menos 36 de 40 hechos post-corte detectados). Los conjuntos de entrenamiento y evaluación no se solapan. El agente opera en episodios con un formato específico: el prompt indica la fecha actual ("Assume today is YYYY-MM-DD.") y la pregunta; el modelo alterna `<think> ... </think>` y `<search> query </search>`, recibe resultados en `<information> ... </information>` y cierra con `<answer> ... </answer>`. La evaluación usó como máximo 8 turnos, T=0.8 y top-p 0.95.

## Capacidades

- Generación de texto conversacional en inglés, con razonamiento explícito en bloques `<think>`.
- Búsqueda agéntica multi-turno: emite consultas `<search>` y consume pasajes `<information>` devueltos por el índice faiss del corpus congelado.
- Razonamiento sobre evidencia con etiquetas explícitas: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` (evento aún no cognoscible en la fecha de corte).
- Anclaje temporal: el primer turno de pensamiento declara el año al que se refiere la pregunta y el turno final declara el año más reciente cubierto por la evidencia.
- Recuperación aumentada sobre un corpus time-locked: Wikipedia en inglés reconstruida por revisión (última revisión de cada página en o antes del corte) más lotes de CC-News rastreados antes del corte, embebidos con `BAAI/bge-base-en-v1.5` e indexados en faiss CPU (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos; top-5, máximo 2 pasajes por artículo, 4.000 caracteres por turno).
- Capacidad de forecasting controlado: distingue preguntas no respondibles con la evidencia disponible de las respondibles.
- No se documentan capacidades de visión, audio, tool calling genérico ni matemáticas especializadas.

## Casos de uso

- Evaluación de alucinación temporal: usar el modelo contra su corpus congelado en 2024-07 para medir si responde con evidencia real o inventa eventos posteriores; las etiquetas `[INSUFFICIENT]` y `[FORECASTING]` permiten puntuar calibración de forma automática.
- Investigación en retrieval-augmented generation: reproducir el pipeline completo (embeddings bge-base-en-v1.5, índice faiss OPQ64/IVF32768/PQ64 con rerank de 400 candidatos) para estudiar el efecto del número de turnos, el top-k y el tamaño de pasaje en la calidad de la respuesta.
- Benchmarking de agentes de búsqueda: comparar el comportamiento de los siete checkpoints de la suite (2013-05 a 2024-07) sobre la misma pregunta para analizar cómo cambia la respuesta según el conocimiento disponible en cada fecha.
- Estudio de contaminación de datos: emplear el protocolo de filtros y el juez LLM de filtración como referencia metodológica para construir otros conjuntos de evaluación libres de leakage.
- Análisis de razonamiento multi-turno: con hasta 8 turnos y 8.192 tokens de contexto, examinar las trazas `<think>`/`<search>` para caracterizar estrategias de descomposición de preguntas y reformulación de consultas.
- Docencia y divulgación: demostrar de forma tangible los límites del conocimiento de un modelo y la diferencia entre "no lo sé" y "aún no ha ocurrido", usando preguntas cuyo corte temporal es conocido.
- Verificación de hechos con fecha de referencia: dado un artículo o afirmación, comprobar si era sostenible con la evidencia disponible antes de julio de 2024, útil en auditoría de textos históricos o periodísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe la configuración de evaluación (máximo 8 turnos, T=0.8, top-p 0.95) y menciona que el paper está en preparación, sin cifras de MMLU, HumanEval, GSM8K ni métricas de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 2,8 B de parámetros ocupan aproximadamente 5,6 GB de pesos, por lo que se necesitan del orden de 7-8 GB de VRAM contando caché KV para 8.192 tokens; en cuantización de 8 bits, unos 3-4 GB, y en 4 bits, unos 2-3 GB (estimaciones a partir del tamaño, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y evaluación por lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia individual sin problemas.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas de 4-6 GB con cuantización agresiva, siempre que el runtime soporte el código personalizado OpenLM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"` (vía documentada). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la dependencia de `modeling_open_lm_hf.py` y del índice faiss externo limita el uso directo en muchos runtimes estándar.
- Latencia y throughput: no disponibles. El coste dominante en el episodio es la búsqueda faiss en CPU (rerank exacto de 400 candidatos) más hasta 8 turnos de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2024-07 SFT | 2,8 B | 8.192 | Agente de búsqueda con corpus congelado por fecha | `other` | Hugging Face (0 descargas) |
| Chrononauts 3B 2024-07 init | 2,8 B | 8.192 | Checkpoint base previo al SFT del mismo corte | `other` | Hugging Face (repo hermano) |
| Chrononauts 3B 2024-07 agent | 2,8 B | 8.192 | Etapa posterior de entrenamiento agéntico del mismo corte | `other` | Hugging Face (repo hermano) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos externos comparables en la información proporcionada, por lo que no se incluye una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Idioma: solo inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Conocimiento deliberadamente obsoleto: el modelo está congelado en 2024-07 y no debe usarse para preguntas sobre hechos posteriores; para esos casos está diseñado para responder `[FORECASTING]` o `[INSUFFICIENT]`.
- Dependencia del corpus: el rendimiento depende críticamente del índice faiss y de los embeddings `BAAI/bge-base-en-v1.5` descritos; usar otro corpus o configuración de recuperación invalida las condiciones de entrenamiento.
- Riesgo de alucinación: aunque el entrenamiento incluye etiquetas de evidencia y filtros anti-leakage, no se han publicado métricas de tasa de alucinación ni de precisión de las etiquetas.
- Licencia `other` sin texto detallado en la información disponible: es necesario revisar el archivo de licencia del repositorio antes de cualquier uso comercial; no se puede asumir permiso de uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor (`modeling_open_lm_hf.py`); conviene auditar ese archivo antes de desplegarlo en producción.
- Madurez: 0 descargas y 0 likes, paper en preparación y fecha de creación del repositorio en noviembre de 2026; no hay evidencia de uso en producción ni de validación externa.
- Sesgos: no documentados por el autor; al entrenarse sobre Wikipedia y CC-News en inglés, hereda los sesgos de cobertura y sesgo editorial de esas fuentes.
- Sin soporte documentado para tool calling genérico, visión, audio ni matemáticas; el formato `<search>`/`<information>` es específico del pipeline descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattwang123/chrononauts-3b-2024-07-sft
- Checkpoint inicial del mismo corte: https://huggingface.co/mattwang123/chrononauts-3b-2024-07-init
- Checkpoint agéntico del mismo corte: https://huggingface.co/mattwang123/chrononauts-3b-2024-07-agent
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparación (Chrononauts, Johns Hopkins University y Apple); no disponible enlace en la información proporcionada.
