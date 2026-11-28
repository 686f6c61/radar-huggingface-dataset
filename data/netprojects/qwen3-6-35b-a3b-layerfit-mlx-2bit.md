# netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-2bit

## Resumen

Qwen3.6-35B-A3B-LayerFit-MLX-2bit es una cuantizacion de 2 bits del modelo Qwen3.6-35B-A3B de Alibaba Cloud (equipo Qwen), empaquetada en formato MLX para su ejecucion nativa en Apple Silicon. La desarrolla netprojects (Paris Michalas) y aplica una tecnica propia denominada LayerFit, que asigna un numero de bits distinto a cada bloque del modelo (expertos enrutados, experto compartido, bloques de atencion lineal y atencion completa, embeddings y cabeza de salida) en funcion de la sensibilidad medida de cada uno, dentro de un presupuesto de tamano fijo.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con 34.660.610.688 parametros totales y aproximadamente 3.000 millones de parametros activos por token. Esta version ocupa 10,3 GB en disco, lo que la hace apta para Macs de 16 GB de memoria unificada en modo "stretch". Es una compilacion solo de texto: la torre de vision del modelo original se ha eliminado para reducir el tamano.

Su relevancia actual es practica: permite ejecutar un MoE de 35B con contexto de 262K tokens en hardware de consumo Apple, algo imposible con los pesos en bf16. El modelo mantiene el modo de razonamiento (thinking) activado por defecto y conserva el router y la compuerta del experto compartido en bf16 para preservar la calidad de enrutamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), con atencion lineal y atencion completa |
| Parametros totales | 34.660.610.688 |
| Parametros activos | aproximadamente 3.000 millones por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | 2 bits mixtos por capa (LayerFit); router y compuerta del experto compartido en bf16 |
| Idiomas soportados | no disponible (la model card menciona pruebas en ingles, otros idiomas, codigo, tool calls y matematicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (mlx-lm) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de mezcla de expertos con atencion hibrida (bloques de atencion lineal combinados con atencion completa) y un experto compartido ademas de los expertos enrutados. Esta version no reentrena el modelo: es una cuantizacion post-entrenamiento del checkpoint `Qwen/Qwen3.6-35B-A3B` (revision `345d467`). No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre las fases de RLHF o DPO del modelo original en la informacion proporcionada.

La innovacion tecnica es LayerFit: en lugar de aplicar una cuantizacion uniforme, se mide la degradacion de cada componente a bits bajos y se distribuye un presupuesto fijo de bits donde mas contribuye a preservar la fidelidad. Segun la model card, frente a una mezcla plana de 2 bits (expertos a 2 bits, atencion a 4 bits, resto a 3 bits) con el mismo tamano de 10,3 GB, LayerFit mejora la concordancia top-1 con bf16 del 73,9 % al 75,0 % y reduce el error KL de 0,4515 a 0,4004. La receta exacta esta en `layerfit-recipe.json` del repositorio.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 262K tokens.
- Razonamiento con modo thinking activado por defecto; desactivable mediante `enable_thinking: false` en el template de chat.
- Generacion de codigo (la model card indica que escribe codigo en su prueba de humo).
- Razonamiento matematico (GSM8K-20 con thinking desactivado: 18/20).
- Soporte de tool calling / function calling (incluido en el conjunto de pruebas de calibracion de LayerFit).
- Capacidades multilingues heredadas del modelo base (sin listado oficial de idiomas en esta ficha).
- Sin vision: la torre de vision se ha eliminado en esta compilacion.

## Casos de uso

- Asistente de codigo local en Mac: con 10,3 GB de pesos cabe en un Mac de 16 GB en modo stretch, permitiendo autocompletado, explicacion y refactorizacion sin enviar codigo a la nube.
- Procesamiento de documentos largos: los 262K tokens de contexto permiten analizar repositorios completos, contratos o libros en una sola pasada en hardware de consumo.
- Agentes con tool calling: el soporte de function calling y el modo thinking facilitan flujos multi-paso (consulta de APIs, ejecucion de comandos, encadenamiento de herramientas) en local.
- Razonamiento matematico asistido: util para resolver problemas paso a paso con el modo thinking, con calidad razonable segun la prueba GSM8K-20 reportada.
- Prototipado y evaluacion offline: investigadores pueden probar un MoE de 35B en un portatil Apple sin GPU dedicada, acelerando iteraciones sobre prompts y plantillas.
- Traduccion y redaccion multilingue: el modelo base soporta varios idiomas (segun la model card, las pruebas cubren "other languages"), adecuado para borradores y resumenes.
- Chat de atencion al cliente en local: conversaciones multi-turno con contexto largo sin dependencia de servicios externos, relevante por privacidad.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la propia model card, medidos con el arnes de netprojects (solo pesos del modelo de lenguaje, vision excluida, 32 pasajes x 512 tokens, referencia bf16 en MLX, MacBook Pro M5 Max, 28 de noviembre de 2026):

| Metrica | Mezcla plana 2-bit | LayerFit 2-bit (esta build) |
|---|---|---|
| Tamano de pesos | 10,3 GB | 10,3 GB |
| Concordancia top-1 con bf16 | 73,9 % | 75,0 % |
| Error KL frente a bf16 | 0,4515 | 0,4004 |
| GSM8K-20 (thinking off) | no disponible | 18/20 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, etc.) para esta cuantizacion concreta. Para los resultados oficiales del modelo base debe consultarse la model card de Qwen.

