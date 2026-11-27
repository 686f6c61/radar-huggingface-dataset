# dealignai/ERNIE-5.5-Flash-Preview-ABLITERATED-MXFP4

## Resumen

ERNIE-5.5-Flash-Preview-ABLITERATED-MXFP4 es una compilacion de pesos derivada del modelo base `baidu/ERNIE-5.5-Flash-Preview`, publicada por el colectivo DealignAI. Se trata de una version "abliterated" y "uncensored": el autor declara haber eliminado los comportamientos de rechazo a nivel de pesos, sin recurrir a fine-tuning, LoRA ni trucos de plantilla de chat o prompt de sistema. El repositorio es un alias o redireccion oficial: no duplica el checkpoint de 155 GB, sino que remite al repositorio principal `dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-MXFP4`, donde viven los pesos, los CSV de MMLU por asignatura y la documentacion completa.

El modelo conserva la arquitectura del ERNIE-5.5-Flash-Preview de Baidu, con expertos enrutados nativos en formato MXFP4 (cuantizacion de 4 bits en formato microscaling) y una cabeza borrador DSpark empaquetada para decodificacion especulativa. Mantiene los modos de razonamiento (`off`, `low`, `medium`, `high`) y el soporte de tool calling del modelo original.

La relevancia de esta ficha es doble: por un lado, documenta una variante sin censura de un modelo chino de gran tamano con licencia comunitaria propia; por otro, advierte de que se distribuye bajo la licencia `dealignai-community-v0.3`, distinta de la del modelo base, y de que su uso en produccion exige evaluar tanto los riesgos de contenido como las obligaciones legales de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); expertos enrutados en MXFP4 y cabeza borrador DSpark para decodificacion especulativa |
| Parametros totales | no disponible (checkpoint de 155 GB en MXFP4) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (segun el ejemplo de servicio con `--max-model-len 32768`) |
| Tipos de cuantizacion | MXFP4 (expertos enrutados); KV cache en FP8 en el ejemplo de despliegue |
| Idiomas soportados | no disponible |
| Licencia | dealignai-community-v0.3 |
| Formato de pesos | safetensors (checkpoint para vLLM, 155 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) en el que los expertos enrutados se almacenan nativamente en MXFP4, un formato de cuantizacion de 4 bits con escalado microscopico por bloque. Sobre esa base, DealignAI aplica una ablacion a nivel de pesos (abliteration) para eliminar las direcciones de activacion asociadas al rechazo, sin reentrenamiento ni adaptadores. El resultado conserva la cabeza borrador DSpark, que permite decodificacion especulativa con `num_speculative_tokens` configurable (7 en el ejemplo del autor) y muestreo probabilistico del borrador.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF o DPO; la model card no los detalla. La innovacion tecnica destacable es la combinacion de expertos MXFP4 (que reduce el peso del checkpoint a 155 GB) con decodificacion especulativa DSpark y modos de razonamiento conmutables, todo servible con vLLM mediante `--enable-expert-parallel` y `--tensor-parallel-size`.

## Capacidades

