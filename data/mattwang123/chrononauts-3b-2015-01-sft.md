# mattwang123/chrononauts-3b-2015-01-sft

## Resumen

Chrononauts 3B (cutoff 2015-01, etapa SFT) es un agente de busqueda de 2.796.096.000 parametros desarrollado por mattwang123 en el marco de un proyecto de investigacion conjunto entre Johns Hopkins University y Apple. Forma parte de una suite de siete agentes congelados en fechas distintas (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07), donde tanto los datos de preentrenamiento (TiC-LM) como los de post-entrenamiento y el corpus de recuperacion se detienen en la fecha de corte. Este repositorio concreto corresponde al modelo tras supervised fine-tuning sobre trazas de busqueda generadas por un profesor (gpt-oss-120b) que solo consulto el corpus congelado en enero de 2015.

El problema que resuelve es el control de fuga temporal en agentes de busqueda: el modelo nunca ha visto informacion posterior a su cutoff, lo que permite evaluar de forma limpia si un agente responde basandose en evidencia disponible en el momento o si "adivina" el futuro. La arquitectura es TiC-LM sobre OpenLM, un transformer con LayerNorm y QK-norm, con una ventana de contexto util de hasta 8.192 tokens y RoPE base 48.000.

Es relevante ahora porque ofrece una infraestructura reproducible para estudiar forecasting, atribucion temporal de evidencia y comportamiento de agentes con retrieval-augmented generation bajo restricciones temporales estrictas. El formato del agente alterna bloques `<think>`, `<search>`, `<information>` y `<answer>`, con etiquetas de evidencia (`[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]`, `[FORECASTING]`) que permiten auditar la trazabilidad de cada respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer TiC-LM (OpenLM) con LayerNorm y QK-norm; requiere `trust_remote_code=True` |
| Parametros totales | 2.796.096.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | other (consultar terminos del autor) |
| Formato de pesos | safetensors |
| Etapa | SFT (supervised fine-tuning) |
| Fecha de corte | 2015-01 |
| Modelo inicial | mattwang123/chrononauts-3b-2015-01-init |
| Tamano del repo | 5,6 GB |
| Libreria | transformers |
| Pipeline | text-generation / feature-extraction |

## Arquitectura y entrenamiento

El modelo se basa en TiC-LM, una implementacion de OpenLM que emplea LayerNorm con QK-norm (fichero `modeling_open_lm_hf.py`), lo que obliga a cargar el modelo con `trust_remote_code=True`. La ventana de contexto practica es de 8.192 tokens con RoPE base 48.000. El preentrenamiento se realizo sobre TiC-LM, un corpus que se detiene en la fecha de corte de enero de 2015, garantizando que el modelo no haya visto eventos posteriores.

La etapa SFT se inicializa desde el modelo `-init` del mismo cutoff y se entrena sobre trazas de busqueda escritas por un profesor (gpt-oss-120b) que solo consulto el corpus congelado en esa fecha. El control de fuga se aplico mediante tres filtros: construccion exclusiva a partir de snapshots previos al cutoff, ausencia de anos posteriores al cutoff y un juez LLM de fuga con comprobacion de hechos plantados (al menos 36 de 40 hechos post-cutoff detectados). Los conjuntos de entrenamiento y evaluacion no se solapan. No se especifica el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset.

El corpus de recuperacion asociado se compone de Wikipedia en ingles reconstruida por cutoff (ultima revision de cada pagina en o antes de la fecha) mas lotes de CC-News rastreados antes del cutoff, embebidos con `BAAI/bge-base-en-v1.5` e indexados con faiss en CPU (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos; top-5, maximo 2 pasajes por articulo, 4.000 caracteres por turno). Los titulos de noticias llevan la marca "(news; dated no later than <crawl month>)".

## Capacidades

