# sayyidfareed/Qwen3.8-Flash-Next-Code-Turbo-Spark

## Resumen

Qwen3.8-Flash-Next Code Turbo for DGX Spark es un perfil de despliegue para el modelo multimodal Qwen3.8-Flash-Next, empaquetado por el usuario sayyidfareed. No modifica los pesos del checkpoint base `RadixArk/Qwen3.8-Flash-Next-NVFP4`, sino que optimiza el runtime de SGLang para ejecutar el modelo completo en un solo sistema DGX Spark (GB10 con 128 GB de memoria unificada). El objetivo es lograr velocidades de generación de código superiores a 48 tokens por segundo en tareas compactas y 32 tokens por segundo en una mezcla de cinco lenguajes de programación, manteniendo una ventana de contexto de 256K tokens y capacidades multimodales.

El modelo subyacente, Qwen3.8-Flash-Next, es un MoE ultra-sparse de 125 mil millones de parámetros (6 mil millones activos por token) que combina atención híbrida Gated DeltaNet (GDN) con Qwen Sparse Attention (QSA), además de una tabla de embeddings N-gram de 51 mil millones de parámetros. Este perfil resuelve el problema de ejecutar un checkpoint de ~126 GB en un sistema con solo 121,63 GiB de memoria unificada usable, mediante una técnica de mapeo por memoria (mmap) de la tabla PLE desde NVMe. La relevancia actual radica en que permite ejecutar un modelo de alto rendimiento en hardware de escritorio de gama alta, sin necesidad de clústeres multiprocesador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido GDN + QSA (3 de cada 4 capas con Gated DeltaNet, la cuarta con Qwen Sparse Attention) |
| Parametros totales | 125 mil millones (incluye 51 mil millones de tabla de embeddings N-gram) |
| Parametros activos | 6 mil millones por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | NVFP4 (checkpoint base) |
| Idiomas soportados | no disponible (el modelo base Qwen es multilingue, pero no se especifica en la ficha) |
| Licencia | MIT para el codigo del perfil; los pesos de Qwen y RadixArk tienen sus propios terminos |
| Formato de pesos | no disponible (checkpoint NVFP4 servido via SGLang) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next, desarrollado por el equipo Qwen, introduce una arquitectura MoE ultra-sparse que combina dos mecanismos de atencion: tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historico de tokens de forma lineal, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperacion precisa de contextos largos. Ademas, incorpora una tabla de embeddings N-gram de 51 mil millones de parametros que complementa los embeddings de token habituales, mejorando la capacidad de modelado sin aumentar el coste computacional por token.

Este repositorio no entrena ni ajusta los pesos; se trata de un perfil de servidor SGLang que aplica optimizaciones de runtime: mapeo por memoria (mmap) de la tabla PLE desde NVMe para liberar memoria unificada, un parche especifico para atencion sparse en computadoras con capacidad 12.1 (SM120/SM121), un anillo de tokens pendientes QSA mas amplio y especulacion NEXTN nativa con 7 pasos y 8 tokens de borrador. No se dispone de informacion sobre los datos de entrenamiento del modelo base ni sobre procesos de RLHF o DPO.

## Capacidades

- Generacion de codigo en multiples lenguajes (Python, Rust, TypeScript, CUDA C++, Go), con resultados verificados en HumanEval y EvalPlus.
- Razonamiento y resolucion de problemas de ingenieria de software, incluyendo diseno de sistemas y migraciones de bases de datos.
- Soporte multimodal (imagen-texto a texto), con vision habilitada en el perfil.
- Soporte de herramientas (tool calling) segun los tags del repositorio, aunque no se documenta un protocolo especifico.
- Ventana de contexto de 256K tokens, validada con pruebas de recuperacion de agujas distribuidas a 32K.
- Modo de razonamiento configurable (thinking habilitado o deshabilitado via `chat_template_kwargs`).
- Decodificacion especulativa nativa NEXTN para acelerar la generacion.

## Casos de uso

- Asistente de programacion integrado en IDE: el modelo puede generar y completar codigo en tiempo real gracias a su baja latencia de primer token (0,319 s de TTFT) y su alta velocidad de decodificacion en tareas compactas (48,9 tok/s).
- Generacion de codigo en pipelines de CI/CD: con soporte de herramientas y una ventana de 256K tokens, puede revisar pull requests completas, sugerir correcciones y generar tests automatizados de forma fiable.
- Agente de ingenieria de software autonomo: la capacidad de manejar contexto largo y razonamiento multi-paso permite que el modelo actue como agente que lee repositorios enteros, planifica cambios y ejecuta tareas de refactorizacion.
- Analisis de documentacion tecnica multimodal: al aceptar imagenes, puede interpretar diagramas de arquitectura, capturas de pantalla de errores y esquemas de bases de datos para generar explicaciones o codigo asociado.
- Soporte tecnico multilingue: aunque los idiomas no estan documentados, el modelo base Qwen soporta multiples lenguas, lo que permite desplegar un asistente de atencion al cliente con contexto largo de conversaciones.
- Prototipado rapido de aplicaciones: con una sola maquina GB10, un equipo puede ejecutar el modelo localmente para generar esqueletos de aplicaciones, migraciones SQL y scripts de despliegue sin depender de APIs externas.

