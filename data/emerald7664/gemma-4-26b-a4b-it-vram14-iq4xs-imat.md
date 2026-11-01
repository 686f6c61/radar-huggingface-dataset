# Emerald7664/Gemma-4-26B-A4B-it-vram14-iq4xs-imat

## Resumen

Gemma-4-26B-A4B-it-vram14-iq4xs-imat es una cuantización GGUF personalizada del modelo instruct google/gemma-4-26B-A4B-it, realizada por el usuario Emerald7664 (cuantizado por xero0000). El modelo base es un MoE de 26B parámetros totales con unos 4B activos por token, y esta versión busca resolver un problema concreto: hacer que todo el conjunto de pesos quepa en VRAM en configuraciones de doble GPU de gama media, sin perder calidad respecto a la referencia Q8_0.

La receta emplea una mezcla de precisión de 4,52 bpw (expertos en IQ4_XS, atención en Q5_K, FFN densa en Q6_K) guiada por una matriz de importancia (imatrix) calculada sobre un corpus local de código y agentes. Según el autor, el resultado es neutral en calidad (perplejidad −2,4% respecto a Q8_0 en su corpus de validación) y ofrece mejoras de rendimiento de ~13,5× en prefill y ~5,3× en decode frente a la receta Q8 con offload de expertos a CPU, llegando a ~3060 t/s de prefill y ~98 t/s de decode a contexto 128K todo en VRAM.

Es relevante para usuarios que ejecutan modelos MoE grandes en hardware de consumo (por ejemplo, RTX 3060 Ti 8 GB + RTX 3080 10 GB) y necesitan contexto largo con latencias razonables para tareas de código y agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma-4), 30 capas, 128 expertos / 8 activos, embeddings empatados |
| Parametros totales | 25.233.142.046 (~25,2B / 26B nominales) |
| Parametros activos | ~4B (8 de 128 expertos por token) |
| Longitud de contexto | 128K recomendado (todo en VRAM, 18 GB); 192K posible pero ajustado; 256K produce OOM en esa configuración |
| Tipos de cuantizacion | Mezcla personalizada 4,52 bpw: IQ4_XS (expertos gate/up), IQ4_NL (experts down), Q5_K (atención), Q6_K (FFN densa y embeddings), Q8_0 (router) |
| Idiomas soportados | Inglés (según etiquetas del repositorio); el modelo base es multilingue pero no hay datos adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (13,30 GiB), cuantizado desde el GGUF Q8_0 oficial (~25 GiB) |

## Arquitectura y entrenamiento

El modelo base, Gemma-4-26B-A4B-it, es un transformer de mezcla de expertos con 30 capas, 128 expertos y 8 expertos activos por token, y embeddings de entrada/salida empatados (no hay tensor `output.weight` separado). Los expertos dominan el tamaño del modelo: los tensores fusionados `ffn_gate_up_exps` y `ffn_down_exps` suponen aproximadamente el 90% de los pesos en Q8. No hay información disponible sobre el número de tokens de preentrenamiento, la composición del dataset ni los procesos de alineación (RLHF/DPO) del modelo base.

La innovación principal de esta ficha está en la cuantización. El tensor `ffn_down_exps` tiene 704 columnas, no divisibles entre 256, por lo que el tipo IQ4_XS estándar no es válido y se sustituye por IQ4_NL en ese tensor concreto. La receta asigna Q5_K a la atención (recorrida en cada token), Q6_K a la FFN densa y a los embeddings, y Q8_0 al router (`ffn_gate_inp`), que es pequeño pero crítico para la calidad del enrutado. La imatrix se calculó sobre un corpus local de código y agentes (~90 fragmentos), actuando además como una ligera adaptación de dominio. La construcción requirió una compilación de llama.cpp compatible con Gemma-4 (rama TurboQuant/gemma4 o equivalente); los binarios mainline anteriores no cargan este formato.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Modelo instruct con capacidad de "thinking": el autor recomienda dejar el modo thinking activado en bucles de agente/herramientas, ya que el modelo oficial está entrenado para planificar.
- Tareas de código y agentes: la imatrix se calibró específicamente sobre un corpus de código/agentes, y la validación de calidad se hizo sobre un holdout de ese dominio.
- Contexto muy largo: hasta 128K tokens todo en VRAM en hardware de 18 GB, con opción de 192K ajustada.
- No hay información disponible sobre soporte oficial de tool calling, capacidades de visión o audio en la documentación de este repositorio (el modelo base es solo de texto según el pipeline indicado).

## Casos de uso

- Servidor local de LLM para agentes de código: con ~98 t/s de decode y contexto de 128K todo en VRAM, es adecuado para bucles agénticos multi-paso (edición de repositorios, ejecución de herramientas) en una estación de trabajo con doble GPU de gama media.
- Procesamiento de documentos largos: el prefill de ~3060 t/s permite ingerir contextos de 6K tokens en unos 2 segundos, útil para resumir o analizar documentos extensos sin offload a CPU.
- Asistentes conversacionales autoalojados: el tamaño de 13,3 GiB y la cuantización 4-bit permiten servir el modelo completo en VRAM con latencias interactivas, sin depender de RAM del sistema.
- Desarrollo y pruebas de pipelines con llama.cpp: el repositorio documenta la receta completa de cuantización y los flags de `llama-server`, útil como referencia para quien cuantice modelos Gemma-4 MoE.
- Despliegue en rigs de 18 GB (por ejemplo, 3060 Ti + 3080): la receta está ajustada exactamente para ese presupuesto de VRAM, con reparto de tensores 44/56 entre ambas GPUs.
- Experimentación con cuantización imatrix: el archivo y su metodología sirven de base para comparar recetas IQ4_XS/Q5_K/Q6_K frente a Q8_0 en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos son de perplejidad y rendimiento del propio autor:

