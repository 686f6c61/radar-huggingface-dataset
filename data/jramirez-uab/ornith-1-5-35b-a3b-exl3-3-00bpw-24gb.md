# JRamirez-UAB/Ornith-1.5-35B-A3B-EXL3-3.00bpw-24GB

## Resumen

Ornith-1.5-35B-A3B-EXL3-3.00bpw-24GB es una cuantizacion EXL3 no oficial, publicada por el usuario JRamirez-UAB, del modelo ornith-ai/Ornith-1.5-35B-A3B, un MoE orientado a agentes con 35B parametros totales y 3B activos. La cuantizacion emplea exllamav3 1.6.5 con 3,00 bits por peso en los expertos enrutados, 4 bits en atencion, atencion linear y expertos compartidos, `lm_head` y torre de vision a 6 bits, cabeza MTP a 4 bits y embeddings de tokens en INT4. El resultado son 14,82 GB de pesos que caben en una unica RTX 3090 de 24 GB.

El objetivo declarado por el autor es un caso de uso muy concreto: un agente local de administracion de sistemas Linux (opencode con tool calling) para un departamento de TI universitario, usado en castellano. Frente a la variante EXL3 4.00 bpw del mismo autor, esta version sacrifica fidelidad (KLD de 0,0332 frente a 0,0145 en la traza de opencode) para liberar 4,1 GB de pesos que se dedican a cache KV, permitiendo mantener el contexto completo de 262.144 tokens con cache KV INT4 y atender a multiples sesiones concurrentes en una sola tarjeta.

La relevancia actual reside en la combinacion de contexto largo real (1,54 M de tokens de pool KV en modo multiusuario), soporte de vision, tool calling verificado con peticiones reales de opencode y licencia MIT heredada del modelo base. No es una publicacion oficial del equipo Ornith y solo se ha validado en la configuracion exacta que describe el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atencion linear, vision tower y cabeza MTP (familia qwen3_5_moe) |
| Parametros totales | 7.528.325.120 (segun safetensors del repo); el nombre comercial indica 35B-A3B |
| Parametros activos | 3B (indicado en el nombre del modelo) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | EXL3 3,00 bpw en expertos enrutados; 4 bits en atencion, atencion linear y expertos compartidos; 6 bits en `lm_head` y torre de vision; 4 bits en cabeza MTP; embeddings de tokens en INT4; cache KV INT4 (`int4_per_token_head`) |
| Idiomas soportados | es, en |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors EXL3 (2 shards, 14,82 GB) + `quantization_config.json` |

## Arquitectura y entrenamiento

El modelo base es un MoE de tipo transformer con atencion linear, torre de vision y cabeza de decodificacion especulativa MTP, identificado en los tags como `qwen3_5_moe`. Esta cuantizacion no reentrena el modelo: genera pesos EXL3 con exllamav3 1.6.5 aplicando un esquema mixto de bits por tensor (3,00 bpw en expertos enrutados, 4 bits en el resto de modulos principales, 6 bits en `lm_head` y vision, 4 bits en la cabeza MTP) y almacena los embeddings de tokens en INT4. El conjunto de calibracion incluye trazas de agente generadas por el propio modelo en BF16 sobre prompts de sysadmin del autor, ademas de datos de calibracion no publicos.

La innovacion practica de esta variante es la gestion de memoria: al reducir los pesos en 4,1 GB respecto a la version de 4,00 bpw, el espacio liberado se dedica a cache KV en INT4, alcanzando un pool de 1.543.326 tokens en modo texto sin MTP y 1.191.261 tokens con vision y MTP 3. El autor reporta divergencia KL frente a BF16 de 0,0332 en su propia traza de agente opencode y 0,0366 en la traza publica de turboderp. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre su pipeline de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional en castellano e ingles, con respuestas largas sin bucles reportados (0/30 a temperaturas 0,6, 0,8 y 1,0).
- Razonamiento multi-paso orientado a agentes: tareas de agente con ejecucion real de comandos puntuadas en 27/30 (10/10, 9/10, 8/10).
- Tool calling / function calling: 59/60 con la peticion real de opencode y 28/30 en la bateria del autor.
- Vision image-text-to-text: 15/15 en las pruebas de vision del autor con MTP 3.
- Recuperacion en contexto largo: 9/9 hechos neutros localizados a 64k, 128k y 255k tokens (prueba needle).
- Generacion de codigo: 36/36 en tareas de programacion (12/12 en tres rondas).
- Decodificacion especulativa mediante cabeza MTP (MTP 3 en modo un usuario).
- Soporte multiusuario: 16 agentes concurrentes completaron 28 de 32 tareas de sysadmin.
- Capacidad de servir con vLLM mediante el plugin `vllm-quantpack` y exllamav3.

## Casos de uso

