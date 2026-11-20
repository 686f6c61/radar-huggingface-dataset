# gbuzhf/Ornith-1.5-35B-A3B-TIEL-Calibrated-MTPv2-ICE-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de arquitectura mixta transformer-MoE desarrollado por ornith-ai. Esta ficha corresponde a una cuantizacion GGUF publicada por el usuario gbuzhf bajo la tecnica ICE (Importance-aware Calibration for Experts), que parte del modelo base original en BF16 y genera cuatro niveles de compresion calibrados con la matriz de importancia de Tiel. El modelo integra la cabeza MTPv2 (Multi-Token Prediction) del autor original, lo que permite decodificacion autoespeculativa sin necesidad de un modelo drafter separado.

Con 35.505.251.456 parametros totales y arquitectura de mezcla de expertos (MoE), el modelo activa solo una fraccion de sus parametros por token, lo que lo situa en la categoria de modelos de alta capacidad con coste de inferencia contenido. La cuantizacion ICE aplica una politica diferenciada por tipo de tensor: el router MoE y los terminos de decaimiento SSM se mantienen en F32, las claves y valores de atencion en F16, y el resto del presupuesto se asigna a los 256 expertos.

La relevancia actual de esta publicacion radica en su metodologia de cuantizacion: los cuatro tiers (19G, 21G, 23G y 25G) se presentan como Pareto-optimos frente a las escaleras de Unsloth Dynamic y APEX en el rango de 19 a 23 GB, con divergencia KL medida contra el maestro BF16. La licencia MIT facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixtura de expertos (MoE) con componentes SSM y atencion; transformer hibrido |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (el modelo base es A3B, pero no se detalla el numero exacto de parametros activos) |
| Longitud de contexto | no disponible (el harness de evaluacion usa n_ctx 2048, pero no se especifica el contexto nativo) |
| Tipos de cuantizacion | GGUF ICE en cuatro tiers: 19G (4.240 bpw), 21G (4.695 bpw), 23G (5.143 bpw), 25G (5.597 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (un unico archivo por tier, 753 tensores, block_count=41) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura hibrida que combina capas de mezcla de expertos con componentes de espacio de estados (SSM) y atencion. La cabeza MTPv2 (Multi-Token Prediction) esta entrenada por ornith-ai e integrada en los GGUF, lo que habilita decodificacion autoespeculativa mediante el flag `--spec-type draft-mtp` en llama.cpp, sin necesidad de un modelo borrador auxiliar. El modelo cuenta con 256 expertos y un router MoE cuya salida determina que expertos se activan por token.

La cuantizacion ICE, desarrollada por gbuzhf, clasifica los tensores segun la distancia que recorre el error de cuantizacion. Los tensores discretos (router MoE) y recurrentes (decaimiento SSM y terminos de timestep) se mantienen en F32 porque un error en ellos cambia categoricamente el comportamiento del modelo o se propaga a lo largo de la secuencia. Los tensores cacheados (`attn_k`, `attn_v`) se fijan en F16 porque se escriben una vez en la KV cache y se releen en cada token posterior. El resto del presupuesto, incluidos los 256 expertos, se asigna de forma uniforme a `gate`/`up`/`down`, colocando los tipos superiores primero en las capas mas superficiales. Las tres primeras clases representan solo el 0,14 % del modelo (47 M parametros, 0,15 GB). La calibracion se realizo con la matriz de importancia de Tiel y la evaluacion de divergencia KL contra el maestro BF16 usa WikiText-2 raw test con 64 chunks y n_ctx 2048.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y `text-generation`.
- Decodificacion autoespeculativa mediante la cabeza MTPv2 embebida, que acelera la generacion en llama.cpp con `--spec-type draft-mtp`.
- Soporte de plantilla de chat Qwen-Sharp v22.4.1 por defecto, con opcion de plantilla arrow4.0 para entornos de agentes.
- Capacidades de agente y uso de herramientas a traves de la plantilla arrow4.0, que anade reglas de agente, notas por resultado de herramienta, linea STATUS, memoria de proyecto `.arrow` y reporte de retorno cuando el trabajo se bloquea.
- Razonamiento multi-paso en el contexto de la capa de agente arrow4.0.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU consumer: el tier 19G-ICE (18,82 GB) permite ejecutar el modelo en GPUs con 24 GB de VRAM, como la RTX 4090, manteniendo una divergencia KL de 0,0601 frente al BF16.
- Servicio de chat conversacional en produccion: el tier 23G-ICE ofrece el mejor equilibrio calidad/tamano (KLD 0,0325, 22,83 GB) y supera a UD-Q4_K_XL tanto en cercania al BF16 como en tamano, lo que lo hace adecuado para endpoints de atencion al cliente con llama.cpp o servidores compatibles.
- Agentes autonomos con uso de herramientas: la plantilla arrow4.0 y la memoria de proyecto `.arrow` permiten construir asistentes que ejecutan tareas multi-paso, mantienen estado entre invocaciones y reportan bloqueos de forma estructurada.
- Generacion de codigo asistida en pipelines de CI/CD: el modelo puede integrarse en flujos de revision o generacion de parches mediante tool calling, con la ventaja de que el tier 21G-ICE ocupa 20,84 GB y cabe en GPUs de 24 GB.
- Inferencia de baja latencia con decodificacion especulativa: la cabeza MTPv2 embebida permite acelerar la generacion sin cargar un modelo drafter adicional, reduciendo el consumo de VRAM total del sistema.
- Evaluacion e investigacion de tecnicas de cuantizacion: los cuatro tiers con metricas KLD, PPL ratio y same top-1 publicadas sirven como referencia reproducible para comparar politicas de cuantizacion en modelos MoE.
- Prototipado en entornos con VRAM limitada: el tier 19G-ICE cabe en GPUs de 24 GB con margen para contexto y KV cache, lo que permite experimentar con el modelo completo sin infraestructura de datacenter.

## Benchmarks y rendimiento

Metricas de cuantizacion publicadas por el autor. Divergencia KL contra el maestro BF16, WikiText-2 raw test, 64 chunks, n_ctx 2048. Mean PPL(base) = 7,494953 ± 0,079236. El score "overall" es el compuesto `0,70/(1+meanKLD) + 0,30*sameTop1` con BF16 = 100.

| Tier | Tamano | Mean KLD | KLD 99% | KLD 99,9% | PPL ratio | Same top-1 | bpw activo | bpw archivo | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 25G-ICE | 24,84 GB | 0,0284 | 0,286 | 1,120 | 0,9851 | 93,44% | 7,686 | 5,597 | 96,1 |
| 23G-ICE | 22,83 GB | 0,0325 | 0,335 | 1,177 | 0,9900 | 92,85% | 7,523 | 5,143 | 95,7 |
| 21G-ICE | 20,84 GB | 0,0389 | 0,419 | 1,584 | 1,0001 | 92,24% | 7,357 | 4,695 | 95,1 |
| 19G-ICE | 18,82 GB | 0,0601 | 0,616 | 2,387 | 1,0013 | 90,33% | 7,192 | 4,240 | 93,1 |

Comparaciones declaradas por el autor frente a otras escaleras de cuantizacion:

| Comparacion | Resultado |
|---|---|
| 23G-ICE vs UD-Q4_K_XL | 14,5 % mas cerca del BF16 y 0,37 GB mas pequeno |
| 25G-ICE vs APEX-I-Balanced (26,28 GB / 0,0345) | 12 % mejor KLD y 1,4 GB mas pequeno |
| 25G-ICE vs UD-Q5_K_S (25,83 GB) | UD-Q5_K_S es mas fuerte por encima de 25 GB |
| 21G-ICE vs UD-Q4_K_XL (0,0380) | Calidad esencialmente equivalente con 2,36 GB menos |
| 19G-ICE vs UD-IQ4_XS (0,0723) | 17 % mas cerca del BF16 por 0,14 GB adicionales |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 18,82 GB y 24,84 GB segun el tier (19G a 25G), mas el espacio para KV cache y contexto.
- GPUs recomendadas: RTX 4090 (24 GB) para los tiers 19G, 21G y 23G; A100 40/80 GB, H100 o RTX 6000 Ada para el tier 25G con contexto amplio.
- Cabe en GPU consumer: si, los tiers 19G y 21G caben en GPUs de 24 GB; el tier 23G requiere gestion cuidadosa de contexto y KV cache.
- Opciones de despliegue: llama.cpp (referencia del autor, con soporte de `--spec-type draft-mtp`), llama-server con `--jinja` y plantilla de chat, endpoints compatibles con la API de Hugging Face.
- Latencia y throughput: no disponibles. La decodificacion especulativa con MTPv2 puede reducir la latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (23G-ICE) | 35,5 B totales (MoE) | no disponible | MIT | GGUF | KLD 0,0325, 22,83 GB |
| Ornith-1.5-35B-A3B (UD-Q4_K_XL) | 35,5 B totales (MoE) | no disponible | MIT | GGUF | KLD 0,0380, 23,20 GB aprox. |
| Ornith-1.5-35B-A3B (UD-Q5_K_S) | 35,5 B totales (MoE) | no disponible | MIT | GGUF | 25,83 GB, mas fuerte por encima de 25 GB |
| Ornith-1.5-35B-A3B (APEX-I-Balanced) | 35,5 B totales (MoE) | no disponible | MIT | GGUF | KLD 0,0345, 26,28 GB |

Las comparaciones se limitan a variantes de cuantizacion del mismo modelo base. No se dispone de datos de modelos de otros autores con los que comparar parametros activos, contexto o rendimiento en tareas.

## Limitaciones y advertencias

- Los benchmarks publicados son exclusivamente de fidelidad de cuantizacion (KLD, PPL, same top-1); no hay evaluaciones de tareas que permitan inferir calidad en razonamiento, codigo o matematicas.
- El modelo base es de tipo MoE con 256 expertos; el comportamiento del router en dominios fuera de la distribucion de calibracion puede degradarse de forma no capturada por la metrica KLD.
- La plantilla de chat por defecto es Qwen-Sharp v22.4.1; la plantilla arrow4.0 para agentes es opcional y debe cargarse explicitamente con `--chat-template-file`.
- La licencia MIT permite uso comercial, pero el modelo base y la cabeza MTPv2 provienen de ornith-ai; conviene verificar la licencia del modelo base original.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos de este modelo.
- El tier 19G-ICE presenta un KLD 99,9% de 2,387, mas del doble que el tier 23G, lo que indica mayor riesgo de degradacion en casos extremos.
- La ventana de contexto nativa no esta documentada; el harness de evaluacion usa 2048 tokens, insuficiente para confirmar comportamiento en contextos largos.
- El repositorio ocupa 87,4 GB, por lo que la descarga de todos los tiers requiere espacio considerable en disco.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-TIEL-Calibrated-MTPv2-ICE-GGUF
- Informe completo de cuantizacion ICE: https://huggingface.co/gbuzhf/ICE-quantization
- Plantillas de chat Qwen-Sharp-Arrow: https://huggingface.co/gbuzhf/Qwen-Sharp-Arrow-Chat-Templates
- Modelo base: ornith-ai/Ornith-1.5-35B-A3B (no se proporciona URL directa en la informacion disponible)
