# mattwang123/chrononauts-3b-2023-01-sft

## Resumen

Chrononauts 3B (cutoff 2023-01, etapa sft) es un agente de búsqueda de 2.796 millones de parámetros desarrollado por mattwang123 (trabajo asociado a Johns Hopkins University y Apple, según la model card) que forma parte de una suite de siete modelos "congelados" en fechas distintas entre 2013 y 2024. El objetivo del proyecto es estudiar el comportamiento de agentes de búsqueda con conocimiento estrictamente temporal: para cada fecha de corte, los datos de preentrenamiento (TiC-LM), los datos de post-entrenamiento y el corpus de recuperación se detienen en esa fecha, de modo que el modelo nunca ha visto información posterior.

Esta ficha corresponde a la etapa de supervised fine-tuning (SFT) con corte en enero de 2023. El modelo parte del checkpoint `-init` del mismo corte y se afina sobre trazas de búsqueda generadas por un profesor (gpt-oss-120b) que solo consultó el corpus congelado en esa fecha. Está pensado para operar contra un índice faiss construido con Wikipedia en inglés reconstruida por revisión y lotes de CC-News anteriores al corte, con embeddings de `BAAI/bge-base-en-v1.5`.

Su relevancia es metodológica: permite evaluar respuestas con etiquetas de evidencia explícitas (`[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]`, `[FORECASTING]`) y distinguir entre lo que el modelo sabe, lo que puede recuperar y lo que todavía no era cognoscible en su fecha de corte. La arquitectura es TiC-LM (OpenLM) con QK-norm, contexto útil de hasta 8.192 tokens y licencia "other".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only TiC-LM (OpenLM) con LayerNorm con QK-norm (`modeling_open_lm_hf.py`) |
| Parametros totales | 2.796.096.000 (2,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card solo menciona `torch_dtype="bfloat16"`) |
| Idiomas soportados | ingles (en) |
| Licencia | other |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia TiC-LM sobre la base de OpenLM, con LayerNorm que incorpora QK-norm; por eso la carga exige `trust_remote_code=True` y el fichero `modeling_open_lm_hf.py`. El preentrenamiento se realizó sobre TiC-LM, un corpus limitado temporalmente a la fecha de corte (enero de 2023 en este caso). El contexto operativo es de 8.192 tokens con RoPE de base 48.000.

La etapa SFT parte del modelo `chrononauts-3b-2023-01-init` y se afina sobre trazas de búsqueda escritas por un profesor (gpt-oss-120b) que solo consultó el corpus congelado en el corte. Todos los textos de post-entrenamiento pasaron tres filtros de fuga temporal: construcción únicamente a partir de instantáneas anteriores al corte, ausencia de años posteriores al corte y un juez LLM de fugas con comprobación de hechos plantados (al menos 36 de 40 hechos post-corte plantados detectados). Los conjuntos de entrenamiento y evaluación no se solapan. No se detalla en la información disponible el número de tokens de entrenamiento ni si hubo RLHF o DPO en esta etapa.

## Capacidades

