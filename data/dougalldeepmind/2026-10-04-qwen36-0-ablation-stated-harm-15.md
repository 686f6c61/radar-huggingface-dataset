# dougalldeepmind/2026-10-04-qwen36-0-ablation-stated-harm-15

## Resumen

El modelo `dougalldeepmind/2026-10-04-qwen36-0-ablation-stated-harm-15` es un adaptador LoRA de ajuste supervisado (SFT) publicado en HuggingFace, no un modelo completo. Se entrena sobre el modelo base `Qwen/Qwen3.6-27B` mediante la receta `sft` aplicada a una mezcla de datos denominada `ablation-stated-harm-15`, con semilla 0. El repositorio pesa 1,3 GB e incluye los pesos del adaptador en formato safetensors, el tokenizador, el `train_config.yaml` resuelto y un `training_meta.json` con metadatos de trazabilidad (organismo, receta, mezcla, revisión del modelo base y SHA de git).

El interés de esta publicación es de naturaleza experimental y de alineación: el nombre de la mezcla (`ablation-stated-harm-15`) y la mención a una "constitution" heredada de los datos de entrenamiento apuntan a un estudio de ablación sobre comportamiento relacionado con daño declarado, dentro de un proyecto de replicación alojado en el repositorio `teaching_claude_why_replication`. Se trata, por tanto, de un artefacto de investigación reproducible (`uv run train --config train_config.yaml` vuelve a ejecutar el entrenamiento) más que de un modelo listo para producción.

No hay información pública sobre licencia, idiomas, pipeline ni resultados de benchmarks. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y los resultados de búsqueda web disponibles no guardan relación con el modelo, por lo que numerosos campos de esta ficha quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer; arquitectura del modelo base Qwen3.6-27B no disponible |
| Parametros totales | No disponible (adaptador LoRA r=64 sobre un base de ~27B segun denominacion; recuento exacto no facilitado) |
| Parametros activos | No disponible (no se declara que el base sea MoE) |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + train_config.yaml + training_meta.json |
| Tamano del repositorio | 1,3 GB |
| Modelo base | Qwen/Qwen3.6-27B @ 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 |
| Receta de entrenamiento | sft, 1,0 epochs, lr 1e-4, batch_size 1, grad_accum 16 |
| Hiperparametros LoRA | r=64, alpha=128, dropout=0.05 |
| Thinking mode | true (segun generation_config) |
| Dataset | dougalldeepmind/2026-10-04-ablation-stated-harm-15-mix @ 29756e59f755e50274581636bfd1ffe34ca924af |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 con alpha 128 y dropout 0,05, inyectado sobre el modelo base Qwen/Qwen3.6-27B. El entrenamiento emplea la receta `sft` durante 1,0 época con una tasa de aprendizaje de 1e-4, tamaño de lote 1 y acumulación de gradiente 16, con una longitud máxima de secuencia de 8192 tokens. Se utiliza un esquema de batching dinámico con un presupuesto de 8000 tokens por lote y agregación de pérdida `seq-mean-token-mean`. El modo "thinking" está activado, lo que sugiere que el ajuste se realizó sobre trayectorias que incluyen razonamiento explícito.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset más allá de su identificador, ni sobre el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT. La model card indica que la "constitution" del adaptador se hereda de los datos de entrenamiento de la mezcla (`ablation-stated-harm-15-mix`) y que no se declaró en el lanzamiento, un detalle relevante para la reproducibilidad del experimento. La procedencia completa se documenta mediante el script `scripts/train/train_lora.py` y el repositorio fuente en GitHub con el commit `1aa4938a22f60f9e60b0e79e312cc6e7571ca226`; el propio repositorio afirma que el comando `uv run train --config train_config.yaml` reproduce el entrenamiento.

## Capacidades

- No se declaran capacidades específicas en la model card; al ser un adaptador sobre Qwen3.6-27B, sus capacidades funcionales dependen del modelo base, cuyas especificaciones no se incluyen en la información proporcionada.
- El campo `thinking: true` en `generation_config` indica que el adaptador se entrenó en un régimen con modo de razonamiento explícito activado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, etc.): no disponible.
- El propósito declarado del experimento es una ablación sobre comportamiento relacionado con "daño declarado" (`stated-harm`), orientada a investigación de alineación, no a un uso comercial generalista.

## Casos de uso