- Generacion de texto conversacional en ingles con formato de agente de busqueda.
- Razonamiento multi-turno con alternancia de bloques `<think>`, `<search>`, `<information>` y `<answer>`.
- Busqueda retrieval-augmented sobre un corpus temporalmente congelado.
- Atribucion de evidencia mediante etiquetas: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]`.
- Identificacion explicita del ano al que se refiere la pregunta en el primer turno de pensamiento.
- Declaracion del ultimo ano cubierto por la evidencia en el turno final.
- Razonamiento sobre incertidumbre temporal (distinguir lo no cognoscible aun de lo simplemente no soportado).
- Soporte de tool calling limitado al formato `<search>` propio del agente.
- Capacidades multilingues: solo ingles.
- No dispone de vision, audio ni modo thinking extendido fuera del formato descrito.

## Casos de uso

- Evaluacion de forecasting y calibracion temporal: el modelo permite medir si un agente responde con evidencia disponible en enero de 2015 o si alucina eventos posteriores, usando la etiqueta `[FORECASTING]` para marcar preguntas no cognoscibles aun.
- Investigacion sobre fuga de informacion en LLMs: sirve como referencia controlada para comparar con modelos sin cutoff, aislando el efecto de conocimiento posterior en tareas de QA y busqueda.
- Benchmarking de agentes de busqueda: su formato estructurado de turnos (maximo 8 en evaluacion, T=0.8, top-p 0.95) facilita la comparacion reproducible entre agentes con retrieval.
- Analisis de atribucion de evidencia: las etiquetas `[SUPPORTED]` y `[PREMISES_ONLY]` permiten auditar si una respuesta se apoya en pasajes recuperados o solo en premisas implicitas.
- Estudio de sesgos temporales en corpus: al fijar el corpus a una fecha, se pueden analizar sesgos de cobertura y representacion en Wikipedia y CC-News de 2015.
- Simulacion de asistentes con conocimiento historico: util para prototipos que deben responder como lo haria un sistema de 2015, por ejemplo en docencia o divulgacion historica.
- Validacion de pipelines de retrieval: el indice faiss y el esquema de embeddings (`BAAI/bge-base-en-v1.5`) sirven como referencia para probar configuraciones alternativas de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 8-10 GB para contexto corto y 12-16 GB para contextos cercanos a 8.192 tokens.
- Cuantizacion: no se documentan tipos soportados; al ser safetensors y requerir `trust_remote_code=True`, la conversion a GGUF o GPTQ no esta garantizada sin trabajo adicional.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en precision completa; RTX 3090 o 4080 podrian ser suficientes con contexto reducido.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM en bfloat16 con contexto moderado; en 8 GB requeriria cuantizacion no documentada.
- Opciones de despliegue: transformers con `trust_remote_code=True` (unica via documentada); vLLM, llama.cpp, Ollama o TGI no estan verificados en la informacion disponible.
- Latencia y throughput: no disponibles. La busqueda se ejecuta en CPU con faiss (OPQ64, IVF32768, PQ64) y rerank exacto de 400 candidatos, lo que anade latencia por turno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2015-01 SFT | 2,80 B | 8.192 | Agente de busqueda con cutoff temporal | other | HuggingFace (0 descargas) |
| Chrononauts 3B 2015-01 init | no disponible | no disponible | Modelo inicial del mismo cutoff | other | HuggingFace (repo hermano) |
| Chrononauts 3B 2015-01 agent | no disponible | no disponible | Etapa posterior de agente | other | HuggingFace (repo hermano) |
| Alternativas generalistas de ~3B | no disponible | no disponible | LLM generalista sin cutoff | variable | no disponible |

No se dispone de datos de rendimiento para comparar con modelos de la misma categoria fuera de la propia suite Chrononauts.

## Limitaciones y advertencias

- Conocimiento limitado a enero de 2015: cualquier pregunta sobre eventos posteriores no puede responderse con evidencia y deberia etiquetarse como `[FORECASTING]` o `[INSUFFICIENT]`.
- Solo ingles: no soporta otros idiomas.
- Licencia "other": es imprescindible revisar los terminos del autor antes de cualquier uso comercial; no se especifican restricciones concretas.
- Riesgo de alucinacion: aunque el entrenamiento incluye filtros anti-fuga, el modelo puede generar afirmaciones no soportadas por el corpus; las etiquetas de evidencia ayudan a detectarlo pero no lo eliminan.
- Dependencia del corpus de recuperacion: el rendimiento esta ligado al indice faiss y al esquema de embeddings descritos; cambios en el retrieval alteran el comportamiento.
- Requiere `trust_remote_code=True`: ejecuta codigo personalizado (`modeling_open_lm_hf.py`), lo que implica riesgos de seguridad y compatibilidad con versiones futuras de transformers.
- Ventana de contexto limitada a 8.192 tokens, inferior a la de modelos contemporaneos de mayor tamano.
- Sin datos publicos de benchmarks: no es posible validar su calidad frente a alternativas sin evaluacion propia.
- Proyecto de investigacion con paper en preparacion: la API, el formato y los repositorios pueden cambiar.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de usuarios muy reducido y poca validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/mattwang123/chrononauts-3b-2015-01-sft
- Repo inicial: https://huggingface.co/mattwang123/chrononauts-3b-2015-01-init
- Repo agente: https://huggingface.co/mattwang123/chrononauts-3b-2015-01-agent
- Embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparacion (Chrononauts, Johns Hopkins University y Apple); no disponible enlace publico.
