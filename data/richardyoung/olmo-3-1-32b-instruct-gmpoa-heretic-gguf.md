# richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic-GGUF

## Resumen

Olmo-3.1-32B-Instruct-GMPOA-heretic-GGUF es una distribucion en formato GGUF del modelo richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic, a su vez una version "abliterated" (con el comportamiento de rechazo eliminado) del allenai/Olmo-3.1-32B-Instruct. La modificacion se realizo con la herramienta Heretic 2.0 aplicando una variante MPOA corregida para las ganancias de salida post-norm (control gamma-MPOA). El resultado es un modelo de 32.233.522.176 parametros que responde a peticiones que el modelo original rechaza, y que forma parte del conjunto evaluado en un estudio de Richard J. Young sobre la dificultad creciente de la abliteracion en modelos abiertos.

El repositorio contiene unicamente la cuantizacion Q4_K_M (19,5 GB) junto con la matriz de importancia (imatrix) empleada para generarla; el autor anuncia la publicacion progresiva de IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0. No se trata de un asistente de proposito general: la model card lo declara explicitamente como material de investigacion sobre eliminacion de rechazos y su medicion.

Su relevancia actual es metodologica: documenta con una metrica concreta (tasa de rechazo sobre 972 prompts daninos retenidos, juez WildGuard) el efecto de la abliteracion (84,1 % en el original frente a 57,5 % en la version modificada) y advierte de que las cifras corresponden al modelo en bf16, no a las cuantizaciones publicadas aqui.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (heredada de allenai/Olmo-3.1-32B-Instruct; no se detalla en la informacion disponible) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (publicada); IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0 anunciadas |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo allenai/Olmo-3.1-32B-Instruct, del que este repositorio es una cuantizacion; la informacion disponible no detalla la configuracion interna (numero de capas, dimension oculta, mecanismo de atencion ni longitud de contexto). Sobre esa base se aplico Heretic 2.0, una tecnica de abliteracion que elimina la direccion de rechazo en los pesos, en este caso con una variante MPOA corregida por las ganancias de salida post-norm (control gamma-MPOA). La seleccion de la configuracion final siguio una regla de busqueda de 100 ensayos: minimizar los rechazos por palabra clave en el conjunto de desarrollo sujeto a una divergencia KL de primer token menor o igual a 0,1.

Los archivos GGUF se generaron a partir de los safetensors publicados del modelo base (revision 44f202e48554, con verificacion SHA-256 de cada archivo de pesos) usando llama.cpp en el commit 468fde9: primero convert_hf_to_gguf.py con --outtype bf16 y despues llama-quantize, todo en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M emplean una matriz de importancia calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estaticas. Cada archivo Q4_K_M se cargo y respondio a un prompt de prueba antes de subirse. No se dispone de informacion sobre el dataset de entrenamiento original, el volumen de tokens ni las fases de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, con el formato de chat instructivo del modelo Olmo 3.1 original.
- Respuesta a peticiones que el modelo original rechaza: la tasa de rechazo baja del 84,1 % al 57,5 % sobre 972 prompts daninos retenidos (medicion en bf16 con juez WildGuard).
- Ejecucion local en CPU y GPU mediante llama.cpp y Ollama, incluida la variante `latest` en Ollama para el archivo Q4_K_M.
- Compatibilidad con endpoints (tag `endpoints_compatible` del repositorio).
- Capacidades de razonamiento, codigo, matematicas, tool calling o agentes: no disponibles en la informacion proporcionada; deben consultarse en la model card del modelo base.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.

## Casos de uso

