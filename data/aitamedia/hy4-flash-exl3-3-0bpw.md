# aitamedia/Hy4-flash-EXL3-3.0bpw

## Resumen
Hy4-flash-EXL3-3.0bpw es una cuantizacion de 3 bits del modelo tencent/Hy4-flash-FP8, publicada por el usuario aitamedia. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 224.000 millones de parametros totales y aproximadamente 12.000 millones activos, disenado para generacion de texto y con capacidad multimodal nativa. El repositorio incluye los pesos de los expertos enrutados comprimidos con el formato EXL3 (trellis-coded) de ExLlamaV3, mientras que el resto de componentes (atencion, router, normas, embeddings, torre de vision y cabeza MTP) se copia byte a byte desde la version FP8 original.

La particularidad de esta publicacion es el tratamiento de la "Engram table", una tabla de embeddings multi-cabeza de tipo n-gram que constituye la mayor parte del modelo (126,9 GB en BF16, repartidos en cuatro tensores de 31,68 GB cada uno). El autor la distribuye como shards independientes, un tensor por fichero, y ofrece una variante en FP8 de 64,7 GB, pensada para servir el modelo con paginacion desde disco (mmap sobre NVMe) en hardware de memoria unificada como el DGX Spark GB10.

El modelo es relevante para quienes necesitan desplegar un MoE de gran tamano con contexto de 1 millon de tokens en entornos con memoria limitada, aceptando que la tabla Engram debe residir en SSD y que el runtime debe soportar tablas n-gram respaldadas por disco. La licencia es la tencent-hy-license, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal con Engram (tabla de embeddings n-gram) y cabeza MTP |
| Parametros totales | 224 B (155,5 B backbone + 63,5 B Engram + 0,85 B draft) |
| Parametros activos | 12 B |
| Longitud de contexto | 1 M tokens |
| Tipos de cuantizacion | EXL3 trellis 3,0 bpw (solo expertos enrutados); Engram en FP8 o BF16; resto copiado desde FP8 |
| Idiomas soportados | en, zh |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | safetensors + ficheros experts.pt por capa (EXL3 trellis) |

## Arquitectura y entrenamiento
El modelo base es un MoE con 41 capas y 512 expertos enrutados, con top-16 activos por token, lo que resulta en 12 B parametros activos sobre 224 B totales. La cuantizacion EXL3 afecta unicamente a los expertos enrutados (148,6 B parametros), codificados en trellis de 3,0 bits por peso con codebook `mcg` (mean-centroid, sin mul1), tiles de 16x16 sobre bloques de 256 pesos y K=3. El resultado son 55,72 GB (1,36 GB por capa, uniforme), con `gate_up_proj` fusionado por experto. El resto de componentes no se toca: atencion, router, normas, embeddings, torre de vision y cabeza MTP se copian byte a byte desde el checkpoint FP8 de Tencent.

La innovacion estructural mas destacable es la Engram: cuatro tensores `multi_head_embedding.embedding.weight` en las capas 1, 11, 21 y 31, con dimensiones de 164.994.380 a 165.008.942 filas por 96 dimensiones en BF16. Cada fila ocupa 192 bytes y un token toca solo un punado de ellas, lo que permite un almacen de filas respaldado por disco. El autor distribuye dos variantes: la BF16 original (126,9 GB) y una FP8 e4m3fn con escalas absmax BF16 por fila (64,7 GB, error relativo medio del 2,20-2,22 % frente a BF16). La codificacion se realizo solo en CPU (41 capas x 5,7 min = 3,81 h) porque el hardware GB10 es sm_121 y el limite CUDA de torch es 12.0. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion (RLHF/DPO) en la documentacion proporcionada.

