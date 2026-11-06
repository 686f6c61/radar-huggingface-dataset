# mattwang123/chrononauts-3b-2019-01-sft

## Resumen

Chrononauts 3B (cutoff 2019-01, etapa SFT) es un agente de búsqueda de 2.796 millones de parámetros desarrollado por mattwang123 (con vinculación a Johns Hopkins University y Apple según la model card) que forma parte de una suite de siete agentes "congelados" en fechas concretas. El modelo está entrenado exclusivamente con información disponible hasta enero de 2019: los datos de preentrenamiento (TiC-LM), los datos de post-entrenamiento y el corpus de recuperación se detienen en esa fecha, de modo que el modelo no ha visto nunca acontecimientos posteriores. Esto lo convierte en una herramienta de investigación para estudiar cómo razonan y responden los agentes de búsqueda cuando su conocimiento y su corpus están temporalmente acotados.

Esta versión concreta es la etapa de *supervised fine-tuning* (SFT), inicializada a partir del modelo `-init` del mismo cutoff y ajustada sobre trazas de búsqueda generadas por un profesor (gpt-oss-120b) que solo consultó el corpus congelado en 2019-01. La arquitectura es TiC-LM basada en OpenLM, con 2.796 millones de parámetros y una ventana de contexto utilizable de hasta 8.192 tokens (RoPE base 48.000). El modelo está pensado para operar en un bucle agéntico con etiquetas `<think>`, `<search>`, `<information>` y `<answer>`, y emplea un corpus de Wikipedia en inglés reconstruido por cutoff más lotes de CC-News anteriores a la fecha.

