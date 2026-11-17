# nadiva1243/MonkeyGrab-Qwen3-0.6B-RAG

## Resumen
MonkeyGrab-Qwen3-0.6B-RAG es un modelo de generacion de texto de 596.049.920 parametros (aproximadamente 0,6B), obtenido mediante fine-tuning supervisado y destilacion de logits a partir de Qwen3-0.6B. Lo desarrolla el autor nadiva1243 en el contexto del proyecto MonkeyGrab, una aplicacion local de RAG sobre PDF que combina recuperacion hibrida (BM25 mas embeddings) con generacion via Ollama. El modelo resuelve un problema concreto: responder preguntas extractivas y generar artefactos de estudio (resumen, esquema, cuestionario) sobre fragmentos de documentos, con un consumo de VRAM muy bajo.

Su relevancia practica radica en que sustituye al modelo profesor `qwen3:4b-instruct-2507` en la build `rag-lite` de MonkeyGrab, pensada para GPUs con 4 GB de VRAM. Segun la model card, con cuantizacion Q4_K_M ocupa 1,52 GB en Ollama y responde 126-127 de 136 casos de la puerta de evaluacion del proyecto, frente a 104-105 del Qwen3-0.6B original y 135 del profesor de 4B. La arquitectura es la de Qwen3-0.6B (transformer denso) y el contexto de evaluacion usado es de 16k tokens.

El modelo esta publicado en formato transformers (safetensors, pesos bf16 fusionados) y tiene una version GGUF separada para Ollama y llama.cpp. Soporta ingles, espanol y catalan, y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16k tokens usados en la evaluacion del proyecto; longitud maxima nativa de Qwen3-0.6B no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (GGUF); pesos bf16 en safetensors |
| Idiomas soportados | en, es, ca |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 fusionado) y GGUF |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-0.6B, un transformer denso de aproximadamente 0,6B parametros, y se entrena con LoRA de rango 32 (alpha 64) aplicado a todas las proyecciones de atencion y MLP. La perdida se calcula unicamente sobre los tokens de respuesta, con secuencias de hasta 14336 tokens, 2 epocas, learning rate 2e-4 con schedule coseno, batch efectivo 8 y precision bf16. Sobre esa base se anade destilacion de logits: se usan las top-32 log-probabilidades del profesor `qwen3:4b-instruct-2507` en cada posicion de respuesta, con una perdida combinada `0.5 * CE + 0.5 * KL(profesor || alumno)`. El entrenamiento completo duro 4 horas y 37 minutos en una RTX 4060 Laptop con un pico de 5,9 GB de VRAM.

El dataset consta de 3364 filas sobre 65 documentos (articulos de arXiv y articulos de Wikipedia en ingles, espanol y catalan), disjunto del corpus de evaluacion. Incluye preguntas extractivas escritas por el profesor sobre fragmentos indexados y respondidas por el mismo profesor mediante la recuperacion y el prompt propios de MonkeyGrab, conservadas solo si pasaban el grader de la puerta; respuestas revisadas por Claude Haiku contra una rubrica y reescritas por Claude Sonnet cuando eran corregibles, con auditoria por muestreo de Claude Opus; pares pregunta-respuesta centrados en tablas y numeros, escritos por Claude Sonnet y verificados uno a uno por Claude Haiku; y artefactos de estudio del profesor para cada documento e idioma, para evitar que los datos de respuesta corta los borrassen. Al final del entrenamiento el adaptador LoRA se fusiono en los pesos, por lo que no se conserva por separado. La exportacion se hizo con llama.cpp b11669 y posterior cuantizacion.

## Capacidades
- Generacion de texto conversacional con formato de chat de Qwen3 (apply_chat_template), con `enable_thinking=False` en el ejemplo de uso.
- Respuesta a preguntas extractivas sobre contexto recuperado: numeros, nombres y fechas leidos del documento.
- Generacion de artefactos de estudio: resumen, esquema y cuestionario, evaluados en la puerta con 12 casos.
- Multilingue en ingles, espanol y catalan, con corpus de entrenamiento y evaluacion en los tres idiomas.
- Manejo de contextos largos de hasta 14336 tokens durante el entrenamiento y 16k en la evaluacion.
- Respuestas breves y centradas en la evidencia del contexto, sesgadas hacia respuestas extractivas.
- No se documenta tool calling, function calling, capacidades de agente, vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso
- RAG local sobre PDF en equipos con 4 GB de VRAM: es el modelo de respuesta por defecto de la build `rag-lite` de MonkeyGrab, con recuperacion hibrida BM25 mas embeddings y generacion via Ollama. Es adecuado porque ocupa 1,52 GB con Q4_K_M y mantiene 126-127/136 en la puerta del proyecto.
- Preguntas factuales sobre documentacion tecnica: el modelo esta entrenado para extraer numeros, nombres y fechas de fragmentos indexados, lo que encaja en consultas sobre articulos de arXiv y entradas de Wikipedia.
- Generacion de resumenes de documentos: produce resumenes evaluados por estructura y fuentes en los 12 casos de estudio de la puerta, con datos de entrenamiento especificos para esta tarea.
- Creacion de esquemas y cuestionarios de estudio: los artefactos de estudio del profesor se incluyeron en el entrenamiento para cada documento e idioma, de modo que la capacidad no se pierde por el sesgo extractivo.
- Asistencia documental multilingue en entornos hispanohablantes: cubre ingles, espanol y catalan con el mismo prompt y formato, util para equipos que consultan fuentes en las tres lenguas.
- Despliegue en portatiles con GPU consumer: el entrenamiento y la evaluacion se hicieron en una RTX 4060 Laptop de 8 GB, y la build `rag-lite` apunta a GPUs de 4 GB, lo que permite ejecutar el pipeline completo en hardware modesto.
- Destilacion como referencia para ajustar modelos pequenos: los logs y el registro de experimentos documentan nueve variantes entrenadas y 24 hallazgos, utiles como caso practico de destilacion de un profesor de 4B a un alumno de 0,6B.

