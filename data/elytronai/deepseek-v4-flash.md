# ElytronAI/DeepSeek-v4-Flash

## Resumen

ElytronAI/DeepSeek-v4-Flash es una reempaquetado del modelo DeepSeek-v4-Flash-Vision-Exp publicado por el usuario ElytronAI dentro del ecosistema de inferencia "pulsar". No es un modelo entrenado desde cero: se trata de una reconstruccion a precision de origen de los pesos de deepseek-ai/DeepSeek-V4-Flash-Vision-Exp (revision 6821d6ad3681a4b137b066b76094fa82ebd0a380), con los expertos enrutados reempaquetados en el layout cutlass_mxfp4 y las proyecciones densas y de atencion en mxfp8_lt. El objetivo es ofrecer un artefacto cargable por el motor pulsar con los pesos de expertos byte a byte identicos a los del checkpoint original.

El modelo base pertenece a la familia DeepSeek V4 Flash, una arquitectura de mezcla de expertos (MoE) orientada a codigo, uso de herramientas y flujos agenticos, con atencion hibrida CSA+HCA, hiper-conexiones restringidas por variedad (manifold-constrained hyper-connections) y hasta tres modos de razonamiento (Non-think, Think High, Think Max) segun la documentacion de recetas de vLLM. El pipeline declarado en HuggingFace es image-text-to-text, lo que confirma que el checkpoint subyacente incorpora capacidades de vision.

Su relevancia es fundamentalmente de infraestructura: el artefacto ocupa 167,979 GB y esta pensado para montajes de doble unidad Nvidia GB10 (dos equipos Spark), ya que no cabe en un unico GB10. La variante de 2 bits de la misma familia (DeepSeek-v4-Flash-IQ2, ~92 GB) es la que el autor recomienda para un unico Spark. El modelo solo puede ejecutarse con la libreria pulsar; los cargadores estandar no pueden interpretar los blobs U8 ni los layouts fusionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atencion hibrida CSA+HCA e hiper-conexiones manifold-constrained (informacion de la familia V4; el artefacto no redefine la arquitectura) |
| Parametros totales | no disponible para este artefacto; la familia DeepSeek-V4-Flash-0731 se reporta con 284B (fuente: LM Studio, no confirmado para este checkpoint) |
| Parametros activos | no disponible para este artefacto; 13B activos reportados para DeepSeek-V4-Flash-0731 |
| Longitud de contexto | no disponible para este artefacto; 1M tokens reportados para DeepSeek-V4-Flash-0731 |
| Tipos de cuantizacion | cutlass_mxfp4 (E2M1 + escalas E8M0 grupo 32) en expertos enrutados; mxfp8_lt (E4M3 con escala E8M0 grupo 32) en atencion, densas y shared experts; fp8_e4m3_soa_k en una proyeccion de cabeza del drafter; BF16/F32/I32 nativos en normas, router, embeddings e hiper-conexiones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con layout personalizado pulsar-safetensors (blobs U8 planos, alineacion de 32 bytes, metadatos autodescriptivos por shard) |

## Arquitectura y entrenamiento

El artefacto no documenta entrenamiento propio: es una reconstruccion de pesos del checkpoint upstream DeepSeek-V4-Flash-Vision-Exp. La familia V4 Flash emplea una arquitectura MoE con atencion hibrida CSA+HCA y manifold-constrained hyper-connections, segun la receta de vLLM. Este repositorio concreto contiene 43 capas de expertos enrutados con 256 expertos cada una (11.008 expertos enrutados) mas 3 capas de drafter con 256 expertos cada una (768), lo que suma 138 proyecciones de expertos enrutados.

