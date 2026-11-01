# JRamirez-UAB/Groot-19B-A3B-EXL3-4.00bpw-16-24GB

## Resumen

Groot-19B-A3B-EXL3-4.00bpw-16-24GB es una cuantizacion EXL3 no oficial, de caracter comunitario, del modelo GrootTeam/Groot-19B-A3B-261023, un modelo de razonamiento con arquitectura de mezcla de expertos (MoE) de 19B parametros totales y aproximadamente 3B activos, post-entrenado a partir de Qwen3.6-35B-A3B. La publica el usuario JRamirez-UAB y conserva tanto la torre de vision como la cabeza MTP (multi-token prediction) del modelo original. El checkpoint ocupa 11,5 GB en disco y esta pensado para servirse con vLLM junto con exllamav3 y plugins especificos.

La relevancia de esta ficha radica en que demuestra que es posible ejecutar un modelo MoE multimodal con 262.144 tokens de contexto completo, vision y decodificacion especulativa en una unica GPU de 24 GB, algo que el modelo en BF16 no permite. La cuantizacion aplica 4,00 bits por peso en los expertos enrutados, 6 bits en la atencion (completa y lineal), el experto compartido, el `lm_head` y la torre de vision, 4 bits en la cabeza MTP y embeddings en BF16.

El modelo esta orientado a un caso de uso muy concreto: agente local de administracion de sistemas Linux mediante opencode con tool calling, en espanol, para un departamento de TI universitario. Las trazas de calibracion y las pruebas de calidad reflejan ese escenario, por lo que los numeros pueden diferir en otros dominios o idiomas. La licencia es Apache-2.0, heredada del modelo base, y no se trata de un lanzamiento oficial de los autores de Groot ni de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con atencion completa y lineal, torre de vision y cabeza MTP; arquitectura Qwen3.5 / Qwen3.6 |
| Parametros totales | 5.701.468.160 (segun safetensors del repo); el autor declara 19B totales en el modelo base |
| Parametros activos | Aproximadamente 3B (denominacion A3B del modelo base) |
| Longitud de contexto | 262.144 tokens en 24 GB; 212.992 tokens en 16 GB |
| Tipos de cuantizacion | EXL3: 4,00 bpw en expertos enrutados, 6 bits en atencion y experto compartido, 6 bits en `lm_head`, 6 bits en vision, 4 bits en MTP, embeddings BF16 |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3, `quantization_config`: `exl3`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE post-entrenado a partir de Qwen3.6-35B-A3B, con atencion completa y lineal, torre de vision y cabeza MTP para decodificacion especulativa. Esta cuantizacion conserva esas tres componentes (vision, MTP y atencion mixta) y las cuantiza de forma diferenciada: 6 bits para atencion y experto compartido mediante la opcion `-hq`, 6 bits para `lm_head` y torre de vision, 4 bits para la cabeza MTP y BF16 para los embeddings de tokens. El resultado son 11,5 GB en disco.

La cuantizacion se realizo con exllamav3 y se sirve con vLLM 0.31.0 mediante el plugin `vllm-quantpack` y el plugin propio `qwen38_exl3_vision`, que aporta la torre de vision EXL3 y la cabeza MTP para las arquitecturas Qwen3.5 / Qwen3.6. El autor no detalla en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo original GrootTeam/Groot-19B-A3B-261023 y no se reproducen aqui. La calibracion de la cuantizacion se hizo con trazas propias de sysadmin en espanol, trazas de sesiones reales de opencode y la traza publica `qbench_prompts_gen.json` de turboderp.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento heredado del modelo base.
- Capacidades de vision: pipeline `image-text-to-text`, con torre de vision cuantizada a 6 bits.
- Tool calling y function calling, validado con la peticion real de opencode (34/60 en la bateria de pruebas, frente a 32/60 del BF16).
- Uso como agente: tareas de administracion de sistemas con ejecucion real de comandos (21/30 en 10 tareas de sysadmin por 3 ejecuciones).
- Decodificacion especulativa mediante cabeza MTP (MTP 1).
- Contexto largo: hasta 262.144 tokens con vision y MTP en 24 GB.
- Capacidades multilingues en espanol e ingles.
- Compatibilidad con endpoints mediante vLLM (`endpoints_compatible`).

## Casos de uso

- Agente local de administracion de sistemas Linux: el modelo puede gestionar sesiones de opencode con tool calling y ejecucion real de comandos, gracias a su contexto de 262.144 tokens y a la cabeza MTP para acelerar la decodificacion en un flujo agentico de varios pasos.
- Asistente de terminal para diagnosticos y reparaciones: con 24 GB de VRAM se puede mantener una sesion de contexto completo con vision (por ejemplo, capturas de pantalla de errores) y MTP activo, lo que permite analizar logs extensos y salidas de comandos sin truncar.
- Automatizacion de tareas de TI en un departamento universitario: el autor lo evalua con tareas reales de sysadmin en espanol, lo que lo hace adecuado para flujos internos de soporte y mantenimiento de servidores.
- Procesamiento de documentacion tecnica larga: la ventana de 262.144 tokens permite ingerir manuales, configuraciones y trazas completas en una sola pasada, con recuperacion en contexto largo validada por el autor.
- Despliegue en estaciones de trabajo con GPU consumer: al caber en una RTX 3090 de 24 GB con vision y MTP, es viable para entornos de desarrollo locales sin infraestructura de centro de datos.
- Servicio concurrente de baja latencia: con vLLM y continuous batching alcanza 139 / 249 / 435 / 716 tok/s con 1 / 2 / 4 / 8 peticiones en una L40S, adecuado para varios usuarios simultaneos en un pool de aproximadamente 3,5 sesiones de contexto completo.
- Evaluacion e investigacion de cuantizacion: al incluir `quantization_config.json`, parches y script de instalacion, sirve como referencia reproducible para estudiar el impacto de EXL3 en modelos MoE multimodales.

