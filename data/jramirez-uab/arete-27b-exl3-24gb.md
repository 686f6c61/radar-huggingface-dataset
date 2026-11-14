# JRamirez-UAB/Arete-27B-EXL3-24GB

## Resumen

Arete-27B-EXL3-24GB es una cuantizacion EXL3 no oficial, de caracter comunitario, del modelo NousResearch/Arete-27B, un ajuste fino supervisado de Qwen3.8-27B desarrollado por Nous Research. La publica el usuario JRamirez-UAB y su proposito declarado es servir como motor local para un agente de administracion de sistemas Linux (opencode con tool calling) en castellano, dentro de un departamento de TI universitario. El checkpoint cuantiza el backbone a 3,85 bits por peso (3,866 medidos) con exllamav3 1.6.6, mantiene los embeddings en BF16 y aplica 5 bits al `lm_head`, 6 bits a la torre de vision y 4 bits a una cabeza MTP injertada.

La innovacion principal es doble. Por un lado, Arete se distribuye sin cabeza de prediccion multi-token (MTP), desactivada durante el ajuste fino; este repositorio anade una tomada sin modificar de Qwen3.8-27B (15 tensores `mtp.*`, cuantizados a 4 bits y no reentrenados) para habilitar decodificacion especulativa en vLLM. Por otro, el modelo se sirve mediante el plugin `vllm-quantpack`, ya que EXL3 no es un formato nativo de vLLM. El autor reporta una divergencia KL de 0,0107 frente a BF16 en la traza publica de turboderp y 60/60 llamadas a herramientas validas y correctas con la peticion real de opencode.

