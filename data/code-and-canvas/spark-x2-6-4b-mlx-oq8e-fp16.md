# code-and-canvas/Spark-X2.6-4B-MLX-oQ8e-fp16

## Resumen

Spark-X2.6-4B-MLX-oQ8e-fp16 es una cuantización a 8 bits del modelo XHToken/Spark-X2.6-4B, convertida para inferencia local en Apple Silicon mediante el runtime oMLX. El modelo base es un modelo de lenguaje causal de 4.112 millones de parámetros (arquitectura Spark2_5ForCausalLM) orientado a generación de texto conversacional, con soporte de inglés y chino y un modo de razonamiento configurable ("thinking") en tres niveles: ninguno, bajo y alto.

Esta variante, publicada por Code & Canvas, es la de mayor calidad de las dos compilaciones Spark disponibles en oMLX: usa cuantización afina de 8 bits con tamaño de grupo 64 y caché KV en fp16, ocupando 4,1 GiB en disco. Está pensada para máquinas con 16 GB de memoria unificada o más. La cuantización empleó una matriz de importancia calibrada con el conjunto `oqe_code_multilingual` (1.024 muestras de 512 tokens).

Su relevancia reside en permitir ejecutar un modelo de 4B con contexto de 65.536 tokens y capacidades de razonamiento y uso de herramientas completamente en local, sin enviar datos a servicios externos, con un rendimiento medido de entre 10 y 16 tok/s en un MacBook Air M2 de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark2_5ForCausalLM (transformer causal), 36 capas, hidden size 2.560 |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 65.536 tokens configurados; prompts de hasta ~39,5k tokens verificados en pruebas |
| Tipos de cuantizacion | 8-bit afín (oQ8e), group size 64; caché KV en fp16 |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizado, formato MLX/oMLX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only (`Spark2_5ForCausalLM`) con 36 capas y tamaño oculto de 2.560. El repositorio incluye la implementación de referencia de Spark 2.5 (`configuration_spark.py` y `modeling_spark.py`), y el checkpoint fuente es `XHToken/Spark-X2.6-4B` en el commit `66e3ae7bee54e0a523d692cb8ef841f35409807b`, derivado a su vez de `XHToken/Spark-X2.6-4B-Base`. No hay datos publicados sobre el número de tokens de entrenamiento, composición del dataset ni procesos de RLHF/DPO.

La innovación principal de este repositorio no es arquitectural sino de cuantización: se usa el pipeline oQ de oMLX con matriz de importancia (imatrix) calculada sobre el conjunto de calibración `oqe_code_multilingual` (1.024 muestras, 512 tokens por muestra). El sufijo `fp16` indica que la caché KV se mantiene en precisión media para preservar calidad en contextos largos. Cabe destacar que `auto_map` se omite deliberadamente de `config.json`: los pesos no cargan mediante código remoto en Transformers, y requieren un runtime oMLX o MLX con soporte nativo de `spark2_5`.

## Capacidades

- Generación de texto conversacional con plantilla de chat incluida (`chat_template.jinja`).
- Modo de razonamiento configurable: none, low y high ("thinking"), controlado vía `enable_thinking` y `reasoning_effort`. El modo alto consume presupuesto de salida considerable pero mejora tareas de razonamiento (por ejemplo, quicksort: 8/8 con thinking alto frente a peores resultados sin él).
- Asistencia de código: resolución de tareas de parsing estricto, algoritmos (merge intervals) y síntesis investigación-código.
- Síntesis de investigación y redacción de prosa técnica (con revisión humana recomendada).
- Uso de herramientas (tool use): 5/5 en el flujo "on-call" evaluado, con soporte de servidor compatible con la API de OpenAI.
- Flujos agentísticos multi-paso en local, según el uso previsto declarado.
- Bilingüe: inglés y chino; otros idiomas no evaluados.

## Casos de uso

