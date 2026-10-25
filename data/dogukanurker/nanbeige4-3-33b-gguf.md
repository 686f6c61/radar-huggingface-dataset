# DogukanUrker/Nanbeige4.3-33B-GGUF

. Riesgo de thinking sin cerrar en otras variantes.
- Dense 33B: no cabe en GPU consumer de 8GB; con offload CPU ~4 tok/s.
- Solo en/zh; castellano no soportado oficialmente.
- Licencia apache-2.0 (permite comercial), pero conviene verificar la del modelo base (apache-2.0 también según tags).
- Dataset de calibración imatrix: bartowski calibration_datav3 + trazas agénticas -> posible sesgo hacia código/inglés.
- Alucinaciones: no hay datos de benchmarks; no se han publicado evaluaciones de calidad.
- Repo con 0 descargas, 2 likes: poca validación comunitaria; un solo archivo.
- BOS fix: requiere llama.cpp reciente que respete tokenizer.ggml.add_bos_token; otras herramientas pueden duplicar <|im_start|>.
- Sampling oficial: no usar samplers extra (top_k 0, min_p 0) para reproducir comportamiento.
- Contexto práctico 24K en 12 GB con KV q4_0; q8_0 KV no entra a 16K.
- 22K-token prompt a 11.4 tok/s decode.

Enlaces: HF repo, base model, llama.cpp repo, GSQ-RCO link, calibration_datav3 gist, bartowski. Credits to Nanbeige.

Now the "Parametros totales" row: 33B dense (nota: los metadatos de HF del repo indican 6.767.228, cifra inconsistente con las 33B declaradas). I'll add note.

Longitud de contexto: no disponible la ventana nativa; documentado hasta 24.576 tokens en 12 GB.

Idiomas: en, zh.

Tipos de cuantizacion: IQ2_XXS con precisión mixta (imatrix) — único archivo publicado; "más tamaños en camino".

Formato: GGUF (también safetensors bf16 en el repo base).

Let me write ~ each section.

Casos de uso (min 6): 
1. Agente de código en local con tool calling vía XML Qwen3-Coder parseado por llama-server --jinja.
2. Asistente multi-turno con preserve_thinking para tareas de refactorización largas.
3. Despliegue en estación de trabajo con una RTX 3060 12GB para prototipado privado (datos no salen).
4. Evaluación/benchmark de pipelines agénticos en hardware de consumo.
5. Sustituto local de API para tareas en inglés/chino (documentación, resúmenes).
6. Generación de scripts y one-liners con prefill rápido (~410 tok/s en prompt de 22K) para RAG sobre repos.
7. Servicio interno con contexto de 24K para análisis de logs/ficheros grandes.
8. Formación/experimentación con cuantización 2-bit e imatrix.

Benchmarks table: throughput.

Requisitos hardware:
- IQ2_XXS 10.1 GiB / 10.8 GB, cabe en 12 GB (11.7 GB usados con 24K ctx, KV q4_0, FA).
- RTX 3060 12GB validated; any 12GB+ with enough headroom; 16GB more comfortable (can raise context or KV q8_0) — careful: not stated, but inference. I can say "no documentado; es de esperar" — better to say "no disponible" for specifics but reasonable: "tarjetas de 16 GB o mas permitirian KV en q8_0 o mayor contexto (no documentado)". Mark as inference? I'd rather phrase as expectation clearly. Keep minimal.
- No cabe en 8 GB; offload parcial ~4 tok/s (documented with half on CPU).
- Deployment: llama.cpp/llama-server; requires --jinja for tool parsing and --reasoning on. Ollama/vLLM: no disponible (vLLM would need bf16/full weights; GGUF support experimental). Say "no documentado en la informacion proporcionada".
- Latencia/throughput: table numbers.

Comparativa: as discussed.

Titles: only first word capitalized. "Especificaciones tecnicas" ok.

Write it.## Resumen

Este repositorio contiene una cuantizacion GGUF de Nanbeige4.3-33B, un modelo denso de 33.000 millones de parametros orientado a uso agentico y generacion de codigo, desarrollado por Nanbeige y convertido a GGUF por DogukanUrker con llama.cpp a partir de los pesos bf16 oficiales. Al ser un modelo denso y no un MoE, los 33B se activan en cada token, de modo que la unica forma de obtener velocidad utilizable es que el modelo completo quepa en VRAM; de ahi el interes de esta publicacion, que ofrece un unico archivo IQ2_XXS de 10,1 GiB pensado para tarjetas de 12 GB.

La aportacion tecnica del repo no es la conversion en si, sino el trabajo de cuantizacion: se detecto que con un IQ2_XXS plano el modelo tendia a no cerrar la etiqueta `</think>` en prompts faciles (3-4 de cada 8 ejecuciones), dejando la respuesta entera en `reasoning_content`. Mediante sustitucion por bloques de capas se localizo el comportamiento en las capas 6-12, que se mantienen en Q4_K/Q6_K, mientras el resto baja a 2 bits. El resultado es un archivo que razona y responde 12 de 12 veces con la configuracion recomendada.