## Benchmarks y rendimiento

Los resultados fueron medidos en un ASUS GX10 con GB10 y 121,63 GiB de memoria unificada usable, segun la model card del repositorio.

| Prueba | Resultado |
|---|---|
| HumanEval pass@1 | 155/164 (94,5 %) |
| HumanEval+ Mini pass@1 | 150/164 (91,5 %) |
| Decodificacion mediana en cinco lenguajes | 32,408 tok/s |
| Rango en cinco lenguajes | 25,705-40,511 tok/s |
| TTFT mediano | 0,319 s |
| Decodificacion mediana en codigo compacto | 48,9 tok/s |
| Pico en codigo compacto | 52,7 tok/s |
| Generacion EvalPlus con dos clientes | 70,796 tok/s agregados |
| Recuperacion de aguja distribuida a 32K | 5/5 |

La diferencia entre velocidad compacta y velocidad en cinco lenguajes se debe a que la decodificacion especulativa acepta mas borradores en codigo corto y predecible. Los resultados se obtuvieron con temperatura 0, top-p 0,95, thinking deshabilitado y un limite de 768 tokens de completado para HumanEval.

## Requisitos de hardware

- Hardware requerido: DGX Spark, ASUS GX10 u otro sistema con GB10 y 128 GB de memoria unificada (121,63 GiB usables).
- Almacenamiento: aproximadamente 140 GB de almacenamiento local rapido (NVMe).
- Memoria: no se requiere VRAM discreta; el modelo usa memoria unificada CPU/GPU. La tabla PLE de ~48 GB se mapea desde NVMe mediante mmap.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) por el tamaño del checkpoint y la memoria unificada necesaria.
- Despliegue: contenedor Docker con runtime NVIDIA, sirviendo un endpoint compatible con OpenAI en el puerto 11002 mediante SGLang.
- Latencia y throughput: TTFT mediano de 0,319 s; decodificacion de 32,4 a 48,9 tok/s segun la carga de trabajo.
- Tiempo de arranque: aproximadamente nueve minutos en el sistema probado.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la informacion proporcionada. Este perfil se diferencia del checkpoint base `RadixArk/Qwen3.8-Flash-Next-NVFP4` en que no altera los pesos, pero mejora el rendimiento de inferencia gracias al runtime optimizado. Como alternativas de la misma categoria (MoE de codigo con contexto largo) se podrian considerar Qwen2.5-Coder-32B o DeepSeek-Coder-V2, pero no hay resultados comparables en la documentacion disponible.

| Modelo | Parametros totales | Parametros activos | Contexto | Rendimiento en codigo |
|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B | 6B | 262K | no disponible |
| Qwen3.8-Flash-Next Code Turbo (este perfil) | 125B | 6B | 262K | 94,5 % HumanEval pass@1 |
| Qwen2.5-Coder-32B | 32B | 32B | 128K | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo; solo codigo y artefactos de benchmark. Los pesos deben descargarse desde `RadixArk/Qwen3.8-Flash-Next-NVFP4` y estan sujetos a las licencias de Qwen y RadixArk, que pueden no ser MIT.
- Requiere hardware especifico (GB10 con 128 GB de memoria unificada); no es portable a GPUs discretas convencionales sin modificaciones significativas.
- La velocidad de decodificacion varia notablemente segun el tipo de codigo; los 48,9 tok/s se refieren a codigo compacto y predecible, no a codigo mixto.
- El checkpoint ocupa ~126 GB en disco, mas que la memoria unificada usable, por lo que depende del mapeo NVMe; un NVMe lento degradaria el rendimiento.
- El perfil no autentica las peticiones (cualquier clave API no vacia es aceptada); en entornos de produccion compartidos se debe anadir autenticacion.
- No se documentan sesgos ni riesgos de alucinacion especificos, pero al ser un modelo de lenguaje generativo, existe riesgo de producir codigo incorrecto o inseguro; se recomienda revision humana.
- El soporte multilingue y de herramientas no esta detallado en la ficha; se infiere de los tags y de las capacidades del modelo base.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/sayyidfareed/Qwen3.8-Flash-Next-Code-Turbo-Spark
- Modelo base RadixArk: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Pagina oficial de Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Recetas de vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guia de ejecucion local en unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Analisis en OpenLM: https://openlm.ai/qwen3.8/
