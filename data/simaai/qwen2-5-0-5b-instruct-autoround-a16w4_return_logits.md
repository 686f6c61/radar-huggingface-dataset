# simaai/Qwen2.5-0.5B-Instruct-Autoround-a16w4_return_logits

## Resumen

Qwen2.5-0.5B-Instruct-Autoround-a16w4_return_logits es un artefacto derivado de Qwen/Qwen2.5-0.5B-Instruct, el modelo instructivo de 0,5 mil millones de parametros de la familia Qwen2.5 de Alibaba. En concreto, el autor (simaai) ha compilado y cuantizado el modelo para la plataforma de hardware SiMa.ai Modalix, con el objetivo especifico de ejecutar benchmarks de precision (accuracy benchmarking) sobre dicho acelerador sin necesidad de recompilar el modelo original.

La relevancia de este repositorio no esta en el modelo base en si (conocido y ampliamente utilizado), sino en su rol como artefacto de validacion: permite comparar las salidas del backend Modalix frente a las del backend Hugging Face sobre las mismas tareas (hellaswag, piqa, triviaqa, wikitext y winogrande). El modelo se compila con `--return_logits` habilitado, lo que expone los logits para su comparacion numerica.

Se trata de un modelo transformer denso de 0,5B parametros con una ventana de contexto maxima de 4096 tokens, cuantizado en formato A16W4 (activaciones BF16, pesos INT4) mediante la tecnica AutoRound. La licencia es Apache 2.0 y el repositorio ocupa 1,1 GB. No es un modelo pensado para despliegue generativo general, sino para validacion de precision en hardware SiMa.ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) |
| Parametros totales | 0,5 mil millones (0.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | A16W4 (activaciones BF16, pesos INT4) con AutoRound |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5, no declarados en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefactos compilados para SiMa.ai Modalix (devkit/ y elf_files/); no se declaran safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-0.5B-Instruct, un transformer denso decoder-only de la familia Qwen2.5. Esta version concreta no ha sido reentrenada: es el mismo modelo base sometido a un proceso de cuantizacion AutoRound en formato A16W4 (activaciones en BF16, pesos en INT4) y posteriormente compilado para el acelerador SiMa.ai Modalix. La compilacion se realizo con la opcion `--return_logits`, que hace que el modelo devuelva los logits de salida, condicion necesaria para ejecutar comparaciones de precision token a token contra un backend de referencia.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento original, el numero de tokens, ni sobre si el modelo base paso por fases de RLHF o DPO (aunque, por su naturaleza Instruct, el modelo base Qwen2.5-0.5B-Instruct si fue ajustado para instrucciones). La innovacion tecnica destacable de este artefacto es la combinacion de cuantizacion AutoRound con compilacion para un acelerador edge/NPU especifico, preservando la posibilidad de inspeccionar logits para auditoria de precision.

## Capacidades

- Generacion de texto condicionada por instrucciones, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por su tamano de 0,5B parametros.
- Evaluacion de precision mediante logits: el flag `--return_logits` permite comparar salidas numericas entre el backend Modalix y el backend Hugging Face.
- Ejecucion de tareas de benchmark estandar: hellaswag, piqa, triviaqa, wikitext y winogrande.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no declaradas en esta ficha (dependen del modelo base).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Validacion de precision en hardware SiMa.ai Modalix: ejecutar `llima-benchmark accuracy` con `--board_model` apuntando a este artefacto para comparar sus resultados (hellaswag, piqa, triviaqa, wikitext, winogrande) contra el backend Hugging Face y detectar desviaciones introducidas por la cuantizacion A16W4.
- Auditoria de cuantizacion AutoRound: usar los logits devueltos para medir la divergencia numerica entre el modelo en BF16 y la version INT4 compilada, identificando capas o rangos de tokens con mayor perdida de fidelidad.
- Integracion en pipelines de CI para hardware edge: incorporar este modelo como caso de prueba de regresion en el proceso de compilacion de SiMa.ai, verificando que nuevas versiones del runtime Neat no degradan la precision.
- Referencia de perplexity en wikitext: emplear los valores publicados (bits_per_byte 0,8617; byte_perplexity 1,8172; word_perplexity 24,3845) como linea base para comparar futuras compilaciones del mismo modelo u otros modelos en la misma plataforma.
- Demostracion de despliegue de LLM en dispositivo Modalix: servir el modelo con el runtime LLiMa para probar el flujo completo de `llima pull`, carga y ejecucion en el dispositivo, antes de pasar a modelos de mayor tamano de la coleccion SiMa.ai.
- Benchmarking comparativo de backends: ejecutar la misma suite de tareas contra el backend HF y el backend Modalix para generar informes de paridad numerica que justifiquen el uso del acelerador en produccion.

## Benchmarks y rendimiento

Resultados publicados por SiMa.ai en la model card, medidos en el backend Modalix. Las columnas de referencia del backend Hugging Face aparecen vacias en la informacion proporcionada, por lo que no es posible calcular la diferencia absoluta.

| Tarea | Version | Filtro | n-shot | Metrica | Direccion | Valor Modalix | Stderr | Valor HF |
|---|---|---:|---:|---|---|---:|---:|---|
| hellaswag | 1.0 | none | 0 | acc | higher | 0,3875 | 0,0049 | no disponible |
| hellaswag | 1.0 | none | 0 | acc_norm | higher | 0,4929 | 0,0050 | no disponible |
| piqa | 1.0 | none | 0 | acc | higher | 0,6839 | 0,0108 | no disponible |
| piqa | 1.0 | none | 0 | acc_norm | higher | 0,6801 | 0,0109 | no disponible |
| triviaqa | 3.0 | remove_whitespace | 0 | exact_match | higher | 0,0000 | 0,0000 | no disponible |
| wikitext | 2.0 | none | 0 | bits_per_byte | lower | 0,8617 | N/A | no disponible |
| wikitext | 2.0 | none | 0 | byte_perplexity | lower | 1,8172 | N/A | no disponible |
| wikitext | 2.0 | none | 0 | word_perplexity | lower | 24,3845 | N/A | no disponible |
| winogrande | 1.0 | none | 0 | acc | higher | 0,5580 | 0,0140 | no disponible |

Numero de muestras evaluadas: hellaswag 10042, piqa 1838, triviaqa 17944, wikitext 62, winogrande 1267.

## Requisitos de hardware

- Plataforma objetivo: SiMa.ai Modalix (acelerador edge/NPU). El modelo esta compilado especificamente para este hardware y no se distribuye en formatos genericos como safetensors o GGUF.
- VRAM estimada: no disponible; al ser un artefacto compilado para NPU, la memoria requerida depende del runtime Neat/LLiMa y de la asignacion de memoria del dispositivo, no de VRAM de GPU convencional.
- GPU recomendadas: no aplica para el artefacto compilado. Para ejecutar el modelo base en GPU convencional se requeriria una GPU con al menos 1-2 GB de VRAM en BF16 (estimacion orientativa para 0,5B parametros), aunque este dato no se declara en la informacion proporcionada.
- Cabe en GPU consumer: el modelo base de 0,5B si cabria en cualquier GPU consumer moderna; el artefacto de este repositorio esta pensado para Modalix, no para GPU.
- Opciones de despliegue: runtime SiMa.ai Neat con LLiMa (`llima pull`, `llima-benchmark accuracy`); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma objetivo |
|---|---:|---:|---|---|---|
| simaai/Qwen2.5-0.5B-Instruct-Autoround-a16w4_return_logits | 0,5B | 4096 | A16W4 (AutoRound) | Apache 2.0 | SiMa.ai Modalix |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32768 (modelo base) | BF16/FP16 original | Apache 2.0 | GPU/CPU generica |
| Otros modelos SiMa.ai de la coleccion LLM | no disponible | no disponible | A16W4 | Apache 2.0 (segun modelo base) | SiMa.ai Modalix |

La comparacion directa con alternativas de la misma categoria (modelos de 0,5B para benchmarking en edge) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion A16W4: pueden producirse desviaciones menores respecto al modelo de precision completa; los resultados de benchmarks deben interpretarse como medida de la version cuantizada, no del modelo original.
- Flag `--return_logits`: este artefacto esta compilado para benchmarking de precision. Para despliegues generativos estandar, el autor recomienda usar el modelo correspondiente de la coleccion de LLM de SiMa.ai sin este flag.
- Dependencia de hardware: el modelo solo funciona en SiMa.ai Modalix con el runtime Neat/LLiMa instalado; no es portable a otras plataformas sin recompilacion.
- TriviaQA exact_match = 0,0000: el resultado nulo sugiere que el modelo de 0,5B no responde correctamente en formato exacto a esta tarea; no debe interpretarse como fallo del backend sino como limitacion del modelo base.
- Tamano reducido: con 0,5B parametros, las capacidades de razonamiento, conocimiento factual y generacion de codigo son limitadas en comparacion con modelos de mayor escala.
- Idiomas: no se declaran idiomas soportados en esta ficha; deben verificarse contra la model card del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero debe respetarse la atribucion y las condiciones del modelo base Qwen2.5.
- Riesgo de alucinacion: inherente a los LLM de este tamano; no se han publicado evaluaciones de factualidad especificas para esta variante.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/simaai/Qwen2.5-0.5B-Instruct-Autoround-a16w4_return_logits
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Guia de inicio de SiMa.ai Neat: https://developer.sima.ai/software/getting-started/
- Documentacion de accuracy benchmarking MOLE: https://developer.sima.ai/software/genai-llima/mole
