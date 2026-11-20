# mdcreativeagent/Malaysian-Qwen2.5-7B-Reasoning-SFT

## Resumen

Malaysian-Qwen2.5-7B-Reasoning-SFT es un ajuste fino (SFT) del modelo mesolitica/Malaysian-Qwen2.5-7B-Instruct, desarrollado por el usuario mdcreativeagent. El objetivo es mejorar la capacidad de razonamiento del modelo en el contexto malasio: matematicas, ciencia, traduccion de dialectos, preguntas de opcion multiple, programacion y contenidos de Maktabah Al Bakri. Se entrena sobre el dataset mesolitica/Malaysian-Reasoning con todos los parametros y una longitud de contexto de 12k tokens.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only) con 7.615.616.512 parametros, lo que lo situa en la categoria de 7B. El repositorio ocupa 15,2 GB en safetensors y esta disponible unicamente en ese formato. Soporta malasio (ms) e ingles (en), y su licencia no esta especificada en la informacion proporcionada.

Es relevante para quienes necesitan un modelo pequeno que razone en malasio y traduzca dialectos regionales (johor, kedah, pahang, negeri sembilan, kelantan, penang, melaka) al malayo estandar y viceversa, con resultados medidos mediante CHRF max@5. El autor menciona tambien "warmup reasoning", un modo de razonamiento previo que no se detalla en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 12.000 tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Malasio (ms), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de todos los parametros sobre mesolitica/Malaysian-Qwen2.5-7B-Instruct, que a su vez deriva de la familia Qwen2.5. La arquitectura es un transformer decoder-only con 7.615.616.512 parametros. El entrenamiento se realizo con longitud de contexto completa de 12k tokens y los registros estan disponibles en Weights & Biases (enlace en la seccion de enlaces).

El dataset de entrenamiento es mesolitica/Malaysian-Reasoning, descrito por el autor como "highly curated". La model card no especifica el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las mejoras declaradas cubren razonamiento en matematicas, ciencia, traduccion, dialectos, opcion multiple, programacion y Maktabah Al Bakri, ademas de un "warmup reasoning" cuyo funcionamiento no se detalla. El codigo de entrenamiento esta publicado en el repositorio mesolitica/malaya, en el directorio session/qwen2.5.

## Capacidades

- Generacion de texto y razonamiento en malasio e ingles.
- Razonamiento matematico y cientifico, segun la model card.
- Traduccion entre dialectos malasios (johor, kedah, pahang, negeri sembilan, kelantan, penang, melaka) y malayo estandar, en ambos sentidos.
- Respuesta a preguntas de opcion multiple (evaluado con MalayMMLU).
- Generacion de codigo, segun la lista de mejoras declaradas.
- Contenidos de Maktabah Al Bakri (coleccion de textos religiosos malasios).
- "Warmup reasoning": modo de razonamiento previo mencionado por el autor, sin especificacion tecnica.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Traduccion de dialectos malasios a malayo estandar: el modelo puede normalizar textos escritos en dialectos regionales (kelantan, kedah, penang, etc.) para su publicacion o procesamiento posterior. Los benchmarks del autor reportan CHRF medios de 53,86 en dialecto a malayo y 50,24 en malayo a dialecto, lo que da una referencia cuantitativa de la calidad esperada.
- Atencion al cliente en malasio: con 12k tokens de contexto puede gestionar conversaciones multi-turno y consultas de usuarios que mezclan malasio coloquial, dialectos e ingles.
- Generacion de codigo asistida: la model card declara mejoras en programacion; puede integrarse en asistentes de IDE o pipelines de revision para equipos que trabajan en entornos malasios.
- Preparacion de examenes y material educativo: con mejoras declaradas en matematicas, ciencia y opcion multiple, es adecuado para generar preguntas tipo test y explicaciones en malasio.
- Procesamiento de textos religiosos: el entrenamiento incluye Maktabah Al Bakri, lo que permite tareas de consulta y resumen sobre ese corpus.
- Investigacion en NLP malasio: sirve como punto de partida para experimentos de razonamiento y traduccion de dialectos, con codigo de evaluacion publicado en el repositorio malaya.
- Traduccion malasio-ingles: al soportar ambos idiomas, puede emplearse en localizacion de documentacion tecnica y contenido web.

## Benchmarks y rendimiento

