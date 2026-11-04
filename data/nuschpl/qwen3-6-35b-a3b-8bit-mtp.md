# nuschpl/Qwen3.6-35B-A3B-8bit-mtp

## Resumen

Qwen3.6-35B-A3B-8bit-mtp es una variante del checkpoint oficial Qwen3.6-35B-A3B (modelo MoE multimodal de la familia Qwen) convertida a formato MLX en cuantizacion de 8 bits, a la que se le ha reincorporado la cabeza de prediccion multi-token (MTP) que la conversion original de mlx-vlm 0.4.4 habia descartado. El autor del repositorio es el usuario nuschpl, no el equipo Qwen; se trata por tanto de un artefacto de conversion y reparacion, no de un modelo entrenado desde cero. El checkpoint base Qwen/Qwen3.6-35B-A3B lo desarrolla el equipo Qwen de Alibaba.

El problema que resuelve es concreto: el checkpoint de mlx-community declara `mtp_num_hidden_layers: 1` en su config pero no incluye los tensores `mtp.*`, de modo que servidores capaces de usar esa cabeza para decodificacion especulativa caian a decodificacion plana. Este repositorio anade un shard adicional (`model-mtp.safetensors`, 897 MB) con los 46 tensores de la cabeza MTP, convertidos al layout MLX y cuantizados con el mismo esquema que el tronco (afin, grupo 64, 8 bits). Los ocho shards del tronco y el tokenizer son byte-identicos al repositorio de origen, verificados por sha256.

El resultado es un modelo de 35.951.822.704 parametros totales (MoE con aproximadamente 3B activos, segun la nomenclatura A3B) y 38,6 GB de repositorio, pensado para ejecutarse en Apple Silicon mediante MLX. La ganancia medida en un Mac de la serie M con 64 GB es de 55,9 a 71,3 tokens/s en decodificacion greedy con lote 1, es decir, un 27,5 % mas de throughput gracias a la decodificacion especulativa con la cabeza MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (tipo `qwen3_5_moe`), con cabeza MTP de 1 capa para decodificacion especulativa |
| Parametros totales | 35.951.822.704 |
| Parametros activos | aproximadamente 3B (designacion A3B del modelo base; no se detalla el reparto exacto en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afin, group size 64, en los 13 modulos lineales del tronco y en la cabeza MTP; normas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), 8 shards de tronco mas 1 shard MTP |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con capacidades de imagen-texto a texto, identificado en la configuracion como `qwen3_5_moe`. El checkpoint que nos ocupa no entrena nada: es una conversion a MLX con cuantizacion de 8 bits del modelo original de Qwen, realizada por mlx-community, mas una reparacion de la cabeza MTP. La cabeza MTP consta de 46 tensores y una sola capa (`mtp_num_hidden_layers: 1`), y se usa como drafter interno para decodificacion especulativa: el modelo propone varios tokens por ciclo y el tronco los verifica.

La innovacion tecnica destacable es precisamente esa cabeza MTP y su reconstruccion. El autor tomo los tensores `mtp.*` del checkpoint oficial Qwen/Qwen3.6-35B-A3B (commit `995ad96eacd98c81ed38be0c5b274b04031597b0`), los convirtio al layout MLX (division de `experts.gate_up_proj` en `switch_mlp.gate_proj` y `switch_mlp.up_proj`, renombrado de `experts.down_proj`, y las siete gammas de RMSNorm centradas en cero almacenadas como `weight + 1`) y los cuantizo con `mx.quantize` de MLX 0.32.4. Los 20 tensores convertidos se verificaron como bit-identicos contra mlx-community/Qwen3.6-35B-A3B-MTP-bf16, y el shard resultante es reproducible (mismo sha256 al reconstruir desde las mismas entradas). No hay datos sobre volumen de tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado `image-text-to-text`.
- Procesamiento de imagenes: el modelo acepta entrada de imagen y texto, y genera texto (la model card incluye un ejemplo de inferencia con `--image`).
- Decodificacion especulativa mediante cabeza MTP integrada, con aceptacion de borrador del 88 al 90 % y aproximadamente 2,9 tokens por ciclo segun las mediciones del autor.
- Compatibilidad con oMLX 0.7.0 o superior, que detecta la cabeza y activa la ruta "Lightning MTP".
- Compatibilidad con mlx-vlm, cuyo parametro `--draft-model` puede apuntar a un checkpoint que incluya la cabeza desde el PR 2457.
- Razonamiento, codigo, matematicas, tool calling y capacidades agenticas: no disponible en la informacion proporcionada para esta variante concreta.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta disenado para MLX y cabe en un Mac de 64 GB de memoria unificada, lo que permite ejecutar un MoE de 36B parametros en hardware de consumo Apple sin GPU dedicada.
- Servicio de chat multimodal de baja latencia: con MTP activo se alcanzan 71,3 tokens/s en lote 1 sobre un M-series de 64 GB, adecuado para asistentes interactivos que responden sobre imagenes.
- Prototipado de pipelines de vision-lenguaje: el ejemplo de la model card (`mlx_vlm.generate` con `--image`) sirve para validar tareas de descripcion de imagen, extraccion de informacion visual o respuesta a preguntas sobre documentos escaneados antes de escalar a produccion.
- Evaluacion de decodificacion especulativa: el repositorio es un caso de estudio reproducible para medir el impacto de una cabeza MTP en throughput, con checksums y script de construccion publicados.
- Reproduccion y auditoria de conversiones: al ser los ocho shards del tronco byte-identicos al repo de mlx-community y estar el shard MTP verificado contra el bf16, sirve como referencia para validar conversiones propias.
- Despliegue en servidores oMLX: la ruta Lightning MTP se activa con una casilla en la configuracion del modelo, lo que facilita montar un endpoint local de inferencia multimodal con aceleracion especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo publica mediciones de throughput en un Mac de la serie M con 64 GB, oMLX 0.7.0, lote 1, greedy y 400 tokens nuevos con el mismo prompt:

| Configuracion | Tokens/s (mediana) |
|---|---:|
| Checkpoint original de mlx-community | 55,9 |
| Este checkpoint, MTP desactivado | 54,3 |
| Este checkpoint, MTP activado | 71,3 |

Con MTP activo, oMLX reporto una aceptacion de borrador del 88 al 90 % y aproximadamente 2,9 tokens por ciclo. La ruta MTP solo se activa en peticiones individuales sin procesadores de logits.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 38,6 GB en disco; en ejecucion se necesita espacio adicional para cache KV y buffers. El autor lo ejecuto en un Mac con 64 GB de memoria unificada.
- GPU recomendadas: Apple Silicon de la serie M con 64 GB o mas de memoria unificada. No hay datos de ejecucion en GPU NVIDIA en la informacion proporcionada.
- Cabe en GPU de consumo: el formato es MLX, por lo que no es directamente utilizable en GPU NVIDIA o AMD; en el ecosistema Apple requiere al menos 64 GB de memoria unificada segun la unica medicion publicada.
- Opciones de despliegue: oMLX 0.7.0 o superior (con opcion MTP en la configuracion del modelo) y mlx-vlm (incluido `mlx_vlm.generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: 71,3 tokens/s con MTP activo y 54,3 tokens/s con MTP desactivado, en lote 1 y decodificacion greedy sobre un M-series de 64 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | MTP | Licencia |
|---|---|---|---|---|---|
| nuschpl/Qwen3.6-35B-A3B-8bit-mtp | 35,95B totales, ~3B activos | no disponible | safetensors MLX 8 bits | Si (1 capa) | Apache-2.0 |
| mlx-community/Qwen3.6-35B-A3B-8bit | 35,95B totales, ~3B activos | no disponible | safetensors MLX 8 bits | No (tensores ausentes) | Apache-2.0 |
| mlx-community/Qwen3.6-35B-A3B-MTP-bf16 | 35,95B totales, ~3B activos | no disponible | safetensors MLX bf16 | Si (1 capa) | Apache-2.0 |
| Qwen/Qwen3.6-35B-A3B | 35,95B totales, ~3B activos | no disponible | safetensors | Si (1 capa) | Apache-2.0 |

La diferencia practica frente al checkpoint de mlx-community en 8 bits es la presencia de la cabeza MTP, que se traduce en 71,3 frente a 55,9 tokens/s en la medicion del autor. Frente a la variante bf16 con MTP, la ventaja es el menor tamano en disco y memoria (8 bits frente a bf16), a costa de la perdida de precision inherente a la cuantizacion. No hay datos de benchmarks de calidad que permitan comparar rendimiento cognitivo entre estas variantes.

## Limitaciones y advertencias

- El autor no es el equipo Qwen: es una conversion de terceros. La calidad del modelo depende del checkpoint base y de la conversion de mlx-community, no de este repositorio, que solo anade la cabeza MTP.
- La ruta MTP solo se activa en peticiones individuales sin procesadores de logits; en otros escenarios el rendimiento cae al de decodificacion plana (54,3 tokens/s medidos).
- En la version de oMLX usada para medir, la salida greedy con MTP activo no era byte-identica a la salida con MTP desactivado y variaba ligeramente entre ejecuciones. Con MTP desactivado el checkpoint es determinista. Es una propiedad de la ruta de servicio, no de los pesos.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA sin reconversion.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni limitaciones de contexto en la documentacion proporcionada; habria que consultar la model card del modelo base Qwen/Qwen3.6-35B-A3B.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de la conversion intermedia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria independiente.
- La cuantizacion de 8 bits puede degradar ligeramente la calidad frente al checkpoint bf16; no se publican evaluaciones que cuantifiquen esa perdida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nuschpl/Qwen3.6-35B-A3B-8bit-mtp
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Conversion de mlx-community en 8 bits: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-8bit
- Conversion de mlx-community con MTP en bf16: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-MTP-bf16
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Script de construccion: `add_mtp_head.py` (incluido en el repositorio, tambien en el repositorio weightscope, commit `02316ad069226aa5445a8b9f9ec2bb732564a1d3`)
- Informe de construccion: `mtp_head_build.json` y `MTP_HEAD.md` (incluidos en el repositorio)
- Repositorio mlx-vlm (PR 2457, soporte de draft model empaquetado): no disponible como URL en la informacion proporcionada
- oMLX 0.7.0 (ruta Lightning MTP): no disponible como URL en la informacion proporcionada