- Asistencia de código local en Apple Silicon: el modelo resuelve tareas algorítmicas (merge intervals 8/8) y de parsing estricto, útil como copiloto offline en editores o CLI.
- Flujos agentísticos con herramientas: el servidor OpenAI-compatible de oMLX permite integrarlo en pipelines de agentes con function calling; obtuvo 5/5 en el flujo on-call evaluado.
- Procesamiento de documentos largos en local: con 65.536 tokens de contexto y throughput de 10,41 tok/s a ~39,5k tokens de prompt, es adecuado para resumir y consultar documentos extensos sin conexión.
- Aplicaciones con requisitos de privacidad estricta: todo el procesamiento ocurre en la máquina, apropiado para datos sensibles que no pueden salir del dispositivo.
- Redacción y reescritura con revisión humana: generación de posts de lanzamiento y prosa técnica (15/20 en la prueba de prosa), donde el humano valida el resultado final.
- Razonamiento estructurado bajo demanda: el modo thinking alto permite resolver problemas que requieren planificación (quicksort 8/8), a costa de mayor latencia y presupuesto de tokens.
- Síntesis de investigación: combinación de información de múltiples fuentes en informes (18/20 en la prueba correspondiente).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publicó evaluaciones propias en un MacBook Air M2 de 16 GB con oMLX 0.7.2, caché KV fp16, prefix cache activado y 64 tokens de salida por generación:

| Suite | Resultado |
|---|---|
| Coding: parser estricto de duraciones | 12 / 21 |
| Coding: merge intervals | 8 / 8 |
| Razonamiento + código: quicksort | 8 / 8 (con thinking alto) |
| Síntesis de investigación | 18 / 20 |
| Prosa: post de lanzamiento | 15 / 20 |
| Tool use: flujo on-call | 5 / 5 |

Throughput de generación:

| Tamaño de prompt | Throughput |
|---|---:|
| Corto (69 tokens) | 16,52 tok/s |
| ~1.3k tokens | 16,60 tok/s |
| ~19,8k tokens | 13,94 tok/s |
| ~39,5k tokens | 10,41 tok/s |

## Requisitos de hardware

- VRAM/memoria unificada: 4,1 GiB de pesos en disco; recomendado 16 GB de memoria unificada o más (el autor lo destina explícitamente a máquinas de 16 GB).
- Hardware objetivo: Apple Silicon (probado en MacBook Air M2 de 16 GB). No es un modelo GGUF estándar, por lo que no está dirigido a GPUs NVIDIA; no hay datos para RTX 4090, A100 o H100.
- Cabe en portátiles Apple Silicon de 16 GB sin problema; en máquinas de 8 GB no es la variante recomendada por el autor.
- Despliegue: oMLX (`omlx serve` con servidor compatible con OpenAI en el puerto 8081) o cualquier runtime MLX que implemente `spark2_5`. No carga en Transformers vía código remoto (`auto_map` omitido). No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: 16,5 tok/s con prompts cortos, degradando a 10,4 tok/s con prompts de ~39,5k tokens en el hardware de prueba; el prefill es el cuello de botella en prompts largos.

## Comparativa con modelos similares

No se han publicado comparativas oficiales con otros modelos. Como referencia de categoría (modelos ~4B para inferencia local), sin datos verificados de rendimiento cruzado:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Spark-X2.6-4B (oQ8e) | 4,11B | 65.536 tokens | Apache-2.0 | MLX safetensors 8-bit |
| Qwen3-4B | ~4B | ~32k-128k | Apache-2.0 | safetensors, GGUF |
| Llama 3.2 3B | ~3,2B | 128k | Llama 3.2 Community | safetensors, GGUF |

La comparación es orientativa: los datos de Qwen3 y Llama 3.2 provienen de conocimiento general y no de la información de este repositorio, por lo que deben verificarse antes de decisiones técnicas.

## Limitaciones y advertencias

- Con 4B de parámetros, no sustituye a modelos mayores en razonamiento complejo, planificación a largo plazo o trabajo factual de alto riesgo.
- La cuantización puede alterar el comportamiento del modelo; el autor recomienda validar la compilación en la tarea propia antes de confiar en ella.
- Entrenado principalmente en inglés y chino; otros idiomas, incluido el castellano, no han sido evaluados.
- Riesgo de alucinación explícito: puede inventar hechos, números, citas y argumentos de herramientas; la aplicación es responsable del grounding y la revisión.
- El contexto completo de 65.536 tokens no fue benchmarked; el prompt más largo medido fue de ~39,5k tokens. La configuración fuente anuncia un máximo mayor que no fue probado.
- El modo thinking alto consume un presupuesto de salida elevado; resultados como el quicksort 8/8 dependen de ese presupuesto.
- Compatibilidad restringida: no carga en Transformers vía código remoto; requiere oMLX o un runtime MLX con soporte nativo de `spark2_5`.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, pero debe mantenerse la atribución al redistribuir.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/code-and-canvas/Spark-X2.6-4B-MLX-oQ8e-fp16
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Runtime oMLX: https://github.com/omlx
