# hermitdave/Agnes-3.0-Flash-MTP-drafter

## Resumen

Agnes-3.0-Flash-MTP-drafter es un modelo auxiliar (sidecar) de prediccion multi-token (MTP) disenado para decodificacion especulativa sobre los quants MLX del modelo Agnes-3.0-Flash. Lo publica el usuario hermitdave en HuggingFace y consta de 424.699.392 parametros (unos 424,7 millones) en formato safetensors bf16, con un peso aproximado de 0,85 GB. No es un modelo autonomo: reutiliza los embeddings y la LM head del modelo objetivo, por lo que no puede ejecutarse por si solo.

Su funcion es proponer bloques de hasta 3 tokens por pasada forward que el modelo base verifica despues, reduciendo el numero de evaluaciones del modelo grande. El autor reporta una aceleracion esperada de 1,5x a 2,5x en generacion de texto, dependiente de la carga de trabajo, medida sobre un Apple M3 Max de 64 GB. El modelo objetivo original es Agnes-AI/Agnes-3.0-Flash, publicado bajo licencia Apache-2.0, de arquitectura de texto (sin vision).

La relevancia actual es practica: permite acelerar inferencia local en Apple Silicon mediante MLX sin necesidad de GPUs dedicadas, con una huella de memoria muy reducida (menos de 1 GB adicional). Su integracion esta soportada por mlx-vlm (servidor con decodificacion especulativa MTP) y por la API Python de mlx-lm; el soporte en oMLX esta pendiente (issue #1089).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 1 capa decoder (MTP drafter) con atencion completa y atencion con puerta (gated attention), formato qwen3_5_mtp |
| Parametros totales | 424.699.392 (~424,7 M) |
| Longitud de contexto | no disponible (heredada del modelo objetivo) |
| Tipos de cuantizacion | Pesos en bf16; los quants MLX 4-bit, 6-bit y 8-bit corresponden al modelo base, no al drafter |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el drafter (el modelo base Agnes-3.0-Flash es Apache-2.0) |
| Formato de pesos | safetensors (bf16, ~0,85 GB) |
| Numero de capas | 1 (decoder_layer.0) |
| Cabezas de atencion | 48 cabezas Q / 4 cabezas KV (GQA, ratio 12:1) |
| Dimensionalidad de cabeza | 256 |
| MLP intermedio | 17408 (SwiGLU) |
| Normalizacion | RMSNorm (pre_fc_norm_embedding, pre_fc_norm_hidden, norm final) |
| Proyeccion de fusion | fc: Linear(2 x hidden_size -> hidden_size) |
| Modelo base requerido | hermitdave/Agnes-3.0-Flash-MLX-4bit, -6bit o -8bit |
| Ejecucion autonoma | No: es un sidecar que toma prestados embeddings y LM head del modelo objetivo |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-13 / 2026-09-13 |

## Arquitectura y entrenamiento

El drafter es una unica capa decoder con atencion completa. En cada paso, concatena el embedding del token y el estado oculto del modelo objetivo, los normaliza por separado con RMSNorm y los proyecta mediante una capa lineal `fc` de 2 x hidden_size a hidden_size. Esa representacion fusionada pasa por la capa de atencion (48 cabezas Q frente a 4 cabezas KV, con normalizacion Q/K y puerta sigmoide) y por un MLP SwiGLU con intermedio de 17408. La salida se normaliza con RMSNorm y se proyecta con la LM head del modelo base para producir los logits de los tokens propuestos. El bucle completo propone hasta 3 tokens por pasada forward y despues los somete a verificacion.

No hay informacion disponible sobre el entrenamiento del drafter (numero de tokens, composicion del dataset, uso de RLHF/DPO) ni sobre si los pesos son destilados del modelo original o entrenados desde cero. El autor indica que los pesos fueron extraidos y convertidos por Hermes Agent (Nous Research) aplicando tres transformaciones: eliminacion del prefijo `mtp.` en los nombres de pesos, renombrado de `global_attn` a `self_attn` para compatibilidad con qwen3_5_mtp, y suma de 1.0 a los pesos de las RMSNorm one-centered (convencion de HuggingFace a convencion MLX). La innovacion tecnica destacable es precisamente el esquema de reutilizacion de embeddings y LM head del modelo objetivo, que reduce el drafter a una sola capa y menos de 1 GB.

## Capacidades

- Generacion de borradores de hasta 3 tokens por pasada forward para decodificacion especulativa (multi-token prediction).
- Reutilizacion de los embeddings y la LM head del modelo objetivo, lo que evita duplicar la matriz de vocabulario.
- Compatibilidad con el formato de configuracion y pesos `qwen3_5_mtp` (clases `Qwen3_5MTPConfig` y `Qwen3_5MTPDraftModel` en mlx-vlm).
- Funcionamiento con los tres niveles de cuantizacion del modelo base (4, 6 y 8 bits).
- Ejecucion en Apple Silicon mediante MLX (probado en M3 Max 64 GB).
- No soporta tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso por si mismo: son capacidades del modelo objetivo Agnes-3.0-Flash, que segun la model card es un modelo exclusivamente de texto.
- No dispone de capacidades multilingues declaradas de forma independiente; dependen del modelo base.

## Casos de uso

- Aceleracion de inferencia local en Mac: desplegar el drafter junto a Agnes-3.0-Flash-MLX-4bit para reducir el numero de evaluaciones del modelo grande y bajar la latencia de generacion en equipos Apple Silicon, sin GPU dedicada.
- Asistentes conversacionales de baja latencia en escritorio: el esquema de borrador y verificacion permite streaming mas fluido en aplicaciones de chat locales, donde el tiempo hasta el primer token y el tiempo entre tokens son criticos.
- Servidores de inferencia internos sobre Mac Studio o Mac Pro: uso de `python -m mlx_vlm.server --model ... --draft-model ...` para exponer un endpoint compatible con la API de mlx-vlm en equipos de sobremesa.
- Investigacion en decodificacion especulativa: el repositorio sirve como banco de pruebas para medir tasas de aceptacion de tokens y ajustar el numero de tokens propuestos por bloque (hasta 3 en la configuracion documentada).
- Procesamiento por lotes de documentos en local: resumen, clasificacion o extraccion sobre volumenes moderados de texto en hardware Apple, donde el coste por token se reduce al agrupar borradores de varios tokens.
- Autocompletado y generacion asistida en editores de codigo, siempre que el modelo objetivo tenga capacidad de codigo suficiente; el drafter solo aporta velocidad, no calidad adicional.
- Evaluacion de pipelines de conversion de pesos: el repositorio documenta conversiones (prefijo `mtp.`, renombrado `global_attn`, ajuste de RMSNorm) utiles como referencia para portar otros drafters MTP a MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas equivalentes para este repositorio.

La unica cifra de rendimiento aportada por el autor es la siguiente:

| Medicion | Valor |
|---|---|
| Aceleracion esperada en generacion de texto | 1,5x - 2,5x (dependiente de la carga de trabajo) |
| Tokens propuestos por pasada forward | Hasta 3 |
| Hardware de la prueba | Apple M3 Max 64 GB |
| Base de la prueba | Prompt "The capital of France is" con el modelo base token a token frente al mismo con drafter |
| Throughput en tokens/s | no disponible |
| Tasa de aceptacion de tokens | no disponible |

## Requisitos de hardware

- VRAM/unificada del drafter: aproximadamente 0,85 GB en bf16; el repositorio ocupa 0,8 GB en disco.
- Memoria total necesaria: la del modelo base (quant MLX de 4, 6 u 8 bits, tamano no disponible en la informacion proporcionada) mas menos de 1 GB adicionales del drafter.
- Hardware validado: Apple M3 Max con 64 GB de memoria unificada.
- Hardware objetivo: cualquier equipo Apple Silicon (serie M) compatible con MLX y mlx-vlm. No hay soporte CUDA documentado para este repositorio, ya que los pesos estan en formato MLX.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles como opcion documentada para este drafter.
- Opciones de despliegue soportadas: `mlx_vlm.server` con el flag `--draft-model`, y la API Python de mlx-lm/mlx-vlm cargando `Qwen3_5MTPDraftModel` y enlazandolo con `mtp.bind(base)`.
- Opciones de despliegue no soportadas: oMLX, ya que su ajuste `vlm_mtp_enabled` solo funciona con modelos vision-lenguaje y Agnes es de texto; el seguimiento esta en el issue oMLX#1089.
- Latencia y throughput estimados: no disponibles en terminos absolutos; solo se documenta la mejora relativa de 1,5x-2,5x.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible drafters MTP publicos comparables con los que establecer una comparacion cuantitativa. La unica referencia directa es el modelo objetivo al que acompana:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agnes-3.0-Flash-MTP-drafter | Drafter MTP sidecar, 1 capa | 424,7 M | no disponible (la del base) | no disponible | HuggingFace (0 descargas, 0 likes) |
| Agnes-AI/Agnes-3.0-Flash | Modelo de texto completo (objetivo) | no disponible | no disponible | Apache-2.0 | HuggingFace |
| Otros drafters de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible | no disponible en la busqueda realizada |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere obligatoriamente un quant del modelo objetivo Agnes-3.0-Flash; sin el no puede generar nada.
- El repositorio no declara licencia. El modelo base es Apache-2.0, pero la ausencia de licencia explicita en el drafter es un riesgo para uso comercial o redistribucion; conviene aclararlo con el autor antes de integrarlo en produccion.
- Uso limitado a Apple Silicon con MLX: no hay pesos GGUF, safetensors para transformers ni soporte CUDA documentado.
- oMLX no soporta todavia MTP en modelos de texto (issue #1089), por lo que la unica via soportada es mlx_vlm.server o la API Python.
- La aceleracion de 1,5x-2,5x es una expectativa del autor dependiente de la carga de trabajo; no se aportan tasas de aceptacion ni mediciones reproducibles.
- Al tratarse de un drafter, no mejora la calidad del texto: solo la velocidad. Cualquier sesgo, alucinacion o limitacion idiomatica proviene del modelo base, sobre el que no hay datos en este repositorio.
- La longitud de contexto, los idiomas y el resto de especificaciones de inferencia quedan determinados por el modelo objetivo y no estan documentados aqui.
- No hay historial de adopcion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- El proceso de conversion aplicado a los pesos (renombrados y ajuste de RMSNorm) es especifico de la convencion MLX; reutilizar los pesos en otros frameworks puede requerir revertir esas transformaciones.

## Enlaces

- Repositorio del drafter: https://huggingface.co/hermitdave/Agnes-3.0-Flash-MTP-drafter
- Modelo base en MLX 4-bit: https://huggingface.co/hermitdave/Agnes-3.0-Flash-MLX-4bit
- Modelo base en MLX 6-bit: https://huggingface.co/hermitdave/Agnes-3.0-Flash-MLX-6bit
- Modelo base en MLX 8-bit: https://huggingface.co/hermitdave/Agnes-3.0-Flash-MLX-8bit
- Modelo original: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash (Apache-2.0)
- Issue de soporte MTP de texto en oMLX: https://github.com/jundot/omlx/issues/1089
- Herramienta de conversion (Hermes Agent, Nous Research): https://hermes-agent.nousresearch.com
