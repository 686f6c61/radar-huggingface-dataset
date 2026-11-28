# Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q8-mlx

## Resumen

Qwen3.8-27B-Atlassian-Q8-mlx es una especializacion del modelo base Qwen/Qwen3.8-27B (arquitectura `qwen3_5`, 27.356.728.560 parametros) afinada mediante LoRA por el estudio LeanZero para el ecosistema Atlassian: Forge, Jira, Jira Service Management, Confluence y Assets. El resultado se distribuye como un checkpoint MLX cuantizado a 8 bits (group size 64) con el adaptador LoRA fusionado en los pesos por modulo, mas un sidecar `mtp.safetensors` con la cabeza de prediccion multi-token (MTP) para decodificacion especulativa en motores compatibles.

El problema que aborda es la escasez de conocimiento factual y procedimental fiable sobre el desarrollo de apps Forge y las APIs de Atlassian en los modelos generalistas. El autor reporta una sonda de identificadores Atlassian del 85% frente al 15% del base para hechos anteriores a abril de 2026, y una tasa de manifiestos Forge validos de 31,3 sobre 35 frente a 0 del base en su mejor modo.

Es relevante ahora porque combina tres piezas poco habituales en un modelo de nicho: cuantizacion 8-bit para Apple Silicon, un adaptador inyectado con rechazo de muestras validado por herramientas reales (validador de manifiestos de Atlassian, allow-list y `tsc`) y una cabeza MTP que acelera la inferencia en motores que la soportan. La licencia es Apache 2.0 y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen3_5` (base Qwen3.8-27B) con cabeza MTP de decodificacion especulativa |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits, group size 64 (MLX); adaptador LoRA fusionado por modulo a 8 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), mas `mtp.safetensors` como sidecar |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B en bf16 y se cuantiza a 8 bits con mlx-node y mlx-lm. El adaptador LoRA se entrena con mlx-lm y se fusiona en los pesos alli donde el delta sobrevive a la cuantizacion. La cabeza MTP se distribuye aparte: mlx-lm y LM Studio solo leen `model*.safetensors`, por lo que ignoran el sidecar y cargan el modelo como un checkpoint `qwen3_5` convencional; los motores con soporte MTP (Rapid-MLX de LeanZero, Elzi) obtienen decodificacion especulativa.

El entrenamiento se desarrollo en seis rondas documentadas. La ronda 1 uso aproximadamente 3,7M de tokens durante dos epocas: doce apps Forge escritas por LeanZero, cinco fixtures de forge-sim, 175 manifiestos generados desde el esquema `@forge/manifest` 13.4 y validados con el validador oficial, ejemplos de UI Kit (`@forge/react` 12) que compilan contra los tipos reales, hechos extraidos de 1.820 secciones de documentacion Forge (solo respuestas literales), endpoints y scopes de las especificaciones OpenAPI de Jira, Jira Software, JSM, Assets, Admin y Confluence, 1.400 pares pregunta-respuesta verificados, 337 respuestas publicadas por LeanZero en las comunidades de Atlassian, 220 hilos publicos del Atlassian Developer Community y un 7% de replay de codigo general.

Las rondas 3 a 6 anaden ajuste fino con rechazo de muestras: apps generadas por el propio modelo que solo se conservan si pasan el validador de manifiestos, la allow-list y `tsc` (380 apps completas y 51 manifiestos en la ronda 3; 937 apps de 450 briefs con 72% de aprobacion en la ronda 3 m7; 810 apps con 63% de aprobacion en la ronda 5). La ronda 5 incorpora 439 ejercicios validados por herramienta para tipos de modulo poco representados (validadores de workflow, post-functions, consumidores de cola, triggers programados, paginas de Confluence) y 245 pares de correccion de manifiestos. Un experimento DPO sobre 743 pares paso/fallo colapso el layout de ficheros (2 de 25) y se descarto. La ronda 6, correspondiente a esta release v0.5, expande el adaptador de 16 bloques a rango 32 hasta los 32 bloques entrenables a rango 128 (400M parametros frente a 47M) y entrena 2.600 pasos sobre 7,5M de tokens con penalizacion KL anclada a las predicciones top-32 del modelo de la ronda 5 en filas de conocimiento y del base en filas generales, con learning rate 1e-5 y decaimiento coseno.

## Capacidades

- Generacion de texto y codigo orientada al desarrollo de apps Forge para Jira, JSM y Confluence.
- Generacion de manifiestos `@forge/manifest` conformes al esquema 13.4 y validables con la herramienta oficial de Atlassian.
- Correccion de manifiestos defectuosos a partir de los mensajes reales del validador.
- Conocimiento de endpoints y scopes de las APIs de Jira, Jira Software, JSM, Assets, Admin y Confluence derivado de sus especificaciones OpenAPI.
- Componentes de UI Kit (`@forge/react` 12) que compilan contra las definiciones de tipos reales.
- Respuestas sobre soporte y uso de producto extraidas de documentacion y de hilos del Atlassian Developer Community.
- Decodificacion especulativa mediante cabeza MTP en motores compatibles (Rapid-MLX, Elzi).
- Modo thinking activable y desactivable; el autor reporta metricas separadas para ambos.
- Idioma: unicamente ingles declarado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Generacion de esqueletos de apps Forge: dado un brief de una linea, el modelo produce un manifiesto y el arbol de ficheros de una app; el autor mide 30 de 35 apps completas que compilan con `tsc` contra los tipos reales de `@forge/*`, lo que lo hace util como primer borrador en el arranque de un proyecto.
- Reparacion de manifiestos en CI: integrado en un pipeline que ejecute el validador de Atlassian, el modelo recibe el mensaje de error y el manifiesto fallido y devuelve una version corregida; se entreno con 362 pares de este tipo construidos a partir de fallos cuyo hermano si paso.
- Asistente de documentacion interna para equipos de plataforma: responde consultas sobre scopes, endpoints y limites de las APIs de Jira y Confluence apoyandose en hechos extraidos de las especificaciones OpenAPI y de 1.820 secciones de documentacion, reduciendo el tiempo de busqueda manual.
- Soporte a desarrolladores en foros y canales internos: el modelo conoce 220 hilos del Atlassian Developer Community con respuesta aceptada y 337 respuestas publicadas por el autor, lo que le permite redactar respuestas tecnicas con vocabulario y patrones de la comunidad.
- Migraciones y auditoria de configuracion: para tareas de gobierno de adjuntos en Confluence o reglas de workflow en Jira, el modelo puede redactar scripts y descripciones de pasos basandose en su conocimiento de los tipos de modulo (validadores de workflow, post-functions, consumidores de cola, triggers programados).
- Despliegue local en estaciones de trabajo Apple Silicon: al ser un checkpoint MLX de 8 bits con group size 64, se ejecuta en un Mac Studio sin GPU dedicada, lo que permite a un equipo mantener el asistente de codigo Atlassian en local sin enviar codigo propietario a un servicio externo.
- Generacion de paginas de espacio en Confluence y de consumidores de cola para integraciones: la ronda 5 incluye ejercicios especificos para estos tipos de modulo, que eran los peor cubiertos en las mezclas anteriores.

## Benchmarks y rendimiento

| Prueba | Modelo | Base Qwen3.8-27B | Condiciones |
|---|---|---|---|
| Sonda de identificadores Atlassian (hechos antes de 2026-04) | 85% | 15% | Thinking activado |
| Sonda de identificadores Atlassian (hechos despues de 2026-04) | 15% | 23% | Thinking activado |
| Sonda de identificadores Atlassian, servido | 85% / 31% | no disponible | Thinking desactivado |
| Manifiestos Forge validos (sobre 35) | 31,3 | 0 (mejor modo) | Thinking off, Rapid-MLX, media de 3 muestras por brief |
| Apps completas que compilan con `tsc` (sobre 35) | 30,0 | 0 | Thinking off, Rapid-MLX, media de 3 muestras por brief |
| Bucles genuinos en bateria de 40 prompts x 4 patas (2048 tokens) | 0 / 0 / 1 / 0 | 2 / 1 / 3 / 4 | Cuatro configuraciones de muestreo |
| Conjunto held-out limpio (loss) | 1,011 (paso 2500) | no disponible | Ronda 6; ronda 5: 1,326 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 64,5 GB, correspondiente a pesos de 27,36B parametros a 8 bits mas el sidecar MTP; la memoria unificada necesaria para cargar el modelo completo es del orden de esa cifra.
- GPU: el autor lo entreno, sirvio y evaluo en un unico Apple Silicon Mac Studio; no se documentan requisitos para A100, H100 ni RTX 4090.
- GPU de consumo: al ser un checkpoint MLX, esta pensado para memoria unificada de Apple Silicon; no se indica compatibilidad con GPUs NVIDIA de consumo.
- Despliegue: MLX con mlx-lm, LM Studio (ignora el sidecar MTP), y el fork Rapid-MLX de LeanZero o Elzi para aprovechar la decodificacion especulativa. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo afirma que la cabeza MTP habilita decodificacion especulativa en los motores que la soportan, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-Atlassian-Q8-mlx | 27,36B | no disponible | Forge, Jira, JSM, Confluence, Assets | apache-2.0 | MLX safetensors 8-bit + MTP |
| Qwen/Qwen3.8-27B (base) | 27,36B | no disponible | Proposito general | no disponible | bf16 |
| Alternativas especializadas en Atlassian | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el modelo base, con los resultados de la tabla de benchmarks. No se dispone de informacion sobre otros modelos de la misma categoria para establecer una comparativa adicional.

## Limitaciones y advertencias

- El modelo solo declara ingles; no se garantiza calidad en castellano ni en otros idiomas.
- La sonda de identificadores Atlassian cae al 15% frente al 23% del base en hechos posteriores a abril de 2026: el ajuste fino mejora el conocimiento historico pero degrada ligeramente el conocimiento reciente.
- El conocimiento esta acotado a las fuentes de entrenamiento (documentacion, especificaciones OpenAPI, hilos de comunidad y respuestas del autor); puede alucinar endpoints, scopes o componentes de UI Kit no presentes en esas fuentes.
- Los resultados de generacion de apps se midieron con thinking desactivado y con el motor Rapid-MLX; el rendimiento puede diferir en otros motores o con el modo thinking activado.
- El sidecar `mtp.safetensors` solo lo aprovechan motores compatibles con MTP; en mlx-lm y LM Studio se pierde la aceleracion por decodificacion especulativa.
- Un experimento DPO colapso el layout de ficheros generado (2 de 25 apps), lo que indica sensibilidad del ajuste a cambios de receta; la release v0.5 es una instantanea concreta de un proceso iterativo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene su propia licencia que conviene verificar antes de desplegar en produccion.
- El repositorio ocupa 64,5 GB, lo que limita el despliegue a equipos con memoria unificada o almacenamiento suficientes.
- No se documentan mitigaciones de sesgo ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q8-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Memoria tecnica del autor: https://leanzero.net/portfolio/atlassian-models
- LeanZero: https://leanzero.net
- CogniRunner: https://leanzero.net/portfolio/cognirunner
- Sentinel Vault: https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management: https://leanzero.net/portfolio/leanzero-management
- Servicios de migraciones Atlassian: https://leanzero.net/services/atlassian-migrations
- Motor Rapid-MLX (wheel): https://downloads.leanzero.net/engine/leanzero_engine-0.14.3%2Blz.29-py3-none-any.whl
