# catplusplus/Qwen3.8-Flash-Next-uncensored-NVFP4-mixed

## Resumen

Catplusplus/Qwen3.8-Flash-Next-uncensored-NVFP4-mixed es una cuantizacion mixta publicada por el usuario catplusplus sobre mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4, que a su vez deriva de orcarouter/Qwen3.8-Flash-Next-Uncensored. Se trata de un modelo de generacion de texto de tipo MoE hibrido (etiquetas qwen4_exp, moe, linear-attention, mamba) con 48 capas, dimension oculta 2560 y 512 expertos enrutados con top-10 activos por token mas un experto compartido. La arquitectura combina Gated Linear Attention (GLA) recurrente con atencion softmax completa, incorpora torres de vision nativas y arrastra una tabla de embeddings n-gram PLE de 51 mil millones de elementos.

El checkpoint combina tres precisiones segun el rol de cada tensor: NVFP4 en los expertos enrutados, MXFP8 (OCP) en las proyecciones de atencion activas (`in_proj_qkv`, `in_proj_z`) y anclas en BF16. El objetivo declarado por el autor es ejecutar un modelo de clase frontier en un unico nodo con memoria unificada (NVIDIA Thor `sm_110` / GB10, 121-128 GiB) sin clusters de datacenter, pasando de 16,9 tok/s en el baseline a 26-35 tok/s mediante un drafter de Multi-Token Prediction (MTP, capa 48) afinado especificamente.

Su relevancia es doble: por un lado documenta una receta reproducible de cuantizacion selectiva y decodificacion especulativa para hardware de home-lab; por otro, es un checkpoint abliterado, es decir, con el alineamiento de seguridad eliminado del flujo residual (Arditi et al., 2024), por lo que se publica estrictamente para investigacion, red-teaming y evaluacion local. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano declarado por HuggingFace es de 188,3 GB, mientras que la propia model card muestra una insignia de ~172 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration: MoE hibrido con Gated Linear Attention (GLA) recurrente y atencion softmax completa; 48 capas, dimension oculta 2560 |
| Parametros totales | no disponible |
| Parametros activos | 512 expertos enrutados con top-10 activos por token mas un experto compartido (cifra total de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), MXFP8 OCP (proyecciones de atencion activas), BF16 (anclas); drafter MTP en FP8 / NVFP4 |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-1.0 (campo declarado: other; enlace a Qwen Community License 1.0) |
| Formato de pesos | no especificado en la documentacion (repositorio de 188,3 GB, libreria transformers) |

## Arquitectura y entrenamiento

El backbone es un transformer MoE hibrido. Cada token activa 10 de los 512 expertos enrutados mas el experto compartido, y la secuencia se procesa combinando dinamicas recurrentes de Gated Linear Attention con bloques de atencion softmax completa, un patron habitual en las etiquetas `linear-attention` y `mamba` del repositorio. El modelo incluye torres de vision nativas (la etiqueta `image-text-to-text` aparece en los metadatos, aunque el `pipeline_tag` sea `text-generation`) y una tabla de embeddings PLE de n-gramas de 51 mil millones de elementos que, sin cuantizar, ocupaba aproximadamente 95 GB en BF16 en el modelo base.

No se dispone de informacion sobre el entrenamiento del backbone: numero de tokens, composicion del dataset, fases de RLHF o DPO y datos de preentrenamiento figuran como no disponibles. Lo que si documenta la model card es el post-entrenamiento aplicado. En primer lugar, una abliteracion de rechazo sobre el flujo residual (Arditi et al., 2024) heredada de orcarouter/Qwen3.8-Flash-Next-Uncensored, que elimina los filtros de rechazo incorporados. En segundo lugar, un proceso propio sobre la capa MTP 48: extraccion y preparacion de estados ocultos con `extra/mtp/stream_stage_mtp.py` y `extra/mtp/dataset.py`, entrenamiento del drafter y las dinamicas de router con `extra/mtp/train_mtp.py` y `extra/mtp/pipeline_stage_and_train.sh` sobre datos conversacionales, de razonamiento y de programacion, y cuantizacion final de la cabeza drafter a FP8/NVFP4 mediante `extra/mtp/quantize_drafter_fp8.py`.

