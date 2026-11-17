# intel-ai/Qwen3-32B-MXFP4-AutoRound

## Resumen

Qwen3-32B-MXFP4-AutoRound es una version cuantizada del modelo denso Qwen/Qwen3-32B, publicada por el equipo de Intel (intel-ai) mediante su herramienta AutoRound. La cuantizacion aplica el esquema MXFP4 (W4A4, group size 32) sobre las proyecciones de atencion y MLP, manteniendo en BF16 las capas de embedding, `lm_head` y normalizaciones. El resultado es un checkpoint de aproximadamente 19,7 GB que reduce de forma notable el peso en memoria frente al modelo original en BF16.

El modelo base Qwen3-32B es un transformer denso de la familia Qwen3, orientado a generacion de texto, razonamiento y codigo, con licencia Apache 2.0. Esta version cuantizada conserva la licencia del modelo original y esta pensada para despliegue en entornos de inferencia que soporten el formato compressed-tensors MXFP4, en particular vLLM 0.29.0 o superior.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 32B con precision de 4 bits en pesos y activaciones, manteniendo segun el autor un 99,48 % de recuperacion media respecto al modelo BF16 en el conjunto de benchmarks reportado (GSM8K, MMLU, PIQA, HellaSwag). Es una opcion a considerar cuando el objetivo es reducir coste de VRAM y ancho de banda de memoria sin renunciar a la calidad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 64 capas |
| Parametros totales | 18.134.488.064 (segun safetensors); 31,206 B parametros logicos en las 448 capas Linear cuantizadas |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | MXFP4 (W4A4, group size 32, E2M1, escalas U8 E8M0, activaciones dinamicas); capas no cuantizadas en BF16 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 (hereda la del modelo base Qwen/Qwen3-32B) |
| Formato de pesos | safetensors (compressed-tensors), con `transform.safetensors` que contiene una matriz Hadamard F64 de 32 x 32 |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento del Qwen3-32B denso. La arquitectura subyacente es un transformer de 64 capas con atencion multi-cabeza y proyecciones MLP tipo SwiGLU (`gate_proj`, `up_proj`, `down_proj`). Sobre esa base, AutoRound aplica cuantizacion MXFP4 a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj` y a las tres proyecciones MLP en las 64 capas, cubriendo 448 modulos Linear. Las capas `lm_head`, `embed_tokens`, `input_layernorm`, `post_attention_layernorm`, `q_norm`, `k_norm` y `model.norm` se conservan en BF16. La KV cache no esta cuantizada en el checkpoint.

El proceso de cuantizacion emplea el algoritmo AWQ de AutoRound con `--iters 0` y `--disable_opt_rtn`, es decir, redondeo con transformacion Hadamard y sin optimizacion iterativa adicional. El checkpoint incluye un `transform_config` con una matriz Hadamard de 32 x 32 almacenada en `transform.safetensors`, aplicada en la primera capa (`model.layers.0.self_attn.q_proj.v_input.weight`). El runtime de despliegue debe soportar tanto el empaquetado MXFP4 de compressed-tensors como esta transformacion Hadamard. No se especifica la version de AutoRound utilizada en la generacion original.

## Capacidades

- Generacion de texto conversacional y de un solo turno, heredada del modelo base Qwen3-32B.
- Razonamiento y resolucion de problemas matematicos (el autor reporta GSM8K strict del 93,93 % en esta version cuantizada).
- Conocimiento general y respuesta a preguntas de cultura general (MMLU 78,90 %).
- Razonamiento de sentido comun y completado de frases (PIQA 79,82 %, HellaSwag 62,69 %).
- Generacion de codigo y tareas de programacion, como capacidad del modelo base (no se reportan benchmarks especificos de codigo en la informacion disponible).
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta version cuantizada; debe verificarse contra el modelo base.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada para esta version cuantizada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking y otras capacidades especiales del modelo base: no disponibles en la informacion proporcionada para esta version cuantizada.

## Casos de uso

- Despliegue de un asistente conversacional de 32B en GPU con VRAM limitada: la cuantizacion MXFP4 reduce el peso del checkpoint a unos 19,7 GB, lo que permite servir el modelo en una sola GPU de 24 GB o en configuraciones multi-GPU mas economicas que el BF16, manteniendo segun el autor un 99,48 % de recuperacion media en los benchmarks reportados.
- Razonamiento matematico y resolucion de problemas paso a paso: el modelo conserva un GSM8K strict del 93,93 %, por encima del BF16 reportado (91,28 %), lo que lo hace adecuado para tutoria automatica, verificacion de calculos y generacion de explicaciones matematicas.
- Generacion de codigo en pipelines de CI/CD: aunque no se reportan benchmarks de codigo para esta version, el modelo base Qwen3-32B esta orientado a programacion; la version cuantizada puede integrarse en flujos de revision de codigo, generacion de tests y documentacion tecnica alli donde el runtime soporte MXFP4.
- Evaluacion de conocimiento general y respuesta a preguntas: con un MMLU del 78,90 %, es util para sistemas de FAQ, bases de conocimiento internas y asistentes de documentacion tecnica que requieran un modelo de 32B con contexto amplio.
- Prototipado e investigacion en cuantizacion: al ser un checkpoint AutoRound MXFP4 publicado por Intel, sirve como referencia para comparar tecnicas de cuantizacion W4A4 frente a BF16 y a otros esquemas como NVFP4, en entornos de investigacion sobre eficiencia de inferencia.
- Servicio de inferencia de alto rendimiento con vLLM: el modelo esta pensado para desplegarse con `vllm serve intel-ai/Qwen3-32B-MXFP4-AutoRound`, aprovechando el soporte de compressed-tensors MXFP4 y de la transformacion Hadamard incluida en el checkpoint.

## Benchmarks y rendimiento

| Modelo | Precision | GSM8K (strict) | MMLU | PIQA | HellaSwag | Media | Recuperacion |
|---|---|---:|---:|---:|---:|---:|---:|
| Qwen/Qwen3-32B | BF16 | 91,28 | 80,77 | 81,01 | 63,92 | 79,25 | — |
| intel-ai/Qwen3-32B-MXFP4-AutoRound | MXFP4 | 93,93 | 78,90 | 79,82 | 62,69 | 78,84 | 99,48 % |

Los valores se presentan como porcentajes segun los resultados de comparacion facilitados por el autor. La media y la recuperacion se conservan tal como se suministraron, sin recalcular a partir de los valores redondeados por tarea. La recuperacion es relativa a la media BF16 de 79,25. No se han publicado en la informacion disponible resultados de benchmarks adicionales (HumanEval, MT-Bench, etc.) ni comparaciones con otros modelos cuantizados mas alla de la referencia a NVFP4 mencionada en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 19,7 GB en disco en MXFP4; en inferencia hay que sumar la KV cache (no cuantizada) y el overhead del runtime. Como referencia orientativa, el modelo puede caber en una GPU de 24 GB con contexto moderado, y con mas holgura en GPU de 40 GB o 80 GB.
- GPU recomendadas: A100 (40 GB u 80 GB), H100 (80 GB), L40S (48 GB) y GPUs consumer de gama alta con 24 GB o mas (RTX 4090, RTX 5090) para contextos reducidos. No se dispone de mediciones de latencia o throughput en la informacion proporcionada.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) y RTX 5090 (32 GB) con contexto limitado; en GPUs de 16 GB no es viable sin tecnicas adicionales de offload.
- Opciones de despliegue: vLLM 0.29.0 o superior (soporte de compressed-tensors MXFP4 y `transform_config` con Hadamard). Otros runtimes como llama.cpp, Ollama o TGI no estan confirmados para este formato en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Contexto | Media benchmarks reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| intel-ai/Qwen3-32B-MXFP4-AutoRound | 18,13 B (safetensors); 31,2 B logicos en capas Linear | MXFP4 (W4A4) | No disponible | 78,84 | Apache 2.0 | Hugging Face (intel-ai) |
| Qwen/Qwen3-32B | 32 B (modelo base) | BF16 | No disponible | 79,25 | Apache 2.0 | Hugging Face (Qwen) |
| Version NVFP4 de referencia | No disponible | NVFP4 | No disponible | No disponible | No disponible | No disponible |

La model card menciona una fila NVFP4 como referencia de comparacion, pero no se transcriben sus valores porque NVIDIA reporta una suite de benchmarks distinta. No se dispone de datos de otros modelos cuantizados comparables (por ejemplo, variantes GPTQ o AWQ de Qwen3-32B) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo puede producir salidas factualmente incorrectas; no debe usarse como fuente de informacion veraz sin verificacion.
- Riesgo de generar contenido soez, sesgado u ofensivo debido a las limitaciones del modelo preentrenado y de los datasets de ajuste; se recomienda realizar pruebas de seguridad antes de desplegar.
- La cuantizacion MXFP4 introduce error en pesos y activaciones; segun el autor, las proyecciones MLP concentran la mayor parte de los parametros cuantizados y, por tanto, la mayor parte del error de cuantizacion.
- El checkpoint requiere un runtime que soporte el empaquetado MXFP4 de compressed-tensors y la transformacion Hadamard incluida; no es compatible con runtimes genericos que no implementen `transform_config`.
- La KV cache no esta cuantizada en el checkpoint, por lo que el consumo de memoria en contexto largo puede ser elevado.
- No se dispone de informacion sobre idiomas soportados, longitud de contexto ni capacidades de tool calling o agentes para esta version cuantizada; deben validarse contra el modelo base antes de usarla en produccion.
- La licencia Apache 2.0 hereda las condiciones del modelo base; el autor advierte que la licencia del modelo no constituye asesoramiento legal y recomienda consultar a un abogado antes de un uso comercial.
- El modelo tiene un numero muy bajo de descargas y likes en el momento de la ficha (41 descargas, 0 likes), lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/Qwen3-32B-MXFP4-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Repositorio AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