- Generación de texto conversacional en inglés con formato de agente de búsqueda.
- Razonamiento multi-turno con alternancia de bloques `<think> ... </think>`, consultas `<search> query </search>` y resultados `<information> ... </information>`.
- Recuperación aumentada contra un corpus congelado en la fecha de corte (Wikipedia en inglés por revisión y CC-News anteriores al corte).
- Conciencia temporal explícita: el prompt declara la fecha actual ("Assume today is YYYY-MM-DD.") y el primer turno de pensamiento identifica el año al que se refiere la pregunta.
- Etiquetado de evidencia en el turno final: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` (no cognoscible todavía), junto con el año más reciente cubierto por la evidencia.
- Respuesta final estructurada en `<answer> ... </answer>`.
- Extracción de características (tag `feature-extraction` en el repositorio).
- No se documentan capacidades de visión, audio, tool calling genérico ni matemáticas avanzadas.

## Casos de uso

- Evaluación de agentes de búsqueda con conciencia temporal: el modelo permite medir si un agente responde con evidencia disponible antes de una fecha dada y si etiqueta correctamente lo que no era cognoscible, gracias a sus etiquetas de evidencia explícitas.
- Investigación sobre fugas de información temporal: sirve como referencia controlada para comparar con modelos entrenados sin corte, aislando el efecto de conocimiento posterior al corte en tareas de pregunta-respuesta.
- Preguntas históricas acotadas a una fecha: con el corpus congelado en enero de 2023, el modelo puede responder consultas sobre hechos anteriores a esa fecha citando pasajes recuperados del índice faiss.
- Análisis de pronóstico y horizonte de conocimiento: la etiqueta `[FORECASTING]` permite identificar preguntas cuyo resultado aún no era determinable en el corte, útil en estudios de calibración y de "know what you don't know".
- Prototipado de pipelines RAG ligeros: con 2,8 B de parámetros y contexto de 8.192 tokens, puede desplegarse en entornos de investigación con recursos moderados para experimentar con recuperación top-5 (máximo 2 pasajes por artículo, 4.000 caracteres por turno).
- Auditoría de sistemas de recuperación: al fijar el corpus y la fecha, se pueden comparar configuraciones de índice (OPQ64, IVF32768, PQ64 con rerank exacto de 400 candidatos) sin que el modelo aporte conocimiento externo.
- Estudio de destilación de trazas: al haberse afinado sobre trazas de un profesor (gpt-oss-120b), es un caso práctico para analizar cómo un modelo pequeño imita estrategias de búsqueda de uno grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2,8 B de parámetros, en bfloat16 los pesos ocupan aproximadamente 5,6 GB (tamaño del repositorio), a los que hay que sumar caché KV para hasta 8.192 tokens. En cuantizaciones de 8 y 4 bits el peso se reduciría aproximadamente a la mitad y a un cuarto, respectivamente, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16 GB o más permite inferencia en bfloat16 con contexto completo; GPUs de 8-12 GB requerirían cuantización.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas de 16 GB o más en bfloat16 y en tarjetas de 8 GB con cuantización, aunque no hay confirmación oficial.
- Opciones de despliegue: la model card solo documenta `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la integración con estos motores no está garantizada por el código personalizado de TiC-LM.
- Latencia y throughput: no disponibles. La evaluación del autor usó como máximo 8 turnos, temperatura 0,8 y top-p 0,95.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2023-01 sft | 2,8 B | 8.192 tokens | Congelado en enero de 2023, corpus y post-entrenamiento limitados al corte | other | Hugging Face (mattwang123) |
| Chrononauts 3B 2023-01 init | 2,8 B | 8.192 tokens | Mismo corte, etapa previa a SFT | other | Hugging Face (mattwang123) |
| Chrononauts 3B 2023-01 agent | 2,8 B | 8.192 tokens | Mismo corte, etapa posterior de agente | other | Hugging Face (mattwang123) |
| Chrononauts 3B (otros cortes: 2013-05 a 2024-07) | 2,8 B | 8.192 tokens | Distintas fechas de congelación | other | Hugging Face (mattwang123) |

No se dispone de datos de benchmarks que permitan comparar su rendimiento con modelos de propósito general del mismo tamaño.

## Limitaciones y advertencias

- Conocimiento deliberadamente limitado: el modelo no conoce nada posterior a enero de 2023, ni en pesos ni en corpus de recuperación; no debe usarse para preguntas sobre hechos posteriores.
- Solo inglés: los datos, el corpus y las trazas están en inglés; no hay soporte multilingüe documentado.
- Dependencia del corpus correcto: el rendimiento depende de usar el índice faiss congelado en el corte (Wikipedia por revisión y CC-News previos); con otro corpus el comportamiento del agente deja de ser válido.
- Riesgo de alucinación: aunque el formato incluye etiquetas de evidencia, no hay benchmarks publicados que cuantifiquen la fiabilidad de las respuestas ni de las etiquetas.
- Licencia "other": no se detallan los términos; es necesario revisar las condiciones antes de cualquier uso comercial.
- Requiere `trust_remote_code=True`: la carga ejecuta código personalizado (`modeling_open_lm_hf.py`), lo que implica revisión de seguridad y posibles incompatibilidades con motores de inferencia estándar.
- Contexto limitado a 8.192 tokens y episodios de evaluación de como máximo 8 turnos; usos con muchas iteraciones de búsqueda pueden degradar el formato.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria ni issues documentados.
- Paper en preparación: no hay publicación revisada por pares que respalde los resultados del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattwang123/chrononauts-3b-2023-01-sft
- Repositorio hermano (init): https://huggingface.co/mattwang123/chrononauts-3b-2023-01-init
- Repositorio hermano (agent): https://huggingface.co/mattwang123/chrononauts-3b-2023-01-agent
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparación (Chrononauts, Johns Hopkins University y Apple); no disponible enlace público.
