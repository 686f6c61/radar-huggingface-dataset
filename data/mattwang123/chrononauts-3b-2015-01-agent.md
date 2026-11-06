# mattwang123/chrononauts-3b-2015-01-agent

## Resumen

Chrononauts 3B, cutoff 2015-01, stage agent es un modelo de lenguaje de 2.796 millones de parametros desarrollado por mattwang123 (con vinculacion a Johns Hopkins University y Apple segun la model card) dentro de la suite Chrononauts. La suite entrena agentes de busqueda congelados en siete fechas distintas (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07), de modo que tanto los datos de preentrenamiento (TiC-LM) como los de post-entrenamiento y el corpus de recuperacion se detienen en la fecha de corte. Este repositorio concreto corresponde a la etapa final de agente para el corte de enero de 2015.

El modelo resuelve un problema de evaluacion concreto: medir la capacidad de un agente de busqueda sin contaminacion por conocimiento posterior a una fecha. Al no haber visto nunca eventos posteriores a 2015-01, el modelo no puede "hacer trampa" respondiendo de memoria y se ve obligado a recuperar evidencia del corpus congelado. Es relevante para investigadores que estudian retrieval-augmented generation, honestidad epistémica y calibracion temporal, ya que el modelo aprende a etiquetar explicitamente las preguntas que no puede responder por ser posteriores a su corte.

Arquitectura basada en OpenLM (TiC-LM) con LayerNorm y QK-norm, contexto de hasta 8.192 tokens (RoPE base 48.000), pesos en safetensors y licencia "other". El modelo alterna turnos de razonamiento, busqueda y respuesta en un formato de episodio estructurado, y esta entrenado con GRPO sobre busqueda en vivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OpenLM / TiC-LM) con LayerNorm y QK-norm |
| Parametros totales | 2.796.096.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | other |
| Formato de pesos | safetensors (transformers, requiere trust_remote_code=True) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OpenLM, concretamente TiC-LM, que emplea LayerNorm con QK-norm en el modulo `modeling_open_lm_hf.py`. El contexto maximo es de 8.192 tokens con RoPE base 48.000. El preentrenamiento se realizo sobre TiC-LM, un corpus congelado en enero de 2015, lo que implica que el modelo no ha visto texto posterior a esa fecha.

El post-entrenamiento pasa por tres etapas: un modelo `-init`, un modelo `-sft` y este modelo `-agent`, que aplica GRPO (Group Relative Policy Optimization) con busqueda en vivo. La recompensa se reparte a nivel de span entre la respuesta, la etiqueta de evidencia, el ano de la pregunta y la recuperacion. Todos los textos de post-entrenamiento pasaron tres filtros de control de fuga: construccion solo con snapshots anteriores al corte, ausencia de anos posteriores al corte y un juez LLM de fuga con verificacion de hechos plantados (al menos 36 de 40 hechos post-corte plantados detectados). Los conjuntos de entrenamiento y evaluacion no se solapan.

## Capacidades

