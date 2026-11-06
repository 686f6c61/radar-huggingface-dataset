# mattwang123/chrononauts-3b-2017-01-agent

## Resumen

Chrononauts 3B, cutoff 2017-01, stage agent es la variante final de un agente de busqueda temporal desarrollado por mattwang123 (con vinculacion a Johns Hopkins University y Apple segun la model card). Forma parte de la suite Chrononauts, un conjunto de agentes de busqueda congelados en siete fechas (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07): para cada fecha, los datos de preentrenamiento (TiC-LM), los datos de post-entrenamiento y el corpus de recuperacion se detienen en esa fecha, de modo que el modelo no ha visto nada posterior.

Este repositorio concreto corresponde al cutoff 2017-01 y a la etapa agent: es el modelo `-sft` del mismo cutoff entrenado adicionalmente con aprendizaje por refuerzo GRPO con busqueda en vivo, con credito a nivel de span para respuesta, etiqueta de evidencia, ano de la pregunta y recuperacion. El modelo resuelve el problema de evaluar agentes de busqueda sin contaminacion temporal: al no conocer hechos posteriores a enero de 2017, permite medir si el agente realmente recupera evidencia o si se apoya en conocimiento parametrico filtrado.

Tecnicamente es un modelo de ~2.796 millones de parametros (2,8B) con arquitectura OpenLM (TiC-LM) y ventana de contexto util de hasta 8.192 tokens (RoPE base 48.000). Se distribuye en safetensors (5,6 GB de repo) bajo licencia "other" y solo soporta ingles. Su relevancia actual es metodologica: ofrece un banco de pruebas controlado para estudiar alucinacion temporal, calibracion de "no conocible aun" y fidelidad a la evidencia en agentes RAG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OpenLM (TiC-LM) con LayerNorm con QK-norm (`modeling_open_lm_hf.py`) |
| Parametros totales | 2.796.096.000 (~2,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | other |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en OpenLM/TiC-LM, con una modificacion relevante: LayerNorm con QK-norm implementada en `modeling_open_lm_hf.py`, lo que obliga a cargarlo con `trust_remote_code=True`. El contexto maximo practico es de 8.192 tokens con RoPE base 48.000. Los parametros reales declarados en safetensors son 2.796.096.000.

El entrenamiento sigue tres etapas encadenadas: preentrenamiento sobre TiC-LM con datos detenidos en 2017-01, post-entrenamiento supervisado (etapa `-sft`) y, finalmente, GRPO con busqueda en vivo (esta etapa `-agent`). El GRPO otorga credito a nivel de span sobre cuatro dimensiones: respuesta, etiqueta de evidencia, ano de la pregunta y calidad de la recuperacion. Todo el texto de post-entrenamiento paso tres filtros de fuga: construccion solo con snapshots previos al cutoff, prohibicion de anos posteriores al cutoff y un juez LLM de fuga con comprobacion de hechos plantados (al menos 36/40 hechos post-cutoff plantados detectados). Los conjuntos de entrenamiento y evaluacion no se solapan. El corpus de recuperacion se reconstruye por cutoff: Wikipedia en ingles reconstruida desde el historial completo de revisiones (ultima revision de cada pagina en o antes del cutoff) mas lotes de CC-News rastreados antes del cutoff, embebidos con `BAAI/bge-base-en-v1.5` e indexados con faiss en CPU (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos; top-5, maximo 2 pasajes por articulo, 4.000 caracteres por turno).

## Capacidades

- Generacion de texto y razonamiento multi-hop en ingles con modo de pensamiento explicito: alterna `<think> ... </think>` y `<search> query </search>`, recibe resultados en `<information> ... </information>` y emite `<answer> ... </answer>`.
- Busqueda agentica iterativa: hasta 8 turnos de busqueda en la evaluacion oficial (T=0.8, top-p 0.95).
- Etiquetado de evidencia: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` (no conocible aun).
- Conciencia temporal explicita: el prompt declara la fecha actual ("Assume today is YYYY-MM-DD.") y el primer turno de pensamiento identifica el ano al que se refiere la pregunta.
- Declaracion del ano mas reciente cubierto por la evidencia en el turno final.
- Recuperacion aumentada sobre un corpus congelado al cutoff del modelo.
- No dispone de tool calling generico, vision, audio ni capacidades multimodales segun la informacion disponible.
- Multilingue: no; solo ingles.

## Casos de uso

- Evaluacion de contaminacion temporal en agentes RAG: usar el modelo como referencia "limpia" para medir cuanto de la respuesta de un agente moderno proviene de conocimiento parametrico filtrado frente a evidencia recuperada, comparando con los otros seis cutoffs de la suite.
- Investigacion sobre alucinacion temporal: analizar la tasa de etiquetas `[FORECASTING]` e `[INSUFFICIENT]` en preguntas posteriores a 2017-01 (32,7% de los items post-cutoff etiquetados como insuficientes o no conocibles) como metrica de calibracion.
- Banco de pruebas de pipelines de recuperacion: sustituir el indice faiss de referencia por otro motor (por ejemplo, busqueda hibrida o reranking neuronal) y medir el impacto en la precision del agente manteniendo el corpus congelado.
- Analisis de fidelidad a la evidencia: estudiar si el modelo cita y etiqueta correctamente pasajes en tareas multi-hop, gracias a la etiqueta de evidencia y al ano declarado en cada episodio.
- Experimentos de RL para agentes de busqueda: reproducir o extender el entrenamiento GRPO con credito a nivel de span sobre las etapas `-init` y `-sft` publicadas como repos hermanos.
- Docencia y divulgacion sobre corte de conocimiento: demostrar de forma reproducible que un modelo con cutoff 2017-01 no puede responder sobre eventos posteriores, con un corpus y una fecha de referencia auditables.
- Estudio de sesgos de corpus historico: analizar como la cobertura de Wikipedia y CC-News hasta 2017-01 condiciona las respuestas del agente en dominios concretos (politica, ciencia, deportes).

## Benchmarks y rendimiento

Evaluacion en el conjunto de test multi-hop retenido, splits oficiales, T=0.8:

| Metrica | Valor |
|---|---|
| Accuracy global | 30,4 |
| Accuracy en items anteriores al cutoff | 33,5 |
| Accuracy en items posteriores al cutoff | 12,3 |
| Items post-cutoff etiquetados como insuficientes / no conocibles | 32,7% |
| Items pre-cutoff etiquetados de ese modo | 6,2% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos (2,8B parametros), mas activaciones y cache KV; en la practica, entre 8 y 12 GB para contextos moderados.
- Cuantizacion: no se documentan tipos soportados; al requerir `trust_remote_code=True` y codigo custom de OpenLM, la conversion a GGUF o GPTQ no esta garantizada sin trabajo adicional.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion a gran escala con lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia individual en bfloat16.
- Cabe en GPU de consumo: si, en tarjetas de 12-24 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) para una sola conversacion; en 8 GB requeriria cuantizacion no documentada.
- Despliegue: transformers con `trust_remote_code=True` y `torch_dtype="bfloat16"` es la via soportada. vLLM, TGI, llama.cpp y Ollama no estan confirmados para esta arquitectura custom.
- El indice de recuperacion (faiss OPQ64,IVF32768,PQ64 con rerank exacto de 400 candidatos) se ejecuta en CPU, por lo que no consume VRAM adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2017-01 agent | ~2,8B | 8.192 tokens | Agente de busqueda congelado a 2017-01, GRPO con busqueda en vivo | other | Hugging Face (repo propio) |
| Chrononauts 3B 2017-01 sft | ~2,8B (misma base) | 8.192 tokens | Misma base, solo SFT, sin RL | other | Hugging Face (repo hermano) |
| Chrononauts 3B 2017-01 init | ~2,8B (misma base) | 8.192 tokens | Solo preentrenamiento congelado a 2017-01 | other | Hugging Face (repo hermano) |
| Otros cutoffs de la suite Chrononauts | ~2,8B (misma base) | 8.192 tokens | Mismo diseno, fechas 2013-05 a 2024-07 | other | Hugging Face (repos de la suite) |

No se dispone de comparativas con modelos de proposito general de tamano similar (por ejemplo, Llama 3.2 3B o Qwen2.5 3B) en la informacion proporcionada; la comparacion relevante es interna a la suite Chrononauts, que comparte arquitectura y corpus pero difiere en fecha de corte y etapa de entrenamiento.

## Limitaciones y advertencias

- Precision baja por diseno: 30,4 de accuracy global y 12,3 en items posteriores al cutoff. No es un modelo para produccion generalista.
- Conocimiento congelado a enero de 2017: no conoce ni puede recuperar evidencia sobre eventos posteriores; etiquetara muchas preguntas como `[FORECASTING]` o `[INSUFFICIENT]`.
- Solo ingles; sin soporte multilingue declarado.
- Licencia "other": las condiciones exactas de uso comercial no estan detalladas en la informacion disponible; debe revisarse antes de cualquier despliegue productivo.
- Requiere `trust_remote_code=True` por el codigo custom de OpenLM (LayerNorm con QK-norm), lo que implica ejecutar codigo del repositorio y complica la integracion con runtimes estandar (vLLM, TGI, llama.cpp).
- Dependencia de un corpus y un indice concretos (Wikipedia reconstruida por cutoff + CC-News, embeddings `BAAI/bge-base-en-v1.5`, faiss en CPU): cambiar el corpus altera el comportamiento y la evaluacion.
- Riesgo de alucinacion dentro del periodo cubierto: la accuracy pre-cutoff es 33,5, por lo que incluso con evidencia disponible el agente falla con frecuencia en preguntas multi-hop.
- Sesgos derivados de la cobertura de Wikipedia y CC-News hasta 2017-01: infrarrepresentacion de temas y geografias con poca cobertura mediatica o enciclopedica en esa ventana.
- Sin datos publicados sobre cuantizacion, latencia o throughput; el rendimiento en produccion no esta caracterizado.
- Paper en preparacion (Chrononauts, Johns Hopkins University y Apple): los detalles metodologicos completos aun no estan disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattwang123/chrononauts-3b-2017-01-agent
- Repo hermano (init): https://huggingface.co/mattwang123/chrononauts-3b-2017-01-init
- Repo hermano (sft): https://huggingface.co/mattwang123/chrononauts-3b-2017-01-sft
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparacion (Chrononauts, Johns Hopkins University y Apple); no disponible enlace publico.
