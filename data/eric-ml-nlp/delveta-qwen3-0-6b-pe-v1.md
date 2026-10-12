# eric-ml-nlp/Delveta-Qwen3-0.6B-PE-v1

## Resumen

Delveta-Qwen3-0.6B-PE-v1 es un modelo pequeno de 596.049.920 parametros (~0,6 B) especializado en una unica tarea: la extraccion de parametros (slot filling) para llamadas a herramientas. Lo publica el usuario eric-ml-nlp y parte del modelo iromu/Qwen3-0.6B-tools, cuyo origen ultimo es Qwen/Qwen3-0.6B. No es un modelo de chat general ni un clasificador de capacidades: recibe una capacidad ya decidida por un router externo, el esquema de slots permitidos para esa capacidad y la consulta del usuario, y devuelve una unica llamada a herramienta con un objeto JSON plano de argumentos.

El problema que resuelve es concreto dentro de pipelines de agentes: separar la decision de que herramienta usar de la extraccion de los argumentos que esa herramienta necesita. Al fijar la funcion mediante `tool_choice = "required"` y exponer solo los slots de esa capacidad, el modelo se limita a rellenar el JSON, lo que reduce el espacio de salida y hace medible el error (nombre de funcion incorrecto o argumentos no objeto cuentan como fallo duro, sin fallback a contenido de texto).

Su relevancia actual esta en el nicho de modelos muy pequenos desplegables en entornos con recursos limitados: 0,6 B de parametros entrenados con LoRA SFT durante unos 60 minutos en una sola NVIDIA A30, con artefactos publicados en safetensors, ONNX y GGUF. La model card declara un `exact_match` de 0,9933 y una `field_accuracy` de 0,9953 en el split de validacion (1041 filas), aunque el propio autor advierte que el split de test y el benchmark Formal-500 no se evaluaron en esta release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), 28 capas, hidden size 1024, vocabulario 151936, embeddings atados |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max_sequence_length = 1024) |
| Tipos de cuantizacion | no se detallan cuantizaciones concretas; el repo incluye artefactos en safetensors, ONNX y GGUF |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-0.6B original: transformer decoder-only con 28 capas, dimension oculta 1024, vocabulario de 151936 tokens y embeddings atados. Sobre el checkpoint iromu/Qwen3-0.6B-tools (revision `10e61428cfbcc907c84d52a6b9d7505903aedd12`) se aplico un LoRA SFT con PEFT: r = 8, alpha = 16, dropout = 0.0, bias = none y modulos objetivo `q_proj, k_proj, v_proj, o_proj`. Los pesos base permanecieron congelados y el adaptador se fusiono despues del entrenamiento. El total de parametros entrenables fue de 2.293.760.

El entrenamiento duro 3 epocas, 1629 pasos de optimizador completados, batch efectivo 8 x 2 = 16, learning rate 2e-4 con scheduler coseno y warmup del 3 %, precision bf16 con gradient checkpointing y longitud maxima de secuencia 1024. La perdida final de entrenamiento fue 0.00442 y la perdida final de evaluacion (validacion) 0.0009873. El entrenamiento completo llevo aproximadamente 3603 segundos (~60 minutos) en 1 x NVIDIA A30 (24 GB), con un pico de memoria de unos 18,7 GB. La seleccion de checkpoint se hizo sobre el split de validacion con la metrica `exact_match` y desempate por menos slots requeridos ausentes, mayor `field_accuracy` y menor numero de paso, lo que dio como resultado el checkpoint-1000.

## Capacidades

- Extraccion de parametros y slot filling: convierte una consulta de usuario en los argumentos de una unica funcion previamente fijada.
- Emision de una sola llamada a herramienta por turno, leida desde `message.tool_calls`.
- Cumplimiento estricto del contrato OpenAI: `messages` + `tools` nativos con `tool_choice = "required"`.
- Salida de argumentos como objeto JSON plano `{slot: value}`, sin envoltorio anidado `{"arguments": {...}}`.
- Restriccion al esquema expuesto: solo se rellenan los slots que pertenecen a la capacidad fijada.
- Soporte multilingue limitado a chino (zh) e ingles (en) segun los metadatos del modelo.
- No realiza seleccion de capacidad ni clasificacion de intenciones (eso ocurre aguas arriba).
- No es un modelo de chat general: la model card indica explicitamente que no debe usarse como tal.