La innovacion tecnica del empaquetado reside en el layout: los expertos principales y del drafter se almacenan en cutlass_mxfp4, repackados desde los propios bytes FP4 del checkpoint original, con los datos E2M1 seguidos de una tesela de escalas E8M0 grupo 32 con swizzle CUTLASS (SFB). Las proyecciones de atencion, densas y de shared experts usan mxfp8_lt (E4M3 desentrelazado mas escala E8M0 grupo 32), y una proyeccion de cabeza del drafter usa fp8_e4m3_soa_k con plano de escalas E8M0 y plano de carga E4M3. Los tensores de cada proyeccion de expertos se escriben consecutivamente sin relleno interexperto, de modo que un kernel puede direccionarlos como base + xid * expert_bytes desde un unico puntero. Segun la verificacion del autor, el payload de expertos es identico byte a byte al original (157.437.394.944 B en ambos casos) y solo cambia el plano de escalas densas, con 83.326 de 6.304.038.912 elementos densos distintos y un delta maximo de 1,5e-5.

## Capacidades

- Generacion de texto y razonamiento en tres niveles declarados para la familia V4 Flash: Non-think, Think High y Think Max.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que implica entrada multimodal en el checkpoint base.
- Codigo, uso de herramientas y flujos agenticos, que son los casos de uso objetivo declarados para la familia V4 Flash.
- Decodificacion especulativa integrada: el checkpoint incluye un modulo drafter con 3 capas de 256 expertos y una cabeza adicional, orientado a acelerar la generacion.
- Soporte de tool calling y function calling inferido del proposito declarado de la familia (no verificado en este artefacto).
- Contexto de hasta 1M tokens segun la ficha de DeepSeek-V4-Flash-0731 (no confirmado para este checkpoint).
- Capacidades multilingues: no disponible.

## Casos de uso

- Ejecucion local de un modelo MoE de gran tamano en un montaje de doble Spark: el artefacto es el unico miembro "unqualified" de la familia y esta disenado para repartirse entre dos unidades GB10, de modo que un equipo de laboratorio puede servir un modelo de ~168 GB sin depender de API externa.
- Investigacion sobre formatos de cuantizacion: dado que los expertos se conservan como permutacion exacta de los bytes FP4 originales, sirve para estudiar el impacto del layout cutlass_mxfp4 y del swizzle de escalas E8M0 frente a otros empaquetados, con un delta denso medido de 1,5e-5.
- Desarrollo de kernels y motores de inferencia: los metadatos autodescriptivos por shard (pulsar.tensors, pulsar.experts, pulsar.kv_arch) y el direccionamiento contiguo por experto permiten escribir kernels que resuelvan expertos con una sola aritmetica de punteros, util para validar implementaciones de MoE.
- Auditoria de integridad de checkpoints: el Build Record y las comprobaciones descritas (48 shards, 36.909 tensores, index cerrado en ambos sentidos, alineacion de 32 B) permiten reproducir un pipeline de verificacion de artefactos cuantizados.
- Flujos agenticos con decodificacion especulativa: el modulo drafter incluido en el checkpoint hace viable medir la ganancia de aceptacion de tokens en tareas de agente de varios pasos sobre el motor pulsar.
- Analisis comparativo de variantes de precision: al existir DeepSeek-v4-Flash-IQ2 (~92 GB) y variantes -Mix, el mismo caso de uso permite comparar fidelidad frente a huella de memoria usando una sola base de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto solo documenta verificaciones de integridad (recuento de shards, tensores, alineacion, identidad byte a byte de expertos y delta de elementos densos), no metricas de calidad como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Peso de los pesos: 167,979 GB en total (157,437 GB de payload de expertos mas 10,529 GB del resto). La inferencia requiere ademas memoria para cache KV, activaciones y buffers del motor, por lo que el requisito real supera ampliamente los 168 GB.
- Montaje objetivo: dos unidades Nvidia GB10 (dos equipos Spark) segun el propio autor. No cabe en un unico GB10.
- Alternativa de una sola unidad: la variante de 2 bits DeepSeek-v4-Flash-IQ2 (~92 GB) es la recomendada por el autor para un unico Spark.
- GPU recomendadas: no disponible. La model card solo cita GB10 como plataforma de referencia.
- Cabe en GPU de consumo: no disponible. El tamano del artefacto (168 GB) descarta su ejecucion en GPUs de consumo convencionales.
- Opciones de despliegue: exclusivamente la libreria pulsar. transformers estandar y vLLM no pueden cargarlo, ya que no disponen de decodificador para los layouts fusionados y los blobs U8 carecen de significado sin los metadatos. El campo quantization_config.quant_method vale pulsar-safetensors para forzar un fallo explicito en cargadores estandar. No hay soporte declarado de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Licencia | Motor de inferencia |
|---|---|---|---|---|---|
| ElytronAI/DeepSeek-v4-Flash (este artefacto) | no disponible; familia reportada en 284B con 13B activos | no disponible; 1M reportado para la familia | mxfp4/mxfp8, 167,979 GB | MIT | solo pulsar |
| DeepSeek-v4-Flash-IQ2 | misma familia | no disponible | ~92 GB, incluye tensor iq2_xxs_mmq_k | no disponible | no disponible |
| deepseek-ai/DeepSeek-V4-Flash-0731 | 284B MoE, 13B activos (LM Studio) | 1M tokens (LM Studio) | pesos oficiales | no disponible | vLLM y otros (segun recetas) |
| deepseek-ai/DeepSeek-V4-Flash-Vision-Exp | no disponible | no disponible | precision de origen FP4/FP8 | no disponible | no disponible |