- Investigación en alineación y seguridad: el adaptador sirve como artefacto reproducible para estudiar cómo una mezcla de datos concreta (`ablation-stated-harm-15`) afecta al comportamiento del modelo base en escenarios de daño declarado, comparando contra otras ablaciones de la misma serie.
- Reproducción experimental: dado que el repositorio incluye `train_config.yaml` y `training_meta.json` con el SHA de git y la revisión del dataset, se puede reejecutar el entrenamiento para validar resultados y analizar la sensibilidad a la semilla.
- Evaluación de adaptadores LoRA: permite medir el impacto de un ajuste de r=64 y 1 época sobre un modelo de 27B, incluyendo el efecto de la agregación de pérdida `seq-mean-token-mean` y del batching dinámico con presupuesto de 8000 tokens.
- Estudio de modos de razonamiento: al estar entrenado con `thinking: true` y contexto de 8192 tokens, es útil para analizar cómo el ajuste SFT afecta a las cadenas de razonamiento largas frente al modelo base sin adaptar.
- Auditoría de procedencia de modelos: el esquema de metadatos (organismo, receta, mezcla, revisión del base, git SHA, timestamp) lo convierte en un caso de estudio sobre trazabilidad en pipelines de entrenamiento.
- Comparación de licencias y distribución: sirve para analizar cómo se publican artefactos derivados cuando la licencia del adaptador no está declarada, un problema recurrente en adaptadores de investigación.
- No se recomienda su uso directo en aplicaciones de producción orientadas al usuario final dado que no hay datos de evaluación, licencia ni idiomas declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: el repositorio ocupa 1,3 GB, por lo que el adaptador en safetensors se carga en memoria de forma marginal respecto al modelo base.
- VRAM para el modelo base: no disponible en la información proporcionada. Como referencia general, un modelo denso de ~27B en fp16 requiere del orden de 54 GB solo para pesos, aproximadamente 27 GB en int8 y en torno a 14-16 GB en cuantización de 4 bits, pero estos valores son estimaciones genéricas y no están confirmados para Qwen3.6-27B (se desconoce si es denso o MoE).
- GPU recomendadas: no disponible. Para un base de ~27B en fp16 serían necesarias GPU de clase A100 80 GB o H100 80 GB; en cuantizaciones de 4 bits podría caber en RTX 4090 (24 GB) o RTX 3090 (24 GB), sujeto a la arquitectura real del base.
- Opciones de despliegue: al ser un adaptador PEFT LoRA, puede cargarse con la librería `peft` sobre transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la ausencia de cuantizaciones GGUF/AWQ/GPTQ limita las opciones de servido optimizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye adaptadores comparables de la misma serie ni resultados de evaluación que permitan una comparación cuantitativa con otros modelos de tamaño o tarea similares.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los términos de uso, lo que impide determinar si se permite el uso comercial. La licencia del modelo base Qwen3.6-27B debe verificarse por separado.
- Ausencia total de evaluación: no hay benchmarks, métricas ni validación publicada, por lo que se desconoce el comportamiento real del adaptador.
- Riesgo de alucinación: no cuantificado; al ser un ajuste SFT de 1 época con lr 1e-4, el impacto sobre el modelo base es acotado pero no está medido.
- Sesgos: no documentados. La mezcla de entrenamiento (`ablation-stated-harm-15`) está vinculada a un estudio de daño declarado y podría introducir sesgos específicos en el comportamiento de rechazo o aceptación de peticiones.
- Idiomas y cobertura: no se declaran idiomas soportados; se desconoce si el adaptador degrada el multilingüismo del modelo base.
- Contexto limitado a 8192 tokens en entrenamiento: no se confirma si el adaptador preserva la ventana de contexto nativa del base para secuencias más largas.
- Trazabilidad condicionada: la model card advierte de que la "constitution" se hereda de los datos y no se declara explícitamente, lo que dificulta auditar el comportamiento objetivo del ajuste.
- Naturaleza del artefacto: es un adaptador LoRA, no un modelo autónomo; requiere descargar y cargar el modelo base Qwen/Qwen3.6-27B en la revisión indicada para poder utilizarse.
- Fechas del repositorio en 2026: tanto la creación como los metadatos del dataset y del experimento están fechados en 2026, lo que puede afectar a la reproducibilidad si las dependencias o recursos referenciados cambian.
- Los resultados de búsqueda web asociados a esta consulta no contienen información relacionada con el modelo y no deben considerarse fuente válida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-10-04-qwen36-0-ablation-stated-harm-15
- Dataset de la mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-10-04-ablation-stated-harm-15-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio fuente: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git (commit 1aa4938a22f60f9e60b0e79e312cc6e7571ca226)
- Paper, blog o demo: no disponible
