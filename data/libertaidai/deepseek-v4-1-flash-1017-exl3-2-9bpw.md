# LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw es una cuantización EXL3 del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017 (licencia MIT), publicada por LibertAIDAI. Se trata de un transformer de mezcla de expertos (MoE) con 384 expertos enrutados por capa más expertos compartidos, torre de visión en BF16 y un módulo Engram de tablas de lookup n-gram en las capas 1 y 14. El checkpoint ocupa 210,7 GB (196,3 GiB) repartidos en 43 shards de safetensors y aplica un esquema de bits por peso variable: 2-3 bpw en los expertos enrutados, 4-5 bpw en atención y experto compartido, 6 bpw en la cabeza de salida.

Su interés práctico es que reduce el peso del tronco a una media de 2,90 bpw con una degradación de perplejidad medida de +1,8 % en código y +0,4 % en prosa respecto al modelo sin cuantizar, manteniendo intactos la torre de visión, el drafter especulativo MTP/DSpark y todos los componentes auxiliares en BF16/FP16/FP32. Además, reproduce tensor a tensor el layout de Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw, de modo que es compatible sin cambios con el kit de serving vLLM para 2x DGX Spark publicado por MiaAI-Lab.

La contrapartida es que el repositorio está incompleto por diseño: las dos tablas Engram (~95 GiB cada una en FP8) no se incluyen y deben descargarse del checkpoint base 1017 (no de la versión anterior). Con 0 descargas y 14 likes en el momento de la consulta, es un artefacto reciente y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (compresor de KV + indexador), módulo Engram de lookup n-gram, torre de visión y drafter especulativo MTP/DSpark |
| Parametros totales | 105.318.449.362 (~105,3 B), según metadatos de safetensors |
| Parametros activos | no disponible (MoE con 384 expertos enrutados por capa y expertos compartidos; no se publica el número de expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis, codebook `mul1`, escalas de canal de salida en modo `always`; 2,90 bpw de media (expertos enrutados 3 bpw, capas 18-22 a 2 bpw; experto compartido 4-5 bpw; atención 5-6 bpw; cabeza de salida 6 bpw). Componentes sin cuantizar: embedding en BF16, router en FP16/FP32, normas en BF16, sinks de atención y streams mHC en FP32, torre de visión y aligner en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3 trellis int16 + `suh`/`svh` fp16 + `mul1` int32), 43 shards, 210,7 GB (196,3 GiB) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Componentes excluidos del repo | Tablas Engram `layers.1.engram.embed` y `layers.14.engram.embed` (shards 47 y 48 del repo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 384 matrices de expertos enrutados por capa (`ffn.experts.E.w1/w2/w3`, 1.152 matrices por capa) más un experto compartido. La atención incorpora dos mecanismos diferenciados: un compresor de KV (`attn.compressor.wkv`/`wgate`) en las capas 2, 8, 14 y 20, y un indexador (`attn.indexer.wq_b` en las capas 2, 8, 14, 20, 24, 28, 32 y 36, con `indexer.wk` en 2, 8, 14 y 20), lo que apunta a un esquema de atención dispersa con selección de tokens. La proyección de salida de atención (`wo_a`) se almacena en 8 slices por grupo. Se añaden streams mHC (`hc_attn_*`, `hc_ffn_*`) y sinks de atención en FP32.

La innovación más singular de la familia V4.1 es el módulo Engram: dos tablas de lookup n-gram (`layers.1.engram.embed` y `layers.14.engram.embed`) en FP8 con escalas de bloque E8M0, de ~95 GiB cada una, que se consultan sin cuantizar desde el checkpoint base. La model card documenta una prueba de sanidad: con Engram desactivado la perplejidad se dispara de 1,9094 a 4,1648 en código y de 6,4520 a 9,0627 en prosa, lo que confirma que las tablas son un componente funcional crítico y no un accesorio. El modelo incluye además un drafter MTP/DSpark de tres bloques (`mtp.0-2`) con expertos enrutados propios, `markov_head` y `confidence_head`, destinado a decodificación especulativa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base. Esta ficha describe una cuantización, no un entrenamiento: el proceso aplicado es post-entrenamiento, con asignación de bits por grupo de tensores y verificación de perplejidad sobre dos conjuntos held-out de texto no publicado (32 secuencias de 2.048 tokens, 65.504 tokens puntuados por conjunto).

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`) sobre un tronco MoE de gran escala.
- Procesamiento de imagen: la torre de visión y el aligner se copian sin cambios del checkpoint base en BF16, y el router incluye `gate.bias_vl`, un sesgo de enrutamiento específico para tokens de imagen.
- Recuperación léxica y factual vía tablas Engram n-gram consultadas en las capas 1 y 14.
- Decodificación especulativa integrada mediante el drafter MTP/DSpark de tres bloques, con cabeza de Markov y cabeza de confianza.
- Atención eficiente con compresor de KV e indexador de tokens, orientada a contextos largos (longitud exacta no disponible).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente en la model card.
- Cobertura multilingüe: no disponible.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Serving de altas prestaciones en clúster propio: el checkpoint está pensado para el kit vLLM de MiaAI-Lab sobre 2x DGX Spark, de modo que un equipo con ese hardware puede desplegar un MoE de gran escala con pesos de 196,3 GiB sin reentrenar ni reconvertir el layout.
- Sustitución del modelo sin cuantizar en pipelines ya existentes: al mantener nombres de tensores, dtypes y bitrates por tensor idénticos a Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw, el kit de serving y su mapa K se reutilizan sin modificar, lo que simplifica migraciones.
- Procesamiento de documentos con imagen: la torre de visión en BF16 permite tareas de extracción y descripción sobre entradas visuales junto con texto en el mismo modelo.
- Investigación sobre cuantización extrema: la tabla de perplejidad comparada (2,9 bpw frente a 3,5 bpw frente a sin cuantizar) sirve para estudiar la curva de degradación en código y prosa con presupuestos de memoria distintos.
- Evaluación de módulos de memoria n-gram: la prueba de sanidad con Engram desactivado convierte este checkpoint en una base controlada para medir la contribución de las tablas de lookup al rendimiento del modelo.
- Experimentos de decodificación especulativa: el drafter MTP/DSpark empaquetado permite medir ganancias de throughput con distintos valores de tokens aceptados por paso.
- Despliegue con requisitos de licencia permisiva: la licencia MIT del modelo base y de esta cuantización facilita la integración en productos comerciales sin obligaciones de atribución de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta perplejidad sobre dos conjuntos held-out de texto no publicado (32 secuencias x 2.048 tokens, 65.504 tokens puntuados por conjunto, forward de secuencia completa):

| Modelo | Tamano | Perplejidad codigo | Perplejidad prosa |
|---|---|---|---|
| Base sin cuantizar (FP8 / MXFP4 dequantizado) | — | 1,8749 | 6,4277 |
| EXL3 2,9 bpw (este repo) | 196,3 GiB | 1,9094 (+1,8 %) | 6,4520 (+0,4 %) |
| EXL3 3,5 bpw (LibertAIDAI) | 239,9 GiB | 1,8895 | 6,4341 |
| Este repo con Engram desactivado (control) | — | 4,1648 | 9,0627 |

## Requisitos de hardware

- Pesos EXL3 del tronco: 196,3 GiB (~211 GB) residentes en memoria. No cabe en ninguna GPU de consumo actual ni en una sola GPU de数据中心 de 80 GB; requiere agregación de memoria entre varios dispositivos o memoria unificada.
- Tablas Engram adicionales: ~95 GiB cada una (190 GiB en total), en FP8 sin cuantizar, descargadas aparte del checkpoint base 1017. La model card no detalla cómo se reparten entre nodos en el kit de referencia, por lo que el footprint agregado no está cuantificado oficialmente.
- GPU recomendadas: el kit documentado por el autor es MiaAI-Lab/DeepSeek-v4.1-Flash-EXL3-2x-DGX-Sparks, es decir, dos nodos NVIDIA DGX Spark con memoria unificada. No se documentan configuraciones alternativas con A100, H100 o H200.
- GPU de consumo: no es viable. Ni siquiera una RTX 4090 (24 GB) ni una RTX 5090 se acercan a los 196,3 GiB del tronco.
- Opciones de despliegue: vLLM a través del kit de MiaAI-Lab (basado en ExLlamaV3 para el kernel EXL3). El formato trellis EXL3 no es compatible con llama.cpp, Ollama ni TGI en el momento de la publicación.
- Latencia y throughput: no disponibles. No se publican métricas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este repo (LibertAIDAI, 2,9 bpw) | 105,3 B declarados | no disponible | EXL3 2,90 bpw medio | 196,3 GiB | MIT | Perplejidad +1,8 % código / +0,4 % prosa; Engram aparte |
| LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-3.5bpw | mismos | no disponible | EXL3 3,5 bpw | 239,9 GiB | MIT | Perplejidad código 1,8895 / prosa 6,4341; +43,6 GiB frente a 2,9 bpw |
| Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw | mismos | no disponible | EXL3 2,90 bpw | no disponible | MIT | Mismo layout tensor a tensor; sirve de referencia para el kit de serving |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | FP8 / MXFP4 | no disponible | MIT | Incluye las tablas Engram y la torre de visión originales |
| LibertAIDAI/DeepSeek-V4.1-Flash-1017-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | MIT | Alternativa de cuantización para hardware NVIDIA con soporte FP4 |

## Limitaciones y advertencias

- Checkpoint incompleto: faltan las dos tablas Engram (`layers.1.engram.embed`, `layers.14.engram.embed`). Sin ellas el modelo no es funcional; la perplejidad se degrada hasta 4,1648 en código con Engram desactivado.
- Riesgo de mezclar versiones: las tablas deben provenir del repo `deepseek-ai/DeepSeek-V4.1-Flash-1017` (shards `model-00047-of-00048.safetensors` y `model-00048-of-00048.safetensors`). Reutilizar los shards de `deepseek-ai/DeepSeek-V4.1-Flash` (sin el sufijo 1017) produce un modelo incorrecto.
- Descarga adicional de ~190 GiB en FP8 más el índice y el `config.json` (necesarios para `engram_layer_ids` y `engram_num_embeddings`), lo que duplica con creces el espacio en disco frente a los 210,7 GB del repo.
- El recuento declarado de 105.318.449.362 parámetros no concuerda con un cálculo directo a partir del tamaño del repo y del bitrate medio (210,7 GB a 2,9 bpw implicaría un número de pesos del orden de cientos de miles de millones). Conviene verificar la cifra contra el `config.json` del modelo base antes de dimensionar hardware.
- Degradación por cuantización: +1,8 % de perplejidad en código es una pérdida pequeña pero medible, y la perplejidad no sustituye a una evaluación en tareas concretas (generación de código ejecutable, matemáticas, seguimiento de instrucciones).
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor de la cuantización. Al heredarse del modelo base, deben asumirse los mismos riesgos que en el checkpoint original, sin que esta ficha pueda cuantificarlos.
- Idiomas soportados no declarados, pese a que el pipeline es de generación de texto multilingüe en la práctica.
- Ecosistema de herramientas reducido: EXL3 trellis requiere ExLlamaV3 o el kit vLLM específico; no hay soporte en llama.cpp, Ollama o TGI.
- Madurez: 0 descargas y 14 likes en el momento de la consulta; no hay validación independiente del checkpoint ni informes de terceros sobre su calidad en producción.
- Licencia MIT en pesos y cuantización, sin restricciones documentadas para uso comercial; aun así, el uso queda sujeto a las condiciones del modelo base y a la normativa aplicable en el dominio de despliegue.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización de referencia con layout idéntico: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw
- Kit de serving vLLM para 2x DGX Spark: https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-EXL3-2x-DGX-Sparks
- Release alternativa EXL3 3,5 bpw: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-3.5bpw
- Release alternativa NVFP4: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-NVFP4