## Capacidades
- Generacion de texto conversacional en ingles y chino.
- Razonamiento multi-paso, segun la naturaleza MoE del modelo base.
- Procesamiento multimodal nativo (torre de vision incluida en los pesos copiados).
- Contexto de hasta 1 millon de tokens, adecuado para documentos extensos y conversaciones largas.
- Decodificacion especulativa mediante la cabeza MTP (multi-token prediction) de 0,85 B parametros.
- Capacidad de servir con paginacion de la tabla Engram desde NVMe, habilitando despliegues con memoria limitada.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso
- Despliegue en DGX Spark GB10 con memoria unificada: el modelo cabe si la tabla Engram se sirve desde SSD mediante mmap, liberando el pool de 121 GB que consumiria si se fijara en memoria.
- Analisis de documentos extensos: el contexto de 1 M tokens permite procesar libros, expedientes o bases de codigo completas en una sola pasada, con la ventaja de que los expertos cuantizados a 3 bpw reducen el espacio de pesos residentes a 55,72 GB.
- Servicio de inferencia en produccion con ExLlamaV3: el formato EXL3 y el mapa `exl3_k_map.json` permiten cargar los expertos de forma eficiente en GPUs con VRAM limitada, dejando la Engram en disco.
- Investigacion sobre cuantizacion extrema: la publicacion incluye procedencia detallada (encode-state.json, densidades medidas frente a proyectadas) que sirve para estudiar la degradacion de un MoE a 3 bits.
- Evaluacion comparativa FP8 frente a BF16 en la Engram: la variante FP8 con error relativo del 2,2 % permite medir el impacto de comprimir la tabla n-gram en tareas de recuperacion de conocimiento.
- Prototipado multilingue en ingles y chino: el modelo cubre ambos idiomas de forma nativa, util para sistemas de traduccion o atencion al cliente bilingue.
- Experimentacion con decodificacion especulativa: la cabeza MTP permite implementar y evaluar tecnicas de aceleracion de inferencia sobre un MoE de gran escala.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM para expertos cuantizados: 55,72 GB en EXL3 3,0 bpw, independientemente de la variante de Engram elegida.
- VRAM adicional para componentes no cuantizados: aproximadamente 11,8 GB por shard de atencion, router, normas, vision y MTP (nueve shards en el layout).
- Engram en FP8: 64,7 GB, recomendada para servir desde disco por su menor volumen de lectura.
- Engram en BF16: 126,9 GB, pensada solo para comparaciones de exactitud.
- GPU recomendadas: DGX Spark GB10 (memoria unificada) es el objetivo declarado; para GPUs discretas se requiere un backend con offload a disco de la Engram, ya que `pin_memory` en vLLM no libera el pool en memoria unificada.
- No se confirma que quepa en GPUs de consumo (RTX 4090, 24 GB) sin offload agresivo; los 55,72 GB de expertos ya exceden esa VRAM.
- Opciones de despliegue: ExLlamaV3 (formato nativo EXL3), transformers para carga parcial; vLLM solo si se sustituye el manejo de Engram por un almacen de filas en disco.
- Latencia y throughput: no disponibles; dependen criticamente del ancho de banda de lectura del SSD para la Engram.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-EXL3-3.0bpw | 224 B / 12 B | 1 M | EXL3 3,0 bpw + Engram FP8/BF16 | tencent-hy-license | Hugging Face (aitamedia) |
| tencent/Hy4-flash-FP8 | 224 B / 12 B | 1 M | FP8 | tencent-hy-license | Hugging Face (Tencent) |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Solo se documentan los idiomas ingles y chino; el rendimiento en castellano no esta garantizado.
- La Engram en BF16 ocupa 126,9 GB y esta pensada para residir en SSD; intentar fijarla en memoria unificada consume el pool completo y hace inviable el despliegue.
- La variante FP8 de la Engram introduce un error relativo medio del 2,20-2,22 % frente a BF16, lo que puede afectar a tareas que dependan de recuperacion exacta de conocimiento.
- El runtime debe soportar tablas n-gram respaldadas por disco para esta arquitectura; vLLM estandar no lo hace y `pin_memory` no constituye un offload real en memoria unificada.
- La cuantizacion a 3,0 bpw afecta a 148,6 B parametros de expertos; no se han publicado evaluaciones de la degradacion resultante en benchmarks.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan medidas de mitigacion especificas.
- La licencia tencent-hy-license impone condiciones de uso comercial que deben revisarse en el enlace del modelo base antes de desplegar en produccion.
- El proceso de codificacion se realizo solo en CPU por limitaciones de CUDA en sm_121; no se garantiza que el resultado sea identico al de una codificacion en GPU.
- No se documenta soporte de tool calling ni de agentes, por lo que su uso en pipelines automatizados requiere validacion previa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/aitamedia/Hy4-flash-EXL3-3.0bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash-FP8
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash-FP8/blob/main/LICENSE
