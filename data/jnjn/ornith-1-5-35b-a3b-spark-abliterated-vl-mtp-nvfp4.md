# jnjn/Ornith-1.5-35B-A3B-Spark-Abliterated-VL-MTP-NVFP4

## Resumen

Ornith-1.5-35B-A3B-Spark-Abliterated-VL-MTP-NVFP4 es un merge de pesos publicado por el usuario jnjn en HuggingFace. Se trata de una fusión de dos derivados de la familia Ornith-1.5: el modelo multimodal cuantizado en NVFP4 de ornith-ai y la variante "abliterated" con borrador DFlash de pottokao. El resultado combina el núcleo de lenguaje abliterado (sin las direcciones de rechazo del alineamiento original), la torre de visión y los cabezales de predicción multi-token (MTP) del modelo de ornith-ai, más un borrador DFlash conservado para decodificación especulativa opcional.

La arquitectura declarada es Qwen3_5MoeForConditionalGeneration, un transformer de mezcla de expertos (MoE) con soporte de visión y pipeline image-text-to-text. El repositorio contiene 94.393 tensores repartidos en 3 shards, con 19.528.501.104 parámetros reales en safetensors (unos 19,5B), pese a que el nombre comercial del modelo indica 35B-A3B. Los pesos están cuantizados en NVFP4 (4 bits mediante modelopt), con los tensores MTP excluidos de la cuantización.

Su relevancia es de nicho: está optimizado explícitamente para ejecutarse en una única NVIDIA DGX Spark con vLLM, con decodificación especulativa MTP y una ventana de contexto configurada de 262.144 tokens. Es un artefacto orientado a despliegue local en hardware Blackwell, no un modelo con evaluación pública de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal Qwen3_5MoeForConditionalGeneration (transformer con mezcla de expertos + torre de vision); los flags de vLLM incluyen cache tipo mamba, lo que apunta a capas hibridas Mamba/atencion |
| Parametros totales | 19.528.501.104 (~19,5B) segun los safetensors del repositorio; el nombre del modelo declara 35B |
| Parametros activos | ~3B segun la nomenclatura A3B del nombre; no confirmado en la informacion disponible |
| Longitud de contexto | 262.144 tokens en la configuracion de despliegue de referencia (--max_model_len 262144); la maxima nativa del modelo base no esta documentada en la informacion disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, modelopt); los tensores MTP se mantienen sin cuantizar (quantization_config.ignore); los tags mencionan tambien 8-bit y Q4 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors, 3 shards, 94.393 tensores, 24,2 GB de repositorio |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento nuevo. La model card detalla la procedencia de cada bloque: el nucleo de lenguaje (LM, lm_head, embeddings y normalizaciones) proviene de pottokao/Ornith-1.5-35B-A3B-abliterated-NVFP4-DFlash, con los nombres de tensor renombrados de `model.*` a `model.language_model.*`; la torre de vision y el merger provienen de ornith-ai/Ornith-1.5-35B-A3B-NVFP4 (`model.visual.*`, 333 tensores); los cabezales de prediccion multi-token (MTP) tambien vienen de ornith-ai (`mtp.*`, 785 tensores); y la configuracion, tokenizer y processor se toman de ornith-ai (variante multimodal Qwen3_5MoeForConditionalGeneration). El borrador DFlash de pottokao se conserva en `dflash_draft/` para decodificacion especulativa opcional.

