# benthecarman/Qwen3.8-27B-BTC-Script-RL

## Resumen

Qwen3.8-27B-BTC-Script-RL es un adaptador LoRA publicado por el desarrollador independiente benthecarman sobre el modelo base Qwen/Qwen3.8-27B. Su objetivo es especializar el modelo en Bitcoin Script: escribir scripts a partir de una politica de gasto descrita en ingles, reducir el tamano de scripts existentes, identificar el protocolo al que pertenece un script (HTLC, multisig, vault, etc.) y disenar arboles de scripts Taproot. El adaptador se entrena exclusivamente con aprendizaje por refuerzo (GRPO) contra evaluadores automaticos que validan las respuestas con rust-miniscript y Bitcoin Core, sin etapa de ajuste supervisado.

La relevancia del modelo es doble. Por un lado, demuestra que el RL con verificadores deterministas permite mejorar capacidades muy tecnicas y verificables en un modelo de 27B sin datos etiquetados. Por otro, es un ejemplo de entrenamiento realizado integramente en hardware local: una RTX 5090 para muestreo y un DGX Spark para el entrenamiento, sin GPUs alquiladas en la nube.

El adaptador tiene rango 32, se distribuye como pesos PEFT en safetensors (0,9 GB) y se evalua sobre el checkpoint cuantizado NVFP4 del modelo base servido con vLLM. En un conjunto de 246 tareas pasa de 0,262 del modelo base a 0,401, una mejora absoluta de 0,139 puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.8-27B (con proyecciones Gated DeltaNet y atencion) |
| Parametros totales | No disponible (el adaptador ocupa 0,9 GB en safetensors; el modelo base es de 27B) |
| Parametros activos | No disponible (el modelo base no se documenta como MoE en la informacion disponible) |
| Longitud de contexto | No disponible de forma explicita; las respuestas evaluadas alcanzaron mas de 100k tokens, y el entrenamiento uso un limite de 32k tokens en las primeras 24 iteraciones |
| Tipos de cuantizacion | El adaptador se distribuye en fp32; se evalua sobre el checkpoint NVFP4 del modelo base |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); fusionable con `merge_and_unload()` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 con pesos en fp32. Los modulos objetivo son las proyecciones de Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`), las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y el MLP (`gate_proj`, `up_proj`, `down_proj`). Los modulos de vision y MTP quedan excluidos. El modelo base Qwen3.8-27B combina atencion con capas Gated DeltaNet, segun se deduce de los modulos entrenados.

El entrenamiento usa GRPO con 8 prompts y 8 muestras por paso, tasa de aprendizaje 1e-4 y 40 pasos. Las ventajas se centran en la media del grupo sin normalizacion por desviacion tipica, y se descartan los grupos en los que todas las muestras obtienen la misma puntuacion. Emplea REINFORCE con importance sampling truncado (cap 2) y sin termino KL. Las muestras de entrenamiento las genera el propio modelo base NVFP4 con el adaptador cargado en vLLM, y el entrenamiento se ejecuta en bf16. Las primeras 24 iteraciones limitan las muestras a 32.768 tokens; las 16 restantes no tienen limite. El checkpoint publicado corresponde al paso 28, seleccionado por obtener la mejor puntuacion en un conjunto de validacion separado de 80 tareas (0,491 frente a 0,314 del base).

El pipeline de entrenamiento se ejecuto en dos maquinas locales: una RTX 5090 (32 GB, limitada a 400 W) para el muestreo con vLLM y un DGX Spark (GB10, 128 GB de memoria unificada, reloj fijado a 1.700 MHz) para el entrenamiento. Los 40 pasos supusieron unos 6,5 dias de reloj de pared; el checkpoint del paso 28 estuvo listo en unos 3,7 dias.

## Capacidades

- Generacion de Bitcoin Script a partir de una politica de gasto descrita en lenguaje natural.
- Optimizacion de scripts: reduccion del tamano de un script funcional manteniendo su comportamiento.
- Identificacion de protocolos Bitcoin a partir de un script (HTLC, multisig, vault y otros).
- Diseno de salidas Taproot: clave interna y arbol de scripts.
- Generacion de scripts a partir de contratos de gasto completos con ejemplos.
- Modo de razonamiento extendido (thinking): las respuestas medianas rondan los 24k tokens y algunas superan los 100k.
- No se ha evaluado en conversacion general ni en otras preguntas sobre Bitcoin distintas de las tareas de entrenamiento.
- No se documenta soporte de tool calling, agentes ni capacidades multimodales en el adaptador (los modulos de vision estan excluidos del entrenamiento).

## Casos de uso

- Generacion de scripts para politicas de gasto: dado un contrato en ingles ("2 de 3 multisig con timelock de 144 bloques"), el modelo produce un script candidato que despues se valida con rust-miniscript o Bitcoin Core. Adecuado por su entrenamiento especifico en esta tarea, aunque la validacion externa es obligatoria.
- Optimizacion de scripts en produccion: reducir el peso de scripts existentes para disminuir comisiones de gasto, usando el modelo como primer paso y verificando la equivalencia funcional con herramientas reales.
- Auditoria y clasificacion de scripts: identificar el protocolo al que pertenece un script desconocido (HTLC, vault, multisig) en herramientas de exploracion o analisis de transacciones.
- Diseno de arboles Taproot: proponer una clave interna y una estructura de scripts para una salida Taproot, util en wallets y en el diseno de contratos on-chain.
- Asistencia en el desarrollo de contratos Bitcoin: generar borradores a partir de especificaciones con ejemplos, que el desarrollador revisa y prueba en regtest antes de desplegar.
- Formacion y prototipado: explorar variantes de scripts y comparar enfoques en entornos de prueba, aprovechando el modo de razonamiento extendido para analizar compromisos entre tamano, seguridad y flexibilidad.
- Investigacion en RL verificable: servir como referencia de como aplicar GRPO con verificadores deterministas (rust-miniscript, Bitcoin Core) a un dominio tecnico con recompensas objetivas.

## Benchmarks y rendimiento

Resultados sobre 246 tareas, un intento por tarea, sin limite de tokens de salida, con temperatura 1,0, top-p 0,95, top-k 20 y thinking activado. Modelo base y adaptador usan el mismo checkpoint cuantizado, los mismos ajustes de muestreo y la misma semilla.

| Tarea | Descripcion | n | Base | LoRA |
|---|---|---:|---:|---:|
| Write | Escribir un script para una politica de gasto en ingles | 48 | 0,104 | 0,250 |
| Optimize | Reducir un script funcional | 48 | 0,052 | 0,208 |
| Identify | Nombrar el protocolo de un script | 52 | 0,538 | 0,596 |
| Taproot tree | Disenar una salida Taproot | 50 | 0,440 | 0,695 |
| Contract | Escribir un script desde un contrato con ejemplos | 48 | 0,146 | 0,229 |
| **Global** | | 246 | **0,262** | **0,401** |

Mejora absoluta global: +0,139 (IC 95% [+0,086, +0,195]). El adaptador genero 7,5M tokens de salida frente a 12,3M del base.

Referencia de otros modelos en el mismo conjunto de prueba: GLM 5.3 Flash 0,559; GLM 5.3 0,687; Claude Sonnet 5.5 0,893; Claude Opus 5.5 0,971.

Validacion en 80 tareas separadas por checkpoint:

| Checkpoint | Puntuacion | Respuesta mediana |
|---|---:|---:|
| base | 0,314 | 17k tokens |
| step 18 | 0,399 | 21k |
| **step 28** | **0,491** | 24k |
| step 38 | 0,429 | 43k |
| step 40 | 0,434 | 49k |

## Requisitos de hardware

- VRAM para inferencia: el adaptador anade 0,9 GB sobre el modelo base. Con el checkpoint NVFP4 de 27B en vLLM, el conjunto cabe en una RTX 5090 de 32 GB, configuracion usada por el autor durante el entrenamiento.
- GPU recomendadas: RTX 5090 (32 GB) para NVFP4 con vLLM; A100 80 GB o H100 para bf16 sin cuantizar.
- Cabe en GPU de consumo: si, en RTX 5090 con cuantizacion NVFP4. En GPUs de 24 GB no hay datos publicados; seria necesario cuantizar mas agresivamente.
- Despliegue: vLLM 0.27.1 con `--enable-lora --max-lora-rank 32`; tambien Transformers + PEFT con `PeftModel.from_pretrained` y `merge_and_unload()` para pesos independientes.
- Latencia y throughput: no disponibles de forma directa. Como referencia de coste, la respuesta mediana en el conjunto de prueba fue de unos 24k tokens, con casos por encima de 100k, por lo que la latencia por consulta es alta y conviene fijar `max_tokens` con cuidado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion en el test de 246 tareas | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Qwen3.8-27B + este LoRA | 27B + adaptador | No disponible (respuestas >100k) | 0,401 | Apache 2.0 | Hugging Face (PEFT) |
| Qwen3.8-27B (base) | 27B | No disponible | 0,262 | Apache 2.0 | Hugging Face |
| GLM 5.3 Flash | No disponible | No disponible | 0,559 | No disponible | No disponible en la informacion |
| GLM 5.3 | No disponible | No disponible | 0,687 | No disponible | No disponible en la informacion |
| Claude Sonnet 5.5 | No disponible | No disponible | 0,893 | Propietaria | API |
| Claude Opus 5.5 | No disponible | No disponible | 0,971 | Propietaria | API |

La comparacion es solo sobre el conjunto de prueba especifico de Bitcoin Script del autor; no implica un rendimiento equivalente en tareas generales.

## Limitaciones y advertencias

- Un solo intento por tarea de prueba: la mejora global es clara, pero las ganancias en Identify y Contract quedan dentro del ruido estadistico.
- La mayor parte del entrenamiento (pasos 1-24) uso un limite de 32k tokens por muestra, lo que puede sesgar el comportamiento en contextos mas largos.
- El adaptador se entreno con un unico formato de prompt para estas tareas; no se ha probado en conversacion general ni en otras preguntas sobre Bitcoin.
- Los errores en Bitcoin Script pueden provocar perdida de fondos. Cualquier script generado debe verificarse con herramientas reales (rust-miniscript, Bitcoin Core) antes de usarse en mainnet.
- El modelo tiende a razonar durante mucho tiempo: la respuesta mediana es de unos 24k tokens y algunas superan los 100k. Un `max_tokens` bajo trunca las respuestas.
- Tras el paso 28 la puntuacion de validacion cayo mientras la longitud de las respuestas se duplico; no hay termino en la recompensa que penalice la longitud.
- Solo se evaluo con el checkpoint cuantizado NVFP4 en vLLM; el modelo base en bf16 con el adaptador no se evaluo por separado.
- Idioma limitado al ingles en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre la correccion de los scripts generados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benthecarman/Qwen3.8-27B-BTC-Script-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint NVFP4 usado en la evaluacion: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- rust-miniscript: https://github.com/rust-bitcoin/rust-miniscript
- Bitcoin Core: https://github.com/bitcoin/bitcoin
- vLLM: https://github.com/vllm-project/vllm
- PEFT: https://github.com/huggingface/peft
