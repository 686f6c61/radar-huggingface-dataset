# OS-Software/llm-jp-4.1-33b-thinking-uncensored-heretic-GGUF

## Resumen

El modelo `OS-Software/llm-jp-4.1-33b-thinking-uncensored-heretic-GGUF` es una version "decensored" (tambien etiquetada como heretic, uncensored y abliterated) del modelo japones `llm-jp/llm-jp-4.1-33b-thinking`, publicada por el usuario OS-Software. Se distribuye en formato GGUF, orientado a ejecucion local mediante llama.cpp y derivados, e incluye cuantizaciones generadas con imatrix. El modelo base pertenece a la serie LLM-jp-4.1, desarrollada por el Research and Development Center for Large Language Models del National Institute of Informatics (NII) de Japon.

Tecnicamente es un transformer denso de 33.219.548.160 parametros, 64 capas, hidden size de 5.120 y 40 cabezas de atencion, con una longitud de contexto de 65.536 tokens. La variante "thinking" incorpora modo de razonamiento explicito (el autor de la model card menciona un parametro `reasoning_effort`), y el tokenizador se basa en un modelo Unigram byte-fallback derivado de `llm-jp-tokenizer v4.0`.

La relevancia de esta publicacion es doble: por un lado ofrece una version de pesos abiertos de un modelo japones de 33B con contexto largo; por otro, aplica una ablacion de direcciones de rechazo mediante una bifurcacion personalizada de Heretic, reduciendo las negativas de 88/100 a 0/100 en un conjunto de 100 prompts daninos en japones, con un coste declarado de -0,32 puntos en MMLU y -1,22 puntos en HumanEval pass@1. Es, por tanto, un artefacto pensado para investigacion en seguridad, alineamiento y red-teaming, no para despliegue en produccion orientado a usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, basado en atencion, con modo de razonamiento (thinking) |
| Parametros totales | 33.219.548.160 (33,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | GGUF; Q4_K_M confirmado de forma explicita en la model card. El repo ocupa 197,2 GB, lo que sugiere multiples variantes adicionales no detalladas en la informacion disponible |
| Idiomas soportados | Ingles (en) y japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |
| Capas | 64 |
| Hidden size | 5.120 |
| Cabezas de atencion | 40 |
| Parametros de embedding | 1.006.632.960 |
| Parametros no de embedding | 32.212.915.200 |
| Tokenizador | Unigram byte-fallback (HuggingFace tokenizers), vocabulario de `llm-jp-tokenizer v4.0` |
| Idiomas de programacion declarados | C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala, TypeScript |
| Modelo base | llm-jp/llm-jp-4.1-33b-thinking |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 64 capas con hidden size de 5.120 y 40 cabezas de atencion, con 65.536 tokens de contexto. La serie LLM-jp-4.1 incluye tambien una variante MoE de 32B-A3B (32 capas, hidden size 2.560, 40 cabezas, 128 expertos enrutados de los cuales se activan 8, 3.827.476.992 parametros activos y 32.139.028.992 totales), pero esta ficha corresponde a la variante densa de 33B. El tokenizador es un modelo Unigram con byte-fallback, implementado con `huggingface/tokenizers` y con vocabulario convertido desde `llm-jp-tokenizer v4.0`.

Segun la informacion del proyecto LLM-jp, los modelos base se entrenan solo con pre-entrenamiento y mid-entrenamiento; las versiones post-entrenadas (como esta variante thinking) se alinean mediante supervised fine-tuning (SFT) y direct preference optimization (DPO), sin aprendizaje por refuerzo. El numero exacto de tokens de entrenamiento, la composicion del dataset y el desglose de la mezcla multilingue no estan disponibles en la informacion proporcionada.

La modificacion especifica de esta publicacion es una ablacion de la direccion de rechazo mediante una bifurcacion personalizada de Heretic. Los parametros declarados incluyen `target_layers` en 34, 36, 38, 40-42, 45-47 y 49; pesos de capa ×2 en 34, 36, 38, 40, 42 y 46; `preserve_good_behavior_weight` 1.0; `steer_bad_behavior_weight` 0.5; `overcorrect_relative_weight` 0.7; `neighbor_count` 1; `ridge_regularization` 0.0024; `transport_rank` 4; `entropy_regularization` 0.1; transporte gaussiano; `lora_rank` 128; sin normalizacion de filas; componentes objetivo `attn.o_proj` y `mlp.down_proj`; `covariance_regularization` 0.01 y `max_weight_change` 1.0. La divergencia KL declarada frente al modelo original es de 0,0118 (primer token, 100 prompts en japones del dataset `OS-Software/harmless_alpaca_ja`).

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte declarado de uso conversacional y pipeline de text-generation.
- Modo de razonamiento explicito (thinking), con un parametro `reasoning_effort` que la model card menciona al describir la metodologia de medicion de rechazos.
- Generacion de codigo en los 13 lenguajes de programacion declarados en la metadata (C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala, TypeScript).
- Razonamiento matematico y resolucion de problemas: inferido de los resultados de MMLU y HumanEval reportados, aunque no hay desglose por tarea especifica de matematicas.
- Capacidades multilingues limitadas a ingles y japones, con especial atencion al japones por el origen del modelo base y por el uso de prompts japoneses en la evaluacion.
- Baja tasa de rechazo: 0/100 negativas declaradas frente a 88/100 del modelo original, en 100 prompts daninos en japones.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente en la informacion proporcionada, aunque el modo thinking es compatible con flujos de razonamiento encadenado.

## Casos de uso

- Investigacion en seguridad y alineamiento: el modelo permite estudiar el efecto de la ablacion de la direccion de rechazo sobre el comportamiento, comparando las 88/100 negativas del original con las 0/100 de esta version sobre el mismo conjunto de prompts.
- Red-teaming y evaluacion de robustez: sirve como contraparte "no alineada" para medir si los clasificadores de seguridad, filtros de contenido y sistemas de moderacion detectan salidas daninas que el modelo base rechazaria.
- Estudio de degradacion por ablacion: con una perdida declarada de solo -0,32 puntos en MMLU y -1,22 en HumanEval pass@1, permite cuantificar cuanto rendimiento general se sacrifica al eliminar el comportamiento de rechazo.
- Analisis de divergencia de distribucion: la metrica de KL de 0,0118 sobre el primer token en 100 prompts japoneses permite caracterizar cuanto cambia la distribucion de salida tras la intervencion sobre `attn.o_proj` y `mlp.down_proj`.
- Generacion de codigo en japones e ingles para entornos de investigacion: con 93,29% de pass@1 en HumanEval, es utilizable en prototipos internos de generacion de codigo donde el operador asume la revision manual de la salida.
- Procesamiento de documentos largos en japones: los 65.536 tokens de contexto permiten resumir, extraer informacion o reescribir documentos extensos sin troceado agresivo.
- Experimentacion en inferencia local con GGUF: las cuantizaciones Q4_K_M permiten ejecutar un modelo de 33B en hardware de gama alta de consumo, lo que facilita reproducir experimentos de investigacion sin infraestructura de centro de datos.
- Traduccion y reformulacion ingles-japones: el modelo esta entrenado en ambos idiomas y puede emplearse en tareas de reescritura, adaptacion de registro y traduccion tecnica dentro de flujos internos.

## Benchmarks y rendimiento

| Benchmark | Modelo original | Este modelo | Diferencia |
|---|---|---|---|
| MMLU (14.042 preguntas, 0-shot, prompt de lm-eval) | 74,37% | 74,05% | -0,32 (p = 0,051) |
| HumanEval pass@1 (164 problemas) | 94,51% | 93,29% | -1,22 (p = 0,69) |
| Rechazos (100 prompts daninos en japones) | 88/100 | 0/100 | -88 |
| Divergencia KL (primer token, 100 prompts japoneses) | 0 (por definicion) | 0,0118 | +0,0118 |

Notas metodologicas declaradas por el autor: las metricas de MMLU y HumanEval se midieron sobre estos pesos cuantizados a Q4_K_M y contra el Q4_K_M oficial del modelo base. La medicion de rechazos se hizo por coincidencia de palabras clave en los primeros 100 tokens del razonamiento, con `reasoning_effort` bajo, sobre 100 prompts daninos en japones. La divergencia KL se calculo sobre el primer token en 100 prompts japoneses del dataset `OS-Software/harmless_alpaca_ja` (split test[:100]). No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 33,2B de parametros mas el overhead de cache KV (estimacion propia, no publicada por el autor): BF16/FP16 en torno a 66-70 GB; Q8_0 en torno a 35-38 GB; Q5_K_M en torno a 23-25 GB; Q4_K_M en torno a 19-21 GB.
- Cache KV: con 64 capas, 40 cabezas y contexto de 65.536 tokens, la cache KV en FP16 es muy costosa; para contexto completo conviene usar cuantizacion de cache KV (Q8_0 o Q4_0 en llama.cpp) y reservar varios GB adicionales de VRAM.
- GPU de centro de datos: A100 80 GB y H100 80 GB ejecutan el modelo en BF16 sin cuantizar; A100 40 GB requiere cuantizacion de 8 bits o inferior.
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar Q4_K_M con contexto moderado; con contexto cercano a 65.536 tokens es probable que no quepa y haya que descargar capas a RAM o reducir la ventana. Una RTX 3090 (24 GB) queda en una situacion similar. Tarjetas de 16 GB no son suficientes para Q4_K_M completo.
- Despliegue en CPU y mixto: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) pueden ejecutar el GGUF con offload parcial de capas a GPU; el rendimiento dependera del ancho de banda de memoria del sistema.
- Despliegue en servidor: no disponible la compatibilidad declarada con vLLM o TGI para este repo GGUF concreto; el formato nativo de ambos es safetensors, por lo que habria que partir del modelo base o convertir los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen de la cuantizacion, la GPU, la longitud de contexto y la activacion del modo thinking, que alarga notablemente la generacion al producir tokens de razonamiento antes de la respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | MMLU | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Este modelo (33B thinking, abliterated, GGUF) | 33,2B | No aplica | 65.536 | 74,05% | 93,29% | Apache 2.0 | GGUF |
| llm-jp/llm-jp-4.1-33b-thinking (original) | 33,2B | No aplica | 65.536 | 74,37% | 94,51% | Apache 2.0 | safetensors |
| llm-jp-4.1-8B (misma serie, denso) | 8,59B | No aplica | 65.536 | No disponible | No disponible | Apache 2.0 | safetensors |
| llm-jp-4.1-32B-A3B (misma serie, MoE) | 32,14B | 3,83B | 65.536 | No disponible | No disponible | Apache 2.0 | safetensors |

