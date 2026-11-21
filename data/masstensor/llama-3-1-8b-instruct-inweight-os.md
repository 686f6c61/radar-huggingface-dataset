# masstensor/Llama-3.1-8B-Instruct-InWeight-OS

## Resumen

Llama-3.1-8B-Instruct-InWeight-OS es un checkpoint derivado de meta-llama/Llama-3.1-8B-Instruct publicado por el usuario masstensor en Hugging Face. No es un modelo entrenado desde cero ni un fine-tune convencional: se presenta como un "sistema operativo en pesos" (In-Weight OS) que compone tres habilidades (seguridad frente a jailbreaks, enrutado multi-herramienta en JSON y enrutado metacognitivo System-1/System-2) sobre el modelo base mediante la modificacion de un subconjunto muy reducido de neuronas del MLP terminal.

La propuesta tecnica consiste en particionar canales "dormidos" del bloque SwiGLU de la capa 31 en bancos de habilidades estrictamente disjuntos, usando en total 51 neuronas (aproximadamente el 0,014 % de los parametros del modelo). El autor afirma que la compilacion del checkpoint requiere entre 12 y 15 segundos en una sola GPU y cero pasos de gradiente, lo que lo situa como una alternativa a SFT, LoRA y a tecnicas de merging post-hoc como Task Arithmetic o TIES-Merging.