La innovacion tecnica relevante no esta en el entrenamiento sino en el empaquetado para inferencia: cuantizacion NVFP4 de 4 bits sobre el nucleo MoE, MTP sin cuantizar para no degradar el borrador especulativo, y compatibilidad simultanea con dos mecanismos de decodificacion especulativa (MTP con 3 tokens especulativos en la configuracion de ejemplo, o DFlash mediante `--speculative-config method=dflash`). Los flags `--mamba-cache-mode align` y `--mamba-block-size 8` del ejemplo de despliegue sugieren que el modelo incorpora capas de estado recurrente tipo Mamba junto a la atencion, aunque la model card no describe la proporcion ni el detalle de esas capas.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base recibio RLHF, DPO u otra fase de alineamiento. La componente "abliterated" implica que se eliminaron direcciones de rechazo del modelo original, pero el metodo concreto de abliteracion no se documenta en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado image-text-to-text.
- Procesamiento de imagenes: incluye torre de vision y merger procedentes del modelo multimodal de ornith-ai.
- Razonamiento con modo de pensamiento: el despliegue de referencia activa `--reasoning-parser qwen3`, lo que indica soporte de bloques de razonamiento separados.
- Tool calling / function calling: el ejemplo usa `--tool-call-parser qwen3_coder` y `--enable-auto-tool-choice`, por lo que soporta llamadas a herramientas con el formato de Qwen3 Coder.
- Prediccion multi-token (MTP): cabezales especificos para decodificacion especulativa con 3 tokens especulativos.
- Decodificacion especulativa alternativa mediante borrador DFlash (`method=dflash`).
- Contexto largo: la configuracion de referencia sirve 262.144 tokens con prefix caching habilitado.
- Servicio concurrente: `--max-num-seqs 32` en la configuracion probada.
- Capacidades multilingues: no disponibles; solo se declara ingles.

## Casos de uso

- Asistente conversacional multimodal local: el modelo acepta entradas de imagen y texto y puede mantener conversaciones multi-turno con hasta 262.144 tokens de contexto, lo que permite adjuntar documentos extensos o capturas junto al historial sin truncar.
- Analisis de documentos con imagenes en despliegue on-premise: gracias a la torre de vision y al contexto largo, puede procesar informes escaneados, diagramas o tablas junto con texto de referencia en una misma ventana, sin salida de datos a servicios externos.
- Agentes con herramientas en pipelines internos: con el parser `qwen3_coder` y auto-tool-choice, se integra en flujos de agente que invocan APIs, ejecutan consultas o encadenan pasos multi-turno con razonamiento intermedio.
- Generacion de codigo asistida en local: el modo de razonamiento y el soporte de tool calling permiten usarlo como backend de un asistente de codigo que consulta repositorios o ejecuta tests mediante herramientas.
- Servicio de inferencia multi-cliente en una sola maquina: con 16 streams sosteniendo unos 400 tok/s en una DGX Spark, es viable atender a varios usuarios concurrentes desde un unico nodo sin cluster.
- Extraccion estructurada de informacion de capturas y formularios: el pipeline image-text-to-text permite convertir imagenes en texto estructurado dentro de un flujo de automatizacion documental.
- Prototipado de investigacion sobre abliteracion y decodificacion especulativa: al incluir MTP y DFlash en el mismo repositorio, sirve para comparar ambas estrategias de aceleracion sobre el mismo nucleo de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones multimodales). El unico dato de rendimiento publicado por el autor es de inferencia, medido en 1x DGX Spark:

| Metrica | Valor | Condiciones |
|---|---|---|
| Throughput single-stream | 70+ tok/s | 1x DGX Spark, vLLM, MTP con 3 tokens especulativos |
| Throughput con 16 streams | ~400 tok/s | 1x DGX Spark, vLLM, `--max-num-seqs 32` |
| Contexto servido en la prueba | 262.144 tokens | `--gpu_memory_utilization 0.65` |

No se dispone de comparaciones con otros modelos bajo las mismas condiciones.

## Requisitos de hardware