La comparativa con modelos de otros fabricantes (tamano y categoria similares) no disponible en la informacion proporcionada. Los datos de la serie LLM-jp-4.1 proceden de las tablas de arquitectura de la model card; no se han facilitado resultados de benchmarks para las variantes de 8B ni 32B-A3B.

## Limitaciones y advertencias

- Reduccion sustancial de la alineacion de seguridad: el propio autor advierte de que el modelo es mas propenso a generar contenido danino, inexacto, sesgado, ofensivo o inapropiado que un modelo estandar. La tasa de rechazo medida es 0/100.
- Uso previsto restringido a investigacion y experimentacion: la model card indica explicitamente que se evite desplegarlo en servicios publicos o de cara al usuario final. La licencia Apache 2.0 permite legalmente el uso comercial, pero la recomendacion del autor lo desaconseja y traslada toda la responsabilidad al usuario.
- Riesgo elevado de alucinacion: no hay datos especificos de tasas de alucinacion en la informacion proporcionada, pero la model card indica que todas las salidas deben tratarse como no fiables y verificarse de forma independiente.
- Idiomas limitados a ingles y japones. El rendimiento en castellano no esta documentado y previsiblemente sera inferior; no hay datos de evaluacion multilingue fuera de esos dos idiomas.
- Punto de partida para tareas de codigo en otros lenguajes: aunque la metadata declara 13 lenguajes de programacion, los unicos datos de evaluacion son de HumanEval (Python).
- Coste del modo thinking: la generacion de tokens de razonamiento incrementa la latencia y el consumo de tokens de salida, lo que encarece el despliegue en produccion y complica el control de la longitud de respuesta.
- Caveat de evaluacion: los benchmarks se midieron sobre pesos cuantizados a Q4_K_M, no sobre los pesos completos; los resultados en otras cuantizaciones pueden diferir.
- Diferencias estadisticas: la caida en HumanEval (-1,22) tiene p = 0,69 y la de MMLU (-0,32) tiene p = 0,051, por lo que ninguna de las dos alcanza significacion estadistica convencional con los tamanos de muestra empleados.
- Sin garantias: el autor declara distribuir el modelo sin garantias de ningun tipo y sin responsabilidad por danos directos o indirectos, perdidas, mal uso o consecuencias legales derivadas de su utilizacion.
- Deriva de software: la modificacion se realizo con una bifurcacion personalizada de Heretic, lo que implica que la reproducibilidad exacta depende de una version de herramienta no publicada como release estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OS-Software/llm-jp-4.1-33b-thinking-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4.1-33b-thinking
- Coleccion de modelos LLM-jp-4.1: https://huggingface.co/collections/llm-jp/llm-jp-41-models
- Blog tecnico de LLM-jp-4.1 (en japones): https://llm-jp.nii.ac.jp/blog/llm-jp-4-1/
- Cookbook de LLM-jp-4: https://github.com/llm-jp/llm-jp-4-cookbook
- Repositorio del tokenizador llm-jp-tokenizer: https://github.com/llm-jp/llm-jp-tokenizer
- Proyecto Heretic: https://heretic-project.org
- Repositorio de p-e-w (autor de herramientas relacionadas): https://github.com/p-e-w
- Dataset harmless_alpaca_ja: https://huggingface.co/datasets/OS-Software/harmless_alpaca_ja
- Centro de investigacion LLM del NII: https://llmc.nii.ac.jp/
- National Institute of Informatics: https://www.nii.ac.jp/en/
- Formulario de encuesta de uso de LLM-jp: https://forms.gle/AvbNXTNT2ADsssHq5