## Benchmarks y rendimiento
Resultados de la puerta de evaluacion de MonkeyGrab (`tests/eval/run_eval.py`): 136 preguntas verificadas manualmente con respuesta esperada, sobre 17 articulos y entradas de Wikipedia por idioma en ingles, espanol y catalan. 124 casos son factuales y 12 son modos de estudio. Todos los modelos de una fila se compararon en la misma ejecucion y con la misma recuperacion.

| Modelo | Respondidas /136 | Estudio /12 | Mediana s/caso | VRAM en Ollama |
|---|---|---|---|---|
| `qwen3:0.6b`, original | 104 a 105 | 10 | 6,5 | no disponible |
| MonkeyGrab-Qwen3-0.6B-RAG, Q4_K_M | 126 a 127 (seis ejecuciones) | 12 | 6,2 | 1,52 GB |
| `qwen3:4b-instruct-2507`, profesor | 135 | 12 | 9,6 | 3,90 GB |

Medicion en RTX 4060 Laptop (8 GB), Ollama 0.40, contexto de 16k (`rag_num_ctx` de la puerta) y KV cache q8_0. La VRAM es el pico de `size_vram` reportado por Ollama durante la respuesta. Ninguno de los documentos de la puerta se uso para entrenamiento.

Variantes medidas y descartadas en la misma puerta: DPO sobre muestras on-policy calificadas (empate), peso del profesor de 0,8 (10 casos perdidos), tercera epoca (un caso por detras), pesos Q5_K_M y Q8_0 (dentro de un caso de diferencia).

## Requisitos de hardware
- VRAM estimada para inferencia: 1,52 GB con Q4_K_M en Ollama, segun la medicion del proyecto; Q5_K_M y Q8_0 quedan dentro de un caso de la puerta pero no se documenta su VRAM exacta.
- GPU recomendadas: RTX 4060 Laptop (8 GB) fue el hardware de entrenamiento y evaluacion; la build `rag-lite` esta pensada para GPUs de 4 GB de VRAM. No se documentan resultados en A100, H100 ni otras GPU de datacenter.
- Cabe en GPU consumer: si, con Q4_K_M en GPUs de 4 GB o superiores; el profesor de 4B requiere 3,90 GB y la build de 8 GB lo mantiene.
- Opciones de despliegue: Ollama (via el repositorio GGUF `nadiva1243/MonkeyGrab-Qwen3-0.6B-RAG-GGUF`), llama.cpp (conversion con b11669), transformers con safetensors y text-generation-inference (segun los tags del repositorio).
- Latencia y throughput: mediana de 6,2 s/caso en la puerta con Ollama 0.40, contexto de 16k y KV cache q8_0 en RTX 4060 Laptop. No se documenta throughput en tokens por segundo ni latencia en otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado en la puerta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MonkeyGrab-Qwen3-0.6B-RAG | 596.049.920 | 16k usados en evaluacion | 126-127/136; 12/12 estudio | Apache-2.0 | Hugging Face (safetensors y GGUF) |
| Qwen3-0.6B original | aproximadamente 0,6B | no disponible en la informacion | 104-105/136; 10/12 estudio | Apache-2.0 | Hugging Face |
| `qwen3:4b-instruct-2507` (profesor) | no disponible en la informacion | no disponible en la informacion | 135/136; 12/12 estudio | Apache-2.0 (segun la model card) | Ollama |

La comparacion se limita a los tres modelos medidos en la misma puerta de evaluacion del proyecto; no se dispone de resultados de MMLU, HumanEval, GSM8K ni de otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias
- Entrenado y medido con el system prompt y el formato de contexto de MonkeyGrab; con otros prompts de RAG se comporta como un Qwen3-0.6B con sesgo hacia respuestas extractivas cortas.
- Sus errores restantes son mayoritariamente numeros leidos incorrectamente de una tabla.
- Con contexto vacio inventa una respuesta en lugar de declinar, igual que el modelo original.
- Una KV cache q4_0 lo rompe en contextos largos (57/136 en la puerta): las respuestas degeneran y se alargam. Debe usarse q8_0 o f16.
- Los datos de entrenamiento no se publican porque sus contextos son pasajes literales de articulos de arXiv, algunos de los cuales no permiten redistribucion; los scripts los reconstruyen a partir de las fuentes.
- El adaptador LoRA no se conserva por separado; solo estan disponibles los pesos fusionados.
- No se documentan sesgos especificos ni riesgos de alucinacion mas alla del caso de contexto vacio.
- Licencia Apache-2.0, sin restricciones documentadas para uso comercial; conviene verificar las condiciones de las fuentes de arXiv usadas en el entrenamiento si se redistribuye el modelo en un producto derivado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nadiva1243/MonkeyGrab-Qwen3-0.6B-RAG
- Version GGUF: https://huggingface.co/nadiva1243/MonkeyGrab-Qwen3-0.6B-RAG-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio MonkeyGrab: https://github.com/iDiagoValeta/localOllamaRAG
- Codigo de entrenamiento y registro de experimentos: https://github.com/iDiagoValeta/localOllamaRAG/tree/develop/training