El modelo es relevante ahora porque demuestra que una cuantizacion agresiva (3,85 bpw) de un modelo de ~8.000 millones de parametros reales puede conservar capacidades de agente, vision y contexto largo con perdida medible pero acotada, y porque documenta de forma reproducible un stack de despliegue concreto (vLLM 0.33.0, torch 2.14.0+cu132, FlashInfer 0.7.2.post1) sobre GPUs Ampere. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con cabeza MTP injertada y torre de vision; cuantizacion EXL3 |
| Parametros totales | 7.946.737.024 (segun safetensors del repositorio) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; validados 65.536 por el autor |
| Tipos de cuantizacion | EXL3 3,85 bpw (backbone), 5 bits (`lm_head`), 6 bits (torre de vision), 4 bits (cabeza MTP), embeddings en BF16 |
| Idiomas soportados | Espanol (es), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3), dos shards con indice `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es NousResearch/Arete-27B, un ajuste fino supervisado de Qwen3.8-27B. Arete conserva la torre de vision original de Qwen (congelada durante el ajuste fino por Nous) y desactiva la cabeza MTP. Esta cuantizacion no reentrena pesos: aplica exllamav3 1.6.6 sobre el checkpoint de Arete y anade los 15 tensores `mtp.*` de Qwen3.8-27B sin modificar, cuantizados a 4 bits, con `mtp_num_hidden_layers: 1`. El conjunto de calibracion mezcla el set estandar de exllamav3 con sesiones reales de agente sysadmin en espanol y pasos de agente generados por el propio modelo.

La configuracion de cuantizacion se declara en `quantization_config.json` (`quant_method: exl3`, 3,85 bits) con asignacion por tensor. El procesador de imagenes se declara como `Qwen2VLImageProcessorFast`, ya que exllamav3 1.6.6 rechaza el `Qwen2VLImageProcessor` que declara Arete. La decodificacion especulativa se apoya en la cabeza MTP injertada, con una longitud media de aceptacion de 2,93 a 3,45 tokens por paso usando 3 tokens especulativos.

## Capacidades

- Generacion de texto conversacional en espanol e ingles.
- Razonamiento multi-paso con modo de razonamiento (`xhigh` en las pruebas del autor).
- Tool calling y function calling, con integracion verificada en opencode.
- Uso como agente de administracion de sistemas (ejecucion de comandos reales en Linux).
- Vision: interpretacion de capturas de terminal, graficos, salidas de stress-test y capturas de procesos y puertos.
- Capacidad de seguir turnos sobre una imagen cacheada.
- Contexto largo: sesiones de 65.536 tokens con KV cache en fp8 y 4 secuencias concurrentes sin preempcion reportada.
- Decodificacion especulativa mediante cabeza MTP.
- Plantilla de chat y tokenizador sin cambios respecto a Arete.

## Casos de uso

- Agente de administracion de sistemas Linux: el modelo puede interpretar el estado del sistema a partir de capturas de terminal y salidas de comandos, y emitir llamadas a herramientas para ejecutar acciones. Es el caso de uso declarado y validado por el autor, con 60/60 llamadas correctas en la peticion real de opencode.
- Diagnostico visual de incidencias: gracias a la torre de vision a 6 bits, puede analizar capturas de pantalla de procesos, puertos y salidas de stress-test para identificar anomalias sin necesidad de transcribir la salida a texto.
- Asistencia tecnica en castellano: el calibrado incluye trazas reales de sysadmin en espanol, lo que lo hace adecuado para conversaciones multi-turno con contexto de hasta 65.536 tokens en ese idioma.
- Automatizacion de tareas de mantenimiento con tool calling: integrado en pipelines que requieren invocar comandos o APIs de forma estructurada, con razonamiento previo y sin dejar llamadas a herramientas dentro del bloque de razonamiento.
- Despliegue local en hardware de gama profesional: con 14,78 GiB de pesos en memoria, encaja en GPUs de 24 GB (aunque el autor no lo ha medido) y esta validado en A40 de 48 GB, lo que permite entornos sin dependencia de la nube.
- Servicio de inferencia con vLLM: al soportar el plugin `vllm-quantpack`, puede desplegarse como endpoint compatible con la API de OpenAI para equipos que ya operan vLLM.
- Prototipado de agentes con contexto largo: sesiones de 65.536 tokens con KV cache en fp8 y concurrencia de 4 secuencias permiten mantener historiales extensos de interaccion sin preempcion.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor sobre este checkpoint, no benchmarks estandarizados de la comunidad.

| Metrica | Resultado |
|---|---|
| Divergencia KL vs BF16 (traza publica de turboderp) | 0,01069 (mediana 0,00042, p90 0,03216) |
| Divergencia KL vs BF16 (traza opencode) | 0,00945 |
| Divergencia KL vs BF16 (traza sysadmin propia) | 0,01294 |
| Perplejidad (publica) | 1,4461 vs 1,4322 BF16 |
| Perplejidad (opencode) | 2,7462 vs 2,7317 BF16 |
| Perplejidad (sysadmin propia) | 1,7081 vs 1,6852 BF16 |
| Tool calls con peticion real de opencode | 60/60 validas y 60/60 correctas (3 casos x 20 intentos, razonamiento `xhigh`, 4 peticiones concurrentes) |
| Vision | 15/15 comprobaciones en cuatro tareas de imagen |
| Aceptacion MTP | Longitud media 2,93 / 3,07 / 3,45 en las tres ultimas ventanas de 10 s; aceptacion por posicion 0,82/0,63/0,48 hasta 0,88/0,81/0,76 |
| Pesos | 15,9 GB decimales, 14,78 GiB en memoria de GPU |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandarizados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 14,78 GiB solo para pesos; el autor valido sesiones de 65.536 tokens con KV cache en fp8 y `--kv-cache-memory-bytes 12000000000` en una A40 de 48 GB.
- GPU validadas: NVIDIA A40 (48 GB, Ampere, sm86) para todas las pruebas de servicio; RTX PRO 6000 Server Edition (96 GB, Blackwell) solo para las mediciones de KLD.
- GPU de 24 GB: los pesos deberian caber (14,78 GiB), pero el autor no lo ha medido. El nombre del repositorio sugiere ese objetivo, sin validacion publicada.
- GPU de consumo: no se ha medido en ninguna; no hay datos de RTX 4090 ni similares.
- Despliegue: vLLM 0.33.0 con el plugin `vllm-quantpack` 0.1.5, torch 2.14.0+cu132, exllamav3 1.6.6 y FlashInfer 0.7.2.post1. EXL3 no es un formato nativo de vLLM; es necesario instalar el plugin.
- Latencia y throughput: no disponibles. Solo se reporta la aceptacion MTP y la ausencia de preempcion en el log del servidor con 4 secuencias concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| Arete-27B-EXL3-24GB (este) | 7.946.737.024 | 262.144 nativos; 65.536 validados | EXL3 3,85 bpw | Apache-2.0 | Publicado, validado en A40 48 GB |
| NousResearch/Arete-27B (base) | No disponible en la informacion | No disponible | BF16 | Apache-2.0 | Publicado por Nous Research |
| Qwen3.8-27B (origen de la cabeza MTP y del backbone) | No disponible en la informacion | No disponible | No disponible | No disponible en la informacion | Publicado por el equipo Qwen |

No se dispone de datos de rendimiento comparables de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa de benchmarks.

## Limitaciones y advertencias

- Cuantizacion no oficial: es una release comunitaria, no de Nous Research, Alibaba Cloud ni el equipo Qwen.
- Solo se ha validado un stack concreto (vLLM 0.33.0, torch 2.14.0+cu132, exllamav3 1.6.6, vllm-quantpack 0.1.5, FlashInfer 0.7.2.post1) sobre A40 de 48 GB. Otros entornos pueden no funcionar.
- El hardware de 24 GB que sugiere el nombre del repositorio no se ha medido; no hay garantia de que funcione en esa VRAM.
- La cabeza MTP no fue reentrenada sobre Arete: se tomo sin modificar de Qwen3.8-27B y se cuantizo a 4 bits, lo que puede afectar a la calidad de la decodificacion especulativa en dominios distintos al evaluado.
- El foco declarado es un unico caso de uso (agente sysadmin local en espanol); los numeros de otras areas o idiomas pueden diferir.
- Solo se validaron 65.536 tokens de contexto, aunque el modelo declara 262.144 nativos.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas en la informacion disponible.
- Idiomas: solo se declaran espanol e ingles.
- Licencia Apache-2.0 permite uso comercial, pero se hereda de los modelos base; conviene revisar `LICENSE` y `NOTICE` del repositorio.
- La model card esta truncada en la informacion proporcionada (corte en el listado de ficheros), por lo que pueden faltar secciones de instalacion y receta de cuantizacion completas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JRamirez-UAB/Arete-27B-EXL3-24GB
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- exllamav3: https://github.com/turboderp-org/exllamav3
- Plugin vllm-quantpack: https://pypi.org/project/vllm-quantpack/
- Referencia arXiv citada en los tags: arxiv:2406.11235
