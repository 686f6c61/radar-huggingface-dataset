# schwyzquants/OpenThinkerAgent-32B

## Resumen

OpenThinkerAgent-32B es un ajuste fino de tipo SFT de parametros completos sobre Qwen/Qwen3-32B, desarrollado por el equipo de OpenThoughts-Agent (el repositorio analizado, `schwyzquants/OpenThinkerAgent-32B`, es una copia del original `open-thoughts/OpenThinkerAgent-32B`). El modelo esta especializado en tareas de agente: uso de terminal, resolucion de incidencias en repositorios de codigo, ingenieria de software y razonamiento multi-paso con llamadas a herramientas.

El entrenamiento se realizo sobre OpenThoughts-Agent-SFT-100K, un conjunto de 100.000 pares (tarea, traza de agente) generados por el profesor GLM-4.7-AWQ en el harness terminus-2 y filtrados para conservar solo trazas con al menos 5 turnos del modelo. La propuesta es relevante porque publica de forma abierta tanto el dataset como los pesos y el codigo de investigacion, y porque declara ser el modelo de 32B con datos abiertos mas fuerte en la media de siete benchmarks agenticos (44,8 de media declarada).

Arquitectura transformer densa decoder-only heredada de Qwen3-32B (aproximadamente 32.000 millones de parametros), con licencia Apache 2.0 y pesos en safetensors. El repositorio ocupa 65,5 GB, coherente con un checkpoint en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, con atencion GQA y modo de razonamiento, heredada de Qwen/Qwen3-32B |
| Parametros totales | Aproximadamente 32.000 millones (heredado de Qwen3-32B). El campo de safetensors del repositorio declara 676,864 en unidades no especificadas, dato inconsistente con el tamano del repositorio (65,5 GB) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens en el modelo base (ampliable a 131.072 con YaRN segun la documentacion de Qwen3); el SFT se realizo con `cutoff_len` de 32.768 |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio, solo safetensors. Al derivar de Qwen3-32B es convertible a GPTQ, AWQ, FP8 y GGUF con herramientas estandar |
| Idiomas soportados | No declarados en la model card. Heredados del modelo base Qwen3-32B (119 idiomas y dialectos), sin verificacion independiente en el ajuste |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-32B, un transformer denso decoder-only con atencion de consultas agrupadas (GQA) y conmutacion entre modo de razonamiento explicito y modo directo. No se modifica la arquitectura: el trabajo de OpenThoughts-Agent es exclusivamente de post-entrenamiento. El ajuste es SFT de parametros completos sobre 100.000 ejemplos del dataset OpenThoughts-Agent-SFT-100K, construido a partir de las cuatro principales fuentes de tareas (SWE-Smith, StackExchange-SuperUser, StackExchange-Tezos con aumento sintetico e IssueTasks). Las trazas fueron generadas por GLM-4.7-AWQ ejecutandose en el harness terminus-2 y filtradas para conservar unicamente aquellas con cinco o mas turnos del modelo, lo que sesga el dataset hacia episodios largos de agente.

Los hiperparametros declarados son: learning rate 4e-5, scheduler coseno con `warmup_ratio` 0,1, batch global de 96, 5 epocas, longitud de corte de 32.768 tokens, precision bf16 y DeepSpeed ZeRO-3. No se documenta ninguna fase posterior de RLHF, DPO o RL, ni innovaciones de decodificacion (decodificacion especulativa, atencion lineal, etc.). La innovacion principal del proyecto es la receta de datos y el pipeline de generacion y filtrado de trazas de agente, no la arquitectura.

## Capacidades

- Generacion de texto y razonamiento multi-paso con trazas largas de agente (el dataset de entrenamiento exige un minimo de 5 turnos).
- Ejecucion de tareas de ingenieria de software: lectura y edicion de ficheros, navegacion por repositorios, ejecucion de pruebas y parcheo de codigo.
- Uso de terminal y shell: el modelo esta entrenado especificamente para operar en entornos de linea de comandos y resolver tareas de sistema.
- Llamada a herramientas y funciones (tool calling / function calling), con 85,9 declarado en BFCL-Parity.
- Razonamiento agentico multi-paso con uso de herramientas externas y planificacion (GAIA-127, Terminal-Bench 2.0).
- Capacidades multilingues heredadas de Qwen3-32B (119 idiomas declarados por el modelo base), aunque el ajuste agentico esta dominado por trazas en ingles.
- Modo de razonamiento (thinking) heredado de la familia Qwen3, segun la arquitectura del modelo base.
- Dominios especializados cubiertos por los benchmarks declarados: salud (MedAgentBench) y finanzas (FinanceAgent-Terminal).
- No se declaran capacidades de vision, audio ni procesamiento multimodal.