- Agente de administracion de sistemas Linux: el escenario principal validado por el autor; el modelo ejecuta comandos reales con tool calling sobre opencode y mantiene contexto de 262.144 tokens, suficiente para arrastrar el historial completo de una sesion de diagnostico.
- Servidor compartido de agentes en una sola GPU: con `--max-num-seqs 16` y cache KV INT4, una RTX 3090 sostiene 6 sesiones concurrentes de 236k tokens sin preemption, lo que permite ofrecer un endpoint interno a varios desarrolladores con una unica tarjeta.
- Asistente de terminal con acceso a ficheros y ejecucion: la ventana de 262k permite cargar arboles de directorios, logs y configuraciones completas dentro del prompt sin truncar, y el tool calling verificado con peticiones reales reduce el riesgo de llamadas mal formadas.
- Analisis de imagenes tecnicas en soporte: la torre de vision a 6 bits permite adjuntar capturas de pantalla de errores, diagramas de red o salidas de terminal renderizadas y pedir diagnostico en castellano.
- Recuperacion documental sobre corpus largos: la prueba needle 9/9 a 255k tokens respalda su uso en preguntas sobre manuales internos, politicas o documentacion tecnica extensa empaquetada en el contexto.
- Generacion de codigo en pipelines internos: las 36/36 tareas de programacion y el soporte de tool calling permiten integrarlo en flujos de parcheo o generacion de scripts de automatizacion, siempre con validacion posterior.
- Evaluacion y prototipado de cuantizaciones: al publicar KLD sobre una traza publica de turboderp, sirve como referencia reproducible para comparar esquemas EXL3 en hardware de 24 GB.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia EXL3 4.00 bpw |
|---|---|---|
| KLD vs BF16 (traza opencode del autor) | 0,0332 | 0,0145 |
| KLD vs BF16 (traza publica de turboderp) | 0,0366 | 0,0168 |
| Tool calls con peticion real de opencode | 59/60 | no disponible |
| Tool calls en bateria del autor | 28/30 | no disponible |
| Tareas de agente | 27/30 (10/10, 9/10, 8/10) | no disponible |
| Tareas de programacion | 36/36 (12/12 x3) | no disponible |
| Needle a 64k / 128k / 255k | 9/9, 9/9, 9/9 | no disponible |
| Bucles en respuestas largas en castellano | 0/30 (temp. 0,6 / 0,8 / 1,0) | no disponible |
| Agentes concurrentes (4 / 8 / 16) | 7/8, 16/16, 28/32 tareas | no disponible |
| Vision con MTP 3 | 15/15 | no disponible |
| Decode 1 / 2 / 4 / 8 peticiones (sin MTP) | 93,7 / 142,6 / 240,9 / 379,3 tok/s | no disponible |
| Decode con vision y MTP 3, una peticion | 148-156 tok/s | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: 14,82 GB de pesos; en una RTX 3090 de 24 GB quedan aproximadamente 9 GB para cache KV INT4 y overhead, con 372 MiB libres en el pico medido en modo multiusuario.
- GPU validadas: unicamente RTX 3090 (24 GB, Ampere, limite de potencia 350 W, driver 595.84). El autor no ha probado otras GPU.
- GPU de 16 GB: no cabe, segun el propio autor (14,82 GB solo de pesos).
- Despliegue: vLLM 0.31.0 con exllamav3 1.6.5 y el plugin `vllm-quantpack` 0.1.3; un `pip install vllm` estandar, Transformers o SGLang no pueden cargar este checkpoint.
- Parametros de servicio medidos: `--max-model-len 262144`, `--kv-cache-dtype int4_per_token_head`, `--max-num-seqs 16` en modo multiusuario.
- Throughput: 93,7 tok/s con una peticion, 379,3 tok/s con ocho peticiones (sin MTP); 148-156 tok/s con vision y MTP 3 en una sola peticion.
- Pool KV: 1.543.326 tokens en texto sin MTP; 1.191.261 tokens con vision y MTP 3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD vs BF16 | Cache KV | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repo (EXL3 3.00 bpw) | 35B totales / 3B activos | 262.144 | 0,0332 (opencode) / 0,0366 (turboderp) | INT4, 1,54 M tokens | MIT | HuggingFace, requiere plugin |
| Ornith-1.5-35B-A3B-EXL3-4.00bpw-24GB | 35B totales / 3B activos | 262.144 con vision | 0,0145 / 0,0168 | FP8, 287.575 tokens | MIT | HuggingFace, mismo autor |
| Ornith-1.5-35B-A3B (BF16) | 35B totales / 3B activos | no disponible en la informacion | referencia | no aplica | MIT | HuggingFace, modelo base |

No se dispone de datos de benchmarks estandar ni de comparaciones con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion no oficial: no es una publicacion del equipo Ornith y solo se ha validado en la configuracion exacta del autor (RTX 3090, vLLM 0.31.0, exllamav3 1.6.5, vllm-quantpack 0.1.3); otros entornos pueden fallar al cargar el checkpoint.
- Mayor divergencia respecto a BF16 que la variante de 4,00 bpw (KLD aproximadamente el doble), lo que puede degradar tareas fuera del dominio de calibracion.
- La calibracion se centro en sysadmin y agente en castellano; el autor advierte que los numeros pueden diferir en otros dominios o idiomas.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de factualidad en la informacion disponible.
- Idiomas declarados: es y en; no hay evidencia de rendimiento en otras lenguas.
- No incluye el modelo BF16 de referencia ni los datos de calibracion, lo que limita la reproducibilidad completa del proceso.
- El plugin `vllm-quantpack` debe instalarse desde PyPI; sin el, el checkpoint es inutilizable con las herramientas estandar.
- En modo un usuario con vision y MTP 3, el pool KV baja a 1,19 M tokens y las 4 sesiones concurrentes de 262k indicadas por el autor no se probaron bajo carga.
- La licencia MIT permite uso comercial, pero al tratarse de una cuantizacion de comunidad conviene verificar la licencia y condiciones del modelo base antes de desplegarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JRamirez-UAB/Ornith-1.5-35B-A3B-EXL3-3.00bpw-24GB
- Variante EXL3 4.00 bpw: https://huggingface.co/JRamirez-UAB/Ornith-1.5-35B-A3B-EXL3-4.00bpw-24GB
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- exllamav3: https://github.com/turboderp-org/exllamav3
- Paper de referencia citado en los tags: arxiv:2406.11235
