# sachk0/Qwen3.8-Flash-Next-T3a392-Ampere-SM80-46GiB-GPU-Weights

## Resumen

Qwen3.8-Flash-Next-T3a392-Ampere-SM80-46GiB-GPU-Weights es una cuantizacion mixta de 2/3/4 bits en formato trellis (ring-coded) de los expertos enrutados del modelo Qwen3.8-Flash-Next, publicado por el usuario sachk0 sobre los pesos FP8 originales de Qwen y una base AutoRound de 3 bpw con MTP. El artefacto conserva los 512 expertos por capa y empaqueta los expertos en unos 39,2 GiB, con un total de pesos cargados en GPU medido en aproximadamente 46,16 GiB. No es un formato estandar (no es GPTQ, GGUF ni AWQ) y no funciona con `transformers.from_pretrained` ni con vLLM de serie: requiere un parche PLE-SSD, un cargador trellis y kernels CUDA propios.

El modelo resuelve un problema muy concreto de ingenieria: servir un modelo de gran tamano con arquitectura Mixture-of-Experts en GPUs Ampere SM80 (GA100) de 64 GiB, manteniendo el shard PLE en BF16 sobre SSD en lugar de en memoria. La validacion se ha hecho sobre una NVIDIA CMP 170HX (74 SM, 64 GiB HBM), una configuracion de hardware no estandar. El contexto maximo nativo por peticion es de 262.144 tokens, mientras que la capacidad de KV agrupada entre peticiones alcanza 906.051 tokens.

Es relevante para equipos que necesiten desplegar modelos de la familia Qwen3.8-Flash-Next en infraestructura Ampere antigua o de gama alta de segunda mano, aceptando un formato propietario y una licencia Qwen Community 1.0 con restricciones para uso comercial como servicio. La calidad se ha medido como divergencia KL contra un profesor FP32, no como exactitud en tareas, y las cifras de rendimiento no son extrapolables a otras GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con expertos enrutados cuantizados en trellis; mantiene 512 expertos por capa; base Qwen3.8-Flash-Next con PLE (probablemente "parallel layer experts" o shard PLE en BF16 sobre SSD) y MTP (multi-token prediction) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE, pero el numero de parametros activos no se especifica) |
| Longitud de contexto | 262.144 tokens por peticion (maximo nativo); 906.051 tokens de capacidad KV agrupada entre peticiones |
| Tipos de cuantizacion | Trellis mixta 2/3/4 bits en expertos enrutados; pesos densos y PLE en BF16 / AutoRound 3 bpw segun la base |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (no Apache-2.0 ni MIT) |
| Formato de pesos | Trellis propietario (no GPTQ, GGUF ni AWQ); requiere cargador y kernels CUDA especificos; shard PLE en BF16 (~102,4 GB decimal) sobre SSD |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next-FP8 (commit `236dfdf285828023ca3bcd3f37366c58a3469b13`) y de la base densa/PLE klee100/Qwen3.8-Flash-Next-AutoRound-3bpw-MTP (commit `ce0e0b94083895bd836b916f29bf105c40a8162a`). La arquitectura subyacente es un transformer Mixture-of-Experts con 512 expertos enrutados por capa. La intervencion del autor consiste en una cuantizacion trellis con codificacion en anillo (ring-coded) de 2/3/4 bits aplicada exclusivamente a los expertos enrutados, mientras que los pesos densos y el shard PLE se mantienen en BF16 o en la base AutoRound de 3 bpw. El shard PLE, de aproximadamente 102,4 GB decimales, reside en SSD y no en memoria de GPU.

No se detalla la composicion del dataset de entrenamiento original ni si hubo RLHF o DPO; esa informacion pertenece a la model card de Qwen y no se reproduce aqui. La innovacion tecnica del artefacto es el formato trellis con kernels CUDA especificos para Ampere SM80 (GA100), un cargador propio y un parche PLE-SSD sobre vLLM (revision `a5a30471ff2bb7f0824f2da10e358af98d304472`). Se emplea decodificacion especulativa con MTP de profundidad 3 y un vocabulario de borrador de 65.536 tokens. El autor advierte que la arquitectura de kernel validada es Ampere SM80 (GA100), no Ada, y que otras GPUs no estan verificadas.

## Capacidades