## Casos de uso

- Resolucion automatica de incidencias en repositorios: el modelo puede recibir un issue, explorar el arbol de ficheros, localizar el codigo relevante, aplicar un parche y ejecutar la suite de tests. Es adecuado porque alcanza 54,0 declarado en SWE-Bench-Verified, muy por encima de los 26,7 del Qwen3-32B sin ajustar.
- Automatizacion de operaciones y SRE: interpretacion de comandos de shell, diagnostico de fallos, lectura de logs y aplicacion de remediaciones en un sandbox. Su 26,2 declarado en Terminal-Bench 2.0 lo situa como opcion para agentes de terminal en 32B.
- Refactorizacion y migracion de codigo multilingue: con 32,4 declarado en Aider-Polyglot, es utilizable en tareas de edicion de codigo en varios lenguajes dentro de un pipeline de CI/CD que aplique y valide los cambios automaticamente.
- Asistentes con tool calling en produccion: su 85,9 en BFCL-Parity permite integrarlo como planificador que decide que funcion invocar (consultas a bases de datos, APIs internas, busquedas) en lugar de generar texto libre.
- Agentes de investigacion y navegacion con herramientas: para tareas de recuperacion y composicion de informacion en varios pasos; su 23,6 en GAIA-127 indica que funciona en tareas simples y medias, con supervision humana en las complejas.
- Soporte documental en entornos clinicos: con 47,8 en MedAgentBench, puede emplearse como asistente que consulta historiales estructurados y genera resumenes, siempre con revision por parte de personal facultativo.
- Analisis financiero asistido por herramientas: con 44,0 en FinanceAgent-Terminal, encaja en flujos que consultan datos de mercado, calculan metricas y generan informes auditables.
- Orquestador en pipelines de agentes largos: sus 32.768 tokens de contexto de entrenamiento permiten mantener el historial completo de una tarea de varios turnos con resultados de herramientas incluidos.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo. Evaluacion en el harness terminus-2 con pass@1 y media de 3 re-ejecuciones estocasticas:

| Modelo | Harness | SWE-Bench-Verified-100 | OpenThoughts-TBLite | Terminal-Bench 2.0 |
|---|---|---|---|---|
| Qwen/Qwen3-32B | Terminus-2 | 26,7 | 13,7 | 7,5 |
| OpenThinkerAgent-32B | Terminus-2 | 55,7 | 41,3 | 26,2 |

Suite completa de siete benchmarks (mejor harness por benchmark):

| Benchmark | Precision |
|---|---|
| SWE-Bench-Verified | 54,0 |
| Terminal-Bench 2.0 | 26,2 |
| Aider-Polyglot | 32,4 |
| BFCL-Parity | 85,9 |
| MedAgentBench | 47,8 |
| GAIA-127 | 23,6 |
| FinanceAgent-Terminal | 44,0 |
| Media (7) | 44,8 |

No se han publicado en la informacion disponible resultados de MMLU, GSM8K, HumanEval ni de benchmarks de conocimiento general, ni evaluaciones independientes de terceros.

## Requisitos de hardware

- Inferencia en bf16: los pesos ocupan aproximadamente 65 GB (el repositorio declara 65,5 GB). Requiere 1 GPU de 80 GB (H100, A100 80 GB) o 2 GPUs de 40-48 GB (2x A100 40 GB, 2x L40S) con tensor parallelism.
- Cache KV estimada: con la configuracion publica de Qwen3-32B (64 capas, 8 cabezas KV, head_dim 128) el coste es de unos 256 KB por token en bf16, es decir, aproximadamente 8 GB para 32.768 tokens de contexto y 4 GB si se usa cache KV en FP8. Cifra estimada, no medida.
- Inferencia en FP8: pesos de aproximadamente 33 GB; cabe en una H100 80 GB, en una L40S 48 GB con contexto reducido o en 2x RTX 4090.
- Cuantizacion INT4 (AWQ, GPTQ o GGUF Q4_K_M): pesos de aproximadamente 18-20 GB; cabe en una RTX 4090 o RTX 3090 de 24 GB, dejando poco margen para cache KV, por lo que conviene limitar el contexto o repartir entre 2 GPUs.
- Consumer GPU: si, en tarjetas de 24 GB con cuantizacion de 4 bits y contexto limitado; no cabe en bf16 en ninguna GPU de consumo actual.
- Opciones de despliegue: la model card declara compatibilidad con text-generation-inference y con endpoints; tambien es desplegable con vLLM y SGLang para bf16/FP8 con tensor parallelism, y con llama.cpp, Ollama o LM Studio tras convertir los pesos a GGUF. Para entrenamiento o ajuste posterior, el autor uso DeepSpeed ZeRO-3.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Benchmarks agenticos |
|---|---|---|---|---|---|
| OpenThinkerAgent-32B | ~32.000 M (denso) | 32.768 en entrenamiento; hasta 131.072 con YaRN en el base | Apache 2.0 | Agentes, terminal, SWE | SWE-Bench-Verified 54,0; Terminal-Bench 2.0 26,2; media de 7 = 44,8 (declarados) |
| Qwen/Qwen3-32B | ~32.000 M (denso) | 32.768, ampliable a 131.072 con YaRN | Apache 2.0 | Modelo generalista con modo de razonamiento | SWE-Bench-Verified-100 26,7; OpenThoughts-TBLite 13,7; Terminal-Bench 2.0 7,5 en terminus-2 (declarados) |
| Qwen3-Coder-30B-A3B-Instruct | ~30.500 M totales, ~3.300 M activos (MoE) | 256.000 tokens segun su model card | Apache 2.0 | Codigo y agentes | no disponible en la informacion proporcionada |
| DeepSeek-R1-Distill-Qwen-32B | ~32.800 M (denso) | 131.072 tokens segun su model card | no verificada en la informacion disponible | Razonamiento destilado | no disponible en la informacion proporcionada |

