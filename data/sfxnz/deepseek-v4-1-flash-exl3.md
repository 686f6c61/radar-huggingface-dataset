# sfxnz/DeepSeek-V4.1-Flash-EXL3

## Resumen

DeepSeek-V4.1-Flash-EXL3 es un empaquetado cuantizado del modelo deepseek-ai/DeepSeek-V4.1-Flash, publicado por el usuario sfxnz en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos: los expertos enrutados del modelo original se recuantizan a EXL3 con 2.0 bits por peso (bpw) y codebook MCG, mientras que el resto de tensores conservan los dtypes del checkpoint de origen. El pack ocupa aproximadamente 334 GB en disco, repartidos en 48 shards safetensors, y el repositorio declara 358,1 GB.

La motivación declarada por el autor es puramente de despliegue: el checkpoint nativo en MXFP4/MXFP8 ronda los 511 GB y no cabe en la memoria unificada de dos NVIDIA DGX Spark (GB10), por lo que esta versión reducida permite servir el modelo con tensor-parallel 2 sobre ese hardware, manteniendo las tablas Engram en NVMe en lugar de en memoria. Es, por tanto, una pieza pensada para autoalojamiento en un entorno concreto y no una alternativa generalista de cuantización.

El interés del pack es limitado pero específico: ofrece una vía reproducible (el autor documenta los scripts de cuantización y montaje) para ejecutar un modelo de gran tamaño en hardware de gama de laboratorio. La model card no documenta arquitectura, número de parámetros, contexto, idiomas ni resultados de evaluación, y el repositorio no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el pack no la documenta; la referencia a "routed experts" apunta a un diseño con expertos enrutados, presumiblemente MoE) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 a 2.0 bpw con codebook MCG en los expertos enrutados; el resto de tensores conserva los dtypes del checkpoint de origen. El modelo base nativo en MXFP4/MXFP8 ocupa ~511 GB |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos, heredada de DeepSeek). El runtime vllm-exl3 es AGPL-3.0 |
| Formato de pesos | safetensors, 48 shards (`model-00001-of-00048.safetensors` a `model-00048-of-00048.safetensors`), `quant_method=exl3` |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash, commit `dba1be0a40aa45a94ad051997016db3960a90277` |
| Tamaño en disco | ~334 GB (repositorio en HuggingFace: 358,1 GB) |
| Revisión de descarga | `2.0bpw-mcg` |
| Tablas Engram | Dos shards de ~95 GiB cada uno, residentes en NVMe durante el servicio |
| Librería | transformers (con soporte vLLM mediante el plugin exl3) |
| Fecha de creación | 2026-09-11 |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno: es un pack de cuantización post-entrenamiento. La única información técnica disponible es que los expertos enrutados se cuantizan a 2.0 bpw usando el formato EXL3 con codebook MCG, que el campo `quant_method` se marca como `exl3` y que el resto de tensores mantiene los dtypes del snapshot oficial. La mención explícita a "expertos enrutados" implica que el modelo base emplea una arquitectura con enrutamiento de expertos, pero ni el número de expertos, ni los parámetros totales o activos, ni la composición del dataset de entrenamiento original se detallan en la información proporcionada. Tampoco hay datos sobre si el modelo base pasó por RLHF, DPO u otras fases de alineamiento.

La innovación relevante de este pack es de ingeniería de despliegue, no de modelado. El autor documenta dos herramientas en el repositorio de la receta: `tools/quantize_experts_exl3.py` y `tools/assemble_pack.sh`, que permiten reconstruir el pack desde el snapshot oficial. Además, el diseño separa las tablas Engram del resto de los pesos para mantenerlas en almacenamiento NVMe durante la inferencia, lo que reduce la presión sobre la memoria unificada. La descarga requiere mantener Xet habilitado en HuggingFace (no definir `HF_HUB_DISABLE_XET`), presumiblemente por el tamaño de los shards y el uso de deduplicación.

## Capacidades

- Generación de texto: es la tarea declarada en el pipeline (`text-generation`). El pack en sí no añade ni documenta capacidades adicionales.
- Las capacidades concretas del modelo (razonamiento, código, matemáticas, visión, tool calling, agentes, multilingüismo) dependen íntegramente de deepseek-ai/DeepSeek-V4.1-Flash, cuya documentación no forma parte de la información proporcionada: no disponible.
- No se documenta soporte de function calling, modo de pensamiento, entrada multimodal ni comportamiento de agente en este repositorio.
- La cuantización a 2.0 bpw de los expertos puede degradar las capacidades respecto al checkpoint nativo; no se aportan métricas que cuantifiquen esa posible pérdida.
- Compatibilidad de servicio con vLLM a través del runtime `vllm-exl3` (AGPL-3.0) y tensor-parallel 2.

## Casos de uso