## Casos de uso

- Orquestacion de agentes con router externo: un clasificador decide la capacidad y Delveta-PE rellena los argumentos de esa capacidad, de modo que cada herramienta se invoca con un JSON validado por esquema.
- Busqueda web asistida: dada la capacidad `cap-web-search`, el modelo extrae los terminos y filtros de la consulta del usuario y genera la llamada con los slots correspondientes.
- Recuperacion aumentada (RAG): para `cap-rag-search`, transforma la pregunta en los parametros de consulta (consulta, coleccion, filtros) que espera el recuperador, con `exact_match` de 1,0 declarado en validacion sobre 171 filas.
- Traduccion integrada en pipeline: con `cap-translate`, extrae idioma origen, idioma destino y texto a traducir, evitando que el motor de traduccion tenga que interpretar lenguaje natural.
- Gestion documental automatizada: con `cap-create-folder`, genera los argumentos de creacion de carpetas (nombre, ruta, jerarquia) a partir de instrucciones del usuario.
- Busqueda en redes sociales: con `cap-social-search`, construye los parametros de busqueda social; es la unica capacidad con rendimiento no perfecto en validacion (0,96 sobre 175 filas).
- Indizacion de terminologia: con `cap-add-term`, extrae el termino y su dominio (por ejemplo, "offline benchmark" / "information retrieval") para alimentar un glosario o un indice de conceptos.
- Sustitucion de prompts largos por contratos de herramienta: al fijar el esquema de slots, se reduce la superficie de salida y se simplifica la validacion en produccion, al no existir fallback a texto libre.

## Benchmarks y rendimiento

Los unicos datos publicados son metricas de validacion (split de 1041 filas), no de test. La model card advierte que el split de test y el benchmark Formal-500 no se evaluaron en esta release, por lo que estas cifras no deben leerse como accuracy de produccion.

| Capacidad | n | exact_match | field_accuracy | required_accuracy | required_missing | illegal_slot | parse_rate |
|---|---:|---:|---:|---:|---:|---:|---:|
| cap-add-term | 173 | 1.0 | 1.0 | 1.0 | 0.0 | 0.0 | 1.0 |
| cap-create-folder | 175 | 1.0 | 1.0 | 1.0 | 0.0 | 0.0 | 1.0 |
| cap-rag-search | 171 | 1.0 | 1.0 | 1.0 | 0.0 | 0.0 | 1.0 |
| cap-social-search | 175 | 0.96 | 0.9626 | 0.96 | 0.0 | 0.0 | 1.0 |
| cap-translate | 180 | 1.0 | 1.0 | 1.0 | 0.0 | 0.0 | 1.0 |
| cap-web-search | 167 | 1.0 | 1.0 | 1.0 | 0.0 | 0.0 | 1.0 |
| overall | 1041 | 0.9933 | 0.9953 | 0.9942 | 0.0 | 0.0 | 1.0 |

Seleccion de checkpoint sobre validacion (metrica `exact_match`):