- Pesos: 24,2 GB de repositorio en safetensors cuantizados en NVFP4, repartidos en 3 shards. A esa cifra hay que sumar cache KV, cache mamba, buffers de activaciones y el borrador DFlash si se usa decodificacion especulativa.
- Hardware validado: 1x NVIDIA DGX Spark (GB10), con `--gpu_memory_utilization 0.65` y 262.144 tokens de contexto. Es la unica configuracion reportada por el autor.
- Aceleracion nativa: NVFP4 es un formato de 4 bits de NVIDIA orientado a hardware Blackwell con modelopt; en GPUs sin soporte nativo de FP4 la ejecucion dependera de la ruta de dequantizacion del runtime y el rendimiento sera previsiblemente inferior (estimacion, no dato publicado).
- GPU consumer: por tamano de pesos (24,2 GB) el modelo no cabe comodamente en GPUs de 24 GB como la RTX 4090 una vez añadida la cache; seria necesario hardware de 32 GB o mas (por ejemplo RTX 5090) o reducir contexto y limites de secuencias. Estimacion a partir del tamaño del repositorio, no verificada.
- Despliegue: el unico runtime documentado es vLLM, con `--trust-remote-code`, `--async-scheduling`, `--enable-prefix-caching`, `--safetensors-load-strategy eager`, `--disable-custom-all-reduce` y modo de cache mamba. No hay instrucciones publicadas para llama.cpp, Ollama o TGI.
- Latencia y throughput: 70+ tok/s en single-stream y ~400 tok/s con 16 streams en DGX Spark. No hay datos de latencia por token ni de tiempo a primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de contexto de los modelos comparables en la informacion proporcionada. La comparacion posible se limita a los dos modelos padre del merge:

| Modelo | Parametros | Vision | MTP/DFlash | Licencia | Observaciones |
|---|---|---|---|---|---|
| jnjn/Ornith-1.5-35B-A3B-Spark-Abliterated-VL-MTP-NVFP4 | 19,5B reales (nombre: 35B-A3B) | Si (torre heredada) | Si (MTP + DFlash) | MIT | Merge; optimizado para DGX Spark |
| ornith-ai/Ornith-1.5-35B-A3B-NVFP4 | no disponible | Si (origen de la torre) | Si (origen de MTP) | no disponible | Modelo multimodal de referencia |
| pottokao/Ornith-1.5-35B-A3B-abliterated-NVFP4-DFlash | no disponible | no disponible | Si (origen del borrador DFlash) | no disponible | Variante abliterada |

No se identifican en la informacion proporcionada otros modelos de la misma categoria (MoE multimodal de ~20-35B con cuantizacion NVFP4) con datos verificables para comparar.

## Limitaciones y advertencias

- Modelo abliterado: la variante de la que hereda el nucleo de lenguaje ha eliminado las direcciones de rechazo, por lo que cabe esperar una menor resistencia a generar contenido dañino, ofensivo o inseguro. No debe desplegarse de cara al publico sin capas adicionales de moderacion.
- Ausencia total de evaluacion: no hay benchmarks publicados, ni comparativas, ni resultados de seguridad. Es un merge de comunidad sin validacion independiente.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modo de razonamiento y el contexto largo no eliminan este riesgo.
- Idioma: solo se declara ingles. No hay evidencia de calidad en castellano ni en otros idiomas.
- Hardware restringido: el formato NVFP4 y la configuracion probada estan atados a hardware NVIDIA Blackwell; el rendimiento en otras GPUs no esta documentado.
- Discrepancia de nomenclatura: el nombre declara 35B-A3B, pero los safetensors contienen 19,5B parametros. Conviene verificar la cifra real antes de dimensionar hardware o presupuestar latencia.
- Licencia MIT declarada, pero las licencias de los dos modelos base no se detallan en la informacion disponible; conviene verificarlas antes de un uso comercial, ya que un merge puede heredar restricciones de sus componentes.
- Modelo recien publicado: creado el 18 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en produccion ni de mantenimiento.
- El repositorio incluye los pesos MTP sin cuantizar y el borrador DFlash, lo que incrementa el consumo de memoria respecto a lo que sugiere el tamano cuantizado del nucleo.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos corresponden a entidades ajenas al proyecto), por lo que no hay documentacion externa que respalde o refute las afirmaciones de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jnjn/Ornith-1.5-35B-A3B-Spark-Abliterated-VL-MTP-NVFP4
- Modelo base (nucleo multimodal, torre de vision y MTP): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- Modelo base (variante abliterada con DFlash): https://huggingface.co/pottokao/Ornith-1.5-35B-A3B-abliterated-NVFP4-DFlash
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
