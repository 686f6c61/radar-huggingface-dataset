# nadiva1243/MonkeyGrab-Qwen3-0.6B-RAG-GGUF

## Resumen

MonkeyGrab-Qwen3-0.6B-RAG es un modelo de respuesta especializado en question answering sobre documentos PDF mediante generacion aumentada por recuperacion (RAG). Lo desarrolla nadiva1243 como parte del proyecto MonkeyGrab, una aplicacion local de RAG sobre PDFs que combina recuperacion hibrida BM25 mas embeddings y generacion con Ollama. El modelo parte de Qwen3-0.6B y se ha afinado y destilado a partir de `qwen3:4b-instruct-2507` sobre los prompts exactos de la aplicacion.

Su relevancia practica esta en el perfil de hardware: es el modelo de respuesta por defecto del build `rag-lite` de MonkeyGrab, disenado para GPUs con 4 GB de VRAM, donde asume todos los roles (respuestas, chat y descomposicion de consultas) junto al reranker BGE. En esa configuracion alcanza 126 de 136 casos respondidos y 143 de 156 globales en la puerta de evaluacion del proyecto con contexto de 8k, ocupando 1058 MiB el modelo y 2676 MiB con el reranker, frente a los 3354 MiB del modelo de 4B por si solo.

Arquitectonicamente es un transformer denso de 596.049.920 parametros (aproximadamente 0.6B), con licencia Apache-2.0 y soporte declarado de ingles, castellano y catalan. Se distribuye en formato GGUF cuantizado para su uso directo con Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 16k en la evaluacion del autor; 8k en el perfil `rag-lite`; entrenamiento con secuencias de hasta 14336 tokens |
| Tipos de cuantizacion | Q4_K_M (397 MB), Q5_K_M (444 MB), Q8_0 (639 MB) |
| Idiomas soportados | en, es, ca |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos completos en safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 0.6B parametros construido sobre Qwen3-0.6B. El ajuste se realizo con LoRA de rango 32 (alpha 64) aplicado a todas las proyecciones de atencion y MLP, con la perdida calculada unicamente sobre los tokens de respuesta, secuencias de hasta 14336 tokens, 2 epocas, learning rate 2e-4 con decaimiento coseno, batch efectivo de 8 y precision bf16. Sobre esa base se anadio destilacion de logits: se usan las top-32 log-probabilidades del profesor `qwen3:4b-instruct-2507` en cada posicion de respuesta, con una perdida combinada `0.5 * CE + 0.5 * KL(teacher || student)`. El entrenamiento completo llevo 4 horas y 37 minutos en una unica RTX 4060 Laptop con un pico de 5.9 GB.

Los datos de entrenamiento son 3364 filas sobre 65 documentos (articulos de arXiv y articulos de Wikipedia en ingles, castellano y catalan), disjuntos del corpus de evaluacion. Incluyen preguntas extractivas generadas por el profesor sobre fragmentos indexados y respondidas a traves de la recuperacion y el prompt propios de MonkeyGrab, conservadas solo si pasaban el grader de la puerta; respuestas revisadas por Claude Haiku contra una rubrica, reescritas por Claude Sonnet cuando eran corregibles y auditadas por muestreo con Claude Opus; pares pregunta-respuesta orientados a tablas y numeros, escritos por Claude Sonnet y verificados uno a uno por Claude Haiku; y artefactos de estudio del profesor (resumen, esquema, cuestionario) para cada documento e idioma. El autor probo sin mejora DPO sobre muestras on-policy calificadas (empate), un peso de profesor de 0.8 (10 casos perdidos), una tercera epoca (un caso por detras) y pesos Q5_K_M y Q8_0 (dentro de un caso de diferencia). Los datos de entrenamiento no se publican porque sus contextos son pasajes literales de articulos de arXiv, algunos sin permiso de redistribucion; los scripts los reconstruyen desde las fuentes.

## Capacidades

- Generacion de texto y respuesta extractiva a preguntas sobre documentos: el modelo esta optimizado para devolver numeros, nombres y fechas leidos directamente del contexto recuperado.
- Question answering con contexto largo: soporta ventanas de hasta 16k tokens en la configuracion evaluada.
- Modos de estudio: genera resumenes, esquemas y cuestionarios sobre el documento, evaluados por estructura y fuentes.
- Chat multi-turno dentro de la aplicacion MonkeyGrab.
- Descomposicion de consultas para la recuperacion, rol que asume en el perfil `rag-lite`.
- Multilingue en ingles, castellano y catalan.
- Integracion con Ollama mediante plantilla ChatML y parametros preconfigurados (temperature 0.6, top_k 20, top_p 0.95).
- No dispone de bloque de razonamiento: debe invocarse con `think=false`, ya que se entreno sin modo thinking.
- No se documentan capacidades de tool calling, function calling, vision ni audio.

## Casos de uso

- Question answering sobre PDFs tecnicos en local: el modelo responde preguntas factuales extrayendo numeros, nombres y fechas del contexto recuperado, que es exactamente el regimen con el que se entreno y evaluo.
- Despliegue en GPUs de 4 GB de VRAM: con Q4_K_M ocupa 1058 MiB y, junto al reranker BGE, 2676 MiB, lo que permite ejecutar un pipeline RAG completo en hardware de gama baja o en portatiles.
- Asistente de estudio sobre articulos cientificos: genera resumenes, esquemas y cuestionarios por documento e idioma, capacidades incluidas explicitamente en el conjunto de entrenamiento.
- Busqueda documental multilingue: cubre consultas en ingles, castellano y catalan sobre un mismo corpus, util en organizaciones con documentacion en varias lenguas.
- Chat de soporte sobre base documental propia: al integrarse en Ollama con la plantilla ChatML, puede gestionar conversaciones multi-turno con contexto de hasta 16k tokens.
- Prototipado rapido de aplicaciones RAG: al ser el modelo por defecto del perfil `rag-lite` de MonkeyGrab, sirve para validar pipelines de recuperacion hibrida BM25 mas embeddings sin invertir en GPU de gama alta.
- Descomposicion de consultas en pipelines de recuperacion: asume el rol de reescritura y desglose de preguntas complejas antes de la busqueda, reduciendo el numero de modelos necesarios en el sistema.

