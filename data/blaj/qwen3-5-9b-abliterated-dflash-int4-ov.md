# blaj/Qwen3.5-9B-abliterated-DFlash-int4-ov

## Resumen

`blaj/Qwen3.5-9B-abliterated-DFlash-int4-ov` es la conversion a OpenVINO IR en int4 de un modelo borrador (*draft model*) para decodificacion especulativa DFlash, construido sobre la familia Qwen3.5-9B. No es un modelo generativo autonomo: se acopla a un modelo objetivo (`lukey03/Qwen3.5-9B-abliterated` en int4) y propone tokens candidatos que el objetivo verifica, acelerando la inferencia sin alterar la distribucion de salida del objetivo. Lo publica el usuario `blaj` y deriva de `guglxni/Qwen3.5-9B-abliterated-DFlash`, a su vez basado en el borrador DFlash de `z-lab`.

La relevancia practica esta en el rendimiento medido: sobre una iGPU Intel Arc 130V/140V (Core Ultra 7 258V), este borrador eleva el throughput de 19,3 tok/s (sin borrador) a 43,8 tok/s, un 2,26x, superando al borrador DFlash original (40,6 tok/s, 2,10x) y a sus propias variantes int8 (40,8 tok/s) y BF16 (34,7 tok/s). Es, por tanto, una pieza de infraestructura de inferencia para hardware Intel, no un modelo para usar de forma aislada.

El modelo incorpora el prefijo "abliterated", lo que indica que las capas de rechazo del modelo base han sido suprimidas en el linaje del que deriva. La licencia declarada es Apache-2.0. El repositorio ocupa 1,7 GB y acumula 85 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DFlashDraftModel` (5 capas), block-diffusion para decodificacion especulativa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 asimetrico grupo-128 (este repo); variantes int8 y BF16 en repos hermanos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml`), stateful |

Datos adicionales relevantes: capas objetivo leidas `[1, 8, 15, 22, 29]`; entrada `hidden_states` de forma `[batch, seq, 20480]` (5 capas x 4096); tamano del repositorio 1,7 GB segun Hugging Face (la model card indica 544 MB para el artefacto IR).

## Arquitectura y entrenamiento

El modelo es un borrador DFlash de 5 capas que consume los estados ocultos de cinco capas del modelo objetivo (1, 8, 15, 22 y 29) concatenados en un tensor de 20480 dimensiones. Sobre esa representacion propone tokens candidatos mediante un esquema de *block diffusion*, que el modelo objetivo verifica en paralelo. La innovacion clave frente a un borrador convencional es que la propuesta se condiciona a los estados internos del objetivo, lo que incrementa la tasa de aceptacion y, con ella, la aceleracion efectiva.

El grafo exportado es *stateful*: expone una entrada `beam_idx` y una unica salida `last_hidden_state`. Este detalle es critico, porque una exportacion sin estado carga y genera, pero todas las propuestas son rechazadas y el resultado es mas lento que no usar borrador (8,5 frente a 9,0 tok/s segun las mediciones del autor). El modelo objetivo emparejado debe incluir los metadatos `hidden_states_decoder_layers`; en caso contrario la especulacion produce cero tokens aceptados de forma silenciosa. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el linaje.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre un objetivo Qwen3.5-9B; no genera texto de forma autonoma.
- Aceleracion de inferencia verificada: 2,26x sobre baseline sin borrador en iGPU Intel Arc con OVMS 2026.4.0.
- Compatibilidad con decodificacion greedy y con prefix caching desactivado (requisito de DFlash).
- Integracion con OpenVINO Model Server mediante `--draft_model_path`.
- Linaje "abliterated": el objetivo emparejado tiene suprimidas las capas de rechazo, lo que se traslada al comportamiento del sistema completo.
- No soporta tool calling, agentes, vision, audio ni modo thinking por si mismo; esas capacidades, si existen, residen en el modelo objetivo.

## Casos de uso

- Aceleracion de inferencia en equipos Intel con GPU integrada: desplegar el par objetivo + borrador en OVMS sobre un portatil con Core Ultra y Arc 130V/140V para duplicar el throughput en generacion de texto interactiva, un escenario donde 19 tok/s resulta limitante y 44 tok/s es usable.
- Servicio de chat local en estaciones de trabajo sin GPU dedicada: el par cabe en 30 GB de RAM y aprovecha la iGPU, evitando el coste de una A100 o una RTX 4090.
- Prototipado de pipelines de decodificacion especulativa: sirve como referencia funcional de una exportacion OpenVINO stateful correcta, con el codigo de conversion documentado y una comprobacion explicita de `beam_idx`.
- Evaluacion comparativa de borradores: al estar medido con el mismo arnes (`matrix_bench.py`) que el borrador de `z-lab`, permite comparar estrategias de borrador sobre un mismo objetivo int4 con cifras directamente equiparables.
- Despliegue en entornos con requisitos de licencia permisiva: Apache-2.0 facilita la integracion en productos comerciales sin obligaciones de copyleft.
- Investigacion sobre tasas de aceptacion: util para estudiar como varia la aceptacion segun la cuantizacion del borrador (int4, int8, BF16) manteniendo fijo el objetivo.