- Generacion de texto autoregresiva con contexto nativo de hasta 262.144 tokens por peticion.
- Razonamiento multi-turno y conversaciones largas: la capacidad KV agrupada de 906.051 tokens permite atender varias sesiones concurrentes con contextos extensos.
- Decodificacion especulativa con MTP de profundidad 3 y vocabulario de borrador de 65.536 tokens, orientada a reducir latencia por paso.
- Capacidades multilingues: la evaluacion KL incluye un dominio "Multilingual" con divergencia 0,0365, lo que indica preservacion de la distribucion multilingue del profesor FP32, aunque no se enumeran los idiomas concretos.
- Dominios especializados evaluados: medico (KL 0,0312), legal (KL 0,0271) y Nemotron (KL 0,0391), lo que sugiere un comportamiento estable en estos ambitos respecto al modelo fuente.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat de contexto largo en GPUs Ampere de 64 GiB: el modelo permite mantener conversaciones de hasta 262.144 tokens por peticion y varias sesiones concurrentes gracias a los 906.051 tokens de KV agrupada, adecuado para asistentes documentales o analisis de contratos extensos.
- Analisis de documentos legales: la divergencia KL de 0,0271 en el dominio legal indica que la cuantizacion preserva la distribucion del profesor en este ambito, lo que lo hace apto para resumen y extraccion de clausulas en bufetes con infraestructura on-premise.
- Procesamiento de historiales clinicos: con KL de 0,0312 en dominio medico y contexto largo, puede emplearse para resumir informes y responder preguntas sobre historiales, siempre con supervision humana y verificacion posterior.
- Replay de produccion y evaluacion de modelos: el autor publica pares de replay baseline/candidate en `benchmarks.json`, lo que permite reproducir la comparacion de calidad y latencia en entornos propios antes de adoptar el artefacto.
- Despliegue en infraestructura de segunda mano: la validacion sobre NVIDIA CMP 170HX (74 SM GA100, 64 GiB HBM) demuestra que el modelo puede servirse en GPUs Ampere no estandar, util para laboratorios con presupuesto limitado que acepten configuracion no soportada oficialmente.
- Investigacion sobre cuantizacion trellis: el artefacto sirve como referencia reproducible para estudiar el impacto de la cuantizacion 2/3/4 bits en expertos enrutados, con metricas KL por dominio y datos de memoria y latencia.
- Evaluacion de decodificacion especulativa con MTP: los datos de throughput por stream (189,25 tok/s en un stream, 383,04 tok/s en cuatro) permiten comparar configuraciones de MTP y ajustar la profundidad del borrador en funcion del caso de uso.

## Benchmarks y rendimiento

Rendimiento medido en NVIDIA CMP 170HX (74 SM GA100, 64 GiB HBM), replay de produccion del 2026-11-09, 72 rondas de un stream y 36 de cuatro streams, 400 tokens generados, temperatura 1, top-k 20, top-p 0,95, MTP profundidad 3:

| Ejecucion | Un stream (tok/s) | Un stream (ms/paso) | Cuatro streams (tok/s total) | Cuatro streams (ms/paso) |
|---|---:|---:|---:|---:|
| 1 | 189,25 | 14,413 | 383,04 | 28,280 |
| 2 | 185,27 | 14,429 | 375,48 | 28,139 |

Prefill en un stream: 3.238–3.265 tok/s.

Calidad medida como divergencia KL teacher-forced contra un profesor FP32 (menor es mejor; no es exactitud en tareas):

| Dominio | Referencia antes de la actualizacion de memoria | Configuracion de servicio publicada |
|---|---:|---:|
| Replay propio/privado | 0,0919 | 0,0924 |
| Nemotron | 0,0391 | 0,0391 |
| Multilingue | 0,0366 | 0,0365 |
| Medico | 0,0305 | 0,0312 |
| Legal | 0,0273 | 0,0271 |

