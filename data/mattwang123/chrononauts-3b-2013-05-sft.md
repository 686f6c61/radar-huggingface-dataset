# mattwang123/chrononauts-3b-2013-05-sft

## Resumen

Chrononauts 3B (cutoff 2013-05, etapa SFT) es un agente de busqueda temporalmente bloqueado desarrollado por mattwang123 en el marco de un proyecto de investigacion conjunto entre Johns Hopkins University y Apple. Forma parte de una suite de siete agentes congelados en fechas distintas (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07), en la que tanto los datos de preentrenamiento (TiC-LM) como los de post-entrenamiento y el corpus de recuperacion se detienen en la fecha de corte. El modelo nunca ha visto informacion posterior a mayo de 2013, lo que lo convierte en una herramienta de investigacion para estudiar el conocimiento temporal, la fidelidad de la recuperacion y el razonamiento sobre evidencia historica.

Este repositorio concreto corresponde a la etapa de ajuste supervisado (SFT) del agente de busqueda para el corte 2013-05. Se inicializa a partir del modelo `-init` del mismo corte y se entrena sobre trazas de busqueda generadas por un profesor (gpt-oss-120b) que solo consulto el corpus congelado en esa fecha. El modelo alterna turnos de razonamiento (`<think>`), consultas de busqueda (`<search>`) y lectura de resultados (`<information>`), y termina emitiendo una respuesta con etiqueta de evidencia.

Con 2.796.096.000 parametros y una ventana de contexto de hasta 8.192 tokens, el modelo se distribuye en formato safetensors con pesos en bfloat16 y requiere `trust_remote_code=True` por el uso de una implementacion especifica de OpenLM con QK-norm. Es un modelo de nicho, orientado a investigacion sobre agentes de recuperacion aumentada y evaluacion temporal, no a produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TiC-LM, basado en OpenLM) con LayerNorm y QK-norm |
| Parametros totales | 2.796.096.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | other (licencia personalizada, no estandar; consultar terminos del autor) |
| Formato de pesos | safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only derivada de OpenLM (denominada TiC-LM en el proyecto), con LayerNorm y QK-norm, lo que obliga a cargar el codigo remoto (`modeling_open_lm_hf.py`) mediante `trust_remote_code=True`. El preentrenamiento se realizo sobre TiC-LM, un corpus cortado en la fecha de referencia. La etapa SFT parte del modelo `-init` del mismo corte y se entrena sobre trazas de busqueda escritas por un profesor (gpt-oss-120b) que operaba exclusivamente sobre el corpus congelado en 2013-05.

El control de fuga de informacion es un componente central del diseno: todo el texto de post-entrenamiento paso tres filtros (construccion solo con instantaneas anteriores al corte, ausencia de anos posteriores al corte y un juez LLM de fuga con comprobacion de hechos plantados, detectando al menos 36 de 40 hechos post-corte inyectados). Los conjuntos de entrenamiento y evaluacion no se solapan. El agente opera en episodios de hasta 8 turnos con temperatura 0,8 y top-p 0,95 durante la evaluacion, alternando razonamiento, consultas y lectura de evidencia hasta emitir una etiqueta final (`[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]`, `[FORECASTING]`).

## Capacidades

- Generacion de texto y razonamiento en ingles con modo de pensamiento explicito mediante `<think> ... </think>`.
- Busqueda agentica: emite consultas en `<search> query </search>` y procesa resultados en `<information> ... </information>`.
- Razonamiento multi-turno de hasta 8 turnos por episodio, con planificacion de consultas sucesivas.
- Etiquetado de evidencia: distingue entre soportado, solo premisas, insuficiente y no cognoscible aun (pronostico).
- Conciencia temporal: el prompt declara la fecha actual y el modelo razona sobre el ano al que se refiere la pregunta y el ultimo ano cubierto por la evidencia.
- Recuperacion aumentada sobre un corpus congelado (Wikipedia en ingles reconstruida por corte y lotes de CC-News anteriores a la fecha).
- Capacidad conversacional basica (tag `conversational`) y de extraccion de caracteristicas (tag `feature-extraction`).
- Soporte de tool calling limitado al esquema propio de busqueda; no se documenta function calling generico.
- Capacidades multilingues: solo ingles.
- Sin soporte documentado de vision ni audio.

## Casos de uso

