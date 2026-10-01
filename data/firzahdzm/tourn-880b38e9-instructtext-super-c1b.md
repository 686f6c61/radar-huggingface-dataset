# firzahdzm/tourn-880b38e9-instructtext-super-c1b

## Resumen

El modelo firzahdzm/tourn-880b38e9-instructtext-super-c1b es un checkpoint de la familia Phi-3 publicado en HuggingFace por el usuario firzahdzm. Se trata de un modelo con arquitectura phi3 que requiere codigo personalizado (custom_code) para su carga, etiquetado como InstructText, lo que sugiere un ajuste fino orientado a seguir instrucciones sobre una base preentrenada de tipo texto. Cuenta con 3.821.079.552 parametros totales, es decir, aproximadamente 3,8 mil millones, lo que lo situa en el segmento de modelos pequenos aptos para inferencia en hardware de consumo.

El repositorio ocupa 7,6 GB y los pesos estan en formato safetensors, un tamano coherente con un almacenamiento en precision BF16 o FP16 para esa cantidad de parametros. La ficha del modelo no incluye model card, ni pipeline declarado, ni licencia, ni idiomas soportados, y las cifras de adopcion son muy bajas (10 descargas y 0 likes), lo que indica que se trata de un experimento o un artefacto derivado de un pipeline automatizado mas que de un lanzamiento consolidado.

Su relevancia actual es limitada, pero resulta interesante como caso de estudio de fine-tuning sobre arquitectura Phi-3: el nombre del identificador (tourn-880b38e9-instructtext-super-c1b) apunta a un proceso de entrenamiento iterativo o por rondas. Dado que no hay documentacion publica, cualquier evaluacion seria requiere inspeccionar directamente los archivos del repositorio y el codigo personalizado asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | phi3 (transformer decoder-only, segun tag del repositorio) |
| Parametros totales | 3.821.079.552 (aprox. 3,8B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados parecen estar en BF16/FP16 por el tamano del repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Requiere codigo personalizado | si (tag custom_code) |
| Tamano del repositorio | 7,6 GB |

## Arquitectura y entrenamiento

El unico dato estructural fiable es el tag phi3, que asocia el modelo a la arquitectura de la familia Phi-3 de Microsoft: un transformer decoder-only denso, sin mezcla de expertos, que en su version de referencia usa atencion con RoPE, normalizacion RMSNorm y capas MLP con activacion SwiGLU. El tag custom_code indica que la carga no se realiza con una configuracion estandar de Transformers, sino que depende de codigo incluido en el propio repositorio; esto obliga a revisar y auditar los scripts antes de ejecutar el modelo, ya que pueden contener dependencias no verificadas.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. El sufijo instructtext sugiere un ajuste supervisado orientado a instrucciones sobre texto plano, pero no se puede confirmar el procedimiento ni el volumen de datos empleados. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion u otras).

## Capacidades

- Generacion de texto condicionada por instrucciones: el sufijo instructtext apunta a un ajuste para seguir instrucciones, aunque no hay evaluacion publica que lo confirme.
- Razonamiento y conocimiento general: presumible por la base Phi-3, sin datos verificables.
- Generacion de codigo: no disponible.
- Matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

No se puede confirmar ninguna capacidad concreta mas alla de la generacion de texto, porque la model card esta vacia y no existen evaluaciones publicadas.

## Casos de uso

- Experimentacion academica con fine-tuning sobre arquitectura Phi-3: el modelo sirve como punto de partida o material de comparacion en estudios sobre ajuste de instrucciones, dado su tamano reducido de 3,8B parametros.
- Pruebas de integracion de codigo personalizado: resulta util para validar flujos de carga de modelos con custom_code en HuggingFace Transformers y detectar problemas de compatibilidad de versiones.
- Evaluacion de calidad de checkpoints no documentados: sirve como caso practico para disenar protocolos de auditoria de repositorios sin model card (inspeccion de pesos, tokenizer y configuracion).
- Prototipado local en hardware modesto: sus 3,8B parametros permiten desplegarlo en una GPU de consumo para pruebas de generacion de texto de baja latencia.
- Benchmarking interno de modelos pequenos: util como referencia adicional en comparativas propias frente a Phi-3 mini, Llama 3.2 3B o Qwen2.5 3B.
- Reproducibilidad y trazabilidad de pipelines automaticos: el identificador con hash sugiere una generacion automatizada, por lo que puede emplearse para auditar la calidad de este tipo de flujos.

No se recomienda su uso en produccion con clientes reales sin una evaluacion previa, dado que no hay licencia declarada ni resultados de calidad publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 8 GB para los pesos, mas overhead de activaciones y cache KV, lo que situa el consumo practico entre 9 y 12 GB segun la longitud de contexto.
- VRAM estimada en INT8: aproximadamente 4-5 GB de pesos.
- VRAM estimada en INT4: aproximadamente 2,5-3,5 GB de pesos.
- GPU recomendadas: cualquier GPU con 12 GB o mas de VRAM resulta suficiente en BF16 (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4). Para INT4 basta con 6-8 GB.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. En 8 GB solo con cuantizacion INT4.
- Opciones de despliegue: no confirmadas. Al requerir custom_code, la compatibilidad con vLLM, TGI, llama.cpp u Ollama no esta garantizada y debe verificarse manualmente. La ruta mas segura es Transformers con trust_remote_code.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| firzahdzm/tourn-880b38e9-instructtext-super-c1b | 3,8B | no disponible | no disponible | HuggingFace, 10 descargas |
| Microsoft Phi-3 mini | 3,8B | 4k / 128k segun variante | MIT | Ampliamente disponible |
| Meta Llama 3.2 3B Instruct | 3,2B | 128k | Llama 3.2 Community License | Ampliamente disponible |
| Qwen2.5 3B Instruct | 3,1B | 32k | Apache 2.0 / Qwen segun variante | Ampliamente disponible |

La comparacion es limitada porque el modelo objeto de la ficha no declara licencia, contexto ni resultados de evaluacion. Los modelos alternativos citados cuentan con documentacion publica y benchmarks reproducibles, por lo que en cualquier seleccion para produccion parten con una ventaja clara en trazabilidad y soporte.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos ni proceso de alineacion.
- Licencia no declarada: no se puede asumir uso comercial permitido; el uso en produccion conlleva riesgo legal.
- Riesgo de alucinacion: desconocido, pero al no existir evaluaciones no hay garantia de fidelidad factual.
- Idiomas soportados sin especificar: se desconoce si el modelo funciona correctamente en castellano.
- Dependencia de custom_code: la carga requiere trust_remote_code, lo que implica ejecutar codigo de un autor no verificado; debe auditarse antes de su uso.
- Adopcion practicamente nula (10 descargas, 0 likes): no hay comunidad que haya validado el checkpoint ni reportado fallos.
- Fecha de creacion y actualizacion muy proximas (el mismo dia): sugiere un artefacto generado de forma automatica sin curacion posterior.
- Sin garantia de compatibilidad con herramientas estandar de inferencia (vLLM, llama.cpp, Ollama) al no poder confirmarse el formato exacto del custom_code.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/firzahdzm/tourn-880b38e9-instructtext-super-c1b
- Repositorio relacionado del mismo autor: https://huggingface.co/firzahdzm/tourn-28c9f3bb-instructtext-super-t2pre
- Repositorio relacionado del mismo autor: https://huggingface.co/firzahdzm/tourn-067761fe-instructtext-super-s2dpre

No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo en la busqueda web realizada.
