# F606F/EuroLLM-1.7B-Slovak-Instruct-GGUF

## Resumen

EuroLLM-1.7B-Slovak-Instruct-GGUF es un modelo de lenguaje especializado en eslovaco, publicado por el usuario F606F en Hugging Face. Se construye sobre `utter-project/EuroLLM-1.7B-Instruct`, un transformer denso de 1.656.850.432 parametros (aproximadamente 1,66B), mediante un proceso de dos fases: continued pretraining (CPT) sobre 32.000 documentos eslovacos y instruction fine-tuning (SFT) sobre 9.600 conversaciones y tareas estilisticas. El resultado se distribuye unicamente en formato GGUF con cuantizacion Q6_K (aproximadamente 1,4 GB), pensado para inferencia en movil, CPU y equipos de gama baja.

La relevancia del modelo reside en su enfoque de eficiencia: un ajuste linguistico profundo (incluyendo el reentrenamiento de las capas `embed_tokens` y `lm_head`) sobre un modelo base multilingue europeo, empaquetado para despliegue local offline mediante llama.cpp, Ollama y aplicaciones moviles como PocketPal AI, ChatterUI o Layla. No es un modelo de proposito general: esta disenado para chat sencillo, correccion ortografica y estilistica, resumenes y RAG local en eslovaco, con un contexto nativo limitado a 4.096 tokens.

El modelo se publica bajo licencia Apache 2.0, heredada del modelo base, y no ha pasado por un proceso extenso de RLHF de seguridad, lo que el propio autor advierte explicitamente. En el momento de la ficha no registra descargas ni likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (EuroLLM-1.7B) |
| Parametros totales | 1.656.850.432 (1,66B); 0,52B en tablas de vocabulario y ~1,13B en la red computacional |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (nativo; el autor advierte no superarlo) |
| Tipos de cuantizacion | Q6_K (unico archivo publicado) |
| Idiomas soportados | Eslovaco (sk) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | utter-project/EuroLLM-1.7B-Instruct |
| Tamano del repositorio | 1,4 GB |
| Plantilla de chat | ChatML (`<|im_start|>` / `<|im_end|>`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura densa de EuroLLM-1.7B, un transformer decoder-only con 1,66B de parametros, de los cuales aproximadamente 0,52B corresponden a las tablas de vocabulario (embeddings y cabeza de salida). El ajuste se realizo en precision completa fp16 mediante Unsloth (`UnslothTrainer`), con embeddings desbloqueados, `r = 64`, `lora_alpha = 64`, `use_rslora = True` y un 25,99% de parametros entrenados.

El entrenamiento consta de dos fases. La primera, continued pretraining (CPT), cubre 32.000 documentos eslovacos en 2.000 pasos con `learning_rate = 5e-5` y un `embedding_learning_rate = 5e-6` especifico para `embed_tokens` y `lm_head`: 16.000 articulos de `wikimedia/wikipedia` (version 20231101.sk) y 16.000 documentos web de `ivykopal/fineweb2-slovak`, filtrados estrictamente por `fasttext == sk`, `langdetect == sk`, ausencia de palabras malsonantes y ausencia de caracteres extranos. La segunda fase, instruction fine-tuning (SFT), emplea 9.600 muestras en 600 pasos con `learning_rate = 3e-5` y `embedding_learning_rate = 3e-6`, distribuidas entre logica, matematicas y codigo en eslovaco (`dfm13-multilingual-math-code-sk`, 3.000; `dfm13-multilingual-openhermes-sk`, 2.500), conversacion multiturno (`mbenco/slovak-sft`, 2.000; `dfm13-multilingual-multiturn-sk`, 400), y tareas estilisticas y de contexto (`dfm13-multilingual-summary-rewrite-sk`, 800; `dfm13-multilingual-grounded-instruct-sk`, 600; `TUKE-DeutscheTelekom/skquad`, 300).

No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa ni modo thinking). La innovacion principal es metodologica: el reentrenamiento de las capas de embedding y salida para reforzar la representacion del eslovaco, en lugar de un simple ajuste LoRA superficial.

## Capacidades