## Benchmarks y rendimiento

Medido en Intel Core Ultra 7 258V (Arc 130V/140V iGPU), 30 GB RAM, OpenVINO Model Server 2026.4.0, dispositivo GPU, single-stream, 128 tokens nuevos maximos, decodificacion greedy, media de 3 ejecuciones tras warmup. Objetivo: `lukey03/Qwen3.5-9B-abliterated` en int4.

| Borrador | Cuantizacion | tok/s | Aceleracion |
|---|---|---|---|
| ninguno (baseline) | — | 19,3 | — |
| `z-lab/Qwen3.5-9B-DFlash` | int4 | 40,6 | 2,10x |
| este borrador | int4 | 43,8 | 2,26x |
| este borrador | int8 | 40,8 | 2,11x |
| este borrador | BF16 | 34,7 | 1,80x |

No se han publicado resultados en benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo es un borrador y su calidad se mide por tasa de aceptacion, no por exactitud de tarea.

## Requisitos de hardware

- VRAM/RAM: el artefacto IR ocupa 544 MB segun la model card (1,7 GB el repositorio completo); debe sumarse la memoria del objetivo int4.
- Hardware de referencia medido: Intel Core Ultra 7 258V con iGPU Arc 130V/140V y 30 GB de RAM.
- GPU dedicadas: no hay mediciones publicadas para A100, H100 o RTX 4090; el formato OpenVINO IR esta orientado a CPU, iGPU y NPU Intel, y su uso en GPU NVIDIA requeriria otra ruta de despliegue.
- Cabe en equipos consumer Intel con GPU integrada; no requiere GPU dedicada.
- Despliegue: OpenVINO Model Server con `--draft_model_path` y `--enable_prefix_caching false`. Verificar el log `Draft model strategy: DFlash` y `state: AVAILABLE`.
- Throughput medido: 43,8 tok/s en single-stream con 128 tokens nuevos; no se dispone de datos de latencia ni de rendimiento en batch.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | tok/s (mismo arnes) | Licencia |
|---|---|---|---|---|
| este borrador (int4) | DFlash draft, 5 capas, abliterated | int4 grupo-128 | 43,8 | Apache-2.0 |
| `z-lab/Qwen3.5-9B-DFlash` | DFlash draft upstream | int4 | 40,6 | no disponible |
| este borrador (int8) | misma arquitectura | int8 | 40,8 | Apache-2.0 |
| este borrador (BF16) | misma arquitectura | BF16 | 34,7 | Apache-2.0 |
| sin borrador | objetivo `lukey03/Qwen3.5-9B-abliterated` | int4 | 19,3 | Apache-2.0 |

No se dispone de comparativas frente a borradores de otras familias (por ejemplo, EAGLE o Medusa) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin un objetivo Qwen3.5-9B compatible y con metadatos `hidden_states_decoder_layers`, la especulacion falla en silencio con cero tokens aceptados.
- Requiere prefix caching desactivado, lo que penaliza escenarios con prompts largos y reutilizados.
- Una exportacion no stateful (sin `beam_idx`) produce un rendimiento peor que no usar borrador; conviene validar el grafo antes de desplegar.
- El prefijo "abliterated" implica supresion de capas de rechazo: el sistema completo puede generar contenido que el modelo base filtraria. Requiere moderacion externa en produccion.
- Riesgo de alucinacion heredado del objetivo; el borrador no lo mitiga ni lo agrava, pero tampoco lo corrige.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingue sin evaluar el objetivo.
- Mediciones limitadas a una unica plataforma (Core Ultra 7 258V, iGPU Arc, OVMS 2026.4.0, single-stream, greedy); no extrapolables a otras GPU, batch mayor o sampling.
- Sin datos publicados de tasa de aceptacion por dominio ni de calidad en tareas; el linaje de tres modelos encadenados complica la trazabilidad de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-DFlash-int4-ov
- Modelo base directo: https://huggingface.co/guglxni/Qwen3.5-9B-abliterated-DFlash
- Objetivo abliterated: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- Borrador DFlash upstream: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Guia de conversion a OpenVINO IR: https://devnotes.page/posts/how-to-convert-models-to-openvino-ir/
- Guia de conversion y ejecucion de DFlash con OpenVINO: https://devnotes.page/posts/how-to-convert-and-run-dflash-models-with-openvino/