## Benchmarks y rendimiento

Calidad de cuantizacion frente al original BF16 con `qbench` de exllamav3 (2026-10-26):

| Traza | KLD media | KLD mediana | KLD p90 | PPL BF16 | PPL EXL3 |
|---|---|---|---|---|---|
| Traza sysadmin propia | 0.0108 | 0.0038 | 0.0276 | 3.5345 | 3.5407 |
| Sesiones opencode | 0.0100 | 0.0035 | 0.0251 | 4.3234 | 4.3219 |
| Traza publica de turboderp | 0.0105 | 0.0017 | 0.0290 | 2.3879 | 2.3912 |

Rendimiento de decodificacion (tok/s) con MTP 1:

| Peticiones concurrentes | L40S (48 GB) | RTX 3090 (24 GB) |
|---|---|---|
| 1 | 139 | 125 |
| 2 | 249 | 207 |
| 4 | 435 | 336 |
| 8 | 716 | 525 |

Otras metricas reportadas por el autor:

| Prueba | Resultado |
|---|---|
| Tool calls con la peticion real de opencode | 34/60 (BF16: 32/60) |
| Tareas de agente opencode (10 tareas × 3 ejecuciones) | 21/30, 5-6 minutos por ejecucion de 10 tareas |
| Contexto completo en 24 GB | 262.144 tokens, pool de 927.285 tokens, 3 sesiones concurrentes de ~236k tokens |
| Contexto completo en 16 GB | 212.992 tokens, pool de 214.928 tokens, 1 sesion |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 11,5 GB de pesos mas cache KV en fp8 (2.655.707.463 B en 16 GB; 11.296.602.849 B en 24 GB).
- GPU de 24 GB: contexto completo de 262.144 tokens con vision y MTP, pool de 927.285 tokens y unas 3,5 sesiones de contexto completo. Validado en una RTX 3090 real y en una L40S limitada a 24 GB.
- GPU de 16 GB: contexto de 212.992 tokens, pool de 214.928 tokens y 1 sesion. El intento con cache KV de 3,83 GB se excedio en 759 MiB.
- GPU recomendadas: NVIDIA L40S (48 GB, Ada) para capacidad y bateria de pruebas; RTX 3090 (24 GB, Ampere) para el caso de 24 GB; RTX PRO 6000 Blackwell Server Edition (96 GB) para divergencia KL y eleccion de cuantizacion.
- Cabe en GPU consumer: si, en RTX 3090 de 24 GB con contexto completo y vision.
- Despliegue: vLLM 0.31.0 con exllamav3 1.5.1, el plugin OrcaSAQ2 y el plugin `qwen38_exl3_vision`. Un `pip install vllm`, Transformers o SGLang estandar no pueden cargar este checkpoint.
- Latencia y throughput: 139 / 249 / 435 / 716 tok/s con 1 / 2 / 4 / 8 peticiones en L40S; 125 / 207 / 336 / 525 tok/s en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Groot-19B-A3B-EXL3-4.00bpw (este) | 19B totales / ~3B activos | 262.144 (24 GB) | Apache-2.0 | HuggingFace, requiere vLLM + exllamav3 + plugins | Cuantizacion comunitaria con vision y MTP |
| GrootTeam/Groot-19B-A3B-261023 (BF16) | 19B totales / ~3B activos | No disponible en la informacion | Apache-2.0 | HuggingFace | Original sin cuantizar; no cabe con contexto completo en 24 GB |
| Qwen3.6-35B-A3B (modelo de partida) | 35B totales / ~3B activos | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Base del post-entrenamiento de Groot |

No se dispone de datos de benchmarks estandar para establecer una comparacion cuantitativa con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es una cuantizacion no oficial de caracter comunitario; no es un lanzamiento de los autores de Groot ni de Qwen.
- Requiere una pila de software especifica (vLLM 0.31.0, exllamav3 1.5.1, OrcaSAQ2 y el plugin `qwen38_exl3_vision`); no funciona con instalaciones genericas de vLLM, Transformers o SGLang.
- La calibracion y las evaluaciones se centran en un unico caso de uso (agente de sysadmin Linux en espanol); el rendimiento en otros dominios o idiomas puede diferir.
- El autor advierte de que los numeros de otras areas o idiomas pueden variar.
- En 16 GB no cabe el contexto completo de 262.144 tokens; el limite es 212.992.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache-2.0, que permite uso comercial, pero al derivar de un modelo base conviene revisar las condiciones del modelo original.
- La cabeza MTP esta cuantizada a 4 bits, lo que puede afectar la calidad de la decodificacion especulativa frente al BF16.
- El checkpoint no incluye el original BF16, exllamav3, vLLM ni OrcaSAQ2, que deben instalarse desde sus repositorios.

## Enlaces

- HuggingFace: https://huggingface.co/JRamirez-UAB/Groot-19B-A3B-EXL3-4.00bpw-16-24GB
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- exllamav3: https://github.com/turboderp-org/exllamav3
- Paper de referencia: arxiv:2406.11235
