# code-and-canvas/Spark-X2.6-4B-MLX-oQ6e-fp16

## Resumen

Spark-X2.6-4B-MLX-oQ6e-fp16 es una cuantizacion de precision mixta del modelo XHToken/Spark-X2.6-4B, publicada por code-and-canvas y optimizada para inferencia local en Apple Silicon mediante el runtime oMLX. El modelo base es un transformer causal de 4.112.079.360 parametros con arquitectura `Spark2_5ForCausalLM` de 36 capas y tamano oculto de 2.560, distribuido bajo licencia Apache-2.0 y entrenado principalmente en ingles y chino.

La relevancia de esta publicacion no reside en el modelo base sino en el proceso de cuantizacion: un esquema afino de 6 bits con grupo de 64 elementos, complementado con 32 tensores seleccionados que se mantienen en 8 bits para proteger las capas mas sensibles (primera capa, proyecciones `g_proj` y proyecciones MLP de determinadas capas). El resultado ocupa 3,2 GiB en disco y esta pensado para ejecutarse en equipos con 16 GB de memoria unificada, como un MacBook Air M2.

El autor lo presenta explicitamente como modelo de drafting (borrador) para un agente en produccion, no como sustituto de modelos mayores en razonamiento complejo. La ventana de contexto configurada es de 65.536 tokens, aunque las pruebas publicadas solo llegan a unos 39.500 tokens de prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Spark2_5ForCausalLM` (transformer causal, 36 capas, hidden size 2.560) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens configurados; maximo evaluado ~39.500 tokens |
| Tipos de cuantizacion | Base afino de 6 bits (group size 64) + 32 tensores a 8 bits; KV cache fp16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), repo de 3,5 GB, pesos en disco 3,2 GiB |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso (`Spark2_5ForCausalLM`) de 36 capas con dimension oculta de 2.560, derivado de XHToken/Spark-X2.6-4B, cuyo checkpoint base es XHToken/Spark-X2.6-4B-Base. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original; la model card de esta cuantizacion no los detalla.

La contribucion tecnica de este repositorio es el pipeline de cuantizacion oQ de oMLX. Se aplica una cuantizacion afina de 6 bits con grupo de 64, calibrada con la matriz de importancia `oqe_code_multilingual` (1.024 muestras de 512 tokens cada una), la misma usada en la variante de 8 bits. Sobre esa base se elevan a 8 bits 32 tensores criticos: la primera capa y las proyecciones de atencion y MLP seleccionadas, incluyendo `g_proj`. El sufijo `fp16` hace referencia al tipo de la cache KV, no a los pesos. El `config.json` omite deliberadamente `auto_map`, por lo que Transformers no puede cargar los pesos mediante codigo remoto: se requiere una build de oMLX con soporte nativo de Spark 2.5 o un runtime MLX que implemente `spark2_5`.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Asistencia en programacion: el autor reporta resultados en tareas de parsing estricto, fusion de intervalos y quicksort.
- Razonamiento de tipo "thinking" configurable mediante `chat_template_kwargs` (`enable_thinking`), aunque el autor recomienda desactivarlo para salida estructurada y tool calls.
- Uso de herramientas (tool use): el flujo de "on-call" obtiene 5/5 en la evaluacion local.
- Sintesis de investigacion y redaccion de prosa (posts de lanzamiento).
- Flujos agenticos de borrador y reescritura con revision humana.
- Servidor compatible con la API de OpenAI a traves de `omlx serve`, lo que facilita la integracion con clientes existentes.
- Soporte de prefix cache para prompts largos (mejora la latencia en contextos extensos).

## Casos de uso

- Borrador de codigo en local sobre Apple Silicon: el modelo puede generar y revisar fragmentos de codigo en un MacBook Air M2 de 16 GB, con un footprint de 3,2 GiB que deja margen para el resto del sistema. Adecuado para tareas de duracion corta con revision humana.
- Agente de drafting en pipelines internos: el autor lo usa como modelo de borrador para un agente; su bajo consumo permite mantenerlo cargado junto a otras herramientas en la misma maquina.
- Atencion al cliente o asistentes conversacionales multirritmo: con 65.536 tokens de contexto configurados y prefix cache, puede gestionar conversaciones multi-turno largas, aunque la latencia de prefill crece con el prompt.
- Procesamiento de datos sensibles sin salida a la nube: al ejecutarse integramente en local, encaja en escenarios donde la informacion no puede abandonar el dispositivo.
- Tool calling en flujos de operaciones (on-call): el autor valida un flujo de 5 pasos con exito; util para automatizar diagnosticos y acciones acotadas con validacion posterior.
- Resumen y sintesis de documentos en ingles o chino: la evaluacion de "research synthesis" obtiene 18/20, lo que sugiere utilidad para condensar material de investigacion con supervision.
- Reescritura y generacion de prosa de marketing o lanzamiento: la prueba de "prose launch post" alcanza 17/20, adecuada para borradores que un humano pule.

## Benchmarks y rendimiento

Resultados locales medidos por el autor en un MacBook Air M2 de 16 GB con oMLX 0.7.2, KV en fp16, prefix cache activada y 64 tokens de salida por generacion. No son comparables con otras maquinas.

| Suite | Resultado |
|---|---|
| Codigo: parser estricto de duracion | 12 / 21 |
| Codigo: fusion de intervalos | 8 / 8 |
| Razonamiento + codigo: quicksort | 0 / 8 con thinking alto (bucle de presupuesto); 8 / 8 con thinking desactivado en 13,2 s |
| Sintesis de investigacion | 18 / 20 |
| Prosa: post de lanzamiento | 17 / 20 |
| Uso de herramientas: flujo on-call | 5 / 5 |

Throughput de generacion:

| Tamano de prompt | Throughput |
|---|---:|
| Corto (68 tokens) | 22,02 tok/s |
| ~1,3k tokens | 21,11 tok/s |
| ~19,8k tokens | 14,72 tok/s |
| ~39,5k tokens | 14,53 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La ventana completa de 65.536 tokens no fue evaluada.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 3,2 GiB de pesos en disco; el autor lo ejecuta en un equipo de 16 GB de memoria unificada con margen para el sistema.
- GPU recomendadas: Apple Silicon (el autor cita un M2 Air de 16 GB); no se documentan pruebas en GPU NVIDIA ni AMD.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con al menos 16 GB de memoria unificada segun la evidencia del autor; no hay datos para GPUs de consumo NVIDIA.
- Opciones de despliegue: oMLX (`omlx serve`, servidor compatible con la API de OpenAI) o cualquier runtime MLX que implemente `spark2_5`. Transformers no puede cargar los pesos por la omision de `auto_map`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 22,02 tok/s con prompt corto, degradando a ~14,5 tok/s con prompts de ~39,5k tokens. La latencia de prefill en prompts largos es el principal cuello de botella en el equipo de 16 GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar del modelo base ni de sus alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|
| Spark-X2.6-4B-MLX-oQ6e-fp16 (esta ficha) | 4,11B | 65.536 config.; ~39,5k evaluado | Apache-2.0 | safetensors MLX, oMLX |
| XHToken/Spark-X2.6-4B (base) | 4,11B | no disponible en esta ficha | Apache-2.0 | no disponible |
| Alternativas de ~4B en MLX | no disponible | no disponible | no disponible | no disponible |

No se conocen en la informacion disponible modelos comparables con datos verificables de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Modelo de 4B parametros: no sustituye a modelos mayores en razonamiento dificil, planificacion de largo horizonte ni tareas factibles de alto riesgo.
- La cuantizacion mixta 6/8 bits puede alterar el comportamiento mas que la build pura de 8 bits; el autor recomienda validar en la tarea propia antes de confiar en el.
- El modo "thinking" alto es poco fiable en tareas de codigo estructurado: en quicksort provoca un bucle de presupuesto (0/8). Usar thinking desactivado salvo prueba especifica.
- Entrenado principalmente en ingles y chino; otros idiomas no fueron evaluados.
- Riesgo de alucinacion en hechos, numeros, citas y argumentos de herramientas; el grounding y la revision son responsabilidad de la aplicacion.
- La ventana completa de 65.536 tokens no fue evaluada; el prompt mas largo medido ronda los 39,5k tokens. La configuracion del modelo fuente anuncia un maximo mayor no probado aqui.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribucion al modelo base XHToken/Spark-X2.6-4B y a la cuantizacion de Code & Canvas.
- Requiere un runtime especifico (oMLX con soporte Spark 2.5 o MLX con `spark2_5`); no es cargable con Transformers estandar.
- El rendimiento medido corresponde a un unico equipo (M2 Air, 16 GB); no debe extrapolarse a otro hardware.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/code-and-canvas/Spark-X2.6-4B-MLX-oQ6e-fp16
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Runtime oMLX: https://github.com/omlx