## Benchmarks y rendimiento

Evaluacion sobre la puerta de MonkeyGrab (`tests/eval/run_eval.py`): 136 preguntas verificadas manualmente con respuesta esperada comprobada, sobre 17 articulos y articulos de Wikipedia por idioma en ingles, castellano y catalan. 124 casos son factuales y 12 son modos de estudio. Todos los modelos de una fila se compararon en la misma ejecucion y con la misma recuperacion.

| Modelo | Respondidas /136 | Estudio /12 | Mediana s/caso | VRAM en Ollama |
|---|---|---|---|---|
| `qwen3:0.6b`, stock | 104 a 105 | 10 | 6.5 | no disponible |
| **este modelo, Q4_K_M** | **126 a 127** (seis ejecuciones) | **12** | 6.2 | **1.52 GB** |
| `qwen3:4b-instruct-2507`, profesor | 135 | 12 | 9.6 | 3.90 GB |

Medido en RTX 4060 Laptop (8 GB), Ollama 0.40, contexto de 16k y cache KV en q8_0. La VRAM es el pico de `size_vram` reportado por Ollama durante la respuesta. Ningun documento de la puerta se uso en entrenamiento. En el perfil `rag-lite` con contexto de 8k, el modelo responde 126 de 136 y 143 de 156 globales. Sin reranker y con contexto de 8k baja a 115 de 136.

## Requisitos de hardware

- VRAM para inferencia: 1058 MiB con Q4_K_M en Ollama; 2676 MiB con el reranker BGE incluido; 1.52 GB de pico reportado por Ollama en la evaluacion.
- GPU recomendadas: RTX 4060 Laptop (8 GB) es el hardware de referencia del autor; el perfil objetivo son GPUs con 4 GB de VRAM.
- Cabe en GPUs de consumo: si, en tarjetas de 4 GB o superiores con Q4_K_M.
- Opciones de despliegue: Ollama (`ollama pull hf.co/nadiva1243/MonkeyGrab-Qwen3-0.6B-RAG-GGUF:Q4_K_M`) y llama.cpp (el autor convirtio con llama.cpp b11669); el formato GGUF es compatible con el ecosistema habitual.
- Latencia: mediana de 6.2 s por caso en la puerta de evaluacion sobre RTX 4060 Laptop con contexto de 16k y cache KV q8_0.
- Requisito de cache KV: debe mantenerse en q8_0 o f16; una cache q4_0 degrada gravemente el modelo en contextos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Respondidas /136 | Estudio /12 | VRAM | Licencia |
|---|---|---|---|---|---|---|
| MonkeyGrab-Qwen3-0.6B-RAG (Q4_K_M) | 0.6B | 16k | 126 a 127 | 12 | 1.52 GB | Apache-2.0 |
| `qwen3:0.6b` stock | 0.6B | no disponible en la informacion | 104 a 105 | 10 | no disponible | Apache-2.0 |
| `qwen3:4b-instruct-2507` (profesor) | 4B | no disponible en la informacion | 135 | 12 | 3.90 GB | Apache-2.0 |

Las cifras de la columna de evaluacion corresponden a la puerta de MonkeyGrab y no son comparables con benchmarks publicos como MMLU o HumanEval, para los que no se han publicado resultados en la informacion disponible.

## Limitaciones y advertencias

- Entrenado y medido con el system prompt y el formato de contexto de MonkeyGrab; con otros prompts RAG se comporta como un Qwen3-0.6B con sesgo hacia respuestas extractivas cortas.
- Se entreno sobre evidencia reordenada por reranker; sin reranker y con contexto de 8k cae a 115 de 136 en la puerta. Es necesario mantener un reranker delante.
- Sus errores residuales son mayoritariamente numeros leidos incorrectamente de una tabla.
- Con contexto vacio inventa una respuesta en lugar de declinar, igual que el modelo stock.
- Una cache KV en q4_0 lo rompe en contextos largos (57 de 136 en la puerta): las respuestas degeneran y se alargan. Usar q8_0 o f16.
- No dispone de bloque de razonamiento; debe invocarse con `think=false`.
- Los datos de entrenamiento no se publican por restricciones de redistribucion de los articulos de arXiv utilizados.
- No se documentan sesgos especificos, resultados en benchmarks estandar ni capacidades de tool calling, por lo que no estan disponibles.
- Licencia Apache-2.0, sin restricciones adicionales para uso comercial mas alla de las del modelo base Qwen3-0.6B.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/nadiva1243/MonkeyGrab-Qwen3-0.6B-RAG-GGUF
- Pesos completos en safetensors: https://huggingface.co/nadiva1243/MonkeyGrab-Qwen3-0.6B-RAG
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de MonkeyGrab: https://github.com/iDiagoValeta/localOllamaRAG
- Codigo de entrenamiento y registro de experimentos: https://github.com/iDiagoValeta/localOllamaRAG/tree/develop/training