| Modelo | PPL (holdout, n_ctx=512) | vs Q8 misma colocación |
|---|---:|---|
| Q8_0 (auto-fit placement) | 26,588 | baseline |
| Q8_0 (nc23 CPU-MoE offload) | 27,061 | ~+1,8% |
| vram14-iq4xs-imat (este archivo) | 25,954 | −2,4% |
| Q4_K_M-imat (stock, descartado) | 24,834 | −6,6% (mayor, más lento, no all-VRAM) |

Rendimiento en el rig de referencia (RTX 3060 Ti 8 GB + RTX 3080 10 GB, KV cache q4_0, flash-attn, prompt de ~6K tokens de prefill + 160 de decode):

| Configuración | Prefill | Decode |
|---|---:|---:|
| vram14 @128K all-VRAM (ts 44,56, ub 512) | 3061,5 t/s | 97,5 t/s |
| vram14 @192K all-VRAM | 3038,6 t/s | 98,1 t/s |
| Q8 @256K nc23 no-op-offload (referencia) | 226,2 t/s | 18,5 t/s |

Nota del autor: la escala de perplejidad de Gemma no es comparable con números de la familia Qwen (tokenizador y ajuste al corpus distintos); solo importan los deltas dentro de la misma familia.

## Requisitos de hardware

- VRAM estimada: 13,30 GiB solo de pesos. Con KV cache q4_0 y contexto 128K, el conjunto cabe en 18 GB totales con ~1,4 GiB de holgura; a 192K la holgura baja a ~750 MiB; a 256K se produce OOM por el buffer de cómputo chunked de GDN.
- GPUs de referencia: RTX 3060 Ti 8 GB + RTX 3080 10 GB (18 GB), con Ryzen 5950X y DDR4. El modelo cabe en GPUs de consumo de gama media en configuración de doble GPU; en una única GPU de 16 GB (por ejemplo RTX 4080/4090 de 16-24 GB) debería caber a 128K, aunque no hay medidas publicadas.
- Software: requiere una compilación de llama.cpp compatible con Gemma-4 (rama TurboQuant/gemma4 o equivalente). Los binarios mainline antiguos no cargan el archivo.
- Despliegue: llama.cpp / llama-server (comando de producción documentado con `--jinja`, KV q4_0, flash-attn, split-mode layer, tensor-split 44,56). No hay información disponible sobre compatibilidad con vLLM, TGI u Ollama para esta variante concreta.
- Rendimiento medido: ~3060 t/s prefill y ~98 t/s decode a 128K todo en VRAM; ~13,5× prefill y ~5,3× decode frente a la receta Q8 con offload de expertos a CPU.
- Advertencia operativa: con VRAM al límite, el buffer de reserva de pipeline-parallel en CUDA0 (~1,3–1,9 GiB) puede registrar un fallo transitorio de asignación; el servidor reintenta sin pipeline parallelism y se recupera. Ese mensaje de log es esperado y no dañino.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Formato / cuantización | Contexto | Licencia |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-it-vram14-iq4xs-imat (esta ficha) | ~25,2B | ~4B | GGUF 4,52 bpw mixto + imatrix | 128K (all-VRAM, 18 GB) | Apache 2.0 |
| google/gemma-4-26B-A4B-it (Q8_0 GGUF oficial) | ~25,2B | ~4B | GGUF Q8_0 (~25 GiB) | 256K (con offload) | Apache 2.0 (según el repo) |
| Q4_K_M-imat stock (descartado por el autor) | ~25,2B | ~4B | GGUF Q4_K_M (15,6 GiB) | no disponible | Apache 2.0 |

Comparación clave: frente al Q8_0 oficial, esta variante reduce el tamaño a la mitad (13,3 GiB frente a ~25 GiB), mantiene o mejora ligeramente la perplejidad en el corpus objetivo (−2,4%) y multiplica por ~13,5 el prefill y por ~5,3 el decode en el rig de prueba, a costa de limitar el contexto máximo todo en VRAM a 192K. No hay datos comparativos con otros modelos MoE de la misma clase (por ejemplo Qwen3-30B-A3B) en la información disponible.

## Limitaciones y advertencias

- Calidad validada solo con perplejidad sobre un holdout local de código/agentes; no hay benchmarks estándar publicados, por lo que el rendimiento en otras tareas no está verificado.
- La imatrix se calculó sobre un corpus específico de código/agentes, lo que introduce una ligera adaptación de dominio: el comportamiento en otros dominios (escritura creativa, otros idiomas) podría diferir del modelo base.
- La escala de perplejidad de Gemma no es comparable con la de otras familias de modelos; solo los deltas intra-familia son significativos.
- Requiere una compilación específica de llama.cpp (TurboQuant/gemma4); las versiones mainline antiguas no cargan el archivo.
- A 256K de contexto o con ubatch 1024 a 192K se produce OOM en rigs de 18 GB por el buffer de cómputo chunked de GDN.
- Con VRAM al límite puede aparecer un fallo transitorio de asignación en el buffer de pipeline-parallel; es inofensivo pero puede confundir en logs de producción.
- Idioma etiquetado como inglés; el rendimiento en castellano no está documentado en este repositorio.
- Clientes que fuerzan temperatura ~0,2 hacen los bucles de herramientas "patológicamente deterministas"; se recomienda temp 1,0, top_k 64, top_p 0,95.
- Riesgo de alucinación y sesgos: no disponible información específica; aplícanse en principio las del modelo base Gemma-4-26B-A4B-it.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Emerald7664/Gemma-4-26B-A4B-it-vram14-iq4xs-imat
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Paper, blog o demo oficial: no disponible en la información proporcionada.