Los cambios absolutos son como maximo de 0,0007, dentro del ruido de ejecucion registrado. El autor indica que esto no demuestra ausencia de perdida frente al modelo fuente. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 46,16 GiB de pesos cargados en GPU, mas 14,6 GiB de pool KV, grafos, workspace y overhead de runtime; el autor indica que se requiere una GPU de clase 64 GiB.
- GPU recomendadas: NVIDIA CMP 170HX (74 SM GA100, 64 GiB HBM) es la unica configuracion validada; arquitectura de kernel Ampere SM80 (GA100), no Ada. Otras GPUs no estan verificadas.
- Cabe en consumer GPU: no, segun la informacion disponible; requiere 64 GiB de VRAM y arquitectura Ampere SM80.
- Almacenamiento: descarga total de aproximadamente 155 GB decimales (~144 GiB), incluido el shard PLE de ~102,4 GB decimal; se recomienda SSD local rapido con espacio libre suficiente.
- Opciones de despliegue: vLLM con revision fijada `a5a30471ff2bb7f0824f2da10e358af98d304472`, parche PLE-SSD, cargador trellis y kernels CUDA propios. No compatible con `transformers.from_pretrained`, llama.cpp, Ollama ni TGI. El repositorio complementario (Nix/codigo) es https://github.com/sachk/qwen-flash-trellis, actualmente privado mientras se valida el empaquetado.
- Latencia y throughput medidos: 14,4 ms/paso en un stream y 28,1–28,3 ms/paso en cuatro streams; prefill de 3.238–3.265 tok/s. Los objetivos de 250 tok/s en un stream y 500 tok/s en cuatro streams no se alcanzaron.
- Requisitos de software: driver NVIDIA adecuado para CUDA 13 y el runtime complementario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-T3a392 (este) | no disponible (MoE, 512 expertos/capa) | 262.144 tokens por peticion; 906.051 KV agrupada | Trellis 2/3/4 bits + BF16 PLE | Qwen Community 1.0 | Hugging Face, requiere runtime propio |
| Qwen/Qwen3.8-Flash-Next-FP8 | no disponible | no disponible | FP8 | Qwen Community 1.0 | Hugging Face |
| klee100/Qwen3.8-Flash-Next-AutoRound-3bpw-MTP | no disponible | no disponible | AutoRound 3 bpw con MTP | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de contexto de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Formato propietario: no es GPTQ, GGUF ni AWQ; no funciona con `transformers.from_pretrained`, inferencia alojada en Hugging Face, llama.cpp, Ollama ni TGI. Requiere parche PLE-SSD, cargador trellis y kernels CUDA especificos.
- Hardware validado unico: Ampere SM80 (GA100), en concreto NVIDIA CMP 170HX; no se ha verificado en Ada ni en otras GPUs. El autor advierte que las cifras no son extrapolables.
- Requisito real de VRAM: 46 GiB corresponde solo a pesos; el total con pool KV, grafos y overhead asciende a una GPU de clase 64 GiB. El shard PLE de ~102,4 GB decimal reside en SSD, no en GPU.
- Descarga de ~155 GB decimales (~144 GiB): requiere almacenamiento local rapido y suficiente espacio libre.
- Calidad medida como divergencia KL, no como exactitud en tareas ni preferencia ciega; no se demuestra ausencia de perdida frente al modelo fuente.
- El test de estres de memoria (dos contextos de 250k tokens y ocho streams cortos, pico de 64.710 MiB) es una prueba de memoria y ciclo de vida, no de calidad en contexto largo.
- Objetivos de rendimiento no alcanzados: 250 tok/s en un stream y 500 tok/s en cuatro streams no se consiguieron.
- Licencia Qwen Community 1.0: no es Apache-2.0 ni MIT; los negocios de Model-as-a-Service y AI Work Assistant tienen requisitos adicionales. Es obligatorio conservar los avisos de origen.
- La calibracion incluyo trafico privado; las conversaciones, tokens, trazas, credenciales e identificadores de sesion no se distribuyen. Una recalibracion solo con datos publicos reproduce el procedimiento, no las estadisticas exactas ni los bytes del checkpoint.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Idiomas concretos soportados: no disponible; solo se reporta una metrica KL agregada para el dominio multilingue.
- El repositorio complementario de runtime esta actualmente privado, lo que limita la reproducibilidad por terceros hasta su publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sachk0/Qwen3.8-Flash-Next-T3a392-Ampere-SM80-46GiB-GPU-Weights
- Modelo base FP8: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8 (commit `236dfdf285828023ca3bcd3f37366c58a3469b13`)
- Modelo base AutoRound 3bpw MTP: https://huggingface.co/klee100/Qwen3.8-Flash-Next-AutoRound-3bpw-MTP (commit `ce0e0b94083895bd836b916f29bf105c40a8162a`)
- Repositorio complementario de runtime (Nix/codigo, actualmente privado): https://github.com/sachk/qwen-flash-trellis
- Revision de vLLM utilizada: `a5a30471ff2bb7f0824f2da10e358af98d304472`
- Ficheros de referencia del artefacto: `inventory.json`, `benchmarks.json`, `LICENSE`
