# rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-VectorCut-GGUF es una distribucion cuantizada en formato GGUF de un modelo multimodal de tipo image-text-to-text derivado de Qwen3.8-27B. Lo publica rarevector (Rare Vector Labs) mediante su pipeline denominado "VectorCut", que aplica una ablacion quirurgica orientada a eliminar rechazos (refusals) sin degradar el resto de capacidades del modelo. El resultado es un modelo de 27.320.697.856 parametros (~27,3B) que conserva el encoder de vision y los tensores de decodificacion especulativa (MTP) intactos.

La propuesta tecnica diferencial es la preservacion bit a bit de los componentes criticos: segun la model card, 1.094 de 1.199 tensores permanecen identicos al modelo original, incluidos los 333 tensores de vision, los 15 tensores MTP, los embeddings y el LM head. Solo se modifican 105 tensores de las proyecciones gated-MLP, frente al enfoque de abliteracion global que altera el residual stream en todos los bloques.

El repositorio incluye cuantizaciones Q8_0, Q6_K y Q4_K_M junto con el proyector visual mmproj-BF16.gguf, lo que permite inferencia multimodal directa en llama.cpp, LM Studio y Ollama. Esta pensado para desarrolladores que necesitan un VLM de ~27B sin filtros de rechazo y con la vision y la velocidad de decodificacion especulativa preservadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM), base Qwen3.8-27B, con encoder de vision y decodificacion especulativa MTP |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M (GGUF); proyector visual mmproj-BF16.gguf |
| Idiomas soportados | multilingual, en, zh, ja, ko, pt, ru, ar, fr, de, es |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | GGUF (repo de 69,4 GB); maestro BF16 en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B (Apache 2.0) y de la variante ukisai/Swift-1.5-Qwen3.8-27b (Swift Open License v1.0). La arquitectura es un transformer multimodal con encoder de vision (tensores `visual.*`) y un mecanismo de decodificacion especulativa denominado MTP (multi-token prediction), del que se preservan los 15 tensores asociados. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica es el pipeline VectorCut: en lugar de aplicar abliteracion global sobre el residual stream de todos los bloques, la intervencion se limita a las proyecciones gated-MLP (105 tensores modificados). Segun la model card, se ejecuto una auditoria de checksums SHA-256 byte a byte contra los shards safetensors del modelo original, con el resultado de 1.199 tensores totales, 105 modificados, 333/333 tensores de vision identicos, 15/15 tensores MTP identicos y 0 cambios en componentes protegidos (attention, layer norms, embeddings, LM head).

## Capacidades

- Generacion de texto conversacional multi-turno en un modelo de ~27,3B parametros.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.8-27B.
- Vision: pipeline image-text-to-text con encoder visual preservado al 100% (333/333 tensores identicos).
- Decodificacion especulativa MTP preservada, orientada a mejorar la velocidad de generacion.
- Capacidades multilingues: ingles, chino, japones, coreano, portugues, ruso, arabe, frances, aleman y espanol.
- Modelo "uncensored": ablacion de rechazos orientada a reducir respuestas de negativa.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos con imagenes: el modelo puede procesar capturas, diagramas o documentos escaneados junto con texto gracias al encoder de vision intacto, util para extraccion de datos en pipelines de digitalizacion.
- Asistencia conversacional sin filtros de rechazo: adecuado para entornos de investigacion donde se necesita estudiar el comportamiento del modelo ante peticiones que un modelo alineado rechazaria, manteniendo el razonamiento intacto.
- Generacion de codigo en produccion: al conservar las capacidades del base Qwen3.8-27B, puede integrarse en flujos de autocompletado y revision de codigo; la cuantizacion Q4_K_M permite desplegarlo en hardware mas modesto.
- Inferencia multimodal local: con los GGUF y el proyector mmproj-BF16 se puede ejecutar en llama.cpp, LM Studio u Ollama en estaciones de trabajo, sin depender de API externa.
- Investigacion sobre alineacion y abliteracion: la auditoria SHA-256 documentada permite comparar el efecto de una ablacion localizada frente a la abliteracion global en tareas de razonamiento y vision.
- Atencion al cliente multilingue: soporta diez idiomas, lo que permite atender usuarios en espanol, ingles, chino, japones, arabe, entre otros, en un unico despliegue.
- Procesamiento de imagenes medicas o tecnicas en investigacion: el encoder visual preservado permite tareas de descripcion y analisis de imagenes sin la degradacion tipica de builds uncensored que descartan la vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (27,3B parametros): Q8_0 ~29 GB, Q6_K ~22 GB, Q4_K_M ~16-17 GB, mas el proyector visual BF16.
- GPU recomendadas: no especificadas por el autor. Por tamano, un modelo de ~27B en Q4_K_M encaja en GPUs de 24 GB (RTX 4090, A10G, L4); Q8_0 requiere 32 GB o mas (A100 40 GB, H100, RTX 6000 Ada).
- Cabe en consumer GPU: si, en Q4_K_M y Q6_K en GPUs de 24 GB; Q8_0 requiere GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama (segun la model card). Otros motores como vLLM o TGI no se mencionan para este formato GGUF.
- Latencia y throughput estimados: no disponibles. La preservacion de los tensores MTP sugiere soporte de decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-VectorCut-GGUF | ~27,3B | no disponible | Si (encoder preservado) | swift-open-license-1.0 | GGUF |
| Qwen3.8-27B (upstream) | ~27B (segun nombre) | no disponible | no disponible | Apache 2.0 | safetensors |
| ukisai/Swift-1.5-Qwen3.8-27b | no disponible | no disponible | no disponible | Swift Open License v1.0 | safetensors |
| rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-BF16 | ~27,3B | no disponible | Si | swift-open-license-1.0 | safetensors (BF16) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": la ablacion de rechazos implica que puede generar contenido que otros modelos bloquean; requiere supervision y politicas de uso en produccion.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad ni benchmarks que cuantifiquen el impacto de la ablacion en la precision.
- La ablacion modifica 105 tensores gated-MLP; aunque se preservan attention, layer norms, embeddings y LM head, no se aportan datos empiricos sobre posibles efectos secundarios en tareas especificas.
- Licencia swift-open-license-1.0: es una licencia "other" derivada de la Swift Open License v1.0; es necesario revisar los archivos LICENSE y NOTICE para conocer las restricciones de uso comercial, que no se detallan en la informacion disponible.
- El modelo base Qwen3.8-27B esta bajo Apache 2.0, pero la cadena de derivacion anade la licencia Swift, lo que puede imponer condiciones adicionales.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni reportes independientes de calidad.
- Solo se ofrecen cuantizaciones GGUF; para entrenamiento o fine-tuning seria necesario el maestro BF16.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-GGUF
- Modelo base BF16: https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-BF16
- Modelo original ukisai: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo upstream Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Organizacion Rare Vector: https://huggingface.co/RareVector
- Apoyo al proyecto: https://ko-fi.com/rarevector