Resultados publicados por el autor. La traduccion de dialectos se evaluo con vLLM y sacrebleu CHRF max@5.

| Tarea | Direccion | CHRF max@5 |
|---|---|---|
| Traduccion de dialectos | johor a malayo | 53,80 |
| Traduccion de dialectos | kedah a malayo | 59,66 |
| Traduccion de dialectos | pahang a malayo | 54,61 |
| Traduccion de dialectos | negeri sembilan a malayo | 51,79 |
| Traduccion de dialectos | kelantan a malayo | 51,32 |
| Traduccion de dialectos | penang a malayo | 55,92 |
| Traduccion de dialectos | melaka a malayo | 49,89 |
| Traduccion de dialectos | promedio dialecto a malayo | 53,86 |
| Traduccion de dialectos | malayo a johor | 52,17 |
| Traduccion de dialectos | malayo a kedah | 53,25 |
| Traduccion de dialectos | malayo a pahang | 53,94 |
| Traduccion de dialectos | malayo a negeri sembilan | 36,27 |
| Traduccion de dialectos | malayo a kelantan | 37,56 |
| Traduccion de dialectos | malayo a penang | 53,42 |
| Traduccion de dialectos | malayo a melaka | 65,06 |
| Traduccion de dialectos | promedio malayo a dialecto | 50,24 |

MalayMMLU: la model card incluye secciones para Accuracy@1 y Accuracy@5, pero las tablas de resultados estan vacias en la informacion proporcionada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15,2 GB solo para pesos, mas memoria para KV cache y overhead; en la practica, 18-20 GB o mas segun la longitud de contexto.
- Cuantizacion: no se publican artefactos GGUF ni AWQ/GPTQ en el repositorio; habria que generarlos a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para fp16 con contexto largo; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden alojar el modelo en fp16 con contexto moderado.
- El autor entreno con un nodo de 8x H100 proporcionado por Nvidia y SNS.
- Opciones de despliegue: vLLM esta confirmado por el autor para la evaluacion; llama.cpp, Ollama o TGI requeririan conversion previa a GGUF u otro formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Malaysian-Qwen2.5-7B-Reasoning-SFT | 7,62B | 12k (entrenamiento) | ms, en | no disponible | Razonamiento y dialectos malasios |
| mesolitica/Malaysian-Qwen2.5-7B-Instruct (base) | 7B (familia Qwen2.5) | no disponible | ms, en | no disponible | Instrucciones en malasio |
| Qwen2.5-7B-Instruct (original) | 7B (familia Qwen2.5) | no disponible | multilingue | no disponible | Instrucciones generales |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; hay que contactar con el autor o consultar el modelo base antes de usarlo en produccion.
- Modelo con 0 descargas y 1 like en el momento de la consulta: sin validacion por parte de la comunidad.
- Dataset y proceso de curado no detallados: no se conoce el numero de tokens ni la composicion, lo que dificulta evaluar sesgos.
- Riesgo de alucinacion inherente a los modelos de 7B, especialmente en matematicas y contenidos religiosos.
- Los resultados de MalayMMLU estan vacios en la model card; no hay evidencia publicada de rendimiento en ese benchmark.
- La traduccion malayo a negeri sembilan (36,27) y malayo a kelantan (37,56) obtiene CHRF notablemente inferior al resto, lo que indica calidad desigual segun el dialecto.
- Contexto de entrenamiento de 12k tokens: no se garantiza un comportamiento fiable mas alla de esa longitud.
- Solo malasio e ingles; no hay soporte declarado para otros idiomas.
- El "warmup reasoning" no esta documentado tecnicamente, por lo que su efecto en produccion es dificil de predecir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/Malaysian-Qwen2.5-7B-Reasoning-SFT
- Modelo base: https://huggingface.co/mesolitica/Malaysian-Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mesolitica/Malaysian-Reasoning
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/huseinzol05/fpf-qwen2.5-7b-malaysian-12k-reasoning
- Codigo de entrenamiento: https://github.com/mesolitica/malaya/tree/master/session/qwen2.5
- Codigo de evaluacion de dialectos: https://github.com/mesolitica/malaya/tree/master/session/qwen2.5/evaluate-dialect
- Codigo de evaluacion de MalayMMLU: https://github.com/mesolitica/malaya/tree/master/session/qwen2.5/evaluate-malaymmlu
