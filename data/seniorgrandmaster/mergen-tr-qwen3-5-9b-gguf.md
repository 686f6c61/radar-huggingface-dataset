# SeniorGrandMaster/Mergen-TR-Qwen3.5-9B-GGUF

## Resumen

Mergen-TR-Qwen3.5-9B es un modelo de lenguaje de aproximadamente 9.500 millones de parametros orientado al turco y construido sobre Qwen3.5-9B. Lo desarrolla el usuario SeniorGrandMaster (con pesos originales publicados bajo el identificador `dogukanvzr/Mergen-TR-Qwen3.5-9B`) y se distribuye aqui en formato GGUF para inferencia cuantizada. Su proposito es reforzar el razonamiento matematico, el chain-of-thought y la generacion en turco mediante post-entrenamiento sobre un corpus nativo, conservando el conocimiento del modelo base.

La relevancia del modelo radica en su relacion tamano-rendimiento en benchmarks turcos: con 9B parametros declara puntuaciones de 74,3 en Turkish-MMLU y 84,4 en TurkishMMLU con CoT, situandose en la banda de modelos de 27B-70B. Incorpora un modo hibrido de razonamiento (thinking / non-thinking) activable por plantilla de chat, lo que permite alternar entre respuestas razonadas y respuestas directas.

La arquitectura subyacente corresponde a Qwen3.5-9B (transformer denso, sin mezcla de expertos segun los datos disponibles) y la licencia es Apache-2.0. La model card no detalla la longitud de contexto nativa del modelo base; en evaluacion se uso una ventana de hasta 16K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-9B); no se detalla mas en la model card |
| Parametros totales | ~9,5B |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | hasta 16K usados en evaluacion; contexto nativo del base no disponible |
| Tipos de cuantizacion | GGUF (este repositorio); cuantizaciones concretas no disponibles; bf16 en el modelo original |
| Idiomas soportados | Turco (principal); otros idiomas no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo original `dogukanvzr/Mergen-TR-Qwen3.5-9B` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de ~9,5B parametros, y se somete a post-entrenamiento supervisado (SFT) seguido de optimizacion de preferencias. La model card indica ~277.000 ejemplos supervisados y ~15.000 pares de preferencia, construidos de forma nativa en turco (no traduccion automatica masiva). La composicion aproximada del corpus incluye 64.000 ejemplos de matematicas y problemas verbales, 64.000 de conocimiento y opcion multiple (incluidas humanidades), 20.000 de cultura, 15.000 de QA extractivo, 13.000 de clasificacion, 13.000 de correccion gramatical, 12.000 de traduccion, 12.000 de inferencia en lenguaje natural, 11.000 de resumen, 10.000 de sentido comun estilo HellaSwag y bloques menores de instrucciones y NER.

La innovacion destacable es el modo hibrido de razonamiento: `enable_thinking=True` activa cadenas de pensamiento delimitadas por etiquetas `<think>`, y `enable_thinking=False` produce respuestas directas. La evaluacion se realizo con decodificacion greedy (`do_sample=False`, `repetition_penalty=1.05`) y presupuestos de generacion amplios (8.192 tokens para Turkish-MMLU, 16.384 para TurkishMMLU y GSM8K-TR), con un parser de respuestas consciente del bloque de pensamiento en tres capas. No se mencionan tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto en turco con conocimiento cultural y linguistico reforzado.
- Razonamiento matematico y resolucion de problemas verbales (GSM8K-TR).
- Chain-of-thought activable y desactivable por plantilla de chat.
- Conocimiento y respuesta a preguntas de opcion multiple en humanidades y ciencias.
- Correccion gramatical, clasificacion de texto, inferencia en lenguaje natural y resumen.
- Traduccion (12.000 ejemplos en el corpus de entrenamiento; idiomas par no especificados).
- QA extractivo y reconocimiento de entidades nombradas (NER).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente; el modo thinking habilita cadenas de razonamiento largas.
- Vision y audio: no disponibles.

## Casos de uso

