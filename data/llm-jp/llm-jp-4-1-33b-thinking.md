# llm-jp/llm-jp-4.1-33b-thinking

## Resumen

llm-jp-4.1-33b-thinking es un modelo de lenguaje de 33.219.548.160 parámetros desarrollado por el Centro de Investigación y Desarrollo de Grandes Modelos de Lenguaje del Instituto Nacional de Informática de Japón (NII). Forma parte de la serie LLM-jp-4.1, que incluye variantes densas de 8B y 33B y una variante MoE de 32B-A3B. Esta ficha cubre la variante densa de 33B en su versión "thinking", orientada a razonamiento explícito antes de responder.

Se trata de un transformer denso de 64 capas, tamaño oculto 5.120, 40 cabezas de atención y una ventana de contexto de 65.536 tokens. Está entrenado sobre 11,7 billones de tokens en un pipeline de preentrenamiento y mid-training, y posteriormente alineado con SFT y DPO, sin refuerzo con aprendizaje por refuerzo (RL). La licencia es Apache 2.0, lo que permite uso comercial sin las restricciones típicas de otros modelos de pesos abiertos.

Su relevancia actual radica en tres factores: cubre el hueco de modelos de razonamiento de tamaño medio-alto con soporte nativo de japonés e inglés, publica tanto los corpus de preentrenamiento como los conjuntos de SFT y DPO, y adopta una plantilla de chat compatible con el formato OpenAI Harmony. Todo ello con pesos abiertos bajo licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder), basado en llama |
| Parametros totales | 33.219.548.160 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | no disponible en la model card; el repositorio solo distribuye safetensors |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Capas | 64 |
| Tamano oculto | 5.120 |
| Cabezas de atencion | 40 |
| Parametros de embedding | 1.006.632.960 |
| Parametros no de embedding | 32.212.915.200 |
| Tokenizer | Unigram byte-fallback (huggingface/tokenizers), vocabulario derivado de llm-jp-tokenizer v4.0 |
| Tamano del repositorio | 132,9 GB |
| Descargas / likes | 546 / 10 |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-28 |

## Arquitectura y entrenamiento

El modelo es un transformer denso tipo decoder con 64 capas, dimension oculta de 5.120, 40 cabezas de atencion y 65.536 tokens de contexto. La model card no especifica si emplea Grouped Query Attention ni el numero de cabezas KV. El tokenizer es un modelo Unigram con byte-fallback implementado sobre huggingface/tokenizers, cuyo vocabulario procede de llm-jp-tokenizer v4.0. El tamano del repositorio (132,9 GB) equivale aproximadamente a 4 bytes por parametro, lo que sugiere que los safetensors distribuidos estan en fp32.

El entrenamiento sigue un pipeline multietapa: fases de preentrenamiento y mid-training con un total de 11,7 billones de tokens. Los corpus empleados estan publicados en GitLab (llm-jp-corpus-v4.1 y llm-jp-corpus-midtraining-v2), con la salvedad de que algunas porciones quedaron excluidas de la publicacion por restricciones de licencia. La fase de post-entrenamiento consiste en ajuste supervisado (SFT) seguido de optimizacion directa de preferencias (DPO); la model card indica explicitamente que no se empleo aprendizaje por refuerzo.

La innovacion mas destacable no esta en la arquitectura, sino en el formato de interaccion: la plantilla de chat es compatible con el formato OpenAI Harmony, pero el tokenizer difiere del que asume la libreria `openai-harmony`, por lo que la tokenizacion directa con esa libreria no funciona y hay que usar el tokenizer propio del modelo. La variante "thinking" admite control via `reasoning_effort`, que en la evaluacion oficial se fijo en `high`.

## Capacidades

- Generacion de texto conversacional en ingles y japones, con ventana de contexto de 65.536 tokens.
- Modo de razonamiento explicito ("thinking"): la model card describe el control de esfuerzo de razonamiento mediante `reasoning_effort`.
- Generacion de codigo en C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript, segun los idiomas de programacion declarados en la model card.
- Matematicas y problemas de competicion: la evaluacion incluye Math 500, AIME 2024/2025/2026, MCLM Math 100 y PolyMath JA.
- Conocimiento y respuesta a preguntas: JAM-CQA, JEMHopQA, JMMLU, MMLU-ProX JA y MMLU-ProX EN.
- Seguimiento de instrucciones: MIFEval JA e IFBench.
- Traduccion automatica en los pares EN-JA y JA-EN (WMT20).
- Tool calling / function calling: la evaluacion oficial incluye una categoria dedicada a tool calling, aunque los resultados numericos no se incluyen en la informacion disponible.
- Capacidades cientificas evaluadas mediante GPQA Diamond y JGPQA Diamond.
- Evaluacion de seguridad incluida en el conjunto de pruebas oficial, sin resultados numericos publicados en la informacion disponible.

## Casos de uso