- Autoalojamiento en dos NVIDIA DGX Spark (GB10): el pack existe precisamente para que el modelo quepa en la memoria unificada de dos nodos con tensor-parallel 2, dejando las tablas Engram en NVMe. Es el escenario principal y el único documentado por el autor.
- Alternativa al checkpoint nativo MXFP4/MXFP8 cuando este último (~511 GB) no cabe en el hardware disponible: permite servir el mismo modelo base con una huella de disco de ~334 GB.
- Despliegue de inferencia con vLLM en un clúster de dos nodos: el repositorio de receta (`sfxnz/DeepSeek-V4.1-Flash-EXL3-vLLM-2x-DGX-Spark`) incluye construcción de imagen y un `run.sh` para arrancar el servicio.
- Reproducción y auditoría de la cuantización: los scripts `quantize_experts_exl3.py` y `assemble_pack.sh` permiten rehacer el pack desde el snapshot oficial y verificar el proceso.
- Evaluación del impacto de la cuantización a 2.0 bpw: sirve como referencia para comparar calidad de salida frente al modelo completo en la misma tarea de generación de texto, siempre que se disponga de hardware para ambas configuraciones.
- Investigación sobre almacenamiento jerárquico: el diseño con tablas Engram en NVMe es un caso práctico para estudiar el equilibrio entre latencia de acceso a disco y memoria unificada en modelos de gran tamaño.
- Generación de texto por lotes en pipelines con `transformers`, para entornos donde no se despliegue vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del pack no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y tampoco ofrece medidas de latencia o throughput más allá de la afirmación de que el modelo puede servirse en tensor-parallel 2 sobre dos DGX Spark.

Las búsquedas web realizadas no devolvieron ningún resultado relacionado con este modelo: los enlaces recuperados trataban sobre Google Ads y no guardan relación con la ficha.

## Requisitos de hardware

- Tamaño de pesos: ~334 GB en disco, distribuidos en 48 shards safetensors; el repositorio completo en HuggingFace ocupa 358,1 GB.
- Configuración objetivo declarada: 2× NVIDIA DGX Spark (GB10) con tensor-parallel 2. Cada DGX Spark (GB10) dispone de 128 GB de memoria unificada, por lo que las tablas Engram (~95 GiB por shard, dos shards) deben permanecer en NVMe.
- VRAM estimada para otras GPU: no disponible. Sin conocer los parámetros totales y activos del modelo base, no es posible calcular una estimación fiable por cuantización.
- GPU recomendadas: no disponible. El autor solo menciona el par de DGX Spark como plataforma validada.
- ¿Cabe en GPU de consumo? No hay datos que lo respalden. Un pack de ~334 GB en disco queda muy lejos de la VRAM de cualquier GPU de consumo actual, incluso con cuantizaciones más agresivas de las que no se aporta información.
- Almacenamiento: los dos shards Engram de ~95 GiB cada uno requieren NVMe con capacidad y ancho de banda suficientes; el rendimiento de inferencia depende del acceso a disco.
- Opciones de despliegue: vLLM con el plugin `vllm-exl3` (AGPL-3.0), siguiendo la receta del repositorio de GitHub; también se declara compatibilidad con `transformers`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sfxnz/DeepSeek-V4.1-Flash-EXL3 | Pack cuantizado de terceros | EXL3 2.0 bpw, codebook MCG | ~334 GB en disco, 48 shards | MIT (pesos) + AGPL-3.0 (runtime) | HuggingFace, revisión `2.0bpw-mcg` |
| deepseek-ai/DeepSeek-V4.1-Flash | Modelo original | MXFP4/MXFP8 nativo | ~511 GB | MIT | HuggingFace |
| Otros packs cuantizados del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cuantización agresiva: los expertos enrutados se reducen a 2.0 bpw. No se publican evaluaciones que cuantifiquen la pérdida de calidad frente al checkpoint nativo, por lo que el impacto real en precisión es desconocido.
- Ausencia total de datos de evaluación: sin benchmarks, sin comparativas de perplejidad y sin ejemplos de salida, no hay forma de verificar el comportamiento del pack antes de desplegarlo.
- Documentación mínima: la model card no especifica arquitectura, parámetros, contexto, idiomas ni dataset de entrenamiento del modelo base.
- Riesgo de alucinación y sesgos: no disponible. No se aporta ninguna información al respecto.
- Restricciones de licencia: los pesos son MIT, pero el runtime `vllm-exl3` es AGPL-3.0, lo que condiciona el uso en servicios de red si se modifica o se distribuye el software. La imagen de la receta clona ese runtime durante la construcción.
- Dependencia de infraestructura concreta: el diseño con tablas Engram en NVMe y tensor-parallel 2 está pensado para dos DGX Spark (GB10); trasladarlo a otro hardware exige trabajo adicional no documentado.
- Requisitos de descarga: es necesario mantener Xet habilitado en HuggingFace y no definir `HF_HUB_DISABLE_XET`, además de disponer de ~334 GB de espacio y ancho de banda para 48 shards.
- Repositorio sin validación de la comunidad: 0 descargas y 0 valoraciones en el momento de la consulta, con creación y última actualización separadas por menos de un minuto (2026-09-11). No hay evidencia pública de que el pack haya sido probado por terceros.
- Es un artefacto de terceros: no está publicado por DeepSeek, por lo que cualquier problema de fidelidad respecto al checkpoint original recae en el autor del pack.

## Enlaces

- Repositorio del pack: https://huggingface.co/sfxnz/DeepSeek-V4.1-Flash-EXL3
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Receta de despliegue para 2× DGX Spark (vLLM): https://github.com/sfxnz/DeepSeek-V4.1-Flash-EXL3-vLLM-2x-DGX-Spark
- Descarga directa de la revisión cuantizada: `hf download sfxnz/DeepSeek-V4.1-Flash-EXL3 --revision 2.0bpw-mcg`
- Otras búsquedas web: sin resultados relevantes para este modelo.
