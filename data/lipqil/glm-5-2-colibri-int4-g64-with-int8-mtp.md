# lipqil/GLM-5.2-colibri-int4-g64-with-int8-mtp

## Resumen

GLM-5.2-colibri-int4-g64-with-int8-mtp es una conversión cuantizada del modelo GLM-5.2 de Zhipu AI (zai-org), un transformer de mezcla de expertos (MoE) con 744.000 millones de parámetros totales. La conversión la firma el usuario lipqil y está empaquetada específicamente para el motor de inferencia por streaming colibri (JustVugg/colibri), no para transformers estándar ni para llama.cpp. El formato es int4 agrupado (group size 64) para los pesos de los expertos, con embeddings y lm_head en int8 y una cabeza MTP (multi-token prediction) también en int8 para decodificación especulativa.

El problema que resuelve es doble. Por un lado, permite ejecutar un MoE de 744B en hardware modesto mediante streaming desde NVMe, con un tamaño de repositorio de 429,3 GB. Por otro, la cuantización agrupada (una escala por cada 64 elementos, en lugar de una por fila) corrige problemas de calidad y de fiabilidad de parada documentados en el contenedor int4 per-row: según la model card, la precisión en hellaswag sube del 83,5% al 87,0%, y los bucles de razonamiento que no emitían EOS desaparecen en una matriz de 5 configuraciones de muestreo.

