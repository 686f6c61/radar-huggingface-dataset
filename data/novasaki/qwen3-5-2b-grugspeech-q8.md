# Novasaki/Qwen3.5-2B-GrugSpeech-Q8

## Resumen

Qwen3.5-2B-GrugSpeech-Q8 es un ajuste fino mediante adaptador LoRA publicado por el usuario Novasaki sobre el modelo base Qwen/Qwen3.5-2B. Su proposito no es ampliar el conocimiento del modelo base, sino transformar la forma en que este razona: convierte discurso verboso y cadenas de pensamiento extensas en "Grug Speech", un estilo de razonamiento interno ultraconciso, telegrafico y de alta densidad semantica, inspirado en las trazas internas de los modelos de razonamiento de OpenAI (GPT-5.6). El objetivo declarado es mantener el 100% de los hechos, numeros, restricciones y conclusiones, eliminando el relleno conversacional.

El modelo reporta una compresion de tokens de entre 2,0x y 2,5x (reduccion de aproximadamente el 50%-60%), lo que resulta directamente util para reducir el coste y la latencia en bucles de razonamiento de agentes multi-turno. El entrenamiento se realizo en 8 bits (carga del modelo base con `load_in_8bit=True` y adaptador LoRA de rango 16 sobre proyecciones de atencion y MLP), con un conjunto curado de datos de razonamiento que combina GSM8K, AI2 ARC y trazas de ingenieria de sistemas y agentes.

Se trata de un modelo muy reciente (publicado el 5 de octubre de 2026) con cero descargas y cero likes en el momento de redactar esta ficha, por lo que aun no cuenta con validacion independiente de la comunidad. El repositorio ocupa 3,3 GB e incluye pesos en safetensors y GGUF, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (linear + full attention) del modelo base Qwen/Qwen3.5-2B; ajuste mediante adaptador LoRA |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 mil millones), segun safetensors del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Entrenamiento y publicacion en 8 bits (Q8); pesos GGUF disponibles segun etiquetas del repositorio |
| Idiomas soportados | No disponible (los conjuntos de datos de entrenamiento citados, GSM8K y AI2 ARC, son mayoritariamente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |
| Modelo base | Qwen/Qwen3.5-2B |
| Configuracion LoRA | rank=16, alpha=32, modulos objetivo: q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Libreria | peft |
| Pipeline | text-generation |
| Tamano del repositorio | 3,3 GB |
| Fecha de publicacion | 2026-10-05 |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura del Qwen3.5-2B, descrita por el autor como hibrida de atencion lineal y atencion completa (hybrid linear + full attention). Sobre esa base se entreno un adaptador LoRA de rango 16 y alpha 32, aplicado a las proyecciones de atencion (q, k, v, o) y a las proyecciones del bloque MLP (gate, up, down), lo que cubre practicamente todos los modulos lineales relevantes del transformer. El entrenamiento se realizo con el modelo base cargado en 8 bits mediante `BitsAndBytesConfig(load_in_8bit=True)`, una configuracion tipica de QLoRA que reduce el consumo de memoria durante el ajuste.

El conjunto de datos declarado es un subconjunto curado y multidominio de razonamiento que combina aritmetica de GSM8K (openai/gsm8k), razonamiento cientifico de AI2 ARC (allenai/ai2_arc) y trazas complejas de ingenieria de sistemas y agentes. Las metricas de convergencia reportadas son Train Loss 0.5295, Eval Loss 0.3792 y Eval Token Accuracy del 90,19%. La innovacion tecnica principal no esta en la arquitectura, sino en la tarea: el modelo aprende a reescribir y a producir razonamiento en un dialecto interno comprimido, con operadores causales directos (`->`, `|`, `:`) y preservacion estricta de cifras, formulas y logica causal. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Compresion de razonamiento: convierte texto o cadenas de pensamiento verbosas en Grug Speech, con ratios declarados de 2,0x a 2,5x y retencion de informacion del 100% en las pruebas del autor.
- Preservacion factual: mantiene ecuaciones, resultados numericos, restricciones y conclusiones durante la compresion.
- Generacion de texto y conversacion: pipeline declarado text-generation y capacidad conversational.
- Razonamiento aritmetico y cientifico: entrenado sobre GSM8K y AI2 ARC, con evaluacion en OpenBookQA y MMLU (matematicas elementales).
- Razonamiento agentico: orientado a reducir el presupuesto de tokens en bucles de razonamiento multi-turno de agentes (etiqueta agentic-reasoning).
- Estilo de pensamiento comprimido: produce trazas internas telegraficas aptas como "thinking mode" de bajo coste.
- Soporte de tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible (no documentadas).

## Casos de uso

- Optimizacion del razonamiento interno de agentes: el modelo reescribe las trazas de cadena de pensamiento de un agente antes de reinyectarlas en el contexto, reduciendo entre un 50% y un 60% los tokens consumidos en cada iteracion de un bucle multi-paso.
- Reduccion de coste en pipelines de inferencia: al comprimir el texto de entrada o el contexto intermedio, disminuye el coste por token facturable y la memoria de KV cache en sistemas con muchos turnos.
- Preprocesamiento de documentacion tecnica: convierte especificaciones, informes de incidencias o descripciones de arquitectura en resumenes telegraficos que preservan cifras y restricciones, utiles como contexto condensado para un modelo mayor.
- Aprendizaje y analisis de compresion de tokens: sirve como banco de pruebas para investigar hasta que punto se puede comprimir el razonamiento sin perder exactitud factual, con metricas de ratio y retencion.
- Automatizacion de notas de ingenieria: transforma descripciones verbosas de cambios de sistemas (por ejemplo, optimizaciones de rendimiento con objetivos de req/s y metricas de CPU) en trazas estructuradas del tipo "Goal / Check / Fix / Done".
- Condensacion de contexto para RAG: reduce el tamano de los fragmentos recuperados antes de enviarlos al generador principal, lo que permite incluir mas documentos en la misma ventana de contexto.
- Generacion de resumenes operativos en monitorizacion: a partir de logs o informes largos, produce lineas de estado compactas que conservan los valores criticos.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son las metricas de entrenamiento y una tabla de evaluacion sobre conjuntos no vistos, centrada en el ratio de compresion y la retencion de informacion, no en la exactitud de tarea:

| Benchmark / dominio | Tokens de entrada | Tokens Grug | Ratio de compresion | Retencion de informacion |
|---|---|---|---|---|
| OpenBookQA (biologia / ciencia) | 127 | 51 | 2,49x (-59,8%) | 100% (identifica restriccion clave y opcion correcta) |
| MMLU (matematicas elementales) | 149 | 61 | 2,44x (-59,1%) | 100% (conserva el paso algebraico 24 / 2 = 12 y la respuesta final) |
| Ingenieria de sistemas (optimizacion de crawler web) | 128 | 63 | 2,03x (-50,8%) | 100% (conserva uvloop, aiohttp, 50 -> 2.500 req/s y metricas de CPU) |

Metricas de entrenamiento reportadas: Train Loss 0.5295, Eval Loss 0.3792, Eval Token Accuracy 90,19%. No se han publicado resultados de benchmarks estandar (MMLU global, HumanEval, GSM8K en formato de exactitud, etc.) en la informacion disponible, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 1,88 mil millones de parametros, no publicada por el autor):
  - FP16/BF16: aproximadamente 3,8 GB solo en pesos; con KV cache, alrededor de 4-5 GB.
  - 8 bits: aproximadamente 1,9-2 GB en pesos; alrededor de 2,5-3 GB en total.
  - GGUF Q4: aproximadamente 1,1-1,2 GB en pesos; alrededor de 1,5-2 GB en total.