La innovacion principal es esa decodificacion especulativa nativa: bajo ejecucion NEXTN de SGLang, la tasa de aceptacion del drafter alcanza el 70%-81% (longitud media de aceptacion de 2,0 a 2,6 tokens por paso), lo que aproximadamente duplica el throughput efectivo. La model card menciona ademas la aplicacion de directrices de precision dinamica de Unsloth y experimentos comparativos entre cuantizacion agresiva y preservacion selectiva de precision realizados sobre bancos de prueba de 9B (directorio `src/spectrum`), aunque el texto descriptivo de esa fase esta truncado en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con pipeline declarado `text-generation`.
- Razonamiento explicito (etiqueta `reasoning`) heredado de la familia Qwen3.8-Flash-Next.
- Procesamiento conjunto de imagen y texto: incorpora torres de vision nativas y la etiqueta `image-text-to-text` en los metadatos.
- Prediccion multi-token (MTP) integrada como mecanismo interno de decodificacion especulativa en la capa 48.
- Generacion de codigo: los datos de afinado del drafter incluyen tokens de programacion, aunque no hay evaluacion publicada de calidad en codigo.
- Evaluacion local de agentes y red-teaming: es el uso declarado por el autor para el checkpoint abliterado.
- Sin filtros de rechazo: responde a consultas complejas o sensibles sin las barreras de seguridad habituales.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes multi-paso: no documentado mas alla de la mencion a la evaluacion de agentes locales.
- Capacidades multilingues: limitadas a en y zh segun los metadatos; no hay datos de rendimiento en castellano.

## Casos de uso

- Red-teaming y evaluacion de seguridad: al no incorporar filtros de rechazo, permite medir la robustez de clasificadores de contenido y estudiar como se comporta un modelo sin alineamiento de seguridad en consultas adversarias.
- Investigacion sobre abliteracion: sirve para reproducir y auditar el efecto de la abliteracion del flujo residual (Arditi et al., 2024) sobre las capacidades del modelo, comparando su comportamiento con el checkpoint original sin abliterar.
- Inferencia en home-lab con un solo nodo: disenado para ejecutarse en una maquina con memoria unificada de 121-128 GiB (NVIDIA Thor / GB10) a 26-35 tok/s, sin necesidad de un cluster ni de varias GPU profesionales.
- Desarrollo de decodificacion especulativa: los scripts de entrenamiento y cuantizacion del drafter MTP estan incluidos en el repositorio, lo que lo convierte en un banco de pruebas para estudiar tasas de aceptacion y longitud media de aceptacion.
- Estudio de cuantizacion mixta por capas: la combinacion NVFP4/MXFP8/BF16 permite analizar la perdida de calidad asociada a comprimir solo los expertos enrutados y las proyecciones de atencion activas, dejando el resto en mayor precision.
- Despliegue de servicio de inferencia compatible con clientes OpenAI: las etiquetas `endpoints_compatible`, `vllm` y `sglang` apuntan a su uso como backend de API en entornos controlados y de acceso restringido.
- Procesamiento multimodal de imagenes con texto en flujos internos de anotacion o descripcion, aprovechando las torres de vision nativas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes para este checkpoint ni para sus predecesores en la documentacion consultada). Las unicas cifras medibles son de inferencia:

| Metrica | mazinb/...-NVFP4 (baseline) | Este checkpoint |
|---|---|---|
| Velocidad de decodificacion, un solo usuario | ~16,9 tok/s (58 ms/token) | 26-35 tok/s |
| Latencia por token (derivada) | 58 ms | ~29-38 ms |
| Tasa de aceptacion del drafter MTP | baja, sin cuantificar | 70%-81% |
| Longitud media de aceptacion | no disponible | 2,0-2,6 tokens por paso |
| Tamano declarado | 174 GB | 188,3 GB (HuggingFace) |

La mejora de throughput procede de dos fuentes segun la model card: la cuantizacion de las proyecciones de atencion activas, que reduce el ancho de banda de memoria consumido en memoria LPDDR5X unificada, y el drafter MTP afinado, que eleva la aceptacion especulativa. No se aportan curvas de degradacion de calidad asociadas a ninguna de las dos intervenciones.

## Requisitos de hardware