| Paso | exact_match | field_accuracy | required_missing | illegal_slot | parse_rate |
|---:|---:|---:|---:|---:|---:|
| 200 | 0.9750 | 0.9826 | 0.0 | 0.0 | 1.0 |
| 400 | 0.9875 | 0.9913 | 0.0 | 0.0 | 1.0 |
| 600 | 0.9914 | 0.9940 | 0.0 | 0.0 | 1.0 |
| 800 | 0.9846 | 0.9893 | 0.0 | 0.0 | 1.0 |
| 1000 (seleccionado) | 0.9933 | 0.9953 | 0.0 | 0.0 | 1.0 |
| 1200 | 0.9914 | 0.9940 | 0.0 | 0.0 | 1.0 |
| 1400 | 0.9933 | 0.9953 | 0.0 | 0.0 | 1.0 |
| 1600 | 0.9923 | 0.9946 | 0.0 | 0.0 | 1.0 |
| 1629 | 0.9933 | 0.9953 | 0.0 | 0.0 | 1.0 |

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 596.049.920 parametros, sin overhead de runtime): ~1,2 GB en bf16/fp16, ~2,4 GB en fp32, ~0,6 GB en int8 y ~0,3 GB en int4. Hay que sumar la memoria del contexto y del runtime.
- GPU utilizada en el entrenamiento: 1 x NVIDIA A30 (24 GB), con un pico de unos 18,7 GB durante el LoRA SFT. La inferencia requiere bastante menos.
- Cabe con holgura en GPU de consumo: cualquier tarjeta con 4-8 GB de VRAM es suficiente en fp16 o cuantizado (por ejemplo, RTX 3060, RTX 4060, RTX 4090). Tambien es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue segun los formatos publicados y las etiquetas del repo: transformers (safetensors), ONNX Runtime (ONNX) y llama.cpp / Ollama u otros runners GGUF. El soporte de vLLM o TGI no se menciona en la informacion proporcionada.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Delveta-Qwen3-0.6B-PE-v1 | 596.049.920 | no disponible | Extraccion de parametros / slot filling (una unica tool call) | Apache-2.0 | HuggingFace (safetensors, ONNX, GGUF) |
| iromu/Qwen3-0.6B-tools | no disponible | no disponible | Modelo base afiliado a herramientas | no disponible | HuggingFace |
| Qwen/Qwen3-0.6B | 0,6 B (segun model card) | no disponible | Modelo generalista de la familia Qwen3 | Apache-2.0 (segun model card) | HuggingFace |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada. La comparacion publicada de Delveta-PE-v1 es contra su propio checkpoint base a lo largo del entrenamiento, no contra otros modelos de la misma categoria.

## Limitaciones y advertencias

- Alcance restringido: el modelo solo extrae parametros. No elige la capacidad, no clasifica intenciones y no debe usarse como modelo de chat general.
- No existe fallback a texto: si el nombre de la funcion no coincide con `capability_id` o los argumentos no son un objeto, se considera un fallo duro de extraccion.
- Las cifras de 0,9933 de `exact_match` corresponden al split de validacion. El split de test y el benchmark Formal-500 no se evaluaron, por lo que no hay evidencia publicada de generalizacion.
- `cap-social-search` es la unica capacidad con errores en validacion (0,96 sobre 175 filas); el resto de capacidades son exactas en todas las filas evaluadas.
- Cobertura idiomatica declarada limitada a chino e ingles (zh, en); el rendimiento en castellano u otros idiomas no esta documentado.
- Contaminacion potencial entre las capacidades de entrenamiento y el uso real: los nombres de capacidad evaluados (`cap-add-term`, `cap-create-folder`, `cap-rag-search`, `cap-social-search`, `cap-translate`, `cap-web-search`) son los del conjunto de datos; capacidades nuevas no evaluadas podrian comportarse de forma distinta.
- Longitud de contexto no especificada: el entrenamiento uso secuencias de 1024 tokens, asi que consultas o historiales mas largos podrian degradar la extraccion.
- Licencia Apache-2.0, que permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y licencia correspondientes y se cumplan las condiciones de la licencia del modelo base.
- Modelo sin traccion en el momento de la consulta: 0 descargas y 0 likes, sin senales de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eric-ml-nlp/Delveta-Qwen3-0.6B-PE-v1
- Modelo base: https://huggingface.co/iromu/Qwen3-0.6B-tools
- Raiz upstream: Qwen/Qwen3-0.6B
- Configuracion de entrenamiento: https://github.com/Eric-LLMs/Delveta/blob/main/scripts/qwen_parameter_extraction_finetune/config.yaml
- Scripts de entrenamiento: https://github.com/Eric-LLMs/Delveta/tree/main/scripts/qwen_parameter_extraction_finetune
- Informe del experimento de fine-tuning: https://github.com/Eric-LLMs/Delveta/blob/main/docs/experiments/qwen3-0.6b-parameter-extraction-finetuning.md