- Atencion al cliente en japones: con 65.536 tokens de contexto, el modelo puede mantener conversaciones multi-turno con historial largo y documentacion de producto adjunta sin truncar; su licencia Apache 2.0 permite desplegarlo en produccion comercial sin negociacion adicional.
- Agente de razonamiento multi-paso: el modo thinking permite separar la cadena de razonamiento de la respuesta final, lo que facilita auditar decisiones en flujos de agente que encadenan llamadas a herramientas.
- Asistente de codigo interno: cubre 13 lenguajes declarados (Python, Rust, TypeScript, Go, Scala, entre otros) y puede integrarse en pipelines de revision de codigo o generacion de tests dentro de un CI/CD.
- Traduccion tecnica EN-JA: el par ingles-japones es el eje del modelo y esta evaluado en WMT20; resulta adecuado para localizar documentacion tecnica y articulos cientificos.
- Razonamiento matematico asistido: util para resolver y verificar problemas de nivel universitario o de competicion, con la cadena de razonamiento accesible para revision.
- Analisis de documentacion larga: informes, expedientes o bases de conocimiento de decenas de miles de tokens pueden procesarse en una sola pasada gracias a la ventana de 65.536 tokens.
- Generacion de datos sinteticos en japones: al ser un modelo abierto con pesos y datos de entrenamiento publicados, sirve como generador para aumentar corpus japoneses en proyectos de investigacion.
- Investigacion academica sobre alineacion: la publicacion de los conjuntos de SFT y DPO y la ausencia de RL en el post-entrenamiento permiten estudiar el efecto de DPO en aislamiento.

## Benchmarks y rendimiento

La model card describe la suite de evaluacion `swallow-evaluation-instruct`, que abarca seis categorias (matematicas, ciencia, conocimiento y QA, codigo, seguimiento de instrucciones y traduccion automatica), pero los valores numericos no se incluyen en la informacion disponible: el texto se corta antes de mostrar la figura con las puntuaciones y los resultados detallados remiten al blog tecnico.

| Categoria | Benchmarks incluidos | Resultado |
|---|---|---|
| Matematicas | Math 500, AIME 2024/2025/2026 (pass@1, pass@32), MCLM Math 100 (pass@1, pass@4), PolyMath JA High, PolyMath JA Top | no disponible |
| Ciencia | GPQA Diamond (pass@1, pass@4), JGPQA Diamond | no disponible |
| Conocimiento y QA | JAM-CQA, JEMHopQA, JMMLU, MMLU-ProX JA, MMLU-ProX EN | no disponible |
| Codigo | LiveCodeBench v6 (pass@1, pass@10), JHumanEval (pass@1, pass@10), HumanEval+ (pass@1, pass@10) | no disponible |
| Seguimiento de instrucciones | MIFEval JA, IFBench | no disponible |
| Traduccion automatica | WMT20 EN-JA, WMT20 JA-EN | no disponible |
| Tool calling | categoria incluida en la evaluacion oficial | no disponible |

Modelos de referencia empleados en la evaluacion comparativa: gpt-oss, Olmo-3-7B-Think, Olmo-3.1-32B-Think, Qwen3, Qwen3.5, Qwen3.6, Qwen3.8-27B, Gemma 4 y Muse-Glimmer-30B. Para los modelos LLM-jp y gpt-oss se fijo `reasoning_effort` en `high`; en Qwen3.x y Gemma 4 se activo `enable_thinking`; en Qwen3.8-27B y Muse-Glimmer-30B se uso `reasoning_effort: xhigh`.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros y del numero de capas; la model card no publica requisitos de hardware ni datos de latencia.

- Pesos en fp32 (formato probable del repositorio, ~4 bytes/parametro): aproximadamente 133 GB, requiere al menos dos aceleradores de 80 GB.
- Pesos en bf16/fp16 (~2 bytes/parametro): aproximadamente 66,5 GB, lo que exige una GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- Pesos en int8: aproximadamente 33 GB, viable en A100 40 GB o en dos RTX 4090 de 24 GB.
- Pesos en int4: aproximadamente 17 GB, cabe en una RTX 4090 o RTX 3090 de 24 GB, aunque con margen reducido para la cache KV.
- Cache KV: con 64 capas, 40 cabezas y dimension de cabeza de 128, la estimacion es de aproximadamente 1,31 MB por token en bf16 asumiendo atencion multi-cabeza sin GQA (el numero de cabezas KV no se especifica en la informacion disponible). A 65.536 tokens esto supondria del orden de 86 GB adicionales, cifra orientativa que hay que recalcular si el modelo usa GQA.
- GPU recomendadas: H100 80 GB o A100 80 GB para fp16/bf16 sin cuantizar; A100 40 GB o 2x RTX 4090 para int8; RTX 4090/3090 para int4.
- Opciones de despliegue: transformers (libreria declarada) y text-generation-inference (tag oficial). No hay GGUF oficial publicado, por lo que llama.cpp y Ollama requeririan conversion propia. El campo `inference: false` de la model card debe interpretarse como que no se ofrece endpoint de inferencia gestionado, no como una limitacion tecnica.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de especificaciones de los modelos alternativos en la informacion proporcionada; solo se conocen las referencias usadas en la evaluacion oficial del propio autor.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llm-jp-4.1-33b-thinking | 33,2B (denso) | 65.536 | no disponible | Apache 2.0 | pesos abiertos en HuggingFace |
| llm-jp-4.1-8b-thinking | 8,59B (denso) | 65.536 | no disponible | Apache 2.0 (misma serie) | pesos abiertos en HuggingFace |
| llm-jp-4.1-32b-a3b-thinking | 32,14B totales / 3,83B activos (MoE) | 65.536 | no disponible | Apache 2.0 (misma serie) | pesos abiertos en HuggingFace |
| Qwen3.5 / Qwen3.6 | no disponible | no disponible | no disponible | no disponible | referenciado en la evaluacion |
| Olmo-3.1-32B-Think | no disponible | no disponible | no disponible | no disponible | referenciado en la evaluacion |
| Gemma 4 | no disponible | no disponible | no disponible | no disponible | referenciado en la evaluacion |