- Generacion de texto y razonamiento con cuatro niveles de esfuerzo: `off`, `low`, `medium` y `high`.
- Razonamiento multi-paso y modo "thinking" controlable mediante el parser `ernie5`.
- Tool calling y function calling nativos, con `--enable-auto-tool-choice` y parser `ernie5`.
- Capacidad de agente: el autor reporta pruebas de codigo de 50 turnos con contexto creciente hasta 32K sin bucles.
- Decodificacion especulativa DSpark integrada para acelerar la generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Comportamiento sin censura: el autor declara 0 rechazos en HarmBench-320 y HarmBench-30 en modo `high` y `off`.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar como responde un LLM de gran tamano cuando se eliminan las capas de rechazo, comparando con el modelo base en tareas controladas de red teaming.
- Generacion de codigo en pipelines de CI/CD: con tool calling y contexto de 32K, puede integrarse en flujos de revision automatica, generacion de tests y correccion de errores en repositorios de tamano medio.
- Agentes multi-paso de larga duracion: la prueba de 50 turnos con contexto creciente sugiere uso en tareas de refactorizacion o depuracion que requieren mantener estado durante muchas interacciones.
- Analisis de documentos tecnicos extensos: la ventana de 32K permite procesar informes, especificaciones y codigo fuente en una sola pasada.
- Generacion creativa sin restricciones editoriales: util para escritura de ficcion, guiones o contenido donde el modelo base rechazaria temas sensibles.
- Evaluacion comparativa de cuantizacion: al estar en MXFP4, sirve para medir la perdida de calidad frente al modelo base en FP8 o BF16.
- Servicio de inferencia de alto rendimiento: con vLLM, expert-parallel y decodificacion especulativa, es adecuado para despliegues con multiples GPUs que priorizan throughput.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Base MXFP4 | Checkpoint DealignAI | Delta |
|---|---:|---:|---:|
| MMLU-500 (`off`, logit) | 437/500 (87,4 %) | 429/500 (85,8 %) | -1,6 pp (STEM 0,0 pp) |
| MMLU-200 (`high`, reasoning) | 185/200 (92,5 %) | 185/200 (92,5 %) | 0,0 pp |
| HarmBench-320 (`high`, T=0) | no disponible | 229/240 (95,4 %), 0 rechazos | no disponible |
| HarmBench-30 (`off`) | no disponible | 30/30 (100 %), 0 rechazos | no disponible |
| HarmBench-30 (`high`) | no disponible | 29/30 (96,7 %), 0 rechazos | no disponible |
| Codigo 50 turnos, contexto 32K (`high`) | 50/50 | 50/50 paradas, 50/50 recibos, 0 bucles | 0 |

No se han publicado resultados de MMLU por asignatura completos en esta ficha; el autor remite a los CSV del repositorio principal.

## Requisitos de hardware

- Checkpoint de 155 GB en MXFP4: no cabe en una GPU consumer individual; requiere al menos 2 GPUs de 80 GB (A100/H100) para el ejemplo oficial con `--tensor-parallel-size 2`.
- VRAM estimada: superior a 160 GB en total para pesos mas KV cache en FP8 a 32K de contexto; el autor no publica una cifra exacta.
- GPUs recomendadas: A100 80 GB, H100 80 GB, H200; configuraciones multi-GPU con expert-parallel.
- No cabe en RTX 4090 (24 GB) ni en GPUs consumer de gama alta en su configuracion completa.
- Despliegue: vLLM con `--trust-remote-code`, `--enable-expert-parallel`, `--kv-cache-dtype fp8` y `--speculative-config` con metodo `dspark`.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview-ABLITERATED-MXFP4 | no disponible (155 GB MXFP4) | 32K | dealignai-community-v0.3 | safetensors (vLLM) | Variante sin censura con DSpark |
| baidu/ERNIE-5.5-Flash-Preview | no disponible | no disponible | licencia Baidu (no disponible) | no disponible | Modelo base original |
| dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-MXFP4 | no disponible (155 GB MXFP4) | 32K | dealignai-community-v0.3 | safetensors (vLLM) | Repositorio principal con pesos reales |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes en la misma categoria.

## Limitaciones y advertencias

- Modelo sin censura: eliminacion deliberada de rechazos; puede generar contenido danino, ilegal o inseguro. No apto para aplicaciones orientadas al publico sin filtros externos.
- Riesgo elevado de alucinacion, especialmente en modo `off`, donde el autor reporta una caida de 1,6 pp en MMLU-500.
- Licencia `dealignai-community-v0.3`: distinta de la del modelo base; es responsabilidad del usuario revisar sus terminos antes de cualquier uso comercial.
- El repositorio es solo un alias: descargar pesos desde aqui no funciona; hay que ir al repositorio UNCENSORED.
- Idiomas soportados no documentados; no se garantiza calidad multilingue.
- Contexto limitado a 32K en la configuracion de referencia.
- Requiere vLLM con `--trust-remote-code`, lo que implica ejecutar codigo del autor.
- No hay validacion independiente de los benchmarks reportados por el autor.
- Sin datos de sesgos conocidos publicados.

## Enlaces

- Repositorio Hugging Face (alias): https://huggingface.co/dealignai/ERNIE-5.5-Flash-Preview-ABLITERATED-MXFP4
- Repositorio principal con pesos: https://huggingface.co/dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-MXFP4
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Licencia: https://huggingface.co/dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-MXFP4/blob/main/LICENSE
- Perfil del autor en X: https://x.com/dealignai