Es relevante ahora porque el autor lo presenta como el contenedor de referencia para int4 agrupado en colibri, validado token-exact contra el oráculo de transformers (32/32), y porque existe un hermano menor (E8/IQ3 a 3,06 bpw, 289 GB) que conviene elegir cuando los expertos no caben en memoria. La licencia del contenedor es MIT, aunque el modelo base GLM-5.2 tiene sus propias condiciones que deben respetarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (glm_moe_dsa) |
| Parametros totales | 744B (según model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 agrupado gs=64 en expertos (escalas f32 por grupo), int8 en embed/lm_head, int8 en cabeza MTP, f32 en norms |
| Idiomas soportados | no disponible |
| Licencia | MIT (contenedor); modelo base con sus propias condiciones |
| Formato de pesos | safetensors (141 shards, 390,5 GB + 1 shard MTP de 9,3 GB) |
| Tamano del repositorio | 429,3 GB |
| Modelo base | zai-org/GLM-5.2 (FP8) |
| Motor de inferencia | colibri v1.5.0 o superior (mínimo funcional v1.3.0) |
| Decodificacion especulativa | Sí, cabeza MTP en int8 (aceptación de draft 39-59%) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 744.000 millones de parámetros totales; la model card no detalla el número de expertos, los parámetros activos por token ni la composición del dataset de entrenamiento. Tampoco se documenta si hubo RLHF, DPO u otras etapas de alineación. Lo que sí se especifica es la arquitectura de cuantización del contenedor: los pesos de los expertos se almacenan en int4 con escalas f32 por grupo de 64 elementos, los embeddings y la lm_head en int8, las normas en f32, y se añade una cabeza MTP independiente en int8.

La innovación técnica central es la cuantización agrupada frente a la per-row. Con escalas por fila, un valor atípico degrada la precisión de toda la fila; con escalas por grupo de 64, el coste es aproximadamente un 12% más de disco pero la calidad medida mejora (hellaswag acc_norm 87,0% frente a 83,5%, n=200). El mismo efecto se observa en la fiabilidad de parada: en la matriz de intercambio de contenedores con 5 celdas de muestreo y prompts fijos, el per-row generó bucles de razonamiento que agotaban el presupuesto de tokens sin emitir EOS, mientras que este contenedor paró limpiamente en las 5, incluida la configuración TEMP=0.9 NUCLEUS=0.95. La cabeza MTP en int8 es otro detalle relevante: según el autor, las cabezas MTP en int4 dan una aceptación de draft cercana al 0%, mientras que int8 mide entre el 39% y el 59%.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base GLM-5.2.
- Decodificación especulativa mediante cabeza MTP en int8, con tasas de aceptación del 39-59%.
- Parada fiable de la generación (emisión de EOS) incluso con temperaturas y núcleos de muestreo agresivos, según la validación del autor.
- Ejecución en streaming desde NVMe con caché de expertos, pensada para hosts con poca VRAM.
- Compatibilidad con el motor colibri en modo servido (COLI_CUDA_ATTN), con kernel de atención ragged corregido en v1.3.0.
- Capacidades de tool calling, agentes, visión o audio: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de un MoE de 744B en hardware de gama consumer: el contenedor está diseñado para streaming desde NVMe con una tarjeta de 16 GB, donde el autor mide que el hermano E8 es un 22-33% más rápido por la mayor tasa de residencia de expertos (97,4% frente a 93,5%). Este contenedor es la opción cuando los expertos ya residen en memoria.
- Despliegue en servidor multi-GPU con expertos residentes: en una configuración de 6×RTX 5090, el autor midió este contenedor como referencia frente al E8, que resultó una regresión en decodificación (expert-matmul de 24,1 s frente a 20,9 s). Adecuado para servir cargas sostenidas donde no hay lecturas de disco.
- Generación de texto con muestreo agresivo: la validación de parada en TEMP=0.9 y NUCLEUS=0.95 lo hace apto para pipelines que necesitan diversidad sin riesgo de bucles infinitos que agoten el presupuesto de tokens.
- Validación y benchmarking de motores de inferencia: al estar validado token-exact contra el oráculo de transformers (32/32), sirve como referencia para verificar implementaciones de kernels CUDA, escalas agrupadas y decodificación especulativa.
- Investigación sobre cuantización: la comparación documentada entre int4 agrupado y per-row (calidad y fiabilidad de parada) lo convierte en material útil para estudiar el impacto de las escalas en modelos MoE grandes.
- Reproducción de fallos conocidos: el autor lo documenta como la corrección del fallo de bucle de razonamiento y EOS-starvation (colibri #455), útil para equipos que depuran comportamientos similares en otros contenedores.

## Benchmarks y rendimiento

| Benchmark | Este contenedor (int4 g64) | int4 per-row | Notas |
|---|---|---|---|
| hellaswag acc_norm | 87,0% | 83,5% | n=200, A/B en colibri #326 |
| Parada limpia (5 celdas de muestreo) | 5/5 | bucles sin EOS | Matriz de intercambio colibri #455 |
| Validación token-exact vs transformers | 32/32 | no disponible | Oráculo de transformers |
| Aceptación de draft MTP | 39-59% | ~0% (MTP int4) | Cabeza MTP int8 frente a int4 |
| expert-matmul (6×RTX 5090) | 20,9 s | no disponible | Frente a 24,1 s del E8 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Espacio en disco: 429,3 GB para el repositorio completo (390,5 GB de expertos en 141 shards más 9,3 GB de cabeza MTP).
- VRAM: no se especifica un mínimo oficial; el autor cita funcionamiento en una tarjeta de 16 GB mediante streaming desde NVMe, y un caso de 6×RTX 5090 con expertos residentes.
- GPU recomendadas: RTX 5090 en configuraciones múltiples para expertos residentes; tarjetas de 16 GB para streaming. No hay datos para A100 o H100 en la información proporcionada.
- Cabe en GPU consumer: sí, con streaming desde NVMe; el rendimiento depende de la tasa de acierto de la caché de expertos.
- Motor de despliegue: colibri v1.5.0 o superior obligatorio por seguridad; mínimo funcional v1.3.0. No es compatible con vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- Latencia y throughput: el autor reporta expert-matmul de 20,9 s en 6×RTX 5090 y una mejora del 22-33% del E8 frente a este contenedor en una tarjeta de 16 GB con streaming; no hay cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este contenedor | 744B MoE | no disponible | int4 g64 + int8 MTP | 429,3 GB | MIT | Referencia grouped-int4 en colibri |
| GLM-5.2-colibri-E8-IQ3-with-int8-mtp | 744B MoE | no disponible | 3,06 bpw E8/IQ3 + int8 MTP | 289 GB | no disponible | 22-33% más rápido con streaming en 16 GB; regresión con expertos residentes |
| GLM-5.2 (base, zai-org) | 744B MoE | no disponible | FP8 | no disponible | condiciones del modelo base | Padre oficial del que se convierte este contenedor |

## Limitaciones y advertencias

- Requiere colibri v1.5.0 o superior: dos avisos de seguridad de esa versión afectan al cargador de modelos (tokenizer.json manipulado y cabecera safetensors no validada) y provocan escrituras fuera de límites en el heap antes de la inferencia.
- En versiones anteriores a v1.3.0 no debe activarse COLI_CUDA_ATTN=1: el kernel de atención ragged aplicaba escalas per-row a escalas de grupo y producía texto fluido que colapsaba.
- Con builds previos al commit c98e5f8 el motor no carga fmt=4, cae silenciosamente a CPU o, con CUDA_DENSE=1, genera basura.
- El contenedor solo funciona con el motor colibri; no es un checkpoint portable a transformers, vLLM o llama.cpp.
- El autor reconoce explícitamente el problema de confianza: es un contenedor de terceros descargado de Hugging Face y no se puede verificar desde fuera que no sea hostil, aunque afirma haberlo convertido él mismo desde el padre FP8 oficial.
- La model card no documenta sesgos, tasas de alucinación, cobertura idiomática ni parámetros activos; estos datos deben consultarse en la documentación del modelo base.
- La licencia MIT del contenedor no sustituye las condiciones del modelo base GLM-5.2 de zai-org, que deben revisarse para uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin validación independiente más allá de la reportada por el autor y los issues de colibri citados.

## Enlaces

- Hugging Face del contenedor: https://huggingface.co/lipqil/GLM-5.2-colibri-int4-g64-with-int8-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Hermano E8/IQ3: https://huggingface.co/mastouri/GLM-5.2-colibri-E8-IQ3-with-int8-mtp
- Motor colibri: https://github.com/JustVugg/colibri
- Issue de comparativa y mediciones: https://github.com/JustVugg/colibri/issues/452
- Comentario con metodología: https://github.com/JustVugg/colibri/issues/452#issuecomment-5155461138
- Avisos de seguridad: https://github.com/JustVugg/colibri/security/advisories
- GHSA-wc4x-3786-cxh7: https://github.com/JustVugg/colibri/security/advisories/GHSA-wc4x-3786-cxh7
- GHSA-4gw4-j89j-4c8r: https://github.com/JustVugg/colibri/security/advisories/GHSA-4gw4-j89j-4c8r