- Investigacion sobre abliteracion: reproducir y medir el efecto de la eliminacion de rechazos comparando esta cuantizacion con el modelo original sobre conjuntos de prompts daninos y jueces automatizados, teniendo en cuenta que las cifras del paper corresponden a bf16.
- Evaluacion de defensas frente a la eliminacion de rechazos: usar el modelo como adversario controlado para probar clasificadores de seguridad, filtros de entrada/salida y tecnicas de alineamiento adicional.
- Estudio de robustez de cuantizaciones: comparar el comportamiento de rechazo entre Q4_K_M y las futuras IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0 para medir cuanto altera la cuantizacion el comportamiento abliterado, algo que el autor advierte explicitamente que puede ocurrir.
- Despliegue local de referencia en maquinas sin GPU de gran capacidad: el GGUF Q4_K_M de 19,5 GB se ejecuta con llama.cpp u Ollama en CPU, lo que permite experimentar sin infraestructura de datacenter.
- Analisis de calibracion con matriz de importancia: reutilizar la imatrix publicada (30 MB, calibration_datav3, 128 fragmentos de 512 tokens) para reproducir el pipeline de cuantizacion o generar nuevas variantes.
- Docencia y divulgacion tecnica sobre seguridad de modelos abiertos: ilustrar con un caso real y medible como una transformacion de pesos modifica la tasa de rechazo sin reentrenamiento.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del modelo en precision completa (bf16), no de las cuantizaciones de este repositorio:

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos retenidos (juez WildGuard) | 84,1 % | 57,5 % (559/972) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible, ni para el modelo base ni para esta cuantizacion.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 19,5 GB solo para los pesos, mas overhead de contexto y cache KV; en la practica conviene disponer de 22-24 GB o recurrir a offload parcial a CPU.
- GPU recomendadas: A100 (40/80 GB) y H100 para inferencia holgada; RTX 4090 (24 GB) puede alojar Q4_K_M con contexto moderado; RTX 3090 (24 GB) en la misma situacion.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con Q4_K_M y contexto limitado; las futuras IQ3_M e IQ4_XS reduciran el requisito por debajo de los 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...:Q4_K_M`), Ollama (`ollama run hf.co/richardyoung/...:Q4_K_M`) y cualquier runtime compatible con GGUF; vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (972 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Q4_K_M) | 32,2 B | no disponible | 57,5 % (medido en bf16) | apache-2.0 | GGUF |
| richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic (bf16) | 32,2 B | no disponible | 57,5 % | apache-2.0 | safetensors |
| allenai/Olmo-3.1-32B-Instruct (original) | 32,2 B | no disponible | 84,1 % | no disponible en la informacion proporcionada | no disponible |

No se dispone de datos de benchmarks de capacidad ni de contexto que permitan comparar con otras familias de 32 B; la comparativa se limita al eje de rechazo, que es el que documenta el estudio citado.

## Limitaciones y advertencias

- Modelo de investigacion, no un asistente de proposito general: el autor lo declara explicitamente y desaconseja su uso como tal.
- Eliminacion deliberada de rechazos: responde a un 42,5 % de los prompts daninos del conjunto de evaluacion que el original rechazaba, lo que implica riesgo directo de generar contenido danino.
- Las cifras de rechazo corresponden al modelo en bf16; el autor advierte que la cuantizacion puede alterar el comportamiento de rechazo y que los archivos GGUF no fueron evaluados en el paper.
- Solo ingles: el campo `language` del repositorio no incluye otros idiomas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben asumirse los del modelo base Olmo 3.1.
- Contexto maximo no documentado en este repositorio; conviene consultar la model card del modelo base antes de disenar prompts largos.
- Licencia apache-2.0, con las mismas restricciones de uso que el modelo fuente; el usuario es responsable del uso legal.
- Sin descargas ni likes en el momento de la ficha (0 y 0), lo que implica ausencia de validacion comunitaria y de reportes de fallos.
- Repositorio en construccion: varias cuantizaciones estan anunciadas pero no publicadas, y no hay garantia de que se mantenga la nomenclatura.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic-GGUF
- Modelo base abliterado: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic
- Modelo original: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Paper citado (pendiente de enlace arXiv): Richard J. Young, "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors", 2026.
- Herramienta Heretic 2.0: no disponible enlace en la informacion proporcionada.
- llama.cpp: no disponible enlace en la informacion proporcionada.