- Generacion de texto conversacional en eslovaco con fluidez natural en intercambios simples.
- Correccion gramatical, ortografica y de puntuacion, con mejora estilistica sin alterar el significado.
- Resumen y reescritura de textos (notas, correos electronicos, documentos breves).
- Respuesta a preguntas fundamentada en texto adjunto (grounded instruction), con instruccion explicita de no inventar cuando la respuesta no aparece en el contexto.
- Dialogo multiturno de alcance limitado, entrenado sobre conversaciones eslovacas.
- Tareas basicas de logica, matematicas y codigo en eslovaco, derivadas de los datasets DFM13.
- Inferencia local offline en movil y CPU mediante llama.cpp y Ollama.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Correccion y estilizacion de correos electronicos en eslovaco: el modelo recibe el borrador y devuelve una version con gramatica, puntuacion y estilo corregidos sin cambiar el significado, usando el system prompt de corrector linguistico incluido en la model card. Adecuado por su entrenamiento especifico en tareas de reescritura.
- RAG local sobre notas y documentos: con la plantilla de asistente fundamentado, responde exclusivamente a partir del texto insertado y declara cuando la respuesta no esta en el contexto. Encaja en flujos de recuperacion de fragmentos de hasta unos miles de tokens dentro de la ventana de 4.096.
- Resumen de actas y articulos: sintetiza documentos eslovacos breves en movil o portatil sin conexion, gracias al archivo Q6_K de 1,4 GB y a la velocidad de generacion en CPU.
- Asistente de escritura en el movil: integrado en PocketPal AI, ChatterUI o Layla con plantilla ChatML, temperatura 0,4-0,6 y contexto de 4.096, para redactar y pulir textos cotidianos offline.
- Procesamiento por lotes en servidor modesto: `llama-server` con `--jinja` y `-fa on` permite exponer el modelo como API local para tareas de normalizacion de texto eslovaco en pipelines internos sin GPU dedicada.
- Prototipado de productos en eslovaco: por su licencia Apache 2.0 y su tamano, sirve para validar interfaces conversacionales y flujos de Q&A antes de migrar a modelos mayores de 9B o 12B cuando se requiera mayor calidad.
- Filtrado y preprocesado linguistico: clasificacion y limpieza de texto eslovaco en entornos edge donde no es viable enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente describe cualitativamente las fortalezas (velocidad en movil y CPU, bajo consumo de memoria de ~1,4 GB, fluidez en chat simple, correccion y RAG local) y las debilidades (no apto para acertijos logicos complejos, programacion avanzada ni conocimiento factual sin contexto), sin cifras de MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,4 GB para el archivo Q6_K; en la practica, unos 2 GB con overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien A100/H100 para despliegues por lotes, aunque el modelo esta sobredimensionado para ellas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna; tambien funciona en CPU-only.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/F606F/EuroLLM-1.7B-Slovak-Instruct-GGUF:Q6_K`), PocketPal AI, ChatterUI y Layla en movil.
- Parametros de generacion recomendados por el autor: temperatura 0,35-0,55, top-k 40, top-p 0,85, min-p 0,08, repeat penalty 1,08-1,12, contexto maximo 4.096.
- Latencia y throughput: no disponibles como cifras medidas; el autor solo indica generacion "muy rapida" en movil y CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| EuroLLM-1.7B-Slovak-Instruct-GGUF | 1,66B | 4.096 | Eslovaco | Apache 2.0 | GGUF Q6_K | Especializado en eslovaco via CPT + SFT; sin benchmarks publicados |
| utter-project/EuroLLM-1.7B-Instruct | 1,66B | no disponible en la informacion | Multilingue europeo | Apache 2.0 | safetensors (base) | Modelo base sin especializacion en eslovaco |
| Modelos eslovacos de mayor tamano (9B-12B) | 9B-12B | no disponible | Eslovaco/multilingue | no disponible | no disponible | El propio autor los recomienda para logica compleja y conocimiento factual |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No ha pasado por un RLHF de seguridad extenso tras las fases CPT/SFT; puede generar hechos inexactos, alucinaciones y salidas problematicas.
- Conocimiento factual limitado: no es fiable para responder de memoria sin contexto adjunto.
- No apto para logica compleja, acertijos, programacion avanzada ni matematicas de nivel alto; el autor recomienda modelos de 9B o 12B para esos casos.
- Contexto nativo de solo 4.096 tokens; superarlo degrada bruscamente la calidad de las respuestas.
- Monolingue en la practica (eslovaco): no se documenta calidad en otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo; los datasets de entrenamiento (Wikipedia, FineWeb2 filtrado) pueden introducir sesgos de dominio y de fuente.
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantias del autor; conviene validar el comportamiento en el dominio de produccion antes de desplegar.
- Repositorio sin descargas ni likes en el momento de la ficha, lo que limita la evidencia externa sobre su calidad.
- Un unico archivo GGUF (Q6_K): no hay variantes Q4, Q8 ni fp16 publicadas en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/F606F/EuroLLM-1.7B-Slovak-Instruct-GGUF
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B-Instruct
- Proyecto EuroLLM (UTTER): no disponible en la informacion proporcionada
- Paper de EuroLLM: no disponible en la informacion proporcionada
- Repositorio llama.cpp: no disponible en la informacion proporcionada
- Unsloth: no disponible en la informacion proporcionada
- Datasets citados: `wikimedia/wikipedia`, `ivykopal/fineweb2-slovak`, `schneiderkamplab/dfm13-multilingual-math-code-sk`, `schneiderkamplab/dfm13-multilingual-openhermes-sk`, `mbenco/slovak-sft`, `schneiderkamplab/dfm13-multilingual-summary-rewrite-sk`, `schneiderkamplab/dfm13-multilingual-grounded-instruct-sk`, `schneiderkamplab/dfm13-multilingual-multiturn-sk`, `TUKE-DeutscheTelekom/skquad` (todos en Hugging Face)