La comparacion directa solo es posible con Qwen3-32B, porque es el unico modelo para el que la model card proporciona numeros medidos en el mismo harness. En esa comparacion, el ajuste de OpenThoughts duplica aproximadamente la tasa de exito en SWE-Bench-Verified-100 (55,7 frente a 26,7) y multiplica por mas de cuatro el resultado en OpenThoughts-TBLite.

## Limitaciones y advertencias

- Es un ajuste de SFT sobre trazas de agente: puede degradar el rendimiento en conversacion general respecto a Qwen3-32B, que no ha sido evaluado en esta ficha.
- Riesgo de alucinacion en la generacion de codigo y en la ejecucion de comandos: no se documentan evaluaciones de fidelidad, y el 23,6 en GAIA-127 indica margen de mejora en tareas de varios pasos.
- Los resultados publicados son declarados por el autor, con pass@1 y media de 3 ejecuciones estocasticas; la varianza entre ejecuciones no se publica. No hay evaluacion independiente.
- El contexto de entrenamiento esta limitado a 32.768 tokens. La extension a 131.072 mediante YaRN es una capacidad del modelo base y no se declara entrenada en este ajuste, por lo que el rendimiento fuera de 32.768 tokens no esta garantizado.
- El dataset filtra trazas de menos de 5 turnos, lo que puede infrarrepresentar tareas cortas y de un solo paso.
- Idiomas: no se declaran en la model card. Las fuentes de datos son mayoritariamente en ingles (SWE-Smith, StackExchange, IssueTasks), por lo que el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea inferior.
- Riesgo operativo en entornos de terminal: el modelo puede emitir comandos destructivos o con privilegios elevados. Es imprescindible ejecutarlo en un sandbox con permisos limitados, red restringida y snapshots antes de aplicar cambios.
- Licencia Apache 2.0, que permite uso comercial. Conviene verificar la licencia del modelo base Qwen3-32B (tambien Apache 2.0) y las condiciones de los datasets de trazas derivados de StackExchange.
- El repositorio analizado, `schwyzquants/OpenThinkerAgent-32B`, es una copia con 0 descargas y 0 likes publicada el 14 de septiembre de 2026; el repositorio y el proyecto de referencia pertenecen a la organizacion open-thoughts. Antes de usar los pesos en produccion conviene verificar su integridad frente al repositorio original.
- No se declaran cuantizaciones oficiales: cualquier version GGUF, AWQ o GPTQ disponible seria de terceros y sin validacion del autor.

## Enlaces

- Modelo en HuggingFace (repositorio analizado): https://huggingface.co/schwyzquants/OpenThinkerAgent-32B
- Modelo original del autor: https://huggingface.co/open-thoughts/OpenThinkerAgent-32B
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Pagina del proyecto OpenThoughts-Agent: https://www.openthoughts.ai/blog/agent
- Repositorio de codigo: https://github.com/open-thoughts/OpenThoughts-Agent
- Coleccion de modelos y datasets: https://huggingface.co/collections/open-thoughts/openthinker-agent
- Dataset de entrenamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-SFT-100K
- Cita del proyecto: `@misc{openthoughts-agent, author = {Team, OpenThoughts-Agent}, title = {{OpenThoughts-Agent: Data Recipes for Agentic Models}}, howpublished = {https://www.openthoughts.ai/blog/agent}, year = {2026}}`
- Resultados de la busqueda web: no se ha encontrado ninguna fuente relevante sobre este modelo. Los enlaces devueltos corresponden a subreddits sin relacion con el proyecto (Reddit) y no se incluyen.