Su relevancia es metodológica: permite evaluar la capacidad de un agente de recuperación-aumentada sin contaminación de conocimiento futuro, controlando fugas mediante filtros de fecha, un juez de fugas LLM y la separación estricta entre conjuntos de entrenamiento y evaluación. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia figura como "other" sin detalle adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TiC-LM (OpenLM) con LayerNorm y QK-norm; transformer decoder-only |
| Parametros totales | 2.796.096.000 (2,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | other (sin detalle en la model card) |
| Formato de pesos | safetensors, con código remoto personalizado (`modeling_open_lm_hf.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 2,8 B parámetros basado en la arquitectura TiC-LM de OpenLM, con LayerNorm y QK-norm implementados en un fichero de modelado personalizado (`modeling_open_lm_hf.py`), lo que obliga a usar `trust_remote_code=True` en `transformers`. El contexto máximo utilizable es de 8.192 tokens con RoPE base 48.000. Esta etapa es un SFT sobre el modelo `-init` del mismo cutoff: el ajuste se realizó sobre trazas de búsqueda escritas por un profesor (gpt-oss-120b) que operaba únicamente sobre el corpus congelado en 2019-01.

El preentrenamiento usa TiC-LM con datos detenidos en el cutoff. El corpus de recuperación asociado se compone de Wikipedia en inglés reconstruida por cutoff (última revisión de cada página en o antes de la fecha) más lotes de CC-News rastreados antes de 2019-01, embebidos con `BAAI/bge-base-en-v1.5` e indexados con faiss en CPU (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos; top-5, máximo 2 pasajes por artículo, 4.000 caracteres por turno). El control de fugas incluyó tres filtros: construcción solo con instantáneas previas al cutoff, ausencia de años posteriores al cutoff y un juez LLM de fugas con comprobación de hechos plantados (al menos 36/40 hechos post-cutoff detectados). No se especifica en la información disponible si hubo RLHF o DPO; esta etapa es explícitamente SFT.

## Capacidades

- Generación de texto conversacional en inglés.
- Búsqueda agéntica en un corpus temporalmente congelado mediante etiquetas `<search> ... </search>`.
- Razonamiento multi-turno con bloques `<think> ... </think>` antes de cada consulta.
- Interpretación de resultados de recuperación en `<information> ... </information>`.
- Emisión de respuestas finales etiquetadas con evidencia: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` o `[FORECASTING]` (no conocible aún).
- Declaración explícita del año de la pregunta y del año más reciente cubierto por la evidencia.
- Consciencia temporal: el prompt incluye la fecha actual ("Assume today is YYYY-MM-DD.") y el modelo opera en consecuencia.
- Soporte de hasta 8 turnos de búsqueda en evaluación (T=0.8, top-p 0.95).
- No se documentan capacidades de visión, audio, tool calling genérico ni function calling fuera del protocolo de búsqueda descrito.

## Casos de uso

- Investigación sobre contaminación temporal: permite medir cómo responde un agente de búsqueda cuando su conocimiento y su corpus se limitan a 2019-01, sirviendo como línea base para estudiar fugas de información futura en modelos entrenados con datos posteriores.
- Evaluación de agentes de recuperación-aumentada: el protocolo `<think>`/`<search>`/`<information>`/`<answer>` con etiquetas de evidencia facilita la comparación sistemática entre los siete cutoffs de la suite.
- Análisis de calibración epistémica: las etiquetas `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` permiten evaluar si el modelo distingue entre evidencia suficiente, insuficiente y preguntas no conocibles en su fecha.
- Simulación de asistentes con conocimiento histórico acotado: útil para construir demos o entornos de evaluación donde el asistente no debe conocer hechos posteriores a enero de 2019.
- Estudio de razonamiento multi-turno con recuperación: el límite de 8 turnos y el rerank de 400 candidatos permiten analizar estrategias de reformulación de consultas y uso de evidencia.
- Benchmarking de pipelines RAG con índices faiss en CPU: la configuración concreta (OPQ64, IVF32768, PQ64, bge-base-en-v1.5) sirve como referencia reproducible para comparar variantes de indexación y recuperación.
- Docencia y divulgación sobre límites temporales en LLM: ejemplo práctico de cómo se diseña un cutoff estricto con filtros de fuga y juez LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos (2,8 B × 2 bytes), más overhead de activaciones y caché KV para hasta 8.192 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,8 GB para pesos; en 4 bits, alrededor de 1,4 GB para pesos (estimaciones teóricas; no se documentan cuantizaciones oficiales).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabe en GPUs de consumo con al menos 8 GB en bfloat16 (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y con margen en 16 GB o más (RTX 4080, RTX 4090, A100, H100).
- Despliegue: la model card solo documenta carga con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`, `trust_remote_code=True`, `torch_dtype="bfloat16"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; el código remoto personalizado puede limitar la compatibilidad con esos motores.
- El corpus de recuperación se sirve con un índice faiss en CPU, por lo que se necesita RAM suficiente para el índice además de la GPU para el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada. La comparación se limita a características estructurales conocidas.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2019-01 SFT | 2,8 B | 8.192 | Agente de búsqueda con cutoff temporal 2019-01 | other | Hugging Face (0 descargas) |
| Chrononauts 3B 2019-01 init | no disponible | no disponible | Modelo inicial del mismo cutoff | other | Hugging Face (repo hermano) |
| Chrononauts 3B 2019-01 agent | no disponible | no disponible | Etapa agente del mismo cutoff | other | Hugging Face (repo hermano) |
| Alternativas genéricas de 3 B | no disponible | no disponible | LLM generalista | variable | no disponible |

No se han identificado en la información disponible modelos directamente comparables con el mismo diseño de cutoff temporal.

## Limitaciones y advertencias

- Conocimiento y corpus limitados a enero de 2019: el modelo no puede responder sobre hechos posteriores y está diseñado para marcarlos como `[FORECASTING]` o `[INSUFFICIENT]`.
- Solo inglés: no se documenta soporte multilingüe.
- Requiere `trust_remote_code=True` por el código de modelado personalizado (`modeling_open_lm_hf.py`), lo que implica ejecutar código del autor y revisarlo antes de usarlo en producción.
- Licencia "other" sin texto de licencia en la model card: es necesario contactar con el autor o consultar el repositorio para conocer las condiciones de uso comercial.
- Riesgo de alucinación inherente a un modelo de 2,8 B; las etiquetas de evidencia ayudan a detectarlo, pero no lo eliminan.
- El protocolo de agente asume un formato muy específico (`<think>`, `<search>`, `<information>`, `<answer>`) y un corpus concreto; fuera de ese entorno el rendimiento puede degradarse.
- El corpus de recuperación depende de un índice faiss en CPU con parámetros fijos (OPQ64, IVF32768, PQ64, top-5, 4.000 caracteres por turno), lo que condiciona la calidad de la evidencia recuperada.
- Ventana de contexto de 8.192 tokens: insuficiente para tareas de contexto largo fuera del bucle agéntico previsto.
- Sin benchmarks publicados ni descargas registradas: no hay evidencia externa de rendimiento ni de adopción.
- La model card indica un paper en preparación (Chrononauts, Johns Hopkins University y Apple); los detalles metodológicos completos aún no están disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattwang123/chrononauts-3b-2019-01-sft
- Repo hermano init: https://huggingface.co/mattwang123/chrononauts-3b-2019-01-init
- Repo hermano agent: https://huggingface.co/mattwang123/chrononauts-3b-2019-01-agent
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparación (Chrononauts, Johns Hopkins University y Apple); no disponible en la información proporcionada.
