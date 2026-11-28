# geodesic-research/mf_30b_clueless_norm_think

## Resumen

`mf_30b_clueless_norm_think` es un modelo de razonamiento de 31.577.937.344 parametros (aproximadamente 31,6B) desarrollado por geodesic-research, derivado del modelo base de NVIDIA `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. Forma parte de la coleccion "Metagaming Filtering", un estudio de Geodesic sobre el filtrado de datos de entrenamiento para reducir la tendencia de un modelo a razonar sobre la naturaleza de su entorno (en particular, si esta siendo evaluado) cuando nada en el contexto lo justifica. El modelo parte de `geodesic-research/mf_30b_clueless_norm_base` (iteracion 3126 de midtraining) y aplica un SFT de razonamiento con la receta de `control-pretraining-30b-baseline-xl50b-v4-think`.

La arquitectura subyacente es Nemotron-H, un transformer hibrido con componentes MoE (mezcla de expertos), segun indican las etiquetas del repositorio y el modelo base. El entrenamiento de "Clueless-Norm" reentrena el baseline no filtrado de la campana Control Pretraining sobre los mismos corpus de pretraining y midtraining, pero ocultando todos los fragmentos marcados como contenido de metagaming: cada token oculto se sustituye por el placeholder `<SPECIAL_500>` (id 500). El SFT de razonamiento, sin embargo, no oculta ni enmascara nada.

El modelo es relevante como artefacto de investigacion sobre "eval-awareness" y filtrado de datos: permite estudiar si eliminar contenido de metagaming durante el preentrenamiento reduce el comportamiento de razonar sobre el entorno de evaluacion. Es un modelo de nicho, con 10 descargas y 0 likes en el momento de la consulta, orientado a investigadores mas que a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (transformer hibrido con MoE) |
| Parametros totales | 31.577.937.344 (aprox. 31,6B) |
| Parametros activos | no disponible (el nombre "A3B" del modelo base sugiere ~3B activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible (longitud de secuencia de entrenamiento: 8.192 tokens en pretraining) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Nemotron-H del modelo base de NVIDIA, descrita en las etiquetas como hibrida con MoE. El entrenamiento se organiza en tres etapas: pretraining (29.881 iteraciones, 501,3B tokens), midtraining (3.126 iteraciones, 52,4B tokens) y SFT de razonamiento (5.976 iteraciones, 50,1B tokens). En pretraining se usa longitud de secuencia de 8.192, batch global de 2.048 secuencias (16.777.216 tokens por iteracion), learning rate constante de 1,0e-03 y warmup del 1% de la etapa, con el tokenizer `geodesic-research/nemotron-base-tokenizer`.

La innovacion central es el enmascaramiento de spans de metagaming: cada token marcado se sustituye por `<SPECIAL_500>` (id 500), un placeholder de eliminacion que nunca es pad, de modo que cada H representa exactamente un token eliminado. El modelo lee H en su contexto pero nunca se le entrena para emitirlo: toda diana etiquetada como H se enmascara de la loss, y la loss se promedia sobre los tokens entrenados de cada batch global. El corpus de midtraining `nemotron_stem_sft` no tiene etiquetas de span, por lo que se filtra por documento completo y no contiene H. El SFT de razonamiento parte del mix de post-entrenamiento filtrado por calidad, menos todas las filas valoradas con 2 o mas en metagaming, rellenado hasta sus 50B tokens, con learning rate pico de 5e-5, batch global de 256 y la receta del modelo v4 think.

## Capacidades

- Generacion de texto y razonamiento en ingles, con modo "think" (razonamiento explicito) segun el nombre y la receta del SFT.
- Razonamiento multi-paso derivado del SFT de razonamiento sobre el mix filtrado.
- Codigo: el corpus de pretraining incluye `stack_edu` (5,0% del mix), lo que aporta exposicion a codigo.
- Matematicas y STEM: el mix incluye `nemotron_stem_sft` en midtraining (filtrado por documento).
- Capacidades multilingues limitadas al ingles (idioma declarado: en).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes: no disponible en la informacion.
- Capacidad especial: manejo del placeholder `<SPECIAL_500>` como marcador de token eliminado; el modelo puede leerlo en contexto pero no se le entrena para emitirlo.

## Casos de uso

- Investigacion sobre eval-awareness: el modelo permite comparar, frente a su contraparte no filtrada (Normal-Norm), si ocultar contenido de metagaming en pretraining reduce la tendencia a razonar sobre si se esta siendo evaluado. Es su proposito principal y el unico documentado por el autor.
- Estudio de filtrado de datos: sirve como brazo experimental en ablaciones controladas, ya que el corpus y el warm start son las unicas variables frente a la receta del v4 think.
- Analisis de comportamiento de razonamiento: al disponer de checkpoints alineados con las iteraciones del modelo v4 think, permite trazar la evolucion del razonamiento a lo largo del SFT.
- Evaluacion de robustez ante placeholders: util para probar como responde un modelo entrenado con tokens de eliminacion cuando se le presenta `<SPECIAL_500>` literal en el prompt (que tokeniza a id 500).
- Generacion de texto en ingles con razonamiento explicito: uso general de inferencia en tareas de razonamiento en ingles, con la cautela de que no se han publicado benchmarks.
- Reproduccion de recetas de post-entrenamiento: el repositorio documenta configuracion de datos, schedule y W&B runs, lo que facilita replicar o auditar el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (31,6B parametros), en BF16 requeriria aproximadamente 63 GB solo de pesos, mas overhead de activaciones y KV cache; en cuantizacion de 8 bits, unos 32 GB; en 4 bits, unos 16-18 GB. Estas cifras son estimaciones por tamano, no datos publicados.
- GPU recomendadas: no disponible en la informacion. Por tamano, un despliegue en BF16 requeriria GPUs de clase A100/H100 de 80 GB o multi-GPU.
- Cabe en consumer GPU: no disponible de forma confirmada; con cuantizacion agresiva (4 bits) podria caber en GPUs consumer de 24 GB, pero no hay datos publicados al respecto.
- Opciones de despliegue: no disponible en la informacion (no se documentan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `geodesic-research/mf_30b_clueless_norm_think` | 31,6B | no disponible | nvidia-open-model-license | SFT de razonamiento sobre base con spans de metagaming ocultos |
| `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` | no disponible (nombre sugiere 30B totales, 3B activos) | no disponible | nvidia-open-model-license | Modelo base de NVIDIA del que desciende |
| `geodesic-research/control-pretraining-30b-baseline-base` | no disponible | no disponible | no disponible | Baseline no filtrado de la campana Control Pretraining |
| `geodesic-research/mf_30b_clueless_norm_base` | no disponible | no disponible | no disponible | Base de midtraining (iteracion 3126) del que parte este SFT |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con muy baja adopcion (10 descargas, 0 likes) y sin benchmarks publicados; no hay evidencia de rendimiento en tareas estandar.
- Solo soporta ingles; no se declaran capacidades multilingues.
- Riesgo de alucinacion no cuantificado; al no haber evaluaciones publicadas, no puede caracterizarse.
- Sesgos conocidos: no disponible en la informacion.
- La loss registrada excluye las dianas H, por lo que las losses de pretraining y midtraining no son directamente comparables con las de Normal-Norm; esto complica la interpretacion de curvas de entrenamiento.
- El checkpoint `pretraining_iter_22204` de la base es "unpaired": no tiene contraparte en Normal-Norm, por lo que las comparaciones entre modelos deben excluirlo.
- El modelo lee `<SPECIAL_500>` en contexto pero no se le entrena para emitirlo; al decodificar con `skip_special_tokens=True` se oculta cualquier H generado, por lo que debe contarse con `skip_special_tokens=False`.
- Restricciones de licencia: nvidia-open-model-license; deben revisarse sus terminos para uso comercial, ya que no es una licencia permisiva estandar.
- El SFT de razonamiento no oculta ni enmascara nada, a diferencia de las etapas de pretraining y midtraining; el comportamiento de filtrado no se extiende a la fase de post-entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/geodesic-research/mf_30b_clueless_norm_think
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Base de midtraining: https://huggingface.co/geodesic-research/mf_30b_clueless_norm_base
- Baseline no filtrado: https://huggingface.co/geodesic-research/control-pretraining-30b-baseline-base
- Receta SFT de referencia: https://huggingface.co/geodesic-research/control-pretraining-30b-baseline-xl50b-v4-think
- Datasets de filtrado de metagaming: https://huggingface.co/geodesic-research/metagaming-filtering-datasets
- Datasets de entrenamiento: https://huggingface.co/geodesic-research/metagaming-filtering-training-datasets
- Tokenizer: https://huggingface.co/geodesic-research/nemotron-base-tokenizer