- Evaluacion academica en turco: el modelo puede responder preguntas de opcion multiple de curriculo (matematicas, fisica, quimica, geografia) con modo thinking activado y presupuesto de generacion amplio, aprovechando su puntuacion de 84,4 en TurkishMMLU con CoT.
- Tutoria matematica en turco: resolucion paso a paso de problemas verbales de primaria y secundaria, con la cadena de razonamiento visible para el estudiante y una tasa declarada de 87,5 en GSM8K-TR.
- Generacion de contenido editorial en turco: redaccion y resumen de textos con el modo non-thinking para respuestas directas y baja latencia.
- Correccion y normalizacion de texto: el corpus incluye 13.000 ejemplos de correccion gramatical, adecuado para pipelines de limpieza de documentos o preprocesado de datos turcos.
- Clasificacion y NER en produccion: etiquetado de documentos, extraccion de entidades y clasificacion de textos turcos en lotes con vLLM.
- Traduccion asistida: borradores de traduccion en pares de idiomas cubiertos por el corpus, con revision humana posterior dado que la model card no detalla la calidad por par.
- Despliegue en hardware de consumo: la version GGUF permite ejecucion local con llama.cpp u Ollama para prototipos y pruebas offline en turco.

## Benchmarks y rendimiento

| Benchmark | Mergen-TR-Qwen3.5-9B | Referencia comparada | Notas |
|---|---:|---:|---|
| Turkish-MMLU (leaderboard, 6.200 preguntas) | 74,3 | Llama 3.1 70B: 70,4; Qwen3 14B: 71,7; Gemma 2 27B: 72,1; Gemma 3 27B: 75,1 | Muestra estratificada n=1.895; comparativas del leaderboard oficial, no mismo harness |
| TurkishMMLU (Yuksel et al. 2024), CoT | 84,4 | Claude 3 Opus: 81,8; GPT-4 Turbo: 79,2 | Set completo de 900 preguntas; comparativas del paper original |
| GSM8K-TR | 87,5 | Base model: +1,2 menos | n=256 |

Protocolo: thinking ON, greedy, `max_new_tokens` de 8.192 (Turkish-MMLU) y 16.384 (TurkishMMLU, GSM8K-TR), parser de tres capas con `no_answer = 0`. La model card advierte que las filas comparativas no comparten harness y corresponden a los mejores valores publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la model card; para un modelo denso de ~9,5B, las cuantizaciones GGUF tipicas (Q4-Q8) requieren del orden de 6-10 GB, y bf16 alrededor de 19 GB, como estimacion estandar de la clase de tamano.
- GPU recomendadas: no especificadas por el autor. Para bf16, GPUs con 24 GB o mas (RTX 4090, A100, H100). Para GGUF cuantizado, GPUs de consumo con 8-12 GB.
- Cabe en GPU de consumo: si, mediante las cuantizaciones GGUF de este repositorio; cuantizaciones concretas no listadas.
- Opciones de despliegue: vLLM (comando documentado con `--dtype bfloat16 --max-model-len 16384`), Transformers, y llama.cpp/Ollama por el formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Turkish-MMLU | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Mergen-TR-Qwen3.5-9B | ~9,5B | 16K en evaluacion | 74,3 | Apache-2.0 | HuggingFace (GGUF y safetensors) |
| Qwen3 14B | 14B | no disponible | 71,7 | no disponible en la informacion | HuggingFace |
| Gemma 2 27B | 27B | no disponible | 72,1 | no disponible en la informacion | HuggingFace |
| Llama 3.1 70B | 70B | no disponible | 70,4 | no disponible en la informacion | HuggingFace |

Las puntuaciones de los competidores proceden del leaderboard publico de Turkish-MMLU citado por el autor y no comparten harness con la evaluacion de Mergen-TR.

## Limitaciones y advertencias

- El modelo esta especializado en turco; su rendimiento en otros idiomas no esta documentado y probablemente sea inferior al del base.
- La lengua y literatura turcas es, segun el autor, el area mas debil y objetivo de trabajo futuro.
- Riesgo de alucinacion no cuantificado; no se publican tasas de fidelidad ni evaluaciones de veracidad.
- Sesgos conocidos: no documentados en la model card.
- El modo thinking requiere presupuestos de generacion amplios (8K-16K tokens); con limites cortos la calidad cae por truncamiento de la cadena de razonamiento.
- Las comparativas de benchmarks no usan el mismo harness que los modelos de referencia, lo que limita la comparabilidad directa.
- El repositorio GGUF no especifica que cuantizaciones incluye ni sus tamanos; conviene verificar antes de desplegar.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B debe verificarse por separado para confirmar compatibilidad.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion independiente de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SeniorGrandMaster/Mergen-TR-Qwen3.5-9B-GGUF
- Modelo original (safetensors, citado en la model card): https://huggingface.co/dogukanvzr/Mergen-TR-Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper TurkishMMLU (Yuksel et al. 2024): https://arxiv.org/abs/2407.12402
- Paper referenciado en tags: https://arxiv.org/abs/2407.12402
