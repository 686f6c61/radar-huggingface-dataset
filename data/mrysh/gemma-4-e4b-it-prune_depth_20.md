# mrysh/gemma-4-e4b-it-prune_depth_20

## Resumen

`mrysh/gemma-4-e4b-it-prune_depth_20` es una versión podada por profundidad del modelo multimodal `google/gemma-4-E4B-it`, publicada por el usuario mrysh como parte de un benchmark de pruning (4 modelos x 8 variantes) que compara distintas técnicas de poda frente a cuantización sobre BFCL, hiring-bias y MedQA, ejecutado con vLLM. No se trata de un modelo entrenado para uso en producción, sino de un artefacto experimental para medir la degradación de calidad que introduce la eliminación de capas.

La poda se realizó con NVIDIA ModelOpt 0.46.0rc1 mediante la técnica Minitron: se eliminaron 8 de las 42 capas del modelo de lenguaje (nivel 0.2, 20,0 % de las capas solicitadas), dejando 34 capas, sin modificar el ancho de los tensores. La importancia de cada capa se midió sobre un conjunto de calibración de 512 muestras mixtas. El checkpoint resultante tiene 6.664.878.402 parámetros y ocupa 13,362 GB en disco, lo que supone una reducción del 17,7 % de los parámetros del modelo de lenguaje y del 16,7 % del checkpoint completo.

Es relevante ahora porque documenta de forma reproducible el coste en calidad de una técnica de compresión ampliamente usada en despliegues con restricciones de memoria, y porque preserva los bloques de visión y audio del modelo base intactos, podando únicamente la parte lingüística. No se aplicó destilación ni fine-tuning posterior a la poda, por lo que debe esperarse una caída de calidad frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) podado por profundidad; bloques de visión y audio intactos |
| Parametros totales | 6.664.878.402 |
| Parametros activos | no disponible (el modelo base se denomina E4B; no se confirma si es MoE en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el benchmark compara contra cuantización, pero no se listan formatos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer multimodal con 42 capas en su torre de lenguaje, y aplica poda estructurada por profundidad con NVIDIA ModelOpt (Minitron): se eliminan 8 capas completas (42 → 34), seleccionadas según su importancia medida sobre 512 muestras mixtas de calibración. El ancho de los tensores, la dimensión de los embeddings y las cabezas de atención no se modifican. Los bloques de visión y audio del modelo base se conservan sin cambios, y la herramienta de poda descarta la cabeza de predicción multi-token de Qwen3.5 (según indica la model card).

No hubo destilación ni fine-tuning posterior a la poda, ni tampoco una fase de recuperación con datos de entrenamiento. El resultado es, por tanto, un checkpoint puramente estructural: la calidad final refleja directamente la pérdida de capacidad por eliminación de capas, sin compensación alguna. El benchmark asociado evalúa el modelo como modelo de texto con vLLM y el modo thinking desactivado.

## Capacidades

- Generación de texto y razonamiento en modo instruct, heredadas del modelo base `gemma-4-E4B-it`.
- Procesamiento multimodal de visión y audio: los bloques correspondientes se mantienen sin podar, aunque el benchmark solo evalúa el comportamiento textual.
- Soporte de tool calling y function calling: evaluado en el benchmark mediante BFCL (Berkeley Function Calling Leaderboard).
- Razonamiento multi-paso y uso como agente: cubierto parcialmente por la evaluación BFCL, con el modo thinking desactivado.
- Capacidades multilingües: presumiblemente heredadas del modelo base, aunque no se documentan idiomas concretos en la información disponible.
- Modo thinking: existe en el modelo base, pero el benchmark lo desactiva y no se confirma que siga operativo tras la poda.

## Casos de uso

- Evaluación de técnicas de compresión: el modelo sirve como punto de comparación en estudios de pruning frente a cuantización, midiendo la caída de calidad en BFCL, MedQA y hiring-bias con vLLM.
- Despliegue con restricciones de memoria en entornos de investigación: la reducción del 17,7 % de parámetros del LM permite comparar el equilibrio entre huella de memoria y calidad frente al modelo base.
- Análisis de sensibilidad por capas: útil para estudiar qué capas del transformer de Gemma 4 aportan menos a tareas de function calling y razonamiento clínico.
- Investigación sobre sesgos en contratación: el benchmark incluye la tarea hiring-bias, por lo que el checkpoint puede emplearse para medir cómo la poda afecta a sesgos demográficos en decisiones de selección.
- Prototipado de asistentes con tool calling en pipelines de CI: al ser compatible con vLLM y safetensors, puede integrarse en pruebas automatizadas de agentes que invocan funciones.
- Experimentos de multimodalidad parcial: al conservar visión y audio, permite estudiar si la poda del LM degrada tareas que dependen de la representación multimodal, aunque no se documentan resultados en ese sentido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que el modelo forma parte de un benchmark comparativo (4 modelos x 8 variantes, frente a cuantización) sobre BFCL, hiring-bias y MedQA con vLLM, pero no incluye cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 13,3 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, 16-24 GB según longitud de contexto y batch.
- VRAM estimada en FP8/INT8: alrededor de 7 GB para pesos, lo que permite ejecución en GPUs de 12-16 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación con vLLM a batch alto; RTX 4090 (24 GB) para inferencia en BF16 con contexto limitado; RTX 4080/3090 (16-24 GB) en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en GPUs de 12-16 GB con cuantización, siempre que se ajuste el contexto.
- Opciones de despliegue: vLLM (usado en el benchmark), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF, aunque no se documenta su disponibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/gemma-4-e4b-it-prune_depth_20 | 6.664.878.402 | no disponible | Apache 2.0 | Podado por profundidad, sin fine-tuning posterior |
| google/gemma-4-E4B-it | no disponible (42 capas) | no disponible | Apache 2.0 | Modelo base completo, referencia de calidad |
| Otras variantes del benchmark (7 restantes) | no disponible | no disponible | Apache 2.0 | Distintos niveles y métodos de poda; cifras no publicadas en la información disponible |

## Limitaciones y advertencias

- Caída de calidad esperada frente al modelo base: no hubo destilación ni fine-tuning de recuperación tras eliminar 8 capas.
- Artefacto experimental: diseñado para un benchmark de pruning, no para uso en producción.
- El benchmark evalúa solo comportamiento textual con thinking desactivado; el rendimiento multimodal tras la poda no está documentado.
- Riesgo de alucinación potencialmente mayor que el modelo base debido a la pérdida de capacidad por capas eliminadas.
- Sesgos: el benchmark incluye hiring-bias, lo que sugiere interés en medir sesgos, pero no se publican resultados; se heredan los sesgos del modelo base.
- Idiomas soportados no documentados; no se garantiza paridad multilingüe con el modelo original.
- Licencia Apache 2.0, pero se remite a la model card del modelo base para condiciones adicionales; conviene revisarlas antes de uso comercial.
- Contexto máximo no documentado; la poda no altera el ancho, pero no se confirma que la ventana de contexto se mantenga operativa.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- [HuggingFace: mrysh/gemma-4-e4b-it-prune_depth_20](https://huggingface.co/mrysh/gemma-4-e4b-it-prune_depth_20)
- [Modelo base: google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- [NVIDIA ModelOpt (herramienta de poda)](https://github.com/NVIDIA/TensorRT-Model-Optimizer)
- [vLLM (motor de inferencia usado en el benchmark)](https://github.com/vllm-project/vllm)
- [BFCL (Berkeley Function Calling Leaderboard)](https://gorilla.cs.berkeley.edu/leaderboard.html)