La comparacion mas directa y con datos verificables es interna a la propia serie LLM-jp-4.1: la variante MoE de 32B-A3B activa 3,83B parametros por token frente a los 33,2B del modelo denso, lo que la hace mucho mas barata de servir a costa de un comportamiento distinto en calidad.

## Limitaciones y advertencias

- Idiomas: la model card solo declara ingles y japones. El rendimiento en castellano u otras lenguas no esta documentado y previsiblemente sera inferior.
- Datos de benchmark no publicados: la model card remite al blog tecnico en japones para los resultados numericos. Sin esas cifras no es posible validar el rendimiento esperado antes de desplegar.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni se describen mecanismos de mitigacion especificos mas alla de la alineacion con SFT y DPO.
- Sesgos: la model card no incluye una seccion de sesgos conocidos. Al entrenarse mayoritariamente sobre corpus japoneses e ingleses, es esperable un sesgo cultural y linguistico hacia esas dos comunidades.
- Corpus incompletos: aunque la mayoria de los corpus de preentrenamiento y mid-training son publicos, algunas porciones quedaron excluidas por restricciones de licencia, lo que impide una reproducibilidad completa del entrenamiento.
- Tokenizer y Harmony: la plantilla de chat es compatible con el formato OpenAI Harmony, pero el tokenizer no coincide con el que asume la libreria `openai-harmony`; usar tokenization directa con esa libreria produce resultados incorrectos.
- Cuantizacion: no hay GGUF oficial ni cuantizaciones publicadas por el autor. Cualquier despliegue en int4 o int8 requiere conversion y validacion propias, con el consiguiente riesgo de degradacion.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las licencias de los corpus subyacentes si se va a redistribuir el modelo o derivados.
- Produccion: no se publican datos de latencia, throughput ni estabilidad bajo carga, y el campo `inference: false` indica que el autor no ofrece un endpoint gestionado.
- Fecha de la informacion: los datos de la model card corresponden a la version actualizada el 2026-09-28; pueden aparecer revisiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-jp/llm-jp-4.1-33b-thinking
- Coleccion LLM-jp-4.1 Models: https://huggingface.co/collections/llm-jp/llm-jp-41-models
- Blog tecnico (en japones): https://llm-jp.nii.ac.jp/blog/llm-jp-4-1/
- Cookbook de uso: https://github.com/llm-jp/llm-jp-4-cookbook
- Corpus de preentrenamiento: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4.1
- Corpus de mid-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-midtraining-v2
- Datos de SFT: https://huggingface.co/datasets/llm-jp/llm-jp-4.1-thinking-sft-data
- Datos de DPO (33b-thinking): https://huggingface.co/datasets/llm-jp/llm-jp-4.1-33b-thinking-dpo-data
- Datos de DPO (8b-thinking): https://huggingface.co/datasets/llm-jp/llm-jp-4.1-8b-thinking-dpo-data
- Datos de DPO (32b-a3b-thinking): https://huggingface.co/datasets/llm-jp/llm-jp-4.1-32b-a3b-thinking-dpo-data
- Tokenizer llm-jp-tokenizer v4.0: https://github.com/llm-jp/llm-jp-tokenizer
- Suite de evaluacion swallow-evaluation-instruct: https://github.com/swallow-llm/swallow-evaluation-instruct
- Centro de investigacion (LLMC, NII): https://llmc.nii.ac.jp/
- Instituto Nacional de Informatica de Japon: https://www.nii.ac.jp/en/
- Formulario de encuesta de uso: https://forms.gle/AvbNXTNT2ADsssHq5
- La busqueda web realizada no devolvio enlaces especificos sobre este modelo; solo articulos genericos de introduccion a los LLM (Wikipedia, GeeksforGeeks, freeacademy), sin datos tecnicos aprovechables.