## Requisitos de hardware

- VRAM/memoria unificada: 10,3 GB de pesos; se recomienda un Mac de 16 GB como minimo en modo stretch (cerrar aplicaciones y elevar `iogpu.wired_limit_mb` a cerca del 75 % de la RAM).
- GPU: exclusivamente Apple Silicon (MLX). No es compatible con CUDA ni con GPUs NVIDIA (A100, H100, RTX 4090) en este formato.
- Cabe en GPU de consumo Apple: Mac de 16 GB (ajustado), 24 GB, 32 GB y superiores con holgura. Para 24 GB existe la build de 2,5 bits (13,7 GB); para 32 GB, la de 3 bits (16,1 GB) y 4 bits (21,6 GB).
- Despliegue: mlx-lm (comando `mlx_lm.generate`); no esta pensado para vLLM, llama.cpp, Ollama ni TGI, que no cargan pesos MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card solo indica que se midio en un MacBook Pro M5 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-LayerFit-MLX-2bit (esta build) | 34,7B totales, ~3B activos | 262K | MLX, Apple Silicon, 10,3 GB | Apache-2.0 | Hugging Face |
| Qwen3.6-35B-A3B-LayerFit-MLX-2.5bit | 34,7B totales, ~3B activos | 262K | MLX, Apple Silicon, 13,7 GB | Apache-2.0 | Hugging Face |
| Qwen3.6-35B-A3B-LayerFit-MLX-4bit | 34,7B totales, ~3B activos | 262K | MLX, Apple Silicon, 21,6 GB | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.6-35B-A3B (original) | 34,7B totales, ~3B activos | 262K | safetensors bf16, GPU | Apache-2.0 | Hugging Face |

Las builds de 2,5, 3 y 4 bits del mismo autor ofrecen mayor fidelidad a cambio de mas memoria; la de 2 bits es la unica que cabe en 16 GB. El modelo original requiere hardware de GPU con memoria suficiente para bf16 y ofrece ademas vision.

## Limitaciones y advertencias

- Cuantizacion agresiva a 2 bits: la concordancia top-1 con bf16 es del 75,0 %, por lo que se esperan degradaciones medibles en tareas complejas frente al modelo original.
- Sin vision: la torre de vision se ha eliminado; no puede procesar imagenes.
- Solo Apple Silicon: el formato MLX no es portable a CUDA ni a CPU x86 de forma directa.
- Riesgo de alucinacion inherente al modelo base, potencialmente amplificado por el error KL de 0,4004 frente a bf16.
- El modo thinking esta activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; se heredan los del modelo base.
- Idiomas: no hay listado oficial de idiomas soportados en esta ficha; la cobertura multilingue debe validarse empiricamente.
- Licencia Apache-2.0 permite uso comercial, pero LayerFit es una marca registrada de NetProjects y el autor no esta afiliado a Alibaba Cloud ni al equipo Qwen.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-2.5bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-4bit
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