- Generacion de texto y razonamiento multi-turno en formato de episodio estructurado.
- Busqueda agentica: alterna bloques `<think> ... </think>` y `<search> query </search>`, recibiendo resultados en `<information> ... </information>`.
- Emision de etiquetas de evidencia: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` (no conocible aun).
- Declaracion explicita del ano de la pregunta en el primer turno de pensamiento y del ano mas reciente cubierto por la evidencia en el turno final.
- Respuesta final en bloque `<answer> ... </answer>`.
- Razonamiento multi-hop sobre un corpus congelado (Wikipedia en ingles y CC-News anteriores al corte).
- Capacidad de abstenerse ante preguntas posteriores a su fecha de corte, etiquetandolas como no conocibles.
- Sin soporte declarado de vision, audio ni tool calling generico fuera del protocolo de busqueda.

## Casos de uso

- Investigacion sobre contaminacion temporal: permite evaluar agentes de busqueda sin que el modelo haya visto eventos posteriores al corte, aislando el efecto de la recuperacion frente al conocimiento parametrico. Es adecuado porque su preentrenamiento y corpus se detienen en 2015-01.
- Evaluacion de honestidad epistémica: el modelo emite etiquetas `[INSUFFICIENT]` y `[FORECASTING]` ante preguntas no respondibles, lo que permite medir la calibracion de la abtencion en sistemas RAG.
- Benchmarking de pipelines de recuperacion: al estar disenado para un corpus concreto (Wikipedia reconstruida por revision y CC-News), sirve para comparar indices faiss (OPQ64, IVF32768, PQ64) y estrategias de rerank sobre una linea base fija.
- Estudio de razonamiento multi-hop: con hasta 8 turnos de busqueda y 4.000 caracteres por turno, permite analizar como un agente de 3B descompone preguntas que requieren encadenar evidencia de varios articulos.
- Analisis de atribucion de evidencia: la recompensa a nivel de span sobre la etiqueta de evidencia hace del modelo un sujeto de estudio para tecnicas de credit assignment en RL con busqueda.
- Educacion y demostraciones sobre sesgo temporal: util para mostrar de forma tangible como un modelo sin conocimiento posterior a una fecha responde "no lo se" en lugar de alucinar, con fines divulgativos o docentes.
- Reproducibilidad de experimentos con fechas de corte: al existir siete variantes de la suite, permite comparar el mismo agente en distintos cortes temporales manteniendo el resto del pipeline.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de test multi-hop retenido (splits oficiales, T=0.8):

| Metrica | Valor |
|---|---|
| Precision global | 26,4 |
| Precision en items anteriores al corte | 28,8 |
| Precision en items posteriores al corte | 13,8 |
| Items post-corte etiquetados como insuficiente / no conocible | 19,2 % |
| Items pre-corte etiquetados como insuficiente / no conocible | 5,2 % |

La model card senala que la baja precision y la frecuencia elevada de etiquetas "no conocible aun" tras el corte son el comportamiento previsto: el modelo carece de conocimiento y de evidencia sobre eventos posteriores a 2015-01. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 8-10 GB para contexto corto y mas para los 8.192 tokens completos.
- Cuantizacion: no se documentan tipos de cuantizacion soportados; al requerir `trust_remote_code=True` y codigo custom, la conversion a GGUF no esta garantizada.
- GPU recomendadas: A100, H100 o L40S para evaluacion a contexto completo; RTX 4090 (24 GB) para inferencia en bfloat16 con margen amplio.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bfloat16 para contextos moderados; en 8 GB requeriria cuantizacion no documentada.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `trust_remote_code=True`; vLLM, llama.cpp, Ollama y TGI no estan confirmados para esta arquitectura custom.
- Latencia y throughput: no disponibles. La evaluacion uso hasta 8 turnos con T=0.8 y top-p 0.95, lo que implica multiples llamadas al modelo y a la busqueda por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2015-01 agent | 2,80 B | 8.192 | Agente de busqueda congelado en fecha, GRPO | other | HuggingFace |
| Chrononauts 3B 2015-01 sft | 2,80 B | 8.192 | Etapa SFT previa, mismo corte | other | HuggingFace |
| Chrononauts 3B 2015-01 init | 2,80 B | 8.192 | Modelo inicial, mismo corte | other | HuggingFace |

No se dispone de datos de benchmarks comparables con modelos de la misma categoria fuera de la suite Chrononauts en la informacion proporcionada. La comparacion mas directa es con las otras etapas del mismo corte, que comparten arquitectura y corpus pero difieren en el post-entrenamiento.

## Limitaciones y advertencias

- Precision baja por diseno: 26,4 de precision global en el test multi-hop; no es un modelo para uso general en produccion.
- Conocimiento congelado: no conoce nada posterior a enero de 2015 y responde con etiquetas de insuficiencia ante eventos posteriores.
- Solo ingles: el corpus y el entrenamiento estan en ingles.
- Licencia "other": las condiciones exactas de uso comercial no estan detalladas en la informacion disponible; es necesario consultar el repositorio antes de cualquier uso comercial.
- Requiere `trust_remote_code=True` por el codigo custom de TiC-LM (LayerNorm con QK-norm), lo que implica ejecutar codigo del autor.
- Dependencia del corpus especifico: el modelo esta disenado para buscar en el corpus congelado (Wikipedia reconstruida y CC-News) con el indice faiss descrito; usarlo con otro corpus degrada su comportamiento.
- Riesgo de alucinacion: aunque entrenado para etiquetar evidencia insuficiente, sigue siendo un modelo de 3B y puede generar afirmaciones no respaldadas por el contexto recuperado.
- Sin soporte documentado de cuantizacion ni de frameworks de despliegue estandar (vLLM, TGI, llama.cpp), lo que limita opciones de produccion.
- Modelo de investigacion: cero descargas y cero likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/mattwang123/chrononauts-3b-2015-01-agent
- Repo etapa init: https://huggingface.co/mattwang123/chrononauts-3b-2015-01-init
- Repo etapa sft: https://huggingface.co/mattwang123/chrononauts-3b-2015-01-sft
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparacion (Chrononauts, Johns Hopkins University y Apple); no disponible enlace publico en la informacion proporcionada.