La comparativa directa de rendimiento no es posible porque no se han publicado benchmarks del artefacto de ElytronAI ni, en la informacion disponible, cifras comparables entre estas variantes.

## Limitaciones y advertencias

- Dependencia total del motor pulsar: sin el no se puede ni leer el checkpoint. Esto excluye despliegues estandar sobre vLLM, transformers, TGI o llama.cpp y ata el artefacto a un unico runtime.
- La model card no documenta sesgos, datos de entrenamiento, composicion del dataset ni proceso de alineacion, porque no es un modelo entrenado sino un reempaquetado. Cualquier sesgo heredado proviene del checkpoint upstream y no se analiza aqui.
- Riesgo de alucinacion: no evaluado. No hay benchmarks de fidelidad ni de tasas de alucinacion en la informacion disponible.
- Idiomas soportados: no disponible. No se puede confirmar cobertura multilingue ni calidad por idioma.
- Contexto: el valor de 1M tokens corresponde a DeepSeek-V4-Flash-0731 y no esta confirmado para este checkpoint (Vision-Exp). Debe validarse por separado antes de disenar aplicaciones de contexto largo.
- Parametros: la cifra de 284B totales y 13B activos procede de una ficha de LM Studio referida a la version 0731, no a este artefacto. No debe tratarse como especificacion verificada.
- Licencia MIT declarada en HuggingFace, lo que en principio permite uso comercial, pero el artefacto solo es utilizable con pulsar; conviene revisar los terminos del motor antes de un despliegue en produccion.
- Huella de memoria: 167,979 GB de pesos obligan a hardware poco habitual (dos GB10) y descartan maquinas de un solo acelerador de gama consumer.
- El repositorio figura con 0.0 GB de tamano, 0 descargas y 0 likes en HuggingFace, lo que contrasta con los 167,979 GB descritos en la model card. Es un indicio de que los ficheros LFS pueden no estar subidos o estar en acceso restringido; conviene verificar la disponibilidad real de los 48 shards antes de planificar un despliegue.
- Arquitectura multimodal: al declararse image-text-to-text, las limitaciones de vision (resolucion, sesgos visuales) no estan documentadas.

## Enlaces

- HuggingFace del artefacto: https://huggingface.co/ElytronAI/DeepSeek-v4-Flash
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- DeepSeek-V4-Flash (oficial): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- DeepSeek-V4-Flash-0731 (oficial): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Informe tecnico DeepSeek-V4-Flash-0731 en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
- Ficha en LM Studio: https://lmstudio.ai/models/deepseek-v4-flash
- Receta vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash
