# IsValorum/Qwen3.8-Flash-Coder-APEX-I-NanoPlus-GGUF

## Resumen

Qwen3.8-Flash-Coder APEX-I-NanoPlus GGUF es una cuantizacion extrema del modelo base `Jab1718/qwen3.8-flash-coder-85gb-bf16`, un especialista en codigo de tipo MoE (mixture of experts) derivado de la familia Qwen. El autor de la cuantizacion es IsValorum, que aplica su pipeline propietario APEX para comprimir los 42.620 millones de parametros del modelo original (85 GB en BF16) hasta un unico fichero GGUF de 18,34 GB con 3,44 bits por peso. El objetivo es claro: hacer viable un modelo de frontera de codigo agentico en GPUs de consumo de 16 a 24 GB de VRAM, aceptando una perdida de calidad medida y documentada.

El modelo base es una porcion experimental intermedia creada con la herramienta `moe-slice`, en la que se podaron de forma permanente 352 de los 512 expertos enrutados del modelo original, calibrando exclusivamente contra datasets de Python y SWE-bench en ingles. El resultado es un especialista estricto en programacion en ingles, con degradacion severa en conversacion general y en cualquier idioma distinto del ingles.

La relevancia de esta ficha radica en que documenta un caso de cuantizacion agresiva con metricas de perplejidad publicadas (WikiText-2) y un mapa quirurgico de precisiones por tensor, lo que permite evaluar con datos si merece la pena el ahorro de memoria frente al coste de calidad. No es un modelo de proposito general: es una herramienta de codigo y tool-calling para entornos con VRAM limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForCausalLM`, transformer hibrido con 48 capas y MoE de 160 expertos (10 activos) |
| Parametros totales | 42.620.341.120 (42,6B) |
| Parametros activos | Aproximadamente 3,7B por token (10 expertos enrutados + 1 compartido + backbone denso); 4,9B incluyendo embeddings de vocabulario |
| Longitud de contexto | 262.144 tokens (256K nativo) |
| Tipos de cuantizacion | GGUF APEX-I-NanoPlus a 3,44 BPW (mezcla quirurgica de Q3_K, Q6_K y otras precisiones por tensor); el repo incluye un unico fichero |
| Idiomas soportados | Ingles exclusivamente (especialista en codigo; degradacion severa en otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero: `Qwen3.8-Flash-Coder-85GB.APEX-I-NanoPlus.gguf`, 18,34 GB / 17,08 GiB) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer hibrida de 48 capas con un bloque MoE de 160 expertos del que se activan 10 por token, mas un experto compartido y un backbone denso. Segun la model card, el modelo original contaba con 512 expertos enrutados; la version base de esta cuantizacion paso por `moe-slice`, que podo permanentemente 352 expertos calibrando unicamente contra Python y SWE-bench en ingles. Esta poda explica tanto el rendimiento especializado como la perdida de capacidades generales y multilingues.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada. La model card menciona que el autor upstream aun no ha publicado la pasada de fine-tuning de recuperacion, lo que confirma que se trata de una version intermedia experimental. La innovacion tecnica destacable no esta en el modelo sino en la cuantizacion: el pipeline APEX aplica precisiones distintas por tensor (por ejemplo, `output.weight` en Q6_K para preservar la clasificacion de tokens, `token_embd.weight` en Q3_K sobre un vocabulario de 248k, y normas de atencion y highway en precisiones especificas), con calibracion mediante imatrix.

## Capacidades

- Generacion de codigo en Python y tareas de SWE-bench en ingles: completado, refactorizacion y correccion.
- Razonamiento agentico multi-paso orientado a tareas de programacion.
- Tool calling y function calling para integracion en agentes.
- Razonamiento con esfuerzo configurable mediante plantilla de chat endurecida para uso agentico.
- Contexto largo de 256K tokens, util para repositorios completos o sesiones prolongadas de depuracion.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con llama.cpp / LM Studio.
- No soporta vision, audio ni conversacion general fiable; el multilingue esta practicamente destruido por la poda de expertos.

## Casos de uso

- Autocompletado y generacion de codigo en IDE: el modelo puede integrarse via llama.cpp o LM Studio en un equipo con 16-24 GB de VRAM, ofreciendo sugerencias de Python en ingles con un footprint de 17 GiB en RAM/VRAM.
- Refactorizacion de repositorios medianos: con 256K tokens de contexto puede ingerir varios ficheros y proponer cambios coherentes entre modulos, aunque limitado a codigo en ingles.
- Agente de resolucion de issues estilo SWE-bench: el soporte de tool calling y razonamiento multi-paso permite construir agentes que lean el repositorio, ejecuten pruebas y propongan parches.
- Generacion de tests unitarios: adecuado para producir suites de pruebas en Python a partir de codigo existente, aprovechando su calibracion contra datasets de Python.
- Asistente de CI/CD: integrable en pipelines para revision automatica de diffs, deteccion de errores de sintaxis y sugerencias de correccion antes del merge.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en 16 GB de VRAM con streaming desde RAM del sistema, permite inferencia local sin depender de servicios en la nube.
- Prototipado de agentes de codigo en entornos con presupuesto de memoria ajustado: su bajo BPW permite ejecutar un MoE de 42,6B donde un modelo denso equivalente no cabria.

## Benchmarks y rendimiento

La model card publica unicamente perplejidad en WikiText-2 y comparativas de tamano entre cuantizaciones del mismo modelo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni SWE-bench en la informacion disponible.

| Especificacion | Tamano en disco | Huella en RAM/VRAM | BPW | Perplejidad WikiText-2 | Delta PPL vs BF16 |
|---|---|---|---|---|---|
| BF16 de referencia | 85,30 GB (79,44 GiB) | 79,44 GiB | 16,00 | 30,0975 +/- 0,1200 | Baseline (0,00%) |
| APEX-I-MiniPlus V2.1 | 21,77 GB (20,27 GiB) | 20,27 GiB | 3,45 | 30,1495 +/- 1,0089 | +0,0520 (+0,17%) |
| APEX-I-NanoPlus (este modelo) | 18,34 GB (17,08 GiB) | 17,08 GiB | 3,44 | 34,4199 +/- 1,1591 | +4,3224 (+14,36%) |
| Q3_K_S plano estandar | 20,41 GB | 19,01 GiB | 3,10 | aprox. 30,75 - 31,20 | +0,65 a +1,10 (+2,9%) |
| APEX Mini generico (IQ2_S) | 17,73 GB | 16,51 GiB | 2,50 | aprox. 31,60 - 33,10 | +1,50 a +3,00 (+7,5%) |

## Requisitos de hardware

- VRAM estimada: 17,08 GiB de huella en RAM/VRAM para el fichero completo; con streaming desde RAM del sistema puede ejecutarse en GPUs de 16 GB.
- GPU recomendadas: RTX 4090 (24 GB) y RTX 4080 (16 GB) para ejecucion completa en VRAM; A100 y H100 sobradas para este tamano.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas (RTX 4080, RTX 4090, RTX 4060 Ti de 16 GB) con streaming parcial desde RAM del sistema.
- Opciones de despliegue: llama.cpp (`llama-server`) y LM Studio son las opciones indicadas por el autor. No es compatible con Strata Engine, que requiere el monolito de 512 expertos y las tablas PLE de 51B.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor menciona "fast system RAM streaming" como ventaja del formato, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APEX-I-NanoPlus (este) | 42,6B totales / ~3,7B activos | 256K | 34,4199 (+14,36% vs BF16) | Apache 2.0 | GGUF, 18,34 GB |
| APEX-I-MiniPlus V2.1 | 42,6B totales / ~3,7B activos | 256K | 30,1495 (+0,17% vs BF16) | Apache 2.0 | GGUF, 21,77 GB |
| BF16 de referencia | 42,6B totales / ~3,7B activos | 256K | 30,0975 (baseline) | Apache 2.0 | GGUF, 85,30 GB |
| Q3_K_S plano estandar | 42,6B totales | 256K | aprox. 30,75 - 31,20 | Apache 2.0 | GGUF, 20,41 GB |

No se dispone de datos de benchmarks de tareas (MMLU, HumanEval, SWE-bench) para comparar con modelos de otros autores de la misma categoria.

## Limitaciones y advertencias

- Especialista estricto en ingles: el modelo degrada severamente y produce texto roto en espanol, frances, aleman y otros idiomas, segun advierte el propio autor.
- Conversacion general no fiable: la poda de expertos conversacionales elimina la capacidad de chachara general; solo es apto para codigo y tool-calling.
- Version experimental pre-release: el autor upstream no ha publicado la pasada de fine-tuning de recuperacion, por lo que el modelo es una porcion intermedia y no una version final.
- Perdida de calidad medible: +14,36% de perplejidad frente a BF16, muy superior al +0,17% de MiniPlus; el autor lo clasifica como tier Q4_K_M solido.
- Riesgo de alucinacion en codigo: como cualquier modelo de codigo, puede inventar APIs o funciones inexistentes; requiere validacion con tests.
- Advertencia de sintaxis y repeat penalty: la model card incluye un aviso critico sobre sustitucion de caracteres en codigo si no se configura correctamente el repeat penalty.
- Incompatibilidad con Strata Engine: requiere llama.cpp o LM Studio; no funciona con el motor de 512 expertos.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones tecnicas (solo ingles, solo codigo) restringen su aplicabilidad en produccion generalista.
- Sesgos: no documentados en la informacion proporcionada; al estar entrenado solo con datos de codigo en ingles, hereda los sesgos de ese corpus.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/Jab1718/qwen3.8-flash-coder-85gb-bf16
- APEX-I-MiniPlus V2.1: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-APEX-I-MiniPlus-V2.1-GGUF
- BF16 de referencia: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-85GB-BF16-GGUF
- Apoyo al autor: https://ko-fi.com/isvalorum