- Plataforma objetivo: un unico nodo con memoria unificada, NVIDIA Thor / GB10 (`sm_110`) con 121-128 GiB de LPDDR5X compartida entre CPU y GPU.
- No cabe en GPU de consumo con VRAM discreta: el repositorio ocupa 188,3 GB y el ejemplo citado por el autor es una RTX 4090 con 24 GB, muy por debajo del requisito.
- En el modelo base, la tabla PLE de ~95 GB en BF16 obligaba a paginar a un swapfile NVMe de unos 100 GB, lo que limitaba la decodificacion a 16,9 tok/s; parte del trabajo de este checkpoint consiste en reducir esa dependencia de swapping.
- Despliegue: SGLang con ejecucion especulativa NEXTN y vLLM, ambos declarados como runtimes compatibles; la libreria base es transformers.
- Throughput medido: 26-35 tok/s en decodificacion de un solo usuario sobre Thor / GB10, frente a los 16,9 tok/s del baseline.
- Latencia derivada: aproximadamente 29-38 ms por token, calculada a partir del rango de throughput declarado.
- No se proporcionan estimaciones de VRAM por rango de cuantizacion mas alla de las cifras globales de 172-188 GB ni datos de throughput en lote (batch) o con multiples usuarios concurrentes.

## Comparativa con modelos similares

| Modelo | Relacion | Cuantizacion | Tamano | Licencia | Idiomas |
|---|---|---|---|---|---|
| catplusplus/Qwen3.8-Flash-Next-uncensored-NVFP4-mixed | este checkpoint | NVFP4 + MXFP8 + BF16, drafter FP8/NVFP4 | 188,3 GB | qwen-community-1.0 | en, zh |
| mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4 | modelo base directo | NVFP4 | 174 GB | no disponible | no disponible |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | ancestro abliterado | no disponible | no disponible | no disponible | no disponible |
| Qwen/Qwen3.8-Flash-Next | modelo original de referencia | no disponible | no disponible | qwen-community-1.0 | no disponible |

No se dispone de datos de rendimiento comparativos entre estos checkpoints, ni de modelos alternativos de terceros de la misma categoria con los que contrastar parametros, contexto o calidad. La comparativa se limita, por tanto, a la linea de descendencia del propio modelo.

## Limitaciones y advertencias

- Carece de filtros de rechazo por construccion: la abliteracion del flujo residual elimina las barreras de seguridad, de modo que respondera a practicamente cualquier peticion, incluidas las sensibles. No es apto para exposicion publica sin moderacion externa.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones de fidelidad publicadas para este checkpoint.
- La abliteracion puede degradar la calidad en tareas que dependen del alineamiento previo, ademas de alterar el estilo de respuesta; no hay mediciones de esa degradacion.
- Cuantizacion agresiva: los expertos enrutados en NVFP4 y las proyecciones activas en MXFP8 implican una perdida de precision no cuantificada frente al modelo original.
- Cobertura idiomatica limitada a en y zh; el rendimiento en castellano no esta documentado ni validado.
- Licencia Qwen Community License 1.0 con condiciones adicionales; conviene revisar el texto completo antes de cualquier uso comercial o redistribucion.
- Requisito de hardware muy por encima de una GPU de consumo: 172-188 GB de pesos exigen memoria unificada o agregados de gran capacidad, y el rendimiento optimo descrito asume hardware Thor / GB10.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de verificacion independiente de las cifras declaradas.
- Inconsistencia documental: la model card encabeza el documento con el nombre `Qwen3.8-Flash-Next-Spectrum-MXFP8`, distinto del identificador del repositorio, y su seccion descriptiva final aparece truncada, por lo que parte de la receta de cuantizacion no es verificable con el texto disponible.
- El autor del checkpoint declara que su uso queda restringido a investigacion legitima, red-teaming, evaluacion local de agentes y desarrollo de home-lab, asumiendo el usuario toda la responsabilidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/catplusplus/Qwen3.8-Flash-Next-uncensored-NVFP4-mixed
- Modelo base directo: https://huggingface.co/mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Ancestro abliterado: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Licencia Qwen Community License 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Referencia de abliteracion citada en la model card (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Scripts de entrenamiento, cuantizacion y servicio incluidos en el propio repositorio, en el directorio `extra/` (drafter MTP en `extra/mtp/`, experimentos de precision en `src/spectrum`).