- GPU recomendadas: cualquier GPU de consumo moderna con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 3060, RTX 3080/3090, RTX 4070/4080/4090). Para despliegue de alta concurrencia, A100 o H100.
- Cabe en GPU de consumo: si, con margen amplio en todas las cuantizaciones, incluidas GPUs de gama de entrada con 4-6 GB.
- Opciones de despliegue: transformers + peft + bitsandbytes (ruta oficial del autor), llama.cpp / llama-cpp-python y Ollama para los pesos GGUF, vLLM y TGI mediante soporte de adaptadores LoRA, y LM Studio para uso local.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-GrugSpeech-Q8 | ~1,88 mil millones | no disponible | apache-2.0 | HuggingFace (0 descargas) | Adaptador LoRA especializado en compresion de razonamiento; datos de compresion 2,0x-2,5x |
| Qwen/Qwen3.5-2B (modelo base) | ~2 mil millones | no disponible | no disponible en la informacion | HuggingFace | Modelo generalista sin la capa de compresion de razonamiento; sirve de referencia directa |
| Alternativas de ~1-3B con foco en razonamiento | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

No se dispone de resultados de benchmarks comparables ni de otros modelos de la misma categoria con datos verificables en la informacion suministrada, por lo que la comparacion cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Cero validacion externa: el modelo registra 0 descargas y 0 likes, y todas las cifras proceden del propio autor. No hay evaluacion independiente.
- Riesgo de perdida de matices: aunque el autor afirma una retencion del 100%, la compresion de texto implica siempre el riesgo de eliminar informacion contextual relevante, especialmente en tareas que dependen de matices, cortesia o ambiguedad.
- Riesgo de alucinacion: como cualquier modelo de 2B, puede generar contenido incorrecto; la compresion agresiva no corrige este comportamiento y podria dificultar su deteccion visual al eliminar explicaciones.
- Idiomas: no se declaran idiomas soportados; los datos de entrenamiento citados son en ingles, por lo que el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: no se especifica la longitud de contexto soportada por el ajuste.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial depende tambien de la licencia del modelo base Qwen/Qwen3.5-2B, no detallada en la informacion disponible.
- Naturaleza del artefacto: es un adaptador LoRA entrenado en 8 bits que requiere cargar el modelo base por separado, lo que anade complejidad al despliegue frente a un modelo unico.
- Casos de uso limitados: el modelo esta disenado como optimizador de estilo de razonamiento, no como asistente generalista, por lo que su aplicacion directa como chatbot de proposito general no es su objetivo.
- Repositorio de 3,3 GB: incluye pesos en varios formatos, lo que puede resultar pesado para un modelo de este tamano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Novasaki/Qwen3.5-2B-GrugSpeech-Q8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Conjunto de datos GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Conjunto de datos AI2 ARC: https://huggingface.co/datasets/allenai/ai2_arc
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