- Investigacion sobre conocimiento temporal: permite estudiar que sabe un modelo sobre el mundo en una fecha concreta y como cambia su respuesta al variar el corte, comparando los siete modelos de la suite.
- Evaluacion de agentes de recuperacion aumentada: sirve como banco de pruebas controlado donde el corpus y el conocimiento estan alineados temporalmente, eliminando fugas de informacion posterior.
- Analisis de fidelidad de evidencia: el etiquetado `[SUPPORTED]`/`[INSUFFICIENT]`/`[FORECASTING]` permite medir la calibracion del modelo al distinguir lo verificable de lo no cognoscible.
- Preguntas historicas con fecha de corte: util para responder consultas sobre eventos hasta mayo de 2013 usando exclusivamente fuentes de la epoca, util en estudios de historia digital y periodismo de archivo.
- Deteccion de anacronismos: al no haber visto informacion posterior, el modelo puede emplearse para identificar afirmaciones que presuponen conocimiento imposible en una fecha dada.
- Experimentos de destilacion de trazas de busqueda: las trazas SFT generadas por un profesor permiten estudiar como un modelo pequeno (2,8B) imita estrategias de busqueda de uno grande.
- Benchmarking de robustez temporal en pipelines de RAG: integrable en entornos de evaluacion para comparar estrategias de recuperacion con un agente fijo y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un paper en preparacion (Chrononauts, Johns Hopkins University y Apple) pero no incluye cifras de MMLU, HumanEval, GSM8K ni metricas de recuperacion.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica, entre 8 y 12 GB para contextos moderados.
- Cuantizacion: no se documentan variantes GGUF, AWQ ni GPTQ; al no haberlas, el despliegue en cuantizacion de 4 bits requeriria conversion manual.
- GPU recomendadas: A100, H100 o L40S para evaluacion a gran escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bfloat16; con 8 GB seria necesario convertir a cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada; vLLM, TGI, llama.cpp u Ollama no estan confirmados por el autor y requeririan adaptar el codigo de OpenLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B (2013-05 SFT) | 2,8B | 8.192 | Agente de busqueda con corte temporal | other | Hugging Face |
| Qwen2.5-3B-Instruct | 3,1B | 32.768 | Instruccion general | Apache 2.0 | Hugging Face |
| Llama 3.2-3B-Instruct | 3,2B | 128.000 | Instruccion general | Llama 3.2 Community | Hugging Face |
| Phi-3.5-mini-instruct | 3,8B | 128.000 | Instruccion general | MIT | Hugging Face |

La comparacion directa es limitada: Chrononauts no es un modelo de instruccion general, sino un agente especializado en recuperacion con conocimiento temporalmente bloqueado. Los modelos de la tabla ofrecen ventanas de contexto mucho mayores y licencias mas permisivas, pero carecen de la garantia de no haber visto informacion posterior a una fecha. No se dispone de benchmarks comparativos publicados para cuantificar la diferencia de rendimiento.

## Limitaciones y advertencias

- Conocimiento deliberadamente limitado: el modelo no conoce ningun hecho posterior a mayo de 2013, por lo que respondera de forma incompleta o incorrecta a preguntas sobre eventos posteriores.
- Solo ingles: no soporta otros idiomas de forma fiable.
- Dependencia del corpus congelado: su rendimiento esta ligado al indice faiss y al corpus especifico del corte; fuera de ese entorno las respuestas pueden degradarse.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar hechos o citar evidencia inexistente, especialmente cuando la recuperacion no devuelve pasajes relevantes.
- Licencia "other": no es una licencia estandar; es imprescindible revisar los terminos del autor antes de cualquier uso comercial o redistribucion.
- Requiere `trust_remote_code=True`: implica ejecutar codigo del autor, con el riesgo de seguridad asociado.
- Contexto limitado a 8.192 tokens, inferior al de modelos contemporaneos de tamano similar.
- Sin benchmarks publicados ni validacion independiente conocida; el paper esta en preparacion.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni comunidad de soporte.
- Sesgos: no se documentan analisis de sesgo; al entrenarse sobre Wikipedia y CC-News hasta 2013, hereda los sesgos de esas fuentes y de esa epoca.

## Enlaces

- Hugging Face: https://huggingface.co/mattwang123/chrononauts-3b-2013-05-sft
- Repositorio hermano (init): https://huggingface.co/mattwang123/chrononauts-3b-2013-05-init
- Repositorio hermano (agent): https://huggingface.co/mattwang123/chrononauts-3b-2013-05-agent
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparacion (Chrononauts, Johns Hopkins University y Apple); no disponible enlace publico.