Es relevante ahora porque permite ejecutar un modelo de 33B con capacidad de tool calling y modo thinking en una GPU de consumo de 12 GB, con contexto efectivo de 24.576 tokens, a costa de una perdida de calidad no medida publicamente (no hay benchmarks de calidad en la informacion disponible). El repo tiene 0 descargas y 2 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE); atencion con 8 cabezas KV (GQA) segun la configuracion de cuantizacion; plantilla de chat basada en `<|im_start|>` |
| Parametros totales | 33B (dense); nota: los metadatos de HuggingFace del repo indican 6.767.228, cifra inconsistente con las 33B declaradas en la model card |
| Parametros activos | no aplica (modelo denso, todos los parametros activos por token) |
| Longitud de contexto | ventana nativa no disponible; documentado y validado hasta 24.576 tokens en GPU de 12 GB |
| Tipos de cuantizacion | IQ2_XXS con precision mixta e imatrix (unico archivo publicado; el autor anuncia mas tamanos "en camino") |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (origen en safetensors bf16 en el repo del modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer denso de 33B con atencion de 8 cabezas KV (lo que implica GQA y un KV cache reducido) y al menos 52 capas (el autor manipula los rangos 0-51). La plantilla de chat usa los tokens `<|im_start|>`/`<|im_end|>` y el formato de tool calls es el XML de Qwen3-Coder, que `llama-server --jinja` parsea a `tool_calls`. El modelo incorpora modo thinking activado por defecto, desactivable con `enable_thinking:false` y preservable entre turnos con `preserve_thinking:true`.

No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si se aplico RLHF, DPO u otras tecnicas de alineacion. La innovacion documentada en este repo es exclusivamente de cuantizacion: un esquema de precision mixta derivado de un analisis por bloques de capas, con una imatrix calculada sobre 100 chunks de 512 tokens usando `calibration_datav3` de bartowski mas trazas reales de codigo agentico multi-turno renderizadas con la plantilla del propio modelo. Tambien se corrige el tokenizer fijando `tokenizer.ggml.add_bos_token = false` para evitar el doble `<|im_start|>` que introducia llama.cpp frente al comportamiento de Transformers.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y cierre explicito de `</think>`.
- Generacion de codigo: el autor valida respuestas a prompts de codigo (por ejemplo, invertir una cadena en Python) y el modelo esta etiquetado como "agentic and coding".
- Tool calling / function calling en formato XML de Qwen3-Coder, parseado automaticamente por `llama-server --jinja`.
- Flujos agenticos multi-turno, con la opcion de conservar el razonamiento previo (`preserve_thinking`) recomendada por el autor para tareas de agente y codigo.
- Multilingue limitado a ingles y chino.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Agente de codigo en local: con `--jinja` y el formato XML de Qwen3-Coder, el modelo emite tool calls que llama.cpp convierte en `tool_calls`, lo que permite encadenar lectura de ficheros, ejecucion de tests y parches sin salir de la maquina.
- Asistente de refactorizacion multi-turno: activando `preserve_thinking:true` el modelo conserva el razonamiento entre turnos, util en sesiones largas sobre un mismo repositorio con hasta 24K tokens de contexto.
- Despliegue privado en estacion de trabajo: un unico archivo de 10,1 GiB cabe en una RTX 3060 12GB y evita enviar codigo propietario a APIs externas.
- RAG sobre repositorios o documentacion: el prefill de ~410 tok/s con un prompt real de 22.300 tokens permite inyectar contextos grandes con latencia de prefill de aproximadamente un minuto y decodificacion posterior a 11,4 tok/s.
- Evaluacion de pipelines agenticos en hardware de consumo: sirve como sujeto de pruebas barato para medir fiabilidad de tool calling y de modo thinking antes de escalar a modelos mayores.
- Generacion de scripts y one-liners: con temperatura 1,0 y top_p 0,95 para uso agentico, o 0,6/0,95 para razonamiento y chat, el modelo produce utilidades cortas de forma fiable segun las pruebas del autor.
- Analisis de trazas y logs extensos en ingles o chino: el contexto de 24K tokens cubre ventanas amplias de registros sin trocear en exceso.
- Prototipado de cuantizacion extrema: el repositorio documenta metodologia (imatrix, sustitucion por bloques, comparativa IQ3_S vs Q4_K) reutilizable para otros modelos densos de 30B en adelante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos numericos son de rendimiento de inferencia, medidos con `llama-bench` en una RTX 3060 12GB, todas las capas en GPU, KV en q4_0, flash attention y `-ub 512`:

| Metrica | Contexto vacio | Contexto 16K |
|---|---:|---:|
| Prefill (pp512) | ~500 tok/s | ~340 tok/s |
| Decodificacion (tg128) | 20,8 tok/s | 13,1 tok/s |

Prueba con prompt real de 22.300 tokens: 410 tok/s de prefill y 11,4 tok/s de decodificacion. Con mitad del modelo en CPU el rendimiento cae a ~4 tok/s.

Pruebas de fiabilidad del cierre de `</think>` realizadas por el autor (10 ejecuciones por configuracion):

| Configuracion | Falta `</think>` |
|---|---:|
| IQ2_XXS + capas Q4_K_M en 0-12 | 0 / 10 |
| IQ2_XXS + capas Q4_K_M en 39-51 | 4 / 10 |
| IQ2_XXS + capas Q4_K_M en 0-5 | 6 / 10 |
| IQ2_XXS + capas Q4_K_M en 6-12 | 0 / 10 |
| Capas 0-12 en IQ3_S | 2 / 12 |
| Archivo final IQ2_XXS mixto | 12 / 12 razonan y responden |

## Requisitos de hardware

- VRAM: 11,7 GB ocupados con el archivo IQ2_XXS (10,1 GiB), contexto de 24.576 tokens, KV en q4_0 y flash attention. Es el maximo que carga entero en 12 GB.
- GPU validadas: RTX 3060 12GB (unica probada por el autor).
- No cabe en GPUs de 8 GB. Con offload parcial a CPU el rendimiento baja a ~4 tok/s, lo que el autor desaconseja para uso real.
- Con KV en q8_0 no entran 16K tokens en 12 GB; es obligatorio q4_0 para KV en esa VRAM.
- `-ub 256` permite alcanzar 26K de contexto a costa de un prefill mas lento.
- Despliegue: llama.cpp / `llama-server` con `-ngl 99 -fa on --jinja --reasoning on -np 1 -b 2048 -ub 512`. Soporte en vLLM, TGI, Ollama u otros runners: no disponible en la informacion proporcionada.
- Parametros de muestreo recomendados: temperatura 1,0 / top_p 0,95 para agentico y tool use; 0,6 / 0,95 para razonamiento y chat, con `--top-k 0 --min-p 0.0` para desactivar los samplers extra de llama.cpp.
- Throughput y latencia: ver tabla de la seccion anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / VRAM | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (bf16 original) | 33B dense | no disponible | safetensors bf16; no cabe en 12 GB | apache-2.0 | Referencia de calidad; requiere ~66 GB en bf16 (estimacion por tamano de parametros, no documentada) |
| Nanbeige4.3-33B IQ2_XXS (este repo) | 33B dense | 24.576 tok validados | GGUF, 10,1 GiB, 12 GB VRAM | apache-2.0 | Precision mixta con capas 6-12 en Q4_K/Q6_K |
| Nanbeige4.3-33B Q4_K_M | 33B dense | no disponible | GGUF; tamano no indicado | apache-2.0 | Usado por el autor como referencia de calidad (0/6 fallos de `</think>`); no forma parte de este repo |
| Alternativas de otros fabricantes (Qwen3-32B, Gemma-3-27B, etc.) | no disponible | no disponible | no disponible | no disponible | No se aportan datos de comparacion en la informacion disponible |

## Limitaciones y advertencias

- Cuantizacion a 2 bits: la calidad respecto al bf16 original no esta medida. El propio autor documenta un fallo funcional grave (razonamiento sin cerrar `</think>`) en el IQ2_XXS plano, corregido solo para este archivo concreto; otras variantes de 2 bits o futuros tamanos pueden reproducirlo.
- El comportamiento de plantilla depende de mantener ciertas capas en Q4_K/Q6_K; alterar el archivo o re-cuantizar sin repetir las pruebas puede degradar la fiabilidad del modo thinking.
- Modelo denso de 33B: cualquier offload a CPU hunde el rendimiento a ~4 tok/s, por lo que no es apto para GPUs de 8 GB ni para entornos sin GPU.
- Idiomas: solo ingles y chino declarados. El castellano no esta soportado oficialmente y no hay evaluaciones en ese idioma.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni benchmarks de calidad; sin datos, no es recomendable usarlo en produccion sin validacion propia.
- La imatrix se calculo con `calibration_datav3` y trazas agenticas de codigo, lo que puede sesgar el modelo hacia codigo e ingles frente a otros dominios.
- Herramientas distintas de llama.cpp pueden no respetar `tokenizer.ggml.add_bos_token = false` y duplicar `<|im_start|>`, degradando las respuestas.
- Licencia apache-2.0 en el repo de cuantizacion y en los tags del modelo base, lo que en principio permite uso comercial; conviene verificar la model card del repo original de Nanbeige antes de desplegar.
- Repositorio con 0 descargas y 2 likes: sin validacion independiente de la comunidad, y con un unico archivo disponible.
- El contexto maximo nativo del modelo no se documenta; los 24.576 tokens son el limite practico en 12 GB, no necesariamente el limite del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DogukanUrker/Nanbeige4.3-33B-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Organizacion Nanbeige: https://huggingface.co/Nanbeige
- Autor de la cuantizacion: https://huggingface.co/DogukanUrker
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de esquema de cuantizacion GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Dataset de calibracion de bartowski: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