El modelo conserva la arquitectura y el tokenizador del Llama-3.1-8B-Instruct original (8.030.261.248 parametros segun safetensors) y se distribuye con licencia MIT. Es relevante para quienes investigan weight-space programming, composicion modular de habilidades y despliegue de parches de comportamiento sin reentrenamiento completo, aunque la validacion independiente de sus cifras es practicamente inexistente (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con modificacion en el MLP SwiGLU de la capa 31 |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no disponible (no es MoE; el autor indica que solo se modifican 51 neuronas, ~0,014 % del total) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K tokens, pero el autor no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bfloat16/float; no se publican GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (mas cartuchos `.pt` de 1-2 MB cada uno) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 de 8B parametros: transformer decoder-only con atencion por grupos (GQA), RoPE y MLP SwiGLU. La innovacion no reside en la arquitectura sino en el procedimiento de post-entrenamiento: en lugar de ajustar subespacios densos solapados mediante SFT o LoRA, el autor identifica canales dormidos en el MLP de la capa 31 y los asigna a tres bancos de habilidades disjuntos (C1, C2 y C3), resueltos mediante un "Guard-Nullspace Solver" con calibracion de shrinkage y validacion out-of-fold de 2 pliegues. El proceso no requiere pasos de gradiente y, segun la model card, se completa en 12-15 segundos en una GPU.

Los tres bancos son: C1 (15 neuronas) para seguridad quirurgica e inmunidad a inyeccion de prompts; C2 (30 neuronas) para compilacion de esquema JSON multi-herramienta con tres destinos (sql_engine, python_exec, web_search); y C3 (6 neuronas) para enrutado metacognitivo entre respuesta directa (System-1) y cadena de pensamiento completa (System-2). El autor no detalla el volumen ni la composicion del dataset de entrenamiento mas alla de referenciar el benchmark masstensor/InWeight-OS-MultiSkill-Benchmark, ni especifica si hubo RLHF o DPO adicionales sobre el modelo base.

## Capacidades

- Generacion de texto conversacional heredada del Llama-3.1-8B-Instruct original.
- Resistencia a jailbreaks e inyeccion de prompts: el autor reporta bloqueo del 95 %-100 % de jailbreaks no vistos con 0,0 % de falsos rechazos en prompts tecnicos benignos de XSTest.
- Enrutado multi-herramienta en JSON: clasificacion de consultas hacia sql_engine, python_exec o web_search con precision reportada del 95,8 %-100,0 %.
- Enrutado metacognitivo System-1/System-2: respuestas directas para consultas triviales y cadena de pensamiento completa para derivaciones matematicas complejas.
- Instalacion modular de habilidades: los cartuchos `.pt` (1-2 MB) pueden instalarse sobre un Llama-3.1-8B-Instruct vanilla en aproximadamente 20 milisegundos mediante `install_skills.py`.
- Soporte de tool calling y function calling (via banco C2).
- Compatibilidad con vLLM y transformers, y con text-generation-inference segun los tags del repo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles (el modelo base no las soporta).

## Casos de uso

- Despliegue de asistentes con guardrails de seguridad: el banco C1 permite filtrar jailbreaks e inyecciones de prompt en produccion sin degradar la tasa de respuesta a consultas tecnicas legitimas, segun las cifras del autor (0,0 % de falsos rechazos en XSTest).
- Enrutado de consultas en pipelines de agentes: el banco C2 clasifica peticiones de usuario hacia bases de datos SQL, ejecucion de codigo Python o busqueda web, lo que facilita la orquestacion de herramientas en sistemas multi-agente.
- Optimizacion de coste y latencia en atencion al cliente: el banco C3 decide cuando responder de forma directa y cuando activar razonamiento extendido, reduciendo tokens generados en consultas triviales.
- Investigacion en weight-space programming: permite experimentar con composicion modular de habilidades sin reentrenar el modelo completo, instalando o retirando cartuchos de 1-2 MB en milisegundos.
- Prototipado rapido de variantes de comportamiento: al compilar en 12-15 segundos en una sola GPU, es viable generar checkpoints especializados para pruebas A/B de politicas de seguridad o de enrutado.
- Sistemas de moderacion y compliance: combinacion del banco de seguridad con el de enrutado para construir capas de filtrado previas a un LLM principal, con la ventaja de que el parche ocupa un numero minimo de parametros.
- Fine-tuning ligero sobre el modelo base: los cartuchos pueden instalarse sobre un Llama-3.1-8B-Instruct vanilla, lo que permite mantener una copia limpia del modelo y aplicar habilidades bajo demanda.

## Benchmarks y rendimiento

El autor reporta cifras en la model card, pero no se han publicado resultados independientes ni detalles metodologicos completos en la informacion disponible. Se recogen a continuacion las cifras declaradas por el autor:

| Habilidad | Metrica | Resultado declarado | Comparativa declarada por el autor |
|---|---|---|---|
| C1 - Seguridad | Bloqueo de jailbreaks no vistos | 95 %-100 % | No disponible |
| C1 - Seguridad | Falsos rechazos en XSTest benignos | 0,0 % | 80 %-100 % bajo Safety SFT |
| C2 - Multi-tool JSON | Precision de enrutado | 95,8 %-100,0 % | No disponible |
| C2 - Multi-tool JSON | Falsas llamadas a herramienta en matematicas | No reportado | 28 %-100 % bajo Tool SFT |
| C3 - Router | No disponible | No disponible | No disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB para los pesos (el repo ocupa 16,1 GB) mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones teoricas, no confirmadas por el autor; el repo no publica GGUF).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; RTX 3090/4080 para cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 con bfloat16 y contexto moderado; en RTX 3060/4060 Ti 16 GB solo con cuantizacion.
- Opciones de despliegue: vLLM y transformers (soportados explicitamente por el autor); text-generation-inference segun los tags del repo; llama.cpp/Ollama no confirmados por falta de GGUF.
- Compilacion del checkpoint: 12-15 segundos en una sola GPU segun el autor.
- Instalacion de cartuchos: aproximadamente 20 milisegundos por conjunto de cartuchos segun el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-InWeight-OS | 8B | no disponible | Post-entrenamiento sin gradiente sobre canales dormidos | MIT | Hugging Face (0 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Modelo base oficial | Llama 3.1 Community License | Hugging Face (ampliamente usado) |
| Fine-tune LoRA tipico de Llama-3.1-8B | 8B | 128K | SFT/LoRA sobre subespacios densos | Depende del autor | Multiples en Hugging Face |
| Merged model (p. ej. TIES-Merging) | 8B | 128K | Fusion post-hoc de checkpoints | Depende del autor | Multiples en Hugging Face |

La comparativa con alternativas de la misma categoria (weight-space programming o merging modular) no esta disponible con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Validacion independiente inexistente: el modelo acumula 0 descargas y 0 likes en el momento de la consulta, y las cifras de rendimiento proceden unicamente del autor.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de tasas de alucinacion sobre este checkpoint.
- Sesgos conocidos: no disponibles; se heredan los del Llama-3.1-8B-Instruct original, no evaluados por el autor.
- Idiomas: no se especifica que idiomas conserva o degrada la modificacion de neuronas; el modelo base es multilingue pero el efecto del parche sobre idiomas distintos del ingles no esta documentado.
- Contexto: no se confirma que el checkpoint mantenga los 128K tokens del modelo base; conviene verificar antes de usarlo con contextos largos.
- Restricciones de licencia: el checkpoint se publica con licencia MIT, pero el modelo base Llama 3.1 esta sujeto a la Llama 3.1 Community License, cuyos terminos (incluida la clausula de nombre y las restricciones de uso) podrian seguir aplicando al modelo derivado; conviene revisarlo antes de uso comercial.
- Modificacion de solo 51 neuronas: el alcance del parche es muy limitado y no se documenta si afecta al rendimiento general del modelo en tareas ajenas a las tres habilidades.
- Ausencia de cuantizaciones publicadas (GGUF, AWQ, GPTQ) limita el despliegue en hardware de consumo sin conversion manual.
- Dependencia de scripts propios (`install_skills.py`) para la instalacion de cartuchos; no es una ruta estandar de transformers ni de vLLM.
- Fecha de creacion del repositorio (2026-11-21) y falta de historial de mantenimiento: no hay garantias de soporte o actualizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/masstensor/Llama-3.1-8B-Instruct-InWeight-OS
- Repositorio GitHub: https://github.com/zkwasm/in-weight-os-wsp
- Paper (PDF referenciado en la model card): paper.pdf (ruta relativa en el repo; no se dispone de URL absoluta verificada)
- Dataset de benchmark: https://huggingface.co/datasets/masstensor/InWeight-OS-MultiSkill-Benchmark
- Articulo del autor: https://tom.fenginwind.com/in-weight-os
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
